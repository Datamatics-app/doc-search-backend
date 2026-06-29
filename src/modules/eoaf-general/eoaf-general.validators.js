const { param, query } = require('express-validator');

const idValidator = [
  param('id').trim().isLength({ min: 1 }).withMessage('Valid resource id is required'),
];

const formIdParam = [
  param('form_id').trim().isLength({ min: 1 }).withMessage('form_id is required'),
];

const queryValidators = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1 }),
  query('memo_no').optional().isString().trim(),
  query('subject').optional().isString().trim(),
  query('status').optional().isString().trim(),
  query('category').optional().isString().trim(),
  query('budget').optional().isString().trim(),
  query('clusters').optional().isString().trim(),
];

module.exports = { idValidator, queryValidators, formIdParam };