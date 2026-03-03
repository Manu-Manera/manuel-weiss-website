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
  Brain
} from 'lucide-react';
import ProgressRing from '../components/ProgressRing';
import { useProgress } from '../hooks/useLocalStorage';
import { weeks, phases, milestones } from '../data/onboardingData';
import { format, differenceInDays, addDays } from 'date-fns';
import { de } from 'date-fns/locale';

export default function Dashboard() {
  const { progress, setStartDate } = useProgress();

  const stats = useMemo(() => {
    const allTasks = weeks.flatMap(w => w.tasks);
    const completedTasks = allTasks.filter(t => progress.tasks[t.id]);
    const totalProgress = (completedTasks.length / allTasks.length) * 100;

    const currentDay = progress.startDate 
      ? differenceInDays(new Date(), new Date(progress.startDate)) + 1
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

    return {
      totalProgress,
      completedTasks: completedTasks.length,
      totalTasks: allTasks.length,
      currentDay,
      currentPhase,
      currentWeek,
      weekProgress,
      weekCompleted,
      nextMilestone,
      daysToMilestone: nextMilestone ? nextMilestone.day - currentDay : 0
    };
  }, [progress]);

  const handleStartOnboarding = () => {
    setStartDate(new Date().toISOString());
  };

  if (!progress.startDate) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="glass-card p-10 text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center glow animate-float">
            <Play className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-3">Willkommen bei Valkeen!</h1>
          <p className="text-white/60 mb-6 text-sm">
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-base text-white/50">
            Tag {stats.currentDay} von 90 • Phase {stats.currentPhase}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-white/40">Gestartet am</p>
          <p className="text-lg font-medium">
            {format(new Date(progress.startDate), 'dd. MMMM yyyy', { locale: de })}
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 flex items-center justify-center">
              <TrendingUp className="w-7 h-7 text-indigo-400" />
            </div>
            <div>
              <p className="text-sm text-white/50 mb-1">Fortschritt</p>
              <p className="text-3xl font-bold">{Math.round(stats.totalProgress)}%</p>
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-green-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-white/50 mb-1">Erledigt</p>
              <p className="text-3xl font-bold">{stats.completedTasks}<span className="text-lg text-white/40">/{stats.totalTasks}</span></p>
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/20 flex items-center justify-center">
              <Clock className="w-7 h-7 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-white/50 mb-1">Tag</p>
              <p className="text-3xl font-bold">{stats.currentDay}<span className="text-lg text-white/40">/90</span></p>
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 flex items-center justify-center">
              <Target className="w-7 h-7 text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-white/50 mb-1">Meilenstein</p>
              <p className="text-3xl font-bold">{stats.daysToMilestone}<span className="text-lg text-white/40"> Tage</span></p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Progress Ring */}
        <div className="lg:col-span-5 glass-card p-8 flex flex-col items-center justify-center">
          <ProgressRing progress={stats.totalProgress} size={200} strokeWidth={14} />
          <p className="mt-6 text-base text-white/50">
            {stats.completedTasks} von {stats.totalTasks} Aufgaben erledigt
          </p>
        </div>

        {/* Current Week */}
        <div className="lg:col-span-7 glass-card p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm text-white/40 uppercase tracking-wider mb-2">Aktuelle Woche</p>
              <h2 className="text-xl font-bold">{stats.currentWeek.name}</h2>
            </div>
            <Link 
              to="/tracker" 
              className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-2"
            >
              Alle anzeigen <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-white/50">Woche {stats.currentWeek.id}</span>
              <span className="font-medium">{stats.weekCompleted}/{stats.currentWeek.tasks.length}</span>
            </div>
            <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                style={{ width: `${stats.weekProgress}%` }}
              />
            </div>
          </div>

          {/* Tasks */}
          <div className="space-y-3">
            {stats.currentWeek.tasks.slice(0, 4).map(task => (
              <div 
                key={task.id}
                className={`flex items-center gap-4 p-4 rounded-xl ${
                  progress.tasks[task.id] ? 'bg-green-500/10' : 'bg-white/5'
                }`}
              >
                {progress.tasks[task.id] ? (
                  <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 text-white/30 flex-shrink-0" />
                )}
                <span className={`text-base ${progress.tasks[task.id] ? 'text-white/40 line-through' : ''}`}>
                  {task.text}
                </span>
              </div>
            ))}
            {stats.currentWeek.tasks.length > 4 && (
              <p className="text-sm text-white/40 text-center pt-2">
                +{stats.currentWeek.tasks.length - 4} weitere Aufgaben
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Phases */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Phasen-Übersicht</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                className={`glass-card p-6 ${isActive ? 'ring-2 ring-indigo-500/50' : ''}`}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold"
                    style={{ backgroundColor: `${phase.color}20`, color: phase.color }}
                  >
                    {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : phase.id}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold">{phase.name}</p>
                    <p className="text-sm text-white/40">Tag {phase.days}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-white/50">{phaseCompleted}/{phaseTasks.length} Aufgaben</span>
                  <span className="font-bold" style={{ color: phase.color }}>
                    {Math.round(phaseProgress)}%
                  </span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
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

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/tracker" className="glass-card p-6 hover:bg-white/10 transition-colors group">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 flex items-center justify-center group-hover:bg-indigo-500/30 transition-colors">
              <Zap className="w-7 h-7 text-indigo-400" />
            </div>
            <div>
              <p className="font-semibold text-lg">Aufgaben fortsetzen</p>
              <p className="text-sm text-white/50">{stats.totalTasks - stats.completedTasks} offen</p>
            </div>
          </div>
        </Link>

        <Link to="/quiz" className="glass-card p-6 hover:bg-white/10 transition-colors group">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/20 flex items-center justify-center group-hover:bg-purple-500/30 transition-colors">
              <Brain className="w-7 h-7 text-purple-400" />
            </div>
            <div>
              <p className="font-semibold text-lg">Wissen testen</p>
              <p className="text-sm text-white/50">Quiz starten</p>
            </div>
          </div>
        </Link>

        <Link to="/resources" className="glass-card p-6 hover:bg-white/10 transition-colors group">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 flex items-center justify-center group-hover:bg-amber-500/30 transition-colors">
              <BookOpen className="w-7 h-7 text-amber-400" />
            </div>
            <div>
              <p className="font-semibold text-lg">Ressourcen</p>
              <p className="text-sm text-white/50">Lernmaterial ansehen</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Next Milestone */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
            <Target className="w-8 h-8 text-amber-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-white/50 mb-1">Nächster Meilenstein</p>
            <p className="text-xl font-bold">{stats.nextMilestone.title}</p>
            <p className="text-sm text-white/50 mt-1">{stats.nextMilestone.description}</p>
          </div>
          <div className="text-right">
            <p className="text-4xl font-bold gradient-text">{stats.daysToMilestone}</p>
            <p className="text-sm text-white/50">Tage</p>
          </div>
        </div>
      </div>
    </div>
  );
}
