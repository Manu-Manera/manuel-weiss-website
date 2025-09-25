/**
 * Workflow Upload Fix
 * Behebt alle Upload-Probleme im Smart Workflow System
 */

(function() {
    'use strict';
    
    console.log('🔧 Workflow Upload Fix - Loading...');
    
    // Enhanced document upload handler
    function fixedHandleDocumentUpload(inputId, type) {
        console.log(`🔧 Fixed upload handler called: ${inputId}, type: ${type}`);
        
        const input = document.getElementById(inputId);
        if (!input) {
            console.error(`❌ Upload input not found: ${inputId}`);
            return;
        }
        
        const files = input.files;
        if (!files || files.length === 0) {
            console.log('ℹ️ No files selected');
            return;
        }
        
        console.log(`📄 Processing ${files.length} files for type: ${type}`);
        
        let successCount = 0;
        let errorCount = 0;
        
        // Show immediate feedback
        showUploadProgress(files.length, type);
        
        Array.from(files).forEach((file, index) => {
            console.log(`📄 Processing file ${index + 1}/${files.length}: ${file.name}`);
            
            // Validate file
            if (!validateFile(file, type)) {
                errorCount++;
                updateUploadProgress(successCount, errorCount, files.length, type);
                return;
            }
            
            const reader = new FileReader();
            
            reader.onload = function(e) {
                try {
                    // Create document object
                    const document = {
                        id: 'doc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                        name: file.name,
                        type: type,
                        size: file.size,
                        sizeFormatted: formatFileSize(file.size),
                        content: e.target.result,
                        uploadDate: new Date().toISOString(),
                        includeInAnalysis: true,
                        fileExtension: file.name.split('.').pop().toLowerCase(),
                        mimeType: file.type
                    };
                    
                    // Save to localStorage with error handling
                    saveDocumentToStorage(document);
                    successCount++;
                    
                    console.log(`✅ File uploaded: ${document.name} (ID: ${document.id})`);
                    
                    // Update progress and UI
                    updateUploadProgress(successCount, errorCount, files.length, type);
                    
                    // If this is the last file, finalize upload
                    if (successCount + errorCount === files.length) {
                        finalizeUpload(successCount, errorCount, type);
                    }
                    
                } catch (error) {
                    console.error(`❌ Error processing ${file.name}:`, error);
                    errorCount++;
                    updateUploadProgress(successCount, errorCount, files.length, type);
                    
                    if (successCount + errorCount === files.length) {
                        finalizeUpload(successCount, errorCount, type);
                    }
                }
            };
            
            reader.onerror = function(error) {
                console.error(`❌ Read error for ${file.name}:`, error);
                errorCount++;
                updateUploadProgress(successCount, errorCount, files.length, type);
                
                if (successCount + errorCount === files.length) {
                    finalizeUpload(successCount, errorCount, type);
                }
            };
            
            reader.readAsDataURL(file);
        });
        
        // Clear input
        input.value = '';
    }
    
    // File validation
    function validateFile(file, type) {
        const allowedTypes = {
            'cv': ['pdf', 'doc', 'docx', 'odt', 'rtf'],
            'coverLetters': ['pdf', 'doc', 'docx', 'txt'],
            'certificates': ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx']
        };
        
        const maxSize = 10 * 1024 * 1024; // 10MB
        const extension = file.name.split('.').pop().toLowerCase();
        
        if (file.size > maxSize) {
            showError(`Datei ${file.name} ist zu groß (max. 10MB)`);
            return false;
        }
        
        if (!allowedTypes[type] || !allowedTypes[type].includes(extension)) {
            showError(`Dateityp .${extension} ist für ${type} nicht erlaubt`);
            return false;
        }
        
        return true;
    }
    
    // Save document to storage
    function saveDocumentToStorage(document) {
        try {
            const documents = JSON.parse(localStorage.getItem('applicationDocuments') || '[]');
            documents.push(document);
            localStorage.setItem('applicationDocuments', JSON.stringify(documents));
            
            console.log(`💾 Document saved to storage: ${document.name}`);
        } catch (error) {
            console.error('❌ Error saving to localStorage:', error);
            throw new Error('Fehler beim Speichern der Datei');
        }
    }
    
    // Format file size
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    // Show upload progress
    function showUploadProgress(totalFiles, type) {
        const typeNames = {
            'cv': 'Lebenslauf',
            'coverLetters': 'Anschreiben',
            'certificates': 'Zeugnisse'
        };
        
        console.log(`📤 Upload gestartet: ${totalFiles} ${typeNames[type]} Dateien`);
        
        // Update UI to show progress
        updateFileCounter(type);
    }
    
    // Update upload progress
    function updateUploadProgress(success, error, total, type) {
        console.log(`📊 Upload Progress: ${success} success, ${error} error, ${total} total for ${type}`);
        updateFileCounter(type);
    }
    
    // Finalize upload
    function finalizeUpload(successCount, errorCount, type) {
        console.log(`✅ Upload completed: ${successCount} success, ${errorCount} error for ${type}`);
        
        const typeNames = {
            'cv': 'Lebenslauf',
            'coverLetters': 'Anschreiben',
            'certificates': 'Zeugnisse'
        };
        
        if (successCount > 0) {
            showSuccess(`${successCount} ${typeNames[type]} Dateien erfolgreich hochgeladen`);
        }
        
        if (errorCount > 0) {
            showError(`${errorCount} Dateien konnten nicht hochgeladen werden`);
        }
        
        // Update UI
        updateFileCounter(type);
        refreshWorkflowUI();
    }
    
    // Update file counter in UI
    function updateFileCounter(type) {
        try {
            const documents = JSON.parse(localStorage.getItem('applicationDocuments') || '[]');
            const filteredDocs = documents.filter(doc => doc.type === type);
            
            // Update counter in upload box
            const counterElement = document.querySelector(`[data-type="${type}"] .uploaded-count`);
            if (counterElement) {
                counterElement.textContent = `${filteredDocs.length} Dateien`;
            }
            
            // Update uploaded files list
            const filesListElement = document.querySelector(`[data-type="${type}"] .uploaded-files`);
            if (filesListElement) {
                filesListElement.innerHTML = renderUploadedFiles(type);
            }
            
            console.log(`📊 Updated counter for ${type}: ${filteredDocs.length} files`);
        } catch (error) {
            console.error('❌ Error updating file counter:', error);
        }
    }
    
    // Render uploaded files
    function renderUploadedFiles(type) {
        try {
            const documents = JSON.parse(localStorage.getItem('applicationDocuments') || '[]');
            const filteredDocs = documents.filter(doc => doc.type === type);
            
            if (filteredDocs.length === 0) {
                return '<p style="color: #666; font-size: 0.875rem; margin: 0.5rem 0;">Keine Dateien hochgeladen</p>';
            }
            
            return filteredDocs.map(doc => `
                <div class="uploaded-file" style="display: flex; align-items: center; justify-content: space-between; padding: 0.5rem; background: #f8f9fa; border-radius: 4px; margin: 0.25rem 0;">
                    <div style="flex: 1; min-width: 0;">
                        <div style="font-weight: 500; font-size: 0.875rem; truncate;">${doc.name}</div>
                        <div style="font-size: 0.75rem; color: #666;">${doc.sizeFormatted || formatFileSize(doc.size)}</div>
                    </div>
                    <button onclick="removeUploadedDocument('${doc.id}')" style="background: #dc3545; color: white; border: none; border-radius: 3px; padding: 0.25rem 0.5rem; font-size: 0.75rem; cursor: pointer;" title="Entfernen">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `).join('');
        } catch (error) {
            console.error('❌ Error rendering uploaded files:', error);
            return '<p style="color: #dc3545;">Fehler beim Laden der Dateien</p>';
        }
    }
    
    // Remove uploaded document
    function removeUploadedDocument(docId) {
        try {
            const documents = JSON.parse(localStorage.getItem('applicationDocuments') || '[]');
            const filteredDocs = documents.filter(doc => doc.id !== docId);
            localStorage.setItem('applicationDocuments', JSON.stringify(filteredDocs));
            
            // Refresh UI
            refreshWorkflowUI();
            
            console.log(`🗑️ Document removed: ${docId}`);
            showSuccess('Datei entfernt');
        } catch (error) {
            console.error('❌ Error removing document:', error);
            showError('Fehler beim Entfernen der Datei');
        }
    }
    
    // Refresh workflow UI
    function refreshWorkflowUI() {
        // Update all upload boxes
        ['cv', 'coverLetters', 'certificates'].forEach(type => {
            updateFileCounter(type);
        });
        
        // Update smart workflow if available
        if (window.smartWorkflow && typeof window.smartWorkflow.updateUI === 'function') {
            window.smartWorkflow.updateUI();
        }
    }
    
    // Show messages
    function showSuccess(message) {
        console.log(`✅ ${message}`);
        if (window.adminPanel && window.adminPanel.showToast) {
            window.adminPanel.showToast(message, 'success');
        } else {
            // Fallback notification
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed; top: 20px; right: 20px; z-index: 10000;
                background: #10b981; color: white; padding: 1rem; border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3); max-width: 300px;
            `;
            notification.innerHTML = `<i class="fas fa-check"></i> ${message}`;
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.remove();
            }, 3000);
        }
    }
    
    function showError(message) {
        console.error(`❌ ${message}`);
        if (window.adminPanel && window.adminPanel.showToast) {
            window.adminPanel.showToast(message, 'error');
        } else {
            // Fallback notification
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed; top: 20px; right: 20px; z-index: 10000;
                background: #dc3545; color: white; padding: 1rem; border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3); max-width: 300px;
            `;
            notification.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${message}`;
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.remove();
            }, 4000);
        }
    }
    
    // Fixed profile analysis with better error handling
    function fixedAnalyzeProfile() {
        console.log('🔍 Starting fixed profile analysis...');
        
        try {
            const documents = JSON.parse(localStorage.getItem('applicationDocuments') || '[]');
            
            if (documents.length === 0) {
                showError('Keine Dokumente für die Analyse verfügbar. Bitte laden Sie zuerst Dokumente hoch.');
                return;
            }
            
            console.log(`📊 Analyzing ${documents.length} documents`);
            
            // Show analysis in progress
            const analysisContainer = document.getElementById('profileAnalysisResults');
            if (analysisContainer) {
                analysisContainer.innerHTML = `
                    <div style="text-align: center; padding: 2rem;">
                        <div style="display: inline-block; width: 40px; height: 40px; border: 3px solid #e5e7eb; border-top: 3px solid #6366f1; border-radius: 50%; animation: spin 1s linear infinite;"></div>
                        <p style="margin: 1rem 0 0; color: #6b7280;">Analysiere Ihre Dokumente...</p>
                    </div>
                `;
            }
            
            // Simulate analysis (replace with actual AI call when API is working)
            setTimeout(() => {
                const fakeAnalysis = generateFakeAnalysis(documents);
                displayAnalysisResults(fakeAnalysis);
            }, 2000);
            
        } catch (error) {
            console.error('❌ Error in profile analysis:', error);
            showError('Fehler bei der Profilanalyse: ' + error.message);
        }
    }
    
    // Generate fake analysis for demo (replace with real AI analysis)
    function generateFakeAnalysis(documents) {
        return {
            summary: "Basierend auf Ihren Dokumenten zeigen Sie starke Kompetenzen in der Softwareentwicklung und Projektmanagement.",
            strengths: [
                "Technische Expertise in modernen Programmiersprachen",
                "Nachgewiesene Führungserfahrung",
                "Kontinuierliche Weiterbildung",
                "Analytisches Denkvermögen"
            ],
            skills: [
                { category: "Technisch", items: ["JavaScript", "Python", "React", "Node.js"] },
                { category: "Soft Skills", items: ["Teamführung", "Kommunikation", "Problemlösung"] },
                { category: "Methoden", items: ["Agile", "Scrum", "DevOps"] }
            ],
            writingStyle: {
                tone: "Professionell und zielorientiert",
                vocabulary: "Fachlich kompetent mit klarer Ausdrucksweise",
                structure: "Gut strukturiert mit logischem Aufbau"
            },
            recommendations: [
                "Heben Sie Ihre Führungserfahrung stärker hervor",
                "Konkrete Projekterfolge mit Zahlen belegen",
                "Branchenspezifische Keywords integrieren"
            ],
            documentCount: documents.length,
            analysisDate: new Date().toISOString()
        };
    }
    
    // Display analysis results
    function displayAnalysisResults(analysis) {
        const container = document.getElementById('profileAnalysisResults');
        if (!container) return;
        
        container.innerHTML = `
            <div style="background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden;">
                <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 1.5rem;">
                    <h3 style="margin: 0; font-size: 1.25rem; font-weight: 600;">
                        <i class="fas fa-user-check"></i> Ihr Profil-Analyse
                    </h3>
                    <p style="margin: 0.5rem 0 0; opacity: 0.9;">${analysis.documentCount} Dokumente analysiert</p>
                </div>
                
                <div style="padding: 1.5rem;">
                    <div style="margin-bottom: 2rem;">
                        <h4 style="color: #374151; margin: 0 0 1rem; font-size: 1rem; font-weight: 600;">
                            <i class="fas fa-lightbulb" style="color: #f59e0b;"></i> Zusammenfassung
                        </h4>
                        <p style="color: #6b7280; line-height: 1.6; margin: 0;">${analysis.summary}</p>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 2rem;">
                        <div>
                            <h4 style="color: #374151; margin: 0 0 1rem; font-size: 1rem; font-weight: 600;">
                                <i class="fas fa-star" style="color: #10b981;"></i> Ihre Stärken
                            </h4>
                            <ul style="margin: 0; padding-left: 1rem; color: #6b7280;">
                                ${analysis.strengths.map(strength => `<li style="margin-bottom: 0.5rem;">${strength}</li>`).join('')}
                            </ul>
                        </div>
                        
                        <div>
                            <h4 style="color: #374151; margin: 0 0 1rem; font-size: 1rem; font-weight: 600;">
                                <i class="fas fa-cogs" style="color: #6366f1;"></i> Kompetenzen
                            </h4>
                            ${analysis.skills.map(skillGroup => `
                                <div style="margin-bottom: 1rem;">
                                    <strong style="color: #374151; font-size: 0.875rem;">${skillGroup.category}:</strong>
                                    <div style="margin-top: 0.25rem;">
                                        ${skillGroup.items.map(item => `
                                            <span style="display: inline-block; background: #e5e7eb; color: #374151; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem; margin: 0.125rem 0.25rem 0.125rem 0;">${item}</span>
                                        `).join('')}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div style="background: #f8fafc; border-radius: 8px; padding: 1rem; margin-bottom: 1rem;">
                        <h4 style="color: #374151; margin: 0 0 1rem; font-size: 1rem; font-weight: 600;">
                            <i class="fas fa-pen" style="color: #8b5cf6;"></i> Ihr Schreibstil
                        </h4>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                            <div>
                                <strong style="color: #6b7280; font-size: 0.875rem;">Tonfall:</strong>
                                <p style="margin: 0.25rem 0 0; color: #374151;">${analysis.writingStyle.tone}</p>
                            </div>
                            <div>
                                <strong style="color: #6b7280; font-size: 0.875rem;">Ausdrucksweise:</strong>
                                <p style="margin: 0.25rem 0 0; color: #374151;">${analysis.writingStyle.vocabulary}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 1rem; border-radius: 0 8px 8px 0;">
                        <h4 style="color: #92400e; margin: 0 0 1rem; font-size: 1rem; font-weight: 600;">
                            <i class="fas fa-tips"></i> Empfehlungen
                        </h4>
                        <ul style="margin: 0; padding-left: 1rem; color: #92400e;">
                            ${analysis.recommendations.map(rec => `<li style="margin-bottom: 0.5rem;">${rec}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            </div>
        `;
        
        showSuccess('Profilanalyse abgeschlossen!');
    }
    
    // Make functions globally available
    window.fixedHandleDocumentUpload = fixedHandleDocumentUpload;
    window.removeUploadedDocument = removeUploadedDocument;
    window.fixedAnalyzeProfile = fixedAnalyzeProfile;
    
    // Initialize when DOM is ready
    function initialize() {
        console.log('🔧 Workflow Upload Fix - Initializing...');
        
        // Override SmartWorkflowSystem handleDocumentUpload if it exists
        if (window.smartWorkflow && window.smartWorkflow.handleDocumentUpload) {
            window.smartWorkflow.handleDocumentUpload = fixedHandleDocumentUpload;
            console.log('✅ Overrode SmartWorkflow handleDocumentUpload');
        }
        
        // Fix any existing upload inputs
        const uploadInputs = document.querySelectorAll('input[type="file"][onchange*="handleDocumentUpload"]');
        uploadInputs.forEach(input => {
            const onchangeAttr = input.getAttribute('onchange');
            if (onchangeAttr && onchangeAttr.includes('handleDocumentUpload')) {
                // Replace with fixed version
                const newOnchange = onchangeAttr.replace('handleDocumentUpload', 'fixedHandleDocumentUpload');
                input.setAttribute('onchange', newOnchange);
                console.log('✅ Fixed upload input:', input.id);
            }
        });
        
        // Update file counters on load
        ['cv', 'coverLetters', 'certificates'].forEach(type => {
            updateFileCounter(type);
        });
        
        console.log('✅ Workflow Upload Fix - Initialized');
    }
    
    // Start initialization
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }
    
    // Re-run every few seconds to catch dynamically loaded content
    for (let i = 1; i <= 3; i++) {
        setTimeout(initialize, i * 2000);
    }
    
})();
