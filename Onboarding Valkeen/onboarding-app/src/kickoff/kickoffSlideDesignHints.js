/**
 * Design-Vorschläge pro Folie (Gamma-inspiriert) — Icons, Layout, Gamma-Prompt.
 * Werden lokal angewendet; optional 1-Karten-Gamma-Export über API.
 */

export const SLIDE_DESIGN_HINTS = {
  agenda: {
    icon: 'ListOrdered',
    layout: 'waterfall',
    de: {
      summary: 'Gestufter Wasserfall mit nummerierten Kacheln — wenig Fließtext, klare Phasen.',
      tips: [
        'Jede Phase als eigene Karte mit Kurztitel + 1 Zeile Beschreibung',
        'Icons: Kontext (Buch), Workshop (Stift), Integration (Plug), Abschluss (Flag)',
        'Gamma: „stepped waterfall cards, numbered, teal accent borders“',
      ],
      gammaExtra:
        'Layout: 4 stepped cards in a waterfall cascade from top-left. Numbered circles, short title bold, description below. Minimal bullet text. Valkeen blue #0f4c81 and teal #00a878.',
    },
    en: {
      summary: 'Stepped waterfall with numbered tiles — minimal body text, clear phases.',
      tips: [
        'One card per phase with short title + one-line description',
        'Icons: context (book), workshop (pen), integrations (plug), close (flag)',
        'Gamma: “stepped waterfall cards, numbered, teal accent borders”',
      ],
      gammaExtra:
        'Layout: 4 stepped cards in a waterfall cascade. Numbered circles, bold short titles, descriptions below. Valkeen blue #0f4c81 and teal #00a878.',
    },
  },
  partnership: {
    icon: 'Handshake',
    layout: 'split',
    de: {
      summary: 'Links Bullets, rechts großes Dreieck-Diagramm (PM / Portfolio / RM).',
      tips: ['Partner-Logos oder Icons neben Valkeen & ProSymmetry', 'Diagramm dominant, Text kompakt'],
      gammaExtra:
        'Split slide: left column 3 short bullets, right large circular triangle diagram for Portfolio / Project / Resource management with center hub.',
    },
    en: {
      summary: 'Bullets left, large triangle diagram right (PM / Portfolio / RM).',
      tips: ['Partner logos beside Valkeen & ProSymmetry', 'Diagram dominant, compact text'],
      gammaExtra:
        'Split slide: left bullets, right circular triangle diagram with resource management hub center.',
    },
  },
  'scope-theory': {
    icon: 'LayoutGrid',
    layout: 'modules',
    de: {
      summary: 'Modul-Raster mit gelber Scope-Markierung — interaktiv im Studio.',
      tips: ['Keine langen Bullet-Listen parallel zum Raster', 'Highlight nur markierte Module'],
      gammaExtra:
        'Icon grid of 12 product modules, yellow border on in-scope items, dark blue background, executive style.',
    },
    en: {
      summary: 'Module grid with yellow in-scope highlight — interactive in studio.',
      tips: ['Avoid long bullet list beside the grid', 'Highlight only selected modules'],
      gammaExtra:
        'Icon grid, yellow border on in-scope modules, dark blue executive layout.',
    },
  },
  'impl-phases': {
    icon: 'Route',
    layout: 'phases',
    de: {
      summary: 'Horizontale Phasen-Leiste mit nummerierten Knoten.',
      tips: ['5 Phasen als Timeline', 'Aktuelle Phase optional hervorheben'],
      gammaExtra: 'Horizontal timeline with 5 numbered phase nodes, connector line, teal milestones.',
    },
    en: {
      summary: 'Horizontal phase timeline with numbered nodes.',
      tips: ['5 phases as timeline', 'Optionally highlight current phase'],
      gammaExtra: 'Horizontal 5-step timeline, connector line, teal accent.',
    },
  },
  'integrated-process': {
    icon: 'GitBranch',
    layout: 'process',
    de: {
      summary: 'Swimlane / PI-Timeline — Prozess dominant, Text minimal.',
      tips: ['Intake → Planning → Execution farblich getrennt', 'PM/RM/Portfolio als Zeilen'],
      gammaExtra:
        'Swimlane diagram: intake, planning, execution columns with chevron timeline and role rows.',
    },
    en: {
      summary: 'Swimlane / PI timeline — process dominant.',
      tips: ['Color-coded intake → planning → execution', 'PM/RM/Portfolio rows'],
      gammaExtra: 'Swimlane with chevron timeline and role lanes.',
    },
  },
  'role-concept': {
    icon: 'UserCircle',
    layout: 'role',
    de: {
      summary: 'Silhouette + Primary / Secondary / Skills mit Farbcodes.',
      tips: ['1→1 vs 1→n als kleine Labels', 'Beispiel-Developer optional'],
      gammaExtra:
        'Person silhouette left, three labeled groups Primary (dark teal), Secondary, Skills (green) with chips.',
    },
    en: {
      summary: 'Silhouette + primary/secondary/skills color groups.',
      tips: ['Show 1→1 vs 1→n cardinality', 'Optional example developer'],
      gammaExtra: 'Silhouette with three color-coded role/skill groups and chips.',
    },
  },
  'capacity-theory': {
    icon: 'BarChart3',
    layout: 'capacity',
    de: {
      summary: 'Gestapelte Kapazitäts-Stufen (Basis → Netto → Verfügbar).',
      tips: ['Farben: grau / teal / dunkelblau', 'Legende unter dem Chart'],
      gammaExtra:
        'Stacked capacity bars stepping down: base, net, project availability, with color legend.',
    },
    en: {
      summary: 'Stacked capacity levels (base → net → available).',
      tips: ['Colors grey / teal / navy', 'Legend below chart'],
      gammaExtra: 'Stepped capacity bar chart with legend.',
    },
  },
  team: {
    icon: 'Users',
    layout: 'capture',
    de: {
      summary: 'Workshop-Tabelle — großzügiges Padding, klare Spaltenköpfe.',
      tips: ['Icon „Users“ im Kicker', 'Leere Zeilen als dezente Platzhalter'],
      gammaExtra: 'Clean table layout for workshop capture, teal header row.',
    },
    en: {
      summary: 'Workshop table — generous padding, clear headers.',
      tips: ['Users icon in kicker', 'Subtle placeholders for empty rows'],
      gammaExtra: 'Workshop capture table, teal header.',
    },
  },
};

const BULLET_ICON_RULES = [
  { re: /partner|valkeen|prosymmetry|zusammen/i, icon: 'Handshake' },
  { re: /excel|import|daten|migration|load/i, icon: 'FileSpreadsheet' },
  { re: /api|integration|erp|sap|schnittstelle/i, icon: 'Plug' },
  { re: /rolle|role|admin|manager|rm\b|pm\b/i, icon: 'UserCog' },
  { re: /kapazit|capacity|fte|stunde/i, icon: 'BarChart3' },
  { re: /timesheet|zeit|actual/i, icon: 'Clock' },
  { re: /security|sso|zugang/i, icon: 'Shield' },
  { re: /training|schulung|guide/i, icon: 'GraduationCap' },
  { re: /entscheid|decision|next step|parking/i, icon: 'CheckCircle2' },
  { re: /projekt|project|portfolio/i, icon: 'FolderKanban' },
  { re: /workshop|live|erfass/i, icon: 'PenLine' },
];

export function hintForSlide(slideId, locale) {
  const h = SLIDE_DESIGN_HINTS[slideId];
  if (!h) return null;
  return h[locale] || h.en || null;
}

export function designMetaForSlide(slideId) {
  return SLIDE_DESIGN_HINTS[slideId] || null;
}

export function iconForBullet(text) {
  for (const { re, icon } of BULLET_ICON_RULES) {
    if (re.test(text)) return icon;
  }
  return 'CircleDot';
}

export function gammaInstructionsForSlide(slide, locale) {
  const hint = hintForSlide(slide.id, locale);
  const base =
    locale === 'de'
      ? 'Valkeen executive slide: dark blue background, teal accents, icons, minimal text, one clear visual metaphor. No wall of bullets.'
      : 'Valkeen executive slide: dark blue, teal accents, icons, minimal text, one visual metaphor. No bullet walls.';
  return hint?.gammaExtra ? `${base}\n${hint.gammaExtra}` : base;
}
