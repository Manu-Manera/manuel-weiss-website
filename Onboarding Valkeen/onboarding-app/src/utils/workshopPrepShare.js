/**
 * Vorab-Fragebogen für Workshop-Vorbereitung: eigener DynamoDB-Schlüssel (userId) pro Token.
 * Kund:innen füllen vor dem Workshop aus — Moderation sieht Antworten vorher ein.
 */

export const WORKSHOP_PREP_QUESTIONS = [
  {
    key: 'context',
    question: 'Welche Veränderung steht bei euch an?',
    placeholder: 'z. B. Einführung eines neuen ERP-Systems, Reorganisation der Abteilung, neues Arbeitsmodell …',
    multiline: true,
  },
  {
    key: 'timeline',
    question: 'Wann ist der geplante Go-Live oder Abschluss?',
    placeholder: 'z. B. Q3 2026, Ende Jahr, in 6 Monaten …',
    multiline: false,
  },
  {
    key: 'stakeholders',
    question: 'Wer sind die wichtigsten Stakeholder / Betroffenen?',
    placeholder: 'z. B. Geschäftsleitung, IT-Abteilung, Aussendienst, externe Partner …',
    multiline: true,
  },
  {
    key: 'challenges',
    question: 'Welche Hindernisse oder Bedenken erwartest du?',
    placeholder: 'z. B. Widerstand bei langjährigen Mitarbeitenden, knappe Ressourcen, parallele Projekte …',
    multiline: true,
  },
  {
    key: 'expectations',
    question: 'Was erhoffst du dir vom Workshop?',
    placeholder: 'z. B. Klarheit über nächste Schritte, Stakeholder-Analyse, gemeinsame Story …',
    multiline: true,
  },
  {
    key: 'additionalInfo',
    question: 'Gibt es sonst noch etwas, das wir wissen sollten?',
    placeholder: 'Freitext für alles, was nicht in die anderen Fragen passt …',
    multiline: true,
  },
];

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

export function workshopPrepUserId(shareToken) {
  return `workshop-prep-${String(shareToken || '').trim()}`;
}

export function isValidWorkshopPrepToken(t) {
  const s = String(t || '').trim();
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);
}

export function normalizeWorkshopPrepData(raw) {
  if (!raw || typeof raw !== 'object') return { answers: {}, customerLabel: '', updatedAt: null };
  return {
    answers: typeof raw.answers === 'object' && raw.answers !== null ? { ...raw.answers } : {},
    customerLabel: String(raw.customerLabel || '').trim(),
    updatedAt: raw.updatedAt || null,
    createdAt: raw.createdAt || null,
  };
}

export function emptyWorkshopPrepData() {
  return {
    answers: {},
    customerLabel: '',
    updatedAt: null,
    createdAt: new Date().toISOString(),
  };
}

export function buildProgressBlobWithWorkshopPrep(workshopPrepData) {
  return {
    ...PROGRESS_SHELL,
    workshopPrep: normalizeWorkshopPrepData(workshopPrepData),
  };
}

export function buildMirrorPrepFromFacilitatorProfile(profile) {
  const now = new Date().toISOString();
  return {
    answers: {},
    customerLabel: String(profile?.customerLabel || '').trim(),
    updatedAt: now,
    createdAt: now,
    mirroredFromFacilitatorAt: now,
  };
}
