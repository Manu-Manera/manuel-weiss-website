import { useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import KickoffStudioCore from '../kickoff/KickoffStudioCore';
import { slugifyLinkLabel } from '../kickoff/kickoffLinkLabel';
import {
  getTenantByHost,
  getTenantBySlug,
  isKickoffShortHost,
  parseKickoffShortHost,
} from '../kickoff/kickoffTenants';

/**
 * Kunden-/Workshop-Ansicht: volle Bildschirmfläche, keine Onboarding-Sidebar.
 * Route: /kickoff-presenter/:tenantSlug?session=…
 * Custom Domain (z. B. shs-kickoff-studio.ch) → Tenant per Hostname.
 */
export default function KickoffPresenter() {
  const { tenantSlug } = useParams();
  const [searchParams] = useSearchParams();
  const hostContext = parseKickoffShortHost(window.location.hostname);
  const hostTenant = hostContext.tenant || getTenantByHost(window.location.hostname);
  const pathTenant = getTenantBySlug(tenantSlug);
  const pathLinkLabel =
    !pathTenant && tenantSlug ? slugifyLinkLabel(tenantSlug) || tenantSlug : '';
  const resolvedSlug = tenantSlug || hostTenant?.slug || searchParams.get('tenant');
  const tenant = pathTenant || hostTenant;

  useEffect(() => {
    document.documentElement.classList.add('kickoff-presenter-root');
    return () => document.documentElement.classList.remove('kickoff-presenter-root');
  }, []);

  useEffect(() => {
    if (tenantSlug === 'shs') {
      const path = `/onboarding/kickoff-presenter/siemens-healthineers${window.location.search}`;
      window.history.replaceState(null, '', path);
    }
  }, [tenantSlug]);

  /** Kurz-Host testkunde.impl.manuel-weiss.ch → URL nur /?s=… */
  useEffect(() => {
    if (!isKickoffShortHost(window.location.hostname)) return;
    const params = new URLSearchParams(window.location.search);
    const sid = params.get('s') || params.get('session');
    const next = new URLSearchParams();
    if (sid) next.set('s', sid);
    const qs = next.toString();
    const target = qs ? `/?${qs}` : '/';
    if (window.location.pathname !== '/' || window.location.search !== (qs ? `?${qs}` : '')) {
      window.history.replaceState(null, '', target);
    }
  }, []);

  return (
    <KickoffStudioCore
      viewMode="presenter"
      tenantSlug={resolvedSlug}
      linkLabel={hostContext.linkLabel || pathLinkLabel}
    />
  );
}
