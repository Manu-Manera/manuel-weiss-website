import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Lock, Loader2 } from 'lucide-react';
import {
  readPortalPassword,
  sessionPortalReleased,
  sessionRequiresPortalPassword,
  storePortalPassword,
} from '../kickoff/implementationPortalAuth';
import { useImplPortal } from '../kickoff/useImplPermissions';
import { fetchCloudSession } from '../kickoff/kickoffStudioService';
import { brandingCssVars, DEFAULT_BRANDING } from '../kickoff/implementationBranding';
import '../styles/implementation-guide.css';

const ImplementationPortalContext = createContext(null);

function PortalPasswordGate({ sessionId, locale, onAuthed }) {
  const [pw, setPw] = useState(readPortalPassword(sessionId));
  const [err, setErr] = useState('');
  const [checking, setChecking] = useState(false);

  const tryAuth = async (e) => {
    e?.preventDefault();
    setChecking(true);
    setErr('');
    try {
      const cloud = await fetchCloudSession(sessionId, { portalPassword: pw });
      if (!cloud) {
        setErr(locale === 'en' ? 'Project not found' : 'Projekt nicht gefunden');
        return;
      }
      if (!sessionPortalReleased(cloud)) {
        setErr(locale === 'en' ? 'Portal not released yet' : 'Portal noch nicht freigegeben');
        return;
      }
      storePortalPassword(sessionId, pw);
      onAuthed(cloud);
    } catch (ex) {
      const msg = ex.message || '';
      if (msg.includes('PORTAL_AUTH') || msg.includes('portal password')) {
        setErr(locale === 'en' ? 'Wrong portal password' : 'Falsches Portal-Passwort');
      } else {
        setErr(msg || (locale === 'en' ? 'Login failed' : 'Anmeldung fehlgeschlagen'));
      }
    } finally {
      setChecking(false);
    }
  };

  return (
    <div
      className="impl-guide impl-portal-gate"
      style={{
        ...brandingCssVars(DEFAULT_BRANDING),
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <form className="impl-glass impl-portal-gate-card" onSubmit={tryAuth} style={{ padding: 24, maxWidth: 360, width: '100%' }}>
        <Lock className="w-8 h-8" style={{ color: 'var(--impl-primary)', marginBottom: 12 }} />
        <h2 style={{ margin: '0 0 8px', fontSize: 20 }}>
          {locale === 'en' ? 'Customer portal' : 'Kundenportal'}
        </h2>
        <p style={{ margin: '0 0 16px', fontSize: 13, color: 'var(--impl-text-soft)' }}>
          {locale === 'en' ? 'Enter the portal password from your facilitator.' : 'Bitte Portal-Passwort vom Facilitator eingeben.'}
        </p>
        <input
          className="impl-input"
          type="password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          placeholder={locale === 'en' ? 'Portal password' : 'Portal-Passwort'}
          autoComplete="current-password"
        />
        {err && <p style={{ color: '#f87171', fontSize: 13, margin: '10px 0 0' }}>{err}</p>}
        <button className="impl-btn impl-btn--primary" type="submit" disabled={checking} style={{ marginTop: 14, width: '100%' }}>
          {checking ? <Loader2 className="w-4 h-4 animate-spin" /> : locale === 'en' ? 'Enter' : 'Zugang'}
        </button>
      </form>
    </div>
  );
}

export function ImplementationPortalProvider({ children }) {
  const portalMode = useImplPortal();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('s') || searchParams.get('session') || '';
  const [boot, setBoot] = useState(null);
  const [loading, setLoading] = useState(portalMode && !!sessionId);
  const [gateErr, setGateErr] = useState('');

  const portalPassword = readPortalPassword(sessionId);
  const locale = boot?.locale || searchParams.get('locale') || 'de';

  const load = useCallback(async () => {
    if (!portalMode || !sessionId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setGateErr('');
    try {
      const cloud = await fetchCloudSession(sessionId, { portalPassword });
      if (!cloud) {
        setGateErr('NOT_FOUND');
        setBoot(null);
        return;
      }
      if (!sessionPortalReleased(cloud)) {
        setGateErr('NOT_RELEASED');
        setBoot(null);
        return;
      }
      if (sessionRequiresPortalPassword(cloud) && !portalPassword) {
        setGateErr('AUTH');
        setBoot(null);
        return;
      }
      setBoot(cloud);
    } catch (e) {
      if (e.message?.includes('PORTAL_AUTH')) setGateErr('AUTH');
      else setGateErr(e.message || 'LOAD');
      setBoot(null);
    } finally {
      setLoading(false);
    }
  }, [portalMode, sessionId, portalPassword]);

  useEffect(() => {
    void load();
  }, [load]);

  const value = useMemo(
    () => ({
      portalMode,
      sessionId,
      portalPassword,
      portalBoot: boot,
      reloadPortal: load,
    }),
    [portalMode, sessionId, portalPassword, boot, load]
  );

  if (!portalMode) {
    return (
      <ImplementationPortalContext.Provider value={value}>
        {children}
      </ImplementationPortalContext.Provider>
    );
  }

  if (!sessionId) {
    return (
      <div className="impl-guide" style={{ padding: 40, textAlign: 'center' }}>
        {locale === 'en' ? 'Missing project link (?s=…)' : 'Projekt-Link fehlt (?s=…)'}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="impl-guide flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--impl-primary)' }} />
      </div>
    );
  }

  if (gateErr === 'AUTH') {
    return (
      <PortalPasswordGate
        sessionId={sessionId}
        locale={locale}
        onAuthed={(cloud) => {
          setBoot(cloud);
          setGateErr('');
        }}
      />
    );
  }

  if (gateErr === 'NOT_FOUND' || gateErr === 'NOT_RELEASED') {
    return (
      <div className="impl-guide" style={{ padding: 40, textAlign: 'center' }}>
        {gateErr === 'NOT_RELEASED'
          ? locale === 'en'
            ? 'This portal has not been released yet.'
            : 'Dieses Portal wurde noch nicht freigegeben.'
          : locale === 'en'
            ? 'Project not found.'
            : 'Projekt nicht gefunden.'}
      </div>
    );
  }

  return (
    <ImplementationPortalContext.Provider value={value}>
      {children}
    </ImplementationPortalContext.Provider>
  );
}

export function useImplementationPortal() {
  return useContext(ImplementationPortalContext) || {
    portalMode: false,
    sessionId: '',
    portalPassword: '',
    portalBoot: null,
    reloadPortal: async () => {},
  };
}
