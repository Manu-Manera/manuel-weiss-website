import { useEffect, useState } from 'react';
import { GraduationCap, Play, ExternalLink, Loader2, AlertTriangle, Mail, ShieldCheck, Globe } from 'lucide-react';
import {
  listTours, getBranding, requestMagicLink, getCustomerIndex,
  getAuth, setAuth as persistAuth, clearAuth
} from '../../services/trainingAdminService';
import { useExtensionStatus, syncAuthToExtension, startTour, EXTENSION_INSTALL_DOC } from './ExtensionBridge';

const LOCAL_CUSTOMER_KEY = 'training-trainee-customer';

export default function TraineeHub() {
  const ext = useExtensionStatus();
  const [auth, setAuthState] = useState(getAuth());
  const [customers, setCustomers] = useState([]);
  const [customerId, setCustomerId] = useState(() => {
    try { return localStorage.getItem(LOCAL_CUSTOMER_KEY) || null; } catch { return null; }
  });
  const [branding, setBranding] = useState(null);
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);
  const [emailDraft, setEmailDraft] = useState('');
  const [loginBusy, setLoginBusy] = useState(false);

  useEffect(() => {
    void (async () => {
      const idx = await getCustomerIndex();
      setCustomers(idx.customers || []);
      if (!customerId && idx.customers?.length === 1) {
        setCustomerId(idx.customers[0].customerId);
      }
    })();
  }, []);

  useEffect(() => {
    if (customerId) {
      try { localStorage.setItem(LOCAL_CUSTOMER_KEY, customerId); } catch {}
    }
  }, [customerId]);

  useEffect(() => {
    if (!auth || !customerId || auth.customerId !== customerId) {
      setBranding(null);
      setTours([]);
      return;
    }
    setLoading(true);
    setError(null);
    Promise.all([getBranding(customerId).catch(() => null), listTours(customerId).catch(() => ({ tours: [] }))])
      .then(([b, t]) => {
        setBranding(b);
        setTours(t?.tours || []);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [auth, customerId]);

  async function login() {
    if (!emailDraft || !customerId) {
      setError('Bitte E-Mail und Kunde wählen.');
      return;
    }
    setLoginBusy(true);
    setError(null);
    try {
      const res = await requestMagicLink({ email: emailDraft, customerId, role: 'trainee' });
      if (res?.token) {
        const next = {
          token: res.token,
          customerId: res.customerId,
          userId: res.userId,
          role: res.role,
          expiresAt: res.expiresAt
        };
        persistAuth(next);
        setAuthState(next);
        const synced = await syncAuthToExtension();
        if (synced) {
          setInfo('Eingeloggt – Extension verbunden. Du kannst eine Tour starten.');
        } else {
          setInfo(
            'Eingeloggt im Hub. Falls die Extension noch „Nicht eingeloggt“ zeigt: unter chrome://extensions die Extension „Neu laden“, dann diese Seite neu laden und erneut „Einloggen“.'
          );
        }
        setTimeout(() => setInfo(null), synced ? 3500 : 12000);
      }
    } catch (e) {
      setError(`Login fehlgeschlagen: ${e.message}`);
    } finally { setLoginBusy(false); }
  }

  function logout() {
    clearAuth();
    setAuthState(null);
  }

  async function handleStart(tour) {
    setError(null);
    setInfo(null);
    if (ext.installed === false) {
      setError('Browser-Extension nicht installiert. Bitte zuerst installieren.');
      return;
    }
    const synced = await syncAuthToExtension();
    if (!synced) {
      setError('Auth konnte nicht an Extension gesendet werden – bitte erneut einloggen.');
      return;
    }
    const tempusUrl = tour.domainHint || branding?.domainHint
      ? `https://${tour.domainHint || branding.domainHint}/`
      : null;
    if (tempusUrl) {
      window.open(tempusUrl, 'tempus_app');
    }
    const res = await startTour(tour.id, customerId);
    if (!res.ok) {
      setError(`Tour konnte nicht gestartet werden (${res.reason}). Tempus-Tab offen halten und erneut versuchen.`);
    } else {
      setInfo(`Tour "${tour.title}" wurde an deinen Tempus-Tab geschickt. Wechsle zum Tempus-Fenster.`);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3 scroll-mt-24">
            <GraduationCap className="w-8 h-8 text-indigo-400 shrink-0" />
            Tempus Training
          </h1>
          <p className="text-white/60">
            Live-Trainings direkt auf deiner Tempus-Instanz – mit Tipps, Highlights und Theorie-Folien.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ExtensionStatusBadge ext={ext} />
          {typeof window !== 'undefined' && window.self !== window.top ? (
            <span className="text-[11px] text-white/45 max-w-md">
              Vorschau eingebettet: Extension-Check greift oft nicht – zum Testen echtes Chrome-Fenster nutzen.
            </span>
          ) : null}
        </div>
      </div>

      {/* Customer + Login */}
      <div className="glass-card p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-white/60 mb-1 flex items-center gap-1">
              <Globe className="w-3.5 h-3.5" /> Kunde
            </label>
            <select
              value={customerId || ''}
              onChange={(e) => setCustomerId(e.target.value || null)}
              className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white"
            >
              <option value="">– wählen –</option>
              {customers.map((c) => (
                <option key={c.customerId} value={c.customerId}>{c.customerName}</option>
              ))}
            </select>
          </div>
          {!auth && (
            <div>
              <label className="block text-sm text-white/60 mb-1 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5" /> E-Mail (Magic-Link)
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={emailDraft}
                  onChange={(e) => setEmailDraft(e.target.value)}
                  placeholder="vorname.nachname@kunde.de"
                  className="flex-1 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white"
                />
                <button
                  onClick={login}
                  disabled={loginBusy || !customerId || !emailDraft}
                  className="flex items-center gap-1 px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white text-sm"
                >
                  {loginBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                  Einloggen
                </button>
              </div>
            </div>
          )}
          {auth && (
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <label className="block text-sm text-white/60 mb-1">Eingeloggt als</label>
                <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm">
                  {auth.userId} <span className="text-white/40">({auth.customerId})</span>
                </div>
              </div>
              <button onClick={logout} className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-sm">Abmelden</button>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="glass-card p-3 border-red-500/30 bg-red-500/10 text-red-300 text-sm flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
      {info && <div className="glass-card p-3 border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-sm">{info}</div>}

      {/* Tours */}
      {auth && customerId && (
        <div>
          {loading ? (
            <div className="flex items-center gap-2 text-white/60"><Loader2 className="w-4 h-4 animate-spin" /> Lade Touren…</div>
          ) : tours.length === 0 ? (
            <div className="glass-card p-6 text-center text-white/60 space-y-2">
              <p>Noch keine Touren für diesen Kunden veröffentlicht.</p>
              {customerId?.toLowerCase() === 'test' && (
                <p className="text-sm text-indigo-200/90">
                  Tipp: Wähle den Kunden <strong className="text-white">Demo Kunde</strong> oder lege Touren unter{' '}
                  <strong className="text-white">Training Admin</strong> an (Modus „Lokal“, wenn AWS noch nicht erreichbar ist).
                </p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tours.map((t) => (
                <div key={t.id} className="glass-card p-5 flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-white font-semibold">{t.title}</h3>
                      {t.audience?.length ? (
                        <div className="text-xs text-indigo-300 mt-1">{t.audience.join(' · ')}</div>
                      ) : null}
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300">veröffentlicht</span>
                  </div>
                  <button
                    onClick={() => handleStart(t)}
                    disabled={ext.installed === false}
                    className="mt-auto flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white text-sm"
                  >
                    <Play className="w-4 h-4" /> Tour starten
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {!auth && (
        <div className="glass-card p-5 text-sm text-white/70">
          Bitte einloggen, um Touren für deinen Kunden zu sehen.
        </div>
      )}
    </div>
  );
}

function ExtensionStatusBadge({ ext }) {
  if (ext.installed === null) {
    return <span className="text-xs text-white/40 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Prüfe Extension…</span>;
  }
  if (ext.installed) {
    return <span className="text-xs px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-300">Extension v{ext.version} aktiv</span>;
  }
  return (
    <a
      href={EXTENSION_INSTALL_DOC}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => {
        e.preventDefault();
        try {
          const url = new URL(EXTENSION_INSTALL_DOC, window.location.origin).href;
          const opened = window.open(url, '_blank', 'noopener,noreferrer');
          if (!opened) window.location.assign(url);
        } catch {
          window.location.assign(`${window.location.origin}${EXTENSION_INSTALL_DOC}`);
        }
      }}
      className="text-xs px-3 py-1.5 rounded-lg bg-amber-500/15 text-amber-300 flex items-center gap-1 hover:bg-amber-500/25 cursor-pointer"
    >
      <ExternalLink className="w-3 h-3" /> Browser-Extension installieren
    </a>
  );
}
