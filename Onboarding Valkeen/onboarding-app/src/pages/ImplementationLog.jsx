import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Cloud, Loader2, Plus, Trash2 } from 'lucide-react';
import '../styles/implementation-guide.css';
import '../styles/implementation-log.css';
import {
  DECISION_STATUSES,
  DECISION_STATUS_LABEL,
  MEETING_TYPES,
  MEETING_TYPE_LABEL,
  buildStandardDecisions,
  newAction,
  newDecision,
  newMeeting,
  openActionItems,
  sortMeetings,
} from '../kickoff/implementationLog';
import { brandingCssVars, normalizeBranding } from '../kickoff/implementationBranding';
import { defaultSession, mergeSession } from '../kickoff/kickoffStudioMerge';
import {
  EDIT_PASSWORD_STORAGE_KEY,
  fetchCloudSession,
  loadLocalSession,
  newSessionId,
  resolveEditPassword,
  saveCloudSession,
  saveLocalSession,
} from '../kickoff/kickoffStudioService';
import { upsertWorkspace, workspaceFromSession } from '../kickoff/implementationWorkspace';
import { useImplPermissions, useImplPortal } from '../kickoff/useImplPermissions';

function initSession(searchParams) {
  const sid = searchParams.get('s') || searchParams.get('session');
  if (sid) {
    const local = loadLocalSession(sid);
    if (local) return mergeSession(local, local.tenantSlug);
    return mergeSession(defaultSession(sid), '');
  }
  return mergeSession(defaultSession(newSessionId()), '');
}

export default function ImplementationLog() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [session, setSession] = useState(() => initSession(searchParams));
  const [tab, setTab] = useState(searchParams.get('tab') || 'meetings');
  const [password, setPassword] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState('');

  const locale = session.locale || 'de';
  const portalMode = useImplPortal();
  const perms = useImplPermissions(session, portalMode);
  const canEditLog = perms.canEdit('log');
  const canEditDecisions = perms.canEdit('decisions');
  const cssVars = useMemo(() => brandingCssVars(normalizeBranding(session.branding)), [session.branding]);

  const meetings = session.meetings || [];
  const decisions = useMemo(
    () => (session.decisions?.length ? session.decisions : buildStandardDecisions()),
    [session.decisions]
  );

  useEffect(() => {
    try {
      const stored = localStorage.getItem(EDIT_PASSWORD_STORAGE_KEY);
      if (stored) setPassword(stored);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const sid = searchParams.get('s') || searchParams.get('session');
    if (!sid) return;
    fetchCloudSession(sid)
      .then((cloud) => {
        if (cloud) setSession((prev) => mergeSession({ ...prev, ...cloud }, prev.tenantSlug));
      })
      .catch(() => {});
  }, [searchParams]);

  useEffect(() => {
    saveLocalSession(session);
    const meta = workspaceFromSession({ ...session, updatedAt: Date.now() });
    if (meta) upsertWorkspace(meta);
  }, [session]);

  // --- meetings ---
  const setMeetings = (updater) =>
    setSession((s) => {
      const cur = s.meetings || [];
      return { ...s, meetings: typeof updater === 'function' ? updater(cur) : updater };
    });
  const addMeeting = (type) => setMeetings((arr) => [newMeeting(type), ...arr]);
  const updateMeeting = (id, p) => setMeetings((arr) => arr.map((m) => (m.id === id ? { ...m, ...p } : m)));
  const removeMeeting = (id) => setMeetings((arr) => arr.filter((m) => m.id !== id));
  const addActionTo = (mid) =>
    setMeetings((arr) => arr.map((m) => (m.id === mid ? { ...m, actions: [...(m.actions || []), newAction()] } : m)));
  const updateAction = (mid, aid, p) =>
    setMeetings((arr) =>
      arr.map((m) =>
        m.id === mid
          ? { ...m, actions: (m.actions || []).map((a) => (a.id === aid ? { ...a, ...p } : a)) }
          : m
      )
    );
  const removeAction = (mid, aid) =>
    setMeetings((arr) =>
      arr.map((m) => (m.id === mid ? { ...m, actions: (m.actions || []).filter((a) => a.id !== aid) } : m))
    );

  // --- decisions ---
  const setDecisions = (updater) =>
    setSession((s) => {
      const cur = s.decisions?.length ? s.decisions : buildStandardDecisions();
      return { ...s, decisions: typeof updater === 'function' ? updater(cur) : updater };
    });
  const updateDecision = (id, p) => setDecisions((arr) => arr.map((d) => (d.id === id ? { ...d, ...p } : d)));
  const removeDecision = (id) => setDecisions((arr) => arr.filter((d) => d.id !== id));
  const addDecision = () => setDecisions((arr) => [...arr, newDecision()]);
  const cycleDecision = (id) => {
    const d = decisions.find((x) => x.id === id);
    const cur = d?.status || 'open';
    const next = DECISION_STATUSES[(DECISION_STATUSES.indexOf(cur) + 1) % DECISION_STATUSES.length];
    updateDecision(id, { status: next });
  };

  const rollup = useMemo(() => openActionItems(meetings), [meetings]);
  const sortedMeetings = useMemo(() => sortMeetings(meetings), [meetings]);

  const saveCloud = async () => {
    setSyncing(true);
    setSyncMsg('');
    try {
      await saveCloudSession({ ...session, meetings, decisions }, resolveEditPassword(password));
      setSyncMsg(locale === 'en' ? 'Saved' : 'Gespeichert');
      try {
        const trimmed = String(password || '').trim();
        if (trimmed) localStorage.setItem(EDIT_PASSWORD_STORAGE_KEY, trimmed);
      } catch {
        /* ignore */
      }
      setTimeout(() => setSyncMsg(''), 2500);
    } catch (e) {
      const msg = e.message || '';
      setSyncMsg(
        msg.includes('Invalid password')
          ? locale === 'en'
            ? 'Wrong facilitator password (empty = default)'
            : 'Falsches Facilitator-Passwort (leer = Standard)'
          : msg || 'Fehler'
      );
    } finally {
      setSyncing(false);
    }
  };

  const backToGuide = () => {
    const p = new URLSearchParams();
    if (session.sessionId) p.set('s', session.sessionId);
    if (portalMode) p.set('portal', '1');
    navigate(`/implementation-studio?${p.toString()}`);
  };

  const TABS = useMemo(
    () =>
      [
        perms.canView('log') && {
          id: 'meetings',
          label: locale === 'en' ? 'Meetings / Weeklys' : 'Meetings / Weeklys',
        },
        perms.canView('log') && {
          id: 'actions',
          label: `Action Items${rollup.length ? ` (${rollup.length})` : ''}`,
        },
        perms.canView('decisions') && {
          id: 'decisions',
          label: locale === 'en' ? 'Decisions' : 'Entscheidungen',
        },
      ].filter(Boolean),
    [locale, rollup.length, perms]
  );

  const tabCanEdit =
    tab === 'decisions' ? canEditDecisions : tab === 'meetings' || tab === 'actions' ? canEditLog : false;

  useEffect(() => {
    if (!TABS.some((t) => t.id === tab) && TABS[0]) setTab(TABS[0].id);
  }, [TABS, tab]);

  if (!perms.canView('log') && !perms.canView('decisions')) {
    return (
      <div className="impllog" style={cssVars}>
        <p className="impllog-empty">
          {locale === 'en' ? 'This module is not available in your portal.' : 'Dieses Modul ist in Ihrem Portal nicht freigeschaltet.'}
        </p>
        <button className="impl-btn" onClick={backToGuide} type="button">
          <ArrowLeft className="w-4 h-4" />
          {locale === 'en' ? 'Back to guide' : 'Zurück zum Leitfaden'}
        </button>
      </div>
    );
  }

  return (
    <div className={`impllog ${!tabCanEdit ? 'impl-readonly' : ''}`} style={cssVars}>
      <div className="impllog-head">
        <div>
          <h1 className="impllog-title">
            {locale === 'en' ? 'Project log' : 'Projekt-Log'}
            {session.customer ? ` · ${session.customer}` : ''}
          </h1>
        </div>
        <div className="impllog-actions">
          <button className="impl-btn" onClick={backToGuide} type="button">
            <ArrowLeft className="w-4 h-4" />
            {locale === 'en' ? 'Guide' : 'Leitfaden'}
          </button>
          {(canEditLog || canEditDecisions) && (
            <button className="impl-btn impl-btn--primary" onClick={saveCloud} type="button" disabled={syncing}>
              {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Cloud className="w-4 h-4" />}
              {locale === 'en' ? 'Save' : 'Speichern'}
            </button>
          )}
          {syncMsg && <span style={{ fontSize: 13, color: 'var(--impl-accent)' }}>{syncMsg}</span>}
        </div>
      </div>

      <div className="impllog-tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`impllog-tab ${tab === t.id ? 'impllog-tab--active' : ''}`}
            onClick={() => setTab(t.id)}
            type="button"
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'meetings' && (
        <>
          <div style={{ marginBottom: 14, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {MEETING_TYPES.map((mt) => (
              <button key={mt} className="impl-btn" onClick={() => addMeeting(mt)} type="button">
                <Plus className="w-4 h-4" />
                {MEETING_TYPE_LABEL[locale][mt]}
              </button>
            ))}
          </div>
          {sortedMeetings.length === 0 ? (
            <div className="impllog-empty">
              {locale === 'en' ? 'No meetings yet — add one above.' : 'Noch keine Meetings — oben eines hinzufügen.'}
            </div>
          ) : (
            <div className="impllog-list">
              {sortedMeetings.map((m) => (
                <div key={m.id} className="impllog-card impl-glass">
                  <div className="impllog-card-head">
                    <span className="impllog-badge">{MEETING_TYPE_LABEL[locale][m.type] || m.type}</span>
                    <input
                      className="impl-input"
                      style={{ flex: 1, minWidth: 160 }}
                      placeholder={locale === 'en' ? 'Title' : 'Titel'}
                      value={m.title}
                      onChange={(e) => updateMeeting(m.id, { title: e.target.value })}
                    />
                    <input
                      type="date"
                      className="impl-input"
                      style={{ width: 150 }}
                      value={m.date}
                      onChange={(e) => updateMeeting(m.id, { date: e.target.value })}
                    />
                    <button className="impl-btn" style={{ padding: 8 }} onClick={() => removeMeeting(m.id)} type="button">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="impllog-grid2">
                    <div className="impllog-field">
                      <span>{locale === 'en' ? 'Attendees' : 'Teilnehmende'}</span>
                      <input
                        className="impl-input"
                        value={m.attendees}
                        onChange={(e) => updateMeeting(m.id, { attendees: e.target.value })}
                      />
                    </div>
                    <div className="impllog-field">
                      <span>{locale === 'en' ? 'Agenda' : 'Agenda'}</span>
                      <input
                        className="impl-input"
                        value={m.agenda}
                        onChange={(e) => updateMeeting(m.id, { agenda: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="impllog-field" style={{ marginTop: 10 }}>
                    <span>{locale === 'en' ? 'Notes' : 'Notizen'}</span>
                    <textarea
                      className="impl-input"
                      rows={3}
                      value={m.notes}
                      onChange={(e) => updateMeeting(m.id, { notes: e.target.value })}
                    />
                  </div>

                  <div style={{ marginTop: 12 }}>
                    <span className="impllog-field" style={{ fontSize: 11, color: 'var(--impl-text-soft)' }}>
                      Action Items
                    </span>
                    {(m.actions || []).map((a) => (
                      <div className="impllog-action" key={a.id}>
                        <input
                          type="checkbox"
                          checked={a.done}
                          onChange={(e) => updateAction(m.id, a.id, { done: e.target.checked })}
                        />
                        <input
                          type="text"
                          className={a.done ? 'is-done' : ''}
                          placeholder={locale === 'en' ? 'Action…' : 'Aufgabe…'}
                          value={a.text}
                          onChange={(e) => updateAction(m.id, a.id, { text: e.target.value })}
                        />
                        <input
                          type="text"
                          className="a-owner"
                          placeholder={locale === 'en' ? 'Owner' : 'Wer'}
                          value={a.owner}
                          onChange={(e) => updateAction(m.id, a.id, { owner: e.target.value })}
                        />
                        <input
                          type="date"
                          className="a-due"
                          value={a.due}
                          onChange={(e) => updateAction(m.id, a.id, { due: e.target.value })}
                        />
                        <button className="impl-btn" style={{ padding: 6 }} onClick={() => removeAction(m.id, a.id)} type="button">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    <button className="impl-btn" style={{ marginTop: 8 }} onClick={() => addActionTo(m.id)} type="button">
                      <Plus className="w-4 h-4" />
                      {locale === 'en' ? 'Add action' : 'Action hinzufügen'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {tab === 'actions' && (
        <>
          {rollup.length === 0 ? (
            <div className="impllog-empty">
              {locale === 'en' ? 'No open action items 🎉' : 'Keine offenen Action Items 🎉'}
            </div>
          ) : (
            <div className="impllog-list">
              {rollup.map((a) => (
                <div key={a.id} className="impllog-card impl-glass" style={{ padding: 12 }}>
                  <div className="impllog-action" style={{ border: 'none' }}>
                    <input
                      type="checkbox"
                      checked={a.done}
                      onChange={(e) => updateAction(a.meetingId, a.id, { done: e.target.checked })}
                    />
                    <input
                      type="text"
                      value={a.text}
                      onChange={(e) => updateAction(a.meetingId, a.id, { text: e.target.value })}
                    />
                    <input
                      type="text"
                      className="a-owner"
                      placeholder={locale === 'en' ? 'Owner' : 'Wer'}
                      value={a.owner}
                      onChange={(e) => updateAction(a.meetingId, a.id, { owner: e.target.value })}
                    />
                    <input
                      type="date"
                      className="a-due"
                      value={a.due}
                      onChange={(e) => updateAction(a.meetingId, a.id, { due: e.target.value })}
                    />
                  </div>
                  <div className="impllog-rollup-meta" style={{ marginLeft: 28 }}>
                    {a.meetingTitle || (locale === 'en' ? 'Meeting' : 'Meeting')} · {a.meetingDate}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {tab === 'decisions' && (
        <>
          <div style={{ marginBottom: 14 }}>
            <button className="impl-btn" onClick={addDecision} type="button">
              <Plus className="w-4 h-4" />
              {locale === 'en' ? 'Add decision' : 'Entscheidung hinzufügen'}
            </button>
          </div>
          <div className="impllog-list">
            {decisions.map((d, i) => (
              <div key={d.id} className="impllog-card impl-glass">
                <div className="impllog-card-head">
                  <span className="impllog-dec-nr">{d.nr || i + 1}</span>
                  <input
                    className="impl-input"
                    style={{ flex: 1, minWidth: 180 }}
                    value={d.title}
                    placeholder={locale === 'en' ? 'Decision' : 'Entscheidung'}
                    onChange={(e) => updateDecision(d.id, { title: e.target.value })}
                  />
                  <button
                    className={`impllog-status impllog-status--${d.status}`}
                    onClick={() => cycleDecision(d.id)}
                    type="button"
                  >
                    {DECISION_STATUS_LABEL[locale][d.status]}
                  </button>
                  <button className="impl-btn" style={{ padding: 8 }} onClick={() => removeDecision(d.id)} type="button">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="impllog-grid2">
                  <div className="impllog-field">
                    <span>{locale === 'en' ? 'Relevant because' : 'Relevant weil'}</span>
                    <input
                      className="impl-input"
                      value={d.relevant}
                      onChange={(e) => updateDecision(d.id, { relevant: e.target.value })}
                    />
                  </div>
                  <div className="impllog-field">
                    <span>{locale === 'en' ? 'Owner' : 'Verantwortlich'}</span>
                    <input
                      className="impl-input"
                      value={d.owner}
                      onChange={(e) => updateDecision(d.id, { owner: e.target.value })}
                    />
                  </div>
                  <div className="impllog-field">
                    <span>{locale === 'en' ? 'Decided on' : 'Entschieden am'}</span>
                    <input
                      type="date"
                      className="impl-input"
                      value={d.date}
                      onChange={(e) => updateDecision(d.id, { date: e.target.value })}
                    />
                  </div>
                </div>
                <div className="impllog-field" style={{ marginTop: 10 }}>
                  <span>{locale === 'en' ? 'Decision / rationale' : 'Entscheidung / Begründung'}</span>
                  <textarea
                    className="impl-input"
                    rows={2}
                    value={d.decision}
                    onChange={(e) => updateDecision(d.id, { decision: e.target.value })}
                  />
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
