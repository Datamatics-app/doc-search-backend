const { verifyAccessToken } = require('../utils/jwt');
const { sendError } = require('../utils/response');
const { query } = require('../config/database');
const { loadUserRole } = require('./permissions');

/**
 * JwtAuthGuard — validates the JWT and attaches req.user
 * No token = 401
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'Access token is required', 401);
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return sendError(res, 'Access token is required', 401);
    }

    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return sendError(res, 'Access token has expired', 401);
      }
      return sendError(res, 'Invalid access token', 401);
    }

    // Fetch fresh user from DB (ensures user still exists & is active)
    const { rows } = await query(
      `SELECT id, uuid, email, first_name, last_name, is_active
       FROM users WHERE id = $1 AND is_active = true`,
      [decoded.userId]
    );

    if (rows.length === 0) {
      return sendError(res, 'User not found or deactivated', 401);
    }

    req.user = rows[0];
    // Load user's role(s) so downstream middlewares can use `req.user.role` / `req.user.roles`
    return loadUserRole(req, res, next);
  } catch (err) {
    return sendError(res, 'Authentication failed', 500);
  }
};

module.exports = { authenticate };
