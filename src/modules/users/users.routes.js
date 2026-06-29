const express = require('express');
const router = express.Router();

const usersController = require('./users.controller');
const { authenticate } = require('../../middleware/authenticate');
const { requireAdmin } = require('../../middleware/permissions');
const { validate } = require('../../middleware/validate');
const {
  createUserValidators,
  updateUserValidators,
  changePasswordValidators,
  listUsersValidators,
  userIdValidator,
} = require('./users.validators');
const { body, param } = require('express-validator');

// All routes require authentication
router.use(authenticate);

// GET  /users
router.get(
  '/',
  listUsersValidators,
  validate,
  usersController.listUsers.bind(usersController)
);

// POST /users — admin only
router.post(
  '/',
  requireAdmin,
  createUserValidators,
  validate,
  usersController.createUser.bind(usersController)
);

// GET /users/:id
router.get(
  '/:id',
  userIdValidator,
  validate,
  usersController.getUser.bind(usersController)
);

// PATCH /users/:id — admin only
router.patch(
  '/:id',
  requireAdmin,
  [...userIdValidator, ...updateUserValidators],
  validate,
  usersController.updateUser.bind(usersController)
);

// DELETE /users/:id — admin only (soft deactivate)
router.delete(
  '/:id',
  requireAdmin,
  userIdValidator,
  validate,
  usersController.deactivateUser.bind(usersController)
);

// PATCH /users/:id/activate — admin only
router.patch(
  '/:id/activate',
  requireAdmin,
  userIdValidator,
  validate,
  usersController.activateUser.bind(usersController)
);

// PATCH /users/:id/change-password
router.patch(
  '/:id/change-password',
  [...userIdValidator, ...changePasswordValidators],
  validate,
  usersController.changePassword.bind(usersController)
);

// GET /users/:id/roles
router.get(
  '/:id/roles',
  userIdValidator,
  validate,
  usersController.getUserRoles.bind(usersController)
);

// POST /users/:id/roles — admin only
router.post(
  '/:id/roles',
  requireAdmin,
  [
    ...userIdValidator,
    body('roleId').isInt({ min: 1 }).withMessage('Valid roleId is required'),
  ],
  validate,
  usersController.assignRole.bind(usersController)
);

// DELETE /users/:id/roles/:roleId — admin only
router.delete(
  '/:id/roles/:roleId',
  requireAdmin,
  [
    ...userIdValidator,
    param('roleId').isInt({ min: 1 }).withMessage('Valid roleId is required'),
  ],
  validate,
  usersController.removeRole.bind(usersController)
);

module.exports = router;
