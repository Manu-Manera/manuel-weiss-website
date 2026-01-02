# Postman Collection Setup - Manuel Weiss API

## 🚀 Schnellstart

### 1. Postman öffnen
- Postman installieren (falls noch nicht vorhanden): https://www.postman.com/downloads/
- Postman öffnen

### 2. Collection importieren
1. Klicke auf **Import** (oben links)
2. Wähle die Datei: `Manuel-Weiss-API.postman_collection.json`
3. Klicke auf **Import**

### 3. Environment importieren
1. Klicke auf **Import** erneut
2. Wähle die Datei: `Manuel-Weiss-API.postman_environment.json`
3. Klicke auf **Import**

### 4. Environment aktivieren
1. Klicke oben rechts auf **Environments**
2. Wähle **Manuel Weiss API - Production** aus
3. Stelle sicher, dass es aktiviert ist (Dropdown oben rechts)

### 5. Token setzen

#### Option A: Token aus Browser holen (Empfohlen)
1. Öffne deine Website im Browser
2. Logge dich ein
3. Öffne Browser-Konsole (F12)
4. Führe aus:
   ```javascript
   const session = JSON.parse(localStorage.getItem('aws_auth_session'));
   console.log('idToken:', session?.idToken);
   ```
5. Kopiere den `idToken` (der lange String, der mit `eyJ...` beginnt)
6. In Postman:
   - Klicke auf **Environments** (oben rechts)
   - Wähle **Manuel Weiss API - Production**
   - Setze `idToken` auf den kopierten Wert
   - Klicke auf **Save**

#### Option B: Token manuell in Postman setzen
1. Klicke auf **Environments** (oben rechts)
2. Wähle **Manuel Weiss API - Production**
3. Setze `idToken` auf deinen JWT Token
4. Klicke auf **Save**

---

## 📋 Verfügbare Requests

### User Profile
- **GET Profile** - Profil laden
- **PUT Profile - Vollständiges Update** - Alle Felder aktualisieren
- **PUT Profile - Nur Name ändern** - Beispiel für teilweise Update
- **PUT Profile - Nur Telefon ändern** - Beispiel für teilweise Update

### Profile Image
- **POST Upload URL** - Presigned URL für Bild-Upload generieren
- **DELETE Profile Image** - Profilbild entfernen

### Website Images
- **GET Website Images** - Öffentliche Bilder laden (keine Auth)
- **POST Website Images** - Bilder speichern (keine Auth)

---

## 🧪 Tests

Alle Requests haben automatische Tests:
- Status Code Validierung
- Response-Struktur Validierung
- Automatisches Speichern von Werten (z.B. `profileImageUrl`)

**Tests ausführen:**
1. Request senden
2. Unten auf **Test Results** Tab klicken
3. Ergebnisse ansehen

---

## 🔧 Environment Variables

### baseUrl
- **Wert:** `https://of2iwj7h2c.execute-api.eu-central-1.amazonaws.com/prod`
- **Beschreibung:** Base URL der API
- **Änderbar:** Ja (für andere Umgebungen)

### idToken
- **Wert:** (leer, muss gesetzt werden)
- **Beschreibung:** JWT Token für Authentifizierung
- **Typ:** Secret (wird nicht in Screenshots angezeigt)

### profileImageUrl
- **Wert:** (wird automatisch gesetzt)
- **Beschreibung:** URL des hochgeladenen Profilbilds
- **Wird gesetzt:** Nach POST Upload URL Request

---

## 💡 Tipps

### Token erneuern
Wenn der Token abgelaufen ist (401 Unauthorized):
1. Hole neuen Token aus Browser (siehe Schritt 5)
2. Aktualisiere `idToken` in Postman Environment

### Teilweise Updates
Du kannst einzelne Felder aktualisieren, ohne alle zu senden:
```json
{
  "firstName": "Manuel",
  "lastName": "Weiss"
}
```

### Vollständiges Update
Sende alle Felder für ein vollständiges Update:
```json
{
  "firstName": "Manuel",
  "lastName": "Weiss",
  "email": "info@manuel-weiss.ch",
  "phone": "+41 79 123 45 67",
  ...
}
```

---

## ❌ Fehlerbehandlung

### 401 Unauthorized
- **Problem:** Token fehlt oder ist abgelaufen
- **Lösung:** Token aus Browser holen und in Environment setzen

### 403 Forbidden
- **Problem:** Versuch, auf fremdes Profil zuzugreifen
- **Lösung:** Nur eigenes Profil kann geändert werden

### 404 Not Found
- **Problem:** Profil existiert noch nicht
- **Lösung:** Erstelle Profil mit PUT Request (wird automatisch erstellt)

### 500 Internal Server Error
- **Problem:** Server-Fehler
- **Lösung:** Erneut versuchen oder Support kontaktieren

---

## 📚 Weitere Dokumentation

- **API Dokumentation:** `API_ENDPOINTS_POSTMAN.md`
- **Test Report:** `API_ENDPOINTS_TEST_REPORT.md`

---

## ✅ Checkliste

- [ ] Postman installiert
- [ ] Collection importiert
- [ ] Environment importiert
- [ ] Environment aktiviert
- [ ] Token gesetzt
- [ ] Erster Request erfolgreich (GET Profile)

**Fertig! 🎉**

