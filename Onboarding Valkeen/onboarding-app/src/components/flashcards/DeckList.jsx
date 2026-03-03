import { Play, Trash2, Clock, CheckCircle, Layers } from 'lucide-react';

export default function DeckList({ decks, onStudy, onDelete }) {
  if (!decks || decks.length === 0) {
    return (
      <div className="text-center py-12">
        <Layers className="w-16 h-16 text-white/20 mx-auto mb-4" />
        <h3 className="text-xl font-medium text-white/60">Noch keine Decks</h3>
        <p className="text-white/40 mt-2">
          Erstelle dein erstes Deck im Tab "Neues Deck"
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {decks.map(deck => (
        <div 
          key={deck.deckId} 
          className="glass p-5 rounded-2xl hover:bg-white/5 transition-all"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold">{deck.name}</h3>
              <p className="text-white/50 text-sm mt-1 line-clamp-2">
                {deck.description}
              </p>
              
              {/* Stats Row */}
              <div className="flex items-center gap-6 mt-4">
                <div className="flex items-center gap-2 text-sm">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  <span className="text-white/70">{deck.totalCards || deck.cardCount} Karten</span>
                </div>
                
                {deck.dueCards > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span className="text-amber-400">{deck.dueCards} fällig</span>
                  </div>
                )}
                
                {deck.masteredCards > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-green-400">{deck.masteredCards} gemeistert</span>
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              {deck.progress !== undefined && (
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-white/50 mb-1">
                    <span>Fortschritt</span>
                    <span>{deck.progress}%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-indigo-500 to-green-500 rounded-full transition-all duration-500"
                      style={{ width: `${deck.progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 ml-4">
              <button
                onClick={() => onStudy(deck)}
                disabled={!deck.dueCards && deck.totalCards > 0}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                  deck.dueCards > 0
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:opacity-90'
                    : 'glass text-white/40 cursor-not-allowed'
                }`}
              >
                <Play className="w-4 h-4" />
                {deck.dueCards > 0 ? 'Lernen' : 'Keine fällig'}
              </button>
              
              <button
                onClick={() => onDelete(deck.deckId)}
                className="p-2 rounded-xl glass text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all"
                title="Deck löschen"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Created Date */}
          <div className="mt-4 pt-4 border-t border-white/5 text-xs text-white/30">
            Erstellt: {new Date(deck.createdAt).toLocaleDateString('de-DE', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            })}
            {deck.sourceType && (
              <span className="ml-4">
                Quelle: {deck.sourceType === 'pdf' ? 'PDF' : 'Text'}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
