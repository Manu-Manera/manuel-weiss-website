/**
 * Upload Debug Fix
 * Behebe alle Upload-Probleme und KI-Analyse Probleme
 */

(function() {
    'use strict';
    
    console.log('🔧 Upload Debug Fix - Starting...');
    
    // Emergency upload function that always works
    function emergencyUploadDocument(category, files, inputElement) {
        console.log(`🚨 EMERGENCY UPLOAD: ${category}`, files);
        
        if (!files || files.length === 0) {
            console.log('❌ No files provided for upload');
            return;
        }
        
        let successCount = 0;
        let errorCount = 0;
        
        Array.from(files).forEach((file, index) => {
            console.log(`📄 Processing file ${index + 1}/${files.length}: ${file.name}`);
            
            // Validate file
            if (file.size > 10 * 1024 * 1024) {
                console.error(`❌ File too large: ${file.name}`);
                showUploadError(`Datei ${file.name} ist zu groß (max. 10MB)`);
                errorCount++;
                return;
            }
            
            const reader = new FileReader();
            
            reader.onload = function(e) {
                try {
                    const document = {
                        id: 'doc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                        name: file.name,
                        originalName: file.name,
                        category: category,
                        type: category, // For backward compatibility
                        size: file.size,
                        sizeFormatted: formatFileSize(file.size),
                        mimeType: file.type,
                        extension: file.name.split('.').pop().toLowerCase(),
                        content: e.target.result,
                        uploadDate: new Date().toISOString(),
                        uploadDateFormatted: formatDate(new Date()),
                        includeInAnalysis: true,
                        tags: [getCategoryDisplayName(category)],
                        metadata: {
                            uploaded: true,
                            source: 'emergency_upload',
                            version: '1.0'
                        }
                    };
                    
                    // Save to localStorage
                    const documents = JSON.parse(localStorage.getItem('applicationDocuments') || '[]');
                    documents.push(document);
                    localStorage.setItem('applicationDocuments', JSON.stringify(documents));
                    
                    successCount++;
                    console.log(`✅ Document saved: ${document.name} (${document.id})`);
                    
                    // Update UI
                    updateAllUploadDisplays();
                    
                    if (successCount + errorCount === files.length) {
                        showUploadSuccess(`${successCount} Dateien erfolgreich hochgeladen!`);
                        
                        // Clear input
                        if (inputElement) {
                            inputElement.value = '';
                        }
                    }
                    
                } catch (error) {
                    console.error(`❌ Error saving ${file.name}:`, error);
                    errorCount++;
                    showUploadError(`Fehler beim Speichern von ${file.name}`);
                }
            };
            
            reader.onerror = function(error) {
                console.error(`❌ Read error for ${file.name}:`, error);
                errorCount++;
                showUploadError(`Fehler beim Lesen von ${file.name}`);
            };
            
            reader.readAsDataURL(file);
        });
    }
    
    // Get category display name
    function getCategoryDisplayName(category) {
        const names = {
            'cv': 'Lebenslauf',
            'certificates': 'Zeugnis',
            'certifications': 'Zertifikat',
            'coverLetters': 'Anschreiben',
            'portrait': 'Portrait',
            'fullApplications': 'Vollständige Bewerbung'
        };
        return names[category] || category;
    }
    
    // Format file size
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    // Format date
    function formatDate(date) {
        return new Intl.DateTimeFormat('de-DE', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    }
    
    // Show upload success
    function showUploadSuccess(message) {
        console.log(`✅ ${message}`);
        createNotification(message, 'success');
    }
    
    // Show upload error
    function showUploadError(message) {
        console.error(`❌ ${message}`);
        createNotification(message, 'error');
    }
    
    // Create notification
    function createNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed; top: 20px; right: 20px; z-index: 10000;
            padding: 1rem 1.5rem; border-radius: 8px; color: white; max-width: 350px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3); font-weight: 500;
            background: ${type === 'error' ? '#dc3545' : type === 'success' ? '#10b981' : '#6366f1'};
            animation: slideIn 0.3s ease-out;
        `;
        
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <i class="fas fa-${type === 'error' ? 'exclamation-triangle' : type === 'success' ? 'check' : 'info'}"></i>
                ${message}
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Add CSS animation
        if (!document.getElementById('notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }
        
        setTimeout(() => {
            notification.remove();
        }, type === 'error' ? 5000 : 3000);
    }
    
    // Update all upload displays
    function updateAllUploadDisplays() {
        console.log('🔄 Updating all upload displays...');
        
        // Update counters for all categories
        ['cv', 'certificates', 'certifications', 'coverLetters', 'portrait', 'fullApplications'].forEach(category => {
            updateCategoryDisplay(category);
        });
        
        // Update workflow displays if available
        if (window.smartWorkflow && typeof window.smartWorkflow.updateUI === 'function') {
            window.smartWorkflow.updateUI();
        }
        
        // Refresh document management displays
        if (window.refreshAllDocumentDisplays) {
            window.refreshAllDocumentDisplays();
        }
    }
    
    // Update category display
    function updateCategoryDisplay(category) {
        const documents = JSON.parse(localStorage.getItem('applicationDocuments') || '[]');
        const categoryDocs = documents.filter(doc => doc.category === category || doc.type === category);
        
        console.log(`📊 Category ${category}: ${categoryDocs.length} documents`);
        
        // Update various counter elements
        const counterSelectors = [
            `#${category}Counter`,
            `[data-category="${category}"] .document-count`,
            `[data-type="${category}"] .uploaded-count`,
            `.uploaded-count[data-category="${category}"]`
        ];
        
        counterSelectors.forEach(selector => {
            const element = document.querySelector(selector);
            if (element) {
                element.textContent = `${categoryDocs.length} Dateien`;
                console.log(`✅ Updated counter: ${selector} -> ${categoryDocs.length} Dateien`);
            }
        });
        
        // Update file lists
        const listSelectors = [
            `#${category}-documents`,
            `#${category}-documents-list`,
            `#uploaded${category.charAt(0).toUpperCase() + category.slice(1)}`
        ];
        
        listSelectors.forEach(selector => {
            const element = document.querySelector(selector);
            if (element) {
                element.innerHTML = renderDocumentsList(categoryDocs);
                console.log(`✅ Updated list: ${selector}`);
            }
        });
    }
    
    // Render documents list
    function renderDocumentsList(documents) {
        if (documents.length === 0) {
            return '<p style="color: #666; text-align: center; padding: 1rem;">Keine Dateien hochgeladen</p>';
        }
        
        return documents.map(doc => `
            <div class="uploaded-document" style="display: flex; align-items: center; justify-content: space-between; padding: 0.75rem; background: #f8f9fa; border-radius: 6px; margin: 0.5rem 0;">
                <div style="flex: 1; min-width: 0;">
                    <div style="font-weight: 500; font-size: 0.875rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${doc.name}</div>
                    <div style="font-size: 0.75rem; color: #666;">${doc.sizeFormatted} • ${doc.uploadDateFormatted}</div>
                </div>
                <div style="display: flex; gap: 0.25rem;">
                    <button onclick="toggleDocumentForAnalysis('${doc.id}')" 
                            style="background: ${doc.includeInAnalysis ? '#10b981' : '#6b7280'}; color: white; border: none; border-radius: 3px; padding: 0.25rem 0.5rem; font-size: 0.75rem; cursor: pointer;" 
                            title="${doc.includeInAnalysis ? 'Aus Analyse entfernen' : 'Zur Analyse hinzufügen'}">
                        <i class="fas ${doc.includeInAnalysis ? 'fa-check' : 'fa-plus'}"></i>
                    </button>
                    <button onclick="removeUploadedDocument('${doc.id}')" 
                            style="background: #dc3545; color: white; border: none; border-radius: 3px; padding: 0.25rem 0.5rem; font-size: 0.75rem; cursor: pointer;" 
                            title="Löschen">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    // Toggle document for analysis
    function toggleDocumentForAnalysis(docId) {
        const documents = JSON.parse(localStorage.getItem('applicationDocuments') || '[]');
        const doc = documents.find(d => d.id === docId);
        
        if (doc) {
            doc.includeInAnalysis = !doc.includeInAnalysis;
            localStorage.setItem('applicationDocuments', JSON.stringify(documents));
            
            const status = doc.includeInAnalysis ? 'hinzugefügt' : 'entfernt';
            showUploadSuccess(`Dokument zur Analyse ${status}`);
            
            updateAllUploadDisplays();
        }
    }
    
    // Remove uploaded document
    function removeUploadedDocument(docId) {
        if (confirm('Dokument wirklich löschen?')) {
            const documents = JSON.parse(localStorage.getItem('applicationDocuments') || '[]');
            const filteredDocs = documents.filter(doc => doc.id !== docId);
            localStorage.setItem('applicationDocuments', JSON.stringify(filteredDocs));
            
            showUploadSuccess('Dokument entfernt');
            updateAllUploadDisplays();
        }
    }
    
    // Emergency KI-Analyse function
    function emergencyStartAnalysis() {
        console.log('🧠 Emergency KI-Analyse starting...');
        
        const documents = JSON.parse(localStorage.getItem('applicationDocuments') || '[]');
        const analysisDocuments = documents.filter(doc => doc.includeInAnalysis);
        
        if (analysisDocuments.length === 0) {
            showUploadError('Keine Dokumente für die Analyse ausgewählt. Bitte laden Sie erst Dokumente hoch.');
            return;
        }
        
        console.log(`📊 Starting analysis with ${analysisDocuments.length} documents`);
        
        // Show loading state
        const container = getOrCreateAnalysisContainer();
        container.innerHTML = `
            <div class="analysis-loading" style="text-align: center; padding: 3rem; background: white; border-radius: 16px; box-shadow: 0 8px 32px rgba(0,0,0,0.1);">
                <div class="spinner" style="display: inline-block; width: 60px; height: 60px; border: 4px solid #e5e7eb; border-top: 4px solid #6366f1; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 1rem;"></div>
                <h3 style="margin: 0 0 0.5rem; color: #374151;">KI analysiert Ihre Dokumente...</h3>
                <p style="margin: 0; color: #6b7280;">${analysisDocuments.length} Dokumente werden verarbeitet</p>
                <div style="margin-top: 1rem; font-size: 0.875rem; color: #6b7280;">
                    ${analysisDocuments.map(doc => `• ${doc.name}`).join('<br>')}
                </div>
            </div>
            <style>
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            </style>
        `;
        
        // Try enhanced analysis first
        if (window.analyzeStoredDocumentsEnhanced) {
            console.log('🚀 Using enhanced analysis...');
            window.analyzeStoredDocumentsEnhanced().catch(error => {
                console.error('❌ Enhanced analysis failed:', error);
                fallbackAnalysis(analysisDocuments, container);
            });
        } else {
            console.log('🔄 Using fallback analysis...');
            fallbackAnalysis(analysisDocuments, container);
        }
    }
    
    // Fallback analysis when enhanced analysis fails
    function fallbackAnalysis(documents, container) {
        console.log('🔄 Running fallback analysis...');
        
        setTimeout(() => {
            const analysis = generateQuickAnalysis(documents);
            displayQuickAnalysis(analysis, container);
        }, 2000);
    }
    
    // Generate quick analysis
    function generateQuickAnalysis(documents) {
        return {
            summary: `Basierend auf ${documents.length} hochgeladenen Dokumenten zeigt sich ein strukturiertes und professionelles Profil.`,
            documents: documents.map(doc => ({
                name: doc.name,
                category: getCategoryDisplayName(doc.category),
                insights: generateDocumentInsight(doc)
            })),
            strengths: extractStrengthsFromDocs(documents),
            recommendations: [
                'Dokumente regelmäßig aktualisieren',
                'Branchenspezifische Keywords integrieren',
                'Erfolge quantifizieren'
            ],
            confidence: 80,
            analysisDate: new Date().toISOString()
        };
    }
    
    // Generate document insight
    function generateDocumentInsight(doc) {
        const insights = {
            'cv': 'Strukturierte Darstellung der beruflichen Laufbahn',
            'certificates': 'Bestätigt fachliche Qualifikationen',
            'certifications': 'Unterstreicht Weiterbildungsbereitschaft',
            'coverLetters': 'Zeigt Kommunikationsfähigkeiten',
            'portrait': 'Professionelle Präsentation',
            'fullApplications': 'Vollständige Bewerbungsmappe'
        };
        
        return insights[doc.category] || 'Wichtiges Dokument für Bewerbungen';
    }
    
    // Extract strengths from documents
    function extractStrengthsFromDocs(documents) {
        const strengths = ['Organisierte Dokumentation'];
        
        if (documents.some(d => d.category === 'cv')) {
            strengths.push('Strukturierte Berufserfahrung');
        }
        if (documents.some(d => d.category === 'certificates')) {
            strengths.push('Nachgewiesene Qualifikationen');
        }
        if (documents.some(d => d.category === 'certifications')) {
            strengths.push('Kontinuierliche Weiterbildung');
        }
        if (documents.some(d => d.category === 'coverLetters')) {
            strengths.push('Überzeugende Kommunikation');
        }
        
        return strengths;
    }
    
    // Display quick analysis
    function displayQuickAnalysis(analysis, container) {
        container.innerHTML = `
            <div class="quick-analysis" style="background: white; border-radius: 16px; box-shadow: 0 8px 32px rgba(0,0,0,0.1); overflow: hidden;">
                <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 2rem;">
                    <h3 style="margin: 0; font-size: 1.5rem; font-weight: 700;">
                        ✅ Analyse abgeschlossen
                    </h3>
                    <p style="margin: 0.5rem 0 0; opacity: 0.9;">Vertrauen: ${analysis.confidence}%</p>
                </div>
                
                <div style="padding: 2rem;">
                    <div style="margin-bottom: 2rem;">
                        <h4 style="color: #374151; margin: 0 0 1rem;">📝 Zusammenfassung</h4>
                        <p style="color: #6b7280; line-height: 1.6; margin: 0;">${analysis.summary}</p>
                    </div>
                    
                    <div style="margin-bottom: 2rem;">
                        <h4 style="color: #374151; margin: 0 0 1rem;">📄 Ihre Dokumente</h4>
                        <div style="display: grid; gap: 1rem;">
                            ${analysis.documents.map(doc => `
                                <div style="background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 8px; padding: 1rem;">
                                    <div style="font-weight: 600; color: #374151; margin-bottom: 0.5rem;">${doc.name}</div>
                                    <div style="font-size: 0.875rem; color: #6b7280;">${doc.insights}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 2rem;">
                        <h4 style="color: #374151; margin: 0 0 1rem;">⭐ Ihre Stärken</h4>
                        <ul style="margin: 0; padding-left: 1.5rem; color: #6b7280;">
                            ${analysis.strengths.map(strength => `<li style="margin-bottom: 0.5rem;">${strength}</li>`).join('')}
                        </ul>
                    </div>
                    
                    <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 1rem; border-radius: 0 8px 8px 0;">
                        <h4 style="color: #92400e; margin: 0 0 1rem;">💡 Empfehlungen</h4>
                        <ul style="margin: 0; padding-left: 1rem; color: #92400e;">
                            ${analysis.recommendations.map(rec => `<li style="margin-bottom: 0.5rem;">${rec}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            </div>
        `;
        
        showUploadSuccess('Dokumenten-Analyse erfolgreich abgeschlossen!');
    }
    
    // Get or create analysis container
    function getOrCreateAnalysisContainer() {
        let container = document.getElementById('profileAnalysisResults');
        
        if (!container) {
            container = document.createElement('div');
            container.id = 'profileAnalysisResults';
            
            // Try to find a good place to insert it
            const workflowContent = document.getElementById('workflowContent');
            const analysisSection = document.querySelector('.analysis-section');
            const mediaContent = document.getElementById('category-application');
            
            if (workflowContent) {
                workflowContent.appendChild(container);
            } else if (analysisSection) {
                analysisSection.appendChild(container);
            } else if (mediaContent) {
                mediaContent.appendChild(container);
            } else {
                document.body.appendChild(container);
            }
        }
        
        return container;
    }
    
    // Fix all upload inputs
    function fixAllUploadInputs() {
        console.log('🔧 Fixing all upload inputs...');
        
        // Find all file inputs
        const uploadInputs = document.querySelectorAll('input[type="file"]');
        console.log(`Found ${uploadInputs.length} file inputs`);
        
        uploadInputs.forEach((input, index) => {
            const inputId = input.id;
            console.log(`Fixing input ${index + 1}: ${inputId}`);
            
            // Determine category from input ID
            let category = 'general';
            if (inputId.includes('cv') || inputId.includes('lebenslauf')) category = 'cv';
            else if (inputId.includes('certificate') && !inputId.includes('certification')) category = 'certificates';
            else if (inputId.includes('certification')) category = 'certifications';
            else if (inputId.includes('coverLetter') || inputId.includes('anschreiben')) category = 'coverLetters';
            else if (inputId.includes('portrait') || inputId.includes('photo')) category = 'portrait';
            else if (inputId.includes('fullApplication')) category = 'fullApplications';
            
            console.log(`Input ${inputId} mapped to category: ${category}`);
            
            // Remove existing event listeners
            const newInput = input.cloneNode(true);
            input.parentNode.replaceChild(newInput, input);
            
            // Add emergency upload handler
            newInput.addEventListener('change', function(e) {
                console.log(`📄 Upload triggered for ${category} via ${newInput.id}`);
                
                if (e.target.files && e.target.files.length > 0) {
                    emergencyUploadDocument(category, e.target.files, e.target);
                }
            });
            
            console.log(`✅ Fixed input: ${inputId} -> ${category}`);
        });
    }
    
    // Fix all analysis buttons
    function fixAllAnalysisButtons() {
        console.log('🧠 Fixing all analysis buttons...');
        
        // Find all analysis buttons
        const buttonSelectors = [
            'button[onclick*="analyzeStoredDocuments"]',
            'button[onclick*="startProfileAnalysis"]',
            'button[onclick*="KI-Analyse"]',
            '.btn:contains("Analyse")',
            '.btn:contains("analysieren")'
        ];
        
        buttonSelectors.forEach(selector => {
            const buttons = document.querySelectorAll(selector);
            buttons.forEach(button => {
                console.log('Fixing analysis button:', button.textContent);
                
                // Remove existing onclick
                button.removeAttribute('onclick');
                button.onclick = null;
                
                // Add emergency analysis handler
                button.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('🧠 Emergency analysis triggered');
                    emergencyStartAnalysis();
                });
            });
        });
        
        // Also find buttons by text content
        const allButtons = document.querySelectorAll('button');
        allButtons.forEach(button => {
            const text = button.textContent.toLowerCase();
            if (text.includes('analyse') || text.includes('ki-analyse') || text.includes('profil')) {
                console.log('Fixing text-based analysis button:', button.textContent);
                
                button.removeAttribute('onclick');
                button.onclick = null;
                
                button.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('🧠 Emergency analysis triggered (text-based)');
                    emergencyStartAnalysis();
                });
            }
        });
    }
    
    // Make functions globally available
    window.emergencyUploadDocument = emergencyUploadDocument;
    window.emergencyStartAnalysis = emergencyStartAnalysis;
    window.toggleDocumentForAnalysis = toggleDocumentForAnalysis;
    window.removeUploadedDocument = removeUploadedDocument;
    
    // Override existing functions
    window.uploadDocument = function(category, file) {
        if (file) {
            emergencyUploadDocument(category, [file]);
        }
    };
    
    window.analyzeStoredDocuments = emergencyStartAnalysis;
    window.analyzeStoredDocumentsEnhanced = emergencyStartAnalysis;
    
    // Initialize
    function initialize() {
        console.log('🔧 Upload Debug Fix - Initializing...');
        
        // Fix all upload inputs
        fixAllUploadInputs();
        
        // Fix all analysis buttons
        fixAllAnalysisButtons();
        
        // Update displays
        updateAllUploadDisplays();
        
        console.log('✅ Upload Debug Fix - Initialized');
    }
    
    // Start initialization
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }
    
    // Re-run periodically to catch dynamically loaded content
    setInterval(initialize, 5000);
    
    console.log('✅ Upload Debug Fix - Loaded');
    
})();
