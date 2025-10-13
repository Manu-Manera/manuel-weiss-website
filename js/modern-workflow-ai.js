/**
 * Modern Workflow AI System
 * Basierend auf CoverLetterGPT Architektur
 * Vollständige KI-Integration für Bewerbungserstellung
 */

class ModernWorkflowAI {
    constructor() {
        this.apiKey = this.getAPIKey();
        this.baseURL = 'https://api.openai.com/v1';
        this.workflowData = {
            currentStep: 1,
            company: '',
            position: '',
            jobDescription: '',
            analysis: null,
            userSkills: '',
            matchingScore: 0,
            coverLetter: '',
            cvData: null,
            template: 'modern',
            exportData: null
        };
        this.init();
    }
    
    init() {
        console.log('🚀 Modern Workflow AI System initialisiert');
        this.setupEventListeners();
        this.loadSavedData();
    }
    
    getAPIKey() {
        // Versuche API Key aus verschiedenen Quellen zu laden
        const sources = [
            () => localStorage.getItem('openai_api_key'),
            () => window.OPENAI_API_KEY,
            () => process.env.OPENAI_API_KEY
        ];
        
        for (const source of sources) {
            try {
                const key = source();
                if (key && key.startsWith('sk-')) {
                    return key;
                }
            } catch (e) {
                // Ignoriere Fehler
            }
        }
        
        return null;
    }
    
    setupEventListeners() {
        // Event Listeners für alle Workflow-Schritte
        document.addEventListener('DOMContentLoaded', () => {
            this.initializeWorkflow();
        });
    }
    
    async initializeWorkflow() {
        console.log('🔄 Initialisiere Workflow...');
        this.updateStepIndicator();
        this.updateNavigation();
    }
    
    // ==================== KI-ANALYSE FUNKTIONEN ====================
    
    async analyzeJobDescription(jobDescription, company, position) {
        if (!this.apiKey) {
            throw new Error('OpenAI API Key nicht konfiguriert');
        }
        
        const prompt = `Analysiere die folgende Stellenausschreibung und extrahiere:
        
1. Hauptanforderungen (mindestens 5)
2. Schlüsselwörter (mindestens 10)
3. Gewünschte Soft Skills
4. Technische Anforderungen
5. Erfahrungslevel
6. Branche/Typ

Stellenausschreibung:
${jobDescription}

Unternehmen: ${company}
Position: ${position}

Antworte im JSON-Format:
{
  "requirements": ["Anforderung 1", "Anforderung 2", ...],
  "keywords": ["Schlüsselwort 1", "Schlüsselwort 2", ...],
  "softSkills": ["Skill 1", "Skill 2", ...],
  "technicalSkills": ["Tech 1", "Tech 2", ...],
  "experienceLevel": "Junior/Mid/Senior",
  "industry": "Branche",
  "summary": "Kurze Zusammenfassung der Stelle"
}`;

        try {
            const response = await this.callOpenAI(prompt);
            return JSON.parse(response);
        } catch (error) {
            console.error('Fehler bei KI-Analyse:', error);
            throw error;
        }
    }
    
    async calculateSkillMatching(userSkills, jobRequirements) {
        if (!this.apiKey) {
            // Fallback ohne KI
            return this.calculateBasicMatching(userSkills, jobRequirements);
        }
        
        const prompt = `Berechne einen Matching-Score zwischen den Benutzer-Skills und den Job-Anforderungen:

Benutzer-Skills: ${userSkills}
Job-Anforderungen: ${JSON.stringify(jobRequirements)}

Berechne einen Score von 0-100% und gib eine detaillierte Analyse zurück.

Antworte im JSON-Format:
{
  "score": 85,
  "matchedSkills": ["Skill 1", "Skill 2"],
  "missingSkills": ["Fehlender Skill 1", "Fehlender Skill 2"],
  "recommendations": ["Empfehlung 1", "Empfehlung 2"],
  "analysis": "Detaillierte Analyse des Matchings"
}`;

        try {
            const response = await this.callOpenAI(prompt);
            return JSON.parse(response);
        } catch (error) {
            console.error('Fehler bei Skill-Matching:', error);
            return this.calculateBasicMatching(userSkills, jobRequirements);
        }
    }
    
    async generateCoverLetter(company, position, jobDescription, userSkills, analysis) {
        if (!this.apiKey) {
            return this.generateBasicCoverLetter(company, position);
        }
        
        const prompt = `Erstelle ein professionelles, personalisiertes Anschreiben für:

Unternehmen: ${company}
Position: ${position}
Stellenausschreibung: ${jobDescription}
Benutzer-Skills: ${userSkills}
Job-Analyse: ${JSON.stringify(analysis)}

Das Anschreiben soll:
- Professionell und überzeugend sein
- Spezifisch auf die Stelle eingehen
- Die relevanten Skills des Bewerbers hervorheben
- Eine klare Struktur haben (Anrede, Einleitung, Hauptteil, Schluss)
- Maximal 300 Wörter lang sein
- Auf Deutsch verfasst sein

Erstelle ein vollständiges Anschreiben:`;

        try {
            const response = await this.callOpenAI(prompt);
            return response;
        } catch (error) {
            console.error('Fehler bei Anschreiben-Generierung:', error);
            return this.generateBasicCoverLetter(company, position);
        }
    }
    
    async optimizeCV(cvContent, jobRequirements) {
        if (!this.apiKey) {
            return cvContent;
        }
        
        const prompt = `Optimiere den folgenden Lebenslauf für die Stellenanforderungen:

Lebenslauf:
${cvContent}

Job-Anforderungen:
${JSON.stringify(jobRequirements)}

Optimiere:
1. Schlüsselwörter für ATS-Systeme
2. Struktur und Formatierung
3. Relevante Erfahrungen hervorheben
4. Fehlende wichtige Punkte ergänzen

Gib den optimierten Lebenslauf zurück:`;

        try {
            const response = await this.callOpenAI(prompt);
            return response;
        } catch (error) {
            console.error('Fehler bei CV-Optimierung:', error);
            return cvContent;
        }
    }
    
    // ==================== OPENAI API INTEGRATION ====================
    
    async callOpenAI(prompt, model = 'gpt-3.5-turbo') {
        const response = await fetch(`${this.baseURL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
                model: model,
                messages: [
                    {
                        role: 'system',
                        content: 'Du bist ein Experte für Bewerbungen und Karriereberatung. Erstelle professionelle, überzeugende Bewerbungsunterlagen.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: 2000,
                temperature: 0.7
            })
        });
        
        if (!response.ok) {
            throw new Error(`OpenAI API Fehler: ${response.status}`);
        }
        
        const data = await response.json();
        return data.choices[0].message.content;
    }
    
    // ==================== FALLBACK FUNKTIONEN ====================
    
    calculateBasicMatching(userSkills, jobRequirements) {
        const userSkillsArray = userSkills.toLowerCase().split(',').map(s => s.trim());
        const requirementsArray = jobRequirements.requirements || [];
        
        let matches = 0;
        const matchedSkills = [];
        
        requirementsArray.forEach(req => {
            const reqLower = req.toLowerCase();
            userSkillsArray.forEach(skill => {
                if (reqLower.includes(skill) || skill.includes(reqLower)) {
                    matches++;
                    matchedSkills.push(skill);
                }
            });
        });
        
        const score = Math.min(100, Math.round((matches / requirementsArray.length) * 100));
        
        return {
            score: score,
            matchedSkills: matchedSkills,
            missingSkills: requirementsArray.filter(req => 
                !userSkillsArray.some(skill => 
                    req.toLowerCase().includes(skill) || skill.includes(req.toLowerCase())
                )
            ),
            recommendations: ['Weitere relevante Skills erwerben', 'Erfahrung in fehlenden Bereichen sammeln'],
            analysis: `Grundlegende Matching-Analyse: ${score}% Übereinstimmung`
        };
    }
    
    generateBasicCoverLetter(company, position) {
        return `Sehr geehrte Damen und Herren,

mit großem Interesse habe ich Ihre Stellenausschreibung für die Position "${position}" bei ${company} gelesen. Als erfahrener [Ihr Beruf] bin ich überzeugt, dass ich eine wertvolle Bereicherung für Ihr Team darstellen kann.

Meine Expertise in [relevanten Bereichen] und meine Leidenschaft für [relevantes Thema] machen mich zum idealen Kandidaten für diese Position. In meiner bisherigen Laufbahn konnte ich bereits [konkrete Erfolge] erzielen und bin bestrebt, diese Erfahrungen bei ${company} weiter auszubauen.

Ich freue mich auf die Möglichkeit, in einem persönlichen Gespräch mehr über die Position und Ihre Erwartungen zu erfahren.

Mit freundlichen Grüßen
[Ihr Name]`;
    }
    
    // ==================== WORKFLOW MANAGEMENT ====================
    
    updateStepIndicator() {
        document.querySelectorAll('.step').forEach((step, index) => {
            const stepNumber = index + 1;
            step.classList.remove('active', 'completed');
            
            if (stepNumber === this.workflowData.currentStep) {
                step.classList.add('active');
            } else if (stepNumber < this.workflowData.currentStep) {
                step.classList.add('completed');
            }
        });
    }
    
    updateNavigation() {
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        
        if (prevBtn) prevBtn.disabled = this.workflowData.currentStep === 1;
        
        if (nextBtn) {
            if (this.workflowData.currentStep === 6) {
                nextBtn.innerHTML = '<i class="fas fa-check"></i> Abschließen';
                nextBtn.onclick = () => this.completeWorkflow();
            } else {
                nextBtn.innerHTML = 'Weiter <i class="fas fa-arrow-right"></i>';
                nextBtn.onclick = () => this.nextStep();
            }
        }
    }
    
    showStep(stepNumber) {
        document.querySelectorAll('.step-content').forEach(content => {
            content.classList.remove('active');
        });
        
        const targetStep = document.getElementById(`step${stepNumber}`);
        if (targetStep) {
            targetStep.classList.add('active');
        }
        
        this.workflowData.currentStep = stepNumber;
        this.updateStepIndicator();
        this.updateNavigation();
    }
    
    nextStep() {
        if (this.workflowData.currentStep < 6) {
            this.saveCurrentStepData();
            this.showStep(this.workflowData.currentStep + 1);
        }
    }
    
    previousStep() {
        if (this.workflowData.currentStep > 1) {
            this.showStep(this.workflowData.currentStep - 1);
        }
    }
    
    saveCurrentStepData() {
        switch(this.workflowData.currentStep) {
            case 1:
                this.workflowData.company = document.getElementById('company')?.value || '';
                this.workflowData.position = document.getElementById('position')?.value || '';
                this.workflowData.jobDescription = document.getElementById('jobDescription')?.value || '';
                break;
            case 2:
                this.workflowData.userSkills = document.getElementById('userSkills')?.value || '';
                break;
            case 3:
                const coverLetterContent = document.getElementById('coverLetterContent');
                this.workflowData.coverLetter = coverLetterContent?.textContent || '';
                break;
        }
    }
    
    loadSavedData() {
        const saved = localStorage.getItem('workflowData');
        if (saved) {
            try {
                this.workflowData = { ...this.workflowData, ...JSON.parse(saved) };
            } catch (e) {
                console.warn('Fehler beim Laden gespeicherter Daten:', e);
            }
        }
    }
    
    saveData() {
        localStorage.setItem('workflowData', JSON.stringify(this.workflowData));
    }
    
    completeWorkflow() {
        this.saveData();
        alert('🎉 Bewerbung erfolgreich abgeschlossen!');
        console.log('Final workflow data:', this.workflowData);
        
        // Optional: Daten an Server senden
        this.exportWorkflowData();
    }
    
    exportWorkflowData() {
        // Hier könnte die Daten an einen Server gesendet werden
        console.log('Exportiere Workflow-Daten:', this.workflowData);
    }
    
    // ==================== PUBLIC API ====================
    
    async analyzeJob() {
        const company = document.getElementById('company')?.value;
        const position = document.getElementById('position')?.value;
        const jobDescription = document.getElementById('jobDescription')?.value;
        
        if (!company || !position || !jobDescription) {
            alert('Bitte füllen Sie alle Felder aus.');
            return;
        }
        
        const loading = document.getElementById('analysisLoading');
        const results = document.getElementById('analysisResults');
        const content = document.getElementById('analysisContent');
        
        if (loading) loading.classList.add('active');
        
        try {
            const analysis = await this.analyzeJobDescription(jobDescription, company, position);
            this.workflowData.analysis = analysis;
            
            if (results && content) {
                results.style.display = 'block';
                content.innerHTML = this.formatAnalysisResults(analysis);
            }
        } catch (error) {
            console.error('Fehler bei Job-Analyse:', error);
            alert('Fehler bei der KI-Analyse. Bitte versuchen Sie es erneut.');
        } finally {
            if (loading) loading.classList.remove('active');
        }
    }
    
    async calculateMatching() {
        const userSkills = document.getElementById('userSkills')?.value;
        
        if (!userSkills) {
            alert('Bitte geben Sie Ihre Skills ein.');
            return;
        }
        
        if (!this.workflowData.analysis) {
            alert('Bitte führen Sie zuerst eine Stellenanalyse durch.');
            return;
        }
        
        try {
            const matching = await this.calculateSkillMatching(userSkills, this.workflowData.analysis);
            this.workflowData.matchingScore = matching.score;
            
            const results = document.getElementById('matchingResults');
            const scoreElement = document.getElementById('matchingScore');
            
            if (results) results.style.display = 'block';
            if (scoreElement) scoreElement.textContent = `${matching.score}%`;
            
            // Zeige detaillierte Ergebnisse
            this.showMatchingDetails(matching);
        } catch (error) {
            console.error('Fehler bei Skill-Matching:', error);
            alert('Fehler bei der Matching-Berechnung. Bitte versuchen Sie es erneut.');
        }
    }
    
    async generateCoverLetter() {
        if (!this.workflowData.analysis) {
            alert('Bitte führen Sie zuerst eine Stellenanalyse durch.');
            return;
        }
        
        const loading = document.getElementById('letterLoading');
        const preview = document.getElementById('coverLetterPreview');
        const content = document.getElementById('coverLetterContent');
        
        if (loading) loading.classList.add('active');
        
        try {
            const coverLetter = await this.generateCoverLetter(
                this.workflowData.company,
                this.workflowData.position,
                this.workflowData.jobDescription,
                this.workflowData.userSkills,
                this.workflowData.analysis
            );
            
            this.workflowData.coverLetter = coverLetter;
            
            if (preview) preview.style.display = 'block';
            if (content) content.textContent = coverLetter;
        } catch (error) {
            console.error('Fehler bei Anschreiben-Generierung:', error);
            alert('Fehler bei der Anschreiben-Generierung. Bitte versuchen Sie es erneut.');
        } finally {
            if (loading) loading.classList.remove('active');
        }
    }
    
    // ==================== HELPER FUNKTIONEN ====================
    
    formatAnalysisResults(analysis) {
        return `
            <div style="margin-bottom: 1rem;">
                <strong>Erkannte Anforderungen:</strong>
                <ul style="margin-top: 0.5rem;">
                    ${analysis.requirements.map(req => `<li>${req}</li>`).join('')}
                </ul>
            </div>
            <div style="margin-bottom: 1rem;">
                <strong>Schlüsselwörter:</strong>
                <div class="keywords">
                    ${analysis.keywords.map(keyword => `<span class="keyword">${keyword}</span>`).join('')}
                </div>
            </div>
            <div>
                <strong>Zusammenfassung:</strong>
                <p>${analysis.summary}</p>
            </div>
        `;
    }
    
    showMatchingDetails(matching) {
        // Hier könnte eine detaillierte Matching-Analyse angezeigt werden
        console.log('Matching Details:', matching);
    }
}

// Global initialisieren
window.ModernWorkflowAI = ModernWorkflowAI;

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (typeof window.workflowAI === 'undefined') {
        window.workflowAI = new ModernWorkflowAI();
    }
});

// Export für Module-System
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ModernWorkflowAI;
}
