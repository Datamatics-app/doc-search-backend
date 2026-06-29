const eoafLdService = require('./eoaf-ld.service');
const { sendSuccess, sendError, sendPaginated } = require('../../utils/response');
const path = require('path');
const fs = require('fs');

class EoafLdController {
  async searchForms(req, res) {
    try {
      const { page = 1, limit = 50, ...filters } = req.query;
      const { rows, total } = await eoafLdService.searchForms({ page, limit, ...filters });
      return sendPaginated(res, rows, total, page, limit, 'LD forms fetched successfully');
    } catch (err) {
      return sendError(res, 'Failed to search LD forms', 500);
    }
  }

  async getForm(req, res) {
    try {
      const form = await eoafLdService.getFormById(req.params.id);
      if (!form) return sendError(res, 'LD form not found', 404);
      return sendSuccess(res, form, 'LD form fetched successfully');
    } catch (err) {
      return sendError(res, 'Failed to fetch LD form', 500);
    }
  }

  async listEnclosuresByForm(req, res) {
    try {
      const { page = 1, limit = 50 } = req.query;
      const { rows, total } = await eoafLdService.listEnclosuresByForm(req.params.form_id, { page, limit });
      return sendPaginated(res, rows, total, page, limit, 'LD enclosures fetched successfully');
    } catch (err) {
      return sendError(res, 'Failed to fetch LD enclosures', 500);
    }
  }

  async getFormDocument(req, res) {
    try {
      const doc = await eoafLdService.getFormDocument(req.params.id);
      if (!doc || !doc.doc_file_path) {
        return sendError(res, 'Document not found for this LD form', 404);
      }
      const filePath = path.resolve(__dirname, '../../', doc.doc_file_path);
      if (!fs.existsSync(filePath)) {
        return sendError(res, 'Document file missing on server', 404);
      }
      const download = String(req.query.download || '').toLowerCase() === 'true';
      if (download) {
        return res.download(filePath);
      }
      return res.sendFile(filePath);
    } catch (err) {
      return sendError(res, 'Failed to fetch LD form document', 500);
    }
  }

  async getEnclosure(req, res) {
    try {
      const enclosure = await eoafLdService.getEnclosureById(req.params.id);
      if (!enclosure) return sendError(res, 'LD enclosure not found', 404);
      return sendSuccess(res, enclosure);
    } catch (err) {
      return sendError(res, 'Failed to fetch LD enclosure', 500);
    }
  }

  async getEnclosureDocument(req, res) {
    try {
      const doc = await eoafLdService.getEnclosureDocument(req.params.id);
      if (!doc || !doc.doc_file_path) {
        return sendError(res, 'Document not found for this LD enclosure', 404);
      }
      const filePath = path.resolve(__dirname, '../../', doc.doc_file_path);
      if (!fs.existsSync(filePath)) {
        return sendError(res, 'Document file missing on server', 404);
      }
      const download = String(req.query.download || '').toLowerCase() === 'true';
      if (download) {
        return res.download(filePath);
      }
      return res.sendFile(filePath);
    } catch (err) {
      return sendError(res, 'Failed to fetch LD enclosure document', 500);
    }
  }
}

module.exports = new EoafLdController();
