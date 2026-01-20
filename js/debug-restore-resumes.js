/**
 * DEBUG: Lebensläufe wiederherstellen
 * Führt eine vollständige Suche nach Lebensläufen durch
 */

async function debugRestoreResumes() {
    console.log('🔍 DEBUG: Suche nach Lebensläufen...');
    
    // 1. Prüfe localStorage
    const localResumes = localStorage.getItem('user_resumes');
    if (localResumes) {
        try {
            const parsed = JSON.parse(localResumes);
            console.log('✅ localStorage hat', parsed.length, 'Lebensläufe:', parsed.map(r => ({ id: r.id, name: r.personalInfo?.firstName + ' ' + r.personalInfo?.lastName })));
        } catch (e) {
            console.error('❌ localStorage Parse-Fehler:', e);
        }
    } else {
        console.warn('⚠️ Keine Lebensläufe in localStorage gefunden');
    }
    
    // 2. Prüfe andere localStorage Keys
    const allKeys = Object.keys(localStorage);
    const resumeKeys = allKeys.filter(k => k.toLowerCase().includes('resume') || k.toLowerCase().includes('lebenslauf'));
    console.log('🔑 Gefundene Resume-Keys:', resumeKeys);
    resumeKeys.forEach(key => {
        try {
            const data = JSON.parse(localStorage.getItem(key));
            if (Array.isArray(data)) {
                console.log(`✅ ${key}:`, data.length, 'Einträge');
            } else if (data && typeof data === 'object') {
                console.log(`✅ ${key}:`, Object.keys(data));
            }
        } catch (e) {
            console.log(`ℹ️ ${key}:`, localStorage.getItem(key)?.substring(0, 100));
        }
    });
    
    // 3. Prüfe Session
    const session = localStorage.getItem('aws_auth_session');
    if (session) {
        try {
            const parsed = JSON.parse(session);
            console.log('🔑 Session User-ID:', parsed.id);
            console.log('🔑 Session Email:', parsed.email);
        } catch (e) {
            console.error('❌ Session Parse-Fehler:', e);
        }
    }
    
    // 4. Versuche aus Cloud zu laden
    if (window.cloudDataService && window.cloudDataService.isUserLoggedIn()) {
        try {
            const userId = window.cloudDataService.getCurrentUserId();
            console.log('📡 Versuche Lebensläufe aus Cloud zu laden für User-ID:', userId);
            const cloudResumes = await window.cloudDataService.getResumes(true);
            console.log('✅ Cloud hat', cloudResumes.length, 'Lebensläufe:', cloudResumes.map(r => ({ id: r.id, name: r.personalInfo?.firstName + ' ' + r.personalInfo?.lastName })));
        } catch (e) {
            console.error('❌ Cloud-Laden fehlgeschlagen:', e);
        }
    } else {
        console.warn('⚠️ User nicht eingeloggt - kann Cloud nicht prüfen');
    }
    
    console.log('✅ DEBUG abgeschlossen');
}

// Auto-run wenn geladen
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', debugRestoreResumes);
} else {
    debugRestoreResumes();
}

// Globale Funktion für Console
window.debugRestoreResumes = debugRestoreResumes;
