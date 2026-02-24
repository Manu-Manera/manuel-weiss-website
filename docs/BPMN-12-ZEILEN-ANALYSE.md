# BPMN-Generierung: Warum 12 Zeilen scheitern, 10 Zeilen funktionieren

## Analyse (Stand: 2025-02)

### Beobachtung
- **10 Zeilen** (Recruiting bis Vertrag ablegen): funktioniert
- **12 Zeilen** (+ Onboarding, Prozessabschluss): funktioniert NICHT

### Mögliche Ursachen

#### 1. **Output-Truncation (max_completion_tokens)**
- Aktuell: `max_completion_tokens: 16384`
- Mit 12 Schritten: 1 Start + 12 Tasks + 1 End = 14 Elemente, 14 Flows
- JSON-Größe: ~14 × 150 Zeichen (elements) + ~14 × 80 Zeichen (flows) ≈ 3200 Zeichen ≈ 800 Tokens
- **Vermutung**: Eigentlich ausreichend. ABER: GPT könnte bei längeren Prozessen ausführlichere Namen oder zusätzliche Erklärungen produzieren → mehr Output → Truncation.
- **finish_reason === 'length'** würde das bestätigen (wird bereits geloggt).

#### 2. **Prompt-Interpretation**
- Das Beispiel im SYSTEM_PROMPT zeigt nur 6 Tasks (col 1–6).
- Bei 12 Schritten müsste col bis 12 gehen.
- GPT könnte unsicher werden oder das Format bei „vielen“ Schritten ändern.

#### 3. **JSON-Parsing bei abgeschnittener Antwort**
- Wenn die Antwort bei `finish_reason === 'length'` abgeschnitten wird, ist das JSON unvollständig.
- `tryRepairJson` ergänzt fehlende Klammern, kann aber keine fehlenden Elemente/Flows rekonstruieren.
- Folge: `parseJsonResponse` liefert null oder unvollständige Daten → Fallback (einfaches 1-Task-Diagramm).

#### 4. **Layout/Darstellung**
- Mit 12 Tasks in einer Zeile: Breite ≈ 12 × 220px = 2640px.
- BPMN-Diagramm wird sehr breit; bpmn.io könnte Probleme haben.
- Das würde aber erst nach erfolgreicher Generierung auffallen, nicht beim „funktioniert nicht“.

#### 5. **Format „Rolle: A, B, C“**
- Jede Zeile = ein Schritt (ein Task).
- 10 Zeilen → 10 Tasks, 12 Zeilen → 12 Tasks.
- Kein Hinweis auf andere Interpretation.

### Empfohlene Maßnahmen (umgesetzt)

1. **max_completion_tokens erhöht** auf 32768
2. **Prompt erweitert** um explizite Anleitung für Prozesse mit 10+ Schritten (linearer Hauptpfad)
3. **response_format: json_object** aktiviert für valides JSON
4. **Logging verbessert**: finish_reason und content_preview bei Fallback
5. **Test-Skript**: `--recruiting-12` für gezielten Test der 12-Zeilen-Geschichte
