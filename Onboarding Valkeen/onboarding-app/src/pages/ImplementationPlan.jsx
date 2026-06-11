import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Cloud,
  Loader2,
  Plus,
  Trash2,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import '../styles/implementation-guide.css';
import '../styles/implementation-plan.css';
import '../styles/implementation-workshop-shell.css';
import ImplementationHubBar from '../kickoff/ImplementationHubBar';
import { IMPL_PHASES } from '../kickoff/implementationTemplate';
import {
  PLAN_STATUSES,
  PLAN_STATUS_LABEL,
  addDays,
  buildDefaultPlan,
  dayDiff,
  newTask,
  parseISO,
  phaseTitle,
  allStepIdsForDeps,
  isTaskBlocked,
  planBounds,
  toISO,
} from '../kickoff/implementationPlan';
import {
  combinedTaskProgress,
  ensurePlanLearning,
  learningModuleStatuses,
  planLearningSummary,
  suggestTrainingCustomerId,
} from '../kickoff/implementationPlanLearning';
import { getProgressAggregate } from '../services/trainingAdminService';
import { resolveArtifactHref, getArtifact } from '../kickoff/implementationWorkshopCatalog';
import { GraduationCap, ExternalLink } from 'lucide-react';
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
import { useImplPermissions, useImplPortal } from '../kickoff/useImplPermissions';

const MONTHS = {
  de: ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
};

function initSession(searchParams) {
  const sid = searchParams.get('s') || searchParams.get('session');
  if (sid) {
    const local = loadLocalSession(sid);
    if (local) return mergeSession(local, local.tenantSlug);
    return mergeSession(defaultSession(sid), '');
  }
  return mergeSession(defaultSession(newSessionId()), '');
}

export default function ImplementationPlan() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [session, setSession] = useState(() => initSession(searchParams));
  const [view, setView] = useState('gantt');
  const [pxPerDay, setPxPerDay] = useState(18);
  const [editing, setEditing] = useState(null); // task id
  const [password, setPassword] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState('');
  const [trainingAggregate, setTrainingAggregate] = useState(null);
  const [trainingLoadErr, setTrainingLoadErr] = useState('');
  const learningSyncedRef = useRef('');

  const locale = session.locale || 'de';
  const portalFromHost = useImplPortal();
  const { portalMode: portalFromCtx, portalPassword } = useImplementationPortal();
  const portalMode = portalFromCtx || portalFromHost;
  const perms = useImplPermissions(session, portalMode);
  const canEdit = perms.canEdit('plan');
  const cssVars = useMemo(() => brandingCssVars(normalizeBranding(session.branding)), [session.branding]);

  const tasks = useMemo(() => {
    const raw = session.projectPlan?.length
      ? session.projectPlan
      : buildDefaultPlan(toISO(new Date()), locale);
    return ensurePlanLearning(raw, locale);
  }, [session.projectPlan, locale]);

  const trainingCustomerId = session.trainingCustomerId || suggestTrainingCustomerId(session);

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

  useEffect(() => {
    if (!trainingCustomerId) return;
    let cancelled = false;
    setTrainingLoadErr('');
    getProgressAggregate(trainingCustomerId)
      .then((data) => {
        if (!cancelled) setTrainingAggregate(data);
      })
      .catch((e) => {
        if (!cancelled) setTrainingLoadErr(e.message || 'Training-Fortschritt nicht geladen');
      });
    return () => {
      cancelled = true;
    };
  }, [trainingCustomerId]);

  const learningSummary = useMemo(
    () => planLearningSummary(tasks, session, trainingAggregate, locale),
    [tasks, session, trainingAggregate, locale]
  );

  /** Learning-To-dos einmalig in session.projectPlan persistieren. */
  useEffect(() => {
    const key = `${session.sessionId}:${locale}`;
    if (learningSyncedRef.current === key) return;
    if (!session.projectPlan?.length) return;
    const enriched = ensurePlanLearning(session.projectPlan, locale);
    const changed = enriched.some((t, i) => {
      const orig = session.projectPlan[i];
      return JSON.stringify(t.todos) !== JSON.stringify(orig?.todos) || t.learning && !orig?.learning;
    });
    learningSyncedRef.current = key;
    if (changed) {
      setSession((s) => ({ ...s, projectPlan: enriched }));
    }
  }, [session.sessionId, session.projectPlan, locale]);

  const setTasks = useCallback(
    (updater) =>
      setSession((s) => {
        const cur = s.projectPlan?.length ? s.projectPlan : buildDefaultPlan(toISO(new Date()), locale);
        const next = typeof updater === 'function' ? updater(cur) : updater;
        return { ...s, projectPlan: next };
      }),
    [locale]
  );

  const updateTask = (id, patch) =>
    setTasks((arr) => arr.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  const removeTask = (id) => setTasks((arr) => arr.filter((t) => t.id !== id));
  const addTaskToPhase = (phaseId) => {
    const t = newTask(phaseId, toISO(new Date()));
    t.title = locale === 'en' ? 'New task' : 'Neue Aufgabe';
    setTasks((arr) => [...arr, t]);
    setEditing(t.id);
  };

  const cycleStatus = (id) => {
    const t = tasks.find((x) => x.id === id);
    const cur = t?.status || 'open';
    const next = PLAN_STATUSES[(PLAN_STATUSES.indexOf(cur) + 1) % PLAN_STATUSES.length];
    updateTask(id, { status: next });
  };

  const bounds = useMemo(() => planBounds(tasks), [tasks]);
  const minISO = toISO(bounds.min);
  const totalDays = Math.max(1, dayDiff(minISO, toISO(bounds.max)));
  const totalWidth = totalDays * pxPerDay;
  const xFor = (iso) => dayDiff(minISO, iso) * pxPerDay;

  const months = useMemo(() => {
    const out = [];
    let cur = new Date(bounds.min);
    cur.setDate(1);
    while (cur <= bounds.max) {
      const next = new Date(cur.getFullYear(), cur.getMonth() + 1, 1);
      const segStart = cur < bounds.min ? bounds.min : cur;
      const segEnd = next > bounds.max ? bounds.max : addDays(next, -1);
      const days = Math.max(1, dayDiff(toISO(segStart), toISO(segEnd)) + 1);
      out.push({
        label: `${MONTHS[locale][cur.getMonth()]} ${String(cur.getFullYear()).slice(2)}`,
        width: days * pxPerDay,
      });
      cur = next;
    }
    return out;
  }, [bounds, pxPerDay, locale]);

  const weekLines = useMemo(() => {
    const lines = [];
    for (let d = 0; d <= totalDays; d += 7) lines.push(d * pxPerDay);
    return lines;
  }, [totalDays, pxPerDay]);

  const todayISO = toISO(new Date());
  const todayX = parseISO(todayISO) >= bounds.min && parseISO(todayISO) <= bounds.max ? xFor(todayISO) : null;

  const tasksByPhase = useMemo(() => {
    const map = {};
    for (const ph of IMPL_PHASES) map[ph.id] = [];
    for (const t of tasks) (map[t.phaseId] = map[t.phaseId] || []).push(t);
    return map;
  }, [tasks]);

  const progress = useMemo(() => {
    if (!tasks.length) return 0;
    return Math.round(
      tasks.reduce(
        (a, t) => a + combinedTaskProgress(t, session, trainingAggregate, locale),
        0
      ) / tasks.length
    );
  }, [tasks, session, trainingAggregate, locale]);

  const saveCloud = async () => {
    setSyncing(true);
    setSyncMsg('');
    try {
      await saveImplementationSession(
        { ...session, projectPlan: tasks },
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

  if (!perms.canView('plan')) {
    return (
      <div className="implplan" style={cssVars}>
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

  const editingTask = tasks.find((t) => t.id === editing) || null;

  return (
    <div className={`implplan ${!canEdit ? 'impl-readonly' : ''}`} style={cssVars}>
      <ImplementationHubBar
        title={locale === 'en' ? 'Project plan' : 'Projektplan'}
        locale={locale}
        session={session}
        portalMode={portalMode}
        onSave={saveCloud}
        syncing={syncing}
        syncMsg={syncMsg}
      />
      <div className="implplan-head">
        <div>
          <h1 className="implplan-title">
            {locale === 'en' ? 'Project plan' : 'Projektplan'}
            {session.customer ? ` · ${session.customer}` : ''}
          </h1>
          <p className="implplan-sub">
            {progress}% · {tasks.length} {locale === 'en' ? 'tasks' : 'Aufgaben'}
            {learningSummary.count > 0 && (
              <>
                {' · '}
                <GraduationCap className="w-3.5 h-3.5 inline -mt-0.5" aria-hidden />
                {learningSummary.averageLearningPct}% {locale === 'en' ? 'learning' : 'Lernen'}
              </>
            )}
          </p>
        </div>
        <div className="implplan-actions">
          <div className="implplan-tabs">
            <button
              className={`implplan-tab ${view === 'gantt' ? 'implplan-tab--active' : ''}`}
              onClick={() => setView('gantt')}
              type="button"
            >
              Gantt
            </button>
            <button
              className={`implplan-tab ${view === 'table' ? 'implplan-tab--active' : ''}`}
              onClick={() => setView('table')}
              type="button"
            >
              {locale === 'en' ? 'Table' : 'Tabelle'}
            </button>
            <button
              className={`implplan-tab ${view === 'learning' ? 'implplan-tab--active' : ''}`}
              onClick={() => setView('learning')}
              type="button"
            >
              <GraduationCap className="w-3.5 h-3.5" aria-hidden />
              {locale === 'en' ? 'Learning' : 'Lernen'}
            </button>
          </div>
          {view === 'gantt' && (
            <>
              <button className="impl-btn" onClick={() => setPxPerDay((p) => Math.max(6, p - 4))} type="button">
                <ZoomOut className="w-4 h-4" />
              </button>
              <button className="impl-btn" onClick={() => setPxPerDay((p) => Math.min(48, p + 4))} type="button">
                <ZoomIn className="w-4 h-4" />
              </button>
            </>
          )}
          {canEdit && (
            <button className="impl-btn impl-btn--primary" onClick={saveCloud} type="button" disabled={syncing}>
              {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Cloud className="w-4 h-4" />}
              {locale === 'en' ? 'Save' : 'Speichern'}
            </button>
          )}
          {syncMsg && <span style={{ fontSize: 13, color: 'var(--impl-accent)' }}>{syncMsg}</span>}
        </div>
      </div>

      {canEdit && (
        <div className="impl-meta impl-glass" style={{ marginBottom: 16 }}>
          <div>
            <label>{locale === 'en' ? 'Kick-off date' : 'Kick-off Datum'}</label>
            <input
              type="date"
              className="impl-input"
              value={session.kickoffDate || ''}
              onChange={(e) => setSession((s) => ({ ...s, kickoffDate: e.target.value }))}
            />
          </div>
          <div>
            <label>Go-Live</label>
            <input
              type="date"
              className="impl-input"
              value={session.goLiveDate || ''}
              onChange={(e) => setSession((s) => ({ ...s, goLiveDate: e.target.value }))}
            />
          </div>
          <div>
            <label>{locale === 'en' ? 'Training customer ID' : 'Training-Kunden-ID'}</label>
            <input
              className="impl-input"
              value={session.trainingCustomerId || ''}
              placeholder={suggestTrainingCustomerId(session)}
              onChange={(e) =>
                setSession((s) => ({ ...s, trainingCustomerId: e.target.value.trim() }))
              }
            />
            <p className="implplan-hint">
              {locale === 'en'
                ? 'Links extension tours to this project plan'
                : 'Verknüpft Extension-Touren mit diesem Projektplan'}
            </p>
          </div>
          <div>
            <label>{locale === 'en' ? 'Learning hub' : 'Learning-Hub'}</label>
            <a
              className="impl-btn impl-btn--nav"
              href={`/onboarding/tempus-trainer`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="w-4 h-4" />
              Tempus Trainer
            </a>
          </div>
        </div>
      )}

      {trainingLoadErr && view === 'learning' && (
        <p className="implplan-hint implplan-hint--warn">{trainingLoadErr}</p>
      )}

      {view === 'learning' ? (
        <PlanLearningView
          summary={learningSummary}
          locale={locale}
          session={session}
          portalMode={portalMode}
          trainingCustomerId={trainingCustomerId}
        />
      ) : view === 'gantt' ? (
        <div className="gantt">
          <div className="gantt-inner">
            {/* header */}
            <div className="gantt-row gantt-header-row">
              <div className="gantt-label gantt-phase-label">
                {locale === 'en' ? 'Phase / task' : 'Phase / Aufgabe'}
              </div>
              <div className="gantt-timeline" style={{ width: totalWidth, display: 'flex' }}>
                {months.map((m, i) => (
                  <div key={i} className="gantt-month" style={{ width: m.width }}>
                    {m.label}
                  </div>
                ))}
              </div>
            </div>

            {IMPL_PHASES.map((ph) => {
              const phaseTasks = tasksByPhase[ph.id] || [];
              return (
                <div key={ph.id}>
                  <div className="gantt-row">
                    <div className="gantt-label">
                      <div className="gantt-phase-label">{phaseTitle(ph.id, locale)}</div>
                    </div>
                    <div className="gantt-timeline gantt-phase-track" style={{ width: totalWidth }}>
                      {weekLines.map((x, i) => (
                        <div key={i} className="gantt-grid-week" style={{ left: x }} />
                      ))}
                      {todayX != null && <div className="gantt-today" style={{ left: todayX }} />}
                    </div>
                  </div>
                  {phaseTasks.map((t) => {
                    const left = xFor(t.start);
                    const w = Math.max(pxPerDay, (dayDiff(t.start, t.end) + 1) * pxPerDay);
                    const prog = combinedTaskProgress(t, session, trainingAggregate, locale);
                    const learnPct = learningModuleStatuses(t, session, trainingAggregate, locale).length
                      ? Math.round(
                          learningModuleStatuses(t, session, trainingAggregate, locale).reduce(
                            (a, m) => a + m.pct,
                            0
                          ) / learningModuleStatuses(t, session, trainingAggregate, locale).length
                        )
                      : 0;
                    const blocked = isTaskBlocked(t, tasks);
                    return (
                      <div key={t.id} className="gantt-row">
                        <div className="gantt-label">
                          <div className="gantt-task-label" onClick={() => setEditing(t.id)}>
                            {blocked && (
                              <span style={{ color: '#f87171', marginRight: 4 }} title={locale === 'en' ? 'Blocked' : 'Blockiert'}>
                                ⏸
                              </span>
                            )}
                            {t.title || (locale === 'en' ? '(untitled)' : '(ohne Titel)')}
                          </div>
                          {t.owner && <div className="gantt-task-owner">{t.owner}</div>}
                        </div>
                        <div className="gantt-timeline gantt-track" style={{ width: totalWidth }}>
                          {weekLines.map((x, i) => (
                            <div key={i} className="gantt-grid-week" style={{ left: x }} />
                          ))}
                          {todayX != null && <div className="gantt-today" style={{ left: todayX }} />}
                          {t.milestone ? (
                            <>
                              <div
                                className="gantt-milestone"
                                style={{ left }}
                                onClick={() => setEditing(t.id)}
                                title={t.title}
                              />
                              <span className="gantt-milestone-label" style={{ left }}>
                                {t.title}
                              </span>
                            </>
                          ) : (
                            <div
                              className={`gantt-bar gantt-bar--${t.status}`}
                              style={{ left, width: w }}
                              onClick={() => setEditing(t.id)}
                            >
                              <div className="gantt-bar-fill" style={{ width: `${prog}%` }} />
                              {learnPct > 0 && (
                                <div
                                  className="gantt-bar-learn"
                                  style={{ width: `${learnPct}%` }}
                                  title={
                                    locale === 'en'
                                      ? `Learning ${learnPct}%`
                                      : `Lernen ${learnPct}%`
                                  }
                                />
                              )}
                              <span className="gantt-bar-text">{t.title}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="impl-glass" style={{ padding: 8, overflowX: 'auto' }}>
          <table className="implplan-table">
            <thead>
              <tr>
                <th style={{ minWidth: 240 }}>{locale === 'en' ? 'Task' : 'Aufgabe'}</th>
                <th>{locale === 'en' ? 'Owner' : 'Verantwortlich'}</th>
                <th>Status</th>
                <th>{locale === 'en' ? 'Start' : 'Start'}</th>
                <th>{locale === 'en' ? 'Due' : 'Fällig'}</th>
                <th>%</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {IMPL_PHASES.map((ph) => {
                const phaseTasks = tasksByPhase[ph.id] || [];
                return (
                  <PhaseRows
                    key={ph.id}
                    phaseId={ph.id}
                    title={phaseTitle(ph.id, locale)}
                    tasks={phaseTasks}
                    locale={locale}
                    session={session}
                    trainingAggregate={trainingAggregate}
                    onEdit={setEditing}
                    onCycle={cycleStatus}
                    onAdd={() => addTaskToPhase(ph.id)}
                  />
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {editingTask && (
        <TaskEditor
          task={editingTask}
          locale={locale}
          allTasks={tasks}
          session={session}
          trainingAggregate={trainingAggregate}
          portalMode={portalMode}
          onChange={(patch) => updateTask(editingTask.id, patch)}
          onDelete={() => {
            removeTask(editingTask.id);
            setEditing(null);
          }}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}

function PlanLearningView({ summary, locale, session, portalMode, trainingCustomerId }) {
  const navigate = useNavigate();
  return (
    <div className="implplan-learning impl-glass">
      <div className="implplan-learning-head">
        <h2>
          {locale === 'en' ? 'Learning aligned with project plan' : 'Lernen im Projektplan'}
        </h2>
        <p>
          {locale === 'en'
            ? 'Checkpoints, tours and workshops tied to plan tasks — team progress from Tempus Trainer.'
            : 'Checkpoints, Touren und Workshops an Plan-Tasks — Team-Fortschritt aus Tempus Trainer.'}
          {trainingCustomerId && (
            <span className="implplan-hint"> · ID: {trainingCustomerId}</span>
          )}
        </p>
      </div>
      {summary.rows.length === 0 ? (
        <p className="impllog-empty">
          {locale === 'en' ? 'No learning modules on plan tasks yet.' : 'Noch keine Lernmodule auf Plan-Tasks.'}
        </p>
      ) : (
        <div className="implplan-learning-list">
          {summary.rows.map((row) => (
            <section key={row.taskId} className="implplan-learning-card">
              <header>
                <div>
                  <strong>{row.title}</strong>
                  <span className="implplan-hint">
                    {row.start} → {row.end}
                    {row.required && (
                      <span className="impl-chip impl-chip--milestone" style={{ marginLeft: 8 }}>
                        {locale === 'en' ? 'Required for done' : 'Pflicht für Abschluss'}
                      </span>
                    )}
                  </span>
                </div>
                <div className="implplan-learning-pct">
                  <span title={locale === 'en' ? 'Combined' : 'Kombiniert'}>{row.progress}%</span>
                  <span className="implplan-learning-pct-sub">
                    {locale === 'en' ? 'Learning' : 'Lernen'} {row.learning}%
                  </span>
                </div>
              </header>
              <ul>
                {row.modules.map((m, i) => (
                  <li key={i} className={m.done ? 'is-done' : ''}>
                    <span className="implplan-learning-module-pct">{m.pct}%</span>
                    <span>{m.label || m.type}</span>
                    {m.type === 'artifact' && m.artifactId && (
                      <button
                        type="button"
                        className="impl-btn impl-btn--nav"
                        style={{ marginLeft: 8, padding: '2px 8px' }}
                        onClick={() => {
                          const art = getArtifact(m.artifactId);
                          if (art) {
                            navigate(
                              resolveArtifactHref(art, session.sessionId, { portalMode })
                            );
                          }
                        }}
                      >
                        {locale === 'en' ? 'Open' : 'Öffnen'}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function PhaseRows({ phaseId, title, tasks, locale, session, trainingAggregate, onEdit, onCycle, onAdd }) {
  return (
    <>
      <tr className="implplan-phase-row">
        <td colSpan={6}>{title}</td>
        <td style={{ textAlign: 'right' }}>
          <button className="impl-btn" style={{ padding: '4px 10px' }} onClick={onAdd} type="button">
            <Plus className="w-3.5 h-3.5" />
          </button>
        </td>
      </tr>
      {tasks.map((t) => (
        <tr key={t.id}>
          <td style={{ cursor: 'pointer' }} onClick={() => onEdit(t.id)}>
            {t.milestone ? '◆ ' : ''}
            {t.title || (locale === 'en' ? '(untitled)' : '(ohne Titel)')}
          </td>
          <td>{t.owner}</td>
          <td>
            <button
              className={`implplan-status implplan-status--${t.status}`}
              onClick={() => onCycle(t.id)}
              type="button"
            >
              {PLAN_STATUS_LABEL[locale][t.status]}
            </button>
          </td>
          <td>{t.start}</td>
          <td>{t.end}</td>
          <td>{combinedTaskProgress(t, session, trainingAggregate, locale)}%</td>
          <td></td>
        </tr>
      ))}
    </>
  );
}

function TaskEditor({
  task,
  locale,
  allTasks,
  session,
  trainingAggregate,
  portalMode,
  onChange,
  onDelete,
  onClose,
}) {
  const depOptions = allStepIdsForDeps(allTasks).filter((x) => x.stepId !== task.stepId);
  const addTodo = () =>
    onChange({
      todos: [...(task.todos || []), { id: `td-${Math.random().toString(36).slice(2, 7)}`, text: '', done: false }],
    });
  const updateTodo = (id, patch) =>
    onChange({ todos: (task.todos || []).map((td) => (td.id === id ? { ...td, ...patch } : td)) });
  const removeTodo = (id) => onChange({ todos: (task.todos || []).filter((td) => td.id !== id) });

  return (
    <div className="impl-drawer-backdrop" onClick={onClose}>
      <div className="impl-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="implplan-head" style={{ marginBottom: 0 }}>
          <h2 className="implplan-title" style={{ fontSize: 19 }}>
            {locale === 'en' ? 'Edit task' : 'Aufgabe bearbeiten'}
          </h2>
          <button className="impl-btn" onClick={onClose} type="button">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="impl-field">
          <span>{locale === 'en' ? 'Title' : 'Titel'}</span>
          <input className="impl-input" value={task.title} onChange={(e) => onChange({ title: e.target.value })} />
        </div>
        <div className="impl-field">
          <span>{locale === 'en' ? 'Owner' : 'Verantwortlich'}</span>
          <input className="impl-input" value={task.owner} onChange={(e) => onChange({ owner: e.target.value })} />
        </div>
        <div className="impl-row2">
          <div className="impl-field">
            <span>{locale === 'en' ? 'Start' : 'Start'}</span>
            <input
              type="date"
              className="impl-input"
              value={task.start}
              onChange={(e) => onChange({ start: e.target.value })}
            />
          </div>
          <div className="impl-field">
            <span>{locale === 'en' ? 'Due' : 'Fällig'}</span>
            <input
              type="date"
              className="impl-input"
              value={task.end}
              onChange={(e) => onChange({ end: e.target.value })}
            />
          </div>
        </div>
        <div className="impl-row2">
          <div className="impl-field">
            <span>Status</span>
            <select className="impl-select" value={task.status} onChange={(e) => onChange({ status: e.target.value })}>
              {PLAN_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {PLAN_STATUS_LABEL[locale][s]}
                </option>
              ))}
            </select>
          </div>
          <div className="impl-field">
            <span>{locale === 'en' ? 'Milestone' : 'Meilenstein'}</span>
            <select
              className="impl-select"
              value={task.milestone ? '1' : '0'}
              onChange={(e) => onChange({ milestone: e.target.value === '1' })}
            >
              <option value="0">{locale === 'en' ? 'No' : 'Nein'}</option>
              <option value="1">{locale === 'en' ? 'Yes' : 'Ja'}</option>
            </select>
          </div>
        </div>

        {depOptions.length > 0 && (
          <div className="impl-field">
            <span>{locale === 'en' ? 'Depends on (steps)' : 'Abhängig von (Schritte)'}</span>
            <select
              className="impl-select"
              multiple
              value={task.dependsOn || []}
              onChange={(e) => {
                const selected = Array.from(e.target.selectedOptions).map((o) => o.value);
                onChange({ dependsOn: selected });
              }}
              style={{ minHeight: 72 }}
            >
              {depOptions.map((o) => (
                <option key={o.stepId} value={o.stepId}>
                  {o.title} ({o.stepId})
                </option>
              ))}
            </select>
          </div>
        )}

        {task.stepId && learningModuleStatuses(task, session, trainingAggregate, locale).length > 0 && (
          <div className="impl-field implplan-learning-inline">
            <span>{locale === 'en' ? 'Learning modules (plan)' : 'Lernmodule (Plan)'}</span>
            <ul>
              {learningModuleStatuses(task, session, trainingAggregate, locale).map((m, i) => (
                <li key={i}>
                  <span className="implplan-learning-module-pct">{m.pct}%</span>
                  {m.label || m.type}
                </li>
              ))}
            </ul>
            <p className="implplan-hint">
              {locale === 'en'
                ? 'Checkpoints sync as to-dos below. Tours sync from Tempus Trainer team progress.'
                : 'Checkpoints erscheinen als To-dos unten. Touren aus Tempus-Trainer Team-Fortschritt.'}
            </p>
          </div>
        )}

        <div className="impl-field">
          <span>To-dos</span>
          {(task.todos || []).map((td) => (
            <div className="implplan-todo" key={td.id}>
              <input
                type="checkbox"
                checked={td.done}
                onChange={(e) => updateTodo(td.id, { done: e.target.checked })}
              />
              <input
                type="text"
                className={td.done ? 'is-done' : ''}
                value={td.text}
                placeholder={locale === 'en' ? 'To-do…' : 'To-do…'}
                onChange={(e) => updateTodo(td.id, { text: e.target.value })}
              />
              <button className="impl-btn" style={{ padding: 6 }} onClick={() => removeTodo(td.id)} type="button">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          <button className="impl-btn" onClick={addTodo} type="button">
            <Plus className="w-4 h-4" />
            {locale === 'en' ? 'Add to-do' : 'To-do hinzufügen'}
          </button>
        </div>

        <div className="impl-field">
          <span>{locale === 'en' ? 'Notes' : 'Notizen'}</span>
          <textarea
            className="impl-input"
            rows={3}
            value={task.notes || ''}
            onChange={(e) => onChange({ notes: e.target.value })}
          />
        </div>

        <button className="impl-btn" onClick={onDelete} type="button" style={{ color: '#ff9b9b' }}>
          <Trash2 className="w-4 h-4" />
          {locale === 'en' ? 'Delete task' : 'Aufgabe löschen'}
        </button>
      </div>
    </div>
  );
}
