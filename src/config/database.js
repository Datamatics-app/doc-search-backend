const {
  query: authQuery,
  withTransaction: authWithTransaction,
  pool: pgAuthPool,
} = require('./db.postgres');

const {
  query: eoafQuery,
  withTransaction: eoafWithTransaction,
  pool: eoafPool,
} = require('./db.mssql');

module.exports = {
  // PostgreSQL for auth, roles, users, audit and related RBAC flows
  query: authQuery,
  authQuery,
  withTransaction: authWithTransaction,
  authWithTransaction,
  pgAuthPool,
  pool: pgAuthPool,

  // MSSQL for EOAF metadata access only
  eoafQuery,
  eoafWithTransaction,
  eoafPool,
};