# Tempus Login Mailer – Starten ohne Installation

Diese Anleitung liegt jeder ZIP bei. **Du musst nichts installieren**, weder Python noch Outlook-Add-ons.

## macOS (`TempusLoginMailer-mac.zip`)

1. ZIP doppelklicken, damit sie entpackt wird – es entsteht **`TempusLoginMailer.app`**.
2. Die App auf den **Schreibtisch** oder in den Ordner **`Programme`** ziehen.
3. Beim ersten Start **Rechtsklick → Öffnen → Öffnen bestätigen**.
   (Die App ist ad-hoc signiert. Ohne diesen Schritt blockiert macOS den Start mit „unbekannter Entwickler“.)
4. Danach reicht Doppelklick.

Voraussetzung: **Microsoft Outlook für Mac** ist installiert und mit deinem Postfach verbunden.
Beim ersten „E-Mails in Outlook öffnen“ fragt macOS, ob das Programm Outlook steuern darf – **erlauben**.

## Windows (`TempusLoginMailer-windows.zip`)

1. ZIP in einen Ordner entpacken (z. B. `Dokumente\TempusLoginMailer`).
2. **`TempusLoginMailer.exe`** doppelklicken.
3. Windows SmartScreen zeigt eventuell eine Warnung → **„Weitere Informationen“ → „Trotzdem ausführen“**.

Voraussetzung: **Microsoft Outlook (Desktop, klassisch)** ist installiert und angemeldet.
Die „neue Outlook“-Variante unterstützt die Automatisierung nicht vollständig; im Zweifel die klassische Version nutzen.

## Bedienung – 4 Schritte

1. **Daten** — Excel importieren oder Zeilen von Hand anlegen. Oben lassen sich „Globale URL“, „CC für alle Mails“, „Initialpasswort“ und „Username-Modus (nur Vorname / Vor- und Nachname)“ einstellen.
2. **Vorlage** — eine vorhandene Vorlage auswählen oder über **„Vorlagen-Assistent“** eine neue anlegen (HTML oder aus Word-Datei).
3. **Inhalt** — Betreff und Body der Vorlage anpassen, Platzhalter (`{NAME}`, `{EMAIL}`, `{URL}`, `{USERNAME}`, `{PASSWORD}`) nutzen.
4. **Senden** — Vorschau prüfen, danach **„E-Mails in Outlook öffnen“**. Die App öffnet pro Empfänger einen Entwurf in Outlook; **gesendet wird nichts automatisch**.

## Häufige Fragen

- **Ich sehe das Fenster nicht.** Auf dem Mac im Dock auf das Python-Icon klicken, oder per `Cmd+Tab` zu *TempusLoginMailer* wechseln.
- **Outlook zeigt einen anderen Empfängernamen.** Outlook ersetzt den Empfängernamen durch den Eintrag aus deinen Kontakten/der GAL. Das ist Outlook-Verhalten. Der Name im Mail-Text ist aber korrekt (der, den du in der Tabelle eingetragen hast).
- **Alte Entwürfe stehen noch in Outlook herum.** Beim erneuten „E-Mails in Outlook öffnen“ werden *neue* Entwürfe erzeugt, alte nicht überschrieben. Vorher die alten Entwürfe schließen.
