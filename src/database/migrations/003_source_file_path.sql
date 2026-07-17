-- ============================================================
-- Source file path mapping table
-- ============================================================

CREATE TABLE IF NOT EXISTS eoaf_file_path_s (
  r_object_id CHAR(16) NOT NULL,
  doc_file_path VARCHAR(255),
  doc_r_object_id VARCHAR(16),
  doc_parent_object_id INTEGER,
);

CREATE INDEX IF NOT EXISTS idx_source_file_path_r_object_id ON eoaf_file_path_s(r_object_id);
CREATE INDEX IF NOT EXISTS idx_source_file_path_doc_r_object_id ON eoaf_file_path_s(doc_r_object_id);
CREATE INDEX IF NOT EXISTS idx_source_file_path_doc_parent_object_id ON eoaf_file_path_s(doc_parent_object_id);
