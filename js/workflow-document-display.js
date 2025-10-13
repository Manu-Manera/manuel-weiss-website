/**
 * Workflow Document Display
 * Zeigt hochgeladene Dokumente im Workflow an und ermöglicht Analyse-Auswahl
 */

(function() {
    'use strict';
    
    console.log('📋 Workflow Document Display - Starting...');
    
    const STORAGE_KEY = 'applicationDocuments';
    
    // Erweitere das Workflow Schritt 3 Rendering
    function enhanceWorkflowStep3() {
        // Prüfe ob wir in Schritt 3 sind
        const step3 = document.querySelector('[data-step="3"]');
        if (!step3) return;
        
        console.log('📋 Erweitere Workflow Schritt 3 mit Dokumenten-Anzeige...');
        
        // Finde die KI-Profilanalyse Sektion
        const analysisSection = step3.querySelector('.document-upload-section') || 
                              step3.querySelector('[class*="analysis"]') ||
                              step3;
        
        if (analysisSection) {
            // Füge Dokumenten-Auswahl nach Upload-Bereich hinzu
            addDocumentSelectionSection(analysisSection);
            // Füge Überspringen-Button hinzu
            addSkipAnalysisOption();
        }
    }
    
    // Dokumenten-Auswahl Sektion hinzufügen
    function addDocumentSelectionSection(parentElement) {
        const documents = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        
        // Prüfe ob Sektion bereits existiert
        if (document.getElementById('workflowDocumentSelection')) {
            updateDocumentSelectionSection();
            return;
        }
        
        const sectionHTML = `
            <div id="workflowDocumentSelection" style="margin-top: 2rem; padding: 1.5rem; background: #f8fafc; border-radius: 12px; border: 1px solid #e5e7eb;">
                <h3 style="margin: 0 0 1rem; color: #374151; display: flex; align-items: center; gap: 0.5rem;">
                    <i class="fas fa-files" style="color: #6366f1;"></i>
                    Hochgeladene Dokumente für Analyse auswählen
                </h3>
                <p style="margin: 0 0 1.5rem; color: #6b7280; font-size: 0.875rem;">
                    Wählen Sie aus, welche Ihrer hochgeladenen Dokumente für die KI-Profilanalyse verwendet werden sollen.
                </p>
                
                <div id="documentSelectionList">
                    ${renderDocumentSelectionList(documents)}
                </div>
                
                <div style="margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid #e5e7eb;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div style="color: #6b7280; font-size: 0.875rem;">
                            <span id="selectedCount">${documents.filter(d => d.includeInAnalysis).length}</span> von ${documents.length} Dokumenten ausgewählt
                        </div>
                        <div style="display: flex; gap: 1rem;">
                            <button onclick="window.selectAllDocuments(true)" style="
                                background: #6366f1; color: white; border: none; border-radius: 6px;
                                padding: 0.5rem 1rem; cursor: pointer; font-size: 0.875rem;
                            ">Alle auswählen</button>
                            <button onclick="window.selectAllDocuments(false)" style="
                                background: #6b7280; color: white; border: none; border-radius: 6px;
                                padding: 0.5rem 1rem; cursor: pointer; font-size: 0.875rem;
                            ">Alle abwählen</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Einfügen nach dem letzten Upload-Box oder am Ende der Sektion
        const uploadBoxes = parentElement.querySelectorAll('.upload-box');
        const insertAfter = uploadBoxes.length > 0 ? 
                           uploadBoxes[uploadBoxes.length - 1] : 
                           parentElement.children[parentElement.children.length - 1];
        
        if (insertAfter && insertAfter.parentNode) {
            insertAfter.insertAdjacentHTML('afterend', sectionHTML);
        } else {
            parentElement.insertAdjacentHTML('beforeend', sectionHTML);
        }
        
        console.log(`✅ Dokumenten-Auswahl hinzugefügt mit ${documents.length} Dokumenten`);
    }
    
    // Dokumenten-Auswahl Liste rendern
    function renderDocumentSelectionList(documents) {
        if (documents.length === 0) {
            return `
                <div style="text-align: center; padding: 2rem; color: #6b7280; background: white; border-radius: 8px; border: 2px dashed #d1d5db;">
                    <i class="fas fa-cloud-upload-alt" style="font-size: 2rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                    <p style="margin: 0; font-size: 1rem; font-weight: 500;">Noch keine Dokumente hochgeladen</p>
                    <p style="margin: 0.5rem 0 0; font-size: 0.875rem;">Laden Sie Dokumente über die Upload-Bereiche oben hoch</p>
                </div>
            `;
        }
        
        // Gruppiere Dokumente nach Kategorie
        const groupedDocs = groupDocumentsByCategory(documents);
        
        return Object.keys(groupedDocs).map(category => {
            const categoryDocs = groupedDocs[category];
            const categoryInfo = getCategoryInfo(category);
            
            return `
                <div style="margin-bottom: 1.5rem;">
                    <h4 style="margin: 0 0 0.75rem; color: #374151; font-size: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                        <i class="fas ${categoryInfo.icon}" style="color: ${categoryInfo.color};"></i>
                        ${categoryInfo.name} (${categoryDocs.length})
                    </h4>
                    <div style="display: grid; gap: 0.75rem;">
                        ${categoryDocs.map(doc => `
                            <div class="document-selection-item" style="
                                background: white; border: 1px solid #e5e7eb; border-radius: 8px;
                                padding: 1rem; display: flex; align-items: center; gap: 1rem;
                                transition: all 0.2s ease; cursor: pointer;
                                ${doc.includeInAnalysis ? 'border-color: #6366f1; background: #f0f9ff;' : ''}
                            " onclick="window.toggleDocumentSelection('${doc.id}')">
                                
                                <div style="flex-shrink: 0;">
                                    <input type="checkbox" ${doc.includeInAnalysis ? 'checked' : ''} 
                                           style="width: 18px; height: 18px; cursor: pointer;"
                                           onchange="event.stopPropagation(); window.toggleDocumentSelection('${doc.id}')">
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
                                        ${formatFileSize(doc.size)} • ${formatDate(doc.uploadDate)}
                                    </div>
                                </div>
                                
                                <div style="flex-shrink: 0;">
                                    ${doc.includeInAnalysis ? 
                                        '<i class="fas fa-check-circle" style="color: #10b981; font-size: 1.25rem;"></i>' :
                                        '<i class="fas fa-circle" style="color: #d1d5db; font-size: 1.25rem;"></i>'
                                    }
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }).join('');
    }
    
    // Dokumente nach Kategorie gruppieren
    function groupDocumentsByCategory(documents) {
        const grouped = {};
        
        documents.forEach(doc => {
            const category = doc.category || 'general';
            if (!grouped[category]) {
                grouped[category] = [];
            }
            grouped[category].push(doc);
        });
        
        return grouped;
    }
    
    // Kategorie-Info
    function getCategoryInfo(category) {
        const infos = {
            'cv': { name: 'Lebensläufe', icon: 'fa-user', color: '#3b82f6' },
            'certificates': { name: 'Zeugnisse', icon: 'fa-certificate', color: '#10b981' },
            'certifications': { name: 'Zertifikate', icon: 'fa-award', color: '#f59e0b' },
            'coverLetters': { name: 'Anschreiben', icon: 'fa-envelope', color: '#8b5cf6' },
            'portrait': { name: 'Portraits', icon: 'fa-image', color: '#ec4899' },
            'fullApplications': { name: 'Vollständige Bewerbungen', icon: 'fa-folder', color: '#6b7280' },
            'general': { name: 'Dokumente', icon: 'fa-file', color: '#6b7280' }
        };
        return infos[category] || infos['general'];
    }
    
    // Überspringen-Button hinzufügen
    function addSkipAnalysisOption() {
        const step3 = document.querySelector('[data-step="3"]');
        if (!step3) return;
        
        // Finde die Navigation-Buttons am Ende
        const navButtons = step3.querySelector('[style*="justify-content: space-between"]') ||
                          step3.querySelector('.workflow-navigation') ||
                          step3.lastElementChild;
        
        if (navButtons && !document.getElementById('skipAnalysisBtn')) {
            // Ersetze den Weiter-Button durch zwei Buttons
            const weiterButton = navButtons.querySelector('button[onclick*="Weiter"], button[onclick*="continue"], button[onclick*="4"]');
            
            if (weiterButton) {
                const buttonContainer = document.createElement('div');
                buttonContainer.style.cssText = 'display: flex; gap: 1rem;';
                
                buttonContainer.innerHTML = `
                    <button id="skipAnalysisBtn" onclick="window.skipProfileAnalysis()" style="
                        padding: 0.75rem 1.5rem; background: #f59e0b; color: white; border: none; 
                        border-radius: 6px; cursor: pointer; font-weight: 600;
                    ">
                        <i class="fas fa-forward"></i> Überspringen
                    </button>
                    <button onclick="window.proceedWithAnalysis()" style="
                        padding: 0.75rem 2rem; background: #10b981; color: white; border: none; 
                        border-radius: 6px; cursor: pointer; font-weight: 600;
                    ">
                        Weiter <i class="fas fa-arrow-right"></i>
                    </button>
                `;
                
                // Ersetze den ursprünglichen Button
                weiterButton.parentNode.replaceChild(buttonContainer, weiterButton);
                
                console.log('✅ Überspringen-Button hinzugefügt');
            }
        }
    }
    
    // Dokumenten-Auswahl aktualisieren
    function updateDocumentSelectionSection() {
        const listContainer = document.getElementById('documentSelectionList');
        const countElement = document.getElementById('selectedCount');
        
        if (!listContainer) return;
        
        const documents = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        listContainer.innerHTML = renderDocumentSelectionList(documents);
        
        if (countElement) {
            countElement.textContent = documents.filter(d => d.includeInAnalysis).length;
        }
        
        console.log('🔄 Dokumenten-Auswahl aktualisiert');
    }
    
    // Dokument-Auswahl umschalten
    function toggleDocumentSelection(docId) {
        const documents = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        const doc = documents.find(d => d.id === docId);
        
        if (doc) {
            doc.includeInAnalysis = !doc.includeInAnalysis;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(documents));
            
            updateDocumentSelectionSection();
            
            // Auch andere Displays aktualisieren
            if (window.updateAllDisplays) {
                window.updateAllDisplays();
            }
            
            console.log(`📋 Dokument ${doc.name} ${doc.includeInAnalysis ? 'ausgewählt' : 'abgewählt'}`);
        }
    }
    
    // Alle Dokumente auswählen/abwählen
    function selectAllDocuments(select) {
        const documents = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        
        documents.forEach(doc => {
            doc.includeInAnalysis = select;
        });
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(documents));
        updateDocumentSelectionSection();
        
        if (window.updateAllDisplays) {
            window.updateAllDisplays();
        }
        
        console.log(`📋 ${select ? 'Alle' : 'Keine'} Dokumente ausgewählt`);
    }
    
    // Profilanalyse überspringen
    function skipProfileAnalysis() {
        console.log('⏭️ Profilanalyse übersprungen');
        
        // Zeige Bestätigung
        if (confirm('Möchten Sie die Profilanalyse wirklich überspringen? Diese hilft dabei, personalisierte Anschreiben zu erstellen.')) {
            // Gehe direkt zu Schritt 4
            if (window.nextWorkflowStep) {
                window.nextWorkflowStep(4);
            } else if (window.saveAndContinue) {
                window.saveAndContinue(4);
            } else {
                // Fallback
                showMessage('Profilanalyse übersprungen', 'info');
                setTimeout(() => {
                    const nextBtn = document.querySelector('button[onclick*="4"]');
                    if (nextBtn) nextBtn.click();
                }, 1000);
            }
        }
    }
    
    // Mit Analyse fortfahren
    function proceedWithAnalysis() {
        const documents = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        const selectedDocs = documents.filter(d => d.includeInAnalysis);
        
        if (selectedDocs.length === 0) {
            showMessage('Bitte wählen Sie mindestens ein Dokument für die Analyse aus', 'warning');
            return;
        }
        
        console.log(`🧠 Starte Profilanalyse mit ${selectedDocs.length} Dokumenten`);
        
        // Starte die Analyse
        if (window.analyzeStoredDocumentsEnhanced) {
            window.analyzeStoredDocumentsEnhanced();
        } else if (window.analyzeStoredDocuments) {
            window.analyzeStoredDocuments();
        } else {
            // Fallback - gehe zu nächstem Schritt
            showMessage(`Analyse wird mit ${selectedDocs.length} Dokumenten gestartet`, 'success');
            
            if (window.nextWorkflowStep) {
                window.nextWorkflowStep(4);
            } else if (window.saveAndContinue) {
                window.saveAndContinue(4);
            }
        }
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
        
        if (!document.getElementById('workflow-notification-styles')) {
            const style = document.createElement('style');
            style.id = 'workflow-notification-styles';
            style.textContent = '@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }';
            document.head.appendChild(style);
        }
        
        setTimeout(() => notification.remove(), 3000);
    }
    
    // Dokumenten für Analyse abrufen
    function getAnalysisDocuments() {
        const documents = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        const selectedDocs = documents.filter(d => d.includeInAnalysis);
        
        console.log(`📋 getAnalysisDocuments: ${selectedDocs.length} von ${documents.length} Dokumenten ausgewählt`);
        console.log('📋 Ausgewählte Dokumente:', selectedDocs.map(d => d.name));
        
        return selectedDocs;
    }
    
    // Globale Funktionen verfügbar machen
    window.toggleDocumentSelection = toggleDocumentSelection;
    window.selectAllDocuments = selectAllDocuments;
    window.skipProfileAnalysis = skipProfileAnalysis;
    window.proceedWithAnalysis = proceedWithAnalysis;
    window.updateDocumentSelectionSection = updateDocumentSelectionSection;
    window.getAnalysisDocuments = getAnalysisDocuments;
    
    // Workflow-Schritt Überwachung
    function monitorWorkflowStep() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    // Prüfe auf Schritt 3
                    const step3 = document.querySelector('[data-step="3"]');
                    if (step3 && !document.getElementById('workflowDocumentSelection')) {
                        setTimeout(() => {
                            enhanceWorkflowStep3();
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
    
    // Initialisierung
    function initialize() {
        console.log('📋 Workflow Document Display - Initialisiere...');
        
        monitorWorkflowStep();
        
        // Sofort prüfen ob Schritt 3 bereits vorhanden ist
        setTimeout(() => {
            enhanceWorkflowStep3();
        }, 500);
        
        console.log('✅ Workflow Document Display - Bereit!');
    }
    
    // Starten
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }
    
    // Regelmäßige Überprüfung
    setInterval(() => {
        if (document.querySelector('[data-step="3"]') && !document.getElementById('workflowDocumentSelection')) {
            enhanceWorkflowStep3();
        }
    }, 3000);
    
    console.log('✅ Workflow Document Display - Geladen');
    
})();
