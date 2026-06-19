import { useState, useCallback } from 'react';
import {
  Upload,
  Sparkles,
  Loader2,
  CheckCircle,
  AlertCircle,
  FileText,
  Save,
  ExternalLink,
  MessageSquare,
} from 'lucide-react';
import { extractTextFromDocx } from '../../utils/demoWordExtract';
import { analyzeWordDocument, structureWordDocument, refineDemoStructure } from '../../services/demoWordImportAi';
import { registerCustomDemo, DEMO_EDIT_PASSWORD } from '../../services/demoCatalogService';
import { normalizeSlug } from '../../utils/demoHtmlBuilder';

const STEPS = ['upload', 'analysis', 'structure', 'meta', 'done'];

export default function DemoWordImportWizard({ onSaved, onClose }) {
  const [step, setStep] = useState('upload');
  const [fileName, setFileName] = useState('');
  const [docText, setDocText] = useState('');
  const [truncated, setTruncated] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [structure, setStructure] = useState(null);
  const [demoState, setDemoState] = useState(null);
  const [meta, setMeta] = useState({ name: '', description: '', slug: '', badge: '', features: '' });
  const [loading, setLoading] = useState('');
  const [error, setError] = useState('');
  const [savedUrl, setSavedUrl] = useState('');
  const [refineInput, setRefineInput] = useState('');
  const [password, setPassword] = useState(DEMO_EDIT_PASSWORD);

  const onFile = useCallback(async (file) => {
    if (!file?.name?.match(/\.docx$/i)) {
      setError('Bitte eine .docx-Datei wählen.');
      return;
    }
    setError('');
    setLoading('extract');
    try {
      const { text, truncated: tr } = await extractTextFromDocx(file);
      setDocText(text);
      setTruncated(tr);
      setFileName(file.name);
      setStep('upload');
    } catch (e) {
      setError(e.message || 'Word konnte nicht gelesen werden.');
    } finally {
      setLoading('');
    }
  }, []);

  const runAnalysis = async () => {
    if (!docText.trim()) return;
    setLoading('analysis');
    setError('');
    try {
      const result = await analyzeWordDocument(docText);
      setAnalysis(result);
      setStep('analysis');
    } catch (e) {
      setError(e.message || 'Analyse fehlgeschlagen');
    } finally {
      setLoading('');
    }
  };

  const runStructure = async () => {
    setLoading('structure');
    setError('');
    try {
      const { structure: st, demoState: ds } = await structureWordDocument(docText, analysis);
      setStructure(st);
      setDemoState(ds);
      const cm = st.catalogMeta || {};
      setMeta({
        name: cm.name || '',
        description: cm.description || '',
        slug: cm.slug || normalizeSlug(cm.name || 'demo'),
        badge: cm.badge || `${(st.scenes || []).length} Szenen · DE`,
        features: (cm.features || []).join('\n'),
      });
      setStep('structure');
    } catch (e) {
      setError(e.message || 'Struktur-Generierung fehlgeschlagen');
    } finally {
      setLoading('');
    }
  };

  const runRefine = async () => {
    if (!refineInput.trim() || !structure) return;
    setLoading('refine');
    setError('');
    try {
      const { structure: st, demoState: ds } = await refineDemoStructure(structure, refineInput);
      setStructure(st);
      setDemoState(ds);
      setRefineInput('');
    } catch (e) {
      setError(e.message || 'Anpassung fehlgeschlagen');
    } finally {
      setLoading('');
    }
  };

  const saveDemo = async () => {
    if (!demoState || !meta.slug) return;
    setLoading('save');
    setError('');
    try {
      const entry = {
        id: normalizeSlug(meta.slug),
        name: meta.name || meta.slug,
        description: meta.description || '',
        badge: meta.badge || null,
        color: 'from-indigo-500 to-violet-500',
        icon: 'calendar',
        features: meta.features
          .split('\n')
          .map((f) => f.trim())
          .filter(Boolean)
          .slice(0, 6),
        source: 'word-import',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      const { url } = await registerCustomDemo(entry, demoState, password);
      setSavedUrl(url);
      setStep('done');
      onSaved?.(entry);
    } catch (e) {
      setError(e.message || 'Speichern fehlgeschlagen');
    } finally {
      setLoading('');
    }
  };

  return (
    <div className="glass rounded-2xl p-6 border border-cyan-400/25 bg-cyan-500/5 space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            Demo aus Word erstellen
          </h2>
          <p className="text-sm text-white/55 mt-1">
            KI Coach analysiert Inhalt und Struktur — HTML wird automatisch im Demo-Format gebaut.
          </p>
        </div>
        {onClose && (
          <button type="button" className="text-white/40 hover:text-white text-sm" onClick={onClose}>
            Schliessen
          </button>
        )}
      </div>

      {error && (
        <div className="flex gap-2 p-3 rounded-lg bg-red-500/10 border border-red-400/30 text-sm text-red-200">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      {step === 'upload' && (
        <div className="space-y-4">
          <label className="flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed border-white/20 rounded-xl cursor-pointer hover:border-cyan-400/40 transition-colors">
            <Upload className="w-8 h-8 text-cyan-400/80" />
            <span className="text-sm text-white/70">{fileName || '.docx hier ablegen oder klicken'}</span>
            <input
              type="file"
              accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
            />
          </label>
          {docText && (
            <p className="text-xs text-white/45">
              {docText.length.toLocaleString('de-CH')} Zeichen extrahiert
              {truncated ? ' (gekürzt für KI)' : ''}
            </p>
          )}
          <button
            type="button"
            disabled={!docText || loading}
            onClick={runAnalysis}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-500 text-white font-medium flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading === 'analysis' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Mit KI Coach analysieren
          </button>
        </div>
      )}

      {step === 'analysis' && analysis && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-sm space-y-2">
            <p className="text-white/90">{analysis.summary}</p>
            <p className="text-white/50">
              Zielgruppe: <strong className="text-cyan-300">{analysis.audience}</strong>
              {analysis.estimatedDurationMin ? ` · ~${analysis.estimatedDurationMin} Min.` : ''}
            </p>
            {analysis.warnings?.length > 0 && (
              <ul className="text-amber-200/90 text-xs list-disc pl-4">
                {analysis.warnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            )}
          </div>
          <ul className="text-xs text-white/55 space-y-1 max-h-32 overflow-y-auto">
            {(analysis.proposedStructure || []).map((p, i) => (
              <li key={i}>
                [{p.kind}] {p.title} — {p.rationale}
              </li>
            ))}
          </ul>
          <button
            type="button"
            disabled={loading}
            onClick={runStructure}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 text-white font-medium flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading === 'structure' ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
            Demo-Struktur generieren
          </button>
        </div>
      )}

      {step === 'structure' && structure && (
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            <div className="p-3 rounded-lg bg-white/5">
              <div className="text-white/40 text-xs mb-1">Agenda</div>
              <div className="font-medium">{(structure.agenda?.blocks || []).length} Blöcke</div>
            </div>
            <div className="p-3 rounded-lg bg-white/5">
              <div className="text-white/40 text-xs mb-1">Szenen</div>
              <div className="font-medium">{(structure.scenes || []).length}</div>
            </div>
          </div>
          <ul className="max-h-40 overflow-y-auto text-xs text-white/60 space-y-1">
            {(structure.scenes || []).map((s, i) => (
              <li key={i}>
                {s.num} — {s.title?.de || s.title?.en}
              </li>
            ))}
          </ul>
          <div className="flex gap-2">
            <input
              type="text"
              value={refineInput}
              onChange={(e) => setRefineInput(e.target.value)}
              placeholder="z. B. Szene 3 kürzen, Agenda auf 5 Blöcke"
              className="flex-1 px-3 py-2 rounded-lg bg-black/30 border border-white/15 text-sm"
            />
            <button
              type="button"
              disabled={!refineInput.trim() || loading}
              onClick={runRefine}
              className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-sm flex items-center gap-1"
            >
              {loading === 'refine' ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageSquare className="w-4 h-4" />}
              Anpassen
            </button>
          </div>
          <button
            type="button"
            onClick={() => setStep('meta')}
            className="w-full py-2 rounded-xl border border-white/20 text-sm hover:bg-white/5"
          >
            Weiter → Kachel & Speichern
          </button>
        </div>
      )}

      {step === 'meta' && (
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Anzeigename"
            value={meta.name}
            onChange={(e) => setMeta((m) => ({ ...m, name: e.target.value }))}
            className="w-full px-3 py-2 rounded-lg bg-black/30 border border-white/15 text-sm"
          />
          <input
            type="text"
            placeholder="Slug (URL)"
            value={meta.slug}
            onChange={(e) => setMeta((m) => ({ ...m, slug: normalizeSlug(e.target.value) }))}
            className="w-full px-3 py-2 rounded-lg bg-black/30 border border-white/15 text-sm font-mono"
          />
          <textarea
            placeholder="Beschreibung"
            value={meta.description}
            onChange={(e) => setMeta((m) => ({ ...m, description: e.target.value }))}
            rows={2}
            className="w-full px-3 py-2 rounded-lg bg-black/30 border border-white/15 text-sm"
          />
          <input
            type="text"
            placeholder="Badge"
            value={meta.badge}
            onChange={(e) => setMeta((m) => ({ ...m, badge: e.target.value }))}
            className="w-full px-3 py-2 rounded-lg bg-black/30 border border-white/15 text-sm"
          />
          <textarea
            placeholder="Features (eine Zeile pro Punkt)"
            value={meta.features}
            onChange={(e) => setMeta((m) => ({ ...m, features: e.target.value }))}
            rows={4}
            className="w-full px-3 py-2 rounded-lg bg-black/30 border border-white/15 text-sm"
          />
          <input
            type="password"
            placeholder="Bearbeiten-Passwort"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-black/30 border border-white/15 text-sm"
          />
          <button
            type="button"
            disabled={loading || !meta.slug || !meta.name}
            onClick={saveDemo}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-500 text-white font-medium flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading === 'save' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Als neue Demo speichern
          </button>
        </div>
      )}

      {step === 'done' && (
        <div className="text-center space-y-4 py-4">
          <CheckCircle className="w-12 h-12 text-green-400 mx-auto" />
          <p className="text-white/80">Demo gespeichert — Kachel erscheint in der Liste.</p>
          {savedUrl && (
            <a
              href={savedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-600 text-white text-sm font-medium"
            >
              <ExternalLink className="w-4 h-4" />
              Demo öffnen
            </a>
          )}
        </div>
      )}
    </div>
  );
}
