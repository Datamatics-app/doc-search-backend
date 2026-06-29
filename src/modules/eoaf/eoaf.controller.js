// eaof.controller.js
const eoafService = require('./eoaf.service');
const { sendSuccess, sendError, sendPaginated } = require('../../utils/response');

class EoafController {
  async searchForms(req, res) {
    try {
      const { page = 1, limit = 50, ...filters } = req.query;
      const { rows, total } = await eoafService.searchForms({ page, limit, ...filters });
      return sendPaginated(res, rows, total, page, limit, 'Forms fetched successfully');
    } catch (err) {
      return sendError(res, 'Failed to search forms', 500);
    }
  }

  async getForm(req, res) {
    try {
      const form = await eoafService.getFormById(req.params.id);
      if (!form) return sendError(res, 'Form not found', 404);
      return sendSuccess(res, form, 'Form fetched successfully');
    } catch (err) {
      return sendError(res, 'Failed to fetch form', 500);
    }
  }

  async listEnclosuresByForm(req, res) {
    try {
      const { page = 1, limit = 50 } = req.query;
      const { rows, total } = await eoafService.listEnclosuresByForm(req.params.form_id, { page, limit });
      return sendPaginated(res, rows, total, page, limit, 'Enclosures fetched successfully');
    } catch (err) {
      return sendError(res, 'Failed to fetch enclosures', 500);
    }
  }

  async getEnclosure(req, res) {
    try {
      const enclosure = await eoafService.getEnclosureById(req.params.id);
      if (!enclosure) return sendError(res, 'Enclosure not found', 404);
      return sendSuccess(res, enclosure);
    } catch (err) {
      return sendError(res, 'Failed to fetch enclosure', 500);
    }
  }
}

module.exports = new EoafController();
