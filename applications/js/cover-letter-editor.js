/**
 * ═══════════════════════════════════════════════════════════════════════════
 * COVER LETTER EDITOR
 * Phase 5: Responsive Anschreiben-Editor with AI Generation
 * ═══════════════════════════════════════════════════════════════════════════
 */

class CoverLetterEditor {
    constructor() {
        this.options = {
            tone: 'modern',
            length: 'medium',
            focus: 'experience'
        };
        
        this.design = {
            style: 'modern',
            font: 'Inter',
            color: '#6366f1',
            fontSize: 11,
            lineHeight: 1.6,
            margin: 25
        };
        
        this.isGenerating = false;
        this.generatedContent = '';
        this.profileData = null;
        
        this.init();
    }

    async init() {
        console.log('📝 Cover Letter Editor initializing...');
        
        // Setup event handlers
        this.setupOptionButtons();
        this.setupDesignControls();
        this.setupFormHandlers();
        this.setupGenerateButton();
        this.setupSaveExport();
        this.setupTextEditor();
        
        // Load user profile
        await this.loadUserProfile();
        
        // Set initial date
        this.setCurrentDate();
        
        console.log('✅ Cover Letter Editor ready');
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // EVENT HANDLERS
    // ═══════════════════════════════════════════════════════════════════════════

    setupOptionButtons() {
        document.querySelectorAll('.option-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const option = btn.dataset.option;
                const value = btn.dataset.value;
                
                // Update option
                this.options[option] = value;
                
                // Update active state
                const group = btn.closest('.option-buttons');
                group.querySelectorAll('.option-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
    }

    setupDesignControls() {
        // Style buttons
        document.querySelectorAll('.style-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const style = btn.dataset.style;
                this.design.style = style;
                
                document.querySelectorAll('.style-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                this.applyDesign();
            });
        });

        // Color buttons
        document.querySelectorAll('.color-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const color = btn.dataset.color;
                this.design.color = color;
                
                document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                this.applyDesign();
            });
        });

        // Font select
        const fontSelect = document.getElementById('fontSelect');
        if (fontSelect) {
            fontSelect.addEventListener('change', (e) => {
                this.design.font = e.target.value;
                this.applyDesign();
            });
        }

        // Sliders
        this.setupSlider('fontSizeSlider', 'fontSize', 'pt');
        this.setupSlider('lineHeightSlider', 'lineHeight', '');
        this.setupSlider('marginSlider', 'margin', 'mm');
    }

    setupSlider(sliderId, designKey, unit) {
        const slider = document.getElementById(sliderId);
        const valueEl = document.getElementById(sliderId.replace('Slider', 'Value'));
        
        if (slider && valueEl) {
            slider.value = this.design[designKey];
            valueEl.textContent = this.design[designKey] + unit;
            
            slider.addEventListener('input', (e) => {
                this.design[designKey] = parseFloat(e.target.value);
                valueEl.textContent = this.design[designKey] + unit;
                this.applyDesign();
            });
        }
    }

    setupFormHandlers() {
        const form = document.getElementById('jobInfoForm');
        if (form) {
            form.addEventListener('input', () => {
                this.validateForm();
            });
        }
    }

    setupGenerateButton() {
        const generateBtn = document.getElementById('generateBtn');
        if (generateBtn) {
            generateBtn.addEventListener('click', () => {
                this.generateCoverLetter();
            });
        }
    }

    setupSaveExport() {
        const saveBtn = document.getElementById('saveBtn');
        const exportBtn = document.getElementById('exportPdfBtn');
        
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveCoverLetter());
        }
        
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportToPDF());
        }
    }

    setupTextEditor() {
        const textarea = document.getElementById('letterText');
        if (textarea) {
            textarea.addEventListener('input', () => {
                this.updateStats();
                this.generatedContent = textarea.value;
            });
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // USER PROFILE
    // ═══════════════════════════════════════════════════════════════════════════

    async loadUserProfile() {
        try {
            // Try cloud data service first
            if (window.cloudDataService) {
                this.profileData = await window.cloudDataService.loadProfile();
            }
            
            // Fallback to localStorage
            if (!this.profileData || Object.keys(this.profileData).length === 0) {
                const stored = localStorage.getItem('userProfile') || localStorage.getItem('profile_data');
                if (stored) {
                    this.profileData = JSON.parse(stored);
                }
            }
            
            // Update sender info
            if (this.profileData) {
                this.updateSenderInfo();
            }
            
            console.log('👤 Profile loaded:', this.profileData ? 'Yes' : 'No');
        } catch (error) {
            console.warn('Could not load profile:', error);
        }
    }

    updateSenderInfo() {
        if (!this.profileData) return;
        
        const nameEl = document.getElementById('senderName');
        const addressEl = document.getElementById('senderAddress');
        const contactEl = document.getElementById('senderContact');
        const signatureEl = document.getElementById('signatureName');
        
        const firstName = this.profileData.firstName || this.profileData.name?.split(' ')[0] || '';
        const lastName = this.profileData.lastName || this.profileData.name?.split(' ').slice(1).join(' ') || '';
        const fullName = `${firstName} ${lastName}`.trim() || 'Ihr Name';
        
        if (nameEl) nameEl.textContent = fullName;
        if (signatureEl) signatureEl.textContent = fullName;
        
        if (addressEl) {
            const address = this.profileData.address || this.profileData.location || '';
            addressEl.textContent = address || 'Ihre Adresse';
        }
        
        if (contactEl) {
            const email = this.profileData.email || '';
            const phone = this.profileData.phone || '';
            contactEl.textContent = [email, phone].filter(Boolean).join(' | ') || 'Ihre Kontaktdaten';
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // COVER LETTER GENERATION
    // ═══════════════════════════════════════════════════════════════════════════

    async generateCoverLetter() {
        if (this.isGenerating) return;
        
        if (!this.validateForm()) {
            this.showToast('Bitte füllen Sie alle Pflichtfelder aus', 'error');
            return;
        }
        
        this.isGenerating = true;
        this.showLoading();
        
        try {
            const jobData = this.collectJobData();
            const apiKey = await this.getAPIKey();
            
            let content;
            if (apiKey) {
                content = await this.generateWithAI(jobData, apiKey);
            } else {
                this.showToast('Kein API-Key gefunden. Verwende Template.', 'warning');
                content = this.generateFromTemplate(jobData);
            }
            
            this.displayGeneratedLetter(content, jobData);
            this.showToast('Anschreiben erfolgreich generiert!', 'success');
            
        } catch (error) {
            console.error('Generation error:', error);
            this.showToast('Fehler bei der Generierung. Verwende Template.', 'warning');
            
            // Fallback to template
            const jobData = this.collectJobData();
            const content = this.generateFromTemplate(jobData);
            this.displayGeneratedLetter(content, jobData);
        } finally {
            this.isGenerating = false;
            this.hideLoading();
        }
    }

    collectJobData() {
        return {
            jobTitle: document.getElementById('jobTitle')?.value || '',
            companyName: document.getElementById('companyName')?.value || '',
            industry: document.getElementById('industry')?.value || '',
            contactPerson: document.getElementById('contactPerson')?.value || '',
            jobDescription: document.getElementById('jobDescription')?.value || ''
        };
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
            if (globalKeys.openai?.key && !globalKeys.openai.key.includes('...')) {
                return globalKeys.openai.key;
            }
        } catch (e) {}
        
        return null;
    }

    async generateWithAI(jobData, apiKey) {
        const prompt = this.buildPrompt(jobData);
        
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
                        content: 'Du bist ein professioneller Bewerbungsberater. Erstelle überzeugende Anschreiben auf Deutsch.'
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

    buildPrompt(jobData) {
        const toneMap = {
            formal: 'professionell und sachlich',
            modern: 'zeitgemäß und dynamisch',
            creative: 'originell und einzigartig'
        };
        
        const lengthMap = {
            short: 'ca. 150 Wörter',
            medium: 'ca. 250 Wörter',
            long: 'ca. 350 Wörter'
        };
        
        const focusMap = {
            experience: 'Berufserfahrung und Erfolge',
            skills: 'technische Fähigkeiten',
            motivation: 'persönliche Motivation'
        };
        
        const profile = this.profileData || {};
        
        return `
Erstelle ein Bewerbungsanschreiben für:

POSITION: ${jobData.jobTitle}
UNTERNEHMEN: ${jobData.companyName}
BRANCHE: ${jobData.industry || 'Nicht angegeben'}

STELLENBESCHREIBUNG:
${jobData.jobDescription}

BEWERBER:
- Name: ${profile.firstName || ''} ${profile.lastName || ''}
- Skills: ${profile.skills?.join(', ') || 'Nicht angegeben'}

ANFORDERUNGEN:
- Tonalität: ${toneMap[this.options.tone]}
- Länge: ${lengthMap[this.options.length]}
- Schwerpunkt: ${focusMap[this.options.focus]}

Erstelle nur den Haupttext des Anschreibens (ohne Anrede und Grußformel).
`;
    }

    generateFromTemplate(jobData) {
        const profile = this.profileData || {};
        const firstName = profile.firstName || 'Max';
        const lastName = profile.lastName || 'Mustermann';
        
        const templates = {
            formal: `mit großem Interesse habe ich Ihre Stellenausschreibung für die Position als ${jobData.jobTitle} bei ${jobData.companyName} gelesen.

In meiner bisherigen Tätigkeit konnte ich umfangreiche Erfahrungen sammeln, die hervorragend zu den Anforderungen dieser Position passen. Meine Fähigkeiten und mein Engagement haben mir ermöglicht, in verschiedenen Projekten erfolgreich zu sein.

Die Möglichkeit, bei ${jobData.companyName} zu arbeiten, reizt mich besonders, da Ihr Unternehmen für Innovation und Qualität steht. Ich bin überzeugt, dass ich mit meiner Expertise einen wertvollen Beitrag zu Ihrem Team leisten kann.

Gerne würde ich in einem persönlichen Gespräch erläutern, wie ich mit meiner Erfahrung zum Erfolg Ihres Unternehmens beitragen kann.`,

            modern: `die Stellenausschreibung für ${jobData.jobTitle} bei ${jobData.companyName} hat sofort mein Interesse geweckt. Als leidenschaftlicher Fachexperte sehe ich hier die perfekte Gelegenheit, meine Expertise einzubringen.

Meine bisherige Erfahrung hat mir gezeigt, dass ich komplexe Herausforderungen erfolgreich meistern kann. Besonders in den Bereichen, die für diese Position relevant sind, konnte ich bereits überzeugende Ergebnisse erzielen.

${jobData.companyName} ist für mich ein spannendes Unternehmen, weil es Innovation mit praktischer Exzellenz verbindet. Die Möglichkeit, in diesem dynamischen Umfeld zu arbeiten, motiviert mich sehr.

Ich freue mich darauf, in einem Gespräch zu zeigen, wie ich mit meiner Expertise zum Erfolg Ihres Teams beitragen kann.`,

            creative: `${jobData.jobTitle} bei ${jobData.companyName}? Das klingt nach genau der Herausforderung, die ich suche!

Mit meiner Erfahrung und meiner Begeisterung für diesen Bereich bringe ich genau die Mischung mit, die für diese Position ideal ist. Kreativität, analytisches Denken und praktische Umsetzungskraft – das sind die Stärken, die mich auszeichnen.

Was mich an ${jobData.companyName} besonders fasziniert, ist Ihr innovativer Ansatz. In einem solchen Umfeld kann ich meine Fähigkeiten optimal einsetzen und gleichzeitig von inspirierenden Kollegen lernen.

Lassen Sie uns gemeinsam herausfinden, wie ich Ihrem Team neue Impulse geben kann!`
        };
        
        return templates[this.options.tone] || templates.modern;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // DISPLAY & UI
    // ═══════════════════════════════════════════════════════════════════════════

    displayGeneratedLetter(content, jobData) {
        // Hide empty state
        const emptyState = document.getElementById('emptyState');
        if (emptyState) emptyState.style.display = 'none';
        
        // Show generated letter
        const generatedLetter = document.getElementById('generatedLetter');
        if (generatedLetter) generatedLetter.style.display = 'block';
        
        // Show toolbar
        const toolbar = document.getElementById('editorToolbar');
        if (toolbar) toolbar.style.display = 'flex';
        
        // Update letter content
        const letterText = document.getElementById('letterText');
        if (letterText) {
            letterText.value = content;
            this.generatedContent = content;
        }
        
        // Update company info
        const companyDisplay = document.getElementById('companyNameDisplay');
        if (companyDisplay) companyDisplay.textContent = jobData.companyName;
        
        const contactDisplay = document.getElementById('contactPersonDisplay');
        if (contactDisplay) {
            contactDisplay.textContent = jobData.contactPerson 
                ? `z.Hd. ${jobData.contactPerson}`
                : 'Personalabteilung';
        }
        
        // Update subject line
        const subjectLine = document.getElementById('subjectLine');
        if (subjectLine) {
            subjectLine.textContent = `Bewerbung als ${jobData.jobTitle}`;
        }
        
        // Update stats
        this.updateStats();
        
        // Apply design
        this.applyDesign();
    }

    applyDesign() {
        const letter = document.querySelector('.generated-letter');
        if (!letter) return;
        
        letter.style.setProperty('--letter-font', `'${this.design.font}', sans-serif`);
        letter.style.setProperty('--letter-font-size', `${this.design.fontSize}pt`);
        letter.style.setProperty('--letter-line-height', this.design.lineHeight);
        letter.style.setProperty('--letter-margin', `${this.design.margin}mm`);
        letter.style.setProperty('--letter-accent', this.design.color);
        
        letter.style.fontFamily = `'${this.design.font}', sans-serif`;
        letter.style.fontSize = `${this.design.fontSize}pt`;
        letter.style.lineHeight = this.design.lineHeight;
        letter.style.padding = `${this.design.margin}mm`;
    }

    updateStats() {
        const textarea = document.getElementById('letterText');
        if (!textarea) return;
        
        const text = textarea.value;
        const words = text.trim().split(/\s+/).filter(w => w.length > 0).length;
        const chars = text.length;
        
        const wordCount = document.getElementById('wordCount');
        const charCount = document.getElementById('charCount');
        
        if (wordCount) wordCount.textContent = words;
        if (charCount) charCount.textContent = chars;
    }

    setCurrentDate() {
        const dateEl = document.getElementById('letterDate');
        if (dateEl) {
            const today = new Date().toLocaleDateString('de-DE', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
            dateEl.textContent = today;
        }
    }

    showLoading() {
        const loading = document.getElementById('loadingAnimation');
        if (loading) loading.style.display = 'flex';
    }

    hideLoading() {
        const loading = document.getElementById('loadingAnimation');
        if (loading) loading.style.display = 'none';
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // VALIDATION
    // ═══════════════════════════════════════════════════════════════════════════

    validateForm() {
        const requiredFields = ['jobTitle', 'companyName', 'jobDescription'];
        let isValid = true;
        
        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                if (!field.value.trim()) {
                    field.classList.add('error');
                    isValid = false;
                } else {
                    field.classList.remove('error');
                }
            }
        });
        
        return isValid;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // SAVE & EXPORT
    // ═══════════════════════════════════════════════════════════════════════════

    async saveCoverLetter() {
        if (!this.generatedContent) {
            this.showToast('Kein Anschreiben zum Speichern', 'error');
            return;
        }
        
        const jobData = this.collectJobData();
        const data = {
            content: this.generatedContent,
            jobData: jobData,
            options: this.options,
            design: this.design,
            createdAt: new Date().toISOString()
        };
        
        try {
            // Save to cloud if available
            if (window.cloudDataService) {
                await window.cloudDataService.saveCoverLetter(data);
            }
            
            // Also save to localStorage
            const stored = JSON.parse(localStorage.getItem('cover_letters') || '[]');
            stored.push(data);
            localStorage.setItem('cover_letters', JSON.stringify(stored));
            
            this.showToast('Anschreiben gespeichert!', 'success');
        } catch (error) {
            console.error('Save error:', error);
            this.showToast('Fehler beim Speichern', 'error');
        }
    }

    exportToPDF() {
        if (!this.generatedContent) {
            this.showToast('Kein Anschreiben zum Exportieren', 'error');
            return;
        }
        
        // Use browser print functionality
        window.print();
        
        this.showToast('PDF-Export gestartet', 'success');
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // TOAST NOTIFICATIONS
    // ═══════════════════════════════════════════════════════════════════════════

    showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        if (!container) return;
        
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <i class="fas ${icons[type]}"></i>
            <span>${message}</span>
        `;
        
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideIn 0.3s ease-out reverse';
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// GLOBAL FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

function formatText(format) {
    const textarea = document.getElementById('letterText');
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    
    let formattedText = selectedText;
    if (format === 'bold') {
        formattedText = `**${selectedText}**`;
    } else if (format === 'italic') {
        formattedText = `*${selectedText}*`;
    }
    
    textarea.value = textarea.value.substring(0, start) + formattedText + textarea.value.substring(end);
}

async function regenerateParagraph() {
    if (window.coverLetterEditor) {
        window.coverLetterEditor.showToast('Absatz wird neu generiert...', 'info');
        // Implementation would regenerate selected paragraph
    }
}

async function improveSelected() {
    if (window.coverLetterEditor) {
        window.coverLetterEditor.showToast('Text wird verbessert...', 'info');
        // Implementation would improve selected text
    }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    window.coverLetterEditor = new CoverLetterEditor();
});
