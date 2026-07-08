-- ============================================================
-- EOAF-specific master data lookup tables
-- ============================================================

CREATE TABLE IF NOT EXISTS xoaf_form_eoaf_type (
  id BIGSERIAL PRIMARY KEY,
  value VARCHAR(255) UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS xoaf_form_company_code (
  id BIGSERIAL PRIMARY KEY,
  value VARCHAR(255) UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS xoaf_form_clusters (
  id BIGSERIAL PRIMARY KEY,
  value VARCHAR(255) UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS xoaf_form_status (
  id BIGSERIAL PRIMARY KEY,
  value VARCHAR(255) UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS xoaf_form_process_type (
  id BIGSERIAL PRIMARY KEY,
  value VARCHAR(255) UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS xoaf_form_budget (
  id BIGSERIAL PRIMARY KEY,
  value VARCHAR(255) UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS xoaf_form_category (
  id BIGSERIAL PRIMARY KEY,
  value VARCHAR(255) UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS xoaf_form_soa_clauses (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_xoaf_form_eoaf_type_active ON xoaf_form_eoaf_type (is_active);
CREATE INDEX IF NOT EXISTS idx_xoaf_form_company_code_active ON xoaf_form_company_code (is_active);
CREATE INDEX IF NOT EXISTS idx_xoaf_form_clusters_active ON xoaf_form_clusters (is_active);
CREATE INDEX IF NOT EXISTS idx_xoaf_form_status_active ON xoaf_form_status (is_active);
CREATE INDEX IF NOT EXISTS idx_xoaf_form_process_type_active ON xoaf_form_process_type (is_active);
CREATE INDEX IF NOT EXISTS idx_xoaf_form_budget_active ON xoaf_form_budget (is_active);
CREATE INDEX IF NOT EXISTS idx_xoaf_form_category_active ON xoaf_form_category (is_active);
CREATE INDEX IF NOT EXISTS idx_xoaf_form_soa_clauses_active ON xoaf_form_soa_clauses (is_active);
