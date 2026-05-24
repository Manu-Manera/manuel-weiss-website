import { useEffect, useState } from 'react';
import { Save, Plus, Loader2, AlertTriangle, PlayCircle, Mic, Trash2, FileText } from 'lucide-react';
import { listTours, getTour, putTour, deleteTour, listSlides, getSlide } from '../../services/trainingAdminService';
import { newTour, newStep, validateTour } from '../../data/trainingSchema';
import { useExtensionStatus, startTour, fetchRecorderSteps } from './ExtensionBridge';
import StepEditor from './StepEditor';

const KIND_DEFAULTS = ['theory', 'highlight', 'click', 'input', 'wait', 'checklist'];

export default function TourEditor({ customerId }) {
  const [tours, setTours] = useState([]);
  const [tourId, setTourId] = useState(null);
  const [tour, setTour] = useState(null);
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState([]);
  const [info, setInfo] = useState(null);
  const ext = useExtensionStatus();

  useEffect(() => {
    if (!customerId) return;
    void refreshList();
    void refreshSlides();
  }, [customerId]);

  useEffect(() => {
    if (!customerId || !tourId) { setTour(null); return; }
    void loadTour(tourId);
  }, [tourId, customerId]);

  async function refreshList() {
    setLoading(true);
    try {
      const data = await listTours(customerId);
      setTours(data?.tours || []);
      if (data?.tours?.length && !tourId) setTourId(data.tours[0].id);
    } catch (e) {
      setErrors([`Listen-Fehler: ${e.message}`]);
    } finally { setLoading(false); }
  }

  async function refreshSlides() {
    try {
      const data = await listSlides(customerId);
      const list = data?.slides || [];
      setSlides(list.map((s) => ({ id: s.id, title: s.title })));
    } catch {
      setSlides([]);
    }
  }

  async function loadTour(id) {
    setLoading(true);
    setErrors([]);
    try {
      const t = await getTour(customerId, id);
      setTour(t);
    } catch (e) {
      setTour(null);
      setErrors([`Tour-Lade-Fehler: ${e.message}`]);
    } finally { setLoading(false); }
  }

  async function createTour() {
    const t = newTour(customerId, { title: 'Neue Tour' });
    setTour(t);
    setTourId(t.id);
  }

  async function save() {
    if (!tour) return;
    const errs = validateTour(tour);
    if (errs.length) {
      setErrors(errs);
      return;
    }
    setSaving(true);
    setErrors([]);
    try {
      await putTour(customerId, tour);
      setInfo('Gespeichert.');
      setTimeout(() => setInfo(null), 3000);
      await refreshList();
    } catch (e) {
      setErrors([`Speicher-Fehler: ${e.message}`]);
    } finally { setSaving(false); }
  }

  async function remove() {
    if (!tour || !window.confirm(`Tour "${tour.title}" löschen?`)) return;
    try {
      await deleteTour(customerId, tour.id);
      setTour(null);
      setTourId(null);
      await refreshList();
    } catch (e) {
      setErrors([`Lösch-Fehler: ${e.message}`]);
    }
  }

  async function liveTest() {
    if (!tour) return;
    if (tour.status !== 'published') {
      setErrors(['Live-Test: Tour muss veröffentlicht sein (oder kurz auf published setzen).']);
      return;
    }
    const res = await startTour(tour.id, customerId);
    if (!res.ok) {
      setErrors([`Extension nicht erreichbar (${res.reason}). Bitte installieren und einloggen.`]);
    } else {
      setInfo('Tour an Tempus-Tab geschickt. Wechsle in den Tempus-Tab.');
      setTimeout(() => setInfo(null), 4000);
    }
  }

  async function importFromRecorder() {
    const steps = await fetchRecorderSteps();
    if (!steps?.length) {
      setErrors(['Keine Recorder-Schritte vorhanden. Im Extension-Popup "Aufnahme starten" und klicken.']);
      return;
    }
    if (!tour) await createTour();
    const additions = steps.map((s) => newStep(s.action === 'input' ? 'input' : 'highlight', {
      target: { selectors: s.selectors || [], textHint: s.textHint, screenshot: s.screenshotDataUrl ?? '' },
      tip: { title: s.textHint || `Schritt`, body: `Aufgenommen aus ${s.url}`, placement: { position: 'bottom' } },
      validation: s.action === 'click' ? { type: 'click-target' } : { type: 'manual-next' }
    }));
    setTour((t) => ({ ...(t || newTour(customerId)), steps: [...(t?.steps || []), ...additions], updatedAt: new Date().toISOString() }));
    setInfo(`${additions.length} Schritte aus Recorder importiert.`);
    setTimeout(() => setInfo(null), 4000);
  }

  function patchStep(idx, next) {
    setTour((t) => ({
      ...t,
      steps: t.steps.map((s, i) => (i === idx ? next : s)),
      updatedAt: new Date().toISOString()
    }));
  }

  function moveStep(idx, dir) {
    setTour((t) => {
      const arr = [...t.steps];
      const j = idx + dir;
      if (j < 0 || j >= arr.length) return t;
      const [removed] = arr.splice(idx, 1);
      arr.splice(j, 0, removed);
      return { ...t, steps: arr };
    });
  }

  function removeStep(idx) {
    setTour((t) => ({ ...t, steps: t.steps.filter((_, i) => i !== idx) }));
  }

  function addStep(kind) {
    setTour((t) => ({ ...(t || newTour(customerId)), steps: [...((t?.steps) || []), newStep(kind)] }));
  }

  if (!customerId) {
    return <div className="text-white/60">Bitte zuerst Kunde wählen.</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={tourId || ''}
            onChange={(e) => setTourId(e.target.value || null)}
            className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white"
          >
            <option value="">– Tour wählen –</option>
            {tours.map((t) => (
              <option key={t.id} value={t.id}>{t.title} {t.status === 'draft' ? ' (Entwurf)' : ''}</option>
            ))}
          </select>
          <button
            onClick={createTour}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-green-500/20 hover:bg-green-500/30 text-green-300 text-sm"
          >
            <Plus className="w-4 h-4" /> Neue Tour
          </button>
          <button
            onClick={importFromRecorder}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-sm"
            title="Aus dem Browser-Extension-Recorder importieren"
          >
            <Mic className="w-4 h-4" /> Aus Recorder
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-1 rounded-md ${ext.installed ? 'bg-emerald-500/15 text-emerald-300' : 'bg-amber-500/15 text-amber-300'}`}>
            Extension: {ext.installed ? `aktiv ${ext.version ? 'v' + ext.version : ''}` : 'nicht erreichbar'}
          </span>
          <button
            onClick={liveTest}
            disabled={!tour}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 disabled:opacity-50 text-sm"
            title="Tour direkt im offenen Tempus-Tab starten"
          >
            <PlayCircle className="w-4 h-4" /> Live-Test
          </button>
          <button
            onClick={save}
            disabled={!tour || saving}
            className="flex items-center gap-1 px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white text-sm"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Speichern
          </button>
          {tour && (
            <button onClick={remove} className="flex items-center gap-1 px-3 py-2 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-300 text-sm">
              <Trash2 className="w-4 h-4" /> Löschen
            </button>
          )}
        </div>
      </div>

      {errors.length > 0 && (
        <div className="glass-card p-3 border-red-500/30 bg-red-500/10 text-red-300 text-sm flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <ul className="list-disc list-inside">
            {errors.map((e, i) => (<li key={i}>{e}</li>))}
          </ul>
        </div>
      )}
      {info && (
        <div className="glass-card p-3 border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-sm">
          {info}
        </div>
      )}

      {loading && <div className="text-white/60 text-sm flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Lade…</div>}

      {tour && (
        <div className="glass-card p-5 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              value={tour.title}
              onChange={(e) => setTour((t) => ({ ...t, title: e.target.value }))}
              placeholder="Tour-Titel"
              className="sm:col-span-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white"
            />
            <select
              value={tour.status}
              onChange={(e) => setTour((t) => ({ ...t, status: e.target.value }))}
              className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white"
            >
              <option value="draft">Entwurf</option>
              <option value="published">Veröffentlicht</option>
            </select>
          </div>
          <textarea
            value={tour.description || ''}
            onChange={(e) => setTour((t) => ({ ...t, description: e.target.value }))}
            placeholder="Beschreibung der Tour"
            rows={2}
            className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm"
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              value={tour.domainHint || ''}
              onChange={(e) => setTour((t) => ({ ...t, domainHint: e.target.value }))}
              placeholder="Tempus-Subdomain (z.B. knauf.prosymmetry.com)"
              className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white"
            />
            <input
              value={(tour.audience || []).join(',')}
              onChange={(e) => setTour((t) => ({ ...t, audience: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) }))}
              placeholder="Zielgruppe (RM,PM,Admin)"
              className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white"
            />
            <input
              value={tour.estimatedDurationMin || ''}
              onChange={(e) => setTour((t) => ({ ...t, estimatedDurationMin: e.target.value }))}
              placeholder="Dauer in Minuten"
              className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white"
            />
          </div>

          <div className="border-t border-white/10 pt-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white/80">
                <FileText className="w-4 h-4 text-indigo-400" />
                <span className="font-semibold">Schritte ({tour.steps?.length || 0})</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {KIND_DEFAULTS.map((k) => (
                  <button
                    key={k}
                    onClick={() => addStep(k)}
                    className="text-xs px-2 py-1 rounded-md bg-white/5 hover:bg-white/10 text-white/70"
                  >
                    + {k}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              {(tour.steps || []).map((s, i) => (
                <StepEditor
                  key={s.id}
                  step={s}
                  slides={slides}
                  allSteps={tour.steps}
                  index={i}
                  onChange={(next) => patchStep(i, next)}
                  onMove={(dir) => moveStep(i, dir)}
                  onRemove={() => removeStep(i)}
                  onTestSelector={(step) => liveTestSingleStep(step, customerId, tour, setErrors, setInfo)}
                />
              ))}
              {(!tour.steps || tour.steps.length === 0) && (
                <div className="text-white/40 text-sm py-6 text-center border border-dashed border-white/10 rounded-xl">
                  Noch keine Schritte – füge oben oder per Recorder welche hinzu.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

async function liveTestSingleStep(step, customerId, tour, setErrors, setInfo) {
  const trial = newTour(customerId, { ...tour, status: 'published', steps: [step] });
  trial.id = `__test_${Date.now().toString(36)}`;
  trial.title = `[Test] ${tour.title}`;
  try {
    await putTour(customerId, trial);
    const res = await startTour(trial.id, customerId);
    if (!res.ok) setErrors([`Live-Test: Extension nicht erreichbar (${res.reason}).`]);
    else setInfo('Test-Schritt an Tempus-Tab geschickt.');
  } catch (e) {
    setErrors([`Live-Test fehlgeschlagen: ${e.message}`]);
  }
}
