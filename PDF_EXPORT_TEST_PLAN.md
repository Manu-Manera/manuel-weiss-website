# PDF Export Test Plan

## Test-Ziele
1. ✅ PDF-Export funktioniert im Design Editor
2. ✅ Lambda wird korrekt aufgerufen (direkter HTML-Export ohne GPT)
3. ✅ PDF wird korrekt generiert und heruntergeladen
4. ✅ Abstände/Margins werden korrekt übernommen
5. ✅ Console-Logs zeigen korrekte Informationen

## Test-Szenarien

### Test 1: Design Editor öffnen
- [ ] Navigiere zu Resume Editor
- [ ] Design Editor öffnen
- [ ] Prüfe ob Preview-Element vorhanden ist

### Test 2: PDF Export initiieren
- [ ] PDF Export Button klicken
- [ ] Export-Optionen Dialog öffnet sich
- [ ] Optionen auswählen (Format: A4, Qualität: Standard)
- [ ] Export starten

### Test 3: Lambda-Aufruf prüfen
- [ ] Console zeigt: "📡 Sende HTML direkt an PDF-Generator Lambda"
- [ ] Console zeigt: "📦 HTML Content Preview"
- [ ] API-URL ist korrekt: `https://6i6ysj9c8c.execute-api.eu-central-1.amazonaws.com/v1/pdf-generator`
- [ ] Request wird gesendet (Network Tab prüfen)

### Test 4: Response-Verarbeitung
- [ ] Console zeigt: "📦 Response Content-Type: application/pdf"
- [ ] Console zeigt: "✅ PDF generiert (Base64 dekodiert): X Bytes"
- [ ] Keine Fehler in Console

### Test 5: PDF Download
- [ ] PDF wird automatisch heruntergeladen
- [ ] Dateiname ist korrekt
- [ ] PDF-Datei ist gültig (öffnen und prüfen)
- [ ] PDF-Größe ist > 0 Bytes

### Test 6: PDF-Inhalt prüfen
- [ ] PDF öffnen
- [ ] Abstände/Margins sind korrekt (20mm Padding)
- [ ] Layout ist korrekt
- [ ] Text ist lesbar
- [ ] Styles sind korrekt übernommen

## Erwartete Console-Logs
```
🔄 Generiere PDF mit direkter HTML-zu-PDF Konvertierung (AWS Lambda)...
📄 HTML generiert, Länge: X Zeichen
🚀 Verwende direkte PDF-Generierung (ohne GPT) - wie andere Anwendungen
📡 Sende HTML direkt an PDF-Generator Lambda (ohne GPT): https://...
📦 HTML Content Preview: <!DOCTYPE html>...
📦 Response Content-Type: application/pdf
📦 Response Status: 200 OK
✅ PDF generiert (Base64 dekodiert): X Bytes
```

## Fehlerbehandlung
- [ ] Bei Fehlern: Detaillierte Fehlermeldung in Console
- [ ] Bei Fehlern: Benutzerfreundliche Notification
- [ ] Keine unhandled Exceptions

## Performance
- [ ] PDF-Generierung dauert < 5 Sekunden
- [ ] Keine Timeout-Fehler
- [ ] Lambda-Response ist schnell (< 3 Sekunden)
