const { sendError } = require('../utils/response');
const { query } = require('../config/database');

/**
 * Simple two-role model middlewares
 * - `requireAdmin` protects mutating endpoints
 * - `loadUserRole` attaches `req.user.roles` and a derived `req.user.role`
 */
const requireAdmin = (req, res, next) => {
  if (!req.user) return sendError(res, 'Unauthorized', 401);
  if (req.user.role !== 'admin') return sendError(res, 'Admin access required', 403);
  next();
};

const loadUserRole = async (req, res, next) => {
  try {
    if (!req.user) return next();
    const { rows } = await query(
      `SELECT r.name FROM roles r
       INNER JOIN user_roles ur ON ur.role_id = r.id
       WHERE ur.user_id = $1`,
      [req.user.id]
    );
    const roles = rows.map(r => r.name);
    req.user.roles = roles;
    req.user.role = roles.includes('admin') ? 'admin' : 'viewer';
    next();
  } catch (err) {
    next();
  }
};

module.exports = { requireAdmin, loadUserRole };
