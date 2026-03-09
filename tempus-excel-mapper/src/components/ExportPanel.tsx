import { useState } from 'react';
import { useAppStore } from '../store';
import * as api from '../api';
import {
  Download, FileSpreadsheet, FileText, Loader2, ArrowLeft,
  CheckCircle, RotateCcw, Sparkles,
} from 'lucide-react';

export default function ExportPanel() {
  const store = useAppStore();
  const [exporting, setExporting] = useState(false);

  const sessionId = store.sessionId;
  const mappingResult = store.mappingResult;
  const validation = store.validation;

  const handleExport = async () => {
    if (!sessionId) return;
    setExporting(true);
    store.setError(null);
    try {
      await api.generateExport(sessionId);
      store.setExportReady(true);
    } catch (err: unknown) {
      store.setError(err instanceof Error ? err.message : 'Export fehlgeschlagen');
    } finally {
      setExporting(false);
    }
  };

  const handleDownload = () => {
    if (!sessionId) return;
    window.open(api.getDownloadUrl(sessionId), '_blank');
  };

  const handleDownloadReport = () => {
    if (!sessionId) return;
    window.open(api.getReportDownloadUrl(sessionId), '_blank');
  };

  const handleReset = () => {
    store.reset();
  };

  const confirmed = mappingResult?.fieldMappings.filter(fm => fm.status === 'confirmed').length ?? 0;
  const total = mappingResult?.fieldMappings.length ?? 0;
  const newEntities = mappingResult?.entityMappings.filter(em => em.isNew && em.status !== 'rejected').length ?? 0;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <Download className="w-7 h-7 text-primary-600" />
          Export
        </h2>
        <p className="mt-2 text-gray-600">
          Erstelle eine Tempus-kompatible Excel-Datei basierend auf den bestätigten Zuordnungen.
        </p>
      </div>

      {/* Export Summary */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h3 className="text-lg font-semibold">Zusammenfassung</h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500">Bestätigte Feld-Mappings</p>
            <p className="text-2xl font-bold text-gray-900">{confirmed} / {total}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500">Neue Entitäten</p>
            <p className="text-2xl font-bold text-purple-600">{newEntities}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500">Validierungsstatus</p>
            <p className={`text-lg font-bold ${validation?.isValid ? 'text-green-600' : 'text-amber-600'}`}>
              {validation?.isValid ? 'Bestanden' : `${validation?.summary.errors ?? '?'} Fehler`}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500">Quell-Sheets</p>
            <p className="text-2xl font-bold text-gray-900">{store.analysis?.sheets.length ?? 0}</p>
          </div>
        </div>
      </div>

      {/* Export Actions */}
      {!store.exportReady ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <Sparkles className="w-12 h-12 text-primary-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-6">
            Erstelle jetzt die Tempus-kompatible Excel-Datei mit allen bestätigten Zuordnungen.
          </p>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="px-8 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2 mx-auto"
          >
            {exporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileSpreadsheet className="w-5 h-5" />}
            Export erstellen
          </button>
        </div>
      ) : (
        <div className="bg-green-50 rounded-xl border border-green-200 p-8 text-center space-y-6">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
          <div>
            <h3 className="text-xl font-bold text-green-800">Export erfolgreich!</h3>
            <p className="text-sm text-green-600 mt-1">
              Die Tempus-kompatible Excel-Datei steht zum Download bereit.
            </p>
          </div>

          <div className="flex items-center justify-center gap-4">
            <button
              onClick={handleDownload}
              className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 flex items-center gap-2"
            >
              <Download className="w-5 h-5" />
              Excel herunterladen
            </button>
            <button
              onClick={handleDownloadReport}
              className="px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 flex items-center gap-2"
            >
              <FileText className="w-5 h-5" />
              Mapping-Report
            </button>
          </div>
        </div>
      )}

      {/* Info about new entities */}
      {newEntities > 0 && (
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-5">
          <h4 className="text-sm font-semibold text-purple-800 mb-2">Hinweis: Neue Entitäten</h4>
          <p className="text-sm text-purple-700">
            {newEntities} neue Elemente wurden erkannt, die noch nicht in Tempus existieren.
            Diese sind im Mapping-Report aufgeführt und müssen ggf. manuell in Tempus angelegt werden,
            bevor die Datei importiert wird.
          </p>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => store.setStep(4)}
          className="px-4 py-2 text-gray-600 hover:text-gray-900 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Zurück
        </button>

        <button
          onClick={handleReset}
          className="px-4 py-2 text-gray-600 hover:text-gray-900 flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" /> Neuer Import
        </button>
      </div>
    </div>
  );
}
