/**
 * Persönlicher Learning-Zugang: verbindet Register-User mit Training-Logins
 * und baut den persönlichen Learning-Hub-Link.
 */
import { learningBlueprint, learningModuleStatuses } from './implementationPlanLearning';

export function sanitizeLearningEmail(email) {
  return String(email || '')
    .toLowerCase()
    .replace(/[^a-z0-9._@-]/g, '_')
    .slice(0, 120);
}

/** Register-Rolle → Tempus-Trainer Rolle (alle Team-Mitglieder lernen als trainee). */
export function trainingRoleForUser() {
  return 'trainee';
}

/**
 * Persönlichen Learning-Hub-Link bauen.
 * Token wird (optional) als Bootstrap mitgegeben und im Hub in localStorage übernommen.
 */
export function buildLearnHubHref({
  origin,
  sessionId,
  customerId,
  userId,
  token,
  portalMode = false,
  basePath,
}) {
  const root = origin || (typeof window !== 'undefined' ? window.location.origin : '');
  const base = basePath != null ? basePath : '/onboarding';
  const p = new URLSearchParams();
  if (sessionId) p.set('s', sessionId);
  if (customerId) p.set('cid', customerId);
  if (userId) p.set('u', userId);
  if (token) p.set('lt', token);
  if (portalMode) p.set('portal', '1');
  const qs = p.toString();
  return `${root}${base}/learn${qs ? `?${qs}` : ''}`;
}

function userMatchesRole(userRole, blueprintRoles) {
  if (!blueprintRoles?.length) return true;
  if (blueprintRoles.includes('*')) return true;
  const r = String(userRole || '').toLowerCase();
  return blueprintRoles.some((br) => {
    const b = String(br).toLowerCase();
    return r.includes(b) || b.includes(r);
  });
}

/** Tour aus persönlichem Progress abgeschlossen? */
export function userTourDone(progress, tourIds) {
  if (!tourIds?.length) return false;
  const tours = progress?.tours || {};
  return tourIds.some((tid) => {
    const t = tours[tid];
    return t && (t.status === 'completed' || t.lastStatus === 'completed');
  });
}

/**
 * Persönliche Lern-Items aus dem Projektplan für genau einen User.
 * Liefert pro relevantem Plan-Task die für diese Person geltenden Module.
 */
export function personalPlanItems(session, user, progress, locale = 'de') {
  const tasks = session?.projectPlan || [];
  const userRole = user?.role || '';
  const items = [];

  for (const task of tasks) {
    const bp = task.learning || learningBlueprint(task.stepId);
    if (!bp?.modules?.length) continue;

    if (!userMatchesRole(userRole, bp.roles)) {
      const anyTourForRole = bp.modules.some(
        (m) => m.type === 'tour' && m.roleHint && userMatchesRole(userRole, [m.roleHint])
      );
      if (!anyTourForRole && bp.roles && !bp.roles.includes('*')) {
        continue;
      }
    }

    const modules = bp.modules
      .map((m, index) => {
        if (m.type === 'tour') {
          if (m.roleHint && !userMatchesRole(userRole, [m.roleHint])) return null;
          return {
            index,
            type: 'tour',
            tourIds: m.tourIds || [],
            roleHint: m.roleHint || '',
            done: userTourDone(progress, m.tourIds || []),
          };
        }
        if (m.type === 'checkpoint') {
          const todo = (task.todos || []).find(
            (t) => t.learningModuleIndex === index || t.id === `learn-${task.stepId}-${index}`
          );
          return {
            index,
            type: 'checkpoint',
            label: m.label,
            done: !!todo?.done,
          };
        }
        if (m.type === 'artifact') {
          return { index, type: 'artifact', artifactId: m.artifactId, done: false };
        }
        return null;
      })
      .filter(Boolean);

    if (!modules.length) continue;

    const done = modules.filter((m) => m.done).length;
    items.push({
      taskId: task.id,
      stepId: task.stepId,
      title: task.title,
      start: task.start,
      end: task.end,
      required: bp.requiredForDone,
      modules,
      progress: Math.round((done / modules.length) * 100),
    });
  }

  return items;
}

/** Aggregierter persönlicher Lernfortschritt (0–100). */
export function personalLearningProgress(items) {
  if (!items?.length) return 0;
  const sum = items.reduce((a, it) => a + it.progress, 0);
  return Math.round(sum / items.length);
}

/** „Heute fällig": offene Module von Tasks, deren Fenster bald/aktiv ist. */
export function dueLearningItems(items, todayISO) {
  const today = todayISO || new Date().toISOString().slice(0, 10);
  return items
    .filter((it) => it.progress < 100)
    .map((it) => ({
      ...it,
      overdue: it.end && it.end < today,
      active: (!it.start || it.start <= today) && (!it.end || it.end >= today),
    }))
    .sort((a, b) => {
      if (a.overdue !== b.overdue) return a.overdue ? -1 : 1;
      if (a.active !== b.active) return a.active ? -1 : 1;
      return (a.end || '9999').localeCompare(b.end || '9999');
    });
}

export { learningModuleStatuses };
