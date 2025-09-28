# OCR-Integration für Bewerbungs-Workflow

## 🎯 Übersicht

Diese Integration fügt automatische Texterkennung (OCR) und Dokumentenanalyse zum Bewerbungs-Workflow hinzu. Das System unterstützt sowohl Server-seitige als auch Client-seitige OCR-Verarbeitung.

## 🚀 Features

### Frontend-Integration
- **KI-Dokumentenanalyse-Sektion** in `bewerbung.html`
- **Automatische Texterkennung** für PDFs und Bilder
- **Intelligente Entitäts-Extraktion** (E-Mails, Telefonnummern, Skills, etc.)
- **Dokumenten-Bewertung** mit Verbesserungsvorschlägen
- **Responsive Design** für alle Geräte

### Backend-Server
- **Multi-Engine OCR**: Google Cloud Vision + Tesseract.js
- **PDF-Text-Extraktion**: Eingebetteter Text wird zuerst extrahiert
- **Batch-Verarbeitung**: Mehrere Dokumente gleichzeitig
- **Fallback-System**: Robuste Fehlerbehandlung
- **RESTful API**: Einfache Integration

## 📁 Dateistruktur

```
backend/
├── ocr-server.js          # Hauptserver
├── package.json           # Dependencies
└── uploads/              # Temporäre Dateien

bewerbung.html            # Frontend mit OCR-Integration
deploy-ocr-server.sh      # Deployment-Skript
```

## 🛠️ Installation

### 1. Backend-Server einrichten

```bash
# OCR-Server deployen
./deploy-ocr-server.sh

# Oder manuell:
cd backend
npm install
npm start
```

### 2. Google Cloud Vision (optional)

```bash
# Google Cloud CLI installieren
curl https://sdk.cloud.google.com | bash

# Authentifizierung
gcloud auth application-default login

# Vision API aktivieren
gcloud services enable vision.googleapis.com
```

### 3. Dependencies

```bash
# Backend-Dependencies
cd backend
npm install express multer pdf-parse cors @google-cloud/vision tesseract.js

# Für Entwicklung
npm install -D nodemon
```

## 🔧 Konfiguration

### Umgebungsvariablen

```bash
# .env Datei
PORT=3001
NODE_ENV=production
GOOGLE_APPLICATION_CREDENTIALS=/path/to/credentials.json
```

### Server-Endpunkte

- `POST /api/ocr` - Einzelne Datei OCR
- `POST /api/ocr/batch` - Mehrere Dateien OCR
- `GET /api/health` - Server-Status

## 📊 OCR-Engines

### 1. Google Cloud Vision (Empfohlen)
- **Qualität**: Sehr hoch
- **Kosten**: Pay-per-use
- **Sprachen**: 50+ Sprachen
- **Setup**: Google Cloud Account erforderlich

### 2. Tesseract.js (Fallback)
- **Qualität**: Gut
- **Kosten**: Kostenlos
- **Sprachen**: 100+ Sprachen
- **Setup**: Automatisch mit npm install

### 3. PDF-Text-Extraktion
- **Qualität**: Perfekt (eingebetteter Text)
- **Kosten**: Kostenlos
- **Setup**: Automatisch

## 🎨 Frontend-Integration

### OCR-Analyse-Sektion

```html
<div class="ocr-analysis-section">
    <h4>KI-Dokumentenanalyse</h4>
    <button id="startOcrAnalysis">Dokumente analysieren</button>
    <div id="ocrResults"><!-- Ergebnisse --></div>
</div>
```

### JavaScript-Funktionen

```javascript
// OCR initialisieren
initializeOCR();

// Analyse starten
startOCRAnalysis();

// Server-OCR
performServerOCR(document);

// Client-OCR (Fallback)
performClientOCR(document);
```

## 📈 Analyse-Features

### Entitäts-Extraktion
- **E-Mails**: Automatische Erkennung
- **Telefonnummern**: Deutsche und internationale Formate
- **Daten**: Datumserkennung in verschiedenen Formaten
- **Skills**: Technische Fähigkeiten und Soft Skills
- **Unternehmen**: Firmennamen und Institutionen

### Dokumenten-Bewertung
- **Struktur-Score**: Formatierung und Gliederung
- **Inhalts-Score**: Vollständigkeit der Informationen
- **Gesamt-Bewertung**: Prozentuale Bewertung (0-100%)

### Verbesserungsvorschläge
- **Fehlende Informationen**: Kontaktdaten, Erfahrung, etc.
- **Struktur-Hinweise**: Bessere Formatierung
- **Inhalts-Optimierung**: Spezifische Verbesserungen

## 🔒 Sicherheit

### Datei-Validierung
- **Typen**: PDF, JPG, PNG, TIFF, BMP
- **Größe**: Max. 10MB pro Datei
- **Anzahl**: Max. 5 Dateien pro Batch

### Datenschutz
- **Temporäre Speicherung**: Dateien werden sofort gelöscht
- **Keine dauerhafte Speicherung**: Nur OCR-Ergebnisse
- **Verschlüsselung**: HTTPS für alle Übertragungen

## 🚀 Deployment

### Lokale Entwicklung

```bash
# Server starten
cd backend
npm run dev

# Frontend testen
# Öffne bewerbung.html im Browser
```

### Produktions-Deployment

```bash
# Mit Docker (empfohlen)
docker build -t ocr-server .
docker run -p 3001:3001 ocr-server

# Oder direkt
cd backend
npm start
```

### Cloud-Deployment

```bash
# Google Cloud Run
gcloud run deploy ocr-server --source .

# AWS Lambda
serverless deploy

# Heroku
git push heroku main
```

## 📊 Monitoring

### Health Check

```bash
curl http://localhost:3001/api/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "services": {
    "googleVision": true,
    "tesseract": true
  }
}
```

### Logs

```bash
# Server-Logs
tail -f backend/logs/ocr-server.log

# OCR-Verarbeitung
grep "OCR" backend/logs/ocr-server.log
```

## 🐛 Troubleshooting

### Häufige Probleme

1. **Google Vision nicht verfügbar**
   ```bash
   # Credentials prüfen
   gcloud auth application-default print-access-token
   ```

2. **Tesseract.js Fehler**
   ```bash
   # Dependencies neu installieren
   cd backend
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **PDF-Extraktion fehlschlägt**
   - PDF hat eingebetteten Text → OCR nicht nötig
   - PDF ist gescannt → OCR erforderlich

### Debug-Modus

```bash
# Server mit Debug-Logs starten
DEBUG=* npm start

# Oder mit Nodemon
DEBUG=* npm run dev
```

## 📚 API-Dokumentation

### POST /api/ocr

**Request:**
```javascript
const formData = new FormData();
formData.append('file', file);
formData.append('type', 'cv'); // oder 'certificate'

fetch('/api/ocr', {
  method: 'POST',
  body: formData
});
```

**Response:**
```json
{
  "text": "Extrahierter Text...",
  "source": "google-vision",
  "success": true,
  "wordCount": 150,
  "confidence": "high"
}
```

### POST /api/ocr/batch

**Request:**
```javascript
const formData = new FormData();
files.forEach(file => formData.append('files', file));

fetch('/api/ocr/batch', {
  method: 'POST',
  body: formData
});
```

**Response:**
```json
{
  "success": true,
  "results": [
    {
      "filename": "cv.pdf",
      "success": true,
      "text": "Text...",
      "source": "google-vision",
      "wordCount": 150
    }
  ],
  "summary": {
    "total": 2,
    "successful": 2,
    "failed": 0
  }
}
```

## 🎯 Nächste Schritte

1. **Google Cloud Vision einrichten** für beste OCR-Qualität
2. **Server deployen** auf Cloud-Platform
3. **Frontend testen** mit echten Dokumenten
4. **Performance optimieren** für große Dateien
5. **Monitoring einrichten** für Produktionsumgebung

## 📞 Support

Bei Problemen oder Fragen:

1. **Logs prüfen**: Server- und Browser-Logs
2. **Health Check**: `/api/health` Endpoint
3. **Dependencies**: `npm list` für Versionen
4. **Browser Console**: Frontend-Fehler

---

**Erstellt von Manuel Weiss**  
**Version 1.0.0**  
**Letzte Aktualisierung: Januar 2024**
