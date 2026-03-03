import { NavLink, Outlet } from 'react-router-dom';
import { useState } from 'react';
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
  HardDrive,
  Layers,
  Menu,
  X
} from 'lucide-react';
import { useProgress } from '../hooks/useLocalStorage';
import { weeks } from '../data/onboardingData';
import { useMemo } from 'react';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard', description: 'Übersicht' },
  { path: '/tracker', icon: CheckSquare, label: 'Aufgaben', description: 'Fortschritt tracken' },
  { path: '/flashcards', icon: Layers, label: 'Lernkarten', description: 'KI-Karteikarten' },
  { path: '/quiz', icon: Brain, label: 'Quiz', description: 'Wissen testen' },
  { path: '/ai-coach', icon: MessageSquare, label: 'KI Coach', description: 'Fragen stellen' },
  { path: '/calendar', icon: Calendar, label: 'Kalender', description: 'Meilensteine' },
  { path: '/resources', icon: BookOpen, label: 'Ressourcen', description: 'Lernmaterial' },
  { path: '/report', icon: Mail, label: 'Report', description: 'Exportieren' },
];

export default function Layout() {
  const { progress } = useProgress();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const totalProgress = useMemo(() => {
    const allTasks = weeks.flatMap(w => w.tasks);
    const completed = allTasks.filter(t => progress.tasks[t.id]).length;
    return Math.round((completed / allTasks.length) * 100);
  }, [progress]);

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 glass border-b border-white/5 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold gradient-text">Valkeen</span>
        </div>
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-xl glass"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar - fixed on desktop, overlay on mobile */}
      <aside className={`
        fixed lg:sticky top-0 left-0 h-screen p-4 lg:p-5 flex flex-col border-r border-white/5 z-50
        w-64 lg:w-52 xl:w-60 flex-shrink-0
        glass
        transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        {/* Logo - hidden on mobile (shown in header) */}
        <div className="hidden lg:flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold gradient-text">Valkeen</h1>
            <p className="text-xs text-white/40">Onboarding Hub</p>
          </div>
        </div>

        {/* Mobile: Close button area */}
        <div className="lg:hidden h-14" />

        {/* Quick Progress */}
        {progress.startDate && (
          <div className="mb-5 p-3 rounded-xl bg-white/5">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-white/60 text-xs">Fortschritt</span>
              <span className="font-bold text-indigo-400 text-sm">{totalProgress}%</span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-700"
                style={{ width: `${totalProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto">
          {navItems.map(({ path, icon: Icon, label }) => (
            <NavLink
              key={path}
              to={path}
              onClick={closeSidebar}
              className={({ isActive }) =>
                `nav-item flex items-center gap-3 text-sm ${
                  isActive ? 'active text-white' : 'text-white/50 hover:text-white'
                }`
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="font-medium truncate">{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User Info */}
        <div className="mt-auto pt-3 border-t border-white/5">
          <div className="flex items-center gap-3 p-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold">
              MM
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">Manu Manera</p>
              <p className="text-xs text-white/40">Onboarding</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content - takes remaining space */}
      <main className="flex-1 min-h-screen pt-16 lg:pt-0 overflow-x-hidden">
        <div className="p-4 sm:p-6 lg:p-8 xl:p-10 w-full">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
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
