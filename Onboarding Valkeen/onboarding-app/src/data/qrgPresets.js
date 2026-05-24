/**
 * QRG Builder — Customer-Presets
 *
 * Jeder Preset beschreibt eine Tempus-Kundeninstanz mit allen
 * Variablen, die sich pro Kunde unterscheiden können.
 * Schema = `defaultConfig`. Neue Felder hier hinzufügen + in den
 * Templates referenzieren ({@link qrgTemplates.js}).
 */

/** Schema/Default für eine neue Kundenkonfiguration. */
export const defaultConfig = {
  meta: {
    customerName: 'Customer',
    customerShort: 'Customer',
    documentDate: new Date().toISOString().slice(0, 10),
    documentVersion: '1.0',
    language: 'en', // 'en' | 'de'
    primaryColor: '#0d7fa0',
    accentColor: '#0f2342',
  },
  instance: {
    tempusUrl: 'https://customer.tempus-resource.com/sg/',
    ssoButtonLabel: 'Continue with Single Sign On',
    browser: 'Google Chrome',
    helpCenterAccess: true,
    homepageTileCount: 6,
  },
  terminology: {
    proposalLabel: 'Proposal', // 'Proposal' | 'Opportunity' | ''
    bauLabel: 'Non-Project Activities', // 'BAU' | 'Non-Project Activities' | ''
    workItemLabel: 'Project', // 'Project' | 'Work'
    gridLabel: 'Project Management Grid', // 'Project Management Grid' | 'Work Management Grid'
    rejectActionLabel: 'reject', // 'reject' | 'delegate'
  },
  resources: {
    hasNamed: true,
    hasGroup: false,
    hasDemandPlanning: true,
    groupExample: 'QP Generic (SAB)',
  },
  projects: {
    hasStandard: true,
    hasProposals: true,
    hasBau: true,
    customAttributesExamples: 'Priority, Stage, Product, Phase, Risk Status, Portfolio',
  },
  capacity: {
    units: ['FTE', 'Hours'],
    aggregations: ['MONTH', 'WEEK', 'DAY', 'YEAR'],
    recommendedAggregation: 'MONTH',
    recommendedUnit: 'FTE',
    timePeriods: ['Month', 'Week', 'Day', 'Project'],
    dateFormat: 'DD/MM/YYYY',
  },
  workflow: {
    hasResourceRequest: true,
    requireRmApproval: true,
    assignmentTypes: ['Planned'], // ['Planned', 'Actual']
  },
  roles: {
    includePM: true,
    includeRM: true,
    includeRR: true,
    includeExcelImport: true,
    includeDemandBasics: true,
  },
  modules: {
    pm: {
      coverHomepage: true,
      coverPmGrid: true,
      coverSpaGrid: true,
      coverBpaFlatgrid: true,
      coverResourceReplace: true,
      coverAdvancedAssignment: true,
    },
    rm: {
      coverRmGrid: true,
      coverIndividualResourceProfile: true,
      coverResourceRequests: true,
      coverNetAvailability: true,
    },
    rr: {
      coverProjectCreation: true,
      coverResourceRequest: true,
      coverScribe: false,
    },
  },
};

/** Hilfsfunktion: Tiefe Verschmelzung Preset über Default. */
function mergeDeep(target, source) {
  const out = { ...target };
  for (const k of Object.keys(source)) {
    const v = source[k];
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      out[k] = mergeDeep(target[k] || {}, v);
    } else {
      out[k] = v;
    }
  }
  return out;
}

/** Liefert ein vollständig befülltes Config-Objekt für einen Preset. */
export function getPresetConfig(presetId) {
  const preset = presets.find((p) => p.id === presetId) || presets[0];
  return mergeDeep(structuredClone(defaultConfig), preset.config);
}

/**
 * Die Presets. Jeder enthält nur die Felder, die vom Default abweichen.
 * So bleibt die Liste lesbar und das Hinzufügen weiterer Kunden ist trivial.
 */
export const presets = [
  {
    id: 'blank',
    label: 'Leeres Profil',
    description: 'Generischer Default · alles editierbar',
    config: {},
  },
  {
    id: 'almirall',
    label: 'Almirall',
    description: 'Pharma · 6 Tiles · Proposal · MS-SSO',
    config: {
      meta: {
        customerName: 'Almirall',
        customerShort: 'Almirall',
        primaryColor: '#003366',
      },
      instance: {
        tempusUrl: 'https://almirall.tempus-resource.com/sg/',
        ssoButtonLabel: 'Continue With Microsoft',
        homepageTileCount: 6,
      },
      terminology: {
        proposalLabel: 'Proposal',
        bauLabel: 'Non-Project Activities',
        rejectActionLabel: 'reject',
      },
      resources: {
        hasNamed: true,
        hasGroup: true,
        hasDemandPlanning: true,
        groupExample: 'QP Generic (SAB)',
      },
      projects: {
        hasStandard: true,
        hasProposals: true,
        hasBau: true,
        customAttributesExamples: 'Priority, Stage, Product, Phase, Risk Status, Portfolio',
      },
      capacity: {
        units: ['FTE', 'Hours'],
        timePeriods: ['Month', 'Week', 'Day', 'Project'],
      },
    },
  },
  {
    id: 'shsit',
    label: 'SHS IT (Siemens Healthineers)',
    description: 'Healthineers-ID · Opportunities statt Proposals · 3 Tiles',
    config: {
      meta: {
        customerName: 'Siemens Healthineers SHS IT',
        customerShort: 'SHS IT',
        primaryColor: '#00B6A9',
      },
      instance: {
        tempusUrl: 'https://shsit.tempus-resource.com/SG/',
        ssoButtonLabel: 'Healthineers-ID Login',
        homepageTileCount: 3,
      },
      terminology: {
        proposalLabel: 'Opportunity',
        bauLabel: 'Non-Project Activities',
        rejectActionLabel: 'reject',
      },
      resources: {
        hasNamed: true,
        hasGroup: false,
        hasDemandPlanning: true,
      },
      projects: {
        hasStandard: true,
        hasProposals: true,
        hasBau: true,
        customAttributesExamples: 'Department, Cost Center, Phase, Product Line',
      },
      capacity: {
        units: ['FTE', 'Hours', 'Mandays'],
      },
      workflow: {
        hasResourceRequest: true,
        requireRmApproval: true,
      },
    },
  },
  {
    id: 'cegeka',
    label: 'Cegeka',
    description: 'SSO · BAU statt Non-Project · Planned + Actual',
    config: {
      meta: {
        customerName: 'Cegeka',
        customerShort: 'Cegeka',
        primaryColor: '#E10000',
      },
      instance: {
        tempusUrl: 'https://cegeka.tempus-resource.com/sg/',
        ssoButtonLabel: 'Continue with Single Sign On',
        homepageTileCount: 4,
      },
      terminology: {
        proposalLabel: '',
        bauLabel: 'BAU',
        rejectActionLabel: 'delegate',
      },
      resources: {
        hasNamed: true,
        hasGroup: false,
        hasDemandPlanning: true,
      },
      projects: {
        hasStandard: true,
        hasProposals: false,
        hasBau: true,
        customAttributesExamples: 'Portfolio, Service Line, Country, Customer',
      },
      capacity: {
        units: ['FTE', 'Mandays'],
        timePeriods: ['Month', 'Week', 'Day'],
      },
      workflow: {
        hasResourceRequest: true,
        requireRmApproval: true,
        assignmentTypes: ['Planned', 'Actual'],
      },
    },
  },
  {
    id: 'knauf',
    label: 'Knauf',
    description: 'Bau · MS-SSO · Standard-Tempus-Setup',
    config: {
      meta: {
        customerName: 'Knauf',
        customerShort: 'Knauf',
        primaryColor: '#F49600',
      },
      instance: {
        tempusUrl: 'https://knauf.tempus-resource.com/sg/',
        ssoButtonLabel: 'Continue With Microsoft',
        homepageTileCount: 6,
      },
      terminology: {
        proposalLabel: 'Proposal',
        bauLabel: 'Non-Project Activities',
      },
    },
  },
  {
    id: 'hrcampus',
    label: 'HR Campus',
    description: 'HR · Mandays · Standard SSO',
    config: {
      meta: {
        customerName: 'HR Campus',
        customerShort: 'HR Campus',
        primaryColor: '#7A2D88',
      },
      instance: {
        tempusUrl: 'https://hrcampus.tempus-resource.com/sg/',
        ssoButtonLabel: 'Continue with Single Sign On',
        homepageTileCount: 4,
      },
      terminology: {
        proposalLabel: '',
        bauLabel: 'BAU',
      },
      capacity: {
        units: ['Mandays', 'Hours', 'FTE'],
      },
    },
  },
];
