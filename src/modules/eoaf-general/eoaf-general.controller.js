const eoafGeneralService = require('./eoaf-general.service');
const { sendSuccess, sendError, sendPaginated } = require('../../utils/response');
const path = require('path');
const fs = require('fs');

class EoafGeneralController {
  async searchForms(req, res) {
    try {
      const { page = 1, limit = 50, ...filters } = req.query;
      const { rows, total } = await eoafGeneralService.searchForms({ page, limit, ...filters });
      return sendPaginated(res, rows, total, page, limit, 'Forms fetched successfully');
    } catch (err) {
      return sendError(res, 'Failed to search forms', 500);
    }
  }

  async getForm(req, res) {
    try {
      const form = await eoafGeneralService.getFormById(req.params.id);
      if (!form) return sendError(res, 'Form not found', 404);
      return sendSuccess(res, form, 'Form fetched successfully');
    } catch (err) {
      return sendError(res, 'Failed to fetch form', 500);
    }
  }

  async listAttachmentsByForm(req, res) {
    try {
      const { page = 1, limit = 50 } = req.query;
      const { rows, total } = await eoafGeneralService.listAttachmentsByForm(req.params.form_id, { page, limit });
      return sendPaginated(res, rows, total, page, limit, 'Attachments fetched successfully');
    } catch (err) {
      return sendError(res, 'Failed to fetch attachments', 500);
    }
  }

  async getFormDocument(req, res) {
    try {
      const doc = await eoafGeneralService.getFormDocument(req.params.id);
      if (!doc || !doc.doc_file_path) {
        return sendError(res, 'Document not found for this form', 404);
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
      return sendError(res, 'Failed to fetch document', 500);
    }
  }

  async getAttachment(req, res) {
    try {
      const attachment = await eoafGeneralService.getAttachmentById(req.params.id);
      if (!attachment) return sendError(res, 'Attachment not found', 404);
      return sendSuccess(res, attachment);
    } catch (err) {
      return sendError(res, 'Failed to fetch attachment', 500);
    }
  }

  async getAttachmentDocument(req, res) {
    try {
      const doc = await eoafGeneralService.getAttachmentDocument(req.params.id);

      if (!doc || !doc.doc_file_path) {
        return sendError(res, 'Document not found', 404);
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
      return sendError(res, 'Failed to fetch document', 500);
    }
  }
}

module.exports = new EoafGeneralController();