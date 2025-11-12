# 🔐 Auth-Problem Behandlungsplan: "Benutzer nicht gefunden"

## Problem
Beim Versuch, sich im Bewerbungsbereich anzumelden, kommt die Fehlermeldung:
- **E-Mail:** weiss-manuel@gmx.de
- **Fehler:** "Benutzer nicht gefunden"

## System-Übersicht

### Aktuelle Konfiguration
- **User Pool ID:** `eu-central-1_8gP4gLK9r`
- **Client ID:** `7kc5tt6a23fgh53d60vkefm812`
- **Region:** `eu-central-1`
- **Auth-System:** `real-user-auth-system.js` (beide Bereiche)

### Verwendete Auth-Systeme
- ✅ **Bewerbungsbereich:** `js/real-user-auth-system.js`
- ✅ **Persönlichkeitsentwicklung:** `js/real-user-auth-system.js`
- ✅ **Konfiguration:** `js/aws-config.js` (einheitlich)

## Schritt-für-Schritt Problembehebung

### Schritt 1: Benutzer-Status in AWS Cognito prüfen

```bash
# Script ausführen
./check-user-status.sh
```

**Erwartetes Ergebnis:**
- ✅ Benutzer existiert → Weiter zu Schritt 2
- ❌ Benutzer existiert nicht → Weiter zu Schritt 3

### Schritt 2: Benutzer-Status analysieren

Wenn der Benutzer existiert, prüfe:
1. **User Status:** Sollte `CONFIRMED` sein
2. **E-Mail bestätigt:** Sollte `true` sein
3. **Benutzer aktiviert:** Sollte aktiviert sein

**Mögliche Probleme:**
- `UNCONFIRMED` → E-Mail-Bestätigung erforderlich
- `FORCE_CHANGE_PASSWORD` → Passwort-Reset erforderlich
- `DISABLED` → Benutzer deaktiviert

### Schritt 3: Benutzer erstellen (falls nicht vorhanden)

**Option A: Über Webseite registrieren**
1. Gehe zu `applications/index.html`
2. Klicke auf "Anmelden"
3. Klicke auf "Registrieren"
4. Fülle das Formular aus
5. Bestätige die E-Mail

**Option B: Manuell über AWS CLI erstellen**
```bash
./create-user-manual.sh
```

**Option C: Direkt über AWS CLI**
```bash
aws cognito-idp admin-create-user \
  --user-pool-id eu-central-1_8gP4gLK9r \
  --username weiss-manuel@gmx.de \
  --user-attributes \
    Name=email,Value=weiss-manuel@gmx.de \
    Name=email_verified,Value=true \
    Name=given_name,Value=Manuel \
    Name=family_name,Value=Weiss \
  --message-action SUPPRESS \
  --region eu-central-1

# Passwort setzen
aws cognito-idp admin-set-user-password \
  --user-pool-id eu-central-1_8gP4gLK9r \
  --username weiss-manuel@gmx.de \
  --password "IhrPasswort" \
  --permanent \
  --region eu-central-1

# Benutzer aktivieren
aws cognito-idp admin-enable-user \
  --user-pool-id eu-central-1_8gP4gLK9r \
  --username weiss-manuel@gmx.de \
  --region eu-central-1
```

### Schritt 4: Login testen

**Option A: Über Test-Seite**
1. Öffne `test-login-functionality.html` im Browser
2. Führe alle Tests aus
3. Prüfe die Ergebnisse

**Option B: Über Browser-Konsole**
1. Öffne `applications/index.html`
2. Öffne Browser-Entwicklertools (F12)
3. In der Konsole:
```javascript
// Prüfe System-Status
console.log('AWS Config:', window.AWS_CONFIG);
console.log('Auth System:', window.realUserAuth);
console.log('Initialisiert:', window.realUserAuth?.isInitialized);

// Teste Login
await window.realUserAuth.loginWithCognito('weiss-manuel@gmx.de', 'IhrPasswort');
```

### Schritt 5: Fehlerbehebung bei spezifischen Fehlern

#### Fehler: "UserNotFoundException"
**Ursache:** Benutzer existiert nicht in AWS Cognito
**Lösung:** Benutzer erstellen (Schritt 3)

#### Fehler: "NotAuthorizedException"
**Ursache:** Falsches Passwort oder E-Mail nicht bestätigt
**Lösung:** 
- Passwort prüfen
- E-Mail-Bestätigung prüfen
- Falls nötig: Passwort zurücksetzen

#### Fehler: "UserNotConfirmedException"
**Ursache:** E-Mail-Adresse wurde noch nicht bestätigt
**Lösung:**
```bash
# Bestätigungscode erneut senden
aws cognito-idp resend-confirmation-code \
  --client-id 7kc5tt6a23fgh53d60vkefm812 \
  --username weiss-manuel@gmx.de \
  --region eu-central-1

# Oder manuell bestätigen
aws cognito-idp admin-confirm-sign-up \
  --user-pool-id eu-central-1_8gP4gLK9r \
  --username weiss-manuel@gmx.de \
  --region eu-central-1
```

#### Fehler: "System not initialized"
**Ursache:** Auth-System wurde nicht korrekt geladen
**Lösung:**
1. Seite neu laden
2. Prüfe Browser-Konsole auf Fehler
3. Prüfe ob `js/aws-config.js` geladen wird
4. Prüfe ob `js/real-user-auth-system.js` geladen wird

## Verifikation

### ✅ Erfolgreiche Anmeldung
Nach erfolgreicher Anmeldung sollte:
1. `localStorage.getItem('aws_auth_session')` eine Session enthalten
2. `window.realUserAuth.isLoggedIn()` `true` zurückgeben
3. `window.realUserAuth.getCurrentUser()` Benutzerdaten zurückgeben
4. Die UI sollte den angemeldeten Benutzer anzeigen

### 🔍 Debug-Informationen sammeln

**Browser-Konsole:**
```javascript
// Vollständige Debug-Informationen
console.log('=== AUTH DEBUG ===');
console.log('AWS Config:', window.AWS_CONFIG);
console.log('Auth System:', window.realUserAuth);
console.log('Initialisiert:', window.realUserAuth?.isInitialized);
console.log('Cognito Service:', window.realUserAuth?.cognitoIdentityServiceProvider);
console.log('Angemeldet:', window.realUserAuth?.isLoggedIn());
console.log('Aktueller Benutzer:', window.realUserAuth?.getCurrentUser());
console.log('Session:', localStorage.getItem('aws_auth_session'));
```

**Network-Tab:**
- Prüfe ob `InitiateAuth` Request gesendet wird
- Prüfe Response-Status und -Body
- Prüfe auf CORS-Fehler

## Nächste Schritte nach erfolgreicher Behebung

1. ✅ Login in beiden Bereichen testen (Bewerbungsbereich + Persönlichkeitsentwicklung)
2. ✅ Session-Persistenz testen (Seite neu laden)
3. ✅ Logout testen
4. ✅ Passwort-Reset testen

## Präventive Maßnahmen

1. **Monitoring:** CloudWatch Logs für Cognito aktivieren
2. **Alerts:** Benachrichtigungen bei häufigen Login-Fehlern
3. **Dokumentation:** Benutzer-Registrierungsprozess dokumentieren
4. **Tests:** Regelmäßige Login-Tests durchführen

## Support & Hilfe

Bei weiteren Problemen:
1. Prüfe `test-login-functionality.html` für detaillierte Diagnose
2. Prüfe Browser-Konsole für Fehlermeldungen
3. Prüfe AWS CloudWatch Logs für Server-seitige Fehler
4. Prüfe `check-user-status.sh` für Benutzer-Status

