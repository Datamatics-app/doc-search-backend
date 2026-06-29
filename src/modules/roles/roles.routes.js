const express = require('express');
const router = express.Router();

const rolesController = require('./roles.controller');
const { authenticate } = require('../../middleware/authenticate');
const { requireAdmin } = require('../../middleware/permissions');
const { validate } = require('../../middleware/validate');
const { createRoleValidators, updateRoleValidators, roleIdValidator } = require('./roles.validators');
const { body, param } = require('express-validator');

router.use(authenticate);

// GET  /roles
router.get('/', rolesController.listRoles.bind(rolesController));

// POST /roles
router.post(
  '/',
  requireAdmin,
  createRoleValidators,
  validate,
  rolesController.createRole.bind(rolesController)
);

// GET /roles/:id
router.get(
  '/:id',
  roleIdValidator,
  validate,
  rolesController.getRole.bind(rolesController)
);

// PATCH /roles/:id
router.patch(
  '/:id',
  requireAdmin,
  [...roleIdValidator, ...updateRoleValidators],
  validate,
  rolesController.updateRole.bind(rolesController)
);

// DELETE /roles/:id
router.delete(
  '/:id',
  requireAdmin,
  roleIdValidator,
  validate,
  rolesController.deleteRole.bind(rolesController)
);

// Fine-grained permission routes removed in simplified RBAC

module.exports = router;
