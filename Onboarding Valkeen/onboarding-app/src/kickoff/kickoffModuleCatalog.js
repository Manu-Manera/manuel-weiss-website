/**
 * Tempus-Module wie im Original-Kickoff (In-Scope-Kacheln mit gelber Umrandung).
 * defaultInScope = typisches SHS/Enterprise-Wave-1-Muster — pro Kunde in der Session anpassbar.
 */
export const KICKOFF_MODULES = [
  {
    id: 'spm',
    labelEn: 'Strategic Portfolio Management',
    labelDe: 'Strategisches Portfoliomanagement',
    defaultInScope: false,
  },
  {
    id: 'portfolio-kanban',
    labelEn: 'Portfolio Kanban',
    labelDe: 'Portfolio Kanban',
    defaultInScope: false,
  },
  {
    id: 'project-program',
    labelEn: 'Project & Program Management',
    labelDe: 'Projekt- & Programmmanagement',
    defaultInScope: true,
  },
  {
    id: 'project-budget',
    labelEn: 'Project Budget Management',
    labelDe: 'Projektbudget-Management',
    defaultInScope: false,
  },
  {
    id: 'bi-reporting',
    labelEn: 'BI, Reporting & Analytics',
    labelDe: 'BI, Reporting & Analytics',
    defaultInScope: false,
  },
  {
    id: 'sheets-storage',
    labelEn: 'Sheets & File Storage',
    labelDe: 'Sheets & Dateiablage',
    defaultInScope: false,
  },
  {
    id: 'resource-capacity',
    labelEn: 'Resource & Capacity Management',
    labelDe: 'Ressourcen- & Kapazitätsmanagement',
    defaultInScope: true,
  },
  {
    id: 'roadmapping',
    labelEn: 'Strategic & Product Roadmapping',
    labelDe: 'Strategisches & Produkt-Roadmapping',
    defaultInScope: false,
  },
  {
    id: 'resource-request',
    labelEn: 'Resource Request & Approval',
    labelDe: 'Ressourcenanfrage & Freigabe',
    defaultInScope: true,
  },
  {
    id: 'skills',
    labelEn: 'Skill- & Competency Management',
    labelDe: 'Skill- & Kompetenzmanagement',
    defaultInScope: false,
  },
  {
    id: 'scenario',
    labelEn: 'Scenario Planning & Simulation',
    labelDe: 'Szenario-Planung & Simulation',
    defaultInScope: true,
  },
  {
    id: 'timesheets',
    labelEn: 'Time-Sheets',
    labelDe: 'Zeiterfassung (Timesheets)',
    defaultInScope: true,
  },
];

/** Tenant-Voreinstellung: welche Module initial markiert sind */
export const TENANT_MODULE_PRESETS = {
  'siemens-healthineers': [
    'project-program',
    'resource-capacity',
    'resource-request',
    'scenario',
    'timesheets',
  ],
  shs: [
    'project-program',
    'resource-capacity',
    'resource-request',
    'scenario',
    'timesheets',
  ],
  horizon: [
    'project-program',
    'resource-capacity',
    'resource-request',
    'scenario',
    'timesheets',
    'bi-reporting',
  ],
  knauf: ['resource-capacity', 'resource-request', 'project-program', 'timesheets'],
};

export function moduleLabel(mod, locale) {
  return locale === 'de' ? mod.labelDe : mod.labelEn;
}

export function presetModulesForTenant(tenant) {
  if (!tenant) return null;
  const slug = tenant.slug || tenant;
  const legacy = tenant.legacySlugs?.[0];
  return (
    TENANT_MODULE_PRESETS[slug] ||
    (legacy ? TENANT_MODULE_PRESETS[legacy] : null) ||
    null
  );
}

export function buildDefaultModulesInScope(tenant) {
  const preset = presetModulesForTenant(tenant);
  const presetSet = preset ? new Set(preset) : null;
  return Object.fromEntries(
    KICKOFF_MODULES.map((m) => [
      m.id,
      presetSet ? presetSet.has(m.id) : m.defaultInScope,
    ])
  );
}
