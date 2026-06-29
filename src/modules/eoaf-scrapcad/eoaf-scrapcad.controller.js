const eoafScrapcadService = require('./eoaf-scrapcad.service');
const { sendSuccess, sendError, sendPaginated } = require('../../utils/response');
const path = require('path');
const fs = require('fs');

class EoafScrapcadController {
  async searchForms(req, res) {
    try {
      const { page = 1, limit = 50, ...filters } = req.query;
      const { rows, total } = await eoafScrapcadService.searchForms({ page, limit, ...filters });
      return sendPaginated(res, rows, total, page, limit, 'Scrap/CAD forms fetched successfully');
    } catch (err) {
      return sendError(res, 'Failed to search Scrap/CAD forms', 500);
    }
  }

  async getForm(req, res) {
    try {
      const form = await eoafScrapcadService.getFormById(req.params.id);
      if (!form) return sendError(res, 'Scrap/CAD form not found', 404);
      return sendSuccess(res, form, 'Scrap/CAD form fetched successfully');
    } catch (err) {
      return sendError(res, 'Failed to fetch Scrap/CAD form', 500);
    }
  }

  async listEnclosuresByForm(req, res) {
    try {
      const { page = 1, limit = 50 } = req.query;
      const { rows, total } = await eoafScrapcadService.listEnclosuresByForm(req.params.form_id, { page, limit });
      return sendPaginated(res, rows, total, page, limit, 'Scrap/CAD enclosures fetched successfully');
    } catch (err) {
      return sendError(res, 'Failed to fetch Scrap/CAD enclosures', 500);
    }
  }

  async getFormDocument(req, res) {
    try {
      const doc = await eoafScrapcadService.getFormDocument(req.params.id);
      if (!doc || !doc.doc_file_path) {
        return sendError(res, 'Document not found for this Scrap/CAD form', 404);
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
      return sendError(res, 'Failed to fetch Scrap/CAD form document', 500);
    }
  }

  async getEnclosure(req, res) {
    try {
      const enclosure = await eoafScrapcadService.getEnclosureById(req.params.id);
      if (!enclosure) return sendError(res, 'Scrap/CAD enclosure not found', 404);
      return sendSuccess(res, enclosure);
    } catch (err) {
      return sendError(res, 'Failed to fetch Scrap/CAD enclosure', 500);
    }
  }

  async getEnclosureDocument(req, res) {
    try {
      const doc = await eoafScrapcadService.getEnclosureDocument(req.params.id);
      if (!doc || !doc.doc_file_path) {
        return sendError(res, 'Document not found for this Scrap/CAD enclosure', 404);
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
      return sendError(res, 'Failed to fetch Scrap/CAD enclosure document', 500);
    }
  }
}

module.exports = new EoafScrapcadController();
