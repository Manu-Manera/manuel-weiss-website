# Tempus Login Mailer — geführter Ablauf

Die App führt in **vier Schritten** von den Empfängerdaten bis zu den Outlook-Entwürfen. Oben in der Oberfläche zeigt die **Schrittleiste** den aktuellen Schritt; **Zurück** / **Weiter** wechseln die Tabs in sinnvoller Reihenfolge.

## Schritt 1 — Daten

- **Excel importieren** oder **Zeilen hinzufügen** (Name, E-Mail, URL, Username, Passwort).
- **Globale URL** und **Initialpasswort** für alle Zeilen nutzen, wo sinnvoll.
- **Username-Modus**: nur Vorname (Standard) oder Vor- und Nachname — danit werden Usernames aus dem Anzeigenamen abgeleitet (siehe auch Excel-Import).

## Schritt 2 — Vorlage

- Aktive **E-Mail-Vorlage** aus der Liste wählen.
- **Vorlagen-Assistent**: neue Vorlage komplett in der Oberfläche anlegen (HTML mit Platzhalter-Buttons oder Word `.docx` importieren).
- Alternativ: **Aus Word neu…**, **ZIP importieren**, Ordner unter `templates/` manuell.

## Schritt 3 — Inhalt

- **Titel** und **Betreff** (`template.json`).
- **E-Mail-Text**: HTML/Text im Editor, oder Word-Body extern bearbeiten (**Body in Word öffnen**).
- **Speichern** schreibt die Vorlage auf die Festplatte.

## Schritt 4 — Senden

- **Betreff** nochmals anpassen (optional).
- **Vorschau** (lesbarer Klartext; Outlook erhält weiterhin volles HTML).
- **E-Mails in Outlook öffnen**.

## Platzhalter (HTML, Text, Word)

`{NAME}` `{EMAIL}` `{URL}` `{USERNAME}` `{PASSWORD}`

## Ordnerstruktur (Kurz)

```
tempus-login-mailer/
  app.py                 # Hauptfenster
  main.py                # Start
  services/              # Import, Vorlagen, Outlook, Vorschau, …
  ui/                    # Workflow-Leiste, Vorlagen-Assistent
  templates/<id>/        # template.json + body.html | body.txt | body.docx
  docs/workflow/         # dieser Leitfaden
```
