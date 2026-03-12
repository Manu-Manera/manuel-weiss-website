import { GraduationCap, ExternalLink } from 'lucide-react';

const TRAINING_URL = typeof window !== 'undefined'
  ? `${window.location.origin}/Onboarding%20Valkeen/docs/Tempus_Resource_Manager_Training_Interaktiv.html`
  : '';

export default function Training() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <GraduationCap className="w-8 h-8 text-indigo-400" />
            Tempus Training
          </h1>
          <p className="text-white/60">
            Interaktives Training: RM, PM, Admin – Grundlagen & Advanced mit Aufgaben, Quiz und Musterlösungen.
          </p>
        </div>
        <a
          href={TRAINING_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-sm"
        >
          <ExternalLink className="w-4 h-4" />
          In neuem Tab öffnen
        </a>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-4">
          <p className="text-sm font-medium text-indigo-400 mb-1">6 Trainings</p>
          <p className="text-white/70 text-sm">RM, PM, Admin + Advanced mit Dashboard & Fortschritt</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-sm font-medium text-green-400 mb-1">Lernfortschritt</p>
          <p className="text-white/70 text-sm">Wird im Browser gespeichert – klicke auf Karten zum Fortsetzen</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-sm font-medium text-amber-400 mb-1">Musterlösungen</p>
          <p className="text-white/70 text-sm">Advanced-Aufgaben mit einblendbaren Lösungen</p>
        </div>
      </div>

      {/* Embedded Training */}
      <div className="glass-card overflow-hidden p-0">
        <iframe
          src={TRAINING_URL}
          title="Tempus Resource Training"
          className="w-full border-0"
          style={{ minHeight: 'calc(100vh - 320px)', height: '800px' }}
        />
      </div>
    </div>
  );
}
