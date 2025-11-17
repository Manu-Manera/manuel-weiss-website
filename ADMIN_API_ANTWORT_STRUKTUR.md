# Admin API Antwort-Struktur

## GET /admin/users?onlyAdmin=true

**Mit gültigem Token:**

```json
{
  "users": [
    {
      "id": "weiss-manuel@gmx.de",
      "email": "weiss-manuel@gmx.de",
      "name": "Manuel Weiss",
      "phoneNumber": null,
      "emailVerified": true,
      "status": "CONFIRMED",
      "enabled": true,
      "createdAt": "2025-11-17T00:00:00.000Z",
      "lastModified": "2025-11-17T00:00:00.000Z",
      "profile": {
        "userId": "weiss-manuel@gmx.de",
        "name": "Manuel Weiss",
        ...
      },
      "progress": {
        "totalMethods": 0,
        "completedMethods": 0,
        "lastActivity": null,
        "streakDays": 0
      },
      "completionRate": 0,
      "riskScore": 0,
      "lastLoginDays": null
    }
  ],
  "pagination": {
    "nextToken": null,
    "hasMore": false
  },
  "stats": {
    "total": 1,
    "active": 0,
    "inactive": 0,
    "verified": 1,
    "unverified": 0
  }
}
```

**Ohne Token oder ungültiger Token:**

```json
{
  "message": "Unauthorized - Invalid token: Invalid token format"
}
```

**Status Code:** 500 (sollte 401 sein, aber Lambda gibt 500 zurück)

---

## GET /admin/users?excludeAdmin=true

**Mit gültigem Token:**

```json
{
  "users": [
    {
      "id": "user@example.com",
      "email": "user@example.com",
      "name": "User Name",
      "phoneNumber": null,
      "emailVerified": true,
      "status": "CONFIRMED",
      "enabled": true,
      "createdAt": "2025-11-17T00:00:00.000Z",
      "lastModified": "2025-11-17T00:00:00.000Z",
      "profile": null,
      "progress": {
        "totalMethods": 0,
        "completedMethods": 0,
        "lastActivity": null,
        "streakDays": 0
      },
      "completionRate": 0,
      "riskScore": 0,
      "lastLoginDays": null
    }
  ],
  "pagination": {
    "nextToken": null,
    "hasMore": false
  },
  "stats": {
    "total": 1,
    "active": 0,
    "inactive": 0,
    "verified": 1,
    "unverified": 0
  }
}
```

**Hinweis:** Admin-User werden aus dieser Liste herausgefiltert.

---

## Test-Ergebnis

**Ohne Token (curl-Test):**
```json
{
  "message": "Internal server error"
}
```

**Mit ungültigem Token (Lambda-Test):**
```json
{
  "message": "Unauthorized - Invalid token: Invalid token format"
}
```

**Mit gültigem Token (vom Frontend):**
- Die API gibt die obige Struktur zurück
- `users` Array enthält alle User (Admin oder Website-User je nach Parameter)
- Jeder User enthält Cognito-Daten + DynamoDB-Daten (profile, progress)
- `pagination` zeigt, ob weitere Seiten vorhanden sind
- `stats` enthält aggregierte Statistiken

---

## Frontend-Mapping

Das Frontend mappt die API-Antwort zurück auf Cognito-Format:

```javascript
allUsers = (data.users || []).map(user => ({
    Username: user.id || user.email || user.username,
    Attributes: [
        { Name: 'email', Value: user.email },
        { Name: 'name', Value: user.name || '' },
        { Name: 'email_verified', Value: user.emailVerified ? 'true' : 'false' }
    ],
    UserStatus: user.status,
    Enabled: user.enabled !== false,
    UserCreateDate: user.createdAt ? new Date(user.createdAt) : new Date()
}));
```

Dies ermöglicht die Verwendung des gleichen Rendering-Codes für API- und Cognito-Antworten.

