import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Cloud, Loader2, Plus, Trash2 } from 'lucide-react';
import '../styles/implementation-guide.css';
import '../styles/implementation-log.css';
import '../styles/implementation-registers.css';
import {
  ACCESS_LABEL,
  ACCESS_LEVELS,
  RISK_LEVELS,
  RISK_LEVEL_LABEL,
  RISK_STATUSES,
  RISK_STATUS_LABEL,
  UAT_STATUSES,
  UAT_STATUS_LABEL,
  buildStandardRoles,
  newRisk,
  newRole,
  newUat,
  newUser,
  riskScore,
} from '../kickoff/implementationRegisters';
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
import { useImplementationPortal } from '../context/ImplementationPortalContext';
import { upsertWorkspace, workspaceFromSession } from '../kickoff/implementationWorkspace';
import {
  registerModuleForTab,
  useImplPermissions,
  useImplPortal,
} from '../kickoff/useImplPermissions';

function initSession(searchParams) {
  const sid = searchParams.get('s') || searchParams.get('session');
  if (sid) {
    const local = loadLocalSession(sid);
    if (local) return mergeSession(local, local.tenantSlug);
    return mergeSession(defaultSession(sid), '');
  }
  return mergeSession(defaultSession(newSessionId()), '');
}

function cycle(list, cur) {
  return list[(list.indexOf(cur) + 1) % list.length];
}

export default function ImplementationRegisters() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [session, setSession] = useState(() => initSession(searchParams));
  const [tab, setTab] = useState(searchParams.get('tab') || 'users');
  const [password, setPassword] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState('');

  const locale = session.locale || 'de';
  const portalFromHost = useImplPortal();
  const { portalMode: portalFromCtx, portalPassword } = useImplementationPortal();
  const portalMode = portalFromCtx || portalFromHost;
  const perms = useImplPermissions(session, portalMode);
  const tabModule = registerModuleForTab(tab);
  const canEditTab = perms.canEdit(tabModule);
  const cssVars = useMemo(() => brandingCssVars(normalizeBranding(session.branding)), [session.branding]);

  const users = session.users || [];
  const roles = useMemo(
    () => (session.roles?.length ? session.roles : buildStandardRoles()),
    [session.roles]
  );
  const uat = session.uat || [];
  const risks = session.risks || [];

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

  const setKey = (key, seed) => (updater) =>
    setSession((s) => {
      const cur = s[key]?.length ? s[key] : seed ? seed() : [];
      return { ...s, [key]: typeof updater === 'function' ? updater(cur) : updater };
    });

  const setUsers = setKey('users');
  const setRoles = setKey('roles', buildStandardRoles);
  const setUat = setKey('uat');
  const setRisks = setKey('risks');

  const upd = (setter) => (id, p) => setter((arr) => arr.map((x) => (x.id === id ? { ...x, ...p } : x)));
  const del = (setter) => (id) => setter((arr) => arr.filter((x) => x.id !== id));

  const updUser = upd(setUsers);
  const updRole = upd(setRoles);
  const updUat = upd(setUat);
  const updRisk = upd(setRisks);

  const saveCloud = async () => {
    setSyncing(true);
    setSyncMsg('');
    try {
      await saveImplementationSession(
        { ...session, users, roles, uat, risks },
        {
          portalMode,
          portalPassword,
          facilitatorPassword: password,
          actor: portalMode ? 'customer' : 'facilitator',
        }
      );
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

  const roleNames = roles.map((r) => r.name).filter(Boolean);

  const TABS = useMemo(
    () =>
      [
        perms.canView('stakeholders') && {
          id: 'users',
          label: locale === 'en' ? 'Users / Stakeholders' : 'User / Stakeholder',
        },
        perms.canView('roles') && {
          id: 'roles',
          label: locale === 'en' ? 'Roles & use cases' : 'Rollen & Use-Cases',
        },
        perms.canView('uat') && {
          id: 'uat',
          label: locale === 'en' ? 'UAT checklist' : 'UAT-Checkliste',
        },
        perms.canView('risks') && {
          id: 'risks',
          label: locale === 'en' ? 'Risks' : 'Risiken',
        },
      ].filter(Boolean),
    [locale, perms]
  );

  useEffect(() => {
    if (!TABS.some((t) => t.id === tab) && TABS[0]) setTab(TABS[0].id);
  }, [TABS, tab]);

  if (
    !perms.canView('stakeholders') &&
    !perms.canView('roles') &&
    !perms.canView('uat') &&
    !perms.canView('risks')
  ) {
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
    <div className={`impllog ${!canEditTab ? 'impl-readonly' : ''}`} style={cssVars}>
      <div className="impllog-head">
        <h1 className="impllog-title">
          {locale === 'en' ? 'Registers' : 'Register'}
          {session.customer ? ` · ${session.customer}` : ''}
        </h1>
        <div className="impllog-actions">
          <button className="impl-btn" onClick={backToGuide} type="button">
            <ArrowLeft className="w-4 h-4" />
            {locale === 'en' ? 'Guide' : 'Leitfaden'}
          </button>
          {(perms.canEdit('stakeholders') ||
            perms.canEdit('roles') ||
            perms.canEdit('uat') ||
            perms.canEdit('risks')) && (
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

      {/* USERS */}
      {tab === 'users' && (
        <>
          <div style={{ marginBottom: 14 }}>
            <button className="impl-btn" onClick={() => setUsers((a) => [...a, newUser()])} type="button">
              <Plus className="w-4 h-4" />
              {locale === 'en' ? 'Add user' : 'User hinzufügen'}
            </button>
          </div>
          {users.length === 0 ? (
            <div className="impllog-empty">
              {locale === 'en' ? 'No users yet.' : 'Noch keine User erfasst.'}
            </div>
          ) : (
            <div className="impllog-list">
              {users.map((u) => (
                <div key={u.id} className="impllog-card impl-glass" style={{ padding: 12 }}>
                  <div className="impllog-grid2">
                    <div className="impllog-field">
                      <span>{locale === 'en' ? 'Name' : 'Name'}</span>
                      <input className="impl-input" value={u.name} onChange={(e) => updUser(u.id, { name: e.target.value })} />
                    </div>
                    <div className="impllog-field">
                      <span>E-Mail</span>
                      <input className="impl-input" value={u.email} onChange={(e) => updUser(u.id, { email: e.target.value })} />
                    </div>
                    <div className="impllog-field">
                      <span>{locale === 'en' ? 'Role' : 'Rolle'}</span>
                      <input className="impl-input" list="reg-roles" value={u.role} onChange={(e) => updUser(u.id, { role: e.target.value })} />
                    </div>
                    <div className="impllog-field">
                      <span>{locale === 'en' ? 'Department' : 'Abteilung'}</span>
                      <input className="impl-input" value={u.dept} onChange={(e) => updUser(u.id, { dept: e.target.value })} />
                    </div>
                    <div className="impllog-field">
                      <span>{locale === 'en' ? 'Access' : 'Zugriff'}</span>
                      <select className="impl-select" value={u.access} onChange={(e) => updUser(u.id, { access: e.target.value })}>
                        {ACCESS_LEVELS.map((a) => (
                          <option key={a} value={a}>
                            {ACCESS_LABEL[locale][a]}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    <input
                      className="impl-input"
                      placeholder={locale === 'en' ? 'Notes' : 'Notizen'}
                      value={u.notes}
                      onChange={(e) => updUser(u.id, { notes: e.target.value })}
                    />
                    <button className="impl-btn" style={{ padding: 8 }} onClick={() => del(setUsers)(u.id)} type="button">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <datalist id="reg-roles">
            {roleNames.map((n) => (
              <option key={n} value={n} />
            ))}
          </datalist>
        </>
      )}

      {/* ROLES */}
      {tab === 'roles' && (
        <>
          <div style={{ marginBottom: 14 }}>
            <button className="impl-btn" onClick={() => setRoles((a) => [...a, newRole()])} type="button">
              <Plus className="w-4 h-4" />
              {locale === 'en' ? 'Add role' : 'Rolle hinzufügen'}
            </button>
          </div>
          <div className="impllog-list">
            {roles.map((r) => (
              <div key={r.id} className="impllog-card impl-glass">
                <div className="impllog-card-head">
                  <input
                    className="impl-input impllog-rolehead"
                    style={{ flex: 1, minWidth: 160 }}
                    value={r.name}
                    placeholder={locale === 'en' ? 'Role name' : 'Rollenname'}
                    onChange={(e) => updRole(r.id, { name: e.target.value })}
                  />
                  <button className="impl-btn" style={{ padding: 8 }} onClick={() => del(setRoles)(r.id)} type="button">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="impllog-field" style={{ marginTop: 10 }}>
                  <span>{locale === 'en' ? 'Use cases' : 'Use-Cases'}</span>
                  <textarea className="impl-input" rows={2} value={r.useCases} onChange={(e) => updRole(r.id, { useCases: e.target.value })} />
                </div>
                <div className="impllog-field" style={{ marginTop: 8 }}>
                  <span>{locale === 'en' ? 'Permissions / scope' : 'Berechtigungen / Scope'}</span>
                  <input className="impl-input" value={r.permissions} onChange={(e) => updRole(r.id, { permissions: e.target.value })} />
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* UAT */}
      {tab === 'uat' && (
        <>
          <div style={{ marginBottom: 14 }}>
            <button className="impl-btn" onClick={() => setUat((a) => [...a, newUat()])} type="button">
              <Plus className="w-4 h-4" />
              {locale === 'en' ? 'Add test case' : 'Testfall hinzufügen'}
            </button>
          </div>
          {uat.length === 0 ? (
            <div className="impllog-empty">
              {locale === 'en' ? 'No UAT cases yet.' : 'Noch keine UAT-Fälle.'}
            </div>
          ) : (
            <div className="impllog-list">
              {uat.map((t) => (
                <div key={t.id} className="impllog-card impl-glass" style={{ padding: 12 }}>
                  <div className="impllog-card-head">
                    <input
                      className="impl-input"
                      list="reg-roles"
                      style={{ width: 170 }}
                      placeholder={locale === 'en' ? 'Role' : 'Rolle'}
                      value={t.role}
                      onChange={(e) => updUat(t.id, { role: e.target.value })}
                    />
                    <input
                      className="impl-input"
                      style={{ flex: 1, minWidth: 160 }}
                      placeholder={locale === 'en' ? 'Use case' : 'Use-Case'}
                      value={t.useCase}
                      onChange={(e) => updUat(t.id, { useCase: e.target.value })}
                    />
                    <button
                      className={`impllog-pill impllog-pill--${t.status}`}
                      onClick={() => updUat(t.id, { status: cycle(UAT_STATUSES, t.status) })}
                      type="button"
                    >
                      {UAT_STATUS_LABEL[locale][t.status]}
                    </button>
                    <button className="impl-btn" style={{ padding: 8 }} onClick={() => del(setUat)(t.id)} type="button">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="impllog-grid2">
                    <div className="impllog-field">
                      <span>{locale === 'en' ? 'Expected result' : 'Erwartetes Ergebnis'}</span>
                      <input className="impl-input" value={t.expected} onChange={(e) => updUat(t.id, { expected: e.target.value })} />
                    </div>
                    <div className="impllog-field">
                      <span>{locale === 'en' ? 'Tester' : 'Tester'}</span>
                      <input className="impl-input" value={t.tester} onChange={(e) => updUat(t.id, { tester: e.target.value })} />
                    </div>
                  </div>
                  <div className="impllog-field" style={{ marginTop: 8 }}>
                    <span>{locale === 'en' ? 'Notes / findings' : 'Notizen / Findings'}</span>
                    <input className="impl-input" value={t.notes} onChange={(e) => updUat(t.id, { notes: e.target.value })} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* RISKS */}
      {tab === 'risks' && (
        <>
          <div style={{ marginBottom: 14 }}>
            <button className="impl-btn" onClick={() => setRisks((a) => [...a, newRisk()])} type="button">
              <Plus className="w-4 h-4" />
              {locale === 'en' ? 'Add risk' : 'Risiko hinzufügen'}
            </button>
          </div>
          {risks.length === 0 ? (
            <div className="impllog-empty">{locale === 'en' ? 'No risks logged.' : 'Keine Risiken erfasst.'}</div>
          ) : (
            <div className="impllog-list">
              {[...risks]
                .sort((a, b) => riskScore(b) - riskScore(a))
                .map((r) => {
                  const score = riskScore(r);
                  return (
                    <div key={r.id} className="impllog-card impl-glass">
                      <div className="impllog-card-head">
                        <input
                          className="impl-input"
                          style={{ flex: 1, minWidth: 160 }}
                          placeholder={locale === 'en' ? 'Risk' : 'Risiko'}
                          value={r.title}
                          onChange={(e) => updRisk(r.id, { title: e.target.value })}
                        />
                        <button
                          className={`impllog-pill impllog-pill--${r.status}`}
                          onClick={() => updRisk(r.id, { status: cycle(RISK_STATUSES, r.status) })}
                          type="button"
                        >
                          {RISK_STATUS_LABEL[locale][r.status]}
                        </button>
                        <span className={`impllog-score ${score >= 6 ? 'impllog-score--hot' : ''}`}>{score}</span>
                        <button className="impl-btn" style={{ padding: 8 }} onClick={() => del(setRisks)(r.id)} type="button">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div style={{ display: 'flex', gap: 14, marginTop: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 11, color: 'var(--impl-text-soft)' }}>
                            {locale === 'en' ? 'Impact' : 'Auswirkung'}
                          </span>
                          <button
                            className={`impllog-sev impllog-sev--${r.impact}`}
                            onClick={() => updRisk(r.id, { impact: cycle(RISK_LEVELS, r.impact) })}
                            type="button"
                          >
                            {RISK_LEVEL_LABEL[locale][r.impact]}
                          </button>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 11, color: 'var(--impl-text-soft)' }}>
                            {locale === 'en' ? 'Likelihood' : 'Wahrscheinlichkeit'}
                          </span>
                          <button
                            className={`impllog-sev impllog-sev--${r.likelihood}`}
                            onClick={() => updRisk(r.id, { likelihood: cycle(RISK_LEVELS, r.likelihood) })}
                            type="button"
                          >
                            {RISK_LEVEL_LABEL[locale][r.likelihood]}
                          </button>
                        </div>
                        <input
                          className="impl-input"
                          style={{ width: 150 }}
                          placeholder={locale === 'en' ? 'Owner' : 'Verantwortlich'}
                          value={r.owner}
                          onChange={(e) => updRisk(r.id, { owner: e.target.value })}
                        />
                      </div>
                      <div className="impllog-field" style={{ marginTop: 10 }}>
                        <span>{locale === 'en' ? 'Mitigation' : 'Gegenmassnahme'}</span>
                        <textarea className="impl-input" rows={2} value={r.mitigation} onChange={(e) => updRisk(r.id, { mitigation: e.target.value })} />
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
