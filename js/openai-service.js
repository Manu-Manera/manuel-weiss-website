/**
 * ═══════════════════════════════════════════════════════════════════════════
 * OPENAI SERVICE - Zentrale OpenAI API Integration
 * Verwendet GPT-5.2 mit der neuen Responses API
 * Holt API-Key aus Admin Panel (AWS Cloud oder localStorage)
 * ═══════════════════════════════════════════════════════════════════════════
 */

class OpenAIService {
    constructor() {
        this.model = 'gpt-5.2';
        this.fallbackModel = 'gpt-4o-mini';
        this.apiEndpoint = 'https://api.openai.com/v1/responses';
        this.fallbackEndpoint = 'https://api.openai.com/v1/chat/completions';
        this.cachedApiKey = null;
        this.keyLoadPromise = null;
        
        console.log('🤖 OpenAI Service initialisiert');
    }
    
    /**
     * Prüft ob ein Key gültig ist (nicht maskiert, beginnt mit sk-)
     */
    isValidKey(key) {
        return key && 
               typeof key === 'string' && 
               key.startsWith('sk-') && 
               key.length > 20 &&
               !key.includes('•') &&
               !key.includes('...') &&
               !key.includes('***');
    }
    
    /**
     * ═══════════════════════════════════════════════════════════════════════
     * API-Key laden - ASYNC VERSION für AWS Cloud Support
     * ═══════════════════════════════════════════════════════════════════════
     */
    async getApiKeyAsync() {
        // Cache prüfen
        if (this.cachedApiKey && this.isValidKey(this.cachedApiKey)) {
            return this.cachedApiKey;
        }
        
        // Verhindere mehrfache parallele Aufrufe
        if (this.keyLoadPromise) {
            return this.keyLoadPromise;
        }
        
        this.keyLoadPromise = this._loadApiKey();
        const key = await this.keyLoadPromise;
        this.keyLoadPromise = null;
        return key;
    }
    
    async _loadApiKey() {
        console.log('🔑 Suche OpenAI API-Key...');
        
        // ═══════════════════════════════════════════════════════════════════
        // QUELLE 1: awsAPISettings (AWS Cloud - höchste Priorität für eingeloggte User)
        // ═══════════════════════════════════════════════════════════════════
        try {
            if (window.awsAPISettings && typeof window.awsAPISettings.getFullApiKey === 'function') {
                console.log('🔍 Versuche AWS Cloud (awsAPISettings)...');
                const key = await window.awsAPISettings.getFullApiKey('openai');
                if (this.isValidKey(key)) {
                    console.log('✅ API-Key aus AWS Cloud geladen');
                    this.cachedApiKey = key;
                    return key;
                }
            }
        } catch (e) {
            console.log('ℹ️ AWS Cloud nicht verfügbar:', e.message);
        }
        
        // ═══════════════════════════════════════════════════════════════════
        // QUELLE 2: GlobalAPIManager Instanz (vom Admin Panel gesetzt)
        // ═══════════════════════════════════════════════════════════════════
        try {
            const apiManager = window.GlobalAPIManager || window.globalApiManager || window.APIManager;
            if (apiManager) {
                // Methode getAPIKey
                if (typeof apiManager.getAPIKey === 'function') {
                    const key = apiManager.getAPIKey('openai');
                    if (this.isValidKey(key)) {
                        console.log('✅ API-Key über GlobalAPIManager.getAPIKey() geladen');
                        this.cachedApiKey = key;
                        return key;
                    }
                }
                // Direkter Zugriff auf keys
                const directKey = apiManager.keys?.openai?.key;
                if (this.isValidKey(directKey)) {
                    console.log('✅ API-Key über GlobalAPIManager.keys geladen');
                    this.cachedApiKey = directKey;
                    return directKey;
                }
            }
        } catch (e) {
            console.log('ℹ️ GlobalAPIManager nicht verfügbar:', e.message);
        }
        
        // ═══════════════════════════════════════════════════════════════════
        // QUELLE 3: global_api_keys in localStorage
        // ═══════════════════════════════════════════════════════════════════
        try {
            const globalKeysRaw = localStorage.getItem('global_api_keys');
            if (globalKeysRaw) {
                const globalKeys = JSON.parse(globalKeysRaw);
                const possiblePaths = [
                    globalKeys?.openai?.key,
                    globalKeys?.openai?.apiKey,
                    typeof globalKeys?.openai === 'string' ? globalKeys.openai : null
                ];
                for (const key of possiblePaths) {
                    if (this.isValidKey(key)) {
                        console.log('✅ API-Key aus global_api_keys geladen');
                        this.cachedApiKey = key;
                        return key;
                    }
                }
            }
        } catch (e) {
            console.log('ℹ️ global_api_keys nicht verfügbar:', e.message);
        }
        
        // ═══════════════════════════════════════════════════════════════════
        // QUELLE 4: admin_state (State Manager)
        // ═══════════════════════════════════════════════════════════════════
        try {
            const stateRaw = localStorage.getItem('admin_state');
            if (stateRaw) {
                const state = JSON.parse(stateRaw);
                const possiblePaths = [
                    state?.apiKeys?.openai?.apiKey,
                    state?.apiKeys?.openai?.key,
                    state?.services?.openai?.apiKey,
                    state?.services?.openai?.key
                ];
                for (const key of possiblePaths) {
                    if (this.isValidKey(key)) {
                        console.log('✅ API-Key aus admin_state geladen');
                        this.cachedApiKey = key;
                        return key;
                    }
                }
            }
        } catch (e) {
            console.log('ℹ️ admin_state nicht verfügbar:', e.message);
        }
        
        // ═══════════════════════════════════════════════════════════════════
        // QUELLE 5: Direkte localStorage Keys
        // ═══════════════════════════════════════════════════════════════════
        const directKeys = ['openai_api_key', 'admin_openai_api_key', 'openai-key'];
        for (const keyName of directKeys) {
            try {
                const value = localStorage.getItem(keyName);
                if (this.isValidKey(value)) {
                    console.log(`✅ API-Key aus localStorage['${keyName}'] geladen`);
                    this.cachedApiKey = value;
                    return value;
                }
            } catch (e) {}
        }
        
        console.error('❌ Kein gültiger OpenAI API-Key gefunden!');
        console.log('📋 Verfügbare localStorage Keys:', Object.keys(localStorage).filter(k => 
            k.toLowerCase().includes('api') || k.toLowerCase().includes('key') || k.toLowerCase().includes('openai')
        ));
        return null;
    }
    
    /**
     * Synchrone Version (verwendet Cache oder gibt null zurück)
     */
    getApiKey() {
        if (this.cachedApiKey && this.isValidKey(this.cachedApiKey)) {
            return this.cachedApiKey;
        }
        
        // Starte async Laden im Hintergrund
        this.getApiKeyAsync().catch(e => console.error('API Key Load Error:', e));
        
        return this.cachedApiKey;
    }
    
    /**
     * Cache löschen (z.B. wenn Key im Admin Panel geändert wird)
     */
    clearCache() {
        this.cachedApiKey = null;
        console.log('🔄 OpenAI Service Cache geleert');
    }
    
    /**
     * ═══════════════════════════════════════════════════════════════════════
     * GPT-5.2 Responses API Call
     * ═══════════════════════════════════════════════════════════════════════
     */
    async callGPT52(input, options = {}) {
        // Async API-Key Laden (unterstützt AWS Cloud)
        const apiKey = await this.getApiKeyAsync();
        if (!apiKey) {
            throw new Error('Kein OpenAI API-Key konfiguriert. Bitte im Admin Panel hinterlegen.');
        }
        
        const {
            systemPrompt = null,
            reasoningEffort = 'none',  // none, low, medium, high, xhigh
            verbosity = 'medium',       // low, medium, high
            maxOutputTokens = 2000
        } = options;
        
        // Request Body für GPT-5.2 Responses API
        const requestBody = {
            model: this.model,
            input: systemPrompt ? `${systemPrompt}\n\n${input}` : input,
            reasoning: {
                effort: reasoningEffort
            },
            text: {
                verbosity: verbosity
            },
            max_output_tokens: maxOutputTokens
        };
        
        console.log('🚀 GPT-5.2 API Call:', { model: this.model, reasoningEffort, verbosity });
        
        try {
            // Versuche zuerst die neue Responses API
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify(requestBody)
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log('✅ GPT-5.2 Responses API erfolgreich');
                return this.extractResponseText(data);
            }
            
            // Fallback auf Chat Completions API
            console.log('⚠️ Responses API nicht verfügbar, Fallback auf Chat Completions...');
            return await this.callChatCompletions(input, options, apiKey);
            
        } catch (error) {
            console.error('❌ GPT-5.2 API Fehler:', error);
            // Fallback versuchen
            return await this.callChatCompletions(input, options, apiKey);
        }
    }
    
    /**
     * Fallback: Chat Completions API (für ältere Modelle / Kompatibilität)
     */
    async callChatCompletions(input, options = {}, apiKey = null) {
        apiKey = apiKey || await this.getApiKeyAsync();
        if (!apiKey) {
            throw new Error('Kein OpenAI API-Key konfiguriert.');
        }
        
        const {
            systemPrompt = 'Du bist ein hilfreicher Assistent.',
            maxOutputTokens = 2000
        } = options;
        
        const requestBody = {
            model: 'gpt-4o-mini',  // Fallback Modell
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: input }
            ],
            max_tokens: maxOutputTokens,
            temperature: 0.3
        };
        
        console.log('🔄 Chat Completions API Fallback...');
        
        const response = await fetch(this.fallbackEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Chat Completions API Fehler:', response.status, errorText);
            throw new Error(`OpenAI API Fehler: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('✅ Chat Completions API erfolgreich');
        return data.choices[0]?.message?.content || '';
    }
    
    /**
     * Response Text aus GPT-5.2 Responses API extrahieren
     */
    extractResponseText(data) {
        // GPT-5.2 Responses API Format
        if (data.output) {
            if (typeof data.output === 'string') {
                return data.output;
            }
            if (Array.isArray(data.output)) {
                return data.output.map(item => item.text || item.content || '').join('\n');
            }
            if (data.output.text) {
                return data.output.text;
            }
        }
        // Fallback für andere Formate
        if (data.choices && data.choices[0]) {
            return data.choices[0].message?.content || data.choices[0].text || '';
        }
        return JSON.stringify(data);
    }
    
    /**
     * ═══════════════════════════════════════════════════════════════════════
     * SPEZIFISCHE METHODEN FÜR ANWENDUNGSFÄLLE
     * ═══════════════════════════════════════════════════════════════════════
     */
    
    /**
     * Stelleninformationen aus Beschreibung extrahieren
     */
    async extractJobInfo(jobDescription) {
        if (!jobDescription || jobDescription.length < 30) {
            return { position: null, company: null, contactPerson: null };
        }
        
        const prompt = `Analysiere diese Stellenbeschreibung und extrahiere präzise:

1. Position/Job-Titel (exakter Titel wie "Senior Consultant", "HR Manager")
2. Unternehmen/Firmenname (exakter Name wie "ITConcepts GmbH", "SAP AG")
3. Ansprechpartner (Name der Kontaktperson, z.B. "Claudio Manig")

WICHTIG: 
- Bei E-Mails wie "claudio.manig@itconcepts.ch" ist der Ansprechpartner "Claudio Manig" und das Unternehmen "ITConcepts"
- Extrahiere NUR tatsächlich genannte Informationen
- Verwende null für nicht gefundene Werte

Antworte NUR mit validem JSON (ohne Markdown):
{"position": "...", "company": "...", "contactPerson": "..."}

Stellenbeschreibung:
${jobDescription.substring(0, 3000)}`;

        try {
            const response = await this.callGPT52(prompt, {
                systemPrompt: 'Du bist ein Experte für Stellenanalysen. Extrahiere präzise Informationen. Antworte NUR mit validem JSON.',
                reasoningEffort: 'low',
                verbosity: 'low',
                maxOutputTokens: 300
            });
            
            // JSON extrahieren
            const jsonMatch = response.match(/\{[\s\S]*?\}/);
            if (jsonMatch) {
                const extracted = JSON.parse(jsonMatch[0]);
                console.log('✅ Job-Info extrahiert:', extracted);
                return {
                    position: extracted.position !== 'null' ? extracted.position : null,
                    company: extracted.company !== 'null' ? extracted.company : null,
                    contactPerson: extracted.contactPerson !== 'null' ? extracted.contactPerson : null
                };
            }
        } catch (error) {
            console.error('❌ Job-Info Extraktion fehlgeschlagen:', error);
        }
        
        return { position: null, company: null, contactPerson: null };
    }
    
    /**
     * Anschreiben generieren
     */
    async generateCoverLetter(data) {
        const { jobTitle, companyName, jobDescription, resumeData, options = {} } = data;
        
        const prompt = `Erstelle ein professionelles Bewerbungsanschreiben für folgende Position:

POSITION: ${jobTitle}
UNTERNEHMEN: ${companyName}

STELLENBESCHREIBUNG:
${jobDescription?.substring(0, 2000) || 'Keine Beschreibung verfügbar'}

BEWERBER-PROFIL:
${resumeData ? JSON.stringify(resumeData, null, 2) : 'Keine Profildaten verfügbar'}

ANFORDERUNGEN AN DAS ANSCHREIBEN:
- Professioneller, moderner Ton
- Auf die Stelle zugeschnitten
- Stärken und Erfahrungen hervorheben
- Max. 1 Seite

Erstelle NUR den Fließtext des Anschreibens (ohne Anrede und Grußformel).`;

        return await this.callGPT52(prompt, {
            systemPrompt: 'Du bist ein erfahrener HR-Berater und Bewerbungsexperte. Erstelle überzeugende, professionelle Bewerbungsanschreiben.',
            reasoningEffort: 'medium',
            verbosity: 'medium',
            maxOutputTokens: 1500
        });
    }
    
    /**
     * Skill-Gap Analyse durchführen
     */
    async analyzeSkillGap(data) {
        const { currentSkills, targetRole, jobRequirements } = data;
        
        const prompt = `Führe eine Skill-Gap-Analyse durch:

AKTUELLE FÄHIGKEITEN:
${JSON.stringify(currentSkills, null, 2)}

ZIELPOSITION: ${targetRole}

STELLENANFORDERUNGEN:
${jobRequirements || 'Keine spezifischen Anforderungen angegeben'}

Analysiere:
1. Welche Skills sind bereits vorhanden und auf welchem Level?
2. Welche Skills fehlen für die Zielposition?
3. Welche Lernpfade werden empfohlen?
4. Geschätzte Zeit bis zur Zielerreichung?

Antworte mit strukturiertem JSON:
{
  "matchingSkills": [{"skill": "...", "level": "...", "match": "..."}],
  "missingSkills": [{"skill": "...", "priority": "...", "learningPath": "..."}],
  "recommendations": ["..."],
  "estimatedTimeToTarget": "..."
}`;

        try {
            const response = await this.callGPT52(prompt, {
                systemPrompt: 'Du bist ein Karriereberater und Experte für Kompetenzentwicklung. Erstelle detaillierte Skill-Gap-Analysen.',
                reasoningEffort: 'medium',
                verbosity: 'high',
                maxOutputTokens: 2000
            });
            
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            return { error: 'Keine strukturierte Antwort erhalten', rawResponse: response };
        } catch (error) {
            console.error('❌ Skill-Gap Analyse fehlgeschlagen:', error);
            throw error;
        }
    }
    
    /**
     * Prüfen ob API-Key verfügbar ist (synchron - Cache-basiert)
     */
    hasApiKey() {
        return this.cachedApiKey && this.isValidKey(this.cachedApiKey);
    }
    
    /**
     * Prüfen ob API-Key verfügbar ist (async - lädt aus AWS wenn nötig)
     */
    async hasApiKeyAsync() {
        const key = await this.getApiKeyAsync();
        return !!key;
    }
}

// Globale Instanz erstellen
window.OpenAIService = new OpenAIService();

// Event Listener für API-Key Änderungen im Admin Panel
window.addEventListener('storage', (e) => {
    if (e.key === 'global_api_keys' || e.key === 'admin_state') {
        console.log('🔄 API-Key geändert, Cache wird geleert...');
        window.OpenAIService?.clearCache();
    }
});

// Vorladen des API-Keys beim Seitenstart
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const key = await window.OpenAIService.getApiKeyAsync();
        if (key) {
            console.log('✅ OpenAI API-Key vorgeladen');
        } else {
            console.log('ℹ️ Kein OpenAI API-Key konfiguriert');
        }
    } catch (e) {
        console.log('ℹ️ API-Key Vorladung übersprungen:', e.message);
    }
});

console.log('✅ OpenAI Service global verfügbar als window.OpenAIService');
