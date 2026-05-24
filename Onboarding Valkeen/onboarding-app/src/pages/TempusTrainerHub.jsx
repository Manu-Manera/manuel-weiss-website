import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  GraduationCap,
  Settings,
  Puzzle,
  ExternalLink,
  Monitor,
  ArrowRight,
  CheckCircle2,
  LayoutDashboard,
  Play
} from 'lucide-react';
import { useExtensionStatus } from '../components/training/ExtensionBridge';
import TraineeHub from '../components/training/TraineeHub';

const BASE = import.meta.env.BASE_URL || '/onboarding/';

function extInstallHref() {
  if (typeof window === 'undefined') return `${BASE}extension-install.html`;
  return new URL('extension-install.html', window.location.origin + BASE).href;
}

export default function TempusTrainerHub() {
  const ext = useExtensionStatus();
  const [view, setView] = useState('overview');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3 text-white">
          <Puzzle className="w-8 h-8 text-indigo-400 shrink-0" />
          Tempus Resource Trainer
        </h1>
        <p className="text-white/60 max-w-2xl">
          Browser-Extension für kundenspezifisches Training in Tempus: Live-Touren, Authoring und Side Panel
          für <span className="text-white/80">*.prosymmetry.com</span>.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setView('overview')}
          className={`flex items-center gap-1 px-4 py-2 rounded-xl text-sm transition-colors ${
            view === 'overview' ? 'bg-indigo-500 text-white' : 'bg-white/5 hover:bg-white/10 text-white/70'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" /> Übersicht
        </button>
        <button
          onClick={() => setView('trainee')}
          className={`flex items-center gap-1 px-4 py-2 rounded-xl text-sm transition-colors ${
            view === 'trainee' ? 'bg-indigo-500 text-white' : 'bg-white/5 hover:bg-white/10 text-white/70'
          }`}
        >
          <Play className="w-4 h-4" /> Live-Touren starten
        </button>
      </div>

      {view === 'trainee' && <TraineeHub />}

      {view === 'overview' && (
        <>
          <div className="flex flex-wrap items-center gap-3">
            {ext.installed === null && (
              <span className="text-xs text-white/45">Extension-Status wird geprüft…</span>
            )}
            {ext.installed === true && (
              <span className="text-xs px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-300">
                Browser-Extension aktiv{ext.version ? ` (v${ext.version})` : ''}
              </span>
            )}
            {ext.installed === false && (
              <a
                href={extInstallHref()}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs px-3 py-1.5 rounded-lg bg-amber-500/15 text-amber-300 inline-flex items-center gap-1 hover:bg-amber-500/25"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Extension installieren (Anleitung)
              </a>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => setView('trainee')}
              className="glass-card p-5 flex flex-col gap-3 text-left hover:border-indigo-500/30 transition-colors group"
            >
              <GraduationCap className="w-8 h-8 text-indigo-400" />
              <h2 className="text-lg font-semibold text-white">Live-Touren (Trainees)</h2>
              <p className="text-sm text-white/55 flex-1">Touren in echter Tempus-Oberfläche mit Tipps, Highlights und Theorie-Folien.</p>
              <span className="text-sm text-indigo-300 flex items-center gap-1 group-hover:gap-2 transition-all">
                Touren starten <ArrowRight className="w-4 h-4" />
              </span>
            </button>
            <NavLink
              to="/tempus-trainer-admin"
              className="glass-card p-5 flex flex-col gap-3 no-underline hover:border-indigo-500/30 transition-colors group"
            >
              <Settings className="w-8 h-8 text-indigo-400" />
              <h2 className="text-lg font-semibold text-white">Tempus Trainer Admin</h2>
              <p className="text-sm text-white/55 flex-1">Touren und Folien pflegen, Kunden & Branding, Fortschritte einsehen.</p>
              <span className="text-sm text-indigo-300 flex items-center gap-1 group-hover:gap-2 transition-all">
                Inhalte verwalten <ArrowRight className="w-4 h-4" />
              </span>
            </NavLink>
            <NavLink
              to="/tempus-demo"
              className="glass-card p-5 flex flex-col gap-3 no-underline hover:border-indigo-500/30 transition-colors group"
            >
              <Monitor className="w-8 h-8 text-indigo-400" />
              <h2 className="text-lg font-semibold text-white">Tempus Demo</h2>
              <p className="text-sm text-white/55 flex-1">Statische Demo-Umgebung und Einstieg ohne Produktiv-Mandant.</p>
              <span className="text-sm text-indigo-300 flex items-center gap-1 group-hover:gap-2 transition-all">
                Demo öffnen <ArrowRight className="w-4 h-4" />
              </span>
            </NavLink>
          </div>

          <div className="glass-card p-6 space-y-4">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <Puzzle className="w-5 h-5 text-indigo-400" />
              Browser-Extension
            </h3>
            <p className="text-sm text-white/65">
              Die Extension lädt Tour-Daten und blendet Steuerung direkt in Chrome/Edge auf der Tempus-Seite ein.
              Installiere lokal über <strong className="text-white/85">Entpackte Erweiterung laden</strong> (Ordner{' '}
              <code className="text-indigo-200/90 text-xs">extension/dist</code> nach <code className="text-indigo-200/90 text-xs">npm run build</code>).
            </p>
            <div className="flex flex-wrap gap-2">
              <a
                href={extInstallHref()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-sm"
              >
                <ExternalLink className="w-4 h-4" />
                Installationsanleitung öffnen
              </a>
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="text-white font-semibold mb-4">Typischer Ablauf</h3>
            <ol className="space-y-3 text-sm text-white/70">
              {[
                'Extension in Chrome laden und ggf. anheften.',
                'Oben auf „Live-Touren starten" klicken, Kunde wählen, mit E-Mail einloggen.',
                'Tour starten – Tempus öffnet sich; Side Panel der Extension nutzen.',
                'Trainer: im Tempus Trainer Admin Touren bauen oder Schritte aus der Extension-Aufnahme importieren.'
              ].map((step, i) => (
                <li key={i} className="flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </>
      )}
    </div>
  );
}
