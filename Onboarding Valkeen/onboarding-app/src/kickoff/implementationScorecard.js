/**
 * Projekt-Scorecard: Ampel, Phasen, Meilensteine, Top-To-dos, Risiken, Timeline.
 */
import { IMPL_PHASES, tx } from './implementationTemplate';
import { openActionItems } from './implementationLog';
import { riskScore } from './implementationRegisters';
import {
  buildDefaultPlan,
  dayDiff,
  isTaskBlocked,
  milestonesFromPlan,
  openTodosFromPlan,
  parseISO,
  phaseDepsMet,
  phaseStats,
  phaseTitle,
  resolveGoLiveDate,
  resolveKickoffDate,
  toISO,
} from './implementationPlan';

export const AMPEL_LABEL = {
  de: { green: 'Im Plan', yellow: 'Achtung', red: 'Kritisch' },
  en: { green: 'On track', yellow: 'Attention', red: 'Critical' },
};

function todayISO() {
  return toISO(new Date());
}

export function buildScorecard(session, locale = 'de') {
  const loc = locale === 'en' ? 'en' : 'de';
  const tasks =
    session?.projectPlan?.length
      ? session.projectPlan
      : buildDefaultPlan(resolveKickoffDate(session, []) || todayISO(), loc);

  const kickoffDate = resolveKickoffDate(session, tasks);
  const goLiveDate = resolveGoLiveDate(session, tasks);
  const today = todayISO();

  const daysSinceKickoff = kickoffDate ? dayDiff(kickoffDate, today) : null;
  const daysToGoLive = goLiveDate ? dayDiff(today, goLiveDate) : null;

  const risks = (session?.risks || []).filter((r) => r.status === 'open');
  const hotRisks = [...risks].sort((a, b) => riskScore(b) - riskScore(a)).slice(0, 6);

  const milestones = milestonesFromPlan(tasks).map((m) => ({
    id: m.id,
    title: m.title,
    date: m.end || m.start,
    status: m.status,
    done: m.status === 'done',
    overdue: m.status !== 'done' && (m.end || m.start) < today,
  }));

  const phases = IMPL_PHASES.map((ph) => {
    const stats = phaseStats(tasks, ph.id);
    const depsOk = phaseDepsMet(ph.id, tasks);
    let ampel = 'green';
    if (!depsOk) ampel = 'gray';
    else if (stats.blocked > 0 || stats.progress < 30 && stats.total > 0) ampel = 'yellow';
    if (stats.total && stats.done === stats.total) ampel = 'green';
    else if (stats.total && stats.progress < 50 && stats.blocked) ampel = 'red';

    return {
      id: ph.id,
      title: tx(ph.title, loc),
      goal: tx(ph.goal, loc),
      ...stats,
      depsOk,
      ampel,
      isCurrent: false,
    };
  });

  let currentPhase = phases.find((p) => p.depsOk && p.done < p.total);
  if (!currentPhase && phases.length) currentPhase = phases[phases.length - 1];
  if (currentPhase) {
    phases.forEach((p) => {
      p.isCurrent = p.id === currentPhase.id;
    });
  }

  const overdueTasks = tasks.filter((t) => t.status !== 'done' && t.end && t.end < today);
  const blockedTasks = tasks.filter((t) => isTaskBlocked(t, tasks));

  const planTodos = openTodosFromPlan(tasks, 6);
  const actionItems = openActionItems(session?.meetings || [])
    .slice(0, 4)
    .map((a) => ({
      id: a.id,
      text: a.text,
      due: a.due,
      owner: a.owner,
      source: loc === 'en' ? 'Action item' : 'Action Item',
    }));

  const topTodos = [...planTodos.map((t) => ({ ...t, source: t.taskTitle })), ...actionItems]
    .sort((a, b) => (a.due || '9999').localeCompare(b.due || '9999'))
    .slice(0, 8);

  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((t) => t.status === 'done').length;
  const overallProgress = totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0;

  let ampel = 'green';
  const reasons = [];

  if (hotRisks.some((r) => riskScore(r) >= 9)) {
    ampel = 'red';
    reasons.push(loc === 'en' ? 'High risks open' : 'Hohe Risiken offen');
  } else if (hotRisks.length >= 2) {
    ampel = 'yellow';
    reasons.push(loc === 'en' ? 'Multiple risks' : 'Mehrere Risiken');
  }

  if (overdueTasks.length >= 3) {
    ampel = 'red';
    reasons.push(loc === 'en' ? 'Several overdue tasks' : 'Mehrere überfällige Aufgaben');
  } else if (overdueTasks.length > 0) {
    if (ampel === 'green') ampel = 'yellow';
    reasons.push(loc === 'en' ? 'Overdue tasks' : 'Überfällige Aufgaben');
  }

  if (daysToGoLive != null && daysToGoLive < 0 && overallProgress < 95) {
    ampel = 'red';
    reasons.push(loc === 'en' ? 'Past go-live date' : 'Go-Live-Datum überschritten');
  } else if (daysToGoLive != null && daysToGoLive <= 21 && overallProgress < 70) {
    if (ampel === 'green') ampel = 'yellow';
    reasons.push(loc === 'en' ? 'Go-live soon — progress lagging' : 'Go-Live nahe — Fortschritt hinter Plan');
  }

  if (blockedTasks.length >= 3 && ampel === 'green') {
    ampel = 'yellow';
    reasons.push(loc === 'en' ? 'Blocked by dependencies' : 'Blockiert durch Abhängigkeiten');
  }

  return {
    ampel,
    ampelLabel: AMPEL_LABEL[loc][ampel],
    reasons,
    overallProgress,
    kickoffDate,
    goLiveDate,
    daysSinceKickoff,
    daysToGoLive,
    currentPhase,
    phases,
    milestones,
    topTodos,
    hotRisks,
    overdueCount: overdueTasks.length,
    blockedCount: blockedTasks.length,
    openRiskCount: risks.length,
  };
}
