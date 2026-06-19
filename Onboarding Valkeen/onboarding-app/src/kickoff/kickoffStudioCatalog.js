/** Chapters map to slide ids from kickoff-deck.json */
export const CHAPTERS = [
  {
    id: 'opening',
    slideIds: ['agenda', 'workshop-rules', 'path-to-success'],
    labelDe: 'Eröffnung',
    labelEn: 'Opening',
  },
  {
    id: 'people',
    slideIds: [
      'team',
      'partnership',
      'impl-team-roles',
      'ways-of-working-theory',
      'ways-of-working',
      'valkeen-expectations',
      'success-metrics',
    ],
    labelDe: 'Team & Zusammenarbeit',
    labelEn: 'Team & ways of working',
  },
  {
    id: 'delivery',
    slideIds: ['impl-phases', 'documents-training', 'scope-theory', 'scope-wave1'],
    labelDe: 'Phasen & Scope',
    labelEn: 'Phases & scope',
  },
  {
    id: 'operating',
    slideIds: [
      'user-groups-theory',
      'user-groups',
      'integrated-process',
      'projects-tempus',
      'resource-requests',
      'role-concept',
    ],
    labelDe: 'Betrieb & Prozesse',
    labelEn: 'Operating model',
  },
  {
    id: 'timesheets',
    slideIds: ['timesheets-theory', 'timesheets'],
    labelDe: 'Timesheets',
    labelEn: 'Timesheets',
  },
  {
    id: 'capacity',
    slideIds: ['capacity-theory', 'capacity'],
    labelDe: 'Kapazität',
    labelEn: 'Capacity',
  },
  {
    id: 'data',
    slideIds: ['data-migration-theory', 'data-migration'],
    labelDe: 'Datenmigration',
    labelEn: 'Data migration',
  },
  {
    id: 'integrations',
    section: 'integrations',
    optional: true,
    slideIds: [
      'integrations-theory',
      'integrations-scope',
      'integrations-data',
      'integrations-budget',
      'integrations-owners',
      'integrations-open',
    ],
    labelDe: 'Integrationen',
    labelEn: 'Integrations',
  },
  {
    id: 'close',
    slideIds: ['parking-lot', 'decisions-today', 'next-steps'],
    labelDe: 'Abschluss',
    labelEn: 'Close',
  },
];

export function chapterLabel(chapter, locale) {
  return locale === 'de' ? chapter.labelDe : chapter.labelEn;
}

export function visibleChapters(includeIntegrations) {
  return CHAPTERS.filter((c) => !c.optional || includeIntegrations);
}

export function flattenSlides(chapters, slideById) {
  const ids = chapters.flatMap((c) => c.slideIds);
  return ids.map((id) => slideById.get(id)).filter(Boolean);
}

/** Exakte Deck-Reihenfolge aus kickoff-deck.json (eine Folie = ein Schritt). */
export function getPresentationSlides(slideList, includeIntegrations) {
  return slideList.filter(
    (s) => s && (s.section !== 'integrations' || includeIntegrations)
  );
}

export function chapterForSlideId(chapters, slideId) {
  return chapters.find((c) => c.slideIds.includes(slideId)) || null;
}

/** CSS-Klasse für Kapitel-Akzent in der Folien-Leiste (Prio 3 Brand) */
export function chapterThemeClass(chapter) {
  if (!chapter?.id) return '';
  return `kickoff-chapter--${chapter.id}`;
}

/** Badge-Typ für Folien-Kicker: theory | workshop | integration */
export function slideKindTheme(slide, chapter) {
  if (chapter?.section === 'integrations' || slide?.section === 'integrations') {
    return 'integration';
  }
  return slide?.kind === 'workshop' ? 'workshop' : 'theory';
}
