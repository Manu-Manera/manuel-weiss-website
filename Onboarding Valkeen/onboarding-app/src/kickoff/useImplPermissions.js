import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { isKickoffShortHost } from './kickoffTenants';

export const RIGHTS_LABEL = {
  de: { edit: 'Bearbeiten', view: 'Nur ansehen', hidden: 'Versteckt' },
  en: { edit: 'Edit', view: 'View only', hidden: 'Hidden' },
};

/** Kundenportal: impl-Subdomain oder ?portal=1 */
export function useImplPortal() {
  const [searchParams] = useSearchParams();
  const hostPortal =
    typeof window !== 'undefined' && isKickoffShortHost(window.location.hostname);
  const queryPortal = searchParams.get('portal') === '1';
  return hostPortal || queryPortal;
}

function level(session, module) {
  const perms = session?.modulePermissions || {};
  return perms[module] || 'view';
}

export function buildImplPermissions(session, portalMode, locale = 'de') {
  const isFacilitator = !portalMode;
  const loc = locale === 'en' ? 'en' : 'de';

  return {
    portalMode,
    isFacilitator,
    canView(module) {
      if (isFacilitator) return true;
      return level(session, module) !== 'hidden';
    },
    canEdit(module) {
      if (isFacilitator) return true;
      return level(session, module) === 'edit';
    },
    isHidden(module) {
      if (isFacilitator) return false;
      return level(session, module) === 'hidden';
    },
    rightLabel(module) {
      const p = isFacilitator ? 'edit' : level(session, module);
      return RIGHTS_LABEL[loc][p] || p;
    },
  };
}

export function useImplPermissions(session, portalMode) {
  const locale = session?.locale || 'de';
  return useMemo(
    () => buildImplPermissions(session, portalMode, locale),
    [session, portalMode, locale, session?.modulePermissions]
  );
}

/** Modul-Key für Register-Tabs */
export function registerModuleForTab(tab) {
  if (tab === 'users') return 'stakeholders';
  if (tab === 'roles') return 'roles';
  if (tab === 'uat') return 'uat';
  if (tab === 'risks') return 'risks';
  return 'registers';
}
