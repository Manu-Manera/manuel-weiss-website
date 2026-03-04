import { useState } from 'react';
import { toolConfigExercises } from '../data/onboardingData';
import { 
  Settings, 
  ChevronRight, 
  ChevronDown,
  Star,
  CheckCircle2,
  Circle,
  Wrench,
  Target,
  Award,
  ArrowLeft,
  ListChecks,
  Monitor,
  Play,
  Pause
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

function ExerciseCard({ exercise, isCompleted, onStart }) {
  return (
    <div 
      onClick={onStart}
      className={`glass-card p-4 sm:p-5 cursor-pointer hover:bg-white/10 transition-all group ${
        isCompleted ? 'border-l-4 border-l-green-500' : ''
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {isCompleted ? (
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
            ) : (
              <Circle className="w-5 h-5 text-gray-500 flex-shrink-0" />
            )}
            <h4 className="font-semibold text-white group-hover:text-purple-300 transition-colors text-sm sm:text-base">
              {exercise.title}
            </h4>
          </div>
          <p className="text-gray-400 text-xs sm:text-sm mt-1 line-clamp-2 ml-7">
            {exercise.scenario}
          </p>
          <div className="flex flex-wrap gap-1.5 mt-2 ml-7">
            {exercise.skills.map((skill, i) => (
              <span key={i} className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded">
                {skill}
              </span>
            ))}
          </div>
        </div>
        <div className="flex sm:flex-col items-center sm:items-end gap-2 sm:gap-3 ml-7 sm:ml-0">
          <DifficultyBadge level={exercise.difficulty} />
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <ListChecks className="w-3 h-3" />
            {exercise.steps.length} Schritte
          </div>
        </div>
      </div>
    </div>
  );
}

function ExerciseDetail({ exercise, onBack, onComplete, isCompleted }) {
  const [completedSteps, setCompletedSteps] = useState([]);
  const [isStarted, setIsStarted] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const toggleStep = (index) => {
    if (completedSteps.includes(index)) {
      setCompletedSteps(completedSteps.filter(i => i !== index));
    } else {
      setCompletedSteps([...completedSteps, index]);
    }
  };

  const allStepsCompleted = completedSteps.length === exercise.steps.length;

  const handleComplete = () => {
    onComplete?.(exercise.id);
    setShowResult(true);
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
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-indigo-500/20">
              <Wrench className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-white">{exercise.title}</h3>
              <p className="text-sm text-gray-400">{exercise.skills.join(' • ')}</p>
            </div>
          </div>
          <DifficultyBadge level={exercise.difficulty} />
        </div>

        <div className="space-y-4 sm:space-y-6">
          <div className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Target className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-white text-sm sm:text-base">Szenario</h4>
                <p className="text-gray-300 mt-1 text-sm sm:text-base">{exercise.scenario}</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-500/10 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Monitor className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-white text-sm sm:text-base">Aufgabe</h4>
                <p className="text-gray-300 mt-1 text-sm sm:text-base">{exercise.task}</p>
              </div>
            </div>
          </div>

          {!isStarted && !showResult && (
            <button
              onClick={() => setIsStarted(true)}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-all"
            >
              <Play className="w-5 h-5" />
              Übung starten
            </button>
          )}

          {isStarted && !showResult && (
            <>
              <div className="bg-white/5 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-white text-sm sm:text-base flex items-center gap-2">
                    <ListChecks className="w-5 h-5 text-green-400" />
                    Schritte ({completedSteps.length}/{exercise.steps.length})
                  </h4>
                  <div className="h-2 w-32 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 transition-all"
                      style={{ width: `${(completedSteps.length / exercise.steps.length) * 100}%` }}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  {exercise.steps.map((step, index) => (
                    <button
                      key={index}
                      onClick={() => toggleStep(index)}
                      className={`w-full flex items-start gap-3 p-3 rounded-lg transition-all text-left ${
                        completedSteps.includes(index)
                          ? 'bg-green-500/10 border border-green-500/30'
                          : 'bg-white/5 hover:bg-white/10 border border-transparent'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                        completedSteps.includes(index)
                          ? 'bg-green-500 text-white'
                          : 'bg-white/10 text-gray-400'
                      }`}>
                        {completedSteps.includes(index) ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          <span className="text-xs font-medium">{index + 1}</span>
                        )}
                      </div>
                      <span className={`text-sm ${
                        completedSteps.includes(index) ? 'text-green-300' : 'text-gray-300'
                      }`}>
                        {step}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-amber-500/10 rounded-lg p-4">
                <h4 className="font-semibold text-amber-400 text-sm sm:text-base mb-2">Erwartetes Ergebnis</h4>
                <p className="text-gray-300 text-sm sm:text-base">{exercise.expectedResult}</p>
              </div>

              <div className="bg-white/5 rounded-lg p-4">
                <h4 className="font-semibold text-white text-sm sm:text-base mb-3">Checkpoints</h4>
                <div className="flex flex-wrap gap-2">
                  {exercise.checkpoints.map((checkpoint, i) => (
                    <span 
                      key={i} 
                      className="text-xs bg-purple-500/20 text-purple-300 px-3 py-1.5 rounded-lg"
                    >
                      {checkpoint}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={handleComplete}
                disabled={!allStepsCompleted}
                className={`w-full py-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-all ${
                  allStepsCompleted
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:opacity-90'
                    : 'bg-white/10 text-gray-500 cursor-not-allowed'
                }`}
              >
                <CheckCircle2 className="w-5 h-5" />
                {allStepsCompleted ? 'Übung abschließen' : `Noch ${exercise.steps.length - completedSteps.length} Schritte offen`}
              </button>
            </>
          )}

          {showResult && (
            <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg p-4 sm:p-6 text-center">
              <Award className="w-10 h-10 sm:w-12 sm:h-12 text-green-400 mx-auto mb-3" />
              <h4 className="text-lg sm:text-xl font-bold text-white mb-2">Übung abgeschlossen!</h4>
              <p className="text-gray-300 text-sm sm:text-base mb-4">
                Du hast alle {exercise.steps.length} Schritte erfolgreich durchgeführt.
              </p>
              <div className="flex flex-wrap justify-center gap-2 mb-4">
                {exercise.skills.map((skill, i) => (
                  <span key={i} className="text-xs bg-green-500/20 text-green-300 px-3 py-1 rounded-full">
                    ✓ {skill}
                  </span>
                ))}
              </div>
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

export default function ToolConfigExercises() {
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [completedExercises, setCompletedExercises] = useState({});

  const weekData = toolConfigExercises.find(w => w.week === selectedWeek);
  const exercises = weekData?.exercises || [];

  const handleComplete = (exerciseId) => {
    setCompletedExercises(prev => ({
      ...prev,
      [exerciseId]: true
    }));
  };

  const getWeekStats = (weekNum) => {
    const week = toolConfigExercises.find(w => w.week === weekNum);
    if (!week) return { completed: 0, total: 0 };
    const completed = week.exercises.filter(e => completedExercises[e.id]).length;
    return { completed, total: week.exercises.length };
  };

  const totalCompleted = Object.keys(completedExercises).length;
  const totalExercises = toolConfigExercises.reduce((sum, w) => sum + w.exercises.length, 0);

  if (selectedExercise) {
    return (
      <ExerciseDetail 
        exercise={selectedExercise} 
        onBack={() => setSelectedExercise(null)}
        onComplete={handleComplete}
        isCompleted={completedExercises[selectedExercise.id]}
      />
    );
  }

  return (
    <div className="glass-card p-3 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-2 sm:p-3 rounded-xl bg-indigo-500/20 flex-shrink-0">
            <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-400" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base sm:text-xl font-bold text-white">Toolkonfiguration</h3>
            <p className="text-xs sm:text-sm text-gray-400 hidden sm:block">Hands-on Übungen auf der Testplattform</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl self-start sm:self-auto">
          <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
          <span className="text-white font-medium text-sm sm:text-base">{totalCompleted}/{totalExercises}</span>
          <span className="text-gray-400 text-xs sm:text-sm hidden sm:inline">abgeschlossen</span>
        </div>
      </div>
      
      {/* Wochen-Tabs - Horizontal scrollbar auf Mobile */}
      <div className="flex gap-1.5 sm:gap-2 mb-4 sm:mb-6 overflow-x-auto pb-2 -mx-3 px-3 sm:-mx-1 sm:px-1">
        {toolConfigExercises.map((week) => {
          const stats = getWeekStats(week.week);
          const isComplete = stats.completed === stats.total && stats.total > 0;
          return (
            <button
              key={week.week}
              onClick={() => setSelectedWeek(week.week)}
              className={`flex-shrink-0 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-all text-xs sm:text-sm ${
                selectedWeek === week.week
                  ? 'bg-indigo-500 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              } ${isComplete ? 'ring-2 ring-green-500' : ''}`}
            >
              <span className="whitespace-nowrap">W{week.week}</span>
              {stats.completed > 0 && (
                <span className="ml-1 text-[10px] sm:text-xs opacity-75">
                  {stats.completed}/{stats.total}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {weekData && (
        <div>
          <div className="mb-3 sm:mb-4">
            <h4 className="text-sm sm:text-lg font-semibold text-white">Woche {weekData.week}: {weekData.title}</h4>
          </div>
          
          <div className="space-y-2 sm:space-y-3">
            {exercises.map((exercise) => (
              <ExerciseCard 
                key={exercise.id}
                exercise={exercise} 
                isCompleted={completedExercises[exercise.id]}
                onStart={() => setSelectedExercise(exercise)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
