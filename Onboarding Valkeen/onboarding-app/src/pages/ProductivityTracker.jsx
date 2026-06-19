import { useCallback, useMemo, useState } from 'react';
import {
  Plus,
  Trash2,
  FileText,
  Code2,
  Presentation,
  HeadphonesIcon,
  Monitor,
  Users,
  GraduationCap,
  Briefcase,
  Star,
  Calendar,
  TrendingUp,
  Clock,
  Building2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Cloud,
  Sparkles,
  Filter,
  BarChart3,
} from 'lucide-react';
import { useProgress } from '../hooks/useLocalStorage';

const ARTIFACT_TYPES = [
  { id: 'document', label: 'Dokument', icon: FileText, color: 'indigo', examples: 'QRG, FAQ, Anleitung, Guide' },
  { id: 'code', label: 'Code & Script', icon: Code2, color: 'emerald', examples: 'Python, API, Automation' },
  { id: 'presentation', label: 'Präsentation', icon: Presentation, color: 'violet', examples: 'PPT, Workshop, Deck' },
  { id: 'support', label: 'Support', icon: HeadphonesIcon, color: 'amber', examples: 'Case, Mail, Troubleshooting' },
  { id: 'demo', label: 'Demo', icon: Monitor, color: 'cyan', examples: 'Storyboard, Walkthrough, Video' },
  { id: 'meeting', label: 'Meeting', icon: Users, color: 'rose', examples: 'Call, Workshop, Termin' },
  { id: 'training', label: 'Training', icon: GraduationCap, color: 'orange', examples: 'Schulung, Curriculum, Academy' },
  { id: 'other', label: 'Sonstiges', icon: Briefcase, color: 'slate', examples: 'Planung, Research, Admin' },
];

const IMPACT_LEVELS = [
  { value: 1, label: 'Gering', desc: 'Routine, kleine Aufgabe', color: 'slate' },
  { value: 2, label: 'Mittel', desc: 'Normaler Beitrag', color: 'blue' },
  { value: 3, label: 'Hoch', desc: 'Wichtiger Deliverable', color: 'indigo' },
  { value: 4, label: 'Sehr hoch', desc: 'Kritisches Ergebnis', color: 'violet' },
  { value: 5, label: 'Strategisch', desc: 'Game Changer', color: 'amber' },
];

const cardClass =
  'rounded-3xl border border-white/[0.09] bg-white/[0.035] p-6 sm:p-8 backdrop-blur-sm shadow-xl shadow-black/20';

const fieldClass =
  'w-full min-h-[48px] rounded-2xl bg-white/[0.07] border border-white/[0.12] px-4 py-3 text-[15px] leading-relaxed text-white placeholder:text-white/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/50';

const labelClass = 'block text-sm font-medium text-white/75 mb-2';

function getWeekDates(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return { monday, sunday };
}

function formatDateShort(date) {
  return new Date(date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
}

function formatDateFull(date) {
  return new Date(date).toLocaleDateString('de-DE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function isSameDay(date1, date2) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

export default function ProductivityTracker() {
  const { progress, setProgress, isLoading, isSyncing, lastSyncError } = useProgress();
  const tracker = progress.productivityTracker || { artifacts: [], customers: [], projects: [] };

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState('day');
  const [showForm, setShowForm] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [filterCustomer, setFilterCustomer] = useState('all');

  const [formData, setFormData] = useState({
    type: 'document',
    title: '',
    description: '',
    customer: '',
    project: '',
    impact: 3,
  });

  const today = new Date().toISOString().split('T')[0];
  const { monday, sunday } = useMemo(() => getWeekDates(selectedDate), [selectedDate]);

  const artifacts = tracker.artifacts || [];
  const customers = tracker.customers || [];

  const filteredArtifacts = useMemo(() => {
    let filtered = artifacts;
    if (viewMode === 'day') {
      filtered = filtered.filter((a) => isSameDay(a.date, selectedDate));
    } else {
      filtered = filtered.filter((a) => {
        const d = new Date(a.date);
        return d >= monday && d <= sunday;
      });
    }
    if (filterType !== 'all') {
      filtered = filtered.filter((a) => a.type === filterType);
    }
    if (filterCustomer !== 'all') {
      filtered = filtered.filter((a) => a.customer === filterCustomer);
    }
    return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [artifacts, selectedDate, viewMode, monday, sunday, filterType, filterCustomer]);

  const weekStats = useMemo(() => {
    const weekArtifacts = artifacts.filter((a) => {
      const d = new Date(a.date);
      return d >= monday && d <= sunday;
    });
    const byType = {};
    const byCustomer = {};
    let totalImpact = 0;
    ARTIFACT_TYPES.forEach((t) => (byType[t.id] = 0));
    weekArtifacts.forEach((a) => {
      byType[a.type] = (byType[a.type] || 0) + 1;
      byCustomer[a.customer] = (byCustomer[a.customer] || 0) + 1;
      totalImpact += a.impact || 0;
    });
    return {
      total: weekArtifacts.length,
      byType,
      byCustomer,
      avgImpact: weekArtifacts.length > 0 ? (totalImpact / weekArtifacts.length).toFixed(1) : 0,
    };
  }, [artifacts, monday, sunday]);

  const addArtifact = useCallback(() => {
    if (!formData.title.trim()) return;
    const artifact = {
      id: `artifact-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      ...formData,
      date: selectedDate,
      createdAt: new Date().toISOString(),
    };
    setProgress((p) => ({
      ...p,
      productivityTracker: {
        ...p.productivityTracker,
        artifacts: [...(p.productivityTracker?.artifacts || []), artifact],
        customers:
          formData.customer && !p.productivityTracker?.customers?.includes(formData.customer)
            ? [...(p.productivityTracker?.customers || []), formData.customer]
            : p.productivityTracker?.customers || [],
      },
    }));
    setFormData({ type: 'document', title: '', description: '', customer: '', project: '', impact: 3 });
    setShowForm(false);
  }, [formData, selectedDate, setProgress]);

  const deleteArtifact = useCallback(
    (id) => {
      if (!window.confirm('Diesen Eintrag wirklich löschen?')) return;
      setProgress((p) => ({
        ...p,
        productivityTracker: {
          ...p.productivityTracker,
          artifacts: (p.productivityTracker?.artifacts || []).filter((a) => a.id !== id),
        },
      }));
    },
    [setProgress]
  );

  const navigateDate = (direction) => {
    const d = new Date(selectedDate);
    if (viewMode === 'day') {
      d.setDate(d.getDate() + direction);
    } else {
      d.setDate(d.getDate() + direction * 7);
    }
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const getTypeInfo = (typeId) => ARTIFACT_TYPES.find((t) => t.id === typeId) || ARTIFACT_TYPES[7];
  const getImpactInfo = (value) => IMPACT_LEVELS.find((i) => i.value === value) || IMPACT_LEVELS[2];

  const syncNote = lastSyncError
    ? lastSyncError
    : isLoading
      ? 'Laden…'
      : isSyncing
        ? 'Speichern…'
        : 'Gespeichert';

  return (
    <div className="w-full space-y-8 pb-24 text-white/90">
      <header className="space-y-4 pt-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-3">
            <h1 className="text-2xl sm:text-3xl font-bold gradient-text leading-tight flex items-center gap-3">
              <TrendingUp className="w-8 h-8" /> Produktivitäts-Tracker
            </h1>
            <p className="text-white/60 text-base leading-relaxed max-w-[62ch]">
              Erfasse deine Arbeitsergebnisse und Artefakte. Behalte den Überblick über deine Beiträge
              pro Kunde und Projekt.
            </p>
          </div>
        </div>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigateDate(-1)}
            className="p-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="px-4 py-2 rounded-xl bg-white/[0.06] min-w-[200px] text-center">
            {viewMode === 'day' ? (
              <span className="font-medium">{formatDateFull(selectedDate)}</span>
            ) : (
              <span className="font-medium">
                KW {Math.ceil((new Date(selectedDate).getDate() + new Date(new Date(selectedDate).getFullYear(), new Date(selectedDate).getMonth(), 1).getDay()) / 7)}: {formatDateShort(monday)} – {formatDateShort(sunday)}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => navigateDate(1)}
            className="p-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          {selectedDate !== today && (
            <button
              type="button"
              onClick={() => setSelectedDate(today)}
              className="px-3 py-2 rounded-xl text-sm text-indigo-300 hover:text-indigo-200 hover:bg-white/[0.06]"
            >
              Heute
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-xl bg-white/[0.06] p-1">
            <button
              type="button"
              onClick={() => setViewMode('day')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'day' ? 'bg-indigo-600 text-white' : 'text-white/60 hover:text-white'
              }`}
            >
              <Calendar className="w-4 h-4 inline mr-2" />
              Tag
            </button>
            <button
              type="button"
              onClick={() => setViewMode('week')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'week' ? 'bg-indigo-600 text-white' : 'text-white/60 hover:text-white'
              }`}
            >
              <BarChart3 className="w-4 h-4 inline mr-2" />
              Woche
            </button>
          </div>
          <button
            type="button"
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors"
          >
            <Plus className="w-4 h-4" /> Erfassen
          </button>
        </div>
      </div>

      {showForm && (
        <section className={`${cardClass} space-y-6`}>
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" /> Neues Artefakt erfassen
          </h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="sm:col-span-2 lg:col-span-4">
              <label className={labelClass}>Typ</label>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {ARTIFACT_TYPES.map((type) => {
                  const Icon = type.icon;
                  const isSelected = formData.type === type.id;
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setFormData((f) => ({ ...f, type: type.id }))}
                      className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-all ${
                        isSelected
                          ? `border-${type.color}-400/50 bg-${type.color}-500/20 text-white`
                          : 'border-white/[0.08] bg-white/[0.03] text-white/60 hover:text-white hover:bg-white/[0.06]'
                      }`}
                      title={type.examples}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-xs font-medium">{type.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className={labelClass}>Titel *</label>
              <input
                className={fieldClass}
                placeholder="z.B. QRG für Knauf RM"
                value={formData.title}
                onChange={(e) => setFormData((f) => ({ ...f, title: e.target.value }))}
              />
            </div>

            <div>
              <label className={labelClass}>Kunde</label>
              <select
                className={fieldClass}
                value={formData.customer}
                onChange={(e) => setFormData((f) => ({ ...f, customer: e.target.value }))}
              >
                <option value="">— Auswählen —</option>
                {customers.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
                <option value="_new">+ Neuer Kunde</option>
              </select>
              {formData.customer === '_new' && (
                <input
                  className={`${fieldClass} mt-2`}
                  placeholder="Kundenname eingeben"
                  onChange={(e) => setFormData((f) => ({ ...f, customer: e.target.value }))}
                />
              )}
            </div>

            <div>
              <label className={labelClass}>Impact</label>
              <div className="flex gap-1">
                {IMPACT_LEVELS.map((level) => (
                  <button
                    key={level.value}
                    type="button"
                    onClick={() => setFormData((f) => ({ ...f, impact: level.value }))}
                    className={`flex-1 p-2 rounded-xl border transition-all ${
                      formData.impact === level.value
                        ? 'border-amber-400/50 bg-amber-500/20 text-amber-200'
                        : 'border-white/[0.08] text-white/50 hover:text-white hover:bg-white/[0.06]'
                    }`}
                    title={`${level.label}: ${level.desc}`}
                  >
                    <Star
                      className={`w-4 h-4 mx-auto ${
                        formData.impact >= level.value ? 'fill-amber-400 text-amber-400' : ''
                      }`}
                    />
                  </button>
                ))}
              </div>
              <p className="text-xs text-white/40 mt-1 text-center">
                {getImpactInfo(formData.impact).label}: {getImpactInfo(formData.impact).desc}
              </p>
            </div>

            <div className="sm:col-span-2 lg:col-span-4">
              <label className={labelClass}>Beschreibung (optional)</label>
              <textarea
                className={`${fieldClass} min-h-[80px] resize-y`}
                placeholder="Details, Links, Notizen..."
                value={formData.description}
                onChange={(e) => setFormData((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-5 py-3 rounded-2xl text-white/60 hover:text-white hover:bg-white/[0.06]"
            >
              Abbrechen
            </button>
            <button
              type="button"
              onClick={addArtifact}
              disabled={!formData.title.trim()}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" /> Speichern
            </button>
          </div>
        </section>
      )}

      {viewMode === 'week' && (
        <section className={cardClass}>
          <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-400" /> Wochenübersicht
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-400/20">
              <div className="text-3xl font-bold text-indigo-300">{weekStats.total}</div>
              <div className="text-sm text-white/60 mt-1">Artefakte diese Woche</div>
            </div>
            <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-400/20">
              <div className="text-3xl font-bold text-amber-300 flex items-center gap-2">
                {weekStats.avgImpact} <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
              </div>
              <div className="text-sm text-white/60 mt-1">Ø Impact</div>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/[0.08]">
              <div className="text-sm text-white/60 mb-2">Nach Typ</div>
              <div className="flex flex-wrap gap-2">
                {ARTIFACT_TYPES.filter((t) => weekStats.byType[t.id] > 0).map((type) => {
                  const Icon = type.icon;
                  return (
                    <span
                      key={type.id}
                      className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/[0.06] text-xs"
                    >
                      <Icon className="w-3 h-3" /> {weekStats.byType[type.id]}
                    </span>
                  );
                })}
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/[0.08]">
              <div className="text-sm text-white/60 mb-2">Nach Kunde</div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(weekStats.byCustomer)
                  .filter(([, count]) => count > 0)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 5)
                  .map(([customer, count]) => (
                    <span
                      key={customer}
                      className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/[0.06] text-xs"
                    >
                      <Building2 className="w-3 h-3" /> {customer}: {count}
                    </span>
                  ))}
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-white">
            {viewMode === 'day' ? 'Einträge heute' : 'Einträge diese Woche'} ({filteredArtifacts.length})
          </h2>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-white/40" />
            <select
              className="px-3 py-2 rounded-xl bg-white/[0.06] border border-white/[0.08] text-sm text-white/80"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">Alle Typen</option>
              {ARTIFACT_TYPES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
            <select
              className="px-3 py-2 rounded-xl bg-white/[0.06] border border-white/[0.08] text-sm text-white/80"
              value={filterCustomer}
              onChange={(e) => setFilterCustomer(e.target.value)}
            >
              <option value="all">Alle Kunden</option>
              {customers.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filteredArtifacts.length === 0 ? (
          <div className={`${cardClass} text-center py-12`}>
            <p className="text-white/50">Noch keine Einträge für diesen Zeitraum.</p>
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="mt-4 text-indigo-300 hover:text-indigo-200"
            >
              <Plus className="w-4 h-4 inline mr-1" /> Erstes Artefakt erfassen
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredArtifacts.map((artifact) => {
              const typeInfo = getTypeInfo(artifact.type);
              const TypeIcon = typeInfo.icon;
              const impactInfo = getImpactInfo(artifact.impact);
              return (
                <div
                  key={artifact.id}
                  className={`${cardClass} p-4 sm:p-5 flex items-start gap-4 group hover:border-white/[0.15] transition-colors`}
                >
                  <div
                    className={`shrink-0 w-10 h-10 rounded-xl bg-${typeInfo.color}-500/20 border border-${typeInfo.color}-400/30 flex items-center justify-center`}
                  >
                    <TypeIcon className={`w-5 h-5 text-${typeInfo.color}-300`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-medium text-white">{artifact.title}</h3>
                        <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-white/50">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {new Date(artifact.date).toLocaleDateString('de-DE')}
                          </span>
                          {artifact.customer && (
                            <span className="flex items-center gap-1">
                              <Building2 className="w-3.5 h-3.5" />
                              {artifact.customer}
                            </span>
                          )}
                          <span
                            className="flex items-center gap-1"
                            title={`${impactInfo.label}: ${impactInfo.desc}`}
                          >
                            {[...Array(artifact.impact || 0)].map((_, i) => (
                              <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            ))}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => deleteArtifact(artifact.id)}
                        className="p-2 text-white/30 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Löschen"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    {artifact.description && (
                      <p className="mt-2 text-sm text-white/60 line-clamp-2">{artifact.description}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <footer className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-white/[0.08] bg-black/25 px-6 py-5 text-sm">
        <span className="flex items-start gap-3 text-white/55 max-w-xl">
          <Cloud className="w-5 h-5 shrink-0 mt-0.5" />
          Alle Einträge werden automatisch in der Cloud gespeichert.
        </span>
        <span
          className={`flex items-center gap-2 font-medium ${lastSyncError ? 'text-red-400' : 'text-emerald-400/95'}`}
        >
          {(isSyncing || isLoading) && <Loader2 className="w-4 h-4 animate-spin" />}
          {syncNote}
        </span>
      </footer>
    </div>
  );
}
