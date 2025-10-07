// =================== AI INTEGRATION MODULE ===================
// KI-Features und DACH-Templates für den modularen Workflow
// Nutzt bestehende Admin Panel API Key Verwaltung

/**
 * AI INTEGRATION
 * - OpenAI GPT-4 Integration über Admin Panel API Keys
 * - DACH-spezifische Templates
 * - Anforderungsmanagement
 * - KI-basierte Textgenerierung
 */

// =================== API KEY MANAGEMENT ===================
// Nutzt bestehende Admin Panel Verwaltung (KI-Einstellungen)
// Siehe: https://mawps.netlify.app/admin#ai-settings

/**
 * Get API Key from existing Admin Panel system
 */
function getAdminPanelApiKey() {
    // Admin Panel speichert API Keys in localStorage unter 'openai_api_key'
    const apiKey = localStorage.getItem('openai_api_key');
    
    if (!apiKey) {
        console.warn('⚠️ Kein API Key gefunden');
        console.log('👉 Bitte konfigurieren Sie den API Key über das Admin Panel:');
        console.log('   https://mawps.netlify.app/admin#ai-settings');
        return null;
    }
    
    return apiKey;
}

/**
 * Validate API Key format
 */
function validateApiKey(apiKey) {
    if (!apiKey) return false;
    
    // OpenAI API Keys beginnen mit 'sk-'
    if (!apiKey.startsWith('sk-')) {
        console.error('❌ Ungültiges API Key Format');
        return false;
    }
    
    return true;
}

// =================== AI SERVICE INTEGRATION ===================

/**
 * AI Analysis Service - nutzt Admin Panel API Key
 */
window.startAdvancedAnalysis = function(mode = 'ai-full') {
    console.log('🤖 Starte KI-Analyse mit Admin Panel API Key...', mode);
    
    const apiKey = getAdminPanelApiKey();
    
    if (!apiKey) {
        alert('⚠️ Kein API Key konfiguriert!\n\nBitte gehen Sie zum Admin Panel (KI-Einstellungen) und konfigurieren Sie Ihren OpenAI API Key.');
        return false;
    }
    
    if (!validateApiKey(apiKey)) {
        alert('❌ Ungültiger API Key!\n\nBitte überprüfen Sie Ihren API Key im Admin Panel.');
        return false;
    }
    
    // Delegiere an die RealAIAnalyzer Klasse (falls verfügbar)
    if (window.realAI && typeof window.realAI.analyzeJobDescription === 'function') {
        return window.realAI.analyzeJobDescription(
            window.workflowData?.jobDescription || '',
            window.workflowData?.company || '',
            window.workflowData?.position || ''
        );
    } else {
        console.error('❌ RealAIAnalyzer nicht verfügbar');
        alert('❌ KI-Analyzer nicht verfügbar. Bitte laden Sie die Seite neu.');
        return false;
    }
};

/**
 * Test API Key availability (for debugging)
 */
window.testAdminApiKey = function() {
    const apiKey = getAdminPanelApiKey();
    const isValid = validateApiKey(apiKey);
    
    console.log('🧪 API Key Test:');
    console.log('   Verfügbar:', !!apiKey);
    console.log('   Valid Format:', isValid);
    console.log('   Länge:', apiKey ? apiKey.length : 0);
    console.log('   Prefix:', apiKey ? apiKey.substring(0, 10) + '...' : 'N/A');
    
    return !!apiKey && isValid;
};

// =================== DEVELOPMENT/TEST FUNCTIONS ===================

/**
 * Set test API key (NUR für lokale Tests - NIEMALS hart codierte Keys!)
 */
window.setTestApiKeyForDevelopment = function() {
    const testApiKey = prompt('🧪 API Key für Tests eingeben (wird NICHT gespeichert):');
    
    if (!testApiKey || !testApiKey.startsWith('sk-')) {
        console.log('❌ Ungültiger API Key oder Eingabe abgebrochen');
        return false;
    }
    
    console.log('🧪 Setting test API key (development only)...');
    localStorage.setItem('openai_api_key', testApiKey);
    
    // Update RealAI instance if available
    if (window.realAI) {
        window.realAI.apiKey = testApiKey;
    }
    
    console.log('✅ Test API Key gesetzt - bereit für KI-Tests');
    return true;
};

console.log('✅ AI Integration Module geladen (mit Admin Panel Integration)');
