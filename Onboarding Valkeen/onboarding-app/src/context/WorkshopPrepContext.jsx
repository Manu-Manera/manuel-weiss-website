import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { loadProgress, saveProgress } from '../services/awsService';
import {
  buildProgressBlobWithWorkshopPrep,
  emptyWorkshopPrepData,
  normalizeWorkshopPrepData,
  workshopPrepUserId,
} from '../utils/workshopPrepShare';

const WorkshopPrepContext = createContext(null);

export function WorkshopPrepProvider({ shareId, children }) {
  const userId = useMemo(() => workshopPrepUserId(shareId), [shareId]);
  const [data, setData] = useState(() => normalizeWorkshopPrepData(emptyWorkshopPrepData()));
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    async function pull() {
      setLoading(true);
      setLoadError(null);
      try {
        const progress = await loadProgress(userId);
        if (cancelled) return;
        if (progress?.workshopPrep) {
          setData(normalizeWorkshopPrepData(progress.workshopPrep));
        } else {
          setData(normalizeWorkshopPrepData(emptyWorkshopPrepData()));
        }
      } catch (e) {
        if (!cancelled) {
          setLoadError(e?.message || 'Laden fehlgeschlagen');
          setData(normalizeWorkshopPrepData(emptyWorkshopPrepData()));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void pull();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const flushSave = useCallback(
    async (nextData) => {
      const blob = buildProgressBlobWithWorkshopPrep(nextData);
      setSyncing(true);
      try {
        await saveProgress(blob, userId);
      } finally {
        setSyncing(false);
      }
    },
    [userId]
  );

  const scheduleSave = useCallback(
    (nextData) => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => {
        void flushSave(nextData);
      }, 1400);
    },
    [flushSave]
  );

  const updateData = useCallback(
    (updater) => {
      setData((prev) => {
        const base = normalizeWorkshopPrepData(prev);
        const next = typeof updater === 'function' ? updater(base) : normalizeWorkshopPrepData(updater);
        next.updatedAt = new Date().toISOString();
        scheduleSave(next);
        return next;
      });
    },
    [scheduleSave]
  );

  const setAnswer = useCallback(
    (key, value) => {
      updateData((prev) => ({
        ...prev,
        answers: {
          ...prev.answers,
          [key]: value,
        },
      }));
    },
    [updateData]
  );

  const setCustomerLabel = useCallback(
    (label) => {
      updateData((prev) => ({
        ...prev,
        customerLabel: label,
      }));
    },
    [updateData]
  );

  const value = useMemo(
    () => ({
      shareId,
      userId,
      data,
      loading,
      syncing,
      loadError,
      setAnswer,
      setCustomerLabel,
      updateData,
      flushSave,
    }),
    [shareId, userId, data, loading, syncing, loadError, setAnswer, setCustomerLabel, updateData, flushSave]
  );

  return <WorkshopPrepContext.Provider value={value}>{children}</WorkshopPrepContext.Provider>;
}

export function useWorkshopPrep() {
  const ctx = useContext(WorkshopPrepContext);
  if (!ctx) throw new Error('useWorkshopPrep only inside WorkshopPrepProvider');
  return ctx;
}
