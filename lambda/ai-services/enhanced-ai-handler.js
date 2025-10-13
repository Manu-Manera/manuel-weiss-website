/**
 * Enhanced AI Handler
 * CoverLetterGPT's optimierte AI Prompts für bessere Ergebnisse
 */

const AWS = require('aws-sdk');

const dynamodb = new AWS.DynamoDB.DocumentClient();

// OpenAI API Configuration
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_BASE_URL = 'https://api.openai.com/v1';

/**
 * CoverLetterGPT's optimierte AI Prompts
 */
const AI_PROMPTS = {
    jobAnalysis: `
        Analysiere die folgende Stellenausschreibung und extrahiere strukturierte Informationen:
        
        Stelle: {position}
        Unternehmen: {company}
        Beschreibung: {description}
        
        Extrahiere folgende Informationen:
        1. Hauptanforderungen (mindestens 5 konkrete Anforderungen)
        2. Schlüsselwörter (mindestens 10 relevante Keywords)
        3. Gewünschte Soft Skills (Kommunikation, Teamarbeit, etc.)
        4. Technische Anforderungen (Programmiersprachen, Tools, etc.)
        5. Erfahrungslevel (Junior, Mid-Level, Senior, etc.)
        6. Branche/Typ (IT, Marketing, Finance, etc.)
        7. Gehaltsbereich (falls erwähnt)
        8. Standort/Remote-Möglichkeiten
        
        Antworte im JSON-Format:
        {
            "requirements": ["Anforderung 1", "Anforderung 2", ...],
            "keywords": ["Schlüsselwort 1", "Schlüsselwort 2", ...],
            "softSkills": ["Skill 1", "Skill 2", ...],
            "technicalSkills": ["Tech 1", "Tech 2", ...],
            "experienceLevel": "Junior/Mid/Senior",
            "industry": "Branche",
            "salaryRange": "Gehaltsbereich",
            "location": "Standort/Remote",
            "summary": "Kurze Zusammenfassung der Stelle",
            "priorityRequirements": ["Top 3 wichtigste Anforderungen"],
            "niceToHave": ["Wünschenswerte aber nicht zwingende Skills"]
        }
    `,
    
    coverLetterGeneration: `
        Erstelle ein professionelles, personalisiertes Anschreiben für:
        
        Unternehmen: {company}
        Position: {position}
        Stellenausschreibung: {jobDescription}
        Benutzer-Skills: {userSkills}
        Job-Analyse: {analysis}
        
        Das Anschreiben soll:
        - Professionell und überzeugend sein
        - Spezifisch auf die Stelle eingehen
        - Die relevanten Skills des Bewerbers hervorheben
        - Eine klare Struktur haben (Anrede, Einleitung, Hauptteil, Schluss)
        - Maximal 300 Wörter lang sein
        - Auf Deutsch verfasst sein
        - Konkrete Beispiele und Erfolge enthalten
        - Zeigen, warum der Bewerber perfekt für die Stelle ist
        
        Struktur:
        1. Anrede (formal/personal/modern)
        2. Einleitung: Interesse an der Stelle bekunden
        3. Hauptteil: Relevante Erfahrungen und Skills hervorheben
        4. Schluss: Nächste Schritte und Kontakt
        
        Erstelle ein vollständiges Anschreiben:
    `,
    
    skillMatching: `
        Berechne einen detaillierten Matching-Score zwischen den Benutzer-Skills und den Job-Anforderungen:
        
        Benutzer-Skills: {userSkills}
        Job-Anforderungen: {jobRequirements}
        
        Analysiere:
        1. Exakte Matches (Skills die perfekt übereinstimmen)
        2. Teilweise Matches (Ähnliche Skills)
        3. Fehlende Skills (Was der Bewerber noch lernen sollte)
        4. Überqualifikation (Skills die über den Job hinausgehen)
        5. Soft Skills Match
        6. Erfahrungslevel Match
        
        Berechne einen Score von 0-100% und gib eine detaillierte Analyse zurück.
        
        Antworte im JSON-Format:
        {
            "score": 85,
            "exactMatches": ["Exakte Matches"],
            "partialMatches": ["Teilweise Matches"],
            "missingSkills": ["Fehlende Skills"],
            "overqualified": ["Überqualifikation"],
            "softSkillsMatch": 90,
            "experienceMatch": 80,
            "recommendations": [
                "Empfehlung 1: Spezifische Skills erwerben",
                "Empfehlung 2: Erfahrung in bestimmten Bereichen sammeln",
                "Empfehlung 3: Zertifikate erwerben"
            ],
            "analysis": "Detaillierte Analyse des Matchings mit Begründung",
            "improvementAreas": ["Bereiche zur Verbesserung"],
            "strengths": ["Stärken des Bewerbers"]
        }
    `,
    
    cvOptimization: `
        Optimiere den folgenden Lebenslauf für die Stellenanforderungen:
        
        Lebenslauf: {cvContent}
        Job-Anforderungen: {jobRequirements}
        
        Optimiere:
        1. Schlüsselwörter für ATS-Systeme (Applicant Tracking Systems)
        2. Struktur und Formatierung für bessere Lesbarkeit
        3. Relevante Erfahrungen hervorheben
        4. Fehlende wichtige Punkte ergänzen
        5. Quantifizierte Erfolge hinzufügen
        6. Soft Skills integrieren
        7. Technische Skills prominent platzieren
        8. Berufserfahrung chronologisch ordnen
        
        Gib den optimierten Lebenslauf zurück mit Erklärungen der Änderungen:
    `,
    
    interviewQuestions: `
        Generiere 10 relevante Interview-Fragen für die Position:
        
        Stelle: {position}
        Unternehmen: {company}
        Job-Beschreibung: {jobDescription}
        Kandidat: {userProfile}
        
        Erstelle eine Mischung aus:
        - Technischen Fragen (3-4 Fragen)
        - Verhaltensfragen (3-4 Fragen)
        - Situationsfragen (2-3 Fragen)
        - Branchenspezifischen Fragen (1-2 Fragen)
        
        Antworte im JSON-Format:
        {
            "technicalQuestions": [
                "Technische Frage 1",
                "Technische Frage 2",
                "Technische Frage 3"
            ],
            "behavioralQuestions": [
                "Verhaltensfrage 1",
                "Verhaltensfrage 2",
                "Verhaltensfrage 3"
            ],
            "situationalQuestions": [
                "Situationsfrage 1",
                "Situationsfrage 2"
            ],
            "industryQuestions": [
                "Branchenfrage 1"
            ],
            "preparationTips": [
                "Tipp 1: Vorbereitung",
                "Tipp 2: Recherche",
                "Tipp 3: Übung"
            ]
        }
    `,
    
    salaryNegotiation: `
        Erstelle eine Gehaltsverhandlung-Strategie für:
        
        Position: {position}
        Unternehmen: {company}
        Kandidat-Erfahrung: {userExperience}
        Branche: {industry}
        Standort: {location}
        
        Berücksichtige:
        1. Marktübliche Gehälter für die Position
        2. Erfahrungslevel des Kandidaten
        3. Standort-Faktoren
        4. Branchen-Standards
        5. Verhandlungstipps
        6. Alternative Benefits
        
        Antworte im JSON-Format:
        {
            "salaryRange": {
                "min": 50000,
                "max": 70000,
                "median": 60000
            },
            "negotiationTips": [
                "Tipp 1: Vorbereitung",
                "Tipp 2: Timing",
                "Tipp 3: Argumente"
            ],
            "alternativeBenefits": [
                "Flexible Arbeitszeiten",
                "Home Office",
                "Weiterbildung"
            ],
            "marketAnalysis": "Marktanalyse für die Position",
            "strategy": "Verhandlungsstrategie"
        }
    `
};

exports.handler = async (event) => {
    console.log('🤖 Enhanced AI Handler gestartet:', JSON.stringify(event, null, 2));
    
    try {
        const { action, data } = JSON.parse(event.body);
        
        switch (action) {
            case 'analyzeJob':
                return await analyzeJobDescription(data);
            case 'generateCoverLetter':
                return await generateCoverLetter(data);
            case 'calculateMatching':
                return await calculateSkillMatching(data);
            case 'optimizeCV':
                return await optimizeCV(data);
            case 'generateInterviewQuestions':
                return await generateInterviewQuestions(data);
            case 'salaryNegotiation':
                return await generateSalaryNegotiation(data);
            default:
                throw new Error(`Unbekannte AI-Aktion: ${action}`);
        }
    } catch (error) {
        console.error('❌ Fehler im Enhanced AI Handler:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                success: false,
                error: error.message
            })
        };
    }
};

/**
 * Stellenausschreibung analysieren
 */
async function analyzeJobDescription(data) {
    const { company, position, description } = data;
    
    const prompt = AI_PROMPTS.jobAnalysis
        .replace('{position}', position)
        .replace('{company}', company)
        .replace('{description}', description);
    
    try {
        const analysis = await callOpenAI(prompt);
        const parsedAnalysis = JSON.parse(analysis);
        
        // Analyse in Datenbank speichern
        await saveJobAnalysis(data, parsedAnalysis);
        
        return {
            statusCode: 200,
            body: JSON.stringify({
                success: true,
                analysis: parsedAnalysis
            })
        };
    } catch (error) {
        console.error('❌ Fehler bei Job-Analyse:', error);
        throw error;
    }
}

/**
 * Anschreiben generieren
 */
async function generateCoverLetter(data) {
    const { company, position, jobDescription, userSkills, analysis } = data;
    
    const prompt = AI_PROMPTS.coverLetterGeneration
        .replace('{company}', company)
        .replace('{position}', position)
        .replace('{jobDescription}', jobDescription)
        .replace('{userSkills}', userSkills)
        .replace('{analysis}', JSON.stringify(analysis));
    
    try {
        const coverLetter = await callOpenAI(prompt);
        
        // Anschreiben in Datenbank speichern
        await saveCoverLetter(data, coverLetter);
        
        return {
            statusCode: 200,
            body: JSON.stringify({
                success: true,
                coverLetter: coverLetter
            })
        };
    } catch (error) {
        console.error('❌ Fehler bei Anschreiben-Generierung:', error);
        throw error;
    }
}

/**
 * Skill-Matching berechnen
 */
async function calculateSkillMatching(data) {
    const { userSkills, jobRequirements } = data;
    
    const prompt = AI_PROMPTS.skillMatching
        .replace('{userSkills}', userSkills)
        .replace('{jobRequirements}', JSON.stringify(jobRequirements));
    
    try {
        const matching = await callOpenAI(prompt);
        const parsedMatching = JSON.parse(matching);
        
        // Matching-Ergebnis in Datenbank speichern
        await saveSkillMatching(data, parsedMatching);
        
        return {
            statusCode: 200,
            body: JSON.stringify({
                success: true,
                matching: parsedMatching
            })
        };
    } catch (error) {
        console.error('❌ Fehler bei Skill-Matching:', error);
        throw error;
    }
}

/**
 * CV optimieren
 */
async function optimizeCV(data) {
    const { cvContent, jobRequirements } = data;
    
    const prompt = AI_PROMPTS.cvOptimization
        .replace('{cvContent}', cvContent)
        .replace('{jobRequirements}', JSON.stringify(jobRequirements));
    
    try {
        const optimizedCV = await callOpenAI(prompt);
        
        return {
            statusCode: 200,
            body: JSON.stringify({
                success: true,
                optimizedCV: optimizedCV
            })
        };
    } catch (error) {
        console.error('❌ Fehler bei CV-Optimierung:', error);
        throw error;
    }
}

/**
 * Interview-Fragen generieren
 */
async function generateInterviewQuestions(data) {
    const { position, company, jobDescription, userProfile } = data;
    
    const prompt = AI_PROMPTS.interviewQuestions
        .replace('{position}', position)
        .replace('{company}', company)
        .replace('{jobDescription}', jobDescription)
        .replace('{userProfile}', userProfile);
    
    try {
        const questions = await callOpenAI(prompt);
        const parsedQuestions = JSON.parse(questions);
        
        return {
            statusCode: 200,
            body: JSON.stringify({
                success: true,
                questions: parsedQuestions
            })
        };
    } catch (error) {
        console.error('❌ Fehler bei Interview-Fragen-Generierung:', error);
        throw error;
    }
}

/**
 * Gehaltsverhandlung-Strategie generieren
 */
async function generateSalaryNegotiation(data) {
    const { position, company, userExperience, industry, location } = data;
    
    const prompt = AI_PROMPTS.salaryNegotiation
        .replace('{position}', position)
        .replace('{company}', company)
        .replace('{userExperience}', userExperience)
        .replace('{industry}', industry)
        .replace('{location}', location);
    
    try {
        const strategy = await callOpenAI(prompt);
        const parsedStrategy = JSON.parse(strategy);
        
        return {
            statusCode: 200,
            body: JSON.stringify({
                success: true,
                strategy: parsedStrategy
            })
        };
    } catch (error) {
        console.error('❌ Fehler bei Gehaltsverhandlung-Strategie:', error);
        throw error;
    }
}

/**
 * OpenAI API aufrufen
 */
async function callOpenAI(prompt, model = 'gpt-3.5-turbo') {
    const response = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
            model: model,
            messages: [
                {
                    role: 'system',
                    content: 'Du bist ein Experte für Bewerbungen und Karriereberatung. Erstelle professionelle, überzeugende Bewerbungsunterlagen und Analysen.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            max_tokens: 2000,
            temperature: 0.7
        })
    });
    
    if (!response.ok) {
        throw new Error(`OpenAI API Fehler: ${response.status}`);
    }
    
    const data = await response.json();
    return data.choices[0].message.content;
}

/**
 * Job-Analyse in Datenbank speichern
 */
async function saveJobAnalysis(data, analysis) {
    try {
        await dynamodb.put({
            TableName: 'JobAnalyses',
            Item: {
                id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                company: data.company,
                position: data.position,
                analysis: analysis,
                timestamp: Date.now(),
                userId: data.userId
            }
        }).promise();
        
        console.log('✅ Job-Analyse gespeichert');
    } catch (error) {
        console.error('❌ Fehler beim Speichern der Job-Analyse:', error);
    }
}

/**
 * Anschreiben in Datenbank speichern
 */
async function saveCoverLetter(data, coverLetter) {
    try {
        await dynamodb.put({
            TableName: 'CoverLetters',
            Item: {
                id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                company: data.company,
                position: data.position,
                content: coverLetter,
                timestamp: Date.now(),
                userId: data.userId
            }
        }).promise();
        
        console.log('✅ Anschreiben gespeichert');
    } catch (error) {
        console.error('❌ Fehler beim Speichern des Anschreibens:', error);
    }
}

/**
 * Skill-Matching in Datenbank speichern
 */
async function saveSkillMatching(data, matching) {
    try {
        await dynamodb.put({
            TableName: 'SkillMatchings',
            Item: {
                id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                userId: data.userId,
                matching: matching,
                timestamp: Date.now()
            }
        }).promise();
        
        console.log('✅ Skill-Matching gespeichert');
    } catch (error) {
        console.error('❌ Fehler beim Speichern des Skill-Matchings:', error);
    }
}
