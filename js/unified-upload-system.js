/**
 * UNIFIED UPLOAD SYSTEM
 * Ein einziges, sauberes System für alle Upload-Funktionen
 * Ersetzt ALLE anderen Upload-Fixes
 */

(function() {
    'use strict';
    
    console.log('🔄 Unified Upload System - Starting...');
    
    // Einziger Storage Key
    const DOCUMENTS_KEY = 'applicationDocuments';
    
    // Kategorien
    const CATEGORIES = {
        cv: { name: 'Lebensläufe', icon: 'fa-user', color: '#3b82f6' },
        certificates: { name: 'Zeugnisse', icon: 'fa-certificate', color: '#10b981' },
        certifications: { name: 'Zertifikate', icon: 'fa-award', color: '#f59e0b' },
        coverLetters: { name: 'Anschreiben', icon: 'fa-envelope', color: '#8b5cf6' },
        portrait: { name: 'Portraits', icon: 'fa-image', color: '#ec4899' },
        fullApplications: { name: 'Vollständige Bewerbungen', icon: 'fa-folder', color: '#6b7280' }
    };
    
    // Alle Dokumente laden
    function getAllDocuments() {
        try {
            return JSON.parse(localStorage.getItem(DOCUMENTS_KEY) || '[]');
        } catch {
            return [];
        }
    }
    
    // Dokumente speichern
    function saveAllDocuments(documents) {
        try {
            localStorage.setItem(DOCUMENTS_KEY, JSON.stringify(documents));
            return true;
        } catch {
            return false;
        }
    }
    
    // EINZIGE Upload-Funktion
    function uploadDocument(category, file) {
        console.log(`📤 Upload: ${file.name} → ${category}`);
        
        return new Promise((resolve, reject) => {
            if (file.size > 10 * 1024 * 1024) {
                reject(new Error('Datei zu groß (max 10MB)'));
                return;
            }
            
            const reader = new FileReader();
            
            reader.onload = function(e) {
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
                
                const documents = getAllDocuments();
                documents.push(doc);
                
                if (saveAllDocuments(documents)) {
                    showNotification(`✅ ${file.name} hochgeladen!`);
                    updateAllUI();
                    resolve(doc);
                } else {
                    reject(new Error('Speichern fehlgeschlagen'));
                }
            };
            
            reader.onerror = () => reject(new Error('Datei konnte nicht gelesen werden'));
            reader.readAsDataURL(file);
        });
    }
    
    // Dokument löschen
    function deleteDocument(docId) {
        const documents = getAllDocuments();
        const filtered = documents.filter(doc => doc.id !== docId);
        
        if (saveAllDocuments(filtered)) {
            showNotification('Dokument gelöscht');
            updateAllUI();
            return true;
        }
        return false;
    }
    
    // EINZIGE UI-Update Funktion
    function updateAllUI() {
        console.log('🔄 Update All UI...');
        
        const documents = getAllDocuments();
        
        // Update Tab-Counters
        updateTabCounters(documents);
        
        // Update alle Listen
        updateDocumentLists(documents);
        
        // Update Workflow-Displays
        updateWorkflowDisplays(documents);
    }
    
    // Tab-Counter aktualisieren
    function updateTabCounters(documents) {
        Object.keys(CATEGORIES).forEach(category => {
            const count = documents.filter(doc => doc.category === category).length;
            
            // Verschiedene Counter-Selektoren
            const selectors = [
                `#${category}-tab .count`,
                `[data-tab="${category}"] .count`,
                `.tab-${category} .count`,
                `#${category}Counter`
            ];
            
            selectors.forEach(selector => {
                const element = document.querySelector(selector);
                if (element) {
                    element.textContent = count;
                }
            });
        });
        
        // Gesamt-Counter
        const totalElement = document.querySelector('#alle-tab .count, [data-tab="alle"] .count');
        if (totalElement) {
            totalElement.textContent = documents.length;
        }
    }
    
    // Dokument-Listen aktualisieren
    function updateDocumentLists(documents) {
        // Alle Listen-Container finden
        const listContainers = [
            '#document-list',
            '#documents-container',
            '#media-content',
            '.documents-list'
        ];
        
        listContainers.forEach(selector => {
            const container = document.querySelector(selector);
            if (container) {
                renderDocuments(container, documents);
            }
        });
    }
    
    // Workflow-Displays aktualisieren
    function updateWorkflowDisplays(documents) {
        Object.keys(CATEGORIES).forEach(category => {
            const categoryDocs = documents.filter(doc => doc.category === category);
            const count = categoryDocs.length;
            
            // Workflow-spezifische Counter
            const workflowSelectors = [
                `#uploaded${category.charAt(0).toUpperCase() + category.slice(1)}`,
                `[data-category="${category}"] .uploaded-count`,
                `#${category}-documents`
            ];
            
            workflowSelectors.forEach(selector => {
                const element = document.querySelector(selector);
                if (element) {
                    if (element.tagName === 'DIV' || element.classList.contains('list')) {
                        renderDocuments(element, categoryDocs);
                    } else {
                        element.textContent = `${count} ${count === 1 ? 'Datei' : 'Dateien'}`;
                    }
                }
            });
        });
    }
    
    // Dokumente rendern
    function renderDocuments(container, documents) {
        if (documents.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: #6b7280;">
                    <i class="fas fa-cloud-upload-alt" style="font-size: 2rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                    <p style="margin: 0;">Keine Dateien hochgeladen</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = documents.map(doc => {
            const category = CATEGORIES[doc.category] || { name: doc.category, icon: 'fa-file', color: '#6b7280' };
            
            return `
                <div class="document-item" style="
                    display: flex; align-items: center; gap: 1rem; padding: 1rem;
                    background: white; border: 1px solid #e5e7eb; border-radius: 8px;
                    margin-bottom: 0.75rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                ">
                    <div style="
                        background: ${category.color}; color: white; width: 40px; height: 40px;
                        border-radius: 8px; display: flex; align-items: center; justify-content: center;
                    ">
                        <i class="fas ${category.icon}"></i>
                    </div>
                    
                    <div style="flex: 1; min-width: 0;">
                        <div style="font-weight: 500; color: #374151; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                            ${doc.name}
                        </div>
                        <div style="font-size: 0.75rem; color: #6b7280;">
                            ${formatFileSize(doc.size)} • ${formatDate(doc.uploadDate)}
                        </div>
                    </div>
                    
                    <div style="display: flex; gap: 0.5rem;">
                        <button onclick="toggleAnalysis('${doc.id}')" 
                                style="background: ${doc.includeInAnalysis ? '#10b981' : '#6b7280'}; color: white; border: none; border-radius: 4px; padding: 0.375rem; cursor: pointer;">
                            <i class="fas ${doc.includeInAnalysis ? 'fa-check' : 'fa-plus'}"></i>
                        </button>
                        <button onclick="removeDocument('${doc.id}')" 
                                style="background: #ef4444; color: white; border: none; border-radius: 4px; padding: 0.375rem; cursor: pointer;">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    // Tab-System reparieren
    function fixTabSystem() {
        console.log('🔧 Repariere Tab-System...');
        
        // Alle Tab-Buttons finden
        const tabButtons = document.querySelectorAll('[data-tab], .tab-button, .nav-tab');
        
        tabButtons.forEach(button => {
            // Bestehende Handler entfernen
            button.onclick = null;
            
            // Neuen Handler hinzufügen
            button.addEventListener('click', function(e) {
                e.preventDefault();
                
                const tab = this.getAttribute('data-tab') || 
                           this.textContent.toLowerCase().trim() ||
                           'alle';
                
                switchTab(tab);
            });
        });
        
        console.log(`✅ ${tabButtons.length} Tab-Buttons repariert`);
    }
    
    // Tab wechseln
    function switchTab(tabName) {
        console.log(`🔄 Switch to tab: ${tabName}`);
        
        const documents = getAllDocuments();
        let filteredDocs;
        
        if (tabName === 'alle' || tabName === 'all') {
            filteredDocs = documents;
        } else {
            // Tab-Name zu Kategorie mappen
            const categoryMap = {
                'lebensläufe': 'cv',
                'cv': 'cv',
                'zeugnisse': 'certificates', 
                'certificates': 'certificates',
                'zertifikate': 'certifications',
                'certifications': 'certifications',
                'anschreiben': 'coverLetters',
                'coverletters': 'coverLetters',
                'portraits': 'portrait',
                'portrait': 'portrait',
                'vollständige': 'fullApplications',
                'full': 'fullApplications'
            };
            
            const category = categoryMap[tabName.toLowerCase()] || tabName;
            filteredDocs = documents.filter(doc => doc.category === category);
        }
        
        // Aktiven Tab highlighten
        document.querySelectorAll('[data-tab], .tab-button, .nav-tab').forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-tab') === tabName || 
                btn.textContent.toLowerCase().includes(tabName)) {
                btn.classList.add('active');
            }
        });
        
        // Content aktualisieren
        const contentContainer = document.querySelector('#document-list, #media-content, .tab-content');
        if (contentContainer) {
            renderDocuments(contentContainer, filteredDocs);
        }
    }
    
    // Upload-Handler für alle Inputs
    function attachUploadHandlers() {
        console.log('📎 Befestige Upload-Handler...');
        
        const fileInputs = document.querySelectorAll('input[type="file"]');
        
        fileInputs.forEach(input => {
            // Bestehende Handler entfernen
            const newInput = input.cloneNode(true);
            input.parentNode.replaceChild(newInput, input);
            
            // Kategorie ermitteln
            const category = determineCategoryFromInput(newInput);
            
            // Neuen Handler hinzufügen
            newInput.addEventListener('change', async function(e) {
                const files = e.target.files;
                if (!files || files.length === 0) return;
                
                console.log(`📤 Upload: ${files.length} Dateien für ${category}`);
                
                for (let file of files) {
                    try {
                        await uploadDocument(category, file);
                    } catch (error) {
                        showNotification(`❌ ${file.name}: ${error.message}`, 'error');
                    }
                }
                
                e.target.value = '';
            });
        });
        
        console.log(`✅ ${fileInputs.length} Upload-Handler befestigt`);
    }
    
    // Kategorie aus Input ermitteln
    function determineCategoryFromInput(input) {
        const id = input.id.toLowerCase();
        
        if (id.includes('cv') || id.includes('lebenslauf')) return 'cv';
        if (id.includes('certificate') && !id.includes('certification')) return 'certificates';
        if (id.includes('certification')) return 'certifications';
        if (id.includes('coverletter') || id.includes('anschreiben')) return 'coverLetters';
        if (id.includes('portrait') || id.includes('photo')) return 'portrait';
        if (id.includes('full') || id.includes('complete')) return 'fullApplications';
        
        return 'general';
    }
    
    // Workflow-Vorschau reparieren
    function fixWorkflowPreview() {
        console.log('🔧 Repariere Workflow-Vorschau...');
        
        // Alle Vorschau-Buttons finden
        const previewButtons = document.querySelectorAll('button[onclick*="preview"], .btn-preview');
        
        previewButtons.forEach(button => {
            button.onclick = null;
            button.addEventListener('click', function(e) {
                e.preventDefault();
                showWorkflowPreview();
            });
        });
    }
    
    // Workflow-Vorschau anzeigen
    function showWorkflowPreview() {
        console.log('👁️ Zeige Workflow-Vorschau...');
        
        const workflowData = JSON.parse(localStorage.getItem('workflowData') || '{}');
        
        const previewHTML = `
            <div id="workflow-preview-modal" style="
                position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                background: rgba(0,0,0,0.5); z-index: 10000; display: flex;
                align-items: center; justify-content: center; padding: 2rem;
            ">
                <div style="
                    background: white; border-radius: 12px; max-width: 800px;
                    width: 100%; max-height: 90vh; overflow-y: auto;
                    box-shadow: 0 20px 50px rgba(0,0,0,0.3);
                ">
                    <div style="
                        background: linear-gradient(135deg, #6366f1, #8b5cf6);
                        color: white; padding: 2rem; border-radius: 12px 12px 0 0;
                    ">
                        <h2 style="margin: 0; font-size: 1.5rem;">📄 Bewerbungsvorschau</h2>
                        <p style="margin: 0.5rem 0 0; opacity: 0.9;">
                            ${workflowData.company || 'Unternehmen'} • ${workflowData.position || 'Position'}
                        </p>
                    </div>
                    
                    <div style="padding: 2rem;">
                        <div style="margin-bottom: 2rem;">
                            <h3 style="color: #374151; margin: 0 0 1rem;">📋 Zusammenfassung</h3>
                            <div style="background: #f8fafc; padding: 1.5rem; border-radius: 8px;">
                                <p><strong>Unternehmen:</strong> ${workflowData.company || 'Nicht angegeben'}</p>
                                <p><strong>Position:</strong> ${workflowData.position || 'Nicht angegeben'}</p>
                                <p><strong>Dokumente:</strong> ${getAllDocuments().length} Dateien</p>
                            </div>
                        </div>
                        
                        <div style="margin-bottom: 2rem;">
                            <h3 style="color: #374151; margin: 0 0 1rem;">📁 Hochgeladene Dokumente</h3>
                            ${renderPreviewDocuments()}
                        </div>
                        
                        <div style="text-align: center;">
                            <button onclick="closePreview()" style="
                                background: #6366f1; color: white; border: none;
                                padding: 0.75rem 2rem; border-radius: 8px;
                                font-weight: 600; cursor: pointer;
                            ">
                                Schließen
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', previewHTML);
    }
    
    // Vorschau-Dokumente rendern
    function renderPreviewDocuments() {
        const documents = getAllDocuments();
        
        if (documents.length === 0) {
            return '<p style="color: #6b7280; text-align: center;">Keine Dokumente hochgeladen</p>';
        }
        
        return documents.map(doc => {
            const category = CATEGORIES[doc.category] || { name: doc.category, icon: 'fa-file' };
            return `
                <div style="display: flex; align-items: center; gap: 1rem; padding: 0.75rem; background: white; border: 1px solid #e5e7eb; border-radius: 6px; margin-bottom: 0.5rem;">
                    <i class="fas ${category.icon}" style="color: #6b7280;"></i>
                    <div style="flex: 1;">
                        <div style="font-weight: 500;">${doc.name}</div>
                        <div style="font-size: 0.75rem; color: #6b7280;">${category.name}</div>
                    </div>
                </div>
            `;
        }).join('');
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
    
    function showNotification(message, type = 'success') {
        const colors = { success: '#10b981', error: '#ef4444', info: '#3b82f6' };
        
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed; top: 20px; right: 20px; z-index: 10000;
            background: ${colors[type]}; color: white; padding: 0.75rem 1rem;
            border-radius: 6px; font-weight: 500; box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => notification.remove(), 3000);
    }
    
    // Globale Funktionen
    window.uploadDocument = uploadDocument;
    window.removeDocument = deleteDocument;
    window.toggleAnalysis = function(docId) {
        const documents = getAllDocuments();
        const doc = documents.find(d => d.id === docId);
        if (doc) {
            doc.includeInAnalysis = !doc.includeInAnalysis;
            saveAllDocuments(documents);
            updateAllUI();
        }
    };
    window.switchTab = switchTab;
    window.closePreview = function() {
        const modal = document.getElementById('workflow-preview-modal');
        if (modal) modal.remove();
    };
    
    // Überschreibe alle anderen Upload-Funktionen
    window.uploadApplicationDocument = uploadDocument;
    window.fixedHandleDocumentUpload = function(inputId, category) {
        const input = document.getElementById(inputId);
        if (input && input.files) {
            Array.from(input.files).forEach(file => uploadDocument(category, file));
        }
    };
    
    // Initialisierung
    function initialize() {
        console.log('🔄 Unified Upload System - Initialisiere...');
        
        attachUploadHandlers();
        fixTabSystem();
        fixWorkflowPreview();
        updateAllUI();
        
        console.log('✅ Unified Upload System - Bereit!');
    }
    
    // Starten
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }
    
    // Regelmäßige Updates
    setInterval(initialize, 5000);
    
    console.log('✅ Unified Upload System - Geladen');
    
})();
