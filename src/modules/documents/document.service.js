const { query } = require('../../config/database');

class DocumentService {
  /**
   * Fetch the latest source file path record for any document object id.
   * Works for EOAF forms, enclosures, attachments — anything stored in
   * source_file_path_s.
   *
   * @param {string} docObjectId  — the doc_r_object_id to look up
   * @returns {object|null}       — row from source_file_path_s, or null
   */
  async getByDocObjectId(docObjectId) {
    const { rows } = await query(
      `SELECT *
         FROM source_file_path_s
        WHERE doc_r_object_id = $1
        ORDER BY i_vstamp DESC
        LIMIT 1`,
      [docObjectId]
    );
    return rows[0] || null;
  }

  /**
   * Fetch the latest source file path records for multiple document object ids
   * in a single query.
   *
   * @param {string[]} docObjectIds  — array of doc_r_object_id values
   * @returns {object[]}             — rows from source_file_path_s (one per id)
   */
  async getManyByDocObjectIds(docObjectIds) {
    if (!docObjectIds.length) return [];

    // Use DISTINCT ON to get the latest vstamp row per doc_r_object_id
    const { rows } = await query(
      `SELECT DISTINCT ON (doc_r_object_id) *
         FROM source_file_path_s
        WHERE doc_r_object_id = ANY($1::text[])
        ORDER BY doc_r_object_id, i_vstamp DESC`,
      [docObjectIds]
    );
    return rows;
  }
}

module.exports = new DocumentService();