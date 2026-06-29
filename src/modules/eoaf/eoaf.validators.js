// eoaf.validators.js
const { param, query } = require('express-validator');

const idValidator = [
  param('id').trim().isLength({ min: 1 }).withMessage('Valid resource id is required'),
];

const formIdParam = [
  param('form_id').trim().isLength({ min: 1 }).withMessage('form_id is required'),
];

const queryValidators = [
  // Pagination
  query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
  query('limit').optional().isInt({ min: 1 }).withMessage('limit must be a positive integer'),

  // String filters
  query('oaf_num')
    .optional().isString().trim()
    .withMessage('oaf_num must be a string'),
  query('eoaf_subject')
    .optional().isString().trim()
    .withMessage('eoaf_subject must be a string'),
  query('status')
    .optional().isString().trim()
    .withMessage('status must be a string'),

  // — Initiation Date range  (maps to xoaf_form_s.initiation_date)
  query('initiation_date_from')
    .optional()
    .isDate({ format: 'YYYY-MM-DD' })
    .withMessage('initiation_date_from must be a valid date (YYYY-MM-DD)'),
  query('initiation_date_to')
    .optional()
    .isDate({ format: 'YYYY-MM-DD' })
    .withMessage('initiation_date_to must be a valid date (YYYY-MM-DD)'),

  // Created Date range  (maps to dm_sysobject_s.r_creation_date)
  query('created_from')
    .optional()
    .isDate({ format: 'YYYY-MM-DD' })
    .withMessage('created_from must be a valid date (YYYY-MM-DD)'),
  query('created_to')
    .optional()
    .isDate({ format: 'YYYY-MM-DD' })
    .withMessage('created_to must be a valid date (YYYY-MM-DD)'),
];

module.exports = { idValidator, queryValidators, formIdParam };
