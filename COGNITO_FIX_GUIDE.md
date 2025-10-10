# 🔐 COGNITO KONFIGURATION - KOMPLETTE LÖSUNG

## ❌ AKTUELLE PROBLEME IDENTIFIZIERT

### Problem 1: Inkonsistente Redirect URLs
- Verschiedene Dateien verwenden unterschiedliche URLs
- AWS Cognito erwartet exakte Übereinstimmung

### Problem 2: App Client Konfiguration
- Möglicherweise falsche OAuth Flows
- Secret-Requirement für Frontend-Apps
- Fehlende CORS-Konfiguration

### Problem 3: Token Handling
- Kein persistentes Speichern
- Fehlende Refresh-Logik
- Inkonsistente Session-Prüfung

## ✅ LÖSUNG: COGNITO APP CLIENT KORREKT KONFIGURIEREN

### Schritt 1: AWS Console → Cognito → User Pools

1. **User Pool auswählen**: `eu-central-1_8gP4gLK9r`
2. **App Client öffnen**: `7kc5tt6a23fgh53d60vkefm812`
3. **Folgende Einstellungen setzen:**

#### **App Client Settings:**
```
✅ Generate client secret: NEIN (für Frontend-Apps)
✅ Enable username password based authentication: JA
✅ Enable SRP (Secure Remote Password) protocol: NEIN
```

#### **OAuth 2.0 Settings:**
```
✅ Allowed OAuth Flows:
   - Authorization code grant
   - Implicit grant

✅ Allowed OAuth Scopes:
   - email
   - openid
   - profile

✅ Allowed callback URLs:
   - https://mawps.netlify.app
   - https://mawps.netlify.app/bewerbung.html
   - https://mawps.netlify.app/persoenlichkeitsentwicklung-uebersicht.html
   - https://mawps.netlify.app/user-profile.html
   - http://localhost:8000
   - http://localhost:8000/bewerbung.html

✅ Allowed sign-out URLs:
   - https://mawps.netlify.app
   - http://localhost:8000
```

#### **Advanced App Client Settings:**
```
✅ Authentication flows:
   - ALLOW_USER_PASSWORD_AUTH
   - ALLOW_REFRESH_TOKEN_AUTH

✅ Token expiration:
   - Access token: 1 hour
   - ID token: 1 hour
   - Refresh token: 30 days
```

### Schritt 2: Hosted UI Domain konfigurieren

1. **Cognito → Domain Management**
2. **Domain erstellen**: `manuel-weiss-userfiles-auth`
3. **SSL-Zertifikat**: Automatisch von AWS verwaltet

### Schritt 3: CORS-Konfiguration

In **API Gateway** (falls verwendet):
```json
{
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
  "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS"
}
```

## 🔧 AUTOMATISCHE KONFIGURATION

### Script für AWS CLI:
```bash
#!/bin/bash
# cognito-fix.sh

USER_POOL_ID="eu-central-1_8gP4gLK9r"
CLIENT_ID="7kc5tt6a23fgh53d60vkefm812"

# App Client aktualisieren
aws cognito-idp update-user-pool-client \
    --user-pool-id $USER_POOL_ID \
    --client-id $CLIENT_ID \
    --explicit-auth-flows ALLOW_USER_PASSWORD_AUTH ALLOW_REFRESH_TOKEN_AUTH \
    --supported-identity-providers COGNITO \
    --callback-urls \
        "https://mawps.netlify.app" \
        "https://mawps.netlify.app/bewerbung.html" \
        "https://mawps.netlify.app/persoenlichkeitsentwicklung-uebersicht.html" \
        "http://localhost:8000" \
        "http://localhost:8000/bewerbung.html" \
    --logout-urls \
        "https://mawps.netlify.app" \
        "http://localhost:8000" \
    --allowed-o-auth-flows implicit code \
    --allowed-o-auth-scopes email openid profile \
    --allowed-o-auth-flows-user-pool-client

echo "✅ Cognito App Client erfolgreich konfiguriert"
```

## 🧪 TESTING

### Test 1: Callback URLs
```javascript
// Test in Browser Console
const testUrls = [
    'https://mawps.netlify.app',
    'https://mawps.netlify.app/bewerbung.html',
    'http://localhost:8000'
];

testUrls.forEach(url => {
    console.log(`Testing: ${url}`);
    // Test redirect
});
```

### Test 2: OAuth Flow
```javascript
// Test OAuth Flow
const testOAuth = () => {
    const authUrl = `https://manuel-weiss-userfiles-auth-038333965110.auth.eu-central-1.amazoncognito.com/login?client_id=7kc5tt6a23fgh53d60vkefm812&response_type=code&scope=email+openid+profile&redirect_uri=${encodeURIComponent(window.location.origin)}`;
    console.log('OAuth URL:', authUrl);
    return authUrl;
};
```

## 📋 CHECKLISTE

- [ ] App Client ohne Secret konfiguriert
- [ ] Alle Redirect URLs in Cognito eingetragen
- [ ] OAuth Flows aktiviert (implicit + code)
- [ ] CORS-Headers konfiguriert
- [ ] SSL-Zertifikat für Domain
- [ ] Token-Expiration-Zeiten gesetzt
- [ ] Authentication Flows aktiviert
- [ ] Test-Login funktioniert
- [ ] Redirect nach Login funktioniert
- [ ] Logout funktioniert

## 🚨 HÄUFIGE FEHLER

### Fehler 1: "Invalid redirect_uri"
**Lösung**: URL muss exakt in Cognito eingetragen sein

### Fehler 2: "Client not found"
**Lösung**: Client ID und User Pool ID prüfen

### Fehler 3: "CORS error"
**Lösung**: CORS-Headers in API Gateway konfigurieren

### Fehler 4: "Token expired"
**Lösung**: Refresh-Token-Logik implementieren
