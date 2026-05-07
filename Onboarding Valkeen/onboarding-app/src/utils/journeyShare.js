/**
 * Journey-Share: Öffentlicher Link für Kunden zur Change Journey Begleitung.
 * Kunden können: Fortschritt sehen, Checklisten abhaken, Notizen hinzufügen.
 */

export function journeyShareUserId(shareToken) {
  return `journey-share-${String(shareToken || '').trim()}`;
}

export function isValidJourneyShareToken(t) {
  const s = String(t || '').trim();
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);
}

export function buildJourneyShareUrl(token) {
  try {
    const base = `${window.location.origin}${import.meta.env.BASE_URL}`;
    const root = base.endsWith('/') ? base : `${base}/`;
    return new URL(`journey-share/${encodeURIComponent(String(token || '').trim())}`, root).href;
  } catch {
    return `/onboarding/journey-share/${encodeURIComponent(String(token || '').trim())}`;
  }
}

export function normalizeJourneyShareData(raw) {
  if (!raw || typeof raw !== 'object') {
    return {
      customerLabel: '',
      kotterSummary: [],
      phaseSummary: [],
      journey: null,
      aiSummary: '',
      customerNotes: '',
      sharedAt: null,
      updatedAt: null,
    };
  }
  return {
    customerLabel: raw.customerLabel || '',
    kotterSummary: Array.isArray(raw.kotterSummary) ? raw.kotterSummary : [],
    phaseSummary: Array.isArray(raw.phaseSummary) ? raw.phaseSummary : [],
    journey: raw.journey || null,
    aiSummary: raw.aiSummary || '',
    customerNotes: raw.customerNotes || '',
    sharedAt: raw.sharedAt || null,
    updatedAt: raw.updatedAt || null,
  };
}

export function buildJourneyShareBlob(profile, kotterItems, phaseItems) {
  const now = new Date().toISOString();
  
  const kotterSummary = kotterItems.map((item) => {
    const data = profile.tileAnswers?.[item.slug] || {};
    return {
      slug: item.slug,
      order: item.order,
      label: item.label,
      status: data._status || 'open',
      actions: (data._actions || []).map((a) => ({
        id: a.id,
        text: a.text,
        priority: a.priority,
        done: a.done,
      })),
      aiTip: data._aiTip || '',
      answeredCount: item.prompts.filter((p) => (data[p.key] || '').trim().length > 0).length,
      totalPrompts: item.prompts.length,
    };
  });

  const phaseSummary = phaseItems.map((item) => {
    const data = profile.phaseAnswers?.[item.id] || {};
    return {
      id: item.id,
      order: item.order,
      label: item.label,
      subtitle: item.subtitle,
      status: data._status || 'open',
      actions: (data._actions || []).map((a) => ({
        id: a.id,
        text: a.text,
        priority: a.priority,
        done: a.done,
      })),
      aiTip: data._aiTip || '',
      answeredCount: item.prompts.filter((p) => (data[p.key] || '').trim().length > 0).length,
      totalPrompts: item.prompts.length,
    };
  });

  return {
    startDate: null,
    tasks: {},
    quizScores: {},
    checkpoints: {},
    notes: {},
    practiceProgress: {},
    toolConfigProgress: {},
    scenarioProgress: {},
    journeyShare: {
      customerLabel: profile.customerLabel || '',
      kotterSummary,
      phaseSummary,
      journey: profile.journey || null,
      aiSummary: profile.aiSummary || '',
      customerNotes: '',
      sharedAt: now,
      updatedAt: now,
    },
  };
}
