import { jsPDF } from 'jspdf';
import {
  feedbackUi,
  INVITATION_QUESTIONS_I18N,
  LIVE_ONLY_QUESTION_I18N,
  MEETING_SECTIONS_I18N,
  SELF_ASSESSMENT_I18N,
  achievementLabel,
} from '../data/feedbackFrameworkI18n';
import {
  normalizeRampUpFeedback,
  participantNamesLabel,
} from './rampUpFeedback';
import { emptyParticipantNotes } from '../data/feedbackFrameworkDefaults';

const BRAND = { primary: [79, 70, 229], text: [40, 40, 40], muted: [100, 100, 100] };

function localeDate(dateStr, locale) {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString(locale === 'en' ? 'en-CH' : 'de-CH');
  } catch {
    return dateStr;
  }
}

function addWrapped(doc, text, x, y, maxW, lineH = 5) {
  const lines = doc.splitTextToSize(String(text || '—'), maxW);
  doc.text(lines, x, y);
  return y + lines.length * lineH;
}

function ensureSpace(doc, y, need, margin) {
  const pageH = doc.internal.pageSize.getHeight();
  if (y + need > pageH - margin) {
    doc.addPage();
    return margin;
  }
  return y;
}

function sectionHeading(doc, title, y, margin, maxW) {
  y = ensureSpace(doc, y, 14, margin);
  doc.setFont(undefined, 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...BRAND.primary);
  y = addWrapped(doc, title, margin, y, maxW, 6) + 2;
  doc.setFont(undefined, 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...BRAND.text);
  return y;
}

export function buildRampUpFeedbackPdf(data, locale = 'de') {
  const d = normalizeRampUpFeedback(data);
  const ui = (key) => feedbackUi(locale, key);
  const doc = new jsPDF({ unit: 'mm', format: 'a4', compress: true });
  const margin = 16;
  const pageW = doc.internal.pageSize.getWidth();
  const maxW = pageW - margin * 2;
  let y = margin;

  doc.setFillColor(...BRAND.primary);
  doc.rect(0, 0, pageW, 26, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(15);
  doc.text(d.meta.title || 'Ramp-Up Review', margin, 12);
  doc.setFontSize(9);
  doc.text('Valkeen Onboarding Hub · Feedback Framework', margin, 19);
  y = 34;
  doc.setTextColor(...BRAND.text);

  doc.setFontSize(10);
  y = addWrapped(
    doc,
    `${ui('mdWith')}: ${participantNamesLabel(d.participants)} · ${ui('mdPeriod')}: ${d.meta.periodLabel}`,
    margin,
    y,
    maxW
  );
  y += 2;
  if (d.meta.reviewDate) {
    y = addWrapped(doc, `${ui('mdDate')}: ${localeDate(d.meta.reviewDate, locale)}`, margin, y, maxW);
    y += 2;
  }
  if (d.meta.probationEnd) {
    y = addWrapped(
      doc,
      `${ui('pdfProbationEnd')}: ${localeDate(d.meta.probationEnd, locale)}`,
      margin,
      y,
      maxW
    );
    y += 4;
  }

  y = sectionHeading(doc, ui('mdOpening'), y, margin, maxW);
  y = addWrapped(doc, d.prep.openingLine, margin, y, maxW) + 4;

  y = sectionHeading(doc, ui('mdAchievements'), y, margin, maxW);
  const checked = [
    ...d.prep.achievements.filter((a) => a.checked),
    ...d.prep.customAchievements.filter((a) => a.checked && a.text?.trim()),
  ];
  if (checked.length) {
    for (const a of checked) {
      const label = a.id?.startsWith('custom')
        ? a.text
        : achievementLabel(locale, a.id, a.text);
      y = ensureSpace(doc, y, 8, margin);
      y = addWrapped(doc, `• ${label}`, margin, y, maxW) + 1;
    }
  } else {
    y = addWrapped(doc, ui('mdNoChecks'), margin, y, maxW) + 2;
  }
  y += 2;

  y = sectionHeading(doc, ui('mdSelfAssessment'), y, margin, maxW);
  for (const prompt of SELF_ASSESSMENT_I18N[locale] || SELF_ASSESSMENT_I18N.de) {
    const val = d.prep.selfAssessment[prompt.id];
    y = ensureSpace(doc, y, 10, margin);
    doc.setFont(undefined, 'bold');
    y = addWrapped(doc, prompt.label, margin, y, maxW, 5);
    doc.setFont(undefined, 'normal');
    y = addWrapped(doc, val || '—', margin, y, maxW) + 3;
  }

  const questions = INVITATION_QUESTIONS_I18N[locale] || INVITATION_QUESTIONS_I18N.de;
  y = sectionHeading(doc, ui('pdfQuestions'), y, margin, maxW);
  for (const block of questions) {
    y = ensureSpace(doc, y, 10, margin);
    doc.setFont(undefined, 'bold');
    y = addWrapped(doc, block.title, margin, y, maxW, 5);
    doc.setFont(undefined, 'normal');
    block.items.forEach((q, i) => {
      y = ensureSpace(doc, y, 8, margin);
      y = addWrapped(doc, `${i + 1}. ${q}`, margin + 2, y, maxW - 2) + 1;
    });
    y += 2;
  }
  y = ensureSpace(doc, y, 10, margin);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(180, 120, 0);
  y = addWrapped(doc, ui('pdfLiveOnly'), margin, y, maxW, 5);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(...BRAND.text);
  y = addWrapped(doc, LIVE_ONLY_QUESTION_I18N[locale], margin, y, maxW) + 2;
  if (d.prep.liveQuestionNotes?.trim()) {
    y = addWrapped(doc, d.prep.liveQuestionNotes, margin, y, maxW) + 4;
  }

  y = sectionHeading(doc, ui('mdMeetingNotes'), y, margin, maxW);
  const sections = MEETING_SECTIONS_I18N[locale] || MEETING_SECTIONS_I18N.de;
  let anyNotes = false;
  for (const person of d.participants) {
    const notes = d.meetingNotes.byParticipant[person.id] || emptyParticipantNotes();
    const hasContent = sections.some((s) => notes[s.id]?.trim());
    if (!hasContent) continue;
    anyNotes = true;
    y = ensureSpace(doc, y, 12, margin);
    doc.setFont(undefined, 'bold');
    y = addWrapped(
      doc,
      `${person.name}${person.role ? ` (${person.role})` : ''}`,
      margin,
      y,
      maxW,
      6
    );
    doc.setFont(undefined, 'normal');
    for (const section of sections) {
      const text = notes[section.id];
      if (!text?.trim()) continue;
      y = ensureSpace(doc, y, 10, margin);
      doc.setTextColor(...BRAND.muted);
      y = addWrapped(doc, section.title, margin + 2, y, maxW - 2, 4);
      doc.setTextColor(...BRAND.text);
      y = addWrapped(doc, text, margin + 2, y, maxW - 2) + 3;
    }
    y += 2;
  }
  if (!anyNotes) {
    y = addWrapped(doc, '—', margin, y, maxW) + 4;
  }

  y = sectionHeading(doc, ui('mdAfter'), y, margin, maxW);
  y = addWrapped(doc, d.after.summary || '—', margin, y, maxW) + 3;
  if (d.after.personalCommitments?.trim()) {
    y = ensureSpace(doc, y, 10, margin);
    doc.setFont(undefined, 'bold');
    y = addWrapped(doc, ui('mdCommitments'), margin, y, maxW, 5);
    doc.setFont(undefined, 'normal');
    y = addWrapped(doc, d.after.personalCommitments, margin, y, maxW) + 3;
  }
  if (d.after.nextReviewDate) {
    y = addWrapped(
      doc,
      `${ui('mdNextReview')}: ${localeDate(d.after.nextReviewDate, locale)}`,
      margin,
      y,
      maxW
    );
  }

  y = ensureSpace(doc, y, 10, margin);
  doc.setFontSize(8);
  doc.setTextColor(...BRAND.muted);
  doc.text(
    `${ui('pdfGenerated')}: ${new Date().toLocaleString(locale === 'en' ? 'en-CH' : 'de-CH')}`,
    margin,
    doc.internal.pageSize.getHeight() - 10
  );

  return doc;
}

export function downloadRampUpFeedbackPdf(data, locale = 'de') {
  const doc = buildRampUpFeedbackPdf(data, locale);
  const slug = (data?.meta?.title || 'RampUp_Review')
    .replace(/[^\w\-]+/g, '_')
    .slice(0, 40);
  doc.save(`${slug}_${locale}.pdf`);
}
