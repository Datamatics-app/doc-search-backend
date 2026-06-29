-- ============================================================
-- EOAF General metadata tables for PostgreSQL
-- ============================================================

CREATE TABLE IF NOT EXISTS xoaf_general_form_s (
  r_object_id CHAR(16) NOT NULL,
  i_partition INTEGER,
  memo_no VARCHAR(256) NOT NULL,
  checker2_designation VARCHAR(125) NOT NULL,
  approval_type VARCHAR(4000) NOT NULL,
  department_desc VARCHAR(64) NOT NULL,
  reg_approval_status VARCHAR(4000) NOT NULL,
  prepared_by VARCHAR(128) NOT NULL,
  budget_type VARCHAR(4000) NOT NULL,
  c_subject VARCHAR(4000) NOT NULL,
  recommender5_designation VARCHAR(125) NOT NULL,
  raised_query SMALLINT NOT NULL,
  status VARCHAR(64) NOT NULL,
  m1 VARCHAR(256) NOT NULL,
  m0 VARCHAR(256) NOT NULL,
  category VARCHAR(256) NOT NULL,
  checker1_designation VARCHAR(125) NOT NULL,
  recommended_approvers VARCHAR(4000) NOT NULL,
  businessarea VARCHAR(64) NOT NULL,
  reg_commission_type VARCHAR(128) NOT NULL,
  budget VARCHAR(64) NOT NULL,
  scope VARCHAR(4000) NOT NULL,
  bd_stage VARCHAR(64) NOT NULL,
  soa_type VARCHAR(64) NOT NULL,
  regulatory_details VARCHAR(4000) NOT NULL,
  soa_description VARCHAR(2000) NOT NULL,
  mc VARCHAR(256),
  management_approval_request VARCHAR(4000),
  md VARCHAR(256),
  ecob VARCHAR(256),
  ma VARCHAR(256),
  recommender3_designation VARCHAR(125),
  mb VARCHAR(256),
  board_of_directors VARCHAR(256),
  soa_no VARCHAR(256),
  bd_gate VARCHAR(64),
  sub_category VARCHAR(256),
  prepared_date TIMESTAMP WITH TIME ZONE,
  recommender1_designation VARCHAR(125),
  memo_reference_no VARCHAR(256),
  wf_status VARCHAR(12),
  recommender4_designation VARCHAR(125),
  is_active VARCHAR(64),
  recommender2_designation VARCHAR(125),
  bd_flag VARCHAR(64),
  memo_date TIMESTAMP WITH TIME ZONE,
  company_code_desc VARCHAR(125),
  final_approver_designation VARCHAR(125),
  task_flag INTEGER,
  unique_no VARCHAR(64),
  confirm_approvers SMALLINT,
  budget_amt DOUBLE PRECISION,
  training_no_of_days INTEGER,
  training_venue VARCHAR(512),
  training_scheduled_date TIMESTAMP WITH TIME ZONE,
  training_organised_by VARCHAR(256),
  tr_no_of_days DOUBLE PRECISION,
  fag_approver VARCHAR(4000),
  fag_approver_date TIMESTAMP WITH TIME ZONE,
  fag_approver_comments VARCHAR(4000),
  fag_approver_designation VARCHAR(125),
  clusters VARCHAR(64),
  ver VARCHAR(64)
);

CREATE INDEX IF NOT EXISTS idx_xoaf_general_form_s_r_object_id ON xoaf_general_form_s(r_object_id);
CREATE INDEX IF NOT EXISTS idx_xoaf_general_form_s_memo_no ON xoaf_general_form_s(memo_no);
CREATE INDEX IF NOT EXISTS idx_xoaf_general_form_s_status ON xoaf_general_form_s(status);
CREATE INDEX IF NOT EXISTS idx_xoaf_general_form_s_company_code_desc ON xoaf_general_form_s(company_code_desc);
CREATE INDEX IF NOT EXISTS idx_xoaf_general_form_s_clusters ON xoaf_general_form_s(clusters);

CREATE TABLE IF NOT EXISTS xoaf_general_form_r (
  r_object_id CHAR(16) NOT NULL,
  i_position SMALLINT NOT NULL,
  i_partition INTEGER,
  mom_negotiation_documents VARCHAR(64),
  bid_total_opex DOUBLE PRECISION,
  bid_memo DOUBLE PRECISION,
  bid_srno VARCHAR(64),
  analysis_document VARCHAR(64),
  bid_supporting_documents VARCHAR(64),
  detailed_requirement_docs VARCHAR(64),
  bid_total_capex DOUBLE PRECISION,
  other_documents VARCHAR(64),
  md_email_cc_users VARCHAR(256)
);

CREATE INDEX IF NOT EXISTS idx_xoaf_general_form_r_r_object_id ON xoaf_general_form_r(r_object_id);
CREATE INDEX IF NOT EXISTS idx_xoaf_general_form_r_i_position ON xoaf_general_form_r(i_position);
CREATE INDEX IF NOT EXISTS idx_xoaf_general_form_r_i_partition ON xoaf_general_form_r(i_partition);

CREATE TABLE IF NOT EXISTS xoaf_attachments_s (
  r_object_id CHAR(16) NOT NULL,
  i_partition INTEGER,
  enclosure_documents VARCHAR(64) NOT NULL,
  form_id VARCHAR(64) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_xoaf_attachments_s_r_object_id ON xoaf_attachments_s(r_object_id);
CREATE INDEX IF NOT EXISTS idx_xoaf_attachments_s_form_id ON xoaf_attachments_s(form_id);