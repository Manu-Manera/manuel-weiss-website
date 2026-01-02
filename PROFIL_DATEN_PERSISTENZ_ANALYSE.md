# Analyse: Profildaten verschwinden nach Login

## Problem
Änderungen im Profil (z.B. Name) verschwinden nach Aus- und Wiedereinloggen.

## Identifizierte Probleme

### 1. **Key-Struktur-Inkonsistenz in Backend-Handlern**

**Problem:** Es gibt 3 verschiedene Backend-Handler mit unterschiedlichen Key-Strukturen:

1. **`lambda/profile-api/index.js`**:
   - Key: `{ userId }` (direkt)
   - Tabelle: `mawps-user-profiles`

2. **`backend/user-profile/handler.mjs`**:
   - Key: `{ pk: 'user#${userId}', sk: 'profile' }`
   - Tabelle: `process.env.TABLE`

3. **`backend/complete-api/handler.mjs`**:
   - Key: `{ pk: 'user#${userId}', sk: 'profile' }`
   - Tabelle: `process.env.TABLE_NAME`

**Konsequenz:** Daten werden möglicherweise in unterschiedliche Tabellen/Strukturen gespeichert und beim Laden nicht gefunden.

### 2. **Frontend: Auth-Daten überschreiben gespeicherte Daten**

**Problem in `loadProfileDataFromAWS()` (Zeile 362-369):**
```javascript
this.profileData = {
    ...this.loadProfileData(), // Start with defaults
    ...awsData, // Override with AWS data
    // Always use auth data for name/email if available
    firstName: userData?.firstName || currentUser?.firstName || awsData?.firstName || '',
    lastName: userData?.lastName || currentUser?.lastName || awsData?.lastName || '',
    email: userData?.email || currentUser?.email || awsData?.email || ''
};
```

**Konsequenz:** Auth-Daten (die oft leer sind) überschreiben die gespeicherten Profildaten.

### 3. **Backend: Felder werden nicht vollständig gespeichert**

**Problem in `lambda/profile-api/index.js` (Zeile 109-145):**
- Speichert nur Felder, die im `body` vorhanden sind
- Leere Strings werden möglicherweise entfernt (Zeile 119-123)
- Nicht alle Felder werden explizit gespeichert

**Problem in `backend/user-profile/handler.mjs` (Zeile 195-208):**
- Felder werden nur gespeichert, wenn sie nicht leer sind (`!== ''`)
- Leere Strings werden nicht gespeichert, was zu Datenverlust führen kann

### 4. **Frontend: `saveProfileData()` entfernt möglicherweise Felder**

**Problem in `js/aws-profile-api.js` (Zeile 102-107):**
```javascript
// Remove undefined values
Object.keys(item).forEach(key => {
    if (item[key] === undefined || item[key] === '') {
        delete item[key];
    }
});
```

**Konsequenz:** Leere Strings werden entfernt, was zu Datenverlust führt.

## Lösung

### Schritt 1: Backend-Handler vereinheitlichen
- Alle Handler sollten die gleiche Key-Struktur verwenden
- Empfehlung: `{ pk: 'user#${userId}', sk: 'profile' }` (konsistent mit anderen Daten)

### Schritt 2: Alle Felder explizit speichern
- Alle Profilfelder müssen explizit in DynamoDB gespeichert werden
- Leere Strings sollten gespeichert werden (nicht entfernt)
- Nur `undefined` sollte entfernt werden

### Schritt 3: Frontend: Auth-Daten nicht überschreiben
- Gespeicherte Profildaten haben Priorität über Auth-Daten
- Auth-Daten nur als Fallback verwenden, wenn Profildaten fehlen

### Schritt 4: Validierung nach dem Speichern
- Nach dem Speichern Profil erneut laden und validieren
- Sicherstellen, dass alle Felder korrekt gespeichert wurden

## Implementierungsplan

1. ✅ Backend-Handler korrigieren (alle Felder speichern)
2. ✅ Frontend: Auth-Daten-Logik korrigieren
3. ✅ Frontend: Leere Strings nicht entfernen
4. ✅ Validierung nach dem Speichern
5. ✅ Testen und validieren

