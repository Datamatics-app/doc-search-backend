const { eoafQuery } = require('../../config/database');

const parseInteger = (value) => {
  if (value === undefined || value === null || value === '') return null;
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
};

const ALLOWED_FORM_COLUMNS = {
  r_object_id: 'r_object_id',
  memo_no: 'memo_no',
  subject: 'c_subject',
  status: 'status',
  category: 'category',
  budget: 'budget',
  company_code_desc: 'company_code_desc',
  clusters: 'clusters',
};

const ALLOWED_ATTACHMENT_COLUMNS = {
  form_id: 'form_id',
  type: 'enclosure_documents',
};

const buildWhereClause = (filters = {}, allowedColumns) => {
  const conditions = [];
  const params = [];
  for (const [key, value] of Object.entries(filters)) {
    const column = allowedColumns[key];
    if (!column || value === undefined || value === null || value === '') continue;
    params.push(value);
    conditions.push(`${column} = $${params.length}`);
  }
  return { whereClause: conditions.length ? `WHERE ${conditions.join(' AND ')}` : '', params };
};

class EoafGeneralService {
  // Main search for General forms
  async searchForms({ page = 1, limit = 50, ...filters }) {
    const offset = (parseInteger(page) - 1) * parseInteger(limit);

    const formFilters = {
      r_object_id: filters.r_object_id,
      memo_no: filters.memo_no,
      subject: filters.subject,
      status: filters.status,
      category: filters.category,
      budget: filters.budget,
      company_code_desc: filters.company_code_desc,
      clusters: filters.clusters,
    };
    const { whereClause, params } = buildWhereClause(formFilters, ALLOWED_FORM_COLUMNS);

    const countResult = await eoafQuery(`SELECT COUNT(*) FROM xoaf_general_form_s ${whereClause}`, params);
    const { rows } = await eoafQuery(
      `SELECT r_object_id, memo_no, c_subject, category, sub_category, budget, budget_type,
              status, prepared_by, prepared_date, company_code_desc, clusters
       FROM xoaf_general_form_s ${whereClause}
       ORDER BY r_object_id DESC
       LIMIT $${params.length + 1}
       OFFSET $${params.length + 2}`,
      [...params, parseInteger(limit), offset]
    );

    return { rows, total: parseInt(countResult.rows[0].count, 10) };
  }

  async getFormById(id) {
    const { rows } = await eoafQuery(
      'SELECT * FROM xoaf_general_form_s WHERE r_object_id = $1 LIMIT 1',
      [id]
    );
    return rows[0] || null;
  }

  // Attachments for a specific form
  async listAttachmentsByForm(formId, { page = 1, limit = 50 }) {
    const { rows, total } = await this.listAttachments({
      page, limit, form_id: formId,
    });
    return { rows, total };
  }

  async listAttachments({ page = 1, limit = 50, form_id, type }) {
    const offset = (parseInteger(page) - 1) * parseInteger(limit);
    const filters = { form_id, type };
    const { whereClause, params } = buildWhereClause(filters, ALLOWED_ATTACHMENT_COLUMNS);

    const countResult = await eoafQuery(`SELECT COUNT(*) FROM xoaf_attachments_s ${whereClause}`, params);
    const { rows } = await eoafQuery(
      `SELECT * FROM xoaf_attachments_s ${whereClause} ORDER BY r_object_id ASC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, parseInteger(limit), offset]
    );

    return { rows, total: parseInt(countResult.rows[0].count, 10) };
  }

  async getAttachmentById(id) {
    const { rows } = await eoafQuery(
      'SELECT * FROM xoaf_attachments_s WHERE r_object_id = $1 LIMIT 1',
      [id]
    );
    return rows[0] || null;
  }

  // Document retrieval (shared eoaf_file_path_s table)
  async getFormDocument(formId) {
    const { rows } = await eoafQuery(
      'SELECT * FROM eoaf_file_path_s WHERE doc_r_object_id = $1 ORDER BY i_vstamp DESC LIMIT 1',
      [formId]
    );
    return rows[0] || null;
  }

  async getAttachmentDocument(attachmentId) {
    const { rows } = await eoafQuery(
      'SELECT * FROM eoaf_file_path_s WHERE doc_r_object_id = $1 ORDER BY i_vstamp DESC LIMIT 1',
      [attachmentId]
    );
    return rows[0] || null;
  }
}

module.exports = new EoafGeneralService();