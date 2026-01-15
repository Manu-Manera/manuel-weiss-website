/**
 * ═══════════════════════════════════════════════════════════════════════════
 * INLINE AI COACH - Real-Time Writing Suggestions
 * Provides live feedback while typing in resume and cover letter editors
 * ═══════════════════════════════════════════════════════════════════════════
 */

class InlineAICoach {
    constructor() {
        this.debounceTimeout = null;
        this.debounceDelay = 1500; // ms after typing stops (länger für weniger Störung)
        this.activeField = null;
        this.suggestionPopup = null;
        this.isAnalyzing = false;
        this.cache = new Map(); // Cache recent analyses
        this.minTextLength = 30; // Mindestlänge für Analyse (weniger störend)
        this.userDismissed = false; // User hat Popup geschlossen
        
        // German weak verbs and their stronger alternatives
        this.weakVerbs = {
            'gearbeitet': ['koordiniert', 'gesteuert', 'geleitet', 'umgesetzt'],
            'gemacht': ['entwickelt', 'erstellt', 'implementiert', 'realisiert'],
            'getan': ['durchgeführt', 'ausgeführt', 'bewerkstelligt'],
            'gewesen': ['fungiert als', 'agiert als', 'tätig gewesen als'],
            'gehabt': ['verfügt über', 'besitzt', 'innehat'],
            'bekommen': ['erhalten', 'erzielt', 'erreicht', 'erworben'],
            'gesagt': ['kommuniziert', 'präsentiert', 'vermittelt'],
            'gegeben': ['bereitgestellt', 'übermittelt', 'geliefert'],
            'genommen': ['übernommen', 'angenommen', 'ergriffen'],
            'verwendet': ['eingesetzt', 'angewandt', 'genutzt'],
            'benutzt': ['eingesetzt', 'angewandt', 'verwendet'],
            'gebraucht': ['benötigt', 'erfordert'],
            'gewollt': ['angestrebt', 'beabsichtigt', 'geplant'],
            'gekonnt': ['beherrscht', 'fähig zu'],
            'geholfen': ['unterstützt', 'assistiert', 'gefördert'],
            'gezeigt': ['demonstriert', 'präsentiert', 'veranschaulicht'],
            'gebracht': ['geliefert', 'erzielt', 'erreicht'],
            'geführt': ['geleitet', 'dirigiert', 'gemanagt'],
            'angefangen': ['initiiert', 'gestartet', 'eingeführt'],
            'aufgehört': ['abgeschlossen', 'beendet', 'finalisiert']
        };
        
        // Passive phrases to avoid
        this.passivePhrases = [
            { pattern: /wurde.*erstellt/gi, suggestion: 'erstellte', explanation: 'Aktive Formulierung wirkt dynamischer' },
            { pattern: /wurde.*durchgeführt/gi, suggestion: 'führte durch', explanation: 'Zeigt Eigeninitiative' },
            { pattern: /wurde.*entwickelt/gi, suggestion: 'entwickelte', explanation: 'Betont Ihre Rolle' },
            { pattern: /wurde.*implementiert/gi, suggestion: 'implementierte', explanation: 'Aktiver und prägnanter' },
            { pattern: /wurde.*bearbeitet/gi, suggestion: 'bearbeitete', explanation: 'Direkter und kraftvoller' },
            { pattern: /wurde.*organisiert/gi, suggestion: 'organisierte', explanation: 'Zeigt Leadership' },
            { pattern: /wurde.*verbessert/gi, suggestion: 'verbesserte', explanation: 'Betont Ihren Beitrag' },
            { pattern: /wurde.*eingeführt/gi, suggestion: 'führte ein', explanation: 'Aktive Formulierung' },
            { pattern: /ist verantwortlich für/gi, suggestion: 'verantwortet', explanation: 'Prägnanter' },
            { pattern: /war zuständig für/gi, suggestion: 'verantwortete / leitete', explanation: 'Dynamischer' },
            { pattern: /hat mitgewirkt/gi, suggestion: 'wirkte mit / unterstützte aktiv', explanation: 'Konkreter' }
        ];
        
        // Buzzwords to avoid (overused and vague)
        this.buzzwords = {
            'teamplayer': 'Beschreiben Sie konkret, wie Sie im Team gearbeitet haben',
            'teamfähig': 'Nennen Sie ein Beispiel für erfolgreiche Teamarbeit',
            'motiviert': 'Zeigen Sie Motivation durch konkrete Leistungen',
            'dynamisch': 'Beschreiben Sie Ihre Arbeitsweise mit Beispielen',
            'flexibel': 'Geben Sie ein Beispiel für Ihre Anpassungsfähigkeit',
            'belastbar': 'Beschreiben Sie eine stressige Situation und Ihre Lösung',
            'kommunikativ': 'Nennen Sie konkrete Kommunikationserfolge',
            'selbstständig': 'Beschreiben Sie ein eigenverantwortlich geleitetes Projekt',
            'zuverlässig': 'Belegen Sie Zuverlässigkeit mit Fakten',
            'kreativ': 'Zeigen Sie Kreativität anhand konkreter Ideen/Lösungen',
            'engagiert': 'Beschreiben Sie Ihr Engagement mit messbaren Ergebnissen',
            'leidenschaftlich': 'Zeigen Sie Leidenschaft durch konkrete Projekte'
        };
        
        // Missing quantification patterns
        this.quantificationHints = [
            { pattern: /verbessert/gi, hint: 'Um wie viel Prozent verbessert?' },
            { pattern: /gesteigert/gi, hint: 'Welche Steigerung in Zahlen?' },
            { pattern: /reduziert/gi, hint: 'Um wie viel reduziert? (%, €, Zeit)' },
            { pattern: /optimiert/gi, hint: 'Welches messbare Ergebnis?' },
            { pattern: /erhöht/gi, hint: 'Um welchen Betrag/Prozentsatz erhöht?' },
            { pattern: /gesenkt/gi, hint: 'Welche konkrete Einsparung?' },
            { pattern: /team/gi, hint: 'Wie groß war das Team?' },
            { pattern: /projekt/gi, hint: 'Budget, Dauer oder Teamgröße angeben?' },
            { pattern: /kunden/gi, hint: 'Wie viele Kunden?' },
            { pattern: /umsatz/gi, hint: 'Welcher konkrete Betrag?' }
        ];
        
        this.init();
    }
    
    init() {
        this.createSuggestionPopup();
        this.attachListeners();
        console.log('🎯 Inline AI Coach initialized');
    }
    
    createSuggestionPopup() {
        // Remove existing popup if any
        const existing = document.getElementById('inlineAiCoachPopup');
        if (existing) existing.remove();
        
        this.suggestionPopup = document.createElement('div');
        this.suggestionPopup.id = 'inlineAiCoachPopup';
        this.suggestionPopup.className = 'inline-ai-coach-popup';
        this.suggestionPopup.innerHTML = `
            <div class="ai-coach-header">
                <i class="fas fa-lightbulb"></i>
                <span>KI-Schreibassistent</span>
                <button class="ai-coach-close" title="Schließen">×</button>
            </div>
            <div class="ai-coach-content">
                <div class="ai-coach-loading">
                    <i class="fas fa-spinner fa-spin"></i> Analysiere...
                </div>
                <div class="ai-coach-suggestions"></div>
            </div>
        `;
        
        document.body.appendChild(this.suggestionPopup);
        
        // Close button
        this.suggestionPopup.querySelector('.ai-coach-close').addEventListener('click', () => {
            this.userDismissed = true;
            this.lastDismissedText = this.activeField?.value?.substring(0, 50) || '';
            this.hidePopup();
        });
        
        // Click outside to close
        document.addEventListener('click', (e) => {
            if (this.suggestionPopup.classList.contains('visible') && 
                !this.suggestionPopup.contains(e.target) && 
                e.target !== this.activeField) {
                this.hidePopup();
            }
        });
    }
    
    attachListeners() {
        // Fields to monitor in resume editor
        const resumeFields = [
            'summary', 'gapExplanation'
        ];
        
        // Fields to monitor in cover letter editor
        // WICHTIG: jobDescription wird NICHT überwacht, da dort nur Position/Unternehmen/Ansprechpartner extrahiert werden
        const coverLetterFields = [
            'letterText' // Nur letterText, NICHT jobDescription
        ];
        
        // Attach to resume fields
        resumeFields.forEach(id => {
            const field = document.getElementById(id);
            if (field) {
                this.attachFieldListener(field);
            }
        });
        
        // Attach to cover letter fields
        coverLetterFields.forEach(id => {
            const field = document.getElementById(id);
            if (field) {
                this.attachFieldListener(field);
            }
        });
        
        // Also attach to dynamically created description fields
        this.observeDynamicFields();
    }
    
    attachFieldListener(field) {
        field.addEventListener('input', (e) => {
            this.handleInput(e.target);
        });
        
        field.addEventListener('focus', (e) => {
            this.activeField = e.target;
        });
        
        field.addEventListener('blur', (e) => {
            // Delay hiding to allow click on suggestions
            setTimeout(() => {
                if (!this.suggestionPopup.matches(':hover')) {
                    this.hidePopup();
                }
            }, 200);
        });
    }
    
    observeDynamicFields() {
        // MutationObserver for dynamically added fields (experience, education descriptions)
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1) { // Element node
                        const textareas = node.querySelectorAll ? 
                            node.querySelectorAll('textarea[data-field="description"]') : [];
                        textareas.forEach(ta => this.attachFieldListener(ta));
                        
                        if (node.matches && node.matches('textarea[data-field="description"]')) {
                            this.attachFieldListener(node);
                        }
                    }
                });
            });
        });
        
        const containers = ['experienceContainer', 'educationContainer', 'projectsContainer'];
        containers.forEach(id => {
            const container = document.getElementById(id);
            if (container) {
                observer.observe(container, { childList: true, subtree: true });
            }
        });
    }
    
    handleInput(field) {
        this.activeField = field;
        
        clearTimeout(this.debounceTimeout);
        this.debounceTimeout = setTimeout(() => {
            this.analyzeText(field);
        }, this.debounceDelay);
    }
    
    async analyzeText(field) {
        const text = field.value.trim();
        
        // Skip if too short
        if (text.length < this.minTextLength) {
            this.hidePopup();
            return;
        }
        
        // Skip if user dismissed and text hasn't changed significantly
        if (this.userDismissed && this.lastDismissedText === text.substring(0, 50)) {
            return;
        }
        
        // Reset dismissed flag if text changed significantly
        if (this.userDismissed && this.lastDismissedText !== text.substring(0, 50)) {
            this.userDismissed = false;
        }
        
        // Check cache
        const cacheKey = text.substring(0, 100);
        if (this.cache.has(cacheKey)) {
            this.displaySuggestions(this.cache.get(cacheKey), field);
            return;
        }
        
        this.isAnalyzing = true;
        this.showLoading(field);
        
        // Perform local analysis first (instant)
        const localSuggestions = this.performLocalAnalysis(text);
        
        // Get country for spelling check
        const country = this.getSelectedCountry();
        
        // Perform spelling check based on country
        const spellingSuggestions = await this.performSpellingCheck(text, country);
        
        // Combine local and spelling suggestions
        let allSuggestions = [...localSuggestions, ...spellingSuggestions];
        
        // If we have suggestions, show them immediately
        if (allSuggestions.length > 0) {
            // Sort by priority and limit to 5
            allSuggestions = allSuggestions
                .sort((a, b) => (a.priority || 10) - (b.priority || 10))
                .slice(0, 5);
            
            this.displaySuggestions(allSuggestions, field);
            this.cache.set(cacheKey, allSuggestions);
        } else {
            // Try OpenAI for better suggestions if no local suggestions
            try {
                const aiSuggestions = await this.performAIAnalysis(text, country);
                if (aiSuggestions.length > 0) {
                    this.displaySuggestions(aiSuggestions, field);
                    this.cache.set(cacheKey, aiSuggestions);
                } else {
                    this.hidePopup();
                }
            } catch (error) {
                console.warn('AI analysis failed:', error);
                this.hidePopup();
            }
        }
        
        this.isAnalyzing = false;
    }
    
    getSelectedCountry() {
        // Try to get country from cover letter editor
        if (window.coverLetterEditor) {
            return window.coverLetterEditor.getSelectedCountry?.() || 'DE';
        }
        const countrySelect = document.getElementById('countrySelect');
        return countrySelect?.value || 'DE';
    }
    
    async performSpellingCheck(text, country) {
        const suggestions = [];
        
        // Country-specific spelling rules
        const spellingRules = {
            'CH': {
                // Schweiz: ß wird zu ss
                patterns: [
                    { pattern: /ß/g, replacement: 'ss', explanation: 'In der Schweiz wird "ß" zu "ss"' }
                ],
                // Typische CH-Schreibweisen
                corrections: {
                    'Grüsse': 'Grüße', // In CH: Grüße (aber viele verwenden Grüsse)
                    'Gruss': 'Gruß' // In CH: Gruß (aber viele verwenden Gruss)
                }
            },
            'DE': {
                // Deutschland: Standard-Duden
                patterns: [],
                corrections: {}
            },
            'AT': {
                // Österreich: ähnlich wie DE, aber manche Unterschiede
                patterns: [],
                corrections: {}
            },
            'US': {
                // USA: Englisch
                patterns: [],
                corrections: {}
            }
        };
        
        const rules = spellingRules[country] || spellingRules['DE'];
        
        // Check for common spelling mistakes
        const commonMistakes = {
            'dass': 'dass (nicht "das" in diesem Kontext)',
            'seit': 'seit (Zeit) vs. "seid" (Ihr seid)',
            'seid': 'seid (Ihr seid) vs. "seit" (Zeit)',
            'als': 'als (Vergleich) vs. "wie" (Gleichheit)',
            'wie': 'wie (Gleichheit) vs. "als" (Vergleich)'
        };
        
        // Check for ß/ss based on country
        if (country === 'CH' && /ß/.test(text)) {
            suggestions.push({
                type: 'spelling',
                icon: 'fa-spell-check',
                title: 'Rechtschreibung (CH)',
                message: 'In der Schweiz wird "ß" zu "ss" geschrieben',
                alternatives: ['ss'],
                priority: 1
            });
        }
        
        // Check for common mistakes
        Object.entries(commonMistakes).forEach(([word, explanation]) => {
            const regex = new RegExp(`\\b${word}\\b`, 'gi');
            if (regex.test(text)) {
                // Only suggest if context might be wrong (simplified check)
                suggestions.push({
                    type: 'spelling',
                    icon: 'fa-spell-check',
                    title: 'Rechtschreibung prüfen',
                    message: explanation,
                    priority: 2
                });
            }
        });
        
        return suggestions;
    }
    
    async performAIAnalysis(text, country) {
        try {
            // Get API key
            const apiKey = await this.getAPIKey();
            if (!apiKey) return [];
            
            // Get context from cover letter editor if available
            let context = '';
            if (window.coverLetterEditor) {
                const jobData = window.coverLetterEditor.collectJobData?.() || {};
                context = `Position: ${jobData.jobTitle || 'Nicht angegeben'}, Unternehmen: ${jobData.companyName || 'Nicht angegeben'}`;
            }
            
            const countryNames = {
                'DE': 'Deutschland (Duden)',
                'CH': 'Schweiz (Schweizer Rechtschreibung)',
                'AT': 'Österreich (Österreichische Rechtschreibung)',
                'US': 'USA (Englisch)'
            };
            
            const prompt = `Du bist ein professioneller Bewerbungsberater und Rechtschreibexperte.

Kontext:
${context}
Land: ${countryNames[country] || 'Deutschland'}

Aufgabe:
Analysiere den folgenden Text aus einem Bewerbungsanschreiben und gib konkrete, hilfreiche Verbesserungsvorschläge.

Text:
"""${text}"""

Gib ausschließlich ein JSON-Array zurück mit Objekten im Format:
[
  {
    "type": "spelling|style|grammar|improvement",
    "title": "Kurzer Titel",
    "message": "Erklärung des Problems",
    "alternatives": ["Vorschlag 1", "Vorschlag 2"],
    "priority": 1-5 (1 = wichtig, 5 = optional)
  }
]

Fokus:
- Rechtschreibfehler korrigieren (basierend auf ${countryNames[country]})
- Grammatikfehler finden
- Stilistische Verbesserungen
- Konkrete, umsetzbare Vorschläge
- Maximal 3-5 Vorschläge

Antworte NUR mit dem JSON-Array, keine zusätzlichen Erklärungen.`;
            
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    messages: [
                        { role: 'system', content: 'Du bist ein professioneller Bewerbungsberater. Antworte ausschließlich mit gültigem JSON.' },
                        { role: 'user', content: prompt }
                    ],
                    max_tokens: 500,
                    temperature: 0.3
                })
            });
            
            if (!response.ok) {
                console.warn('OpenAI API error:', response.status);
                return [];
            }
            
            const data = await response.json();
            const content = data.choices?.[0]?.message?.content || '';
            
            if (!content) return [];
            
            // Parse JSON response
            try {
                const suggestions = JSON.parse(content);
                return Array.isArray(suggestions) ? suggestions : [];
            } catch (parseError) {
                console.warn('Failed to parse AI response:', parseError);
                return [];
            }
        } catch (error) {
            console.warn('AI analysis error:', error);
            return [];
        }
    }
    
    async getAPIKey() {
        // Try AWS API Settings
        if (window.awsAPISettings) {
            try {
                const key = await window.awsAPISettings.getFullApiKey('openai');
                if (key && !key.includes('...')) return key;
            } catch (e) {
                console.warn('AWS API Settings error:', e);
            }
        }
        
        // Try global_api_keys
        try {
            const globalKeys = JSON.parse(localStorage.getItem('global_api_keys') || '{}');
            if (globalKeys.openai && globalKeys.openai.startsWith('sk-')) {
                return globalKeys.openai;
            }
        } catch (e) {
            // Ignore
        }
        
        return null;
    }
    
    performLocalAnalysis(text) {
        const suggestions = [];
        const textLower = text.toLowerCase();
        
        // 1. Check for weak verbs
        Object.entries(this.weakVerbs).forEach(([weak, alternatives]) => {
            if (textLower.includes(weak)) {
                suggestions.push({
                    type: 'weak-verb',
                    icon: 'fa-bolt',
                    title: 'Schwaches Verb gefunden',
                    original: weak,
                    message: `"${weak}" → Stärkere Alternativen:`,
                    alternatives: alternatives,
                    priority: 2
                });
            }
        });
        
        // 2. Check for passive phrases
        this.passivePhrases.forEach(({ pattern, suggestion, explanation }) => {
            if (pattern.test(text)) {
                suggestions.push({
                    type: 'passive',
                    icon: 'fa-exchange-alt',
                    title: 'Passive Formulierung',
                    message: explanation,
                    alternatives: [suggestion],
                    priority: 1
                });
            }
        });
        
        // 3. Check for buzzwords
        Object.entries(this.buzzwords).forEach(([buzzword, advice]) => {
            if (textLower.includes(buzzword.toLowerCase())) {
                suggestions.push({
                    type: 'buzzword',
                    icon: 'fa-exclamation-triangle',
                    title: 'Überstrapaierter Begriff',
                    original: buzzword,
                    message: `"${buzzword}" ist zu allgemein.`,
                    advice: advice,
                    priority: 3
                });
            }
        });
        
        // 4. Check for missing quantification
        this.quantificationHints.forEach(({ pattern, hint }) => {
            if (pattern.test(text) && !/\d/.test(text)) {
                // Only suggest if no numbers in text
                suggestions.push({
                    type: 'quantification',
                    icon: 'fa-hashtag',
                    title: 'Messbare Ergebnisse fehlen',
                    message: hint,
                    priority: 4
                });
            }
        });
        
        // 5. Check sentence length (> 30 words)
        const sentences = text.split(/[.!?]+/).filter(s => s.trim());
        sentences.forEach(sentence => {
            const wordCount = sentence.trim().split(/\s+/).length;
            if (wordCount > 30) {
                suggestions.push({
                    type: 'sentence-length',
                    icon: 'fa-cut',
                    title: 'Langer Satz',
                    message: `Satz mit ${wordCount} Wörtern. Kürzen Sie auf max. 25 Wörter für bessere Lesbarkeit.`,
                    priority: 5
                });
            }
        });
        
        // Sort by priority and limit
        return suggestions
            .sort((a, b) => a.priority - b.priority)
            .slice(0, 5);
    }
    
    showLoading(field) {
        const rect = field.getBoundingClientRect();
        this.positionPopup(rect);
        
        this.suggestionPopup.querySelector('.ai-coach-loading').style.display = 'flex';
        this.suggestionPopup.querySelector('.ai-coach-suggestions').style.display = 'none';
        this.suggestionPopup.classList.add('visible');
    }
    
    displaySuggestions(suggestions, field) {
        if (!suggestions.length) {
            this.hidePopup();
            return;
        }
        
        const rect = field.getBoundingClientRect();
        this.positionPopup(rect);
        
        const container = this.suggestionPopup.querySelector('.ai-coach-suggestions');
        container.innerHTML = suggestions.map(s => this.renderSuggestion(s)).join('');
        
        // Attach click handlers to alternatives
        container.querySelectorAll('.ai-alternative').forEach(btn => {
            btn.addEventListener('click', () => {
                const text = btn.dataset.text;
                const original = btn.dataset.original;
                if (text && this.activeField) {
                    this.applySuggestion(original, text);
                }
            });
        });
        
        this.suggestionPopup.querySelector('.ai-coach-loading').style.display = 'none';
        container.style.display = 'block';
        this.suggestionPopup.classList.add('visible');
    }
    
    renderSuggestion(suggestion) {
        let html = `
            <div class="ai-suggestion ai-suggestion-${suggestion.type}">
                <div class="ai-suggestion-header">
                    <i class="fas ${suggestion.icon}"></i>
                    <span>${suggestion.title}</span>
                </div>
                <div class="ai-suggestion-body">
                    <p>${suggestion.message}</p>
        `;
        
        if (suggestion.alternatives) {
            html += `<div class="ai-alternatives">`;
            suggestion.alternatives.forEach(alt => {
                html += `<button class="ai-alternative" data-text="${alt}" data-original="${suggestion.original || ''}">${alt}</button>`;
            });
            html += `</div>`;
        }
        
        if (suggestion.advice) {
            html += `<p class="ai-advice"><i class="fas fa-lightbulb"></i> ${suggestion.advice}</p>`;
        }
        
        html += `</div></div>`;
        return html;
    }
    
    positionPopup(fieldRect) {
        const popup = this.suggestionPopup;
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;
        
        // Default: below the field
        let top = fieldRect.bottom + window.scrollY + 8;
        let left = fieldRect.left + window.scrollX;
        
        // Check if popup would go off screen bottom
        if (top + 300 > viewportHeight + window.scrollY) {
            // Position above the field
            top = fieldRect.top + window.scrollY - 308;
        }
        
        // Check if popup would go off screen right
        if (left + 380 > viewportWidth) {
            left = viewportWidth - 390;
        }
        
        popup.style.top = `${Math.max(10, top)}px`;
        popup.style.left = `${Math.max(10, left)}px`;
    }
    
    applySuggestion(original, replacement) {
        if (!this.activeField) return;
        
        const text = this.activeField.value;
        let newText = text;
        
        if (original) {
            // Replace specific word/phrase
            const regex = new RegExp(original, 'gi');
            newText = text.replace(regex, replacement);
        }
        
        this.activeField.value = newText;
        this.activeField.dispatchEvent(new Event('input', { bubbles: true }));
        
        // Show success feedback
        this.showFeedback('Ersetzt!');
        
        // Re-analyze after a moment
        setTimeout(() => {
            this.analyzeText(this.activeField);
        }, 500);
    }
    
    showFeedback(message) {
        const feedback = document.createElement('div');
        feedback.className = 'ai-coach-feedback';
        feedback.innerHTML = `<i class="fas fa-check"></i> ${message}`;
        document.body.appendChild(feedback);
        
        setTimeout(() => {
            feedback.classList.add('fade-out');
            setTimeout(() => feedback.remove(), 300);
        }, 1500);
    }
    
    hidePopup() {
        this.suggestionPopup.classList.remove('visible');
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if we're on an editor page
    if (document.getElementById('resumeForm') || document.getElementById('letterText')) {
        window.inlineAICoach = new InlineAICoach();
    }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = InlineAICoach;
}
