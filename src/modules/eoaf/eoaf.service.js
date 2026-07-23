// eoaf.service.js
const { eoafQuery } = require('../../config/database');

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
    return `@p${params.length}`;
  };

  // ── Exact-match filters ───────────────────────────────────────────────────

  // Subject  (xoaf_form_s.eoaf_subject)  — partial match for usability
  if (filters.eoaf_subject) {
    conditions.push(`f.eoaf_subject LIKE ${addParam(`%${filters.eoaf_subject}%`)}`);
  }

  // OAF Number  (xoaf_form_s.oaf_num)  — partial match
  if (filters.oaf_num) {
    conditions.push(`f.oaf_num LIKE ${addParam(`%${filters.oaf_num}%`)}`);
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
  f.oaf_num,
  f.file_ref_no,
  f.eoaf_subject,
  f.eoaf_type,
  f.process_type,
  f.company_code,
  f.department,
  f.budget,
  f.soa_clause,
  f.soa_value,
  f.total_comm_incl_contigency,
  f.initiation_date,
  f.total_negotiated_savings_pe,
  f.total_negotiated_savings_rs,
  f.capex_fy,
  f.status,
  f.negotiation_saving_fcg,
  f.clusters,

  -- Approval chain: initiator stage
  f.eval_cc, f.eval_cc_approval_date, f.eval_cc_grade, f.eval_cc_position,
  f.eval_intender, f.eval_intender_approval_date, f.eval_intender_grade, f.eval_intender_position,
  f.eval_fcg, f.eval_fcg_approval_date, f.eval_fcg_grade, f.eval_fcg_position,

  -- Approval chain: reviewer stage
  f.checker_cc, f.checker_cc_approval_date, f.checker_cc_grade, f.checker_cc_position,
  f.checker_fcg, f.checker_fcg_approval_date, f.checker_fcg_grade, f.checker_fcg_position,
  f.checker_intender, f.checker_intender_app_date, f.checker_intender_grade, f.checker_intender_position,

  -- Approval chain: approver stage
  f.approver1, f.approver1_approval_date, f.approver1_grade, f.approver_1_position,
  f.final_approver, f.final_approver_app_date, f.final_approver_grade, f.final_approver_position,

  s.owner_name,
  s.r_creation_date
`;

class EoafService {

  // Response columns returned in SEARCH_SELECT above.
  async searchForms({ page = 1, limit = 50, ...filters }) {
    const offset = (parseInteger(page) - 1) * parseInteger(limit);
    const { whereClause, params } = buildWhereClause(filters);

    const countResult = await eoafQuery(
      `SELECT COUNT(*) AS count ${BASE_JOIN} ${whereClause}`,
      params
    );

    const queryParams = [...params, parseInteger(limit), offset];
    const { rows } = await eoafQuery(
      `SELECT ${SEARCH_SELECT}
       ${BASE_JOIN}
       ${whereClause}
       ORDER BY f.r_object_id DESC
       OFFSET @p${params.length + 1} ROWS FETCH NEXT @p${params.length + 2} ROWS ONLY`,
      queryParams
    );

    // COUNT alias uses an explicit AS count so the result shape is consistent for MSSQL.
    const total = parseInt(countResult.rows[0]?.count ?? countResult.rows[0]?.COUNT ?? 0, 10);

    return { rows, total };
  }

  // Get Single Form (full detail)
  async getFormById(id) {
    const { rows } = await eoafQuery(
      `SELECT TOP 1 f.*, s.owner_name, s.r_creation_date, s.r_modify_date, s.r_modifier
       ${BASE_JOIN}
       WHERE f.r_object_id = @p1`,
      [id]
    );
    return rows[0] || null;
  }

  // Enclosures 
  async listEnclosuresByForm(formId, { page = 1, limit = 50 }) {
    const offset = (parseInteger(page) - 1) * parseInteger(limit);

  // COUNT query stays the same
    const countResult = await eoafQuery(
      `SELECT COUNT(*) AS count FROM xoaf_enclosure_s WHERE form_id = @p1`,
      [formId]
    );

    const { rows } = await eoafQuery(
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
      FROM eoaf_file_path_s
    ) fp 
      ON fp.doc_r_object_id = e.r_object_id 
      AND fp.rn = 1                -- only the max vstamp row
      LEFT JOIN dm_sysobject_s s ON s.r_object_id = e.form_id
      WHERE e.form_id = @p1
      ORDER BY e.r_object_id ASC
      OFFSET @p2 ROWS FETCH NEXT @p3 ROWS ONLY`,
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
    const { rows } = await eoafQuery(
      'SELECT TOP 1 * FROM xoaf_enclosure_s WHERE r_object_id = @p1',
      [id]
    );
    return rows[0] || null;
  }

  // ── Documents ──────────────────────────────────────────────────────────────
  async getFormDocument(formId) {
    const { rows } = await eoafQuery(
      `SELECT TOP 1 * FROM eoaf_file_path_s
       WHERE doc_r_object_id = @p1
       ORDER BY i_vstamp DESC`,
      [formId]
    );
    return rows[0] || null;
  }

  async getEnclosureDocument(enclosureId) {
    const { rows } = await eoafQuery(
      `SELECT TOP 1 * FROM eoaf_file_path_s
       WHERE doc_r_object_id = @p1
       ORDER BY i_vstamp DESC`,
      [enclosureId]
    );
    return rows[0] || null;
  }

  async getDocumentById(id) {
    const { rows } = await eoafQuery(
      `SELECT TOP 1 * FROM eoaf_file_path_s WHERE doc_r_object_id = @p1`,
      [id]
    );
    return rows[0] || null;
  }
}

module.exports = new EoafService();
