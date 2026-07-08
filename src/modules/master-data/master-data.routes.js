// master-data.routes.js

const express = require('express');
const router = express.Router();

const masterDataController = require('./master-data.controller');
const { authenticate } = require('../../middleware/authenticate');
const { requireAdmin } = require('../../middleware/permissions');
const {
  validateResourceParam,
  validateIdParam,
  validateListQuery,
  validateBody,
} = require('./master-data.validation');

router.use(authenticate);

router.get(
  '/:documentType/:resource',
  requireAdmin,
  validateResourceParam,
  validateListQuery,
  masterDataController.listMasterData.bind(masterDataController)
);

router.get(
  '/:documentType/:resource/:id',
  requireAdmin,
  validateResourceParam,
  validateIdParam,
  masterDataController.getMasterDataById.bind(masterDataController)
);

router.post(
  '/:documentType/:resource',
  requireAdmin,
  validateResourceParam,
  validateBody('create'),
  masterDataController.createMasterData.bind(masterDataController)
);

router.put(
  '/:documentType/:resource/:id',
  requireAdmin,
  validateResourceParam,
  validateIdParam,
  validateBody('update'),
  masterDataController.updateMasterData.bind(masterDataController)
);

router.delete(
  '/:documentType/:resource/:id',
  requireAdmin,
  validateResourceParam,
  validateIdParam,
  masterDataController.deactivateMasterData.bind(masterDataController)
);

module.exports = router;