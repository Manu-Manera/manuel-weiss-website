import { useState, useRef } from 'react';
import { Upload, FileText, Sparkles, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { createDeck } from '../../services/awsService';

export default function UploadZone({ onDeckCreated }) {
  const [mode, setMode] = useState('text');
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer?.files[0] || e.target.files[0];
    
    if (droppedFile) {
      if (droppedFile.type === 'application/pdf' || droppedFile.name.endsWith('.pdf')) {
        setFile(droppedFile);
        setStatus({ type: 'info', message: `PDF "${droppedFile.name}" ausgewählt` });
      } else if (droppedFile.type === 'text/plain' || droppedFile.name.endsWith('.txt')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setContent(e.target.result);
          setMode('text');
        };
        reader.readAsText(droppedFile);
      } else {
        setStatus({ type: 'error', message: 'Nur PDF oder TXT Dateien werden unterstützt' });
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const extractTextFromPDF = async (pdfFile) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const typedArray = new Uint8Array(e.target.result);
          
          if (window.pdfjsLib) {
            const pdf = await window.pdfjsLib.getDocument(typedArray).promise;
            let fullText = '';
            
            for (let i = 1; i <= pdf.numPages; i++) {
              const page = await pdf.getPage(i);
              const textContent = await page.getTextContent();
              const pageText = textContent.items.map(item => item.str).join(' ');
              fullText += pageText + '\n\n';
            }
            
            resolve(fullText);
          } else {
            const text = new TextDecoder().decode(typedArray);
            const cleanText = text.replace(/[^\x20-\x7E\n\räöüÄÖÜß]/g, ' ').trim();
            resolve(cleanText || 'PDF-Inhalt konnte nicht extrahiert werden. Bitte Text manuell eingeben.');
          }
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(pdfFile);
    });
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      setStatus({ type: 'error', message: 'Bitte gib einen Namen für das Deck ein' });
      return;
    }

    let textContent = content;

    if (mode === 'pdf' && file) {
      setLoading(true);
      setStatus({ type: 'info', message: 'Extrahiere Text aus PDF...' });
      
      try {
        textContent = await extractTextFromPDF(file);
      } catch (error) {
        setStatus({ type: 'error', message: 'PDF konnte nicht gelesen werden' });
        setLoading(false);
        return;
      }
    }

    if (!textContent || textContent.trim().length < 100) {
      setStatus({ type: 'error', message: 'Bitte gib mindestens 100 Zeichen Text ein' });
      setLoading(false);
      return;
    }

    setLoading(true);
    setStatus({ type: 'info', message: 'KI analysiert Text und erstellt Lernkarten...' });

    try {
      const result = await createDeck(name, textContent, mode === 'pdf' ? 'pdf' : 'text');
      
      if (result.success) {
        setStatus({ type: 'success', message: `${result.deck.cardCount} Lernkarten erstellt!` });
        setPreview(result.cards?.slice(0, 3));
        
        setTimeout(() => {
          onDeckCreated(result.deck);
          setName('');
          setContent('');
          setFile(null);
          setPreview(null);
          setStatus(null);
        }, 2000);
      } else {
        throw new Error(result.error || 'Unbekannter Fehler');
      }
    } catch (error) {
      console.error('Fehler:', error);
      setStatus({ type: 'error', message: error.message || 'Fehler beim Erstellen der Lernkarten' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Mode Toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setMode('text')}
          className={`flex-1 py-3 rounded-xl font-medium transition-all ${
            mode === 'text'
              ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
              : 'glass text-white/60 hover:text-white'
          }`}
        >
          <FileText className="w-5 h-5 inline mr-2" />
          Text eingeben
        </button>
        <button
          onClick={() => setMode('pdf')}
          className={`flex-1 py-3 rounded-xl font-medium transition-all ${
            mode === 'pdf'
              ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
              : 'glass text-white/60 hover:text-white'
          }`}
        >
          <Upload className="w-5 h-5 inline mr-2" />
          PDF hochladen
        </button>
      </div>

      {/* Deck Name */}
      <div>
        <label className="block text-sm text-white/60 mb-2">Deck-Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="z.B. Projektmanagement Grundlagen"
          className="glass-input"
          disabled={loading}
        />
      </div>

      {/* Content Input */}
      {mode === 'text' ? (
        <div>
          <label className="block text-sm text-white/60 mb-2">
            Lerninhalt (Text, Notizen, Buchseiten...)
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Füge hier den Text ein, aus dem Lernkarten erstellt werden sollen...

Tipp: Je strukturierter der Text, desto bessere Lernkarten. Kopiere z.B.:
- Buchkapitel
- Vorlesungsnotizen  
- Wikipedia-Artikel
- Zusammenfassungen"
            className="glass-input h-64 resize-none"
            disabled={loading}
          />
          <p className="text-xs text-white/40 mt-2">
            {content.length} Zeichen (min. 100 empfohlen)
          </p>
        </div>
      ) : (
        <div
          onDrop={handleFileDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
            file 
              ? 'border-green-500/50 bg-green-500/10' 
              : 'border-white/20 hover:border-indigo-500/50 hover:bg-indigo-500/5'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.txt"
            onChange={handleFileDrop}
            className="hidden"
          />
          
          {file ? (
            <>
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <p className="text-lg font-medium">{file.name}</p>
              <p className="text-white/50 text-sm mt-2">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </>
          ) : (
            <>
              <Upload className="w-12 h-12 text-white/30 mx-auto mb-4" />
              <p className="text-lg font-medium">PDF hierher ziehen</p>
              <p className="text-white/50 text-sm mt-2">
                oder klicken zum Auswählen
              </p>
            </>
          )}
        </div>
      )}

      {/* Status Message */}
      {status && (
        <div className={`p-4 rounded-xl flex items-center gap-3 ${
          status.type === 'error' ? 'bg-red-500/20 text-red-300' :
          status.type === 'success' ? 'bg-green-500/20 text-green-300' :
          'bg-indigo-500/20 text-indigo-300'
        }`}>
          {status.type === 'error' && <AlertCircle className="w-5 h-5" />}
          {status.type === 'success' && <CheckCircle className="w-5 h-5" />}
          {status.type === 'info' && <Loader2 className="w-5 h-5 animate-spin" />}
          {status.message}
        </div>
      )}

      {/* Preview */}
      {preview && preview.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-white/80">Vorschau der ersten Karten:</h4>
          {preview.map((card, i) => (
            <div key={i} className="glass p-4 rounded-xl">
              <p className="text-indigo-300 text-sm mb-1">Frage:</p>
              <p className="font-medium">{card.front}</p>
              <p className="text-green-300 text-sm mt-3 mb-1">Antwort:</p>
              <p className="text-white/80">{card.back}</p>
            </div>
          ))}
        </div>
      )}

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={loading || !name.trim() || (mode === 'text' && !content.trim()) || (mode === 'pdf' && !file)}
        className="glass-button w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            KI generiert Lernkarten...
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            Lernkarten mit KI erstellen
          </>
        )}
      </button>

      {/* Info */}
      <div className="text-center text-white/40 text-sm">
        Die KI analysiert deinen Text und erstellt 10-20 optimierte Lernkarten
      </div>
    </div>
  );
}
