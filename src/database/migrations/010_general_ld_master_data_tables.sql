-- ============================================================
-- General and LD specific master data lookup tables
-- ============================================================

CREATE TABLE IF NOT EXISTS xoaf_general_form_company_code (
  id BIGSERIAL PRIMARY KEY,
  value VARCHAR(255) UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS xoaf_general_form_status (
  id BIGSERIAL PRIMARY KEY,
  value VARCHAR(255) UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS xoaf_general_form_category (
  id BIGSERIAL PRIMARY KEY,
  value VARCHAR(255) UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS xoaf_ld_form_order_type (
  id BIGSERIAL PRIMARY KEY,
  value VARCHAR(255) UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS xoaf_ld_form_clusters (
  id BIGSERIAL PRIMARY KEY,
  value VARCHAR(255) UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS xoaf_ld_form_company_code (
  id BIGSERIAL PRIMARY KEY,
  value VARCHAR(255) UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS xoaf_ld_form_company_name (
  id BIGSERIAL PRIMARY KEY,
  value VARCHAR(255) UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_xoaf_general_form_company_code_active ON xoaf_general_form_company_code (is_active);
CREATE INDEX IF NOT EXISTS idx_xoaf_general_form_status_active ON xoaf_general_form_status (is_active);
CREATE INDEX IF NOT EXISTS idx_xoaf_general_form_category_active ON xoaf_general_form_category (is_active);
CREATE INDEX IF NOT EXISTS idx_xoaf_ld_form_order_type_active ON xoaf_ld_form_order_type (is_active);
CREATE INDEX IF NOT EXISTS idx_xoaf_ld_form_clusters_active ON xoaf_ld_form_clusters (is_active);
CREATE INDEX IF NOT EXISTS idx_xoaf_ld_form_company_code_active ON xoaf_ld_form_company_code (is_active);
CREATE INDEX IF NOT EXISTS idx_xoaf_ld_form_company_name_active ON xoaf_ld_form_company_name (is_active);
