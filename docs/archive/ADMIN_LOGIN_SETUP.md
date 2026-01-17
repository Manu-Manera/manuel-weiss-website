# Admin-Login-System Setup

## Übersicht

Das Admin-Login-System schützt das Admin-Panel mit AWS Cognito-Authentifizierung. Nur Benutzer, die in der "admin"-Gruppe sind, können auf das Admin-Panel zugreifen.

## Komponenten

1. **Admin-Login-Seite**: `/admin-login.html`
2. **Admin-Auth-System**: `/js/admin-auth-system.js`
3. **Admin-Gruppe in Cognito**: `admin` (Precedence: 1)
4. **Geschütztes Admin-Panel**: `/admin.html`

## Setup-Schritte

### 1. Admin-User erstellen

Führe das Setup-Script aus:

```bash
./create-admin-user.sh
```

Das Script:
- Fragt nach E-Mail und Passwort
- Prüft ob User bereits existiert
- Erstellt User falls nötig
- Setzt Passwort
- Fügt User zur "admin"-Gruppe hinzu

**Manuelle Alternative:**

```bash
# User erstellen
aws cognito-idp admin-create-user \
  --user-pool-id eu-central-1_8gP4gLK9r \
  --username "admin@manuel-weiss.ch" \
  --user-attributes Name=email,Value="admin@manuel-weiss.ch" Name=email_verified,Value=true \
  --message-action SUPPRESS \
  --region eu-central-1

# Passwort setzen
aws cognito-idp admin-set-user-password \
  --user-pool-id eu-central-1_8gP4gLK9r \
  --username "admin@manuel-weiss.ch" \
  --password "DeinSicheresPasswort123!" \
  --permanent \
  --region eu-central-1

# Zur Admin-Gruppe hinzufügen
aws cognito-idp admin-add-user-to-group \
  --user-pool-id eu-central-1_8gP4gLK9r \
  --username "admin@manuel-weiss.ch" \
  --group-name admin \
  --region eu-central-1
```

### 2. Login testen

**Option A: Test-Seite verwenden**

Öffne `/test-admin-login.html` im Browser und führe die Tests aus.

**Option B: Direktes Login**

1. Öffne `https://mawps.netlify.app/admin-login.html`
2. Gib Admin-E-Mail und Passwort ein
3. Nach erfolgreichem Login wirst du zum Admin-Panel weitergeleitet

### 3. Bestehenden User zur Admin-Gruppe hinzufügen

```bash
aws cognito-idp admin-add-user-to-group \
  --user-pool-id eu-central-1_8gP4gLK9r \
  --username "user@example.com" \
  --group-name admin \
  --region eu-central-1
```

### 4. User aus Admin-Gruppe entfernen

```bash
aws cognito-idp admin-remove-user-from-group \
  --user-pool-id eu-central-1_8gP4gLK9r \
  --username "user@example.com" \
  --group-name admin \
  --region eu-central-1
```

## Funktionsweise

### Authentifizierungs-Flow

1. **Login-Seite** (`admin-login.html`):
   - User gibt E-Mail und Passwort ein
   - `AdminAuthSystem.login()` wird aufgerufen
   - AWS Cognito authentifiziert den User
   - System prüft ob User in "admin"-Gruppe ist
   - Bei Erfolg: Session wird gespeichert, Redirect zum Admin-Panel

2. **Admin-Panel** (`admin.html`):
   - Beim Laden wird `AdminAuthSystem.verifyAdminAccess()` aufgerufen
   - Prüft ob gültige Session existiert
   - Prüft ob User in "admin"-Gruppe ist
   - Bei Fehler: Redirect zur Login-Seite

3. **Session-Management**:
   - Session wird in `localStorage` gespeichert (`admin_auth_session`)
   - Enthält: Access Token, ID Token, Refresh Token, Expiry
   - Session wird bei Logout gelöscht

### Sicherheits-Features

- ✅ **Gruppen-basierte Autorisierung**: Nur User in "admin"-Gruppe haben Zugriff
- ✅ **Token-basierte Authentifizierung**: AWS Cognito JWT Tokens
- ✅ **Session-Timeout**: Tokens laufen nach 1 Stunde ab
- ✅ **Automatische Weiterleitung**: Nicht-autorisierte User werden zur Login-Seite weitergeleitet
- ✅ **Profil-Verwaltung**: Admin-Profil wird aus DynamoDB geladen

## Troubleshooting

### "Zugriff verweigert: Sie sind kein Administrator"

**Problem**: User ist nicht in der "admin"-Gruppe.

**Lösung**: User zur Admin-Gruppe hinzufügen:
```bash
aws cognito-idp admin-add-user-to-group \
  --user-pool-id eu-central-1_8gP4gLK9r \
  --username "user@example.com" \
  --group-name admin \
  --region eu-central-1
```

### "Falsche E-Mail-Adresse oder Passwort"

**Problem**: Credentials sind falsch oder User existiert nicht.

**Lösung**: 
- Prüfe E-Mail-Adresse
- Prüfe Passwort (Groß-/Kleinbuchstaben, Zahlen)
- Stelle sicher, dass User existiert

### "Bitte bestätigen Sie zuerst Ihre E-Mail-Adresse"

**Problem**: User-E-Mail ist nicht verifiziert.

**Lösung**: E-Mail-Verifizierung überspringen (für Admin-User):
```bash
aws cognito-idp admin-update-user-attributes \
  --user-pool-id eu-central-1_8gP4gLK9r \
  --username "user@example.com" \
  --user-attributes Name=email_verified,Value=true \
  --region eu-central-1
```

### Session wird nicht gespeichert

**Problem**: `localStorage` ist deaktiviert oder voll.

**Lösung**: 
- Prüfe Browser-Einstellungen
- Lösche `localStorage` und versuche es erneut
- Prüfe Browser-Console auf Fehler

## API-Referenz

### AdminAuthSystem

```javascript
// Initialisieren
const adminAuth = new AdminAuthSystem();
await adminAuth.init();

// Login
const result = await adminAuth.login(email, password);
// result: { success: boolean, user?: object, error?: string }

// Aktuellen User abrufen
const user = adminAuth.getCurrentUser();
// user: { email, username, accessToken, idToken, ... }

// User-Daten abrufen
const userData = adminAuth.getUserData();

// Admin-Zugriff prüfen
const hasAccess = await adminAuth.verifyAdminAccess();
// hasAccess: boolean

// Logout
adminAuth.logout();
```

## Deployment

Das Admin-Login-System ist bereits deployed und aktiv. Nach dem Erstellen eines Admin-Users kann sofort eingeloggt werden.

**Wichtig**: Stelle sicher, dass:
- ✅ Admin-Gruppe in Cognito existiert
- ✅ Admin-User zur Gruppe hinzugefügt wurde
- ✅ User-Passwort ist gesetzt
- ✅ E-Mail ist verifiziert

## Support

Bei Problemen:
1. Prüfe Browser-Console auf Fehler
2. Prüfe AWS CloudWatch Logs für Cognito
3. Teste mit `/test-admin-login.html`
4. Prüfe ob User in Admin-Gruppe ist

