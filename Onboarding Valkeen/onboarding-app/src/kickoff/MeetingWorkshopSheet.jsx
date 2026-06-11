import { Link, useOutletContext } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';
import {
  MEETING_TYPES,
  MEETING_TYPE_LABEL,
  newAction,
} from './implementationLog';
import { artifactsForMeetingType, resolveArtifactHref } from './implementationWorkshopCatalog';
import { tx } from './implementationTemplate';

export default function MeetingWorkshopSheet() {
  const { session, setSession, locale, portalMode, meeting, nav } = useOutletContext();

  if (!meeting) {
    return (
      <div className="impl-ws-meeting">
        <p>{locale === 'en' ? 'Meeting not found.' : 'Termin nicht gefunden.'}</p>
        <Link to={nav.hubHref()}>{locale === 'en' ? 'Back to overview' : 'Zurück zur Übersicht'}</Link>
      </div>
    );
  }

  const patchMeeting = (patch) => {
    setSession((s) => ({
      ...s,
      meetings: (s.meetings || []).map((m) => (m.id === meeting.id ? { ...m, ...patch } : m)),
    }));
  };

  const related = artifactsForMeetingType(meeting.type);

  return (
    <div className="impl-ws-meeting">
      <div className="impl-ws-meeting-grid">
        <div>
          <label>{locale === 'en' ? 'Title' : 'Titel'}</label>
          <input
            value={meeting.title || ''}
            onChange={(e) => patchMeeting({ title: e.target.value })}
            disabled={portalMode}
          />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label>{locale === 'en' ? 'Date' : 'Datum'}</label>
            <input
              type="date"
              value={meeting.date || ''}
              onChange={(e) => patchMeeting({ date: e.target.value })}
              disabled={portalMode}
            />
          </div>
          <div>
            <label>{locale === 'en' ? 'Type' : 'Typ'}</label>
            <select
              value={meeting.type || 'weekly'}
              onChange={(e) => patchMeeting({ type: e.target.value })}
              disabled={portalMode}
            >
              {MEETING_TYPES.map((t) => (
                <option key={t} value={t}>
                  {MEETING_TYPE_LABEL[locale]?.[t] || t}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label>{locale === 'en' ? 'Attendees' : 'Teilnehmer'}</label>
          <input
            value={meeting.attendees || ''}
            onChange={(e) => patchMeeting({ attendees: e.target.value })}
            disabled={portalMode}
          />
        </div>
        <div>
          <label>{locale === 'en' ? 'Agenda' : 'Agenda'}</label>
          <textarea
            rows={4}
            value={meeting.agenda || ''}
            onChange={(e) => patchMeeting({ agenda: e.target.value })}
            disabled={portalMode}
          />
        </div>
        <div>
          <label>{locale === 'en' ? 'Notes' : 'Notizen'}</label>
          <textarea
            rows={6}
            value={meeting.notes || ''}
            onChange={(e) => patchMeeting({ notes: e.target.value })}
            disabled={portalMode}
          />
        </div>
        <div>
          <label>{locale === 'en' ? 'Action items' : 'Action Items'}</label>
          {(meeting.actions || []).map((a) => (
            <div key={a.id} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <input
                style={{ flex: 1 }}
                value={a.text || ''}
                onChange={(e) => {
                  const actions = meeting.actions.map((x) =>
                    x.id === a.id ? { ...x, text: e.target.value } : x
                  );
                  patchMeeting({ actions });
                }}
                disabled={portalMode}
              />
              <input
                type="date"
                value={a.due || ''}
                onChange={(e) => {
                  const actions = meeting.actions.map((x) =>
                    x.id === a.id ? { ...x, due: e.target.value } : x
                  );
                  patchMeeting({ actions });
                }}
                disabled={portalMode}
              />
              <button
                type="button"
                className="impl-btn"
                onClick={() => patchMeeting({ actions: meeting.actions.filter((x) => x.id !== a.id) })}
                disabled={portalMode}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          {!portalMode && (
            <button
              type="button"
              className="impl-btn"
              onClick={() => patchMeeting({ actions: [...(meeting.actions || []), newAction()] })}
            >
              <Plus className="w-4 h-4" />
              {locale === 'en' ? 'Action' : 'Aktion'}
            </button>
          )}
        </div>
        {related.length > 0 && (
          <div>
            <label>{locale === 'en' ? 'Related workshops' : 'Passende Workshops'}</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {related.slice(0, 6).map((a) => (
                <Link
                  key={a.id}
                  className="impl-btn impl-btn--nav"
                  to={resolveArtifactHref(a, session.sessionId, { portalMode })}
                >
                  {tx(a.title, locale)}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
