/**
 * CV Tailor - Frontend Integration
 * Nutzt den bestehenden API-Key-Mechanismus (global-ai-service.js)
 */

class CVTailor {
    constructor() {
        this.apiBase = '/.netlify/functions';
        this.cvData = null;
        this.baselineCV = null;
        this.targetedCV = null;
        this.jobData = null;
    }

    /**
     * Lädt API Key aus global-ai-service
     */
    async getAPIKey() {
        // Versuche zuerst global-ai-service
        if (window.globalAI) {
            // Warte auf Initialisierung
            if (!window.globalAI.isReady) {
                await window.globalAI.initialize();
            }
            
            if (window.globalAI.isAPIReady()) {
                const apiKey = window.globalAI.apiKey || 
                              (window.globalAI.apiManager && window.globalAI.apiManager.getAPIKey()) ||
                              (window.secureAPIManager && window.secureAPIManager.getAPIKey());
                
                if (apiKey && apiKey.startsWith('sk-')) {
                    return apiKey;
                }
            }
        }
        
        // Fallback: Versuche aus localStorage
        let apiKey = localStorage.getItem('openai_api_key');
        
        if (!apiKey) {
            // Versuche global_api_keys
            const globalKeysStr = localStorage.getItem('global_api_keys');
            if (globalKeysStr) {
                try {
                    const globalKeys = JSON.parse(globalKeysStr);
                    apiKey = globalKeys?.openai?.key;
                } catch (e) {
                    console.warn('Fehler beim Parsen von global_api_keys:', e);
                }
            }
        }
        
        if (apiKey && apiKey.startsWith('sk-')) {
            return apiKey;
        }
        
        throw new Error('Kein API Key verfügbar. Bitte in den KI-Einstellungen konfigurieren.');
    }

    /**
     * Parst CV und Zeugnisse
     */
    async parseFiles(files) {
        try {
            const apiKey = await this.getAPIKey();
            
            // Konvertiere Files zu Base64 für Übertragung
            const filePromises = Array.from(files).map(file => {
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve({
                        name: file.name,
                        type: file.type,
                        size: file.size,
                        content: reader.result.split(',')[1] // Base64 ohne Prefix
                    });
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });
            });

            const fileData = await Promise.all(filePromises);

            const response = await fetch(`${this.apiBase}/cv-files-parse`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    apiKey: apiKey,
                    files: fileData
                })
            });

            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.error || 'Fehler beim Parsen der Dateien');
            }

            this.cvData = result.data;
            return result.data;

        } catch (error) {
            console.error('CV Parse Error:', error);
            throw error;
        }
    }

    /**
     * Generiert Baseline-CV
     */
    async generateBaselineCV(cvData) {
        try {
            const apiKey = await this.getAPIKey();

            const response = await fetch(`${this.apiBase}/cv-general`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    apiKey: apiKey,
                    cvData: cvData || this.cvData
                })
            });

            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.error || 'Fehler bei der Baseline-CV Generierung');
            }

            this.baselineCV = result.baselineCV;
            return result.baselineCV;

        } catch (error) {
            console.error('Baseline CV Generation Error:', error);
            throw error;
        }
    }

    /**
     * Parst Stellenausschreibung
     */
    async parseJobPosting(jobInput, inputType = 'text') {
        try {
            const apiKey = await this.getAPIKey();

            const response = await fetch(`${this.apiBase}/cv-job-parse`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    apiKey: apiKey,
                    jobInput: jobInput,
                    inputType: inputType
                })
            });

            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.error || 'Fehler beim Parsen der Stellenausschreibung');
            }

            this.jobData = result.jobData;
            return result.jobData;

        } catch (error) {
            console.error('Job Parse Error:', error);
            throw error;
        }
    }

    /**
     * Generiert Targeted-CV
     */
    async generateTargetedCV(baselineCV, jobData) {
        try {
            const apiKey = await this.getAPIKey();

            const response = await fetch(`${this.apiBase}/cv-target`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    apiKey: apiKey,
                    baselineCV: baselineCV || this.baselineCV,
                    jobData: jobData || this.jobData
                })
            });

            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.error || 'Fehler bei der Targeted-CV Generierung');
            }

            this.targetedCV = result.targetedCV;
            return result.targetedCV;

        } catch (error) {
            console.error('Targeted CV Generation Error:', error);
            throw error;
        }
    }

    /**
     * Exportiert CV
     */
    async exportCV(cvContent, format = 'docx', fileName = null) {
        try {
            const response = await fetch(`${this.apiBase}/cv-export`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    format: format,
                    cvContent: cvContent,
                    fileName: fileName
                })
            });

            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.error || 'Fehler beim Export');
            }

            // In Produktion: Download des generierten Dokuments
            // Für jetzt: Download als Text-Datei
            const blob = new Blob([cvContent], { type: 'text/plain' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName || `cv-${Date.now()}.txt`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            return result;

        } catch (error) {
            console.error('CV Export Error:', error);
            throw error;
        }
    }

    /**
     * Kompletter Workflow: Upload → Baseline → Job Parse → Targeted → Export
     */
    async fullWorkflow(files, jobInput, inputType = 'text') {
        try {
            // 1. Parse Files
            console.log('📄 Schritt 1: Parse CV und Zeugnisse...');
            const cvData = await this.parseFiles(files);
            
            // 2. Generate Baseline
            console.log('✨ Schritt 2: Generiere Baseline-CV...');
            const baseline = await this.generateBaselineCV(cvData);
            
            // 3. Parse Job
            console.log('🔍 Schritt 3: Parse Stellenausschreibung...');
            const jobData = await this.parseJobPosting(jobInput, inputType);
            
            // 4. Generate Targeted
            console.log('🎯 Schritt 4: Generiere Targeted-CV...');
            const targeted = await this.generateTargetedCV(baseline, jobData);
            
            return {
                success: true,
                cvData: cvData,
                baselineCV: baseline,
                jobData: jobData,
                targetedCV: targeted
            };

        } catch (error) {
            console.error('Full Workflow Error:', error);
            throw error;
        }
    }
}

// Global verfügbar machen
window.cvTailor = new CVTailor();

// Für andere Seiten
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CVTailor;
}

