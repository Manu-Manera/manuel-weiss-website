# Implementierungsplan: Manuel‑Weiss Website → App (stabil, skalierbar, übersichtlich)

> Ziel: **Benutzerverwaltung** (Bewerbungen speichern), **Medien‑Upload + Einbindung** (Adminpanel + Website), **zuverlässige Workflows** (Bewerbungsprozess hängt nicht mehr), **zugängliche API‑Doku**, **App‑Bereitstellung** (PWA + optional Mobile‑Wrapper) – alles klar strukturiert, mit Aufgabenlisten, Akzeptanzkriterien und konkreten Dateien/Orten im Repo.

---

## 0) Leitplanken & Grundprinzipien
- **Beibehalten**: aktuelles Hosting (Netlify primär, GitHub Pages als Fallback), AWS als Backend (Cognito, API Gateway, Lambda, DynamoDB, S3).
- **Schichten**: Frontend (statisch + React‑Inseln), **BFF/API** (API Gateway + Lambda), **Daten** (DynamoDB), **Assets** (S3 + CloudFront), **Auth** (Cognito).
- **Konventionen**:
  - **Namespaces** (DynamoDB): `mw-<env>-users`, `mw-<env>-applications`, `mw-<env>-media`, `mw-<env>-jobs`.
  - **Branches/Envs**: `main=prod`, `staging`, `dev` – je eigener AWS **User Pool**, **API‑Stage**, **Buckets**.
  - **Secrets**: über Netlify/Vercel/GitHub Actions **Environment Variables** (nie im Repo).

---

## 1) Architektur‑Übersicht
```
[Browser/PWA]
  ├─ Statische Seiten + React‑Inseln (Admin, Bewerbungs‑Wizard)
  ├─ Auth (Cognito Hosted UI/Amplify Auth)
  ├─ Upload (Uppy → Pre‑Signed S3)
  └─ API Client (OpenAPI/Swagger)
          │
      [API Gateway]
          │  (JWT von Cognito)
        [Lambda]  ──>  [DynamoDB]
          │               ├ users
          │               ├ applications
          │               ├ jobs (workflows)
          │               └ media (Metadaten)
          └─ S3 (Medien)  ──> CloudFront (Auslieferung)

[Orchestrierung]
  └─ Step Functions / SQS (asynchrone Workflows, Retries, DLQ)
```

**Warum so?**
- Cognito + JWT schützt API, **DynamoDB** speichert strukturierte Bewerbungsdaten, **S3** speichert binäre Medien, **CloudFront** liefert performant & CORS‑sicher aus.
- **Step Functions/SQS** sorgt für robuste, wiederaufnehmbare Workflows mit klaren Status.

---

## 2) Phasenplan (mit Aufgaben für Cursor)

### Phase A – Stabilisierung & Environments (sofort)
**Ziele**: saubere Envs, funktionierende `_redirects`, konsistente `aws-config.json`/Amplify.

**Aufgaben**
- [ ] **Netlify Site Settings** prüfen: Build `npm run build` (falls vorhanden) oder statische Auslieferung; Publish‑Dir = Repo‑Root (statische HTML) ODER `dist/` (falls Build‑Schritt).
- [ ] `_redirects` im Root sicherstellen (bereits vorhanden):
  - `/*   /index.html   200` *falls SPA‑Routen nötig*.
  - `/api/*  https://<restapi-id>.execute-api.<region>.amazonaws.com/<stage>/:splat  200` *nur falls Netlify → API Proxy genutzt wird*.
- [ ] **AWS Envs**: pro Umgebung Variablen in Netlify anlegen (`AWS_REGION`, `COGNITO_USER_POOL_ID`, `COGNITO_CLIENT_ID`, `API_BASE_URL`, `S3_MEDIA_BUCKET`, `CLOUDFRONT_URL`).
- [ ] **Amplify Konfig** (`aws-exports.js` **oder** `aws-config.json`) angleichen: nur die für den Client notwendigen, **keine** Secrets (Access Keys) clientseitig.

**Akzeptanzkriterien**
- [ ] `https://<staging>` lädt alle Seiten/Assets ohne 404/403.
- [ ] API‑Requests treffen gegen die **Staging‑Stage** (sichtbar in DevTools, CORS fehlerfrei).

---

### Phase B – Benutzerverwaltung (Registrieren, Login, Profile, Bewerbungen speichern)
**Ziele**: Jede*r Nutzer*in kann sich registrieren, einloggen, Bewerbung(en) als **Entwürfe** speichern, laden, finalisieren.

**Technische Entscheidungen**
- **Auth**: AWS Cognito User Pool (+ Amplify Auth SDK) **oder** Hosted UI (Passwort‑Reset, E‑Mail‑Bestätigung out‑of‑the‑box).
- **Datenmodell (DynamoDB)**:
  - `users`  ⇒ PK:`USER#<userId>`  SK:`PROFILE`  – Profilfelder (Name, E‑Mail, Rolle, createdAt).
  - `applications` ⇒ PK:`USER#<userId>` SK:`APP#<appId>` – Status, Stelleninfo, generierte Texte, Timestamps.
  - **Option**: Global Secondary Index (GSI1) `GSI1PK=APP#<appId>` für schnelle App‑Suche unabhängig vom User.

**API (API Gateway + Lambda)**
- `POST /applications` – neue Bewerbung anlegen (Status=`DRAFT`).
- `GET /applications` – Liste für eingeloggten User (Pagination).
- `GET /applications/{id}` – Details.
- `PUT /applications/{id}` – Felder aktualisieren (optimistic concurrency via `updatedAt`/`version`).
- `POST /applications/{id}/submit` – Workflow starten (siehe Phase D).

**Frontend**
- **Admin/Website**: Formulare mit **React Hook Form + Zod** (clientseitige Validierung), **Amplify Auth** für Session.
- **Speichern**: Auto‑Save (debounced) in `PUT /applications/{id}`.

**Aufgaben**
- [ ] **Cognito**: User Pool + App Client (ohne Secret), Domains/Hosted UI aktivieren; E‑Mail‑Verifikation einschalten.
- [ ] **Lambda**: `applications`‑Handler (CRUD) erstellen inkl. **IAM‑Policy** (DynamoDB Table Zugriff nur auf `USER#<sub>` Partition).
- [ ] **API Gateway**: JWT Authorizer (Cognito), Routen an Lambda binden.
- [ ] **Frontend**: `src/auth/` (Login/Logout/Profile), `src/applications/` (List/Editor) anlegen.
- [ ] **Schema**: Zod‑Schemas `Application`, `Profile` anlegen (teilen Client/Server via OpenAPI/TS‑Types, s.u.).

**Akzeptanzkriterien**
- [ ] Registrierung + Login funktioniert (Verifikations‑Mail kommt an).
- [ ] Anonyme Zugriffe auf `/applications` blockiert (401), eingeloggte User sehen **nur eigene** Bewerbungen.
- [ ] Drafts lassen sich erstellen, auto‑speichern, wieder öffnen.

---

### Phase C – Medien‑Upload & Einbindung (Adminpanel + Website)
**Ziele**: Upload läuft zuverlässig (große Dateien inkl.), Medien erscheinen in Admin‑Listen, Einbindung auf Website funktioniert.

**Technische Entscheidungen**
- **Upload‑Flow**: **Pre‑Signed URL** (oder POST) von Lambda → Client lädt **direkt** nach S3 (Multipart für >5 MB).
- **UI**: **Uppy** (Drag&Drop, Progress, Retry, Multipart) + **PhotoSwipe** (Galerie/Lightbox).
- **Auslieferung**: S3 + **CloudFront**; **CORS** sauber: `GET, HEAD, PUT, POST` und Header `Content-Type, x-amz-acl, Content-Disposition` zulassen.
- **Metadaten**: Eintrag in `media`‑Tabelle mit ownerId, key, type, width/height, createdAt.

**API**
- `POST /media/presign` → `{ url, fields?, key, contentType }` (optional: multipart presign für große Dateien).
- `POST /media/complete` → Medien‑Metadaten in DynamoDB schreiben; rückgeben: öffentliche `cdnUrl` (CloudFront) + `key`.
- `GET /media` → Pagination, Filter (type, ownerId).

**Admin/Website‑Integration**
- **Admin**: Medienliste (Thumbnail, Name, Größe, Besitzer, Copy‑Button für `cdnUrl`), Suche/Filter, Löschen (mit S3 Delete + DB‑Cleanup).
- **Website**: Komponenten `ImageWithCaption`, `VideoEmbed`, `DocLink` – bekommen `cdnUrl`/`key` + Alt‑Text.

**Aufgaben**
- [ ] **S3 Bucket** `mw-<env>-media` + CloudFront Distribution anlegen (Default Root Object = index.html nur falls gebraucht).
- [ ] **Bucket‑Policy/CORS** definieren (Whitelist Netlify‑Domain, `localhost:5173` etc.).
- [ ] **Lambda** `media-presign` (prüft Auth; limitiert Dateitypen/Max‑Size), `media-complete` (schreibt Metadaten).
- [ ] **Frontend** Admin: Uppy‑Integration, Fortschritt/Retry, Erfolg‑Toast; Liste + PhotoSwipe.
- [ ] **Thumbnail‑Pipeline** (optional): imgproxy oder Lambda@Edge/Serverless Image Handler.

**Akzeptanzkriterien**
- [ ] 100 MB Datei lädt stabil (multipart), Abbruch/Resume möglich.
- [ ] Upload erzeugt DB‑Eintrag; Medien erscheinen sofort in Admin‑Liste und sind über CloudFront abrufbar.
- [ ] Einbindung auf Website ohne Mixed‑Content/CORS‑Fehler.

---

### Phase D – Bewerbungs‑Workflows werden zuverlässig
**Ziele**: Keine „hängenden“ Jobs mehr; Status klar sichtbar; automatische Retries.

**State‑Machine (Beispiel)**
`DRAFT → ANALYZING → GENERATING_LETTER → REVIEW → READY (oder) FAILED`

**Technische Entscheidungen**
- **Option 1 (empfohlen)**: **AWS Step Functions** orchestriert Lambdas (Timeouts, Retries, Backoff, DLQ). Status landet in `jobs` + `applications`.
- **Option 2**: **SQS Queue** + Worker‑Lambda; Client pollt `GET /jobs/{id}`.

**API**
- `POST /applications/{id}/submit` → erstellt `jobId` (referenziert Application), triggert State Machine/Queue.
- `GET /jobs/{id}` → Status/Progress (%), `lastUpdate`, Fehlertexte.
- **Webhooks**: `POST /jobs/{id}/done` (optional) → Frontend In‑App‑Toast.

**Frontend**
- **Polling** (exponentiell, max 30 s) **oder** **SSE/WebSocket** (falls gewünscht) für Live‑Status.
- Fortschrittsbalken + Resubmit‑Button (setzt Status `RETRY` → Job neu starten, idempotent).

**Aufgaben**
- [ ] Step Functions Template mit States + Retry Policies (`MaxAttempts: 2`, BackoffSeconds 5, 10 …).
- [ ] `jobs`‑Tabelle (PK:`JOB#<id>`) + GSI auf `APP#<appId>`.
- [ ] Lambda‑Handlers für jeden Schritt (Analyse, Matching, Generierung, Export).
- [ ] Frontend: Job‑Status‑Badge in Listen/Detailansicht, „Zuletzt aktualisiert“ Timestamp.

**Akzeptanzkriterien**
- [ ] Fehlerhafte Jobs **werden automatisch retried**; endgültige Fehler landen **sichtbar** in `FAILED` + DLQ/CloudWatch Alarm.
- [ ] Nutzer sieht **nie** endloses Spinning – immer konkreter Status oder klare Fehlermeldung + Retry.

---

### Phase E – API‑Dokumentation erreichbar & versioniert
**Ziele**: `/api-docs` ist jederzeit erreichbar, automatisch aus **OpenAPI 3.1** generiert.

**Aufbau**
- Verzeichnis `docs/api/` mit `openapi.yaml` (Quell‑Wahrheit).
- **Redoc** oder **Swagger UI** als statische Seite (`/api-docs/`), Build‑Schritt kopiert UI + `openapi.yaml`.
- **Netlify**: `_headers` für CORS/Cache, `_redirects` nur wenn nötig (keine 404 auf statischen HTML/CSS/JS).

**Aufgaben**
- [ ] OpenAPI Grundgerüst (Paths: `/auth/*`, `/applications/*`, `/media/*`, `/jobs/*`).
- [ ] `api-documentation.html` ersetzen durch Redoc Standalone (eine HTML, lädt `openapi.yaml`).
- [ ] GitHub Action: bei Merge validieren (swagger‑cli), minifizieren, nach `docs/` kopieren (Netlify Deploy Preview).

**Akzeptanzkriterien**
- [ ] Aufruf `https://<site>/api-docs/` zeigt versionierte Doku; „Try it out“ gegen **Staging** möglich.

---

### Phase F – „Alles als App“ (PWA + optional Mobile)
**Ziele**: Installierbar, offline‑fähig für Entwürfe, optional Native Builds.

**PWA**
- `public/manifest.json` (Name, Icons, Theme),
- Service Worker (Workbox): Caching‑Strategien: `Stale‑While‑Revalidate` für Assets, `Network‑First` für API, `Cache‑Only` für Icons.
- **Offline‑Modus**: Drafts in **IndexedDB** spiegeln; beim Reconnect Sync → `PUT /applications/{id}`.

**Mobile‑Wrapper (optional)**
- **Capacitor**: iOS/Android Bundle aus PWA; nativer Share‑/Filesystem‑Zugriff falls gebraucht.

**Aufgaben**
- [ ] Manifest + Icons generieren (512/192/Maskable).
- [ ] Workbox integrieren (Routen + Cache‑Regeln).
- [ ] Offline‑Banner + Sync‑Queue UI.
- [ ] Capacitor Grundsetup (nur wenn benötigt).

**Akzeptanzkriterien**
- [ ] Lighthouse **PWA‑Audit 100** in Staging.
- [ ] Erstellen/Updaten von Drafts funktioniert **ohne Netz** und wird nach Reconnect synchronisiert.

---

### Phase G – Monitoring, Qualität, Sicherheit
**Ziele**: Sichtbarkeit, automatische Checks, DSGVO & Least Privilege.

**Aufgaben**
- [ ] **Sentry** (Frontend) + **CloudWatch** (Backends) + **Metric Alarms** (Error‑Rate, DLQ Länge).
- [ ] **Axe** (Accessibility) + **Lighthouse CI** in GitHub Actions (Budget‑Fail ab Score < 90).
- [ ] **RBAC**: Rollen `user`, `admin` in Cognito Groups + Lambda‑Authorizer prüft `scope/role`.
- [ ] **IAM**: Funktionsrollen nur mit minimalem Zugriff (DynamoDB partiell per Condition auf `PartitionKey`), S3 Bucket Policies eng.
- [ ] **Consent**: Klaro! Cookie Banner (falls Tracking/3rd‑Party), **Umami** für selbstgehostete Analytics (EU‑freundlich).

**Akzeptanzkriterien**
- [ ] CI bricht bei a11y/perf‑Regressionen; Alarme bei Fehler‑Peaks.
- [ ] Kein*e* Nutzer*in kann fremde Daten/Medien lesen/schreiben.

---

## 3) Konkrete Files/Orte im Repo (Vorschlag)
```
/docs/api/openapi.yaml                 # API‑Quelle
/docs/api/build.sh                     # erzeugt Redoc/Swagger Seite
/admin/                                # (falls React‑Inseln) Admin UI Code
/src/auth/                             # Auth/Session Handling
/src/applications/                     # Bewerbungslisten + Editor
/src/media/                            # Uppy + Galerie‑Komponenten
/lambda/applications/*                 # CRUD Lambdas
/lambda/media/*                        # presign + complete Lambdas
/lambda/workflow/*                     # Steps (Analyse/Generate/Export)
/lambda/shared/*                       # util (ddb, auth, responses)
/amplify/backend/*                     # falls Amplify genutzt
/netlify.toml                          # alternativ zu _redirects/_headers
/_redirects                            # statische Routing‑Regeln
/_headers                              # CORS/Cache für /api-docs und /media
/aws-config.json or aws-exports.js     # Client‑Konfig (ohne Secrets)
```

---

## 4) Open‑Source Bausteine (gezielt)
- **Auth/SDK**: AWS Amplify JS (nur Auth/Storage/API), optional Cognito Hosted UI.
- **Formulare**: React Hook Form + Zod (typsichere Validierung).
- **Upload**: Uppy (XHR/Multipart/Retry), PhotoSwipe (Lightbox).
- **Suche** (statisch): Pagefind (falls Volltextsuche gewünscht).
- **API‑Doku**: Redoc (oder Swagger UI) + `swagger-cli` fürs Linting.
- **Qualität**: axe‑core, Lighthouse CI.
- **PWA**: Workbox.
- **Analytics**: Umami (self‑hosted) oder Netlify Analytics.

---

## 5) Beispiel‑Spezifikationen & Snippets

### 5.1 DynamoDB Tabellen (on‑demand, point‑in‑time recovery)
- **users**: `PK=USER#<sub>`, `SK=PROFILE`, Felder: `email`, `name`, `role`, `createdAt`.
- **applications**: `PK=USER#<sub>`, `SK=APP#<uuid>`, Felder: `status`, `position`, `company`, `fields{}`, `updatedAt`, `version`.
- **media**: `PK=USER#<sub>`, `SK=MEDIA#<uuid>`, Felder: `key`, `type`, `size`, `width`, `height`, `cdnUrl`, `createdAt`.
- **jobs**: `PK=JOB#<uuid>`, `SK=STATE#<status>`, Felder: `appId`, `progress`, `lastUpdate`, `error?`.

### 5.2 S3 CORS (Beispiel)
```xml
<CORSConfiguration>
  <CORSRule>
    <AllowedOrigin>https://<your-netlify-domain></AllowedOrigin>
    <AllowedOrigin>http://localhost:5173</AllowedOrigin>
    <AllowedMethod>GET</AllowedMethod>
    <AllowedMethod>PUT</AllowedMethod>
    <AllowedMethod>POST</AllowedMethod>
    <AllowedMethod>HEAD</AllowedMethod>
    <AllowedHeader>*</AllowedHeader>
    <ExposeHeader>ETag</ExposeHeader>
  </CORSRule>
</CORSConfiguration>
```

### 5.3 `_headers` (CORS/Cache für /api-docs & /media)
```
/api-docs/*
  Access-Control-Allow-Origin: *
  Cache-Control: public, max-age=600

/media/*
  Cache-Control: public, max-age=31536000, immutable
```

### 5.4 Redoc Standalone (ersetzt `api-documentation.html`)
```html
<!doctype html>
<html>
  <head>
    <meta charset="utf-8"/>
    <title>API Docs</title>
    <meta name="viewport" content="width=device-width, initial-scale=1"/>
    <script src="https://cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js"></script>
  </head>
  <body>
    <redoc spec-url="/docs/api/openapi.yaml"></redoc>
  </body>
</html>
```

### 5.5 Presigned Upload – Response (Lambda `media-presign`)
```json
{
  "key": "users/USER#123/media/uuid.jpg",
  "url": "https://s3.<region>.amazonaws.com/mw-staging-media",
  "fields": {
    "Policy": "...",
    "X-Amz-Signature": "..."
  },
  "contentType": "image/jpeg"
}
```

### 5.6 Frontend Upload (Uppy + Presigned POST)
```js
const uppy = new Uppy().use(AwsS3, { companionUrl: null, getUploadParameters: async (file) => {
  const r = await fetch("/api/media/presign", { method: "POST", body: JSON.stringify({
    filename: file.name, type: file.type, size: file.size
  })});
  const { url, fields } = await r.json();
  return { method: 'POST', url, fields };
}});
```

### 5.7 Step Functions – Retry Policy (Ausschnitt)
```json
{
  "Type": "Task",
  "Resource": "arn:aws:lambda:...:function:generateCoverLetter",
  "TimeoutSeconds": 30,
  "Retry": [
    { "ErrorEquals": ["States.ALL"], "IntervalSeconds": 5, "MaxAttempts": 2, "BackoffRate": 2.0 }
  ],
  "Catch": [ { "ErrorEquals": ["States.ALL"], "ResultPath": "$.error", "Next": "MarkFailed" } ]
}
```

### 5.8 PWA Manifest (Kurzform)
```json
{
  "name": "Manuel Weiss",
  "short_name": "MW App",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#0b1727",
  "icons": [{"src":"/icons/icon-192.png","sizes":"192x192","type":"image/png"},{"src":"/icons/icon-512.png","sizes":"512x512","type":"image/png"}]
}
```

---

## 6) „Cursor‑Tasks“ – To‑do‑Liste mit klaren Ankerpunkten
**A1 – Envs & Routing**
- [ ] Prüfe/ergänze `_redirects` und `_headers` im Repo‑Root.
- [ ] Richte Netlify Envs ein: `AWS_REGION`, `COGNITO_USER_POOL_ID`, `COGNITO_CLIENT_ID`, `API_BASE_URL`, `S3_MEDIA_BUCKET`, `CLOUDFRONT_URL`.

**B1 – Auth**
- [ ] Lege `src/auth/` an: `auth.js` (Amplify konfig), `guard.js` (Protected Routes), `profile.js` (Profil laden/speichern).
- [ ] Ersetze Form‑Handling in Admin/Website durch RHF + Zod.

**B2 – Applications API**
- [ ] Erzeuge Lambda `lambda/applications/{create,getOne,list,update,submit}.js` + SAM/Amplify Binding.
- [ ] Füge OpenAPI Paths hinzu; `docs/api/openapi.yaml`.

**C1 – Media**
- [ ] Erzeuge `lambda/media/{presign,complete,list,remove}.js`.
- [ ] Admin: `src/media/manager.jsx` (Uppy + Liste + PhotoSwipe).
- [ ] Website: `src/media/components/{ImageWithCaption,VideoEmbed}.jsx`.

**D1 – Workflow**
- [ ] Step Functions Definition `lambda/workflow/state-machine.asl.json` + Lambdas pro Schritt.
- [ ] Frontend: Job‑Status Komponente `src/applications/job-status.jsx` inkl. Polling/SSE.

**E1 – API‑Docs**
- [ ] Ersetze `api-documentation.html` mit Redoc‑HTML (s.o.).
- [ ] GitHub Action `docs.yml`: validate + deploy docs nach `docs/api/`.

**F1 – PWA**
- [ ] `public/manifest.json`, `public/icons/*`, `src/sw.js` (Workbox), Registrierungs‑Code.

**G1 – Qualität**
- [ ] GitHub Actions: `ci.yml` (ESLint, typecheck/ts‑types optional, axe, lighthouse‑ci).
- [ ] Sentry init im Frontend.

---

## 7) Mögliche Fehlerursachen & schnelle Checks (De‑Hanging)
- **CORS S3/CloudFront**: 403/No ‘Access‑Control‑Allow‑Origin’ → Bucket CORS & CF Behaviors prüfen.
- **Presign URL abgelaufen**: Uhrzeitdrift >5 min? **NTP**/Zeitzone prüfen.
- **Netlify 404** bei `/api-docs` → fehlt `index.html` im Ordner oder falscher Publish‑Pfad.
- **Cognito Callback‑URL** falsch → Hosted UI nach Login „Refused to connect“.
- **Lambda Timeouts** → Step Functions Retries + Timeouts erhöhen; CloudWatch Logs lesen.

---

## 8) Roadmap & Aufwandsschätzung (Richtwerte)
- **Woche 1**: Phase A+B (Auth, CRUD Applications), Basis‑Admin.
- **Woche 2**: Phase C (Upload), Phase D (Workflow v1, Retries), API‑Docs live.
- **Woche 3**: Phase F (PWA), Phase G (Monitoring, CI).

---

## 9) Definition of Done (gesamt)
- [ ] User können Bewerbungen **anlegen, speichern, fortsetzen, finalisieren**.
- [ ] Upload funktioniert stabil (groß/klein), Medien sind **im Admin sichtbar** und **auf der Website eingebunden**.
- [ ] Workflows hängen nicht mehr; Status + Retry vorhanden.
- [ ] API‑Doku unter `/api-docs` erreichbar und aktuell (OpenAPI Quelle).
- [ ] App ist **installierbar** (PWA) und **offlinefähig** für Entwürfe.
- [ ] Monitoring & CI sichern Qualität, RBAC & IAM sind minimal‑privilegiert.

---

### Anhang – Nützliche CLI‑Kommandos
```bash
# Amplify (falls im Projekt aktiv)
amplify init && amplify add auth && amplify push

# SAM lokal testen
sam build && sam local start-api

# OpenAPI Lint
npx swagger-cli validate docs/api/openapi.yaml

# Lighthouse CI (gegen Preview)
npx @lhci/cli autorun --collect.url=https://<preview-url>
```

