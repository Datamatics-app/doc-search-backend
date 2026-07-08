// master-data.validation.js

const { documentTypeResourceConfig, resolveConfigParams } = require('./master-data.config');
const { sendError } = require('../../utils/response');

/**
 * Ensures :documentType and :resource in the URL are one we support.
 */
function validateResourceParam(req, res, next) {
  const documentType = req.params.documentType;
  const resource = req.params.resource;

  if (!documentType || !resource) {
    return sendError(res, 'Document type and resource are required', 400);
  }

  const { normalizedDocumentType, normalizedResource } = resolveConfigParams(resource, documentType);
  if (!normalizedDocumentType) {
    return sendError(res, `Unsupported document type '${documentType}'`, 400);
  }

  if (!normalizedResource) {
    return sendError(res, `Unsupported resource '${resource}' for document type '${documentType}'`, 400);
  }

  const config = documentTypeResourceConfig[normalizedDocumentType]?.[normalizedResource];
  if (!config) {
    return sendError(res, `Unsupported resource '${resource}' for document type '${documentType}'`, 400);
  }

  req.params.documentType = normalizedDocumentType;
  req.params.resource = normalizedResource;
  next();
}

/**
 * :id must be a positive integer.
 */
function validateIdParam(req, res, next) {
  const id = req.params.id;
  if (!/^\d+$/.test(String(id))) {
    return sendError(res, 'Invalid id: must be a positive integer', 400);
  }
  req.params.id = Number(id);
  next();
}

/**
 * Normalizes & validates page/limit/isActive query params up front.
 */
function validateListQuery(req, res, next) {
  const rawPage = req.query.page;
  const rawLimit = req.query.limit;

  let page = 1;
  if (rawPage !== undefined) {
    page = parseInt(rawPage, 10);
    if (!Number.isInteger(page) || String(rawPage).trim() === '' || page < 1) {
      return sendError(res, 'Invalid page: must be a positive integer', 400);
    }
  }

  let limit = 20;
  if (rawLimit !== undefined) {
    limit = parseInt(rawLimit, 10);
    if (!Number.isInteger(limit) || String(rawLimit).trim() === '' || limit < 1) {
      return sendError(res, 'Invalid limit: must be a positive integer', 400);
    }
    limit = Math.min(100, limit);
  }

  if (req.query.isActive !== undefined && req.query.isActive !== '') {
    const normalized = String(req.query.isActive).toLowerCase();
    if (normalized !== 'true' && normalized !== 'false') {
      return sendError(res, "Invalid isActive: must be 'true' or 'false'", 400);
    }
  }

  req.query.page = page;
  req.query.limit = limit;
  next();
}

function isPlainString(value) {
  return typeof value === 'string';
}

/**
 * Validates req.body against the resource's field config.
 */
function validateBody(mode) {
  return (req, res, next) => {
    const documentType = req.params.documentType;
    const resource = req.params.resource;
    const { normalizedDocumentType, normalizedResource } = resolveConfigParams(resource, documentType);
    const config = normalizedDocumentType && normalizedResource ? documentTypeResourceConfig[normalizedDocumentType]?.[normalizedResource] : null;
    const body = req.body || {};
    const errors = [];

    if (!config) {
      return sendError(res, `Unsupported resource '${resource}' for document type '${documentType}'`, 400);
    }

    const fieldNames = Object.keys(config.fields);
    let sawRecognizedField = false;

    for (const fieldName of fieldNames) {
      const rule = config.fields[fieldName];
      const value = body[fieldName];
      const present = value !== undefined && value !== null;

      if (present) sawRecognizedField = true;

      if (!present) {
        if (mode === 'create' && rule.required) {
          errors.push(`${fieldName} is required`);
        }
        continue;
      }

      if (rule.type === 'string') {
        if (!isPlainString(value)) {
          errors.push(`${fieldName} must be a string`);
          continue;
        }
        const trimmed = value.trim();
        if (rule.required && trimmed.length === 0) {
          errors.push(`${fieldName} cannot be empty`);
        }
        if (rule.maxLength && trimmed.length > rule.maxLength) {
          errors.push(`${fieldName} must be at most ${rule.maxLength} characters`);
        }
      }
    }

    const isActiveRaw = body.isActive !== undefined ? body.isActive : body.is_active;
    if (isActiveRaw !== undefined) {
      sawRecognizedField = true;
      if (typeof isActiveRaw !== 'boolean') {
        errors.push('isActive must be a boolean');
      }
    }

    if (mode === 'update' && !sawRecognizedField) {
      errors.push('At least one field must be provided to update');
    }

    if (errors.length > 0) {
      return sendError(res, errors.join('; '), 400);
    }

    next();
  };
}

module.exports = {
  validateResourceParam,
  validateIdParam,
  validateListQuery,
  validateBody,
};