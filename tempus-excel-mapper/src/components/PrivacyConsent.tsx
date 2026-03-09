import { useState, useEffect } from 'react';
import { Shield, ExternalLink, AlertTriangle, CheckCircle, Globe } from 'lucide-react';

interface PrivacyConsentProps {
  onAccept: (aiProcessing: boolean) => void;
}

export default function PrivacyConsent({ onAccept }: PrivacyConsentProps) {
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [aiAccepted, setAiAccepted] = useState(false);
  const [privacyInfo, setPrivacyInfo] = useState<any>(null);

  useEffect(() => {
    fetch('/api/privacy/info')
      .then(r => r.json())
      .then(setPrivacyInfo)
      .catch(() => {});
  }, []);

  const handleAccept = () => {
    if (!privacyAccepted) return;
    onAccept(aiAccepted);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8 space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Datenschutzhinweis</h2>
              <p className="text-sm text-gray-500">DSGVO-konforme Datenverarbeitung</p>
            </div>
          </div>

          {/* Purpose */}
          <div className="bg-gray-50 rounded-xl p-5 space-y-3">
            <h3 className="font-semibold text-gray-900">Zweck der Verarbeitung</h3>
            <p className="text-sm text-gray-600">
              Dieses Tool analysiert hochgeladene Excel-Dateien und transformiert sie für den Import
              in Tempus (ProSymmetry). Die Verarbeitung erfolgt ausschließlich im Arbeitsspeicher
              des Servers – es werden keine Daten dauerhaft gespeichert.
            </p>
          </div>

          {/* Data Categories */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Verarbeitete Datenkategorien</h3>
            <ul className="text-sm text-gray-600 space-y-1.5">
              {privacyInfo?.dataCategories?.map((cat: string, i: number) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  {cat}
                </li>
              ))}
            </ul>
          </div>

          {/* Data Retention */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <p className="text-sm text-green-800">
              <strong>Speicherdauer:</strong> Alle hochgeladenen Daten werden nach 15 Minuten
              automatisch gelöscht. Es erfolgt keine dauerhafte Speicherung auf einem Datenträger.
            </p>
          </div>

          {/* AI Processing Warning */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 space-y-3">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <h3 className="font-semibold text-amber-900">KI-Verarbeitung (optional)</h3>
                <p className="text-sm text-amber-800 mt-1">
                  Für eine intelligentere Analyse kann Anthropic Claude AI verwendet werden.
                  Dabei werden <strong>ausschließlich anonymisierte/pseudonymisierte Daten</strong> an
                  Anthropic-Server (USA) übermittelt:
                </p>
                <ul className="text-sm text-amber-800 mt-2 space-y-1">
                  <li>• Nur Spaltenüberschriften und Datentypen</li>
                  <li>• Beispielwerte werden pseudonymisiert (Namen → „Person 1", E-Mails → „person1@example.com")</li>
                  <li>• Keine echten personenbezogenen Daten werden übertragen</li>
                  <li>• Die AI-Verarbeitung ist vollständig optional</li>
                </ul>
                <p className="text-xs text-amber-700 mt-2 flex items-center gap-1">
                  <Globe className="w-3 h-3" />
                  Rechtsgrundlage: Art. 49 Abs. 1 lit. a DSGVO (ausdrückliche Einwilligung)
                </p>
              </div>
            </div>
          </div>

          {/* Rights */}
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-900">Ihre Rechte</h3>
            <p className="text-sm text-gray-600">
              Sie haben jederzeit das Recht auf Auskunft, Löschung, Einschränkung der Verarbeitung
              und Datenübertragbarkeit. Alle Session-Daten können über die Oberfläche sofort gelöscht werden.
            </p>
          </div>

          {/* Consent Checkboxes */}
          <div className="border-t border-gray-200 pt-5 space-y-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={privacyAccepted}
                onChange={(e) => setPrivacyAccepted(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">
                Ich habe den Datenschutzhinweis gelesen und stimme der Verarbeitung meiner
                hochgeladenen Daten zum Zweck der Excel-Transformation für Tempus zu.
                <span className="text-red-500 ml-0.5">*</span>
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={aiAccepted}
                onChange={(e) => setAiAccepted(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm text-gray-700">
                Ich stimme der Übermittlung <strong>anonymisierter</strong> Daten an Anthropic (USA)
                für die KI-gestützte Analyse zu. <span className="text-gray-500">(optional)</span>
              </span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={handleAccept}
              disabled={!privacyAccepted}
              className="px-8 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Akzeptieren und fortfahren
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
