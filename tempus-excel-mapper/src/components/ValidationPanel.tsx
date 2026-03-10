import { useState } from 'react';
import { useAppStore } from '../store';
import * as api from '../api';
import {
  ShieldCheck, AlertTriangle, AlertCircle, Info, ArrowRight, ArrowLeft, Loader2, CheckCircle, Download, FileSpreadsheet,
} from 'lucide-react';

export default function ValidationPanel() {
  const store = useAppStore();
  const [validating, setValidating] = useState(false);

  const validation = store.validation;
  const sessionId = store.sessionId;

  const handleValidate = async () => {
    if (!sessionId) return;
    setValidating(true);
    store.setError(null);
    try {
      const result = await api.getValidation(sessionId);
      store.setValidation(result as any);
    } catch (err: unknown) {
      store.setError(err instanceof Error ? err.message : 'Validierung fehlgeschlagen');
    } finally {
      setValidating(false);
    }
  };

  const SeverityIcon = ({ severity }: { severity: string }) => {
    switch (severity) {
      case 'error': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'info': return <Info className="w-4 h-4 text-blue-500" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <ShieldCheck className="w-7 h-7 text-primary-600" />
          Validierung
        </h2>
        <p className="mt-2 text-gray-600">
          Prüfe alle Zuordnungen auf Vollständigkeit und Konsistenz, bevor der Export erstellt wird.
        </p>
      </div>

      {!validation ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <ShieldCheck className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 mb-6">Starte die Validierung um alle Zuordnungen zu prüfen.</p>
          <button
            onClick={handleValidate}
            disabled={validating}
            className="px-6 py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2 mx-auto"
          >
            {validating ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
            Jetzt validieren
          </button>
        </div>
      ) : (
        <>
          {/* Summary */}
          <div className={`rounded-xl p-6 ${validation.isValid ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <div className="flex items-center gap-3">
              {validation.isValid ? (
                <CheckCircle className="w-8 h-8 text-green-600" />
              ) : (
                <AlertCircle className="w-8 h-8 text-red-600" />
              )}
              <div>
                <h3 className={`text-lg font-semibold ${validation.isValid ? 'text-green-800' : 'text-red-800'}`}>
                  {validation.isValid ? 'Validierung bestanden' : 'Validierung mit Fehlern'}
                </h3>
                <p className={`text-sm ${validation.isValid ? 'text-green-600' : 'text-red-600'}`}>
                  {validation.summary.errors} Fehler, {validation.summary.warnings} Warnungen, {validation.summary.infos} Hinweise
                </p>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
              <p className="text-3xl font-bold text-red-600">{validation.summary.errors}</p>
              <p className="text-sm text-gray-500">Fehler</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
              <p className="text-3xl font-bold text-amber-600">{validation.summary.warnings}</p>
              <p className="text-sm text-gray-500">Warnungen</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
              <p className="text-3xl font-bold text-blue-600">{validation.summary.infos}</p>
              <p className="text-sm text-gray-500">Hinweise</p>
            </div>
          </div>

          {/* Issues List */}
          {validation.issues.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 w-8"></th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Kategorie</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Nachricht</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Sheet</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Spalte</th>
                  </tr>
                </thead>
                <tbody>
                  {validation.issues.map((issue, idx) => (
                    <tr key={idx} className={`border-t border-gray-100 ${
                      issue.severity === 'error' ? 'bg-red-50' :
                      issue.severity === 'warning' ? 'bg-amber-50' : ''
                    }`}>
                      <td className="px-4 py-3"><SeverityIcon severity={issue.severity} /></td>
                      <td className="px-4 py-3 font-medium text-gray-700">{issue.category}</td>
                      <td className="px-4 py-3 text-gray-600">{issue.message}</td>
                      <td className="px-4 py-3 text-gray-500">{issue.sheet || '–'}</td>
                      <td className="px-4 py-3 text-gray-500">{issue.column || '–'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={handleValidate}
              disabled={validating}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 flex items-center gap-2"
            >
              {validating ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
              Erneut validieren
            </button>

            {sessionId && (
              <a
                href={api.getReportDownloadUrl(sessionId)}
                className="px-4 py-2 bg-primary-50 text-primary-700 border border-primary-200 rounded-lg text-sm hover:bg-primary-100 hover:border-primary-300 transition-colors flex items-center gap-2 no-underline"
              >
                <FileSpreadsheet className="w-4 h-4" />
                Mapping-Report herunterladen
                <Download className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => store.setStep(3)}
          className="px-4 py-2 text-gray-600 hover:text-gray-900 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Zurück zum Mapping
        </button>

        <button
          onClick={() => store.setStep(5)}
          disabled={!validation}
          className="px-6 py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2"
        >
          Zum Export
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
