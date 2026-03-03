import { NavLink, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Brain, 
  MessageSquare, 
  Calendar, 
  BookOpen,
  Mail,
  Settings,
  Sparkles,
  Database,
  HardDrive
} from 'lucide-react';
import { useProgress } from '../hooks/useLocalStorage';
import { weeks } from '../data/onboardingData';
import { useMemo } from 'react';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard', description: 'Übersicht' },
  { path: '/tracker', icon: CheckSquare, label: 'Aufgaben', description: 'Fortschritt tracken' },
  { path: '/quiz', icon: Brain, label: 'Quiz', description: 'Wissen testen' },
  { path: '/ai-coach', icon: MessageSquare, label: 'KI Coach', description: 'Fragen stellen' },
  { path: '/calendar', icon: Calendar, label: 'Kalender', description: 'Meilensteine' },
  { path: '/resources', icon: BookOpen, label: 'Ressourcen', description: 'Lernmaterial' },
  { path: '/report', icon: Mail, label: 'Report', description: 'Exportieren' },
];

export default function Layout() {
  const { progress } = useProgress();
  
  const totalProgress = useMemo(() => {
    const allTasks = weeks.flatMap(w => w.tasks);
    const completed = allTasks.filter(t => progress.tasks[t.id]).length;
    return Math.round((completed / allTasks.length) * 100);
  }, [progress]);

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-72 glass fixed h-screen p-6 flex flex-col border-r border-white/5">
        {/* Logo */}
        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold gradient-text">Valkeen</h1>
            <p className="text-xs text-white/40">Onboarding Hub</p>
          </div>
        </div>

        {/* Quick Progress */}
        {progress.startDate && (
          <div className="mb-8 p-4 rounded-2xl bg-white/5">
            <div className="flex items-center justify-between text-sm mb-3">
              <span className="text-white/60">Fortschritt</span>
              <span className="font-bold text-indigo-400">{totalProgress}%</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-700"
                style={{ width: `${totalProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 space-y-2">
          {navItems.map(({ path, icon: Icon, label }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `nav-item flex items-center gap-4 ${
                  isActive ? 'active text-white' : 'text-white/50 hover:text-white'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Storage Info */}
        <div className="mt-auto space-y-4">
          <div className="p-4 rounded-2xl bg-white/5">
            <div className="flex items-center gap-2 mb-2">
              <HardDrive className="w-4 h-4 text-green-400" />
              <span className="text-xs text-white/50 uppercase tracking-wider">Speicher</span>
            </div>
            <p className="text-sm text-white/60 leading-relaxed">
              Daten werden lokal im Browser gespeichert
            </p>
          </div>

          {/* User Info */}
          <div className="flex items-center gap-4 p-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold">
              MM
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium">Manu Manera</p>
              <p className="text-xs text-white/40">Onboarding</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-72 p-8 lg:p-12">
        <div className="max-w-5xl mx-auto">
          <Outlet />
        </div>
      </main>

      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-0 -left-32 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -right-32 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>
    </div>
  );
}
