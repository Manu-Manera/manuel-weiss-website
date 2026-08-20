import { useState, useEffect } from 'react';
import { 
  Mail, 
  MessageSquare, 
  Calendar, 
  CheckSquare, 
  RefreshCw, 
  Settings, 
  Link2, 
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Loader2,
  Bell,
  Clock
} from 'lucide-react';

const API_BASE = 'https://6i6ysj9c8c.execute-api.eu-central-1.amazonaws.com/v1';
const TASK_EXTRACTOR_API = 'https://5me6gh3a66.execute-api.eu-central-1.amazonaws.com/prod';

const GRAPH_CLIENT_ID = import.meta.env.VITE_GRAPH_CLIENT_ID || '49b513bb-2c34-4916-b35a-780efe72ea4f';
const REDIRECT_URI = `${window.location.origin}/onboarding/task-extractor/callback`;

const SCOPES = [
  'offline_access',
  'Mail.Read',
  'User.Read'
];

export default function TaskExtractorSettings() {
  const [connectionStatus, setConnectionStatus] = useState('checking');
  const [userInfo, setUserInfo] = useState(null);
  const [settings, setSettings] = useState({
    checkInterval: 30,
    summaryTime: '18:00',
    emailsEnabled: true,
    teamsEnabled: true,
    meetingsEnabled: true,
    minConfidence: 0.7
  });
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkConnection();
    checkOAuthCallback();
  }, []);

  async function checkOAuthCallback() {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const error = params.get('error');

    if (error) {
      console.error('OAuth error:', error, params.get('error_description'));
      setConnectionStatus('error');
      window.history.replaceState({}, '', window.location.pathname);
      return;
    }

    if (code) {
      setIsLoading(true);
      try {
        const response = await fetch(`${TASK_EXTRACTOR_API}/oauth-callback`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, redirectUri: REDIRECT_URI })
        });

        if (response.ok) {
          setConnectionStatus('connected');
          await checkConnection();
        } else {
          setConnectionStatus('error');
        }
      } catch (err) {
        console.error('OAuth callback error:', err);
        setConnectionStatus('error');
      }
      setIsLoading(false);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }

  async function checkConnection() {
    try {
      const response = await fetch(`${TASK_EXTRACTOR_API}/status`);
      if (response.ok) {
        const data = await response.json();
        if (data.connected) {
          setConnectionStatus('connected');
          setUserInfo(data.user);
          setStats(data.stats);
        } else {
          setConnectionStatus('disconnected');
        }
      } else {
        setConnectionStatus('disconnected');
      }
    } catch (err) {
      console.error('Connection check error:', err);
      setConnectionStatus('disconnected');
    }
  }

  function startOAuth() {
    if (!GRAPH_CLIENT_ID) {
      alert('Microsoft Graph App nicht konfiguriert. Bitte VITE_GRAPH_CLIENT_ID in .env setzen.');
      return;
    }

    const params = new URLSearchParams({
      client_id: GRAPH_CLIENT_ID,
      response_type: 'code',
      redirect_uri: REDIRECT_URI,
      scope: SCOPES.join(' '),
      response_mode: 'query',
      prompt: 'consent'
    });

    window.location.href = `https://login.microsoftonline.com/organizations/oauth2/v2.0/authorize?${params}`;
  }

  async function disconnect() {
    setIsLoading(true);
    try {
      await fetch(`${TASK_EXTRACTOR_API}/disconnect`, { method: 'POST' });
      setConnectionStatus('disconnected');
      setUserInfo(null);
      setStats(null);
    } catch (err) {
      console.error('Disconnect error:', err);
    }
    setIsLoading(false);
  }

  async function testExtraction() {
    setIsLoading(true);
    try {
      const response = await fetch(`${TASK_EXTRACTOR_API}/test`, {
        method: 'POST'
      });
      const data = await response.json();
      alert(`Test erfolgreich!\n\nGefundene Tasks: ${data.tasksFound || 0}\nVerarbeitete Emails: ${data.emailsProcessed || 0}`);
    } catch (err) {
      alert('Test fehlgeschlagen: ' + err.message);
    }
    setIsLoading(false);
  }

  async function saveSettings() {
    setIsLoading(true);
    try {
      await fetch(`${TASK_EXTRACTOR_API}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      alert('Einstellungen gespeichert!');
    } catch (err) {
      alert('Fehler beim Speichern: ' + err.message);
    }
    setIsLoading(false);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
          Task Extractor
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Automatische Task-Erkennung aus Emails, Teams und Meetings
        </p>
      </div>

      {/* Connection Status */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              connectionStatus === 'connected' 
                ? 'bg-emerald-100 dark:bg-emerald-900/30' 
                : connectionStatus === 'error'
                ? 'bg-red-100 dark:bg-red-900/30'
                : 'bg-slate-100 dark:bg-slate-700'
            }`}>
              {connectionStatus === 'connected' ? (
                <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              ) : connectionStatus === 'error' ? (
                <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              ) : connectionStatus === 'checking' ? (
                <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
              ) : (
                <Link2 className="w-6 h-6 text-slate-400" />
              )}
            </div>
            <div>
              <h2 className="font-semibold text-slate-800 dark:text-white">
                Microsoft 365 Verbindung
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {connectionStatus === 'connected' && userInfo
                  ? `Verbunden als ${userInfo.displayName || userInfo.mail}`
                  : connectionStatus === 'error'
                  ? 'Verbindungsfehler'
                  : connectionStatus === 'checking'
                  ? 'Prüfe Verbindung...'
                  : 'Nicht verbunden'}
              </p>
            </div>
          </div>

          {connectionStatus !== 'connected' && (
            <button
              onClick={startOAuth}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ExternalLink className="w-4 h-4" />
              )}
              Mit Microsoft verbinden
            </button>
          )}

          {connectionStatus === 'connected' && (
            <div className="flex items-center gap-2">
              <button
                onClick={startOAuth}
                className="px-3 py-1.5 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50"
              >
                Anderen Account
              </button>
              <button
                onClick={checkConnection}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Mail, label: 'Emails', enabled: settings.emailsEnabled, key: 'emailsEnabled', color: 'blue' },
          { icon: MessageSquare, label: 'Teams', enabled: settings.teamsEnabled, key: 'teamsEnabled', color: 'purple' },
          { icon: Calendar, label: 'Meetings', enabled: settings.meetingsEnabled, key: 'meetingsEnabled', color: 'orange' },
          { icon: CheckSquare, label: 'To-Do', enabled: true, key: null, color: 'green' }
        ].map((feature) => (
          <div
            key={feature.label}
            className={`p-4 rounded-xl border ${
              feature.enabled
                ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <feature.icon className={`w-5 h-5 ${
                  feature.enabled ? `text-${feature.color}-500` : 'text-slate-400'
                }`} />
                <span className={feature.enabled ? 'text-slate-700 dark:text-slate-200' : 'text-slate-400'}>
                  {feature.label}
                </span>
              </div>
              {feature.key && (
                <button
                  onClick={() => setSettings(s => ({ ...s, [feature.key]: !s[feature.key] }))}
                  className={`w-10 h-6 rounded-full transition-colors ${
                    feature.enabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'
                  }`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                    feature.enabled ? 'translate-x-5' : 'translate-x-1'
                  }`} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Settings */}
      {connectionStatus === 'connected' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Einstellungen
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-slate-400" />
                <div>
                  <div className="font-medium text-slate-700 dark:text-slate-200">Check-Intervall</div>
                  <div className="text-sm text-slate-500">Wie oft nach neuen Nachrichten prüfen</div>
                </div>
              </div>
              <select
                value={settings.checkInterval}
                onChange={(e) => setSettings(s => ({ ...s, checkInterval: parseInt(e.target.value) }))}
                className="px-3 py-2 bg-slate-100 dark:bg-slate-700 border-0 rounded-lg text-slate-700 dark:text-slate-200"
              >
                <option value={15}>Alle 15 Minuten</option>
                <option value={30}>Alle 30 Minuten</option>
                <option value={60}>Stündlich</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-slate-400" />
                <div>
                  <div className="font-medium text-slate-700 dark:text-slate-200">Tages-Zusammenfassung</div>
                  <div className="text-sm text-slate-500">Wann die Übersicht gesendet wird</div>
                </div>
              </div>
              <input
                type="time"
                value={settings.summaryTime}
                onChange={(e) => setSettings(s => ({ ...s, summaryTime: e.target.value }))}
                className="px-3 py-2 bg-slate-100 dark:bg-slate-700 border-0 rounded-lg text-slate-700 dark:text-slate-200"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckSquare className="w-5 h-5 text-slate-400" />
                <div>
                  <div className="font-medium text-slate-700 dark:text-slate-200">Mindest-Konfidenz</div>
                  <div className="text-sm text-slate-500">Wie sicher muss die Task-Erkennung sein</div>
                </div>
              </div>
              <select
                value={settings.minConfidence}
                onChange={(e) => setSettings(s => ({ ...s, minConfidence: parseFloat(e.target.value) }))}
                className="px-3 py-2 bg-slate-100 dark:bg-slate-700 border-0 rounded-lg text-slate-700 dark:text-slate-200"
              >
                <option value={0.5}>50% (mehr Vorschläge)</option>
                <option value={0.7}>70% (ausgewogen)</option>
                <option value={0.9}>90% (nur sichere)</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
            <button
              onClick={saveSettings}
              disabled={isLoading}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium disabled:opacity-50"
            >
              Einstellungen speichern
            </button>
            <button
              onClick={testExtraction}
              disabled={isLoading}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg font-medium disabled:opacity-50"
            >
              Test-Extraktion
            </button>
          </div>
        </div>
      )}

      {/* Stats */}
      {stats && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
            Statistiken (letzte 7 Tage)
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
              <div className="text-2xl font-bold text-indigo-600">{stats.tasksExtracted || 0}</div>
              <div className="text-sm text-slate-500">Tasks erkannt</div>
            </div>
            <div className="text-center p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
              <div className="text-2xl font-bold text-emerald-600">{stats.tasksAccepted || 0}</div>
              <div className="text-sm text-slate-500">Akzeptiert</div>
            </div>
            <div className="text-center p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
              <div className="text-2xl font-bold text-slate-600">{stats.tasksDismissed || 0}</div>
              <div className="text-sm text-slate-500">Ignoriert</div>
            </div>
            <div className="text-center p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{stats.tasksPending || 0}</div>
              <div className="text-sm text-slate-500">Offen</div>
            </div>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 text-sm text-blue-800 dark:text-blue-200">
        <strong>So funktioniert es:</strong> Der Task Extractor prüft regelmässig deine Emails, 
        Teams-Nachrichten und Kalender. Erkannte Tasks werden dir per Telegram vorgeschlagen. 
        Mit einem Klick erstellst du sie in Microsoft To-Do.
      </div>
    </div>
  );
}
