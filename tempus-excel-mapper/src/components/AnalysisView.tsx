import { useState } from 'react';
import { useAppStore } from '../store';
import * as api from '../api';
import {
  BarChart3, Database, RefreshCw, ArrowRight, ArrowLeft, Loader2,
  CheckCircle, FileSpreadsheet, Columns, Tag, Lightbulb,
} from 'lucide-react';

export default function AnalysisView() {
  const store = useAppStore();
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState('');
  const [generating, setGenerating] = useState(false);

  const analysis = store.analysis;
  const sessionId = store.sessionId;

  const handleSyncTempus = async () => {
    if (!sessionId) return;
    setSyncing(true);
    setSyncStatus('Tempus-Daten werden geladen…');
    store.setError(null);
    try {
      const result = await api.syncTempus(sessionId);
      store.setTempusSyncSummary(result.summary as any);
      setSyncStatus('');
    } catch (err: unknown) {
      store.setError(err instanceof Error ? err.message : 'Tempus-Sync fehlgeschlagen');
      setSyncStatus('');
    } finally {
      setSyncing(false);
    }
  };

  const handleGenerateMappings = async () => {
    if (!sessionId) return;
    setGenerating(true);
    store.setLoading(true);
    store.setError(null);
    try {
      const result = await api.generateMappings(sessionId);
      store.setMappingResult(result as any);
      if ((result as any).temporalInterpretation) {
        store.setTemporalInterpretation((result as any).temporalInterpretation);
      }
      if ((result as any).aiStatus) store.setAiStatus((result as any).aiStatus);
      store.setStep(3);
    } catch (err: unknown) {
      store.setError(err instanceof Error ? err.message : 'Analyse fehlgeschlagen');
    } finally {
      setGenerating(false);
      store.setLoading(false);
    }
  };

  if (!analysis) {
    return <div className="text-center text-gray-500 py-12">Keine Analyse vorhanden</div>;
  }

  const syncDone = !!store.tempusSyncSummary;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <BarChart3 className="w-7 h-7 text-primary-600" />
          Analyse: {analysis.fileName}
        </h2>
        <p className="mt-2 text-gray-600">
          {analysis.sheets.length} Sheet(s) erkannt. Überprüfe die Ergebnisse und synchronisiere die Tempus-Daten.
        </p>
      </div>

      {/* AI Insights */}
      {analysis.aiInsights && (
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-purple-800 flex items-center gap-2 mb-2">
            <Lightbulb className="w-4 h-4" /> AI-Analyse
          </h3>
          <p className="text-sm text-purple-700">{analysis.aiInsights}</p>
        </div>
      )}

      {/* Sheet Cards */}
      <div className="grid gap-6">
        {analysis.sheets.map((sheet) => (
          <div key={sheet.sheetName} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="w-5 h-5 text-green-600" />
                <div>
                  <h3 className="font-semibold text-gray-900">{sheet.sheetName}</h3>
                  <p className="text-sm text-gray-500">{sheet.rowCount} Zeilen</p>
                </div>
              </div>
              {sheet.suggestedEntity && (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                  {sheet.suggestedEntity}
                </span>
              )}
            </div>

            <div className="p-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b border-gray-100">
                    <th className="pb-2 font-medium">Spalte</th>
                    <th className="pb-2 font-medium">Typ</th>
                    <th className="pb-2 font-medium">Beispiele</th>
                    <th className="pb-2 font-medium">Null %</th>
                    <th className="pb-2 font-medium">Tempus-Feld</th>
                    <th className="pb-2 font-medium">Relevanz</th>
                  </tr>
                </thead>
                <tbody>
                  {sheet.columns.map((col) => (
                    <tr key={col.name} className="border-b border-gray-50">
                      <td className="py-2 font-medium text-gray-900 flex items-center gap-1.5">
                        <Columns className="w-3.5 h-3.5 text-gray-400" />
                        {col.name}
                      </td>
                      <td className="py-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium
                          ${col.inferredType === 'string' ? 'bg-gray-100 text-gray-600' : ''}
                          ${col.inferredType === 'number' ? 'bg-blue-100 text-blue-700' : ''}
                          ${col.inferredType === 'date' ? 'bg-amber-100 text-amber-700' : ''}
                          ${col.inferredType === 'boolean' ? 'bg-green-100 text-green-700' : ''}
                          ${col.inferredType === 'mixed' ? 'bg-red-100 text-red-700' : ''}
                          ${col.inferredType === 'empty' ? 'bg-gray-50 text-gray-400' : ''}
                        `}>
                          {col.inferredType}
                        </span>
                      </td>
                      <td className="py-2 text-gray-600 max-w-[200px] truncate">
                        {col.sampleValues.slice(0, 3).map(String).join(', ')}
                      </td>
                      <td className="py-2 text-gray-500">
                        {col.totalCount > 0 ? Math.round((col.nullCount / col.totalCount) * 100) : 0}%
                      </td>
                      <td className="py-2">
                        {col.suggestedTempusField ? (
                          <span className="flex items-center gap-1 text-green-700">
                            <Tag className="w-3 h-3" />
                            {col.suggestedTempusField}
                          </span>
                        ) : (
                          <span className="text-gray-400">–</span>
                        )}
                      </td>
                      <td className="py-2">
                        {col.relevance && (
                          <span className={`px-2 py-0.5 rounded text-xs font-medium
                            ${col.relevance === 'high' ? 'bg-green-100 text-green-700' : ''}
                            ${col.relevance === 'medium' ? 'bg-yellow-100 text-yellow-700' : ''}
                            ${col.relevance === 'low' ? 'bg-gray-100 text-gray-500' : ''}
                          `}>
                            {col.relevance}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {/* Tempus Sync */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
          <Database className="w-5 h-5 text-blue-600" />
          Tempus-Daten synchronisieren
        </h3>

        {syncDone && store.tempusSyncSummary ? (
          <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mb-4">
            {([
              ['projects', 'Projects'],
              ['resources', 'Resources'],
              ['tasks', 'Tasks'],
              ['customFields', 'Custom Fields'],
              ['assignments', 'Assignments'],
              ['roles', 'Roles'],
              ['skills', 'Skills'],
              ['adminTimes', 'Admin Times'],
              ['calendars', 'Calendars'],
            ] as const).map(([key, label]) => (
              <div key={key} className="bg-green-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-green-700">
                  {(store.tempusSyncSummary as Record<string, number>)[key] ?? 0}
                </p>
                <p className="text-xs text-green-600">{label}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-600 mb-4">
            Lade vorhandene Projekte, Ressourcen, Tasks und Custom Fields aus Tempus,
            um Mapping-Vorschläge gegen existierende Daten abgleichen zu können.
          </p>
        )}

        <button
          onClick={handleSyncTempus}
          disabled={syncing}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
        >
          {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          {syncDone ? 'Erneut synchronisieren' : 'Jetzt synchronisieren'}
        </button>
        {syncing && syncStatus && (
          <p className="mt-3 text-sm text-blue-600 flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            {syncStatus}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => store.setStep(1)}
          className="px-4 py-2 text-gray-600 hover:text-gray-900 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Zurück
        </button>

        <div className="flex items-center gap-4">
          <button
            onClick={handleGenerateMappings}
            disabled={!syncDone || generating}
            className="px-6 py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2"
          >
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Analyse starten
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      {generating && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3">
          <Loader2 className="w-5 h-5 text-blue-600 animate-spin flex-shrink-0" />
          <p className="text-sm text-blue-700">
            AI analysiert Excel-Daten und vergleicht mit Tempus-Daten… (kann bis zu 3 Min. dauern)
          </p>
        </div>
      )}
    </div>
  );
}
