/**
 * AI Sentence Generator
 * Intelligente, mehrsprachige Satzgenerierung und Umformulierung
 */

(function() {
    'use strict';
    
    console.log('🤖 AI Sentence Generator - Loading...');
    
    // Language detection patterns
    const LANGUAGE_PATTERNS = {
        'de': {
            patterns: ['der', 'die', 'das', 'und', 'ist', 'sie', 'haben', 'werden', 'mit', 'von', 'zu', 'auf', 'für', 'ich', 'wir', 'sehr', 'können', 'möchten', 'erfahrung', 'kenntnisse'],
            name: 'Deutsch'
        },
        'en': {
            patterns: ['the', 'and', 'you', 'that', 'was', 'for', 'are', 'with', 'his', 'they', 'have', 'this', 'will', 'can', 'experience', 'skills', 'knowledge', 'responsible', 'management'],
            name: 'English'
        },
        'fr': {
            patterns: ['le', 'de', 'et', 'une', 'dans', 'que', 'pour', 'avec', 'sur', 'être', 'avoir', 'vous', 'expérience', 'compétences', 'responsable'],
            name: 'Français'
        },
        'es': {
            patterns: ['que', 'de', 'la', 'el', 'en', 'y', 'un', 'es', 'se', 'no', 'te', 'lo', 'le', 'da', 'su', 'por', 'son', 'con', 'para', 'experiencia', 'habilidades'],
            name: 'Español'
        },
        'it': {
            patterns: ['che', 'di', 'la', 'il', 'e', 'in', 'un', 'è', 'per', 'non', 'mi', 'ma', 'si', 'lo', 'da', 'con', 'sono', 'esperienza', 'competenze'],
            name: 'Italiano'
        }
    };
    
    // Sentence style templates for different languages
    const STYLE_TEMPLATES = {
        de: {
            achievement: {
                templates: [
                    "Durch meine {experience} konnte ich erfolgreich {achievement} und dabei {result} erreichen.",
                    "In meiner Position als {role} habe ich {achievement} und somit {impact} erzielt.",
                    "Meine {years}jährige Erfahrung in {field} ermöglichte es mir, {achievement} zu realisieren.",
                    "Als {role} war ich verantwortlich für {responsibility} und konnte dabei {result} erreichen."
                ],
                connectors: ["Dabei", "Außerdem", "Zusätzlich", "Darüber hinaus", "Ferner"],
                endings: ["Diese Erfahrung qualifiziert mich optimal für Ihre Anforderungen.", "Dies entspricht genau Ihren Anforderungen.", "Somit bringe ich die gewünschten Qualifikationen mit."]
            },
            motivation: {
                templates: [
                    "Besonders reizt mich an dieser Position die Möglichkeit, {opportunity} und dabei {goal} zu erreichen.",
                    "Ihre Stellenausschreibung hat mein Interesse geweckt, da {reason} und ich meine {skills} einsetzen kann.",
                    "Die Herausforderung, {challenge} zu bewältigen, motiviert mich besonders.",
                    "Ich bin überzeugt, dass meine {qualities} ideal zu Ihren Anforderungen passen."
                ]
            },
            skill: {
                templates: [
                    "Meine Kompetenzen in {skill} umfassen {details} und ermöglichen es mir, {application}.",
                    "Durch meine Expertise in {area} kann ich {contribution} und {benefit} bieten.",
                    "Meine fundierte Erfahrung mit {technology} befähigt mich, {task} erfolgreich umzusetzen."
                ]
            }
        },
        en: {
            achievement: {
                templates: [
                    "Through my {experience}, I successfully {achievement} and achieved {result}.",
                    "In my role as {role}, I {achievement} and delivered {impact}.",
                    "My {years} years of experience in {field} enabled me to {achievement}.",
                    "As {role}, I was responsible for {responsibility} and achieved {result}."
                ],
                connectors: ["Furthermore", "Additionally", "Moreover", "In addition", "Also"],
                endings: ["This experience qualifies me perfectly for your requirements.", "This aligns exactly with your needs.", "Thus, I bring the desired qualifications."]
            },
            motivation: {
                templates: [
                    "I am particularly excited about this position because of the opportunity to {opportunity} and {goal}.",
                    "Your job posting caught my interest because {reason} and I can apply my {skills}.",
                    "The challenge of {challenge} particularly motivates me.",
                    "I am convinced that my {qualities} are ideal for your requirements."
                ]
            },
            skill: {
                templates: [
                    "My competencies in {skill} include {details} and enable me to {application}.",
                    "Through my expertise in {area}, I can provide {contribution} and {benefit}.",
                    "My solid experience with {technology} qualifies me to successfully implement {task}."
                ]
            }
        }
    };
    
    // Detect language of text
    function detectLanguage(text) {
        if (!text || text.length < 10) return 'de'; // Default to German
        
        const cleanText = text.toLowerCase().replace(/[^\w\s]/g, ' ');
        const words = cleanText.split(/\s+/).filter(word => word.length > 2);
        
        const scores = {};
        
        Object.entries(LANGUAGE_PATTERNS).forEach(([lang, config]) => {
            scores[lang] = 0;
            config.patterns.forEach(pattern => {
                const matches = words.filter(word => word.includes(pattern)).length;
                scores[lang] += matches;
            });
        });
        
        const detectedLang = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
        console.log(`🌍 Language detected: ${LANGUAGE_PATTERNS[detectedLang].name} (${detectedLang})`);
        return detectedLang;
    }
    
    // Enhanced sentence generation with AI
    async function generateSentenceSuggestionsEnhanced(requirements, userProfile, options = {}) {
        console.log('🤖 Starting enhanced sentence generation...');
        
        if (!requirements || requirements.length === 0) {
            throw new Error('Keine Anforderungen für Satzgenerierung verfügbar');
        }
        
        // Detect language from requirements
        const sampleText = requirements.map(req => req.text).join(' ');
        const detectedLang = detectLanguage(sampleText);
        const targetLang = options.language || detectedLang;
        
        console.log(`🌍 Target language: ${LANGUAGE_PATTERNS[targetLang]?.name || targetLang}`);
        
        const allSuggestions = [];
        
        for (const requirement of requirements) {
            try {
                const suggestions = await generateSentencesForRequirement(requirement, userProfile, targetLang, options);
                allSuggestions.push({
                    requirement,
                    suggestions,
                    language: targetLang
                });
            } catch (error) {
                console.error(`❌ Error generating sentences for requirement: ${requirement.id}`, error);
                // Add fallback sentences
                allSuggestions.push({
                    requirement,
                    suggestions: generateFallbackSentences(requirement, userProfile, targetLang),
                    language: targetLang
                });
            }
        }
        
        return allSuggestions;
    }
    
    // Generate sentences for a specific requirement
    async function generateSentencesForRequirement(requirement, userProfile, language, options) {
        console.log(`🎯 Generating sentences for: ${requirement.text.substring(0, 50)}...`);
        
        const prompt = buildMultilingualPrompt(requirement, userProfile, language, options);
        
        try {
            const response = await callAIForSentences(prompt, language);
            return parseAISentenceResponse(response, requirement, language);
        } catch (error) {
            console.error('❌ AI sentence generation failed:', error);
            return generateFallbackSentences(requirement, userProfile, language);
        }
    }
    
    // Build multilingual prompt
    function buildMultilingualPrompt(requirement, userProfile, language, options) {
        const langConfig = getLanguageConfig(language);
        
        const prompt = `
${langConfig.systemPrompt}

AUFGABE: Generiere 5 verschiedene Sätze für ein Anschreiben basierend auf der folgenden Stellenanforderung.

STELLENANFORDERUNG:
"${requirement.text}"

BEWERBER-PROFIL:
${buildUserProfileContext(userProfile, language)}

GEWÜNSCHTER STIL: ${options.style || 'professional'}
TONALITÄT: ${options.tone || 'confident'}
SPRACHE: ${langConfig.name}

GENERIERE 5 SÄTZE MIT UNTERSCHIEDLICHEN ANSÄTZEN:
1. Erfahrungs-basiert (zeige relevante Erfahrung)
2. Kompetenz-fokussiert (betone spezifische Fähigkeiten)
3. Erfolgs-orientiert (nenne konkrete Erfolge)
4. Motivations-getrieben (zeige Interesse und Passion)
5. Zukunfts-ausgerichtet (betone Potenzial und Ziele)

ANTWORTFORMAT - Gib AUSSCHLIESSLICH ein JSON-Objekt zurück:
{
  "sentences": [
    {
      "text": "Satz 1 Text hier...",
      "approach": "experience",
      "confidence": 85,
      "wordCount": 25,
      "style": "professional"
    },
    {
      "text": "Satz 2 Text hier...",
      "approach": "competence",
      "confidence": 90,
      "wordCount": 22,
      "style": "confident"
    }
    // ... 3 weitere Sätze
  ],
  "language": "${language}",
  "context": "job_application"
}

WICHTIG:
- Verwende ${langConfig.name} als Antwortsprache
- Formuliere präzise und überzeugend
- Integriere Keywords aus der Anforderung
- Nutze professionelle, aber persönliche Sprache
- Vermeide Übertreibungen und Klischees
        `;
        
        return prompt;
    }
    
    // Get language configuration
    function getLanguageConfig(language) {
        const configs = {
            'de': {
                name: 'Deutsch',
                systemPrompt: 'Du bist ein Experte für deutsche Bewerbungsschreiben und formulierst überzeugende, professionelle Sätze für Anschreiben.',
                placeholder: 'Beschreiben Sie hier Ihre Erfahrung...',
                improveButton: 'Mit KI umformulieren',
                generateButton: 'Sätze generieren'
            },
            'en': {
                name: 'English',
                systemPrompt: 'You are an expert in English cover letter writing and formulate convincing, professional sentences for job applications.',
                placeholder: 'Describe your experience here...',
                improveButton: 'Rephrase with AI',
                generateButton: 'Generate sentences'
            },
            'fr': {
                name: 'Français',
                systemPrompt: 'Vous êtes un expert en rédaction de lettres de motivation françaises et formulez des phrases convaincantes et professionnelles.',
                placeholder: 'Décrivez votre expérience ici...',
                improveButton: 'Reformuler avec IA',
                generateButton: 'Générer des phrases'
            },
            'es': {
                name: 'Español',
                systemPrompt: 'Eres un experto en redacción de cartas de presentación en español y formulas oraciones convincentes y profesionales.',
                placeholder: 'Describe tu experiencia aquí...',
                improveButton: 'Reformular con IA',
                generateButton: 'Generar oraciones'
            },
            'it': {
                name: 'Italiano',
                systemPrompt: 'Sei un esperto nella scrittura di lettere di presentazione italiane e formuli frasi convincenti e professionali.',
                placeholder: 'Descrivi la tua esperienza qui...',
                improveButton: 'Riformulare con IA',
                generateButton: 'Genera frasi'
            }
        };
        
        return configs[language] || configs['de'];
    }
    
    // Build user profile context
    function buildUserProfileContext(userProfile, language) {
        if (!userProfile) return 'Kein Profil verfügbar';
        
        const context = [];
        
        if (userProfile.experience) {
            context.push(`Berufserfahrung: ${userProfile.experience}`);
        }
        
        if (userProfile.skills && userProfile.skills.length > 0) {
            context.push(`Kompetenzen: ${userProfile.skills.join(', ')}`);
        }
        
        if (userProfile.achievements && userProfile.achievements.length > 0) {
            context.push(`Erfolge: ${userProfile.achievements.join(', ')}`);
        }
        
        if (userProfile.education) {
            context.push(`Ausbildung: ${userProfile.education}`);
        }
        
        return context.length > 0 ? context.join('\n') : 'Allgemeine Berufserfahrung und Kompetenzen';
    }
    
    // Call AI for sentence generation
    async function callAIForSentences(prompt, language) {
        if (!window.globalAI || !window.globalAI.callOpenAI) {
            throw new Error('AI Service nicht verfügbar');
        }
        
        const messages = [
            {
                role: "system",
                content: `Du bist ein Experte für Bewerbungsschreiben in ${getLanguageConfig(language).name}. Du erstellst überzeugende, professionelle Sätze, die genau auf Stellenanforderungen zugeschnitten sind. Antworte AUSSCHLIESSLICH mit dem angeforderten JSON-Format.`
            },
            {
                role: "user",
                content: prompt
            }
        ];
        
        return await window.globalAI.callOpenAI(messages, {
            max_tokens: 1500,
            temperature: 0.7,
            presence_penalty: 0.1,
            frequency_penalty: 0.2
        });
    }
    
    // Parse AI sentence response
    function parseAISentenceResponse(response, requirement, language) {
        try {
            let parsedResponse;
            
            if (typeof response === 'string') {
                const jsonMatch = response.match(/\{[\s\S]*\}/);
                const jsonStr = jsonMatch ? jsonMatch[0] : response;
                parsedResponse = JSON.parse(jsonStr);
            } else if (response && response.content) {
                const jsonMatch = response.content.match(/\{[\s\S]*\}/);
                const jsonStr = jsonMatch ? jsonMatch[0] : response.content;
                parsedResponse = JSON.parse(jsonStr);
            } else {
                parsedResponse = response;
            }
            
            if (!parsedResponse.sentences || !Array.isArray(parsedResponse.sentences)) {
                throw new Error('Invalid response format');
            }
            
            return parsedResponse.sentences.map((sentence, index) => ({
                id: `sent_${Date.now()}_${index}`,
                text: sentence.text,
                approach: sentence.approach || 'general',
                confidence: sentence.confidence || 80,
                wordCount: sentence.wordCount || sentence.text.split(' ').length,
                style: sentence.style || 'professional',
                language: language,
                requirement: requirement.id,
                selected: index === 0
            }));
            
        } catch (error) {
            console.error('❌ Error parsing AI response:', error);
            throw new Error('Fehler beim Verarbeiten der KI-Antwort');
        }
    }
    
    // Generate fallback sentences when AI fails
    function generateFallbackSentences(requirement, userProfile, language) {
        console.log('🔄 Generating fallback sentences...');
        
        const templates = STYLE_TEMPLATES[language] || STYLE_TEMPLATES['de'];
        const sentences = [];
        
        // Generate experience-based sentence
        sentences.push({
            id: `sent_fallback_${Date.now()}_0`,
            text: language === 'en' ? 
                `My experience in this area enables me to meet this requirement effectively.` :
                `Meine Erfahrung in diesem Bereich ermöglicht es mir, diese Anforderung erfolgreich zu erfüllen.`,
            approach: 'experience',
            confidence: 75,
            wordCount: 12,
            style: 'professional',
            language: language,
            requirement: requirement.id,
            selected: true
        });
        
        // Generate competence-based sentence
        sentences.push({
            id: `sent_fallback_${Date.now()}_1`,
            text: language === 'en' ? 
                `Through my expertise, I can contribute significantly to achieving these goals.` :
                `Durch meine Fachkompetenz kann ich wesentlich zur Erreichung dieser Ziele beitragen.`,
            approach: 'competence',
            confidence: 72,
            wordCount: 11,
            style: 'confident',
            language: language,
            requirement: requirement.id,
            selected: false
        });
        
        // Generate motivation-based sentence
        sentences.push({
            id: `sent_fallback_${Date.now()}_2`,
            text: language === 'en' ? 
                `This challenge particularly motivates me to apply my skills effectively.` :
                `Diese Herausforderung motiviert mich besonders, meine Fähigkeiten gezielt einzusetzen.`,
            approach: 'motivation',
            confidence: 78,
            wordCount: 10,
            style: 'passionate',
            language: language,
            requirement: requirement.id,
            selected: false
        });
        
        return sentences;
    }
    
    // Improve existing text with AI
    async function improveTextWithAI(text, language, style = 'professional') {
        console.log('✨ Improving text with AI...');
        
        if (!text || text.trim() === '') {
            // Generate new sentence when no text provided
            return await generateEmptySentence(language, style);
        }
        
        const langConfig = getLanguageConfig(language);
        
        const prompt = `
${langConfig.systemPrompt}

AUFGABE: Verbessere den folgenden Satz für ein Bewerbungsanschreiben.

URSPRÜNGLICHER SATZ:
"${text}"

ZIEL-STIL: ${style}
SPRACHE: ${langConfig.name}

VERBESSERUNGSRICHTLINIEN:
- Präziser und überzeugender formulieren
- Professionelle aber persönliche Sprache
- Konkrete statt abstrakte Begriffe
- Aktive statt passive Formulierungen
- Optimale Länge (15-25 Wörter)
- Keywords und Fachbegriffe integrieren

ANTWORTFORMAT - Gib AUSSCHLIESSLICH ein JSON-Objekt zurück:
{
  "original": "${text}",
  "improved": "Verbesserter Satz hier...",
  "improvements": [
    "Verbesserung 1 beschreibung",
    "Verbesserung 2 beschreibung"
  ],
  "confidence": 85,
  "language": "${language}",
  "style": "${style}"
}

Formuliere den verbesserten Satz in ${langConfig.name}.
        `;
        
        try {
            const response = await callAIForSentences(prompt, language);
            return parseImprovementResponse(response, text, language);
        } catch (error) {
            console.error('❌ Text improvement failed:', error);
            return generateFallbackImprovement(text, language, style);
        }
    }
    
    // Generate sentence when textarea is empty
    async function generateEmptySentence(language, style) {
        const langConfig = getLanguageConfig(language);
        
        const prompt = `
Generiere einen professionellen Satz für ein Bewerbungsanschreiben in ${langConfig.name}.

STIL: ${style}
LÄNGE: 15-25 Wörter
INHALT: Allgemeine Kompetenz oder Motivation

ANTWORTFORMAT - Gib AUSSCHLIESSLICH ein JSON-Objekt zurück:
{
  "improved": "Neuer Satz hier...",
  "confidence": 80,
  "language": "${language}",
  "style": "${style}",
  "type": "generated"
}
        `;
        
        try {
            const response = await callAIForSentences(prompt, language);
            const parsed = JSON.parse(typeof response === 'string' ? response : response.content);
            return {
                original: '',
                improved: parsed.improved,
                improvements: ['Neuer Satz generiert'],
                confidence: parsed.confidence || 80,
                language: language,
                style: style,
                type: 'generated'
            };
        } catch (error) {
            console.error('❌ Empty sentence generation failed:', error);
            return {
                original: '',
                improved: language === 'en' ? 
                    'My professional experience and dedication make me an ideal candidate for this position.' :
                    'Meine berufliche Erfahrung und Engagement machen mich zum idealen Kandidaten für diese Position.',
                improvements: ['Standardsatz generiert'],
                confidence: 75,
                language: language,
                style: style,
                type: 'fallback'
            };
        }
    }
    
    // Parse improvement response
    function parseImprovementResponse(response, originalText, language) {
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
            
            return {
                original: originalText,
                improved: parsed.improved,
                improvements: parsed.improvements || ['Text verbessert'],
                confidence: parsed.confidence || 80,
                language: language,
                style: parsed.style || 'professional'
            };
            
        } catch (error) {
            console.error('❌ Error parsing improvement response:', error);
            return generateFallbackImprovement(originalText, language, 'professional');
        }
    }
    
    // Generate fallback improvement
    function generateFallbackImprovement(text, language, style) {
        const improved = text.charAt(0).toUpperCase() + text.slice(1);
        
        return {
            original: text,
            improved: improved,
            improvements: ['Text geringfügig verbessert'],
            confidence: 70,
            language: language,
            style: style,
            type: 'fallback'
        };
    }
    
    // Enhanced UI rendering for sentence suggestions
    function renderEnhancedSentenceSuggestions(suggestionsData, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        if (!suggestionsData || suggestionsData.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: #6b7280;">
                    <i class="fas fa-lightbulb" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                    <p>Keine Satzvorschläge verfügbar</p>
                </div>
            `;
            return;
        }
        
        let html = `
            <div class="sentence-suggestions-enhanced">
                <h4 style="margin: 0 0 1.5rem; color: #374151; display: flex; align-items: center; gap: 0.5rem;">
                    <i class="fas fa-magic"></i>
                    KI-generierte Satzvorschläge (${suggestionsData[0]?.language ? LANGUAGE_PATTERNS[suggestionsData[0].language].name : 'Mehrsprachig'})
                </h4>
        `;
        
        suggestionsData.forEach((reqData, reqIndex) => {
            const req = reqData.requirement;
            const suggestions = reqData.suggestions;
            
            html += `
                <div class="requirement-suggestions" style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; margin-bottom: 1.5rem; overflow: hidden;">
                    <div class="requirement-header" style="background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 1rem;">
                        <h5 style="margin: 0; font-weight: 600;">📋 ${req.text}</h5>
                        <div style="display: flex; gap: 1rem; margin-top: 0.5rem; font-size: 0.875rem; opacity: 0.9;">
                            <span>💡 ${suggestions.length} Vorschläge</span>
                            <span>🌍 ${LANGUAGE_PATTERNS[reqData.language]?.name || reqData.language}</span>
                        </div>
                    </div>
                    
                    <div class="suggestions-list" style="padding: 1rem;">
                        ${suggestions.map((suggestion, index) => `
                            <div class="suggestion-item ${suggestion.selected ? 'selected' : ''}" 
                                 style="border: 2px solid ${suggestion.selected ? '#6366f1' : '#e5e7eb'}; 
                                        border-radius: 8px; padding: 1rem; margin-bottom: 1rem; 
                                        cursor: pointer; transition: all 0.3s ease;
                                        background: ${suggestion.selected ? '#f0f9ff' : 'white'};"
                                 onclick="selectSuggestion('${suggestion.id}', ${reqIndex}, ${index})">
                                
                                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem;">
                                    <div style="flex: 1;">
                                        <div style="font-weight: 500; color: #374151; line-height: 1.5; margin-bottom: 0.5rem;">
                                            ${suggestion.text}
                                        </div>
                                        <div style="display: flex; gap: 1rem; font-size: 0.75rem; color: #6b7280;">
                                            <span>🎯 ${suggestion.approach}</span>
                                            <span>📏 ${suggestion.wordCount} Wörter</span>
                                            <span>🎨 ${suggestion.style}</span>
                                        </div>
                                    </div>
                                    <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 0.5rem;">
                                        <div style="background: ${getConfidenceColor(suggestion.confidence)}; 
                                                    color: white; padding: 0.25rem 0.75rem; border-radius: 12px; 
                                                    font-size: 0.75rem; font-weight: 600;">
                                            ${suggestion.confidence}%
                                        </div>
                                        <button onclick="event.stopPropagation(); improveSentence('${suggestion.id}', '${suggestion.text}', '${reqData.language}')" 
                                                style="background: #f59e0b; color: white; border: none; padding: 0.25rem 0.75rem; 
                                                       border-radius: 6px; font-size: 0.75rem; cursor: pointer;"
                                                title="Mit KI umformulieren">
                                            <i class="fas fa-magic"></i> Umformulieren
                                        </button>
                                    </div>
                                </div>
                                
                                <div class="custom-text-area" style="margin-top: 1rem;">
                                    <textarea id="custom-text-${suggestion.id}" 
                                             placeholder="${getLanguageConfig(reqData.language).placeholder}"
                                             style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; 
                                                    border-radius: 6px; resize: vertical; min-height: 60px; 
                                                    font-family: inherit; font-size: 0.875rem;"
                                             onchange="updateCustomText('${suggestion.id}', this.value)">${suggestion.customText || ''}</textarea>
                                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.5rem;">
                                        <button onclick="improveSentenceFromTextarea('${suggestion.id}', '${reqData.language}')" 
                                                style="background: #8b5cf6; color: white; border: none; padding: 0.5rem 1rem; 
                                                       border-radius: 6px; font-size: 0.875rem; cursor: pointer; font-weight: 500;"
                                                title="Text mit KI verbessern oder generieren wenn leer">
                                            <i class="fas fa-robot"></i> ${getLanguageConfig(reqData.language).improveButton}
                                        </button>
                                        <div style="font-size: 0.75rem; color: #6b7280;">
                                            ${(document.getElementById(`custom-text-${suggestion.id}`)?.value || '').split(' ').length} Wörter
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="requirement-actions" style="background: #f8fafc; padding: 1rem; border-top: 1px solid #e5e7eb;">
                        <button onclick="generateMoreSentences(${reqIndex}, '${reqData.language}')" 
                                style="background: #10b981; color: white; border: none; padding: 0.75rem 1.5rem; 
                                       border-radius: 8px; font-weight: 600; cursor: pointer; margin-right: 1rem;">
                            <i class="fas fa-plus"></i> Weitere Sätze generieren
                        </button>
                        <button onclick="exportSelectedSentences(${reqIndex})" 
                                style="background: #6366f1; color: white; border: none; padding: 0.75rem 1.5rem; 
                                       border-radius: 8px; font-weight: 600; cursor: pointer;">
                            <i class="fas fa-check"></i> Auswahl übernehmen
                        </button>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        container.innerHTML = html;
    }
    
    // Get confidence color
    function getConfidenceColor(confidence) {
        if (confidence >= 85) return '#10b981';
        if (confidence >= 70) return '#f59e0b';
        return '#ef4444';
    }
    
    // Select suggestion
    function selectSuggestion(suggestionId, reqIndex, suggestionIndex) {
        // Update selection state
        const container = document.querySelector('.sentence-suggestions-enhanced');
        if (!container) return;
        
        // Deselect all in this requirement
        const reqContainer = container.children[reqIndex];
        const suggestions = reqContainer.querySelectorAll('.suggestion-item');
        
        suggestions.forEach((item, index) => {
            const isSelected = index === suggestionIndex;
            item.style.borderColor = isSelected ? '#6366f1' : '#e5e7eb';
            item.style.background = isSelected ? '#f0f9ff' : 'white';
            item.classList.toggle('selected', isSelected);
        });
    }
    
    // Improve sentence
    async function improveSentence(suggestionId, text, language) {
        console.log(`✨ Improving sentence: ${text}`);
        
        try {
            // Show loading state
            const button = event.target.closest('button');
            const originalText = button.innerHTML;
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verbessere...';
            button.disabled = true;
            
            const improvement = await improveTextWithAI(text, language);
            
            // Update the suggestion text
            const suggestionElement = document.querySelector(`[onclick*="${suggestionId}"]`);
            if (suggestionElement) {
                const textElement = suggestionElement.querySelector('.font-weight-500, [style*="font-weight: 500"]');
                if (textElement) {
                    textElement.textContent = improvement.improved;
                }
            }
            
            // Show improvement notification
            showImprovementNotification(improvement);
            
            // Restore button
            button.innerHTML = originalText;
            button.disabled = false;
            
        } catch (error) {
            console.error('❌ Error improving sentence:', error);
            alert('Fehler beim Verbessern des Satzes: ' + error.message);
            
            // Restore button
            const button = event.target.closest('button');
            button.innerHTML = '<i class="fas fa-magic"></i> Umformulieren';
            button.disabled = false;
        }
    }
    
    // Improve sentence from textarea
    async function improveSentenceFromTextarea(suggestionId, language) {
        const textarea = document.getElementById(`custom-text-${suggestionId}`);
        if (!textarea) return;
        
        const text = textarea.value.trim();
        
        try {
            // Show loading state
            const button = event.target;
            const originalText = button.innerHTML;
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verarbeite...';
            button.disabled = true;
            
            const improvement = await improveTextWithAI(text, language);
            
            // Update textarea with improved text
            textarea.value = improvement.improved;
            
            // Show improvement notification
            showImprovementNotification(improvement);
            
            // Restore button
            button.innerHTML = originalText;
            button.disabled = false;
            
        } catch (error) {
            console.error('❌ Error improving textarea text:', error);
            alert('Fehler beim Verbessern: ' + error.message);
            
            // Restore button
            const button = event.target;
            const langConfig = getLanguageConfig(language);
            button.innerHTML = `<i class="fas fa-robot"></i> ${langConfig.improveButton}`;
            button.disabled = false;
        }
    }
    
    // Show improvement notification
    function showImprovementNotification(improvement) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed; top: 20px; right: 20px; z-index: 10000;
            background: #10b981; color: white; padding: 1rem; border-radius: 8px;
            max-width: 400px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;
        
        notification.innerHTML = `
            <div style="font-weight: 600; margin-bottom: 0.5rem;">
                ✨ Text verbessert (${improvement.confidence}% Vertrauen)
            </div>
            <div style="font-size: 0.875rem; opacity: 0.9;">
                ${improvement.improvements.join(', ')}
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 4000);
    }
    
    // Generate more sentences
    async function generateMoreSentences(reqIndex, language) {
        console.log(`🔄 Generating more sentences for requirement ${reqIndex}`);
        
        try {
            // Get requirement data
            const reqData = window.currentSuggestionsData?.[reqIndex];
            if (!reqData) {
                throw new Error('Requirement data not found');
            }
            
            // Show loading
            const button = event.target;
            const originalText = button.innerHTML;
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generiere...';
            button.disabled = true;
            
            // Generate new sentences
            const newSuggestions = await generateSentencesForRequirement(
                reqData.requirement, 
                window.userProfile || {}, 
                language, 
                { style: 'varied' }
            );
            
            // Add to existing suggestions
            reqData.suggestions = reqData.suggestions.concat(newSuggestions);
            
            // Re-render
            renderEnhancedSentenceSuggestions(window.currentSuggestionsData, 'requirementsMatching');
            
            // Restore button
            button.innerHTML = originalText;
            button.disabled = false;
            
        } catch (error) {
            console.error('❌ Error generating more sentences:', error);
            alert('Fehler beim Generieren weiterer Sätze: ' + error.message);
            
            // Restore button
            const button = event.target;
            button.innerHTML = '<i class="fas fa-plus"></i> Weitere Sätze generieren';
            button.disabled = false;
        }
    }
    
    // Export selected sentences
    function exportSelectedSentences(reqIndex) {
        console.log(`📤 Exporting selected sentences for requirement ${reqIndex}`);
        
        const reqData = window.currentSuggestionsData?.[reqIndex];
        if (!reqData) return;
        
        const selectedSentences = reqData.suggestions.filter(s => s.selected);
        const customTexts = reqData.suggestions
            .map(s => document.getElementById(`custom-text-${s.id}`)?.value)
            .filter(text => text && text.trim() !== '');
        
        console.log('Selected sentences:', selectedSentences);
        console.log('Custom texts:', customTexts);
        
        // Here you can integrate with the cover letter builder
        if (window.addToWorkflowContent) {
            const allTexts = [
                ...selectedSentences.map(s => s.text),
                ...customTexts
            ];
            window.addToWorkflowContent(allTexts.join(' '));
        }
        
        alert(`${selectedSentences.length + customTexts.length} Sätze zur Bewerbung hinzugefügt!`);
    }
    
    // Update custom text
    function updateCustomText(suggestionId, text) {
        // Store custom text for later use
        if (!window.customTexts) window.customTexts = {};
        window.customTexts[suggestionId] = text;
    }
    
    // Make functions globally available
    window.detectLanguage = detectLanguage;
    window.generateSentenceSuggestionsEnhanced = generateSentenceSuggestionsEnhanced;
    window.improveTextWithAI = improveTextWithAI;
    window.renderEnhancedSentenceSuggestions = renderEnhancedSentenceSuggestions;
    window.selectSuggestion = selectSuggestion;
    window.improveSentence = improveSentence;
    window.improveSentenceFromTextarea = improveSentenceFromTextarea;
    window.generateMoreSentences = generateMoreSentences;
    window.exportSelectedSentences = exportSelectedSentences;
    window.updateCustomText = updateCustomText;
    
    // Enhanced wrapper for existing generateSentenceSuggestions function
    window.generateSentenceSuggestionsOriginal = window.generateSentenceSuggestions;
    window.generateSentenceSuggestions = async function() {
        console.log('🚀 Enhanced sentence generation started...');
        
        try {
            // Get selected requirements from workflow
            const requirements = window.workflowData?.selectedRequirements || [];
            if (requirements.length === 0) {
                alert('Bitte wählen Sie mindestens eine Anforderung aus.');
                return;
            }
            
            // Get user profile from analysis or create basic one
            const userProfile = window.userProfile || extractUserProfileFromDocuments();
            
            // Show loading state
            const container = document.getElementById('requirementsMatching');
            if (container) {
                container.innerHTML = `
                    <div style="text-align: center; padding: 3rem;">
                        <div style="display: inline-block; width: 60px; height: 60px; border: 4px solid #e5e7eb; border-top: 4px solid #8b5cf6; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 1rem;"></div>
                        <h3 style="margin: 0 0 0.5rem; color: #374151;">KI generiert intelligente Satzvorschläge...</h3>
                        <p style="margin: 0; color: #6b7280;">Analysiere Anforderungen und erstelle passende Formulierungen</p>
                    </div>
                    <style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>
                `;
            }
            
            // Generate enhanced sentences
            const suggestionsData = await generateSentenceSuggestionsEnhanced(requirements, userProfile);
            
            // Store for later use
            window.currentSuggestionsData = suggestionsData;
            
            // Render enhanced UI
            renderEnhancedSentenceSuggestions(suggestionsData, 'requirementsMatching');
            
        } catch (error) {
            console.error('❌ Enhanced sentence generation failed:', error);
            
            // Fall back to original function or show error
            const container = document.getElementById('requirementsMatching');
            if (container) {
                container.innerHTML = `
                    <div style="background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; padding: 1.5rem; border-radius: 12px; text-align: center;">
                        <h4 style="margin: 0 0 0.5rem;">⚠️ Satzgenerierung fehlgeschlagen</h4>
                        <p style="margin: 0 0 1rem;">${error.message}</p>
                        <button onclick="generateSentenceSuggestions()" style="background: #dc2626; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; cursor: pointer;">
                            Erneut versuchen
                        </button>
                    </div>
                `;
            }
        }
    };
    
    // Extract user profile from documents if no profile exists
    function extractUserProfileFromDocuments() {
        const documents = window.getAnalysisDocuments ? window.getAnalysisDocuments() : [];
        
        return {
            experience: 'Mehrjährige Berufserfahrung',
            skills: ['Projektmanagement', 'Kommunikation', 'Teamarbeit'],
            achievements: ['Erfolgreiche Projekte durchgeführt'],
            education: 'Qualifizierte Ausbildung'
        };
    }
    
    console.log('✅ AI Sentence Generator - Loaded');
    
})();
