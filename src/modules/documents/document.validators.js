const { param, body } = require('express-validator');

const idValidator = [
  param('id')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Valid document id is required'),
];

/**
 * Validates POST /download-zip
 * Expects: { ids: ["id1", "id2", ...] }  (1–50 items)
 */
const bulkDownloadValidator = [
  body('ids')
    .isArray({ min: 1, max: 50 })
    .withMessage('ids must be a non-empty array (max 50)'),
  body('ids.*')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Each document id must be a non-empty string'),
];

module.exports = { idValidator, bulkDownloadValidator };