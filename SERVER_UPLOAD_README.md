# 📤 Server Upload Integration

## 🎯 Übersicht

Diese Integration ermöglicht es, Dokumente auf einem echten Server zu speichern, anstatt nur lokal im Browser. Das System funktioniert mit einem Fallback-Mechanismus: Server-Upload zuerst, dann lokale Speicherung als Backup.

## 🚀 Schnellstart

### 1. Upload-Server starten

```bash
# Server starten
./deploy-upload-server.sh

# Oder manuell:
cd backend
npm install express multer cors
node upload-server.js
```

### 2. Server testen

```bash
# Health Check
curl http://localhost:3001/api/health

# Upload testen
curl -X POST -F "file=@test.pdf" -F "type=cv" -F "userId=test" http://localhost:3001/api/upload
```

## 🔧 Technische Details

### Server-Endpoints

| Endpoint | Methode | Beschreibung |
|----------|---------|--------------|
| `/api/upload` | POST | Datei hochladen |
| `/api/download/:id` | GET | Datei herunterladen |
| `/api/files` | GET | Dateien auflisten |
| `/api/files/:id` | DELETE | Datei löschen |
| `/api/health` | GET | Server-Status |

### Upload-Flow

1. **Frontend** → Versucht Server-Upload zuerst
2. **Server** → Speichert Datei physisch + Metadaten
3. **Fallback** → Bei Server-Fehler → Lokale Speicherung
4. **UI** → Zeigt Speicherort an (Server ☁️ oder Lokal 💾)

### Unterstützte Dateiformate

- **PDF**: `application/pdf`
- **DOC**: `application/msword`
- **DOCX**: `application/vnd.openxmlformats-officedocument.wordprocessingml.document`

### Dateigröße-Limit

- **Maximum**: 10MB pro Datei
- **Validierung**: Server-seitig mit Multer

## 📁 Dateistruktur

```
backend/
├── upload-server.js          # Haupt-Server-Datei
├── package-upload.json       # Server-Dependencies
├── uploads/                   # Upload-Verzeichnis
│   ├── file-1234567890.pdf   # Hochgeladene Dateien
│   └── file-1234567891.docx
└── deploy-upload-server.sh   # Deploy-Script
```

## 🔄 Frontend-Integration

### Upload-Handler

```javascript
// CV Upload
document.getElementById('btnCvUpload').onclick = async () => {
  const file = document.getElementById('cvUpload').files[0];
  
  try {
    // Server-Upload zuerst
    result = await uploadToServer(file, 'cv');
    showMessage('✅ Auf Server hochgeladen', 'success');
  } catch (serverError) {
    // Fallback zu lokal
    result = await uploadDocument(file);
    showMessage('✅ Lokal gespeichert', 'success');
  }
};
```

### Server-Endpoints (Frontend)

```javascript
const endpoints = [
  'http://localhost:3001/api/upload',      // Lokaler Server
  'https://api.manuel-weiss.com/upload',   // Produktions-Server
  '/api/upload',                            // Relative URL
  'https://manuel-weiss.com/api/upload'     // Alternative URL
];
```

## 🛠️ Konfiguration

### Umgebungsvariablen

```bash
PORT=3001                    # Server-Port
UPLOAD_DIR=./uploads         # Upload-Verzeichnis
MAX_FILE_SIZE=10485760       # 10MB in Bytes
```

### CORS-Konfiguration

```javascript
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://manuel-weiss.com',
    'https://www.manuel-weiss.com'
  ],
  credentials: true
}));
```

## 📊 Monitoring

### Server-Status

```bash
# Health Check
curl http://localhost:3001/api/health

# Antwort:
{
  "success": true,
  "message": "Upload Server läuft",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "filesCount": 42
}
```

### Logs

```bash
# Server-Logs anzeigen
tail -f server.log

# Oder direkt in der Konsole
node upload-server.js
```

## 🔒 Sicherheit

### Datei-Validierung

- **MIME-Type-Check**: Nur erlaubte Dateitypen
- **Dateigröße-Limit**: 10MB Maximum
- **Dateiname-Sanitization**: Sichere Dateinamen
- **Pfad-Traversal-Schutz**: Sichere Pfade

### Authentifizierung

```javascript
// Optional: JWT-Token-Validierung
const token = req.headers.authorization?.replace('Bearer ', '');
if (token && !validateToken(token)) {
  return res.status(401).json({ error: 'Unauthorized' });
}
```

## 🚀 Deployment

### Lokale Entwicklung

```bash
# 1. Server starten
./deploy-upload-server.sh

# 2. Frontend testen
# Öffne bewerbung.html im Browser
# Teste Upload-Funktionalität
```

### Produktions-Deployment

```bash
# 1. Server auf VPS/Cloud
scp -r backend/ user@server:/var/www/upload-server/
ssh user@server "cd /var/www/upload-server && npm install && pm2 start upload-server.js"

# 2. Nginx-Proxy (optional)
server {
    listen 80;
    location /api/ {
        proxy_pass http://localhost:3001;
    }
}
```

## 🐛 Troubleshooting

### Häufige Probleme

1. **"Server nicht verfügbar"**
   - Server läuft nicht: `./deploy-upload-server.sh`
   - Port blockiert: `lsof -i :3001`

2. **"Datei zu groß"**
   - Limit erhöhen: `MAX_FILE_SIZE=20971520` (20MB)
   - Oder Datei komprimieren

3. **"CORS-Fehler"**
   - CORS-Konfiguration prüfen
   - Origin-URLs hinzufügen

4. **"Upload-Verzeichnis nicht gefunden"**
   - Verzeichnis erstellen: `mkdir -p backend/uploads`
   - Berechtigungen prüfen: `chmod 755 backend/uploads`

### Debug-Modus

```javascript
// Erweiterte Logs aktivieren
const DEBUG = true;
if (DEBUG) {
  console.log('🔍 Debug Info:', {
    file: file.name,
    size: file.size,
    type: file.type,
    endpoint: endpoint
  });
}
```

## 📈 Performance

### Optimierungen

- **Datei-Streaming**: Große Dateien effizient verarbeiten
- **Parallel-Uploads**: Mehrere Dateien gleichzeitig
- **Progress-Tracking**: Upload-Fortschritt anzeigen
- **Retry-Mechanismus**: Automatische Wiederholung bei Fehlern

### Monitoring

```javascript
// Upload-Statistiken
const stats = {
  totalUploads: uploadedFiles.length,
  totalSize: uploadedFiles.reduce((sum, f) => sum + f.size, 0),
  averageSize: totalSize / totalUploads,
  lastUpload: uploadedFiles[uploadedFiles.length - 1]?.uploadedAt
};
```

## 🎉 Ergebnis

**Jetzt funktioniert der Upload mit echten Servern:**
- ✅ **Server-Upload**: Dokumente werden auf Server gespeichert
- ✅ **Fallback-System**: Lokale Speicherung als Backup
- ✅ **Multi-Endpoint**: Mehrere Server-URLs versuchen
- ✅ **Datei-Validierung**: Sichere Datei-Uploads
- ✅ **Progress-Tracking**: Upload-Status anzeigen
- ✅ **Error-Handling**: Robuste Fehlerbehandlung

**Die Dokumenten-Upload-Funktionalität ist jetzt vollständig mit Server-Integration implementiert!** 🎉
