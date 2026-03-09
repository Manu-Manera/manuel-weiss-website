# Architektur – Tempus Excel Mapper

## Überblick

```
┌──────────────────────────────────────────────────────────────────────┐
│                         Frontend (React + TS)                        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │ Settings │→│  Upload  │→│ Analysis │→│ Mapping  │→│  Export  │  │
│  │  Panel   │ │  Panel   │ │  View    │ │  Review  │ │  Panel   │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
│       ↕ API Client (fetch)                                          │
├──────────────────────────────────────────────────────────────────────┤
│                         Backend (Express + TS)                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    REST API Routes                            │   │
│  │  /config  /upload  /sessions/:id/sync-tempus                 │   │
│  │  /sessions/:id/generate-mappings  /sessions/:id/export       │   │
│  └──────────────────────────────────────────────────────────────┘   │
│       ↕                    ↕                    ↕                    │
│  ┌──────────┐     ┌──────────────┐     ┌──────────────┐            │
│  │  Excel   │     │   Mapping    │     │    Export     │            │
│  │  Parser  │     │   Engine     │     │   Service    │            │
│  └──────────┘     └──────────────┘     └──────────────┘            │
│       ↕                    ↕                                        │
│  ┌──────────┐     ┌──────────────┐                                  │
│  │ Anthropic│     │   Tempus     │                                  │
│  │  Client  │     │   Client     │                                  │
│  └──────────┘     └──────────────┘                                  │
│       ↕                    ↕                                        │
├──────────────────────────────────────────────────────────────────────┤
│    Anthropic API              Tempus REST API                        │
│    (Claude Sonnet)            (/api/sg/v1/*)                         │
└──────────────────────────────────────────────────────────────────────┘
```

## Datenfluss

```
Excel Upload → Parse (ExcelJS) → Structure Analysis → AI Analysis (optional)
     ↓                                                       ↓
  ParsedExcel                                         AnalysisResult
     ↓                                                       ↓
  Tempus Sync ────────────────────────────→ TempusData       ↓
     ↓                                          ↓            ↓
  Mapping Engine ← ← ← ← ← ← ← ← ← ← ← ← ←┘ ← ← ← ← ←┘
     ↓
  MappingResult (FieldMappings + EntityMappings + Confidence Scores)
     ↓
  User Confirmation (einzeln oder bulk)
     ↓
  Validation (Konsistenz, Pflichtfelder, Konflikte)
     ↓
  Export Service → Tempus-kompatible Excel + Mapping-Report
```

## Module

### server/services/excelParser.ts
- Robustes Parsing mit ExcelJS
- Dynamische Header-Erkennung (scannt erste 10 Zeilen)
- Normalisierung von Zelltypen (Dates, RichText, Formeln)
- Spalten-Typ-Inferenz aus Daten
- Heuristik zur Entity-Erkennung (Projekt/Ressource/Task/etc.)

### server/services/anthropicClient.ts
- Strukturierte AI-Analyse via Claude Tool-Use
- `analyzeStructure()`: Klassifiziert Spalten und erkennt Tempus-Entitäten
- `generateMappingSuggestions()`: Erzeugt Mapping-Vorschläge mit Begründungen
- JSON-Schema-basierte Responses (keine freien Texte in der Kernlogik)
- Fehlertoleranz: Fallback auf regelbasierte Analyse bei AI-Fehler

### server/services/mappingEngine.ts
- Dreistufiger Mapping-Prozess:
  1. **Regelbasiert**: Exakte und Alias-Matches gegen vordefinierte Feldnamen
  2. **Fuzzy**: Levenshtein-basierte Ähnlichkeit für unsichere Matches
  3. **AI-gestützt**: Anthropic Claude für verbleibende unmapped Spalten
- Entity-Value-Matching: Quellwerte gegen vorhandene Tempus-IDs
- Confidence Scores (0–1) für jeden Vorschlag
- Status-Tracking: suggested → confirmed/rejected/needs_review/create_new

### server/services/exportService.ts
- Validierung: Pflichtfelder, Konsistenz, unbestätigte Mappings
- Excel-Generierung: Ein Sheet pro Ziel-Entität mit korrekten Tempus-Feldnamen
- Datums-Normalisierung (verschiedene Quellformate → ISO)
- Entity-ID-Auflösung (Name → Tempus-ID)
- Mapping-Report als separates Sheet

### server/services/tempusClient.ts
- TypeScript-Client für alle relevanten Tempus API Endpunkte
- Paginierte Datenabfrage (fetchAll)
- Paralleles Laden aller Entitätstypen
- Fehlerbehandlung mit sprechenden Fehlermeldungen

## Mapping-Status-Übergänge

```
                    ┌─────────────┐
                    │  suggested   │ ← Initiale AI/Regel-Vorschläge
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              ↓            ↓            ↓
     ┌────────────┐ ┌────────────┐ ┌────────────┐
     │ confirmed  │ │  rejected  │ │needs_review│
     └────────────┘ └────────────┘ └─────┬──────┘
                                         │
                                    ┌────┴────┐
                                    ↓         ↓
                              confirmed   rejected
```

Zusätzlich: `create_new` für Entitäten, die in Tempus nicht existieren.

## Sicherheitsaspekte

- API-Keys werden nur im Server-Speicher gehalten (kein Disk-Persistenz)
- Keys werden nicht geloggt
- Excel-Dateien werden im RAM verarbeitet (kein Disk-Schreiben)
- Sessions laufen automatisch nach 30 Min ab
- CORS aktiviert für Entwicklung
- Kein Credential-Hardcoding im Code
