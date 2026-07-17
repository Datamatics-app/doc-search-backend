const express = require('express');
const router = express.Router();

const documentController = require('./document.controller');
const { authenticate } = require('../../middleware/authenticate');
const { validate } = require('../../middleware/validate');
const { idValidator, bulkDownloadValidator } = require('./document.validators');

router.use(authenticate);

/**
 * GET /api/v1/documents/:id
 *
 * Returns the file for any doc_r_object_id stored in eoaf_file_path_s.
 * Add ?download=true to trigger a browser file download instead of inline.
 *
 * Works for all EOAF types (forms, enclosures, attachments, LD, ScrapCAD …).
 */
router.get('/:id', idValidator, validate, documentController.getDocument.bind(documentController));

/**
 * POST /api/v1/documents/download-zip
 *
 * Accepts a JSON body: { ids: ["id1", "id2", ...] }   (max 50 ids)
 *
 * Fetches every matching file from eoaf_file_path_s, bundles them into a
 * zip archive, and streams the archive to the client.
 *
 * Supports mixed file types — pdf, doc, docx, tiff, jpg, png, etc.
 *
 * Response headers:
 *   Content-Type:        application/zip
 *   Content-Disposition: attachment; filename="documents_<timestamp>.zip"
 *   X-Skipped-Ids:       comma-separated list of ids that were not found
 *                        (omitted when every id resolved successfully)
 *
 * Error responses:
 *   400  — validation failed (missing / malformed body)
 *   404  — none of the requested ids could be resolved to an existing file
 *   500  — unexpected server error
 */
router.post('/download-zip', bulkDownloadValidator, validate, documentController.downloadZip.bind(documentController));

module.exports = router;