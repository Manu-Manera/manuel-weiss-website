/**
 * Schema-Definitionen für das Tempus-Trainings-Tool.
 *
 * Diese Datei ist die Single-Source-of-Truth für die Datenstrukturen, die
 *  - Authoring-UI (TrainingAdmin)
 *  - Extension (content-script, sidepanel, modal)
 *  - Backend (lambda/training-admin-api)
 * alle gleichermaßen verwenden.
 *
 * Wir verwenden absichtlich JSDoc-Typen statt TypeScript, weil die Onboarding-App
 * aktuell pure JS/JSX ist; die Extension repliziert die Typen in TypeScript unter
 * extension/src/lib/types.ts.
 */

export const SCHEMA_VERSION = 1;

/**
 * @typedef {Object} Branding
 * @property {string} customerId
 * @property {string} customerName
 * @property {string|null} logoUrl
 * @property {string} accentColor   - HEX, z.B. "#6366f1"
 * @property {string} welcomeText
 * @property {string} domainHint    - Tempus-Subdomain ohne Protokoll, z.B. "knauf.prosymmetry.com"
 */

/**
 * @typedef {Object} TipPlacement
 * @property {"top"|"right"|"bottom"|"left"|"top-start"|"top-end"|"right-start"|"right-end"|"bottom-start"|"bottom-end"|"left-start"|"left-end"} position
 * @property {number} [offset]
 */

/**
 * @typedef {Object} TipDefinition
 * @property {string} title
 * @property {string} body                       - Markdown-fähiger Text
 * @property {TipPlacement} [placement]
 * @property {{type: "image"|"video", src: string, caption?: string}} [media]
 */

/**
 * @typedef {Object} TargetSelector
 * @property {string[]} selectors                - Reihenfolge nach Robustheit (data-testid > role+name > id > pfad)
 * @property {string} [screenshot]               - URL eines Fallback-Screenshots für den Notfall
 * @property {{x:number, y:number, w:number, h:number}} [boundingHint]
 * @property {string} [iframeSelector]           - Falls Element in iframe
 * @property {string} [textHint]                 - Erkennbarer Text als zusätzliche Disambiguation
 */

/**
 * @typedef {Object} StepValidation
 * @property {"manual-next"|"url-contains"|"url-equals"|"element-exists"|"element-removed"|"input-equals"|"click-target"} type
 * @property {string} [value]                    - Vergleichswert (URL-Fragment, Text, Selector)
 * @property {string} [selector]                 - Falls type element-* / click-target / input-equals
 * @property {number} [timeoutMs]                - Default 30000
 */

/**
 * @typedef {"theory"|"highlight"|"click"|"input"|"wait"|"quiz"|"checklist"} StepKind
 *
 * @typedef {Object} TourStep
 * @property {string} id
 * @property {StepKind} kind
 * @property {string} [slideId]                  - Bei kind === "theory"
 * @property {"modal"|"sidepanel"} [placement]   - Bei kind === "theory"
 * @property {TargetSelector} [target]           - Bei DOM-bezogenen Schritten
 * @property {TipDefinition} [tip]
 * @property {StepValidation} [validation]
 * @property {string} [next]                     - Step-ID; falls leer, nächster in Reihenfolge
 * @property {string} [onFail]                   - Step-ID für Hilfe-Pfad
 * @property {string[]} [tags]
 */

/**
 * @typedef {Object} Tour
 * @property {string} id
 * @property {string} customerId
 * @property {string} title
 * @property {string} [description]
 * @property {string} [domainHint]               - Override gegen Branding.domainHint
 * @property {string[]} [audience]               - z.B. ["RM", "PM", "Admin"]
 * @property {"draft"|"published"} status
 * @property {number} schemaVersion
 * @property {string} [coverImage]
 * @property {string} [estimatedDurationMin]
 * @property {TourStep[]} steps
 * @property {string} createdAt
 * @property {string} updatedAt
 * @property {string} [createdBy]
 */

/**
 * @typedef {Object} SlideBlock
 * @property {string} id
 * @property {"heading"|"text"|"image"|"video"|"callout"|"code"|"quiz"} type
 * @property {string} [text]
 * @property {string} [markdown]
 * @property {string} [src]
 * @property {string} [caption]
 * @property {string} [alt]
 * @property {"info"|"warn"|"success"|"tip"} [variant]
 * @property {string} [language]                 - Bei type === "code"
 * @property {Array<{id:string,text:string,options:string[],correctIndex:number}>} [questions]
 */

/**
 * @typedef {Object} Slide
 * @property {string} id
 * @property {string} customerId
 * @property {string} title
 * @property {string} [subtitle]
 * @property {SlideBlock[]} blocks
 * @property {number} [estimatedReadSeconds]
 * @property {{audioUrl:string, transcript:string}} [voiceover]
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} ProgressEvent
 * @property {string} timestamp
 * @property {string} stepId
 * @property {"started"|"completed"|"skipped"|"failed"|"help"} status
 * @property {number} [durationMs]
 * @property {Record<string, any>} [meta]
 */

/**
 * @typedef {Object} TraineeProgress
 * @property {string} userId
 * @property {string} customerId
 * @property {string} tourId
 * @property {"not-started"|"in-progress"|"completed"|"failed"} status
 * @property {string} [currentStepId]
 * @property {number} startedAt
 * @property {number} updatedAt
 * @property {number} [completedAt]
 * @property {ProgressEvent[]} events
 */

/**
 * @typedef {Object} CustomerIndexEntry
 * @property {string} customerId
 * @property {string} customerName
 * @property {string} domainHint
 * @property {boolean} active
 */

/**
 * @typedef {Object} CustomerIndex
 * @property {number} schemaVersion
 * @property {string} updatedAt
 * @property {CustomerIndexEntry[]} customers
 */

const STEP_KINDS = ['theory', 'highlight', 'click', 'input', 'wait', 'quiz', 'checklist'];
const VALIDATION_TYPES = [
  'manual-next', 'url-contains', 'url-equals',
  'element-exists', 'element-removed', 'input-equals', 'click-target'
];
const BLOCK_TYPES = ['heading', 'text', 'image', 'video', 'callout', 'code', 'quiz'];

export function genId(prefix = 'id') {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function newTour(customerId, partial = {}) {
  const now = new Date().toISOString();
  return {
    id: partial.id || genId('tour'),
    customerId,
    title: partial.title || 'Neue Tour',
    description: partial.description || '',
    domainHint: partial.domainHint || '',
    audience: partial.audience || [],
    status: partial.status || 'draft',
    schemaVersion: SCHEMA_VERSION,
    coverImage: partial.coverImage || '',
    estimatedDurationMin: partial.estimatedDurationMin || '',
    steps: partial.steps || [],
    createdAt: partial.createdAt || now,
    updatedAt: now,
    createdBy: partial.createdBy || ''
  };
}

export function newStep(kind = 'highlight', partial = {}) {
  const base = {
    id: partial.id || genId('step'),
    kind,
    tip: { title: '', body: '', placement: { position: 'bottom' } },
    validation: { type: 'manual-next' }
  };
  if (kind === 'theory') {
    return { ...base, slideId: partial.slideId || '', placement: partial.placement || 'modal', tip: undefined };
  }
  if (kind === 'highlight' || kind === 'click' || kind === 'input') {
    return {
      ...base,
      target: partial.target || { selectors: [], screenshot: '' },
      validation: partial.validation || (kind === 'click' ? { type: 'click-target' } : { type: 'manual-next' }),
      ...partial
    };
  }
  if (kind === 'wait') {
    return { ...base, validation: { type: 'element-exists', selector: '', timeoutMs: 30000 }, ...partial };
  }
  if (kind === 'quiz') {
    return {
      ...base,
      slideId: partial.slideId || '',
      placement: 'modal',
      tip: undefined,
      validation: { type: 'manual-next' },
      ...partial
    };
  }
  if (kind === 'checklist') {
    return { ...base, ...partial, tip: { title: '', body: 'Hake alle Punkte ab', placement: { position: 'right' } } };
  }
  return { ...base, ...partial };
}

export function newSlide(customerId, partial = {}) {
  const now = new Date().toISOString();
  return {
    id: partial.id || genId('slide'),
    customerId,
    title: partial.title || 'Neue Folie',
    subtitle: partial.subtitle || '',
    blocks: partial.blocks || [],
    estimatedReadSeconds: partial.estimatedReadSeconds || 60,
    voiceover: partial.voiceover || null,
    createdAt: partial.createdAt || now,
    updatedAt: now
  };
}

export function newBlock(type) {
  const id = genId('block');
  switch (type) {
    case 'heading': return { id, type, text: '' };
    case 'text': return { id, type, markdown: '' };
    case 'image': return { id, type, src: '', caption: '', alt: '' };
    case 'video': return { id, type, src: '', caption: '' };
    case 'callout': return { id, type, variant: 'info', markdown: '' };
    case 'code': return { id, type, language: 'plaintext', text: '' };
    case 'quiz': return {
      id, type,
      questions: [{ id: genId('q'), text: '', options: ['', '', '', ''], correctIndex: 0 }]
    };
    default: return { id, type: 'text', markdown: '' };
  }
}

export function newBranding(customerId, partial = {}) {
  return {
    customerId,
    customerName: partial.customerName || customerId,
    logoUrl: partial.logoUrl || null,
    accentColor: partial.accentColor || '#6366f1',
    welcomeText: partial.welcomeText || `Willkommen im Tempus-Training für ${partial.customerName || customerId}.`,
    domainHint: partial.domainHint || ''
  };
}

export function validateTour(tour) {
  const errors = [];
  if (!tour) return ['Tour fehlt'];
  if (!tour.id) errors.push('id fehlt');
  if (!tour.customerId) errors.push('customerId fehlt');
  if (!tour.title) errors.push('title fehlt');
  if (!Array.isArray(tour.steps)) {
    errors.push('steps muss Array sein');
  } else {
    const ids = new Set();
    tour.steps.forEach((s, i) => {
      if (!s.id) errors.push(`step[${i}].id fehlt`);
      if (ids.has(s.id)) errors.push(`step[${i}].id "${s.id}" doppelt`);
      ids.add(s.id);
      if (!STEP_KINDS.includes(s.kind)) errors.push(`step[${i}].kind ungültig: ${s.kind}`);
      if (s.validation && !VALIDATION_TYPES.includes(s.validation.type)) {
        errors.push(`step[${i}].validation.type ungültig: ${s.validation.type}`);
      }
      if (['highlight', 'click', 'input'].includes(s.kind)) {
        if (!s.target?.selectors?.length && !s.target?.screenshot) {
          errors.push(`step[${i}] (${s.kind}) braucht target.selectors oder screenshot`);
        }
      }
      if (s.kind === 'theory' && !s.slideId) {
        errors.push(`step[${i}] (theory) braucht slideId`);
      }
    });
  }
  return errors;
}

export function validateSlide(slide) {
  const errors = [];
  if (!slide?.id) errors.push('id fehlt');
  if (!slide?.customerId) errors.push('customerId fehlt');
  if (!slide?.title) errors.push('title fehlt');
  if (!Array.isArray(slide?.blocks)) errors.push('blocks muss Array sein');
  else slide.blocks.forEach((b, i) => {
    if (!BLOCK_TYPES.includes(b.type)) errors.push(`block[${i}].type ungültig: ${b.type}`);
  });
  return errors;
}

export const TRAINING_SCHEMA_META = {
  STEP_KINDS,
  VALIDATION_TYPES,
  BLOCK_TYPES
};
