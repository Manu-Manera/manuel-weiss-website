/**
 * Projekt-Vorlagen: aus einem bestehenden Gantt-Projekt eine wiederverwendbare
 * Vorlage machen (Phasen, Aufgaben, Meilensteine, Abhängigkeiten, To-dos,
 * Learning) und für andere Applikationen / Kunden neu instanziieren.
 *
 * Speicherung in localStorage (geräte-/browserlokal), unabhängig von der
 * Kunden-Session.
 */
import { addDays, dayDiff, parseISO, toISO } from './implementationPlan';

export const TEMPLATE_INDEX_KEY = 'implementation_templates_v1';

export function readTemplates() {
  try {
    const raw = localStorage.getItem(TEMPLATE_INDEX_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed.templates) ? parsed.templates : [];
  } catch {
    return [];
  }
}

export function writeTemplates(templates) {
  try {
    localStorage.setItem(TEMPLATE_INDEX_KEY, JSON.stringify({ templates }));
  } catch {
    /* quota */
  }
}

export function listTemplates() {
  return [...readTemplates()].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}

export function getTemplate(id) {
  return readTemplates().find((t) => t.id === id) || null;
}

export function removeTemplate(id) {
  writeTemplates(readTemplates().filter((t) => t.id !== id));
}

function templateId() {
  return `tpl-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

/** Frühestes Startdatum eines Plans (ohne Polsterung) als ISO. */
function earliestStartISO(tasks) {
  let min = null;
  for (const t of tasks || []) {
    if (!t.start) continue;
    const s = parseISO(t.start);
    if (!min || s < min) min = s;
  }
  return min ? toISO(min) : toISO(new Date());
}

/** Aufgabe für die Vorlage normalisieren (Fortschritt zurücksetzen). */
function stripTaskForTemplate(t) {
  return {
    ...t,
    status: 'open',
    todos: (t.todos || []).map((td) => ({ ...td, done: false })),
  };
}

/** Vorlage aus einer Session erstellen. */
export function templateFromSession(session, name) {
  const plan = (session?.projectPlan || []).map(stripTaskForTemplate);
  return {
    id: templateId(),
    name: String(name || '').trim() || 'Vorlage',
    locale: session?.locale || 'de',
    createdAt: Date.now(),
    sourceCustomer: String(session?.customer || '').trim(),
    taskCount: plan.length,
    customPhases: session?.customPhases || [],
    phaseLabels: session?.phaseLabels || {},
    workshopRegister: session?.workshopRegister || [],
    projectPlan: plan,
  };
}

/** Vorlage speichern und Liste zurückgeben. */
export function saveTemplate(session, name) {
  const tpl = templateFromSession(session, name);
  const list = readTemplates();
  list.push(tpl);
  writeTemplates(list);
  return tpl;
}

/**
 * Vorlage zu einem konkreten Plan instanziieren: neue Task-IDs, Abhängigkeiten
 * umgemappt und alle Daten relativ zum gewünschten Startdatum verschoben.
 */
export function instantiateTemplate(tpl, startISO) {
  const tasks = tpl?.projectPlan || [];
  if (!tasks.length) {
    return {
      projectPlan: [],
      customPhases: tpl?.customPhases || [],
      phaseLabels: tpl?.phaseLabels || {},
      workshopRegister: [],
    };
  }

  const baseISO = earliestStartISO(tasks);
  const offset = startISO ? dayDiff(baseISO, startISO) : 0;

  const idMap = {};
  const remapped = tasks.map((t) => {
    const newId = `t-${Math.random().toString(36).slice(2, 8)}`;
    idMap[t.id] = newId;
    return { ...t, id: newId };
  });

  const projectPlan = remapped.map((t) => ({
    ...t,
    start: t.start ? toISO(addDays(parseISO(t.start), offset)) : t.start,
    end: t.end ? toISO(addDays(parseISO(t.end), offset)) : t.end,
    // Task-ID-Abhängigkeiten neu mappen; Legacy-stepId-Deps bleiben unverändert.
    dependsOn: (t.dependsOn || []).map((d) => idMap[d] || d),
  }));

  // Workshop-Verknüpfungen auf neue Task-IDs umbiegen.
  const workshopRegister = (tpl.workshopRegister || []).map((w) => ({
    ...w,
    planTaskId: w.planTaskId && idMap[w.planTaskId] ? idMap[w.planTaskId] : '',
  }));

  return {
    projectPlan,
    customPhases: tpl.customPhases || [],
    phaseLabels: tpl.phaseLabels || {},
    workshopRegister,
  };
}
