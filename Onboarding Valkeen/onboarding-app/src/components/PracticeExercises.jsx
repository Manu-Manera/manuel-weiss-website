import { useState } from 'react';
import { practiceExercises } from '../data/onboardingData';
import { 
  BookOpen, 
  ChevronRight, 
  ChevronDown,
  Star,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Target,
  Award,
  ArrowLeft,
  Eye,
  EyeOff
} from 'lucide-react';

const difficultyLabels = {
  1: { label: 'Einsteiger', color: 'bg-green-500', stars: 1 },
  2: { label: 'Grundlagen', color: 'bg-blue-500', stars: 2 },
  3: { label: 'Fortgeschritten', color: 'bg-yellow-500', stars: 3 },
  4: { label: 'Experte', color: 'bg-orange-500', stars: 4 },
  5: { label: 'Meister', color: 'bg-red-500', stars: 5 }
};

function DifficultyBadge({ level }) {
  const { label, color, stars } = difficultyLabels[level] || difficultyLabels[1];
  return (
    <div className="flex items-center gap-2">
      <span className={`${color} text-white text-xs px-2 py-0.5 rounded-full`}>
        {label}
      </span>
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            className={`w-3 h-3 ${i < stars ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
          />
        ))}
      </div>
    </div>
  );
}

function ExerciseCard({ exercise, onStart }) {
  return (
    <div 
      onClick={onStart}
      className="glass-card p-4 sm:p-5 cursor-pointer hover:bg-white/10 transition-all group"
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-white group-hover:text-purple-300 transition-colors text-sm sm:text-base">
            {exercise.title}
          </h4>
          <p className="text-gray-400 text-xs sm:text-sm mt-1 line-clamp-2">
            {exercise.scenario}
          </p>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {exercise.skills.map((skill, i) => (
              <span key={i} className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded">
                {skill}
              </span>
            ))}
          </div>
        </div>
        <div className="flex sm:flex-col items-center sm:items-end gap-2 sm:gap-3">
          <DifficultyBadge level={exercise.difficulty} />
          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-400 transition-colors" />
        </div>
      </div>
    </div>
  );
}

function ExerciseDetail({ exercise, onBack, onComplete }) {
  const [showHints, setShowHints] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [selfRating, setSelfRating] = useState(null);

  const handleComplete = (rating) => {
    setSelfRating(rating);
    setIsCompleted(true);
    onComplete?.(exercise.id, rating);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm sm:text-base"
      >
        <ArrowLeft className="w-4 h-4" />
        Zurück zur Übersicht
      </button>

      <div className="glass-card p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
          <h3 className="text-lg sm:text-xl font-bold text-white">{exercise.title}</h3>
          <DifficultyBadge level={exercise.difficulty} />
        </div>

        <div className="space-y-4 sm:space-y-6">
          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Target className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-white text-sm sm:text-base">Szenario</h4>
                <p className="text-gray-300 mt-1 text-sm sm:text-base">{exercise.scenario}</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-500/10 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <BookOpen className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-white text-sm sm:text-base">Deine Aufgabe</h4>
                <p className="text-gray-300 mt-1 text-sm sm:text-base">{exercise.task}</p>
              </div>
            </div>
          </div>

          <div>
            <button
              onClick={() => setShowHints(!showHints)}
              className="flex items-center gap-2 text-yellow-400 hover:text-yellow-300 transition-colors text-sm sm:text-base"
            >
              <Lightbulb className="w-4 h-4" />
              {showHints ? 'Hinweise verbergen' : 'Hinweise anzeigen'}
              {showHints ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
            
            {showHints && (
              <div className="mt-3 bg-yellow-500/10 rounded-lg p-4">
                <ul className="space-y-2">
                  {exercise.hints.map((hint, i) => (
                    <li key={i} className="flex items-start gap-2 text-gray-300 text-sm sm:text-base">
                      <span className="text-yellow-400">•</span>
                      {hint}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {!isCompleted && (
            <div>
              <h4 className="font-semibold text-white mb-2 text-sm sm:text-base">Deine Antwort</h4>
              <textarea
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Formuliere hier deine Antwort..."
                className="w-full h-32 sm:h-40 bg-white/5 border border-white/10 rounded-lg p-3 sm:p-4 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none resize-none text-sm sm:text-base"
              />
            </div>
          )}

          <div>
            <button
              onClick={() => setShowAnswer(!showAnswer)}
              className="flex items-center gap-2 text-green-400 hover:text-green-300 transition-colors text-sm sm:text-base"
            >
              {showAnswer ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showAnswer ? 'Musterlösung verbergen' : 'Musterlösung anzeigen'}
            </button>
            
            {showAnswer && (
              <div className="mt-3 bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                <h5 className="font-semibold text-green-400 mb-2 text-sm sm:text-base">Musterlösung</h5>
                <p className="text-gray-300 whitespace-pre-wrap text-sm sm:text-base">{exercise.expectedAnswer}</p>
              </div>
            )}
          </div>

          {!isCompleted && showAnswer && (
            <div className="bg-white/5 rounded-lg p-4">
              <h4 className="font-semibold text-white mb-3 text-sm sm:text-base">Wie gut war deine Antwort?</h4>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button
                  onClick={() => handleComplete('needs_work')}
                  className="flex-1 flex items-center justify-center gap-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 py-2.5 sm:py-3 px-4 rounded-lg transition-colors text-sm sm:text-base"
                >
                  <XCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                  Muss üben
                </button>
                <button
                  onClick={() => handleComplete('okay')}
                  className="flex-1 flex items-center justify-center gap-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 py-2.5 sm:py-3 px-4 rounded-lg transition-colors text-sm sm:text-base"
                >
                  <Star className="w-4 h-4 sm:w-5 sm:h-5" />
                  Okay
                </button>
                <button
                  onClick={() => handleComplete('good')}
                  className="flex-1 flex items-center justify-center gap-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 py-2.5 sm:py-3 px-4 rounded-lg transition-colors text-sm sm:text-base"
                >
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  Gut!
                </button>
              </div>
            </div>
          )}

          {isCompleted && (
            <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg p-4 sm:p-6 text-center">
              <Award className="w-10 h-10 sm:w-12 sm:h-12 text-green-400 mx-auto mb-3" />
              <h4 className="text-lg sm:text-xl font-bold text-white mb-2">Übung abgeschlossen!</h4>
              <p className="text-gray-300 text-sm sm:text-base">
                {selfRating === 'good' && 'Super gemacht! Weiter so!'}
                {selfRating === 'okay' && 'Guter Fortschritt! Wiederhole bei Bedarf.'}
                {selfRating === 'needs_work' && 'Übung macht den Meister! Versuche es später nochmal.'}
              </p>
              <button
                onClick={onBack}
                className="mt-4 bg-purple-500 hover:bg-purple-600 text-white py-2 px-6 rounded-lg transition-colors text-sm sm:text-base"
              >
                Nächste Übung
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PracticeExercises({ currentWeek = 1 }) {
  const [selectedWeek, setSelectedWeek] = useState(currentWeek);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [completedExercises, setCompletedExercises] = useState({});

  const weekData = practiceExercises.find(w => w.week === selectedWeek);
  const exercises = weekData?.exercises || [];

  const handleComplete = (exerciseId, rating) => {
    setCompletedExercises(prev => ({
      ...prev,
      [exerciseId]: rating
    }));
  };

  const getCompletionStats = (weekNum) => {
    const week = practiceExercises.find(w => w.week === weekNum);
    if (!week) return { completed: 0, total: 0 };
    const completed = week.exercises.filter(e => completedExercises[e.id]).length;
    return { completed, total: week.exercises.length };
  };

  if (selectedExercise) {
    return (
      <ExerciseDetail 
        exercise={selectedExercise} 
        onBack={() => setSelectedExercise(null)}
        onComplete={handleComplete}
      />
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="glass-card p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-bold text-white mb-4">Praxisübungen</h3>
        
        <div className="flex flex-wrap gap-2 mb-6 overflow-x-auto pb-2 -mx-1 px-1">
          {practiceExercises.map((week) => {
            const stats = getCompletionStats(week.week);
            const isComplete = stats.completed === stats.total && stats.total > 0;
            return (
              <button
                key={week.week}
                onClick={() => setSelectedWeek(week.week)}
                className={`flex-shrink-0 px-3 sm:px-4 py-2 rounded-lg transition-all text-sm sm:text-base ${
                  selectedWeek === week.week
                    ? 'bg-purple-500 text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                } ${isComplete ? 'ring-2 ring-green-500' : ''}`}
              >
                <span className="whitespace-nowrap">Woche {week.week}</span>
                {stats.completed > 0 && (
                  <span className="ml-2 text-xs opacity-75">
                    {stats.completed}/{stats.total}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {weekData && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <h4 className="text-base sm:text-lg font-semibold text-white">{weekData.title}</h4>
              <span className="text-xs sm:text-sm text-gray-400">
                {exercises.length} Übungen
              </span>
            </div>
            
            <div className="space-y-3">
              {exercises.map((exercise) => (
                <div key={exercise.id} className="relative">
                  {completedExercises[exercise.id] && (
                    <div className="absolute -left-1 sm:-left-2 top-1/2 -translate-y-1/2 z-10">
                      <CheckCircle2 className={`w-4 h-4 sm:w-5 sm:h-5 ${
                        completedExercises[exercise.id] === 'good' ? 'text-green-500' :
                        completedExercises[exercise.id] === 'okay' ? 'text-yellow-500' :
                        'text-red-500'
                      }`} />
                    </div>
                  )}
                  <ExerciseCard 
                    exercise={exercise} 
                    onStart={() => setSelectedExercise(exercise)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
