import { jsPDF } from 'jspdf';
import { CHANGE_PHASES, CHANGE_WORKFLOW_META } from '../data/changeWorkflowData';

function addWrappedText(doc, text, x, y, maxW, lineHeight) {
  const body = (text || '').trim() || '—';
  const lines = doc.splitTextToSize(body, maxW);
  const pageH = doc.internal.pageSize.getHeight();
  let cy = y;
  for (let i = 0; i < lines.length; i++) {
    if (cy > pageH - 12) {
      doc.addPage();
      cy = 18;
    }
    doc.text(lines[i], x, cy);
    cy += lineHeight;
  }
  return cy;
}

function resolvePhases(phaseIds) {
  if (!phaseIds?.length) return [...CHANGE_PHASES];
  const set = new Set(phaseIds);
  return CHANGE_PHASES.filter((p) => set.has(p.id));
}

/**
 * @param {{
 *   notes: Record<string, string>,
 *   checks: Record<string, boolean>,
 *   sessionTitle?: string,
 *   phaseIds?: string[],
 *   followUpNotes?: string
 * }} data — optional phaseIds: nur diese Phasen (Reihenfolge wie in CHANGE_PHASES)
 */
export function buildChangeWorkshopPdf(data) {
  const { notes, checks, sessionTitle, phaseIds, followUpNotes } = data;
  const phases = resolvePhases(phaseIds);
  const isPartial = phaseIds?.length > 0 && phaseIds.length < CHANGE_PHASES.length;

  const doc = new jsPDF({ unit: 'mm', format: 'a4', compress: true });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 16;
  const maxW = pageW - margin * 2;
  const title = (sessionTitle || '').trim() || 'Change Workshop – Protokoll';
  let y = 18;

  doc.setFillColor(88, 28, 135);
  doc.rect(0, 0, pageW, 28, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text(title, margin, 18);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  let metaLine = `${CHANGE_WORKFLOW_META.title} · ${new Date().toLocaleString('de-CH')}`;
  if (isPartial && phases.length === 1) {
    metaLine += ` · Ausschnitt: ${phases[0].label}`;
  } else if (isPartial) {
    metaLine += ` · ${phases.length} Phasen`;
  }
  doc.text(metaLine, margin, 24);
  doc.setTextColor(30, 30, 35);
  y = 36;

  phases.forEach((phase, pi) => {
    if (y > 250) {
      doc.addPage();
      y = 18;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(88, 28, 135);
    doc.text(`${pi + 1}. ${phase.label}`, margin, y);
    y += 7;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 65);
    y = addWrappedText(
      doc,
      `Zeitrichtwert: ${phase.durationHint} · ${phase.hint}`,
      margin,
      y,
      maxW,
      4.2
    );
    y += 3;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('Ziele', margin, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    phase.goals.forEach((g) => {
      y = addWrappedText(doc, `• ${g}`, margin, y, maxW, 4.2);
      y += 1;
    });
    y += 2;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('Protokoll / Ergebnisse', margin, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    y = addWrappedText(doc, notes[phase.id] || '', margin, y, maxW, 4.5);
    y += 4;

    if (phase.facilitatorChecklist?.length) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('Moderation', margin, y);
      y += 5;
      doc.setFont('helvetica', 'normal');
      phase.facilitatorChecklist.forEach((item, idx) => {
        const key = `${phase.id}::${idx}`;
        const mark = checks[key] ? '[x]' : '[ ]';
        y = addWrappedText(doc, `${mark} ${item}`, margin, y, maxW, 4.2);
        y += 1;
      });
      y += 3;
    }

    doc.setDrawColor(230, 230, 235);
    doc.line(margin, y, pageW - margin, y);
    y += 6;
  });

  const follow = (followUpNotes || '').trim();
  if (follow) {
    if (y > 230) {
      doc.addPage();
      y = 18;
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(88, 28, 135);
    doc.text('Follow-up & Entscheide', margin, y);
    y += 8;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 65);
    y = addWrappedText(doc, follow, margin, y, maxW, 4.5);
    y += 6;
  }

  doc.setFontSize(8);
  doc.setTextColor(120, 120, 125);
  const foot = 'Valkeen Onboarding Hub · Erstellt aus dem Browser-Workshop.';
  addWrappedText(doc, foot, margin, y, maxW, 3.8);

  return doc;
}

function safeFileSlug(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48) || 'phase';
}

/**
 * @param {Parameters<typeof buildChangeWorkshopPdf>[0]} data
 */
export function downloadChangeWorkshopPdf(data) {
  const doc = buildChangeWorkshopPdf(data);
  const date = new Date().toISOString().slice(0, 10);
  const ids = data.phaseIds;
  let name = `change-workshop-protokoll-${date}`;
  if (ids?.length === 1) {
    name += `-${safeFileSlug(ids[0])}`;
  } else if (ids?.length) {
    name += `-${ids.length}-phasen`;
  }
  doc.save(`${name}.pdf`);
}

/** Öffnet die PDF als Blob-URL im neuen Tab (Vorschau). */
export function previewChangeWorkshopPdf(data) {
  const doc = buildChangeWorkshopPdf(data);
  const blob = doc.output('blob');
  const url = URL.createObjectURL(blob);
  const win = window.open(url, '_blank', 'noopener,noreferrer');
  if (!win) {
    URL.revokeObjectURL(url);
    return false;
  }
  // Objekt erst nach Minutes freigeben (Tab lädt noch), sonst verschwindet die Ansicht je nach Browser
  window.setTimeout(() => URL.revokeObjectURL(url), 300000);
  return true;
}
