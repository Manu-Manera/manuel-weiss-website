import { useState, useEffect, useMemo, useCallback } from 'react';
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
  Grid3X3,
  FileUp,
} from 'lucide-react';
import DemoWordImportWizard from '../components/demo/DemoWordImportWizard';
import { fetchDemoCatalog, customDemoUrl } from '../services/demoCatalogService';

const STORY_URL = '/onboarding/tempus-story.html';
const PM_DEMO_URL = '/onboarding/tempus-demo-pm.html';
const RM_DEMO_URL = '/onboarding/tempus-demo-rm.html';
const BPAFG_DEMO_URL = '/onboarding/tempus-demo-bpafg.html';
const TEAM_RESOURCES_DEMO_URL = '/onboarding/tempus-demo-team-resources.html';
const RM_LIVE_URL = 'https://trial5.tempus-resource.com/slot4';

const ICON_MAP = {
  users: Users,
  calendar: Calendar,
  grid: Grid3X3,
  settings: Settings,
  chart: BarChart3,
  sparkles: Sparkles,
};

const BUILTIN_DEMOS = [
  {
    id: 'rm',
    name: 'Resource Manager',
    description: 'Ressourcenplanung und -verwaltung',
    url: RM_DEMO_URL,
    icon: Users,
    color: 'from-blue-500 to-cyan-500',
    badge: null,
    builtin: true,
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
    builtin: true,
    features: [
      'Story-getriebenes Demo-Script',
      'Projekt anlegen · Ressourcen zuweisen',
      'Planned & Actual Allocations',
      'Bulk Flatgrid · RAR2 Reports',
    ],
  },
  {
    id: 'bpafg',
    name: 'BPAFG Deep Dive',
    description: 'Bulk Project Allocation Flatgrid — das Herzstück für Resource Manager',
    url: BPAFG_DEMO_URL,
    icon: Grid3X3,
    color: 'from-teal-500 to-cyan-500',
    badge: '8 Blöcke · DE/EN',
    builtin: true,
    features: [
      '3 Modi: Default, Resource, Project',
      'View Management & Grid Features',
      'Optionen: Heatmaps, Net Availability',
      'Resource Replace Advanced',
    ],
  },
  {
    id: 'team-resources',
    name: 'Team Resources',
    description: 'Teams als planbare Einheit — für Agile, Waterfall oder gemischte Methoden',
    url: TEAM_RESOURCES_DEMO_URL,
    icon: Users,
    color: 'from-emerald-500 to-teal-500',
    badge: '4 Blocks · DE/EN',
    builtin: true,
    features: [
      'Team Capacity & Inclusion %',
      'Story Points für agile Teams',
      'Net Availability & BPAFG',
      'Resource Requests & Replace',
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
    builtin: true,
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
    builtin: true,
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

function resolveIcon(demo) {
  if (demo.icon && typeof demo.icon !== 'string') return demo.icon;
  return ICON_MAP[demo.icon] || Calendar;
}

function normalizeCustomDemo(entry) {
  return {
    ...entry,
    url: customDemoUrl(entry.id),
    icon: resolveIcon(entry),
    color: entry.color || 'from-indigo-500 to-violet-500',
    builtin: false,
    features: entry.features || [],
  };
}

export default function TempusDemo() {
  const [customDemos, setCustomDemos] = useState([]);
  const [catalogError, setCatalogError] = useState('');
  const [showImport, setShowImport] = useState(false);

  const loadCatalog = useCallback(async () => {
    try {
      const cat = await fetchDemoCatalog();
      setCustomDemos((cat.demos || []).map(normalizeCustomDemo));
      setCatalogError('');
    } catch (e) {
      setCatalogError(e.message || 'Katalog konnte nicht geladen werden');
    }
  }, []);

  useEffect(() => {
    loadCatalog();
  }, [loadCatalog]);

  const allDemos = useMemo(() => [...BUILTIN_DEMOS, ...customDemos], [customDemos]);

  const openInNewTab = (url) => {
    const full =
      url.startsWith('http') || url.startsWith('/')
        ? url.startsWith('/')
          ? `${window.location.origin}${url}`
          : url
        : url;
    window.open(full, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">
          <span className="gradient-text">Tempus Demo</span>
        </h1>
        <p className="text-white/60">
          Interaktive Demo-Umgebung · trial5.tempus-resource.com/slot4
        </p>
      </div>

      <div
        className="relative overflow-hidden rounded-2xl p-6 border border-cyan-400/30 cursor-pointer group"
        style={{
          background:
            'linear-gradient(135deg, rgba(8,145,178,.12) 0%, rgba(34,211,238,.06) 50%, rgba(10,15,30,.8) 100%)',
        }}
        onClick={() => openInNewTab(STORY_URL)}
      >
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{ background: 'linear-gradient(135deg, rgba(8,145,178,.18), rgba(34,211,238,.1))' }}
        />
        <div className="relative flex items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div
              className="w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #0891b2, #22d3ee)' }}
            >
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-lg text-white">Interaktive Story-Präsentation</span>
              </div>
              <p className="text-white/60 text-sm">
                Reto &amp; Peter · 10 Slides · echte Screenshots · cinematische Übergänge
              </p>
            </div>
          </div>
          <button
            type="button"
            className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white transition-all group-hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #0891b2, #22d3ee)',
              boxShadow: '0 0 24px rgba(8,145,178,.4)',
            }}
          >
            <Play className="w-4 h-4" />
            Präsentation starten
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setShowImport((v) => !v)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600/90 to-indigo-600/90 text-white text-sm font-medium hover:opacity-90"
        >
          <FileUp className="w-4 h-4" />
          {showImport ? 'Import ausblenden' : 'Demo aus Word erstellen'}
        </button>
        {catalogError && <span className="text-xs text-amber-300/90">{catalogError}</span>}
      </div>

      {showImport && (
        <DemoWordImportWizard
          onSaved={() => {
            loadCatalog();
            setShowImport(false);
          }}
          onClose={() => setShowImport(false)}
        />
      )}

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
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        {allDemos.map((demo) => {
          const isPM = demo.id === 'pm';
          const isBPAFG = demo.id === 'bpafg';
          const isTeamResources = demo.id === 'team-resources';
          const isCustom = !demo.builtin;
          const isHighlighted = isPM || isBPAFG || isTeamResources || isCustom;
          const Icon = resolveIcon(demo);

          return (
            <div
              key={demo.id}
              className={`glass rounded-2xl p-6 border transition-all
                ${isPM
                  ? 'border-purple-400/30 bg-purple-500/5 hover:border-purple-400/50'
                  : isBPAFG
                    ? 'border-teal-400/30 bg-teal-500/5 hover:border-teal-400/50'
                    : isTeamResources
                      ? 'border-emerald-400/30 bg-emerald-500/5 hover:border-emerald-400/50'
                      : isCustom
                        ? 'border-indigo-400/30 bg-indigo-500/5 hover:border-indigo-400/50'
                        : 'border-white/10 hover:border-white/20'}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${demo.color} flex items-center justify-center shadow-lg`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex flex-col items-end gap-1">
                  {demo.badge && (
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        isCustom
                          ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-400/20'
                          : isBPAFG
                            ? 'bg-teal-500/20 text-teal-300 border border-teal-400/20'
                            : isTeamResources
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/20'
                              : 'bg-purple-500/20 text-purple-300 border border-purple-400/20'
                      }`}
                    >
                      {demo.badge}
                    </span>
                  )}
                  {isCustom && (
                    <span className="text-[10px] uppercase tracking-wide text-indigo-300/80">Word · KI</span>
                  )}
                </div>
              </div>

              <h3 className="text-lg font-semibold mb-1">{demo.name}</h3>
              <p className="text-white/60 text-sm mb-4">{demo.description}</p>

              <div className="space-y-2 mb-6">
                {(demo.features || []).map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-white/50">
                    <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => openInNewTab(demo.url)}
                className={`w-full py-3 px-4 rounded-xl bg-gradient-to-r ${demo.color} text-white font-medium
                  hover:shadow-lg transition-all flex items-center justify-center gap-2
                  ${isHighlighted ? 'hover:shadow-indigo-500/20' : 'opacity-80'}`}
              >
                {isHighlighted ? <Play className="w-4 h-4" /> : <ExternalLink className="w-4 h-4" />}
                Demo öffnen
              </button>
            </div>
          );
        })}
      </div>

      <div className="glass rounded-2xl p-6 border border-white/10">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-400" />
          Weitere Ressourcen
        </h2>
        <div className="space-y-3">
          {[
            { href: STORY_URL, label: 'Story-Präsentation', sub: 'Fullscreen', color: 'text-cyan-400' },
            { href: PM_DEMO_URL, label: 'PM Demo-Script', sub: '11 Szenen', color: 'text-purple-400' },
            { href: BPAFG_DEMO_URL, label: 'BPAFG Deep Dive', sub: '8 Blöcke', color: 'text-teal-400' },
            { href: RM_LIVE_URL, label: 'Tempus Live', sub: 'trial5…/slot4', color: 'text-blue-400' },
          ].map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group"
            >
              <ChevronRight className={`w-5 h-5 ${link.color}`} />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{link.label}</p>
                <p className="text-sm text-white/40 truncate">{link.sub}</p>
              </div>
              <ExternalLink className="w-4 h-4 text-white/30 group-hover:text-white/60 flex-shrink-0" />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
