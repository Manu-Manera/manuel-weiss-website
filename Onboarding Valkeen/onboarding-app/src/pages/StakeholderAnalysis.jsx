import { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Bot,
  CheckCircle,
  ChevronDown,
  Circle,
  Edit3,
  Loader2,
  Map,
  Plus,
  Save,
  Sparkles,
  Trash2,
  UserCircle,
  Users,
} from 'lucide-react';

import '../styles/change-workshop.css';
import { useProgress } from '../hooks/useLocalStorage';
import { getOpenAIApiKey } from '../services/awsService';

const INFLUENCE_LEVELS = [
  { value: 'high', label: 'Hoch', color: 'bg-red-100 text-red-700 border-red-200' },
  { value: 'medium', label: 'Mittel', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  { value: 'low', label: 'Niedrig', color: 'bg-slate-100 text-slate-600 border-slate-200' },
];

const SUPPORT_LEVELS = [
  { value: 'champion', label: 'Champion', color: 'bg-emerald-100 text-emerald-700', emoji: '🚀' },
  { value: 'supporter', label: 'Unterstützer', color: 'bg-green-100 text-green-700', emoji: '👍' },
  { value: 'neutral', label: 'Neutral', color: 'bg-slate-100 text-slate-600', emoji: '😐' },
  { value: 'skeptic', label: 'Skeptiker', color: 'bg-amber-100 text-amber-700', emoji: '🤔' },
  { value: 'blocker', label: 'Blocker', color: 'bg-red-100 text-red-700', emoji: '🚫' },
];

const STRATEGY_OPTIONS = [
  { value: 'engage', label: 'Eng einbinden', desc: 'Aktiv in Entscheidungen einbeziehen', color: 'text-violet-700' },
  { value: 'involve', label: 'Beteiligen', desc: 'Bei wichtigen Themen konsultieren', color: 'text-blue-700' },
  { value: 'inform', label: 'Informieren', desc: 'Regelmäßig auf dem Laufenden halten', color: 'text-emerald-700' },
  { value: 'monitor', label: 'Beobachten', desc: 'Im Blick behalten, bei Bedarf reagieren', color: 'text-slate-600' },
];

function newId() {
  return `sh_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function CollapsibleSection({ title, icon: Icon, badge, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="cw-card">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-3 text-left"
      >
        <span className="flex items-center gap-3">
          {Icon && <Icon className="w-5 h-5 text-violet-600 shrink-0" aria-hidden />}
          <span className="font-semibold text-slate-800">{title}</span>
          {badge && <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-medium">{badge}</span>}
        </span>
        <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden />
      </button>
      {open && <div className="mt-4 pt-4 border-t border-slate-200">{children}</div>}
    </div>
  );
}

function StakeholderForm({ stakeholder, onSave, onCancel }) {
  const [form, setForm] = useState({ ...stakeholder });

  const updateField = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const addAction = () => {
    setForm((f) => ({
      ...f,
      actions: [...(f.actions || []), { id: newId(), text: '', owner: '', dueDate: '', done: false }],
    }));
  };

  const updateAction = (id, field, value) => {
    setForm((f) => ({
      ...f,
      actions: f.actions.map((a) => (a.id === id ? { ...a, [field]: value } : a)),
    }));
  };

  const removeAction = (id) => {
    setForm((f) => ({ ...f, actions: f.actions.filter((a) => a.id !== id) }));
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-slate-500 uppercase">Name / Bezeichnung *</span>
          <input
            type="text"
            className="cw-input-text"
            value={form.name || ''}
            onChange={(e) => updateField('name', e.target.value)}
            placeholder="z. B. Max Mustermann, IT-Leitung, Betriebsrat …"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-slate-500 uppercase">Rolle / Position</span>
          <input
            type="text"
            className="cw-input-text"
            value={form.role || ''}
            onChange={(e) => updateField('role', e.target.value)}
            placeholder="z. B. CIO, Abteilungsleiter, Key User …"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-slate-500 uppercase">Abteilung / Bereich</span>
          <input
            type="text"
            className="cw-input-text"
            value={form.department || ''}
            onChange={(e) => updateField('department', e.target.value)}
            placeholder="z. B. IT, Vertrieb, Produktion …"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-slate-500 uppercase">Einfluss</span>
          <select
            className="cw-input-text"
            value={form.influence || 'medium'}
            onChange={(e) => updateField('influence', e.target.value)}
          >
            {INFLUENCE_LEVELS.map((l) => (
              <option key={l.value} value={l.value}>{l.label}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-slate-500 uppercase">Unterstützung</span>
          <select
            className="cw-input-text"
            value={form.support || 'neutral'}
            onChange={(e) => updateField('support', e.target.value)}
          >
            {SUPPORT_LEVELS.map((l) => (
              <option key={l.value} value={l.value}>{l.emoji} {l.label}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-slate-500 uppercase">Strategie</span>
          <select
            className="cw-input-text"
            value={form.strategy || 'inform'}
            onChange={(e) => updateField('strategy', e.target.value)}
          >
            {STRATEGY_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </label>
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-xs font-semibold text-slate-500 uppercase">Interessen & Erwartungen</span>
        <textarea
          className="cw-textarea"
          rows={2}
          value={form.interests || ''}
          onChange={(e) => updateField('interests', e.target.value)}
          placeholder="Was ist dieser Person/Gruppe wichtig? Welche Erwartungen haben sie?"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs font-semibold text-slate-500 uppercase">Bedenken & Risiken</span>
        <textarea
          className="cw-textarea"
          rows={2}
          value={form.concerns || ''}
          onChange={(e) => updateField('concerns', e.target.value)}
          placeholder="Welche Bedenken oder Widerstände könnten auftreten?"
        />
      </label>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-700">Maßnahmen (mit Owner)</span>
          <button
            type="button"
            onClick={addAction}
            className="text-xs text-violet-600 hover:underline inline-flex items-center gap-1"
          >
            <Plus className="w-3 h-3" /> Hinzufügen
          </button>
        </div>
        {(!form.actions || form.actions.length === 0) ? (
          <p className="text-xs text-slate-500 italic">Noch keine Maßnahmen definiert.</p>
        ) : (
          <div className="space-y-2">
            {form.actions.map((action) => (
              <div key={action.id} className="flex flex-wrap items-start gap-2 p-2 rounded-lg bg-white border border-slate-200">
                <button
                  type="button"
                  onClick={() => updateAction(action.id, 'done', !action.done)}
                  className={`mt-1 shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                    action.done ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300'
                  }`}
                >
                  {action.done && <CheckCircle className="w-3 h-3" />}
                </button>
                <input
                  type="text"
                  value={action.text}
                  onChange={(e) => updateAction(action.id, 'text', e.target.value)}
                  placeholder="Maßnahme …"
                  className={`flex-1 min-w-[150px] text-sm bg-transparent border-0 p-0 focus:ring-0 ${action.done ? 'line-through text-slate-500' : ''}`}
                />
                <input
                  type="text"
                  value={action.owner || ''}
                  onChange={(e) => updateAction(action.id, 'owner', e.target.value)}
                  placeholder="Owner"
                  className="w-24 text-xs bg-slate-50 border border-slate-200 rounded px-2 py-1"
                />
                <input
                  type="date"
                  value={action.dueDate || ''}
                  onChange={(e) => updateAction(action.id, 'dueDate', e.target.value)}
                  className="text-xs bg-slate-50 border border-slate-200 rounded px-2 py-1"
                />
                <button
                  type="button"
                  onClick={() => removeAction(action.id)}
                  className="text-slate-400 hover:text-red-500 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-xs font-semibold text-slate-500 uppercase">Notizen</span>
        <textarea
          className="cw-textarea"
          rows={2}
          value={form.notes || ''}
          onChange={(e) => updateField('notes', e.target.value)}
          placeholder="Weitere Hinweise, Kontaktinfos, Historie …"
        />
      </label>

      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel} className="cw-btn cw-btn-ghost cw-btn-compact">
          Abbrechen
        </button>
        <button
          type="button"
          onClick={() => onSave(form)}
          disabled={!form.name?.trim()}
          className="cw-btn cw-btn-primary-solid cw-btn-compact inline-flex items-center gap-2"
        >
          <Save className="w-4 h-4" /> Speichern
        </button>
      </div>
    </div>
  );
}

export default function StakeholderAnalysis() {
  const { progress, isLoading, isSyncing, updateChangeWorkshopKotter } = useProgress();

  const kotter = progress.changeWorkshopKotter || { activeProfileId: null, profiles: {} };
  const { activeProfileId, profiles } = kotter;
  const activeProfile = activeProfileId ? profiles[activeProfileId] : null;

  const stakeholders = useMemo(() => activeProfile?.stakeholders || [], [activeProfile?.stakeholders]);

  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiTips, setAiTips] = useState('');

  const updateStakeholders = useCallback(
    (updater) => {
      updateChangeWorkshopKotter((cw) => {
        const id = cw.activeProfileId;
        const prof = id ? cw.profiles[id] : null;
        if (!id || !prof) return cw;
        const current = prof.stakeholders || [];
        const next = typeof updater === 'function' ? updater(current) : updater;
        return {
          ...cw,
          profiles: {
            ...cw.profiles,
            [id]: {
              ...prof,
              stakeholders: next,
              updatedAt: new Date().toISOString(),
            },
          },
        };
      });
    },
    [updateChangeWorkshopKotter]
  );

  const saveStakeholder = useCallback(
    (sh) => {
      if (!sh.id) {
        sh.id = newId();
        updateStakeholders((list) => [...list, sh]);
      } else {
        updateStakeholders((list) => list.map((s) => (s.id === sh.id ? sh : s)));
      }
      setEditingId(null);
      setShowForm(false);
    },
    [updateStakeholders]
  );

  const deleteStakeholder = useCallback(
    (id) => {
      if (!window.confirm('Stakeholder wirklich löschen?')) return;
      updateStakeholders((list) => list.filter((s) => s.id !== id));
    },
    [updateStakeholders]
  );

  const generateAiStrategy = useCallback(async () => {
    if (stakeholders.length === 0) {
      alert('Bitte zuerst Stakeholder hinzufügen.');
      return;
    }
    setAiLoading(true);
    setAiTips('');
    try {
      const apiKey = await getOpenAIApiKey();
      const key = apiKey || localStorage.getItem('openai-api-key');
      if (!key?.startsWith('sk-')) {
        setAiTips('Kein OpenAI API-Key gefunden.');
        return;
      }

      const shList = stakeholders
        .map((s) => `- ${s.name} (${s.role || 'k.A.'}, ${s.department || 'k.A.'}): Einfluss=${s.influence}, Unterstützung=${s.support}, Strategie=${s.strategy}. Interessen: ${s.interests || 'k.A.'}. Bedenken: ${s.concerns || 'k.A.'}`)
        .join('\n');

      const prompt = `Du bist ein Change-Management-Experte. Analysiere die folgende Stakeholder-Liste und gib konkrete Handlungsempfehlungen.

STAKEHOLDER:
${shList}

Gib für jeden kritischen Stakeholder (Skeptiker/Blocker mit hohem Einfluss) eine spezifische Empfehlung. Formatiere als Bullet-Points, max. 5 Empfehlungen, je 1-2 Sätze.`;

      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
        body: JSON.stringify({
          model: 'gpt-4.1',
          messages: [
            { role: 'system', content: 'Du bist ein erfahrener Change-Management-Berater. Antworte auf Deutsch, kurz und praxisnah.' },
            { role: 'user', content: prompt },
          ],
          temperature: 0.6,
          max_tokens: 600,
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setAiTips(data.choices?.[0]?.message?.content || 'Keine Empfehlungen generiert.');
    } catch (e) {
      setAiTips(`Fehler: ${e?.message}`);
    } finally {
      setAiLoading(false);
    }
  }, [stakeholders]);

  const matrixData = useMemo(() => {
    const matrix = {
      high: { champion: [], supporter: [], neutral: [], skeptic: [], blocker: [] },
      medium: { champion: [], supporter: [], neutral: [], skeptic: [], blocker: [] },
      low: { champion: [], supporter: [], neutral: [], skeptic: [], blocker: [] },
    };
    stakeholders.forEach((s) => {
      const inf = s.influence || 'medium';
      const sup = s.support || 'neutral';
      if (matrix[inf] && matrix[inf][sup]) {
        matrix[inf][sup].push(s);
      }
    });
    return matrix;
  }, [stakeholders]);

  if (isLoading) {
    return (
      <div className="cw-workshop min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
      </div>
    );
  }

  const editingStakeholder = editingId ? stakeholders.find((s) => s.id === editingId) : null;

  return (
    <div className="cw-workshop min-h-screen relative">
      <div className="cw-workshop-page-bg" aria-hidden />
      <div className="cw-workshop-page-overlay" aria-hidden />

      <header className="cw-wh-header border-b border-slate-200/80">
        <div className="cw-container cw-wh-top flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between py-3">
          <div className="flex flex-wrap items-center gap-3">
            <Link to="/change-workflow" className="cw-btn cw-btn-ghost cw-btn-compact inline-flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" aria-hidden />
              Workshop
            </Link>
            <span className="cw-kicker flex items-center gap-2">
              <Users className="w-4 h-4" aria-hidden />
              Stakeholder-Analyse
            </span>
          </div>
          <div className="flex items-center gap-2">
            {isSyncing && (
              <span className="inline-flex items-center gap-1.5 text-sm text-slate-600">
                <Loader2 className="w-4 h-4 animate-spin text-violet-600" aria-hidden />
                Speichern…
              </span>
            )}
            <Link to="/change-workflow/comms-plan" className="cw-btn cw-btn-accent-outline cw-btn-compact">
              → Kommunikationsplan
            </Link>
          </div>
        </div>
      </header>

      <main className="cw-container py-8 max-w-5xl space-y-6">
        {!activeProfile ? (
          <div className="cw-card text-center py-8">
            <Users className="w-10 h-10 mx-auto text-slate-400 mb-4" aria-hidden />
            <p className="text-slate-600">
              Kein Kundenpaket aktiv. Bitte zuerst im{' '}
              <Link to="/change-workflow/kotter/dringlichkeit" className="text-violet-600 underline">Workshop</Link>{' '}
              ein Paket anlegen.
            </p>
          </div>
        ) : (
          <>
            <div className="cw-card bg-gradient-to-br from-violet-50/80 to-white">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-xl font-bold text-slate-800 m-0 mb-1">{activeProfile.customerLabel || 'Stakeholder-Analyse'}</h1>
                  <p className="text-sm text-slate-600 m-0">{stakeholders.length} Stakeholder erfasst</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => { setEditingId(null); setShowForm(true); }}
                    className="cw-btn cw-btn-primary-solid cw-btn-compact inline-flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> Stakeholder hinzufügen
                  </button>
                  <button
                    type="button"
                    onClick={generateAiStrategy}
                    disabled={aiLoading || stakeholders.length === 0}
                    className="cw-btn cw-btn-accent-outline cw-btn-compact inline-flex items-center gap-2"
                  >
                    {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    KI-Empfehlungen
                  </button>
                </div>
              </div>
            </div>

            {(showForm || editingId) && (
              <div className="cw-card">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">
                  {editingId ? 'Stakeholder bearbeiten' : 'Neuer Stakeholder'}
                </h2>
                <StakeholderForm
                  stakeholder={editingStakeholder || { influence: 'medium', support: 'neutral', strategy: 'inform', actions: [] }}
                  onSave={saveStakeholder}
                  onCancel={() => { setEditingId(null); setShowForm(false); }}
                />
              </div>
            )}

            {aiTips && (
              <div className="cw-card border-violet-200 bg-violet-50/50">
                <div className="flex items-start gap-3">
                  <Bot className="w-5 h-5 text-violet-600 shrink-0 mt-0.5" aria-hidden />
                  <div>
                    <p className="font-semibold text-violet-700 m-0 mb-2">KI-Empfehlungen</p>
                    <div className="text-sm text-slate-700 whitespace-pre-wrap">{aiTips}</div>
                  </div>
                </div>
              </div>
            )}

            <CollapsibleSection title="Einfluss-Unterstützungs-Matrix" icon={Map} defaultOpen>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr>
                      <th className="p-2 text-left text-xs font-semibold text-slate-500 w-20"></th>
                      {SUPPORT_LEVELS.map((sup) => (
                        <th key={sup.value} className="p-2 text-center text-xs font-semibold text-slate-600 min-w-[100px]">
                          {sup.emoji} {sup.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {INFLUENCE_LEVELS.map((inf) => (
                      <tr key={inf.value}>
                        <td className={`p-2 text-xs font-semibold rounded-l-lg ${inf.color}`}>
                          {inf.label}
                        </td>
                        {SUPPORT_LEVELS.map((sup) => {
                          const items = matrixData[inf.value]?.[sup.value] || [];
                          const isHighRisk = inf.value === 'high' && (sup.value === 'skeptic' || sup.value === 'blocker');
                          return (
                            <td
                              key={sup.value}
                              className={`p-2 border border-slate-200 align-top min-h-[60px] ${
                                isHighRisk ? 'bg-red-50' : items.length > 0 ? 'bg-slate-50' : ''
                              }`}
                            >
                              <div className="space-y-1">
                                {items.map((s) => (
                                  <button
                                    key={s.id}
                                    onClick={() => setEditingId(s.id)}
                                    className="w-full text-left text-xs px-2 py-1 rounded bg-white border border-slate-200 hover:border-violet-300 hover:bg-violet-50 transition-colors truncate"
                                    title={`${s.name} - Klicken zum Bearbeiten`}
                                  >
                                    {s.name}
                                  </button>
                                ))}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-slate-500 mt-3">
                <span className="inline-block w-3 h-3 bg-red-50 border border-red-200 rounded mr-1"></span>
                Kritische Zone: Hoher Einfluss + Skeptiker/Blocker = Priorität für Engagement
              </p>
            </CollapsibleSection>

            <CollapsibleSection title="Alle Stakeholder" icon={UserCircle} badge={`${stakeholders.length}`} defaultOpen>
              {stakeholders.length === 0 ? (
                <p className="text-sm text-slate-500 italic">
                  Noch keine Stakeholder erfasst. Klicke «Stakeholder hinzufügen» um zu beginnen.
                </p>
              ) : (
                <div className="space-y-3">
                  {stakeholders.map((s) => {
                    const infLevel = INFLUENCE_LEVELS.find((l) => l.value === s.influence) || INFLUENCE_LEVELS[1];
                    const supLevel = SUPPORT_LEVELS.find((l) => l.value === s.support) || SUPPORT_LEVELS[2];
                    const strategy = STRATEGY_OPTIONS.find((o) => o.value === s.strategy) || STRATEGY_OPTIONS[2];
                    const actionsDone = (s.actions || []).filter((a) => a.done).length;
                    const actionsTotal = (s.actions || []).length;

                    return (
                      <div key={s.id} className="rounded-xl border border-slate-200 bg-white p-4">
                        <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                          <div>
                            <p className="font-semibold text-slate-800 m-0">{s.name}</p>
                            <p className="text-xs text-slate-500 m-0">
                              {[s.role, s.department].filter(Boolean).join(' · ') || 'Keine Details'}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full border ${infLevel.color}`}>
                              Einfluss: {infLevel.label}
                            </span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${supLevel.color}`}>
                              {supLevel.emoji} {supLevel.label}
                            </span>
                            <span className={`text-[10px] font-medium ${strategy.color}`}>
                              → {strategy.label}
                            </span>
                          </div>
                        </div>

                        {(s.interests || s.concerns) && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3 text-xs">
                            {s.interests && (
                              <div className="bg-slate-50 rounded-lg p-2">
                                <p className="font-semibold text-slate-600 m-0 mb-1">Interessen</p>
                                <p className="text-slate-700 m-0">{s.interests}</p>
                              </div>
                            )}
                            {s.concerns && (
                              <div className="bg-amber-50 rounded-lg p-2">
                                <p className="font-semibold text-amber-700 m-0 mb-1">Bedenken</p>
                                <p className="text-slate-700 m-0">{s.concerns}</p>
                              </div>
                            )}
                          </div>
                        )}

                        {actionsTotal > 0 && (
                          <div className="text-xs text-slate-600 mb-3">
                            <span className="font-medium">Maßnahmen:</span> {actionsDone}/{actionsTotal} erledigt
                            {(s.actions || []).slice(0, 2).map((a) => (
                              <span key={a.id} className={`ml-2 ${a.done ? 'line-through text-slate-400' : ''}`}>
                                • {a.text.slice(0, 30)}{a.text.length > 30 ? '…' : ''} {a.owner && `(${a.owner})`}
                              </span>
                            ))}
                            {actionsTotal > 2 && <span className="ml-1 text-slate-400">+{actionsTotal - 2} mehr</span>}
                          </div>
                        )}

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingId(s.id)}
                            className="text-xs text-violet-600 hover:underline inline-flex items-center gap-1"
                          >
                            <Edit3 className="w-3 h-3" /> Bearbeiten
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteStakeholder(s.id)}
                            className="text-xs text-red-600 hover:underline inline-flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" /> Löschen
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CollapsibleSection>
          </>
        )}
      </main>
    </div>
  );
}
