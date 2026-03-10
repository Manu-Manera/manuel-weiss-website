import { useState, useCallback } from 'react';
import { useAppStore } from '../store';
import * as api from '../api';
import { Upload, FileSpreadsheet, Loader2, ArrowRight, ArrowLeft, X } from 'lucide-react';

export default function FileUpload() {
  const store = useAppStore();
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
      setSelectedFile(file);
    } else {
      store.setError('Bitte nur .xlsx oder .xls Dateien hochladen');
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    store.setError(null);
    store.setLoading(true);

    try {
      const result = await api.uploadExcel(selectedFile);
      store.setSessionId(result.sessionId);
      store.setAnalysis(result.analysis as any);
      store.setStep(2);
    } catch (err: unknown) {
      store.setError(err instanceof Error ? err.message : 'Upload fehlgeschlagen');
    } finally {
      setUploading(false);
      store.setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <FileSpreadsheet className="w-7 h-7 text-primary-600" />
          Excel-Datei hochladen
        </h2>
        <p className="mt-2 text-gray-600">
          Lade eine Kunden-Excel aus einem beliebigen Quellsystem hoch.
          Das Tool analysiert automatisch Struktur, Spalten und Datentypen.
        </p>
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all
          ${isDragging ? 'border-primary-400 bg-primary-50' : 'border-gray-300 bg-white hover:border-gray-400'}
          ${selectedFile ? 'border-green-400 bg-green-50' : ''}
        `}
      >
        {selectedFile ? (
          <div className="space-y-3">
            <FileSpreadsheet className="w-12 h-12 text-green-600 mx-auto" />
            <div>
              <p className="text-lg font-medium text-gray-900">{selectedFile.name}</p>
              <p className="text-sm text-gray-500">{(selectedFile.size / 1024).toFixed(1)} KB</p>
            </div>
            <button
              onClick={() => setSelectedFile(null)}
              className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-red-600"
            >
              <X className="w-3 h-3" /> Andere Datei wählen
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <Upload className="w-12 h-12 text-gray-400 mx-auto" />
            <div>
              <p className="text-lg font-medium text-gray-700">
                Excel-Datei hierher ziehen
              </p>
              <p className="text-sm text-gray-500">oder klicken zum Auswählen</p>
            </div>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileSelect}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
        )}
      </div>

      {/* Supported formats */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Unterstützte Formate</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>Excel (.xlsx, .xls) – mehrere Sheets, beliebige Struktur</li>
          <li>Exportdateien aus: SAP, Jira, MS Project, Planisware, andere PPM-Tools</li>
          <li>Ad-hoc-Tabellen mit Projekt-, Ressourcen- oder Aufgabendaten</li>
        </ul>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => store.setStep(0)}
          className="px-4 py-2 text-gray-600 hover:text-gray-900 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Zurück
        </button>

        <button
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
          className="px-6 py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2"
        >
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          Analysieren
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
