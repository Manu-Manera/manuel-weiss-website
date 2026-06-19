import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { loadProgress, saveProgress } from '../services/awsService';
import {
  emptyRampUpFeedback,
  normalizeRampUpFeedback,
  normalizeFeedbackSessions,
} from '../utils/rampUpFeedback';

/** @typedef {{ id: string, customerLabel: string, tileAnswers: Record<string, Record<string, string>>, updatedAt?: string }} KotterCustomerProfile */
/** @typedef {{ activeProfileId: string | null, profiles: Record<string, KotterCustomerProfile> }} ChangeWorkshopKotter */

const ProgressContext = createContext(null);

const DEFAULT_PROGRESS = {
  startDate: null,
  tasks: {},
  quizScores: {},
  checkpoints: {},
  notes: {},
  practiceProgress: {},
  toolConfigProgress: {},
  scenarioProgress: {},
  /** Eigener Speicherpfad: Fokus/Tagesvertrag (nicht mit Aufgaben-Tracker vermischt) */
  valkeenTagesvertrag: { days: {}, weeks: {} },
  changeWorkshopKotter: {
    activeProfileId: null,
    profiles: {},
  },
  /** Ramp-Up Review / Feedback Framework (Marc-Gespräch) - Legacy, wird migriert */
  rampUpFeedback: emptyRampUpFeedback(),
  /** Feedback Sessions - Mehrere Gespräche pro Person speichern */
  feedbackSessions: [],
  feedbackActiveSessionId: null,
  /** Produktivitäts-Tracker - Artefakte und Arbeitsergebnisse */
  productivityTracker: {
    artifacts: [],
    customers: ['Horizon', 'Cistec', 'Knauf', 'HR Campus', 'Akyurek', 'Lonza', 'Bayer', 'Intern'],
    projects: [],
  },
};

function normalizeChangeWorkshopKotter(raw) {
  if (!raw || typeof raw !== 'object') return { activeProfileId: null, profiles: {} };
  const profiles =
    typeof raw.profiles === 'object' && raw.profiles !== null ? { ...raw.profiles } : {};
  return {
    activeProfileId: raw.activeProfileId || null,
    profiles,
  };
}

function normalizeValkeenTagesvertrag(raw) {
  if (!raw || typeof raw !== 'object') return { days: {}, weeks: {} };
  const days = typeof raw.days === 'object' && raw.days !== null ? { ...raw.days } : {};
  const weeks = typeof raw.weeks === 'object' && raw.weeks !== null ? { ...raw.weeks } : {};
  return { days, weeks };
}

function mergeProgressFromStorage(cloudOrLocal) {
  const fixedScores = fixQuizScores(cloudOrLocal.quizScores || {});
  const feedbackSessions = normalizeFeedbackSessions(
    cloudOrLocal.feedbackSessions,
    cloudOrLocal.rampUpFeedback
  );
  const feedbackActiveSessionId =
    cloudOrLocal.feedbackActiveSessionId ||
    (feedbackSessions.length > 0 ? feedbackSessions[0].id : null);
  const merged = {
    ...DEFAULT_PROGRESS,
    ...cloudOrLocal,
    quizScores: fixedScores,
    practiceProgress: {
      ...DEFAULT_PROGRESS.practiceProgress,
      ...(cloudOrLocal.practiceProgress || {}),
    },
    toolConfigProgress: {
      ...DEFAULT_PROGRESS.toolConfigProgress,
      ...(cloudOrLocal.toolConfigProgress || {}),
    },
    scenarioProgress: {
      ...DEFAULT_PROGRESS.scenarioProgress,
      ...(cloudOrLocal.scenarioProgress || {}),
    },
    changeWorkshopKotter: normalizeChangeWorkshopKotter(cloudOrLocal.changeWorkshopKotter),
    valkeenTagesvertrag: normalizeValkeenTagesvertrag(cloudOrLocal.valkeenTagesvertrag),
    rampUpFeedback: normalizeRampUpFeedback(cloudOrLocal.rampUpFeedback),
    feedbackSessions,
    feedbackActiveSessionId,
    productivityTracker: normalizeProductivityTracker(cloudOrLocal.productivityTracker),
  };
  return merged;
}

function normalizeProductivityTracker(raw) {
  const defaultCustomers = ['Horizon', 'Cistec', 'Knauf', 'HR Campus', 'Akyurek', 'Lonza', 'Bayer', 'Intern'];
  if (!raw || typeof raw !== 'object') {
    return { artifacts: [], customers: defaultCustomers, projects: [] };
  }
  const artifacts = Array.isArray(raw.artifacts) ? raw.artifacts : [];
  const customers = Array.isArray(raw.customers) && raw.customers.length > 0 
    ? raw.customers 
    : defaultCustomers;
  const projects = Array.isArray(raw.projects) ? raw.projects : [];
  return { artifacts, customers, projects };
}

function fixQuizScores(quizScores) {
  if (!quizScores || typeof quizScores !== 'object') return quizScores;
  const fixed = {};
  for (const [weekId, result] of Object.entries(quizScores)) {
    if (result && typeof result.score === 'number' && typeof result.total === 'number') {
      fixed[weekId] = { ...result, score: Math.min(result.score, result.total) };
    } else {
      fixed[weekId] = result;
    }
  }
  return fixed;
}

export function ProgressProvider({ children }) {
  const [progress, setProgressState] = useState(DEFAULT_PROGRESS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncError, setLastSyncError] = useState(null);
  const saveTimeoutRef = useRef(null);
  const isInitializedRef = useRef(false);

  useEffect(() => {
    async function initProgress() {
      setIsLoading(true);
      try {
        const awsProgress = await loadProgress();
        if (awsProgress) {
          const merged = mergeProgressFromStorage(awsProgress);
          setProgressState(merged);
          localStorage.setItem('onboarding-progress', JSON.stringify(merged));
        } else {
          const localData = localStorage.getItem('onboarding-progress');
          if (localData) {
            const parsed = JSON.parse(localData);
            const merged = mergeProgressFromStorage(parsed);
            setProgressState(merged);
            localStorage.setItem('onboarding-progress', JSON.stringify(merged));
          }
        }
      } catch (err) {
        console.error('Fehler beim Laden:', err);
        const localData = localStorage.getItem('onboarding-progress');
        if (localData) {
          const merged = mergeProgressFromStorage(JSON.parse(localData));
          setProgressState(merged);
          localStorage.setItem('onboarding-progress', JSON.stringify(merged));
        }
      } finally {
        setIsLoading(false);
        isInitializedRef.current = true;
      }
    }
    initProgress();
  }, []);

  const saveToAWS = useCallback(async (newProgress) => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = window.setTimeout(async () => {
      setIsSyncing(true);
      setLastSyncError(null);
      try {
        const ok = await saveProgress(newProgress);
        if (!ok) setLastSyncError('Sync fehlgeschlagen');
      } catch (e) {
        setLastSyncError(e.message);
      } finally {
        setIsSyncing(false);
      }
    }, 2000);
  }, []);

  const setProgress = useCallback(
    (updater) => {
      setProgressState((prev) => {
        const newProgress = typeof updater === 'function' ? updater(prev) : updater;
        localStorage.setItem('onboarding-progress', JSON.stringify(newProgress));
        if (isInitializedRef.current) saveToAWS(newProgress);
        return newProgress;
      });
    },
    [saveToAWS]
  );

  const updateChangeWorkshopKotter = useCallback(
    (updater) => {
      setProgress((prev) => {
        const base = normalizeChangeWorkshopKotter(prev.changeWorkshopKotter);
        const nextCw = typeof updater === 'function' ? updater(base) : { ...base, ...updater };
        return { ...prev, changeWorkshopKotter: nextCw };
      });
    },
    [setProgress]
  );

  const setStartDate = useCallback(
    (date) => setProgress((p) => ({ ...p, startDate: date })),
    [setProgress]
  );
  const toggleTask = useCallback(
    (taskId) =>
      setProgress((p) => ({
        ...p,
        tasks: { ...p.tasks, [taskId]: !p.tasks[taskId] },
      })),
    [setProgress]
  );
  const setQuizScore = useCallback(
    (weekId, score, total) =>
      setProgress((p) => ({
        ...p,
        quizScores: {
          ...p.quizScores,
          [weekId]: { score, total, date: new Date().toISOString() },
        },
      })),
    [setProgress]
  );
  const completeCheckpoint = useCallback(
    (weekId) =>
      setProgress((p) => ({
        ...p,
        checkpoints: { ...p.checkpoints, [weekId]: new Date().toISOString() },
      })),
    [setProgress]
  );
  const addNote = useCallback(
    (weekId, note) =>
      setProgress((p) => ({
        ...p,
        notes: {
          ...p.notes,
          [weekId]: [...(p.notes[weekId] || []), { text: note, date: new Date().toISOString() }],
        },
      })),
    [setProgress]
  );
  const setPracticeProgress = useCallback(
    (exerciseId, rating) =>
      setProgress((p) => ({
        ...p,
        practiceProgress: { ...p.practiceProgress, [exerciseId]: rating },
      })),
    [setProgress]
  );
  const setToolConfigProgress = useCallback(
    (exerciseId) =>
      setProgress((p) => ({
        ...p,
        toolConfigProgress: { ...p.toolConfigProgress, [exerciseId]: true },
      })),
    [setProgress]
  );
  const setScenarioProgress = useCallback(
    (scenarioId) =>
      setProgress((p) => ({
        ...p,
        scenarioProgress: { ...p.scenarioProgress, [scenarioId]: true },
      })),
    [setProgress]
  );

  const resetProgress = useCallback(async () => {
    const emptyProgress = {
      ...DEFAULT_PROGRESS,
      startDate: null,
      tasks: {},
      quizScores: {},
      checkpoints: {},
      notes: {},
      practiceProgress: {},
      toolConfigProgress: {},
      scenarioProgress: {},
      changeWorkshopKotter: { activeProfileId: null, profiles: {} },
      valkeenTagesvertrag: { days: {}, weeks: {} },
      rampUpFeedback: emptyRampUpFeedback(),
      feedbackSessions: [],
      feedbackActiveSessionId: null,
      productivityTracker: {
        artifacts: [],
        customers: ['Horizon', 'Cistec', 'Knauf', 'HR Campus', 'Akyurek', 'Lonza', 'Bayer', 'Intern'],
        projects: [],
      },
    };
    setProgressState(emptyProgress);
    localStorage.setItem('onboarding-progress', JSON.stringify(emptyProgress));
    await saveProgress(emptyProgress);
  }, []);

  const exportProgress = useCallback(() => {
    const data = JSON.stringify(progress, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `valkeen-progress-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [progress]);

  const importProgress = useCallback(
    (file) =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const data = JSON.parse(e.target.result);
            const merged = mergeProgressFromStorage(data);
            setProgressState(merged);
            localStorage.setItem('onboarding-progress', JSON.stringify(merged));
            await saveProgress(merged);
            resolve(merged);
          } catch (error) {
            reject(error);
          }
        };
        reader.onerror = reject;
        reader.readAsText(file);
      }),
    []
  );

  const syncNow = useCallback(async () => {
    setIsSyncing(true);
    try {
      await saveProgress(progress);
      setLastSyncError(null);
    } catch (e) {
      setLastSyncError(e.message);
    } finally {
      setIsSyncing(false);
    }
  }, [progress]);

  const value = {
    progress,
    setProgress,
    isLoading,
    isSyncing,
    lastSyncError,
    setStartDate,
    toggleTask,
    setQuizScore,
    completeCheckpoint,
    addNote,
    setPracticeProgress,
    setToolConfigProgress,
    setScenarioProgress,
    updateChangeWorkshopKotter,
    resetProgress,
    exportProgress,
    importProgress,
    syncNow,
  };

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress must be used within ProgressProvider');
  return ctx;
}
