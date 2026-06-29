const { query } = require('../../config/database');

class RolesService {
  /**
   * Create a new role
   */
  async createRole({ name, description, isSystemRole = false }) {
    const { rows: existing } = await query(
      'SELECT id FROM roles WHERE name = $1',
      [name.toLowerCase()]
    );
    if (existing.length > 0) {
      const err = new Error('Role with this name already exists');
      err.statusCode = 409;
      err.isOperational = true;
      throw err;
    }

    const { rows } = await query(
      `INSERT INTO roles (name, description, is_system_role)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [name.toLowerCase(), description, isSystemRole]
    );
    return this._format(rows[0]);
  }

  /**
   * Find role by ID
   */
  async findById(id) {
    const { rows } = await query('SELECT * FROM roles WHERE id = $1', [id]);
    if (rows.length === 0) {
      const err = new Error('Role not found');
      err.statusCode = 404;
      err.isOperational = true;
      throw err;
    }
    return this._format(rows[0]);
  }

  /**
   * List all roles
   */
  async listRoles({ page = 1, limit = 50 } = {}) {
    const offset = (page - 1) * limit;
    const countResult = await query('SELECT COUNT(*) FROM roles');
    const { rows } = await query(
      'SELECT * FROM roles ORDER BY name ASC LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    return {
      roles: rows.map(this._format),
      total: parseInt(countResult.rows[0].count),
    };
  }

  /**
   * Update role
   */
  async updateRole(id, { name, description }) {
    const role = await this.findById(id);

    if (name && name !== role.name) {
      const { rows: dup } = await query(
        'SELECT id FROM roles WHERE name = $1 AND id != $2',
        [name.toLowerCase(), id]
      );
      if (dup.length > 0) {
        const err = new Error('Role name already in use');
        err.statusCode = 409;
        err.isOperational = true;
        throw err;
      }
    }

    const updates = [];
    const params = [];

    if (name !== undefined) {
      params.push(name.toLowerCase());
      updates.push(`name = $${params.length}`);
    }
    if (description !== undefined) {
      params.push(description);
      updates.push(`description = $${params.length}`);
    }

    if (updates.length === 0) {
      const err = new Error('No fields to update');
      err.statusCode = 400;
      err.isOperational = true;
      throw err;
    }

    params.push(id);
    const { rows } = await query(
      `UPDATE roles SET ${updates.join(', ')} WHERE id = $${params.length} RETURNING *`,
      params
    );
    return this._format(rows[0]);
  }

  /**
   * Delete role — blocked if is_system_role = true
   */
  async deleteRole(id) {
    const role = await this.findById(id);

    if (role.isSystemRole) {
      const err = new Error('System roles cannot be deleted');
      err.statusCode = 400;
      err.isOperational = true;
      throw err;
    }

    // Check if role is assigned to any user
    const { rows: assigned } = await query(
      'SELECT id FROM user_roles WHERE role_id = $1 LIMIT 1',
      [id]
    );
    if (assigned.length > 0) {
      const err = new Error('Cannot delete role that is currently assigned to users');
      err.statusCode = 400;
      err.isOperational = true;
      throw err;
    }

    await query('DELETE FROM roles WHERE id = $1', [id]);
  }

  /**
   * Assign role to user
   */
  async assignRoleToUser(userId, roleId, assignedBy) {
    // Validate user exists
    const { rows: userRows } = await query(
      'SELECT id FROM users WHERE id = $1',
      [userId]
    );
    if (userRows.length === 0) {
      const err = new Error('User not found');
      err.statusCode = 404;
      err.isOperational = true;
      throw err;
    }

    // Validate role exists
    await this.findById(roleId);

    // Check not already assigned
    const { rows: existing } = await query(
      'SELECT id FROM user_roles WHERE user_id = $1 AND role_id = $2',
      [userId, roleId]
    );
    if (existing.length > 0) {
      const err = new Error('Role already assigned to this user');
      err.statusCode = 409;
      err.isOperational = true;
      throw err;
    }

    await query(
      `INSERT INTO user_roles (user_id, role_id, assigned_by) VALUES ($1, $2, $3)`,
      [userId, roleId, assignedBy]
    );
  }

  /**
   * Remove role from user
   */
  async removeRoleFromUser(userId, roleId) {
    const { rows } = await query(
      `DELETE FROM user_roles WHERE user_id = $1 AND role_id = $2 RETURNING id`,
      [userId, roleId]
    );
    if (rows.length === 0) {
      const err = new Error('Role assignment not found');
      err.statusCode = 404;
      err.isOperational = true;
      throw err;
    }
  }

  /**
   * Get all roles for a user
   */
  async getUserRoles(userId) {
    const { rows } = await query(
      `SELECT r.id, r.name, r.description, r.is_system_role,
              ur.assigned_at, ur.assigned_by
       FROM roles r
       INNER JOIN user_roles ur ON ur.role_id = r.id
       WHERE ur.user_id = $1
       ORDER BY r.name`,
      [userId]
    );
    return rows.map(r => ({
      id: r.id,
      name: r.name,
      description: r.description,
      isSystemRole: r.is_system_role,
      assignedAt: r.assigned_at,
      assignedBy: r.assigned_by,
    }));
  }

  _format(row) {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      isSystemRole: row.is_system_role,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}

module.exports = new RolesService();
