export const phases = [
  {
    id: 1,
    name: "Learning & Integration",
    days: "1-30",
    color: "#6366f1",
    description: "Grundlagen verstehen, Trial navigierbar"
  },
  {
    id: 2,
    name: "Engagement & Impact",
    days: "31-60",
    color: "#8b5cf6",
    description: "PM & RM Demos präsentiert, Client Exposure"
  },
  {
    id: 3,
    name: "Full Integration & Performance",
    days: "61-90",
    color: "#a855f7",
    description: "Alle Demos ready, BPAFG & Admin beherrscht"
  }
];

export const weeks = [
  {
    id: 1,
    phase: 1,
    name: "Grundlagen & Setup",
    days: "1-5",
    tasks: [
      { id: "1-1", text: "Email-Konto einrichten mit Signatur", completed: false },
      { id: "1-2", text: "Microsoft Teams Zugang", completed: false },
      { id: "1-3", text: "Shared Drive Access beantragen", completed: false },
      { id: "1-4", text: "Antivirus installieren", completed: false },
      { id: "1-5", text: "Valkeen Website durcharbeiten", completed: false, link: "https://www.valkeen.com" },
      { id: "1-6", text: "ProSymmetry Website studieren", completed: false, link: "https://www.prosymmetry.com" },
      { id: "1-7", text: "Tempus Resource EU Website (EN & DE)", completed: false },
      { id: "1-8", text: "Video: Intro & Tempus Walkthrough by Marc", completed: false },
      { id: "1-9", text: "McKinsey Artikel: Strategic workforce planning in AI age", completed: false, link: "https://www.mckinsey.com/capabilities/people-and-organizational-performance/our-insights/the-critical-role-of-strategic-workforce-planning-in-the-age-of-ai" }
    ],
    checkpoint: {
      questions: [
        "Alle technischen Zugänge funktionieren?",
        "Kann Valkeen und ProSymmetry in 2 Sätzen erklären?",
        "Erstes Tempus Walkthrough Video abgeschlossen?"
      ]
    }
  },
  {
    id: 2,
    phase: 1,
    name: "Resource Management Grundlagen",
    days: "6-10",
    tasks: [
      { id: "2-1", text: "YouTube Playlist: What is Resource Management?", completed: false, link: "https://www.youtube.com/watch?v=Y-KgXgJgkHg&list=PLYivXGs-R5ARxXVhwLsolpg3a399x329q" },
      { id: "2-2", text: "Feature Documentation: Resource Management", completed: false, link: "https://support.tempusresource.com/hc/en-us/sections/360008404534-Resource-Management" },
      { id: "2-3", text: "Common RM Use Cases lesen", completed: false, link: "https://support.tempusresource.com/hc/en-us/sections/29463185259543-Resource-Manager-Use-Cases" },
      { id: "2-4", text: "Tempus University: 5 Videos abschließen", completed: false, link: "https://www.youtube.com/watch?v=S90uyxySeU8&list=PLYivXGs-R5AS9GdyhbC9RA3ZevqUYBhQp" },
      { id: "2-5", text: "Notizen zu Kernfunktionen erstellen", completed: false },
      { id: "2-6", text: "Trial Environment Zugang einrichten", completed: false },
      { id: "2-7", text: "Erste Navigation durch die UI", completed: false }
    ],
    checkpoint: {
      questions: [
        "Kann die 5 Kernfunktionen von Resource Management erklären?",
        "Trial Environment erfolgreich eingeloggt?",
        "Mindestens 5 Tempus University Videos abgeschlossen?"
      ]
    }
  },
  {
    id: 3,
    phase: 1,
    name: "Project Management in Tempus",
    days: "11-15",
    tasks: [
      { id: "3-1", text: "Video: A Day in the life of a PM", completed: false, link: "https://www.youtube.com/watch?v=EGp-_f491hI" },
      { id: "3-2", text: "Feature Documentation: Project Management", completed: false, link: "https://support.tempusresource.com/hc/en-us/sections/360008493933-Project-Management" },
      { id: "3-3", text: "PM Use Cases lesen", completed: false, link: "https://support.tempusresource.com/hc/en-us/sections/31398381769111-Project-Manager-Use-Cases" },
      { id: "3-4", text: "Creating a Project Use Cases", completed: false, link: "https://support.tempusresource.com/hc/en-us/sections/31398762268183-Creating-a-Project-Use-Cases" },
      { id: "3-5", text: "Comparing Projects Use Cases", completed: false, link: "https://support.tempusresource.com/hc/en-us/sections/31398820653847-Comparing-Projects-Use-Cases" },
      { id: "3-6", text: "3 Case Studies durcharbeiten", completed: false, link: "https://www.prosymmetry.com/case-studies" }
    ],
    checkpoint: {
      questions: [
        "Kann den PM-Workflow in Tempus beschreiben?",
        "3 Case Studies zusammengefasst?",
        "Use Cases dokumentiert?"
      ]
    }
  },
  {
    id: 4,
    phase: 1,
    name: "Team Integration & Konsolidierung",
    days: "16-20",
    tasks: [
      { id: "4-1", text: "Check-in mit Aayushi", completed: false },
      { id: "4-2", text: "Check-in mit Marc", completed: false },
      { id: "4-3", text: "Fortnightly Team Meeting teilnehmen", completed: false },
      { id: "4-4", text: "Eigene Zusammenfassung erstellen (1-2 Seiten)", completed: false },
      { id: "4-5", text: "Offene Fragen dokumentieren", completed: false },
      { id: "4-6", text: "Video: Report Management Walkthrough by Marc", completed: false },
      { id: "4-7", text: "YouTube: Valkeen short video webcasts", completed: false, link: "https://www.youtube.com/playlist?list=PLMus9DSPI_0svRnSk_bcTpHtSamNPlK5-" }
    ],
    checkpoint: {
      questions: [
        "Kann Tempus Resource Demo-Umgebung navigieren?",
        "Versteht RM und PM Grundkonzepte?",
        "Hat regelmäßige Check-ins etabliert?",
        "Kann Valkeen's Wertversprechen erklären?"
      ]
    }
  },
  {
    id: 5,
    phase: 2,
    name: "Fortgeschrittene Module & PM Demo",
    days: "21-30",
    tasks: [
      { id: "5-1", text: "Video: Mastering Hybrid Team Planning", completed: false, link: "https://www.youtube.com/watch?v=OEZI5ZKhztI" },
      { id: "5-2", text: "Team Resource Documentation studieren", completed: false, link: "https://support.tempusresource.com/hc/en-us/sections/25700393128087-Team-Resource" },
      { id: "5-3", text: "PM Demo: Tempus UI Navigation vorbereiten", completed: false },
      { id: "5-4", text: "PM Demo: Projekt erstellen (Attributes & Allocations)", completed: false },
      { id: "5-5", text: "PM Demo: Resources/Demand, RR Status", completed: false },
      { id: "5-6", text: "PM Demo: PM Tile Views (Grid, Gantt, Kanban)", completed: false },
      { id: "5-7", text: "Testprojekt im Trial Environment erstellen", completed: false },
      { id: "5-8", text: "PM Demo intern präsentieren", completed: false }
    ],
    checkpoint: {
      questions: [
        "PM Demo intern präsentiert?",
        "Feedback eingeholt und dokumentiert?",
        "Kann Projekt mit Allocations erstellen?"
      ]
    }
  },
  {
    id: 6,
    phase: 2,
    name: "RM Demo & Client Exposure",
    days: "31-40",
    tasks: [
      { id: "6-1", text: "RM Demo: Resource Requests beantworten", completed: false },
      { id: "6-2", text: "RM Demo: Individual Resource Profile", completed: false },
      { id: "6-3", text: "RM Demo: RM Tile (Grid, Net Availability)", completed: false },
      { id: "6-4", text: "Client Meeting beiwohnen", completed: false },
      { id: "6-5", text: "CC in Email-Kommunikation", completed: false },
      { id: "6-6", text: "Erste Support-Emails (mit Review)", completed: false },
      { id: "6-7", text: "Template/Quick Reference Guide erstellen", completed: false },
      { id: "6-8", text: "Feature Requests Tracking übernehmen", completed: false },
      { id: "6-9", text: "RM Demo intern präsentieren", completed: false }
    ],
    checkpoint: {
      questions: [
        "PM Demo erfolgreich präsentiert?",
        "RM Demo erfolgreich präsentiert?",
        "Erste Client Meetings besucht?",
        "Feature Request Tracking übernommen?",
        "Mindestens 1 Template/Guide erstellt?"
      ]
    }
  },
  {
    id: 7,
    phase: 3,
    name: "Reporting & Portfolio Management",
    days: "41-50",
    tasks: [
      { id: "7-1", text: "RAR, RAR2 verstehen", completed: false },
      { id: "7-2", text: "Pivot Grid beherrschen", completed: false },
      { id: "7-3", text: "Portfolio Planner nutzen", completed: false },
      { id: "7-4", text: "Dashboards erstellen", completed: false },
      { id: "7-5", text: "Video: What If Analysis Walkthrough by Marc", completed: false },
      { id: "7-6", text: "Video: Strategic Portfolio Management", completed: false, link: "https://www.youtube.com/watch?v=0563rDM-1LQ" },
      { id: "7-7", text: "Video: Demand Planning for Strategic Forecasting", completed: false, link: "https://www.youtube.com/watch?v=NhCDn-2ROWQ" },
      { id: "7-8", text: "Portfolio Planning Use Cases", completed: false, link: "https://support.tempusresource.com/hc/en-us/sections/31398406673687-Portfolio-Planning-Use-Cases" },
      { id: "7-9", text: "Tempus What If Documentation", completed: false, link: "https://support.tempusresource.com/hc/en-us/categories/4417922185623-Tempus-What-If-Scenario-Planning" },
      { id: "7-10", text: "What-If Szenario im Trial durchführen", completed: false }
    ],
    checkpoint: {
      questions: [
        "Kann Reports erstellen und erklären?",
        "What-If Szenario durchgeführt?",
        "Portfolio Planner Demo-fähig?"
      ]
    }
  },
  {
    id: 8,
    phase: 3,
    name: "BPAFG Deep Dive & Admin",
    days: "51-60",
    tasks: [
      { id: "8-1", text: "1:1 Live Training Session BPAFG", completed: false },
      { id: "8-2", text: "Video: BPAFG Making Assignments", completed: false, link: "https://www.youtube.com/watch?v=ZN8pvFPSzD0" },
      { id: "8-3", text: "Video: BPAFG Options", completed: false, link: "https://www.youtube.com/watch?v=IlfCjX4Z6rM" },
      { id: "8-4", text: "Best Practices BPAFG Default Mode", completed: false, link: "https://support.tempusresource.com/hc/en-us/community/posts/30716236964375-Best-Practices-for-BPAFG-Default-Mode" },
      { id: "8-5", text: "BPAFG Feature Documentation", completed: false, link: "https://support.tempusresource.com/hc/en-us/sections/4415443644439-Bulk-Project-Allocation-Flatgrid" },
      { id: "8-6", text: "BPAFG: RM Use Cases verstehen", completed: false },
      { id: "8-7", text: "BPAFG: PM Use Cases verstehen", completed: false },
      { id: "8-8", text: "BPAFG: New Assignment Mode verstehen", completed: false },
      { id: "8-9", text: "Admin: Data Sync verstehen", completed: false },
      { id: "8-10", text: "Admin: Attribute Management", completed: false },
      { id: "8-11", text: "Admin: View Management", completed: false },
      { id: "8-12", text: "Admin: Snapshots", completed: false },
      { id: "8-13", text: "Admin: Sheets", completed: false }
    ],
    checkpoint: {
      questions: [
        "Alle 3 Demos (PM, RM, Reporting) präsentationsreif?",
        "BPAFG in allen 3 Modi verstanden?",
        "Admin-Funktionen bekannt?",
        "Bereit für Implementation Shadowing?"
      ]
    }
  },
  {
    id: 9,
    phase: 3,
    name: "Best Practices & Abschluss",
    days: "61-90",
    tasks: [
      { id: "9-1", text: "YouTube: Resource Capacity Planning (Donna Fitzgerald)", completed: false, link: "https://www.youtube.com/watch?v=yNIvXmV0Qnc&list=PLYivXGs-R5AQ09hiQatYW0Cf8lpPbboj6" },
      { id: "9-2", text: "Video: Best Practices Forecasting and Capacity Planning", completed: false, link: "https://www.youtube.com/watch?v=V6UCO95iWgM" },
      { id: "9-3", text: "Video: Pushing RM Up the Slope of Enlightenment", completed: false, link: "https://www.youtube.com/watch?v=6JHn8Bjqp4g" },
      { id: "9-4", text: "Driving Adoption Resources", completed: false, link: "https://support.tempusresource.com/hc/en-us/community/posts/31409082181911-Resources-for-Driving-Adoption-of-Tempus-Resource-Resource-Management" },
      { id: "9-5", text: "Video: Maximizing Strategic Flow with SAFe", completed: false, link: "https://www.youtube.com/watch?v=Et6Cw8IZwLk" },
      { id: "9-6", text: "Best Practices dokumentieren", completed: false },
      { id: "9-7", text: "Implementation Shadowing starten", completed: false }
    ],
    checkpoint: {
      questions: [
        "Best Practices dokumentiert?",
        "Bereit für eigenständige Implementierungen?",
        "Karriereentwicklung besprochen?"
      ]
    }
  }
];

export const quizQuestions = [
  // ============================================
  // WOCHE 1: Grundlagen & Setup (5 Fragen)
  // ============================================
  {
    id: 1,
    week: 1,
    question: "Was macht Valkeen?",
    options: [
      "Softwareentwicklung für Gaming",
      "Consulting für PPM und Resource Management mit Tempus Resource",
      "Cloud-Hosting Services",
      "Marketing-Agentur"
    ],
    correct: 1,
    explanation: "Valkeen ist ein Consulting-Unternehmen mit 15+ Jahren PPM-Erfahrung, spezialisiert auf Resource Portfolio Management und Tempus Resource Implementierungen."
  },
  {
    id: 2,
    week: 1,
    question: "Wer ist ProSymmetry?",
    options: [
      "Ein Konkurrent von Valkeen",
      "Der Hersteller von Tempus Resource und strategischer Partner",
      "Ein Kunde von Valkeen",
      "Eine Beratungsfirma"
    ],
    correct: 1,
    explanation: "ProSymmetry ist der Hersteller von Tempus Resource und strategischer Partner von Valkeen. Sie sind im Gartner Magic Quadrant für Enterprise Resource & Portfolio Management."
  },
  {
    id: 3,
    week: 1,
    question: "In welchem Gartner-Bericht ist ProSymmetry gelistet?",
    options: [
      "Magic Quadrant for CRM",
      "Magic Quadrant for Enterprise Resource & Portfolio Management",
      "Magic Quadrant for Cloud Infrastructure",
      "Magic Quadrant for Data Analytics"
    ],
    correct: 1,
    explanation: "ProSymmetry ist im Gartner Magic Quadrant für Enterprise Resource & Portfolio Management gelistet, was ihre Marktposition im PPM-Bereich unterstreicht."
  },
  {
    id: 4,
    week: 1,
    question: "Laut McKinsey, warum ist Strategic Workforce Planning im KI-Zeitalter besonders wichtig?",
    options: [
      "Weil KI alle Jobs ersetzt",
      "Weil sich Skill-Anforderungen schnell ändern und Unternehmen proaktiv planen müssen",
      "Weil es gesetzlich vorgeschrieben ist",
      "Weil es billiger ist als traditionelle Planung"
    ],
    correct: 1,
    explanation: "McKinsey betont, dass sich durch KI die Skill-Anforderungen rapide ändern. Unternehmen müssen proaktiv ihre Workforce planen, um wettbewerbsfähig zu bleiben."
  },
  {
    id: 5,
    week: 1,
    question: "Was ist das Hauptprodukt von ProSymmetry?",
    options: [
      "Microsoft Project",
      "Tempus Resource",
      "Jira",
      "Asana"
    ],
    correct: 1,
    explanation: "Tempus Resource ist das Hauptprodukt von ProSymmetry - eine Enterprise-Lösung für Resource Portfolio Management."
  },

  // ============================================
  // WOCHE 2: Resource Management Grundlagen (6 Fragen)
  // ============================================
  {
    id: 6,
    week: 2,
    question: "Was sind die Kernfunktionen von Resource Management?",
    options: [
      "Nur Zeiterfassung",
      "Resource Planning, Capacity Planning, Allocation, Demand Management, Skills Management",
      "Nur Projektplanung",
      "Nur Budgetverwaltung"
    ],
    correct: 1,
    explanation: "Resource Management umfasst Resource Planning, Capacity Planning, Resource Allocation, Demand Management und Skills Management."
  },
  {
    id: 7,
    week: 2,
    question: "Was ist der Unterschied zwischen Allocation und Assignment?",
    options: [
      "Es gibt keinen Unterschied",
      "Allocation ist geplante Zuweisung, Assignment ist konkrete Zuweisung einer Person",
      "Assignment ist für Projekte, Allocation für Ressourcen",
      "Allocation ist nur für Manager"
    ],
    correct: 1,
    explanation: "Allocation ist eine geplante Ressourcenzuweisung (kann generisch sein), während Assignment die konkrete Zuweisung einer spezifischen Person bedeutet."
  },
  {
    id: 8,
    week: 2,
    question: "Was versteht man unter 'Capacity Planning'?",
    options: [
      "Die Planung von Büroräumen",
      "Die Planung der verfügbaren Arbeitskapazität von Ressourcen über Zeit",
      "Die Planung von IT-Infrastruktur",
      "Die Planung von Meetings"
    ],
    correct: 1,
    explanation: "Capacity Planning ist die strategische Planung der verfügbaren Arbeitskapazität von Ressourcen über einen bestimmten Zeitraum, um Über- oder Unterauslastung zu vermeiden."
  },
  {
    id: 9,
    week: 2,
    question: "Was ist 'Demand Management' im Kontext von Resource Management?",
    options: [
      "Kundenanfragen bearbeiten",
      "Die Erfassung und Priorisierung von Ressourcenanforderungen aus Projekten",
      "Marketing-Nachfrage analysieren",
      "Lieferkettenmanagement"
    ],
    correct: 1,
    explanation: "Demand Management erfasst und priorisiert Ressourcenanforderungen aus verschiedenen Projekten und Initiativen, um eine optimale Ressourcenverteilung zu ermöglichen."
  },
  {
    id: 10,
    week: 2,
    question: "Warum ist Skills Management wichtig für Resource Management?",
    options: [
      "Um Gehälter zu berechnen",
      "Um die richtigen Ressourcen mit den passenden Fähigkeiten Projekten zuzuweisen",
      "Um Schulungen zu verkaufen",
      "Um Mitarbeiter zu bewerten"
    ],
    correct: 1,
    explanation: "Skills Management ermöglicht es, Ressourcen basierend auf ihren Fähigkeiten optimal Projekten zuzuweisen und Skill-Gaps frühzeitig zu identifizieren."
  },
  {
    id: 11,
    week: 2,
    question: "Was ist ein 'Generic Resource' in Tempus?",
    options: [
      "Ein Praktikant",
      "Ein Platzhalter für eine noch nicht benannte Ressource mit bestimmten Skills",
      "Ein externer Berater",
      "Ein Manager"
    ],
    correct: 1,
    explanation: "Ein Generic Resource ist ein Platzhalter für eine noch nicht identifizierte Person, definiert durch benötigte Skills und Rolle, der später durch eine Named Resource ersetzt wird."
  },

  // ============================================
  // WOCHE 3: Project Management in Tempus (6 Fragen)
  // ============================================
  {
    id: 12,
    week: 3,
    question: "Welche Views stehen einem Project Manager in Tempus zur Verfügung?",
    options: [
      "Nur Grid View",
      "Grid, Gantt, Kanban",
      "Nur Gantt",
      "Nur Kanban"
    ],
    correct: 1,
    explanation: "Project Manager haben Zugriff auf Grid View, Gantt View und Kanban View für verschiedene Perspektiven auf ihre Projekte."
  },
  {
    id: 13,
    week: 3,
    question: "Was ist ein Resource Request (RR)?",
    options: [
      "Eine Urlaubsanfrage",
      "Eine formelle Anfrage des PM an den RM für Ressourcen",
      "Ein Fehlerbericht",
      "Eine Gehaltsanfrage"
    ],
    correct: 1,
    explanation: "Ein Resource Request ist eine formelle Anfrage des Project Managers an den Resource Manager für benötigte Ressourcen mit Status wie Pending, Approved, Rejected."
  },
  {
    id: 14,
    week: 3,
    question: "Welche Status kann ein Resource Request haben?",
    options: [
      "Open, Closed",
      "Pending, Approved, Rejected, Fulfilled",
      "New, In Progress, Done",
      "Draft, Published"
    ],
    correct: 1,
    explanation: "Resource Requests durchlaufen typischerweise die Status: Pending (wartend), Approved (genehmigt), Rejected (abgelehnt) und Fulfilled (erfüllt)."
  },
  {
    id: 15,
    week: 3,
    question: "Was zeigt die Gantt View in Tempus?",
    options: [
      "Nur Ressourcenauslastung",
      "Zeitliche Darstellung von Projekten, Phasen und Zuweisungen auf einer Zeitachse",
      "Nur Budgetinformationen",
      "Nur Teamstruktur"
    ],
    correct: 1,
    explanation: "Die Gantt View zeigt Projekte, Phasen und Ressourcenzuweisungen auf einer Zeitachse, ideal für die Visualisierung von Abhängigkeiten und Timelines."
  },
  {
    id: 16,
    week: 3,
    question: "Wofür ist die Kanban View besonders geeignet?",
    options: [
      "Für Finanzberichte",
      "Für die Visualisierung von Workflow-Status und agiles Arbeiten",
      "Für Ressourcenplanung",
      "Für Zeiterfassung"
    ],
    correct: 1,
    explanation: "Die Kanban View eignet sich besonders für die Visualisierung von Workflow-Status (z.B. To Do, In Progress, Done) und unterstützt agile Arbeitsweisen."
  },
  {
    id: 17,
    week: 3,
    question: "Was sind 'Project Attributes' in Tempus?",
    options: [
      "Nur der Projektname",
      "Konfigurierbare Eigenschaften wie Status, Priorität, Kategorie, Custom Fields",
      "Nur das Budget",
      "Nur die Deadline"
    ],
    correct: 1,
    explanation: "Project Attributes sind konfigurierbare Eigenschaften eines Projekts wie Status, Priorität, Kategorie und benutzerdefinierte Felder, die für Filterung und Reporting genutzt werden."
  },

  // ============================================
  // WOCHE 4: Team Integration (5 Fragen)
  // ============================================
  {
    id: 18,
    week: 4,
    question: "Was ist Net Availability?",
    options: [
      "Die Gesamtkapazität einer Ressource",
      "Die verbleibende Kapazität nach Abzug aller Zuweisungen",
      "Die Urlaubstage",
      "Die Überstunden"
    ],
    correct: 1,
    explanation: "Net Availability zeigt die verbleibende Kapazität einer Ressource nach Abzug aller bestehenden Zuweisungen."
  },
  {
    id: 19,
    week: 4,
    question: "Was ist der Unterschied zwischen Gross Capacity und Net Availability?",
    options: [
      "Es gibt keinen Unterschied",
      "Gross Capacity ist die Gesamtkapazität, Net Availability ist nach Abzug von Zuweisungen",
      "Gross ist für Manager, Net für Mitarbeiter",
      "Gross ist monatlich, Net ist täglich"
    ],
    correct: 1,
    explanation: "Gross Capacity ist die theoretische Gesamtkapazität einer Ressource, während Net Availability die tatsächlich verfügbare Kapazität nach Abzug aller Zuweisungen zeigt."
  },
  {
    id: 20,
    week: 4,
    question: "Was ist ein 'Fortnightly Team Meeting'?",
    options: [
      "Ein tägliches Meeting",
      "Ein alle zwei Wochen stattfindendes Teammeeting",
      "Ein monatliches Meeting",
      "Ein jährliches Meeting"
    ],
    correct: 1,
    explanation: "Ein Fortnightly Meeting findet alle zwei Wochen (14 Tage) statt und dient dem regelmäßigen Austausch im Team."
  },
  {
    id: 21,
    week: 4,
    question: "Warum sind regelmäßige Check-ins mit Kollegen wichtig beim Onboarding?",
    options: [
      "Um Arbeitszeit zu dokumentieren",
      "Um Fragen zu klären, Feedback zu erhalten und sich ins Team zu integrieren",
      "Um Überstunden zu vermeiden",
      "Um Urlaub zu planen"
    ],
    correct: 1,
    explanation: "Regelmäßige Check-ins ermöglichen es, offene Fragen zu klären, wertvolles Feedback zu erhalten und sich schneller ins Team zu integrieren."
  },
  {
    id: 22,
    week: 4,
    question: "Was ist Valkeens Wertversprechen (Value Proposition)?",
    options: [
      "Günstigste Software am Markt",
      "Expertise in PPM & Resource Management mit bewährten Implementierungsmethoden",
      "Schnellste Implementierung",
      "Größtes Team"
    ],
    correct: 1,
    explanation: "Valkeens Wertversprechen basiert auf 15+ Jahren PPM-Expertise, bewährten Implementierungsmethoden und tiefem Produktwissen von Tempus Resource."
  },

  // ============================================
  // WOCHE 5: Fortgeschrittene Module & PM Demo (6 Fragen)
  // ============================================
  {
    id: 23,
    week: 5,
    question: "Was ist BPAFG?",
    options: [
      "Ein Reporting-Tool",
      "Bulk Project Allocation Flatgrid für Massenbearbeitung von Zuweisungen",
      "Ein Admin-Panel",
      "Ein Export-Format"
    ],
    correct: 1,
    explanation: "BPAFG (Bulk Project Allocation Flatgrid) ermöglicht die Massenbearbeitung von Ressourcenzuweisungen in verschiedenen Modi."
  },
  {
    id: 24,
    week: 5,
    question: "Was ist 'Hybrid Team Planning'?",
    options: [
      "Planung für Remote-Arbeit",
      "Kombination von Named Resources und Generic Resources in der Planung",
      "Planung für verschiedene Zeitzonen",
      "Planung für Teilzeit-Mitarbeiter"
    ],
    correct: 1,
    explanation: "Hybrid Team Planning kombiniert Named Resources (konkrete Personen) mit Generic Resources (Platzhalter) für flexible und realistische Ressourcenplanung."
  },
  {
    id: 25,
    week: 5,
    question: "Was sollte eine PM Demo in Tempus mindestens zeigen?",
    options: [
      "Nur die Login-Seite",
      "UI Navigation, Projekt erstellen, Allocations, Resource Requests, verschiedene Views",
      "Nur Berichte",
      "Nur Admin-Einstellungen"
    ],
    correct: 1,
    explanation: "Eine vollständige PM Demo zeigt UI Navigation, Projekterstellung mit Attributes, Allocations, Resource Requests und die verschiedenen Views (Grid, Gantt, Kanban)."
  },
  {
    id: 26,
    week: 5,
    question: "Was ist ein 'Team Resource' in Tempus?",
    options: [
      "Ein einzelner Mitarbeiter",
      "Eine Gruppe von Ressourcen, die als Einheit geplant werden kann",
      "Ein externer Berater",
      "Ein Manager"
    ],
    correct: 1,
    explanation: "Ein Team Resource ist eine Gruppe von Ressourcen, die als Einheit geplant und zugewiesen werden kann, ideal für cross-funktionale Teams."
  },
  {
    id: 27,
    week: 5,
    question: "Warum ist es wichtig, Demos intern zu präsentieren bevor man sie Kunden zeigt?",
    options: [
      "Um Zeit zu sparen",
      "Um Feedback zu erhalten, Fehler zu korrigieren und Selbstvertrauen aufzubauen",
      "Um Kollegen zu beeindrucken",
      "Es ist nicht wichtig"
    ],
    correct: 1,
    explanation: "Interne Demos ermöglichen wertvolles Feedback von erfahrenen Kollegen, helfen Fehler zu identifizieren und bauen Selbstvertrauen für Kundenpräsentationen auf."
  },
  {
    id: 28,
    week: 5,
    question: "Was ist der Unterschied zwischen 'Soft Booking' und 'Hard Booking'?",
    options: [
      "Es gibt keinen Unterschied",
      "Soft Booking ist vorläufig/tentativ, Hard Booking ist bestätigt/verbindlich",
      "Soft ist für interne, Hard für externe Projekte",
      "Soft ist billiger als Hard"
    ],
    correct: 1,
    explanation: "Soft Booking ist eine vorläufige, tentative Zuweisung, während Hard Booking eine bestätigte, verbindliche Ressourcenzuweisung darstellt."
  },

  // ============================================
  // WOCHE 6: RM Demo & Client Exposure (6 Fragen)
  // ============================================
  {
    id: 29,
    week: 6,
    question: "Welche 3 Modi hat BPAFG?",
    options: [
      "Edit, View, Delete",
      "Default Mode, RM Mode, PM Mode",
      "Create, Update, Archive",
      "Simple, Advanced, Expert"
    ],
    correct: 1,
    explanation: "BPAFG hat drei Modi: Default Mode (Standard), RM Mode (Resource Manager-zentriert) und PM Mode (Project Manager-zentriert)."
  },
  {
    id: 30,
    week: 6,
    question: "Was zeigt das 'Individual Resource Profile' in Tempus?",
    options: [
      "Nur den Namen",
      "Alle Informationen einer Ressource: Skills, Zuweisungen, Verfügbarkeit, Historie",
      "Nur das Gehalt",
      "Nur die Abteilung"
    ],
    correct: 1,
    explanation: "Das Individual Resource Profile zeigt alle relevanten Informationen einer Ressource: Skills, aktuelle und geplante Zuweisungen, Verfügbarkeit und Historie."
  },
  {
    id: 31,
    week: 6,
    question: "Was ist ein 'Quick Reference Guide'?",
    options: [
      "Ein ausführliches Handbuch",
      "Eine kompakte Übersicht der wichtigsten Funktionen und Workflows",
      "Ein Video-Tutorial",
      "Ein Glossar"
    ],
    correct: 1,
    explanation: "Ein Quick Reference Guide ist eine kompakte, übersichtliche Zusammenfassung der wichtigsten Funktionen und Workflows für schnelles Nachschlagen."
  },
  {
    id: 32,
    week: 6,
    question: "Warum ist 'Feature Request Tracking' wichtig?",
    options: [
      "Um Bugs zu dokumentieren",
      "Um Kundenwünsche systematisch zu erfassen und an ProSymmetry weiterzuleiten",
      "Um interne Meetings zu planen",
      "Um Rechnungen zu erstellen"
    ],
    correct: 1,
    explanation: "Feature Request Tracking erfasst systematisch Kundenwünsche und Verbesserungsvorschläge, die an ProSymmetry für zukünftige Produktentwicklung weitergeleitet werden."
  },
  {
    id: 33,
    week: 6,
    question: "Was sollte man bei ersten Client Meetings beachten?",
    options: [
      "Möglichst viel reden",
      "Aktiv zuhören, Notizen machen, Fragen stellen und vom Mentor lernen",
      "Sofort Lösungen präsentieren",
      "Nur beobachten ohne Interaktion"
    ],
    correct: 1,
    explanation: "Bei ersten Client Meetings ist aktives Zuhören, Notizen machen und vom Mentor lernen wichtiger als selbst viel zu präsentieren."
  },
  {
    id: 34,
    week: 6,
    question: "Was ist der Unterschied zwischen RM Mode und PM Mode in BPAFG?",
    options: [
      "Es gibt keinen Unterschied",
      "RM Mode zeigt Ressourcen-zentrierte Ansicht, PM Mode zeigt Projekt-zentrierte Ansicht",
      "RM ist für Admins, PM für User",
      "RM ist schneller als PM"
    ],
    correct: 1,
    explanation: "RM Mode bietet eine Ressourcen-zentrierte Ansicht (alle Projekte einer Ressource), während PM Mode eine Projekt-zentrierte Ansicht (alle Ressourcen eines Projekts) zeigt."
  },

  // ============================================
  // WOCHE 7: Reporting & Portfolio Management (6 Fragen)
  // ============================================
  {
    id: 35,
    week: 7,
    question: "Wofür wird What-If Scenario Planning verwendet?",
    options: [
      "Nur für Budgetplanung",
      "Simulation verschiedener Szenarien ohne Produktivdaten zu verändern",
      "Nur für Personalplanung",
      "Nur für Reporting"
    ],
    correct: 1,
    explanation: "What-If Scenario Planning ermöglicht die Simulation verschiedener Szenarien (z.B. Projektverzögerungen, Neueinstellungen) ohne die Produktivdaten zu beeinflussen."
  },
  {
    id: 36,
    week: 7,
    question: "Was ist RAR (Resource Availability Report)?",
    options: [
      "Ein Urlaubsreport",
      "Ein Bericht über die Verfügbarkeit von Ressourcen über Zeit",
      "Ein Finanzreport",
      "Ein Projektstatusreport"
    ],
    correct: 1,
    explanation: "Der RAR (Resource Availability Report) zeigt die Verfügbarkeit von Ressourcen über einen bestimmten Zeitraum und hilft bei der Kapazitätsplanung."
  },
  {
    id: 37,
    week: 7,
    question: "Was ist ein Pivot Grid in Tempus?",
    options: [
      "Ein Diagramm",
      "Eine flexible Tabelle zur mehrdimensionalen Datenanalyse",
      "Ein Formular",
      "Ein Dashboard"
    ],
    correct: 1,
    explanation: "Ein Pivot Grid ist eine flexible Tabelle, die mehrdimensionale Datenanalyse ermöglicht - Daten können nach verschiedenen Dimensionen gruppiert und aggregiert werden."
  },
  {
    id: 38,
    week: 7,
    question: "Was ist der Portfolio Planner?",
    options: [
      "Ein Finanzplanungstool",
      "Ein Tool zur strategischen Planung und Priorisierung von Projekten im Portfolio",
      "Ein Kalender",
      "Ein Kommunikationstool"
    ],
    correct: 1,
    explanation: "Der Portfolio Planner ermöglicht die strategische Planung und Priorisierung von Projekten im Portfolio unter Berücksichtigung von Ressourcen und Constraints."
  },
  {
    id: 39,
    week: 7,
    question: "Welche Szenarien kann man mit What-If Planning simulieren?",
    options: [
      "Nur Budgetänderungen",
      "Projektverzögerungen, Neueinstellungen, Ressourcenabgänge, Prioritätsänderungen",
      "Nur Personaländerungen",
      "Nur Terminverschiebungen"
    ],
    correct: 1,
    explanation: "What-If Planning kann verschiedene Szenarien simulieren: Projektverzögerungen, Neueinstellungen, Ressourcenabgänge, Prioritätsänderungen und deren Auswirkungen."
  },
  {
    id: 40,
    week: 7,
    question: "Was ist 'Demand Planning for Strategic Forecasting'?",
    options: [
      "Kurzfristige Projektplanung",
      "Langfristige Vorhersage von Ressourcenbedarf basierend auf strategischen Initiativen",
      "Tägliche Aufgabenplanung",
      "Budgetplanung"
    ],
    correct: 1,
    explanation: "Demand Planning for Strategic Forecasting ist die langfristige Vorhersage von Ressourcenbedarf basierend auf strategischen Initiativen und Geschäftszielen."
  },

  // ============================================
  // WOCHE 8: BPAFG Deep Dive & Admin (7 Fragen)
  // ============================================
  {
    id: 41,
    week: 8,
    question: "Was ist der 'New Assignment Mode' in BPAFG?",
    options: [
      "Ein Modus zum Löschen von Zuweisungen",
      "Ein Modus zum schnellen Erstellen neuer Ressourcenzuweisungen",
      "Ein Modus zum Exportieren",
      "Ein Modus zum Importieren"
    ],
    correct: 1,
    explanation: "Der New Assignment Mode in BPAFG ermöglicht das schnelle Erstellen neuer Ressourcenzuweisungen direkt im Flatgrid."
  },
  {
    id: 42,
    week: 8,
    question: "Was ist 'Data Sync' in Tempus Admin?",
    options: [
      "Backup erstellen",
      "Synchronisation von Daten zwischen Tempus und externen Systemen",
      "Daten löschen",
      "Daten exportieren"
    ],
    correct: 1,
    explanation: "Data Sync ermöglicht die Synchronisation von Daten zwischen Tempus Resource und externen Systemen wie HR-Systemen oder ERP-Lösungen."
  },
  {
    id: 43,
    week: 8,
    question: "Was ist 'Attribute Management' in Tempus?",
    options: [
      "Benutzerverwaltung",
      "Konfiguration von benutzerdefinierten Feldern und Eigenschaften für Projekte/Ressourcen",
      "Rechteverwaltung",
      "Lizenzverwaltung"
    ],
    correct: 1,
    explanation: "Attribute Management ermöglicht die Konfiguration von benutzerdefinierten Feldern und Eigenschaften für Projekte, Ressourcen und andere Objekte."
  },
  {
    id: 44,
    week: 8,
    question: "Was sind 'Snapshots' in Tempus?",
    options: [
      "Screenshots",
      "Zeitpunktbezogene Kopien des Datenbestands für Vergleiche und Analysen",
      "Fotos von Mitarbeitern",
      "Präsentationsfolien"
    ],
    correct: 1,
    explanation: "Snapshots sind zeitpunktbezogene Kopien des Datenbestands, die für historische Vergleiche, Trendanalysen und Audit-Zwecke verwendet werden."
  },
  {
    id: 45,
    week: 8,
    question: "Was sind 'Sheets' in Tempus?",
    options: [
      "Excel-Dateien",
      "Konfigurierbare Ansichten und Layouts für verschiedene Benutzergruppen",
      "Druckvorlagen",
      "E-Mail-Templates"
    ],
    correct: 1,
    explanation: "Sheets sind konfigurierbare Ansichten und Layouts, die für verschiedene Benutzergruppen und Use Cases angepasst werden können."
  },
  {
    id: 46,
    week: 8,
    question: "Was ist 'View Management'?",
    options: [
      "Bildschirmeinstellungen",
      "Verwaltung und Konfiguration von benutzerdefinierten Ansichten und Filtern",
      "Kameraverwaltung",
      "Präsentationsmodus"
    ],
    correct: 1,
    explanation: "View Management ermöglicht die Verwaltung und Konfiguration von benutzerdefinierten Ansichten, Filtern und Spaltenanordnungen für verschiedene Benutzer."
  },
  {
    id: 47,
    week: 8,
    question: "Was bedeutet 'Implementation Shadowing'?",
    options: [
      "Alleine implementieren",
      "Erfahrene Kollegen bei Kundenimplementierungen begleiten und lernen",
      "Im Schatten arbeiten",
      "Dokumentation schreiben"
    ],
    correct: 1,
    explanation: "Implementation Shadowing bedeutet, erfahrene Kollegen bei Kundenimplementierungen zu begleiten, um praktische Erfahrung zu sammeln und Best Practices zu lernen."
  },

  // ============================================
  // WOCHE 9: Best Practices & Abschluss (6 Fragen)
  // ============================================
  {
    id: 48,
    week: 9,
    question: "Was ist 'Driving Adoption' im Kontext von Tempus Resource?",
    options: [
      "Software verkaufen",
      "Strategien und Maßnahmen zur erfolgreichen Einführung und Nutzung bei Kunden",
      "Updates installieren",
      "Lizenzen verwalten"
    ],
    correct: 1,
    explanation: "Driving Adoption umfasst Strategien und Maßnahmen, um die erfolgreiche Einführung und nachhaltige Nutzung von Tempus Resource bei Kunden sicherzustellen."
  },
  {
    id: 49,
    week: 9,
    question: "Was bedeutet 'Pushing RM Up the Slope of Enlightenment'?",
    options: [
      "Software-Updates durchführen",
      "Resource Management von operativer zu strategischer Reife entwickeln",
      "Mehr Lizenzen verkaufen",
      "Schneller implementieren"
    ],
    correct: 1,
    explanation: "Diese Metapher beschreibt die Entwicklung von Resource Management von einer operativen Funktion zu einer strategischen Capability mit echtem Business Value."
  },
  {
    id: 50,
    week: 9,
    question: "Was ist SAFe im Kontext von Resource Management?",
    options: [
      "Ein Sicherheitsprotokoll",
      "Scaled Agile Framework - ein Framework für agile Skalierung in Unternehmen",
      "Ein Backup-System",
      "Ein Reporting-Tool"
    ],
    correct: 1,
    explanation: "SAFe (Scaled Agile Framework) ist ein Framework für die Skalierung agiler Praktiken in großen Unternehmen, das mit Tempus Resource integriert werden kann."
  },
  {
    id: 51,
    week: 9,
    question: "Was sind Best Practices für Forecasting in Resource Management?",
    options: [
      "Nur historische Daten nutzen",
      "Kombination aus historischen Daten, Pipeline-Informationen und strategischen Plänen",
      "Nur Schätzungen verwenden",
      "Keine Planung machen"
    ],
    correct: 1,
    explanation: "Best Practices für Forecasting kombinieren historische Daten, aktuelle Pipeline-Informationen und strategische Geschäftspläne für realistische Vorhersagen."
  },
  {
    id: 52,
    week: 9,
    question: "Was ist der Unterschied zwischen taktischer und strategischer Ressourcenplanung?",
    options: [
      "Es gibt keinen Unterschied",
      "Taktisch ist kurzfristig (Wochen/Monate), strategisch ist langfristig (Quartale/Jahre)",
      "Taktisch ist für Manager, strategisch für Mitarbeiter",
      "Taktisch ist teurer"
    ],
    correct: 1,
    explanation: "Taktische Planung fokussiert auf kurzfristige Zuweisungen (Wochen/Monate), während strategische Planung langfristige Kapazitäts- und Skill-Entwicklung (Quartale/Jahre) adressiert."
  },
  {
    id: 53,
    week: 9,
    question: "Was sollte am Ende des 90-Tage-Onboardings erreicht sein?",
    options: [
      "Nur die Basics verstehen",
      "Alle Demos präsentationsreif, BPAFG beherrscht, bereit für eigenständige Implementierungen",
      "Nur Dokumentation gelesen",
      "Nur Videos geschaut"
    ],
    correct: 1,
    explanation: "Nach 90 Tagen sollten alle Demos (PM, RM, Reporting) präsentationsreif sein, BPAFG in allen Modi beherrscht werden und die Bereitschaft für eigenständige Implementierungen bestehen."
  },

  // ============================================
  // ZUSÄTZLICHE FORTGESCHRITTENE FRAGEN (Kugelsicher)
  // ============================================

  // WOCHE 1 - Erweitert
  {
    id: 54,
    week: 1,
    question: "Welche EU-spezifische Website muss während des Onboardings studiert werden?",
    options: [
      "Tempus Resource US Website",
      "Tempus Resource EU Website (EN & DE)",
      "ProSymmetry Asia Website",
      "Valkeen Global Website"
    ],
    correct: 1,
    explanation: "Die Tempus Resource EU Website muss in beiden Sprachversionen (Englisch und Deutsch) studiert werden, da Valkeen im europäischen Markt tätig ist."
  },
  {
    id: 55,
    week: 1,
    question: "Wer hat das 'Intro & Tempus Walkthrough' Video erstellt?",
    options: [
      "ProSymmetry Marketing Team",
      "Marc",
      "Aayushi",
      "Donna Fitzgerald"
    ],
    correct: 1,
    explanation: "Marc hat das Intro & Tempus Walkthrough Video erstellt, das als Einstieg in die Tempus Resource Plattform dient."
  },
  {
    id: 56,
    week: 1,
    question: "Wie viele Jahre PPM-Erfahrung hat Valkeen?",
    options: [
      "5+ Jahre",
      "10+ Jahre",
      "15+ Jahre",
      "20+ Jahre"
    ],
    correct: 2,
    explanation: "Valkeen verfügt über mehr als 15 Jahre Erfahrung im Bereich Project Portfolio Management (PPM)."
  },
  {
    id: 57,
    week: 1,
    question: "Was ist der erste Checkpoint nach Woche 1?",
    options: [
      "PM Demo präsentieren",
      "Alle technischen Zugänge funktionieren und Valkeen/ProSymmetry erklären können",
      "BPAFG beherrschen",
      "Client Meeting besuchen"
    ],
    correct: 1,
    explanation: "Der Woche 1 Checkpoint prüft: Funktionieren alle technischen Zugänge? Kann man Valkeen und ProSymmetry in 2 Sätzen erklären? Wurde das erste Walkthrough Video abgeschlossen?"
  },

  // WOCHE 2 - Erweitert
  {
    id: 58,
    week: 2,
    question: "Wie viele Tempus University Videos sollen in Woche 2 abgeschlossen werden?",
    options: [
      "3 Videos",
      "5 Videos",
      "10 Videos",
      "Alle Videos"
    ],
    correct: 1,
    explanation: "In Woche 2 sollen mindestens 5 Tempus University Videos abgeschlossen werden, um die Grundlagen zu verstehen."
  },
  {
    id: 59,
    week: 2,
    question: "Was ist der Unterschied zwischen einer 'Named Resource' und einer 'Generic Resource'?",
    options: [
      "Named ist teurer",
      "Named ist eine konkrete Person, Generic ist ein Platzhalter mit Skills/Rolle",
      "Generic ist für externe Mitarbeiter",
      "Es gibt keinen Unterschied"
    ],
    correct: 1,
    explanation: "Eine Named Resource ist eine konkrete, identifizierte Person, während eine Generic Resource ein Platzhalter ist, der durch benötigte Skills und Rolle definiert wird."
  },
  {
    id: 60,
    week: 2,
    question: "Was sollte man nach dem Studium der RM Feature Documentation tun?",
    options: [
      "Sofort Kunden beraten",
      "Notizen zu Kernfunktionen erstellen",
      "Eine Präsentation halten",
      "Urlaub nehmen"
    ],
    correct: 1,
    explanation: "Nach dem Studium der Dokumentation sollen eigene Notizen zu den Kernfunktionen erstellt werden, um das Gelernte zu festigen."
  },
  {
    id: 61,
    week: 2,
    question: "Was ist 'Utilization' im Resource Management?",
    options: [
      "Die Anzahl der Mitarbeiter",
      "Der Prozentsatz der genutzten Kapazität einer Ressource",
      "Die Anzahl der Projekte",
      "Das Budget"
    ],
    correct: 1,
    explanation: "Utilization (Auslastung) ist der Prozentsatz der genutzten Kapazität einer Ressource im Verhältnis zur verfügbaren Gesamtkapazität."
  },
  {
    id: 62,
    week: 2,
    question: "Was bedeutet 'Overallocation' einer Ressource?",
    options: [
      "Die Ressource hat zu wenig Arbeit",
      "Die Ressource ist über 100% ihrer Kapazität zugewiesen",
      "Die Ressource ist im Urlaub",
      "Die Ressource hat gekündigt"
    ],
    correct: 1,
    explanation: "Overallocation bedeutet, dass eine Ressource über ihre verfügbare Kapazität (>100%) hinaus Projekten zugewiesen wurde - ein kritisches Problem im Resource Management."
  },

  // WOCHE 3 - Erweitert
  {
    id: 63,
    week: 3,
    question: "Welches Video beschreibt 'A Day in the Life of a PM'?",
    options: [
      "Ein Marketing-Video",
      "Ein Video das den typischen Arbeitsalltag eines Project Managers in Tempus zeigt",
      "Ein Schulungsvideo für Admins",
      "Ein Video über Buchhaltung"
    ],
    correct: 1,
    explanation: "Das Video 'A Day in the Life of a PM' zeigt den typischen Arbeitsalltag eines Project Managers und wie er Tempus Resource für seine täglichen Aufgaben nutzt."
  },
  {
    id: 64,
    week: 3,
    question: "Wie viele Case Studies sollen in Woche 3 durchgearbeitet werden?",
    options: [
      "1 Case Study",
      "2 Case Studies",
      "3 Case Studies",
      "5 Case Studies"
    ],
    correct: 2,
    explanation: "In Woche 3 sollen 3 Case Studies von ProSymmetry durchgearbeitet und zusammengefasst werden."
  },
  {
    id: 65,
    week: 3,
    question: "Was ist ein 'Project Phase' in Tempus?",
    options: [
      "Ein Projektbudget",
      "Ein zeitlicher Abschnitt eines Projekts mit eigenen Ressourcenzuweisungen",
      "Ein Projektmanager",
      "Eine Projektbeschreibung"
    ],
    correct: 1,
    explanation: "Eine Project Phase ist ein zeitlicher Abschnitt innerhalb eines Projekts, der eigene Start-/Enddaten und Ressourcenzuweisungen haben kann."
  },
  {
    id: 66,
    week: 3,
    question: "Was ist der Unterschied zwischen 'Comparing Projects' und 'Creating a Project' Use Cases?",
    options: [
      "Es gibt keinen Unterschied",
      "Creating fokussiert auf Projekterstellung, Comparing auf Analyse mehrerer Projekte",
      "Comparing ist für Manager, Creating für Mitarbeiter",
      "Creating ist schwieriger"
    ],
    correct: 1,
    explanation: "Creating a Project Use Cases behandeln die Erstellung neuer Projekte, während Comparing Projects Use Cases die Analyse und den Vergleich mehrerer Projekte behandeln."
  },
  {
    id: 67,
    week: 3,
    question: "Was ist ein 'Project Tile' in Tempus?",
    options: [
      "Ein Bodenbelag",
      "Eine visuelle Kachel-Darstellung eines Projekts mit Kerninformationen",
      "Ein Projektlogo",
      "Eine Projektrechnung"
    ],
    correct: 1,
    explanation: "Ein Project Tile ist eine visuelle Kachel-Darstellung, die Kerninformationen eines Projekts kompakt anzeigt und verschiedene Views (Grid, Gantt, Kanban) unterstützt."
  },

  // WOCHE 4 - Erweitert
  {
    id: 68,
    week: 4,
    question: "Mit welchen zwei Personen sollen in Woche 4 Check-ins stattfinden?",
    options: [
      "CEO und CFO",
      "Aayushi und Marc",
      "HR und IT",
      "Kunden und Partner"
    ],
    correct: 1,
    explanation: "In Woche 4 sollen Check-ins mit Aayushi und Marc stattfinden, um Fortschritte zu besprechen und Fragen zu klären."
  },
  {
    id: 69,
    week: 4,
    question: "Wie lang sollte die eigene Zusammenfassung in Woche 4 sein?",
    options: [
      "Eine halbe Seite",
      "1-2 Seiten",
      "5-10 Seiten",
      "20+ Seiten"
    ],
    correct: 1,
    explanation: "Die eigene Zusammenfassung des Gelernten sollte 1-2 Seiten umfassen und die wichtigsten Erkenntnisse der ersten Wochen dokumentieren."
  },
  {
    id: 70,
    week: 4,
    question: "Wer hat das 'Report Management Walkthrough' Video erstellt?",
    options: [
      "ProSymmetry",
      "Marc",
      "Donna Fitzgerald",
      "Aayushi"
    ],
    correct: 1,
    explanation: "Marc hat das Report Management Walkthrough Video erstellt, das die Reporting-Funktionen von Tempus Resource erklärt."
  },
  {
    id: 71,
    week: 4,
    question: "Was sind die 'Valkeen short video webcasts'?",
    options: [
      "Lange Schulungsvideos",
      "Kurze, fokussierte Videos zu spezifischen Tempus-Themen",
      "Marketing-Werbung",
      "Kundeninterviews"
    ],
    correct: 1,
    explanation: "Die Valkeen short video webcasts sind kurze, fokussierte Videos, die spezifische Funktionen und Best Practices von Tempus Resource behandeln."
  },
  {
    id: 72,
    week: 4,
    question: "Was ist 'Resource Contention'?",
    options: [
      "Ressourcenzufriedenheit",
      "Konflikt wenn mehrere Projekte dieselbe Ressource benötigen",
      "Ressourcenurlaub",
      "Ressourcengehalt"
    ],
    correct: 1,
    explanation: "Resource Contention entsteht, wenn mehrere Projekte gleichzeitig dieselbe Ressource benötigen und um deren Kapazität konkurrieren."
  },

  // WOCHE 5 - Erweitert
  {
    id: 73,
    week: 5,
    question: "Was behandelt das Video 'Mastering Hybrid Team Planning'?",
    options: [
      "Remote-Arbeit",
      "Kombination von Named und Generic Resources für flexible Planung",
      "Teambuilding-Aktivitäten",
      "Gehaltsverhandlungen"
    ],
    correct: 1,
    explanation: "Das Video 'Mastering Hybrid Team Planning' zeigt, wie man Named Resources und Generic Resources kombiniert für flexible und realistische Ressourcenplanung."
  },
  {
    id: 74,
    week: 5,
    question: "Was muss in der PM Demo zu 'Resources/Demand' gezeigt werden?",
    options: [
      "Nur Budgets",
      "Resource Requests und deren Status (RR Status)",
      "Nur Urlaubsanträge",
      "Nur Gehaltsinformationen"
    ],
    correct: 1,
    explanation: "In der PM Demo muss gezeigt werden, wie Resource Requests erstellt werden und wie deren Status (Pending, Approved, Rejected, Fulfilled) verwaltet wird."
  },
  {
    id: 75,
    week: 5,
    question: "Was ist ein 'Testprojekt im Trial Environment'?",
    options: [
      "Ein Kundenprojekt",
      "Ein selbst erstelltes Übungsprojekt in der Demo-Umgebung",
      "Ein Produktionsprojekt",
      "Ein Archivprojekt"
    ],
    correct: 1,
    explanation: "Ein Testprojekt im Trial Environment ist ein selbst erstelltes Übungsprojekt in der Demo-Umgebung, um die gelernten Funktionen praktisch anzuwenden."
  },
  {
    id: 76,
    week: 5,
    question: "Was bedeutet 'Allocation Percentage'?",
    options: [
      "Projektbudget in Prozent",
      "Der Prozentsatz der Arbeitszeit, den eine Ressource einem Projekt widmet",
      "Urlaubstage in Prozent",
      "Überstunden in Prozent"
    ],
    correct: 1,
    explanation: "Allocation Percentage gibt an, welchen Prozentsatz ihrer Arbeitszeit eine Ressource einem bestimmten Projekt oder einer Aufgabe widmet (z.B. 50% = halbe Stelle)."
  },
  {
    id: 77,
    week: 5,
    question: "Was ist der Unterschied zwischen 'Effort' und 'Duration' in der Projektplanung?",
    options: [
      "Es gibt keinen Unterschied",
      "Effort ist die Arbeitsmenge (Stunden), Duration ist die Zeitspanne (Tage/Wochen)",
      "Duration ist wichtiger",
      "Effort ist nur für Manager"
    ],
    correct: 1,
    explanation: "Effort ist die tatsächliche Arbeitsmenge in Stunden/Tagen, während Duration die Zeitspanne ist, über die sich die Arbeit erstreckt. 40h Effort kann 1 Woche oder 2 Wochen Duration haben."
  },

  // WOCHE 6 - Erweitert
  {
    id: 78,
    week: 6,
    question: "Was zeigt die 'RM Tile' Ansicht?",
    options: [
      "Nur Projektinformationen",
      "Grid-Ansicht mit Net Availability und Ressourceninformationen",
      "Nur Finanzberichte",
      "Nur Organigramme"
    ],
    correct: 1,
    explanation: "Die RM Tile zeigt eine Grid-Ansicht mit Net Availability und allen relevanten Ressourceninformationen für Resource Manager."
  },
  {
    id: 79,
    week: 6,
    question: "Was sollte man bei ersten Support-Emails beachten?",
    options: [
      "Sofort ohne Review senden",
      "Mit Review durch erfahrene Kollegen vor dem Senden",
      "Nur auf Deutsch schreiben",
      "Keine Anhänge verwenden"
    ],
    correct: 1,
    explanation: "Erste Support-Emails sollten immer mit Review durch erfahrene Kollegen erfolgen, um Qualität und Professionalität sicherzustellen."
  },
  {
    id: 80,
    week: 6,
    question: "Was bedeutet 'CC in Email-Kommunikation' im Onboarding-Kontext?",
    options: [
      "Emails löschen",
      "In Kopie gesetzt werden bei Kundenkommunikation zum Lernen",
      "Emails weiterleiten",
      "Emails archivieren"
    ],
    correct: 1,
    explanation: "CC (Carbon Copy) in der Kundenkommunikation bedeutet, dass man in Kopie gesetzt wird, um von der Kommunikation zu lernen ohne aktiv beteiligt zu sein."
  },
  {
    id: 81,
    week: 6,
    question: "Was ist ein 'Resource Pool'?",
    options: [
      "Ein Schwimmbad für Mitarbeiter",
      "Eine Gruppe von Ressourcen mit ähnlichen Skills, die gemeinsam verwaltet werden",
      "Ein Budgettopf",
      "Ein Meetingraum"
    ],
    correct: 1,
    explanation: "Ein Resource Pool ist eine Gruppe von Ressourcen mit ähnlichen Skills oder aus derselben Abteilung, die gemeinsam verwaltet und Projekten zugewiesen werden können."
  },
  {
    id: 82,
    week: 6,
    question: "Was ist 'Resource Leveling'?",
    options: [
      "Ressourcen entlassen",
      "Ausgleich von Über-/Unterauslastung durch Umverteilung von Zuweisungen",
      "Ressourcen befördern",
      "Ressourcen einstellen"
    ],
    correct: 1,
    explanation: "Resource Leveling ist der Prozess des Ausgleichs von Über- und Unterauslastung durch Umverteilung oder zeitliche Verschiebung von Ressourcenzuweisungen."
  },

  // WOCHE 7 - Erweitert
  {
    id: 83,
    week: 7,
    question: "Was ist der Unterschied zwischen RAR und RAR2?",
    options: [
      "Es gibt keinen Unterschied",
      "RAR2 ist eine erweiterte Version mit zusätzlichen Analysefunktionen",
      "RAR ist neuer",
      "RAR2 ist nur für Admins"
    ],
    correct: 1,
    explanation: "RAR2 (Resource Availability Report 2) ist eine erweiterte Version des RAR mit zusätzlichen Analysefunktionen und Darstellungsoptionen."
  },
  {
    id: 84,
    week: 7,
    question: "Was kann man mit einem Dashboard in Tempus machen?",
    options: [
      "Nur Emails lesen",
      "KPIs und Metriken visuell darstellen und überwachen",
      "Nur Dokumente speichern",
      "Nur Kalender anzeigen"
    ],
    correct: 1,
    explanation: "Dashboards in Tempus ermöglichen die visuelle Darstellung und Überwachung von KPIs, Metriken und wichtigen Ressourcen-/Projektinformationen."
  },
  {
    id: 85,
    week: 7,
    question: "Wer ist Donna Fitzgerald und warum ist ihr Content relevant?",
    options: [
      "Eine Kundin von Valkeen",
      "Eine Expertin für Resource Capacity Planning mit relevanten Best-Practice-Videos",
      "Eine Mitarbeiterin von ProSymmetry",
      "Eine Konkurrentin"
    ],
    correct: 1,
    explanation: "Donna Fitzgerald ist eine anerkannte Expertin für Resource Capacity Planning, deren Videos wichtige Best Practices und Strategien vermitteln."
  },
  {
    id: 86,
    week: 7,
    question: "Was ist ein 'Scenario' in What-If Planning?",
    options: [
      "Ein Backup",
      "Eine hypothetische Situation zur Simulation von Auswirkungen",
      "Ein Bericht",
      "Ein Kalender"
    ],
    correct: 1,
    explanation: "Ein Scenario ist eine hypothetische Situation (z.B. 'Was wenn Projekt X verzögert wird?'), deren Auswirkungen simuliert werden können ohne Produktivdaten zu ändern."
  },
  {
    id: 87,
    week: 7,
    question: "Was ist 'Portfolio Prioritization'?",
    options: [
      "Projekte löschen",
      "Projekte nach strategischer Wichtigkeit und Ressourcenverfügbarkeit ordnen",
      "Projekte kopieren",
      "Projekte archivieren"
    ],
    correct: 1,
    explanation: "Portfolio Prioritization ist der Prozess, Projekte nach strategischer Wichtigkeit, Business Value und Ressourcenverfügbarkeit zu ordnen und zu priorisieren."
  },
  {
    id: 88,
    week: 7,
    question: "Was ist 'Capacity vs. Demand Analysis'?",
    options: [
      "Budgetvergleich",
      "Vergleich der verfügbaren Ressourcenkapazität mit dem Ressourcenbedarf",
      "Gehaltsvergleich",
      "Urlaubsvergleich"
    ],
    correct: 1,
    explanation: "Capacity vs. Demand Analysis vergleicht die verfügbare Ressourcenkapazität mit dem Ressourcenbedarf aus Projekten, um Engpässe oder Überkapazitäten zu identifizieren."
  },

  // WOCHE 8 - Erweitert
  {
    id: 89,
    week: 8,
    question: "Was ist ein '1:1 Live Training Session BPAFG'?",
    options: [
      "Ein Online-Kurs",
      "Eine persönliche Schulung mit einem erfahrenen Kollegen zu BPAFG",
      "Ein Selbststudium",
      "Ein Gruppenkurs"
    ],
    correct: 1,
    explanation: "Die 1:1 Live Training Session ist eine persönliche, individuelle Schulung mit einem erfahrenen Kollegen, um BPAFG hands-on zu lernen."
  },
  {
    id: 90,
    week: 8,
    question: "Was sind 'BPAFG Options'?",
    options: [
      "Aktienoptionen",
      "Konfigurationseinstellungen für das Verhalten des Bulk Project Allocation Flatgrid",
      "Urlaubsoptionen",
      "Gehaltsoptionen"
    ],
    correct: 1,
    explanation: "BPAFG Options sind Konfigurationseinstellungen, die das Verhalten und die Darstellung des Bulk Project Allocation Flatgrid anpassen."
  },
  {
    id: 91,
    week: 8,
    question: "Was ist 'Role-Based Access Control' in Tempus Admin?",
    options: [
      "Rollstuhlzugang",
      "Berechtigungssteuerung basierend auf Benutzerrollen (PM, RM, Admin)",
      "Rollenspiele",
      "Rollentausch"
    ],
    correct: 1,
    explanation: "Role-Based Access Control steuert, welche Funktionen und Daten ein Benutzer basierend auf seiner Rolle (PM, RM, Admin, etc.) sehen und bearbeiten kann."
  },
  {
    id: 92,
    week: 8,
    question: "Was ist der Zweck von 'Snapshots' für Audit-Zwecke?",
    options: [
      "Fotos machen",
      "Nachvollziehbarkeit von Änderungen und historische Dokumentation",
      "Screenshots erstellen",
      "Videos aufnehmen"
    ],
    correct: 1,
    explanation: "Snapshots dienen der Nachvollziehbarkeit von Änderungen und historischen Dokumentation - wichtig für Audits, Compliance und Trendanalysen."
  },
  {
    id: 93,
    week: 8,
    question: "Was ist 'Integration' im Kontext von Data Sync?",
    options: [
      "Teambuilding",
      "Verbindung von Tempus mit externen Systemen wie HR, ERP, PPM-Tools",
      "Mitarbeiterintegration",
      "Kulturelle Integration"
    ],
    correct: 1,
    explanation: "Integration bedeutet die Verbindung von Tempus Resource mit externen Systemen wie HR-Systemen, ERP-Lösungen oder anderen PPM-Tools für automatisierten Datenaustausch."
  },
  {
    id: 94,
    week: 8,
    question: "Was ist ein 'Custom Attribute' in Tempus?",
    options: [
      "Ein Standardfeld",
      "Ein benutzerdefiniertes Feld für spezifische Kundenanforderungen",
      "Ein Pflichtfeld",
      "Ein verstecktes Feld"
    ],
    correct: 1,
    explanation: "Custom Attributes sind benutzerdefinierte Felder, die für spezifische Kundenanforderungen erstellt werden können (z.B. Kostenstelle, Region, Skill-Level)."
  },

  // WOCHE 9 - Erweitert
  {
    id: 95,
    week: 9,
    question: "Was ist der 'Gartner Hype Cycle' und wie bezieht er sich auf 'Slope of Enlightenment'?",
    options: [
      "Ein Fahrrad",
      "Ein Modell das zeigt wie Technologien von Hype zu produktiver Nutzung reifen",
      "Ein Marketingkonzept",
      "Ein Schulungsprogramm"
    ],
    correct: 1,
    explanation: "Der Gartner Hype Cycle zeigt, wie Technologien von initialem Hype durch ein 'Tal der Enttäuschung' zum 'Slope of Enlightenment' (produktive Reife) gelangen."
  },
  {
    id: 96,
    week: 9,
    question: "Was ist 'Change Management' im Kontext von Driving Adoption?",
    options: [
      "Geld wechseln",
      "Begleitung von Organisationen bei der Einführung neuer Prozesse und Tools",
      "Kleidung wechseln",
      "Büro wechseln"
    ],
    correct: 1,
    explanation: "Change Management begleitet Organisationen bei der Einführung neuer Prozesse und Tools wie Tempus Resource, um Akzeptanz und nachhaltige Nutzung sicherzustellen."
  },
  {
    id: 97,
    week: 9,
    question: "Was sind 'Agile Release Trains' (ARTs) in SAFe?",
    options: [
      "Züge für Mitarbeiter",
      "Teams von Teams die gemeinsam an einem Value Stream arbeiten",
      "Software-Updates",
      "Schulungsprogramme"
    ],
    correct: 1,
    explanation: "Agile Release Trains (ARTs) sind in SAFe Teams von Teams (50-125 Personen), die gemeinsam an einem Value Stream arbeiten und synchronisiert liefern."
  },
  {
    id: 98,
    week: 9,
    question: "Was ist 'Resource Management Maturity'?",
    options: [
      "Alter der Mitarbeiter",
      "Der Reifegrad der RM-Praktiken einer Organisation (von Ad-hoc bis Optimiert)",
      "Erfahrung des Managers",
      "Größe des Teams"
    ],
    correct: 1,
    explanation: "Resource Management Maturity beschreibt den Reifegrad der RM-Praktiken einer Organisation - von Ad-hoc/reaktiv bis zu optimiert/strategisch."
  },
  {
    id: 99,
    week: 9,
    question: "Was ist 'Continuous Improvement' im Kontext von Best Practices?",
    options: [
      "Einmalige Verbesserung",
      "Fortlaufende Optimierung von Prozessen basierend auf Feedback und Metriken",
      "Keine Veränderung",
      "Radikale Umstellung"
    ],
    correct: 1,
    explanation: "Continuous Improvement ist die fortlaufende, iterative Optimierung von Prozessen und Praktiken basierend auf Feedback, Metriken und Lessons Learned."
  },
  {
    id: 100,
    week: 9,
    question: "Was sind die drei Phasen des 90-Tage-Onboardings?",
    options: [
      "Start, Mitte, Ende",
      "Learning & Integration, Engagement & Impact, Full Integration & Performance",
      "Theorie, Praxis, Test",
      "Lesen, Schreiben, Präsentieren"
    ],
    correct: 1,
    explanation: "Die drei Phasen sind: Phase 1 (Tag 1-30): Learning & Integration, Phase 2 (Tag 31-60): Engagement & Impact, Phase 3 (Tag 61-90): Full Integration & Performance."
  },

  // BONUS: Übergreifende schwierige Fragen
  {
    id: 101,
    week: 5,
    question: "Was ist 'Time Phased Data' in der Ressourcenplanung?",
    options: [
      "Veraltete Daten",
      "Daten die über Zeitperioden (Wochen/Monate) verteilt dargestellt werden",
      "Echtzeit-Daten",
      "Archivierte Daten"
    ],
    correct: 1,
    explanation: "Time Phased Data zeigt Ressourcenzuweisungen, Kapazität und Auslastung verteilt über Zeitperioden (z.B. Wochen, Monate), um zeitliche Muster zu erkennen."
  },
  {
    id: 102,
    week: 6,
    question: "Was ist 'Bench Time' im Resource Management?",
    options: [
      "Pausenzeit",
      "Zeit in der eine Ressource keinem Projekt zugewiesen ist",
      "Überstunden",
      "Urlaubszeit"
    ],
    correct: 1,
    explanation: "Bench Time ist die Zeit, in der eine Ressource verfügbar ist aber keinem Projekt zugewiesen wurde - oft ein Kostenfaktor der minimiert werden soll."
  },
  {
    id: 103,
    week: 7,
    question: "Was ist 'Rolling Wave Planning'?",
    options: [
      "Wellenreiten",
      "Detaillierte Planung für nahe Zukunft, grobe Planung für ferne Zukunft",
      "Keine Planung",
      "Einmalige Planung"
    ],
    correct: 1,
    explanation: "Rolling Wave Planning bedeutet detaillierte Planung für die nahe Zukunft und grobe Planung für die ferne Zukunft, die kontinuierlich verfeinert wird."
  },
  {
    id: 104,
    week: 8,
    question: "Was ist 'Baseline' in der Projektplanung?",
    options: [
      "Eine Linie am Boden",
      "Der ursprünglich genehmigte Plan als Referenz für Vergleiche",
      "Die letzte Version",
      "Ein Entwurf"
    ],
    correct: 1,
    explanation: "Eine Baseline ist der ursprünglich genehmigte Plan (Zeitplan, Budget, Ressourcen), der als Referenz für Vergleiche und Abweichungsanalysen dient."
  },
  {
    id: 105,
    week: 9,
    question: "Was ist 'Resource Forecasting Accuracy'?",
    options: [
      "Wettervorhersage",
      "Die Genauigkeit von Vorhersagen über zukünftigen Ressourcenbedarf",
      "GPS-Genauigkeit",
      "Zeitgenauigkeit"
    ],
    correct: 1,
    explanation: "Resource Forecasting Accuracy misst, wie genau Vorhersagen über zukünftigen Ressourcenbedarf im Vergleich zum tatsächlichen Bedarf waren - ein wichtiger KPI."
  }
];

export const resources = [
  {
    category: "Allgemein",
    items: [
      { name: "Valkeen Website", url: "https://www.valkeen.com", type: "website" },
      { name: "ProSymmetry Website", url: "https://www.prosymmetry.com", type: "website" },
      { name: "McKinsey: Strategic Workforce Planning", url: "https://www.mckinsey.com/capabilities/people-and-organizational-performance/our-insights/the-critical-role-of-strategic-workforce-planning-in-the-age-of-ai", type: "article" },
      { name: "Tempus University", url: "https://www.youtube.com/watch?v=S90uyxySeU8&list=PLYivXGs-R5AS9GdyhbC9RA3ZevqUYBhQp", type: "video" },
      { name: "Case Studies", url: "https://www.prosymmetry.com/case-studies", type: "article" },
      { name: "Valkeen Webcasts", url: "https://www.youtube.com/playlist?list=PLMus9DSPI_0svRnSk_bcTpHtSamNPlK5-", type: "video" }
    ]
  },
  {
    category: "Resource Management",
    items: [
      { name: "What is Resource Management?", url: "https://www.youtube.com/watch?v=Y-KgXgJgkHg&list=PLYivXGs-R5ARxXVhwLsolpg3a399x329q", type: "video" },
      { name: "Feature Documentation - RM", url: "https://support.tempusresource.com/hc/en-us/sections/360008404534-Resource-Management", type: "docs" },
      { name: "Common RM Use Cases", url: "https://support.tempusresource.com/hc/en-us/sections/29463185259543-Resource-Manager-Use-Cases", type: "docs" },
      { name: "Mastering Hybrid Team Planning", url: "https://www.youtube.com/watch?v=OEZI5ZKhztI", type: "video" },
      { name: "Team Resource", url: "https://support.tempusresource.com/hc/en-us/sections/25700393128087-Team-Resource", type: "docs" }
    ]
  },
  {
    category: "Project Management",
    items: [
      { name: "A Day in the life of a PM", url: "https://www.youtube.com/watch?v=EGp-_f491hI", type: "video" },
      { name: "Feature Documentation - PM", url: "https://support.tempusresource.com/hc/en-us/sections/360008493933-Project-Management", type: "docs" },
      { name: "PM Use Cases", url: "https://support.tempusresource.com/hc/en-us/sections/31398381769111-Project-Manager-Use-Cases", type: "docs" },
      { name: "Creating a Project Use Cases", url: "https://support.tempusresource.com/hc/en-us/sections/31398762268183-Creating-a-Project-Use-Cases", type: "docs" },
      { name: "Comparing Projects Use Cases", url: "https://support.tempusresource.com/hc/en-us/sections/31398820653847-Comparing-Projects-Use-Cases", type: "docs" }
    ]
  },
  {
    category: "BPAFG",
    items: [
      { name: "BPAFG Making Assignments", url: "https://www.youtube.com/watch?v=ZN8pvFPSzD0", type: "video" },
      { name: "BPAFG Options", url: "https://www.youtube.com/watch?v=IlfCjX4Z6rM", type: "video" },
      { name: "BPAFG Feature Documentation", url: "https://support.tempusresource.com/hc/en-us/sections/4415443644439-Bulk-Project-Allocation-Flatgrid", type: "docs" },
      { name: "Best Practices BPAFG", url: "https://support.tempusresource.com/hc/en-us/community/posts/30716236964375-Best-Practices-for-BPAFG-Default-Mode", type: "docs" }
    ]
  },
  {
    category: "Portfolio Management",
    items: [
      { name: "Strategic Portfolio Management", url: "https://www.youtube.com/watch?v=0563rDM-1LQ", type: "video" },
      { name: "Demand Planning for Strategic Forecasting", url: "https://www.youtube.com/watch?v=NhCDn-2ROWQ", type: "video" },
      { name: "Portfolio Planning Use Cases", url: "https://support.tempusresource.com/hc/en-us/sections/31398406673687-Portfolio-Planning-Use-Cases", type: "docs" },
      { name: "Tempus What If Scenario Planning", url: "https://support.tempusresource.com/hc/en-us/categories/4417922185623-Tempus-What-If-Scenario-Planning", type: "docs" }
    ]
  },
  {
    category: "Best Practices",
    items: [
      { name: "Resource Capacity Planning (Donna Fitzgerald)", url: "https://www.youtube.com/watch?v=yNIvXmV0Qnc&list=PLYivXGs-R5AQ09hiQatYW0Cf8lpPbboj6", type: "video" },
      { name: "Best Practices Forecasting", url: "https://www.youtube.com/watch?v=V6UCO95iWgM", type: "video" },
      { name: "Pushing RM Up the Slope of Enlightenment", url: "https://www.youtube.com/watch?v=6JHn8Bjqp4g", type: "video" },
      { name: "Driving Adoption Resources", url: "https://support.tempusresource.com/hc/en-us/community/posts/31409082181911-Resources-for-Driving-Adoption-of-Tempus-Resource-Resource-Management", type: "docs" },
      { name: "Maximizing Strategic Flow with SAFe", url: "https://www.youtube.com/watch?v=Et6Cw8IZwLk", type: "video" }
    ]
  }
];

export const milestones = [
  { day: 5, title: "Woche 1 Checkpoint", description: "Technisches Setup & Unternehmensverständnis" },
  { day: 10, title: "Woche 2 Checkpoint", description: "Resource Management Grundlagen" },
  { day: 15, title: "Woche 3 Checkpoint", description: "Project Management in Tempus" },
  { day: 20, title: "Woche 4 Checkpoint", description: "Team Integration" },
  { day: 30, title: "Phase 1 Abschluss", description: "Learning & Integration abgeschlossen" },
  { day: 40, title: "PM Demo", description: "Project Manager Demo präsentieren" },
  { day: 50, title: "RM Demo", description: "Resource Manager Demo präsentieren" },
  { day: 60, title: "Phase 2 Abschluss", description: "Engagement & Impact abgeschlossen" },
  { day: 70, title: "Reporting Demo", description: "Reporting & Portfolio Demo" },
  { day: 80, title: "BPAFG Zertifizierung", description: "BPAFG in allen Modi beherrscht" },
  { day: 90, title: "Onboarding Abschluss", description: "Bereit für Implementation Shadowing" }
];
