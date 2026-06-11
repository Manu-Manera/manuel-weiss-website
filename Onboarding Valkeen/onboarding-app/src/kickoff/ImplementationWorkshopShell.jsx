import { useEffect, useMemo, useState } from 'react';
import { Outlet, useParams, useSearchParams } from 'react-router-dom';
import '../styles/implementation-workshop-shell.css';
import '../styles/implementation-guide.css';
import { brandingCssVars, normalizeBranding } from './implementationBranding';
import { defaultSession, mergeSession } from './kickoffStudioMerge';
import {
  EDIT_PASSWORD_STORAGE_KEY,
  fetchCloudSession,
  loadLocalSession,
  newSessionId,
  resolveEditPassword,
  saveImplementationSession,
  saveLocalSession,
} from './kickoffStudioService';
import { useImplementationPortal } from '../context/ImplementationPortalContext';
import { useImplPortal } from './useImplPermissions';
import { getArtifact } from './implementationWorkshopCatalog';
import { tx } from './implementationTemplate';
import ImplementationHubBar from './ImplementationHubBar';
import { useImplementationNav } from './useImplementationNav';

function initSession(searchParams) {
  const sid = searchParams.get('s') || searchParams.get('session');
  if (sid) {
    const local = loadLocalSession(sid);
    if (local) return mergeSession(local, local.tenantSlug);
    return mergeSession(defaultSession(sid), '');
  }
  return mergeSession(defaultSession(newSessionId()), '');
}

export default function ImplementationWorkshopShell() {
  const { artifactId, meetingId } = useParams();
  const [searchParams] = useSearchParams();
  const [session, setSession] = useState(() => initSession(searchParams));
  const [password, setPassword] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState('');

  const portalFromHost = useImplPortal();
  const { portalMode: portalFromCtx, portalPassword } = useImplementationPortal();
  const portalMode = portalFromCtx || portalFromHost;
  const nav = useImplementationNav();
  const locale = session.locale || 'de';
  const branding = useMemo(() => normalizeBranding(session.branding), [session.branding]);
  const cssVars = useMemo(() => brandingCssVars(branding), [branding]);

  const artifact = artifactId ? getArtifact(artifactId) : null;
  const meeting = meetingId
    ? (session.meetings || []).find((m) => m.id === meetingId)
    : null;

  const barTitle = meeting
    ? meeting.title || (locale === 'en' ? 'Meeting' : 'Termin')
    : artifact
      ? tx(artifact.title, locale)
      : '';

  useEffect(() => {
    try {
      const stored = localStorage.getItem(EDIT_PASSWORD_STORAGE_KEY);
      if (stored) setPassword(stored);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const sid = searchParams.get('s') || searchParams.get('session');
    if (!sid) return;
    const opts = portalMode
      ? { portalPassword }
      : { facilitatorPassword: resolveEditPassword(password) };
    fetchCloudSession(sid, opts)
      .then((cloud) => {
        if (cloud) setSession((prev) => mergeSession({ ...prev, ...cloud }, prev.tenantSlug));
      })
      .catch(() => {});
  }, [searchParams, portalMode, portalPassword, password]);

  useEffect(() => {
    saveLocalSession(session);
  }, [session]);

  const saveCloud = async () => {
    setSyncing(true);
    setSyncMsg('');
    try {
      await saveImplementationSession(session, {
        portalMode,
        portalPassword,
        facilitatorPassword: password,
        actor: portalMode ? 'customer' : 'facilitator',
      });
      setSyncMsg(locale === 'en' ? 'Saved' : 'Gespeichert');
      try {
        const trimmed = String(password || '').trim();
        if (trimmed) localStorage.setItem(EDIT_PASSWORD_STORAGE_KEY, trimmed);
      } catch {
        /* ignore */
      }
      setTimeout(() => setSyncMsg(''), 2500);
    } catch (e) {
      setSyncMsg(e.message || (locale === 'en' ? 'Error' : 'Fehler'));
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="impl-ws-shell" style={cssVars}>
      <ImplementationHubBar
        title={barTitle}
        locale={locale}
        session={session}
        portalMode={portalMode}
        onSave={saveCloud}
        syncing={syncing}
        syncMsg={syncMsg}
      />
      <div className="impl-ws-body impl-ws-body--embedded">
        <Outlet
          context={{
            session,
            setSession,
            locale,
            portalMode,
            portalPassword,
            password,
            artifact,
            meeting,
            nav,
          }}
        />
      </div>
    </div>
  );
}
