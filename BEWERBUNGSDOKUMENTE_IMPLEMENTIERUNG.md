# Bewerbungsdokumente Verwaltung - Implementierung

## Überblick
Ein vollständiges System zur Verwaltung von Bewerbungsunterlagen wurde implementiert. Dokumente werden sicher in AWS S3 gespeichert mit Metadaten in DynamoDB.

## Implementierte Komponenten

### 1. Frontend JavaScript Module

#### `/js/bewerbung-documents-manager.js`
- Vollständiges Dokumentenmanagement-System
- Features:
  - Upload von Dokumenten nach Typ (Lebenslauf, Anschreiben, Zeugnisse, etc.)
  - Drag & Drop Upload
  - Download von Dokumenten
  - Löschen von Dokumenten
  - Validierung (Dateityp, Größe)
  - Fortschrittsanzeige beim Upload
  - Fallback auf LocalStorage wenn offline

### 2. Backend Lambda-Funktionen

#### `/lambda/profile-api/`
- Erweitert für Profildaten und Profilbild-Upload
- Endpoints:
  - `POST /profile` - Profildaten speichern
  - `GET /profile` - Profildaten laden
  - `GET /profile/upload-url` - Presigned URL für Profilbild

#### `/lambda/documents-api/`
- Neue Lambda für Dokumentenverwaltung
- Endpoints:
  - `POST /documents/upload-url` - Presigned URL für Upload
  - `POST /documents` - Metadaten speichern
  - `GET /documents` - Alle Dokumente auflisten
  - `GET /documents/{id}` - Einzelnes Dokument abrufen
  - `GET /documents/{id}/download-url` - Download URL
  - `DELETE /documents/{id}` - Dokument löschen

### 3. AWS Infrastructure

#### DynamoDB Tabellen:
- `mawps-user-profiles` - Benutzerprofildaten
- `mawps-user-documents` - Dokumentenmetadaten

#### S3 Bucket:
- `mawps-user-files-1760106396`
- Struktur: `users/{userId}/documents/{type}/{timestamp}-{filename}`

### 4. UI Integration

#### Bewerbungsworkflow Test Seite:
- Neue Dokumentenverwaltungs-Sektion hinzugefügt
- Drag & Drop Upload-Zone
- Quick-Upload Buttons für verschiedene Dokumenttypen
- Live-Dokumentenliste mit Download/Löschen Funktionen

## Deployment

### Schritt 1: Lambda-Funktionen deployen

```bash
cd lambda
chmod +x deploy-aws-backend.sh
./deploy-aws-backend.sh
```

Das Deployment-Script:
1. Erstellt DynamoDB Tabellen (falls nicht vorhanden)
2. Erstellt IAM Rolle mit korrekten Berechtigungen
3. Deployed beide Lambda-Funktionen
4. Erstellt API Gateway mit allen Routen
5. Gibt die API Gateway URL aus

### Schritt 2: Frontend konfigurieren

Nach dem Deployment erhalten Sie eine API Gateway URL wie:
```
https://of2iwj7h2c.execute-api.eu-central-1.amazonaws.com/prod
```

Diese URL ist bereits in allen HTML-Dateien konfiguriert.

### Schritt 3: Testen

1. Öffnen Sie `bewerbungsworkflow-test.html`
2. Melden Sie sich an
3. Testen Sie die Dokumentenverwaltung:
   - Upload per Drag & Drop
   - Upload per Button-Klick
   - Download von Dokumenten
   - Löschen von Dokumenten

## API Dokumentation

### Upload-Workflow:
1. Frontend ruft `/documents/upload-url` auf
2. Backend gibt Presigned S3 URL zurück
3. Frontend uploaded direkt zu S3
4. Frontend speichert Metadaten via `/documents`

### Sicherheit:
- Alle Requests erfordern gültigen JWT Token
- Benutzer können nur eigene Dokumente verwalten
- S3 Presigned URLs sind zeitlich begrenzt (1 Stunde)

## Fehlerbehandlung

### Profile API Fehler:
Das Problem mit der Profilspeicherung könnte folgende Ursachen haben:

1. **Lambda nicht deployed**: Führen Sie das Deployment-Script aus
2. **Falsche API URL**: Prüfen Sie die `apiBaseUrl` in den HTML-Dateien
3. **CORS Fehler**: Das Script konfiguriert CORS automatisch
4. **Berechtigungen**: IAM Rolle wird automatisch erstellt

### Debugging:
```javascript
// In der Browser-Konsole:
window.AWS_CONFIG.apiBaseUrl // Sollte die korrekte URL zeigen
window.bewerbungDocumentsManager.apiBaseUrl // Sollte gleich sein
```

## Nächste Schritte

1. **Lambda Deployment ausführen**:
   ```bash
   cd lambda
   ./deploy-aws-backend.sh
   ```

2. **Testen Sie die Funktionalität**:
   - Profil speichern/laden
   - Dokumente hochladen
   - Dokumente verwalten

3. **Bei Problemen**:
   - Prüfen Sie CloudWatch Logs
   - Verifizieren Sie die API Gateway URL
   - Testen Sie mit der Browser-Entwicklerkonsole

## Kosten

- DynamoDB: Pay-per-Request (sehr günstig)
- S3: ~$0.023 pro GB/Monat
- Lambda: Erste 1M Requests kostenlos
- API Gateway: $3.50 pro Million Requests

Für normale Nutzung fallen kaum Kosten an.
