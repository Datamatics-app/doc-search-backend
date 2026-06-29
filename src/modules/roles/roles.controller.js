const rolesService = require('./roles.service');
const auditService = require('../audit/audit.service');
const { sendSuccess, sendError, sendPaginated } = require('../../utils/response');

class RolesController {
  /**
   * GET /roles
   */
  async listRoles(req, res) {
    try {
      const { page = 1, limit = 50 } = req.query;
      const { roles, total } = await rolesService.listRoles({ page, limit });
      sendPaginated(res, roles, total, page, limit, 'Roles fetched successfully');
    } catch (err) {
      sendError(res, 'Failed to fetch roles', 500);
    }
  }

  /**
   * GET /roles/:id
   */
  async getRole(req, res) {
    try {
      const role = await rolesService.findById(req.params.id);
      sendSuccess(res, role, 'Role fetched successfully');
    } catch (err) {
      if (err.isOperational) return sendError(res, err.message, err.statusCode);
      sendError(res, 'Failed to fetch role', 500);
    }
  }

  /**
   * POST /roles
   */
  async createRole(req, res) {
    try {
      const role = await rolesService.createRole(req.body);
      await auditService.log({
        userId: req.user.id,
        action: 'create',
        resource: 'role',
        resourceId: String(role.id),
        ipAddress: req.ip,
        metadata: { name: role.name },
      });
      sendSuccess(res, role, 'Role created successfully', 201);
    } catch (err) {
      if (err.isOperational) return sendError(res, err.message, err.statusCode);
      sendError(res, 'Failed to create role', 500);
    }
  }

  /**
   * PATCH /roles/:id
   */
  async updateRole(req, res) {
    try {
      const role = await rolesService.updateRole(req.params.id, req.body);
      await auditService.log({
        userId: req.user.id,
        action: 'update',
        resource: 'role',
        resourceId: String(req.params.id),
        ipAddress: req.ip,
        metadata: req.body,
      });
      sendSuccess(res, role, 'Role updated successfully');
    } catch (err) {
      if (err.isOperational) return sendError(res, err.message, err.statusCode);
      sendError(res, 'Failed to update role', 500);
    }
  }

  /**
   * DELETE /roles/:id
   */
  async deleteRole(req, res) {
    try {
      await rolesService.deleteRole(req.params.id);
      await auditService.log({
        userId: req.user.id,
        action: 'delete',
        resource: 'role',
        resourceId: String(req.params.id),
        ipAddress: req.ip,
        metadata: {},
      });
      sendSuccess(res, null, 'Role deleted successfully');
    } catch (err) {
      if (err.isOperational) return sendError(res, err.message, err.statusCode);
      sendError(res, 'Failed to delete role', 500);
    }
  }

  /**
   * GET /roles/:id/permissions
   */
  // Fine-grained permission endpoints removed in simplified two-role model
}

module.exports = new RolesController();
