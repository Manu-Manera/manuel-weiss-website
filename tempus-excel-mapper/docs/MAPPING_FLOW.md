# Mapping-Logik – Tempus Excel Mapper

## Feld-Mapping

### 1. Regelbasiertes Matching (Priorität 1)

Jeder Spaltenname aus der Quell-Excel wird gegen eine vordefinierte Alias-Tabelle geprüft:

| Tempus-Feld | Aliases |
|-------------|---------|
| projects.name | project name, projektname, projekt, project |
| projects.startDate | start date, startdatum, von, start, begin |
| projects.endDate | end date, enddatum, bis, ende, end |
| resources.name | resource name, ressource, ressourcenname, mitarbeiter |
| tasks.name | task, task name, vorgang, aufgabe |
| assignments.projectName | project, projekt |
| assignments.resourceName | resource, ressource |
| ... | (vollständige Liste in mappingEngine.ts) |

**Confidence**: 0.95 (exakt, gleiche Entität) bis 0.7 (fuzzy, andere Entität)

### 2. Fuzzy Matching (Priorität 2)

Für nicht-exakte Matches wird Levenshtein-Distanz berechnet:
- Schwellwert: > 0.7 Ähnlichkeit
- Substring-Matching als zusätzliches Signal
- Confidence wird proportional zur Ähnlichkeit skaliert

### 3. AI-Matching (Priorität 3)

Für verbleibende ungemappte Spalten wird Anthropic Claude eingesetzt:
- Strukturierter Prompt mit Quell-Spalten und Tempus-Schema
- Tool-Use für garantiert parsbare JSON-Responses
- Jeder Vorschlag enthält Confidence und Begründung
- AI-Vorschläge erhalten Status `needs_review` bei < 0.8 Confidence

## Entity-Matching

Für Spalten, die Entitätsnamen enthalten (z.B. Projektname, Ressource):

1. **Exakter Match**: Name aus Excel = Name in Tempus → ID übernehmen
2. **Fuzzy Match**: Levenshtein > 0.75 → Vorschlag mit reduzierter Confidence
3. **Kein Match**: Entity als `create_new` markieren → Nutzer entscheidet

## Confidence-Skala

| Bereich | Bedeutung | Aktion |
|---------|-----------|--------|
| 0.9 – 1.0 | Sehr sicher | Auto-Suggest |
| 0.7 – 0.9 | Wahrscheinlich korrekt | Suggest, Review empfohlen |
| 0.5 – 0.7 | Unsicher | Needs Review |
| < 0.5 | Geringe Übereinstimmung | Nicht vorgeschlagen |

## Validierungsregeln vor Export

1. Pflichtfelder (name) dürfen keine NULL-Werte haben
2. Kritische Mappings (Confidence < 0.5) müssen bestätigt sein
3. Abgelehnte Pflichtfeld-Mappings erzeugen Warnungen
4. Unbestätigte neue Entitäten erzeugen Warnungen
5. Duplikate in Entity-Mappings werden gemeldet
6. Datenqualität: > 50% NULL-Werte werden als Info gemeldet
