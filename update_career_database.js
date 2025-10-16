// Erstelle eine umfassende Berufsdatenbank für alle RAISEC-Typen
const careerDatabase = {
    'R': [
        // Technische Berufe
        'Maschinenbauingenieur', 'Elektroingenieur', 'Bauingenieur', 'Verfahrenstechniker',
        'Mechatroniker', 'Elektroniker', 'Anlagentechniker', 'Werkzeugmechaniker',
        'Zerspanungsmechaniker', 'Industriemechaniker', 'Kfz-Mechatroniker', 'Fahrzeugtechniker',
        'Fluggerätemechaniker', 'Schiffsmechaniker', 'Lokführer', 'Pilot',
        'Fluglotse', 'Schiffskapitän', 'Navigator', 'Luftfahrzeugtechniker',
        
        // Handwerkliche Berufe
        'Tischler', 'Schreiner', 'Zimmerer', 'Dachdecker', 'Maurer', 'Betonbauer',
        'Straßenbauer', 'Rohrleitungsbauer', 'Kanalbauer', 'Brunnenbauer',
        'Steinmetz', 'Bildhauer', 'Restaurator', 'Goldschmied', 'Silberschmied',
        'Uhrmacher', 'Optiker', 'Hörgeräteakustiker', 'Zahntechniker',
        
        // Landwirtschaft & Natur
        'Landwirt', 'Gärtner', 'Forstwirt', 'Jäger', 'Fischer', 'Tierarzt',
        'Veterinärmediziner', 'Pferdewirt', 'Tierpfleger', 'Zootierpfleger',
        'Landschaftsgärtner', 'Garten- und Landschaftsbauer', 'Forstingenieur',
        'Agraringenieur', 'Umweltingenieur', 'Geologe', 'Geophysiker',
        
        // IT & Technik
        'Systemadministrator', 'Netzwerktechniker', 'IT-Systemelektroniker',
        'Fachinformatiker', 'Datenbankadministrator', 'IT-Sicherheitsexperte',
        'Cloud-Architekt', 'DevOps-Ingenieur', 'Systemanalytiker',
        
        // Medizin & Gesundheit
        'Chirurg', 'Orthopäde', 'Traumatologe', 'Neurochirurg', 'Herzchirurg',
        'Anästhesist', 'Radiologe', 'Pathologe', 'Forensiker', 'Gerichtsmediziner',
        'Zahnarzt', 'Kieferorthopäde', 'Oralchirurg', 'Zahntechniker',
        
        // Sicherheit & Rettung
        'Polizist', 'Kriminalkommissar', 'FBI-Agent', 'CIA-Agent', 'Geheimdienstler',
        'Feuerwehrmann', 'Rettungssanitäter', 'Notfallsanitäter', 'Rettungsassistent',
        'Bergretter', 'Wasserretter', 'Höhenretter', 'Sicherheitsberater',
        
        // Militär & Verteidigung
        'Soldat', 'Offizier', 'Pilot (Militär)', 'Kampfpilot', 'Hubschrauberpilot',
        'Fallschirmjäger', 'Marineinfanterist', 'Kampfschwimmer', 'Scharfschütze',
        'Sprengstoffexperte', 'Militärtechniker', 'Waffentechniker'
    ],
    'I': [
        // Wissenschaft & Forschung
        'Wissenschaftler', 'Forscher', 'Forschungsleiter', 'Laborleiter',
        'Physiker', 'Chemiker', 'Biologe', 'Mathematiker', 'Statistiker',
        'Astronom', 'Astrophysiker', 'Geologe', 'Paleontologe', 'Meteorologe',
        'Klimatologe', 'Ozeanograph', 'Seismologe', 'Vulkanologe', 'Archäologe',
        'Anthropologe', 'Soziologe', 'Psychologe', 'Neuropsychologe',
        'Kognitionswissenschaftler', 'Verhaltensforscher', 'Marktforscher',
        
        // Medizin & Gesundheit
        'Arzt', 'Chirurg', 'Internist', 'Kardiologe', 'Neurologe', 'Psychiater',
        'Psychologe', 'Psychotherapeut', 'Klinischer Psychologe', 'Neuropsychologe',
        'Pharmakologe', 'Toxikologe', 'Epidemiologe', 'Virologe', 'Bakteriologe',
        'Immunologe', 'Molekularbiologe', 'Genetiker', 'Biochemiker',
        'Medizintechniker', 'Biomediziner', 'Krankenhausmanager',
        
        // IT & Datenanalyse
        'Datenanalyst', 'Data Scientist', 'Statistiker', 'Biostatistiker',
        'Programmierer', 'Software-Entwickler', 'Algorithmus-Entwickler',
        'Künstliche Intelligenz', 'Machine Learning Engineer', 'Deep Learning Engineer',
        'Quantitative Analyst', 'Risikoanalyst', 'Finanzanalyst', 'Investmentanalyst',
        'Kreditanalyst', 'Versicherungsmathematiker', 'Aktuar',
        
        // Technik & Ingenieurwesen
        'Forschung & Entwicklung', 'Produktentwickler', 'Innovationsmanager',
        'Patentanwalt', 'Patentprüfer', 'Technischer Redakteur',
        'Qualitätsmanager', 'Prozessoptimierer', 'Six Sigma Black Belt',
        'Lean Manager', 'Projektmanager (Forschung)', 'Technischer Berater',
        
        // Bildung & Lehre
        'Professor', 'Dozent', 'Forschungsassistent', 'Postdoc',
        'Wissenschaftlicher Mitarbeiter', 'Lehrbeauftragter', 'Tutor',
        'Bildungsforscher', 'Pädagoge', 'Erwachsenenbildner',
        
        // Beratung & Consulting
        'Unternehmensberater', 'Strategieberater', 'Managementberater',
        'Technologieberater', 'Innovationsberater', 'Change Manager',
        'Prozessberater', 'Organisationsberater', 'Personalberater'
    ],
    'A': [
        // Kunst & Design
        'Künstler', 'Maler', 'Bildhauer', 'Grafikdesigner', 'Webdesigner', 'UI/UX Designer',
        'Produktdesigner', 'Industriedesigner', 'Innenarchitekt', 'Landschaftsarchitekt',
        'Architekt', 'Stadtplaner', 'Fotograf', 'Videograf', 'Filmemacher', 'Regisseur',
        'Kameramann', 'Cutter', 'Tontechniker', 'Lichttechniker',
        
        // Musik & Performance
        'Musiker', 'Komponist', 'Dirigent', 'Sänger', 'Instrumentalist', 'DJ',
        'Schauspieler', 'Tänzer', 'Choreograf', 'Theaterregisseur', 'Opernsänger',
        'Musical-Darsteller', 'Zirkusartist', 'Comedian', 'Entertainer',
        
        // Medien & Kommunikation
        'Journalist', 'Redakteur', 'Autor', 'Schriftsteller', 'Drehbuchautor',
        'Lektor', 'Übersetzer', 'Dolmetscher', 'Radiomoderator', 'TV-Moderator',
        'Podcaster', 'Blogger', 'Influencer', 'Content Creator', 'Social Media Manager',
        
        // Mode & Beauty
        'Modedesigner', 'Kostümbildner', 'Stylist', 'Visagist', 'Friseur',
        'Kosmetiker', 'Schminkkünstler', 'Tattoo-Künstler', 'Bodypainter',
        
        // Kreative Dienstleistungen
        'Eventmanager', 'Wedding Planner', 'Partyplaner', 'Dekorateur',
        'Florist', 'Keramiker', 'Glasbläser', 'Schmuckdesigner', 'Uhrmacher',
        'Restaurator', 'Konservator', 'Museumsleiter', 'Kurator',
        
        // Bildung & Coaching
        'Kunstlehrer', 'Musiklehrer', 'Tanzlehrer', 'Schauspiellehrer',
        'Kreativitätscoach', 'Künstlerischer Berater', 'Kulturmanager',
        'Galerist', 'Kunsthändler', 'Auktionator'
    ],
    'S': [
        // Bildung & Erziehung
        'Lehrer', 'Erzieher', 'Pädagoge', 'Dozent', 'Professor', 'Trainer',
        'Coach', 'Mentor', 'Tutor', 'Nachhilfelehrer', 'Sprachlehrer',
        'Musiklehrer', 'Sportlehrer', 'Kunstlehrer', 'Religionslehrer',
        'Sonderschullehrer', 'Berufsschullehrer', 'Erwachsenenbildner',
        
        // Gesundheit & Pflege
        'Arzt', 'Krankenpfleger', 'Hebamme', 'Physiotherapeut', 'Ergotherapeut',
        'Logopäde', 'Psychologe', 'Psychotherapeut', 'Psychiater', 'Sozialarbeiter',
        'Heilpädagoge', 'Behindertenbetreuer', 'Altenpfleger', 'Krankenhausseelsorger',
        'Hospizhelfer', 'Rettungssanitäter', 'Notfallsanitäter',
        
        // Sozialarbeit & Beratung
        'Sozialarbeiter', 'Sozialpädagoge', 'Jugendbetreuer', 'Familienberater',
        'Eheberater', 'Drogenberater', 'Schuldenberater', 'Migrationsberater',
        'Flüchtlingshelfer', 'Obdachlosenhelfer', 'Streetworker', 'Krisenberater',
        'Trauerberater', 'Lebensberater', 'Coaching', 'Mentoring',
        
        // Religion & Spiritualität
        'Pfarrer', 'Pastor', 'Priester', 'Imam', 'Rabbiner', 'Seelsorger',
        'Gemeindereferent', 'Religionspädagoge', 'Meditationslehrer',
        'Yogalehrer', 'Spiritueller Berater', 'Lebensberater',
        
        // Politik & Gesellschaft
        'Politiker', 'Abgeordneter', 'Bürgermeister', 'Gemeinderat', 'Bezirksrat',
        'Parlamentarier', 'Diplomat', 'Botschafter', 'Konsul', 'Beamter',
        'Verwaltungsangestellter', 'Sachbearbeiter', 'Bürgerberater',
        
        // Sport & Fitness
        'Sportlehrer', 'Fitness-Trainer', 'Personal Trainer', 'Physiotherapeut',
        'Sportpsychologe', 'Sportmediziner', 'Sportmanager', 'Sportjournalist',
        'Schiedsrichter', 'Sportfunktionär', 'Vereinsmanager'
    ],
    'E': [
        // Management & Führung
        'Manager', 'Geschäftsführer', 'CEO', 'COO', 'CFO', 'CTO', 'CMO',
        'Abteilungsleiter', 'Teamleiter', 'Projektmanager', 'Produktmanager',
        'Programmmanager', 'Portfolio Manager', 'Strategie Manager',
        'Change Manager', 'Innovationsmanager', 'Qualitätsmanager',
        
        // Vertrieb & Marketing
        'Verkäufer', 'Vertriebsleiter', 'Key Account Manager', 'Sales Manager',
        'Marketing Manager', 'Brand Manager', 'Product Manager', 'Market Researcher',
        'PR Manager', 'Kommunikationsmanager', 'Event Manager', 'Sponsoring Manager',
        'Digital Marketing Manager', 'Social Media Manager', 'Content Manager',
        
        // Unternehmertum
        'Unternehmer', 'Startup-Gründer', 'Geschäftsinhaber', 'Franchise-Nehmer',
        'Investor', 'Business Angel', 'Venture Capitalist', 'Private Equity Manager',
        'Berater', 'Mentor', 'Coach', 'Business Coach', 'Executive Coach',
        
        // Recht & Politik
        'Anwalt', 'Rechtsanwalt', 'Notar', 'Richter', 'Staatsanwalt', 'Rechtsberater',
        'Politiker', 'Abgeordneter', 'Minister', 'Staatssekretär', 'Beamter',
        'Diplomat', 'Botschafter', 'Konsul', 'Lobbyist', 'Politikberater',
        
        // Finanzen & Banking
        'Banker', 'Investment Banker', 'Portfolio Manager', 'Risk Manager',
        'Compliance Manager', 'Auditor', 'Steuerberater', 'Wirtschaftsprüfer',
        'Finanzberater', 'Vermögensberater', 'Versicherungsmakler',
        
        // Immobilien & Immobilien
        'Immobilienmakler', 'Immobilienentwickler', 'Projektentwickler',
        'Facility Manager', 'Property Manager', 'Asset Manager',
        
        // Consulting & Beratung
        'Unternehmensberater', 'Strategieberater', 'Managementberater',
        'Prozessberater', 'Organisationsberater', 'Personalberater',
        'Recruiter', 'Headhunter', 'Executive Search', 'Talent Manager'
    ],
    'C': [
        // Büro & Verwaltung
        'Sekretär', 'Assistent', 'Bürokaufmann', 'Verwaltungsangestellter',
        'Sachbearbeiter', 'Kundenbetreuer', 'Call Center Agent', 'Rezeptionist',
        'Empfangsmitarbeiter', 'Terminplaner', 'Disponent', 'Einkäufer',
        'Lagerist', 'Logistiker', 'Spediteur', 'Zollbeamter',
        
        // Finanzen & Buchhaltung
        'Buchhalter', 'Controlling', 'Finanzbuchhalter', 'Lohnbuchhalter',
        'Kostenrechner', 'Steuerfachangestellter', 'Steuerberater', 'Wirtschaftsprüfer',
        'Auditor', 'Interne Revision', 'Compliance Manager', 'Risk Manager',
        'Treasury Manager', 'Cash Manager', 'Kreditanalyst', 'Rating Analyst',
        
        // IT & Datenverarbeitung
        'IT-Administrator', 'Systemadministrator', 'Datenbankadministrator',
        'IT-Support', 'Helpdesk', 'Service Desk', 'IT-Service Manager',
        'Prozessmanager', 'Workflow Manager', 'Dokumentenmanager',
        'Wissensmanager', 'Content Manager', 'Datenmanager',
        
        // Qualität & Compliance
        'Qualitätsmanager', 'Qualitätsprüfer', 'Qualitätskontrolleur',
        'ISO-Auditor', 'Zertifizierungsmanager', 'Compliance Officer',
        'Regulatory Affairs Manager', 'Normenmanager', 'Standards Manager',
        
        // Personal & HR
        'Personalverwaltung', 'HR-Administrator', 'Lohn- und Gehaltsabrechnung',
        'Personalbuchhalter', 'HR-Controller', 'Personalentwickler',
        'Recruiting Coordinator', 'Onboarding Manager', 'HR-Service Manager',
        
        // Recht & Compliance
        'Rechtsabteilung', 'Compliance Manager', 'Datenschutzbeauftragter',
        'Sicherheitsbeauftragter', 'Brandschutzbeauftragter', 'Umweltbeauftragter',
        'Arbeitsschutzbeauftragter', 'Sicherheitsmanager', 'Risk Manager',
        
        // Öffentliche Verwaltung
        'Beamter', 'Verwaltungsbeamter', 'Sachbearbeiter (Behörde)',
        'Bürgerberater', 'Antragsbearbeiter', 'Genehmigungsmanager',
        'Zulassungsstelle', 'Standesamt', 'Einwohnermeldeamt',
        'Finanzamt', 'Ordnungsamt', 'Bauamt', 'Gewerbeamt'
    ]
};

// Intelligente Berufsauswahl basierend auf RAISEC-Scores
function getCareerRecommendations(scores) {
    const recommendations = [];
    
    // Sortiere Typen nach Score
    const sortedTypes = Object.keys(scores)
        .map(type => ({ type, score: scores[type] }))
        .sort((a, b) => b.score - a.score);
    
    // Haupttyp (höchster Score)
    const mainType = sortedTypes[0].type;
    const mainCareers = careerDatabase[mainType] || [];
    
    // Wähle 5-7 Berufe vom Haupttyp
    const mainRecommendations = getRandomCareers(mainCareers, Math.min(7, mainCareers.length));
    recommendations.push(...mainRecommendations.map(career => ({
        career,
        type: mainType,
        match: 'Sehr gut',
        score: scores[mainType]
    })));
    
    // Sekundärtyp (zweithöchster Score)
    if (sortedTypes.length > 1 && sortedTypes[1].score > 6) {
        const secondaryType = sortedTypes[1].type;
        const secondaryCareers = careerDatabase[secondaryType] || [];
        const secondaryRecommendations = getRandomCareers(secondaryCareers, 3);
        recommendations.push(...secondaryRecommendations.map(career => ({
            career,
            type: secondaryType,
            match: 'Gut',
            score: scores[secondaryType]
        })));
    }
    
    return recommendations.slice(0, 10); // Maximal 10 Empfehlungen
}

function getRandomCareers(careers, count) {
    const shuffled = [...careers].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

console.log('Career database created with', Object.keys(careerDatabase).reduce((total, type) => total + careerDatabase[type].length, 0), 'professions');
