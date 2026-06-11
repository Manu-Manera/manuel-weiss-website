import { useState } from 'react';
import { Check, Copy, Globe, Link2 } from 'lucide-react';
import { suggestLinkLabelFromCustomer } from './kickoffLinkLabel';
import { KICKOFF_TENANTS, KICKOFF_SUBDOMAIN_BASE } from './kickoffTenants';
import {
  dnsSetupSimpleWildcard,
  dnsSetupStepsCustomDomain,
  kickoffCustomerOpenHref,
  kickoffCustomerShareHref,
  kickoffPresenterFallbackHref,
  kickoffPresenterHref,
} from './kickoffTenantUrls';
import { ui } from './kickoffStudioI18n';

export default function KickoffTenantLinksPanel({ locale, session, onSelectTenant }) {
  const t = (key) => ui(locale, key);
  const [copiedKey, setCopiedKey] = useState('');

  const linkOpts = {
    tenantSlug: session.tenantSlug,
    linkLabel: session.linkLabel || suggestLinkLabelFromCustomer(session.customer),
    sessionId: session.sessionId,
    customer: session.customer,
    locale: session.locale,
    includeIntegrations: session.includeIntegrations,
    workshopCaptureEnabled: session.workshopCaptureEnabled,
  };

  const copy = (key, text) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(''), 2000);
  };

  const shortHref = kickoffCustomerShareHref(linkOpts);
  const openHref = kickoffCustomerOpenHref(linkOpts);
  const fallbackHref = kickoffPresenterFallbackHref(linkOpts);

  return (
    <div className="kickoff-tenant-panel rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-4">
      <div className="flex items-center gap-2 text-white/90 font-medium">
        <Globe className="w-5 h-5 text-[#00a878]" />
        {t('customerLinks')}
      </div>

      <p className="text-sm text-white/70 m-0">{t('customerLinksHint')}</p>

      <div className="rounded-xl border border-[#00a878]/35 bg-[#00a878]/10 p-4 text-sm text-white/80 space-y-3">
        <code className="text-[#7dffd4] text-xs block break-all">{shortHref}</code>
        <p className="text-xs text-white/55 m-0">{t('customerUrlFallbackHint')}</p>
        <code className="text-white/60 text-xs block break-all">{fallbackHref}</code>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="kickoff-btn-primary text-sm"
            onClick={() => copy('sub', shortHref)}
          >
            {copiedKey === 'sub' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {t('copySubdomainLink')}
          </button>
          <a
            href={openHref}
            target="_blank"
            rel="noreferrer"
            className="kickoff-btn-secondary text-sm"
          >
            {t('openPresenter')}
          </a>
          <button
            type="button"
            className="kickoff-btn-secondary text-sm"
            onClick={() => copy('fb', fallbackHref)}
          >
            {copiedKey === 'fb' ? <Check className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
            {t('copyFallbackLink')}
          </button>
        </div>
      </div>

      <div>
        <p className="text-xs text-white/55 m-0 mb-2">{t('tenantPresets')}</p>
        <div className="flex flex-wrap gap-2">
          {KICKOFF_TENANTS.map((tenant) => (
            <button
              key={tenant.slug}
              type="button"
              className={`kickoff-chip ${session.tenantSlug === tenant.slug ? 'kickoff-chip-active' : ''}`}
              onClick={() => onSelectTenant?.(tenant)}
              title={t('tenantPresetHint')}
            >
              {tenant.customer}
            </button>
          ))}
        </div>
      </div>

      <details className="text-sm text-white/60">
        <summary className="cursor-pointer text-white/75">{t('dnsSimpleSetup')}</summary>
        <ol className="mt-2 space-y-1 list-decimal pl-5">
          {dnsSetupSimpleWildcard().map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      </details>

      {session.tenantSlug &&
        KICKOFF_TENANTS.filter((x) => x.slug === session.tenantSlug).map((tenant) => (
          <details key={tenant.slug} className="text-sm text-white/60">
            <summary className="cursor-pointer text-white/75">{t('dnsCustomDomain')}</summary>
            <p className="mt-2 text-white/55">{t('dnsCustomHint')}</p>
            <ol className="mt-2 space-y-1 list-decimal pl-5">
              {dnsSetupStepsCustomDomain(tenant).map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
            <button
              type="button"
              className="kickoff-btn-secondary text-sm mt-2"
              onClick={() =>
                copy(`cust-${tenant.slug}`, kickoffPresenterHref({ ...linkOpts, tenantSlug: tenant.slug }))
              }
            >
              {t('copyCustomDomainLink')}
            </button>
          </details>
        ))}
    </div>
  );
}
