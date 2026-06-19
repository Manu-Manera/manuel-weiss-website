import { useMemo, useState } from 'react';
import { CheckCircle, ChevronLeft, ChevronRight, Loader2, Save } from 'lucide-react';
import KickoffBrandLogo from './KickoffBrandLogo';
import { useKickoffPrep } from '../context/KickoffPrepContext';
import { uiPrep } from './kickoffPrepI18n';

export default function KickoffPrepQuestionnaire() {
  const { prep, answers, questionnaire, syncing, submitting, setAnswer, submit } = useKickoffPrep();
  const locale = prep?.locale || 'de';
  const t = (k) => uiPrep(locale, k);
  const sections = questionnaire.sections || [];
  const [sectionIdx, setSectionIdx] = useState(0);

  const current = sections[sectionIdx];
  const progressPct = sections.length
    ? Math.round(((sectionIdx + 1) / sections.length) * 100)
    : 0;

  const missingRequired = useMemo(() => {
    if (!current) return [];
    return (current.questions || []).filter(
      (q) => q.required && !(answers[q.key] || '').trim()
    );
  }, [current, answers]);

  const canNext = missingRequired.length === 0;
  const isLast = sectionIdx >= sections.length - 1;

  const handleSubmit = async () => {
    if (!canNext) return;
    await submit();
  };

  if (prep?.access?.status === 'submitted') {
    return (
      <div className="kickoff-prep-page">
        <main className="kickoff-prep-welcome-main">
          <div className="kickoff-prep-welcome-card kickoff-prep-done-card">
            <CheckCircle className="w-12 h-12 text-[#00a878] mx-auto" />
            <h1 className="kickoff-prep-welcome-title text-center">{t('prepSubmitted')}</h1>
            <p className="kickoff-prep-welcome-sub text-center">{t('prepSubmittedHint')}</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="kickoff-prep-page kickoff-prep-page--form">
      <header className="kickoff-prep-header kickoff-prep-header--compact">
        <KickoffBrandLogo className="kickoff-prep-logo kickoff-prep-logo--sm" />
        <div className="kickoff-prep-header-meta">
          <span className="text-sm text-white/70">{prep?.customer}</span>
          <SyncLine syncing={syncing} locale={locale} />
        </div>
      </header>

      <div className="kickoff-prep-progress-top">
        <div className="kickoff-prep-progress-bar">
          <div className="kickoff-prep-progress-fill" style={{ width: `${progressPct}%` }} />
        </div>
        <span className="text-xs text-white/55">
          {t('prepSectionOf')} {sectionIdx + 1} / {sections.length}
        </span>
      </div>

      <main className="kickoff-prep-form-main">
        {current && (
          <div className="kickoff-prep-section-card">
            <h2 className="kickoff-prep-section-title">{current.title}</h2>
            <form className="kickoff-prep-questions" onSubmit={(e) => e.preventDefault()}>
              {(current.questions || []).map((q) => {
                const value = answers[q.key] || '';
                const filled = value.trim().length > 0;
                return (
                  <label
                    key={q.key}
                    className={`kickoff-prep-q ${filled ? 'is-filled' : ''} ${q.required ? 'is-required' : ''}`}
                    htmlFor={`prep-q-${q.key}`}
                  >
                    <span className="kickoff-prep-q-label">
                      {q.label}
                      {q.required && <span className="kickoff-prep-required">*</span>}
                    </span>
                    {q.multiline !== false ? (
                      <textarea
                        id={`prep-q-${q.key}`}
                        className="kickoff-input kickoff-textarea kickoff-prep-input"
                        rows={4}
                        value={value}
                        onChange={(e) => setAnswer(q.key, e.target.value)}
                      />
                    ) : (
                      <input
                        id={`prep-q-${q.key}`}
                        type="text"
                        className="kickoff-input kickoff-prep-input"
                        value={value}
                        onChange={(e) => setAnswer(q.key, e.target.value)}
                      />
                    )}
                  </label>
                );
              })}
            </form>
            {!canNext && (
              <p className="kickoff-prep-required-hint">{t('prepRequiredHint')}</p>
            )}
          </div>
        )}
      </main>

      <footer className="kickoff-prep-form-footer">
        <button
          type="button"
          className="kickoff-btn-secondary"
          disabled={sectionIdx <= 0}
          onClick={() => setSectionIdx((i) => Math.max(0, i - 1))}
        >
          <ChevronLeft className="w-5 h-5" />
          {t('prepPrev')}
        </button>
        {!isLast ? (
          <button
            type="button"
            className="kickoff-btn-primary"
            disabled={!canNext}
            onClick={() => setSectionIdx((i) => Math.min(sections.length - 1, i + 1))}
          >
            {t('prepNext')}
            <ChevronRight className="w-5 h-5" />
          </button>
        ) : (
          <button
            type="button"
            className="kickoff-btn-primary"
            disabled={!canNext || submitting}
            onClick={handleSubmit}
          >
            {submitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <CheckCircle className="w-5 h-5" />
            )}
            {t('prepSubmit')}
          </button>
        )}
      </footer>
    </div>
  );
}

function SyncLine({ syncing, locale }) {
  const t = (k) => uiPrep(locale, k);
  return syncing ? (
    <span className="inline-flex items-center gap-1 text-xs text-white/55">
      <Loader2 className="w-3 h-3 animate-spin" />
      {t('prepSaveStatus')}
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-xs text-[#00a878]">
      <Save className="w-3 h-3" />
      {t('prepSaved')}
    </span>
  );
}
