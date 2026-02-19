# Cursor-Abstürze: Schritte zur Behebung

Die Logs zeigen: **Renderer-Prozess stürzt ab (code: 5)**. Diese Checkliste arbeitest du am besten nacheinander ab.

---

## Schritt 1: Fenster reduzieren
- [ ] Alle Cursor-Fenster bis auf **eins** schließen (es waren 9+ Fenster in den Logs).
- [ ] Danach Cursor neu starten.
- **Ziel:** Weniger Speicher und Last auf den Renderer.

---

## Schritt 2: Erweiterungen testweise deaktivieren
In den Logs traten Fehler in diesen Erweiterungen auf. Nacheinander deaktivieren und prüfen, ob es stabiler läuft:

1. **GitLens** (FetchError zu gitkraken.dev)  
   - Command Palette (⌘⇧P) → „Extensions: Disable“ → GitLens deaktivieren.

2. **GitHub Actions** (TypeError: Invalid URL)  
   - Ebenfalls über „Extensions: Disable“ deaktivieren.

3. **Cursor IDE Browser Automation** (No browser view available)  
   - Deaktivieren, wenn du die Funktion nicht brauchst.

- [ ] Nach jeder Deaktivierung: Cursor eine Weile normal nutzen und beobachten, ob Abstürze seltener werden.
- [ ] Wenn es stabiler ist: Die zuletzt deaktivierte Erweiterung wieder aktivieren, um die verantwortliche zu identifizieren.

---

## Schritt 3: Große Dateien entlasten
- [ ] Weniger sehr große Dateien gleichzeitig geöffnet lassen (z. B. nur eine von `hr-selbsttest.html`, `en/index.html`, etc.).
- [ ] Tabs schließen, die du gerade nicht brauchst.

---

## Schritt 4: Cursor aktualisieren
- [ ] **Help → Check for Updates** (oder Cursor-Einstellungen).
- [ ] Auf die neueste Version updaten; Renderer-Fixes kommen oft in Updates.

---

## Schritt 5: Neustart nach langer Laufzeit
- [ ] Cursor nach mehreren Stunden Nutzung oder nach vielen Tab-/Fenster-Wechsel einmal komplett beenden und neu starten.

---

## Wenn es weiter abstürzt
- Crash-Reports liegen unter:  
  `~/Library/Logs/DiagnosticReports/`  
  (nach Cursor-Absturz nach „Cursor“ im Dateinamen suchen)
- Logs:  
  `~/Library/Application Support/Cursor/logs/`  
  (neuester Ordner mit Datum, darin `main.log`)

Diese Infos kannst du an den Cursor-Support schicken, wenn du dich meldest.
