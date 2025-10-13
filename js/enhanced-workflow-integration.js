/**
 * Enhanced Workflow Integration
 * Integriert Satzgenerierung und automatische Firmenadress-Extraktion
 */

(function() {
    'use strict';
    
    console.log('🔧 Enhanced Workflow Integration - Starting...');
    
    // Storage für Workflow-Daten
    const WORKFLOW_STORAGE_KEY = 'workflowData';
    
    // Workflow-Daten laden
    function getWorkflowData() {
        try {
            const data = localStorage.getItem(WORKFLOW_STORAGE_KEY);
            return data ? JSON.parse(data) : {};
        } catch (error) {
            console.error('❌ Fehler beim Laden der Workflow-Daten:', error);
            return {};
        }
    }
    
    // Workflow-Daten speichern
    function saveWorkflowData(data) {
        try {
            const existingData = getWorkflowData();
            const mergedData = { ...existingData, ...data };
            localStorage.setItem(WORKFLOW_STORAGE_KEY, JSON.stringify(mergedData));
            return true;
        } catch (error) {
            console.error('❌ Fehler beim Speichern der Workflow-Daten:', error);
            return false;
        }
    }
    
    // Automatische Firmenadress-Extraktion aus Stellenanzeige
    async function extractCompanyAddressFromJobPosting() {
        console.log('🏢 Extrahiere Firmenadresse aus Stellenanzeige...');
        
        const workflowData = getWorkflowData();
        const jobDescription = workflowData.jobDescription || '';
        
        if (!jobDescription || jobDescription.length < 50) {
            showNotification('❌ Stellenanzeige zu kurz für Adress-Extraktion', 'warning');
            return null;
        }
        
        try {
            // Zeige Loading-Status
            updateCompanyAddressDisplay('Suche Firmenadresse...');
            
            const prompt = buildAddressExtractionPrompt(jobDescription, workflowData.company);
            
            if (!window.globalAI || !window.globalAI.callOpenAI) {
                throw new Error('KI-Service nicht verfügbar');
            }
            
            const response = await window.globalAI.callOpenAI([
                {
                    role: "system",
                    content: "Du bist ein Experte für die Extraktion von Firmeninformationen aus Stellenanzeigen. Du findest und formatierst Adressen präzise."
                },
                {
                    role: "user", 
                    content: prompt
                }
            ], {
                max_tokens: 800,
                temperature: 0.1
            });
            
            const addressData = parseAddressResponse(response);
            
            if (addressData) {
                // Adresse in Workflow-Daten speichern
                saveWorkflowData({ companyAddress: addressData });
                
                // UI aktualisieren
                updateCompanyAddressDisplay(formatAddressForDisplay(addressData));
                
                showNotification('✅ Firmenadresse automatisch gefunden!', 'success');
                return addressData;
            } else {
                updateCompanyAddressDisplay('Keine Adresse gefunden - Bitte manuell eingeben');
                showNotification('ℹ️ Keine Adresse in Stellenanzeige gefunden', 'info');
                return null;
            }
            
        } catch (error) {
            console.error('❌ Fehler bei Adress-Extraktion:', error);
            updateCompanyAddressDisplay('Fehler bei automatischer Suche - Bitte manuell eingeben');
            showNotification('❌ Automatische Adress-Suche fehlgeschlagen', 'error');
            return null;
        }
    }
    
    // Prompt für Adress-Extraktion erstellen
    function buildAddressExtractionPrompt(jobDescription, companyName) {
        return `
AUFGABE: Extrahiere die Firmenadresse aus der folgenden Stellenanzeige.

FIRMENNAME: ${companyName || 'Unbekannt'}

STELLENANZEIGE:
${jobDescription}

EXTRAHIERE FOLGENDE INFORMATIONEN:
- Vollständiger Firmenname
- Straße und Hausnummer
- Postleitzahl und Ort
- Land (falls angegeben)
- Ansprechperson (falls vorhanden)
- Abteilung (falls angegeben)

ANTWORTFORMAT - Gib AUSSCHLIESSLICH ein JSON-Objekt zurück:
{
  "companyName": "Vollständiger Firmenname",
  "street": "Straße und Hausnummer",
  "postalCode": "PLZ",
  "city": "Stadt", 
  "country": "Land",
  "contactPerson": "Ansprechperson oder null",
  "department": "Abteilung oder null",
  "found": true,
  "confidence": 95
}

WENN KEINE ADRESSE GEFUNDEN:
{
  "found": false,
  "reason": "Keine Adressinformationen in der Stellenanzeige enthalten"
}

WICHTIG:
- Extrahiere nur explizit genannte Informationen
- Erfinde keine Adressen
- Gib confidence zwischen 0-100 basierend auf Sicherheit an
- Bei mehreren Adressen: nimm die Hauptadresse/Bewerbungsadresse
        `;
    }
    
    // Adress-Response parsen
    function parseAddressResponse(response) {
        try {
            let parsed;
            
            if (typeof response === 'string') {
                const jsonMatch = response.match(/\{[\s\S]*\}/);
                const jsonStr = jsonMatch ? jsonMatch[0] : response;
                parsed = JSON.parse(jsonStr);
            } else if (response && response.content) {
                const jsonMatch = response.content.match(/\{[\s\S]*\}/);
                const jsonStr = jsonMatch ? jsonMatch[0] : response.content;
                parsed = JSON.parse(jsonStr);
            } else {
                parsed = response;
            }
            
            if (parsed.found && parsed.confidence > 60) {
                return parsed;
            } else {
                console.log('ℹ️ Adresse nicht gefunden oder geringe Konfidenz:', parsed);
                return null;
            }
            
        } catch (error) {
            console.error('❌ Fehler beim Parsen der Adress-Response:', error);
            return null;
        }
    }
    
    // Adresse für Anzeige formatieren
    function formatAddressForDisplay(addressData) {
        const parts = [];
        
        if (addressData.companyName) parts.push(`<strong>${addressData.companyName}</strong>`);
        if (addressData.department) parts.push(addressData.department);
        if (addressData.contactPerson) parts.push(`z.Hd. ${addressData.contactPerson}`);
        if (addressData.street) parts.push(addressData.street);
        if (addressData.postalCode && addressData.city) {
            parts.push(`${addressData.postalCode} ${addressData.city}`);
        }
        if (addressData.country && addressData.country !== 'Deutschland') {
            parts.push(addressData.country);
        }
        
        return parts.join('<br>');
    }
    
    // Company Address Display aktualisieren
    function updateCompanyAddressDisplay(content) {
        const container = document.getElementById('companyAddress');
        if (container) {
            container.innerHTML = content;
        }
        
        // Alternative Container suchen
        const altSelectors = [
            '.company-address',
            '#company-address',
            '[data-field="companyAddress"]'
        ];
        
        altSelectors.forEach(selector => {
            const element = document.querySelector(selector);
            if (element) {
                element.innerHTML = content;
            }
        });
    }
    
    // Erweiterte Satzgenerierung für Workflow integrieren
    async function generateWorkflowSentences() {
        console.log('📝 Starte erweiterte Satzgenerierung für Workflow...');
        
        const workflowData = getWorkflowData();
        const selectedRequirements = workflowData.selectedRequirements || [];
        
        if (selectedRequirements.length === 0) {
            showNotification('❌ Keine Anforderungen ausgewählt', 'warning');
            return;
        }
        
        try {
            // Verwende die erweiterte AI Satzgenerierung
            if (window.generateSentenceSuggestionsEnhanced) {
                const userProfile = extractUserProfileFromWorkflow(workflowData);
                const suggestionsData = await window.generateSentenceSuggestionsEnhanced(
                    selectedRequirements, 
                    userProfile,
                    { language: detectLanguageFromJobDescription(workflowData.jobDescription) }
                );
                
                // Integriere Sätze in Workflow-UI
                displaySentencesInWorkflow(suggestionsData);
                
            } else {
                // Fallback zur ursprünglichen Satzgenerierung
                if (window.generateSentenceSuggestions) {
                    await window.generateSentenceSuggestions();
                } else {
                    throw new Error('Keine Satzgenerierung verfügbar');
                }
            }
            
        } catch (error) {
            console.error('❌ Workflow-Satzgenerierung fehlgeschlagen:', error);
            showNotification('❌ Satzgenerierung fehlgeschlagen: ' + error.message, 'error');
        }
    }
    
    // User-Profil aus Workflow-Daten extrahieren
    function extractUserProfileFromWorkflow(workflowData) {
        return {\n            experience: workflowData.userExperience || 'Mehrjährige Berufserfahrung',\n            skills: workflowData.userSkills || ['Projektmanagement', 'Kommunikation', 'Teamarbeit'],\n            achievements: workflowData.userAchievements || ['Erfolgreiche Projekte geleitet'],\n            education: workflowData.userEducation || 'Qualifizierte Ausbildung',\n            currentPosition: workflowData.currentPosition || 'Fachkraft',\n            yearsExperience: workflowData.yearsExperience || 3\n        };\n    }\n    \n    // Sprache aus Stellenbeschreibung erkennen\n    function detectLanguageFromJobDescription(jobDescription) {\n        if (!jobDescription || jobDescription.length < 20) return 'de';\n        \n        const text = jobDescription.toLowerCase();\n        \n        // Deutsche Indikatoren\n        const germanWords = ['der', 'die', 'das', 'und', 'ist', 'haben', 'werden', 'mit', 'von', 'zu', 'für', 'wir', 'sie', 'sind', 'können'];\n        const germanCount = germanWords.filter(word => text.includes(word)).length;\n        \n        // Englische Indikatoren\n        const englishWords = ['the', 'and', 'you', 'that', 'was', 'for', 'are', 'with', 'they', 'have', 'this', 'will', 'can', 'we', 'our'];\n        const englishCount = englishWords.filter(word => text.includes(word)).length;\n        \n        return germanCount > englishCount ? 'de' : 'en';\n    }\n    \n    // Sätze in Workflow-UI anzeigen\n    function displaySentencesInWorkflow(suggestionsData) {\n        const container = document.getElementById('requirementsMatching');\n        if (!container) {\n            console.error('❌ Requirements container nicht gefunden');\n            return;\n        }\n        \n        // Verwende die erweiterte Render-Funktion\n        if (window.renderEnhancedSentenceSuggestions) {\n            window.renderEnhancedSentenceSuggestions(suggestionsData, 'requirementsMatching');\n        } else {\n            // Fallback zu einfacher Darstellung\n            container.innerHTML = generateSimpleSentenceDisplay(suggestionsData);\n        }\n    }\n    \n    // Einfache Satz-Anzeige als Fallback\n    function generateSimpleSentenceDisplay(suggestionsData) {\n        if (!suggestionsData || suggestionsData.length === 0) {\n            return '<p style=\"color: #6b7280; text-align: center; padding: 2rem;\">Keine Satzvorschläge verfügbar</p>';\n        }\n        \n        return suggestionsData.map((reqData, index) => {\n            const req = reqData.requirement;\n            const suggestions = reqData.suggestions;\n            \n            return `\n                <div class=\"workflow-requirement\" style=\"background: white; border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 1rem; overflow: hidden;\">\n                    <div style=\"background: #6366f1; color: white; padding: 1rem;\">\n                        <h4 style=\"margin: 0; font-size: 1rem;\">${req.text}</h4>\n                    </div>\n                    <div style=\"padding: 1rem;\">\n                        ${suggestions.slice(0, 3).map((suggestion, idx) => `\n                            <div class=\"suggestion-option\" style=\"padding: 0.75rem; border: 1px solid #e5e7eb; border-radius: 6px; margin-bottom: 0.5rem; cursor: pointer;\" \n                                 onclick=\"selectWorkflowSentence(${index}, ${idx}, this)\">\n                                <div style=\"font-weight: 500; margin-bottom: 0.25rem;\">${suggestion.text}</div>\n                                <div style=\"font-size: 0.75rem; color: #6b7280;\">Vertrauen: ${suggestion.confidence || 80}% • ${suggestion.approach || 'professional'}</div>\n                            </div>\n                        `).join('')}\n                        <button onclick=\"generateMoreForRequirement(${index})\" \n                                style=\"background: #8b5cf6; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; font-size: 0.875rem; cursor: pointer;\">\n                            <i class=\"fas fa-plus\"></i> Weitere Sätze\n                        </button>\n                    </div>\n                </div>\n            `;\n        }).join('');\n    }\n    \n    // Workflow-Satz auswählen\n    function selectWorkflowSentence(reqIndex, suggestionIndex, element) {\n        // Andere Optionen deselektieren\n        const container = element.parentElement;\n        const suggestions = container.querySelectorAll('.suggestion-option');\n        suggestions.forEach(s => {\n            s.style.borderColor = '#e5e7eb';\n            s.style.background = 'white';\n        });\n        \n        // Aktuelle Option selektieren\n        element.style.borderColor = '#6366f1';\n        element.style.background = '#f0f9ff';\n        \n        // Satz zu Workflow-Content hinzufügen\n        const sentenceText = element.querySelector('div').textContent;\n        addSentenceToWorkflowContent(sentenceText);\n        \n        showNotification('✅ Satz hinzugefügt', 'success');\n    }\n    \n    // Satz zu Workflow-Content hinzufügen\n    function addSentenceToWorkflowContent(sentence) {\n        const contentContainer = document.getElementById('coverLetterContent');\n        if (!contentContainer) return;\n        \n        const currentContent = contentContainer.textContent || contentContainer.innerText || '';\n        const newContent = currentContent ? currentContent + '\\n\\n' + sentence : sentence;\n        \n        if (contentContainer.isContentEditable) {\n            contentContainer.innerHTML = newContent.replace(/\\n/g, '<br>');\n        } else {\n            contentContainer.textContent = newContent;\n        }\n        \n        // Scroll zum Ende\n        contentContainer.scrollTop = contentContainer.scrollHeight;\n    }\n    \n    // Erweiterte Schritt 5 Funktionalität\n    function enhanceStep5() {\n        console.log('🔧 Erweitere Schritt 5 Funktionalität...');\n        \n        // Automatische Adress-Suche Button\n        const searchButton = document.querySelector('button[onclick*=\"searchCompanyAddress\"]');\n        if (searchButton) {\n            searchButton.onclick = extractCompanyAddressFromJobPosting;\n        }\n        \n        // Alternative Button-Handler\n        const altButtons = document.querySelectorAll('button');\n        altButtons.forEach(btn => {\n            if (btn.textContent.includes('Automatisch suchen') || btn.textContent.includes('suchen')) {\n                btn.onclick = extractCompanyAddressFromJobPosting;\n            }\n        });\n        \n        console.log('✅ Schritt 5 Funktionalität erweitert');\n    }\n    \n    // Workflow-Schritte überwachen und erweitern\n    function monitorWorkflowSteps() {\n        // Observer für Workflow-Änderungen\n        const workflowContainer = document.getElementById('workflowContent') || document.body;\n        \n        const observer = new MutationObserver((mutations) => {\n            mutations.forEach((mutation) => {\n                if (mutation.type === 'childList') {\n                    // Prüfe auf Schritt 5\n                    const step5 = document.querySelector('[data-step=\"5\"], .workflow-step:nth-child(5)');\n                    if (step5) {\n                        setTimeout(enhanceStep5, 100);\n                    }\n                    \n                    // Prüfe auf Requirements Matching Container\n                    const reqContainer = document.getElementById('requirementsMatching');\n                    if (reqContainer && reqContainer.innerHTML.includes('Wähle die wichtigsten')) {\n                        // Erweitere mit Satzgenerierung\n                        setTimeout(() => {\n                            addSentenceGenerationToRequirements();\n                        }, 100);\n                    }\n                }\n            });\n        });\n        \n        observer.observe(workflowContainer, {\n            childList: true,\n            subtree: true\n        });\n    }\n    \n    // Satzgenerierung zu Requirements hinzufügen\n    function addSentenceGenerationToRequirements() {\n        const container = document.getElementById('requirementsMatching');\n        if (!container || container.querySelector('.enhanced-sentence-generation')) {\n            return; // Bereits hinzugefügt\n        }\n        \n        const enhancementHTML = `\n            <div class=\"enhanced-sentence-generation\" style=\"margin-top: 1rem; padding: 1rem; background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 8px;\">\n                <h4 style=\"margin: 0 0 1rem; color: #374151;\">🤖 KI-Satzgenerierung</h4>\n                <p style=\"margin: 0 0 1rem; color: #6b7280; font-size: 0.875rem;\">Wählen Sie Anforderungen aus und lassen Sie die KI passende Sätze generieren.</p>\n                <button onclick=\"generateWorkflowSentences()\" \n                        style=\"background: #8b5cf6; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 6px; cursor: pointer; font-weight: 600;\">\n                    <i class=\"fas fa-magic\"></i> Intelligente Sätze generieren\n                </button>\n            </div>\n        `;\n        \n        container.insertAdjacentHTML('beforeend', enhancementHTML);\n    }\n    \n    // Utility: Notification anzeigen\n    function showNotification(message, type = 'info') {\n        const colors = {\n            success: '#10b981',\n            error: '#ef4444',\n            info: '#3b82f6',\n            warning: '#f59e0b'\n        };\n        \n        const notification = document.createElement('div');\n        notification.style.cssText = `\n            position: fixed; top: 20px; right: 20px; z-index: 10000;\n            background: ${colors[type]}; color: white; padding: 0.75rem 1rem;\n            border-radius: 6px; font-size: 0.875rem; font-weight: 500;\n            box-shadow: 0 4px 12px rgba(0,0,0,0.2); max-width: 300px;\n            animation: slideIn 0.3s ease-out;\n        `;\n        \n        notification.textContent = message;\n        document.body.appendChild(notification);\n        \n        if (!document.getElementById('workflow-notification-styles')) {\n            const style = document.createElement('style');\n            style.id = 'workflow-notification-styles';\n            style.textContent = '@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }';\n            document.head.appendChild(style);\n        }\n        \n        setTimeout(() => notification.remove(), 3000);\n    }\n    \n    // Globale Funktionen verfügbar machen\n    window.extractCompanyAddressFromJobPosting = extractCompanyAddressFromJobPosting;\n    window.generateWorkflowSentences = generateWorkflowSentences;\n    window.selectWorkflowSentence = selectWorkflowSentence;\n    window.enhanceStep5 = enhanceStep5;\n    \n    // Überschreibe bestehende Funktionen\n    window.searchCompanyAddress = extractCompanyAddressFromJobPosting;\n    \n    // Initialisierung\n    function initialize() {\n        console.log('🔧 Enhanced Workflow Integration - Initialisiere...');\n        \n        // Workflow überwachen\n        monitorWorkflowSteps();\n        \n        // Sofort Schritt 5 erweitern falls vorhanden\n        setTimeout(enhanceStep5, 1000);\n        \n        console.log('✅ Enhanced Workflow Integration - Bereit!');\n    }\n    \n    // Starten\n    if (document.readyState === 'loading') {\n        document.addEventListener('DOMContentLoaded', initialize);\n    } else {\n        initialize();\n    }\n    \n    console.log('✅ Enhanced Workflow Integration - Geladen');\n    \n})();
