// eoaf.service.js
const { query, withTransaction } = require('../../config/database');

const parseInteger = (value) => {
  if (value === undefined || value === null || value === '') return null;
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
};


const buildWhereClause = (filters = {}) => {
  const conditions = [];
  const params     = [];

  const addParam = (value) => {
    params.push(value);
    return `$${params.length}`;
  };

  // ── Exact-match filters ───────────────────────────────────────────────────

  // Subject  (xoaf_form_s.eoaf_subject)  — partial match for usability
  if (filters.eoaf_subject) {
    conditions.push(`f.eoaf_subject ILIKE ${addParam(`%${filters.eoaf_subject}%`)}`);
  }

  // OAF Number  (xoaf_form_s.oaf_num)  — partial match
  if (filters.oaf_num) {
    conditions.push(`f.oaf_num ILIKE ${addParam(`%${filters.oaf_num}%`)}`);
  }

  // Status (exact)
  if (filters.status) {
    conditions.push(`f.status = ${addParam(filters.status)}`);
  }

  // ── Initiation Date range 
  if (filters.initiation_date_from) {
    conditions.push(`f.initiation_date >= ${addParam(filters.initiation_date_from)}`);
  }
  if (filters.initiation_date_to) {
    // Include the full end day by going to end-of-day
    conditions.push(`f.initiation_date <= ${addParam(filters.initiation_date_to + ' 23:59:59')}`);
  }

  // ── Created Date range 
  if (filters.created_from) {
    conditions.push(`s.r_creation_date >= ${addParam(filters.created_from)}`);
  }
  if (filters.created_to) {
    conditions.push(`s.r_creation_date <= ${addParam(filters.created_to + ' 23:59:59')}`);
  }

  return {
    whereClause: conditions.length ? `WHERE ${conditions.join(' AND ')}` : '',
    params,
  };
};


const BASE_JOIN = `
  FROM xoaf_form_s f
  LEFT JOIN dm_sysobject_s s ON s.r_object_id = f.r_object_id
`;

// columns (all aliased for clarity)
const SEARCH_SELECT = `
  f.r_object_id,
  f.eoaf_subject,
  f.clusters,
  f.oaf_num,
  f.eoaf_type,
  f.process_type,
  f.company_code,
  f.budget,
  f.soa_clause,
  f.total_comm_incl_contigency,
  f.status,
  f.initiation_date,
  s.owner_name,
  s.r_creation_date
`;

class EoafService {

  // Response columns returned in SEARCH_SELECT above.
  async searchForms({ page = 1, limit = 50, ...filters }) {
    const offset = (parseInteger(page) - 1) * parseInteger(limit);
    const { whereClause, params } = buildWhereClause(filters);

    const countResult = await query(
      `SELECT COUNT(*) AS count ${BASE_JOIN} ${whereClause}`,
      params
    );

    const { rows } = await query(
      `SELECT ${SEARCH_SELECT}
       ${BASE_JOIN}
       ${whereClause}
       ORDER BY f.r_object_id DESC
       LIMIT  $${params.length + 1}
       OFFSET $${params.length + 2}`,
      [...params, parseInteger(limit), offset]
    );

    // COUNT alias works for both pg and mssql after explicit AS count
    const total = parseInt(countResult.rows[0]?.count ?? countResult.rows[0]?.COUNT ?? 0, 10);

    return { rows, total };
  }

  // Get Single Form (full detail)
  async getFormById(id) {
    const { rows } = await query(
      `SELECT f.*, s.owner_name, s.r_creation_date, s.r_modify_date, s.r_modifier
       ${BASE_JOIN}
       WHERE f.r_object_id = $1
       LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  }

  // Enclosures 
  async listEnclosuresByForm(formId, { page = 1, limit = 50 }) {
    const offset = (parseInteger(page) - 1) * parseInteger(limit);

  // COUNT query stays the same
    const countResult = await query(
      `SELECT COUNT(*) AS count FROM xoaf_enclosure_s WHERE form_id = $1`,
      [formId]
    );

    const { rows } = await query(
      `SELECT 
        e.*,
        fp.doc_file_path,
        s.owner_name       AS created_by,
        s.r_creation_date  AS created_on
      FROM xoaf_enclosure_s e
      LEFT JOIN (
      SELECT 
        doc_r_object_id,
        doc_file_path,
        ROW_NUMBER() OVER (
          PARTITION BY doc_r_object_id 
          ORDER BY i_vstamp DESC   -- picks the latest vstamp row
        ) AS rn
      FROM source_file_path_s
    ) fp 
      ON fp.doc_r_object_id = e.r_object_id 
      AND fp.rn = 1                -- only the max vstamp row
      LEFT JOIN dm_sysobject_s s ON s.r_object_id = e.form_id
      WHERE e.form_id = $1
      ORDER BY e.r_object_id ASC
      LIMIT $2 OFFSET $3`,
      [formId, parseInteger(limit), offset]
    );

    const total = parseInt(
      countResult.rows[0]?.count ?? countResult.rows[0]?.COUNT ?? 0,
      10
    );

    const enriched = rows.map(row => ({
      ...row,
      file_name: row.doc_file_path
        ? row.doc_file_path.split(/[\\/]/).pop()
        : null,
      doc_file_path: undefined
    }));

    return { rows: enriched, total };
  }

  async getEnclosureById(id) {
    const { rows } = await query(
      'SELECT * FROM xoaf_enclosure_s WHERE r_object_id = $1 LIMIT 1',
      [id]
    );
    return rows[0] || null;
  }

  // ── Documents ──────────────────────────────────────────────────────────────
  async getFormDocument(formId) {
    const { rows } = await query(
      `SELECT * FROM source_file_path_s
       WHERE doc_r_object_id = $1
       ORDER BY i_vstamp DESC
       LIMIT 1`,
      [formId]
    );
    return rows[0] || null;
  }

  async getEnclosureDocument(enclosureId) {
    const { rows } = await query(
      `SELECT * FROM source_file_path_s
       WHERE doc_r_object_id = $1
       ORDER BY i_vstamp DESC
       LIMIT 1`,
      [enclosureId]
    );
    return rows[0] || null;
  }

  async getDocumentById(id) {
    const { rows } = await query(
      `SELECT * FROM source_file_path_s WHERE doc_r_object_id = $1 LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  }
}

module.exports = new EoafService();
