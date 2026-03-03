import { useMemo, useState, useRef } from 'react';
import { 
  Mail, 
  Download, 
  Copy, 
  Check,
  TrendingUp,
  CheckCircle2,
  Clock,
  Target,
  FileText,
  Upload,
  HardDrive,
  Trash2
} from 'lucide-react';
import { useProgress } from '../hooks/useLocalStorage';
import { weeks, phases, milestones } from '../data/onboardingData';
import { format, differenceInDays } from 'date-fns';
import { de } from 'date-fns/locale';

export default function Report() {
  const { progress, exportProgress, importProgress, resetProgress } = useProgress();
  const [copied, setCopied] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const fileInputRef = useRef(null);

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        await importProgress(file);
        alert('Fortschritt erfolgreich importiert!');
      } catch (error) {
        alert('Fehler beim Importieren: ' + error.message);
      }
    }
  };

  const handleReset = () => {
    resetProgress();
    setShowResetConfirm(false);
  };

  const stats = useMemo(() => {
    const allTasks = weeks.flatMap(w => w.tasks);
    const completedTasks = allTasks.filter(t => progress.tasks[t.id]);
    const totalProgress = (completedTasks.length / allTasks.length) * 100;

    const currentDay = progress.startDate 
      ? differenceInDays(new Date(), new Date(progress.startDate)) + 1
      : 0;

    const currentPhase = currentDay <= 30 ? 1 : currentDay <= 60 ? 2 : 3;

    const phaseStats = phases.map(phase => {
      const phaseWeeks = weeks.filter(w => w.phase === phase.id);
      const phaseTasks = phaseWeeks.flatMap(w => w.tasks);
      const phaseCompleted = phaseTasks.filter(t => progress.tasks[t.id]).length;
      return {
        ...phase,
        completed: phaseCompleted,
        total: phaseTasks.length,
        progress: (phaseCompleted / phaseTasks.length) * 100
      };
    });

    const completedMilestones = milestones.filter(m => m.day <= currentDay);
    const nextMilestone = milestones.find(m => m.day > currentDay);

    const quizResults = Object.entries(progress.quizScores || {}).map(([week, result]) => ({
      week: parseInt(week),
      ...result
    }));

    return {
      totalProgress,
      completedTasks: completedTasks.length,
      totalTasks: allTasks.length,
      currentDay,
      currentPhase,
      phaseStats,
      completedMilestones,
      nextMilestone,
      quizResults
    };
  }, [progress]);

  const generateReportText = () => {
    const startDateStr = progress.startDate 
      ? format(new Date(progress.startDate), 'dd.MM.yyyy', { locale: de })
      : 'Nicht gestartet';

    let report = `
VALKEEN ONBOARDING - FORTSCHRITTSBERICHT
========================================
Erstellt am: ${format(new Date(), 'dd.MM.yyyy HH:mm', { locale: de })}
Startdatum: ${startDateStr}
Aktueller Tag: ${stats.currentDay} von 90

GESAMTFORTSCHRITT
-----------------
Fortschritt: ${Math.round(stats.totalProgress)}%
Aufgaben erledigt: ${stats.completedTasks}/${stats.totalTasks}
Aktuelle Phase: ${stats.currentPhase} - ${phases[stats.currentPhase - 1]?.name}

PHASEN-ÜBERSICHT
----------------
${stats.phaseStats.map(p => 
  `Phase ${p.id} (${p.name}): ${Math.round(p.progress)}% (${p.completed}/${p.total} Aufgaben)`
).join('\n')}

MEILENSTEINE
------------
Erreicht: ${stats.completedMilestones.length}/${milestones.length}
${stats.completedMilestones.map(m => `✓ Tag ${m.day}: ${m.title}`).join('\n')}
${stats.nextMilestone ? `\nNächster Meilenstein: Tag ${stats.nextMilestone.day} - ${stats.nextMilestone.title}` : ''}

QUIZ-ERGEBNISSE
---------------
${stats.quizResults.length > 0 
  ? stats.quizResults.map(q => `Woche ${q.week}: ${q.score}/${q.total} richtig`).join('\n')
  : 'Noch keine Quiz-Ergebnisse'}

---
Generiert von Valkeen Onboarding Hub
    `.trim();

    return report;
  };

  const handleCopy = async () => {
    const report = generateReportText();
    await navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const report = generateReportText();
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `onboarding-report-${format(new Date(), 'yyyy-MM-dd')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSendEmail = () => {
    const report = generateReportText();
    const subject = encodeURIComponent(`Valkeen Onboarding Report - Tag ${stats.currentDay}`);
    const body = encodeURIComponent(report);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    setEmailSent(true);
    setTimeout(() => setEmailSent(false), 3000);
  };

  if (!progress.startDate) {
    return (
      <div className="max-w-xl mx-auto">
        <div className="glass-card p-8 text-center">
          <FileText className="w-12 h-12 mx-auto mb-4 text-white/20" />
          <h2 className="text-xl font-bold mb-2">Kein Report verfügbar</h2>
          <p className="text-white/50">
            Starte zuerst dein Onboarding, um einen Fortschrittsbericht zu generieren.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Fortschrittsbericht</h1>
          <p className="text-white/60">Exportiere und teile deinen Fortschritt</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Kopiert!' : 'Kopieren'}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
          <button
            onClick={handleSendEmail}
            className="glass-button flex items-center gap-2"
          >
            <Mail className="w-4 h-4" />
            Per Email senden
          </button>
        </div>
      </div>

      {/* Report Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Stats */}
        <div className="lg:col-span-2 space-y-6">
          {/* Overview Card */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold mb-4">Übersicht</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-white/5">
                <TrendingUp className="w-5 h-5 text-indigo-400 mb-2" />
                <p className="text-2xl font-bold">{Math.round(stats.totalProgress)}%</p>
                <p className="text-xs text-white/50">Gesamtfortschritt</p>
              </div>
              <div className="p-4 rounded-xl bg-white/5">
                <CheckCircle2 className="w-5 h-5 text-green-400 mb-2" />
                <p className="text-2xl font-bold">{stats.completedTasks}</p>
                <p className="text-xs text-white/50">Aufgaben erledigt</p>
              </div>
              <div className="p-4 rounded-xl bg-white/5">
                <Clock className="w-5 h-5 text-purple-400 mb-2" />
                <p className="text-2xl font-bold">{stats.currentDay}</p>
                <p className="text-xs text-white/50">Aktueller Tag</p>
              </div>
              <div className="p-4 rounded-xl bg-white/5">
                <Target className="w-5 h-5 text-amber-400 mb-2" />
                <p className="text-2xl font-bold">{stats.completedMilestones.length}</p>
                <p className="text-xs text-white/50">Meilensteine erreicht</p>
              </div>
            </div>
          </div>

          {/* Phase Progress */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold mb-4">Phasen-Fortschritt</h2>
            <div className="space-y-4">
              {stats.phaseStats.map(phase => (
                <div key={phase.id}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: phase.color }}
                      />
                      <span className="text-sm font-medium">Phase {phase.id}: {phase.name}</span>
                    </div>
                    <span className="text-sm text-white/50">
                      {phase.completed}/{phase.total} ({Math.round(phase.progress)}%)
                    </span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${phase.progress}%`, backgroundColor: phase.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quiz Results */}
          {stats.quizResults.length > 0 && (
            <div className="glass-card p-6">
              <h2 className="text-lg font-semibold mb-4">Quiz-Ergebnisse</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.quizResults.map(result => (
                  <div 
                    key={result.week}
                    className={`p-4 rounded-xl ${
                      result.score / result.total >= 0.7 
                        ? 'bg-green-500/10 border border-green-500/20' 
                        : 'bg-amber-500/10 border border-amber-500/20'
                    }`}
                  >
                    <p className="text-sm text-white/50 mb-1">Woche {result.week}</p>
                    <p className={`text-xl font-bold ${
                      result.score / result.total >= 0.7 ? 'text-green-400' : 'text-amber-400'
                    }`}>
                      {result.score}/{result.total}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Milestones */}
        <div className="glass-card p-6 h-fit">
          <h2 className="text-lg font-semibold mb-4">Meilensteine</h2>
          <div className="space-y-3">
            {milestones.slice(0, 8).map(milestone => {
              const isCompleted = milestone.day <= stats.currentDay;
              return (
                <div 
                  key={milestone.day}
                  className={`flex items-center gap-3 p-3 rounded-xl ${
                    isCompleted ? 'bg-green-500/10' : 'bg-white/5'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-white/20 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${isCompleted ? 'text-white/50' : ''}`}>
                      {milestone.title}
                    </p>
                    <p className="text-xs text-white/40">Tag {milestone.day}</p>
                  </div>
                </div>
              );
            })}
            {milestones.length > 8 && (
              <p className="text-sm text-white/40 text-center pt-2">
                +{milestones.length - 8} weitere
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Raw Report Preview */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold mb-4">Report-Vorschau</h2>
        <pre className="p-4 rounded-xl bg-black/20 text-sm text-white/70 overflow-x-auto whitespace-pre-wrap font-mono max-h-64 overflow-y-auto scrollbar-thin">
          {generateReportText()}
        </pre>
      </div>

      {/* Data Management */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <HardDrive className="w-5 h-5 text-white/50" />
          <h2 className="text-lg font-semibold">Datenverwaltung</h2>
        </div>
        <p className="text-sm text-white/50 mb-4">
          Dein Fortschritt wird im LocalStorage deines Browsers gespeichert. 
          Exportiere regelmäßig, um deine Daten zu sichern.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={exportProgress}
            className="flex items-center justify-center gap-2 p-4 rounded-xl bg-green-500/10 border border-green-500/20 hover:bg-green-500/20 transition-colors"
          >
            <Download className="w-5 h-5 text-green-400" />
            <span className="text-sm font-medium text-green-400">Backup exportieren</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-2 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 transition-colors"
          >
            <Upload className="w-5 h-5 text-blue-400" />
            <span className="text-sm font-medium text-blue-400">Backup importieren</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />

          <button
            onClick={() => setShowResetConfirm(true)}
            className="flex items-center justify-center gap-2 p-4 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-colors"
          >
            <Trash2 className="w-5 h-5 text-red-400" />
            <span className="text-sm font-medium text-red-400">Zurücksetzen</span>
          </button>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass-card p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-2">Fortschritt zurücksetzen?</h3>
            <p className="text-sm text-white/60 mb-6">
              Diese Aktion löscht alle deine Daten unwiderruflich. Erstelle vorher ein Backup!
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
              >
                Abbrechen
              </button>
              <button
                onClick={handleReset}
                className="flex-1 px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 transition-colors"
              >
                Zurücksetzen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
