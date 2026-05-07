import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Bot,
  Calendar,
  CheckCircle,
  ChevronDown,
  ClipboardList,
  Copy,
  Download,
  ExternalLink,
  FileText,
  Link2,
  Loader2,
  Mail,
  RefreshCw,
  Sparkles,
  Users,
} from 'lucide-react';

import '../styles/change-workshop.css';
import { useProgress } from '../hooks/useLocalStorage';
import { getOpenAIApiKey, loadProgress, saveProgress } from '../services/awsService';
import { KOTTER_CATALOG_ITEMS } from '../data/kotterCatalogData';
import {
  buildMirrorPrepFromFacilitatorProfile,
  buildProgressBlobWithWorkshopPrep,
  WORKSHOP_PREP_QUESTIONS,
  workshopPrepUserId,
} from '../utils/workshopPrepShare';

function newToken() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `t_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function buildPrepShareUrl(token) {
  try {
    const base = `${window.location.origin}${import.meta.env.BASE_URL}`;
    const root = base.endsWith('/') ? base : `${base}/`;
    return new URL(`workshop-prep/${encodeURIComponent(String(token || '').trim())}`, root).href;
  } catch {
    return `/onboarding/workshop-prep/${encodeURIComponent(String(token || '').trim())}`;
  }
}

function buildIcsContent({ title, description, startDate, durationMinutes = 30, url }) {
  const pad = (n) => String(n).padStart(2, '0');
  const formatDate = (d) => {
    const dt = new Date(d);
    return `${dt.getUTCFullYear()}${pad(dt.getUTCMonth() + 1)}${pad(dt.getUTCDate())}T${pad(dt.getUTCHours())}${pad(dt.getUTCMinutes())}00Z`;
  };
  const start = new Date(startDate);
  const end = new Date(start.getTime() + durationMinutes * 60000);
  const now = new Date();
  const uid = `${now.getTime()}-${Math.random().toString(36).slice(2)}@valkeen.ch`;
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Valkeen//Workshop-Tools//DE',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${formatDate(now)}`,
    `DTSTART:${formatDate(start)}`,
    `DTEND:${formatDate(end)}`,
    `SUMMARY:${title.replace(/\n/g, '\\n')}`,
    `DESCRIPTION:${(description + (url ? `\\n\\nLink: ${url}` : '')).replace(/\n/g, '\\n')}`,
    url ? `URL:${url}` : '',
    'END:VEVENT',
    'END:VCALENDAR',
  ]
    .filter(Boolean)
    .join('\r\n');
}

function downloadIcs(filename, content) {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function CollapsibleSection({ title, icon: Icon, defaultOpen = false, children }) {
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
        </span>
        <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden />
      </button>
      {open && <div className="mt-4 pt-4 border-t border-slate-200">{children}</div>}
    </div>
  );
}

const AI_SUMMARY_PROMPT = `Du bist ein erfahrener Change-Management-Berater. Analysiere die folgenden Workshop-Ergebnisse zu den 8 Kotter-Bereichen und erstelle eine strukturierte Zusammenfassung.

Formatiere deine Antwort wie folgt:

## Executive Summary
(3-5 Sätze: Was ist die Kernaussage? Wo steht das Projekt im Change-Prozess?)

## Kritischste Bereiche (Top 3)
(Welche der 8 Bereiche zeigen den größten Handlungsbedarf? Begründe kurz.)

## Stärken
(Was läuft bereits gut? Welche Grundlagen sind vorhanden?)

## Empfohlene nächste Schritte
(3-5 konkrete, priorisierte Maßnahmen)

---

Kotter-Bereiche und Antworten:
`;

export default function WorkshopTools() {
  const { progress, isLoading, isSyncing, updateChangeWorkshopKotter } = useProgress();

  const kotter = progress.changeWorkshopKotter || { activeProfileId: null, profiles: {} };
  const { activeProfileId, profiles } = kotter;
  const activeProfile = activeProfileId ? profiles[activeProfileId] : null;

  const [prepBusy, setPrepBusy] = useState(false);
  const [prepHint, setprepHint] = useState('');
  const [prepData, setPrepData] = useState(null);
  const [prepLoading, setPrepLoading] = useState(false);

  const [aiSummaryBusy, setAiSummaryBusy] = useState(false);
  const [aiSummary, setAiSummary] = useState(activeProfile?.aiSummary || '');
  const [aiError, setAiError] = useState('');

  const [reminderDate, setReminderDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });

  useEffect(() => {
    if (!prepHint) return;
    const t = setTimeout(() => setprepHint(''), 4500);
    return () => clearTimeout(t);
  }, [prepHint]);

  useEffect(() => {
    if (activeProfile?.aiSummary) setAiSummary(activeProfile.aiSummary);
  }, [activeProfile?.aiSummary]);

  const createPrepLink = useCallback(async () => {
    if (!activeProfile) return;
    setPrepBusy(true);
    try {
      const token = newToken();
      const prepBlob = buildMirrorPrepFromFacilitatorProfile(activeProfile);
      await saveProgress(buildProgressBlobWithWorkshopPrep(prepBlob), workshopPrepUserId(token));
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
              prepShareToken: token,
              prepShareCreatedAt: new Date().toISOString(),
            },
          },
        };
      });
      const url = buildPrepShareUrl(token);
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        setprepHint('Vorab-Link in Zwischenablage kopiert!');
      } else {
        window.prompt('Vorab-Link:', url);
      }
    } catch (e) {
      window.alert(e?.message || 'Fehler beim Erstellen');
    } finally {
      setPrepBusy(false);
    }
  }, [activeProfile, updateChangeWorkshopKotter]);

  const copyPrepLink = useCallback(async () => {
    const tok = activeProfile?.prepShareToken;
    if (!tok) return;
    const url = buildPrepShareUrl(tok);
    try {
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(url);
      else window.prompt('Link:', url);
      setprepHint('Link erneut kopiert.');
    } catch {
      window.prompt('Link:', url);
    }
  }, [activeProfile?.prepShareToken]);

  const loadPrepAnswers = useCallback(async () => {
    const tok = activeProfile?.prepShareToken;
    if (!tok) return;
    setPrepLoading(true);
    try {
      const blob = await loadProgress(workshopPrepUserId(tok));
      setPrepData(blob?.workshopPrep || null);
    } catch (e) {
      window.alert(e?.message || 'Laden fehlgeschlagen');
    } finally {
      setPrepLoading(false);
    }
  }, [activeProfile?.prepShareToken]);

  const kotterAnswersForAi = useMemo(() => {
    if (!activeProfile?.tileAnswers) return '';
    const parts = KOTTER_CATALOG_ITEMS.map((item) => {
      const ans = activeProfile.tileAnswers[item.slug];
      if (!ans || Object.keys(ans).length === 0) return null;
      const lines = item.prompts
        .map((p) => {
          const val = (ans[p.key] || '').trim();
          return val ? `  - ${p.question}\n    ${val}` : null;
        })
        .filter(Boolean);
      return lines.length > 0 ? `### ${item.order}. ${item.label}\n${lines.join('\n')}` : null;
    }).filter(Boolean);
    return parts.join('\n\n');
  }, [activeProfile?.tileAnswers]);

  const generateAiSummary = useCallback(async () => {
    if (!kotterAnswersForAi.trim()) {
      window.alert('Es liegen noch keine Kotter-Antworten vor.');
      return;
    }
    setAiSummaryBusy(true);
    setAiError('');
    try {
      const apiKey = await getOpenAIApiKey();
      if (!apiKey) {
        const localKey = localStorage.getItem('openai-api-key');
        if (!localKey?.startsWith('sk-')) {
          setAiError('Kein OpenAI API-Key gefunden. Bitte im Admin-Panel hinterlegen.');
          return;
        }
      }
      const key = apiKey || localStorage.getItem('openai-api-key');
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
        body: JSON.stringify({
          model: 'gpt-4.1',
          messages: [
            { role: 'system', content: 'Du bist ein erfahrener Change-Management-Berater.' },
            { role: 'user', content: AI_SUMMARY_PROMPT + kotterAnswersForAi },
          ],
          temperature: 0.5,
          max_tokens: 1500,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || `HTTP ${res.status}`);
      }
      const data = await res.json();
      const summary = data.choices?.[0]?.message?.content || '';
      setAiSummary(summary);
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
              aiSummary: summary,
              aiSummaryGeneratedAt: new Date().toISOString(),
            },
          },
        };
      });
    } catch (e) {
      setAiError(e?.message || 'Fehler bei KI-Anfrage');
    } finally {
      setAiSummaryBusy(false);
    }
  }, [kotterAnswersForAi, updateChangeWorkshopKotter]);

  const heatmapData = useMemo(() => {
    if (!activeProfile?.tileAnswers) return [];
    return KOTTER_CATALOG_ITEMS.map((item) => {
      const ans = activeProfile.tileAnswers[item.slug] || {};
      const totalChars = Object.values(ans).reduce((sum, v) => sum + String(v || '').trim().length, 0);
      const answeredCount = item.prompts.filter((p) => (ans[p.key] || '').trim().length > 0).length;
      const completeness = item.prompts.length > 0 ? answeredCount / item.prompts.length : 0;
      return { ...item, totalChars, completeness, answeredCount };
    });
  }, [activeProfile?.tileAnswers]);

  const maxChars = useMemo(() => Math.max(...heatmapData.map((d) => d.totalChars), 1), [heatmapData]);

  const downloadFollowupIcs = useCallback(() => {
    if (!activeProfile) return;
    const label = activeProfile.customerLabel || 'Workshop';
    const url = window.location.origin + import.meta.env.BASE_URL + 'change-workflow';
    const ics = buildIcsContent({
      title: `Follow-up: ${label}`,
      description: `Reminder für Workshop-Nachbereitung.\n\nKundenpaket: ${label}\nKotter-Antworten im Onboarding-Hub prüfen und nächste Schritte einleiten.`,
      startDate: new Date(reminderDate + 'T09:00:00'),
      durationMinutes: 30,
      url,
    });
    downloadIcs(`followup-${label.replace(/\s+/g, '-').toLowerCase()}.ics`, ics);
  }, [activeProfile, reminderDate]);

  const emailTemplate = useMemo(() => {
    if (!activeProfile) return '';
    const label = activeProfile.customerLabel || 'Workshop';
    return `Betreff: Follow-up: ${label} – Nächste Schritte

Guten Tag,

wie im Workshop besprochen, hier eine kurze Zusammenfassung der nächsten Schritte:

1. [Aktion 1]
2. [Aktion 2]
3. [Aktion 3]

Die Workshop-Ergebnisse (Kotter-Analyse, Protokoll) finden Sie unter:
${window.location.origin + import.meta.env.BASE_URL}change-workflow

Bei Fragen stehe ich gerne zur Verfügung.

Freundliche Grüsse
[Ihr Name]`;
  }, [activeProfile]);

  const copyEmailTemplate = useCallback(async () => {
    try {
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(emailTemplate);
      else window.prompt('E-Mail-Vorlage:', emailTemplate);
    } catch {
      window.prompt('E-Mail-Vorlage:', emailTemplate);
    }
  }, [emailTemplate]);

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
            <span className="cw-kicker">Workshop-Tools</span>
          </div>
          {isSyncing && (
            <span className="inline-flex items-center gap-1.5 text-sm text-slate-600">
              <Loader2 className="w-4 h-4 animate-spin text-violet-600" aria-hidden />
              Speichern…
            </span>
          )}
        </div>
      </header>

      <main className="cw-container py-8 max-w-3xl space-y-6">
        {!activeProfile ? (
          <div className="cw-card text-center py-8">
            <Users className="w-10 h-10 mx-auto text-slate-400 mb-4" aria-hidden />
            <p className="text-slate-600">
              Kein Kundenpaket aktiv. Bitte zuerst in einer{' '}
              <Link to="/change-workflow/kotter/dringlichkeit" className="text-violet-600 underline">
                Kotter-Kachel
              </Link>{' '}
              ein Paket anlegen.
            </p>
          </div>
        ) : (
          <>
            <div className="cw-card bg-gradient-to-br from-violet-50/80 to-white">
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-5 h-5 text-violet-600 shrink-0" aria-hidden />
                <span className="font-semibold text-slate-800">Aktives Kundenpaket</span>
              </div>
              <p className="text-lg font-bold text-violet-700 m-0">
                {activeProfile.customerLabel || 'Ohne Bezeichnung'}
              </p>
              <p className="text-xs text-slate-500 mt-1 m-0">
                Zuletzt aktualisiert: {activeProfile.updatedAt ? new Date(activeProfile.updatedAt).toLocaleString('de-CH') : '—'}
              </p>
            </div>

            <CollapsibleSection title="Vorab-Fragebogen für Kund:innen" icon={ClipboardList} defaultOpen>
              <p className="text-sm text-slate-600 mb-4">
                Erstelle einen Link, den Kund:innen <strong>vor dem Workshop</strong> ausfüllen. Die Antworten helfen bei
                der gezielten Vorbereitung.
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                <button
                  type="button"
                  className="cw-btn cw-btn-primary-solid cw-btn-compact inline-flex items-center gap-2"
                  onClick={createPrepLink}
                  disabled={prepBusy || isLoading}
                >
                  {prepBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
                  Neuen Vorab-Link
                </button>
                <button
                  type="button"
                  className="cw-btn cw-btn-ghost cw-btn-compact inline-flex items-center gap-2"
                  onClick={copyPrepLink}
                  disabled={!activeProfile.prepShareToken || prepBusy}
                >
                  <Copy className="w-4 h-4" /> Link kopieren
                </button>
                <button
                  type="button"
                  className="cw-btn cw-btn-accent-outline cw-btn-compact inline-flex items-center gap-2"
                  onClick={loadPrepAnswers}
                  disabled={!activeProfile.prepShareToken || prepLoading}
                >
                  {prepLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  Antworten laden
                </button>
              </div>
              {activeProfile.prepShareToken && (
                <p className="text-[11px] text-slate-500 font-mono break-all mb-4">
                  {buildPrepShareUrl(activeProfile.prepShareToken)}
                </p>
              )}
              {prepHint && <p className="text-xs text-emerald-700 mb-4">{prepHint}</p>}
              {prepData && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Eingegangene Antworten</p>
                  {WORKSHOP_PREP_QUESTIONS.map((q) => {
                    const val = (prepData.answers?.[q.key] || '').trim();
                    return (
                      <div key={q.key} className="text-sm">
                        <p className="font-semibold text-slate-700 m-0">{q.question}</p>
                        <p className="text-slate-600 m-0 mt-1 whitespace-pre-wrap">{val || <em className="text-slate-400">— nicht beantwortet —</em>}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </CollapsibleSection>

            <CollapsibleSection title="KI-Zusammenfassung (Kotter-Analyse)" icon={Sparkles}>
              <p className="text-sm text-slate-600 mb-4">
                Generiert eine strukturierte Zusammenfassung der Kotter-Antworten mit Handlungsempfehlungen.
              </p>
              <button
                type="button"
                className="cw-btn cw-btn-primary-solid cw-btn-compact inline-flex items-center gap-2 mb-4"
                onClick={generateAiSummary}
                disabled={aiSummaryBusy || isLoading}
              >
                {aiSummaryBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bot className="w-4 h-4" />}
                Zusammenfassung generieren
              </button>
              {aiError && <p className="text-sm text-red-700 mb-4">{aiError}</p>}
              {aiSummary && (
                <div className="rounded-xl border border-violet-200 bg-violet-50/50 p-4">
                  <p className="text-xs font-semibold text-violet-600 uppercase tracking-wide mb-2">KI-Zusammenfassung</p>
                  <div className="prose prose-sm prose-slate max-w-none whitespace-pre-wrap">{aiSummary}</div>
                  {activeProfile.aiSummaryGeneratedAt && (
                    <p className="text-[10px] text-slate-400 mt-3">
                      Generiert am {new Date(activeProfile.aiSummaryGeneratedAt).toLocaleString('de-CH')}
                    </p>
                  )}
                </div>
              )}
            </CollapsibleSection>

            <CollapsibleSection title="Kotter-Heatmap (Antwort-Dichte)" icon={FileText}>
              <p className="text-sm text-slate-600 mb-4">
                Visualisiert, welche Kotter-Bereiche ausführlich beantwortet wurden (grün) und wo noch Lücken sind (rot).
              </p>
              <div className="grid grid-cols-4 gap-2">
                {heatmapData.map((item) => {
                  const intensity = item.totalChars / maxChars;
                  const hue = intensity * 120; // 0=rot, 120=grün
                  const bg = `hsl(${hue}, 70%, ${85 - intensity * 25}%)`;
                  const border = `hsl(${hue}, 60%, ${70 - intensity * 20}%)`;
                  return (
                    <Link
                      key={item.slug}
                      to={`/change-workflow/kotter/${item.slug}`}
                      className="rounded-lg p-3 text-center no-underline transition-transform hover:scale-105"
                      style={{ backgroundColor: bg, borderColor: border, borderWidth: 1, borderStyle: 'solid' }}
                      title={`${item.answeredCount}/${item.prompts.length} Fragen, ${item.totalChars} Zeichen`}
                    >
                      <span className="text-xs font-bold text-slate-700">{item.order}.</span>
                      <span className="block text-xs font-semibold text-slate-800 mt-1 leading-tight">{item.label}</span>
                      <span className="block text-[10px] text-slate-600 mt-1">
                        {Math.round(item.completeness * 100)}%
                      </span>
                    </Link>
                  );
                })}
              </div>
              <div className="flex items-center gap-3 mt-4 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <span className="w-4 h-4 rounded" style={{ background: 'hsl(0, 70%, 85%)' }} /> Wenig
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-4 h-4 rounded" style={{ background: 'hsl(60, 70%, 72%)' }} /> Mittel
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-4 h-4 rounded" style={{ background: 'hsl(120, 70%, 60%)' }} /> Viel
                </span>
              </div>
            </CollapsibleSection>

            <CollapsibleSection title="Follow-up Reminder" icon={Calendar}>
              <p className="text-sm text-slate-600 mb-4">
                Kalendereintrag oder E-Mail-Vorlage für die Workshop-Nachbereitung.
              </p>
              <div className="flex flex-wrap items-end gap-4 mb-4">
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-slate-500">Reminder-Datum</span>
                  <input
                    type="date"
                    className="cw-input-text"
                    value={reminderDate}
                    onChange={(e) => setReminderDate(e.target.value)}
                  />
                </label>
                <button
                  type="button"
                  className="cw-btn cw-btn-accent-outline cw-btn-compact inline-flex items-center gap-2"
                  onClick={downloadFollowupIcs}
                >
                  <Download className="w-4 h-4" /> ICS herunterladen
                </button>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide m-0">E-Mail-Vorlage</p>
                  <button
                    type="button"
                    className="text-xs text-violet-600 hover:underline inline-flex items-center gap-1"
                    onClick={copyEmailTemplate}
                  >
                    <Copy className="w-3 h-3" /> Kopieren
                  </button>
                </div>
                <pre className="text-xs text-slate-600 whitespace-pre-wrap font-sans m-0">{emailTemplate}</pre>
              </div>
            </CollapsibleSection>
          </>
        )}
      </main>
    </div>
  );
}
