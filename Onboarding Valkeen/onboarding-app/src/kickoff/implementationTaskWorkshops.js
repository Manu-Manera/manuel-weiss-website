/**
 * Workshop-Links pro Plan-Task (Framework-Step, Lernmodule, manuelle Verknüpfungen).
 */
import { tx } from './implementationTemplate';
import { getArtifact, listArtifacts } from './implementationWorkshopCatalog';
import { learningBlueprint } from './implementationPlanLearning';

function uid(p = 'wr') {
  return `${p}-${Math.random().toString(36).slice(2, 8)}`;
}

export function isLinkableArtifact(art) {
  if (!art) return false;
  return !!(art.shell || art.route);
}

/** Alle Artifact-IDs, die zu einem Plan-Task gehören. */
export function artifactIdsForTask(task) {
  const ids = new Set();
  if (task?.stepId) ids.add(task.stepId);
  if (Array.isArray(task?.linkedWorkshopIds)) {
    task.linkedWorkshopIds.forEach((id) => id && ids.add(id));
  }
  const bp = task?.learning || learningBlueprint(task?.stepId);
  if (bp?.modules) {
    for (const m of bp.modules) {
      if (m.type === 'artifact' && m.artifactId) ids.add(m.artifactId);
    }
  }
  return [...ids];
}

/** Aufgelöste Workshop-/Tool-Links für einen Task (Gantt-Hover, Tabelle). */
export function workshopsForTask(task, locale = 'de', session = null) {
  const ids = new Set(artifactIdsForTask(task));
  for (const e of session?.workshopRegister || []) {
    if (e.planTaskId === task?.id && e.artifactId) ids.add(e.artifactId);
  }
  const out = [];
  const seen = new Set();
  for (const id of ids) {
    if (seen.has(id)) continue;
    const art = getArtifact(id);
    if (!isLinkableArtifact(art)) continue;
    seen.add(id);
    out.push({
      artifactId: id,
      artifact: art,
      title: tx(art.title, locale),
      kind: art.kind,
    });
  }
  return out;
}

export function newWorkshopRegisterEntry(artifactId = '', planTaskId = '') {
  return {
    id: uid(),
    artifactId,
    planTaskId,
    source: planTaskId ? 'plan' : 'manual',
    notes: '',
    titleOverride: '',
  };
}

function registerKey(artifactId, planTaskId) {
  return `${artifactId || ''}::${planTaskId || ''}`;
}

/** Plan-Tasks → Register-Einträge (bestehende + manuelle bleiben erhalten). */
export function syncWorkshopRegisterFromPlan(plan, register = []) {
  const entries = [...(register || [])];
  const keys = new Set(entries.map((e) => registerKey(e.artifactId, e.planTaskId)));

  for (const task of plan || []) {
    for (const artifactId of artifactIdsForTask(task)) {
      const art = getArtifact(artifactId);
      if (!isLinkableArtifact(art)) continue;
      const k = registerKey(artifactId, task.id);
      if (keys.has(k)) continue;
      entries.push({
        id: uid(),
        artifactId,
        planTaskId: task.id,
        source: 'plan',
        notes: '',
        titleOverride: '',
      });
      keys.add(k);
    }
  }
  return entries;
}

export function enrichWorkshopEntry(entry, session, locale = 'de') {
  const art = getArtifact(entry?.artifactId);
  const task = (session?.projectPlan || []).find((t) => t.id === entry?.planTaskId);
  return {
    ...entry,
    artifact: art,
    title: entry?.titleOverride || tx(art?.title, locale) || entry?.artifactId || '',
    planTaskTitle: task?.title || '',
    phaseId: art?.phaseId || task?.phaseId || '',
  };
}

/** Katalog-Artefakte für Auswahl im Register (Workshops, Tools, Decks). */
export function selectableWorkshopArtifacts(locale = 'de') {
  return listArtifacts()
    .filter(isLinkableArtifact)
    .map((a) => ({
      id: a.id,
      title: tx(a.title, locale),
      kind: a.kind,
      phaseId: a.phaseId,
    }))
    .sort((a, b) => a.title.localeCompare(b.title, locale));
}
