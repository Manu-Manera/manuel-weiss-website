import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Bot,
  Calendar,
  CheckCircle,
  ChevronDown,
  Circle,
  Copy,
  ExternalLink,
  Flag,
  Lightbulb,
  Link2,
  ListChecks,
  Loader2,
  Map,
  MessageSquare,
  Plus,
  Send,
  Share2,
  Sparkles,
  Target,
  Trash2,
  TrendingUp,
  Users,
} from 'lucide-react';

import '../styles/change-workshop.css';
import { useProgress } from '../hooks/useLocalStorage';
import { getOpenAIApiKey, loadProgress } from '../services/awsService';
import { KOTTER_CATALOG_ITEMS } from '../data/kotterCatalogData';
import { WORKSHOP_PREP_QUESTIONS, workshopPrepUserId } from '../utils/workshopPrepShare';
import { WORKSHOP_PHASE_CATALOG } from '../data/workshopPhaseCatalog';
import { buildJourneyShareBlob, buildJourneyShareUrl, journeyShareUserId } from '../utils/journeyShare';

const JOURNEY_PHASES = [
  { id: 'workshop', label: 'Workshop', icon: Users, description: 'Analyse & Planung abgeschlossen' },
  { id: 'early_wins', label: 'Frühe Gewinne', icon: Target, description: 'Erste Quick Wins sichtbar' },
  { id: 'deepening', label: 'Vertiefung', icon: TrendingUp, description: 'Maßnahmen werden umgesetzt' },
  { id: 'anchoring', label: 'Verankerung', icon: Flag, description: 'Nachhaltig in der Organisation' },
];

function newId() {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
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
          {badge && (
            <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-medium">
              {badge}
            </span>
          )}
        </span>
        <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden />
      </button>
      {open && <div className="mt-4 pt-4 border-t border-slate-200">{children}</div>}
    </div>
  );
}

export default function ChangeJourney() {
  const { progress, isLoading, isSyncing, updateChangeWorkshopKotter } = useProgress();

  const kotter = progress.changeWorkshopKotter || { activeProfileId: null, profiles: {} };
  const { activeProfileId, profiles } = kotter;
  const activeProfile = activeProfileId ? profiles[activeProfileId] : null;

  const [prepData, setPrepData] = useState(null);
  const [coachMessages, setCoachMessages] = useState([
    { role: 'assistant', content: 'Willkommen zur Change Journey! Ich bin dein KI-Coach und helfe dir bei Fragen zum Change-Prozess. Wie kann ich dich unterstützen?' },
  ]);
  const [coachInput, setCoachInput] = useState('');
  const [coachLoading, setCoachLoading] = useState(false);
  const [checklistGenLoading, setChecklistGenLoading] = useState(false);
  const [shareBusy, setShareBusy] = useState(false);
  const [shareHint, setShareHint] = useState('');

  useEffect(() => {
    if (!activeProfile?.prepShareToken) return;
    void loadProgress(workshopPrepUserId(activeProfile.prepShareToken)).then((blob) => {
      setPrepData(blob?.workshopPrep || null);
    });
  }, [activeProfile?.prepShareToken]);

  useEffect(() => {
    if (!shareHint) return;
    const t = setTimeout(() => setShareHint(''), 4500);
    return () => clearTimeout(t);
  }, [shareHint]);

  const createJourneyShareLink = useCallback(async () => {
    if (!activeProfile) return;
    setShareBusy(true);
    try {
      const token = crypto.randomUUID ? crypto.randomUUID() : `js_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      const blob = buildJourneyShareBlob(activeProfile, KOTTER_CATALOG_ITEMS, WORKSHOP_PHASE_CATALOG);
      await saveProgress(blob, journeyShareUserId(token));
      
      updateChangeWorkshopKotter((cw) => {
        const id = cw.activeProfileId;
        const p = cw.profiles[id];
        if (!p) return cw;
        return {
          ...cw,
          profiles: {
            ...cw.profiles,
            [id]: {
              ...p,
              journeyShareToken: token,
              journeyShareCreatedAt: new Date().toISOString(),
            },
          },
        };
      });

      const url = buildJourneyShareUrl(token);
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        setShareHint('Link kopiert! Kunden können jetzt die Journey einsehen und Checklisten abhaken.');
      } else {
        window.prompt('Journey-Link:', url);
      }
    } catch (e) {
      window.alert(e?.message || 'Fehler beim Erstellen des Links');
    } finally {
      setShareBusy(false);
    }
  }, [activeProfile, updateChangeWorkshopKotter]);

  const refreshJourneyShare = useCallback(async () => {
    const token = activeProfile?.journeyShareToken;
    if (!token || !activeProfile) return;
    setShareBusy(true);
    try {
      const blob = buildJourneyShareBlob(activeProfile, KOTTER_CATALOG_ITEMS, WORKSHOP_PHASE_CATALOG);
      await saveProgress(blob, journeyShareUserId(token));
      setShareHint('Kunden-Link wurde mit aktuellem Stand aktualisiert.');
    } catch (e) {
      window.alert(e?.message || 'Aktualisierung fehlgeschlagen');
    } finally {
      setShareBusy(false);
    }
  }, [activeProfile]);

  const copyJourneyLink = useCallback(async () => {
    const token = activeProfile?.journeyShareToken;
    if (!token) return;
    const url = buildJourneyShareUrl(token);
    try {
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(url);
      else window.prompt('Link:', url);
      setShareHint('Link erneut kopiert.');
    } catch {
      window.prompt('Link:', url);
    }
  }, [activeProfile?.journeyShareToken]);

  const journey = useMemo(() => {
    return activeProfile?.journey || {
      currentPhase: 'workshop',
      startedAt: null,
      checklists: [],
      milestones: [],
    };
  }, [activeProfile?.journey]);

  const updateJourney = useCallback(
    (updater) => {
      updateChangeWorkshopKotter((cw) => {
        const id = cw.activeProfileId;
        const prof = id ? cw.profiles[id] : null;
        if (!id || !prof) return cw;
        const currentJourney = prof.journey || {
          currentPhase: 'workshop',
          startedAt: null,
          checklists: [],
          milestones: [],
        };
        const next = typeof updater === 'function' ? updater(currentJourney) : updater;
        return {
          ...cw,
          profiles: {
            ...cw.profiles,
            [id]: {
              ...prof,
              journey: next,
              updatedAt: new Date().toISOString(),
            },
          },
        };
      });
    },
    [updateChangeWorkshopKotter]
  );

  const kotterSummary = useMemo(() => {
    if (!activeProfile?.tileAnswers) return [];
    return KOTTER_CATALOG_ITEMS.map((item) => {
      const data = activeProfile.tileAnswers[item.slug] || {};
      const status = data._status || 'open';
      const actions = data._actions || [];
      const aiTip = data._aiTip || '';
      const answeredCount = item.prompts.filter((p) => (data[p.key] || '').trim().length > 0).length;
      return { ...item, status, actions, aiTip, answeredCount, totalPrompts: item.prompts.length, data };
    });
  }, [activeProfile?.tileAnswers]);

  const allActions = useMemo(() => {
    return kotterSummary.flatMap((k) =>
      k.actions.map((a) => ({ ...a, kotterSlug: k.slug, kotterLabel: k.label }))
    );
  }, [kotterSummary]);

  const completedKotter = kotterSummary.filter((k) => k.status === 'done').length;
  const inProgressKotter = kotterSummary.filter((k) => k.status === 'in_progress').length;

  const generateChecklist = useCallback(async () => {
    setChecklistGenLoading(true);
    try {
      const apiKey = await getOpenAIApiKey();
      const key = apiKey || localStorage.getItem('openai-api-key');
      if (!key?.startsWith('sk-')) {
        alert('Kein OpenAI API-Key gefunden.');
        return;
      }

      const kotterContext = kotterSummary
        .map((k) => {
          const answers = k.data
            ? KOTTER_CATALOG_ITEMS.find((i) => i.slug === k.slug)
                ?.prompts.map((p) => `  - ${p.question}: ${(k.data[p.key] || '').trim() || '(leer)'}`)
                .join('\n') || ''
            : '';
          const actionsText = k.actions.length > 0
            ? `  Maßnahmen: ${k.actions.map((a) => `${a.text} (${a.priority}, ${a.done ? 'erledigt' : 'offen'})`).join(', ')}`
            : '';
          return `${k.order}. ${k.label} [Status: ${k.status}]\n${answers}\n${actionsText}`;
        })
        .join('\n\n');

      const prepContext = prepData?.answers
        ? WORKSHOP_PREP_QUESTIONS.map((q) => `${q.question}: ${prepData.answers[q.key] || '(leer)'}`).join('\n')
        : '';

      const prompt = `Basierend auf den folgenden Workshop-Ergebnissen, erstelle eine priorisierte Checkliste für die nächsten 30, 60 und 90 Tage.

VORAB-FRAGEBOGEN:
${prepContext || '(nicht ausgefüllt)'}

KOTTER-ANALYSE:
${kotterContext}

Erstelle eine JSON-Antwort mit folgendem Format:
{
  "title": "Change-Checkliste [Projektname]",
  "items": [
    { "text": "Konkrete Aufgabe", "phase": "30d|60d|90d", "priority": "high|medium|low", "category": "kotter-slug oder general" }
  ]
}

Generiere 8-12 konkrete, umsetzbare Items basierend auf den identifizierten Lücken und Maßnahmen. Fokussiere auf die kritischsten Bereiche.`;

      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
        body: JSON.stringify({
          model: 'gpt-4.1',
          messages: [
            { role: 'system', content: 'Du bist ein Change-Management-Experte. Antworte ausschließlich mit validem JSON.' },
            { role: 'user', content: prompt },
          ],
          temperature: 0.5,
          max_tokens: 1500,
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const content = data.choices?.[0]?.message?.content || '';
      
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('Keine JSON-Antwort erhalten');
      
      const parsed = JSON.parse(jsonMatch[0]);
      const checklist = {
        id: newId(),
        title: parsed.title || 'KI-generierte Checkliste',
        generatedAt: new Date().toISOString(),
        source: 'ai',
        items: (parsed.items || []).map((item) => ({
          id: newId(),
          text: item.text,
          phase: item.phase,
          priority: item.priority || 'medium',
          category: item.category || 'general',
          done: false,
        })),
      };

      updateJourney((j) => ({
        ...j,
        checklists: [...j.checklists, checklist],
        startedAt: j.startedAt || new Date().toISOString(),
      }));
    } catch (e) {
      alert(e?.message || 'Checklisten-Generierung fehlgeschlagen');
    } finally {
      setChecklistGenLoading(false);
    }
  }, [kotterSummary, prepData, updateJourney]);

  const toggleChecklistItem = useCallback(
    (checklistId, itemId) => {
      updateJourney((j) => ({
        ...j,
        checklists: j.checklists.map((cl) =>
          cl.id === checklistId
            ? {
                ...cl,
                items: cl.items.map((item) =>
                  item.id === itemId ? { ...item, done: !item.done, doneAt: item.done ? null : new Date().toISOString() } : item
                ),
              }
            : cl
        ),
      }));
    },
    [updateJourney]
  );

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
        setCoachMessages((m) => [...m, { role: 'assistant', content: 'Kein API-Key gefunden. Bitte im Admin-Panel hinterlegen.' }]);
        return;
      }

      const kotterContext = kotterSummary
        .map((k) => `${k.order}. ${k.label}: ${k.status}, ${k.answeredCount}/${k.totalPrompts} Fragen, ${k.actions.length} Maßnahmen`)
        .join('\n');

      const prepContext = prepData?.answers
        ? `Vorab-Fragebogen:\n${WORKSHOP_PREP_QUESTIONS.map((q) => `- ${q.question}: ${prepData.answers[q.key] || '(leer)'}`).join('\n')}`
        : '';

      const systemPrompt = `Du bist ein erfahrener Change-Management-Coach. Du begleitest ein Veränderungsprojekt basierend auf dem Kotter-Modell.

KONTEXT ZUM PROJEKT:
${prepContext}

AKTUELLER KOTTER-STATUS:
${kotterContext}

${activeProfile?.aiSummary ? `KI-ZUSAMMENFASSUNG:\n${activeProfile.aiSummary}` : ''}

Beantworte Fragen zum Change-Prozess, gib praktische Tipps und ermutige. Antworte auf Deutsch, kurz und hilfreich.`;

      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
        body: JSON.stringify({
          model: 'gpt-4.1',
          messages: [
            { role: 'system', content: systemPrompt },
            ...coachMessages.slice(-6).map((m) => ({ role: m.role, content: m.content })),
            { role: 'user', content: userMsg },
          ],
          temperature: 0.7,
          max_tokens: 800,
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const reply = data.choices?.[0]?.message?.content || 'Entschuldigung, ich konnte keine Antwort generieren.';
      setCoachMessages((m) => [...m, { role: 'assistant', content: reply }]);
    } catch (e) {
      setCoachMessages((m) => [...m, { role: 'assistant', content: `Fehler: ${e?.message || 'Unbekannt'}` }]);
    } finally {
      setCoachLoading(false);
    }
  }, [coachInput, coachLoading, coachMessages, kotterSummary, prepData, activeProfile?.aiSummary]);

  const setCurrentPhase = useCallback(
    (phase) => {
      updateJourney((j) => ({ ...j, currentPhase: phase }));
    },
    [updateJourney]
  );

  if (isLoading) {
    return (
      <div className="cw-workshop min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
      </div>
    );
  }

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
              <Map className="w-4 h-4" aria-hidden />
              Change Journey
            </span>
          </div>
          {isSyncing && (
            <span className="inline-flex items-center gap-1.5 text-sm text-slate-600">
              <Loader2 className="w-4 h-4 animate-spin text-violet-600" aria-hidden />
              Speichern…
            </span>
          )}
        </div>
      </header>

      <main className="cw-container py-8 max-w-4xl space-y-6">
        {!activeProfile ? (
          <div className="cw-card text-center py-8">
            <Users className="w-10 h-10 mx-auto text-slate-400 mb-4" aria-hidden />
            <p className="text-slate-600">
              Kein Kundenpaket aktiv. Bitte zuerst im{' '}
              <Link to="/change-workflow/kotter/dringlichkeit" className="text-violet-600 underline">
                Workshop
              </Link>{' '}
              ein Paket anlegen und bearbeiten.
            </p>
          </div>
        ) : (
          <>
            <div className="cw-card bg-gradient-to-br from-violet-50/80 to-white">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-6 h-6 text-violet-600 shrink-0" aria-hidden />
                  <div>
                    <h1 className="text-xl font-bold text-slate-800 m-0">{activeProfile.customerLabel || 'Change Journey'}</h1>
                    <p className="text-sm text-slate-600 m-0">Langfristige Begleitung deines Veränderungsprojekts</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={createJourneyShareLink}
                    disabled={shareBusy}
                    className="cw-btn cw-btn-primary-solid cw-btn-compact inline-flex items-center gap-2"
                  >
                    {shareBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />}
                    {activeProfile.journeyShareToken ? 'Neuer Kunden-Link' : 'Mit Kunden teilen'}
                  </button>
                  {activeProfile.journeyShareToken && (
                    <>
                      <button
                        type="button"
                        onClick={refreshJourneyShare}
                        disabled={shareBusy}
                        className="cw-btn cw-btn-accent-outline cw-btn-compact inline-flex items-center gap-2"
                        title="Aktuellen Stand zum Kunden-Link synchronisieren"
                      >
                        <TrendingUp className="w-4 h-4" /> Aktualisieren
                      </button>
                      <button
                        type="button"
                        onClick={copyJourneyLink}
                        disabled={shareBusy}
                        className="cw-btn cw-btn-ghost cw-btn-compact inline-flex items-center gap-2"
                      >
                        <Copy className="w-4 h-4" /> Link kopieren
                      </button>
                    </>
                  )}
                </div>
              </div>
              {shareHint && (
                <p className="text-xs text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2 mb-4">{shareHint}</p>
              )}
              {activeProfile.journeyShareToken && (
                <p className="text-[11px] text-slate-500 font-mono break-all mb-4">
                  {buildJourneyShareUrl(activeProfile.journeyShareToken)}
                </p>
              )}

              <div className="flex items-stretch gap-3 overflow-x-auto pb-3">
                {JOURNEY_PHASES.map((phase, idx) => {
                  const isCurrent = journey.currentPhase === phase.id;
                  const isPast = JOURNEY_PHASES.findIndex((p) => p.id === journey.currentPhase) > idx;
                  const PhaseIcon = phase.icon;
                  return (
                    <button
                      key={phase.id}
                      type="button"
                      onClick={() => setCurrentPhase(phase.id)}
                      className={`flex-1 min-w-[160px] px-4 py-4 rounded-xl text-left transition-all ${
                        isCurrent
                          ? 'bg-violet-600 text-white shadow-lg'
                          : isPast
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <PhaseIcon className={`w-5 h-5 mb-2 ${isCurrent ? 'text-white' : isPast ? 'text-emerald-600' : 'text-slate-400'}`} />
                      <p className="text-sm font-semibold m-0 mb-1">{phase.label}</p>
                      <p className={`text-[11px] leading-snug m-0 ${isCurrent ? 'text-violet-200' : 'text-slate-500'}`}>{phase.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="cw-card text-center py-5 px-4">
                <p className="text-3xl font-bold text-violet-600 mb-2">{completedKotter}/8</p>
                <p className="text-sm text-slate-500 m-0">Kotter-Bereiche abgeschlossen</p>
              </div>
              <div className="cw-card text-center py-5 px-4">
                <p className="text-3xl font-bold text-amber-600 mb-2">{inProgressKotter}</p>
                <p className="text-sm text-slate-500 m-0">In Bearbeitung</p>
              </div>
              <div className="cw-card text-center py-5 px-4">
                <p className="text-3xl font-bold text-emerald-600 mb-2">
                  {allActions.filter((a) => a.done).length}/{allActions.length}
                </p>
                <p className="text-sm text-slate-500 m-0">Maßnahmen erledigt</p>
              </div>
            </div>

            <CollapsibleSection title="Workshop-Phasen" icon={ListChecks} badge={`${WORKSHOP_PHASE_CATALOG.filter((p) => activeProfile?.phaseAnswers?.[p.id]?._status === 'done').length}/8`} defaultOpen>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {WORKSHOP_PHASE_CATALOG.map((p) => {
                  const data = activeProfile?.phaseAnswers?.[p.id] || {};
                  const status = data._status || 'open';
                  const answeredCount = p.prompts.filter((pr) => (data[pr.key] || '').trim().length > 0).length;
                  const statusColors = {
                    done: 'bg-emerald-50 border-emerald-200 text-emerald-700',
                    in_progress: 'bg-amber-50 border-amber-200 text-amber-700',
                    open: 'bg-slate-50 border-slate-200 text-slate-600',
                  };
                  return (
                    <Link
                      key={p.id}
                      to={`/change-workflow/phase/${p.id}`}
                      className={`px-4 py-4 rounded-xl border text-center no-underline transition-transform hover:scale-105 ${statusColors[status]}`}
                    >
                      <p className="text-xl font-bold m-0 mb-1">{p.order}</p>
                      <p className="text-xs font-semibold m-0 mb-2 leading-tight">{p.label}</p>
                      <div className="flex items-center justify-center gap-1.5">
                        {status === 'done' ? <CheckCircle className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                        <span className="text-[11px]">{answeredCount}/{p.prompts.length}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </CollapsibleSection>

            <CollapsibleSection title="Kotter-Status-Übersicht" icon={Target} badge={`${completedKotter}/8`} defaultOpen>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {kotterSummary.map((k) => {
                  const statusColors = {
                    done: 'bg-emerald-50 border-emerald-200 text-emerald-700',
                    in_progress: 'bg-amber-50 border-amber-200 text-amber-700',
                    open: 'bg-slate-50 border-slate-200 text-slate-600',
                  };
                  return (
                    <Link
                      key={k.slug}
                      to={`/change-workflow/kotter/${k.slug}`}
                      className={`px-4 py-4 rounded-xl border text-center no-underline transition-transform hover:scale-105 ${statusColors[k.status]}`}
                    >
                      <p className="text-xl font-bold m-0 mb-1">{k.order}</p>
                      <p className="text-xs font-semibold m-0 mb-2 leading-tight">{k.label}</p>
                      <div className="flex items-center justify-center gap-1.5">
                        {k.status === 'done' ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : k.status === 'in_progress' ? (
                          <Circle className="w-4 h-4 fill-current" />
                        ) : (
                          <Circle className="w-4 h-4" />
                        )}
                        <span className="text-[11px]">{k.answeredCount}/{k.totalPrompts}</span>
                      </div>
                      {k.actions.length > 0 && (
                        <p className="text-[11px] mt-2 m-0">
                          {k.actions.filter((a) => a.done).length}/{k.actions.length} Maßnahmen
                        </p>
                      )}
                    </Link>
                  );
                })}
              </div>
            </CollapsibleSection>

            <CollapsibleSection
              title="Dynamische Checklisten"
              icon={ListChecks}
              badge={journey.checklists.length > 0 ? `${journey.checklists.length}` : null}
              defaultOpen
            >
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={generateChecklist}
                    disabled={checklistGenLoading}
                    className="cw-btn cw-btn-primary-solid cw-btn-compact inline-flex items-center gap-2"
                  >
                    {checklistGenLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    KI-Checkliste generieren
                  </button>
                </div>

                {journey.checklists.length === 0 ? (
                  <p className="text-sm text-slate-500 italic">
                    Noch keine Checklisten erstellt. Klicke «KI-Checkliste generieren» um basierend auf deinen Workshop-Ergebnissen
                    eine priorisierte Aufgabenliste zu erhalten.
                  </p>
                ) : (
                  journey.checklists.map((checklist) => (
                    <div key={checklist.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-center justify-between mb-3">
                        <p className="font-semibold text-slate-800 m-0">{checklist.title}</p>
                        <span className="text-[10px] text-slate-500">
                          {new Date(checklist.generatedAt).toLocaleDateString('de-CH')}
                        </span>
                      </div>
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
                                  className={`flex items-start gap-2 p-2 rounded-lg ${
                                    item.done ? 'bg-emerald-50' : 'bg-white'
                                  }`}
                                >
                                  <button
                                    type="button"
                                    onClick={() => toggleChecklistItem(checklist.id, item.id)}
                                    className={`mt-0.5 shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                                      item.done
                                        ? 'bg-emerald-500 border-emerald-500 text-white'
                                        : 'border-slate-300 hover:border-violet-400'
                                    }`}
                                  >
                                    {item.done && <CheckCircle className="w-3 h-3" />}
                                  </button>
                                  <span className={`text-sm flex-1 ${item.done ? 'line-through text-slate-500' : 'text-slate-700'}`}>
                                    {item.text}
                                  </span>
                                  <span
                                    className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                                      item.priority === 'high'
                                        ? 'bg-red-100 text-red-700'
                                        : item.priority === 'medium'
                                        ? 'bg-amber-100 text-amber-700'
                                        : 'bg-slate-100 text-slate-600'
                                    }`}
                                  >
                                    {item.priority}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                      <p className="text-xs text-slate-500 mt-3">
                        {checklist.items.filter((i) => i.done).length}/{checklist.items.length} erledigt
                      </p>
                    </div>
                  ))
                )}
              </div>
            </CollapsibleSection>

            <CollapsibleSection title="KI-Coach" icon={MessageSquare} defaultOpen>
              <div className="space-y-4">
                <div className="h-64 overflow-y-auto rounded-xl border border-slate-200 bg-white p-3 space-y-3">
                  {coachMessages.map((msg, idx) => (
                    <div key={idx} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                          msg.role === 'user' ? 'bg-violet-100' : 'bg-slate-100'
                        }`}
                      >
                        {msg.role === 'user' ? (
                          <Users className="w-4 h-4 text-violet-600" />
                        ) : (
                          <Bot className="w-4 h-4 text-slate-600" />
                        )}
                      </div>
                      <div
                        className={`max-w-[80%] p-3 rounded-xl text-sm ${
                          msg.role === 'user'
                            ? 'bg-violet-100 text-violet-900 rounded-tr-none'
                            : 'bg-slate-100 text-slate-700 rounded-tl-none'
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {coachLoading && (
                    <div className="flex gap-2">
                      <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
                        <Bot className="w-4 h-4 text-slate-600" />
                      </div>
                      <div className="bg-slate-100 p-3 rounded-xl rounded-tl-none">
                        <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
                      </div>
                    </div>
                  )}
                </div>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    sendCoachMessage();
                  }}
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    value={coachInput}
                    onChange={(e) => setCoachInput(e.target.value)}
                    placeholder="Frag mich etwas zum Change-Prozess…"
                    className="cw-input-text flex-1"
                    disabled={coachLoading}
                  />
                  <button
                    type="submit"
                    disabled={!coachInput.trim() || coachLoading}
                    className="cw-btn cw-btn-primary-solid cw-btn-compact"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Wie motiviere ich Skeptiker?',
                    'Was sind typische Quick Wins?',
                    'Wie verankere ich den Change?',
                  ].map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => {
                        setCoachInput(q);
                      }}
                      className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-violet-100 hover:text-violet-700 transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </CollapsibleSection>

            <CollapsibleSection title="Alle Workshop-Maßnahmen" icon={Lightbulb} badge={allActions.length > 0 ? `${allActions.length}` : null}>
              {allActions.length === 0 ? (
                <p className="text-sm text-slate-500 italic">
                  Noch keine Maßnahmen in den Kotter-Kacheln definiert.{' '}
                  <Link to="/change-workflow/kotter/dringlichkeit" className="text-violet-600 underline">
                    Zur ersten Kachel
                  </Link>
                </p>
              ) : (
                <div className="space-y-2">
                  {allActions.map((action) => (
                    <div
                      key={action.id}
                      className={`flex items-start gap-3 p-3 rounded-lg border ${
                        action.done ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-200'
                      }`}
                    >
                      <div
                        className={`shrink-0 w-5 h-5 rounded flex items-center justify-center ${
                          action.done ? 'bg-emerald-500 text-white' : 'border-2 border-slate-300'
                        }`}
                      >
                        {action.done && <CheckCircle className="w-3 h-3" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm m-0 ${action.done ? 'line-through text-slate-500' : 'text-slate-800'}`}>
                          {action.text || <em className="text-slate-400">Ohne Beschreibung</em>}
                        </p>
                        <p className="text-[10px] text-slate-500 mt-1 m-0">
                          {action.kotterLabel} ·{' '}
                          <span
                            className={
                              action.priority === 'high'
                                ? 'text-red-600'
                                : action.priority === 'medium'
                                ? 'text-amber-600'
                                : 'text-slate-500'
                            }
                          >
                            {action.priority}
                          </span>
                        </p>
                      </div>
                      <Link
                        to={`/change-workflow/kotter/${action.kotterSlug}`}
                        className="text-xs text-violet-600 hover:underline shrink-0"
                      >
                        Bearbeiten
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </CollapsibleSection>
          </>
        )}
      </main>
    </div>
  );
}
