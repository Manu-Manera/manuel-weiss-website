/**
 * HMAC-JWT-Auth-Helper für die Training-Admin-API.
 *
 * Wir verwenden JWT mit HS256 statt eines vollen Authorizers, weil unser Backend
 * Single-Region und low-traffic ist und so ohne zusätzlichen Lambda-Authorizer auskommt.
 *
 * Token-Payload:
 *   {
 *     sub: "<userId>",
 *     cid: "<customerId>",
 *     role: "trainee" | "trainer" | "admin",
 *     iat, exp
 *   }
 *
 * Magic-Link-Flow:
 *   1. Trainee klickt "Training starten" -> Onboarding-App ruft POST /auth/magic-link
 *   2. Backend sendet E-Mail mit Token-Link (oder gibt Token direkt zurück, wenn admin)
 *   3. Trainee klickt Link -> Onboarding-App speichert Token in localStorage
 *   4. Onboarding-App sendet Token an Extension via chrome.runtime.sendMessage(EXT_AUTH)
 */

const jwt = require('jsonwebtoken');

const SECRET = process.env.TRAINING_JWT_SECRET || process.env.JWT_SECRET || 'change-me-in-production';
const DEFAULT_EXPIRY_S = 60 * 60 * 8; // 8 Stunden

const ROLES = ['trainee', 'trainer', 'admin'];

function issueToken({ userId, customerId, role = 'trainee', expiresInSec = DEFAULT_EXPIRY_S }) {
  if (!userId) throw new Error('userId required');
  if (!customerId) throw new Error('customerId required');
  if (!ROLES.includes(role)) throw new Error('invalid role');
  const payload = {
    sub: userId,
    cid: customerId,
    role,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + expiresInSec
  };
  return jwt.sign(payload, SECRET, { algorithm: 'HS256' });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, SECRET, { algorithms: ['HS256'] });
  } catch (e) {
    return null;
  }
}

function extractAuth(event) {
  const headers = event.headers || {};
  const authHeader = headers.Authorization || headers.authorization || '';
  const match = /^Bearer\s+(.+)$/i.exec(authHeader.trim());
  if (!match) return null;
  return verifyToken(match[1]);
}

/**
 * Stellt sicher, dass der eingehende Request:
 *  - einen gültigen Token hat
 *  - dessen customerId zur angefragten Pfad-CustomerId passt (oder Admin ist)
 *  - die geforderte Rolle erfüllt
 */
function authorize(event, { customerId, requiredRole = 'trainee' } = {}) {
  const claims = extractAuth(event);
  if (!claims) return { ok: false, status: 401, error: 'Token fehlt oder ungültig' };

  const claimRole = claims.role || 'trainee';
  const claimCid = claims.cid;

  if (claimRole !== 'admin' && customerId && claimCid !== customerId) {
    return { ok: false, status: 403, error: 'customerId mismatch' };
  }

  const ranking = { trainee: 0, trainer: 1, admin: 2 };
  if ((ranking[claimRole] ?? -1) < (ranking[requiredRole] ?? 0)) {
    return { ok: false, status: 403, error: `role ${claimRole} unzureichend (benötigt: ${requiredRole})` };
  }

  return { ok: true, claims };
}

module.exports = {
  issueToken,
  verifyToken,
  extractAuth,
  authorize,
  DEFAULT_EXPIRY_S
};
