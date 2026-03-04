import { useState, useEffect, useCallback } from 'react';
import { 
  ArrowLeft, 
  Check, 
  X, 
  RotateCcw, 
  Trophy, 
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Box,
  Zap,
  Target,
  Undo2,
  Lock,
  Unlock
} from 'lucide-react';
import { getStudyCards, reviewCard } from '../../services/awsService';

const LEITNER_INFO = {
  1: { label: 'Neu', color: 'rgb(239, 68, 68)', interval: 'Sofort' },
  2: { label: 'Lernen', color: 'rgb(249, 115, 22)', interval: '1 Tag' },
  3: { label: 'Wiederholen', color: 'rgb(234, 179, 8)', interval: '3 Tage' },
  4: { label: 'Gefestigt', color: 'rgb(34, 197, 94)', interval: '7 Tage' },
  5: { label: 'Gemeistert', color: 'rgb(16, 185, 129)', interval: '14 Tage' }
};

// Karte gilt als "gelernt" wenn Box >= 3 (gelb oder besser)
const LEARNED_BOX_THRESHOLD = 3;

export default function StudyMode({ deck, onEnd }) {
  const [allCards, setAllCards] = useState([]);
  const [cardStates, setCardStates] = useState({}); // { cardId: { box, learned } }
  const [unlockedCount, setUnlockedCount] = useState(2); // Start mit 2 Karten
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sessionStats, setSessionStats] = useState({ correct: 0, incorrect: 0 });
  const [completed, setCompleted] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [useProgressiveMode, setUseProgressiveMode] = useState(true);

  useEffect(() => {
    loadCards();
  }, [deck.deckId]);

  async function loadCards() {
    setLoading(true);
    setCurrentIndex(0);
    setSessionStats({ correct: 0, incorrect: 0 });
    setCompleted(false);
    setUnlockedCount(2);
    try {
      const result = await getStudyCards(deck.deckId, undefined, 100);
      const cards = result.cards || [];
      setAllCards(cards);
      
      // Initialisiere Card States
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

  // Berechne welche Karten aktuell freigeschaltet sind
  const unlockedCards = useProgressiveMode 
    ? allCards.slice(0, unlockedCount)
    : allCards;
  
  // Filtere nur Karten die noch nicht gelernt sind (Box < 3)
  const activeCards = unlockedCards.filter(card => {
    const state = cardStates[card.cardId];
    return !state?.learned;
  });

  // Zähle gelernte Karten in der aktuellen Gruppe
  const learnedInCurrentBatch = unlockedCards.filter(card => {
    const state = cardStates[card.cardId];
    return state?.learned;
  }).length;

  // Prüfe ob alle freigeschalteten Karten gelernt sind
  const allUnlockedLearned = learnedInCurrentBatch === unlockedCount;

  // Aktuelle Karte
  const currentCard = activeCards[currentIndex];
  
  // Berechne nächste Freischaltung
  const nextUnlockAt = Math.min(unlockedCount + 2, allCards.length);

  async function handleAnswer(correct) {
    if (animating || !currentCard) return;
    
    setAnimating(true);

    try {
      const result = await reviewCard(currentCard.cardId, correct);
      const newBox = result.newBox || (correct ? Math.min((currentCard.box || 1) + 1, 5) : 1);
      
      // Update lokalen Card State
      setCardStates(prev => ({
        ...prev,
        [currentCard.cardId]: {
          box: newBox,
          learned: newBox >= LEARNED_BOX_THRESHOLD
        }
      }));
      
      setSessionStats(prev => ({
        ...prev,
        [correct ? 'correct' : 'incorrect']: prev[correct ? 'correct' : 'incorrect'] + 1
      }));

      setTimeout(() => {
        // Prüfe ob alle aktuellen Karten gelernt sind
        const updatedStates = {
          ...cardStates,
          [currentCard.cardId]: {
            box: newBox,
            learned: newBox >= LEARNED_BOX_THRESHOLD
          }
        };
        
        const currentUnlocked = allCards.slice(0, unlockedCount);
        const allCurrentLearned = currentUnlocked.every(card => 
          updatedStates[card.cardId]?.learned
        );
        
        if (allCurrentLearned && unlockedCount < allCards.length && useProgressiveMode) {
          // Schalte 2 neue Karten frei
          const newUnlockedCount = Math.min(unlockedCount + 2, allCards.length);
          setUnlockedCount(newUnlockedCount);
          setCurrentIndex(0);
          setFlipped(false);
        } else {
          // Berechne verbleibende aktive Karten
          const remainingActive = currentUnlocked.filter(card => 
            !updatedStates[card.cardId]?.learned
          );
          
          if (remainingActive.length === 0) {
            // Alle Karten gelernt
            if (unlockedCount >= allCards.length) {
              setCompleted(true);
            }
          } else if (currentIndex < remainingActive.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setFlipped(false);
          } else {
            // Zurück zum Anfang der aktiven Karten
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
        <p className="text-white/60 mb-8">
          Keine Karten fällig. Komm später wieder!
        </p>
        <button onClick={onEnd} className="glass-button">
          Zurück zur Übersicht
        </button>
      </div>
    );
  }

  // Wenn alle freigeschalteten Karten gelernt sind, aber noch mehr Karten da sind
  if (activeCards.length === 0 && unlockedCount < allCards.length && useProgressiveMode) {
    return (
      <div className="text-center py-16 max-w-lg mx-auto">
        <div className="relative inline-block mb-6">
          <Unlock className="w-20 h-20 text-green-400" />
          <Sparkles className="w-8 h-8 text-yellow-400 absolute -top-2 -right-2 animate-pulse" />
        </div>
        <h2 className="text-2xl font-bold mb-2">🎉 Super gemacht!</h2>
        <p className="text-white/60 mb-4">
          Du hast alle {unlockedCount} freigeschalteten Karten gelernt!
        </p>
        
        <div className="glass-card p-6 mb-6">
          <p className="text-white/50 text-sm mb-2">Fortschritt</p>
          <p className="text-3xl font-bold gradient-text mb-2">
            {unlockedCount} / {allCards.length}
          </p>
          <div className="h-3 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all"
              style={{ width: `${(unlockedCount / allCards.length) * 100}%` }}
            />
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

  if (completed) {
    const total = sessionStats.correct + sessionStats.incorrect;
    const percentage = Math.round((sessionStats.correct / total) * 100);

    return (
      <div className="text-center py-12">
        <div className="relative inline-block mb-8">
          <Trophy className={`w-24 h-24 ${percentage >= 70 ? 'text-yellow-400' : 'text-white/40'}`} />
          {percentage >= 70 && (
            <Sparkles className="w-8 h-8 text-yellow-400 absolute -top-2 -right-2 animate-pulse" />
          )}
        </div>
        
        <h2 className="text-3xl font-bold mb-2">Session beendet!</h2>
        <p className="text-white/60 mb-8">
          Du hast {total} Karten durchgearbeitet
        </p>

        <div className="grid grid-cols-2 gap-6 max-w-md mx-auto mb-8">
          <div className="glass-card p-6">
            <Check className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <p className="text-3xl font-bold text-green-400">{sessionStats.correct}</p>
            <p className="text-white/50 text-sm">Richtig</p>
          </div>
          <div className="glass-card p-6">
            <X className="w-8 h-8 text-red-400 mx-auto mb-2" />
            <p className="text-3xl font-bold text-red-400">{sessionStats.incorrect}</p>
            <p className="text-white/50 text-sm">Falsch</p>
          </div>
        </div>

        <div className="glass-card p-6 max-w-md mx-auto mb-8">
          <p className="text-white/60 mb-2">Erfolgsrate</p>
          <p className="text-4xl font-bold gradient-text">{percentage}%</p>
          <div className="h-3 bg-white/10 rounded-full mt-4 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 to-green-500 rounded-full transition-all duration-1000"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        <div className="flex gap-4 justify-center">
          <button onClick={loadCards} className="glass-button flex items-center gap-2">
            <RotateCcw className="w-5 h-5" />
            Nochmal lernen
          </button>
          <button onClick={onEnd} className="glass px-6 py-3 rounded-xl hover:bg-white/10 transition-all">
            Zurück zur Übersicht
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <button 
          onClick={onEnd}
          className="flex items-center gap-2 text-white/60 hover:text-white transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="hidden sm:inline">Beenden</span>
        </button>
        
        <div className="text-center flex-1">
          <h2 className="font-semibold text-lg">{deck.name}</h2>
          <p className="text-white/50 text-sm">
            {useProgressiveMode 
              ? `Karte ${currentIndex + 1} von ${activeCards.length} (${unlockedCount}/${allCards.length} freigeschaltet)`
              : `Karte ${currentIndex + 1} von ${allCards.length}`
            }
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-sm">
            <Check className="w-4 h-4 text-green-400" />
            <span className="text-green-400 font-medium">{sessionStats.correct}</span>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <X className="w-4 h-4 text-red-400" />
            <span className="text-red-400 font-medium">{sessionStats.incorrect}</span>
          </div>
        </div>
      </div>

      {/* Progressive Mode Indicator */}
      {useProgressiveMode && (
        <div className="flex items-center justify-center gap-4 mb-4 p-3 rounded-xl bg-indigo-500/10">
          <div className="flex items-center gap-2">
            <Unlock className="w-4 h-4 text-green-400" />
            <span className="text-sm text-green-300">{learnedInCurrentBatch} gelernt</span>
          </div>
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-indigo-400" />
            <span className="text-sm text-indigo-300">{activeCards.length} noch offen</span>
          </div>
          {unlockedCount < allCards.length && (
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-white/40" />
              <span className="text-sm text-white/40">{allCards.length - unlockedCount} gesperrt</span>
            </div>
          )}
        </div>
      )}

      {/* Progress Bar - zeigt Gesamtfortschritt */}
      <div className="h-2 bg-white/10 rounded-full mb-6 overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-indigo-500 to-green-500 rounded-full transition-all duration-300"
          style={{ width: `${(learnedInCurrentBatch / allCards.length) * 100}%` }}
        />
      </div>

      {/* Leitner Box Indicator */}
      {currentCard && (
        <div className="flex flex-wrap items-center justify-center gap-2 mb-6 text-xs sm:text-sm">
          <div className="flex items-center gap-1">
            <Box className="w-4 h-4" style={{ color: LEITNER_INFO[cardStates[currentCard.cardId]?.box || currentCard.box]?.color }} />
            <span style={{ color: LEITNER_INFO[cardStates[currentCard.cardId]?.box || currentCard.box]?.color }}>
              Box {cardStates[currentCard.cardId]?.box || currentCard.box}: {LEITNER_INFO[cardStates[currentCard.cardId]?.box || currentCard.box]?.label}
            </span>
          </div>
          <span className="text-white/40 hidden sm:inline">
            (Gelernt ab Box {LEARNED_BOX_THRESHOLD})
          </span>
        </div>
      )}

      {/* Flashcard */}
      <div 
        onClick={() => !flipped && setFlipped(true)}
        className={`relative cursor-pointer transition-all duration-300 ${animating ? 'scale-95 opacity-50' : ''}`}
      >
        <div 
          className={`glass-card p-6 sm:p-8 min-h-[250px] sm:min-h-[300px] flex flex-col items-center justify-center text-center transition-all duration-300 ${
            flipped ? 'bg-green-500/10 border-green-500/20' : ''
          }`}
        >
          {!flipped ? (
            <>
              <p className="text-indigo-400 text-xs sm:text-sm mb-3 uppercase tracking-wider">Frage</p>
              <p className="text-lg sm:text-xl font-medium leading-relaxed">{currentCard?.front}</p>
              <p className="text-white/40 text-xs sm:text-sm mt-6">
                Tippe um die Antwort zu sehen
              </p>
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
      <div className="flex gap-3 sm:gap-4 mt-6">
        {/* Zurück Button */}
        <button
          onClick={() => {
            if (currentIndex > 0) {
              setCurrentIndex(currentIndex - 1);
              setFlipped(false);
            }
          }}
          disabled={currentIndex === 0 || animating}
          className="p-3 sm:p-4 rounded-xl glass text-white/50 hover:text-white hover:bg-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          title="Vorherige Karte"
        >
          <Undo2 className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Skip zu nächster Karte (ohne Bewertung) */}
        {activeCards.length > 1 && (
          <button
            onClick={() => {
              const nextIndex = (currentIndex + 1) % activeCards.length;
              setCurrentIndex(nextIndex);
              setFlipped(false);
            }}
            disabled={animating}
            className="p-3 sm:p-4 rounded-xl glass text-white/50 hover:text-white hover:bg-white/10 transition-all disabled:opacity-30"
            title="Überspringen"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        )}

        {/* Answer Buttons - nur wenn umgedreht */}
        {flipped ? (
          <>
            <button
              onClick={() => handleAnswer(false)}
              disabled={animating}
              className="flex-1 py-3 sm:py-4 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 font-medium transition-all flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 disabled:opacity-50"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
              <span>Falsch</span>
              <span className="text-xs text-red-400/60">→ Box 1</span>
            </button>
            <button
              onClick={() => handleAnswer(true)}
              disabled={animating}
              className="flex-1 py-3 sm:py-4 rounded-xl bg-green-500/20 hover:bg-green-500/30 text-green-400 font-medium transition-all flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 disabled:opacity-50"
            >
              <Check className="w-5 h-5 sm:w-6 sm:h-6" />
              <span>Richtig</span>
              <span className="text-xs text-green-400/60">
                → Box {Math.min((currentCard?.box || 1) + 1, 5)}
              </span>
            </button>
          </>
        ) : (
          <button
            onClick={() => setFlipped(true)}
            className="flex-1 py-3 sm:py-4 rounded-xl glass hover:bg-white/10 text-white/70 font-medium transition-all flex items-center justify-center gap-2"
          >
            <span>Antwort zeigen</span>
          </button>
        )}
      </div>

      {/* Keyboard Hint - hidden on mobile */}
      <div className="hidden sm:block text-center mt-6 text-white/30 text-sm">
        {!flipped ? (
          'Leertaste oder Klick zum Umdrehen'
        ) : (
          '← Falsch | Richtig →'
        )}
      </div>

      {/* Progressive Learning Info */}
      {useProgressiveMode && (
        <div className="mt-8 p-4 glass rounded-xl text-sm text-white/50">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-indigo-400" />
            <span className="text-white/70 font-medium">Progressiver Lernmodus</span>
          </div>
          <p className="text-xs leading-relaxed">
            Du startest mit 2 Karten. Sobald beide auf Box {LEARNED_BOX_THRESHOLD}+ (gelb/grün) sind, 
            werden 2 neue Karten freigeschaltet. So baust du schrittweise dein Wissen auf!
          </p>
          
          {/* Mini-Übersicht der freigeschalteten Karten */}
          <div className="flex flex-wrap gap-1 mt-3">
            {allCards.slice(0, Math.min(20, allCards.length)).map((card, idx) => {
              const state = cardStates[card.cardId];
              const isUnlocked = idx < unlockedCount;
              const isLearned = state?.learned;
              
              return (
                <div 
                  key={card.cardId}
                  className={`w-6 h-6 rounded flex items-center justify-center text-xs font-medium ${
                    !isUnlocked 
                      ? 'bg-white/5 text-white/20' 
                      : isLearned 
                        ? 'bg-green-500/30 text-green-400' 
                        : 'bg-orange-500/30 text-orange-400'
                  }`}
                  title={`Karte ${idx + 1}: ${!isUnlocked ? 'Gesperrt' : isLearned ? 'Gelernt' : 'Offen'}`}
                >
                  {idx + 1}
                </div>
              );
            })}
            {allCards.length > 20 && (
              <span className="text-white/30 text-xs self-center ml-1">+{allCards.length - 20}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
