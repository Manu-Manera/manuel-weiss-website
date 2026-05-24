# Tempus Trainings-Tool – Architektur-Referenz

> Internes Dokument für das Valkeen-Trainerteam. Beschreibt Komponenten,
> Datenmodell, Routen und Betrieb.

## 1. Komponenten

```
[Trainee Browser]
  ├── Tempus-Tab (knauf.prosymmetry.com / demo.prosymmetry.com)
  │     └── Browser-Extension (extension/)
  │           ├── content/index.ts           – Tour-Runtime, Recorder
  │           ├── content/highlight.ts       – Highlight + Tooltip (Shadow-DOM)
  │           ├── content/modal.ts           – Theorie-Vollbild-Folie
  │           ├── sidepanel/                 – persistentes Side Panel
  │           ├── popup/                     – Browser-Action (Login, Recorder)
  │           └── background.ts              – Service Worker, Auth, Cache
  │
  └── Onboarding-Hub-Tab (manuel-weiss.ch/onboarding)
        ├── /training            → TraineeHub.jsx          (Tour starten)
        ├── /training-admin      → TrainingAdmin.jsx       (Tours, Slides, Branding, Customers, Progress)
        └── services/trainingAdminService.js               (API-Client)

[AWS]
  └── lambda/training-admin-api/
        ├── index.js             – Router (Customers/Tours/Slides/Progress/Auth)
        ├── auth.js              – HMAC-JWT (HS256) Issue + Verify
        └── package.json         – jsonwebtoken, @aws-sdk/client-s3
  └── S3 manuel-weiss-website/training-admin/
        ├── customers/index.json
        ├── customers/<cid>/branding.json
        ├── customers/<cid>/tours/<tid>.json
        ├── customers/<cid>/tours/_index.json
        ├── customers/<cid>/slides/<sid>.json
        ├── customers/<cid>/slides/_index.json
        ├── customers/<cid>/assets/<file>
        └── customers/<cid>/progress/<userId>.json
```

## 2. Datenmodell

Single Source of Truth: [`Onboarding Valkeen/onboarding-app/src/data/trainingSchema.js`](../onboarding-app/src/data/trainingSchema.js)
sowie der Spiegel-Typ in [`extension/src/lib/types.ts`](../../extension/src/lib/types.ts).

Die wichtigsten Schritte (`StepKind`):

| Kind | Beschreibung |
|---|---|
| `theory` | Zeigt eine Slide (Modal oder Side-Panel) |
| `highlight` | Hebt ein DOM-Element hervor + Tipp |
| `click` | Wartet auf Klick auf das Ziel |
| `input` | Wartet auf Eingabewert (Validation `input-equals`) |
| `wait` | Wartet bis ein Element erscheint/verschwindet |
| `quiz` | Slide mit Quiz-Block |
| `checklist` | Abschluss-Karte „Geschafft!“ |

Validierungen: `manual-next`, `url-contains`, `url-equals`, `element-exists`,
`element-removed`, `input-equals`, `click-target`.

## 3. API-Routen

Alle unter Stage `/v1/`:

| Methode | Pfad | Auth |
|---|---|---|
| POST | `/auth/magic-link` | öffentlich (Rate-Limit empfohlen) |
| POST | `/auth/token` | Admin-Passwort |
| GET | `/training-admin/customers/index` | öffentlich |
| GET | `/training-admin/customers/:cid/branding` | trainee |
| PUT | `/training-admin/customers/:cid/branding` | trainer |
| GET | `/training-admin/customers/:cid/tours` | trainee (nur published) / trainer (alle) |
| GET | `/training-admin/customers/:cid/tours/:tid` | trainee/trainer |
| PUT | `/training-admin/customers/:cid/tours/:tid` | trainer |
| DELETE | `/training-admin/customers/:cid/tours/:tid` | admin |
| GET | `/training-admin/customers/:cid/slides` | trainee |
| GET | `/training-admin/customers/:cid/slides/:sid` | trainee |
| PUT | `/training-admin/customers/:cid/slides/:sid` | trainer |
| DELETE | `/training-admin/customers/:cid/slides/:sid` | admin |
| POST | `/training-admin/customers/:cid/progress/:uid` | trainee (eigener uid) |
| GET | `/training-admin/customers/:cid/progress/:uid` | trainee (eigener uid) / trainer (alle) |
| GET | `/training-admin/customers/:cid/progress` | trainer/admin |
| POST | `/training-admin/upload-url` | optionale Auth, customerId-Param |

## 4. Authentifizierung

HMAC-JWT (HS256), Secret in Umgebungsvariable `TRAINING_JWT_SECRET`.

Magic-Link-Flow (vereinfacht, Mailversand folgt):

1. Trainee öffnet `/onboarding/training` → wählt Kunde + E-Mail.
2. Frontend ruft `POST /auth/magic-link` mit `email` und `customerId`.
3. Backend stellt Token aus (8 h gültig) und gibt ihn zurück.
4. Frontend persistiert in `localStorage["trainingAuth"]`,
   pusht via `chrome.runtime.sendMessage` an die Extension.

Für Phase 6 wird `POST /auth/magic-link` so erweitert, dass statt direkter
Token-Antwort eine signierte URL per E-Mail (`SES`) verschickt wird –
die Implementation orientiert sich an [`lambda/contact-email-api`](../../lambda/contact-email-api).

## 5. Multi-Tenant-Trennung

- **Pfad-Isolation**: Alle Daten pro Kunde unter `customers/<cid>/...`.
- **Token-Bindung**: JWT enthält `cid`; das Lambda lehnt jeden Request ab,
  dessen Pfad-`cid` nicht zur Token-`cid` passt (Ausnahme: Rolle `admin`).
- **Subdomain-Mapping**: `customers/index.json` mappt Tempus-Subdomains
  auf `customerId`. Die Extension liest die Subdomain und kann so beim
  Live-Test ohne explizites Login das richtige Branding anzeigen.

## 6. Deployment

```bash
# Backend
cd lambda/training-admin-api
npm install
cd ../../infrastructure
npx cdk deploy manuel-weiss-website-api --require-approval never

# Seed
node "Onboarding Valkeen/scripts/seed-training-tool.mjs"

# Onboarding-App (Frontend)
cd "Onboarding Valkeen/onboarding-app"
npm install
npm run build

# Extension (Self-host)
cd extension
npm install
npm run build
npm run package    # → release/valkeen-tempus-trainer-<version>.zip
```

## 7. Smoke-Test gegen Tempus-Updates

[`Onboarding Valkeen/scripts/smoke-test-tour.mjs`](../scripts/smoke-test-tour.mjs)
führt einmal pro Monat mit Playwright einen Headless-Run gegen
`demo.prosymmetry.com` durch und meldet, falls Selectors brechen
(siehe Skript-Header). Ergebnis wird im Trainer-Slack gepostet.

## 8. Bekannte Limits

- Iframe-Inhalte in Tempus werden vom Highlight-Layer nicht erreicht
  (nur Same-Origin-Iframes wären machbar).
- Native Browser-Dialoge (Datei-Upload, Print) liegen außerhalb der
  DOM-Welt und werden nur dokumentiert, nicht hervorgehoben.
- Mobile Tempus-Sessions werden nicht unterstützt – Extension läuft nur
  auf Desktop-Browsern.
