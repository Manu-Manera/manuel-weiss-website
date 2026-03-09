import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Brain, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  RotateCcw,
  Trophy,
  Lightbulb,
  BookOpen,
  Target,
  Settings,
  Users
} from 'lucide-react';
import { useProgress } from '../hooks/useLocalStorage';
import { quizQuestions, weeks } from '../data/onboardingData';
import PracticeExercises from '../components/PracticeExercises';
import ToolConfigExercises from '../components/ToolConfigExercises';
import ScenarioExercises from '../components/ScenarioExercises';

export default function Quiz() {
  const { progress, setQuizScore } = useProgress();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [quizComplete, setQuizComplete] = useState(false);
  
  // Tab aus URL-Parameter oder Standard
  const tabFromUrl = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabFromUrl || 'quiz');
  
  // URL-Parameter synchronisieren
  useEffect(() => {
    if (tabFromUrl && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);
  
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const [quizSessionId, setQuizSessionId] = useState(0);

  const weekQuestions = useMemo(() => {
    if (!selectedWeek) return [];
    return quizQuestions.filter(q => q.week === selectedWeek);
  }, [selectedWeek]);

  // Optionen pro Frage randomisieren, damit die richtige Antwort nicht immer B ist
  const shuffledQuestions = useMemo(() => {
    if (!selectedWeek || weekQuestions.length === 0) return [];
    return weekQuestions.map(q => {
      const indices = q.options.map((_, i) => i);
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
      }
      const shuffledOptions = indices.map(i => q.options[i]);
      const newCorrect = indices.indexOf(q.correct);
      return { ...q, options: shuffledOptions, correct: newCorrect };
    });
  }, [selectedWeek, quizSessionId, weekQuestions]);

  const handleStartQuiz = (weekId) => {
    setSelectedWeek(weekId);
    setQuizSessionId(s => s + 1);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setAnswers([]);
    setQuizComplete(false);
  };

  const handleSelectAnswer = (index) => {
    if (showResult) return;
    setSelectedAnswer(index);
  };

  const questionsToUse = shuffledQuestions.length > 0 ? shuffledQuestions : weekQuestions;

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;
    
    const isCorrect = selectedAnswer === questionsToUse[currentQuestion].correct;
    setAnswers([...answers, { questionId: questionsToUse[currentQuestion].id, isCorrect }]);
    setShowResult(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questionsToUse.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      const correctCount = answers.filter(a => a.isCorrect).length;
      setQuizScore(selectedWeek, correctCount, questionsToUse.length);
      setQuizComplete(true);
    }
  };

  const handleBackToSelection = () => {
    setSelectedWeek(null);
    setQuizComplete(false);
  };

  if (!selectedWeek) {
    return (
      <div className="space-y-6 sm:space-y-8">
        <div className="pb-2">
          <h1 className="text-2xl sm:text-3xl font-bold mb-3">Wissens-Quiz & Praxis</h1>
          <p className="text-white/60 text-sm sm:text-base">Teste dein Wissen und übe mit realistischen Szenarien</p>
        </div>

        {/* Tabs - Scrollbar auf Mobile */}
        <div className="flex gap-1.5 sm:gap-2 border-b border-white/10 pb-2 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <button
            onClick={() => handleTabChange('quiz')}
            className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-all whitespace-nowrap text-xs sm:text-sm ${
              activeTab === 'quiz' 
                ? 'bg-purple-500 text-white' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Brain className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Quiz
          </button>
          <button
            onClick={() => handleTabChange('practice')}
            className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-all whitespace-nowrap text-xs sm:text-sm ${
              activeTab === 'practice' 
                ? 'bg-green-500 text-white' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Praxis
          </button>
          <button
            onClick={() => handleTabChange('toolconfig')}
            className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-all whitespace-nowrap text-xs sm:text-sm ${
              activeTab === 'toolconfig' 
                ? 'bg-indigo-500 text-white' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Tools
          </button>
          <button
            onClick={() => handleTabChange('scenarios')}
            className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-all whitespace-nowrap text-xs sm:text-sm ${
              activeTab === 'scenarios' 
                ? 'bg-amber-500 text-white' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Szenarien
          </button>
        </div>

        {activeTab === 'scenarios' ? (
          <ScenarioExercises />
        ) : activeTab === 'toolconfig' ? (
          <ToolConfigExercises />
        ) : activeTab === 'practice' ? (
          <PracticeExercises currentWeek={1} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {weeks.map(week => {
              const weekQuizzes = quizQuestions.filter(q => q.week === week.id);
              const hasQuiz = weekQuizzes.length > 0;
              const quizResult = progress.quizScores[week.id];

              return (
                <div key={week.id} className="glass-card p-4 sm:p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                      <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-400" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-sm sm:text-base">Woche {week.id}</h3>
                      <p className="text-xs sm:text-sm text-white/50 truncate">{week.name}</p>
                    </div>
                  </div>

                  {hasQuiz ? (
                    <>
                      <div className="text-xs sm:text-sm text-white/40 mb-3">
                        {weekQuizzes.length} Fragen
                      </div>
                      {quizResult && (
                        <div className="mb-4 p-2 sm:p-3 rounded-xl bg-white/5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs sm:text-sm text-white/50">Letztes Ergebnis</span>
                            <span className={`font-bold text-sm sm:text-base ${
                              quizResult.score / quizResult.total >= 0.7 
                                ? 'text-green-400' 
                                : 'text-amber-400'
                            }`}>
                              {quizResult.score}/{quizResult.total}
                            </span>
                          </div>
                        </div>
                      )}
                      <button
                        onClick={() => handleStartQuiz(week.id)}
                        className="w-full glass-button flex items-center justify-center gap-2 text-sm sm:text-base py-2.5 sm:py-3"
                      >
                        {quizResult ? 'Wiederholen' : 'Quiz starten'}
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <p className="text-xs sm:text-sm text-white/40 text-center py-4">
                      Kein Quiz verfügbar
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  if (quizComplete) {
    const correctCount = answers.filter(a => a.isCorrect).length;
    const totalQuestions = questionsToUse.length;
    const percentage = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;

    return (
      <div className="max-w-2xl mx-auto px-1">
        <div className="glass-card p-5 sm:p-8 text-center">
          <div className={`w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 rounded-2xl flex items-center justify-center ${
            percentage >= 70 ? 'bg-green-500/20' : 'bg-amber-500/20'
          }`}>
            <Trophy className={`w-8 h-8 sm:w-10 sm:h-10 ${
              percentage >= 70 ? 'text-green-400' : 'text-amber-400'
            }`} />
          </div>

          <h2 className="text-xl sm:text-2xl font-bold mb-2">Quiz abgeschlossen!</h2>
          <p className="text-white/60 mb-4 sm:mb-6 text-sm sm:text-base">Woche {selectedWeek}: {weeks.find(w => w.id === selectedWeek)?.name}</p>

          <div className="text-4xl sm:text-5xl font-bold gradient-text mb-2">
            {correctCount}/{totalQuestions}
          </div>
          <p className="text-white/50 mb-6 sm:mb-8 text-sm sm:text-base">richtige Antworten</p>

          <div className="h-2 sm:h-3 bg-white/10 rounded-full overflow-hidden mb-6 sm:mb-8">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                percentage >= 70 ? 'bg-green-500' : 'bg-amber-500'
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>

          {percentage >= 70 ? (
            <p className="text-green-400 mb-6 sm:mb-8 text-sm sm:text-base">Sehr gut! Du hast den Test bestanden.</p>
          ) : (
            <p className="text-amber-400 mb-6 sm:mb-8 text-sm sm:text-base">Schau dir die Materialien nochmal an und versuche es erneut.</p>
          )}

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <button
              onClick={() => handleStartQuiz(selectedWeek)}
              className="px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <RotateCcw className="w-4 h-4" />
              Wiederholen
            </button>
            <button
              onClick={handleBackToSelection}
              className="glass-button text-sm sm:text-base py-2.5 sm:py-3"
            >
              Zurück zur Übersicht
            </button>
          </div>
        </div>
      </div>
    );
  }

  const question = questionsToUse[currentQuestion];

  return (
    <div className="max-w-2xl mx-auto px-1">
      <div className="mb-4 sm:mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs sm:text-sm text-white/50">
            Frage {currentQuestion + 1} von {questionsToUse.length}
          </span>
          <button
            onClick={handleBackToSelection}
            className="text-xs sm:text-sm text-white/50 hover:text-white transition-colors"
          >
            Abbrechen
          </button>
        </div>
        <div className="h-1.5 sm:h-2 bg-white/10 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-300"
            style={{ width: `${questionsToUse.length > 0 ? ((currentQuestion + 1) / questionsToUse.length) * 100 : 0}%` }}
          />
        </div>
      </div>

      <div className="glass-card p-4 sm:p-8">
        <div className="flex items-center gap-3 mb-4 sm:mb-6">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
            <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" />
          </div>
          <span className="text-xs sm:text-sm text-white/50">Woche {selectedWeek}</span>
        </div>

        <h2 className="text-base sm:text-xl font-semibold mb-4 sm:mb-6">{question.question}</h2>

        <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
          {question.options.map((option, index) => {
            const isSelected = selectedAnswer === index;
            const isCorrect = index === question.correct;
            
            let bgClass = 'bg-white/5 hover:bg-white/10';
            let borderClass = 'border-transparent';
            
            if (showResult) {
              if (isCorrect) {
                bgClass = 'bg-green-500/20';
                borderClass = 'border-green-500/50';
              } else if (isSelected && !isCorrect) {
                bgClass = 'bg-red-500/20';
                borderClass = 'border-red-500/50';
              }
            } else if (isSelected) {
              bgClass = 'bg-indigo-500/20';
              borderClass = 'border-indigo-500/50';
            }

            return (
              <button
                key={index}
                onClick={() => handleSelectAnswer(index)}
                disabled={showResult}
                className={`w-full p-3 sm:p-4 rounded-xl border-2 text-left transition-all ${bgClass} ${borderClass}`}
              >
                <div className="flex items-start sm:items-center gap-2 sm:gap-3">
                  <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    showResult && isCorrect ? 'bg-green-500/30' :
                    showResult && isSelected && !isCorrect ? 'bg-red-500/30' :
                    isSelected ? 'bg-indigo-500/30' : 'bg-white/10'
                  }`}>
                    {showResult && isCorrect ? (
                      <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                    ) : showResult && isSelected && !isCorrect ? (
                      <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />
                    ) : (
                      <span className="text-xs sm:text-sm font-medium">{String.fromCharCode(65 + index)}</span>
                    )}
                  </div>
                  <span className="text-xs sm:text-sm leading-relaxed">{option}</span>
                </div>
              </button>
            );
          })}
        </div>

        {showResult && (
          <div className="p-3 sm:p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 mb-4 sm:mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="w-4 h-4 text-indigo-400 flex-shrink-0" />
              <span className="font-medium text-indigo-400 text-xs sm:text-sm">Erklärung</span>
            </div>
            <p className="text-xs sm:text-sm text-white/70 leading-relaxed">{question.explanation}</p>
          </div>
        )}

        <div className="flex justify-end">
          {!showResult ? (
            <button
              onClick={handleSubmitAnswer}
              disabled={selectedAnswer === null}
              className={`glass-button text-sm sm:text-base py-2.5 sm:py-3 ${selectedAnswer === null ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Antwort prüfen
            </button>
          ) : (
            <button
              onClick={handleNextQuestion}
              className="glass-button flex items-center gap-2 text-sm sm:text-base py-2.5 sm:py-3"
            >
              {currentQuestion < weekQuestions.length - 1 ? 'Nächste Frage' : 'Ergebnis anzeigen'}
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
