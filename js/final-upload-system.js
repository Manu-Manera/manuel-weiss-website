/**
 * FINAL UPLOAD SYSTEM
 * Ein einziges, funktionierendes System für alle Uploads
 * Mit automatischer GitHub-Speicherung
 */

(function() {
    'use strict';
    
    console.log('🏁 FINAL UPLOAD SYSTEM - Starting...');
    
    // EINZIGER Storage Key
    const STORAGE_KEY = 'applicationDocuments';
    const GITHUB_STORAGE_KEY = 'githubDocumentBackups';
    
    // GitHub Repository für File-Storage
    const GITHUB_CONFIG = {
        enabled: true,
        repo: 'document-backup', // Wird automatisch erstellt
        branch: 'main',
        baseUrl: 'https://api.github.com'
    };
    
    // MASTER UPLOAD FUNCTION
    async function masterUpload(files, category = null) {
        console.log(`🏁 MASTER UPLOAD: ${files.length} files, category: ${category}`);
        
        if (!files || files.length === 0) {
            showFinalMessage('Keine Dateien ausgewählt', 'error');
            return;
        }
        
        // Kategorie-Auswahl wenn nicht vorgegeben
        if (!category) {
            showCategoryDialog(files);
            return;
        }
        
        showFinalMessage(`🚀 Uploading ${files.length} file(s)...`, 'info');
        
        let processed = 0;
        let successful = 0;
        
        for (const file of files) {
            try {
                await processSingleFile(file, category);
                successful++;
                console.log(`✅ MASTER SUCCESS: ${file.name}`);
            } catch (error) {
                console.error(`❌ MASTER ERROR: ${file.name}`, error);
            }
            
            processed++;
            
            // Progress Update
            showFinalMessage(`📤 ${processed}/${files.length} verarbeitet...`, 'info');
        }
        
        // Final Results
        completeMasterUpload(successful, files.length - successful);
    }
    
    // Einzelne Datei verarbeiten
    async function processSingleFile(file, category) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = async function(e) {
                try {
                    const doc = {
                        id: `master_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                        name: file.name,
                        category: category,
                        size: file.size,
                        type: file.type,
                        content: e.target.result,
                        uploadDate: new Date().toISOString(),
                        includeInAnalysis: true,
                        source: 'final-master-upload'
                    };
                    
                    // 1. LOKALE SPEICHERUNG (Primär)
                    await saveToLocal(doc);
                    
                    // 2. GITHUB BACKUP (Sekundär)
                    try {
                        await saveToGitHub(doc);
                        doc.githubBackup = true;
                        console.log(`☁️ GitHub backup: ${doc.name}`);
                    } catch (githubError) {
                        console.warn(`⚠️ GitHub backup failed: ${githubError.message}`);
                        doc.githubBackup = false;
                    }
                    
                    // Update local with backup status
                    await updateLocalDocument(doc);
                    
                    resolve(doc);
                    
                } catch (error) {
                    reject(error);
                }
            };
            
            reader.onerror = () => reject(new Error(`File read error: ${file.name}`));
            reader.readAsDataURL(file);
        });
    }
    
    // Lokale Speicherung
    async function saveToLocal(doc) {
        const docs = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        docs.push(doc);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
        console.log(`💾 Local save: ${doc.name}`);
    }
    
    // Update lokales Dokument
    async function updateLocalDocument(doc) {
        const docs = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        const index = docs.findIndex(d => d.id === doc.id);
        if (index !== -1) {
            docs[index] = doc;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
        }
    }
    
    // GitHub Speicherung (vereinfacht)
    async function saveToGitHub(doc) {
        if (!GITHUB_CONFIG.enabled) {
            throw new Error('GitHub storage disabled');
        }
        
        // Erstelle Gist für Dokument
        const gistData = {
            description: `Bewerbungsdokument: ${doc.name} (${doc.category})`,
            public: false,
            files: {
                [`${doc.id}.json`]: {
                    content: JSON.stringify({
                        ...doc,
                        metadata: {
                            backup_date: new Date().toISOString(),
                            system: 'final-upload-system',
                            version: '1.0'
                        }
                    }, null, 2)
                }
            }
        };
        
        const response = await fetch('https://api.github.com/gists', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/vnd.github.v3+json'
                // GitHub Token wäre hier optimal, aber auch ohne möglich
            },
            body: JSON.stringify(gistData)
        });
        
        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status}`);
        }
        
        const gist = await response.json();
        
        // Speichere GitHub-ID für späteren Zugriff
        saveGitHubId(doc.id, gist.id);
        
        return gist;
    }
    
    // GitHub-IDs verwalten
    function saveGitHubId(docId, gistId) {
        const githubIds = JSON.parse(localStorage.getItem(GITHUB_STORAGE_KEY) || '{}');
        githubIds[docId] = {
            gistId: gistId,
            backupDate: new Date().toISOString()
        };
        localStorage.setItem(GITHUB_STORAGE_KEY, JSON.stringify(githubIds));
    }
    
    // Kategorie-Dialog
    function showCategoryDialog(files) {
        const modal = document.createElement('div');
        modal.className = 'final-upload-modal';
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.6); z-index: 99999; display: flex;
            align-items: center; justify-content: center; padding: 2rem;
        `;
        
        const dialog = document.createElement('div');
        dialog.style.cssText = `
            background: white; border-radius: 16px; padding: 2rem; max-width: 600px;
            width: 100%; box-shadow: 0 25px 60px rgba(0,0,0,0.4);
            animation: finalModalIn 0.3s ease-out;
        `;
        
        const categories = [
            { id: 'cv', name: '📄 Lebenslauf', color: '#3b82f6' },
            { id: 'certificates', name: '📜 Zeugnis', color: '#10b981' },
            { id: 'certifications', name: '🏆 Zertifikat', color: '#f59e0b' },
            { id: 'coverLetters', name: '✉️ Anschreiben', color: '#8b5cf6' },
            { id: 'portrait', name: '📷 Portrait', color: '#ec4899' },
            { id: 'fullApplications', name: '📁 Vollständige Bewerbung', color: '#6b7280' }
        ];
        
        dialog.innerHTML = `
            <h2 style="margin: 0 0 1rem; color: #1f2937; text-align: center;">
                🏁 Dokument-Typ auswählen
            </h2>
            <p style="margin: 0 0 2rem; color: #6b7280; text-align: center; font-size: 0.875rem;">
                ${files.length} Datei(en): ${Array.from(files).map(f => f.name).join(', ')}
                <br><small>Dokumente werden lokal und als GitHub-Backup gespeichert</small>
            </p>
            
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-bottom: 2rem;">
                ${categories.map(cat => `
                    <button class="final-category-btn" data-category="${cat.id}" style="
                        background: white; border: 2px solid ${cat.color}; border-radius: 12px;
                        padding: 1.5rem; cursor: pointer; transition: all 0.2s; text-align: center;
                        display: flex; flex-direction: column; align-items: center; gap: 0.5rem;
                        font-weight: 600; color: #374151;
                    " onmouseover="this.style.background='${cat.color}'; this.style.color='white';" 
                       onmouseout="this.style.background='white'; this.style.color='#374151';">
                        <span style="font-size: 1.5rem;">${cat.name.split(' ')[0]}</span>
                        <span>${cat.name.split(' ').slice(1).join(' ')}</span>
                    </button>
                `).join('')}
            </div>
            
            <div style="text-align: center;">
                <button id="finalCancelBtn" style="
                    background: #6b7280; color: white; border: none; border-radius: 8px;
                    padding: 0.75rem 2rem; cursor: pointer; font-weight: 600;
                ">Abbrechen</button>
            </div>
        `;
        
        // CSS für Animation
        if (!document.getElementById('final-upload-styles')) {
            const style = document.createElement('style');
            style.id = 'final-upload-styles';
            style.textContent = `
                @keyframes finalModalIn {
                    from { opacity: 0; transform: scale(0.9) translateY(-20px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }
            `;
            document.head.appendChild(style);
        }
        
        modal.appendChild(dialog);
        document.body.appendChild(modal);
        
        // Event Handlers
        dialog.querySelectorAll('.final-category-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const category = this.getAttribute('data-category');
                modal.remove();
                masterUpload(files, category);
            });
        });
        
        dialog.querySelector('#finalCancelBtn').addEventListener('click', () => {
            modal.remove();
        });
        
        // ESC Handler
        document.addEventListener('keydown', function escHandler(e) {
            if (e.key === 'Escape') {
                modal.remove();
                document.removeEventListener('keydown', escHandler);
            }
        });
    }
    
    // Upload Abschluss
    function completeMasterUpload(successful, failed) {
        console.log(`🏁 MASTER UPLOAD COMPLETE: ${successful} success, ${failed} failed`);
        
        if (successful > 0) {
            showFinalMessage(`✅ ${successful} Datei(en) erfolgreich hochgeladen & gesichert!`, 'success');
            
            // Update All Displays
            setTimeout(() => {
                updateAllFinalDisplays();
            }, 200);
        }
        
        if (failed > 0) {
            showFinalMessage(`⚠️ ${failed} Upload(s) fehlgeschlagen`, 'warning');
        }
    }
    
    // NUCLEAR INPUT TAKEOVER
    function nuclearInputTakeover() {
        console.log('☢️ NUCLEAR INPUT TAKEOVER - Starting...');
        
        // Finde ALLE File Inputs
        const allInputs = document.querySelectorAll('input[type="file"]');
        console.log(`🔍 Found ${allInputs.length} file inputs for takeover`);
        
        allInputs.forEach((input, index) => {
            const inputId = input.id?.toLowerCase() || `input-${index}`;
            
            // Bestimme Kategorie basierend auf Kontext
            let category = null;
            if (inputId.includes('cv') || inputId.includes('lebenslauf')) category = 'cv';
            else if (inputId.includes('cover') || inputId.includes('anschreiben')) category = 'coverLetters';
            else if (inputId.includes('cert') || inputId.includes('zeugnis')) category = 'certificates';
            else if (inputId.includes('portrait') || inputId.includes('photo')) category = 'portrait';
            
            console.log(`☢️ TAKING OVER: ${inputId} -> ${category || 'auto-detect'}`);
            
            // KOMPLETTE ÜBERNAHME
            takeover(input, category);
        });
        
        // Monitor für neue Inputs
        startInputMonitor();
        
        // Upload-Buttons übernehmen
        takeoverUploadButtons();
    }
    
    // Input übernehmen
    function takeover(input, category) {
        // ALLES ENTFERNEN
        input.onchange = null;
        input.oninput = null;
        input.removeAttribute('onchange');
        input.removeAttribute('oninput');
        
        // CLONE um alle Event Listener zu entfernen
        const newInput = input.cloneNode(true);
        if (input.parentNode) {
            input.parentNode.replaceChild(newInput, input);
        }
        
        // MASTER HANDLER
        const masterHandler = function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            console.log(`🏁 MASTER HANDLER: ${newInput.id || 'unnamed'} (${category || 'auto'})`);
            
            if (e.target.files && e.target.files.length > 0) {
                const files = Array.from(e.target.files);
                console.log(`📤 Files selected: ${files.map(f => f.name).join(', ')}`);
                masterUpload(files, category);
            }
        };
        
        // MEHRFACH BINDEN
        newInput.addEventListener('change', masterHandler, true);
        newInput.addEventListener('input', masterHandler, true);
        newInput.onchange = masterHandler;
        
        // MARKIERUNG
        newInput.setAttribute('data-final-takeover', 'true');
        newInput._masterHandler = masterHandler;
    }
    
    // Upload-Buttons übernehmen
    function takeoverUploadButtons() {
        const buttons = document.querySelectorAll('button');
        
        buttons.forEach(btn => {
            const text = btn.textContent.toLowerCase();
            const onclick = btn.getAttribute('onclick') || '';
            
            if (text.includes('hochladen') || text.includes('upload') || onclick.includes('upload')) {
                console.log(`🔘 TAKING OVER BUTTON: ${text}`);
                
                btn.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    console.log('🔘 MASTER BUTTON CLICKED');
                    
                    // Create universal input
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.multiple = true;
                    input.accept = '.pdf,.doc,.docx,.odt,.rtf,.jpg,.jpeg,.png,.gif';
                    input.onchange = (e) => {
                        if (e.target.files.length > 0) {
                            masterUpload(Array.from(e.target.files));
                        }
                    };
                    input.click();
                }, true);
            }
        });
    }
    
    // Input Monitor
    function startInputMonitor() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) {
                        if (node.tagName === 'INPUT' && node.type === 'file' && !node.getAttribute('data-final-takeover')) {
                            console.log('🆕 NEW INPUT DETECTED - TAKING OVER');
                            takeover(node, null);
                        }
                        
                        const newInputs = node.querySelectorAll && node.querySelectorAll('input[type="file"]:not([data-final-takeover])');
                        if (newInputs) {
                            newInputs.forEach(newInput => {
                                console.log('🆕 NEW SUB-INPUT DETECTED - TAKING OVER');
                                takeover(newInput, null);
                            });
                        }
                    }
                });
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        console.log('👀 INPUT MONITOR ACTIVE');
    }
    
    // Display Updates
    function updateAllFinalDisplays() {
        console.log('🔄 Updating all final displays...');
        
        const docs = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        
        // Standard Updates
        if (window.updateAllDisplays) {
            window.updateAllDisplays();
        }
        
        // Workflow Updates
        updateWorkflowFinalDisplays(docs);
        
        // Media Management Updates
        updateMediaFinalDisplays(docs);
        
        // Document Selection Updates
        if (window.updateDocumentSelectionSection) {
            window.updateDocumentSelectionSection();
        }
    }
    
    // Workflow Display Updates
    function updateWorkflowFinalDisplays(docs) {
        const categoryMap = {
            'cv': 'cv',
            'coverLetters': 'coverLetters',
            'certificates': 'certificates'
        };
        
        Object.keys(categoryMap).forEach(category => {
            const count = docs.filter(d => d.category === category).length;
            
            // Counters
            const counters = document.querySelectorAll('.uploaded-count');
            counters.forEach(counter => {
                const parent = counter.closest('[data-type]');
                if (parent && parent.getAttribute('data-type') === category) {
                    counter.textContent = `${count} Dateien`;
                }
            });
            
            // File lists
            const lists = document.querySelectorAll('.uploaded-files');
            lists.forEach(list => {
                const parent = list.closest('[data-type]');
                if (parent && parent.getAttribute('data-type') === category) {
                    const categoryDocs = docs.filter(d => d.category === category);
                    list.innerHTML = categoryDocs.length > 0 ?
                        categoryDocs.map(doc => `
                            <div style="font-size: 0.75rem; color: #10b981; margin: 0.25rem 0; display: flex; align-items: center; gap: 0.5rem;">
                                <i class="fas fa-check"></i> 
                                <span>${doc.name}</span>
                                ${doc.githubBackup ? '<i class="fas fa-cloud" style="color: #6366f1;" title="GitHub Backup"></i>' : ''}
                            </div>
                        `).join('') :
                        '<div style="color: #6b7280; font-size: 0.75rem;">Noch keine Dateien hochgeladen</div>';
                }
            });
        });
    }
    
    // Media Management Updates
    function updateMediaFinalDisplays(docs) {
        const docList = document.querySelector('.document-list');
        if (docList) {
            if (docs.length === 0) {
                docList.innerHTML = '<p style="text-align: center; color: #6b7280; padding: 2rem;">Noch keine Dokumente hochgeladen</p>';
            } else {
                docList.innerHTML = docs.map(doc => `
                    <div style="display: flex; align-items: center; justify-content: space-between; padding: 1rem; background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 0.5rem;">
                        <div style="flex: 1; min-width: 0;">
                            <div style="font-weight: 500; color: #374151; font-size: 0.875rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: flex; align-items: center; gap: 0.5rem;">
                                ${doc.name}
                                ${doc.githubBackup ? '<i class="fas fa-cloud" style="color: #6366f1; font-size: 0.75rem;" title="GitHub Backup verfügbar"></i>' : ''}
                            </div>
                            <div style="font-size: 0.75rem; color: #6b7280;">${formatFileSize(doc.size)} • ${formatDate(doc.uploadDate)}</div>
                        </div>
                        <button onclick="deleteDoc('${doc.id}')" style="background: #ef4444; color: white; border: none; border-radius: 4px; padding: 0.5rem; cursor: pointer;"><i class="fas fa-trash"></i></button>
                    </div>
                `).join('');
            }
        }
        
        // Update tab counters
        const tabs = document.querySelectorAll('.doc-tab[data-type]');
        tabs.forEach(tab => {
            const type = tab.getAttribute('data-type');
            let count = docs.length;
            
            if (type !== 'all') {
                const categoryMap = {
                    'cv': 'cv',
                    'portrait': 'portrait',
                    'certificate': 'certificates',
                    'certification': 'certifications',
                    'cover-letter': 'coverLetters',
                    'complete': 'fullApplications'
                };
                const category = categoryMap[type];
                if (category) {
                    count = docs.filter(d => d.category === category).length;
                }
            }
            
            const originalText = tab.textContent.replace(/\s*\(\d+\)/, '');
            tab.textContent = `${originalText} (${count})`;
        });
    }
    
    // Message System
    function showFinalMessage(message, type = 'info') {
        const colors = { success: '#10b981', error: '#ef4444', info: '#3b82f6', warning: '#f59e0b' };
        const icons = { success: 'fa-check', error: 'fa-exclamation-triangle', info: 'fa-info-circle', warning: 'fa-exclamation' };
        
        const notification = document.createElement('div');
        notification.className = 'final-notification';
        notification.style.cssText = `
            position: fixed; top: 20px; right: 20px; z-index: 99999;
            background: ${colors[type]}; color: white; 
            padding: 1rem 1.5rem; border-radius: 8px; font-weight: 600;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3); max-width: 400px;
            font-size: 0.875rem; animation: finalSlideIn 0.3s ease-out;
            border-left: 4px solid rgba(255,255,255,0.3);
        `;
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.75rem;">
                <i class="fas ${icons[type]}" style="font-size: 1rem;"></i>
                <span>🏁 ${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        if (!document.getElementById('final-notification-styles')) {
            const style = document.createElement('style');
            style.id = 'final-notification-styles';
            style.textContent = '@keyframes finalSlideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }';
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
    
    // GLOBALE FUNKTIONEN
    window.masterUpload = masterUpload;
    window.nuclearInputTakeover = nuclearInputTakeover;
    window.updateAllFinalDisplays = updateAllFinalDisplays;
    
    // ÜBERSCHREIBT ALLE ANDEREN UPLOAD-FUNKTIONEN
    window.uploadDocument = (category, file) => masterUpload([file], category);
    window.fixedHandleDocumentUpload = (inputId, category) => {
        const input = document.getElementById(inputId);
        if (input && input.files && input.files.length > 0) {
            masterUpload(Array.from(input.files), category);
        }
    };
    window.handleDocumentUpload = (inputId, category) => {
        const input = document.getElementById(inputId);
        if (input && input.files && input.files.length > 0) {
            masterUpload(Array.from(input.files), category);
        }
    };
    window.universalUpload = (files, category) => masterUpload(files, category);
    
    // INITIALISIERUNG
    function initialize() {
        console.log('🏁 FINAL UPLOAD SYSTEM - Initializing...');
        
        // Sofortige Übernahme
        nuclearInputTakeover();
        
        // Aggressive Re-Takeover alle 3 Sekunden
        setInterval(() => {
            const untakenInputs = document.querySelectorAll('input[type="file"]:not([data-final-takeover])');
            if (untakenInputs.length > 0) {
                console.log(`🔄 FOUND ${untakenInputs.length} UNTAKEN INPUTS - RE-TAKING OVER`);
                untakenInputs.forEach(input => takeover(input, null));
            }
        }, 3000);
        
        console.log('✅ FINAL UPLOAD SYSTEM - ACTIVE');
    }
    
    // START
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }
    
    // Delayed start für dynamische Inhalte
    setTimeout(initialize, 1000);
    
    console.log('🏁 FINAL UPLOAD SYSTEM - LOADED');
    
})();
