/**
 * Projektplan-Datenmodell + Standard-Seed (aus dem Implementation-Framework).
 *
 * task = {
 *   id, phaseId, title, owner,
 *   status: 'open' | 'in_progress' | 'done',
 *   start: 'YYYY-MM-DD', end: 'YYYY-MM-DD',
 *   milestone: bool,
 *   todos: [{ id, text, done }],
 *   notes
 * }
 */
import { IMPL_PHASES, tx } from './implementationTemplate';

export const PLAN_STATUSES = ['open', 'in_progress', 'done'];
export const PLAN_STATUS_LABEL = {
  de: { open: 'Offen', in_progress: 'In Arbeit', done: 'Erledigt' },
  en: { open: 'Open', in_progress: 'In progress', done: 'Done' },
};

/** Dauer (Tage) je Standard-Schritt — Meilensteine = 0. */
const STEP_DURATION = {
  kickoff: 2,
  discovery: 5,
  'env-logins': 3,
  'key-users': 5,
  'migration-data': 10,
  'current-future': 7,
  'change-strategy': 7,
  decisions: 14,
  reporting: 7,
  sso: 3,
  uat: 7,
  'solution-design': 5,
  acceptance: 0,
  training: 5,
  guides: 5,
  'go-live': 0,
  support: 10,
  optimize: 10,
};

function pad(n) {
  return String(n).padStart(2, '0');
}
export function toISO(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
export function parseISO(s) {
  const [y, m, d] = String(s || '').split('-').map(Number);
  return new Date(y || 1970, (m || 1) - 1, d || 1);
}
export function addDays(d, n) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}
export function dayDiff(a, b) {
  return Math.round((parseISO(b) - parseISO(a)) / 86400000);
}

function uid(prefix = 't') {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Standard-Plan aus den Phasen/Schritten ableiten (sequentiell + Abhängigkeiten). */
export function buildDefaultPlan(startDateISO, locale = 'de') {
  const start = startDateISO ? parseISO(startDateISO) : new Date();
  let cursor = new Date(start);
  const tasks = [];
  const phaseLastStepId = {};
  let prevStepId = null;

  for (const phase of IMPL_PHASES) {
    phase.steps.forEach((step, stepIdx) => {
      const dur = STEP_DURATION[step.id] ?? 5;
      const milestone = step.kind === 'milestone' || dur === 0;
      const s = new Date(cursor);
      const e = milestone ? new Date(cursor) : addDays(cursor, Math.max(1, dur) - 1);

      const dependsOn = [];
      if (prevStepId) dependsOn.push(prevStepId);
      if (stepIdx === 0) {
        for (const depPh of PHASE_DEPENDENCIES[phase.id] || []) {
          const last = phaseLastStepId[depPh];
          if (last && !dependsOn.includes(last)) dependsOn.push(last);
        }
      }

      tasks.push({
        id: uid(),
        stepId: step.id,
        phaseId: phase.id,
        title: tx(step.title, locale),
        owner: step.owner || '',
        status: 'open',
        start: toISO(s),
        end: toISO(e),
        milestone,
        dependsOn,
        todos: [],
        notes: '',
      });

      prevStepId = step.id;
      phaseLastStepId[phase.id] = step.id;
      cursor = addDays(e, milestone ? 1 : 2);
    });
  }
  return tasks;
}

export function newTask(phaseId, startISO) {
  const s = startISO ? parseISO(startISO) : new Date();
  return {
    id: uid(),
    phaseId,
    title: '',
    owner: '',
    status: 'open',
    start: toISO(s),
    end: toISO(addDays(s, 4)),
    milestone: false,
    dependsOn: [],
    todos: [],
    notes: '',
  };
}

/** Alle Step-IDs für Abhängigkeits-Auswahl im Editor. */
export function allStepIdsForDeps(tasks) {
  return (tasks || [])
    .filter((t) => t.stepId)
    .map((t) => ({ stepId: t.stepId, title: t.title, phaseId: t.phaseId }));
}

export function planBounds(tasks) {
  if (!tasks?.length) {
    const today = new Date();
    return { min: addDays(today, -7), max: addDays(today, 30) };
  }
  let min = parseISO(tasks[0].start);
  let max = parseISO(tasks[0].end);
  for (const t of tasks) {
    const s = parseISO(t.start);
    const e = parseISO(t.end);
    if (s < min) min = s;
    if (e > max) max = e;
  }
  return { min: addDays(min, -3), max: addDays(max, 5) };
}

export function taskProgress(task) {
  if (task.status === 'done') return 100;
  if (task.todos?.length) {
    const done = task.todos.filter((td) => td.done).length;
    return Math.round((done / task.todos.length) * 100);
  }
  return task.status === 'in_progress' ? 40 : 0;
}

export function phaseTitle(phaseId, locale) {
  const ph = IMPL_PHASES.find((p) => p.id === phaseId);
  return ph ? tx(ph.title, locale) : phaseId;
}

export const PHASE_ORDER = IMPL_PHASES.map((p) => p.id);

/** Phasen-Abhängigkeiten (Vorgänger-Phasen müssen abgeschlossen sein). */
export const PHASE_DEPENDENCIES = {
  onboarding: [],
  analysis: ['onboarding'],
  build: ['analysis'],
  enablement: ['build'],
  hypercare: ['enablement'],
};

export function phaseDepsMet(phaseId, tasks) {
  const deps = PHASE_DEPENDENCIES[phaseId] || [];
  return deps.every((depPh) => {
    const depTasks = (tasks || []).filter((t) => t.phaseId === depPh);
    if (!depTasks.length) return true;
    return depTasks.every((t) => t.status === 'done');
  });
}

export function taskDependenciesMet(task, tasks) {
  const deps = task.dependsOn || [];
  if (!deps.length) return true;
  return deps.every((depStepId) => {
    const depTask = (tasks || []).find((t) => t.stepId === depStepId);
    return depTask?.status === 'done';
  });
}

export function isTaskBlocked(task, tasks) {
  if (!task || task.status === 'done') return false;
  return !taskDependenciesMet(task, tasks);
}

export function resolveKickoffDate(session, tasks) {
  if (session?.kickoffDate) return session.kickoffDate;
  const kickoffTask = (tasks || []).find((t) => t.stepId === 'kickoff');
  if (kickoffTask?.start) return kickoffTask.start;
  const meetings = session?.meetings || [];
  const kickoffM = meetings.find((m) => m.type === 'kickoff' && m.date);
  return kickoffM?.date || '';
}

export function resolveGoLiveDate(session, tasks) {
  if (session?.goLiveDate) return session.goLiveDate;
  const golive = (tasks || []).find((t) => t.stepId === 'go-live');
  return golive?.end || golive?.start || '';
}

export function openTodosFromPlan(tasks, limit = 8) {
  const out = [];
  for (const t of tasks || []) {
    if (t.status === 'done') continue;
    for (const td of t.todos || []) {
      if (!td.done && td.text?.trim()) {
        out.push({
          id: td.id,
          text: td.text,
          due: t.end,
          owner: t.owner,
          taskTitle: t.title,
          priority: t.milestone ? 2 : 1,
        });
      }
    }
    if (!t.milestone && t.status !== 'done' && !t.todos?.length && t.title) {
      out.push({
        id: t.id,
        text: t.title,
        due: t.end,
        owner: t.owner,
        taskTitle: t.title,
        priority: 0,
      });
    }
  }
  out.sort((a, b) => {
    const da = a.due || '9999';
    const db = b.due || '9999';
    if (da !== db) return da.localeCompare(db);
    return b.priority - a.priority;
  });
  return out.slice(0, limit);
}

export function milestonesFromPlan(tasks) {
  return [...(tasks || [])]
    .filter((t) => t.milestone)
    .sort((a, b) => (a.end || a.start || '').localeCompare(b.end || b.start || ''));
}

export function phaseStats(tasks, phaseId) {
  const phaseTasks = (tasks || []).filter((t) => t.phaseId === phaseId);
  const done = phaseTasks.filter((t) => t.status === 'done').length;
  const blocked = phaseTasks.filter((t) => isTaskBlocked(t, tasks)).length;
  const progress = phaseTasks.length ? Math.round((done / phaseTasks.length) * 100) : 0;
  return { total: phaseTasks.length, done, blocked, progress };
}
