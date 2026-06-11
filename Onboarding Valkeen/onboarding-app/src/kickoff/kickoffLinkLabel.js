/** Kurzname für Kunden-URL: https://<label>.impl.manuel-weiss.ch/?s=… */

const MAX_LEN = 32;
const MIN_LEN = 2;

export function slugifyLinkLabel(raw) {
  if (!raw || typeof raw !== 'string') return '';
  const s = raw
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, MAX_LEN);
  return s.length >= MIN_LEN ? s : '';
}

export function suggestLinkLabelFromCustomer(customer) {
  return slugifyLinkLabel(customer);
}

/** Priorität: manueller Kurzname → Tenant-Vorlage → leer */
export function resolveSubdomainLabel({ linkLabel, tenantSlug }, getTenantBySlug) {
  const custom = slugifyLinkLabel(linkLabel);
  if (custom) return custom;
  const tenant = getTenantBySlug?.(tenantSlug);
  if (tenant?.subdomainSlug) return tenant.subdomainSlug;
  return slugifyLinkLabel(tenant?.slug);
}
