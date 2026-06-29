-- This migration adds new columns to the users table to track failed login attempts and account lockout status.

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS failed_attempts INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP WITH TIME ZONE;