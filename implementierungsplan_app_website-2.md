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



---

## Optimierungen & Detail‑Umsetzung (Deep Dive)

> Hier erweitere ich **jeden Punkt** aus dem Plan mit pragmatischen Architektur‑Entscheidungen, Sicherheits‑/DSGVO‑Aspekten, Testfällen, Infra‑Automatisierung und sehr konkreten Cursor‑Tasks inkl. Dateipfaden. Du kannst die Blöcke direkt als Issues/PR‑Beschreibung nutzen.

### 0) Governance, Doku & Übersicht
**Ziele**: Einheitliche Struktur, nachvollziehbare Entscheidungen, übersichtliche Darstellung, weniger Wissensinseln.

**Vorschläge**
- **Docusaurus** unter `/docs` als Developer‑/Product‑Doku (Architektur, API, Playbooks). Menü: _Getting Started_, _Architecture_, _Runbooks_, _API_, _Security_, _Data_.
- **ADR‑Ordner** `/docs/adr/` (Architecture Decision Records), z.B. `0001-auth-cognito.md`, `0002-workflows-step-functions.md`.
- **CODEOWNERS** + **Conventional Commits** + **Changesets** (semver‑Release‑Notes automatisch).
- **Repo‑Struktur klarziehen**: Monorepo‑Flair mit `apps/` (frontend/admin) und `services/` (lambdas), `infra/` (CDK/Terraform).
- **Roadmap.md** + **Milestones** (A–G) + **Issue‑Templates** (Bug/Feature/TechDebt/Runbook).

**Detail‑Schritte**
1. `apps/web` (Website + Admin getrennte Routen), `services/api` (Lambdas), `infra/` (IaC), `docs/` (Docusaurus) anlegen.
2. Docusaurus quickstart; Sidebar mit o.g. Kapiteln; `Architecture` enthält aktuelle Diagramme (PNG/SVG) und Sequenzabläufe.
3. ADR‑Template erstellen und für Auth/Workflow/Media gleich 3–4 ADRs schreiben.
4. `CODEOWNERS` (z.B. `apps/web/* @manu-manera`, `services/** @manu-manera @<dev-team>`), PR‑Review‑Regeln.
5. Changesets integrieren (Release Notes/Version Tags).

**Akzeptanzkriterien**
- Auf `https://<staging>/docs` ist die **Architektur** inkl. Diagrammen klar nachvollziehbar.
- Neue Teammitglieder können anhand _Getting Started_ in <30 Min lokal laufen.

**Cursor‑Tasks**
- [ ] `docs/` Docusaurus init + GitHub Action `docs.yml` (build + deploy zu Netlify `/docs`).
- [ ] ADR‑Template + 3 initiale ADRs schreiben.
- [ ] CODEOWNERS, commitlint, changesets hinzufügen.

---

### Phase A – Environments & Stabilität (Optimiert)
**Vorschläge**
- **IaC**: CDK/Terraform für S3, CloudFront (mit OAC), Cognito, API Gateway, DynamoDB, Step Functions; vermeidet Click‑Ops.
- **Konfig‑Validierung**: Zod‑Schema für Env‑Variablen; Build bricht, wenn Variablen fehlen.
- **Routing**: Nutze `netlify.toml` statt verteilte `_redirects/_headers` (einheitlich je Env). 
- **Smoke‑Tests**: Nach jedem Deploy HEAD/GET auf kritische Routen + CORS‑Preflight.

**Detail‑Schritte**
1. `infra/` mit CDK‑Stacks: `AuthStack`, `ApiStack`, `StorageStack`, `WorkflowStack`, `EdgeStack` (CloudFront+OAC+WAF).
2. CloudFront **Origin Access Control** auf S3, **kein** Public‑Read; Signierte Zugriffe oder offene GET nur für ausgewählte Pfade.
3. Netlify Umgebungen: `NETLIFY_SITE_ID` pro Branch; Variablen via UI + `netlify.toml` contexts.
4. Health‑Endpoints: `GET /healthz` (unauthenticated) + `GET /readyz` (checks DynamoDB/S3/Secrets).

**Tests**
- CORS Matrix (Origin × Methods × Headers) automatisiert mit Playwright.
- 404/403 Matrix auf `/api-docs`, `/media/*` und App‑Routen.

**Cursor‑Tasks**
- [ ] `infra/cdk` bootstrap + Stacks definieren.
- [ ] `netlify.toml` mit contexts (`[context.production]`, `headers`, `redirects`).
- [ ] `apps/web/src/config/env.ts` mit Zod‑Validation.
- [ ] Playwright Smoke‑Suite `tests/smoke.spec.ts`.

---

### Phase B – Benutzerverwaltung & Datenmodell (Optimiert)
**Vorschläge**
- **Cognito Policies**: Passwort‑Policy, optional MFA (TOTP), E‑Mail‑Verifizierung via SES Custom Domain.
- **Rollen/Scopes**: Cognito Groups `user`, `admin`; JWT `cognito:groups` → API‑Scopes.
- **DynamoDB**: **Striktes Conditional Write** (Optimistic Locking) mit `version` + `ConditionExpression` zum Kollisionsschutz.
- **Indexe**: GSI `GSI1PK=APP#<id>`, `GSI1SK=USER#<id>`; optional LSI für `updatedAt` Sortierung.
- **PII/DSGVO**: `users` getrennt von Bewerbungs‑Inhalten; Export/Deletion Endpoints (`/me/export`, `/me/delete` mit Job‑Bestätigung).

**Detail‑Schritte**
1. Cognito Hosted UI mit eigener Subdomain `auth.<domain>`; Callback/Logout URIs je Env setzen.
2. Amplify Auth minimal (ohne Storage/API Module), eigene API‑Clients nutzen.
3. Tabellen anlegen (PITR aktivieren), IAM‑Policies mit **Partition‑Key‑Bedingungen** (nur `USER#<sub>` zugelassen).
4. API Handlers:
   - `POST /applications` erzeugt `APP#uuid`, `status=DRAFT`, `version=1`.
   - `PUT /applications/{id}` nutzt `If-Match` Header → `version` prüfen; `ConditionalCheckFailed` → 409.
   - `GET /applications?limit=...&cursor=...` (Keyset‑Pagination).
5. Admin‑Impersonation (optional): nur `admin` mit spezieller Policy.

**Tests**
- Negativ: Unauth Zugriffe → 401; fremde Ressourcen → 403.
- Concurrency: Zwei parallele Updates → einer 409; Nutzer sieht Merge‑Hinweis.
- GDPR: Export generiert JSON‑Bundle; Delete anonymisiert Bewerbungen oder löscht hart je Policy.

**Cursor‑Tasks**
- [ ] `services/api/applications/*` mit ddb conditional writes.
- [ ] `apps/web/src/auth/*` (Amplify config, Guards, UserMenu).
- [ ] Tests: unit ddb repo, e2e auth flows (Playwright).

---

### Phase C – Medien‑Upload & Einbindung (Optimiert)
**Vorschläge**
- **Multipart + Checksums**: Verwende `Content-MD5`/`x-amz-checksum-sha256` und prüfe Integrität.
- **Virenscan**: S3 Event → Lambda (ClamAV Layer) → Tag `virus=clean|infected`; blocke Auslieferung wenn `infected`.
- **Derivate**: Image‑Lambda (Sharp) generiert Thumbs/WebP/AVIF; speichere unter `derivatives/` und verlinke im Metadatum.
- **CloudFront**: Cache‑Policies, `ETag`/`If-None-Match`, **OAC**; optional **Signed Cookies** für private Medien.
- **Lifecycle**: S3 Lifecycle zu Standard‑IA nach 30 Tagen, ggf. Löschregeln für Unreferenziertes.
- **Quotas**: pro Nutzer max Größe/Anzahl (Rate‑Limit + Size‑Limit in `presign`).

**Detail‑Schritte**
1. `POST /media/presign` akzeptiert `type`, `size`; lehnt ab >100 MB außer `multipart`.
2. Frontend Uppy: Retry, Resume, `onSuccess` → `POST /media/complete`.
3. S3 Event `ObjectCreated:*` → `media-processor` (virus scan + derive + update DB record). 
4. Admin Liste: Filter `ownerId`, `type`, `tag:infected`; Batch‑Delete inkl. DB‑Cleanup.

**Tests**
- Upload‑Abbruch/Resume, korrekte Checksums, 403 bei falschem MIME.
- „Infiziertes“ Testfile wird blockiert; Admin sieht Status.

**Cursor‑Tasks**
- [ ] `services/api/media/{presign,complete,list,delete}.ts`.
- [ ] `services/workers/media-processor.ts` (S3 Trigger, Sharp, ClamAV).
- [ ] `apps/web/src/media/manager.tsx` + `components/ImageWithCaption.tsx`.

---

### Phase D – Zuverlässige Workflows (Optimiert)
**Vorschläge**
- **Step Functions** mit **idempotencyKey** (appId+hash(inputs)), **Timeouts** je State, **Circuit‑Breaker** bei Provider‑Fehlern.
- **Observability**: X‑Ray Tracing, strukturierte Logs (correlationId), Metriken (`job_duration`, `retries`, `failures`).
- **DLQ & Redrive**: Jede Task hat SQS DLQ; Admin‑Tool zum Redrive/Retry.
- **Feature Toggles**: GrowthBook Flag `workflow.v2` – Rollout kontrolliert.

**Detail‑Schritte**
1. `state-machine.asl.json` mit States: `Analyze → Generate → Export → Notify` + `Catch/Retry` wie definiert.
2. `jobs` Tabelle aktualisiert `progress` + `lastUpdate` jedes Mal; Frontend pollt 2s→5s→10s… bis 30s.
3. Fallback bei Model‑Timeout: anderer Provider/Model (konfigurierbar).
4. Export step: PDF/DOCX mit `pdf-lib`/`docx`; Ergebnis‐URL in `applications` gespeichert.

**Tests**
- Chaos: 10% künstliche Fehler → System stabil (Retries, DLQ füllt sich, Alarm feuert).
- Idempotenz: Doppelklick auf „Submit“ erzeugt **keinen** zweiten Job.

**Cursor‑Tasks**
- [ ] Lambdas `analyze.ts`, `generate.ts`, `export.ts`, `notify.ts` mit Retry‑freundlichen Fehlern.
- [ ] Frontend `JobStatus` + Notifications (toast + optional WebPush).

---

### Phase E – API‑Dokumentation (Optimiert)
**Vorschläge**
- **OpenAPI 3.1** als Single Source; **Schemas** in `components/schemas` (Zod kompatibel); Beispiel‑Payloads.
- **Error‑Format**: RFC7807 `application/problem+json` (type, title, status, detail, traceId).
- **Codegen**: `openapi-typescript` → TS‑Types + API Client; synchron mit Server.
- **Versionierung**: `/v1` Präfix; Deprecation‑Header für alte Routen.

**Detail‑Schritte**
1. `docs/api/openapi.yaml` mit `securitySchemes: bearerAuth` (JWT), Schemas `User`, `Application`, `Media`, `Job`, `Problem`.
2. Redoc Seite `/api-docs/` + „Try it out“ via Swagger UI **gegen Staging**.
3. GitHub Action `api.yml`: validate, bundle, typegen (`openapi-typescript`), veröffentliche `apps/web/src/api/types.ts`.

**Tests**
- Contract‑Tests (Pact) zwischen Frontend Client und Lambdas.

**Cursor‑Tasks**
- [ ] OpenAPI schreiben, Redoc HTML ersetzen, Action für Typegen.
- [ ] Beispiel‑Curl Snippets in Doku.

---

### Phase F – App/PWA (Optimiert)
**Vorschläge**
- **Background Sync** für Draft‑Uploads; **IndexedDB** + Queue.
- **Web Push** (VAPID) für Job‑Fertig Meldungen; Desktop & Android.
- **Capacitor** optional: In‑App‑Browser für Hosted UI, Splash/Icons, Store‑Bereitstellung.
- **Update‑Strategy**: Service Worker „new version available“ Banner + `skipWaiting` Button.

**Detail‑Schritte**
1. Workbox Routen: `CacheFirst` für Fonts/Icons, `StaleWhileRevalidate` für CDN‑Bilder, `NetworkFirst` für API.
2. Offline‑Form‑Puffer: RHF speichert Entwürfe lokal, merges bei Reconnect (`version` Check).
3. Push‑Server (Node Lambda) speichert Push Subscriptions pro User (verschlüsselt), sendet Events bei `Job DONE`.

**Tests**
- Lighthouse PWA 100; Offline‑E2E: Browser in „Offline“ → Entwurf weiter editierbar.

**Cursor‑Tasks**
- [ ] `apps/web/public/manifest.json`, `src/sw.ts` (Workbox), Update‑Banner.
- [ ] Push Server + UI (Subscribe/Unsubscribe in Profil).

---

### Phase G – Monitoring, Sicherheit & Compliance (Optimiert)
**Vorschläge**
- **Security Headers**: CSP (mit Hashes/Nonces), HSTS, COOP/COEP, Permissions‑Policy, Referrer‑Policy, SRI.
- **WAF** vor CloudFront (SQLi/XSS Regeln), Rate‑Limiting (API GW Usage Plans + API Keys für öffentliche Endpunkte).
- **Observability**: Structured JSON Logs (pino‑ähnlich), Correlation‑ID (requestId), Metrics/Alarms (SLO: 99.9%).
- **Backups**: DynamoDB PITR + wöchentliche On‑Demand; S3 Versioning + Object Lock (optional).
- **DSGVO**: Verarbeitungsverzeichnis, Auftragsverarbeitung, Datenlöschkonzept, DSAR‑Flow (Export/Delete), Aufbewahrungsfristen.

**Detail‑Schritte**
1. `_headers`/Netlify Headers für CSP (report‑only → enforcing nach 1–2 Wochen).
2. API Gateway: Usage Plan (burst, rate), API Keys für öffentlich lesbare GETs (falls nötig), ansonsten JWT only.
3. CloudWatch Alarms: `5xx > 1%` 5 Min, DLQ depth > 0, Step Function Failures > 0.
4. Log‑Correlation: Jede Response enthält `x-correlation-id`.

**Tests**
- OWASP ZAP DAST gegen Staging in CI (report speichern).
- Semgrep/Snyk Dependency Scan; IaC‑Scan (Checkov).

**Cursor‑Tasks**
- [ ] Security Headers setzen, CSP Report‑Only starten.
- [ ] WAF + API Rate Limits konfigurieren (infra/cdk).
- [ ] CI: zap‑baseline, semgrep, snyk, checkov Jobs.

---

## 90‑Tage Fahrplan (Fein)
**Woche 1–2**: Phase A (IaC, Envs, Smoke) + Phase B (Auth CRUD, Concurrency).  
**Woche 3–4**: Phase C (Upload, Derivate, Admin Media) + Phase E (OpenAPI/Docs/Typegen).  
**Woche 5–6**: Phase D (Workflows v2, Observability, DLQ/Alarme).  
**Woche 7–8**: Phase F (PWA, Background Sync, Push).  
**Woche 9–10**: Phase G (Security/WAF/CSP, SLOs, Backups) + Hardening.  
**Woche 11–12**: Polishing, E2E‑/Load‑Tests (k6), Release 1.0.

---

## Issue‑Vorlagen (Kurz)
**Feature**: _Als_ <Rolle> _möchte ich_ <Ziel>, _damit_ <Nutzen>.  
**Akzeptanzkriterien**: Given/When/Then, Monitoring‑Haken, Security‑Check, Docs‑Update.  
**TechDebt**: Problem, Impact, Lösungsskizze, Aufwand (S/M/L), Risiko.  
**Runbook**: Incident‑Symptome, Metriken, Diagnose‑Schritte, Fix, Prävention.

---

## Test‑Matrix
- **Browser**: Chrome, Safari, Firefox, Edge (letzte 2 Major).  
- **Geräte**: iOS, Android, macOS/Win.  
- **Netz**: Offline, 3G, 4G, Wi‑Fi.  
- **Accounts**: neu verifiziert, gesperrt, admin, user.  
- **Daten**: 0, 50, 500 Bewerbungen (Pagination/Performance).

---

## Migrations‑/Risiko‑Management
- **Canary Release**: Feature‑Flag für neue Workflows/Uploads.  
- **Rollback**: Vor Deploy Snapshots (DDB Export), Blue/Green für Lambdas.  
- **Cost Guards**: Budgets + Alarme (S3, Lambda, CF Data Transfer).



---

# Automatisiertes E2E‑Testing + Cursor‑Prompts – Step‑by‑Step Setup

> Ziel: Vollautomatischer Kreislauf „Testen → Fehler/Insights sammeln → in **Cursor** als präzise Fix‑Prompts einspeisen → optional Auto‑PR“. Alle Schritte sind so gestaltet, dass du sie 1:1 in dein Repo übernehmen kannst.

## 1) Voraussetzungen
- Node.js **≥ 20** lokal und im CI.
- GitHub Repository mit **Actions** aktiviert.
- Staging‑URL deiner App (Netlify/Vercel) **und** Test‑Credentials (Cognito Test‑User).
- (Optional) AWS‑CLI, falls du Testnutzer automatisch anlegen möchtest.

## 2) Abhängigkeiten installieren
```bash
npm i -D @playwright/test @axe-core/playwright
npm i -D typescript ts-node
# optional BDD:
npm i -D @cucumber/cucumber
# optional Chaos:
npm i -D gremlins.js
# Reporter/Utilities
npm i -D openapi-typescript # falls du später API‑Types nutzt
```

> Erzeuge Playwright‑Grundgerüst:
```bash
npx playwright install --with-deps
npx playwright init --quiet
```

## 3) Projektstruktur (Erweiterung)
```
/ tests/
  e2e/
    applications.spec.ts
    media-upload.spec.ts
    a11y.spec.ts
    chaos.spec.ts           # optional gremlins
/ scripts/
  generate-cursor-prompts.ts
  seed-cognito-test-user.sh # optional
/.cursor/
  rules/ci.md
/playwright.config.ts
```

## 4) Playwright konfigurieren
**playwright.config.ts**
```ts
import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  timeout: 45_000,
  expect: { timeout: 10_000 },
  reporter: [
    ['list'],
    ['json', { outputFile: 'playwright-report/report.json' }],
    ['html', { open: 'never' }],
  ],
  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:5173',
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
    viewport: { width: 1280, height: 800 },
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox',  use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit',   use: { ...devices['Desktop Safari'] } },
  ]
});
```

## 5) Basis‑Tests erstellen
### 5.1 Login + Bewerbung speichern (applications.spec.ts)
```ts
import { test, expect } from '@playwright/test';

const email = process.env.E2E_USER_EMAIL!;
const password = process.env.E2E_USER_PASSWORD!;

test.describe('Bewerbungen', () => {
  test('Entwurf anlegen und sehen', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /login/i }).click();
    // Falls Hosted UI: selektiere Iframe/Origin ggf. per page.waitForURL(...)
    await page.getByLabel(/e-?mail/i).fill(email);
    await page.getByLabel(/passwort/i).fill(password);
    await page.getByRole('button', { name: /anmelden|login/i }).click();

    await page.getByRole('button', { name: /neue bewerbung/i }).click();
    await page.getByLabel(/position/i).fill('Frontend Engineer');
    await page.getByRole('button', { name: /speichern/i }).click();

    await expect(page.getByText(/entwurf gespeichert/i)).toBeVisible();
    await expect(page.getByRole('row', { name: /frontend engineer/i })).toBeVisible();
  });
});
```

### 5.2 Accessibility‑Smoke (a11y.spec.ts)
```ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('Startseite ist a11y‑sauber (kritische Kategorien)', async ({ page }) => {
  await page.goto('/');
  const results = await new AxeBuilder({ page })
    .disableRules(['color-contrast']) // ggf. später aktivieren
    .analyze();
  expect(results.violations).toEqual([]);
});
```

### 5.3 Medien‑Upload (media-upload.spec.ts)
```ts
import { test, expect } from '@playwright/test';
import path from 'path';

test('Medienupload funktioniert', async ({ page }) => {
  await page.goto('/admin/media');
  const file = path.resolve(__dirname, '../fixtures/image.jpg');
  await page.setInputFiles('input[type=file]', file);
  await expect(page.getByText(/upload erfolgreich|erledigt/i)).toBeVisible();
  await expect(page.getByRole('img', { name: /image\.jpg/i })).toBeVisible();
});
```

### 5.4 Chaos‑Suite (optional, chaos.spec.ts)
```ts
import { test } from '@playwright/test';

test('Chaos‑Clicks mit gremlins', async ({ page }) => {
  await page.goto('/');
  await page.addScriptTag({ path: require.resolve('gremlins.js') });
  await page.evaluate(() => {
    // @ts-ignore
    gremlins.createHorde({
      species: [gremlins.species.clicker(), gremlins.species.formFiller()],
      mogwais: [gremlins.mogwais.fps(), gremlins.mogwais.gizmo()]
    }).unleash();
  });
  await page.waitForTimeout(10_000);
});
```

## 6) Prompt‑Generator für Cursor
**scripts/generate-cursor-prompts.ts**
```ts
import fs from 'fs/promises';
import path from 'path';

function mdEscape(s: string) {
  return s?.replace(/\|/g, '\|') ?? '';
}

(async () => {
  const reportPath = 'playwright-report/report.json';
  const exists = await fs.access(reportPath).then(()=>true).catch(()=>false);
  if (!exists) process.exit(0);
  const data = JSON.parse(await fs.readFile(reportPath, 'utf8'));
  let out = '# Cursor Fix Prompts

';
  out += 'Kontext: Playwright‑E2E‑Lauf. Erzeuge präzise PR‑Fixes für die folgenden Fehler. Halte dich an die Repo‑Standards, schreibe Tests, und erkläre kurz die Ursache.

';

  const suites = data.suites ?? [];
  for (const s of suites) {
    for (const spec of s.specs ?? []) {
      for (const t of spec.tests ?? []) {
        if (t.status !== 'failed') continue;
        const title = t.titlePath?.join(' › ') ?? spec.title;
        const err = t.error?.message || t.error || 'Unbekannter Fehler';
        const attachments = t.attachments || [];
        const trace = attachments.find((a:any)=>a.name==='trace')?.path || '';
        const video = attachments.find((a:any)=>a.name==='video')?.path || '';

        out += `## ${mdEscape(title)}
`;
        out += `**Fehler**

\`\`\`
${err}
\`\`\`

`;
        out += `**Erwartetes Verhalten**: Testtitel ist die Erwartung. Stelle sicher, dass der Flow robust gegen Timing/CORS/Auth ist.

`;
        if (trace || video) {
          out += '**Artefakte**

';
          if (trace) out += `- Trace: ${trace}
`;
          if (video) out += `- Video: ${video}
`;
          out += '
';
        }
        out += '**Bitte umsetzen**
- Ursache identifizieren und beheben
- Stabilen Locator/Retry nur wo notwendig
- Relevanten Test aktualisieren/ergänzen
- Changelog + kurze PR‑Beschreibung mit Root Cause

---

';
      }
    }
  }

  await fs.mkdir('prompts', { recursive: true });
  await fs.writeFile('prompts/cursor-fixes.md', out, 'utf8');
})();
```

## 7) Cursor‑Regeln (Guidance für den Agent)
**.cursor/rules/ci.md**
```md
# CI Fix Rules
- Lies `prompts/cursor-fixes.md` und untersuche die referenzierten Dateien/Tests.
- Halte dich an **TypeScript**, ESLint, Prettier.
- Schreibe **Tests zuerst** oder parallel; lasse `npm test` und `npx playwright test` grün werden.
- Nutze **ARIA‑Locators** statt CSS‑Selektoren.
- Für Auth verwende vorhandene Helper; Credentials kommen aus ENV.
- Dokumentiere Root Cause + Fix in der PR‑Beschreibung (max 8 Sätze) und verlinke Artefakte.
```

## 8) GitHub Actions – E2E + Cursor‑Feedback
**.github/workflows/e2e.yml**
```yaml
name: e2e
on:
  pull_request:
  push:
    branches: [ main ]
  schedule:
    - cron: '0 3 * * *' # nightly

jobs:
  test:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write
    env:
      E2E_BASE_URL: ${{ secrets.E2E_BASE_URL }}
      E2E_USER_EMAIL: ${{ secrets.E2E_USER_EMAIL }}
      E2E_USER_PASSWORD: ${{ secrets.E2E_USER_PASSWORD }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: 'npm' }
      - run: npm ci
      - run: npx playwright install --with-deps
      - name: Run Playwright
        run: npx playwright test || echo "TESTS_FAILED=1" >> $GITHUB_ENV
      - name: Generate Cursor Prompts
        if: env.TESTS_FAILED == '1'
        run: node scripts/generate-cursor-prompts.ts
      - name: Upload artifacts
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-artifacts
          path: |
            playwright-report/
            prompts/cursor-fixes.md
      - name: Comment on PR with prompts
        if: env.TESTS_FAILED == '1' && github.event_name == 'pull_request'
        uses: thollander/actions-comment-pull-request@v2
        with:
          filePath: prompts/cursor-fixes.md
      # OPTIONAL: Cursor CLI Headless – Flags bitte an deine CLI-Version anpassen
      - name: Run Cursor Agent (optional)
        if: env.TESTS_FAILED == '1' && github.event_name == 'pull_request'
        run: |
          echo "(Beispiel) Cursor Agent wird mit Prompt-Datei angestoßen…"
          # cursor agent run --prompt-file prompts/cursor-fixes.md --apply-suggestions=branch \
          #   --branch "cursor/fix-${{ github.run_id }}" --repo .
```

> **Secrets setzen**: `E2E_BASE_URL`, `E2E_USER_EMAIL`, `E2E_USER_PASSWORD` unter **Repo → Settings → Secrets → Actions** hinterlegen.

## 9) (Optional) Cognito Testnutzer automatisch anlegen
**scripts/seed-cognito-test-user.sh**
```bash
#!/usr/bin/env bash
set -euo pipefail

USER_POOL_ID="$1"      # z.B. eu-central-1_ABCdef123
EMAIL="$2"             # tester@example.com
PASSWORD="$3"          # SuperSicher123!

aws cognito-idp sign-up \
  --client-id "$COGNITO_APP_CLIENT_ID" \
  --username "$EMAIL" \
  --password "$PASSWORD" \
  --user-attributes Name=email,Value="$EMAIL"

aws cognito-idp admin-confirm-sign-up \
  --user-pool-id "$USER_POOL_ID" \
  --username "$EMAIL"
```
> Füge einen **Setup‑Job** in einer separaten Workflowdatei hinzu, der 1×ig in Staging läuft.

## 10) PR‑Qualitätsbarrieren
- **CI muss grün**: `npm run lint`, `npm run typecheck` (falls TS), `npx playwright test`.
- **A11y Check** darf keine blocker‑Violations enthalten.
- **Artefakte** (Trace/Video) werden immer hochgeladen.

## 11) Lokaler DX‑Shortcut
**package.json (Scripts)**
```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:a11y": "playwright test tests/e2e/a11y.spec.ts",
    "e2e:report": "playwright show-report",
    "prompts": "ts-node scripts/generate-cursor-prompts.ts"
  }
}
```

## 12) (Optional) BDD‑Layer mit Cucumber
1. Lege `features/*.feature` an (Deutsch/Englisch), z.B. `applications.feature`.
2. Implementiere Step‑Definitions in `tests/steps/*.ts` und ruft darin Playwright‑Befehle auf.
3. Reporter auf JSON ausrichten (analog, um `prompts/cursor-fixes.md` zu speisen).

## 13) (Optional) Prompt‑Eval für KI‑Workflows
- **promptfoo** als zusätzlicher Job: Evaluations definieren, PR‑Diffs kommentieren (nur relevant, wenn du LLM‑Prompts/Workflows änderst).

## 14) Abnahme‑Checkliste
- [ ] CI kommentiert PRs bei Testfehlern mit **konkreten Cursor‑Prompts**.
- [ ] Artefakte (Trace/Video/Report) sind im PR verlinkt.
- [ ] Lokale Runs (UI/Headless) funktionieren mit ENV‑Variablen.
- [ ] Nightly‑Run deckt alle Browser (Chromium/Firefox/WebKit) ab.
- [ ] (Optional) Cursor Agent kann aus Prompts einen Fix‑Branch erzeugen.

---

**Hinweis:** Die **Cursor‑CLI‑Flags** können je nach Version abweichen. Passe die Beispielzeile im Workflow an deine lokale `cursor`‑CLI an. Der gesamte Rest (Tests, Reporter, Prompt‑Generierung, PR‑Kommentar) ist unabhängig davon sofort nutzbar.

