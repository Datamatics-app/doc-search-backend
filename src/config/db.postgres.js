// config/db.postgres.js
const { Pool } = require('pg');

const pool = new Pool({
  host:                    process.env.DB_HOST     || 'localhost',
  port:                    parseInt(process.env.DB_PORT || '5432', 10),
  database:                process.env.DB_NAME     || 'rbac_db',
  user:                    process.env.DB_USER     || 'postgres',
  password:                process.env.DB_PASSWORD || '',
  max:                     parseInt(process.env.PG_POOL_MAX      || '10', 10),
  idleTimeoutMillis:       parseInt(process.env.PG_IDLE_TIMEOUT  || '30000', 10),
//   connectionTimeoutMillis: parseInt(process.env.PG_CONN_TIMEOUT  || '2000', 10),
});

pool.on('error', (err) => {
  console.error('[PostgreSQL] Unexpected pool error:', err.message);
});

const query = async (sql, params = []) => {
  const client = await pool.connect();
  try {
    const result = await client.query(sql, params);
    return { rows: result.rows, rowCount: result.rowCount };
  } finally {
    client.release();
  }
};

const withTransaction = async (fn) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const txQuery = (sql, params = []) => client.query(sql, params);
    const result = await fn(txQuery);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

module.exports = { query, withTransaction, pool };