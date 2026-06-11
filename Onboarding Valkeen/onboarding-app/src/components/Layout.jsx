import { NavLink, Outlet } from 'react-router-dom';
import { useState } from 'react';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Brain, 
  MessageSquare, 
  Calendar, 
  BookOpen,
  ClipboardList,
  Mail,
  MailPlus,
  GraduationCap,
  Settings,
  Sparkles,
  Shield,
  Layers,
  Menu,
  X,
  Monitor,
  GitBranch,
  ExternalLink,
  Puzzle,
  FileText,
  Target,
  Presentation,
  MousePointer2,
  GanttChartSquare,
} from 'lucide-react';
import { useProgress } from '../hooks/useLocalStorage';
import { weeks } from '../data/onboardingData';
import { useMemo } from 'react';

/** Absolute URL zum Workshop (Volldisplay), für target="_blank" mit korrektem Vite-BASE_URL */
function workshopWindowHref() {
  const base = import.meta.env.BASE_URL || '/';
  return new URL('change-workflow', window.location.origin + base).href;
}

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard', description: 'Übersicht' },
  { path: '/tracker', icon: CheckSquare, label: 'Aufgaben', description: 'Fortschritt tracken' },
  {
    path: '/tagesvertrag',
    icon: ClipboardList,
    label: 'Tagesvertrag',
    description: '20-Min-Fokus · AWS',
  },
  {
    path: '/feedback-framework',
    icon: Target,
    label: 'Feedback',
    description: 'Ramp-Up Review · AWS',
  },
  { path: '/flashcards', icon: Layers, label: 'Lernkarten', description: 'KI-Karteikarten' },
  { path: '/quiz', icon: Brain, label: 'Quiz', description: 'Wissen testen' },
  { path: '/sso-setup', icon: Shield, label: 'SSO Setup', description: 'Azure ↔ Tempus' },
  { path: '/ai-coach', icon: MessageSquare, label: 'KI Coach', description: 'Fragen stellen' },
  { path: '/calendar', icon: Calendar, label: 'Kalender', description: 'Meilensteine' },
  { path: '/resources', icon: BookOpen, label: 'Ressourcen', description: 'Lernmaterial' },
  { path: '/report', icon: Mail, label: 'Report', description: 'Exportieren' },
  { path: '/training', icon: GraduationCap, label: 'Training', description: 'Tempus RM/PM/Admin' },
  { path: '/training-admin', icon: Settings, label: 'Training Admin', description: 'Inhalte bearbeiten' },
  { path: '/tempus-demo', icon: Monitor, label: 'Tempus Demo', description: 'Live Demo-Umgebung' },
  {
    path: '/implementation-studio',
    icon: Presentation,
    label: 'Implementation Studio',
    description: 'Leitfaden · Workshops · Plan · Branding',
  },
  {
    path: '/implementation-plan',
    icon: GanttChartSquare,
    label: 'Projektplan',
    description: 'Gantt · Tasks · To-dos · Termine',
  },
  {
    path: '/implementation-log',
    icon: ClipboardList,
    label: 'Projekt-Log',
    description: 'Meetings · Action Items · Entscheidungen',
  },
  {
    path: '/kickoff-studio',
    icon: Presentation,
    label: 'Kick-off Deck',
    description: 'Workshop · Vollbild · PDF · Gamma',
  },
  { path: '/login-mailer', icon: MailPlus, label: 'Login Mailer', description: 'Entwürfe aus Excel' },
  { path: '/qrg-builder', icon: FileText, label: 'QRG Builder', description: 'Quick Reference Guides pro Kunde' },
  {
    workshopNewWindow: true,
    icon: GitBranch,
    label: 'Change Workflow',
    description: 'Workshop (neues Fenster)',
  },
  { path: '/tempus-trainer', icon: Puzzle, label: 'Tempus Trainer', description: 'Extension · Live-Touren' },
  { path: '/mouse-automation', icon: MousePointer2, label: 'Drag & Drop', description: 'Koordinaten · Seite' },
  { path: '/tempus-trainer-admin', icon: Settings, label: 'Trainer Admin', description: 'Touren · Folien · Kunden' },
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
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar - fixed on desktop, overlay on mobile */}
      <aside className={`
        fixed lg:sticky top-0 left-0 h-screen p-5 lg:p-6 flex flex-col border-r border-white/5 z-[60] lg:z-50
        w-72 lg:w-56 xl:w-64 flex-shrink-0
        glass
        transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        {/* Logo - hidden on mobile (shown in header) */}
        <div className="hidden lg:flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold gradient-text">Valkeen</h1>
            <p className="text-xs text-white/40">Onboarding Hub</p>
          </div>
        </div>

        {/* Quick Progress */}
        {progress.startDate && (
          <div className="mb-6 p-4 rounded-2xl bg-white/5 border border-white/5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-white/60 text-sm">Fortschritt</span>
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

        {/* Navigation - mehr Abstand zwischen Items */}
        <nav className="flex-1 min-h-0 space-y-2 overflow-y-auto pr-1">
          {navItems.map((item) => {
            const { path, icon: Icon, label, workshopNewWindow } = item;

            if (workshopNewWindow) {
              return (
                <a
                  key="change-workflow-workshop"
                  href={workshopWindowHref()}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={closeSidebar}
                  className="nav-item flex items-center gap-4 text-white/50 hover:text-white"
                  title="Öffnet den Change-Workshop in einem neuen Fenster – ideal für Kundentermine"
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium flex-1 min-w-0">{label}</span>
                  <ExternalLink className="w-4 h-4 shrink-0 opacity-45" aria-hidden />
                </a>
              );
            }

            return (
              <NavLink
                key={path}
                to={path}
                onClick={closeSidebar}
                className={({ isActive }) =>
                  `nav-item flex items-center gap-4 ${
                    isActive ? 'active text-white' : 'text-white/50 hover:text-white'
                  }`
                }
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium">{label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Profil fest unten (Navigation scrollt darüber mit min-h-0) */}
        <div className="mt-auto shrink-0 pt-4 border-t border-white/5">
          <div className="flex items-center gap-4 p-3 rounded-2xl hover:bg-white/5 transition-colors cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold shadow-lg shadow-indigo-500/20">
              MM
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">Manu Manera</p>
              <p className="text-sm text-white/40">Onboarding</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main: Mobile-Header sticky im Fluss (nicht fixed) – vermeidet Überdeckung/Klickfallen, z. B. Cursor Simple Browser */}
      <main className="flex-1 min-h-screen flex flex-col lg:block overflow-x-hidden pt-0">
        <header className="lg:hidden sticky top-0 z-50 shrink-0 glass border-b border-white/5 px-4 py-3 flex items-center justify-between safe-area-top min-h-[72px] sm:min-h-[80px] pointer-events-none">
          <div className="flex items-center gap-3 pointer-events-auto">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold gradient-text text-lg">Valkeen</span>
              <p className="text-xs text-white/40 -mt-0.5">Onboarding Hub</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-3 rounded-2xl glass hover:bg-white/10 transition-colors pointer-events-auto"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </header>
        <div className="flex-1 px-3 pt-6 pb-20 sm:px-5 sm:pt-8 sm:pb-24 lg:px-6 lg:pt-10 lg:pb-28 xl:px-8 2xl:px-10 xl:pb-32 w-full">
          <div className="max-w-[56rem] lg:max-w-[72rem] xl:max-w-[90rem] 2xl:max-w-[100rem] mx-auto">
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
