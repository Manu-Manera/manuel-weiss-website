/**
 * Advanced AI Features
 * Erweiterte KI-Funktionen für Bewerbungsoptimierung
 */

const AWS = require('aws-sdk');

const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    console.log('🚀 Advanced AI Features gestartet:', JSON.stringify(event, null, 2));
    
    try {
        const { action, data } = JSON.parse(event.body);
        
        switch (action) {
            case 'optimizeCV':
                return await optimizeCV(data);
            case 'generateInterviewQuestions':
                return await generateInterviewQuestions(data);
            case 'analyzeJobMarket':
                return await analyzeJobMarket(data);
            case 'generateFollowUp':
                return await generateFollowUp(data);
            case 'optimizeLinkedIn':
                return await optimizeLinkedIn(data);
            case 'generateThankYouEmail':
                return await generateThankYouEmail(data);
            default:
                throw new Error(`Unbekannte Advanced AI-Aktion: ${action}`);
        }
    } catch (error) {
        console.error('❌ Fehler in Advanced AI Features:', error);
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
 * CV mit KI optimieren
 */
async function optimizeCV(data) {
    const { cvContent, jobRequirements, userProfile } = data;
    
    const prompt = `
        Optimiere den folgenden Lebenslauf für die Stellenanforderungen:
        
        Lebenslauf:
        ${cvContent}
        
        Job-Anforderungen:
        ${JSON.stringify(jobRequirements)}
        
        Benutzer-Profil:
        ${JSON.stringify(userProfile)}
        
        Optimiere:
        1. Schlüsselwörter für ATS-Systeme (Applicant Tracking Systems)
        2. Struktur und Formatierung für bessere Lesbarkeit
        3. Relevante Erfahrungen hervorheben
        4. Fehlende wichtige Punkte ergänzen
        5. Quantifizierte Erfolge hinzufügen (Zahlen, Prozente, etc.)
        6. Soft Skills integrieren
        7. Technische Skills prominent platzieren
        8. Berufserfahrung chronologisch ordnen
        9. Lücken in der Karriere erklären
        10. ATS-optimierte Formatierung
        
        Gib den optimierten Lebenslauf zurück mit:
        - Vollständiger optimierter CV
        - Erklärungen der Änderungen
        - ATS-Score Verbesserung
        - Empfohlene weitere Optimierungen
        
        Antworte im JSON-Format:
        {
            "optimizedCV": "Optimierter Lebenslauf...",
            "changes": ["Änderung 1", "Änderung 2", ...],
            "atsScore": 95,
            "recommendations": ["Empfehlung 1", "Empfehlung 2", ...],
            "keywords": ["Keyword 1", "Keyword 2", ...],
            "summary": "Zusammenfassung der Optimierungen"
        }
    `;
    
    try {
        const result = await callOpenAI(prompt);
        const parsedResult = JSON.parse(result);
        
        // Optimierung in Datenbank speichern
        await saveCVOptimization(data, parsedResult);
        
        return {
            statusCode: 200,
            body: JSON.stringify({
                success: true,
                optimization: parsedResult
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
    const { position, company, jobDescription, userProfile, industry } = data;
    
    const prompt = `
        Generiere 15 relevante Interview-Fragen für die Position:
        
        Position: ${position}
        Unternehmen: ${company}
        Branche: ${industry}
        Job-Beschreibung: ${jobDescription}
        Kandidat: ${JSON.stringify(userProfile)}
        
        Erstelle eine Mischung aus:
        - Technischen Fragen (5 Fragen)
        - Verhaltensfragen (5 Fragen)
        - Situationsfragen (3 Fragen)
        - Branchenspezifischen Fragen (2 Fragen)
        
        Berücksichtige:
        - Spezifische Anforderungen der Stelle
        - Erfahrungslevel des Kandidaten
        - Branchentrends
        - Unternehmenskultur
        
        Antworte im JSON-Format:
        {
            "technicalQuestions": [
                {
                    "question": "Frage",
                    "purpose": "Zweck der Frage",
                    "expectedAnswer": "Erwartete Antwort",
                    "difficulty": "Junior/Mid/Senior"
                }
            ],
            "behavioralQuestions": [
                {
                    "question": "Frage",
                    "purpose": "Zweck der Frage",
                    "starMethod": "STAR-Methode Hinweise"
                }
            ],
            "situationalQuestions": [
                {
                    "question": "Frage",
                    "scenario": "Szenario",
                    "evaluationCriteria": "Bewertungskriterien"
                }
            ],
            "industryQuestions": [
                {
                    "question": "Frage",
                    "industryContext": "Branchenkontext"
                }
            ],
            "preparationTips": [
                "Tipp 1: Vorbereitung",
                "Tipp 2: Recherche",
                "Tipp 3: Übung"
            ],
            "followUpQuestions": [
                "Nachfrage 1",
                "Nachfrage 2"
            ]
        }
    `;
    
    try {
        const result = await callOpenAI(prompt);
        const parsedResult = JSON.parse(result);
        
        return {
            statusCode: 200,
            body: JSON.stringify({
                success: true,
                questions: parsedResult
            })
        };
    } catch (error) {
        console.error('❌ Fehler bei Interview-Fragen-Generierung:', error);
        throw error;
    }
}

/**
 * Job-Markt analysieren
 */
async function analyzeJobMarket(data) {
    const { position, location, industry } = data;
    
    const prompt = `
        Analysiere den aktuellen Job-Markt für:
        
        Position: ${position}
        Standort: ${location}
        Branche: ${industry}
        
        Erstelle eine Marktanalyse mit:
        1. Gehaltstrends
        2. Nachfrage nach der Position
        3. Konkurrenzsituation
        4. Skills-Trends
        5. Remote-Arbeit Möglichkeiten
        6. Karriereaussichten
        7. Top-Unternehmen in der Branche
        8. Bewerbungstipps für den Markt
        
        Antworte im JSON-Format:
        {
            "salaryTrends": {
                "min": 50000,
                "max": 80000,
                "median": 65000,
                "trend": "steigend/fallend/stabil"
            },
            "demand": "hoch/mittel/niedrig",
            "competition": "hoch/mittel/niedrig",
            "skillTrends": ["Trend 1", "Trend 2", ...],
            "remoteWork": "verfügbar/teilweise/nein",
            "careerProspects": "ausgezeichnet/gut/mittel",
            "topCompanies": ["Unternehmen 1", "Unternehmen 2", ...],
            "applicationTips": ["Tipp 1", "Tipp 2", ...],
            "marketInsights": "Detaillierte Marktanalyse"
        }
    `;
    
    try {
        const result = await callOpenAI(prompt);
        const parsedResult = JSON.parse(result);
        
        return {
            statusCode: 200,
            body: JSON.stringify({
                success: true,
                marketAnalysis: parsedResult
            })
        };
    } catch (error) {
        console.error('❌ Fehler bei Job-Markt-Analyse:', error);
        throw error;
    }
}

/**
 * Follow-up E-Mail generieren
 */
async function generateFollowUp(data) {
    const { company, position, applicationDate, interviewDate } = data;
    
    const prompt = `
        Generiere eine professionelle Follow-up E-Mail für:
        
        Unternehmen: ${company}
        Position: ${position}
        Bewerbungsdatum: ${applicationDate}
        Interviewdatum: ${interviewDate || 'Noch nicht geplant'}
        
        Erstelle eine E-Mail die:
        1. Professionell und höflich ist
        2. Interesse an der Position bekundet
        3. Nach dem Status fragt
        4. Zusätzliche Informationen anbietet
        5. Nächste Schritte vorschlägt
        
        Antworte im JSON-Format:
        {
            "subject": "Betreff der E-Mail",
            "body": "E-Mail Text",
            "tone": "formal/freundlich/professionell",
            "keyPoints": ["Punkt 1", "Punkt 2", ...],
            "nextSteps": ["Schritt 1", "Schritt 2", ...],
            "timing": "Wann senden"
        }
    `;
    
    try {
        const result = await callOpenAI(prompt);
        const parsedResult = JSON.parse(result);
        
        return {
            statusCode: 200,
            body: JSON.stringify({
                success: true,
                followUp: parsedResult
            })
        };
    } catch (error) {
        console.error('❌ Fehler bei Follow-up Generierung:', error);
        throw error;
    }
}

/**
 * LinkedIn-Profil optimieren
 */
async function optimizeLinkedIn(data) {
    const { currentProfile, targetPosition, industry } = data;
    
    const prompt = `
        Optimiere das LinkedIn-Profil für:
        
        Aktuelles Profil: ${currentProfile}
        Zielposition: ${targetPosition}
        Branche: ${industry}
        
        Optimiere:
        1. Headline für bessere Sichtbarkeit
        2. Zusammenfassung (About Section)
        3. Erfahrungsbeschreibungen
        4. Skills und Endorsements
        5. Empfehlungen
        6. Aktivitäten und Posts
        7. Netzwerk-Strategie
        
        Antworte im JSON-Format:
        {
            "headline": "Optimierte Headline",
            "summary": "Optimierte Zusammenfassung",
            "experienceOptimizations": [
                {
                    "position": "Position",
                    "optimizedDescription": "Optimierte Beschreibung",
                    "keywords": ["Keyword 1", "Keyword 2"]
                }
            ],
            "skills": ["Skill 1", "Skill 2", ...],
            "recommendations": ["Empfehlung 1", "Empfehlung 2", ...],
            "networkingStrategy": "Netzwerk-Strategie",
            "contentStrategy": "Content-Strategie für Posts"
        }
    `;
    
    try {
        const result = await callOpenAI(prompt);
        const parsedResult = JSON.parse(result);
        
        return {
            statusCode: 200,
            body: JSON.stringify({
                success: true,
                optimization: parsedResult
            })
        };
    } catch (error) {
        console.error('❌ Fehler bei LinkedIn-Optimierung:', error);
        throw error;
    }
}

/**
 * Dankes-E-Mail nach Interview generieren
 */
async function generateThankYouEmail(data) {
    const { interviewerName, company, position, interviewDate, keyPoints } = data;
    
    const prompt = `
        Generiere eine professionelle Dankes-E-Mail nach dem Interview:
        
        Interviewer: ${interviewerName}
        Unternehmen: ${company}
        Position: ${position}
        Interviewdatum: ${interviewDate}
        Wichtige Punkte: ${keyPoints}
        
        Die E-Mail soll:
        1. Dank für das Interview aussprechen
        2. Interesse an der Position bekunden
        3. Wichtige Punkte aus dem Interview aufgreifen
        4. Zusätzliche Informationen anbieten
        5. Nächste Schritte erwähnen
        
        Antworte im JSON-Format:
        {
            "subject": "Betreff der E-Mail",
            "body": "E-Mail Text",
            "tone": "professionell/freundlich",
            "keyPoints": ["Punkt 1", "Punkt 2", ...],
            "timing": "Wann senden (innerhalb 24h)",
            "personalization": "Personalisierungstipps"
        }
    `;
    
    try {
        const result = await callOpenAI(prompt);
        const parsedResult = JSON.parse(result);
        
        return {
            statusCode: 200,
            body: JSON.stringify({
                success: true,
                thankYouEmail: parsedResult
            })
        };
    } catch (error) {
        console.error('❌ Fehler bei Dankes-E-Mail Generierung:', error);
        throw error;
    }
}

/**
 * OpenAI API aufrufen
 */
async function callOpenAI(prompt, model = 'gpt-3.5-turbo') {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
            model: model,
            messages: [
                {
                    role: 'system',
                    content: 'Du bist ein Experte für Bewerbungen, Karriereberatung und Job-Markt-Analyse. Erstelle professionelle, datengetriebene Analysen und Empfehlungen.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            max_tokens: 3000,
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
 * CV-Optimierung in Datenbank speichern
 */
async function saveCVOptimization(data, optimization) {
    try {
        await dynamodb.put({
            TableName: 'CVOptimizations',
            Item: {
                id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                userId: data.userId,
                optimization: optimization,
                timestamp: Date.now()
            }
        }).promise();
        
        console.log('✅ CV-Optimierung gespeichert');
    } catch (error) {
        console.error('❌ Fehler beim Speichern der CV-Optimierung:', error);
    }
}
