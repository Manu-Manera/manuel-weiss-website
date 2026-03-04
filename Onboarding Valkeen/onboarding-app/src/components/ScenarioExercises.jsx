import { useState } from 'react';
import { scenarioExercises } from '../data/onboardingData';
import { 
  Users, 
  ChevronRight, 
  Star,
  CheckCircle2,
  Circle,
  Target,
  Award,
  ArrowLeft,
  ListChecks,
  Clock,
  Briefcase,
  Crown,
  Heart,
  Shield,
  GraduationCap,
  Building,
  AlertTriangle,
  Play,
  MessageSquare,
  Lightbulb,
  FileText
} from 'lucide-react';

const iconMap = {
  Users: Users,
  Briefcase: Briefcase,
  Crown: Crown,
  Heart: Heart,
  Shield: Shield,
  GraduationCap: GraduationCap,
  Building: Building,
  AlertTriangle: AlertTriangle,
  Award: Award
};

const difficultyLabels = {
  1: { label: 'Einsteiger', color: 'bg-green-500', stars: 1 },
  2: { label: 'Grundlagen', color: 'bg-blue-500', stars: 2 },
  3: { label: 'Fortgeschritten', color: 'bg-yellow-500', stars: 3 },
  4: { label: 'Experte', color: 'bg-orange-500', stars: 4 },
  5: { label: 'Meister', color: 'bg-red-500', stars: 5 }
};

const categoryColors = {
  stakeholder: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30',
  mentor: 'from-purple-500/20 to-pink-500/20 border-purple-500/30',
  boss: 'from-amber-500/20 to-orange-500/20 border-amber-500/30',
  customer: 'from-green-500/20 to-emerald-500/20 border-green-500/30',
  emergency: 'from-red-500/20 to-rose-500/20 border-red-500/30'
};

const categoryIcons = {
  stakeholder: Users,
  mentor: GraduationCap,
  boss: Award,
  customer: Building,
  emergency: AlertTriangle
};

function DifficultyBadge({ level }) {
  const { label, color, stars } = difficultyLabels[level] || difficultyLabels[1];
  return (
    <div className="flex items-center gap-2">
      <span className={`${color} text-white text-xs px-2 py-0.5 rounded-full`}>
        {label}
      </span>
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            className={`w-3 h-3 ${i < stars ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
          />
        ))}
      </div>
    </div>
  );
}

function ScenarioCard({ scenario, isCompleted, onStart, categoryColor }) {
  const StakeholderIcon = iconMap[scenario.stakeholderIcon] || Users;
  
  return (
    <div 
      onClick={onStart}
      className={`glass-card p-4 sm:p-5 cursor-pointer hover:bg-white/10 transition-all group border-l-4 ${
        isCompleted ? 'border-l-green-500' : 'border-l-transparent'
      }`}
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-gradient-to-br ${categoryColor}`}>
              <StakeholderIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-400">{scenario.stakeholder}</p>
              <h4 className="font-semibold text-white group-hover:text-purple-300 transition-colors text-sm sm:text-base">
                {scenario.title}
              </h4>
            </div>
          </div>
          {isCompleted && <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />}
        </div>
        
        <p className="text-gray-400 text-xs sm:text-sm line-clamp-2">
          {scenario.situation}
        </p>
        
        <div className="flex flex-wrap items-center justify-between gap-2">
          <DifficultyBadge level={scenario.difficulty} />
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {scenario.timeLimit}
            </div>
            <div className="flex items-center gap-1">
              <ListChecks className="w-3 h-3" />
              {scenario.tasks.length} Aufgaben
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ScenarioDetail({ scenario, category, onBack, onComplete, isCompleted }) {
  const [completedTasks, setCompletedTasks] = useState([]);
  const [isStarted, setIsStarted] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [notes, setNotes] = useState('');

  const StakeholderIcon = iconMap[scenario.stakeholderIcon] || Users;
  const allTasksCompleted = completedTasks.length === scenario.tasks.length;

  const toggleTask = (index) => {
    if (completedTasks.includes(index)) {
      setCompletedTasks(completedTasks.filter(i => i !== index));
    } else {
      setCompletedTasks([...completedTasks, index]);
    }
  };

  const handleComplete = () => {
    onComplete?.(scenario.id);
    setShowResult(true);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm sm:text-base"
      >
        <ArrowLeft className="w-4 h-4" />
        Zurück zur Übersicht
      </button>

      <div className="glass-card p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl bg-gradient-to-br ${categoryColors[category]}`}>
              <StakeholderIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-400">{scenario.stakeholder}</p>
              <h3 className="text-lg sm:text-xl font-bold text-white">{scenario.title}</h3>
              <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                <span>Zeitlimit: {scenario.timeLimit}</span>
              </div>
            </div>
          </div>
          <DifficultyBadge level={scenario.difficulty} />
        </div>

        <div className="space-y-4 sm:space-y-6">
          <div className={`bg-gradient-to-r ${categoryColors[category]} rounded-lg p-4 border`}>
            <div className="flex items-start gap-3">
              <MessageSquare className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-white text-sm sm:text-base">Situation</h4>
                <p className="text-gray-200 mt-1 text-sm sm:text-base italic">"{scenario.situation}"</p>
              </div>
            </div>
          </div>

          <div className="bg-amber-500/10 rounded-lg p-4 border border-amber-500/30">
            <div className="flex items-start gap-3">
              <Target className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-amber-400 text-sm sm:text-base">Herausforderung</h4>
                <p className="text-gray-300 mt-1 text-sm sm:text-base">{scenario.challenge}</p>
              </div>
            </div>
          </div>

          {!isStarted && !showResult && (
            <button
              onClick={() => setIsStarted(true)}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-all"
            >
              <Play className="w-5 h-5" />
              Szenario starten
            </button>
          )}

          {isStarted && !showResult && (
            <>
              <div className="bg-white/5 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-white text-sm sm:text-base flex items-center gap-2">
                    <ListChecks className="w-5 h-5 text-green-400" />
                    Aufgaben ({completedTasks.length}/{scenario.tasks.length})
                  </h4>
                  <div className="h-2 w-32 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 transition-all"
                      style={{ width: `${(completedTasks.length / scenario.tasks.length) * 100}%` }}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  {scenario.tasks.map((task, index) => (
                    <button
                      key={index}
                      onClick={() => toggleTask(index)}
                      className={`w-full flex items-start gap-3 p-3 rounded-lg transition-all text-left ${
                        completedTasks.includes(index)
                          ? 'bg-green-500/10 border border-green-500/30'
                          : 'bg-white/5 hover:bg-white/10 border border-transparent'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                        completedTasks.includes(index)
                          ? 'bg-green-500 text-white'
                          : 'bg-white/10 text-gray-400'
                      }`}>
                        {completedTasks.includes(index) ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          <span className="text-xs font-medium">{index + 1}</span>
                        )}
                      </div>
                      <span className={`text-sm ${
                        completedTasks.includes(index) ? 'text-green-300' : 'text-gray-300'
                      }`}>
                        {task}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/30">
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-blue-400 text-sm sm:text-base">Erwartetes Deliverable</h4>
                    <p className="text-gray-300 mt-1 text-sm sm:text-base">{scenario.expectedDeliverable}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 rounded-lg p-4">
                <h4 className="font-semibold text-white text-sm sm:text-base mb-3">Erfolgskriterien</h4>
                <div className="flex flex-wrap gap-2">
                  {scenario.successCriteria.map((criterion, i) => (
                    <span 
                      key={i} 
                      className="text-xs bg-purple-500/20 text-purple-300 px-3 py-1.5 rounded-lg"
                    >
                      ✓ {criterion}
                    </span>
                  ))}
                </div>
              </div>

              {(scenario.mentorExpects || scenario.bossExpects) && (
                <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg p-4 border border-purple-500/30">
                  <div className="flex items-start gap-3">
                    <Lightbulb className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-purple-400 text-sm sm:text-base">
                        {scenario.mentorExpects ? 'Was dein Mentor erwartet' : 'Was dein Chef erwartet'}
                      </h4>
                      <p className="text-gray-300 mt-1 text-sm sm:text-base italic">
                        "{scenario.mentorExpects || scenario.bossExpects}"
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-white/5 rounded-lg p-4">
                <h4 className="font-semibold text-white text-sm sm:text-base mb-2">Deine Notizen</h4>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Halte hier deine Gedanken, Lösungsansätze und Learnings fest..."
                  className="w-full h-24 bg-white/5 border border-white/10 rounded-lg p-3 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none resize-none text-sm"
                />
              </div>

              <button
                onClick={handleComplete}
                disabled={!allTasksCompleted}
                className={`w-full py-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-all ${
                  allTasksCompleted
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:opacity-90'
                    : 'bg-white/10 text-gray-500 cursor-not-allowed'
                }`}
              >
                <CheckCircle2 className="w-5 h-5" />
                {allTasksCompleted ? 'Szenario abschließen' : `Noch ${scenario.tasks.length - completedTasks.length} Aufgaben offen`}
              </button>
            </>
          )}

          {showResult && (
            <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg p-4 sm:p-6 text-center border border-green-500/30">
              <Award className="w-12 h-12 text-green-400 mx-auto mb-3" />
              <h4 className="text-xl font-bold text-white mb-2">Szenario gemeistert!</h4>
              <p className="text-gray-300 text-sm sm:text-base mb-4">
                Du hast alle {scenario.tasks.length} Aufgaben erfolgreich abgeschlossen.
              </p>
              <div className="flex flex-wrap justify-center gap-2 mb-4">
                {scenario.skills.map((skill, i) => (
                  <span key={i} className="text-xs bg-green-500/20 text-green-300 px-3 py-1 rounded-full">
                    ✓ {skill}
                  </span>
                ))}
              </div>
              <button
                onClick={onBack}
                className="mt-4 bg-purple-500 hover:bg-purple-600 text-white py-2 px-6 rounded-lg transition-colors text-sm sm:text-base"
              >
                Nächstes Szenario
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ScenarioExercises() {
  const [selectedCategory, setSelectedCategory] = useState('stakeholder');
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [completedScenarios, setCompletedScenarios] = useState({});

  const categoryData = scenarioExercises.find(c => c.category === selectedCategory);
  const scenarios = categoryData?.scenarios || [];

  const handleComplete = (scenarioId) => {
    setCompletedScenarios(prev => ({
      ...prev,
      [scenarioId]: true
    }));
  };

  const getCategoryStats = (category) => {
    const cat = scenarioExercises.find(c => c.category === category);
    if (!cat) return { completed: 0, total: 0 };
    const completed = cat.scenarios.filter(s => completedScenarios[s.id]).length;
    return { completed, total: cat.scenarios.length };
  };

  const totalCompleted = Object.keys(completedScenarios).length;
  const totalScenarios = scenarioExercises.reduce((sum, c) => sum + c.scenarios.length, 0);

  if (selectedScenario) {
    return (
      <ScenarioDetail 
        scenario={selectedScenario}
        category={selectedCategory}
        onBack={() => setSelectedScenario(null)}
        onComplete={handleComplete}
        isCompleted={completedScenarios[selectedScenario.id]}
      />
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="glass-card p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20">
              <Target className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-white">Szenario-Übungen</h3>
              <p className="text-sm text-gray-400">Realistische Situationen aus verschiedenen Perspektiven</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl">
            <CheckCircle2 className="w-5 h-5 text-green-400" />
            <span className="text-white font-medium">{totalCompleted}/{totalScenarios}</span>
            <span className="text-gray-400 text-sm">abgeschlossen</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 mb-6">
          {scenarioExercises.map((cat) => {
            const stats = getCategoryStats(cat.category);
            const isComplete = stats.completed === stats.total && stats.total > 0;
            const CategoryIcon = categoryIcons[cat.category] || Users;
            
            return (
              <button
                key={cat.category}
                onClick={() => setSelectedCategory(cat.category)}
                className={`p-3 sm:p-4 rounded-xl transition-all text-center ${
                  selectedCategory === cat.category
                    ? `bg-gradient-to-br ${categoryColors[cat.category]} border`
                    : 'bg-white/5 hover:bg-white/10 border border-transparent'
                } ${isComplete ? 'ring-2 ring-green-500' : ''}`}
              >
                <CategoryIcon className={`w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-2 ${
                  selectedCategory === cat.category ? 'text-white' : 'text-gray-400'
                }`} />
                <p className={`text-xs sm:text-sm font-medium ${
                  selectedCategory === cat.category ? 'text-white' : 'text-gray-400'
                }`}>
                  {cat.title.split('-')[0]}
                </p>
                {stats.completed > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    {stats.completed}/{stats.total}
                  </p>
                )}
              </button>
            );
          })}
        </div>

        {categoryData && (
          <div>
            <div className="mb-4">
              <h4 className="text-base sm:text-lg font-semibold text-white">{categoryData.title}</h4>
              <p className="text-sm text-gray-400 mt-1">{categoryData.description}</p>
            </div>
            
            <div className="space-y-3">
              {scenarios.map((scenario) => (
                <ScenarioCard 
                  key={scenario.id}
                  scenario={scenario} 
                  isCompleted={completedScenarios[scenario.id]}
                  onStart={() => setSelectedScenario(scenario)}
                  categoryColor={categoryColors[selectedCategory]}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
