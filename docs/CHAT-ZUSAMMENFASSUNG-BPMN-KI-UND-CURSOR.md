# Chat-Zusammenfassung: BPMN-KI & Cursor

Damit in einem neuen Chat nichts verloren geht.

---

## 1. BPMN-Generierung mit KI (Admin) – Stand

### Erledigt
- **Lambda** `lambda/text-to-bpmn-gpt52/index.js`: POST mit `{ text, processId?, openaiApiKey }`, ruft OpenAI (gpt-5.2) auf, liefert BPMN 2.0 XML; bei fehlendem Key Fallback auf einfaches Template.
- **API-Route** `POST /text-to-bpmn-gpt` in `infrastructure/lib/website-api-stack.ts` (Lambda `website-text-to-bpmn-gpt52`).
- **Config** `js/aws-app-config.js`: Endpoint `TEXT_TO_BPMN_GPT: '/text-to-bpmn-gpt'`.

### Noch zu tun
- **Admin-UI:** Neue Sektion z. B. `admin/sections/bpmn-generator.html`:
  - Textarea „Prozessbeschreibung“, Button „BPMN mit GPT 5.2 generieren“.
  - OpenAI-Key per `window.awsAPISettings.getFullApiKey('openai')` holen und im Request-Body an `POST /text-to-bpmn-gpt` mitsenden (Key nur für diesen Aufruf, nicht im Frontend speichern).
  - Antwort: `{ success: true, bpmnXml: string }`. Anzeige des XML (z. B. `<pre>`) mit Aktionen: Kopieren, Download (.bpmn), „In demo.bpmn.io öffnen“.
- **Navigation:** Diese Sektion in der Admin-Navigation bzw. auf der Admin-Hauptseite einbinden (je nachdem wie andere Sektionen wie `api-keys.html` oder `hero-video.html` geladen werden – im Projekt nach „loadSection“ oder Sidebar-Links zu Sektionen suchen).

### Wichtige Dateien
- Lambda: `lambda/text-to-bpmn-gpt52/index.js`
- API-Stack: `infrastructure/lib/website-api-stack.ts` (Lambda + Route `text-to-bpmn-gpt`)
- Config: `js/aws-app-config.js` (TEXT_TO_BPMN_GPT)
- Referenz für Admin-Key-Nutzung: `applications/resume-editor.html` (getFullApiKey('openai')) oder `js/admin/sections/hero-video.js` (getApiUrl)

---

## 2. Cursor-Abstürze

- **Logs:** `~/Library/Application Support/Cursor/logs/` – in `main.log` steht: `CodeWindow: renderer process gone (reason: crashed, code: 5)` (Renderer-Crash).
- **Renderer.log:** Vor Crashes oft `InvalidStateError: lock() request could not be registered` (Web Locks API).
- **Empfehlungen:** Weniger Fenster/Tabs; Extensions neu einrichten (Skript unten); Bug an Cursor melden mit Debug-ZIP aus `~/Library/Application Support/Cursor/debugging-data/`.

---

## 3. Cursor-Extensions neu einrichten

- **Backup-Liste:** `config/cursor-extensions-backup.txt` (PowerShell bereits entfernt).
- **Alles in einem:** In **Terminal.app** (nicht Cursor-Terminal):  
  `cd "/Users/manumanera/Documents/GitHub/Persönliche Website"`  
  `./config/cursor-extensions-refresh.sh`  
  (Deinstalliert alle, startet Cursor neu, installiert wieder.)
- **Manuell:** `./config/cursor-extensions-uninstall.sh` → Cursor neu starten → `./config/cursor-extensions-reinstall.sh`
- Siehe auch: `config/README-DEPLOY.md` (Abschnitt „Cursor-Extensions neu einrichten“).

---

## 4. Für den nächsten Chat (Copy & Paste)

> Bitte die Admin-UI für die BPMN-KI-Generierung fertigstellen. Lambda und Route `/text-to-bpmn-gpt` existieren bereits (siehe `docs/CHAT-ZUSAMMENFASSUNG-BPMN-KI-UND-CURSOR.md`). Ich brauche: 1) `admin/sections/bpmn-generator.html` mit Textarea, Button „BPMN mit GPT 5.2 generieren“, Anzeige des BPMN-XML und Aktionen Kopieren/Download/In demo.bpmn.io öffnen; OpenAI-Key per awsAPISettings.getFullApiKey('openai') an die API mitsenden. 2) Die Sektion in der Admin-Navigation einbinden.
