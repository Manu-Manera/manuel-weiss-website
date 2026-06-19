/** Client-side Gamma input text (server uses same logic in Lambda). */

import { gammaInstructionsForSlide } from './kickoffSlideDesignHints';

function slideToGammaCard(slide) {
  const layout = slide.layout || 'content';
  const lines = [`# ${slide.headline}`];
  const sub = (slide.subline || '').trim();
  if (sub) lines.push(sub);

  if (layout === 'capture' && slide.rows?.length) {
    const headers = slide.headers || [];
    if (headers.length) {
      lines.push('| ' + headers.join(' | ') + ' |');
      for (const row of slide.rows) {
        lines.push('| ' + row.map((c) => String(c ?? '')).join(' | ') + ' |');
      }
    }
  } else if (layout === 'workshop_qa' && slide.questions?.length) {
    for (const q of slide.questions) {
      const a = q.answer ?? '';
      lines.push(`- **${q.q}**${a ? `: ${a}` : ''}`);
    }
  } else if (layout === 'decisions' && slide.options?.length) {
    const sel = slide.selected_decision;
    for (const o of slide.options) {
      const mark = sel === o.id ? '✓ ' : '';
      lines.push(`- ${mark}${o.label}${o.note ? ` (${o.note})` : ''}`);
    }
  } else if (layout === 'checklist' && slide.items?.length) {
    const st = slide.items_status || [];
    slide.items.forEach((item, i) => {
      const status = st[i] ? ` [${st[i]}]` : '';
      lines.push(`- ${item}${status}`);
    });
  } else {
    for (const b of slide.bullets || []) lines.push(`- ${b}`);
  }
  return lines.join('\n');
}

/** Einzelne Folie als Gamma-Brief (manuell einfügen oder 1-Karten-API) */
export function slideToGammaBrief(slide, locale, customer = '') {
  const isDe = locale === 'de';
  const card = slideToGammaCard(slide);
  const extra = gammaInstructionsForSlide(slide, locale);
  return [
    isDe
      ? 'Erstelle EINE professionelle Präsentationsfolie (Valkeen Kick-off):\n\n'
      : 'Create ONE professional presentation slide (Valkeen kick-off):\n\n',
    customer ? `${isDe ? 'Kunde' : 'Customer'}: ${customer}\n\n` : '',
    card,
    '\n\n---\n\n',
    isDe ? 'Design-Anweisung:\n' : 'Design instruction:\n',
    extra,
  ].join('');
}

export function deckToGammaInputText(exportDeck, locale) {
  const meta = exportDeck.meta || {};
  const isDe = locale === 'de';
  const parts = [];
  parts.push(
    isDe
      ? 'Erstelle eine professionelle Management-Präsentation aus dem Kick-off-Workshop:\n\n'
      : 'Create a professional management presentation from this kick-off workshop:\n\n'
  );
  parts.push(
    `${isDe ? 'Titel' : 'Title'}: ${meta.gamma_title || meta.title}\n` +
      `${isDe ? 'Untertitel' : 'Subtitle'}: ${(meta.subtitle || '').replace(/\n/g, ' · ')}\n\n` +
      `${isDe ? 'Zielgruppe' : 'Audience'}: ${meta.gamma_audience || ''}\n\n` +
      (isDe
        ? 'Stil: Valkeen Consulting — Blau #0f4c81 / Türkis #00a878, Executive-Level, Workshop-Ergebnisse sichtbar.\n'
        : 'Style: Valkeen Consulting — blue #0f4c81 / teal #00a878, executive level, workshop outcomes visible.\n')
  );
  for (const slide of exportDeck.slides || []) {
    parts.push(slideToGammaCard(slide));
  }
  const closing = exportDeck.closing;
  if (closing) {
    const cl = [`# ${closing.headline}`];
    if (closing.subline) cl.push(closing.subline);
    for (const b of closing.bullets || []) cl.push(`- ${b}`);
    parts.push(cl.join('\n'));
  }
  return parts.join('\n---\n\n');
}
