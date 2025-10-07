# 📤 Upload-Server Anleitung

## 🎯 Problem gelöst!

**Das Problem:** Dokumente konnten nicht hochgeladen werden, da nur lokale Speicherung verfügbar war.

**Die Lösung:** Echter Upload-Server mit Fallback-System implementiert!

## 🚀 Server starten

### 1. Upload-Server starten

```bash
# Im Terminal ausführen:
cd backend
node upload-server.js
```

**Erwartete Ausgabe:**
```
🚀 Upload Server läuft auf Port 3001
📁 Uploads werden gespeichert in: /path/to/backend/uploads
🌐 Server URL: http://localhost:3001
```

### 2. Server testen

```bash
# Health Check
curl http://localhost:3001/api/health

# Sollte zurückgeben:
{
  "success": true,
  "message": "Upload Server läuft",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "filesCount": 0
}
```

## 📱 Frontend-Integration

### Upload-Flow

1. **Benutzer wählt Datei** → Frontend zeigt "Lade hoch..." an
2. **Server-Upload** → Versucht `http://localhost:3001/api/upload`
3. **Erfolg** → Zeigt "✅ Auf Server hochgeladen" an
4. **Fehler** → Fallback zu lokaler Speicherung
5. **UI-Update** → Dokument wird in Liste angezeigt

### Unterstützte Dateiformate

- **PDF**: `.pdf` Dateien
- **Word**: `.doc` und `.docx` Dateien
- **Größe**: Bis zu 10MB pro Datei

## 🔧 Technische Details

### Server-Endpoints

| Endpoint | Beschreibung |
|----------|--------------|
| `POST /api/upload` | Datei hochladen |
| `GET /api/download/:id` | Datei herunterladen |
| `GET /api/files` | Dateien auflisten |
| `DELETE /api/files/:id` | Datei löschen |
| `GET /api/health` | Server-Status |

### Upload-Request Format

```javascript
const formData = new FormData();
formData.append('file', file);           // Datei
formData.append('type', 'cv');           // Typ: cv, certificate, document
formData.append('userId', 'user123');    // Benutzer-ID

fetch('http://localhost:3001/api/upload', {
  method: 'POST',
  body: formData
});
```

### Upload-Response Format

```javascript
{
  "success": true,
  "id": "1759096078989",
  "name": "lebenslauf.pdf",
  "size": 1024000,
  "type": "application/pdf",
  "uploadedAt": "2024-01-15T10:30:00.000Z",
  "url": "/api/download/1759096078989"
}
```

## 🛠️ Konfiguration

### Server-Port ändern

```javascript
// In upload-server.js
const PORT = process.env.PORT || 3001;  // Ändern zu gewünschtem Port
```

### Upload-Verzeichnis ändern

```javascript
// In upload-server.js
const uploadsDir = path.join(__dirname, 'uploads');  // Pfad anpassen
```

### Dateigröße-Limit ändern

```javascript
// In upload-server.js
limits: {
  fileSize: 10 * 1024 * 1024  // 10MB in Bytes
}
```

## 📊 Monitoring

### Server-Status prüfen

```bash
# Health Check
curl http://localhost:3001/api/health

# Dateien auflisten
curl "http://localhost:3001/api/files?userId=test"
```

### Logs anzeigen

```bash
# Server-Logs in Echtzeit
tail -f server.log

# Oder direkt in der Konsole
node upload-server.js
```

## 🐛 Troubleshooting

### Häufige Probleme

#### 1. "Server nicht verfügbar"
```bash
# Problem: Server läuft nicht
# Lösung: Server starten
cd backend
node upload-server.js
```

#### 2. "Port bereits belegt"
```bash
# Problem: Port 3001 ist belegt
# Lösung: Anderen Port verwenden
PORT=3002 node upload-server.js
```

#### 3. "Upload-Verzeichnis nicht gefunden"
```bash
# Problem: Uploads-Verzeichnis fehlt
# Lösung: Verzeichnis erstellen
mkdir -p backend/uploads
chmod 755 backend/uploads
```

#### 4. "CORS-Fehler im Browser"
```bash
# Problem: Browser blockiert Cross-Origin-Requests
# Lösung: CORS-Konfiguration prüfen
# In upload-server.js: app.use(cors());
```

### Debug-Modus

```javascript
// Erweiterte Logs aktivieren
const DEBUG = true;
if (DEBUG) {
  console.log('🔍 Upload Debug:', {
    file: file.name,
    size: file.size,
    type: file.type,
    endpoint: endpoint
  });
}
```

## 🚀 Deployment

### Lokale Entwicklung

```bash
# 1. Server starten
cd backend
node upload-server.js

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

## 📈 Performance

### Optimierungen

- **Parallel-Uploads**: Mehrere Dateien gleichzeitig
- **Progress-Tracking**: Upload-Fortschritt anzeigen
- **Retry-Mechanismus**: Automatische Wiederholung bei Fehlern
- **Datei-Streaming**: Große Dateien effizient verarbeiten

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

**Jetzt funktioniert der Upload perfekt:**

- ✅ **Server-Upload**: Dokumente werden auf echtem Server gespeichert
- ✅ **Fallback-System**: Lokale Speicherung als Backup
- ✅ **Multi-Endpoint**: Mehrere Server-URLs versuchen
- ✅ **Datei-Validierung**: Sichere Datei-Uploads
- ✅ **Progress-Tracking**: Upload-Status anzeigen
- ✅ **Error-Handling**: Robuste Fehlerbehandlung

**Die Dokumenten-Upload-Funktionalität ist jetzt vollständig mit Server-Integration implementiert!** 🎉

## 📞 Support

Bei Problemen:

1. **Server-Logs prüfen**: `node upload-server.js`
2. **Health Check**: `curl http://localhost:3001/api/health`
3. **Upload testen**: `curl -X POST -F "file=@test.pdf" http://localhost:3001/api/upload`
4. **Verzeichnis prüfen**: `ls -la backend/uploads/`

**Der Upload-Server ist jetzt einsatzbereit!** 🚀
