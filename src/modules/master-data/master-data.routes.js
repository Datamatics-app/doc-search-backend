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
router.use('/:resource', validateResourceParam);

router.get(
  '/:resource',
  requireAdmin,
  validateListQuery,
  masterDataController.listMasterData.bind(masterDataController)
);

router.get(
  '/:resource/:id',
  requireAdmin,
  validateIdParam,
  masterDataController.getMasterDataById.bind(masterDataController)
);

router.post(
  '/:resource',
  requireAdmin,
  validateBody('create'),
  masterDataController.createMasterData.bind(masterDataController)
);

router.put(
  '/:resource/:id',
  requireAdmin,
  validateIdParam,
  validateBody('update'),
  masterDataController.updateMasterData.bind(masterDataController)
);

router.delete(
  '/:resource/:id',
  requireAdmin,
  validateIdParam,
  masterDataController.deactivateMasterData.bind(masterDataController)
);

module.exports = router;