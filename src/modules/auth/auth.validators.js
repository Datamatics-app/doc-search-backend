const { body } = require('express-validator');

const loginValidators = [
  body('email')
    .optional({ checkFalsy: true })
    .trim()
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  body('password')
    .optional({ checkFalsy: true })
    .isString().withMessage('Password must be a string'),
  body('idToken')
    .optional({ checkFalsy: true })
    .isString().withMessage('idToken must be a string'),
  body().custom((_, { req }) => {
    const authMode = process.env.AUTH_MODE || 'PASSWORD';
    if (authMode === 'SSO') {
      if (!req.body.idToken) {
        throw new Error('idToken is required for SSO login');
      }
    } else {
      if (!req.body.email) throw new Error('Email is required');
      if (!req.body.password) throw new Error('Password is required');
    }
    return true;
  }),
];

const refreshValidators = [
  body('refreshToken')
    .notEmpty().withMessage('Refresh token is required'),
];

module.exports = { loginValidators, refreshValidators };
