/**
 * Upload Debug & Fix
 * Sofortige Reparatur von Upload-Problemen
 */

(function() {
    'use strict';
    
    console.log('🔧 UPLOAD DEBUG & FIX - Starting...');
    
    const STORAGE_KEY = 'applicationDocuments';
    
    // SOFORTIGE REPARATUR STARTEN
    function immediateRepair() {
        console.log('🚨 IMMEDIATE REPAIR - Starting...');
        
        // 1. WORKFLOW INPUT MAPPING REPARIEREN
        repairWorkflowInputMapping();
        
        // 2. DOCUMENT SELECTION REPARIEREN
        repairDocumentSelection();
        
        // 3. ERROR HANDLING VERBESSERN
        improveErrorHandling();
        
        // 4. DEBUG TOOLS AKTIVIEREN
        activateDebugTools();
        
        console.log('✅ IMMEDIATE REPAIR - Complete');
    }
    
    // 1. Workflow Input Mapping reparieren
    function repairWorkflowInputMapping() {
        console.log('🔧 Repairing workflow input mapping...');
        
        // SPEZIFISCHE WORKFLOW INPUTS
        const workflowInputs = [
            { id: 'cvUpload', category: 'cv', name: 'Lebenslauf' },
            { id: 'coverLetterUpload', category: 'coverLetters', name: 'Anschreiben' },
            { id: 'certificateUpload', category: 'certificates', name: 'Zeugnisse' }
        ];
        
        workflowInputs.forEach(({ id, category, name }) => {
            const input = document.getElementById(id);
            
            if (input) {
                console.log(`🎯 REPAIRING: ${id} -> ${category} (${name})`);
                
                // ENTFERNE ALLE HANDLER
                input.onchange = null;
                input.removeAttribute('onchange');
                
                // NEUER DEBUGGER HANDLER
                const debugHandler = function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    console.log(`🔧 DEBUG UPLOAD: ${id} (${category})`);
                    console.log(`📁 Files selected: ${e.target.files.length}`);
                    
                    if (e.target.files && e.target.files.length > 0) {
                        Array.from(e.target.files).forEach(file => {
                            console.log(`📄 File: ${file.name} (${file.size} bytes, ${file.type})`);
                        });
                        
                        // DIREKTER UPLOAD MIT FESTER KATEGORIE
                        debugUpload(Array.from(e.target.files), category, name);
                    } else {
                        debugMessage(`❌ Keine Dateien in ${name} Input`, 'error');
                    }
                };
                
                // MEHRFACH BINDEN
                input.addEventListener('change', debugHandler, true);
                input.onchange = debugHandler;
                
                console.log(`✅ REPAIRED: ${id}`);
            } else {
                console.log(`❌ INPUT NOT FOUND: ${id}`);
            }
        });
    }
    
    // Debug Upload Function
    function debugUpload(files, category, categoryName) {
        console.log(`🔧 DEBUG UPLOAD: ${files.length} files -> ${category} (${categoryName})`);
        
        debugMessage(`📤 Uploading ${files.length} ${categoryName} file(s)...`, 'info');
        
        let processed = 0;
        let successful = 0;
        
        files.forEach((file, index) => {
            console.log(`🔧 Processing file ${index + 1}/${files.length}: ${file.name}`);
            
            const reader = new FileReader();
            
            reader.onload = function(e) {
                try {
                    const doc = {
                        id: `debug_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                        name: file.name,
                        category: category,
                        size: file.size,
                        type: file.type,
                        content: e.target.result,
                        uploadDate: new Date().toISOString(),
                        includeInAnalysis: true,
                        source: 'debug-upload-fix'
                    };
                    
                    // LOKALE SPEICHERUNG
                    const docs = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
                    docs.push(doc);
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
                    
                    successful++;
                    console.log(`✅ DEBUG SUCCESS: ${doc.name} (ID: ${doc.id})`);
                    
                } catch (error) {
                    console.error(`❌ DEBUG ERROR: ${file.name}`, error);
                }
                
                processed++;
                
                if (processed === files.length) {
                    finishDebugUpload(successful, files.length - successful, categoryName);
                }
            };
            
            reader.onerror = function(error) {
                console.error(`❌ DEBUG READ ERROR: ${file.name}`, error);
                processed++;
                
                if (processed === files.length) {
                    finishDebugUpload(successful, files.length - successful, categoryName);
                }
            };
            
            reader.readAsDataURL(file);
        });
    }
    
    // Debug Upload Abschluss
    function finishDebugUpload(successful, failed, categoryName) {
        console.log(`🎯 DEBUG UPLOAD COMPLETE: ${successful} success, ${failed} failed`);
        
        if (successful > 0) {
            debugMessage(`✅ ${successful} ${categoryName} erfolgreich hochgeladen!`, 'success');
            
            // Update displays
            setTimeout(() => {
                updateDebugDisplays();
            }, 100);
        }
        
        if (failed > 0) {
            debugMessage(`❌ ${failed} ${categoryName} Upload(s) fehlgeschlagen`, 'error');
        }
    }
    
    // 2. Document Selection reparieren
    function repairDocumentSelection() {
        console.log('🔧 Repairing document selection...');
        
        // Check if document selection exists
        setTimeout(() => {
            const selectionSection = document.getElementById('workflowDocumentSelection');
            
            if (!selectionSection) {
                console.log('📋 Creating document selection section...');
                createDocumentSelectionSection();
            } else {
                console.log('📋 Refreshing existing document selection...');
                refreshDocumentSelection();
            }
        }, 500);
    }
    
    // Erstelle Document Selection Section
    function createDocumentSelectionSection() {
        const step3 = document.querySelector('[data-step="3"]');
        if (!step3) {
            console.log('❌ Step 3 not found');
            return;
        }
        
        const docs = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        
        if (docs.length === 0) {
            console.log('📋 No documents to show');
            return;
        }
        
        const sectionHTML = `
            <div id="workflowDocumentSelection" style="margin-top: 2rem; padding: 1.5rem; background: #f8fafc; border-radius: 12px; border: 1px solid #e5e7eb;">
                <h3 style="margin: 0 0 1rem; color: #374151; display: flex; align-items: center; gap: 0.5rem;">
                    <i class="fas fa-files" style="color: #6366f1;"></i>
                    Dokumente für KI-Analyse auswählen
                </h3>
                <p style="margin: 0 0 1.5rem; color: #6b7280; font-size: 0.875rem;">
                    ${docs.length} Dokument(e) verfügbar. Wählen Sie aus, welche für die Profilanalyse verwendet werden sollen.
                </p>
                
                <div id="documentSelectionList">
                    ${renderDebugDocumentList(docs)}
                </div>
                
                <div style="margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid #e5e7eb;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div style="color: #6b7280; font-size: 0.875rem;">
                            <span id="selectedCount">${docs.filter(d => d.includeInAnalysis).length}</span> von ${docs.length} Dokumenten ausgewählt
                        </div>
                        <div style="display: flex; gap: 1rem;">
                            <button onclick="debugSelectAll(true)" style="
                                background: #6366f1; color: white; border: none; border-radius: 6px;
                                padding: 0.5rem 1rem; cursor: pointer; font-size: 0.875rem;
                            ">Alle auswählen</button>
                            <button onclick="debugSelectAll(false)" style="
                                background: #6b7280; color: white; border: none; border-radius: 6px;
                                padding: 0.5rem 1rem; cursor: pointer; font-size: 0.875rem;
                            ">Alle abwählen</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Insert after upload boxes
        const uploadBoxes = step3.querySelectorAll('.upload-box');
        const lastUploadBox = uploadBoxes[uploadBoxes.length - 1];
        
        if (lastUploadBox) {
            lastUploadBox.insertAdjacentHTML('afterend', sectionHTML);
            console.log('✅ Document selection section created');
        }
    }
    
    // Render Debug Document List
    function renderDebugDocumentList(docs) {
        return docs.map(doc => {
            const categoryInfo = getCategoryInfo(doc.category);
            
            return `
                <div class="debug-document-item" style="
                    background: white; border: 1px solid #e5e7eb; border-radius: 8px;
                    padding: 1rem; margin-bottom: 0.75rem; display: flex; align-items: center; gap: 1rem;
                    transition: all 0.2s ease; cursor: pointer;
                    ${doc.includeInAnalysis ? 'border-color: #6366f1; background: #f0f9ff;' : ''}
                " onclick="debugToggleSelection('${doc.id}')">
                    
                    <div style="flex-shrink: 0;">
                        <input type="checkbox" ${doc.includeInAnalysis ? 'checked' : ''} 
                               style="width: 18px; height: 18px; cursor: pointer;"
                               onchange="event.stopPropagation(); debugToggleSelection('${doc.id}')">
                    </div>
                    
                    <div style="
                        background: ${categoryInfo.color}; color: white; width: 40px; height: 40px;
                        border-radius: 8px; display: flex; align-items: center; justify-content: center;
                        flex-shrink: 0;
                    ">
                        <i class="fas ${categoryInfo.icon}" style="font-size: 1.125rem;"></i>
                    </div>
                    
                    <div style="flex: 1; min-width: 0;">
                        <div style="font-weight: 500; color: #374151; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                            ${doc.name}
                        </div>
                        <div style="font-size: 0.75rem; color: #6b7280; margin-top: 0.25rem;">
                            ${categoryInfo.name} • ${formatFileSize(doc.size)} • ${formatDate(doc.uploadDate)}
                        </div>
                    </div>
                    
                    <div style="flex-shrink: 0;">
                        ${doc.includeInAnalysis ? 
                            '<i class="fas fa-check-circle" style="color: #10b981; font-size: 1.25rem;"></i>' :
                            '<i class="fas fa-circle" style="color: #d1d5db; font-size: 1.25rem;"></i>'
                        }
                    </div>
                </div>
            `;
        }).join('');
    }
    
    // Kategorie Info
    function getCategoryInfo(category) {
        const infos = {
            'cv': { name: 'Lebenslauf', icon: 'fa-user', color: '#3b82f6' },
            'certificates': { name: 'Zeugnis', icon: 'fa-certificate', color: '#10b981' },
            'certifications': { name: 'Zertifikat', icon: 'fa-award', color: '#f59e0b' },
            'coverLetters': { name: 'Anschreiben', icon: 'fa-envelope', color: '#8b5cf6' },
            'portrait': { name: 'Portrait', icon: 'fa-image', color: '#ec4899' },
            'fullApplications': { name: 'Vollständige Bewerbung', icon: 'fa-folder', color: '#6b7280' }
        };
        return infos[category] || { name: 'Dokument', icon: 'fa-file', color: '#6b7280' };
    }
    
    // 3. Error Handling verbessern
    function improveErrorHandling() {
        console.log('🔧 Improving error handling...');
        
        // Global Error Handler
        window.addEventListener('error', function(e) {
            console.error('🚨 GLOBAL ERROR:', e.error);
            debugMessage(`Global Error: ${e.error.message}`, 'error');
        });
        
        // Promise Rejection Handler
        window.addEventListener('unhandledrejection', function(e) {
            console.error('🚨 UNHANDLED PROMISE REJECTION:', e.reason);
            debugMessage(`Promise Error: ${e.reason}`, 'error');
        });
    }
    
    // 4. Debug Tools aktivieren
    function activateDebugTools() {
        console.log('🔧 Activating debug tools...');
        
        // Debug Panel erstellen
        createDebugPanel();
        
        // Global Debug Functions
        window.debugUpload = debugUpload;
        window.debugToggleSelection = debugToggleSelection;
        window.debugSelectAll = debugSelectAll;
        window.debugRefreshDocuments = refreshDocumentSelection;
        window.debugShowDocuments = () => {
            const docs = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
            console.table(docs.map(d => ({
                name: d.name,
                category: d.category,
                includeInAnalysis: d.includeInAnalysis,
                uploadDate: d.uploadDate
            })));
        };
    }
    
    // Debug Panel erstellen
    function createDebugPanel() {
        const panel = document.createElement('div');
        panel.id = 'debugPanel';
        panel.style.cssText = `
            position: fixed; bottom: 20px; left: 20px; z-index: 99999;
            background: #1f2937; color: white; border-radius: 8px; padding: 1rem;
            min-width: 300px; font-family: monospace; font-size: 0.75rem;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        `;
        
        const docs = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        
        panel.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 0.5rem; color: #10b981;">
                🔧 Upload Debug Panel
            </div>
            <div style="margin-bottom: 0.5rem;">
                Documents: ${docs.length} | Selected: ${docs.filter(d => d.includeInAnalysis).length}
            </div>
            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                <button onclick="debugRefreshDocuments()" style="background: #3b82f6; color: white; border: none; border-radius: 4px; padding: 0.25rem 0.5rem; font-size: 0.75rem; cursor: pointer;">Refresh</button>
                <button onclick="debugShowDocuments()" style="background: #8b5cf6; color: white; border: none; border-radius: 4px; padding: 0.25rem 0.5rem; font-size: 0.75rem; cursor: pointer;">Show Docs</button>
                <button onclick="localStorage.clear(); location.reload();" style="background: #ef4444; color: white; border: none; border-radius: 4px; padding: 0.25rem 0.5rem; font-size: 0.75rem; cursor: pointer;">Clear All</button>
            </div>
        `;
        
        document.body.appendChild(panel);
        
        // Auto-hide after 10 seconds
        setTimeout(() => {
            panel.style.opacity = '0.3';
            panel.style.pointerEvents = 'none';
        }, 10000);
    }
    
    // Document Selection Functions
    function debugToggleSelection(docId) {
        console.log(`🔧 Toggle selection: ${docId}`);
        
        const docs = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        const doc = docs.find(d => d.id === docId);
        
        if (doc) {
            doc.includeInAnalysis = !doc.includeInAnalysis;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
            
            refreshDocumentSelection();
            updateDebugDisplays();
            
            console.log(`✅ ${doc.name} ${doc.includeInAnalysis ? 'selected' : 'deselected'}`);
        }
    }
    
    function debugSelectAll(select) {
        console.log(`🔧 Select all: ${select}`);
        
        const docs = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        docs.forEach(doc => {
            doc.includeInAnalysis = select;
        });
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
        refreshDocumentSelection();
        updateDebugDisplays();
        
        console.log(`✅ All documents ${select ? 'selected' : 'deselected'}`);
    }
    
    // Refresh Document Selection
    function refreshDocumentSelection() {
        const listContainer = document.getElementById('documentSelectionList');
        const countElement = document.getElementById('selectedCount');
        
        if (listContainer) {
            const docs = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
            listContainer.innerHTML = renderDebugDocumentList(docs);
            
            if (countElement) {
                countElement.textContent = docs.filter(d => d.includeInAnalysis).length;
            }
        }
    }
    
    // Update Debug Displays
    function updateDebugDisplays() {
        // Update all display functions if they exist
        if (window.updateAllDisplays) {
            window.updateAllDisplays();
        }
        
        if (window.updateAllFinalDisplays) {
            window.updateAllFinalDisplays();
        }
        
        if (window.updateDocumentSelectionSection) {
            window.updateDocumentSelectionSection();
        }
        
        // Update debug panel
        const panel = document.getElementById('debugPanel');
        if (panel) {
            const docs = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
            const countText = panel.querySelector('div:nth-child(2)');
            if (countText) {
                countText.textContent = `Documents: ${docs.length} | Selected: ${docs.filter(d => d.includeInAnalysis).length}`;
            }
        }
    }
    
    // Debug Message System
    function debugMessage(message, type = 'info') {
        const colors = { success: '#10b981', error: '#ef4444', info: '#3b82f6', warning: '#f59e0b' };
        const icons = { success: 'fa-check', error: 'fa-exclamation-triangle', info: 'fa-info-circle', warning: 'fa-exclamation' };
        
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed; top: 20px; right: 20px; z-index: 99999;
            background: ${colors[type]}; color: white; 
            padding: 1rem 1.5rem; border-radius: 8px; font-weight: 600;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3); max-width: 400px;
            font-size: 0.875rem; animation: debugSlideIn 0.3s ease-out;
            border-left: 4px solid rgba(255,255,255,0.3);
        `;
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.75rem;">
                <i class="fas ${icons[type]}" style="font-size: 1rem;"></i>
                <span>🔧 ${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        if (!document.getElementById('debug-styles')) {
            const style = document.createElement('style');
            style.id = 'debug-styles';
            style.textContent = '@keyframes debugSlideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }';
            document.head.appendChild(style);
        }
        
        setTimeout(() => notification.remove(), 4000);
    }
    
    // Utility Functions
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
    
    // SOFORTIGE AKTIVIERUNG
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', immediateRepair);
    } else {
        immediateRepair();
    }
    
    // DELAYED ACTIVATION (für dynamische Inhalte)
    setTimeout(immediateRepair, 1000);
    
    console.log('✅ UPLOAD DEBUG & FIX - LOADED');
    
})();
