// config/db.mssql.js
const sql = require('mssql');

const mssqlConfig = {
  server:   process.env.MSSQL_HOST     || 'localhost',
  port:     parseInt(process.env.MSSQL_PORT || '1433', 10),
  database: process.env.MSSQL_DATABASE || 'dm_General_docbase',
  user:     process.env.MSSQL_USER     || 'sa',
  password: process.env.MSSQL_PASSWORD || '',
  options: {
    encrypt:                process.env.MSSQL_ENCRYPT !== 'false', // true for Azure
    trustServerCertificate: process.env.MSSQL_TRUST_CERT === 'true', // for self-signed certs
    enableArithAbort:       true,
  },
  pool: {
    max:             parseInt(process.env.MSSQL_POOL_MAX     || '10', 10),
    min:             parseInt(process.env.MSSQL_POOL_MIN     || '0',  10),
    idleTimeoutMillis: parseInt(process.env.MSSQL_IDLE_TIMEOUT || '30000', 10),
  },
};

let poolPromise = null;

const getPool = () => {
  if (!poolPromise) {
    poolPromise = sql.connect(mssqlConfig)
      .then((pool) => {
        console.log('[MSSQL] Connected successfully');
        return pool;
      })
      .catch((err) => {
        poolPromise = null; // allow retry on next call
        console.error('[MSSQL] Connection failed:', err.message);
        throw err;
      });
  }
  return poolPromise;
};

/**
 * Bind all positional params to the MSSQL request as @p1, @p2 ...
 * Type inference: Date → DateTime, number → numeric, else NVarChar.
 */
const bindParams = (request, params = []) => {
  params.forEach((value, index) => {
    const name = `p${index + 1}`;
    if (value === null || value === undefined) {
      request.input(name, sql.NVarChar, null);
    } else if (value instanceof Date) {
      request.input(name, sql.DateTime2, value);
    } else if (typeof value === 'number') {
      Number.isInteger(value)
        ? request.input(name, sql.Int, value)
        : request.input(name, sql.Decimal(18, 2), value);
    } else if (typeof value === 'boolean') {
      request.input(name, sql.Bit, value ? 1 : 0);
    } else {
      // String — covers date strings like '2024-01-01 23:59:59' too
      request.input(name, sql.NVarChar, String(value));
    }
  });
};


/**
 * Execute a parameterised query using MSSQL-native SQL.
 *
 * @param {string} sqlText - MSSQL-compatible SQL text
 * @param {Array}  params  - Parameter values
 * @returns {{ rows: Array, rowCount: number }}
 */
const query = async (sqlText, params = []) => {
  const pool    = await getPool();
  const request = pool.request();
  bindParams(request, params);

  const result = await request.query(sqlText);
  return {
    rows:     result.recordset || [],
    rowCount: result.rowsAffected?.[0] ?? 0,
  };
};

/**
 * Run multiple queries inside a single MSSQL transaction.
 * @param {function} fn  - async (txQuery) => { ... }
 *   txQuery has the same signature as query() above.
 */
const withTransaction = async (fn) => {
  const pool        = await getPool();
  const transaction = new sql.Transaction(pool);

  await transaction.begin();
  try {
    const txQuery = async (sqlText, params = []) => {
      const request  = new sql.Request(transaction);
      bindParams(request, params);
      const result = await request.query(sqlText);
      return {
        rows:     result.recordset || [],
        rowCount: result.rowsAffected?.[0] ?? 0,
      };
    };

    const result = await fn(txQuery);
    await transaction.commit();
    return result;
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
};

module.exports = { query, withTransaction, pool: getPool };