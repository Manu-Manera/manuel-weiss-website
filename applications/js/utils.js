/**
 * BEWERBUNGSMANAGER - SHARED UTILITIES
 * ====================================
 * Zentrale Utility-Funktionen für alle Bewerbungsmanager-Module
 * 
 * Konsolidiert aus:
 * - applications-core.js
 * - dashboard-core.js
 * - ai-cover-letter-generator.js
 * - cv-tailor.js
 * - smart-cover-letter.js
 */

// ═══════════════════════════════════════════════════════════════════════════
// API KEY MANAGEMENT (Beste Version aus ai-cover-letter-generator.js)
// ═══════════════════════════════════════════════════════════════════════════

const AIProviderManager = {
    /**
     * Holt den aktiven AI-Provider mit API-Key
     * Prioritäten:
     * 1. AWS DynamoDB (Admin-Konfiguration)
     * 2. Admin-Panel State (localStorage)
     * 3. GlobalAPIManager
     * 4. global_api_keys (localStorage)
     * 5. Legacy openai_api_key
     */
    async getActiveProvider() {
        // PRIORITÄT 1: AWS DynamoDB (Admin-Konfiguration)
        try {
            if (window.awsProfileAPI && window.awsProfileAPI.isInitialized) {
                const adminProfile = await window.awsProfileAPI.loadProfile('admin').catch(() => 
                    window.awsProfileAPI.loadProfile('owner').catch(() => null)
                );
                
                if (adminProfile?.apiKeys) {
                    const provider = this._extractProviderFromKeys(adminProfile.apiKeys);
                    if (provider) {
                        console.log(`✅ Nutze ${provider.type} API Key aus AWS DynamoDB`);
                        return provider;
                    }
                }
            }
        } catch (error) {
            console.warn('⚠️ Fehler beim Lesen aus AWS DynamoDB:', error);
        }

        // PRIORITÄT 2: Admin-Panel State
        try {
            const adminState = localStorage.getItem('admin_state');
            if (adminState) {
                const state = JSON.parse(adminState);
                const provider = this._extractProviderFromKeys(state?.apiKeys);
                if (provider) {
                    console.log(`✅ Nutze ${provider.type} API Key aus Admin-Panel`);
                    return provider;
                }
            }
        } catch (error) {
            console.warn('⚠️ Fehler beim Lesen des Admin-Panel States:', error);
        }

        // PRIORITÄT 3: GlobalAPIManager
        const manager = window.GlobalAPIManager;
        if (manager) {
            for (const type of ['openai', 'anthropic', 'google']) {
                if (manager.isServiceEnabled?.(type)) {
                    const config = manager.getServiceConfig(type);
                    if (this._isValidKey(config?.key, type)) {
                        console.log(`✅ Nutze ${type} API Key aus GlobalAPIManager`);
                        return { type, key: config.key, config };
                    }
                }
            }
        }

        // PRIORITÄT 4: global_api_keys (localStorage)
        try {
            const raw = localStorage.getItem('global_api_keys');
            if (raw) {
                const parsed = JSON.parse(raw);
                const provider = this._extractProviderFromKeys(parsed);
                if (provider) {
                    console.log(`✅ Nutze ${provider.type} API Key aus global_api_keys`);
                    return provider;
                }
            }
        } catch (error) {
            console.warn('⚠️ Konnte global_api_keys nicht lesen:', error);
        }

        // PRIORITÄT 5: Legacy openai_api_key
        const legacyKey = localStorage.getItem('openai_api_key');
        if (this._isValidKey(legacyKey, 'openai')) {
            console.log('✅ Nutze OpenAI API Key aus Legacy-Speicher');
            return {
                type: 'openai',
                key: legacyKey,
                config: { model: 'gpt-4o-mini', maxTokens: 1000, temperature: 0.7 }
            };
        }

        console.warn('❌ Kein gültiger API Key gefunden');
        return null;
    },

    _extractProviderFromKeys(apiKeys) {
        if (!apiKeys) return null;

        // OpenAI
        if (apiKeys.openai?.apiKey && this._isValidKey(apiKeys.openai.apiKey, 'openai')) {
            return {
                type: 'openai',
                key: apiKeys.openai.apiKey,
                config: {
                    model: apiKeys.openai.model || 'gpt-4o-mini',
                    maxTokens: apiKeys.openai.maxTokens || 1000,
                    temperature: apiKeys.openai.temperature || 0.7
                }
            };
        }
        
        // Check alternate key formats
        if (apiKeys.openai?.key && this._isValidKey(apiKeys.openai.key, 'openai')) {
            return {
                type: 'openai',
                key: apiKeys.openai.key,
                config: apiKeys.openai
            };
        }

        // Anthropic
        if (apiKeys.anthropic?.apiKey && this._isValidKey(apiKeys.anthropic.apiKey, 'anthropic')) {
            return {
                type: 'anthropic',
                key: apiKeys.anthropic.apiKey,
                config: {
                    model: apiKeys.anthropic.model || 'claude-3-sonnet-20240229',
                    maxTokens: apiKeys.anthropic.maxTokens || 1000,
                    temperature: apiKeys.anthropic.temperature || 0.7
                }
            };
        }

        // Google
        if (apiKeys.google?.apiKey && this._isValidKey(apiKeys.google.apiKey, 'google')) {
            return {
                type: 'google',
                key: apiKeys.google.apiKey,
                config: {
                    model: apiKeys.google.model || 'gemini-pro',
                    maxTokens: apiKeys.google.maxTokens || 1000,
                    temperature: apiKeys.google.temperature || 0.7
                }
            };
        }

        return null;
    },

    _isValidKey(key, type) {
        if (!key || typeof key !== 'string') return false;
        const trimmed = key.trim();
        
        switch (type) {
            case 'openai':
                return trimmed.length > 20 && (trimmed.startsWith('sk-') || trimmed.startsWith('rk-'));
            case 'anthropic':
                return trimmed.length > 20 && trimmed.startsWith('sk-ant-');
            case 'google':
                return trimmed.length > 20 && trimmed.startsWith('AIza');
            default:
                return trimmed.length > 20;
        }
    },

    /**
     * Schneller Check ob API verfügbar
     */
    async isAPIAvailable() {
        const provider = await this.getActiveProvider();
        return provider !== null;
    },

    /**
     * API-Aufruf mit automatischer Provider-Auswahl
     */
    async callAI(prompt, options = {}) {
        const provider = await this.getActiveProvider();
        if (!provider) {
            throw new Error('Kein API Key verfügbar. Bitte in den Einstellungen konfigurieren.');
        }

        const systemPrompt = options.systemPrompt || 'Du bist ein hilfreicher Assistent für Bewerbungen.';
        const maxTokens = options.maxTokens || provider.config.maxTokens || 1000;
        const temperature = options.temperature ?? provider.config.temperature ?? 0.7;

        switch (provider.type) {
            case 'openai':
                return this._callOpenAI(provider, prompt, systemPrompt, maxTokens, temperature);
            case 'anthropic':
                return this._callAnthropic(provider, prompt, systemPrompt, maxTokens, temperature);
            case 'google':
                return this._callGoogle(provider, prompt, systemPrompt, maxTokens, temperature);
            default:
                throw new Error(`Unbekannter Provider: ${provider.type}`);
        }
    },

    async _callOpenAI(provider, prompt, systemPrompt, maxTokens, temperature) {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${provider.key}`
            },
            body: JSON.stringify({
                model: provider.config.model || 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: prompt }
                ],
                temperature,
                max_tokens: maxTokens
            })
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.error?.message || `OpenAI API Error: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    },

    async _callAnthropic(provider, prompt, systemPrompt, maxTokens, temperature) {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': provider.key,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: provider.config.model || 'claude-3-sonnet-20240229',
                max_tokens: maxTokens,
                temperature,
                system: systemPrompt,
                messages: [{ role: 'user', content: prompt }]
            })
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.error?.message || `Anthropic API Error: ${response.status}`);
        }

        const data = await response.json();
        return data.content?.[0]?.text || '';
    },

    async _callGoogle(provider, prompt, systemPrompt, maxTokens, temperature) {
        const model = provider.config.model || 'gemini-pro';
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${provider.key}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: systemPrompt },
                        { text: prompt }
                    ]
                }],
                generationConfig: { maxOutputTokens: maxTokens, temperature }
            })
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.error?.message || `Google AI Error: ${response.status}`);
        }

        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.map(p => p.text).join('\n') || '';
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// NOTIFICATION SYSTEM (Vereinheitlicht)
// ═══════════════════════════════════════════════════════════════════════════

const NotificationManager = {
    container: null,

    init() {
        if (this.container) return;
        
        this.container = document.createElement('div');
        this.container.id = 'notification-container';
        this.container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10002;
            display: flex;
            flex-direction: column;
            gap: 10px;
            pointer-events: none;
        `;
        document.body.appendChild(this.container);

        // Add styles
        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                .app-notification {
                    background: white;
                    padding: 16px 20px;
                    border-radius: 12px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    animation: notificationSlideIn 0.3s ease-out;
                    pointer-events: auto;
                    max-width: 400px;
                }
                
                .app-notification.success { border-left: 4px solid #10b981; }
                .app-notification.error { border-left: 4px solid #ef4444; }
                .app-notification.warning { border-left: 4px solid #f59e0b; }
                .app-notification.info { border-left: 4px solid #3b82f6; }
                
                .app-notification i {
                    font-size: 1.25rem;
                }
                .app-notification.success i { color: #10b981; }
                .app-notification.error i { color: #ef4444; }
                .app-notification.warning i { color: #f59e0b; }
                .app-notification.info i { color: #3b82f6; }
                
                .app-notification span {
                    flex: 1;
                    color: #374151;
                    font-size: 0.95rem;
                }
                
                .app-notification.hiding {
                    animation: notificationSlideOut 0.3s ease-in forwards;
                }
                
                @keyframes notificationSlideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                
                @keyframes notificationSlideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    },

    show(message, type = 'info', duration = 5000) {
        this.init();

        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };

        const notification = document.createElement('div');
        notification.className = `app-notification ${type}`;
        notification.innerHTML = `
            <i class="fas ${icons[type] || icons.info}"></i>
            <span>${escapeHtml(message)}</span>
        `;

        this.container.appendChild(notification);

        // Auto-remove
        setTimeout(() => {
            notification.classList.add('hiding');
            setTimeout(() => notification.remove(), 300);
        }, duration);

        return notification;
    },

    success(message, duration) { return this.show(message, 'success', duration); },
    error(message, duration) { return this.show(message, 'error', duration); },
    warning(message, duration) { return this.show(message, 'warning', duration); },
    info(message, duration) { return this.show(message, 'info', duration); }
};

// Alias für Kompatibilität
function showToast(message, type = 'info', duration = 5000) {
    return NotificationManager.show(message, type, duration);
}

function showNotification(message, type = 'info') {
    return NotificationManager.show(message, type);
}

// ═══════════════════════════════════════════════════════════════════════════
// TEXT EDITING CONTEXT MENU (Zusammengeführt aus ai-cover-letter & cv-tailor)
// ═══════════════════════════════════════════════════════════════════════════

const TextEditingTools = {
    contextMenu: null,
    alternativesModal: null,
    selectedText: '',
    selectedRange: null,
    targetElement: null,

    init() {
        if (this.contextMenu) return;
        
        this.createContextMenu();
        this.createAlternativesModal();
        this.setupGlobalHandlers();
    },

    createContextMenu() {
        const menu = document.createElement('div');
        menu.className = 'text-edit-context-menu';
        menu.innerHTML = `
            <div class="context-menu-item" data-action="alternatives">
                <i class="fas fa-lightbulb"></i>
                Formulierungsvorschläge
            </div>
            <div class="context-menu-item" data-action="improve">
                <i class="fas fa-magic"></i>
                Text verbessern
            </div>
            <div class="context-menu-item" data-action="shorten">
                <i class="fas fa-compress-alt"></i>
                Text kürzen
            </div>
            <div class="context-menu-item" data-action="expand">
                <i class="fas fa-expand-alt"></i>
                Text erweitern
            </div>
            <div class="context-menu-item" data-action="professional">
                <i class="fas fa-briefcase"></i>
                Professioneller
            </div>
        `;

        menu.querySelectorAll('.context-menu-item').forEach(item => {
            item.addEventListener('click', () => {
                const action = item.dataset.action;
                this.handleAction(action);
            });
        });

        document.body.appendChild(menu);
        this.contextMenu = menu;

        // Styles
        if (!document.querySelector('#text-edit-menu-styles')) {
            const style = document.createElement('style');
            style.id = 'text-edit-menu-styles';
            style.textContent = `
                .text-edit-context-menu {
                    position: fixed;
                    background: white;
                    border: 1px solid #e5e7eb;
                    border-radius: 12px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
                    display: none;
                    z-index: 10000;
                    padding: 8px 0;
                    min-width: 220px;
                    overflow: hidden;
                }
                
                .context-menu-item {
                    padding: 12px 16px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    transition: background-color 0.2s;
                    font-size: 0.9rem;
                    color: #374151;
                }
                
                .context-menu-item:hover {
                    background-color: #f3f4f6;
                }
                
                .context-menu-item i {
                    color: #6366f1;
                    width: 18px;
                    text-align: center;
                }
            `;
            document.head.appendChild(style);
        }
    },

    createAlternativesModal() {
        const modal = document.createElement('div');
        modal.className = 'text-alternatives-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-lightbulb"></i> Formulierungsvorschläge</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="original-text">
                        <strong>Original:</strong>
                        <p id="altOriginalText"></p>
                    </div>
                    <div class="alternatives-list" id="altList">
                        <div class="loading-alternatives">
                            <i class="fas fa-spinner fa-spin"></i>
                            Generiere Vorschläge...
                        </div>
                    </div>
                </div>
            </div>
        `;

        modal.querySelector('.modal-close').addEventListener('click', () => {
            this.closeModal();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.closeModal();
        });

        document.body.appendChild(modal);
        this.alternativesModal = modal;

        // Styles
        if (!document.querySelector('#text-alternatives-modal-styles')) {
            const style = document.createElement('style');
            style.id = 'text-alternatives-modal-styles';
            style.textContent = `
                .text-alternatives-modal {
                    position: fixed;
                    top: 0; left: 0;
                    width: 100%; height: 100%;
                    background: rgba(0,0,0,0.5);
                    display: none;
                    z-index: 10001;
                    justify-content: center;
                    align-items: center;
                }
                
                .text-alternatives-modal .modal-content {
                    background: white;
                    border-radius: 16px;
                    width: 90%;
                    max-width: 600px;
                    max-height: 80vh;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                }
                
                .text-alternatives-modal .modal-header {
                    padding: 20px 24px;
                    border-bottom: 1px solid #e5e7eb;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                
                .text-alternatives-modal .modal-header h3 {
                    margin: 0;
                    font-size: 1.25rem;
                    color: #1f2937;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                
                .text-alternatives-modal .modal-header h3 i {
                    color: #6366f1;
                }
                
                .text-alternatives-modal .modal-close {
                    background: none;
                    border: none;
                    font-size: 1.5rem;
                    color: #9ca3af;
                    cursor: pointer;
                    padding: 4px 8px;
                    line-height: 1;
                    transition: color 0.2s;
                }
                
                .text-alternatives-modal .modal-close:hover {
                    color: #374151;
                }
                
                .text-alternatives-modal .modal-body {
                    padding: 24px;
                    overflow-y: auto;
                }
                
                .text-alternatives-modal .original-text {
                    background: #f9fafb;
                    padding: 16px;
                    border-radius: 12px;
                    margin-bottom: 20px;
                    border: 1px solid #e5e7eb;
                }
                
                .text-alternatives-modal .original-text strong {
                    color: #6b7280;
                    font-size: 0.85rem;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
                
                .text-alternatives-modal .original-text p {
                    margin: 8px 0 0 0;
                    color: #374151;
                    font-style: italic;
                }
                
                .text-alternatives-modal .alternatives-list {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                
                .text-alternatives-modal .alternative-item {
                    padding: 16px;
                    border: 2px solid #e5e7eb;
                    border-radius: 12px;
                    cursor: pointer;
                    transition: all 0.2s;
                    position: relative;
                }
                
                .text-alternatives-modal .alternative-item:hover {
                    border-color: #6366f1;
                    background: #f5f3ff;
                }
                
                .text-alternatives-modal .alternative-text {
                    color: #1f2937;
                    line-height: 1.6;
                }
                
                .text-alternatives-modal .alternative-hint {
                    position: absolute;
                    top: 8px;
                    right: 12px;
                    font-size: 0.75rem;
                    color: #9ca3af;
                }
                
                .text-alternatives-modal .loading-alternatives {
                    text-align: center;
                    padding: 40px;
                    color: #6b7280;
                }
                
                .text-alternatives-modal .loading-alternatives i {
                    margin-right: 8px;
                    color: #6366f1;
                }
            `;
            document.head.appendChild(style);
        }
    },

    setupGlobalHandlers() {
        document.addEventListener('click', (e) => {
            if (this.contextMenu && !this.contextMenu.contains(e.target)) {
                this.contextMenu.style.display = 'none';
            }
        });
    },

    /**
     * Aktiviert Text-Editing-Features für ein Element
     */
    enableFor(element) {
        element.addEventListener('contextmenu', (e) => {
            const selection = window.getSelection().toString().trim();
            if (selection) {
                e.preventDefault();
                this.showContextMenu(e, element);
            }
        });

        element.addEventListener('mouseup', () => {
            const selection = window.getSelection().toString().trim();
            if (selection) {
                this.selectedText = selection;
                this.targetElement = element;
                
                if (element.tagName === 'TEXTAREA' || element.tagName === 'INPUT') {
                    this.selectedRange = {
                        start: element.selectionStart,
                        end: element.selectionEnd,
                        type: 'input'
                    };
                } else {
                    this.selectedRange = {
                        range: window.getSelection().getRangeAt(0).cloneRange(),
                        type: 'contenteditable'
                    };
                }
            }
        });
    },

    showContextMenu(e, element) {
        this.contextMenu.style.left = e.pageX + 'px';
        this.contextMenu.style.top = e.pageY + 'px';
        this.contextMenu.style.display = 'block';
    },

    async handleAction(action) {
        this.contextMenu.style.display = 'none';
        
        if (!this.selectedText) {
            showToast('Bitte wählen Sie zuerst Text aus', 'warning');
            return;
        }

        const instructions = {
            'alternatives': null, // Handled separately
            'improve': 'Verbessere diesen Text und mache ihn professioneller und aussagekräftiger',
            'shorten': 'Kürze diesen Text auf das Wesentliche ohne wichtige Informationen zu verlieren',
            'expand': 'Erweitere diesen Text mit mehr relevanten Details',
            'professional': 'Formuliere diesen Text professioneller und verwende starke Aktionsverben'
        };

        if (action === 'alternatives') {
            await this.showAlternatives();
        } else {
            await this.processText(instructions[action]);
        }
    },

    async showAlternatives() {
        this.alternativesModal.style.display = 'flex';
        document.getElementById('altOriginalText').textContent = this.selectedText;
        document.getElementById('altList').innerHTML = `
            <div class="loading-alternatives">
                <i class="fas fa-spinner fa-spin"></i>
                Generiere Vorschläge...
            </div>
        `;

        try {
            const prompt = `Generiere 3 alternative Formulierungen für: "${this.selectedText}"
            
Die Alternativen sollten professionell, prägnant und aussagekräftig sein.
Gib nur die 3 Alternativen zurück, nummeriert von 1-3, jeweils in einer neuen Zeile.`;

            const response = await AIProviderManager.callAI(prompt, {
                systemPrompt: 'Du bist ein Experte für professionelle Bewerbungsdokumente. Generiere präzise Formulierungsalternativen.',
                maxTokens: 300,
                temperature: 0.8
            });

            const alternatives = response.split('\n')
                .filter(line => line.match(/^[1-3]\./))
                .map(line => line.replace(/^[1-3]\.\s*/, '').trim());

            this.displayAlternatives(alternatives);
        } catch (error) {
            console.error('Error generating alternatives:', error);
            showToast('Fehler beim Generieren: ' + error.message, 'error');
            this.closeModal();
        }
    },

    displayAlternatives(alternatives) {
        const container = document.getElementById('altList');
        container.innerHTML = '';

        if (alternatives.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #6b7280;">Keine Alternativen gefunden.</p>';
            return;
        }

        alternatives.forEach(alt => {
            const item = document.createElement('div');
            item.className = 'alternative-item';
            item.innerHTML = `
                <div class="alternative-text">${escapeHtml(alt)}</div>
                <div class="alternative-hint">Klicken zum Übernehmen</div>
            `;

            item.addEventListener('click', () => {
                this.applyText(alt);
                this.closeModal();
            });

            container.appendChild(item);
        });
    },

    async processText(instruction) {
        try {
            showToast('Text wird verarbeitet...', 'info', 2000);
            
            const response = await AIProviderManager.callAI(
                `${instruction}: "${this.selectedText}"`,
                {
                    systemPrompt: 'Du bist ein Experte für professionelle Bewerbungsdokumente.',
                    maxTokens: 200,
                    temperature: 0.7
                }
            );

            this.applyText(response.trim());
            showToast('Text erfolgreich ersetzt', 'success');
        } catch (error) {
            console.error('Error processing text:', error);
            showToast('Fehler: ' + error.message, 'error');
        }
    },

    applyText(newText) {
        if (!this.selectedRange || !this.targetElement) return;

        if (this.selectedRange.type === 'input') {
            const el = this.targetElement;
            const current = el.value;
            el.value = current.substring(0, this.selectedRange.start) + 
                       newText + 
                       current.substring(this.selectedRange.end);
            el.dispatchEvent(new Event('input', { bubbles: true }));
        } else if (this.selectedRange.type === 'contenteditable') {
            const range = this.selectedRange.range;
            range.deleteContents();
            range.insertNode(document.createTextNode(newText));
        }
    },

    closeModal() {
        this.alternativesModal.style.display = 'none';
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Escape HTML für sichere Ausgabe
 */
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Formatiere Datum für Anzeige
 */
function formatDate(dateString, options = {}) {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    const defaultOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };
    
    return date.toLocaleDateString('de-DE', { ...defaultOptions, ...options });
}

/**
 * Formatiere relative Zeit
 */
function formatRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Heute';
    if (diffDays === 1) return 'Gestern';
    if (diffDays < 7) return `Vor ${diffDays} Tagen`;
    if (diffDays < 30) return `Vor ${Math.floor(diffDays / 7)} Wochen`;
    if (diffDays < 365) return `Vor ${Math.floor(diffDays / 30)} Monaten`;
    return `Vor ${Math.floor(diffDays / 365)} Jahren`;
}

/**
 * Generiere eindeutige ID
 */
function generateId(prefix = '') {
    return prefix + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

/**
 * Debounce-Funktion
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

/**
 * Kopiere Text in Zwischenablage
 */
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showToast('In Zwischenablage kopiert', 'success');
        return true;
    } catch (error) {
        console.error('Copy failed:', error);
        showToast('Kopieren fehlgeschlagen', 'error');
        return false;
    }
}

/**
 * Validiere E-Mail
 */
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Validiere URL
 */
function isValidUrl(url) {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// GLOBAL EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

window.AIProviderManager = AIProviderManager;
window.NotificationManager = NotificationManager;
window.TextEditingTools = TextEditingTools;

// Utility functions
window.showToast = showToast;
window.showNotification = showNotification;
window.escapeHtml = escapeHtml;
window.formatDate = formatDate;
window.formatRelativeTime = formatRelativeTime;
window.generateId = generateId;
window.debounce = debounce;
window.copyToClipboard = copyToClipboard;
window.isValidEmail = isValidEmail;
window.isValidUrl = isValidUrl;

console.log('✅ Bewerbungsmanager Utilities geladen');

