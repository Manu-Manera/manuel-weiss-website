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
        this.contextMenu = null;
        this.alternativesModal = null;
        this.selectedText = '';
        this.selectedRange = null;
        this.init();
    }
    
    async init() {
        console.log('🎓 Initializing CV Tailor with advanced features...');
        
        // Create UI components
        this.createContextMenu();
        this.createAlternativesModal();
        
        // Setup global event handlers
        this.setupGlobalEventHandlers();
        
        console.log('✅ CV Tailor initialized with advanced features');
    }
    
    setupGlobalEventHandlers() {
        // Hide context menu on click outside
        document.addEventListener('click', (e) => {
            if (this.contextMenu && !this.contextMenu.contains(e.target)) {
                this.contextMenu.style.display = 'none';
            }
        });
    }
    
    createContextMenu() {
        // Create context menu element
        const menu = document.createElement('div');
        menu.className = 'cv-context-menu';
        menu.innerHTML = `
            <div class="context-menu-item" onclick="window.cvTailor.generateAlternatives()">
                <i class="fas fa-lightbulb"></i>
                Formulierungsvorschläge
            </div>
            <div class="context-menu-item" onclick="window.cvTailor.improveText()">
                <i class="fas fa-magic"></i>
                Text verbessern
            </div>
            <div class="context-menu-item" onclick="window.cvTailor.shortenText()">
                <i class="fas fa-compress-alt"></i>
                Text kürzen
            </div>
            <div class="context-menu-item" onclick="window.cvTailor.expandText()">
                <i class="fas fa-expand-alt"></i>
                Text erweitern
            </div>
            <div class="context-menu-item" onclick="window.cvTailor.makeMoreProfessional()">
                <i class="fas fa-briefcase"></i>
                Professioneller formulieren
            </div>
        `;
        
        document.body.appendChild(menu);
        this.contextMenu = menu;
        
        // Add styles if not already added
        if (!document.querySelector('#cv-tailor-context-styles')) {
            const style = document.createElement('style');
            style.id = 'cv-tailor-context-styles';
            style.textContent = `
                .cv-context-menu {
                    position: fixed;
                    background: white;
                    border: 1px solid #ddd;
                    border-radius: 8px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    display: none;
                    z-index: 10000;
                    padding: 8px 0;
                    min-width: 220px;
                }
                
                .context-menu-item {
                    padding: 10px 16px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    transition: background-color 0.2s;
                    font-size: 14px;
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
    }
    
    createAlternativesModal() {
        // Create modal for alternatives
        const modal = document.createElement('div');
        modal.className = 'cv-alternatives-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Formulierungsvorschläge für Lebenslauf</h3>
                    <button class="modal-close" onclick="window.cvTailor.closeAlternativesModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="original-text">
                        <strong>Original:</strong>
                        <p id="cvOriginalText"></p>
                    </div>
                    <div class="alternatives-list" id="cvAlternativesList">
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
        
        // Add styles if not already added
        if (!document.querySelector('#cv-tailor-modal-styles')) {
            const style = document.createElement('style');
            style.id = 'cv-tailor-modal-styles';
            style.textContent = `
                .cv-alternatives-modal {
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
    }
    
    enableEditableFeatures(element) {
        // Enable context menu for the element
        element.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.handleContextMenu(e);
        });
        
        // Text selection handler
        element.addEventListener('mouseup', () => {
            const selection = window.getSelection();
            if (selection.toString().trim()) {
                this.selectedText = selection.toString();
                // Save the selection for later replacement
                if (element.tagName === 'TEXTAREA' || element.tagName === 'INPUT') {
                    this.selectedRange = {
                        start: element.selectionStart,
                        end: element.selectionEnd,
                        element: element
                    };
                } else {
                    this.selectedRange = {
                        selection: selection.getRangeAt(0),
                        element: element
                    };
                }
            }
        });
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
            alert('Bitte wählen Sie zuerst Text aus');
            return;
        }
        
        try {
            const apiKey = await this.getAPIKey();
            
            // Show modal
            this.alternativesModal.style.display = 'flex';
            document.getElementById('cvOriginalText').textContent = this.selectedText;
            document.getElementById('cvAlternativesList').innerHTML = `
                <div class="loading-alternatives">
                    <i class="fas fa-spinner fa-spin"></i>
                    Generiere Vorschläge...
                </div>
            `;
            
            const alternatives = await this.callOpenAIForAlternatives(this.selectedText);
            this.displayAlternatives(alternatives);
        } catch (error) {
            console.error('Error generating alternatives:', error);
            alert('Fehler beim Generieren der Alternativen: ' + error.message);
            this.closeAlternativesModal();
        }
    }
    
    async callOpenAIForAlternatives(text) {
        const apiKey = await this.getAPIKey();
        
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: 'Du bist ein Experte für professionelle Lebensläufe. Generiere 3 alternative Formulierungen für den gegebenen Text. Die Alternativen sollten professionell, prägnant und aussagekräftig sein. Gib nur die 3 Alternativen zurück, nummeriert von 1-3.'
                    },
                    {
                        role: 'user',
                        content: `Generiere 3 alternative Formulierungen für Lebenslauf: "${text}"`
                    }
                ],
                temperature: 0.8,
                max_tokens: 300
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
        const container = document.getElementById('cvAlternativesList');
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
        if (this.selectedRange) {
            if (this.selectedRange.element && (this.selectedRange.element.tagName === 'TEXTAREA' || this.selectedRange.element.tagName === 'INPUT')) {
                // For text inputs/textareas
                const element = this.selectedRange.element;
                const currentText = element.value;
                const newContent = currentText.substring(0, this.selectedRange.start) + 
                                  newText + 
                                  currentText.substring(this.selectedRange.end);
                
                element.value = newContent;
                
                // Trigger input event
                element.dispatchEvent(new Event('input', { bubbles: true }));
            } else if (this.selectedRange.selection) {
                // For contenteditable or other elements
                this.selectedRange.selection.deleteContents();
                this.selectedRange.selection.insertNode(document.createTextNode(newText));
            }
            
            // Close modal
            this.closeAlternativesModal();
            
            // Show success message
            this.showNotification('Text wurde erfolgreich ersetzt', 'success');
        }
    }
    
    closeAlternativesModal() {
        this.alternativesModal.style.display = 'none';
    }
    
    async improveText() {
        this.contextMenu.style.display = 'none';
        await this.processTextWithInstruction('Verbessere diesen Lebenslauf-Text und mache ihn professioneller und aussagekräftiger');
    }
    
    async shortenText() {
        this.contextMenu.style.display = 'none';
        await this.processTextWithInstruction('Kürze diesen Lebenslauf-Text auf das Wesentliche ohne wichtige Informationen zu verlieren');
    }
    
    async expandText() {
        this.contextMenu.style.display = 'none';
        await this.processTextWithInstruction('Erweitere diesen Lebenslauf-Text mit mehr relevanten Details und Erfolgen');
    }
    
    async makeMoreProfessional() {
        this.contextMenu.style.display = 'none';
        await this.processTextWithInstruction('Formuliere diesen Lebenslauf-Text noch professioneller und verwende starke Aktionsverben');
    }
    
    async processTextWithInstruction(instruction) {
        if (!this.selectedText) return;
        
        try {
            const apiKey = await this.getAPIKey();
            
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: [
                        {
                            role: 'system',
                            content: 'Du bist ein Experte für professionelle Lebensläufe und Karriereberatung.'
                        },
                        {
                            role: 'user',
                            content: `${instruction}: "${this.selectedText}"`
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 200
                })
            });
            
            const data = await response.json();
            const improvedText = data.choices[0].message.content;
            
            // Apply the improved text
            this.applyAlternative(improvedText);
            
        } catch (error) {
            console.error('Error processing text:', error);
            alert('Fehler bei der Textverarbeitung: ' + error.message);
        }
    }
    
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `cv-notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'error' ? 'exclamation-circle' : type === 'success' ? 'check-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        // Add styles if not already added
        if (!document.querySelector('#cv-notification-styles')) {
            const style = document.createElement('style');
            style.id = 'cv-notification-styles';
            style.textContent = `
                .cv-notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: white;
                    padding: 16px 20px;
                    border-radius: 8px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    z-index: 10002;
                    animation: slideIn 0.3s ease-out;
                }
                
                .cv-notification.notification-success {
                    border-left: 4px solid #4caf50;
                }
                
                .cv-notification.notification-error {
                    border-left: 4px solid #f44336;
                }
                
                .cv-notification.notification-info {
                    border-left: 4px solid #2196f3;
                }
                
                .notification-content {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                
                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(notification);
        
        // Remove after 5 seconds
        setTimeout(() => {
            notification.remove();
        }, 5000);
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

            // Handle 502 Bad Gateway and other server errors
            if (response.status === 502 || response.status === 503 || response.status === 504) {
                throw new Error(`Netlify Function nicht verfügbar (${response.status}). Bitte versuchen Sie es in ein paar Sekunden erneut.`);
            }

            if (!response.ok) {
                const errorText = await response.text();
                let errorData;
                try {
                    errorData = JSON.parse(errorText);
                } catch {
                    errorData = { error: errorText || `HTTP ${response.status}` };
                }
                throw new Error(errorData.error || `Fehler beim Parsen der Dateien (${response.status})`);
            }

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

            if (response.status === 502 || response.status === 503 || response.status === 504) {
                throw new Error(`Netlify Function nicht verfügbar (${response.status}). Bitte versuchen Sie es in ein paar Sekunden erneut.`);
            }

            if (!response.ok) {
                const errorText = await response.text();
                let errorData;
                try {
                    errorData = JSON.parse(errorText);
                } catch {
                    errorData = { error: errorText || `HTTP ${response.status}` };
                }
                throw new Error(errorData.error || `Fehler bei der Baseline-CV Generierung (${response.status})`);
            }

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

            if (response.status === 502 || response.status === 503 || response.status === 504) {
                throw new Error(`Netlify Function nicht verfügbar (${response.status}). Bitte versuchen Sie es in ein paar Sekunden erneut.`);
            }

            if (!response.ok) {
                const errorText = await response.text();
                let errorData;
                try {
                    errorData = JSON.parse(errorText);
                } catch {
                    errorData = { error: errorText || `HTTP ${response.status}` };
                }
                throw new Error(errorData.error || `Fehler beim Parsen der Stellenausschreibung (${response.status})`);
            }

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

            if (response.status === 502 || response.status === 503 || response.status === 504) {
                throw new Error(`Netlify Function nicht verfügbar (${response.status}). Bitte versuchen Sie es in ein paar Sekunden erneut.`);
            }

            if (!response.ok) {
                const errorText = await response.text();
                let errorData;
                try {
                    errorData = JSON.parse(errorText);
                } catch {
                    errorData = { error: errorText || `HTTP ${response.status}` };
                }
                throw new Error(errorData.error || `Fehler bei der Targeted-CV Generierung (${response.status})`);
            }

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

