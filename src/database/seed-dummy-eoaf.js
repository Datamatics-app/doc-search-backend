require('dotenv').config();
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { pool } = require('../config/database');

const DOCUMENTS_DIR = path.resolve(__dirname, '../../documents');
const COUNT = parseInt(process.argv[2], 10) || 500;

// ── Helpers ──────────────────────────────────────────────
const generateId = () => crypto.randomBytes(8).toString('hex'); // 16 hex chars -> CHAR(16)
const pad = (v, len = 4) => String(v).padStart(len, '0');
const randomChoice = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomFloat = (min, max) => Number((Math.random() * (max - min) + min).toFixed(2));
const randomDate = (daysBackMax = 365) =>
  new Date(Date.now() - randomInt(0, daysBackMax) * 86400000).toISOString();

const formStatusOptions = ['Draft', 'In-Process', 'Approved', 'Rejected'];
const companyCodes = ['1000', '2000', '3000', '4000'];
const attachmentTypeOptions = ['Quotation', 'Price Analysis', 'BOQ', 'Any Others', 'Negotiation MoMs', 'SLA', 'Scope of Work'];

// ── Document file helpers ───────────────────────────────
const ensureDocumentsDirectory = () => {
  if (!fs.existsSync(DOCUMENTS_DIR)) {
    fs.mkdirSync(DOCUMENTS_DIR, { recursive: true });
    console.log(`Created documents directory: ${DOCUMENTS_DIR}`);
  }
};

const generateDocumentFile = (prefix, index) => {
  const filename = `${prefix}-dummy-${pad(index)}.pdf`;
  const filePath = path.join(DOCUMENTS_DIR, filename);
  const content = `Dummy ${prefix} document ${index}\n\nGenerated for dummy data testing.\nFile: ${filename}\n`;
  fs.writeFileSync(filePath, content, 'utf8');
  return `documents/${filename}`;
};

// ── Row builders: EOAF LD ───────────────────────────────
const buildLdFormRow = (index) => ({
  r_object_id: generateId(),
  i_partition: 0,
  discussions_and_agreement: `Discussion and agreement notes for LD ${index}`,
  approval2_date_time: randomDate(),
  approver4: `Approver4 ${pad(index, 3)}`,
  approver3: `Approver3 ${pad(index, 3)}`,
  file_ref_no: `LD-FORM-${pad(index, 6)}`,
  special_comments: `Auto-generated LD form ${index}`,
  approver2: `Approver2 ${pad(index, 3)}`,
  approver1: `Approver1 ${pad(index, 3)}`,
  oaf_no: `OAF-LD-${pad(index, 6)}`,
  form_status: randomChoice(formStatusOptions),
  back_ground_of_the_package_: `Background for LD package ${index}`,
  approval_level: randomInt(1, 6),
  approval3_date_time: randomDate(),
  unique_id: `LD-UNQ-${pad(index, 6)}`,
  approval1_date_time: randomDate(),
  ld_subject: `LD Subject for case ${index}`,
  company_name: `Sample Company ${index % 5}`,
  approver5: `Approver5 ${pad(index, 3)}`,
  approver6: `Approver6 ${pad(index, 3)}`,
  query_raised: index % 5,
  initiator_approval_date_tim: randomDate(),
  po_criteria: `PO criteria ${index % 4}`,
  package_name: `Package ${index}`,
  approval6_date_time: randomDate(),
  oaf_date: randomDate(),
  approval4_date_time: randomDate(),
  contractual_ld_clause: `Contractual LD clause text for case ${index}`,
  category: `Category ${index % 3}`,
  proposal_to_management_for_: `Proposal to management for case ${index}`,
  initiator: `Initiator ${pad(index, 3)}`,
  approval5_date_time: randomDate(),
  delay_analysis_in_brief: `Delay analysis brief for case ${index}`,
  project_plant_name: `Plant ${index % 10}`,
  order_type: randomChoice(['PO', 'Contract', 'Work Order']),
  package_value_total: randomFloat(10000, 5000000),
  reviewer3_approval_date: randomDate(),
  reviewer2_approval_date: randomDate(),
  approver3_designation: `Designation ${index % 5}`,
  company_code: randomChoice(companyCodes),
  reviewer1_approval_date: randomDate(),
  reviewer5_approval_date: randomDate(),
  approver5_designation: `Designation ${index % 5}`,
  approver6_designation: `Designation ${index % 5}`,
  modify_it: index % 2,
  reviewer4_approval_date: randomDate(),
  approver4_designation: `Designation ${index % 5}`,
  approver1_designation: `Designation ${index % 5}`,
  approver2_designation: `Designation ${index % 5}`,
  department_description: `Department ${index % 8}`,
  department_code: `DEPT-${index % 8}`,
  reviewer2_designation: `Designation ${index % 5}`,
  reviewer4_designation: `Designation ${index % 5}`,
  reviewer1_designation: `Designation ${index % 5}`,
  reviewer3_designation: `Designation ${index % 5}`,
  reviewer5_designation: `Designation ${index % 5}`,
  clusters: `Cluster ${index % 4}`,
});

const buildLdFormRRow = (formId, index) => ({
  r_object_id: formId,
  i_position: 0,
  i_partition: 0,
  reviewed_by: `Reviewer ${pad(index, 3)}`,
  sap_po_no: `SAP-${pad(index, 6)}`,
  reviewers: `Reviewer ${pad(index, 3)}`,
  approved_by: `Approver ${pad(index, 3)}`,
  po_value: randomInt(10000, 5000000),
  reviewer_hod_designation: `HOD Legal ${index % 4}`,
  reviewer_hod_s: `HOD Designation ${index % 4}`,
  reviewer_designation: `Legal Reviewer ${index % 4}`,
});

const buildLdEnclosureRow = (formId, index) => ({
  r_object_id: generateId(),
  i_partition: 0,
  attachment_types: randomChoice(attachmentTypeOptions),
  related_memo_id: formId,
});

// ── Row builders: EOAF Scrap/CAD ────────────────────────
const buildScrapFormRow = (index) => ({
  r_object_id: generateId(),
  i_partition: 0,
  no_of_days_left: randomInt(0, 90),
  store: randomDate(),
  memo_no: `SCRAP-${pad(index, 6)}`,
  file_ref_no: `SCRAP-FILE-${pad(index, 6)}`,
  special_comments: `Auto-generated scrap/CAD form ${index}`,
  form_status: randomChoice(formStatusOptions),
  pre_audit_approve_date: randomDate(),
  pre_audit_desg: `Pre Audit Desg ${index % 5}`,
  cc_head: `CC Head ${index % 5}`,
  business_area_description: `Business area ${index % 6}`,
  sec_head_desg: `Sec Head Desg ${index % 5}`,
  cfo_approve_date: randomDate(),
  store_initiator_cad: `Store Initiator ${pad(index, 3)}`,
  chief_ccm: `Chief CCM ${index % 4}`,
  store_hod_cad: `Store HOD CAD ${index % 4}`,
  approval_category: `Approval Category ${index % 3}`,
  fcg_pre_audit_cad: `FCG Pre Audit CAD ${index % 4}`,
  query_raised: index % 5,
  financial_controller_cad: `Financial Controller CAD ${index % 4}`,
  cfo_cad: `CFO CAD ${index % 4}`,
  store_hod_cad_approve_date: randomDate(),
  cfo_cad_approval_date: randomDate(),
  estimated_value_b_: randomFloat(1000, 1000000),
  modify_flag: index % 2,
  cc_sectional_head_app_date: randomDate(),
  written_down_value_a_: randomFloat(500, 800000),
  oaf_date: randomDate(),
  cc_head_desg: `CC Head Desg ${index % 5}`,
  revenue_as_per_h1_bidder__1: randomFloat(1000, 900000),
  financial_controller_cad_ap: randomDate(),
  chief_sbu_approve_date: randomDate(),
  chief_cf_and_a_approve_date: randomDate(),
  memo_type: randomChoice(['Scrap', 'CAD']),
  bid_validity_expires_on: randomDate(),
  fcg_pre_audit_cad_desg: `FCG Pre Audit Desg ${index % 4}`,
  loss_total: randomFloat(0, 50000),
  final_reviewer_cad_app_date: randomDate(),
  pre_audit: `Pre Audit ${index % 3}`,
  chief_sbu_cad: `Chief SBU CAD ${index % 4}`,
  fcg_pre_audit_cad_approve_d: randomDate(),
  chief_corp_fa_cad: `Chief Corp FA CAD ${index % 4}`,
  financial_controller_cad_de: `FC CAD Desg ${index % 4}`,
  md_desg: 'MD Desg',
  company_code: randomChoice(companyCodes),
  chief_ccm_approve_date: randomDate(),
  chief_corp_f_a_desg: 'Chief Corp F&A Desg',
  chief_corporate_f_a: 'Chief Corporate F&A',
  lot_recommended_for_disposa: `Lot recommended for disposal ${index}`,
  financial_year: `FY${24 + (index % 3)}`,
  approval_level: randomInt(1, 6),
  unique_id: `SCRAP-UNQ-${pad(index, 6)}`,
  cc_head_approve_date: randomDate(),
  realizable_value_total: randomFloat(1000, 700000),
  division: `Division ${index % 5}`,
  md: `MD ${index % 3}`,
  book_value_total: randomFloat(1000, 900000),
  bid_validity_date: randomDate(),
  e_auction_date: randomDate(),
  business_area: `Business Area ${index % 6}`,
  store_hod_cad_desg: 'Store HOD Desg',
  company_code_description: `Company Code Desc ${index % 4}`,
  chief_sbu_cad_desg: 'Chief SBU Desg',
  cc_sectional_head: `CC Sectional Head ${index % 4}`,
  final_reviewer_approve_date: randomDate(),
  cfo_desg: 'CFO Desg',
  cfo: `CFO ${index % 3}`,
  soa_clause: `SOA clause ${index}`,
  initiator: `Initiator ${pad(index, 3)}`,
  cfo_cad_desg: 'CFO CAD Desg',
  chief_ccm_desg: 'Chief CCM Desg',
  net_revenue_d_c_a_: randomFloat(1000, 500000),
  md_approve_date: randomDate(),
  cost_center: `CC-${index % 10}`,
  ed_and_ceo_cad: `ED and CEO CAD ${index % 3}`,
  bid_validity_days: randomInt(7, 90),
  ed_and_ceo_cad_approve_date: randomDate(),
  ed_and_ceo_cad_desg: 'ED and CEO CAD Desg',
  materialdetailsuniqueid: `MAT-${pad(index, 6)}`,
  clusters: `Cluster ${index % 4}`,
});

const buildScrapFormRRow = (formId, index) => ({
  r_object_id: formId,
  i_position: 0,
  i_partition: 0,
  md_cc_email_users: `scrapcad${index}@example.com`,
  cgpl_ed_eas: `CGPL ED/EAS ${index % 4}`,
  ed_and_ceo_ea: `ED and CEO EA ${index % 4}`,
  final_app_ea: `Final Approver EA ${index % 4}`,
});

const buildScrapEnclosureRow = (formId) => ({
  r_object_id: generateId(),
  i_partition: 0,
  related_memo_id: formId,
});

// ── Insert helpers ───────────────────────────────────────
const insertLdForm = (client, row) =>
  client.query(
    `INSERT INTO xoaf_ld_form_s (
       r_object_id, i_partition, discussions_and_agreement, approval2_date_time,
       approver4, approver3, file_ref_no, special_comments, approver2, approver1,
       oaf_no, form_status, back_ground_of_the_package_, approval_level,
       approval3_date_time, unique_id, approval1_date_time, ld_subject,
       company_name, approver5, approver6, query_raised,
       initiator_approval_date_tim, po_criteria, package_name,
       approval6_date_time, oaf_date, approval4_date_time,
       contractual_ld_clause, category, proposal_to_management_for_, initiator,
       approval5_date_time, delay_analysis_in_brief, project_plant_name,
       order_type, package_value_total, reviewer3_approval_date,
       reviewer2_approval_date, approver3_designation, company_code,
       reviewer1_approval_date, reviewer5_approval_date,
       approver5_designation, approver6_designation, modify_it,
       reviewer4_approval_date, approver4_designation, approver1_designation,
       approver2_designation, department_description, department_code,
       reviewer2_designation, reviewer4_designation, reviewer1_designation,
       reviewer3_designation, reviewer5_designation, clusters
     ) VALUES (
       $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,
       $21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33,$34,$35,$36,$37,$38,
       $39,$40,$41,$42,$43,$44,$45,$46,$47,$48,$49,$50,$51,$52,$53,$54,$55,$56,
       $57,$58
     )`,
    [
      row.r_object_id, row.i_partition, row.discussions_and_agreement, row.approval2_date_time,
      row.approver4, row.approver3, row.file_ref_no, row.special_comments, row.approver2, row.approver1,
      row.oaf_no, row.form_status, row.back_ground_of_the_package_, row.approval_level,
      row.approval3_date_time, row.unique_id, row.approval1_date_time, row.ld_subject,
      row.company_name, row.approver5, row.approver6, row.query_raised,
      row.initiator_approval_date_tim, row.po_criteria, row.package_name,
      row.approval6_date_time, row.oaf_date, row.approval4_date_time,
      row.contractual_ld_clause, row.category, row.proposal_to_management_for_, row.initiator,
      row.approval5_date_time, row.delay_analysis_in_brief, row.project_plant_name,
      row.order_type, row.package_value_total, row.reviewer3_approval_date,
      row.reviewer2_approval_date, row.approver3_designation, row.company_code,
      row.reviewer1_approval_date, row.reviewer5_approval_date,
      row.approver5_designation, row.approver6_designation, row.modify_it,
      row.reviewer4_approval_date, row.approver4_designation, row.approver1_designation,
      row.approver2_designation, row.department_description, row.department_code,
      row.reviewer2_designation, row.reviewer4_designation, row.reviewer1_designation,
      row.reviewer3_designation, row.reviewer5_designation, row.clusters,
    ]
  );

const insertLdFormR = (client, row) =>
  client.query(
    `INSERT INTO xoaf_ld_form_r (
       r_object_id, i_position, i_partition, reviewed_by, sap_po_no,
       reviewers, approved_by, po_value, reviewer_hod_designation,
       reviewer_hod_s, reviewer_designation
     ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
    [
      row.r_object_id, row.i_position, row.i_partition, row.reviewed_by, row.sap_po_no,
      row.reviewers, row.approved_by, row.po_value, row.reviewer_hod_designation,
      row.reviewer_hod_s, row.reviewer_designation,
    ]
  );

const insertLdEnclosure = (client, row) =>
  client.query(
    `INSERT INTO xoaf_ld_enclosures_s (r_object_id, i_partition, attachment_types, related_memo_id)
     VALUES ($1,$2,$3,$4)`,
    [row.r_object_id, row.i_partition, row.attachment_types, row.related_memo_id]
  );

const insertScrapForm = (client, row) =>
  client.query(
    `INSERT INTO xoaf_scrapcad_form_s (
       r_object_id, i_partition, no_of_days_left, store, memo_no,
       file_ref_no, special_comments, form_status, pre_audit_approve_date,
       pre_audit_desg, cc_head, business_area_description,
       sec_head_desg, cfo_approve_date, store_initiator_cad,
       chief_ccm, store_hod_cad, approval_category,
       fcg_pre_audit_cad, query_raised, financial_controller_cad,
       cfo_cad, store_hod_cad_approve_date, cfo_cad_approval_date,
       estimated_value_b_, modify_flag, cc_sectional_head_app_date,
       written_down_value_a_, oaf_date, cc_head_desg,
       revenue_as_per_h1_bidder__1, financial_controller_cad_ap,
       chief_sbu_approve_date, chief_cf_and_a_approve_date,
       memo_type, bid_validity_expires_on, fcg_pre_audit_cad_desg,
       loss_total, final_reviewer_cad_app_date, pre_audit,
       chief_sbu_cad, fcg_pre_audit_cad_approve_d, chief_corp_fa_cad,
       financial_controller_cad_de, md_desg, company_code,
       chief_ccm_approve_date, chief_corp_f_a_desg, chief_corporate_f_a,
       lot_recommended_for_disposa, financial_year, approval_level,
       unique_id, cc_head_approve_date, realizable_value_total,
       division, md, book_value_total, bid_validity_date,
       e_auction_date, business_area, store_hod_cad_desg,
       company_code_description, chief_sbu_cad_desg, cc_sectional_head,
       final_reviewer_approve_date, cfo_desg, cfo, soa_clause,
       initiator, cfo_cad_desg, chief_ccm_desg,
       net_revenue_d_c_a_, md_approve_date, cost_center,
       ed_and_ceo_cad, bid_validity_days, ed_and_ceo_cad_approve_date,
       ed_and_ceo_cad_desg, materialdetailsuniqueid, clusters
     ) VALUES (
       $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,
       $21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33,$34,$35,$36,$37,$38,
       $39,$40,$41,$42,$43,$44,$45,$46,$47,$48,$49,$50,$51,$52,$53,$54,$55,$56,
       $57,$58,$59,$60,$61,$62,$63,$64,$65,$66,$67,$68,$69,$70,$71,$72,$73,$74,
       $75,$76,$77,$78,$79,$80,$81
     )`,
    [
      row.r_object_id, row.i_partition, row.no_of_days_left, row.store, row.memo_no,
      row.file_ref_no, row.special_comments, row.form_status, row.pre_audit_approve_date,
      row.pre_audit_desg, row.cc_head, row.business_area_description,
      row.sec_head_desg, row.cfo_approve_date, row.store_initiator_cad,
      row.chief_ccm, row.store_hod_cad, row.approval_category,
      row.fcg_pre_audit_cad, row.query_raised, row.financial_controller_cad,
      row.cfo_cad, row.store_hod_cad_approve_date, row.cfo_cad_approval_date,
      row.estimated_value_b_, row.modify_flag, row.cc_sectional_head_app_date,
      row.written_down_value_a_, row.oaf_date, row.cc_head_desg,
      row.revenue_as_per_h1_bidder__1, row.financial_controller_cad_ap,
      row.chief_sbu_approve_date, row.chief_cf_and_a_approve_date,
      row.memo_type, row.bid_validity_expires_on, row.fcg_pre_audit_cad_desg,
      row.loss_total, row.final_reviewer_cad_app_date, row.pre_audit,
      row.chief_sbu_cad, row.fcg_pre_audit_cad_approve_d, row.chief_corp_fa_cad,
      row.financial_controller_cad_de, row.md_desg, row.company_code,
      row.chief_ccm_approve_date, row.chief_corp_f_a_desg, row.chief_corporate_f_a,
      row.lot_recommended_for_disposa, row.financial_year, row.approval_level,
      row.unique_id, row.cc_head_approve_date, row.realizable_value_total,
      row.division, row.md, row.book_value_total, row.bid_validity_date,
      row.e_auction_date, row.business_area, row.store_hod_cad_desg,
      row.company_code_description, row.chief_sbu_cad_desg, row.cc_sectional_head,
      row.final_reviewer_approve_date, row.cfo_desg, row.cfo, row.soa_clause,
      row.initiator, row.cfo_cad_desg, row.chief_ccm_desg,
      row.net_revenue_d_c_a_, row.md_approve_date, row.cost_center,
      row.ed_and_ceo_cad, row.bid_validity_days, row.ed_and_ceo_cad_approve_date,
      row.ed_and_ceo_cad_desg, row.materialdetailsuniqueid, row.clusters,
    ]
  );

const insertScrapFormR = (client, row) =>
  client.query(
    `INSERT INTO xoaf_scrapcad_form_r (
       r_object_id, i_position, i_partition, md_cc_email_users,
       cgpl_ed_eas, ed_and_ceo_ea, final_app_ea
     ) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
    [row.r_object_id, row.i_position, row.i_partition, row.md_cc_email_users, row.cgpl_ed_eas, row.ed_and_ceo_ea, row.final_app_ea]
  );

const insertScrapEnclosure = (client, row) =>
  client.query(
    `INSERT INTO xoaf_scrap_enclosures_s (r_object_id, i_partition, related_memo_id)
     VALUES ($1,$2,$3)`,
    [row.r_object_id, row.i_partition, row.related_memo_id]
  );

const insertSourceFile = (client, docFilePath, docObjectId) =>
  client.query(
    `INSERT INTO source_file_path_s (r_object_id, i_is_replica, i_vstamp, doc_file_path, doc_r_object_id)
     VALUES ($1,$2,$3,$4,$5)`,
    [generateId(), 0, 0, docFilePath, docObjectId]
  );

// ── Main ─────────────────────────────────────────────────
const seedDummyEoafData = async () => {
  ensureDocumentsDirectory();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    console.log(`Generating ${COUNT} dummy EOAF LD records...`);
    for (let i = 1; i <= COUNT; i++) {
      const formRow = buildLdFormRow(i);
      await insertLdForm(client, formRow);

      const formRRow = buildLdFormRRow(formRow.r_object_id, i);
      await insertLdFormR(client, formRRow);

      const enclosureRow = buildLdEnclosureRow(formRow.r_object_id, i);
      await insertLdEnclosure(client, enclosureRow);

      const formDocPath = generateDocumentFile('eoaf-ld-form', i);
      await insertSourceFile(client, formDocPath, formRow.r_object_id);

      const enclosureDocPath = generateDocumentFile('eoaf-ld-enclosure', i);
      await insertSourceFile(client, enclosureDocPath, enclosureRow.r_object_id);

      if (i % 50 === 0) console.log(`  LD: inserted ${i}/${COUNT}`);
    }

    console.log(`\nGenerating ${COUNT} dummy EOAF Scrap/CAD records...`);
    for (let i = 1; i <= COUNT; i++) {
      const formRow = buildScrapFormRow(i);
      await insertScrapForm(client, formRow);

      const formRRow = buildScrapFormRRow(formRow.r_object_id, i);
      await insertScrapFormR(client, formRRow);

      const enclosureRow = buildScrapEnclosureRow(formRow.r_object_id);
      await insertScrapEnclosure(client, enclosureRow);

      const formDocPath = generateDocumentFile('eoaf-scrap-form', i);
      await insertSourceFile(client, formDocPath, formRow.r_object_id);

      const enclosureDocPath = generateDocumentFile('eoaf-scrap-enclosure', i);
      await insertSourceFile(client, enclosureDocPath, enclosureRow.r_object_id);

      if (i % 50 === 0) console.log(`  Scrap/CAD: inserted ${i}/${COUNT}`);
    }

    await client.query('COMMIT');
    console.log(`\n✅ Successfully seeded ${COUNT} LD and ${COUNT} Scrap/CAD records with dummy documents.`);
    console.log(`  Documents written to: ${DOCUMENTS_DIR}`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
};

seedDummyEoafData();