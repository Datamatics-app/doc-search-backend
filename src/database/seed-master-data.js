require('dotenv').config();
const { authQuery, pgAuthPool } = require('../config/database');

const seedData = {
  eoaf: {
    eoafType: [
      'New e-OAF',
      'Emergency Procurement',
      'Single Page Approval',
      'Material Concept Note',
      'Composite Concept Note',
      'Recommendation Proposal',
      'E-OAF for repeat PO',
      'Change Order within contingency',
      'Single Party Approval',
      'Post Facto',
      'Change Order beyond contingency',
      'Service Concept Note',
    ],
    companyCode: ['2300', '4100', '2600', '2200', '1000', '2000', '2800', '4520', '3100', '2660', '2700'],
    clusters: [
      'Corporate Comm. & Sustainability',
      'Corporate Functions',
      'Renewables',
      'Fuel, Logistics & Land',
      'T&D',
      'D & IT',
      'Corporate Functions & International',
      'Company Secretary',
      'T & D',
      'Generation',
      'HR',
      'Legal, Regulatory & Advocacy',
      'Finance',
      'NA',
    ],
    status: ['In-Process', 'Dropped', 'Approved', 'Draft', 'Rejected', 'Deleted'],
    processType: [
      'Sale of Ash/Value added products',
      'Engineering & Non Engineering - Composite',
      'Non - Engineering - Supply',
      'O&M and Site Procurement-Within Contingency',
      'T&D BD-EOI/RFQ Submission',
      'Engineering',
      'Engineering & Non Engineering - Composite / Supply',
      'Terminalling Services',
      'Concept Note',
      'Others TPS',
      'O&M and Site Procurement',
      'Project Procurement',
      'Non Engineering',
      'Consultancy',
      'O&M and Site Procurement-Generation',
      'Engg & Non - Engineering - Supply/ Services/Composite',
      'Manufacturing TPS',
      'Projects TPS',
      'T&D BD-RFP Submission',
      'Fuel and Contracts',
      'Ash Disposal',
      'Engineering - Supply',
      'Engineering & Non Engineering - Services',
    ],
    budget: ['PROJ-CAPEX', 'CAPEX', 'Capex', 'OPEX', 'Opex', 'OPEX-CAPEX', 'OPEX-REVENUE', 'Revenue Income'],
    category: ['Emergency', 'Normal', 'Urgent'],
  },
  general: {
    companyCode: ['2300', '2670', '4100', '2600', '2200', '1000', '2000', '2800', '4520', '3100', '2660', '2100', '2700'],
    status: ['In-Process', 'Dropped', 'Approved', 'Draft', 'Rejected', 'Draftt'],
    category: [
      'Finance & Accounts',
      'Non-PO',
      'Emergency Purchase',
      'Settlement of Claims, Accounts, Dispute',
      'Trombay Instrumentation Maintenance Department',
      'Capex Procurement',
      'Document Control',
      'Fuel-CGPL',
      'Certificate of CARO',
      'Operations and Supply Chain Management',
      'Trombay Fire & Safety Department',
      'Others',
      'Consultant',
      'Disposal',
      'CSR',
      'RPT',
      'Consumer Relations-Marketing',
      'Revenue Expenditure Proposals',
      'Preventive Maintenance Plan',
      'Services business proposal(Value less than or equal 25 Crore)',
      'Modification Note',
      'Opex Procurement',
      'Pre-Bid Submission',
      'Approval for waiver of Payment Security Mechanism/security deposits',
      'Trombay Deferment Note',
      'T&D BD',
      'Hire of Vehicles',
      'Corporate Capex FY17',
      'Safety Bid Evaluation',
      'Change Modification',
      'Power Services',
      'Services business proposal',
      'Capital Expenditure',
      'Trombay Security',
      'Any Other Approval',
      'Management Proposal',
      'IEL Approval Memo',
      'Legal/Secretarial',
      'Trombay Civil Maintenance Department',
      'Asset Transfer',
      'Memo',
      'TPSSL Scrap',
      'Transfer Power',
      'Trombay Maintenance Planning',
      'Trombay Quality Inspection & Testing',
      'MTPS',
      'Approval for waiver of Delay Payment Surcharge recoverable by the company',
      'Scrap Disposal',
      'Employee Benefits',
      'Design Change Request',
      'Gen Investment Proposal including MandA opportunities',
      'Trombay Performance Department',
      'HR',
      'Asset Retirement',
      'Demurrage Charges',
      'Advertisement',
      'Single Party Approval',
      'Generic Approval',
      'Contract Closure',
      'Fuel Contracts',
      'Fuel',
      'Store Management',
      'Statutory Payments',
      'Packaging Philosophy',
      'PR Approval note',
      'Information Security',
      'Trombay Mechanical Maintenance Department',
      'Subscriptions',
      'To approve Bilateral Power Sale and Purchase Contracts',
      'MOC',
      'BCG',
      'Single Page eOAF',
      'Training-Conference',
      'ICT Infra Non SAP',
      'Administrator',
      'Ash Disposal',
      'Legal-Secretarial',
      'Public Relations and Advertising',
      'TrombayElectrical Maintenance Department',
      'Confirmatory PR',
      'To Settle any Claims,Accounts,Disputes',
    ],
  },
  ld: {
    orderType: ['CAPEX', 'O&M', 'OPEX', 'Project'],
    clusters: [
      'Corporate Comm. & Sustainability',
      'Corporate Functions',
      'Corporate Functions & International',
      'D & IT',
      'Finance',
      'Generation',
      'NA',
      'Renewables',
      'T & D',
      'T&D',
    ],
    companyCode: ['1000', '2000', '2200', '2300', 'P110'],
    companyName: [
      'Coastal Gujarat Power Ltd',
      'Industrial Energy Ltd',
      'Maithon Power Limited',
      'TATA Power Company Ltd.',
      'The Tata Power Co. Ltd.',
      'The Tata Power Company Ltd.',
    ],
  },
};

const insertRows = async (table, rows, columnName = 'value') => {
  for (const row of rows) {
    const value = typeof row === 'object' ? row[columnName] : row;
    const existing = await authQuery(`SELECT id FROM ${table} WHERE LOWER(${columnName}) = LOWER($1)`, [value]);
    if (existing.rows.length === 0) {
      await authQuery(`INSERT INTO ${table} (${columnName}) VALUES ($1)`, [value]);
    }
  }
};


const seed = async () => {
  try {


    await insertRows('xoaf_form_eoaf_type', seedData.eoaf.eoafType);
    await insertRows('xoaf_form_company_code', seedData.eoaf.companyCode);
    await insertRows('xoaf_form_clusters', seedData.eoaf.clusters);
    await insertRows('xoaf_form_status', seedData.eoaf.status);
    await insertRows('xoaf_form_process_type', seedData.eoaf.processType);
    await insertRows('xoaf_form_budget', seedData.eoaf.budget);
    await insertRows('xoaf_form_category', seedData.eoaf.category);

    await insertRows('xoaf_general_form_company_code', seedData.general.companyCode);
    await insertRows('xoaf_general_form_status', seedData.general.status);
    await insertRows('xoaf_general_form_category', seedData.general.category);

    await insertRows('xoaf_ld_form_order_type', seedData.ld.orderType);
    await insertRows('xoaf_ld_form_clusters', seedData.ld.clusters);
    await insertRows('xoaf_ld_form_company_code', seedData.ld.companyCode);
    await insertRows('xoaf_ld_form_company_name', seedData.ld.companyName);

    console.log('Master data seed completed');
  } catch (error) {
    console.error('Master data seed failed:', error.message);
    process.exit(1);
  } finally {
    await pgAuthPool.end();
  }
};

seed();
