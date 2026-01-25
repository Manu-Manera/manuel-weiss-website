# Manueller Test-Guide für Lebenslauf-Editor Fixes

## Vorbereitung

1. **Lokalen Server starten** (falls noch nicht läuft):
   ```bash
   cd "/Users/manumanera/Documents/GitHub/Persönliche Website"
   python3 -m http.server 8080
   ```

2. **Chrome Browser öffnen** und navigiere zu:
   ```
   http://localhost:8080/applications/resume-editor.html
   ```

3. **Browser-Konsole öffnen** (F12 → Console Tab)

## Test-Loop Anleitung

### Schritt 1: Tests ausführen

In der Browser-Konsole ausführen:
```javascript
await window.resumeFixTester.runAllTests()
```

### Schritt 2: Fehlgeschlagene Tests analysieren

Wenn Tests fehlschlagen, werden sie in der Konsole angezeigt. Notiere die fehlgeschlagenen Tests.

### Schritt 3: Manuelle Prüfungen

Für jeden Fix, führe folgende manuelle Prüfungen durch:

#### Test 1: Aufzählungszeichen Einzug
- Öffne Design Editor
- Prüfe ob Aufzählungszeichen den gleichen Einzug wie normaler Text haben
- **Erwartung**: Aufzählungszeichen sollten nicht weiter links sein als Text

#### Test 2: Profilbild X/Y Versatz
- Öffne Design Editor → Images Tab
- Aktiviere Profilbild
- Ändere X-Versatz auf 20%
- Ändere Y-Versatz auf -10%
- **Erwartung**: Bild sollte sich entsprechend verschieben

#### Test 3: Foto-Speicherung beim Upload
- Öffne Design Editor → Images Tab
- Lade ein Profilbild hoch
- Gehe zu Dashboard → Fotos
- **Erwartung**: Hochgeladenes Bild sollte in Fotos-Sektion erscheinen

#### Test 4: Cloud Photos in Foto-Auswahl
- Öffne Design Editor → Images Tab
- Klicke auf "Bewerbungsbild wählen"
- **Erwartung**: Cloud Photos sollten in der Galerie angezeigt werden

#### Test 5: Skills-Laden
- Lade einen Lebenslauf mit Skills
- **Erwartung**: Skills sollten korrekt geladen werden (auch bei verschiedenen Datenstrukturen)

#### Test 6: OCR-Fehlerbehandlung
- Gehe zu PDF-Upload Tab
- Lade eine PDF hoch
- **Erwartung**: Bei Fehlern sollte Fallback verwendet werden, klare Fehlermeldungen

#### Test 7: Website-Link klickbar
- Öffne Design Editor
- Prüfe Preview
- **Erwartung**: Website sollte als klickbarer Link angezeigt werden

#### Test 8: Komma nach Postleitzahl
- Öffne Design Editor
- Prüfe Adresse im Preview
- **Erwartung**: Nach Postleitzahl sollte kein Komma stehen (z.B. "8330 Pfäffikon" nicht "8330, Pfäffikon")

#### Test 9: Geburtsdatum/GitHub-Toggle beim Template-Wechsel
- Öffne Design Editor
- Aktiviere Geburtsdatum und GitHub
- Wechsle Designvorlage
- **Erwartung**: Geburtsdatum und GitHub sollten aktiviert bleiben

#### Test 10: "Lebenslauf"-Position
- Öffne Design Editor → Typography Tab
- Ändere Position des "Lebenslauf"-Schriftzugs
- **Erwartung**: Position sollte sich entsprechend ändern

#### Test 11: Unterschrift Drag & Drop auf Linie
- Öffne Design Editor → Signature Tab
- Aktiviere Unterschrift mit Linie
- Verschiebe Unterschrift per Drag & Drop
- **Erwartung**: Unterschrift sollte genau auf Linie ausgerichtet werden

#### Test 12: Unterschrift Schrägheit
- Öffne Design Editor → Signature Tab
- Ändere Schrägheits-Slider
- **Erwartung**: Unterschrift sollte sich entsprechend neigen

#### Test 13: Unterschriftenlinie Styling
- Öffne Design Editor → Signature Tab
- Ändere Liniendicke und Farbe
- **Erwartung**: Linie sollte sich entsprechend ändern

#### Test 14: Designvorlagen Farben zurücksetzen
- Öffne Design Editor → Templates Tab
- Wechsle zwischen verschiedenen Templates
- **Erwartung**: Farben sollten sich entsprechend dem Template ändern

#### Test 15: Icons im PDF Export
- Öffne Design Editor
- Exportiere als PDF
- **Erwartung**: Icons sollten im PDF sichtbar sein

### Schritt 4: Bei Fehlern korrigieren

Wenn ein Test fehlschlägt:
1. Notiere den Fehler
2. Prüfe den Code in der entsprechenden Datei
3. Korrigiere den Code
4. Führe Tests erneut aus

## Test-Loop Script

Führe dieses Script in der Browser-Konsole aus, um automatisch zu testen, zu analysieren und zu korrigieren:

```javascript
async function testLoop() {
    let iteration = 0;
    const maxIterations = 3;
    
    while (iteration < maxIterations) {
        iteration++;
        console.log(`\n🔄 Test-Loop Iteration ${iteration}/${maxIterations}\n`);
        
        const failedTests = await window.resumeFixTester.runAllTests();
        
        if (failedTests.length === 0) {
            console.log('🎉 Alle Tests bestanden!');
            return true;
        }
        
        console.log(`\n⚠️ ${failedTests.length} Tests fehlgeschlagen.`);
        console.log('Bitte korrigiere die fehlgeschlagenen Tests manuell und führe Tests erneut aus.');
        
        if (iteration < maxIterations) {
            console.log('\nDrücke Enter um fortzufahren...');
            await new Promise(resolve => {
                const input = prompt('Tests korrigiert? (Enter zum Fortfahren, Esc zum Abbrechen)');
                if (input === null) {
                    resolve(false);
                } else {
                    resolve(true);
                }
            });
        }
    }
    
    console.log('⚠️ Maximale Iterationen erreicht.');
    return false;
}

// Führe Test-Loop aus
testLoop();
```
