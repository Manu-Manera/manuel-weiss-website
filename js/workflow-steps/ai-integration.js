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
 * Get API Key from existing Admin Panel system (ECHTE Integration - KEIN FALLBACK)
 */
function getAdminPanelApiKey() {
    // ECHTE Implementation - direkt aus localStorage wie Admin Panel es speichert
    const apiKey = localStorage.getItem('openai_api_key');
    
    if (!apiKey) {
        console.error('❌ KRITISCH: Kein API Key gefunden in localStorage');
        console.error('👉 Admin Panel Key Status:', !!localStorage.getItem('openai_api_key'));
        console.error('👉 localStorage Keys:', Object.keys(localStorage));
        throw new Error('API Key nicht verfügbar. Admin Panel Konfiguration erforderlich.');
    }
    
    if (!apiKey.startsWith('sk-')) {
        console.error('❌ KRITISCH: API Key Format ungültig:', apiKey.substring(0, 10) + '...');
        throw new Error('API Key Format ungültig. Muss mit "sk-" beginnen.');
    }
    
    console.log('✅ API Key erfolgreich geladen:', apiKey.substring(0, 10) + '...');
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
 * Test API Key availability (Moderne Integration mit Diagnostics)
 */
window.testAdminApiKey = function() {
    console.log('🧪 Admin Panel API Key Test (Moderne Integration)');
    
    if (window.adminPanelIntegration) {
        const diagnostics = window.adminPanelIntegration.getDiagnostics();
        console.table(diagnostics);
        
        const apiKey = window.adminPanelIntegration.getApiKey();
        const isValid = validateApiKey(apiKey);
        
        console.log('📊 Test-Ergebnis:');
        console.log('   Integration aktiv: ✅');
        console.log('   API Key verfügbar:', diagnostics.apiKeyAvailable ? '✅' : '❌');
        console.log('   Format valid:', isValid ? '✅' : '❌');
        console.log('   Monitoring aktiv: ✅');
        
        return diagnostics.apiKeyAvailable && isValid;
    } else {
        // Fallback Test
        const apiKey = getAdminPanelApiKey();
        const isValid = validateApiKey(apiKey);
        
        console.log('🔄 Fallback Test:');
        console.log('   Verfügbar:', !!apiKey);
        console.log('   Valid Format:', isValid);
        console.log('   Länge:', apiKey ? apiKey.length : 0);
        console.log('   Prefix:', apiKey ? apiKey.substring(0, 10) + '...' : 'N/A');
        console.warn('⚠️ Admin Panel Integration nicht verfügbar - Fallback verwendet');
        
        return !!apiKey && isValid;
    }
};

// =================== DEVELOPMENT/TEST FUNCTIONS ===================

/**
 * Set test API key - VERALTET (Verwenden Sie das Admin Panel!)
 */
window.setTestApiKeyForDevelopment = function() {
    console.warn('⚠️ VERALTETE FUNKTION - Verwenden Sie das Admin Panel!');
    console.log('👉 Automatische Admin Panel Integration ist jetzt aktiv');
    console.log('👉 Gehen Sie zu: admin.html#ai-settings');
    
    const useAdminPanel = confirm('Diese Funktion ist veraltet!\n\nDas neue Admin Panel Integration System ist aktiv und eliminiert manuelle API Key Eingaben.\n\nMöchten Sie das Admin Panel öffnen?');
    
    if (useAdminPanel) {
        window.open('admin.html#ai-settings', '_blank');
        return true;
    }
    
    const forceDebug = confirm('Trotzdem Debug-Modus für Tests verwenden?\n(Nicht empfohlen - verwenden Sie das Admin Panel)');
    
    if (forceDebug) {
        const testApiKey = prompt('🧪 Debug API Key eingeben:');
        
        if (!testApiKey || !testApiKey.startsWith('sk-')) {
            console.log('❌ Ungültiger API Key oder Eingabe abgebrochen');
            return false;
        }
        
        console.log('🧪 Debug API Key gesetzt (verwenden Sie in Zukunft das Admin Panel)');
        localStorage.setItem('openai_api_key', testApiKey);
        
        // Update Admin Panel Integration if available
        if (window.adminPanelIntegration) {
            window.adminPanelIntegration.checkApiKey();
        }
        
        return true;
    }
    
    console.log('💡 Verwenden Sie das Admin Panel für sichere API Key Verwaltung');
    return false;
};

console.log('✅ AI Integration Module geladen (mit Admin Panel Integration)');
