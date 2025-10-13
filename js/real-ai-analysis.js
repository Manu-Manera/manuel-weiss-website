/**
 * Real AI Analysis System
 * Echte OpenAI-Integration für Stellenanalyse mit Drag & Drop UI
 */

class RealAIAnalysis {
    constructor() {
        this.apiKey = null;
        this.requirements = [];
        this.isAnalyzing = false;
        this.init();
    }
    
    init() {
        console.log('🤖 Real AI Analysis System initialized');
        this.loadApiKey();
    }
    
    loadApiKey() {
        // Try to get API key from admin panel
        if (window.getAdminPanelApiKey) {
            try {
                this.apiKey = window.getAdminPanelApiKey();
                console.log('✅ API Key loaded from admin panel');
            } catch (error) {
                console.log('⚠️ API Key not found in admin panel');
            }
        }
        
        // Fallback: Check localStorage
        if (!this.apiKey) {
            this.apiKey = localStorage.getItem('openai_api_key');
            if (this.apiKey) {
                console.log('✅ API Key loaded from localStorage');
            }
        }
    }
    
    async analyzeJobDescription(jobDescription, company = '', position = '') {
        if (!this.apiKey) {
            throw new Error('OpenAI API Key nicht konfiguriert. Bitte konfigurieren Sie den API Key im Admin Panel.');
        }
        
        if (!jobDescription || jobDescription.trim().length < 50) {
            throw new Error('Stellenausschreibung ist zu kurz. Bitte fügen Sie mindestens 50 Zeichen ein.');
        }
        
        this.isAnalyzing = true;
        console.log('🤖 Starting real OpenAI analysis...');
        
        try {
            const prompt = this.createAnalysisPrompt(jobDescription, company, position);
            const response = await this.callOpenAI(prompt);
            const analysis = JSON.parse(response);
            
            // Transform to requirements format
            this.requirements = this.transformToRequirements(analysis);
            
            console.log('✅ Real AI analysis completed:', this.requirements);
            return this.requirements;
            
        } catch (error) {
            console.error('❌ Real AI analysis failed:', error);
            throw error;
        } finally {
            this.isAnalyzing = false;
        }
    }
    
    createAnalysisPrompt(jobDescription, company, position) {
        return `Analysiere diese Stellenausschreibung detailliert und extrahiere alle wichtigen Anforderungen.

STELLENAUSSCHREIBUNG:
${jobDescription}

UNTERNEHMEN: ${company || 'Nicht angegeben'}
POSITION: ${position || 'Nicht angegeben'}

Bitte analysiere und priorisiere alle Anforderungen nach Wichtigkeit (1-10, 10 = höchste Priorität).

Antworte im folgenden JSON-Format:

{
  "company": "Firmenname",
  "position": "Position",
  "requirements": [
    {
      "id": "req_1",
      "text": "Vollständige Anforderung als klarer Satz",
      "priority": 10,
      "category": "Muss-Qualifikation|Kann-Qualifikation|Soft Skills|Technische Skills|Erfahrung|Bildung|Zertifikate",
      "keywords": ["Schlüsselwort1", "Schlüsselwort2"],
      "isRequired": true,
      "experience": "X Jahre Erfahrung falls angegeben"
    }
  ],
  "summary": "Kurze Zusammenfassung der wichtigsten Punkte",
  "industry": "Branche/Typ",
  "experienceLevel": "Junior/Mid/Senior/Executive"
}

WICHTIGE REGELN:
1. Priorität 10: Absolut kritische Must-Have Anforderungen
2. Priorität 8-9: Sehr wichtige Anforderungen
3. Priorität 6-7: Wichtige Anforderungen
4. Priorität 4-5: Nützliche Anforderungen
5. Priorität 1-3: Nice-to-have Anforderungen
6. Extrahiere mindestens 8-15 Anforderungen
7. Formuliere Anforderungen als vollständige, verständliche Sätze
8. Kategorisiere präzise nach Typ
9. Identifiziere Schlüsselwörter für jede Anforderung`;
    }
    
    async callOpenAI(prompt) {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4',
                messages: [
                    {
                        role: 'system',
                        content: 'Du bist ein HR-Experte mit 15 Jahren Erfahrung in der Stellenanalyse. Analysiere Stellenausschreibungen präzise und strukturiert. Antworte immer mit gültigem JSON.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: 3000,
                temperature: 0.1
            })
        });
        
        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('OpenAI API Key ist ungültig oder abgelaufen');
            } else if (response.status === 429) {
                throw new Error('OpenAI API Rate Limit erreicht. Bitte versuchen Sie es später erneut');
            } else {
                throw new Error(`OpenAI API Fehler: ${response.status} ${response.statusText}`);
            }
        }
        
        const data = await response.json();
        return data.choices[0].message.content;
    }
    
    transformToRequirements(analysis) {
        return analysis.requirements.map((req, index) => ({
            id: req.id || `req_${index + 1}`,
            text: req.text,
            priority: req.priority,
            category: req.category,
            keywords: req.keywords || [],
            isRequired: req.isRequired || req.priority >= 8,
            experience: req.experience || '',
            originalIndex: index
        }));
    }
    
    addCustomRequirement(text, priority = 5, category = 'Kann-Qualifikation') {
        const newRequirement = {
            id: `custom_${Date.now()}`,
            text: text,
            priority: priority,
            category: category,
            keywords: [],
            isRequired: priority >= 8,
            experience: '',
            isCustom: true
        };
        
        this.requirements.push(newRequirement);
        return newRequirement;
    }
    
    updateRequirementPriority(id, newPriority) {
        const requirement = this.requirements.find(req => req.id === id);
        if (requirement) {
            requirement.priority = newPriority;
            requirement.isRequired = newPriority >= 8;
        }
    }
    
    removeRequirement(id) {
        this.requirements = this.requirements.filter(req => req.id !== id);
    }
    
    reorderRequirements(newOrder) {
        const reordered = [];
        newOrder.forEach(id => {
            const req = this.requirements.find(r => r.id === id);
            if (req) reordered.push(req);
        });
        this.requirements = reordered;
    }
    
    getRequirementsByCategory() {
        const categories = {};
        this.requirements.forEach(req => {
            if (!categories[req.category]) {
                categories[req.category] = [];
            }
            categories[req.category].push(req);
        });
        return categories;
    }
    
    getTopRequirements(limit = 10) {
        return this.requirements
            .sort((a, b) => b.priority - a.priority)
            .slice(0, limit);
    }
}

// Initialize global instance
window.realAIAnalysis = new RealAIAnalysis();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RealAIAnalysis;
}
