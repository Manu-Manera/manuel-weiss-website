import { jsPDF } from 'jspdf';
import { deckToGammaInputText } from './kickoffStudioGamma';

const BRAND = { primary: [15, 76, 129], accent: [0, 168, 120] };

export function exportKickoffPdf(exportDeck, locale) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const margin = 18;
  const pageW = doc.internal.pageSize.getWidth();
  const maxW = pageW - margin * 2;
  let y = margin;
  const meta = exportDeck.meta || {};

  const addPageIfNeeded = (need = 12) => {
    if (y + need > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      y = margin;
    }
  };

  doc.setFillColor(...BRAND.primary);
  doc.rect(0, 0, pageW, 28, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.text(meta.title || 'Kick-off', margin, 14);
  doc.setFontSize(9);
  const sub = (meta.subtitle || '').split('\n')[0];
  doc.text(sub.slice(0, 90), margin, 22);
  y = 36;
  doc.setTextColor(40, 40, 40);

  for (const slide of exportDeck.slides || []) {
    addPageIfNeeded(20);
    doc.setFont(undefined, 'bold');
    doc.setFontSize(13);
    doc.setTextColor(...BRAND.primary);
    const headline = doc.splitTextToSize(slide.headline || slide.id, maxW);
    doc.text(headline, margin, y);
    y += headline.length * 6 + 2;
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    if (slide.subline) {
      const subl = doc.splitTextToSize(slide.subline, maxW);
      doc.text(subl, margin, y);
      y += subl.length * 5 + 2;
    }

    const bodyLines = slideBodyLines(slide);
    for (const line of bodyLines) {
      addPageIfNeeded(8);
      const wrapped = doc.splitTextToSize(line, maxW);
      doc.text(wrapped, margin, y);
      y += wrapped.length * 5 + 1;
    }
    y += 6;
    doc.setDrawColor(...BRAND.accent);
    doc.setLineWidth(0.3);
    doc.line(margin, y, pageW - margin, y);
    y += 8;
  }

  const closing = exportDeck.closing;
  if (closing) {
    addPageIfNeeded(24);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(...BRAND.accent);
    doc.text(closing.headline || '', margin, y);
    y += 8;
    doc.setFont(undefined, 'normal');
    doc.setTextColor(40, 40, 40);
    for (const b of closing.bullets || []) {
      const w = doc.splitTextToSize(`• ${b}`, maxW);
      doc.text(w, margin, y);
      y += w.length * 5 + 1;
    }
  }

  const customer = (meta.customer || 'customer').replace(/[^\w\-]+/g, '_').slice(0, 40);
  doc.save(`Tempus_Kickoff_${customer}_${locale}.pdf`);
}

function slideBodyLines(slide) {
  const lines = [];
  const layout = slide.layout;
  if (layout === 'content' || !layout) {
    for (const b of slide.bullets || []) lines.push(`• ${b}`);
  }
  if (layout === 'capture' && slide.rows) {
    const h = slide.headers || [];
    if (h.length) lines.push(h.join(' | '));
    for (const row of slide.rows) {
      if (row.some((c) => String(c).trim())) lines.push(row.join(' | '));
    }
  }
  if (layout === 'workshop_qa') {
    for (const q of slide.questions || []) {
      const a = q.answer ?? '';
      lines.push(`${q.q}${a ? `: ${a}` : ''}`);
    }
  }
  if (layout === 'decisions') {
    for (const o of slide.options || []) {
      const mark = slide.selected_decision === o.id ? '[x] ' : '[ ] ';
      lines.push(`${mark}${o.label}`);
    }
  }
  if (layout === 'checklist') {
    const st = slide.items_status || [];
    (slide.items || []).forEach((item, i) => {
      lines.push(`${item}: ${st[i] || '—'}`);
    });
  }
  return lines;
}

/** Plain-text fallback (clipboard) */
export function exportKickoffMarkdown(exportDeck, locale) {
  return deckToGammaInputText(exportDeck, locale);
}
