# Desktop Capture MCP (Python)

Lokaler **Model Context Protocol**-Server: macht **Screenshots deines Desktops** und legt sie als `captures/latest.png` ab. Der Assistent kann die Datei im Workspace mit **read_file** öffnen (inkl. Bildanalyse).

## Was das kann – und was nicht

- **Kann:** Gesamten Monitor oder einen Bildschirmbereich erfassen (Safari, Chrome außerhalb von Cursor, Tempus im externen Browser, ganzer Desktop).
- **Kann nicht:** Den eingebauten **Cursor-Browser** ersetzen. Browser-Klicks und DOM-Snapshots bleiben beim **Browser-MCP**; Desktop-Capture **ergänzt** das, wenn du etwas siehst, das außerhalb dieses Browsers läuft.

## macOS: Berechtigung

**Systemeinstellungen → Datenschutz & Sicherheit → Bildschirmaufnahme** (bzw. „Screen Recording“): Terminal **oder** **Cursor** erlauben – je nachdem, wer den MCP-Prozess startet.

## Einrichtung

```bash
cd tools/desktop-capture-mcp
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
chmod +x run.sh
```

Test:

```bash
./run.sh
```

(Sollte ohne Fehler warten – der MCP-Client spricht per Stdio.)

## Cursor: MCP eintragen

**Cursor → Einstellungen → Features → MCP** (oder `mcp.json` / JSON in den Cursor-Settings): einen Server hinzufügen, z. B.:

```json
{
  "mcpServers": {
    "desktop-capture": {
      "command": "/ABSOLUTER/PFAD/ZUM/REPO/tools/desktop-capture-mcp/run.sh",
      "args": []
    }
  }
}
```

Pfade an dein Repo anpassen (Ordner „Persönliche Website“). Alternativ ohne Shell:

```json
{
  "mcpServers": {
    "desktop-capture": {
      "command": "/ABSOLUTER/PFAD/.../tools/desktop-capture-mcp/.venv/bin/python",
      "args": ["/ABSOLUTER/PFAD/.../tools/desktop-capture-mcp/server.py"],
      "cwd": "/ABSOLUTER/PFAD/.../tools/desktop-capture-mcp"
    }
  }
}
```

Nach dem Speichern MCP neu laden bzw. Cursor neu starten.

## Tools

| Tool | Zweck |
|------|--------|
| `list_monitors` | mss-Indizes und Auflösungen |
| `capture_display` | Monitor `0` (alle) oder `1` (erster Monitor) → `captures/latest.png` |
| `capture_region` | Rechteck `left, top, width, height` in Pixeln |

Workflow für den Assistenten: `capture_display` aufrufen, dann **`read_file`** auf `tools/desktop-capture-mcp/captures/latest.png`.
