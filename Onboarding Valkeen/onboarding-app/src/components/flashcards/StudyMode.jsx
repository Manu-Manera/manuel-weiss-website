import { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Check, 
  X, 
  RotateCcw, 
  Trophy, 
  Sparkles,
  ChevronRight,
  Box,
  Zap,
  Target,
  Undo2,
  Lock,
  Unlock,
  AlertCircle,
  Play,
  Settings
} from 'lucide-react';
import { getStudyCards, reviewCard } from '../../services/awsService';

const LEITNER_INFO = {
  1: { label: 'Neu', color: 'rgb(239, 68, 68)', interval: 'Sofort' },
  2: { label: 'Lernen', color: 'rgb(249, 115, 22)', interval: '1 Tag' },
  3: { label: 'Wiederholen', color: 'rgb(234, 179, 8)', interval: '3 Tage' },
  4: { label: 'Gefestigt', color: 'rgb(34, 197, 94)', interval: '7 Tage' },
  5: { label: 'Gemeistert', color: 'rgb(16, 185, 129)', interval: '14 Tage' }
};

const LEARNED_BOX_THRESHOLD = 3;

// Progressive Learning Algorithm State
// Phase-System für 10er-Päckchen mit Konsolidierung:
// - Innerhalb eines 10er-Päckchens: 2 neue → 2 davor → alle bisherigen → 2 neue → ...
// - Nach jedem 10er: Konsolidierung aller bisherigen 10er-Päckchen
const BATCH_SIZE = 10; // Größe eines Päckchens
const NEW_CARDS_PER_STEP = 2; // Wie viele neue Karten pro Schritt

// Berechnet welche Karten in der aktuellen Phase aktiv sein sollen
function getProgressivePhaseCards(allCards, progressState, cardStates) {
  const { 
    currentBatchIndex,    // Welches 10er-Päckchen (0, 1, 2, ...)
    withinBatchStep,      // Schritt innerhalb des Päckchens
    phase,                // 'new' | 'review_previous' | 'review_all' | 'consolidate_batches'
    completedBatches      // Array von abgeschlossenen Batch-Indizes
  } = progressState;
  
  const batchStart = currentBatchIndex * BATCH_SIZE;
  const batchEnd = Math.min(batchStart + BATCH_SIZE, allCards.length);
  const currentBatchCards = allCards.slice(batchStart, batchEnd);
  
  // Wie viele Karten im aktuellen Päckchen bereits freigeschaltet sind
  const unlockedInBatch = Math.min(withinBatchStep * NEW_CARDS_PER_STEP, currentBatchCards.length);
  
  if (phase === 'consolidate_batches') {
    // Alle Karten aus allen abgeschlossenen Päckchen + aktuelles
    const allBatchIndices = [...completedBatches, currentBatchIndex];
    let consolidationCards = [];
    allBatchIndices.forEach(batchIdx => {
      const start = batchIdx * BATCH_SIZE;
      const end = Math.min(start + BATCH_SIZE, allCards.length);
      consolidationCards = consolidationCards.concat(allCards.slice(start, end));
    });
    return consolidationCards.filter(c => !cardStates[c.cardId]?.learned);
  }
  
  if (phase === 'new') {
    // Nur die neuesten 2 Karten
    const startIdx = (withinBatchStep - 1) * NEW_CARDS_PER_STEP;
    const endIdx = Math.min(startIdx + NEW_CARDS_PER_STEP, currentBatchCards.length);
    return currentBatchCards.slice(startIdx, endIdx).filter(c => !cardStates[c.cardId]?.learned);
  }
  
  if (phase === 'review_previous') {
    // Die 2 Karten von davor (vor den aktuellen neuen)
    const startIdx = Math.max(0, (withinBatchStep - 2) * NEW_CARDS_PER_STEP);
    const endIdx = startIdx + NEW_CARDS_PER_STEP;
    return currentBatchCards.slice(startIdx, endIdx).filter(c => !cardStates[c.cardId]?.learned);
  }
  
  if (phase === 'review_all') {
    // Alle bisherigen Karten im aktuellen Päckchen
    return currentBatchCards.slice(0, unlockedInBatch).filter(c => !cardStates[c.cardId]?.learned);
  }
  
  return [];
}

// Berechnet den nächsten Zustand basierend auf dem aktuellen Fortschritt
function getNextProgressState(currentState, allCards, cardStates) {
  const { currentBatchIndex, withinBatchStep, phase, completedBatches } = currentState;
  
  const batchStart = currentBatchIndex * BATCH_SIZE;
  const batchEnd = Math.min(batchStart + BATCH_SIZE, allCards.length);
  const currentBatchCards = allCards.slice(batchStart, batchEnd);
  const maxStepsInBatch = Math.ceil(currentBatchCards.length / NEW_CARDS_PER_STEP);
  
  // Prüfen ob alle Karten im aktuellen Kontext gelernt sind
  const activeCards = getProgressivePhaseCards(allCards, currentState, cardStates);
  const allLearned = activeCards.length === 0 || activeCards.every(c => cardStates[c.cardId]?.learned);
  
  if (!allLearned) {
    return currentState; // Noch nicht fertig mit aktueller Phase
  }
  
  // Phase-Übergänge
  if (phase === 'new') {
    if (withinBatchStep >= 2) {
      // Nach den ersten 2 neuen Karten: Review der vorherigen
      return { ...currentState, phase: 'review_previous' };
    } else {
      // Erste 2 Karten: direkt zu review_all
      return { ...currentState, phase: 'review_all' };
    }
  }
  
  if (phase === 'review_previous') {
    // Nach Review der vorherigen: Alle bisherigen reviewen
    return { ...currentState, phase: 'review_all' };
  }
  
  if (phase === 'review_all') {
    if (withinBatchStep < maxStepsInBatch) {
      // Noch mehr Karten im Päckchen: nächste 2 neue
      return { 
        ...currentState, 
        withinBatchStep: withinBatchStep + 1, 
        phase: 'new' 
      };
    } else {
      // Päckchen fertig!
      const newCompletedBatches = [...completedBatches, currentBatchIndex];
      const nextBatchStart = (currentBatchIndex + 1) * BATCH_SIZE;
      
      if (nextBatchStart >= allCards.length) {
        // Alle Karten durch!
        return { ...currentState, phase: 'completed', completedBatches: newCompletedBatches };
      }
      
      // Prüfen ob Konsolidierung nötig (nach jedem 10er-Päckchen)
      if (newCompletedBatches.length > 0 && newCompletedBatches.length % 1 === 0) {
        return {
          currentBatchIndex: currentBatchIndex + 1,
          withinBatchStep: 0,
          phase: 'consolidate_batches',
          completedBatches: newCompletedBatches
        };
      }
      
      // Nächstes Päckchen starten
      return {
        currentBatchIndex: currentBatchIndex + 1,
        withinBatchStep: 1,
        phase: 'new',
        completedBatches: newCompletedBatches
      };
    }
  }
  
  if (phase === 'consolidate_batches') {
    // Nach Konsolidierung: Nächstes Päckchen starten
    return {
      ...currentState,
      withinBatchStep: 1,
      phase: 'new'
    };
  }
  
  return currentState;
}

// Beschreibung der aktuellen Phase für UI
function getPhaseDescription(progressState, allCards) {
  const { currentBatchIndex, withinBatchStep, phase, completedBatches } = progressState;
  const batchStart = currentBatchIndex * BATCH_SIZE;
  const batchEnd = Math.min(batchStart + BATCH_SIZE, allCards.length);
  const batchNumber = currentBatchIndex + 1;
  const totalBatches = Math.ceil(allCards.length / BATCH_SIZE);
  
  const cardRangeStart = (withinBatchStep - 1) * NEW_CARDS_PER_STEP + 1 + batchStart;
  const cardRangeEnd = Math.min(withinBatchStep * NEW_CARDS_PER_STEP + batchStart, allCards.length);
  
  if (phase === 'new') {
    return `Neue Karten ${cardRangeStart}-${cardRangeEnd} lernen`;
  }
  if (phase === 'review_previous') {
    const prevStart = cardRangeStart - NEW_CARDS_PER_STEP;
    const prevEnd = cardRangeStart - 1;
    return `Wiederholung: Karten ${prevStart}-${prevEnd}`;
  }
  if (phase === 'review_all') {
    const totalUnlocked = withinBatchStep * NEW_CARDS_PER_STEP;
    return `Alle ${Math.min(totalUnlocked, batchEnd - batchStart)} Karten zusammen`;
  }
  if (phase === 'consolidate_batches') {
    const totalCards = (completedBatches.length + 1) * BATCH_SIZE;
    return `Konsolidierung: Alle ${Math.min(totalCards, allCards.length)} Karten`;
  }
  return '';
}

// Modus-Auswahl Komponente
function ModeSelection({ allCards, cardStates, onStartProgressive, onStartManual, onBack }) {
  const [selectedCards, setSelectedCards] = useState(new Set());

  const toggleCard = (cardId) => {
    const newSelected = new Set(selectedCards);
    if (newSelected.has(cardId)) {
      newSelected.delete(cardId);
    } else {
      newSelected.add(cardId);
    }
    setSelectedCards(newSelected);
  };

  const selectAll = () => {
    setSelectedCards(new Set(allCards.map(c => c.cardId)));
  };

  const selectNone = () => {
    setSelectedCards(new Set());
  };

  const selectNew = () => {
    setSelectedCards(new Set(
      allCards.filter(c => (cardStates[c.cardId]?.box || 1) < LEARNED_BOX_THRESHOLD).map(c => c.cardId)
    ));
  };

  return (
    <div className="max-w-2xl mx-auto px-4">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack} className="p-2 rounded-xl glass hover:bg-white/10 transition-all">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-bold">Lernmodus wählen</h2>
      </div>

      {/* Modus-Buttons */}
      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        <button
          onClick={onStartProgressive}
          className="glass-card p-6 text-left hover:bg-white/5 transition-all group"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 rounded-xl bg-indigo-500/20">
              <Zap className="w-6 h-6 text-indigo-400" />
            </div>
            <h3 className="font-semibold text-lg">Progressiv</h3>
          </div>
          <p className="text-white/60 text-sm">
            Lerne in 10er-Päckchen: 2 neue → 2 davor wiederholen → alle zusammen. Nach jedem 10er große Wiederholung.
          </p>
        </button>

        <button
          onClick={() => selectedCards.size > 0 && onStartManual(Array.from(selectedCards))}
          disabled={selectedCards.size === 0}
          className={`glass-card p-6 text-left transition-all ${
            selectedCards.size > 0 
              ? 'hover:bg-white/5 cursor-pointer' 
              : 'opacity-50 cursor-not-allowed'
          }`}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 rounded-xl bg-purple-500/20">
              <Settings className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="font-semibold text-lg">Manuell</h3>
            {selectedCards.size > 0 && (
              <span className="ml-auto px-2 py-1 rounded-lg bg-purple-500/20 text-purple-400 text-sm">
                {selectedCards.size} ausgewählt
              </span>
            )}
          </div>
          <p className="text-white/60 text-sm">
            Wähle selbst aus, welche Karten du lernen möchtest.
          </p>
        </button>
      </div>

      {/* Kartenauswahl für manuellen Modus */}
      <div className="glass-card p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h3 className="font-semibold">Karten auswählen</h3>
          <div className="flex gap-2">
            <button onClick={selectAll} className="px-3 py-1 text-xs rounded-lg glass hover:bg-white/10">
              Alle
            </button>
            <button onClick={selectNew} className="px-3 py-1 text-xs rounded-lg glass hover:bg-white/10">
              Nur neue
            </button>
            <button onClick={selectNone} className="px-3 py-1 text-xs rounded-lg glass hover:bg-white/10">
              Keine
            </button>
          </div>
        </div>

        {/* Legende */}
        <div className="flex flex-wrap gap-4 mb-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-500/30"></div>
            <span className="text-white/60">Neu (Box 1)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-orange-500/30"></div>
            <span className="text-white/60">Lernen (Box 2)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-yellow-500/30"></div>
            <span className="text-white/60">Wiederholen (Box 3)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-500/30"></div>
            <span className="text-white/60">Gelernt (Box 4-5)</span>
          </div>
        </div>

        {/* Karten-Grid */}
        <div className="flex flex-wrap gap-2">
          {allCards.map((card, idx) => {
            const state = cardStates[card.cardId];
            const box = state?.box || card.box || 1;
            const isSelected = selectedCards.has(card.cardId);
            
            let bgColor = 'bg-red-500/30 border-red-500/50';
            if (box === 2) bgColor = 'bg-orange-500/30 border-orange-500/50';
            else if (box === 3) bgColor = 'bg-yellow-500/30 border-yellow-500/50';
            else if (box >= 4) bgColor = 'bg-green-500/30 border-green-500/50';
            
            return (
              <button
                key={card.cardId}
                onClick={() => toggleCard(card.cardId)}
                className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium border-2 transition-all ${bgColor} ${
                  isSelected 
                    ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-110' 
                    : 'opacity-60 hover:opacity-100'
                }`}
                title={`Karte ${idx + 1}: Box ${box} - ${card.front.substring(0, 30)}...`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>

        {selectedCards.size > 0 && (
          <button
            onClick={() => onStartManual(Array.from(selectedCards))}
            className="mt-6 w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-all"
          >
            <Play className="w-5 h-5" />
            {selectedCards.size} Karten lernen
          </button>
        )}
      </div>
    </div>
  );
}

export default function StudyMode({ deck, onEnd }) {
  const [allCards, setAllCards] = useState([]);
  const [cardStates, setCardStates] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sessionStats, setSessionStats] = useState({ correct: 0, incorrect: 0, unsure: 0 });
  const [completed, setCompleted] = useState(false);
  const [animating, setAnimating] = useState(false);
  
  // Modus: 'select' | 'progressive' | 'manual'
  const [mode, setMode] = useState('select');
  const [manualSelection, setManualSelection] = useState([]);
  
  // Progressive Learning State
  const [progressState, setProgressState] = useState({
    currentBatchIndex: 0,
    withinBatchStep: 1,
    phase: 'new', // 'new' | 'review_previous' | 'review_all' | 'consolidate_batches' | 'completed'
    completedBatches: []
  });

  useEffect(() => {
    loadCards();
  }, [deck.deckId]);

  async function loadCards() {
    setLoading(true);
    setCurrentIndex(0);
    setSessionStats({ correct: 0, incorrect: 0, unsure: 0 });
    setCompleted(false);
    setMode('select');
    setProgressState({
      currentBatchIndex: 0,
      withinBatchStep: 1,
      phase: 'new',
      completedBatches: []
    });
    try {
      const result = await getStudyCards(deck.deckId, undefined, 100);
      const cards = result.cards || [];
      setAllCards(cards);
      
      const states = {};
      cards.forEach(card => {
        states[card.cardId] = {
          box: card.box || 1,
          learned: (card.box || 1) >= LEARNED_BOX_THRESHOLD
        };
      });
      setCardStates(states);
    } catch (error) {
      console.error('Fehler beim Laden der Karten:', error);
    } finally {
      setLoading(false);
    }
  }

  function startProgressiveMode() {
    setMode('progressive');
    setProgressState({
      currentBatchIndex: 0,
      withinBatchStep: 1,
      phase: 'new',
      completedBatches: []
    });
    setCurrentIndex(0);
    setFlipped(false);
  }

  function startManualMode(selectedCardIds) {
    setManualSelection(selectedCardIds);
    setMode('manual');
    setCurrentIndex(0);
    setFlipped(false);
  }

  // Aktive Karten basierend auf Modus
  const getActiveCards = () => {
    if (mode === 'manual') {
      return allCards.filter(c => manualSelection.includes(c.cardId) && !cardStates[c.cardId]?.learned);
    } else if (mode === 'progressive') {
      return getProgressivePhaseCards(allCards, progressState, cardStates);
    }
    return [];
  };

  const activeCards = getActiveCards();
  const currentCard = activeCards[currentIndex];

  // Berechne gelernte Karten für Fortschrittsanzeige
  const getLearnedAndTotalInBatch = () => {
    if (mode === 'manual') {
      return {
        learned: manualSelection.filter(id => cardStates[id]?.learned).length,
        total: manualSelection.length
      };
    } else if (mode === 'progressive') {
      const { currentBatchIndex, withinBatchStep, phase, completedBatches } = progressState;
      const batchStart = currentBatchIndex * BATCH_SIZE;
      const batchEnd = Math.min(batchStart + BATCH_SIZE, allCards.length);
      
      if (phase === 'consolidate_batches') {
        const allBatchIndices = [...completedBatches, currentBatchIndex];
        let total = 0;
        let learned = 0;
        allBatchIndices.forEach(batchIdx => {
          const start = batchIdx * BATCH_SIZE;
          const end = Math.min(start + BATCH_SIZE, allCards.length);
          const batchCards = allCards.slice(start, end);
          total += batchCards.length;
          learned += batchCards.filter(c => cardStates[c.cardId]?.learned).length;
        });
        return { learned, total };
      }
      
      const unlockedInBatch = Math.min(withinBatchStep * NEW_CARDS_PER_STEP, batchEnd - batchStart);
      const unlockedCards = allCards.slice(batchStart, batchStart + unlockedInBatch);
      return {
        learned: unlockedCards.filter(c => cardStates[c.cardId]?.learned).length,
        total: unlockedInBatch
      };
    }
    return { learned: 0, total: 0 };
  };

  const { learned: learnedInCurrentBatch, total: totalInBatch } = getLearnedAndTotalInBatch();

  // Antwort-Handler mit 3 Optionen
  async function handleAnswer(result) {
    if (animating || !currentCard) return;
    
    setAnimating(true);

    try {
      // 'correct' = true, 'incorrect' = false, 'unsure' = bleibt in aktueller Box
      let apiCorrect = result === 'correct';
      
      // Bei "unsure" senden wir false, aber die Box bleibt gleich (wird vom Backend nicht auf 1 gesetzt)
      if (result === 'unsure') {
        // Wir simulieren "unsure" indem wir die Karte nicht als falsch markieren
        // Stattdessen bleibt sie in der aktuellen Box
        apiCorrect = false;
      }
      
      const apiResult = await reviewCard(currentCard.cardId, apiCorrect);
      
      let newBox;
      if (result === 'correct') {
        newBox = Math.min((cardStates[currentCard.cardId]?.box || 1) + 1, 5);
      } else if (result === 'incorrect') {
        newBox = 1;
      } else {
        // unsure - Box bleibt gleich oder geht nur 1 runter (nicht auf 1)
        const currentBox = cardStates[currentCard.cardId]?.box || 1;
        newBox = Math.max(currentBox - 1, 1);
      }
      
      setCardStates(prev => ({
        ...prev,
        [currentCard.cardId]: {
          box: newBox,
          learned: newBox >= LEARNED_BOX_THRESHOLD
        }
      }));
      
      setSessionStats(prev => ({
        ...prev,
        [result]: prev[result] + 1
      }));

      setTimeout(() => {
        const updatedStates = {
          ...cardStates,
          [currentCard.cardId]: {
            box: newBox,
            learned: newBox >= LEARNED_BOX_THRESHOLD
          }
        };

        if (mode === 'progressive') {
          // Prüfen ob aktuelle Phase abgeschlossen ist
          const currentActiveCards = getProgressivePhaseCards(allCards, progressState, updatedStates);
          const allCurrentLearned = currentActiveCards.length === 0 || 
            currentActiveCards.every(c => updatedStates[c.cardId]?.learned);
          
          if (allCurrentLearned) {
            // Nächste Phase berechnen
            const nextState = getNextProgressState(progressState, allCards, updatedStates);
            
            if (nextState.phase === 'completed') {
              setCompleted(true);
            } else {
              setProgressState(nextState);
              setCurrentIndex(0);
              setFlipped(false);
            }
          } else {
            // Noch Karten in aktueller Phase übrig
            if (currentIndex < currentActiveCards.length - 1) {
              setCurrentIndex(currentIndex + 1);
              setFlipped(false);
            } else {
              setCurrentIndex(0);
              setFlipped(false);
            }
          }
        } else {
          // Manual mode
          const remaining = manualSelection.filter(id => !updatedStates[id]?.learned);
          if (remaining.length === 0) {
            setCompleted(true);
          } else if (currentIndex < remaining.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setFlipped(false);
          } else {
            setCurrentIndex(0);
            setFlipped(false);
          }
        }
        
        setAnimating(false);
      }, 300);

    } catch (error) {
      console.error('Fehler beim Speichern:', error);
      setAnimating(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-3 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-white/60">Lade Lernkarten...</p>
        </div>
      </div>
    );
  }

  if (allCards.length === 0) {
    return (
      <div className="text-center py-16">
        <Trophy className="w-20 h-20 text-green-400 mx-auto mb-6" />
        <h2 className="text-2xl font-bold mb-2">Alles erledigt!</h2>
        <p className="text-white/60 mb-8">Keine Karten fällig. Komm später wieder!</p>
        <button onClick={onEnd} className="glass-button">Zurück zur Übersicht</button>
      </div>
    );
  }

  // Modus-Auswahl
  if (mode === 'select') {
    return (
      <ModeSelection
        allCards={allCards}
        cardStates={cardStates}
        onStartProgressive={startProgressiveMode}
        onStartManual={startManualMode}
        onBack={onEnd}
      />
    );
  }

  // Freischaltungs-Screen (nur progressiver Modus) - Zwischen-Phasen
  if (mode === 'progressive' && activeCards.length === 0 && progressState.phase !== 'completed') {
    const nextState = getNextProgressState(progressState, allCards, cardStates);
    const phaseDescription = getPhaseDescription(nextState, allCards);
    const { currentBatchIndex, withinBatchStep, phase, completedBatches } = progressState;
    
    // Berechne Gesamtfortschritt
    const totalUnlocked = currentBatchIndex * BATCH_SIZE + withinBatchStep * NEW_CARDS_PER_STEP;
    const progressPercent = Math.min((totalUnlocked / allCards.length) * 100, 100);
    
    // Bestimme welche Nachricht angezeigt wird
    let title = '🎉 Super gemacht!';
    let subtitle = '';
    let buttonText = '';
    let buttonIcon = <ChevronRight className="w-5 h-5" />;
    
    if (nextState.phase === 'new') {
      subtitle = `Phase abgeschlossen! Bereit für die nächsten ${NEW_CARDS_PER_STEP} Karten.`;
      buttonText = `Nächste ${NEW_CARDS_PER_STEP} Karten`;
      buttonIcon = <Unlock className="w-5 h-5" />;
    } else if (nextState.phase === 'review_previous') {
      subtitle = 'Neue Karten gelernt! Jetzt kurz die vorherigen wiederholen.';
      buttonText = 'Vorherige wiederholen';
    } else if (nextState.phase === 'review_all') {
      subtitle = 'Zeit, alle bisherigen Karten zusammen zu üben!';
      buttonText = 'Alle zusammen üben';
    } else if (nextState.phase === 'consolidate_batches') {
      title = '🏆 10er-Päckchen geschafft!';
      subtitle = `Jetzt alle ${Math.min((completedBatches.length + 1) * BATCH_SIZE, allCards.length)} Karten durcheinander wiederholen.`;
      buttonText = 'Große Wiederholung starten';
      buttonIcon = <Sparkles className="w-5 h-5" />;
    }
    
    return (
      <div className="text-center py-16 max-w-lg mx-auto">
        <div className="relative inline-block mb-6">
          <Unlock className="w-20 h-20 text-green-400" />
          <Sparkles className="w-8 h-8 text-yellow-400 absolute -top-2 -right-2 animate-pulse" />
        </div>
        <h2 className="text-2xl font-bold mb-2">{title}</h2>
        <p className="text-white/60 mb-4">{subtitle}</p>
        
        <div className="glass-card p-6 mb-6">
          <p className="text-white/50 text-sm mb-2">Fortschritt</p>
          <p className="text-3xl font-bold gradient-text mb-2">
            {Math.min(totalUnlocked, allCards.length)} / {allCards.length}
          </p>
          <div className="h-3 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all"
              style={{ width: `${progressPercent}%` }} />
          </div>
          <p className="text-white/40 text-xs mt-2">
            Päckchen {currentBatchIndex + 1} von {Math.ceil(allCards.length / BATCH_SIZE)}
          </p>
        </div>
        
        <div className="glass p-4 rounded-xl mb-6 text-left">
          <p className="text-white/50 text-xs mb-1">Nächste Phase:</p>
          <p className="text-white/80 font-medium">{phaseDescription}</p>
        </div>

        <button 
          onClick={() => {
            setProgressState(nextState);
            setCurrentIndex(0);
            setFlipped(false);
          }}
          className="glass-button flex items-center gap-2 mx-auto"
        >
          {buttonIcon}
          {buttonText}
        </button>
      </div>
    );
  }

  // Abschluss-Screen
  if (completed) {
    const total = sessionStats.correct + sessionStats.incorrect + sessionStats.unsure;
    const percentage = total > 0 ? Math.round((sessionStats.correct / total) * 100) : 0;

    return (
      <div className="text-center py-12 max-w-lg mx-auto">
        <div className="relative inline-block mb-8">
          <Trophy className={`w-24 h-24 ${percentage >= 70 ? 'text-yellow-400' : 'text-white/40'}`} />
          {percentage >= 70 && (
            <Sparkles className="w-8 h-8 text-yellow-400 absolute -top-2 -right-2 animate-pulse" />
          )}
        </div>
        
        <h2 className="text-3xl font-bold mb-2">Session beendet!</h2>
        <p className="text-white/60 mb-8">Du hast {total} Karten durchgearbeitet</p>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="glass-card p-4">
            <Check className="w-6 h-6 text-green-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-400">{sessionStats.correct}</p>
            <p className="text-white/50 text-xs">Richtig</p>
          </div>
          <div className="glass-card p-4">
            <AlertCircle className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-yellow-400">{sessionStats.unsure}</p>
            <p className="text-white/50 text-xs">Unsicher</p>
          </div>
          <div className="glass-card p-4">
            <X className="w-6 h-6 text-red-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-red-400">{sessionStats.incorrect}</p>
            <p className="text-white/50 text-xs">Falsch</p>
          </div>
        </div>

        <div className="glass-card p-6 mb-8">
          <p className="text-white/60 mb-2">Erfolgsrate</p>
          <p className="text-4xl font-bold gradient-text">{percentage}%</p>
          <div className="h-3 bg-white/10 rounded-full mt-4 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-indigo-500 to-green-500 rounded-full transition-all duration-1000"
              style={{ width: `${percentage}%` }} />
          </div>
        </div>

        <div className="flex gap-4 justify-center">
          <button onClick={loadCards} className="glass-button flex items-center gap-2">
            <RotateCcw className="w-5 h-5" />
            Nochmal
          </button>
          <button onClick={onEnd} className="glass px-6 py-3 rounded-xl hover:bg-white/10 transition-all">
            Zurück
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <button onClick={() => setMode('select')} className="flex items-center gap-2 text-white/60 hover:text-white transition-all">
          <ArrowLeft className="w-5 h-5" />
          <span className="hidden sm:inline">Modus wählen</span>
        </button>
        
        <div className="text-center flex-1">
          <h2 className="font-semibold text-lg">{deck.name}</h2>
          <p className="text-white/50 text-sm">
            Karte {currentIndex + 1} von {activeCards.length} 
            <span className="text-white/30 ml-2">
              ({mode === 'progressive' ? 'Progressiv' : 'Manuell'})
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <span className="text-green-400 font-medium">{sessionStats.correct}</span>
          <span className="text-yellow-400 font-medium">{sessionStats.unsure}</span>
          <span className="text-red-400 font-medium">{sessionStats.incorrect}</span>
        </div>
      </div>

      {/* Status-Anzeige */}
      <div className="flex flex-col gap-2 mb-4 p-3 rounded-xl bg-indigo-500/10">
        {mode === 'progressive' && (
          <div className="text-center text-sm text-indigo-300 font-medium">
            {getPhaseDescription(progressState, allCards)}
          </div>
        )}
        <div className="flex items-center justify-center gap-4">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-400" />
            <span className="text-sm text-green-300">{learnedInCurrentBatch} gelernt</span>
          </div>
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-indigo-400" />
            <span className="text-sm text-indigo-300">{activeCards.length} offen</span>
          </div>
          {mode === 'progressive' && (
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-white/40" />
              <span className="text-sm text-white/40">
                {Math.max(0, allCards.length - (progressState.currentBatchIndex * BATCH_SIZE + progressState.withinBatchStep * NEW_CARDS_PER_STEP))} gesperrt
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-2 bg-white/10 rounded-full mb-6 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-indigo-500 to-green-500 rounded-full transition-all duration-300"
          style={{ width: `${(learnedInCurrentBatch / totalInBatch) * 100}%` }} />
      </div>

      {/* Leitner Box Indicator */}
      {currentCard && (
        <div className="flex flex-wrap items-center justify-center gap-2 mb-6 text-xs sm:text-sm">
          <div className="flex items-center gap-1">
            <Box className="w-4 h-4" style={{ color: LEITNER_INFO[cardStates[currentCard.cardId]?.box || 1]?.color }} />
            <span style={{ color: LEITNER_INFO[cardStates[currentCard.cardId]?.box || 1]?.color }}>
              Box {cardStates[currentCard.cardId]?.box || 1}: {LEITNER_INFO[cardStates[currentCard.cardId]?.box || 1]?.label}
            </span>
          </div>
        </div>
      )}

      {/* Flashcard */}
      <div 
        onClick={() => !flipped && setFlipped(true)}
        className={`relative cursor-pointer transition-all duration-300 ${animating ? 'scale-95 opacity-50' : ''}`}
      >
        <div className={`glass-card p-6 sm:p-8 min-h-[250px] sm:min-h-[300px] flex flex-col items-center justify-center text-center transition-all duration-300 ${
          flipped ? 'bg-green-500/10 border-green-500/20' : ''
        }`}>
          {!flipped ? (
            <>
              <p className="text-indigo-400 text-xs sm:text-sm mb-3 uppercase tracking-wider">Frage</p>
              <p className="text-lg sm:text-xl font-medium leading-relaxed">{currentCard?.front}</p>
              <p className="text-white/40 text-xs sm:text-sm mt-6">Tippe um die Antwort zu sehen</p>
            </>
          ) : (
            <>
              <p className="text-green-400 text-xs sm:text-sm mb-3 uppercase tracking-wider">Antwort</p>
              <p className="text-lg sm:text-xl font-medium leading-relaxed">{currentCard?.back}</p>
            </>
          )}
        </div>
      </div>

      {/* Navigation & Answer Buttons */}
      <div className="flex gap-2 sm:gap-3 mt-6">
        {/* Zurück Button */}
        <button
          onClick={() => {
            if (currentIndex > 0) {
              setCurrentIndex(currentIndex - 1);
              setFlipped(false);
            }
          }}
          disabled={currentIndex === 0 || animating}
          className="p-3 rounded-xl glass text-white/50 hover:text-white hover:bg-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          title="Vorherige Karte"
        >
          <Undo2 className="w-5 h-5" />
        </button>

        {/* Skip Button */}
        {activeCards.length > 1 && (
          <button
            onClick={() => {
              setCurrentIndex((currentIndex + 1) % activeCards.length);
              setFlipped(false);
            }}
            disabled={animating}
            className="p-3 rounded-xl glass text-white/50 hover:text-white hover:bg-white/10 transition-all disabled:opacity-30"
            title="Überspringen"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}

        {/* Answer Buttons - Ampel-System */}
        {flipped ? (
          <>
            <button
              onClick={() => handleAnswer('incorrect')}
              disabled={animating}
              className="flex-1 py-3 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 font-medium transition-all flex flex-col items-center justify-center gap-1 disabled:opacity-50"
            >
              <X className="w-5 h-5" />
              <span className="text-sm">Falsch</span>
              <span className="text-xs text-red-400/60">→ Box 1</span>
            </button>
            <button
              onClick={() => handleAnswer('unsure')}
              disabled={animating}
              className="flex-1 py-3 rounded-xl bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 font-medium transition-all flex flex-col items-center justify-center gap-1 disabled:opacity-50"
            >
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm">Unsicher</span>
              <span className="text-xs text-yellow-400/60">Box -1</span>
            </button>
            <button
              onClick={() => handleAnswer('correct')}
              disabled={animating}
              className="flex-1 py-3 rounded-xl bg-green-500/20 hover:bg-green-500/30 text-green-400 font-medium transition-all flex flex-col items-center justify-center gap-1 disabled:opacity-50"
            >
              <Check className="w-5 h-5" />
              <span className="text-sm">Richtig</span>
              <span className="text-xs text-green-400/60">→ Box +1</span>
            </button>
          </>
        ) : (
          <button
            onClick={() => setFlipped(true)}
            className="flex-1 py-3 rounded-xl glass hover:bg-white/10 text-white/70 font-medium transition-all flex items-center justify-center gap-2"
          >
            <span>Antwort zeigen</span>
          </button>
        )}
      </div>

      {/* Karten-Übersicht */}
      <div className="mt-8 p-4 glass rounded-xl">
        <div className="flex items-center gap-2 mb-3">
          <Target className="w-4 h-4 text-indigo-400" />
          <span className="text-white/70 font-medium text-sm">Kartenübersicht</span>
          {mode === 'progressive' && (
            <span className="text-white/40 text-xs ml-auto">
              Päckchen {progressState.currentBatchIndex + 1}/{Math.ceil(allCards.length / BATCH_SIZE)}
            </span>
          )}
        </div>
        
        <div className="flex flex-wrap gap-1.5">
          {(mode === 'progressive' ? allCards.slice(0, Math.min(40, allCards.length)) : allCards.filter(c => manualSelection.includes(c.cardId))).map((card, idx) => {
            const state = cardStates[card.cardId];
            const box = state?.box || card.box || 1;
            const isLearned = state?.learned;
            const isCurrent = activeCards[currentIndex]?.cardId === card.cardId;
            
            // Berechne ob Karte freigeschaltet ist
            const { currentBatchIndex, withinBatchStep, phase, completedBatches } = progressState;
            let isUnlocked = mode === 'manual';
            let isInCurrentPhase = false;
            
            if (mode === 'progressive') {
              const cardBatchIndex = Math.floor(idx / BATCH_SIZE);
              const positionInBatch = idx % BATCH_SIZE;
              const unlockedInCurrentBatch = withinBatchStep * NEW_CARDS_PER_STEP;
              
              // Karte ist freigeschaltet wenn:
              // - In einem abgeschlossenen Päckchen
              // - Im aktuellen Päckchen und Position < freigeschaltete Anzahl
              isUnlocked = completedBatches.includes(cardBatchIndex) ||
                (cardBatchIndex === currentBatchIndex && positionInBatch < unlockedInCurrentBatch);
              
              // Prüfen ob Karte in aktueller Phase aktiv ist
              const activeCardIds = activeCards.map(c => c.cardId);
              isInCurrentPhase = activeCardIds.includes(card.cardId);
            }
            
            let bgColor = 'bg-red-500/30';
            if (box === 2) bgColor = 'bg-orange-500/30';
            else if (box === 3) bgColor = 'bg-yellow-500/30';
            else if (box >= 4) bgColor = 'bg-green-500/30';
            
            if (!isUnlocked) bgColor = 'bg-white/5';
            
            // Markiere Karten in aktueller Phase
            let ringClass = '';
            if (isCurrent) {
              ringClass = 'ring-2 ring-white scale-110';
            } else if (isInCurrentPhase && !isLearned) {
              ringClass = 'ring-1 ring-indigo-400/50';
            }
            
            return (
              <div 
                key={card.cardId}
                className={`w-7 h-7 rounded flex items-center justify-center text-xs font-medium transition-all ${bgColor} ${ringClass} ${
                  !isUnlocked ? 'text-white/20' : isLearned ? 'text-green-400' : 'text-white/80'
                }`}
                title={`Karte ${idx + 1}: Box ${box}${isInCurrentPhase ? ' (aktuelle Phase)' : ''}`}
              >
                {idx + 1}
              </div>
            );
          })}
          {mode === 'progressive' && allCards.length > 40 && (
            <span className="text-white/30 text-xs self-center ml-1">+{allCards.length - 40}</span>
          )}
        </div>
      </div>
    </div>
  );
}
