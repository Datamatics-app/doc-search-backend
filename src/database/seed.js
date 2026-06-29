require('dotenv').config();
const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');

const docbaseFormRows = [
  {
    r_object_id: '080026aa8014a2d3',
    i_partition: 0,
    payment_terms: 'PI0 - Immediate Payment/Purchase Order/Invoice',
    total_comm_above_purchase: 0,
    special_comments: '',
    file_ref_no: '_x0013__x0010_Services/BD/Subscription expense/FY16',
    justification: 'Subscription to India Infrastructure is subscribed by many departments in Tata Power for the various respective fields. We propose to subscribe for Power Sector updates since they have maintained the huge database and have used it in trial period wherein it was found satisfactory',
    eval_fcg_approval_date: '1753-01-01 00:00:00.000',
    checker_intender: '',
    mom_of_negotiations: '',
    ld_clause: '',
    checker_intender_app_date: '1753-01-01 00:00:00.000',
    query_raised: 0,
    eval_fcg: '',
    status: 'Draft',
    ras_details: '',
    regulatory_approval: '',
    eval_intender: 1,
    offer_text: 'Between 0 Lakhs to 5 Lakhs',
    offer_received_from: 1,
    checker_fcg: 'Immediate after receipt of Payment',
    soa_value: 'Immediate after receipt of Payment',
    eval_cc_approval_date: '1753-01-01 00:00:00.000',
    dcp_required: 'OPEX',
    offer_validity: '1753-01-01 00:00:00.000',
    budget: 'OPEX',
    company_code: '1000',
    ld_clause_text: 'Not Applicable',
    scope: '',
    pbg: 'O&M and Site Procurement',
    costbenchmarking_remark: '',
    process_type: 'Subscription',
  },
  {
    r_object_id: '080026aa8014e0b2',
    i_partition: 0,
    payment_terms: '',
    total_comm_above_purchase: 0,
    special_comments: '',
    file_ref_no: 'DEMOFILE',
    justification: 'Demo form sample content for demonstration purposes.',
    eval_fcg_approval_date: '1753-01-01 00:00:00.000',
    checker_intender: '',
    mom_of_negotiations: '',
    ld_clause: '',
    checker_intender_app_date: '1753-01-01 00:00:00.000',
    query_raised: 0,
    eval_fcg: '',
    status: 'Draft',
    ras_details: '',
    regulatory_approval: '',
    eval_intender: 0,
    offer_text: 'Demo offer text',
    offer_received_from: 0,
    checker_fcg: 'Demo checker',
    soa_value: 'Demo value',
    eval_cc_approval_date: '1753-01-01 00:00:00.000',
    dcp_required: 'CAPEX',
    offer_validity: '1753-01-01 00:00:00.000',
    budget: 'CAPEX',
    company_code: '1000',
    ld_clause_text: '',
    scope: '',
    pbg: 'O&M and Site Procurement',
    costbenchmarking_remark: '',
    process_type: 'Demo',
  },
  {
    r_object_id: '080026aa8014fc7d',
    i_partition: 0,
    payment_terms: 'PI0 - Immediate Payment/Purchase Order/Invoice',
    total_comm_above_purchase: 0,
    special_comments: 'Delivery completed. Post Facto approval.',
    file_ref_no: 'TPC/DTPP/Legal/01',
    justification: 'Legal expertise required to defend SLP in Supreme court.',
    eval_fcg_approval_date: '1753-01-01 00:00:00.000',
    checker_intender: '',
    mom_of_negotiations: '',
    ld_clause: 'Not Applicable',
    checker_intender_app_date: '1753-01-01 00:00:00.000',
    query_raised: 0,
    eval_fcg: '',
    status: 'Approved',
    ras_details: 'Approved DPR',
    regulatory_approval: '',
    eval_intender: 1,
    offer_text: 'Project Procurement',
    offer_received_from: 1,
    checker_fcg: 'Arun Bapat',
    soa_value: 'Delivery completed. Post Facto approval.',
    eval_cc_approval_date: '1753-01-01 00:00:00.000',
    dcp_required: 'CAPEX',
    offer_validity: '1753-01-01 00:00:00.000',
    budget: 'CAPEX',
    company_code: '1000',
    ld_clause_text: 'Not Applicable',
    scope: '',
    pbg: 'Single Party',
    costbenchmarking_remark: '',
    process_type: 'Legal',
  },
  {
    r_object_id: '080026aa8014fcb0',
    i_partition: 0,
    payment_terms: 'P07 - 7 Days From GR date',
    total_comm_above_purchase: 0,
    special_comments: 'asdfasdfasdfasdf',
    file_ref_no: 'ABCD/001',
    justification: 'asdfasdfsa',
    eval_fcg_approval_date: '1753-01-01 00:00:00.000',
    checker_intender: '',
    mom_of_negotiations: '',
    ld_clause: 'Applicable',
    checker_intender_app_date: '1753-01-01 00:00:00.000',
    query_raised: 0,
    eval_fcg: '',
    status: 'In-Process',
    ras_details: 'Approved DPR',
    regulatory_approval: '',
    eval_intender: 1,
    offer_text: 'asdfasdfasd',
    offer_received_from: 1,
    checker_fcg: 'S Saha',
    soa_value: '1 month',
    eval_cc_approval_date: '1753-01-01 00:00:00.000',
    dcp_required: 'CAPEX',
    offer_validity: '1753-01-01 00:00:00.000',
    budget: 'CAPEX',
    company_code: '1000',
    ld_clause_text: 'Applicable',
    scope: '',
    pbg: 'asdfasdfasd',
    costbenchmarking_remark: '',
    process_type: 'Services',
  },
  {
    r_object_id: '080026aa801551d4',
    i_partition: 0,
    payment_terms: 'P30 - 30 days From GR date w/o Retention',
    total_comm_above_purchase: 0,
    special_comments: 'Work is already complete. This is a post facto approval',
    file_ref_no: 'TPC/IEL/KAL/ELE/GROUT/001',
    justification: 'The price analysis and calculation sheet is attached.',
    eval_fcg_approval_date: '1753-01-01 00:00:00.000',
    checker_intender: '',
    mom_of_negotiations: '',
    ld_clause: 'Not Applicable',
    checker_intender_app_date: '1753-01-01 00:00:00.000',
    query_raised: 0,
    eval_fcg: '',
    status: 'Approved',
    ras_details: 'Approved DPR',
    regulatory_approval: '',
    eval_intender: 1,
    offer_text: 'O&M and Site Procurement',
    offer_received_from: 1,
    checker_fcg: 'S Saha',
    soa_value: 'PMC approval',
    eval_cc_approval_date: '1753-01-01 00:00:00.000',
    dcp_required: 'CAPEX',
    offer_validity: '1753-01-01 00:00:00.000',
    budget: 'CAPEX',
    company_code: '1000',
    ld_clause_text: 'Not Applicable',
    scope: '',
    pbg: 'Project Procurement',
    costbenchmarking_remark: '',
    process_type: 'Project Management',
  },
];

const docbaseFormRRows = [
  { r_object_id: '080026aa8014a2d3', i_position: -2, i_partition: 0, pr_number: null, md_email_cc_users: null },
  { r_object_id: '080026aa8014a2d3', i_position: -1, i_partition: 0, pr_number: '2000007584', md_email_cc_users: null },
  { r_object_id: '080026aa8014e0b2', i_position: -2, i_partition: 0, pr_number: '24544654', md_email_cc_users: null },
  { r_object_id: '080026aa8014e0b2', i_position: -1, i_partition: 0, pr_number: '7897897', md_email_cc_users: null },
  { r_object_id: '080026aa8014fc7d', i_position: -2, i_partition: 0, pr_number: null, md_email_cc_users: null },
  { r_object_id: '080026aa8014fc7d', i_position: -1, i_partition: 0, pr_number: null, md_email_cc_users: null },
  { r_object_id: '080026aa8014fcb0', i_position: -2, i_partition: 0, pr_number: null, md_email_cc_users: null },
  { r_object_id: '080026aa8014fcb0', i_position: -1, i_partition: 0, pr_number: null, md_email_cc_users: null },
  { r_object_id: '080026aa801551d4', i_position: -2, i_partition: 0, pr_number: null, md_email_cc_users: null },
  { r_object_id: '080026aa801551d4', i_position: -1, i_partition: 0, pr_number: null, md_email_cc_users: null },
  { r_object_id: '080026aa801571d2', i_position: -2, i_partition: 0, pr_number: null, md_email_cc_users: null },
  { r_object_id: '080026aa801571d2', i_position: -1, i_partition: 0, pr_number: null, md_email_cc_users: null },
  { r_object_id: '080026aa8015969f', i_position: -2, i_partition: 0, pr_number: null, md_email_cc_users: null },
  { r_object_id: '080026aa8015969f', i_position: -1, i_partition: 0, pr_number: '1000006820', md_email_cc_users: null },
  { r_object_id: '080026aa80159a08', i_position: -2, i_partition: 0, pr_number: null, md_email_cc_users: null },
  { r_object_id: '080026aa80159a08', i_position: -1, i_partition: 0, pr_number: '2000007111', md_email_cc_users: null },
  { r_object_id: '080026aa8015a699', i_position: -2, i_partition: 0, pr_number: null, md_email_cc_users: null },
  { r_object_id: '080026aa8015a699', i_position: -1, i_partition: 0, pr_number: '2000007351', md_email_cc_users: null },
  { r_object_id: '080026aa8015a6b5', i_position: -2, i_partition: 0, pr_number: null, md_email_cc_users: null },
  { r_object_id: '080026aa8015a6b5', i_position: -1, i_partition: 0, pr_number: null, md_email_cc_users: null },
];

const docbaseEnclosureRows = [
  { r_object_id: '090026aa8014a94d', i_partition: 0, form_id: '080026aa8014a2d3', type: 'Quotation' },
  { r_object_id: '090026aa8015b78b', i_partition: 0, form_id: '080026aa8014e0b2', type: 'Price Analysis' },
  { r_object_id: '090026aa8015b78c', i_partition: 0, form_id: '080026aa8014e0b2', type: 'Price Analysis' },
  { r_object_id: '090026aa8015baf2', i_partition: 0, form_id: '080026aa8014e0b2', type: 'Price Analysis' },
  { r_object_id: '090026aa80a4c4a7', i_partition: 0, form_id: '080026aa8014e0b2', type: 'Revised Offers' },
  { r_object_id: '090026aa8015704a', i_partition: 0, form_id: '080026aa8014fc7d', type: 'Any Others' },
  { r_object_id: '090026aa801552e0', i_partition: 0, form_id: '080026aa801551d4', type: 'Price Analysis' },
  { r_object_id: '090026aa801552e2', i_partition: 0, form_id: '080026aa801551d4', type: 'Negotiation MoMs' },
  { r_object_id: '090026aa801552e3', i_partition: 0, form_id: '080026aa801551d4', type: 'Any Others' },
  { r_object_id: '090026aa801552e4', i_partition: 0, form_id: '080026aa801551d4', type: 'Any Others' },
  { r_object_id: '090026aa80157320', i_partition: 0, form_id: '080026aa801571d2', type: 'Price Analysis' },
  { r_object_id: '090026aa8016374c', i_partition: 0, form_id: '080026aa8015969f', type: 'Any Others' },
  { r_object_id: '090026aa8015905b', i_partition: 0, form_id: '080026aa80159a08', type: 'Any Others' },
  { r_object_id: '090026aa8015e306', i_partition: 0, form_id: '080026aa8015a699', type: 'SLA' },
  { r_object_id: '090026aa8015e307', i_partition: 0, form_id: '080026aa8015a699', type: 'Quotation' },
  { r_object_id: '090026aa8015e308', i_partition: 0, form_id: '080026aa8015a699', type: 'Price Analysis' },
  { r_object_id: '090026aa80166ac2', i_partition: 0, form_id: '080026aa8015a6b5', type: 'Any Others' },
  { r_object_id: '090026aa80166ac4', i_partition: 0, form_id: '080026aa8015a6b5', type: 'Any Others' },
  { r_object_id: '090026aa80166ac5', i_partition: 0, form_id: '080026aa8015a6b5', type: 'Any Others' },
  { r_object_id: '090026aa80166ac6', i_partition: 0, form_id: '080026aa8015a6b5', type: 'Any Others' },
  { r_object_id: '090026aa80166ac7', i_partition: 0, form_id: '080026aa8015a6b5', type: 'Any Others' },
  { r_object_id: '090026aa80166ac8', i_partition: 0, form_id: '080026aa8015a6b5', type: 'Any Others' },
  { r_object_id: '090026aa80169e1b', i_partition: 0, form_id: '080026aa8015a6b5', type: 'Any Others' },
  { r_object_id: '090026aa8015b6c1', i_partition: 0, form_id: '080026aa8015a6b5', type: 'Any Others' },
  { r_object_id: '090026aa8015b9e8', i_partition: 0, form_id: '080026aa8015a6b5', type: 'Scope of Work' },
  { r_object_id: '090026aa8015b9ea', i_partition: 0, form_id: '080026aa8015a6b5', type: 'BOQ' },
  { r_object_id: '090026aa8015b9eb', i_partition: 0, form_id: '080026aa8015a6b5', type: 'BOQ' },
  { r_object_id: '090026aa8015b9ec', i_partition: 0, form_id: '080026aa8015a6b5', type: 'BOQ' },
  { r_object_id: '090026aa8015b9ed', i_partition: 0, form_id: '080026aa8015a6b5', type: 'BOQ' },
  { r_object_id: '090026aa8015ba1e', i_partition: 0, form_id: '080026aa8015a6b5', type: 'Negotiation MoMs' },
  { r_object_id: '090026aa8015ba21', i_partition: 0, form_id: '080026aa8015a6b5', type: 'Negotiation MoMs' },
  { r_object_id: '090026aa8015ba22', i_partition: 0, form_id: '080026aa8015a6b5', type: 'Negotiation MoMs' },
  { r_object_id: '090026aa8015ba24', i_partition: 0, form_id: '080026aa8015a6b5', type: 'Any Others' },
];

const docbaseFileRows = [
  { r_object_id: '00f47a078000290a', i_is_replica: 0, i_vstamp: 0, doc_file_path: 'documents/00f47a078000290a.docm', doc_r_object_id: '09f47a07804fe47d' },
  { r_object_id: '00f47a0780002914', i_is_replica: 0, i_vstamp: 0, doc_file_path: 'documents/00f47a0780002914.docm', doc_r_object_id: '09f47a07804febfb' },
  { r_object_id: '00f47a078000291e', i_is_replica: 0, i_vstamp: 0, doc_file_path: 'documents/00f47a078000291e.doc', doc_r_object_id: '09f47a07804e7062' },
  { r_object_id: '00f47a0780002928', i_is_replica: 0, i_vstamp: 0, doc_file_path: 'documents/00f47a0780002928.pdf', doc_r_object_id: '09f47a07804fd01f' },
  { r_object_id: '00f47a0780002938', i_is_replica: 0, i_vstamp: 0, doc_file_path: 'documents/eoaf-ld-form-001.pdf', doc_r_object_id: '080026aa8d010001' },
  { r_object_id: '00f47a0780002939', i_is_replica: 0, i_vstamp: 0, doc_file_path: 'documents/eoaf-scrapcad-form-001.pdf', doc_r_object_id: '080026aa8d020001' },
  { r_object_id: '00f47a0780002940', i_is_replica: 0, i_vstamp: 0, doc_file_path: 'documents/eoaf-ld-enclosure-001.pdf', doc_r_object_id: '090026aa8d010001' },
  { r_object_id: '00f47a0780002941', i_is_replica: 0, i_vstamp: 0, doc_file_path: 'documents/eoaf-scrapcad-enclosure-001.pdf', doc_r_object_id: '090026aa8d020001' },
];

const eoafLdFormRows = [
  {
    r_object_id: '080026aa8d010001',
    i_partition: 0,
    discussions_and_agreement: 'LD agreement discussion notes',
    approval2_date_time: '2024-01-10 00:00:00.000',
    approver4: 'Approver 4',
    approver3: 'Approver 3',
    file_ref_no: 'LD-FORM-001',
    special_comments: 'Sample LD form entry',
    approver2: 'Approver 2',
    approver1: 'Approver 1',
    oaf_no: 'OAF-LD-001',
    form_status: 'Draft',
    back_ground_of_the_package_: 'Background for legal delay',
    approval_level: 1,
    approval3_date_time: '2024-01-11 00:00:00.000',
    unique_id: 'LD-UNQ-001',
    approval1_date_time: '2024-01-09 00:00:00.000',
    ld_subject: 'LD sample subject',
    company_name: 'Sample Company',
    approver5: 'Approver 5',
    approver6: 'Approver 6',
    query_raised: 0,
    initiator_approval_date_tim: '2024-01-08 00:00:00.000',
    po_criteria: 'Standard PO criteria',
    package_name: 'Sample package',
    approval6_date_time: '2024-01-12 00:00:00.000',
    oaf_date: '2024-01-05 00:00:00.000',
    approval4_date_time: '2024-01-13 00:00:00.000',
    contractual_ld_clause: 'Contractual LD clause text',
    company_code: '1000',
    clusters: 'Cluster A',
  },
];

const eoafLdFormRRows = [
  {
    r_object_id: '080026aa8d010001',
    i_position: 0,
    i_partition: 0,
    reviewed_by: 'Reviewer A',
    sap_po_no: 'SAP-001',
    reviewers: 'Reviewer A',
    approved_by: 'Approver X',
    po_value: 123456,
    reviewer_hod_designation: 'HOD Legal',
    reviewer_hod_s: 'HOD Designation',
    reviewer_designation: 'Legal Reviewer',
  },
];

const eoafLdEnclosureRows = [
  {
    r_object_id: '090026aa8d010001',
    i_partition: 0,
    attachment_types: 'Quotation',
    related_memo_id: '080026aa8d010001',
  },
];

const eoafScrapcadFormRows = [
  {
    r_object_id: '080026aa8d020001',
    i_partition: 0,
    no_of_days_left: 30,
    store: '2024-02-01 00:00:00.000',
    memo_no: 'SCRAP-001',
    file_ref_no: 'SCRAP001',
    special_comments: 'Sample Scrap/CAD form entry',
    form_status: 'Draft',
    pre_audit_approve_date: '2024-02-02 00:00:00.000',
    pre_audit_desg: 'Pre Audit Desg',
    cc_head: 'CC Head',
    business_area_description: 'Business area description',
    sec_head_desg: 'Sec Head Desg',
    cfo_approve_date: '2024-02-03 00:00:00.000',
    store_initiator_cad: 'Store Initiator',
    chief_ccm: 'Chief CCM',
    store_hod_cad: 'Store HOD CAD',
    approval_category: 'Approval Category',
    fcg_pre_audit_cad: 'FCG Pre Audit CAD',
    query_raised: 0,
    financial_controller_cad: 'Financial Controller CAD',
    cfo_cad: 'CFO CAD',
    store_hod_cad_approve_date: '2024-02-04 00:00:00.000',
    cfo_cad_approval_date: '2024-02-05 00:00:00.000',
    estimated_value_b_: 10000,
    modify_flag: 0,
    cc_sectional_head_app_date: '2024-02-06 00:00:00.000',
    written_down_value_a_: 5000,
    oaf_date: '2024-02-01 00:00:00.000',
    cc_head_desg: 'CC Head Desg',
    revenue_as_per_h1_bidder__1: 12345.67,
    financial_controller_cad_ap: '2024-02-07 00:00:00.000',
    approval_level: 1,
    company_code: '2000',
    clusters: 'Cluster B',
  },
];

const eoafScrapcadFormRRows = [
  {
    r_object_id: '080026aa8d020001',
    i_position: 0,
    i_partition: 0,
    md_cc_email_users: 'scrapcad@example.com',
    cgpl_ed_eas: 'CGPL ED/EAS',
    ed_and_ceo_ea: 'ED and CEO EA',
    final_app_ea: 'Final Approver EA',
  },
];

const eoafScrapEnclosureRows = [
  {
    r_object_id: '090026aa8d020001',
    i_partition: 0,
    related_memo_id: '080026aa8d020001',
  },
];

const seedDocbaseSampleData = async (client) => {
  for (const row of docbaseFormRows) {
    const { rows: existingRows } = await client.query(
      'SELECT 1 FROM xoaf_form_s WHERE r_object_id = $1',
      [row.r_object_id]
    );
    if (existingRows.length > 0) continue;

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
        row.r_object_id,
        row.i_partition,
        row.payment_terms,
        row.total_comm_above_purchase,
        row.special_comments,
        row.file_ref_no,
        row.justification,
        row.eval_fcg_approval_date,
        row.checker_intender,
        row.mom_of_negotiations,
        row.ld_clause,
        row.checker_intender_app_date,
        row.query_raised,
        row.eval_fcg,
        row.status,
        row.ras_details,
        row.regulatory_approval,
        row.eval_intender,
        row.offer_text,
        row.offer_received_from,
        row.checker_fcg,
        row.soa_value,
        row.eval_cc_approval_date,
        row.dcp_required,
        row.offer_validity,
        row.budget,
        row.company_code,
        row.ld_clause_text,
        row.scope,
        row.pbg,
        row.costbenchmarking_remark,
        row.process_type,
      ]
    );
  }

  for (const row of docbaseFormRRows) {
    const { rows: existingRows } = await client.query(
      'SELECT 1 FROM xoaf_form_r WHERE r_object_id = $1 AND i_position = $2 AND i_partition = $3',
      [row.r_object_id, row.i_position, row.i_partition]
    );
    if (existingRows.length > 0) continue;

    await client.query(
      `INSERT INTO xoaf_form_r (r_object_id, i_position, i_partition, pr_number, md_email_cc_users)
       VALUES ($1,$2,$3,$4,$5)`,
      [row.r_object_id, row.i_position, row.i_partition, row.pr_number, row.md_email_cc_users]
    );
  }

  for (const row of docbaseEnclosureRows) {
    const { rows: existingRows } = await client.query(
      'SELECT 1 FROM xoaf_enclosure_s WHERE r_object_id = $1 AND form_id = $2 AND "type" = $3',
      [row.r_object_id, row.form_id, row.type]
    );
    if (existingRows.length > 0) continue;

    await client.query(
      `INSERT INTO xoaf_enclosure_s (r_object_id, i_partition, form_id, "type")
       VALUES ($1,$2,$3,$4)`,
      [row.r_object_id, row.i_partition, row.form_id, row.type]
    );
  }

  // Seed document file mappings
  for (const row of docbaseFileRows) {
    const { rows: existingRows } = await client.query(
      'SELECT 1 FROM source_file_path_s WHERE r_object_id = $1 AND doc_r_object_id = $2',
      [row.r_object_id, row.doc_r_object_id]
    );
    if (existingRows.length > 0) continue;

    await client.query(
      `INSERT INTO source_file_path_s (r_object_id, i_is_replica, i_vstamp, doc_file_path, doc_r_object_id)
       VALUES ($1,$2,$3,$4,$5)`,
      [row.r_object_id, row.i_is_replica, row.i_vstamp, row.doc_file_path, row.doc_r_object_id]
    );
  }
};

const seedEoafLdSampleData = async (client) => {
  for (const row of eoafLdFormRows) {
    const { rows: existingRows } = await client.query(
      'SELECT 1 FROM xoaf_ld_form_s WHERE r_object_id = $1',
      [row.r_object_id]
    );
    if (existingRows.length > 0) continue;

    await client.query(
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
         $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33,$34,$35,$36,$37,$38,$39,$40,$41,$42,$43,$44,$45,$46,$47,$48,$49,$50,$51,$52,$53,$54,$55,$56,$57,$58
       )`,
      [
        row.r_object_id,
        row.i_partition,
        row.discussions_and_agreement,
        row.approval2_date_time,
        row.approver4,
        row.approver3,
        row.file_ref_no,
        row.special_comments,
        row.approver2,
        row.approver1,
        row.oaf_no,
        row.form_status,
        row.back_ground_of_the_package_,
        row.approval_level,
        row.approval3_date_time,
        row.unique_id,
        row.approval1_date_time,
        row.ld_subject,
        row.company_name,
        row.approver5,
        row.approver6,
        row.query_raised,
        row.initiator_approval_date_tim,
        row.po_criteria,
        row.package_name,
        row.approval6_date_time,
        row.oaf_date,
        row.approval4_date_time,
        row.contractual_ld_clause,
        row.category,
        row.proposal_to_management_for_,
        row.initiator,
        row.approval5_date_time,
        row.delay_analysis_in_brief,
        row.project_plant_name,
        row.order_type,
        row.package_value_total,
        row.reviewer3_approval_date,
        row.reviewer2_approval_date,
        row.approver3_designation,
        row.company_code,
        row.reviewer1_approval_date,
        row.reviewer5_approval_date,
        row.approver5_designation,
        row.approver6_designation,
        row.modify_it,
        row.reviewer4_approval_date,
        row.approver4_designation,
        row.approver1_designation,
        row.approver2_designation,
        row.department_description,
        row.department_code,
        row.reviewer2_designation,
        row.reviewer4_designation,
        row.reviewer1_designation,
        row.reviewer3_designation,
        row.reviewer5_designation,
        row.clusters,
      ]
    );
  }

  for (const row of eoafLdFormRRows) {
    const { rows: existingRows } = await client.query(
      'SELECT 1 FROM xoaf_ld_form_r WHERE r_object_id = $1 AND i_position = $2 AND i_partition = $3',
      [row.r_object_id, row.i_position, row.i_partition]
    );
    if (existingRows.length > 0) continue;

    await client.query(
      `INSERT INTO xoaf_ld_form_r (
         r_object_id, i_position, i_partition, reviewed_by, sap_po_no,
         reviewers, approved_by, po_value, reviewer_hod_designation,
         reviewer_hod_s, reviewer_designation
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      [
        row.r_object_id,
        row.i_position,
        row.i_partition,
        row.reviewed_by,
        row.sap_po_no,
        row.reviewers,
        row.approved_by,
        row.po_value,
        row.reviewer_hod_designation,
        row.reviewer_hod_s,
        row.reviewer_designation,
      ]
    );
  }

  for (const row of eoafLdEnclosureRows) {
    const { rows: existingRows } = await client.query(
      'SELECT 1 FROM xoaf_ld_enclosures_s WHERE r_object_id = $1 AND related_memo_id = $2',
      [row.r_object_id, row.related_memo_id]
    );
    if (existingRows.length > 0) continue;

    await client.query(
      `INSERT INTO xoaf_ld_enclosures_s (
         r_object_id, i_partition, attachment_types, related_memo_id
       ) VALUES ($1,$2,$3,$4)`,
      [row.r_object_id, row.i_partition, row.attachment_types, row.related_memo_id]
    );
  }
};

const seedEoafScrapcadSampleData = async (client) => {
  for (const row of eoafScrapcadFormRows) {
    const { rows: existingRows } = await client.query(
      'SELECT 1 FROM xoaf_scrapcad_form_s WHERE r_object_id = $1',
      [row.r_object_id]
    );
    if (existingRows.length > 0) continue;

    await client.query(
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
        row.r_object_id,
        row.i_partition,
        row.no_of_days_left,
        row.store,
        row.memo_no,
        row.file_ref_no,
        row.special_comments,
        row.form_status,
        row.pre_audit_approve_date,
        row.pre_audit_desg,
        row.cc_head,
        row.business_area_description,
        row.sec_head_desg,
        row.cfo_approve_date,
        row.store_initiator_cad,
        row.chief_ccm,
        row.store_hod_cad,
        row.approval_category,
        row.fcg_pre_audit_cad,
        row.query_raised,
        row.financial_controller_cad,
        row.cfo_cad,
        row.store_hod_cad_approve_date,
        row.cfo_cad_approval_date,
        row.estimated_value_b_,
        row.modify_flag,
        row.cc_sectional_head_app_date,
        row.written_down_value_a_,
        row.oaf_date,
        row.cc_head_desg,
        row.revenue_as_per_h1_bidder__1,
        row.financial_controller_cad_ap,
        row.chief_sbu_approve_date,
        row.chief_cf_and_a_approve_date,
        row.memo_type,
        row.bid_validity_expires_on,
        row.fcg_pre_audit_cad_desg,
        row.loss_total,
        row.final_reviewer_cad_app_date,
        row.pre_audit,
        row.chief_sbu_cad,
        row.fcg_pre_audit_cad_approve_d,
        row.chief_corp_fa_cad,
        row.financial_controller_cad_de,
        row.md_desg,
        row.company_code,
        row.chief_ccm_approve_date,
        row.chief_corp_f_a_desg,
        row.chief_corporate_f_a,
        row.lot_recommended_for_disposa,
        row.financial_year,
        row.approval_level,
        row.unique_id,
        row.cc_head_approve_date,
        row.realizable_value_total,
        row.division,
        row.md,
        row.book_value_total,
        row.bid_validity_date,
        row.e_auction_date,
        row.business_area,
        row.store_hod_cad_desg,
        row.company_code_description,
        row.chief_sbu_cad_desg,
        row.cc_sectional_head,
        row.final_reviewer_approve_date,
        row.cfo_desg,
        row.cfo,
        row.soa_clause,
        row.initiator,
        row.cfo_cad_desg,
        row.chief_ccm_desg,
        row.net_revenue_d_c_a_,
        row.md_approve_date,
        row.cost_center,
        row.ed_and_ceo_cad,
        row.bid_validity_days,
        row.ed_and_ceo_cad_approve_date,
        row.ed_and_ceo_cad_desg,
        row.materialdetailsuniqueid,
        row.clusters,
      ]
    );
  }

  for (const row of eoafScrapcadFormRRows) {
    const { rows: existingRows } = await client.query(
      'SELECT 1 FROM xoaf_scrapcad_form_r WHERE r_object_id = $1 AND i_position = $2 AND i_partition = $3',
      [row.r_object_id, row.i_position, row.i_partition]
    );
    if (existingRows.length > 0) continue;

    await client.query(
      `INSERT INTO xoaf_scrapcad_form_r (
         r_object_id, i_position, i_partition, md_cc_email_users,
         cgpl_ed_eas, ed_and_ceo_ea, final_app_ea
       ) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [
        row.r_object_id,
        row.i_position,
        row.i_partition,
        row.md_cc_email_users,
        row.cgpl_ed_eas,
        row.ed_and_ceo_ea,
        row.final_app_ea,
      ]
    );
  }

  for (const row of eoafScrapEnclosureRows) {
    const { rows: existingRows } = await client.query(
      'SELECT 1 FROM xoaf_scrap_enclosures_s WHERE r_object_id = $1 AND related_memo_id = $2',
      [row.r_object_id, row.related_memo_id]
    );
    if (existingRows.length > 0) continue;

    await client.query(
      `INSERT INTO xoaf_scrap_enclosures_s (
         r_object_id, i_partition, related_memo_id
       ) VALUES ($1,$2,$3)`,
      [row.r_object_id, row.i_partition, row.related_memo_id]
    );
  }
};

const seed = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // ── Seed Roles ──────────────────────────────────────────
    console.log('Seeding roles...');
      const roles = [
        { name: 'admin', description: 'Full system access', is_system_role: true },
        { name: 'viewer', description: 'Read-only access', is_system_role: true },
      ];

    const roleIds = {};
    for (const role of roles) {
      const { rows } = await client.query(
        `INSERT INTO roles (name, description, is_system_role)
         VALUES ($1, $2, $3)
         ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description
         RETURNING id, name`,
        [role.name, role.description, role.is_system_role]
      );
      roleIds[rows[0].name] = rows[0].id;
      console.log(`  ✅ Role: ${rows[0].name}`);
    }

    // No fine-grained permissions in simplified model

    // ── Seed Admin User ──────────────────────────────────────
    console.log('\nSeeding admin user...');
    const passwordHash = await bcrypt.hash('Admin@123', parseInt(process.env.BCRYPT_ROUNDS) || 12);

    const { rows: userRows } = await client.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, is_active)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (email) DO UPDATE SET first_name = EXCLUDED.first_name
       RETURNING id, email`,
      ['admin@rbac.com', passwordHash, 'System', 'Admin', true]
    );

    const adminUser = userRows[0];
    console.log(`  ✅ Admin user: ${adminUser.email}`);

    // Assign admin role to admin user
    await client.query(
      `INSERT INTO user_roles (user_id, role_id, assigned_by)
       VALUES ($1, $2, $1)
       ON CONFLICT DO NOTHING`,
      [adminUser.id, roleIds['admin']]
    );
    console.log('  ✅ Admin role assigned to admin user');

    console.log('\nSeeding docbase sample metadata...');
    await seedDocbaseSampleData(client);
    console.log('  ✅ Docbase sample metadata seeded');

    console.log('\nSeeding EOAF LD sample metadata...');
    await seedEoafLdSampleData(client);
    console.log('  ✅ EOAF LD sample metadata seeded');

    console.log('\nSeeding EOAF Scrap/CAD sample metadata...');
    await seedEoafScrapcadSampleData(client);
    console.log('  ✅ EOAF Scrap/CAD sample metadata seeded');

    await client.query('COMMIT');
    console.log('\n🎉 Seeding completed successfully!');
    console.log('\nAdmin credentials:');
    console.log('  Email:    admin@rbac.com');
    console.log('  Password: Admin@123');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
};

seed();
