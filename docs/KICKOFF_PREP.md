# Kick-off Vorab-Fragebogen (Kundenzugang)

## Ablauf

1. **Facilitator** — Kick-off Studio → Einstellungen → „Kunden-Fragebogen“  
   - Anrede: Du / Sie / Ihr → Titel *„Willkommen in deiner / Ihrer / eurer Tempus Implementation Suite“*  
   - Einladung: Projektteam oder Einzelperson  
   - Optional: Kunden-Passwort  
   - **Freigeben & Links kopieren**

2. **Kunde** — Willkommenslink öffnen → **Weiter zum Fragebogen** → Schritt-für-Schritt, Auto-Save, Absenden

3. **Nach Absenden** — Antworten werden in die verknüpfte Kick-off-`sessionId` gemappt (Workshop-Folien vorbefüllt).

## Links

| Link | URL | Verwendung |
|------|-----|------------|
| Willkommen | `/onboarding/kickoff-prep/<prepId>` | Standard-Einladung (Team/Einzelperson) |
| Fragebogen direkt | `/onboarding/kickoff-prep/<prepId>/fragebogen` | Wiederkehrer ohne Willkommensseite |

## API (Lambda `website-kickoff-studio-api`)

| Action | Auth |
|--------|------|
| `GET ?prepId=` | Kunde: `X-Kickoff-Prep-Password` falls gesetzt |
| `prep-save` | Kunden-Passwort |
| `prep-submit` | Kunden-Passwort → merged in Session |
| `prep-admin-upsert` | `X-Demo-Password` (Facilitator) |

S3: `data/kickoff-prep/<prepId>.json`

## Inhalt

Fragen: `onboarding-app/src/data/kickoff-prep-questionnaire.de.json` (wird schrittweise erweitert).

Mapping: `src/kickoff/kickoffPrepMapping.js`
