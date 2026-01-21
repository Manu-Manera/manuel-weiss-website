# Systematischer Testplan für PDF-Abstände

## Problem
- Oben passt ✓
- Rechts, unten, links passen NICHT ✗

## Testplan

### Test 1: Alle Margins auf 10mm
- Setze alle Regler auf 10mm
- Exportiere PDF
- Prüfe alle 4 Seiten

### Test 2: Alle Margins auf 20mm
- Setze alle Regler auf 20mm
- Exportiere PDF
- Prüfe alle 4 Seiten

### Test 3: Unterschiedliche Margins
- Oben: 15mm
- Rechts: 25mm
- Unten: 30mm
- Links: 10mm
- Exportiere PDF
- Prüfe alle 4 Seiten

### Test 4: Sehr große Margins
- Alle auf 30mm
- Exportiere PDF
- Prüfe ob Breite korrekt berechnet wird

## Mögliche Probleme

1. **Padding wird nicht korrekt angewendet**
   - Prüfe ob `padding-top`, `padding-right`, `padding-bottom`, `padding-left` korrekt gesetzt werden
   - Prüfe ob `box-sizing: border-box` aktiv ist

2. **Breite wird falsch berechnet**
   - `width: calc(210mm - left - right)` muss korrekt sein
   - Prüfe ob die Werte in mm sind

3. **Print-Styles überschreiben die normalen Styles**
   - Prüfe ob `@media print` die Padding-Werte korrekt hat

4. **Settings werden nicht korrekt geladen**
   - Prüfe ob `this.settings.marginTop` etc. die korrekten Werte haben
