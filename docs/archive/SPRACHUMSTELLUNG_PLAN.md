# Plan: Sprachumschaltung vereinfachen und Hero-Section optimieren

## Analyse der aktuellen Situation

### 1. Hero-Titel
- **Aktuell**: "Manuel Weiss - Professional Services" in einer Zeile
- **Gewünscht**: "Manuel Weiss" (Zeile 1) + "Professional Services" (Zeile 2)

### 2. Profilbild und Statistik-Kacheln
- **Problem**: Werden beim Öffnen der Seite nicht vollständig angezeigt
- **Ursache**: Grid-Layout `1fr 1fr` könnte zu eng sein, oder Elemente werden abgeschnitten
- **Lösung**: Grid-Layout optimieren, sicherstellen dass alles sichtbar ist

### 3. Spracheinstellung (3 Varianten gefunden)
- **Variante 1**: Mobile Menu Language Switcher (Zeile 56-59 in index.html)
- **Variante 2**: Desktop Nav Menu Language Switcher (Zeile 72-75 in index.html)
- **Variante 3**: Safari's native language selector ("A Deutsch" im Browser)
- **Problem**: Überdecken den Anmelden-Button
- **Lösung**: Nur Desktop-Version behalten, Mobile-Version entfernen

### 4. TranslationManager
- **Aktuell**: Komplexes System mit JSON-Dateien, Fallback-Translations
- **Gewünscht**: Einfache Lösung - einmal einstellen, alle Seiten übersetzt
- **Dateien**: 
  - `js/translation-manager.js` (389 Zeilen)
  - `js/admin/sections/translations.js` (vermutlich Admin-Panel)

### 5. Übersetzungsdateien
- **Gefunden**: 
  - `js/translation-manager.js`
  - `js/admin/sections/translations.js`
- **Zu prüfen**: Gibt es `translations/*.json` Dateien?

## Umsetzungsplan

### Schritt 1: Hero-Titel aufteilen
- HTML ändern: Zwei separate Zeilen
- CSS anpassen: Zeilenumbruch erlauben

### Schritt 2: Profilbild/Stats sichtbar machen
- Hero-Container Grid optimieren
- Sicherstellen dass alle Elemente sichtbar sind
- Eventuell `min-height` oder `align-items: start` verwenden

### Schritt 3: Spracheinstellung vereinfachen
- Mobile Language Switcher entfernen
- Desktop Language Switcher behalten und optimieren
- Position anpassen, damit Anmelden-Button nicht verdeckt wird

### Schritt 4: TranslationManager vereinfachen
- Nur `data-de` und `data-en` Attribute verwenden
- localStorage für Sprache speichern
- Einfache Funktion: Alle Elemente mit `data-de`/`data-en` übersetzen
- Keine JSON-Dateien mehr

### Schritt 5: Überflüssige Dateien entfernen
- `js/translation-manager.js` vereinfachen oder neu schreiben
- `js/admin/sections/translations.js` prüfen (falls Admin-Panel benötigt wird, behalten)
- `translations/*.json` Dateien entfernen (falls vorhanden)

## Implementierung

### Priorität:
1. Hero-Titel aufteilen (einfach)
2. Profilbild/Stats sichtbar machen (wichtig)
3. Spracheinstellung vereinfachen (wichtig)
4. TranslationManager vereinfachen (mittel)
5. Überflüssige Dateien entfernen (niedrig)

