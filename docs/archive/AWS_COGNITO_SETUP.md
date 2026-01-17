# AWS Cognito Setup Anleitung

## 🚀 Für Produktion: AWS Cognito einrichten

### 1. AWS Cognito User Pool erstellen

1. **AWS Console öffnen**
   - Gehe zu AWS Cognito in der AWS Console
   - Klicke auf "Create user pool"

2. **User Pool konfigurieren**
   ```
   Pool name: mawps-user-pool
   Region: eu-central-1
   ```

3. **Sign-in options**
   - ✅ Email
   - ✅ Username (optional)

4. **Password policy**
   ```
   Minimum length: 8
   Require uppercase: Yes
   Require lowercase: Yes
   Require numbers: Yes
   Require symbols: No
   ```

5. **MFA settings**
   - Optional (empfohlen für Produktion)

6. **User pool properties**
   - ✅ Allow users to sign themselves up
   - ✅ Send welcome message
   - ✅ Send email verification

### 2. App Client erstellen

1. **App client settings**
   ```
   App client name: mawps-web-client
   Client secret: Generate client secret (NEIN für Web)
   ```

2. **Authentication flows**
   - ✅ ALLOW_USER_PASSWORD_AUTH
   - ✅ ALLOW_REFRESH_TOKEN_AUTH

3. **OAuth 2.0 settings** (optional)
   ```
   Allowed callback URLs: 
   - https://mawps.netlify.app
   - http://localhost:8000
   
   Allowed sign-out URLs:
   - https://mawps.netlify.app
   - http://localhost:8000
   ```

### 3. Domain einrichten

1. **Domain name**
   ```
   Domain: mawps-auth (oder dein gewünschter Name)
   ```

### 4. Konfiguration in js/aws-config.js aktualisieren

```javascript
window.AWS_CONFIG = {
    userPoolId: 'eu-central-1_XXXXXXXXX', // Deine User Pool ID
    clientId: 'XXXXXXXXXXXXXXXXXXXXXXXXXX', // Deine Client ID
    region: 'eu-central-1',
    // ... rest der Konfiguration
};
```

### 5. AWS SDK in HTML-Dateien aktivieren

Ersetze in den HTML-Dateien:
```html
<!-- Demo Auth System (für Entwicklung) -->
<script src="js/demo-auth-system.js"></script>

<!-- Mit AWS Cognito (für Produktion) -->
<script src="https://sdk.amazonaws.com/js/aws-sdk-2.1490.0.min.js"></script>
<script src="js/aws-config.js"></script>
<script src="js/aws-auth-system.js"></script>
```

## 🔧 Aktuelle Demo-Konfiguration

**Das System läuft aktuell im Demo-Modus:**
- ✅ Registrierung funktioniert (lokaler Speicher)
- ✅ Login funktioniert (lokaler Speicher)
- ✅ Passwort-Reset simuliert
- ✅ E-Mail-Bestätigung simuliert
- ✅ Session Management funktioniert

## 📋 Nächste Schritte für Produktion

1. **AWS Cognito User Pool erstellen** (siehe oben)
2. **Credentials in js/aws-config.js eintragen**
3. **HTML-Dateien auf AWS SDK umstellen**
4. **Testen mit echten AWS Credentials**

## 🛠️ Troubleshooting

### "User pool client does not exist"
- ✅ **Gelöst:** Demo-System aktiviert
- Für Produktion: AWS Cognito User Pool erstellen

### "Access denied"
- AWS Credentials prüfen
- User Pool ID und Client ID prüfen
- Region prüfen

### "Invalid credentials"
- AWS SDK korrekt geladen?
- Konfiguration korrekt?

## 🎯 Demo-System Features

- **Registrierung:** Funktioniert mit lokalem Speicher
- **Login:** Funktioniert mit lokalem Speicher  
- **Passwort-Reset:** Simuliert (zeigt Notification)
- **E-Mail-Bestätigung:** Simuliert (automatisch bestätigt)
- **Session:** Funktioniert mit localStorage
- **UI:** Vollständig funktional

## 🚀 Status

- ✅ **Demo-System:** Vollständig funktional
- ⏳ **AWS Cognito:** Bereit für Einrichtung
- ✅ **UI/UX:** Vollständig implementiert
- ✅ **Integration:** User-Profil verknüpft
