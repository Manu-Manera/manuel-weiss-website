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
            focus: 'experience',
            goal: 'role-fit'
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
        this.activeBlockIndex = null;
        
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

        // Signature upload with background extraction and drag & drop
        const signatureUpload = document.getElementById('signatureUpload');
        const removeSignatureBtn = document.getElementById('removeSignatureBtn');
        if (signatureUpload) {
            signatureUpload.addEventListener('change', async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                try {
                    const extractedSignature = await this.extractSignatureFromImage(file);
                    this.design.signatureImage = extractedSignature;
                    this.design.signaturePosition = { x: 0, y: 0 };
                    this.design.signatureSize = 200; // Default width in px
                    this.applyDesign();
                    this.setupSignatureDragDrop();
                    this.showToast('Unterschrift erfolgreich extrahiert! Sie können sie per Drag & Drop positionieren.', 'success');
                } catch (error) {
                    console.error('Fehler beim Extrahieren der Unterschrift:', error);
                    // Fallback: Normales Bild laden
                    const reader = new FileReader();
                    reader.onload = () => {
                        this.design.signatureImage = reader.result;
                        this.design.signaturePosition = { x: 0, y: 0 };
                        this.design.signatureSize = 200;
                        this.applyDesign();
                        this.setupSignatureDragDrop();
                    };
                    reader.readAsDataURL(file);
                }
            });
        }
        if (removeSignatureBtn) {
            removeSignatureBtn.addEventListener('click', () => {
                this.design.signatureImage = '';
                this.design.signaturePosition = null;
                this.design.signatureSize = null;
                if (signatureUpload) signatureUpload.value = '';
                const signatureImg = document.getElementById('signatureImage');
                if (signatureImg) {
                    signatureImg.style.display = 'none';
                    signatureImg.style.left = '';
                    signatureImg.style.top = '';
                    signatureImg.style.width = '';
                }
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
        
        // Custom Color Picker
        const customColorPicker = document.getElementById('customColorPicker');
        const customColorHex = document.getElementById('customColorHex');
        
        if (customColorPicker) {
            customColorPicker.addEventListener('input', (e) => {
                const color = e.target.value;
                this.design.color = color;
                if (customColorHex) customColorHex.value = color;
                
                // Deselect all color buttons
                document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
                
                this.applyDesign();
            });
        }
        
        if (customColorHex) {
            customColorHex.addEventListener('input', (e) => {
                let value = e.target.value;
                if (!value.startsWith('#')) value = '#' + value;
                if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
                    this.design.color = value;
                    if (customColorPicker) customColorPicker.value = value;
                    
                    document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
                    
                    this.applyDesign();
                }
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

        const suggestContactBtn = document.getElementById('suggestContactBtn');
        if (suggestContactBtn) {
            suggestContactBtn.addEventListener('click', () => this.suggestContactPerson());
        }

        // Country-Selector: Aktualisiere Datum und Grußformel bei Änderung
        const countrySelect = document.getElementById('countrySelect');
        if (countrySelect) {
            countrySelect.addEventListener('change', () => {
                this.setCurrentDate();
                this.updateGreeting();
                this.updateSalutation();
                // Aktualisiere auch Company Info falls bereits geladen
                const jobData = this.collectJobData();
                if (jobData.companyName) {
                    this.updateCompanyInfo(jobData);
                }
            });
        }
        
        // Ansprechpartner-Änderung: Aktualisiere Anrede
        const contactPersonField = document.getElementById('contactPerson');
        if (contactPersonField) {
            contactPersonField.addEventListener('input', () => {
                this.updateSalutation();
            });
        }

        // Extrahiere Position/Unternehmen/Ansprechpartner aus Stellenbeschreibung
        const jobDescriptionField = document.getElementById('jobDescription');
        if (jobDescriptionField) {
            let extractTimeout;
            jobDescriptionField.addEventListener('input', (e) => {
                clearTimeout(extractTimeout);
                extractTimeout = setTimeout(() => {
                    this.extractJobInfoFromDescription(e.target.value);
                }, 2000); // 2 Sekunden nach letztem Tippen
            });
        }
    }

    async extractJobInfoFromDescription(description) {
        if (!description || description.length < 50) return;

        const positionField = document.getElementById('jobTitle');
        const companyField = document.getElementById('companyName');
        const contactField = document.getElementById('contactPerson');

        // Prüfe ob Felder bereits ausgefüllt sind
        if (positionField?.value && companyField?.value) {
            return; // Bereits ausgefüllt, keine Extraktion nötig
        }

        try {
            const apiKey = await this.getAPIKey();
            if (!apiKey) {
                console.log('⚠️ Kein API-Key für Extraktion verfügbar');
                return;
            }

            const prompt = `Analysiere die folgende Stellenbeschreibung und extrahiere:

1. Position/Job-Titel (z.B. "Solution Consultant", "Software Engineer")
2. Unternehmen/Firmenname (z.B. "DXC Technology", "SAP")
3. Ansprechpartner (falls erwähnt, z.B. "Herr Müller", "Frau Schmidt", "Recruiting Team")

Antworte NUR mit einem JSON-Objekt im Format:
{
    "position": "Position oder null",
    "company": "Unternehmen oder null",
    "contactPerson": "Ansprechpartner oder null"
}

Stellenbeschreibung:
${description.substring(0, 2000)}`;

            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-5.2',
                    reasoning_effort: 'low',
                    messages: [
                        {
                            role: 'system',
                            content: 'Du bist ein Experte für die Analyse von Stellenausschreibungen. Extrahiere präzise die Position, das Unternehmen und den Ansprechpartner. Antworte NUR mit JSON.'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    max_completion_tokens: 500
                })
            });

            if (!response.ok) {
                console.warn('⚠️ Extraktion fehlgeschlagen');
                return;
            }

            const data = await response.json();
            const content = data.choices[0]?.message?.content || '';
            
            // JSON extrahieren
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (!jsonMatch) return;

            const extracted = JSON.parse(jsonMatch[0]);

            // Felder ausfüllen, wenn leer
            if (extracted.position && !positionField?.value) {
                positionField.value = extracted.position;
                console.log('✅ Position extrahiert:', extracted.position);
            }
            if (extracted.company && !companyField?.value) {
                companyField.value = extracted.company;
                console.log('✅ Unternehmen extrahiert:', extracted.company);
            }
            if (extracted.contactPerson && !contactField?.value) {
                contactField.value = extracted.contactPerson;
                console.log('✅ Ansprechpartner extrahiert:', extracted.contactPerson);
            }

            // Toast-Benachrichtigung
            if (extracted.position || extracted.company || extracted.contactPerson) {
                this.showToast('Informationen aus Stellenbeschreibung extrahiert', 'success');
            }

        } catch (error) {
            console.warn('Fehler bei Extraktion:', error);
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
        const aiActions = document.querySelectorAll('[data-block-action]');

        if (openBtn) openBtn.addEventListener('click', () => this.openBlocksEditor());
        if (closeBtn) closeBtn.addEventListener('click', () => this.closeBlocksEditor());
        if (cancelBtn) cancelBtn.addEventListener('click', () => this.closeBlocksEditor());
        if (saveBtn) saveBtn.addEventListener('click', () => this.saveBlocks());
        if (addBtn) addBtn.addEventListener('click', () => this.addBlock(''));
        aiActions.forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.blockAction;
                this.handleBlockAiAction(action);
            });
        });
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
        this.currentCoverLetterId = letter.id;
        
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
        ['tone', 'length', 'focus', 'goal'].forEach((option) => {
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
            // PRIORITÄT 1: UnifiedProfileService (beste Datenquelle)
            if (window.unifiedProfileService) {
                // Warte bis initialisiert
                let attempts = 0;
                while (!window.unifiedProfileService.isInitialized && attempts < 50) {
                    await new Promise(r => setTimeout(r, 100));
                    attempts++;
                }
                
                if (window.unifiedProfileService.isInitialized) {
                    const unifiedProfile = await window.unifiedProfileService.getProfileData();
                    // Filter "Test User" Daten
                    if (unifiedProfile && unifiedProfile.firstName && 
                        unifiedProfile.firstName !== 'Test' && 
                        unifiedProfile.firstName !== 'test' && 
                        unifiedProfile.firstName !== 'TEST') {
                        this.profileData = unifiedProfile;
                        console.log('✅ Nutze UnifiedProfileService für Profildaten:', unifiedProfile.firstName, unifiedProfile.lastName);
                    } else {
                        console.log('⚠️ UnifiedProfileService enthält Test-Daten, überspringe...');
                    }
                }
            }
            
            // PRIORITÄT 2: Cloud data service
            if (!this.profileData || Object.keys(this.profileData).length === 0 || 
                this.profileData.firstName === 'Test' || this.profileData.firstName === 'test') {
                if (window.cloudDataService) {
                    const cloudProfile = await window.cloudDataService.getProfile(true);
                    const normalized = this.normalizeProfileData(cloudProfile);
                    // Filter Test-Daten
                    if (normalized.firstName && normalized.firstName !== 'Test' && normalized.firstName !== 'test') {
                        this.profileData = normalized;
                        console.log('✅ Nutze CloudDataService für Profildaten');
                    }
                }
            }
            
            // PRIORITÄT 3: localStorage
            if (!this.profileData || Object.keys(this.profileData).length === 0 || 
                this.profileData.firstName === 'Test' || this.profileData.firstName === 'test') {
                const stored = localStorage.getItem('bewerbungsmanager_profile') || localStorage.getItem('userProfile') || localStorage.getItem('profile_data');
                if (stored) {
                    const normalized = this.normalizeProfileData(JSON.parse(stored));
                    // Filter Test-Daten
                    if (normalized.firstName && normalized.firstName !== 'Test' && normalized.firstName !== 'test') {
                        this.profileData = normalized;
                        console.log('✅ Nutze localStorage für Profildaten');
                    }
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

            if (this.profileData && !this.profileData.fachlicheEntwicklung) {
                let fachliche = this.getFachlicheEntwicklungFromStorage();
                if (!fachliche) {
                    fachliche = await this.loadFachlicheEntwicklungFromCloud();
                }
                if (fachliche) {
                    this.profileData.fachlicheEntwicklung = fachliche;
                }
            }
            
            // Update sender info
            if (this.profileData) {
                this.updateSenderInfo();
            }
            
            console.log('👤 Profile loaded:', this.profileData ? `${this.profileData.firstName} ${this.profileData.lastName}` : 'No');
        } catch (error) {
            console.warn('Could not load profile:', error);
        }
    }

    getFachlicheEntwicklungFromStorage() {
        try {
            const steps = {};
            for (let i = 1; i <= 7; i++) {
                const raw = localStorage.getItem(`fachlicheEntwicklungStep${i}`);
                if (raw) steps[`step${i}`] = JSON.parse(raw);
            }
            const finalRaw = localStorage.getItem('fachlicheEntwicklungFinalAnalysis');
            const finalAnalysis = finalRaw ? JSON.parse(finalRaw) : null;
            if (!Object.keys(steps).length && !finalAnalysis) return null;
            return { steps, finalAnalysis };
        } catch (error) {
            console.warn('Could not parse fachliche Entwicklung data:', error);
            return null;
        }
    }

    async loadFachlicheEntwicklungFromCloud() {
        if (!window.workflowAPI) return null;
        try {
            const steps = {};
            for (let i = 1; i <= 7; i++) {
                const response = await window.workflowAPI.loadWorkflowStep('fachlicheEntwicklung', `step${i}`);
                if (response && response.stepData) {
                    steps[`step${i}`] = response.stepData;
                    localStorage.setItem(`fachlicheEntwicklungStep${i}`, JSON.stringify(response.stepData));
                }
            }
            let finalAnalysis = null;
            try {
                const results = await window.workflowAPI.getWorkflowResults('fachlicheEntwicklung');
                if (results && results.results) {
                    finalAnalysis = results.results;
                    localStorage.setItem('fachlicheEntwicklungFinalAnalysis', JSON.stringify(finalAnalysis));
                }
            } catch (error) {
                console.warn('Could not load fachliche Entwicklung results:', error);
            }
            if (!Object.keys(steps).length && !finalAnalysis) return null;
            return { steps, finalAnalysis };
        } catch (error) {
            console.warn('Could not load fachliche Entwicklung from cloud:', error);
            return null;
        }
    }

    normalizeProfileData(rawData) {
        if (!rawData) return {};
        const personal = rawData.personal || rawData.profile?.personal || {};
        const professional = rawData.professional || rawData.profile?.professional || {};
        const name = rawData.name || rawData.profile?.name || '';
        const parts = name.split(' ').filter(Boolean);
        return {
            ...rawData,
            firstName: rawData.firstName || rawData.profile?.firstName || personal.firstName || parts[0] || '',
            lastName: rawData.lastName || rawData.profile?.lastName || personal.lastName || parts.slice(1).join(' ') || '',
            email: rawData.email || rawData.profile?.email || personal.email || '',
            phone: rawData.phone || rawData.profile?.phone || personal.phone || '',
            location: rawData.location || rawData.profile?.location || personal.location || '',
            summary: rawData.summary || professional.summary || '',
            skills: rawData.skills || professional.skills || rawData.skills || []
        };
    }

    updateSenderInfo() {
        // Versuche Profil zu laden, falls noch nicht vorhanden
        if (!this.profileData) {
            // Versuche UnifiedProfileService
            if (window.unifiedProfileService?.isInitialized) {
                window.unifiedProfileService.getProfileData().then(profile => {
                    if (profile && profile.firstName && profile.firstName !== 'Test') {
                        this.profileData = profile;
                        this.updateSenderInfo(); // Rekursiv aufrufen mit neuem Profil
                    }
                }).catch(() => {});
            }
            // Wenn immer noch kein Profil, versuche es später nochmal
            if (!this.profileData) {
                setTimeout(() => this.updateSenderInfo(), 1000);
                return;
            }
        }
        
        const nameEl = document.getElementById('senderName');
        const addressEl = document.getElementById('senderAddress');
        const contactEl = document.getElementById('senderContact');
        const signatureEl = document.getElementById('signatureName');
        
        const firstName = this.profileData.firstName || this.profileData.name?.split(' ')[0] || '';
        const lastName = this.profileData.lastName || this.profileData.name?.split(' ').slice(1).join(' ') || '';
        const fullName = `${firstName} ${lastName}`.trim() || 'Ihr Name';
        
        // Name - IMMER setzen wenn "Max Mustermann" oder leer
        if (nameEl) {
            const currentName = nameEl.textContent.trim();
            if (!currentName || currentName === 'Max Mustermann' || currentName === 'Ihr Name' || currentName === 'Muster') {
                if (fullName && fullName !== 'Ihr Name') {
                    nameEl.textContent = fullName;
                }
            }
        }
        
        if (signatureEl) {
            // Prüfe ob es ein Input oder Span ist
            if (signatureEl.tagName === 'INPUT') {
                if (!signatureEl.value || signatureEl.value === 'Ihr Name') {
                    signatureEl.value = fullName;
                }
            } else {
                if (!signatureEl.textContent.trim() || signatureEl.textContent.trim() === 'Ihr Name') {
                    signatureEl.textContent = fullName;
                }
            }
        }
        
        // Adresse - nur setzen wenn leer oder Platzhalter
        if (addressEl) {
            const currentAddress = addressEl.textContent.trim();
            if (!currentAddress || currentAddress === 'Musterstraße 1, 12345 Musterstadt' || currentAddress === 'Ihre Adresse') {
                const address = this.profileData.address || this.profileData.location || '';
                if (address) {
                    addressEl.textContent = address;
                } else {
                    addressEl.textContent = 'Ihre Adresse';
                }
            }
        }
        
        // Kontakt - nur setzen wenn leer oder Platzhalter
        if (contactEl) {
            const currentContact = contactEl.textContent.trim();
            if (!currentContact || currentContact === 'max@example.com | +49 123 456789' || currentContact === 'Ihre Kontaktdaten') {
                const email = this.profileData.email || '';
                const phone = this.profileData.phone || '';
                const contactText = [email, phone].filter(Boolean).join(' | ');
                contactEl.textContent = contactText || 'Ihre Kontaktdaten';
            }
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
        console.log('🔑 Suche API-Key für Anschreiben...');
        
        // 1. Try AWS API Settings
        if (window.awsAPISettings) {
            try {
                const key = await window.awsAPISettings.getFullApiKey('openai');
                if (key && typeof key === 'string' && !key.includes('...') && key.startsWith('sk-')) {
                    console.log('✅ API-Key über awsAPISettings geladen');
                    return key;
                }
            } catch (e) {
                console.warn('AWS API Settings error:', e);
            }
        }
        
        // 2. Try globalApiManager
        if (window.globalApiManager) {
            try {
                const key = await window.globalApiManager.getApiKey('openai');
                if (key && typeof key === 'string' && !key.includes('...') && key.startsWith('sk-')) {
                    console.log('✅ API-Key über globalApiManager geladen');
                    return key;
                }
            } catch (e) {}
        }
        
        // 3. Try admin_state (Admin Panel)
        try {
            const stateManagerData = localStorage.getItem('admin_state');
            if (stateManagerData) {
                const state = JSON.parse(stateManagerData);
                if (state.services?.openai?.key && !state.services.openai.key.includes('...')) {
                    console.log('✅ API-Key aus admin_state geladen');
                    return state.services.openai.key;
                }
                // Alternative Struktur
                if (state.apiKeys?.openai?.apiKey && !state.apiKeys.openai.apiKey.includes('...')) {
                    console.log('✅ API-Key aus admin_state.apiKeys geladen');
                    return state.apiKeys.openai.apiKey;
                }
            }
        } catch (e) {
            console.warn('Kein API-Key in admin_state:', e);
        }
        
        // 4. Try global_api_keys
        try {
            const globalKeys = JSON.parse(localStorage.getItem('global_api_keys') || '{}');
            if (globalKeys.openai?.key && !globalKeys.openai.key.includes('...') && globalKeys.openai.key.startsWith('sk-')) {
                console.log('✅ API-Key aus global_api_keys geladen');
                return globalKeys.openai.key;
            }
        } catch (e) {}
        
        // 5. Try direct openai_api_key
        try {
            const directKey = localStorage.getItem('openai_api_key');
            if (directKey && !directKey.includes('...') && directKey.startsWith('sk-')) {
                console.log('✅ API-Key direkt aus localStorage geladen');
                return directKey;
            }
        } catch (e) {}
        
        console.warn('❌ Kein API-Key gefunden');
        return null;
    }

    async generateWithAI(jobData, apiKey) {
        const prompt = this.buildPrompt(jobData);
        
        // Verwende GPT-5.2 für beste Qualität
        const model = 'gpt-5.2';
        const maxTokens = this.options.length === 'short' ? 600 : this.options.length === 'medium' ? 1000 : 1400;
        
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: model,
                reasoning_effort: 'medium',
                messages: [
                    {
                        role: 'system',
                        content: 'Du bist ein professioneller Bewerbungsberater und Experte für überzeugende Bewerbungsanschreiben. Du erstellst personalisierte, spezifische und authentische Anschreiben, die genau auf die Stellenbeschreibung eingehen. Du verwendest konkrete Beispiele, messbare Ergebnisse und vermeidest Floskeln.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_completion_tokens: maxTokens
            })
        });
        
        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }
        
        const data = await response.json();
        return data.choices[0].message.content;
    }

    async callOpenAI(messages, apiKey, opts = {}) {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: opts.model || 'gpt-5.2',
                reasoning_effort: opts.reasoningEffort || 'low',
                messages,
                max_completion_tokens: opts.maxTokens ?? 1000
            })
        });
        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }
        const data = await response.json();
        return data.choices?.[0]?.message?.content || '';
    }

    async getAiAlternativesForText(text, action) {
        const apiKey = await this.getAPIKey();
        const fallback = [text];
        if (!apiKey) return fallback;

        const actionMap = {
            alternatives: 'Erstelle 3 alternative Varianten mit gleicher Aussage.',
            shorten: 'Kürze den Absatz auf 1-2 Sätze, gleiche Aussage.',
            expand: 'Erweitere den Absatz um 2-3 Sätze mit konkreten Details.',
            active: 'Formuliere aktiver mit starken Verben.',
            concrete: 'Formuliere konkreter mit präzisen Details.',
            proof: 'Füge einen messbaren Beleg/Ergebnis hinzu (Zahl, Prozent, Zeit, Umsatz).',
            improve: 'Verbessere Stil, Klarheit und Wirkung, ohne Inhalt zu verlieren.'
        };
        const instruction = actionMap[action] || actionMap.alternatives;
        const jobData = this.collectJobData();
        const goalMap = {
            'role-fit': 'Rollen-Fit',
            impact: 'Impact',
            leadership: 'Leadership',
            'tech-depth': 'Tech-Depth'
        };
        const prompt = `
Kontext:
Position: ${jobData.jobTitle}
Firma: ${jobData.companyName}
Ziel-Modus: ${goalMap[this.options.goal] || 'Rollen-Fit'}
Tonalität: ${this.options.tone}
Schwerpunkt: ${this.options.focus}

Aufgabe:
${instruction}

Text:
"""${text}"""

Gib ausschließlich ein JSON-Array mit Strings zurück.
`;
        const content = await this.callOpenAI([
            { role: 'system', content: 'Du bist ein professioneller Bewerbungsberater. Antworte auf Deutsch.' },
            { role: 'user', content: prompt }
        ], apiKey, { maxTokens: 450 });

        try {
            const parsed = JSON.parse(content);
            if (Array.isArray(parsed) && parsed.length) {
                return parsed.map(s => String(s).trim()).filter(Boolean);
            }
        } catch (e) {
            const lines = content.split('\n').map(l => l.replace(/^[-•\d.]+\s*/, '').trim()).filter(Boolean);
            if (lines.length) return lines.slice(0, 3);
        }
        return fallback;
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

        const goalMap = {
            'role-fit': 'Rollen-Fit - zeige warum du perfekt für diese spezifische Rolle passt',
            impact: 'Impact - betone messbare Ergebnisse und Wirkung',
            leadership: 'Leadership - hebe Führungserfahrung und Teamführung hervor',
            'tech-depth': 'Technische Tiefe - fokussiere auf technische Expertise und Details'
        };

        const profile = this.profileData || {};
        const coaching = profile.coaching || {};
        const fachlicheSummary = this.buildFachlicheSummary(profile.fachlicheEntwicklung);
        const coachingStrengths = [
            coaching.naturalTalents,
            coaching.acquiredSkills,
            coaching.uniqueStrengths
        ].filter(Boolean).join(', ');
        const coachingMotivation = coaching.motivators || coaching.shortTermGoals || coaching.dreamJob || '';
        
        // Erweiterte Profil-Informationen
        const experience = profile.experience || [];
        const education = profile.education || [];
        const skills = profile.skills || [];
        const achievements = profile.achievements || [];
        
        // Extrahiere relevante Keywords aus Stellenbeschreibung
        const jobKeywords = this.extractKeywords(jobData.jobDescription);
        
        return `Du bist ein professioneller Bewerbungsberater und Experte für überzeugende Bewerbungsanschreiben.

AUFGABE:
Erstelle ein professionelles, personalisiertes und überzeugendes Bewerbungsanschreiben.

STELLENINFORMATIONEN:
- Position: ${jobData.jobTitle}
- Unternehmen: ${jobData.companyName}
- Branche: ${jobData.industry || 'Nicht angegeben'}
- Ansprechpartner: ${jobData.contactPerson || 'Nicht angegeben'}

STELLENBESCHREIBUNG:
${jobData.jobDescription}

RELEVANTE KEYWORDS AUS DER STELLENBESCHREIBUNG:
${jobKeywords.length > 0 ? jobKeywords.join(', ') : 'Keine extrahiert'}

BEWERBER-PROFIL:
- Name: ${profile.firstName || ''} ${profile.lastName || ''}
- Berufserfahrung: ${experience.length > 0 ? experience.map(e => `${e.position || e.title} bei ${e.company || ''} (${e.duration || ''})`).join('; ') : 'Nicht angegeben'}
- Ausbildung: ${education.length > 0 ? education.map(e => `${e.degree || e.title} - ${e.institution || ''}`).join('; ') : 'Nicht angegeben'}
- Technische Skills: ${skills.length > 0 ? skills.join(', ') : coachingStrengths || 'Nicht angegeben'}
- Soft Skills: ${profile.softSkills?.join(', ') || 'Nicht angegeben'}
- Erfolge/Leistungen: ${achievements.length > 0 ? achievements.join('; ') : 'Nicht angegeben'}
- Motivation/Ziele: ${coachingMotivation || profile.summary || profile.motivation || 'Nicht angegeben'}
${fachlicheSummary ? `- Fachliche Entwicklung: ${fachlicheSummary}` : ''}
${coachingStrengths ? `- Stärken aus Coaching: ${coachingStrengths}` : ''}

ANFORDERUNGEN FÜR DAS ANSCHREIBEN:
- Tonalität: ${toneMap[this.options.tone]} (${this.options.tone})
- Länge: ${lengthMap[this.options.length]} (${this.options.length})
- Schwerpunkt: ${focusMap[this.options.focus]} (${this.options.focus})
- Ziel-Modus: ${goalMap[this.options.goal] || goalMap['role-fit']} (${this.options.goal})
- Land: ${this.getSelectedCountry()} (${this.getSelectedCountry() === 'CH' ? 'Schweiz - verwende "ss" statt "ß"' : this.getSelectedCountry() === 'DE' ? 'Deutschland - Standard-Duden' : this.getSelectedCountry() === 'AT' ? 'Österreich' : 'USA - Englisch'})

WICHTIGE RICHTLINIEN:
1. Das Anschreiben muss SPEZIFISCH auf die Stellenbeschreibung eingehen
2. Verwende die relevanten Keywords aus der Stellenbeschreibung NATÜRLICH im Text
3. Zeige KONKRETE Beispiele aus der Berufserfahrung, die zur Stelle passen
4. Betone WARUM der Bewerber perfekt für diese spezifische Position ist
5. Verwende MESSBARE ERGEBNISSE (Zahlen, Prozente, Zeiträume) wo möglich
6. Sei AUTHENTISCH und nicht übertrieben
7. Struktur: Einleitung (Interesse bekunden) → Hauptteil (Relevante Erfahrungen/Skills) → Schluss (Nächste Schritte)
8. Vermeide Floskeln und generische Phrasen
9. Zeige ENTHUSIASMUS, aber bleibe professionell
10. Passe den Ton an den Ziel-Modus an: ${goalMap[this.options.goal] || goalMap['role-fit']}

FORMAT:
- Erstelle NUR den Haupttext des Anschreibens
- KEINE Anrede (wird separat angezeigt)
- KEINE Grußformel (wird separat angezeigt)
- KEINE Betreffzeile (wird separat angezeigt)
- KEINE Absenderdaten (werden separat angezeigt)
- Beginne direkt mit dem ersten Satz des Haupttexts
- Verwende Absätze für bessere Lesbarkeit
- Ziel: ${lengthMap[this.options.length]}

Erstelle jetzt das Anschreiben:`;
    }
    
    extractKeywords(text) {
        if (!text) return [];
        
        // Einfache Keyword-Extraktion: Wörter die häufig vorkommen und relevant sind
        const words = text.toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter(w => w.length > 4); // Mindestens 5 Zeichen
        
        // Häufigste Wörter
        const wordCount = {};
        words.forEach(word => {
            wordCount[word] = (wordCount[word] || 0) + 1;
        });
        
        // Sortiere nach Häufigkeit und nimm Top 15
        return Object.entries(wordCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 15)
            .map(([word]) => word.charAt(0).toUpperCase() + word.slice(1))
            .filter(word => !['dass', 'diese', 'diese', 'wobei', 'welche', 'welche', 'wenn', 'wenn', 'können', 'sollen', 'müssen', 'werden'].includes(word.toLowerCase()));
    }

    buildFachlicheSummary(fachliche) {
        if (!fachliche || !fachliche.steps) return '';
        const step1 = fachliche.steps.step1 || {};
        const step2 = fachliche.steps.step2 || {};
        const parts = [];
        if (step1.currentPosition) parts.push(`Aktuelle Rolle: ${step1.currentPosition}`);
        if (step1.futureVision) parts.push(`Zielrolle: ${step1.futureVision}`);
        if (step1.technicalSkills) parts.push(`Technische Skills: ${step1.technicalSkills}`);
        if (step1.softSkills) parts.push(`Soft Skills: ${step1.softSkills}`);
        if (step1.tools) parts.push(`Tools/Technologien: ${step1.tools}`);
        if (step1.projects) parts.push(`Projekte/Erfolge: ${step1.projects}`);
        if (step1.overallSkillLevel) parts.push(`Skill-Level: ${step1.overallSkillLevel}/10`);
        if (step2.criticalSkills) parts.push(`Kritische Skills: ${step2.criticalSkills}`);
        if (step2.trends) parts.push(`Trends: ${step2.trends}`);
        const summary = parts.join(' | ');
        if (!summary) return '';
        return summary.length > 800 ? `${summary.slice(0, 800)}...` : summary;
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
        
        // Entferne Grußformeln aus dem generierten Content (werden im Footer angezeigt)
        const cleanedContent = this.removeGreetingFromContent(content);
        
        // Update letter content
        const letterText = document.getElementById('letterText');
        if (letterText) {
            const withPlaceholders = this.applyPlaceholders(cleanedContent, jobData);
            letterText.value = withPlaceholders;
            this.generatedContent = withPlaceholders;
        }
        
        // Update sender info IMMER (auch wenn Profil später geladen wird)
        this.updateSenderInfo();
        
        // Update company info mit Best Practices
        this.updateCompanyInfo(jobData);
        
        // Update subject line - editierbar
        const subjectLine = document.getElementById('subjectLine');
        if (subjectLine) {
            if (subjectLine.tagName === 'INPUT') {
                subjectLine.value = `Bewerbung als ${jobData.jobTitle}`;
            } else {
                subjectLine.textContent = `Bewerbung als ${jobData.jobTitle}`;
            }
        }
        
        // Update Anrede basierend auf Land
        this.updateSalutation();
        
        // Update greeting based on country
        this.updateGreeting();
        
        // Update stats
        this.updateStats();
        
        // Apply design
        this.applyDesign();
        this.updateQualityChecks();
    }

    updateGreeting() {
        const country = this.getSelectedCountry();
        const greetingEl = document.getElementById('greetingText');
        
        if (!greetingEl) return;
        
        const greetings = {
            'CH': 'Freundliche Grüsse', // Schweiz: ohne ß
            'DE': 'Mit freundlichen Grüßen', // Deutschland: mit ß
            'AT': 'Mit freundlichen Grüßen', // Österreich: mit ß
            'US': 'Sincerely,' // USA: Englisch
        };
        
        // Nur setzen wenn leer oder Standard-Wert
        if (!greetingEl.value || greetingEl.value === 'Mit freundlichen Grüßen' || greetingEl.value === 'Freundliche Grüsse' || greetingEl.value === 'Sincerely,') {
            greetingEl.value = greetings[country] || greetings['DE'];
        }
    }

    updateSalutation() {
        const country = this.getSelectedCountry();
        const salutationEl = document.getElementById('greetingSalutation');
        const contactPerson = document.getElementById('contactPerson')?.value || '';
        
        if (!salutationEl) return;
        
        // Nur setzen wenn leer
        if (!salutationEl.value || salutationEl.value === 'Sehr geehrte Damen und Herren,') {
            if (contactPerson) {
                // Person bekannt
                const isFemale = contactPerson.toLowerCase().includes('frau') || contactPerson.toLowerCase().includes('ms.') || contactPerson.toLowerCase().includes('miss');
                const isMale = contactPerson.toLowerCase().includes('herr') || contactPerson.toLowerCase().includes('mr.');
                
                if (country === 'US') {
                    salutationEl.value = isFemale ? 'Dear Ms. ' : isMale ? 'Dear Mr. ' : 'Dear ';
                } else {
                    salutationEl.value = isFemale ? 'Sehr geehrte Frau ' : isMale ? 'Sehr geehrter Herr ' : 'Sehr geehrte/r ';
                }
            } else {
                // Keine Person bekannt
                const salutations = {
                    'CH': 'Sehr geehrte Damen und Herren,',
                    'DE': 'Sehr geehrte Damen und Herren,',
                    'AT': 'Sehr geehrte Damen und Herren,',
                    'US': 'Dear Sir or Madam,'
                };
                salutationEl.value = salutations[country] || salutations['DE'];
            }
        }
    }

    removeGreetingFromContent(content) {
        if (!content) return content;
        
        // Entferne alle Varianten der Grußformel
        const greetingPatterns = [
            /Mit\s+freundlichen\s+Gr[üu]ßen?[^\w]*$/i,
            /Freundliche\s+Gr[üu]ße[^\w]*$/i,
            /Mit\s+freundlichem\s+Gruß[^\w]*$/i,
            /Hochachtungsvoll[^\w]*$/i,
            /Sincerely[^\w]*$/i,
            /Best\s+regards[^\w]*$/i,
            /Kind\s+regards[^\w]*$/i,
            /Yours\s+sincerely[^\w]*$/i,
            /Mit\s+freundlichen\s+Gr[üu]ßen?[^\w]*\n/i,
            /Freundliche\s+Gr[üu]ße[^\w]*\n/i
        ];
        
        let cleaned = content;
        greetingPatterns.forEach(pattern => {
            cleaned = cleaned.replace(pattern, '').trim();
        });
        
        return cleaned;
    }

    updateCompanyInfo(jobData) {
        const country = this.getSelectedCountry(); // CH, DE, AT, US
        
        const companyDisplay = document.getElementById('companyNameDisplay');
        if (companyDisplay) {
            // Nur setzen wenn leer oder Platzhalter
            const currentCompany = companyDisplay.textContent.trim();
            if (!currentCompany || currentCompany === 'Firmenname') {
                companyDisplay.textContent = jobData.companyName || '';
            }
        }
        
        const contactDisplay = document.getElementById('contactPersonDisplay');
        if (contactDisplay) {
            // Nur setzen wenn leer oder Platzhalter
            const currentContact = contactDisplay.textContent.trim();
            if (!currentContact || currentContact === 'z.Hd. Ansprechpartner' || currentContact === 'Personalabteilung' || currentContact === 'Human Resources') {
                if (jobData.contactPerson) {
                    // Best Practices für verschiedene Länder
                    switch (country) {
                        case 'CH':
                        case 'DE':
                        case 'AT':
                            contactDisplay.textContent = `z.Hd. ${jobData.contactPerson}`;
                            break;
                        case 'US':
                            contactDisplay.textContent = `Attention: ${jobData.contactPerson}`;
                            break;
                        default:
                            contactDisplay.textContent = `z.Hd. ${jobData.contactPerson}`;
                    }
                } else {
                    // Standard je nach Land
                    switch (country) {
                        case 'CH':
                        case 'DE':
                        case 'AT':
                            contactDisplay.textContent = 'Personalabteilung';
                            break;
                        case 'US':
                            contactDisplay.textContent = 'Human Resources';
                            break;
                        default:
                            contactDisplay.textContent = 'Personalabteilung';
                    }
                }
            }
        }
    }

    getSelectedCountry() {
        // PRIORITÄT 1: Country-Selector
        const countrySelect = document.getElementById('countrySelect');
        if (countrySelect && countrySelect.value) {
            return countrySelect.value;
        }
        
        // PRIORITÄT 2: Prüfe Profil-Location
        const location = this.profileData?.location || '';
        if (location.includes('Schweiz') || location.includes('CH') || location.includes('Zürich')) {
            // Setze auch den Selector, falls vorhanden
            if (countrySelect) countrySelect.value = 'CH';
            return 'CH';
        } else if (location.includes('Österreich') || location.includes('AT') || location.includes('Wien')) {
            if (countrySelect) countrySelect.value = 'AT';
            return 'AT';
        } else if (location.includes('USA') || location.includes('US') || location.includes('United States')) {
            if (countrySelect) countrySelect.value = 'US';
            return 'US';
        }
        
        // Standard: Deutschland
        if (countrySelect) countrySelect.value = 'DE';
        return 'DE';
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
        
        // Style-spezifische Anpassungen
        this.applyLetterStyle(letter);

        const signatureImg = document.getElementById('signatureImage');
        if (signatureImg) {
            if (this.design.signatureImage) {
                signatureImg.src = this.design.signatureImage;
                signatureImg.style.display = 'block';
                signatureImg.style.position = 'relative';
                signatureImg.style.cursor = 'move';
                signatureImg.style.userSelect = 'none';
                
                // Position und Größe anwenden
                if (this.design.signaturePosition) {
                    signatureImg.style.left = `${this.design.signaturePosition.x}px`;
                    signatureImg.style.top = `${this.design.signaturePosition.y}px`;
                }
                if (this.design.signatureSize) {
                    signatureImg.style.width = `${this.design.signatureSize}px`;
                    signatureImg.style.height = 'auto';
                }
            } else {
                signatureImg.removeAttribute('src');
                signatureImg.style.display = 'none';
            }
        }
    }
    
    applyLetterStyle(letter) {
        // Reset all style classes
        letter.classList.remove('style-modern', 'style-classic', 'style-minimal', 'style-elegant', 'style-creative', 'style-corporate');
        
        // Add current style class
        letter.classList.add(`style-${this.design.style}`);
        
        // Style-spezifische CSS-Variablen
        const accentColor = this.design.color;
        
        switch (this.design.style) {
            case 'modern':
                letter.style.setProperty('--header-style', `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}dd 100%)`);
                letter.style.setProperty('--header-text-color', '#ffffff');
                letter.style.setProperty('--border-style', 'none');
                letter.style.borderRadius = '0';
                break;
                
            case 'classic':
                letter.style.setProperty('--header-style', 'transparent');
                letter.style.setProperty('--header-text-color', '#1e293b');
                letter.style.setProperty('--border-style', `2px solid ${accentColor}`);
                letter.style.borderLeft = `3px solid ${accentColor}`;
                letter.style.borderRadius = '0';
                break;
                
            case 'minimal':
                letter.style.setProperty('--header-style', 'transparent');
                letter.style.setProperty('--header-text-color', '#1e293b');
                letter.style.setProperty('--border-style', 'none');
                letter.style.borderRadius = '0';
                letter.style.borderLeft = 'none';
                break;
                
            case 'elegant':
                letter.style.setProperty('--header-style', 'transparent');
                letter.style.setProperty('--header-text-color', '#1e293b');
                letter.style.setProperty('--border-style', `1px solid ${accentColor}`);
                letter.style.borderTop = `4px solid ${accentColor}`;
                letter.style.borderRadius = '0';
                letter.style.borderLeft = 'none';
                break;
                
            case 'creative':
                letter.style.setProperty('--header-style', `linear-gradient(135deg, ${accentColor} 0%, ${this.adjustColor(accentColor, 30)} 50%, ${this.adjustColor(accentColor, 60)} 100%)`);
                letter.style.setProperty('--header-text-color', '#ffffff');
                letter.style.setProperty('--border-style', 'none');
                letter.style.borderRadius = '12px';
                letter.style.borderLeft = 'none';
                break;
                
            case 'corporate':
                letter.style.setProperty('--header-style', `linear-gradient(to bottom, ${accentColor} 0%, ${accentColor} 35%, transparent 35%)`);
                letter.style.setProperty('--header-text-color', '#ffffff');
                letter.style.setProperty('--border-style', 'none');
                letter.style.borderRadius = '0';
                letter.style.borderLeft = 'none';
                break;
                
            default:
                break;
        }
    }
    
    // Hilfsfunktion: Farbe anpassen (für Gradienten)
    adjustColor(color, degrees) {
        // Einfache Farbrotation für kreative Gradienten
        const hex = color.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        
        // Rotate hue
        const hsl = this.rgbToHsl(r, g, b);
        hsl[0] = (hsl[0] + degrees / 360) % 1;
        const rgb = this.hslToRgb(hsl[0], hsl[1], hsl[2]);
        
        return `#${rgb[0].toString(16).padStart(2, '0')}${rgb[1].toString(16).padStart(2, '0')}${rgb[2].toString(16).padStart(2, '0')}`;
    }
    
    rgbToHsl(r, g, b) {
        r /= 255; g /= 255; b /= 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        
        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
                case g: h = ((b - r) / d + 2) / 6; break;
                case b: h = ((r - g) / d + 4) / 6; break;
            }
        }
        return [h, s, l];
    }
    
    hslToRgb(h, s, l) {
        let r, g, b;
        if (s === 0) {
            r = g = b = l;
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            };
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }
        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    }

    /**
     * Extrahiert Unterschrift aus Bild (entfernt Hintergrund)
     */
    async extractSignatureFromImage(file) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const reader = new FileReader();
            
            reader.onload = (e) => {
                img.onload = () => {
                    try {
                        const canvas = document.createElement('canvas');
                        canvas.width = img.width;
                        canvas.height = img.height;
                        const ctx = canvas.getContext('2d');
                        
                        // Zeichne Bild auf Canvas
                        ctx.drawImage(img, 0, 0);
                        
                        // Hole Bilddaten
                        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                        const data = imageData.data;
                        
                        // Einfache Hintergrundentfernung: Weiß/heller Hintergrund wird transparent
                        // Annahme: Unterschrift ist dunkel, Hintergrund ist hell
                        for (let i = 0; i < data.length; i += 4) {
                            const r = data[i];
                            const g = data[i + 1];
                            const b = data[i + 2];
                            const a = data[i + 3];
                            
                            // Berechne Helligkeit
                            const brightness = (r + g + b) / 3;
                            
                            // Wenn Pixel sehr hell ist (wahrscheinlich Hintergrund), mache transparent
                            if (brightness > 240) {
                                data[i + 3] = 0; // Transparent
                            } else if (brightness > 200) {
                                // Sanfter Übergang
                                data[i + 3] = Math.max(0, a - (brightness - 200) * 2);
                            }
                        }
                        
                        // Setze verarbeitete Daten zurück
                        ctx.putImageData(imageData, 0, 0);
                        
                        // Konvertiere zu Data URL
                        const extractedDataUrl = canvas.toDataURL('image/png');
                        resolve(extractedDataUrl);
                    } catch (error) {
                        reject(error);
                    }
                };
                
                img.onerror = () => reject(new Error('Fehler beim Laden des Bildes'));
                img.src = e.target.result;
            };
            
            reader.onerror = () => reject(new Error('Fehler beim Lesen der Datei'));
            reader.readAsDataURL(file);
        });
    }

    /**
     * Setup Drag & Drop für Unterschrift
     */
    setupSignatureDragDrop() {
        const signatureImg = document.getElementById('signatureImage');
        if (!signatureImg || !this.design.signatureImage) return;
        
        let isDragging = false;
        let startX, startY, initialX, initialY;
        
        // Maus-Events
        signatureImg.addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            
            const rect = signatureImg.getBoundingClientRect();
            initialX = this.design.signaturePosition?.x || 0;
            initialY = this.design.signaturePosition?.y || 0;
            
            signatureImg.style.cursor = 'grabbing';
            e.preventDefault();
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;
            
            const newX = initialX + deltaX;
            const newY = initialY + deltaY;
            
            signatureImg.style.left = `${newX}px`;
            signatureImg.style.top = `${newY}px`;
        });
        
        document.addEventListener('mouseup', () => {
            if (isDragging) {
                const rect = signatureImg.getBoundingClientRect();
                const container = document.getElementById('signatureContainer');
                if (container) {
                    const containerRect = container.getBoundingClientRect();
                    const relativeX = rect.left - containerRect.left;
                    const relativeY = rect.top - containerRect.top;
                    
                    this.design.signaturePosition = { x: relativeX, y: relativeY };
                    signatureImg.style.cursor = 'move';
                }
                isDragging = false;
            }
        });
        
        // Touch-Events für Mobile
        signatureImg.addEventListener('touchstart', (e) => {
            isDragging = true;
            const touch = e.touches[0];
            startX = touch.clientX;
            startY = touch.clientY;
            
            const rect = signatureImg.getBoundingClientRect();
            initialX = this.design.signaturePosition?.x || 0;
            initialY = this.design.signaturePosition?.y || 0;
            
            e.preventDefault();
        });
        
        document.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            const touch = e.touches[0];
            
            const deltaX = touch.clientX - startX;
            const deltaY = touch.clientY - startY;
            
            const newX = initialX + deltaX;
            const newY = initialY + deltaY;
            
            signatureImg.style.left = `${newX}px`;
            signatureImg.style.top = `${newY}px`;
            e.preventDefault();
        });
        
        document.addEventListener('touchend', () => {
            if (isDragging) {
                const rect = signatureImg.getBoundingClientRect();
                const container = document.getElementById('signatureContainer');
                if (container) {
                    const containerRect = container.getBoundingClientRect();
                    const relativeX = rect.left - containerRect.left;
                    const relativeY = rect.top - containerRect.top;
                    
                    this.design.signaturePosition = { x: relativeX, y: relativeY };
                }
                isDragging = false;
            }
        });
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
            const country = this.getSelectedCountry();
            let formattedDate = '';
            
            switch (country) {
                case 'CH':
                    // Schweiz: Datum rechts oben, Format: "Zürich, 15. Januar 2026"
                    const location = this.profileData?.location || '';
                    const city = location.split(',')[0] || 'Zürich';
                    formattedDate = new Date().toLocaleDateString('de-CH', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                    });
                    dateEl.textContent = `${city}, ${formattedDate}`;
                    break;
                case 'DE':
                    // Deutschland: Datum rechts oben, Format: "15. Januar 2026"
                    formattedDate = new Date().toLocaleDateString('de-DE', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                    });
                    dateEl.textContent = formattedDate;
                    break;
                case 'AT':
                    // Österreich: Datum rechts oben, Format: "15. Jänner 2026" (österreichisches Format)
                    formattedDate = new Date().toLocaleDateString('de-AT', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                    });
                    dateEl.textContent = formattedDate;
                    break;
                case 'US':
                    // USA: Datum links oben, Format: "January 15, 2026"
                    formattedDate = new Date().toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                    });
                    dateEl.textContent = formattedDate;
                    break;
                default:
                    formattedDate = new Date().toLocaleDateString('de-DE', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                    });
                    dateEl.textContent = formattedDate;
            }
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
            id: this.currentCoverLetterId || `cl_${Date.now().toString(36)}`,
            content: content,
            jobData: jobData,
            options: this.options,
            design: this.design,
            createdAt: new Date().toISOString()
        };
        this.currentCoverLetterId = data.id;
        
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
            this.loadCoverLetterOptions();
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
                <div class="block-ai-actions">
                    <button type="button" data-block-action="alternatives">Alternativen</button>
                    <button type="button" data-block-action="shorten">Kürzen</button>
                    <button type="button" data-block-action="expand">Erweitern</button>
                    <button type="button" data-block-action="active">Aktiver</button>
                    <button type="button" data-block-action="concrete">Konkreter</button>
                    <button type="button" data-block-action="proof">Beleg</button>
                </div>
                <div class="block-ai-suggestions" id="block-suggestions-${idx}"></div>
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

        container.querySelectorAll('.block-item').forEach((item, idx) => {
            item.addEventListener('click', (event) => {
                if (event.target.closest('.block-item-actions')) return;
                if (event.target.closest('[data-block-action]')) return;
                this.setActiveBlockIndex(idx);
            });

            item.querySelectorAll('[data-block-action]').forEach(btn => {
                btn.addEventListener('click', (event) => {
                    event.stopPropagation();
                    const action = btn.dataset.blockAction;
                    this.setActiveBlockIndex(idx);
                    this.handleBlockAiAction(action);
                });
            });
        });

        if (this.activeBlockIndex === null && blocks.length) {
            this.setActiveBlockIndex(0);
        }
    }

    setActiveBlockIndex(index) {
        this.activeBlockIndex = index;
        document.querySelectorAll('#blocksContainer .block-item').forEach(item => {
            item.classList.toggle('active', Number(item.dataset.index) === index);
        });
    }

    getActiveBlock() {
        const container = document.getElementById('blocksContainer');
        if (!container) return null;
        const blocks = Array.from(container.querySelectorAll('.block-item'));
        const index = this.activeBlockIndex ?? 0;
        return blocks[index] || null;
    }

    getActiveBlockText() {
        const block = this.getActiveBlock();
        if (!block) return '';
        return block.querySelector('textarea')?.value.trim() || '';
    }

    updateActiveBlockText(text) {
        const block = this.getActiveBlock();
        if (!block) return;
        const textarea = block.querySelector('textarea');
        if (!textarea) return;
        textarea.value = text;
    }

    renderBlockSuggestions(targetId, suggestions) {
        const container = document.getElementById(targetId) || document.getElementById('blockAiSuggestions');
        if (!container) return;
        if (!suggestions.length) {
            container.innerHTML = '<p style="color:#6b7280; font-size:0.85rem;">Keine Alternativen gefunden.</p>';
            return;
        }
        container.innerHTML = suggestions.map(text => `
            <div class="block-ai-suggestion" data-suggestion="${encodeURIComponent(text)}">${text}</div>
        `).join('');

        container.querySelectorAll('.block-ai-suggestion').forEach(item => {
            item.addEventListener('click', () => {
                const decoded = decodeURIComponent(item.dataset.suggestion || '');
                if (decoded) {
                    this.updateActiveBlockText(decoded);
                    this.showToast('Absatz ersetzt', 'success');
                }
            });
        });
    }

    async handleBlockAiAction(action) {
        const text = this.getActiveBlockText();
        if (!text) {
            this.showToast('Bitte zuerst einen Absatz auswählen.', 'warning');
            return;
        }
        this.showToast('KI arbeitet...', 'info');
        try {
            const suggestions = await this.getAiAlternativesForText(text, action);
            const targetId = `block-suggestions-${this.activeBlockIndex ?? 0}`;
            this.renderBlockSuggestions(targetId, suggestions);
        } catch (error) {
            console.warn('Block AI error:', error);
            this.showToast('KI konnte keine Vorschläge erzeugen.', 'error');
        }
    }

    updateBlockIndices() {
        document.querySelectorAll('#blocksContainer .block-item').forEach((item, idx) => {
            const label = item.querySelector('strong');
            if (label) label.textContent = `Absatz ${idx + 1}`;
            item.dataset.index = idx;
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

        const hasNumbers = /\d/.test(text);
        checks.push({ ok: hasNumbers, text: hasNumbers ? 'Messbare Ergebnisse enthalten' : 'Keine messbaren Belege gefunden' });

        const missing = this.getMissingKeywords(text);
        if (missing.length) {
            checks.push({ ok: false, text: `Fehlende Keywords: ${missing.slice(0, 6).join(', ')}` });
        }

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

    getMissingKeywords(text) {
        const jobDescription = document.getElementById('jobDescription')?.value || '';
        const tokens = jobDescription
            .toLowerCase()
            .replace(/[^a-zäöüß0-9\s]/g, ' ')
            .split(/\s+/)
            .filter(word => word.length >= 5);
        const unique = Array.from(new Set(tokens)).slice(0, 15);
        const lower = text.toLowerCase();
        return unique.filter(word => !lower.includes(word));
    }

    async suggestContactPerson() {
        const contactInput = document.getElementById('contactPerson');
        if (!contactInput) return;
        if (contactInput.value.trim()) {
            this.showToast('Ansprechpartner ist bereits gesetzt.', 'info');
            return;
        }
        const company = document.getElementById('companyName')?.value || '';
        const fallback = company ? `Recruiting-Team ${company}` : 'Sehr geehrte Damen und Herren';
        contactInput.value = fallback;
        this.showToast('Ansprechpartner vorgeschlagen', 'success');
    }

    getParagraphAtCursor(text, cursor) {
        const paragraphs = text.split(/\n\s*\n/);
        let searchStart = 0;
        for (let i = 0; i < paragraphs.length; i++) {
            const para = paragraphs[i];
            const idx = text.indexOf(para, searchStart);
            if (idx === -1) continue;
            const start = idx;
            const end = idx + para.length;
            if (cursor >= start && cursor <= end) {
                return { index: i, start, end, text: para };
            }
            searchStart = end;
        }
        return { index: 0, start: 0, end: paragraphs[0]?.length || 0, text: paragraphs[0] || '' };
    }

    async regenerateParagraphAtCursor() {
        const textarea = document.getElementById('letterText');
        if (!textarea) return;
        const text = textarea.value || '';
        const cursor = textarea.selectionStart || 0;
        const target = this.getParagraphAtCursor(text, cursor);
        if (!target.text) return;
        const suggestions = await this.getAiAlternativesForText(target.text, 'alternatives');
        const replacement = suggestions[0] || target.text;
        textarea.value = text.slice(0, target.start) + replacement + text.slice(target.end);
        this.updateStats();
        this.updateQualityChecks();
        this.showToast('Absatz aktualisiert', 'success');
    }

    async improveSelectedText() {
        const textarea = document.getElementById('letterText');
        if (!textarea) return;
        const start = textarea.selectionStart || 0;
        const end = textarea.selectionEnd || 0;
        const selected = textarea.value.substring(start, end).trim();
        const text = selected || this.getParagraphAtCursor(textarea.value, start).text;
        if (!text) return;
        const suggestions = await this.getAiAlternativesForText(text, 'improve');
        const replacement = suggestions[0] || text;
        if (selected) {
            textarea.value = textarea.value.substring(0, start) + replacement + textarea.value.substring(end);
        } else {
            const target = this.getParagraphAtCursor(textarea.value, start);
            textarea.value = textarea.value.slice(0, target.start) + replacement + textarea.value.slice(target.end);
        }
        this.updateStats();
        this.updateQualityChecks();
        this.showToast('Text verbessert', 'success');
    }

    async regenerateSubjectLine() {
        const apiKey = await this.getAPIKey();
        const jobData = this.collectJobData();
        const subjectLine = document.getElementById('subjectLine');
        if (!subjectLine) return;
        if (!apiKey) {
            subjectLine.textContent = `Bewerbung als ${jobData.jobTitle || 'Position'}`;
            return;
        }
        const prompt = `
Erstelle 3 Betreffzeilen für ein Bewerbungsanschreiben.
Position: ${jobData.jobTitle}
Firma: ${jobData.companyName}
Schreibe kurz, professionell, maximal 80 Zeichen.
Gib ein JSON-Array zurück.`;
        const content = await this.callOpenAI([
            { role: 'system', content: 'Du bist ein professioneller Bewerbungsberater. Antworte auf Deutsch.' },
            { role: 'user', content: prompt }
        ], apiKey, { maxTokens: 120 });
        try {
            const parsed = JSON.parse(content);
            subjectLine.textContent = parsed?.[0] || subjectLine.textContent;
        } catch (e) {
            const first = content.split('\n').find(Boolean);
            subjectLine.textContent = first || subjectLine.textContent;
        }
    }

    async regenerateIntroParagraph() {
        const textarea = document.getElementById('letterText');
        if (!textarea) return;
        const apiKey = await this.getAPIKey();
        const jobData = this.collectJobData();
        if (!apiKey) return;
        const prompt = `
Schreibe eine kurze, starke Einleitung (2-3 Sätze) für ein Anschreiben.
Position: ${jobData.jobTitle}
Firma: ${jobData.companyName}
Tonalität: ${this.options.tone}
Schwerpunkt: ${this.options.focus}
Ziel-Modus: ${this.options.goal}
Gib nur den Einleitungsabsatz zurück.`;
        const content = await this.callOpenAI([
            { role: 'system', content: 'Du bist ein professioneller Bewerbungsberater. Antworte auf Deutsch.' },
            { role: 'user', content: prompt }
        ], apiKey, { maxTokens: 200 });
        const text = textarea.value || '';
        const target = this.getParagraphAtCursor(text, 0);
        const replacement = content.trim() || target.text;
        textarea.value = text.slice(0, target.start) + replacement + text.slice(target.end);
        this.updateStats();
        this.updateQualityChecks();
        this.showToast('Einleitung aktualisiert', 'success');
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
                    <button type="button" onclick="window.coverLetterEditor.diffCoverLetterVersion('${version.id}')">Diff</button>
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

    diffCoverLetterVersion(versionId) {
        const versions = JSON.parse(localStorage.getItem('cover_letter_versions') || '[]');
        const version = versions.find(v => v.id === versionId);
        if (!version) return;
        const currentText = this.getFinalLetterContent();
        const previousText = version.data?.content || '';
        const diff = this.buildSimpleDiff(previousText, currentText);
        const container = document.getElementById('coverLetterVersionDiff');
        if (container) container.textContent = diff;
    }

    buildSimpleDiff(oldText, newText) {
        const oldLines = oldText.split('\n').map(l => l.trim()).filter(Boolean);
        const newLines = newText.split('\n').map(l => l.trim()).filter(Boolean);
        const oldSet = new Set(oldLines);
        const newSet = new Set(newLines);
        const removed = oldLines.filter(l => !newSet.has(l)).map(l => `- ${l}`);
        const added = newLines.filter(l => !oldSet.has(l)).map(l => `+ ${l}`);
        return [...removed, ...added].slice(0, 200).join('\n') || 'Keine Unterschiede gefunden.';
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
        await window.coverLetterEditor.regenerateParagraphAtCursor();
    }
}

async function improveSelected() {
    if (window.coverLetterEditor) {
        window.coverLetterEditor.showToast('Text wird verbessert...', 'info');
        await window.coverLetterEditor.improveSelectedText();
    }
}

async function regenerateSubject() {
    if (window.coverLetterEditor) {
        await window.coverLetterEditor.regenerateSubjectLine();
    }
}

async function regenerateIntro() {
    if (window.coverLetterEditor) {
        await window.coverLetterEditor.regenerateIntroParagraph();
    }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    window.coverLetterEditor = new CoverLetterEditor();
});
