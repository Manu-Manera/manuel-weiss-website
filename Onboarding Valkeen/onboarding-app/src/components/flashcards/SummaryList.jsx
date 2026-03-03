import { useState } from 'react';
import { FileText, Trash2, Layers, Eye, Download, Clock, Sparkles } from 'lucide-react';

export default function SummaryList({ summaries, onView, onCreateCards, onDelete, onExport }) {
  const [expandedId, setExpandedId] = useState(null);

  if (!summaries || summaries.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-16 h-16 text-white/20 mx-auto mb-4" />
        <h3 className="text-xl font-medium text-white/60">Noch keine Zusammenfassungen</h3>
        <p className="text-white/40 mt-2">
          Erstelle deine erste Zusammenfassung im Tab "Neue Zusammenfassung"
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {summaries.map(summary => (
        <div 
          key={summary.summaryId} 
          className="glass p-5 rounded-2xl hover:bg-white/5 transition-all"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold truncate">{summary.title}</h3>
                {summary.hasFlashcards && (
                  <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-xs">
                    📚 Karteikarten
                  </span>
                )}
              </div>
              
              {/* Preview */}
              <div 
                className={`text-white/60 text-sm leading-relaxed ${
                  expandedId === summary.summaryId ? '' : 'line-clamp-3'
                }`}
              >
                {summary.summary?.substring(0, 500)}...
              </div>
              
              {summary.summary?.length > 500 && (
                <button
                  onClick={() => setExpandedId(
                    expandedId === summary.summaryId ? null : summary.summaryId
                  )}
                  className="text-indigo-400 text-sm mt-2 hover:text-indigo-300"
                >
                  {expandedId === summary.summaryId ? 'Weniger anzeigen' : 'Mehr anzeigen'}
                </button>
              )}

              {/* Stats */}
              <div className="flex items-center gap-4 mt-4 text-sm text-white/50">
                <div className="flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  <span>{summary.wordCount || '?'} Wörter</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{new Date(summary.createdAt).toLocaleDateString('de-DE')}</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-white/10 text-xs">
                  {summary.sourceType === 'pdf' ? '📄 PDF' : '📝 Text'}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              <button
                onClick={() => onView(summary)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl glass text-white/70 hover:text-white hover:bg-white/10 transition-all text-sm"
                title="Vollständig anzeigen"
              >
                <Eye className="w-4 h-4" />
                <span className="hidden sm:inline">Ansehen</span>
              </button>
              
              {!summary.hasFlashcards && (
                <button
                  onClick={() => onCreateCards(summary)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:opacity-90 transition-all text-sm"
                  title="Karteikarten erstellen"
                >
                  <Sparkles className="w-4 h-4" />
                  <span className="hidden sm:inline">Karten</span>
                </button>
              )}
              
              <button
                onClick={() => onExport(summary)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl glass text-white/70 hover:text-white hover:bg-white/10 transition-all text-sm"
                title="Exportieren"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export</span>
              </button>
              
              <button
                onClick={() => onDelete(summary.summaryId)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl glass text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all text-sm"
                title="Löschen"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
