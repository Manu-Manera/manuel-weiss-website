/**
 * Valkeen 2026 Master → Gamma API (Design aus PPTX + Kick-off Studio Tokens).
 * Quelle: "Tempus Resource for XXX (Valkeen 2026).pptx" — 121 Folien.
 */

import masterManifest from '../data/valkeen-2026-master-manifest.json';
import { deckToGammaInputText } from './kickoffStudioGamma';

export const VALKEEN_GAMMA_BRAND = {
  name: 'Valkeen Consulting · Tempus Resource 2026',
  colors: {
    primary: '#0f4c81',
    primaryLight: '#1a6bb3',
    accent: '#00a878',
    teal: '#0ea5e9',
    slate: '#335B74',
    pptxAccentCyan: '#1CADE4',
    pptxAccentGreen: '#42BA97',
    text: '#1e293b',
    textMuted: '#64748b',
    highlight: '#7dffd4',
  },
  fonts: 'Inter or Calibri Light for titles, Calibri/Inter for body',
  logoUrl: 'https://manuel-weiss.ch/onboarding/kickoff/image1.png',
  masterPptxPath: '/onboarding/kickoff/valkeen-2026-master.pptx',
};

export function valkeenGammaAdditionalInstructions(locale = 'de', customer = '') {
  const b = VALKEEN_GAMMA_BRAND;
  const isDe = locale === 'de';
  const cust = customer?.trim() ? ` Kunde: ${customer.trim()}.` : '';
  return [
    isDe
      ? 'Valkeen 2026 Master-Template — exakt dieses Corporate Design beibehalten:'
      : 'Valkeen 2026 master template — keep this exact corporate design:',
    `Primär ${b.colors.primary}, Akzent ${b.colors.accent}, Türkis ${b.colors.teal}, Slate ${b.colors.slate}.`,
    isDe
      ? 'Dunkler Executive-Hintergrund oder Navy-Gradient wie Valkeen-Decks; dezenter grüner Akzent-Streifen links.'
      : 'Dark executive background or navy gradient like Valkeen decks; subtle green accent bar on the left.',
    isDe
      ? 'Logo Valkeen oben links auf jeder Folie (klein). Footer: „Valkeen GmbH · Tempus Resource“.'
      : 'Valkeen logo top-left on each slide (small). Footer: “Valkeen GmbH · Tempus Resource”.',
    isDe
      ? 'Wenig Text pro Karte, starke Überschriften, Icons/Diagramme statt Bullet-Wände; Workshop-Folien mit klar markierten Erfassungsfeldern.'
      : 'Minimal text per card, strong headlines, icons/diagrams not bullet walls; workshop slides with clear capture areas.',
    isDe
      ? 'Produkt-Screenshots und Architektur-Diagramme wo im Inhalt vorgesehen — professionell, nicht stock-heavy.'
      : 'Product screenshots and architecture diagrams where content implies — professional, not stock-heavy.',
    cust,
  ].join('\n');
}

function slideBlockFromManifest(slide, locale) {
  const lines = [`# ${slide.headline || `Slide ${slide.index}`}`];
  const rest = (slide.lines || []).filter(
    (l) => l !== slide.headline && l.length > 1 && !l.startsWith('©')
  );
  for (const line of rest.slice(0, 10)) {
    lines.push(`- ${line}`);
  }
  return lines.join('\n');
}

/** Vollständiger Master (121 Folien) als Gamma inputText mit --- zwischen Karten */
export function valkeenMasterToGammaInputText(locale = 'de', customer = '', slideFilter = null) {
  const isDe = locale === 'de';
  const slides = masterManifest.slides || [];
  const filtered = slideFilter
    ? slides.filter((s) => slideFilter(s))
    : slides;

  const parts = [
    isDe
      ? 'Erstelle eine Präsentation im exakten Valkeen-2026-Master-Stil (Tempus Resource). Jede folgende Sektion = eine Folie. Struktur und Reihenfolge beibehalten.\n'
      : 'Create a presentation in the exact Valkeen 2026 master style (Tempus Resource). Each section below = one slide. Keep structure and order.\n',
    customer
      ? `${isDe ? 'Kunde' : 'Customer'}: ${customer}\n`
      : `${isDe ? 'Platzhalter Kunde' : 'Customer placeholder'}: {{customer}}\n`,
    valkeenGammaAdditionalInstructions(locale, customer),
    '',
  ];

  for (const slide of filtered) {
    parts.push(slideBlockFromManifest(slide, locale));
  }

  return parts.join('\n---\n\n');
}

/** Kick-off Workshop-Deck + Valkeen Master-Stil kombinieren */
export function kickoffDeckWithValkeenStyle(exportDeck, locale = 'de') {
  const base = deckToGammaInputText(exportDeck, locale);
  return [
    base,
    '\n---\n\n',
    valkeenGammaAdditionalInstructions(locale, exportDeck.meta?.customer || ''),
  ].join('');
}

/** API-Body für POST /v1.0/generations */
export function buildValkeenMasterGammaRequest({
  inputText,
  locale = 'de',
  customer = '',
  themeId,
  numCards,
  title,
}) {
  const cardCount = numCards ?? (inputText.match(/\n---\n/g) || []).length + 1;
  const body = {
    inputText,
    textMode: 'preserve',
    format: 'presentation',
    cardSplit: 'inputTextBreaks',
    title:
      title ||
      (locale === 'de'
        ? `Tempus Resource · ${customer || 'Kick-off'} (Valkeen 2026)`
        : `Tempus Resource · ${customer || 'Kick-off'} (Valkeen 2026)`),
    additionalInstructions: valkeenGammaAdditionalInstructions(locale, customer),
    numCards: cardCount,
    textOptions: {
      amount: 'medium',
      language: locale === 'de' ? 'de' : 'en',
      tone: locale === 'de' ? 'professionell, klar, Workshop-facilitator' : 'professional, clear, workshop facilitator',
      audience: locale === 'de' ? 'IT- und Fachentscheider Implementierung' : 'IT and business implementation stakeholders',
    },
    imageOptions: {
      source: 'themeAccent',
      style:
        'Valkeen corporate, clean diagrams, navy and teal, minimal stock photos, enterprise software',
    },
    cardOptions: {
      dimensions: '16x9',
      headerFooter: {
        topLeft: { type: 'image', source: 'custom', src: VALKEEN_GAMMA_BRAND.logoUrl, size: 'sm' },
        bottomRight: {
          type: 'text',
          value: 'Valkeen GmbH · Tempus Resource',
        },
        hideFromFirstCard: false,
      },
    },
  };
  if (themeId) body.themeId = themeId;
  return body;
}

/** Modul-Abschnitt aus Master (Folien ~60–74) für Kurz-Export */
export function valkeenModuleSectionGammaInput(locale = 'de', customer = '') {
  return valkeenMasterToGammaInputText(
    locale,
    customer,
    (s) => s.index >= 51 && s.index <= 74
  );
}

export { masterManifest };
