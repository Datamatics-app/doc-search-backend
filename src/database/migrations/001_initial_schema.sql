-- ============================================================
-- RBAC Database Schema
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- USERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id          BIGSERIAL PRIMARY KEY,
  emp_id        UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
  email       VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name  VARCHAR(201) NOT NULL,
  is_active   BOOLEAN DEFAULT TRUE,
  failed_attempts INTEGER NOT NULL DEFAULT 0,
  locked_until    TIMESTAMP WITH TIME ZONE,
  last_login_at TIMESTAMP WITH TIME ZONE,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_emp_id ON users(emp_id);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

-- ============================================================
-- ROLES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS roles (
  id            BIGSERIAL PRIMARY KEY,
  name          VARCHAR(100) UNIQUE NOT NULL,
  description   TEXT,
  is_system_role BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_roles_name ON roles(name);

-- ============================================================
-- PERMISSIONS TABLE
-- ============================================================
-- Fine-grained permissions removed for simplified two-role model

-- ============================================================
-- USER_ROLES TABLE (junction)
-- ============================================================
CREATE TABLE IF NOT EXISTS user_roles (
  id          BIGSERIAL PRIMARY KEY,
  user_id     BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id     BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  assigned_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE(user_id, role_id)
);

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON user_roles(role_id);

-- ============================================================
-- ROLE_PERMISSIONS TABLE (junction)
-- ============================================================
-- Role-permission junction removed for simplified two-role model

-- ============================================================
-- REFRESH_TOKENS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id          BIGSERIAL PRIMARY KEY,
  user_id     BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token       TEXT UNIQUE NOT NULL,
  expires_at  TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  revoked_at  TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token);

-- ============================================================
-- AUDIT_LOGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id          BIGSERIAL PRIMARY KEY,
  user_id     BIGINT REFERENCES users(id) ON DELETE SET NULL,
  action      VARCHAR(100) NOT NULL,
  resource    VARCHAR(100) NOT NULL,
  resource_id VARCHAR(100),
  ip_address  VARCHAR(45),
  metadata    JSONB DEFAULT '{}',
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- ============================================================
-- AUTO-UPDATE updated_at TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_roles_updated_at ON roles;
CREATE TRIGGER update_roles_updated_at
  BEFORE UPDATE ON roles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
