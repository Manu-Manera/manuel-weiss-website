import { useState } from 'react';
import {
  Play,
  ExternalLink,
  Monitor,
  Users,
  Settings,
  Calendar,
  BarChart3,
  Clock,
  CheckCircle,
  Info,
  Maximize2,
  Minimize2,
  BookOpen,
  X,
  ChevronRight
} from 'lucide-react';

// PM Demo läuft lokal auf AWS (public/tempus-demo-pm.html → /onboarding/tempus-demo-pm.html)
const PM_DEMO_URL = '/onboarding/tempus-demo-pm.html';

const demoEnvironments = [
  {
    id: 'rm',
    name: 'Resource Manager',
    description: 'Ressourcenplanung und -verwaltung',
    url: 'https://trial5.tempus-resource.com/slot4',
    embedUrl: null,
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
    embedUrl: PM_DEMO_URL,
    icon: Calendar,
    color: 'from-purple-500 to-pink-500',
    badge: '13 Szenen · DE/EN',
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
    url: 'https://trial5.tempus-resource.com/slot4',
    embedUrl: null,
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
    url: 'https://trial5.tempus-resource.com/slot4',
    embedUrl: null,
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

const demoInstance = {
  url: 'trial5.tempus-resource.com/slot4',
  user: 'Reto Renner',
  projects: 'Stardust (4), Apollo (22), Amber (40)',
  focus: 'Feb–Jun 2026',
};

const quickTips = [
  { icon: Clock, text: 'Demo-Instanz: trial5.tempus-resource.com/slot4' },
  { icon: Users, text: 'Benutzer: Reto Renner · Filter: HR Campus = Ja' },
  { icon: CheckCircle, text: 'Modus: Projektverwaltung → Allocations (nicht Schedule)' },
];

export default function TempusDemo() {
  const [openDemo, setOpenDemo] = useState(null); // { id, name, url, color, icon }
  const [isFullscreen, setIsFullscreen] = useState(false);

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
            Projekte: {demoInstance.projects}
          </div>
          <div className="text-xs text-white/50 bg-white/5 px-3 py-1.5 rounded-lg">
            Fokus: {demoInstance.focus}
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

              {/* Buttons */}
              {isPM ? (
                // PM: zwei dedizierte Buttons
                <div className="flex gap-3">
                  <button
                    onClick={() => { setOpenDemo(demo); setIsFullscreen(false); }}
                    className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium
                      hover:shadow-lg hover:shadow-purple-500/20 transition-all flex items-center justify-center gap-2"
                  >
                    <Play className="w-4 h-4" />
                    Demo öffnen
                  </button>
                  <button
                    onClick={() => openInNewTab(demo.url)}
                    className="p-3 rounded-xl bg-white/10 hover:bg-white/15 transition-colors"
                    title="In neuem Tab öffnen"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => openInNewTab(demo.url)}
                  className={`w-full py-3 px-4 rounded-xl bg-gradient-to-r ${demo.color} text-white font-medium
                    hover:shadow-lg transition-all flex items-center justify-center gap-2 opacity-80`}
                >
                  <ExternalLink className="w-4 h-4" />
                  In Tempus öffnen
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* ── EMBEDDED VIEWER (PM DEMO) ── */}
      {openDemo && (
        <div
          className={`
            rounded-2xl border border-white/10 overflow-hidden shadow-2xl
            ${isFullscreen
              ? 'fixed inset-3 z-[200] flex flex-col'
              : 'flex flex-col'
            }
          `}
          style={{ background: '#0f1729' }}
        >
          {/* Toolbar */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/5 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${openDemo.color} flex items-center justify-center`}>
                <openDemo.icon className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-semibold text-sm">{openDemo.name} — Demo Script</p>
                <p className="text-xs text-white/40 font-mono">{openDemo.url}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                title={isFullscreen ? 'Verkleinern' : 'Vollbild'}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => openInNewTab(openDemo.url)}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                title="In neuem Tab öffnen"
              >
                <ExternalLink className="w-4 h-4" />
              </button>
              <button
                onClick={() => { setOpenDemo(null); setIsFullscreen(false); }}
                className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 text-white/60 hover:text-red-400 transition-colors"
                title="Schließen"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* iFrame */}
          <div className={`bg-white ${isFullscreen ? 'flex-1' : 'h-[75vh]'}`}>
            <iframe
              src={openDemo.embedUrl}
              className="w-full h-full border-0"
              title={openDemo.name}
            />
          </div>
        </div>
      )}

      {/* ── QUICK LINKS ── */}
      <div className="glass rounded-2xl p-6 border border-white/10">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-400" />
          Weitere Ressourcen
        </h2>
        <div className="space-y-3">
          {[
            {
              href: PM_DEMO_URL,
              label: 'PM Demo-Script direkt öffnen',
              sub: 'Reto & Peter · 13 Szenen · DE/EN',
              color: 'purple',
            },
            {
              href: 'https://trial5.tempus-resource.com/slot4',
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
              <div className={`w-9 h-9 rounded-lg bg-${link.color}-500/20 flex items-center justify-center flex-shrink-0`}>
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
