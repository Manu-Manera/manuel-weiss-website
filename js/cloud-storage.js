/**
 * Cloud Storage für Dokumente
 * Speichert Dateien online (GitHub Gist oder ähnlich)
 */

(function() {
    'use strict';
    
    console.log('☁️ Cloud Storage - Starting...');
    
    // Cloud Storage Konfiguration
    const CLOUD_CONFIG = {
        enabled: true,
        provider: 'gist', // GitHub Gist als kostenlose Option
        fallbackToLocal: true
    };
    
    // GitHub Gist API (kostenlos und einfach)
    const GIST_API = 'https://api.github.com/gists';
    
    // Local Storage Key für Cloud-IDs
    const CLOUD_IDS_KEY = 'cloudDocumentIds';
    
    // Cloud-IDs verwalten
    function getCloudIds() {
        try {
            return JSON.parse(localStorage.getItem(CLOUD_IDS_KEY) || '{}');
        } catch {
            return {};
        }
    }
    
    function saveCloudId(docId, cloudId) {
        const cloudIds = getCloudIds();
        cloudIds[docId] = cloudId;
        localStorage.setItem(CLOUD_IDS_KEY, JSON.stringify(cloudIds));
    }
    
    // Dokument in die Cloud hochladen
    async function uploadToCloud(document) {
        if (!CLOUD_CONFIG.enabled) {
            console.log('☁️ Cloud storage disabled, using local only');
            return null;
        }
        
        try {
            console.log(`☁️ Uploading to cloud: ${document.name}`);
            
            // GitHub Gist erstellen
            const gistData = {
                description: `Bewerbungsdokument: ${document.name}`,
                public: false, // Private Gist
                files: {
                    [`${document.id}.json`]: {
                        content: JSON.stringify({
                            id: document.id,
                            name: document.name,
                            category: document.category,
                            size: document.size,
                            type: document.type,
                            content: document.content,
                            uploadDate: document.uploadDate,
                            includeInAnalysis: document.includeInAnalysis,
                            tags: document.tags || [],
                            metadata: {
                                source: 'bewerbungsmanager',
                                version: '1.0',
                                cloudUpload: new Date().toISOString()
                            }
                        })
                    }
                }
            };
            
            const response = await fetch(GIST_API, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Optional: GitHub Token für höhere Rate Limits
                    // 'Authorization': 'token YOUR_GITHUB_TOKEN'
                },
                body: JSON.stringify(gistData)
            });
            
            if (response.ok) {
                const gist = await response.json();
                console.log(`✅ Cloud upload successful: ${gist.id}`);
                
                // Cloud-ID speichern
                saveCloudId(document.id, gist.id);
                
                // Erfolgs-Notification
                showCloudNotification(`☁️ ${document.name} online gespeichert`, 'success');
                
                return gist.id;
            } else {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
        } catch (error) {
            console.error('❌ Cloud upload failed:', error);
            
            if (CLOUD_CONFIG.fallbackToLocal) {
                showCloudNotification(`⚠️ ${document.name}: Online-Speicherung fehlgeschlagen, lokal gespeichert`, 'warning');
                return null;
            } else {
                throw error;
            }
        }
    }
    
    // Dokument aus der Cloud laden
    async function downloadFromCloud(cloudId) {
        try {
            console.log(`☁️ Downloading from cloud: ${cloudId}`);
            
            const response = await fetch(`${GIST_API}/${cloudId}`);
            
            if (response.ok) {
                const gist = await response.json();
                
                // Erste Datei im Gist holen
                const files = Object.values(gist.files);
                if (files.length > 0) {
                    const fileContent = files[0].content;
                    const document = JSON.parse(fileContent);
                    
                    console.log(`✅ Cloud download successful: ${document.name}`);
                    return document;
                }
            }
            
            throw new Error(`Cloud document not found: ${cloudId}`);
            
        } catch (error) {
            console.error('❌ Cloud download failed:', error);
            return null;
        }
    }
    
    // Alle Cloud-Dokumente synchronisieren
    async function syncWithCloud() {
        if (!CLOUD_CONFIG.enabled) return;
        
        console.log('🔄 Syncing with cloud...');
        
        const cloudIds = getCloudIds();
        const cloudIdsList = Object.values(cloudIds);
        
        if (cloudIdsList.length === 0) {
            console.log('ℹ️ No cloud documents to sync');
            return;
        }
        
        showCloudNotification('🔄 Synchronisiere mit Cloud...', 'info');
        
        let syncCount = 0;
        const localDocuments = JSON.parse(localStorage.getItem('applicationDocuments') || '[]');
        
        for (const cloudId of cloudIdsList) {
            try {
                const cloudDoc = await downloadFromCloud(cloudId);
                if (cloudDoc) {
                    // Prüfe ob lokale Version neuer ist
                    const localDoc = localDocuments.find(doc => doc.id === cloudDoc.id);
                    if (!localDoc || new Date(cloudDoc.uploadDate) > new Date(localDoc.uploadDate)) {
                        // Cloud-Version ist neuer oder lokale Version existiert nicht
                        const updatedDocs = localDocuments.filter(doc => doc.id !== cloudDoc.id);
                        updatedDocs.push(cloudDoc);
                        localStorage.setItem('applicationDocuments', JSON.stringify(updatedDocs));
                        syncCount++;
                    }
                }
            } catch (error) {
                console.error(`❌ Sync failed for ${cloudId}:`, error);
            }
        }
        
        if (syncCount > 0) {
            showCloudNotification(`✅ ${syncCount} Dokumente synchronisiert`, 'success');
            // UI aktualisieren
            if (window.updateMediaDisplay) {
                window.updateMediaDisplay();
            }
        } else {
            showCloudNotification('ℹ️ Alle Dokumente sind aktuell', 'info');
        }
    }
    
    // Dokument aus der Cloud löschen
    async function deleteFromCloud(cloudId) {
        try {
            console.log(`🗑️ Deleting from cloud: ${cloudId}`);
            
            const response = await fetch(`${GIST_API}/${cloudId}`, {
                method: 'DELETE',
                headers: {
                    // Optional: GitHub Token für Löschrechte
                    // 'Authorization': 'token YOUR_GITHUB_TOKEN'
                }
            });
            
            if (response.ok || response.status === 404) {
                console.log(`✅ Cloud delete successful: ${cloudId}`);
                
                // Cloud-ID entfernen
                const cloudIds = getCloudIds();
                const docId = Object.keys(cloudIds).find(key => cloudIds[key] === cloudId);
                if (docId) {
                    delete cloudIds[docId];
                    localStorage.setItem(CLOUD_IDS_KEY, JSON.stringify(cloudIds));
                }
                
                return true;
            } else {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
        } catch (error) {
            console.error('❌ Cloud delete failed:', error);
            return false;
        }
    }
    
    // Cloud-Status anzeigen
    function showCloudStatus() {
        const cloudIds = getCloudIds();
        const cloudCount = Object.keys(cloudIds).length;
        const localDocs = JSON.parse(localStorage.getItem('applicationDocuments') || '[]');
        
        return {
            localCount: localDocs.length,
            cloudCount: cloudCount,
            isEnabled: CLOUD_CONFIG.enabled,
            hasCloudDocs: cloudCount > 0
        };
    }
    
    // Cloud-UI erstellen
    function createCloudUI() {
        const status = showCloudStatus();
        
        return `
            <div class="cloud-status" style="
                background: linear-gradient(135deg, #6366f1, #8b5cf6);
                color: white; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;
            ">
                <div style="display: flex; align-items: center; justify-content: space-between;">
                    <div>
                        <h4 style="margin: 0 0 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
                            <i class="fas fa-cloud"></i>
                            Cloud-Speicher
                        </h4>
                        <p style="margin: 0; opacity: 0.9; font-size: 0.875rem;">
                            📁 ${status.localCount} lokal • ☁️ ${status.cloudCount} online
                        </p>
                    </div>
                    
                    <div style="display: flex; gap: 0.5rem;">
                        <button onclick="syncWithCloud()" style="
                            background: rgba(255,255,255,0.2); color: white; border: 1px solid rgba(255,255,255,0.3);
                            padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; font-size: 0.875rem;
                        ">
                            <i class="fas fa-sync"></i> Sync
                        </button>
                        
                        <button onclick="uploadAllToCloud()" style="
                            background: rgba(255,255,255,0.2); color: white; border: 1px solid rgba(255,255,255,0.3);
                            padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; font-size: 0.875rem;
                        ">
                            <i class="fas fa-cloud-upload-alt"></i> Alle hochladen
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Alle lokalen Dokumente in die Cloud hochladen
    async function uploadAllToCloud() {
        const documents = JSON.parse(localStorage.getItem('applicationDocuments') || '[]');
        const cloudIds = getCloudIds();
        
        // Nur Dokumente hochladen, die noch nicht in der Cloud sind
        const docsToUpload = documents.filter(doc => !cloudIds[doc.id]);
        
        if (docsToUpload.length === 0) {
            showCloudNotification('ℹ️ Alle Dokumente bereits in der Cloud', 'info');
            return;
        }
        
        showCloudNotification(`☁️ Lade ${docsToUpload.length} Dokumente hoch...`, 'info');
        
        let successCount = 0;
        
        for (const doc of docsToUpload) {
            try {
                await uploadToCloud(doc);
                successCount++;
            } catch (error) {
                console.error(`❌ Upload failed for ${doc.name}:`, error);
            }
            
            // Kurze Pause zwischen Uploads (GitHub Rate Limit)
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        showCloudNotification(`✅ ${successCount}/${docsToUpload.length} Dokumente hochgeladen`, 'success');
    }
    
    // Cloud-UI in Medienverwaltung integrieren
    function integrateCloudUI() {
        const actionsSection = document.querySelector('.cv-management h4:contains("Aktionen")');
        if (actionsSection) {
            const cloudUI = createCloudUI();
            actionsSection.insertAdjacentHTML('afterend', cloudUI);
        }
    }
    
    // Cloud-Notification anzeigen
    function showCloudNotification(message, type = 'info') {
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            info: '#6366f1',
            warning: '#f59e0b'
        };
        
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed; top: 20px; right: 20px; z-index: 10000;
            background: ${colors[type]}; color: white; 
            padding: 1rem 1.5rem; border-radius: 8px; font-weight: 500;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2); max-width: 350px;
            animation: slideIn 0.3s ease-out;
        `;
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => notification.remove(), 4000);
    }
    
    // Upload-Funktion erweitern um Cloud-Upload
    function enhanceUploadWithCloud() {
        const originalUpload = window.uploadDocument;
        
        if (originalUpload) {
            window.uploadDocument = async function(category, file) {
                try {
                    // Normale lokale Speicherung
                    const doc = await originalUpload(category, file);
                    
                    // Zusätzlich in Cloud hochladen
                    if (doc && CLOUD_CONFIG.enabled) {
                        uploadToCloud(doc).catch(error => {
                            console.error('❌ Cloud upload failed:', error);
                        });
                    }
                    
                    return doc;
                } catch (error) {
                    console.error('❌ Upload failed:', error);
                    throw error;
                }
            };
        }
    }
    
    // Globale Funktionen verfügbar machen
    window.syncWithCloud = syncWithCloud;
    window.uploadAllToCloud = uploadAllToCloud;
    window.showCloudStatus = showCloudStatus;
    
    // Initialisierung
    function initialize() {
        console.log('☁️ Cloud Storage - Initialisiere...');
        
        enhanceUploadWithCloud();
        
        // Cloud-UI in Medienverwaltung integrieren (falls vorhanden)
        setTimeout(() => {
            if (document.querySelector('.cv-management')) {
                integrateCloudUI();
            }
        }, 1000);
        
        // Automatische Synchronisation beim Start
        setTimeout(() => {
            syncWithCloud();
        }, 2000);
        
        console.log('✅ Cloud Storage - Bereit!');
    }
    
    // Starten
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }
    
    console.log('✅ Cloud Storage - Geladen');
    
})();
