# 📸 Rental Images API - Setup Anleitung

## ✅ Was wurde implementiert

Das Rental-Bilder-System wurde komplett auf **API-First mit AWS** umgestellt (wie Profilbilder):

- ✅ **Lambda API**: `lambda/rental-images-api/index.js`
- ✅ **Frontend API-Klasse**: `js/aws-rental-images-api.js`
- ✅ **Admin-Panel**: Verwendet jetzt AWS API (kein LocalStorage mehr)
- ✅ **Website**: Lädt Bilder von AWS DynamoDB

## 🏗️ Architektur

### **Datenfluss:**

```
1. Admin-Panel lädt Bild hoch
   ↓
2. Frontend ruft API auf: POST /rentals/{rentalType}/images/upload-url
   ↓
3. Lambda generiert Presigned URL für S3
   ↓
4. Frontend lädt direkt zu S3 hoch
   ↓
5. Frontend speichert Metadaten: POST /rentals/{rentalType}/images
   ↓
6. Lambda speichert in DynamoDB (userId: "owner", rentalImages: {...})
   ↓
7. Website lädt Bilder: GET /rentals/{rentalType}/images
   ↓
8. Lambda liest aus DynamoDB und gibt Bilder zurück
```

### **DynamoDB-Struktur:**

```json
{
  "userId": "owner",
  "type": "website-images",
  "rentalImages": {
    "fotobox": {
      "images": [
        {
          "id": "img-1234567890-abc123",
          "url": "https://bucket.s3.eu-central-1.amazonaws.com/public/rental-images/fotobox/1234567890-abc123.jpg",
          "imageKey": "public/rental-images/fotobox/1234567890-abc123.jpg",
          "filename": "fotobox.jpg",
          "uploadedAt": "2025-01-01T00:00:00Z",
          "rentalType": "fotobox"
        }
      ],
      "displayImage": "https://bucket.s3.eu-central-1.amazonaws.com/..."
    },
    "wohnmobil": { ... },
    "ebike": { ... },
    "sup": { ... }
  },
  "updatedAt": "2025-01-01T00:00:00Z",
  "createdAt": "2025-01-01T00:00:00Z"
}
```

### **S3-Struktur:**

```
mawps-user-files-1760106396/
  └── public/
      └── rental-images/
          ├── fotobox/
          │   └── {timestamp}-{randomId}.jpg
          ├── wohnmobil/
          ├── ebike/
          └── sup/
```

## 🔧 API Endpoints

### **GET** `/rentals/{rentalType}/images`
Lade alle Bilder für einen Rental-Typ

**Response:**
```json
{
  "rentalType": "fotobox",
  "images": [...],
  "displayImage": "https://...",
  "count": 5
}
```

### **POST** `/rentals/{rentalType}/images/upload-url`
Generiere Presigned URL für S3 Upload

**Request:**
```json
{
  "fileName": "fotobox.jpg",
  "contentType": "image/jpeg"
}
```

**Response:**
```json
{
  "uploadUrl": "https://s3.amazonaws.com/...",
  "imageUrl": "https://bucket.s3.eu-central-1.amazonaws.com/...",
  "imageKey": "public/rental-images/fotobox/...",
  "rentalType": "fotobox"
}
```

### **POST** `/rentals/{rentalType}/images`
Speichere Bild-Metadaten in DynamoDB

**Request:**
```json
{
  "imageUrl": "https://...",
  "imageKey": "public/rental-images/fotobox/...",
  "filename": "fotobox.jpg",
  "uploadedAt": "2025-01-01T00:00:00Z"
}
```

### **PUT** `/rentals/{rentalType}/images/display`
Setze Hauptbild

**Request:**
```json
{
  "imageUrl": "https://..."
}
```

### **DELETE** `/rentals/{rentalType}/images/{imageId}`
Lösche Bild

## 🚀 Lambda Deployment

Die Lambda-Funktion muss noch deployed werden:

```bash
cd lambda/rental-images-api
npm install --production
zip -r rental-images-api.zip . -x "*.git*" "*.md" "node_modules/.cache/*"
```

Dann in AWS Console:
1. Lambda Function erstellen: `rental-images-api`
2. Runtime: Node.js 18.x
3. Handler: `index.handler`
4. Code hochladen: `rental-images-api.zip`
5. Environment Variables setzen:
   - `PROFILE_TABLE=mawps-user-profiles`
   - `BUCKET_NAME=mawps-user-files-1760106396`
   - `AWS_REGION=eu-central-1`
6. API Gateway integrieren: `/rentals/{rentalType}/images/*`

## 📋 Frontend Integration

### **Script-Tags hinzufügen:**

```html
<script src="js/aws-config.js"></script>
<script src="js/aws-rental-images-api.js"></script>
```

### **Verwendung:**

```javascript
// Bilder laden
const data = await window.awsRentalImagesAPI.getRentalImages('fotobox');

// Bild hochladen
const result = await window.awsRentalImagesAPI.uploadRentalImage(file, 'fotobox');

// Hauptbild setzen
await window.awsRentalImagesAPI.setDisplayImage('fotobox', imageUrl);

// Bild löschen
await window.awsRentalImagesAPI.deleteRentalImage('fotobox', imageId);
```

## ✅ Vorteile

1. **Konsistent**: Gleiche Architektur wie Profilbilder
2. **Skalierbar**: DynamoDB + S3 statt LocalStorage
3. **Persistent**: Daten bleiben erhalten (nicht browser-abhängig)
4. **Sicher**: Presigned URLs für sichere Uploads
5. **API-First**: Saubere Trennung Frontend/Backend

## 🔄 Migration

Bestehende LocalStorage-Daten werden automatisch als Fallback verwendet, bis die API verfügbar ist.

