# PDF-Abstände Analyse und Testplan

## Problem-Analyse

### Aktuelles Problem
- Links passt ✓
- Oben, rechts, unten passen NICHT ✗

### Mögliche Ursachen

1. **Computed Styles vs. Settings:**
   - Computed styles werden aus der Vorschau extrahiert
   - ABER: Die Vorschau verwendet möglicherweise andere Werte als die Settings
   - Padding wird als `${this.settings.marginTop}mm` gesetzt, aber computed style könnte in px sein

2. **Padding-Konvertierung:**
   - `parsePaddingValue` konvertiert px zu mm
   - ABER: Die Konvertierung könnte ungenau sein (1px ≈ 0.264583mm)
   - Oder die Werte werden nicht korrekt geparst

3. **CSS-Spezifität:**
   - Extrahiertes CSS könnte die Padding-Werte überschreiben
   - Auch mit `!important` könnte es Konflikte geben

4. **Print-Styles:**
   - Print-Styles könnten andere Werte verwenden
   - Oder die Print-Styles werden nicht korrekt angewendet

## Detaillierter Testplan

### Phase 1: Analyse der Vorschau-Styles
1. Öffne Design Editor
2. Setze Margins auf 20mm (alle Seiten)
3. Öffne Browser Console
4. Prüfe computed styles des `.design-resume-preview` Elements:
   - `padding-top`
   - `padding-right`
   - `padding-bottom`
   - `padding-left`
5. Notiere die tatsächlichen Werte

### Phase 2: Analyse der PDF-Generierung
1. Exportiere PDF
2. Prüfe Console-Logs für:
   - `📐 PDF Settings aus Vorschau`
   - `📐 Computed Styles aus Vorschau`
3. Vergleiche die Werte mit den Settings
4. Prüfe ob die Werte korrekt konvertiert werden

### Phase 3: Vergleich Vorschau vs. PDF
1. Messe die Abstände in der Vorschau (Browser DevTools)
2. Messe die Abstände im PDF (PDF-Viewer)
3. Vergleiche die Werte
4. Identifiziere Abweichungen

### Phase 4: Korrektur
1. Behebe die identifizierten Probleme
2. Teste erneut
3. Wiederhole bis alle Abstände korrekt sind

## Konkrete Schritte

### Schritt 1: Sicherstellen, dass computed styles korrekt extrahiert werden
- Prüfe ob `getComputedStyle` die richtigen Werte zurückgibt
- Prüfe ob die Werte in der richtigen Einheit sind (mm vs. px)

### Schritt 2: Sicherstellen, dass Padding-Werte korrekt gesetzt werden
- Prüfe ob die Padding-Werte im generierten HTML korrekt sind
- Prüfe ob die Print-Styles die gleichen Werte verwenden

### Schritt 3: Sicherstellen, dass keine Überschreibungen stattfinden
- Prüfe ob extrahiertes CSS die Padding-Werte überschreibt
- Stelle sicher, dass finale Definition NACH extrahiertem CSS kommt

### Schritt 4: Testen mit verschiedenen Margin-Werten
- Teste mit 10mm, 20mm, 30mm
- Prüfe ob alle Werte korrekt übernommen werden

## Erwartete Ergebnisse

- Alle Abstände (oben, rechts, unten, links) sollten exakt den Settings entsprechen
- Das PDF sollte identisch mit der Vorschau sein
- Console-Logs sollten die korrekten Werte anzeigen
