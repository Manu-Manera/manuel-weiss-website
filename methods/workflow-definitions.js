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
        title: "Stärken finden",
        steps: 5,
        stepTitles: [
            "Sammeln (4 Fragen + Pool)",
            "Bewerten: Energie × Leistung × Nutzung",
            "Stärken-Landkarte & Top 5",
            "Einsatz & Überdosis-Check",
            "Stärken-Plan"
        ],
        description: "Stärken finden mit dem Realise2-Modell: Stärken über vier Reflexionsfragen und einen Pool sammeln, jede nach Energie, Leistung und Nutzung bewerten, auf einer Landkarte echte Stärken, ungenutzte Stärken, erlernte Verhaltensweisen, Potenziale und Schwächen unterscheiden, Top 5 wählen, pro Stärke die Überdosis-Schattenseite prüfen und einen Einsatzplan ableiten.",
        logic: 'assessment-based', // Assessment-basiert
        features: ["4 Reflexionsfragen", "Energie × Leistung × Nutzung", "Stärken-Landkarte (5 Felder)", "Ungenutzte Stärken", "Überdosis-Check pro Stärke", "Einsatzplan"]
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
        title: "Emotionale Intelligenz",
        steps: 5,
        stepTitles: [
            "Selbsteinschätzung (20 Aussagen)",
            "EQ-Profil mit Radar & Konsistenz-Check",
            "Situationstest",
            "Gefühlstagebuch",
            "Training für dein Entwicklungsfeld"
        ],
        description: "EQ-Check nach Goleman: 20 Aussagen in fünf Bereichen, davon fünf invers kodiert für einen Konsistenz-Check, Profil mit Radar, Deutung pro Bereich und Hinweisen auf Verzerrung, vier Alltagssituationen als Reaktionstest mit Abgleich zum Selbstbild, Gefühlstagebuch mit Wortschatz-Analyse (Granularität, Familien, Körperbezug) und ein 14-Tage-Training mit Auslöser und Erfolgszeichen für das schwächste Feld.",
        logic: 'development-based', // Entwicklungs-basiert
        features: ["20 Items, 5 invers", "Radar + Deutung", "Konsistenz-Check", "4 Situationen", "Selbstbild vs. Verhalten", "Gefühlstagebuch", "14-Tage-Training"]
    },
    
    'habit-building': {
        title: "Gewohnheiten aufbauen",
        steps: 5,
        stepTitles: [
            "Gewohnheit designen (Cue · Routine · Reward · Identität)",
            "Reibung senken: 4 Gesetze + Wenn-dann-Plan",
            "Täglich tracken (Streak, 28-Tage-Kalender)",
            "Auswerten: Quote, Wochentage, Anpassung",
            "Dein Gewohnheits-System"
        ],
        description: "Gewohnheiten nach Clear und Fogg: Auslöser, winzige Handlung, Belohnung und Identität designen (mit Prüfung auf Grösse und Auslöser-Qualität), die vier Gesetze anwenden, Wenn-dann-Pläne gegen Hindernisse formulieren, täglich mit Streak und 28-Tage-Kalender tracken und nach ein bis zwei Wochen auswerten – mit konkreten Empfehlungen: verkleinern, Auslöser wechseln oder vergrössern.",
        logic: 'habit-loop', // Gewohnheits-Schleife
        features: ["Habit-Formel mit Qualitätscheck", "Max. 3 aktive Gewohnheiten", "4 Gesetze (Clear)", "Wenn-dann-Plan", "Streak + Kalender", "Nie-zweimal-Regel", "Wochentag-Analyse", "Anpassungs-Empfehlung"]
    },
    
    'communication': {
        title: "4-Ohren-Modell (Schulz von Thun)",
        steps: 5,
        stepTitles: [
            "Situation & Rolle",
            "Vier Seiten · gemeint vs. gehört",
            "Ohren-Profil",
            "Ich-Botschaft & Nachfrage",
            "Zusammenfassung"
        ],
        description: "Das Kommunikationsquadrat als Analyse-Werkzeug: eine echte Aussage auf Sach-, Selbstoffenbarungs-, Beziehungs- und Appellseite zerlegen, das Missverständnis zwischen gemeinter und gehörter Seite lokalisieren, per Quiz das eigene Lieblingsohr erkennen, eine geprüfte Ich-Botschaft bauen und eine Nachfrage für Metakommunikation generieren.",
        logic: 'skill-based', // Fähigkeiten-basiert
        features: ["4 Seiten zerlegen", "Gemeint vs. gehört", "Ohren-Profil-Quiz", "Ich-Botschaft mit Check", "Nachfrage-Generator"]
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
        title: "Logische Ebenen (Dilts)",
        steps: 5,
        stepTitles: [
            "Thema",
            "Aufstieg – wie ist es heute",
            "Abstieg – mit der Ressource",
            "Stimmigkeit & Glaubenssatz",
            "Hebel & erster Schritt"
        ],
        description: "Die Dilts-Pyramide als Werkzeug: ein Thema von Umgebung bis Sinn aufsteigen, mit der Ressource der oberen Ebenen absteigen, die Stimmigkeit jeder Ebene bewerten, einschränkende Glaubenssätze erkennen und umformulieren und den Hebel eine Ebene über dem Problem finden.",
        logic: 'hierarchical', // Hierarchisch
        features: ["Interaktive Pyramide", "Aufstieg & Abstieg", "Stimmigkeits-Check", "Glaubenssatz-Erkennung", "Hebel-Vorschlag"]
    },
    
    'self-assessment': {
        title: 'Selbsteinschätzung',
        steps: 5,
        stepTitles: [
            'Selbstbild & Relevanz',
            'Belege',
            'Fremdbild',
            'Profil & Prioritäten-Matrix',
            'Fokus & Verlauf'
        ],
        description: 'Selbsteinschätzung mit Tiefgang: acht Kompetenzfelder bewerten und nach Relevanz gewichten, Extremwerte mit konkreten Situationen belegen, das vermutete Fremdbild gegenüberstellen (Über-/Unterschätzung), Felder in eine Prioritäten-Matrix sortieren, ein Fokus-Feld wählen und per Momentaufnahme den Verlauf verfolgen.',
        logic: 'self-reflection', // Selbstreflexion
        features: ['8 Felder × Relevanz', 'Belege für Extremwerte', 'Selbst- vs. Fremdbild', 'Prioritäten-Matrix', 'Fokus-Vorschlag', 'Momentaufnahmen']
    },

    'johari-window': {
        title: "Johari-Fenster",
        steps: 5,
        stepTitles: [
            "Selbstbild",
            "Fremdbilder (mehrere Personen)",
            "Das Fenster",
            "Reflexion",
            "Fenster vergrössern"
        ],
        description: "Johari-Fenster mit mehreren Feedbackgebern: aus 56 Eigenschaften das Selbstbild wählen, Fremdbilder von bis zu sechs Personen aus verschiedenen Kontexten eintragen, das Fenster mit Konsens-Gewichtung sehen (offen, blind, verborgen, unbekannt), blinde Flecken und verborgene Seiten reflektieren und konkrete Schritte zum Feedback-Einholen und Sich-Mitteilen ableiten.",
        logic: 'feedback-based', // Feedback-basiert
        features: ["56 Johari-Adjektive", "Bis zu 6 Feedbackgeber", "Konsens-Gewichtung", "Fenster-Statistik", "Reflexions-Hinweise", "Frage-Text zum Teilen"]
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
        title: "Konflikteskalation (Glasl)",
        steps: 5,
        stepTitles: [
            "Der Konflikt",
            "Symptom-Check",
            "Stufe & eigener Anteil",
            "De-Eskalation & Interessen",
            "Plan & Verlauf"
        ],
        description: "Die neun Eskalationsstufen nach Glasl als Diagnose-Werkzeug: Symptome ankreuzen, die Stufe auf dem Thermometer bestimmen, den eigenen Anteil an der Eskalation erkennen, phasengerechte De-Eskalationsstrategien wählen (ab Stufe 4 mit Hinweis auf externe Hilfe), Interessen statt Positionen klären und den Verlauf protokollieren.",
        logic: 'escalation-stages', // Eskalationsstufen
        features: ["Symptom-Check → Stufe", "9-Stufen-Thermometer", "Eigener Anteil", "Strategien je Phase", "Interessen-Klärung", "Verlaufs-Log"]
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
        title: "Stufen der Veränderung (Prochaska)",
        steps: 5,
        stepTitles: [
            "Verhalten, Wichtigkeit & Zuversicht",
            "Standort-Quiz",
            "Phase, Beschreibung & Falle",
            "Phasengerechter Schritt & Waage",
            "Rückfall-Plan & Verlauf"
        ],
        description: "Das transtheoretische Modell als Standortbestimmung: Wichtigkeit und Zuversicht einschätzen, per Quiz die Phase ermitteln (Absichtslosigkeit bis Aufrechterhaltung), die typische Falle der Phase kennen, den passenden Schritt wählen, in frühen Phasen die Entscheidungs-Waage füllen, Risikosituationen und Wenn-Dann-Rückfallplan festlegen und per Check-in den Verlauf verfolgen.",
        logic: 'change-process', // Veränderungsprozess
        features: ["Wichtigkeit × Zuversicht", "Standort-Quiz", "Phasen-Treppe", "Entscheidungs-Waage", "Wenn-Dann-Rückfallplan", "Check-in-Verlauf"]
    },
    
    'competence-map': {
        title: "Kompetenz-Map",
        steps: 5,
        stepTitles: [
            "Ziel & Zeitbudget",
            "Ist / Soll bewerten",
            "Lücken & Radar",
            "Lernplan & Lernmix",
            "Zusammenfassung & Fortschritt"
        ],
        description: "Kompetenz-Map mit Ist/Soll-Analyse: Kompetenzen in vier Feldern (plus eigene) auf einer 5er-Skala bewerten, Lücken im Radar-Diagramm sehen und bis zu drei priorisieren, pro Lücke Lernwege (Tun, von anderen, Kurs, Weitergeben) und Wochenstunden festlegen, das Zeitbudget gegen den Horizont prüfen und den Fortschritt per Stand-Speicherung verfolgen.",
        logic: 'competence-based', // Kompetenz-basiert
        features: ["4 Felder + eigene Kompetenzen", "Ist/Soll-Radar", "Lücken-Priorisierung", "Lernwege & 70-20-10-Check", "Zeitbudget-Realitätscheck", "Fortschritts-Verlauf"]
    },

    'via-strengths': {
        title: "VIA-Charakterstärken",
        steps: 5,
        stepTitles: [
            "24 Stärken bewerten",
            "Tugend-Profil (Radar)",
            "Signaturstärken-Test",
            "7-Tage-Übung: neue Anwendung",
            "Reflexion"
        ],
        description: "Die 24 VIA-Charakterstärken in sechs Tugenden bewerten, das Tugend-Profil als Radar mit Interpretation sehen, Kandidaten mit dem Drei-Kriterien-Test (echt, Energie, gern genutzt) zu Signaturstärken bestätigen und eine Signaturstärke sieben Tage lang auf neue Weise einsetzen – mit Tages-Tracker, Anwendungsideen pro Stärke und Reflexion.",
        logic: 'character-strengths',
        features: ["24 Stärken × 5 Stufen", "Tugend-Radar", "Signatur-Test (3 Kriterien)", "Anwendungsideen je Stärke", "7-Tage-Tracker", "Verlauf früherer Wochen"]
    },

    'gallup-strengths': {
        title: "Gallup-Stärkendomänen",
        steps: 4,
        stepTitles: [
            "34 Talente wählen",
            "Top 5 ordnen",
            "Domänen-Profil & Schattenseiten",
            "Team-Ergänzung & Einsatz"
        ],
        description: "Die 34 CliftonStrengths-Talente mit Kurzbeschreibung wählen, die Top 5 in Reihenfolge bringen, das Domänen-Profil (Ausführen, Einfluss, Beziehungen, Strategie) mit Balance-Analyse und Domänen-Kombinationen deuten, pro Top-Talent die Schattenseite kennen und für schwache Domänen konkrete Partner im Umfeld benennen.",
        logic: 'strength-domains',
        features: ["34 Talente mit Beschreibung", "Top 5 sortierbar", "Domänen-Balken + Kombi-Deutung", "Schattenseite je Talent", "Fehlende Domäne → Partner", "Wochen-Einsatz"]
    },
    
    'moment-excellence': {
        title: "Moment of Excellence",
        steps: 5,
        stepTitles: [
            "Spitzenmomente sammeln",
            "Eintauchen & Submodalitäten",
            "Ankern, üben & testen",
            "Future Pace",
            "Anker pflegen"
        ],
        description: "NLP-Ankertechnik mit Qualitätssicherung: mehrere Spitzenmomente sammeln und den stärksten wählen, mit allen Sinnen eintauchen und über Submodalitäten (grösser, näher, heller, assoziiert) verstärken, Anker wählen und gegen die vier Anker-Kriterien prüfen, geführt setzen, den Anker neutral testen, auf künftige Situationen übertragen (vorher/nachher) und durch Auffrisch-Tracking stabil halten.",
        logic: 'anchoring', // Ankern
        features: ["Momente-Sammlung mit Stärke", "VAKOG + Submodalitäten", "4 Anker-Kriterien", "Geführtes Ankern (30 s)", "Anker-Test mit Verlauf", "Future Pace vorher/nachher", "Auffrisch-Kalender"]
    },
    
    'resource-analysis': {
        title: "Ressourcen-Analyse",
        steps: 5,
        stepTitles: [
            "Inventar in 6 Bereichen",
            "Verfügbarkeit × Nutzung bewerten",
            "Ressourcen-Landkarte",
            "Für eine Herausforderung aktivieren",
            "Ressourcen-Karte"
        ],
        description: "Ressourcen in sechs Bereichen sammeln (Fähigkeiten, Körper, Menschen, Mittel, Erfahrungen, Sinn), jede nach Verfügbarkeit und tatsächlicher Nutzung bewerten, schlafende Ressourcen, Säulen und überlastete Ressourcen auf der Landkarte erkennen, Einseitigkeit und Lücken sehen und für eine konkrete Herausforderung aktivieren – mit Erfahrungsschatz-Frage und erstem Schritt pro Ressource.",
        logic: 'resource-based', // Ressourcen-basiert
        features: ["6 Bereiche mit Vorschlägen", "Verfügbar × genutzt", "Schlafende Ressourcen", "Säulen & Überlastung", "Balance-Analyse", "Aktivierungsplan"]
    },
    
    'swot-analysis': {
        title: "Persönliche SWOT-Analyse",
        steps: 5,
        stepTitles: [
            "Entscheidungsfrage & Bereich",
            "Vier Felder mit Gewichtung",
            "Strategische Position & TOWS",
            "Massnahmen mit Priorität",
            "Deine Antwort"
        ],
        description: "SWOT mit Konsequenz: Entscheidungsfrage formulieren (mit Prüfung), Stärken, Schwächen, Chancen und Risiken mit Leitfragen sammeln und gewichten, Innen/Aussen-Verwechslungen und Verzerrungen (zu rosig, zu streng) erkennen, strategische Position (Offensiv, Absichern, Aufholen, Stabilisieren) bestimmen, TOWS-Strategien mit den wichtigsten Punkten als Anstoss ableiten und in priorisierte, terminierte Massnahmen übersetzen.",
        logic: 'analysis-based', // Analyse-basiert
        features: ["Fragen-Check", "Gewichtete Matrix", "Innen/Aussen-Erkennung", "Positions-Chart", "TOWS mit Hauptstrategie", "Massnahmen A/B/C mit Termin"]
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
        title: "Vision-Board",
        steps: 5,
        stepTitles: [
            "Das grosse Bild (Präsens-Check)",
            "10 Lebensbereiche: Bild, Satz, Wichtigkeit",
            "Visuelles Board & Fokus",
            "Vom Bild zur Handlung",
            "Ritual & Überblick"
        ],
        description: "Vision-Board mit Substanz: Zukunftsbild als Leitsatz und Tagesbeschreibung im Präsens schreiben (mit Hinweis bei Zukunftsform oder Weg-von-Formulierung), zehn Lebensbereiche mit Emoji, Satz und Wichtigkeit füllen, das Board visuell nach Wichtigkeit ordnen, bis zu drei Fokus-Bausteine wählen und mit Beweis, erstem Schritt und Loslassen in Handlung übersetzen – plus Ritual und Check-in-Zähler.",
        logic: 'visualization-based', // Visualisierungs-basiert
        features: ["Präsens- und Weg-von-Check", "10 Lebensbereiche", "Emoji + Wichtigkeit", "Visuelles Board", "Max. 3 Fokus", "Beweis · Schritt · Loslassen", "Ritual + Check-ins"]
    },
    
    'stress-management': {
        title: 'Stressmanagement',
        steps: 6,
        stepTitles: [
            'Stress-Check',
            'Stressoren-Landkarte',
            'Frühwarnsignale',
            'Love it · Change it · Leave it',
            'Bewertung & Reframe',
            'SOS-Plan & Erholung'
        ],
        description: 'Stressoren mit Intensität und Häufigkeit auf einer Landkarte sichtbar machen, Frühwarnsignale erkennen, jeden Stressor einer Strategie zuordnen (ändern, annehmen, verlassen), die Bewertung nach Lazarus prüfen (Bedrohung vs. Ressourcen), einen SOS-Plan erstellen und Belastung gegen Erholung abwägen.',
        logic: 'stress-management', // Stress-Management
        features: ['Stressoren-Landkarte', 'Frühwarnsignale', 'Love it / Change it / Leave it', 'Lazarus-Bewertung', 'SOS-Plan', 'Erholungs-Waage']
    }
};

// Export für Verwendung in anderen Dateien
if (typeof module !== 'undefined' && module.exports) {
    module.exports = methodWorkflowDefinitions;
} else {
    window.methodWorkflowDefinitions = methodWorkflowDefinitions;
}
