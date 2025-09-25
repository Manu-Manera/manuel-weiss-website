/**
 * Workflow Upload Emergency Fix
 * Aggressiver Fix für Upload-Probleme im Workflow
 */

(function() {
    'use strict';
    
    console.log('🚨 WORKFLOW UPLOAD EMERGENCY FIX - STARTING');
    
    const STORAGE_KEY = 'applicationDocuments';
    
    // NUCLEAR OPTION: Komplette Upload-Übernahme
    function emergencyUploadFix() {
        console.log('🔥 EMERGENCY: Übernehme komplette Upload-Kontrolle');
        
        // 1. FINDE ALLE FILE INPUTS
        const allInputs = document.querySelectorAll('input[type="file"]');
        console.log(`🔍 Gefundene File Inputs: ${allInputs.length}`);
        
        allInputs.forEach((input, index) => {
            console.log(`📋 Input ${index}: id="${input.id}", accept="${input.accept}"`);
            
            // VOLLSTÄNDIGE ÜBERNAHME
            emergencyTakeoverInput(input);
        });
        
        // 2. ÜBERWACHE NEUE INPUTS
        monitorForNewInputs();
        
        // 3. REPARIERE UPLOAD BUTTONS
        repairUploadButtons();
    }
    
    // Vollständige Input-Übernahme
    function emergencyTakeoverInput(input) {
        const inputId = input.id || `emergency_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
        
        // Bestimme Kategorie
        let category = 'general';
        if (inputId.includes('cv') || inputId.includes('lebenslauf')) category = 'cv';
        else if (inputId.includes('cover') || inputId.includes('anschreiben')) category = 'coverLetters';
        else if (inputId.includes('cert') || inputId.includes('zeugnis')) category = 'certificates';
        else if (inputId.includes('portrait') || inputId.includes('photo')) category = 'portrait';
        
        console.log(`🔧 TAKEOVER: ${inputId} -> ${category}`);
        
        // NUKLEAR: Entferne ALLES
        input.onchange = null;
        input.removeAttribute('onchange');
        
        // KLONE Input um alle Handler zu entfernen
        const newInput = input.cloneNode(true);
        if (input.parentNode) {
            input.parentNode.replaceChild(newInput, input);
        }
        
        // EMERGENCY HANDLER
        const emergencyHandler = function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            console.log(`🚨 EMERGENCY UPLOAD: ${inputId} (${category})`);
            console.log(`📁 Files: ${e.target.files.length}`);
            
            if (e.target.files && e.target.files.length > 0) {
                emergencyProcessFiles(Array.from(e.target.files), category, inputId);
            } else {
                console.log('❌ Keine Dateien gefunden');
            }
        };
        
        // MULTIPLE ATTACHMENT METHODS
        newInput.addEventListener('change', emergencyHandler, true);
        newInput.addEventListener('input', emergencyHandler, true);
        newInput.onchange = emergencyHandler;
        newInput.oninput = emergencyHandler;
        
        // MARKIERUNG
        newInput.setAttribute('data-emergency-fixed', 'true');
        newInput._emergencyHandler = emergencyHandler;
        
        console.log(`✅ EMERGENCY TAKEOVER COMPLETE: ${inputId}`);
    }
    
    // Emergency File Processing
    function emergencyProcessFiles(files, category, inputId) {
        console.log(`🔥 EMERGENCY PROCESSING: ${files.length} files (${category})`);
        
        // Sofortige Feedback
        showEmergencyMessage(`Verarbeite ${files.length} Datei(en)...`, 'info');
        
        let processed = 0;
        let errors = 0;
        
        files.forEach((file, index) => {
            console.log(`📄 Processing: ${file.name} (${file.size} bytes)`);
            
            const reader = new FileReader();
            
            reader.onload = function(e) {
                try {
                    const doc = {
                        id: `emergency_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                        name: file.name,
                        category: category,
                        size: file.size,
                        type: file.type,
                        content: e.target.result,
                        uploadDate: new Date().toISOString(),
                        includeInAnalysis: true,
                        source: 'emergency-fix',
                        inputId: inputId
                    };
                    
                    // DIREKTE SPEICHERUNG
                    const docs = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
                    docs.push(doc);
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
                    
                    processed++;
                    console.log(`✅ EMERGENCY SAVED: ${doc.name} (ID: ${doc.id})`);
                    
                    // Abschluss-Check
                    if (processed + errors === files.length) {
                        finishEmergencyUpload(processed, errors, category);
                    }
                    
                } catch (error) {
                    console.error(`❌ EMERGENCY ERROR: ${file.name}`, error);
                    errors++;
                    
                    if (processed + errors === files.length) {
                        finishEmergencyUpload(processed, errors, category);
                    }
                }
            };
            
            reader.onerror = function() {
                console.error(`❌ READ ERROR: ${file.name}`);
                errors++;
                
                if (processed + errors === files.length) {
                    finishEmergencyUpload(processed, errors, category);
                }
            };
            
            reader.readAsDataURL(file);
        });
    }
    
    // Emergency Upload Abschluss
    function finishEmergencyUpload(processed, errors, category) {
        console.log(`🎯 EMERGENCY UPLOAD COMPLETE: ${processed} success, ${errors} errors`);
        
        if (processed > 0) {
            showEmergencyMessage(`✅ ${processed} Datei(en) hochgeladen!`, 'success');
            
            // UPDATE ALL DISPLAYS
            setTimeout(() => {
                updateAllEmergencyDisplays();
            }, 100);
        }
        
        if (errors > 0) {
            showEmergencyMessage(`⚠️ ${errors} Upload(s) fehlgeschlagen`, 'warning');
        }
    }
    
    // Update all displays
    function updateAllEmergencyDisplays() {
        console.log('🔄 EMERGENCY: Updating all displays...');
        
        // Call various update functions if they exist
        if (window.updateAllDisplays) {
            window.updateAllDisplays();
        }
        
        if (window.updateDocumentSelectionSection) {
            window.updateDocumentSelectionSection();
        }
        
        // Force workflow document display update
        const step3 = document.querySelector('[data-step="3"]');
        if (step3) {
            updateWorkflowStep3Display();
        }
        
        // Update media management
        const mediaSection = document.querySelector('.document-management');
        if (mediaSection) {
            updateMediaManagementDisplay();
        }
    }
    
    // Update Workflow Step 3
    function updateWorkflowStep3Display() {
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
        const fileLists = document.querySelectorAll('.uploaded-files');
        fileLists.forEach(list => {
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
                    list.innerHTML = categoryDocs.map(doc => `
                        <div style="font-size: 0.75rem; color: #10b981; margin: 0.25rem 0;">
                            <i class="fas fa-check"></i> ${doc.name}
                        </div>
                    `).join('') || '<div style="color: #6b7280; font-size: 0.75rem;">Noch keine Dateien hochgeladen</div>';
                }
            }
        });
    }
    
    // Update Media Management
    function updateMediaManagementDisplay() {
        const docs = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        
        // Update main document list
        const docList = document.querySelector('.document-list');
        if (docList) {
            if (docs.length === 0) {
                docList.innerHTML = '<p style="text-align: center; color: #6b7280; padding: 2rem;">Noch keine Dokumente hochgeladen</p>';
            } else {
                docList.innerHTML = docs.map(doc => `
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
    
    // Monitor for new inputs
    function monitorForNewInputs() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) { // Element node
                        // Check if it's a file input
                        if (node.tagName === 'INPUT' && node.type === 'file') {
                            console.log('🆕 NEW FILE INPUT DETECTED:', node.id);
                            emergencyTakeoverInput(node);
                        }
                        
                        // Check for file inputs in added subtree
                        const fileInputs = node.querySelectorAll && node.querySelectorAll('input[type="file"]');
                        if (fileInputs) {
                            fileInputs.forEach(input => {
                                if (!input.getAttribute('data-emergency-fixed')) {
                                    console.log('🆕 NEW FILE INPUT IN SUBTREE:', input.id);
                                    emergencyTakeoverInput(input);
                                }
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
        
        console.log('👀 MONITORING for new file inputs...');
    }
    
    // Repair upload buttons
    function repairUploadButtons() {
        const uploadButtons = document.querySelectorAll('button');
        
        uploadButtons.forEach(btn => {
            const text = btn.textContent.toLowerCase();
            const onclick = btn.getAttribute('onclick') || '';
            
            if (text.includes('hochladen') || text.includes('upload') || onclick.includes('upload') || onclick.includes('click()')) {
                console.log('🔧 REPAIRING UPLOAD BUTTON:', text);
                
                btn.addEventListener('click', function(e) {
                    console.log('🔘 UPLOAD BUTTON CLICKED:', text);
                    
                    // Find associated file input
                    let input = null;
                    
                    // Try to find by onclick attribute
                    const onclickMatch = onclick.match(/getElementById\(['"]([^'"]+)['"]/);
                    if (onclickMatch) {
                        input = document.getElementById(onclickMatch[1]);
                    }
                    
                    // Try to find by proximity
                    if (!input) {
                        const parent = btn.closest('.upload-box') || btn.parentElement;
                        input = parent.querySelector('input[type="file"]');
                    }
                    
                    // Try to find by common IDs
                    if (!input) {
                        const commonIds = ['cvUpload', 'coverLetterUpload', 'certificateUpload', 'doc-upload'];
                        for (const id of commonIds) {
                            input = document.getElementById(id);
                            if (input) break;
                        }
                    }
                    
                    if (input) {
                        console.log('🎯 TRIGGERING INPUT:', input.id);
                        input.click();
                    } else {
                        console.log('❌ NO INPUT FOUND FOR BUTTON');
                    }
                }, true);
            }
        });
    }
    
    // Emergency Message System
    function showEmergencyMessage(message, type = 'info') {
        const colors = { success: '#10b981', error: '#ef4444', info: '#3b82f6', warning: '#f59e0b' };
        const icons = { success: 'fa-check', error: 'fa-exclamation-triangle', info: 'fa-info-circle', warning: 'fa-exclamation' };
        
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed; top: 20px; right: 20px; z-index: 99999;
            background: ${colors[type]}; color: white; 
            padding: 1rem 1.5rem; border-radius: 8px; font-weight: 600;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3); max-width: 400px;
            font-size: 0.875rem; animation: emergencySlideIn 0.3s ease-out;
            border-left: 4px solid rgba(255,255,255,0.5);
        `;
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.75rem;">
                <i class="fas ${icons[type]}" style="font-size: 1rem;"></i>
                <span>🚨 EMERGENCY: ${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        if (!document.getElementById('emergency-styles')) {
            const style = document.createElement('style');
            style.id = 'emergency-styles';
            style.textContent = '@keyframes emergencySlideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }';
            document.head.appendChild(style);
        }
        
        setTimeout(() => notification.remove(), 4000);
    }
    
    // Utility functions
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
    
    // Global emergency functions
    window.emergencyUploadFix = emergencyUploadFix;
    window.updateAllEmergencyDisplays = updateAllEmergencyDisplays;
    
    // AUTO-INITIALIZATION
    function initialize() {
        console.log('🚨 EMERGENCY FIX - Initializing...');
        
        // Sofortige Aktivierung
        emergencyUploadFix();
        
        // Periodic re-fixing (aggressive)
        setInterval(() => {
            const unfixedInputs = document.querySelectorAll('input[type="file"]:not([data-emergency-fixed])');
            if (unfixedInputs.length > 0) {
                console.log(`🔄 FOUND ${unfixedInputs.length} UNFIXED INPUTS - EMERGENCY REPAIR`);
                unfixedInputs.forEach(input => emergencyTakeoverInput(input));
            }
        }, 2000);
        
        console.log('✅ EMERGENCY FIX - ACTIVE');
    }
    
    // Start immediately
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }
    
    // Also start after a short delay to catch dynamic content
    setTimeout(initialize, 1000);
    
    console.log('🚨 WORKFLOW UPLOAD EMERGENCY FIX - LOADED');
    
})();
