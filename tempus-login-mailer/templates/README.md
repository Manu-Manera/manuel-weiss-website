# E-Mail-Vorlagen selbst verwalten

Jede Vorlage ist **ein eigener Ordner** unter `templates/`.

## In der App (Tab „3. Bearbeiten“)

- **Anzeigetitel** und **Betreff** werden in `template.json` gespeichert.
- **E-Mail-Text** entspricht der Datei `body.html` bzw. `body.txt` im Vorlagenordner.
- **Speichern** schreibt Titel, Betreff und Text auf die Festplatte.
- **Zurücksetzen** lädt den letzten gespeicherten Stand neu (ohne Speichern gehen Änderungen verloren).
- **Datei importieren…** ersetzt den Inhalt der Body-Datei durch eine gewählte HTML-/Textdatei.
- **Bilder importieren…** kopiert Bilder nach `bilder/` und fügt passende `<img>`-Zeilen am Ende des Textes ein (Position danach anpassen, dann speichern).
- **ZIP importieren…** entpackt eine ZIP-Datei in einen neuen Unterordner unter `templates/` (Ordnername wird abgefragt). Enthalten sollte `template.json` und/oder `body.html` sein (optional ein einzelner Unterordner im ZIP).
- **Neue Vorlage…** legt einen neuen Ordner mit Minimal-`body.html` und `template.json` an.

Du kannst Vorlagen weiterhin **extern** mit VS Code, Cursor oder Word bearbeiten; die App lädt sie nach „Neu laden“ oder beim nächsten Start neu.

## Ordnerstruktur

```
templates/
  meine_vorlage/
    template.json    ← Metadaten (Titel, Betreff, optional body_file)
    body.html        ← Inhalt (HTML) ODER body.txt (nur Text)
    bilder/          ← optional, für Screenshots
      schritt1.png
```

## `template.json`

```json
{
  "title": "Anzeigename in der App",
  "subject": "Betreff mit optional Platzhaltern {NAME}",
  "body_file": "body.html"
}
```

Wenn `body_file` fehlt, sucht die App automatisch nach `body.html`, `body.htm` oder `body.txt`.

## Platzhalter im Text / HTML

| Platzhalter | Bedeutung |
|-------------|-----------|
| `{NAME}` | Anzeigename |
| `{URL}` | Login-URL |
| `{USERNAME}` | Benutzername |
| `{PASSWORD}` | Passwort |

## Links und Bilder

- **Links:** normales HTML, z.B. `<a href="https://example.com">Text</a>` oder `{URL}` im `href`.
- **Bilder:** lege Dateien z.B. unter `bilder/screenshot.png` ab und binde sie so ein:

```html
<img src="bilder/screenshot.png" alt="Anleitung" style="max-width: 560px;" />
```

Relative Pfade werden beim Senden in die E-Mail eingebettet (Outlook-Entwurf). Externe `http(s)`-URLs bleiben unverändert.

## Neue Vorlage anlegen

1. Unter `templates/` einen neuen Ordner anlegen (kurzer Name ohne Leerzeichen, z.B. `kunde_xyz_login`).
2. `template.json` und `body.html` hineinlegen.
3. In der App auf **„Vorlagen neu laden“** klicken (oder App neu starten).

## Vorlagen-Ordner im Finder öffnen

In der App: Tab **„2. Template“** → **„Vorlagen-Ordner öffnen“**.
