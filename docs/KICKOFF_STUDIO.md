# Kick-off Studio (Onboarding-App)

Geführter **Tempus-Implementierungs-Workshop** mit **DE/EN**-Inhalt, optionalem **Integrations-Kapitel** (Toggle) und Export als **PDF** (client) bzw. **Gamma** (Lambda, API-Key nur serverseitig).

## Navigation

- Sidebar: **Kick-off Studio** (Facilitator, mit Sidebar)
- Sidebar: **Kick-off (Kunde)** → neues Fenster, **Vollbild ohne Sidebar**
- Facilitator: `/onboarding/kickoff-studio?session=<id>`
- **Kundenansicht:** `/onboarding/kickoff-presenter/<tenant>?session=<id>`  
  Beispiel SHS: `/onboarding/kickoff-presenter/shs?session=…`

## Eigene Domain pro Kunde

| Kunde | Slug | Beispiel-Domain |
|--------|------|------------------|
| Siemens Healthineers | `shs` | `shs-kickoff-studio.ch` |
| Horizon | `horizon` | `horizon-kickoff-studio.ch` |
| Knauf | `knauf` | `knauf-kickoff-studio.ch` |

**Technik:** Domain → CloudFront (Alias) → gleicher S3-Bucket. App erkennt Hostname und lädt Tenant-Voreinstellungen. Bis DNS steht: Fallback `manuel-weiss.ch/onboarding/kickoff-presenter/shs`.

Konfiguration: `config/kickoff-tenants.json` (auch auf S3) + `src/kickoff/kickoffTenants.js`.

Im Facilitator-Modus: **Einstellungen (Zahnrad) → Kunden-URLs & Domains** — Link kopieren + DNS-Schritte.

## Inhalt

- Master-Deck: `onboarding-app/src/data/kickoff-deck.json` (aus Valkeen `Tempus_Kickoff_Workshop_Master_deck.json`)
- Deutsch: `kickoff-deck-locale-de.json` (Generator: `scripts/build-kickoff-de-locale.py`)

## Integrations-Kapitel

Toggle **„Integrations-Kapitel einbeziehen“** blendet alle Folien mit `section: "integrations"` ein/aus (7 Folien).

## API

| Methode | Pfad | Beschreibung |
|--------|------|----------------|
| GET | `/v1/kickoff-studio?sessionId=…` | Session aus S3 laden (204 wenn leer) |
| POST | `/v1/kickoff-studio` | `action: save` oder `gamma-export` |
| Header | `X-Demo-Password` | wie Demo-Editor (`tempus-demo-edit-2024`) |

Lambda: `website-kickoff-studio-api` (nodejs22.x)  
S3: `s3://manuel-weiss-website/data/kickoff-studio/<sessionId>.json`

### Gamma

- Env auf Lambda: `GAMMA_API_KEY` (gesetzt aus `Valkeen/docs/horizon_workshop/.env` — Key nie ins Repo)
- Body `gamma-export`: `{ session, exportDeck }` — Deck wird im Frontend aus Antworten gebaut
- Erzeugung dauert typisch 1–3 Minuten (Polling in der Lambda, Timeout 120s)

## Deploy Lambda

```bash
./scripts/deploy-kickoff-studio-lambda.sh
```

Wichtig: `index.js` muss im **ZIP-Root** liegen (nicht `kickoff-studio-api/index.js`), sonst 502 „Cannot find module index“.

### Gamma (async)

- `gamma-slide` / `gamma-export` starten die Generierung und liefern sofort `generationId` + `status: pending`
- Der Browser pollt `gamma-poll` alle 5s bis `gammaUrl` da ist (vermeidet API-Gateway-Timeout)

API-Gateway-Resource `/kickoff-studio` — siehe `docs/RECOVERY_demo-script-lambda.md` (gleiches Muster).

## App bauen & deployen

```bash
cd "Onboarding Valkeen/onboarding-app"
npm run build
# Anschließend Website-Deploy (S3/CloudFront) wie üblich
```
