import { useEffect, useState } from 'react';
import { Cloud, CloudOff, HardDrive, Upload, Loader2 } from 'lucide-react';
import {
  getLocalMode, setLocalMode, pushLocalToCloud, __local
} from '../../services/trainingAdminService';

/**
 * Zeigt den aktuellen Local/Cloud-Modus an und erlaubt manuelles Umschalten.
 *
 * Anzeige-Logik:
 *   - Wenn local-Mode aktiv: rot/orange Banner mit "Cloud-Push"-Button
 *   - Wenn auto: kleines neutrales Badge
 *   - Wenn off (cloud only): grünes Cloud-Badge
 */
export default function LocalModeBanner({ customerId }) {
  const [mode, setMode] = useState(getLocalMode());
  const [pushing, setPushing] = useState(false);
  const [info, setInfo] = useState(null);
  const [error, setError] = useState(null);
  const localActive = __local.isLocalModeActive();

  useEffect(() => {
    const handler = () => setMode(getLocalMode());
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  function changeMode(next) {
    setLocalMode(next);
    setMode(next);
  }

  async function push() {
    if (!customerId) {
      setError('Bitte zuerst einen Kunden wählen.');
      return;
    }
    setPushing(true);
    setError(null);
    setInfo(null);
    try {
      const stats = await pushLocalToCloud(customerId);
      if (stats.errors?.length) {
        setError(`Push teilweise fehlgeschlagen: ${stats.errors.slice(0, 3).join(' | ')}`);
      } else {
        setInfo(`Cloud-Push: ${stats.tours} Touren, ${stats.slides} Folien, ${stats.branding ? 'Branding' : '–'} hochgeladen.`);
      }
    } catch (e) {
      setError(`Cloud-Push fehlgeschlagen: ${e?.message || e}`);
    } finally { setPushing(false); }
  }

  return (
    <div className="space-y-2">
      <div className="glass-card p-3 flex items-center gap-3 text-sm">
        <ModeIcon mode={mode} localActive={localActive} />
        <div className="flex-1">
          <div className="text-white font-semibold">
            {mode === 'force' && 'Lokaler Modus (offline)'}
            {mode === 'auto' && (localActive ? 'Hybrid-Modus (Cloud + Local-Cache)' : 'Cloud-Modus')}
            {mode === 'off' && 'Nur Cloud (kein Fallback)'}
          </div>
          <div className="text-white/60 text-xs">
            {mode === 'force' && 'Alle Daten in deinem Browser (localStorage). Keine AWS-Aufrufe.'}
            {mode === 'auto' && 'Versucht zuerst AWS, fällt automatisch auf Browser-Cache zurück, wenn AWS nicht erreichbar ist.'}
            {mode === 'off' && 'Nur AWS. Falls AWS down, schlagen alle Aktionen fehl.'}
          </div>
        </div>
        <div className="flex gap-1">
          {['auto', 'force', 'off'].map((m) => (
            <button
              key={m}
              onClick={() => changeMode(m)}
              className={`text-xs px-2 py-1 rounded-md transition-colors ${
                mode === m ? 'bg-indigo-500 text-white' : 'bg-white/5 hover:bg-white/10 text-white/70'
              }`}
            >
              {m === 'auto' ? 'Auto' : m === 'force' ? 'Lokal' : 'Cloud'}
            </button>
          ))}
        </div>
        {localActive && (
          <button
            onClick={push}
            disabled={pushing || !customerId}
            className="ml-2 flex items-center gap-1 text-xs px-3 py-1.5 rounded-md bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 disabled:opacity-50"
            title="Lokale Daten in die Cloud pushen, sobald AWS verfügbar ist"
          >
            {pushing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
            Cloud-Push
          </button>
        )}
      </div>
      {error && <div className="glass-card p-2 border-red-500/30 bg-red-500/10 text-red-300 text-xs">{error}</div>}
      {info && <div className="glass-card p-2 border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-xs">{info}</div>}
    </div>
  );
}

function ModeIcon({ mode, localActive }) {
  if (mode === 'force') return <HardDrive className="w-5 h-5 text-amber-400" />;
  if (mode === 'off') return <Cloud className="w-5 h-5 text-emerald-400" />;
  if (localActive) return <CloudOff className="w-5 h-5 text-amber-300" />;
  return <Cloud className="w-5 h-5 text-emerald-400" />;
}
