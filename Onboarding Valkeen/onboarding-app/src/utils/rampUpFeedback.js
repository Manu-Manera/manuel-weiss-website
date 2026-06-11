import {
  DEFAULT_ACHIEVEMENTS,
  DEFAULT_PARTICIPANTS,
  emptyParticipantNotes,
  OPENING_LINE_DEFAULT,
  REVIEW_META_DEFAULT,
} from '../data/feedbackFrameworkDefaults';
import {
  feedbackUi,
  MEETING_SECTIONS_I18N,
  SELF_ASSESSMENT_I18N,
} from '../data/feedbackFrameworkI18n';

function slugId(name, index = 0) {
  const base = String(name || 'person')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 24);
  return base ? `${base}-${index}` : `person-${Date.now()}`;
}

export function emptyRampUpFeedback() {
  const participants = DEFAULT_PARTICIPANTS.map((p) => ({ ...p }));
  const byParticipant = Object.fromEntries(
    participants.map((p) => [p.id, emptyParticipantNotes()])
  );
  return {
    meta: { ...REVIEW_META_DEFAULT },
    participants,
    prep: {
      openingLine: OPENING_LINE_DEFAULT,
      achievements: DEFAULT_ACHIEVEMENTS.map((a) => ({ ...a })),
      customAchievements: [],
      selfAssessment: {
        strengths: '',
        gaps: '',
        focus3m: '',
        impact115: '',
      },
      liveQuestionNotes: '',
    },
    meetingNotes: { byParticipant },
    after: {
      summary: '',
      nextReviewDate: '',
      personalCommitments: '',
    },
  };
}

function normalizeAchievements(raw) {
  const defaults = DEFAULT_ACHIEVEMENTS.map((a) => ({ ...a }));
  if (!Array.isArray(raw) || raw.length === 0) return defaults;
  const byId = Object.fromEntries(raw.filter((a) => a?.id).map((a) => [a.id, a]));
  return defaults.map((d) => ({
    ...d,
    checked: Boolean(byId[d.id]?.checked),
    text: typeof byId[d.id]?.text === 'string' && byId[d.id].text.trim() ? byId[d.id].text : d.text,
  }));
}

function normalizeCustomAchievements(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((item) => item && typeof item.text === 'string')
    .map((item, i) => ({
      id: item.id || `custom-${i}`,
      text: item.text,
      checked: Boolean(item.checked),
    }));
}

function normalizeParticipants(raw, legacyMeetingWith) {
  if (Array.isArray(raw) && raw.length > 0) {
    return raw
      .filter((p) => p && typeof p.name === 'string')
      .map((p, i) => ({
        id: p.id || slugId(p.name, i),
        name: p.name.trim() || 'Unbenannt',
        role: typeof p.role === 'string' ? p.role : '',
      }));
  }

  if (legacyMeetingWith && typeof legacyMeetingWith === 'string') {
    const name = legacyMeetingWith.trim();
    if (name) {
      return [{ id: 'marc', name, role: 'Manager' }];
    }
  }

  return DEFAULT_PARTICIPANTS.map((p) => ({ ...p }));
}

function migrateLegacyMeetingNotes(mn, participants) {
  const byParticipant = {};

  participants.forEach((p) => {
    byParticipant[p.id] = emptyParticipantNotes();
  });

  if (mn.byParticipant && typeof mn.byParticipant === 'object') {
    participants.forEach((p) => {
      const src = mn.byParticipant[p.id] || {};
      byParticipant[p.id] = {
        standort: src.standort ?? '',
        erwartungen: src.erwartungen ?? '',
        entwicklung: src.entwicklung ?? '',
        band: src.band ?? '',
        actions: src.actions ?? '',
      };
    });
    return byParticipant;
  }

  const legacyMarc = participants.find((p) => p.id === 'marc') || participants[0];
  if (legacyMarc) {
    byParticipant[legacyMarc.id] = {
      standort: mn.standortMarc ?? mn.standort ?? '',
      erwartungen: mn.erwartungenMarc ?? mn.erwartungen ?? '',
      entwicklung: mn.entwicklungMarc ?? mn.entwicklung ?? '',
      band: mn.bandMarc ?? mn.band ?? '',
      actions: mn.actions ?? '',
    };
  }

  return byParticipant;
}

export function primaryParticipant(data) {
  const list = data.participants || [];
  const id = data.meta?.primaryParticipantId;
  return list.find((p) => p.id === id) || list[0] || { id: '', name: '—', role: '' };
}

export function participantNamesLabel(participants) {
  if (!participants?.length) return '—';
  return participants.map((p) => p.name).join(', ');
}

export function normalizeRampUpFeedback(raw) {
  if (!raw || typeof raw !== 'object') return emptyRampUpFeedback();

  const prep = raw.prep || {};
  const sa = prep.selfAssessment || {};
  const after = raw.after || {};
  const meta = { ...REVIEW_META_DEFAULT, ...(raw.meta || {}) };
  const participants = normalizeParticipants(raw.participants, raw.meta?.meetingWith);

  if (!participants.some((p) => p.id === meta.primaryParticipantId)) {
    meta.primaryParticipantId = participants[0]?.id ?? '';
  }

  const byParticipant = migrateLegacyMeetingNotes(raw.meetingNotes || {}, participants);

  participants.forEach((p) => {
    if (!byParticipant[p.id]) byParticipant[p.id] = emptyParticipantNotes();
  });

  return {
    meta,
    participants,
    prep: {
      openingLine: prep.openingLine ?? OPENING_LINE_DEFAULT,
      achievements: normalizeAchievements(prep.achievements),
      customAchievements: normalizeCustomAchievements(prep.customAchievements),
      selfAssessment: {
        strengths: sa.strengths ?? '',
        gaps: sa.gaps ?? '',
        focus3m: sa.focus3m ?? '',
        impact115: sa.impact115 ?? '',
      },
      liveQuestionNotes: prep.liveQuestionNotes ?? '',
    },
    meetingNotes: { byParticipant },
    after: {
      summary: after.summary ?? '',
      nextReviewDate: after.nextReviewDate ?? '',
      personalCommitments: after.personalCommitments ?? '',
    },
  };
}

/** Markdown für Report / Copy */
export function rampUpFeedbackToMarkdown(data, locale = 'de') {
  const d = normalizeRampUpFeedback(data);
  const loc = locale === 'en' ? 'en' : 'de';
  const ui = (key) => feedbackUi(loc, key);
  const sections = MEETING_SECTIONS_I18N[loc] || MEETING_SECTIONS_I18N.de;
  const selfPrompts = SELF_ASSESSMENT_I18N[loc] || SELF_ASSESSMENT_I18N.de;
  const lines = [];
  lines.push(`# ${d.meta.title}`);
  lines.push(`**${ui('mdWith')}:** ${participantNamesLabel(d.participants)} · **${ui('mdPeriod')}:** ${d.meta.periodLabel}`);
  if (d.meta.reviewDate) lines.push(`**${ui('mdDate')}:** ${d.meta.reviewDate}`);
  lines.push('');
  lines.push(`## ${ui('mdOpening')}`);
  lines.push(d.prep.openingLine);
  lines.push('');
  lines.push(`## ${ui('mdAchievements')}`);
  const allAch = [
    ...d.prep.achievements.filter((a) => a.checked),
    ...d.prep.customAchievements.filter((a) => a.checked),
  ];
  if (allAch.length) allAch.forEach((a) => lines.push(`- [x] ${a.text}`));
  else lines.push(`_${ui('mdNoChecks')}_`);
  lines.push('');
  lines.push(`## ${ui('mdSelfAssessment')}`);
  selfPrompts.forEach((p) => {
    lines.push(`**${p.label}:** ${d.prep.selfAssessment[p.id] || '—'}`);
  });
  lines.push('');
  lines.push(`## ${ui('mdMeetingNotes')}`);

  d.participants.forEach((person) => {
    const notes = d.meetingNotes.byParticipant[person.id] || emptyParticipantNotes();
    const hasContent = sections.some((s) => notes[s.id]?.trim());
    if (!hasContent) return;
    lines.push('');
    lines.push(`### ${person.name}${person.role ? ` (${person.role})` : ''}`);
    sections.forEach((section) => {
      const text = notes[section.id];
      if (text?.trim()) {
        lines.push(`#### ${section.title}`);
        lines.push(text);
      }
    });
  });

  lines.push('');
  lines.push(`## ${ui('mdAfter')}`);
  lines.push(d.after.summary || '—');
  if (d.after.personalCommitments) {
    lines.push('');
    lines.push(`**${ui('mdCommitments')}:**`);
    lines.push(d.after.personalCommitments);
  }
  if (d.after.nextReviewDate) lines.push(`\n**${ui('mdNextReview')}:** ${d.after.nextReviewDate}`);
  return lines.join('\n');
}
