// master-data.controller.js

const masterDataService = require('./master-data.service');
const { sendSuccess, sendError, sendPaginated } = require('../../utils/response');
const logger = require('../../config/logger');

class MasterDataController {
  async listMasterData(req, res) {
    try {
      const { items, total, page, limit } = await masterDataService.list(req.params.resource, req.query, req.params.documentType);
      sendPaginated(res, items, total, page, limit, `${req.params.resource} fetched successfully`);
    } catch (err) {
      if (err.isOperational) return sendError(res, err.message, err.statusCode);
      logger.error('listMasterData failed', { resource: req.params.resource, error: err.message, stack: err.stack });
      sendError(res, 'Failed to fetch master data', 500);
    }
  }

  async getMasterDataById(req, res) {
    try {
      const item = await masterDataService.getById(req.params.resource, req.params.id, req.params.documentType);
      sendSuccess(res, item, 'Master data item fetched successfully');
    } catch (err) {
      if (err.isOperational) return sendError(res, err.message, err.statusCode);
      logger.error('getMasterDataById failed', { resource: req.params.resource, id: req.params.id, error: err.message, stack: err.stack });
      sendError(res, 'Failed to fetch master data item', 500);
    }
  }

  async createMasterData(req, res) {
    try {
      const item = await masterDataService.create(req.params.resource, req.body, req.params.documentType);
      sendSuccess(res, item, 'Master data item created successfully', 201);
    } catch (err) {
      if (err.isOperational) return sendError(res, err.message, err.statusCode);
      logger.error('createMasterData failed', { resource: req.params.resource, error: err.message, stack: err.stack });
      sendError(res, 'Failed to create master data item', 500);
    }
  }

  async updateMasterData(req, res) {
    try {
      const item = await masterDataService.update(req.params.resource, req.params.id, req.body, req.params.documentType);
      sendSuccess(res, item, 'Master data item updated successfully');
    } catch (err) {
      if (err.isOperational) return sendError(res, err.message, err.statusCode);
      logger.error('updateMasterData failed', { resource: req.params.resource, id: req.params.id, error: err.message, stack: err.stack });
      sendError(res, 'Failed to update master data item', 500);
    }
  }

  async deactivateMasterData(req, res) {
    try {
      const item = await masterDataService.deactivate(req.params.resource, req.params.id, req.params.documentType);
      sendSuccess(res, item, 'Master data item deactivated successfully');
    } catch (err) {
      if (err.isOperational) return sendError(res, err.message, err.statusCode);
      logger.error('deactivateMasterData failed', { resource: req.params.resource, id: req.params.id, error: err.message, stack: err.stack });
      sendError(res, 'Failed to deactivate master data item', 500);
    }
  }

  async getDashboardMetaData(req, res) {
    try {
      const data = await masterDataService.getDashboardMetaData(req.params.documentType);
      sendSuccess(res, data, 'Dashboard metadata fetched successfully');
    } catch (err) {
      if (err.isOperational) return sendError(res, err.message, err.statusCode);
      logger.error('getDashboardMetaData failed', { documentType: req.params.documentType, error: err.message, stack: err.stack });
      sendError(res, 'Failed to fetch dashboard metadata', 500);
    }
  }
}

module.exports = new MasterDataController();