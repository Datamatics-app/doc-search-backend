// config/db.mssql.js
const sql = require('mssql');

const mssqlConfig = {
  server:   process.env.MSSQL_HOST     || 'localhost',
  port:     parseInt(process.env.MSSQL_PORT || '1433', 10),
  database: process.env.MSSQL_DATABASE || 'dm_General_docbase',
  user:     process.env.MSSQL_USER     || 'Dmsadminprod',
  password: process.env.MSSQL_PASSWORD, // no hardcoded fallback — fail loudly if unset
  options: {
    encrypt:                process.env.MSSQL_ENCRYPT !== 'false',
    trustServerCertificate: process.env.MSSQL_TRUST_CERT === 'true',
    enableArithAbort:       true,
  },
  pool: {
    max:             parseInt(process.env.MSSQL_POOL_MAX     || '10', 10),
    min:             parseInt(process.env.MSSQL_POOL_MIN     || '0',  10),
    idleTimeoutMillis: parseInt(process.env.MSSQL_IDLE_TIMEOUT || '30000', 10),
  },
};

if (!mssqlConfig.password) {
  throw new Error('[MSSQL] MSSQL_PASSWORD env var is required and not set.');
}

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
 * Convert PostgreSQL $1,$2 placeholders → MSSQL @p1,@p2
 * and return the rewritten SQL string.
 */
const convertPlaceholders = (pgSql) =>
  pgSql.replace(/\$(\d+)/g, '@p$1');

/**
 * Convert ILIKE → LIKE  (MSSQL is case-insensitive by default per collation)
 */
const convertIlike = (sqlStr) =>
  sqlStr.replace(/\bILIKE\b/gi, 'LIKE');

/**
 * Convert PostgreSQL double-quoted identifiers → MSSQL square brackets.
 * e.g. "type" → [type]
 */
const convertQuotedIdentifiers = (sqlStr) =>
  sqlStr.replace(/"([^"]+)"/g, '[$1]');


const convertPagination = (sqlStr) =>
  sqlStr.replace(
    /LIMIT\s+(@p\d+)\s+OFFSET\s+(@p\d+)/gi,
    'OFFSET $2 ROWS FETCH NEXT $1 ROWS ONLY'
  );

// Bare "LIMIT n" (no OFFSET) → "SELECT TOP (n) ..." with LIMIT clause stripped.
// Only matches a LIMIT that trails the statement (optionally followed by ; or
// whitespace) so it doesn't accidentally eat a LIMIT that's part of a
// LIMIT/OFFSET pair already handled above.
const convertLimitOnly = (sqlStr) => {
  const trimmed = sqlStr.trimEnd();
  const limitMatch = trimmed.match(/\sLIMIT\s+(@p\d+|\d+)\s*;?\s*$/i);
  if (!limitMatch) return sqlStr;

  const n = limitMatch[1];
  const withoutLimit = trimmed.slice(0, limitMatch.index);

  // Insert TOP (n) right after the first SELECT keyword (handles leading
  // whitespace/newlines and an optional DISTINCT).
  const withTop = withoutLimit.replace(
    /^(\s*SELECT\s+)(DISTINCT\s+)?/i,
    (m, selectKw, distinctKw = '') => `${selectKw}TOP (${n}) ${distinctKw}`
  );

  return withTop;
};

const translateSql = (pgSql) => {
  let out = pgSql;
  out = convertPlaceholders(out);
  out = convertIlike(out);
  out = convertQuotedIdentifiers(out);
  out = convertPagination(out);
  out = convertLimitOnly(out); // catches any LIMIT n left over after pagination pass
  return out;
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
 * Execute a parameterised query.
 * Accepts PostgreSQL-style SQL ($1,$2, ILIKE, LIMIT/OFFSET, "quoted")
 * and translates automatically for MSSQL.
 *
 * @param {string} pgSql   - PostgreSQL-style SQL
 * @param {Array}  params  - Parameter values
 * @returns {{ rows: Array, rowCount: number }}
 */
const query = async (pgSql, params = []) => {
  const pool    = await getPool();
  const mssql   = translateSql(pgSql);
  const request = pool.request();
  bindParams(request, params);

  const result = await request.query(mssql);
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
    const txQuery = async (pgSql, params = []) => {
      const mssqlSql = translateSql(pgSql);
      const request  = new sql.Request(transaction);
      bindParams(request, params);
      const result = await request.query(mssqlSql);
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