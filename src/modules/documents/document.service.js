const { eoafQuery } = require('../../config/database');
const logger = require('../../config/logger');

class DocumentService {
  /**
   * Fetch the file path record for any document object id.
   * Works for EOAF forms, enclosures, attachments — anything stored in
   * eoaf_file_path_s.
   *
   * NOTE: eoaf_file_path_s has NO version/timestamp column — there is no
   * i_vstamp or r_creation_date on this table. Actual columns are:
   *   r_object_id, i_partition, doc_file_path, doc_object_type,
   *   doc_r_object_id, doc_parent_object_id
   * If more than one row exists per doc_r_object_id, r_object_id is used
   * as a tie-breaker (highest value = most recently created, consistent
   * with Documentum's incrementing object id convention). Confirm with
   * the DB owner if a different "latest" definition is actually needed —
   * if doc_r_object_id is unique per row, this ordering has no effect.
   *
   * Also note: production DB is MSSQL, so this uses T-SQL syntax
   * (TOP instead of LIMIT) rather than the Postgres syntax used before.
   *
   * @param {string} docObjectId  — the doc_r_object_id to look up
   * @returns {object|null}       — row from eoaf_file_path_s, or null
   */
  /**
   * Fetch the file path record by its own row identifier, r_object_id.
   *
   * Unlike doc_r_object_id (which identifies the document/business object
   * and can theoretically have multiple mapping rows), r_object_id
   * uniquely identifies a single row in eoaf_file_path_s — it's the row's
   * own primary key. So no ORDER BY/tie-breaker is needed here; if this
   * assumption ever turns out to be wrong (duplicate r_object_id rows),
   * add the same ORDER BY r_object_id DESC pattern used below.
   *
   * @param {string} rObjectId  — the r_object_id to look up
   * @returns {object|null}     — row from eoaf_file_path_s, or null
   */
  async getByRObjectId(rObjectId) {
    const { rows } = await eoafQuery(
      `SELECT TOP 1 *
         FROM eoaf_file_path_s
        WHERE r_object_id = @p1`,
      [rObjectId]
    );
    return rows[0] || null;
  }

  async getByDocObjectId(docObjectId) {
    const { rows } = await eoafQuery(
      `SELECT TOP 1 *
         FROM eoaf_file_path_s
        WHERE doc_r_object_id = @p1
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
   * builds a numbered placeholder list (@p1, @p2, @p3 ...) for an IN clause,
   * and uses ROW_NUMBER() OVER (PARTITION BY ...) instead of Postgres's
   * DISTINCT ON to pick the latest row per id.
   *
   * @param {string[]} docObjectIds  — array of doc_r_object_id values
   * @returns {object[]}             — rows from eoaf_file_path_s (one per id)
   */
  async getManyByDocObjectIds(docObjectIds) {
    if (!docObjectIds.length) return [];

    const placeholders = docObjectIds.map((_, i) => `@p${i + 1}`).join(', ');

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

    const { rows } = await eoafQuery(sql, docObjectIds);
    return rows;
  }
}

module.exports = new DocumentService();