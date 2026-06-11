/**
 * Kunden-Tenants für Kick-off Links & Hostname-Erkennung.
 * UI zeigt nur `customer` (voller Name), nie interne Slugs/Kürzel.
 */

/**
 * Kurze Kunden-URLs: https://<kurz>.impl.manuel-weiss.ch/?s=…
 * (Wildcard-DNS + ACM auf CloudFront E305V0ATIXMNNG — live)
 */
export const KICKOFF_SUBDOMAIN_BASE = 'impl.manuel-weiss.ch';

/** Frühere Kurz-URLs (Weiterleitung/Erkennung bleibt aktiv) */
export const KICKOFF_SUBDOMAIN_LEGACY_BASE = 'k.manuel-weiss.ch';

const SHORT_SUBDOMAIN_RE = /^([a-z0-9-]+)\.(impl|k)\.manuel-weiss\.ch$/;

export const KICKOFF_TENANTS = [
  {
    slug: 'siemens-healthineers',
    subdomainSlug: 'shs',
    legacySlugs: ['shs'],
    customer: 'Siemens Healthineers',
    localeDefault: 'de',
    includeIntegrationsDefault: true,
    titleDe: 'Tempus Resource · Kick-off',
    titleEn: 'Tempus Resource · Kick-off',
    hosts: [
      'shs-kickoff-studio.ch',
      'www.shs-kickoff-studio.ch',
      'siemens-healthineers-kickoff-studio.ch',
    ],
    preferredOrigin: 'https://shs-kickoff-studio.ch',
  },
  {
    slug: 'horizon',
    subdomainSlug: 'hzn',
    customer: 'Horizon Program',
    localeDefault: 'en',
    includeIntegrationsDefault: true,
    titleDe: 'Tempus Resource · Kick-off',
    titleEn: 'Tempus Resource · Kick-off',
    hosts: ['horizon-kickoff-studio.ch', 'www.horizon-kickoff-studio.ch'],
    preferredOrigin: 'https://horizon-kickoff-studio.ch',
  },
  {
    slug: 'knauf',
    subdomainSlug: 'knf',
    customer: 'Knauf',
    localeDefault: 'de',
    includeIntegrationsDefault: false,
    titleDe: 'Tempus Resource · Kick-off',
    titleEn: 'Tempus Resource · Kick-off',
    hosts: ['knauf-kickoff-studio.ch', 'www.knauf-kickoff-studio.ch'],
    preferredOrigin: 'https://knauf-kickoff-studio.ch',
  },
];

export function getTenantBySlug(slug) {
  if (!slug) return null;
  const s = slug.toLowerCase();
  return (
    KICKOFF_TENANTS.find((t) => t.slug === s) ||
    KICKOFF_TENANTS.find((t) => t.legacySlugs?.includes(s)) ||
    null
  );
}

/** z. B. shs.impl.manuel-weiss.ch */
export function tenantSubdomainHost(slug) {
  if (!slug) return KICKOFF_SUBDOMAIN_BASE;
  const tenant = getTenantBySlug(slug);
  const label = tenant?.subdomainSlug || tenant?.slug || slug;
  return `${label}.${KICKOFF_SUBDOMAIN_BASE}`;
}

export function isKickoffShortHost(hostname) {
  const h = (hostname || '').toLowerCase().replace(/\.$/, '');
  return SHORT_SUBDOMAIN_RE.test(h);
}

/** Beliebiger Kurzname aus *.impl.manuel-weiss.ch (auch ohne Tenant-Vorlage). */
export function getLinkLabelFromHost(hostname) {
  const h = (hostname || '').toLowerCase().replace(/\.$/, '');
  const sub = h.match(SHORT_SUBDOMAIN_RE);
  return sub?.[1] || '';
}

/** Host-Kontext für Kunden-URLs: bekannte Vorlage oder freier Kurzname. */
export function parseKickoffShortHost(hostname) {
  const linkLabel = getLinkLabelFromHost(hostname);
  if (!linkLabel) return { tenant: null, linkLabel: '' };
  const tenant =
    KICKOFF_TENANTS.find((t) => t.subdomainSlug === linkLabel) ||
    getTenantBySlug(linkLabel) ||
    null;
  return { tenant, linkLabel };
}

export function getTenantByHost(hostname) {
  const h = (hostname || '').toLowerCase().replace(/\.$/, '');

  const sub = h.match(SHORT_SUBDOMAIN_RE);
  if (sub) {
    const label = sub[1];
    return (
      KICKOFF_TENANTS.find((t) => t.subdomainSlug === label) ||
      getTenantBySlug(label)
    );
  }

  const legacyKickoff = h.match(/^([a-z0-9-]+)\.kickoff\.manuel-weiss\.ch$/);
  if (legacyKickoff) return getTenantBySlug(legacyKickoff[1]);

  if (
    h === KICKOFF_SUBDOMAIN_BASE ||
    h === KICKOFF_SUBDOMAIN_LEGACY_BASE ||
    h === 'kickoff.manuel-weiss.ch'
  ) {
    return null;
  }

  return KICKOFF_TENANTS.find((t) => t.hosts?.some((host) => host.toLowerCase() === h)) || null;
}
