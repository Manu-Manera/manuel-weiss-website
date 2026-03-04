import { useState, useEffect } from 'react';
import { Layers, Upload, BookOpen, BarChart3, Trash2, Play, Plus, FileText, Sparkles } from 'lucide-react';
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

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
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
    }
  }

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

  function handleStartStudy(deck) {
    setStudyDeck(deck);
  }

  function handleEndStudy() {
    setStudyDeck(null);
    loadData();
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
    return <StudyMode deck={studyDeck} onEnd={handleEndStudy} />;
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold gradient-text flex items-center gap-3">
          <Layers className="w-7 h-7 sm:w-8 sm:h-8" />
          KI-Lernkarten
        </h1>
        <p className="text-white/60 mt-2 text-sm sm:text-base">
          Erstelle Zusammenfassungen und generiere daraus Karteikarten
        </p>
      </div>

      {/* Quick Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="glass-card p-3 sm:p-4">
            <p className="text-white/50 text-xs sm:text-sm">📚 Zusammenfassungen</p>
            <p className="text-xl sm:text-2xl font-bold">{summaries.length}</p>
          </div>
          <div className="glass-card p-3 sm:p-4">
            <p className="text-white/50 text-xs sm:text-sm">🃏 Karteikarten</p>
            <p className="text-xl sm:text-2xl font-bold">{stats.totalCards}</p>
          </div>
          <div className="glass-card p-3 sm:p-4">
            <p className="text-white/50 text-xs sm:text-sm">⏰ Fällig heute</p>
            <p className="text-xl sm:text-2xl font-bold text-amber-400">{stats.dueCards}</p>
          </div>
          <div className="glass-card p-3 sm:p-4">
            <p className="text-white/50 text-xs sm:text-sm">✅ Gemeistert</p>
            <p className="text-xl sm:text-2xl font-bold text-green-400">{stats.masteredCards}</p>
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
