import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Edit2, Trash2, Save, X, Play, Layers, Clock, CheckCircle } from 'lucide-react';
import { getDeckCards, addCard, updateCard, deleteCard } from '../../services/awsService';

export default function DeckDetail({ deck, onBack, onStudy, onDeckUpdated }) {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingCard, setEditingCard] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCard, setNewCard] = useState({ front: '', back: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCards();
  }, [deck.deckId]);

  async function loadCards() {
    setLoading(true);
    try {
      const cardsData = await getDeckCards(deck.deckId);
      setCards(cardsData);
    } catch (error) {
      console.error('Fehler beim Laden der Karten:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddCard() {
    if (!newCard.front.trim() || !newCard.back.trim()) {
      alert('Bitte Vorder- und Rückseite ausfüllen');
      return;
    }

    setSaving(true);
    try {
      const card = await addCard(deck.deckId, newCard.front.trim(), newCard.back.trim());
      setCards([...cards, card]);
      setNewCard({ front: '', back: '' });
      setShowAddForm(false);
      onDeckUpdated?.();
    } catch (error) {
      alert(`Fehler: ${error.message}`);
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdateCard(cardId) {
    if (!editingCard.front.trim() || !editingCard.back.trim()) {
      alert('Bitte Vorder- und Rückseite ausfüllen');
      return;
    }

    setSaving(true);
    try {
      await updateCard(cardId, editingCard.front.trim(), editingCard.back.trim());
      setCards(cards.map(c => 
        c.cardId === cardId 
          ? { ...c, front: editingCard.front.trim(), back: editingCard.back.trim() }
          : c
      ));
      setEditingCard(null);
    } catch (error) {
      alert(`Fehler: ${error.message}`);
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteCard(cardId) {
    if (!confirm('Karte wirklich löschen?')) return;

    try {
      await deleteCard(cardId);
      setCards(cards.filter(c => c.cardId !== cardId));
      onDeckUpdated?.();
    } catch (error) {
      alert(`Fehler: ${error.message}`);
    }
  }

  function getBoxColor(box) {
    switch (box) {
      case 1: return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 2: return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 3: return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 4: return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 5: return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  }

  const dueCards = cards.filter(c => new Date(c.nextReview) <= new Date()).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 rounded-xl glass hover:bg-white/10 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold">{deck.name}</h2>
            <p className="text-white/50 text-sm mt-1">{cards.length} Karten</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {dueCards > 0 && (
            <button
              onClick={() => onStudy(deck)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium hover:opacity-90 transition-all"
            >
              <Play className="w-4 h-4" />
              {dueCards} lernen
            </button>
          )}
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl glass text-white font-medium hover:bg-white/10 transition-all"
          >
            <Plus className="w-4 h-4" />
            Karte hinzufügen
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="glass-card p-3 sm:p-4 text-center">
          <Layers className="w-5 h-5 mx-auto text-indigo-400 mb-1" />
          <p className="text-lg sm:text-xl font-bold">{cards.length}</p>
          <p className="text-white/50 text-xs">Gesamt</p>
        </div>
        <div className="glass-card p-3 sm:p-4 text-center">
          <Clock className="w-5 h-5 mx-auto text-amber-400 mb-1" />
          <p className="text-lg sm:text-xl font-bold text-amber-400">{dueCards}</p>
          <p className="text-white/50 text-xs">Fällig</p>
        </div>
        <div className="glass-card p-3 sm:p-4 text-center">
          <CheckCircle className="w-5 h-5 mx-auto text-green-400 mb-1" />
          <p className="text-lg sm:text-xl font-bold text-green-400">
            {cards.filter(c => c.box >= 4).length}
          </p>
          <p className="text-white/50 text-xs">Gemeistert</p>
        </div>
      </div>

      {/* Add Card Form */}
      {showAddForm && (
        <div className="glass-card p-4 sm:p-6 border-2 border-indigo-500/30">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-indigo-400" />
            Neue Karte erstellen
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-white/60 mb-2">Vorderseite (Frage)</label>
              <textarea
                value={newCard.front}
                onChange={(e) => setNewCard({ ...newCard, front: e.target.value })}
                className="w-full p-3 rounded-xl glass-input bg-white/5 border border-white/10 focus:border-indigo-500 focus:outline-none resize-none"
                rows={3}
                placeholder="z.B. Was ist React?"
              />
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-2">Rückseite (Antwort)</label>
              <textarea
                value={newCard.back}
                onChange={(e) => setNewCard({ ...newCard, back: e.target.value })}
                className="w-full p-3 rounded-xl glass-input bg-white/5 border border-white/10 focus:border-indigo-500 focus:outline-none resize-none"
                rows={3}
                placeholder="z.B. Eine JavaScript-Bibliothek für Benutzeroberflächen"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setNewCard({ front: '', back: '' });
                }}
                className="px-4 py-2 rounded-xl glass text-white/60 hover:text-white transition-all"
              >
                Abbrechen
              </button>
              <button
                onClick={handleAddCard}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium hover:opacity-90 transition-all disabled:opacity-50"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Speichern
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cards List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full" />
        </div>
      ) : cards.length === 0 ? (
        <div className="text-center py-12 glass-card">
          <Layers className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-white/60">Keine Karten</h3>
          <p className="text-white/40 mt-2">
            Füge deine erste Karte hinzu
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {cards.map((card, index) => (
            <div 
              key={card.cardId} 
              className="glass p-4 rounded-2xl hover:bg-white/5 transition-all"
            >
              {editingCard?.cardId === card.cardId ? (
                // Edit Mode
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-white/60 mb-2">Vorderseite</label>
                    <textarea
                      value={editingCard.front}
                      onChange={(e) => setEditingCard({ ...editingCard, front: e.target.value })}
                      className="w-full p-3 rounded-xl glass-input bg-white/5 border border-white/10 focus:border-indigo-500 focus:outline-none resize-none"
                      rows={2}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-white/60 mb-2">Rückseite</label>
                    <textarea
                      value={editingCard.back}
                      onChange={(e) => setEditingCard({ ...editingCard, back: e.target.value })}
                      className="w-full p-3 rounded-xl glass-input bg-white/5 border border-white/10 focus:border-indigo-500 focus:outline-none resize-none"
                      rows={2}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setEditingCard(null)}
                      className="p-2 rounded-xl glass text-white/60 hover:text-white transition-all"
                    >
                      <X className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleUpdateCard(card.cardId)}
                      disabled={saving}
                      className="p-2 rounded-xl bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-all"
                    >
                      {saving ? (
                        <div className="w-5 h-5 border-2 border-green-400/30 border-t-green-400 rounded-full animate-spin" />
                      ) : (
                        <Save className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                // View Mode
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40 text-sm font-medium">
                    {index + 1}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-white/40 mb-1">Vorderseite</p>
                        <p className="text-white/90">{card.front}</p>
                      </div>
                      <div>
                        <p className="text-xs text-white/40 mb-1">Rückseite</p>
                        <p className="text-white/70">{card.back}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 mt-3">
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${getBoxColor(card.box)}`}>
                        Box {card.box}
                      </span>
                      <span className="text-xs text-white/40">
                        {card.reviewCount || 0}x wiederholt
                      </span>
                      {new Date(card.nextReview) <= new Date() && (
                        <span className="text-xs text-amber-400">● Fällig</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditingCard({ cardId: card.cardId, front: card.front, back: card.back })}
                      className="p-2 rounded-xl glass text-white/40 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all"
                      title="Bearbeiten"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCard(card.cardId)}
                      className="p-2 rounded-xl glass text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all"
                      title="Löschen"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
