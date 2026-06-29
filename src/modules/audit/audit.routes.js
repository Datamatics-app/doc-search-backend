const express = require('express');
const router = express.Router();
const { param } = require('express-validator');

const auditController = require('./audit.controller');
const { authenticate } = require('../../middleware/authenticate');
const { requireAdmin } = require('../../middleware/permissions');
const { validate } = require('../../middleware/validate');

router.use(authenticate);
router.use(requireAdmin);

// GET /audit-logs
router.get('/', auditController.listLogs.bind(auditController));

// GET /audit-logs/user/:id
router.get(
  '/user/:id',
  [param('id').isInt({ min: 1 }).withMessage('Invalid user ID')],
  validate,
  auditController.getLogsForUser.bind(auditController)
);

// GET /audit-logs/resource/:resource/:resourceId
router.get(
  '/resource/:resource/:resourceId',
  [
    param('resource').notEmpty().withMessage('Resource is required'),
    param('resourceId').notEmpty().withMessage('Resource ID is required'),
  ],
  validate,
  auditController.getLogsForResource.bind(auditController)
);

module.exports = router;
