export function newPrepId() {
  const r = Math.random().toString(36).slice(2, 8);
  return `prep-${Date.now().toString(36)}-${r}`;
}

export function isValidPrepId(id) {
  return /^prep-[a-z0-9]+-[a-z0-9]{4,12}$/i.test(String(id || '').trim());
}

export function prepWelcomeStorageKey(prepId) {
  return `kickoff_prep_welcome_${prepId}`;
}

export function prepAuthStorageKey(prepId) {
  return `kickoff_prep_auth_${prepId}`;
}

export function markWelcomeSeen(prepId) {
  try {
    sessionStorage.setItem(prepWelcomeStorageKey(prepId), '1');
  } catch {
    /* ignore */
  }
}

export function hasSeenWelcome(prepId) {
  try {
    return sessionStorage.getItem(prepWelcomeStorageKey(prepId)) === '1';
  } catch {
    return false;
  }
}

export function prepPublicBasePath() {
  const base = import.meta.env.BASE_URL || '/';
  return base.endsWith('/') ? base.slice(0, -1) : base;
}

/** Link zur Willkommensseite (Standard-Einladung) */
export function prepWelcomeUrl(prepId, origin = typeof window !== 'undefined' ? window.location.origin : '') {
  return `${origin}${prepPublicBasePath()}/kickoff-prep/${encodeURIComponent(prepId)}`;
}

/** Direktlink zum Fragebogen (Wiederkehrer / Teammitglieder mit Hinweis) */
export function prepQuestionnaireUrl(prepId, origin = typeof window !== 'undefined' ? window.location.origin : '') {
  return `${origin}${prepPublicBasePath()}/kickoff-prep/${encodeURIComponent(prepId)}/fragebogen`;
}

export function normalizePrepRecord(raw) {
  if (!raw || typeof raw !== 'object') return null;
  return {
    prepId: raw.prepId || '',
    customer: raw.customer || '',
    locale: raw.locale || 'de',
    tenantSlug: raw.tenantSlug || '',
    linkLabel: raw.linkLabel || '',
    logoUrl: raw.logoUrl || '',
    salutation: raw.salutation || 'sie',
    audience: raw.audience || 'team',
    includeIntegrations: !!raw.includeIntegrations,
    linkedSessionId: raw.linkedSessionId || '',
    answers: typeof raw.answers === 'object' && raw.answers ? { ...raw.answers } : {},
    access: {
      status: raw.access?.status || 'draft',
      releasedAt: raw.access?.releasedAt || null,
      submittedAt: raw.access?.submittedAt || null,
      requiresPassword: !!raw.access?.requiresPassword,
    },
    updatedAt: raw.updatedAt || null,
  };
}

export function emptyPrepAnswers() {
  return {};
}
