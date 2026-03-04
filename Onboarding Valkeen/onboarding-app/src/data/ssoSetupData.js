/**
 * SSO Setup – Konfiguration für IdPs, Umgebungen, Schritte
 */

export const IDP_OPTIONS = [
  { id: 'azure', label: 'Azure Entra ID', icon: 'Shield', url: 'https://entra.microsoft.com' },
  { id: 'okta', label: 'Okta', icon: 'Key', url: 'https://login.okta.com' }
];

export const ENV_OPTIONS = [
  { id: 'production', label: 'Produktion', suffix: '' },
  { id: 'staging', label: 'Staging', suffix: '-staging' },
  { id: 'test', label: 'Test', suffix: '-test' }
];

export const DEFAULT_TEMPUS_DOMAIN = 'tempus-resource.com';

export const STEPS = [
  { id: 1, title: 'Kunde', key: 'customer' },
  { id: 2, title: 'Werte', key: 'values' },
  { id: 3, title: 'IdP', key: 'idp' },
  { id: 4, title: 'Metadaten', key: 'metadata' },
  { id: 5, title: 'Tempus', key: 'tempus' },
  { id: 6, title: 'Benutzer', key: 'users' },
  { id: 7, title: 'Fertig', key: 'done' }
];

export const AZURE_NEW_APP_URL = 'https://entra.microsoft.com/#view/Microsoft_AAD_RegisteredApps/ApplicationsListBlade';

export const OKTA_APPS_URL = 'https://login.okta.com/admin/apps/active';

export const SAML_TOOL_URL = 'https://www.samltool.com/format_x509cert.php';
