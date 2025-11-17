# Postman API Test - Anleitung

## 1. Token aus dem Browser holen

### Schritt 1: Im Admin-Panel anmelden
1. Öffnen Sie: `https://mawps.netlify.app/admin-login.html`
2. Melden Sie sich mit Ihren Admin-Credentials an

### Schritt 2: Token aus der Browser-Konsole holen
1. Öffnen Sie die Browser-Entwicklertools (F12)
2. Gehen Sie zum **Console** Tab
3. Führen Sie folgenden Befehl aus:

```javascript
// Token aus localStorage holen
const session = JSON.parse(localStorage.getItem('admin_session'));
console.log('idToken:', session?.idToken);
console.log('accessToken:', session?.accessToken);
```

4. Kopieren Sie den `idToken` (der lange String, der mit `eyJ...` beginnt)

---

## 2. Postman konfigurieren

### Collection erstellen
1. Öffnen Sie Postman
2. Klicken Sie auf **New** → **Collection**
3. Name: `Manuel Weiss Admin API`

### Environment erstellen
1. Klicken Sie auf **Environments** (links)
2. Klicken Sie auf **+** (New Environment)
3. Name: `Manuel Weiss API`
4. Fügen Sie folgende Variablen hinzu:

| Variable | Initial Value | Current Value |
|----------|---------------|---------------|
| `baseUrl` | `https://of2iwj7h2c.execute-api.eu-central-1.amazonaws.com/prod` | `https://of2iwj7h2c.execute-api.eu-central-1.amazonaws.com/prod` |
| `idToken` | *(leer lassen, später einfügen)* | *(Ihr Token hier)* |

5. Klicken Sie auf **Save**

---

## 3. Token setzen und validieren

### Request 0: 🔑 Token setzen (aus Browser)

**Wichtig:** Führen Sie diesen Request **zuerst** aus, um den Token zu setzen und zu validieren!

**Method:** `GET`  
**URL:** `{{baseUrl}}/admin/users?onlyAdmin=true` (wird nur für Validierung verwendet)

**Was passiert:**
1. Der Pre-request Script holt den Token aus der Environment Variable `idToken`
2. Der Token wird validiert (JWT-Format, Ablaufzeit)
3. Die Gültigkeitsdauer wird berechnet (normalerweise 3600 Sekunden = 1 Stunde)
4. Token-Info wird in den Environment Variables gespeichert:
   - `tokenExpiresIn`: Verbleibende Sekunden
   - `tokenExpiresAt`: Ablaufzeitpunkt

**Token aus Browser holen:**
1. Melden Sie sich im Admin-Panel an: `https://mawps.netlify.app/admin-login.html`
2. Öffnen Sie die Browser Console (F12)
3. Führen Sie aus:
```javascript
JSON.parse(localStorage.getItem('admin_session')).idToken
```
4. Kopieren Sie den kompletten Token (beginnt mit `eyJ...`)
5. Fügen Sie ihn in Postman Environment Variable `idToken` ein
6. Führen Sie den "🔑 Token setzen" Request aus

**Token-Gültigkeit:**
- Standard: **3600 Sekunden (1 Stunde)**
- Wird automatisch bei jedem Request geprüft
- Warnung, wenn Token in weniger als 5 Minuten abläuft

---

## 4. Requests erstellen

### Request 1: Admin-User auflisten

**Method:** `GET`  
**URL:** `{{baseUrl}}/admin/users?onlyAdmin=true`  
**Headers:**
```
Authorization: Bearer {{idToken}}
Content-Type: application/json
```

**Test Script (optional):**
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response has users array", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('users');
    pm.expect(jsonData.users).to.be.an('array');
});
```

---

### Request 2: Website-User auflisten

**Method:** `GET`  
**URL:** `{{baseUrl}}/admin/users?excludeAdmin=true`  
**Headers:**
```
Authorization: Bearer {{idToken}}
Content-Type: application/json
```

---

### Request 3: Neuen User erstellen

**Method:** `POST`  
**URL:** `{{baseUrl}}/admin/users`  
**Headers:**
```
Authorization: Bearer {{idToken}}
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "email": "test@example.com",
  "password": "TempPassw0rd!",
  "name": "Test User",
  "emailVerified": true
}
```

---

### Request 4: User aktualisieren

**Method:** `PUT`  
**URL:** `{{baseUrl}}/admin/users/{userId}`  
**Headers:**
```
Authorization: Bearer {{idToken}}
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "name": "Updated Name",
  "email": "newemail@example.com",
  "emailVerified": true
}
```

**Hinweis:** Ersetzen Sie `{userId}` durch die tatsächliche User-ID (z.B. `weiss-manuel@gmx.de`)

---

### Request 5: User löschen

**Method:** `DELETE`  
**URL:** `{{baseUrl}}/admin/users/{userId}`  
**Headers:**
```
Authorization: Bearer {{idToken}}
Content-Type: application/json
```

**Hinweis:** Ersetzen Sie `{userId}` durch die tatsächliche User-ID

---

### Request 6: Passwort zurücksetzen

**Method:** `POST`  
**URL:** `{{baseUrl}}/admin/users/{userId}/reset-password`  
**Headers:**
```
Authorization: Bearer {{idToken}}
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "password": "NewPassw0rd!",
  "permanent": true
}
```

---

## 5. Automatische Token-Validierung

Die Collection enthält bereits automatische Token-Validierung:

**Pre-request Script (automatisch für alle Requests):**
- Prüft, ob Token vorhanden ist
- Validiert Token-Format (JWT)
- Prüft Ablaufzeit
- Warnt, wenn Token in weniger als 5 Minuten abläuft

**Test Script (automatisch nach jedem Request):**
- Zeigt verbleibende Gültigkeitsdauer an
- Aktualisiert `tokenExpiresIn` und `tokenExpiresAt`

**Sie müssen nichts manuell konfigurieren** - die Collection macht das automatisch!

---

## 5. Token automatisch aus Browser holen (Erweitert)

### Browser Bookmarklet erstellen

Erstellen Sie ein Bookmarklet, das den Token automatisch kopiert:

```javascript
javascript:(function(){
    const session = JSON.parse(localStorage.getItem('admin_session'));
    if (session && session.idToken) {
        navigator.clipboard.writeText(session.idToken).then(() => {
            alert('Token kopiert! Fügen Sie ihn in Postman ein.');
        });
    } else {
        alert('Kein Token gefunden! Bitte zuerst anmelden.');
    }
})();
```

**Verwendung:**
1. Erstellen Sie ein neues Lesezeichen in Ihrem Browser
2. URL: Fügen Sie den obigen JavaScript-Code ein
3. Name: "Token kopieren"
4. Nach dem Login: Klicken Sie auf das Bookmarklet → Token wird kopiert → Fügen Sie ihn in Postman ein

---

## 6. Troubleshooting

### Problem: "Unauthorized - Invalid token"
**Lösung:** 
- Token ist abgelaufen → Neu anmelden und neuen Token holen
- Token wurde nicht korrekt kopiert → Prüfen Sie, ob der Token vollständig ist

### Problem: "Internal server error"
**Lösung:**
- Prüfen Sie, ob der `Authorization` Header korrekt ist: `Bearer {{idToken}}`
- Prüfen Sie, ob der Token in der Environment Variable gesetzt ist

### Problem: "Admin access required"
**Lösung:**
- Der User, mit dem Sie sich angemeldet haben, ist nicht in der 'admin' Gruppe
- Prüfen Sie die Cognito User Pool Konfiguration

---

## 7. Beispiel-Responses

### Erfolgreiche Antwort (Admin-User):
```json
{
  "users": [
    {
      "id": "weiss-manuel@gmx.de",
      "email": "weiss-manuel@gmx.de",
      "name": "Manuel Weiss",
      "emailVerified": true,
      "status": "CONFIRMED",
      "enabled": true,
      "createdAt": "2025-11-17T00:00:00.000Z",
      "profile": null,
      "progress": {
        "totalMethods": 0,
        "completedMethods": 0,
        "streakDays": 0
      }
    }
  ],
  "pagination": {
    "nextToken": null,
    "hasMore": false
  },
  "stats": {
    "total": 1,
    "active": 0,
    "verified": 1
  }
}
```

### Fehler-Antwort:
```json
{
  "message": "Unauthorized - Invalid token: Invalid token format"
}
```

---

## 8. Postman Collection Export

Eine vollständige Postman Collection finden Sie in: `postman-collection.json`

**Import:**
1. Postman → Import
2. Datei auswählen: `postman-collection.json`
3. Environment importieren: `postman-environment.json`

