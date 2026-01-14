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
            margin: 25,
            paragraphSpacing: 10,
            signatureGap: 32,
            signatureImage: ''
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
        this.setupPlaceholderButtons();
        this.setupBlocksEditor();
        this.setupVersions();
        this.setupCoverLetterSelection();
        
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
        this.setupSlider('paragraphSpacingSlider', 'paragraphSpacing', 'px');
        this.setupSlider('signatureSpacingSlider', 'signatureGap', 'px');

        // Signature upload
        const signatureUpload = document.getElementById('signatureUpload');
        const removeSignatureBtn = document.getElementById('removeSignatureBtn');
        if (signatureUpload) {
            signatureUpload.addEventListener('change', (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => {
                    this.design.signatureImage = reader.result;
                    this.applyDesign();
                };
                reader.readAsDataURL(file);
            });
        }
        if (removeSignatureBtn) {
            removeSignatureBtn.addEventListener('click', () => {
                this.design.signatureImage = '';
                if (signatureUpload) signatureUpload.value = '';
                this.applyDesign();
            });
        }

        // Sync CV design
        const syncCvBtn = document.getElementById('syncCvDesignBtn');
        if (syncCvBtn) {
            syncCvBtn.addEventListener('click', () => {
                this.syncFromResumeDesign();
            });
        }
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
                this.updateQualityChecks();
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
        const exportTxtBtn = document.getElementById('exportTxtBtn');
        const versionsBtn = document.getElementById('versionsBtn');
        
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveCoverLetter());
        }
        
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportToPDF());
        }

        if (exportTxtBtn) {
            exportTxtBtn.addEventListener('click', () => this.exportToText());
        }

        if (versionsBtn) {
            versionsBtn.addEventListener('click', () => this.openVersionsModal());
        }
    }

    setupTextEditor() {
        const textarea = document.getElementById('letterText');
        if (textarea) {
            textarea.addEventListener('input', () => {
                this.updateStats();
                this.generatedContent = textarea.value;
                this.updateQualityChecks();
            });
        }
    }

    setupPlaceholderButtons() {
        document.querySelectorAll('.placeholder-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const token = btn.dataset.placeholder;
                const textarea = document.getElementById('letterText');
                if (!textarea) return;
                this.insertAtCursor(textarea, token);
                textarea.focus();
                this.updateStats();
            });
        });
    }

    setupBlocksEditor() {
        const openBtn = document.getElementById('openBlocksEditor');
        const closeBtn = document.getElementById('closeBlocksEditor');
        const cancelBtn = document.getElementById('cancelBlocksBtn');
        const saveBtn = document.getElementById('saveBlocksBtn');
        const addBtn = document.getElementById('addBlockBtn');

        if (openBtn) openBtn.addEventListener('click', () => this.openBlocksEditor());
        if (closeBtn) closeBtn.addEventListener('click', () => this.closeBlocksEditor());
        if (cancelBtn) cancelBtn.addEventListener('click', () => this.closeBlocksEditor());
        if (saveBtn) saveBtn.addEventListener('click', () => this.saveBlocks());
        if (addBtn) addBtn.addEventListener('click', () => this.addBlock(''));
    }

    setupVersions() {
        const closeBtn = document.getElementById('closeVersionsModal');
        const saveBtn = document.getElementById('saveCoverLetterVersion');
        if (closeBtn) closeBtn.addEventListener('click', () => this.closeVersionsModal());
        if (saveBtn) saveBtn.addEventListener('click', () => this.saveCoverLetterVersion());
    }

    setupCoverLetterSelection() {
        const select = document.getElementById('coverLetterSelect');
        const loadBtn = document.getElementById('loadCoverLetterBtn');
        if (!select) return;
        
        select.addEventListener('change', () => {
            if (select.value) {
                this.loadCoverLetterById(select.value);
            }
        });
        
        if (loadBtn) {
            loadBtn.addEventListener('click', () => {
                if (select.value) {
                    this.loadCoverLetterById(select.value);
                }
            });
        }
        
        this.loadCoverLetterOptions();
    }

    async loadCoverLetterOptions() {
        try {
            let coverLetters = [];
            if (window.cloudDataService) {
                coverLetters = await window.cloudDataService.getCoverLetters(true);
            }
            
            if (!coverLetters || coverLetters.length === 0) {
                const stored = localStorage.getItem('cover_letter_drafts') || localStorage.getItem('cover_letters');
                coverLetters = stored ? JSON.parse(stored) : [];
            }
            
            this.coverLetters = (coverLetters || []).map((letter) => ({
                ...letter,
                id: letter.id || `cl_${(letter.createdAt || Date.now()).toString().replace(/[^0-9]/g, '')}`
            }));
            
            const select = document.getElementById('coverLetterSelect');
            if (!select) return;
            
            const options = ['<option value="">Bitte auswählen</option>'];
            this.coverLetters.forEach((letter) => {
                const company = letter.jobData?.companyName || 'Unbekannt';
                const position = letter.jobData?.jobTitle || 'Anschreiben';
                const date = new Date(letter.createdAt || Date.now()).toLocaleDateString('de-DE');
                options.push(`<option value="${letter.id}">${company} • ${position} (${date})</option>`);
            });
            
            select.innerHTML = options.join('');
        } catch (error) {
            console.warn('Konnte Anschreiben-Liste nicht laden:', error);
        }
    }

    loadCoverLetterById(id) {
        const letter = (this.coverLetters || []).find(item => item.id === id);
        if (!letter) {
            this.showToast('Anschreiben nicht gefunden', 'error');
            return;
        }
        
        const jobData = letter.jobData || {};
        const jobFields = {
            jobTitle: jobData.jobTitle || '',
            companyName: jobData.companyName || '',
            industry: jobData.industry || '',
            contactPerson: jobData.contactPerson || '',
            jobDescription: jobData.jobDescription || ''
        };
        
        Object.entries(jobFields).forEach(([id, value]) => {
            const field = document.getElementById(id);
            if (field) field.value = value;
        });
        
        if (letter.options) {
            this.options = { ...this.options, ...letter.options };
            this.syncOptionButtons();
        }
        
        if (letter.design) {
            this.design = { ...this.design, ...letter.design };
            this.syncDesignControls();
        }
        
        this.displayGeneratedLetter(letter.content || '', jobData);
        this.showToast('Anschreiben geladen', 'success');
    }

    syncOptionButtons() {
        ['tone', 'length', 'focus'].forEach((option) => {
            const value = this.options[option];
            document.querySelectorAll(`.option-btn[data-option="${option}"]`).forEach(btn => {
                btn.classList.toggle('active', btn.dataset.value === value);
            });
        });
    }

    syncDesignControls() {
        const fontSelect = document.getElementById('fontSelect');
        if (fontSelect) fontSelect.value = this.design.font;
        
        const setSliderValue = (sliderId, value, unit) => {
            const slider = document.getElementById(sliderId);
            const valueEl = document.getElementById(sliderId.replace('Slider', 'Value'));
            if (slider) slider.value = value;
            if (valueEl) valueEl.textContent = `${value}${unit}`;
        };
        
        setSliderValue('fontSizeSlider', this.design.fontSize, 'pt');
        setSliderValue('lineHeightSlider', this.design.lineHeight, '');
        setSliderValue('marginSlider', this.design.margin, 'mm');
        setSliderValue('paragraphSpacingSlider', this.design.paragraphSpacing, 'px');
        setSliderValue('signatureSpacingSlider', this.design.signatureGap, 'px');
        
        document.querySelectorAll('.style-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.style === this.design.style);
        });
        
        document.querySelectorAll('.color-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.color === this.design.color);
        });
        
        this.applyDesign();
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // USER PROFILE
    // ═══════════════════════════════════════════════════════════════════════════

    async loadUserProfile() {
        try {
            // Try cloud data service first
            if (window.cloudDataService) {
                this.profileData = await window.cloudDataService.getProfile();
            }
            
            // Fallback to localStorage
            if (!this.profileData || Object.keys(this.profileData).length === 0) {
                const stored = localStorage.getItem('bewerbungsmanager_profile') || localStorage.getItem('userProfile') || localStorage.getItem('profile_data');
                if (stored) {
                    this.profileData = JSON.parse(stored);
                }
            }
            
            // Merge coaching data from localStorage if missing
            if (this.profileData && !this.profileData.coaching) {
                try {
                    const coachingRaw = localStorage.getItem('coaching_workflow_data');
                    if (coachingRaw) {
                        this.profileData.coaching = JSON.parse(coachingRaw);
                    }
                } catch (error) {
                    console.warn('Could not parse coaching data:', error);
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
        const coaching = profile.coaching || {};
        const coachingStrengths = [
            coaching.naturalTalents,
            coaching.acquiredSkills,
            coaching.uniqueStrengths
        ].filter(Boolean).join(', ');
        const coachingMotivation = coaching.motivators || coaching.shortTermGoals || coaching.dreamJob || '';
        
        return `
Erstelle ein Bewerbungsanschreiben für:

POSITION: ${jobData.jobTitle}
UNTERNEHMEN: ${jobData.companyName}
BRANCHE: ${jobData.industry || 'Nicht angegeben'}

STELLENBESCHREIBUNG:
${jobData.jobDescription}

BEWERBER:
- Name: ${profile.firstName || ''} ${profile.lastName || ''}
- Skills: ${profile.skills?.join(', ') || coachingStrengths || 'Nicht angegeben'}
- Motivation/Ziele: ${coachingMotivation || profile.summary || 'Nicht angegeben'}

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
            const withPlaceholders = this.applyPlaceholders(content, jobData);
            letterText.value = withPlaceholders;
            this.generatedContent = withPlaceholders;
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
        this.updateQualityChecks();
    }

    applyDesign() {
        const letter = document.querySelector('.generated-letter');
        if (!letter) return;
        
        letter.style.setProperty('--letter-font', `'${this.design.font}', sans-serif`);
        letter.style.setProperty('--letter-font-size', `${this.design.fontSize}pt`);
        letter.style.setProperty('--letter-line-height', this.design.lineHeight);
        letter.style.setProperty('--letter-margin', `${this.design.margin}mm`);
        letter.style.setProperty('--letter-accent', this.design.color);
        letter.style.setProperty('--letter-paragraph-gap', `${this.design.paragraphSpacing}px`);
        letter.style.setProperty('--letter-signature-gap', `${this.design.signatureGap}px`);
        
        letter.style.fontFamily = `'${this.design.font}', sans-serif`;
        letter.style.fontSize = `${this.design.fontSize}pt`;
        letter.style.lineHeight = this.design.lineHeight;
        letter.style.padding = `${this.design.margin}mm`;

        const signatureImg = document.getElementById('signatureImage');
        if (signatureImg) {
            if (this.design.signatureImage) {
                signatureImg.src = this.design.signatureImage;
                signatureImg.style.display = 'block';
            } else {
                signatureImg.removeAttribute('src');
                signatureImg.style.display = 'none';
            }
        }
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
        const content = this.getFinalLetterContent();
        const data = {
            id: `cl_${Date.now().toString(36)}`,
            content: content,
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
            const stored = JSON.parse(localStorage.getItem('cover_letter_drafts') || '[]');
            stored.push(data);
            localStorage.setItem('cover_letter_drafts', JSON.stringify(stored));
            
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
        this.replaceLetterContentForExport(() => window.print());
        
        this.showToast('PDF-Export gestartet', 'success');
    }

    exportToText() {
        if (!this.generatedContent) {
            this.showToast('Kein Anschreiben zum Exportieren', 'error');
            return;
        }
        const content = this.getFinalLetterContent();
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Anschreiben_${(this.collectJobData().companyName || 'bewerbung').replace(/\s+/g, '_')}.txt`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        this.showToast('Text-Export gestartet', 'success');
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

    // ═══════════════════════════════════════════════════════════════════════════
    // PLACEHOLDERS & EXPORT HELPERS
    // ═══════════════════════════════════════════════════════════════════════════

    applyPlaceholders(text, jobData) {
        const profile = this.profileData || {};
        const replacements = {
            '{{companyName}}': jobData.companyName || '',
            '{{jobTitle}}': jobData.jobTitle || '',
            '{{contactPerson}}': jobData.contactPerson || '',
            '{{firstName}}': profile.firstName || '',
            '{{lastName}}': profile.lastName || '',
            '{{location}}': profile.location || profile.address || ''
        };
        let result = text;
        Object.entries(replacements).forEach(([token, value]) => {
            result = result.split(token).join(value);
        });
        return result;
    }

    getFinalLetterContent() {
        const jobData = this.collectJobData();
        const content = document.getElementById('letterText')?.value || this.generatedContent || '';
        return this.applyPlaceholders(content, jobData).trim();
    }

    replaceLetterContentForExport(action) {
        const textarea = document.getElementById('letterText');
        if (!textarea) {
            action();
            return;
        }
        const original = textarea.value;
        textarea.value = this.getFinalLetterContent();
        setTimeout(() => {
            action();
            textarea.value = original;
        }, 50);
    }

    insertAtCursor(textarea, text) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        textarea.value = textarea.value.substring(0, start) + text + textarea.value.substring(end);
        textarea.selectionStart = textarea.selectionEnd = start + text.length;
        this.generatedContent = textarea.value;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // BLOCKS EDITOR
    // ═══════════════════════════════════════════════════════════════════════════

    openBlocksEditor() {
        const modal = document.getElementById('blocksEditorModal');
        if (modal) {
            modal.classList.add('active');
            this.renderBlocks();
        }
    }

    closeBlocksEditor() {
        const modal = document.getElementById('blocksEditorModal');
        if (modal) modal.classList.remove('active');
    }

    renderBlocks(blocksOverride) {
        const container = document.getElementById('blocksContainer');
        if (!container) return;
        const blocks = blocksOverride || this.getBlocksFromText();
        if (!blocks.length) {
            blocks.push('Einleitung...', 'Motivation...', 'Passung...', 'Abschluss...');
        }
        container.innerHTML = blocks.map((block, idx) => `
            <div class="block-item" data-index="${idx}">
                <div class="block-item-header">
                    <strong>Absatz ${idx + 1}</strong>
                    <div class="block-item-actions">
                        <button type="button" data-action="up">↑</button>
                        <button type="button" data-action="down">↓</button>
                        <button type="button" data-action="delete">✕</button>
                    </div>
                </div>
                <textarea>${block}</textarea>
            </div>
        `).join('');

        container.querySelectorAll('.block-item-actions button').forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.action;
                const item = btn.closest('.block-item');
                if (!item) return;
                if (action === 'delete') {
                    item.remove();
                } else if (action === 'up') {
                    const prev = item.previousElementSibling;
                    if (prev) item.parentNode.insertBefore(item, prev);
                } else if (action === 'down') {
                    const next = item.nextElementSibling;
                    if (next) item.parentNode.insertBefore(next, item);
                }
                this.updateBlockIndices();
            });
        });
    }

    updateBlockIndices() {
        document.querySelectorAll('#blocksContainer .block-item').forEach((item, idx) => {
            const label = item.querySelector('strong');
            if (label) label.textContent = `Absatz ${idx + 1}`;
        });
    }

    addBlock(text) {
        const container = document.getElementById('blocksContainer');
        if (!container) return;
        const blocks = Array.from(container.querySelectorAll('textarea'))
            .map(t => t.value.trim())
            .filter(Boolean);
        blocks.push(text);
        container.innerHTML = blocks.map((block, idx) => `
            <div class="block-item" data-index="${idx}">
                <div class="block-item-header">
                    <strong>Absatz ${idx + 1}</strong>
                    <div class="block-item-actions">
                        <button type="button" data-action="up">↑</button>
                        <button type="button" data-action="down">↓</button>
                        <button type="button" data-action="delete">✕</button>
                    </div>
                </div>
                <textarea>${block}</textarea>
            </div>
        `).join('');
        this.renderBlocks(blocks);
    }

    getBlocksFromText() {
        const text = document.getElementById('letterText')?.value || '';
        return text.split(/\n\s*\n/).map(t => t.trim()).filter(Boolean);
    }

    saveBlocks() {
        const container = document.getElementById('blocksContainer');
        const textarea = document.getElementById('letterText');
        if (!container || !textarea) return;
        const blocks = Array.from(container.querySelectorAll('textarea'))
            .map(t => t.value.trim())
            .filter(Boolean);
        textarea.value = blocks.join(this.getParagraphSeparator());
        this.generatedContent = textarea.value;
        this.updateStats();
        this.closeBlocksEditor();
        this.showToast('Absätze übernommen', 'success');
    }

    getParagraphSeparator() {
        if (this.design.paragraphSpacing >= 14) return '\n\n\n';
        if (this.design.paragraphSpacing >= 8) return '\n\n';
        return '\n';
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // QUALITY CHECKS
    // ═══════════════════════════════════════════════════════════════════════════

    updateQualityChecks() {
        const list = document.getElementById('qualityCheckList');
        if (!list) return;
        const text = (document.getElementById('letterText')?.value || '').trim();
        const words = text.split(/\s+/).filter(Boolean);
        const wordCount = words.length;

        const checks = [];
        const lengthOk = wordCount >= 150 && wordCount <= 400;
        checks.push({ ok: lengthOk, text: `Länge ${wordCount} Wörter (ideal 150–400)` });

        const duplicates = this.findDuplicateSentences(text);
        checks.push({ ok: duplicates.length === 0, text: duplicates.length ? `Doppelte Sätze gefunden (${duplicates.length})` : 'Keine doppelten Sätze' });

        const keywordScore = this.getKeywordMatchScore(text);
        checks.push({ ok: keywordScore >= 40, text: `Keyword-Match: ${keywordScore}%` });

        list.innerHTML = checks.map(check => `
            <div class="quality-check-item ${check.ok ? 'ok' : 'warn'}">
                <i class="fas ${check.ok ? 'fa-check-circle' : 'fa-exclamation-triangle'}"></i>
                <span>${check.text}</span>
            </div>
        `).join('');
    }

    findDuplicateSentences(text) {
        const sentences = text.split(/[.!?]\s+/).map(s => s.trim().toLowerCase()).filter(Boolean);
        const seen = new Set();
        const duplicates = [];
        sentences.forEach(sentence => {
            if (seen.has(sentence)) duplicates.push(sentence);
            else seen.add(sentence);
        });
        return duplicates;
    }

    getKeywordMatchScore(text) {
        const jobDescription = document.getElementById('jobDescription')?.value || '';
        const tokens = jobDescription
            .toLowerCase()
            .replace(/[^a-zäöüß0-9\s]/g, ' ')
            .split(/\s+/)
            .filter(word => word.length >= 4);
        const unique = Array.from(new Set(tokens)).slice(0, 12);
        if (!unique.length) return 0;
        const lower = text.toLowerCase();
        const hits = unique.filter(word => lower.includes(word)).length;
        return Math.round((hits / unique.length) * 100);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // VERSIONS
    // ═══════════════════════════════════════════════════════════════════════════

    openVersionsModal() {
        const modal = document.getElementById('coverLetterVersionsModal');
        if (modal) {
            modal.classList.add('active');
            this.renderVersions();
        }
    }

    closeVersionsModal() {
        const modal = document.getElementById('coverLetterVersionsModal');
        if (modal) modal.classList.remove('active');
    }

    saveCoverLetterVersion() {
        const nameInput = document.getElementById('coverLetterVersionName');
        const name = nameInput?.value.trim() || `Version ${new Date().toLocaleDateString('de-DE')}`;
        const data = {
            content: this.getFinalLetterContent(),
            jobData: this.collectJobData(),
            options: this.options,
            design: this.design,
            createdAt: new Date().toISOString()
        };
        const versions = JSON.parse(localStorage.getItem('cover_letter_versions') || '[]');
        versions.unshift({ id: Date.now().toString(36), name, data });
        localStorage.setItem('cover_letter_versions', JSON.stringify(versions));
        if (nameInput) nameInput.value = '';
        this.renderVersions();
        this.showToast('Version gespeichert', 'success');
    }

    renderVersions() {
        const list = document.getElementById('coverLetterVersionsList');
        if (!list) return;
        const versions = JSON.parse(localStorage.getItem('cover_letter_versions') || '[]');
        if (!versions.length) {
            list.innerHTML = '<p style="color:#6b7280;">Noch keine Versionen gespeichert.</p>';
            return;
        }
        list.innerHTML = versions.map(version => `
            <div class="resume-version-item">
                <div class="resume-version-meta">
                    <div class="resume-version-title">${version.name}</div>
                    <div class="resume-version-date">${new Date(version.data.createdAt).toLocaleString('de-DE')}</div>
                </div>
                <div class="resume-version-actions">
                    <button type="button" onclick="window.coverLetterEditor.loadCoverLetterVersion('${version.id}')">Laden</button>
                    <button type="button" onclick="window.coverLetterEditor.deleteCoverLetterVersion('${version.id}')">Löschen</button>
                </div>
            </div>
        `).join('');
    }

    loadCoverLetterVersion(versionId) {
        const versions = JSON.parse(localStorage.getItem('cover_letter_versions') || '[]');
        const version = versions.find(v => v.id === versionId);
        if (!version) return;
        const { content, jobData = {}, options = {}, design = {} } = version.data || {};
        document.getElementById('jobTitle').value = jobData.jobTitle || '';
        document.getElementById('companyName').value = jobData.companyName || '';
        document.getElementById('industry').value = jobData.industry || '';
        document.getElementById('contactPerson').value = jobData.contactPerson || '';
        document.getElementById('jobDescription').value = jobData.jobDescription || '';
        document.getElementById('letterText').value = content || '';
        this.generatedContent = content || '';
        this.options = { ...this.options, ...options };
        this.design = { ...this.design, ...design };
        this.applyDesign();
        this.updateStats();
        this.updateQualityChecks();
        this.closeVersionsModal();
        this.showToast('Version geladen', 'success');
    }

    deleteCoverLetterVersion(versionId) {
        const versions = JSON.parse(localStorage.getItem('cover_letter_versions') || '[]');
        const filtered = versions.filter(v => v.id !== versionId);
        localStorage.setItem('cover_letter_versions', JSON.stringify(filtered));
        this.renderVersions();
        this.showToast('Version gelöscht', 'info');
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // SYNC FROM RESUME DESIGN
    // ═══════════════════════════════════════════════════════════════════════════

    syncFromResumeDesign() {
        try {
            const resumeDesign = JSON.parse(localStorage.getItem('resume_design_settings') || '{}');
            if (!resumeDesign || Object.keys(resumeDesign).length === 0) {
                this.showToast('Kein CV-Design gefunden', 'warning');
                return;
            }
            this.design.font = (resumeDesign.fontFamily || '').replace(/['"]/g, '') || this.design.font;
            this.design.fontSize = resumeDesign.fontSize || this.design.fontSize;
            this.design.lineHeight = resumeDesign.lineHeight || this.design.lineHeight;
            this.design.color = resumeDesign.accentColor || this.design.color;
            this.design.margin = resumeDesign.marginTop || this.design.margin;
            this.applyDesign();
            this.showToast('CV-Design übernommen', 'success');
        } catch (error) {
            console.warn('CV Design sync failed:', error);
            this.showToast('CV-Design konnte nicht übernommen werden', 'error');
        }
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
