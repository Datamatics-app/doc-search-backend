const { param, query } = require('express-validator');

const idValidator = [
  param('id').trim().isLength({ min: 1 }).withMessage('Valid LD resource id is required'),
];

const formIdParam = [
  param('form_id').trim().isLength({ min: 1 }).withMessage('form_id is required'),
];

const queryValidators = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1 }),
  query('file_ref_no').optional().isString().trim(),
  query('subject').optional().isString().trim(),
  query('form_status').optional().isString().trim(),
  query('company_code').optional().isString().trim(),
  query('approval_level').optional().isInt(),
  query('clusters').optional().isString().trim(),
];

module.exports = { idValidator, queryValidators, formIdParam };
