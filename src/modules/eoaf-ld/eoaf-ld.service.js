const { eoafQuery } = require('../../config/database');

const parseInteger = (value) => {
  if (value === undefined || value === null || value === '') return null;
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
};

const ALLOWED_COLUMNS = {
  r_object_id: 'r_object_id',
  file_ref_no: 'file_ref_no',
  ld_subject: 'ld_subject',
  form_status: 'form_status',
  company_code: 'company_code',
  approval_level: 'approval_level',
  clusters: 'clusters',
};

const buildWhereClause = (filters = {}) => {
  const conditions = [];
  const params = [];
  for (const [key, value] of Object.entries(filters)) {
    const column = ALLOWED_COLUMNS[key];
    if (!column || value === undefined || value === null || value === '') continue;
    params.push(value);
    conditions.push(`${column} = @p${params.length}`);
  }
  return { whereClause: conditions.length ? `WHERE ${conditions.join(' AND ')}` : '', params };
};

class EoafLdService {
  async searchForms({ page = 1, limit = 50, ...filters }) {
    const offset = (parseInteger(page) - 1) * parseInteger(limit);
    const formFilters = {
      r_object_id: filters.r_object_id,
      file_ref_no: filters.file_ref_no,
      ld_subject: filters.subject,
      form_status: filters.form_status,
      company_code: filters.company_code,
      approval_level: filters.approval_level,
      clusters: filters.clusters,
    };
    const { whereClause, params } = buildWhereClause(formFilters);

    const countResult = await eoafQuery(`SELECT COUNT(*) FROM xoaf_ld_form_s ${whereClause}`, params);
    const queryParams = [...params, parseInteger(limit), offset];
    const { rows } = await eoafQuery(
      `SELECT r_object_id, file_ref_no, ld_subject, company_code, approval_level, form_status, clusters
       FROM xoaf_ld_form_s ${whereClause}
       ORDER BY r_object_id DESC
       OFFSET @p${params.length + 1} ROWS FETCH NEXT @p${params.length + 2} ROWS ONLY`,
      queryParams
    );

    return { rows, total: parseInt(countResult.rows[0].count, 10) };
  }

  async getFormById(id) {
    const { rows } = await eoafQuery(
      'SELECT TOP 1 * FROM xoaf_ld_form_s WHERE r_object_id = @p1',
      [id]
    );
    return rows[0] || null;
  }

  async listEnclosuresByForm(formId, { page = 1, limit = 50 }) {
    const { rows, total } = await this.listEnclosures({
      page,
      limit,
      form_id: formId,
    });
    return { rows, total };
  }

  async listEnclosures({ page = 1, limit = 50, form_id, attachment_types }) {
    const offset = (parseInteger(page) - 1) * parseInteger(limit);
    const filters = { form_id, attachment_types };
    const { whereClause, params } = buildWhereClause(filters);

    const countResult = await eoafQuery(`SELECT COUNT(*) FROM xoaf_ld_enclosures_s ${whereClause}`, params);
    const queryParams = [...params, parseInteger(limit), offset];
    const { rows } = await eoafQuery(
      `SELECT * FROM xoaf_ld_enclosures_s ${whereClause} ORDER BY r_object_id ASC OFFSET @p${params.length + 1} ROWS FETCH NEXT @p${params.length + 2} ROWS ONLY`,
      queryParams
    );

    return { rows, total: parseInt(countResult.rows[0].count, 10) };
  }

  async getEnclosureById(id) {
    const { rows } = await eoafQuery(
      'SELECT TOP 1 * FROM xoaf_ld_enclosures_s WHERE r_object_id = @p1',
      [id]
    );
    return rows[0] || null;
  }

  async getFormDocument(formId) {
    const { rows } = await eoafQuery(
      'SELECT TOP 1 * FROM eoaf_file_path_s WHERE doc_r_object_id = @p1 ORDER BY i_vstamp DESC',
      [formId]
    );
    return rows[0] || null;
  }

  async getEnclosureDocument(enclosureId) {
    const { rows } = await eoafQuery(
      'SELECT TOP 1 * FROM eoaf_file_path_s WHERE doc_r_object_id = @p1 ORDER BY i_vstamp DESC',
      [enclosureId]
    );
    return rows[0] || null;
  }
}

module.exports = new EoafLdService();
