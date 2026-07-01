// master-data.validation.js

const { resourceConfig } = require('./master-data.config');
const { sendError } = require('../../utils/response');

/**
 * Ensures :resource in the URL is one we support, before anything else runs.
 * Without this, an unsupported resource falls through to the service layer
 * where it does get caught (_getConfig throws), but only after other
 * middleware/logic has already run.
 */
function validateResourceParam(req, res, next) {
  if (!resourceConfig[req.params.resource]) {
    return sendError(res, `Unsupported resource '${req.params.resource}'`, 400);
  }
  next();
}

/**
 * :id must be a positive integer. Previously an id like "abc" or "1; DROP"
 * would be passed straight to the DB driver as a bind parameter — not a SQL
 * injection risk (it's parameterized), but it produces an ugly raw
 * postgres/driver error instead of a clean 400.
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
 * Normalizes & validates page/limit/isActive query params up front so the
 * service layer can trust req.query instead of re-deriving safe defaults
 * from potentially NaN values (e.g. Math.max(1, parseInt('abc', 10)) is
 * NaN, not 1 — that NaN was previously flowing straight into LIMIT/OFFSET).
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
 * mode: 'create' (all required fields must be present) or 'update'
 * (fields are optional, but whatever is present must still be well-formed;
 * at least one recognized field must be present).
 */
function validateBody(mode) {
  return (req, res, next) => {
    const config = resourceConfig[req.params.resource];
    const body = req.body || {};
    const errors = [];

    // Companies accepts "isActive" in addition to its declared fields.
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

    // isActive is accepted on every resource, both camelCase and snake_case.
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