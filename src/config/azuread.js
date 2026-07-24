// config/azuread.js
const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');
const logger = require('./logger');

const TENANT_ID = process.env.AZURE_AD_TENANT_ID;
const CLIENT_ID = process.env.AZURE_AD_CLIENT_ID;

if (process.env.AUTH_MODE === 'SSO' && (!TENANT_ID || !CLIENT_ID)) {
  // Fail fast at boot rather than on the first login attempt.
  throw new Error(
    'AUTH_MODE=SSO requires AZURE_AD_TENANT_ID and AZURE_AD_CLIENT_ID to be set'
  );
}

const JWKS_URI = `https://login.microsoftonline.com/${TENANT_ID}/discovery/v2.0/keys`;
const EXPECTED_ISSUER = `https://login.microsoftonline.com/${TENANT_ID}/v2.0`;
console.log('JWKS_URI:', JWKS_URI); // temporary
const client = jwksClient({
  jwksUri: JWKS_URI,
  cache: true,
  cacheMaxAge: 24 * 60 * 60 * 1000, // 24h — Microsoft rotates keys infrequently
  rateLimit: true,
  jwksRequestsPerMinute: 10,
});

const getSigningKey = (kid) =>
  new Promise((resolve, reject) => {
    client.getSigningKey(kid, (err, key) => {
      if (err) return reject(err);
      resolve(key.getPublicKey());
    });
  });

/**
 * Verifies an Azure AD (MSAL) id_token and returns its decoded claims.
 * Throws on malformed token, bad signature, wrong issuer/audience, or expiry.
 *
 * @param {string} idToken
 * @returns {Promise<object>} decoded claims (name, preferred_username, oid, ...)
 */
const verifyIdToken = async (idToken) => {
  if (!idToken || typeof idToken !== 'string') {
    throw new Error('id token is required');
  }

  const decoded = jwt.decode(idToken, { complete: true });
  if (!decoded || !decoded.header || !decoded.header.kid) {
    throw new Error('Malformed token');
  }

  let publicKey;
    try {
    publicKey = await getSigningKey(decoded.header.kid);
    } catch (err) {
    logger.warn(`Azure AD JWKS lookup failed: ${err.message}`);
    console.error(err); // temporary — full stack while debugging
    throw new Error('Unable to verify token signature');
    }

  return jwt.verify(idToken, publicKey, {
    algorithms: ['RS256'],
    issuer: EXPECTED_ISSUER,
    audience: CLIENT_ID,
  });
};

module.exports = { verifyIdToken };