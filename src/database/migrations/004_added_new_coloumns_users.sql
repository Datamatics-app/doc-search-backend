-- ============================================================
-- Migration: users table updates
--   1. Add failed_attempts / locked_until (account lockout tracking)
--   2. Rename uuid -> emp_id
--   3. Replace first_name + last_name with a single full_name column
-- ============================================================

BEGIN;

-- ------------------------------------------------------------
-- 1. Account lockout tracking
-- ------------------------------------------------------------
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS failed_attempts INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP WITH TIME ZONE;

-- ------------------------------------------------------------
-- 2. Rename uuid -> emp_id (keep the same underlying UUID values/index)
-- ------------------------------------------------------------
ALTER TABLE users RENAME COLUMN uuid TO emp_id;

ALTER INDEX IF EXISTS idx_users_uuid RENAME TO idx_users_emp_id;

-- ------------------------------------------------------------
-- 3. Consolidate first_name/last_name -> full_name
-- ------------------------------------------------------------
ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name VARCHAR(201);

UPDATE users
SET full_name = TRIM(CONCAT_WS(' ', first_name, last_name))
WHERE full_name IS NULL;

-- Enforce NOT NULL only after backfill succeeds
ALTER TABLE users ALTER COLUMN full_name SET NOT NULL;

ALTER TABLE users
  DROP COLUMN IF EXISTS first_name,
  DROP COLUMN IF EXISTS last_name;

COMMIT;