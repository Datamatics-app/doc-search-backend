require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { pool } = require('../config/database');

const runMigrations = async () => {
  const client = await pool.connect();
  try {
    // Create migrations tracking table
    await client.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        id BIGSERIAL PRIMARY KEY,
        filename VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    const migrationsDir = path.join(__dirname, 'migrations');
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    for (const file of files) {
      const { rows } = await client.query(
        'SELECT id FROM _migrations WHERE filename = $1',
        [file]
      );

      if (rows.length === 0) {
        console.log(`Running migration: ${file}`);
        const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
        await client.query('BEGIN');
        try {
          await client.query(sql);
          await client.query(
            'INSERT INTO _migrations (filename) VALUES ($1)',
            [file]
          );
          await client.query('COMMIT');
          console.log(`✅ Migration ${file} completed`);
        } catch (err) {
          await client.query('ROLLBACK');
          throw err;
        }
      } else {
        console.log(`⏭️  Skipping ${file} (already executed)`);
      }
    }

    console.log('\n✅ All migrations completed successfully');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
};

runMigrations();
