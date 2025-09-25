/**
 * Simple Working Upload
 * Einfaches, funktionierendes Upload-System ohne UI-Chaos
 */

(function() {
    'use strict';
    
    console.log('📤 Simple Working Upload - Starting...');
    
    const STORAGE_KEY = 'applicationDocuments';
    
    // Entferne alle störenden UI-Elemente
    function cleanupUI() {
        // Entferne überlappende Panels
        const debugPanel = document.getElementById('debugPanel');
        if (debugPanel) debugPanel.remove();
        
        const reloadButton = document.getElementById('hardReloadButton');
        if (reloadButton) reloadButton.remove();
        
        // Entferne alle fixed position elements die stören könnten
        const fixedElements = document.querySelectorAll('[style*="position: fixed"]');
        fixedElements.forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.bottom > window.innerHeight - 100 && rect.right > window.innerWidth - 200) {
                el.remove();
                console.log('🧹 Removed overlapping element');
            }
        });
        
        console.log('🧹 UI cleanup completed');
    }
    
    // Einfacher Upload Handler
    function simpleUpload(files, category = null) {
        console.log(`📤 Simple Upload: ${files.length} files`);
        
        if (!files || files.length === 0) {
            showSimpleMessage('Keine Dateien ausgewählt', 'error');
            return;
        }
        
        // Wenn keine Kategorie, zeige einfachen Dialog
        if (!category) {
            showSimpleCategoryDialog(files);
            return;
        }
        
        showSimpleMessage(`Uploading ${files.length} file(s)...`, 'info');
        
        let processed = 0;
        let successful = 0;
        
        Array.from(files).forEach((file, index) => {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                try {
                    const doc = {
                        id: `simple_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                        name: file.name,
                        category: category,
                        size: file.size,
                        type: file.type,
                        content: e.target.result,
                        uploadDate: new Date().toISOString(),
                        includeInAnalysis: true,
                        source: 'simple-working-upload'
                    };
                    
                    // Speichern
                    const docs = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
                    docs.push(doc);
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
                    
                    successful++;
                    console.log(`✅ Simple success: ${doc.name}`);
                    
                } catch (error) {
                    console.error(`❌ Simple error: ${file.name}`, error);
                }
                
                processed++;
                
                if (processed === files.length) {
                    finishSimpleUpload(successful, files.length - successful);
                }
            };
            
            reader.onerror = () => {
                processed++;
                console.error(`❌ Read error: ${file.name}`);
                
                if (processed === files.length) {
                    finishSimpleUpload(successful, files.length - successful);
                }
            };
            
            reader.readAsDataURL(file);
        });
    }
    
    // Upload Abschluss
    function finishSimpleUpload(successful, failed) {
        console.log(`📤 Simple upload complete: ${successful} success, ${failed} failed`);
        
        if (successful > 0) {
            showSimpleMessage(`✅ ${successful} Datei(en) hochgeladen!`, 'success');
            updateSimpleDisplays();
        }
        
        if (failed > 0) {
            showSimpleMessage(`❌ ${failed} Upload(s) fehlgeschlagen`, 'error');
        }
    }
    
    // Einfacher Kategorie Dialog
    function showSimpleCategoryDialog(files) {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.5); z-index: 99999; display: flex;
            align-items: center; justify-content: center; padding: 2rem;
        `;
        
        const dialog = document.createElement('div');
        dialog.style.cssText = `
            background: white; border-radius: 12px; padding: 2rem; max-width: 500px;
            width: 100%; box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        `;
        
        dialog.innerHTML = `
            <h3 style="margin: 0 0 1rem; text-align: center;">📁 Dokument-Typ wählen</h3>
            <p style="margin: 0 0 1.5rem; color: #666; text-align: center; font-size: 0.9rem;">
                ${files.length} Datei(en): ${Array.from(files).map(f => f.name).join(', ')}
            </p>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem;">
                <button onclick="selectCategory('cv')" style="padding: 1rem; border: 2px solid #3b82f6; border-radius: 8px; background: white; cursor: pointer;">
                    📄 Lebenslauf
                </button>
                <button onclick="selectCategory('coverLetters')" style="padding: 1rem; border: 2px solid #8b5cf6; border-radius: 8px; background: white; cursor: pointer;">
                    ✉️ Anschreiben
                </button>
                <button onclick="selectCategory('certificates')" style="padding: 1rem; border: 2px solid #10b981; border-radius: 8px; background: white; cursor: pointer;">
                    📜 Zeugnis
                </button>
                <button onclick="selectCategory('general')" style="padding: 1rem; border: 2px solid #6b7280; border-radius: 8px; background: white; cursor: pointer;">
                    📁 Sonstiges
                </button>
            </div>
            
            <div style="text-align: center;">
                <button onclick="closeDialog()" style="background: #6b7280; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 6px; cursor: pointer;">
                    Abbrechen
                </button>
            </div>
        `;
        
        modal.appendChild(dialog);
        document.body.appendChild(modal);
        
        // Global functions für Dialog
        window.selectCategory = function(category) {
            modal.remove();
            simpleUpload(files, category);
            delete window.selectCategory;
            delete window.closeDialog;
        };
        
        window.closeDialog = function() {
            modal.remove();
            delete window.selectCategory;
            delete window.closeDialog;
        };
    }
    
    // Einfache Nachrichten
    function showSimpleMessage(message, type = 'info') {
        const colors = { success: '#10b981', error: '#ef4444', info: '#3b82f6' };
        
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed; top: 20px; left: 50%; transform: translateX(-50%); z-index: 99999;
            background: ${colors[type]}; color: white; padding: 1rem 2rem; border-radius: 6px;
            font-weight: 600; box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }
    
    // Einfache Display Updates
    function updateSimpleDisplays() {
        const docs = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        
        // Update counters
        const counters = document.querySelectorAll('.uploaded-count');
        counters.forEach(counter => {
            const parent = counter.closest('[data-type]');
            if (parent) {
                const type = parent.getAttribute('data-type');
                const categoryMap = {
                    'cv': 'cv',
                    'coverLetters': 'coverLetters',
                    'certificates': 'certificates'
                };
                const category = categoryMap[type];
                if (category) {
                    const count = docs.filter(d => d.category === category).length;
                    counter.textContent = `${count} Dateien`;
                }
            }
        });
        
        // Update file lists
        const lists = document.querySelectorAll('.uploaded-files');
        lists.forEach(list => {
            const parent = list.closest('[data-type]');
            if (parent) {
                const type = parent.getAttribute('data-type');
                const categoryMap = {
                    'cv': 'cv',
                    'coverLetters': 'coverLetters',
                    'certificates': 'certificates'
                };
                const category = categoryMap[type];
                if (category) {
                    const categoryDocs = docs.filter(d => d.category === category);
                    list.innerHTML = categoryDocs.length > 0 ?
                        categoryDocs.map(doc => `
                            <div style="font-size: 0.75rem; color: #10b981; margin: 0.25rem 0;">
                                ✅ ${doc.name}
                            </div>
                        `).join('') :
                        '<div style="color: #6b7280; font-size: 0.75rem;">Noch keine Dateien</div>';
                }
            }
        });
        
        // Update media management
        const docList = document.querySelector('.document-list');
        if (docList) {
            if (docs.length === 0) {
                docList.innerHTML = '<p style="text-align: center; color: #6b7280; padding: 2rem;">Keine Dokumente vorhanden</p>';
            } else {
                docList.innerHTML = docs.map(doc => `
                    <div style="display: flex; align-items: center; justify-content: space-between; padding: 1rem; background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 6px; margin-bottom: 0.5rem;">
                        <div>
                            <div style="font-weight: 500; color: #374151;">${doc.name}</div>
                            <div style="font-size: 0.75rem; color: #6b7280;">${formatFileSize(doc.size)} • ${formatDate(doc.uploadDate)}</div>
                        </div>
                        <button onclick="deleteDoc('${doc.id}')" style="background: #ef4444; color: white; border: none; border-radius: 4px; padding: 0.5rem; cursor: pointer;">🗑️</button>
                    </div>
                `).join('');
            }
        }
        
        console.log('🔄 Simple displays updated');
    }
    
    // Setup einfache Upload Handler
    function setupSimpleHandlers() {
        console.log('🔧 Setting up simple upload handlers...');
        
        // Medienverwaltung Upload Button
        const uploadButtons = document.querySelectorAll('button');
        uploadButtons.forEach(btn => {
            const text = btn.textContent.toLowerCase();
            if (text.includes('hochladen') || text.includes('upload') || text.includes('dateien auswählen')) {
                btn.onclick = function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    console.log('📤 Upload button clicked');
                    
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.multiple = true;
                    input.accept = '.pdf,.doc,.docx,.odt,.rtf,.jpg,.jpeg,.png';
                    input.onchange = (e) => {
                        if (e.target.files.length > 0) {
                            simpleUpload(Array.from(e.target.files));
                        }
                    };
                    input.click();
                };
                console.log(`✅ Hijacked upload button: ${text}`);
            }
        });
        
        // Workflow File Inputs
        const workflowInputs = [
            { id: 'cvUpload', category: 'cv' },
            { id: 'coverLetterUpload', category: 'coverLetters' },
            { id: 'certificateUpload', category: 'certificates' }
        ];
        
        workflowInputs.forEach(({ id, category }) => {
            const input = document.getElementById(id);
            if (input) {
                input.onchange = function(e) {
                    if (e.target.files && e.target.files.length > 0) {
                        console.log(`📤 Workflow upload: ${id} -> ${category}`);
                        simpleUpload(Array.from(e.target.files), category);
                    }
                };
                console.log(`✅ Setup workflow input: ${id}`);
            }
        });
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
    
    // Override alle anderen Upload-Systeme
    window.simpleUpload = simpleUpload;
    window.uploadDocument = (category, file) => simpleUpload([file], category);
    window.fixedHandleDocumentUpload = (inputId, category) => {
        const input = document.getElementById(inputId);
        if (input && input.files && input.files.length > 0) {
            simpleUpload(Array.from(input.files), category);
        }
    };
    window.handleDocumentUpload = (inputId, category) => {
        const input = document.getElementById(inputId);
        if (input && input.files && input.files.length > 0) {
            simpleUpload(Array.from(input.files), category);
        }
    };
    window.universalUpload = (files, category) => simpleUpload(files, category);
    window.masterUpload = (files, category) => simpleUpload(files, category);
    
    // Delete Function
    window.deleteDoc = function(docId) {
        const docs = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        const filtered = docs.filter(d => d.id !== docId);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
        updateSimpleDisplays();
        showSimpleMessage('Dokument gelöscht', 'success');
    };
    
    // Initialisierung
    function initialize() {
        console.log('📤 Simple Working Upload - Initializing...');
        
        // Clean up UI first
        cleanupUI();
        
        // Setup handlers
        setupSimpleHandlers();
        
        // Initial display update
        setTimeout(() => {
            updateSimpleDisplays();
        }, 500);
        
        // Monitor for new inputs
        setInterval(() => {
            setupSimpleHandlers();
        }, 5000);
        
        console.log('✅ Simple Working Upload - Ready!');
    }
    
    // Start
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }
    
    // Delayed start
    setTimeout(initialize, 1000);
    
    console.log('✅ Simple Working Upload - Loaded');
    
})();
