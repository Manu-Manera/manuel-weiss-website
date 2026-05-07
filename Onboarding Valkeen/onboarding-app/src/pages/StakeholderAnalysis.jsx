import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowUpDown,
  Bot,
  CheckCircle,
  ChevronDown,
  Circle,
  Copy,
  Edit3,
  ExternalLink,
  FileDown,
  Filter,
  History,
  Lightbulb,
  Link2,
  Loader2,
  Map,
  MessageSquare,
  Plus,
  Save,
  Search,
  Share2,
  Sparkles,
  Target,
  Trash2,
  TrendingDown,
  TrendingUp,
  UserCircle,
  UserPlus,
  Users,
} from 'lucide-react';

import '../styles/change-workshop.css';
import { useProgress } from '../hooks/useLocalStorage';
import { getOpenAIApiKey, saveProgress, loadProgress } from '../services/awsService';
import { KOTTER_CATALOG_ITEMS } from '../data/kotterCatalogData';

const INFLUENCE_LEVELS = [
  { value: 'high', label: 'Hoch', color: 'bg-red-100 text-red-700 border-red-200', score: 3 },
  { value: 'medium', label: 'Mittel', color: 'bg-amber-100 text-amber-700 border-amber-200', score: 2 },
  { value: 'low', label: 'Niedrig', color: 'bg-slate-100 text-slate-600 border-slate-200', score: 1 },
];

const SUPPORT_LEVELS = [
  { value: 'champion', label: 'Champion', color: 'bg-emerald-100 text-emerald-700', emoji: '🚀', score: 2 },
  { value: 'supporter', label: 'Unterstützer', color: 'bg-green-100 text-green-700', emoji: '👍', score: 1 },
  { value: 'neutral', label: 'Neutral', color: 'bg-slate-100 text-slate-600', emoji: '😐', score: 0 },
  { value: 'skeptic', label: 'Skeptiker', color: 'bg-amber-100 text-amber-700', emoji: '🤔', score: -1 },
  { value: 'blocker', label: 'Blocker', color: 'bg-red-100 text-red-700', emoji: '🚫', score: -2 },
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

function stakeholderShareUserId(token) {
  return `stakeholder-share-${token}`;
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

function StakeholderForm({ stakeholder, kotterItems, onSave, onCancel }) {
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

  const addComment = () => {
    const text = window.prompt('Kommentar hinzufügen:');
    if (!text?.trim()) return;
    setForm((f) => ({
      ...f,
      comments: [...(f.comments || []), { id: newId(), text, createdAt: new Date().toISOString() }],
    }));
  };

  const toggleKotterPhase = (slug) => {
    setForm((f) => {
      const current = f.kotterPhases || [];
      if (current.includes(slug)) {
        return { ...f, kotterPhases: current.filter((s) => s !== slug) };
      }
      return { ...f, kotterPhases: [...current, slug] };
    });
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
            onChange={(e) => {
              const oldSupport = form.support || 'neutral';
              const newSupport = e.target.value;
              if (oldSupport !== newSupport) {
                const history = form.supportHistory || [];
                history.push({ from: oldSupport, to: newSupport, date: new Date().toISOString() });
                setForm((f) => ({ ...f, support: newSupport, supportHistory: history }));
              }
            }}
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

      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold text-slate-500 uppercase">Relevante Kotter-Phasen</span>
        <div className="flex flex-wrap gap-2">
          {kotterItems.map((k) => {
            const isSelected = (form.kotterPhases || []).includes(k.slug);
            return (
              <button
                key={k.slug}
                type="button"
                onClick={() => toggleKotterPhase(k.slug)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                  isSelected
                    ? 'bg-violet-100 border-violet-300 text-violet-700'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-violet-300'
                }`}
              >
                {isSelected && <CheckCircle className="w-3 h-3 inline mr-1" />}
                {k.order}. {k.label}
              </button>
            );
          })}
        </div>
      </div>

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

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-700">Kommentare / Notizen</span>
          <button
            type="button"
            onClick={addComment}
            className="text-xs text-violet-600 hover:underline inline-flex items-center gap-1"
          >
            <MessageSquare className="w-3 h-3" /> Kommentar
          </button>
        </div>
        <textarea
          className="cw-textarea text-sm"
          rows={2}
          value={form.notes || ''}
          onChange={(e) => updateField('notes', e.target.value)}
          placeholder="Allgemeine Notizen …"
        />
        {(form.comments || []).length > 0 && (
          <div className="space-y-2 pt-2 border-t border-slate-200">
            {form.comments.map((c) => (
              <div key={c.id} className="text-xs bg-white rounded-lg p-2 border border-slate-200">
                <p className="text-slate-700 m-0">{c.text}</p>
                <p className="text-slate-400 m-0 mt-1">{new Date(c.createdAt).toLocaleString('de-CH')}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {(form.supportHistory || []).length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-xs font-semibold text-amber-700 mb-2 flex items-center gap-1">
            <History className="w-3.5 h-3.5" /> Sentiment-Verlauf
          </p>
          <div className="flex flex-wrap gap-2">
            {form.supportHistory.map((h, i) => {
              const fromL = SUPPORT_LEVELS.find((l) => l.value === h.from);
              const toL = SUPPORT_LEVELS.find((l) => l.value === h.to);
              const improved = (toL?.score || 0) > (fromL?.score || 0);
              return (
                <span key={i} className="text-[10px] text-slate-600 inline-flex items-center gap-1">
                  {fromL?.emoji} → {toL?.emoji}
                  {improved ? <TrendingUp className="w-3 h-3 text-emerald-600" /> : <TrendingDown className="w-3 h-3 text-red-600" />}
                  <span className="text-slate-400">({new Date(h.date).toLocaleDateString('de-CH')})</span>
                </span>
              );
            })}
          </div>
        </div>
      )}

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

function RiskScoreCard({ stakeholders }) {
  const { score, level, details } = useMemo(() => {
    if (stakeholders.length === 0) return { score: 0, level: 'none', details: '' };

    let totalRisk = 0;
    let criticalCount = 0;
    let highInfluenceNegative = 0;

    stakeholders.forEach((s) => {
      const inf = INFLUENCE_LEVELS.find((l) => l.value === s.influence);
      const sup = SUPPORT_LEVELS.find((l) => l.value === s.support);
      const infScore = inf?.score || 2;
      const supScore = sup?.score || 0;

      if (supScore < 0) {
        totalRisk += infScore * Math.abs(supScore);
        if (infScore === 3 && supScore <= -1) {
          criticalCount++;
          highInfluenceNegative++;
        }
      }
    });

    const maxRisk = stakeholders.length * 6;
    const riskPercent = maxRisk > 0 ? (totalRisk / maxRisk) * 100 : 0;

    let level = 'low';
    if (riskPercent > 40 || criticalCount >= 2) level = 'high';
    else if (riskPercent > 20 || criticalCount >= 1) level = 'medium';

    return {
      score: Math.round(riskPercent),
      level,
      details: `${criticalCount} kritische Stakeholder, ${highInfluenceNegative} mit hohem Einfluss & negativer Haltung`,
    };
  }, [stakeholders]);

  if (stakeholders.length === 0) return null;

  const levelColors = {
    low: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    medium: 'bg-amber-100 text-amber-700 border-amber-200',
    high: 'bg-red-100 text-red-700 border-red-200',
  };

  const levelLabels = { low: 'Niedrig', medium: 'Mittel', high: 'Hoch' };

  return (
    <div className={`rounded-xl border p-4 ${levelColors[level]}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Risiko-Score
        </span>
        <span className="text-2xl font-bold">{score}%</span>
      </div>
      <div className="w-full bg-white/50 rounded-full h-2 mb-2">
        <div
          className={`h-2 rounded-full ${level === 'high' ? 'bg-red-500' : level === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'}`}
          style={{ width: `${Math.min(score, 100)}%` }}
        />
      </div>
      <p className="text-xs m-0">
        <span className="font-semibold">Risikostufe: {levelLabels[level]}</span> — {details}
      </p>
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
  const [aiSuggestLoading, setAiSuggestLoading] = useState(false);
  const [aiTips, setAiTips] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterInfluence, setFilterInfluence] = useState('all');
  const [filterSupport, setFilterSupport] = useState('all');
  const [shareBusy, setShareBusy] = useState(false);
  const [shareHint, setShareHint] = useState('');
  const [pdfBusy, setPdfBusy] = useState(false);

  useEffect(() => {
    if (!shareHint) return;
    const t = setTimeout(() => setShareHint(''), 4000);
    return () => clearTimeout(t);
  }, [shareHint]);

  const filteredStakeholders = useMemo(() => {
    return stakeholders.filter((s) => {
      if (searchTerm && !s.name?.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !s.role?.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !s.department?.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      if (filterInfluence !== 'all' && s.influence !== filterInfluence) return false;
      if (filterSupport !== 'all' && s.support !== filterSupport) return false;
      return true;
    });
  }, [stakeholders, searchTerm, filterInfluence, filterSupport]);

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

  const updateProfile = useCallback(
    (updater) => {
      updateChangeWorkshopKotter((cw) => {
        const id = cw.activeProfileId;
        const prof = id ? cw.profiles[id] : null;
        if (!id || !prof) return cw;
        const next = typeof updater === 'function' ? updater(prof) : updater;
        return {
          ...cw,
          profiles: { ...cw.profiles, [id]: { ...next, updatedAt: new Date().toISOString() } },
        };
      });
    },
    [updateChangeWorkshopKotter]
  );

  const saveStakeholder = useCallback(
    (sh) => {
      if (!sh.id) {
        sh.id = newId();
        sh.createdAt = new Date().toISOString();
        updateStakeholders((list) => [...list, sh]);
      } else {
        updateStakeholders((list) => list.map((s) => (s.id === sh.id ? { ...sh, updatedAt: new Date().toISOString() } : s)));
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

  const generateAiSuggestions = useCallback(async () => {
    setAiSuggestLoading(true);
    try {
      const apiKey = await getOpenAIApiKey();
      const key = apiKey || localStorage.getItem('openai-api-key');
      if (!key?.startsWith('sk-')) {
        alert('Kein OpenAI API-Key gefunden.');
        return;
      }

      const existingNames = stakeholders.map((s) => s.name).join(', ') || 'keine';
      const projectContext = activeProfile?.customerLabel || 'Change-Projekt';

      const prompt = `Du bist ein Change-Management-Experte. Schlage typische Stakeholder-Gruppen für ein Change-Projekt vor.

PROJEKT: ${projectContext}
BEREITS ERFASST: ${existingNames}

Schlage 5 zusätzliche typische Stakeholder-Gruppen vor, die noch fehlen könnten. Format als JSON-Array:
[
  {
    "name": "Gruppenname",
    "role": "typische Rolle",
    "department": "Bereich",
    "influence": "high|medium|low",
    "support": "champion|supporter|neutral|skeptic|blocker",
    "strategy": "engage|involve|inform|monitor",
    "interests": "typische Interessen",
    "concerns": "typische Bedenken"
  }
]`;

      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
        body: JSON.stringify({
          model: 'gpt-4.1',
          messages: [
            { role: 'system', content: 'Du bist ein Stakeholder-Experte. Antworte ausschließlich mit validem JSON.' },
            { role: 'user', content: prompt },
          ],
          temperature: 0.7,
          max_tokens: 1000,
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const content = data.choices?.[0]?.message?.content || '';
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error('Keine JSON-Antwort erhalten');

      const suggestions = JSON.parse(jsonMatch[0]);
      const newShs = suggestions.map((s) => ({
        id: newId(),
        name: s.name,
        role: s.role || '',
        department: s.department || '',
        influence: s.influence || 'medium',
        support: s.support || 'neutral',
        strategy: s.strategy || 'inform',
        interests: s.interests || '',
        concerns: s.concerns || '',
        actions: [],
        comments: [],
        notes: '(KI-Vorschlag)',
        createdAt: new Date().toISOString(),
      }));

      updateStakeholders((list) => [...list, ...newShs]);
      alert(`${newShs.length} Stakeholder-Vorschläge hinzugefügt.`);
    } catch (e) {
      alert(`Fehler: ${e?.message}`);
    } finally {
      setAiSuggestLoading(false);
    }
  }, [stakeholders, activeProfile?.customerLabel, updateStakeholders]);

  const createShareLink = useCallback(async () => {
    setShareBusy(true);
    try {
      let token = activeProfile?.stakeholderShareToken;
      if (!token) {
        token = crypto.randomUUID();
        updateProfile((p) => ({ ...p, stakeholderShareToken: token }));
      }
      const blob = {
        stakeholders,
        customerLabel: activeProfile?.customerLabel,
        sharedAt: new Date().toISOString(),
      };
      await saveProgress(stakeholderShareUserId(token), { stakeholderShare: blob });
      const url = `${window.location.origin}/onboarding/stakeholder-share/${token}`;
      await navigator.clipboard.writeText(url);
      setShareHint('Link kopiert!');
    } catch (e) {
      setShareHint(`Fehler: ${e?.message}`);
    } finally {
      setShareBusy(false);
    }
  }, [activeProfile, stakeholders, updateProfile]);

  const exportPdf = useCallback(async () => {
    setPdfBusy(true);
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({ unit: 'mm', format: 'a4' });
      const pageW = doc.internal.pageSize.getWidth();
      let y = 20;

      doc.setFontSize(18);
      doc.text('Stakeholder-Analyse', 14, y);
      y += 10;
      doc.setFontSize(10);
      doc.text(activeProfile?.customerLabel || 'Change-Projekt', 14, y);
      y += 8;
      doc.text(`Erstellt: ${new Date().toLocaleDateString('de-CH')}`, 14, y);
      y += 12;

      doc.setFontSize(12);
      doc.text('Übersicht', 14, y);
      y += 6;
      doc.setFontSize(9);

      stakeholders.forEach((s) => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        const inf = INFLUENCE_LEVELS.find((l) => l.value === s.influence)?.label || s.influence;
        const sup = SUPPORT_LEVELS.find((l) => l.value === s.support)?.label || s.support;
        const strat = STRATEGY_OPTIONS.find((o) => o.value === s.strategy)?.label || s.strategy;
        doc.text(`• ${s.name} (${s.role || '-'}, ${s.department || '-'})`, 14, y);
        y += 4;
        doc.text(`  Einfluss: ${inf} | Unterstützung: ${sup} | Strategie: ${strat}`, 14, y);
        y += 4;
        if (s.interests) {
          doc.text(`  Interessen: ${s.interests.slice(0, 80)}${s.interests.length > 80 ? '…' : ''}`, 14, y);
          y += 4;
        }
        if (s.concerns) {
          doc.text(`  Bedenken: ${s.concerns.slice(0, 80)}${s.concerns.length > 80 ? '…' : ''}`, 14, y);
          y += 4;
        }
        y += 3;
      });

      doc.save(`Stakeholder-Analyse_${activeProfile?.customerLabel || 'Export'}.pdf`);
    } catch (e) {
      alert(`PDF-Export fehlgeschlagen: ${e?.message}`);
    } finally {
      setPdfBusy(false);
    }
  }, [stakeholders, activeProfile]);

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

  const moveStakeholder = useCallback((id, newInfluence, newSupport) => {
    updateStakeholders((list) =>
      list.map((s) => {
        if (s.id !== id) return s;
        const history = s.supportHistory || [];
        if (s.support !== newSupport) {
          history.push({ from: s.support, to: newSupport, date: new Date().toISOString() });
        }
        return { ...s, influence: newInfluence, support: newSupport, supportHistory: history };
      })
    );
  }, [updateStakeholders]);

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

      <main className="cw-container py-8 max-w-6xl space-y-6">
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
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
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
                    <Plus className="w-4 h-4" /> Hinzufügen
                  </button>
                  <button
                    type="button"
                    onClick={generateAiSuggestions}
                    disabled={aiSuggestLoading}
                    className="cw-btn cw-btn-accent-outline cw-btn-compact inline-flex items-center gap-2"
                  >
                    {aiSuggestLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                    KI-Vorschläge
                  </button>
                  <button
                    type="button"
                    onClick={generateAiStrategy}
                    disabled={aiLoading || stakeholders.length === 0}
                    className="cw-btn cw-btn-accent-outline cw-btn-compact inline-flex items-center gap-2"
                  >
                    {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    KI-Strategie
                  </button>
                  <button
                    type="button"
                    onClick={exportPdf}
                    disabled={pdfBusy || stakeholders.length === 0}
                    className="cw-btn cw-btn-ghost cw-btn-compact inline-flex items-center gap-2"
                  >
                    {pdfBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
                    PDF
                  </button>
                  <button
                    type="button"
                    onClick={createShareLink}
                    disabled={shareBusy}
                    className="cw-btn cw-btn-ghost cw-btn-compact inline-flex items-center gap-2"
                  >
                    {shareBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />}
                    Teilen
                  </button>
                </div>
              </div>
              {shareHint && (
                <p className="text-xs text-emerald-600 mt-2 m-0">{shareHint}</p>
              )}
            </div>

            <RiskScoreCard stakeholders={stakeholders} />

            <div className="cw-card">
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    className="cw-input-text pl-9"
                    placeholder="Suchen nach Name, Rolle, Abteilung …"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <select
                  className="cw-input-text w-auto"
                  value={filterInfluence}
                  onChange={(e) => setFilterInfluence(e.target.value)}
                >
                  <option value="all">Alle Einfluss</option>
                  {INFLUENCE_LEVELS.map((l) => (
                    <option key={l.value} value={l.value}>{l.label}</option>
                  ))}
                </select>
                <select
                  className="cw-input-text w-auto"
                  value={filterSupport}
                  onChange={(e) => setFilterSupport(e.target.value)}
                >
                  <option value="all">Alle Unterstützung</option>
                  {SUPPORT_LEVELS.map((l) => (
                    <option key={l.value} value={l.value}>{l.emoji} {l.label}</option>
                  ))}
                </select>
                {(searchTerm || filterInfluence !== 'all' || filterSupport !== 'all') && (
                  <button
                    type="button"
                    onClick={() => { setSearchTerm(''); setFilterInfluence('all'); setFilterSupport('all'); }}
                    className="text-xs text-violet-600 hover:underline"
                  >
                    Filter zurücksetzen
                  </button>
                )}
              </div>
            </div>

            {(showForm || editingId) && (
              <div className="cw-card">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">
                  {editingId ? 'Stakeholder bearbeiten' : 'Neuer Stakeholder'}
                </h2>
                <StakeholderForm
                  stakeholder={editingStakeholder || { influence: 'medium', support: 'neutral', strategy: 'inform', actions: [], comments: [], kotterPhases: [] }}
                  kotterItems={KOTTER_CATALOG_ITEMS}
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
                    <p className="font-semibold text-violet-700 m-0 mb-2">KI-Strategie-Empfehlungen</p>
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
                                  <div key={s.id} className="group relative">
                                    <button
                                      onClick={() => setEditingId(s.id)}
                                      className="w-full text-left text-xs px-2 py-1 rounded bg-white border border-slate-200 hover:border-violet-300 hover:bg-violet-50 transition-colors truncate"
                                      title={`${s.name} - Klicken zum Bearbeiten`}
                                    >
                                      {s.name}
                                    </button>
                                    <select
                                      className="absolute right-0 top-0 w-5 h-full opacity-0 cursor-pointer"
                                      value={`${s.influence}|${s.support}`}
                                      onChange={(e) => {
                                        const [newInf, newSup] = e.target.value.split('|');
                                        moveStakeholder(s.id, newInf, newSup);
                                      }}
                                      title="In andere Zelle verschieben"
                                    >
                                      {INFLUENCE_LEVELS.map((i) =>
                                        SUPPORT_LEVELS.map((sp) => (
                                          <option key={`${i.value}|${sp.value}`} value={`${i.value}|${sp.value}`}>
                                            {i.label} / {sp.label}
                                          </option>
                                        ))
                                      )}
                                    </select>
                                  </div>
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
                Kritische Zone: Hoher Einfluss + Skeptiker/Blocker = Priorität für Engagement.
                <span className="ml-2">Tipp: Per Dropdown verschieben für Sentiment-Tracking.</span>
              </p>
            </CollapsibleSection>

            <CollapsibleSection title="Alle Stakeholder" icon={UserCircle} badge={`${filteredStakeholders.length}/${stakeholders.length}`} defaultOpen>
              {filteredStakeholders.length === 0 ? (
                <p className="text-sm text-slate-500 italic">
                  {stakeholders.length === 0
                    ? 'Noch keine Stakeholder erfasst. Klicke «Hinzufügen» oder «KI-Vorschläge» um zu beginnen.'
                    : 'Keine Stakeholder entsprechen den Filterkriterien.'}
                </p>
              ) : (
                <div className="space-y-3">
                  {filteredStakeholders.map((s) => {
                    const infLevel = INFLUENCE_LEVELS.find((l) => l.value === s.influence) || INFLUENCE_LEVELS[1];
                    const supLevel = SUPPORT_LEVELS.find((l) => l.value === s.support) || SUPPORT_LEVELS[2];
                    const strategy = STRATEGY_OPTIONS.find((o) => o.value === s.strategy) || STRATEGY_OPTIONS[2];
                    const actionsDone = (s.actions || []).filter((a) => a.done).length;
                    const actionsTotal = (s.actions || []).length;
                    const linkedKotter = (s.kotterPhases || []).length;
                    const hasHistory = (s.supportHistory || []).length > 0;

                    return (
                      <div key={s.id} className="rounded-xl border border-slate-200 bg-white p-4">
                        <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                          <div>
                            <p className="font-semibold text-slate-800 m-0 flex items-center gap-2">
                              {s.name}
                              {hasHistory && (
                                <History className="w-3.5 h-3.5 text-amber-500" title="Sentiment-Verlauf vorhanden" />
                              )}
                            </p>
                            <p className="text-xs text-slate-500 m-0">
                              {[s.role, s.department].filter(Boolean).join(' · ') || 'Keine Details'}
                            </p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full border ${infLevel.color}`}>
                              Einfluss: {infLevel.label}
                            </span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${supLevel.color}`}>
                              {supLevel.emoji} {supLevel.label}
                            </span>
                            <span className={`text-[10px] font-medium ${strategy.color}`}>
                              → {strategy.label}
                            </span>
                            {linkedKotter > 0 && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-100 text-violet-700">
                                <Target className="w-3 h-3 inline mr-0.5" />
                                {linkedKotter} Kotter
                              </span>
                            )}
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

                        {(s.comments || []).length > 0 && (
                          <div className="text-xs text-slate-500 mb-3 flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            {s.comments.length} Kommentar{s.comments.length > 1 ? 'e' : ''}
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
