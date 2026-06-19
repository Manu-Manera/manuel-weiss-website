import {
  getDeckSlides,
  localizeSlide,
  localizedClosing,
  localizedMeta,
} from './kickoffDeckLocale';
import { getPresentationSlideList } from './kickoffDeckState';
import { newSessionId } from './kickoffStudioService';
import { defaultVizConfig, normalizeVizConfig } from './kickoffVizConfig';
import { getTenantBySlug } from './kickoffTenants';

/** Build export deck with workshop answers merged into slide bodies. */
export function buildExportDeck({
  locale,
  customer,
  facilitator,
  includeIntegrations,
  answers = {},
  vizConfig,
  hiddenSlideIds,
  customSlides,
  slideOverrides,
}) {
  const ordered = getPresentationSlideList(getDeckSlides(), {
    includeIntegrations,
    hiddenSlideIds,
    customSlides,
    slideOverrides,
  });

  const slides = ordered.map((base) => {
    const id = base.id;
    const loc = localizeSlide(base, locale, customer);
    const ans = answers[id] || {};
    return mergeAnswersIntoSlide(loc, ans);
  });

  return {
    meta: {
      ...localizedMeta(locale, customer),
      facilitator,
      workshop_mode: true,
      locale,
      includeIntegrations,
      modulesInScope: vizConfig?.modulesInScope,
      exportedAt: new Date().toISOString(),
    },
    slides,
    closing: localizedClosing(locale, customer),
  };
}

function mergeAnswersIntoSlide(slide, ans) {
  const out = { ...slide };
  const layout = slide.layout;

  if (layout === 'capture' && ans.rows) {
    out.rows = ans.rows;
  }
  if (layout === 'workshop_qa' && ans.questionAnswers) {
    out.questions = (slide.questions || []).map((q, i) => ({
      ...q,
      answer: ans.questionAnswers[i] ?? '',
    }));
  }
  if (layout === 'decisions') {
    if (ans.decision) out.selected_decision = ans.decision;
    if (ans.decisionNotes) out.decision_notes = ans.decisionNotes;
  }
  if (layout === 'checklist' && ans.checklist) {
    out.items_status = ans.checklist;
  }
  return out;
}

export function emptyAnswersForSlide(slide) {
  if (!slide) return {};
  const layout = slide.layout;
  if (layout === 'capture') {
    const rows = slide.rows?.length
      ? slide.rows.map((r) => [...r])
      : [slide.headers?.map(() => '') || ['']];
    return { rows };
  }
  if (layout === 'workshop_qa') {
    return {
      questionAnswers: (slide.questions || []).map(() => ''),
    };
  }
  if (layout === 'decisions') {
    const decisionNotes = {};
    (slide.options || []).forEach((o) => {
      decisionNotes[o.id] = '';
    });
    return { decision: '', decisionNotes };
  }
  if (layout === 'checklist') {
    return {
      checklist: (slide.items || []).map(() => ''),
    };
  }
  return {};
}

export function defaultSession(sessionId, tenantOrSlug = '') {
  return {
    sessionId,
    customer: '',
    facilitator: '',
    locale: 'de',
    includeIntegrations: false,
    workshopCaptureEnabled: false,
    tenantSlug: typeof tenantOrSlug === 'string' ? tenantOrSlug : tenantOrSlug?.slug || '',
    linkLabel: '',
    answers: {},
    vizConfig: defaultVizConfig(tenantOrSlug || ''),
    hiddenSlideIds: [],
    customSlides: [],
    slideOverrides: {},
    prepId: '',
    prepSalutation: 'sie',
    prepAudience: 'team',
    prepStatus: 'draft',
    updatedAt: Date.now(),
  };
}

/** Cloud/Local-Session mit gültiger vizConfig & fehlenden Antwort-Feldern */
export function mergeSession(stored, tenantOrSlug = '') {
  const base = defaultSession(stored?.sessionId || newSessionId(), tenantOrSlug);
  const tenant =
    typeof tenantOrSlug === 'string'
      ? getTenantBySlug(tenantOrSlug)
      : tenantOrSlug || getTenantBySlug(stored?.tenantSlug);
  return {
    ...base,
    ...stored,
    vizConfig: normalizeVizConfig(stored?.vizConfig, tenant || stored?.tenantSlug),
    answers: stored?.answers || {},
    hiddenSlideIds: stored?.hiddenSlideIds || [],
    customSlides: stored?.customSlides || [],
    slideOverrides: stored?.slideOverrides || {},
    prepId: stored?.prepId || '',
    prepSalutation: stored?.prepSalutation || 'sie',
    prepAudience: stored?.prepAudience || 'team',
    prepStatus: stored?.prepStatus || 'draft',
  };
}

