require('dotenv').config();
const { authQuery } = require('../config/database');

const seedData = {
  companies: [
    { code: 'C001', name: 'ABC Industries' },
    { code: 'C002', name: 'XYZ Solutions' },
    { code: 'C003', name: 'SecureTech Pvt Ltd' },
  ],
  clusters: ['Corporate', 'Technology', 'Admin', 'Logistics'],
  statuses: ['Draft', 'Pending', 'Approved', 'Rejected'],
  'process-types': ['Tender', 'RFQ', 'Single Source', 'Renewal'],
  'soa-clauses': [
    'Standard Delivery Clause',
    'Force Majeure',
    'Payment on Delivery',
    'Warranty and Liability',
  ],
  'eoaf-types': ['Standard', 'Emergency', 'Repeat Order', 'Amendment'],
};

const insertRows = async (table, rows, columnName) => {
  for (const row of rows) {
    const value = typeof row === 'object' ? row[columnName] : row;
    const existing = await authQuery(`SELECT id FROM ${table} WHERE LOWER(name) = LOWER($1)`, [value]);
    if (existing.rows.length === 0) {
      await authQuery(`INSERT INTO ${table} (name) VALUES ($1)`, [value]);
    }
  }
};

const seedCompanies = async () => {
  for (const company of seedData.companies) {
    const existing = await authQuery('SELECT id FROM companies WHERE LOWER(code) = LOWER($1) OR LOWER(name) = LOWER($2)', [company.code, company.name]);
    if (existing.rows.length === 0) {
      await authQuery('INSERT INTO companies (code, name) VALUES ($1, $2)', [company.code, company.name]);
    }
  }
};

const seed = async () => {
  try {
    await seedCompanies();
    await insertRows('clusters', seedData.clusters, 'name');
    await insertRows('statuses', seedData.statuses, 'name');
    await insertRows('process_types', seedData['process-types'], 'name');
    await insertRows('soa_clauses', seedData['soa-clauses'], 'name');
    await insertRows('eoaf_types', seedData['eoaf-types'], 'name');
    console.log('Master data seed completed');
  } catch (error) {
    console.error('Master data seed failed:', error.message);
    process.exit(1);
  }
};

seed();
