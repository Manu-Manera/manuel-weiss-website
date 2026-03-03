import { useState, useEffect, useCallback, useRef } from 'react';
import { loadProgress, saveProgress } from '../services/awsService';

export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
}

const DEFAULT_PROGRESS = {
  startDate: null,
  tasks: {},
  quizScores: {},
  checkpoints: {},
  notes: {}
};

export function useProgress() {
  const [progress, setProgressState] = useState(DEFAULT_PROGRESS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncError, setLastSyncError] = useState(null);
  const saveTimeoutRef = useRef(null);
  const isInitializedRef = useRef(false);

  // Beim Start: Lade aus AWS, dann localStorage als Fallback
  useEffect(() => {
    async function initProgress() {
      setIsLoading(true);
      
      try {
        // Versuche AWS zu laden
        const awsProgress = await loadProgress();
        
        if (awsProgress) {
          console.log('📥 Fortschritt aus AWS geladen');
          setProgressState(awsProgress);
          // Auch lokal speichern als Backup
          localStorage.setItem('onboarding-progress', JSON.stringify(awsProgress));
        } else {
          // Fallback: localStorage
          const localData = localStorage.getItem('onboarding-progress');
          if (localData) {
            const parsed = JSON.parse(localData);
            console.log('📥 Fortschritt aus localStorage geladen');
            setProgressState(parsed);
          }
        }
      } catch (error) {
        console.error('Fehler beim Laden:', error);
        // Fallback: localStorage
        const localData = localStorage.getItem('onboarding-progress');
        if (localData) {
          setProgressState(JSON.parse(localData));
        }
      } finally {
        setIsLoading(false);
        isInitializedRef.current = true;
      }
    }
    
    initProgress();
  }, []);

  // Debounced save to AWS
  const saveToAWS = useCallback(async (newProgress) => {
    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    // Debounce: Warte 2 Sekunden nach letzter Änderung
    saveTimeoutRef.current = setTimeout(async () => {
      setIsSyncing(true);
      setLastSyncError(null);
      
      try {
        const success = await saveProgress(newProgress);
        if (!success) {
          setLastSyncError('Sync fehlgeschlagen');
        }
      } catch (error) {
        setLastSyncError(error.message);
      } finally {
        setIsSyncing(false);
      }
    }, 2000);
  }, []);

  // Progress updater mit AWS-Sync
  const setProgress = useCallback((updater) => {
    setProgressState(prev => {
      const newProgress = typeof updater === 'function' ? updater(prev) : updater;
      
      // Lokal speichern (sofort)
      localStorage.setItem('onboarding-progress', JSON.stringify(newProgress));
      
      // AWS speichern (debounced)
      if (isInitializedRef.current) {
        saveToAWS(newProgress);
      }
      
      return newProgress;
    });
  }, [saveToAWS]);

  const setStartDate = (date) => {
    setProgress(prev => ({ ...prev, startDate: date }));
  };

  const toggleTask = (taskId) => {
    setProgress(prev => ({
      ...prev,
      tasks: {
        ...prev.tasks,
        [taskId]: !prev.tasks[taskId]
      }
    }));
  };

  const setQuizScore = (weekId, score, total) => {
    setProgress(prev => ({
      ...prev,
      quizScores: {
        ...prev.quizScores,
        [weekId]: { score, total, date: new Date().toISOString() }
      }
    }));
  };

  const completeCheckpoint = (weekId) => {
    setProgress(prev => ({
      ...prev,
      checkpoints: {
        ...prev.checkpoints,
        [weekId]: new Date().toISOString()
      }
    }));
  };

  const addNote = (weekId, note) => {
    setProgress(prev => ({
      ...prev,
      notes: {
        ...prev.notes,
        [weekId]: [...(prev.notes[weekId] || []), { text: note, date: new Date().toISOString() }]
      }
    }));
  };

  const resetProgress = async () => {
    const emptyProgress = {
      startDate: null,
      tasks: {},
      quizScores: {},
      checkpoints: {},
      notes: {}
    };
    setProgressState(emptyProgress);
    localStorage.setItem('onboarding-progress', JSON.stringify(emptyProgress));
    await saveProgress(emptyProgress);
  };

  const exportProgress = () => {
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
  };

  const importProgress = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = JSON.parse(e.target.result);
          setProgressState(data);
          localStorage.setItem('onboarding-progress', JSON.stringify(data));
          await saveProgress(data);
          resolve(data);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  // Manueller Sync
  const syncNow = async () => {
    setIsSyncing(true);
    try {
      await saveProgress(progress);
      setLastSyncError(null);
    } catch (error) {
      setLastSyncError(error.message);
    } finally {
      setIsSyncing(false);
    }
  };

  return {
    progress,
    isLoading,
    isSyncing,
    lastSyncError,
    setStartDate,
    toggleTask,
    setQuizScore,
    completeCheckpoint,
    addNote,
    resetProgress,
    exportProgress,
    importProgress,
    syncNow
  };
}
