/**
 * OpenAI Integration für intelligente Stellenanzeigen-Analyse
 * Universeller Ansatz für alle weltweiten Stellenanzeigen
 */

class OpenAIJobAnalyzer {
    constructor() {
        // Best Practice: Nie direkte API-Calls vom Browser aus
        // OpenAI API sollte nur über Backend/Server aufgerufen werden
        this.baseURL = null; // Entfernt für Sicherheit
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
            
            // Kein Fallback - nur echter Fehler
            throw error;
        }
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
