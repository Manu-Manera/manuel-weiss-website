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

// ============================================
// STORYBASIERTE PRAXISÜBUNGEN PRO WOCHE
// ============================================
export const practiceExercises = [
  // ============================================
  // WOCHE 1: Grundlagen & Setup
  // ============================================
  {
    week: 1,
    title: "Grundlagen & Unternehmensverständnis",
    exercises: [
      {
        id: "w1-e1",
        difficulty: 1,
        title: "Der Elevator Pitch",
        scenario: "Du triffst im Aufzug den CEO eines potenziellen Kunden. Er fragt: 'Was macht Valkeen eigentlich?'",
        task: "Formuliere einen 30-Sekunden Elevator Pitch, der Valkeen und den Mehrwert von Tempus Resource erklärt.",
        hints: ["15+ Jahre PPM-Erfahrung", "Tempus Resource als Lösung", "Resource Portfolio Management"],
        expectedAnswer: "Valkeen ist ein Consulting-Unternehmen mit über 15 Jahren Erfahrung im Project Portfolio Management. Wir helfen Unternehmen, ihre Ressourcen optimal einzusetzen - mit Tempus Resource, einer führenden Enterprise-Lösung für Resource Portfolio Management, die im Gartner Magic Quadrant gelistet ist.",
        skills: ["Kommunikation", "Produktwissen"]
      },
      {
        id: "w1-e2",
        difficulty: 1,
        title: "Partner-Verständnis",
        scenario: "Ein Kollege fragt dich, warum ProSymmetry wichtig für Valkeen ist.",
        task: "Erkläre die Beziehung zwischen Valkeen und ProSymmetry in 2-3 Sätzen.",
        hints: ["Hersteller vs. Implementierungspartner", "Strategische Partnerschaft", "Gartner Magic Quadrant"],
        expectedAnswer: "ProSymmetry ist der Hersteller von Tempus Resource und unser strategischer Partner. Während ProSymmetry das Produkt entwickelt, sind wir als Valkeen die Experten für die Implementierung und Beratung bei Kunden. Diese Partnerschaft ermöglicht uns, tiefes Produktwissen mit Implementierungserfahrung zu kombinieren.",
        skills: ["Partnerverständnis", "Geschäftsmodell"]
      },
      {
        id: "w1-e3",
        difficulty: 2,
        title: "Der skeptische IT-Leiter",
        scenario: "Ein IT-Leiter sagt: 'Wir haben schon Excel für unsere Ressourcenplanung. Warum brauchen wir Tempus?'",
        task: "Argumentiere, warum eine Enterprise-Lösung wie Tempus Resource besser ist als Excel.",
        hints: ["Skalierbarkeit", "Echtzeit-Daten", "Kollaboration", "Reporting", "Integration"],
        expectedAnswer: "Excel stößt bei wachsenden Teams schnell an Grenzen: Keine Echtzeit-Updates, manuelle Fehler, keine Kollaboration. Tempus Resource bietet automatische Kapazitätsberechnung, What-If-Szenarien, Integration mit HR/ERP-Systemen und professionelles Reporting. Bei 50+ Ressourcen spart das Wochen an manueller Arbeit und verhindert teure Fehlplanungen.",
        skills: ["Argumentation", "Produktvorteile", "Kundeneinwände"]
      },
      {
        id: "w1-e4",
        difficulty: 2,
        title: "McKinsey-Insights anwenden",
        scenario: "Der HR-Direktor eines Kunden erwähnt, dass sie sich Sorgen um die Auswirkungen von KI auf ihre Workforce machen.",
        task: "Erkläre basierend auf dem McKinsey-Artikel, warum Strategic Workforce Planning jetzt besonders wichtig ist.",
        hints: ["Skill-Anforderungen ändern sich", "Proaktive Planung", "Wettbewerbsvorteil"],
        expectedAnswer: "Laut McKinsey ändern sich durch KI die Skill-Anforderungen rapide. Unternehmen, die jetzt proaktiv ihre Workforce planen, können Skill-Gaps frühzeitig identifizieren und schließen. Mit Tempus Resource können Sie nicht nur aktuelle Ressourcen verwalten, sondern auch zukünftige Skill-Bedarfe modellieren und Ihre Workforce strategisch entwickeln.",
        skills: ["Branchenwissen", "Strategische Argumentation"]
      }
    ]
  },

  // ============================================
  // WOCHE 2: Resource Management Grundlagen
  // ============================================
  {
    week: 2,
    title: "Resource Management Grundlagen",
    exercises: [
      {
        id: "w2-e1",
        difficulty: 1,
        title: "Die fünf Säulen erklären",
        scenario: "Ein neuer Stakeholder fragt: 'Was genau macht Resource Management eigentlich?'",
        task: "Erkläre die 5 Kernfunktionen von Resource Management verständlich.",
        hints: ["Resource Planning", "Capacity Planning", "Allocation", "Demand Management", "Skills Management"],
        expectedAnswer: "Resource Management hat 5 Kernfunktionen: 1) Resource Planning - Wer ist verfügbar? 2) Capacity Planning - Wie viel Kapazität haben wir? 3) Allocation - Wer arbeitet an was? 4) Demand Management - Was brauchen die Projekte? 5) Skills Management - Welche Fähigkeiten haben unsere Leute? Zusammen ermöglichen sie optimale Ressourcennutzung.",
        skills: ["Grundlagenwissen", "Erklärungsfähigkeit"]
      },
      {
        id: "w2-e2",
        difficulty: 2,
        title: "Generic vs. Named Resource",
        scenario: "Ein Projektleiter plant ein Projekt für Q3, kennt aber noch nicht alle Teammitglieder. Er fragt: 'Wie plane ich Ressourcen, die ich noch nicht kenne?'",
        task: "Erkläre das Konzept von Generic Resources und wann man sie verwendet.",
        hints: ["Platzhalter", "Skills definieren", "Später ersetzen", "Frühzeitige Planung"],
        expectedAnswer: "Sie können Generic Resources verwenden - das sind Platzhalter, die durch benötigte Skills und Rolle definiert werden, z.B. 'Senior Java Developer'. So können Sie frühzeitig planen und Kapazitätsbedarfe erkennen. Sobald Sie die konkreten Personen kennen, ersetzen Sie die Generic durch Named Resources. Das ermöglicht realistische Planung auch bei Unsicherheit.",
        skills: ["Tempus-Konzepte", "Kundenberatung"]
      },
      {
        id: "w2-e3",
        difficulty: 2,
        title: "Überauslastung erkennen",
        scenario: "Eine Teamleiterin beschwert sich: 'Meine Leute sind ständig überlastet, aber im System sieht alles grün aus.'",
        task: "Erkläre, was Overallocation ist und wie man sie in Tempus erkennt und vermeidet.",
        hints: ["Über 100% Zuweisung", "Net Availability", "Visuelle Indikatoren", "Kapazitätsplanung"],
        expectedAnswer: "Overallocation bedeutet, dass eine Ressource über 100% ihrer Kapazität zugewiesen ist. In Tempus sehen Sie das an der Net Availability - wenn sie negativ wird, ist die Person überbucht. Prüfen Sie die Auslastungsansicht: Rot zeigt Überauslastung. Lösung: Zuweisungen umverteilen, Timelines anpassen oder zusätzliche Ressourcen anfragen.",
        skills: ["Problemanalyse", "Tempus-Navigation"]
      },
      {
        id: "w2-e4",
        difficulty: 3,
        title: "Kapazitätsplanung für neues Team",
        scenario: "Ein Kunde baut ein neues Entwicklungsteam auf (8 Personen) und will wissen, wie viel Projektkapazität sie in den nächsten 6 Monaten haben werden.",
        task: "Beschreibe, wie du die Capacity Planning Funktion nutzen würdest, um diese Frage zu beantworten.",
        hints: ["Gross Capacity berechnen", "Urlaub/Krankheit abziehen", "Meetings/Admin-Zeit", "Net Availability"],
        expectedAnswer: "Ich würde: 1) Gross Capacity berechnen: 8 Personen × 40h/Woche × 26 Wochen = 8.320 Stunden. 2) Nicht-Projektzeit abziehen: ~20% für Meetings, Admin, Weiterbildung. 3) Urlaub einplanen: ~10 Tage pro Person. 4) Ergebnis: ~6.000 Stunden netto verfügbar. In Tempus können wir das visualisieren und mit dem Projektbedarf abgleichen, um Engpässe frühzeitig zu erkennen.",
        skills: ["Kapazitätsberechnung", "Kundenberatung", "Tempus-Anwendung"]
      },
      {
        id: "w2-e5",
        difficulty: 3,
        title: "Skills-Gap Analyse",
        scenario: "Ein Unternehmen plant die Einführung von Cloud-Technologien, aber der CTO ist unsicher, ob das Team die nötigen Skills hat.",
        task: "Erkläre, wie Skills Management in Tempus bei dieser Herausforderung helfen kann.",
        hints: ["Skill-Inventar", "Gap-Analyse", "Schulungsplanung", "Recruiting-Bedarf"],
        expectedAnswer: "Mit Tempus Skills Management können wir: 1) Aktuelles Skill-Inventar erfassen - wer hat welche Cloud-Kenntnisse? 2) Ziel-Skills für Cloud-Projekte definieren. 3) Gap-Analyse durchführen - wo fehlen Skills? 4) Maßnahmen planen: Schulungen für bestehendes Team oder Recruiting neuer Experten. 5) Fortschritt tracken. So sehen Sie genau, ob Sie bereit für Cloud-Projekte sind.",
        skills: ["Skills Management", "Strategische Beratung"]
      }
    ]
  },

  // ============================================
  // WOCHE 3: Project Management in Tempus
  // ============================================
  {
    week: 3,
    title: "Project Management in Tempus",
    exercises: [
      {
        id: "w3-e1",
        difficulty: 1,
        title: "Resource Request erstellen",
        scenario: "Du bist PM und brauchst einen UX Designer für dein Projekt ab nächstem Monat für 3 Monate.",
        task: "Beschreibe, wie du einen Resource Request in Tempus erstellst und was du angeben musst.",
        hints: ["Rolle/Skills", "Zeitraum", "Allocation %", "Priorität", "Begründung"],
        expectedAnswer: "Ich erstelle einen Resource Request mit: Rolle: UX Designer, Skills: Figma, User Research. Zeitraum: 01.04. - 30.06. Allocation: 100% (Vollzeit). Priorität: Hoch (kritisch für Projektstart). Begründung: Neue App-Redesign erfordert dedizierte UX-Expertise. Der Request geht an den Resource Manager, der dann eine passende Ressource zuweist oder Alternativen vorschlägt.",
        skills: ["Resource Requests", "Tempus-Workflow"]
      },
      {
        id: "w3-e2",
        difficulty: 2,
        title: "Die richtige View wählen",
        scenario: "Ein PM fragt: 'Ich habe Grid, Gantt und Kanban View. Wann nutze ich welche?'",
        task: "Erkläre die Unterschiede und typischen Anwendungsfälle für jede View.",
        hints: ["Grid für Übersicht/Daten", "Gantt für Timeline", "Kanban für Workflow/Agile"],
        expectedAnswer: "Grid View: Beste für Datenübersicht, Filtern, Sortieren - ideal für Statusmeetings und Reports. Gantt View: Zeigt Timeline mit Abhängigkeiten - perfekt für Projektplanung und Meilenstein-Tracking. Kanban View: Visualisiert Workflow-Status (To Do, In Progress, Done) - optimal für agile Teams und tägliches Task-Management. Ich empfehle: Gantt für Planung, Kanban für Ausführung, Grid für Reporting.",
        skills: ["Tempus-Views", "Beratungskompetenz"]
      },
      {
        id: "w3-e3",
        difficulty: 2,
        title: "Projekt mit Phasen strukturieren",
        scenario: "Ein Kunde will ein 6-monatiges ERP-Implementierungsprojekt in Tempus anlegen.",
        task: "Beschreibe, wie du das Projekt mit Phasen strukturieren würdest.",
        hints: ["Typische ERP-Phasen", "Unterschiedliche Ressourcen pro Phase", "Meilensteine"],
        expectedAnswer: "Ich strukturiere das ERP-Projekt in Phasen: 1) Discovery (4 Wochen) - Business Analyst, Berater. 2) Design (6 Wochen) - Solution Architect, Entwickler. 3) Build (10 Wochen) - Entwickler-Team, Tester. 4) Test (4 Wochen) - QA-Team, Key User. 5) Go-Live (2 Wochen) - Support-Team, Trainer. Jede Phase hat eigene Ressourcenzuweisungen und Meilensteine. So sehen wir genau, wann welche Skills gebraucht werden.",
        skills: ["Projektstrukturierung", "ERP-Wissen"]
      },
      {
        id: "w3-e4",
        difficulty: 3,
        title: "Projektverzögerung managen",
        scenario: "Dein Projekt verzögert sich um 4 Wochen. Der RM fragt, welche Auswirkungen das auf die Ressourcenplanung hat.",
        task: "Erkläre, wie du in Tempus die Verzögerung abbildest und die Konsequenzen analysierst.",
        hints: ["Timeline verschieben", "Ressourcenkonflikte prüfen", "Andere Projekte betroffen?", "Kommunikation"],
        expectedAnswer: "Ich würde: 1) In Tempus die Projekt-Timeline um 4 Wochen verschieben. 2) Automatisch prüfen, ob Ressourcen dann Konflikte mit anderen Projekten haben. 3) Net Availability der betroffenen Ressourcen analysieren. 4) Falls Konflikte: Mit anderen PMs und dem RM Lösungen besprechen (Ressourcen tauschen, Prioritäten anpassen). 5) Änderungen dokumentieren und Stakeholder informieren. Tempus zeigt sofort alle Auswirkungen.",
        skills: ["Änderungsmanagement", "Konfliktanalyse"]
      },
      {
        id: "w3-e5",
        difficulty: 3,
        title: "Case Study präsentieren",
        scenario: "Du sollst einem potenziellen Kunden eine ProSymmetry Case Study präsentieren und erklären, wie Tempus deren Probleme gelöst hat.",
        task: "Wähle eine typische Case Study und erkläre die Kernpunkte: Problem, Lösung, Ergebnis.",
        hints: ["Ausgangssituation", "Implementierte Lösung", "Messbare Ergebnisse", "Lessons Learned"],
        expectedAnswer: "Case Study Beispiel - Globales Technologieunternehmen: Problem: 500+ Ressourcen, Excel-basierte Planung führte zu 30% Überauslastung und verpassten Deadlines. Lösung: Tempus Resource implementiert mit Skills Management und Capacity Planning. Ergebnis: Überauslastung auf 5% reduziert, Projektlieferung verbessert um 40%, ROI in 8 Monaten erreicht. Key Learning: Frühe Stakeholder-Einbindung war entscheidend für Adoption.",
        skills: ["Präsentation", "Case Studies", "Storytelling"]
      }
    ]
  },

  // ============================================
  // WOCHE 4: Team Integration & Konsolidierung
  // ============================================
  {
    week: 4,
    title: "Team Integration & Konsolidierung",
    exercises: [
      {
        id: "w4-e1",
        difficulty: 1,
        title: "Net Availability erklären",
        scenario: "Ein Kunde sieht in Tempus 'Net Availability: -20 Stunden' für einen Mitarbeiter und fragt, was das bedeutet.",
        task: "Erkläre Net Availability und was negative Werte bedeuten.",
        hints: ["Gross Capacity minus Zuweisungen", "Negative = Überbucht", "Handlungsbedarf"],
        expectedAnswer: "Net Availability zeigt die verbleibende Kapazität nach allen Zuweisungen. Bei -20 Stunden ist die Person um 20 Stunden überbucht - sie hat mehr Arbeit zugewiesen als Kapazität verfügbar. Das ist ein Warnsignal! Wir müssen entweder Zuweisungen reduzieren, auf andere Ressourcen verteilen oder die Timeline anpassen. In Tempus sehen Sie das sofort rot markiert.",
        skills: ["Tempus-Metriken", "Kundenkommunikation"]
      },
      {
        id: "w4-e2",
        difficulty: 2,
        title: "Resource Contention lösen",
        scenario: "Zwei Projektleiter wollen denselben Senior Developer für den gleichen Zeitraum. Beide sagen, ihr Projekt hat Priorität.",
        task: "Beschreibe, wie du als Implementation Specialist diesen Konflikt moderieren würdest.",
        hints: ["Objektive Kriterien", "Prioritäten prüfen", "Alternativen suchen", "Eskalationspfad"],
        expectedAnswer: "Ich würde: 1) Beide Anforderungen in Tempus dokumentieren. 2) Objektive Kriterien prüfen: Projektpriorität, Business Value, Deadline-Kritikalität. 3) Net Availability des Developers analysieren - gibt es Teilzeitlösung? 4) Alternativen suchen: Andere Ressourcen mit ähnlichen Skills? 5) Falls keine Einigung: Eskalation an Management mit Daten aus Tempus. Transparenz und Fakten helfen bei der Entscheidung.",
        skills: ["Konfliktmanagement", "Moderation"]
      },
      {
        id: "w4-e3",
        difficulty: 2,
        title: "Valkeen Value Proposition",
        scenario: "Ein Interessent fragt: 'Warum sollten wir Valkeen beauftragen statt direkt mit ProSymmetry zu arbeiten?'",
        task: "Erkläre Valkeens einzigartigen Mehrwert.",
        hints: ["Implementierungserfahrung", "Lokale Präsenz", "Beratungskompetenz", "Langfristige Partnerschaft"],
        expectedAnswer: "Valkeen bietet: 1) 15+ Jahre PPM-Implementierungserfahrung - wir kennen die typischen Fallstricke. 2) Lokale Präsenz und Sprache - persönliche Betreuung in Ihrer Zeitzone. 3) Nicht nur Tool-Implementierung, sondern Prozessberatung - wir optimieren Ihre RM-Prozesse. 4) Langfristige Partnerschaft mit Support und Weiterentwicklung. ProSymmetry entwickelt das Produkt, wir sorgen dafür, dass es bei Ihnen funktioniert.",
        skills: ["Value Proposition", "Vertriebsunterstützung"]
      },
      {
        id: "w4-e4",
        difficulty: 3,
        title: "Zusammenfassung für Stakeholder",
        scenario: "Du sollst dem Management eines Kunden eine 1-seitige Zusammenfassung schreiben, warum sie Tempus Resource einführen sollten.",
        task: "Erstelle eine Executive Summary mit den wichtigsten Argumenten.",
        hints: ["Business Problem", "Lösung", "Erwarteter ROI", "Nächste Schritte"],
        expectedAnswer: "Executive Summary: Herausforderung: Ihre 200+ Ressourcen werden in Excel geplant - das führt zu Überauslastung, verpassten Deadlines und fehlender Transparenz. Lösung: Tempus Resource bietet Echtzeit-Kapazitätsplanung, automatische Konfliktwarnung und strategisches Portfolio Management. Erwarteter ROI: 20-30% Effizienzsteigerung, Reduktion von Überauslastung um 80%, bessere Projektlieferung. Nächste Schritte: 2-wöchiger Pilot mit Ihrem kritischsten Team. Investition: [Preis] mit ROI in 6-9 Monaten.",
        skills: ["Executive Communication", "Business Case"]
      },
      {
        id: "w4-e5",
        difficulty: 3,
        title: "Check-in Gespräch vorbereiten",
        scenario: "Du hast morgen dein Check-in mit Marc. Du sollst deinen Lernfortschritt präsentieren und offene Fragen klären.",
        task: "Bereite eine strukturierte Agenda für das 30-minütige Gespräch vor.",
        hints: ["Erfolge", "Herausforderungen", "Offene Fragen", "Nächste Schritte"],
        expectedAnswer: "Agenda Check-in mit Marc (30 Min): 1) Fortschritt (10 Min): Abgeschlossene Aufgaben, Videos gesehen, Trial Environment erkundet. 2) Highlights (5 Min): Was habe ich gut verstanden? (z.B. RM-Grundlagen, Views). 3) Herausforderungen (5 Min): Wo brauche ich Hilfe? (z.B. BPAFG noch unklar). 4) Offene Fragen (5 Min): Spezifische Fragen zu Kundenszenarien. 5) Nächste Schritte (5 Min): Was steht nächste Woche an? Feedback zu meinem Fortschritt?",
        skills: ["Selbstorganisation", "Kommunikation"]
      }
    ]
  },

  // ============================================
  // WOCHE 5: Fortgeschrittene Module & PM Demo
  // ============================================
  {
    week: 5,
    title: "Fortgeschrittene Module & PM Demo",
    exercises: [
      {
        id: "w5-e1",
        difficulty: 2,
        title: "Hybrid Team Planning erklären",
        scenario: "Ein Kunde plant ein Projekt für Q4, hat aber erst 3 von 8 benötigten Teammitgliedern identifiziert.",
        task: "Erkläre, wie Hybrid Team Planning in Tempus dieses Problem löst.",
        hints: ["Named Resources für bekannte Personen", "Generic für unbekannte", "Skills definieren", "Später ersetzen"],
        expectedAnswer: "Mit Hybrid Team Planning können Sie: 1) Die 3 bekannten Personen als Named Resources zuweisen. 2) Für die 5 unbekannten Generic Resources erstellen (z.B. 'Backend Developer', 'QA Engineer'). 3) Skills und Verfügbarkeitsanforderungen definieren. 4) Kapazitätsplanung trotzdem durchführen. 5) Sobald Personen identifiziert sind, Generic durch Named ersetzen. So haben Sie realistische Planung ohne auf finale Teamzusammensetzung warten zu müssen.",
        skills: ["Hybrid Planning", "Kundenberatung"]
      },
      {
        id: "w5-e2",
        difficulty: 2,
        title: "PM Demo strukturieren",
        scenario: "Du sollst morgen deine erste PM Demo intern präsentieren. Du hast 20 Minuten.",
        task: "Erstelle eine Demo-Agenda mit den wichtigsten Punkten.",
        hints: ["UI Navigation", "Projekt erstellen", "Allocations", "Resource Requests", "Views"],
        expectedAnswer: "PM Demo Agenda (20 Min): 1) UI Übersicht (3 Min): Navigation, Menüstruktur, Personalisierung. 2) Projekt erstellen (5 Min): Neues Projekt anlegen, Attributes setzen (Status, Priorität, Kategorie). 3) Ressourcen zuweisen (5 Min): Allocations erstellen, Named vs. Generic zeigen. 4) Resource Request (3 Min): Request erstellen, Status-Workflow erklären. 5) Views (4 Min): Grid, Gantt, Kanban durchschalten, Filteroptionen zeigen. Abschluss: Fragen beantworten.",
        skills: ["Demo-Vorbereitung", "Präsentation"]
      },
      {
        id: "w5-e3",
        difficulty: 3,
        title: "Soft vs. Hard Booking Szenario",
        scenario: "Ein PM hat 5 Ressourcen 'soft' gebucht für ein Projekt, das noch nicht final genehmigt ist. Jetzt will ein anderer PM eine dieser Ressourcen 'hard' buchen.",
        task: "Erkläre den Unterschied und wie dieser Konflikt gelöst werden sollte.",
        hints: ["Soft = tentativ", "Hard = verbindlich", "Prioritäten", "Kommunikation"],
        expectedAnswer: "Soft Booking ist tentativ/vorläufig - die Ressource ist 'reserviert' aber nicht verbindlich. Hard Booking ist bestätigt und verbindlich. Im Konfliktfall: 1) Hard Booking hat normalerweise Vorrang. 2) Aber: Prüfen, wann das Soft-Projekt genehmigt wird. 3) Wenn bald: Mit beiden PMs sprechen, ob Teilzeit-Lösung möglich. 4) Wenn unklar: Hard Booking durchführen, Soft-Projekt muss Alternative finden. 5) Dokumentieren und transparent kommunizieren. Tempus zeigt beide Booking-Typen unterschiedlich an.",
        skills: ["Booking-Konzepte", "Konfliktlösung"]
      },
      {
        id: "w5-e4",
        difficulty: 3,
        title: "Team Resource konfigurieren",
        scenario: "Ein Kunde hat ein cross-funktionales Scrum-Team (PO, SM, 4 Devs, 2 QA), das immer zusammen an Projekten arbeitet.",
        task: "Erkläre, wie du ein Team Resource in Tempus einrichten würdest.",
        hints: ["Team als Einheit", "Mitglieder zuordnen", "Kapazität aggregieren", "Zuweisung vereinfachen"],
        expectedAnswer: "Ich würde ein Team Resource 'Scrum Team Alpha' erstellen: 1) Team-Mitglieder hinzufügen: PO, SM, 4 Devs, 2 QA. 2) Rollen und Skills pro Mitglied definieren. 3) Team-Kapazität wird automatisch aggregiert (8 Personen × 40h). 4) Bei Projektzuweisung kann das ganze Team mit einem Klick zugewiesen werden. 5) Individuelle Verfügbarkeit bleibt sichtbar. Vorteil: Einfachere Planung für wiederkehrende Teams, konsistente Zuweisung, Team-Auslastung auf einen Blick.",
        skills: ["Team Resources", "Konfiguration"]
      },
      {
        id: "w5-e5",
        difficulty: 4,
        title: "Demo-Feedback verarbeiten",
        scenario: "Nach deiner internen PM Demo bekommst du Feedback: 'Die Allocations waren gut, aber du hast nicht erklärt, WARUM ein PM das so machen würde.'",
        task: "Überarbeite deinen Demo-Ansatz, um mehr Business-Kontext einzubauen.",
        hints: ["Use Case zuerst", "Problem → Lösung", "Business Value", "Kundensprache"],
        expectedAnswer: "Verbesserter Ansatz: Statt 'Hier klicken Sie auf Allocation' → 'Als PM haben Sie das Problem, dass Sie nicht wissen, ob Ihre Ressourcen verfügbar sind. In Tempus sehen Sie sofort die Net Availability. Wenn Sie jetzt eine Allocation erstellen, prüft das System automatisch Konflikte.' Jede Funktion mit Business-Kontext einführen: 'Das löst das Problem von...' oder 'Das spart Ihnen Zeit bei...' Kunden interessiert nicht WO sie klicken, sondern WARUM.",
        skills: ["Demo-Technik", "Storytelling", "Kundenorientierung"]
      }
    ]
  },

  // ============================================
  // WOCHE 6: RM Demo & Client Exposure
  // ============================================
  {
    week: 6,
    title: "RM Demo & Client Exposure",
    exercises: [
      {
        id: "w6-e1",
        difficulty: 2,
        title: "BPAFG Modi erklären",
        scenario: "Ein Resource Manager fragt: 'Ich höre immer von BPAFG. Was ist das und welchen Modus brauche ich?'",
        task: "Erkläre die drei BPAFG-Modi und wann man welchen verwendet.",
        hints: ["Default Mode", "RM Mode", "PM Mode", "Perspektive"],
        expectedAnswer: "BPAFG (Bulk Project Allocation Flatgrid) hat 3 Modi: 1) Default Mode: Flexible Ansicht, gut für Überblick und schnelle Änderungen. 2) RM Mode: Ressourcen-zentriert - zeigt alle Projekte EINER Ressource. Ideal für Resource Manager, die Auslastung einzelner Personen optimieren. 3) PM Mode: Projekt-zentriert - zeigt alle Ressourcen EINES Projekts. Ideal für Project Manager, die ihr Team verwalten. Wählen Sie den Modus nach Ihrer Hauptaufgabe.",
        skills: ["BPAFG", "Beratung"]
      },
      {
        id: "w6-e2",
        difficulty: 2,
        title: "Resource Profile analysieren",
        scenario: "Du schaust dir das Individual Resource Profile eines Senior Developers an. Der Manager fragt: 'Ist diese Person für mein Projekt im April verfügbar?'",
        task: "Beschreibe, welche Informationen du im Profil prüfst, um diese Frage zu beantworten.",
        hints: ["Aktuelle Zuweisungen", "Net Availability", "Skills", "Geplanter Urlaub"],
        expectedAnswer: "Im Individual Resource Profile prüfe ich: 1) Aktuelle Zuweisungen: Welche Projekte laufen im April? Mit welcher Allocation? 2) Net Availability für April: Gibt es freie Kapazität? 3) Skills: Passen die Fähigkeiten zum Projektbedarf? 4) Geplanter Urlaub/Abwesenheit im April. 5) Soft Bookings: Gibt es tentative Reservierungen? Basierend darauf kann ich sagen: 'Die Person hat 40% freie Kapazität im April, Skills passen, aber es gibt eine Soft Booking für ein anderes Projekt.'",
        skills: ["Profil-Analyse", "Verfügbarkeitsprüfung"]
      },
      {
        id: "w6-e3",
        difficulty: 3,
        title: "Erstes Client Meeting",
        scenario: "Du wirst zu deinem ersten Client Meeting mitgenommen. Der Kunde beschwert sich: 'Unsere Ressourcenplanung ist ein Chaos. Niemand weiß, wer woran arbeitet.'",
        task: "Wie würdest du (als Beobachter) dieses Problem in Tempus-Lösungen übersetzen?",
        hints: ["Transparenz", "Zentrale Quelle", "Echtzeit-Updates", "Reporting"],
        expectedAnswer: "Das Problem 'Niemand weiß, wer woran arbeitet' übersetzt sich in: 1) Fehlende zentrale Datenquelle → Tempus als Single Source of Truth. 2) Keine Echtzeit-Sicht → Live-Dashboards und Auslastungsansichten. 3) Manuelle Updates → Automatische Synchronisation. 4) Keine Transparenz → Role-based Views für PM, RM, Management. Ich würde notieren: Kunde braucht Fokus auf Transparenz und Reporting. Demo sollte Auslastungsübersicht und Dashboards betonen.",
        skills: ["Kundenanalyse", "Lösungsmapping"]
      },
      {
        id: "w6-e4",
        difficulty: 3,
        title: "Support-Email verfassen",
        scenario: "Ein Kunde schreibt: 'Ich kann keine neuen Ressourcen anlegen. Der Button ist ausgegraut.' Du sollst eine Support-Antwort verfassen.",
        task: "Schreibe eine professionelle Support-Email mit Lösungsvorschlägen.",
        hints: ["Freundlich", "Strukturiert", "Mögliche Ursachen", "Nächste Schritte"],
        expectedAnswer: "Betreff: Re: Ressourcen anlegen - Button ausgegraut\n\nGuten Tag Herr/Frau [Name],\n\nvielen Dank für Ihre Nachricht. Das beschriebene Verhalten kann folgende Ursachen haben:\n\n1) Berechtigungen: Ihr Benutzer hat möglicherweise keine Rechte zum Anlegen von Ressourcen. Bitte prüfen Sie mit Ihrem Admin.\n\n2) Lizenz: Die Ressourcen-Anzahl könnte das Lizenzlimit erreicht haben.\n\n3) Browser-Cache: Bitte versuchen Sie, den Cache zu leeren oder einen anderen Browser.\n\nKönnten Sie mir einen Screenshot senden? Dann kann ich die Ursache genauer eingrenzen.\n\nMit freundlichen Grüßen",
        skills: ["Support-Kommunikation", "Problemanalyse"]
      },
      {
        id: "w6-e5",
        difficulty: 4,
        title: "Feature Request dokumentieren",
        scenario: "Ein Kunde wünscht sich: 'Es wäre toll, wenn Tempus automatisch eine Email schickt, wenn eine Ressource überbucht wird.'",
        task: "Dokumentiere diesen Feature Request professionell für die Weiterleitung an ProSymmetry.",
        hints: ["Use Case", "Business Value", "Aktuelle Workaround", "Priorität"],
        expectedAnswer: "Feature Request #[Nummer]\n\nTitel: Automatische Email-Benachrichtigung bei Ressourcen-Überbuchung\n\nKunde: [Firma]\n\nUse Case: Resource Manager möchten proaktiv informiert werden, wenn eine Ressource über 100% Auslastung zugewiesen wird, ohne manuell prüfen zu müssen.\n\nBusiness Value: Verhindert Burnout, ermöglicht schnellere Reaktion auf Planungsprobleme, reduziert manuelle Überwachungsaufwand.\n\nAktueller Workaround: Manuelle tägliche Prüfung der Auslastungsberichte.\n\nPriorität: Mittel (3 Kunden haben ähnliches angefragt)\n\nVorgeschlagene Lösung: Konfigurierbarer Alert bei Überschreitung eines Schwellenwerts (z.B. 90%, 100%, 110%).",
        skills: ["Feature Requests", "Dokumentation"]
      }
    ]
  },

  // ============================================
  // WOCHE 7: Reporting & Portfolio Management
  // ============================================
  {
    week: 7,
    title: "Reporting & Portfolio Management",
    exercises: [
      {
        id: "w7-e1",
        difficulty: 2,
        title: "RAR Report erklären",
        scenario: "Ein Kunde fragt: 'Was ist der Unterschied zwischen RAR und RAR2? Welchen brauche ich?'",
        task: "Erkläre beide Reports und ihre typischen Anwendungsfälle.",
        hints: ["RAR = Basis", "RAR2 = erweitert", "Analysefunktionen", "Darstellung"],
        expectedAnswer: "RAR (Resource Availability Report) ist der Basis-Bericht: Zeigt Verfügbarkeit über Zeit in einfacher Tabellenform. Gut für schnelle Übersicht. RAR2 ist die erweiterte Version mit: Mehr Filteroptionen, Drill-down-Funktionen, verschiedene Aggregationsebenen (Team, Abteilung, Skill), Export-Optionen. Empfehlung: RAR für tägliche Quick-Checks, RAR2 für Management-Reporting und tiefere Analysen.",
        skills: ["Reporting", "Beratung"]
      },
      {
        id: "w7-e2",
        difficulty: 3,
        title: "What-If Szenario erstellen",
        scenario: "Das Management fragt: 'Was passiert mit unserer Kapazität, wenn wir 3 Senior Developer verlieren und 2 Projekte um 2 Monate verschieben?'",
        task: "Beschreibe, wie du dieses What-If Szenario in Tempus modellieren würdest.",
        hints: ["Szenario erstellen", "Ressourcen entfernen", "Projekte verschieben", "Auswirkungen analysieren"],
        expectedAnswer: "Ich würde: 1) Neues What-If Szenario erstellen (kopiert aktuelle Daten). 2) 3 Senior Developer aus dem Szenario entfernen oder auf 0% setzen. 3) Die 2 Projekte um 2 Monate nach hinten verschieben. 4) Kapazitäts-Dashboard analysieren: Wo entstehen Engpässe? 5) Alternativen testen: Können Junior Devs übernehmen? Externe hinzuziehen? 6) Ergebnisse präsentieren: 'Ohne Maßnahmen haben wir 40% Unterkapazität in Q3. Option A: 2 Externe. Option B: Projekt C verschieben.'",
        skills: ["What-If Planning", "Szenarioanalyse"]
      },
      {
        id: "w7-e3",
        difficulty: 3,
        title: "Dashboard für Management",
        scenario: "Der CIO möchte ein Dashboard, das auf einen Blick zeigt: Gesamtauslastung, kritische Projekte, Skill-Gaps.",
        task: "Beschreibe, welche Widgets/Elemente du in diesem Dashboard einbauen würdest.",
        hints: ["KPIs", "Visualisierungen", "Drill-down", "Alerts"],
        expectedAnswer: "Management Dashboard Elemente: 1) Gesamtauslastung: Gauge-Chart (aktuell 85%), Trend der letzten 3 Monate. 2) Kapazität vs. Demand: Balkendiagramm pro Monat, Rot wenn Demand > Capacity. 3) Kritische Projekte: Liste mit Status-Ampel, sortiert nach Risiko. 4) Top 5 überlastete Ressourcen: Mit Prozent und Projekten. 5) Skill-Gap Heatmap: Benötigte vs. verfügbare Skills. 6) Alerts: Projekte ohne zugewiesene Ressourcen, Ressourcen mit >110% Auslastung. Alles mit Drill-down zu Details.",
        skills: ["Dashboard-Design", "KPIs"]
      },
      {
        id: "w7-e4",
        difficulty: 4,
        title: "Portfolio Priorisierung",
        scenario: "Ein Kunde hat 20 Projektanfragen aber nur Kapazität für 12. Er fragt: 'Wie entscheide ich, welche Projekte wir machen?'",
        task: "Erkläre, wie der Portfolio Planner bei dieser Entscheidung hilft.",
        hints: ["Kriterien definieren", "Scoring", "Ressourcenabgleich", "Szenarien"],
        expectedAnswer: "Mit dem Portfolio Planner: 1) Bewertungskriterien definieren: Strategischer Fit, ROI, Risiko, Ressourcenverfügbarkeit. 2) Alle 20 Projekte scoren (z.B. 1-5 pro Kriterium). 3) Gewichtung festlegen (z.B. Strategie 40%, ROI 30%, Risiko 20%, Ressourcen 10%). 4) Automatisches Ranking erstellen. 5) Top 12 gegen Kapazität prüfen: Passen die benötigten Skills? 6) What-If: Was wenn wir Projekt 13 statt 12 nehmen? 7) Entscheidungsvorlage für Management mit Daten untermauern.",
        skills: ["Portfolio Management", "Priorisierung"]
      },
      {
        id: "w7-e5",
        difficulty: 4,
        title: "Demand Forecasting präsentieren",
        scenario: "Der VP Engineering fragt: 'Wie viele Entwickler brauchen wir in 12 Monaten basierend auf unserer Projekt-Pipeline?'",
        task: "Beschreibe deinen Ansatz für diese strategische Forecasting-Anfrage.",
        hints: ["Pipeline analysieren", "Historische Daten", "Wachstumsfaktoren", "Unsicherheiten"],
        expectedAnswer: "Mein Forecasting-Ansatz: 1) Aktuelle Pipeline analysieren: Bestätigte Projekte, wahrscheinliche Projekte, mögliche Projekte. 2) Ressourcenbedarf pro Projekt schätzen (basierend auf historischen Daten ähnlicher Projekte). 3) Zeitliche Verteilung: Wann brauchen wir welche Skills? 4) Szenario-Modell: Best Case (nur bestätigte), Expected (bestätigt + 70% wahrscheinlich), Worst Case (alle). 5) Ergebnis: 'Expected Case: Wir brauchen 8 zusätzliche Entwickler bis Q4, davon 3 mit Cloud-Skills.' 6) Empfehlung: Recruiting jetzt starten, da Vorlauf 3-4 Monate.",
        skills: ["Strategic Forecasting", "Datenanalyse"]
      }
    ]
  },

  // ============================================
  // WOCHE 8: BPAFG Deep Dive & Admin
  // ============================================
  {
    week: 8,
    title: "BPAFG Deep Dive & Admin",
    exercises: [
      {
        id: "w8-e1",
        difficulty: 2,
        title: "BPAFG Best Practices",
        scenario: "Ein Kunde nutzt BPAFG zum ersten Mal und fragt: 'Gibt es Tipps, wie ich das effizient nutze?'",
        task: "Gib 5 Best Practices für die BPAFG-Nutzung.",
        hints: ["Filter nutzen", "Modus wählen", "Bulk-Änderungen", "Speichern", "Shortcuts"],
        expectedAnswer: "BPAFG Best Practices: 1) Richtigen Modus wählen: RM Mode für Ressourcen-Fokus, PM Mode für Projekt-Fokus. 2) Filter zuerst setzen: Zeitraum, Abteilung, Projekt eingrenzen bevor Sie ändern. 3) Bulk-Änderungen nutzen: Mehrere Zellen markieren, einmal ändern. 4) Regelmäßig speichern: Änderungen gehen bei Timeout verloren. 5) Farbcodes beachten: Rot = Überauslastung, Gelb = Warnung. Bonus: Keyboard-Shortcuts lernen für schnellere Navigation.",
        skills: ["BPAFG", "Best Practices"]
      },
      {
        id: "w8-e2",
        difficulty: 3,
        title: "New Assignment Mode",
        scenario: "Ein Resource Manager muss schnell 10 neue Zuweisungen für ein dringendes Projekt erstellen.",
        task: "Erkläre, wie der New Assignment Mode in BPAFG dabei hilft.",
        hints: ["Schnelle Erstellung", "Direkt im Grid", "Ressource + Projekt + Zeitraum", "Bulk"],
        expectedAnswer: "Der New Assignment Mode ermöglicht schnelle Zuweisungserstellung: 1) BPAFG öffnen, New Assignment Mode aktivieren. 2) Projekt auswählen (das dringende Projekt). 3) Im Grid direkt Ressourcen auswählen und Zeitraum/Prozent eingeben. 4) Mehrere Zuweisungen in einem Durchgang erstellen. 5) Alle 10 Zuweisungen mit einem Klick speichern. Vorteil: Keine einzelnen Dialoge, alles in einer Ansicht, sofortige Konfliktanzeige wenn Ressource überbucht wird.",
        skills: ["BPAFG Advanced", "Effizienz"]
      },
      {
        id: "w8-e3",
        difficulty: 3,
        title: "Data Sync konfigurieren",
        scenario: "Ein Kunde will Tempus mit seinem HR-System (Workday) verbinden, damit neue Mitarbeiter automatisch angelegt werden.",
        task: "Erkläre den grundlegenden Ansatz für diese Integration.",
        hints: ["API/Import", "Feldmapping", "Sync-Frequenz", "Fehlerbehandlung"],
        expectedAnswer: "Data Sync Ansatz: 1) Datenquelle definieren: Workday API oder regelmäßiger Dateiexport. 2) Feldmapping erstellen: Workday-Felder → Tempus-Felder (Name, Abteilung, Startdatum, Skills). 3) Sync-Regeln: Nur aktive Mitarbeiter, bestimmte Abteilungen. 4) Frequenz: Täglich nachts oder bei Änderung (Webhook). 5) Fehlerbehandlung: Was bei fehlenden Pflichtfeldern? Logging und Alerts. 6) Test: Erst mit Testdaten, dann Pilotgruppe, dann Rollout. Wichtig: Datenqualität in Workday muss stimmen!",
        skills: ["Integration", "Data Sync"]
      },
      {
        id: "w8-e4",
        difficulty: 4,
        title: "Custom Attributes anlegen",
        scenario: "Ein Kunde braucht ein neues Feld 'Kostenstelle' für Ressourcen, das in Reports verwendet werden soll.",
        task: "Beschreibe den Prozess, ein Custom Attribute anzulegen und nutzbar zu machen.",
        hints: ["Attribute Management", "Feldtyp", "Validierung", "Views", "Reports"],
        expectedAnswer: "Custom Attribute 'Kostenstelle' anlegen: 1) Admin → Attribute Management → Neues Attribut. 2) Name: 'Kostenstelle', Typ: Dropdown (vordefinierte Werte) oder Text. 3) Entität: Resource (gilt für Ressourcen). 4) Werte definieren: Liste der Kostenstellen oder Freitext mit Validierung. 5) Pflichtfeld? Je nach Anforderung. 6) In Views einbinden: Spalte zu relevanten Sheets hinzufügen. 7) In Reports verfügbar machen: Als Filter und Gruppierung. 8) Bestehende Ressourcen: Bulk-Update oder manuelle Pflege. 9) Dokumentation für User erstellen.",
        skills: ["Admin", "Konfiguration"]
      },
      {
        id: "w8-e5",
        difficulty: 4,
        title: "Snapshot-Strategie entwickeln",
        scenario: "Ein Kunde fragt: 'Wir wollen unsere Ressourcenplanung monatlich mit dem Vormonat vergleichen. Wie setzen wir das um?'",
        task: "Entwickle eine Snapshot-Strategie für monatliche Vergleiche.",
        hints: ["Zeitpunkt", "Automatisierung", "Benennung", "Vergleichsreports", "Aufbewahrung"],
        expectedAnswer: "Snapshot-Strategie: 1) Zeitpunkt: Jeden 1. des Monats um 6:00 Uhr (vor Arbeitsbeginn). 2) Benennung: 'Monthly_YYYY-MM' (z.B. Monthly_2024-03). 3) Automatisierung: Scheduled Job einrichten. 4) Inhalt: Vollständiger Snapshot aller Ressourcen, Projekte, Zuweisungen. 5) Vergleichsreport erstellen: Aktuell vs. Vormonat - Delta bei Auslastung, neue/beendete Projekte. 6) Aufbewahrung: 12 Monate rollierend, Jahresend-Snapshots dauerhaft. 7) Zugriff: Nur für Management und Controlling. 8) Dokumentation: Was wurde wann gesnapshoted.",
        skills: ["Snapshots", "Strategie"]
      }
    ]
  },

  // ============================================
  // WOCHE 9: Best Practices & Abschluss
  // ============================================
  {
    week: 9,
    title: "Best Practices & Abschluss",
    exercises: [
      {
        id: "w9-e1",
        difficulty: 3,
        title: "Adoption-Strategie entwickeln",
        scenario: "Ein Kunde hat Tempus implementiert, aber die Nutzung ist gering. Nur 30% der User loggen sich regelmäßig ein.",
        task: "Entwickle eine Strategie zur Steigerung der Adoption.",
        hints: ["Ursachenanalyse", "Training", "Champions", "Quick Wins", "Management Support"],
        expectedAnswer: "Adoption-Strategie: 1) Ursachenanalyse: Warum nutzen 70% es nicht? Interviews, Umfrage. 2) Quick Wins identifizieren: Welche Funktion löst ein echtes Problem? Damit starten. 3) Champions-Programm: Power User als Multiplikatoren ausbilden. 4) Gezieltes Training: Rollenspezifisch (PM vs. RM), kurze Sessions. 5) Management-Commitment: Führungskräfte müssen Tempus nutzen und einfordern. 6) Prozesse anpassen: Alte Excel-Prozesse abschalten. 7) Erfolge kommunizieren: 'Team X hat 20% Zeit gespart.' 8) Regelmäßige Check-ins: Monatlich Nutzung reviewen.",
        skills: ["Change Management", "Adoption"]
      },
      {
        id: "w9-e2",
        difficulty: 3,
        title: "RM Maturity Assessment",
        scenario: "Ein neuer Kunde fragt: 'Wie gut sind wir eigentlich im Resource Management? Wo stehen wir im Vergleich zu anderen?'",
        task: "Erkläre, wie du ein RM Maturity Assessment durchführen würdest.",
        hints: ["Maturity-Stufen", "Bewertungskriterien", "Ist-Analyse", "Roadmap"],
        expectedAnswer: "RM Maturity Assessment: 1) Maturity-Modell erklären: Level 1 (Ad-hoc) bis Level 5 (Optimiert). 2) Bewertungskriterien: Prozesse, Tools, Datenqualität, Governance, Kultur. 3) Ist-Analyse: Interviews mit PM, RM, Management. Aktuelle Prozesse dokumentieren. 4) Scoring: Jedes Kriterium bewerten (1-5). 5) Benchmark: Vergleich mit Industrie-Durchschnitt. 6) Gap-Analyse: Wo sind die größten Lücken? 7) Roadmap: Priorisierte Maßnahmen für nächstes Level. 8) Präsentation: 'Sie sind auf Level 2.5, Industrie-Durchschnitt ist 3. Mit diesen 5 Maßnahmen erreichen Sie Level 3 in 6 Monaten.'",
        skills: ["Assessment", "Beratung"]
      },
      {
        id: "w9-e3",
        difficulty: 4,
        title: "SAFe Integration erklären",
        scenario: "Ein Kunde arbeitet mit SAFe (Scaled Agile Framework) und fragt, wie Tempus in ihre agile Arbeitsweise passt.",
        task: "Erkläre die Integration von Tempus Resource mit SAFe.",
        hints: ["ARTs", "PI Planning", "Kapazität", "Teams vs. Individuen"],
        expectedAnswer: "Tempus + SAFe Integration: 1) Agile Release Trains (ARTs) als Team Resources abbilden. 2) PI Planning unterstützen: Kapazität pro Team für nächstes PI (10 Wochen) planen. 3) Feature-zu-Team-Zuweisung: Welches Team arbeitet an welchem Feature? 4) Kapazitätsplanung auf Team-Ebene, nicht Individuum (SAFe-Prinzip). 5) Velocity-basierte Planung: Historische Velocity als Kapazitätsgrundlage. 6) Roadmap-Visualisierung: Features über mehrere PIs. 7) Reporting: Burn-up auf Portfolio-Ebene. Wichtig: Tempus ergänzt agile Tools (Jira), ersetzt sie nicht.",
        skills: ["SAFe", "Agile Integration"]
      },
      {
        id: "w9-e4",
        difficulty: 4,
        title: "Implementation Shadowing vorbereiten",
        scenario: "Nächste Woche begleitest du Marc zu einer Kundenimplementierung. Du sollst dich vorbereiten.",
        task: "Erstelle eine Checkliste, was du vor, während und nach dem Shadowing tun solltest.",
        hints: ["Vorbereitung", "Beobachtung", "Fragen", "Dokumentation", "Reflexion"],
        expectedAnswer: "Shadowing-Checkliste:\n\nVORHER:\n- Kundenhintergrund lesen (Branche, Größe, Ziele)\n- Projektdokumentation durchsehen\n- Eigene Fragen vorbereiten\n- Laptop/Notizen bereit\n\nWÄHREND:\n- Aktiv zuhören, nicht unterbrechen\n- Notizen zu: Kundenreaktionen, Marcs Techniken, Probleme/Lösungen\n- Auf Körpersprache achten\n- Fragen für später notieren\n\nNACHHER:\n- Debrief mit Marc (Was lief gut? Was würde er anders machen?)\n- Eigene Reflexion: Was habe ich gelernt?\n- Dokumentation: Key Learnings festhalten\n- Follow-up Fragen klären",
        skills: ["Shadowing", "Lernen"]
      },
      {
        id: "w9-e5",
        difficulty: 5,
        title: "Eigenständige Implementation planen",
        scenario: "Du bekommst deinen ersten eigenen kleinen Kunden: Ein 50-Personen-Unternehmen will Tempus für 3 Teams einführen.",
        task: "Erstelle einen groben Implementierungsplan.",
        hints: ["Discovery", "Konfiguration", "Migration", "Training", "Go-Live", "Support"],
        expectedAnswer: "Implementierungsplan (8 Wochen):\n\nWoche 1-2: Discovery\n- Stakeholder-Interviews\n- Aktuelle Prozesse dokumentieren\n- Anforderungen definieren\n- Erfolgskriterien festlegen\n\nWoche 3-4: Konfiguration\n- Tempus-Instanz einrichten\n- Attribute/Views konfigurieren\n- Rollen/Rechte definieren\n- Testdaten laden\n\nWoche 5: Datenmigration\n- Ressourcen importieren\n- Projekte anlegen\n- Zuweisungen migrieren\n- Datenqualität prüfen\n\nWoche 6: Training\n- Admin-Training (1 Tag)\n- PM-Training (0.5 Tag)\n- RM-Training (0.5 Tag)\n- Übungssessions\n\nWoche 7: Pilot\n- 1 Team startet produktiv\n- Tägliche Check-ins\n- Bugs/Issues fixen\n\nWoche 8: Rollout\n- Alle 3 Teams live\n- Hypercare-Support\n- Dokumentation finalisieren",
        skills: ["Implementation", "Projektplanung"]
      }
    ]
  }
];

// ============================================
// TOOLKONFIGURATION PRAXISÜBUNGEN
// Hands-on Übungen auf der Testplattform
// ============================================
export const toolConfigExercises = [
  // ============================================
  // MODUL 1: Grundlegende Navigation & Setup
  // ============================================
  {
    module: 1,
    title: "Navigation & Grundeinrichtung",
    description: "Lerne die Benutzeroberfläche kennen und richte dein erstes Setup ein",
    exercises: [
      {
        id: "tc1-e1",
        difficulty: 1,
        title: "Dashboard erkunden",
        scenario: "Du loggst dich zum ersten Mal in die Tempus-Testumgebung ein.",
        task: "Navigiere durch alle Hauptbereiche der Anwendung und identifiziere: 1) Das Hauptmenü, 2) Die Schnellzugriffe, 3) Die Benutzereinstellungen, 4) Den Hilfe-Bereich.",
        steps: [
          "Logge dich in die Testumgebung ein",
          "Klicke auf jeden Menüpunkt im Hauptmenü",
          "Finde die Benutzereinstellungen (meist oben rechts)",
          "Lokalisiere den Hilfe/Support-Bereich",
          "Notiere dir die wichtigsten Navigationspfade"
        ],
        expectedResult: "Du kannst blind zu jedem Hauptbereich navigieren und weißt, wo du Hilfe findest.",
        checkpoints: ["Hauptmenü gefunden", "Alle Bereiche besucht", "Einstellungen lokalisiert", "Hilfe gefunden"],
        skills: ["Navigation", "UI-Verständnis"]
      },
      {
        id: "tc1-e2",
        difficulty: 1,
        title: "Persönliches Profil einrichten",
        scenario: "Als neuer Benutzer sollst du dein Profil vollständig einrichten.",
        task: "Konfiguriere dein Benutzerprofil mit allen relevanten Informationen.",
        steps: [
          "Gehe zu den Benutzereinstellungen",
          "Fülle alle Profilfelder aus (Name, E-Mail, Abteilung)",
          "Lade ein Profilbild hoch (falls möglich)",
          "Setze deine Zeitzone korrekt",
          "Konfiguriere deine Benachrichtigungseinstellungen",
          "Speichere die Änderungen"
        ],
        expectedResult: "Dein Profil ist vollständig ausgefüllt und die Einstellungen sind gespeichert.",
        checkpoints: ["Profil ausgefüllt", "Zeitzone gesetzt", "Benachrichtigungen konfiguriert", "Gespeichert"],
        skills: ["Profil-Setup", "Benutzereinstellungen"]
      },
      {
        id: "tc1-e3",
        difficulty: 2,
        title: "Erste Resource anlegen",
        scenario: "Du sollst deine erste Ressource im System anlegen - dich selbst als Testressource.",
        task: "Erstelle eine neue Named Resource mit vollständigen Informationen.",
        steps: [
          "Navigiere zum Ressourcen-Bereich",
          "Klicke auf 'Neue Ressource' oder '+' Button",
          "Wähle 'Named Resource' als Typ",
          "Fülle die Pflichtfelder aus: Name, E-Mail, Abteilung",
          "Setze die Kapazität (z.B. 40h/Woche)",
          "Füge mindestens 3 Skills hinzu",
          "Definiere die Verfügbarkeit (Start-/Enddatum)",
          "Speichere die Ressource"
        ],
        expectedResult: "Eine vollständige Named Resource ist im System angelegt und sichtbar.",
        checkpoints: ["Ressource erstellt", "Skills hinzugefügt", "Kapazität gesetzt", "Verfügbarkeit definiert"],
        skills: ["Resource Management", "Dateneingabe"]
      },
      {
        id: "tc1-e4",
        difficulty: 2,
        title: "Generic Resource erstellen",
        scenario: "Für ein zukünftiges Projekt brauchst du Platzhalter-Ressourcen.",
        task: "Erstelle 3 Generic Resources für verschiedene Rollen.",
        steps: [
          "Navigiere zum Ressourcen-Bereich",
          "Erstelle Generic Resource 1: 'Senior Developer' mit Skills: Java, Spring, AWS",
          "Erstelle Generic Resource 2: 'UX Designer' mit Skills: Figma, User Research, Prototyping",
          "Erstelle Generic Resource 3: 'Project Manager' mit Skills: Agile, Scrum, Stakeholder Management",
          "Setze für alle eine Standard-Kapazität von 40h/Woche",
          "Überprüfe, dass alle drei in der Ressourcenliste erscheinen"
        ],
        expectedResult: "3 Generic Resources sind angelegt und unterscheidbar durch ihre Rollen und Skills.",
        checkpoints: ["3 Generic Resources erstellt", "Skills korrekt zugewiesen", "Kapazitäten gesetzt", "In Liste sichtbar"],
        skills: ["Generic Resources", "Rollen-Definition"]
      },
      {
        id: "tc1-e5",
        difficulty: 2,
        title: "Ressourcen-Attribute anpassen",
        scenario: "Die Standard-Attribute reichen nicht aus. Du brauchst zusätzliche Felder.",
        task: "Finde heraus, welche Custom Attributes verfügbar sind und konfiguriere eines.",
        steps: [
          "Gehe zu den Admin-Einstellungen oder Attribut-Management",
          "Prüfe, welche Standard-Attribute für Ressourcen existieren",
          "Finde die Option für Custom Attributes",
          "Erstelle ein neues Attribut 'Kostenstelle' als Dropdown mit 3 Werten",
          "Weise das Attribut einer bestehenden Ressource zu",
          "Überprüfe, dass das Attribut in der Ressourcen-Ansicht erscheint"
        ],
        expectedResult: "Ein Custom Attribute ist erstellt und einer Ressource zugewiesen.",
        checkpoints: ["Admin-Bereich gefunden", "Custom Attribute erstellt", "Werte definiert", "Ressource aktualisiert"],
        skills: ["Attribute Management", "Customization"]
      }
    ]
  },

  // ============================================
  // MODUL 2: Projekt-Konfiguration
  // ============================================
  {
    module: 2,
    title: "Projekt-Konfiguration",
    description: "Erstelle und konfiguriere Projekte mit allen wichtigen Einstellungen",
    exercises: [
      {
        id: "tc2-e1",
        difficulty: 2,
        title: "Erstes Projekt anlegen",
        scenario: "Du sollst ein neues Softwareentwicklungsprojekt im System anlegen.",
        task: "Erstelle ein vollständiges Projekt mit allen relevanten Metadaten.",
        steps: [
          "Navigiere zum Projekt-Bereich",
          "Klicke auf 'Neues Projekt' erstellen",
          "Vergib einen aussagekräftigen Namen: 'Website Relaunch 2024'",
          "Setze das Startdatum auf heute",
          "Setze das Enddatum auf +6 Monate",
          "Wähle einen Projektstatus (z.B. 'In Planung')",
          "Setze die Priorität auf 'Hoch'",
          "Füge eine Projektbeschreibung hinzu",
          "Speichere das Projekt"
        ],
        expectedResult: "Ein neues Projekt ist angelegt mit korrekten Daten und Metadaten.",
        checkpoints: ["Projekt erstellt", "Daten korrekt", "Status gesetzt", "Priorität definiert"],
        skills: ["Projekt-Erstellung", "Metadaten"]
      },
      {
        id: "tc2-e2",
        difficulty: 2,
        title: "Projektphasen definieren",
        scenario: "Das Projekt braucht eine klare Phasenstruktur.",
        task: "Unterteile das Projekt in logische Phasen.",
        steps: [
          "Öffne das erstellte Projekt",
          "Finde die Option für Phasen/Meilensteine",
          "Erstelle Phase 1: 'Discovery' (2 Wochen)",
          "Erstelle Phase 2: 'Design' (4 Wochen)",
          "Erstelle Phase 3: 'Development' (12 Wochen)",
          "Erstelle Phase 4: 'Testing' (4 Wochen)",
          "Erstelle Phase 5: 'Go-Live' (2 Wochen)",
          "Überprüfe die Timeline-Darstellung"
        ],
        expectedResult: "Das Projekt hat 5 definierte Phasen mit korrekten Zeiträumen.",
        checkpoints: ["5 Phasen erstellt", "Zeiträume korrekt", "Timeline sichtbar", "Phasen sequentiell"],
        skills: ["Projektstruktur", "Phasenplanung"]
      },
      {
        id: "tc2-e3",
        difficulty: 3,
        title: "Ressourcen zum Projekt zuweisen",
        scenario: "Das Projekt braucht ein Team. Weise Ressourcen zu.",
        task: "Erstelle Allocations für verschiedene Ressourcen über verschiedene Phasen.",
        steps: [
          "Öffne das Projekt und gehe zu Ressourcen/Allocations",
          "Weise den 'Senior Developer' der Development-Phase zu (100%)",
          "Weise den 'UX Designer' der Design-Phase zu (100%)",
          "Weise den 'Project Manager' dem gesamten Projekt zu (50%)",
          "Erstelle eine Allocation für deine Named Resource (25% in Testing)",
          "Überprüfe die Gesamtauslastung des Projekts",
          "Prüfe, ob Konflikte angezeigt werden"
        ],
        expectedResult: "4 Ressourcen sind dem Projekt zugewiesen mit korrekten Prozentsätzen und Zeiträumen.",
        checkpoints: ["4 Allocations erstellt", "Prozente korrekt", "Zeiträume passend", "Keine Konflikte"],
        skills: ["Resource Allocation", "Teamplanung"]
      },
      {
        id: "tc2-e4",
        difficulty: 3,
        title: "Resource Request erstellen",
        scenario: "Du brauchst eine zusätzliche Ressource, die du nicht selbst zuweisen kannst.",
        task: "Erstelle einen formellen Resource Request.",
        steps: [
          "Navigiere zur Resource Request Funktion",
          "Erstelle einen neuen Request für das Projekt",
          "Definiere die benötigte Rolle: 'QA Engineer'",
          "Setze den Zeitraum: Testing-Phase",
          "Setze die Allocation: 100%",
          "Füge benötigte Skills hinzu: Selenium, Test Automation, JIRA",
          "Schreibe eine Begründung",
          "Setze die Priorität auf 'Hoch'",
          "Sende den Request ab"
        ],
        expectedResult: "Ein Resource Request ist erstellt und wartet auf Genehmigung.",
        checkpoints: ["Request erstellt", "Skills definiert", "Begründung vorhanden", "Request gesendet"],
        skills: ["Resource Requests", "Bedarfsplanung"]
      },
      {
        id: "tc2-e5",
        difficulty: 3,
        title: "Projekt-Views konfigurieren",
        scenario: "Du möchtest verschiedene Ansichten für dein Projekt einrichten.",
        task: "Konfiguriere und speichere verschiedene Views für das Projekt.",
        steps: [
          "Öffne das Projekt und wechsle zur Grid View",
          "Passe die Spalten an: Füge 'Skills' und 'Allocation %' hinzu",
          "Speichere diese View als 'Team-Übersicht'",
          "Wechsle zur Gantt View",
          "Konfiguriere die Zeitskala (Wochen)",
          "Speichere als 'Timeline-Ansicht'",
          "Wechsle zur Kanban View (falls verfügbar)",
          "Konfiguriere die Spalten nach Status",
          "Teste den Wechsel zwischen den gespeicherten Views"
        ],
        expectedResult: "3 verschiedene Views sind konfiguriert und gespeichert.",
        checkpoints: ["Grid View angepasst", "Gantt konfiguriert", "Views gespeichert", "Wechsel funktioniert"],
        skills: ["View-Konfiguration", "Personalisierung"]
      }
    ]
  },

  // ============================================
  // MODUL 3: Kapazitätsplanung & Auslastung
  // ============================================
  {
    module: 3,
    title: "Kapazitätsplanung & Auslastung",
    description: "Analysiere und optimiere die Ressourcenauslastung",
    exercises: [
      {
        id: "tc3-e1",
        difficulty: 2,
        title: "Kapazitätsübersicht analysieren",
        scenario: "Du sollst die aktuelle Kapazitätssituation deines Teams verstehen.",
        task: "Finde und analysiere die Kapazitätsübersicht.",
        steps: [
          "Navigiere zur Kapazitätsplanung oder Auslastungsübersicht",
          "Wähle einen Zeitraum von 3 Monaten",
          "Filtere auf deine erstellten Ressourcen",
          "Identifiziere: Wer hat freie Kapazität?",
          "Identifiziere: Wer ist überbucht?",
          "Notiere die Net Availability für jede Ressource",
          "Exportiere die Übersicht (falls möglich)"
        ],
        expectedResult: "Du verstehst die Kapazitätssituation und kannst Über-/Unterauslastung erkennen.",
        checkpoints: ["Übersicht gefunden", "Zeitraum gesetzt", "Filter angewendet", "Analyse dokumentiert"],
        skills: ["Capacity Planning", "Analyse"]
      },
      {
        id: "tc3-e2",
        difficulty: 3,
        title: "Überauslastung simulieren und lösen",
        scenario: "Eine Ressource ist überbucht. Du sollst das Problem identifizieren und lösen.",
        task: "Erstelle bewusst eine Überauslastung und löse sie dann.",
        steps: [
          "Wähle eine deiner Named Resources",
          "Erstelle eine zusätzliche Allocation von 80% für ein anderes Projekt",
          "Beobachte, wie das System die Überauslastung anzeigt",
          "Finde die visuelle Warnung (rote Markierung o.ä.)",
          "Lösung 1: Reduziere eine der Allocations auf 50%",
          "Überprüfe, dass die Warnung verschwindet",
          "Lösung 2 (alternativ): Verschiebe eine Allocation zeitlich",
          "Dokumentiere beide Lösungsansätze"
        ],
        expectedResult: "Du kannst Überauslastungen erkennen und mit verschiedenen Methoden lösen.",
        checkpoints: ["Überauslastung erstellt", "Warnung erkannt", "Lösung 1 angewendet", "Lösung 2 getestet"],
        skills: ["Konfliktlösung", "Auslastungsoptimierung"]
      },
      {
        id: "tc3-e3",
        difficulty: 3,
        title: "Abwesenheiten eintragen",
        scenario: "Ressourcen haben Urlaub und Krankheitstage, die berücksichtigt werden müssen.",
        task: "Trage verschiedene Abwesenheiten für deine Ressourcen ein.",
        steps: [
          "Finde den Bereich für Abwesenheiten/Time Off",
          "Trage für eine Ressource 2 Wochen Urlaub ein",
          "Trage für eine andere Ressource 3 Tage Krankheit ein",
          "Trage einen Feiertag ein (falls systemweit möglich)",
          "Überprüfe, wie sich die Net Availability ändert",
          "Prüfe, ob Projektzuweisungen betroffen sind",
          "Schaue, ob Warnungen für betroffene Projekte erscheinen"
        ],
        expectedResult: "Abwesenheiten sind eingetragen und beeinflussen die Kapazitätsberechnung.",
        checkpoints: ["Urlaub eingetragen", "Krankheit eingetragen", "Kapazität aktualisiert", "Warnungen geprüft"],
        skills: ["Abwesenheitsmanagement", "Kapazitätsplanung"]
      },
      {
        id: "tc3-e4",
        difficulty: 4,
        title: "Demand vs. Capacity Analyse",
        scenario: "Das Management will wissen, ob die Kapazität für alle geplanten Projekte reicht.",
        task: "Erstelle eine Demand vs. Capacity Analyse.",
        steps: [
          "Navigiere zum Reporting oder Analytics Bereich",
          "Finde einen Report für Demand vs. Capacity",
          "Wähle einen Zeitraum von 6 Monaten",
          "Analysiere: In welchen Monaten übersteigt Demand die Capacity?",
          "Identifiziere die kritischsten Skills/Rollen",
          "Erstelle einen Screenshot oder Export",
          "Formuliere 3 Handlungsempfehlungen basierend auf der Analyse"
        ],
        expectedResult: "Eine Demand/Capacity Analyse ist erstellt mit konkreten Handlungsempfehlungen.",
        checkpoints: ["Report gefunden", "Analyse durchgeführt", "Gaps identifiziert", "Empfehlungen formuliert"],
        skills: ["Demand Management", "Strategische Planung"]
      },
      {
        id: "tc3-e5",
        difficulty: 4,
        title: "What-If Szenario erstellen",
        scenario: "Du sollst analysieren, was passiert, wenn 2 Ressourcen das Team verlassen.",
        task: "Erstelle und analysiere ein What-If Szenario.",
        steps: [
          "Finde die What-If oder Szenario-Funktion",
          "Erstelle ein neues Szenario: 'Ressourcen-Verlust Q3'",
          "Kopiere die aktuelle Planung in das Szenario",
          "Entferne 2 Ressourcen aus dem Szenario",
          "Analysiere die Auswirkungen auf alle Projekte",
          "Identifiziere die kritischsten Projekte",
          "Dokumentiere mögliche Gegenmaßnahmen",
          "Vergleiche Szenario mit der Baseline"
        ],
        expectedResult: "Ein What-If Szenario zeigt die Auswirkungen von Ressourcenverlust.",
        checkpoints: ["Szenario erstellt", "Ressourcen entfernt", "Auswirkungen analysiert", "Maßnahmen dokumentiert"],
        skills: ["What-If Planning", "Risikoanalyse"]
      }
    ]
  },

  // ============================================
  // MODUL 4: BPAFG (Bulk Project Allocation Flatgrid)
  // ============================================
  {
    module: 4,
    title: "BPAFG Mastery",
    description: "Meistere das Bulk Project Allocation Flatgrid für effiziente Massenbearbeitung",
    exercises: [
      {
        id: "tc4-e1",
        difficulty: 2,
        title: "BPAFG Navigation",
        scenario: "Du sollst das BPAFG kennenlernen und verstehen.",
        task: "Navigiere durch alle BPAFG-Funktionen und Modi.",
        steps: [
          "Öffne das BPAFG (Bulk Project Allocation Flatgrid)",
          "Identifiziere die drei Modi: Default, RM Mode, PM Mode",
          "Wechsle in den RM Mode und beobachte die Änderung",
          "Wechsle in den PM Mode und beobachte die Änderung",
          "Finde die Filter-Optionen",
          "Finde die Zeitraum-Einstellungen",
          "Identifiziere die Farbcodierung für Auslastung"
        ],
        expectedResult: "Du verstehst die BPAFG-Oberfläche und kannst zwischen Modi wechseln.",
        checkpoints: ["BPAFG geöffnet", "Modi verstanden", "Filter gefunden", "Farbcodes erkannt"],
        skills: ["BPAFG Grundlagen", "Navigation"]
      },
      {
        id: "tc4-e2",
        difficulty: 3,
        title: "RM Mode: Ressourcen-zentrierte Planung",
        scenario: "Als Resource Manager willst du die Auslastung einzelner Ressourcen optimieren.",
        task: "Nutze den RM Mode für ressourcen-zentrierte Analyse und Änderungen.",
        steps: [
          "Wechsle in den RM Mode",
          "Wähle eine deiner Ressourcen aus",
          "Betrachte alle Projekte, denen diese Ressource zugewiesen ist",
          "Identifiziere Zeiträume mit Über-/Unterauslastung",
          "Ändere eine Allocation direkt im Grid (z.B. von 100% auf 80%)",
          "Füge eine neue Allocation für ein anderes Projekt hinzu",
          "Speichere die Änderungen",
          "Überprüfe die aktualisierte Net Availability"
        ],
        expectedResult: "Du kannst im RM Mode effizient die Auslastung einer Ressource verwalten.",
        checkpoints: ["RM Mode aktiv", "Ressource analysiert", "Allocation geändert", "Neue Allocation erstellt"],
        skills: ["BPAFG RM Mode", "Ressourcenoptimierung"]
      },
      {
        id: "tc4-e3",
        difficulty: 3,
        title: "PM Mode: Projekt-zentrierte Planung",
        scenario: "Als Project Manager willst du dein Projektteam im Überblick sehen und anpassen.",
        task: "Nutze den PM Mode für projekt-zentrierte Teamverwaltung.",
        steps: [
          "Wechsle in den PM Mode",
          "Wähle dein erstelltes Projekt aus",
          "Betrachte alle zugewiesenen Ressourcen",
          "Identifiziere Lücken in der Teambesetzung",
          "Füge eine neue Ressource zum Team hinzu",
          "Passe die Zeiträume einer bestehenden Allocation an",
          "Entferne eine Allocation (falls nicht mehr benötigt)",
          "Speichere und überprüfe die Projektübersicht"
        ],
        expectedResult: "Du kannst im PM Mode effizient dein Projektteam verwalten.",
        checkpoints: ["PM Mode aktiv", "Projekt analysiert", "Ressource hinzugefügt", "Allocation angepasst"],
        skills: ["BPAFG PM Mode", "Teammanagement"]
      },
      {
        id: "tc4-e4",
        difficulty: 4,
        title: "Bulk-Änderungen durchführen",
        scenario: "Mehrere Allocations müssen gleichzeitig angepasst werden.",
        task: "Führe Massenänderungen im BPAFG durch.",
        steps: [
          "Öffne das BPAFG im Default Mode",
          "Wähle mehrere Zellen gleichzeitig aus (Shift+Klick oder Drag)",
          "Ändere alle ausgewählten Werte auf einmal",
          "Nutze Copy/Paste für wiederkehrende Muster",
          "Verschiebe mehrere Allocations gleichzeitig (falls möglich)",
          "Nutze die Undo-Funktion, um Änderungen rückgängig zu machen",
          "Speichere alle Änderungen auf einmal"
        ],
        expectedResult: "Du kannst effizient Massenänderungen im BPAFG durchführen.",
        checkpoints: ["Mehrfachauswahl genutzt", "Bulk-Änderung durchgeführt", "Copy/Paste verwendet", "Undo getestet"],
        skills: ["BPAFG Advanced", "Effizienz"]
      },
      {
        id: "tc4-e5",
        difficulty: 4,
        title: "New Assignment Mode",
        scenario: "Du musst schnell viele neue Zuweisungen für ein dringendes Projekt erstellen.",
        task: "Nutze den New Assignment Mode für schnelle Zuweisungserstellung.",
        steps: [
          "Aktiviere den New Assignment Mode im BPAFG",
          "Wähle das Zielprojekt aus",
          "Erstelle 5 neue Allocations für verschiedene Ressourcen",
          "Variiere die Prozentsätze (25%, 50%, 75%, 100%)",
          "Variiere die Zeiträume",
          "Überprüfe vor dem Speichern auf Konflikte",
          "Speichere alle neuen Allocations",
          "Verifiziere die Erstellung in der Projektübersicht"
        ],
        expectedResult: "5 neue Allocations sind schnell und effizient erstellt.",
        checkpoints: ["New Assignment Mode aktiv", "5 Allocations erstellt", "Keine Konflikte", "Alle gespeichert"],
        skills: ["BPAFG New Assignment", "Schnelle Planung"]
      }
    ]
  },

  // ============================================
  // MODUL 5: Skills Management
  // ============================================
  {
    module: 5,
    title: "Skills Management",
    description: "Konfiguriere und nutze das Skills-System für bessere Ressourcenplanung",
    exercises: [
      {
        id: "tc5-e1",
        difficulty: 2,
        title: "Skill-Katalog erkunden",
        scenario: "Du sollst verstehen, welche Skills im System verfügbar sind.",
        task: "Erkunde und dokumentiere den vorhandenen Skill-Katalog.",
        steps: [
          "Navigiere zum Skills Management Bereich",
          "Finde den Skill-Katalog oder die Skill-Bibliothek",
          "Identifiziere die Skill-Kategorien (z.B. Technisch, Soft Skills)",
          "Zähle, wie viele Skills pro Kategorie existieren",
          "Finde heraus, ob Skills Hierarchien haben",
          "Notiere 5 Skills, die für deine Rolle relevant sind"
        ],
        expectedResult: "Du verstehst die Struktur des Skill-Katalogs.",
        checkpoints: ["Katalog gefunden", "Kategorien identifiziert", "Hierarchien verstanden", "Relevante Skills notiert"],
        skills: ["Skills Management", "Katalog-Verständnis"]
      },
      {
        id: "tc5-e2",
        difficulty: 3,
        title: "Neue Skills anlegen",
        scenario: "Der Skill-Katalog ist unvollständig. Du sollst neue Skills hinzufügen.",
        task: "Erstelle 5 neue Skills mit korrekter Kategorisierung.",
        steps: [
          "Gehe zum Skill-Management (Admin-Bereich)",
          "Erstelle Skill 1: 'Tempus Resource' (Kategorie: Tools)",
          "Erstelle Skill 2: 'Resource Management' (Kategorie: Methoden)",
          "Erstelle Skill 3: 'Kundenberatung' (Kategorie: Soft Skills)",
          "Erstelle Skill 4: 'AWS Cloud' (Kategorie: Technisch)",
          "Erstelle Skill 5: 'Agile Coaching' (Kategorie: Methoden)",
          "Überprüfe, dass alle Skills im Katalog erscheinen"
        ],
        expectedResult: "5 neue Skills sind korrekt kategorisiert im System angelegt.",
        checkpoints: ["5 Skills erstellt", "Kategorien korrekt", "Im Katalog sichtbar", "Keine Duplikate"],
        skills: ["Skill-Erstellung", "Kategorisierung"]
      },
      {
        id: "tc5-e3",
        difficulty: 3,
        title: "Skills zu Ressourcen zuweisen",
        scenario: "Deine Ressourcen brauchen Skill-Profile für besseres Matching.",
        task: "Weise deinen Ressourcen passende Skills mit Proficiency-Levels zu.",
        steps: [
          "Öffne eine deiner Named Resources",
          "Navigiere zum Skills-Bereich der Ressource",
          "Füge 5 Skills hinzu",
          "Setze für jeden Skill ein Proficiency-Level (z.B. 1-5 oder Beginner-Expert)",
          "Wiederhole für eine zweite Ressource mit anderen Skills",
          "Überprüfe die Skill-Profile in der Ressourcenübersicht"
        ],
        expectedResult: "2 Ressourcen haben vollständige Skill-Profile mit Levels.",
        checkpoints: ["Skills zugewiesen", "Levels gesetzt", "2 Ressourcen aktualisiert", "Profile sichtbar"],
        skills: ["Skill-Zuweisung", "Proficiency-Management"]
      },
      {
        id: "tc5-e4",
        difficulty: 4,
        title: "Skill-basierte Suche",
        scenario: "Du suchst Ressourcen mit bestimmten Skills für ein Projekt.",
        task: "Nutze die Skill-Suche, um passende Ressourcen zu finden.",
        steps: [
          "Gehe zur Ressourcensuche oder zum Ressourcen-Filter",
          "Suche nach Ressourcen mit Skill 'Java'",
          "Verfeinere: Nur Ressourcen mit Level 3+ (oder 'Advanced')",
          "Füge einen zweiten Skill als Filter hinzu",
          "Prüfe die Verfügbarkeit der gefundenen Ressourcen",
          "Speichere die Suche als Filter (falls möglich)",
          "Dokumentiere die Suchergebnisse"
        ],
        expectedResult: "Du kannst effizient Ressourcen nach Skills und Levels filtern.",
        checkpoints: ["Skill-Filter genutzt", "Level-Filter angewendet", "Ergebnisse relevant", "Suche gespeichert"],
        skills: ["Skill-Suche", "Ressourcen-Matching"]
      },
      {
        id: "tc5-e5",
        difficulty: 4,
        title: "Skill-Gap Analyse",
        scenario: "Du sollst analysieren, welche Skills im Team fehlen.",
        task: "Führe eine Skill-Gap Analyse durch.",
        steps: [
          "Definiere die benötigten Skills für ein Projekt (z.B. 5 Skills)",
          "Analysiere, welche Ressourcen diese Skills haben",
          "Identifiziere Gaps: Welche Skills fehlen komplett?",
          "Identifiziere Gaps: Welche Skills haben zu niedrige Levels?",
          "Erstelle eine Übersicht: Skill → Verfügbare Ressourcen → Gap",
          "Formuliere Empfehlungen: Training oder Recruiting?",
          "Dokumentiere die Analyse"
        ],
        expectedResult: "Eine Skill-Gap Analyse zeigt fehlende Kompetenzen und Handlungsoptionen.",
        checkpoints: ["Benötigte Skills definiert", "Gaps identifiziert", "Analyse dokumentiert", "Empfehlungen formuliert"],
        skills: ["Gap-Analyse", "Strategische Planung"]
      }
    ]
  },

  // ============================================
  // MODUL 6: Reporting & Dashboards
  // ============================================
  {
    module: 6,
    title: "Reporting & Dashboards",
    description: "Erstelle aussagekräftige Reports und Dashboards",
    exercises: [
      {
        id: "tc6-e1",
        difficulty: 2,
        title: "Standard-Reports erkunden",
        scenario: "Du sollst die verfügbaren Standard-Reports kennenlernen.",
        task: "Finde und teste alle Standard-Reports.",
        steps: [
          "Navigiere zum Reporting-Bereich",
          "Liste alle verfügbaren Standard-Reports auf",
          "Öffne den 'Resource Availability Report' (RAR)",
          "Öffne den 'Project Status Report'",
          "Öffne den 'Allocation Report'",
          "Teste verschiedene Filter und Zeiträume",
          "Exportiere einen Report als PDF oder Excel"
        ],
        expectedResult: "Du kennst alle Standard-Reports und kannst sie nutzen.",
        checkpoints: ["Reports gefunden", "RAR getestet", "Filter angewendet", "Export durchgeführt"],
        skills: ["Reporting Basics", "Standard-Reports"]
      },
      {
        id: "tc6-e2",
        difficulty: 3,
        title: "RAR2 konfigurieren",
        scenario: "Du brauchst einen detaillierten Verfügbarkeitsbericht.",
        task: "Konfiguriere den RAR2 Report für spezifische Anforderungen.",
        steps: [
          "Öffne den RAR2 (Resource Availability Report 2)",
          "Setze den Zeitraum auf die nächsten 6 Monate",
          "Filtere auf eine bestimmte Abteilung oder Skill-Gruppe",
          "Wähle die Aggregationsebene (z.B. Woche, Monat)",
          "Aktiviere Drill-down Funktionen",
          "Konfiguriere die angezeigten Metriken",
          "Speichere die Report-Konfiguration",
          "Exportiere den konfigurierten Report"
        ],
        expectedResult: "Ein maßgeschneiderter RAR2 Report ist konfiguriert und exportiert.",
        checkpoints: ["RAR2 geöffnet", "Filter konfiguriert", "Aggregation gewählt", "Report gespeichert"],
        skills: ["RAR2", "Report-Konfiguration"]
      },
      {
        id: "tc6-e3",
        difficulty: 3,
        title: "Dashboard erstellen",
        scenario: "Das Management braucht ein Übersichts-Dashboard.",
        task: "Erstelle ein benutzerdefiniertes Dashboard.",
        steps: [
          "Navigiere zum Dashboard-Bereich",
          "Erstelle ein neues Dashboard: 'Management Übersicht'",
          "Füge Widget 1 hinzu: Gesamtauslastung (Gauge/Chart)",
          "Füge Widget 2 hinzu: Projekte nach Status (Pie Chart)",
          "Füge Widget 3 hinzu: Top 5 überlastete Ressourcen (Liste)",
          "Füge Widget 4 hinzu: Kapazität vs. Demand (Bar Chart)",
          "Arrangiere die Widgets sinnvoll",
          "Speichere und teile das Dashboard"
        ],
        expectedResult: "Ein Dashboard mit 4 Widgets ist erstellt und gespeichert.",
        checkpoints: ["Dashboard erstellt", "4 Widgets hinzugefügt", "Layout angepasst", "Dashboard geteilt"],
        skills: ["Dashboard-Erstellung", "Visualisierung"]
      },
      {
        id: "tc6-e4",
        difficulty: 4,
        title: "Scheduled Reports einrichten",
        scenario: "Reports sollen automatisch wöchentlich versendet werden.",
        task: "Richte automatische Report-Versendung ein.",
        steps: [
          "Finde die Funktion für Scheduled/Automated Reports",
          "Wähle einen Report für die Automatisierung",
          "Konfiguriere den Zeitplan: Jeden Montag um 8:00 Uhr",
          "Definiere die Empfänger (E-Mail-Adressen)",
          "Wähle das Format (PDF, Excel)",
          "Aktiviere den Schedule",
          "Teste mit 'Jetzt senden' (falls verfügbar)",
          "Dokumentiere die Konfiguration"
        ],
        expectedResult: "Ein automatischer Report-Versand ist eingerichtet.",
        checkpoints: ["Schedule-Funktion gefunden", "Zeitplan konfiguriert", "Empfänger definiert", "Schedule aktiviert"],
        skills: ["Report Automation", "Scheduling"]
      },
      {
        id: "tc6-e5",
        difficulty: 4,
        title: "Custom Report erstellen",
        scenario: "Die Standard-Reports reichen nicht. Du brauchst einen Custom Report.",
        task: "Erstelle einen benutzerdefinierten Report.",
        steps: [
          "Finde den Report Builder oder Custom Report Bereich",
          "Erstelle einen neuen Report: 'Projekt-Ressourcen-Matrix'",
          "Wähle die Datenquelle: Projekte und Allocations",
          "Definiere die Spalten: Projekt, Ressource, Rolle, Allocation %, Zeitraum",
          "Füge Filter hinzu: Nur aktive Projekte",
          "Füge Gruppierung hinzu: Nach Projekt",
          "Füge Summen/Aggregationen hinzu",
          "Speichere und teste den Report"
        ],
        expectedResult: "Ein Custom Report ist erstellt und liefert die gewünschten Daten.",
        checkpoints: ["Report Builder genutzt", "Spalten definiert", "Filter angewendet", "Report funktioniert"],
        skills: ["Custom Reporting", "Datenanalyse"]
      }
    ]
  },

  // ============================================
  // MODUL 7: Administration & Berechtigungen
  // ============================================
  {
    module: 7,
    title: "Administration & Berechtigungen",
    description: "Verstehe und konfiguriere Admin-Funktionen und Zugriffsrechte",
    exercises: [
      {
        id: "tc7-e1",
        difficulty: 3,
        title: "Benutzerrollen verstehen",
        scenario: "Du sollst das Berechtigungssystem verstehen.",
        task: "Analysiere die vorhandenen Benutzerrollen und ihre Rechte.",
        steps: [
          "Navigiere zum Admin-Bereich für Benutzer/Rollen",
          "Liste alle vorhandenen Rollen auf (z.B. Admin, PM, RM, Viewer)",
          "Öffne die Details einer Rolle",
          "Dokumentiere: Welche Rechte hat ein 'Project Manager'?",
          "Dokumentiere: Welche Rechte hat ein 'Resource Manager'?",
          "Identifiziere den Unterschied zwischen den Rollen",
          "Finde heraus, wer Rollen zuweisen darf"
        ],
        expectedResult: "Du verstehst das Rollenkonzept und die Unterschiede zwischen Rollen.",
        checkpoints: ["Rollen gefunden", "Rechte analysiert", "Unterschiede dokumentiert", "Zuweisung verstanden"],
        skills: ["Berechtigungen", "Rollenkonzept"]
      },
      {
        id: "tc7-e2",
        difficulty: 3,
        title: "Testbenutzer anlegen",
        scenario: "Du sollst einen neuen Benutzer für Testzwecke anlegen.",
        task: "Erstelle einen neuen Benutzer mit spezifischen Rechten.",
        steps: [
          "Gehe zur Benutzerverwaltung",
          "Erstelle einen neuen Benutzer: 'Test PM'",
          "Vergib E-Mail und temporäres Passwort",
          "Weise die Rolle 'Project Manager' zu",
          "Beschränke den Zugriff auf bestimmte Projekte (falls möglich)",
          "Aktiviere den Benutzer",
          "Teste den Login mit dem neuen Benutzer (falls möglich)",
          "Dokumentiere die Konfiguration"
        ],
        expectedResult: "Ein neuer Benutzer ist angelegt und hat die korrekten Rechte.",
        checkpoints: ["Benutzer erstellt", "Rolle zugewiesen", "Zugriff konfiguriert", "Benutzer aktiv"],
        skills: ["Benutzerverwaltung", "Rechtezuweisung"]
      },
      {
        id: "tc7-e3",
        difficulty: 4,
        title: "Organisationsstruktur konfigurieren",
        scenario: "Die Organisationsstruktur muss im System abgebildet werden.",
        task: "Konfiguriere Abteilungen und Hierarchien.",
        steps: [
          "Finde den Bereich für Organisationsstruktur",
          "Erstelle eine Abteilung: 'Engineering'",
          "Erstelle eine Unterabteilung: 'Frontend Team'",
          "Erstelle eine Unterabteilung: 'Backend Team'",
          "Erstelle eine zweite Hauptabteilung: 'Product'",
          "Weise Ressourcen den Abteilungen zu",
          "Überprüfe, dass die Hierarchie korrekt dargestellt wird",
          "Teste Filter nach Abteilung"
        ],
        expectedResult: "Eine Organisationsstruktur mit Hierarchien ist konfiguriert.",
        checkpoints: ["Abteilungen erstellt", "Hierarchie korrekt", "Ressourcen zugewiesen", "Filter funktioniert"],
        skills: ["Org-Struktur", "Hierarchie-Management"]
      },
      {
        id: "tc7-e4",
        difficulty: 4,
        title: "Workflow-Regeln konfigurieren",
        scenario: "Resource Requests sollen einen Genehmigungsworkflow haben.",
        task: "Konfiguriere einen Genehmigungsworkflow.",
        steps: [
          "Finde den Bereich für Workflows oder Genehmigungen",
          "Analysiere den Standard-Workflow für Resource Requests",
          "Konfiguriere: Wer muss genehmigen? (z.B. Resource Manager)",
          "Konfiguriere: Gibt es Eskalation bei Timeout?",
          "Konfiguriere: Welche Benachrichtigungen werden gesendet?",
          "Teste den Workflow mit einem neuen Request",
          "Dokumentiere den konfigurierten Workflow"
        ],
        expectedResult: "Ein Genehmigungsworkflow ist konfiguriert und getestet.",
        checkpoints: ["Workflow gefunden", "Genehmiger konfiguriert", "Benachrichtigungen aktiv", "Workflow getestet"],
        skills: ["Workflow-Konfiguration", "Genehmigungsprozesse"]
      },
      {
        id: "tc7-e5",
        difficulty: 5,
        title: "System-Einstellungen optimieren",
        scenario: "Du sollst die globalen System-Einstellungen überprüfen und optimieren.",
        task: "Analysiere und dokumentiere alle wichtigen System-Einstellungen.",
        steps: [
          "Navigiere zu den globalen System-Einstellungen",
          "Dokumentiere die Zeitzone-Einstellung",
          "Dokumentiere die Standard-Kapazität (Stunden/Woche)",
          "Dokumentiere die Fiscal Year Einstellungen",
          "Prüfe die E-Mail/Benachrichtigungs-Einstellungen",
          "Prüfe die Integrations-Einstellungen (falls vorhanden)",
          "Prüfe die Backup/Audit-Einstellungen",
          "Erstelle eine Dokumentation aller Einstellungen"
        ],
        expectedResult: "Alle wichtigen System-Einstellungen sind dokumentiert.",
        checkpoints: ["Einstellungen gefunden", "Zeitzone dokumentiert", "Kapazität dokumentiert", "Vollständige Doku"],
        skills: ["System-Administration", "Dokumentation"]
      }
    ]
  },

  // ============================================
  // MODUL 8: Integrationen & Datenimport
  // ============================================
  {
    module: 8,
    title: "Integrationen & Datenimport",
    description: "Lerne Datenimport und Integrationsmöglichkeiten kennen",
    exercises: [
      {
        id: "tc8-e1",
        difficulty: 3,
        title: "CSV-Import vorbereiten",
        scenario: "Du sollst Ressourcen aus einer Excel-Liste importieren.",
        task: "Bereite einen CSV-Import vor und führe ihn durch.",
        steps: [
          "Finde die Import-Funktion für Ressourcen",
          "Lade die Import-Vorlage herunter (falls verfügbar)",
          "Erstelle eine CSV-Datei mit 5 Test-Ressourcen",
          "Fülle alle Pflichtfelder: Name, E-Mail, Abteilung, Kapazität",
          "Füge optionale Felder hinzu: Skills, Startdatum",
          "Lade die CSV-Datei hoch",
          "Überprüfe die Vorschau und korrigiere Fehler",
          "Führe den Import durch und verifiziere"
        ],
        expectedResult: "5 Ressourcen sind erfolgreich per CSV importiert.",
        checkpoints: ["Vorlage verstanden", "CSV erstellt", "Import durchgeführt", "Ressourcen verifiziert"],
        skills: ["Datenimport", "CSV-Handling"]
      },
      {
        id: "tc8-e2",
        difficulty: 3,
        title: "Projekt-Import",
        scenario: "Mehrere Projekte sollen aus einer Datei importiert werden.",
        task: "Importiere Projekte mit allen Metadaten.",
        steps: [
          "Finde die Import-Funktion für Projekte",
          "Erstelle eine CSV mit 3 Projekten",
          "Fülle: Name, Startdatum, Enddatum, Status, Priorität",
          "Füge Projektbeschreibungen hinzu",
          "Lade die Datei hoch",
          "Mappe die Spalten zu den Systemfeldern",
          "Überprüfe die Vorschau",
          "Importiere und verifiziere die Projekte"
        ],
        expectedResult: "3 Projekte sind mit korrekten Daten importiert.",
        checkpoints: ["CSV erstellt", "Mapping korrekt", "Import erfolgreich", "Projekte verifiziert"],
        skills: ["Projekt-Import", "Daten-Mapping"]
      },
      {
        id: "tc8-e3",
        difficulty: 4,
        title: "Datenexport für Analyse",
        scenario: "Du brauchst Daten für eine externe Analyse.",
        task: "Exportiere verschiedene Datensätze in verschiedenen Formaten.",
        steps: [
          "Exportiere alle Ressourcen als CSV",
          "Exportiere alle Projekte als Excel",
          "Exportiere Allocations für einen Zeitraum",
          "Exportiere einen Report als PDF",
          "Vergleiche die Export-Formate",
          "Öffne die Dateien und prüfe die Vollständigkeit",
          "Dokumentiere, welche Daten in welchem Format am besten exportiert werden"
        ],
        expectedResult: "Verschiedene Datenexporte sind durchgeführt und dokumentiert.",
        checkpoints: ["Ressourcen exportiert", "Projekte exportiert", "Allocations exportiert", "Formate verglichen"],
        skills: ["Datenexport", "Formatverständnis"]
      },
      {
        id: "tc8-e4",
        difficulty: 4,
        title: "API-Dokumentation erkunden",
        scenario: "Du sollst verstehen, welche API-Möglichkeiten es gibt.",
        task: "Erkunde und dokumentiere die API-Funktionen.",
        steps: [
          "Finde die API-Dokumentation (falls verfügbar)",
          "Identifiziere die verfügbaren Endpoints",
          "Dokumentiere: Welche Daten können gelesen werden?",
          "Dokumentiere: Welche Daten können geschrieben werden?",
          "Finde Informationen zur Authentifizierung",
          "Notiere Rate Limits oder Einschränkungen",
          "Erstelle eine Übersicht der wichtigsten API-Funktionen"
        ],
        expectedResult: "Die API-Möglichkeiten sind dokumentiert und verstanden.",
        checkpoints: ["Doku gefunden", "Endpoints identifiziert", "Auth verstanden", "Übersicht erstellt"],
        skills: ["API-Verständnis", "Dokumentation"]
      },
      {
        id: "tc8-e5",
        difficulty: 5,
        title: "Integration planen",
        scenario: "Ein Kunde will Tempus mit seinem HR-System verbinden.",
        task: "Erstelle einen Integrationsplan.",
        steps: [
          "Identifiziere die zu synchronisierenden Daten",
          "Definiere die Sync-Richtung (uni- oder bidirektional)",
          "Definiere die Sync-Frequenz",
          "Identifiziere das Mapping: HR-Felder → Tempus-Felder",
          "Definiere Regeln für Konflikte",
          "Definiere Fehlerbehandlung",
          "Erstelle einen Testplan",
          "Dokumentiere den vollständigen Integrationsplan"
        ],
        expectedResult: "Ein vollständiger Integrationsplan ist dokumentiert.",
        checkpoints: ["Daten identifiziert", "Mapping definiert", "Regeln festgelegt", "Plan dokumentiert"],
        skills: ["Integrationsplanung", "Systemdesign"]
      }
    ]
  }
];

// ============================================
// SZENARIOBASIERTE TOOL-ÜBUNGEN
// Realistische Situationen aus verschiedenen Perspektiven
// ============================================
export const scenarioExercises = [
  // ============================================
  // KATEGORIE 1: Stakeholder-Perspektiven
  // ============================================
  {
    category: "stakeholder",
    title: "Stakeholder-Szenarien",
    description: "Löse Anfragen aus der Sicht verschiedener Stakeholder",
    icon: "Users",
    scenarios: [
      // --- Project Manager Perspektive ---
      {
        id: "sc-pm-1",
        difficulty: 2,
        stakeholder: "Project Manager",
        stakeholderIcon: "Briefcase",
        title: "Der gestresste Projektleiter",
        situation: "Ein Project Manager ruft dich an: 'Ich habe in 30 Minuten ein Steering Committee Meeting und muss zeigen, wie mein Projekt ressourcenmäßig aufgestellt ist. Kannst du mir schnell helfen?'",
        challenge: "Erstelle innerhalb von 10 Minuten eine aussagekräftige Projektübersicht.",
        tasks: [
          "Öffne das Projekt des PMs in Tempus",
          "Wechsle zur Gantt-View für Timeline-Übersicht",
          "Erstelle einen Screenshot der Ressourcenzuweisungen",
          "Prüfe die Net Availability aller zugewiesenen Ressourcen",
          "Identifiziere potenzielle Risiken (Überauslastung, Lücken)",
          "Exportiere einen Quick-Report als PDF",
          "Fasse die wichtigsten Punkte in 3 Bullet Points zusammen"
        ],
        expectedDeliverable: "PDF-Export + 3 Bullet Points für das Meeting",
        successCriteria: ["Report in unter 10 Min erstellt", "Risiken identifiziert", "Actionable Insights"],
        skills: ["Schnelle Navigation", "Reporting", "Stakeholder-Kommunikation"],
        timeLimit: "10 Minuten"
      },
      {
        id: "sc-pm-2",
        difficulty: 3,
        stakeholder: "Project Manager",
        stakeholderIcon: "Briefcase",
        title: "Ressourcenkonflikt eskaliert",
        situation: "Eine PM schreibt: 'Mein Key-Developer wurde ohne Absprache einem anderen Projekt zugewiesen. Jetzt fehlt mir 50% seiner Zeit. Das gefährdet meinen Go-Live!'",
        challenge: "Analysiere den Konflikt und finde eine Lösung.",
        tasks: [
          "Öffne das Profil des betroffenen Developers",
          "Analysiere alle aktuellen Zuweisungen",
          "Identifiziere, wer die neue Zuweisung erstellt hat",
          "Prüfe die Prioritäten beider Projekte",
          "Erstelle 3 Lösungsoptionen mit Vor-/Nachteilen",
          "Dokumentiere die Situation für eine Eskalation",
          "Bereite eine Empfehlung für das Management vor"
        ],
        expectedDeliverable: "Analyse-Dokument mit 3 Lösungsoptionen und Empfehlung",
        successCriteria: ["Konflikt verstanden", "Optionen fair bewertet", "Klare Empfehlung"],
        skills: ["Konfliktanalyse", "Diplomatie", "Lösungsorientierung"],
        timeLimit: "20 Minuten"
      },
      {
        id: "sc-pm-3",
        difficulty: 4,
        stakeholder: "Project Manager",
        stakeholderIcon: "Briefcase",
        title: "Projekt-Kickoff Support",
        situation: "Ein neuer PM startet sein erstes Projekt in Tempus: 'Ich habe noch nie mit dem Tool gearbeitet. Kannst du mir zeigen, wie ich mein Projekt richtig aufsetze?'",
        challenge: "Führe den PM durch das komplette Projekt-Setup.",
        tasks: [
          "Erstelle gemeinsam ein neues Projekt mit allen Metadaten",
          "Erkläre die verschiedenen Projekt-Attribute",
          "Zeige, wie man Phasen/Meilensteine anlegt",
          "Demonstriere das Erstellen von Resource Requests",
          "Erkläre den Unterschied zwischen Soft und Hard Booking",
          "Zeige die verschiedenen Views (Grid, Gantt, Kanban)",
          "Richte eine personalisierte View für den PM ein",
          "Erkläre, wie der PM seinen Projektstatus tracken kann"
        ],
        expectedDeliverable: "Vollständig eingerichtetes Projekt + PM kann selbstständig arbeiten",
        successCriteria: ["Projekt korrekt aufgesetzt", "PM versteht die Basics", "Keine offenen Fragen"],
        skills: ["Schulung", "Geduld", "Didaktik"],
        timeLimit: "45 Minuten"
      },

      // --- Resource Manager Perspektive ---
      {
        id: "sc-rm-1",
        difficulty: 3,
        stakeholder: "Resource Manager",
        stakeholderIcon: "Users",
        title: "Kapazitätsengpass Q3",
        situation: "Die Resource Managerin meldet sich: 'Ich sehe im Q3 einen massiven Engpass bei unseren Java-Entwicklern. Kannst du mir helfen, das zu analysieren und Optionen aufzuzeigen?'",
        challenge: "Erstelle eine detaillierte Kapazitätsanalyse mit Handlungsempfehlungen.",
        tasks: [
          "Öffne die Kapazitätsplanung für Q3",
          "Filtere auf Ressourcen mit Skill 'Java'",
          "Analysiere Demand vs. Capacity pro Monat",
          "Identifiziere die Projekte mit höchstem Java-Bedarf",
          "Prüfe, ob Generic Resources den Gap füllen könnten",
          "Erstelle ein What-If Szenario: 'Was wenn wir 2 externe Java-Devs holen?'",
          "Dokumentiere 3 Handlungsoptionen mit Kosten/Nutzen",
          "Erstelle eine Präsentation für das Management"
        ],
        expectedDeliverable: "Kapazitätsanalyse + What-If Szenario + Management-Präsentation",
        successCriteria: ["Gap quantifiziert", "Optionen bewertet", "Entscheidungsvorlage ready"],
        skills: ["Kapazitätsplanung", "Szenarioanalyse", "Präsentation"],
        timeLimit: "30 Minuten"
      },
      {
        id: "sc-rm-2",
        difficulty: 3,
        stakeholder: "Resource Manager",
        stakeholderIcon: "Users",
        title: "Neue Abteilung onboarden",
        situation: "Der RM sagt: 'Die Marketing-Abteilung (15 Personen) soll ab nächsten Monat auch in Tempus geführt werden. Kannst du das Setup vorbereiten?'",
        challenge: "Bereite das Onboarding einer neuen Abteilung vor.",
        tasks: [
          "Erstelle die Abteilung 'Marketing' in der Org-Struktur",
          "Definiere relevante Skills für Marketing (Content, SEO, Analytics, etc.)",
          "Bereite eine CSV-Import-Vorlage für 15 Ressourcen vor",
          "Definiere Standard-Kapazitäten (evtl. anders als 40h?)",
          "Erstelle eine Rolle 'Marketing Manager' mit passenden Rechten",
          "Plane das Training für die neuen User",
          "Erstelle eine Checkliste für den Go-Live",
          "Dokumentiere den Onboarding-Prozess"
        ],
        expectedDeliverable: "Vollständiges Onboarding-Paket für Marketing-Abteilung",
        successCriteria: ["Struktur angelegt", "Import vorbereitet", "Training geplant"],
        skills: ["Onboarding", "Strukturierung", "Planung"],
        timeLimit: "40 Minuten"
      },
      {
        id: "sc-rm-3",
        difficulty: 4,
        stakeholder: "Resource Manager",
        stakeholderIcon: "Users",
        title: "BPAFG Massenkorrektur",
        situation: "Die RM ruft an: 'Wir haben gerade erfahren, dass 3 Projekte um 2 Monate verschoben werden. Ich muss alle Zuweisungen anpassen - das sind bestimmt 50+ Allocations!'",
        challenge: "Führe eine effiziente Massenkorrektur im BPAFG durch.",
        tasks: [
          "Öffne das BPAFG und filtere auf die 3 betroffenen Projekte",
          "Identifiziere alle betroffenen Allocations",
          "Nutze Bulk-Selection um mehrere Zellen zu markieren",
          "Verschiebe die Allocations um 2 Monate",
          "Prüfe auf neue Konflikte durch die Verschiebung",
          "Löse entstandene Überauslastungen",
          "Dokumentiere alle Änderungen",
          "Informiere die betroffenen PMs über die Änderungen"
        ],
        expectedDeliverable: "Alle Allocations verschoben, keine Konflikte, PMs informiert",
        successCriteria: ["Alle 50+ Allocations angepasst", "Keine neuen Konflikte", "Dokumentiert"],
        skills: ["BPAFG Mastery", "Effizienz", "Kommunikation"],
        timeLimit: "25 Minuten"
      },

      // --- Management Perspektive ---
      {
        id: "sc-mgmt-1",
        difficulty: 4,
        stakeholder: "Management / C-Level",
        stakeholderIcon: "Crown",
        title: "Board-Präsentation vorbereiten",
        situation: "Der CTO schreibt: 'Ich brauche für das Board-Meeting morgen eine Übersicht: Wie ausgelastet sind wir? Wo sind Risiken? Schaffen wir alle Projekte?'",
        challenge: "Erstelle eine Executive-taugliche Übersicht in 30 Minuten.",
        tasks: [
          "Erstelle ein Management-Dashboard (falls nicht vorhanden)",
          "Zeige Gesamtauslastung über alle Teams",
          "Identifiziere die Top 5 Risiko-Projekte",
          "Erstelle eine Demand vs. Capacity Übersicht für 6 Monate",
          "Zeige Skill-Gaps auf strategischer Ebene",
          "Formuliere 3 Key Insights für das Board",
          "Exportiere alles in ein präsentationsfähiges Format",
          "Bereite Antworten auf kritische Fragen vor"
        ],
        expectedDeliverable: "Executive Dashboard + 3 Key Insights + Backup-Daten",
        successCriteria: ["Daten auf C-Level aggregiert", "Insights actionable", "Präsentationsfertig"],
        skills: ["Executive Reporting", "Datenvisualisierung", "Strategisches Denken"],
        timeLimit: "30 Minuten"
      },
      {
        id: "sc-mgmt-2",
        difficulty: 5,
        stakeholder: "Management / C-Level",
        stakeholderIcon: "Crown",
        title: "Strategische Workforce-Planung",
        situation: "Der VP Engineering fragt: 'Wir planen 30% Wachstum nächstes Jahr. Wie viele Leute brauchen wir? Welche Skills? Wann müssen wir anfangen zu rekrutieren?'",
        challenge: "Erstelle eine strategische Workforce-Planung für 12 Monate.",
        tasks: [
          "Analysiere die aktuelle Workforce (Anzahl, Skills, Kapazität)",
          "Berechne den Bedarf bei 30% Projektwachstum",
          "Identifiziere kritische Skill-Gaps",
          "Erstelle einen Recruiting-Timeline (Vorlauf beachten!)",
          "Modelliere verschiedene Szenarien (20%, 30%, 40% Wachstum)",
          "Berechne die Kosten pro Szenario",
          "Erstelle eine Roadmap mit Meilensteinen",
          "Präsentiere Empfehlungen mit Risiken"
        ],
        expectedDeliverable: "Strategischer Workforce-Plan mit Szenarien und Roadmap",
        successCriteria: ["Datenbasierte Prognose", "Szenarien durchgerechnet", "Actionable Roadmap"],
        skills: ["Strategic Planning", "Forecasting", "Business Case"],
        timeLimit: "60 Minuten"
      },

      // --- HR Perspektive ---
      {
        id: "sc-hr-1",
        difficulty: 3,
        stakeholder: "HR / People Operations",
        stakeholderIcon: "Heart",
        title: "Skill-Inventur für HR",
        situation: "Die HR-Leiterin fragt: 'Wir planen Weiterbildungsbudgets. Kannst du mir eine Übersicht geben, welche Skills wir haben und wo die größten Lücken sind?'",
        challenge: "Erstelle eine Skill-Analyse für die HR-Planung.",
        tasks: [
          "Exportiere alle Ressourcen mit ihren Skills",
          "Gruppiere Skills nach Kategorien (Tech, Soft Skills, Methoden)",
          "Zähle, wie viele Personen jeden Skill haben",
          "Identifiziere Skills mit weniger als 3 Personen (Risiko!)",
          "Vergleiche mit den Projekt-Anforderungen der nächsten 6 Monate",
          "Identifiziere die Top 5 Skill-Gaps",
          "Schlage Weiterbildungsmaßnahmen vor",
          "Erstelle einen Report für HR"
        ],
        expectedDeliverable: "Skill-Inventur + Gap-Analyse + Weiterbildungsempfehlungen",
        successCriteria: ["Vollständige Inventur", "Gaps priorisiert", "Konkrete Empfehlungen"],
        skills: ["Skills Management", "Analyse", "HR-Kommunikation"],
        timeLimit: "35 Minuten"
      },
      {
        id: "sc-hr-2",
        difficulty: 3,
        stakeholder: "HR / People Operations",
        stakeholderIcon: "Heart",
        title: "Onboarding neuer Mitarbeiter",
        situation: "HR meldet: 'Nächste Woche starten 5 neue Entwickler. Kannst du sie im System anlegen und sicherstellen, dass die PMs sie zuweisen können?'",
        challenge: "Onboarde 5 neue Mitarbeiter vollständig ins System.",
        tasks: [
          "Erhalte die Mitarbeiterdaten von HR (Name, E-Mail, Abteilung, Start)",
          "Erstelle 5 neue Named Resources",
          "Weise jedem die korrekten Skills zu (aus CV/HR-Daten)",
          "Setze die Verfügbarkeit (Startdatum beachten!)",
          "Erstelle Benutzerkonten mit korrekten Rollen",
          "Informiere die zuständigen PMs über die neuen Ressourcen",
          "Plane eine kurze Einführung für die Neuen",
          "Dokumentiere den Onboarding-Prozess"
        ],
        expectedDeliverable: "5 vollständig eingerichtete Ressourcen + Benutzerkonten",
        successCriteria: ["Alle Daten korrekt", "Skills zugewiesen", "PMs informiert"],
        skills: ["Onboarding", "Datenqualität", "Prozessmanagement"],
        timeLimit: "30 Minuten"
      },

      // --- IT / Admin Perspektive ---
      {
        id: "sc-it-1",
        difficulty: 4,
        stakeholder: "IT Administrator",
        stakeholderIcon: "Shield",
        title: "Berechtigungsaudit",
        situation: "Der IT-Security-Beauftragte verlangt: 'Wir brauchen einen Audit aller Benutzerberechtigungen. Wer hat Admin-Rechte? Wer kann Daten exportieren?'",
        challenge: "Führe einen vollständigen Berechtigungsaudit durch.",
        tasks: [
          "Exportiere alle Benutzer mit ihren Rollen",
          "Identifiziere alle Benutzer mit Admin-Rechten",
          "Prüfe, ob die Admin-Rechte noch berechtigt sind",
          "Identifiziere Benutzer mit Export-Rechten",
          "Finde inaktive Benutzer (kein Login seit 90 Tagen)",
          "Prüfe auf 'Privilege Creep' (zu viele Rechte)",
          "Erstelle Empfehlungen für Bereinigung",
          "Dokumentiere den Audit für Compliance"
        ],
        expectedDeliverable: "Audit-Report + Bereinigungsempfehlungen",
        successCriteria: ["Vollständiger Überblick", "Risiken identifiziert", "Compliance-konform"],
        skills: ["Security", "Audit", "Compliance"],
        timeLimit: "40 Minuten"
      },
      {
        id: "sc-it-2",
        difficulty: 5,
        stakeholder: "IT Administrator",
        stakeholderIcon: "Shield",
        title: "System-Migration vorbereiten",
        situation: "IT plant ein Upgrade: 'Wir migrieren auf eine neue Tempus-Version. Kannst du sicherstellen, dass alle Daten und Konfigurationen dokumentiert sind?'",
        challenge: "Dokumentiere alle systemkritischen Konfigurationen.",
        tasks: [
          "Dokumentiere alle Custom Attributes",
          "Dokumentiere alle Custom Views und Dashboards",
          "Exportiere alle Benutzer und Rollen",
          "Dokumentiere Workflow-Konfigurationen",
          "Dokumentiere Integrations-Einstellungen",
          "Erstelle eine Liste aller Scheduled Reports",
          "Dokumentiere System-Einstellungen (Zeitzone, Fiscal Year, etc.)",
          "Erstelle einen Rollback-Plan falls Migration fehlschlägt"
        ],
        expectedDeliverable: "Vollständige Konfigurations-Dokumentation + Rollback-Plan",
        successCriteria: ["Alles dokumentiert", "Reproduzierbar", "Rollback möglich"],
        skills: ["Dokumentation", "System-Administration", "Risikomanagement"],
        timeLimit: "60 Minuten"
      }
    ]
  },

  // ============================================
  // KATEGORIE 2: Mentor-Prüfungsszenarien
  // ============================================
  {
    category: "mentor",
    title: "Mentor-Prüfungen",
    description: "Szenarien, wie dein Mentor dich auf Tool-Expertise testen könnte",
    icon: "GraduationCap",
    scenarios: [
      {
        id: "mt-1",
        difficulty: 3,
        stakeholder: "Mentor (Marc)",
        stakeholderIcon: "GraduationCap",
        title: "Spontaner Tool-Check",
        situation: "Marc kommt an deinen Schreibtisch: 'Hey, zeig mir mal schnell, wie du eine Ressource mit Überauslastung findest und das Problem löst.'",
        challenge: "Demonstriere deine Tool-Kenntnisse live ohne Vorbereitung.",
        tasks: [
          "Öffne die Auslastungsübersicht",
          "Filtere auf Ressourcen mit >100% Auslastung",
          "Wähle eine überausgelastete Ressource",
          "Erkläre, warum sie überausgelastet ist",
          "Zeige 2 Wege, das Problem zu lösen",
          "Führe eine Lösung durch",
          "Verifiziere, dass das Problem gelöst ist"
        ],
        expectedDeliverable: "Live-Demonstration mit Erklärung",
        successCriteria: ["Schnelle Navigation", "Korrekte Analyse", "Saubere Lösung"],
        mentorExpects: "Flüssige Navigation, keine Suche nach Funktionen, klare Erklärungen",
        skills: ["Tool-Expertise", "Problemlösung", "Kommunikation"],
        timeLimit: "5 Minuten"
      },
      {
        id: "mt-2",
        difficulty: 3,
        stakeholder: "Mentor (Marc)",
        stakeholderIcon: "GraduationCap",
        title: "BPAFG Deep Dive",
        situation: "Marc fragt: 'Erkläre mir den Unterschied zwischen RM Mode und PM Mode im BPAFG. Wann nutzt du welchen?'",
        challenge: "Erkläre und demonstriere beide Modi mit konkreten Use Cases.",
        tasks: [
          "Öffne das BPAFG",
          "Zeige den RM Mode und erkläre den Fokus (Ressourcen-zentriert)",
          "Demonstriere einen typischen RM-Use-Case",
          "Wechsle zum PM Mode und erkläre den Fokus (Projekt-zentriert)",
          "Demonstriere einen typischen PM-Use-Case",
          "Erkläre, wann du welchen Modus empfehlen würdest",
          "Zeige den Default Mode als Alternative"
        ],
        expectedDeliverable: "Klare Demonstration mit Business-Kontext",
        successCriteria: ["Modi korrekt erklärt", "Use Cases sinnvoll", "Empfehlung begründet"],
        mentorExpects: "Verständnis des 'Warum', nicht nur des 'Wie'",
        skills: ["BPAFG Expertise", "Didaktik", "Business-Verständnis"],
        timeLimit: "10 Minuten"
      },
      {
        id: "mt-3",
        difficulty: 4,
        stakeholder: "Mentor (Marc)",
        stakeholderIcon: "GraduationCap",
        title: "Kunden-Demo Simulation",
        situation: "Marc sagt: 'Stell dir vor, ich bin ein Kunde, der Tempus noch nie gesehen hat. Gib mir eine 15-Minuten-Demo der wichtigsten PM-Funktionen.'",
        challenge: "Halte eine überzeugende Demo für einen 'Kunden'.",
        tasks: [
          "Starte mit einem kurzen Überblick (30 Sekunden)",
          "Zeige das Erstellen eines Projekts",
          "Demonstriere das Zuweisen von Ressourcen",
          "Zeige die verschiedenen Views (Gantt, Grid)",
          "Demonstriere einen Resource Request",
          "Zeige die Auslastungsübersicht",
          "Beende mit dem Mehrwert für den PM",
          "Beantworte 2-3 'Kundenfragen' von Marc"
        ],
        expectedDeliverable: "Professionelle 15-Minuten-Demo",
        successCriteria: ["Strukturiert", "Kundenorientiert", "Mehrwert klar"],
        mentorExpects: "Professionelles Auftreten, keine technischen Pannen, Kundensprache",
        skills: ["Demo-Skills", "Präsentation", "Kundenorientierung"],
        timeLimit: "15 Minuten"
      },
      {
        id: "mt-4",
        difficulty: 4,
        stakeholder: "Mentor (Marc)",
        stakeholderIcon: "GraduationCap",
        title: "Fehlersuche Challenge",
        situation: "Marc zeigt dir einen Screenshot: 'Ein Kunde meldet, dass seine Kapazitätsberechnung falsch aussieht. Finde heraus, was nicht stimmt.'",
        challenge: "Debugge ein Kapazitätsproblem systematisch.",
        tasks: [
          "Analysiere den Screenshot (Was sieht 'falsch' aus?)",
          "Öffne die betroffene Ressource",
          "Prüfe die Basis-Kapazität (Stunden/Woche)",
          "Prüfe eingetragene Abwesenheiten",
          "Prüfe alle Allocations",
          "Prüfe den Zeitraum der Berechnung",
          "Identifiziere die Ursache des Problems",
          "Erkläre die Lösung"
        ],
        expectedDeliverable: "Ursache identifiziert + Lösung erklärt",
        successCriteria: ["Systematisches Vorgehen", "Ursache gefunden", "Lösung korrekt"],
        mentorExpects: "Strukturierte Fehlersuche, nicht wildes Herumprobieren",
        skills: ["Troubleshooting", "Analytisches Denken", "Systematik"],
        timeLimit: "10 Minuten"
      },
      {
        id: "mt-5",
        difficulty: 5,
        stakeholder: "Mentor (Marc)",
        stakeholderIcon: "GraduationCap",
        title: "Komplexes Szenario",
        situation: "Marc beschreibt: 'Ein Kunde hat 3 Teams, die an 5 Projekten arbeiten. 2 Projekte werden verschoben, 1 Team bekommt 2 neue Mitglieder. Zeig mir, wie du das alles in Tempus abbildest.'",
        challenge: "Manage ein komplexes Multi-Change-Szenario.",
        tasks: [
          "Verstehe das Szenario vollständig (Rückfragen erlaubt!)",
          "Plane die Reihenfolge der Änderungen",
          "Füge die 2 neuen Teammitglieder hinzu",
          "Verschiebe die 2 Projekte",
          "Passe alle betroffenen Allocations an",
          "Prüfe auf Konflikte und löse sie",
          "Dokumentiere alle Änderungen",
          "Erstelle eine Zusammenfassung für die Stakeholder"
        ],
        expectedDeliverable: "Alle Änderungen sauber durchgeführt + Dokumentation",
        successCriteria: ["Keine Fehler", "Effizientes Vorgehen", "Vollständige Doku"],
        mentorExpects: "Überblick behalten, strukturiert arbeiten, nichts vergessen",
        skills: ["Komplexitätsmanagement", "Planung", "Genauigkeit"],
        timeLimit: "30 Minuten"
      }
    ]
  },

  // ============================================
  // KATEGORIE 3: Chef-Prüfungsszenarien
  // ============================================
  {
    category: "boss",
    title: "Chef-Prüfungen",
    description: "Szenarien, wie dein Chef deine Expertise und Eigenständigkeit testet",
    icon: "Award",
    scenarios: [
      {
        id: "boss-1",
        difficulty: 4,
        stakeholder: "Chef (Geschäftsführung)",
        stakeholderIcon: "Award",
        title: "Der Spontan-Kundentermin",
        situation: "Dein Chef ruft an: 'Ich bin in 2 Stunden bei einem potenziellen Kunden. Bereite mir eine Demo-Umgebung vor, die zeigt, was Tempus kann. Der Kunde ist eine Versicherung mit 200 Mitarbeitern.'",
        challenge: "Bereite eine branchenspezifische Demo-Umgebung vor.",
        tasks: [
          "Erstelle ein Demo-Projekt: 'Versicherungs-Digitalisierung'",
          "Erstelle realistische Rollen: Underwriter, Claims Manager, IT, etc.",
          "Erstelle 10-15 Demo-Ressourcen mit passenden Skills",
          "Erstelle 3-4 typische Versicherungsprojekte",
          "Füge realistische Allocations hinzu",
          "Erstelle ein Management-Dashboard",
          "Bereite 3 'Wow-Momente' für die Demo vor",
          "Schreibe einen kurzen Demo-Leitfaden für deinen Chef"
        ],
        expectedDeliverable: "Vollständige Demo-Umgebung + Demo-Leitfaden",
        successCriteria: ["Branchenrelevant", "Professionell", "Demo-ready"],
        bossExpects: "Eigenständigkeit, Branchenverständnis, Qualität unter Zeitdruck",
        skills: ["Demo-Vorbereitung", "Branchenwissen", "Zeitmanagement"],
        timeLimit: "90 Minuten"
      },
      {
        id: "boss-2",
        difficulty: 4,
        stakeholder: "Chef (Geschäftsführung)",
        stakeholderIcon: "Award",
        title: "Kunden-Eskalation",
        situation: "Der Chef leitet eine E-Mail weiter: 'Der Kunde beschwert sich, dass die Reports falsche Zahlen zeigen. Analysiere das Problem und gib mir in 1 Stunde ein Update.'",
        challenge: "Analysiere und löse ein kritisches Kundenproblem unter Zeitdruck.",
        tasks: [
          "Lies die Kunden-E-Mail genau (Was genau ist 'falsch'?)",
          "Reproduziere das Problem in der Testumgebung",
          "Identifiziere die Ursache (Daten? Konfiguration? Bug?)",
          "Dokumentiere das Problem mit Screenshots",
          "Entwickle eine Lösung oder einen Workaround",
          "Bereite eine Kunden-Kommunikation vor",
          "Schreibe ein Update für deinen Chef",
          "Plane Maßnahmen, damit es nicht wieder passiert"
        ],
        expectedDeliverable: "Problem-Analyse + Lösung + Kunden-Kommunikation",
        successCriteria: ["Ursache gefunden", "Lösung funktioniert", "Professionelle Kommunikation"],
        bossExpects: "Schnelle, gründliche Analyse; keine Ausreden; Lösungsorientierung",
        skills: ["Troubleshooting", "Krisenkommunikation", "Zeitmanagement"],
        timeLimit: "60 Minuten"
      },
      {
        id: "boss-3",
        difficulty: 5,
        stakeholder: "Chef (Geschäftsführung)",
        stakeholderIcon: "Award",
        title: "Wissenstransfer-Aufgabe",
        situation: "Der Chef sagt: 'Wir stellen nächsten Monat einen neuen Consultant ein. Erstelle ein Trainingskonzept, wie wir ihn in 2 Wochen auf Tempus fit bekommen.'",
        challenge: "Entwickle ein strukturiertes Trainingskonzept.",
        tasks: [
          "Definiere die Lernziele für einen neuen Consultant",
          "Strukturiere das Training in sinnvolle Module",
          "Erstelle einen Zeitplan für 2 Wochen",
          "Definiere Übungen und Hands-on-Aufgaben",
          "Erstelle Checklisten für jeden Meilenstein",
          "Plane Wissenstests/Checkpoints",
          "Bereite Demo-Szenarien für Übungen vor",
          "Dokumentiere das Konzept so, dass es wiederverwendbar ist"
        ],
        expectedDeliverable: "Vollständiges Trainingskonzept + Materialien",
        successCriteria: ["Strukturiert", "Praxisorientiert", "Skalierbar"],
        bossExpects: "Strategisches Denken, Didaktik, Dokumentationsqualität",
        skills: ["Training Design", "Wissensmanagement", "Dokumentation"],
        timeLimit: "120 Minuten"
      },
      {
        id: "boss-4",
        difficulty: 5,
        stakeholder: "Chef (Geschäftsführung)",
        stakeholderIcon: "Award",
        title: "Prozessoptimierung vorschlagen",
        situation: "Der Chef fragt: 'Wir haben jetzt 10 Kunden auf Tempus. Was können wir standardisieren? Wo verlieren wir Zeit? Mach mir einen Vorschlag.'",
        challenge: "Analysiere und optimiere interne Prozesse.",
        tasks: [
          "Dokumentiere den aktuellen Implementierungsprozess",
          "Identifiziere wiederkehrende Aufgaben",
          "Finde Zeitfresser und Ineffizienzen",
          "Entwickle Vorlagen (Projekt-Templates, Import-Vorlagen)",
          "Schlage Automatisierungen vor",
          "Berechne die potenzielle Zeitersparnis",
          "Erstelle eine Priorisierung (Quick Wins vs. langfristig)",
          "Präsentiere deine Empfehlungen"
        ],
        expectedDeliverable: "Prozessanalyse + Optimierungsvorschläge + ROI-Schätzung",
        successCriteria: ["Fundierte Analyse", "Konkrete Vorschläge", "Business Case"],
        bossExpects: "Unternehmerisches Denken, Initiative, Umsetzbarkeit",
        skills: ["Prozessoptimierung", "Business Analysis", "Präsentation"],
        timeLimit: "180 Minuten"
      },
      {
        id: "boss-5",
        difficulty: 5,
        stakeholder: "Chef (Geschäftsführung)",
        stakeholderIcon: "Award",
        title: "Eigenständige Kundenbetreuung",
        situation: "Der Chef sagt: 'Ich bin nächste Woche im Urlaub. Du bist der Ansprechpartner für alle Tempus-Kunden. Hier ist die Liste mit offenen Themen.'",
        challenge: "Manage mehrere Kunden eigenständig für eine Woche.",
        tasks: [
          "Gehe die Liste offener Themen durch",
          "Priorisiere nach Dringlichkeit und Wichtigkeit",
          "Plane deine Woche (Wann bearbeitest du was?)",
          "Bereite dich auf mögliche Eskalationen vor",
          "Stelle sicher, dass du alle Zugänge hast",
          "Definiere Eskalationspfade (Wen rufst du an wenn...?)",
          "Dokumentiere alles für das Handover",
          "Erstelle einen Tagesbericht-Template"
        ],
        expectedDeliverable: "Wochenplan + Eskalationsplan + Dokumentations-Template",
        successCriteria: ["Strukturierte Planung", "Risiken bedacht", "Selbstständigkeit"],
        bossExpects: "Verantwortungsbewusstsein, Selbstorganisation, Professionalität",
        skills: ["Selbstmanagement", "Kundenbetreuung", "Verantwortung"],
        timeLimit: "60 Minuten Vorbereitung"
      }
    ]
  },

  // ============================================
  // KATEGORIE 4: Kunden-Szenarien (Externe)
  // ============================================
  {
    category: "customer",
    title: "Kunden-Szenarien",
    description: "Typische Anfragen und Probleme von echten Kunden",
    icon: "Building",
    scenarios: [
      {
        id: "cust-1",
        difficulty: 2,
        stakeholder: "Neuer Kunde",
        stakeholderIcon: "Building",
        title: "Erste Schritte Support",
        situation: "Ein Kunde schreibt: 'Wir haben gerade mit Tempus angefangen. Ich verstehe nicht, wie ich meine Mitarbeiter anlegen soll. Können Sie mir helfen?'",
        challenge: "Unterstütze einen Kunden bei den ersten Schritten.",
        tasks: [
          "Antworte freundlich und professionell",
          "Frage nach: Wie viele Mitarbeiter? Welche Daten liegen vor?",
          "Erkläre den Unterschied Named vs. Generic Resource",
          "Biete 2 Optionen: Manuell anlegen oder CSV-Import",
          "Erstelle eine kurze Schritt-für-Schritt-Anleitung",
          "Biete einen kurzen Call an für komplexere Fragen",
          "Sende hilfreiche Links zur Dokumentation",
          "Follow-up: Frage nach 2 Tagen, ob alles geklappt hat"
        ],
        expectedDeliverable: "Hilfreiche E-Mail + Anleitung + Follow-up",
        successCriteria: ["Freundlich", "Hilfreich", "Proaktiv"],
        skills: ["Kundensupport", "Kommunikation", "Empathie"],
        timeLimit: "20 Minuten"
      },
      {
        id: "cust-2",
        difficulty: 3,
        stakeholder: "Bestehender Kunde",
        stakeholderIcon: "Building",
        title: "Feature Request diskutieren",
        situation: "Ein Kunde ruft an: 'Wir bräuchten eine Funktion, die automatisch eine E-Mail schickt, wenn jemand überbucht wird. Geht das?'",
        challenge: "Manage einen Feature Request professionell.",
        tasks: [
          "Höre aktiv zu und verstehe den Use Case",
          "Frage nach: Wie oft passiert das? Wer soll informiert werden?",
          "Prüfe, ob es einen Workaround gibt (z.B. Dashboard-Alert)",
          "Erkläre den Feature Request Prozess",
          "Dokumentiere den Request vollständig",
          "Gib eine realistische Einschätzung (kein Versprechen!)",
          "Biete den Workaround als Zwischenlösung an",
          "Leite den Request intern weiter"
        ],
        expectedDeliverable: "Dokumentierter Feature Request + Workaround-Vorschlag",
        successCriteria: ["Use Case verstanden", "Keine falschen Versprechen", "Workaround angeboten"],
        skills: ["Anforderungsanalyse", "Erwartungsmanagement", "Dokumentation"],
        timeLimit: "30 Minuten"
      },
      {
        id: "cust-3",
        difficulty: 4,
        stakeholder: "Unzufriedener Kunde",
        stakeholderIcon: "Building",
        title: "Beschwerde-Management",
        situation: "Ein Kunde schreibt verärgert: 'Seit dem letzten Update funktioniert der Export nicht mehr richtig. Wir haben morgen ein wichtiges Meeting und brauchen die Daten!'",
        challenge: "Manage eine kritische Kundenbeschwerde.",
        tasks: [
          "Antworte sofort und zeige Verständnis",
          "Frage nach Details: Welcher Export? Welcher Fehler?",
          "Versuche das Problem zu reproduzieren",
          "Finde einen Workaround für das Meeting morgen",
          "Kommuniziere transparent über den Status",
          "Eskaliere intern falls nötig",
          "Halte den Kunden auf dem Laufenden",
          "Follow-up nach dem Meeting: Ist alles gut gegangen?"
        ],
        expectedDeliverable: "Sofortige Hilfe + Workaround + Transparente Kommunikation",
        successCriteria: ["Schnelle Reaktion", "Problem gelöst", "Kunde beruhigt"],
        skills: ["Krisenmanagement", "Empathie", "Problemlösung"],
        timeLimit: "45 Minuten"
      },
      {
        id: "cust-4",
        difficulty: 4,
        stakeholder: "Enterprise Kunde",
        stakeholderIcon: "Building",
        title: "Komplexe Konfigurationsanfrage",
        situation: "Ein großer Kunde fragt: 'Wir haben eine Matrix-Organisation. Mitarbeiter gehören zu einer Abteilung, aber arbeiten in Projekten anderer Abteilungen. Wie bilden wir das ab?'",
        challenge: "Entwickle eine Lösung für eine komplexe Organisationsstruktur.",
        tasks: [
          "Verstehe die Matrix-Struktur genau (Fragen stellen!)",
          "Analysiere die Auswirkungen auf Reporting und Berechtigungen",
          "Entwickle 2-3 Lösungsansätze",
          "Bewerte Vor- und Nachteile jedes Ansatzes",
          "Empfehle die beste Lösung mit Begründung",
          "Erstelle einen Implementierungsplan",
          "Dokumentiere die Konfiguration",
          "Plane ein Review nach 4 Wochen"
        ],
        expectedDeliverable: "Lösungskonzept + Implementierungsplan",
        successCriteria: ["Anforderung verstanden", "Lösung praktikabel", "Gut dokumentiert"],
        skills: ["Lösungsdesign", "Beratung", "Komplexitätsmanagement"],
        timeLimit: "60 Minuten"
      },
      {
        id: "cust-5",
        difficulty: 5,
        stakeholder: "Strategischer Kunde",
        stakeholderIcon: "Building",
        title: "Strategische Beratung",
        situation: "Der CIO eines wichtigen Kunden fragt: 'Wir wollen unser Resource Management auf das nächste Level bringen. Was empfehlen Sie uns für die nächsten 12 Monate?'",
        challenge: "Entwickle eine strategische Roadmap für einen Kunden.",
        tasks: [
          "Analysiere den aktuellen Reifegrad des Kunden",
          "Identifiziere Quick Wins (sofort umsetzbar)",
          "Identifiziere mittelfristige Verbesserungen",
          "Identifiziere strategische Initiativen",
          "Erstelle eine priorisierte Roadmap",
          "Schätze Aufwand und Nutzen pro Initiative",
          "Bereite eine Präsentation für den CIO vor",
          "Plane regelmäßige Review-Meetings"
        ],
        expectedDeliverable: "12-Monats-Roadmap + CIO-Präsentation",
        successCriteria: ["Strategisch wertvoll", "Realistisch", "Überzeugend"],
        skills: ["Strategische Beratung", "Roadmap-Entwicklung", "Executive Communication"],
        timeLimit: "120 Minuten"
      }
    ]
  },

  // ============================================
  // KATEGORIE 5: Notfall-Szenarien
  // ============================================
  {
    category: "emergency",
    title: "Notfall-Szenarien",
    description: "Kritische Situationen, die schnelles Handeln erfordern",
    icon: "AlertTriangle",
    scenarios: [
      {
        id: "emg-1",
        difficulty: 4,
        stakeholder: "System",
        stakeholderIcon: "AlertTriangle",
        title: "Daten versehentlich gelöscht",
        situation: "Ein Kunde ruft panisch an: 'Ich habe aus Versehen ein Projekt mit allen Zuweisungen gelöscht! Das war unser wichtigstes Projekt!'",
        challenge: "Hilf bei der Wiederherstellung gelöschter Daten.",
        tasks: [
          "Beruhige den Kunden",
          "Frage: Wann genau wurde gelöscht? Welches Projekt?",
          "Prüfe, ob es einen Papierkorb/Soft Delete gibt",
          "Prüfe, ob es Backups gibt und wie aktuell sie sind",
          "Kontaktiere ggf. den technischen Support",
          "Dokumentiere, was wiederhergestellt werden kann",
          "Kommuniziere transparent über den Status",
          "Empfehle Maßnahmen zur Vermeidung (Berechtigungen, Bestätigungen)"
        ],
        expectedDeliverable: "Wiederherstellung (wenn möglich) + Präventionsempfehlungen",
        successCriteria: ["Ruhe bewahrt", "Alle Optionen geprüft", "Transparent kommuniziert"],
        skills: ["Krisenmanagement", "Technisches Wissen", "Kommunikation"],
        timeLimit: "30 Minuten"
      },
      {
        id: "emg-2",
        difficulty: 4,
        stakeholder: "System",
        stakeholderIcon: "AlertTriangle",
        title: "Performance-Problem",
        situation: "Mehrere Kunden melden gleichzeitig: 'Tempus ist extrem langsam heute. Manche Seiten laden gar nicht mehr.'",
        challenge: "Analysiere und kommuniziere ein Performance-Problem.",
        tasks: [
          "Verifiziere das Problem selbst",
          "Sammle Informationen: Welche Funktionen? Seit wann?",
          "Prüfe, ob es bekannte Wartungsarbeiten gibt",
          "Eskaliere an den technischen Support",
          "Kommuniziere proaktiv an alle betroffenen Kunden",
          "Gib regelmäßige Status-Updates",
          "Dokumentiere den Vorfall",
          "Erstelle einen Post-Mortem nach Lösung"
        ],
        expectedDeliverable: "Kunden-Kommunikation + Eskalation + Dokumentation",
        successCriteria: ["Schnelle Reaktion", "Proaktive Kommunikation", "Saubere Dokumentation"],
        skills: ["Incident Management", "Kommunikation", "Eskalation"],
        timeLimit: "Ongoing bis gelöst"
      },
      {
        id: "emg-3",
        difficulty: 5,
        stakeholder: "System",
        stakeholderIcon: "AlertTriangle",
        title: "Sicherheitsvorfall",
        situation: "Ein Kunde meldet: 'Ich sehe Daten von anderen Projekten, die ich nicht sehen sollte. Ist das ein Sicherheitsproblem?'",
        challenge: "Handle einen potenziellen Sicherheitsvorfall.",
        tasks: [
          "Nimm die Meldung ernst und dokumentiere sofort",
          "Frage nach Details: Welche Daten? Screenshots?",
          "Eskaliere sofort an Security/Management",
          "Bitte den Kunden, keine Screenshots zu teilen",
          "Prüfe die Berechtigungskonfiguration",
          "Isoliere das Problem (welche User betroffen?)",
          "Kommuniziere nur abgestimmte Informationen",
          "Dokumentiere alles für Compliance"
        ],
        expectedDeliverable: "Sofortige Eskalation + Dokumentation + Abgestimmte Kommunikation",
        successCriteria: ["Sofort eskaliert", "Vertraulich behandelt", "Compliance-konform"],
        skills: ["Security Awareness", "Eskalation", "Vertraulichkeit"],
        timeLimit: "Sofort"
      }
    ]
  }
];
