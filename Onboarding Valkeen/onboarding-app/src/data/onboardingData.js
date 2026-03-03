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
