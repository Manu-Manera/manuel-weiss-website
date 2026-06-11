/**
 * Register fürs Implementation Framework:
 * - User/Stakeholder (Tempus-Provisionierung)
 * - Rollen & Use-Cases
 * - UAT-Checkliste (rollenbasiert)
 * - Risiken
 * Gespeichert als session.users[], session.roles[], session.uat[], session.risks[].
 */
import { STANDARD_ROLES } from './implementationTemplate';

function uid(p = 'x') {
  return `${p}-${Math.random().toString(36).slice(2, 8)}`;
}

/* ---- User / Stakeholder ---- */
export const ACCESS_LEVELS = ['none', 'viewer', 'editor', 'admin'];
export const ACCESS_LABEL = {
  de: { none: 'Kein', viewer: 'Lesen', editor: 'Bearbeiten', admin: 'Admin' },
  en: { none: 'None', viewer: 'Viewer', editor: 'Editor', admin: 'Admin' },
};
export function newUser() {
  return {
    id: uid('u'),
    name: '',
    email: '',
    role: '',
    dept: '',
    access: 'viewer',
    notes: '',
    learningUserId: '',
    learningRole: '',
    learningToken: '',
    learningLinkSentAt: '',
  };
}

/* ---- Rollen & Use-Cases ---- */
export function newRole(name = '') {
  return { id: uid('r'), name, useCases: '', permissions: '', notes: '' };
}
export function buildStandardRoles() {
  return STANDARD_ROLES.map((name) => ({ id: uid('r'), name, useCases: '', permissions: '', notes: '' }));
}

/* ---- UAT ---- */
export const UAT_STATUSES = ['open', 'pass', 'fail', 'blocked'];
export const UAT_STATUS_LABEL = {
  de: { open: 'Offen', pass: 'Bestanden', fail: 'Fehler', blocked: 'Blockiert' },
  en: { open: 'Open', pass: 'Pass', fail: 'Fail', blocked: 'Blocked' },
};
export function newUat(role = '') {
  return { id: uid('t'), role, useCase: '', expected: '', status: 'open', tester: '', notes: '' };
}

/* ---- Risiken ---- */
export const RISK_LEVELS = ['low', 'medium', 'high'];
export const RISK_LEVEL_LABEL = {
  de: { low: 'Niedrig', medium: 'Mittel', high: 'Hoch' },
  en: { low: 'Low', medium: 'Medium', high: 'High' },
};
export const RISK_STATUSES = ['open', 'mitigated', 'closed'];
export const RISK_STATUS_LABEL = {
  de: { open: 'Offen', mitigated: 'Gemindert', closed: 'Geschlossen' },
  en: { open: 'Open', mitigated: 'Mitigated', closed: 'Closed' },
};
export function newRisk() {
  return {
    id: uid('k'),
    title: '',
    impact: 'medium',
    likelihood: 'medium',
    mitigation: '',
    owner: '',
    status: 'open',
  };
}
export function riskScore(r) {
  const map = { low: 1, medium: 2, high: 3 };
  return (map[r.impact] || 2) * (map[r.likelihood] || 2);
}
