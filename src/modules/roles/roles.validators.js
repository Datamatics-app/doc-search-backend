const { body, param } = require('express-validator');

const createRoleValidators = [
  body('name')
    .trim()
    .notEmpty().withMessage('Role name is required')
    .isLength({ max: 100 }).withMessage('Role name too long')
    .matches(/^[a-z_]+$/).withMessage('Role name must be lowercase letters and underscores only'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Description too long'),
  body('isSystemRole')
    .optional()
    .isBoolean().withMessage('isSystemRole must be a boolean'),
];

const updateRoleValidators = [
  body('name')
    .optional()
    .trim()
    .notEmpty().withMessage('Role name cannot be empty')
    .isLength({ max: 100 }).withMessage('Role name too long')
    .matches(/^[a-z_]+$/).withMessage('Role name must be lowercase letters and underscores only'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Description too long'),
];

const roleIdValidator = [
  param('id').isInt({ min: 1 }).withMessage('Invalid role ID'),
];

module.exports = { createRoleValidators, updateRoleValidators, roleIdValidator };
