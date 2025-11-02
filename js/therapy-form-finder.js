/**
 * Therapy Form Finder - Umfangreicher Fragebogen zur Therapieform-Auswahl
 * Modern Tool mit Ranking-System basierend auf persönlichen Bedürfnissen
 */

class TherapyFormFinder {
    constructor() {
        this.currentStep = 0;
        this.answers = {};
        this.therapyForms = this.initializeTherapyForms();
        this.questions = this.initializeQuestions();
        this.container = null;
    }

    /**
     * Initialisiert alle Therapieformen mit ihren Eigenschaften und Schlagwörtern
     */
    initializeTherapyForms() {
        return [
            {
                id: 'sfbt',
                name: 'Lösungsorientierte Kurzzeittherapie (SFBT)',
                shortName: 'SFBT',
                description: 'Fokus auf Zielen, Ressourcen und „Ausnahmen" (Wann ist es ein bisschen besser?). Kurze, strukturierte Gespräche; praktische nächste Schritte statt Problem-Analyse.',
                keywords: ['ziele', 'ressourcen', 'lösungen', 'kurzzeit', 'praktisch', 'strukturiert', 'schnell', 'konkrete schritte', 'fortschritt', 'ausnahmen'],
                focus: ['zielorientiert', 'lösungsorientiert', 'ressourcenorientiert', 'kurzzeitig'],
                tags: ['Kurzzeittherapie', 'Lösungsorientiert', 'Praktisch']
            },
            {
                id: 'psychoanalysis',
                name: 'Psychoanalyse / psychodynamische Therapie',
                shortName: 'Psychoanalyse',
                description: 'Unbewusste Konflikte, Beziehungsmuster und Übertragung stehen im Zentrum. Von klassisch-langfristig (Analyse) bis moderner, fokussierter (tiefenpsychologisch fundiert).',
                keywords: ['unbewusst', 'konflikte', 'beziehungen', 'übertragung', 'vergangenheit', 'kindheit', 'tiefenpsychologie', 'langfristig', 'ursachen', 'muster'],
                focus: ['unbewusste prozesse', 'tiefenpsychologie', 'beziehungsmuster', 'langfristig'],
                tags: ['Tiefenpsychologie', 'Langfristig', 'Analytisch']
            },
            {
                id: 'gestalt',
                name: 'Gestalttherapie',
                shortName: 'Gestalttherapie',
                description: '„Hier-und-Jetzt"-Erleben, Kontakt und Verantwortung. Arbeitet häufig mit Experimenten (z. B. „leerer Stuhl"), Gefühlen und Körperwahrnehmung.',
                keywords: ['gegenwart', 'hier und jetzt', 'kontakt', 'gefühle', 'körper', 'experimente', 'verantwortung', 'erleben', 'wahrnehmung', 'kreativität'],
                focus: ['gegenwart', 'erleben', 'gefühle', 'körperwahrnehmung', 'experimentell'],
                tags: ['Gegenwartsorientiert', 'Experimentell', 'Ganzheitlich']
            },
            {
                id: 'cbt',
                name: 'Kognitive Verhaltenstherapie (KVT)',
                shortName: 'KVT',
                description: 'Verändert hilfreiche/untaugliche Gedanken und Verhaltensmuster; oft mit Hausaufgaben und Übungen (z. B. Exposition). Sehr gut beforscht.',
                keywords: ['gedanken', 'verhalten', 'muster', 'hausaufgaben', 'übungen', 'strukturiert', 'bewährt', 'wissenschaftlich', 'kognition', 'verhaltenstherapie'],
                focus: ['gedankenmuster', 'verhaltensänderung', 'strukturiert', 'wissenschaftlich'],
                tags: ['Wissenschaftlich', 'Strukturiert', 'Praktisch']
            },
            {
                id: 'schema',
                name: 'Schematherapie',
                shortName: 'Schematherapie',
                description: 'KVT + Bindungs- und Emotionsarbeit; arbeitet mit „Schemata/Modi" (z. B. inneres Kind, Kritiker).',
                keywords: ['schemata', 'modi', 'inneres kind', 'kritiker', 'bindung', 'emotionen', 'tiefenpsychologie', 'kvt', 'muster', 'beziehung'],
                focus: ['tiefere muster', 'emotionen', 'bindung', 'innere antreiber'],
                tags: ['Emotionsarbeit', 'Tiefenpsychologie', 'Strukturiert']
            },
            {
                id: 'act',
                name: 'ACT (Acceptance & Commitment Therapy)',
                shortName: 'ACT',
                description: 'Achtsamkeit, Akzeptanz unangenehmer innerer Erfahrungen und Handeln nach eigenen Werten.',
                keywords: ['akzeptanz', 'achtsamkeit', 'werte', 'commitment', 'flexibilität', 'gedanken', 'gefühle', 'handeln', 'persönliche werte', 'mindfulness'],
                focus: ['akzeptanz', 'werte', 'achtsamkeit', 'commitment'],
                tags: ['Achtsamkeit', 'Wertebasiert', 'Modern']
            },
            {
                id: 'dbt',
                name: 'DBT (Dialektisch-Behaviorale Therapie)',
                shortName: 'DBT',
                description: 'Skills für Emotionsregulation, Stresstoleranz, Achtsamkeit; u. a. bei Borderline & Impulskontrollproblemen.',
                keywords: ['emotionsregulation', 'stress', 'skills', 'achtsamkeit', 'impulse', 'borderline', 'selbstschädigung', 'krisen', 'fertigkeiten', 'toleranz'],
                focus: ['emotionsregulation', 'skills', 'krisenmanagement', 'impulse'],
                tags: ['Skills-basiert', 'Emotionsregulation', 'Strukturell']
            },
            {
                id: 'ipt',
                name: 'IPT (Interpersonelle Psychotherapie)',
                shortName: 'IPT',
                description: 'Bearbeitet Beziehungsthemen wie Trauer, Rollenwechsel, Konflikte; gut belegt bei Depression.',
                keywords: ['beziehungen', 'trauer', 'rollenwechsel', 'konflikte', 'depression', 'interpersonell', 'sozial', 'kommunikation', 'bindung', 'zwischenmenschlich'],
                focus: ['beziehungen', 'soziale interaktion', 'depression', 'zwischenmenschlich'],
                tags: ['Beziehungsorientiert', 'Strukturiert', 'Depression']
            },
            {
                id: 'systemic',
                name: 'Systemische Therapie',
                shortName: 'Systemische Therapie',
                description: 'Blick auf Beziehungen/Interaktionen (Familie, Paar, Team); zirkuläre Fragen, Ressourcen; einzeln, als Paar- oder Familientherapie.',
                keywords: ['system', 'familie', 'paar', 'beziehungen', 'interaktionen', 'ressourcen', 'muster', 'kommunikation', 'dynamik', 'team'],
                focus: ['system', 'beziehungen', 'interaktionen', 'ressourcen'],
                tags: ['Systemisch', 'Beziehungsorientiert', 'Ressourcenorientiert']
            },
            {
                id: 'emdr',
                name: 'EMDR',
                shortName: 'EMDR',
                description: 'Traumatherapie mit bilateraler Stimulation zur Verarbeitung belastender Erinnerungen; wirksam v. a. bei PTSD.',
                keywords: ['trauma', 'ptsd', 'erinnerungen', 'bilateral', 'stimulation', 'verarbeitung', 'belastung', 'symptome', 'traumatherapie', 'ereignisse'],
                focus: ['trauma', 'traumatherapie', 'erinnerungen', 'ptsd'],
                tags: ['Traumatherapie', 'Spezialisiert', 'Bewährt']
            },
            {
                id: 'mbt',
                name: 'MBT (Mentalisierungsbasierte Therapie)',
                shortName: 'MBT',
                description: 'Fördert das Verstehen eigener/anderer innerer Zustände; häufig bei instabiler Emotionsregulation.',
                keywords: ['mentalisierung', 'emotionen', 'verstehen', 'zustände', 'beziehung', 'bindung', 'impulse', 'reflexion', 'selbstverständnis', 'empathie'],
                focus: ['mentalisierung', 'emotionsregulation', 'beziehung', 'reflexion'],
                tags: ['Mentalisierung', 'Beziehungsorientiert', 'Reflexiv']
            },
            {
                id: 'trauma-cbt',
                name: 'Traumafokussierte KVT (z. B. PE, CPT)',
                shortName: 'Traumafokussierte KVT',
                description: 'Strukturiertes Bearbeiten von Traumaerinnerungen und Überzeugungen.',
                keywords: ['trauma', 'erinnerungen', 'überzeugungen', 'exposition', 'kvt', 'strukturiert', 'ptsd', 'verarbeitung', 'bearbeitung', 'ereignisse'],
                focus: ['trauma', 'traumafokussiert', 'kvt', 'exposition'],
                tags: ['Traumatherapie', 'Strukturiert', 'KVT-basiert']
            },
            {
                id: 'mbct',
                name: 'MBCT / Achtsamkeitsbasierte Verfahren',
                shortName: 'MBCT/MBSR',
                description: 'Rückfallprophylaxe bei Depression, Umgang mit Grübeln/Stress mittels Achtsamkeit (MBCT/MBSR).',
                keywords: ['achtsamkeit', 'meditation', 'depression', 'rückfall', 'grübeln', 'stress', 'mindfulness', 'bewusstsein', 'gegenwart', 'übungen'],
                focus: ['achtsamkeit', 'rückfallprophylaxe', 'depression', 'mindfulness'],
                tags: ['Achtsamkeit', 'Depression', 'Präventiv']
            },
            {
                id: 'mi',
                name: 'Motivational Interviewing (MI)',
                shortName: 'MI',
                description: 'Klärt Ambivalenzen, stärkt Veränderungsmotivation (bes. bei Sucht/Verhaltensänderung).',
                keywords: ['motivation', 'ambivalenz', 'veränderung', 'sucht', 'verhalten', 'bereitschaft', 'selbstwirksamkeit', 'entscheidung', 'klärung', 'schritte'],
                focus: ['motivation', 'ambivalenz', 'veränderungsbereitschaft', 'sucht'],
                tags: ['Motivationsfördernd', 'Kurzzeit', 'Praktisch']
            },
            {
                id: 'person-centered',
                name: 'Personzentrierte Gesprächstherapie (Rogers)',
                shortName: 'Personzentrierte Therapie',
                description: 'Veränderung durch Empathie, Echtheit, bedingungsfreie Wertschätzung.',
                keywords: ['empathie', 'echtheit', 'wertschätzung', 'akzeptanz', 'beziehung', 'gespräch', 'selbstverwirklichung', 'wachstum', 'vertrauen', 'raum'],
                focus: ['beziehung', 'empathie', 'wachstum', 'selbstverwirklichung'],
                tags: ['Beziehungsorientiert', 'Humanistisch', 'Langfristig']
            },
            {
                id: 'hypnotherapy',
                name: 'Hypnotherapie (klinisch)',
                shortName: 'Hypnotherapie',
                description: 'Nutzung von Trance/Imagination zur Aktivierung von Ressourcen, oft integriert in KVT.',
                keywords: ['hypnose', 'trance', 'imagination', 'ressourcen', 'unterbewusst', 'suggestion', 'tiefenentspannung', 'visualisierung', 'kvt', 'aktivierung'],
                focus: ['hypnose', 'imagination', 'ressourcen', 'unterbewusst'],
                tags: ['Imaginativ', 'Ressourcenorientiert', 'KVT-basiert']
            },
            {
                id: 'psychodrama',
                name: 'Psychodrama / kreative Therapien',
                shortName: 'Psychodrama',
                description: 'Erlebnis- und Rollenspielarbeit bzw. Ausdruck über Kunst/Musik/Bewegung.',
                keywords: ['rolle', 'spiel', 'kreativität', 'kunst', 'musik', 'bewegung', 'erlebnis', 'ausdruck', 'drama', 'theater'],
                focus: ['kreativität', 'erlebnisorientiert', 'ausdruck', 'rolle'],
                tags: ['Kreativ', 'Erlebnisorientiert', 'Ganzheitlich']
            },
            {
                id: 'logotherapy',
                name: 'Logotherapie/Existenzanalyse',
                shortName: 'Logotherapie',
                description: 'Sinn-, Werte- und Verantwortungsfragen bei Lebenskrisen.',
                keywords: ['sinn', 'werte', 'verantwortung', 'krise', 'existenz', 'bedeutung', 'leben', 'ziel', 'zweck', 'philosophie'],
                focus: ['sinn', 'werte', 'existenzielle fragen', 'krisen'],
                tags: ['Sinnorientiert', 'Existenzphilosophisch', 'Krisenorientiert']
            },
            {
                id: 'cbasp',
                name: 'CBASP',
                shortName: 'CBASP',
                description: 'Speziell für chronische Depression, verbindet KVT und interpersonelle Übungen.',
                keywords: ['depression', 'chronisch', 'kvt', 'interpersonell', 'sozial', 'verhalten', 'übungen', 'strukturiert', 'spezialisiert', 'langfristig'],
                focus: ['chronische depression', 'kvt', 'interpersonell', 'spezialisiert'],
                tags: ['Depression', 'Spezialisiert', 'KVT-basiert']
            },
            {
                id: 'couple-sexual',
                name: 'Paar- und Sexualtherapie',
                shortName: 'Paar- & Sexualtherapie',
                description: 'Spezifischer Fokus auf Beziehung/Intimität/Kommunikation.',
                keywords: ['paar', 'beziehung', 'sexualität', 'intimität', 'kommunikation', 'partnerschaft', 'konflikte', 'liebe', 'nähe', 'bindung'],
                focus: ['paarbeziehung', 'sexualität', 'intimität', 'kommunikation'],
                tags: ['Beziehungsorientiert', 'Spezialisiert', 'Paar']
            }
        ];
    }

    /**
     * Initialisiert den umfangreichen Fragenkatalog
     */
    initializeQuestions() {
        return [
            // Kategorie: Aktuelle Situation & Symptome
            {
                id: 'symptoms',
                category: 'situation',
                text: 'Welche der folgenden Beschwerden/Symptome beschreiben am besten deine aktuelle Situation?',
                type: 'multiple',
                options: [
                    { value: 'depression', label: 'Depression (Antriebslosigkeit, Traurigkeit, Hoffnungslosigkeit)' },
                    { value: 'anxiety', label: 'Angststörungen (Panikattacken, Sorgen, Phobien)' },
                    { value: 'trauma', label: 'Trauma-Symptome (belastende Erinnerungen, Flashbacks, Vermeidung)' },
                    { value: 'relationships', label: 'Beziehungsprobleme (Konflikte, Kommunikation, Nähe/Distanz)' },
                    { value: 'emotion-regulation', label: 'Emotionsregulation (starke Schwankungen, Impulsivität)' },
                    { value: 'stress', label: 'Stress & Belastung (Überforderung, Burnout, Druck)' },
                    { value: 'identity', label: 'Identitäts-/Sinnkrise (Wer bin ich? Wofür lebe ich?)' },
                    { value: 'addiction', label: 'Suchtverhalten (Substanzen, Verhalten, Abhängigkeit)' },
                    { value: 'self-esteem', label: 'Selbstwertprobleme (Kritik, Selbstzweifel, Perfektionismus)' },
                    { value: 'grief', label: 'Trauer & Verlust (Tod, Trennung, Lebensveränderungen)' },
                    { value: 'work', label: 'Berufliche Probleme (Unzufriedenheit, Konflikte, Überforderung)' },
                    { value: 'other', label: 'Andere Beschwerden' }
                ]
            },
            
            // Kategorie: Therapie-Prioritäten
            {
                id: 'priorities',
                category: 'approach',
                text: 'Was ist dir in der Therapie am wichtigsten?',
                type: 'multiple',
                options: [
                    { value: 'quick-results', label: 'Schnelle, praktische Lösungen und konkrete nächste Schritte' },
                    { value: 'deep-understanding', label: 'Tiefes Verständnis von Ursachen und Mustern' },
                    { value: 'skills', label: 'Konkrete Fertigkeiten und Techniken erlernen (z. B. Emotionsregulation)' },
                    { value: 'relationships', label: 'Verbesserung von Beziehungen und Kommunikation' },
                    { value: 'acceptance', label: 'Akzeptanz lernen und mit schwierigen Gefühlen umgehen' },
                    { value: 'values', label: 'Werte klären und nach ihnen handeln' },
                    { value: 'present-moment', label: 'Mehr im Hier und Jetzt leben' },
                    { value: 'creativity', label: 'Kreativer Ausdruck und Erlebnisorientierung' },
                    { value: 'resources', label: 'Ressourcen aktivieren und Stärken nutzen' },
                    { value: 'structure', label: 'Struktur und klare Übungen/Hausaufgaben' }
                ]
            },

            // Kategorie: Therapie-Stil Präferenzen
            {
                id: 'therapy-style',
                category: 'approach',
                text: 'Welcher Therapiestil spricht dich am meisten an?',
                type: 'single',
                options: [
                    { value: 'directive', label: 'Direktiv & strukturiert (Therapeut*in gibt klare Anleitungen)' },
                    { value: 'non-directive', label: 'Non-direktiv (offener Raum, wenig Vorgaben)' },
                    { value: 'experiential', label: 'Erlebnisorientiert (Experimente, Rollenspiele, Kreativität)' },
                    { value: 'analytical', label: 'Analytisch & reflektierend (Verstehen, Deutungen, Reflexion)' },
                    { value: 'skills-based', label: 'Skills-basiert (konkrete Techniken und Übungen)' },
                    { value: 'relationship-focused', label: 'Beziehungsorientiert (Therapeutische Beziehung im Fokus)' }
                ]
            },

            // Kategorie: Zeitrahmen
            {
                id: 'timeframe',
                category: 'practical',
                text: 'Welcher Zeitrahmen passt für dich?',
                type: 'single',
                options: [
                    { value: 'short-term', label: 'Kurzfristig (6-12 Sitzungen, 2-4 Monate)' },
                    { value: 'medium-term', label: 'Mittelfristig (20-40 Sitzungen, 6-12 Monate)' },
                    { value: 'long-term', label: 'Langfristig (über 1 Jahr, tiefgehende Arbeit)' },
                    { value: 'flexible', label: 'Flexibel, je nach Bedarf' }
                ]
            },

            // Kategorie: Fokus-Bereich
            {
                id: 'focus-area',
                category: 'situation',
                text: 'Worauf möchtest du primär fokussieren?',
                type: 'single',
                options: [
                    { value: 'past', label: 'Vergangenheit verstehen (Kindheit, frühere Erfahrungen, Ursachen)' },
                    { value: 'present', label: 'Gegenwart verbessern (Jetzt-Situation, aktuelle Muster)' },
                    { value: 'future', label: 'Zukunft gestalten (Ziele, Werte, nächste Schritte)' },
                    { value: 'balance', label: 'Ausgewogen (Alles miteinander)' }
                ]
            },

            // Kategorie: Beziehungsfokus
            {
                id: 'relationship-focus',
                category: 'situation',
                text: 'Wie wichtig sind Beziehungsthemen für dich?',
                type: 'single',
                options: [
                    { value: 'primary', label: 'Sehr wichtig - Beziehungen sind Hauptthema (Paar, Familie, sozial)' },
                    { value: 'secondary', label: 'Wichtig - Beziehungen sind Teil der Problematik' },
                    { value: 'individual', label: 'Weniger wichtig - Fokus eher auf individuelle Themen' },
                    { value: 'not-applicable', label: 'Nicht relevant für meine Situation' }
                ]
            },

            // Kategorie: Strukturierungsgrad
            {
                id: 'structure',
                category: 'approach',
                text: 'Wie viel Struktur brauchst du in der Therapie?',
                type: 'single',
                options: [
                    { value: 'high', label: 'Viel Struktur (klare Übungen, Hausaufgaben, Pläne)' },
                    { value: 'medium', label: 'Mittlere Struktur (einige Übungen, aber auch Raum für Offenheit)' },
                    { value: 'low', label: 'Wenig Struktur (offener Prozess, wenig Vorgaben)' },
                    { value: 'flexible', label: 'Flexibel, je nach Situation' }
                ]
            },

            // Kategorie: Arbeit mit Gefühlen
            {
                id: 'emotions-work',
                category: 'approach',
                text: 'Wie möchtest du mit Gefühlen arbeiten?',
                type: 'single',
                options: [
                    { value: 'regulate', label: 'Emotionen regulieren lernen (Skills, Techniken)' },
                    { value: 'accept', label: 'Gefühle akzeptieren und mit ihnen umgehen (Achtsamkeit)' },
                    { value: 'explore', label: 'Gefühle erkunden und verstehen (Was steckt dahinter?)' },
                    { value: 'express', label: 'Gefühle ausdrücken (kreativ, körperlich, durch Handeln)' },
                    { value: 'balance', label: 'Ausgewogen (je nach Situation unterschiedlich)' }
                ]
            },

            // Kategorie: Traumathema
            {
                id: 'trauma',
                category: 'situation',
                text: 'Hast du belastende oder traumatische Erfahrungen, die verarbeitet werden müssen?',
                type: 'single',
                options: [
                    { value: 'yes-primary', label: 'Ja, Trauma ist Hauptthema (PTSD-Symptome, Flashbacks)' },
                    { value: 'yes-secondary', label: 'Ja, aber nicht primär (spielt mit rein)' },
                    { value: 'maybe', label: 'Vielleicht, bin mir nicht sicher' },
                    { value: 'no', label: 'Nein, kein Trauma' }
                ]
            },

            // Kategorie: Wissenschaft vs. Erfahrung
            {
                id: 'evidence',
                category: 'approach',
                text: 'Wie wichtig ist dir wissenschaftliche Evidenz?',
                type: 'single',
                options: [
                    { value: 'very-important', label: 'Sehr wichtig - Methoden sollten wissenschaftlich belegt sein' },
                    { value: 'important', label: 'Wichtig - aber auch Erfahrungsorientierung' },
                    { value: 'less-important', label: 'Weniger wichtig - Wirkung zählt, nicht die Methode' },
                    { value: 'not-relevant', label: 'Nicht relevant für mich' }
                ]
            },

            // Kategorie: Körper & Bewegung
            {
                id: 'body-awareness',
                category: 'approach',
                text: 'Wie wichtig ist dir Körperwahrnehmung und körperliche Arbeit?',
                type: 'single',
                options: [
                    { value: 'very-important', label: 'Sehr wichtig - Körper ist zentraler Teil der Therapie' },
                    { value: 'important', label: 'Wichtig - Körperarbeit ist Teil davon' },
                    { value: 'somewhat', label: 'Etwas wichtig - kann hilfreich sein' },
                    { value: 'not-important', label: 'Nicht wichtig - Fokus auf Gespräch/Theorie' }
                ]
            },

            // Kategorie: Sucht & Verhalten
            {
                id: 'addiction',
                category: 'situation',
                text: 'Gibt es Suchtverhalten oder problematische Verhaltensmuster, die verändert werden sollen?',
                type: 'single',
                options: [
                    { value: 'yes-primary', label: 'Ja, Sucht ist Hauptthema' },
                    { value: 'yes-secondary', label: 'Ja, spielt eine Rolle' },
                    { value: 'maybe', label: 'Vielleicht, unsicher' },
                    { value: 'no', label: 'Nein' }
                ]
            },

            // Kategorie: Achtsamkeit & Meditation
            {
                id: 'mindfulness',
                category: 'approach',
                text: 'Wie stehst du zu Achtsamkeit und Meditation?',
                type: 'single',
                options: [
                    { value: 'very-positive', label: 'Sehr positiv - möchte gerne lernen/vertiefen' },
                    { value: 'positive', label: 'Positiv - kann mir vorstellen, es zu versuchen' },
                    { value: 'neutral', label: 'Neutral - weder positiv noch negativ' },
                    { value: 'negative', label: 'Negativ - nicht mein Ding' }
                ]
            },

            // Kategorie: Motivation
            {
                id: 'motivation',
                category: 'approach',
                text: 'Wie ist deine aktuelle Veränderungsmotivation?',
                type: 'single',
                options: [
                    { value: 'very-high', label: 'Sehr hoch - bin bereit und willig, aktiv zu arbeiten' },
                    { value: 'high', label: 'Hoch - motiviert, aber manchmal unsicher' },
                    { value: 'ambivalent', label: 'Ambivalent - zwischen Wunsch und Widerstand' },
                    { value: 'low', label: 'Niedrig - brauche Unterstützung bei der Motivation' }
                ]
            },

            // Kategorie: Chronische Probleme
            {
                id: 'chronic',
                category: 'situation',
                text: 'Wie lange bestehen deine Probleme bereits?',
                type: 'single',
                options: [
                    { value: 'recent', label: 'Kürzlich aufgetreten (Wochen bis Monate)' },
                    { value: 'months', label: 'Seit mehreren Monaten (6-12 Monate)' },
                    { value: 'years', label: 'Seit Jahren (1-5 Jahre)' },
                    { value: 'chronic', label: 'Seit sehr langer Zeit / chronisch (über 5 Jahre)' }
                ]
            },

            // Kategorie: Beziehungsform
            {
                id: 'therapy-format',
                category: 'practical',
                text: 'Welches Format bevorzugst du?',
                type: 'single',
                options: [
                    { value: 'individual', label: 'Einzeltherapie' },
                    { value: 'couple', label: 'Paartherapie' },
                    { value: 'family', label: 'Familientherapie' },
                    { value: 'group', label: 'Gruppentherapie' },
                    { value: 'flexible', label: 'Flexibel / verschiedene Formate' }
                ]
            },

            // Kategorie: Kreativität & Ausdruck
            {
                id: 'creativity',
                category: 'approach',
                text: 'Wie wichtig ist dir kreativer Ausdruck (Kunst, Musik, Bewegung, Rollenspiel)?',
                type: 'single',
                options: [
                    { value: 'very-important', label: 'Sehr wichtig - möchte kreativ arbeiten' },
                    { value: 'important', label: 'Wichtig - kann hilfreich sein' },
                    { value: 'somewhat', label: 'Etwas wichtig - wenn es passt' },
                    { value: 'not-important', label: 'Nicht wichtig - bevorzuge Gespräch' }
                ]
            }
        ];
    }

    /**
     * Startet den Fragebogen
     */
    start(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error('Container nicht gefunden:', containerId);
            return;
        }
        this.render();
    }

    /**
     * Rendert die aktuelle Frage oder Ergebnisse
     */
    render() {
        if (this.currentStep >= this.questions.length) {
            this.showResults();
            return;
        }

        const question = this.questions[this.currentStep];
        const progress = ((this.currentStep + 1) / this.questions.length) * 100;

        this.container.innerHTML = `
            <div class="therapy-finder-container">
                <div class="therapy-finder-header">
                    <h2>🎯 Therapieform-Finder</h2>
                    <p class="subtitle">Finde die passende Therapieform für dich</p>
                </div>

                <div class="therapy-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress}%"></div>
                    </div>
                    <div class="progress-text">
                        Frage ${this.currentStep + 1} von ${this.questions.length}
                    </div>
                </div>

                <div class="therapy-question">
                    <h3 class="question-text">${question.text}</h3>
                    
                    <div class="question-options ${question.type === 'multiple' ? 'multiple-choice' : 'single-choice'}">
                        ${question.options.map((option, index) => `
                            <label class="option-label">
                                <input 
                                    type="${question.type === 'multiple' ? 'checkbox' : 'radio'}" 
                                    name="question-${question.id}" 
                                    value="${option.value}"
                                    class="option-input"
                                >
                                <span class="option-text">${option.label}</span>
                            </label>
                        `).join('')}
                    </div>

                    <div class="therapy-navigation">
                        ${this.currentStep > 0 ? `
                            <button class="btn btn-outline" onclick="therapyFinder.previousQuestion()">
                                <i class="fas fa-arrow-left"></i> Zurück
                            </button>
                        ` : ''}
                        <button class="btn btn-primary" onclick="therapyFinder.nextQuestion()">
                            ${this.currentStep < this.questions.length - 1 ? 'Weiter' : 'Ergebnisse anzeigen'}
                            <i class="fas fa-arrow-right"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Geht zur nächsten Frage
     */
    nextQuestion() {
        const question = this.questions[this.currentStep];
        const inputs = this.container.querySelectorAll(`input[name="question-${question.id}"]:checked`);
        
        if (inputs.length === 0 && question.type === 'single') {
            alert('Bitte wähle eine Option aus.');
            return;
        }

        // Antworten speichern
        if (question.type === 'multiple') {
            this.answers[question.id] = Array.from(inputs).map(input => input.value);
        } else {
            this.answers[question.id] = inputs[0]?.value || null;
        }

        this.currentStep++;
        this.render();
    }

    /**
     * Geht zur vorherigen Frage
     */
    previousQuestion() {
        if (this.currentStep > 0) {
            this.currentStep--;
            this.render();
        }
    }

    /**
     * Berechnet das Ranking der Therapieformen basierend auf den Antworten
     */
    calculateRanking() {
        const scores = {};

        // Initialisiere Scores
        this.therapyForms.forEach(therapy => {
            scores[therapy.id] = 0;
        });

        // Bewertung basierend auf Antworten
        Object.keys(this.answers).forEach(questionId => {
            const answer = this.answers[questionId];
            if (!answer) return;

            const answers = Array.isArray(answer) ? answer : [answer];
            
            answers.forEach(ans => {
                // Symptome-Matching
                if (questionId === 'symptoms') {
                    this.therapyForms.forEach(therapy => {
                        if (this.matchesSymptom(therapy, ans)) {
                            scores[therapy.id] += 3;
                        }
                    });
                }

                // Prioritäten-Matching
                if (questionId === 'priorities') {
                    this.therapyForms.forEach(therapy => {
                        if (this.matchesPriority(therapy, ans)) {
                            scores[therapy.id] += 2;
                        }
                    });
                }

                // Therapiestil-Matching
                if (questionId === 'therapy-style') {
                    this.therapyForms.forEach(therapy => {
                        if (this.matchesStyle(therapy, ans)) {
                            scores[therapy.id] += 3;
                        }
                    });
                }

                // Zeitrahmen-Matching
                if (questionId === 'timeframe') {
                    this.therapyForms.forEach(therapy => {
                        if (this.matchesTimeframe(therapy, ans)) {
                            scores[therapy.id] += 2;
                        }
                    });
                }

                // Traumathema-Matching
                if (questionId === 'trauma' && (ans === 'yes-primary' || ans === 'yes-secondary')) {
                    ['emdr', 'trauma-cbt', 'mbt'].forEach(id => {
                        scores[id] += 5;
                    });
                }

                // Beziehungsthemen-Matching
                if (questionId === 'relationship-focus' && ans === 'primary') {
                    ['ipt', 'systemic', 'couple-sexual'].forEach(id => {
                        scores[id] += 4;
                    });
                }

                // Strukturierungsgrad
                if (questionId === 'structure') {
                    this.therapyForms.forEach(therapy => {
                        if (this.matchesStructure(therapy, ans)) {
                            scores[therapy.id] += 2;
                        }
                    });
                }

                // Emotionsarbeit
                if (questionId === 'emotions-work') {
                    this.therapyForms.forEach(therapy => {
                        if (this.matchesEmotionsWork(therapy, ans)) {
                            scores[therapy.id] += 2;
                        }
                    });
                }

                // Achtsamkeit
                if (questionId === 'mindfulness' && (ans === 'very-positive' || ans === 'positive')) {
                    ['act', 'dbt', 'mbct'].forEach(id => {
                        scores[id] += 3;
                    });
                }

                // Sucht
                if (questionId === 'addiction' && (ans === 'yes-primary' || ans === 'yes-secondary')) {
                    ['mi', 'cbt', 'dbt'].forEach(id => {
                        scores[id] += 3;
                    });
                }

                // Motivation
                if (questionId === 'motivation' && ans === 'ambivalent') {
                    scores['mi'] += 4;
                }

                // Chronische Depression
                if (questionId === 'chronic' && ans === 'chronic') {
                    scores['cbasp'] += 5;
                    scores['mbct'] += 3;
                }

                // Kreativität
                if (questionId === 'creativity' && (ans === 'very-important' || ans === 'important')) {
                    ['gestalt', 'psychodrama'].forEach(id => {
                        scores[id] += 4;
                    });
                }

                // Körperwahrnehmung
                if (questionId === 'body-awareness' && (ans === 'very-important' || ans === 'important')) {
                    ['gestalt', 'psychodrama'].forEach(id => {
                        scores[id] += 3;
                    });
                }

                // Format-Matching
                if (questionId === 'therapy-format') {
                    if (ans === 'couple') {
                        scores['couple-sexual'] += 5;
                        scores['systemic'] += 4;
                    }
                    if (ans === 'family') {
                        scores['systemic'] += 5;
                    }
                }
            });
        });

        // Sortiere Therapieformen nach Score
        const ranked = this.therapyForms.map(therapy => ({
            ...therapy,
            score: scores[therapy.id] || 0,
            matchPercentage: Math.min(100, Math.round((scores[therapy.id] / 30) * 100))
        })).sort((a, b) => b.score - a.score);

        return ranked;
    }

    /**
     * Hilfsfunktionen für Matching
     */
    matchesSymptom(therapy, symptom) {
        const matches = {
            'depression': ['cbt', 'ipt', 'cbasp', 'mbct', 'act'],
            'anxiety': ['cbt', 'act', 'dbt'],
            'trauma': ['emdr', 'trauma-cbt', 'mbt'],
            'relationships': ['ipt', 'systemic', 'couple-sexual', 'mbt'],
            'emotion-regulation': ['dbt', 'mbt', 'schema'],
            'stress': ['cbt', 'act', 'mbct', 'sfbt'],
            'identity': ['logotherapy', 'person-centered', 'gestalt'],
            'addiction': ['mi', 'cbt', 'dbt'],
            'self-esteem': ['cbt', 'schema', 'person-centered'],
            'grief': ['ipt', 'logotherapy'],
            'work': ['sfbt', 'cbt', 'act']
        };
        return matches[symptom]?.includes(therapy.id) || false;
    }

    matchesPriority(therapy, priority) {
        const matches = {
            'quick-results': ['sfbt', 'cbt', 'mi'],
            'deep-understanding': ['psychoanalysis', 'schema', 'gestalt'],
            'skills': ['cbt', 'dbt', 'act'],
            'relationships': ['ipt', 'systemic', 'couple-sexual'],
            'acceptance': ['act', 'mbct'],
            'values': ['act', 'logotherapy'],
            'present-moment': ['gestalt', 'mbct', 'act'],
            'creativity': ['gestalt', 'psychodrama'],
            'resources': ['sfbt', 'hypnotherapy', 'person-centered'],
            'structure': ['cbt', 'dbt', 'ipt', 'cbasp']
        };
        return matches[priority]?.includes(therapy.id) || false;
    }

    matchesStyle(therapy, style) {
        const matches = {
            'directive': ['cbt', 'dbt', 'ipt', 'cbasp', 'sfbt'],
            'non-directive': ['person-centered', 'psychoanalysis'],
            'experiential': ['gestalt', 'psychodrama'],
            'analytical': ['psychoanalysis', 'schema', 'mbt'],
            'skills-based': ['cbt', 'dbt', 'act', 'mbct'],
            'relationship-focused': ['person-centered', 'ipt', 'systemic', 'couple-sexual']
        };
        return matches[style]?.includes(therapy.id) || false;
    }

    matchesTimeframe(therapy, timeframe) {
        const shortTerm = ['sfbt', 'mi', 'cbt', 'ipt'];
        const longTerm = ['psychoanalysis', 'person-centered', 'gestalt', 'logotherapy'];
        
        if (timeframe === 'short-term') {
            return shortTerm.includes(therapy.id);
        }
        if (timeframe === 'long-term') {
            return longTerm.includes(therapy.id);
        }
        return true; // mittelfristig passt zu allen
    }

    matchesStructure(therapy, structure) {
        const highStructure = ['cbt', 'dbt', 'ipt', 'cbasp', 'trauma-cbt'];
        const lowStructure = ['person-centered', 'psychoanalysis', 'gestalt'];
        
        if (structure === 'high') {
            return highStructure.includes(therapy.id);
        }
        if (structure === 'low') {
            return lowStructure.includes(therapy.id);
        }
        return true;
    }

    matchesEmotionsWork(therapy, work) {
        const matches = {
            'regulate': ['dbt', 'cbt'],
            'accept': ['act', 'mbct', 'dbt'],
            'explore': ['psychoanalysis', 'schema', 'gestalt'],
            'express': ['gestalt', 'psychodrama']
        };
        return matches[work]?.includes(therapy.id) || false;
    }

    /**
     * Zeigt die Ergebnisse
     */
    showResults() {
        const ranked = this.calculateRanking();
        const topTherapies = ranked.slice(0, 5);

        this.container.innerHTML = `
            <div class="therapy-results-container">
                <div class="therapy-results-header">
                    <h2>🎯 Deine passenden Therapieformen</h2>
                    <p class="subtitle">Basierend auf deinen Antworten wurden folgende Therapieformen für dich ermittelt:</p>
                </div>

                <div class="therapy-results-grid">
                    ${topTherapies.map((therapy, index) => `
                        <div class="therapy-result-card ${index === 0 ? 'top-match' : ''}">
                            <div class="therapy-result-header">
                                <div class="therapy-rank">${index + 1}</div>
                                <h3>${therapy.name}</h3>
                                <div class="therapy-match-score">
                                    <div class="match-bar">
                                        <div class="match-fill" style="width: ${therapy.matchPercentage}%"></div>
                                    </div>
                                    <span class="match-percentage">${therapy.matchPercentage}% Übereinstimmung</span>
                                </div>
                            </div>
                            
                            <div class="therapy-result-content">
                                <p class="therapy-description">${therapy.description}</p>
                                
                                <div class="therapy-tags">
                                    ${therapy.tags.map(tag => `<span class="therapy-tag">${tag}</span>`).join('')}
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>

                <div class="therapy-all-results">
                    <h3>Alle Therapieformen im Überblick</h3>
                    <div class="therapy-list">
                        ${ranked.map((therapy, index) => `
                            <div class="therapy-list-item">
                                <div class="therapy-list-rank">${index + 1}</div>
                                <div class="therapy-list-content">
                                    <h4>${therapy.name}</h4>
                                    <p>${therapy.description}</p>
                                    <div class="therapy-list-match">
                                        <span>${therapy.matchPercentage}% Übereinstimmung</span>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="therapy-results-actions">
                    <button class="btn btn-primary" onclick="therapyFinder.restart()">
                        <i class="fas fa-redo"></i> Erneut durchführen
                    </button>
                    <button class="btn btn-outline" onclick="therapyFinder.downloadResults()">
                        <i class="fas fa-download"></i> Ergebnisse als PDF
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Startet den Fragebogen neu
     */
    restart() {
        this.currentStep = 0;
        this.answers = {};
        this.render();
    }

    /**
     * Lädt Ergebnisse als PDF herunter
     */
    downloadResults() {
        // TODO: PDF-Generierung implementieren
        alert('PDF-Funktion wird noch implementiert.');
    }
}

// Globale Instanz
let therapyFinder;

// Initialisierung wenn DOM geladen ist
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        therapyFinder = new TherapyFormFinder();
    });
} else {
    therapyFinder = new TherapyFormFinder();
}

