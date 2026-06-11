/**
 * Learning ↔ Projektplan: wissenschaftlich strukturierte Lernmodule pro Framework-Schritt.
 * Spaced practice (Touren), Retrieval (Checkpoints), Guided practice (Extension), Rollenbezug.
 */
import { tx } from './implementationTemplate';

/** Lernmodul-Typen im Plan-Task. */
export const LEARNING_MODULE_TYPES = {
  checkpoint: 'checkpoint',
  tour: 'tour',
  artifact: 'artifact',
  register: 'register',
};

/**
 * Blueprint je Framework-stepId — 1:1 mit implementationTemplate / Gantt-Tasks.
 * tourIds: erwartete Extension-Touren (training-admin)
 * roles: Register-Rollen (leer = alle Key-User)
 */
export const STEP_LEARNING_BLUEPRINT = {
  kickoff: {
    requiredForDone: false,
    modules: [
      { type: 'artifact', artifactId: 'kickoff' },
      {
        type: 'checkpoint',
        label: {
          de: 'Kick-off-Ziele & Scope im Team verstanden (Retrieval)',
          en: 'Kick-off goals & scope understood as a team (retrieval)',
        },
      },
    ],
  },
  discovery: {
    modules: [
      { type: 'artifact', artifactId: 'discovery' },
      {
        type: 'checkpoint',
        label: {
          de: 'Discovery-Fragebogen ausgefüllt & im Team reflektiert',
          en: 'Discovery questionnaire completed & reflected in team',
        },
      },
    ],
  },
  'env-logins': {
    modules: [
      {
        type: 'checkpoint',
        label: {
          de: 'DEV/PROD-Zugänge + Tempus-Login für Lern-Hub getestet',
          en: 'DEV/PROD access + Tempus login for learning hub verified',
        },
      },
      {
        type: 'checkpoint',
        label: {
          de: 'Extension installiert (guided practice in Tempus)',
          en: 'Extension installed (guided practice in Tempus)',
        },
      },
    ],
  },
  'key-users': {
    modules: [
      { type: 'artifact', artifactId: 'key-users' },
      {
        type: 'checkpoint',
        label: {
          de: 'Key-User im Register + Learning-Zugang vorbereitet',
          en: 'Key users in register + learning access prepared',
        },
      },
    ],
  },
  'current-future': {
    modules: [
      { type: 'artifact', artifactId: 'current-future' },
      { type: 'artifact', artifactId: 'change-workshop' },
    ],
  },
  'change-strategy': {
    modules: [
      { type: 'artifact', artifactId: 'change-strategy' },
      { type: 'artifact', artifactId: 'comms-plan' },
    ],
  },
  decisions: {
    modules: [
      { type: 'register', tab: 'decisions' },
      {
        type: 'checkpoint',
        label: {
          de: 'Entscheidungen im Team abgerufen (nicht nur gelesen)',
          en: 'Decisions retrieved in team (not just read)',
        },
      },
    ],
  },
  reporting: {
    modules: [
      {
        type: 'checkpoint',
        label: {
          de: 'Reporting je Rolle definiert + Demo in Tempus',
          en: 'Reporting per role defined + demo in Tempus',
        },
      },
    ],
  },
  sso: {
    modules: [
      { type: 'artifact', artifactId: 'sso' },
      {
        type: 'checkpoint',
        label: {
          de: 'SSO-Login erfolgreich getestet',
          en: 'SSO login successfully tested',
        },
      },
    ],
  },
  uat: {
    requiredForDone: true,
    roles: ['*'],
    modules: [
      { type: 'register', tab: 'uat' },
      {
        type: 'checkpoint',
        label: {
          de: 'UAT-Use-Cases live in Tempus geübt (70 % practice)',
          en: 'UAT use cases practiced live in Tempus (70% practice)',
        },
      },
      { type: 'tour', tourIds: ['tour_rm_basics'], roleHint: 'Resource Manager' },
    ],
  },
  'solution-design': {
    modules: [
      {
        type: 'checkpoint',
        label: {
          de: 'UAT-Feedback in Solution Design eingearbeitet',
          en: 'UAT feedback incorporated into solution design',
        },
      },
    ],
  },
  acceptance: {
    requiredForDone: true,
    modules: [
      {
        type: 'checkpoint',
        label: {
          de: 'Abnahme nach erfolgreicher UAT + Key-User-Sign-off',
          en: 'Sign-off after successful UAT + key user sign-off',
        },
      },
    ],
  },
  training: {
    requiredForDone: true,
    roles: ['*'],
    modules: [
      { type: 'artifact', artifactId: 'training' },
      { type: 'artifact', artifactId: 'tempus-trainer' },
      {
        type: 'checkpoint',
        label: {
          de: 'Train-the-Trainer durchgeführt',
          en: 'Train-the-trainer session completed',
        },
      },
      { type: 'tour', tourIds: ['tour_rm_basics'], roleHint: 'Resource Manager' },
      { type: 'tour', tourIds: [], roleHint: 'Project Manager', tag: 'PM' },
      { type: 'tour', tourIds: [], roleHint: 'Admin', tag: 'Admin' },
    ],
  },
  guides: {
    modules: [
      { type: 'artifact', artifactId: 'guides' },
      {
        type: 'checkpoint',
        label: {
          de: 'QRG/PDF pro Rolle verteilt + 1 Retrieval-Quiz',
          en: 'QRG/PDF per role distributed + 1 retrieval quiz',
        },
      },
    ],
  },
  'go-live': {
    requiredForDone: true,
    modules: [
      {
        type: 'checkpoint',
        label: {
          de: 'Go-Live-Readiness: Key-User ≥80 % Lernpfad',
          en: 'Go-live readiness: key users ≥80% learning path',
        },
      },
    ],
  },
  support: {
    modules: [
      { type: 'artifact', artifactId: 'feedback-framework' },
      {
        type: 'checkpoint',
        label: {
          de: 'Hypercare-Lernschleife (Feedback → Microlearning)',
          en: 'Hypercare learning loop (feedback → microlearning)',
        },
      },
    ],
  },
  optimize: {
    modules: [
      {
        type: 'checkpoint',
        label: {
          de: 'Ausbau-Use-Cases priorisiert + Lernpfad aktualisiert',
          en: 'Expansion use cases prioritized + learning path updated',
        },
      },
    ],
  },
};

function learningTodoId(stepId, idx) {
  return `learn-${stepId}-${idx}`;
}

export function learningBlueprint(stepId) {
  return STEP_LEARNING_BLUEPRINT[stepId] || null;
}

export function suggestTrainingCustomerId(session) {
  if (session?.trainingCustomerId) return session.trainingCustomerId;
  const slug = String(session?.customer || session?.sessionId || 'project')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48);
  return slug || 'demo';
}

/** Register-User für Rollenfilter (fuzzy). */
export function usersForLearningRoles(session, roles = []) {
  const users = (session?.users || []).filter((u) => u.email || u.name);
  if (!roles?.length || roles.includes('*')) return users;
  const needles = roles.map((r) => String(r).toLowerCase());
  return users.filter((u) => {
    const role = String(u.role || '').toLowerCase();
    return needles.some((n) => role.includes(n) || n.includes(role));
  });
}

function roleHintMatch(userRole, hint) {
  if (!hint) return true;
  const r = String(userRole || '').toLowerCase();
  const h = String(hint).toLowerCase();
  if (h.includes('resource') || h === 'rm') return r.includes('resource') || r.includes('rm');
  if (h.includes('project') || h === 'pm') return r.includes('project') || r.includes('pm');
  if (h.includes('admin')) return r.includes('admin');
  return r.includes(h) || h.includes(r);
}

/** Tour-Abschlussquote für erwartete Nutzer. */
export function tourTeamProgress(aggregate, tourIds, session, roleHint) {
  if (!tourIds?.length) return { pct: 0, done: 0, expected: 0, detail: 'no_tour_ids' };
  const users = usersForLearningRoles(session, roleHint ? [roleHint] : ['*']);
  const expected = users.length || 0;
  if (!expected) return { pct: 0, done: 0, expected: 0, detail: 'no_users' };

  const trainees = aggregate?.trainees || [];
  let done = 0;
  for (const u of users) {
    const emailKey = String(u.email || u.name || '').toLowerCase();
    const trainee = trainees.find(
      (t) =>
        t.userId === emailKey ||
        t.userId === u.email ||
        String(t.userId).toLowerCase() === emailKey
    );
    if (!trainee) continue;
    const completed = trainee.tours?.some(
      (tr) =>
        tourIds.includes(tr.tourId) &&
        (tr.status === 'completed' || tr.lastStatus === 'completed')
    );
    if (completed) done += 1;
  }
  return {
    pct: Math.round((done / expected) * 100),
    done,
    expected,
    detail: `${done}/${expected}`,
  };
}

function checkpointDone(task, moduleIndex) {
  const id = learningTodoId(task.stepId, moduleIndex);
  const td = (task.todos || []).find((t) => t.id === id || t.learningModuleIndex === moduleIndex);
  return td?.done;
}

export function moduleProgress(module, moduleIndex, task, session, aggregate, locale) {
  const type = module.type;
  if (type === 'checkpoint') {
    return checkpointDone(task, moduleIndex) ? 100 : 0;
  }
  if (type === 'tour') {
    const tp = tourTeamProgress(aggregate, module.tourIds || [], session, module.roleHint);
    return tp.pct;
  }
  if (type === 'artifact' || type === 'register') {
    const stepStatus = session?.stepStatus || {};
    if (task.stepId && stepStatus[task.stepId] === 'done') return 100;
    return 40;
  }
  return 0;
}

export function learningProgressPercent(task, session, aggregate, locale = 'de') {
  const bp = task.learning || learningBlueprint(task.stepId);
  if (!bp?.modules?.length) return 0;
  const parts = bp.modules.map((m, i) => moduleProgress(m, i, task, session, aggregate, locale));
  return Math.round(parts.reduce((a, b) => a + b, 0) / parts.length);
}

export function learningModuleStatuses(task, session, aggregate, locale = 'de') {
  const bp = task.learning || learningBlueprint(task.stepId);
  if (!bp?.modules?.length) return [];
  return bp.modules.map((m, i) => {
    const pct = moduleProgress(m, i, task, session, aggregate, locale);
    let label = '';
    if (m.type === 'checkpoint') label = tx(m.label, locale);
    else if (m.type === 'tour') {
      const tp = tourTeamProgress(aggregate, m.tourIds || [], session, m.roleHint);
      label =
        locale === 'en'
          ? `Tour ${m.roleHint || ''} (${tp.detail})`
          : `Tour ${m.roleHint || ''} (${tp.detail})`;
    } else if (m.type === 'artifact') label = m.artifactId;
    else if (m.type === 'register') label = `Register: ${m.tab}`;
    return { ...m, index: i, pct, label, done: pct >= 80 };
  });
}

export function syncLearningTodos(existingTodos, stepId, blueprint, locale) {
  if (!blueprint?.modules) return existingTodos || [];
  const todos = [...(existingTodos || [])];
  blueprint.modules.forEach((m, i) => {
    if (m.type !== 'checkpoint') return;
    const id = learningTodoId(stepId, i);
    const text = tx(m.label, locale);
    const found = todos.find((t) => t.id === id);
    if (found) {
      if (found.text !== text) found.text = text;
      found.learningModuleIndex = i;
    } else {
      todos.push({ id, text, done: false, learningModuleIndex: i });
    }
  });
  return todos;
}

export function ensureTaskLearning(task, locale = 'de') {
  if (!task?.stepId) return task;
  const blueprint = learningBlueprint(task.stepId);
  if (!blueprint) return task;
  const learning = { ...blueprint, ...(task.learning || {}) };
  const todos = syncLearningTodos(task.todos, task.stepId, blueprint, locale);
  return { ...task, learning, todos };
}

export function ensurePlanLearning(tasks, locale = 'de') {
  return (tasks || []).map((t) => ensureTaskLearning(t, locale));
}

export function combinedTaskProgress(task, session, aggregate, locale = 'de') {
  const todoPct =
    task.todos?.length
      ? Math.round((task.todos.filter((td) => td.done).length / task.todos.length) * 100)
      : task.status === 'done'
        ? 100
        : task.status === 'in_progress'
          ? 40
          : 0;

  const learnPct = learningProgressPercent(task, session, aggregate, locale);
  const hasLearning = (task.learning?.modules?.length || learningBlueprint(task.stepId)?.modules?.length) > 0;

  if (!hasLearning) {
    if (task.status === 'done') return 100;
    if (task.todos?.length) return todoPct;
    return task.status === 'in_progress' ? 40 : 0;
  }

  if (task.learning?.requiredForDone || learningBlueprint(task.stepId)?.requiredForDone) {
    return Math.round((todoPct + learnPct) / 2);
  }
  return Math.max(todoPct, learnPct);
}

export function planLearningSummary(tasks, session, aggregate, locale = 'de') {
  const withLearning = (tasks || []).filter((t) => learningBlueprint(t.stepId));
  const rows = withLearning.map((t) => ({
    taskId: t.id,
    stepId: t.stepId,
    title: t.title,
    start: t.start,
    end: t.end,
    progress: combinedTaskProgress(t, session, aggregate, locale),
    learning: learningProgressPercent(t, session, aggregate, locale),
    modules: learningModuleStatuses(t, session, aggregate, locale),
    required: t.learning?.requiredForDone || learningBlueprint(t.stepId)?.requiredForDone,
  }));
  const avg =
    rows.length
      ? Math.round(rows.reduce((a, r) => a + r.learning, 0) / rows.length)
      : 0;
  return { rows, averageLearningPct: avg, count: rows.length };
}
