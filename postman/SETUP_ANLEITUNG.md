# 📋 Postman Setup - Schritt-für-Schritt Anleitung

## 🎯 Übersicht

Du musst folgende Variablen in Postman setzen:
- `baseUrl` - Bereits gesetzt ✅
- `idToken` - Muss gesetzt werden (aus Browser oder Login-Request)
- `userEmail` - Deine E-Mail (nur für Login-Request)
- `userPassword` - Dein Passwort (nur für Login-Request)

---

## 📝 Schritt 1: Environment Variables setzen

### 1.1 Postman öffnen und Environment aktivieren

1. **Postman öffnen**
2. **Oben rechts** auf **Environments** klicken (oder `Cmd/Ctrl + E`)
3. **"Manuel Weiss API - Production"** auswählen
4. Stelle sicher, dass es **aktiviert** ist (Dropdown oben rechts zeigt den Environment-Namen)

### 1.2 Variablen setzen

Klicke auf **"Manuel Weiss API - Production"** um die Variablen zu bearbeiten:

#### ✅ `baseUrl` (bereits gesetzt)
- **Wert:** `https://of2iwj7h2c.execute-api.eu-central-1.amazonaws.com/prod`
- **Status:** Bereits konfiguriert, muss nicht geändert werden

#### 🔑 `idToken` (MUSS gesetzt werden)
- **Wert:** (leer, muss gesetzt werden)
- **Typ:** Secret (wird nicht in Screenshots angezeigt)
- **Wie setzen:** Siehe Schritt 2 oder 3

#### 📧 `userEmail` (optional, nur für Login-Request)
- **Wert:** Deine E-Mail-Adresse (z.B. `info@manuel-weiss.ch`)
- **Verwendung:** Nur wenn du Option 2 (Login-Request) verwendest

#### 🔐 `userPassword` (optional, nur für Login-Request)
- **Wert:** Dein Passwort
- **Typ:** Secret (wird nicht angezeigt)
- **Verwendung:** Nur wenn du Option 2 (Login-Request) verwendest

**Nach dem Setzen:** Klicke auf **Save**

---

## 🔑 Schritt 2: Token setzen - Option A (Empfohlen)

### Token aus Browser holen

**Diese Methode ist am einfachsten und funktioniert sofort!**

#### 2.1 Im Browser einloggen

1. Öffne deine Website: `https://manuel-weiss.ch` oder `https://mawps.netlify.app`
2. **Logge dich ein** mit deiner E-Mail und Passwort
3. Stelle sicher, dass du erfolgreich eingeloggt bist

#### 2.2 Token aus Browser-Konsole holen

1. **Browser-Konsole öffnen:**
   - Drücke `F12` oder
   - Rechtsklick → "Untersuchen" → Tab "Console"

2. **Führe folgenden Code aus:**
   ```javascript
   // Token aus localStorage holen und in Zwischenablage kopieren
   const session = JSON.parse(localStorage.getItem('aws_auth_session'));
   
   if (session && session.idToken) {
       // Token in Zwischenablage kopieren
       navigator.clipboard.writeText(session.idToken).then(() => {
           console.log('✅ Token wurde in Zwischenablage kopiert!');
           console.log('Token (erste 50 Zeichen):', session.idToken.substring(0, 50) + '...');
       });
       
       // Token auch in Konsole anzeigen (falls Kopieren nicht funktioniert)
       console.log('📋 Vollständiger Token:');
       console.log(session.idToken);
   } else {
       console.log('❌ Kein Token gefunden. Bitte einloggen.');
   }
   ```

3. **Token kopieren:**
   - Der Token wird automatisch in die Zwischenablage kopiert
   - Falls nicht: Token aus der Konsole manuell kopieren (der lange String, der mit `eyJ...` beginnt)

#### 2.3 Token in Postman setzen

1. **In Postman:**
   - Klicke auf **Environments** (oben rechts)
   - Wähle **"Manuel Weiss API - Production"**
   - Finde die Variable `idToken`
   - **Füge den kopierten Token ein** (Einfügen: `Cmd/Ctrl + V`)
   - Klicke auf **Save**

2. **Token testen:**
   - Führe den Request **"GET Profile - Profil laden"** aus
   - Sollte **200 OK** zurückgeben (nicht 401 Unauthorized)

---

## 🔑 Schritt 2: Token setzen - Option B (Alternative)

### Token direkt in Postman generieren

**Diese Methode funktioniert nur, wenn AWS Cognito richtig konfiguriert ist.**

#### 2.1 Login-Collection importieren

1. **In Postman:**
   - Klicke auf **Import** (oben links)
   - Wähle die Datei: `postman/Login-Request.postman_collection.json`
   - Klicke auf **Import**

#### 2.2 Logindaten in Environment setzen

1. **Environment öffnen:**
   - Klicke auf **Environments** (oben rechts)
   - Wähle **"Manuel Weiss API - Production"**

2. **Setze folgende Variablen:**
   - `userEmail` = Deine E-Mail (z.B. `info@manuel-weiss.ch`)
   - `userPassword` = Dein Passwort
   - Klicke auf **Save**

#### 2.3 Login-Request ausführen

1. **Öffne die Collection:** "AWS Cognito Login (Token Generator)"
2. **Wähle den Request:** "Login - Token generieren"
3. **Klicke auf Send**
4. **Token wird automatisch gespeichert:**
   - Der Token wird automatisch in `idToken` Environment Variable gespeichert
   - Du siehst in der Konsole: "✅ Token erfolgreich generiert"

#### 2.4 Token testen

- Führe den Request **"GET Profile - Profil laden"** aus
- Sollte **200 OK** zurückgeben

---

## ❓ Welche Logindaten verwenden?

### Deine eigenen Logindaten

**Verwende die gleichen Logindaten, die du auch auf der Website verwendest:**

- **E-Mail:** Die E-Mail, mit der du dich auf `manuel-weiss.ch` einloggst
- **Passwort:** Das Passwort, das du auf der Website verwendest

### Beispiel:

```
E-Mail: info@manuel-weiss.ch
Passwort: dein-passwort
```

**Wichtig:**
- Diese Logindaten sind die gleichen wie für die Website
- Sie werden nur für die Token-Generierung verwendet
- Der Token wird dann für alle API-Requests verwendet

---

## ✅ Checkliste

### Environment Variables prüfen:

- [ ] `baseUrl` ist gesetzt: `https://of2iwj7h2c.execute-api.eu-central-1.amazonaws.com/prod`
- [ ] `idToken` ist gesetzt (langer String, beginnt mit `eyJ...`)
- [ ] Environment ist aktiviert (Dropdown oben rechts)

### Token testen:

- [ ] Request "GET Profile" ausführen
- [ ] Response ist **200 OK** (nicht 401 Unauthorized)
- [ ] Response enthält Profildaten (userId, email, etc.)

---

## 🔄 Token erneuern

**Token ist 1 Stunde gültig**

Wenn du einen **401 Unauthorized** Fehler bekommst:

1. Token ist abgelaufen
2. Hole neuen Token (siehe Schritt 2)
3. Aktualisiere `idToken` in Postman
4. Erneut versuchen

---

## 🆘 Troubleshooting

### Problem: "401 Unauthorized"

**Lösung:**
- Token ist abgelaufen oder fehlt
- Hole neuen Token aus Browser (Schritt 2, Option A)
- Setze `idToken` in Environment neu

### Problem: "Token nicht gefunden" im Browser

**Lösung:**
- Stelle sicher, dass du eingeloggt bist
- Prüfe: `localStorage.getItem('aws_auth_session')` sollte nicht `null` sein
- Logge dich aus und wieder ein

### Problem: Login-Request schlägt fehl

**Lösung:**
- Prüfe ob `userEmail` und `userPassword` in Environment gesetzt sind
- Verwende stattdessen Option A (Token aus Browser holen)
- Prüfe ob AWS Cognito `USER_PASSWORD_AUTH` erlaubt

### Problem: "Environment Variable nicht gefunden"

**Lösung:**
- Stelle sicher, dass "Manuel Weiss API - Production" aktiviert ist
- Prüfe ob die Variable existiert (kannst du manuell hinzufügen)
- Collection neu importieren

---

## 📚 Weitere Hilfe

- **Token-Generierung Details:** `TOKEN_GENERIERUNG.md`
- **API Dokumentation:** `API_ENDPOINTS_POSTMAN.md`
- **Collection README:** `README.md`

---

## 🎯 Quick Start (Zusammenfassung)

1. **Environment aktivieren:** "Manuel Weiss API - Production"
2. **Token holen:** Browser-Konsole → `localStorage.getItem('aws_auth_session')?.idToken`
3. **Token setzen:** In Postman Environment Variable `idToken`
4. **Testen:** "GET Profile" Request ausführen → sollte 200 OK sein

**Fertig! 🎉**

