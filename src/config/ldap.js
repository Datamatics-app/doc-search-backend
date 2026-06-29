const fs = require('fs');
const ldap = require('ldapjs');
const logger = require('./logger');

// Only safe characters allowed in an LDAP username — blocks LDAP filter/DN
// injection (e.g. "*)(uid=*))(|(uid=*").
const SAFE_USERNAME = /^[a-zA-Z0-9._-]{1,64}$/;

/**
 * LDAP Configuration and client creation
 */
class LDAPConfig {
  /**
   * Create a fresh LDAP client for a single operation.
   * NOTE: clients are created per-call (not cached as a singleton) — a shared
   * client gets nulled out by its own error handler on connection issues,
   * which previously caused crashes under concurrent requests.
   */
  createClient() {
    const tlsEnabled = process.env.LDAP_TLS === 'true';

    const tlsOptions = tlsEnabled
      ? {
          // Never disable certificate verification — protects against MITM.
          rejectUnauthorized: true,
          ...(process.env.LDAP_TLS_CA_PATH
            ? { ca: [fs.readFileSync(process.env.LDAP_TLS_CA_PATH)] }
            : {}),
        }
      : undefined;

    const client = ldap.createClient({
      url: process.env.LDAP_URL || 'ldap://ldap.forumsys.com:389',
      timeout: 5000,
      connectTimeout: 5000,
      tlsOptions,
    });

    client.on('error', (err) => {
      logger.error('LDAP client error:', err);
    });

    return client;
  }

  /**
   * Authenticate user against LDAP directory
   * @param {string} username - Username or email (DN or simple username)
   * @param {string} password - User password
   * @returns {Promise<{success: boolean, user: object | null, error: string | null}>}
   */
  async authenticateUser(username, password) {
    // Reject empty passwords outright — LDAP servers may treat an empty
    // password bind as an "unauthenticated bind" that succeeds.
    if (!password) {
      return { success: false, user: null, error: 'Invalid credentials' };
    }

    // Validate username format before it's interpolated into the DN/filter.
    if (!SAFE_USERNAME.test(username)) {
      logger.warn(`LDAP authentication rejected — invalid username format: ${username}`);
      return { success: false, user: null, error: 'Invalid credentials' };
    }

    return new Promise((resolve) => {
      const client = this.createClient();

      const cleanup = () => {
        client.unbind((err) => {
          if (err) logger.error('LDAP unbind error:', err);
        });
      };

      // Build search DN - adjust based on your LDAP structure
      // For forumsys.com test server: uid={username},dc=example,dc=com
      const searchDNTemplate = process.env.LDAP_SEARCH_DN || `uid=${username},dc=example,dc=com`;
      const searchDN = searchDNTemplate.replace('{username}', username);

      client.bind(searchDN, password, (err) => {
        if (err) {
          logger.warn(`LDAP authentication failed for user: ${username}`, err.message);
          cleanup();
          return resolve({ success: false, user: null, error: 'Invalid credentials' });
        }

        logger.info(`LDAP authentication successful for user: ${username}`);

        // Fetch user details from LDAP
        client.search(searchDN, { scope: 'base' }, (searchErr, res) => {
          let user = null;

          if (searchErr) {
            logger.warn('LDAP search error:', searchErr.message);
            cleanup();
            return resolve({
              success: true,
              user: { username, email: `${username}@ldap.local`, firstName: username, lastName: '' },
              error: null,
            });
          }

          res.on('searchEntry', (entry) => {
            user = {
              username,
              email: entry.object.mail || `${username}@ldap.local`,
              firstName: entry.object.givenName || username,
              lastName: entry.object.sn || '',
              dn: entry.dn,
            };
          });

          res.on('end', () => {
            cleanup();
            resolve({ success: true, user: user || { username, email: `${username}@ldap.local`, firstName: username, lastName: '' }, error: null,
            });
          });

          res.on('error', (resErr) => {
            logger.warn('LDAP search error:', resErr.message);
            cleanup();
            resolve({ success: true, user: { username, email: `${username}@ldap.local`, firstName: username, lastName: '' }, error: null,
            });
          });
        });
      });
    });
  }
}

module.exports = new LDAPConfig();
