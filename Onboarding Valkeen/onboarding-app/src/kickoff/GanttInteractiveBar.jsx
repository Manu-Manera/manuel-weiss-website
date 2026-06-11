import { useCallback, useRef, useState } from 'react';
import {
  moveMilestone,
  pixelsToDayDelta,
  resizeTaskEnd,
  resizeTaskStart,
  shiftTaskDates,
} from './ganttDrag';

const DRAG_CLICK_THRESHOLD = 4;

/**
 * Interaktiver Gantt-Balken: Verschieben (drag) + Start/Ende ziehen (resize).
 * onDateAdjust: { mode, dayDelta } — Parent verschiebt bei move auch Nachfolger.
 */
export default function GanttInteractiveBar({
  task,
  left,
  width,
  prog,
  learnPct,
  blocked,
  canEdit,
  pxPerDay,
  locale,
  setBarRef,
  onDateAdjust,
  onEdit,
}) {
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef(null);

  const finishDrag = useCallback(() => {
    dragRef.current = null;
    setDragging(false);
  }, []);

  const applyDrag = useCallback(
    (mode, dayDelta) => {
      if (!dayDelta) return;
      if (mode === 'move') {
        onDateAdjust?.({ mode, dayDelta });
        return;
      }
      let patch;
      if (task.milestone) {
        patch = moveMilestone(task, dayDelta);
      } else if (mode === 'resize-start') {
        patch = resizeTaskStart(task, dayDelta);
      } else if (mode === 'resize-end') {
        patch = resizeTaskEnd(task, dayDelta);
      } else {
        patch = shiftTaskDates(task, dayDelta);
      }
      onDateAdjust?.({ mode, dayDelta, patch });
    },
    [task, onDateAdjust]
  );

  const startPointerDrag = useCallback(
    (e, mode) => {
      if (!canEdit) return;
      e.preventDefault();
      e.stopPropagation();
      const el = e.currentTarget.closest('.gantt-bar, .gantt-milestone');
      if (el) el.setPointerCapture(e.pointerId);

      dragRef.current = {
        mode,
        startX: e.clientX,
        lastAppliedDelta: 0,
        moved: false,
        pointerId: e.pointerId,
      };
      setDragging(true);

      const onMove = (ev) => {
        const d = dragRef.current;
        if (!d || ev.pointerId !== d.pointerId) return;
        const rawDelta = pixelsToDayDelta(ev.clientX - d.startX, pxPerDay);
        const stepDelta = rawDelta - d.lastAppliedDelta;
        if (stepDelta !== 0) {
          d.lastAppliedDelta = rawDelta;
          d.moved = Math.abs(ev.clientX - d.startX) > DRAG_CLICK_THRESHOLD;
          applyDrag(d.mode, stepDelta);
        }
      };

      const onUp = (ev) => {
        const d = dragRef.current;
        if (!d || ev.pointerId !== d.pointerId) return;
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        window.removeEventListener('pointercancel', onUp);
        if (el?.hasPointerCapture(ev.pointerId)) el.releasePointerCapture(ev.pointerId);
        const wasMoved = d?.moved;
        finishDrag();
        if (!wasMoved) onEdit?.();
      };

      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
      window.addEventListener('pointercancel', onUp);
    },
    [canEdit, pxPerDay, applyDrag, finishDrag, onEdit]
  );

  const displayTitle = task.title || (locale === 'en' ? '(untitled)' : '(ohne Titel)');

  if (task.milestone) {
    return (
      <div
        className={`gantt-milestone ${dragging ? 'gantt-milestone--drag' : ''} ${canEdit ? 'gantt-milestone--editable' : ''}`}
        style={{ left }}
        ref={(el) => setBarRef(task.id, el)}
        onPointerDown={(e) => startPointerDrag(e, 'move')}
        title={
          canEdit
            ? locale === 'en'
              ? 'Drag to move date (with dependents)'
              : 'Ziehen zum Verschieben (mit Abhängigen)'
            : displayTitle
        }
      />
    );
  }

  return (
    <div
      className={`gantt-bar gantt-bar--${task.status} ${blocked ? 'gantt-bar--blocked' : ''} ${dragging ? 'gantt-bar--dragging' : ''} ${canEdit ? 'gantt-bar--editable' : ''}`}
      style={{ left, width }}
      ref={(el) => setBarRef(task.id, el)}
      onPointerDown={(e) => {
        if (!canEdit) {
          onEdit?.();
          return;
        }
        if (e.target.closest('.gantt-bar-handle')) return;
        startPointerDrag(e, 'move');
      }}
      title={
        canEdit
          ? locale === 'en'
            ? 'Drag to move · edges to resize · dependents follow'
            : 'Ziehen zum Verschieben · Ränder zum Verlängern/Kürzen · Abhängige folgen'
          : displayTitle
      }
    >
      <div className="gantt-bar-fill" style={{ width: `${prog}%` }} />
      {learnPct > 0 && (
        <div
          className="gantt-bar-learn"
          style={{ width: `${learnPct}%` }}
          title={locale === 'en' ? `Learning ${learnPct}%` : `Lernen ${learnPct}%`}
        />
      )}
      <span className="gantt-bar-text">{displayTitle}</span>
      {canEdit && (
        <>
          <span
            className="gantt-bar-handle gantt-bar-handle--left"
            onPointerDown={(e) => startPointerDrag(e, 'resize-start')}
            title={locale === 'en' ? 'Resize start' : 'Start verschieben'}
          />
          <span
            className="gantt-bar-handle gantt-bar-handle--right"
            onPointerDown={(e) => startPointerDrag(e, 'resize-end')}
            title={locale === 'en' ? 'Resize end' : 'Ende verschieben'}
          />
        </>
      )}
    </div>
  );
}
