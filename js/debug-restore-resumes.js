/**
 * DEBUG: ALLE Daten wiederherstellen
 * Führt eine vollständige Suche nach Lebensläufen, Anschreiben, Zeugnissen und Fotos durch
 */

async function debugRestoreResumes() {
    console.log('🔍 DEBUG: Suche nach ALLEN Daten...');
    console.log('═══════════════════════════════════════════════════════');
    
    // 1. Prüfe Session und User-ID
    const session = localStorage.getItem('aws_auth_session');
    let userId = null;
    let userEmail = null;
    
    if (session) {
        try {
            const parsed = JSON.parse(session);
            userId = parsed.id;
            userEmail = parsed.email;
            console.log('🔑 Session gefunden:');
            console.log('   User-ID:', userId);
            console.log('   Email:', userEmail);
        } catch (e) {
            console.error('❌ Session Parse-Fehler:', e);
        }
    } else {
        console.warn('⚠️ Keine Session gefunden!');
    }
    
    // 2. Prüfe ALLE localStorage Keys
    console.log('\n📦 ALLE localStorage Keys:');
    const allKeys = Object.keys(localStorage);
    console.log('   Gesamt:', allKeys.length, 'Keys');
    
    // Gruppiere nach Typ
    const dataKeys = {
        resumes: allKeys.filter(k => k.toLowerCase().includes('resume') || k.toLowerCase().includes('lebenslauf')),
        coverLetters: allKeys.filter(k => k.toLowerCase().includes('cover') || k.toLowerCase().includes('anschreiben')),
        documents: allKeys.filter(k => k.toLowerCase().includes('certificate') || k.toLowerCase().includes('zeugnis') || k.toLowerCase().includes('document')),
        photos: allKeys.filter(k => k.toLowerCase().includes('photo') || k.toLowerCase().includes('bild') || k.toLowerCase().includes('avatar')),
        profile: allKeys.filter(k => k.toLowerCase().includes('profile') || k.toLowerCase().includes('profil')),
        applications: allKeys.filter(k => k.toLowerCase().includes('application') || k.toLowerCase().includes('bewerbung'))
    };
    
    // 3. LEBENSLÄUFE
    console.log('\n📄 LEBENSLÄUFE:');
    const localResumes = localStorage.getItem('user_resumes');
    if (localResumes) {
        try {
            const parsed = JSON.parse(localResumes);
            console.log('   ✅ localStorage: user_resumes hat', parsed.length, 'Lebensläufe');
            parsed.forEach((r, i) => {
                console.log(`   ${i+1}. ID: ${r.id}, Name: ${r.personalInfo?.firstName || 'N/A'} ${r.personalInfo?.lastName || ''}`);
            });
        } catch (e) {
            console.error('   ❌ localStorage Parse-Fehler:', e);
        }
    } else {
        console.warn('   ⚠️ Keine Lebensläufe in user_resumes');
    }
    
    dataKeys.resumes.forEach(key => {
        if (key !== 'user_resumes') {
            try {
                const data = localStorage.getItem(key);
                if (data) {
                    const parsed = JSON.parse(data);
                    if (Array.isArray(parsed)) {
                        console.log(`   ✅ ${key}:`, parsed.length, 'Einträge');
                    } else {
                        console.log(`   ✅ ${key}:`, typeof parsed);
                    }
                }
            } catch (e) {
                console.log(`   ℹ️ ${key}:`, localStorage.getItem(key)?.substring(0, 50));
            }
        }
    });
    
    // 4. ANSCHREIBEN
    console.log('\n📝 ANSCHREIBEN:');
    const localCoverLetters = localStorage.getItem('cover_letter_drafts');
    if (localCoverLetters) {
        try {
            const parsed = JSON.parse(localCoverLetters);
            console.log('   ✅ localStorage: cover_letter_drafts hat', parsed.length, 'Anschreiben');
            parsed.forEach((cl, i) => {
                console.log(`   ${i+1}. ID: ${cl.id}, Titel: ${cl.jobData?.companyName || cl.title || 'N/A'}`);
            });
        } catch (e) {
            console.error('   ❌ localStorage Parse-Fehler:', e);
        }
    } else {
        console.warn('   ⚠️ Keine Anschreiben in cover_letter_drafts');
    }
    
    // 5. ZEUGNISSE
    console.log('\n📜 ZEUGNISSE:');
    const localDocs = localStorage.getItem('user_certificates');
    if (localDocs) {
        try {
            const parsed = JSON.parse(localDocs);
            console.log('   ✅ localStorage: user_certificates hat', parsed.length, 'Zeugnisse');
            parsed.forEach((doc, i) => {
                console.log(`   ${i+1}. ID: ${doc.id}, Name: ${doc.name || 'N/A'}`);
            });
        } catch (e) {
            console.error('   ❌ localStorage Parse-Fehler:', e);
        }
    } else {
        console.warn('   ⚠️ Keine Zeugnisse in user_certificates');
    }
    
    // 6. FOTOS
    console.log('\n📸 FOTOS:');
    const localPhotos = localStorage.getItem('user_photos');
    if (localPhotos) {
        try {
            const parsed = JSON.parse(localPhotos);
            console.log('   ✅ localStorage: user_photos hat', parsed.length, 'Fotos');
            parsed.forEach((photo, i) => {
                console.log(`   ${i+1}. ID: ${photo.id}, Name: ${photo.name || 'N/A'}`);
            });
        } catch (e) {
            console.error('   ❌ localStorage Parse-Fehler:', e);
        }
    } else {
        console.warn('   ⚠️ Keine Fotos in user_photos');
    }
    
    // 7. Versuche aus Cloud zu laden
    console.log('\n☁️ CLOUD-DATEN (AWS DynamoDB):');
    if (window.cloudDataService && window.cloudDataService.isUserLoggedIn()) {
        try {
            const cloudUserId = window.cloudDataService.getCurrentUserId();
            console.log('   User-ID für Cloud:', cloudUserId);
            console.log('   API Endpoint:', window.cloudDataService.apiEndpoint);
            
            // Direkter API-Test
            try {
                const token = await window.cloudDataService.getAuthToken();
                console.log('   ✅ Token gefunden:', token ? token.substring(0, 20) + '...' : 'NEIN');
                
                // Teste API direkt
                const apiUrl = `${window.cloudDataService.apiEndpoint}/resumes`;
                console.log('   📡 Teste API direkt:', apiUrl);
                
                const response = await fetch(apiUrl, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                console.log('   API Response Status:', response.status, response.statusText);
                
                if (response.ok) {
                    const data = await response.json();
                    console.log('   ✅ API Response:', data);
                    if (Array.isArray(data)) {
                        console.log('   ✅ API gibt', data.length, 'Lebensläufe zurück');
                    } else if (data.resumes) {
                        console.log('   ✅ API gibt', data.resumes.length, 'Lebensläufe zurück (in data.resumes)');
                    }
                } else {
                    const error = await response.text();
                    console.error('   ❌ API Fehler:', error);
                }
            } catch (e) {
                console.error('   ❌ API-Test fehlgeschlagen:', e);
            }
            
            // Lebensläufe über cloudDataService
            try {
                const cloudResumes = await window.cloudDataService.getResumes(true);
                console.log('   ✅ Cloud Lebensläufe (via Service):', cloudResumes.length);
                cloudResumes.forEach((r, i) => {
                    console.log(`   ${i+1}. ID: ${r.id}, Name: ${r.personalInfo?.firstName || 'N/A'} ${r.personalInfo?.lastName || ''}`);
                });
            } catch (e) {
                console.error('   ❌ Cloud Lebensläufe Fehler:', e);
            }
            
            // Anschreiben
            try {
                const cloudCoverLetters = await window.cloudDataService.getCoverLetters(true);
                console.log('   ✅ Cloud Anschreiben:', cloudCoverLetters.length);
                cloudCoverLetters.forEach((cl, i) => {
                    console.log(`   ${i+1}. ID: ${cl.id}, Titel: ${cl.jobData?.companyName || cl.title || 'N/A'}`);
                });
            } catch (e) {
                console.error('   ❌ Cloud Anschreiben Fehler:', e);
            }
            
            // Dokumente
            try {
                const cloudDocs = await window.cloudDataService.getDocuments(true);
                console.log('   ✅ Cloud Dokumente:', cloudDocs.length);
                cloudDocs.forEach((doc, i) => {
                    console.log(`   ${i+1}. ID: ${doc.id}, Name: ${doc.name || 'N/A'}`);
                });
            } catch (e) {
                console.error('   ❌ Cloud Dokumente Fehler:', e);
            }
            
            // Fotos
            try {
                const cloudPhotos = await window.cloudDataService.getPhotos(true);
                console.log('   ✅ Cloud Fotos:', cloudPhotos.length);
                cloudPhotos.forEach((photo, i) => {
                    console.log(`   ${i+1}. ID: ${photo.id}, Name: ${photo.name || 'N/A'}`);
                });
            } catch (e) {
                console.error('   ❌ Cloud Fotos Fehler:', e);
            }
        } catch (e) {
            console.error('   ❌ Cloud-Laden fehlgeschlagen:', e);
            console.error('   Stack:', e.stack);
        }
    } else {
        console.warn('   ⚠️ User nicht eingeloggt - kann Cloud nicht prüfen');
        console.log('   cloudDataService vorhanden:', !!window.cloudDataService);
        console.log('   isUserLoggedIn:', window.cloudDataService?.isUserLoggedIn());
    }
    
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('✅ DEBUG abgeschlossen');
    
    // Zusammenfassung
    console.log('\n📊 ZUSAMMENFASSUNG:');
    const summary = {
        session: !!session,
        userId: userId,
        email: userEmail,
        resumesLocal: localResumes ? JSON.parse(localResumes).length : 0,
        coverLettersLocal: localCoverLetters ? JSON.parse(localCoverLetters).length : 0,
        documentsLocal: localDocs ? JSON.parse(localDocs).length : 0,
        photosLocal: localPhotos ? JSON.parse(localPhotos).length : 0
    };
    console.table(summary);
}

// Auto-run wenn geladen
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', debugRestoreResumes);
} else {
    debugRestoreResumes();
}

// Globale Funktion für Console
window.debugRestoreResumes = debugRestoreResumes;
