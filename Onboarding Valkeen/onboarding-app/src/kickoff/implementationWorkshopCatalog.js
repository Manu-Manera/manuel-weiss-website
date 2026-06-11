/**
 * Workshop-Katalog: Framework-Steps + Valkeen/Onboarding-Inhalte.
 * Einheitliche Sprungziele für Leitfaden, Portal und Shell.
 */
import { IMPL_PHASES, tx } from './implementationTemplate';
import { WORKSHOP_PHASE_CATALOG } from '../data/workshopPhaseCatalog';
import { KOTTER_CATALOG_ITEMS } from '../data/kotterCatalogData';
import {
  buildHubHref,
  buildMeetingHref,
  buildPageHref,
  buildWorkshopHref,
} from './useImplementationNav';

export const ARTIFACT_KIND = {
  presentation: 'presentation',
  workshop: 'workshop',
  meeting: 'meeting',
  checklist: 'checklist',
  tool: 'tool',
  milestone: 'milestone',
};

/** Zusätzliche Inhalte aus Onboarding (nicht als IMPL-Step). */
const SUPPLEMENTARY = [
  {
    id: 'change-workshop',
    kind: 'workshop',
    phaseId: 'analysis',
    module: 'change',
    title: { de: 'Change-Workshop (Moderation)', en: 'Change workshop (facilitation)' },
    desc: {
      de: '8-Phasen-Workshop (~4h): Kotter, Stakeholder, Story, Fahrplan.',
      en: '8-phase workshop (~4h): Kotter, stakeholders, story, roadmap.',
    },
    shell: 'ChangeWorkflow',
    owner: 'Valkeen/Cistec',
  },
  {
    id: 'workshop-tools',
    kind: 'tool',
    phaseId: 'analysis',
    module: 'change',
    title: { de: 'Workshop-Tools', en: 'Workshop tools' },
    desc: { de: 'Vorab-Link, Kotter-KI, ICS, Follow-up-E-Mails.', en: 'Prep link, Kotter AI, ICS, follow-up mail.' },
    shell: 'WorkshopTools',
    route: '/change-workflow/tools',
    owner: 'Valkeen',
  },
  {
    id: 'change-journey',
    kind: 'workshop',
    phaseId: 'enablement',
    module: 'change',
    title: { de: 'Change Journey', en: 'Change journey' },
    desc: {
      de: 'Post-Workshop-Begleitung: Checklisten, Meilensteine, Share-Link.',
      en: 'Post-workshop journey: checklists, milestones, share link.',
    },
    shell: 'ChangeJourney',
    route: '/change-workflow/journey',
    owner: 'Cistec/Valkeen',
  },
  {
    id: 'comms-plan',
    kind: 'tool',
    phaseId: 'analysis',
    module: 'change',
    title: { de: 'Kommunikationsplan', en: 'Communication plan' },
    desc: { de: 'Maßnahmen-Kalender, Kanäle, Story, Export.', en: 'Calendar, channels, story, export.' },
    shell: 'CommunicationPlan',
    route: '/change-workflow/comms-plan',
    owner: 'Cistec/Valkeen',
  },
  {
    id: 'feedback-framework',
    kind: 'workshop',
    phaseId: 'hypercare',
    module: 'support',
    title: { de: 'Ramp-Up / Feedback', en: 'Ramp-up / feedback' },
    desc: { de: 'Review-Workshop mit Live-Fragen und PDF.', en: 'Review workshop with live questions and PDF.' },
    shell: 'FeedbackFramework',
    route: '/feedback-framework',
    owner: 'Valkeen',
  },
  {
    id: 'tempus-demo',
    kind: 'presentation',
    phaseId: 'build',
    module: 'training',
    title: { de: 'Tempus Live-Demo', en: 'Tempus live demo' },
    desc: { de: 'Demo-Umgebungen und Story für Kundentermine.', en: 'Demo environments for customer meetings.' },
    shell: 'TempusDemo',
    route: '/tempus-demo',
    owner: 'Valkeen',
  },
  {
    id: 'tempus-trainer',
    kind: 'tool',
    phaseId: 'enablement',
    module: 'training',
    title: { de: 'Tempus Trainer (Extension)', en: 'Tempus trainer (extension)' },
    desc: { de: 'Live-Touren in Tempus — Train-the-Trainer.', en: 'Live tours in Tempus — train-the-trainer.' },
    shell: 'TempusTrainerHub',
    route: '/tempus-trainer',
    owner: 'Valkeen',
  },
];

function inferKind(step) {
  if (step.kind === 'milestone') return ARTIFACT_KIND.milestone;
  if (!step.to) return ARTIFACT_KIND.checklist;
  if (step.module === 'deck') return ARTIFACT_KIND.presentation;
  if (step.module === 'change') return ARTIFACT_KIND.workshop;
  return ARTIFACT_KIND.tool;
}

/** Shell-Component-Key für Framework-Steps. */
const STEP_SHELL = {
  kickoff: 'KickoffStudio',
  discovery: 'KickoffStudio',
  'key-users': 'StakeholderAnalysis',
  'current-future': 'ChangeDashboard',
  'change-strategy': 'ChangeWorkflow',
  sso: 'SSOSetup',
  training: 'Training',
  guides: 'QrgBuilder',
};

function stepToArtifact(step, phaseId) {
  const kind = inferKind(step);
  const shell = step.to ? STEP_SHELL[step.id] : 'ChecklistWorkshop';
  return {
    id: step.id,
    source: 'framework',
    kind,
    phaseId,
    module: step.module,
    stepId: step.id,
    title: step.title,
    desc: step.desc,
    owner: step.owner,
    route: step.to,
    shell: step.to ? shell : 'ChecklistWorkshop',
    meetingTypes: step.id === 'kickoff' ? ['kickoff'] : [],
  };
}

function buildCatalog() {
  const map = new Map();

  for (const ph of IMPL_PHASES) {
    for (const step of ph.steps) {
      map.set(step.id, stepToArtifact(step, ph.id));
    }
  }

  for (const s of SUPPLEMENTARY) {
    if (!map.has(s.id)) map.set(s.id, { ...s, source: 'supplementary' });
  }

  for (const p of WORKSHOP_PHASE_CATALOG) {
    const id = `phase-${p.id}`;
    map.set(id, {
      id,
      source: 'workshop-phase',
      kind: ARTIFACT_KIND.workshop,
      phaseId: 'analysis',
      module: 'change',
      title: { de: `${p.label} · Workshop-Phase`, en: `${p.label} · workshop phase` },
      desc: { de: p.description, en: p.description },
      shell: 'PhaseTilePage',
      route: `/change-workflow/phase/${p.id}`,
      phaseParam: p.id,
      owner: 'Valkeen',
      meetingTypes: ['workshop'],
    });
  }

  for (const k of KOTTER_CATALOG_ITEMS) {
    const id = `kotter-${k.slug}`;
    map.set(id, {
      id,
      source: 'kotter',
      kind: ARTIFACT_KIND.workshop,
      phaseId: 'analysis',
      module: 'change',
      title: { de: `Kotter · ${k.label}`, en: `Kotter · ${k.label}` },
      desc: { de: k.subtitle || k.label, en: k.subtitle || k.label },
      shell: 'KotterTilePage',
      route: `/change-workflow/kotter/${k.slug}`,
      kotterSlug: k.slug,
      owner: 'Valkeen',
      meetingTypes: ['workshop', 'steering'],
    });
  }

  return map;
}

const CATALOG_MAP = buildCatalog();

export function getArtifact(id) {
  if (!id) return null;
  return CATALOG_MAP.get(id) || null;
}

export function listArtifacts() {
  return [...CATALOG_MAP.values()];
}

export function listArtifactsByPhase(phaseId) {
  return listArtifacts().filter((a) => a.phaseId === phaseId);
}

export function artifactsForMeetingType(type) {
  return listArtifacts().filter((a) => a.meetingTypes?.includes(type));
}

/** Bevorzugter Link für Leitfaden / Katalog. */
export function resolveArtifactHref(artifact, sessionId, opts = {}) {
  if (!artifact) return buildHubHref(sessionId, opts);

  if (artifact.route && !artifact.shell) {
    return buildPageHref(artifact.route, sessionId, { portalMode: opts.portalMode, from: artifact.id });
  }

  if (artifact.shell === 'ChecklistWorkshop' || artifact.kind === ARTIFACT_KIND.checklist) {
    return buildWorkshopHref(artifact.id, sessionId, { portalMode: opts.portalMode, from: artifact.id });
  }

  if (artifact.route?.startsWith('/implementation-')) {
    return buildPageHref(artifact.route, sessionId, { portalMode: opts.portalMode, from: artifact.id });
  }

  return buildWorkshopHref(artifact.id, sessionId, { portalMode: opts.portalMode, from: artifact.id });
}

export function meetingArtifactHref(meeting, sessionId, opts = {}) {
  if (!meeting?.id) return buildHubHref(sessionId, opts);
  return buildMeetingHref(meeting.id, sessionId, opts);
}
