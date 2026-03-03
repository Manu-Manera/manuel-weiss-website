import { useState, useMemo } from 'react';
import { 
  Brain, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  RotateCcw,
  Trophy,
  Lightbulb
} from 'lucide-react';
import { useProgress } from '../hooks/useLocalStorage';
import { quizQuestions, weeks } from '../data/onboardingData';

export default function Quiz() {
  const { progress, setQuizScore } = useProgress();
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [quizComplete, setQuizComplete] = useState(false);

  const weekQuestions = useMemo(() => {
    if (!selectedWeek) return [];
    return quizQuestions.filter(q => q.week === selectedWeek);
  }, [selectedWeek]);

  const handleStartQuiz = (weekId) => {
    setSelectedWeek(weekId);
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

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;
    
    const isCorrect = selectedAnswer === weekQuestions[currentQuestion].correct;
    setAnswers([...answers, { questionId: weekQuestions[currentQuestion].id, isCorrect }]);
    setShowResult(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < weekQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      const correctCount = answers.filter(a => a.isCorrect).length + 
        (selectedAnswer === weekQuestions[currentQuestion].correct ? 1 : 0);
      setQuizScore(selectedWeek, correctCount, weekQuestions.length);
      setQuizComplete(true);
    }
  };

  const handleBackToSelection = () => {
    setSelectedWeek(null);
    setQuizComplete(false);
  };

  if (!selectedWeek) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Wissens-Quiz</h1>
          <p className="text-white/60">Teste dein Wissen zu jeder Woche</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {weeks.map(week => {
            const weekQuizzes = quizQuestions.filter(q => q.week === week.id);
            const hasQuiz = weekQuizzes.length > 0;
            const quizResult = progress.quizScores[week.id];

            return (
              <div key={week.id} className="glass-card p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                    <Brain className="w-6 h-6 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Woche {week.id}</h3>
                    <p className="text-sm text-white/50">{week.name}</p>
                  </div>
                </div>

                {hasQuiz ? (
                  <>
                    {quizResult && (
                      <div className="mb-4 p-3 rounded-xl bg-white/5">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-white/50">Letztes Ergebnis</span>
                          <span className={`font-bold ${
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
                      className="w-full glass-button flex items-center justify-center gap-2"
                    >
                      {quizResult ? 'Wiederholen' : 'Quiz starten'}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <p className="text-sm text-white/40 text-center py-4">
                    Kein Quiz verfügbar
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (quizComplete) {
    const correctCount = answers.filter(a => a.isCorrect).length;
    const percentage = (correctCount / weekQuestions.length) * 100;

    return (
      <div className="max-w-2xl mx-auto">
        <div className="glass-card p-8 text-center">
          <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center ${
            percentage >= 70 ? 'bg-green-500/20' : 'bg-amber-500/20'
          }`}>
            <Trophy className={`w-10 h-10 ${
              percentage >= 70 ? 'text-green-400' : 'text-amber-400'
            }`} />
          </div>

          <h2 className="text-2xl font-bold mb-2">Quiz abgeschlossen!</h2>
          <p className="text-white/60 mb-6">Woche {selectedWeek}: {weeks.find(w => w.id === selectedWeek)?.name}</p>

          <div className="text-5xl font-bold gradient-text mb-2">
            {correctCount}/{weekQuestions.length}
          </div>
          <p className="text-white/50 mb-8">richtige Antworten</p>

          <div className="h-3 bg-white/10 rounded-full overflow-hidden mb-8">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                percentage >= 70 ? 'bg-green-500' : 'bg-amber-500'
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>

          {percentage >= 70 ? (
            <p className="text-green-400 mb-8">Sehr gut! Du hast den Test bestanden.</p>
          ) : (
            <p className="text-amber-400 mb-8">Schau dir die Materialien nochmal an und versuche es erneut.</p>
          )}

          <div className="flex gap-4 justify-center">
            <button
              onClick={() => handleStartQuiz(selectedWeek)}
              className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Wiederholen
            </button>
            <button
              onClick={handleBackToSelection}
              className="glass-button"
            >
              Zurück zur Übersicht
            </button>
          </div>
        </div>
      </div>
    );
  }

  const question = weekQuestions[currentQuestion];

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-white/50">
            Frage {currentQuestion + 1} von {weekQuestions.length}
          </span>
          <button
            onClick={handleBackToSelection}
            className="text-sm text-white/50 hover:text-white transition-colors"
          >
            Abbrechen
          </button>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestion + 1) / weekQuestions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="glass-card p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
            <Brain className="w-5 h-5 text-indigo-400" />
          </div>
          <span className="text-sm text-white/50">Woche {selectedWeek}</span>
        </div>

        <h2 className="text-xl font-semibold mb-6">{question.question}</h2>

        {/* Options */}
        <div className="space-y-3 mb-6">
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
                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${bgClass} ${borderClass}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    showResult && isCorrect ? 'bg-green-500/30' :
                    showResult && isSelected && !isCorrect ? 'bg-red-500/30' :
                    isSelected ? 'bg-indigo-500/30' : 'bg-white/10'
                  }`}>
                    {showResult && isCorrect ? (
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                    ) : showResult && isSelected && !isCorrect ? (
                      <XCircle className="w-5 h-5 text-red-400" />
                    ) : (
                      <span className="text-sm font-medium">{String.fromCharCode(65 + index)}</span>
                    )}
                  </div>
                  <span className="text-sm">{option}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Explanation */}
        {showResult && (
          <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="w-4 h-4 text-indigo-400" />
              <span className="font-medium text-indigo-400 text-sm">Erklärung</span>
            </div>
            <p className="text-sm text-white/70">{question.explanation}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end">
          {!showResult ? (
            <button
              onClick={handleSubmitAnswer}
              disabled={selectedAnswer === null}
              className={`glass-button ${selectedAnswer === null ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Antwort prüfen
            </button>
          ) : (
            <button
              onClick={handleNextQuestion}
              className="glass-button flex items-center gap-2"
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
