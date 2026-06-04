import { ui } from './kickoffStudioI18n';
import { KickoffSlideVisual } from './KickoffDiagrams';
import { CapturePreviewTable } from './KickoffVisuals';
import { visualIdForSlide } from './kickoffSlideVisuals';

const CHECKLIST_VALUES = ['yes', 'no', 'later'];

export default function SlideBody({
  slide,
  rawSlide,
  answers,
  setAnswer,
  locale,
  captureEnabled,
  onEnableCapture,
  vizConfig,
  onVizChange,
  vizEditable = false,
}) {
  const t = (key) => ui(locale, key);
  if (!slide || !rawSlide) return null;

  const layout = slide.layout;
  const isWorkshop = slide.kind === 'workshop';
  const showGate = isWorkshop && !captureEnabled;
  const slideId = rawSlide?.id;
  const hasVisual = !!visualIdForSlide(slideId);

  const visualBlock =
    hasVisual && vizConfig ? (
      <KickoffSlideVisual
        slideId={slideId}
        locale={locale}
        vizConfig={vizConfig}
        onVizChange={onVizChange}
        editable={vizEditable}
      />
    ) : null;

  if (layout === 'content') {
    return (
      <div className="kickoff-slide-content-stack">
        {visualBlock}
        {(slide.bullets || []).length > 0 && (
          <ul className="kickoff-bullets">
            {(slide.bullets || []).map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  if (showGate) {
    return (
      <div className="kickoff-slide-content-stack">
        {visualBlock}
        <CapturePreviewTable slide={slide} locale={locale} />
        <div className="kickoff-capture-gate">
          <p className="kickoff-capture-gate-title">{t('captureNotStarted')}</p>
          <p className="kickoff-capture-gate-body">{t('captureNotStartedHint')}</p>
          <button type="button" className="kickoff-btn-primary" onClick={onEnableCapture}>
            {t('captureStartNow')}
          </button>
        </div>
      </div>
    );
  }

  if (layout === 'capture') {
    const headers = slide.headers || [];
    const rows = answers.rows || slide.rows || [];
    const updateCell = (ri, ci, val) => {
      const next = rows.map((r, i) =>
        i === ri ? r.map((c, j) => (j === ci ? val : c)) : [...r]
      );
      setAnswer({ rows: next });
    };
    const addRow = () => {
      setAnswer({ rows: [...rows, headers.map(() => '')] });
    };
    return (
      <div className="kickoff-slide-content-stack kickoff-table-wrap">
        {visualBlock}
        <div className="overflow-x-auto min-w-0">
          <table className="kickoff-table w-full">
            <thead>
              <tr>
                {headers.map((h, i) => (
                  <th key={i}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri}>
                  {row.map((cell, ci) => (
                    <td key={ci}>
                      <input
                        className="kickoff-input"
                        value={cell}
                        onChange={(e) => updateCell(ri, ci, e.target.value)}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button type="button" className="kickoff-btn-secondary mt-4" onClick={addRow}>
          + Row
        </button>
      </div>
    );
  }

  if (layout === 'workshop_qa') {
    const qa = answers.questionAnswers || (slide.questions || []).map(() => '');
    return (
      <div className="kickoff-slide-content-stack space-y-5">
        {visualBlock}
        {(slide.questions || []).map((q, i) => (
          <label key={i} className="block kickoff-qa-block">
            <span className="kickoff-qa-label">{q.q}</span>
            {q.hint && <span className="kickoff-qa-hint">({q.hint})</span>}
            <textarea
              className="kickoff-input kickoff-textarea"
              value={qa[i] ?? ''}
              onChange={(e) => {
                const next = [...qa];
                next[i] = e.target.value;
                setAnswer({ questionAnswers: next });
              }}
            />
          </label>
        ))}
      </div>
    );
  }

  if (layout === 'decisions') {
    const notes = answers.decisionNotes || {};
    return (
      <div className="kickoff-slide-content-stack kickoff-decisions-grid">
        {visualBlock}
        {(slide.options || []).map((o) => (
          <label
            key={o.id}
            className={`kickoff-option ${answers.decision === o.id ? 'kickoff-option-selected' : ''}`}
          >
            <input
              type="radio"
              name={`dec-${rawSlide.id}`}
              checked={answers.decision === o.id}
              onChange={() => setAnswer({ decision: o.id })}
            />
            <span>
              <strong>{o.label}</strong>
              {o.note && <span className="text-white/55 text-sm"> — {o.note}</span>}
            </span>
            <input
              className="kickoff-input kickoff-input--nested"
              placeholder={t('notes')}
              value={notes[o.id] ?? ''}
              onChange={(e) =>
                setAnswer({ decisionNotes: { ...notes, [o.id]: e.target.value } })
              }
            />
          </label>
        ))}
        <p className="text-sm text-white/50">{slide.decision_label}</p>
      </div>
    );
  }

  if (layout === 'checklist') {
    const st = answers.checklist || (slide.items || []).map(() => '');
    const labels = {
      yes: t('checklistYes'),
      no: t('checklistNo'),
      later: t('checklistLater'),
    };
    return (
      <div className="kickoff-slide-content-stack">
        {visualBlock}
        <ul className="kickoff-checklist">
        {(slide.items || []).map((item, i) => (
          <li key={i} className="kickoff-checklist-row">
            <span className="kickoff-checklist-label">{item}</span>
            <div className="kickoff-checklist-actions">
              {CHECKLIST_VALUES.map((v) => (
                <button
                  key={v}
                  type="button"
                  className={`kickoff-chip ${st[i] === v ? 'kickoff-chip-active' : ''}`}
                  onClick={() => {
                    const next = [...st];
                    next[i] = st[i] === v ? '' : v;
                    setAnswer({ checklist: next });
                  }}
                >
                  {labels[v]}
                </button>
              ))}
            </div>
          </li>
        ))}
        </ul>
      </div>
    );
  }

  return visualBlock;
}
