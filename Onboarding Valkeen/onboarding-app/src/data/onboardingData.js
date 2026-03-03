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
    id: 4,
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
    id: 5,
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
    id: 6,
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
    id: 7,
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
    id: 8,
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
    id: 9,
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
    id: 10,
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
