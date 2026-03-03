/**
 * GLOBALER KI-SERVICE für alle Seiten
 * Zentraler OpenAI API Service mit verschlüsselter Key-Verwaltung
 */

class GlobalAIService {
    constructor() {
        this.apiManager = window.secureAPIManager;
        this.isReady = false;
        this.initialize();
    }

    async initialize() {
        await this.loadAPIKey();
    }
    
    async loadAPIKey() {
        try {
            console.log('🔄 GlobalAIService: Loading API Key...');
            
            // Lade API Key neu
            const apiKey = this.apiManager?.getAPIKey();
            this.apiKey = apiKey; // Speichere für direkten Zugriff
            
            if (apiKey && apiKey.startsWith('sk-')) {
                this.isReady = true;
                console.log('✅ GlobalAIService: Ready with encrypted API key');
                return true;
            } else {
                this.isReady = false;
                console.warn('⚠️ GlobalAIService: No valid API key found');
                return false;
            }
        } catch (error) {
            console.error('❌ GlobalAIService: Error loading API key:', error);
            this.isReady = false;
            return false;
        }
    }

    // Zentraler API Call für alle KI-Funktionen
    async callOpenAI(messages, options = {}) {
        const apiKey = this.apiKey || this.apiManager?.getAPIKey();
        
        if (!apiKey) {
            throw new Error('Kein API Key verfügbar. Bitte in den KI-Einstellungen konfigurieren.');
        }

        const requestOptions = {
            model: options.model || 'gpt-5.2',
            messages: messages,
            max_tokens: options.maxTokens || 500,
            temperature: options.temperature || 0.1,
            ...options.extra
        };

        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify(requestOptions)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`OpenAI API Fehler: ${errorData.error?.message || response.statusText}`);
            }

            const data = await response.json();
            return {
                content: data.choices[0].message.content,
                usage: data.usage,
                model: data.model
            };

        } catch (error) {
            console.error('GlobalAIService API Error:', error);
            throw error;
        }
    }

    // ERWEITERTE STELLENANZEIGEN ANALYSE
    async analyzeJobPosting(jobText) {
        console.log('🤖 === KI-BASIERTE STELLENANZEIGEN-ANALYSE GESTARTET ===');
        console.log('📄 Text-Länge:', jobText.length);
        console.log('📄 Text-Vorschau:', jobText.substring(0, 200) + '...');

        const messages = [{
            role: 'system',
            content: `Du bist ein Experte für HR und Stellenanzeigen-Analyse. Du extrahierst präzise und strukturiert alle relevanten Informationen aus Stellenanzeigen und kategorisierst Anforderungen intelligent nach Wichtigkeit und Art.`
        }, {
            role: 'user',
            content: `Analysiere diese Stellenanzeige und extrahiere ALLE Informationen strukturiert als JSON. Achte besonders auf eine intelligente Kategorisierung der Anforderungen:

${jobText}

Antwort NUR als valides JSON in diesem exakten Format:
{
  "company": "Exakter Firmenname",
  "position": "Genaue Stellenbezeichnung",
  "location": "Standort/Stadt",
  "contactPerson": {
    "name": "Vollständiger Name oder null",
    "email": "E-Mail oder null",
    "phone": "Telefon oder null",
    "department": "Abteilung oder null"
  },
  "employmentType": "Vollzeit/Teilzeit/Werkstudent/Praktikum/Freelance",
  "workModel": "Remote/Hybrid/Vor Ort",
  "salaryRange": "Gehaltsangabe oder null",
  "requirements": {
    "must_have": [
      {
        "text": "Vollständige Beschreibung der Anforderung",
        "category": "education/experience/technical/language/certification/soft_skills",
        "importance": "hoch/mittel/niedrig",
        "years": "Anzahl Jahre falls angegeben oder null"
      }
    ],
    "nice_to_have": [
      {
        "text": "Vollständige Beschreibung der Anforderung",
        "category": "education/experience/technical/language/certification/soft_skills",
        "importance": "hoch/mittel/niedrig"
      }
    ]
  },
  "responsibilities": [
    "Detaillierte Aufgabenbeschreibung 1",
    "Detaillierte Aufgabenbeschreibung 2"
  ],
  "benefits": [
    "Vorteil 1",
    "Vorteil 2"
  ],
  "technologies": [
    "Liste aller erwähnten Technologien, Tools, Software"
  ],
  "keywordsSummary": [
    "Die 10 wichtigsten Schlüsselwörter der Stellenanzeige"
  ]
}

WICHTIGE REGELN:
1. Extrahiere ALLE Anforderungen, auch implizite
2. Unterscheide klar zwischen "MUSS" (must_have) und "KANN" (nice_to_have) Anforderungen
3. Kategorisiere jede Anforderung präzise
4. Extrahiere alle Jahreszahlen für Berufserfahrung
5. Finde alle Technologien und Tools
6. Null-Werte für nicht gefundene Informationen
7. Deutsche Umlaute korrekt verwenden`
        }];

        try {
            console.log('🤖 Sende Anfrage an OpenAI...');
            const result = await this.callOpenAI(messages, { 
                maxTokens: 2000,
                temperature: 0.1 // Niedrige Temperatur für konsistente Ergebnisse
            });
            
            console.log('🤖 OpenAI Antwort erhalten:', result.content.substring(0, 300) + '...');
            
            // Parse JSON response
            let parsedResult;
            try {
                parsedResult = JSON.parse(result.content);
                console.log('✅ JSON erfolgreich geparst:', parsedResult);
                
                // Validate structure
                if (!parsedResult.requirements || !parsedResult.requirements.must_have) {
                    throw new Error('Unvollständige JSON-Struktur: requirements.must_have fehlt');
                }
                
                // Transform to old format for compatibility
                const compatibleResult = this.transformToCompatibleFormat(parsedResult);
                console.log('🔄 Kompatibles Format erstellt:', compatibleResult);
                
                return compatibleResult;
                
            } catch (parseError) {
                console.error('❌ JSON Parse Fehler:', parseError);
                console.log('📄 Rohe Antwort:', result.content);
                
                // Fallback: Versuche JSON aus der Antwort zu extrahieren
                const jsonMatch = result.content.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    try {
                        parsedResult = JSON.parse(jsonMatch[0]);
                        return this.transformToCompatibleFormat(parsedResult);
                    } catch (secondParseError) {
                        console.error('❌ Zweiter Parse-Versuch fehlgeschlagen:', secondParseError);
                    }
                }
                
                throw new Error(`JSON Parse Fehler: ${parseError.message}`);
            }
            
        } catch (error) {
            console.error('❌ KI-Analyse fehlgeschlagen:', error);
            throw new Error(`Stellenanzeigen-Analyse fehlgeschlagen: ${error.message}`);
        }
    }

    // Transformiert das neue detaillierte Format in das kompatible Format
    transformToCompatibleFormat(detailedResult) {
        console.log('🔄 Transformiere KI-Ergebnis in kompatibles Format...');
        
        // Kombiniere must_have und nice_to_have requirements
        const allRequirements = [
            ...(detailedResult.requirements.must_have || []).map(req => ({
                id: `req-must-${Math.random().toString(36).substr(2, 9)}`,
                text: req.text,
                importance: req.importance === 'hoch' ? 0.9 : req.importance === 'mittel' ? 0.7 : 0.5,
                type: req.category,
                keywords: this.extractKeywordsFromText(req.text),
                isRequired: true,
                category: req.category,
                years: req.years,
                priority: req.importance,
                matchingSuggestions: []
            })),
            ...(detailedResult.requirements.nice_to_have || []).map(req => ({
                id: `req-nice-${Math.random().toString(36).substr(2, 9)}`,
                text: req.text,
                importance: req.importance === 'hoch' ? 0.6 : req.importance === 'mittel' ? 0.4 : 0.3,
                type: req.category,
                keywords: this.extractKeywordsFromText(req.text),
                isRequired: false,
                category: req.category,
                priority: req.importance,
                matchingSuggestions: []
            }))
        ];

        // Sortiere nach Wichtigkeit
        allRequirements.sort((a, b) => b.importance - a.importance);

        const compatibleResult = {
            // Kompatible Felder für alte Systeme
            company: detailedResult.company,
            position: detailedResult.position,
            location: detailedResult.location,
            requirements: allRequirements,
            contactPerson: detailedResult.contactPerson,
            employmentType: detailedResult.employmentType,
            workModel: detailedResult.workModel,
            
            // Zusätzliche detaillierte Informationen
            salaryRange: detailedResult.salaryRange,
            responsibilities: detailedResult.responsibilities || [],
            benefits: detailedResult.benefits || [],
            technologies: detailedResult.technologies || [],
            keywordsSummary: detailedResult.keywordsSummary || [],
            
            // Meta-Informationen
            aiAnalysis: {
                totalRequirements: allRequirements.length,
                mustHaveCount: detailedResult.requirements.must_have?.length || 0,
                niceToHaveCount: detailedResult.requirements.nice_to_have?.length || 0,
                analyzedAt: new Date().toISOString()
            }
        };

        console.log('✅ Transformation abgeschlossen:', {
            totalRequirements: compatibleResult.requirements.length,
            mustHave: compatibleResult.aiAnalysis.mustHaveCount,
            niceToHave: compatibleResult.aiAnalysis.niceToHaveCount
        });

        return compatibleResult;
    }

    // Hilfsfunktion: Extrahiert Keywords aus Text
    extractKeywordsFromText(text) {
        const stopWords = ['der', 'die', 'das', 'und', 'oder', 'aber', 'in', 'mit', 'von', 'zu', 'für', 'auf', 'an', 'bei'];
        return text.toLowerCase()
            .replace(/[.,!?;:]/g, '')
            .split(/\s+/)
            .filter(word => word.length > 3 && !stopWords.includes(word))
            .slice(0, 5); // Limitiere auf 5 Keywords pro Anforderung
    }

    // ANSCHREIBEN GENERIERUNG
    async generateCoverLetter(jobInfo, userProfile, requirements) {
        const messages = [{
            role: 'user',
            content: `Erstelle ein professionelles Anschreiben basierend auf:

STELLENANZEIGE:
Firma: ${jobInfo.company}
Position: ${jobInfo.position}
Anforderungen: ${requirements.join(', ')}

USER PROFIL:
${userProfile}

Erstelle ein deutsches Anschreiben mit:
- Persönlicher Ansprache
- Bezug zu wichtigsten Anforderungen
- Professionellem Ton
- 250-300 Wörter`
        }];

        try {
            const result = await this.callOpenAI(messages, { maxTokens: 600 });
            return result.content;
        } catch (error) {
            console.error('Cover letter generation failed:', error);
            throw new Error(`Anschreiben-Generierung fehlgeschlagen: ${error.message}`);
        }
    }

    // TEXT VERBESSERUNG
    async improveText(text, instructions = 'Verbessere diesen Text') {
        const messages = [{
            role: 'user',
            content: `${instructions}:

${text}`
        }];

        try {
            const result = await this.callOpenAI(messages, { maxTokens: 800 });
            return result.content;
        } catch (error) {
            console.error('Text improvement failed:', error);
            throw new Error(`Text-Verbesserung fehlgeschlagen: ${error.message}`);
        }
    }

    // STATUS CHECK
    isAPIReady() {
        const hasKey = this.apiKey || this.apiManager?.getAPIKey();
        return this.isReady && hasKey && hasKey.startsWith('sk-');
    }

    getAPIStatus() {
        if (!this.apiManager) {
            return { status: 'error', message: 'SecureAPIManager nicht verfügbar' };
        }
        
        return this.apiManager.getKeyStatus();
    }

    // QUICK TEST
    async quickTest() {
        try {
            const result = await this.callOpenAI([{
                role: 'user',
                content: 'Antworte nur mit: OK'
            }], { maxTokens: 5 });
            
            return result.content.includes('OK');
        } catch (error) {
            return false;
        }
    }
}

// Global verfügbar machen
window.globalAI = new GlobalAIService();

// Für andere Seiten
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GlobalAIService;
}
