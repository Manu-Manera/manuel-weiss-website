/**
 * Meetings/Weeklys, Action Items und Decision-Log fürs Implementation Framework.
 * Wird als session.meetings[] und session.decisions[] gespeichert.
 */
import { STANDARD_DECISIONS } from './implementationTemplate';

export const MEETING_TYPES = ['weekly', 'kickoff', 'workshop', 'steering', 'adhoc'];
export const MEETING_TYPE_LABEL = {
  de: {
    weekly: 'Weekly',
    kickoff: 'Kick-off',
    workshop: 'Workshop',
    steering: 'Steering',
    adhoc: 'Ad-hoc',
  },
  en: {
    weekly: 'Weekly',
    kickoff: 'Kick-off',
    workshop: 'Workshop',
    steering: 'Steering',
    adhoc: 'Ad-hoc',
  },
};

export const DECISION_STATUSES = ['open', 'decided', 'parked'];
export const DECISION_STATUS_LABEL = {
  de: { open: 'Offen', decided: 'Entschieden', parked: 'Geparkt' },
  en: { open: 'Open', decided: 'Decided', parked: 'Parked' },
};

function uid(p = 'x') {
  return `${p}-${Math.random().toString(36).slice(2, 8)}`;
}

function pad(n) {
  return String(n).padStart(2, '0');
}
export function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function newMeeting(type = 'weekly') {
  return {
    id: uid('m'),
    date: todayISO(),
    type,
    title: '',
    attendees: '',
    agenda: '',
    notes: '',
    actions: [],
  };
}

export function newAction() {
  return { id: uid('a'), text: '', owner: '', due: '', done: false };
}

export function newDecision(title = '') {
  return {
    id: uid('d'),
    title,
    status: 'open',
    relevant: '',
    decision: '',
    owner: '',
    date: '',
  };
}

/** 22 Standard-Projektentscheidungen als Seed. */
export function buildStandardDecisions() {
  return STANDARD_DECISIONS.map((title, i) => ({
    id: uid('d'),
    nr: i + 1,
    title,
    status: 'open',
    relevant: '',
    decision: '',
    owner: '',
    date: '',
  }));
}

/** Alle offenen Action Items über alle Meetings (für Roll-up). */
export function openActionItems(meetings) {
  const out = [];
  for (const m of meetings || []) {
    for (const a of m.actions || []) {
      if (!a.done) out.push({ ...a, meetingId: m.id, meetingTitle: m.title, meetingDate: m.date });
    }
  }
  out.sort((x, y) => (x.due || '9999').localeCompare(y.due || '9999'));
  return out;
}

export function sortMeetings(meetings) {
  return [...(meetings || [])].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
}
