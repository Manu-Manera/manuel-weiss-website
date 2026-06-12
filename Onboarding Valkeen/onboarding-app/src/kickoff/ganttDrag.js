import { addDays, dayDiff, dependentsOf, parseISO, toISO } from './implementationPlan';

/** ISO-Datum um n Tage verschieben. */
export function shiftISO(iso, dayDelta) {
  return toISO(addDays(parseISO(iso), dayDelta));
}

/**
 * Absolute Patches für eine laufende Drag-Operation, berechnet aus einem
 * Snapshot (Stand bei Drag-Start) + kumulativem Tages-Delta.
 *
 * mode:
 *  - 'move'         → Task + alle Nachfolger um dayDelta verschieben
 *  - 'resize-start' → nur Startdatum (Ende fix, min. 1 Tag), keine Nachfolger
 *  - 'resize-end'   → Enddatum (Start fix, min. 1 Tag); Nachfolger wandern um
 *                     das effektive Delta mit (Verkettung bleibt erhalten)
 */
export function dragPatches(snapshot, taskId, mode, dayDelta) {
  const tasks = snapshot || [];
  const root = tasks.find((t) => t.id === taskId);
  if (!root) return {};

  const patches = {};

  const shiftTree = (delta) => {
    if (!delta) return;
    for (const id of collectSuccessorIds(root, tasks)) {
      const t = tasks.find((x) => x.id === id);
      if (!t) continue;
      patches[id] = t.milestone
        ? { start: shiftISO(t.start, delta), end: shiftISO(t.start, delta) }
        : { start: shiftISO(t.start, delta), end: shiftISO(t.end, delta) };
    }
  };

  if (root.milestone || mode === 'move') {
    patches[taskId] = root.milestone
      ? { start: shiftISO(root.start, dayDelta), end: shiftISO(root.start, dayDelta) }
      : { start: shiftISO(root.start, dayDelta), end: shiftISO(root.end, dayDelta) };
    shiftTree(dayDelta);
    return patches;
  }

  if (mode === 'resize-start') {
    const end = parseISO(root.end);
    let newStart = addDays(parseISO(root.start), dayDelta);
    if (newStart > end) newStart = end;
    patches[taskId] = { start: toISO(newStart), end: root.end };
    return patches;
  }

  if (mode === 'resize-end') {
    const start = parseISO(root.start);
    let newEnd = addDays(parseISO(root.end), dayDelta);
    if (newEnd < start) newEnd = start;
    const newEndISO = toISO(newEnd);
    patches[taskId] = { start: root.start, end: newEndISO };
    // Nachfolger um das tatsächlich angewandte Delta mitziehen.
    shiftTree(dayDiff(root.end, newEndISO));
    return patches;
  }

  return patches;
}

/** Verschiebt Start und Ende um dieselbe Anzahl Tage. */
export function shiftTaskDates(task, dayDelta) {
  if (!dayDelta) return { start: task.start, end: task.end };
  return {
    start: toISO(addDays(parseISO(task.start), dayDelta)),
    end: toISO(addDays(parseISO(task.end), dayDelta)),
  };
}

/** Startdatum verschieben (Ende bleibt, mind. 1 Tag Dauer). */
export function resizeTaskStart(task, dayDelta) {
  const start = parseISO(task.start);
  const end = parseISO(task.end);
  const newStart = addDays(start, dayDelta);
  if (newStart > end) return { start: toISO(end), end: task.end };
  return { start: toISO(newStart), end: task.end };
}

/** Enddatum verschieben (Start bleibt, mind. 1 Tag Dauer). */
export function resizeTaskEnd(task, dayDelta) {
  const start = parseISO(task.start);
  const end = parseISO(task.end);
  const newEnd = addDays(end, dayDelta);
  if (newEnd < start) return { start: task.start, end: toISO(start) };
  return { start: task.start, end: toISO(newEnd) };
}

/** Meilenstein auf ein Datum setzen. */
export function moveMilestone(task, dayDelta) {
  const d = toISO(addDays(parseISO(task.start), dayDelta));
  return { start: d, end: d };
}

/** Pixel-Delta in Tage (snap). */
export function pixelsToDayDelta(deltaX, pxPerDay) {
  if (!pxPerDay) return 0;
  return Math.round(deltaX / pxPerDay);
}

/** Anzeige-Dauer in Tagen (inkl. Starttag). */
export function taskSpanDays(task) {
  return Math.max(1, dayDiff(task.start, task.end) + 1);
}

/** Alle Nachfolger (direkt + indirekt), die von diesem Task abhängen. */
export function collectSuccessorIds(task, tasks) {
  const out = new Set();
  const walk = (t) => {
    for (const succ of dependentsOf(t, tasks)) {
      if (!out.has(succ.id)) {
        out.add(succ.id);
        walk(succ);
      }
    }
  };
  if (task) walk(task);
  return out;
}

/**
 * Verschiebt einen Task und alle abhängigen Nachfolger um dieselbe Tages-Delta.
 * Ohne Nachfolger wird nur der Task selbst verschoben.
 */
export function shiftTaskTree(taskId, dayDelta, tasks) {
  const root = (tasks || []).find((t) => t.id === taskId);
  if (!root || !dayDelta) return {};

  const ids = new Set([taskId]);
  for (const id of collectSuccessorIds(root, tasks)) ids.add(id);

  const patches = {};
  for (const id of ids) {
    const t = tasks.find((x) => x.id === id);
    if (!t) continue;
    patches[id] = t.milestone ? moveMilestone(t, dayDelta) : shiftTaskDates(t, dayDelta);
  }
  return patches;
}
