import { useState, useEffect } from 'react';
import { useAppStore } from '../store';
import * as api from '../api';
import { Settings, Key, Globe, CheckCircle, XCircle, Loader2, ArrowRight } from 'lucide-react';

export default function SettingsPanel() {
  const store = useAppStore();
  const [tempusStatus, setTempusStatus] = useState<{ ok: boolean; message: string } | null>(null);
  const [anthropicStatus, setAnthropicStatus] = useState<{ ok: boolean; message: string } | null>(null);
  const [testing, setTesting] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.getConfig().then((cfg) => {
      store.setConfig({ tempusBaseUrl: cfg.tempusBaseUrl });
      if (cfg.hasTempusKey || cfg.hasAnthropicKey) {
        store.setConfigSaved(true);
      }
    }).catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    store.setError(null);
    try {
      const result = await api.saveConfig({
        tempusBaseUrl: store.tempusBaseUrl,
        tempusApiKey: store.tempusApiKey,
        anthropicApiKey: store.anthropicApiKey,
      });
      store.setConfigSaved(true);
      if (result.hasTempusKey) setTempusStatus(null);
      if (result.hasAnthropicKey) setAnthropicStatus(null);
    } catch (err: unknown) {
      store.setError(err instanceof Error ? err.message : 'Speichern fehlgeschlagen');
    } finally {
      setSaving(false);
    }
  };

  const handleTestTempus = async () => {
    setTesting('tempus');
    try {
      const result = await api.testTempus();
      setTempusStatus(result);
    } catch (err: unknown) {
      setTempusStatus({ ok: false, message: err instanceof Error ? err.message : 'Test fehlgeschlagen' });
    } finally {
      setTesting(null);
    }
  };

  const handleTestAnthropic = async () => {
    setTesting('anthropic');
    try {
      const result = await api.testAnthropic();
      setAnthropicStatus(result);
    } catch (err: unknown) {
      setAnthropicStatus({ ok: false, message: err instanceof Error ? err.message : 'Test fehlgeschlagen' });
    } finally {
      setTesting(null);
    }
  };

  const canProceed = store.configSaved;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <Settings className="w-7 h-7 text-primary-600" />
          API-Konfiguration
        </h2>
        <p className="mt-2 text-gray-600">
          Konfiguriere die Verbindungen zu Tempus und Anthropic Claude.
          Die Keys werden nur im Server-Speicher gehalten und nicht dauerhaft gespeichert.
        </p>
      </div>

      {/* Tempus Config */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Globe className="w-5 h-5 text-blue-600" />
          Tempus API
        </h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Base URL</label>
          <input
            type="url"
            value={store.tempusBaseUrl}
            onChange={(e) => store.setConfig({ tempusBaseUrl: e.target.value })}
            placeholder="https://trial5.tempus-resource.com/slot4"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
          <input
            type="password"
            value={store.tempusApiKey}
            onChange={(e) => store.setConfig({ tempusApiKey: e.target.value })}
            placeholder="Bearer Token eingeben"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleTestTempus}
            disabled={testing === 'tempus' || !store.configSaved}
            className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 disabled:opacity-50 flex items-center gap-2"
          >
            {testing === 'tempus' ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Verbindung testen
          </button>
          {tempusStatus && (
            <span className={`flex items-center gap-1 text-sm ${tempusStatus.ok ? 'text-green-600' : 'text-red-600'}`}>
              {tempusStatus.ok ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
              {tempusStatus.message}
            </span>
          )}
        </div>
      </div>

      {/* Anthropic Config */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Key className="w-5 h-5 text-purple-600" />
          Anthropic Claude API
        </h3>
        <p className="text-sm text-gray-500">
          Optional – ermöglicht intelligentere Spalten-Erkennung und Mapping-Vorschläge.
        </p>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
          <input
            type="password"
            value={store.anthropicApiKey}
            onChange={(e) => store.setConfig({ anthropicApiKey: e.target.value })}
            placeholder="sk-ant-..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleTestAnthropic}
            disabled={testing === 'anthropic' || !store.configSaved}
            className="px-4 py-2 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-100 disabled:opacity-50 flex items-center gap-2"
          >
            {testing === 'anthropic' ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Verbindung testen
          </button>
          {anthropicStatus && (
            <span className={`flex items-center gap-1 text-sm ${anthropicStatus.ok ? 'text-green-600' : 'text-red-600'}`}>
              {anthropicStatus.ok ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
              {anthropicStatus.message}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          Konfiguration speichern
        </button>

        {canProceed && (
          <button
            onClick={() => store.setStep(1)}
            className="px-6 py-2.5 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 flex items-center gap-2"
          >
            Weiter zum Upload
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
