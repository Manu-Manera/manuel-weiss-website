# AWS Auth System - Quick Start

## Schnellstart für Entwickler

### 1. System laden

Das Auth-System wird automatisch geladen wenn Sie diese Zeile in Ihre HTML einfügen:

```html
<script src="js/unified-auth-loader.js"></script>
```

### 2. Verwendung

#### Login-Modal öffnen
```javascript
window.authModals.showLogin();
// oder
window.showLogin();
```

#### Registrierungs-Modal öffnen
```javascript
window.authModals.showRegister();
// oder
window.showRegister();
```

#### Benutzer abmelden
```javascript
await window.awsAuth.logout();
// oder
await window.logout();
```

#### Status prüfen
```javascript
const isLoggedIn = window.awsAuth.isLoggedIn();
const currentUser = window.awsAuth.getCurrentUser();
```

### 3. Tests durchführen

Öffnen Sie die Browser-Konsole und führen Sie aus:

```javascript
// Alle Tests ausführen
window.testAuth.all()

// Einzelne Tests
window.testAuth.register('test@example.com', 'Password123', 'Test', 'User')
window.testAuth.login('test@example.com', 'Password123')
window.testAuth.logout()
```

### 4. Debugging

#### Auth-Status prüfen
```javascript
console.log('Auth System:', window.awsAuth);
console.log('Modals:', window.authModals);
console.log('Config:', window.AWS_AUTH_CONFIG);
console.log('Logged In:', window.awsAuth.isLoggedIn());
console.log('Current User:', window.awsAuth.getCurrentUser());
```

#### Session prüfen
```javascript
const session = localStorage.getItem('aws_auth_session');
console.log('Session:', session ? JSON.parse(session) : 'Keine Session');
```

#### Browser-Konsole aktivieren
- Chrome/Firefox: F12 oder Cmd+Option+I (Mac)
- Safari: Entwicklermenü aktivieren, dann Cmd+Option+C

## Häufige Probleme

### Problem: "Auth-System nicht geladen"

**Lösung:**
1. Prüfen Sie ob `js/unified-auth-loader.js` geladen wurde (Network-Tab)
2. Prüfen Sie Browser-Konsole für Fehler
3. Stellen Sie sicher dass `authModalsContainer` im DOM vorhanden ist

### Problem: "Modal öffnet sich nicht"

**Lösung:**
1. Prüfen Sie ob `window.authModals` verfügbar ist
2. Prüfen Sie ob Modals HTML geladen wurde
3. Öffnen Sie Konsole: `window.authModals.showLogin()`

### Problem: "Login funktioniert nicht"

**Lösung:**
1. Prüfen Sie AWS Cognito Konfiguration
2. Prüfen Sie Browser-Konsole für Fehler
3. Prüfen Sie Network-Tab für fehlgeschlagene Requests
4. Testen Sie mit `window.testAuth.login(email, password)`

## API-Referenz

### window.awsAuth

#### Methoden:
- `login(email, password)` - Benutzer anmelden
- `register(email, password, name)` - Registrierung
- `registerWithAttributes(email, password, firstName, lastName)` - Registrierung mit Attributen
- `confirmRegistration(email, code)` - E-Mail bestätigen
- `forgotPassword(email)` - Passwort-Reset anfordern
- `resetPassword(email, code, newPassword)` - Passwort zurücksetzen
- `logout()` - Abmelden
- `isLoggedIn()` - Status prüfen
- `getCurrentUser()` - Aktuellen Benutzer abrufen
- `getUserDataFromToken()` - Daten aus Token extrahieren
- `showNotification(message, type)` - Benachrichtigung anzeigen

### window.authModals

#### Methoden:
- `showLogin()` - Login Modal öffnen
- `showRegister()` - Registrierungs Modal öffnen
- `showVerification(email)` - Bestätigungs Modal öffnen
- `showForgotPassword()` - Passwort-Reset Modal öffnen
- `showResetPassword(email)` - Reset Modal öffnen
- `closeModal()` - Modal schließen
- `resendCode()` - Bestätigungscode erneut senden

## Best Practices

1. **Immer Container hinzufügen:**
   ```html
   <div id="authModalsContainer"></div>
   ```

2. **Loader am Ende laden:**
   ```html
   <script src="js/unified-auth-loader.js"></script>
   ```

3. **Event Listener verwenden:**
   ```javascript
   window.addEventListener('unifiedAuthReady', (event) => {
       console.log('Auth System ready!', event.detail);
   });
   ```

4. **Fehler behandeln:**
   ```javascript
   try {
       const result = await window.awsAuth.login(email, password);
       if (!result.success) {
           console.error('Login failed:', result.error);
       }
   } catch (error) {
       console.error('Error:', error);
   }
   ```

## Support

Bei Problemen:
1. Browser-Konsole prüfen
2. Network-Tab prüfen
3. Tests ausführen: `window.testAuth.all()`
4. Siehe `AWS_AUTH_MIGRATION_GUIDE.md` für detaillierte Dokumentation

