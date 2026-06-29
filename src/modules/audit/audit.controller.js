const auditService = require('./audit.service');
const { sendSuccess, sendError, sendPaginated } = require('../../utils/response');

class AuditController {
  /**
   * GET /audit-logs — admin only, list all logs
   */
  async listLogs(req, res) {
    try {
      const { page = 1, limit = 50, action, resource, userId, startDate, endDate } = req.query;
      const { logs, total } = await auditService.listLogs({
        page, limit, action, resource, userId, startDate, endDate,
      });
      sendPaginated(res, logs, total, page, limit, 'Audit logs fetched');
    } catch (err) {
      sendError(res, 'Failed to fetch audit logs', 500);
    }
  }

  /**
   * GET /audit-logs/user/:id — logs for a specific user
   */
  async getLogsForUser(req, res) {
    try {
      const { page = 1, limit = 50, action, resource } = req.query;
      const { logs, total } = await auditService.getLogsForUser(
        req.params.id,
        { page, limit, action, resource }
      );
      sendPaginated(res, logs, total, page, limit, 'User audit logs fetched');
    } catch (err) {
      sendError(res, 'Failed to fetch user audit logs', 500);
    }
  }

  /**
   * GET /audit-logs/resource/:resource/:resourceId
   */
  async getLogsForResource(req, res) {
    try {
      const { page = 1, limit = 50 } = req.query;
      const { logs, total } = await auditService.getLogsForResource(
        req.params.resource,
        req.params.resourceId,
        { page, limit }
      );
      sendPaginated(res, logs, total, page, limit, 'Resource audit logs fetched');
    } catch (err) {
      sendError(res, 'Failed to fetch resource audit logs', 500);
    }
  }
}

module.exports = new AuditController();
