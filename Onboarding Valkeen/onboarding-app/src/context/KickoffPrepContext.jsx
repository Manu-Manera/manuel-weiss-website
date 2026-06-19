import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import questionnaireDe from '../data/kickoff-prep-questionnaire.de.json';
import { normalizePrepRecord, emptyPrepAnswers } from '../kickoff/kickoffPrepShare';
import { fetchPrepPublic, savePrepAnswers, submitPrep } from '../kickoff/kickoffPrepService';
import { prepAuthStorageKey } from '../kickoff/kickoffPrepShare';

const KickoffPrepContext = createContext(null);

function getQuestionnaire(locale, includeIntegrations) {
  const q = questionnaireDe;
  const sections = (q.sections || []).filter((s) => {
    if (s.agendaId !== 'integrations') return true;
    return includeIntegrations;
  });
  const agendaSteps = (q.agendaSteps || []).filter((step) => {
    if (!step.optional) return true;
    return includeIntegrations;
  });
  return { ...q, sections, agendaSteps, locale };
}

export function KickoffPrepProvider({ prepId, prepPassword, children }) {
  const [prep, setPrep] = useState(null);
  const [answers, setAnswers] = useState(emptyPrepAnswers);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const saveTimer = useRef(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const raw = await fetchPrepPublic(prepId, prepPassword);
      if (!raw) {
        setLoadError('NOT_FOUND');
        setPrep(null);
        return;
      }
      const norm = normalizePrepRecord(raw);
      setPrep(norm);
      setAnswers(norm.answers || emptyPrepAnswers());
    } catch (e) {
      if (e.message === 'PREP_AUTH_REQUIRED' || e.message === 'PREP_AUTH_INVALID') {
        setLoadError(e.message);
      } else {
        setLoadError(e.message || 'LOAD_FAILED');
      }
    } finally {
      setLoading(false);
    }
  }, [prepId, prepPassword]);

  useEffect(() => {
    load();
  }, [load]);

  const questionnaire = useMemo(
    () => getQuestionnaire(prep?.locale || 'de', prep?.includeIntegrations),
    [prep?.locale, prep?.includeIntegrations]
  );

  const persistAnswers = useCallback(
    (nextAnswers) => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(async () => {
        setSyncing(true);
        try {
          await savePrepAnswers(prepId, { answers: nextAnswers }, prepPassword);
        } catch {
          /* UI keeps local state */
        } finally {
          setSyncing(false);
        }
      }, 1200);
    },
    [prepId, prepPassword]
  );

  const setAnswer = useCallback(
    (key, value) => {
      setAnswers((prev) => {
        const next = { ...prev, [key]: value };
        persistAnswers(next);
        return next;
      });
    },
    [persistAnswers]
  );

  const doSubmit = useCallback(async () => {
    setSubmitting(true);
    try {
      await savePrepAnswers(prepId, { answers }, prepPassword);
      const res = await submitPrep(prepId, prepPassword);
      setPrep((p) =>
        p
          ? {
              ...p,
              access: {
                ...p.access,
                status: 'submitted',
                submittedAt: res.submittedAt || new Date().toISOString(),
              },
            }
          : p
      );
      return res;
    } finally {
      setSubmitting(false);
    }
  }, [prepId, prepPassword, answers]);

  const value = {
    prepId,
    prep,
    answers,
    questionnaire,
    loading,
    loadError,
    syncing,
    submitting,
    setAnswer,
    reload: load,
    submit: doSubmit,
  };

  return <KickoffPrepContext.Provider value={value}>{children}</KickoffPrepContext.Provider>;
}

export function useKickoffPrep() {
  const ctx = useContext(KickoffPrepContext);
  if (!ctx) throw new Error('useKickoffPrep only inside KickoffPrepProvider');
  return ctx;
}

export function storePrepAuth(prepId, password) {
  try {
    sessionStorage.setItem(prepAuthStorageKey(prepId), password);
  } catch {
    /* ignore */
  }
}

export function readPrepAuth(prepId) {
  try {
    return sessionStorage.getItem(prepAuthStorageKey(prepId)) || '';
  } catch {
    return '';
  }
}
