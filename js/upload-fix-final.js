/**
 * Final Upload Fix - Behebt alle Upload-Probleme
 * Eliminiert Doppel-Events, überflüssige UI-Elemente und Event-Konflikte
 */

(function() {
    'use strict';
    
    console.log('🔧 Final Upload Fix - Starting...');
    
    // Eindeutige Upload-Handler Registry
    const UPLOAD_HANDLERS = new Set();
    const PROCESSED_INPUTS = new WeakSet();
    
    // Storage Key
    const STORAGE_KEY = 'uploadedDocuments';
    
    // Event-Handler Bereinigung
    function cleanupEventHandlers() {
        console.log('🧹 Bereinige Event-Handler...');
        
        // Alle existierenden Handler entfernen
        const fileInputs = document.querySelectorAll('input[type="file"]');
        fileInputs.forEach(input => {
            if (PROCESSED_INPUTS.has(input)) {
                return; // Bereits verarbeitet
            }
            
            // Klon erstellen um alle Events zu entfernen
            const newInput = input.cloneNode(true);
            input.parentNode.replaceChild(newInput, input);
            
            PROCESSED_INPUTS.add(newInput);
        });
    }
    
    // Sichere Dokumenten-Speicherung
    function saveDocumentSecure(document) {
        try {
            const documents = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
            
            // Prüfe auf Duplikate basierend auf Name + Größe + Kategorie
            const isDuplicate = documents.some(doc => 
                doc.name === document.name && 
                doc.size === document.size && 
                doc.category === document.category
            );
            
            if (isDuplicate) {
                console.warn('⚠️ Duplikat erkannt, überspringe:', document.name);
                showNotification('Datei bereits vorhanden', 'warning');
                return false;
            }
            
            documents.push(document);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(documents));
            
            console.log(`✅ Dokument gespeichert: ${document.name}`);
            return true;
            
        } catch (error) {
            console.error('❌ Speichern fehlgeschlagen:', error);
            return false;
        }
    }
    
    // Robuster Upload-Handler
    function createUploadHandler(category) {
        return function(event) {
            const input = event.target;
            const files = input.files;
            
            console.log(`📤 Upload-Handler für ${category}:`, files);
            
            // Validierung
            if (!files || files.length === 0) {
                console.warn('⚠️ Keine Dateien ausgewählt');
                showNotification('Keine Datei ausgewählt', 'warning');
                return;
            }
            
            // Verhindere mehrfache Ausführung
            if (input.dataset.uploading === 'true') {
                console.log('🔄 Upload bereits in Bearbeitung, überspringe...');
                return;
            }
            
            input.dataset.uploading = 'true';
            
            // Verarbeite alle Dateien
            Array.from(files).forEach((file, index) => {
                processFile(file, category, input, index === files.length - 1);
            });
        };
    }
    
    // Datei-Verarbeitung
    function processFile(file, category, input, isLast) {
        console.log(`📄 Verarbeite: ${file.name} (${category})`);
        
        // Validierung
        if (file.size > 10 * 1024 * 1024) {
            showNotification(`${file.name} ist zu groß (max 10MB)`, 'error');
            if (isLast) input.dataset.uploading = 'false';
            return;
        }
        
        const reader = new FileReader();
        
        reader.onload = function(e) {
            try {
                const document = {
                    id: 'doc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                    name: file.name,
                    category: category,
                    size: file.size,
                    type: file.type,
                    content: e.target.result,
                    uploadDate: new Date().toISOString(),
                    includeInAnalysis: true,
                    metadata: {
                        extension: file.name.split('.').pop().toLowerCase(),
                        mimeType: file.type,
                        uploaded: true
                    }
                };
                
                if (saveDocumentSecure(document)) {
                    showNotification(`✅ ${file.name} hochgeladen!`, 'success');
                    updateAllDisplays();
                } else {
                    showNotification(`❌ Fehler beim Speichern von ${file.name}`, 'error');
                }
                
            } catch (error) {
                console.error(`❌ Verarbeitung fehlgeschlagen: ${file.name}`, error);
                showNotification(`❌ Fehler beim Verarbeiten von ${file.name}`, 'error');
            }
            
            if (isLast) {
                input.dataset.uploading = 'false';
                input.value = ''; // Input zurücksetzen
            }
        };
        
        reader.onerror = function() {
            console.error(`❌ Lesefehler: ${file.name}`);
            showNotification(`❌ Fehler beim Lesen von ${file.name}`, 'error');
            if (isLast) input.dataset.uploading = 'false';
        };
        
        reader.readAsDataURL(file);
    }
    
    // Kategorie aus Input-ID ermitteln
    function getCategoryFromInput(input) {
        const inputId = input.id.toLowerCase();
        
        if (inputId.includes('cv') || inputId.includes('lebenslauf')) return 'cv';
        if (inputId.includes('certificate') && !inputId.includes('certification')) return 'certificates';
        if (inputId.includes('certification')) return 'certifications';
        if (inputId.includes('coverletter') || inputId.includes('anschreiben')) return 'coverLetters';
        if (inputId.includes('portrait') || inputId.includes('photo')) return 'portrait';
        if (inputId.includes('full') || inputId.includes('complete')) return 'fullApplications';
        
        // Fallback basierend auf accept-Attribut
        const accept = input.accept;
        if (accept && accept.includes('image')) return 'portrait';
        
        return 'general';
    }
    
    // Upload-Handler befestigen
    function attachUploadHandlers() {
        console.log('📎 Befestige Upload-Handler...');
        
        const fileInputs = document.querySelectorAll('input[type="file"]');
        
        fileInputs.forEach(input => {
            // Überspringe bereits verarbeitete Inputs
            if (PROCESSED_INPUTS.has(input)) {
                return;
            }
            
            const category = getCategoryFromInput(input);
            console.log(`📎 ${input.id} → ${category}`);
            
            // Handler erstellen und befestigen
            const handler = createUploadHandler(category);
            input.addEventListener('change', handler, { once: false });
            
            // Als verarbeitet markieren
            PROCESSED_INPUTS.add(input);
            
            // Handler in Registry speichern
            UPLOAD_HANDLERS.add({
                input: input,
                category: category,
                handler: handler
            });
        });
        
        console.log(`✅ ${UPLOAD_HANDLERS.size} Upload-Handler befestigt`);
    }
    
    // Überflüssige UI-Elemente entfernen
    function removeRedundantUIElements() {
        console.log('🧹 Entferne überflüssige UI-Elemente...');
        
        // Lila Checkboxen oberhalb der Datei-Listen entfernen
        const redundantCheckboxes = document.querySelectorAll('input[type="checkbox"][style*="purple"], input[type="checkbox"][style*="#8b5cf6"], .checkbox-purple');
        redundantCheckboxes.forEach(checkbox => {
            const parent = checkbox.parentElement;
            if (parent && parent.textContent.toLowerCase().includes('datei')) {
                console.log('🗑️ Entferne überflüssige Checkbox:', checkbox);
                checkbox.remove();
            }
        });
        
        // Doppelte Checkboxen in Datei-Listen entfernen
        const fileListContainers = document.querySelectorAll('[id*="documents"], [id*="uploaded"], .uploaded-documents');
        fileListContainers.forEach(container => {
            const checkboxes = container.querySelectorAll('input[type="checkbox"]');
            if (checkboxes.length > 1) {
                // Behalte nur die erste Checkbox pro Datei
                Array.from(checkboxes).slice(1).forEach(cb => {
                    console.log('🗑️ Entferne doppelte Checkbox in:', container.id);
                    cb.remove();
                });
            }
        });
        
        // Leere Container bereinigen
        const emptyContainers = document.querySelectorAll('[id*="uploaded"]:empty, [id*="documents"]:empty');
        emptyContainers.forEach(container => {
            if (container.children.length === 0) {
                container.innerHTML = '<p style="color: #6b7280; text-align: center; padding: 1rem;">Keine Dateien hochgeladen</p>';
            }
        });
    }
    
    // Alle Anzeigen aktualisieren
    function updateAllDisplays() {
        const documents = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        
        console.log(`🔄 Aktualisiere Anzeigen für ${documents.length} Dokumente`);
        
        // Kategorien aktualisieren
        const categories = ['cv', 'certificates', 'certifications', 'coverLetters', 'portrait', 'fullApplications'];
        
        categories.forEach(category => {
            const categoryDocs = documents.filter(doc => doc.category === category);
            updateCategoryDisplay(category, categoryDocs);
        });
        
        // UI bereinigen
        removeRedundantUIElements();
    }
    
    // Kategorie-Anzeige aktualisieren
    function updateCategoryDisplay(category, documents) {
        // Counter aktualisieren
        const counterSelectors = [
            `#${category}Counter`,
            `[data-category="${category}"] .document-count`,
            `.document-count[data-category="${category}"]`
        ];
        
        counterSelectors.forEach(selector => {
            const element = document.querySelector(selector);
            if (element) {
                element.textContent = `${documents.length} ${documents.length === 1 ? 'Datei' : 'Dateien'}`;
            }
        });
        
        // Listen aktualisieren
        const listSelectors = [
            `#${category}-documents`,
            `#uploaded-${category}`,
            `#documents-${category}`
        ];
        
        listSelectors.forEach(selector => {
            const container = document.querySelector(selector);
            if (container) {
                renderCleanDocumentList(container, documents);
            }
        });
    }
    
    // Saubere Dokument-Liste rendern
    function renderCleanDocumentList(container, documents) {
        if (documents.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: #6b7280; background: #f8fafc; border-radius: 8px; border: 2px dashed #d1d5db;">
                    <i class="fas fa-cloud-upload-alt" style="font-size: 1.5rem; margin-bottom: 0.5rem; opacity: 0.5;"></i>
                    <p style="margin: 0; font-size: 0.875rem;">Keine Dateien hochgeladen</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = documents.map(doc => `
            <div class="document-item-clean" style="
                display: flex; 
                align-items: center; 
                justify-content: space-between; 
                padding: 0.75rem; 
                background: white; 
                border: 1px solid #e5e7eb; 
                border-radius: 6px; 
                margin-bottom: 0.5rem;
                box-shadow: 0 1px 2px rgba(0,0,0,0.05);
            ">
                <div style="display: flex; align-items: center; gap: 0.75rem; flex: 1; min-width: 0;">
                    <i class="fas fa-file-alt" style="color: #6b7280; font-size: 1.125rem;"></i>
                    <div style="flex: 1; min-width: 0;">
                        <div style="font-weight: 500; color: #374151; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: 0.875rem;">
                            ${doc.name}
                        </div>
                        <div style="font-size: 0.75rem; color: #6b7280;">
                            ${formatFileSize(doc.size)} • ${formatDate(doc.uploadDate)}
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
                            border-radius: 4px;
                            padding: 0.375rem;
                            cursor: pointer;
                            font-size: 0.75rem;
                        "
                        title="${doc.includeInAnalysis ? 'Aus Analyse entfernen' : 'Zur Analyse hinzufügen'}"
                    >
                        <i class="fas ${doc.includeInAnalysis ? 'fa-check' : 'fa-plus'}"></i>
                    </button>
                    
                    <button 
                        onclick="removeDocumentSecure('${doc.id}')"
                        style="
                            background: #ef4444;
                            color: white;
                            border: none;
                            border-radius: 4px;
                            padding: 0.375rem;
                            cursor: pointer;
                            font-size: 0.75rem;
                        "
                        title="Löschen"
                    >
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    // Sichere Dokument-Entfernung
    function removeDocumentSecure(docId) {
        if (!confirm('Dokument wirklich löschen?')) return;
        
        try {
            const documents = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
            const filteredDocs = documents.filter(doc => doc.id !== docId);
            
            localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredDocs));
            showNotification('Dokument entfernt', 'info');
            updateAllDisplays();
            
            console.log(`🗑️ Dokument entfernt: ${docId}`);
            
        } catch (error) {
            console.error('❌ Fehler beim Löschen:', error);
            showNotification('Fehler beim Löschen', 'error');
        }
    }
    
    // Toggle Analyse
    function toggleDocumentAnalysis(docId) {
        try {
            const documents = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
            const doc = documents.find(d => d.id === docId);
            
            if (doc) {
                doc.includeInAnalysis = !doc.includeInAnalysis;
                localStorage.setItem(STORAGE_KEY, JSON.stringify(documents));
                
                const status = doc.includeInAnalysis ? 'hinzugefügt' : 'entfernt';
                showNotification(`Dokument zur Analyse ${status}`, 'info');
                updateAllDisplays();
            }
            
        } catch (error) {
            console.error('❌ Fehler beim Toggle:', error);
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
            background: ${colors[type]}; color: white; padding: 0.75rem 1rem;
            border-radius: 6px; font-size: 0.875rem; font-weight: 500;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2); max-width: 300px;
            animation: slideIn 0.3s ease-out;
        `;
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        if (!document.getElementById('notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = '@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }';
            document.head.appendChild(style);
        }
        
        setTimeout(() => notification.remove(), 3000);
    }
    
    // Globale Funktionen
    window.removeDocumentSecure = removeDocumentSecure;
    window.toggleDocumentAnalysis = toggleDocumentAnalysis;
    
    // Initialisierung
    function initialize() {
        console.log('🔧 Final Upload Fix - Initialisiere...');
        
        cleanupEventHandlers();
        attachUploadHandlers();
        updateAllDisplays();
        
        console.log('✅ Final Upload Fix - Bereit!');
    }
    
    // Starten
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }
    
    // Regelmäßige Bereinigung
    setInterval(() => {
        removeRedundantUIElements();
    }, 2000);
    
    console.log('✅ Final Upload Fix - Geladen');
    
})();
