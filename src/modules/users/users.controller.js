const usersService = require('./users.service');
const rolesService = require('../roles/roles.service');
const auditService = require('../audit/audit.service');
const { sendSuccess, sendError, sendPaginated } = require('../../utils/response');

class UsersController {
  /**
   * GET /users
   */
  async listUsers(req, res) {
    try {
      const { page = 1, limit = 20, search = '', isActive } = req.query;
      const { users, total } = await usersService.listUsers({ page, limit, search, isActive });
      sendPaginated(res, users, total, page, limit, 'Users fetched successfully');
    } catch (err) {
      sendError(res, 'Failed to fetch users', 500);
    }
  }

  /**
   * GET /users/:id
   */
  async getUser(req, res) {
    try {
      const user = await usersService.findById(req.params.id);
      sendSuccess(res, user, 'User fetched successfully');
    } catch (err) {
      if (err.isOperational) return sendError(res, err.message, err.statusCode);
      sendError(res, 'Failed to fetch user', 500);
    }
  }

  /**
   * POST /users
   */
  async createUser(req, res) {
    try {
      const user = await usersService.createUser(req.body);
      await auditService.log({
        userId: req.user.id,
        action: 'create',
        resource: 'user',
        resourceId: String(user.id),
        ipAddress: req.ip,
        metadata: { email: user.email },
      });
      sendSuccess(res, user, 'User created successfully', 201);
    } catch (err) {
      if (err.isOperational) return sendError(res, err.message, err.statusCode);
      sendError(res, 'Failed to create user', 500);
    }
  }

  /**
   * PATCH /users/:id
   */
  async updateUser(req, res) {
    try {
      const user = await usersService.updateUser(req.params.id, req.body);
      await auditService.log({
        userId: req.user.id,
        action: 'update',
        resource: 'user',
        resourceId: String(req.params.id),
        ipAddress: req.ip,
        metadata: req.body,
      });
      sendSuccess(res, user, 'User updated successfully');
    } catch (err) {
      if (err.isOperational) return sendError(res, err.message, err.statusCode);
      sendError(res, 'Failed to update user', 500);
    }
  }

  /**
   * DELETE /users/:id  (soft-deactivate)
   */
  async deactivateUser(req, res) {
    try {
      if (parseInt(req.params.id) === req.user.id) {
        return sendError(res, 'Cannot deactivate your own account', 400);
      }
      await usersService.deactivateUser(req.params.id);
      await auditService.log({
        userId: req.user.id,
        action: 'deactivate',
        resource: 'user',
        resourceId: String(req.params.id),
        ipAddress: req.ip,
        metadata: {},
      });
      sendSuccess(res, null, 'User deactivated successfully');
    } catch (err) {
      if (err.isOperational) return sendError(res, err.message, err.statusCode);
      sendError(res, 'Failed to deactivate user', 500);
    }
  }

  /**
   * PATCH /users/:id/activate
   */
  async activateUser(req, res) {
    try {
      await usersService.activateUser(req.params.id);
      await auditService.log({
        userId: req.user.id,
        action: 'activate',
        resource: 'user',
        resourceId: String(req.params.id),
        ipAddress: req.ip,
        metadata: {},
      });
      sendSuccess(res, null, 'User activated successfully');
    } catch (err) {
      if (err.isOperational) return sendError(res, err.message, err.statusCode);
      sendError(res, 'Failed to activate user', 500);
    }
  }

  /**
   * PATCH /users/:id/change-password
   */
  async changePassword(req, res) {
    try {
      // Users can change only own password (admin can bypass)
      if (parseInt(req.params.id) !== req.user.id) {
        return sendError(res, 'You can only change your own password', 403);
      }
      await usersService.changePassword(req.params.id, req.body);
      sendSuccess(res, null, 'Password changed successfully');
    } catch (err) {
      if (err.isOperational) return sendError(res, err.message, err.statusCode);
      sendError(res, 'Failed to change password', 500);
    }
  }

  /**
   * GET /users/:id/roles
   */
  async getUserRoles(req, res) {
    try {
      const roles = await rolesService.getUserRoles(req.params.id);
      sendSuccess(res, roles, 'User roles fetched');
    } catch (err) {
      if (err.isOperational) return sendError(res, err.message, err.statusCode);
      sendError(res, 'Failed to fetch user roles', 500);
    }
  }

  /**
   * POST /users/:id/roles
   */
  async assignRole(req, res) {
    try {
      const { roleId } = req.body;
      await rolesService.assignRoleToUser(req.params.id, roleId, req.user.id);
      await auditService.log({
        userId: req.user.id,
        action: 'assign',
        resource: 'role',
        resourceId: String(roleId),
        ipAddress: req.ip,
        metadata: { targetUserId: req.params.id, roleId },
      });
      sendSuccess(res, null, 'Role assigned to user successfully');
    } catch (err) {
      if (err.isOperational) return sendError(res, err.message, err.statusCode);
      sendError(res, 'Failed to assign role', 500);
    }
  }

  /**
   * DELETE /users/:id/roles/:roleId
   */
  async removeRole(req, res) {
    try {
      await rolesService.removeRoleFromUser(req.params.id, req.params.roleId);
      await auditService.log({
        userId: req.user.id,
        action: 'remove',
        resource: 'role',
        resourceId: String(req.params.roleId),
        ipAddress: req.ip,
        metadata: { targetUserId: req.params.id },
      });
      sendSuccess(res, null, 'Role removed from user successfully');
    } catch (err) {
      if (err.isOperational) return sendError(res, err.message, err.statusCode);
      sendError(res, 'Failed to remove role', 500);
    }
  }
}

module.exports = new UsersController();
