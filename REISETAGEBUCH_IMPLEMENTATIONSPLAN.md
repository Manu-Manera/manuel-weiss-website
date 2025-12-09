# 🗺️ Reisetagebuch - Detaillierter Implementierungsplan

## 📋 Übersicht

Das Reisetagebuch ist eine neue Sektion auf der Wohnmobil-Vermietungsseite, die es autorisierten Benutzern ermöglicht:
- Bilder von ihren Reisen hochzuladen
- Standorte zu markieren (GPS-Koordinaten)
- Eine interaktive Karte zu sehen, wo der Bus bereits gewesen ist
- Einträge mit Datum, Beschreibung und Standort zu erstellen

**Zugriff:** Nur für freigeschaltete Benutzer (Mieter oder Interessenten)

---

## 🏗️ Architektur-Übersicht

### Frontend
- **Neue Seite:** `wohnmobil-reisetagebuch.html` (oder Sektion in `wohnmobil.html`)
- **URL:** `/wohnmobil-reisetagebuch.html` oder `/wohnmobil.html#reisetagebuch`
- **Login-System:** Gesonderte Authentifizierung für Reisetagebuch-Benutzer
- **Karten-Integration:** Google Maps JavaScript API oder Leaflet.js (Open Source Alternative)

### Backend
- **API Endpoint:** `/api/travel-journal` (eigene API)
- **Lambda-Funktionen:** 
  - `lambda/travel-journal-api/index.js` (Haupt-API)
  - `lambda/travel-journal-auth/index.js` (Authentifizierung)
- **Datenbank:** AWS DynamoDB Tabelle `TravelJournal`
- **Storage:** AWS S3 Bucket für Bilder (`travel-journal-images/`)

### Admin-Panel
- **Neue Sektion:** User-Verwaltung im Wohnmobil-Bereich
- **Funktionen:** Benutzer freischalten, deaktivieren, Einträge moderieren

---

## 📁 Dateistruktur

```
/
├── wohnmobil.html (erweitert mit Reisetagebuch-Sektion)
├── wohnmobil-reisetagebuch.html (neue Seite)
├── js/
│   ├── travel-journal/
│   │   ├── travel-journal-auth.js (Authentifizierung)
│   │   ├── travel-journal-api.js (API-Client)
│   │   ├── travel-journal-map.js (Karten-Funktionalität)
│   │   ├── travel-journal-upload.js (Bild-Upload)
│   │   └── travel-journal-ui.js (UI-Management)
│   └── admin/
│       └── sections/
│           └── travel-journal-users.js (User-Verwaltung im Admin)
├── lambda/
│   ├── travel-journal-api/
│   │   ├── index.js (Haupt-API)
│   │   └── package.json
│   └── travel-journal-auth/
│       ├── index.js (Auth-Handler)
│       └── package.json
└── infrastructure/
    └── travel-journal/
        ├── dynamodb-table.yaml (DynamoDB Table)
        ├── lambda-functions.yaml (Lambda Functions)
        └── api-gateway.yaml (API Gateway Routes)
```

---

## 🗄️ Datenbank-Schema (DynamoDB)

### Tabelle: `TravelJournal`

#### Partition Key: `entryId` (String)
#### Sort Key: `timestamp` (Number)

**Attribute:**
```javascript
{
  entryId: "uuid-v4",                    // Eindeutige ID
  timestamp: 1234567890,                  // Unix Timestamp
  userId: "user-email-or-id",             // Benutzer-ID
  userName: "Max Mustermann",             // Anzeigename
  location: {
    latitude: 47.3769,                     // GPS-Koordinaten
    longitude: 8.5417,
    address: "Zürich, Schweiz",           // Adresse (optional)
    placeName: "Zürichsee"                // Ortsname (optional)
  },
  images: [
    {
      imageId: "uuid",
      s3Key: "travel-journal-images/...",
      url: "https://...",
      thumbnailUrl: "https://...",
      uploadedAt: "2024-01-01T12:00:00Z"
    }
  ],
  description: "Wunderschöner Tag am See", // Beschreibung
  tags: ["see", "sonne", "entspannung"],  // Tags (optional)
  status: "published",                     // published | draft | moderated
  createdAt: "2024-01-01T12:00:00Z",
  updatedAt: "2024-01-01T12:00:00Z"
}
```

### Tabelle: `TravelJournalUsers`

#### Partition Key: `userId` (String)

**Attribute:**
```javascript
{
  userId: "user-email-or-id",
  email: "user@example.com",
  name: "Max Mustermann",
  status: "active",                       // active | inactive | pending
  role: "renter",                         // renter | interested | admin
  rentalPeriod: {                          // Nur für Mieter
    startDate: "2024-01-01",
    endDate: "2024-01-07"
  },
  createdAt: "2024-01-01T12:00:00Z",
  lastLogin: "2024-01-05T12:00:00Z",
  createdBy: "admin@manuel-weiss.com"     // Wer hat den User freigeschaltet
}
```

---

## 🔐 Authentifizierung & Autorisierung

### Option 1: AWS Cognito User Pool (Empfohlen)
- **Vorteile:** Integration mit bestehendem System, skalierbar, sicher
- **Nachteil:** Zusätzliche Kosten für viele Benutzer

### Option 2: Eigenes JWT-basiertes System
- **Vorteile:** Kostenlos, einfache Verwaltung
- **Nachteil:** Mehr eigene Implementierung

### Option 3: Hybrid (Empfohlen für MVP)
- **Admin:** AWS Cognito (wie bisher)
- **Reisetagebuch-User:** Eigenes JWT-System mit einfachem Login
- **Speicherung:** DynamoDB `TravelJournalUsers`

**Implementierung (Option 3):**
```javascript
// Einfacher Login-Flow
1. User gibt Email ein
2. System sendet Magic Link per Email (oder Passwort)
3. Nach Login: JWT Token generieren
4. Token in LocalStorage speichern
5. Token bei jedem API-Request mitsenden
```

---

## 🗺️ Karten-Integration

### Option 1: Google Maps JavaScript API (Empfohlen)
**Vorteile:**
- Sehr gute Dokumentation
- Viele Features (Markierungen, Routen, Street View)
- Gute Performance

**Nachteile:**
- Kosten ab 28.000 Requests/Monat (kostenlos bis dahin)
- API Key erforderlich

**Implementierung:**
```html
<script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places"></script>
```

### Option 2: Leaflet.js + OpenStreetMap (Kostenlos)
**Vorteile:**
- Komplett kostenlos
- Open Source
- Sehr flexibel

**Nachteile:**
- Etwas mehr Setup-Aufwand
- Weniger Features out-of-the-box

**Empfehlung:** Google Maps für MVP, später auf Leaflet umstellen wenn Traffic hoch ist

---

## 📡 API-Endpunkte

### Base URL: `https://api.manuel-weiss.ch/travel-journal` (oder über API Gateway)

### 1. Authentifizierung

#### POST `/auth/login`
**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "jwt-token-here",
  "user": {
    "userId": "user@example.com",
    "name": "Max Mustermann",
    "status": "active"
  }
}
```

#### POST `/auth/register`
**Request:**
```json
{
  "email": "user@example.com",
  "name": "Max Mustermann",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Registration successful. Awaiting approval.",
  "status": "pending"
}
```

#### POST `/auth/request-access`
**Request:**
```json
{
  "email": "user@example.com",
  "name": "Max Mustermann",
  "reason": "Ich möchte das Wohnmobil mieten",
  "rentalPeriod": {
    "startDate": "2024-06-01",
    "endDate": "2024-06-07"
  }
}
```

### 2. Einträge

#### GET `/entries`
**Query Parameters:**
- `limit`: Anzahl Einträge (default: 50)
- `offset`: Pagination Offset
- `userId`: Filter nach User (optional)
- `startDate`: Start-Datum Filter
- `endDate`: End-Datum Filter

**Response:**
```json
{
  "entries": [
    {
      "entryId": "uuid",
      "timestamp": 1234567890,
      "userId": "user@example.com",
      "userName": "Max Mustermann",
      "location": {
        "latitude": 47.3769,
        "longitude": 8.5417,
        "address": "Zürich, Schweiz"
      },
      "images": [...],
      "description": "...",
      "createdAt": "2024-01-01T12:00:00Z"
    }
  ],
  "total": 100,
  "limit": 50,
  "offset": 0
}
```

#### POST `/entries`
**Request:**
```json
{
  "location": {
    "latitude": 47.3769,
    "longitude": 8.5417,
    "address": "Zürich, Schweiz"
  },
  "description": "Wunderschöner Tag am See",
  "images": [
    {
      "imageId": "uuid",
      "s3Key": "travel-journal-images/...",
      "url": "https://..."
    }
  ],
  "tags": ["see", "sonne"]
}
```

**Response:**
```json
{
  "entryId": "uuid",
  "status": "published",
  "createdAt": "2024-01-01T12:00:00Z"
}
```

#### PUT `/entries/{entryId}`
**Request:** (gleiche Struktur wie POST)

#### DELETE `/entries/{entryId}`
**Response:**
```json
{
  "message": "Entry deleted successfully"
}
```

### 3. Bilder

#### POST `/images/presign`
**Request:**
```json
{
  "filename": "image.jpg",
  "contentType": "image/jpeg",
  "size": 1234567
}
```

**Response:**
```json
{
  "presignedUrl": "https://...",
  "s3Key": "travel-journal-images/...",
  "publicUrl": "https://...",
  "expiresIn": 3600
}
```

#### POST `/images/upload-complete`
**Request:**
```json
{
  "s3Key": "travel-journal-images/...",
  "imageId": "uuid"
}
```

### 4. Karte

#### GET `/map/coordinates`
**Response:**
```json
{
  "coordinates": [
    {
      "latitude": 47.3769,
      "longitude": 8.5417,
      "entryId": "uuid",
      "timestamp": 1234567890,
      "description": "..."
    }
  ],
  "bounds": {
    "north": 47.5,
    "south": 47.0,
    "east": 8.7,
    "west": 8.3
  }
}
```

---

## 🎨 Frontend-Implementierung

### 1. Reisetagebuch-Seite (`wohnmobil-reisetagebuch.html`)

**Struktur:**
```html
<!DOCTYPE html>
<html lang="de">
<head>
    <!-- Meta, Styles, etc. -->
    <link rel="stylesheet" href="css/travel-journal.css">
    <!-- Google Maps API -->
    <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places"></script>
</head>
<body>
    <!-- Navigation -->
    <nav>...</nav>
    
    <!-- Hero Section -->
    <section class="travel-journal-hero">
        <h1>Reisetagebuch</h1>
        <p>Folge den Reisen unseres Wohnmobils</p>
    </section>
    
    <!-- Login Modal (wenn nicht eingeloggt) -->
    <div id="loginModal" class="modal">
        <!-- Login Form -->
    </div>
    
    <!-- Hauptinhalt (nur wenn eingeloggt) -->
    <div id="travelJournalContent" style="display: none;">
        <!-- Karten-Sektion -->
        <section class="map-section">
            <div id="travelMap" style="height: 600px;"></div>
        </section>
        
        <!-- Einträge-Grid -->
        <section class="entries-section">
            <div class="entries-header">
                <h2>Reiseeinträge</h2>
                <button id="addEntryBtn" class="btn btn-primary">
                    <i class="fas fa-plus"></i> Neuer Eintrag
                </button>
            </div>
            <div id="entriesGrid" class="entries-grid">
                <!-- Einträge werden hier dynamisch geladen -->
            </div>
        </section>
        
        <!-- Neuer Eintrag Modal -->
        <div id="newEntryModal" class="modal">
            <form id="newEntryForm">
                <!-- Standort-Auswahl (Google Maps Places Autocomplete) -->
                <input type="text" id="locationInput" placeholder="Standort suchen...">
                <div id="locationMap" style="height: 300px;"></div>
                
                <!-- Beschreibung -->
                <textarea id="descriptionInput" placeholder="Beschreibung..."></textarea>
                
                <!-- Bild-Upload -->
                <input type="file" id="imageUpload" multiple accept="image/*">
                <div id="imagePreview"></div>
                
                <!-- Submit -->
                <button type="submit">Eintrag erstellen</button>
            </form>
        </div>
    </div>
    
    <!-- Scripts -->
    <script src="js/travel-journal/travel-journal-auth.js"></script>
    <script src="js/travel-journal/travel-journal-api.js"></script>
    <script src="js/travel-journal/travel-journal-map.js"></script>
    <script src="js/travel-journal/travel-journal-upload.js"></script>
    <script src="js/travel-journal/travel-journal-ui.js"></script>
</body>
</html>
```

### 2. JavaScript-Module

#### `travel-journal-auth.js`
```javascript
class TravelJournalAuth {
    constructor() {
        this.token = localStorage.getItem('travelJournalToken');
        this.user = JSON.parse(localStorage.getItem('travelJournalUser') || 'null');
    }
    
    async login(email, password) {
        // API-Call zum Login
        // Token speichern
        // User-Info speichern
    }
    
    async register(email, name, password) {
        // API-Call zur Registrierung
    }
    
    async requestAccess(email, name, reason, rentalPeriod) {
        // API-Call für Zugriffsanfrage
    }
    
    isAuthenticated() {
        return !!this.token && !!this.user;
    }
    
    logout() {
        localStorage.removeItem('travelJournalToken');
        localStorage.removeItem('travelJournalUser');
        this.token = null;
        this.user = null;
    }
}
```

#### `travel-journal-map.js`
```javascript
class TravelJournalMap {
    constructor(mapElementId) {
        this.map = null;
        this.markers = [];
        this.initMap();
    }
    
    initMap() {
        this.map = new google.maps.Map(document.getElementById(mapElementId), {
            center: { lat: 47.3769, lng: 8.5417 }, // Schweiz
            zoom: 6
        });
    }
    
    addEntryMarker(entry) {
        const marker = new google.maps.Marker({
            position: {
                lat: entry.location.latitude,
                lng: entry.location.longitude
            },
            map: this.map,
            title: entry.description
        });
        
        const infoWindow = new google.maps.InfoWindow({
            content: this.createInfoWindowContent(entry)
        });
        
        marker.addListener('click', () => {
            infoWindow.open(this.map, marker);
        });
        
        this.markers.push(marker);
    }
    
    createInfoWindowContent(entry) {
        return `
            <div class="map-info-window">
                <h3>${entry.userName}</h3>
                <p>${entry.description}</p>
                <img src="${entry.images[0]?.url}" style="max-width: 200px;">
                <p><small>${new Date(entry.timestamp * 1000).toLocaleDateString()}</small></p>
            </div>
        `;
    }
    
    drawRoute(coordinates) {
        const path = coordinates.map(c => ({
            lat: c.latitude,
            lng: c.longitude
        }));
        
        const route = new google.maps.Polyline({
            path: path,
            geodesic: true,
            strokeColor: '#FF0000',
            strokeOpacity: 1.0,
            strokeWeight: 2
        });
        
        route.setMap(this.map);
    }
}
```

#### `travel-journal-upload.js`
```javascript
class TravelJournalUpload {
    async uploadImage(file) {
        // 1. Presigned URL anfordern
        const presignResponse = await travelJournalAPI.getPresignedUrl({
            filename: file.name,
            contentType: file.type,
            size: file.size
        });
        
        // 2. Bild zu S3 hochladen
        await fetch(presignResponse.presignedUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': file.type
            },
            body: file
        });
        
        // 3. Upload-Complete melden
        await travelJournalAPI.uploadComplete({
            s3Key: presignResponse.s3Key,
            imageId: presignResponse.imageId
        });
        
        return presignResponse.publicUrl;
    }
    
    async uploadMultipleImages(files) {
        const uploadPromises = Array.from(files).map(file => 
            this.uploadImage(file)
        );
        return Promise.all(uploadPromises);
    }
}
```

---

## 🔧 Admin-Panel-Erweiterung

### Neue Sektion: User-Verwaltung für Reisetagebuch

**Datei:** `js/admin/sections/travel-journal-users.js`

**Funktionen:**
1. **User-Liste anzeigen**
   - Alle registrierten Benutzer
   - Status (active, inactive, pending)
   - Rolle (renter, interested)
   - Letzter Login

2. **User freischalten**
   - Status von "pending" auf "active" ändern
   - Email-Benachrichtigung senden

3. **User deaktivieren**
   - Status auf "inactive" setzen
   - Zugriff sperren

4. **User bearbeiten**
   - Name ändern
   - Rolle ändern
   - Mietzeitraum verwalten

**UI-Struktur:**
```html
<div class="travel-journal-users-section">
    <div class="section-header">
        <h2>Reisetagebuch - Benutzerverwaltung</h2>
        <button class="btn btn-primary" id="addUserBtn">
            <i class="fas fa-user-plus"></i> Neuen Benutzer hinzufügen
        </button>
    </div>
    
    <div class="users-table">
        <table>
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Rolle</th>
                    <th>Mietzeitraum</th>
                    <th>Letzter Login</th>
                    <th>Aktionen</th>
                </tr>
            </thead>
            <tbody id="usersTableBody">
                <!-- Dynamisch geladen -->
            </tbody>
        </table>
    </div>
</div>
```

---

## 🚀 Implementierungs-Schritte

### Phase 1: Backend-Setup (Woche 1)
1. ✅ DynamoDB-Tabellen erstellen
2. ✅ Lambda-Funktionen entwickeln
3. ✅ API Gateway Routes konfigurieren
4. ✅ S3 Bucket für Bilder einrichten
5. ✅ Authentifizierung implementieren

### Phase 2: Frontend-Grundgerüst (Woche 2)
1. ✅ HTML-Seite erstellen
2. ✅ CSS-Styling
3. ✅ Basis-JavaScript-Module
4. ✅ Login/Registrierung UI

### Phase 3: Karten-Integration (Woche 2-3)
1. ✅ Google Maps API einbinden
2. ✅ Karte anzeigen
3. ✅ Marker für Einträge
4. ✅ Route zeichnen
5. ✅ Standort-Auswahl für neue Einträge

### Phase 4: Bild-Upload (Woche 3)
1. ✅ Presigned URL Flow
2. ✅ Bild-Upload zu S3
3. ✅ Thumbnail-Generierung
4. ✅ Bild-Galerie

### Phase 5: Admin-Panel (Woche 4)
1. ✅ User-Verwaltung UI
2. ✅ Freischaltungs-Funktion
3. ✅ Einträge-Moderation (optional)

### Phase 6: Testing & Deployment (Woche 4-5)
1. ✅ Testing
2. ✅ Bug-Fixes
3. ✅ Performance-Optimierung
4. ✅ Deployment

---

## 💰 Kosten-Schätzung

### AWS Services
- **DynamoDB:** ~$5-10/Monat (abhängig von Traffic)
- **Lambda:** ~$1-5/Monat (1M Requests kostenlos)
- **S3 Storage:** ~$1-3/Monat (5GB kostenlos)
- **API Gateway:** ~$3-10/Monat (1M Requests kostenlos)
- **Cognito:** ~$0.0055 pro MAU (Monthly Active User)

### Google Maps API
- **Kostenlos:** Bis 28.000 Map Loads/Monat
- **Danach:** $7 pro 1.000 Loads

### Gesamt: ~$10-30/Monat (bei moderatem Traffic)

---

## 🔒 Sicherheit

1. **Authentifizierung:**
   - JWT Tokens mit Ablaufzeit
   - Token-Refresh-Mechanismus
   - Secure HTTP-only Cookies (optional)

2. **Autorisierung:**
   - Nur freigeschaltete User können Einträge erstellen
   - User können nur eigene Einträge bearbeiten/löschen
   - Admin kann alle Einträge moderieren

3. **Bild-Upload:**
   - Dateityp-Validierung
   - Dateigröße-Limit (max 10MB)
   - Virus-Scan (optional, über AWS Lambda)

4. **API-Sicherheit:**
   - Rate Limiting
   - CORS-Konfiguration
   - Input-Validierung

---

## 📱 Responsive Design

- **Desktop:** Vollständige Karte + Einträge-Grid
- **Tablet:** Karte oben, Einträge darunter
- **Mobile:** Karte kollabierbar, Einträge-Liste

---

## 🎯 Erweiterte Features (Optional, später)

1. **Social Features:**
   - Kommentare zu Einträgen
   - Likes/Favoriten
   - Teilen auf Social Media

2. **Statistiken:**
   - Anzahl besuchter Länder
   - Gesamtkilometer
   - Meistbesuchte Orte

3. **Filter & Suche:**
   - Nach Datum filtern
   - Nach Standort suchen
   - Nach Tags filtern

4. **Export:**
   - PDF-Reisebericht generieren
   - GPX-Datei exportieren

---

## 📝 Nächste Schritte

1. **Entscheidungen treffen:**
   - Google Maps oder Leaflet?
   - Cognito oder eigenes Auth-System?
   - URL-Struktur (eigene Seite oder Sektion?)

2. **Backend starten:**
   - DynamoDB-Tabellen erstellen
   - Lambda-Funktionen entwickeln
   - API Gateway konfigurieren

3. **Frontend starten:**
   - HTML-Grundgerüst
   - Karten-Integration
   - Upload-Funktionalität

4. **Admin-Panel erweitern:**
   - User-Verwaltung
   - Freischaltungs-Funktion

---

## ❓ Offene Fragen

1. Soll das Reisetagebuch öffentlich sichtbar sein (ohne Login) oder komplett privat?
2. Sollen Einträge vor Veröffentlichung moderiert werden?
3. Sollen mehrere Benutzer gleichzeitig Einträge erstellen können?
4. Soll es eine mobile App geben (später)?

---

**Erstellt am:** 2024-12-08
**Status:** Planungsphase
**Nächster Schritt:** Backend-Setup starten

