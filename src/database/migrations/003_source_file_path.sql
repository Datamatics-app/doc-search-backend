-- ============================================================
-- Source file path mapping table
-- ============================================================

CREATE TABLE IF NOT EXISTS source_file_path_s (
  r_object_id CHAR(16) NOT NULL,
  i_is_replica SMALLINT NOT NULL DEFAULT 0,
  i_vstamp INTEGER NOT NULL DEFAULT 0,
  doc_file_path VARCHAR(255),
  doc_r_object_id VARCHAR(16)
);

CREATE INDEX IF NOT EXISTS idx_source_file_path_r_object_id ON source_file_path_s(r_object_id);
CREATE INDEX IF NOT EXISTS idx_source_file_path_doc_r_object_id ON source_file_path_s(doc_r_object_id);
