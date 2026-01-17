# API Endpoints für Postman

## Base URL
```
https://of2iwj7h2c.execute-api.eu-central-1.amazonaws.com/prod
```

**Hinweis:** Die Base URL kann variieren. Prüfe `js/aws-config.js` für die aktuelle Konfiguration.

---

## 🔐 Authentifizierung

Alle Endpoints (außer `/website-images`) benötigen einen JWT Token im Authorization Header:

```
Authorization: Bearer <idToken>
```

**Token erhalten:**
1. Im Browser einloggen
2. Browser-Konsole öffnen (F12)
3. `localStorage.getItem('aws_auth_session')` ausführen
4. JSON parsen und `idToken` extrahieren

---

## 👤 User Profile Endpoints

### GET /profile
**Beschreibung:** Lädt das komplette User-Profil mit allen Feldern

**Request:**
```
GET https://of2iwj7h2c.execute-api.eu-central-1.amazonaws.com/prod/profile
Headers:
  Authorization: Bearer <idToken>
  Content-Type: application/json
```

**Response (200 OK):**
```json
{
  "userId": "user-123",
  "email": "user@example.com",
  "name": "Max Mustermann",
  "firstName": "Max",
  "lastName": "Mustermann",
  "phone": "+41 79 123 45 67",
  "birthDate": "1990-01-01",
  "location": "Zürich, Schweiz",
  "profession": "Software Engineer",
  "company": "Tech AG",
  "experience": "5 Jahre",
  "industry": "IT",
  "goals": "Karrierewachstum",
  "interests": "Programmierung, Design",
  "profileImageUrl": "https://...",
  "emailNotifications": true,
  "weeklySummary": true,
  "reminders": false,
  "theme": "light",
  "language": "de",
  "dataSharing": false,
  "preferences": {},
  "settings": {},
  "personal": {
    "firstName": "Max",
    "lastName": "Mustermann",
    "email": "user@example.com",
    "phone": "+41 79 123 45 67",
    "location": "Zürich, Schweiz",
    "birthDate": "1990-01-01"
  },
  "type": "user-profile",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-15T12:00:00.000Z"
}
```

---

### PUT /profile
**Beschreibung:** Aktualisiert das komplette User-Profil. Alle Felder können in einem Request gesendet werden.

**Request:**
```
PUT https://of2iwj7h2c.execute-api.eu-central-1.amazonaws.com/prod/profile
Headers:
  Authorization: Bearer <idToken>
  Content-Type: application/json

Body (alle Felder optional, können einzeln oder zusammen gesendet werden):
{
  "firstName": "Max",
  "lastName": "Mustermann",
  "email": "user@example.com",
  "phone": "+41 79 123 45 67",
  "birthDate": "1990-01-01",
  "location": "Zürich, Schweiz",
  "profession": "Software Engineer",
  "company": "Tech AG",
  "experience": "5 Jahre",
  "industry": "IT",
  "goals": "Karrierewachstum",
  "interests": "Programmierung, Design",
  "profileImageUrl": "https://...",
  "emailNotifications": true,
  "weeklySummary": true,
  "reminders": false,
  "theme": "light",
  "language": "de",
  "dataSharing": false,
  "preferences": {},
  "settings": {},
  "personal": {
    "firstName": "Max",
    "lastName": "Mustermann",
    "email": "user@example.com",
    "phone": "+41 79 123 45 67",
    "location": "Zürich, Schweiz",
    "birthDate": "1990-01-01"
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "profile": {
    "userId": "user-123",
    "updatedAt": "2025-01-15T12:00:00.000Z",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "name": "",
    "email": "user@example.com",
    "firstName": "Max",
    "lastName": "Mustermann",
    "phone": "+41 79 123 45 67",
    "birthDate": "1990-01-01",
    "location": "Zürich, Schweiz",
    "profession": "Software Engineer",
    "company": "Tech AG",
    "experience": "5 Jahre",
    "industry": "IT",
    "goals": "Karrierewachstum",
    "interests": "Programmierung, Design",
    "profileImageUrl": "https://...",
    "emailNotifications": true,
    "weeklySummary": true,
    "reminders": false,
    "theme": "light",
    "language": "de",
    "dataSharing": false,
    "preferences": {},
    "settings": {},
    "personal": {
      "firstName": "Max",
      "lastName": "Mustermann",
      "email": "user@example.com",
      "phone": "+41 79 123 45 67",
      "location": "Zürich, Schweiz",
      "birthDate": "1990-01-01"
    },
    "type": "user-profile"
  }
}
```

**Beispiel: Nur Name ändern**
```json
{
  "firstName": "Manuel",
  "lastName": "Weiss"
}
```

**Beispiel: Nur Telefon ändern**
```json
{
  "phone": "+41 79 999 99 99"
}
```

---

### POST /profile/upload-url
**Beschreibung:** Generiert eine Presigned URL für den Upload eines Profilbilds zu S3

**Request:**
```
POST https://of2iwj7h2c.execute-api.eu-central-1.amazonaws.com/prod/profile/upload-url
Headers:
  Authorization: Bearer <idToken>
  Content-Type: application/json

Body:
{
  "fileName": "avatar.jpg",
  "fileType": "image/jpeg"
}
```

**Response (200 OK):**
```json
{
  "uploadUrl": "https://mawps-profile-images.s3.eu-central-1.amazonaws.com/...",
  "imageUrl": "https://mawps-profile-images.s3.eu-central-1.amazonaws.com/profile-images/user-123/avatar-1234567890.jpg"
}
```

**Verwendung:**
1. Presigned URL erhalten
2. Datei mit PUT Request direkt zu S3 hochladen
3. `imageUrl` im Profil speichern (PUT /profile mit `profileImageUrl`)

---

### DELETE /profile/image
**Beschreibung:** Entfernt das Profilbild

**Request:**
```
DELETE https://of2iwj7h2c.execute-api.eu-central-1.amazonaws.com/prod/profile/image
Headers:
  Authorization: Bearer <idToken>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Profile image removed"
}
```

---

## 🌐 Website Images Endpoints (keine Auth erforderlich)

### GET /website-images/owner
**Beschreibung:** Lädt Website-Bilder (öffentlich)

**Request:**
```
GET https://of2iwj7h2c.execute-api.eu-central-1.amazonaws.com/prod/website-images/owner
Headers:
  Content-Type: application/json
```

**Response (200 OK):**
```json
{
  "userId": "owner",
  "profileImageDefault": "https://...",
  "profileImageHover": "https://...",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

---

### POST /website-images
**Beschreibung:** Speichert Website-Bilder (keine Auth erforderlich)

**Request:**
```
POST https://of2iwj7h2c.execute-api.eu-central-1.amazonaws.com/prod/website-images
Headers:
  Content-Type: application/json

Body:
{
  "profileImageDefault": "https://...",
  "profileImageHover": "https://..."
}
```

---

## 📝 Wichtige Hinweise

### 1. **Keine individuellen Feld-Endpoints**
Es gibt **keine** separaten Endpoints für einzelne Felder (z.B. `/profile/firstName`). Alle Felder werden über den `/profile` Endpoint verwaltet.

### 2. **Teilweise Updates**
Beim PUT Request können einzelne Felder gesendet werden. Nicht gesendete Felder bleiben unverändert.

**Beispiel:** Nur `firstName` ändern
```json
PUT /profile
{
  "firstName": "Neuer Name"
}
```

### 3. **Leere Strings werden gespeichert**
Leere Strings (`""`) werden explizit gespeichert. Nur `undefined` wird ignoriert.

### 4. **CORS**
Alle Endpoints unterstützen CORS. OPTIONS Requests werden automatisch behandelt.

---

## 🧪 Postman Collection

### Environment Variables
Erstelle in Postman folgende Environment Variables:

```
baseUrl: https://of2iwj7h2c.execute-api.eu-central-1.amazonaws.com/prod
idToken: <dein-id-token>
```

### Beispiel-Requests

#### 1. Profil laden
```
GET {{baseUrl}}/profile
Authorization: Bearer {{idToken}}
```

#### 2. Name ändern
```
PUT {{baseUrl}}/profile
Authorization: Bearer {{idToken}}
Content-Type: application/json

{
  "firstName": "Manuel",
  "lastName": "Weiss"
}
```

#### 3. Telefon ändern
```
PUT {{baseUrl}}/profile
Authorization: Bearer {{idToken}}
Content-Type: application/json

{
  "phone": "+41 79 123 45 67"
}
```

#### 4. Alle Felder auf einmal aktualisieren
```
PUT {{baseUrl}}/profile
Authorization: Bearer {{idToken}}
Content-Type: application/json

{
  "firstName": "Manuel",
  "lastName": "Weiss",
  "email": "info@manuel-weiss.ch",
  "phone": "+41 79 123 45 67",
  "birthDate": "1990-01-01",
  "location": "Zürich",
  "profession": "Software Engineer",
  "company": "Manuel Weiss",
  "experience": "10 Jahre",
  "industry": "IT",
  "goals": "Unternehmenswachstum",
  "interests": "Technologie, Innovation",
  "emailNotifications": true,
  "weeklySummary": true,
  "reminders": false,
  "theme": "light",
  "language": "de",
  "dataSharing": false
}
```

---

## 🔍 Verfügbare Profilfelder

### Persönliche Daten
- `firstName` (String)
- `lastName` (String)
- `email` (String)
- `phone` (String)
- `birthDate` (String, Format: YYYY-MM-DD)
- `location` (String)

### Berufliche Informationen
- `profession` (String)
- `company` (String)
- `experience` (String)
- `industry` (String)

### Karriereziele
- `goals` (String)
- `interests` (String)

### Einstellungen
- `emailNotifications` (Boolean)
- `weeklySummary` (Boolean)
- `reminders` (Boolean)
- `theme` (String: "light" | "dark")
- `language` (String: "de" | "en")
- `dataSharing` (Boolean)

### Medien
- `profileImageUrl` (String, URL)

### Strukturierte Daten
- `preferences` (Object)
- `settings` (Object)
- `personal` (Object)

---

## ❌ Fehlerbehandlung

### 401 Unauthorized
```json
{
  "error": "No valid authorization header"
}
```
**Lösung:** Token im Authorization Header hinzufügen

### 403 Forbidden
```json
{
  "error": "Access denied"
}
```
**Lösung:** Versuch, auf fremdes Profil zuzugreifen

### 404 Not Found
```json
{
  "message": "Profile not found"
}
```
**Lösung:** Profil existiert noch nicht (wird beim ersten PUT erstellt)

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```
**Lösung:** Server-Fehler, bitte erneut versuchen

