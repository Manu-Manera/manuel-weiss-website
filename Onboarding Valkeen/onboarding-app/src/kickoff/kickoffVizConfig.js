import { buildDefaultModulesInScope, KICKOFF_MODULES } from './kickoffModuleCatalog';
import { getTenantBySlug } from './kickoffTenants';

export function defaultVizConfig(tenantOrSlug) {
  const tenant =
    typeof tenantOrSlug === 'string'
      ? getTenantBySlug(tenantOrSlug)
      : tenantOrSlug || null;
  return {
    modulesInScope: buildDefaultModulesInScope(tenant),
  };
}

/** Session aus Cloud/Local: fehlende Keys mit Defaults auffüllen */
export function normalizeVizConfig(vizConfig, tenantOrSlug) {
  const tenant =
    typeof tenantOrSlug === 'string'
      ? getTenantBySlug(tenantOrSlug)
      : tenantOrSlug || null;
  const defaults = buildDefaultModulesInScope(tenant);
  const stored = vizConfig?.modulesInScope || {};
  const modulesInScope = {};
  for (const m of KICKOFF_MODULES) {
    modulesInScope[m.id] =
      typeof stored[m.id] === 'boolean' ? stored[m.id] : defaults[m.id];
  }
  return { modulesInScope };
}

export function toggleModuleInScope(modulesInScope, moduleId) {
  return {
    ...modulesInScope,
    [moduleId]: !modulesInScope[moduleId],
  };
}

export function applyTenantModulePreset(tenantOrSlug) {
  return defaultVizConfig(tenantOrSlug);
}
