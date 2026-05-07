import { useMemo, useState, useCallback, useId } from 'react';
import { Link } from 'react-router-dom';
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
} from 'lucide-react';

import '../styles/change-workshop.css';

import { useLocalStorage } from '../hooks/useLocalStorage';
import { CHANGE_WORKFLOW_META, CHANGE_PHASES } from '../data/changeWorkflowData';
import { downloadChangeWorkshopPdf, previewChangeWorkshopPdf } from '../utils/changeWorkflowPdf';

const CHECKLIST_KEY = 'change_workflow_facilitator_checks_v1';
const NOTES_KEY = 'change_workflow_phase_notes_v1';
const SESSION_TITLE_KEY = 'change_workflow_session_title_v1';

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
    <nav className="w-full overflow-x-auto pb-2 pt-1" aria-label="Phasen">
      <ol className="cw-step-list py-1 px-0.5">
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

export default function ChangeWorkflow() {
  const [phaseId, setPhaseId] = useState(CHANGE_PHASES[0]?.id ?? 'orient');
  const [checks, setChecks] = useLocalStorage(CHECKLIST_KEY, {});
  const [notes, setNotes] = useLocalStorage(NOTES_KEY, {});
  const [sessionTitle, setSessionTitle] = useLocalStorage(SESSION_TITLE_KEY, '');
  const [mobileTab, setMobileTab] = useState('guide');
  const [pdfBusy, setPdfBusy] = useState(false);

  const phase = useMemo(
    () => CHANGE_PHASES.find((p) => p.id === phaseId) ?? CHANGE_PHASES[0],
    [phaseId]
  );
  const phaseIdx = CHANGE_PHASES.findIndex((p) => p.id === phaseId);

  const toggleCheck = useCallback((pid, idx) => {
    const ck = `${pid}::${idx}`;
    setChecks((prev) => ({ ...prev, [ck]: !prev?.[ck] }));
  }, [setChecks]);

  const noteValue = notes[phase.id] ?? '';

  const setNoteValue = useCallback(
    (v) => setNotes((prev) => ({ ...prev, [phase.id]: v })),
    [phase.id, setNotes]
  );

  const hubUrl = `${import.meta.env.BASE_URL.replace(/\/?$/, '/')}`;

  const pdfBase = useCallback(
    () => ({
      notes,
      checks,
      sessionTitle: sessionTitle.trim() || undefined,
    }),
    [notes, checks, sessionTitle]
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
        <div className="cw-container py-6 sm:py-7 flex flex-col gap-7 xl:flex-row xl:items-start xl:justify-between">
          <div className="flex items-start gap-4 min-w-0">
            <div className="cw-icon-badge shrink-0" aria-hidden>
              <Sparkles className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div className="min-w-0 pt-0.5 space-y-2">
              <p className="cw-kicker">Workshop</p>
              <h1 className="cw-title">{CHANGE_WORKFLOW_META.title}</h1>
              <p className="cw-subtitle">{CHANGE_WORKFLOW_META.subtitle}</p>
            </div>
          </div>

          <div className="flex flex-col gap-3 shrink-0 w-full xl:w-auto xl:min-w-[20rem] xl:max-w-[28rem]">
            <label className="sr-only" htmlFor="cw-session-title">
              Titel für das Protokoll
            </label>
            <input
              id="cw-session-title"
              type="text"
              value={sessionTitle}
              onChange={(e) => setSessionTitle(e.target.value)}
              placeholder="z. B. Workshop Projekt XY · Datum"
              className="cw-input-text min-h-[3rem]"
            />
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <Link
                to={hubUrl}
                className="cw-btn cw-btn-ghost cw-link-hub flex-1 sm:flex-none min-w-[7rem] min-h-[3rem]"
              >
                <PanelLeftOpen className="w-4 h-4 opacity-80" aria-hidden />
                Hub
              </Link>
              <button
                type="button"
                onClick={onPreviewPdfFull}
                disabled={pdfBusy}
                className="cw-btn cw-btn-accent-outline flex-1 sm:flex-none min-w-[7rem] min-h-[3rem]"
              >
                {pdfBusy ? <PdfSpinner /> : <Eye className="w-4 h-4 shrink-0" aria-hidden />}
                Vorschau
              </button>
              <button
                type="button"
                onClick={onExportPdfFull}
                disabled={pdfBusy}
                className="cw-btn cw-btn-accent-fill flex-1 sm:flex-none min-w-[9rem] min-h-[3rem]"
              >
                {pdfBusy ? <PdfSpinner /> : <FileDown className="w-4 h-4 shrink-0" aria-hidden />}
                PDF exportieren
              </button>
            </div>
          </div>
        </div>

        <div className="cw-container pb-6 sm:pb-7 pt-2">
          <div className="flex items-center justify-between gap-3 mb-4">
            <span className="cw-kicker tracking-[0.12em]">Ablauf</span>
            <span className="cw-step-counter">
              Schritt {phaseIdx + 1} / {CHANGE_PHASES.length}
            </span>
          </div>
          <PhaseStepper phaseId={phaseId} onSelect={setPhaseId} />
        </div>
      </header>

      <main className="cw-container py-10 sm:py-12 lg:py-14">
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

              <p className="cw-kicker mb-5 flex items-center gap-2.5">
                <ListChecks className="w-4 h-4 opacity-80 shrink-0" aria-hidden />
                Leitfaden
              </p>
              <div className="space-y-4">
                {phase.steps.map((s, i) => (
                  <GuidelineAccordion key={i} step={s} defaultOpen={i === 0} />
                ))}
              </div>

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
            <div className="xl:sticky xl:top-[9rem] space-y-7">
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

              {phase.facilitatorChecklist?.length > 0 && (
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
              if (confirm('Moderations-Häkchen und alle Protokoll-Notizen löschen?')) {
                setChecks({});
                setNotes({});
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
