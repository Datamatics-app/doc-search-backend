const bcrypt = require('bcryptjs');
const { query } = require('../../config/database');

class UsersService {
  /**
   * Create a new user
   */
  async createUser({ email, password, fullName }) {
    // Check duplicate email
    const { rows: existing } = await query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase()]
    );
    if (existing.length > 0) {
      const err = new Error('Email already in use');
      err.statusCode = 409;
      err.isOperational = true;
      throw err;
    }

    const passwordHash = await bcrypt.hash(
      password,
      parseInt(process.env.BCRYPT_ROUNDS) || 12
    );

    const { rows } = await query(
      `INSERT INTO users (email, password_hash, full_name)
       VALUES ($1, $2, $3)
       RETURNING id, emp_id, email, full_name, is_active, created_at`,
      [email.toLowerCase(), passwordHash, fullName]
    );

    return this._format(rows[0]);
  }

  /**
   * Find user by ID (bigint)
   */
  async findById(id) {
    const { rows } = await query(
      `SELECT id, emp_id, email, full_name, is_active, last_login_at, created_at, updated_at
       FROM users WHERE id = $1`,
      [id]
    );
    if (rows.length === 0) {
      const err = new Error('User not found');
      err.statusCode = 404;
      err.isOperational = true;
      throw err;
    }
    return this._format(rows[0]);
  }

  /**
   * Find user by email
   */
  async findByEmail(email) {
    const { rows } = await query(
      `SELECT id, emp_id, email, full_name, is_active
       FROM users WHERE email = $1`,
      [email.toLowerCase()]
    );
    if (rows.length === 0) {
      const err = new Error('User not found');
      err.statusCode = 404;
      err.isOperational = true;
      throw err;
    }
    return this._format(rows[0]);
  }

  /**
   * List users with pagination & filters
   */
  async listUsers({ page = 1, limit = 20, search = '', isActive }) {
    const offset = (page - 1) * limit;
    const params = [];
    const conditions = [];

    if (search) {
      params.push(`%${search}%`);
      conditions.push(
        `(u.email ILIKE $${params.length} OR u.full_name ILIKE $${params.length})`
      );
    }

    if (isActive !== undefined && isActive !== '') {
      params.push(isActive === 'true' || isActive === true);
      conditions.push(`u.is_active = $${params.length}`);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await query(
      `SELECT COUNT(*) FROM users u ${whereClause}`,
      params
    );

    params.push(limit, offset);
    const { rows } = await query(
      `SELECT u.id, u.emp_id, u.email, u.full_name,
              u.is_active, u.last_login_at, u.created_at,
              COALESCE(
                json_agg(r.name) FILTER (WHERE r.name IS NOT NULL), '[]'
              ) AS roles
       FROM users u
       LEFT JOIN user_roles ur ON ur.user_id = u.id
       LEFT JOIN roles r ON r.id = ur.role_id
       ${whereClause}
       GROUP BY u.id
       ORDER BY u.created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    return {
      users: rows.map(this._format),
      total: parseInt(countResult.rows[0].count),
    };
  }

  /**
   * Update user
   */
  async updateUser(id, { fullName, email }) {
    await this.findById(id); // ensure exists

    const updates = [];
    const params = [];

    if (fullName !== undefined) {
      params.push(fullName);
      updates.push(`full_name = $${params.length}`);
    }
    if (email !== undefined) {
      // Check email uniqueness
      const { rows: dup } = await query(
        'SELECT id FROM users WHERE email = $1 AND id != $2',
        [email.toLowerCase(), id]
      );
      if (dup.length > 0) {
        const err = new Error('Email already in use');
        err.statusCode = 409;
        err.isOperational = true;
        throw err;
      }
      params.push(email.toLowerCase());
      updates.push(`email = $${params.length}`);
    }

    if (updates.length === 0) {
      const err = new Error('No fields to update');
      err.statusCode = 400;
      err.isOperational = true;
      throw err;
    }

    params.push(id);
    const { rows } = await query(
      `UPDATE users SET ${updates.join(', ')}
       WHERE id = $${params.length}
       RETURNING id, emp_id, email, full_name, is_active, updated_at`,
      params
    );

    return this._format(rows[0]);
  }

  /**
   * Change password
   */
  async changePassword(id, { currentPassword, newPassword }) {
    const { rows } = await query(
      'SELECT id, password_hash FROM users WHERE id = $1',
      [id]
    );
    if (rows.length === 0) {
      const err = new Error('User not found');
      err.statusCode = 404;
      err.isOperational = true;
      throw err;
    }

    const isValid = await bcrypt.compare(currentPassword, rows[0].password_hash);
    if (!isValid) {
      const err = new Error('Current password is incorrect');
      err.statusCode = 400;
      err.isOperational = true;
      throw err;
    }

    const newHash = await bcrypt.hash(newPassword, parseInt(process.env.BCRYPT_ROUNDS) || 12);
    await query('UPDATE users SET password_hash = $1 WHERE id = $2', [newHash, id]);
  }

  /**
   * Deactivate user (soft delete)
   */
  async deactivateUser(id) {
    const { rows } = await query(
      `UPDATE users SET is_active = false
       WHERE id = $1 RETURNING id`,
      [id]
    );
    if (rows.length === 0) {
      const err = new Error('User not found');
      err.statusCode = 404;
      err.isOperational = true;
      throw err;
    }
  }

  /**
   * Reactivate user
   */
  async activateUser(id) {
    const { rows } = await query(
      `UPDATE users SET is_active = true
       WHERE id = $1 RETURNING id`,
      [id]
    );
    if (rows.length === 0) {
      const err = new Error('User not found');
      err.statusCode = 404;
      err.isOperational = true;
      throw err;
    }
  }

  _format(row) {
    if (!row) return null;
    return {
      id: row.id,
      empId: row.emp_id,
      email: row.email,
      fullName: row.full_name,
      isActive: row.is_active,
      lastLoginAt: row.last_login_at,
      roles: row.roles || [],
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}

module.exports = new UsersService();
