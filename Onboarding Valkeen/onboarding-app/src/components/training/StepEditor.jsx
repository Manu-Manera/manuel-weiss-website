import { useState } from 'react';
import { ChevronDown, ChevronUp, Trash2, Sparkles, Eye } from 'lucide-react';
import { TRAINING_SCHEMA_META } from '../../data/trainingSchema';

const KIND_LABEL = {
  theory: 'Theorie-Folie',
  highlight: 'Element hervorheben',
  click: 'Klick erwarten',
  input: 'Eingabe erwarten',
  wait: 'Auf Element warten',
  quiz: 'Quiz',
  checklist: 'Abschluss-Karte'
};

const VALIDATION_LABEL = {
  'manual-next': 'Manuell weiter ("Verstanden")',
  'url-contains': 'URL enthält',
  'url-equals': 'URL ist exakt',
  'element-exists': 'Element wird sichtbar',
  'element-removed': 'Element verschwindet',
  'input-equals': 'Eingabe gleich Wert',
  'click-target': 'Klick auf Ziel'
};

export default function StepEditor({ step, slides, allSteps, onChange, onMove, onRemove, index, onTestSelector }) {
  const [open, setOpen] = useState(true);

  function patch(partial) { onChange({ ...step, ...partial }); }
  function patchTip(partial) { patch({ tip: { ...(step.tip || {}), ...partial } }); }
  function patchValidation(partial) { patch({ validation: { ...(step.validation || {}), ...partial } }); }
  function patchTarget(partial) { patch({ target: { ...(step.target || { selectors: [] }), ...partial } }); }

  return (
    <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
      <header className="flex items-center gap-3 px-4 py-3 bg-white/5">
        <button
          onClick={() => setOpen((v) => !v)}
          className="text-white/60 hover:text-white"
          title={open ? 'Einklappen' : 'Ausklappen'}
        >
          {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono">{index + 1}</span>
        <select
          value={step.kind}
          onChange={(e) => patch({ kind: e.target.value })}
          className="text-sm bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-white"
        >
          {TRAINING_SCHEMA_META.STEP_KINDS.map((k) => (
            <option key={k} value={k}>{KIND_LABEL[k] ?? k}</option>
          ))}
        </select>
        <input
          value={step.tip?.title ?? ''}
          onChange={(e) => patchTip({ title: e.target.value })}
          placeholder="Titel des Hinweises"
          className="flex-1 text-sm bg-transparent border-0 outline-none text-white placeholder:text-white/30"
        />
        <button onClick={() => onMove(-1)} className="text-white/40 hover:text-white" title="Nach oben">
          <ChevronUp className="w-4 h-4" />
        </button>
        <button onClick={() => onMove(1)} className="text-white/40 hover:text-white" title="Nach unten">
          <ChevronDown className="w-4 h-4" />
        </button>
        <button onClick={onRemove} className="text-red-400 hover:bg-red-500/15 rounded p-1" title="Schritt löschen">
          <Trash2 className="w-4 h-4" />
        </button>
      </header>

      {open && (
        <div className="p-4 space-y-4">
          {step.kind === 'theory' || step.kind === 'quiz' ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="text-xs text-white/60">Folie</label>
                <select
                  value={step.slideId || ''}
                  onChange={(e) => patch({ slideId: e.target.value })}
                  className="w-full mt-1 px-2 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white"
                >
                  <option value="">– Folie wählen –</option>
                  {slides?.map((s) => (
                    <option key={s.id} value={s.id}>{s.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-white/60">Anzeige</label>
                <select
                  value={step.placement || 'modal'}
                  onChange={(e) => patch({ placement: e.target.value })}
                  className="w-full mt-1 px-2 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white"
                >
                  <option value="modal">Vollbild-Modal</option>
                  <option value="sidepanel">Side-Panel</option>
                </select>
              </div>
            </div>
          ) : null}

          {step.kind !== 'theory' && step.kind !== 'quiz' && step.kind !== 'checklist' && (
            <div>
              <label className="text-xs text-white/60 flex items-center gap-2">
                Selector(s)
                <button
                  onClick={() => onTestSelector?.(step)}
                  className="ml-auto inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30"
                  title="Test im offenen Tempus-Tab"
                >
                  <Eye className="w-3 h-3" /> Live-Test
                </button>
              </label>
              <textarea
                value={(step.target?.selectors || []).join('\n')}
                onChange={(e) => patchTarget({ selectors: e.target.value.split('\n').map((s) => s.trim()).filter(Boolean) })}
                placeholder={`[data-testid="..."]\nbutton[aria-label="..."]\na[href*="resource-grid"]`}
                rows={3}
                className="w-full mt-1 px-2 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white font-mono"
              />
              <div className="mt-1.5 grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  value={step.target?.textHint || ''}
                  onChange={(e) => patchTarget({ textHint: e.target.value })}
                  placeholder="Text-Hint (Fallback)"
                  className="px-2 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white"
                />
                <input
                  value={step.target?.screenshot || ''}
                  onChange={(e) => patchTarget({ screenshot: e.target.value })}
                  placeholder="Screenshot-URL (Notfall-Fallback)"
                  className="px-2 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white"
                />
              </div>
            </div>
          )}

          {step.kind !== 'theory' && step.kind !== 'quiz' && (
            <div>
              <label className="text-xs text-white/60">Tipp-Text</label>
              <textarea
                value={step.tip?.body ?? ''}
                onChange={(e) => patchTip({ body: e.target.value })}
                rows={3}
                placeholder="Was soll der Lernende tun? (Markdown unterstützt)"
                className="w-full mt-1 px-2 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white"
              />
              <div className="mt-1.5 grid grid-cols-1 sm:grid-cols-2 gap-2">
                <select
                  value={step.tip?.placement?.position || 'bottom'}
                  onChange={(e) => patchTip({ placement: { position: e.target.value } })}
                  className="px-2 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white"
                >
                  {['top','right','bottom','left','top-start','top-end','bottom-start','bottom-end','right-start','right-end','left-start','left-end'].map((p) => (
                    <option key={p} value={p}>Position: {p}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-white/60">Validierung</label>
              <select
                value={step.validation?.type || 'manual-next'}
                onChange={(e) => patchValidation({ type: e.target.value })}
                className="w-full mt-1 px-2 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white"
              >
                {TRAINING_SCHEMA_META.VALIDATION_TYPES.map((v) => (
                  <option key={v} value={v}>{VALIDATION_LABEL[v] ?? v}</option>
                ))}
              </select>
            </div>
            {(step.validation?.type === 'url-contains' || step.validation?.type === 'url-equals' || step.validation?.type === 'input-equals') && (
              <div className="sm:col-span-2">
                <label className="text-xs text-white/60">Wert</label>
                <input
                  value={step.validation?.value ?? ''}
                  onChange={(e) => patchValidation({ value: e.target.value })}
                  placeholder="/resource-grid bzw. erwarteter Eingabewert"
                  className="w-full mt-1 px-2 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-white/10">
            <div>
              <label className="text-xs text-white/60">Nächster Schritt</label>
              <select
                value={step.next || ''}
                onChange={(e) => patch({ next: e.target.value || undefined })}
                className="w-full mt-1 px-2 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white"
              >
                <option value="">Nächster in Reihenfolge</option>
                {(allSteps || []).filter((s) => s.id !== step.id).map((s, i) => (
                  <option key={s.id} value={s.id}>#{i + 1} {s.tip?.title || s.id}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-white/60">Hilfe-Schritt (bei Fehler)</label>
              <select
                value={step.onFail || ''}
                onChange={(e) => patch({ onFail: e.target.value || undefined })}
                className="w-full mt-1 px-2 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white"
              >
                <option value="">Keiner</option>
                {(allSteps || []).filter((s) => s.id !== step.id).map((s, i) => (
                  <option key={s.id} value={s.id}>#{i + 1} {s.tip?.title || s.id}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
