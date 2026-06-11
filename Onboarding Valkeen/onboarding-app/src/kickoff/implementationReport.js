/**
 * Status-Report & Audit-Log fürs Implementation Framework.
 */
import { IMPL_PHASES, STEP_STATUS_LABEL, tx } from './implementationTemplate';
import { openActionItems } from './implementationLog';
import { riskScore } from './implementationRegisters';

export function appendAuditLog(existing, entry) {
  const log = Array.isArray(existing) ? [...existing] : [];
  log.push({
    id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    at: new Date().toISOString(),
    ...entry,
  });
  return log.slice(-200);
}

export function buildStatusReport(session, locale = 'de') {
  const loc = locale === 'en' ? 'en' : 'de';
  const lines = [];
  const customer = session.customer || (loc === 'en' ? 'Customer' : 'Kunde');
  const stepStatus = session.stepStatus || {};
  const allSteps = IMPL_PHASES.flatMap((ph) => ph.steps);
  const done = allSteps.filter((s) => stepStatus[s.id] === 'done').length;
  const progress = allSteps.length ? Math.round((done / allSteps.length) * 100) : 0;

  lines.push(`# ${customer} — ${loc === 'en' ? 'Implementation status' : 'Implementierungs-Status'}`);
  lines.push('');
  lines.push(
    `${loc === 'en' ? 'Progress' : 'Fortschritt'}: ${progress}% (${done}/${allSteps.length})`
  );
  lines.push(`${loc === 'en' ? 'Updated' : 'Stand'}: ${new Date().toLocaleString(loc === 'en' ? 'en-GB' : 'de-CH')}`);
  lines.push('');

  lines.push(`## ${loc === 'en' ? 'Phases' : 'Phasen'}`);
  for (const ph of IMPL_PHASES) {
    const phSteps = ph.steps.filter((s) => stepStatus[s.id] === 'done').length;
    lines.push(`- **${tx(ph.title, loc)}** — ${phSteps}/${ph.steps.length}`);
  }
  lines.push('');

  const openActions = openActionItems(session.meetings || []);
  if (openActions.length) {
    lines.push(`## ${loc === 'en' ? 'Open action items' : 'Offene Action Items'}`);
    for (const a of openActions.slice(0, 15)) {
      lines.push(`- ${a.text}${a.owner ? ` (${a.owner})` : ''}${a.due ? ` · ${a.due}` : ''}`);
    }
    if (openActions.length > 15) lines.push(`- … +${openActions.length - 15}`);
    lines.push('');
  }

  const decisions = session.decisions || [];
  const openDec = decisions.filter((d) => d.status === 'open');
  if (openDec.length) {
    lines.push(`## ${loc === 'en' ? 'Open decisions' : 'Offene Entscheidungen'}`);
    for (const d of openDec.slice(0, 12)) {
      lines.push(`- ${d.title || d.nr || '—'}`);
    }
    lines.push('');
  }

  const risks = [...(session.risks || [])].sort((a, b) => riskScore(b) - riskScore(a));
  const hotRisks = risks.filter((r) => r.status === 'open' && riskScore(r) >= 6);
  if (hotRisks.length) {
    lines.push(`## ${loc === 'en' ? 'Top risks' : 'Top-Risiken'}`);
    for (const r of hotRisks.slice(0, 8)) {
      lines.push(`- ${r.title} (Score ${riskScore(r)})`);
    }
    lines.push('');
  }

  const plan = session.projectPlan || [];
  const openTasks = plan.filter((t) => t.status !== 'done' && !t.milestone);
  if (openTasks.length) {
    lines.push(`## ${loc === 'en' ? 'Upcoming tasks' : 'Nächste Aufgaben'}`);
    for (const t of openTasks.slice(0, 10)) {
      lines.push(`- ${t.title}${t.end ? ` · ${t.end}` : ''}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

export function downloadTextReport(session, locale = 'de') {
  const text = buildStatusReport(session, locale);
  const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
  const name = (session.customer || 'implementation').replace(/[^\w\-]+/g, '_').slice(0, 40);
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${name}-status-${new Date().toISOString().slice(0, 10)}.md`;
  a.click();
  URL.revokeObjectURL(a.href);
}
