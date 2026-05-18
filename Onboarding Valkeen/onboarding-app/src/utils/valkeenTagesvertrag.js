/** Datenschema für Valkeen Onboarding — separater Unterbaum progress.valkeenTagesvertrag (AWS: mawps-onboarding-progress). */

export function isoWeekString(d) {
  const date = new Date(d.getTime());
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + 4 - ((date.getDay() + 6) % 7));
  const isoYear = date.getFullYear();
  const week1 = new Date(isoYear, 0, 1);
  const week =
    1 +
    Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
  return `${isoYear}-W${String(week).padStart(2, '0')}`;
}

export function todayLocalISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function emptyDayPayload() {
  return {
    morning: { counts: ['', '', ''], notToday: ['', '', ''], oneThing: '' },
    reset: { doing: '', should: '', step: '' },
    evening: { done: '', jumped: '', triggered: '', reacted: '', easier: '' },
  };
}

export function emptyWeekPayload() {
  return { q1: '', q2: '', q3: '', q4: '', q5: '', q6: '' };
}

export function normalizeDayPayload(raw) {
  if (!raw || typeof raw !== 'object') return emptyDayPayload();
  const m = raw.morning || {};
  const r = raw.reset || {};
  const e = raw.evening || {};
  return {
    morning: {
      counts: [0, 1, 2].map((i) => (Array.isArray(m.counts) ? m.counts[i] : '') ?? ''),
      notToday: [0, 1, 2].map((i) => (Array.isArray(m.notToday) ? m.notToday[i] : '') ?? ''),
      oneThing: m.oneThing ?? '',
    },
    reset: { doing: r.doing ?? '', should: r.should ?? '', step: r.step ?? '' },
    evening: {
      done: e.done ?? '',
      jumped: e.jumped ?? '',
      triggered: e.triggered ?? '',
      reacted: e.reacted ?? '',
      easier: e.easier ?? '',
    },
  };
}

export function normalizeWeekPayload(raw) {
  if (!raw || typeof raw !== 'object') return emptyWeekPayload();
  return {
    q1: raw.q1 ?? '',
    q2: raw.q2 ?? '',
    q3: raw.q3 ?? '',
    q4: raw.q4 ?? '',
    q5: raw.q5 ?? '',
    q6: raw.q6 ?? '',
  };
}

export function emptyValkeenTagesvertragRoot() {
  return { days: {}, weeks: {} };
}
