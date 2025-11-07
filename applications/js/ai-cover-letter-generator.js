/**
 * AI COVER LETTER GENERATOR - JAVASCRIPT
 * Handles AI-powered cover letter generation using GPT-3.5 Turbo
 */

class AICoverLetterGenerator {
    constructor() {
        this.applicationsCore = null;
        this.isGenerating = false;
        this.generatedContent = null;
        this.templates = {
            'formal': this.getFormalTemplate(),
            'modern-it': this.getModernITTemplate(),
            'creative-marketing': this.getCreativeMarketingTemplate()
        };
        this.init();
    }

    async init() {
        console.log('🤖 Initializing AI Cover Letter Generator...');
        
        // Wait for applications core
        await this.waitForApplicationsCore();
        
        // Setup event handlers
        this.setupEventHandlers();
        
        // Load existing data
        this.loadExistingData();
        
        console.log('✅ AI Cover Letter Generator initialized');
    }

    async waitForApplicationsCore() {
        return new Promise((resolve) => {
            const checkCore = () => {
                if (window.applicationsCore && window.applicationsCore.isInitialized) {
                    this.applicationsCore = window.applicationsCore;
                    resolve();
                } else {
                    setTimeout(checkCore, 100);
                }
            };
            checkCore();
        });
    }

    setupEventHandlers() {
        // Generate button
        document.getElementById('generateBtn').addEventListener('click', () => {
            this.generateCoverLetter();
        });

        // Regenerate button
        document.getElementById('regenerateBtn').addEventListener('click', () => {
            this.generateCoverLetter();
        });

        // Save button
        document.getElementById('saveBtn').addEventListener('click', () => {
            this.saveCoverLetter();
        });

        // Download button
        document.getElementById('downloadBtn').addEventListener('click', () => {
            this.downloadCoverLetter();
        });

        // Text area changes
        document.getElementById('generatedText').addEventListener('input', () => {
            this.updateStats();
        });

        // Form validation
        document.getElementById('jobInfoForm').addEventListener('input', () => {
            this.validateForm();
        });
    }

    loadExistingData() {
        // Load profile data for context
        const profileData = this.applicationsCore.getProfileData();
        if (profileData) {
            console.log('📋 Profile data loaded for context');
        }
    }

    async generateCoverLetter() {
        if (this.isGenerating) return;
        
        console.log('🚀 Starting cover letter generation...');
        
        // Validate form
        if (!this.validateForm()) {
            this.showNotification('Bitte füllen Sie alle Pflichtfelder aus', 'error');
            return;
        }
        
        // Check API key
        const apiKey = localStorage.getItem('openai_api_key');
        if (!apiKey) {
            this.showTemplateFallback();
            return;
        }
        
        this.isGenerating = true;
        this.showLoading();
        
        try {
            // Collect form data
            const jobData = this.collectJobData();
            const profileData = this.applicationsCore.getProfileData();
            const options = this.collectOptions();
            
            // Generate cover letter
            const coverLetter = await this.callOpenAI(jobData, profileData, options);
            
            // Display result
            this.displayGeneratedContent(coverLetter);
            
            // Track progress
            this.applicationsCore.trackProgress('cover-letter-generation', {
                jobData,
                options,
                generated: true
            });
            
        } catch (error) {
            console.error('❌ Error generating cover letter:', error);
            this.showTemplateFallback();
        } finally {
            this.isGenerating = false;
            this.hideLoading();
        }
    }

    collectJobData() {
        const form = document.getElementById('jobInfoForm');
        const formData = new FormData(form);
        
        return {
            jobTitle: formData.get('jobTitle'),
            companyName: formData.get('companyName'),
            industry: formData.get('industry'),
            location: formData.get('location'),
            jobDescription: formData.get('jobDescription'),
            contactPerson: formData.get('contactPerson'),
            applicationDeadline: formData.get('applicationDeadline')
        };
    }

    collectOptions() {
        return {
            tone: document.querySelector('input[name="tone"]:checked').value,
            length: document.querySelector('input[name="length"]:checked').value,
            focus: document.querySelector('input[name="focus"]:checked').value
        };
    }

    async callOpenAI(jobData, profileData, options) {
        const apiKey = localStorage.getItem('openai_api_key');
        
        const prompt = this.constructPrompt(jobData, profileData, options);
        
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: 'Du bist ein professioneller Bewerbungsberater und Experte für Anschreiben. Erstelle personalisierte, überzeugende Bewerbungsanschreiben auf Deutsch.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 800
            })
        });
        
        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }
        
        const data = await response.json();
        return data.choices[0].message.content;
    }

    constructPrompt(jobData, profileData, options) {
        const lengthMap = {
            'short': 'ca. 150 Wörter',
            'medium': 'ca. 250 Wörter',
            'long': 'ca. 350 Wörter'
        };
        
        const toneMap = {
            'formal': 'professionell und sachlich',
            'modern': 'zeitgemäß und dynamisch',
            'creative': 'originell und einzigartig'
        };
        
        const focusMap = {
            'experience': 'Berufserfahrung und Erfolge',
            'skills': 'technische Fähigkeiten und Kompetenzen',
            'motivation': 'persönliche Motivation und Ziele'
        };
        
        return `
Erstelle ein Bewerbungsanschreiben für:

POSITION: ${jobData.jobTitle}
UNTERNEHMEN: ${jobData.companyName}
BRANCHE: ${jobData.industry || 'Nicht angegeben'}
STANDORT: ${jobData.location || 'Nicht angegeben'}

STELLENBESCHREIBUNG:
${jobData.jobDescription}

BEWERBER-PROFIL:
- Name: ${profileData.firstName} ${profileData.lastName}
- Erfahrung: ${profileData.experience ? profileData.experience.map(exp => `${exp.position} bei ${exp.company}`).join(', ') : 'Nicht angegeben'}
- Fähigkeiten: ${profileData.technicalSkills ? profileData.technicalSkills.join(', ') : 'Nicht angegeben'}
- Motivation: ${profileData.motivation || 'Nicht angegeben'}

ANFORDERUNGEN:
- Tonalität: ${toneMap[options.tone]}
- Länge: ${lengthMap[options.length]}
- Schwerpunkt: ${focusMap[options.focus]}

Das Anschreiben soll:
- Professionell und überzeugend sein
- Auf die Stellenanforderungen eingehen
- Relevante Erfahrungen hervorheben
- Persönlich und authentisch wirken
- Strukturiert und gut lesbar sein

Erstelle nur das Anschreiben ohne zusätzliche Erklärungen.
        `;
    }

    displayGeneratedContent(content) {
        const generatedSection = document.getElementById('generatedContent');
        const generatedText = document.getElementById('generatedText');
        
        generatedText.value = content;
        generatedSection.style.display = 'block';
        
        // Update stats
        this.updateStats();
        
        // Show continue button
        document.getElementById('continueBtn').style.display = 'inline-flex';
        
        // Scroll to generated content
        generatedSection.scrollIntoView({ behavior: 'smooth' });
        
        this.generatedContent = content;
    }

    updateStats() {
        const text = document.getElementById('generatedText').value;
        const words = text.trim().split(/\s+/).filter(word => word.length > 0).length;
        const chars = text.length;
        
        document.getElementById('wordCount').textContent = words;
        document.getElementById('charCount').textContent = chars;
        document.getElementById('generationTime').textContent = new Date().toLocaleTimeString('de-DE');
    }

    showTemplateFallback() {
        console.log('📄 Showing template fallback...');
        
        const templateSection = document.getElementById('templateSection');
        templateSection.style.display = 'block';
        
        this.showNotification('KI-Generierung nicht verfügbar. Verwenden Sie ein Template.', 'info');
    }

    useTemplate(templateKey) {
        const template = this.templates[templateKey];
        if (!template) return;
        
        // Fill template with job data
        const jobData = this.collectJobData();
        const profileData = this.applicationsCore.getProfileData();
        
        const filledTemplate = this.fillTemplate(template, jobData, profileData);
        this.displayGeneratedContent(filledTemplate);
        
        // Hide template section
        document.getElementById('templateSection').style.display = 'none';
    }

    fillTemplate(template, jobData, profileData) {
        return template
            .replace(/{{jobTitle}}/g, jobData.jobTitle || '[Jobtitel]')
            .replace(/{{companyName}}/g, jobData.companyName || '[Unternehmen]')
            .replace(/{{firstName}}/g, profileData.firstName || '[Vorname]')
            .replace(/{{lastName}}/g, profileData.lastName || '[Nachname]')
            .replace(/{{location}}/g, jobData.location || '[Standort]')
            .replace(/{{contactPerson}}/g, jobData.contactPerson || '[Ansprechpartner]');
    }

    getFormalTemplate() {
        return `Sehr geehrte Damen und Herren,

mit großem Interesse habe ich Ihre Stellenausschreibung für die Position als {{jobTitle}} bei {{companyName}} gelesen. Als erfahrener [Berufsbezeichnung] mit [X] Jahren Berufserfahrung in [relevanten Bereichen] bin ich überzeugt, dass ich eine wertvolle Bereicherung für Ihr Team darstellen kann.

In meiner bisherigen Tätigkeit bei [vorherige Firma] konnte ich umfangreiche Erfahrungen in [relevanten Skills/Bereichen] sammeln. Besonders stolz bin ich auf [konkrete Erfolge/Projekte], die meine Fähigkeiten in [relevanten Bereichen] unterstreichen.

Die Möglichkeit, bei {{companyName}} in einem innovativen und dynamischen Umfeld zu arbeiten, reizt mich sehr. Ihr Unternehmen steht für [Unternehmenswerte/Produkte], was perfekt zu meinen beruflichen Zielen und Werten passt.

Gerne würde ich in einem persönlichen Gespräch erläutern, wie ich mit meiner Erfahrung und meinem Engagement zum Erfolg Ihres Teams beitragen kann.

Mit freundlichen Grüßen
{{firstName}} {{lastName}}`;
    }

    getModernITTemplate() {
        return `Hallo {{contactPerson}},

die Stellenausschreibung für {{jobTitle}} bei {{companyName}} hat sofort mein Interesse geweckt. Als [Berufsbezeichnung] mit Leidenschaft für [technische Bereiche] sehe ich hier die perfekte Gelegenheit, meine Expertise in [relevanten Technologien] einzubringen.

Meine bisherige Erfahrung umfasst [konkrete Projekte/Technologien], wobei ich besonders stolz auf [herausragende Erfolge] bin. In meiner aktuellen Position bei [Firma] konnte ich [konkrete Verbesserungen/Innovationen] umsetzen, die [messbare Ergebnisse] erzielten.

{{companyName}} ist für mich ein spannendes Unternehmen, weil [spezifische Gründe basierend auf Stellenausschreibung]. Die Möglichkeit, in einem [Unternehmenskultur/Arbeitsumfeld] zu arbeiten und dabei [konkrete Ziele/Projekte] voranzutreiben, motiviert mich sehr.

Ich freue mich darauf, in einem persönlichen Gespräch zu zeigen, wie ich mit meiner technischen Expertise und meinem Problemlösungsansatz zum Erfolg Ihres Teams beitragen kann.

Beste Grüße
{{firstName}} {{lastName}}`;
    }

    getCreativeMarketingTemplate() {
        return `Liebe/r {{contactPerson}},

{{jobTitle}} bei {{companyName}}? Das ist genau das, wonach ich gesucht habe! Als kreativer [Berufsbezeichnung] mit [X] Jahren Erfahrung in [relevanten Bereichen] bin ich begeistert von der Möglichkeit, bei einem so innovativen Unternehmen wie {{companyName}} zu arbeiten.

Meine Leidenschaft für [kreative Bereiche] und meine Erfahrung in [relevanten Projekten] haben mich zu einem Experten in [spezifische Skills] gemacht. Besonders stolz bin ich auf [kreative Projekte/Erfolge], die [messbare Ergebnisse] erzielt haben.

Was mich an {{companyName}} besonders fasziniert, ist [spezifische Gründe basierend auf Stellenausschreibung]. Die Möglichkeit, in einem kreativen und dynamischen Umfeld zu arbeiten und dabei [konkrete Ziele/Projekte] zu verwirklichen, ist genau das, was ich mir für meine berufliche Zukunft vorstelle.

Ich würde mich sehr freuen, in einem persönlichen Gespräch zu zeigen, wie ich mit meiner Kreativität und meinem Engagement innovative Lösungen für {{companyName}} entwickeln kann.

Herzliche Grüße
{{firstName}} {{lastName}}`;
    }

    saveCoverLetter() {
        if (!this.generatedContent) {
            this.showNotification('Kein Anschreiben zum Speichern vorhanden', 'error');
            return;
        }
        
        const jobData = this.collectJobData();
        const coverLetterData = {
            content: this.generatedContent,
            jobData: jobData,
            options: this.collectOptions(),
            createdAt: new Date().toISOString()
        };
        
        // Save to applications core
        this.applicationsCore.saveApplicationData(coverLetterData);
        
        this.showNotification('Anschreiben erfolgreich gespeichert!', 'success');
    }

    downloadCoverLetter() {
        if (!this.generatedContent) {
            this.showNotification('Kein Anschreiben zum Download vorhanden', 'error');
            return;
        }
        
        // Create PDF content
        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Bewerbungsanschreiben</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; margin: 40px; }
                    .header { margin-bottom: 30px; }
                    .content { white-space: pre-line; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h2>Bewerbungsanschreiben</h2>
                    <p><strong>Position:</strong> ${this.collectJobData().jobTitle}</p>
                    <p><strong>Unternehmen:</strong> ${this.collectJobData().companyName}</p>
                    <p><strong>Datum:</strong> ${new Date().toLocaleDateString('de-DE')}</p>
                </div>
                <div class="content">${this.generatedContent}</div>
            </body>
            </html>
        `;
        
        // Create and download file
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Bewerbungsanschreiben_${this.collectJobData().companyName}_${new Date().toISOString().split('T')[0]}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification('Anschreiben heruntergeladen!', 'success');
    }

    validateForm() {
        const requiredFields = ['jobTitle', 'companyName', 'jobDescription'];
        let isValid = true;
        
        requiredFields.forEach(fieldName => {
            const field = document.getElementById(fieldName);
            if (!field.value.trim()) {
                field.classList.add('error');
                isValid = false;
            } else {
                field.classList.remove('error');
            }
        });
        
        return isValid;
    }

    showLoading() {
        document.getElementById('loadingOverlay').style.display = 'flex';
    }

    hideLoading() {
        document.getElementById('loadingOverlay').style.display = 'none';
    }

    showNotification(message, type = 'info') {
        if (this.applicationsCore) {
            this.applicationsCore.showNotification(message, type);
        } else {
            // Fallback notification
            const notification = document.createElement('div');
            notification.className = `notification notification-${type}`;
            notification.innerHTML = `
                <div class="notification-content">
                    <i class="fas fa-${type === 'error' ? 'exclamation-circle' : type === 'success' ? 'check-circle' : 'info-circle'}"></i>
                    <span>${message}</span>
                </div>
            `;
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.remove();
            }, 5000);
        }
    }
}

// Global functions for template usage
function useTemplate(templateKey) {
    if (window.aiCoverLetterGenerator) {
        window.aiCoverLetterGenerator.useTemplate(templateKey);
    }
}

function handleContinue() {
    // Save final state
    if (window.aiCoverLetterGenerator && window.aiCoverLetterGenerator.generatedContent) {
        window.aiCoverLetterGenerator.saveCoverLetter();
    }
    
    // Show success message
    if (window.aiCoverLetterGenerator) {
        window.aiCoverLetterGenerator.showNotification('Bewerbung erfolgreich erstellt!', 'success');
    }
    
    // Redirect to next step
    setTimeout(() => {
        window.location.href = 'tracking-dashboard.html';
    }, 1500);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.aiCoverLetterGenerator = new AICoverLetterGenerator();
});












