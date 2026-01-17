# Bewerbungsmanager Tab - Implementierungsplan

## Übersicht
Integration eines neuen Tabs "Bewerbungsmanager" im User-Profil zwischen "Persönliche Daten" und "Einstellungen" mit umfangreichem Dashboard und Workflow-Integration.

## Problem 1: Profilbild-Upload
### Analyse
- Upload verwendet presigned URLs über `/profile/upload-url` Endpoint
- Mögliche Fehlerquellen:
  - API-Endpoint nicht erreichbar
  - Fehlende oder ungültige Authentifizierung
  - Falsche Bucket-Konfiguration
  - CORS-Probleme
  - Fehlende Error-Details in Fehlermeldungen

### Lösung
1. Verbessertes Error-Handling mit detaillierten Fehlermeldungen
2. Fallback-Mechanismus bei API-Fehlern
3. Validierung der Datei vor Upload
4. Besseres Logging für Debugging

## Problem 2: Bewerbungsmanager Tab Integration

### Daten-Mapping: Profil → Workflow

#### Persönliche Daten (Profil → Workflow Step 1)
- `firstName` → Workflow Profil
- `lastName` → Workflow Profil
- `email` → Workflow Profil
- `phone` → Workflow Profil
- `location` → Workflow Profil
- `birthDate` → Workflow Profil (optional)

#### Berufliche Informationen (Profil → Workflow Step 1)
- `profession` → Aktuelle Position
- `company` → Aktuelles Unternehmen
- `experience` → Berufserfahrung
- `industry` → Branche

#### Karriereziele (Profil → Workflow Step 1)
- `goals` → Motivation/Karriereziele
- `interests` → Zusätzliche Informationen

### Dashboard-Komponenten

1. **Übersicht**
   - Anzahl aktiver Bewerbungen
   - Status-Verteilung (Vorbereitung, Versendet, Interview, etc.)
   - Erfolgsrate
   - Letzte Aktivitäten

2. **Bewerbungsliste**
   - Tabelle/Liste aller Bewerbungen
   - Filter nach Status
   - Sortierung nach Datum
   - Quick-Actions (Bearbeiten, Löschen, Status ändern)

3. **Neue Bewerbung erstellen**
   - Button zum Starten des Workflows
   - Workflow öffnet sich mit vorausgefüllten Daten
   - Daten können im Workflow verändert werden

4. **Workflow-Integration**
   - `showSmartWorkflowModal()` Funktion nutzen
   - Profildaten vor dem Öffnen des Workflows laden
   - Workflow-Daten mit Profildaten vorausfüllen
   - Workflow-Daten bleiben editierbar

### Technische Umsetzung

#### 1. HTML-Struktur (user-profile.html)
- Neuer Tab-Button zwischen "Persönliche Daten" und "Einstellungen"
- Neues Tab-Panel mit Dashboard-Struktur

#### 2. JavaScript (js/user-profile.js)
- Neue Methode `initApplicationsTab()` für Tab-Initialisierung
- Methode `loadApplicationsData()` zum Laden der Bewerbungsdaten
- Methode `prefillWorkflowFromProfile()` zum Vorausfüllen
- Integration mit `showSmartWorkflowModal()`

#### 3. CSS (css/user-profile.css)
- Styles für Dashboard-Komponenten
- Styles für Bewerbungsliste
- Responsive Design

#### 4. Daten-Integration
- Profildaten aus `this.profileData` lesen
- Mapping zu Workflow-Datenstruktur
- Workflow-Daten vor dem Öffnen setzen

## Implementierungsreihenfolge

1. ✅ Profilbild-Upload Problem beheben
2. ✅ Neuen Tab "Bewerbungsmanager" in HTML hinzufügen
3. ✅ Dashboard-Grundstruktur erstellen
4. ✅ Bewerbungsdaten-Laden implementieren
5. ✅ Workflow-Integration implementieren
6. ✅ Daten-Vorausfüllung implementieren
7. ✅ CSS-Styling hinzufügen
8. ✅ Testing und Fehlerbehebung

## Datenstruktur

### Profil → Workflow Mapping
```javascript
{
  // Step 1: Profil
  firstName: profileData.firstName,
  lastName: profileData.lastName,
  email: profileData.email,
  phone: profileData.phone,
  location: profileData.location,
  
  // Step 1: Berufserfahrung
  currentPosition: profileData.profession,
  currentCompany: profileData.company,
  experienceYears: profileData.experience,
  industry: profileData.industry,
  
  // Step 1: Karriereziele
  motivation: profileData.goals,
  interests: profileData.interests
}
```

## API-Integration

### Bewerbungsdaten laden
- Nutze vorhandene `applications-core.js` Funktionalität
- Oder direkte AWS API Calls falls nötig

### Workflow starten
- Nutze `showSmartWorkflowModal()` aus `js/workflow-steps/shared-functions.js`
- Oder `startSmartWorkflow()` aus `admin-script.js`

