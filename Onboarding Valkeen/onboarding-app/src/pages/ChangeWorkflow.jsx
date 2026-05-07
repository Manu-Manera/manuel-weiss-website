import { useMemo, useState, useCallback, useId, useEffect } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import {
  Check,
  ClipboardList,
  ChevronDown,
  FileDown,
  Sparkles,
  PenLine,
  PanelLeftOpen,
  Goal,
  Loader2,
  ExternalLink,
  ListChecks,
  Eye,
  Clock,
  Copy,
  Monitor,
} from 'lucide-react';

import '../styles/change-workshop.css';

import { useLocalStorage, useProgress } from '../hooks/useLocalStorage';
import {
  CHANGE_WORKFLOW_META,
  CHANGE_PHASES,
  CHANGE_PHASE_DIAGRAMS,
  CHANGE_WORKFLOW_REMOTE_META,
} from '../data/changeWorkflowData';
import { downloadChangeWorkshopPdf, previewChangeWorkshopPdf } from '../utils/changeWorkflowPdf';
import { ChangeWorkflowDiagrams } from '../components/change-workflow/ChangeWorkflowDiagrams';

const CHECKLIST_KEY = 'change_workflow_facilitator_checks_v1';
const NOTES_KEY = 'change_workflow_phase_notes_v1';
const SESSION_TITLE_KEY = 'change_workflow_session_title_v1';
const FACILITATOR_MODE_KEY = 'change_workflow_facilitator_mode_v1';
const FOLLOW_UP_KEY = 'change_workflow_follow_up_v1';

function GuidelineAccordion({ step, defaultOpen }) {
  const [open, setOpen] = useState(!!defaultOpen);
  const panelId = useId();
  const headerId = useId();

  return (
    <div className="cw-acc">
      <button
        type="button"
        id={headerId}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className="cw-acc-trigger"
      >
        <span className="leading-snug pr-2">{step.title}</span>
        <ChevronDown
          className={`cw-acc-chevron ${open ? 'is-open' : ''}`}
          aria-hidden
        />
      </button>
      <div
        id={panelId}
        role="region"
        aria-labelledby={headerId}
        hidden={!open}
      >
        {open && (
          <div className="cw-acc-panel">
            <div className="cw-acc-panel-inner">
              {step.body && <p>{step.body}</p>}
              {step.bullets?.length > 0 && (
                <ul className="cw-acc-list">
                  {step.bullets.map((b, i) => (
                    <li key={i}>
                      <span className="cw-bullet-dot" aria-hidden />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PhaseStepper({ phaseId, onSelect }) {
  const idxActive = CHANGE_PHASES.findIndex((p) => p.id === phaseId);

  return (
    <nav className="cw-wh-stepper-nav w-full" aria-label="Phasen">
      <ol className="cw-step-list py-0 px-0.5">
        {CHANGE_PHASES.map((p, idx) => {
          const active = p.id === phaseId;
          const done = idx < idxActive;
          const connectorDone = idx > 0 && idxActive >= idx;
          return (
            <li key={p.id} className="flex items-stretch gap-2.5 sm:gap-3">
              {idx > 0 && (
                <span
                  className={`cw-step-separator ${connectorDone ? 'is-done' : ''}`}
                  aria-hidden
                />
              )}
              <button
                type="button"
                onClick={() => onSelect(p.id)}
                className={`cw-step ${active ? 'is-active' : ''} ${done ? 'is-done' : ''}`}
              >
                <span className="cw-step-label-top">
                  {done ? (
                    <span className="inline-flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5" aria-hidden /> Schritt {idx + 1}
                    </span>
                  ) : (
                    <>Schritt {idx + 1}</>
                  )}
                </span>
                <span className="cw-step-title">{p.label}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function SegmentSwitch({ tab, setTab }) {
  return (
    <div
      role="tablist"
      aria-label="Ansicht wechseln"
      className="cw-segment xl:hidden"
    >
      {[
        { id: 'guide', label: 'Leitfaden' },
        { id: 'notes', label: 'Protokoll' },
      ].map(({ id, label }) => (
        <button
          key={id}
          type="button"
          role="tab"
          aria-selected={tab === id}
          onClick={() => setTab(id)}
          className="cw-segment-btn"
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function formatTimer(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function guessTimerPresetMinutes(phase) {
  const n = phase?.remotePlaybook?.timerSuggestionMinutes;
  if (typeof n === 'number' && n > 0) return Math.min(Math.round(n), 240);
  const hit = String(phase?.durationHint || '').match(/(\d+)\s*Min/i);
  if (hit) return Math.min(Number(hit[1]), 240);
  return 15;
}

function PhaseTimer({ presetMinutes }) {
  const [remaining, setRemaining] = useState(presetMinutes * 60);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    setRemaining(presetMinutes * 60);
    setRunning(false);
  }, [presetMinutes]);

  useEffect(() => {
    if (!running) return undefined;
    const id = window.setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          queueMicrotask(() => setRunning(false));
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [running]);

  const onReset = () => {
    setRunning(false);
    setRemaining(presetMinutes * 60);
  };

  return (
    <div className="cw-timer-strip" role="group" aria-label="Zeitnehmer für diese Phase">
      <div className="cw-timer-left">
        <Clock className="cw-timer-icon" aria-hidden />
        <span className="cw-timer-label">Phasentimer · Vorschlag {presetMinutes} Min.</span>
        <span className="cw-timer-display" aria-live="polite">
          {formatTimer(remaining)}
        </span>
      </div>
      <div className="cw-timer-actions">
        <button type="button" className="cw-btn cw-btn-ghost cw-btn-compact" onClick={() => setRunning((x) => !x)}>
          {running ? 'Pause' : 'Start'}
        </button>
        <button type="button" className="cw-btn cw-btn-outline-muted cw-btn-compact" onClick={onReset}>
          Zurücksetzen
        </button>
      </div>
    </div>
  );
}

function CopySnippetButton({ text, label }) {
  const [ok, setOk] = useState(false);

  const onCopy = useCallback(async () => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setOk(true);
      window.setTimeout(() => setOk(false), 2000);
    } catch {
      window.alert('Zwischenablage nicht verfügbar — Text bitte manuell kopieren.');
    }
  }, [text]);

  return (
    <div className="cw-copy-block">
      <pre className="cw-copy-pre" tabIndex={0}>
        {text}
      </pre>
      <button type="button" className="cw-btn cw-btn-accent-outline cw-btn-compact cw-copy-btn" onClick={onCopy}>
        <Copy className="w-4 h-4 shrink-0" aria-hidden />
        {ok ? 'Kopiert' : label}
      </button>
    </div>
  );
}

function RemotePlaybookPanel({ playbook }) {
  if (!playbook || typeof playbook !== 'object') return null;

  const hasInvite = !!playbook.breakoutInvite?.trim();
  const hasSetup = playbook.facilitatorSetup?.length > 0;
  const showFormat = !!playbook.workFormat?.trim();
  const hasRecap = !!playbook.recapPrompt?.trim();
  const hasPark = !!playbook.parkPlatePrompt?.trim();

  if (!hasInvite && !hasSetup && !showFormat && !hasRecap && !hasPark) return null;

  return (
    <section className="cw-remote-panel" aria-label="Moderation: Remote-Ablauf dieser Phase">
      <div className="cw-remote-panel-head">
        <Monitor className="cw-remote-panel-icon" aria-hidden />
        <div>
          <p className="cw-remote-panel-title">Remote-Ablauf (Moderator:innen)</p>
          <p className="cw-remote-panel-sub">
            Hinweise für Videokonferenzen — formulierungsneutral, ohne Tool-Zwang.
          </p>
        </div>
      </div>

      {hasSetup && (
        <div className="cw-remote-section">
          <p className="cw-remote-label">Setup vor dem Slot</p>
          <ul className="cw-remote-list">
            {playbook.facilitatorSetup.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        </div>
      )}

      {showFormat && (
        <div className="cw-remote-section">
          <p className="cw-remote-label">Empfohlene Arbeitsform</p>
          <p className="cw-remote-body">{playbook.workFormat}</p>
        </div>
      )}

      {hasInvite && (
        <div className="cw-remote-section">
          <p className="cw-remote-label">Breakout-/Arbeits‑Skript (copy & paste)</p>
          <CopySnippetButton text={playbook.breakoutInvite} label="Einladung kopieren" />
        </div>
      )}

      {hasRecap && (
        <div className="cw-remote-section">
          <p className="cw-remote-label">Nach der Arbeit</p>
          <p className="cw-remote-body">{playbook.recapPrompt}</p>
        </div>
      )}

      {hasPark && (
        <div className="cw-remote-section">
          <p className="cw-remote-label">Parkplatz</p>
          <p className="cw-remote-body">{playbook.parkPlatePrompt}</p>
        </div>
      )}
    </section>
  );
}

function NeutralDualTrackCallout({ payload }) {
  if (!payload?.rows?.length) return null;

  return (
    <section className="cw-dual-callout" aria-label={payload.heading}>
      <p className="cw-callout-heading">{payload.heading}</p>
      {payload.intro && <p className="cw-callout-body cw-dual-intro">{payload.intro}</p>}
      <dl className="cw-dual-grid">
        {payload.rows.map((row, idx) => (
          <div className="cw-dual-cell" key={idx}>
            <dt>{row.pillar}</dt>
            <dd>{row.examples}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function ScreenShareChecklistCollapse() {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const headerId = useId();

  return (
    <div className="cw-screen-coll">
      <button
        type="button"
        id={headerId}
        className="cw-screen-coll-trigger"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
      >
        <Monitor className="w-4 h-4 shrink-0 opacity-85" aria-hidden />
        <span>Screen‑Sharing‑Checkliste</span>
        <ChevronDown className={`cw-acc-chevron ${open ? 'is-open' : ''}`} aria-hidden />
      </button>
      <div id={panelId} role="region" aria-labelledby={headerId} hidden={!open}>
        {open && (
          <ul className="cw-screen-coll-list">
            {CHANGE_WORKFLOW_REMOTE_META.screenShareChecklist.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default function ChangeWorkflow() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const participantOnly = useMemo(() => {
    const path = `${location.pathname}`.replace(/\/+$/, '');
    const endsTeilnehmer = path.endsWith('change-workflow/teilnehmer');
    const q =
      searchParams.get('teilnehmer') === '1' ||
      searchParams.get('teilnehmer') === 'true' ||
      searchParams.get('modus') === 'teilnehmer';
    return endsTeilnehmer || q;
  }, [location.pathname, searchParams]);

  const teilnehmerShareUrl = useMemo(() => {
    const base = import.meta.env.BASE_URL || '/onboarding/';
    return new URL('change-workflow/teilnehmer', window.location.origin + base).href;
  }, []);

  const [phaseId, setPhaseId] = useState(CHANGE_PHASES[0]?.id ?? 'orient');
  const [checks, setChecks] = useLocalStorage(CHECKLIST_KEY, {});
  const [notes, setNotes] = useLocalStorage(NOTES_KEY, {});
  const [sessionTitle, setSessionTitle] = useLocalStorage(SESSION_TITLE_KEY, '');
  const [followUpNotes, setFollowUpNotes] = useLocalStorage(FOLLOW_UP_KEY, '');
  const [facilitatorModeStored, setFacilitatorMode] = useLocalStorage(FACILITATOR_MODE_KEY, true);
  const facilitatorMode = participantOnly ? false : facilitatorModeStored !== false;
  const [mobileTab, setMobileTab] = useState('guide');
  const [pdfBusy, setPdfBusy] = useState(false);

  const { progress } = useProgress();

  const phase = useMemo(
    () => CHANGE_PHASES.find((p) => p.id === phaseId) ?? CHANGE_PHASES[0],
    [phaseId]
  );
  const phaseIdx = CHANGE_PHASES.findIndex((p) => p.id === phaseId);
  const timerPresetMinutes = useMemo(() => guessTimerPresetMinutes(phase), [phase]);

  const toggleCheck = useCallback((pid, idx) => {
    const ck = `${pid}::${idx}`;
    setChecks((prev) => ({ ...prev, [ck]: !prev?.[ck] }));
  }, [setChecks]);

  const noteValue = notes[phase.id] ?? '';

  const setNoteValue = useCallback(
    (v) => setNotes((prev) => ({ ...prev, [phase.id]: v })),
    [phase.id, setNotes]
  );

  const pdfBase = useCallback(
    () => ({
      notes,
      checks,
      sessionTitle: sessionTitle.trim() || undefined,
      followUpNotes: followUpNotes.trim() || undefined,
      kotterWorkshop: progress.changeWorkshopKotter || undefined,
    }),
    [notes, checks, sessionTitle, followUpNotes, progress.changeWorkshopKotter]
  );

  const withPdfBusy = useCallback(async (fn) => {
    setPdfBusy(true);
    try {
      await new Promise((r) => requestAnimationFrame(r));
      await fn();
    } finally {
      setPdfBusy(false);
    }
  }, []);

  const onExportPdfFull = useCallback(() => {
    void withPdfBusy(async () => {
      downloadChangeWorkshopPdf(pdfBase());
    });
  }, [withPdfBusy, pdfBase]);

  const onPreviewPdfFull = useCallback(() => {
    void withPdfBusy(async () => {
      const ok = previewChangeWorkshopPdf(pdfBase());
      if (!ok) {
        window.alert(
          'Das Vorschau-Fenster konnte nicht geöffnet werden. Bitte Pop-ups für diese Seite erlauben und erneut versuchen.'
        );
      }
    });
  }, [withPdfBusy, pdfBase]);

  const onExportPdfPhase = useCallback(() => {
    void withPdfBusy(async () => {
      downloadChangeWorkshopPdf({ ...pdfBase(), phaseIds: [phase.id] });
    });
  }, [withPdfBusy, pdfBase, phase.id]);

  const onPreviewPdfPhase = useCallback(() => {
    void withPdfBusy(async () => {
      const ok = previewChangeWorkshopPdf({ ...pdfBase(), phaseIds: [phase.id] });
      if (!ok) {
        window.alert(
          'Das Vorschau-Fenster konnte nicht geöffnet werden. Bitte Pop-ups für diese Seite erlauben und erneut versuchen.'
        );
      }
    });
  }, [withPdfBusy, pdfBase, phase.id]);

  const PdfSpinner = () => (
    <>
      <Loader2 className="cw-spinner shrink-0" aria-hidden />
      <span className="cw-spinner-fallback" aria-hidden>
        …
      </span>
    </>
  );

  return (
    <div className="cw-workshop min-h-screen relative">
      <div className="cw-workshop-page-bg" aria-hidden />
      <div className="cw-workshop-page-overlay" aria-hidden />

      <header className="cw-wh-header">
        {participantOnly && (
          <div className="cw-container cw-wh-banner-wrap pb-0">
            <div className="cw-participant-banner" role="status">
              <p className="cw-participant-banner-text">
                Teilnehmer:innen‑Ansicht: Moderationshinweise, Timer und Breakout‑Skripte sind ausgeblendet.
                Zum Moderieren diese Seite offenhalten:{' '}
                <Link className="cw-participant-banner-link" to="/change-workflow">
                  Moderator:innen‑Ansicht
                </Link>
              </p>
              <p className="cw-participant-banner-muted">
                Direktlink zum Teilen: <code className="cw-participant-banner-code">{teilnehmerShareUrl}</code>{' '}
                · alternativ gleiche Seite unter{' '}
                <code className="cw-participant-banner-code">…/change-workflow?teilnehmer=1</code>
              </p>
            </div>
          </div>
        )}
        <div className="cw-container cw-wh-top flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between xl:gap-4">
          <div className="flex items-center gap-2.5 min-w-0 cw-wh-brand">
            <div className="cw-icon-badge shrink-0" aria-hidden>
              <Sparkles className="w-[1.125rem] h-[1.125rem] sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0 space-y-0 cw-wh-brand-text">
              <p className="cw-kicker">Workshop</p>
              <h1 className="cw-title">{CHANGE_WORKFLOW_META.title}</h1>
              <p className="cw-subtitle">{CHANGE_WORKFLOW_META.subtitle}</p>
            </div>
          </div>

          <div className="cw-wh-toolbar flex flex-col gap-2 xl:flex-row xl:flex-wrap xl:items-center xl:gap-x-2 xl:gap-y-1.5 shrink-0 w-full xl:w-auto xl:max-w-[min(100%,44rem)] xl:justify-end">
            <label className="sr-only" htmlFor="cw-session-title">
              Titel für das Protokoll
            </label>
            <input
              id="cw-session-title"
              type="text"
              value={sessionTitle}
              onChange={(e) => setSessionTitle(e.target.value)}
              placeholder="z. B. Workshop Projekt XY · Datum"
              className="cw-input-text cw-wh-session-input w-full xl:w-[13.5rem] xl:shrink-0"
            />
            <div className="cw-wh-toolbar-btns">
              <Link
                to="/"
                className="cw-btn cw-btn-ghost cw-link-hub"
              >
                <PanelLeftOpen className="w-3.5 h-3.5 opacity-80" aria-hidden />
                Hub
              </Link>
              <button
                type="button"
                onClick={onPreviewPdfFull}
                disabled={pdfBusy}
                className="cw-btn cw-btn-accent-outline"
              >
                {pdfBusy ? <PdfSpinner /> : <Eye className="w-3.5 h-3.5 shrink-0" aria-hidden />}
                Vorschau
              </button>
              <button
                type="button"
                onClick={onExportPdfFull}
                disabled={pdfBusy}
                className="cw-btn cw-btn-accent-fill"
              >
                {pdfBusy ? <PdfSpinner /> : <FileDown className="w-3.5 h-3.5 shrink-0" aria-hidden />}
                PDF exportieren
              </button>
            </div>
            {!participantOnly && (
              <button
                type="button"
                className={`cw-fac-toggle ${facilitatorMode ? 'is-on' : ''}`}
                aria-pressed={facilitatorMode}
                onClick={() => setFacilitatorMode((v) => !v)}
                title={
                  facilitatorMode
                    ? 'Moderationshinweise ausblenden (z. B. wenn nur die Kerninhalte geteilt werden sollen)'
                    : 'Moderations-, Timer und Breakout‑Skripte einblenden'
                }
              >
                <span className="cw-fac-dot" aria-hidden />
                Moderator:innen‑Ansicht {facilitatorMode ? 'an' : 'aus'}
              </button>
            )}
          </div>
        </div>

        <div className="cw-container cw-wh-stepper-zone">
          <div className="flex items-center gap-2 sm:gap-3 min-h-0">
            <span className="cw-kicker cw-wh-ablauf-label tracking-[0.12em] shrink-0">Ablauf</span>
            <div className="min-w-0 flex-1 overflow-x-auto">
              <PhaseStepper phaseId={phaseId} onSelect={setPhaseId} />
            </div>
            <span
              className="cw-step-counter cw-wh-step-counter shrink-0"
              aria-label={`Schritt ${phaseIdx + 1} von ${CHANGE_PHASES.length}`}
            >
              {phaseIdx + 1} / {CHANGE_PHASES.length}
            </span>
          </div>
          {facilitatorMode && <ScreenShareChecklistCollapse />}
        </div>
      </header>

      <main className="cw-container py-6 sm:py-8 lg:py-10">
        <SegmentSwitch tab={mobileTab} setTab={setMobileTab} />

        <div className="grid grid-cols-1 gap-12 xl:grid-cols-12 xl:gap-16 2xl:gap-20">
          <div className={`xl:col-span-7 space-y-8 ${mobileTab === 'notes' ? 'hidden xl:block' : ''}`}>
            <div className="cw-card space-y-0">
              <div className="flex flex-wrap items-end justify-between gap-6 mb-10">
                <div className="space-y-3 min-w-0">
                  <p className="cw-eyebrow-accent">Aktuelle Phase</p>
                  <h2 className="cw-phase-title">{phase.label}</h2>
                  <p className="cw-phase-meta">
                    {phase.durationHint} · {phase.hint}
                  </p>
                </div>
                <div className="flex gap-3 shrink-0">
                  <button
                    type="button"
                    disabled={phaseIdx <= 0}
                    onClick={() =>
                      setPhaseId(CHANGE_PHASES[Math.max(0, phaseIdx - 1)].id)
                    }
                    className="cw-btn cw-btn-ghost disabled:pointer-events-none"
                  >
                    Zurück
                  </button>
                  <button
                    type="button"
                    disabled={phaseIdx >= CHANGE_PHASES.length - 1}
                    onClick={() =>
                      setPhaseId(
                        CHANGE_PHASES[
                          Math.min(CHANGE_PHASES.length - 1, phaseIdx + 1)
                        ].id
                      )
                    }
                    className="cw-btn cw-btn-primary-solid disabled:pointer-events-none"
                  >
                    Weiter
                  </button>
                </div>
              </div>

              <div className="cw-callout-accent mb-10">
                <div className="flex gap-5">
                  <Goal className="cw-callout-icon" aria-hidden />
                  <div className="space-y-4 min-w-0 flex-1">
                    <p className="cw-callout-heading">Ziele in dieser Phase</p>
                    <ul className="cw-list-goals">
                      {phase.goals.map((g, i) => (
                        <li key={i}>
                          <span className="cw-list-goals-marker" aria-hidden>
                            •
                          </span>
                          <span>{g}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <NeutralDualTrackCallout payload={phase.neutralDualTrackExamples} />

              {facilitatorMode && (
                <PhaseTimer key={phase.id} presetMinutes={timerPresetMinutes} />
              )}

              <ChangeWorkflowDiagrams
                entries={CHANGE_PHASE_DIAGRAMS[phase.id]}
                kotterInteractive={!participantOnly}
              />

              <p className="cw-kicker mb-5 flex items-center gap-2.5">
                <ListChecks className="w-4 h-4 opacity-80 shrink-0" aria-hidden />
                Leitfaden
              </p>
              <div className="space-y-4">
                {phase.steps.map((s, i) => (
                  <GuidelineAccordion key={i} step={s} defaultOpen={i === 0} />
                ))}
              </div>

              {facilitatorMode && <RemotePlaybookPanel playbook={phase.remotePlaybook} />}

              <div className="cw-callout-accent mt-10">
                <div className="flex gap-5">
                  <ClipboardList className="cw-callout-icon" aria-hidden />
                  <div className="space-y-4 min-w-0 flex-1">
                    <p className="cw-callout-heading">Übung mit dem Kunden</p>
                    <p className="cw-callout-body">{phase.exercisePrompt}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <aside
            className={`xl:col-span-5 space-y-7 ${mobileTab === 'guide' ? 'hidden xl:block' : ''}`}
          >
            <div className="xl:sticky xl:top-[5rem] space-y-7">
              <div className="cw-card-aside space-y-0">
                <div className="cw-protocol-head">
                  <PenLine className="cw-callout-icon" aria-hidden />
                  <h3 className="cw-protocol-title">Follow-up & Entscheide</h3>
                </div>
                <p className="cw-protocol-lead">
                  Übergreifende Punkte, die nach der Session nachverfolgt werden — erscheint im PDF nach allen
                  Phasenprotokollen.
                </p>
                <label className="sr-only" htmlFor="cw-follow-up-notes">
                  Follow-up und Entscheide
                </label>
                <textarea
                  id="cw-follow-up-notes"
                  value={followUpNotes}
                  onChange={(e) => setFollowUpNotes(e.target.value)}
                  rows={5}
                  placeholder="Owner, Fälligkeiten, Eskalationen, Parkplatz-Themen…"
                  className="cw-textarea mb-6"
                />
              </div>

              <div className="cw-card-aside space-y-0">
                <div className="cw-protocol-head">
                  <PenLine className="cw-callout-icon" aria-hidden />
                  <h3 className="cw-protocol-title">Protokoll</h3>
                </div>
                <p className="cw-protocol-lead">
                  Ergebnisse dieser Phase erfassen – alle Phasen erscheinen zusammen im
                  PDF-Export.
                </p>
                <p className="cw-hint-strip">
                  Wird nur in diesem Browser gespeichert (localStorage). Vor dem Schliessen
                  des Tabs exportieren oder sichern.
                </p>
                <label className="sr-only" htmlFor={`notes-${phase.id}`}>
                  Notizen {phase.label}
                </label>
                <textarea
                  id={`notes-${phase.id}`}
                  value={noteValue}
                  onChange={(e) => setNoteValue(e.target.value)}
                  rows={12}
                  placeholder="Stichpunkte, Entscheide, offene Punkte…"
                  className="cw-textarea"
                />
              </div>

              {facilitatorMode && phase.facilitatorChecklist?.length > 0 && (
                <div className="cw-card-subtle">
                  <p className="cw-callout-heading mb-5">Moderation</p>
                  <ul className="space-y-1 list-none m-0 p-0">
                    {phase.facilitatorChecklist.map((item, idx) => {
                      const ck = `${phase.id}::${idx}`;
                      const done = !!checks[ck];
                      return (
                        <li key={idx}>
                          <label className="cw-check-row">
                            <input
                              type="checkbox"
                              checked={done}
                              onChange={() => toggleCheck(phase.id, idx)}
                              className="cw-checkbox shrink-0"
                            />
                            <span className={done ? 'cw-check-label-done' : 'cw-check-label'}>
                              {item}
                            </span>
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              <div className="cw-dash-box">
                <p className="cw-dash-lead">
                  Komplettes Protokoll oder nur diese Phase
                </p>
                <div className="flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={onPreviewPdfPhase}
                    disabled={pdfBusy}
                    className="cw-btn cw-btn-accent-outline cw-btn-block min-h-[3rem]"
                  >
                    {pdfBusy ? <PdfSpinner /> : <Eye className="w-4 h-4 shrink-0" aria-hidden />}
                    Vorschau (nur diese Phase)
                  </button>
                  <button
                    type="button"
                    onClick={onExportPdfPhase}
                    disabled={pdfBusy}
                    className="cw-btn cw-btn-outline-muted cw-btn-block min-h-[3rem]"
                  >
                    {pdfBusy ? <PdfSpinner /> : <FileDown className="w-4 h-4 shrink-0" aria-hidden />}
                    PDF nur diese Phase
                  </button>
                  <button
                    type="button"
                    onClick={onExportPdfFull}
                    disabled={pdfBusy}
                    className="cw-btn cw-btn-ghost cw-btn-block min-h-[3rem]"
                  >
                    {pdfBusy ? <PdfSpinner /> : <FileDown className="w-4 h-4 shrink-0" aria-hidden />}
                    PDF alle Phasen
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </div>

        <div className="mt-16 sm:mt-20 flex flex-wrap items-start justify-between gap-6 pt-10 sm:pt-12 cw-footer-border">
          <button
            type="button"
            onClick={() => {
              if (
                confirm(
                  'Moderations-Häkchen, alle Phasen‑Notizen, Follow-up‑Feld und Sitzungs-Titel löschen?'
                )
              ) {
                setChecks({});
                setNotes({});
                setFollowUpNotes('');
                setSessionTitle('');
              }
            }}
            className="cw-muted-link underline-offset-4"
          >
            Workshop zurücksetzen
          </button>
          <div className="cw-footer-tip">
            <ExternalLink className="w-4 h-4 shrink-0 mt-0.5 opacity-75" aria-hidden />
            <span>Empfohlen: eigenes Fenster für Screen‑Sharing mit Kund:innen.</span>
          </div>
        </div>
      </main>
    </div>
  );
}
