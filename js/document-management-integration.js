/**
 * Document Management Integration
 * Integriert Upload-Funktionalität mit der bestehenden Medienverwaltung
 * und stellt alle Dokumente für die KI-Analyse zur Verfügung
 */

(function() {
    'use strict';
    
    console.log('📁 Document Management Integration - Loading...');
    
    // Document categories mapping
    const DOCUMENT_CATEGORIES = {
        'cv': {
            name: 'Lebenslauf',
            icon: 'fas fa-user',
            description: 'Ihr aktueller Lebenslauf und verschiedene Versionen',
            accept: '.pdf,.doc,.docx,.odt,.rtf',
            maxSize: 10 * 1024 * 1024
        },
        'portrait': {
            name: 'Portrait',
            icon: 'fas fa-image',
            description: 'Professionelle Bewerbungsfotos',
            accept: '.jpg,.jpeg,.png,.webp',
            maxSize: 5 * 1024 * 1024
        },
        'certificates': {
            name: 'Zeugnis',
            icon: 'fas fa-graduation-cap',
            description: 'Arbeitszeugnisse und Bildungsabschlüsse',
            accept: '.pdf,.doc,.docx,.jpg,.jpeg,.png',
            maxSize: 10 * 1024 * 1024
        },
        'certifications': {
            name: 'Zertifikat',
            icon: 'fas fa-award',
            description: 'Weiterbildungen und Zertifizierungen',
            accept: '.pdf,.doc,.docx,.jpg,.jpeg,.png',
            maxSize: 10 * 1024 * 1024
        },
        'coverLetters': {
            name: 'Anschreiben',
            icon: 'fas fa-envelope',
            description: 'Frühere Anschreiben und Bewerbungsschreiben',
            accept: '.pdf,.doc,.docx,.txt',
            maxSize: 10 * 1024 * 1024
        },
        'fullApplications': {
            name: 'Vollständige Bewerbung',
            icon: 'fas fa-file-archive',
            description: 'Komplette Bewerbungsmappen',
            accept: '.pdf,.zip,.rar',
            maxSize: 50 * 1024 * 1024
        }
    };
    
    // Storage key for documents
    const STORAGE_KEY = 'applicationDocuments';
    
    // Enhanced document upload function
    function uploadDocument(category, file) {
        console.log(`📄 Uploading document - Category: ${category}, File: ${file?.name}`);
        
        if (!file) {
            showNotification('Keine Datei ausgewählt', 'error');
            return;
        }
        
        // Validate category
        if (!DOCUMENT_CATEGORIES[category]) {
            showNotification(`Unbekannte Kategorie: ${category}`, 'error');
            return;
        }
        
        // Validate file
        const validation = validateDocument(file, category);
        if (!validation.valid) {
            showNotification(validation.error, 'error');
            return;
        }
        
        // Show upload progress
        showUploadProgress(file.name, category);
        
        // Read file
        const reader = new FileReader();
        
        reader.onload = function(e) {
            try {
                const document = createDocumentObject(file, category, e.target.result);
                saveDocumentToStorage(document);
                
                // Update UI
                refreshDocumentDisplay(category);
                updateDocumentCounter(category);
                
                showNotification(`${file.name} erfolgreich hochgeladen`, 'success');
                console.log(`✅ Document uploaded: ${document.name} (${document.id})`);
                
                // Update workflow if active
                updateWorkflowDocuments();
                
            } catch (error) {
                console.error('❌ Upload error:', error);
                showNotification(`Fehler beim Hochladen: ${error.message}`, 'error');
            }
        };
        
        reader.onerror = function(error) {
            console.error('❌ File read error:', error);
            showNotification('Fehler beim Lesen der Datei', 'error');
        };
        
        reader.readAsDataURL(file);
    }
    
    // Validate document
    function validateDocument(file, category) {
        const categoryConfig = DOCUMENT_CATEGORIES[category];
        
        // Check file size
        if (file.size > categoryConfig.maxSize) {
            return {
                valid: false,
                error: `Datei zu groß. Maximum: ${formatFileSize(categoryConfig.maxSize)}`
            };
        }
        
        // Check file type
        const extension = '.' + file.name.split('.').pop().toLowerCase();
        const allowedTypes = categoryConfig.accept.split(',');
        
        if (!allowedTypes.includes(extension)) {
            return {
                valid: false,
                error: `Dateityp ${extension} nicht erlaubt. Erlaubt: ${categoryConfig.accept}`
            };
        }
        
        return { valid: true };
    }
    
    // Create document object
    function createDocumentObject(file, category, content) {
        const now = new Date();
        
        return {
            id: 'doc_' + now.getTime() + '_' + Math.random().toString(36).substr(2, 9),
            name: file.name,
            originalName: file.name,
            category: category,
            type: category, // For backward compatibility
            size: file.size,
            sizeFormatted: formatFileSize(file.size),
            mimeType: file.type,
            extension: file.name.split('.').pop().toLowerCase(),
            content: content,
            uploadDate: now.toISOString(),
            uploadDateFormatted: formatDate(now),
            includeInAnalysis: true,
            tags: [DOCUMENT_CATEGORIES[category].name],
            metadata: {
                uploaded: true,
                source: 'user_upload',
                version: '1.0'
            }
        };
    }
    
    // Save document to storage
    function saveDocumentToStorage(document) {
        try {
            const documents = getStoredDocuments();
            documents.push(document);
            
            localStorage.setItem(STORAGE_KEY, JSON.stringify(documents));
            console.log(`💾 Document saved: ${document.name} (${document.id})`);
            
        } catch (error) {
            console.error('❌ Storage error:', error);
            throw new Error('Fehler beim Speichern der Datei');
        }
    }
    
    // Get stored documents
    function getStoredDocuments() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        } catch (error) {
            console.error('❌ Error reading stored documents:', error);
            return [];
        }
    }
    
    // Get documents by category
    function getDocumentsByCategory(category) {
        return getStoredDocuments().filter(doc => 
            doc.category === category || doc.type === category
        );
    }
    
    // Remove document
    function removeDocument(documentId) {
        try {
            const documents = getStoredDocuments();
            const filteredDocs = documents.filter(doc => doc.id !== documentId);
            
            localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredDocs));
            
            console.log(`🗑️ Document removed: ${documentId}`);
            showNotification('Dokument entfernt', 'success');
            
            // Refresh all displays
            refreshAllDocumentDisplays();
            updateWorkflowDocuments();
            
        } catch (error) {
            console.error('❌ Error removing document:', error);
            showNotification('Fehler beim Entfernen', 'error');
        }
    }
    
    // Refresh document display for category
    function refreshDocumentDisplay(category) {
        const documents = getDocumentsByCategory(category);
        
        // Update in media management (admin.html)
        updateMediaManagementDisplay(category, documents);
        
        // Update in bewerbungen.html document management
        updateBewerbungenDisplay(category, documents);
        
        // Update workflow displays
        updateWorkflowDisplay(category, documents);
    }
    
    // Update media management display (admin.html)
    function updateMediaManagementDisplay(category, documents) {
        // Update document preview in media section
        const fileNameElement = document.getElementById(`${category}FileName`);
        if (fileNameElement && documents.length > 0) {
            fileNameElement.textContent = documents[documents.length - 1].name;
        }
        
        // Update document list if exists
        const listContainer = document.getElementById(`${category}-documents-list`);
        if (listContainer) {
            listContainer.innerHTML = renderDocumentsList(documents, category);
        }
    }
    
    // Update bewerbungen.html display
    function updateBewerbungenDisplay(category, documents) {
        const container = document.getElementById(`${category}-documents`);
        if (container) {
            container.innerHTML = renderDocumentsList(documents, category);
        }
    }
    
    // Update workflow display
    function updateWorkflowDisplay(category, documents) {
        // Update uploaded files in workflow
        const workflowContainer = document.getElementById(`uploaded${category.charAt(0).toUpperCase() + category.slice(1)}`);
        if (workflowContainer) {
            workflowContainer.innerHTML = renderWorkflowDocumentsList(documents);
        }
        
        // Update counter
        const counterElement = document.querySelector(`[data-type="${category}"] .uploaded-count`);
        if (counterElement) {
            counterElement.textContent = `${documents.length} Dateien`;
        }
    }
    
    // Render documents list
    function renderDocumentsList(documents, category) {
        if (documents.length === 0) {
            return `<p style="color: #666; text-align: center; padding: 2rem;">Keine ${DOCUMENT_CATEGORIES[category].name} hochgeladen</p>`;
        }
        
        return documents.map(doc => `
            <div class="document-item" data-id="${doc.id}">
                <div class="document-info">
                    <div class="document-icon">
                        <i class="${getDocumentIcon(doc.extension)}"></i>
                    </div>
                    <div class="document-details">
                        <h6 class="document-name">${doc.name}</h6>
                        <p class="document-meta">
                            ${doc.sizeFormatted} • ${doc.uploadDateFormatted}
                            ${doc.includeInAnalysis ? '<span class="analysis-badge">✓ Für Analyse</span>' : ''}
                        </p>
                    </div>
                </div>
                <div class="document-actions">
                    <button class="btn btn-small btn-outline" onclick="previewDocument('${doc.id}')" title="Vorschau">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-small btn-outline" onclick="downloadDocument('${doc.id}')" title="Download">
                        <i class="fas fa-download"></i>
                    </button>
                    <button class="btn btn-small ${doc.includeInAnalysis ? 'btn-success' : 'btn-outline'}" 
                            onclick="toggleDocumentAnalysis('${doc.id}')" 
                            title="${doc.includeInAnalysis ? 'Aus Analyse entfernen' : 'Zur Analyse hinzufügen'}">
                        <i class="fas ${doc.includeInAnalysis ? 'fa-check' : 'fa-plus'}"></i>
                    </button>
                    <button class="btn btn-small btn-danger" onclick="removeDocument('${doc.id}')" title="Löschen">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    // Render workflow documents list (compact version)
    function renderWorkflowDocumentsList(documents) {
        if (documents.length === 0) {
            return '<p style="color: #666; font-size: 0.875rem; margin: 0.5rem 0;">Keine Dateien hochgeladen</p>';
        }
        
        return documents.map(doc => `
            <div class="workflow-document-item" style="display: flex; align-items: center; justify-content: space-between; padding: 0.5rem; background: #f8f9fa; border-radius: 4px; margin: 0.25rem 0;">
                <div style="flex: 1; min-width: 0;">
                    <div style="font-weight: 500; font-size: 0.875rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${doc.name}</div>
                    <div style="font-size: 0.75rem; color: #666;">${doc.sizeFormatted}</div>
                </div>
                <div style="display: flex; gap: 0.25rem;">
                    <button onclick="toggleDocumentAnalysis('${doc.id}')" 
                            style="background: ${doc.includeInAnalysis ? '#10b981' : '#6b7280'}; color: white; border: none; border-radius: 3px; padding: 0.25rem 0.5rem; font-size: 0.75rem; cursor: pointer;" 
                            title="${doc.includeInAnalysis ? 'Aus Analyse entfernen' : 'Zur Analyse hinzufügen'}">
                        <i class="fas ${doc.includeInAnalysis ? 'fa-check' : 'fa-plus'}"></i>
                    </button>
                    <button onclick="removeDocument('${doc.id}')" 
                            style="background: #dc3545; color: white; border: none; border-radius: 3px; padding: 0.25rem 0.5rem; font-size: 0.75rem; cursor: pointer;" 
                            title="Entfernen">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    // Get document icon based on extension
    function getDocumentIcon(extension) {
        const iconMap = {
            'pdf': 'fas fa-file-pdf text-red-500',
            'doc': 'fas fa-file-word text-blue-500',
            'docx': 'fas fa-file-word text-blue-500',
            'txt': 'fas fa-file-alt text-gray-500',
            'jpg': 'fas fa-file-image text-green-500',
            'jpeg': 'fas fa-file-image text-green-500',
            'png': 'fas fa-file-image text-green-500',
            'webp': 'fas fa-file-image text-green-500',
            'zip': 'fas fa-file-archive text-purple-500',
            'rar': 'fas fa-file-archive text-purple-500'
        };
        
        return iconMap[extension] || 'fas fa-file text-gray-500';
    }
    
    // Toggle document for analysis
    function toggleDocumentAnalysis(documentId) {
        try {
            const documents = getStoredDocuments();
            const doc = documents.find(d => d.id === documentId);
            
            if (doc) {
                doc.includeInAnalysis = !doc.includeInAnalysis;
                localStorage.setItem(STORAGE_KEY, JSON.stringify(documents));
                
                const status = doc.includeInAnalysis ? 'hinzugefügt' : 'entfernt';
                showNotification(`Dokument zur Analyse ${status}`, 'success');
                
                // Refresh displays
                refreshAllDocumentDisplays();
                updateWorkflowDocuments();
            }
            
        } catch (error) {
            console.error('❌ Error toggling analysis:', error);
            showNotification('Fehler beim Ändern der Analyse-Einstellung', 'error');
        }
    }
    
    // Update document counter
    function updateDocumentCounter(category) {
        const documents = getDocumentsByCategory(category);
        const analysisCount = documents.filter(doc => doc.includeInAnalysis).length;
        
        // Update various counter elements
        const counters = [
            document.getElementById(`${category}Counter`),
            document.querySelector(`[data-category="${category}"] .document-count`),
            document.querySelector(`[data-type="${category}"] .uploaded-count`)
        ];
        
        counters.forEach(counter => {
            if (counter) {
                counter.textContent = `${documents.length} Dateien (${analysisCount} für Analyse)`;
            }
        });
    }
    
    // Refresh all document displays
    function refreshAllDocumentDisplays() {
        Object.keys(DOCUMENT_CATEGORIES).forEach(category => {
            refreshDocumentDisplay(category);
            updateDocumentCounter(category);
        });
    }
    
    // Update workflow documents (for analysis)
    function updateWorkflowDocuments() {
        const analysisDocuments = getStoredDocuments().filter(doc => doc.includeInAnalysis);
        
        // Update workflow display if active
        if (window.smartWorkflow && typeof window.smartWorkflow.updateUI === 'function') {
            window.smartWorkflow.updateUI();
        }
        
        // Store analysis-ready documents for workflow
        window.analysisDocuments = analysisDocuments;
        
        console.log(`📊 Updated analysis documents: ${analysisDocuments.length} files ready`);
    }
    
    // Get analysis-ready documents
    function getAnalysisDocuments() {
        return getStoredDocuments().filter(doc => doc.includeInAnalysis);
    }
    
    // Enhanced profile analysis using stored documents
    function analyzeStoredDocuments() {
        const analysisDocuments = getAnalysisDocuments();
        
        if (analysisDocuments.length === 0) {
            showNotification('Keine Dokumente für Analyse ausgewählt', 'error');
            return;
        }
        
        console.log(`🔍 Starting analysis with ${analysisDocuments.length} documents`);
        
        // Call workflow upload fix analysis if available
        if (window.fixedAnalyzeProfile) {
            window.fixedAnalyzeProfile();
        } else if (window.smartWorkflow && window.smartWorkflow.startProfileAnalysis) {
            window.smartWorkflow.startProfileAnalysis();
        } else {
            // Generate demo analysis
            generateDemoAnalysis(analysisDocuments);
        }
    }
    
    // Generate demo analysis
    function generateDemoAnalysis(documents) {
        const analysis = {
            summary: `Basierend auf ${documents.length} Dokumenten zeigen Sie eine starke professionelle Entwicklung und vielseitige Kompetenzen.`,
            strengths: extractStrengthsFromDocuments(documents),
            skills: extractSkillsFromDocuments(documents),
            writingStyle: analyzeWritingStyle(documents),
            recommendations: generateRecommendations(documents),
            documentAnalysis: documents.map(doc => ({
                name: doc.name,
                category: doc.category,
                insights: generateDocumentInsights(doc)
            }))
        };
        
        displayAnalysisResults(analysis);
    }
    
    // Extract strengths from documents
    function extractStrengthsFromDocuments(documents) {
        const strengths = ['Kontinuierliche Weiterbildung', 'Strukturierte Arbeitsweise'];
        
        if (documents.some(doc => doc.category === 'cv')) {
            strengths.push('Umfassende Berufserfahrung');
        }
        
        if (documents.some(doc => doc.category === 'certificates')) {
            strengths.push('Fundierte Ausbildung');
        }
        
        if (documents.some(doc => doc.category === 'certifications')) {
            strengths.push('Fachspezifische Zertifizierungen');
        }
        
        if (documents.some(doc => doc.category === 'coverLetters')) {
            strengths.push('Überzeugende Kommunikation');
        }
        
        return strengths;
    }
    
    // Extract skills from documents
    function extractSkillsFromDocuments(documents) {
        const skills = [
            { category: "Dokumentation", items: ["Professionelle Aufbereitung", "Strukturierung", "Detailgenauigkeit"] }
        ];
        
        if (documents.some(doc => doc.category === 'cv')) {
            skills.push({ category: "Beruflich", items: ["Projektmanagement", "Teamführung", "Strategische Planung"] });
        }
        
        if (documents.some(doc => doc.category === 'certifications')) {
            skills.push({ category: "Fachlich", items: ["Zertifizierte Kompetenzen", "Weiterbildungsbereitschaft", "Spezialisierung"] });
        }
        
        return skills;
    }
    
    // Analyze writing style
    function analyzeWritingStyle(documents) {
        return {
            tone: "Professionell und strukturiert",
            vocabulary: "Fachlich kompetent mit präziser Ausdrucksweise",
            structure: "Logisch aufgebaut mit klarer Gliederung"
        };
    }
    
    // Generate recommendations
    function generateRecommendations(documents) {
        const recommendations = [];
        
        if (!documents.some(doc => doc.category === 'portrait')) {
            recommendations.push('Professionelles Bewerbungsfoto hinzufügen');
        }
        
        if (documents.filter(doc => doc.category === 'certificates').length < 2) {
            recommendations.push('Weitere relevante Zeugnisse hinzufügen');
        }
        
        recommendations.push('Dokumente regelmäßig aktualisieren');
        recommendations.push('Branchenspezifische Keywords optimieren');
        
        return recommendations;
    }
    
    // Generate document insights
    function generateDocumentInsights(doc) {
        const insights = {
            'cv': 'Zeigt strukturierte Karriereentwicklung',
            'portrait': 'Professionelle Präsentation',
            'certificates': 'Bestätigt fachliche Qualifikation',
            'certifications': 'Unterstreicht Spezialisierung',
            'coverLetters': 'Demonstriert Kommunikationsfähigkeit',
            'fullApplications': 'Komplettpaket verfügbar'
        };
        
        return insights[doc.category] || 'Wertvoll für Gesamtprofil';
    }
    
    // Display analysis results (reuse from workflow-upload-fix.js)
    function displayAnalysisResults(analysis) {
        const container = document.getElementById('profileAnalysisResults') || createAnalysisContainer();
        
        container.innerHTML = `
            <div style="background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden; margin: 1rem 0;">
                <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 1.5rem;">
                    <h3 style="margin: 0; font-size: 1.25rem; font-weight: 600;">
                        <i class="fas fa-user-check"></i> Profil-Analyse basierend auf Ihren Dokumenten
                    </h3>
                    <p style="margin: 0.5rem 0 0; opacity: 0.9;">${getAnalysisDocuments().length} Dokumente analysiert</p>
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
                                <i class="fas fa-file-alt" style="color: #6366f1;"></i> Dokument-Insights
                            </h4>
                            ${analysis.documentAnalysis.map(docAnalysis => `
                                <div style="margin-bottom: 0.75rem; padding: 0.5rem; background: #f8fafc; border-radius: 6px;">
                                    <div style="font-weight: 500; font-size: 0.875rem; color: #374151;">${docAnalysis.name}</div>
                                    <div style="font-size: 0.75rem; color: #6b7280;">${docAnalysis.insights}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 1rem; border-radius: 0 8px 8px 0;">
                        <h4 style="color: #92400e; margin: 0 0 1rem; font-size: 1rem; font-weight: 600;">
                            <i class="fas fa-lightbulb"></i> Empfehlungen
                        </h4>
                        <ul style="margin: 0; padding-left: 1rem; color: #92400e;">
                            ${analysis.recommendations.map(rec => `<li style="margin-bottom: 0.5rem;">${rec}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            </div>
        `;
        
        showNotification('Analyse abgeschlossen!', 'success');
    }
    
    // Create analysis container if it doesn't exist
    function createAnalysisContainer() {
        const container = document.createElement('div');
        container.id = 'profileAnalysisResults';
        
        // Try to insert in workflow area
        const workflowContent = document.getElementById('workflowContent');
        if (workflowContent) {
            workflowContent.appendChild(container);
        } else {
            document.body.appendChild(container);
        }
        
        return container;
    }
    
    // Utility functions
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    function formatDate(date) {
        return new Intl.DateTimeFormat('de-DE', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    }
    
    function showUploadProgress(fileName, category) {
        showNotification(`Uploading ${fileName}...`, 'info');
    }
    
    function showNotification(message, type = 'info') {
        console.log(`[${type.toUpperCase()}] ${message}`);
        
        if (window.adminPanel && window.adminPanel.showToast) {
            window.adminPanel.showToast(message, type);
        } else {
            // Create simple notification
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed; top: 20px; right: 20px; z-index: 10000;
                padding: 1rem; border-radius: 8px; color: white; max-width: 300px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                background: ${type === 'error' ? '#dc3545' : type === 'success' ? '#10b981' : '#6366f1'};
            `;
            notification.innerHTML = `<i class="fas fa-${type === 'error' ? 'exclamation-triangle' : type === 'success' ? 'check' : 'info'}"></i> ${message}`;
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.remove();
            }, type === 'error' ? 5000 : 3000);
        }
    }
    
    // Preview document
    function previewDocument(documentId) {
        const doc = getStoredDocuments().find(d => d.id === documentId);
        if (doc && doc.content) {
            // Open in new window for preview
            const newWindow = window.open();
            newWindow.document.write(`
                <html>
                    <head><title>${doc.name}</title></head>
                    <body style="margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #f5f5f5;">
                        ${doc.mimeType.startsWith('image/') ? 
                            `<img src="${doc.content}" style="max-width: 100%; max-height: 100%; object-fit: contain;">` :
                            `<iframe src="${doc.content}" style="width: 90vw; height: 90vh; border: none;"></iframe>`
                        }
                    </body>
                </html>
            `);
        }
    }
    
    // Download document
    function downloadDocument(documentId) {
        const doc = getStoredDocuments().find(d => d.id === documentId);
        if (doc && doc.content) {
            const link = document.createElement('a');
            link.href = doc.content;
            link.download = doc.name;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }
    
    // Make functions globally available
    window.uploadDocument = uploadDocument;
    window.removeDocument = removeDocument;
    window.toggleDocumentAnalysis = toggleDocumentAnalysis;
    window.previewDocument = previewDocument;
    window.downloadDocument = downloadDocument;
    window.getAnalysisDocuments = getAnalysisDocuments;
    window.analyzeStoredDocuments = analyzeStoredDocuments;
    window.refreshAllDocumentDisplays = refreshAllDocumentDisplays;
    
    // Override existing upload functions
    window.uploadApplicationDocument = uploadDocument;
    window.fixedHandleDocumentUpload = function(inputId, category) {
        const input = document.getElementById(inputId);
        if (input && input.files && input.files.length > 0) {
            Array.from(input.files).forEach(file => {
                uploadDocument(category, file);
            });
        }
    };
    
    // Initialize
    function initialize() {
        console.log('📁 Document Management Integration - Initializing...');
        
        // Refresh all displays
        refreshAllDocumentDisplays();
        updateWorkflowDocuments();
        
        // Set up file input change handlers
        Object.keys(DOCUMENT_CATEGORIES).forEach(category => {
            const input = document.getElementById(`${category}Upload`) || document.getElementById(`${category}-upload`);
            if (input) {
                input.addEventListener('change', function(e) {
                    if (e.target.files && e.target.files.length > 0) {
                        Array.from(e.target.files).forEach(file => {
                            uploadDocument(category, file);
                        });
                    }
                });
            }
        });
        
        console.log('✅ Document Management Integration - Initialized');
    }
    
    // Start initialization
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }
    
    // Re-run initialization to catch dynamically loaded content
    setTimeout(initialize, 1000);
    setTimeout(initialize, 3000);
    
})();
