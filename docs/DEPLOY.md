# Deploy-Guide für manuel-weiss.ch

Zentrale Doku für alle Deploys der persönlichen Website. **Diese Datei ist die einzige Wahrheit** – wenn etwas hier nicht steht, ist es kein Standardweg.

## TL;DR – So deploye ich

```bash
# Standard (Website + ggf. Onboarding bauen, wenn nötig)
./deploy-aws-website.sh

# Reine Website-Änderung (HTML/CSS/JS), Onboarding NICHT neu bauen → ~5–15s
./deploy-aws-website.sh --skip-build

# Onboarding-App-Code geändert und Build erzwingen
./deploy-aws-website.sh --force-build

# Komplettes Re-Sync aller Dateien (Notnagel)
./deploy-aws-website.sh --full
```

Danach **immer**:

```bash
git add <relevante Dateien>
git commit -m "..."
git push origin main
```

## Modi im Detail

| Modus | Wann verwenden | Dauer |
|---|---|---|
| `--quick` (default) | Standard-Deploy. Lädt nur per Git geänderte Dateien hoch. Onboarding-Build nur, wenn dessen Quellcode sich geändert hat (Hash-basiert). | 5–60s |
| `--skip-build` | Reine Änderung an Website-Dateien (`*.html`, `js/*.js`, `css/*.css` ausserhalb von `Onboarding Valkeen/`). Springt Build immer ab. | 5–15s |
| `--force-build` | Onboarding-App-Build erzwingen, z. B. nach Dependency-Update. | 30–90s |
| `--full` | Kompletter `s3 sync`, vergleicht alle Dateien. Nur als Notnagel. | 2–5 min |
| `--cleanup` | Wie `--full`, aber löscht in S3 auch Dateien die lokal nicht mehr existieren. | 2–5 min |
| `--dry-run` | Zeigt nur an, was passieren würde. | – |

## Wie das Smart-Build-Detection funktioniert

Vor dem Build wird ein SHA1-Hash über folgende Dateien gebildet:

- `Onboarding Valkeen/onboarding-app/src/**/*.{js,jsx,ts,tsx,css,html,json}`
- `Onboarding Valkeen/onboarding-app/index.html`
- `Onboarding Valkeen/onboarding-app/package.json`
- `Onboarding Valkeen/onboarding-app/vite.config.{js,ts}`

Hash wird gespeichert in `.deploy-cache/onboarding-build.hash` (gitignored). Wenn der aktuelle Hash zum Cache passt → Build wird übersprungen. Damit fällt der teure Vite-Build (3000+ Module, ~30s) bei reinen Website-Änderungen komplett weg.

## Parallele Uploads

Im `--quick`-Modus werden bis zu **16 Dateien gleichzeitig** hochgeladen (`PARALLEL_UPLOADS=16` in `config/deploy-aws-website.env` überschreibbar). Das beschleunigt grosse Onboarding-Build-Outputs (~50 Bundle-Files) drastisch gegenüber sequenziellen `aws s3 cp`-Aufrufen.

## Cache-Invalidierung

- **Ohne Onboarding-Build**: Nur `/*.html` wird invalidiert. Assets mit Content-Hash sind `immutable`.
- **Mit Onboarding-Build**: `/onboarding/*` + `/*.html` (Onboarding-Bundles haben neue Namen, alte HTML referenziert noch die alten – muss invalidiert werden).

## Lambda / Infrastruktur

API-/Lambda-Änderungen separat zuerst:

```bash
cd infrastructure
npx cdk deploy manuel-weiss-website-api --require-approval never
```

**Erst danach** Website-Deploy ausführen.

## Was NICHT deployed wird

Siehe `config/deploy-aws-exclude.txt`. U. a.:

- `node_modules/`, `*.git/*`
- `infrastructure/`, `lambda/`, `backend/`, `packages/`, `amplify/`, `api/`
- `.md`-, `.sh`-, `.yml`-Dateien (Doku, Skripte)
- `Onboarding Valkeen/onboarding-app/` (Source – nur das gebaute `onboarding/` geht live)

## Häufige Fehler

| Symptom | Ursache | Lösung |
|---|---|---|
| "AccessDeniedException" auf Lambda | Account-Block auf `lambda:CreateFunction` | Siehe `docs/RECOVERY_song-generator-lambda.md` |
| "Keine geänderten Dateien" | `git status` ist clean → nichts zu deployen | OK – einfach committen |
| Änderungen nicht sichtbar nach Deploy | CloudFront-Cache (TTL ≤ 5 min) | 5 Min warten oder Browser-Hard-Reload (Cmd+Shift+R) |
| Onboarding-App "leer" auf Deep-Link | CloudFront Custom Error Response fehlt | 403/404 für `/onboarding*` → 200 mit `/onboarding/index.html` |

## Konfiguration

`config/deploy-aws-website.env`:

```bash
S3_BUCKET=manuel-weiss-website
CLOUDFRONT_DISTRIBUTION_ID=E305V0ATIXMNNG
AWS_REGION=eu-central-1
SITE_URL=https://manuel-weiss.ch
PARALLEL_UPLOADS=16
```

`config/deploy-aws-exclude.txt`: eine Pattern pro Zeile, `#` für Kommentare.
