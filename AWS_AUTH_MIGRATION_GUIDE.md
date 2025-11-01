# AWS Auth System Migration Guide

## Übersicht

Das AWS Authentication System wurde konsolidiert und vereinheitlicht. Alle Seiten sollten auf das neue `unified-aws-auth.js` System umgestellt werden.

## Neue Komponenten

### 1. `js/unified-aws-auth.js`
Hauptauthentifizierungssystem - ersetzt:
- `js/real-aws-auth.js`
- `js/aws-auth-system.js`
- `src/auth/auth.js` (für Browser-Kompatibilität)

### 2. `js/unified-auth-modals.js`
Modal-Verwaltung - ersetzt:
- `js/auth-modals.js`

### 3. `components/unified-auth-modals.html`
HTML-Modals - ersetzt:
- `components/auth-modals.html`

### 4. `js/unified-auth-loader.js`
Automatischer Loader für alle Komponenten

## Migration

### Option 1: Automatischer Loader (Empfohlen)

Fügen Sie einfach diesen Script-Tag vor dem schließenden `</body>` Tag hinzu:

```html
<!-- Unified Auth System -->
<script src="js/unified-auth-loader.js"></script>
```

Der Loader kümmert sich automatisch um:
- Laden der AWS SDK
- Laden des Auth-Systems
- Laden der Modals
- Initialisierung und Event-Handler

### Option 2: Manuelle Integration

Falls Sie mehr Kontrolle benötigen:

```html
<!-- 1. Auth Modals Container -->
<div id="authModalsContainer"></div>

<!-- 2. AWS SDK (falls nicht bereits geladen) -->
<script src="https://sdk.amazonaws.com/js/aws-sdk-2.1490.0.min.js"></script>

<!-- 3. Unified Auth System -->
<script src="js/unified-aws-auth.js"></script>

<!-- 4. Unified Auth Modals -->
<script src="js/unified-auth-modals.js"></script>

<!-- 5. Load Auth Modals HTML -->
<script>
    async function loadAuthModals() {
        const response = await fetch('components/unified-auth-modals.html');
        const html = await response.text();
        document.getElementById('authModalsContainer').innerHTML = html;
    }
    document.addEventListener('DOMContentLoaded', loadAuthModals);
</script>
```

## Entfernen von altem Code

### Entfernen Sie diese Script-Tags:
- `<script src="js/real-aws-auth.js"></script>`
- `<script src="js/aws-auth-system.js"></script>`
- `<script src="js/auth-modals.js"></script>`
- `<script src="js/aws-auth.js"></script>` (falls vorhanden)

### Entfernen Sie alte Modal-Loader:
```html
<!-- Alte Varianten entfernen -->
<script>
    async function loadAuthModals() {
        const response = await fetch('components/auth-modals.html');
        // ...
    }
</script>
```

## API-Verwendung

### Login
```javascript
await window.awsAuth.login(email, password);
```

### Registrierung
```javascript
await window.awsAuth.register(email, password, name);
// oder mit zusätzlichen Attributen:
await window.awsAuth.registerWithAttributes(email, password, firstName, lastName);
```

### Bestätigung
```javascript
await window.awsAuth.confirmRegistration(email, code);
```

### Passwort zurücksetzen
```javascript
// Code anfordern
await window.awsAuth.forgotPassword(email);

// Passwort zurücksetzen
await window.awsAuth.resetPassword(email, code, newPassword);
```

### Abmelden
```javascript
await window.awsAuth.logout();
```

### Status prüfen
```javascript
const isLoggedIn = window.awsAuth.isLoggedIn();
const currentUser = window.awsAuth.getCurrentUser();
```

### Modals anzeigen
```javascript
window.authModals.showLogin();
window.authModals.showRegister();
window.authModals.showVerification(email);
window.authModals.showForgotPassword();
```

## Globale Helper-Funktionen

Für Rückwärtskompatibilität stehen folgende globale Funktionen zur Verfügung:

```javascript
showLogin();        // Öffnet Login-Modal
showRegister();     // Öffnet Registrierungs-Modal
logout();           // Meldet Benutzer ab
```

## Konfiguration

Die Konfiguration befindet sich in `js/unified-aws-auth.js`:

```javascript
window.AWS_AUTH_CONFIG = {
    cognito: {
        userPoolId: 'eu-central-1_8gP4gLK9r',
        clientId: '7kc5tt6a23fgh53d60vkefm812',
        region: 'eu-central-1',
        domain: 'manuel-weiss-userfiles-auth-038333965110.auth.eu-central-1.amazoncognito.com'
    },
    token: {
        storageKey: 'aws_auth_session',
        refreshThreshold: 300,
        maxRetries: 3
    }
};
```

## UI-Updates

Das System aktualisiert automatisch folgende UI-Elemente:

- `.nav-login-btn`, `.login-btn` - Login-Buttons
- `.user-dropdown`, `.user-menu` - Benutzermenüs
- `.user-name-small`, `.user-name` - Benutzernamen
- `.user-email-small`, `.user-email` - E-Mail-Adressen

## Notifications

Das System zeigt automatisch Benachrichtigungen für:
- Erfolgreiche Anmeldung
- Fehler bei der Authentifizierung
- Token-Ablauf
- Erfolgreiche Registrierung

## Testing

Testen Sie folgende Szenarien:

1. ✅ Registrierung mit neuer E-Mail
2. ✅ E-Mail-Bestätigung
3. ✅ Login mit gültigen Credentials
4. ✅ Login mit ungültigen Credentials
5. ✅ Passwort zurücksetzen
6. ✅ Abmeldung
7. ✅ Token-Refresh
8. ✅ Session-Wiederherstellung nach Seitenreload

## Bekannte Probleme und Lösungen

### Problem: "AWS SDK nicht geladen"
**Lösung:** Der Loader lädt automatisch die AWS SDK. Falls es weiterhin Probleme gibt, prüfen Sie die Netzwerk-Verbindung.

### Problem: "Modal wird nicht angezeigt"
**Lösung:** Stellen Sie sicher, dass `authModalsContainer` im DOM vorhanden ist und die Modals HTML geladen wurde.

### Problem: "Session wird nicht wiederhergestellt"
**Lösung:** Prüfen Sie localStorage - der Key ist `aws_auth_session`. Stellen Sie sicher, dass Cookies/LocalStorage nicht blockiert sind.

## Support

Bei Problemen prüfen Sie:
1. Browser-Konsole für Fehlermeldungen
2. Network-Tab für fehlgeschlagene Requests
3. localStorage für Session-Daten

## Migration Checkliste

- [ ] Alte Auth-Skripte entfernt
- [ ] `unified-auth-loader.js` hinzugefügt
- [ ] `authModalsContainer` Div hinzugefügt (falls manuell)
- [ ] Login-Buttons funktionieren
- [ ] Registrierung funktioniert
- [ ] E-Mail-Bestätigung funktioniert
- [ ] Passwort-Reset funktioniert
- [ ] Abmeldung funktioniert
- [ ] UI-Updates funktionieren
- [ ] Session-Wiederherstellung funktioniert

