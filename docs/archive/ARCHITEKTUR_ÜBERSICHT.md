# 🏗️ System-Architektur Übersicht

## Manuel Weiss Professional Services - Komplette Infrastruktur

**Stand:** November 2025  
**Region:** EU-Central-1 (Frankfurt)  
**Domain:** manuel-weiss.ch

---

## 📊 Gesamtübersicht

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         INTERNET / BENUTZER                              │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │   manuel-weiss.ch        │
                    │   (Route53 DNS)          │
                    └────────────┬─────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │   Netlify CDN           │
                    │   mawps.netlify.app    │
                    │   (Frontend Hosting)   │
                    └────────────┬────────────┘
                                 │
        ┌────────────────────────┼────────────────────────┐
        │                        │                        │
┌───────▼────────┐    ┌──────────▼──────────┐  ┌────────▼─────────┐
│  AWS Cognito   │    │  API Gateway         │  │  AWS S3          │
│  (Auth)        │    │  (REST API)          │  │  (Dateien)        │
└───────┬────────┘    └──────────┬───────────┘  └────────┬─────────┘
        │                        │                        │
        │              ┌──────────▼───────────┐           │
        │              │  AWS Lambda          │           │
        │              │  (Backend Logic)    │           │
        │              └──────────┬───────────┘           │
        │                        │                        │
        │              ┌──────────▼───────────┐           │
        │              │  DynamoDB            │           │
        │              │  (Datenbank)         │           │
        │              └──────────────────────┘           │
        │                                                 │
        └─────────────────────────────────────────────────┘
```

---

## 🌐 1. Frontend Hosting (Netlify)

### **Service:** Netlify CDN
- **URL:** `https://manuel-weiss.ch` (Custom Domain)
- **Backup URL:** `https://mawps.netlify.app`
- **Typ:** Statische Website (HTML, CSS, JavaScript)
- **SSL:** Automatisch (Let's Encrypt)
- **Deployment:** Automatisch via GitHub

### **Was wird gehostet:**
- ✅ Hauptwebsite (`index.html`)
- ✅ Admin Panel (`admin.html`)
- ✅ Bewerbungsmanager (`applications/`)
- ✅ Persönlichkeitsentwicklung (`persoenlichkeitsentwicklung.html`)
- ✅ Alle statischen Assets (CSS, JS, Bilder)

### **DNS Konfiguration:**
```
manuel-weiss.ch          → A Record → 75.2.60.5 (Netlify)
www.manuel-weiss.ch      → CNAME → mawps.netlify.app
```

---

## 🔐 2. User-Verwaltung (AWS Cognito)

### **Service:** AWS Cognito User Pool
- **User Pool ID:** `eu-central-1_8gP4gLK9r`
- **Client ID:** `7kc5tt6a23fgh53d60vkefm812`
- **Region:** `eu-central-1`
- **Domain:** `manuel-weiss-userfiles-auth-038333965110.auth.eu-central-1.amazoncognito.com`

### **User-Gruppen:**

#### **Admin-Gruppe:**
- **Name:** `admin`
- **Berechtigungen:**
  - ✅ Vollzugriff auf Admin Panel
  - ✅ User-Verwaltung (erstellen, löschen, bearbeiten)
  - ✅ API Key Verwaltung
  - ✅ Website-Bilder hochladen
  - ✅ Alle Website-User verwalten

#### **Website-User:**
- **Standard-Benutzer** (keine spezielle Gruppe)
- **Berechtigungen:**
  - ✅ Eigene Bewerbungen verwalten
  - ✅ Persönlichkeitsentwicklung nutzen
  - ✅ Eigene Daten speichern
  - ❌ Kein Zugriff auf Admin Panel

### **Authentifizierung:**
```
┌──────────────┐
│   Benutzer   │
└──────┬───────┘
       │
       │ 1. Login Request
       ▼
┌─────────────────────┐
│  AWS Cognito        │
│  (User Pool)        │
└──────┬──────────────┘
       │
       │ 2. idToken + accessToken + refreshToken
       ▼
┌─────────────────────┐
│  Frontend           │
│  (localStorage)     │
└──────┬──────────────┘
       │
       │ 3. API Requests mit Token
       ▼
┌─────────────────────┐
│  API Gateway        │
│  (Authorization)    │
└─────────────────────┘
```

### **Token-Verwaltung:**
- **idToken:** JWT für User-Identität (1 Stunde Gültigkeit)
- **accessToken:** JWT für API-Zugriff (1 Stunde Gültigkeit)
- **refreshToken:** Für Token-Erneuerung (30 Tage Gültigkeit)
- **Speicherung:** `localStorage` im Browser
- **Auto-Refresh:** Automatische Erneuerung bei Ablauf

---

## 🔌 3. API Gateway (REST API)

### **Service:** AWS API Gateway
- **Base URL:** `https://of2iwj7h2c.execute-api.eu-central-1.amazonaws.com/prod`
- **Region:** `eu-central-1`
- **Authorization:** AWS Cognito Authorizer

### **Endpoints:**

#### **User Profile API:**
```
GET    /prod/profile              → User Profil laden
POST   /prod/profile              → User Profil speichern
PUT    /prod/profile              → User Profil aktualisieren
GET    /prod/profile/image        → Profilbild laden
POST   /prod/profile/upload-url   → Presigned URL für Upload
```

#### **Website Images API:**
```
POST   /prod/website-images       → Website-Bilder speichern
GET    /prod/website-images/owner → Website-Bilder laden
```

#### **Admin User Management API:**
```
GET    /prod/admin/users         → Alle User auflisten
POST   /prod/admin/users         → User erstellen
PUT    /prod/admin/users/{id}    → User aktualisieren
DELETE /prod/admin/users/{id}    → User löschen
POST   /prod/admin/users/{id}/reset-password → Passwort zurücksetzen
```

#### **Media Upload API:**
```
POST   /prod/media/upload-url    → Presigned URL für S3 Upload
```

### **CORS Konfiguration:**
- **Allowed Origins:** 
  - `https://manuel-weiss.ch`
  - `https://mawps.netlify.app`
  - `http://localhost:8000` (Development)
- **Allowed Methods:** GET, POST, PUT, DELETE, OPTIONS
- **Allowed Headers:** Content-Type, Authorization

---

## ⚙️ 4. Backend (AWS Lambda)

### **Lambda Functions:**

#### **mawps-user-profile**
- **Zweck:** User Profile & Progress Management
- **Endpoints:** `/profile`, `/user-profile`
- **DynamoDB Table:** `mawps-user-profiles`
- **Berechtigungen:**
  - DynamoDB: Read/Write auf `mawps-user-profiles`
  - S3: Read auf `manuel-weiss-public-media`

#### **mawps-admin-user-management**
- **Zweck:** Admin User-Verwaltung
- **Endpoints:** `/admin/users/*`
- **Berechtigungen:**
  - Cognito: User Pool Management
  - DynamoDB: Read/Write auf `mawps-user-profiles`

#### **mawps-profile-image** (oder ähnlich)
- **Zweck:** Presigned URLs für S3 Uploads
- **Endpoints:** `/media/upload-url`, `/website-images`
- **Berechtigungen:**
  - S3: Generate Presigned URLs
  - DynamoDB: Read/Write auf `mawps-user-profiles`

### **Lambda Execution Role:**
- **Role Name:** `mawps-lambda-execution-role`
- **Policies:**
  - `CognitoDynamoDBAccess` (DynamoDB + Cognito)
  - S3 Read/Write für Media Buckets

---

## 💾 5. Datenbank (DynamoDB)

### **Table: mawps-user-profiles**
- **Region:** `eu-central-1`
- **Billing:** Pay-per-Request
- **Primary Key:** `userId` (String)

### **Datenstruktur:**

#### **User Profile:**
```json
{
  "userId": "user-123",
  "type": "user-profile",
  "email": "user@example.com",
  "name": "Max Mustermann",
  "profileImage": "https://...",
  "settings": { ... },
  "createdAt": "2025-01-01T00:00:00Z",
  "updatedAt": "2025-01-01T00:00:00Z"
}
```

#### **User Progress:**
```json
{
  "userId": "user-123",
  "type": "progress",
  "sectionId": "bewerbungsmanager",
  "stepId": "step-1",
  "data": { ... },
  "completedAt": "2025-01-01T00:00:00Z"
}
```

#### **Website Images:**
```json
{
  "userId": "owner",
  "type": "website-images",
  "profileImageDefault": "https://manuel-weiss-public-media.s3.eu-central-1.amazonaws.com/...",
  "profileImageHover": "https://manuel-weiss-public-media.s3.eu-central-1.amazonaws.com/...",
  "updatedAt": "2025-01-01T00:00:00Z"
}
```

---

## 📦 6. Dateispeicher (AWS S3)

### **Buckets:**

#### **mawps-user-files-1760106396**
- **Zweck:** User-Dateien (Bewerbungen, Dokumente)
- **Region:** `eu-central-1`
- **Zugriff:** Privat (nur via Presigned URLs)
- **Struktur:**
  ```
  public/
    documents/
      {userId}/
        cv/
        certificates/
        cover-letters/
  ```

#### **manuel-weiss-public-media**
- **Zweck:** Öffentliche Website-Bilder
- **Region:** `eu-central-1`
- **Zugriff:** Öffentlich lesbar
- **Struktur:**
  ```
  public/
    profile-images/
      owner/
        {image-name}.jpg
    website-images/
      {image-name}.jpg
  ```

### **CORS Konfiguration:**
- **Allowed Origins:** `https://manuel-weiss.ch`, `https://mawps.netlify.app`
- **Allowed Methods:** GET, PUT, POST
- **Allowed Headers:** Content-Type, Authorization

---

## 📧 7. E-Mail (AWS SES)

### **Service:** AWS Simple Email Service
- **Region:** `eu-central-1`
- **Domain:** `manuel-weiss.ch`
- **Status:** ⏳ Verifizierung läuft (DNS Propagation)

### **Konfiguration:**
- **From Domain:** `mail.manuel-weiss.ch`
- **DKIM:** Aktiviert (3 CNAME Records)
- **SPF:** `v=spf1 include:amazonses.com ~all`
- **DMARC:** `v=DMARC1; p=quarantine; rua=mailto:dmarc@manu.ch`

### **DNS Records (Route53):**
```
_amazonses.manuel-weiss.ch          → TXT (Verifizierung)
smln6ugnqm64joyksgg2thjvnli3vzyb._domainkey.manuel-weiss.ch → CNAME
oribrshwxibnst33qhxzgpuvsr2g7k5f._domainkey.manuel-weiss.ch → CNAME
hgq6gco2ns7ijaqqz3mk3fpniozp76rr._domainkey.manuel-weiss.ch → CNAME
mail.manuel-weiss.ch                → MX (10 feedback-smtp.eu-central-1.amazonses.com)
mail.manuel-weiss.ch                → TXT (SPF)
_dmarc.manuel-weiss.ch              → TXT (DMARC)
```

---

## 🌍 8. DNS (AWS Route53)

### **Hosted Zone:**
- **Zone ID:** `Z02760862I1VK88B8J0ED`
- **Domain:** `manuel-weiss.ch`
- **Nameserver:**
  - `ns-1665.awsdns-16.co.uk`
  - `ns-371.awsdns-46.com`
  - `ns-656.awsdns-18.net`
  - `ns-1193.awsdns-21.org`

### **DNS Records:**

#### **Website:**
```
manuel-weiss.ch          → A      → 75.2.60.5 (Netlify)
www.manuel-weiss.ch      → CNAME  → mawps.netlify.app
```

#### **E-Mail (SES):**
```
_amazonses.manuel-weiss.ch → TXT   → "Lhc5q38H/NLjAaD3wH6SFeHOwPuW8M874vcsyp1cr1c="
mail.manuel-weiss.ch      → MX     → 10 feedback-smtp.eu-central-1.amazonses.com
mail.manuel-weiss.ch      → TXT    → "v=spf1 include:amazonses.com ~all"
_dmarc.manuel-weiss.ch    → TXT    → "v=DMARC1; p=quarantine; rua=mailto:dmarc@manu.ch"
```

#### **DKIM (3 Records):**
```
smln6ugnqm64joyksgg2thjvnli3vzyb._domainkey.manuel-weiss.ch → CNAME → smln6ugnqm64joyksgg2thjvnli3vzyb.dkim.amazonses.com
oribrshwxibnst33qhxzgpuvsr2g7k5f._domainkey.manuel-weiss.ch → CNAME → oribrshwxibnst33qhxzgpuvsr2g7k5f.dkim.amazonses.com
hgq6gco2ns7ijaqqz3mk3fpniozp76rr._domainkey.manuel-weiss.ch → CNAME → hgq6gco2ns7ijaqqz3mk3fpniozp76rr.dkim.amazonses.com
```

---

## 🔄 9. Datenfluss-Diagramme

### **User Login Flow:**
```
┌──────────┐
│ Browser  │
└────┬─────┘
     │
     │ 1. POST /login
     ▼
┌─────────────────┐
│  AWS Cognito    │
│  User Pool      │
└────┬────────────┘
     │
     │ 2. idToken + accessToken + refreshToken
     ▼
┌─────────────────┐
│  Frontend       │
│  localStorage   │
└────┬─────────────┘
     │
     │ 3. Token in Header: Authorization: Bearer {idToken}
     ▼
┌─────────────────┐
│  API Gateway    │
│  (Validates)    │
└────┬─────────────┘
     │
     │ 4. Authenticated Request
     ▼
┌─────────────────┐
│  Lambda         │
│  (Processes)    │
└─────────────────┘
```

### **File Upload Flow:**
```
┌──────────┐
│ Browser  │
└────┬─────┘
     │
     │ 1. POST /media/upload-url
     │    { fileName, contentType }
     ▼
┌─────────────────┐
│  Lambda         │
│  (Generate URL) │
└────┬─────────────┘
     │
     │ 2. Presigned PUT URL
     ▼
┌─────────────────┐
│  Browser        │
│  (Upload File)  │
└────┬─────────────┘
     │
     │ 3. PUT {file} to S3
     ▼
┌─────────────────┐
│  AWS S3         │
│  (Store File)   │
└─────────────────┘
```

### **Admin User Management Flow:**
```
┌──────────┐
│ Admin    │
│ Panel    │
└────┬─────┘
     │
     │ 1. GET /admin/users
     │    Header: Authorization: Bearer {idToken}
     ▼
┌─────────────────┐
│  API Gateway    │
│  (Check Admin)  │
└────┬─────────────┘
     │
     │ 2. Verify User in "admin" Group
     ▼
┌─────────────────┐
│  Lambda         │
│  (List Users)   │
└────┬─────────────┘
     │
     │ 3. Query Cognito User Pool
     ▼
┌─────────────────┐
│  AWS Cognito    │
│  (User Pool)    │
└────┬─────────────┘
     │
     │ 4. Return User List
     ▼
┌─────────────────┐
│  Admin Panel    │
│  (Display)       │
└─────────────────┘
```

---

## 🔒 10. Sicherheit

### **Authentifizierung:**
- ✅ AWS Cognito JWT Tokens
- ✅ Token-Validierung in API Gateway
- ✅ Auto-Refresh bei Token-Ablauf
- ✅ Secure Token Storage (localStorage)

### **Autorisierung:**
- ✅ Admin-Gruppe für Admin-Zugriff
- ✅ Cognito Groups für Rollen-Management
- ✅ API Gateway Authorizer prüft Gruppen

### **Daten-Schutz:**
- ✅ S3 Buckets: Private Access (nur via Presigned URLs)
- ✅ DynamoDB: IAM-basierte Zugriffskontrolle
- ✅ CORS: Nur erlaubte Origins
- ✅ HTTPS: Überall aktiviert

### **API-Sicherheit:**
- ✅ Cognito Authorizer für alle Endpoints
- ✅ Rate Limiting (API Gateway)
- ✅ Request Validation
- ✅ Error Handling ohne sensible Daten

---

## 📊 11. Monitoring & Logging

### **CloudWatch:**
- ✅ Lambda Logs (automatisch)
- ✅ API Gateway Access Logs
- ✅ DynamoDB Metrics
- ✅ S3 Access Logs (optional)

### **Netlify:**
- ✅ Build Logs
- ✅ Deploy Logs
- ✅ Function Logs
- ✅ Analytics (optional)

---

## 🚀 12. Deployment

### **Frontend (Netlify):**
- **Automatisch:** GitHub → Netlify (bei jedem Push)
- **Manuell:** `netlify deploy --prod`

### **Backend (AWS):**
- **Lambda:** `deploy-user-profile-lambda.sh`
- **API Gateway:** Automatisch via Lambda Deployment
- **Infrastructure:** CloudFormation / SAM Templates

### **DNS:**
- **Route53:** Automatisch via AWS Console oder CLI
- **Propagation:** 5-15 Minuten

---

## 📝 13. Wichtige URLs & Endpoints

### **Frontend:**
- **Production:** `https://manuel-weiss.ch`
- **Netlify:** `https://mawps.netlify.app`
- **Admin Panel:** `https://manuel-weiss.ch/admin.html`

### **API:**
- **Base URL:** `https://of2iwj7h2c.execute-api.eu-central-1.amazonaws.com/prod`
- **Health Check:** `/health` (falls vorhanden)

### **AWS Console:**
- **Cognito:** https://console.aws.amazon.com/cognito/v2/idp/user-pools/eu-central-1_8gP4gLK9r
- **API Gateway:** https://console.aws.amazon.com/apigateway/main/apis
- **Lambda:** https://console.aws.amazon.com/lambda/home?region=eu-central-1
- **DynamoDB:** https://console.aws.amazon.com/dynamodbv2/home?region=eu-central-1#table?name=mawps-user-profiles
- **S3:** https://s3.console.aws.amazon.com/s3/buckets?region=eu-central-1
- **Route53:** https://console.aws.amazon.com/route53/v2/hostedzones#ListRecordSets/Z02760862I1VK88B8J0ED
- **SES:** https://console.aws.amazon.com/sesv2/home?region=eu-central-1#/verified-identities

---

## 🎯 14. Zusammenfassung

### **Was läuft wo:**

| Service | Provider | Zweck | Status |
|---------|----------|-------|--------|
| **Frontend** | Netlify | Website Hosting | ✅ Live |
| **DNS** | AWS Route53 | Domain Management | ✅ Live |
| **Auth** | AWS Cognito | User-Verwaltung | ✅ Live |
| **API** | AWS API Gateway | REST Endpoints | ✅ Live |
| **Backend** | AWS Lambda | Serverless Functions | ✅ Live |
| **Datenbank** | AWS DynamoDB | User Data | ✅ Live |
| **Dateien** | AWS S3 | File Storage | ✅ Live |
| **E-Mail** | AWS SES | E-Mail Versand | ⏳ Verifizierung läuft |

### **Kosten (geschätzt):**
- **Netlify:** Free Tier (ausreichend)
- **AWS:** ~$5-10/Monat (Free Tier + geringe Nutzung)
  - Route53: $0.50/Monat pro Hosted Zone
  - Lambda: Free Tier (1M Requests/Monat)
  - DynamoDB: Free Tier (25 GB)
  - S3: Free Tier (5 GB)
  - API Gateway: Free Tier (1M Requests/Monat)
  - SES: Free Tier (62.000 E-Mails/Monat)

---

## 📞 Support & Dokumentation

- **Netlify Docs:** https://docs.netlify.com
- **AWS Docs:** https://docs.aws.amazon.com
- **Cognito Docs:** https://docs.aws.amazon.com/cognito
- **API Gateway Docs:** https://docs.aws.amazon.com/apigateway

---

**Letzte Aktualisierung:** November 2025  
**Version:** 1.0

