# Valkeen Onboarding - Quick Reference Cards

> Schnelle Übersicht der wichtigsten Konzepte und Begriffe

---

## Card 1: Valkeen & ProSymmetry

```
┌─────────────────────────────────────────────────────────────┐
│                        VALKEEN                               │
├─────────────────────────────────────────────────────────────┤
│  Consulting-Unternehmen | Zürich, Schweiz | 15+ Jahre PPM   │
│                                                              │
│  FOKUS:                                                      │
│  • Resource Portfolio Management (RPM)                       │
│  • Capacity Planning                                         │
│  • Strategic Resource Optimization                           │
│  • Process & Change Management                               │
│                                                              │
│  BRANCHEN: Pharma, MedTech, Finance, PSA, Engineering       │
│                                                              │
│  4 SÄULEN:                                                   │
│  ┌──────────┬──────────┬──────────┬──────────┐              │
│  │Portfolio │ Process  │ Project  │ Resource │              │
│  │   Mgmt   │   Mgmt   │   Mgmt   │   Mgmt   │              │
│  └──────────┴──────────┴──────────┴──────────┘              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      PROSYMMETRY                             │
├─────────────────────────────────────────────────────────────┤
│  Hersteller von Tempus Resource | Strategischer Partner     │
│                                                              │
│  • Gartner Magic Quadrant Leader                            │
│  • Purpose-built Enterprise Resource Management              │
│                                                              │
│  REFERENZEN: Deloitte, Lonza, Helvetia, Intertek,          │
│              Siemens Healthineers                            │
└─────────────────────────────────────────────────────────────┘
```

---

## Card 2: Tempus Resource - Überblick

```
┌─────────────────────────────────────────────────────────────┐
│                    TEMPUS RESOURCE                           │
├─────────────────────────────────────────────────────────────┤
│  Purpose-built Enterprise Resource Management Technology     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  KERNFUNKTIONEN:                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ • Resource Planning & Staffing                       │    │
│  │ • Capacity Planning & Forecasting                    │    │
│  │ • What-If Simulationen & Scenario Analysis           │    │
│  │ • Integriertes BI & Reporting                        │    │
│  │ • Portfolio Management                               │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  HAUPTPERSPEKTIVEN:                                          │
│  ┌──────────────────┐    ┌──────────────────┐               │
│  │ PROJECT MANAGER  │    │ RESOURCE MANAGER │               │
│  │                  │    │                  │               │
│  │ • Projekte       │    │ • Ressourcen     │               │
│  │ • Allocations    │    │ • Kapazität      │               │
│  │ • Requests       │    │ • Verfügbarkeit  │               │
│  └──────────────────┘    └──────────────────┘               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Card 3: Project Manager Workflow

```
┌─────────────────────────────────────────────────────────────┐
│              PROJECT MANAGER WORKFLOW                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────┐                                            │
│  │ 1. PROJEKT  │  Neues Projekt anlegen                     │
│  │   ERSTELLEN │  Attributes konfigurieren                  │
│  └──────┬──────┘                                            │
│         ▼                                                    │
│  ┌─────────────┐                                            │
│  │ 2. DEMAND   │  Ressourcenbedarf definieren               │
│  │   DEFINIEREN│  Skills, Rollen, Zeitraum                  │
│  └──────┬──────┘                                            │
│         ▼                                                    │
│  ┌─────────────┐                                            │
│  │ 3. RESOURCE │  Anfrage an Resource Manager               │
│  │   REQUEST   │  Status: Pending → Approved/Rejected       │
│  └──────┬──────┘                                            │
│         ▼                                                    │
│  ┌─────────────┐                                            │
│  │ 4. ALLOCATION│  Ressourcen zuweisen                      │
│  │   VERWALTEN │  Auslastung tracken                        │
│  └─────────────┘                                            │
│                                                              │
│  PM VIEWS: Grid | Gantt | Kanban                            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Card 4: Resource Manager Workflow

```
┌─────────────────────────────────────────────────────────────┐
│              RESOURCE MANAGER WORKFLOW                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────┐                                            │
│  │ 1. REQUEST  │  Eingehende Anfragen prüfen                │
│  │   EMPFANGEN │  Von Project Managern                      │
│  └──────┬──────┘                                            │
│         ▼                                                    │
│  ┌─────────────┐                                            │
│  │ 2. KAPAZITÄT│  Net Availability prüfen                   │
│  │   PRÜFEN    │  Ressourcenprofile analysieren             │
│  └──────┬──────┘                                            │
│         ▼                                                    │
│  ┌─────────────┐                                            │
│  │ 3. RESSOURCE│  Passende Ressource finden                 │
│  │   FINDEN    │  Skills, Verfügbarkeit, Standort           │
│  └──────┬──────┘                                            │
│         ▼                                                    │
│  ┌─────────────┐                                            │
│  │ 4. REQUEST  │  Approve / Reject / Negotiate              │
│  │   BEANTWORTEN│  Assignment erstellen                     │
│  └─────────────┘                                            │
│                                                              │
│  RM VIEWS: Grid | Net Availability                          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Card 5: Wichtige Begriffe

```
┌─────────────────────────────────────────────────────────────┐
│                   GLOSSAR / KEY TERMS                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ALLOCATION                                                  │
│  Geplante Zuweisung von Ressourcenkapazität zu einem        │
│  Projekt (kann generisch oder spezifisch sein)              │
│                                                              │
│  ASSIGNMENT                                                  │
│  Konkrete Zuweisung einer spezifischen Person               │
│                                                              │
│  DEMAND                                                      │
│  Ressourcenbedarf eines Projekts                            │
│                                                              │
│  CAPACITY                                                    │
│  Verfügbare Arbeitskapazität (z.B. FTE, Stunden)           │
│                                                              │
│  NET AVAILABILITY                                            │
│  Verbleibende Kapazität nach Abzug aller Zuweisungen       │
│                                                              │
│  RESOURCE REQUEST (RR)                                       │
│  Formelle Anfrage des PM an den RM für Ressourcen          │
│                                                              │
│  UTILIZATION                                                 │
│  Auslastungsgrad einer Ressource (%)                        │
│                                                              │
│  FTE (Full-Time Equivalent)                                  │
│  Vollzeitäquivalent - Maßeinheit für Kapazität             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Card 6: BPAFG (Bulk Project Allocation Flatgrid)

```
┌─────────────────────────────────────────────────────────────┐
│                         BPAFG                                │
│          Bulk Project Allocation Flatgrid                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ZWECK: Massenbearbeitung von Ressourcenzuweisungen         │
│                                                              │
│  3 MODI:                                                     │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ DEFAULT MODE                                         │    │
│  │ Standard-Ansicht für allgemeine Zuweisungen         │    │
│  ├─────────────────────────────────────────────────────┤    │
│  │ RM MODE (Resource Manager)                           │    │
│  │ Optimiert für Ressourcen-zentrierte Ansicht         │    │
│  │ Fokus: Wer arbeitet woran?                          │    │
│  ├─────────────────────────────────────────────────────┤    │
│  │ PM MODE (Project Manager)                            │    │
│  │ Optimiert für Projekt-zentrierte Ansicht            │    │
│  │ Fokus: Wer ist meinem Projekt zugewiesen?           │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  NEW ASSIGNMENT MODE: Schnelles Erstellen neuer Zuweisungen │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Card 7: Reporting Optionen

```
┌─────────────────────────────────────────────────────────────┐
│                    REPORTING IN TEMPUS                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  RAR (Resource Allocation Report)                            │
│  ├─ Übersicht aller Ressourcenzuweisungen                   │
│  └─ Basis-Report für Auslastungsanalyse                     │
│                                                              │
│  RAR2 (Resource Allocation Report 2)                         │
│  ├─ Erweiterte Version mit mehr Optionen                    │
│  └─ Detailliertere Filterung und Gruppierung                │
│                                                              │
│  PIVOT GRID                                                  │
│  ├─ Flexible Datenanalyse                                   │
│  ├─ Drag & Drop Dimensionen                                 │
│  └─ Aggregationen und Berechnungen                          │
│                                                              │
│  PORTFOLIO PLANNER                                           │
│  ├─ Strategische Portfolioübersicht                         │
│  ├─ Projekt-Priorisierung                                   │
│  └─ Ressourcen-Engpass-Analyse                              │
│                                                              │
│  DASHBOARDS                                                  │
│  ├─ Individuelle Zusammenstellung                           │
│  ├─ KPIs auf einen Blick                                    │
│  └─ Widgets und Visualisierungen                            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Card 8: What-If Scenario Planning

```
┌─────────────────────────────────────────────────────────────┐
│                 WHAT-IF SCENARIO PLANNING                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ZWECK:                                                      │
│  Simulation verschiedener Szenarien ohne Produktivdaten     │
│  zu verändern                                                │
│                                                              │
│  TYPISCHE SZENARIEN:                                         │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ • Was passiert, wenn Projekt X verschoben wird?     │    │
│  │ • Wie wirkt sich eine Neueinstellung aus?           │    │
│  │ • Was, wenn Budget gekürzt wird?                    │    │
│  │ • Welches Projekt hat Priorität bei Engpass?        │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  WORKFLOW:                                                   │
│  1. Szenario erstellen (Kopie der aktuellen Daten)         │
│  2. Änderungen simulieren                                   │
│  3. Auswirkungen analysieren                                │
│  4. Szenarien vergleichen                                   │
│  5. Entscheidung treffen                                    │
│                                                              │
│  NUTZEN:                                                     │
│  • Risikominimierung                                        │
│  • Bessere Entscheidungsgrundlage                           │
│  • Stakeholder-Kommunikation                                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Card 9: Admin Funktionen

```
┌─────────────────────────────────────────────────────────────┐
│                   ADMIN FUNKTIONEN                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  DATA SYNC                                                   │
│  ├─ Synchronisation mit externen Systemen                   │
│  ├─ Import/Export von Daten                                 │
│  └─ Automatisierte Updates                                  │
│                                                              │
│  ATTRIBUTE MANAGEMENT                                        │
│  ├─ Custom Fields erstellen                                 │
│  ├─ Dropdown-Werte definieren                               │
│  └─ Validierungsregeln                                      │
│                                                              │
│  VIEW MANAGEMENT                                             │
│  ├─ Custom Views erstellen                                  │
│  ├─ Spalten konfigurieren                                   │
│  └─ Filter und Sortierung speichern                         │
│                                                              │
│  SNAPSHOTS                                                   │
│  ├─ Zeitpunkt-Aufnahmen der Daten                          │
│  ├─ Historische Vergleiche                                  │
│  └─ Audit Trail                                             │
│                                                              │
│  SHEETS                                                      │
│  ├─ Tabellarische Datenansichten                           │
│  ├─ Bulk-Bearbeitung                                        │
│  └─ Export-Funktionen                                       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Card 10: Best Practices

```
┌─────────────────────────────────────────────────────────────┐
│            BEST PRACTICES - RESOURCE MANAGEMENT              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. DATENQUALITÄT                                            │
│     • Aktuelle Ressourcenprofile pflegen                    │
│     • Skills regelmäßig aktualisieren                       │
│     • Kapazitäten realistisch planen                        │
│                                                              │
│  2. PROZESSE                                                 │
│     • Klare Request-Workflows definieren                    │
│     • Regelmäßige Kapazitäts-Reviews                        │
│     • Eskalationspfade etablieren                           │
│                                                              │
│  3. KOMMUNIKATION                                            │
│     • Transparenz über Auslastung                           │
│     • Frühzeitige Engpass-Kommunikation                     │
│     • Stakeholder regelmäßig informieren                    │
│                                                              │
│  4. ADOPTION                                                 │
│     • Training für alle Nutzer                              │
│     • Quick Wins identifizieren                             │
│     • Change Management nicht vergessen                     │
│                                                              │
│  5. KONTINUIERLICHE VERBESSERUNG                            │
│     • KPIs definieren und tracken                           │
│     • Feedback sammeln                                      │
│     • Prozesse iterativ optimieren                          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

*Quick Reference Cards - Valkeen Onboarding*  
*Erstellt: 03.03.2026*
