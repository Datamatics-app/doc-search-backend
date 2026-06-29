const authService = require('./auth.service');
const auditService = require('../audit/audit.service');
const { sendSuccess, sendError } = require('../../utils/response');

class AuthController {
  /**
   * POST /auth/login
   */
  async login(req, res) {
    try {
      const { email, password } = req.body;
      const ipAddress = req.ip || req.connection.remoteAddress;

      const result = await authService.login(email, password, ipAddress);

      await auditService.log({
        userId: result.user.id,
        action: 'login',
        resource: 'auth',
        resourceId: String(result.user.id),
        ipAddress,
        metadata: { email: result.user.email },
      });

      sendSuccess(res, result, 'Login successful');
    } catch (err) {
      if (err.isOperational) {
        return sendError(res, err.message, err.statusCode);
      }
      sendError(res, 'Login failed', 500);
    }
  }

  /**
   * POST /auth/refresh
   */
  async refresh(req, res) {
    try {
      const { refreshToken } = req.body;
      const result = await authService.refresh(refreshToken);
      sendSuccess(res, result, 'Token refreshed');
    } catch (err) {
      if (err.isOperational) {
        return sendError(res, err.message, err.statusCode);
      }
      sendError(res, 'Token refresh failed', 500);
    }
  }

  /**
   * POST /auth/logout
   * Requires: JWT (authenticate middleware)
   */
  async logout(req, res) {
    try {
      const { refreshToken } = req.body;
      if (refreshToken) {
        await authService.logout(refreshToken, req.user.id);
      }

      await auditService.log({
        userId: req.user.id,
        action: 'logout',
        resource: 'auth',
        resourceId: String(req.user.id),
        ipAddress: req.ip,
        metadata: {},
      });

      sendSuccess(res, null, 'Logged out successfully');
    } catch (err) {
      sendError(res, 'Logout failed', 500);
    }
  }

  /**
   * POST /auth/logout-all
   * Invalidates all sessions for the current user
   */
  async logoutAll(req, res) {
    try {
      await authService.logoutAll(req.user.id);
      sendSuccess(res, null, 'All sessions terminated');
    } catch (err) {
      sendError(res, 'Logout all failed', 500);
    }
  }

  /**
   * GET /auth/me
   * Returns current authenticated user profile
   */
  async me(req, res) {
    try {
      sendSuccess(res, req.user, 'Current user profile');
    } catch (err) {
      sendError(res, 'Failed to fetch profile', 500);
    }
  }
}

module.exports = new AuthController();
