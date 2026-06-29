const { query } = require('../../config/database');

class AuditService {
  /**
   * Log an audit entry
   */
  async log({ userId, action, resource, resourceId, ipAddress, metadata = {} }) {
    try {
      await query(
        `INSERT INTO audit_logs (user_id, action, resource, resource_id, ip_address, metadata)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [userId || null, action, resource, resourceId || null, ipAddress || null, JSON.stringify(metadata)]
      );
    } catch (err) {
      // Audit failures must never crash the main flow — just log
      console.error('Audit log failed:', err.message);
    }
  }

  /**
   * Get logs for a specific user (admin)
   */
  async getLogsForUser(userId, { page = 1, limit = 50, action, resource } = {}) {
    const offset = (page - 1) * limit;
    const conditions = ['al.user_id = $1'];
    const params = [userId];

    if (action) {
      params.push(action);
      conditions.push(`al.action = $${params.length}`);
    }
    if (resource) {
      params.push(resource);
      conditions.push(`al.resource = $${params.length}`);
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    const countResult = await query(
      `SELECT COUNT(*) FROM audit_logs al ${whereClause}`,
      params
    );

    params.push(limit, offset);
    const { rows } = await query(
      `SELECT al.*, u.email as user_email, u.first_name, u.last_name
       FROM audit_logs al
       LEFT JOIN users u ON u.id = al.user_id
       ${whereClause}
       ORDER BY al.created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    return {
      logs: rows.map(this._format),
      total: parseInt(countResult.rows[0].count),
    };
  }

  /**
   * Get logs for a specific resource
   */
  async getLogsForResource(resource, resourceId, { page = 1, limit = 50 } = {}) {
    const offset = (page - 1) * limit;

    const countResult = await query(
      'SELECT COUNT(*) FROM audit_logs WHERE resource = $1 AND resource_id = $2',
      [resource, resourceId]
    );

    const { rows } = await query(
      `SELECT al.*, u.email as user_email, u.first_name, u.last_name
       FROM audit_logs al
       LEFT JOIN users u ON u.id = al.user_id
       WHERE al.resource = $1 AND al.resource_id = $2
       ORDER BY al.created_at DESC
       LIMIT $3 OFFSET $4`,
      [resource, resourceId, limit, offset]
    );

    return {
      logs: rows.map(this._format),
      total: parseInt(countResult.rows[0].count),
    };
  }

  /**
   * List all audit logs — admin only
   */
  async listLogs({ page = 1, limit = 50, action, resource, userId, startDate, endDate } = {}) {
    const offset = (page - 1) * limit;
    const conditions = [];
    const params = [];

    if (action) {
      params.push(action);
      conditions.push(`al.action = $${params.length}`);
    }
    if (resource) {
      params.push(resource);
      conditions.push(`al.resource = $${params.length}`);
    }
    if (userId) {
      params.push(userId);
      conditions.push(`al.user_id = $${params.length}`);
    }
    if (startDate) {
      params.push(startDate);
      conditions.push(`al.created_at >= $${params.length}`);
    }
    if (endDate) {
      params.push(endDate);
      conditions.push(`al.created_at <= $${params.length}`);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await query(
      `SELECT COUNT(*) FROM audit_logs al ${whereClause}`,
      params
    );

    params.push(limit, offset);
    const { rows } = await query(
      `SELECT al.*, u.email as user_email, u.first_name, u.last_name
       FROM audit_logs al
       LEFT JOIN users u ON u.id = al.user_id
       ${whereClause}
       ORDER BY al.created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    return {
      logs: rows.map(this._format),
      total: parseInt(countResult.rows[0].count),
    };
  }

  _format(row) {
    return {
      id: row.id,
      userId: row.user_id,
      userEmail: row.user_email,
      userFullName: row.first_name && row.last_name
        ? `${row.first_name} ${row.last_name}`
        : null,
      action: row.action,
      resource: row.resource,
      resourceId: row.resource_id,
      ipAddress: row.ip_address,
      metadata: row.metadata,
      createdAt: row.created_at,
    };
  }
}

module.exports = new AuditService();
