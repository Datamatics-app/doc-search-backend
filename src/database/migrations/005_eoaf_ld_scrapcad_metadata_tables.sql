-- ============================================================
-- EOAF LD and Scrap/CAD metadata tables for PostgreSQL
-- ============================================================

CREATE TABLE IF NOT EXISTS xoaf_ld_form_s (
  r_object_id CHAR(16) NOT NULL,
  i_partition INTEGER,
  discussions_and_agreement VARCHAR(4000) NOT NULL,
  approval2_date_time TIMESTAMP WITH TIME ZONE NOT NULL,
  approver4 VARCHAR(125) NOT NULL,
  approver3 VARCHAR(125) NOT NULL,
  file_ref_no VARCHAR(64) NOT NULL,
  special_comments VARCHAR(4000) NOT NULL,
  approver2 VARCHAR(125) NOT NULL,
  approver1 VARCHAR(125) NOT NULL,
  oaf_no VARCHAR(64) NOT NULL,
  form_status VARCHAR(64) NOT NULL,
  back_ground_of_the_package_ VARCHAR(4000) NOT NULL,
  approval_level INTEGER NOT NULL,
  approval3_date_time TIMESTAMP WITH TIME ZONE NOT NULL,
  unique_id VARCHAR(64) NOT NULL,
  approval1_date_time TIMESTAMP WITH TIME ZONE NOT NULL,
  ld_subject VARCHAR(500) NOT NULL,
  company_name VARCHAR(125) NOT NULL,
  approver5 VARCHAR(125) NOT NULL,
  approver6 VARCHAR(125) NOT NULL,
  query_raised SMALLINT NOT NULL,
  initiator_approval_date_tim TIMESTAMP WITH TIME ZONE NOT NULL,
  po_criteria VARCHAR(64) NOT NULL,
  package_name VARCHAR(500) NOT NULL,
  approval6_date_time TIMESTAMP WITH TIME ZONE NOT NULL,
  oaf_date TIMESTAMP WITH TIME ZONE NOT NULL,
  approval4_date_time TIMESTAMP WITH TIME ZONE NOT NULL,
  contractual_ld_clause VARCHAR(4000) NOT NULL,
  category VARCHAR(64),
  proposal_to_management_for_ VARCHAR(4000),
  initiator VARCHAR(125),
  approval5_date_time TIMESTAMP WITH TIME ZONE,
  delay_analysis_in_brief VARCHAR(4000),
  project_plant_name VARCHAR(500),
  order_type VARCHAR(64),
  package_value_total DOUBLE PRECISION,
  reviewer3_approval_date TIMESTAMP WITH TIME ZONE,
  reviewer2_approval_date TIMESTAMP WITH TIME ZONE,
  approver3_designation VARCHAR(256),
  company_code VARCHAR(256),
  reviewer1_approval_date TIMESTAMP WITH TIME ZONE,
  reviewer5_approval_date TIMESTAMP WITH TIME ZONE,
  approver5_designation VARCHAR(256),
  approver6_designation VARCHAR(256),
  modify_it SMALLINT,
  reviewer4_approval_date TIMESTAMP WITH TIME ZONE,
  approver4_designation VARCHAR(256),
  approver1_designation VARCHAR(256),
  approver2_designation VARCHAR(256),
  department_description VARCHAR(256),
  department_code VARCHAR(125),
  reviewer2_designation VARCHAR(256),
  reviewer4_designation VARCHAR(256),
  reviewer1_designation VARCHAR(256),
  reviewer3_designation VARCHAR(256),
  reviewer5_designation VARCHAR(256),
  clusters VARCHAR(255)
);

CREATE INDEX IF NOT EXISTS idx_xoaf_ld_form_s_r_object_id ON xoaf_ld_form_s(r_object_id);
CREATE INDEX IF NOT EXISTS idx_xoaf_ld_form_s_file_ref_no ON xoaf_ld_form_s(file_ref_no);
CREATE INDEX IF NOT EXISTS idx_xoaf_ld_form_s_form_status ON xoaf_ld_form_s(form_status);
CREATE INDEX IF NOT EXISTS idx_xoaf_ld_form_s_company_code ON xoaf_ld_form_s(company_code);
CREATE INDEX IF NOT EXISTS idx_xoaf_ld_form_s_clusters ON xoaf_ld_form_s(clusters);

CREATE TABLE IF NOT EXISTS xoaf_ld_form_r (
  r_object_id CHAR(16) NOT NULL,
  i_position SMALLINT NOT NULL,
  i_partition INTEGER,
  reviewed_by VARCHAR(125),
  sap_po_no VARCHAR(64),
  reviewers VARCHAR(125),
  approved_by VARCHAR(125),
  po_value INTEGER,
  reviewer_hod_designation VARCHAR(256),
  reviewer_hod_s VARCHAR(256),
  reviewer_designation VARCHAR(256)
);

CREATE INDEX IF NOT EXISTS idx_xoaf_ld_form_r_r_object_id ON xoaf_ld_form_r(r_object_id);
CREATE INDEX IF NOT EXISTS idx_xoaf_ld_form_r_i_partition ON xoaf_ld_form_r(i_partition);
CREATE INDEX IF NOT EXISTS idx_xoaf_ld_form_r_i_position ON xoaf_ld_form_r(i_position);

CREATE TABLE IF NOT EXISTS xoaf_ld_enclosures_s (
  r_object_id CHAR(16) NOT NULL,
  i_partition INTEGER,
  attachment_types VARCHAR(64) NOT NULL,
  related_memo_id VARCHAR(64) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_xoaf_ld_enclosures_s_r_object_id ON xoaf_ld_enclosures_s(r_object_id);
CREATE INDEX IF NOT EXISTS idx_xoaf_ld_enclosures_s_related_memo_id ON xoaf_ld_enclosures_s(related_memo_id);

CREATE TABLE IF NOT EXISTS xoaf_scrapcad_form_s (
  r_object_id CHAR(16) NOT NULL,
  i_partition INTEGER,
  no_of_days_left INTEGER NOT NULL,
  store TIMESTAMP WITH TIME ZONE NOT NULL,
  memo_no VARCHAR(256) NOT NULL,
  file_ref_no VARCHAR(256) NOT NULL,
  special_comments VARCHAR(4000) NOT NULL,
  form_status VARCHAR(125) NOT NULL,
  pre_audit_approve_date TIMESTAMP WITH TIME ZONE NOT NULL,
  pre_audit_desg VARCHAR(128) NOT NULL,
  cc_head VARCHAR(64) NOT NULL,
  business_area_description VARCHAR(256) NOT NULL,
  sec_head_desg VARCHAR(128) NOT NULL,
  cfo_approve_date TIMESTAMP WITH TIME ZONE NOT NULL,
  store_initiator_cad VARCHAR(256) NOT NULL,
  chief_ccm VARCHAR(125) NOT NULL,
  store_hod_cad VARCHAR(256) NOT NULL,
  approval_category VARCHAR(1024) NOT NULL,
  fcg_pre_audit_cad VARCHAR(64) NOT NULL,
  query_raised SMALLINT NOT NULL,
  financial_controller_cad VARCHAR(64) NOT NULL,
  cfo_cad VARCHAR(64) NOT NULL,
  store_hod_cad_approve_date TIMESTAMP WITH TIME ZONE NOT NULL,
  cfo_cad_approval_date TIMESTAMP WITH TIME ZONE NOT NULL,
  estimated_value_b_ DOUBLE PRECISION NOT NULL,
  modify_flag SMALLINT NOT NULL,
  cc_sectional_head_app_date TIMESTAMP WITH TIME ZONE NOT NULL,
  written_down_value_a_ DOUBLE PRECISION NOT NULL,
  oaf_date TIMESTAMP WITH TIME ZONE NOT NULL,
  cc_head_desg VARCHAR(125) NOT NULL,
  revenue_as_per_h1_bidder__1 DOUBLE PRECISION NOT NULL,
  financial_controller_cad_ap TIMESTAMP WITH TIME ZONE NOT NULL,
  chief_sbu_approve_date TIMESTAMP WITH TIME ZONE,
  chief_cf_and_a_approve_date TIMESTAMP WITH TIME ZONE,
  memo_type VARCHAR(125),
  bid_validity_expires_on TIMESTAMP WITH TIME ZONE,
  fcg_pre_audit_cad_desg VARCHAR(128),
  loss_total DOUBLE PRECISION,
  final_reviewer_cad_app_date TIMESTAMP WITH TIME ZONE,
  pre_audit VARCHAR(125),
  chief_sbu_cad VARCHAR(64),
  fcg_pre_audit_cad_approve_d TIMESTAMP WITH TIME ZONE,
  chief_corp_fa_cad VARCHAR(64),
  financial_controller_cad_de VARCHAR(128),
  md_desg VARCHAR(128),
  company_code VARCHAR(256),
  chief_ccm_approve_date TIMESTAMP WITH TIME ZONE,
  chief_corp_f_a_desg VARCHAR(128),
  chief_corporate_f_a VARCHAR(125),
  lot_recommended_for_disposa VARCHAR(4000),
  financial_year VARCHAR(125),
  approval_level INTEGER,
  unique_id VARCHAR(125),
  cc_head_approve_date TIMESTAMP WITH TIME ZONE,
  realizable_value_total DOUBLE PRECISION,
  division VARCHAR(256),
  md VARCHAR(125),
  book_value_total DOUBLE PRECISION,
  bid_validity_date TIMESTAMP WITH TIME ZONE,
  e_auction_date TIMESTAMP WITH TIME ZONE,
  business_area VARCHAR(256),
  store_hod_cad_desg VARCHAR(128),
  company_code_description VARCHAR(256),
  chief_sbu_cad_desg VARCHAR(64),
  cc_sectional_head VARCHAR(125),
  final_reviewer_approve_date TIMESTAMP WITH TIME ZONE,
  cfo_desg VARCHAR(128),
  cfo VARCHAR(125),
  soa_clause VARCHAR(1024),
  initiator VARCHAR(125),
  cfo_cad_desg VARCHAR(128),
  chief_ccm_desg VARCHAR(128),
  net_revenue_d_c_a_ DOUBLE PRECISION,
  md_approve_date TIMESTAMP WITH TIME ZONE,
  cost_center VARCHAR(64),
  ed_and_ceo_cad VARCHAR(64),
  bid_validity_days INTEGER,
  ed_and_ceo_cad_approve_date TIMESTAMP WITH TIME ZONE,
  ed_and_ceo_cad_desg VARCHAR(64),
  materialdetailsuniqueid VARCHAR(255),
  clusters VARCHAR(255)
);

CREATE INDEX IF NOT EXISTS idx_xoaf_scrapcad_form_s_r_object_id ON xoaf_scrapcad_form_s(r_object_id);
CREATE INDEX IF NOT EXISTS idx_xoaf_scrapcad_form_s_memo_no ON xoaf_scrapcad_form_s(memo_no);
CREATE INDEX IF NOT EXISTS idx_xoaf_scrapcad_form_s_file_ref_no ON xoaf_scrapcad_form_s(file_ref_no);
CREATE INDEX IF NOT EXISTS idx_xoaf_scrapcad_form_s_form_status ON xoaf_scrapcad_form_s(form_status);
CREATE INDEX IF NOT EXISTS idx_xoaf_scrapcad_form_s_company_code ON xoaf_scrapcad_form_s(company_code);
CREATE INDEX IF NOT EXISTS idx_xoaf_scrapcad_form_s_clusters ON xoaf_scrapcad_form_s(clusters);

CREATE TABLE IF NOT EXISTS xoaf_scrapcad_form_r (
  r_object_id CHAR(16) NOT NULL,
  i_position SMALLINT,
  i_partition INTEGER,
  md_cc_email_users VARCHAR(150),
  cgpl_ed_eas VARCHAR(256),
  ed_and_ceo_ea VARCHAR(500),
  final_app_ea VARCHAR(255)
);

CREATE INDEX IF NOT EXISTS idx_xoaf_scrapcad_form_r_r_object_id ON xoaf_scrapcad_form_r(r_object_id);
CREATE INDEX IF NOT EXISTS idx_xoaf_scrapcad_form_r_i_position ON xoaf_scrapcad_form_r(i_position);
CREATE INDEX IF NOT EXISTS idx_xoaf_scrapcad_form_r_i_partition ON xoaf_scrapcad_form_r(i_partition);

CREATE TABLE IF NOT EXISTS xoaf_scrap_enclosures_s (
  r_object_id CHAR(16) NOT NULL,
  i_partition INTEGER,
  related_memo_id VARCHAR(125) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_xoaf_scrap_enclosures_s_r_object_id ON xoaf_scrap_enclosures_s(r_object_id);
CREATE INDEX IF NOT EXISTS idx_xoaf_scrap_enclosures_s_related_memo_id ON xoaf_scrap_enclosures_s(related_memo_id);
