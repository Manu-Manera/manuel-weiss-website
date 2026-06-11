import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Cloud, Loader2 } from 'lucide-react';
import '../styles/implementation-guide.css';
import '../styles/implementation-scorecard.css';
import { buildScorecard } from '../kickoff/implementationScorecard';
import { brandingCssVars, normalizeBranding } from '../kickoff/implementationBranding';
import { defaultSession, mergeSession } from '../kickoff/kickoffStudioMerge';
import {
  EDIT_PASSWORD_STORAGE_KEY,
  fetchCloudSession,
  loadLocalSession,
  newSessionId,
  resolveEditPassword,
  saveImplementationSession,
  saveLocalSession,
} from '../kickoff/kickoffStudioService';
import { upsertWorkspace, workspaceFromSession } from '../kickoff/implementationWorkspace';
import { useImplementationPortal } from '../context/ImplementationPortalContext';
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

function fmtDate(iso, locale) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString(locale === 'en' ? 'en-GB' : 'de-CH');
  } catch {
    return iso;
  }
}

export default function ImplementationScorecard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [session, setSession] = useState(() => initSession(searchParams));
  const [password, setPassword] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState('');

  const portalFromHost = useImplPortal();
  const { portalMode: portalFromCtx, portalPassword } = useImplementationPortal();
  const portalMode = portalFromCtx || portalFromHost;
  const perms = useImplPermissions(session, portalMode);
  const locale = session.locale || 'de';
  const cssVars = useMemo(() => brandingCssVars(normalizeBranding(session.branding)), [session.branding]);
  const score = useMemo(() => buildScorecard(session, locale), [session, locale]);

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
    const opts = portalMode
      ? { portalPassword }
      : { facilitatorPassword: resolveEditPassword(password) };
    fetchCloudSession(sid, opts)
      .then((cloud) => {
        if (cloud) setSession((prev) => mergeSession({ ...prev, ...cloud }, prev.tenantSlug));
      })
      .catch(() => {});
  }, [searchParams, portalMode, portalPassword, password]);

  useEffect(() => {
    saveLocalSession(session);
    const meta = workspaceFromSession({ ...session, updatedAt: Date.now() });
    if (meta) upsertWorkspace(meta);
  }, [session]);

  const backToGuide = () => {
    const p = new URLSearchParams();
    if (session.sessionId) p.set('s', session.sessionId);
    if (portalMode) p.set('portal', '1');
    navigate(`/implementation-studio?${p.toString()}`);
  };

  if (!perms.canView('scorecard') && !perms.canView('plan')) {
    return (
      <div className="implscore" style={cssVars}>
        <p>{locale === 'en' ? 'Scorecard not available.' : 'Scorecard nicht freigeschaltet.'}</p>
        <button className="impl-btn" onClick={backToGuide} type="button">
          <ArrowLeft className="w-4 h-4" />
          {locale === 'en' ? 'Back' : 'Zurück'}
        </button>
      </div>
    );
  }

  const saveCloud = async () => {
    setSyncing(true);
    setSyncMsg('');
    try {
      await saveImplementationSession(session, {
        portalMode,
        portalPassword,
        facilitatorPassword: password,
        actor: portalMode ? 'customer' : 'facilitator',
      });
      setSyncMsg(locale === 'en' ? 'Saved' : 'Gespeichert');
      setTimeout(() => setSyncMsg(''), 2500);
    } catch (e) {
      setSyncMsg(e.message || 'Fehler');
    } finally {
      setSyncing(false);
    }
  };

  const daysLabel =
    score.daysToGoLive != null
      ? score.daysToGoLive >= 0
        ? locale === 'en'
          ? `${score.daysToGoLive} days left`
          : `${score.daysToGoLive} Tage bis Go-Live`
        : locale === 'en'
          ? `${Math.abs(score.daysToGoLive)} days overdue`
          : `${Math.abs(score.daysToGoLive)} Tage über Go-Live`
      : '';

  return (
    <div className="implscore" style={cssVars}>
      <div className="impl-header" style={{ marginBottom: 16 }}>
        <h1 className="impl-title">
          {locale === 'en' ? 'Project scorecard' : 'Projekt-Scorecard'}
          {session.customer ? ` · ${session.customer}` : ''}
        </h1>
        <div className="impl-header-actions">
          <button className="impl-btn impl-btn--nav" onClick={backToGuide} type="button">
            <ArrowLeft className="w-4 h-4" />
            {locale === 'en' ? 'Guide' : 'Leitfaden'}
          </button>
          {!portalMode && perms.canEdit('plan') && (
            <button className="impl-btn impl-btn--primary" onClick={saveCloud} type="button" disabled={syncing}>
              {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Cloud className="w-4 h-4" />}
              {locale === 'en' ? 'Save' : 'Speichern'}
            </button>
          )}
          {syncMsg && <span style={{ fontSize: 13, color: 'var(--impl-accent)' }}>{syncMsg}</span>}
        </div>
      </div>

      <div className="implscore-hero impl-glass">
        <div className={`implscore-ampel implscore-ampel--${score.ampel}`}>{score.ampelLabel}</div>
        <div>
          <h2 className="implscore-hero-title">
            {score.overallProgress}% {locale === 'en' ? 'overall progress' : 'Gesamtfortschritt'}
          </h2>
          <p className="implscore-hero-sub">
            {score.currentPhase
              ? `${locale === 'en' ? 'Current phase' : 'Aktuelle Phase'}: ${score.currentPhase.title}`
              : ''}
          </p>
          <div className="implscore-progress-bar">
            <div className="implscore-progress-fill" style={{ width: `${score.overallProgress}%` }} />
          </div>
          {score.reasons.length > 0 && (
            <ul className="implscore-reasons">
              {score.reasons.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="implscore-timeline">
        <div className="implscore-timecard impl-glass">
          <div className="implscore-timecard-label">{locale === 'en' ? 'Kick-off' : 'Kick-off'}</div>
          <div className="implscore-timecard-value">{fmtDate(score.kickoffDate, locale)}</div>
          {score.daysSinceKickoff != null && (
            <div style={{ fontSize: 11, color: 'var(--impl-text-soft)', marginTop: 4 }}>
              {locale === 'en' ? `${score.daysSinceKickoff} days ago` : `${score.daysSinceKickoff} Tage her`}
            </div>
          )}
        </div>
        <div className="implscore-timecard impl-glass implscore-timecard--highlight">
          <div className="implscore-timecard-label">{locale === 'en' ? 'Today' : 'Heute'}</div>
          <div className="implscore-timecard-value">{fmtDate(new Date().toISOString().slice(0, 10), locale)}</div>
        </div>
        <div className="implscore-timecard impl-glass">
          <div className="implscore-timecard-label">Go-Live</div>
          <div className="implscore-timecard-value">{fmtDate(score.goLiveDate, locale)}</div>
          {daysLabel && (
            <div style={{ fontSize: 11, color: 'var(--impl-accent)', marginTop: 4, fontWeight: 600 }}>
              {daysLabel}
            </div>
          )}
        </div>
      </div>

      <div className="implscore-grid">
        <div className="implscore-card impl-glass">
          <h3>{locale === 'en' ? 'Phases & dependencies' : 'Phasen & Abhängigkeiten'}</h3>
          <div className="implscore-phases">
            {score.phases.map((ph) => (
              <div
                key={ph.id}
                className={`implscore-phase ${ph.isCurrent ? 'implscore-phase--current' : ''}`}
              >
                <span className={`implscore-phase-dot implscore-phase-dot--${ph.ampel}`} />
                <div className="implscore-phase-name">{ph.title}</div>
                <div className="implscore-phase-pct">
                  {ph.progress}% · {ph.done}/{ph.total}
                  {!ph.depsOk && (locale === 'en' ? ' · waiting' : ' · wartet')}
                  {ph.blocked > 0 && ` · ${ph.blocked} block.`}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="implscore-card impl-glass">
          <h3>{locale === 'en' ? 'Milestones' : 'Meilensteine'}</h3>
          {score.milestones.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--impl-text-soft)' }}>—</p>
          ) : (
            score.milestones.map((m) => (
              <div
                key={m.id}
                className={`implscore-milestone ${m.done ? 'implscore-milestone--done' : ''} ${m.overdue ? 'implscore-milestone--overdue' : ''}`}
              >
                <span>{m.done ? '✓' : m.overdue ? '!' : '○'}</span>
                <span style={{ flex: 1 }}>{m.title}</span>
                <span style={{ fontSize: 12, color: 'var(--impl-text-soft)' }}>{fmtDate(m.date, locale)}</span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="implscore-grid">
        <div className="implscore-card impl-glass">
          <h3>{locale === 'en' ? 'Top to-dos' : 'Wichtigste To-dos'}</h3>
          {score.topTodos.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--impl-text-soft)' }}>
              {locale === 'en' ? 'No open items' : 'Keine offenen Punkte'}
            </p>
          ) : (
            score.topTodos.map((t) => (
              <div key={t.id} className="implscore-todo">
                <span style={{ flex: 1 }}>{t.text}</span>
                {t.owner && (
                  <span style={{ fontSize: 11, color: 'var(--impl-text-soft)' }}>{t.owner}</span>
                )}
                {t.due && <span className="implscore-todo-due">{t.due}</span>}
              </div>
            ))
          )}
        </div>

        <div className="implscore-card impl-glass">
          <h3>{locale === 'en' ? 'Risks & measures' : 'Risiken & Massnahmen'}</h3>
          {score.hotRisks.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--impl-text-soft)' }}>
              {locale === 'en' ? 'No open risks' : 'Keine offenen Risiken'}
            </p>
          ) : (
            score.hotRisks.map((r) => (
              <div key={r.id} className="implscore-risk">
                <div className="implscore-risk-title">{r.title || '—'}</div>
                {r.mitigation && <div className="implscore-risk-mit">{r.mitigation}</div>}
                {r.owner && (
                  <div style={{ fontSize: 11, color: 'var(--impl-text-soft)', marginTop: 2 }}>{r.owner}</div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="implscore-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))' }}>
        <div className="implscore-card impl-glass" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 22, fontWeight: 800 }}>{score.overdueCount}</div>
          <div style={{ fontSize: 12, color: 'var(--impl-text-soft)' }}>
            {locale === 'en' ? 'Overdue' : 'Überfällig'}
          </div>
        </div>
        <div className="implscore-card impl-glass" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 22, fontWeight: 800 }}>{score.blockedCount}</div>
          <div style={{ fontSize: 12, color: 'var(--impl-text-soft)' }}>
            {locale === 'en' ? 'Blocked' : 'Blockiert'}
          </div>
        </div>
        <div className="implscore-card impl-glass" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 22, fontWeight: 800 }}>{score.openRiskCount}</div>
          <div style={{ fontSize: 12, color: 'var(--impl-text-soft)' }}>
            {locale === 'en' ? 'Open risks' : 'Risiken offen'}
          </div>
        </div>
      </div>
    </div>
  );
}
