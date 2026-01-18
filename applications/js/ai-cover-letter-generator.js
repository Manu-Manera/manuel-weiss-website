/**
 * AI COVER LETTER GENERATOR - JAVASCRIPT
 * Handles AI-powered cover letter generation using GPT-3.5 Turbo
 */

class AICoverLetterGenerator {
    constructor() {
        this.applicationsCore = null;
        this.isGenerating = false;
        this.generatedContent = null;
        this.templates = {
            'formal': this.getFormalTemplate(),
            'modern-it': this.getModernITTemplate(),
            'creative-marketing': this.getCreativeMarketingTemplate()
        };
        this.contextMenu = null;
        this.alternativesModal = null;
        this.selectedText = '';
        this.selectedRange = null;
        this.init();
    }

    async init() {
        console.log('🤖 Initializing AI Cover Letter Generator...');
        
        // Wait for applications core
        await this.waitForApplicationsCore();
        
        // Setup event handlers
        this.setupEventHandlers();
        
        // Create context menu and modal
        this.createContextMenu();
        this.createAlternativesModal();
        
        // Load existing data
        this.loadExistingData();
        
        // Check for existing API key
        this.checkAPIKey();
        
        console.log('✅ AI Cover Letter Generator initialized');
    }

    async waitForApplicationsCore() {
        return new Promise((resolve) => {
            const checkCore = () => {
                if (window.applicationsCore && window.applicationsCore.isInitialized) {
                    this.applicationsCore = window.applicationsCore;
                    resolve();
                } else {
                    setTimeout(checkCore, 100);
                }
            };
            checkCore();
        });
    }

    setupEventHandlers() {
        // Generate button
        document.getElementById('generateBtn').addEventListener('click', () => {
            this.generateCoverLetter();
        });

        // Regenerate button
        document.getElementById('regenerateBtn').addEventListener('click', () => {
            this.generateCoverLetter();
        });

        // Save button
        document.getElementById('saveBtn').addEventListener('click', () => {
            this.saveCoverLetter();
        });

        // Download button
        document.getElementById('downloadBtn').addEventListener('click', () => {
            this.downloadCoverLetter();
        });

        // Text area changes
        document.getElementById('generatedText').addEventListener('input', () => {
            this.updateStats();
        });

        // Form validation
        document.getElementById('jobInfoForm').addEventListener('input', () => {
            this.validateForm();
        });
        
        // Context menu for text selection
        document.getElementById('generatedText').addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.handleContextMenu(e);
        });
        
        // Hide context menu on click outside
        document.addEventListener('click', (e) => {
            if (this.contextMenu && !this.contextMenu.contains(e.target)) {
                this.contextMenu.style.display = 'none';
            }
        });
        
        // Text selection handler
        document.getElementById('generatedText').addEventListener('mouseup', () => {
            const selection = window.getSelection();
            if (selection.toString().trim()) {
                this.selectedText = selection.toString();
                // Save the selection range for later replacement
                const range = selection.getRangeAt(0);
                this.selectedRange = {
                    start: document.getElementById('generatedText').selectionStart,
                    end: document.getElementById('generatedText').selectionEnd
                };
            }
        });
    }

    loadExistingData() {
        // Load profile data for context
        const profileData = this.applicationsCore.getProfileData();
        if (profileData) {
            console.log('📋 Profile data loaded for context');
        }
    }

    async generateCoverLetter() {
        if (this.isGenerating) return;
        
        console.log('🚀 Starting cover letter generation...');
        
        // Validate form
        if (!this.validateForm()) {
            this.showNotification('Bitte füllen Sie alle Pflichtfelder aus', 'error');
            return;
        }
        
        this.isGenerating = true;
        this.showLoading();
        
        try {
            // Collect form data
            const jobData = this.collectJobData();
            const profileData = this.applicationsCore.getProfileData() || {};
            const options = this.collectOptions();
            
            // Wähle verfügbaren KI-Provider (OpenAI > Google > Template)
            const provider = await this.getActiveAIProvider();
            let coverLetter;
            
            if (provider) {
                if (provider.type === 'openai') {
                    coverLetter = await this.callOpenAI(jobData, profileData, options, provider);
                } else if (provider.type === 'google') {
                    coverLetter = await this.callGoogleAI(jobData, profileData, options, provider);
                } else if (provider.type === 'anthropic') {
                    coverLetter = await this.callAnthropic(jobData, profileData, options, provider);
                } else {
                    throw new Error(`Unbekannter Provider: ${provider.type}`);
                }
            } else {
                this.showNotification('Keine KI-Konfiguration gefunden. Verwende Template-basierte Generierung.', 'info');
                coverLetter = await this.generateFromTemplate(jobData, profileData, options);
            }
            
            // Display result
            this.displayGeneratedContent(coverLetter);
            
            // Track progress
            await this.applicationsCore.trackProgress('cover-letter-generation', {
                jobData,
                options,
                generated: true
            });
            
        } catch (error) {
            console.error('❌ Error generating cover letter:', error);
            this.showNotification('Fehler bei der Generierung. Verwende Template als Fallback.', 'warning');
            
            // Fallback to template
            try {
                const jobData = this.collectJobData();
                const profileData = this.applicationsCore.getProfileData() || {};
                const options = this.collectOptions();
                const coverLetter = await this.generateFromTemplate(jobData, profileData, options);
                this.displayGeneratedContent(coverLetter);
            } catch (fallbackError) {
                this.showNotification('Fehler bei der Generierung. Bitte versuchen Sie es erneut.', 'error');
            }
        } finally {
            this.isGenerating = false;
            this.hideLoading();
        }
    }

    collectJobData() {
        const form = document.getElementById('jobInfoForm');
        const formData = new FormData(form);
        
        return {
            jobTitle: formData.get('jobTitle'),
            companyName: formData.get('companyName'),
            industry: formData.get('industry'),
            location: formData.get('location'),
            jobDescription: formData.get('jobDescription'),
            contactPerson: formData.get('contactPerson'),
            applicationDeadline: formData.get('applicationDeadline')
        };
    }

    collectOptions() {
        return {
            tone: document.querySelector('input[name="tone"]:checked').value,
            length: document.querySelector('input[name="length"]:checked').value,
            focus: document.querySelector('input[name="focus"]:checked').value
        };
    }

    async getActiveAIProvider() {
        // PRIORITÄT 1: AWS DynamoDB (Admin-Konfiguration)
        try {
            if (window.awsProfileAPI && window.awsProfileAPI.isInitialized) {
                // Versuche Admin-Konfiguration zu laden (userId: 'admin' oder 'owner')
                const adminProfile = await window.awsProfileAPI.loadProfile('admin').catch(() => {
                    // Fallback: Versuche mit 'owner'
                    return window.awsProfileAPI.loadProfile('owner').catch(() => null);
                });
                
                if (adminProfile && adminProfile.apiKeys) {
                    const apiKeys = adminProfile.apiKeys;
                    
                    // Prüfe OpenAI
                    if (apiKeys.openai?.apiKey && this.isValidAPIKey(apiKeys.openai.apiKey)) {
                        console.log('✅ Nutze OpenAI API Key aus AWS DynamoDB');
                        return {
                            type: 'openai',
                            key: apiKeys.openai.apiKey,
                            config: {
                                model: apiKeys.openai.model || 'gpt-5.2',
                                maxTokens: apiKeys.openai.maxTokens || 1000,
                                temperature: apiKeys.openai.temperature || 0.3
                            }
                        };
                    }
                    
                    // Prüfe Anthropic Claude
                    if (apiKeys.anthropic?.apiKey && this.isValidAnthropicKey(apiKeys.anthropic.apiKey)) {
                        console.log('✅ Nutze Anthropic Claude API Key aus AWS DynamoDB');
                        return {
                            type: 'anthropic',
                            key: apiKeys.anthropic.apiKey,
                            config: {
                                model: apiKeys.anthropic.model || 'claude-3-sonnet-20240229',
                                maxTokens: apiKeys.anthropic.maxTokens || 1000,
                                temperature: apiKeys.anthropic.temperature || 0.3
                            }
                        };
                    }
                    
                    // Prüfe Google AI
                    if (apiKeys.google?.apiKey && this.isValidGoogleKey(apiKeys.google.apiKey)) {
                        console.log('✅ Nutze Google AI API Key aus AWS DynamoDB');
                        return {
                            type: 'google',
                            key: apiKeys.google.apiKey,
                            config: {
                                model: apiKeys.google.model || 'gemini-pro',
                                maxTokens: apiKeys.google.maxTokens || 1000,
                                temperature: apiKeys.google.temperature || 0.3
                            }
                        };
                    }
                }
            }
        } catch (error) {
            console.warn('⚠️ Fehler beim Lesen aus AWS DynamoDB:', error);
        }
        
        // PRIORITÄT 2: Admin-Panel API Keys (State Manager / localStorage)
        try {
            const adminState = localStorage.getItem('admin_state');
            if (adminState) {
                const state = JSON.parse(adminState);
                const apiKeys = state?.apiKeys || {};
                
                // Prüfe OpenAI
                if (apiKeys.openai?.apiKey && this.isValidAPIKey(apiKeys.openai.apiKey)) {
                    console.log('✅ Nutze OpenAI API Key aus Admin-Panel localStorage');
                    return {
                        type: 'openai',
                        key: apiKeys.openai.apiKey,
                        config: {
                            model: apiKeys.openai.model || 'gpt-4o-mini',
                            maxTokens: apiKeys.openai.maxTokens || 1000,
                            temperature: apiKeys.openai.temperature || 0.3
                        }
                    };
                }
                
                // Prüfe Anthropic Claude
                if (apiKeys.anthropic?.apiKey && this.isValidAnthropicKey(apiKeys.anthropic.apiKey)) {
                    console.log('✅ Nutze Anthropic Claude API Key aus Admin-Panel localStorage');
                    return {
                        type: 'anthropic',
                        key: apiKeys.anthropic.apiKey,
                        config: {
                            model: apiKeys.anthropic.model || 'claude-3-sonnet-20240229',
                            maxTokens: apiKeys.anthropic.maxTokens || 1000,
                            temperature: apiKeys.anthropic.temperature || 0.3
                        }
                    };
                }
                
                // Prüfe Google AI
                if (apiKeys.google?.apiKey && this.isValidGoogleKey(apiKeys.google.apiKey)) {
                    console.log('✅ Nutze Google AI API Key aus Admin-Panel localStorage');
                    return {
                        type: 'google',
                        key: apiKeys.google.apiKey,
                        config: {
                            model: apiKeys.google.model || 'gemini-pro',
                            maxTokens: apiKeys.google.maxTokens || 1000,
                            temperature: apiKeys.google.temperature || 0.3
                        }
                    };
                }
            }
        } catch (error) {
            console.warn('⚠️ Fehler beim Lesen des Admin-Panel States:', error);
        }
        
        // PRIORITÄT 2: GlobalAPIManager (falls verfügbar)
        const manager = window.GlobalAPIManager;
        if (manager) {
            // OpenAI
            if (manager.isServiceEnabled?.('openai')) {
                const openAIConfig = manager.getServiceConfig('openai');
                if (openAIConfig?.key && this.isValidAPIKey(openAIConfig.key)) {
                    console.log('✅ Nutze OpenAI API Key aus GlobalAPIManager');
                    return {
                        type: 'openai',
                        key: openAIConfig.key,
                        config: openAIConfig
                    };
                }
            }
            
            // Google AI
            if (manager.isServiceEnabled?.('google')) {
                const googleConfig = manager.getServiceConfig('google');
                if (googleConfig?.key && this.isValidGoogleKey(googleConfig.key)) {
                    console.log('✅ Nutze Google AI API Key aus GlobalAPIManager');
                    return {
                        type: 'google',
                        key: googleConfig.key,
                        config: googleConfig
                    };
                }
            }
        }
        
        // PRIORITÄT 3: Direkt aus localStorage.global_api_keys
        try {
            const raw = localStorage.getItem('global_api_keys');
            if (raw) {
                const parsed = JSON.parse(raw);
                
                // OpenAI
                if (parsed.openai?.key && this.isValidAPIKey(parsed.openai.key)) {
                    console.log('✅ Nutze OpenAI API Key aus global_api_keys');
                    return {
                        type: 'openai',
                        key: parsed.openai.key,
                        config: parsed.openai
                    };
                }
                
                // Google AI
                if (parsed.google?.key && this.isValidGoogleKey(parsed.google.key)) {
                    console.log('✅ Nutze Google AI API Key aus global_api_keys');
                    return {
                        type: 'google',
                        key: parsed.google.key,
                        config: parsed.google
                    };
                }
            }
        } catch (error) {
            console.warn('⚠️ Konnte global_api_keys nicht lesen:', error);
        }
        
        // PRIORITÄT 4: Fallback zu getAPIKey() (alte Methode)
        const openAIKey = this.getAPIKey();
        if (this.isValidAPIKey(openAIKey)) {
            console.log('✅ Nutze OpenAI API Key aus getAPIKey() Fallback');
            return {
                type: 'openai',
                key: openAIKey,
                config: {
                    model: 'gpt-4o-mini',
                    maxTokens: 1000,
                    temperature: 0.3
                }
            };
        }
        
        console.warn('❌ Kein gültiger API Key gefunden');
        return null;
    }
    
    isValidAnthropicKey(key) {
        if (!key || typeof key !== 'string') return false;
        const trimmed = key.trim();
        return trimmed.length > 20 && trimmed.startsWith('sk-ant-');
    }
    
    isValidGoogleKey(key) {
        if (!key || typeof key !== 'string') return false;
        const trimmed = key.trim();
        return trimmed.length > 20 && trimmed.startsWith('AIza');
    }
    
    async callOpenAI(jobData, profileData, options, provider) {
        const apiKey = provider?.key || this.getAPIKey();
        if (!apiKey) {
            throw new Error('Kein OpenAI API Key vorhanden');
        }
        
        const prompt = this.constructPrompt(jobData, profileData, options);
        const serviceOptions = provider?.config || {};
        
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: serviceOptions?.model || 'gpt-5.2',
                reasoning_effort: 'medium',
                messages: [
                    {
                        role: 'system',
                        content: 'Du bist ein professioneller Bewerbungsberater und Experte für Anschreiben. Erstelle personalisierte, überzeugende Bewerbungsanschreiben auf Deutsch.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_completion_tokens: serviceOptions?.maxTokens || 2000
            })
        });
        
        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }
        
        const data = await response.json();
        return data.choices[0].message.content;
    }
    
    async callGoogleAI(jobData, profileData, options, provider) {
        const config = provider?.config || {};
        const model = options?.model || config.model || 'gemini-pro';
        const prompt = this.constructPrompt(jobData, profileData, options);
        const systemPrompt = 'Du bist ein professioneller Bewerbungsberater aus dem DACH-Raum. Erstelle hochwertige Bewerbungsanschreiben auf Deutsch.';
        
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${provider.key}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: systemPrompt },
                        { text: prompt }
                    ]
                }],
                generationConfig: {
                    maxOutputTokens: config.maxTokens || 800,
                    temperature: config.temperature ?? 0.7
                }
            })
        });
        
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(`Google AI Fehler: ${error.error?.message || response.statusText}`);
        }
        
        const data = await response.json();
        const contentParts = data.candidates?.[0]?.content?.parts || [];
        const text = contentParts.map(part => part.text || '').join('\n').trim();
        if (!text) {
            throw new Error('Google AI lieferte keinen Text zurück');
        }
        return text;
    }
    
    async callAnthropic(jobData, profileData, options, provider) {
        const config = provider?.config || {};
        const prompt = this.constructPrompt(jobData, profileData, options);
        const systemPrompt = 'Du bist ein professioneller Bewerbungsberater aus dem DACH-Raum. Erstelle hochwertige Bewerbungsanschreiben auf Deutsch.';
        
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': provider.key,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: config.model || 'claude-3-sonnet-20240229',
                max_tokens: config.maxTokens || 800,
                temperature: config.temperature ?? 0.7,
                system: systemPrompt,
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ]
            })
        });
        
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(`Anthropic Claude Fehler: ${error.error?.message || response.statusText}`);
        }
        
        const data = await response.json();
        const text = data.content?.[0]?.text;
        if (!text) {
            throw new Error('Anthropic Claude lieferte keinen Text zurück');
        }
        return text;
    }

    constructPrompt(jobData, profileData, options) {
        const lengthMap = {
            'short': 'ca. 150 Wörter',
            'medium': 'ca. 250 Wörter',
            'long': 'ca. 350 Wörter'
        };
        
        const toneMap = {
            'formal': 'professionell und sachlich',
            'modern': 'zeitgemäß und dynamisch',
            'creative': 'originell und einzigartig'
        };
        
        const focusMap = {
            'experience': 'Berufserfahrung und Erfolge',
            'skills': 'technische Fähigkeiten und Kompetenzen',
            'motivation': 'persönliche Motivation und Ziele'
        };
        
        return `
Erstelle ein Bewerbungsanschreiben für:

POSITION: ${jobData.jobTitle}
UNTERNEHMEN: ${jobData.companyName}
BRANCHE: ${jobData.industry || 'Nicht angegeben'}
STANDORT: ${jobData.location || 'Nicht angegeben'}

STELLENBESCHREIBUNG:
${jobData.jobDescription}

BEWERBER-PROFIL:
- Name: ${profileData.firstName} ${profileData.lastName}
- Erfahrung: ${profileData.experience ? profileData.experience.map(exp => `${exp.position} bei ${exp.company}`).join(', ') : 'Nicht angegeben'}
- Fähigkeiten: ${profileData.technicalSkills ? profileData.technicalSkills.join(', ') : 'Nicht angegeben'}
- Motivation: ${profileData.motivation || 'Nicht angegeben'}

ANFORDERUNGEN:
- Tonalität: ${toneMap[options.tone]}
- Länge: ${lengthMap[options.length]}
- Schwerpunkt: ${focusMap[options.focus]}

Das Anschreiben soll:
- Professionell und überzeugend sein
- Auf die Stellenanforderungen eingehen
- Relevante Erfahrungen hervorheben
- Persönlich und authentisch wirken
- Strukturiert und gut lesbar sein

Erstelle nur das Anschreiben ohne zusätzliche Erklärungen.
        `;
    }

    displayGeneratedContent(content) {
        const generatedSection = document.getElementById('generatedContent');
        const generatedText = document.getElementById('generatedText');
        const loadingAnimation = document.getElementById('loadingAnimation');
        
        // Verstecke Loading-Animation
        if (loadingAnimation) {
            loadingAnimation.style.display = 'none';
        }
        
        generatedText.value = content;
        generatedSection.style.display = 'block';
        
        // Update stats
        this.updateStats();
        
        // Show continue button
        document.getElementById('continueBtn').style.display = 'inline-flex';
        
        // Scroll to generated content
        generatedSection.scrollIntoView({ behavior: 'smooth' });
        
        this.generatedContent = content;
    }

    updateStats() {
        const text = document.getElementById('generatedText').value;
        const words = text.trim().split(/\s+/).filter(word => word.length > 0).length;
        const chars = text.length;
        
        document.getElementById('wordCount').textContent = words;
        document.getElementById('charCount').textContent = chars;
        document.getElementById('generationTime').textContent = new Date().toLocaleTimeString('de-DE');
    }

    showTemplateFallback() {
        console.log('📄 Showing template fallback...');
        
        const templateSection = document.getElementById('templateSection');
        templateSection.style.display = 'block';
        
        this.showNotification('KI-Generierung nicht verfügbar. Verwenden Sie ein Template.', 'info');
    }

    useTemplate(templateKey) {
        const template = this.templates[templateKey];
        if (!template) return;
        
        // Fill template with job data
        const jobData = this.collectJobData();
        const profileData = this.applicationsCore.getProfileData();
        
        const filledTemplate = this.fillTemplate(template, jobData, profileData);
        this.displayGeneratedContent(filledTemplate);
        
        // Hide template section
        document.getElementById('templateSection').style.display = 'none';
    }

    async generateFromTemplate(jobData, profileData, options) {
        // Wähle Template basierend auf Tonalität
        let templateKey = 'formal'; // Default
        if (options.tone === 'modern') {
            templateKey = 'modern-it';
        } else if (options.tone === 'creative') {
            templateKey = 'creative-marketing';
        }
        
        let template = this.templates[templateKey];
        
        // Erweitere das Template basierend auf den Optionen
        template = this.enhanceTemplateBasedOnOptions(template, jobData, profileData, options);
        
        // Fülle das Template mit Daten
        const filledTemplate = this.fillTemplate(template, jobData, profileData);
        
        // Simuliere eine kurze Generierungszeit für bessere UX
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        return filledTemplate;
    }
    
    enhanceTemplateBasedOnOptions(template, jobData, profileData, options) {
        // Passe die Länge an
        if (options.length === 'short') {
            // Kürze das Template
            return template.split('\n\n').slice(0, 3).join('\n\n') + '\n\nMit freundlichen Grüßen\n{{firstName}} {{lastName}}';
        } else if (options.length === 'long') {
            // Erweitere das Template
            const zusatz = `\n\nZusätzlich bringe ich folgende Qualifikationen mit:\n- Analytische Denkweise und strukturierte Arbeitsweise\n- Teamfähigkeit und Kommunikationsstärke\n- Flexibilität und Lernbereitschaft\n- Zuverlässigkeit und Eigeninitiative`;
            return template.replace('Mit freundlichen Grüßen', zusatz + '\n\nMit freundlichen Grüßen');
        }
        
        // Passe den Fokus an
        if (options.focus === 'skills' && profileData.technicalSkills) {
            const skillsText = `\n\nMeine technischen Fähigkeiten umfassen: ${profileData.technicalSkills.join(', ')}. Diese Kompetenzen habe ich in verschiedenen Projekten erfolgreich eingesetzt und kontinuierlich weiterentwickelt.`;
            return template.replace('Mit freundlichen Grüßen', skillsText + '\n\nMit freundlichen Grüßen');
        } else if (options.focus === 'motivation') {
            const motivationText = `\n\nMeine Motivation für diese Position liegt in der Möglichkeit, meine Fähigkeiten in einem innovativen Umfeld einzusetzen und dabei kontinuierlich zu wachsen. Die Aussicht, bei {{companyName}} Teil eines dynamischen Teams zu sein, begeistert mich besonders.`;
            return template.replace('Mit freundlichen Grüßen', motivationText + '\n\nMit freundlichen Grüßen');
        }
        
        return template;
    }
    
    fillTemplate(template, jobData, profileData) {
        // Basis-Ersetzungen
        let result = template
            .replace(/{{jobTitle}}/g, jobData.jobTitle || '[Jobtitel]')
            .replace(/{{companyName}}/g, jobData.companyName || '[Unternehmen]')
            .replace(/{{firstName}}/g, profileData.firstName || '[Vorname]')
            .replace(/{{lastName}}/g, profileData.lastName || '[Nachname]')
            .replace(/{{location}}/g, jobData.location || '[Standort]')
            .replace(/{{contactPerson}}/g, jobData.contactPerson || 'Damen und Herren');
        
        // Intelligente Ersetzungen basierend auf Stellenbeschreibung
        if (jobData.jobDescription) {
            const keywords = this.extractKeywords(jobData.jobDescription);
            result = this.insertRelevantSkills(result, keywords, profileData);
        }
        
        // Datum hinzufügen
        const heute = new Date().toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' });
        result = `${heute}\n\n${result}`;
        
        return result;
    }
    
    extractKeywords(description) {
        // Einfache Keyword-Extraktion
        const keywords = [];
        const techTerms = ['JavaScript', 'React', 'Python', 'Java', 'SQL', 'AWS', 'Docker', 'Git', 'Agile', 'Scrum'];
        
        techTerms.forEach(term => {
            if (description.toLowerCase().includes(term.toLowerCase())) {
                keywords.push(term);
            }
        });
        
        return keywords;
    }
    
    insertRelevantSkills(template, keywords, profileData) {
        if (keywords.length > 0 && profileData.technicalSkills) {
            const relevantSkills = profileData.technicalSkills.filter(skill => 
                keywords.some(keyword => skill.toLowerCase().includes(keyword.toLowerCase()))
            );
            
            if (relevantSkills.length > 0) {
                const skillsText = `Besonders hervorheben möchte ich meine Erfahrung mit ${relevantSkills.slice(0, 3).join(', ')}, `;
                return template.replace('In meiner bisherigen Tätigkeit', skillsText + 'die ich in meiner bisherigen Tätigkeit');
            }
        }
        return template;
    }
    
    getAPIKey() {
        const sources = [
            { name: 'localStorage.openai_api_key', value: localStorage.getItem('openai_api_key') },
            { name: 'sessionStorage.openai_api_key', value: sessionStorage?.getItem('openai_api_key') },
            { 
                name: 'ki_settings.apiKey', 
                value: (() => {
                    try {
                        const settings = JSON.parse(localStorage.getItem('ki_settings') || '{}');
                        return settings.apiKey || null;
                    } catch (error) {
                        console.warn('⚠️ Konnte ki_settings nicht lesen:', error);
                        return null;
                    }
                })()
            },
            { 
                name: 'profile.openaiApiKey', 
                value: (() => {
                    try {
                        const profile = this.applicationsCore?.getProfileData();
                        return profile?.openaiApiKey || null;
                    } catch (error) {
                        console.warn('⚠️ Fehler beim Lesen des Profils:', error);
                        return null;
                    }
                })()
            }
        ];
        
        for (const source of sources) {
            if (this.isValidAPIKey(source.value)) {
                console.log(`✅ OpenAI API Key geladen aus: ${source.name}`);
                return source.value.trim();
            }
        }
        
        console.warn('❌ Kein gültiger OpenAI API Key gefunden. Quellen überprüft:', sources.map(s => `${s.name}: ${s.value ? 'gefunden' : 'leer'}`).join(' | '));
        return null;
    }
    
    isValidAPIKey(key) {
        if (!key || typeof key !== 'string') return false;
        const trimmed = key.trim();
        return trimmed.length > 20 && (trimmed.startsWith('sk-') || trimmed.startsWith('rk-') || trimmed.startsWith('oai-'));
    }
    
    checkAPIKey() {
        const apiKey = this.getAPIKey();
        if (apiKey) {
            // Set the value in the input field (masked)
            const input = document.getElementById('apiKeyInput');
            if (input) {
                input.value = 'sk-...' + apiKey.slice(-4);
            }
        }
    }
    
    async saveAPIKey() {
        const input = document.getElementById('apiKeyInput');
        const apiKey = input.value.trim();
        
        if (!this.isValidAPIKey(apiKey)) {
            this.showNotification('Bitte geben Sie einen gültigen OpenAI API Key ein (beginnt mit "sk-")', 'error');
            return;
        }
        
        // Save to localStorage
        localStorage.setItem('openai_api_key', apiKey);
        
        // Synchronisiere auch die Admin-Einstellungen, damit alle Seiten denselben Key sehen
        try {
            const settings = JSON.parse(localStorage.getItem('ki_settings') || '{}');
            settings.apiKey = apiKey;
            localStorage.setItem('ki_settings', JSON.stringify(settings));
        } catch (error) {
            console.warn('⚠️ Konnte ki_settings nicht aktualisieren:', error);
        }
        
        // Save to profile if possible
        if (this.applicationsCore && this.applicationsCore.awsProfileAPI) {
            const profile = this.applicationsCore.getProfileData() || {};
            profile.openaiApiKey = apiKey;
            await this.applicationsCore.awsProfileAPI.saveProfile(profile);
        }
        
        this.showNotification('API Key wurde erfolgreich gespeichert', 'success');
        
        // Mask the input
        input.value = 'sk-...' + apiKey.slice(-4);
    }
    
    createContextMenu() {
        // Create context menu element
        const menu = document.createElement('div');
        menu.className = 'ai-context-menu';
        menu.innerHTML = `
            <div class="context-menu-item" onclick="window.aiCoverLetterGenerator.generateAlternatives()">
                <i class="fas fa-lightbulb"></i>
                Formulierungsvorschläge
            </div>
            <div class="context-menu-item" onclick="window.aiCoverLetterGenerator.improveText()">
                <i class="fas fa-magic"></i>
                Text verbessern
            </div>
            <div class="context-menu-item" onclick="window.aiCoverLetterGenerator.shortenText()">
                <i class="fas fa-compress-alt"></i>
                Text kürzen
            </div>
            <div class="context-menu-item" onclick="window.aiCoverLetterGenerator.expandText()">
                <i class="fas fa-expand-alt"></i>
                Text erweitern
            </div>
        `;
        
        document.body.appendChild(menu);
        this.contextMenu = menu;
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .ai-context-menu {
                position: fixed;
                background: white;
                border: 1px solid #ddd;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                display: none;
                z-index: 10000;
                padding: 8px 0;
                min-width: 200px;
            }
            
            .context-menu-item {
                padding: 8px 16px;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 8px;
                transition: background-color 0.2s;
            }
            
            .context-menu-item:hover {
                background-color: #f5f5f5;
            }
            
            .context-menu-item i {
                color: #4a90e2;
                width: 16px;
            }
        `;
        document.head.appendChild(style);
    }
    
    createAlternativesModal() {
        // Create modal for alternatives
        const modal = document.createElement('div');
        modal.className = 'ai-alternatives-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Formulierungsvorschläge</h3>
                    <button class="modal-close" onclick="window.aiCoverLetterGenerator.closeAlternativesModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="original-text">
                        <strong>Original:</strong>
                        <p id="originalText"></p>
                    </div>
                    <div class="alternatives-list" id="alternativesList">
                        <div class="loading-alternatives">
                            <i class="fas fa-spinner fa-spin"></i>
                            Generiere Vorschläge...
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        this.alternativesModal = modal;
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .ai-alternatives-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.5);
                display: none;
                z-index: 10001;
                justify-content: center;
                align-items: center;
            }
            
            .modal-content {
                background: white;
                border-radius: 12px;
                width: 90%;
                max-width: 600px;
                max-height: 80vh;
                overflow: hidden;
                display: flex;
                flex-direction: column;
            }
            
            .modal-header {
                padding: 20px;
                border-bottom: 1px solid #eee;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .modal-header h3 {
                margin: 0;
                font-size: 20px;
                color: #333;
            }
            
            .modal-close {
                background: none;
                border: none;
                font-size: 20px;
                color: #666;
                cursor: pointer;
                padding: 4px 8px;
            }
            
            .modal-close:hover {
                color: #333;
            }
            
            .modal-body {
                padding: 20px;
                overflow-y: auto;
            }
            
            .original-text {
                background: #f5f5f5;
                padding: 16px;
                border-radius: 8px;
                margin-bottom: 20px;
            }
            
            .original-text p {
                margin: 8px 0 0 0;
                color: #666;
            }
            
            .alternatives-list {
                display: flex;
                flex-direction: column;
                gap: 12px;
            }
            
            .alternative-item {
                padding: 16px;
                border: 2px solid #e0e0e0;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.2s;
                position: relative;
            }
            
            .alternative-item:hover {
                border-color: #4a90e2;
                background: #f8fbff;
            }
            
            .alternative-item.selected {
                border-color: #4a90e2;
                background: #e3f2fd;
            }
            
            .alternative-text {
                color: #333;
                line-height: 1.6;
            }
            
            .alternative-hint {
                position: absolute;
                top: 8px;
                right: 8px;
                font-size: 12px;
                color: #999;
            }
            
            .loading-alternatives {
                text-align: center;
                padding: 40px;
                color: #666;
            }
            
            .loading-alternatives i {
                margin-right: 8px;
            }
        `;
        document.head.appendChild(style);
    }
    
    handleContextMenu(e) {
        // Only show if text is selected
        if (!this.selectedText || !this.selectedText.trim()) return;
        
        // Position context menu
        this.contextMenu.style.left = e.pageX + 'px';
        this.contextMenu.style.top = e.pageY + 'px';
        this.contextMenu.style.display = 'block';
    }
    
    async generateAlternatives() {
        this.contextMenu.style.display = 'none';
        
        if (!this.selectedText) {
            this.showNotification('Bitte wählen Sie zuerst Text aus', 'warning');
            return;
        }
        
        const apiKey = this.getAPIKey();
        if (!apiKey) {
            this.showNotification('Kein API Key vorhanden. Bitte in den Einstellungen hinterlegen.', 'error');
            return;
        }
        
        // Show modal
        this.alternativesModal.style.display = 'flex';
        document.getElementById('originalText').textContent = this.selectedText;
        document.getElementById('alternativesList').innerHTML = `
            <div class="loading-alternatives">
                <i class="fas fa-spinner fa-spin"></i>
                Generiere Vorschläge...
            </div>
        `;
        
        try {
            const alternatives = await this.callOpenAIForAlternatives(this.selectedText);
            this.displayAlternatives(alternatives);
        } catch (error) {
            console.error('Error generating alternatives:', error);
            this.showNotification('Fehler beim Generieren der Alternativen', 'error');
            this.closeAlternativesModal();
        }
    }
    
    async callOpenAIForAlternatives(text) {
        const apiKey = this.getAPIKey();
        
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-5.2',
                reasoning_effort: 'low',
                messages: [
                    {
                        role: 'system',
                        content: 'Du bist ein Experte für professionelle Bewerbungsschreiben. Generiere 3 alternative Formulierungen für den gegebenen Text. Die Alternativen sollten professionell, prägnant und aussagekräftig sein. Gib nur die 3 Alternativen zurück, nummeriert von 1-3.'
                    },
                    {
                        role: 'user',
                        content: `Generiere 3 alternative Formulierungen für: "${text}"`
                    }
                ],
                max_completion_tokens: 500
            })
        });
        
        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }
        
        const data = await response.json();
        const content = data.choices[0].message.content;
        
        // Parse alternatives
        const alternatives = content.split('\n')
            .filter(line => line.match(/^[1-3]\./))
            .map(line => line.replace(/^[1-3]\.\s*/, '').trim());
        
        return alternatives;
    }
    
    displayAlternatives(alternatives) {
        const container = document.getElementById('alternativesList');
        container.innerHTML = '';
        
        alternatives.forEach((alt, index) => {
            const item = document.createElement('div');
            item.className = 'alternative-item';
            item.innerHTML = `
                <div class="alternative-text">${alt}</div>
                <div class="alternative-hint">Doppelklick zum Übernehmen</div>
            `;
            
            item.addEventListener('dblclick', () => {
                this.applyAlternative(alt);
            });
            
            container.appendChild(item);
        });
    }
    
    applyAlternative(newText) {
        const textarea = document.getElementById('generatedText');
        const currentText = textarea.value;
        
        if (this.selectedRange) {
            // Replace the selected text
            const newContent = currentText.substring(0, this.selectedRange.start) + 
                              newText + 
                              currentText.substring(this.selectedRange.end);
            
            textarea.value = newContent;
            this.generatedContent = newContent;
            
            // Update stats
            this.updateStats();
            
            // Close modal
            this.closeAlternativesModal();
            
            this.showNotification('Text wurde erfolgreich ersetzt', 'success');
        }
    }
    
    closeAlternativesModal() {
        this.alternativesModal.style.display = 'none';
    }
    
    async improveText() {
        this.contextMenu.style.display = 'none';
        await this.processTextWithInstruction('Verbessere diesen Text und mache ihn professioneller');
    }
    
    async shortenText() {
        this.contextMenu.style.display = 'none';
        await this.processTextWithInstruction('Kürze diesen Text auf das Wesentliche');
    }
    
    async expandText() {
        this.contextMenu.style.display = 'none';
        await this.processTextWithInstruction('Erweitere diesen Text mit mehr Details');
    }
    
    async processTextWithInstruction(instruction) {
        if (!this.selectedText) return;
        
        const apiKey = this.getAPIKey();
        if (!apiKey) {
            this.showNotification('Kein API Key vorhanden', 'error');
            return;
        }
        
        this.showLoading();
        
        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-5.2',
                    reasoning_effort: 'low',
                    messages: [
                        {
                            role: 'system',
                            content: 'Du bist ein Experte für professionelle Bewerbungsschreiben.'
                        },
                        {
                            role: 'user',
                            content: `${instruction}: "${this.selectedText}"`
                        }
                    ],
                    max_completion_tokens: 500
                })
            });
            
            const data = await response.json();
            const improvedText = data.choices[0].message.content;
            
            // Apply the improved text
            this.applyAlternative(improvedText);
            
        } catch (error) {
            console.error('Error processing text:', error);
            this.showNotification('Fehler bei der Textverarbeitung', 'error');
        } finally {
            this.hideLoading();
        }
    }

    getFormalTemplate() {
        return `Sehr geehrte Damen und Herren,

mit großem Interesse habe ich Ihre Stellenausschreibung für die Position als {{jobTitle}} bei {{companyName}} gelesen. Als erfahrener [Berufsbezeichnung] mit [X] Jahren Berufserfahrung in [relevanten Bereichen] bin ich überzeugt, dass ich eine wertvolle Bereicherung für Ihr Team darstellen kann.

In meiner bisherigen Tätigkeit bei [vorherige Firma] konnte ich umfangreiche Erfahrungen in [relevanten Skills/Bereichen] sammeln. Besonders stolz bin ich auf [konkrete Erfolge/Projekte], die meine Fähigkeiten in [relevanten Bereichen] unterstreichen.

Die Möglichkeit, bei {{companyName}} in einem innovativen und dynamischen Umfeld zu arbeiten, reizt mich sehr. Ihr Unternehmen steht für [Unternehmenswerte/Produkte], was perfekt zu meinen beruflichen Zielen und Werten passt.

Gerne würde ich in einem persönlichen Gespräch erläutern, wie ich mit meiner Erfahrung und meinem Engagement zum Erfolg Ihres Teams beitragen kann.

Mit freundlichen Grüßen
{{firstName}} {{lastName}}`;
    }

    getModernITTemplate() {
        return `Hallo {{contactPerson}},

die Stellenausschreibung für {{jobTitle}} bei {{companyName}} hat sofort mein Interesse geweckt. Als [Berufsbezeichnung] mit Leidenschaft für [technische Bereiche] sehe ich hier die perfekte Gelegenheit, meine Expertise in [relevanten Technologien] einzubringen.

Meine bisherige Erfahrung umfasst [konkrete Projekte/Technologien], wobei ich besonders stolz auf [herausragende Erfolge] bin. In meiner aktuellen Position bei [Firma] konnte ich [konkrete Verbesserungen/Innovationen] umsetzen, die [messbare Ergebnisse] erzielten.

{{companyName}} ist für mich ein spannendes Unternehmen, weil [spezifische Gründe basierend auf Stellenausschreibung]. Die Möglichkeit, in einem [Unternehmenskultur/Arbeitsumfeld] zu arbeiten und dabei [konkrete Ziele/Projekte] voranzutreiben, motiviert mich sehr.

Ich freue mich darauf, in einem persönlichen Gespräch zu zeigen, wie ich mit meiner technischen Expertise und meinem Problemlösungsansatz zum Erfolg Ihres Teams beitragen kann.

Beste Grüße
{{firstName}} {{lastName}}`;
    }

    getCreativeMarketingTemplate() {
        return `Liebe/r {{contactPerson}},

{{jobTitle}} bei {{companyName}}? Das ist genau das, wonach ich gesucht habe! Als kreativer [Berufsbezeichnung] mit [X] Jahren Erfahrung in [relevanten Bereichen] bin ich begeistert von der Möglichkeit, bei einem so innovativen Unternehmen wie {{companyName}} zu arbeiten.

Meine Leidenschaft für [kreative Bereiche] und meine Erfahrung in [relevanten Projekten] haben mich zu einem Experten in [spezifische Skills] gemacht. Besonders stolz bin ich auf [kreative Projekte/Erfolge], die [messbare Ergebnisse] erzielt haben.

Was mich an {{companyName}} besonders fasziniert, ist [spezifische Gründe basierend auf Stellenausschreibung]. Die Möglichkeit, in einem kreativen und dynamischen Umfeld zu arbeiten und dabei [konkrete Ziele/Projekte] zu verwirklichen, ist genau das, was ich mir für meine berufliche Zukunft vorstelle.

Ich würde mich sehr freuen, in einem persönlichen Gespräch zu zeigen, wie ich mit meiner Kreativität und meinem Engagement innovative Lösungen für {{companyName}} entwickeln kann.

Herzliche Grüße
{{firstName}} {{lastName}}`;
    }

    async saveCoverLetter() {
        if (!this.generatedContent) {
            this.showNotification('Kein Anschreiben zum Speichern vorhanden', 'error');
            return;
        }
        
        const jobData = this.collectJobData();
        const coverLetterData = {
            content: this.generatedContent,
            jobData: jobData,
            options: this.collectOptions(),
            createdAt: new Date().toISOString()
        };
        
        // Save to applications core
        await this.applicationsCore.saveApplicationData(coverLetterData);
        
        this.showNotification('Anschreiben erfolgreich gespeichert!', 'success');
    }

    downloadCoverLetter() {
        if (!this.generatedContent) {
            this.showNotification('Kein Anschreiben zum Download vorhanden', 'error');
            return;
        }
        
        // Create PDF content
        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Bewerbungsanschreiben</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; margin: 40px; }
                    .header { margin-bottom: 30px; }
                    .content { white-space: pre-line; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h2>Bewerbungsanschreiben</h2>
                    <p><strong>Position:</strong> ${this.collectJobData().jobTitle}</p>
                    <p><strong>Unternehmen:</strong> ${this.collectJobData().companyName}</p>
                    <p><strong>Datum:</strong> ${new Date().toLocaleDateString('de-DE')}</p>
                </div>
                <div class="content">${this.generatedContent}</div>
            </body>
            </html>
        `;
        
        // Create and download file
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Bewerbungsanschreiben_${this.collectJobData().companyName}_${new Date().toISOString().split('T')[0]}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification('Anschreiben heruntergeladen!', 'success');
    }

    validateForm() {
        const requiredFields = ['jobTitle', 'companyName', 'jobDescription'];
        let isValid = true;
        
        requiredFields.forEach(fieldName => {
            const field = document.getElementById(fieldName);
            if (!field.value.trim()) {
                field.classList.add('error');
                isValid = false;
            } else {
                field.classList.remove('error');
            }
        });
        
        return isValid;
    }

    showLoading() {
        const loadingEl = document.getElementById('loadingAnimation');
        const generatedSection = document.getElementById('generatedContent');
        if (loadingEl) {
            loadingEl.style.display = 'flex';
        }
        if (generatedSection) {
            generatedSection.style.display = 'none';
        }
    }

    hideLoading() {
        const loadingEl = document.getElementById('loadingAnimation');
        if (loadingEl) {
            loadingEl.style.display = 'none';
        }
    }

    showNotification(message, type = 'info') {
        if (this.applicationsCore) {
            this.applicationsCore.showNotification(message, type);
        } else {
            // Fallback notification
            const notification = document.createElement('div');
            notification.className = `notification notification-${type}`;
            notification.innerHTML = `
                <div class="notification-content">
                    <i class="fas fa-${type === 'error' ? 'exclamation-circle' : type === 'success' ? 'check-circle' : 'info-circle'}"></i>
                    <span>${message}</span>
                </div>
            `;
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.remove();
            }, 5000);
        }
    }
}

// Global functions for template usage
function useTemplate(templateKey) {
    if (window.aiCoverLetterGenerator) {
        window.aiCoverLetterGenerator.useTemplate(templateKey);
    }
}

function handleContinue() {
    // Save final state
    if (window.aiCoverLetterGenerator && window.aiCoverLetterGenerator.generatedContent) {
        window.aiCoverLetterGenerator.saveCoverLetter();
    }
    
    // Show success message
    if (window.aiCoverLetterGenerator) {
        window.aiCoverLetterGenerator.showNotification('Bewerbung erfolgreich erstellt!', 'success');
    }
    
    // Redirect to next step
    setTimeout(() => {
        window.location.href = '../user-profile.html#applications';
    }, 1500);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.aiCoverLetterGenerator = new AICoverLetterGenerator();
});





















