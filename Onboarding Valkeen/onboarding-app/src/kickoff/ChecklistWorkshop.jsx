import { useOutletContext } from 'react-router-dom';
import { STEP_STATUS_LABEL, STEP_STATUSES, tx } from './implementationTemplate';

/** Info-/Meilenstein-Schritte ohne externes Modul — Checkliste im Workshop-Kontext. */
export default function ChecklistWorkshop() {
  const { session, setSession, locale, portalMode, artifact } = useOutletContext();
  const stepStatus = session.stepStatus || {};
  const stepNotes = session.stepNotes || {};

  if (!artifact) {
    return (
      <div className="impl-ws-checklist">
        <p>{locale === 'en' ? 'Workshop not found.' : 'Workshop nicht gefunden.'}</p>
      </div>
    );
  }

  const status = stepStatus[artifact.id] || 'open';

  const cycleStatus = () => {
    const cur = stepStatus[artifact.id] || 'open';
    const next = STEP_STATUSES[(STEP_STATUSES.indexOf(cur) + 1) % STEP_STATUSES.length];
    setSession((s) => ({
      ...s,
      stepStatus: { ...(s.stepStatus || {}), [artifact.id]: next },
    }));
  };

  const setNotes = (value) => {
    setSession((s) => ({
      ...s,
      stepNotes: { ...(s.stepNotes || {}), [artifact.id]: value },
    }));
  };

  return (
    <div className="impl-ws-checklist">
      <h1>{tx(artifact.title, locale)}</h1>
      <p>{tx(artifact.desc, locale)}</p>
      {artifact.owner && (
        <p>
          <strong>{locale === 'en' ? 'Owner' : 'Verantwortlich'}:</strong> {artifact.owner}
        </p>
      )}
      <div className="impl-step-status-row" style={{ marginBottom: '1rem' }}>
        <button className="impl-btn" type="button" onClick={cycleStatus} disabled={portalMode}>
          {STEP_STATUS_LABEL[locale]?.[status] || status}
        </button>
      </div>
      <label>
        {locale === 'en' ? 'Notes & checklist' : 'Notizen & Checkliste'}
        <textarea
          rows={10}
          value={stepNotes[artifact.id] || ''}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={
            locale === 'en'
              ? 'Tasks, links, decisions from this step…'
              : 'Aufgaben, Links, Entscheide zu diesem Schritt…'
          }
          disabled={portalMode}
        />
      </label>
    </div>
  );
}
