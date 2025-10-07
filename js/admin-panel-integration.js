// =================== ADMIN PANEL INTEGRATION ===================
// Automatische Hintergrundverknüpfung zwischen Workflow und Admin Panel API Key
// Eliminiert alle manuellen API Key Prompts

/**
 * ADMIN PANEL INTEGRATION
 * - Automatische API Key Erkennung
 * - Live-Synchronisation zwischen Admin Panel und Workflow
 * - Seamless Background Integration
 * - Keine User Prompts für API Keys
 */

class AdminPanelIntegration {
    constructor() {
        this.apiKey = null;
        this.lastCheck = null;
        this.checkInterval = 5000; // Check every 5 seconds
        this.listeners = [];
        
        this.initializeIntegration();
    }
    
    /**
     * Initialize automatic integration
     */
    initializeIntegration() {
        console.log('🔗 Initialisiere Admin Panel Integration...');
        
        // Initial API Key check
        this.checkApiKey();
        
        // Setup automatic monitoring
        this.startApiKeyMonitoring();
        
        // Setup localStorage listener for real-time updates
        this.setupStorageListener();
        
        console.log('✅ Admin Panel Integration aktiv');
    }
    
    /**
     * Check for API Key in Admin Panel storage
     */
    checkApiKey() {
        const previousKey = this.apiKey;
        
        // Check multiple storage locations used by Admin Panel
        this.apiKey = localStorage.getItem('openai_api_key') || 
                     localStorage.getItem('ai_api_key') ||
                     sessionStorage.getItem('openai_api_key') ||
                     null;
        
        const now = Date.now();
        this.lastCheck = now;
        
        // Log status change
        if (previousKey !== this.apiKey) {
            if (this.apiKey) {
                console.log('✅ API Key aus Admin Panel erkannt');
                console.log(`🔑 Key Format: ${this.apiKey.substring(0, 10)}...`);
                this.notifyListeners('api_key_available', this.apiKey);
                this.updateWorkflowInstances();
            } else {
                console.log('⚠️ Kein API Key im Admin Panel gefunden');
                this.notifyListeners('api_key_missing', null);
            }
        }
        
        return !!this.apiKey;
    }
    
    /**
     * Start automatic API Key monitoring
     */
    startApiKeyMonitoring() {
        // Check every 5 seconds for API Key updates
        setInterval(() => {
            this.checkApiKey();
        }, this.checkInterval);
        
        console.log(`🔄 API Key Monitoring gestartet (${this.checkInterval}ms Intervall)`);
    }
    
    /**
     * Setup real-time localStorage listener
     */
    setupStorageListener() {
        window.addEventListener('storage', (e) => {
            if (e.key === 'openai_api_key' || e.key === 'ai_api_key') {
                console.log('🔄 Storage Change erkannt:', e.key);
                setTimeout(() => {
                    this.checkApiKey();
                }, 100);
            }
        });
        
        // Also listen for same-window storage changes
        const originalSetItem = Storage.prototype.setItem;
        Storage.prototype.setItem = function(key, value) {
            if (key === 'openai_api_key' || key === 'ai_api_key') {
                console.log('🔄 API Key Update erkannt:', key);
                originalSetItem.call(this, key, value);
                setTimeout(() => {
                    window.adminPanelIntegration?.checkApiKey();
                }, 100);
            } else {
                originalSetItem.call(this, key, value);
            }
        };
    }
    
    /**
     * Update all workflow instances with new API Key
     */
    updateWorkflowInstances() {
        if (!this.apiKey) return;
        
        // Update RealAIAnalyzer instance
        if (window.realAI) {
            window.realAI.apiKey = this.apiKey;
            console.log('🤖 RealAI Analyzer API Key aktualisiert');
        }
        
        // Update any other AI services
        if (window.globalAIService) {
            window.globalAIService.updateApiKey?.(this.apiKey);
            console.log('🌐 GlobalAI Service API Key aktualisiert');
        }
        
        // Notify workflow if analysis was waiting for API Key
        if (window.smartWorkflow) {
            window.smartWorkflow.onApiKeyAvailable?.(this.apiKey);
        }
        
        console.log('🔄 Alle Workflow-Instanzen aktualisiert');
    }
    
    /**
     * Get current API Key
     */
    getApiKey() {
        // Always return fresh check
        this.checkApiKey();
        return this.apiKey;
    }
    
    /**
     * Check if API Key is available
     */
    isApiKeyAvailable() {
        return !!this.getApiKey();
    }
    
    /**
     * Add listener for API Key changes
     */
    addListener(callback) {
        this.listeners.push(callback);
    }
    
    /**
     * Remove listener
     */
    removeListener(callback) {
        this.listeners = this.listeners.filter(l => l !== callback);
    }
    
    /**
     * Notify all listeners
     */
    notifyListeners(event, data) {
        this.listeners.forEach(callback => {
            try {
                callback(event, data);
            } catch (error) {
                console.error('❌ Listener error:', error);
            }
        });
    }
    
    /**
     * Show Admin Panel configuration hint
     */
    showConfigurationHint() {
        const hint = document.createElement('div');
        hint.style.cssText = `
            position: fixed;
            top: 1rem;
            right: 1rem;
            background: linear-gradient(135deg, #3b82f6, #1d4ed8);
            color: white;
            padding: 1rem;
            border-radius: 8px;
            max-width: 300px;
            z-index: 10003;
            box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
            animation: slideInRight 0.3s ease-out;
        `;
        
        hint.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
                <strong style="font-size: 0.9rem;">🔑 API Key Konfiguration</strong>
                <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; color: white; cursor: pointer; font-size: 1.2rem;">×</button>
            </div>
            <p style="margin: 0; font-size: 0.8rem; line-height: 1.4;">
                Konfigurieren Sie Ihren OpenAI API Key im Admin Panel für KI-Features.
            </p>
            <div style="margin-top: 0.75rem;">
                <button onclick="window.open('admin.html#ai-settings', '_blank')" style="
                    background: rgba(255,255,255,0.2);
                    color: white;
                    border: 1px solid rgba(255,255,255,0.3);
                    padding: 0.4rem 0.8rem;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 0.75rem;
                ">
                    Admin Panel öffnen
                </button>
            </div>
        `;
        
        // Add animation styles
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        if (!document.head.querySelector('style[data-admin-hints]')) {
            style.setAttribute('data-admin-hints', 'true');
            document.head.appendChild(style);
        }
        
        document.body.appendChild(hint);
        
        // Auto remove after 10 seconds
        setTimeout(() => {
            if (hint.parentNode) {
                hint.remove();
            }
        }, 10000);
    }
    
    /**
     * Get diagnostic information
     */
    getDiagnostics() {
        return {
            apiKeyAvailable: !!this.apiKey,
            apiKeyLength: this.apiKey ? this.apiKey.length : 0,
            apiKeyPrefix: this.apiKey ? this.apiKey.substring(0, 10) : 'N/A',
            lastCheck: this.lastCheck,
            checkInterval: this.checkInterval,
            listenersCount: this.listeners.length,
            storageKeys: {
                openai_api_key: !!localStorage.getItem('openai_api_key'),
                ai_api_key: !!localStorage.getItem('ai_api_key'),
                session_openai: !!sessionStorage.getItem('openai_api_key')
            }
        };
    }
}

// Initialize global instance
window.adminPanelIntegration = new AdminPanelIntegration();

// Add to RealAIAnalyzer for automatic integration
if (window.RealAIAnalyzer) {
    const originalGetApiKey = window.RealAIAnalyzer.prototype.getApiKey;
    window.RealAIAnalyzer.prototype.getApiKey = function() {
        // Use integrated API Key from Admin Panel
        return window.adminPanelIntegration.getApiKey();
    };
    
    console.log('✅ RealAIAnalyzer automatisch mit Admin Panel verknüpft');
}

// Convenience functions for global access
window.getAdminPanelApiKey = function() {
    return window.adminPanelIntegration.getApiKey();
};

window.isApiKeyConfigured = function() {
    return window.adminPanelIntegration.isApiKeyAvailable();
};

window.showApiKeyConfig = function() {
    if (window.adminPanelIntegration.isApiKeyAvailable()) {
        alert('✅ API Key ist bereits konfiguriert!');
    } else {
        window.adminPanelIntegration.showConfigurationHint();
    }
};

window.getApiKeyDiagnostics = function() {
    const diagnostics = window.adminPanelIntegration.getDiagnostics();
    console.table(diagnostics);
    return diagnostics;
};

console.log('✅ Admin Panel Integration geladen - Automatische API Key Verknüpfung aktiv');
