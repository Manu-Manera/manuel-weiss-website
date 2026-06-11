/**
 * Kundenportal-Passwort (pro Session) — analog Kick-off Prep.
 */
const STORAGE_PREFIX = 'impl_portal_pw_';

export function portalAuthKey(sessionId) {
  return `${STORAGE_PREFIX}${sessionId}`;
}

export function readPortalPassword(sessionId) {
  if (!sessionId) return '';
  try {
    return sessionStorage.getItem(portalAuthKey(sessionId)) || '';
  } catch {
    return '';
  }
}

export function storePortalPassword(sessionId, password) {
  if (!sessionId) return;
  try {
    sessionStorage.setItem(portalAuthKey(sessionId), String(password || ''));
  } catch {
    /* ignore */
  }
}

export function clearPortalPassword(sessionId) {
  if (!sessionId) return;
  try {
    sessionStorage.removeItem(portalAuthKey(sessionId));
  } catch {
    /* ignore */
  }
}

export function sessionRequiresPortalPassword(session) {
  return !!(session?.portalPassword || '').trim();
}

export function sessionPortalReleased(session) {
  if (!session) return false;
  if (session.portalReleased === false) return false;
  return true;
}
