/**
 * Enhanced AI Sentence Generator
 * Generiert Bewerbungssätze basierend auf KI-Profil und Anforderungen
 */

(function() {
    'use strict';
    
    console.log('🤖 Enhanced Sentence Generator - Starting...');
    
    // Hauptfunktion für intelligente Satzgenerierung
    async function generateIntelligentSentences(requirement, forceGenerate = false) {
        console.log('🧠 Starte intelligente Satzgenerierung für:', requirement.text);
        
        try {
            // 1. Versuche KI-Profil zu laden
            const profile = await loadUserProfile();
            
            // 2. Lade Requirements für Kontext
            const allRequirements = getWorkflowRequirements();
            
            // 3. Erkenne Sprache
            const language = detectLanguageFromRequirement(requirement);
            
            // 4. Generiere Sätze
            if (profile && profile.skills && !forceGenerate) {
                console.log('✅ Verwende KI-Profil für personalisierte Sätze');
                return await generateProfileBasedSentences(requirement, profile, allRequirements, language);
            } else {
                console.log('⚠️ Kein Profil gefunden - verwende Standard-Generierung');
                return await generateFallbackSentences(requirement, allRequirements, language);
            }
            
        } catch (error) {
            console.error('❌ Fehler bei Satzgenerierung:', error);
            return generateEmergencyFallback(requirement);
        }
    }
    
    // Lade Benutzerprofil aus localStorage
    async function loadUserProfile() {
        try {
            // Versuche verschiedene Speicherorte
            const sources = [
                localStorage.getItem('userProfile'),
                localStorage.getItem('profileAnalysisResult'),
                localStorage.getItem('aiAnalysisResult'),
                localStorage.getItem('applicationDocuments')
            ];
            
            for (const source of sources) {
                if (source) {
                    const data = JSON.parse(source);
                    
                    // Prüfe auf KI-Analyse Ergebnisse
                    if (data.skills || data.strengths || data.competencies) {
                        console.log('✅ Benutzerprofil gefunden:', Object.keys(data));
                        return data;
                    }
                    
                    // Prüfe auf Dokumenten-basierte Daten
                    if (Array.isArray(data)) {
                        const analyzed = data.filter(doc => doc.analysis || doc.includeInAnalysis);
                        if (analyzed.length > 0) {
                            console.log('✅ Analysierte Dokumente gefunden:', analyzed.length);
                            return { documents: analyzed };
                        }
                    }
                }
            }
            
            console.log('⚠️ Kein Benutzerprofil gefunden');
            return null;
            
        } catch (error) {
            console.error('❌ Fehler beim Laden des Profils:', error);
            return null;
        }
    }
    
    // Lade Workflow-Anforderungen
    function getWorkflowRequirements() {
        try {
            if (window.workflowData && window.workflowData.requirements) {
                return window.workflowData.requirements;
            }
            
            const stored = localStorage.getItem('workflowData');
            if (stored) {
                const data = JSON.parse(stored);
                return data.requirements || [];
            }
            
            return [];
        } catch (error) {
            console.error('❌ Fehler beim Laden der Anforderungen:', error);
            return [];
        }
    }
    
    // Profil-basierte Satzgenerierung
    async function generateProfileBasedSentences(requirement, profile, allRequirements, language) {
        console.log('🎯 Generiere profilbasierte Sätze...');
        
        const prompt = buildIntelligentPrompt(requirement, profile, allRequirements, language);
        
        try {
            if (!window.globalAI || !window.globalAI.isAPIReady()) {
                throw new Error('OpenAI API nicht verfügbar');
            }
            
            const response = await window.globalAI.callOpenAI([
                {
                    role: "system",
                    content: "Du bist ein Experte für Bewerbungsschreiben und Personalberatung. Du analysierst Bewerberprofile und generierst präzise, überzeugende Sätze für Anschreiben, die perfekt auf die Stellenanforderungen abgestimmt sind."
                },
                {
                    role: "user", 
                    content: prompt
                }
            ], {
                max_tokens: 1200,
                temperature: 0.7
            });
            
            const result = parseAIResponse(response);
            
            if (result && result.sentences && result.sentences.length > 0) {
                console.log(`✅ ${result.sentences.length} profilbasierte Sätze generiert`);
                return result.sentences.map((sentence, idx) => ({
                    id: `ai_${Date.now()}_${idx}`,
                    text: sentence.text,
                    approach: sentence.approach || 'profile-based',
                    confidence: sentence.confidence || 85,
                    profileMatch: sentence.profileMatch || true,
                    style: sentence.style || 'professional',
                    wordCount: sentence.text.split(' ').length,
                    selected: idx === 0
                }));
            } else {
                throw new Error('Keine gültigen Sätze in AI Response');
            }
            
        } catch (error) {
            console.error('❌ OpenAI Fehler:', error);
            return await generateFallbackSentences(requirement, allRequirements, language);
        }
    }
    
    // Fallback ohne Profil
    async function generateFallbackSentences(requirement, allRequirements, language) {
        console.log('🔄 Generiere Fallback-Sätze ohne Profil...');
        
        const prompt = buildFallbackPrompt(requirement, allRequirements, language);
        
        try {
            if (window.globalAI && window.globalAI.isAPIReady()) {
                const response = await window.globalAI.callOpenAI([
                    {
                        role: "system",
                        content: "Du bist ein Experte für Bewerbungsschreiben. Generiere überzeugende, professionelle Sätze für Anschreiben basierend auf Stellenanforderungen."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ], {
                    max_tokens: 800,
                    temperature: 0.8
                });
                
                const result = parseAIResponse(response);
                
                if (result && result.sentences) {
                    console.log(`✅ ${result.sentences.length} Fallback-Sätze generiert`);
                    return result.sentences.map((sentence, idx) => ({
                        id: `fallback_${Date.now()}_${idx}`,
                        text: sentence.text,
                        approach: sentence.approach || 'general',
                        confidence: sentence.confidence || 75,
                        profileMatch: false,
                        style: 'professional',
                        wordCount: sentence.text.split(' ').length,
                        selected: idx === 0
                    }));
                }
            }
            
            // Ultimate Fallback
            return generateEmergencyFallback(requirement);
            
        } catch (error) {
            console.error('❌ Fallback Fehler:', error);
            return generateEmergencyFallback(requirement);
        }
    }
    
    // Intelligenter Prompt mit Profil
    function buildIntelligentPrompt(requirement, profile, allRequirements, language) {
        const langName = language === 'de' ? 'Deutsch' : language === 'en' ? 'English' : 'Deutsch';
        
        let profileContext = '';
        if (profile.skills && profile.skills.length > 0) {
            profileContext += `\nFÄHIGKEITEN/KOMPETENZEN:\n${profile.skills.map(skill => `- ${skill.category}: ${skill.items.join(', ')}`).join('\n')}`;
        }
        if (profile.strengths && profile.strengths.length > 0) {
            profileContext += `\nSTÄRKEN:\n${profile.strengths.map(s => `- ${s}`).join('\n')}`;
        }
        if (profile.writingStyle) {
            profileContext += `\nSCHREIBSTIL:\n- Ton: ${profile.writingStyle.tone}\n- Stil: ${profile.writingStyle.vocabulary}\n- Struktur: ${profile.writingStyle.structure}`;
        }
        if (profile.experience && profile.experience.length > 0) {
            profileContext += `\nBERUFSERFAHRUNG:\n${profile.experience.map(exp => `- ${exp}`).join('\n')}`;
        }
        
        const contextRequirements = allRequirements.slice(0, 5).map(req => `- ${req.text} (${req.importance ? 'Wichtig' : 'Optional'})`).join('\n');
        
        return `
AUFGABE: Generiere 5 verschiedene überzeugende Bewerbungssätze für eine spezifische Stellenanforderung, basierend auf dem detaillierten Bewerberprofil.

AKTUELLE STELLENANFORDERUNG:
"${requirement.text}"
Kategorie: ${requirement.category || 'Unbekannt'}
Wichtigkeit: ${requirement.importance ? 'Hoch' : 'Standard'}

DETAILLIERTES BEWERBERPROFIL:${profileContext}

KONTEXT - WEITERE STELLENANFORDERUNGEN:
${contextRequirements}

ANWEISUNGEN:
1. Nutze das Bewerberprofil aktiv - verweise auf spezifische Fähigkeiten, Stärken und Erfahrungen
2. Stelle direkte Verbindungen zwischen Profil und Anforderung her
3. Verwende den angegebenen Schreibstil und Ton
4. Generiere 5 unterschiedliche Ansätze:
   - Fähigkeiten-fokussiert (zeige relevante Skills)
   - Erfahrungs-basiert (nutze konkrete Erfahrungen)
   - Erfolgs-orientiert (betone Achievements)
   - Problem-Löser (zeige wie du die Anforderung erfüllst)
   - Zukunfts-gerichtet (Potenzial und Entwicklung)

WICHTIGE REGELN:
- Verwende ${langName} als Sprache
- Integriere Keywords aus der Anforderung natürlich
- Bleibe authentisch und vermeide Übertreibungen
- Verwende "ich" und erste Person
- Jeder Satz sollte 15-30 Wörter haben
- Mache konkrete Verbindungen zum Profil

ANTWORTFORMAT - NUR JSON:
{
  "sentences": [
    {
      "text": "Meine ausgeprägte Expertise in [spezifische Fähigkeit aus Profil] ermöglicht es mir, [Anforderung] erfolgreich umzusetzen und dabei [konkreter Mehrwert] zu schaffen.",
      "approach": "skills-focused",
      "confidence": 92,
      "profileMatch": true,
      "style": "professional",
      "profileConnection": "Bezug zu [spezifische Profilfähigkeit]"
    }
  ]
}
        `;
    }
    
    // Fallback Prompt ohne Profil
    function buildFallbackPrompt(requirement, allRequirements, language) {
        const langName = language === 'de' ? 'Deutsch' : 'English';
        const contextReqs = allRequirements.slice(0, 3).map(req => `- ${req.text}`).join('\n');
        
        return `
AUFGABE: Generiere 5 professionelle Bewerbungssätze für eine Stellenanforderung.

STELLENANFORDERUNG:
"${requirement.text}"

KONTEXT:
${contextReqs}

Generiere 5 verschiedene Ansätze in ${langName}:
1. Erfahrungs-basiert
2. Kompetenz-fokussiert  
3. Lösungs-orientiert
4. Motivations-getrieben
5. Ergebnis-orientiert

JSON Format:
{
  "sentences": [
    {
      "text": "...",
      "approach": "...",
      "confidence": 80
    }
  ]
}
        `;
    }
    
    // Emergency Fallback
    function generateEmergencyFallback(requirement) {
        console.log('🚨 Verwende Emergency Fallback');
        
        const templates = [
            "Meine berufliche Erfahrung und Expertise ermöglichen es mir, die Anforderung '{text}' erfolgreich zu erfüllen.",
            "Durch meine bisherige Tätigkeit konnte ich umfassende Kenntnisse in '{text}' entwickeln.",
            "Ich bringe die notwendigen Qualifikationen mit, um bei '{text}' einen wertvollen Beitrag zu leisten.",
            "Meine Fähigkeiten in '{text}' helfen mir dabei, innovative Lösungen zu entwickeln.",
            "Mit meiner Leidenschaft für '{text}' kann ich Ihr Team optimal unterstützen."
        ];
        
        return templates.map((template, idx) => ({
            id: `emergency_${Date.now()}_${idx}`,
            text: template.replace('{text}', requirement.text),
            approach: 'emergency',
            confidence: 70,
            profileMatch: false,
            style: 'professional',
            wordCount: template.split(' ').length,
            selected: idx === 0
        }));
    }
    
    // Parse AI Response
    function parseAIResponse(response) {
        try {
            // Versuche verschiedene Response-Formate
            let jsonStr = '';
            
            if (typeof response === 'string') {
                // Extrahiere JSON aus String
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
            
            // Validiere Struktur
            if (parsed.sentences && Array.isArray(parsed.sentences)) {
                return parsed;
            } else {
                throw new Error('Ungültiges Response-Format');
            }
            
        } catch (error) {
            console.error('❌ Response Parse Error:', error);
            console.error('❌ Raw response:', response);
            return null;
        }
    }
    
    // Sprache erkennen
    function detectLanguageFromRequirement(requirement) {
        const text = requirement.text.toLowerCase();
        
        // Einfache Spracherkennung
        const germanWords = ['und', 'der', 'die', 'das', 'ist', 'mit', 'für', 'von', 'zu', 'bei', 'erfahrung', 'kenntnisse'];
        const englishWords = ['and', 'the', 'is', 'with', 'for', 'from', 'to', 'at', 'experience', 'knowledge', 'skills'];
        
        const germanCount = germanWords.filter(word => text.includes(word)).length;
        const englishCount = englishWords.filter(word => text.includes(word)).length;
        
        return germanCount > englishCount ? 'de' : 'en';
    }
    
    // Integration in bestehende UI
    function integrateWithWorkflow() {
        // Überschreibe existierende Satzgenerierung
        if (window.generateAISentences) {
            window.originalGenerateAISentences = window.generateAISentences;
        }
        
        window.generateAISentences = async function(requirement, userProfile, stylePreferences) {
            console.log('🔀 Enhanced AI Sentence Generation aufgerufen');
            return await generateIntelligentSentences(requirement, false);
        };
        
        // Button-Handler für "Generiere Sätze"
        window.generateSentencesForRequirement = async function(requirementId) {
            console.log('🎯 Generiere Sätze für Anforderung:', requirementId);
            
            // Finde Anforderung
            const requirements = getWorkflowRequirements();
            const requirement = requirements.find(req => req.id === requirementId) || 
                              requirements.find(req => req.text.includes(requirementId)) ||
                              { text: requirementId, id: requirementId };
            
            if (!requirement) {
                console.error('❌ Anforderung nicht gefunden:', requirementId);
                return;
            }
            
            // Zeige Loading
            const container = document.querySelector(`[data-requirement-id="${requirementId}"] .sentence-suggestions`) ||
                            document.querySelector('.sentence-suggestions');
            
            if (container) {
                container.innerHTML = '<p><i class="fas fa-spinner fa-spin"></i> KI generiert personalisierte Sätze...</p>';
            }
            
            try {
                const sentences = await generateIntelligentSentences(requirement);
                
                if (container) {
                    renderSentenceSuggestions(container, sentences, requirement);
                }
                
                console.log(`✅ ${sentences.length} Sätze generiert und angezeigt`);
                
            } catch (error) {
                console.error('❌ Satzgenerierung fehlgeschlagen:', error);
                
                if (container) {
                    container.innerHTML = `
                        <div style="color: #ef4444; padding: 1rem; background: #fef2f2; border-radius: 6px;">
                            <i class="fas fa-exclamation-triangle"></i> Satzgenerierung fehlgeschlagen: ${error.message}
                            <br><small>Versuchen Sie es erneut oder prüfen Sie Ihre OpenAI API-Einstellungen.</small>
                        </div>
                    `;
                }
            }
        };
        
        console.log('✅ Workflow Integration abgeschlossen');
    }
    
    // Render Sentence Suggestions
    function renderSentenceSuggestions(container, sentences, requirement) {
        const html = `
            <div style="background: #f8fafc; padding: 1.5rem; border-radius: 8px; margin-top: 1rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                    <h5 style="margin: 0; color: #374151;">
                        <i class="fas fa-magic" style="color: #8b5cf6;"></i>
                        KI-generierte Sätze
                    </h5>
                    <span style="font-size: 0.75rem; color: #6b7280; background: #e5e7eb; padding: 0.25rem 0.5rem; border-radius: 4px;">
                        ${sentences.length} Vorschläge
                    </span>
                </div>
                
                <div style="display: flex; flex-direction: column; gap: 1rem;">
                    ${sentences.map((sentence, idx) => `
                        <div class="sentence-option" style="
                            background: white; border: 2px solid ${sentence.profileMatch ? '#8b5cf6' : '#e5e7eb'}; 
                            border-radius: 8px; padding: 1rem; cursor: pointer; transition: all 0.2s;
                            ${sentence.selected ? 'border-color: #8b5cf6; background: #f3f4f6;' : ''}
                        " onclick="selectSentence('${sentence.id}', this)">
                            
                            <div style="display: flex; justify-content: between; align-items: flex-start; gap: 1rem;">
                                <div style="flex: 1;">
                                    <p style="margin: 0 0 0.5rem; color: #374151; line-height: 1.5; font-weight: 500;">
                                        ${sentence.text}
                                    </p>
                                    
                                    <div style="display: flex; gap: 1rem; font-size: 0.75rem; color: #6b7280;">
                                        <span><i class="fas fa-brain"></i> ${sentence.approach}</span>
                                        <span><i class="fas fa-chart-bar"></i> ${sentence.confidence}% Match</span>
                                        <span><i class="fas fa-edit"></i> ${sentence.wordCount} Wörter</span>
                                        ${sentence.profileMatch ? '<span style="color: #8b5cf6;"><i class="fas fa-user-check"></i> Profil-basiert</span>' : ''}
                                    </div>
                                </div>
                                
                                <div style="display: flex; gap: 0.5rem;">
                                    <button onclick="useSentence('${sentence.id}'); event.stopPropagation();" style="
                                        background: #10b981; color: white; border: none; border-radius: 4px;
                                        padding: 0.25rem 0.75rem; font-size: 0.75rem; cursor: pointer;
                                    ">Verwenden</button>
                                    <button onclick="improveWithAI('${sentence.id}'); event.stopPropagation();" style="
                                        background: #6366f1; color: white; border: none; border-radius: 4px;
                                        padding: 0.25rem 0.75rem; font-size: 0.75rem; cursor: pointer;
                                    ">Verbessern</button>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #e5e7eb;">
                    <button onclick="generateSentencesForRequirement('${requirement.id || requirement.text}')" style="
                        background: #f59e0b; color: white; border: none; border-radius: 6px;
                        padding: 0.5rem 1rem; cursor: pointer; font-size: 0.875rem;
                    "><i class="fas fa-redo"></i> Neue Sätze generieren</button>
                </div>
            </div>
        `;
        
        container.innerHTML = html;
    }
    
    // Global Functions
    window.selectSentence = function(sentenceId, element) {
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
    
    window.useSentence = function(sentenceId) {
        console.log('📝 Verwende Satz:', sentenceId);
        // Integration mit Anschreiben-Editor
        // TODO: Implementation je nach Editor-System
    };
    
    window.improveWithAI = function(sentenceId) {
        console.log('✨ Verbessere Satz:', sentenceId);
        // TODO: AI Improvement Implementation
    };
    
    // Globale Funktionen
    window.generateIntelligentSentences = generateIntelligentSentences;
    window.generateSentencesForRequirement = window.generateSentencesForRequirement;
    
    // Initialisierung
    function initialize() {
        console.log('🤖 Enhanced Sentence Generator - Initialisiere...');
        
        integrateWithWorkflow();
        
        console.log('✅ Enhanced Sentence Generator - Bereit!');
    }
    
    // Starten
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }
    
    console.log('✅ Enhanced Sentence Generator - Geladen');
    
})();
