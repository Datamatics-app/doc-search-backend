const path = require('path');
const fs = require('fs');
const archiver = require('archiver');
const documentService = require('./document.service');
const { sendError } = require('../../utils/response');

class DocumentController {
  /**
   * GET /api/v1/documents/:id[?download=true]
   *
   * Generic handler — resolves the file path from eoaf_file_path_s for
   * any doc_r_object_id (form, enclosure, attachment …) and either streams
   * it inline or triggers a browser download.
   *
   */
  async getDocument(req, res) {
    try {
      const doc = await documentService.getByDocObjectId(req.params.id);

      if (!doc || !doc.doc_file_path) {
        return sendError(res, 'Document not found', 404);
      }

      const filePath = resolveNasPath(doc.doc_file_path);

      if (!filePath) {
        console.error('[getDocument] invalid/unexpected doc_file_path:', doc.doc_file_path);
        return sendError(res, 'Document path is invalid', 400);
      }

      const accessErr = await checkFileAccess(filePath);
      if (accessErr) {
        return sendError(res, accessErr.message, accessErr.status);
      }

      const download = String(req.query.download || '').toLowerCase() === 'true';

      return download ? res.download(filePath) : res.sendFile(filePath);
    } catch (err) {
      console.error('[getDocument] unexpected error:', err);
      return sendError(res, 'Failed to fetch document', 500);
    }
  }

  /**
   * POST /api/v1/documents/download-zip
   *
   * Accepts a JSON body: { ids: ["id1", "id2", ...] }
   *
   * Looks up each doc_r_object_id in eoaf_file_path_s, resolves the file
   * on the NAS share via its UNC path, and streams a zip archive back
   * to the client.
   *
   */
  async downloadZip(req, res) {
    const { ids } = req.body; // validated by bulkDownloadValidator

    let docs;
    try {
      docs = await documentService.getManyByDocObjectIds(ids);
    } catch (err) {
      console.error('[downloadZip] failed to fetch documents:', err);
      return sendError(res, 'Failed to fetch documents', 500);
    }

    // Resolve each doc to a UNC path and collect missing/unreachable ones
    const toZip = [];   // { filePath, entryName }
    const missing = []; // ids that couldn't be resolved or reached

    const seenNames = new Map(); // track duplicate filenames inside the zip

    for (const id of ids) {
      const doc = docs.find((d) => d.doc_r_object_id === id);

      if (!doc || !doc.doc_file_path) {
        missing.push(id);
        continue;
      }

      const filePath = resolveNasPath(doc.doc_file_path);

      if (!filePath) {
        console.warn('[downloadZip] invalid doc_file_path for id', id, doc.doc_file_path);
        missing.push(id);
        continue;
      }

      const accessErr = await checkFileAccess(filePath);
      if (accessErr) {
        console.warn(`[downloadZip] skipping id ${id}: ${accessErr.message}`);
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
      console.warn('[downloadZip] skipped ids (not found/unreachable):', missing);
    }
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Validates and normalizes a UNC path coming from the DB.
 * Returns the normalized path, or null if it doesn't look like a
 * well-formed UNC path pointing at an expected share.
 *
 * NOTE: Node runs on Windows here, so UNC paths (\\server\share\...)
 * are used directly with fs/res.sendFile — no CIFS mount translation
 * is needed (that's only required on Linux).
 *
 * @param {string} dbPath - value of doc_file_path from the DB
 * @returns {string|null}
 */
function resolveNasPath(dbPath) {
  if (typeof dbPath !== 'string' || dbPath.trim() === '') {
    return null;
  }

  const normalized = path.normalize(dbPath);

  // Must be a UNC path: \\server\share\...
  if (!/^\\\\[^\\]+\\[^\\]+/.test(normalized)) {
    return null;
  }

  // Guard against path traversal sequences smuggled in via the DB value
  if (normalized.includes('..')) {
    return null;
  }

  return normalized;
}

/**
 * Checks whether a file is reachable/readable and returns a structured
 * error (with an appropriate HTTP status) if not. Distinguishes between
 * "file genuinely missing", "permission denied", and "NAS/network
 * unreachable" instead of collapsing everything into a generic 404.
 *
 * @param {string} filePath
 * @returns {Promise<{message: string, status: number}|null>} null if OK
 */
async function checkFileAccess(filePath) {
  try {
    await fs.promises.access(filePath, fs.constants.R_OK);
    return null;
  } catch (err) {
    switch (err.code) {
      case 'ENOENT':
        return { message: 'Document file missing on server', status: 404 };
      case 'EACCES':
      case 'EPERM':
        return { message: 'Access denied to document', status: 403 };
      case 'ENOTFOUND':
      case 'ETIMEDOUT':
      case 'ECONNRESET':
      case 'ENETUNREACH':
        console.error('[checkFileAccess] NAS unreachable:', filePath, err);
        return { message: 'Document storage unreachable', status: 503 };
      default:
        console.error('[checkFileAccess] unexpected fs error:', filePath, err);
        return { message: 'Failed to access document', status: 500 };
    }
  }
}

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