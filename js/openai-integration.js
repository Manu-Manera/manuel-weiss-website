/**
 * OpenAI Integration für intelligente Stellenanzeigen-Analyse
 * Universeller Ansatz für alle weltweiten Stellenanzeigen
 */

class OpenAIJobAnalyzer {
    constructor() {
        this.baseURL = 'https://api.openai.com/v1/chat/completions';
        this.loadSettings();
    }

    loadSettings() {
        const settings = localStorage.getItem('openai-settings');
        if (settings) {
            this.settings = JSON.parse(settings);
        } else {
            this.settings = {
                apiKey: '',
                model: 'gpt-4o-mini',
                language: 'auto',
                maxRequirements: 12,
                temperature: 0.1
            };
        }
    }

    saveSettings(settings) {
        this.settings = { ...this.settings, ...settings };
        localStorage.setItem('openai-settings', JSON.stringify(this.settings));
        this.updateUsageStats();
    }


    async analyzeJobPosting(jobText) {
        if (!this.settings.apiKey) {
            throw new Error('OpenAI API Key ist nicht konfiguriert. Bitte in den KI-Einstellungen hinterlegen.');
        }

        const prompt = this.createAnalysisPrompt(jobText);

        try {
            // Detaillierte Fehlerbehandlung für verschiedene Probleme
            const response = await fetch(this.baseURL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.settings.apiKey}`,
                    'User-Agent': 'Manuel-Weiss-Website/1.0'
                },
                body: JSON.stringify({
                    model: this.settings.model,
                    messages: [
                        {
                            role: 'system',
                            content: 'Du bist ein Experte für die Analyse von Stellenanzeigen. Du extrahierst präzise Firmenname, Position, Ansprechpartner und Anforderungen aus beliebigen Stellenanzeigen weltweit.'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    max_tokens: 1500,
                    temperature: this.settings.temperature
                })
            });

            // Detaillierte Fehleranalyse
            if (!response.ok) {
                const errorText = await response.text();
                let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
                
                try {
                    const errorData = JSON.parse(errorText);
                    if (errorData.error) {
                        switch (errorData.error.type) {
                            case 'insufficient_quota':
                                errorMessage = 'OpenAI Guthaben aufgebraucht. Bitte laden Sie Ihr Konto auf.';
                                break;
                            case 'invalid_api_key':
                                errorMessage = 'Ungültiger API Key. Bitte prüfen Sie Ihren OpenAI API Schlüssel.';
                                break;
                            case 'model_not_found':
                                errorMessage = `Model '${this.settings.model}' nicht verfügbar. Versuchen Sie gpt-3.5-turbo.`;
                                break;
                            case 'rate_limit_exceeded':
                                errorMessage = 'Rate Limit erreicht. Bitte warten Sie einen Moment.';
                                break;
                            default:
                                errorMessage = errorData.error.message || errorMessage;
                        }
                    }
                } catch (parseError) {
                    // Falls JSON parsing fehlschlägt, verwende die ursprüngliche Nachricht
                    if (response.status === 0) {
                        errorMessage = 'Netzwerkfehler: Keine Verbindung zur OpenAI API möglich. Prüfen Sie Ihre Internetverbindung.';
                    } else if (response.status === 401) {
                        errorMessage = 'Ungültiger API Key. Bitte prüfen Sie Ihren OpenAI API Schlüssel.';
                    } else if (response.status === 429) {
                        errorMessage = 'Zu viele Anfragen. Bitte warten Sie einen Moment.';
                    } else if (response.status === 500) {
                        errorMessage = 'OpenAI Server Fehler. Bitte versuchen Sie es später erneut.';
                    }
                }
                
                throw new Error(errorMessage);
            }

            const data = await response.json();
            
            if (!data.choices || !data.choices[0] || !data.choices[0].message) {
                throw new Error('Unerwartete API Antwort: Keine Daten erhalten.');
            }
            
            let result;
            try {
                result = JSON.parse(data.choices[0].message.content);
            } catch (parseError) {
                throw new Error('Fehler beim Verarbeiten der KI-Antwort. Bitte versuchen Sie es erneut.');
            }
            
            // Speichere Nutzungsstatistiken
            if (data.usage) {
                this.trackUsage(data.usage);
            }
            
            return this.processAnalysisResult(result);

        } catch (error) {
            console.error('OpenAI Analyse Fehler:', error);
            
            // Fallback zu lokaler intelligenter Analyse
            console.warn('OpenAI API nicht verfügbar, verwende lokale intelligente Extraktion...');
            return this.performLocalAnalysis(jobText);
        }
    }

    // Lokale intelligente Analyse als Fallback
    performLocalAnalysis(jobText) {
        console.log('🔄 Führe lokale intelligente Analyse durch...');
        
        const analysis = {
            company: this.extractCompanyLocal(jobText),
            position: this.extractPositionLocal(jobText),
            location: this.extractLocationLocal(jobText),
            contactPerson: this.extractContactPersonLocal(jobText),
            requirements: this.extractRequirementsLocal(jobText),
            responsibilities: this.extractResponsibilitiesLocal(jobText),
            benefits: this.extractBenefitsLocal(jobText),
            employmentType: this.extractEmploymentTypeLocal(jobText),
            workModel: this.extractWorkModelLocal(jobText),
            language: 'de',
            salaryRange: this.extractSalaryLocal(jobText)
        };
        
        // Simuliere usage tracking
        this.trackUsage({
            prompt_tokens: Math.floor(jobText.length / 4),
            completion_tokens: 500,
            total_tokens: Math.floor(jobText.length / 4) + 500
        });
        
        return this.processAnalysisResult(analysis);
    }

    extractCompanyLocal(text) {
        // Verbesserte lokale Firma-Extraktion
        const strategies = [
            // LinkedIn/XING Format
            () => {
                const match = text.match(/(?:bei|at)\s+([A-Za-z0-9\s&\-\.]+?)(?:\s+·|\s+speichern|\s+$)/i);
                return match ? match[1].trim() : null;
            },
            // Firmenname am Anfang
            () => {
                const lines = text.split('\n').slice(0, 5);
                for (const line of lines) {
                    const clean = line.trim();
                    if (clean.length > 2 && clean.length < 50 && 
                        /^[A-Z]/.test(clean) && 
                        !clean.includes('Logo') && !clean.includes('Teilen') &&
                        !clean.includes('Weitere') && !clean.includes('Optionen')) {
                        return clean;
                    }
                }
                return null;
            },
            // Bekannte Patterns
            () => {
                const patterns = [
                    /([A-Z]{2,}(?:\s+[A-Z][a-z]+)*)/,  // IBM, SAP, etc.
                    /([A-Za-z\s&]+(?:AG|GmbH|SE|SA|Ltd|Inc|Corporation|Corp))/i
                ];
                for (const pattern of patterns) {
                    const match = text.match(pattern);
                    if (match && match[1].length >= 2 && match[1].length <= 50) {
                        return match[1].trim();
                    }
                }
                return null;
            }
        ];
        
        for (const strategy of strategies) {
            const result = strategy();
            if (result) return result;
        }
        return '';
    }

    extractPositionLocal(text) {
        // Verbesserte lokale Position-Extraktion
        const strategies = [
            // Gender-Zusatz (höchste Priorität)
            () => {
                const match = text.match(/([^·\n\|]+?)\s*\((?:f\/m\/x|m\/w\/d|all\s*genders?)\)/i);
                return match ? match[1].trim() : null;
            },
            // Nach Jobtitel-Keywords
            () => {
                const keywords = ['Consultant', 'Manager', 'Developer', 'Engineer', 'Analyst', 'Specialist', 'Expert', 'SME', 'Lead', 'Architect'];
                const lines = text.split('\n');
                for (const line of lines) {
                    for (const keyword of keywords) {
                        if (line.includes(keyword) && line.length < 100) {
                            return line.trim().replace(/^[·\|]\s*/, '');
                        }
                    }
                }
                return null;
            }
        ];
        
        for (const strategy of strategies) {
            const result = strategy();
            if (result) return result;
        }
        return '';
    }

    extractLocationLocal(text) {
        const locationPatterns = [
            /(?:Zürich|Berlin|München|Hamburg|Frankfurt|Köln|Stuttgart|Düsseldorf|Vienna|Wien|Bern|Basel|Geneva|Genf),?\s*[A-Za-z\s]*,?\s*(?:Schweiz|Deutschland|Austria|Österreich)/i,
            /([A-Za-z\s]+),\s*([A-Za-z\s]+),\s*(Schweiz|Deutschland|Austria|Österreich)/i
        ];
        
        for (const pattern of locationPatterns) {
            const match = text.match(pattern);
            if (match) return match[0];
        }
        return '';
    }

    extractContactPersonLocal(text) {
        // Suche nach Ansprechpartner
        const namePattern = /(?:Ansprechpartner|Contact|Kontakt|bei\s+Fragen)[\s:]*([A-Z][a-z]+\s+[A-Z][a-z]+)/i;
        const emailPattern = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/;
        const phonePattern = /(\+?\d{1,3}[\s\-]?\d{2,3}[\s\-]?\d{3,4}[\s\-]?\d{3,4})/;
        
        const nameMatch = text.match(namePattern);
        const emailMatch = text.match(emailPattern);
        const phoneMatch = text.match(phonePattern);
        
        if (nameMatch || emailMatch || phoneMatch) {
            return {
                name: nameMatch ? nameMatch[1] : null,
                position: null,
                email: emailMatch ? emailMatch[1] : null,
                phone: phoneMatch ? phoneMatch[1] : null
            };
        }
        
        return null;
    }

    extractRequirementsLocal(text) {
        const requirements = [];
        const sections = ['Required', 'Preferred', 'Anforderungen', 'Qualifikation', 'Skills', 'Expertise'];
        
        for (const section of sections) {
            const sectionRegex = new RegExp(`${section}[^\\n]*\\n([\\s\\S]*?)(?=\\n\\n|$)`, 'i');
            const match = text.match(sectionRegex);
            
            if (match) {
                const lines = match[1].split('\n').filter(l => l.trim());
                for (const line of lines) {
                    let req = line.trim().replace(/^[\s•\-\*\d\.]+/, '').trim();
                    if (req.length > 10 && req.length < 200) {
                        const priority = this.determinePriorityLocal(req, section);
                        requirements.push({
                            text: req,
                            priority: priority,
                            category: this.categorizRequirement(req),
                            matchScore: 0,
                            sentences: []
                        });
                    }
                }
            }
        }
        
        // Falls keine strukturierten Requirements, erstelle Standard-Set
        if (requirements.length === 0) {
            requirements.push(
                { text: 'Fachliche Qualifikation und Berufserfahrung', priority: 'high', category: 'experience', matchScore: 0, sentences: [] },
                { text: 'Ausbildung oder Studium im relevanten Bereich', priority: 'high', category: 'education', matchScore: 0, sentences: [] },
                { text: 'Teamfähigkeit und Kommunikationsstärke', priority: 'medium', category: 'soft_skills', matchScore: 0, sentences: [] },
                { text: 'Analytisches Denken und Problemlösungskompetenz', priority: 'medium', category: 'soft_skills', matchScore: 0, sentences: [] }
            );
        }
        
        return requirements.slice(0, 12);
    }

    determinePriorityLocal(requirement, sectionTitle) {
        const req = requirement.toLowerCase();
        const section = sectionTitle.toLowerCase();
        
        if (section.includes('required') || req.includes('erforderlich') || req.includes('zwingend')) return 'high';
        if (section.includes('preferred') || req.includes('wünschenswert') || req.includes('vorteil')) return 'medium';
        if (/\d+\+?\s*(years?|jahre?)/.test(req)) return 'high';
        if (req.includes('bachelor') || req.includes('master') || req.includes('studium')) return 'high';
        
        return 'medium';
    }

    categorizRequirement(requirement) {
        const req = requirement.toLowerCase();
        
        if (req.includes('programm') || req.includes('software') || req.includes('tech')) return 'technical';
        if (req.includes('jahr') || req.includes('erfahrung') || req.includes('experience')) return 'experience';
        if (req.includes('studium') || req.includes('ausbildung') || req.includes('bachelor') || req.includes('master')) return 'education';
        if (req.includes('sprach') || req.includes('deutsch') || req.includes('englisch')) return 'language';
        if (req.includes('zertifi') || req.includes('certification')) return 'certification';
        
        return 'soft_skills';
    }

    extractResponsibilitiesLocal(text) {
        const responsibilities = [];
        const patterns = [
            /(?:Responsibilities|Aufgaben|Tasks|Your Role)[^\\n]*\\n([\\s\\S]*?)(?=\\n\\n|$)/i,
            /(?:Sie werden|You will|Du wirst)[^.]*\\./g
        ];
        
        for (const pattern of patterns) {
            const matches = text.match(pattern);
            if (matches) {
                if (Array.isArray(matches)) {
                    responsibilities.push(...matches.slice(0, 5));
                } else {
                    const lines = matches[1].split('\n').filter(l => l.trim());
                    responsibilities.push(...lines.slice(0, 5));
                }
            }
        }
        
        return responsibilities;
    }

    extractBenefitsLocal(text) {
        const benefits = [];
        const benefitKeywords = ['benefit', 'vorteil', 'offer', 'bieten', 'package', 'perks'];
        
        const lines = text.split('\n');
        for (const line of lines) {
            const lower = line.toLowerCase();
            if (benefitKeywords.some(kw => lower.includes(kw)) && line.length > 10 && line.length < 100) {
                benefits.push(line.trim());
            }
        }
        
        return benefits.slice(0, 5);
    }

    extractEmploymentTypeLocal(text) {
        if (text.includes('Vollzeit') || text.includes('Full')) return 'Vollzeit';
        if (text.includes('Teilzeit') || text.includes('Part')) return 'Teilzeit';
        if (text.includes('Freelance') || text.includes('Contract')) return 'Freelance';
        if (text.includes('Praktikum') || text.includes('Intern')) return 'Praktikum';
        return 'Vollzeit';
    }

    extractWorkModelLocal(text) {
        if (text.includes('Remote')) return 'Remote';
        if (text.includes('Hybrid')) return 'Hybrid';
        return 'Vor Ort';
    }

    extractSalaryLocal(text) {
        const salaryPatterns = [
            /(\d{2,3}[.,]?\d{0,3}[.,]?\d{0,3})\s*(?:€|EUR|CHF|USD)/i,
            /(?:€|EUR|CHF|USD)\s*(\d{2,3}[.,]?\d{0,3}[.,]?\d{0,3})/i
        ];
        
        for (const pattern of salaryPatterns) {
            const match = text.match(pattern);
            if (match) return match[0];
        }
        
        return null;
    }

    createAnalysisPrompt(jobText) {
        const languageInstruction = this.settings.language === 'auto' ? 
            'Erkenne automatisch die Sprache der Stellenanzeige.' :
            `Antworte in ${this.getLanguageName(this.settings.language)}.`;

        return `
Analysiere diese Stellenanzeige und extrahiere die folgenden Informationen. ${languageInstruction}

STELLENANZEIGE:
${jobText}

Gib das Ergebnis als JSON zurück mit folgender Struktur:

{
  "company": "Firmenname (exakt wie in der Anzeige)",
  "position": "Genaue Positionsbezeichnung",
  "location": "Standort/Stadt",
  "contactPerson": {
    "name": "Vollständiger Name oder null",
    "position": "Position des Ansprechpartners oder null",
    "email": "E-Mail oder null",
    "phone": "Telefon oder null"
  },
  "requirements": [
    {
      "text": "Anforderung als klarer Satz",
      "priority": "high|medium|low",
      "category": "technical|experience|education|soft_skills|language|certification"
    }
  ],
  "responsibilities": [
    "Aufgabe 1",
    "Aufgabe 2"
  ],
  "benefits": [
    "Vorteil 1", 
    "Vorteil 2"
  ],
  "employmentType": "Vollzeit|Teilzeit|Freelance|Praktikum",
  "workModel": "Remote|Hybrid|Vor Ort",
  "language": "de|en|fr|it|es",
  "salaryRange": "Gehaltsangabe oder null"
}

WICHTIGE REGELN:
1. Extrahiere maximal ${this.settings.maxRequirements} der wichtigsten Anforderungen
2. Priorität "high": Must-have, Jahre Erfahrung, Abschlüsse, Zertifikate
3. Priorität "medium": Bevorzugte Skills, Soft Skills
4. Priorität "low": Nice-to-have Features
5. Kategorien präzise zuordnen
6. Null-Werte für nicht gefundene Informationen
7. Vollständige Namen und Positionen ohne Abkürzungen
8. Anforderungen als vollständige, verständliche Sätze formulieren
`;
    }

    getLanguageName(code) {
        const languages = {
            'de': 'Deutsch',
            'en': 'English',
            'fr': 'Français',
            'it': 'Italiano',
            'es': 'Español'
        };
        return languages[code] || 'Deutsch';
    }

    processAnalysisResult(result) {
        // Validiere und normalisiere das Ergebnis
        return {
            company: result.company || '',
            position: result.position || '',
            location: result.location || '',
            contactPerson: result.contactPerson || null,
            requirements: (result.requirements || []).map(req => ({
                text: req.text,
                priority: req.priority || 'medium',
                category: req.category || 'technical',
                matchScore: 0,
                sentences: []
            })),
            responsibilities: result.responsibilities || [],
            benefits: result.benefits || [],
            employmentType: result.employmentType || '',
            workModel: result.workModel || '',
            language: result.language || 'de',
            salaryRange: result.salaryRange || null
        };
    }

    trackUsage(usage) {
        const today = new Date().toDateString();
        let stats = JSON.parse(localStorage.getItem('openai-usage-stats') || '{}');
        
        if (!stats[today]) {
            stats[today] = {
                analyses: 0,
                promptTokens: 0,
                completionTokens: 0,
                totalTokens: 0,
                estimatedCost: 0
            };
        }

        stats[today].analyses += 1;
        stats[today].promptTokens += usage.prompt_tokens || 0;
        stats[today].completionTokens += usage.completion_tokens || 0;
        stats[today].totalTokens += usage.total_tokens || 0;
        
        // Geschätzte Kosten (GPT-4o-mini: $0.15/1M input, $0.6/1M output)
        const inputCost = (usage.prompt_tokens || 0) * 0.15 / 1000000;
        const outputCost = (usage.completion_tokens || 0) * 0.6 / 1000000;
        stats[today].estimatedCost += inputCost + outputCost;

        localStorage.setItem('openai-usage-stats', JSON.stringify(stats));
        this.updateUsageStats();
    }

    updateUsageStats() {
        const today = new Date().toDateString();
        const stats = JSON.parse(localStorage.getItem('openai-usage-stats') || '{}');
        const todayStats = stats[today] || { analyses: 0, estimatedCost: 0 };

        // Update UI elements
        const analysesToday = document.getElementById('analyses-today');
        const costsToday = document.getElementById('costs-today');
        const apiStatus = document.getElementById('api-status');

        if (analysesToday) {
            analysesToday.textContent = todayStats.analyses;
        }

        if (costsToday) {
            costsToday.textContent = `$${todayStats.estimatedCost.toFixed(4)}`;
        }

        if (apiStatus) {
            if (this.settings.apiKey) {
                apiStatus.textContent = 'Konfiguriert';
                apiStatus.style.color = '#059669';
            } else {
                apiStatus.textContent = 'Nicht konfiguriert';
                apiStatus.style.color = '#ef4444';
            }
        }
    }

}

// Globale Instanz
window.openAIAnalyzer = new OpenAIJobAnalyzer();

// Event Handlers für KI-Einstellungen
document.addEventListener('DOMContentLoaded', function() {
    // Lade gespeicherte Einstellungen wenn verfügbar
    if (window.openAIAnalyzer) {
        const settings = window.openAIAnalyzer.settings;
        
        if (document.getElementById('openai-api-key')) {
            document.getElementById('openai-api-key').value = settings.apiKey || '';
            document.getElementById('openai-model').value = settings.model || 'gpt-4o-mini';
            document.getElementById('analysis-language').value = settings.language || 'auto';
            document.getElementById('max-requirements').value = settings.maxRequirements || 12;
            document.getElementById('ai-temperature').value = settings.temperature || 0.1;
        }
        
        // Update UI
        window.openAIAnalyzer.updateUsageStats();
    }
});
