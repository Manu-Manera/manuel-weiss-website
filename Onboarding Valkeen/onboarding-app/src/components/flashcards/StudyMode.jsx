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
            Starte mit 2 Karten. Neue werden freigeschaltet, sobald die aktuellen gelernt sind.
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
  const [unlockedCount, setUnlockedCount] = useState(2);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sessionStats, setSessionStats] = useState({ correct: 0, incorrect: 0, unsure: 0 });
  const [completed, setCompleted] = useState(false);
  const [animating, setAnimating] = useState(false);
  
  // Modus: 'select' | 'progressive' | 'manual'
  const [mode, setMode] = useState('select');
  const [manualSelection, setManualSelection] = useState([]);

  useEffect(() => {
    loadCards();
  }, [deck.deckId]);

  async function loadCards() {
    setLoading(true);
    setCurrentIndex(0);
    setSessionStats({ correct: 0, incorrect: 0, unsure: 0 });
    setCompleted(false);
    setUnlockedCount(2);
    setMode('select');
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
    setUnlockedCount(2);
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
      const unlocked = allCards.slice(0, unlockedCount);
      return unlocked.filter(c => !cardStates[c.cardId]?.learned);
    }
    return [];
  };

  const activeCards = getActiveCards();
  const currentCard = activeCards[currentIndex];

  const learnedInCurrentBatch = mode === 'progressive' 
    ? allCards.slice(0, unlockedCount).filter(c => cardStates[c.cardId]?.learned).length
    : manualSelection.filter(id => cardStates[id]?.learned).length;

  const totalInBatch = mode === 'progressive' ? unlockedCount : manualSelection.length;

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
          const currentUnlocked = allCards.slice(0, unlockedCount);
          const allCurrentLearned = currentUnlocked.every(c => updatedStates[c.cardId]?.learned);
          
          if (allCurrentLearned && unlockedCount < allCards.length) {
            setUnlockedCount(Math.min(unlockedCount + 2, allCards.length));
            setCurrentIndex(0);
            setFlipped(false);
          } else {
            const remaining = currentUnlocked.filter(c => !updatedStates[c.cardId]?.learned);
            if (remaining.length === 0 && unlockedCount >= allCards.length) {
              setCompleted(true);
            } else if (currentIndex < remaining.length - 1) {
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

  // Freischaltungs-Screen (nur progressiver Modus)
  if (mode === 'progressive' && activeCards.length === 0 && unlockedCount < allCards.length) {
    return (
      <div className="text-center py-16 max-w-lg mx-auto">
        <div className="relative inline-block mb-6">
          <Unlock className="w-20 h-20 text-green-400" />
          <Sparkles className="w-8 h-8 text-yellow-400 absolute -top-2 -right-2 animate-pulse" />
        </div>
        <h2 className="text-2xl font-bold mb-2">🎉 Super gemacht!</h2>
        <p className="text-white/60 mb-4">Du hast alle {unlockedCount} freigeschalteten Karten gelernt!</p>
        
        <div className="glass-card p-6 mb-6">
          <p className="text-white/50 text-sm mb-2">Fortschritt</p>
          <p className="text-3xl font-bold gradient-text mb-2">{unlockedCount} / {allCards.length}</p>
          <div className="h-3 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all"
              style={{ width: `${(unlockedCount / allCards.length) * 100}%` }} />
          </div>
        </div>

        <button 
          onClick={() => {
            setUnlockedCount(Math.min(unlockedCount + 2, allCards.length));
            setCurrentIndex(0);
            setFlipped(false);
          }}
          className="glass-button flex items-center gap-2 mx-auto"
        >
          <Unlock className="w-5 h-5" />
          Nächste 2 Karten freischalten
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
      <div className="flex items-center justify-center gap-4 mb-4 p-3 rounded-xl bg-indigo-500/10">
        <div className="flex items-center gap-2">
          <Check className="w-4 h-4 text-green-400" />
          <span className="text-sm text-green-300">{learnedInCurrentBatch} gelernt</span>
        </div>
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-indigo-400" />
          <span className="text-sm text-indigo-300">{activeCards.length} offen</span>
        </div>
        {mode === 'progressive' && unlockedCount < allCards.length && (
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-white/40" />
            <span className="text-sm text-white/40">{allCards.length - unlockedCount} gesperrt</span>
          </div>
        )}
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
        </div>
        
        <div className="flex flex-wrap gap-1.5">
          {(mode === 'progressive' ? allCards.slice(0, Math.min(30, allCards.length)) : allCards.filter(c => manualSelection.includes(c.cardId))).map((card, idx) => {
            const state = cardStates[card.cardId];
            const box = state?.box || card.box || 1;
            const isUnlocked = mode === 'manual' || idx < unlockedCount;
            const isLearned = state?.learned;
            const isCurrent = activeCards[currentIndex]?.cardId === card.cardId;
            
            let bgColor = 'bg-red-500/30';
            if (box === 2) bgColor = 'bg-orange-500/30';
            else if (box === 3) bgColor = 'bg-yellow-500/30';
            else if (box >= 4) bgColor = 'bg-green-500/30';
            
            if (!isUnlocked) bgColor = 'bg-white/5';
            
            return (
              <div 
                key={card.cardId}
                className={`w-7 h-7 rounded flex items-center justify-center text-xs font-medium transition-all ${bgColor} ${
                  isCurrent ? 'ring-2 ring-white scale-110' : ''
                } ${!isUnlocked ? 'text-white/20' : isLearned ? 'text-green-400' : 'text-white/80'}`}
                title={`Karte ${idx + 1}: Box ${box}`}
              >
                {idx + 1}
              </div>
            );
          })}
          {mode === 'progressive' && allCards.length > 30 && (
            <span className="text-white/30 text-xs self-center ml-1">+{allCards.length - 30}</span>
          )}
        </div>
      </div>
    </div>
  );
}
