/**
 * Öffentliche Kotter-Einladungslinks: eigener DynamoDB-Schlüssel (userId) pro Token.
 * Kein Admin-Login nötig — Link = Geheimnis (Rate-Limiting/Captcha wäre Backend-Erweiterung).
 */

export const KOTTER_MIRROR_PROFILE_ID = 'guest-session';

const PROGRESS_SHELL = {
  startDate: null,
  tasks: {},
  quizScores: {},
  checkpoints: {},
  notes: {},
  practiceProgress: {},
  toolConfigProgress: {},
  scenarioProgress: {},
};

export function kotterShareUserId(shareToken) {
  return `kotter-share-${String(shareToken || '').trim()}`;
}

/** UUID v4 (locker, inkl. Varianten mit Großbuchstaben) */
export function isValidKotterShareToken(t) {
  const s = String(t || '').trim();
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);
}

export function normalizeKotterSlice(raw) {
  if (!raw || typeof raw !== 'object') return { activeProfileId: null, profiles: {} };
  const profiles =
    typeof raw.profiles === 'object' && raw.profiles !== null ? { ...raw.profiles } : {};
  return {
    activeProfileId: raw.activeProfileId || null,
    profiles,
  };
}

export function emptyGuestChangeWorkshopKotter() {
  const now = new Date().toISOString();
  return {
    activeProfileId: KOTTER_MIRROR_PROFILE_ID,
    profiles: {
      [KOTTER_MIRROR_PROFILE_ID]: {
        id: KOTTER_MIRROR_PROFILE_ID,
        customerLabel: '',
        tileAnswers: {},
        updatedAt: now,
      },
    },
  };
}

export function buildProgressBlobWithKotter(changeWorkshopKotter) {
  return {
    ...PROGRESS_SHELL,
    changeWorkshopKotter: normalizeKotterSlice(changeWorkshopKotter),
  };
}

/**
 * Spiegelt das aktive Moderationspaket in den öffentlichen Speicher für ein neues Token.
 */
export function buildMirrorKotterFromFacilitatorProfile(profile) {
  if (!profile || typeof profile !== 'object') return emptyGuestChangeWorkshopKotter();
  const tiles = profile.tileAnswers && typeof profile.tileAnswers === 'object' ? profile.tileAnswers : {};
  const deepTiles = JSON.parse(JSON.stringify(tiles));
  const now = new Date().toISOString();
  return {
    activeProfileId: KOTTER_MIRROR_PROFILE_ID,
    profiles: {
      [KOTTER_MIRROR_PROFILE_ID]: {
        id: KOTTER_MIRROR_PROFILE_ID,
        customerLabel: String(profile.customerLabel || '').trim(),
        tileAnswers: deepTiles,
        updatedAt: now,
        mirroredFromFacilitatorAt: now,
      },
    },
  };
}

export function upsertTileAnswersInKotterSlice(cw, tileSlug, answers) {
  const norm = normalizeKotterSlice(cw);
  const id = norm.activeProfileId;
  const prof = id ? norm.profiles[id] : null;
  if (!id || !prof) return norm;
  return {
    ...norm,
    profiles: {
      ...norm.profiles,
      [id]: {
        ...prof,
        tileAnswers: {
          ...(prof.tileAnswers || {}),
          [tileSlug]: { ...(answers || {}) },
        },
        updatedAt: new Date().toISOString(),
      },
    },
  };
}

export function mergeGuestTileAnswersIntoProfileTileAnswers(facilitatorTiles, guestTiles) {
  const out = { ...(facilitatorTiles || {}) };
  if (!guestTiles || typeof guestTiles !== 'object') return out;
  for (const [slug, answers] of Object.entries(guestTiles)) {
    if (!answers || typeof answers !== 'object') continue;
    out[slug] = { ...(out[slug] || {}), ...answers };
  }
  return out;
}
