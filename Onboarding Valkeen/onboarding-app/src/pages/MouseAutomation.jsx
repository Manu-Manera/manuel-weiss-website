import { useState, useRef, useCallback, useEffect } from 'react';
import {
  MousePointer2,
  Play,
  Crosshair,
  ArrowRight,
  Plus,
  Trash2,
  Info,
  GripHorizontal,
  X
} from 'lucide-react';
import { simulateDragInElement, runDragSequence } from '../utils/mouseDragSimulation';

const STORAGE_KEY = 'valkeen-drag-tool-v1';

const emptyDrag = () => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  fromX: 200,
  fromY: 300,
  toX: 500,
  toY: 300
});

function loadSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function CoordInput({ label, x, y, onChange, onPick, picking }) {
  return (
    <div className="space-y-1">
      <span className="text-xs text-white/50">{label}</span>
      <div className="flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-1 text-sm text-white/70">
          X
          <input
            type="number"
            value={x}
            onChange={(e) => onChange(Number(e.target.value), y)}
            className="w-20 px-2 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
          />
        </label>
        <label className="flex items-center gap-1 text-sm text-white/70">
          Y
          <input
            type="number"
            value={y}
            onChange={(e) => onChange(x, Number(e.target.value))}
            className="w-20 px-2 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
          />
        </label>
        <button
          type="button"
          onClick={onPick}
          disabled={picking}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-indigo-300 disabled:opacity-50"
        >
          <Crosshair className="w-3.5 h-3.5" />
          {picking ? 'Klicken…' : 'Aufnehmen'}
        </button>
      </div>
    </div>
  );
}

function CoordPickerOverlay({ label, onPick, onCancel }) {
  useEffect(() => {
    const prev = document.body.style.cursor;
    document.body.style.cursor = 'crosshair';
    return () => {
      document.body.style.cursor = prev;
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[200] bg-indigo-950/40 backdrop-blur-[1px] cursor-crosshair"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onPick(Math.round(e.clientX), Math.round(e.clientY));
      }}
    >
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-900/95 border border-indigo-500/30 text-white text-sm shadow-xl pointer-events-auto">
        <Crosshair className="w-4 h-4 text-indigo-400 shrink-0" />
        <span>{label}</span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onCancel();
          }}
          className="p-1 rounded-lg hover:bg-white/10 text-white/60"
          aria-label="Abbrechen"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function MouseAutomation() {
  const saved = loadSaved();
  const [drags, setDrags] = useState(saved?.drags?.length ? saved.drags : [emptyDrag()]);
  const [steps, setSteps] = useState(saved?.steps ?? 24);
  const [stepDelayMs, setStepDelayMs] = useState(saved?.stepDelayMs ?? 18);
  const [pauseMs, setPauseMs] = useState(saved?.pauseMs ?? 200);
  const [target, setTarget] = useState(saved?.target ?? 'page');
  const [running, setRunning] = useState(false);
  const [picking, setPicking] = useState(null);
  const [status, setStatus] = useState(null);
  const [livePos, setLivePos] = useState({ x: 0, y: 0 });
  const [previewPos, setPreviewPos] = useState({ x: 0, y: 0 });
  const previewRef = useRef(null);

  useEffect(() => {
    const onMove = (e) => setLivePos({ x: Math.round(e.clientX), y: Math.round(e.clientY) });
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  const persist = useCallback((nextDrags, nextSteps, nextDelay, nextPause, nextTarget) => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        drags: nextDrags,
        steps: nextSteps,
        stepDelayMs: nextDelay,
        pauseMs: nextPause,
        target: nextTarget
      })
    );
  }, []);

  const updateDrag = (id, patch) => {
    setDrags((prev) => {
      const next = prev.map((d) => (d.id === id ? { ...d, ...patch } : d));
      persist(next, steps, stepDelayMs, pauseMs, target);
      return next;
    });
  };

  const addDrag = () => {
    setDrags((prev) => {
      const last = prev[prev.length - 1];
      const next = [
        ...prev,
        {
          ...emptyDrag(),
          fromX: last?.toX ?? 500,
          fromY: last?.toY ?? 300,
          toX: (last?.toX ?? 500) + 200,
          toY: last?.toY ?? 300
        }
      ];
      persist(next, steps, stepDelayMs, pauseMs, target);
      return next;
    });
  };

  const removeDrag = (id) => {
    setDrags((prev) => {
      const next = prev.length <= 1 ? prev : prev.filter((d) => d.id !== id);
      persist(next, steps, stepDelayMs, pauseMs, target);
      return next;
    });
  };

  const startPick = (dragId, field) => {
    setPicking({ dragId, field });
    setStatus({
      type: 'info',
      text: field === 'from' ? 'Klicke den Startpunkt (mousedown)…' : 'Klicke den Zielpunkt (mouseup)…'
    });
  };

  const handlePick = (x, y) => {
    if (!picking) return;
    const { dragId, field } = picking;
    if (field === 'from') updateDrag(dragId, { fromX: x, fromY: y });
    else updateDrag(dragId, { toX: x, toY: y });
    setPicking(null);
    setStatus({ type: 'success', text: `${field === 'from' ? 'Start' : 'Ziel'}: ${x}, ${y}` });
  };

  const runDrag = async () => {
    setRunning(true);
    setStatus({ type: 'info', text: 'Drag wird ausgeführt…' });

    try {
      if (target === 'preview') {
        const el = previewRef.current;
        if (!el) throw new Error('Testfläche nicht gefunden');
        for (const d of drags) {
          const res = await simulateDragInElement(el, d.fromX, d.fromY, d.toX, d.toY, { steps, stepDelayMs });
          if (!res.ok) throw new Error(res.error);
          await new Promise((r) => setTimeout(r, pauseMs));
        }
        setStatus({ type: 'success', text: 'Drag in der Testfläche abgeschlossen' });
      } else {
        const res = await runDragSequence(
          drags.map(({ fromX, fromY, toX, toY }) => ({ fromX, fromY, toX, toY })),
          { steps, stepDelayMs, pauseBetweenMs: pauseMs }
        );
        if (!res.ok) throw new Error(res.error);
        setStatus({
          type: 'success',
          text: `Fertig – ${res.stepsRun} Schritte${res.lastElement ? ` · Ziel: ${res.lastElement}` : ''}`
        });
      }
    } catch (e) {
      setStatus({ type: 'error', text: e?.message || 'Ausführung fehlgeschlagen' });
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {picking && (
        <CoordPickerOverlay
          label={picking.field === 'from' ? 'Startpunkt wählen (links – mousedown)' : 'Zielpunkt wählen (rechts – mouseup)'}
          onPick={handlePick}
          onCancel={() => {
            setPicking(null);
            setStatus(null);
          }}
        />
      )}

      <div>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3 text-white">
          <MousePointer2 className="w-8 h-8 text-indigo-400 shrink-0" />
          Drag &amp; Drop
        </h1>
        <p className="text-white/60 max-w-2xl">
          Koordinaten eingeben → <strong className="text-white/80">klicken, halten, ziehen, loslassen</strong>.
          Funktioniert direkt auf der aktuellen Seite, ohne Extension oder externes Tool.
        </p>
        <p className="text-xs text-white/40 mt-2">
          Aktuelle Mausposition: <strong className="text-white/60">{livePos.x}, {livePos.y}</strong>
          {' '}(Viewport clientX/clientY)
        </p>
      </div>

      <div className="glass-card p-5 space-y-4">
        <h2 className="text-white font-semibold text-sm">Zielbereich</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'page', label: 'Ganze Seite (Viewport)' },
            { id: 'preview', label: 'Nur Testfläche unten' }
          ].map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => {
                setTarget(opt.id);
                persist(drags, steps, stepDelayMs, pauseMs, opt.id);
              }}
              className={`px-4 py-2 rounded-xl text-sm transition-colors ${
                target === opt.id
                  ? 'bg-indigo-500 text-white'
                  : 'bg-white/5 hover:bg-white/10 text-white/70'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="glass-card p-5 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-white font-semibold flex items-center gap-2">
            <GripHorizontal className="w-5 h-5 text-indigo-400" />
            Drag-Züge
          </h2>
          <button
            type="button"
            onClick={addDrag}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-sm text-indigo-300"
          >
            <Plus className="w-4 h-4" /> Zug hinzufügen
          </button>
        </div>

        {drags.map((d, i) => (
          <div key={d.id} className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-white/80 flex items-center gap-2">
                Zug {i + 1}
                <ArrowRight className="w-4 h-4 text-indigo-400" />
              </span>
              {drags.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeDrag(d.id)}
                  className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-300"
                  aria-label="Zug entfernen"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <CoordInput
                label="Start (mousedown)"
                x={d.fromX}
                y={d.fromY}
                onChange={(x, y) => updateDrag(d.id, { fromX: x, fromY: y })}
                onPick={() => startPick(d.id, 'from')}
                picking={picking?.dragId === d.id && picking?.field === 'from'}
              />
              <CoordInput
                label="Ziel (mouseup)"
                x={d.toX}
                y={d.toY}
                onChange={(x, y) => updateDrag(d.id, { toX: x, toY: y })}
                onPick={() => startPick(d.id, 'to')}
                picking={picking?.dragId === d.id && picking?.field === 'to'}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="glass-card p-5 grid sm:grid-cols-3 gap-4">
        <label className="space-y-1">
          <span className="text-xs text-white/50">Zwischenschritte</span>
          <input
            type="number"
            min={4}
            max={80}
            value={steps}
            onChange={(e) => {
              const v = Number(e.target.value);
              setSteps(v);
              persist(drags, v, stepDelayMs, pauseMs, target);
            }}
            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
          />
        </label>
        <label className="space-y-1">
          <span className="text-xs text-white/50">Verzögerung pro Schritt (ms)</span>
          <input
            type="number"
            min={4}
            max={200}
            value={stepDelayMs}
            onChange={(e) => {
              const v = Number(e.target.value);
              setStepDelayMs(v);
              persist(drags, steps, v, pauseMs, target);
            }}
            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
          />
        </label>
        <label className="space-y-1">
          <span className="text-xs text-white/50">Pause zwischen Zügen (ms)</span>
          <input
            type="number"
            min={0}
            max={3000}
            value={pauseMs}
            onChange={(e) => {
              const v = Number(e.target.value);
              setPauseMs(v);
              persist(drags, steps, stepDelayMs, v, target);
            }}
            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
          />
        </label>
      </div>

      <button
        type="button"
        onClick={runDrag}
        disabled={running || !!picking}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-medium disabled:opacity-50"
      >
        <Play className="w-4 h-4" />
        Drag ausführen
      </button>

      {status && (
        <div
          className={`glass-card p-4 text-sm ${
            status.type === 'error'
              ? 'border-red-500/30 text-red-300'
              : status.type === 'success'
                ? 'border-emerald-500/30 text-emerald-300'
                : 'border-indigo-500/30 text-indigo-200'
          }`}
        >
          {status.text}
        </div>
      )}

      <div className="glass-card p-5 space-y-3">
        <h3 className="text-white font-semibold text-sm">Testfläche</h3>
        <div
          ref={previewRef}
          className="relative h-52 rounded-xl border border-dashed border-white/20 bg-gradient-to-br from-slate-900 to-indigo-950 overflow-hidden select-none"
          onMouseMove={(e) => {
            const r = previewRef.current?.getBoundingClientRect();
            if (!r) return;
            setPreviewPos({ x: Math.round(e.clientX - r.left), y: Math.round(e.clientY - r.top) });
          }}
        >
          <div
            className="absolute top-3 left-3 px-2 py-1 rounded-md bg-black/40 text-xs text-white/50 pointer-events-none"
            draggable
            onDragStart={(e) => e.dataTransfer.setData('text/plain', 'test')}
          >
            Ziehbares Element (echtes HTML-Drag)
          </div>
          <div className="absolute inset-0 flex items-center justify-center text-white/20 text-sm pointer-events-none">
            Relative Koordinaten für Modus „Nur Testfläche“
          </div>
          {drags.map((d) => (
            <svg key={d.id} className="absolute inset-0 w-full h-full pointer-events-none">
              <line
                x1={d.fromX}
                y1={d.fromY}
                x2={d.toX}
                y2={d.toY}
                stroke="rgba(129,140,248,0.7)"
                strokeWidth="2"
                strokeDasharray="6 4"
              />
              <circle cx={d.fromX} cy={d.fromY} r="5" fill="#22d3ee" />
              <circle cx={d.toX} cy={d.toY} r="5" fill="#a78bfa" />
            </svg>
          ))}
        </div>
        <p className="text-xs text-white/45">
          Position in Testfläche: <strong className="text-white/70">{previewPos.x}, {previewPos.y}</strong>
        </p>
      </div>

      <div className="glass-card p-5 flex gap-3 text-sm text-white/60">
        <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
        <div className="space-y-2">
          <p>
            <strong className="text-white/80">Aufnehmen:</strong> Button klicken → irgendwo auf der Seite klicken → Koordinaten werden übernommen.
          </p>
          <p>
            <strong className="text-white/80">Ganze Seite:</strong> Drag an den Viewport-Koordinaten – trifft das Element, das gerade an dieser Stelle liegt.
          </p>
          <p>
            Wirkt nur auf <em>diese</em> Browser-Seite (Sicherheitsgrenze des Browsers). Andere Tabs lassen sich ohne Extension nicht steuern.
          </p>
        </div>
      </div>
    </div>
  );
}
