# BPMN-Generierung: Fehleranalyse Abwesenheit-Geschichte (19 Zeilen)

## Prozessbeschreibung

Die Geschichte hat **19 Zeilen** mit folgendem Format:
- **Rolle-only**: "Mitarbeitende:r:", "Vorgesetzte:r:", "HR Admin:"
- **Kategorie + Rolle**: "Ferien (Urlaub): Mitarbeitende:r:", "Ferien: Vorgesetzte:r:", "Unbezahlter Urlaub: HRBP:", etc.

Struktur: Allgemeine Abwesenheit (3) → Ferien (3) → Unbezahlter Urlaub (4) → Krankmeldung kurz (3) → Krankmeldung lang (3) → Rückkehr (3).

## Mögliche Fehlerursachen

### 1. **assumptions-TypeError (Code-Bug)**
```javascript
assumptions: (jsonData.assumptions || []).join('\n')
```
Wenn GPT `assumptions` als **String** zurückgibt (nicht Array), wirft `"string".join()` einen TypeError → 500.

### 2. **Komplexe Flow-Struktur**
- "Genehmigt oder lehnt ab" → GPT erstellt Gateways
- 19 Tasks + Gateways → viele Flows
- **Risiko**: Flows referenzieren source/target-IDs, die nicht in elements existieren
- Folge: Ungültiges BPMN oder fehlende Positionen in generateDiXml

### 3. **Task-Namen zu lang**
- Prompt: "max 30 Zeichen"
- Viele Zeilen sind 80–120 Zeichen
- GPT könnte kürzen oder falsche IDs generieren

### 4. **Sonderzeichen**
- "Mitarbeitende:r" (Doppelpunkt)
- "Rückkehr: Mitarbeitende:r:**" (evtl. Tippfehler mit **)
- escapeXml behandelt &, <, >, ", ' – Doppelpunkt ist unkritisch

### 5. **Format-Verwirrung**
- "Ferien (Urlaub):" vs "Ferien:" – unterschiedliche Kategorien
- GPT könnte versuchen, Subprozesse oder parallele Pfade zu modellieren
- Prompt sagt "linearer Hauptpfad" – bei 19 Zeilen mit Kategorien kann GPT unsicher werden

### 6. **Output-Truncation**
- 19 Tasks × ~120 Zeichen ≈ 2300 Zeichen (elements)
- 20+ Flows × ~80 Zeichen ≈ 1600 Zeichen
- Mit Gateways und Struktur: ~5–8 KB JSON
- 65536 Tokens sollte reichen – bei sehr ausführlicher Antwort evtl. Truncation

## Umgesetzte Fixes

1. **assumptions robust**: `Array.isArray(...) ? ... : String(...)` – verhindert TypeError bei String
2. **Flow-Validierung**: Flows mit ungültigen source/target werden entfernt
3. **Element-Bereinigung**: Elemente ohne ID werden gefiltert
4. **Try-Catch**: generateBpmnXmlFromJson-Fehler → Fallback statt 500
5. **Prompt**: Anleitung für Format "Kategorie: Rolle: Tätigkeit" ergänzt
