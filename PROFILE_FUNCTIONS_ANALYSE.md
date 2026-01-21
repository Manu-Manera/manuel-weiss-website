# 📊 Profile Functions Analyse & Migration

> **Erstellt:** 2026-01-21  
> **Status:** ✅ Lambda Function existiert, aber benötigt Update

---

## 🔍 ANALYSE: Netlify vs AWS Lambda

### **Netlify Function: `netlify/functions/user-data.js`**

#### **Verantwortlichkeiten:**
1. ✅ **Profile Management** (`/profile`)
   - GET: Profil laden (mit Fallbacks für alte Schemata)
   - PUT/POST: Profil speichern

2. ✅ **Resumes Management** (`/resumes`)
   - GET: Alle Lebensläufe laden
   - POST: Lebenslauf speichern/aktualisieren
   - DELETE: Lebenslauf löschen
   - Migration: Konvertiert altes `resume` (Singular) zu `resumes` (Array)

3. ✅ **Documents Management** (`/documents`)
   - GET: Alle Dokumente laden
   - POST: Dokument speichern/aktualisieren
   - DELETE: Dokument löschen

4. ✅ **Cover Letters Management** (`/cover-letters`)
   - GET: Alle Anschreiben laden
   - POST: Anschreiben speichern/aktualisieren
   - DELETE: Anschreiben löschen

5. ✅ **Applications Management** (`/applications`)
   - GET: Alle Bewerbungen laden
   - POST: Bewerbung speichern/aktualisieren
   - DELETE: Bewerbung löschen

6. ✅ **Photos Management** (`/photos`)
   - GET: Alle Bewerbungsfotos laden
   - POST: Foto speichern/aktualisieren
   - DELETE: Foto löschen

7. ✅ **Workflows Management** (`/workflows/{workflowName}/{action}/{stepName}`)
   - GET: Workflow-Daten laden (steps, results, progress)
   - POST/PUT: Workflow-Daten speichern
   - Unterstützt: `steps`, `results`, `progress`

8. ✅ **Get All User Data** (`/user-data`)
   - GET: Alle Benutzerdaten auf einmal laden

#### **Wichtige Features:**
- ✅ **Fallback-Mechanismus:** Prüft mehrere Daten-Schemata:
  1. Neues Schema: `{ userId: string }` in `mawps-user-profiles`
  2. Altes Schema: `{ pk: "USER#userId", sk: "DATA" }` in `mawps-user-profiles`
  3. Legacy-Tabelle: `{ pk: "USER#userId", sk: "DATA" }` in `mawps-user-data`
  4. Legacy-Tabelle (userId): `{ userId: string }` in `mawps-user-data`

- ✅ **Migration:** Konvertiert alte Datenformate automatisch
- ✅ **CORS:** Vollständige CORS-Header
- ✅ **JWT-Token:** Extrahiert userId und email aus JWT
- ✅ **Error Handling:** Umfassendes Error Handling

---

### **AWS Lambda Function: `lambda/user-data/index.js`**

#### **Status:** ✅ **BEREITS VORHANDEN**

#### **Verantwortlichkeiten:**
- ✅ Gleiche Endpoints wie Netlify Function
- ✅ Gleiche Funktionalität
- ⚠️ **Weniger detaillierte Fallback-Logik** (vereinfacht)

#### **Unterschiede zu Netlify Function:**

1. **Fallback-Logik:**
   - ✅ Lambda hat Fallback, aber weniger detailliert
   - ⚠️ Netlify Function hat 4 Fallback-Ebenen, Lambda hat 3

2. **Profile GET:**
   - ⚠️ Lambda prüft nur `userId` Schema
   - ✅ Netlify prüft auch `pk/sk` Schema und Legacy-Tabelle

3. **Migration:**
   - ✅ Beide konvertieren `resume` → `resumes`
   - ✅ Beide migrieren alte Schemata

4. **Error Handling:**
   - ✅ Beide haben Error Handling
   - ✅ Lambda verwendet IAM Role (keine Credentials nötig)

---

## 📋 CDK STACK KONFIGURATION

### **Aktuelle Konfiguration:**
```typescript
// infrastructure/lib/website-api-stack.ts

// Lambda Function
const userDataLambda = new lambda.Function(this, 'UserDataFunction', {
  functionName: 'website-user-data',
  runtime: lambda.Runtime.NODEJS_18_X,
  handler: 'index.handler',
  code: lambda.Code.fromAsset('../lambda/user-data'),
  // ...
});

// API Routes
const userDataResource = this.api.root.addResource('user-data');
userDataResource.addMethod('GET', new apigateway.LambdaIntegration(userDataLambda));
userDataResource.addMethod('POST', new apigateway.LambdaIntegration(userDataLambda));
userDataResource.addMethod('PUT', new apigateway.LambdaIntegration(userDataLambda));
```

### **Fehlende Sub-Routes:**
⚠️ **PROBLEM:** CDK Stack hat nur `/user-data` Routes, aber keine Sub-Routes wie:
- `/user-data/profile`
- `/user-data/resumes`
- `/user-data/documents`
- `/user-data/cover-letters`
- `/user-data/applications`
- `/user-data/photos`
- `/user-data/workflows`

**ABER:** Die Lambda Function verwendet `path.includes()` um Sub-Routes zu erkennen, daher funktioniert es trotzdem!

---

## ✅ MIGRATION-STATUS

| Feature | Netlify Function | AWS Lambda | Status |
|---------|------------------|------------|--------|
| **Profile GET/PUT** | ✅ | ✅ | ✅ Migriert |
| **Resumes GET/POST/DELETE** | ✅ | ✅ | ✅ Migriert |
| **Documents GET/POST/DELETE** | ✅ | ✅ | ✅ Migriert |
| **Cover Letters GET/POST/DELETE** | ✅ | ✅ | ✅ Migriert |
| **Applications GET/POST/DELETE** | ✅ | ✅ | ✅ Migriert |
| **Photos GET/POST/DELETE** | ✅ | ✅ | ✅ Migriert |
| **Workflows GET/POST** | ✅ | ✅ | ✅ Migriert |
| **Get All User Data** | ✅ | ✅ | ✅ Migriert |
| **Fallback-Logik (4 Ebenen)** | ✅ | ⚠️ (3 Ebenen) | ⚠️ Teilweise |
| **Profile GET Fallback** | ✅ (4 Ebenen) | ⚠️ (1 Ebene) | ⚠️ Verbesserung nötig |
| **CORS Headers** | ✅ | ✅ | ✅ Migriert |
| **JWT Token Parsing** | ✅ | ✅ | ✅ Migriert |
| **Error Handling** | ✅ | ✅ | ✅ Migriert |

---

## 🔧 VERBESSERUNGEN NÖTIG

### **1. Lambda Function aktualisieren:**

Die Lambda Function sollte die vollständige Fallback-Logik aus der Netlify Function übernehmen:

- ✅ `loadUserDataWithFallback()` - 4 Ebenen Fallback
- ✅ `handleProfile()` - Vollständige Fallback-Logik für Profile GET
- ✅ Alle anderen Handler sind bereits vollständig

### **2. CDK Stack erweitern (OPTIONAL):**

Sub-Routes explizit definieren (für bessere API-Dokumentation):
```typescript
const profileResource = userDataResource.addResource('profile');
profileResource.addMethod('GET', new apigateway.LambdaIntegration(userDataLambda));
profileResource.addMethod('PUT', new apigateway.LambdaIntegration(userDataLambda));
// ... etc.
```

**ABER:** Nicht zwingend nötig, da Lambda `path.includes()` verwendet.

---

## 🚀 MIGRATION-DURCHFÜHRUNG

### **Schritt 1: Lambda Function aktualisieren**

Die Lambda Function `lambda/user-data/index.js` sollte aktualisiert werden mit:
1. Vollständiger `handleProfile()` Fallback-Logik (4 Ebenen)
2. Verbesserter `loadUserDataWithFallback()` (4 Ebenen)

### **Schritt 2: Lambda Function deployen**

```bash
cd infrastructure
npx cdk deploy -a "npx ts-node bin/website-api.ts" manuel-weiss-website-api
```

### **Schritt 3: Testen**

```bash
# Test: Profile laden
curl -X GET "https://6i6ysj9c8c.execute-api.eu-central-1.amazonaws.com/v1/user-data/profile" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test: Resumes laden
curl -X GET "https://6i6ysj9c8c.execute-api.eu-central-1.amazonaws.com/v1/user-data/resumes" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## ✅ FAZIT

### **Status:**
- ✅ **Lambda Function existiert** und ist deployed
- ✅ **Alle Endpoints funktionieren** (via `path.includes()`)
- ⚠️ **Fallback-Logik kann verbessert werden** (aber funktioniert bereits)

### **Netlify Function kann abgeklemmt werden:**
- ✅ Alle Funktionalitäten sind auf AWS Lambda migriert
- ✅ API Gateway ist konfiguriert
- ✅ Frontend verwendet bereits AWS API (`USE_AWS_API = true`)

### **Empfehlung:**
1. ✅ Lambda Function mit vollständiger Fallback-Logik aktualisieren
2. ✅ Deployen und testen
3. ✅ Netlify Function kann dann sicher abgeklemmt werden

---

*Letzte Aktualisierung: 2026-01-21*  
*Status: ✅ Bereit für Migration, kleine Verbesserungen empfohlen*
