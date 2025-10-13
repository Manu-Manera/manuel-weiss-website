/**
 * API Configuration für Modern Workflow AI System
 * Zentrale Konfiguration für alle externen APIs
 */

class APIConfig {
    constructor() {
        this.config = {
            openai: {
                apiKey: null,
                baseURL: 'https://api.openai.com/v1',
                model: 'gpt-3.5-turbo',
                maxTokens: 2000,
                temperature: 0.7
            },
            fallback: {
                enabled: true,
                mockResponses: true
            }
        };
        
        this.init();
    }
    
    init() {
        this.loadAPIKey();
        this.setupEventListeners();
    }
    
    loadAPIKey() {
        // Versuche API Key aus verschiedenen Quellen zu laden
        const sources = [
            () => localStorage.getItem('openai_api_key'),
            () => sessionStorage.getItem('openai_api_key'),
            () => window.OPENAI_API_KEY,
            () => process.env.OPENAI_API_KEY,
            () => this.getAPIKeyFromServer()
        ];
        
        for (const source of sources) {
            try {
                const key = source();
                if (key && key.startsWith('sk-')) {
                    this.config.openai.apiKey = key;
                    console.log('✅ OpenAI API Key geladen');
                    return;
                }
            } catch (e) {
                // Ignoriere Fehler
            }
        }
        
        console.warn('⚠️ OpenAI API Key nicht gefunden - Fallback-Modus aktiviert');
    }
    
    async getAPIKeyFromServer() {
        try {
            const response = await fetch('/api/config/openai-key');
            if (response.ok) {
                const data = await response.json();
                return data.apiKey;
            }
        } catch (error) {
            console.warn('Server API Key nicht verfügbar:', error);
        }
        return null;
    }
    
    setupEventListeners() {
        // API Key Eingabe Dialog
        document.addEventListener('DOMContentLoaded', () => {
            this.createAPIKeyDialog();
        });
    }
    
    createAPIKeyDialog() {
        // Erstelle einen unsichtbaren Dialog für API Key Eingabe
        const dialog = document.createElement('div');
        dialog.id = 'api-key-dialog';
        dialog.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            z-index: 10000;
            display: none;
            align-items: center;
            justify-content: center;
        `;
        
        dialog.innerHTML = `
            <div style="background: white; padding: 2rem; border-radius: 12px; max-width: 500px; width: 90%;">
                <h3 style="margin-bottom: 1rem; color: #1f2937;">🔑 OpenAI API Key konfigurieren</h3>
                <p style="color: #6b7280; margin-bottom: 1.5rem;">
                    Für die KI-Funktionen benötigen wir Ihren OpenAI API Key. 
                    Sie können ihn kostenlos auf <a href="https://platform.openai.com/api-keys" target="_blank">platform.openai.com</a> erstellen.
                </p>
                <div style="margin-bottom: 1.5rem;">
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">API Key:</label>
                    <input type="password" id="api-key-input" placeholder="sk-..." style="width: 100%; padding: 0.75rem; border: 2px solid #e2e8f0; border-radius: 8px;">
                </div>
                <div style="display: flex; gap: 1rem; justify-content: flex-end;">
                    <button id="skip-api-key" style="padding: 0.75rem 1.5rem; background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;">
                        Überspringen
                    </button>
                    <button id="save-api-key" style="padding: 0.75rem 1.5rem; background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none; border-radius: 8px; cursor: pointer;">
                        Speichern
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(dialog);
        
        // Event Listeners
        document.getElementById('save-api-key').addEventListener('click', () => {
            const apiKey = document.getElementById('api-key-input').value;
            if (apiKey && apiKey.startsWith('sk-')) {
                this.saveAPIKey(apiKey);
                dialog.style.display = 'none';
            } else {
                alert('Bitte geben Sie einen gültigen OpenAI API Key ein.');
            }
        });
        
        document.getElementById('skip-api-key').addEventListener('click', () => {
            dialog.style.display = 'none';
        });
    }
    
    saveAPIKey(apiKey) {
        this.config.openai.apiKey = apiKey;
        localStorage.setItem('openai_api_key', apiKey);
        console.log('✅ API Key gespeichert');
        
        // Benachrichtige andere Komponenten
        window.dispatchEvent(new CustomEvent('apiKeyUpdated', { 
            detail: { apiKey } 
        }));
    }
    
    showAPIKeyDialog() {
        const dialog = document.getElementById('api-key-dialog');
        if (dialog) {
            dialog.style.display = 'flex';
        }
    }
    
    // ==================== API CALLS ====================
    
    async callOpenAI(prompt, options = {}) {
        if (!this.config.openai.apiKey) {
            throw new Error('OpenAI API Key nicht konfiguriert');
        }
        
        const config = {
            ...this.config.openai,
            ...options
        };
        
        const response = await fetch(`${config.baseURL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.apiKey}`
            },
            body: JSON.stringify({
                model: config.model,
                messages: [
                    {
                        role: 'system',
                        content: 'Du bist ein Experte für Bewerbungen und Karriereberatung. Erstelle professionelle, überzeugende Bewerbungsunterlagen.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: config.maxTokens,
                temperature: config.temperature
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`OpenAI API Fehler: ${response.status} - ${errorData.error?.message || 'Unbekannter Fehler'}`);
        }
        
        const data = await response.json();
        return data.choices[0].message.content;
    }
    
    // ==================== FALLBACK FUNCTIONS ====================
    
    async callWithFallback(prompt, fallbackFunction) {
        try {
            if (this.config.openai.apiKey) {
                return await this.callOpenAI(prompt);
            } else {
                throw new Error('Kein API Key');
            }
        } catch (error) {
            console.warn('OpenAI API Fehler, verwende Fallback:', error);
            
            if (this.config.fallback.enabled && fallbackFunction) {
                return await fallbackFunction();
            } else {
                throw error;
            }
        }
    }
    
    // ==================== MOCK RESPONSES ====================
    
    getMockJobAnalysis() {
        return {
            requirements: [
                '3+ Jahre Berufserfahrung',
                'JavaScript, React, Node.js',
                'Teamarbeit und Kommunikation',
                'Problemlösungsfähigkeiten',
                'Projektmanagement-Erfahrung'
            ],
            keywords: [
                'JavaScript', 'React', 'Node.js', 'Teamarbeit', 
                'Problemlösung', 'Projektmanagement', 'Agile', 'Scrum'
            ],
            softSkills: [
                'Kommunikation', 'Teamarbeit', 'Problemlösung', 'Kreativität'
            ],
            technicalSkills: [
                'JavaScript', 'React', 'Node.js', 'HTML', 'CSS', 'Git'
            ],
            experienceLevel: 'Mid-Level',
            industry: 'IT/Software',
            summary: 'Mid-Level Frontend Developer Position mit Fokus auf React und JavaScript'
        };
    }
    
    getMockMatching() {
        const score = Math.floor(Math.random() * 30) + 70; // 70-100%
        return {
            score: score,
            matchedSkills: ['JavaScript', 'React', 'Teamarbeit'],
            missingSkills: ['Node.js', 'Projektmanagement'],
            recommendations: [
                'Node.js Kenntnisse erweitern',
                'Projektmanagement-Zertifikat erwerben'
            ],
            analysis: `Grundlegende Matching-Analyse: ${score}% Übereinstimmung mit den Stellenanforderungen`
        };
    }
    
    getMockCoverLetter() {
        return `Sehr geehrte Damen und Herren,

mit großem Interesse habe ich Ihre Stellenausschreibung für die Position "Frontend Developer" bei [Unternehmen] gelesen. Als erfahrener Frontend Developer mit 5 Jahren Berufserfahrung bin ich überzeugt, dass ich eine wertvolle Bereicherung für Ihr Team darstellen kann.

Meine Expertise in JavaScript, React und modernen Web-Technologien sowie meine Leidenschaft für benutzerfreundliche Anwendungen machen mich zum idealen Kandidaten für diese Position. In meiner bisherigen Laufbahn konnte ich bereits erfolgreich mehrere React-Projekte leiten und bin bestrebt, diese Erfahrungen bei [Unternehmen] weiter auszubauen.

Ich freue mich auf die Möglichkeit, in einem persönlichen Gespräch mehr über die Position und Ihre Erwartungen zu erfahren.

Mit freundlichen Grüßen
[Ihr Name]`;
    }
    
    // ==================== UTILITY FUNCTIONS ====================
    
    isAPIKeyValid(apiKey) {
        return apiKey && apiKey.startsWith('sk-') && apiKey.length > 20;
    }
    
    hasValidAPIKey() {
        return this.isAPIKeyValid(this.config.openai.apiKey);
    }
    
    getConfig() {
        return { ...this.config };
    }
    
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
    }
}

// Global initialisieren
window.APIConfig = APIConfig;

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
    if (typeof window.apiConfig === 'undefined') {
        window.apiConfig = new APIConfig();
    }
});

// Export für Module-System
if (typeof module !== 'undefined' && module.exports) {
    module.exports = APIConfig;
}