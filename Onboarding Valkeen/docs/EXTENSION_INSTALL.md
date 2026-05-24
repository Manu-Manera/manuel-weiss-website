# Valkeen Tempus Trainer – Installation der Browser-Extension

Diese kurze Anleitung beschreibt, wie Trainees und Trainer die Extension einrichten.
Die Extension blendet Live-Tipps und Theorie-Folien direkt in der echten
Tempus-Resource-Anwendung ein.

## Voraussetzungen

- Chrome (≥ 114) oder Microsoft Edge (≥ 114). Beide nutzen denselben
  Manifest-V3-Build.
- Zugang zur Tempus-Instanz deines Kunden (z.B. `https://knauf.prosymmetry.com`).
- Optional: Onboarding-Hub `https://manuel-weiss.ch/onboarding/training` zum
  Auswählen der Touren.

## Phase A – Pilot (Self-Hosted, ohne Web Store)

1. Letzte Version aus dem internen Drive laden:
   `valkeen-tempus-trainer-<version>.zip`
2. ZIP entpacken (Ergebnis: ein Ordner `valkeen-tempus-trainer/`).
3. In Chrome: `chrome://extensions/` öffnen → **Entwicklermodus** aktivieren
   (Schalter oben rechts).
4. **„Entpackte Erweiterung laden“** klicken → den entpackten Ordner auswählen.
5. Erste Nutzung: Erweiterung pinnen (Puzzle-Icon → Pin) und einmalig im
   Onboarding-Hub einloggen. Die Extension übernimmt automatisch das Token.

In Edge analog unter `edge://extensions/` mit aktiviertem Entwicklermodus.

## Phase B – Chrome Web Store / Edge Add-ons

Sobald die Extension öffentlich gelistet ist:

- Chrome Web Store: `https://chromewebstore.google.com/detail/<id>`
- Edge Add-ons: `https://microsoftedge.microsoft.com/addons/detail/<id>`

Mit einem Klick installieren – kein Entwicklermodus nötig.

## Phase C – Enterprise-Rollout (für Großkunden)

Die Extension kann per Group Policy oder Intune verteilt werden:

- **Windows GPO**: `ExtensionInstallForcelist` mit `<extension-id>;https://clients2.google.com/service/update2/crx`
- **macOS / Jamf**: `com.google.Chrome` Plist-Schlüssel `ExtensionInstallForcelist`
- **Edge**: gleiche Policy unter `Software\Policies\Microsoft\Edge\ExtensionInstallForcelist`

Mit Force-Install ist die Extension auf allen verwalteten Geräten verfügbar
und kann nicht versehentlich deinstalliert werden.

## Erste Schritte nach der Installation

1. Onboarding-Hub öffnen: `https://manuel-weiss.ch/onboarding/training`
2. Kunden auswählen, E-Mail eingeben → **Einloggen**.
3. Eine Tour auswählen → **Tour starten**.
4. Es öffnet sich ein zweiter Tab mit deiner Tempus-Instanz. Wechsle dorthin –
   die Extension blendet automatisch Tipps und Folien ein.

## Trainer-Modus (Recorder)

1. Auf das Extension-Icon klicken → **Aufnahme starten**.
2. Im Tempus-Tab den gewünschten Workflow normal durchklicken.
3. Zurück ins Onboarding-Hub → **Training Admin** → Tab **Touren** →
   **„Aus Recorder importieren“**. Die Klicks erscheinen als Steps zur
   Politur (Tipp-Text, Folie davor/danach, Validation).

## Datenschutz

- Die Extension liest **keine Tempus-Daten** und sendet **keine Inhalte
  deiner Tempus-Seite** an Valkeen. Es werden ausschließlich Tour-Daten
  vom Backend geladen und Fortschritts-Events (Step-IDs, Status,
  Zeitstempel) gespeichert.
- Bei Recordings prüfst du als Trainer vor dem Veröffentlichen, ob in
  Screenshots PII enthalten sind. Solange Touren im Status `draft` stehen,
  sind sie nur für Trainer/Admins sichtbar.

## Support

Bei Problemen: `manuel.weiss@valkeen.de` mit Screenshot des Extension-Popups
und der Browser-Konsole (`Strg/Cmd+Shift+J`).
