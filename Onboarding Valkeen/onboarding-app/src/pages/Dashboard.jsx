import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  Clock, 
  Target, 
  Award,
  ArrowRight,
  CheckCircle2,
  Circle,
  Play,
  Zap,
  BookOpen,
  Brain,
  Settings,
  Users,
  Dumbbell
} from 'lucide-react';
import ProgressRing from '../components/ProgressRing';
import { useProgress } from '../hooks/useLocalStorage';
import { weeks, phases, milestones, practiceExercises, toolConfigExercises, scenarioExercises } from '../data/onboardingData';
import { format, differenceInCalendarDays, startOfDay } from 'date-fns';
import { de } from 'date-fns/locale';

export default function Dashboard() {
  const { progress, setStartDate } = useProgress();

  const stats = useMemo(() => {
    const allTasks = weeks.flatMap(w => w.tasks);
    const completedTasks = allTasks.filter(t => progress.tasks[t.id]);
    const totalProgress = (completedTasks.length / allTasks.length) * 100;

    // Fix: Verwende differenceInCalendarDays für korrekte Tagesberechnung
    const currentDay = progress.startDate 
      ? differenceInCalendarDays(startOfDay(new Date()), startOfDay(new Date(progress.startDate))) + 1
      : 0;

    const currentPhase = currentDay <= 30 ? 1 : currentDay <= 60 ? 2 : 3;
    
    const currentWeek = weeks.find(w => {
      const [start, end] = w.days.split('-').map(Number);
      return currentDay >= start && currentDay <= end;
    }) || weeks[0];

    const weekTasks = currentWeek.tasks;
    const weekCompleted = weekTasks.filter(t => progress.tasks[t.id]).length;
    const weekProgress = (weekCompleted / weekTasks.length) * 100;

    const nextMilestone = milestones.find(m => m.day > currentDay) || milestones[milestones.length - 1];

    // Übungen-Stats
    const totalPracticeExercises = practiceExercises?.length || 0;
    const totalToolExercises = toolConfigExercises?.reduce((sum, m) => sum + m.exercises.length, 0) || 0;
    const totalScenarios = scenarioExercises?.reduce((sum, c) => sum + c.scenarios.length, 0) || 0;

    return {
      totalProgress,
      completedTasks: completedTasks.length,
      totalTasks: allTasks.length,
      currentDay: Math.max(1, currentDay),
      currentPhase,
      currentWeek,
      weekProgress,
      weekCompleted,
      nextMilestone,
      daysToMilestone: Math.max(0, nextMilestone ? nextMilestone.day - currentDay : 0),
      totalPracticeExercises,
      totalToolExercises,
      totalScenarios
    };
  }, [progress]);

  const handleStartOnboarding = () => {
    setStartDate(new Date().toISOString());
  };

  if (!progress.startDate) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="glass-card p-6 sm:p-10 text-center max-w-md w-full">
          <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-6 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center glow animate-float">
            <Play className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3">Willkommen bei Valkeen!</h1>
          <p className="text-white/60 mb-4 sm:mb-6 text-sm">
            Starte dein 90-Tage Onboarding und werde zum Tempus Resource Experten.
          </p>
          <button 
            onClick={handleStartOnboarding}
            className="glass-button w-full py-3"
          >
            Onboarding starten
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 lg:space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 pb-1">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1">Dashboard</h1>
          <p className="text-xs sm:text-sm text-white/50">
            Tag {stats.currentDay} von 90 • Phase {stats.currentPhase}
          </p>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-xs text-white/40">Gestartet am</p>
          <p className="text-sm sm:text-base font-medium">
            {format(new Date(progress.startDate), 'dd. MMM yyyy', { locale: de })}
          </p>
        </div>
      </div>

      {/* Quick Stats - 2x2 Grid auf Mobile */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <div className="glass-card p-3 sm:p-4 lg:p-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-400" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs text-white/50">Fortschritt</p>
              <p className="text-lg sm:text-2xl font-bold">{Math.round(stats.totalProgress)}%</p>
            </div>
          </div>
        </div>

        <div className="glass-card p-3 sm:p-4 lg:p-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-green-500/20 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs text-white/50">Erledigt</p>
              <p className="text-lg sm:text-2xl font-bold">{stats.completedTasks}<span className="text-sm sm:text-base text-white/40">/{stats.totalTasks}</span></p>
            </div>
          </div>
        </div>

        <div className="glass-card p-3 sm:p-4 lg:p-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs text-white/50">Tag</p>
              <p className="text-lg sm:text-2xl font-bold">{stats.currentDay}<span className="text-sm sm:text-base text-white/40">/90</span></p>
            </div>
          </div>
        </div>

        <div className="glass-card p-3 sm:p-4 lg:p-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
              <Target className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs text-white/50">Meilenstein</p>
              <p className="text-lg sm:text-2xl font-bold">{stats.daysToMilestone}<span className="text-sm sm:text-base text-white/40"> Tage</span></p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Stack auf Mobile, Side-by-Side auf Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        {/* Progress Ring - Kleiner auf Mobile */}
        <div className="lg:col-span-4 glass-card p-4 sm:p-6 flex flex-col items-center justify-center">
          <ProgressRing progress={stats.totalProgress} size={120} strokeWidth={10} className="sm:hidden" />
          <ProgressRing progress={stats.totalProgress} size={160} strokeWidth={12} className="hidden sm:block lg:hidden" />
          <ProgressRing progress={stats.totalProgress} size={180} strokeWidth={14} className="hidden lg:block" />
          <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-white/50 text-center">
            {stats.completedTasks} von {stats.totalTasks} Aufgaben
          </p>
        </div>

        {/* Current Week */}
        <div className="lg:col-span-8 glass-card p-4 sm:p-6">
          <div className="flex items-center justify-between gap-2 mb-3 sm:mb-4">
            <div>
              <p className="text-[10px] sm:text-xs text-white/40 uppercase tracking-wider">Aktuelle Woche</p>
              <h2 className="text-sm sm:text-lg font-bold">{stats.currentWeek.name}</h2>
            </div>
            <Link 
              to="/tracker" 
              className="text-xs sm:text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              Alle <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
            </Link>
          </div>

          {/* Progress Bar */}
          <div className="mb-3 sm:mb-4">
            <div className="flex justify-between text-[10px] sm:text-xs mb-1.5">
              <span className="text-white/50">Woche {stats.currentWeek.id}</span>
              <span className="font-medium">{stats.weekCompleted}/{stats.currentWeek.tasks.length}</span>
            </div>
            <div className="h-1.5 sm:h-2 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                style={{ width: `${stats.weekProgress}%` }}
              />
            </div>
          </div>

          {/* Tasks - Weniger auf Mobile */}
          <div className="space-y-1.5 sm:space-y-2">
            {stats.currentWeek.tasks.slice(0, 3).map(task => (
              <div 
                key={task.id}
                className={`flex items-start gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg ${
                  progress.tasks[task.id] ? 'bg-green-500/10' : 'bg-white/5'
                }`}
              >
                {progress.tasks[task.id] ? (
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <Circle className="w-4 h-4 sm:w-5 sm:h-5 text-white/30 flex-shrink-0 mt-0.5" />
                )}
                <span className={`text-xs sm:text-sm leading-relaxed ${progress.tasks[task.id] ? 'text-white/40 line-through' : ''}`}>
                  {task.text}
                </span>
              </div>
            ))}
            {stats.currentWeek.tasks.length > 3 && (
              <Link to="/tracker" className="block text-[10px] sm:text-xs text-indigo-400 text-center pt-1 hover:text-indigo-300">
                +{stats.currentWeek.tasks.length - 3} weitere Aufgaben
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Übungen & Lernen - NEU */}
      <div>
        <h2 className="text-sm sm:text-base font-semibold mb-3 sm:mb-4 flex items-center gap-2">
          <Dumbbell className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
          Übungen & Lernen
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
          <Link to="/quiz" className="glass-card p-3 sm:p-4 hover:bg-white/10 transition-colors group">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-purple-500/30 transition-colors">
                <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
              </div>
              <div className="min-w-0">
                <p className="font-medium text-xs sm:text-sm">Wissens-Quiz</p>
                <p className="text-[10px] sm:text-xs text-white/50">105 Fragen</p>
              </div>
            </div>
          </Link>

          <Link to="/quiz?tab=practice" className="glass-card p-3 sm:p-4 hover:bg-white/10 transition-colors group">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-green-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-green-500/30 transition-colors">
                <Target className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
              </div>
              <div className="min-w-0">
                <p className="font-medium text-xs sm:text-sm">Praxisübungen</p>
                <p className="text-[10px] sm:text-xs text-white/50">{stats.totalPracticeExercises} Story-Übungen</p>
              </div>
            </div>
          </Link>

          <Link to="/quiz?tab=toolconfig" className="glass-card p-3 sm:p-4 hover:bg-white/10 transition-colors group">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-500/30 transition-colors">
                <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-400" />
              </div>
              <div className="min-w-0">
                <p className="font-medium text-xs sm:text-sm">Tool-Konfig</p>
                <p className="text-[10px] sm:text-xs text-white/50">{stats.totalToolExercises} Übungen</p>
              </div>
            </div>
          </Link>

          <Link to="/quiz?tab=scenarios" className="glass-card p-3 sm:p-4 hover:bg-white/10 transition-colors group">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-amber-500/30 transition-colors">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
              </div>
              <div className="min-w-0">
                <p className="font-medium text-xs sm:text-sm">Szenarien</p>
                <p className="text-[10px] sm:text-xs text-white/50">{stats.totalScenarios} Situationen</p>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Phases - Horizontal scrollbar auf Mobile */}
      <div>
        <h2 className="text-sm sm:text-base font-semibold mb-3 sm:mb-4">Phasen-Übersicht</h2>
        <div className="flex lg:grid lg:grid-cols-3 gap-3 sm:gap-4 overflow-x-auto pb-2 -mx-4 px-4 lg:mx-0 lg:px-0 lg:overflow-visible">
          {phases.map((phase) => {
            const phaseWeeks = weeks.filter(w => w.phase === phase.id);
            const phaseTasks = phaseWeeks.flatMap(w => w.tasks);
            const phaseCompleted = phaseTasks.filter(t => progress.tasks[t.id]).length;
            const phaseProgress = (phaseCompleted / phaseTasks.length) * 100;
            const isActive = stats.currentPhase === phase.id;
            const isCompleted = phaseProgress === 100;

            return (
              <div 
                key={phase.id}
                className={`glass-card p-3 sm:p-4 flex-shrink-0 w-[260px] sm:w-[280px] lg:w-auto ${isActive ? 'ring-2 ring-indigo-500/50' : ''}`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div 
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-sm sm:text-base font-bold flex-shrink-0"
                    style={{ backgroundColor: `${phase.color}20`, color: phase.color }}
                  >
                    {isCompleted ? <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" /> : phase.id}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm sm:text-base truncate">{phase.name}</p>
                    <p className="text-[10px] sm:text-xs text-white/40">Tag {phase.days}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-[10px] sm:text-xs mb-1.5">
                  <span className="text-white/50">{phaseCompleted}/{phaseTasks.length} Aufgaben</span>
                  <span className="font-bold" style={{ color: phase.color }}>
                    {Math.round(phaseProgress)}%
                  </span>
                </div>
                <div className="h-1.5 sm:h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${phaseProgress}%`, backgroundColor: phase.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Actions - Kompakter auf Mobile */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <Link to="/tracker" className="glass-card p-3 sm:p-5 hover:bg-white/10 transition-colors group text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-500/30 transition-colors">
              <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-400" />
            </div>
            <div className="min-w-0">
              <p className="font-medium text-xs sm:text-base">Aufgaben</p>
              <p className="text-[10px] sm:text-sm text-white/50 hidden sm:block">{stats.totalTasks - stats.completedTasks} offen</p>
            </div>
          </div>
        </Link>

        <Link to="/flashcards" className="glass-card p-3 sm:p-5 hover:bg-white/10 transition-colors group text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-purple-500/30 transition-colors">
              <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
            </div>
            <div className="min-w-0">
              <p className="font-medium text-xs sm:text-base">Lernkarten</p>
              <p className="text-[10px] sm:text-sm text-white/50 hidden sm:block">Wissen festigen</p>
            </div>
          </div>
        </Link>

        <Link to="/resources" className="glass-card p-3 sm:p-5 hover:bg-white/10 transition-colors group text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-amber-500/30 transition-colors">
              <Award className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
            </div>
            <div className="min-w-0">
              <p className="font-medium text-xs sm:text-base">Ressourcen</p>
              <p className="text-[10px] sm:text-sm text-white/50 hidden sm:block">Material ansehen</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Next Milestone - Kompakter auf Mobile */}
      <div className="glass-card p-3 sm:p-5">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center flex-shrink-0">
            <Target className="w-6 h-6 sm:w-7 sm:h-7 text-amber-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] sm:text-xs text-white/50">Nächster Meilenstein</p>
            <p className="text-sm sm:text-lg font-bold truncate">{stats.nextMilestone.title}</p>
            <p className="text-[10px] sm:text-xs text-white/50 line-clamp-1 hidden sm:block">{stats.nextMilestone.description}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-2xl sm:text-3xl font-bold gradient-text">{stats.daysToMilestone}</p>
            <p className="text-[10px] sm:text-xs text-white/50">Tage</p>
          </div>
        </div>
      </div>
    </div>
  );
}
