/* Ikigai · Inhalte (Kreise, Leitfragen, Schnittmengen, Reflexion, Links) */
window.IKIGAI_DATA = {
    CIRCLES: [
        {
            id: 'love', ask: 'Was daran macht dir wirklich Freude – oder wie könntest du es so gestalten, dass es dir Freude macht?', short: 'Lieben', label: 'Was du liebst', icon: '❤️', color: '#ef4444',
            lead: 'Wobei vergisst du die Zeit? Was würdest du tun, auch wenn niemand zuschaut und niemand dafür zahlt?',
            prompts: [
                { k: 'activities', l: 'Welche Aktivitäten machen dir am meisten Freude?', h: 'Denk an Momente voller Energie und Begeisterung – unabhängig davon, ob du gut darin bist oder jemand dafür zahlt.' },
                { k: 'interests', l: 'Wofür interessierst du dich, ohne dass dich jemand dazu bringen muss?', h: 'Themen, zu denen du freiwillig liest, Podcasts hörst oder Gespräche suchst.' },
                { k: 'energy', l: 'Wann fühlst du dich am lebendigsten?', h: 'Flow-Momente: Die Zeit vergeht wie im Flug, du bist ganz bei der Sache.' },
                { k: 'child', l: 'Was hast du als Kind geliebt – und was davon steckt noch in dir?', h: 'Kindliche Begeisterung ist oft ein unverfälschter Hinweis auf das, was dich wirklich trägt.' }
            ],
            seeds: ['Menschen begleiten', 'Schreiben', 'Musik', 'Natur', 'Technik verstehen', 'Gestalten', 'Lehren', 'Reisen', 'Kochen', 'Bewegung', 'Lesen', 'Tüfteln']
        },
        {
            id: 'good', ask: 'Welche Fähigkeit müsstest du aufbauen, um darin richtig gut zu werden – und wie lange dauert das realistisch?', short: 'Können', label: 'Worin du gut bist', icon: '💪', color: '#3b82f6',
            lead: 'Was fällt dir leicht, wofür bewundern dich andere – und was hast du dir über Jahre erarbeitet?',
            prompts: [
                { k: 'talents', l: 'Welche Talente hast du von Natur aus?', h: 'Dinge, die dir ohne große Anstrengung gelingen und bei denen andere staunen.' },
                { k: 'skills', l: 'Welche Fähigkeiten hast du dir angeeignet? Wo hast du echte Expertise?', h: 'Kompetenzen aus Ausbildung, Beruf, Projekten oder jahrelanger Übung.' },
                { k: 'strengths', l: 'Was macht dich einzigartig? Welche Kombination hat kaum jemand sonst?', h: 'Oft liegt die Stärke in der Kombination: z. B. Technikverständnis + Empathie.' },
                { k: 'asked', l: 'Wofür bitten dich andere um Hilfe oder Rat?', h: 'Fremdbild als Spiegel: Was trauen dir andere zu, was du selbst für selbstverständlich hältst?' }
            ],
            seeds: ['Zuhören', 'Strukturieren', 'Erklären', 'Analysieren', 'Verhandeln', 'Programmieren', 'Organisieren', 'Moderieren', 'Schreiben', 'Netzwerken', 'Gestalten', 'Ruhe bewahren']
        },
        {
            id: 'world', ask: 'Wem genau nützt das – und wie würdest du den Nutzen in einem Satz beschreiben?', short: 'Welt', label: 'Was die Welt braucht', icon: '🌍', color: '#10b981',
            lead: 'Die Welt kann dein direktes Umfeld sein: Team, Familie, Stadt – oder die Gesellschaft als Ganzes.',
            prompts: [
                { k: 'problems', l: 'Welche Probleme beschäftigen dich am meisten?', h: 'Gesellschaftliche, ökologische, soziale oder ganz konkrete Alltagsprobleme, die dich nicht loslassen.' },
                { k: 'people', l: 'Für wen genau willst du etwas verändern?', h: 'Je konkreter die Zielgruppe, desto greifbarer der Beitrag: „Berufseinsteiger ohne Netzwerk" statt „alle".' },
                { k: 'contribution', l: 'Wie könntest du zur Lösung beitragen?', h: 'Welche Rolle könntest du spielen – nicht die ganze Lösung, sondern dein Teil davon.' },
                { k: 'legacy', l: 'Wie willst du in Erinnerung bleiben?', h: 'Stell dir vor, jemand beschreibt in 30 Jahren, was du bewirkt hast.' }
            ],
            seeds: ['Orientierung geben', 'Bildung', 'Gesundheit', 'Klimaschutz', 'Zugehörigkeit', 'Faire Arbeit', 'Digitale Kompetenz', 'Mentale Gesundheit', 'Brücken bauen', 'Vereinfachen']
        },
        {
            id: 'paid', ask: 'Wer würde dafür zahlen – und was wäre das kleinste bezahlbare Angebot?', short: 'Bezahlung', label: 'Wofür du bezahlt werden kannst', icon: '💰', color: '#f59e0b',
            lead: 'Nicht nur das Gehalt von heute – alles, wofür Menschen oder Organisationen bereit sind zu zahlen.',
            prompts: [
                { k: 'proof', l: 'Wofür hast du schon einmal Geld bekommen – auch kleine Beträge?', h: 'Jobs, Nebenjobs, Honorare, Trinkgeld, verkaufte Dinge. Das sind bewiesene Zahlungsbereitschaften.' },
                { k: 'market', l: 'Wo werden deine Fähigkeiten gebraucht? Wo entsteht Wert?', h: 'Branchen, Rollen, Nischen – auch solche, in denen du noch nicht arbeitest.' },
                { k: 'income', l: 'Welche Einkommensmodelle wären denkbar?', h: 'Anstellung, Freelance, Produkt, Kurs, Beratung, Lizenz – gern mehrere nebeneinander.' },
                { k: 'network', l: 'Wer könnte dich beauftragen, empfehlen oder mit dir zusammenarbeiten?', h: 'Namen, Rollen oder Organisationen. Konkret ist besser als vage.' }
            ],
            seeds: ['Beratung', 'Projektleitung', 'Coaching', 'Software', 'Schulungen', 'Texte', 'Design', 'Vertrieb', 'HR', 'Analyse', 'Handwerk', 'Pflege']
        }
    ],

    INTERSECTIONS: [
        { id: 'passion', label: 'Passion', of: ['love', 'good'], desc: 'Was du liebst und worin du gut bist. Erfüllend – aber ohne Weltbezug und Einkommen bleibt es oft „nur" Hobby.', ask: 'Wem nützt das konkret, und würde jemand dafür zahlen?' },
        { id: 'mission', label: 'Mission', of: ['love', 'world'], desc: 'Was du liebst und was die Welt braucht. Sinnstiftend – aber ohne Können und Einkommen bleibt es Wunsch oder Ehrenamt.', ask: 'Welche Fähigkeit müsstest du aufbauen, und wer würde es bezahlen?' },
        { id: 'vocation', label: 'Berufung', of: ['world', 'paid'], desc: 'Was die Welt braucht und wofür man dich bezahlt. Nützlich und sicher – aber mit der Gefahr innerer Leere.', ask: 'Was daran liebst du wirklich, und wo bist du darin stark?' },
        { id: 'profession', label: 'Profession', of: ['good', 'paid'], desc: 'Worin du gut bist und wofür man dich bezahlt. Komfortabel – aber oft ohne Sinn und Freude.', ask: 'Wem hilft es – und macht es dir noch Freude?' }
    ],

    REFLECT: [
        { k: 'values', l: 'Was sind deine wichtigsten Lebenswerte?', h: 'Was ist dir im Leben wirklich wichtig – unabhängig von Erwartungen anderer?', hints: ['Familie & Beziehungen', 'Beruf & Wirksamkeit', 'Gesundheit', 'Freiheit & Autonomie', 'Kreativität & Ausdruck', 'Sinn & Spiritualität', 'Sicherheit', 'Wachstum & Lernen'] },
        { k: 'experiences', l: 'Welche Erfahrungen haben dich am meisten geprägt?', h: 'Positive wie schwierige. Wendepunkte verraten oft, was dir wichtig ist.', hints: ['Kindheit & Jugend', 'Ausbildung', 'Berufliche Erfolge & Misserfolge', 'Beziehungen', 'Krisen gemeistert', 'Reisen & Kulturen'] },
        { k: 'dreams', l: 'Was sind deine größten Träume – wenn Geld und Meinung anderer keine Rolle spielten?', h: 'Denk groß. Realismus kommt später im Aktionsplan.', hints: ['Beruflich in 10 Jahren', 'Lebensort & Lebensstil', 'Beitrag zur Welt', 'Was du lernen willst', 'Abenteuer'] },
        { k: 'fears', l: 'Was hält dich zurück?', h: 'Ängste zu benennen ist der erste Schritt, sie zu entmachten.', hints: ['Versagensangst', 'Finanzielle Sorgen', 'Erwartungen anderer', 'Angst vor Veränderung', 'Selbstzweifel', 'Zu spät, zu alt, zu früh'] }
    ],

    HORIZONS: [
        { id: 'short', label: 'Nächste 3 Monate', icon: '🌱', hint: 'Klein, konkret, in deiner Hand. Ein Gespräch, ein Test, ein erstes Angebot.' },
        { id: 'mid', label: '6–12 Monate', icon: '🌿', hint: 'Sichtbare Veränderungen: eine Weiterbildung, ein Nebenprojekt, ein Rollenwechsel.' },
        { id: 'long', label: '2–5 Jahre', icon: '🌳', hint: 'Die Richtung. Wo stehst du, wenn du dein Ikigai lebst?' }
    ],

    LINKS: [
        { m: 'VIA-Charakterstärken', l: '../via-strengths/via-strengths.html', for: 'good', why: 'Vertieft „Worin du gut bist" mit einem validierten Test.' },
        { m: 'Werteklärung', l: '../values-clarification/values-clarification.html', for: 'love', why: 'Schärft, was dir wirklich wichtig ist.' },
        { m: 'RAISEC-Interessen', l: '../raisec/index-raisec.html', for: 'paid', why: 'Zeigt Berufsfelder, die zu deinen Interessen passen.' },
        { m: 'SWOT-Analyse', l: '../swot-analysis/swot-analysis.html', for: 'good', why: 'Stärken, Schwächen, Chancen und Risiken strukturiert.' },
        { m: 'Vision Board', l: '../vision-board/vision-board.html', why: 'Macht deine Ikigai-Vision sichtbar.' },
        { m: 'SMART-Ziele', l: '../goal-setting/goal-setting.html', why: 'Übersetzt den Aktionsplan in messbare Ziele.' },
        { m: 'Gewohnheiten aufbauen', l: '../habit-building/habit-building.html', why: 'Verankert erste Schritte im Alltag.' },
        { m: 'How of Happiness', l: '../how-of-happiness/how-of-happiness.html', why: 'Glücksaktivitäten, die zu dir passen.' }
    ]
};
