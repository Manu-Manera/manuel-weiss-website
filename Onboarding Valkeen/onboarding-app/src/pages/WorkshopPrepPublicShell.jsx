import { useParams } from 'react-router-dom';
import { CheckCircle, ClipboardList, Loader2, Lock, Save, Shield } from 'lucide-react';

import '../styles/change-workshop.css';
import { WorkshopPrepProvider, useWorkshopPrep } from '../context/WorkshopPrepContext';
import { isValidWorkshopPrepToken, WORKSHOP_PREP_QUESTIONS } from '../utils/workshopPrepShare';

function PrepHeader({ subtitle }) {
  return (
    <header className="cw-wh-header border-b border-slate-200/80">
      <div className="cw-container cw-wh-top flex flex-col gap-2 py-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="cw-kicker">Change Workshop · Vorab-Fragebogen</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">
            <Lock className="h-3.5 w-3.5" aria-hidden /> nur mit Link erreichbar
          </span>
        </div>
        {subtitle && <p className="m-0 text-sm text-slate-600 max-w-prose">{subtitle}</p>}
        <div className="cw-callout-accent border-violet-200/80 bg-violet-50/60 py-3">
          <p className="cw-callout-heading m-0 flex items-center gap-2 text-sm">
            <Shield className="h-4 w-4 text-violet-700 shrink-0" aria-hidden />
            Datenschutz
          </p>
          <p className="cw-callout-body m-0 mt-1 text-xs leading-snug">
            Ihre Antworten werden verschlüsselt gespeichert und nur vom Moderationsteam eingesehen.
            Der Link funktioniert wie ein Passwort — teilen Sie ihn nur mit Projektbeteiligten.
          </p>
        </div>
      </div>
    </header>
  );
}

function SyncLine({ syncing }) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
      {syncing ? (
        <span className="inline-flex items-center gap-1.5" title="Speichern in der Cloud">
          <Loader2 className="w-4 h-4 animate-spin text-violet-600" aria-hidden />
          Wird gespeichert…
        </span>
      ) : (
        <span className="inline-flex items-center gap-1.5 text-emerald-700">
          <Save className="w-4 h-4 shrink-0" aria-hidden />
          Automatisch gespeichert
        </span>
      )}
    </div>
  );
}

function PrepForm() {
  const { data, loading, loadError, syncing, setAnswer } = useWorkshopPrep();
  const answeredCount = WORKSHOP_PREP_QUESTIONS.filter(
    (q) => (data.answers[q.key] || '').trim().length > 0
  ).length;
  const allAnswered = answeredCount === WORKSHOP_PREP_QUESTIONS.length;

  return (
    <div className="cw-workshop min-h-screen relative">
      <div className="cw-workshop-page-bg" aria-hidden />
      <div className="cw-workshop-page-overlay" aria-hidden />
      <PrepHeader
        subtitle={
          data.customerLabel
            ? `Vorbereitung für: «${data.customerLabel}»`
            : 'Bitte beantworten Sie die Fragen vor dem Workshop — das hilft uns bei der gezielten Vorbereitung.'
        }
      />

      <main className="cw-container py-8 max-w-2xl space-y-6">
        {loadError && (
          <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950" role="status">
            {loadError}. Sie können weiterarbeiten — es wird beim Speichern erneut versucht.
          </div>
        )}

        {loading ? (
          <p className="text-slate-600 text-sm inline-flex gap-2 items-center">
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
            Wird geladen…
          </p>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
              <div className="flex items-center gap-3">
                <ClipboardList className="w-5 h-5 text-violet-600" aria-hidden />
                <h1 className="cw-phase-title m-0 text-lg sm:text-xl">Vorab-Fragebogen</h1>
              </div>
              <SyncLine syncing={syncing} />
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {allAnswered ? (
                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" aria-hidden />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-slate-300" aria-hidden />
                )}
                <span className="text-sm font-medium text-slate-700">
                  {answeredCount} von {WORKSHOP_PREP_QUESTIONS.length} Fragen beantwortet
                </span>
              </div>
              <div className="h-2 flex-1 max-w-[120px] bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-violet-500 transition-all duration-300"
                  style={{ width: `${(answeredCount / WORKSHOP_PREP_QUESTIONS.length) * 100}%` }}
                />
              </div>
            </div>

            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              {WORKSHOP_PREP_QUESTIONS.map((q, idx) => {
                const value = data.answers[q.key] || '';
                const hasContent = value.trim().length > 0;
                return (
                  <div
                    key={q.key}
                    className={`cw-card space-y-2 transition-all ${
                      hasContent ? 'border-violet-200/70 bg-violet-50/20' : ''
                    }`}
                  >
                    <label className="block" htmlFor={`prep-${q.key}`}>
                      <span className="text-xs font-bold text-violet-700 mr-2">{idx + 1}.</span>
                      <span className="font-semibold text-slate-800 text-sm leading-snug">{q.question}</span>
                    </label>
                    {q.multiline ? (
                      <textarea
                        id={`prep-${q.key}`}
                        rows={4}
                        className="cw-textarea min-h-0"
                        placeholder={q.placeholder}
                        value={value}
                        onChange={(e) => setAnswer(q.key, e.target.value)}
                      />
                    ) : (
                      <input
                        id={`prep-${q.key}`}
                        type="text"
                        className="cw-input-text"
                        placeholder={q.placeholder}
                        value={value}
                        onChange={(e) => setAnswer(q.key, e.target.value)}
                      />
                    )}
                  </div>
                );
              })}
            </form>

            {allAnswered && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" aria-hidden />
                <div>
                  <p className="font-semibold m-0">Vielen Dank!</p>
                  <p className="m-0 mt-1">
                    Alle Fragen sind beantwortet. Das Moderationsteam kann Ihre Eingaben jetzt einsehen und den
                    Workshop optimal vorbereiten. Sie können diese Seite schließen oder später noch Anpassungen
                    vornehmen.
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default function WorkshopPrepPublicShell() {
  const { shareId } = useParams();

  if (!isValidWorkshopPrepToken(shareId)) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md text-center rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-lg font-semibold text-slate-900 m-0">Link nicht gültig</h1>
          <p className="text-sm text-slate-600 mt-2 m-0">
            Bitte kopieren Sie die vollständige Adresse aus der Einladung oder erbitten Sie einen neuen Link.
          </p>
        </div>
      </div>
    );
  }

  return (
    <WorkshopPrepProvider shareId={shareId}>
      <PrepForm />
    </WorkshopPrepProvider>
  );
}
