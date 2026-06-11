/**
 * Standard-Implementierungs-Framework (abgeleitet aus dem Cistec-Projektplan).
 * 5 Phasen, Schritte mit One-Click-Sprung in die jeweiligen Module.
 *
 * step.to:    interne Route (mit ?s=<session> ergänzt) oder null (Info/Meilenstein)
 * step.module: logischer Modul-Key (für Rechte-Matrix & spätere Tiefenintegration)
 * step.kind:  'tool' | 'info' | 'milestone'
 */

export const IMPL_PHASES = [
  {
    id: 'onboarding',
    title: { de: 'Einstieg (Onboarding)', en: 'Onboarding' },
    goal: {
      de: 'Scope, Team und technische Basis stehen — gemeinsamer Startpunkt.',
      en: 'Scope, team and technical basis are set — shared starting point.',
    },
    steps: [
      {
        id: 'kickoff',
        kind: 'tool',
        module: 'deck',
        to: '/kickoff-studio',
        owner: 'Valkeen/Cistec',
        title: { de: 'Kick-off Workshop', en: 'Kick-off workshop' },
        desc: {
          de: 'Anforderungen, Scope, Zeitplan & Plan — interaktives Deck.',
          en: 'Requirements, scope, timeline & plan — interactive deck.',
        },
      },
      {
        id: 'discovery',
        kind: 'tool',
        module: 'questionnaire',
        to: '/kickoff-studio',
        owner: 'Cistec',
        title: { de: 'Discovery-Fragebogen', en: 'Discovery questionnaire' },
        desc: {
          de: 'Zweck, Ziele, Ist/Soll, Datenstrategie — Antworten fürs Projekt.',
          en: 'Purpose, goals, current/future, data strategy — project answers.',
        },
      },
      {
        id: 'env-logins',
        kind: 'info',
        module: 'environment',
        to: null,
        owner: 'Valkeen/ProSymmetry',
        title: { de: 'DEV/PROD & Logins', en: 'DEV/PROD & logins' },
        desc: {
          de: 'Tempus-Instanz aktiviert, Zugänge fürs Implementierungsteam bereit.',
          en: 'Tempus instance activated, access for the implementation team ready.',
        },
      },
      {
        id: 'key-users',
        kind: 'tool',
        module: 'stakeholders',
        to: '/change-workflow/stakeholders',
        owner: 'Cistec',
        title: { de: 'Key-User identifizieren', en: 'Identify key users' },
        desc: {
          de: 'Wichtige Teilnehmende & Champions inkl. E-Mail festhalten.',
          en: 'Capture key participants & champions incl. e-mail.',
        },
      },
    ],
  },
  {
    id: 'analysis',
    title: { de: 'Analyse & Design', en: 'Analysis & design' },
    goal: {
      de: 'Datenmodell, Governance und Reporting sind entworfen und entschieden.',
      en: 'Data model, governance and reporting are designed and decided.',
    },
    steps: [
      {
        id: 'migration-data',
        kind: 'info',
        module: 'migration',
        to: null,
        owner: 'Cistec',
        title: { de: 'Migrationsdaten zusammenstellen', en: 'Compile migration data' },
        desc: {
          de: 'Ressourcen & Attribute (Excel / MS Project / Abacus) aufbereiten.',
          en: 'Prepare resources & attributes (Excel / MS Project / Abacus).',
        },
      },
      {
        id: 'current-future',
        kind: 'tool',
        module: 'change',
        to: '/change-workflow/dashboard',
        owner: 'Valkeen/Cistec',
        title: { de: 'Current/Future State', en: 'Current/future state' },
        desc: {
          de: 'Prozess, Tool und Kultur bewerten — Ausgangslage & Zielbild.',
          en: 'Assess process, tool and culture — baseline & target.',
        },
      },
      {
        id: 'change-strategy',
        kind: 'tool',
        module: 'change',
        to: '/change-workflow',
        owner: 'Cistec/Valkeen',
        title: { de: 'Change-Management-Strategie', en: 'Change management strategy' },
        desc: {
          de: 'Stakeholder, Kommunikation, Adoption — der Kunde pflegt das selbst.',
          en: 'Stakeholders, communication, adoption — customer-owned.',
        },
      },
      {
        id: 'decisions',
        kind: 'tool',
        module: 'decisions',
        to: '/implementation-log?tab=decisions',
        owner: 'Cistec/Valkeen',
        title: { de: 'Entscheidungen-Log', en: 'Decision log' },
        desc: {
          de: '22 Standard-Projektentscheidungen (Sprache, Modell, Governance …).',
          en: '22 standard project decisions (language, model, governance …).',
        },
      },
      {
        id: 'reporting',
        kind: 'info',
        module: 'reporting',
        to: null,
        owner: 'Cistec/Valkeen',
        title: { de: 'Reporting je Rolle mappen', en: 'Map reporting per role' },
        desc: {
          de: 'KPIs, Dashboards und Roadmap-Filter pro Rolle festlegen.',
          en: 'Define KPIs, dashboards and roadmap filters per role.',
        },
      },
    ],
  },
  {
    id: 'build',
    title: { de: 'Umsetzung', en: 'Build' },
    goal: {
      de: 'Lösung konfiguriert, getestet und vom Kunden abgenommen.',
      en: 'Solution configured, tested and signed off by the customer.',
    },
    steps: [
      {
        id: 'sso',
        kind: 'tool',
        module: 'sso',
        to: '/sso-setup',
        owner: 'Cistec/ProSymmetry',
        title: { de: 'SSO einrichten', en: 'Set up SSO' },
        desc: {
          de: 'Azure ↔ Tempus — kann früh erledigt werden.',
          en: 'Azure ↔ Tempus — can be done early.',
        },
      },
      {
        id: 'uat',
        kind: 'tool',
        module: 'uat',
        to: '/implementation-studio',
        owner: 'Valkeen/Cistec',
        title: { de: 'UAT-Checkliste', en: 'UAT checklist' },
        desc: {
          de: 'Rollenbasierte Use-Cases testen & Ergebnisse dokumentieren.',
          en: 'Test role-based use cases & document results.',
        },
      },
      {
        id: 'solution-design',
        kind: 'info',
        module: 'design',
        to: null,
        owner: 'Valkeen',
        title: { de: 'Solution Design verfeinern', en: 'Refine solution design' },
        desc: {
          de: 'Erkenntnisse aus UAT einarbeiten.',
          en: 'Incorporate findings from UAT.',
        },
      },
      {
        id: 'acceptance',
        kind: 'milestone',
        module: 'acceptance',
        to: null,
        owner: 'Cistec',
        title: { de: 'Kundenabnahme', en: 'Customer acceptance' },
        desc: {
          de: 'Formale Freigabe der Lösung.',
          en: 'Formal sign-off of the solution.',
        },
      },
    ],
  },
  {
    id: 'enablement',
    title: { de: 'Wissenstransfer & Go-Live', en: 'Enablement & go-live' },
    goal: {
      de: 'Anwender befähigt, System produktiv.',
      en: 'Users enabled, system in production.',
    },
    steps: [
      {
        id: 'training',
        kind: 'tool',
        module: 'training',
        to: '/training',
        owner: 'Valkeen/Cistec',
        title: { de: 'Enduser-Trainings', en: 'End-user training' },
        desc: {
          de: 'Rollen-/modulbasierte Trainings (Train-the-Trainer empfohlen).',
          en: 'Role-/module-based training (train-the-trainer recommended).',
        },
      },
      {
        id: 'guides',
        kind: 'tool',
        module: 'guides',
        to: '/qrg-builder',
        owner: 'Valkeen',
        title: { de: 'Rollen-PDF-Guides', en: 'Role-based PDF guides' },
        desc: {
          de: 'Quick Reference Guides pro Rolle erstellen.',
          en: 'Create quick reference guides per role.',
        },
      },
      {
        id: 'go-live',
        kind: 'milestone',
        module: 'golive',
        to: null,
        owner: 'Cistec',
        title: { de: 'GO-LIVE', en: 'GO-LIVE' },
        desc: {
          de: 'Produktivstart.',
          en: 'Production launch.',
        },
      },
    ],
  },
  {
    id: 'hypercare',
    title: { de: 'Hypercare & Optimierung', en: 'Hypercare & optimization' },
    goal: {
      de: 'Stabilisierung nach Go-Live und kontinuierliche Verbesserung.',
      en: 'Stabilization after go-live and continuous improvement.',
    },
    steps: [
      {
        id: 'support',
        kind: 'info',
        module: 'support',
        to: null,
        owner: 'Valkeen',
        title: { de: 'Laufender Support', en: 'Ongoing support' },
        desc: {
          de: 'Stabilisierung (z. B. 2 Wochen) und schnelle Hilfe.',
          en: 'Stabilization (e.g. 2 weeks) and fast help.',
        },
      },
      {
        id: 'optimize',
        kind: 'info',
        module: 'optimize',
        to: null,
        owner: 'Valkeen/Cistec',
        title: { de: 'Optimierung & Ausbau', en: 'Optimization & rollout' },
        desc: {
          de: 'Weitere Module/Use-Cases (Finanzen, Abacus-Integration …).',
          en: 'Further modules/use cases (financials, Abacus integration …).',
        },
      },
    ],
  },
];

export const STEP_STATUSES = ['open', 'in_progress', 'done'];

export const STEP_STATUS_LABEL = {
  de: { open: 'Offen', in_progress: 'In Arbeit', done: 'Erledigt' },
  en: { open: 'Open', in_progress: 'In progress', done: 'Done' },
};

/** Standard-Projektentscheidungen (aus Cistec „Entscheidungen") — Seed fürs Decision-Log. */
export const STANDARD_DECISIONS = [
  'Sprache für Attribute (Deutsch oder Englisch)?',
  'Sollen Skills von Anfang an importiert werden?',
  'Ziel einer rollenbasierten Planung?',
  'Projektziel & Scope final (PPM-Grobplanung vs. operative Detailplanung/Timesheets/Finanzen)',
  'Portfolio-Umfang festlegen (Projektarten, Programme, Ideen-Pipeline)',
  'Projektstandard (Phasen/Milestones, Level of Detail, Granularität)',
  'Projekttemplates & Pflichtfelder (Minimaldatensatz, Namenskonventionen)',
  'Stage-Gate-Modell (Gates, Kriterien, Verantwortliche, Pflichtfelder)',
  'Ressourcenmodell (Personen vs. Rollen vs. Teams; Skills; Cluster)',
  'Capacity-Definition (Std/Woche, FTE, Teilzeit, Feiertage/Absenzen)',
  'Grundlast/BAU-Handling (eigene BAU-Projekte? Kategorien? Default-Quoten?)',
  'Sicherheits- & Zugriffskonzept (welche Rolle sieht was)',
  'Datenverantwortung & Data Governance (Verantwortlich pro Datenobjekt)',
  'Migrationsumfang (laufende Projekte vs. Historie; Felder/Anhänge/Links)',
  'Reporting-/Dashboard-Set (Rollenberichte, KPIs, Filter)',
  'Priorisierungslogik (Scoring-Modell, Gewichtung)',
  'Szenarioanalyse-Ansatz (What-If, Engpasslogik, Freeze-Zeiträume)',
  'Genehmigungs-Workflow für Resource Requests (Antrag, Genehmigung, SLA)',
  'Plan-Ist-Konzept (welche Ist-Daten aus Abacus; Granularität; Mapping)',
  'Integrationsansatz Abacus (manuell/Export-Import/API; Frequenz)',
  'SSO ja/nein (Zeitpunkt: sofort vs. nach Go-Live)',
  'Rollout-Strategie (Pilot/Phased vs. Big Bang)',
];

/** Standard-Rollen (aus „Rollen-UseCases"). */
export const STANDARD_ROLES = [
  'Admin',
  'Admin Light',
  'Portfolio Manager',
  'Portfolio Viewer',
  'Project Manager',
  'Resource Manager / Team Lead',
];

export function allModuleKeys() {
  const keys = new Set();
  for (const ph of IMPL_PHASES) for (const s of ph.steps) keys.add(s.module);
  return [...keys];
}

export function tx(node, locale) {
  if (!node) return '';
  return node[locale] || node.de || node.en || '';
}
