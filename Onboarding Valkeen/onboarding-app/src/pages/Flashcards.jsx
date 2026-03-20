import { useState, useEffect, useCallback } from 'react';
import { Layers, Upload, BookOpen, BarChart3, Trash2, Play, Plus, FileText, Sparkles, Clock, AlertCircle, XCircle, CheckCircle, RefreshCw, ChevronDown } from 'lucide-react';
import UploadZone from '../components/flashcards/UploadZone';
import StudyMode from '../components/flashcards/StudyMode';
import DeckList from '../components/flashcards/DeckList';
import DeckDetail from '../components/flashcards/DeckDetail';
import SummaryList from '../components/flashcards/SummaryList';
import SummaryView from '../components/flashcards/SummaryView';
import CreateSummary from '../components/flashcards/CreateSummary';
import { getDecks, getFlashcardStats, deleteDeck, getSummaries, deleteSummary, createCardsFromSummary } from '../services/awsService';

const tabs = [
  { id: 'summaries', label: '📚 Zusammenfassungen', icon: FileText },
  { id: 'decks', label: '🃏 Karteikarten', icon: BookOpen },
  { id: 'create', label: '✨ Neue Zusammenfassung', icon: Plus },
  { id: 'stats', label: '📊 Statistiken', icon: BarChart3 },
];

export default function Flashcards() {
  const [activeTab, setActiveTab] = useState('summaries');
  const [decks, setDecks] = useState([]);
  const [summaries, setSummaries] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [studyDeck, setStudyDeck] = useState(null);
  const [viewSummary, setViewSummary] = useState(null);
  const [selectedDeck, setSelectedDeck] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Filter für StudyMode
  const [studyFilter, setStudyFilter] = useState(null); // 'due' | 'weak' | 'box1' | 'box2' | 'all' | null
  const [dueDays, setDueDays] = useState(0); // 0 = heute, 1 = morgen, 7 = diese Woche
  const [showDueDropdown, setShowDueDropdown] = useState(false);

  const loadData = useCallback(async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    try {
      const [decksData, statsData, summariesData] = await Promise.all([
        getDecks(),
        getFlashcardStats(),
        getSummaries()
      ]);
      setDecks(decksData || []);
      setStats(statsData);
      setSummaries(summariesData || []);
    } catch (error) {
      console.error('Fehler beim Laden:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleDeleteDeck(deckId) {
    if (!confirm('Deck und alle Karten wirklich löschen?')) return;
    try {
      await deleteDeck(deckId);
      setDecks(decks.filter(d => d.deckId !== deckId));
    } catch (error) {
      console.error('Fehler beim Löschen:', error);
    }
  }

  async function handleDeleteSummary(summaryId) {
    if (!confirm('Zusammenfassung wirklich löschen?')) return;
    try {
      await deleteSummary(summaryId);
      setSummaries(summaries.filter(s => s.summaryId !== summaryId));
    } catch (error) {
      console.error('Fehler beim Löschen:', error);
    }
  }

  function handleDeckCreated(newDeck) {
    setDecks([newDeck, ...decks]);
    setActiveTab('decks');
    loadData();
  }

  function handleSummaryCreated(newSummary) {
    setSummaries([newSummary, ...summaries]);
    setViewSummary(newSummary);
  }

  async function handleCreateCardsFromSummary(summary) {
    try {
      const result = await createCardsFromSummary(summary.summaryId, summary.title);
      if (result.success) {
        alert(`✅ ${result.deck.cardCount} Karteikarten erstellt!`);
        loadData();
        setViewSummary(null);
        setActiveTab('decks');
      }
    } catch (error) {
      alert(`❌ Fehler: ${error.message}`);
    }
  }

  function handleStartStudy(deck, filter = null) {
    setStudyFilter(filter);
    setStudyDeck(deck);
  }

  function handleEndStudy() {
    setStudyDeck(null);
    setStudyFilter(null);
    loadData(true); // Refresh mit Indikator
  }
  
  // Schnellstart: Alle Decks mit Filter lernen
  function handleQuickStudy(filter) {
    if (decks.length > 0) {
      // Kombiniere alle Decks zu einem virtuellen "Alle Karten" Deck
      setStudyFilter(filter);
      setStudyDeck({ 
        deckId: 'all', 
        name: filter === 'weak' ? 'Schwache Karten (Box 1-2)' : 
              filter === 'box1' ? 'Falsche Karten (Box 1)' :
              filter === 'due' ? `Fällige Karten (${dueDays === 0 ? 'heute' : dueDays === 1 ? 'morgen' : dueDays + ' Tage'})` :
              'Alle Karten'
      });
    }
  }

  function handleExportSummary(summary) {
    const content = `# ${summary.title}\n\n${summary.summary}`;
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${summary.title.replace(/[^a-zA-Z0-9]/g, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (studyDeck) {
    return <StudyMode deck={studyDeck} onEnd={handleEndStudy} filter={studyFilter} dueDays={dueDays} />;
  }

  if (selectedDeck) {
    return (
      <DeckDetail
        deck={selectedDeck}
        onBack={() => setSelectedDeck(null)}
        onStudy={handleStartStudy}
        onDeckUpdated={loadData}
      />
    );
  }

  if (viewSummary) {
    return (
      <SummaryView 
        summary={viewSummary} 
        onBack={() => setViewSummary(null)}
        onCreateCards={handleCreateCardsFromSummary}
        onExport={handleExportSummary}
      />
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="pb-2">
        <h1 className="text-2xl sm:text-3xl font-bold gradient-text flex items-center gap-3 mb-3">
          <Layers className="w-7 h-7 sm:w-8 sm:h-8" />
          KI-Lernkarten
        </h1>
        <p className="text-white/60 text-sm sm:text-base">
          Erstelle Zusammenfassungen und generiere daraus Karteikarten
        </p>
      </div>

      {/* Interaktive Dashboard-Kacheln */}
      {stats && (
        <div className="space-y-4">
          {/* Refresh Button */}
          <div className="flex justify-end">
            <button
              onClick={() => loadData(true)}
              disabled={refreshing}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg glass text-white/60 hover:text-white hover:bg-white/10 transition-all text-sm"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Aktualisiere...' : 'Aktualisieren'}
            </button>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {/* Fällige Karten - mit Dropdown für Zeitraum */}
            <div className="relative glass-card p-3 sm:p-4 hover:bg-white/5 transition-all group">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <p className="text-white/50 text-xs sm:text-sm">Fällig</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDueDropdown(!showDueDropdown);
                  }}
                  className="flex items-center gap-1 px-2 py-0.5 rounded bg-white/10 text-xs text-white/60 hover:text-white hover:bg-white/20 transition-all"
                >
                  {dueDays === 0 ? 'heute' : dueDays === 1 ? 'morgen' : `${dueDays} Tage`}
                  <ChevronDown className="w-3 h-3" />
                </button>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-amber-400 mb-2">{stats.dueCards}</p>
              <button
                onClick={() => stats.dueCards > 0 && handleQuickStudy('due')}
                disabled={stats.dueCards === 0}
                className={`w-full py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1 ${
                  stats.dueCards > 0 
                    ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30' 
                    : 'bg-white/5 text-white/30 cursor-not-allowed'
                }`}
              >
                <Play className="w-3 h-3" />
                {stats.dueCards > 0 ? 'Jetzt lernen' : 'Keine fällig'}
              </button>
              
              {/* Dropdown für Fälligkeitszeitraum */}
              {showDueDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 z-20 glass rounded-xl shadow-xl border border-white/10 overflow-hidden">
                  {[
                    { days: 0, label: 'Heute' },
                    { days: 1, label: 'Bis morgen' },
                    { days: 3, label: 'Nächste 3 Tage' },
                    { days: 7, label: 'Diese Woche' },
                    { days: 30, label: 'Dieser Monat' },
                  ].map(option => (
                    <button
                      key={option.days}
                      onClick={() => {
                        setDueDays(option.days);
                        setShowDueDropdown(false);
                        loadData(true);
                      }}
                      className={`w-full px-3 py-2 text-left text-sm hover:bg-white/10 transition-all ${
                        dueDays === option.days ? 'bg-amber-500/20 text-amber-400' : 'text-white/70'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Schwache Karten (Box 1-2) */}
            <div 
              className="glass-card p-3 sm:p-4 hover:bg-white/5 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-orange-400" />
                <p className="text-white/50 text-xs sm:text-sm">Schwach (Box 1-2)</p>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-orange-400 mb-2">
                {(stats.boxDistribution?.box1 || 0) + (stats.boxDistribution?.box2 || 0)}
              </p>
              <button
                onClick={() => ((stats.boxDistribution?.box1 || 0) + (stats.boxDistribution?.box2 || 0)) > 0 && handleQuickStudy('weak')}
                disabled={((stats.boxDistribution?.box1 || 0) + (stats.boxDistribution?.box2 || 0)) === 0}
                className={`w-full py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1 ${
                  ((stats.boxDistribution?.box1 || 0) + (stats.boxDistribution?.box2 || 0)) > 0 
                    ? 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30' 
                    : 'bg-white/5 text-white/30 cursor-not-allowed'
                }`}
              >
                <Play className="w-3 h-3" />
                Üben
              </button>
            </div>

            {/* Falsche Karten (Box 1) */}
            <div 
              className="glass-card p-3 sm:p-4 hover:bg-white/5 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="w-4 h-4 text-red-400" />
                <p className="text-white/50 text-xs sm:text-sm">Falsch (Box 1)</p>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-red-400 mb-2">
                {stats.boxDistribution?.box1 || 0}
              </p>
              <button
                onClick={() => (stats.boxDistribution?.box1 || 0) > 0 && handleQuickStudy('box1')}
                disabled={(stats.boxDistribution?.box1 || 0) === 0}
                className={`w-full py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1 ${
                  (stats.boxDistribution?.box1 || 0) > 0 
                    ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                    : 'bg-white/5 text-white/30 cursor-not-allowed'
                }`}
              >
                <Play className="w-3 h-3" />
                Wiederholen
              </button>
            </div>

            {/* Alle Karteikarten */}
            <div 
              className="glass-card p-3 sm:p-4 hover:bg-white/5 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-2 mb-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                <p className="text-white/50 text-xs sm:text-sm">Alle Karten</p>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-indigo-400 mb-2">{stats.totalCards}</p>
              <button
                onClick={() => stats.totalCards > 0 && handleQuickStudy('all')}
                disabled={stats.totalCards === 0}
                className={`w-full py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1 ${
                  stats.totalCards > 0 
                    ? 'bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30' 
                    : 'bg-white/5 text-white/30 cursor-not-allowed'
                }`}
              >
                <Play className="w-3 h-3" />
                Alle lernen
              </button>
            </div>

            {/* Gemeistert */}
            <div className="glass-card p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <p className="text-white/50 text-xs sm:text-sm">Gemeistert</p>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-green-400 mb-2">{stats.masteredCards}</p>
              <div className="w-full py-2 rounded-lg text-xs text-white/40 text-center">
                {stats.totalCards > 0 
                  ? `${Math.round((stats.masteredCards / stats.totalCards) * 100)}% aller Karten`
                  : 'Keine Karten'}
              </div>
            </div>

            {/* Zusammenfassungen */}
            <div 
              onClick={() => setActiveTab('summaries')}
              className="glass-card p-3 sm:p-4 hover:bg-white/5 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-purple-400" />
                <p className="text-white/50 text-xs sm:text-sm">Zusammenfassungen</p>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-purple-400 mb-2">{summaries.length}</p>
              <div className="w-full py-2 rounded-lg text-xs bg-purple-500/20 text-purple-400 text-center group-hover:bg-purple-500/30 transition-all">
                Anzeigen →
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all whitespace-nowrap text-sm ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
                : 'glass-card text-white/60 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="glass-card p-4 sm:p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full" />
          </div>
        ) : (
          <>
            {activeTab === 'summaries' && (
              <SummaryList 
                summaries={summaries}
                onView={setViewSummary}
                onCreateCards={handleCreateCardsFromSummary}
                onDelete={handleDeleteSummary}
                onExport={handleExportSummary}
              />
            )}

            {activeTab === 'decks' && (
              <DeckList 
                decks={decks} 
                onStudy={handleStartStudy}
                onDelete={handleDeleteDeck}
                onSelect={setSelectedDeck}
              />
            )}

            {activeTab === 'create' && (
              <CreateSummary onSummaryCreated={handleSummaryCreated} />
            )}

            {activeTab === 'stats' && stats && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold">📊 Leitner-Box Verteilung</h3>
                <div className="grid grid-cols-5 gap-2 sm:gap-4">
                  {[1, 2, 3, 4, 5].map(box => (
                    <div key={box} className="text-center">
                      <div 
                        className="h-24 sm:h-32 rounded-xl flex items-end justify-center p-2 mb-2"
                        style={{
                          background: `linear-gradient(to top, ${
                            box === 1 ? 'rgb(239, 68, 68)' :
                            box === 2 ? 'rgb(249, 115, 22)' :
                            box === 3 ? 'rgb(234, 179, 8)' :
                            box === 4 ? 'rgb(34, 197, 94)' :
                            'rgb(16, 185, 129)'
                          } ${Math.min((stats.boxDistribution[`box${box}`] / Math.max(stats.totalCards, 1)) * 100, 100)}%, transparent 0%)`
                        }}
                      >
                        <span className="text-xl sm:text-2xl font-bold">
                          {stats.boxDistribution[`box${box}`]}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-white/60">Box {box}</p>
                      <p className="text-xs text-white/40 hidden sm:block">
                        {box === 1 ? 'Neu' :
                         box === 2 ? '1 Tag' :
                         box === 3 ? '3 Tage' :
                         box === 4 ? '7 Tage' :
                         '14 Tage'}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-8 p-4 glass rounded-xl">
                  <h4 className="font-medium mb-2">🧠 Leitner-System erklärt</h4>
                  <p className="text-white/60 text-sm">
                    Karten starten in Box 1. Bei richtiger Antwort wandern sie in die nächste Box 
                    mit längerem Wiederholungsintervall. Bei falscher Antwort zurück zu Box 1. 
                    Karten in Box 5 gelten als gemeistert.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="glass p-4 rounded-xl">
                    <p className="text-white/50 text-sm">🔄 Gesamte Wiederholungen</p>
                    <p className="text-2xl sm:text-3xl font-bold">{stats.totalReviews}</p>
                  </div>
                  <div className="glass p-4 rounded-xl">
                    <p className="text-white/50 text-sm">🏆 Meisterungsrate</p>
                    <p className="text-2xl sm:text-3xl font-bold">
                      {stats.totalCards > 0 
                        ? Math.round((stats.masteredCards / stats.totalCards) * 100) 
                        : 0}%
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
