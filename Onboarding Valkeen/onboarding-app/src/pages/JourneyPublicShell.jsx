import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Bot,
  Calendar,
  CheckCircle,
  ChevronDown,
  Circle,
  Flag,
  Lightbulb,
  ListChecks,
  Loader2,
  Lock,
  Map,
  MessageSquare,
  Save,
  Send,
  Shield,
  Sparkles,
  Target,
  TrendingUp,
  Users,
} from 'lucide-react';

import '../styles/change-workshop.css';
import { loadProgress, saveProgress, getOpenAIApiKey } from '../services/awsService';
import {
  isValidJourneyShareToken,
  journeyShareUserId,
  normalizeJourneyShareData,
} from '../utils/journeyShare';

const JOURNEY_PHASES = [
  { id: 'workshop', label: 'Workshop', icon: Users, description: 'Analyse & Planung' },
  { id: 'early_wins', label: 'Frühe Gewinne', icon: Target, description: 'Erste Quick Wins' },
  { id: 'deepening', label: 'Vertiefung', icon: TrendingUp, description: 'Umsetzung' },
  { id: 'anchoring', label: 'Verankerung', icon: Flag, description: 'Nachhaltig etabliert' },
];

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
          {badge && (
            <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-medium">{badge}</span>
          )}
        </span>
        <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden />
      </button>
      {open && <div className="mt-4 pt-4 border-t border-slate-200">{children}</div>}
    </div>
  );
}

export default function JourneyPublicShell() {
  const { shareId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState(null);

  const [coachMessages, setCoachMessages] = useState([
    { role: 'assistant', content: 'Willkommen! Ich bin dein KI-Coach für die Change-Begleitung. Wie kann ich dir helfen?' },
  ]);
  const [coachInput, setCoachInput] = useState('');
  const [coachLoading, setCoachLoading] = useState(false);

  const userId = useMemo(() => journeyShareUserId(shareId), [shareId]);

  useEffect(() => {
    if (!isValidJourneyShareToken(shareId)) {
      setLoadError('Ungültiger Link');
      setLoading(false);
      return;
    }

    void loadProgress(userId).then((blob) => {
      if (blob?.journeyShare) {
        setData(normalizeJourneyShareData(blob.journeyShare));
      } else {
        setLoadError('Keine Journey-Daten gefunden. Bitte Link vom Moderator anfordern.');
      }
      setLoading(false);
    }).catch((e) => {
      setLoadError(e?.message || 'Laden fehlgeschlagen');
      setLoading(false);
    });
  }, [shareId, userId]);

  const saveData = useCallback(
    async (updatedData) => {
      setSaving(true);
      try {
        await saveProgress(
          {
            startDate: null,
            tasks: {},
            quizScores: {},
            checkpoints: {},
            notes: {},
            practiceProgress: {},
            toolConfigProgress: {},
            scenarioProgress: {},
            journeyShare: {
              ...updatedData,
              updatedAt: new Date().toISOString(),
            },
          },
          userId
        );
      } finally {
        setSaving(false);
      }
    },
    [userId]
  );

  const toggleChecklistItem = useCallback(
    (checklistId, itemId) => {
      if (!data?.journey?.checklists) return;
      const updated = {
        ...data,
        journey: {
          ...data.journey,
          checklists: data.journey.checklists.map((cl) =>
            cl.id === checklistId
              ? {
                  ...cl,
                  items: cl.items.map((item) =>
                    item.id === itemId
                      ? { ...item, done: !item.done, doneAt: item.done ? null : new Date().toISOString() }
                      : item
                  ),
                }
              : cl
          ),
        },
      };
      setData(updated);
      void saveData(updated);
    },
    [data, saveData]
  );

  const updateCustomerNotes = useCallback(
    (notes) => {
      if (!data) return;
      const updated = { ...data, customerNotes: notes };
      setData(updated);
    },
    [data]
  );

  const saveNotes = useCallback(() => {
    if (data) void saveData(data);
  }, [data, saveData]);

  const sendCoachMessage = useCallback(async () => {
    if (!coachInput.trim() || coachLoading) return;
    const userMsg = coachInput.trim();
    setCoachInput('');
    setCoachMessages((m) => [...m, { role: 'user', content: userMsg }]);
    setCoachLoading(true);

    try {
      const apiKey = await getOpenAIApiKey();
      const key = apiKey || localStorage.getItem('openai-api-key');
      if (!key?.startsWith('sk-')) {
        setCoachMessages((m) => [...m, { role: 'assistant', content: 'KI-Coach ist derzeit nicht verfügbar.' }]);
        return;
      }

      const context = data
        ? `Projekt: ${data.customerLabel || 'Unbekannt'}
Kotter-Status: ${data.kotterSummary?.map((k) => `${k.label}: ${k.status}`).join(', ') || 'Keine Daten'}
${data.aiSummary ? `Zusammenfassung: ${data.aiSummary.slice(0, 500)}...` : ''}`
        : '';

      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
        body: JSON.stringify({
          model: 'gpt-4.1',
          messages: [
            {
              role: 'system',
              content: `Du bist ein Change-Management-Coach. Kontext:\n${context}\n\nBeantworte Fragen zum Change-Prozess auf Deutsch, kurz und hilfreich.`,
            },
            ...coachMessages.slice(-6).map((m) => ({ role: m.role, content: m.content })),
            { role: 'user', content: userMsg },
          ],
          temperature: 0.7,
          max_tokens: 600,
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const resData = await res.json();
      const reply = resData.choices?.[0]?.message?.content || 'Keine Antwort erhalten.';
      setCoachMessages((m) => [...m, { role: 'assistant', content: reply }]);
    } catch (e) {
      setCoachMessages((m) => [...m, { role: 'assistant', content: `Fehler: ${e?.message}` }]);
    } finally {
      setCoachLoading(false);
    }
  }, [coachInput, coachLoading, coachMessages, data]);

  if (!isValidJourneyShareToken(shareId)) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md text-center bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          <h1 className="text-lg font-semibold text-slate-900 m-0">Link nicht gültig</h1>
          <p className="text-sm text-slate-600 mt-2">
            Bitte kopieren Sie die vollständige Adresse aus der Einladung.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
      </div>
    );
  }

  if (loadError || !data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md text-center bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          <h1 className="text-lg font-semibold text-slate-900 m-0">Keine Daten gefunden</h1>
          <p className="text-sm text-slate-600 mt-2">{loadError || 'Bitte Link vom Moderator anfordern.'}</p>
        </div>
      </div>
    );
  }

  const journey = data.journey || { currentPhase: 'workshop', checklists: [] };
  const completedKotter = data.kotterSummary?.filter((k) => k.status === 'done').length || 0;
  const completedPhases = data.phaseSummary?.filter((p) => p.status === 'done').length || 0;
  const allActions = [
    ...(data.kotterSummary?.flatMap((k) => k.actions?.map((a) => ({ ...a, source: k.label })) || []) || []),
    ...(data.phaseSummary?.flatMap((p) => p.actions?.map((a) => ({ ...a, source: p.label })) || []) || []),
  ];

  return (
    <div className="cw-workshop min-h-screen relative">
      <div className="cw-workshop-page-bg" aria-hidden />
      <div className="cw-workshop-page-overlay" aria-hidden />

      <header className="cw-wh-header border-b border-slate-200/80">
        <div className="cw-container py-4">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="cw-kicker flex items-center gap-2">
              <Map className="w-4 h-4" aria-hidden />
              Change Journey
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">
              <Lock className="h-3.5 w-3.5" aria-hidden /> Kundenansicht
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-800">{data.customerLabel || 'Change-Projekt'}</h1>
          <div className="cw-callout-accent border-violet-200/80 bg-violet-50/60 py-3 mt-4">
            <p className="cw-callout-heading m-0 flex items-center gap-2 text-sm">
              <Shield className="h-4 w-4 text-violet-700 shrink-0" aria-hidden />
              Ihr Change-Begleitungs-Dashboard
            </p>
            <p className="cw-callout-body m-0 mt-1 text-xs leading-snug">
              Hier sehen Sie den Fortschritt Ihres Change-Projekts. Sie können Checklisten-Punkte abhaken
              und Notizen hinzufügen. Änderungen werden automatisch gespeichert.
            </p>
          </div>
        </div>
      </header>

      <main className="cw-container py-8 max-w-4xl space-y-6">
        <div className="cw-card bg-gradient-to-br from-violet-50/80 to-white">
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {JOURNEY_PHASES.map((phase, idx) => {
              const isCurrent = journey.currentPhase === phase.id;
              const isPast = JOURNEY_PHASES.findIndex((p) => p.id === journey.currentPhase) > idx;
              const PhaseIcon = phase.icon;
              return (
                <div
                  key={phase.id}
                  className={`flex-1 min-w-[120px] p-3 rounded-xl text-center ${
                    isCurrent
                      ? 'bg-violet-600 text-white shadow-lg'
                      : isPast
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  <PhaseIcon className={`w-5 h-5 mx-auto mb-1 ${isCurrent ? 'text-white' : isPast ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <p className="text-sm font-semibold m-0">{phase.label}</p>
                  <p className={`text-[10px] m-0 ${isCurrent ? 'text-violet-200' : 'text-slate-500'}`}>{phase.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="cw-card text-center py-4">
            <p className="text-2xl font-bold text-violet-600">{completedKotter}/8</p>
            <p className="text-xs text-slate-500 m-0">Kotter-Bereiche</p>
          </div>
          <div className="cw-card text-center py-4">
            <p className="text-2xl font-bold text-violet-600">{completedPhases}/8</p>
            <p className="text-xs text-slate-500 m-0">Workshop-Phasen</p>
          </div>
          <div className="cw-card text-center py-4">
            <p className="text-2xl font-bold text-emerald-600">
              {allActions.filter((a) => a.done).length}/{allActions.length}
            </p>
            <p className="text-xs text-slate-500 m-0">Maßnahmen</p>
          </div>
          <div className="cw-card text-center py-4">
            <p className="text-2xl font-bold text-amber-600">
              {journey.checklists?.reduce((sum, cl) => sum + cl.items.filter((i) => i.done).length, 0) || 0}
            </p>
            <p className="text-xs text-slate-500 m-0">Checklisten-Items</p>
          </div>
        </div>

        {data.aiSummary && (
          <CollapsibleSection title="Projekt-Zusammenfassung" icon={Sparkles} defaultOpen>
            <div className="prose prose-sm prose-slate max-w-none whitespace-pre-wrap text-slate-700">
              {data.aiSummary}
            </div>
          </CollapsibleSection>
        )}

        <CollapsibleSection
          title="Checklisten"
          icon={ListChecks}
          badge={journey.checklists?.length > 0 ? `${journey.checklists.reduce((s, c) => s + c.items.filter((i) => i.done).length, 0)}/${journey.checklists.reduce((s, c) => s + c.items.length, 0)}` : null}
          defaultOpen
        >
          {!journey.checklists || journey.checklists.length === 0 ? (
            <p className="text-sm text-slate-500 italic">Noch keine Checklisten erstellt.</p>
          ) : (
            journey.checklists.map((checklist) => (
              <div key={checklist.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4 mb-4 last:mb-0">
                <p className="font-semibold text-slate-800 mb-3 m-0">{checklist.title}</p>
                {['30d', '60d', '90d'].map((phase) => {
                  const items = checklist.items.filter((i) => i.phase === phase);
                  if (items.length === 0) return null;
                  return (
                    <div key={phase} className="mb-4 last:mb-0">
                      <p className="text-xs font-semibold text-violet-600 mb-2 uppercase">
                        {phase === '30d' ? '30 Tage' : phase === '60d' ? '60 Tage' : '90 Tage'}
                      </p>
                      <div className="space-y-1">
                        {items.map((item) => (
                          <div
                            key={item.id}
                            className={`flex items-start gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                              item.done ? 'bg-emerald-50' : 'bg-white hover:bg-slate-50'
                            }`}
                            onClick={() => toggleChecklistItem(checklist.id, item.id)}
                          >
                            <div
                              className={`mt-0.5 shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                                item.done ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300'
                              }`}
                            >
                              {item.done && <CheckCircle className="w-3 h-3" />}
                            </div>
                            <span className={`text-sm flex-1 ${item.done ? 'line-through text-slate-500' : 'text-slate-700'}`}>
                              {item.text}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </CollapsibleSection>

        <CollapsibleSection title="Kotter-Analyse" icon={Target} badge={`${completedKotter}/8`}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {data.kotterSummary?.map((k) => {
              const statusColors = {
                done: 'bg-emerald-50 border-emerald-200 text-emerald-700',
                in_progress: 'bg-amber-50 border-amber-200 text-amber-700',
                open: 'bg-slate-50 border-slate-200 text-slate-600',
              };
              return (
                <div key={k.slug} className={`p-3 rounded-xl border text-center ${statusColors[k.status]}`}>
                  <p className="text-lg font-bold m-0">{k.order}</p>
                  <p className="text-xs font-semibold m-0">{k.label}</p>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    {k.status === 'done' ? <CheckCircle className="w-3 h-3" /> : <Circle className="w-3 h-3" />}
                    <span className="text-[10px]">{k.answeredCount}/{k.totalPrompts}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="Ihre Notizen" icon={Lightbulb}>
          <textarea
            className="cw-textarea w-full"
            rows={6}
            placeholder="Hier können Sie eigene Notizen, Gedanken und Fragen festhalten…"
            value={data.customerNotes || ''}
            onChange={(e) => updateCustomerNotes(e.target.value)}
            onBlur={saveNotes}
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-slate-500">
              {saving ? 'Speichern…' : 'Wird automatisch gespeichert'}
            </span>
            <button
              type="button"
              onClick={saveNotes}
              disabled={saving}
              className="cw-btn cw-btn-ghost cw-btn-compact inline-flex items-center gap-1 text-xs"
            >
              <Save className="w-3 h-3" /> Jetzt speichern
            </button>
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="KI-Coach" icon={MessageSquare}>
          <div className="h-48 overflow-y-auto rounded-xl border border-slate-200 bg-white p-3 space-y-3 mb-3">
            {coachMessages.map((msg, idx) => (
              <div key={idx} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-violet-100' : 'bg-slate-100'}`}>
                  {msg.role === 'user' ? <Users className="w-3 h-3 text-violet-600" /> : <Bot className="w-3 h-3 text-slate-600" />}
                </div>
                <div className={`max-w-[85%] p-2.5 rounded-xl text-sm ${msg.role === 'user' ? 'bg-violet-100 text-violet-900 rounded-tr-none' : 'bg-slate-100 text-slate-700 rounded-tl-none'}`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {coachLoading && (
              <div className="flex gap-2">
                <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center">
                  <Bot className="w-3 h-3 text-slate-600" />
                </div>
                <div className="bg-slate-100 p-2.5 rounded-xl rounded-tl-none">
                  <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
                </div>
              </div>
            )}
          </div>
          <form onSubmit={(e) => { e.preventDefault(); sendCoachMessage(); }} className="flex gap-2">
            <input
              type="text"
              value={coachInput}
              onChange={(e) => setCoachInput(e.target.value)}
              placeholder="Fragen Sie den KI-Coach…"
              className="cw-input-text flex-1"
              disabled={coachLoading}
            />
            <button type="submit" disabled={!coachInput.trim() || coachLoading} className="cw-btn cw-btn-primary-solid cw-btn-compact">
              <Send className="w-4 h-4" />
            </button>
          </form>
        </CollapsibleSection>

        <p className="text-center text-xs text-slate-400 mt-8">
          Zuletzt aktualisiert: {data.updatedAt ? new Date(data.updatedAt).toLocaleString('de-CH') : '—'}
        </p>
      </main>
    </div>
  );
}
