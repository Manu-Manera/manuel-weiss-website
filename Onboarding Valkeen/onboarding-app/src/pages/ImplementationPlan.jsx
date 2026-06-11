import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Cloud,
  Diamond,
  GitBranch,
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
  newMilestone,
  parseISO,
  phaseTitle,
  dependencyOptions,
  depMatches,
  resolveDependency,
  dependentsOf,
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
  const [showDeps, setShowDeps] = useState(true);
  const [hoverTaskId, setHoverTaskId] = useState(null);
  const [depPaths, setDepPaths] = useState([]);
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

  /** Startdatum für neue Items: nach dem letzten Item der Phase, sonst heute. */
  const phaseDefaultStart = (phaseId) => {
    const inPhase = tasks.filter((t) => t.phaseId === phaseId);
    if (!inPhase.length) return toISO(new Date());
    const lastEnd = inPhase
      .map((t) => t.end || t.start)
      .filter(Boolean)
      .sort()
      .pop();
    return lastEnd ? toISO(addDays(parseISO(lastEnd), 1)) : toISO(new Date());
  };

  const addTaskToPhase = (phaseId) => {
    const t = newTask(phaseId, phaseDefaultStart(phaseId));
    t.title = locale === 'en' ? 'New task' : 'Neue Aufgabe';
    setTasks((arr) => [...arr, t]);
    setEditing(t.id);
  };
  const addMilestoneToPhase = (phaseId) => {
    const t = newMilestone(phaseId, phaseDefaultStart(phaseId));
    t.title = locale === 'en' ? 'New milestone' : 'Neuer Meilenstein';
    setTasks((arr) => [...arr, t]);
    setEditing(t.id);
  };

  const customPhases = session.customPhases || [];
  const allPhases = useMemo(
    () => [
      ...IMPL_PHASES.map((p) => ({ id: p.id, title: p.title, custom: false })),
      ...customPhases.map((p) => ({
        id: p.id,
        title: typeof p.title === 'string' ? { de: p.title, en: p.title } : p.title,
        custom: true,
      })),
    ],
    [customPhases]
  );
  const phaseLabelFor = useCallback(
    (phaseId) => {
      const custom = customPhases.find((p) => p.id === phaseId);
      if (custom) return typeof custom.title === 'string' ? custom.title : custom.title?.[locale] || custom.title?.de || phaseId;
      return phaseTitle(phaseId, locale);
    },
    [customPhases, locale]
  );

  const addPhase = () => {
    const name = typeof window !== 'undefined'
      ? window.prompt(locale === 'en' ? 'New phase name' : 'Name der neuen Phase', locale === 'en' ? 'New phase' : 'Neue Phase')
      : null;
    if (!name) return;
    const id = `cph-${Math.random().toString(36).slice(2, 8)}`;
    setSession((s) => ({
      ...s,
      customPhases: [...(s.customPhases || []), { id, title: { de: name, en: name } }],
    }));
  };
  const renamePhase = (phaseId, name) => {
    setSession((s) => ({
      ...s,
      customPhases: (s.customPhases || []).map((p) =>
        p.id === phaseId ? { ...p, title: { de: name, en: name } } : p
      ),
    }));
  };
  const removePhase = (phaseId) => {
    const hasTasks = tasks.some((t) => t.phaseId === phaseId);
    if (hasTasks && typeof window !== 'undefined') {
      const ok = window.confirm(
        locale === 'en'
          ? 'This phase still has tasks. Delete phase and its tasks?'
          : 'Diese Phase enthält noch Aufgaben. Phase samt Aufgaben löschen?'
      );
      if (!ok) return;
    }
    setTasks((arr) => arr.filter((t) => t.phaseId !== phaseId));
    setSession((s) => ({
      ...s,
      customPhases: (s.customPhases || []).filter((p) => p.id !== phaseId),
    }));
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
    for (const ph of allPhases) map[ph.id] = [];
    for (const t of tasks) (map[t.phaseId] = map[t.phaseId] || []).push(t);
    return map;
  }, [tasks, allPhases]);

  const progress = useMemo(() => {
    if (!tasks.length) return 0;
    return Math.round(
      tasks.reduce(
        (a, t) => a + combinedTaskProgress(t, session, trainingAggregate, locale),
        0
      ) / tasks.length
    );
  }, [tasks, session, trainingAggregate, locale]);

  const ganttInnerRef = useRef(null);
  const barRefs = useRef({});
  const setBarRef = useCallback((id, el) => {
    if (el) barRefs.current[id] = el;
    else delete barRefs.current[id];
  }, []);

  /** Verwandte Tasks (Vorgänger + Nachfolger) für Hover-Hervorhebung. */
  const relatedIds = useMemo(() => {
    if (!hoverTaskId) return null;
    const t = tasks.find((x) => x.id === hoverTaskId);
    if (!t) return null;
    const set = new Set([hoverTaskId]);
    for (const dep of t.dependsOn || []) {
      const pred = resolveDependency(tasks, dep);
      if (pred) set.add(pred.id);
    }
    for (const succ of dependentsOf(t, tasks)) set.add(succ.id);
    return set;
  }, [hoverTaskId, tasks]);

  /** Pfeile zwischen Vorgänger und Nachfolger aus gemessenen Balkenpositionen. */
  useLayoutEffect(() => {
    if (view !== 'gantt' || !showDeps) {
      setDepPaths([]);
      return;
    }
    const inner = ganttInnerRef.current;
    if (!inner) return;
    const base = inner.getBoundingClientRect();
    const paths = [];
    for (const t of tasks) {
      for (const dep of t.dependsOn || []) {
        const pred = resolveDependency(tasks, dep);
        if (!pred) continue;
        const fromEl = barRefs.current[pred.id];
        const toEl = barRefs.current[t.id];
        if (!fromEl || !toEl) continue;
        const f = fromEl.getBoundingClientRect();
        const to = toEl.getBoundingClientRect();
        const x1 = f.right - base.left + inner.scrollLeft;
        const y1 = f.top + f.height / 2 - base.top + inner.scrollTop;
        const x2 = to.left - base.left + inner.scrollLeft;
        const y2 = to.top + to.height / 2 - base.top + inner.scrollTop;
        paths.push({
          id: `${pred.id}->${t.id}`,
          x1,
          y1,
          x2,
          y2,
          active: relatedIds ? relatedIds.has(pred.id) && relatedIds.has(t.id) : false,
        });
      }
    }
    setDepPaths(paths);
  }, [view, showDeps, tasks, pxPerDay, relatedIds, trainingAggregate, session, locale]);

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
              <button
                className={`impl-btn ${showDeps ? 'impl-btn--nav' : ''}`}
                onClick={() => setShowDeps((v) => !v)}
                type="button"
                title={locale === 'en' ? 'Toggle dependency arrows' : 'Abhängigkeitspfeile ein/aus'}
              >
                <GitBranch className="w-4 h-4" />
                {locale === 'en' ? 'Dependencies' : 'Abhängigkeiten'}
              </button>
              <button className="impl-btn" onClick={() => setPxPerDay((p) => Math.max(6, p - 4))} type="button">
                <ZoomOut className="w-4 h-4" />
              </button>
              <button className="impl-btn" onClick={() => setPxPerDay((p) => Math.min(48, p + 4))} type="button">
                <ZoomIn className="w-4 h-4" />
              </button>
            </>
          )}
          {canEdit && view !== 'learning' && (
            <button className="impl-btn" onClick={addPhase} type="button">
              <Plus className="w-4 h-4" />
              {locale === 'en' ? 'Phase' : 'Phase'}
            </button>
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
          <div className="gantt-inner" ref={ganttInnerRef}>
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

            {allPhases.map((ph) => {
              const phaseTasks = tasksByPhase[ph.id] || [];
              return (
                <div key={ph.id}>
                  <div className="gantt-row">
                    <div className="gantt-label gantt-phase-row-label">
                      <div className="gantt-phase-label">{phaseLabelFor(ph.id)}</div>
                      {canEdit && (
                        <div className="gantt-phase-add">
                          <button
                            className="gantt-add-btn"
                            onClick={() => addTaskToPhase(ph.id)}
                            type="button"
                            title={locale === 'en' ? 'Add task' : 'Aufgabe hinzufügen'}
                          >
                            <Plus className="w-3 h-3" />
                            {locale === 'en' ? 'Task' : 'Aufgabe'}
                          </button>
                          <button
                            className="gantt-add-btn"
                            onClick={() => addMilestoneToPhase(ph.id)}
                            type="button"
                            title={locale === 'en' ? 'Add milestone' : 'Meilenstein hinzufügen'}
                          >
                            <Diamond className="w-3 h-3" />
                          </button>
                          {ph.custom && (
                            <button
                              className="gantt-add-btn gantt-add-btn--danger"
                              onClick={() => removePhase(ph.id)}
                              type="button"
                              title={locale === 'en' ? 'Delete phase' : 'Phase löschen'}
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="gantt-timeline gantt-phase-track" style={{ width: totalWidth }}>
                      {weekLines.map((x, i) => (
                        <div key={i} className="gantt-grid-week" style={{ left: x }} />
                      ))}
                      {todayX != null && <div className="gantt-today" style={{ left: todayX }} />}
                    </div>
                  </div>
                  {phaseTasks.length === 0 && canEdit && (
                    <div className="gantt-row gantt-row--empty">
                      <div className="gantt-label">
                        <button className="gantt-add-btn" onClick={() => addTaskToPhase(ph.id)} type="button">
                          <Plus className="w-3 h-3" />
                          {locale === 'en' ? 'Add first task' : 'Erste Aufgabe'}
                        </button>
                      </div>
                      <div className="gantt-timeline" style={{ width: totalWidth }} />
                    </div>
                  )}
                  {phaseTasks.map((t) => {
                    const left = xFor(t.start);
                    const w = Math.max(pxPerDay, (dayDiff(t.start, t.end) + 1) * pxPerDay);
                    const prog = combinedTaskProgress(t, session, trainingAggregate, locale);
                    const lm = learningModuleStatuses(t, session, trainingAggregate, locale);
                    const learnPct = lm.length
                      ? Math.round(lm.reduce((a, m) => a + m.pct, 0) / lm.length)
                      : 0;
                    const blocked = isTaskBlocked(t, tasks);
                    const deps = (t.dependsOn || [])
                      .map((d) => resolveDependency(tasks, d))
                      .filter(Boolean);
                    const dimmed = relatedIds && !relatedIds.has(t.id);
                    return (
                      <div
                        key={t.id}
                        className={`gantt-row ${dimmed ? 'gantt-row--dim' : ''}`}
                        onMouseEnter={() => setHoverTaskId(t.id)}
                        onMouseLeave={() => setHoverTaskId((cur) => (cur === t.id ? null : cur))}
                      >
                        <div className="gantt-label">
                          <div className="gantt-task-label" onClick={() => setEditing(t.id)}>
                            {blocked && (
                              <span style={{ color: '#f87171', marginRight: 4 }} title={locale === 'en' ? 'Blocked by dependency' : 'Durch Abhängigkeit blockiert'}>
                                ⏸
                              </span>
                            )}
                            {t.title || (locale === 'en' ? '(untitled)' : '(ohne Titel)')}
                          </div>
                          {deps.length > 0 && (
                            <div className="gantt-dep-chip" title={deps.map((d) => d.title).join(', ')}>
                              <GitBranch className="w-3 h-3" />
                              {locale === 'en' ? 'after' : 'nach'} {deps.map((d) => d.title || '—').join(', ')}
                            </div>
                          )}
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
                                ref={(el) => setBarRef(t.id, el)}
                                onClick={() => setEditing(t.id)}
                                title={t.title}
                              />
                              <span className="gantt-milestone-label" style={{ left }}>
                                {t.title}
                              </span>
                            </>
                          ) : (
                            <div
                              className={`gantt-bar gantt-bar--${t.status} ${blocked ? 'gantt-bar--blocked' : ''}`}
                              style={{ left, width: w }}
                              ref={(el) => setBarRef(t.id, el)}
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

            {showDeps && depPaths.length > 0 && (
              <svg className="gantt-dep-svg" width="100%" height="100%">
                <defs>
                  <marker
                    id="gantt-arrow"
                    viewBox="0 0 10 10"
                    refX="8"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--impl-accent)" />
                  </marker>
                </defs>
                {depPaths.map((p) => {
                  const midX = Math.max(p.x1 + 14, (p.x1 + p.x2) / 2);
                  return (
                    <path
                      key={p.id}
                      className={`gantt-dep-path ${p.active ? 'gantt-dep-path--active' : ''}`}
                      d={`M ${p.x1} ${p.y1} C ${midX} ${p.y1}, ${midX} ${p.y2}, ${p.x2} ${p.y2}`}
                      markerEnd="url(#gantt-arrow)"
                      fill="none"
                    />
                  );
                })}
              </svg>
            )}
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
                <th>{locale === 'en' ? 'Depends on' : 'Abhängig von'}</th>
                <th>{locale === 'en' ? 'Start' : 'Start'}</th>
                <th>{locale === 'en' ? 'Due' : 'Fällig'}</th>
                <th>%</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {allPhases.map((ph) => {
                const phaseTasks = tasksByPhase[ph.id] || [];
                return (
                  <PhaseRows
                    key={ph.id}
                    phaseId={ph.id}
                    title={phaseLabelFor(ph.id)}
                    custom={ph.custom}
                    tasks={phaseTasks}
                    allTasks={tasks}
                    locale={locale}
                    session={session}
                    trainingAggregate={trainingAggregate}
                    onEdit={setEditing}
                    onCycle={cycleStatus}
                    onAddTask={() => addTaskToPhase(ph.id)}
                    onAddMilestone={() => addMilestoneToPhase(ph.id)}
                    onRemovePhase={ph.custom ? () => removePhase(ph.id) : null}
                  />
                );
              })}
              {canEdit && (
                <tr className="implplan-addphase-row">
                  <td colSpan={8}>
                    <button className="impl-btn" onClick={addPhase} type="button">
                      <Plus className="w-4 h-4" />
                      {locale === 'en' ? 'Add phase' : 'Phase hinzufügen'}
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {editingTask && (
        <TaskEditor
          task={editingTask}
          locale={locale}
          allTasks={tasks}
          phases={allPhases}
          phaseLabelFor={phaseLabelFor}
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

function PhaseRows({
  phaseId,
  title,
  custom,
  tasks,
  allTasks,
  locale,
  session,
  trainingAggregate,
  onEdit,
  onCycle,
  onAddTask,
  onAddMilestone,
  onRemovePhase,
}) {
  return (
    <>
      <tr className="implplan-phase-row">
        <td colSpan={7}>{title}</td>
        <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
          <button
            className="impl-btn"
            style={{ padding: '4px 8px' }}
            onClick={onAddTask}
            type="button"
            title={locale === 'en' ? 'Add task' : 'Aufgabe hinzufügen'}
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            className="impl-btn"
            style={{ padding: '4px 8px', marginLeft: 4 }}
            onClick={onAddMilestone}
            type="button"
            title={locale === 'en' ? 'Add milestone' : 'Meilenstein hinzufügen'}
          >
            <Diamond className="w-3.5 h-3.5" />
          </button>
          {custom && onRemovePhase && (
            <button
              className="impl-btn"
              style={{ padding: '4px 8px', marginLeft: 4, color: '#ff9b9b' }}
              onClick={onRemovePhase}
              type="button"
              title={locale === 'en' ? 'Delete phase' : 'Phase löschen'}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </td>
      </tr>
      {tasks.length === 0 && (
        <tr>
          <td colSpan={8} className="implplan-empty-cell">
            {locale === 'en' ? 'No items — add a task or milestone.' : 'Keine Einträge — Aufgabe oder Meilenstein hinzufügen.'}
          </td>
        </tr>
      )}
      {tasks.map((t) => {
        const deps = (t.dependsOn || [])
          .map((d) => resolveDependency(allTasks, d))
          .filter(Boolean);
        const blocked = isTaskBlocked(t, allTasks);
        return (
          <tr key={t.id} className={blocked ? 'implplan-row--blocked' : ''}>
            <td style={{ cursor: 'pointer' }} onClick={() => onEdit(t.id)}>
              {t.milestone ? <Diamond className="w-3.5 h-3.5 inline -mt-0.5" style={{ color: 'var(--impl-accent)' }} /> : null}{' '}
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
            <td className="implplan-dep-cell">
              {blocked && <span style={{ color: '#f87171', marginRight: 4 }} title={locale === 'en' ? 'Blocked' : 'Blockiert'}>⏸</span>}
              {deps.length ? deps.map((d) => d.title || '—').join(', ') : <span style={{ opacity: 0.4 }}>—</span>}
            </td>
            <td>{t.start}</td>
            <td>{t.end}</td>
            <td>{combinedTaskProgress(t, session, trainingAggregate, locale)}%</td>
            <td></td>
          </tr>
        );
      })}
    </>
  );
}

function TaskEditor({
  task,
  locale,
  allTasks,
  phases,
  phaseLabelFor,
  session,
  trainingAggregate,
  portalMode,
  onChange,
  onDelete,
  onClose,
}) {
  const [depFilter, setDepFilter] = useState('');
  const depOpts = dependencyOptions(allTasks, task);
  const filteredDepOpts = depFilter
    ? depOpts.filter((o) => (o.title || '').toLowerCase().includes(depFilter.toLowerCase()))
    : depOpts;
  const depByPhase = (phases || []).map((ph) => ({
    phase: ph,
    items: filteredDepOpts.filter((o) => o.phaseId === ph.id),
  })).filter((g) => g.items.length > 0);

  const toggleDep = (opt) => {
    const cur = task.dependsOn || [];
    const isOn = depMatches(cur, opt);
    if (isOn) {
      onChange({ dependsOn: cur.filter((d) => d !== opt.value && d !== opt.legacyStep) });
    } else {
      onChange({ dependsOn: [...cur, opt.value] });
    }
  };

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

        <div className="impl-row2">
          <div className="impl-field">
            <span>{locale === 'en' ? 'Phase' : 'Phase'}</span>
            <select
              className="impl-select"
              value={task.phaseId}
              onChange={(e) => onChange({ phaseId: e.target.value })}
            >
              {(phases || []).map((ph) => (
                <option key={ph.id} value={ph.id}>
                  {phaseLabelFor ? phaseLabelFor(ph.id) : ph.id}
                </option>
              ))}
            </select>
          </div>
          <div className="impl-field">
            <span>{locale === 'en' ? 'Type' : 'Typ'}</span>
            <select
              className="impl-select"
              value={task.milestone ? '1' : '0'}
              onChange={(e) => onChange({ milestone: e.target.value === '1' })}
            >
              <option value="0">{locale === 'en' ? 'Task' : 'Aufgabe'}</option>
              <option value="1">{locale === 'en' ? 'Milestone' : 'Meilenstein'}</option>
            </select>
          </div>
        </div>

        {depOpts.length > 0 && (
          <div className="impl-field">
            <span>{locale === 'en' ? 'Depends on (predecessors)' : 'Abhängig von (Vorgänger)'}</span>
            {depOpts.length > 6 && (
              <input
                className="impl-input"
                placeholder={locale === 'en' ? 'Filter…' : 'Filtern…'}
                value={depFilter}
                onChange={(e) => setDepFilter(e.target.value)}
                style={{ marginBottom: 6 }}
              />
            )}
            <div className="implplan-deplist">
              {depByPhase.length === 0 && (
                <p className="implplan-hint" style={{ padding: '4px 2px' }}>
                  {locale === 'en' ? 'No matches.' : 'Keine Treffer.'}
                </p>
              )}
              {depByPhase.map((g) => (
                <div key={g.phase.id} className="implplan-depgroup">
                  <div className="implplan-depgroup-title">
                    {phaseLabelFor ? phaseLabelFor(g.phase.id) : g.phase.id}
                  </div>
                  {g.items.map((o) => {
                    const checked = depMatches(task.dependsOn, o);
                    return (
                      <label key={o.value} className={`implplan-depitem ${checked ? 'is-checked' : ''}`}>
                        <input type="checkbox" checked={checked} onChange={() => toggleDep(o)} />
                        <span className="implplan-depitem-title">
                          {o.milestone && <Diamond className="w-3 h-3 inline -mt-0.5" />}{' '}
                          {o.title || (locale === 'en' ? '(untitled)' : '(ohne Titel)')}
                        </span>
                        <span className="implplan-depitem-date">{o.end || o.start || ''}</span>
                      </label>
                    );
                  })}
                </div>
              ))}
            </div>
            <p className="implplan-hint">
              {locale === 'en'
                ? 'Task is blocked until all predecessors are done.'
                : 'Aufgabe ist blockiert, bis alle Vorgänger erledigt sind.'}
            </p>
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
