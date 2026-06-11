/**
 * Ramp-Up Review & Feedback Framework (Valkeen)
 * Struktur für Gespräch mit Marc — Vorbereitung, Notizen, Nachbereitung.
 */

export const REVIEW_META_DEFAULT = {
  title: 'Ramp-Up Review',
  reviewDate: '',
  periodLabel: 'Erste 3 Monate (März–Mai 2026)',
  probationEnd: '2026-05-31',
  primaryParticipantId: 'marc',
  uiLocale: 'de',
};

/** Gesprächspartner – flexibel erweiterbar (z. B. Marc, Aayushi, …) */
export const DEFAULT_PARTICIPANTS = [
  { id: 'marc', name: 'Marc Neckermann', role: 'Manager' },
  { id: 'aayushi', name: 'Aayushi', role: 'Training & Enablement' },
];

export function emptyParticipantNotes() {
  return {
    standort: '',
    erwartungen: '',
    entwicklung: '',
    band: '',
    actions: '',
  };
}

/** Fragen aus deiner Termin-Einladung (Referenz, nicht editierbar im UI) */
export const INVITATION_QUESTIONS = [
  {
    id: 'standort',
    title: '1. Standortbestimmung',
    items: [
      'Was läuft aus deiner Sicht bereits gut?',
      'Wo siehst du meine stärksten Beiträge?',
      'Wo fehlen mir noch die letzten 20% bis zur Autonomie?',
    ],
  },
  {
    id: 'erwartungen',
    title: '2. Erwartungen für die nächsten 3 Monate',
    items: ['Welche konkreten Ergebnisse möchtest du bis September/Oktober von mir sehen?'],
  },
  {
    id: 'entwicklung',
    title: '3. Entwicklungspfad',
    items: ['Worauf sollte ich mich verstärkt konzentrieren?'],
  },
];

/** Nur im Gespräch stellen — nicht in der Mail */
export const LIVE_ONLY_QUESTION =
  'Wenn du an jemanden denkst, der im oberen Bereich des Zielbands liegt — was macht diese Person anders als jemand im unteren Bereich?';

export const OPENING_LINE_DEFAULT =
  'Ich möchte verstehen, wo ich heute stehe, was die nächsten Schritte sind und wie ich in den kommenden Monaten den größten Beitrag leisten kann.';

/** Vorschlagsliste Erfolge — Checkbox + eigene Einträge */
export const DEFAULT_ACHIEVEMENTS = [
  { id: 'horizon', text: 'Horizon: Pre-Implementation Q&A, Antwortkatalog, Workshop-Material', checked: false },
  { id: 'knauf', text: 'Knauf: QRG / User Guide (Almirall-Qualitätsniveau)', checked: false },
  { id: 'demos', text: 'Tempus-Demos & Storyboards (PM/RM, Stardust, BPA Deep Dive)', checked: false },
  { id: 'training', text: 'Trainings: BPA/PM-Curriculum, Methodentraining, Academy-Plan', checked: false },
  { id: 'support', text: 'Support: FAQ-Collection, Kundenmails, NN/Demand-Planning-Flows', checked: false },
  { id: 'api', text: 'Sandbox/API: Postman-Automation, Demo-Setups, dokumentierte Quirks', checked: false },
  { id: 'tools', text: 'Tools: Login-Mailer, Excel-Mapper, Onboarding-App-Erweiterungen', checked: false },
  { id: 'cistec', text: 'Cistec: Kick-off-Vorbereitung (Ordner, PPT, Projektplan)', checked: false },
  { id: 'customers', text: 'Kundentermine begleitet / Support-Fälle gelöst', checked: false },
];

export const SELF_ASSESSMENT_PROMPTS = [
  {
    id: 'strengths',
    label: 'Meine stärksten Beiträge (Selbsteinschätzung)',
    hint: 'Business↔IT, Training, Kundenverständnis, Eigeninitiative…',
    placeholder: '3–5 konkrete Beispiele mit Kunde/Projekt',
  },
  {
    id: 'gaps',
    label: 'Letzte ~20% bis Autonomie',
    hint: 'Tempus-Tiefe, Entscheidungssicherheit, weniger Rückversicherung…',
    placeholder: 'Was ich noch brauche / wo ich nachfrage',
  },
  {
    id: 'focus3m',
    label: 'Mein Fokus für die nächsten 3 Monate',
    hint: 'z. B. Cistec end-to-end, Tempus meistern, Enablement skalieren',
    placeholder: 'Max. 3 Prioritäten',
  },
  {
    id: 'impact115',
    label: 'Was „Entlastung für Marc“ konkret heisst',
    hint: 'Nicht Wissen — weniger Nachfassen, weniger Koordinieren',
    placeholder: 'Wie ich sichtbar Entlastung erzeuge',
  },
];

export const MEETING_NOTE_SECTIONS = [
  { id: 'standort', title: 'Standortbestimmung', color: 'indigo' },
  { id: 'erwartungen', title: 'Erwartungen Sep/Okt', color: 'violet' },
  { id: 'entwicklung', title: 'Entwicklungspfad & Fokus', color: 'fuchsia' },
  { id: 'band', title: 'Kriterien Zielband (live)', color: 'amber' },
  { id: 'actions', title: 'Vereinbarte nächste Schritte', color: 'emerald' },
];
