import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Bot,
  Calendar,
  CheckCircle,
  CheckSquare,
  ChevronDown,
  Circle,
  Download,
  Edit3,
  FileSpreadsheet,
  Filter,
  Loader2,
  Megaphone,
  Plus,
  Save,
  Search,
  Sparkles,
  Square,
  Trash2,
  Users,
} from 'lucide-react';

import '../styles/change-workshop.css';
import { useProgress } from '../hooks/useLocalStorage';
import { getOpenAIApiKey } from '../services/awsService';

const CHANNEL_OPTIONS = [
  { value: 'townhall', label: 'Townhall / All-Hands', icon: '🎤' },
  { value: 'workshop', label: 'Workshop', icon: '🛠️' },
  { value: 'meeting', label: 'Team-Meeting', icon: '👥' },
  { value: 'email', label: 'E-Mail / Newsletter', icon: '📧' },
  { value: 'intranet', label: 'Intranet / Wiki', icon: '🌐' },
  { value: 'video', label: 'Video-Botschaft', icon: '🎬' },
  { value: 'chat', label: 'Chat (Teams/Slack)', icon: '💬' },
  { value: '1on1', label: '1:1 Gespräch', icon: '🤝' },
  { value: 'roadshow', label: 'Roadshow', icon: '🚀' },
  { value: 'other', label: 'Sonstiges', icon: '📋' },
];

const FREQUENCY_OPTIONS = [
  { value: 'once', label: 'Einmalig' },
  { value: 'weekly', label: 'Wöchentlich' },
  { value: 'biweekly', label: 'Alle 2 Wochen' },
  { value: 'monthly', label: 'Monatlich' },
  { value: 'quarterly', label: 'Quartalsweise' },
  { value: 'ongoing', label: 'Fortlaufend' },
];

const STATUS_OPTIONS = [
  { value: 'planned', label: 'Geplant', color: 'bg-slate-100 text-slate-600' },
  { value: 'in_progress', label: 'In Vorbereitung', color: 'bg-amber-100 text-amber-700' },
  { value: 'done', label: 'Abgeschlossen', color: 'bg-emerald-100 text-emerald-700' },
];

function newId() {
  return `cp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
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

function CommItemForm({ item, stakeholders, onSave, onCancel }) {
  const [form, setForm] = useState({ ...item });

  const updateField = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const toggleAudience = (shId) => {
    setForm((f) => {
      const current = f.targetAudience || [];
      if (current.includes(shId)) {
        return { ...f, targetAudience: current.filter((id) => id !== shId) };
      }
      return { ...f, targetAudience: [...current, shId] };
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="flex flex-col gap-1 sm:col-span-2">
          <span className="text-xs font-semibold text-slate-500 uppercase">Titel / Maßnahme *</span>
          <input
            type="text"
            className="cw-input-text"
            value={form.title || ''}
            onChange={(e) => updateField('title', e.target.value)}
            placeholder="z. B. Kickoff-Townhall, Wöchentliches Status-Update …"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-slate-500 uppercase">Kanal</span>
          <select
            className="cw-input-text"
            value={form.channel || 'email'}
            onChange={(e) => updateField('channel', e.target.value)}
          >
            {CHANNEL_OPTIONS.map((c) => (
              <option key={c.value} value={c.value}>{c.icon} {c.label}</option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-slate-500 uppercase">Frequenz</span>
          <select
            className="cw-input-text"
            value={form.frequency || 'once'}
            onChange={(e) => updateField('frequency', e.target.value)}
          >
            {FREQUENCY_OPTIONS.map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-slate-500 uppercase">Datum / Zeitraum</span>
          <input
            type="text"
            className="cw-input-text"
            value={form.timing || ''}
            onChange={(e) => updateField('timing', e.target.value)}
            placeholder="z. B. KW 20, vor Go-Live, Q3 …"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-slate-500 uppercase">Verantwortlicher (Owner) *</span>
          <input
            type="text"
            className="cw-input-text"
            value={form.owner || ''}
            onChange={(e) => updateField('owner', e.target.value)}
            placeholder="Name oder Rolle …"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-slate-500 uppercase">Status</span>
          <select
            className="cw-input-text"
            value={form.status || 'planned'}
            onChange={(e) => updateField('status', e.target.value)}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-slate-500 uppercase">Fälligkeitsdatum</span>
          <input
            type="date"
            className="cw-input-text"
            value={form.dueDate || ''}
            onChange={(e) => updateField('dueDate', e.target.value)}
          />
        </label>
      </div>

      {stakeholders.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold text-slate-500 uppercase">Zielgruppe (Stakeholder)</span>
          <div className="flex flex-wrap gap-2">
            {stakeholders.map((sh) => {
              const isSelected = (form.targetAudience || []).includes(sh.id);
              return (
                <button
                  key={sh.id}
                  type="button"
                  onClick={() => toggleAudience(sh.id)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                    isSelected
                      ? 'bg-violet-100 border-violet-300 text-violet-700'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-violet-300'
                  }`}
                >
                  {isSelected && <CheckCircle className="w-3 h-3 inline mr-1" />}
                  {sh.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <label className="flex flex-col gap-1">
        <span className="text-xs font-semibold text-slate-500 uppercase">Kernbotschaft</span>
        <textarea
          className="cw-textarea"
          rows={3}
          value={form.keyMessage || ''}
          onChange={(e) => updateField('keyMessage', e.target.value)}
          placeholder="Die zentrale Botschaft, die vermittelt werden soll …"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs font-semibold text-slate-500 uppercase">Notizen</span>
        <textarea
          className="cw-textarea"
          rows={2}
          value={form.notes || ''}
          onChange={(e) => updateField('notes', e.target.value)}
          placeholder="Weitere Details, Vorbereitung, Material …"
        />
      </label>

      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel} className="cw-btn cw-btn-ghost cw-btn-compact">
          Abbrechen
        </button>
        <button
          type="button"
          onClick={() => onSave(form)}
          disabled={!form.title?.trim() || !form.owner?.trim()}
          className="cw-btn cw-btn-primary-solid cw-btn-compact inline-flex items-center gap-2"
        >
          <Save className="w-4 h-4" /> Speichern
        </button>
      </div>
    </div>
  );
}

function TimelineView({ items, stakeholders, onEdit }) {
  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      if (a.dueDate && b.dueDate) return new Date(a.dueDate) - new Date(b.dueDate);
      if (a.dueDate) return -1;
      if (b.dueDate) return 1;
      return 0;
    });
  }, [items]);

  const monthGroups = useMemo(() => {
    const groups = {};
    sortedItems.forEach((item) => {
      const key = item.dueDate
        ? new Date(item.dueDate).toLocaleDateString('de-CH', { year: 'numeric', month: 'long' })
        : 'Ohne Datum';
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });
    return groups;
  }, [sortedItems]);

  return (
    <div className="space-y-6">
      {Object.entries(monthGroups).map(([month, monthItems]) => (
        <div key={month}>
          <h3 className="text-sm font-semibold text-slate-700 mb-3 sticky top-0 bg-white py-1">{month}</h3>
          <div className="relative pl-6 border-l-2 border-violet-200 space-y-4">
            {monthItems.map((item) => {
              const channel = CHANNEL_OPTIONS.find((c) => c.value === item.channel) || CHANNEL_OPTIONS[0];
              const status = STATUS_OPTIONS.find((s) => s.value === item.status) || STATUS_OPTIONS[0];
              const audiences = (item.targetAudience || [])
                .map((id) => stakeholders.find((s) => s.id === id)?.name)
                .filter(Boolean);

              return (
                <div
                  key={item.id}
                  className="relative bg-white rounded-lg border border-slate-200 p-3 hover:border-violet-300 transition-colors cursor-pointer"
                  onClick={() => onEdit(item.id)}
                >
                  <div className="absolute -left-[31px] top-3 w-4 h-4 rounded-full border-2 border-violet-300 bg-white flex items-center justify-center">
                    {item.status === 'done' && <div className="w-2 h-2 rounded-full bg-emerald-500" />}
                    {item.status === 'in_progress' && <div className="w-2 h-2 rounded-full bg-amber-500" />}
                  </div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{channel.icon}</span>
                      <span className="font-medium text-slate-800">{item.title}</span>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${status.color}`}>
                      {status.label}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                    {item.dueDate && (
                      <span>{new Date(item.dueDate).toLocaleDateString('de-CH')}</span>
                    )}
                    <span>·</span>
                    <span className="text-violet-600 font-medium">{item.owner}</span>
                    {audiences.length > 0 && (
                      <>
                        <span>·</span>
                        <span>{audiences.slice(0, 2).join(', ')}{audiences.length > 2 ? ` +${audiences.length - 2}` : ''}</span>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function CommunicationPlan() {
  const { progress, isLoading, isSyncing, updateChangeWorkshopKotter } = useProgress();

  const kotter = progress.changeWorkshopKotter || { activeProfileId: null, profiles: {} };
  const { activeProfileId, profiles } = kotter;
  const activeProfile = activeProfileId ? profiles[activeProfileId] : null;

  const commsPlan = useMemo(() => activeProfile?.commsPlan || [], [activeProfile?.commsPlan]);
  const stakeholders = useMemo(() => activeProfile?.stakeholders || [], [activeProfile?.stakeholders]);

  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [viewMode, setViewMode] = useState('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterChannel, setFilterChannel] = useState('all');
  const [selectedIds, setSelectedIds] = useState(new Set());

  const filteredItems = useMemo(() => {
    return commsPlan.filter((c) => {
      if (searchTerm && !c.title?.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !c.owner?.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      if (filterStatus !== 'all' && c.status !== filterStatus) return false;
      if (filterChannel !== 'all' && c.channel !== filterChannel) return false;
      return true;
    });
  }, [commsPlan, searchTerm, filterStatus, filterChannel]);

  const updateCommsPlan = useCallback(
    (updater) => {
      updateChangeWorkshopKotter((cw) => {
        const id = cw.activeProfileId;
        const prof = id ? cw.profiles[id] : null;
        if (!id || !prof) return cw;
        const current = prof.commsPlan || [];
        const next = typeof updater === 'function' ? updater(current) : updater;
        return {
          ...cw,
          profiles: {
            ...cw.profiles,
            [id]: {
              ...prof,
              commsPlan: next,
              updatedAt: new Date().toISOString(),
            },
          },
        };
      });
    },
    [updateChangeWorkshopKotter]
  );

  const saveItem = useCallback(
    (item) => {
      if (!item.id) {
        item.id = newId();
        item.createdAt = new Date().toISOString();
        updateCommsPlan((list) => [...list, item]);
      } else {
        updateCommsPlan((list) => list.map((c) => (c.id === item.id ? { ...item, updatedAt: new Date().toISOString() } : c)));
      }
      setEditingId(null);
      setShowForm(false);
    },
    [updateCommsPlan]
  );

  const deleteItem = useCallback(
    (id) => {
      if (!window.confirm('Maßnahme wirklich löschen?')) return;
      updateCommsPlan((list) => list.filter((c) => c.id !== id));
      setSelectedIds((s) => { const n = new Set(s); n.delete(id); return n; });
    },
    [updateCommsPlan]
  );

  const toggleSelect = (id) => {
    setSelectedIds((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === filteredItems.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredItems.map((i) => i.id)));
    }
  };

  const bulkUpdateStatus = (newStatus) => {
    updateCommsPlan((list) =>
      list.map((c) => (selectedIds.has(c.id) ? { ...c, status: newStatus, updatedAt: new Date().toISOString() } : c))
    );
    setSelectedIds(new Set());
  };

  const bulkDelete = () => {
    if (!window.confirm(`${selectedIds.size} Maßnahmen wirklich löschen?`)) return;
    updateCommsPlan((list) => list.filter((c) => !selectedIds.has(c.id)));
    setSelectedIds(new Set());
  };

  const generateAiPlan = useCallback(async () => {
    setAiLoading(true);
    try {
      const apiKey = await getOpenAIApiKey();
      const key = apiKey || localStorage.getItem('openai-api-key');
      if (!key?.startsWith('sk-')) {
        alert('Kein OpenAI API-Key gefunden.');
        return;
      }

      const shList = stakeholders.length > 0
        ? stakeholders.map((s) => `${s.name} (${s.role || 'k.A.'}, Einfluss=${s.influence}, Unterstützung=${s.support})`).join(', ')
        : 'Keine Stakeholder erfasst';

      const existingComms = commsPlan.length > 0
        ? commsPlan.map((c) => `- ${c.title} (${c.channel}, ${c.frequency}, Owner: ${c.owner})`).join('\n')
        : 'Noch keine Maßnahmen definiert';

      const prompt = `Du bist ein Change-Management-Experte. Erstelle einen Kommunikationsplan für ein Veränderungsprojekt.

STAKEHOLDER:
${shList}

BESTEHENDE MAßNAHMEN:
${existingComms}

Schlage 3-5 zusätzliche Kommunikationsmaßnahmen vor, die noch fehlen könnten. Format als JSON-Array:
[
  {
    "title": "Titel",
    "channel": "${CHANNEL_OPTIONS.map((c) => c.value).join('|')}",
    "frequency": "${FREQUENCY_OPTIONS.map((f) => f.value).join('|')}",
    "timing": "Zeitpunkt",
    "owner": "Vorgeschlagene Rolle",
    "keyMessage": "Kernbotschaft"
  }
]`;

      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
        body: JSON.stringify({
          model: 'gpt-4.1',
          messages: [
            { role: 'system', content: 'Du bist ein Kommunikationsexperte. Antworte ausschließlich mit validem JSON.' },
            { role: 'user', content: prompt },
          ],
          temperature: 0.6,
          max_tokens: 800,
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const content = data.choices?.[0]?.message?.content || '';

      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error('Keine JSON-Antwort erhalten');

      const suggestions = JSON.parse(jsonMatch[0]);
      const newItems = suggestions.map((s) => ({
        id: newId(),
        title: s.title,
        channel: s.channel || 'email',
        frequency: s.frequency || 'once',
        timing: s.timing || '',
        owner: s.owner || '',
        keyMessage: s.keyMessage || '',
        status: 'planned',
        targetAudience: [],
        notes: '(KI-generiert)',
        createdAt: new Date().toISOString(),
      }));

      updateCommsPlan((list) => [...list, ...newItems]);
      alert(`${newItems.length} Maßnahmen hinzugefügt.`);
    } catch (e) {
      alert(`Fehler: ${e?.message}`);
    } finally {
      setAiLoading(false);
    }
  }, [stakeholders, commsPlan, updateCommsPlan]);

  const exportExcel = useCallback(async () => {
    try {
      const XLSX = await import('xlsx');
      const rows = commsPlan.map((c) => {
        const channel = CHANNEL_OPTIONS.find((ch) => ch.value === c.channel);
        const freq = FREQUENCY_OPTIONS.find((f) => f.value === c.frequency);
        const status = STATUS_OPTIONS.find((s) => s.value === c.status);
        const audiences = (c.targetAudience || [])
          .map((id) => stakeholders.find((s) => s.id === id)?.name)
          .filter(Boolean)
          .join(', ');
        return {
          Titel: c.title,
          Kanal: channel?.label || c.channel,
          Frequenz: freq?.label || c.frequency,
          Zeitraum: c.timing || '',
          Fälligkeit: c.dueDate || '',
          Owner: c.owner,
          Status: status?.label || c.status,
          Zielgruppe: audiences,
          Kernbotschaft: c.keyMessage || '',
          Notizen: c.notes || '',
        };
      });

      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Kommunikationsplan');
      XLSX.writeFile(wb, `Kommunikationsplan_${activeProfile?.customerLabel || 'Export'}.xlsx`);
    } catch (e) {
      alert(`Excel-Export fehlgeschlagen: ${e?.message}`);
    }
  }, [commsPlan, stakeholders, activeProfile]);

  const exportIcs = useCallback(() => {
    const itemsWithDate = commsPlan.filter((c) => c.dueDate);
    if (itemsWithDate.length === 0) {
      alert('Keine Maßnahmen mit Fälligkeitsdatum vorhanden.');
      return;
    }

    const events = itemsWithDate.map((c) => {
      const dt = c.dueDate.replace(/-/g, '');
      const channel = CHANNEL_OPTIONS.find((ch) => ch.value === c.channel);
      return `BEGIN:VEVENT
DTSTART;VALUE=DATE:${dt}
DTEND;VALUE=DATE:${dt}
SUMMARY:${c.title}
DESCRIPTION:Owner: ${c.owner}\\nKanal: ${channel?.label || c.channel}\\n${c.keyMessage || ''}
STATUS:${c.status === 'done' ? 'COMPLETED' : 'TENTATIVE'}
END:VEVENT`;
    });

    const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Change Workshop//Kommunikationsplan//DE
${events.join('\n')}
END:VCALENDAR`;

    const blob = new Blob([ics], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Kommunikationsplan_${activeProfile?.customerLabel || 'Export'}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  }, [commsPlan, activeProfile]);

  if (isLoading) {
    return (
      <div className="cw-workshop min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
      </div>
    );
  }

  const editingItem = editingId ? commsPlan.find((c) => c.id === editingId) : null;

  const plannedCount = commsPlan.filter((c) => c.status === 'planned').length;
  const inProgressCount = commsPlan.filter((c) => c.status === 'in_progress').length;
  const doneCount = commsPlan.filter((c) => c.status === 'done').length;

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
              <Megaphone className="w-4 h-4" aria-hidden />
              Kommunikationsplan
            </span>
          </div>
          <div className="flex items-center gap-2">
            {isSyncing && (
              <span className="inline-flex items-center gap-1.5 text-sm text-slate-600">
                <Loader2 className="w-4 h-4 animate-spin text-violet-600" aria-hidden />
                Speichern…
              </span>
            )}
            <Link to="/change-workflow/stakeholders" className="cw-btn cw-btn-accent-outline cw-btn-compact">
              ← Stakeholder
            </Link>
          </div>
        </div>
      </header>

      <main className="cw-container py-8 max-w-6xl space-y-6">
        {!activeProfile ? (
          <div className="cw-card text-center py-8">
            <Megaphone className="w-10 h-10 mx-auto text-slate-400 mb-4" aria-hidden />
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
                  <h1 className="text-xl font-bold text-slate-800 m-0 mb-1">{activeProfile.customerLabel || 'Kommunikationsplan'}</h1>
                  <p className="text-sm text-slate-600 m-0">{commsPlan.length} Maßnahmen geplant</p>
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
                    onClick={generateAiPlan}
                    disabled={aiLoading}
                    className="cw-btn cw-btn-accent-outline cw-btn-compact inline-flex items-center gap-2"
                  >
                    {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    KI-Vorschläge
                  </button>
                  <button
                    type="button"
                    onClick={exportExcel}
                    disabled={commsPlan.length === 0}
                    className="cw-btn cw-btn-ghost cw-btn-compact inline-flex items-center gap-2"
                  >
                    <FileSpreadsheet className="w-4 h-4" /> Excel
                  </button>
                  <button
                    type="button"
                    onClick={exportIcs}
                    disabled={commsPlan.length === 0}
                    className="cw-btn cw-btn-ghost cw-btn-compact inline-flex items-center gap-2"
                  >
                    <Calendar className="w-4 h-4" /> ICS
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 rounded-lg bg-slate-100">
                  <p className="text-2xl font-bold text-slate-600 m-0">{plannedCount}</p>
                  <p className="text-xs text-slate-500 m-0">Geplant</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-amber-100">
                  <p className="text-2xl font-bold text-amber-700 m-0">{inProgressCount}</p>
                  <p className="text-xs text-amber-600 m-0">In Vorbereitung</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-emerald-100">
                  <p className="text-2xl font-bold text-emerald-700 m-0">{doneCount}</p>
                  <p className="text-xs text-emerald-600 m-0">Abgeschlossen</p>
                </div>
              </div>
            </div>

            <div className="cw-card">
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    className="cw-input-text pl-9"
                    placeholder="Suchen nach Titel, Owner …"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <select
                  className="cw-input-text w-auto"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">Alle Status</option>
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
                <select
                  className="cw-input-text w-auto"
                  value={filterChannel}
                  onChange={(e) => setFilterChannel(e.target.value)}
                >
                  <option value="all">Alle Kanäle</option>
                  {CHANNEL_OPTIONS.map((c) => (
                    <option key={c.value} value={c.value}>{c.icon} {c.label}</option>
                  ))}
                </select>
                <div className="flex gap-1 border rounded-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setViewMode('list')}
                    className={`px-3 py-1.5 text-xs ${viewMode === 'list' ? 'bg-violet-100 text-violet-700' : 'text-slate-600'}`}
                  >
                    Liste
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('timeline')}
                    className={`px-3 py-1.5 text-xs ${viewMode === 'timeline' ? 'bg-violet-100 text-violet-700' : 'text-slate-600'}`}
                  >
                    Timeline
                  </button>
                </div>
              </div>
            </div>

            {selectedIds.size > 0 && (
              <div className="cw-card bg-violet-50 border-violet-200">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-sm font-medium text-violet-700">{selectedIds.size} ausgewählt</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => bulkUpdateStatus('planned')}
                      className="text-xs px-2 py-1 rounded bg-slate-100 text-slate-600 hover:bg-slate-200"
                    >
                      → Geplant
                    </button>
                    <button
                      type="button"
                      onClick={() => bulkUpdateStatus('in_progress')}
                      className="text-xs px-2 py-1 rounded bg-amber-100 text-amber-700 hover:bg-amber-200"
                    >
                      → In Vorbereitung
                    </button>
                    <button
                      type="button"
                      onClick={() => bulkUpdateStatus('done')}
                      className="text-xs px-2 py-1 rounded bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                    >
                      → Erledigt
                    </button>
                    <button
                      type="button"
                      onClick={bulkDelete}
                      className="text-xs px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200"
                    >
                      Löschen
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedIds(new Set())}
                    className="text-xs text-violet-600 hover:underline ml-auto"
                  >
                    Auswahl aufheben
                  </button>
                </div>
              </div>
            )}

            {(showForm || editingId) && (
              <div className="cw-card">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">
                  {editingId ? 'Maßnahme bearbeiten' : 'Neue Kommunikationsmaßnahme'}
                </h2>
                <CommItemForm
                  key={editingId || 'new-comms-item'}
                  item={editingItem || { channel: 'email', frequency: 'once', status: 'planned', targetAudience: [] }}
                  stakeholders={stakeholders}
                  onSave={saveItem}
                  onCancel={() => { setEditingId(null); setShowForm(false); }}
                />
              </div>
            )}

            {viewMode === 'timeline' ? (
              <CollapsibleSection title="Timeline-Ansicht" icon={Calendar} defaultOpen>
                {filteredItems.length === 0 ? (
                  <p className="text-sm text-slate-500 italic">Keine Maßnahmen vorhanden.</p>
                ) : (
                  <TimelineView items={filteredItems} stakeholders={stakeholders} onEdit={setEditingId} />
                )}
              </CollapsibleSection>
            ) : (
              <CollapsibleSection title="Alle Maßnahmen" icon={Calendar} badge={`${filteredItems.length}/${commsPlan.length}`} defaultOpen>
                {filteredItems.length === 0 ? (
                  <p className="text-sm text-slate-500 italic">
                    {commsPlan.length === 0
                      ? 'Noch keine Kommunikationsmaßnahmen geplant. Klicke «Hinzufügen» oder «KI-Vorschläge» um zu beginnen.'
                      : 'Keine Maßnahmen entsprechen den Filterkriterien.'}
                  </p>
                ) : (
                  <>
                    <div className="flex items-center gap-2 mb-3">
                      <button
                        type="button"
                        onClick={selectAll}
                        className="text-xs text-violet-600 hover:underline flex items-center gap-1"
                      >
                        {selectedIds.size === filteredItems.length ? (
                          <><CheckSquare className="w-3.5 h-3.5" /> Alle abwählen</>
                        ) : (
                          <><Square className="w-3.5 h-3.5" /> Alle auswählen</>
                        )}
                      </button>
                    </div>
                    <div className="space-y-3">
                      {filteredItems.map((item) => {
                        const channel = CHANNEL_OPTIONS.find((c) => c.value === item.channel) || CHANNEL_OPTIONS[0];
                        const frequency = FREQUENCY_OPTIONS.find((f) => f.value === item.frequency) || FREQUENCY_OPTIONS[0];
                        const status = STATUS_OPTIONS.find((s) => s.value === item.status) || STATUS_OPTIONS[0];
                        const audiences = (item.targetAudience || [])
                          .map((id) => stakeholders.find((s) => s.id === id)?.name)
                          .filter(Boolean);
                        const isSelected = selectedIds.has(item.id);

                        return (
                          <div key={item.id} className={`rounded-xl border bg-white p-4 ${isSelected ? 'border-violet-300 bg-violet-50/30' : 'border-slate-200'}`}>
                            <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                              <div className="flex items-start gap-3">
                                <button
                                  type="button"
                                  onClick={() => toggleSelect(item.id)}
                                  className={`mt-0.5 shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                                    isSelected ? 'bg-violet-500 border-violet-500 text-white' : 'border-slate-300'
                                  }`}
                                >
                                  {isSelected && <CheckCircle className="w-3 h-3" />}
                                </button>
                                <span className="text-2xl">{channel.icon}</span>
                                <div>
                                  <p className="font-semibold text-slate-800 m-0">{item.title}</p>
                                  <p className="text-xs text-slate-500 m-0">
                                    {channel.label} · {frequency.label}
                                    {item.timing && ` · ${item.timing}`}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`text-[10px] px-2 py-0.5 rounded-full ${status.color}`}>
                                  {status.label}
                                </span>
                                {item.dueDate && (
                                  <span className="text-[10px] text-slate-500">
                                    Fällig: {new Date(item.dueDate).toLocaleDateString('de-CH')}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                              <div className="text-xs">
                                <span className="font-semibold text-slate-600">Owner:</span>{' '}
                                <span className="text-violet-700 font-medium">{item.owner || '—'}</span>
                              </div>
                              {audiences.length > 0 && (
                                <div className="text-xs">
                                  <span className="font-semibold text-slate-600">Zielgruppe:</span>{' '}
                                  <span className="text-slate-700">{audiences.join(', ')}</span>
                                </div>
                              )}
                            </div>

                            {item.keyMessage && (
                              <div className="bg-slate-50 rounded-lg p-2 mb-3 text-xs">
                                <p className="font-semibold text-slate-600 m-0 mb-1">Kernbotschaft</p>
                                <p className="text-slate-700 m-0">{item.keyMessage}</p>
                              </div>
                            )}

                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => setEditingId(item.id)}
                                className="text-xs text-violet-600 hover:underline inline-flex items-center gap-1"
                              >
                                <Edit3 className="w-3 h-3" /> Bearbeiten
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteItem(item.id)}
                                className="text-xs text-red-600 hover:underline inline-flex items-center gap-1"
                              >
                                <Trash2 className="w-3 h-3" /> Löschen
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </CollapsibleSection>
            )}

            {stakeholders.length === 0 && (
              <div className="cw-card border-amber-200 bg-amber-50">
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" aria-hidden />
                  <div>
                    <p className="font-semibold text-amber-800 m-0 mb-1">Stakeholder fehlen</p>
                    <p className="text-sm text-amber-700 m-0">
                      Für eine bessere Verknüpfung, erfasse zuerst deine Stakeholder in der{' '}
                      <Link to="/change-workflow/stakeholders" className="underline">Stakeholder-Analyse</Link>.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
