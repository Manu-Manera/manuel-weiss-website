/**
 * Media Management Fix
 * Spezielle Reparatur für Medienverwaltung Bewerbungsunterlagen
 */

(function() {
    'use strict';
    
    console.log('📁 Media Management Fix - Starting...');
    
    // Storage für Dokumente
    const STORAGE_KEY = 'applicationDocuments';
    
    // Tab-Mapping für Medienverwaltung
    const TAB_MAPPING = {
        'all': 'alle',
        'cv': 'cv',
        'portrait': 'portrait', 
        'certificate': 'certificates',
        'certification': 'certifications',
        'cover-letter': 'coverLetters',
        'complete': 'fullApplications'
    };
    
    // Umgekehrtes Mapping
    const REVERSE_TAB_MAPPING = {
        'alle': 'all',
        'cv': 'cv',
        'portrait': 'portrait',
        'certificates': 'certificate',
        'certifications': 'certification', 
        'coverLetters': 'cover-letter',
        'fullApplications': 'complete'
    };
    
    // Dokumente laden
    function loadDocuments() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        } catch {
            return [];
        }
    }
    
    // Dokumente speichern
    function saveDocuments(docs) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
            return true;
        } catch {
            return false;
        }
    }
    
    // Upload-Handler für Medienverwaltung
    function handleMediaUpload(files) {
        console.log('📤 Media Upload:', files.length, 'files');
        
        if (!files || files.length === 0) {
            showNotification('Keine Dateien ausgewählt', 'warning');
            return;
        }
        
        let uploadCount = 0;
        let totalFiles = files.length;
        
        Array.from(files).forEach((file, index) => {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                const doc = {
                    id: 'doc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                    name: file.name,
                    category: determineCategoryFromFile(file),
                    size: file.size,
                    type: file.type,
                    content: e.target.result,
                    uploadDate: new Date().toISOString(),
                    includeInAnalysis: true,
                    tags: [determineCategoryDisplayName(file)]
                };
                
                const documents = loadDocuments();
                documents.push(doc);
                
                if (saveDocuments(documents)) {
                    uploadCount++;
                    console.log(`✅ Uploaded: ${doc.name} (${uploadCount}/${totalFiles})`);
                    
                    if (uploadCount === totalFiles) {
                        showNotification(`✅ ${totalFiles} Dateien erfolgreich hochgeladen!`, 'success');
                        updateMediaDisplay();
                    }
                } else {
                    showNotification(`❌ Fehler beim Speichern von ${file.name}`, 'error');
                }
            };
            
            reader.onerror = function() {
                showNotification(`❌ Fehler beim Lesen von ${file.name}`, 'error');
            };
            
            reader.readAsDataURL(file);
        });
    }
    
    // Kategorie aus Datei ermitteln
    function determineCategoryFromFile(file) {
        const name = file.name.toLowerCase();
        const type = file.type.toLowerCase();
        
        // Nach Dateiname
        if (name.includes('lebenslauf') || name.includes('cv') || name.includes('resume')) {
            return 'cv';
        }
        if (name.includes('zeugnis') || name.includes('certificate')) {
            return 'certificates';
        }
        if (name.includes('zertifikat') || name.includes('certification')) {
            return 'certifications';
        }
        if (name.includes('anschreiben') || name.includes('cover') || name.includes('letter')) {
            return 'coverLetters';
        }
        if (name.includes('bewerbung') || name.includes('application')) {
            return 'fullApplications';
        }
        
        // Nach Dateityp
        if (type.includes('image')) {
            return 'portrait';
        }
        
        // Default
        return 'general';
    }
    
    // Kategorie-Anzeigename
    function determineCategoryDisplayName(file) {
        const category = determineCategoryFromFile(file);
        const names = {
            'cv': 'Lebenslauf',
            'certificates': 'Zeugnis',
            'certifications': 'Zertifikat',
            'coverLetters': 'Anschreiben',
            'portrait': 'Portrait',
            'fullApplications': 'Vollständige Bewerbung',
            'general': 'Dokument'
        };
        return names[category] || 'Dokument';
    }
    
    // Tab-Navigation reparieren
    function fixTabNavigation() {
        console.log('🔧 Repariere Tab-Navigation...');
        
        // Alle Tab-Buttons in der Medienverwaltung finden
        const tabButtons = document.querySelectorAll('.document-tabs .doc-tab');
        
        tabButtons.forEach(button => {
            // Bestehende Event-Handler entfernen
            button.onclick = null;
            button.removeEventListener('click', handleTabClick);
            
            // Neuen Event-Handler hinzufügen
            button.addEventListener('click', handleTabClick);
            
            console.log(`✅ Tab-Handler befestigt: ${button.textContent.trim()}`);
        });
        
        console.log(`✅ ${tabButtons.length} Tab-Buttons repariert`);
    }
    
    // Tab-Click Handler
    function handleTabClick(event) {
        event.preventDefault();
        event.stopPropagation();
        
        const button = event.currentTarget;
        const tabType = button.getAttribute('data-type') || button.getAttribute('data-param');
        
        console.log(`🔄 Tab clicked: ${tabType}`);
        
        // Alle Tabs deaktivieren
        document.querySelectorAll('.document-tabs .doc-tab').forEach(tab => {
            tab.classList.remove('active');
            tab.style.borderBottomColor = 'transparent';
        });
        
        // Aktuellen Tab aktivieren
        button.classList.add('active');
        button.style.borderBottomColor = '#6366f1';
        
        // Dokumente filtern und anzeigen
        filterDocuments(tabType);
    }
    
    // Dokumente filtern
    function filterDocuments(tabType) {
        console.log(`🔍 Filter documents by: ${tabType}`);
        
        const documents = loadDocuments();
        let filteredDocs;
        
        if (tabType === 'all') {
            filteredDocs = documents;
        } else {
            // Tab-Type zu Kategorie mappen
            const category = TAB_MAPPING[tabType];
            if (category) {
                filteredDocs = documents.filter(doc => doc.category === category);
            } else {
                filteredDocs = documents;
            }
        }
        
        console.log(`📊 Showing ${filteredDocs.length} documents for tab: ${tabType}`);
        
        // Dokumente anzeigen
        displayDocuments(filteredDocs);
    }
    
    // Dokumente anzeigen
    function displayDocuments(documents) {
        const container = document.getElementById('documentsList');
        if (!container) {
            console.error('❌ Documents container not found');
            return;
        }
        
        if (documents.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 3rem 1rem; color: #6b7280; background: #f8fafc; border-radius: 8px; border: 2px dashed #d1d5db;">
                    <i class="fas fa-folder-open" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                    <p style="margin: 0; font-size: 1.125rem; font-weight: 500; margin-bottom: 0.5rem;">Keine Dokumente vorhanden</p>
                    <p style="margin: 0; font-size: 0.875rem;">Laden Sie Ihre ersten Bewerbungsunterlagen hoch</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = documents.map(doc => {
            const categoryInfo = getCategoryInfo(doc.category);
            
            return `
                <div class="document-card" style="
                    background: white; 
                    border: 1px solid #e5e7eb; 
                    border-radius: 12px; 
                    padding: 1.5rem; 
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                    transition: all 0.3s ease;
                    cursor: pointer;
                " onmouseover="this.style.boxShadow='0 4px 16px rgba(0,0,0,0.15)'" onmouseout="this.style.boxShadow='0 2px 8px rgba(0,0,0,0.1)'">
                    
                    <div style="display: flex; align-items: flex-start; gap: 1rem;">
                        <div style="
                            background: ${categoryInfo.color}; 
                            color: white; 
                            width: 50px; 
                            height: 50px; 
                            border-radius: 10px; 
                            display: flex; 
                            align-items: center; 
                            justify-content: center;
                            flex-shrink: 0;
                        ">
                            <i class="fas ${categoryInfo.icon}" style="font-size: 1.25rem;"></i>
                        </div>
                        
                        <div style="flex: 1; min-width: 0;">
                            <h4 style="
                                margin: 0 0 0.5rem; 
                                color: #374151; 
                                font-size: 1rem; 
                                font-weight: 600;
                                white-space: nowrap; 
                                overflow: hidden; 
                                text-overflow: ellipsis;
                            ">${doc.name}</h4>
                            
                            <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.75rem;">
                                <span style="
                                    background: ${categoryInfo.color}20; 
                                    color: ${categoryInfo.color}; 
                                    padding: 0.25rem 0.75rem; 
                                    border-radius: 16px; 
                                    font-size: 0.75rem; 
                                    font-weight: 500;
                                ">${categoryInfo.name}</span>
                                
                                <span style="
                                    background: #f3f4f6; 
                                    color: #6b7280; 
                                    padding: 0.25rem 0.75rem; 
                                    border-radius: 16px; 
                                    font-size: 0.75rem;
                                ">${formatFileSize(doc.size)}</span>
                            </div>
                            
                            <div style="color: #6b7280; font-size: 0.875rem; margin-bottom: 1rem;">
                                📅 ${formatDate(doc.uploadDate)}
                            </div>
                            
                            <div style="display: flex; gap: 0.5rem;">
                                <button onclick="toggleDocumentAnalysis('${doc.id}')" style="
                                    background: ${doc.includeInAnalysis ? '#10b981' : '#6b7280'}; 
                                    color: white; 
                                    border: none; 
                                    border-radius: 6px; 
                                    padding: 0.5rem 1rem; 
                                    font-size: 0.75rem; 
                                    cursor: pointer;
                                    transition: all 0.2s;
                                " title="${doc.includeInAnalysis ? 'Aus Analyse entfernen' : 'Zur Analyse hinzufügen'}">
                                    <i class="fas ${doc.includeInAnalysis ? 'fa-check' : 'fa-plus'}"></i>
                                    ${doc.includeInAnalysis ? 'In Analyse' : 'Hinzufügen'}
                                </button>
                                
                                <button onclick="previewDocument('${doc.id}')" style="
                                    background: #3b82f6; 
                                    color: white; 
                                    border: none; 
                                    border-radius: 6px; 
                                    padding: 0.5rem 1rem; 
                                    font-size: 0.75rem; 
                                    cursor: pointer;
                                " title="Vorschau">
                                    <i class="fas fa-eye"></i>
                                </button>
                                
                                <button onclick="deleteMediaDocument('${doc.id}')" style="
                                    background: #ef4444; 
                                    color: white; 
                                    border: none; 
                                    border-radius: 6px; 
                                    padding: 0.5rem 1rem; 
                                    font-size: 0.75rem; 
                                    cursor: pointer;
                                " title="Löschen">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    // Kategorie-Info holen
    function getCategoryInfo(category) {
        const infos = {
            'cv': { name: 'Lebenslauf', icon: 'fa-user', color: '#3b82f6' },
            'certificates': { name: 'Zeugnis', icon: 'fa-certificate', color: '#10b981' },
            'certifications': { name: 'Zertifikat', icon: 'fa-award', color: '#f59e0b' },
            'coverLetters': { name: 'Anschreiben', icon: 'fa-envelope', color: '#8b5cf6' },
            'portrait': { name: 'Portrait', icon: 'fa-image', color: '#ec4899' },
            'fullApplications': { name: 'Vollständige Bewerbung', icon: 'fa-folder', color: '#6b7280' },
            'general': { name: 'Dokument', icon: 'fa-file', color: '#6b7280' }
        };
        
        return infos[category] || infos['general'];
    }
    
    // Upload-Handler befestigen
    function attachMediaUploadHandler() {
        console.log('📎 Befestige Media Upload Handler...');
        
        // Upload-Button finden
        const uploadButton = document.querySelector('[data-action="upload-document"]');
        const fileInput = document.getElementById('doc-upload');
        
        if (uploadButton && fileInput) {
            // Upload-Button Handler
            uploadButton.onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('📤 Upload button clicked');
                fileInput.click();
            };
            
            // File-Input Handler
            fileInput.onchange = function(e) {
                const files = e.target.files;
                if (files && files.length > 0) {
                    handleMediaUpload(files);
                    e.target.value = ''; // Reset
                }
            };
            
            console.log('✅ Media upload handlers attached');
        } else {
            console.warn('⚠️ Media upload elements not found');
        }
    }
    
    // Komplette Media-Display aktualisieren
    function updateMediaDisplay() {
        console.log('🔄 Update Media Display...');
        
        // Aktuell aktiven Tab finden
        const activeTab = document.querySelector('.document-tabs .doc-tab.active');
        const activeTabType = activeTab ? (activeTab.getAttribute('data-type') || 'all') : 'all';
        
        // Dokumente für aktiven Tab anzeigen
        filterDocuments(activeTabType);
    }
    
    // Document-Management Funktionen
    function toggleDocumentAnalysis(docId) {
        const documents = loadDocuments();
        const doc = documents.find(d => d.id === docId);
        
        if (doc) {
            doc.includeInAnalysis = !doc.includeInAnalysis;
            saveDocuments(documents);
            updateMediaDisplay();
            
            const status = doc.includeInAnalysis ? 'zur Analyse hinzugefügt' : 'aus Analyse entfernt';
            showNotification(`📄 ${doc.name} ${status}`, 'info');
        }
    }
    
    function deleteMediaDocument(docId) {
        if (!confirm('Dokument wirklich löschen?')) return;
        
        const documents = loadDocuments();
        const filteredDocs = documents.filter(doc => doc.id !== docId);
        
        if (saveDocuments(filteredDocs)) {
            updateMediaDisplay();
            showNotification('📄 Dokument gelöscht', 'success');
        }
    }
    
    function previewDocument(docId) {
        const documents = loadDocuments();
        const doc = documents.find(d => d.id === docId);
        
        if (doc) {
            // Einfache Vorschau im neuen Fenster
            const newWindow = window.open('', '_blank');
            newWindow.document.write(`
                <html>
                    <head><title>${doc.name}</title></head>
                    <body style="margin: 0; padding: 20px; font-family: Arial, sans-serif;">
                        <h2>${doc.name}</h2>
                        <p><strong>Typ:</strong> ${getCategoryInfo(doc.category).name}</p>
                        <p><strong>Größe:</strong> ${formatFileSize(doc.size)}</p>
                        <p><strong>Upload:</strong> ${formatDate(doc.uploadDate)}</p>
                        <hr>
                        ${doc.type.includes('image') ? 
                            `<img src="${doc.content}" style="max-width: 100%; height: auto;">` :
                            `<p>Vorschau für ${doc.type} Dateien nicht verfügbar. <a href="${doc.content}" download="${doc.name}">Datei herunterladen</a></p>`
                        }
                    </body>
                </html>
            `);
        }
    }
    
    // Utility-Funktionen
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }
    
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('de-DE', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    function showNotification(message, type = 'info') {
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            info: '#3b82f6',
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
        
        if (!document.getElementById('media-notification-styles')) {
            const style = document.createElement('style');
            style.id = 'media-notification-styles';
            style.textContent = '@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }';
            document.head.appendChild(style);
        }
        
        setTimeout(() => notification.remove(), 4000);
    }
    
    // Globale Funktionen verfügbar machen
    window.toggleDocumentAnalysis = toggleDocumentAnalysis;
    window.deleteMediaDocument = deleteMediaDocument;
    window.previewDocument = previewDocument;
    window.updateMediaDisplay = updateMediaDisplay;
    
    // Initialisierung
    function initialize() {
        console.log('📁 Media Management Fix - Initialisiere...');
        
        // Nur initialisieren wenn Medienverwaltung vorhanden
        const mediaSection = document.querySelector('.cv-management');
        if (!mediaSection) {
            console.log('ℹ️ Medienverwaltung nicht gefunden, überspringe...');
            return;
        }
        
        fixTabNavigation();
        attachMediaUploadHandler();
        updateMediaDisplay();
        
        console.log('✅ Media Management Fix - Bereit!');
    }
    
    // Starten
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }
    
    // Regelmäßige Überprüfung
    setInterval(() => {
        if (document.querySelector('.cv-management')) {
            fixTabNavigation();
        }
    }, 3000);
    
    console.log('✅ Media Management Fix - Geladen');
    
})();
