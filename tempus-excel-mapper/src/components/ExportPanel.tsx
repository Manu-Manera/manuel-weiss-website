import { useState } from 'react';
import { useAppStore } from '../store';
import * as api from '../api';
import {
  Download, FileSpreadsheet, FileText, Loader2, ArrowLeft,
  CheckCircle, RotateCcw, Sparkles, Upload, AlertTriangle,
} from 'lucide-react';

type ExportMode = 'excel' | 'api';

export default function ExportPanel() {
  const store = useAppStore();
  const [mode, setMode] = useState<ExportMode>('excel');
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);

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

  const handleImport = async () => {
    if (!sessionId) return;
    setImporting(true);
    store.setError(null);
    setImportResult(null);
    try {
      const result = await api.importToTempus(sessionId);
      setImportResult(result);
    } catch (err: unknown) {
      store.setError(err instanceof Error ? err.message : 'Import fehlgeschlagen');
    } finally {
      setImporting(false);
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

  const confirmed = mappingResult?.fieldMappings.filter(fm => fm.status === 'confirmed').length ?? 0;
  const total = mappingResult?.fieldMappings.length ?? 0;
  const newEntities = mappingResult?.entityMappings.filter(em => em.isNew && em.status !== 'rejected').length ?? 0;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <Download className="w-7 h-7 text-primary-600" />
          Export / Import
        </h2>
        <p className="mt-2 text-gray-600">
          Wähle, ob du eine Tempus-kompatible Excel-Datei erstellen oder direkt via API importieren möchtest.
        </p>
      </div>

      {/* Mode Toggle */}
      <div className="flex bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setMode('excel')}
          className={`flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
            mode === 'excel' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" /> Excel-Export
        </button>
        <button
          onClick={() => setMode('api')}
          className={`flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
            mode === 'api' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Upload className="w-4 h-4" /> Direkt in Tempus importieren
        </button>
      </div>

      {/* Summary */}
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

      {/* Excel Export Mode */}
      {mode === 'excel' && (
        <>
          {!store.exportReady ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
              <Sparkles className="w-12 h-12 text-primary-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-6">
                Erstelle eine Tempus-kompatible Excel-Datei in der korrekten Import-Reihenfolge
                (Attributes → Resources → Projects → Assignments → …).
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
                <p className="text-sm text-green-600 mt-1">Die Tempus-kompatible Excel-Datei steht zum Download bereit.</p>
              </div>
              <div className="flex items-center justify-center gap-4">
                <button onClick={handleDownload} className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 flex items-center gap-2">
                  <Download className="w-5 h-5" /> Excel herunterladen
                </button>
                <button onClick={handleDownloadReport} className="px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 flex items-center gap-2">
                  <FileText className="w-5 h-5" /> Mapping-Report
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* API Import Mode */}
      {mode === 'api' && !importResult && (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <Upload className="w-12 h-12 text-blue-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">
            Importiere die Daten direkt via Tempus API in der korrekten Reihenfolge.
          </p>
          <p className="text-sm text-amber-600 mb-6 flex items-center justify-center gap-1">
            <AlertTriangle className="w-4 h-4" />
            Dies erstellt neue Einträge in Tempus. Bitte prüfe die Mappings sorgfältig.
          </p>
          <button
            onClick={handleImport}
            disabled={importing}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 mx-auto"
          >
            {importing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
            {importing ? 'Import läuft…' : 'Import starten'}
          </button>
          {importing && (
            <p className="mt-4 text-sm text-blue-600">
              Elemente werden in Tempus angelegt (Attributes → Resources → Projects → …)
            </p>
          )}
        </div>
      )}

      {mode === 'api' && importResult && (
        <div className={`rounded-xl border p-8 space-y-4 ${importResult.success ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
          <div className="text-center">
            {importResult.success ? (
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
            ) : (
              <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto" />
            )}
            <h3 className="text-xl font-bold mt-4">{importResult.success ? 'Import erfolgreich!' : 'Import mit Fehlern'}</h3>
            <p className="text-sm mt-1">{importResult.totalCreated} erstellt, {importResult.totalFailed} fehlgeschlagen</p>
          </div>
          <div className="space-y-2">
            {importResult.steps?.map((step: any) => (
              <div key={step.entity} className="flex items-center justify-between bg-white rounded-lg p-3 text-sm">
                <span className="font-medium">{step.label}</span>
                <span>
                  {step.created > 0 && <span className="text-green-600 mr-2">{step.created} erstellt</span>}
                  {step.failed > 0 && <span className="text-red-600">{step.failed} fehlgeschlagen</span>}
                  {step.created === 0 && step.failed === 0 && <span className="text-gray-400">—</span>}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button onClick={() => store.setStep(4)} className="px-4 py-2 text-gray-600 hover:text-gray-900 flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Zurück
        </button>
        <button onClick={() => store.reset()} className="px-4 py-2 text-gray-600 hover:text-gray-900 flex items-center gap-2">
          <RotateCcw className="w-4 h-4" /> Neuer Import
        </button>
      </div>
    </div>
  );
}
