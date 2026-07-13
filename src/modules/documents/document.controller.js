const path = require('path');
const fs = require('fs');
const archiver = require('archiver');
const documentService = require('./document.service');
const { sendError } = require('../../utils/response');

class DocumentController {
  /**
   * GET /api/v1/documents/:id[?download=true]
   *
   * Generic handler — resolves the file path from source_file_path_s for
   * any doc_r_object_id (form, enclosure, attachment …) and either streams
   * it inline or triggers a browser download.
   */
  async getDocument(req, res) {
    try {
      const doc = await documentService.getByDocObjectId(req.params.id);

      if (!doc || !doc.doc_file_path) {
        return sendError(res, 'Document not found', 404);
      }

      const filePath = path.resolve(__dirname, '../../', doc.doc_file_path);

      if (!fs.existsSync(filePath)) {
        return sendError(res, 'Document file missing on server', 404);
      }

      const download = String(req.query.download || '').toLowerCase() === 'true';
      const responseOptions = {
        headers: {
          'X-Document-Path': doc.doc_file_path,
        },
      };
      
      return download
        ? res.download(filePath, path.basename(doc.doc_file_path), responseOptions)
        : res.sendFile(filePath, responseOptions);
    } catch (err) {
      return sendError(res, 'Failed to fetch document', 500);
    }
  }

  /**
   * POST /api/v1/documents/download-zip
   *
   * Accepts a JSON body: { ids: ["id1", "id2", ...] }
   *
   * Looks up each doc_r_object_id in source_file_path_s, resolves the file
   * on disk, and streams a zip archive back to the client.
   *
   * - Supports mixed file types: pdf, doc, docx, tiff, jpg, png, etc.
   * - Handles duplicate filenames by appending _(n) before the extension.
   * - Skips IDs that are not found in the DB or missing on disk, and
   *   reports them in the Content-Disposition header comment & final log.
   * - If zero files are found, returns 404 instead of an empty zip.
   */
  async downloadZip(req, res) {
    const { ids } = req.body; // validated by bulkDownloadValidator

    let docs;
    try {
      docs = await documentService.getManyByDocObjectIds(ids);
    } catch (err) {
      return sendError(res, 'Failed to fetch documents', 500);
    }

    // Resolve each doc to an absolute path and collect missing ones
    const toZip = [];   // { filePath, entryName }
    const missing = []; // ids that couldn't be resolved

    const seenNames = new Map(); // track duplicate filenames inside the zip

    for (const id of ids) {
      const doc = docs.find((d) => d.doc_r_object_id === id);

      if (!doc || !doc.doc_file_path) {
        missing.push(id);
        continue;
      }

      const filePath = path.resolve(__dirname, '../../', doc.doc_file_path);

      if (!fs.existsSync(filePath)) {
        missing.push(id);
        continue;
      }

      // Build a safe entry name and deduplicate within the archive
      const entryName = buildEntryName(path.basename(filePath), seenNames);
      toZip.push({ filePath, entryName });
    }

    if (toZip.length === 0) {
      return sendError(res, 'None of the requested documents could be found', 404);
    }

    // Stream the zip to the client
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const zipName = `documents_${timestamp}.zip`;

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${zipName}"`);

    // Expose skipped ids to the caller via a custom header (best-effort)
    if (missing.length) {
      res.setHeader('X-Skipped-Ids', missing.join(','));
    }

    const archive = archiver('zip', { zlib: { level: 6 } });

    // If archiver emits an error after headers are sent we can only destroy
    archive.on('error', (err) => {
      console.error('[downloadZip] archiver error:', err);
      if (!res.headersSent) {
        return sendError(res, 'Failed to create zip archive', 500);
      }
      res.destroy(err);
    });

    archive.pipe(res);

    for (const { filePath, entryName } of toZip) {
      archive.file(filePath, { name: entryName });
    }

    await archive.finalize();

    if (missing.length) {
      console.warn('[downloadZip] skipped ids (not found):', missing);
    }
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Returns a unique entry name for the zip archive.
 * If "report.pdf" was already added, the next one becomes "report_(1).pdf",
 * then "report_(2).pdf", and so on.
 *
 * @param {string}       basename   - original filename, e.g. "scan.tiff"
 * @param {Map<string,number>} seen - mutable map tracking usage counts
 * @returns {string}
 */
function buildEntryName(basename, seen) {
  const ext = path.extname(basename);                 // ".pdf"
  const stem = path.basename(basename, ext);           // "report"

  if (!seen.has(basename)) {
    seen.set(basename, 0);
    return basename;
  }

  const count = seen.get(basename) + 1;
  seen.set(basename, count);
  return `${stem}_(${count})${ext}`;
}

module.exports = new DocumentController();