const { body, query, param } = require('express-validator');

const createUserValidators = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])/)
    .withMessage('Password must contain uppercase, lowercase, number, and special character'),
  body('fullName')
    .trim()
    .notEmpty().withMessage('Full name is required')
    .isLength({ max: 201 }).withMessage('Full name too long'),
];

const updateUserValidators = [
  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  body('fullName')
    .optional()
    .trim()
    .notEmpty().withMessage('Full name cannot be empty')
    .isLength({ max: 201 }).withMessage('Full name too long'),
];

const changePasswordValidators = [
  body('currentPassword')
    .notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])/)
    .withMessage('Password must contain uppercase, lowercase, number, and special character'),
];

const listUsersValidators = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('isActive').optional().isIn(['true', 'false']).withMessage('isActive must be true or false'),
];

const userIdValidator = [
  param('id').isInt({ min: 1 }).withMessage('Invalid user ID'),
];

module.exports = {
  createUserValidators,
  updateUserValidators,
  changePasswordValidators,
  listUsersValidators,
  userIdValidator,
};
