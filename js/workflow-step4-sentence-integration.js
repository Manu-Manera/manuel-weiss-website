/**
 * Workflow Schritt 4 - Satzgenerierung Integration
 * Implementiert die intelligente Satzgenerierung für passgenaue Formulierungen
 */

(function() {
    'use strict';
    
    console.log('📝 Workflow Step 4 Sentence Integration - Starting...');
    
    const STORAGE_KEY = 'applicationDocuments';
    
    // Überwacht Schritt 4 und aktiviert Satzgenerierung
    function monitorStep4() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    // Prüfe auf Schritt 4 oder Requirements
                    const step4 = document.querySelector('[data-step="4"]') || 
                                 document.querySelector('.requirement-item') ||
                                 document.querySelector('[class*="requirement"]');
                    
                    if (step4) {
                        setTimeout(() => {
                            enhanceStep4WithSentenceGeneration();
                        }, 500);
                    }
                }
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        console.log('👀 Monitoring for Step 4...');
    }
    
    // Erweitere Schritt 4 mit Satzgenerierung
    function enhanceStep4WithSentenceGeneration() {
        console.log('📝 Enhancing Step 4 with sentence generation...');
        
        // Finde Anforderungs-Items
        const requirementItems = document.querySelectorAll('.requirement-item, [class*="requirement"]');
        
        if (requirementItems.length === 0) {
            console.log('⚠️ No requirement items found');
            return;
        }
        
        console.log(`✅ Found ${requirementItems.length} requirement items`);
        
        requirementItems.forEach((item, index) => {
            enhanceRequirementItem(item, index);
        });
    }
    
    // Erweitere einzelnes Anforderungs-Item
    function enhanceRequirementItem(item, index) {
        // Prüfe ob bereits erweitert
        if (item.querySelector('.sentence-generation-section')) {
            return;
        }
        
        console.log(`📝 Enhancing requirement item ${index + 1}`);
        
        // Finde Anforderungstext
        const requirementText = extractRequirementText(item);
        if (!requirementText) {
            console.log(`⚠️ Could not extract requirement text from item ${index + 1}`);
            return;
        }
        
        // Erstelle Satzgenerierungs-Sektion
        const sentenceSection = createSentenceGenerationSection(requirementText, index);
        
        // Füge Sektion hinzu
        item.appendChild(sentenceSection);
        
        console.log(`✅ Added sentence generation to requirement ${index + 1}: ${requirementText.substring(0, 50)}...`);
    }
    
    // Extrahiere Anforderungstext aus Item
    function extractRequirementText(item) {
        // Verschiedene Selektoren versuchen
        const selectors = [
            '.requirement-text',
            '[class*="requirement"] p',
            'h4',
            'h5',
            '.text-content',
            'span',
            'div'
        ];
        
        for (const selector of selectors) {
            const element = item.querySelector(selector);
            if (element && element.textContent.trim().length > 10) {
                return element.textContent.trim();
            }
        }
        
        // Fallback: Ganzer Item-Text
        return item.textContent.trim();
    }
    
    // Erstelle Satzgenerierungs-Sektion
    function createSentenceGenerationSection(requirementText, requirementIndex) {
        const section = document.createElement('div');
        section.className = 'sentence-generation-section';
        section.style.cssText = `
            margin-top: 1rem; padding: 1rem; background: #f8fafc; 
            border-radius: 8px; border: 1px solid #e5e7eb;
        `;
        
        section.innerHTML = `
            <div style="display: flex; justify-content: between; align-items: center; margin-bottom: 1rem;">
                <h5 style="margin: 0; color: #374151; font-size: 0.875rem; font-weight: 600;">
                    🤖 KI-Satzgenerierung
                </h5>
                <button class="generate-sentences-btn" onclick="generateSentencesForRequirement_Step4('${requirementIndex}', \`${requirementText.replace(/`/g, '\\`')}\`)" style="
                    background: #8b5cf6; color: white; border: none; border-radius: 6px;
                    padding: 0.5rem 1rem; cursor: pointer; font-size: 0.75rem; font-weight: 500;
                ">
                    <i class="fas fa-magic"></i> Sätze generieren
                </button>
            </div>
            
            <div class="sentence-results" id="sentenceResults_${requirementIndex}">
                <p style="margin: 0; color: #6b7280; font-size: 0.875rem;">
                    Klicken Sie auf "Sätze generieren" um personalisierte Formulierungen zu erhalten.
                </p>
            </div>
        `;
        
        return section;
    }
    
    // Hauptfunktion für Satzgenerierung
    async function generateSentencesForRequirement_Step4(requirementIndex, requirementText) {
        console.log(`🎯 Generating sentences for requirement ${requirementIndex}: ${requirementText}`);
        
        const resultsContainer = document.getElementById(`sentenceResults_${requirementIndex}`);
        if (!resultsContainer) {
            console.error('❌ Results container not found');
            return;
        }
        
        // Zeige Loading
        resultsContainer.innerHTML = `
            <div style="text-align: center; padding: 1rem;">
                <i class="fas fa-spinner fa-spin" style="color: #8b5cf6; font-size: 1.5rem;"></i>
                <p style="margin: 0.5rem 0 0; color: #6b7280; font-size: 0.875rem;">
                    KI generiert personalisierte Sätze...
                </p>
            </div>
        `;
        
        try {
            // 1. Lade Benutzerprofil
            const userProfile = await loadUserProfileForSentences();
            
            // 2. Erstelle Anforderungs-Objekt
            const requirement = {
                text: requirementText,
                index: requirementIndex,
                category: classifyRequirement(requirementText),
                importance: 'high'
            };
            
            // 3. Erkenne Sprache
            const language = detectLanguage(requirementText);
            
            // 4. Generiere Sätze
            let sentences;
            if (userProfile && userProfile.skills) {
                console.log('✅ Using AI profile for personalized sentences');
                sentences = await generateProfileBasedSentences(requirement, userProfile, language);
            } else {
                console.log('⚠️ No profile found - using fallback generation');
                sentences = await generateFallbackSentences(requirement, language);
            }
            
            // 5. Zeige Ergebnisse
            displaySentenceResults(resultsContainer, sentences, requirementIndex);
            
            console.log(`✅ Generated ${sentences.length} sentences for requirement ${requirementIndex}`);
            
        } catch (error) {
            console.error('❌ Sentence generation failed:', error);
            showSentenceError(resultsContainer, error.message);
        }
    }
    
    // Lade Benutzerprofil für Sätze
    async function loadUserProfileForSentences() {
        try {
            // 1. Versuche KI-Analyse Ergebnis
            const analysisResult = localStorage.getItem('profileAnalysisResult') || 
                                 localStorage.getItem('aiAnalysisResult');
            
            if (analysisResult) {
                const parsed = JSON.parse(analysisResult);
                if (parsed.skills || parsed.strengths) {
                    console.log('✅ Found AI analysis profile');
                    return parsed;
                }
            }
            
            // 2. Versuche Dokumente zu analysieren
            const docs = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
            const selectedDocs = docs.filter(d => d.includeInAnalysis);
            
            if (selectedDocs.length > 0) {
                console.log(`✅ Found ${selectedDocs.length} documents for profile extraction`);
                return extractProfileFromDocuments(selectedDocs);
            }
            
            // 3. Fallback: Basis-Profil
            console.log('⚠️ No profile data found - using fallback');
            return null;
            
        } catch (error) {
            console.error('❌ Error loading user profile:', error);
            return null;
        }
    }
    
    // Extrahiere Profil aus Dokumenten
    function extractProfileFromDocuments(docs) {
        const profile = {
            skills: [],
            strengths: [],
            experience: [],
            education: [],
            documents: docs.map(d => ({ name: d.name, category: d.category }))
        };
        
        // Basis-Skills aus Dokument-Kategorien ableiten
        docs.forEach(doc => {
            switch (doc.category) {
                case 'cv':
                    profile.skills.push({ category: 'Allgemein', items: ['Berufserfahrung', 'Qualifikationen'] });
                    profile.strengths.push('Strukturiertes Arbeiten');
                    break;
                case 'certificates':
                    profile.skills.push({ category: 'Zertifiziert', items: ['Fachkenntnisse', 'Weiterbildung'] });
                    profile.strengths.push('Lernbereitschaft');
                    break;
                case 'coverLetters':
                    profile.skills.push({ category: 'Kommunikation', items: ['Schriftliche Kommunikation', 'Präsentation'] });
                    profile.strengths.push('Kommunikationsstärke');
                    break;
            }
        });
        
        return profile;
    }
    
    // Profilbasierte Satzgenerierung
    async function generateProfileBasedSentences(requirement, profile, language) {
        console.log('🎯 Generating profile-based sentences...');
        
        const prompt = buildProfilePrompt(requirement, profile, language);
        
        try {
            if (!window.globalAI || !window.globalAI.isAPIReady()) {
                throw new Error('OpenAI API nicht verfügbar');
            }
            
            const response = await window.globalAI.callOpenAI([
                {
                    role: "system",
                    content: "Du bist ein Experte für Bewerbungsschreiben. Du analysierst Bewerberprofile und generierst präzise, überzeugende Sätze für Anschreiben."
                },
                {
                    role: "user",
                    content: prompt
                }
            ], {
                max_tokens: 1000,
                temperature: 0.7
            });
            
            return parseAISentenceResponse(response);
            
        } catch (error) {
            console.error('❌ AI generation failed:', error);
            return generateFallbackSentences(requirement, language);
        }
    }
    
    // Fallback Satzgenerierung
    async function generateFallbackSentences(requirement, language) {
        console.log('🔄 Generating fallback sentences...');
        
        const templates = [
            "Meine berufliche Erfahrung in {area} ermöglicht es mir, die Anforderung '{requirement}' erfolgreich zu erfüllen.",
            "Durch meine Expertise in {area} bringe ich die notwendigen Qualifikationen für '{requirement}' mit.",
            "Meine Fähigkeiten in {area} helfen mir dabei, bei '{requirement}' einen wertvollen Beitrag zu leisten.",
            "Mit meiner Leidenschaft für {area} kann ich die Herausforderung '{requirement}' optimal meistern.",
            "Durch meine praktische Erfahrung in {area} bin ich bestens auf '{requirement}' vorbereitet."
        ];
        
        const area = classifyRequirement(requirement.text);
        
        return templates.map((template, index) => ({
            id: `fallback_${Date.now()}_${index}`,
            text: template.replace('{area}', area).replace('{requirement}', requirement.text),
            approach: ['experience', 'expertise', 'skills', 'passion', 'practical'][index],
            confidence: 75 + Math.floor(Math.random() * 15),
            profileMatch: false,
            style: 'professional'
        }));
    }
    
    // Baue Profil-Prompt
    function buildProfilePrompt(requirement, profile, language) {
        const langName = language === 'de' ? 'Deutsch' : 'English';
        
        let profileContext = '';
        if (profile.skills && profile.skills.length > 0) {
            profileContext += `\nFÄHIGKEITEN:\n${profile.skills.map(skill => `- ${skill.category}: ${skill.items.join(', ')}`).join('\n')}`;
        }
        if (profile.strengths && profile.strengths.length > 0) {
            profileContext += `\nSTÄRKEN:\n${profile.strengths.map(s => `- ${s}`).join('\n')}`;
        }
        if (profile.experience && profile.experience.length > 0) {
            profileContext += `\nERFAHRUNG:\n${profile.experience.map(exp => `- ${exp}`).join('\n')}`;
        }
        
        return `
AUFGABE: Generiere 5 überzeugende Bewerbungssätze für eine Stellenanforderung basierend auf dem Bewerberprofil.

STELLENANFORDERUNG:
"${requirement.text}"

BEWERBERPROFIL:${profileContext}

GENERIERE 5 VERSCHIEDENE ANSÄTZE in ${langName}:
1. Fähigkeiten-fokussiert
2. Erfahrungs-basiert
3. Erfolgs-orientiert
4. Problem-Löser
5. Zukunfts-gerichtet

ANTWORTFORMAT - NUR JSON:
{
  "sentences": [
    {
      "text": "Satz hier...",
      "approach": "skills-focused",
      "confidence": 85,
      "profileMatch": true
    }
  ]
}

REGELN:
- Verwende ${langName}
- Integriere Profile-Elemente natürlich
- 15-30 Wörter pro Satz
- Authentisch und professionell
        `;
    }
    
    // Parse AI Response
    function parseAISentenceResponse(response) {
        try {
            let jsonStr = '';
            
            if (typeof response === 'string') {
                const jsonMatch = response.match(/\{[\s\S]*\}/);
                jsonStr = jsonMatch ? jsonMatch[0] : response;
            } else if (response && response.content) {
                jsonStr = response.content;
            } else if (response && response.choices && response.choices[0]) {
                jsonStr = response.choices[0].message.content;
            } else {
                jsonStr = JSON.stringify(response);
            }
            
            const parsed = JSON.parse(jsonStr);
            
            if (parsed.sentences && Array.isArray(parsed.sentences)) {
                return parsed.sentences.map((sentence, idx) => ({
                    id: `ai_${Date.now()}_${idx}`,
                    text: sentence.text,
                    approach: sentence.approach || 'ai-generated',
                    confidence: sentence.confidence || 85,
                    profileMatch: sentence.profileMatch !== false,
                    style: sentence.style || 'professional'
                }));
            }
            
            throw new Error('Invalid response format');
            
        } catch (error) {
            console.error('❌ Parse error:', error);
            throw new Error('Fehler beim Verarbeiten der KI-Antwort');
        }
    }
    
    // Zeige Satz-Ergebnisse
    function displaySentenceResults(container, sentences, requirementIndex) {
        container.innerHTML = `
            <div style="margin-bottom: 1rem;">
                <div style="display: flex; justify-content: between; align-items: center; margin-bottom: 0.75rem;">
                    <span style="font-weight: 500; color: #374151; font-size: 0.875rem;">
                        ✨ ${sentences.length} generierte Sätze
                    </span>
                    <button onclick="generateSentencesForRequirement_Step4('${requirementIndex}', this.getAttribute('data-requirement'))" 
                            data-requirement="${container.closest('.requirement-item')?.textContent?.trim() || ''}"
                            style="background: #f59e0b; color: white; border: none; border-radius: 4px; padding: 0.25rem 0.5rem; font-size: 0.75rem; cursor: pointer;">
                        <i class="fas fa-redo"></i> Neu generieren
                    </button>
                </div>
            </div>
            
            <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                ${sentences.map((sentence, idx) => `
                    <div class="sentence-option" style="
                        background: white; border: 2px solid ${sentence.profileMatch ? '#8b5cf6' : '#e5e7eb'}; 
                        border-radius: 8px; padding: 1rem; cursor: pointer; transition: all 0.2s;
                    " onclick="selectSentenceStep4('${sentence.id}', this)">
                        
                        <div style="display: flex; justify-content: between; align-items: flex-start; gap: 1rem;">
                            <div style="flex: 1;">
                                <p style="margin: 0 0 0.5rem; color: #374151; line-height: 1.5; font-weight: 500;">
                                    ${sentence.text}
                                </p>
                                
                                <div style="display: flex; gap: 1rem; font-size: 0.75rem; color: #6b7280;">
                                    <span><i class="fas fa-brain"></i> ${sentence.approach}</span>
                                    <span><i class="fas fa-chart-bar"></i> ${sentence.confidence}%</span>
                                    ${sentence.profileMatch ? '<span style="color: #8b5cf6;"><i class="fas fa-user-check"></i> Profil-basiert</span>' : ''}
                                </div>
                            </div>
                            
                            <div style="display: flex; gap: 0.5rem;">
                                <button onclick="useSentenceStep4('${sentence.id}', '${sentence.text.replace(/'/g, '\\'')}'); event.stopPropagation();" style="
                                    background: #10b981; color: white; border: none; border-radius: 4px;
                                    padding: 0.25rem 0.75rem; font-size: 0.75rem; cursor: pointer;
                                ">Verwenden</button>
                                <button onclick="improveSentenceStep4('${sentence.id}'); event.stopPropagation();" style="
                                    background: #6366f1; color: white; border: none; border-radius: 4px;
                                    padding: 0.25rem 0.75rem; font-size: 0.75rem; cursor: pointer;
                                ">Verbessern</button>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    // Zeige Fehler
    function showSentenceError(container, errorMessage) {
        container.innerHTML = `
            <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 1rem;">
                <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                    <i class="fas fa-exclamation-triangle" style="color: #ef4444;"></i>
                    <span style="font-weight: 500; color: #dc2626;">Satzgenerierung fehlgeschlagen</span>
                </div>
                <p style="margin: 0; color: #7f1d1d; font-size: 0.875rem;">
                    ${errorMessage}
                </p>
                <button onclick="location.reload()" style="
                    background: #ef4444; color: white; border: none; border-radius: 4px;
                    padding: 0.5rem 1rem; margin-top: 0.5rem; cursor: pointer; font-size: 0.875rem;
                ">Seite neu laden</button>
            </div>
        `;
    }
    
    // Utility-Funktionen
    function classifyRequirement(text) {
        const textLower = text.toLowerCase();
        
        if (textLower.includes('führung') || textLower.includes('leitung') || textLower.includes('team')) {
            return 'Führung und Management';
        } else if (textLower.includes('techni') || textLower.includes('software') || textLower.includes('programm')) {
            return 'Technische Fähigkeiten';
        } else if (textLower.includes('kommunikation') || textLower.includes('sprache') || textLower.includes('präsent')) {
            return 'Kommunikation';
        } else if (textLower.includes('projekt') || textLower.includes('organisation') || textLower.includes('planung')) {
            return 'Projektmanagement';
        } else {
            return 'Allgemeine Qualifikationen';
        }
    }
    
    function detectLanguage(text) {
        const germanWords = ['und', 'der', 'die', 'das', 'ist', 'mit', 'für', 'von', 'zu'];
        const englishWords = ['and', 'the', 'is', 'with', 'for', 'from', 'to', 'at'];
        
        const textLower = text.toLowerCase();
        const germanCount = germanWords.filter(word => textLower.includes(word)).length;
        const englishCount = englishWords.filter(word => textLower.includes(word)).length;
        
        return germanCount > englishCount ? 'de' : 'en';
    }
    
    // Global Functions
    window.generateSentencesForRequirement_Step4 = generateSentencesForRequirement_Step4;
    
    window.selectSentenceStep4 = function(sentenceId, element) {
        // Remove selection from siblings
        const siblings = element.parentNode.children;
        Array.from(siblings).forEach(sibling => {
            sibling.style.borderColor = '#e5e7eb';
            sibling.style.background = 'white';
        });
        
        // Select current
        element.style.borderColor = '#8b5cf6';
        element.style.background = '#f3f4f6';
    };
    
    window.useSentenceStep4 = function(sentenceId, sentenceText) {
        console.log('📝 Using sentence:', sentenceText);
        
        // Versuche den Satz in das Anschreiben zu integrieren
        const textarea = document.querySelector('#coverLetterContent, [contenteditable="true"], textarea');
        if (textarea) {
            if (textarea.contentEditable === 'true') {
                textarea.innerHTML += `<p>${sentenceText}</p>`;
            } else {
                textarea.value += '\n\n' + sentenceText;
            }
            
            // Show success message
            showSuccessMessage('Satz wurde hinzugefügt!');
        } else {
            // Copy to clipboard as fallback
            navigator.clipboard.writeText(sentenceText).then(() => {
                showSuccessMessage('Satz wurde in die Zwischenablage kopiert!');
            });
        }
    };
    
    window.improveSentenceStep4 = function(sentenceId) {
        console.log('✨ Improving sentence:', sentenceId);
        showSuccessMessage('Verbesserung wird entwickelt...');
    };
    
    function showSuccessMessage(message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed; top: 20px; right: 20px; z-index: 99999;
            background: #10b981; color: white; padding: 0.75rem 1rem; border-radius: 6px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2); font-size: 0.875rem;
        `;
        notification.innerHTML = `<i class="fas fa-check"></i> ${message}`;
        document.body.appendChild(notification);
        
        setTimeout(() => notification.remove(), 3000);
    }
    
    // Initialisierung
    function initialize() {
        console.log('📝 Step 4 Sentence Integration - Initializing...');
        
        monitorStep4();
        
        // Sofort prüfen ob Schritt 4 bereits vorhanden
        setTimeout(() => {
            enhanceStep4WithSentenceGeneration();
        }, 1000);
        
        console.log('✅ Step 4 Sentence Integration - Ready!');
    }
    
    // Starten
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }
    
    // Regelmäßige Überprüfung
    setInterval(() => {
        const step4 = document.querySelector('[data-step="4"]') || document.querySelector('.requirement-item');
        if (step4 && !step4.querySelector('.sentence-generation-section')) {
            enhanceStep4WithSentenceGeneration();
        }
    }, 3000);
    
    console.log('✅ Workflow Step 4 Sentence Integration - Loaded');
    
})();
