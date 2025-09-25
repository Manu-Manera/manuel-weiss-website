/**
 * ULTIMATE UPLOAD SOLUTION
 * Ein EINZIGES System für ALLES - Medienverwaltung UND Workflow
 * Keine Konflikte mehr!
 */

(function() {
    'use strict';
    
    console.log('🚀 ULTIMATE UPLOAD SOLUTION - Starting...');
    
    // EINZIGER Storage Key
    const STORAGE_KEY = 'applicationDocuments';
    
    // Cache-Busting
    const CACHE_VERSION = Date.now();
    console.log(`🔄 Cache Version: ${CACHE_VERSION}`);
    
    // Upload mit manueller Kategorie-Auswahl
    function universalUpload(files, presetCategory = null) {
        console.log(`📤 Upload: ${files.length} files, preset: ${presetCategory}`);
        
        if (!files || files.length === 0) {
            showMessage('Keine Dateien ausgewählt', 'error');
            return;
        }
        
        // Wenn keine Kategorie vorgegeben, zeige Auswahl-Dialog
        if (!presetCategory) {
            showCategorySelectionDialog(files);
            return;
        }
        
        showMessage(`${files.length} Datei(en) werden hochgeladen...`, 'info');
        
        let completed = 0;
        let successCount = 0;
        
        Array.from(files).forEach((file, index) => {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                try {
                    const doc = {
                        id: 'doc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                        name: file.name,
                        category: presetCategory,
                        size: file.size,
                        type: file.type,
                        content: e.target.result,
                        uploadDate: new Date().toISOString(),
                        includeInAnalysis: true
                    };
                    
                    // Speichern
                    const docs = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
                    docs.push(doc);
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
                    
                    successCount++;
                    console.log(`✅ Uploaded: ${doc.name} (${doc.category})`);
                    
                } catch (error) {
                    console.error(`❌ Error uploading ${file.name}:`, error);
                }
                
                completed++;
                
                if (completed === files.length) {
                    if (successCount > 0) {
                        showMessage(`${successCount} Datei(en) hochgeladen`, 'success');
                        updateAllDisplays();
                    }
                    if (successCount < files.length) {
                        showMessage(`${files.length - successCount} Upload(s) fehlgeschlagen`, 'error');
                    }
                }
            };
            
            reader.onerror = () => {
                completed++;
                console.error(`❌ Read error: ${file.name}`);
                if (completed === files.length) {
                    showMessage(`Upload-Fehler bei ${file.name}`, 'error');
                    updateAllDisplays();
                }
            };
            
            reader.readAsDataURL(file);
        });
    }
    
    // Kategorie-Auswahl Dialog
    function showCategorySelectionDialog(files) {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.5); z-index: 10000; display: flex;
            align-items: center; justify-content: center; padding: 2rem;
        `;
        
        const dialog = document.createElement('div');
        dialog.style.cssText = `
            background: white; border-radius: 12px; padding: 2rem; max-width: 500px;
            width: 100%; box-shadow: 0 20px 50px rgba(0,0,0,0.3);
        `;
        
        const categories = [
            { id: 'cv', name: 'Lebenslauf', icon: 'fa-user', color: '#3b82f6' },
            { id: 'certificates', name: 'Zeugnis', icon: 'fa-certificate', color: '#10b981' },
            { id: 'certifications', name: 'Zertifikat', icon: 'fa-award', color: '#f59e0b' },
            { id: 'coverLetters', name: 'Anschreiben', icon: 'fa-envelope', color: '#8b5cf6' },
            { id: 'portrait', name: 'Portrait', icon: 'fa-image', color: '#ec4899' },
            { id: 'fullApplications', name: 'Vollständige Bewerbung', icon: 'fa-folder', color: '#6b7280' }
        ];
        
        dialog.innerHTML = `
            <h3 style="margin: 0 0 1rem; color: #374151; font-size: 1.25rem;">
                📁 Dokument-Typ auswählen
            </h3>
            <p style="margin: 0 0 1.5rem; color: #6b7280; font-size: 0.875rem;">
                ${files.length} Datei(en): ${Array.from(files).map(f => f.name).join(', ')}
            </p>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem;">
                ${categories.map(cat => `
                    <button class="category-btn" data-category="${cat.id}" style="
                        background: white; border: 2px solid ${cat.color}; border-radius: 8px;
                        padding: 1rem; cursor: pointer; transition: all 0.2s; text-align: left;
                        display: flex; align-items: center; gap: 0.75rem;
                    " onmouseover="this.style.background='${cat.color}'; this.style.color='white';" 
                       onmouseout="this.style.background='white'; this.style.color='#374151';">
                        <i class="fas ${cat.icon}" style="font-size: 1.25rem; color: ${cat.color};"></i>
                        <span style="font-weight: 500;">${cat.name}</span>
                    </button>
                `).join('')}
            </div>
            
            <div style="display: flex; justify-content: flex-end; gap: 1rem;">
                <button id="cancelUpload" style="
                    background: #6b7280; color: white; border: none; border-radius: 6px;
                    padding: 0.75rem 1.5rem; cursor: pointer; font-weight: 500;
                ">Abbrechen</button>
            </div>
        `;
        
        modal.appendChild(dialog);
        document.body.appendChild(modal);
        
        // Event-Handler
        dialog.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const category = this.getAttribute('data-category');
                modal.remove();
                universalUpload(files, category);
            });
        });
        
        dialog.querySelector('#cancelUpload').addEventListener('click', function() {
            modal.remove();
        });
        
        // ESC-Key Handler
        document.addEventListener('keydown', function escHandler(e) {
            if (e.key === 'Escape') {
                modal.remove();
                document.removeEventListener('keydown', escHandler);
            }
        });
    }
    
    // Kategorie erkennen
    function detectCategory(filename) {
        const name = filename.toLowerCase();
        if (name.includes('lebenslauf') || name.includes('cv')) return 'cv';
        if (name.includes('zeugnis') || name.includes('certificate')) return 'certificates';
        if (name.includes('zertifikat') || name.includes('certification')) return 'certifications';
        if (name.includes('anschreiben') || name.includes('cover') || name.includes('letter')) return 'coverLetters';
        if (name.includes('portrait') || name.includes('foto') || name.includes('photo')) return 'portrait';
        if (name.includes('bewerbung') || name.includes('application')) return 'fullApplications';
        return 'general';
    }
    
    // ALLE Displays aktualisieren
    function updateAllDisplays() {
        console.log('🔄 Updating ALL displays...');
        
        const docs = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        
        // 1. Medienverwaltung Dokument-Liste
        updateMediaDocuments(docs);
        
        // 2. Workflow Schritt 3 Counter
        updateWorkflowCounters(docs);
        
        // 3. Tab Counter
        updateTabCounters(docs);
        
        console.log(`✅ Updated displays for ${docs.length} documents`);
    }
    
    // 1. Medienverwaltung Dokumente
    function updateMediaDocuments(docs) {
        const container = document.getElementById('documentsList');
        if (!container) return;
        
        if (docs.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 3rem; color: #6b7280;">
                    <i class="fas fa-folder-open" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                    <p style="margin: 0; font-size: 1.1rem; font-weight: 500;">Keine Dokumente vorhanden</p>
                    <p style="margin: 0.5rem 0 0; font-size: 0.9rem;">Laden Sie Ihre ersten Bewerbungsunterlagen hoch</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = docs.map(doc => `
            <div style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 1.5rem; margin-bottom: 1rem; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <div style="background: #6366f1; color: white; width: 50px; height: 50px; border-radius: 10px; display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-file"></i>
                    </div>
                    <div style="flex: 1;">
                        <h4 style="margin: 0 0 0.5rem; color: #374151; font-weight: 600;">${doc.name}</h4>
                        <div style="font-size: 0.875rem; color: #6b7280;">
                            ${getCategoryName(doc.category)} • ${formatFileSize(doc.size)} • ${formatDate(doc.uploadDate)}
                        </div>
                    </div>
                    <div style="display: flex; gap: 0.5rem;">
                        <button onclick="toggleAnalysis('${doc.id}')" style="background: ${doc.includeInAnalysis ? '#10b981' : '#6b7280'}; color: white; border: none; border-radius: 6px; padding: 0.5rem 1rem; cursor: pointer;">
                            <i class="fas ${doc.includeInAnalysis ? 'fa-check' : 'fa-plus'}"></i>
                        </button>
                        <button onclick="deleteDoc('${doc.id}')" style="background: #ef4444; color: white; border: none; border-radius: 6px; padding: 0.5rem 1rem; cursor: pointer;">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    // 2. Workflow Counter
    function updateWorkflowCounters(docs) {
        const categories = {
            'cv': docs.filter(d => d.category === 'cv').length,
            'coverLetters': docs.filter(d => d.category === 'coverLetters').length,
            'certificates': docs.filter(d => d.category === 'certificates' || d.category === 'certifications').length
        };
        
        // Update Counter
        Object.keys(categories).forEach(cat => {
            const count = categories[cat];
            
            // Verschiedene Counter-Selektoren
            const selectors = [
                `[data-type="${cat}"] .uploaded-count`,
                `#uploaded${cat.charAt(0).toUpperCase() + cat.slice(1)}s .count`,
                `.upload-box[data-type="${cat}"] .uploaded-count`
            ];
            
            selectors.forEach(selector => {
                const element = document.querySelector(selector);
                if (element) {
                    element.textContent = `${count} Dateien`;
                }
            });
        });
        
        // Update Listen
        updateWorkflowLists(docs);
    }
    
    // Workflow Listen
    function updateWorkflowLists(docs) {
        const lists = {
            'uploadedCVs': docs.filter(d => d.category === 'cv'),
            'uploadedCoverLetters': docs.filter(d => d.category === 'coverLetters'),
            'uploadedCertificates': docs.filter(d => d.category === 'certificates' || d.category === 'certifications')
        };
        
        Object.keys(lists).forEach(listId => {
            const container = document.getElementById(listId);
            if (container) {
                const docList = lists[listId];
                if (docList.length === 0) {
                    container.innerHTML = '<p style="color: #6b7280; text-align: center; padding: 1rem; font-size: 0.875rem;">Keine Dateien hochgeladen</p>';
                } else {
                    container.innerHTML = docList.map(doc => `
                        <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.75rem; background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 6px; margin-bottom: 0.5rem;">
                            <div style="flex: 1; min-width: 0;">
                                <div style="font-weight: 500; color: #374151; font-size: 0.875rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${doc.name}</div>
                                <div style="font-size: 0.75rem; color: #6b7280;">${formatFileSize(doc.size)} • ${formatDate(doc.uploadDate)}</div>
                            </div>
                            <button onclick="deleteDoc('${doc.id}')" style="background: #ef4444; color: white; border: none; border-radius: 3px; padding: 0.25rem 0.5rem; font-size: 0.75rem; cursor: pointer;"><i class="fas fa-trash"></i></button>
                        </div>
                    `).join('');
                }
            }
        });
    }
    
    // 3. Tab Counter
    function updateTabCounters(docs) {
        const tabs = {
            'all': docs.length,
            'cv': docs.filter(d => d.category === 'cv').length,
            'portrait': docs.filter(d => d.category === 'portrait').length,
            'certificate': docs.filter(d => d.category === 'certificates').length,
            'certification': docs.filter(d => d.category === 'certifications').length,
            'cover-letter': docs.filter(d => d.category === 'coverLetters').length,
            'complete': docs.filter(d => d.category === 'fullApplications').length
        };
        
        Object.keys(tabs).forEach(tabType => {
            const tab = document.querySelector(`[data-type="${tabType}"]`);
            if (tab) {
                const originalText = tab.textContent.replace(/\s*\(\d+\)/, '');
                tab.textContent = `${originalText} (${tabs[tabType]})`;
            }
        });
    }
    
    // Tab-Navigation reparieren
    function fixTabNavigation() {
        const tabs = document.querySelectorAll('.doc-tab[data-type]');
        tabs.forEach(tab => {
            tab.onclick = function(e) {
                e.preventDefault();
                
                // Alle Tabs deaktivieren
                tabs.forEach(t => {
                    t.classList.remove('active');
                    t.style.borderBottomColor = 'transparent';
                });
                
                // Aktuellen Tab aktivieren
                this.classList.add('active');
                this.style.borderBottomColor = '#6366f1';
                
                // Dokumente filtern
                const type = this.getAttribute('data-type');
                filterDocuments(type);
            };
        });
    }
    
    // Dokumente filtern
    function filterDocuments(type) {
        const docs = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        let filtered;
        
        if (type === 'all') {
            filtered = docs;
        } else {
            const categoryMap = {
                'cv': 'cv',
                'portrait': 'portrait',
                'certificate': 'certificates',
                'certification': 'certifications',
                'cover-letter': 'coverLetters',
                'complete': 'fullApplications'
            };
            const category = categoryMap[type] || type;
            filtered = docs.filter(d => d.category === category);
        }
        
        updateMediaDocuments(filtered);
    }
    
    // Upload-Handler befestigen
    function attachAllUploadHandlers() {
        console.log('📎 Attaching ALL upload handlers...');
        
        // 1. Medienverwaltung Upload
        const mediaUploadBtn = document.querySelector('[data-action="upload-document"]');
        const mediaInput = document.getElementById('doc-upload');
        
        if (mediaUploadBtn && mediaInput) {
            mediaUploadBtn.onclick = () => mediaInput.click();
            mediaInput.onchange = (e) => {
                if (e.target.files.length > 0) {
                    universalUpload(e.target.files);
                    e.target.value = '';
                }
            };
            console.log('✅ Media upload handler attached');
        }
        
        // 2. Workflow Upload-Buttons
        const workflowUploads = [
            { inputId: 'cvUpload', category: 'cv' },
            { inputId: 'coverLetterUpload', category: 'coverLetters' },
            { inputId: 'certificateUpload', category: 'certificates' }
        ];
        
        workflowUploads.forEach(({ inputId, category }) => {
            const input = document.getElementById(inputId);
            if (input) {
                input.onchange = (e) => {
                    if (e.target.files.length > 0) {
                        universalUpload(e.target.files, category);
                        e.target.value = '';
                    }
                };
                console.log(`✅ Workflow upload handler attached: ${inputId}`);
            }
        });
        
        // 3. Upload-Buttons (falls vorhanden)
        const uploadButtons = document.querySelectorAll('button');
        uploadButtons.forEach(btn => {
            if (btn.textContent.includes('Hochladen')) {
                const uploadBox = btn.closest('[data-type]');
                if (uploadBox) {
                    const type = uploadBox.getAttribute('data-type');
                    const input = uploadBox.querySelector('input[type="file"]');
                    if (input) {
                        btn.onclick = () => input.click();
                    }
                }
            }
        });
    }
    
    // Dokument-Funktionen
    function toggleAnalysis(docId) {
        const docs = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        const doc = docs.find(d => d.id === docId);
        if (doc) {
            doc.includeInAnalysis = !doc.includeInAnalysis;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
            updateAllDisplays();
            showMessage(`Dokument ${doc.includeInAnalysis ? 'zur Analyse hinzugefügt' : 'aus Analyse entfernt'}`, 'info');
        }
    }
    
    function deleteDoc(docId) {
        if (confirm('Dokument wirklich löschen?')) {
            const docs = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
            const filtered = docs.filter(d => d.id !== docId);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
            updateAllDisplays();
            showMessage('Dokument gelöscht', 'success');
        }
    }
    
    // Hilfsfunktionen
    function getCategoryName(category) {
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
    
    function showMessage(message, type = 'info') {
        const colors = { success: '#10b981', error: '#ef4444', info: '#3b82f6', warning: '#f59e0b' };
        const icons = { success: 'fa-check', error: 'fa-exclamation-triangle', info: 'fa-info-circle', warning: 'fa-exclamation' };
        
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed; top: 20px; right: 20px; z-index: 10000;
            background: ${colors[type]}; color: white; 
            padding: 0.75rem 1rem; border-radius: 6px; font-weight: 500;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2); max-width: 300px;
            font-size: 0.875rem; animation: slideIn 0.3s ease-out;
        `;
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <i class="fas ${icons[type]}" style="font-size: 0.875rem;"></i>
                <span>${message}</span>
            </div>
        `;
        document.body.appendChild(notification);
        
        if (!document.getElementById('notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = '@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }';
            document.head.appendChild(style);
        }
        
        setTimeout(() => notification.remove(), 3000);
    }
    
    // Cache-Busting
    function clearBrowserCache() {
        console.log('🧹 Clearing browser cache...');
        
        // ServiceWorker cache löschen
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then(registrations => {
                registrations.forEach(registration => registration.unregister());
            });
        }
        
        // Browser cache headers setzen
        const meta = document.createElement('meta');
        meta.setAttribute('http-equiv', 'Cache-Control');
        meta.setAttribute('content', 'no-cache, no-store, must-revalidate');
        document.head.appendChild(meta);
        
        showMessage('Cache geleert - Seite wird neu geladen...', 'info');
        
        setTimeout(() => {
            window.location.reload(true);
        }, 2000);
    }
    
    // Globale Funktionen
    window.universalUpload = universalUpload;
    window.toggleAnalysis = toggleAnalysis;
    window.deleteDoc = deleteDoc;
    window.updateAllDisplays = updateAllDisplays;
    window.clearBrowserCache = clearBrowserCache;
    
    // Überschreibe ALLE anderen Upload-Funktionen AGGRESSIV
    window.uploadDocument = (category, file) => {
        console.log('🔥 OVERRIDE: uploadDocument called');
        universalUpload([file], category);
    };
    
    window.fixedHandleDocumentUpload = (inputId, category) => {
        console.log(`🔥 OVERRIDE: fixedHandleDocumentUpload called: ${inputId} -> ${category}`);
        const input = document.getElementById(inputId);
        if (input && input.files && input.files.length > 0) {
            universalUpload(Array.from(input.files), category);
        } else {
            console.log(`❌ No files found in input: ${inputId}`);
        }
    };
    
    window.handleDocumentUpload = (inputId, category) => {
        console.log(`🔥 OVERRIDE: handleDocumentUpload called: ${inputId} -> ${category}`);
        const input = document.getElementById(inputId);
        if (input && input.files && input.files.length > 0) {
            universalUpload(Array.from(input.files), category);
        } else {
            console.log(`❌ No files found in input: ${inputId}`);
        }
    };
    
    // Override SmartWorkflowSystem method if it exists
    if (window.smartWorkflow && window.smartWorkflow.handleDocumentUpload) {
        window.smartWorkflow.handleDocumentUpload = (inputId, category) => {
            console.log(`🔥 OVERRIDE: SmartWorkflow.handleDocumentUpload: ${inputId} -> ${category}`);
            window.fixedHandleDocumentUpload(inputId, category);
        };
    }
    
    // Override any other upload functions
    window.handleWorkflowDocumentUpload = (event) => {
        console.log('🔥 OVERRIDE: handleWorkflowDocumentUpload');
        if (event.target.files && event.target.files.length > 0) {
            universalUpload(Array.from(event.target.files));
        }
    };
    
    window.triggerWorkflowDocumentUpload = () => {
        console.log('🔥 OVERRIDE: triggerWorkflowDocumentUpload');
        const input = document.getElementById('workflow-doc-upload') || document.getElementById('cvUpload');
        if (input) input.click();
    };
    
    // Initialisierung
    function initialize() {
        console.log('📤 Upload-System wird initialisiert...');
        
        attachAllUploadHandlers();
        fixTabNavigation();
        updateAllDisplays();
        
        console.log('✅ Upload-System bereit');
    }
    
    // Starten
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }
    
    // Regelmäßige Reparatur
    setInterval(() => {
        attachAllUploadHandlers();
        fixTabNavigation();
    }, 3000);
    
    console.log('✅ Upload-System geladen');
    
})();
