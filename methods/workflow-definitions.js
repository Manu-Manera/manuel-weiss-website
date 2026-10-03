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
        title: "Achtsamkeit",
        steps: 5,
        stepTitles: [
            "Ankommen & Check-in",
            "Atem-Anker",
            "5-4-3-2-1 Sinne",
            "Body-Scan",
            "Reflexion & Verlauf"
        ],
        description: "Geführte Achtsamkeitssequenz: Anspannungs-Check-in, animierter Atem-Anker mit drei Rhythmen und Timer, 5-4-3-2-1-Sinnesübung, Body-Scan mit Spannungskarte, Dankbarkeit, Haltung – und ein Verlauf mit Vorher/Nachher über alle Übungen.",
        logic: 'practice-based', // Praxis-basiert
        features: ["Atem-Animation", "3 Atemrhythmen", "5-4-3-2-1", "Body-Scan", "Vorher/Nachher-Verlauf"]
    },
    
    'ikigai': {
        title: 'Ikigai',
        steps: 7,
        stepTitles: [
            'Standortbestimmung & Modell',
            'Was du liebst',
            'Worin du gut bist',
            'Was die Welt braucht',
            'Wofür du bezahlt werden kannst',
            'Synthese: Venn-Diagramm & Ikigai-Satz',
            'Aktionsplan in drei Horizonten'
        ],
        description: 'Die vier Kreise mit Stichworten füllen, in der Zuordnungs-Matrix sehen, wo sie zusammenlaufen, und daraus Ikigai-Satz und Aktionsplan ableiten.',
        logic: 'intersection-based', // Stichworte → Schnittmengen → Satz → Plan
        features: ['16 Leitfragen', 'Live-Venn-Diagramm', 'Ikigai-Satz-Builder', 'Export']
    },

    'fachliche-entwicklung': {
        title: 'Fachliche Entwicklung',
        steps: 7,
        stepTitles: [
            'Standort & Skill-Radar (Ist/Soll)',
            'Skill-Gap-Analyse & Trends',
            'Lernpfad mit Zeitplan',
            'Zertifikate & Qualifikationen',
            'Check-ins & Meilensteine',
            'Roadmap',
            'SMART-Ziele & erste Schritte'
        ],
        description: 'Skills messen, Lücken gewichten, daraus einen Lernpfad mit realistischem Zeitbudget bauen und den Fortschritt mit Check-ins verfolgen.',
        logic: 'gap-based-planning', // Ist/Soll → Gap → Pfad → Tracking
        features: ['Skill-Radar', 'Gap-Ranking', 'Lernpfad-Rechner', 'Verlaufs-Chart', 'Roadmap']
    },

    'therapy-form-finder': {
        title: 'Therapieform-Finder',
        steps: 4,
        stepTitles: [
            'Einstieg & Landkarte der Therapieformen',
            'Fragebogen (17 Fragen)',
            'Begründetes Ranking',
            'Nächste Schritte & Erstgespräch'
        ],
        description: '17 Fragen zu Anliegen, Arbeitsstil und Präferenzen – mit begründetem Ranking von 20 Therapieformen und Checkliste für die Suche.',
        logic: 'questionnaire-ranking', // Antworten → Score → Begründung
        features: ['20 Therapieformen', 'Antwort-Begründung', 'Checkliste CH/DE', 'Fragen fürs Erstgespräch']
    },

    'how-of-happiness': {
        title: 'The How of Happiness',
        steps: 6,
        stepTitles: [
            'Kompass & Glücks-Baseline',
            'Person-Activity-Fit-Diagnostik',
            'Programm & Dosierung',
            'Geführte Praxis',
            'Logbuch & Streak',
            'Review & Five Hows'
        ],
        description: 'Die 12 Glücksaktivitäten nach Sonja Lyubomirsky als personalisiertes, messbares Trainingsprogramm – von der Fit-Diagnostik bis zur Verlaufsmessung.',
        logic: 'fit-based-practice', // Passung → Praxis → Messung
        features: ['Subjective Happiness Scale', 'Fit-Score', '61 Übungen', 'Heatmap & Trend']
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
        title: "Zeitmanagement (Eisenhower)",
        steps: 5,
        stepTitles: [
            "Aufgaben sammeln & bewerten",
            "Eisenhower-Matrix",
            "Zeitbudget & Big Rocks",
            "Wochenplan",
            "Wochen-Review"
        ],
        description: "Eisenhower-Matrix mit Zeitbudget: Aufgaben nach Wichtigkeit, Dringlichkeit und Dauer bewerten, Quadranten-Verteilung analysieren, Wochenfokus (Big Rocks) setzen, auf Tage verteilen, delegieren, streichen und wöchentlich auswerten.",
        logic: 'system-based', // System-basiert
        features: ["Matrix mit Zeitanteilen", "Zeitbudget-Check", "Big Rocks", "Wochenplan", "Review & Trend"]
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
        title: 'Walt-Disney-Methode',
        steps: 5,
        stepTitles: [
            'Idee',
            'Träumer',
            'Realist',
            'Kritiker',
            'Synthese – Runde 2'
        ],
        description: 'Drei getrennte Denkräume: Träumer, Realist, Kritiker – mit Rollen-Check, Plan pro Traum-Element, bewerteter Kritik und zweiter Runde zur Synthese.',
        logic: 'creative-process', // Kreativer Prozess
        features: ['Rollen-Check', 'Traum-Elemente', 'Plan pro Idee', 'Risiko-Bewertung', 'Runde 2']
    },
    
    'nonviolent-communication': {
        title: "Gewaltfreie Kommunikation",
        steps: 6,
        stepTitles: [
            "Situation",
            "Beobachtung",
            "Gefühl",
            "Bedürfnis",
            "Bitte",
            "Botschaft & Empathie-Wechsel"
        ],
        description: "GFK nach Rosenberg mit Sprach-Check in jedem Schritt: Bewertungen in der Beobachtung, Pseudo-Gefühle, Strategien statt Bedürfnisse, Forderungen statt Bitten. Mit Gefühls- und Bedürfnis-Listen, Forderungs-Test, generierter Botschaft und Empathie-Wechsel.",
        logic: 'process-based', // Prozess-basiert
        features: ["Bewertungs-Check", "Pseudo-Gefühl-Check", "Bedürfnis-Vorschläge", "Forderungs-Test", "Empathie-Wechsel"]
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
        title: 'Wohlgeformtes Ziel (NLP)',
        steps: 6,
        stepTitles: [
            'Positiv formuliert',
            'Eigeninitiative & Kontext',
            'Sinnesspezifische Evidenz',
            'Meta-Ziel',
            'Ressourcen & Ökologie',
            'Ziel & erster Schritt'
        ],
        description: 'Ein Ziel nach den NLP-Wohlgeformtheitskriterien formulieren – mit automatischem Check (Verneinung, Vagheit, Fremdbezug), Meta-Ziel-Kette und Ökologie-Prüfung.',
        logic: 'meta-level', // Meta-Ebene
        features: ['Wohlgeformtheits-Check', 'VAKOG-Evidenz', 'Meta-Ziel', 'Sekundärgewinn', 'Ökologie']
    },
    
    'aek-communication': {
        title: 'AEK-Kommunikation',
        steps: 6,
        stepTitles: [
            'Anliegen & Muster',
            'Assertive – Ich-Botschaft',
            'Empathetic – Perspektivwechsel',
            'Kind – Wertschätzung',
            'Botschaft & Balance',
            'Vorbereitung'
        ],
        description: 'Schwierige Botschaften assertiv, empathisch und wertschätzend formulieren – mit Ich-Botschaft-Builder, Ton-Check (Weichmacher, Vorwürfe), Balance-Meter und Einwand-Vorbereitung.',
        logic: 'aspect-based', // AEK
        features: ['Ich-Botschaft', 'Perspektivwechsel', 'Ton-Check', 'Balance-Meter', 'Einwände']
    },
    
    'rubikon-model': {
        title: 'Rubikon-Modell',
        steps: 5,
        stepTitles: [
            'Abwägen',
            'Entscheiden',
            'Planen',
            'Handeln',
            'Bewerten'
        ],
        description: 'Vom Wunsch zur Tat: gewichtete Pro/Contra-Waage, Motivations-Score (Erwartung × Wert), verbindliche Entscheidung, Wenn-Dann-Pläne und Aktions-Log.',
        logic: 'action-phases', // Handlungsphasen
        features: ['Gewichtete Waage', 'Motivations-Score', 'Rubikon-Commit', 'Wenn-Dann-Pläne', 'Aktions-Log']
    },
    
    'systemic-coaching': {
        title: 'Systemisches Coaching',
        steps: 5,
        stepTitles: [
            'Anliegen & Systemlandkarte',
            'Zirkuläre Fragen & Musterschleife',
            'Funktion & Reframing',
            'Ressourcen & Hypothesen',
            'Musterunterbrechung & Experiment'
        ],
        description: 'Systemlandkarte zeichnen, zirkuläre Fragen stellen, Musterschleifen erkennen, Hypothesen bilden und ein Experiment zur Musterunterbrechung planen.',
        logic: 'systemic', // Systemisch
        features: ['Systemlandkarte', 'Zirkuläre Fragen', 'Musterschleife', 'Hypothesen', 'Experiment']
    },
    
    'rafael-method': {
        title: 'RAFAEL-Methode',
        steps: 6,
        stepTitles: [
            'Report',
            'Alternativen',
            'Feedback',
            'Austausch',
            'Erarbeitung',
            'Lernschritte'
        ],
        description: 'Strukturierte Reflexion nach einer konkreten Situation: Bericht, Alternativen, Fremdfeedback, Selbst-/Fremdbild-Abgleich und ein bis drei Lernschritte.',
        logic: 'reflection', // Reflexion & Feedback
        features: ['Report', 'Alternativen', 'Fremdfeedback', 'Selbst- vs. Fremdbild', 'Lernschritte']
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
        steps: 6,
        stepTitles: [
            'Situation',
            'Mensch und Problem trennen',
            'Interessen statt Positionen',
            'Optionen zum beiderseitigen Vorteil',
            'Kriterien & BATNA',
            'Verhandlungsplan'
        ],
        description: 'Verhandeln nach Fisher & Ury: Interessen-Abgleich beider Seiten, Optionen-Matrix (Win-Win), objektive Kriterien, BATNA-Vergleich und generierter Einstiegssatz.',
        logic: 'negotiation-based', // Verhandlungs-basiert
        features: ['Interessen-Abgleich', 'Optionen-Matrix', 'Kriterien', 'BATNA-Vergleich', 'Gesprächsplan']
    },
    
    'circular-interview': {
        title: "Zirkuläres Fragen",
        steps: 5,
        stepTitles: [
            "Situation & Beteiligte",
            "Zirkuläre Fragen generieren",
            "Perspektiven-Rad",
            "Muster & Problemschleife",
            "Erkenntnis"
        ],
        description: "Systemisches Fragen: Beteiligte erfassen, Fragen aus sechs Fragetypen für konkrete Personen-Paare generieren und aus deren Sicht beantworten, Perspektiven-Rad, Muster-Erkennung mit Problemschleife und Festgefahrenheits-Vergleich.",
        logic: 'circular', // Zirkulär
        features: ["6 Fragetypen", "Fragen-Generator", "Perspektiven-Rad", "Muster-Erkennung", "Problemschleife"]
    },
    
    'target-coaching': {
        title: 'Ziel-Coaching (GROW)',
        steps: 5,
        stepTitles: [
            'Goal – Ziel & Zielskala',
            'Reality – Ist-Zustand & Hindernisse',
            'Options – Wirkung × Aufwand',
            'Will – Entscheidung & Verbindlichkeit',
            'Check-in'
        ],
        description: 'Selbstcoaching mit GROW (Whitmore): Zielskala, Hindernis-Klassifikation, Optionen-Matrix Wirkung × Aufwand, Verbindlichkeits-Check mit Wenn-Dann-Plänen und Fortschritts-Check-ins.',
        logic: 'target-oriented', // Ziel-orientiert
        features: ['Zielskala', 'Hindernis-Analyse', 'Optionen-Matrix', 'Verbindlichkeit', 'Check-ins']
    },
    
    'solution-focused': {
        title: 'Lösungsfokussiertes Coaching',
        steps: 6,
        stepTitles: [
            'Anliegen → Ziel',
            'Wunderfrage',
            'Skalierung',
            'Ausnahmen',
            'Komplimente & Ressourcen',
            'Nächster Schritt'
        ],
        description: 'Lösungsfokussierte Kurzzeitberatung nach de Shazer & Berg: Ziel statt Problem, Wunderfrage aus vier Perspektiven, Skalierung mit Verlauf, Ausnahmen-Analyse, nächster kleiner Schritt.',
        logic: 'solution-focused', // Lösungsfokussiert
        features: ['Wunderfrage', 'Skalierung', 'Ausnahmen', 'Komplimente', 'Skalen-Verlauf']
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
