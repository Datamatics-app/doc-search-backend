// master-data.service.js

const { authQuery } = require('../../config/database');
const { getConfig, resourceConfig } = require('./master-data.config');

const PG_UNIQUE_VIOLATION = '23505';

class MasterDataService {
  async list(resource, queryParams = {}) {
    const config = getConfig(resource);
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
      items: rows.map((row) => this._formatRow(resource, row)),
      total: countResult.rows[0].total,
      page,
      limit,
    };
  }

  async getById(resource, id) {
    const config = getConfig(resource);
    const { rows } = await authQuery(`SELECT ${config.selectClause} FROM ${config.table} WHERE id = $1`, [id]);

    if (rows.length === 0) {
      const error = new Error(`${config.label} not found`);
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }

    return this._formatRow(resource, rows[0]);
  }

  async create(resource, payload) {
    const config = getConfig(resource);
    const normalizedPayload = this._normalizePayload(resource, payload);

    // Pre-check gives a friendly, fast-path error for the common case.
    // The DB's UNIQUE constraint (caught below) is the actual source of
    // truth and protects against the race where two requests pass this
    // check concurrently.
    await this._ensureUnique(resource, normalizedPayload);

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
      return this._formatRow(resource, rows[0]);
    } catch (err) {
      throw this._translateDbError(err, config);
    }
  }

  async update(resource, id, payload) {
    const config = getConfig(resource);
    const current = await this.getById(resource, id);
    const normalizedPayload = this._normalizePayload(resource, payload);

    if (Object.keys(normalizedPayload).length === 0) {
      const error = new Error('No fields to update');
      error.statusCode = 400;
      error.isOperational = true;
      throw error;
    }

    await this._ensureUnique(resource, normalizedPayload, id);

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
      return this._formatRow(resource, rows[0]);
    } catch (err) {
      throw this._translateDbError(err, config);
    }
  }

  /**
   * Soft-deactivates a record (sets is_active = false). This does not
   * delete the row — named/documented explicitly so API consumers aren't
   * surprised the record still exists and is still fetchable by id.
   */
  async deactivate(resource, id) {
    const config = getConfig(resource);
    const current = await this.getById(resource, id);
    const { rows } = await authQuery(
      `UPDATE ${config.table} SET is_active = false, updated_at = NOW() WHERE id = $1 RETURNING ${config.selectClause}`,
      [id]
    );

    return this._formatRow(resource, rows[0] || current);
  }

  async getDashboardMetaData() {
    const [companies, clusters, statuses, processTypes, soaClauses, eoafTypes] = await Promise.all([
      authQuery('SELECT code, name FROM companies WHERE is_active = true ORDER BY name ASC, code ASC'),
      authQuery('SELECT name FROM clusters WHERE is_active = true ORDER BY name ASC'),
      authQuery('SELECT name FROM statuses WHERE is_active = true ORDER BY name ASC'),
      authQuery('SELECT name FROM process_types WHERE is_active = true ORDER BY name ASC'),
      authQuery('SELECT name FROM soa_clauses WHERE is_active = true ORDER BY name ASC'),
      authQuery('SELECT name FROM eoaf_types WHERE is_active = true ORDER BY name ASC'),
    ]);

    return {
      companies: companies.rows.map((row) => ({ code: row.code, name: row.name })),
      clusters: clusters.rows.map((row) => row.name),
      statuses: statuses.rows.map((row) => row.name),
      processTypes: processTypes.rows.map((row) => row.name),
      soaClauses: soaClauses.rows.map((row) => row.name),
      eoafTypes: eoafTypes.rows.map((row) => row.name),
    };
  }

  _normalizePayload(resource, payload = {}) {
    const config = getConfig(resource);
    const normalized = {};

    for (const fieldName of Object.keys(config.fields)) {
      if (payload[fieldName] !== undefined) normalized[fieldName] = payload[fieldName];
    }

    if (payload.isActive !== undefined) normalized.isActive = payload.isActive;
    if (payload.is_active !== undefined) normalized.isActive = payload.is_active;

    return normalized;
  }

  async _ensureUnique(resource, payload, id = null) {
    const config = getConfig(resource);

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

    if (payload.name === undefined) return;

    const { rows } = await authQuery(
      id === null
        ? `SELECT id FROM ${config.table} WHERE LOWER(name) = LOWER($1)`
        : `SELECT id FROM ${config.table} WHERE LOWER(name) = LOWER($1) AND id != $2`,
      id === null ? [payload.name.trim()] : [payload.name.trim(), id]
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

  _formatRow(resource, row) {
    const config = getConfig(resource);
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