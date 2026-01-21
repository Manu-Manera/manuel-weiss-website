# Detaillierte Analyse: PDF-Abstände Problem

## Aktueller Status
- Settings korrekt geladen: 15mm (oben), 25mm (rechts), 30mm (unten), 10mm (links) ✓
- UI-Regler zeigen noch 20mm (nicht aktualisiert) ✗
- PDF-Vorschau ist geöffnet

## Mögliche Ursachen

### 1. Settings werden nicht korrekt an Puppeteer gesendet
- **Prüfung:** Console-Logs während PDF-Generierung
- **Erwartung:** `parsedMargins: { top: 15, right: 25, bottom: 30, left: 10 }`

### 2. HTML-Generierung verwendet falsche Werte
- **Prüfung:** Generiertes HTML in Console-Logs
- **Erwartung:** `padding-top: 15mm`, `padding-right: 25mm`, `padding-bottom: 30mm`, `padding-left: 10mm`

### 3. CSS-Spezifität: Extrahiertes CSS überschreibt Padding
- **Prüfung:** Reihenfolge der CSS-Regeln im generierten HTML
- **Erwartung:** Padding-Regeln müssen NACH dem extrahierten CSS kommen

### 4. Puppeteer ignoriert CSS-Padding
- **Prüfung:** Lambda-Funktion verwendet `margin: 0mm` ✓
- **Erwartung:** Puppeteer sollte CSS-Padding respektieren

### 5. Box-Sizing oder andere CSS-Konflikte
- **Prüfung:** `box-sizing: border-box` ist gesetzt ✓
- **Erwartung:** Padding sollte korrekt angewendet werden

## Testplan

### Test 1: Console-Logs prüfen
1. Öffne Browser-Console
2. Exportiere PDF erneut
3. Prüfe Logs:
   - `📐 PDF Settings direkt aus Editor`
   - `parsedMargins`
   - Generiertes HTML (falls geloggt)

### Test 2: HTML-String prüfen
1. Füge Debug-Log hinzu, der den generierten HTML-String ausgibt
2. Prüfe ob Padding-Werte korrekt sind

### Test 3: Verschiedene Margin-Werte testen
1. Setze alle auf 10mm → Export → Prüfe
2. Setze alle auf 30mm → Export → Prüfe
3. Setze unterschiedliche Werte (15, 25, 30, 10) → Export → Prüfe

### Test 4: CSS-Reihenfolge prüfen
1. Stelle sicher, dass Padding-Regeln NACH extrahiertem CSS kommen
2. Prüfe ob `!important` korrekt angewendet wird

## Nächste Schritte
1. Füge detaillierte Debug-Logs hinzu
2. Teste mit verschiedenen Margin-Werten
3. Prüfe generiertes HTML
4. Korrigiere bei Bedarf
