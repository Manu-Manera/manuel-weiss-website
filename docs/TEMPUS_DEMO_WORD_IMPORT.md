# Tempus Demo — Word-Import mit KI Coach

## Ablauf

1. **Tempus Demo** → „Demo aus Word erstellen“
2. `.docx` hochladen (Mammoth-Extraktion)
3. **KI Coach — Analyse** (inhaltliches Verständnis)
4. **KI Coach — Struktur** (JSON → HTML via `demoHtmlBuilder.js`)
5. Vorschau, optional **Anpassen** per Chat
6. **Speichern** → Katalog + S3-State → neue Kachel

## Word-Format (empfohlen)

| Marker | Box-Typ |
|--------|---------|
| Klick: / Click: | Klickpfad |
| Sagen: / Say: | Erklärpunkte |
| Muss-Satz: | Muss-Satz |
| Hintergrund: | Kontext |
| [FEEDBACK: …] | Feedback |

Überschriften → Szenen; Abschnitt „Agenda“ → Agenda-Blöcke.

## URLs

- Custom Demo: `/onboarding/tempus-demo.html?demo={slug}`
- API Katalog: `GET/POST /v1/demo-script/catalog`
- API State: `GET/POST /v1/demo-script/custom/{slug}`

Passwort: wie Demo-Editor (`tempus-demo-edit-2024`).

## Deploy

```bash
cd infrastructure && npx cdk deploy manuel-weiss-website-api --require-approval never
cd lambda/demo-script-api && zip -qr ../demo-script-api.zip index.js package.json node_modules
aws lambda update-function-code --function-name website-demo-script-api --zip-file fileb://../demo-script-api.zip --region eu-central-1
./deploy-aws-website.sh
```
