/**
 * UI- und Inhalts-Strings für Feedback Framework (DE / EN).
 */

export const FEEDBACK_LOCALES = ['de', 'en'];

export const FEEDBACK_UI = {
  de: {
    pageTitle: 'Feedback Framework · Ramp-Up Review',
    pageSubtitle:
      'Vorbereitung für Feedback-Gespräche: Erfolge, Selbsteinschätzung, Notizen pro Person und Nachbereitung.',
    reviewTitle: 'Review-Titel',
    reviewDate: 'Termin',
    period: 'Zeitraum',
    probationEnd: 'Probezeit Ende',
    participants: 'Gesprächspartner',
    addPerson: 'Person hinzufügen',
    primary: 'Haupt',
    primaryTitle: 'Als Hauptgesprächspartner markieren',
    namePlaceholder: 'Name',
    rolePlaceholder: 'Rolle (optional)',
    removePerson: 'entfernen',
    unnamed: 'Unbenannt',
    currentParticipants: 'Aktuell',
    primaryLabel: 'Haupt',
    tabPrep: 'Vorbereitung',
    tabQuestions: 'Gesprächsfragen',
    tabMeeting: 'Gesprächsnotizen',
    tabAfter: 'Nachbereitung',
    copyMd: 'Als Markdown',
    copied: 'Kopiert',
    exportPdf: 'PDF exportieren',
    pdfExporting: 'PDF…',
    pdfFailed: 'PDF-Export fehlgeschlagen',
    openingLine: 'Einstiegssatz',
    achievements: 'Erfolge · Ramp-Up (für das Gespräch)',
    achievementsHint: 'Abhaken, was du im Gespräch konkret besprechen willst.',
    customAchievement: 'Eigener Erfolg…',
    addAchievement: 'Erfolg hinzufügen',
    selfAssessment: 'Selbsteinschätzung (vor dem Termin)',
    liveOnly: 'Nur live stellen (nicht in der Mail)',
    liveNotesPlaceholder: 'Deine Notizen / was du dir merken willst…',
    questionsFor: 'Fragen für',
    liveExtra: 'Zusatz · nur im Termin',
    meetingNotesPlaceholder: 'Notizen während / direkt nach dem Gespräch…',
    personLabel: 'Person',
    summary: 'Kurz-Zusammenfassung',
    summaryPlaceholder: 'Was war das wichtigste Ergebnis des Gesprächs?',
    commitments: 'Eigene Commitments',
    commitmentsPlaceholder: 'Was mache ich bis September/Oktober konkret?',
    nextReview: 'Nächstes Review (optional)',
    syncLoading: 'Lade…',
    syncSaving: 'Synchronisiere mit AWS…',
    syncSaved: 'Gespeichert (lokal + DynamoDB)',
    langDe: 'Deutsch',
    langEn: 'English',
    mdWith: 'Mit',
    mdPeriod: 'Zeitraum',
    mdDate: 'Termin',
    mdOpening: 'Einstieg',
    mdAchievements: 'Erfolge (Vorbereitung)',
    mdNoChecks: 'Noch keine Häkchen gesetzt',
    mdSelfAssessment: 'Selbsteinschätzung',
    mdMeetingNotes: 'Notizen aus dem Gespräch',
    mdAfter: 'Nachbereitung',
    mdCommitments: 'Eigene Commitments',
    mdNextReview: 'Nächstes Review',
    pdfGenerated: 'Erstellt',
    pdfParticipants: 'Gesprächspartner',
    pdfProbationEnd: 'Probezeit Ende',
    pdfQuestions: 'Gesprächsfragen (Referenz)',
    pdfLiveOnly: 'Nur live stellen',
  },
  en: {
    pageTitle: 'Feedback Framework · Ramp-Up Review',
    pageSubtitle:
      'Prepare feedback conversations: achievements, self-assessment, notes per person, and follow-up.',
    reviewTitle: 'Review title',
    reviewDate: 'Date',
    period: 'Period',
    probationEnd: 'Probation end',
    participants: 'Conversation partners',
    addPerson: 'Add person',
    primary: 'Primary',
    primaryTitle: 'Mark as primary conversation partner',
    namePlaceholder: 'Name',
    rolePlaceholder: 'Role (optional)',
    removePerson: 'remove',
    unnamed: 'Unnamed',
    currentParticipants: 'Current',
    primaryLabel: 'Primary',
    tabPrep: 'Preparation',
    tabQuestions: 'Discussion questions',
    tabMeeting: 'Meeting notes',
    tabAfter: 'Follow-up',
    copyMd: 'Copy as Markdown',
    copied: 'Copied',
    exportPdf: 'Export PDF',
    pdfExporting: 'PDF…',
    pdfFailed: 'PDF export failed',
    openingLine: 'Opening line',
    achievements: 'Achievements · ramp-up (for the conversation)',
    achievementsHint: 'Check what you want to discuss in the meeting.',
    customAchievement: 'Custom achievement…',
    addAchievement: 'Add achievement',
    selfAssessment: 'Self-assessment (before the meeting)',
    liveOnly: 'Ask live only (not in the email)',
    liveNotesPlaceholder: 'Your notes / what you want to remember…',
    questionsFor: 'Questions for',
    liveExtra: 'Extra · live only',
    meetingNotesPlaceholder: 'Notes during / right after the conversation…',
    personLabel: 'Person',
    summary: 'Short summary',
    summaryPlaceholder: 'What was the most important outcome of the conversation?',
    commitments: 'Personal commitments',
    commitmentsPlaceholder: 'What will I do concretely by September/October?',
    nextReview: 'Next review (optional)',
    syncLoading: 'Loading…',
    syncSaving: 'Syncing with AWS…',
    syncSaved: 'Saved (local + DynamoDB)',
    langDe: 'Deutsch',
    langEn: 'English',
    mdWith: 'With',
    mdPeriod: 'Period',
    mdDate: 'Date',
    mdOpening: 'Opening',
    mdAchievements: 'Achievements (preparation)',
    mdNoChecks: 'No items checked yet',
    mdSelfAssessment: 'Self-assessment',
    mdMeetingNotes: 'Notes from the conversation',
    mdAfter: 'Follow-up',
    mdCommitments: 'Personal commitments',
    mdNextReview: 'Next review',
    pdfGenerated: 'Created',
    pdfParticipants: 'Conversation partners',
    pdfProbationEnd: 'Probation end',
    pdfQuestions: 'Discussion questions (reference)',
    pdfLiveOnly: 'Live only',
  },
};

export const INVITATION_QUESTIONS_I18N = {
  de: [
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
  ],
  en: [
    {
      id: 'standort',
      title: '1. Current state',
      items: [
        'What is already going well from your perspective?',
        'Where do you see my strongest contributions?',
        'Where am I still missing the last 20% toward autonomy?',
      ],
    },
    {
      id: 'erwartungen',
      title: '2. Expectations for the next 3 months',
      items: ['What concrete outcomes would you like to see from me by September/October?'],
    },
    {
      id: 'entwicklung',
      title: '3. Development path',
      items: ['What should I focus on more strongly?'],
    },
  ],
};

export const LIVE_ONLY_QUESTION_I18N = {
  de: 'Wenn du an jemanden denkst, der im oberen Bereich des Zielbands liegt — was macht diese Person anders als jemand im unteren Bereich?',
  en: 'When you think of someone in the upper part of the target band — what does that person do differently from someone in the lower part?',
};

export const SELF_ASSESSMENT_I18N = {
  de: [
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
      label: 'Was „Entlastung“ konkret heisst',
      hint: 'Nicht Wissen — weniger Nachfassen, weniger Koordinieren',
      placeholder: 'Wie ich sichtbar Entlastung erzeuge',
    },
  ],
  en: [
    {
      id: 'strengths',
      label: 'My strongest contributions (self-assessment)',
      hint: 'Business↔IT, training, customer understanding, initiative…',
      placeholder: '3–5 concrete examples with customer/project',
    },
    {
      id: 'gaps',
      label: 'Last ~20% toward autonomy',
      hint: 'Tempus depth, decision confidence, less double-checking…',
      placeholder: 'What I still need / where I ask for reassurance',
    },
    {
      id: 'focus3m',
      label: 'My focus for the next 3 months',
      hint: 'e.g. end-to-end customer rollout, master Tempus, scale enablement',
      placeholder: 'Max. 3 priorities',
    },
    {
      id: 'impact115',
      label: 'What “creating relief” means concretely',
      hint: 'Not knowledge — less chasing, less coordinating',
      placeholder: 'How I visibly create relief for my manager',
    },
  ],
};

export const MEETING_SECTIONS_I18N = {
  de: [
    { id: 'standort', title: 'Standortbestimmung' },
    { id: 'erwartungen', title: 'Erwartungen Sep/Okt' },
    { id: 'entwicklung', title: 'Entwicklungspfad & Fokus' },
    { id: 'band', title: 'Kriterien Zielband (live)' },
    { id: 'actions', title: 'Vereinbarte nächste Schritte' },
  ],
  en: [
    { id: 'standort', title: 'Current state' },
    { id: 'erwartungen', title: 'Expectations Sep/Oct' },
    { id: 'entwicklung', title: 'Development path & focus' },
    { id: 'band', title: 'Target band criteria (live)' },
    { id: 'actions', title: 'Agreed next steps' },
  ],
};

export const ACHIEVEMENT_LABELS_I18N = {
  de: {
    horizon: 'Horizon: Pre-Implementation Q&A, Antwortkatalog, Workshop-Material',
    knauf: 'Knauf: QRG / User Guide (Almirall-Qualitätsniveau)',
    demos: 'Tempus-Demos & Storyboards (PM/RM, Stardust, BPA Deep Dive)',
    training: 'Trainings: BPA/PM-Curriculum, Methodentraining, Academy-Plan',
    support: 'Support: FAQ-Collection, Kundenmails, NN/Demand-Planning-Flows',
    api: 'Sandbox/API: Postman-Automation, Demo-Setups, dokumentierte Quirks',
    tools: 'Tools: Login-Mailer, Excel-Mapper, Onboarding-App-Erweiterungen',
    cistec: 'Cistec: Kick-off-Vorbereitung (Ordner, PPT, Projektplan)',
    customers: 'Kundentermine begleitet / Support-Fälle gelöst',
  },
  en: {
    horizon: 'Horizon: pre-implementation Q&A, answer catalogue, workshop materials',
    knauf: 'Knauf: QRG / user guide (Almirall quality level)',
    demos: 'Tempus demos & storyboards (PM/RM, Stardust, BPA deep dive)',
    training: 'Training: BPA/PM curriculum, methods training, academy plan',
    support: 'Support: FAQ collection, customer emails, NN/demand-planning flows',
    api: 'Sandbox/API: Postman automation, demo setups, documented quirks',
    tools: 'Tools: login mailer, Excel mapper, onboarding app extensions',
    cistec: 'Cistec: kick-off preparation (folder, PPT, project plan)',
    customers: 'Customer meetings supported / support cases resolved',
  },
};

export function feedbackUi(locale, key) {
  const loc = FEEDBACK_LOCALES.includes(locale) ? locale : 'de';
  return FEEDBACK_UI[loc][key] ?? FEEDBACK_UI.de[key] ?? key;
}

export function achievementLabel(locale, id, fallbackText) {
  return ACHIEVEMENT_LABELS_I18N[locale]?.[id] ?? fallbackText;
}
