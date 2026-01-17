# 📦 Daten-Speicherung Übersicht

## Manuel Weiss Professional Services - Wo werden welche Daten gespeichert?

**Stand:** November 2025

---

## 🎯 Übersichtstabelle

| Datentyp | Admin Upload | User Upload | Speicherort S3 | Speicherort DynamoDB | Zugriff |
|----------|--------------|-------------|----------------|---------------------|---------|
| **Profilbild (Hero)** | ✅ | ❌ | `manuel-weiss-public-media` | `mawps-user-profiles` (userId: "owner") | Öffentlich |
| **Profilbild (User)** | ❌ | ✅ | `mawps-user-files-1760106396` | `mawps-user-profiles` (userId: {userId}) | Privat |
| **Dokumente (CV, etc.)** | ❌ | ✅ | `mawps-user-files-1760106396` | `mawps-user-profiles` | Privat |
| **Persönlichkeitsentwicklung** | ❌ | ✅ | - | `mawps-user-profiles` (progressData) | Privat |
| **Digital Twin** | ✅ | ❌ | - | `localStorage` (aktuell) | Lokal |

---

## 1. 📸 Profilbild - Admin (Hero-Bereich)

### **Wo wird es gespeichert?**

#### **S3 Bucket:**
- **Bucket:** `manuel-weiss-public-media`
- **Region:** `eu-central-1`
- **Pfad:** `public/profile-images/owner/{timestamp}-{random}.jpg`
- **Beispiel:** `public/profile-images/owner/1734384121711-abc123.jpg`
- **Zugriff:** ✅ **Öffentlich lesbar** (für Website-Anzeige)

#### **DynamoDB:**
- **Table:** `mawps-user-profiles`
- **Primary Key:** `userId: "owner"`
- **Type:** `"website-images"`
- **Struktur:**
```json
{
  "userId": "owner",
  "type": "website-images",
  "profileImageDefault": "https://manuel-weiss-public-media.s3.eu-central-1.amazonaws.com/public/profile-images/owner/1734384121711-abc123.jpg",
  "profileImageHover": "https://manuel-weiss-public-media.s3.eu-central-1.amazonaws.com/public/profile-images/owner/1734384121711-hover.jpg",
  "updatedAt": "2025-11-16T23:02:01.711Z"
}
```

#### **LocalStorage (Cache):**
- `adminProfileImage` → Base64 oder S3 URL
- `heroProfileImage` → Base64 oder S3 URL
- `profileImage` → Base64 oder S3 URL
- `heroData` → JSON mit `profileImage` Feld

### **Upload-Flow:**
```
1. Admin wählt Bild im Admin Panel
   ↓
2. Upload zu S3: manuel-weiss-public-media/public/profile-images/owner/
   ↓
3. Speichere S3 URL in DynamoDB (userId: "owner", type: "website-images")
   ↓
4. Cache in localStorage (Fallback)
   ↓
5. Website lädt Bild von S3 URL
```

### **API Endpoints:**
- **Upload:** `POST /prod/media/upload-url` → Presigned URL
- **Speichern:** `POST /prod/website-images` → DynamoDB
- **Laden:** `GET /prod/website-images/owner` → DynamoDB

---

## 2. 👤 Profilbild - User (Eigenes Profil)

### **Wo wird es gespeichert?**

#### **S3 Bucket:**
- **Bucket:** `mawps-user-files-1760106396`
- **Region:** `eu-central-1`
- **Pfad:** `public/profile-images/{userId}/{timestamp}-{random}.jpg`
- **Beispiel:** `public/profile-images/user-123/1734384121711-xyz789.jpg`
- **Zugriff:** 🔒 **Privat** (nur via Presigned URLs)

#### **DynamoDB:**
- **Table:** `mawps-user-profiles`
- **Primary Key:** `userId: {userId}` (z.B. "user-123")
- **Type:** `"user-profile"`
- **Struktur:**
```json
{
  "userId": "user-123",
  "type": "user-profile",
  "email": "user@example.com",
  "name": "Max Mustermann",
  "profileImage": "https://mawps-user-files-1760106396.s3.eu-central-1.amazonaws.com/public/profile-images/user-123/1734384121711-xyz789.jpg",
  "createdAt": "2025-01-01T00:00:00Z",
  "updatedAt": "2025-01-01T00:00:00Z"
}
```

#### **LocalStorage (Cache):**
- `userProfile_{userId}` → Profil-Daten (inkl. Bild-URL)

### **Upload-Flow:**
```
1. User wählt Bild im Profil
   ↓
2. Upload zu S3: mawps-user-files-1760106396/public/profile-images/{userId}/
   ↓
3. Speichere S3 URL in DynamoDB (userId: {userId}, type: "user-profile")
   ↓
4. Cache in localStorage
```

### **API Endpoints:**
- **Upload:** `POST /prod/profile/upload-url` → Presigned URL
- **Speichern:** `POST /prod/profile` → DynamoDB
- **Laden:** `GET /prod/profile` → DynamoDB

---

## 3. 📄 Dokumente (CV, Zeugnisse, etc.)

### **Wo werden sie gespeichert?**

#### **S3 Bucket:**
- **Bucket:** `mawps-user-files-1760106396`
- **Region:** `eu-central-1`
- **Pfad:** `public/documents/{userId}/{fileType}/{timestamp}-{random}.{ext}`
- **Beispiele:**
  - CV: `public/documents/user-123/cv/1734384121711-cv.pdf`
  - Zeugnisse: `public/documents/user-123/certificates/1734384121711-zeugnis.pdf`
  - Anschreiben: `public/documents/user-123/cover-letters/1734384121711-anschreiben.pdf`
- **Zugriff:** 🔒 **Privat** (nur via Presigned URLs)

#### **DynamoDB:**
- **Table:** `mawps-user-profiles`
- **Primary Key:** `userId: {userId}`
- **Type:** `"document"` oder im `documents` Array
- **Struktur:**
```json
{
  "userId": "user-123",
  "type": "document",
  "documents": [
    {
      "id": "doc-123",
      "name": "Lebenslauf.pdf",
      "type": "cv",
      "s3Key": "public/documents/user-123/cv/1734384121711-cv.pdf",
      "s3Url": "https://mawps-user-files-1760106396.s3.eu-central-1.amazonaws.com/public/documents/user-123/cv/1734384121711-cv.pdf",
      "size": 245678,
      "uploadedAt": "2025-01-01T00:00:00Z"
    }
  ]
}
```

### **Upload-Flow:**
```
1. User wählt Dokument (CV, Zeugnis, etc.)
   ↓
2. Upload zu S3: mawps-user-files-1760106396/public/documents/{userId}/{fileType}/
   ↓
3. Speichere Metadaten in DynamoDB (userId: {userId}, type: "document")
   ↓
4. Dokument ist nur für diesen User zugänglich
```

### **API Endpoints:**
- **Upload:** `POST /prod/media/upload-url` (mit `fileType: "cv"` oder `"certificate"`)
- **Speichern:** `POST /prod/profile` → DynamoDB (im `documents` Array)
- **Laden:** `GET /prod/profile` → DynamoDB

---

## 4. 📊 Persönlichkeitsentwicklung (Progress)

### **Wo wird es gespeichert?**

#### **DynamoDB:**
- **Table:** `mawps-user-profiles`
- **Primary Key:** `userId: {userId}`
- **Type:** `"user-profile"` (im `progressData` Feld)
- **Struktur:**
```json
{
  "userId": "user-123",
  "type": "user-profile",
  "progressData": {
    "pages": {
      "ikigai": {
        "firstVisit": "2025-11-13T19:00:00.000Z",
        "lastVisit": "2025-11-13T19:30:00.000Z",
        "visitCount": 3,
        "completed": false,
        "completionPercentage": 45,
        "formData": {
          "was-ich-liebe": "Beratung",
          "was-ich-kann": "HR Transformation",
          "was-die-welt-braucht": "Nachhaltige Lösungen",
          "wofür-bezahlt-wird": "Erfolgreiche Projekte"
        },
        "steps": {
          "step-1": {
            "completed": true,
            "completedAt": "2025-11-13T19:15:00.000Z"
          },
          "step-2": {
            "completed": true,
            "completedAt": "2025-11-13T19:20:00.000Z"
          }
        }
      },
      "mbti": {
        "firstVisit": "2025-11-14T10:00:00.000Z",
        "lastVisit": "2025-11-14T10:45:00.000Z",
        "visitCount": 1,
        "completed": true,
        "completionPercentage": 100,
        "testResults": {
          "type": "INTJ",
          "scores": {
            "I": 65,
            "N": 70,
            "T": 60,
            "J": 75
          }
        }
      }
    },
    "sections": {
      "bewerbungsmanager": {
        "step-1": {
          "data": {
            "stellenausschreibung": "...",
            "anforderungen": "..."
          },
          "updatedAt": "2025-11-15T14:30:00.000Z"
        },
        "step-2": {
          "data": {
            "lebenslauf": "...",
            "anschreiben": "..."
          },
          "updatedAt": "2025-11-15T15:00:00.000Z"
        }
      }
    },
    "overallStats": {
      "totalPages": 15,
      "visitedPages": 15,
      "completedPages": 7,
      "completionPercentage": 47
    }
  },
  "lastProgressUpdate": "2025-11-15T15:00:00.000Z"
}
```

#### **LocalStorage (Fallback):**
- `userProgress_{userId}` → Progress-Daten (als Backup)

### **Speicher-Flow:**
```
1. User füllt Formular aus (z.B. Ikigai)
   ↓
2. Auto-Save alle 30 Sekunden
   ↓
3. Speichere in DynamoDB: mawps-user-profiles (userId: {userId}, progressData: {...})
   ↓
4. Backup in localStorage
```

### **API Endpoints:**
- **Speichern:** `PUT /prod/profile` → DynamoDB (mit `progressData`)
- **Laden:** `GET /prod/profile` → DynamoDB

---

## 5. 🤖 Digital Twin

### **Wo wird es gespeichert?**

#### **LocalStorage (aktuell):**
- **Key:** `digitalTwinTraining`
- **Struktur:**
```json
{
  "personality": {
    "traits": "Strukturierter Problemlöser, Empathisch...",
    "values": "Klasse statt Masse, Struktur schafft Freiheit...",
    "philosophy": "Methodische Herangehensweise...",
    "communicationStyle": "Auf Augenhöhe kommunizieren..."
  },
  "experience": {
    "anecdotes": "UKG HRSD Implementierung...",
    "insights": "Strukturierte Herangehensweise führt...",
    "methods": "...",
    "stories": "..."
  },
  "communication": {
    "samples": "E-Mails an Kunden...",
    "phrases": "Struktur schafft Freiheit...",
    "patterns": "...",
    "questions": "..."
  },
  "analytics": {
    "progress": 75,
    "personalityScore": 85,
    "anecdotesCount": 12,
    "insightsCount": 8,
    "lastTraining": "2025-11-16T10:00:00.000Z"
  }
}
```

#### **Zukünftig (geplant):**
- **DynamoDB:** `mawps-user-profiles` (userId: "owner", type: "digital-twin")
- **Oder separate Table:** `mawps-digital-twin`

### **Hinweis:**
⚠️ **Digital Twin wird aktuell nur lokal gespeichert!**  
Für Persistenz sollte es in DynamoDB migriert werden.

---

## 📊 Vergleich: Admin vs. User

### **Profilbild:**

| Aspekt | Admin (Hero) | User (Profil) |
|--------|--------------|---------------|
| **S3 Bucket** | `manuel-weiss-public-media` | `mawps-user-files-1760106396` |
| **S3 Pfad** | `public/profile-images/owner/` | `public/profile-images/{userId}/` |
| **Zugriff** | ✅ Öffentlich | 🔒 Privat |
| **DynamoDB userId** | `"owner"` | `{userId}` |
| **DynamoDB type** | `"website-images"` | `"user-profile"` |
| **Verwendung** | Website-Hero-Bereich | User-Profil-Seite |

### **Dokumente:**

| Aspekt | Admin | User |
|--------|-------|------|
| **S3 Bucket** | - | `mawps-user-files-1760106396` |
| **S3 Pfad** | - | `public/documents/{userId}/{fileType}/` |
| **Zugriff** | - | 🔒 Privat |
| **DynamoDB** | - | `mawps-user-profiles` (documents Array) |

---

## 🔍 Datenfluss-Diagramme

### **Admin Profilbild Upload:**
```
┌──────────────┐
│ Admin Panel  │
└──────┬───────┘
       │
       │ 1. Datei auswählen
       ▼
┌─────────────────────┐
│ awsMedia.uploadProfileImage(file, "owner")
└──────┬──────────────┘
       │
       │ 2. POST /media/upload-url
       ▼
┌─────────────────────┐
│ Lambda              │
│ (Presigned URL)      │
└──────┬──────────────┘
       │
       │ 3. Presigned PUT URL
       ▼
┌─────────────────────┐
│ Browser             │
│ (Upload zu S3)      │
└──────┬──────────────┘
       │
       │ 4. PUT zu S3
       ▼
┌─────────────────────────────────────┐
│ S3: manuel-weiss-public-media       │
│ public/profile-images/owner/...     │
└──────┬──────────────────────────────┘
       │
       │ 5. S3 URL zurück
       ▼
┌─────────────────────┐
│ awsProfileAPI.saveWebsiteImages()
└──────┬──────────────┘
       │
       │ 6. POST /website-images
       ▼
┌─────────────────────┐
│ DynamoDB            │
│ userId: "owner"      │
│ type: "website-images"
└─────────────────────┘
```

### **User Dokument Upload:**
```
┌──────────────┐
│ User Profil  │
└──────┬───────┘
       │
       │ 1. Datei auswählen (CV, etc.)
       ▼
┌─────────────────────┐
│ awsMedia.uploadDocument(file, userId, "cv")
└──────┬──────────────┘
       │
       │ 2. POST /media/upload-url
       │    { fileType: "cv" }
       ▼
┌─────────────────────┐
│ Lambda              │
│ (Presigned URL)      │
└──────┬──────────────┘
       │
       │ 3. Presigned PUT URL
       ▼
┌─────────────────────┐
│ Browser             │
│ (Upload zu S3)      │
└──────┬──────────────┘
       │
       │ 4. PUT zu S3
       ▼
┌─────────────────────────────────────┐
│ S3: mawps-user-files-1760106396    │
│ public/documents/{userId}/cv/...   │
└──────┬──────────────────────────────┘
       │
       │ 5. S3 URL zurück
       ▼
┌─────────────────────┐
│ awsProfileAPI.saveProfile()
└──────┬──────────────┘
       │
       │ 6. PUT /profile
       │    { documents: [...] }
       ▼
┌─────────────────────┐
│ DynamoDB            │
│ userId: {userId}    │
│ type: "user-profile" │
│ documents: [...]    │
└─────────────────────┘
```

### **Progress Speicherung:**
```
┌──────────────┐
│ User füllt   │
│ Formular aus │
└──────┬───────┘
       │
       │ 1. updateProgress(sectionId, stepId, data)
       ▼
┌─────────────────────┐
│ UserProgressTracker │
│ (Auto-Save alle 30s) │
└──────┬──────────────┘
       │
       │ 2. PUT /profile
       │    { progressData: {...} }
       ▼
┌─────────────────────┐
│ DynamoDB            │
│ userId: {userId}    │
│ type: "user-profile" │
│ progressData: {...} │
└─────────────────────┘
```

---

## 🔐 Zugriffskontrolle

### **Öffentliche Daten:**
- ✅ `manuel-weiss-public-media` → Website-Bilder (Hero-Profilbild)
- ✅ Route53 DNS Records
- ✅ Netlify Frontend

### **Private Daten:**
- 🔒 `mawps-user-files-1760106396` → User-Dateien (nur via Presigned URLs)
- 🔒 DynamoDB `mawps-user-profiles` → User-Daten (nur via API mit Auth)
- 🔒 Cognito User Pool → User-Accounts

### **Berechtigungen:**
- **Admin:** Vollzugriff auf alle Daten (inkl. `userId: "owner"`)
- **User:** Nur Zugriff auf eigene Daten (`userId: {userId}`)

---

## 📝 Zusammenfassung

### **S3 Buckets:**

| Bucket | Zweck | Zugriff | Admin | User |
|--------|-------|---------|-------|------|
| `manuel-weiss-public-media` | Website-Bilder | ✅ Öffentlich | ✅ | ❌ |
| `mawps-user-files-1760106396` | User-Dateien | 🔒 Privat | ✅ | ✅ (nur eigene) |

### **DynamoDB Table: `mawps-user-profiles`**

| userId | type | Inhalt | Zugriff |
|--------|------|--------|---------|
| `"owner"` | `"website-images"` | Hero-Profilbild | ✅ Öffentlich |
| `{userId}` | `"user-profile"` | Profil, Progress, Dokumente | 🔒 Privat (nur User) |

### **LocalStorage:**

| Key | Inhalt | Zweck |
|-----|--------|-------|
| `adminProfileImage` | Hero-Bild (Cache) | Fallback |
| `userProfile_{userId}` | User-Profil (Cache) | Fallback |
| `userProgress_{userId}` | Progress (Cache) | Fallback |
| `digitalTwinTraining` | Digital Twin | ⚠️ Nur lokal |

---

## 🚀 Empfehlungen

### **Digital Twin Migration:**
1. ✅ Digital Twin in DynamoDB speichern (`userId: "owner"`, `type: "digital-twin"`)
2. ✅ API Endpoints für Digital Twin erstellen
3. ✅ Admin Panel Integration für Digital Twin Management

### **Backup-Strategie:**
1. ✅ DynamoDB Point-in-Time Recovery aktiviert
2. ✅ S3 Versioning für wichtige Dateien
3. ✅ Regelmäßige Backups von `mawps-user-profiles`

---

**Letzte Aktualisierung:** November 2025  
**Version:** 1.0

