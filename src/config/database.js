const dbType = (process.env.DB_TYPE || 'postgres').toLowerCase();
const { Pool } = require('pg');

let eoafDb;
 
if (dbType === 'mssql') {
  console.log('[DB] EOAF database driver: MSSQL (production)');
  eoafDb = require('./db.mssql');
} else {
  console.log('[DB] EOAF database driver: PostgreSQL (development)');
  eoafDb = require('./db.postgres');
}
 
// ── EOAF data queries (switches between pg / mssql based on DB_TYPE) ─────────
const { query, withTransaction } = eoafDb;


const pgAuthPool  = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'rbac_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  // connectionTimeoutMillis: 2000,
});

pgAuthPool.on('error', (err) => {
  console.error('[PostgreSQL Auth] Unexpected pool error:', err.message);
});

/**
 * Auth-specific query helper — always hits PostgreSQL.
 * Use this in auth/role services.
 */
const authQuery = async (sql, params = []) => {
  const client = await pgAuthPool.connect();
  try {
    const result = await client.query(sql, params);
    return { rows: result.rows, rowCount: result.rowCount };
  } finally {
    client.release();
  }
};


module.exports = {
  // EOAF data — env-switched (postgres dev / mssql prod)
  query,
  withTransaction,
 
  // Auth/role management — always PostgreSQL
  authQuery,
  pgAuthPool,
 
  // Raw pool export kept for seed scripts that need direct pool access
  pool: eoafDb.pool,
};