import { resolveSubdomainLabel } from './kickoffLinkLabel';
import { getTenantBySlug, KICKOFF_SUBDOMAIN_BASE } from './kickoffTenants';

const BASE = () => import.meta.env.BASE_URL || '/onboarding/';

/** CloudFront-Ziel (manuel-weiss Distribution) — für DNS-Anleitung */
export const CLOUDFRONT_CNAME_TARGET = 'd2wfiswblfliss.cloudfront.net';

function appendSessionParams(url, opts, { short = false } = {}) {
  if (opts.sessionId) {
    url.searchParams.set(short ? 's' : 'session', opts.sessionId);
  }
  if (short) {
    const name = opts.customer?.trim();
    if (name) url.searchParams.set('c', name.slice(0, 120));
    return url.href;
  }
  if (opts.customer) url.searchParams.set('customer', opts.customer);
  if (opts.locale) url.searchParams.set('locale', opts.locale);
  if (opts.includeIntegrations != null) {
    url.searchParams.set('integrations', opts.includeIntegrations ? '1' : '0');
  }
  if (opts.workshopCaptureEnabled) {
    url.searchParams.set('capture', '1');
  }
  return url.href;
}

/**
 * Kürzeste Kunden-URL: https://shs.impl.manuel-weiss.ch/?s=<session>
 * (Tenant + Locale aus Host/Voreinstellung — kein langer Pfad).
 */
export function kickoffSubdomainHref(opts) {
  const label = resolveSubdomainLabel(opts, getTenantBySlug);
  const host = label ? `${label}.${KICKOFF_SUBDOMAIN_BASE}` : KICKOFF_SUBDOMAIN_BASE;
  const url = new URL('/', `https://${host}/`);
  return appendSessionParams(url, opts, { short: true });
}

export function kickoffSubdomainPreviewHost(opts) {
  const label = resolveSubdomainLabel(opts, getTenantBySlug);
  return label ? `${label}.${KICKOFF_SUBDOMAIN_BASE}` : `….${KICKOFF_SUBDOMAIN_BASE}`;
}

/** Eigene Kunden-Domain (z. B. kunde-kickoff-studio.ch) — optional, mehr DNS-Aufwand */
export function kickoffPresenterHref({
  tenantSlug,
  sessionId,
  customer,
  locale,
  includeIntegrations,
  workshopCaptureEnabled,
  usePreferredDomain = true,
}) {
  const tenant = getTenantBySlug(tenantSlug);
  const origin =
    usePreferredDomain && tenant?.preferredOrigin
      ? tenant.preferredOrigin.replace(/\/$/, '')
      : window.location.origin;

  const path = tenantSlug
    ? `${BASE().replace(/^\//, '')}/kickoff-presenter/${tenantSlug}`.replace(/\/+/g, '/')
    : `${BASE().replace(/^\//, '')}/kickoff-presenter`.replace(/\/+/g, '/');

  const url = new URL(path, origin.endsWith('/') ? origin : `${origin}/`);
  return appendSessionParams(url, {
    sessionId,
    customer,
    locale,
    includeIntegrations,
    workshopCaptureEnabled,
  });
}

/** Direkt auf manuel-weiss.ch — mit Kunden-Kurzname im Pfad wenn vorhanden */
export function kickoffPresenterFallbackHref(opts) {
  const label = resolveSubdomainLabel(opts, getTenantBySlug);
  const tenant = getTenantBySlug(opts.tenantSlug);
  const pathSegment = label || tenant?.slug || opts.tenantSlug || '';

  if (!pathSegment) {
    return kickoffPresenterHref({ ...opts, usePreferredDomain: false });
  }

  const origin = window.location.origin;
  const path = `${BASE().replace(/^\//, '')}/kickoff-presenter/${pathSegment}`.replace(
    /\/+/g,
    '/'
  );
  const url = new URL(path, origin.endsWith('/') ? origin : `${origin}/`);
  return appendSessionParams(url, opts, { short: true });
}

/** Öffnen: kundenspezifische Subdomain, sonst Pfad auf Hauptdomain */
export function kickoffCustomerOpenHref(opts) {
  const label = resolveSubdomainLabel(opts, getTenantBySlug);
  if (label) return kickoffSubdomainHref(opts);
  return kickoffPresenterFallbackHref(opts);
}

/** Teilen: kurze Subdomain-URL (Kurzname in der Adresszeile), sonst Pfad-Fallback */
export function kickoffCustomerShareHref(opts) {
  const label = resolveSubdomainLabel(opts, getTenantBySlug);
  if (label) return kickoffSubdomainHref(opts);
  return kickoffPresenterFallbackHref(opts);
}

/** Einmalige DNS-Einrichtung für alle Kunden-Subdomains */
export function dnsSetupSimpleWildcard() {
  return [
    `Kunden-Link (bereits eingerichtet): https://<kurz>.${KICKOFF_SUBDOMAIN_BASE}/?s=<session>`,
    `Kurzname frei wählbar (z. B. acme → acme.impl.manuel-weiss.ch)`,
    `CloudFront + Route53: impl + *.impl → ${CLOUDFRONT_CNAME_TARGET}`,
    'Keine extra Domain pro Kunde nötig — gleicher S3-Bucket wie die Website.',
  ];
}

export function dnsSetupStepsCustomDomain(tenant) {
  if (!tenant) return [];
  return [
    `Optional: eigene Domain beim Kunden (z. B. ${tenant.hosts?.[0]})`,
    `CNAME @ und www → ${CLOUDFRONT_CNAME_TARGET}`,
    `Domain in CloudFront + ACM (us-east-1) als Alias hinzufügen`,
    `Dann zeigt die Adresszeile nur die Kunden-Domain (ohne manuel-weiss.ch).`,
  ];
}

/** @deprecated use dnsSetupSimpleWildcard */
export function dnsSetupSteps(tenant) {
  return dnsSetupStepsCustomDomain(tenant);
}
