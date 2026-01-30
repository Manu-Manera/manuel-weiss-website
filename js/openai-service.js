/**
 * ═══════════════════════════════════════════════════════════════════════════
 * OPENAI SERVICE - Zentrale OpenAI API Integration
 * Verwendet GPT-5.2 mit der neuen Responses API
 * Holt API-Key aus Admin Panel (AWS Cloud oder localStorage)
 * ═══════════════════════════════════════════════════════════════════════════
 */

class OpenAIService {
    constructor() {
        // Liste der Modelle zum Ausprobieren (in Prioritätsreihenfolge)
        // WICHTIG: gpt-5.2 wird von diesem Projekt unterstützt (Projekt-spezifischer Zugang)
        this.modelFallbacks = [
            'gpt-5.2',          // Projekt-spezifisches Modell (höchste Priorität!)
            'gpt-4o-mini',      // Günstig und schnell
            'gpt-4o',           // Leistungsstark
            'gpt-4-turbo',      // Sehr leistungsstark
            'gpt-4',            // Standard GPT-4
            'gpt-3.5-turbo',    // Klassisches Modell
            'gpt-3.5-turbo-16k' // Mit langem Kontext
        ];
        this.model = this.modelFallbacks[0]; // Startet mit gpt-5.2
        this.workingModel = null; // Wird gesetzt sobald ein Modell funktioniert
        this.apiEndpoint = 'https://api.openai.com/v1/chat/completions';
        this.cachedApiKey = null;
        this.keyLoadPromise = null;
        
        console.log('🤖 OpenAI Service initialisiert (gpt-5.2 + Fallback-Modelle)');
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
     * OpenAI Chat Completions API Call
     * ═══════════════════════════════════════════════════════════════════════
     */
    async callGPT52(input, options = {}) {
        return await this.callChatCompletions(input, options);
    }
    
    /**
     * Chat Completions API - Standard OpenAI API mit Modell-Fallback
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
        
        // Wenn bereits ein funktionierendes Modell gefunden wurde, dieses verwenden
        const modelsToTry = this.workingModel 
            ? [this.workingModel] 
            : [...this.modelFallbacks];
        
        let lastError = null;
        
        for (const model of modelsToTry) {
            // gpt-5.2 verwendet andere Parameter als Standard-Modelle
            const isGPT52 = model === 'gpt-5.2';
            
            const requestBody = {
                model: model,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: input }
                ]
            };
            
            // Parameter je nach Modell setzen
            if (isGPT52) {
                // GPT-5.2 verwendet reasoning_effort und max_completion_tokens
                requestBody.reasoning_effort = 'low';
                requestBody.max_completion_tokens = maxOutputTokens;
            } else {
                // Standard-Modelle verwenden temperature und max_tokens
                requestBody.max_tokens = maxOutputTokens;
                requestBody.temperature = 0.3;
            }
            
            console.log('🚀 OpenAI API Call:', { model, isGPT52 });
            
            try {
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
                    console.log(`✅ Chat Completions API erfolgreich mit Modell: ${model}`);
                    
                    // Merke das funktionierende Modell für zukünftige Aufrufe
                    this.workingModel = model;
                    this.model = model;
                    
                    return data.choices[0]?.message?.content || '';
                }
                
                // Prüfe ob es ein Modell-Zugriffs-Fehler ist (403/404)
                if (response.status === 403 || response.status === 404) {
                    const errorText = await response.text();
                    if (errorText.includes('does not have access') || errorText.includes('model_not_found')) {
                        console.warn(`⚠️ Modell ${model} nicht verfügbar, versuche nächstes...`);
                        lastError = new Error(`Modell ${model} nicht zugänglich`);
                        continue; // Versuche nächstes Modell
                    }
                }
                
                // Anderer Fehler - wirf Exception
                const errorText = await response.text();
                console.error('❌ Chat Completions API Fehler:', response.status, errorText);
                throw new Error(`OpenAI API Fehler: ${response.status}`);
                
            } catch (fetchError) {
                // Netzwerkfehler oder andere Exceptions
                if (fetchError.message?.includes('API Fehler')) {
                    throw fetchError;
                }
                console.warn(`⚠️ Fehler mit Modell ${model}:`, fetchError.message);
                lastError = fetchError;
            }
        }
        
        // Kein Modell hat funktioniert
        console.error('❌ Alle Modelle fehlgeschlagen');
        throw new Error(lastError?.message || 'Kein OpenAI-Modell verfügbar. Bitte API-Key Berechtigungen im OpenAI Dashboard prüfen.');
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
     * KI-basierter Qualitätscheck mit konkreten Verbesserungsvorschlägen
     */
    async analyzeQuality(data) {
        const { coverLetterText, jobDescription, position, company } = data;
        
        if (!coverLetterText || coverLetterText.trim().length < 50) {
            return { tips: [], score: 0, summary: 'Kein Anschreiben vorhanden' };
        }
        
        const prompt = `Analysiere dieses Bewerbungsanschreiben und gib konkrete, umsetzbare Verbesserungsvorschläge:

ANSCHREIBEN:
"""
${coverLetterText}
"""

STELLENBESCHREIBUNG:
"""
${jobDescription || 'Nicht verfügbar'}
"""

POSITION: ${position || 'Nicht angegeben'}
UNTERNEHMEN: ${company || 'Nicht angegeben'}

ANALYSE-AUFGABE:
1. Bewerte das Anschreiben auf einer Skala von 0-100
2. Identifiziere die TOP 5 wichtigsten Verbesserungsmöglichkeiten
3. Gib für jeden Punkt einen konkreten Verbesserungsvorschlag mit Textbeispiel
4. Prüfe: Keyword-Match, Spezifität, messbare Erfolge, Persönlichkeit, Länge

Antworte NUR mit JSON:
{
  "score": 75,
  "summary": "Kurze Zusammenfassung der Qualität (1 Satz)",
  "tips": [
    {
      "type": "warning|success|info",
      "category": "keywords|specificity|achievements|personality|length|structure",
      "title": "Kurzer Titel",
      "description": "Beschreibung des Problems",
      "suggestion": "Konkreter Verbesserungsvorschlag oder Textbeispiel zum Einfügen",
      "priority": 1-5
    }
  ]
}`;

        try {
            const response = await this.callGPT52(prompt, {
                systemPrompt: 'Du bist ein erfahrener Bewerbungscoach. Gib konstruktives, hilfreiches Feedback zu Bewerbungsanschreiben. Sei konkret und gib umsetzbare Tipps.',
                maxOutputTokens: 1500
            });
            
            // Parse JSON
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const result = JSON.parse(jsonMatch[0]);
                console.log('✅ KI-Qualitätscheck abgeschlossen:', result.score, 'Punkte,', result.tips?.length, 'Tipps');
                return result;
            }
            
            return { tips: [], score: 50, summary: 'Analyse konnte nicht verarbeitet werden' };
        } catch (error) {
            console.error('❌ KI-Qualitätscheck fehlgeschlagen:', error);
            return { tips: [], score: 0, summary: 'Fehler bei der Analyse' };
        }
    }
    
    /**
     * Absatz verbessern / Alternative generieren
     */
    async improveParagraph(data) {
        const { paragraph, context, type = 'improve' } = data;
        
        const typeInstructions = {
            improve: 'Verbessere diesen Absatz: professioneller, überzeugender, mit mehr Substanz',
            shorter: 'Kürze diesen Absatz auf ca. 50% der Länge, behalte die wichtigsten Punkte',
            stronger: 'Mache diesen Absatz stärker: mehr Aktionsverben, messbare Erfolge, überzeugendere Sprache',
            alternatives: 'Schreibe 3 alternative Versionen dieses Absatzes mit unterschiedlichen Ansätzen'
        };
        
        const prompt = `${typeInstructions[type] || typeInstructions.improve}

ABSATZ:
"""
${paragraph}
"""

${context ? `KONTEXT: ${context}` : ''}

${type === 'alternatives' ? 'Antworte mit JSON: {"alternatives": ["...", "...", "..."]}' : 'Antworte NUR mit dem verbesserten Text, keine Erklärungen.'}`;

        try {
            const response = await this.callGPT52(prompt, {
                systemPrompt: 'Du bist ein professioneller Texter für Bewerbungen. Schreibe überzeugend, professionell und authentisch.',
                maxOutputTokens: 800
            });
            
            if (type === 'alternatives') {
                const jsonMatch = response.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    return JSON.parse(jsonMatch[0]).alternatives || [response];
                }
                return [response];
            }
            
            return response.trim();
        } catch (error) {
            console.error('❌ Absatz-Verbesserung fehlgeschlagen:', error);
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
