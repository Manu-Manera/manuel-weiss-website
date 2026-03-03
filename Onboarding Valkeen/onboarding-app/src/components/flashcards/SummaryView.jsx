import { useState } from 'react';
import { ArrowLeft, Download, Sparkles, Copy, Check, FileText, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function SummaryView({ summary, onBack, onCreateCards, onExport }) {
  const [copied, setCopied] = useState(false);
  const [creating, setCreating] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(summary.summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Kopieren fehlgeschlagen:', err);
    }
  };

  const handleCreateCards = async () => {
    setCreating(true);
    try {
      await onCreateCards(summary);
    } finally {
      setCreating(false);
    }
  };

  const handleExportMarkdown = () => {
    const content = `# ${summary.title}\n\n${summary.summary}\n\n---\nErstellt am: ${new Date(summary.createdAt).toLocaleDateString('de-DE')}\nQuelle: ${summary.sourceType === 'pdf' ? 'PDF' : 'Text'}`;
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${summary.title.replace(/[^a-zA-Z0-9äöüÄÖÜß]/g, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportHTML = () => {
    const htmlContent = `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${summary.title}</title>
  <style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 800px; 
      margin: 0 auto; 
      padding: 40px 20px;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      color: #e0e0e0;
      line-height: 1.8;
    }
    h1 { color: #a78bfa; border-bottom: 2px solid #6366f1; padding-bottom: 10px; }
    h2 { color: #818cf8; margin-top: 30px; }
    h3 { color: #93c5fd; }
    strong { color: #fbbf24; }
    ul, ol { padding-left: 20px; }
    li { margin: 8px 0; }
    code { background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 4px; }
    blockquote { 
      border-left: 4px solid #6366f1; 
      padding-left: 20px; 
      margin: 20px 0;
      background: rgba(99, 102, 241, 0.1);
      padding: 15px 20px;
      border-radius: 0 8px 8px 0;
    }
    .meta { color: #888; font-size: 14px; margin-top: 40px; padding-top: 20px; border-top: 1px solid #333; }
  </style>
</head>
<body>
  <h1>${summary.title}</h1>
  <div class="content">${summary.summary.replace(/\n/g, '<br>')}</div>
  <div class="meta">
    Erstellt am: ${new Date(summary.createdAt).toLocaleDateString('de-DE')} | 
    Quelle: ${summary.sourceType === 'pdf' ? 'PDF' : 'Text'} |
    ${summary.wordCount} Wörter
  </div>
</body>
</html>`;
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${summary.title.replace(/[^a-zA-Z0-9äöüÄÖÜß]/g, '_')}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-white/60 hover:text-white transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
          Zurück
        </button>
        
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2 rounded-xl glass hover:bg-white/10 transition-all text-sm"
          >
            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Kopiert!' : 'Kopieren'}
          </button>
          
          <div className="relative group">
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl glass hover:bg-white/10 transition-all text-sm">
              <Download className="w-4 h-4" />
              Exportieren
            </button>
            <div className="absolute right-0 top-full mt-2 bg-gray-800 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 min-w-[150px]">
              <button 
                onClick={handleExportMarkdown}
                className="w-full px-4 py-2 text-left hover:bg-white/10 rounded-t-xl text-sm"
              >
                📝 Markdown (.md)
              </button>
              <button 
                onClick={handleExportHTML}
                className="w-full px-4 py-2 text-left hover:bg-white/10 rounded-b-xl text-sm"
              >
                🌐 HTML (.html)
              </button>
            </div>
          </div>
          
          {!summary.hasFlashcards && (
            <button
              onClick={handleCreateCards}
              disabled={creating}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:opacity-90 transition-all text-sm disabled:opacity-50"
            >
              {creating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Erstelle...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Karteikarten erstellen
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Title */}
      <div className="glass-card p-6 mb-6">
        <h1 className="text-2xl font-bold gradient-text mb-2">{summary.title}</h1>
        <div className="flex items-center gap-4 text-sm text-white/50">
          <span className="flex items-center gap-1">
            <FileText className="w-4 h-4" />
            {summary.wordCount} Wörter
          </span>
          <span>{new Date(summary.createdAt).toLocaleDateString('de-DE', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
          })}</span>
          <span className="px-2 py-0.5 rounded bg-white/10">
            {summary.sourceType === 'pdf' ? '📄 PDF' : '📝 Text'}
          </span>
          {summary.hasFlashcards && (
            <span className="px-2 py-0.5 rounded bg-green-500/20 text-green-400">
              ✅ Karteikarten erstellt
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="glass-card p-6 sm:p-8">
        <div className="prose prose-invert prose-lg max-w-none summary-content">
          <ReactMarkdown
            components={{
              h2: ({children}) => <h2 className="text-xl font-bold text-indigo-400 mt-8 mb-4 flex items-center gap-2">{children}</h2>,
              h3: ({children}) => <h3 className="text-lg font-semibold text-purple-400 mt-6 mb-3">{children}</h3>,
              strong: ({children}) => <strong className="text-yellow-400 font-semibold">{children}</strong>,
              li: ({children}) => <li className="my-2 text-white/80">{children}</li>,
              p: ({children}) => <p className="my-4 text-white/80 leading-relaxed">{children}</p>,
              blockquote: ({children}) => (
                <blockquote className="border-l-4 border-indigo-500 pl-4 my-4 bg-indigo-500/10 py-3 rounded-r-lg italic">
                  {children}
                </blockquote>
              ),
            }}
          >
            {summary.summary}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
