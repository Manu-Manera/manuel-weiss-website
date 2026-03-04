/**
 * SSO Setup – Konfiguration für IdPs, Umgebungen, Schritte
 * Berücksichtigt Tempus General Settings → Miscellaneous (Password, Google, Microsoft, SAML)
 */

export const IDP_OPTIONS = [
  { id: 'azure', label: 'Azure Entra ID (SAML)', icon: 'Shield', url: 'https://entra.microsoft.com', type: 'saml' },
  { id: 'okta', label: 'Okta (SAML)', icon: 'Key', url: 'https://login.okta.com', type: 'saml' },
  { id: 'google', label: 'Google OAuth', icon: 'Google', url: 'https://console.cloud.google.com', type: 'oauth' },
  { id: 'microsoft', label: 'Microsoft OAuth', icon: 'Microsoft', url: 'https://entra.microsoft.com', type: 'oauth' }
];

/** IdPs mit SAML-Flow (Entity ID, Reply URL, Metadaten) */
export const SAML_IDPS = ['azure', 'okta'];

/** IdPs mit OAuth-Flow (Client ID, Client Key) */
export const OAUTH_IDPS = ['google', 'microsoft'];

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
export const AZURE_APP_REGISTRATION_URL = 'https://entra.microsoft.com/#view/Microsoft_AAD_RegisteredApps/ApplicationsListBlade';

export const OKTA_APPS_URL = 'https://login.okta.com/admin/apps/active';

export const GOOGLE_CLOUD_CONSOLE_URL = 'https://console.cloud.google.com/apis/credentials';

export const SAML_TOOL_URL = 'https://www.samltool.com/format_x509cert.php';

/** Tempus General Settings → Miscellaneous – Felder pro IdP */
export const TEMPUS_SSO_FIELDS = {
  saml: [
    { key: 'samlApplicationId', label: 'SAML application id', source: 'entityId', hint: 'Entity ID / Bezeichner' },
    { key: 'samlEndpoint', label: 'SAML endpoint', source: 'metadata', hint: 'Aus IdP-Metadaten (SingleSignOnService URL)' },
    { key: 'samlCertificate', label: 'SAML certificate file', source: 'upload', hint: 'Zertifikat aus Metadaten (.cer/.pem)' },
    { key: 'samlConfigUrl', label: 'SAML configuration URL', source: 'metadata', hint: 'Metadaten-URL aus IdP' },
    { key: 'customLabel', label: 'Custom label', default: 'Continue With Saml' }
  ],
  google: [
    { key: 'googleClientId', label: 'Google client id', source: 'oauth' },
    { key: 'googleClientKey', label: 'Google client key', source: 'oauth' },
    { key: 'customLabel', label: 'Custom label', default: 'Continue With Google' }
  ],
  microsoft: [
    { key: 'microsoftClientId', label: 'Microsoft client id', source: 'oauth' },
    { key: 'microsoftClientKey', label: 'Microsoft client key', source: 'oauth' },
    { key: 'customLabel', label: 'Custom label', default: 'Continue With Microsoft' }
  ]
};
