# Valkeen Tempus Trainer – Browser-Extension

Interaktives Training direkt in Tempus Resource. Die Extension blendet Live-Tipps,
Highlights und Theorie-Folien (Side Panel + Modal) auf der echten Tempus-Seite ein.

Inhalte (Touren, Folien, Branding) werden kundenspezifisch aus AWS geladen
und im TrainingAdmin der Onboarding-App gepflegt.

## Quickstart (Entwicklung)

```bash
cd extension
npm install
npm run dev
```

Anschließend in Chrome unter `chrome://extensions/`:

1. Entwicklermodus aktivieren
2. "Entpackte Erweiterung laden" → `extension/dist/` auswählen
3. Tempus-Tab öffnen (z.B. `https://demo.prosymmetry.com/...`)
4. Extension-Popup → Tour starten

## Build (Distribution)

```bash
npm run build
# erzeugt extension/dist/ – als ZIP für Web-Store oder als .crx für Self-Host
```

## Architektur

- `src/background.ts` – Service Worker: Auth-Token, Tour-Cache, Cross-Tab-Messaging
- `src/content/index.ts` – Content-Script auf `*.prosymmetry.com`: Highlight-Layer, Tooltip, Validierung
- `src/sidepanel/` – persistentes Panel rechts: Tour-Fortschritt, kurze Tipps
- `src/modal/` – Vollbild-Theorie-Folie
- `src/popup/` – Browser-Action: Login, Customer wählen, Aufnahme starten
- `src/lib/` – API-Client, Selector-Heuristik, Storage, Messaging-Typen

## Trainer-Modus (Recorder)

Im Popup auf "Aufnahme starten" – die Extension protokolliert Klicks, generiert
robuste Selectors (data-testid > role+name > id > heuristisch) und macht pro Schritt
einen Screenshot. Stop → in Onboarding-App "Aus Recorder importieren" klicken.

## Multi-Tenant

Die Extension liest die Tempus-Subdomain (`<customer>.prosymmetry.com`) und mappt
sie über das `index.json` aus dem Backend auf eine `customerId`. Pro Kunde werden
Touren, Folien und Branding isoliert geladen.
