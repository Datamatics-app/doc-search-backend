require('dotenv').config();
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { pool } = require('../config/database');

const DOCUMENTS_DIR = path.resolve(__dirname, '../documents');
const count = parseInt(process.argv[2], 10) || 500;

const statusOptions = ['Draft', 'In-Process', 'Approved', 'Rejected'];
const budgetOptions = ['OPEX', 'CAPEX'];
const dcpOptions = ['OPEX', 'CAPEX', 'CAPEX', 'OPEX'];
const processTypeOptions = ['Subscription', 'Legal', 'Services', 'Project Management', 'Procurement', 'Operations'];
const typeOptions = ['Quotation', 'Price Analysis', 'BOQ', 'Any Others', 'Negotiation MoMs'];
const companyCodes = ['1000', '2000', '3000', '4000'];

const randomChoice = (items) => items[Math.floor(Math.random() * items.length)];
const pad = (value, length = 4) => String(value).padStart(length, '0');
const generateId = () => crypto.randomBytes(8).toString('hex');

const ensureDocumentsDirectory = () => {
  if (!fs.existsSync(DOCUMENTS_DIR)) {
    fs.mkdirSync(DOCUMENTS_DIR, { recursive: true });
    console.log(`Created documents directory: ${DOCUMENTS_DIR}`);
  }
};

const generateDocumentFile = (index) => {
  const filename = `dummy-doc-${pad(index)}.pdf`;
  const filePath = path.join(DOCUMENTS_DIR, filename);
  const content = `Dummy document ${index}\n\nThis is a generated file for dummy data testing.\nFile: ${filename}\n`;
  fs.writeFileSync(filePath, content, 'utf8');
  return `documents/${filename}`;
};

const buildFormRow = (index, docFilePath) => {
  const formId = generateId();
  const processType = randomChoice(processTypeOptions);
  const status = randomChoice(statusOptions);
  const budget = randomChoice(budgetOptions);
  const dcpRequired = randomChoice(dcpOptions);

  return {
    r_object_id: formId,
    i_partition: 0,
    payment_terms: `Payment terms for form ${index}`,
    total_comm_above_purchase: Number((Math.random() * 1000000).toFixed(2)),
    special_comments: `Auto-generated form ${index}`,
    file_ref_no: `FORM-${pad(index, 6)}`,
    justification: `Justification text for form ${index}`,
    eval_fcg_approval_date: new Date().toISOString(),
    checker_intender: `Checker ${pad(index, 3)}`,
    mom_of_negotiations: `MoM notes ${pad(index, 3)}`,
    ld_clause: index % 2 === 0 ? 'Applicable' : 'Not Applicable',
    checker_intender_app_date: new Date().toISOString(),
    query_raised: index % 5,
    eval_fcg: `FCG-${pad(index, 3)}`,
    status,
    ras_details: `RAS details for ${index}`,
    regulatory_approval: index % 3 === 0 ? 'Approved' : 'Pending',
    eval_intender: `${index % 2}`,
    offer_text: `Offer details for form ${index}`,
    offer_received_from: index % 3,
    checker_fcg: `Checker FCG ${pad(index, 3)}`,
    soa_value: `SOA-${pad(index, 4)}`,
    eval_cc_approval_date: new Date().toISOString(),
    dcp_required: dcpRequired,
    offer_validity: new Date(Date.now() + 86400000 * 30).toISOString(),
    budget,
    company_code: randomChoice(companyCodes),
    ld_clause_text: `LD clause text for ${index}`,
    scope: `Scope description for form ${index}`,
    pbg: `PBG type ${index % 4}`,
    costbenchmarking_remark: `Cost benchmarking notes for ${index}`,
    process_type: processType,
    docFilePath,
  };
};

const seedDummyData = async () => {
  ensureDocumentsDirectory();

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    console.log(`Generating ${count} dummy forms and documents...`);
    for (let i = 1; i <= count; i += 1) {
      const docFilePath = generateDocumentFile(i);
      const form = buildFormRow(i, docFilePath);

      await client.query(
        `INSERT INTO xoaf_form_s (
           r_object_id, i_partition, payment_terms, total_comm_above_purchase,
           special_comments, file_ref_no, justification, eval_fcg_approval_date,
           checker_intender, mom_of_negotiations, ld_clause, checker_intender_app_date,
           query_raised, eval_fcg, status, ras_details, regulatory_approval,
           eval_intender, offer_text, offer_received_from, checker_fcg, soa_value,
           eval_cc_approval_date, dcp_required, offer_validity, budget, company_code,
           ld_clause_text, scope, pbg, costbenchmarking_remark, process_type
         ) VALUES (
           $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32
         )`,
        [
          form.r_object_id,
          form.i_partition,
          form.payment_terms,
          form.total_comm_above_purchase,
          form.special_comments,
          form.file_ref_no,
          form.justification,
          form.eval_fcg_approval_date,
          form.checker_intender,
          form.mom_of_negotiations,
          form.ld_clause,
          form.checker_intender_app_date,
          form.query_raised,
          form.eval_fcg,
          form.status,
          form.ras_details,
          form.regulatory_approval,
          form.eval_intender,
          form.offer_text,
          form.offer_received_from,
          form.checker_fcg,
          form.soa_value,
          form.eval_cc_approval_date,
          form.dcp_required,
          form.offer_validity,
          form.budget,
          form.company_code,
          form.ld_clause_text,
          form.scope,
          form.pbg,
          form.costbenchmarking_remark,
          form.process_type,
        ]
      );

      await client.query(
        `INSERT INTO source_file_path_s (r_object_id, i_is_replica, i_vstamp, doc_file_path, doc_r_object_id)
         VALUES ($1, $2, $3, $4, $5)`,
        [generateId(), 0, 0, form.docFilePath, form.r_object_id]
      );

      const enclosureId = generateId();
      await client.query(
        `INSERT INTO xoaf_enclosure_s (r_object_id, i_partition, form_id, "type")
         VALUES ($1, $2, $3, $4)`,
        [enclosureId, 0, form.r_object_id, randomChoice(typeOptions)]
      );

      await client.query(
        `INSERT INTO source_file_path_s (r_object_id, i_is_replica, i_vstamp, doc_file_path, doc_r_object_id)
         VALUES ($1, $2, $3, $4, $5)`,
        [generateId(), 0, 0, form.docFilePath, enclosureId]
      );

      if (i % 50 === 0) {
        console.log(`  Inserted ${i} records...`);
      }
    }

    await client.query('COMMIT');
    console.log(`\n✅ Successfully seeded ${count} forms with local document files.`);
    console.log(`  Documents written to: ${DOCUMENTS_DIR}`);
    console.log('  Example document URL pattern: /docbase/forms/<formId>/document');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
};

seedDummyData();
