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
  BookOpen
} from 'lucide-react';

const demoEnvironments = [
  {
    id: 'rm',
    name: 'Resource Manager',
    description: 'Ressourcenplanung und -verwaltung',
    url: 'https://demo.2bsmart.ch/rm',
    icon: Users,
    color: 'from-blue-500 to-cyan-500',
    features: ['Ressourcenübersicht', 'Kapazitätsplanung', 'Skill-Management', 'Verfügbarkeitsanzeige']
  },
  {
    id: 'pm',
    name: 'Project Manager',
    description: 'Projektplanung und -steuerung',
    url: 'https://demo.2bsmart.ch/pm',
    icon: Calendar,
    color: 'from-purple-500 to-pink-500',
    features: ['Projektübersicht', 'Meilensteine', 'Budgetverfolgung', 'Gantt-Ansicht']
  },
  {
    id: 'admin',
    name: 'Admin Console',
    description: 'Systemkonfiguration und Einstellungen',
    url: 'https://demo.2bsmart.ch/admin',
    icon: Settings,
    color: 'from-orange-500 to-red-500',
    features: ['Benutzerverwaltung', 'Systemeinstellungen', 'Workflows', 'Integrationen']
  },
  {
    id: 'reports',
    name: 'Reports & Analytics',
    description: 'Auswertungen und Dashboards',
    url: 'https://demo.2bsmart.ch/reports',
    icon: BarChart3,
    color: 'from-green-500 to-emerald-500',
    features: ['Auslastungsberichte', 'Projektstatistiken', 'Zeiterfassung', 'Export-Funktionen']
  }
];

const demoCredentials = {
  username: 'demo@valkeen.com',
  password: 'Demo2024!',
  note: 'Diese Demo-Zugangsdaten sind nur für Testzwecke gedacht.'
};

const quickTips = [
  { icon: Clock, text: 'Die Demo-Umgebung wird täglich um 00:00 Uhr zurückgesetzt' },
  { icon: Users, text: 'Mehrere Benutzer können gleichzeitig auf die Demo zugreifen' },
  { icon: CheckCircle, text: 'Alle Änderungen sind temporär und werden nicht gespeichert' }
];

export default function TempusDemo() {
  const [selectedDemo, setSelectedDemo] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);

  const openInNewTab = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const openInIframe = (demo) => {
    setSelectedDemo(demo);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">
          <span className="gradient-text">Tempus Demo</span>
        </h1>
        <p className="text-white/60">
          Erkunde die Tempus-Plattform in einer interaktiven Demo-Umgebung
        </p>
      </div>

      {/* Quick Tips */}
      <div className="glass rounded-2xl p-6 border border-white/10">
        <div className="flex items-center gap-2 mb-4">
          <Info className="w-5 h-5 text-indigo-400" />
          <h2 className="font-semibold">Wichtige Hinweise</h2>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          {quickTips.map((tip, index) => (
            <div key={index} className="flex items-start gap-3 p-3 rounded-xl bg-white/5">
              <tip.icon className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-white/70">{tip.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Demo Credentials */}
      <div className="glass rounded-2xl p-6 border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold flex items-center gap-2">
            <Monitor className="w-5 h-5 text-indigo-400" />
            Demo-Zugangsdaten
          </h2>
          <button
            onClick={() => setShowCredentials(!showCredentials)}
            className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            {showCredentials ? 'Ausblenden' : 'Anzeigen'}
          </button>
        </div>
        {showCredentials && (
          <div className="space-y-3 p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-white/60 text-sm">Benutzername:</span>
              <code className="px-3 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 text-sm font-mono">
                {demoCredentials.username}
              </code>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/60 text-sm">Passwort:</span>
              <code className="px-3 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 text-sm font-mono">
                {demoCredentials.password}
              </code>
            </div>
            <p className="text-xs text-white/40 mt-2 pt-2 border-t border-white/10">
              {demoCredentials.note}
            </p>
          </div>
        )}
      </div>

      {/* Demo Environment Cards */}
      <div className="grid sm:grid-cols-2 gap-6">
        {demoEnvironments.map((demo) => (
          <div
            key={demo.id}
            className="glass rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${demo.color} flex items-center justify-center shadow-lg`}>
                <demo.icon className="w-6 h-6 text-white" />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => openInIframe(demo)}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                  title="In Vorschau öffnen"
                >
                  <Play className="w-4 h-4" />
                </button>
                <button
                  onClick={() => openInNewTab(demo.url)}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                  title="In neuem Tab öffnen"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <h3 className="text-lg font-semibold mb-1">{demo.name}</h3>
            <p className="text-white/60 text-sm mb-4">{demo.description}</p>
            
            <div className="space-y-2">
              {demo.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-white/50">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
            
            <button
              onClick={() => openInNewTab(demo.url)}
              className={`w-full mt-6 py-3 px-4 rounded-xl bg-gradient-to-r ${demo.color} text-white font-medium 
                hover:shadow-lg hover:shadow-indigo-500/20 transition-all flex items-center justify-center gap-2`}
            >
              <Play className="w-4 h-4" />
              Demo starten
            </button>
          </div>
        ))}
      </div>

      {/* Embedded Demo Viewer */}
      {selectedDemo && (
        <div className={`glass rounded-2xl border border-white/10 overflow-hidden ${isFullscreen ? 'fixed inset-4 z-50' : ''}`}>
          <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${selectedDemo.color} flex items-center justify-center`}>
                <selectedDemo.icon className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold">{selectedDemo.name}</h3>
                <p className="text-xs text-white/50">{selectedDemo.url}</p>
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
                onClick={() => openInNewTab(selectedDemo.url)}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                title="In neuem Tab öffnen"
              >
                <ExternalLink className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setSelectedDemo(null);
                  setIsFullscreen(false);
                }}
                className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 text-white/60 hover:text-red-400 transition-colors"
                title="Schließen"
              >
                ✕
              </button>
            </div>
          </div>
          <div className={`bg-white ${isFullscreen ? 'h-[calc(100%-60px)]' : 'h-[600px]'}`}>
            <iframe
              src={selectedDemo.url}
              className="w-full h-full border-0"
              title={`${selectedDemo.name} Demo`}
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
            />
          </div>
        </div>
      )}

      {/* Additional Resources */}
      <div className="glass rounded-2xl p-6 border border-white/10">
        <h2 className="font-semibold mb-4">Weitere Ressourcen</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <a
            href="https://docs.2bsmart.ch"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group"
          >
            <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-indigo-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium group-hover:text-indigo-400 transition-colors">Dokumentation</h3>
              <p className="text-sm text-white/50">Ausführliche Anleitungen</p>
            </div>
            <ExternalLink className="w-4 h-4 text-white/30 group-hover:text-white/60" />
          </a>
          <a
            href="https://support.2bsmart.ch"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group"
          >
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium group-hover:text-purple-400 transition-colors">Support</h3>
              <p className="text-sm text-white/50">Hilfe & Kontakt</p>
            </div>
            <ExternalLink className="w-4 h-4 text-white/30 group-hover:text-white/60" />
          </a>
        </div>
      </div>
    </div>
  );
}
