# Profile API Endpoints

## Base URL
```
https://of2iwj7h2c.execute-api.eu-central-1.amazonaws.com/prod
```

---

## 🔐 Authentifizierung

Für `GET /profiles` und `GET /profiles/{uuid}` ist **keine Authentifizierung** erforderlich.

Für `GET /profile` (eigenes Profil) wird ein JWT Token benötigt:
```
Authorization: Bearer <idToken>
```

---

## 📋 Endpunkte

### 1. GET /profiles
**Beschreibung:** Liste aller Profile (nur Übersicht, ohne sensible Daten)

**Request:**
```
GET https://of2iwj7h2c.execute-api.eu-central-1.amazonaws.com/prod/profiles
```

**Response (200 OK):**
```json
{
  "count": 2,
  "profiles": [
    {
      "userId": "user-123",
      "name": "Max Mustermann",
      "email": "max@example.com",
      "firstName": "Max",
      "lastName": "Mustermann",
      "profession": "Software Engineer",
      "company": "Tech AG",
      "profileImageUrl": "https://...",
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-15T12:00:00.000Z"
    },
    {
      "userId": "user-456",
      "name": "Anna Schmidt",
      "email": "anna@example.com",
      "firstName": "Anna",
      "lastName": "Schmidt",
      "profession": "Designer",
      "company": "Design Studio",
      "profileImageUrl": "",
      "createdAt": "2025-01-10T00:00:00.000Z",
      "updatedAt": "2025-01-20T10:00:00.000Z"
    }
  ]
}
```

**Felder in der Übersicht:**
- `userId` - Eindeutige User-ID
- `name` - Vollständiger Name
- `email` - E-Mail-Adresse
- `firstName` - Vorname
- `lastName` - Nachname
- `profession` - Beruf
- `company` - Firma
- `profileImageUrl` - URL zum Profilbild
- `createdAt` - Erstellungsdatum
- `updatedAt` - Letztes Update

---

### 2. GET /profiles/{uuid}
**Beschreibung:** Vollständiges Profil nach UUID (userId)

**Request:**
```
GET https://of2iwj7h2c.execute-api.eu-central-1.amazonaws.com/prod/profiles/{uuid}
```

**Beispiel:**
```
GET https://of2iwj7h2c.execute-api.eu-central-1.amazonaws.com/prod/profiles/user-123
```

**Response (200 OK):**
```json
{
  "userId": "user-123",
  "email": "max@example.com",
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
    "email": "max@example.com",
    "phone": "+41 79 123 45 67",
    "location": "Zürich, Schweiz",
    "birthDate": "1990-01-01"
  },
  "type": "user-profile",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-15T12:00:00.000Z"
}
```

**Response (404 Not Found):**
```json
{
  "message": "Profile not found",
  "uuid": "user-123"
}
```

---

### 3. GET /profile
**Beschreibung:** Eigenes Profil (benötigt Authentifizierung)

**Request:**
```
GET https://of2iwj7h2c.execute-api.eu-central-1.amazonaws.com/prod/profile
Headers:
  Authorization: Bearer <idToken>
  Content-Type: application/json
```

**Response:** Siehe `GET /profiles/{uuid}`

---

## 📝 Postman Collection

### Request 1: Liste aller Profile
```
GET {{baseUrl}}/profiles
```

### Request 2: Profil nach UUID
```
GET {{baseUrl}}/profiles/{{userId}}
```

### Request 3: Eigenes Profil
```
GET {{baseUrl}}/profile
Authorization: Bearer {{idToken}}
```

---

## ⚠️ Wichtige Hinweise

1. **Keine Authentifizierung für Liste:** `GET /profiles` ist öffentlich zugänglich
2. **UUID Format:** Die UUID entspricht der `userId` aus dem Profil
3. **Sensible Daten:** Die Liste enthält nur öffentliche Informationen
4. **Vollständiges Profil:** `GET /profiles/{uuid}` gibt alle Profildaten zurück

---

## 🔍 Fehlerbehandlung

### 404 Not Found
```json
{
  "message": "Profile not found",
  "uuid": "user-123"
}
```

### 500 Internal Server Error
```json
{
  "message": "Error message"
}
```

