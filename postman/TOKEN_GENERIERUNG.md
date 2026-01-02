# 🔑 Token in Postman generieren/holen

## Option 1: Token aus Browser holen (Empfohlen - Einfachste Methode)

### Schritt-für-Schritt:

1. **Öffne deine Website im Browser**
   - Gehe zu: `https://manuel-weiss.ch` oder `https://mawps.netlify.app`
   - Oder lokal: `http://localhost:8000`

2. **Logge dich ein**
   - Verwende deine E-Mail und Passwort

3. **Öffne Browser-Konsole (F12)**
   - Drücke `F12` oder Rechtsklick → "Untersuchen"
   - Gehe zum **Console** Tab

4. **Führe folgenden Code aus:**
   ```javascript
   // Token aus localStorage holen
   const session = JSON.parse(localStorage.getItem('aws_auth_session'));
   if (session && session.idToken) {
       console.log('✅ idToken gefunden:');
       console.log(session.idToken);
       // Token in Zwischenablage kopieren (funktioniert in den meisten Browsern)
       navigator.clipboard.writeText(session.idToken).then(() => {
           console.log('✅ Token wurde in Zwischenablage kopiert!');
       });
   } else {
       console.log('❌ Kein Token gefunden. Bitte einloggen.');
   }
   ```

5. **Token in Postman setzen:**
   - Öffne Postman
   - Klicke auf **Environments** (oben rechts)
   - Wähle **Manuel Weiss API - Production**
   - Setze `idToken` auf den kopierten Wert
   - Klicke auf **Save**

---

## Option 2: Token direkt in Postman generieren (AWS Cognito)

**Hinweis:** Diese Methode ist komplexer, da AWS Cognito AWS Signature v4 benötigt.

### AWS Cognito Login-Endpoint:

```
POST https://cognito-idp.eu-central-1.amazonaws.com/
```

**Headers:**
```
Content-Type: application/x-amzn-json-1.1
X-Amz-Target: AWSCognitoIdentityProviderService.InitiateAuth
```

**Body:**
```json
{
  "ClientId": "7kc5tt6a23fgh53d60vkefm812",
  "AuthFlow": "USER_PASSWORD_AUTH",
  "AuthParameters": {
    "USERNAME": "deine-email@example.com",
    "PASSWORD": "dein-passwort"
  }
}
```

**Response:**
```json
{
  "AuthenticationResult": {
    "IdToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
    "AccessToken": "...",
    "RefreshToken": "...",
    "ExpiresIn": 3600
  }
}
```

**Problem:** Dieser Endpoint benötigt AWS Signature v4, was in Postman kompliziert ist.

---

## Option 3: Pre-request Script für automatisches Token-Handling

Ich erstelle ein Pre-request Script, das den Token automatisch aus einer Environment Variable holt und setzt.

**Vorteil:** Du musst den Token nur einmal setzen, dann wird er automatisch verwendet.

---

## 🎯 Empfehlung

**Verwende Option 1** (Token aus Browser holen):
- ✅ Einfachste Methode
- ✅ Funktioniert sofort
- ✅ Keine zusätzliche Konfiguration nötig
- ✅ Token ist bereits gültig

**Token-Gültigkeit:**
- Token ist 1 Stunde gültig
- Nach Ablauf: Einfach neu aus Browser holen
- Oder: Refresh Token verwenden (komplexer)

---

## 🔄 Token erneuern

Wenn du einen **401 Unauthorized** Fehler bekommst:

1. Token ist abgelaufen (nach 1 Stunde)
2. Hole neuen Token aus Browser (siehe Option 1)
3. Aktualisiere `idToken` in Postman Environment
4. Erneut versuchen

---

## 📝 Quick Reference

**Token aus Browser holen:**
```javascript
// In Browser-Konsole (F12):
const session = JSON.parse(localStorage.getItem('aws_auth_session'));
console.log(session?.idToken);
```

**Token in Postman setzen:**
1. Environments → Manuel Weiss API - Production
2. `idToken` = `<dein-token>`
3. Save

**Token testen:**
- Führe "GET Profile" Request aus
- Sollte 200 OK zurückgeben (nicht 401)

