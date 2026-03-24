import {
  ExternalLink,
  Users,
  Settings,
  Calendar,
  BarChart3,
  Clock,
  CheckCircle,
  Info,
  BookOpen,
  ChevronRight,
  Play,
  Sparkles,
} from 'lucide-react';

// Demo-Guides laufen auf AWS (public/*.html → /onboarding/*.html)
const STORY_URL = '/onboarding/tempus-story.html';
const PM_DEMO_URL = '/onboarding/tempus-demo-pm.html';
const RM_DEMO_URL = '/onboarding/tempus-demo-rm.html';
const RM_LIVE_URL = 'https://trial5.tempus-resource.com/slot4';

const demoEnvironments = [
  {
    id: 'rm',
    name: 'Resource Manager',
    description: 'Ressourcenplanung und -verwaltung',
    url: RM_DEMO_URL,
    icon: Users,
    color: 'from-blue-500 to-cyan-500',
    badge: null,
    features: [
      'Ressourcenübersicht & Kapazitätsplanung',
      'Skill-Management',
      'Net Availability',
      'Bulk Allocation / Flatgrid',
    ],
  },
  {
    id: 'pm',
    name: 'Project Manager',
    description: 'Vollständiges Demo-Script: Reto zeigt Peter, warum Tempus alles ändert',
    url: PM_DEMO_URL,
    icon: Calendar,
    color: 'from-purple-500 to-pink-500',
      badge: '11 Szenen · DE/EN',
    features: [
      'Story-getriebenes Demo-Script',
      'Projekt anlegen · Ressourcen zuweisen',
      'Planned & Actual Allocations',
      'Bulk Flatgrid · RAR2 Reports',
    ],
  },
  {
    id: 'admin',
    name: 'Admin Console',
    description: 'Systemkonfiguration und Einstellungen',
    url: RM_LIVE_URL,
    icon: Settings,
    color: 'from-orange-500 to-red-500',
    badge: null,
    features: [
      'Benutzerverwaltung',
      'Systemeinstellungen & Workflows',
      'Custom Fields',
      'Integrationen',
    ],
  },
  {
    id: 'reports',
    name: 'Reports & Analytics',
    description: 'Auswertungen und Dashboards',
    url: RM_LIVE_URL,
    icon: BarChart3,
    color: 'from-green-500 to-emerald-500',
    badge: null,
    features: [
      'Plan vs. Actual Report',
      'RAR2 Charts',
      'Auslastungsberichte',
      'Excel-Export',
    ],
  },
];

const quickTips = [
  { icon: Clock, text: 'Demo-Instanz: trial5.tempus-resource.com/slot4' },
  { icon: Users, text: 'Benutzer: Reto Renner · Filter: HR Campus = Ja' },
  { icon: CheckCircle, text: 'Modus: Projektverwaltung → Allocations (nicht Schedule)' },
];

export default function TempusDemo() {
  const openInNewTab = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-8">

      {/* ── HEADER ── */}
      <div>
        <h1 className="text-3xl font-bold mb-2">
          <span className="gradient-text">Tempus Demo</span>
        </h1>
        <p className="text-white/60">
          Interaktive Demo-Umgebung · trial5.tempus-resource.com/slot4
        </p>
      </div>

      {/* ── STORY PRÄSENTATION BANNER ── */}
      <div
        className="relative overflow-hidden rounded-2xl p-6 border border-cyan-400/30 cursor-pointer group"
        style={{ background: 'linear-gradient(135deg, rgba(8,145,178,.12) 0%, rgba(34,211,238,.06) 50%, rgba(10,15,30,.8) 100%)' }}
        onClick={() => openInNewTab(STORY_URL)}
      >
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{ background: 'linear-gradient(135deg, rgba(8,145,178,.18), rgba(34,211,238,.1))' }} />
        <div className="relative flex items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #0891b2, #22d3ee)' }}>
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-lg text-white">Interaktive Story-Präsentation</span>
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                  style={{ background: 'rgba(34,211,238,.15)', color: '#22d3ee', border: '1px solid rgba(34,211,238,.3)' }}>
                  NEU
                </span>
              </div>
              <p className="text-white/60 text-sm">
                Reto &amp; Peter · 10 Slides · echte Screenshots · cinematische Übergänge · klick-gesteuert
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {['Fullscreen', 'Story-driven', 'Keyboard-Navigation', 'Swipe-Support'].map(t => (
                  <span key={t} className="text-xs px-2 py-0.5 rounded bg-white/8 text-white/50 border border-white/10">{t}</span>
                ))}
              </div>
            </div>
          </div>
          <button
            className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white transition-all group-hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #0891b2, #22d3ee)', boxShadow: '0 0 24px rgba(8,145,178,.4)' }}
          >
            <Play className="w-4 h-4" />
            Präsentation starten
          </button>
        </div>
      </div>

      {/* ── SETUP STRIP ── */}
      <div className="glass rounded-2xl p-5 border border-amber-400/20 bg-amber-500/5">
        <div className="flex items-center gap-2 mb-3">
          <Info className="w-5 h-5 text-amber-400 flex-shrink-0" />
          <span className="font-semibold text-amber-300">Vor dem Start — technische Vorbereitung</span>
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          {quickTips.map((tip, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/5">
              <tip.icon className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-white/70">{tip.text}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-3">
          <div className="text-xs text-white/50 bg-white/5 px-3 py-1.5 rounded-lg font-mono">
            Projekte: Stardust (4), Apollo (22), Amber (40)
          </div>
          <div className="text-xs text-white/50 bg-white/5 px-3 py-1.5 rounded-lg">
            Fokus: Feb–Jun 2026
          </div>
          <div className="text-xs text-white/50 bg-white/5 px-3 py-1.5 rounded-lg">
            Konflikt: Marc — 8h (Stardust) + 4h (Apollo) = 12h/Tag im März
          </div>
        </div>
      </div>

      {/* ── DEMO CARDS ── */}
      <div className="grid sm:grid-cols-2 gap-6">
        {demoEnvironments.map((demo) => {
          const isPM = demo.id === 'pm';
          return (
            <div
              key={demo.id}
              className={`glass rounded-2xl p-6 border transition-all
                ${isPM
                  ? 'border-purple-400/30 bg-purple-500/5 hover:border-purple-400/50'
                  : 'border-white/10 hover:border-white/20'
                }`}
            >
              {/* Card top row */}
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${demo.color} flex items-center justify-center shadow-lg`}>
                  <demo.icon className="w-6 h-6 text-white" />
                </div>
                {demo.badge && (
                  <span className="text-xs px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/20 font-medium">
                    {demo.badge}
                  </span>
                )}
              </div>

              <h3 className="text-lg font-semibold mb-1">{demo.name}</h3>
              <p className="text-white/60 text-sm mb-4">{demo.description}</p>

              <div className="space-y-2 mb-6">
                {demo.features.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-white/50">
                    <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>

              {/* Button — all cards open in new tab */}
              <button
                onClick={() => openInNewTab(demo.url)}
                className={`w-full py-3 px-4 rounded-xl bg-gradient-to-r ${demo.color} text-white font-medium
                  hover:shadow-lg transition-all flex items-center justify-center gap-2
                  ${isPM ? 'hover:shadow-purple-500/20' : 'opacity-80'}`}
              >
                {isPM ? <Play className="w-4 h-4" /> : <ExternalLink className="w-4 h-4" />}
                Demo öffnen
              </button>
            </div>
          );
        })}
      </div>

      {/* ── QUICK LINKS ── */}
      <div className="glass rounded-2xl p-6 border border-white/10">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-400" />
          Weitere Ressourcen
        </h2>
        <div className="space-y-3">
          {[
            {
              href: STORY_URL,
              label: 'Story-Präsentation starten',
              sub: 'Interaktiv · Fullscreen · echte Screenshots',
              color: 'cyan',
            },
            {
              href: PM_DEMO_URL,
              label: 'PM Demo-Script direkt öffnen',
              sub: 'Reto & Peter · 11 Szenen · DE/EN',
              color: 'purple',
            },
            {
              href: RM_LIVE_URL,
              label: 'Tempus Live-Instanz',
              sub: 'trial5.tempus-resource.com/slot4',
              color: 'blue',
            },
          ].map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group"
            >
              <div className={`w-9 h-9 rounded-lg bg-${link.color}-500/20 flex items-center justify-content-center flex-shrink-0 flex items-center justify-center`}>
                <ChevronRight className={`w-5 h-5 text-${link.color}-400`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{link.label}</p>
                <p className="text-sm text-white/40 truncate font-mono">{link.sub}</p>
              </div>
              <ExternalLink className="w-4 h-4 text-white/30 group-hover:text-white/60 flex-shrink-0" />
            </a>
          ))}
        </div>
      </div>

    </div>
  );
}
