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
        try {
            // Lade API Key
            const apiKey = this.apiManager?.getAPIKey();
            if (apiKey && apiKey.startsWith('sk-')) {
                this.isReady = true;
                console.log('🤖 GlobalAIService: Ready with encrypted API key');
            }
        } catch (error) {
            console.warn('🤖 GlobalAIService: No API key available');
        }
    }

    // Zentraler API Call für alle KI-Funktionen
    async callOpenAI(messages, options = {}) {
        const apiKey = this.apiManager?.getAPIKey();
        
        if (!apiKey) {
            throw new Error('Kein API Key verfügbar. Bitte in den KI-Einstellungen konfigurieren.');
        }

        const requestOptions = {
            model: options.model || 'gpt-4o-mini',
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

    // STELLENANZEIGEN ANALYSE
    async analyzeJobPosting(jobText) {
        const messages = [{
            role: 'user',
            content: `Analysiere diese Stellenanzeige und extrahiere Informationen als JSON:

${jobText}

Antwort NUR als JSON:
{
  "company": "Firmenname",
  "position": "Stellenbezeichnung",
  "location": "Standort",
  "requirements": ["Anforderung 1", "Anforderung 2", "Anforderung 3"],
  "contactPerson": {"name": "Name", "email": "email@domain.com"},
  "employmentType": "Vollzeit/Teilzeit",
  "workModel": "Remote/Hybrid/Vor Ort"
}`
        }];

        try {
            const result = await this.callOpenAI(messages, { maxTokens: 800 });
            return JSON.parse(result.content);
        } catch (error) {
            console.error('Job analysis failed:', error);
            throw new Error(`Stellenanzeigen-Analyse fehlgeschlagen: ${error.message}`);
        }
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
        return this.isReady && this.apiManager?.getAPIKey();
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
