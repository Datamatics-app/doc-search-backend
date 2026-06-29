const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { query } = require('../../config/database');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../../utils/jwt');
const ldapConfig = require('../../config/ldap');

// Precomputed dummy hash so non-existent users take the same code path
// (bcrypt.compare) as real users — prevents timing-based email enumeration.
let DUMMY_HASH = null;
const getDummyHash = async () => {
  if (!DUMMY_HASH) {
    DUMMY_HASH = await bcrypt.hash('dummy-password-for-timing-safety', parseInt(process.env.BCRYPT_ROUNDS) || 12);
  }
  return DUMMY_HASH;
};

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

class AuthService {
  /**
   * Authenticate user with password (inline password mode)
   * Always runs bcrypt.compare — even for non-existent users — to avoid timing attacks.
   */
  async authenticateWithPassword(email, password, user) {
    const hashToCompare = user?.password_hash || await getDummyHash();
    const isPasswordValid = await bcrypt.compare(password, hashToCompare);

    if (!user || !isPasswordValid || !user.password_hash) {
      const err = new Error('Invalid email or password');
      err.statusCode = 401;
      err.isOperational = true;
      throw err;
    }
  }

  /**
   * Authenticate user with LDAP
   */
  async authenticateWithLDAP(email, password) {
    // Extract username from email (e.g., "newton" from "newton@example.com")
    const username = email.split('@')[0];

    const result = await ldapConfig.authenticateUser(username, password);
    if (!result.success) {
      const err = new Error(result.error || 'LDAP authentication failed');
      err.statusCode = 401;
      err.isOperational = true;
      throw err;
    }

    return result.user;
  }

  /**
   * Get or create user from LDAP authentication
   */
  async getOrCreateUserFromLDAP(email, ldapUser) {
    // Check if user exists
    const { rows } = await query(
      `SELECT id, uuid, email, first_name, last_name, is_active
       FROM users WHERE email = $1`,
      [email.toLowerCase()]
    );

    if (rows.length > 0) {
      return rows[0];
    }

    // Create new user from LDAP data
    const userId = uuidv4();
    const dummyPasswordHash = await bcrypt.hash(uuidv4(), parseInt(process.env.BCRYPT_ROUNDS, 10) || 12);

    const { rows: newUserRows } = await query(
      `INSERT INTO users (uuid, email, password_hash, first_name, last_name, is_active, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       RETURNING id, uuid, email, first_name, last_name, is_active`,
      [userId, email.toLowerCase(), dummyPasswordHash, ldapUser.firstName, ldapUser.lastName, true]
    );

    return newUserRows[0];
  }

  /**
   * Check account lockout status. Throws if currently locked.
   */
  _assertNotLocked(user) {
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      const err = new Error('Account temporarily locked due to too many failed login attempts. Please try again later.');
      err.statusCode = 429;
      err.isOperational = true;
      throw err;
    }
  }

  /**
   * Record a failed login attempt and lock the account if threshold reached.
   */
  async _recordFailedAttempt(userId) {
    await query(
      `UPDATE users
       SET failed_attempts = failed_attempts + 1,
           locked_until = CASE
             WHEN failed_attempts + 1 >= $2
             THEN NOW() + INTERVAL '${LOCKOUT_MINUTES} minutes'
             ELSE locked_until
           END
       WHERE id = $1`,
      [userId, MAX_FAILED_ATTEMPTS]
    );
  }

  /**
   * Reset failed attempt counter on successful login.
   */
  async _resetFailedAttempts(userId) {
    await query(
      `UPDATE users SET failed_attempts = 0, locked_until = NULL WHERE id = $1`,
      [userId]
    );
  }

  /**
   * Login user — returns access + refresh tokens
   * Supports both LDAP and inline password authentication based on AUTH_MODE env
   */
  async login(email, password, ipAddress) {
    const authMode = process.env.AUTH_MODE || 'PASSWORD';

    let user;

    if (authMode === 'LDAP') {
      // LDAP Authentication
      const { rows } = await query(`SELECT id, failed_attempts, locked_until, is_active FROM users WHERE email=$1`, [email.toLowerCase()]);
      if (rows[0]) this._assertNotLocked(rows[0]);
      const ldapUser = await this.authenticateWithLDAP(email, password);
      user = await this.getOrCreateUserFromLDAP(email, ldapUser);
      await this._resetFailedAttempts(user.id);
    } else {
      // Inline Password Authentication (default)
      const { rows } = await query(
        `SELECT id, uuid, email, password_hash, first_name, last_name, is_active,
                failed_attempts, locked_until
         FROM users WHERE email = $1`,
        [email.toLowerCase()]
      );

      user = rows[0] || null;

      // Check lockout BEFORE password verification (only meaningful if user exists,
      // but we don't branch on existence here to avoid leaking timing/existence info)
      if (user) {
        this._assertNotLocked(user);

        if (!user.is_active) {
          const err = new Error('Account is deactivated. Please contact an administrator.');
          err.statusCode = 403;
          err.isOperational = true;
          throw err;
        }
      }

      // Verify password — always runs bcrypt.compare, even if user is null
      try {
        await this.authenticateWithPassword(email, password, user);
      } catch (err) {
        if (user) {
          await this._recordFailedAttempt(user.id);
        }
        throw err;
      }

      // Success — reset failed attempts
      await this._resetFailedAttempts(user.id);
    }

    if (!user.is_active) {
      const err = new Error('Account is deactivated. Please contact an administrator.');
      err.statusCode = 403;
      err.isOperational = true;
      throw err;
    }

    // Fetch user roles
    const { rows: roleRows } = await query(
      `SELECT r.name FROM roles r
       INNER JOIN user_roles ur ON ur.role_id = r.id
       WHERE ur.user_id = $1`,
      [user.id]
    );
    const roles = roleRows.map(r => r.name);

    // Generate tokens
    const tokenPayload = { userId: user.id, uuid: user.uuid, email: user.email, roles };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken({ userId: user.id });

    // Store refresh token in DB
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await query(
      `INSERT INTO refresh_tokens (user_id, token, expires_at)
       VALUES ($1, $2, $3)`,
      [user.id, refreshToken, expiresAt]
    );

    // Update last_login_at
    await query(
      'UPDATE users SET last_login_at = NOW() WHERE id = $1',
      [user.id]
    );

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        uuid: user.uuid,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        roles,
      },
    };
  }

  /**
   * Refresh access token using a valid refresh token
   */
  async refresh(refreshToken) {
    // Verify the token signature
    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch {
      const err = new Error('Invalid or expired refresh token');
      err.statusCode = 401;
      err.isOperational = true;
      throw err;
    }

    // Check DB for token (not revoked, not expired)
    const { rows } = await query(
      `SELECT rt.id, rt.user_id, rt.revoked_at, rt.expires_at,
              u.email, u.uuid, u.first_name, u.last_name, u.is_active
       FROM refresh_tokens rt
       INNER JOIN users u ON u.id = rt.user_id
       WHERE rt.token = $1`,
      [refreshToken]
    );

    if (rows.length === 0) {
      const err = new Error('Refresh token not found');
      err.statusCode = 401;
      err.isOperational = true;
      throw err;
    }

    const tokenRow = rows[0];

    if (tokenRow.revoked_at) {
      const err = new Error('Refresh token has been revoked');
      err.statusCode = 401;
      err.isOperational = true;
      throw err;
    }

    if (new Date(tokenRow.expires_at) < new Date()) {
      const err = new Error('Refresh token has expired');
      err.statusCode = 401;
      err.isOperational = true;
      throw err;
    }

    if (!tokenRow.is_active) {
      const err = new Error('Account is deactivated');
      err.statusCode = 403;
      err.isOperational = true;
      throw err;
    }

    // Fetch roles
    const { rows: roleRows } = await query(
      `SELECT r.name FROM roles r
       INNER JOIN user_roles ur ON ur.role_id = r.id
       WHERE ur.user_id = $1`,
      [tokenRow.user_id]
    );
    const roles = roleRows.map(r => r.name);

    // Rotate: revoke old, issue new
    await query(
      'UPDATE refresh_tokens SET revoked_at = NOW() WHERE id = $1',
      [tokenRow.id]
    );

    const newAccessToken = generateAccessToken({
      userId: tokenRow.user_id,
      uuid: tokenRow.uuid,
      email: tokenRow.email,
      roles,
    });
    const newRefreshToken = generateRefreshToken({ userId: tokenRow.user_id });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await query(
      `INSERT INTO refresh_tokens (user_id, token, expires_at)
       VALUES ($1, $2, $3)`,
      [tokenRow.user_id, newRefreshToken, expiresAt]
    );

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  /**
   * Logout — revoke refresh token
   */
  async logout(refreshToken, userId) {
    await query(
      `UPDATE refresh_tokens SET revoked_at = NOW()
       WHERE token = $1 AND user_id = $2`,
      [refreshToken, userId]
    );
  }

  /**
   * Logout all sessions for a user
   */
  async logoutAll(userId) {
    await query(
      `UPDATE refresh_tokens SET revoked_at = NOW()
       WHERE user_id = $1 AND revoked_at IS NULL`,
      [userId]
    );
  }
}

module.exports = new AuthService();
