import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { loadProgress, saveProgress } from '../services/awsService';
import {
  buildProgressBlobWithKotter,
  emptyGuestChangeWorkshopKotter,
  kotterShareUserId,
  normalizeKotterSlice,
  upsertTileAnswersInKotterSlice,
} from '../utils/kotterShare';

const KotterShareContext = createContext(null);

export function KotterShareProvider({ shareId, children }) {
  const userId = useMemo(() => kotterShareUserId(shareId), [shareId]);
  const [cw, setCw] = useState(() => normalizeKotterSlice(emptyGuestChangeWorkshopKotter()));
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
        if (progress?.changeWorkshopKotter) {
          setCw(normalizeKotterSlice(progress.changeWorkshopKotter));
        } else {
          setCw(normalizeKotterSlice(emptyGuestChangeWorkshopKotter()));
        }
      } catch (e) {
        if (!cancelled) {
          setLoadError(e?.message || 'Laden fehlgeschlagen');
          setCw(normalizeKotterSlice(emptyGuestChangeWorkshopKotter()));
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
    async (nextCw) => {
      const blob = buildProgressBlobWithKotter(nextCw);
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
    (nextCw) => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => {
        void flushSave(nextCw);
      }, 1400);
    },
    [flushSave]
  );

  const updateKotter = useCallback(
    (updater) => {
      setCw((prev) => {
        const base = normalizeKotterSlice(prev);
        const next = typeof updater === 'function' ? updater(base) : normalizeKotterSlice(updater);
        scheduleSave(next);
        return next;
      });
    },
    [scheduleSave]
  );

  const saveTileAnswers = useCallback(
    (tileSlug, answers) => {
      updateKotter((base) => upsertTileAnswersInKotterSlice(base, tileSlug, answers));
    },
    [updateKotter]
  );

  const setCustomerLabel = useCallback((label) => {
    updateKotter((base) => {
      const id = base.activeProfileId;
      const p = id ? base.profiles[id] : null;
      if (!id || !p) return base;
      return {
        ...base,
        profiles: {
          ...base.profiles,
          [id]: {
            ...p,
            customerLabel: label,
            updatedAt: new Date().toISOString(),
          },
        },
      };
    });
  }, [updateKotter]);

  const value = useMemo(
    () => ({
      shareId,
      userId,
      cw,
      loading,
      syncing,
      loadError,
      saveTileAnswers,
      setCustomerLabel,
      updateKotter,
      flushSave,
    }),
    [shareId, userId, cw, loading, syncing, loadError, saveTileAnswers, setCustomerLabel, updateKotter, flushSave]
  );

  return <KotterShareContext.Provider value={value}>{children}</KotterShareContext.Provider>;
}

export function useKotterShare() {
  const ctx = useContext(KotterShareContext);
  if (!ctx) throw new Error('useKotterShare only inside KotterShareProvider');
  return ctx;
}
