# Erste Schritte

Willkommen bei der Manuel Weiss Platform! Diese Anleitung führt Sie durch die ersten Schritte.

## Schnellstart

### 1. Installation

```bash
# Repository klonen
git clone https://github.com/manuel-weiss/platform.git
cd platform

# Dependencies installieren
npm install

# Entwicklungsserver starten
npm run dev
```

### 2. Konfiguration

Erstellen Sie eine `.env.local` Datei:

```env
# AWS Konfiguration
AWS_REGION=eu-central-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key

# Cognito Konfiguration
COGNITO_USER_POOL_ID=your-user-pool-id
COGNITO_CLIENT_ID=your-client-id

# API Konfiguration
API_BASE_URL=https://api.manuel-weiss.com
```

### 3. Erste Anmeldung

1. Öffnen Sie [http://localhost:3000](http://localhost:3000)
2. Klicken Sie auf "Anmelden"
3. Verwenden Sie Ihre Anmeldedaten

## Nächste Schritte

- [API Dokumentation](/api) - Vollständige API Referenz
- [Tutorials](/docs/tutorials) - Schritt-für-Schritt Anleitungen
- [Architektur](/docs/architecture) - System-Übersicht

## Support

Bei Fragen oder Problemen:

- [GitHub Issues](https://github.com/manuel-weiss/platform/issues)
- [Dokumentation](/docs)
- [API Referenz](/api)
