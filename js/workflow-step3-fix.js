/**
 * Workflow Step 3 Upload Fix
 * Repariert SPEZIELL den Upload in Schritt 3 des Bewerbungsworkflows
 */

(function() {
    'use strict';
    
    console.log('🔧 Workflow Step 3 Fix - Starting...');
    
    // Storage Key (gleich wie überall)
    const STORAGE_KEY = 'applicationDocuments';
    
    // Workflow-spezifische Upload-Funktion
    function workflowUploadDocument(inputId, category) {
        console.log(`📤 Workflow Upload: ${inputId} → ${category}`);
        
        const input = document.getElementById(inputId);
        if (!input) {
            console.error(`❌ Input nicht gefunden: ${inputId}`);
            return;
        }
        
        const files = input.files;
        if (!files || files.length === 0) {
            console.log('ℹ️ Keine Dateien ausgewählt');
            return;
        }
        
        console.log(`📄 Verarbeite ${files.length} Dateien für ${category}`);
        
        let processedCount = 0;
        let totalFiles = files.length;
        
        // Jede Datei verarbeiten
        Array.from(files).forEach((file, index) => {
            console.log(`📄 Verarbeite Datei ${index + 1}/${totalFiles}: ${file.name}`);
            
            // Datei-Validierung
            if (file.size > 10 * 1024 * 1024) {
                showWorkflowNotification(`❌ ${file.name} ist zu groß (max 10MB)`, 'error');
                processedCount++;
                if (processedCount === totalFiles) finishWorkflowUpload(input);
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
                        source: 'workflow_step3',
                        metadata: {
                            extension: file.name.split('.').pop().toLowerCase(),
                            mimeType: file.type,
                            workflowStep: 3
                        }
                    };
                    
                    // Zu bestehenden Dokumenten hinzufügen
                    const existingDocs = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
                    existingDocs.push(document);
                    
                    // Speichern
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(existingDocs));
                    
                    console.log(`✅ Workflow-Dokument gespeichert: ${document.name}`);
                    
                    processedCount++;
                    
                    // Wenn alle Dateien verarbeitet sind
                    if (processedCount === totalFiles) {
                        finishWorkflowUpload(input);
                        showWorkflowNotification(`✅ ${totalFiles} Datei(en) erfolgreich hochgeladen!`, 'success');
                        
                        // Workflow-UI aktualisieren
                        updateWorkflowDisplay(category);
                    }
                    
                } catch (error) {
                    console.error(`❌ Fehler beim Verarbeiten von ${file.name}:`, error);
                    processedCount++;
                    showWorkflowNotification(`❌ Fehler beim Speichern von ${file.name}`, 'error');
                    
                    if (processedCount === totalFiles) {
                        finishWorkflowUpload(input);
                    }
                }
            };
            
            reader.onerror = function() {
                console.error(`❌ Lesefehler: ${file.name}`);
                processedCount++;
                showWorkflowNotification(`❌ Fehler beim Lesen von ${file.name}`, 'error');
                
                if (processedCount === totalFiles) {
                    finishWorkflowUpload(input);
                }
            };
            
            reader.readAsDataURL(file);
        });
    }
    
    // Upload abschließen
    function finishWorkflowUpload(input) {
        // Input zurücksetzen
        input.value = '';
        console.log('🔄 Workflow upload finished, input reset');
    }
    
    // Workflow-Display aktualisieren
    function updateWorkflowDisplay(category) {
        console.log(`🔄 Update workflow display for: ${category}`);
        
        const documents = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        const categoryDocs = documents.filter(doc => doc.category === category);
        
        // Counter aktualisieren
        const counterElement = document.querySelector(`[data-type="${category}"] .uploaded-count`);
        if (counterElement) {
            counterElement.textContent = `${categoryDocs.length} Dateien`;
            console.log(`✅ Counter updated: ${category} = ${categoryDocs.length} Dateien`);
        }
        
        // Datei-Liste aktualisieren
        const listElement = document.getElementById(`uploaded${category.charAt(0).toUpperCase() + category.slice(1)}s`);
        if (listElement) {
            listElement.innerHTML = renderWorkflowFileList(categoryDocs);
            console.log(`✅ File list updated: ${category}`);
        }
        
        // Alternative Liste aktualisieren
        const altListSelectors = [
            `#uploadedCVs`,
            `#uploadedCoverLetters`, 
            `#uploadedCertificates`,
            `[data-type="${category}"] .uploaded-files`
        ];
        
        altListSelectors.forEach(selector => {
            const element = document.querySelector(selector);
            if (element && (
                (category === 'cv' && selector.includes('CV')) ||
                (category === 'coverLetters' && selector.includes('CoverLetter')) ||
                (category === 'certificates' && selector.includes('Certificate')) ||
                selector.includes(category)
            )) {
                element.innerHTML = renderWorkflowFileList(categoryDocs);
                console.log(`✅ Alt list updated: ${selector}`);
            }
        });
    }
    
    // Workflow-Dateiliste rendern
    function renderWorkflowFileList(documents) {
        if (documents.length === 0) {
            return '<p style="color: #6b7280; text-align: center; padding: 1rem; font-size: 0.875rem;">Keine Dateien hochgeladen</p>';
        }
        
        return documents.map(doc => `
            <div class="workflow-file-item" style="
                display: flex; align-items: center; justify-content: space-between;
                padding: 0.75rem; background: #f8fafc; border: 1px solid #e5e7eb;
                border-radius: 6px; margin-bottom: 0.5rem;
            ">
                <div style="flex: 1; min-width: 0;">
                    <div style="font-weight: 500; color: #374151; font-size: 0.875rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                        ${doc.name}
                    </div>
                    <div style="font-size: 0.75rem; color: #6b7280;">
                        ${formatFileSize(doc.size)} • ${formatDate(doc.uploadDate)}
                    </div>
                </div>
                
                <div style="display: flex; gap: 0.25rem;">
                    <button onclick="toggleWorkflowDocAnalysis('${doc.id}')" 
                            style="background: ${doc.includeInAnalysis ? '#10b981' : '#6b7280'}; color: white; border: none; border-radius: 3px; padding: 0.25rem 0.5rem; font-size: 0.75rem; cursor: pointer;" 
                            title="${doc.includeInAnalysis ? 'Aus Analyse entfernen' : 'Zur Analyse hinzufügen'}">
                        <i class="fas ${doc.includeInAnalysis ? 'fa-check' : 'fa-plus'}"></i>
                    </button>
                    <button onclick="removeWorkflowDocument('${doc.id}')" 
                            style="background: #ef4444; color: white; border: none; border-radius: 3px; padding: 0.25rem 0.5rem; font-size: 0.75rem; cursor: pointer;" 
                            title="Löschen">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    // Workflow-spezifische Funktionen
    function toggleWorkflowDocAnalysis(docId) {
        const documents = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        const doc = documents.find(d => d.id === docId);
        
        if (doc) {
            doc.includeInAnalysis = !doc.includeInAnalysis;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(documents));
            
            // Alle Kategorien aktualisieren
            ['cv', 'coverLetters', 'certificates'].forEach(category => {
                updateWorkflowDisplay(category);
            });
            
            const status = doc.includeInAnalysis ? 'hinzugefügt' : 'entfernt';
            showWorkflowNotification(`📄 ${doc.name} zur Analyse ${status}`, 'info');
        }
    }
    
    function removeWorkflowDocument(docId) {
        if (!confirm('Dokument wirklich löschen?')) return;
        
        const documents = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        const doc = documents.find(d => d.id === docId);
        const filteredDocs = documents.filter(d => d.id !== docId);
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredDocs));
        
        if (doc) {
            // Kategorie-spezifische Aktualisierung
            updateWorkflowDisplay(doc.category);
            showWorkflowNotification(`📄 ${doc.name} entfernt`, 'success');
        }
    }
    
    // Workflow-Handler befestigen
    function attachWorkflowUploadHandlers() {
        console.log('📎 Befestige Workflow Upload Handler...');
        
        // Alle Upload-Inputs in Schritt 3 finden
        const workflowInputs = [
            { id: 'cvUpload', category: 'cv' },
            { id: 'coverLetterUpload', category: 'coverLetters' },
            { id: 'certificateUpload', category: 'certificates' }
        ];
        
        workflowInputs.forEach(({ id, category }) => {
            const input = document.getElementById(id);
            if (input) {
                // Bestehende Handler entfernen
                input.onchange = null;
                input.removeEventListener('change', workflowUploadHandler);
                
                // Neuen Handler hinzufügen
                function workflowUploadHandler(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log(`📤 Workflow upload triggered: ${id} → ${category}`);
                    workflowUploadDocument(id, category);
                }
                
                input.addEventListener('change', workflowUploadHandler);
                
                console.log(`✅ Workflow handler attached: ${id} → ${category}`);
            } else {
                console.warn(`⚠️ Workflow input not found: ${id}`);
            }
        });
    }
    
    // Workflow-spezifische Notification
    function showWorkflowNotification(message, type = 'info') {
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
        
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <i class="fas fa-cog" style="opacity: 0.8;"></i>
                <span>Workflow: ${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        if (!document.getElementById('workflow-notification-styles')) {
            const style = document.createElement('style');
            style.id = 'workflow-notification-styles';
            style.textContent = '@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }';
            document.head.appendChild(style);
        }
        
        setTimeout(() => notification.remove(), 4000);
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
    
    // Workflow-Step überwachen
    function monitorWorkflowStep() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    // Prüfe auf Schritt 3
                    const step3 = document.querySelector('[data-step="3"], .workflow-step:nth-child(3)');
                    if (step3) {
                        setTimeout(() => {
                            attachWorkflowUploadHandlers();
                            updateAllWorkflowDisplays();
                        }, 100);
                    }
                }
            });
        });
        
        const workflowContainer = document.getElementById('workflowContent') || document.body;
        observer.observe(workflowContainer, {
            childList: true,
            subtree: true
        });
    }
    
    // Alle Workflow-Displays aktualisieren
    function updateAllWorkflowDisplays() {
        console.log('🔄 Update all workflow displays...');
        
        ['cv', 'coverLetters', 'certificates'].forEach(category => {
            updateWorkflowDisplay(category);
        });
    }
    
    // Globale Funktionen überschreiben
    function overrideGlobalFunctions() {
        // Überschreibe fixedHandleDocumentUpload für Workflow
        window.fixedHandleDocumentUpload = workflowUploadDocument;
        
        // Workflow-spezifische Funktionen verfügbar machen
        window.toggleWorkflowDocAnalysis = toggleWorkflowDocAnalysis;
        window.removeWorkflowDocument = removeWorkflowDocument;
        window.updateWorkflowDisplay = updateWorkflowDisplay;
        
        console.log('✅ Global workflow functions overridden');
    }
    
    // Initialisierung
    function initialize() {
        console.log('🔧 Workflow Step 3 Fix - Initialisiere...');
        
        overrideGlobalFunctions();
        monitorWorkflowStep();
        
        // Sofort prüfen ob Schritt 3 bereits vorhanden ist
        setTimeout(() => {
            if (document.querySelector('[data-step="3"]')) {
                attachWorkflowUploadHandlers();
                updateAllWorkflowDisplays();
            }
        }, 500);
        
        console.log('✅ Workflow Step 3 Fix - Bereit!');
    }
    
    // Starten
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }
    
    // Regelmäßige Überprüfung
    setInterval(() => {
        if (document.querySelector('[data-step="3"]')) {
            attachWorkflowUploadHandlers();
        }
    }, 3000);
    
    console.log('✅ Workflow Step 3 Fix - Geladen');
    
})();
