/**
 * QUICK APPLY - 60 Sekunden Bewerbung
 * ====================================
 * - Nicht angemeldet: Template-Modus mit Beispielsätzen
 * - Angemeldet: GPT-3.5-Turbo mit API-Key aus AWS DynamoDB
 */

// ═══════════════════════════════════════════════════════════════════════════
// QUICK APPLY STATE
// ═══════════════════════════════════════════════════════════════════════════

const QuickApplyState = {
    inputType: 'url',
    jobData: null,
    tone: 'formal',
    length: 'medium',
    isGenerating: false,
    generatedText: '',
    hasProfile: false,
    isLoggedIn: false,
    apiKey: null
};

// ═══════════════════════════════════════════════════════════════════════════
// UMFANGREICHE TEMPLATE-DATENBANK (für nicht-angemeldete Nutzer)
// ═══════════════════════════════════════════════════════════════════════════

const CoverLetterTemplates = {
    // ═══════════════════════════════════════════════════════════════════════════
    // ERÖFFNUNGSSÄTZE - Nach Tonalität (formal, modern, kreativ)
    // ═══════════════════════════════════════════════════════════════════════════
    openings: {
        formal: [
            "mit großem Interesse habe ich Ihre Stellenausschreibung für die Position als {{position}} bei {{company}} gelesen.",
            "auf Ihre Ausschreibung für die Position {{position}} bei {{company}} möchte ich mich hiermit bewerben.",
            "Ihre Stellenanzeige für {{position}} hat mein besonderes Interesse geweckt, da sie genau meinem Profil entspricht.",
            "bezugnehmend auf Ihre Stellenausschreibung für {{position}} bewerbe ich mich hiermit bei Ihrem Unternehmen.",
            "mit Begeisterung habe ich festgestellt, dass Sie aktuell einen {{position}} suchen.",
            "Ihre Ausschreibung für die Position {{position}} spricht mich besonders an, da ich hier meine Stärken optimal einbringen kann.",
            "auf der Suche nach einer neuen beruflichen Herausforderung bin ich auf Ihre Stellenausschreibung für {{position}} aufmerksam geworden.",
            "mit großer Motivation bewerbe ich mich für die Position {{position}} in Ihrem Unternehmen.",
            "Ihre Stellenanzeige für die Position {{position}} entspricht exakt meinen beruflichen Vorstellungen.",
            "hiermit möchte ich mein aufrichtiges Interesse an der ausgeschriebenen Position als {{position}} bekunden.",
            "die ausgeschriebene Stelle als {{position}} bei {{company}} hat mein Interesse geweckt.",
            "Ihre Vakanz im Bereich {{position}} reizt mich sehr, weshalb ich mich hiermit bewerbe."
        ],
        modern: [
            "als ich Ihre Stellenanzeige für {{position}} bei {{company}} entdeckte, wusste ich sofort: Das ist genau das, wonach ich suche!",
            "die Position als {{position}} bei {{company}} hat mich sofort begeistert – hier möchte ich meine Karriere fortsetzen.",
            "{{company}} und ich – das könnte der perfekte Match werden! Ihre Ausschreibung für {{position}} spricht mich auf ganzer Linie an.",
            "Ihre Stellenausschreibung für {{position}} hat mich nicht nur interessiert, sondern richtig inspiriert.",
            "als {{position}}-Position bei einem innovativen Unternehmen wie {{company}}? Da musste ich mich einfach bewerben!",
            "ich möchte Teil von {{company}} werden! Die Position als {{position}} passt perfekt zu meinen Zielen.",
            "wow, {{position}} bei {{company}}? Das klingt nach genau dem, was ich gesucht habe!",
            "ich habe Ihre Stellenanzeige gesehen und gedacht: Das ist meine Chance bei {{company}}!",
            "die Position {{position}} bei {{company}} ist wie für mich gemacht – deshalb bewerbe ich mich jetzt.",
            "{{company}} steht auf meiner Wunschliste ganz oben – und {{position}} ist die perfekte Rolle für mich.",
            "ich bin begeistert von der Möglichkeit, als {{position}} bei {{company}} zu arbeiten.",
            "Ihre Stellenanzeige hat bei mir sofort Klick gemacht – {{position}} ist genau mein Ding!"
        ],
        creative: [
            "stellen Sie sich vor: Ein {{position}}, der nicht nur Aufgaben erledigt, sondern echte Lösungen schafft. Das bin ich!",
            "was wäre, wenn Ihr neuer {{position}} genau die Person ist, die Sie noch nicht kannten, aber immer gesucht haben?",
            "drei Dinge, die mich auszeichnen: Leidenschaft, Expertise und der Wunsch, bei {{company}} als {{position}} durchzustarten.",
            "ich habe aufgehört zu träumen und angefangen zu handeln – deshalb bewerbe ich mich als {{position}} bei {{company}}.",
            "zwischen den Zeilen Ihrer Stellenanzeige habe ich gelesen: Sie suchen jemanden, der wirklich etwas bewegen will.",
            "mein nächstes Kapitel soll bei {{company}} geschrieben werden – und zwar als Ihr neuer {{position}}.",
            "manchmal weiß man einfach, dass etwas passt – so ging es mir bei Ihrer Anzeige für {{position}}.",
            "Sie suchen einen {{position}}? Ich suche eine Herausforderung. Treffen wir uns in der Mitte?",
            "bevor Sie weiterscrollen: Ich bin genau der {{position}}, der {{company}} noch gefehlt hat.",
            "spoiler: Am Ende dieser Bewerbung werden Sie mich zum Gespräch einladen wollen.",
            "ich habe Ihre Stellenanzeige dreimal gelesen – und jedes Mal wurde ich überzeugter, dass ich perfekt passe.",
            "andere bewerben sich. Ich überzeuge. Starten wir?"
        ]
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // QUALIFIKATIONEN & STÄRKEN
    // ═══════════════════════════════════════════════════════════════════════════
    qualifications: {
        experience: [
            "In meiner {{experience}}-jährigen Berufserfahrung konnte ich umfangreiche Kompetenzen in {{skills}} aufbauen.",
            "Meine bisherige Tätigkeit hat mir ermöglicht, fundierte Kenntnisse in {{skills}} zu entwickeln.",
            "Als erfahrene Fachkraft mit {{experience}} Jahren Berufserfahrung bringe ich solide Expertise in {{skills}} mit.",
            "Während meiner {{experience}}-jährigen Laufbahn habe ich mich auf {{skills}} spezialisiert.",
            "Mit {{experience}} Jahren Erfahrung in der Branche verfüge ich über praxiserprobte Fähigkeiten in {{skills}}.",
            "Meine berufliche Entwicklung über {{experience}} Jahre hat mich zu einem Experten in {{skills}} gemacht.",
            "In {{experience}} Jahren Berufstätigkeit habe ich tiefgreifende Kenntnisse in {{skills}} erworben.",
            "Meine {{experience}}-jährige Karriere hat mir ermöglicht, mich kontinuierlich in {{skills}} weiterzubilden.",
            "Die vergangenen {{experience}} Jahre haben mir intensive Praxiserfahrung in {{skills}} gebracht.",
            "Durch {{experience}} Jahre fokussierte Arbeit verfüge ich über ausgeprägte Kompetenzen in {{skills}}."
        ],
        skills: [
            "Zu meinen Kernkompetenzen zählen {{skills}}, die ich erfolgreich in verschiedenen Projekten eingesetzt habe.",
            "Besonders stark bin ich in {{skills}} – Fähigkeiten, die für diese Position essentiell sind.",
            "Meine Stärken in {{skills}} ermöglichen es mir, komplexe Herausforderungen effizient zu lösen.",
            "{{skills}} sind nicht nur Fähigkeiten für mich, sondern meine Leidenschaft.",
            "Ich bringe fundierte Kenntnisse in {{skills}} mit, die ich kontinuierlich weiterentwickle.",
            "Mein Profil zeichnet sich besonders durch Expertise in {{skills}} aus.",
            "Mit meinen Kompetenzen in {{skills}} kann ich sofort einen Beitrag leisten.",
            "Meine Spezialisierung auf {{skills}} macht mich zu einem idealen Kandidaten.",
            "Dank meiner Fähigkeiten in {{skills}} konnte ich bereits viele Projekte erfolgreich umsetzen.",
            "{{skills}} gehören zu meinen absoluten Stärken, die ich gerne bei Ihnen einbringe."
        ],
        achievements: [
            "Ein besonderer Erfolg war die Steigerung der Team-Effizienz um 30% durch Prozessoptimierung.",
            "Ich konnte in meiner letzten Position maßgeblich zur Kostensenkung von 25% beitragen.",
            "Unter meiner Leitung wurde ein Projekt drei Wochen vor dem geplanten Termin erfolgreich abgeschlossen.",
            "Ich habe erfolgreich ein Team von fünf Mitarbeitern aufgebaut und entwickelt.",
            "Durch meine Initiative wurde ein neuer Arbeitsbereich etabliert, der heute zum Kerngeschäft gehört.",
            "Meine Strategie führte zu einer Umsatzsteigerung von 40% innerhalb eines Jahres.",
            "Ich habe die Kundenzufriedenheit um 35% gesteigert durch Verbesserung der Serviceprozesse.",
            "Ein von mir implementiertes System führte zu einer Reduktion der Bearbeitungszeit um 50%.",
            "Ich konnte die Fehlerquote im Projekt um 60% reduzieren durch systematische Qualitätssicherung.",
            "Mein Vorschlag zur Prozessoptimierung wurde unternehmensweit übernommen und sparte jährlich 100.000€.",
            "Ich habe erfolgreich fünf Großprojekte mit einem Gesamtvolumen von über 2 Millionen Euro geleitet.",
            "Die von mir entwickelte Lösung wird heute von über 200 Mitarbeitern täglich genutzt.",
            "Ich wurde zweimal für meine außerordentlichen Leistungen mit dem Mitarbeiter-des-Jahres-Preis ausgezeichnet.",
            "Mein Team erreichte unter meiner Führung die höchste Produktivität in der Abteilungsgeschichte."
        ],
        softSkills: [
            "Ich zeichne mich durch eine strukturierte und lösungsorientierte Arbeitsweise aus.",
            "Meine Kommunikationsstärke ermöglicht es mir, auch komplexe Sachverhalte verständlich zu vermitteln.",
            "Als Teamplayer schätze ich den kollegialen Austausch und arbeite gerne an gemeinsamen Zielen.",
            "Flexibilität und Anpassungsfähigkeit zählen zu meinen besonderen Stärken.",
            "Ich bin bekannt für meine zuverlässige und eigenverantwortliche Arbeitsweise.",
            "Meine ausgeprägte analytische Denkweise hilft mir, Probleme schnell zu identifizieren und zu lösen.",
            "Ich bringe eine hohe Selbstmotivation und Eigeninitiative mit.",
            "Mein diplomatisches Geschick macht mich zu einem geschätzten Vermittler in schwierigen Situationen.",
            "Ich arbeite strukturiert, priorisiere effektiv und behalte auch in hektischen Phasen den Überblick.",
            "Meine interkulturelle Kompetenz ermöglicht mir eine erfolgreiche Zusammenarbeit mit internationalen Teams."
        ]
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // MOTIVATION - Warum dieses Unternehmen?
    // ═══════════════════════════════════════════════════════════════════════════
    motivation: {
        general: [
            "{{company}} als innovatives Unternehmen in der Branche reizt mich besonders.",
            "Die Möglichkeit, bei {{company}} zu arbeiten, entspricht genau meinen Karrierezielen.",
            "Ihr Unternehmen steht für Qualität und Innovation – Werte, die ich teile.",
            "Die Unternehmenskultur bei {{company}} und die spannenden Projekte haben mich überzeugt.",
            "Bei {{company}} sehe ich die perfekte Möglichkeit, meine Fähigkeiten einzusetzen und weiterzuentwickeln.",
            "Die Herausforderungen dieser Position und das Umfeld bei {{company}} motivieren mich sehr.",
            "Der gute Ruf von {{company}} als Arbeitgeber hat mein Interesse geweckt.",
            "Die Wachstumsstrategie von {{company}} begeistert mich und ich möchte Teil dieser Entwicklung sein.",
            "{{company}} steht für Werte wie Nachhaltigkeit und Innovation, die mir persönlich wichtig sind.",
            "Die Möglichkeit, in einem dynamischen Umfeld wie bei {{company}} zu arbeiten, reizt mich besonders.",
            "Ich schätze den Fokus von {{company}} auf Mitarbeiterentwicklung und kontinuierliches Lernen.",
            "Die Position bietet mir die Chance, meine Expertise einzubringen und gleichzeitig zu wachsen."
        ],
        custom: [
            "{{motivation}}",
            "Was mich besonders anspricht: {{motivation}}",
            "Meine persönliche Motivation für diese Stelle: {{motivation}}",
            "{{motivation}} – das ist der Grund, warum ich mich bei Ihnen bewerbe."
        ]
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // MEHRWERT - Was bringe ich mit?
    // ═══════════════════════════════════════════════════════════════════════════
    value: {
        formal: [
            "Mit meiner Expertise werde ich einen wertvollen Beitrag zu Ihrem Team leisten.",
            "Ich bin überzeugt, dass ich mit meinen Fähigkeiten Ihr Unternehmen bereichern kann.",
            "Meine Erfahrung wird es mir ermöglichen, schnell produktiv zu werden und Mehrwert zu schaffen.",
            "Ich bringe nicht nur Fachwissen mit, sondern auch die Motivation, Ihr Team voranzubringen.",
            "Mit meinem Engagement und meiner Expertise werde ich Ihre Erwartungen übertreffen.",
            "Ich bin zuversichtlich, dass ich die Anforderungen dieser Position nicht nur erfülle, sondern übertreffen werde.",
            "Mein Ziel ist es, vom ersten Tag an einen messbaren Beitrag zu leisten.",
            "Ich werde mich mit vollem Einsatz für den Erfolg Ihres Unternehmens einsetzen.",
            "Mit meiner Erfahrung kann ich dazu beitragen, Ihre Unternehmensziele zu erreichen."
        ],
        modern: [
            "Ich bin ready, bei {{company}} durchzustarten und echte Ergebnisse zu liefern!",
            "Lassen Sie uns gemeinsam Großes erreichen – ich bin bereit!",
            "Ich will nicht nur mitarbeiten, sondern aktiv zum Erfolg von {{company}} beitragen.",
            "Mit mir bekommen Sie nicht nur einen Mitarbeiter, sondern einen echten Teamplayer.",
            "Ich bin hungrig auf neue Herausforderungen und bereit, mein Bestes zu geben.",
            "Ich brenne darauf, meine Fähigkeiten in die Praxis umzusetzen und etwas zu bewegen.",
            "Gemeinsam mit Ihrem Team werde ich dafür sorgen, dass wir unsere Ziele erreichen.",
            "Ich bringe frische Perspektiven mit und freue mich auf den Austausch mit Ihrem Team.",
            "Mit meiner Energie und meinem Know-how werde ich einen echten Unterschied machen."
        ],
        creative: [
            "Stellen Sie mich ein – und Sie werden sich fragen, wie Sie je ohne mich ausgekommen sind!",
            "Ich verspreche Ihnen: Langeweile wird es mit mir nicht geben.",
            "Mein Ziel? {{company}} noch besser machen. Meine Methode? Engagement, Kreativität und harte Arbeit.",
            "Ich bin die fehlende Zutat in Ihrem Erfolgsrezept – probieren Sie es aus!",
            "Was ich mitbringe? 100% Einsatz, frische Ideen und die Bereitschaft, zu lernen und zu wachsen.",
            "Ich bin nicht hier, um einen Job zu haben – ich bin hier, um einen Unterschied zu machen.",
            "Meine Devise: Nicht labern, sondern liefern. Das werden Sie schnell merken.",
            "Ich werde nicht einfach meine Arbeit machen – ich werde sie herausragend machen.",
            "Sie suchen jemanden, der mitdenkt? Ich denke voraus."
        ]
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // ÜBERGANGSSÄTZE - Verbindungen zwischen Abschnitten
    // ═══════════════════════════════════════════════════════════════════════════
    transitions: {
        toQualifications: [
            "Lassen Sie mich kurz meine relevanten Qualifikationen erläutern:",
            "Folgende Kompetenzen bringe ich für diese Position mit:",
            "Was mich für diese Position qualifiziert:",
            "Mein fachlicher Hintergrund in Kürze:"
        ],
        toMotivation: [
            "Was mich an dieser Position besonders reizt:",
            "Warum ich mich für {{company}} entschieden habe:",
            "Die Gründe für meine Bewerbung bei Ihnen:",
            "{{company}} hat mich aus mehreren Gründen überzeugt:"
        ],
        toClosing: [
            "Zusammenfassend lässt sich sagen:",
            "Ich bin überzeugt, dass ich die richtige Wahl für Sie bin.",
            "Abschließend möchte ich betonen:",
            "Ich freue mich darauf, Sie kennenzulernen."
        ]
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // ABSCHLUSSSÄTZE
    // ═══════════════════════════════════════════════════════════════════════════
    closings: {
        formal: [
            "Über die Einladung zu einem persönlichen Gespräch würde ich mich sehr freuen.",
            "Gerne überzeuge ich Sie in einem persönlichen Gespräch von meinen Qualifikationen.",
            "Ich freue mich auf die Möglichkeit, meine Motivation in einem Gespräch zu vertiefen.",
            "Für ein persönliches Kennenlernen stehe ich Ihnen jederzeit gerne zur Verfügung.",
            "Ich würde mich freuen, meine Eignung für diese Position in einem Gespräch unter Beweis zu stellen.",
            "Über die Möglichkeit, mich persönlich bei Ihnen vorstellen zu dürfen, würde ich mich sehr freuen.",
            "Ich bin gespannt auf Ihre Rückmeldung und ein mögliches persönliches Gespräch.",
            "Gerne erläutere ich Ihnen meine Qualifikationen in einem persönlichen Gespräch näher.",
            "Für Rückfragen stehe ich Ihnen jederzeit zur Verfügung und freue mich auf Ihre Kontaktaufnahme."
        ],
        modern: [
            "Lassen Sie uns telefonieren! Ich freue mich auf den Austausch.",
            "Ich bin gespannt auf Ihre Rückmeldung und ein erstes Kennenlernen!",
            "Wann können wir uns treffen? Ich bin flexibel und freue mich auf das Gespräch!",
            "Neugierig geworden? Dann lassen Sie uns sprechen!",
            "Ich freue mich darauf, Sie persönlich von mir zu überzeugen!",
            "Lassen Sie uns bei einem Kaffee über die Details sprechen!",
            "Ich bin bereit für den nächsten Schritt – Sie auch?",
            "Melden Sie sich gerne – ich antworte schnell!",
            "Ich freue mich auf unser Gespräch und die Chance, Sie kennenzulernen!"
        ],
        creative: [
            "Der Ball liegt jetzt bei Ihnen – ich bin bereit für den nächsten Schritt!",
            "Ein Kaffee, ein Gespräch, eine Chance – mehr brauche ich nicht, um Sie zu überzeugen.",
            "Meine Bewerbung ist der erste Schritt. Das Gespräch der zweite. Wann starten wir?",
            "Ich habe Ihnen geschrieben. Jetzt sind Sie dran. Ich warte auf Ihren Anruf!",
            "Das war mein Pitch. Jetzt würde ich gerne Ihre Fragen beantworten – persönlich.",
            "Ich bin nur einen Anruf entfernt – nutzen Sie die Chance!",
            "Cliffhanger: Was passiert als nächstes? Das entscheiden Sie. Rufen Sie an!",
            "Fortsetzung folgt... hoffentlich in Ihrem Büro beim Vorstellungsgespräch.",
            "P.S.: Ich bin auch per WhatsApp erreichbar, wenn es schnell gehen muss."
        ]
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // GRUSSFORMELN
    // ═══════════════════════════════════════════════════════════════════════════
    greetings: {
        formal: [
            "Mit freundlichen Grüßen",
            "Hochachtungsvoll",
            "Mit besten Grüßen",
            "Mit verbindlichen Grüßen",
            "Mit den besten Empfehlungen"
        ],
        modern: [
            "Beste Grüße",
            "Herzliche Grüße",
            "Viele Grüße",
            "Sonnige Grüße",
            "Liebe Grüße"
        ],
        creative: [
            "Bis bald!",
            "Auf ein baldiges Kennenlernen!",
            "Freundliche Grüße",
            "Gespannt auf Ihre Antwort,",
            "Voller Vorfreude,"
        ]
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // ANREDEN
    // ═══════════════════════════════════════════════════════════════════════════
    salutations: {
        formal: [
            "Sehr geehrte Damen und Herren,",
            "Sehr geehrte Personalverantwortliche,",
            "Sehr geehrtes Recruiting-Team,",
            "Sehr geehrte Personalleitung,"
        ],
        modern: [
            "Guten Tag,",
            "Hallo zusammen,",
            "Liebes HR-Team,",
            "Liebes Recruiting-Team,"
        ],
        creative: [
            "Liebe Personalabteilung,",
            "Hallo Team von {{company}},",
            "Liebes {{company}}-Team,",
            "Hi, liebes Recruiting!"
        ]
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // BRANCHENSPEZIFISCHE SÄTZE
    // ═══════════════════════════════════════════════════════════════════════════
    industrySpecific: {
        tech: [
            "Mit meiner Erfahrung in agilen Entwicklungsmethoden wie Scrum und Kanban bin ich bestens auf moderne Arbeitsweisen vorbereitet.",
            "Ich halte mich stets über die neuesten Technologietrends auf dem Laufenden und bilde mich kontinuierlich weiter.",
            "Die digitale Transformation begeistert mich und ich bringe die nötigen Skills mit, um sie aktiv mitzugestalten.",
            "Clean Code, Code Reviews und CI/CD sind für mich selbstverständliche Bestandteile professioneller Softwareentwicklung."
        ],
        marketing: [
            "Datengetriebenes Marketing ist meine Stärke – ich verstehe es, KPIs zu analysieren und Kampagnen kontinuierlich zu optimieren.",
            "Mit meiner Erfahrung in SEO, SEA und Social Media Marketing kann ich Ihre Online-Präsenz nachhaltig stärken.",
            "Ich denke kreativ und strategisch zugleich – die perfekte Kombination für erfolgreiches Marketing.",
            "Content-Erstellung, Kampagnen-Management und Performance-Analyse gehören zu meinen täglichen Aufgaben."
        ],
        sales: [
            "Mein Fokus liegt auf dem Aufbau langfristiger Kundenbeziehungen, nicht nur auf kurzfristigen Abschlüssen.",
            "Ich bringe ein überzeugendes Verkaufstalent und ausgeprägte Verhandlungskompetenz mit.",
            "Kundenbedürfnisse zu verstehen und passgenaue Lösungen anzubieten ist meine Leidenschaft.",
            "Ich bin zielorientiert und habe meine Vertriebsziele in den letzten Jahren stets übertroffen."
        ],
        healthcare: [
            "Die Gesundheit und das Wohlbefinden von Menschen liegt mir sehr am Herzen.",
            "Mit meiner Empathie und fachlichen Kompetenz kann ich Patienten bestmöglich betreuen.",
            "Qualitätsmanagement und Hygienestandards sind für mich selbstverständliche Bestandteile meiner Arbeit.",
            "Ich bringe Erfahrung in der interdisziplinären Zusammenarbeit im Gesundheitswesen mit."
        ],
        finance: [
            "Analytisches Denken und ein ausgeprägtes Zahlenverständnis zeichnen meine Arbeitsweise aus.",
            "Ich bin versiert im Umgang mit komplexen Finanzmodellen und regulatorischen Anforderungen.",
            "Präzision und Sorgfalt sind in meiner Arbeit mit Finanzdaten selbstverständlich.",
            "Ich verbinde fundiertes Fachwissen mit dem Blick für unternehmerische Zusammenhänge."
        ]
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // KARRIEREWECHSEL & BERUFSEINSTIEG
    // ═══════════════════════════════════════════════════════════════════════════
    careerChange: [
        "Obwohl ich aus einer anderen Branche komme, bin ich überzeugt, dass meine transferierbaren Fähigkeiten einen echten Mehrwert bieten.",
        "Mein branchenübergreifender Hintergrund ermöglicht mir frische Perspektiven und innovative Ansätze.",
        "Ich sehe meinen Quereinstieg als Bereicherung – ich bringe neue Impulse und bewährte Methoden mit.",
        "Die Fähigkeiten, die ich in meiner bisherigen Karriere entwickelt habe, sind direkt auf diese Position übertragbar."
    ],
    
    freshGraduate: [
        "Als engagierter Absolvent bringe ich frisches Wissen und hohe Lernbereitschaft mit.",
        "Durch Praktika und Projektarbeiten habe ich bereits wertvolle praktische Erfahrungen gesammelt.",
        "Was mir an Erfahrung fehlt, mache ich durch Motivation, Lernbereitschaft und moderne Methoden wett.",
        "Ich bin hochmotiviert, meine theoretischen Kenntnisse in die Praxis umzusetzen."
    ],

    // ═══════════════════════════════════════════════════════════════════════════
    // GEHALTSVORSTELLUNG & EINTRITTSDATUM
    // ═══════════════════════════════════════════════════════════════════════════
    availability: [
        "Ich stehe Ihnen ab sofort zur Verfügung.",
        "Meine Kündigungsfrist beträgt drei Monate, sodass ich zum nächstmöglichen Termin bei Ihnen starten könnte.",
        "Nach Absprache kann ich kurzfristig beginnen.",
        "Ich bin ab dem [Datum] uneingeschränkt verfügbar und freue mich auf einen zeitnahen Start."
    ],

    salary: [
        "Meine Gehaltsvorstellung liegt bei [Betrag] Euro brutto jährlich.",
        "Bezüglich meiner Gehaltsvorstellung orientiere ich mich am branchenüblichen Niveau.",
        "Über die Vergütung spreche ich gerne persönlich mit Ihnen.",
        "Meine Gehaltsvorstellung bespreche ich gerne im persönlichen Gespräch."
    ]
};

// ═══════════════════════════════════════════════════════════════════════════
// INITIALIZATION
// ═══════════════════════════════════════════════════════════════════════════

async function initQuickApply() {
    console.log('⚡ Initializing Quick Apply...');
    
    // Check login status first
    await checkLoginStatus();
    
    // Check if profile exists
    checkProfileStatus();
    
    // Zeige Profilformular immer an (wird für Template-Generierung benötigt)
    const quickStep2 = document.getElementById('quickStep2');
    if (quickStep2) {
        quickStep2.classList.remove('hidden');
        console.log('📝 Quick Profile Form angezeigt');
    }
    
    // Setup event listeners
    setupQuickApplyListeners();
    
    // Update UI based on login status
    updateAPIStatusDisplay();
    
    // Initial Button-Status prüfen
    updateGenerateButtonState();
    
    console.log('✅ Quick Apply ready - Logged in:', QuickApplyState.isLoggedIn);
}

/**
 * Prüft Login-Status und lädt API-Key aus AWS wenn angemeldet
 */
async function checkLoginStatus() {
    console.log('🔍 Prüfe Login-Status...');
    
    // Warte kurz auf Auth-System Initialisierung
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Prüfe ob Nutzer angemeldet ist - Unterstütze beide Auth-Systeme
    const auth = window.awsAuth || window.realUserAuth;
    
    if (auth) {
        try {
            // Prüfe verschiedene isLoggedIn Methoden
            if (typeof auth.isLoggedIn === 'function') {
                QuickApplyState.isLoggedIn = auth.isLoggedIn();
            } else if (typeof auth.isAuthenticated === 'function') {
                QuickApplyState.isLoggedIn = auth.isAuthenticated();
            } else if (auth.currentUser || auth.user) {
                QuickApplyState.isLoggedIn = !!(auth.currentUser || auth.user);
            }
            
            console.log('📊 Auth Status:', QuickApplyState.isLoggedIn ? 'angemeldet' : 'nicht angemeldet');
            
            if (QuickApplyState.isLoggedIn) {
                console.log('✅ Nutzer ist angemeldet, lade API-Key aus AWS...');
                await loadAPIKeyFromAWS();
                console.log('🔑 API-Key Status:', QuickApplyState.apiKey ? 'vorhanden' : 'nicht vorhanden');
            }
        } catch (error) {
            console.warn('⚠️ Auth-Check fehlgeschlagen:', error);
            QuickApplyState.isLoggedIn = false;
        }
    } else {
        console.log('ℹ️ Kein Auth-System verfügbar - warte...');
        QuickApplyState.isLoggedIn = false;
        
        // Versuche nochmals nach 1 Sekunde
        setTimeout(async () => {
            const authDelayed = window.awsAuth || window.realUserAuth;
            if (authDelayed && typeof authDelayed.isLoggedIn === 'function') {
                QuickApplyState.isLoggedIn = authDelayed.isLoggedIn();
                if (QuickApplyState.isLoggedIn) {
                    console.log('✅ Verzögerter Auth-Check: Nutzer ist angemeldet');
                    await loadAPIKeyFromAWS();
                    updateAPIStatusDisplay();
                }
            }
        }, 1000);
    }
}

/**
 * Erneut Login-Status prüfen (für nach dem Einloggen)
 */
async function recheckLoginStatus() {
    console.log('🔄 Erneute Login-Prüfung...');
    await checkLoginStatus();
    updateAPIStatusDisplay();
}

// Auf Auth-State-Changes hören
window.addEventListener('authStateChanged', recheckLoginStatus);
window.addEventListener('userLoggedIn', recheckLoginStatus);

/**
 * Lädt den Admin-API-Key aus AWS DynamoDB
 */
async function loadAPIKeyFromAWS() {
    try {
        if (!window.awsProfileAPI) {
            console.warn('⚠️ awsProfileAPI nicht verfügbar');
            return null;
        }

        // Warte auf Initialisierung
        if (!window.awsProfileAPI.isInitialized) {
            await new Promise((resolve, reject) => {
                const timeout = setTimeout(() => reject(new Error('Timeout')), 5000);
                const check = setInterval(() => {
                    if (window.awsProfileAPI.isInitialized) {
                        clearInterval(check);
                        clearTimeout(timeout);
                        resolve();
                    }
                }, 100);
            });
        }

        // Lade Admin-Konfiguration
        const adminProfile = await window.awsProfileAPI.loadProfile('admin').catch(() => null);
        
        if (adminProfile?.apiKeys?.openai?.apiKey) {
            const key = adminProfile.apiKeys.openai.apiKey;
            if (key && key.startsWith('sk-')) {
                QuickApplyState.apiKey = key;
                console.log('✅ API-Key aus AWS geladen');
                return key;
            }
        }
        
        console.log('ℹ️ Kein API-Key in AWS gefunden');
        return null;
    } catch (error) {
        console.warn('⚠️ Fehler beim Laden des API-Keys aus AWS:', error);
        return null;
    }
}

/**
 * Zeigt den Status an (Template-Modus vs GPT-3.5-Turbo)
 */
function updateAPIStatusDisplay() {
    const statusText = document.getElementById('apiStatusText');
    const generationInfo = document.getElementById('generationInfo');
    const apiHint = document.getElementById('apiHint');
    
    if (!statusText || !generationInfo) return;

    if (QuickApplyState.isLoggedIn && QuickApplyState.apiKey) {
        // Angemeldet MIT API-Key
        statusText.innerHTML = '<i class="fas fa-robot"></i> GPT-3.5-Turbo • KI-generierte Anschreiben';
        generationInfo.classList.add('has-api');
        generationInfo.classList.remove('no-api');
        if (apiHint) apiHint.classList.add('hidden');
    } else if (QuickApplyState.isLoggedIn) {
        // Angemeldet OHNE API-Key
        statusText.innerHTML = '<i class="fas fa-file-alt"></i> Template-Modus • Melden Sie sich ab und wieder an';
        generationInfo.classList.add('no-api');
        generationInfo.classList.remove('has-api');
        if (apiHint) {
            apiHint.classList.remove('hidden');
            apiHint.innerHTML = `
                <i class="fas fa-info-circle"></i>
                <div>
                    <strong>API-Key nicht gefunden</strong> - 
                    <a href="/admin.html#api-keys" target="_blank">Im Admin Panel konfigurieren</a>
                </div>
            `;
        }
    } else {
        // Nicht angemeldet - Template-Modus
        statusText.innerHTML = '<i class="fas fa-magic"></i> Smart-Template • Anmelden für KI-Generierung';
        generationInfo.classList.add('no-api');
        generationInfo.classList.remove('has-api');
        if (apiHint) {
            apiHint.classList.remove('hidden');
            apiHint.innerHTML = `
                <i class="fas fa-user-plus"></i>
                <div>
                    <strong>Kostenlos testen!</strong> - 
                    <a href="#" onclick="showLoginModal(); return false;">Anmelden für GPT-3.5-Turbo</a>
                </div>
            `;
        }
    }
}

function showLoginModal() {
    // Verwende unified auth system
    if (window.authModals?.showLogin) {
        window.authModals.showLogin();
    } else if (window.realUserAuth?.showLoginModal) {
        window.realUserAuth.showLoginModal();
    } else {
        // Fallback: Auth-Button klicken
        const authBtn = document.getElementById('authButton') || document.getElementById('mobileAuthButton');
        if (authBtn) authBtn.click();
    }
}

function checkProfileStatus() {
    const profile = window.DashboardState?.profile || {};
    QuickApplyState.hasProfile = !!(
        profile.firstName && 
        profile.skills && 
        profile.skills.length > 0
    );
}

function setupQuickApplyListeners() {
    const urlInput = document.getElementById('jobUrl');
    if (urlInput) {
        urlInput.addEventListener('input', handleUrlInput);
        urlInput.addEventListener('paste', handleUrlPaste);
    }
    
    const textInput = document.getElementById('jobText');
    if (textInput) {
        textInput.addEventListener('input', handleTextInput);
    }
    
    // Event-Listener für Profilfelder (aktualisiert Button-Status)
    const profileFields = ['quickName', 'quickExperience', 'quickSkills'];
    profileFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.addEventListener('input', updateGenerateButtonState);
            field.addEventListener('change', updateGenerateButtonState);
        }
    });
}

// ═══════════════════════════════════════════════════════════════════════════
// INPUT TYPE TOGGLE
// ═══════════════════════════════════════════════════════════════════════════

function toggleInputType(type) {
    QuickApplyState.inputType = type;
    
    // Unterstütze beide möglichen ID-Formate
    const urlGroup = document.getElementById('inputUrl') || document.getElementById('urlInputGroup');
    const textGroup = document.getElementById('inputText') || document.getElementById('textInputGroup');
    const urlBtn = document.querySelector('[data-input="url"]') || document.querySelector('[onclick*="toggleInputType(\'url\')"]');
    const textBtn = document.querySelector('[data-input="text"]') || document.querySelector('[onclick*="toggleInputType(\'text\')"]');
    
    if (type === 'url') {
        urlGroup?.classList.remove('hidden');
        textGroup?.classList.add('hidden');
        urlBtn?.classList.add('active');
        textBtn?.classList.remove('active');
    } else {
        urlGroup?.classList.add('hidden');
        textGroup?.classList.remove('hidden');
        urlBtn?.classList.remove('active');
        textBtn?.classList.add('active');
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// URL & TEXT HANDLERS
// ═══════════════════════════════════════════════════════════════════════════

function handleUrlInput(e) {
    const url = e.target?.value?.trim() || '';
    // Suche den Button mit beiden möglichen IDs
    const analyzeBtn = document.getElementById('parseUrlBtn') || document.getElementById('analyzeUrlBtn');
    
    if (analyzeBtn) {
        const isValid = isValidJobUrl(url);
        analyzeBtn.disabled = !isValid;
    }
}

function handleUrlPaste(e) {
    setTimeout(() => {
        handleUrlInput({ target: e.target });
    }, 100);
}

function handleTextInput(e) {
    // Unterstütze sowohl Event-Parameter als auch direkten Aufruf
    const textInput = e?.target || document.getElementById('jobText');
    const text = textInput?.value || '';
    const trimmedText = text.trim();
    
    // Zeichenzähler aktualisieren
    const charCount = document.getElementById('charCount');
    if (charCount) {
        charCount.textContent = text.length;
    }
    
    updateGenerateButtonState();
    
    if (trimmedText.length > 100) {
        extractJobInfoFromText(trimmedText);
    }
}

function isValidJobUrl(url) {
    if (!url) return false;
    try {
        const parsed = new URL(url);
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
        return false;
    }
}

function updateGenerateButtonState() {
    const generateBtn = document.getElementById('generateBtn');
    if (!generateBtn) return;
    
    const nameInput = document.getElementById('quickName');
    const experienceSelect = document.getElementById('quickExperience');
    const skillsInput = document.getElementById('quickSkills');
    
    const hasName = nameInput?.value.trim().length > 0;
    const hasExperience = experienceSelect?.value !== '';
    const hasSkills = skillsInput?.value.trim().length > 0;
    const hasJobData = QuickApplyState.jobData !== null || 
                       document.getElementById('jobText')?.value.trim().length > 100;
    
    generateBtn.disabled = !(hasName && hasExperience && hasSkills);
}

// ═══════════════════════════════════════════════════════════════════════════
// JOB ANALYSIS
// ═══════════════════════════════════════════════════════════════════════════

async function analyzeJobUrl() {
    const urlInput = document.getElementById('jobUrl');
    const url = urlInput?.value.trim();
    
    if (!url || !isValidJobUrl(url)) {
        quickApplyShowToast('Bitte geben Sie eine gültige URL ein', 'error');
        return;
    }
    
    // Suche den Button mit beiden möglichen IDs
    const analyzeBtn = document.getElementById('parseUrlBtn') || document.getElementById('analyzeUrlBtn');
    const originalText = analyzeBtn?.innerHTML;
    
    if (analyzeBtn) {
        analyzeBtn.disabled = true;
        analyzeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analysiere...';
    }
    
    try {
        const response = await fetch('/.netlify/functions/job-parser', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ input: url, inputType: 'url' })
        });
        
        if (!response.ok) throw new Error('Parsing fehlgeschlagen');
        
        const data = await response.json();
        
        if (data.parsedJob) {
            QuickApplyState.jobData = data.parsedJob;
            displayJobData(data.parsedJob);
            quickApplyShowToast('Stellenanzeige analysiert!', 'success');
        }
    } catch (error) {
        console.error('URL parsing failed:', error);
        quickApplyShowToast('Analyse fehlgeschlagen. Bitte Text einfügen.', 'error');
        toggleInputType('text');
    } finally {
        if (analyzeBtn) {
            analyzeBtn.disabled = false;
            analyzeBtn.innerHTML = originalText;
        }
    }
    
    updateGenerateButtonState();
}

// Alias für parseJobUrl (wird im HTML verwendet)
window.parseJobUrl = analyzeJobUrl;

function extractJobInfoFromText(text) {
    const positionPatterns = [
        /(?:Position|Stelle|Job|Jobtitel|Stellenbezeichnung)[:\s]+([^\n,]+)/i,
        /(?:suchen|gesucht)[:\s]+(?:eine?n?\s+)?([^\n,]+)/i,
        /^([A-Z][a-zA-Z\s\/\-]+)\s*\(m\/w\/d\)/m
    ];
    
    const companyPatterns = [
        /(?:Unternehmen|Firma|Arbeitgeber|Company)[:\s]+([^\n,]+)/i,
        /(?:bei|für)\s+(?:der|die|das)?\s*([A-Z][a-zA-Z\s&]+(?:GmbH|AG|SE|UG|KG|Inc|Ltd)?)/
    ];
    
    let position = '';
    let company = '';
    
    for (const pattern of positionPatterns) {
        const match = text.match(pattern);
        if (match) {
            position = match[1].trim();
            break;
        }
    }
    
    for (const pattern of companyPatterns) {
        const match = text.match(pattern);
        if (match) {
            company = match[1].trim();
            break;
        }
    }
    
    if (position || company) {
        QuickApplyState.jobData = {
            title: position || 'die ausgeschriebene Position',
            company: company || 'Ihr Unternehmen',
            description: text.substring(0, 500)
        };
    }
}

function displayJobData(jobData) {
    const container = document.getElementById('jobDataDisplay');
    if (!container) return;
    
    container.innerHTML = `
        <div class="job-data-card">
            <div class="job-data-header">
                <i class="fas fa-briefcase"></i>
                <span>Erkannte Stelleninformationen</span>
            </div>
            <div class="job-data-content">
                <div class="job-data-item">
                    <strong>Position:</strong> ${escapeHtml(jobData.title || 'Nicht erkannt')}
                </div>
                <div class="job-data-item">
                    <strong>Unternehmen:</strong> ${escapeHtml(jobData.company || 'Nicht erkannt')}
                </div>
                ${jobData.location ? `
                <div class="job-data-item">
                    <strong>Standort:</strong> ${escapeHtml(jobData.location)}
                </div>
                ` : ''}
            </div>
        </div>
    `;
    container.classList.remove('hidden');
}

// ═══════════════════════════════════════════════════════════════════════════
// COVER LETTER GENERATION
// ═══════════════════════════════════════════════════════════════════════════

async function generateCoverLetter() {
    if (QuickApplyState.isGenerating) return;
    
    const userData = collectUserData();
    if (!validateUserData(userData)) return;
    
    QuickApplyState.isGenerating = true;
    showGeneratingState();
    
    try {
        let coverLetter;
        
        // Entscheidung: KI oder Template
        if (QuickApplyState.isLoggedIn && QuickApplyState.apiKey) {
            // GPT-3.5-Turbo für angemeldete Nutzer
            coverLetter = await generateWithGPT(userData);
        } else {
            // Template-Modus für nicht-angemeldete Nutzer
            coverLetter = generateFromTemplates(userData);
        }
        
        QuickApplyState.generatedText = coverLetter;
        displayGeneratedLetter(coverLetter);
        
        // In Tracking speichern wenn angemeldet
        if (QuickApplyState.isLoggedIn && window.DashboardState) {
            saveToTracking(userData);
        }
        
        quickApplyShowToast('Anschreiben erstellt!', 'success');
        
    } catch (error) {
        console.error('Generation failed:', error);
        quickApplyShowToast('Fehler bei der Generierung: ' + error.message, 'error');
        
        // Fallback auf Templates bei Fehler
        if (QuickApplyState.isLoggedIn) {
            quickApplyShowToast('Verwende Template als Fallback...', 'info');
            const coverLetter = generateFromTemplates(collectUserData());
            QuickApplyState.generatedText = coverLetter;
            displayGeneratedLetter(coverLetter);
        }
    } finally {
        QuickApplyState.isGenerating = false;
        hideGeneratingState();
    }
}

/**
 * Generiert Anschreiben mit GPT-3.5-Turbo
 */
async function generateWithGPT(userData) {
    const prompt = buildGPTPrompt(userData);
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${QuickApplyState.apiKey}`
        },
        body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: `Du bist ein erfahrener Bewerbungsberater aus dem DACH-Raum. 
Erstelle professionelle, authentische Bewerbungsanschreiben auf Deutsch.
- Verwende einen ${userData.tone === 'formal' ? 'professionellen und sachlichen' : userData.tone === 'modern' ? 'modernen und dynamischen' : 'kreativen und einzigartigen'} Ton.
- Das Anschreiben soll ${userData.length === 'short' ? 'kurz (ca. 150 Wörter)' : userData.length === 'long' ? 'ausführlich (ca. 350 Wörter)' : 'mittellang (ca. 250 Wörter)'} sein.
- Integriere die Stärken und Erfahrung des Bewerbers natürlich.
- Vermeide Floskeln und generische Phrasen.`
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: 0.7,
            max_tokens: 1000
        })
    });
    
    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error?.message || `API Error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.choices[0].message.content;
}

function buildGPTPrompt(userData) {
    const jobInfo = QuickApplyState.jobData || {};
    
    return `Erstelle ein Bewerbungsanschreiben mit folgenden Informationen:

BEWERBER:
- Name: ${userData.name}
- Aktuelle Position: ${userData.currentPosition || 'Nicht angegeben'}
- Berufserfahrung: ${userData.experience}
- Standort: ${userData.location || 'Nicht angegeben'}
- Top-Stärken: ${userData.skills}
${userData.motivation ? `- Motivation: ${userData.motivation}` : ''}

ZIELSTELLE:
- Position: ${jobInfo.title || 'die ausgeschriebene Position'}
- Unternehmen: ${jobInfo.company || 'das Unternehmen'}
${jobInfo.description ? `- Stellenbeschreibung (Auszug): ${jobInfo.description.substring(0, 500)}` : ''}

Erstelle ein überzeugendes, authentisches Anschreiben das die Stärken des Bewerbers mit den Anforderungen der Stelle verbindet.`;
}

/**
 * Generiert Anschreiben aus Templates (für nicht-angemeldete Nutzer)
 */
function generateFromTemplates(userData) {
    const tone = userData.tone || 'formal';
    const length = userData.length || 'medium';
    const templates = CoverLetterTemplates;
    const jobData = QuickApplyState.jobData || {
        title: 'die ausgeschriebene Position',
        company: 'Ihr Unternehmen'
    };
    
    // Zufällige Auswahl aus Arrays
    const pick = (arr) => arr && arr.length > 0 ? arr[Math.floor(Math.random() * arr.length)] : '';
    
    // Platzhalter ersetzen
    const replace = (text) => {
        if (!text) return '';
        return text
            .replace(/\{\{position\}\}/g, jobData.title || 'die ausgeschriebene Position')
            .replace(/\{\{company\}\}/g, jobData.company || 'Ihr Unternehmen')
            .replace(/\{\{name\}\}/g, userData.name || '')
            .replace(/\{\{skills\}\}/g, userData.skills || 'relevante Fachkenntnisse')
            .replace(/\{\{experience\}\}/g, getExperienceYears(userData.experience))
            .replace(/\{\{motivation\}\}/g, userData.motivation || 'die spannenden Herausforderungen dieser Position');
    };
    
    // ═══════════════════════════════════════════════════════════════════════════
    // ANSCHREIBEN-STRUKTUR AUFBAUEN
    // ═══════════════════════════════════════════════════════════════════════════
    
    // 1. ANREDE
    const salutation = replace(pick(templates.salutations[tone]));
    
    // 2. ERÖFFNUNG
    const opening = replace(pick(templates.openings[tone]));
    
    // 3. QUALIFIKATIONEN
    const experienceSentence = replace(pick(templates.qualifications.experience));
    const skillsSentence = replace(pick(templates.qualifications.skills));
    
    // 4. ZUSÄTZLICHER CONTENT je nach Länge
    let additionalContent = '';
    
    if (length === 'medium') {
        // Mittlere Länge: +1 Achievement oder Soft Skill
        const achievement = replace(pick(templates.qualifications.achievements));
        additionalContent = `\n\n${achievement}`;
    } else if (length === 'long') {
        // Lange Version: +Achievement +Soft Skill +Übergang
        const achievement = replace(pick(templates.qualifications.achievements));
        const softSkill = replace(pick(templates.qualifications.softSkills));
        const transition = replace(pick(templates.transitions.toMotivation));
        additionalContent = `\n\n${achievement}\n\n${softSkill}\n\n${transition}`;
    }
    
    // 5. MOTIVATION
    const motivation = userData.motivation 
        ? replace(pick(templates.motivation.custom))
        : replace(pick(templates.motivation.general));
    
    // 6. MEHRWERT
    const value = replace(pick(templates.value[tone]));
    
    // 7. ABSCHLUSS
    const closing = replace(pick(templates.closings[tone]));
    
    // 8. GRUSSFORMEL
    const greeting = pick(templates.greetings[tone]);
    
    // ═══════════════════════════════════════════════════════════════════════════
    // FINALES ANSCHREIBEN ZUSAMMENBAUEN
    // ═══════════════════════════════════════════════════════════════════════════
    
    // Datum formatieren
    const today = new Date().toLocaleDateString('de-DE', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
    
    // Struktur je nach Länge anpassen
    let letterBody = '';
    
    if (length === 'short') {
        // Kurze Version: Kompakt und direkt
        letterBody = `${opening}

${experienceSentence} ${skillsSentence}

${motivation}

${closing}`;
    } else if (length === 'medium') {
        // Mittlere Version: Ausgewogen
        letterBody = `${opening}

${experienceSentence} ${skillsSentence}${additionalContent}

${motivation} ${value}

${closing}`;
    } else {
        // Lange Version: Ausführlich mit allen Details
        letterBody = `${opening}

${experienceSentence}

${skillsSentence}${additionalContent}

${motivation}

${value}

${closing}`;
    }
    
    return `${today}

${salutation}

${letterBody}

${greeting}
${userData.name || 'Max Mustermann'}`;
}

function getExperienceYears(experience) {
    const map = {
        '': '1',
        'entry': '1',
        'junior': '2',
        'mid': '4',
        'senior': '7',
        'expert': '10+'
    };
    return map[experience] || '3';
}

// ═══════════════════════════════════════════════════════════════════════════
// UI HELPERS
// ═══════════════════════════════════════════════════════════════════════════

function collectUserData() {
    return {
        name: document.getElementById('quickName')?.value.trim() || '',
        currentPosition: document.getElementById('quickPosition')?.value.trim() || '',
        experience: document.getElementById('quickExperience')?.value || '',
        location: document.getElementById('quickLocation')?.value.trim() || '',
        skills: document.getElementById('quickSkills')?.value.trim() || '',
        motivation: document.getElementById('quickMotivation')?.value.trim() || '',
        tone: QuickApplyState.tone,
        length: QuickApplyState.length
    };
}

function validateUserData(userData) {
    if (!userData.name) {
        quickApplyShowToast('Bitte geben Sie Ihren Namen ein', 'error');
        document.getElementById('quickName')?.focus();
        return false;
    }
    if (!userData.experience) {
        quickApplyShowToast('Bitte wählen Sie Ihre Berufserfahrung', 'error');
        document.getElementById('quickExperience')?.focus();
        return false;
    }
    if (!userData.skills) {
        quickApplyShowToast('Bitte geben Sie Ihre Stärken ein', 'error');
        document.getElementById('quickSkills')?.focus();
        return false;
    }
    return true;
}

function showGeneratingState() {
    const generateBtn = document.getElementById('generateBtn');
    const resultSection = document.getElementById('resultSection');
    
    if (generateBtn) {
        generateBtn.disabled = true;
        generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Wird erstellt...';
    }
    
    if (resultSection) {
        resultSection.innerHTML = `
            <div class="generating-animation">
                <div class="generating-icon">
                    <i class="fas fa-pen-fancy fa-3x"></i>
                </div>
                <h3>Anschreiben wird erstellt...</h3>
                <p>${QuickApplyState.isLoggedIn && QuickApplyState.apiKey ? 'GPT-3.5-Turbo formuliert Ihr individuelles Anschreiben' : 'Intelligente Templates werden zusammengestellt'}</p>
                <div class="progress-bar">
                    <div class="progress-fill"></div>
                </div>
            </div>
        `;
        resultSection.classList.remove('hidden');
    }
}

function hideGeneratingState() {
    const generateBtn = document.getElementById('generateBtn');
    if (generateBtn) {
        generateBtn.disabled = false;
        generateBtn.innerHTML = '<i class="fas fa-magic"></i> Anschreiben generieren';
    }
}

function displayGeneratedLetter(letter) {
    const resultSection = document.getElementById('resultSection');
    if (!resultSection) return;
    
    const modeLabel = QuickApplyState.isLoggedIn && QuickApplyState.apiKey
        ? '<span class="mode-badge ai"><i class="fas fa-robot"></i> GPT-3.5-Turbo</span>'
        : '<span class="mode-badge template"><i class="fas fa-magic"></i> Smart-Template</span>';
    
    resultSection.innerHTML = `
        <div class="result-header">
            <h3><i class="fas fa-file-alt"></i> Ihr Anschreiben ${modeLabel}</h3>
            <div class="result-actions">
                <button onclick="copyToClipboard(QuickApplyState.generatedText)" class="btn-icon" title="Kopieren">
                    <i class="fas fa-copy"></i>
                </button>
                <button onclick="downloadLetter()" class="btn-icon" title="Herunterladen">
                    <i class="fas fa-download"></i>
                </button>
                <button onclick="regenerateLetter()" class="btn-icon" title="Neu generieren">
                    <i class="fas fa-sync"></i>
                </button>
            </div>
        </div>
        <div class="result-content">
            <textarea id="generatedLetter" class="letter-textarea">${escapeHtml(letter)}</textarea>
        </div>
        <div class="result-footer">
            <button onclick="saveToDrafts()" class="btn-secondary">
                <i class="fas fa-save"></i> Als Entwurf speichern
            </button>
            <button onclick="sendApplication()" class="btn-primary">
                <i class="fas fa-paper-plane"></i> Bewerbung absenden
            </button>
        </div>
    `;
    
    resultSection.classList.remove('hidden');
    resultSection.scrollIntoView({ behavior: 'smooth' });
}

function regenerateLetter() {
    generateCoverLetter();
}

function downloadLetter() {
    const letter = document.getElementById('generatedLetter')?.value || QuickApplyState.generatedText;
    const jobData = QuickApplyState.jobData || {};
    
    const blob = new Blob([letter], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Anschreiben_${jobData.company || 'Bewerbung'}_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    quickApplyShowToast('Anschreiben heruntergeladen', 'success');
}

function saveToDrafts() {
    const letter = document.getElementById('generatedLetter')?.value || QuickApplyState.generatedText;
    
    const drafts = JSON.parse(localStorage.getItem('cover_letter_drafts') || '[]');
    drafts.unshift({
        id: Date.now().toString(36),
        content: letter,
        jobData: QuickApplyState.jobData,
        createdAt: new Date().toISOString()
    });
    localStorage.setItem('cover_letter_drafts', JSON.stringify(drafts.slice(0, 10)));
    
    quickApplyShowToast('Entwurf gespeichert', 'success');
}

function sendApplication() {
    quickApplyShowToast('Bewerbungsfunktion kommt bald!', 'info');
}

function saveToTracking(userData) {
    if (!window.DashboardState) return;
    
    const jobData = QuickApplyState.jobData || {};
    const application = {
        id: Date.now().toString(36),
        position: jobData.title || 'Unbekannte Position',
        company: jobData.company || 'Unbekanntes Unternehmen',
        date: new Date().toISOString().split('T')[0],
        status: 'pending',
        coverLetter: QuickApplyState.generatedText,
        createdAt: new Date().toISOString()
    };
    
    window.DashboardState.applications.unshift(application);
    if (window.saveState) window.saveState();
    if (window.updateStatsBar) window.updateStatsBar();
}

// ═══════════════════════════════════════════════════════════════════════════
// TONE & LENGTH SELECTION
// ═══════════════════════════════════════════════════════════════════════════

function setTone(tone) {
    QuickApplyState.tone = tone;
    console.log('🎨 Tonalität gesetzt:', tone);
    
    // Support both .tone-btn and .option-btn[data-tone]
    document.querySelectorAll('.tone-btn, .option-btn[data-tone]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tone === tone);
    });
}

function setLength(length) {
    QuickApplyState.length = length;
    console.log('📏 Länge gesetzt:', length);
    
    // Support both .length-btn and .option-btn[data-length]
    document.querySelectorAll('.length-btn, .option-btn[data-length]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.length === length);
    });
}

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS (Fallbacks wenn utils.js nicht geladen)
// ═══════════════════════════════════════════════════════════════════════════

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// showToast - use dashboard-core's implementation or fallback
function quickApplyShowToast(message, type = 'info') {
    // Try NotificationManager from utils.js
    if (window.NotificationManager && window.NotificationManager.showToast) {
        return window.NotificationManager.quickApplyShowToast(message, type);
    }
    // Try dashboard-core's showToast (already defined on window)
    const container = document.getElementById('toastContainer');
    if (!container) {
        console.log(`[${type}] ${message}`);
        return;
    }
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'times' : 'info'}-circle"></i>
        <span>${message}</span>
    `;
    container.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        quickApplyShowToast('In Zwischenablage kopiert', 'success');
    });
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════════
// GLOBAL EXPORTS - Alle Funktionen die im HTML verwendet werden
// ═══════════════════════════════════════════════════════════════════════════
window.initQuickApply = initQuickApply;
window.toggleInputType = toggleInputType;
window.analyzeJobUrl = analyzeJobUrl;
window.parseJobUrl = analyzeJobUrl; // Alias für HTML onclick
window.generateCoverLetter = generateCoverLetter;
window.generateQuickApplication = generateCoverLetter; // Alias für HTML onclick
window.setTone = setTone;
window.selectTone = setTone; // Alias für HTML onclick
window.setLength = setLength;
window.selectLength = setLength; // Alias für HTML onclick
window.downloadLetter = downloadLetter;
window.saveToDrafts = saveToDrafts;
window.sendApplication = sendApplication;
window.regenerateLetter = regenerateLetter;
window.QuickApplyState = QuickApplyState;

// Input Handler für HTML Events
window.handleUrlInput = handleUrlInput;
window.handleUrlPaste = handleUrlPaste;
window.handleTextInput = handleTextInput;

// Utility Functions
window.isValidJobUrl = isValidJobUrl;
window.updateGenerateButtonState = updateGenerateButtonState;
