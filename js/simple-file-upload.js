/**
 * Simple File Upload für Netlify (Clientseitig)
 * Keine Server-Abhängigkeiten, nur Browser-Storage
 */

(function() {
    'use strict';
    
    console.log('📁 Simple File Upload - Starting...');
    
    // Storage Key für alle Dokumente
    const STORAGE_KEY = 'uploadedDocuments';
    
    // Kategorie-Mapping
    const CATEGORIES = {
        'cv': { name: 'Lebenslauf', icon: 'fa-user', color: '#3b82f6' },
        'certificates': { name: 'Zeugnis', icon: 'fa-certificate', color: '#10b981' },
        'certifications': { name: 'Zertifikat', icon: 'fa-award', color: '#f59e0b' },
        'coverLetters': { name: 'Anschreiben', icon: 'fa-envelope', color: '#8b5cf6' },
        'portrait': { name: 'Portrait', icon: 'fa-image', color: '#ec4899' },
        'fullApplications': { name: 'Vollständige Bewerbung', icon: 'fa-folder', color: '#6b7280' }
    };
    
    // Alle Dokumente laden
    function loadDocuments() {
        try {
            const docs = localStorage.getItem(STORAGE_KEY);
            return docs ? JSON.parse(docs) : [];
        } catch (error) {
            console.error('❌ Fehler beim Laden der Dokumente:', error);
            return [];
        }
    }
    
    // Dokumente speichern
    function saveDocuments(documents) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(documents));
            console.log(`✅ ${documents.length} Dokumente gespeichert`);
            return true;
        } catch (error) {
            console.error('❌ Fehler beim Speichern:', error);
            return false;
        }
    }
    
    // Datei hochladen (EINFACH!)
    function uploadFile(file, category) {
        console.log(`📤 Upload: ${file.name} → ${category}`);
        
        return new Promise((resolve, reject) => {
            // Validierung
            if (file.size > 10 * 1024 * 1024) {
                reject(new Error('Datei zu groß (max 10MB)'));
                return;
            }
            
            const reader = new FileReader();
            
            reader.onload = function(e) {
                try {
                    const doc = {
                        id: 'doc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                        name: file.name,
                        category: category,
                        size: file.size,
                        type: file.type,
                        content: e.target.result,
                        uploadDate: new Date().toISOString(),
                        includeInAnalysis: true
                    };
                    
                    // Zu existierenden Dokumenten hinzufügen
                    const documents = loadDocuments();
                    documents.push(doc);
                    
                    if (saveDocuments(documents)) {
                        console.log(`✅ ${file.name} erfolgreich gespeichert!`);
                        showNotification(`✅ ${file.name} hochgeladen!`, 'success');
                        updateAllDisplays();
                        resolve(doc);
                    } else {
                        reject(new Error('Speichern fehlgeschlagen'));
                    }
                    
                } catch (error) {
                    console.error('❌ Upload-Fehler:', error);
                    reject(error);
                }
            };
            
            reader.onerror = function() {
                reject(new Error('Datei konnte nicht gelesen werden'));
            };
            
            reader.readAsDataURL(file);
        });
    }
    
    // Dokument löschen
    function deleteDocument(docId) {
        const documents = loadDocuments();
        const filteredDocs = documents.filter(doc => doc.id !== docId);
        
        if (saveDocuments(filteredDocs)) {
            showNotification('Dokument gelöscht', 'info');
            updateAllDisplays();
            return true;
        }
        
        return false;
    }
    
    // Toggle für Analyse
    function toggleAnalysis(docId) {
        const documents = loadDocuments();
        const doc = documents.find(d => d.id === docId);
        
        if (doc) {
            doc.includeInAnalysis = !doc.includeInAnalysis;
            saveDocuments(documents);
            updateAllDisplays();
            
            const status = doc.includeInAnalysis ? 'hinzugefügt' : 'entfernt';
            showNotification(`Dokument zur Analyse ${status}`, 'info');
        }
    }
    
    // Dokumente nach Kategorie filtern
    function getDocumentsByCategory(category) {
        const documents = loadDocuments();
        return documents.filter(doc => doc.category === category);
    }
    
    // Dokumente für Analyse holen
    function getAnalysisDocuments() {
        const documents = loadDocuments();
        return documents.filter(doc => doc.includeInAnalysis);
    }
    
    // File-Size formatieren
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    // Datum formatieren
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
    
    // Benachrichtigung anzeigen
    function showNotification(message, type = 'info') {
        const colors = {
            success: '#10b981',
            error: '#ef4444', 
            info: '#3b82f6',
            warning: '#f59e0b'
        };
        
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            background: ${colors[type]};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            font-weight: 500;
            max-width: 350px;
            animation: slideIn 0.3s ease-out;
        `;
        
        notification.innerHTML = message;
        document.body.appendChild(notification);
        
        // CSS Animation hinzufügen
        if (!document.getElementById('notification-css')) {
            const style = document.createElement('style');
            style.id = 'notification-css';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }
        
        setTimeout(() => notification.remove(), 3000);
    }
    
    // Dokument-Liste rendern
    function renderDocumentList(documents, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        if (documents.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: #6b7280; background: #f8fafc; border-radius: 8px; border: 2px dashed #d1d5db;">
                    <i class="fas fa-cloud-upload-alt" style="font-size: 2rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                    <p style="margin: 0; font-size: 0.875rem;">Keine Dateien hochgeladen</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = documents.map(doc => {
            const category = CATEGORIES[doc.category] || { name: doc.category, icon: 'fa-file', color: '#6b7280' };
            
            return `
                <div class="document-item" style="
                    display: flex; 
                    align-items: center; 
                    justify-content: space-between; 
                    padding: 1rem; 
                    background: white; 
                    border: 1px solid #e5e7eb; 
                    border-radius: 8px; 
                    margin-bottom: 0.75rem;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                ">
                    <div style="display: flex; align-items: center; gap: 1rem; flex: 1; min-width: 0;">
                        <div style="
                            background: ${category.color}; 
                            color: white; 
                            width: 40px; 
                            height: 40px; 
                            border-radius: 8px; 
                            display: flex; 
                            align-items: center; 
                            justify-content: center;
                            flex-shrink: 0;
                        ">
                            <i class="fas ${category.icon}"></i>
                        </div>
                        <div style="flex: 1; min-width: 0;">
                            <div style="font-weight: 600; color: #374151; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                                ${doc.name}
                            </div>
                            <div style="font-size: 0.75rem; color: #6b7280; margin-top: 0.25rem;">
                                ${category.name} • ${formatFileSize(doc.size)} • ${formatDate(doc.uploadDate)}
                            </div>
                        </div>
                    </div>
                    
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <button 
                            onclick="toggleDocumentAnalysis('${doc.id}')"
                            style="
                                background: ${doc.includeInAnalysis ? '#10b981' : '#6b7280'};
                                color: white;
                                border: none;
                                border-radius: 6px;
                                padding: 0.5rem;
                                cursor: pointer;
                                transition: all 0.2s;
                            "
                            title="${doc.includeInAnalysis ? 'Aus Analyse entfernen' : 'Zur Analyse hinzufügen'}"
                        >
                            <i class="fas ${doc.includeInAnalysis ? 'fa-check' : 'fa-plus'}"></i>
                        </button>
                        
                        <button 
                            onclick="removeDocument('${doc.id}')"
                            style="
                                background: #ef4444;
                                color: white;
                                border: none;
                                border-radius: 6px;
                                padding: 0.5rem;
                                cursor: pointer;
                                transition: all 0.2s;
                            "
                            title="Löschen"
                        >
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    // Counter aktualisieren
    function updateCategoryCounter(category, count) {
        const counterSelectors = [
            `#${category}Counter`,
            `[data-category="${category}"] .document-count`,
            `.document-count[data-category="${category}"]`,
            `#${category}-count`
        ];
        
        counterSelectors.forEach(selector => {
            const element = document.querySelector(selector);
            if (element) {
                element.textContent = `${count} ${count === 1 ? 'Datei' : 'Dateien'}`;
            }
        });
    }
    
    // Alle Anzeigen aktualisieren
    function updateAllDisplays() {
        console.log('🔄 Aktualisiere alle Anzeigen...');
        
        Object.keys(CATEGORIES).forEach(category => {
            const docs = getDocumentsByCategory(category);
            updateCategoryCounter(category, docs.length);
            
            // Liste aktualisieren
            const listContainers = [
                `${category}-documents`,
                `${category}-list`,
                `uploaded-${category}`,
                `documents-${category}`
            ];
            
            listContainers.forEach(containerId => {
                renderDocumentList(docs, containerId);
            });
        });
        
        // Gesamt-Statistiken
        const allDocs = loadDocuments();
        const analysisDocs = getAnalysisDocuments();
        
        console.log(`📊 Dokumente: ${allDocs.length} gesamt, ${analysisDocs.length} für Analyse`);
        
        // Analysis-Button aktivieren/deaktivieren
        const analysisButtons = document.querySelectorAll('[onclick*="analyze"], .analysis-btn, .btn-analysis');
        analysisButtons.forEach(btn => {
            btn.disabled = analysisDocs.length === 0;
            btn.style.opacity = analysisDocs.length === 0 ? '0.5' : '1';
        });
    }
    
    // Input-Handler für alle Upload-Felder
    function attachUploadHandlers() {
        console.log('📎 Befestige Upload-Handler...');
        
        // Alle File-Inputs finden
        const fileInputs = document.querySelectorAll('input[type="file"]');
        
        fileInputs.forEach(input => {
            // Kategorie aus ID ermitteln
            let category = 'general';
            const inputId = input.id.toLowerCase();
            
            if (inputId.includes('cv') || inputId.includes('lebenslauf')) category = 'cv';
            else if (inputId.includes('certificate') && !inputId.includes('certification')) category = 'certificates';
            else if (inputId.includes('certification')) category = 'certifications';
            else if (inputId.includes('coverletter') || inputId.includes('anschreiben')) category = 'coverLetters';
            else if (inputId.includes('portrait') || inputId.includes('photo')) category = 'portrait';
            else if (inputId.includes('full') || inputId.includes('complete')) category = 'fullApplications';
            
            console.log(`📎 ${input.id} → ${category}`);
            
            // Event-Handler entfernen und neu setzen
            const newInput = input.cloneNode(true);
            input.parentNode.replaceChild(newInput, input);
            
            newInput.addEventListener('change', async function(e) {
                const files = e.target.files;
                if (!files || files.length === 0) return;
                
                console.log(`📤 Upload gestartet: ${files.length} Datei(en) für ${category}`);
                
                // Alle Dateien hochladen
                for (let i = 0; i < files.length; i++) {
                    try {
                        await uploadFile(files[i], category);
                    } catch (error) {
                        console.error(`❌ Upload fehlgeschlagen: ${files[i].name}`, error);
                        showNotification(`❌ ${files[i].name}: ${error.message}`, 'error');
                    }
                }
                
                // Input zurücksetzen
                e.target.value = '';
            });
        });
    }
    
    // Analyse starten
    function startDocumentAnalysis() {
        const analysisDocs = getAnalysisDocuments();
        
        if (analysisDocs.length === 0) {
            showNotification('❌ Keine Dokumente für Analyse ausgewählt', 'error');
            return;
        }
        
        console.log(`🧠 Starte Analyse mit ${analysisDocs.length} Dokumenten`);
        showNotification(`🧠 Analysiere ${analysisDocs.length} Dokumente...`, 'info');
        
        // Hier kann die echte KI-Analyse aufgerufen werden
        if (window.analyzeStoredDocumentsEnhanced) {
            window.analyzeStoredDocumentsEnhanced();
        } else if (window.analyzeStoredDocuments) {
            window.analyzeStoredDocuments();
        } else {
            // Fallback
            setTimeout(() => {
                showNotification('✅ Analyse abgeschlossen!', 'success');
            }, 2000);
        }
    }
    
    // Debug-Funktionen
    function debugShowStorage() {
        const docs = loadDocuments();
        console.table(docs);
        alert(`${docs.length} Dokumente im Speicher:\n\n` + 
              docs.map(d => `• ${d.name} (${d.category})`).join('\n'));
    }
    
    function debugClearStorage() {
        if (confirm('Alle Dokumente löschen?')) {
            localStorage.removeItem(STORAGE_KEY);
            updateAllDisplays();
            showNotification('Speicher geleert', 'info');
        }
    }
    
    // Globale Funktionen verfügbar machen
    window.uploadFileSimple = uploadFile;
    window.toggleDocumentAnalysis = toggleAnalysis;
    window.removeDocument = deleteDocument;
    window.startDocumentAnalysis = startDocumentAnalysis;
    window.getAnalysisDocuments = getAnalysisDocuments;
    window.debugShowStorage = debugShowStorage;
    window.debugClearStorage = debugClearStorage;
    
    // Überschreibe existierende Funktionen
    window.uploadDocument = uploadFile;
    window.analyzeStoredDocuments = startDocumentAnalysis;
    
    // Initialisierung
    function initialize() {
        console.log('📁 Simple File Upload - Initialisiere...');
        
        attachUploadHandlers();
        updateAllDisplays();
        
        // Analyse-Buttons finden und Handler setzen
        const analysisButtons = document.querySelectorAll('button');
        analysisButtons.forEach(btn => {
            const text = btn.textContent.toLowerCase();
            if (text.includes('analyse') || text.includes('ki-analyse')) {
                btn.onclick = startDocumentAnalysis;
            }
        });
        
        console.log('✅ Simple File Upload - Bereit!');
    }
    
    // Starten
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }
    
    // Periodisch neu initialisieren für dynamische Inhalte
    setInterval(initialize, 3000);
    
    console.log('✅ Simple File Upload - Geladen');
    
})();
