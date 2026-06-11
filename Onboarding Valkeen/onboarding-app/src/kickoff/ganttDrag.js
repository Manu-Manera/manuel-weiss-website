import { addDays, dayDiff, parseISO, toISO } from './implementationPlan';

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
