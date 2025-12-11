# 🚀 Smart Media Upload - Dokumentation

## Übersicht

**Smart Media Upload** ist eine konsolidierte, intelligente Upload-Lösung für alle Medien-Typen auf der Website. Sie vereint alle bisherigen Upload-Implementierungen in einer einzigen, wartbaren Lösung.

## Datei

- **`js/smart-media-upload.js`** - Haupt-Implementierung

## Unterstützte Kategorien

- **Profile** - Profilbilder
- **Service** - Service-Bilder
- **Rental** - Rental-Bilder (Wohnmobil, E-Bike, SUP, Fotobox)
- **Gallery** - Galerie-Bilder
- **Document** - Allgemeine Dokumente
- **CV** - Lebensläufe
- **Certificate** - Zeugnisse

## Features

### ✅ AWS S3 Upload
- Upload zu AWS S3 via Presigned URLs
- Automatische URL-Generierung
- Cache-Busting für Bilder

### ✅ Base64 Fallback
- Automatischer Fallback bei AWS-Fehlern
- Quota-Erkennung und Fallback
- Netzwerkfehler-Behandlung

### ✅ Automatische Kategorisierung
- Erkennung basierend auf Dateiname und Typ
- Intelligente Zuordnung zu Kategorien

### ✅ Kategorie-spezifische Speicherung
- Profile → `heroProfileImage`, `adminProfileImage`, `profileImage`
- Service → `website_service_images` Array
- Rental → `${rentalType}_images` (z.B. `wohnmobil_images`)
- Gallery → `adminProfileGallery` Array
- Documents → `applicationDocuments` Array

### ✅ Progress Tracking
- Callback-basiertes Progress-System
- Bulk-Upload mit Gesamt-Progress

### ✅ Error Handling
- Detaillierte Fehlermeldungen
- Fallback-Strategien
- Logging für Debugging

## Verwendung

### Einfacher Upload

```javascript
const result = await window.smartMediaUpload.upload(file, {
    category: 'service',  // Optional: automatisch erkannt
    userId: 'owner',
    onProgress: (progress) => {
        console.log(`Progress: ${progress}%`);
    },
    onSuccess: (data) => {
        console.log('Upload erfolgreich:', data);
    },
    onError: (error) => {
        console.error('Upload fehlgeschlagen:', error);
    }
});
```

### Bulk Upload

```javascript
const results = await window.smartMediaUpload.uploadBulk(files, {
    category: 'gallery',
    userId: 'owner',
    onProgress: (totalProgress, current, total) => {
        console.log(`Progress: ${totalProgress}% (${current}/${total})`);
    }
});

console.log(`Erfolgreich: ${results.successCount}/${results.total}`);
```

### Medien laden

```javascript
const media = window.smartMediaUpload.loadMedia('service');
console.log(`Gefundene Service-Bilder: ${media.length}`);
```

### Medien löschen

```javascript
window.smartMediaUpload.deleteMedia(mediaId, 'service');
```

## Integration

### MediaSection (Admin-Panel → Medien)

```javascript
// Automatisch integriert in uploadFile()
const result = await window.smartMediaUpload.upload(file, {
    category: this.currentCategory === 'services' ? 'service' : this.currentCategory,
    userId: 'owner'
});
```

### ContentSection (Service-Bilder)

```javascript
// Automatisch integriert in uploadImage()
const result = await window.smartMediaUpload.upload(file, {
    category: 'service',
    userId: 'owner'
});
```

### RentalsSection (Rental-Bilder)

```javascript
// Automatisch integriert in handleImageUpload()
const result = await window.smartMediaUpload.upload(file, {
    category: 'rental',
    userId: 'owner',
    metadata: { rentalType: this.currentRentalType }
});
```

### DocumentUpload (Bewerbungsdokumente)

```javascript
// Automatisch integriert in uploadFileToS3()
const result = await window.smartMediaUpload.upload(file, {
    category: categoryMap[type] || 'document',
    userId: this.getUserId()
});
```

## Legacy-Kompatibilität

Für bestehenden Code, der `window.unifiedAWS` verwendet:

```javascript
// Automatisch verfügbar als Wrapper
window.unifiedAWS = {
    uploadMedia: async (files, options = {}) => {
        const results = await window.smartMediaUpload.uploadBulk(Array.from(files), {
            category: options.category,
            userId: options.userId || 'owner',
            onProgress: options.onProgress
        });
        return results.successful;
    }
};
```

## Veraltete Dateien

Diese Dateien sind jetzt **DEPRECATED** und werden nicht mehr verwendet:

- ❌ `js/unified-aws-upload.js` - Ersetzt durch Smart Media Upload
- ❌ `js/unified-file-upload.js` - Ersetzt durch Smart Media Upload
- ❌ `js/smart-media-api.js` - Ersetzt durch Smart Media Upload

**Bitte verwenden Sie stattdessen:**
```javascript
window.smartMediaUpload.upload(file, options)
```

## Vorteile

1. **Einheitliche API** - Alle Upload-Stellen verwenden dieselbe Methode
2. **Keine Code-Duplikation** - Upload-Logik nur einmal implementiert
3. **Einfache Wartung** - Änderungen an einer Stelle
4. **Automatische Kategorisierung** - Weniger manuelle Konfiguration
5. **Robustes Error Handling** - Fallback-Strategien eingebaut
6. **Progress Tracking** - Einheitliches Progress-System
7. **Kategorie-spezifische Speicherung** - Automatische Organisation

## Migration

Bestehender Code muss nicht geändert werden, da:
- Legacy-Wrapper für `unifiedAWS` vorhanden
- Fallback-Methoden in allen Sections
- Alte APIs funktionieren weiterhin

## Nächste Schritte

1. ✅ Smart Media Upload implementiert
2. ✅ Integration in alle Upload-Stellen
3. ✅ Legacy-Kompatibilität sichergestellt
4. ⏳ Veraltete Dateien können gelöscht werden (nach Testphase)
5. ⏳ Dokumentation aktualisieren

