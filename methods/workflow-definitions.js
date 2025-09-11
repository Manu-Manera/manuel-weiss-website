// Individuelle Workflow-Definitionen für jede Methode

const methodWorkflowDefinitions = {
    'values-clarification': {
        title: 'Werte-Klärung',
        steps: 5,
        stepTitles: [
            'Werte-Identifikation',
            'Werte-Ranking', 
            'Konflikt-Analyse',
            'Lebensbereiche-Mapping',
            'Werte-Tracking'
        ],
        description: 'Identifiziere deine persönlichen Werte und schaffe Klarheit darüber, was dir im Leben wirklich wichtig ist.',
        logic: 'sequential', // Schritt-für-Schritt
        features: ['Werte-Bibliothek', 'Konflikt-Detektor', 'Lebensbereiche', 'Tracking']
    },
    
    'strengths-finder': {
        title: 'Stärken-Analyse',
        steps: 5,
        stepTitles: [
            'Stärken-Identifikation',
            'Stärken-Bewertung',
            'Entwicklungsplan',
            'Anwendungsbereiche',
            'Stärken-Tracking'
        ],
        description: 'Entdecke deine natürlichen Talente und Stärken. Lerne, wie du sie optimal einsetzen kannst.',
        logic: 'assessment-based', // Assessment-basiert
        features: ['Gallup-Stärken', 'VIA-Test', 'Entwicklungsplan', 'Tracking']
    },
    
    'goal-setting': {
        title: 'Ziel-Setting',
        steps: 6,
        stepTitles: [
            'Ziel-Identifikation',
            'SMART-Formulierung',
            'Aktionsplan',
            'Habit-Stacking',
            'Progress-Tracking',
            'Ziel-Review'
        ],
        description: 'Setze dir klare, erreichbare Ziele mit der SMART-Methode und entwickle einen Aktionsplan.',
        logic: 'goal-oriented', // Ziel-orientiert
        features: ['SMART-Ziele', 'Aktionsplan', 'Habit-Stacking', 'Tracking']
    },
    
    'mindfulness': {
        title: 'Achtsamkeit & Meditation',
        steps: 4,
        stepTitles: [
            'Achtsamkeits-Assessment',
            'Meditations-Timer',
            'Geführte Übungen',
            'Alltags-Integration'
        ],
        description: 'Entwickle Achtsamkeit und innere Ruhe durch geführte Meditationen und Achtsamkeitsübungen.',
        logic: 'practice-based', // Praxis-basiert
        features: ['Assessment', 'Timer', 'Geführte Übungen', 'Integration']
    },
    
    'emotional-intelligence': {
        title: 'Emotionale Intelligenz',
        steps: 5,
        stepTitles: [
            'EQ-Assessment',
            'Emotions-Tracking',
            'Regulations-Tools',
            'Empathie-Training',
            'EQ-Entwicklung'
        ],
        description: 'Verbessere deine emotionale Intelligenz und lerne, Emotionen besser zu verstehen und zu regulieren.',
        logic: 'development-based', // Entwicklungs-basiert
        features: ['EQ-Test', 'Emotionsregulation', 'Empathie-Training', 'Entwicklung']
    },
    
    'habit-building': {
        title: 'Gewohnheiten aufbauen',
        steps: 5,
        stepTitles: [
            'Gewohnheits-Analyse',
            'Habit-Stacking',
            '21-Tage-Challenge',
            'Progress-Tracking',
            'Gewohnheits-Optimierung'
        ],
        description: 'Lerne, positive Gewohnheiten zu entwickeln und schlechte zu durchbrechen mit bewährten Methoden.',
        logic: 'habit-loop', // Gewohnheits-Schleife
        features: ['Analyse', 'Habit-Stacking', '21-Tage-Regel', 'Optimierung']
    },
    
    'communication': {
        title: 'Kommunikation',
        steps: 4,
        stepTitles: [
            'Kommunikations-Assessment',
            'Aktives Zuhören',
            'Nonverbale Kommunikation',
            'Konfliktlösung'
        ],
        description: 'Verbessere deine Kommunikationsfähigkeiten und lerne, effektiver zu kommunizieren.',
        logic: 'skill-based', // Fähigkeiten-basiert
        features: ['Assessment', 'Aktives Zuhören', 'Nonverbal', 'Konfliktlösung']
    },
    
    'time-management': {
        title: 'Zeitmanagement',
        steps: 5,
        stepTitles: [
            'Zeit-Analyse',
            'Priorisierung',
            'Zeitblocking',
            'Produktivitäts-Tools',
            'Zeit-Optimierung'
        ],
        description: 'Lerne effektive Zeitmanagement-Techniken und optimiere deine Produktivität.',
        logic: 'system-based', // System-basiert
        features: ['Analyse', 'Priorisierung', 'Zeitblocking', 'Optimierung']
    },
    
    'nlp-dilts': {
        title: 'NLP Dilts - Logische Ebenen',
        steps: 6,
        stepTitles: [
            'Umgebung analysieren',
            'Verhalten identifizieren',
            'Fähigkeiten bewerten',
            'Überzeugungen erkunden',
            'Identität klären',
            'Spiritualität verstehen'
        ],
        description: 'Die logischen Ebenen der Veränderung - verstehe die verschiedenen Ebenen deiner Persönlichkeit.',
        logic: 'hierarchical', // Hierarchisch
        features: ['6 Ebenen', 'Veränderung', 'Persönlichkeit', 'Integration']
    },
    
    'johari-window': {
        title: 'Johari-Fenster',
        steps: 4,
        stepTitles: [
            'Selbstbild erstellen',
            'Fremdbild sammeln',
            'Blinde Flecken identifizieren',
            'Entwicklungsplan erstellen'
        ],
        description: 'Erweitere dein Selbstbewusstsein durch das Johari-Fenster-Modell.',
        logic: 'feedback-based', // Feedback-basiert
        features: ['Selbstbild', 'Fremdbild', 'Blinde Flecken', 'Entwicklung']
    },
    
    'walt-disney': {
        title: 'Walt-Disney-Strategie',
        steps: 3,
        stepTitles: [
            'Träumer-Phase',
            'Realist-Phase',
            'Kritiker-Phase'
        ],
        description: 'Die Walt-Disney-Strategie für kreative Problemlösung und Visionen.',
        logic: 'creative-process', // Kreativer Prozess
        features: ['Kreativität', 'Problemlösung', 'Visionen', 'Iteration']
    },
    
    'nonviolent-communication': {
        title: 'Gewaltfreie Kommunikation',
        steps: 4,
        stepTitles: [
            'Beobachtung',
            'Gefühl',
            'Bedürfnis',
            'Bitte'
        ],
        description: 'Lerne gewaltfreie Kommunikation nach Marshall Rosenberg.',
        logic: 'process-based', // Prozess-basiert
        features: ['4 Schritte', 'Empathie', 'Konfliktlösung', 'Verständnis']
    },
    
    'five-pillars': {
        title: 'Fünf Säulen der Identität',
        steps: 5,
        stepTitles: [
            'Körperliche Identität',
            'Soziale Identität',
            'Berufliche Identität',
            'Materielle Identität',
            'Spirituelle Identität'
        ],
        description: 'Die fünf Säulen der Identität - verstehe die Grundpfeiler deiner Persönlichkeit.',
        logic: 'identity-based', // Identitäts-basiert
        features: ['5 Säulen', 'Identität', 'Persönlichkeit', 'Ganzheitlich']
    },
    
    'nlp-meta-goal': {
        title: 'NLP Meta-Goal',
        steps: 4,
        stepTitles: [
            'Meta-Ziel identifizieren',
            'Ziel-Hierarchie erstellen',
            'Ressourcen aktivieren',
            'Meta-Ziel erreichen'
        ],
        description: 'NLP Meta-Ziel-Techniken für tiefere Zielerreichung.',
        logic: 'meta-level', // Meta-Ebene
        features: ['Meta-Ziele', 'Hierarchie', 'Ressourcen', 'Erreichung']
    },
    
    'aek-communication': {
        title: 'AEK - Aspektbezogene Kommunikation',
        steps: 4,
        stepTitles: [
            'Aspekte identifizieren',
            'Kommunikationsstil analysieren',
            'Anpassung üben',
            'Integration in Alltag'
        ],
        description: 'Aspektbezogene Kommunikation für besseres Verständnis.',
        logic: 'aspect-based', // Aspekt-basiert
        features: ['Aspekte', 'Kommunikation', 'Anpassung', 'Integration']
    },
    
    'rubikon-model': {
        title: 'Rubikon-Modell',
        steps: 4,
        stepTitles: [
            'Abwägen',
            'Planen',
            'Handeln',
            'Bewerten'
        ],
        description: 'Das Rubikon-Modell der Handlungsphasen.',
        logic: 'action-phases', // Handlungsphasen
        features: ['4 Phasen', 'Handlung', 'Motivation', 'Umsetzung']
    },
    
    'systemic-coaching': {
        title: 'Systemisches Coaching',
        steps: 5,
        stepTitles: [
            'System analysieren',
            'Beziehungen kartieren',
            'Muster erkennen',
            'Interventionen entwickeln',
            'System verändern'
        ],
        description: 'Systemisches Coaching für ganzheitliche Entwicklung.',
        logic: 'systemic', // Systemisch
        features: ['Systemanalyse', 'Beziehungen', 'Muster', 'Interventionen']
    },
    
    'rafael-method': {
        title: 'Rafael-Methode',
        steps: 4,
        stepTitles: [
            'Spirituelle Verbindung',
            'Energie-Arbeit',
            'Heilung',
            'Integration'
        ],
        description: 'Die Rafael-Methode für spirituelle Entwicklung.',
        logic: 'spiritual', // Spirituell
        features: ['Spiritualität', 'Energie', 'Heilung', 'Integration']
    },
    
    'conflict-escalation': {
        title: 'Konflikt-Eskalation',
        steps: 9,
        stepTitles: [
            'Verhärtung',
            'Debatte',
            'Taten statt Worte',
            'Koalitionen',
            'Gesichtsverlust',
            'Drohstrategien',
            'Begrenzte Vernichtung',
            'Zersplitterung',
            'Gemeinsam in den Abgrund'
        ],
        description: 'Das 9-Stufen-Modell der Konflikteskalation nach Glasl.',
        logic: 'escalation-stages', // Eskalationsstufen
        features: ['9 Stufen', 'Konflikte', 'Eskalation', 'Deeskalation']
    },
    
    'harvard-method': {
        title: 'Harvard-Methode',
        steps: 4,
        stepTitles: [
            'Menschen trennen',
            'Interessen fokussieren',
            'Optionen entwickeln',
            'Objektive Kriterien'
        ],
        description: 'Das Harvard-Konzept für erfolgreiche Verhandlungen.',
        logic: 'negotiation-based', // Verhandlungs-basiert
        features: ['Verhandlungen', 'Interessen', 'Optionen', 'Kriterien']
    },
    
    'circular-interview': {
        title: 'Zirkuläres Interview',
        steps: 4,
        stepTitles: [
            'System definieren',
            'Zirkuläre Fragen stellen',
            'Muster erkennen',
            'Lösungen entwickeln'
        ],
        description: 'Zirkuläre Fragen für systemische Beratung.',
        logic: 'circular', // Zirkulär
        features: ['Zirkuläre Fragen', 'Systemisch', 'Muster', 'Lösungen']
    },
    
    'target-coaching': {
        title: 'Ziel-Coaching',
        steps: 5,
        stepTitles: [
            'Ziel definieren',
            'Ressourcen identifizieren',
            'Strategie entwickeln',
            'Umsetzung planen',
            'Erfolg messen'
        ],
        description: 'Zielorientiertes Coaching für nachhaltige Ergebnisse.',
        logic: 'target-oriented', // Ziel-orientiert
        features: ['Zieldefinition', 'Ressourcen', 'Strategie', 'Umsetzung']
    },
    
    'solution-focused': {
        title: 'Lösungsfokussiertes Coaching',
        steps: 4,
        stepTitles: [
            'Lösungsfokus etablieren',
            'Ausnahmen finden',
            'Ressourcen aktivieren',
            'Lösungen verstärken'
        ],
        description: 'Lösungsorientierte Kurzzeitberatung für schnelle Ergebnisse.',
        logic: 'solution-focused', // Lösungsfokussiert
        features: ['Lösungsfokus', 'Ausnahmen', 'Ressourcen', 'Verstärkung']
    },
    
    'change-stages': {
        title: 'Veränderungsstufen',
        steps: 6,
        stepTitles: [
            'Vorüberlegung',
            'Überlegung',
            'Vorbereitung',
            'Handlung',
            'Aufrechterhaltung',
            'Rückfall'
        ],
        description: 'Die 6 Stufen der Veränderung nach Prochaska.',
        logic: 'change-process', // Veränderungsprozess
        features: ['6 Stufen', 'Veränderung', 'Prozess', 'Rückfallprävention']
    },
    
    'competence-map': {
        title: 'Kompetenz-Landkarte',
        steps: 4,
        stepTitles: [
            'Kompetenzen identifizieren',
            'Niveau bewerten',
            'Lücken analysieren',
            'Entwicklungsplan erstellen'
        ],
        description: 'Erstelle deine persönliche Kompetenz-Landkarte.',
        logic: 'competence-based', // Kompetenz-basiert
        features: ['Kompetenzen', 'Bewertung', 'Lücken', 'Entwicklung']
    },
    
    'moment-excellence': {
        title: 'Moment of Excellence',
        steps: 3,
        stepTitles: [
            'Excellence-Moment finden',
            'Anker setzen',
            'Excellence aktivieren'
        ],
        description: 'NLP-Technik für Spitzenleistungen.',
        logic: 'anchoring', // Ankern
        features: ['Excellence', 'Ankern', 'Aktivierung', 'NLP']
    },
    
    'resource-analysis': {
        title: 'Ressourcen-Analyse',
        steps: 4,
        stepTitles: [
            'Ressourcen identifizieren',
            'Ressourcen bewerten',
            'Ressourcen aktivieren',
            'Ressourcen optimieren'
        ],
        description: 'Analysiere und nutze deine Ressourcen optimal.',
        logic: 'resource-based', // Ressourcen-basiert
        features: ['Identifikation', 'Bewertung', 'Aktivierung', 'Optimierung']
    },
    
    'swot-analysis': {
        title: 'SWOT-Analyse',
        steps: 4,
        stepTitles: [
            'Stärken analysieren',
            'Schwächen identifizieren',
            'Chancen erkennen',
            'Risiken bewerten'
        ],
        description: 'Stärken, Schwächen, Chancen und Risiken analysieren.',
        logic: 'analysis-based', // Analyse-basiert
        features: ['Stärken', 'Schwächen', 'Chancen', 'Risiken']
    },
    
    'wheel-of-life': {
        title: 'Wheel of Life',
        steps: 4,
        stepTitles: [
            'Lebensbereiche bewerten',
            'Balance analysieren',
            'Prioritäten setzen',
            'Aktionsplan erstellen'
        ],
        description: 'Das Lebensrad für ganzheitliche Lebensbalance.',
        logic: 'balance-based', // Balance-basiert
        features: ['Lebensbereiche', 'Balance', 'Prioritäten', 'Aktionsplan']
    },
    
    'journaling': {
        title: 'Journaling',
        steps: 4,
        stepTitles: [
            'Journaling-Setup',
            'Reflexions-Techniken',
            'Muster erkennen',
            'Wachstum dokumentieren'
        ],
        description: 'Journaling für Selbstreflexion und persönliches Wachstum.',
        logic: 'reflection-based', // Reflexions-basiert
        features: ['Setup', 'Techniken', 'Muster', 'Wachstum']
    },
    
    'vision-board': {
        title: 'Vision Board',
        steps: 4,
        stepTitles: [
            'Vision entwickeln',
            'Bilder sammeln',
            'Board erstellen',
            'Vision leben'
        ],
        description: 'Erstelle dein persönliches Vision Board für Ziele und Träume.',
        logic: 'visualization-based', // Visualisierungs-basiert
        features: ['Vision', 'Bilder', 'Board', 'Umsetzung']
    },
    
    'stress-management': {
        title: 'Stress-Management',
        steps: 5,
        stepTitles: [
            'Stress-Analyse',
            'Bewältigungsstrategien',
            'Entspannungstechniken',
            'Prävention',
            'Stress-Monitoring'
        ],
        description: 'Effektive Techniken für Stressbewältigung und Entspannung.',
        logic: 'stress-management', // Stress-Management
        features: ['Analyse', 'Strategien', 'Entspannung', 'Prävention']
    }
};

// Export für Verwendung in anderen Dateien
if (typeof module !== 'undefined' && module.exports) {
    module.exports = methodWorkflowDefinitions;
} else {
    window.methodWorkflowDefinitions = methodWorkflowDefinitions;
}
