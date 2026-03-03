import { useState } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  ExternalLink, 
  ChevronDown, 
  ChevronRight,
  Flag,
  StickyNote,
  Plus
} from 'lucide-react';
import { useProgress } from '../hooks/useLocalStorage';
import { weeks, phases } from '../data/onboardingData';

export default function Tracker() {
  const { progress, toggleTask, addNote } = useProgress();
  const [expandedWeeks, setExpandedWeeks] = useState([1, 2]);
  const [selectedPhase, setSelectedPhase] = useState(0);
  const [noteInput, setNoteInput] = useState({});
  const [showNoteInput, setShowNoteInput] = useState({});

  const toggleWeek = (weekId) => {
    setExpandedWeeks(prev => 
      prev.includes(weekId) 
        ? prev.filter(id => id !== weekId)
        : [...prev, weekId]
    );
  };

  const filteredWeeks = selectedPhase === 0 
    ? weeks 
    : weeks.filter(w => w.phase === selectedPhase);

  const getWeekProgress = (week) => {
    const completed = week.tasks.filter(t => progress.tasks[t.id]).length;
    return (completed / week.tasks.length) * 100;
  };

  const handleAddNote = (weekId) => {
    if (noteInput[weekId]?.trim()) {
      addNote(weekId, noteInput[weekId]);
      setNoteInput(prev => ({ ...prev, [weekId]: '' }));
      setShowNoteInput(prev => ({ ...prev, [weekId]: false }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Aufgaben-Tracker</h1>
          <p className="text-white/60">Verfolge deinen Lernfortschritt</p>
        </div>
      </div>

      {/* Phase Filter */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setSelectedPhase(0)}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            selectedPhase === 0 
              ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white' 
              : 'bg-white/5 text-white/60 hover:bg-white/10'
          }`}
        >
          Alle Phasen
        </button>
        {phases.map(phase => (
          <button
            key={phase.id}
            onClick={() => setSelectedPhase(phase.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              selectedPhase === phase.id 
                ? 'text-white' 
                : 'bg-white/5 text-white/60 hover:bg-white/10'
            }`}
            style={selectedPhase === phase.id ? { backgroundColor: phase.color } : {}}
          >
            Phase {phase.id}
          </button>
        ))}
      </div>

      {/* Weeks */}
      <div className="space-y-4">
        {filteredWeeks.map(week => {
          const weekProgress = getWeekProgress(week);
          const isExpanded = expandedWeeks.includes(week.id);
          const phase = phases.find(p => p.id === week.phase);
          const completedTasks = week.tasks.filter(t => progress.tasks[t.id]).length;

          return (
            <div key={week.id} className="glass-card overflow-hidden">
              {/* Week Header */}
              <button
                onClick={() => toggleWeek(week.id)}
                className="w-full p-5 flex items-center gap-4 hover:bg-white/5 transition-colors"
              >
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${phase.color}30` }}
                >
                  <span className="font-bold text-sm" style={{ color: phase.color }}>
                    W{week.id}
                  </span>
                </div>
                
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{week.name}</h3>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/50">
                      Tag {week.days}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex-1 max-w-xs h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${weekProgress}%`, backgroundColor: phase.color }}
                      />
                    </div>
                    <span className="text-xs text-white/50">
                      {completedTasks}/{week.tasks.length}
                    </span>
                  </div>
                </div>

                {weekProgress === 100 && (
                  <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                )}
                
                {isExpanded ? (
                  <ChevronDown className="w-5 h-5 text-white/50" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-white/50" />
                )}
              </button>

              {/* Week Content */}
              {isExpanded && (
                <div className="px-5 pb-5 space-y-4">
                  {/* Tasks */}
                  <div className="space-y-2">
                    {week.tasks.map(task => (
                      <div
                        key={task.id}
                        className={`flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer ${
                          progress.tasks[task.id] 
                            ? 'bg-green-500/10 hover:bg-green-500/15' 
                            : 'bg-white/5 hover:bg-white/10'
                        }`}
                        onClick={() => toggleTask(task.id)}
                      >
                        <input
                          type="checkbox"
                          checked={progress.tasks[task.id] || false}
                          onChange={() => toggleTask(task.id)}
                          className="checkbox-custom"
                          onClick={e => e.stopPropagation()}
                        />
                        <span className={`flex-1 text-sm ${
                          progress.tasks[task.id] ? 'text-white/50 line-through' : ''
                        }`}>
                          {task.text}
                        </span>
                        {task.link && (
                          <a
                            href={task.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={e => e.stopPropagation()}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                          >
                            <ExternalLink className="w-4 h-4 text-indigo-400" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Checkpoint */}
                  {week.checkpoint && (
                    <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                      <div className="flex items-center gap-2 mb-3">
                        <Flag className="w-4 h-4 text-amber-400" />
                        <span className="font-medium text-amber-400 text-sm">Checkpoint</span>
                      </div>
                      <ul className="space-y-2">
                        {week.checkpoint.questions.map((q, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-white/70">
                            <span className="text-amber-400">•</span>
                            {q}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Notes */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-white/50">
                        <StickyNote className="w-4 h-4" />
                        Notizen
                      </div>
                      <button
                        onClick={() => setShowNoteInput(prev => ({ ...prev, [week.id]: !prev[week.id] }))}
                        className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <Plus className="w-4 h-4 text-white/50" />
                      </button>
                    </div>

                    {showNoteInput[week.id] && (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={noteInput[week.id] || ''}
                          onChange={e => setNoteInput(prev => ({ ...prev, [week.id]: e.target.value }))}
                          placeholder="Notiz hinzufügen..."
                          className="glass-input flex-1"
                          onKeyPress={e => e.key === 'Enter' && handleAddNote(week.id)}
                        />
                        <button
                          onClick={() => handleAddNote(week.id)}
                          className="glass-button px-4"
                        >
                          Speichern
                        </button>
                      </div>
                    )}

                    {progress.notes[week.id]?.map((note, i) => (
                      <div key={i} className="p-3 rounded-xl bg-white/5 text-sm">
                        <p className="text-white/70">{note.text}</p>
                        <p className="text-xs text-white/30 mt-1">
                          {new Date(note.date).toLocaleDateString('de-DE')}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
