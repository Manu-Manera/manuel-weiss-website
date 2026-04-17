# Tempus Login Mailer

Erstellt personalisierte Outlook-Entwürfe mit Login-Daten aus einer Excel-Liste.

## Wo liegt was?

Projektordner im Valkeen-Repository: `Valkeen/tempus-login-mailer/`

Wichtig für dich:

| Inhalt | Pfad |
|--------|------|
| App starten | `tempus-login-mailer/main.py` |
| **E-Mail-Vorlagen (selbst verwalten)** | `tempus-login-mailer/templates/` |
| **Geführter Ablauf (Doku)** | [docs/workflow/README.md](docs/workflow/README.md) |
| UI-Bausteine (Workflow, Assistent) | `tempus-login-mailer/ui/` |

Jede Vorlage ist ein **Unterordner** mit `template.json` + `body.html` (oder `body.txt` / `body.docx`). Details: [templates/README.md](templates/README.md).

## Features

- **Schrittleiste** in der App: Daten → Vorlage → Inhalt → Senden (mit Kurztext und Zurück/Weiter)
- **Vorlagen-Assistent**: neue Vorlage als HTML (mit Platzhalter-Buttons) oder aus Word `.docx` anlegen — ohne Finder
- Excel-Import, Namen aus E-Mail ableiten, Vorname/Nachname-Spalten
- Vorlagen als Dateien bearbeiten (Editor-Tab), Outlook-Entwürfe (macOS: AppleScript, Windows: COM)

## Schnellstart (macOS)

```bash
cd tempus-login-mailer
pip3 install -r requirements.txt
python3 main.py
```

In der App: **„2. Vorlage“** wählen, **„3. Bearbeiten“** für Text/Titel/Betreff und Speichern, **„Ordner öffnen“** öffnet `templates/` im Finder.

## Windows .exe

1. Python 3.10+ von [python.org](https://python.org) installieren  
2. Ordner `tempus-login-mailer` auf den Windows-PC kopieren  
3. `build.bat` ausführen  
4. Start: `dist/TempusLoginMailer/TempusLoginMailer.exe`  
5. Vorlagen bearbeiten unter `dist/TempusLoginMailer/templates/` (wird mit gebündelt)

## Excel-Spalten

Spaltennamen werden erkannt (E-Mail, Username, Passwort, URL, Name, Vorname, Nachname — siehe `services/excel_parser.py`). **Alle Arbeitsblätter** werden eingelesen (Zeilen aneinandergehängt); dieselbe E-Mail kann mehrfach vorkommen (entspricht mehreren Excel-Zeilen). Mehrzeilige Köpfe oben im Blatt werden heuristisch erkannt; fehlt eine reine E-Mail-Spalte, wird pro Zeile nach einer Adresse gesucht.

## Platzhalter in Vorlagen

| Platzhalter | Bedeutung |
|-------------|-----------|
| `{NAME}` | Anzeigename |
| `{EMAIL}` | E-Mail-Adresse |
| `{URL}` | Login-URL |
| `{USERNAME}` | Benutzername |
| `{PASSWORD}` | Passwort |
