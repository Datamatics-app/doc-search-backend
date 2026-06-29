const { validationResult } = require('express-validator');
const { sendError } = require('../utils/response');

/**
 * Runs after express-validator checks.
 * If errors exist, returns 422 with formatted error list.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formatted = errors.array().map(err => ({
      field: err.path,
      message: err.msg,
    }));
    return sendError(res, 'Validation failed', 422, formatted);
  }
  next();
};

module.exports = { validate };
