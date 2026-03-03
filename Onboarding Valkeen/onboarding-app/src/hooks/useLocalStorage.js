import { useState, useEffect } from 'react';

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

export function useProgress() {
  const [progress, setProgress] = useLocalStorage('onboarding-progress', {
    startDate: null,
    tasks: {},
    quizScores: {},
    checkpoints: {},
    notes: {}
  });

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

  const resetProgress = () => {
    setProgress({
      startDate: null,
      tasks: {},
      quizScores: {},
      checkpoints: {},
      notes: {}
    });
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
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          setProgress(data);
          resolve(data);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  return {
    progress,
    setStartDate,
    toggleTask,
    setQuizScore,
    completeCheckpoint,
    addNote,
    resetProgress,
    exportProgress,
    importProgress
  };
}
