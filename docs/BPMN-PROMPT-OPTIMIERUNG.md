# BPMN-Prompt Optimierungsanalyse

## Ausgangslage

Der aktuelle SYSTEM_PROMPT in `lambda/text-to-bpmn-gpt52/index.js` funktioniert gut für mittellange Prozesse (bis ~11 Zeilen). Bei 19+ Zeilen kommt es zu Truncation und Fehlern. Die Analyse identifiziert Verbesserungspotenziale aus Sicht BPMN, HR und Prompt Engineering.

---

## 1. Widersprüche und Inkonsistenzen

| Stelle | Problem | Empfehlung |
|--------|---------|------------|
| Regel 2 vs. Zeile 96 | Regel 2: "keine Obergrenze für Zeichenanzahl" vs. FORMAT: "max 50 Zeichen" | Einheitlich: "max 60 Zeichen für Lesbarkeit, bei Bedarf kürzen" |
| Regel 3 | "oder pro Entscheidung ein neuer Pfad mit eindeutiger Beschriftung" – unklar, was "eindeutig" bedeutet | Konkretisieren: "name: 'Ja'/'Nein' oder 'Genehmigt'/'Abgelehnt'" |
| Regel 1 | Leere Zeilen 27–28 (Beispiel entfernt?) | Konkretes Beispiel wieder einfügen |

---

## 2. BPMN-fachliche Lücken

### 2.1 serviceTask vs. userTask

**Aktuell:** Beide Typen genannt, aber keine Entscheidungsregel.

**Problem:** GPT wählt oft userTask, auch bei "läuft automatisch", "System", "Reporting".

**Empfehlung:**
```
- userTask: Menschliche Tätigkeit (erfassen, prüfen, genehmigen, erstellen)
- serviceTask: System-/Automatisierung (z.B. "läuft automatisch", "Reporting", "triggern", "Meldung")
```

### 2.2 Lanes (Swimlanes)

**Aktuell:** Code unterstützt `lanes`, Prompt erwähnt sie nicht.

**Potenzial:** Rollen wie MA, Vorgesetzte:r, HR Admin eignen sich für Lanes.

**Empfehlung:** Optional einführen – "Bei 3+ verschiedenen Rollen: lanes nutzen für bessere Lesbarkeit." Da der Code Lanes bereits verarbeitet, wäre das ein reiner Prompt-Zusatz.

### 2.3 Gateway-Position

**Aktuell:** "Gateway-Nein-Pfad: gleiche col wie Ja-Pfad, aber row+1"

**Problem:** Bei mehreren Gateways kann col-Verteilung unklar werden.

**Empfehlung:** Klarstellen: "Gateway steht NACH dem letzten Task vor der Entscheidung. Ja-Pfad: col+1, Nein-Pfad: row+1, gleiche col."

---

## 3. HR-Domänen-Optimierungen

### 3.1 Rollen-Mapping

**Aktuell:** MA, TL, AL, HR, GF.

**Ergänzung für typische HR-Texte:**
- Mitarbeitende:r / MA
- Vorgesetzte:r / VG
- HR Admin, HRBP, Payroll, Linie

### 3.2 Typische HR-Entscheidungen

**Empfehlung:** Explizite Trigger ergänzen:
- "Genehmigt oder lehnt ab" → Gateway "Genehmigt?"
- "prüft", "entscheidet", "fordert an" → ggf. Gateway
- "läuft automatisch" → serviceTask

### 3.3 Kategorie-Präfixe

**Aktuell:** "Ferien", "Unbezahlter Urlaub" etc. werden als optional erwähnt.

**Empfehlung:** "Kategorie-Präfix (Ferien, Krankmeldung, etc.) kann im Task-Namen weggelassen werden, wenn die Rolle und Tätigkeit klar sind."

---

## 4. Prompt-Engineering-Optimierungen

### 4.1 Regelpriorität

**Empfehlung:** Die wichtigste Regel zuerst und deutlich markieren:
```
REGEL 1 (HÖCHSTE PRIORITÄT): EINE ZEILE = EIN TASK
```

### 4.2 Few-Shot erweitern

**Aktuell:** Ein Beispiel (Recruiting mit Gateway).

**Empfehlung:** Zwei weitere kurze Beispiele:
- Linearer Prozess (3 Zeilen, keine Gateways)
- Lange linearer Prozess (5 Zeilen) im kompakten Format

### 4.3 Negative Beispiele

**Aktuell:** "FALSCH"-Liste vorhanden.

**Empfehlung:** Kontrast ergänzen:
```
FALSCH: "MA: Antrag. VG: Prüft." → 2 Tasks (eine Zeile aufgeteilt)
RICHTIG: "MA: Antrag einreichen. VG: Prüft und genehmigt." → 1 Task pro Zeile
```

### 4.4 Output-Constraint verschärfen

**Empfehlung:** Am Ende des Prompts:
```
Antworte AUSSCHLIESSLICH mit dem JSON-Objekt. Kein Markdown, kein Code-Block, keine Erklärung.
```

### 4.5 Fallback-Strategie

**Empfehlung:** Explizite Fallback-Regel:
```
Bei Unsicherheit: Immer linearer Pfad (row=0, col aufsteigend). Besser ein einfaches korrektes Diagramm als ein komplexes mit Fehlern.
```

---

## 5. Kompaktes JSON

### 5.1 Trigger-Schwelle

**Aktuell:** 12+ Zeilen.

**Empfehlung:** Auf 10+ senken, um Truncation früher zu vermeiden.

### 5.2 endEvent im kompakten Format

**Aktuell:** Beispiel zeigt nur Start und Task_1.

**Empfehlung:** Vollständiges Beispiel mit End-Event, damit das Format klar ist.

---

## 6. Konkrete Änderungsvorschläge (Priorisiert)

### Priorität 1 (sofort umsetzbar)

1. Widerspruch max 50 vs. keine Obergrenze auflösen (einheitlich z.B. max 60 Zeichen).
2. Konkretes Beispiel für Regel 1 ergänzen.
3. serviceTask-Regel ergänzen.
4. Fallback-Strategie ("Bei Unsicherheit: linear") einbauen.

### Priorität 2 (mittelfristig)

5. Kompaktes JSON ab 10 Zeilen.
6. HR-Rollen-Mapping erweitern.
7. Output-Constraint am Ende ("Nur JSON") verstärken.

### Priorität 3 (optional)

8. Lanes für 3+ Rollen vorschlagen.
9. Zweites Few-Shot-Beispiel (linearer Prozess).
10. Gateway-Position präzisieren.

---

## 7. Beispiel für optimierten Regelblock (Regel 1–3)

```
1. VOLLSTÄNDIGKEIT (HÖCHSTE PRIORITÄT): EINE ZEILE = EIN TASK
   - N Zeilen → genau N Tasks. Keine Obergrenze.
   - Alle Tätigkeiten in EINER Zeile (Komma, Punkt, "und") = EIN Task-Name
   - Beispiel: "MA: Abwesenheit erfassen. Zeitraum wählen. Kommentar hinzufügen." → 1 Task "MA: Abwesenheit erfassen, Zeitraum wählen, Kommentar"

2. TASK-NAMEN & TYPEN
   - Format "Rolle: Tätigkeit" (max 60 Zeichen für Lesbarkeit)
   - userTask: Menschliche Tätigkeit (erfassen, prüfen, genehmigen)
   - serviceTask: System/Automatisierung ("läuft automatisch", "Reporting", "triggern")
   - Rollen: MA, VG (Vorgesetzte:r), HR, HRBP, HR Admin, Payroll, GF

3. ENTSCHEIDUNGEN
   - Trigger: "oder", "genehmigt/abgelehnt", "prüft", "entscheidet"
   - exclusiveGateway mit 2 Flows: name "Ja"/"Nein" oder "Genehmigt"/"Abgelehnt"
   - Bei Unsicherheit: Kein Gateway, linearer Pfad (sicherer)
```
