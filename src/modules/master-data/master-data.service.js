// master-data.service.js

const { authQuery } = require('../../config/database');
const { getConfig } = require('./master-data.config');
const { DocumentTypes, normalizeDocumentType } = require('../../enums/documentTypes');

const PG_UNIQUE_VIOLATION = '23505';
const DASHBOARD_METADATA_CONFIG = {
  [DocumentTypes.EOAF]: {
    objectType: 'xoaf_form',
    attributes: [
      { key: 'eoafType', table: 'xoaf_form_eoaf_type', valueColumn: 'value' },
      { key: 'companyCode', table: 'xoaf_form_company_code', valueColumn: 'value' },
      { key: 'clusters', table: 'xoaf_form_clusters', valueColumn: 'value' },
      { key: 'status', table: 'xoaf_form_status', valueColumn: 'value' },
      { key: 'processType', table: 'xoaf_form_process_type', valueColumn: 'value' },
      { key: 'budget', table: 'xoaf_form_budget', valueColumn: 'value' },
      { key: 'category', table: 'xoaf_form_category', valueColumn: 'value' },
      { key: 'soaClause', table: 'soa_clauses', valueColumn: 'name' },
    ],
  },
  [DocumentTypes.GENERAL]: {
    objectType: 'xoaf_general_form',
    attributes: [
      { key: 'companyCode', table: 'xoaf_general_form_company_code', valueColumn: 'value' },
      { key: 'status', table: 'xoaf_general_form_status', valueColumn: 'value' },
      { key: 'category', table: 'xoaf_general_form_category', valueColumn: 'value' },
    ],
  },
  [DocumentTypes.LD]: {
    objectType: 'xoaf_ld_form',
    attributes: [
      { key: 'orderType', table: 'xoaf_ld_form_order_type', valueColumn: 'value' },
      { key: 'clusters', table: 'xoaf_ld_form_clusters', valueColumn: 'value' },
      { key: 'companyCode', table: 'xoaf_ld_form_company_code', valueColumn: 'value' },
      { key: 'companyName', table: 'xoaf_ld_form_company_name', valueColumn: 'value' },
    ],
  },
};

class MasterDataService {
  async list(resource, queryParams = {}, documentType = null) {
    const config = getConfig(resource, documentType);
    // page/limit/isActive are already validated & normalized by
    // validateListQuery middleware before this is called.
    const page = queryParams.page;
    const limit = queryParams.limit;
    const isActiveFilter = queryParams.isActive;

    const whereClauses = [];
    const params = [];

    if (isActiveFilter !== undefined && isActiveFilter !== null && isActiveFilter !== '') {
      whereClauses.push(`is_active = $${params.length + 1}`);
      params.push(String(isActiveFilter).toLowerCase() === 'true');
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
    const countResult = await authQuery(`SELECT COUNT(*)::int AS total FROM ${config.table} ${whereSql}`, params);
    const offset = (page - 1) * limit;

    const { rows } = await authQuery(
      `SELECT ${config.selectClause} FROM ${config.table} ${whereSql} ORDER BY ${config.orderBy} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    );

    return {
      items: rows.map((row) => this._formatRow(resource, row, documentType)),
      total: countResult.rows[0].total,
      page,
      limit,
    };
  }

  async getById(resource, id, documentType = null) {
    const config = getConfig(resource, documentType);
    const { rows } = await authQuery(`SELECT ${config.selectClause} FROM ${config.table} WHERE id = $1`, [id]);

    if (rows.length === 0) {
      const error = new Error(`${config.label} not found`);
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }

    return this._formatRow(resource, rows[0], documentType);
  }

  async create(resource, payload, documentType = null) {
    const config = getConfig(resource, documentType);
    const normalizedPayload = this._normalizePayload(resource, payload, documentType);

    // Pre-check gives a friendly, fast-path error for the common case.
    // The DB's UNIQUE constraint (caught below) is the actual source of
    // truth and protects against the race where two requests pass this
    // check concurrently.
    await this._ensureUnique(resource, normalizedPayload, null, documentType);

    const columns = [];
    const placeholders = [];
    const params = [];

    for (const fieldName of Object.keys(config.fields)) {
      if (normalizedPayload[fieldName] !== undefined) {
        columns.push(fieldName);
        placeholders.push(`$${params.length + 1}`);
        params.push(normalizedPayload[fieldName].trim());
      }
    }

    if (normalizedPayload.isActive !== undefined) {
      columns.push('is_active');
      placeholders.push(`$${params.length + 1}`);
      params.push(normalizedPayload.isActive);
    }

    try {
      const { rows } = await authQuery(
        `INSERT INTO ${config.table} (${columns.join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING ${config.selectClause}`,
        params
      );
      return this._formatRow(resource, rows[0], documentType);
    } catch (err) {
      throw this._translateDbError(err, config);
    }
  }

  async update(resource, id, payload, documentType = null) {
    const config = getConfig(resource, documentType);
    const current = await this.getById(resource, id, documentType);
    const normalizedPayload = this._normalizePayload(resource, payload, documentType);

    if (Object.keys(normalizedPayload).length === 0) {
      const error = new Error('No fields to update');
      error.statusCode = 400;
      error.isOperational = true;
      throw error;
    }

    await this._ensureUnique(resource, normalizedPayload, id, documentType);

    const updates = [];
    const params = [];

    for (const fieldName of Object.keys(config.fields)) {
      if (normalizedPayload[fieldName] !== undefined) {
        updates.push(`${fieldName} = $${params.length + 1}`);
        params.push(normalizedPayload[fieldName].trim());
      }
    }

    if (normalizedPayload.isActive !== undefined) {
      updates.push(`is_active = $${params.length + 1}`);
      params.push(normalizedPayload.isActive);
    }

    if (updates.length === 0) {
      return current;
    }

    // Previously updated_at was never refreshed on UPDATE, so it stayed
    // frozen at creation time forever. Refresh it explicitly here.
    updates.push('updated_at = NOW()');

    params.push(id);
    try {
      const { rows } = await authQuery(
        `UPDATE ${config.table} SET ${updates.join(', ')} WHERE id = $${params.length} RETURNING ${config.selectClause}`,
        params
      );
      return this._formatRow(resource, rows[0], documentType);
    } catch (err) {
      throw this._translateDbError(err, config);
    }
  }

  /**
   * Soft-deactivates a record (sets is_active = false). This does not
   * delete the row — named/documented explicitly so API consumers aren't
   * surprised the record still exists and is still fetchable by id.
   */
  async deactivate(resource, id, documentType = null) {
    const config = getConfig(resource, documentType);
    const current = await this.getById(resource, id, documentType);
    const { rows } = await authQuery(
      `UPDATE ${config.table} SET is_active = false, updated_at = NOW() WHERE id = $1 RETURNING ${config.selectClause}`,
      [id]
    );

    return this._formatRow(resource, rows[0] || current, documentType);
  }

  async getDashboardMetaData(documentType = DocumentTypes.EOAF) {
    const config = this._getDashboardMetadataConfig(documentType);
    const queries = config.attributes.map(({ table, valueColumn }) =>
      authQuery(`SELECT ${valueColumn} FROM ${table} WHERE is_active = true ORDER BY ${valueColumn} ASC`)
    );
    const results = await Promise.all(queries);

    return {
      documentType: config.documentType,
      objectType: config.objectType,
      ...Object.fromEntries(
        config.attributes.map((attribute, index) => [
          attribute.key,
          results[index].rows.map((row) => row[attribute.valueColumn]),
        ])
      ),
    };
  }

  _getDashboardMetadataConfig(documentType = DocumentTypes.EOAF) {
    const normalizedDocumentType = normalizeDocumentType(documentType);
    const resolvedDocumentType = normalizedDocumentType || DocumentTypes.EOAF;
    const config = DASHBOARD_METADATA_CONFIG[resolvedDocumentType];

    if (!config) {
      const error = new Error(`Unsupported document type '${documentType}'`);
      error.statusCode = 400;
      error.isOperational = true;
      throw error;
    }

    return { documentType: resolvedDocumentType, ...config };
  }

  _normalizePayload(resource, payload = {}, documentType = null) {
    const config = getConfig(resource, documentType);
    const normalized = {};

    for (const fieldName of Object.keys(config.fields)) {
      if (payload[fieldName] !== undefined) {
        normalized[fieldName] = payload[fieldName];
      } else if (fieldName === 'value' && payload.name !== undefined) {
        normalized[fieldName] = payload.name;
      } else if (fieldName === 'name' && payload.value !== undefined) {
        normalized[fieldName] = payload.value;
      }
    }

    if (payload.isActive !== undefined) normalized.isActive = payload.isActive;
    if (payload.is_active !== undefined) normalized.isActive = payload.is_active;

    return normalized;
  }

  async _ensureUnique(resource, payload, id = null, documentType = null) {
    const config = getConfig(resource, documentType);

    if (resource === 'companies') {
      if (payload.code === undefined && payload.name === undefined) return;
      const { rows } = await authQuery(
        id === null
          ? 'SELECT id FROM companies WHERE (code IS NOT NULL AND LOWER(code) = LOWER($1)) OR (name IS NOT NULL AND LOWER(name) = LOWER($2))'
          : 'SELECT id FROM companies WHERE ((code IS NOT NULL AND LOWER(code) = LOWER($1)) OR (name IS NOT NULL AND LOWER(name) = LOWER($2))) AND id != $3',
        id === null
          ? [payload.code?.trim() ?? null, payload.name?.trim() ?? null]
          : [payload.code?.trim() ?? null, payload.name?.trim() ?? null, id]
      );

      if (rows.length > 0) {
        const error = new Error('A company with this code or name already exists');
        error.statusCode = 409;
        error.isOperational = true;
        throw error;
      }
      return;
    }

    const uniqueFieldName = Object.keys(config.fields).find((fieldName) => fieldName === 'value' || fieldName === 'name') || 'name';
    const uniqueValue = payload[uniqueFieldName] ?? payload.value ?? payload.name;

    if (uniqueValue === undefined) return;

    const { rows } = await authQuery(
      id === null
        ? `SELECT id FROM ${config.table} WHERE LOWER(${uniqueFieldName}) = LOWER($1)`
        : `SELECT id FROM ${config.table} WHERE LOWER(${uniqueFieldName}) = LOWER($1) AND id != $2`,
      id === null ? [String(uniqueValue).trim()] : [String(uniqueValue).trim(), id]
    );

    if (rows.length > 0) {
      const error = new Error(`${config.label} with this name already exists`);
      error.statusCode = 409;
      error.isOperational = true;
      throw error;
    }
  }

  /**
   * Converts a raw Postgres unique-violation into a clean 409 operational
   * error, so a race condition that slips past _ensureUnique's pre-check
   * still produces a friendly message instead of a generic 500.
   */
  _translateDbError(err, config) {
    if (err && err.code === PG_UNIQUE_VIOLATION) {
      const error = new Error(`${config.label} with this code or name already exists`);
      error.statusCode = 409;
      error.isOperational = true;
      return error;
    }
    return err;
  }

  _formatRow(resource, row, documentType = null) {
    const config = getConfig(resource, documentType);
    const base = {
      id: row.id,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };

    const fieldValues = {};
    for (const fieldName of Object.keys(config.fields)) {
      fieldValues[fieldName] = row[fieldName];
    }

    return { ...base, ...fieldValues };
  }
}

module.exports = new MasterDataService();