const { query } = require('../../config/database');
const logger = require('../../config/logger');

class DocumentService {
  /**
   * Fetch the file path record for any document object id.
   * Works for EOAF forms, enclosures, attachments — anything stored in
   * eoaf_file_path_s.
   *
   * Also note: production DB is MSSQL, so this uses T-SQL syntax
   * (TOP instead of LIMIT) rather than the Postgres syntax used before.
   *
   * @param {string} docObjectId  — the doc_r_object_id to look up
   * @returns {object|null}       — row from eoaf_file_path_s, or null
   */
  async getByDocObjectId(docObjectId) {
    const { rows } = await query(
      `SELECT TOP 1 *
         FROM eoaf_file_path_s
        WHERE doc_r_object_id = $1
        ORDER BY r_object_id DESC`,
      [docObjectId]
    );
    return rows[0] || null;
  }

  /**
   * Fetch the file path records for multiple document object ids in a
   * single query. Returns at most one row per id — the one with the
   * highest r_object_id if duplicates exist for a given doc_r_object_id.
   *
   * T-SQL has no ANY()/array parameter support like Postgres, so this
   * builds a numbered placeholder list ($1, $2, $3 ...) for an IN clause,
   * and uses ROW_NUMBER() OVER (PARTITION BY ...) instead of Postgres's
   * DISTINCT ON to pick the latest row per id.
   *
   * @param {string[]} docObjectIds  — array of doc_r_object_id values
   * @returns {object[]}             — rows from eoaf_file_path_s (one per id)
   */
  async getManyByDocObjectIds(docObjectIds) {
    if (!docObjectIds.length) return [];

    const placeholders = docObjectIds.map((_, i) => `$${i + 1}`).join(', ');

    const sql = `
      SELECT *
        FROM (
          SELECT *,
                 ROW_NUMBER() OVER (
                   PARTITION BY doc_r_object_id
                   ORDER BY r_object_id DESC
                 ) AS rn
            FROM eoaf_file_path_s
           WHERE doc_r_object_id IN (${placeholders})
        ) ranked
       WHERE rn = 1`;

    const { rows } = await query(sql, docObjectIds);
    return rows;
  }
}

module.exports = new DocumentService();