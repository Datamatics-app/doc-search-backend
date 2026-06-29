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

// ── Row builders: EOAF General ──────────────────────────
const buildGeneralFormRow = (index) => ({
  r_object_id: generateId(),
  i_partition: 0,
  memo_no: `GEN-MEMO-${pad(index, 6)}`,
  checker2_designation: `Checker2 Designation ${index % 5}`,
  approval_type: `Approval Type ${index % 4}`,
  department_desc: `Department ${index % 8}`,
  reg_approval_status: randomChoice(['Approved', 'Pending', 'Not Applicable']),
  prepared_by: `Preparer ${pad(index, 3)}`,
  budget_type: randomChoice(['OPEX', 'CAPEX']),
  c_subject: `General memo subject for case ${index}`,
  recommender5_designation: `Recommender5 Designation ${index % 5}`,
  raised_query: index % 5,
  status: randomChoice(formStatusOptions),
  m1: `M1 value ${index % 6}`,
  m0: `M0 value ${index % 6}`,
  category: `Category ${index % 4}`,
  checker1_designation: `Checker1 Designation ${index % 5}`,
  recommended_approvers: `Recommended approvers list for case ${index}`,
  businessarea: `Business Area ${index % 6}`,
  reg_commission_type: `Reg Commission Type ${index % 3}`,
  budget: randomChoice(['OPEX', 'CAPEX']),
  scope: `Scope description for case ${index}`,
  bd_stage: `BD Stage ${index % 4}`,
  soa_type: `SOA Type ${index % 3}`,
  regulatory_details: `Regulatory details for case ${index}`,
  soa_description: `SOA description for case ${index}`,
  mc: `MC ${index % 4}`,
  management_approval_request: `Management approval request for case ${index}`,
  md: `MD ${index % 3}`,
  ecob: `ECOB ${index % 4}`,
  ma: `MA ${index % 4}`,
  recommender3_designation: `Recommender3 Designation ${index % 5}`,
  mb: `MB ${index % 4}`,
  board_of_directors: `Board of Directors ${index % 3}`,
  soa_no: `SOA-${pad(index, 6)}`,
  bd_gate: `BD Gate ${index % 4}`,
  sub_category: `Sub Category ${index % 4}`,
  prepared_date: randomDate(),
  recommender1_designation: `Recommender1 Designation ${index % 5}`,
  memo_reference_no: `MEMO-REF-${pad(index, 6)}`,
  wf_status: randomChoice(['ACTIVE', 'CLOSED', 'PENDING']),
  recommender4_designation: `Recommender4 Designation ${index % 5}`,
  is_active: index % 2 === 0 ? 'Yes' : 'No',
  recommender2_designation: `Recommender2 Designation ${index % 5}`,
  bd_flag: index % 2 === 0 ? 'Y' : 'N',
  memo_date: randomDate(),
  company_code_desc: `Company Code Desc ${index % 4}`,
  final_approver_designation: `Final Approver Designation ${index % 5}`,
  task_flag: index % 3,
  unique_no: `GEN-UNQ-${pad(index, 6)}`,
  confirm_approvers: index % 2,
  budget_amt: randomFloat(10000, 5000000),
  training_no_of_days: randomInt(1, 10),
  training_venue: `Training Venue ${index % 6}`,
  training_scheduled_date: randomDate(),
  training_organised_by: `Organiser ${index % 5}`,
  tr_no_of_days: randomFloat(1, 10),
  fag_approver: `FAG Approver ${index % 5}`,
  fag_approver_date: randomDate(),
  fag_approver_comments: `FAG approver comments for case ${index}`,
  fag_approver_designation: `FAG Approver Designation ${index % 5}`,
  clusters: `Cluster ${index % 4}`,
  ver: `v${1 + (index % 3)}`,
});

const buildGeneralFormRRow = (formId, index) => ({
  r_object_id: formId,
  i_position: 0,
  i_partition: 0,
  mom_negotiation_documents: `MOM-DOC-${pad(index, 4)}`,
  bid_total_opex: randomFloat(1000, 500000),
  bid_memo: randomFloat(1000, 500000),
  bid_srno: `BID-SR-${pad(index, 4)}`,
  analysis_document: `ANALYSIS-DOC-${pad(index, 4)}`,
  bid_supporting_documents: `BID-SUP-${pad(index, 4)}`,
  detailed_requirement_docs: `REQ-DOC-${pad(index, 4)}`,
  bid_total_capex: randomFloat(1000, 500000),
  other_documents: `OTHER-DOC-${pad(index, 4)}`,
  md_email_cc_users: `general${index}@example.com`,
});

const buildGeneralAttachmentRow = (formId, index) => ({
  r_object_id: generateId(),
  i_partition: 0,
  enclosure_documents: randomChoice(attachmentTypeOptions),
  form_id: formId,
});

// ── Insert helpers ───────────────────────────────────────
const insertGeneralForm = (client, row) =>
  client.query(
    `INSERT INTO xoaf_general_form_s (
       r_object_id, i_partition, memo_no, checker2_designation, approval_type,
       department_desc, reg_approval_status, prepared_by, budget_type, c_subject,
       recommender5_designation, raised_query, status, m1, m0,
       category, checker1_designation, recommended_approvers, businessarea, reg_commission_type,
       budget, scope, bd_stage, soa_type, regulatory_details,
       soa_description, mc, management_approval_request, md, ecob,
       ma, recommender3_designation, mb, board_of_directors, soa_no,
       bd_gate, sub_category, prepared_date, recommender1_designation, memo_reference_no,
       wf_status, recommender4_designation, is_active, recommender2_designation, bd_flag,
       memo_date, company_code_desc, final_approver_designation, task_flag, unique_no,
       confirm_approvers, budget_amt, training_no_of_days, training_venue, training_scheduled_date,
       training_organised_by, tr_no_of_days, fag_approver, fag_approver_date, fag_approver_comments,
       fag_approver_designation, clusters, ver
     ) VALUES (
       $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,
       $21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33,$34,$35,$36,$37,$38,
       $39,$40,$41,$42,$43,$44,$45,$46,$47,$48,$49,$50,$51,$52,$53,$54,$55,$56,
       $57,$58,$59,$60,$61,$62,$63
     )`,
    [
      row.r_object_id, row.i_partition, row.memo_no, row.checker2_designation, row.approval_type,
      row.department_desc, row.reg_approval_status, row.prepared_by, row.budget_type, row.c_subject,
      row.recommender5_designation, row.raised_query, row.status, row.m1, row.m0,
      row.category, row.checker1_designation, row.recommended_approvers, row.businessarea, row.reg_commission_type,
      row.budget, row.scope, row.bd_stage, row.soa_type, row.regulatory_details,
      row.soa_description, row.mc, row.management_approval_request, row.md, row.ecob,
      row.ma, row.recommender3_designation, row.mb, row.board_of_directors, row.soa_no,
      row.bd_gate, row.sub_category, row.prepared_date, row.recommender1_designation, row.memo_reference_no,
      row.wf_status, row.recommender4_designation, row.is_active, row.recommender2_designation, row.bd_flag,
      row.memo_date, row.company_code_desc, row.final_approver_designation, row.task_flag, row.unique_no,
      row.confirm_approvers, row.budget_amt, row.training_no_of_days, row.training_venue, row.training_scheduled_date,
      row.training_organised_by, row.tr_no_of_days, row.fag_approver, row.fag_approver_date, row.fag_approver_comments,
      row.fag_approver_designation, row.clusters, row.ver,
    ]
  );

const insertGeneralFormR = (client, row) =>
  client.query(
    `INSERT INTO xoaf_general_form_r (
       r_object_id, i_position, i_partition, mom_negotiation_documents, bid_total_opex,
       bid_memo, bid_srno, analysis_document, bid_supporting_documents, detailed_requirement_docs,
       bid_total_capex, other_documents, md_email_cc_users
     ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
    [
      row.r_object_id, row.i_position, row.i_partition, row.mom_negotiation_documents, row.bid_total_opex,
      row.bid_memo, row.bid_srno, row.analysis_document, row.bid_supporting_documents, row.detailed_requirement_docs,
      row.bid_total_capex, row.other_documents, row.md_email_cc_users,
    ]
  );

const insertGeneralAttachment = (client, row) =>
  client.query(
    `INSERT INTO xoaf_attachments_s (r_object_id, i_partition, enclosure_documents, form_id)
     VALUES ($1,$2,$3,$4)`,
    [row.r_object_id, row.i_partition, row.enclosure_documents, row.form_id]
  );

const insertSourceFile = (client, docFilePath, docObjectId) =>
  client.query(
    `INSERT INTO source_file_path_s (r_object_id, i_is_replica, i_vstamp, doc_file_path, doc_r_object_id)
     VALUES ($1,$2,$3,$4,$5)`,
    [generateId(), 0, 0, docFilePath, docObjectId]
  );

// ── Main ─────────────────────────────────────────────────
const seedDummyGeneralData = async () => {
  ensureDocumentsDirectory();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    console.log(`Generating ${COUNT} dummy EOAF General records...`);
    for (let i = 1; i <= COUNT; i++) {
      const formRow = buildGeneralFormRow(i);
      await insertGeneralForm(client, formRow);

      const formRRow = buildGeneralFormRRow(formRow.r_object_id, i);
      await insertGeneralFormR(client, formRRow);

      const attachmentRow = buildGeneralAttachmentRow(formRow.r_object_id, i);
      await insertGeneralAttachment(client, attachmentRow);

      const formDocPath = generateDocumentFile('eoaf-general-form', i);
      await insertSourceFile(client, formDocPath, formRow.r_object_id);

      const attachmentDocPath = generateDocumentFile('eoaf-general-attachment', i);
      await insertSourceFile(client, attachmentDocPath, attachmentRow.r_object_id);

      if (i % 50 === 0) console.log(`  General: inserted ${i}/${COUNT}`);
    }

    await client.query('COMMIT');
    console.log(`\n✅ Successfully seeded ${COUNT} General records with dummy documents.`);
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

seedDummyGeneralData();