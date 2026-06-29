const { body } = require('express-validator');

const loginValidators = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required'),
];

const refreshValidators = [
  body('refreshToken')
    .notEmpty().withMessage('Refresh token is required'),
];

module.exports = { loginValidators, refreshValidators };
