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
            signatureImage: '',
            headerTopMargin: 0,
            headerContrast: 'auto',
            recipientTopMargin: 25,
            // Neue Einstellungen
            subjectMarginTop: 15,
            subjectMarginBottom: 10,
            dateFormat: 'de-long',
            datePosition: 'top-right',
            dateTopOffset: 0,
            dateIncludeLocation: false,
            // Text-Formatierung
            senderNameBold: true,
            companyNameBold: false,
            subjectBold: true,
            signatureNameBold: false
        };
        
        this.isGenerating = false;
        this.generatedContent = '';
        this.profileData = null;
        this.activeBlockIndex = null;
        
        this.init();
    }

    async init() {
        console.log('📝 Cover Letter Editor initializing...');
        
        // Warte kurz, um sicherzustellen, dass DOM vollständig geladen ist
        await new Promise(resolve => {
            if (document.readyState === 'complete') {
                resolve();
            } else {
                window.addEventListener('load', resolve);
                // Fallback nach 100ms
                setTimeout(resolve, 100);
            }
        });
        
        // Warte auf awsAPISettings und GlobalAPIManager, falls noch nicht geladen
        if (!window.awsAPISettings) {
            console.log('⏳ Warte auf awsAPISettings...');
            let attempts = 0;
            const maxAttempts = 50; // 5 Sekunden
            while (!window.awsAPISettings && attempts < maxAttempts) {
                await new Promise(resolve => setTimeout(resolve, 100));
                attempts++;
            }
            if (window.awsAPISettings) {
                console.log(`✅ awsAPISettings geladen nach ${attempts * 100}ms`);
            } else {
                console.warn(`⚠️ awsAPISettings nach ${maxAttempts * 100}ms nicht verfügbar`);
                // Versuche manuelle Initialisierung
                if (typeof AWSAPISettingsService !== 'undefined') {
                    console.log('🔄 Versuche manuelle Initialisierung von awsAPISettings...');
                    try {
                        window.awsAPISettings = new AWSAPISettingsService();
                        console.log('✅ awsAPISettings manuell initialisiert');
                    } catch (e) {
                        console.error('❌ Fehler bei manueller Initialisierung:', e);
                    }
                }
            }
        } else {
            console.log('✅ awsAPISettings bereits verfügbar');
        }
        
        // Warte auf GlobalAPIManager (wird vom Admin Panel verwendet!)
        if (!window.GlobalAPIManager) {
            console.log('⏳ Warte auf GlobalAPIManager...');
            let attempts = 0;
            const maxAttempts = 30; // 3 Sekunden
            while (!window.GlobalAPIManager && attempts < maxAttempts) {
                await new Promise(resolve => setTimeout(resolve, 100));
                attempts++;
            }
            if (window.GlobalAPIManager) {
                console.log(`✅ GlobalAPIManager geladen nach ${attempts * 100}ms`);
            } else {
                console.warn(`⚠️ GlobalAPIManager nach ${maxAttempts * 100}ms nicht verfügbar`);
            }
        } else {
            console.log('✅ GlobalAPIManager bereits verfügbar');
        }
        
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
        this.setupSignatureExtended();
        this.setupHeaderControls();
        this.setupCompanyAddressSearch();
        
        // Load user profile
        await this.loadUserProfile();
        
        // Set initial date
        this.setCurrentDate();
        
        // Prüfe ob ein Anschreiben zum Bearbeiten geladen werden soll
        await this.checkEditParameter();
        
        // Initialisiere Export-Button State
        this.updateExportButtonState();
        
        // Prüfe API-Key Verfügbarkeit (nur Info, keine Warnung)
        this.checkAPIKeyAvailability();
        
        console.log('✅ Cover Letter Editor ready');
    }
    
    /**
     * Prüft ob API-Key verfügbar ist (nur für Info, keine Warnung)
     */
    async checkAPIKeyAvailability() {
        try {
            // Warte kurz, damit alle Services initialisiert sind
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const apiKey = await this.getAPIKey();
            if (!apiKey) {
                // Keine Warnung hier - wird nur bei tatsächlicher Nutzung angezeigt
                console.log('ℹ️ API-Key nicht verfügbar - Template-Modus wird verwendet');
                console.log('   💡 Tipp: Im Admin Panel (https://manuel-weiss.ch/admin#api-keys) konfigurieren für AI-Generierung');
            } else {
                console.log('✅ API-Key verfügbar - AI-Generierung möglich');
            }
        } catch (e) {
            // Stille Fehlerbehandlung - keine störende Warnung
            console.log('ℹ️ API-Key-Prüfung:', e.message);
        }
    }
    
    async checkEditParameter() {
        const urlParams = new URLSearchParams(window.location.search);
        const editId = urlParams.get('edit');
        
        if (editId) {
            console.log('📝 Lade Anschreiben zum Bearbeiten:', editId);
            await this.loadCoverLetterForEdit(editId);
        }
    }
    
    async loadCoverLetterForEdit(id) {
        try {
            // Suche in localStorage
            let letter = null;
            const drafts = JSON.parse(localStorage.getItem('cover_letter_drafts') || '[]');
            letter = drafts.find(d => d.id === id);
            
            // Falls nicht gefunden, versuche Cloud
            if (!letter && window.cloudDataService) {
                const cloudLetters = await window.cloudDataService.getCoverLetters(true);
                letter = cloudLetters?.find(d => d.id === id);
            }
            
            if (!letter) {
                this.showToast('Anschreiben nicht gefunden', 'error');
                return;
            }
            
            // Speichere Referenzen für Versionierung
            this.currentCoverLetterId = letter.id;
            this.currentVersion = letter.version || '1.0';
            this.currentCreatedAt = letter.createdAt;
            
            // Formulardaten füllen
            if (letter.jobData) {
                const fields = {
                    'jobTitle': letter.jobData.jobTitle || letter.jobData.position || letter.jobData.title || '',
                    'companyName': letter.jobData.companyName || letter.jobData.company || '',
                    'companyAddress': letter.jobData.companyAddress || '',
                    'industry': letter.jobData.industry || '',
                    'contactPerson': letter.jobData.contactPerson || '',
                    'jobDescription': letter.jobData.jobDescription || '',
                    'countrySelect': letter.jobData.country || 'CH'
                };
                
                Object.entries(fields).forEach(([id, value]) => {
                    const el = document.getElementById(id);
                    if (el && value) el.value = value;
                });
                
                // Firmenadresse-Feld anzeigen wenn vorhanden
                if (letter.jobData.companyAddress) {
                    const addressGroup = document.getElementById('companyAddressGroup');
                    if (addressGroup) addressGroup.style.display = 'block';
                }
            }
            
            // Optionen laden
            if (letter.options) {
                this.options = { ...this.options, ...letter.options };
                this.updateOptionButtons();
            }
            
            // Design laden - Deep Merge um sicherzustellen, dass alle Properties erhalten bleiben
            if (letter.design) {
                console.log('📥 Geladenes Design aus Letter:', JSON.stringify(letter.design, null, 2));
                console.log('📥 Aktuelles this.design vor Merge:', JSON.stringify(this.design, null, 2));
                
                // Deep merge für verschachtelte Objekte (z.B. signaturePosition)
                this.design = {
                    ...this.design,
                    ...letter.design,
                    // Stelle sicher, dass verschachtelte Objekte nicht komplett überschrieben werden
                    signaturePosition: letter.design.signaturePosition 
                        ? { ...this.design.signaturePosition, ...letter.design.signaturePosition }
                        : (this.design.signaturePosition || letter.design.signaturePosition || null)
                };
                
                console.log('📥 this.design nach Merge:', JSON.stringify(this.design, null, 2));
                this.updateDesignControls();
            }
            
            // Inhalt anzeigen
            if (letter.content) {
                this.generatedContent = letter.content;
                this.displayGeneratedLetter(letter.content, letter.jobData || {});
            }
            
            this.showToast(`Anschreiben v${this.currentVersion} geladen - wird als v${this.getNextVersion()} gespeichert`, 'success');
            
        } catch (error) {
            console.error('Fehler beim Laden:', error);
            this.showToast('Fehler beim Laden des Anschreibens', 'error');
        }
    }
    
    getNextVersion() {
        if (!this.currentVersion) return '1.0';
        const parts = this.currentVersion.split('.');
        return `${parts[0]}.${(parseInt(parts[1] || 0) + 1)}`;
    }
    
    updateOptionButtons() {
        // Aktualisiere die Option-Buttons basierend auf this.options
        Object.entries(this.options).forEach(([option, value]) => {
            document.querySelectorAll(`.option-btn[data-option="${option}"]`).forEach(btn => {
                btn.classList.toggle('active', btn.dataset.value === value);
            });
        });
    }
    
    updateDesignControls() {
        // Style Buttons
        document.querySelectorAll('.style-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.style === this.design.style);
        });
        
        // Color
        document.querySelectorAll('.color-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.color === this.design.color);
        });
        
        // Font
        const fontSelect = document.getElementById('fontSelect');
        if (fontSelect) fontSelect.value = this.design.font;
        
        // Sliders
        const sliders = {
            'fontSizeSlider': ['fontSize', 'pt'],
            'lineHeightSlider': ['lineHeight', ''],
            'marginSlider': ['margin', 'mm'],
            'paragraphSpacingSlider': ['paragraphSpacing', 'px'],
            'signatureSpacingSlider': ['signatureGap', 'px'],
            'headerTopMarginSlider': ['headerTopMargin', 'mm'],
            'recipientTopMarginSlider': ['recipientTopMargin', 'mm']
        };
        
        Object.entries(sliders).forEach(([sliderId, [key, unit]]) => {
            const slider = document.getElementById(sliderId);
            const valueEl = document.getElementById(sliderId.replace('Slider', 'Value'));
            if (slider && this.design[key] !== undefined) {
                slider.value = this.design[key];
                if (valueEl) valueEl.textContent = this.design[key] + unit;
            }
        });
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
                console.log(`🎨 Design geändert: style = ${style}`);
                
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
                console.log(`🎨 Design geändert: color = ${color}`);
                
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
                console.log(`🎨 Design geändert: font = ${e.target.value}`);
                this.applyDesign();
            });
        } else {
            console.warn('⚠️ fontSelect Element nicht gefunden');
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
        
        // Neue Slider für Betreff-Abstände
        this.setupSlider('subjectMarginTopSlider', 'subjectMarginTop', 'mm');
        this.setupSlider('subjectMarginBottomSlider', 'subjectMarginBottom', 'mm');
        this.setupSlider('dateTopOffsetSlider', 'dateTopOffset', 'mm');
        
        // Datum-Format
        const dateFormatSelect = document.getElementById('dateFormatSelect');
        if (dateFormatSelect) {
            dateFormatSelect.addEventListener('change', () => {
                this.design.dateFormat = dateFormatSelect.value;
                this.setCurrentDate();
                this.applyDesign();
            });
        }
        
        // Datum-Position
        const datePositionSelect = document.getElementById('datePositionSelect');
        if (datePositionSelect) {
            datePositionSelect.addEventListener('change', () => {
                this.design.datePosition = datePositionSelect.value;
                this.applyDesign();
            });
        }
        
        // Ort vor Datum
        const dateIncludeLocation = document.getElementById('dateIncludeLocation');
        if (dateIncludeLocation) {
            dateIncludeLocation.addEventListener('change', () => {
                this.design.dateIncludeLocation = dateIncludeLocation.checked;
                this.setCurrentDate();
                this.applyDesign();
            });
        }
        
        // Text-Formatierung Checkboxen
        const formatCheckboxes = [
            { id: 'senderNameBold', key: 'senderNameBold' },
            { id: 'companyNameBold', key: 'companyNameBold' },
            { id: 'subjectBold', key: 'subjectBold' },
            { id: 'signatureNameBold', key: 'signatureNameBold' }
        ];
        
        formatCheckboxes.forEach(({ id, key }) => {
            const checkbox = document.getElementById(id);
            if (checkbox) {
                checkbox.checked = this.design[key] !== false;
                checkbox.addEventListener('change', () => {
                    this.design[key] = checkbox.checked;
                    this.applyDesign();
                });
            }
        });
        
        // Übersetzungs-Dropdown
        this.setupTranslateDropdown();
    }
    
    setupTranslateDropdown() {
        const translateBtn = document.getElementById('translateBtn');
        const translateMenu = document.getElementById('translateMenu');
        
        if (translateBtn && translateMenu) {
            translateBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                translateMenu.classList.toggle('show');
            });
            
            // Sprach-Buttons
            translateMenu.querySelectorAll('button[data-lang]').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const lang = btn.dataset.lang;
                    const country = btn.dataset.country;
                    translateMenu.classList.remove('show');
                    await this.translateCoverLetter(lang, country);
                });
            });
            
            // Schließen bei Klick außerhalb
            document.addEventListener('click', () => {
                translateMenu.classList.remove('show');
            });
        }
    }
    
    async translateCoverLetter(targetLang, targetCountry) {
        const letterText = document.getElementById('letterText');
        const subjectLine = document.getElementById('subjectLine');
        const salutation = document.getElementById('greetingSalutation');
        const greeting = document.getElementById('greetingText');
        
        if (!letterText || !letterText.textContent?.trim()) {
            this.showToast('Kein Anschreiben zum Übersetzen vorhanden', 'warning');
            return;
        }
        
        const apiKey = await this.getAPIKey();
        if (!apiKey) {
            this.showToast('API-Key benötigt für Übersetzung', 'error');
            return;
        }
        
        this.showToast('Übersetze Anschreiben...', 'info');
        
        const langNames = {
            en: targetCountry === 'US' ? 'amerikanisches Englisch' : 'britisches Englisch',
            de: targetCountry === 'CH' ? 'Schweizer Hochdeutsch' : targetCountry === 'AT' ? 'österreichisches Deutsch' : 'Deutsch',
            fr: 'Französisch',
            it: 'Italienisch',
            es: 'Spanisch',
            pt: 'Portugiesisch',
            nl: 'Niederländisch',
            pl: 'Polnisch',
            sv: 'Schwedisch',
            da: 'Dänisch',
            no: 'Norwegisch',
            fi: 'Finnisch',
            cs: 'Tschechisch',
            hu: 'Ungarisch',
            el: 'Griechisch'
        };
        
        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    messages: [{
                        role: 'system',
                        content: `Du bist ein professioneller Übersetzer für Geschäftskorrespondenz und Bewerbungsschreiben.
                        Übersetze den Text in ${langNames[targetLang] || targetLang}.
                        
                        Wichtig:
                        - Behalte den professionellen Ton bei
                        - Verwende länderspezifische Formulierungen für ${targetCountry}
                        - Passe Grußformeln an lokale Gepflogenheiten an
                        - Behalte die Struktur (Absätze) bei
                        - Namen und Firmennamen NICHT übersetzen`
                    }, {
                        role: 'user',
                        content: `Übersetze folgendes Bewerbungsanschreiben nach ${langNames[targetLang]}:

Betreff: ${subjectLine?.value || ''}

Anrede: ${salutation?.value || ''}

${letterText.textContent || letterText.innerText}

Grußformel: ${greeting?.value || ''}

Antworte im Format:
BETREFF: [übersetzter Betreff]
ANREDE: [übersetzte Anrede]
TEXT: [übersetzter Haupttext]
GRUSS: [übersetzte Grußformel]`
                    }],
                    max_tokens: 2000,
                    temperature: 0.3
                })
            });
            
            if (!response.ok) throw new Error('API Fehler');
            
            const data = await response.json();
            const result = data.choices?.[0]?.message?.content?.trim();
            
            if (result) {
                // Parse die Antwort
                const betreffMatch = result.match(/BETREFF:\s*(.+?)(?=\n|ANREDE:)/s);
                const anredeMatch = result.match(/ANREDE:\s*(.+?)(?=\n|TEXT:)/s);
                const textMatch = result.match(/TEXT:\s*(.+?)(?=\n?GRUSS:)/s);
                const grussMatch = result.match(/GRUSS:\s*(.+?)$/s);
                
                if (betreffMatch && subjectLine) subjectLine.value = betreffMatch[1].trim();
                if (anredeMatch && salutation) salutation.value = anredeMatch[1].trim();
                if (textMatch && letterText) {
                    if (letterText.tagName === 'TEXTAREA') {
                        letterText.value = textMatch[1].trim();
                    } else {
                        letterText.innerHTML = textMatch[1].trim().replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>');
                    }
                }
                if (grussMatch && greeting) greeting.value = grussMatch[1].trim();
                
                this.generatedContent = letterText.textContent || letterText.value;
                this.showToast(`Anschreiben nach ${langNames[targetLang]} übersetzt!`, 'success');
            }
        } catch (error) {
            console.error('Übersetzungsfehler:', error);
            this.showToast('Übersetzung fehlgeschlagen', 'error');
        }
    }

    setupSlider(sliderId, designKey, unit) {
        const slider = document.getElementById(sliderId);
        const valueEl = document.getElementById(sliderId.replace('Slider', 'Value'));
        
        if (slider && valueEl) {
            // Initialisiere mit aktuellen Design-Wert
            const currentValue = this.design[designKey] !== undefined ? this.design[designKey] : (slider.value || 0);
            slider.value = currentValue;
            valueEl.textContent = currentValue + unit;
            
            slider.addEventListener('input', (e) => {
                const newValue = parseFloat(e.target.value);
                this.design[designKey] = newValue;
                valueEl.textContent = newValue + unit;
                this.applyDesign();
                console.log(`🎨 Design geändert: ${designKey} = ${newValue}`);
            });
        } else {
            console.warn(`⚠️ Slider nicht gefunden: ${sliderId} oder Value-Element fehlt`);
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
            
            // Bei Eingabe: Debounce von 1 Sekunde
            jobDescriptionField.addEventListener('input', (e) => {
                clearTimeout(extractTimeout);
                extractTimeout = setTimeout(() => {
                    this.extractJobInfoFromDescription(e.target.value);
                }, 1000); // 1 Sekunde nach letztem Tippen
            });
            
            // Bei Einfügen (Paste): Sofortige Extraktion
            jobDescriptionField.addEventListener('paste', (e) => {
                // Kurze Verzögerung, damit der eingefügte Text im Feld ist
                setTimeout(() => {
                    console.log('📋 Text eingefügt - starte sofortige Extraktion');
                    this.extractJobInfoFromDescription(jobDescriptionField.value);
                }, 100);
            });
            
            // Bei Fokus-Verlust: Extraktion falls Text vorhanden
            jobDescriptionField.addEventListener('blur', (e) => {
                if (e.target.value && e.target.value.length > 50) {
                    clearTimeout(extractTimeout);
                    this.extractJobInfoFromDescription(e.target.value);
                }
            });
        }
    }

    async extractJobInfoFromDescription(description) {
        if (!description || description.length < 30) {
            console.log('⏭️ Extraktion übersprungen - Text zu kurz:', description?.length || 0);
            return;
        }

        const positionField = document.getElementById('jobTitle');
        const companyField = document.getElementById('companyName');
        const contactField = document.getElementById('contactPerson');

        console.log('🔍 Starte automatische Extraktion aus Stellenbeschreibung...');
        console.log('📊 Textlänge:', description.length, 'Zeichen');
        console.log('📊 Felder bereits gefüllt - Position:', !!positionField?.value, 'Unternehmen:', !!companyField?.value);

        // ═══════════════════════════════════════════════════════════════════
        // SCHRITT 1: Schnelle Regex-basierte Extraktion (sofort, ohne API)
        // ═══════════════════════════════════════════════════════════════════
        const regexExtracted = this.extractWithRegex(description);
        
        // ═══════════════════════════════════════════════════════════════════
        // SCHRITT 2: KI-basierte Extraktion (IMMER versuchen wenn API-Key da)
        // Regex-Ergebnisse werden nur als Fallback verwendet
        // ═══════════════════════════════════════════════════════════════════
        try {
            const apiKey = await this.getAPIKey();
            
            if (!apiKey) {
                console.log('⚠️ Kein API-Key - verwende nur Regex-Ergebnisse');
                // Nur Regex-Ergebnisse anwenden wenn kein API-Key
                if (regexExtracted.position && !positionField?.value) {
                    positionField.value = regexExtracted.position;
                }
                if (regexExtracted.company && !companyField?.value) {
                    companyField.value = regexExtracted.company;
                }
                if (regexExtracted.contactPerson && !contactField?.value) {
                    contactField.value = regexExtracted.contactPerson;
                }
                if (regexExtracted.position || regexExtracted.company) {
                    this.showToast('Informationen teilweise erkannt (ohne KI)', 'info');
                }
                return;
            }

            console.log('🤖 Starte KI-basierte Extraktion mit API-Key...');

            const prompt = `Analysiere diese Stellenbeschreibung und extrahiere präzise:

1. Position/Job-Titel (exakter Titel wie "Senior Consultant", "Solution Consultant", "HR Manager")
2. Unternehmen/Firmenname (exakter Name wie "ITConcepts GmbH", "SAP AG", "DXC Technology")
3. Ansprechpartner (falls erwähnt, z.B. "Claudio Manig", "Frau Müller")

WICHTIG: Extrahiere NUR tatsächlich genannte Informationen. Bei E-Mails wie "claudio.manig@itconcepts.ch" ist der Ansprechpartner "Claudio Manig" und das Unternehmen "ITConcepts".

Antworte NUR mit JSON ohne Markdown:
{"position": "...", "company": "...", "contactPerson": "..."}
Verwende null für nicht gefundene Werte.

Stellenbeschreibung:
${description.substring(0, 2500)}`;

            // Bestimme Modell und Parameter
            const model = this.getOpenAIModel() || 'gpt-4o-mini';
            const isReasoningModel = model.includes('o1') || model.includes('o3');
            
            const requestBody = {
                model: model,
                messages: [
                    {
                        role: 'system',
                        content: 'Du bist ein Experte für Stellenanalysen. Extrahiere präzise die gefragten Informationen. Antworte NUR mit validem JSON ohne Markdown-Formatierung.'
                    },
                    { role: 'user', content: prompt }
                ],
                max_tokens: 300,
                temperature: 0.1
            };
            
            // Reasoning-Modelle brauchen andere Parameter
            if (isReasoningModel) {
                delete requestBody.temperature;
                requestBody.max_completion_tokens = 300;
                delete requestBody.max_tokens;
            }

            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.warn('⚠️ KI-Extraktion fehlgeschlagen:', response.status, errorText);
                return;
            }

            const data = await response.json();
            const content = data.choices[0]?.message?.content || '';
            
            // JSON extrahieren (auch wenn in Markdown eingebettet)
            const jsonMatch = content.match(/\{[\s\S]*?\}/);
            if (!jsonMatch) {
                console.warn('⚠️ Kein JSON in KI-Antwort gefunden');
                return;
            }

            const extracted = JSON.parse(jsonMatch[0]);
            console.log('🤖 KI-Extraktion Ergebnis:', extracted);
            let updated = false;

            // KI-Ergebnisse IMMER anwenden (überschreiben fehlerhafte Regex-Werte)
            if (extracted.position && extracted.position !== 'null' && extracted.position !== null) {
                positionField.value = extracted.position;
                console.log('✅ Position (KI):', extracted.position);
                updated = true;
            }
            if (extracted.company && extracted.company !== 'null' && extracted.company !== null) {
                companyField.value = extracted.company;
                console.log('✅ Unternehmen (KI):', extracted.company);
                updated = true;
            }
            if (extracted.contactPerson && extracted.contactPerson !== 'null' && extracted.contactPerson !== null) {
                contactField.value = extracted.contactPerson;
                console.log('✅ Ansprechpartner (KI):', extracted.contactPerson);
                updated = true;
            }

            if (updated) {
                this.showToast('Stelleninformationen automatisch erkannt', 'success');
            } else {
                console.log('ℹ️ KI konnte keine Informationen extrahieren');
            }

        } catch (error) {
            console.warn('⚠️ Fehler bei KI-Extraktion:', error.message);
        }
    }

    /**
     * Regex-basierte Schnellextraktion (ohne API-Call)
     */
    extractWithRegex(text) {
        const result = { position: null, company: null, contactPerson: null };
        
        // Blacklist für falsch erkannte Begriffe
        const blacklist = ['bietet', 'bist', 'dir', 'Was', 'für', 'und', 'die', 'der', 'das', 'wir', 'sie', 
                          'unser', 'ihre', 'dein', 'deine', 'gerne', 'freuen', 'uns', 'auf', 'dich'];
        
        const isValid = (str) => {
            if (!str || str.length < 3 || str.length > 60) return false;
            const lower = str.toLowerCase();
            return !blacklist.some(bad => lower.includes(bad));
        };
        
        // ════════════════════════════════════════════════════════════════════
        // POSITION: Nur sehr spezifische Patterns (mit m/w/d oder klaren Job-Titeln)
        // ════════════════════════════════════════════════════════════════════
        const positionPatterns = [
            // Klare Job-Titel mit (m/w/d)
            /^([A-ZÄÖÜ][a-zäöüß]+(?:\s+[A-ZÄÖÜ][a-zäöüß]+){0,4})\s*\(m\/w\/d\)/m,
            /\(m\/w\/d\)\s*[-–]\s*([A-ZÄÖÜ][a-zäöüß]+(?:\s+[A-ZÄÖÜ][a-zäöüß]+){0,4})/i,
            // Bekannte Job-Suffixe
            /((?:Senior|Junior|Lead|Chief|Head of)?\s*[A-Za-zäöüß]+\s*(?:Manager|Developer|Engineer|Consultant|Analyst|Designer|Specialist|Expert|Architect|Administrator|Berater|Entwickler|Leiter|Referent|Sachbearbeiter)(?:in)?)/i,
            // "als [Position]" aber nur mit m/w/d danach
            /als\s+([A-ZÄÖÜ][a-zäöüß]+(?:\s+[A-ZÄÖÜ][a-zäöüß]+){0,3})\s*\(m\/w\/d\)/i
        ];
        
        for (const pattern of positionPatterns) {
            const match = text.match(pattern);
            if (match && match[1] && isValid(match[1])) {
                result.position = match[1].trim();
                console.log('📋 Position (Regex):', result.position);
                break;
            }
        }
        
        // ════════════════════════════════════════════════════════════════════
        // UNTERNEHMEN: Nur mit klaren Rechtsformen (GmbH, AG, etc.)
        // ════════════════════════════════════════════════════════════════════
        const companyPatterns = [
            // Rechtsform am Ende (zuverlässigster Pattern)
            /([A-ZÄÖÜ][A-Za-zäöüß\s&\.-]{2,40})\s+(GmbH|AG|SE|Ltd\.?|Inc\.?|KG|OHG|e\.V\.|Group|Holding)/i,
            // "bei [Firma]" mit Rechtsform
            /bei\s+([A-ZÄÖÜ][A-Za-zäöüß\s&\.-]{2,30})\s+(GmbH|AG|SE)/i,
            // E-Mail Domain als Firmenname
            /@([a-zA-Z0-9-]+)\.[a-z]{2,}/i
        ];
        
        for (const pattern of companyPatterns) {
            const match = text.match(pattern);
            if (match) {
                let company = match[1]?.trim();
                // Bei E-Mail: Kapitalisieren
                if (pattern.source.includes('@')) {
                    company = match[1].charAt(0).toUpperCase() + match[1].slice(1);
                }
                // Bei Rechtsform: anhängen
                else if (match[2]) {
                    company = `${company} ${match[2]}`.trim();
                }
                if (company && company.length > 2 && company.length < 60) {
                    result.company = company;
                    console.log('📋 Unternehmen (Regex):', result.company);
                    break;
                }
            }
        }
        
        // ════════════════════════════════════════════════════════════════════
        // ANSPRECHPARTNER: Nur mit "Herr/Frau [Name]" Pattern
        // ════════════════════════════════════════════════════════════════════
        const contactPatterns = [
            /(?:Ansprechpartner(?:in)?|Kontakt|Ihre Fragen)[:\s]+(?:Herr|Frau)\s+([A-ZÄÖÜ][a-zäöüß]+(?:\s+[A-ZÄÖÜ][a-zäöüß]+)?)/i,
            /(?:Herr|Frau)\s+([A-ZÄÖÜ][a-zäöüß]+(?:\s+[A-ZÄÖÜ][a-zäöüß]+)?),?\s+(?:freut sich|steht Ihnen|unter)/i,
            // E-Mail mit Namen: vorname.nachname@
            /([A-Za-zäöüß]+)\.([A-Za-zäöüß]+)@/i
        ];
        
        for (const pattern of contactPatterns) {
            const match = text.match(pattern);
            if (match && match[1]) {
                if (pattern.source.includes('@')) {
                    // E-Mail Pattern: Vorname Nachname
                    const firstName = match[1].charAt(0).toUpperCase() + match[1].slice(1);
                    const lastName = match[2].charAt(0).toUpperCase() + match[2].slice(1);
                    result.contactPerson = `${firstName} ${lastName}`;
                } else {
                    // Herr/Frau Pattern
                    const prefix = text.match(/(?:Herr|Frau)/i)?.[0] || '';
                    result.contactPerson = `${prefix} ${match[1]}`.trim();
                }
                console.log('📋 Ansprechpartner (Regex):', result.contactPerson);
                break;
            }
        }
        
        return result;
    }

    setupGenerateButton() {
        // Warte bis Button im DOM ist
        const setupButton = () => {
            const generateBtn = document.getElementById('generateBtn');
            console.log('🔍 Setup Generate Button - Button gefunden:', !!generateBtn);
            
            if (generateBtn) {
                // Entferne alten onclick-Handler NICHT - er dient als Fallback
                // generateBtn.onclick = null; // ENTFERNT - onclick bleibt als Fallback
                
                // Füge Event-Listener hinzu (wird vor onclick ausgeführt wegen capture: true)
                generateBtn.addEventListener('click', (e) => {
                    console.log('✅ Generate Button geklickt (Event-Listener)!');
                    e.preventDefault();
                    e.stopPropagation();
                    if (this && typeof this.generateCoverLetter === 'function') {
                        this.generateCoverLetter();
                    } else {
                        console.error('❌ this.generateCoverLetter ist keine Funktion!', this);
                        // Fallback: onclick-Handler wird ausgeführt
                    }
                }, { capture: true, once: false });
                
                console.log('✅ Event-Listener für Generate Button registriert');
            } else {
                console.error('❌ Generate Button nicht gefunden! ID: generateBtn');
                // Retry nach kurzer Verzögerung
                setTimeout(setupButton, 100);
            }
        };
        
        // Versuche sofort
        setupButton();
        
        // Auch nach DOMContentLoaded nochmal versuchen (falls Button später geladen wird)
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', setupButton);
        }
        
        // Auch für Mobile Button
        const setupMobileButton = () => {
            const mobileGenerateBtn = document.getElementById('mobileGenerateBtn');
            if (mobileGenerateBtn) {
                mobileGenerateBtn.addEventListener('click', (e) => {
                    console.log('✅ Mobile Generate Button geklickt!');
                    e.preventDefault();
                    e.stopPropagation();
                    if (this && typeof this.generateCoverLetter === 'function') {
                        this.generateCoverLetter();
                    } else {
                        // Fallback: Desktop Button klicken
                        const desktopBtn = document.getElementById('generateBtn');
                        if (desktopBtn) desktopBtn.click();
                    }
                }, { capture: true });
            } else {
                setTimeout(setupMobileButton, 100);
            }
        };
        setupMobileButton();
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
            // Initial deaktiviert - wird aktiviert wenn Anschreiben vorhanden ist
            exportBtn.disabled = true;
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
                this.updateExportButtonState(); // Aktualisiere Export-Button State
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
            console.log('📥 loadCoverLetterById - Geladenes Design:', JSON.stringify(letter.design, null, 2));
            console.log('📥 loadCoverLetterById - Aktuelles this.design vor Merge:', JSON.stringify(this.design, null, 2));
            
            // Deep merge für verschachtelte Objekte
            this.design = {
                ...this.design,
                ...letter.design,
                // Stelle sicher, dass verschachtelte Objekte nicht komplett überschrieben werden
                signaturePosition: letter.design.signaturePosition 
                    ? { ...this.design.signaturePosition, ...letter.design.signaturePosition }
                    : (this.design.signaturePosition || letter.design.signaturePosition || null)
            };
            
            console.log('📥 loadCoverLetterById - this.design nach Merge:', JSON.stringify(this.design, null, 2));
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
                
                if (window.unifiedProfileService.isInitialized && window.unifiedProfileService.profile) {
                    const unifiedProfile = window.unifiedProfileService.profile;
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
            // Versuche UnifiedProfileService - direkt auf das Profil zugreifen
            if (window.unifiedProfileService?.isInitialized && window.unifiedProfileService.profile) {
                const profile = window.unifiedProfileService.profile;
                if (profile && profile.firstName && profile.firstName !== 'Test') {
                    this.profileData = profile;
                }
            }
            // Wenn immer noch kein Profil, versuche es später nochmal
            if (!this.profileData) {
                setTimeout(() => this.updateSenderInfo(), 1000);
                return;
            }
        }
        
        // Neue mehrzeilige Adressfelder
        const nameEl = document.getElementById('senderName');
        const streetEl = document.getElementById('senderStreet');
        const cityEl = document.getElementById('senderCity');
        const contactEl = document.getElementById('senderContact');
        const signatureEl = document.getElementById('signatureName');
        const locationEl = document.getElementById('letterLocation');
        
        // Name: Vorname + Nachname (ohne Mittelname)
        const firstName = this.profileData.firstName || this.profileData.name?.split(' ')[0] || '';
        const lastName = this.profileData.lastName || this.profileData.name?.split(' ').pop() || '';
        const fullName = `${firstName} ${lastName}`.trim() || 'Vorname Nachname';
        
        // Name - IMMER setzen wenn Platzhalter oder leer
        if (nameEl) {
            const currentName = nameEl.textContent.trim();
            const isPlaceholder = !currentName || 
                currentName === 'Max Mustermann' || 
                currentName === 'Ihr Name' || 
                currentName === 'Vorname Nachname' ||
                currentName === 'Muster' ||
                currentName.includes('Mustermann') ||
                currentName === nameEl.dataset?.placeholder;
            if (isPlaceholder && fullName && fullName !== 'Vorname Nachname') {
                nameEl.textContent = fullName;
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
        
        // Straße + Hausnummer - separate Zeile
        if (streetEl) {
            const currentStreet = streetEl.textContent.trim();
            const isPlaceholder = !currentStreet || 
                currentStreet === 'Straße Hausnummer' ||
                currentStreet === 'Musterstraße 1' ||
                currentStreet.includes('Musterstraße') ||
                currentStreet === streetEl.dataset?.placeholder;
            if (isPlaceholder) {
                const street = this.profileData.street || this.profileData.strasse || '';
                const houseNumber = this.profileData.houseNumber || this.profileData.hausnummer || '';
                const streetLine = `${street} ${houseNumber}`.trim();
                if (streetLine) {
                    streetEl.textContent = streetLine;
                }
            }
        }
        
        // PLZ + Ort - separate Zeile
        if (cityEl) {
            const currentCity = cityEl.textContent.trim();
            const isPlaceholder = !currentCity || 
                currentCity === 'PLZ Ort' ||
                currentCity === '12345 Musterstadt' ||
                currentCity.includes('Musterstadt') ||
                currentCity === cityEl.dataset?.placeholder;
            if (isPlaceholder) {
                const postalCode = this.profileData.postalCode || this.profileData.plz || this.profileData.zip || '';
                const city = this.profileData.city || this.profileData.ort || this.profileData.stadt || '';
                const cityLine = `${postalCode} ${city}`.trim();
                if (cityLine) {
                    cityEl.textContent = cityLine;
                }
            }
        }
        
        // Ort für Datum (wenn aktiviert)
        if (locationEl && this.profileData.city) {
            const city = this.profileData.city || this.profileData.ort || this.profileData.stadt || '';
            if (city && !locationEl.textContent.trim()) {
                locationEl.textContent = city;
            }
        }
        
        // Kontakt - setzen wenn Platzhalter
        if (contactEl) {
            const currentContact = contactEl.textContent.trim();
            const isPlaceholder = !currentContact || 
                currentContact === 'max@example.com | +49 123 456789' || 
                currentContact === 'Ihre Kontaktdaten' ||
                currentContact === 'E-Mail | Telefon' ||
                currentContact.includes('example.com') ||
                currentContact === contactEl.dataset?.placeholder;
            if (isPlaceholder) {
                const email = this.profileData.email || '';
                const phone = this.profileData.phone || '';
                const contactText = [email, phone].filter(Boolean).join(' | ');
                if (contactText) {
                    contactEl.textContent = contactText;
                }
            }
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // COVER LETTER GENERATION
    // ═══════════════════════════════════════════════════════════════════════════

    async generateCoverLetter() {
        console.log('🚀 generateCoverLetter() aufgerufen');
        
        if (this.isGenerating) {
            console.warn('⚠️ Bereits am Generieren, ignoriere erneuten Aufruf');
            return;
        }
        
        console.log('✅ Validierung starten...');
        if (!this.validateForm()) {
            console.error('❌ Formular-Validierung fehlgeschlagen');
            this.showToast('Bitte füllen Sie alle Pflichtfelder aus', 'error');
            return;
        }
        console.log('✅ Formular-Validierung erfolgreich');
        
        this.isGenerating = true;
        console.log('📊 Loading-State aktivieren...');
        this.showLoading();
        
        try {
            console.log('📝 Job-Daten sammeln...');
            const jobData = this.collectJobData();
            console.log('📝 Job-Daten:', jobData);
            
            console.log('🔑 API-Key abrufen...');
            const apiKey = await this.getAPIKey();
            console.log('🔑 API-Key gefunden:', !!apiKey);
            
            let content;
            if (apiKey) {
                console.log('🤖 Generiere mit AI...');
                content = await this.generateWithAI(jobData, apiKey);
                console.log('✅ AI-Generierung erfolgreich, Länge:', content?.length);
            } else {
                console.warn('⚠️ Kein API-Key, verwende Template');
                this.showToast('Kein API-Key gefunden. Verwende Template.', 'warning');
                content = this.generateFromTemplate(jobData);
                console.log('✅ Template-Generierung erfolgreich, Länge:', content?.length);
            }
            
            console.log('📄 Anschreiben anzeigen...');
            this.displayGeneratedLetter(content, jobData);
            this.showToast('Anschreiben erfolgreich generiert!', 'success');
            console.log('✅ Anschreiben erfolgreich generiert und angezeigt');
            
        } catch (error) {
            console.error('❌ Generation error:', error);
            console.error('❌ Error Stack:', error.stack);
            this.showToast('Fehler bei der Generierung. Verwende Template.', 'warning');
            
            // Fallback to template
            try {
                const jobData = this.collectJobData();
                const content = this.generateFromTemplate(jobData);
                this.displayGeneratedLetter(content, jobData);
                console.log('✅ Fallback auf Template erfolgreich');
            } catch (fallbackError) {
                console.error('❌ Auch Fallback fehlgeschlagen:', fallbackError);
                this.showToast('Kritischer Fehler bei der Generierung', 'error');
            }
        } finally {
            this.isGenerating = false;
            this.hideLoading();
            console.log('🏁 Generierung abgeschlossen');
        }
    }

    collectJobData() {
        const jobTitle = document.getElementById('jobTitle')?.value || '';
        const companyName = document.getElementById('companyName')?.value || '';
        const companyAddress = document.getElementById('companyAddress')?.value || '';
        
        return {
            // Primäre Keys
            jobTitle: jobTitle,
            companyName: companyName,
            companyAddress: companyAddress,
            industry: document.getElementById('industry')?.value || '',
            contactPerson: document.getElementById('contactPerson')?.value || '',
            jobDescription: document.getElementById('jobDescription')?.value || '',
            country: document.getElementById('countrySelect')?.value || 'CH',
            // Kompatibilitäts-Keys für Dashboard
            position: jobTitle,
            company: companyName,
            title: jobTitle
        };
    }

    async getAPIKey() {
        // ═══════════════════════════════════════════════════════════════════
        // VOLLSTÄNDIG ÜBERARBEITETE API-KEY SUCHE
        // Durchsucht ALLE möglichen Speicherorte systematisch
        // ═══════════════════════════════════════════════════════════════════
        console.log('🔑 Starte API-Key Suche...');
        
        // Hilfsfunktion: Prüft ob ein Key gültig ist
        const isValidKey = (key) => key && typeof key === 'string' && key.startsWith('sk-') && key.length > 20;
        
        try {
            // ═══════════════════════════════════════════════════════════════════
            // QUELLE 1: global_api_keys (Admin Panel Hauptspeicher)
            // ═══════════════════════════════════════════════════════════════════
            try {
                const globalKeysRaw = localStorage.getItem('global_api_keys');
                console.log('🔍 global_api_keys vorhanden:', !!globalKeysRaw);
                if (globalKeysRaw) {
                    const globalKeys = JSON.parse(globalKeysRaw);
                    // Mehrere mögliche Pfade prüfen
                    const possibleKeys = [
                        globalKeys.openai?.key,
                        globalKeys.openai?.apiKey,
                        globalKeys.openai
                    ];
                    for (const key of possibleKeys) {
                        if (isValidKey(key)) {
                            console.log('✅ API-Key aus global_api_keys geladen');
                            return key;
                        }
                    }
                }
            } catch (e) {
                console.log('⚠️ global_api_keys Parse-Fehler:', e.message);
            }
            
            // ═══════════════════════════════════════════════════════════════════
            // QUELLE 2: GlobalAPIManager Instanz
            // ═══════════════════════════════════════════════════════════════════
            try {
                const apiManager = window.GlobalAPIManager || window.globalApiManager || window.APIManager;
                console.log('🔍 GlobalAPIManager vorhanden:', !!apiManager, 'Typ:', typeof apiManager);
                if (apiManager) {
                    // Prüfe ob es eine Instanz mit getAPIKey Methode ist
                    if (typeof apiManager.getAPIKey === 'function') {
                        const key = apiManager.getAPIKey('openai');
                        if (isValidKey(key)) {
                            console.log('✅ API-Key über GlobalAPIManager.getAPIKey() geladen');
                            return key;
                        }
                    }
                    // Prüfe direkten Zugriff auf keys Property
                    if (apiManager.keys?.openai?.key && isValidKey(apiManager.keys.openai.key)) {
                        console.log('✅ API-Key über GlobalAPIManager.keys direkt geladen');
                        return apiManager.keys.openai.key;
                    }
                }
            } catch (e) {
                console.log('⚠️ GlobalAPIManager Fehler:', e.message);
            }
            
            // ═══════════════════════════════════════════════════════════════════
            // QUELLE 3: admin_state (State Manager Format)
            // ═══════════════════════════════════════════════════════════════════
            try {
                const stateRaw = localStorage.getItem('admin_state');
                console.log('🔍 admin_state vorhanden:', !!stateRaw);
                if (stateRaw) {
                    const state = JSON.parse(stateRaw);
                    const possibleKeys = [
                        state.apiKeys?.openai?.apiKey,
                        state.apiKeys?.openai?.key,
                        state.services?.openai?.apiKey,
                        state.services?.openai?.key
                    ];
                    for (const key of possibleKeys) {
                        if (isValidKey(key)) {
                            console.log('✅ API-Key aus admin_state geladen');
                            return key;
                        }
                    }
                }
            } catch (e) {
                console.log('⚠️ admin_state Parse-Fehler:', e.message);
            }
            
            // ═══════════════════════════════════════════════════════════════════
            // QUELLE 4: Direkte localStorage Keys
            // ═══════════════════════════════════════════════════════════════════
            const directKeys = ['openai_api_key', 'admin_openai_api_key', 'ki_api_settings', 'openai-key', 'api_key'];
            for (const keyName of directKeys) {
                try {
                    const value = localStorage.getItem(keyName);
                    if (value) {
                        // Direkter Key-String
                        if (isValidKey(value)) {
                            console.log(`✅ API-Key aus localStorage['${keyName}'] geladen`);
                            return value;
                        }
                        // JSON-Format
                        try {
                            const parsed = JSON.parse(value);
                            const possibleKeys = [parsed.openai, parsed.key, parsed.apiKey, parsed.openai?.key];
                            for (const key of possibleKeys) {
                                if (isValidKey(key)) {
                                    console.log(`✅ API-Key aus localStorage['${keyName}'] JSON geladen`);
                                    return key;
                                }
                            }
                        } catch {}
                    }
                } catch (e) {}
            }
            
            // ═══════════════════════════════════════════════════════════════════
            // QUELLE 5: awsAPISettings (Cloud-Speicher)
            // ═══════════════════════════════════════════════════════════════════
            if (window.awsAPISettings && typeof window.awsAPISettings.getFullApiKey === 'function') {
                try {
                    console.log('🔍 Versuche awsAPISettings...');
                    const timeoutPromise = new Promise((_, reject) => 
                        setTimeout(() => reject(new Error('Timeout nach 3s')), 3000)
                    );
                    const keyPromise = window.awsAPISettings.getFullApiKey('openai');
                    const key = await Promise.race([keyPromise, timeoutPromise]);
                    
                    if (isValidKey(key)) {
                        console.log('✅ API-Key über awsAPISettings geladen');
                        // Cache in localStorage für schnelleren Zugriff
                        try {
                            const globalKeys = JSON.parse(localStorage.getItem('global_api_keys') || '{}');
                            globalKeys.openai = globalKeys.openai || {};
                            globalKeys.openai.key = key;
                            localStorage.setItem('global_api_keys', JSON.stringify(globalKeys));
                        } catch {}
                        return key;
                    }
                } catch (e) {
                    console.log('⚠️ awsAPISettings Fehler:', e.message);
                }
            }
            
            // ═══════════════════════════════════════════════════════════════════
            // QUELLE 6: AWS API Endpoint (letzter Fallback)
            // ═══════════════════════════════════════════════════════════════════
            try {
                console.log('🔍 Versuche AWS API Endpoint...');
                const apiUrl = window.getApiUrl 
                    ? window.getApiUrl('API_SETTINGS') + '/key?provider=openai' 
                    : (window.AWS_APP_CONFIG?.API_BASE || 'https://6i6ysj9c8c.execute-api.eu-central-1.amazonaws.com/v1') + '/api-settings/key?provider=openai';
                
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 3000);
                
                const response = await fetch(apiUrl, {
                    headers: { 'X-User-Id': this.getUserId() },
                    signal: controller.signal
                });
                clearTimeout(timeoutId);
                
                if (response.ok) {
                    const data = await response.json();
                    const key = data.apiKey || data.key;
                    if (isValidKey(key)) {
                        console.log('✅ API-Key über AWS API-Endpoint geladen');
                        return key;
                    }
                }
            } catch (e) {
                console.log('⚠️ API-Endpoint Fehler:', e.message);
            }
            
            // Keine Key gefunden - zeige Debug-Info
            console.log('❌ Kein API-Key gefunden!');
            console.log('📋 localStorage Keys:', Object.keys(localStorage).filter(k => k.includes('api') || k.includes('key') || k.includes('openai')));
            this.showToast('Kein API-Key gefunden. Verwende Template.', 'warning');
            return null;
            
        } catch (error) {
            console.error('❌ Kritischer Fehler bei API-Key Suche:', error);
            return null;
        }
    }
    
    /**
     * Hole Modell-Konfiguration aus Admin Panel (für Anschreibengenerierung)
     * Fallback auf gpt-5.2 wenn nicht konfiguriert
     */
    getOpenAIModel() {
        // 1. Versuche GlobalAPIManager (Admin Panel)
        if (window.GlobalAPIManager) {
            const config = window.GlobalAPIManager.getServiceConfig('openai');
            if (config && config.model) {
                console.log(`✅ Modell aus GlobalAPIManager: ${config.model}`);
                return config.model;
            }
        }
        
        // 2. Versuche global_api_keys localStorage
        try {
            const globalKeys = JSON.parse(localStorage.getItem('global_api_keys') || '{}');
            if (globalKeys.openai?.model) {
                console.log(`✅ Modell aus global_api_keys: ${globalKeys.openai.model}`);
                return globalKeys.openai.model;
            }
        } catch (e) {}
        
        // 3. Fallback: gpt-5.2 für Anschreibengenerierung (beste Qualität)
        console.log('ℹ️ Verwende Standard-Modell: gpt-5.2');
        return 'gpt-5.2';
    }
    
    getUserId() {
        try {
            const session = localStorage.getItem('aws_auth_session');
            if (session) {
                const parsed = JSON.parse(session);
                return parsed.userId || parsed.sub || 'anonymous';
            }
        } catch (e) {}
        return 'anonymous';
    }

    async generateWithAI(jobData, apiKey) {
        const prompt = this.buildPrompt(jobData);
        
        // Hole Modell aus Admin Panel Konfiguration (Fallback: gpt-5.2)
        const model = this.getOpenAIModel();
        const maxTokens = this.options.length === 'short' ? 800 : this.options.length === 'medium' ? 1200 : 1600;
        
        console.log('🤖 Sende Anfrage an OpenAI mit Modell:', model);
        console.log('📝 Prompt-Länge:', prompt.length, 'Zeichen');
        
        const requestBody = {
            model: model,
            reasoning_effort: 'low', // Schneller, aber immer noch intelligent
            verbosity: 'medium',
            messages: [
                {
                    role: 'system',
                    content: 'Du bist ein professioneller Bewerbungsberater und Experte für überzeugende Bewerbungsanschreiben. Du erstellst personalisierte, spezifische und authentische Anschreiben, die genau auf die Stellenbeschreibung eingehen. Du verwendest konkrete Beispiele, messbare Ergebnisse und vermeidest Floskeln. Antworte NUR mit dem Anschreiben-Text, keine zusätzlichen Erklärungen.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            max_completion_tokens: maxTokens
        };
        
        console.log('📤 Request Body:', JSON.stringify(requestBody, null, 2).substring(0, 500) + '...');
        
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('❌ OpenAI API Fehler:', response.status, errorData);
            throw new Error(`API Error: ${response.status} - ${errorData.error?.message || 'Unbekannter Fehler'}`);
        }
        
        const data = await response.json();
        console.log('✅ OpenAI Antwort erhalten, Tokens verwendet:', data.usage);
        
        const content = data.choices?.[0]?.message?.content;
        if (!content) {
            throw new Error('Keine Antwort von OpenAI erhalten');
        }
        
        return content;
    }

    async callOpenAI(messages, apiKey, opts = {}) {
        const requestBody = {
            model: opts.model || 'gpt-5.2',
            reasoning_effort: opts.reasoningEffort || 'low',
            verbosity: opts.verbosity || 'medium',
            messages,
            max_completion_tokens: opts.maxTokens ?? 1500
        };
        
        console.log('📤 callOpenAI Request:', requestBody.model, 'reasoning:', requestBody.reasoning_effort);
        
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('❌ OpenAI API Error:', response.status, errorData);
            throw new Error(`API Error: ${response.status} - ${errorData.error?.message || 'Unknown'}`);
        }
        
        const data = await response.json();
        console.log('✅ callOpenAI Response:', data.usage);
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
        console.log('📄 displayGeneratedLetter aufgerufen, Content-Länge:', content?.length);
        
        // Hide empty state
        const emptyState = document.getElementById('emptyState');
        if (emptyState) {
            emptyState.style.display = 'none';
            console.log('✅ Empty State ausgeblendet');
        } else {
            console.warn('⚠️ emptyState Element nicht gefunden');
        }
        
        // Show generated letter
        const generatedLetter = document.getElementById('generatedLetter');
        if (generatedLetter) {
            generatedLetter.style.display = 'block';
            // Stelle sicher, dass es auch im DOM sichtbar ist (auch wenn CSS es versteckt)
            generatedLetter.style.visibility = 'visible';
            generatedLetter.style.opacity = '1';
            console.log('✅ Generated Letter angezeigt');
        } else {
            console.error('❌ generatedLetter Element nicht gefunden!');
        }
        
        // Show toolbar
        const toolbar = document.getElementById('editorToolbar');
        if (toolbar) {
            toolbar.style.display = 'flex';
            console.log('✅ Toolbar angezeigt');
        } else {
            console.warn('⚠️ editorToolbar Element nicht gefunden');
        }
        
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
        
        // Aktiviere Export-Button wenn Content vorhanden ist
        this.updateExportButtonState();
    }
    
    updateExportButtonState() {
        const exportBtn = document.getElementById('exportPdfBtn');
        if (!exportBtn) return;
        
        const hasContent = this.generatedContent && this.generatedContent.trim() !== '';
        const letterText = document.getElementById('letterText');
        const hasLetterText = letterText && letterText.value && letterText.value.trim() !== '';
        
        exportBtn.disabled = !(hasContent || hasLetterText);
        
        if (exportBtn.disabled) {
            exportBtn.title = 'Bitte zuerst ein Anschreiben generieren';
        } else {
            exportBtn.title = 'Anschreiben als PDF exportieren';
        }
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
        
        // Firmenadresse setzen
        const addressDisplay = document.getElementById('companyAddressDisplay');
        if (addressDisplay) {
            const currentAddress = addressDisplay.textContent.trim();
            if (!currentAddress || currentAddress === 'Straße, PLZ Ort' || currentAddress.includes('Musterstraße')) {
                // Baue Firmenadresse aus einzelnen Feldern zusammen
                const street = jobData.companyStreet || jobData.street || '';
                const houseNumber = jobData.companyHouseNumber || jobData.houseNumber || '';
                const postalCode = jobData.companyPostalCode || jobData.postalCode || jobData.companyZip || '';
                const city = jobData.companyCity || jobData.city || '';
                
                let fullAddress = '';
                if (street || houseNumber) {
                    fullAddress = `${street} ${houseNumber}`.trim();
                }
                if (postalCode || city) {
                    if (fullAddress) fullAddress += ', ';
                    fullAddress += `${postalCode} ${city}`.trim();
                }
                
                // Fallback auf kombiniertes Adressfeld
                if (!fullAddress) {
                    fullAddress = jobData.companyAddress || '';
                }
                
                if (fullAddress) {
                    addressDisplay.textContent = fullAddress;
                }
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
        letter.style.setProperty('--paragraph-spacing', `${this.design.paragraphSpacing}px`);
        letter.style.setProperty('--letter-signature-gap', `${this.design.signatureGap}px`);
        letter.style.setProperty('--header-top-margin', `${this.design.headerTopMargin || 0}mm`);
        letter.style.setProperty('--recipient-top-margin', `${this.design.recipientTopMargin || 25}mm`);
        
        // Neue Einstellungen
        letter.style.setProperty('--subject-margin-top', `${this.design.subjectMarginTop || 15}mm`);
        letter.style.setProperty('--subject-margin-bottom', `${this.design.subjectMarginBottom || 10}mm`);
        letter.style.setProperty('--date-top-offset', `${this.design.dateTopOffset || 0}mm`);
        
        letter.style.fontFamily = `'${this.design.font}', sans-serif`;
        letter.style.fontSize = `${this.design.fontSize}pt`;
        letter.style.lineHeight = this.design.lineHeight;
        letter.style.padding = `${this.design.margin}mm`;
        
        // Header Contrast anwenden
        letter.classList.remove('header-contrast-light', 'header-contrast-dark', 'header-contrast-auto');
        if (this.design.headerContrast && this.design.headerContrast !== 'auto') {
            letter.classList.add(`header-contrast-${this.design.headerContrast}`);
        }
        
        // Text-Formatierung anwenden
        const senderName = document.getElementById('senderName');
        if (senderName) {
            senderName.style.fontWeight = this.design.senderNameBold !== false ? '600' : 'normal';
        }
        
        const companyName = document.getElementById('companyNameDisplay');
        if (companyName) {
            companyName.style.fontWeight = this.design.companyNameBold ? '700' : '500';
        }
        
        const subjectLabel = letter.querySelector('.subject-label');
        if (subjectLabel) {
            subjectLabel.style.fontWeight = this.design.subjectBold !== false ? '600' : 'normal';
        }
        
        const signatureName = document.getElementById('signatureName');
        if (signatureName) {
            signatureName.style.fontWeight = this.design.signatureNameBold ? '600' : 'normal';
        }
        
        // Betreff-Abstände anwenden
        const subjectEl = letter.querySelector('.letter-subject');
        if (subjectEl) {
            subjectEl.style.marginTop = `${this.design.subjectMarginTop || 15}mm`;
            subjectEl.style.marginBottom = `${this.design.subjectMarginBottom || 10}mm`;
        }
        
        // Datum-Position anwenden
        const letterHeader = letter.querySelector('.letter-header');
        if (letterHeader) {
            letterHeader.classList.remove('date-top-left', 'date-top-right', 'date-below-sender', 'date-above-recipient');
            letterHeader.classList.add(`date-${this.design.datePosition || 'top-right'}`);
        }
        
        // Datum-Offset anwenden
        const dateContainer = letter.querySelector('.letter-date-container');
        if (dateContainer) {
            dateContainer.style.marginTop = `${this.design.dateTopOffset || 0}mm`;
        }
        
        // Seitenumbruch-Indikator prüfen
        this.checkPageBreak();
        
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
    
    checkPageBreak() {
        const letterBody = document.getElementById('letterBody');
        const pageBreakIndicator = document.getElementById('pageBreakIndicator');
        const pageContainer = document.querySelector('.letter-page-container');
        
        if (!letterBody || !pageBreakIndicator || !pageContainer) return;
        
        // A4 Höhe in Pixel (bei 96 DPI): 297mm ≈ 1123px, minus Margins
        const a4HeightPx = 1123 - (this.design.margin * 2 * 3.78); // mm zu px
        
        const contentHeight = pageContainer.scrollHeight;
        
        if (contentHeight > a4HeightPx) {
            pageBreakIndicator.classList.add('visible');
            // Positioniere den Indikator an der richtigen Stelle
            pageBreakIndicator.style.top = `${a4HeightPx}px`;
        } else {
            pageBreakIndicator.classList.remove('visible');
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
                    
                    // NEU: Finde Unterschriftenlinie und richte Y-Position darauf aus
                    const signatureLine = container.querySelector('.resume-signature-line, .signature-line');
                    if (signatureLine) {
                        const lineRect = signatureLine.getBoundingClientRect();
                        const lineRelativeY = lineRect.top - containerRect.top;
                        // Setze Unterschrift genau auf Linie (Y-Position = Linien-Y - Bildhöhe)
                        const adjustedY = lineRelativeY - rect.height;
                        this.design.signaturePosition = { x: relativeX, y: adjustedY };
                        signatureImg.style.top = `${adjustedY}px`;
                        signatureImg.style.left = `${relativeX}px`;
                        console.log('✅ Unterschrift auf Linie ausgerichtet:', { x: relativeX, y: adjustedY });
                    } else {
                        this.design.signaturePosition = { x: relativeX, y: relativeY };
                        signatureImg.style.left = `${relativeX}px`;
                        signatureImg.style.top = `${relativeY}px`;
                        console.log('✅ Unterschrift positioniert:', { x: relativeX, y: relativeY });
                    }
                    
                    // Speichere Design-Änderungen
                    this.saveDesign();
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
        const locationEl = document.getElementById('letterLocation');
        
        if (dateEl) {
            const country = this.getSelectedCountry();
            const format = this.design.dateFormat || 'de-long';
            const includeLocation = this.design.dateIncludeLocation;
            const now = new Date();
            
            let formattedDate = '';
            
            // Datumsformate
            const formatDate = (date, formatType) => {
                switch (formatType) {
                    case 'de-long':
                        return date.toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' });
                    case 'de-short':
                        return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
                    case 'ch':
                        return date.toLocaleDateString('de-CH', { day: 'numeric', month: 'long', year: 'numeric' });
                    case 'at':
                        return date.toLocaleDateString('de-AT', { day: 'numeric', month: 'long', year: 'numeric' });
                    case 'en-uk':
                        return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
                    case 'en-us':
                        return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
                    case 'fr':
                        return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
                    case 'nl':
                        return date.toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' });
                    case 'iso':
                        return date.toISOString().slice(0, 10);
                    default:
                        return date.toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' });
                }
            };
            
            formattedDate = formatDate(now, format);
            
            // Ort vor Datum (wenn aktiviert)
            if (includeLocation) {
                const city = this.profileData?.city || this.profileData?.ort || 
                            this.profileData?.location?.split(',')[0] || '';
                if (city) {
                    formattedDate = `${city}, ${formattedDate}`;
                }
                if (locationEl) locationEl.style.display = 'none';
            } else {
                if (locationEl) locationEl.style.display = '';
            }
            
            dateEl.textContent = formattedDate;
            
            // Initial: Format basierend auf Land setzen
            const dateFormatSelect = document.getElementById('dateFormatSelect');
            if (dateFormatSelect && !this.design.dateFormatInitialized) {
                const countryFormats = {
                    'DE': 'de-long',
                    'CH': 'ch',
                    'AT': 'at',
                    'US': 'en-us',
                    'UK': 'en-uk',
                    'FR': 'fr',
                    'NL': 'nl'
                };
                if (countryFormats[country]) {
                    dateFormatSelect.value = countryFormats[country];
                    this.design.dateFormat = countryFormats[country];
                }
                this.design.dateFormatInitialized = true;
            }
        }
    }

    showLoading() {
        const loading = document.getElementById('loadingAnimation');
        if (loading) {
            loading.style.display = 'flex';
            console.log('📊 Loading-Animation angezeigt');
        } else {
            console.warn('⚠️ loadingAnimation Element nicht gefunden');
        }
    }

    hideLoading() {
        const loading = document.getElementById('loadingAnimation');
        if (loading) {
            loading.style.display = 'none';
            console.log('📊 Loading-Animation ausgeblendet');
        } else {
            console.warn('⚠️ loadingAnimation Element nicht gefunden');
        }
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
        const now = new Date().toISOString();
        
        // Versionierung: Version erhöhen wenn ID bereits existiert
        let version = '1.0';
        if (this.currentCoverLetterId && this.currentVersion) {
            const parts = this.currentVersion.split('.');
            version = `${parts[0]}.${(parseInt(parts[1] || 0) + 1)}`;
        }
        
        // Normalisiere design object - stelle sicher, dass alle Properties gespeichert werden
        // Verhindert, dass undefined/null Properties verloren gehen
        const designToSave = {
            style: this.design.style || 'modern',
            font: this.design.font || 'Inter',
            color: this.design.color || '#6366f1',
            fontSize: this.design.fontSize || 11,
            lineHeight: this.design.lineHeight || 1.6,
            margin: this.design.margin || 25,
            paragraphSpacing: this.design.paragraphSpacing || 10,
            signatureGap: this.design.signatureGap || 32,
            signatureImage: this.design.signatureImage || '',
            headerTopMargin: this.design.headerTopMargin ?? 0,
            headerContrast: this.design.headerContrast || 'auto',
            recipientTopMargin: this.design.recipientTopMargin ?? 25,
            subjectMarginTop: this.design.subjectMarginTop ?? 15,
            subjectMarginBottom: this.design.subjectMarginBottom ?? 10,
            dateFormat: this.design.dateFormat || 'de-long',
            datePosition: this.design.datePosition || 'top-right',
            dateTopOffset: this.design.dateTopOffset ?? 0,
            dateIncludeLocation: this.design.dateIncludeLocation ?? false,
            senderNameBold: this.design.senderNameBold !== false,
            companyNameBold: this.design.companyNameBold ?? false,
            subjectBold: this.design.subjectBold !== false,
            signatureNameBold: this.design.signatureNameBold ?? false,
            signaturePosition: this.design.signaturePosition || null,
            signatureSize: this.design.signatureSize || null
        };
        
        console.log('💾 Speichere Design:', JSON.stringify(this.design, null, 2));
        console.log('💾 Normalisiertes Design:', JSON.stringify(designToSave, null, 2));
        
        const data = {
            id: this.currentCoverLetterId || `cl_${Date.now().toString(36)}`,
            content: content,
            jobData: jobData,
            options: this.options,
            design: designToSave,
            version: version,
            createdAt: this.currentCreatedAt || now,
            updatedAt: now
        };
        
        console.log('💾 Gespeichertes Design in data:', JSON.stringify(data.design, null, 2));
        
        this.currentCoverLetterId = data.id;
        this.currentVersion = version;
        this.currentCreatedAt = data.createdAt;
        
        try {
            // Save to cloud if available
            if (window.cloudDataService) {
                await window.cloudDataService.saveCoverLetter(data);
            }
            
            // localStorage: Update oder Hinzufügen
            const stored = JSON.parse(localStorage.getItem('cover_letter_drafts') || '[]');
            const existingIndex = stored.findIndex(cl => cl.id === data.id);
            if (existingIndex >= 0) {
                stored[existingIndex] = data;
            } else {
                stored.unshift(data); // Neues vorne einfügen
            }
            localStorage.setItem('cover_letter_drafts', JSON.stringify(stored));
            
            this.showToast(`Anschreiben v${version} gespeichert!`, 'success');
            this.loadCoverLetterOptions();
        } catch (error) {
            console.error('Save error:', error);
            this.showToast('Fehler beim Speichern', 'error');
        }
    }

    async exportToPDF() {
        // Prüfe Content
        if (!this.generatedContent || this.generatedContent.trim() === '') {
            this.showToast('Kein Anschreiben zum Exportieren. Bitte zuerst ein Anschreiben generieren.', 'error');
            return;
        }
        
        // Prüfe DOM-Element
        const letterText = document.getElementById('letterText');
        if (!letterText || !letterText.value || letterText.value.trim() === '') {
            this.showToast('Anschreiben ist leer. Bitte zuerst ein Anschreiben generieren.', 'error');
            return;
        }
        
        // Option: Vorschau oder Direkt-Download
        const usePreview = true;
        
        if (usePreview) {
            this.showPDFPreview();
        } else {
            await this.downloadPDF();
        }
    }
    
    async generatePDFBytes() {
        // Versuche zuerst Lambda-basierte PDF-Generierung (wie Resume-Editor)
        try {
            return await this.generatePDFWithLambda();
        } catch (lambdaError) {
            console.warn('⚠️ Lambda PDF-Generierung fehlgeschlagen, verwende jsPDF-Fallback:', lambdaError);
            // Fallback zu jsPDF
            return await this.generatePDFBytesWithJsPDF();
        }
    }
    
    async generatePDFBytesWithJsPDF() {
        // Neuer verbesserter PDF-Export mit jsPDF (Vektor-Text)
        try {
            // Lade pdfService wenn nicht vorhanden
            if (!window.pdfService) {
                await this.loadScript('js/pdf-service.js');
            }
            
            const jobData = this.collectJobData();
            const doc = await window.pdfService.createDocument({
                title: `Anschreiben - ${jobData.companyName || 'Bewerbung'}`,
                author: this.profileData?.firstName + ' ' + this.profileData?.lastName,
                subject: `Bewerbung für ${jobData.position || 'Position'}`,
                keywords: ['Bewerbung', 'Anschreiben', jobData.companyName, jobData.position].filter(Boolean)
            });
            
            const margin = this.design.margin || 25;
            const pageWidth = 210;
            const pageHeight = 297;
            const contentWidth = pageWidth - (margin * 2);
            let y = margin;
            
            // Schriftart und -größe
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(this.design.fontSize || 11);
            
            // === HEADER (Absender) - Mehrzeilig ===
            const senderName = document.getElementById('senderName')?.textContent || '';
            const senderStreet = document.getElementById('senderStreet')?.textContent || '';
            const senderCity = document.getElementById('senderCity')?.textContent || '';
            const senderContact = document.getElementById('senderContact')?.textContent || '';
            
            // Absender-Name (fett wenn eingestellt)
            doc.setFontSize(12);
            doc.setFont('helvetica', this.design.senderNameBold !== false ? 'bold' : 'normal');
            doc.text(senderName, margin, y);
            y += 5;
            
            // Absender-Adresse mehrzeilig
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(100, 100, 100);
            if (senderStreet) {
                doc.text(senderStreet, margin, y);
                y += 4;
            }
            if (senderCity) {
                doc.text(senderCity, margin, y);
                y += 4;
            }
            if (senderContact) {
                doc.text(senderContact, margin, y);
                y += 4;
            }
            
            // Datum rechts
            const dateText = document.getElementById('letterDate')?.textContent || new Date().toLocaleDateString('de-DE');
            const datePosition = this.design.datePosition || 'top-right';
            const dateTopOffset = this.design.dateTopOffset || 0;
            
            if (datePosition === 'top-right') {
                doc.text(dateText, pageWidth - margin, margin + dateTopOffset, { align: 'right' });
            } else if (datePosition === 'top-left') {
                doc.text(dateText, margin, margin + dateTopOffset);
            }
            
            y += 15;
            
            // === EMPFÄNGER (mehrzeilig) ===
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(11);
            
            const companyName = document.getElementById('companyNameDisplay')?.textContent || jobData.companyName || '';
            const companyStreet = document.getElementById('companyStreetDisplay')?.textContent || '';
            const companyLocation = document.getElementById('companyLocationDisplay')?.textContent || '';
            const contactPerson = document.getElementById('contactPersonDisplay')?.textContent || '';
            
            if (companyName) {
                doc.setFont('helvetica', this.design.companyNameBold ? 'bold' : 'normal');
                doc.text(companyName, margin, y);
                y += 5;
            }
            doc.setFont('helvetica', 'normal');
            if (companyStreet) {
                doc.text(companyStreet, margin, y);
                y += 5;
            }
            if (companyLocation) {
                doc.text(companyLocation, margin, y);
                y += 5;
            }
            if (contactPerson) {
                doc.text(contactPerson, margin, y);
                y += 5;
            }
            
            // Betreff-Abstände
            y += this.design.subjectMarginTop || 15;
            
            // === BETREFF ===
            const subject = document.getElementById('subjectLine')?.value || `Bewerbung als ${jobData.position}`;
            doc.setFont('helvetica', this.design.subjectBold !== false ? 'bold' : 'normal');
            doc.setFontSize(11);
            doc.text(`Betreff: ${subject}`, margin, y);
            y += (this.design.subjectMarginBottom || 10);
            
            // === ANREDE ===
            const salutation = document.getElementById('greetingSalutation')?.value || 'Sehr geehrte Damen und Herren,';
            doc.setFont('helvetica', 'normal');
            doc.text(salutation, margin, y);
            y += 8;
            
            // === HAUPTTEXT ===
            const letterTextEl = document.getElementById('letterText');
            let letterText = '';
            if (letterTextEl) {
                // Kann Textarea oder contenteditable div sein
                letterText = letterTextEl.value || letterTextEl.textContent || letterTextEl.innerText || '';
            }
            letterText = letterText || this.generatedContent || '';
            const fontSize = this.design.fontSize || 11;
            const lineHeight = this.design.lineHeight || 1.5;
            
            doc.setFontSize(fontSize);
            const lines = doc.splitTextToSize(letterText, contentWidth);
            
            for (const line of lines) {
                if (y > pageHeight - margin - 40) {
                    doc.addPage();
                    y = margin;
                }
                doc.text(line, margin, y);
                y += fontSize * 0.352778 * lineHeight;
            }
            
            y += 5;
            
            // === GRUSSFORMEL ===
            const greeting = document.getElementById('greetingText')?.value || 'Mit freundlichen Grüßen';
            doc.text(greeting, margin, y);
            y += 15;
            
            // === UNTERSCHRIFT ===
            const signatureImg = document.getElementById('signatureImage');
            if (signatureImg && signatureImg.src && signatureImg.style.display !== 'none') {
                try {
                    doc.addImage(signatureImg.src, 'PNG', margin, y, 50, 20);
                    y += 25;
                } catch (e) {
                    console.warn('Unterschrift konnte nicht hinzugefügt werden');
                }
            }
            
            // Name unter Unterschrift
            const signatureName = document.getElementById('signatureName')?.value || 
                                 document.getElementById('signatureName')?.textContent || 
                                 senderName;
            doc.text(signatureName, margin, y);
            
            return doc.output('arraybuffer');
            
        } catch (error) {
            console.error('Fehler bei PDF-Generierung:', error);
            // Fallback zu html2pdf
            return this.generatePDFBytesLegacy();
        }
    }
    
    /**
     * Lambda-basierte PDF-Generierung (EXAKT wie Resume-Editor)
     * Generiert PDF über AWS Lambda pdf-generator für bessere CSS-Unterstützung
     */
    async generatePDFWithLambda() {
        console.log('🔄 Generiere Anschreiben-PDF mit direkter HTML-zu-PDF Konvertierung (AWS Lambda)...');
        
        // Prüfe zuerst, ob Content vorhanden ist
        if (!this.generatedContent || this.generatedContent.trim() === '') {
            throw new Error('Kein Anschreiben zum Exportieren. Bitte zuerst ein Anschreiben generieren.');
        }
        
        let letterElement = document.getElementById('generatedLetter');
        if (!letterElement) {
            throw new Error('Anschreiben-Container nicht gefunden. Bitte Seite neu laden.');
        }
        
        // Prüfe, ob das Element tatsächlich Content hat
        const letterText = document.getElementById('letterText');
        if (!letterText || !letterText.value || letterText.value.trim() === '') {
            throw new Error('Anschreiben ist leer. Bitte zuerst ein Anschreiben generieren.');
        }
        
        // Stelle sicher, dass das Element sichtbar ist (auch wenn display: none war)
        if (letterElement.style.display === 'none' || window.getComputedStyle(letterElement).display === 'none') {
            console.warn('⚠️ generatedLetter ist versteckt - mache es sichtbar für Export');
            letterElement.style.display = 'block';
        }
        
        // Klone das Letter-Element (wie Resume-Editor)
        const clone = letterElement.cloneNode(true);
        
        // WICHTIG: Canvas-Inhalte (z.B. Unterschrift) in Clone übernehmen
        this.replaceCanvasesWithImages(letterElement, clone);
        
        // Stelle sicher, dass signatureImage im Clone vorhanden ist
        const originalSignatureImg = letterElement.querySelector('#signatureImage');
        const cloneSignatureImg = clone.querySelector('#signatureImage');
        if (originalSignatureImg && cloneSignatureImg && this.design.signatureImage) {
            cloneSignatureImg.src = this.design.signatureImage;
            cloneSignatureImg.style.display = 'block';
            // Position und Größe übernehmen
            if (this.design.signaturePosition) {
                cloneSignatureImg.style.left = `${this.design.signaturePosition.x}px`;
                cloneSignatureImg.style.top = `${this.design.signaturePosition.y}px`;
            }
            if (this.design.signatureSize) {
                cloneSignatureImg.style.width = `${this.design.signatureSize}px`;
                cloneSignatureImg.style.height = 'auto';
            }
            console.log('✅ signatureImage im Clone gesetzt');
        }
        
        // WICHTIG: Nach Möglichkeit Bilder in den Clone einbetten (data: URLs), damit Lambda sie sicher rendern kann
        await this.inlineImagesAsDataUrls(clone);
        
        // Ersetze Textareas und Inputs durch statische Elemente
        clone.querySelectorAll('textarea').forEach(ta => {
            const div = document.createElement('div');
            div.innerHTML = ta.value.replace(/\n/g, '<br>');
            div.style.whiteSpace = 'pre-wrap';
            div.style.fontFamily = 'inherit';
            div.style.fontSize = 'inherit';
            div.style.lineHeight = 'inherit';
            ta.replaceWith(div);
        });
        
        clone.querySelectorAll('input[type="text"]').forEach(input => {
            const span = document.createElement('span');
            span.textContent = input.value;
            span.style.fontFamily = 'inherit';
            span.style.fontSize = 'inherit';
            input.replaceWith(span);
        });
        
        // WICHTIG: Ersetze ALLE CSS-Variablen im geklonten HTML durch tatsächliche Werte
        this.replaceCSSVariablesInElement(clone);
        
        // WICHTIG: Wende Design-Settings direkt auf den Clone an (für PDF-Export)
        // Das stellt sicher, dass alle Styles korrekt übernommen werden
        this.applyDesignSettingsToElement(clone, true); // true = isPDFExport
        
        // Stelle sicher, dass das Element die richtige Struktur hat
        if (!clone.classList.contains('generated-letter')) {
            clone.classList.add('generated-letter');
        }
        
        // Generiere vollständiges HTML-Dokument (wie Resume-Editor)
        const htmlContent = this.generateCoverLetterHTMLDocument(clone);
        
        console.log('📄 HTML generiert, Länge:', htmlContent.length, 'Zeichen');
        console.log('🚀 Verwende direkte PDF-Generierung (ohne GPT) - wie Resume-Editor');
        
        // Hole Auth Token falls vorhanden
        let authToken = null;
        try {
            if (window.UnifiedAWSAuth && window.UnifiedAWSAuth.getInstance) {
                const auth = window.UnifiedAWSAuth.getInstance();
                if (auth && auth.getCurrentUser) {
                    const user = await auth.getCurrentUser();
                    if (user && user.signInUserSession) {
                        authToken = user.signInUserSession.idToken.jwtToken;
                    }
                }
            }
        } catch (e) {
            console.warn('⚠️ Auth Token konnte nicht geladen werden:', e);
        }
        
        // Rufe einfache PDF-Generator Lambda auf (OHNE GPT - direkt HTML zu PDF)
        const apiUrl = window.getApiUrl('PDF_GENERATOR');
        if (!apiUrl) {
            throw new Error('PDF Generator API URL nicht gefunden. Bitte aws-app-config.js prüfen.');
        }
        
        console.log('📡 Sende HTML direkt an PDF-Generator Lambda (ohne GPT):', apiUrl);
        console.log('📦 HTML Content Preview:', htmlContent.substring(0, 200) + '...');
        
        const headers = {
            'Content-Type': 'application/json',
            ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {})
        };
        
        const body = JSON.stringify({
            html: htmlContent, // Vollständiges HTML-Dokument
            options: {
                format: 'A4',
                printBackground: true,
                preferCSSPageSize: false,
                // NOTE: Die Lambda `pdf-generator` erzwingt Puppeteer-Margins = 0mm.
                // Die echten Ränder kommen deshalb aus dem HTML-Padding (mm) des Containers.
                margin: { top: '0mm', right: '0mm', bottom: '0mm', left: '0mm' },
                displayHeaderFooter: false
            }
        });
        
        const maxAttempts = 3;
        let lastError = null;
        
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 25000);
            
            try {
                console.log(`📡 PDF-Export Attempt ${attempt}/${maxAttempts}`);
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers,
                    signal: controller.signal,
                    body
                });
                
                clearTimeout(timeoutId);
                
                if (!response.ok) {
                    const errorText = await response.text();
                    let errorData;
                    try {
                        errorData = JSON.parse(errorText);
                    } catch (e) {
                        errorData = { error: errorText };
                    }
                    
                    const message = errorData.error || errorData.message || `HTTP ${response.status}`;
                    const retryableStatus = response.status >= 500 || response.status === 429;
                    
                    if (attempt < maxAttempts && retryableStatus) {
                        console.warn(`⚠️ PDF-Generator HTTP ${response.status} – retry:`, message);
                        await new Promise(resolve => setTimeout(resolve, 500 * attempt + 250));
                        continue;
                    }
                    
                    throw new Error(`PDF-Generierung fehlgeschlagen: ${message}`);
                }
                
                // API Gateway gibt Base64 direkt im Body zurück (wegen isBase64Encoded: true)
                const contentType = response.headers.get('Content-Type');
                console.log('📦 Response Content-Type:', contentType);
                console.log('📦 Response Status:', response.status, response.statusText);
                
                // WICHTIG: Safari-Erkennung und spezielle Behandlung
                const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
                console.log('🌐 Browser erkannt:', isSafari ? 'Safari' : 'Anderer Browser');
                
                // WICHTIG: Response kann nur EINMAL gelesen werden!
                // API Gateway mit isBase64Encoded: true gibt Base64-STRING zurück (auch bei Content-Type: application/pdf)
                // Daher IMMER zuerst als Text lesen, dann dekodieren
                
                // Hilfsfunktion für Safari-kompatible Base64-Dekodierung (Chunk-basiert)
                const decodeBase64Safari = (base64String) => {
                    const cleanBase64 = base64String.trim().replace(/\s/g, '');
                    
                    // Safari kann atob() nicht mit sehr großen Strings handhaben
                    // Teile in Chunks auf (max 32768 Zeichen pro Chunk)
                    const chunkSize = 32768;
                    const chunks = [];
                    
                    for (let i = 0; i < cleanBase64.length; i += chunkSize) {
                        const chunk = cleanBase64.substring(i, i + chunkSize);
                        try {
                            const binaryString = atob(chunk);
                            for (let j = 0; j < binaryString.length; j++) {
                                chunks.push(binaryString.charCodeAt(j));
                            }
                        } catch (e) {
                            console.error('❌ Fehler beim Dekodieren von Base64-Chunk:', e);
                            throw new Error(`Base64-Dekodierung fehlgeschlagen bei Position ${i}: ${e.message}`);
                        }
                    }
                    
                    return new Uint8Array(chunks);
                };
                
                // Lese Response als Text (Base64-String von API Gateway)
                // WICHTIG: Response.text() kann nur einmal aufgerufen werden!
                try {
                    const base64Data = await response.text();
                    console.log('📦 Base64 Response Länge:', base64Data.length, 'Zeichen');
                    console.log('📦 Base64 Preview:', base64Data.substring(0, 50) + '...');
                    
                    // Prüfe, ob es wirklich Base64 ist (nicht bereits ein Fehler-JSON)
                    if (base64Data.trim().startsWith('{')) {
                        try {
                            const errorData = JSON.parse(base64Data);
                            throw new Error(`PDF-Generierung fehlgeschlagen: ${errorData.error || errorData.message || 'Unbekannter Fehler'}`);
                        } catch (jsonError) {
                            // Wenn es kein JSON ist, ist es wahrscheinlich Base64
                        }
                    }
                    
                    // Safari-kompatible Dekodierung (Chunk-basiert für große Strings)
                    // WICHTIG: Safari hat Probleme mit atob() auch bei kleineren Strings, daher immer Chunk-basiert für Safari
                    let bytes;
                    if (isSafari) {
                        console.log('🦁 Safari erkannt - verwende Chunk-basierte Base64-Dekodierung');
                        bytes = decodeBase64Safari(base64Data);
                    } else {
                        // Standard-Dekodierung für andere Browser
                        const cleanBase64 = base64Data.trim().replace(/\s/g, '');
                        try {
                            const binaryString = atob(cleanBase64);
                            bytes = new Uint8Array(binaryString.length);
                            for (let i = 0; i < binaryString.length; i++) {
                                bytes[i] = binaryString.charCodeAt(i);
                            }
                        } catch (atobError) {
                            // Fallback: Auch für andere Browser Chunk-basiert, falls atob() fehlschlägt
                            console.warn('⚠️ atob() fehlgeschlagen, verwende Chunk-basierte Dekodierung:', atobError);
                            bytes = decodeBase64Safari(base64Data);
                        }
                    }
                    
                    const pdfBlob = new Blob([bytes], { type: 'application/pdf' });
                    console.log('✅ PDF generiert (Base64 dekodiert):', pdfBlob.size, 'Bytes');
                    return pdfBlob;
                    
                } catch (base64Error) {
                    console.error('❌ Base64-Dekodierung fehlgeschlagen:', base64Error);
                    console.error('❌ Fehler-Details:', {
                        name: base64Error.name,
                        message: base64Error.message,
                        stack: base64Error.stack
                    });
                    throw new Error(`PDF-Generierung fehlgeschlagen: Konnte Response nicht dekodieren. ${base64Error.message}`);
                }
                
            } catch (error) {
                clearTimeout(timeoutId);
                lastError = error;
                
                const isAbort = error && error.name === 'AbortError';
                const isNetworkOrCors = error instanceof TypeError || /Failed to fetch/i.test(String(error && error.message ? error.message : error));
                
                // In der Praxis: "CORS blocked" ist oft ein Gateway-Error ohne CORS-Header (502/504/413).
                if (attempt < maxAttempts && (isAbort || isNetworkOrCors)) {
                    console.warn('⚠️ PDF-Export Netz/Timeout Problem – retry:', error);
                    await delay(750 * attempt);
                    continue;
                }
                
                if (isAbort) {
                    console.error('❌ PDF Export Timeout: Die Anfrage dauerte länger als 25 Sekunden');
                    throw new Error('PDF-Generierung dauerte zu lange. Bitte versuchen Sie es erneut.');
                }
                
                if (isNetworkOrCors) {
                    this.showToast('PDF-Generator nicht erreichbar (Netzwerk/CORS). Bitte erneut versuchen.', 'error');
                }
                
                throw error;
            }
        }
        
        throw lastError || new Error('PDF-Export fehlgeschlagen (unbekannt)');
    }
    
    /**
     * Ersetzt Canvas-Elemente im Clone durch <img>, basierend auf den Canvas-Inhalten im Original-DOM.
     * (Kopiert aus DesignEditor)
     */
    replaceCanvasesWithImages(sourceRoot, targetRoot) {
        try {
            const sourceCanvases = Array.from(sourceRoot.querySelectorAll('canvas'));
            const targetCanvases = Array.from(targetRoot.querySelectorAll('canvas'));
            if (sourceCanvases.length === 0 || targetCanvases.length === 0) return;
            
            const len = Math.min(sourceCanvases.length, targetCanvases.length);
            for (let i = 0; i < len; i++) {
                const srcCanvas = sourceCanvases[i];
                const tgtCanvas = targetCanvases[i];
                let dataUrl = null;
                try {
                    dataUrl = srcCanvas.toDataURL('image/png');
                } catch (e) {
                    continue;
                }
                if (!dataUrl || !dataUrl.startsWith('data:image/')) continue;
                
                const img = document.createElement('img');
                img.src = dataUrl;
                img.alt = 'Canvas Export';
                img.width = srcCanvas.width || undefined;
                img.height = srcCanvas.height || undefined;
                // Übernehme Layout-relevante Styles/Attribute
                img.style.cssText = tgtCanvas.style.cssText || '';
                if (tgtCanvas.className) img.className = tgtCanvas.className;
                if (tgtCanvas.id) img.id = tgtCanvas.id;
                
                tgtCanvas.replaceWith(img);
            }
        } catch (e) {
            console.warn('⚠️ replaceCanvasesWithImages() fehlgeschlagen:', e);
        }
    }
    
    /**
     * Versucht, <img>-Quellen im Element als data: URLs einzubetten (best-effort).
     * (Kopiert aus DesignEditor)
     */
    async inlineImagesAsDataUrls(root, options = {}) {
        const maxImages = Number(options.maxImages || 30);
        const imgs = Array.from(root.querySelectorAll('img')).slice(0, maxImages);
        
        const blobToDataUrl = (blob) => new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result));
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
        
        for (const img of imgs) {
            try {
                const src = (img.getAttribute('src') || '').trim();
                
                // Überspringe leere Quellen
                if (!src) continue;
                
                // Prüfe ob bereits data: URL vorhanden ist (aber prüfe auf Gültigkeit)
                if (src.startsWith('data:')) {
                    // Prüfe ob data: URL gültig ist
                    if (src.length > 100 && src.includes('base64,')) {
                        continue; // Gültige data: URL - überspringe
                    } else {
                        console.warn('⚠️ Ungültige data: URL gefunden:', src.substring(0, 50));
                        // Versuche trotzdem fortzufahren
                    }
                }
                
                // Handle blob: URLs
                if (src.startsWith('blob:')) {
                    try {
                        const response = await fetch(src);
                        if (response.ok) {
                            const blob = await response.blob();
                            const dataUrl = await blobToDataUrl(blob);
                            if (dataUrl && dataUrl.startsWith('data:image/')) {
                                img.setAttribute('src', dataUrl);
                                console.log('✅ blob: URL zu data: URL konvertiert');
                            } else {
                                console.warn('⚠️ blob: URL konnte nicht zu data: URL konvertiert werden');
                            }
                        } else {
                            console.warn('⚠️ blob: URL konnte nicht geladen werden:', response.status);
                        }
                    } catch (e) {
                        console.warn('⚠️ blob: URL konnte nicht konvertiert werden:', e.message);
                    }
                    continue;
                }
                
                // Best-effort fetch für externe URLs
                try {
                    const response = await fetch(src, { mode: 'cors', credentials: 'omit' });
                    if (!response.ok) {
                        console.warn('⚠️ Bild konnte nicht geladen werden:', src, `(${response.status})`);
                        continue;
                    }
                    const blob = await response.blob();
                    const dataUrl = await blobToDataUrl(blob);
                    if (dataUrl && dataUrl.startsWith('data:image/')) {
                        img.setAttribute('src', dataUrl);
                        console.log('✅ Bild zu data: URL konvertiert');
                    } else {
                        console.warn('⚠️ Bild-Konvertierung fehlgeschlagen: Ungültiges Format');
                    }
                } catch (e) {
                    console.warn('⚠️ Bild-Konvertierung fehlgeschlagen (CORS?):', src, e.message);
                    // Bei CORS-Fehler: Versuche src direkt zu verwenden (Lambda kann es vielleicht laden)
                }
            } catch (e) {
                console.warn('⚠️ Bild-Verarbeitung fehlgeschlagen:', e.message);
            }
        }
    }
    
    /**
     * Ersetzt CSS-Variablen in inline styles und style-Attributen
     * (Vereinfachte Version für Anschreiben-Editor)
     */
    replaceCSSVariablesInElement(element) {
        // Ersetze in style-Attributen
        const allElements = element.querySelectorAll('*');
        allElements.forEach(el => {
            if (el.style) {
                const styleText = el.getAttribute('style') || '';
                let newStyleText = styleText;
                
                // Ersetze gängige CSS-Variablen durch tatsächliche Werte
                const replacements = {
                    '--cover-letter-font': this.design.font || 'Inter',
                    '--cover-letter-font-size': (this.design.fontSize || 11) + 'pt',
                    '--cover-letter-line-height': String(this.design.lineHeight || 1.6),
                    '--cover-letter-margin': (this.design.margin || 25) + 'mm',
                };
                
                for (const [varName, value] of Object.entries(replacements)) {
                    const regex = new RegExp(`var\\(${varName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:,\\s*[^)]+)?\\)`, 'g');
                    newStyleText = newStyleText.replace(regex, value);
                }
                
                if (newStyleText !== styleText) {
                    el.setAttribute('style', newStyleText);
                }
            }
        });
        
        // Ersetze auch im Element selbst
        if (element.style) {
            const styleText = element.getAttribute('style') || '';
            let newStyleText = styleText;
            
            const replacements = {
                '--cover-letter-font': this.design.font || 'Inter',
                '--cover-letter-font-size': (this.design.fontSize || 11) + 'pt',
                '--cover-letter-line-height': String(this.design.lineHeight || 1.6),
                '--cover-letter-margin': (this.design.margin || 25) + 'mm',
            };
            
            for (const [varName, value] of Object.entries(replacements)) {
                const regex = new RegExp(`var\\(${varName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:,\\s*[^)]+)?\\)`, 'g');
                newStyleText = newStyleText.replace(regex, value);
            }
            
            if (newStyleText !== styleText) {
                element.setAttribute('style', newStyleText);
            }
        }
    }
    
    /**
     * Wendet alle Design-Settings direkt auf Elemente an (für PDF-Export)
     * Ersetzt CSS-Variablen durch tatsächliche Werte
     */
    applyDesignSettingsToElement(element, isPDFExport = false) {
        // Wende alle Design-Settings direkt auf Elemente an (ersetzt CSS-Variablen)
        const fontFamily = this.design.font || 'Inter';
        const fontSize = this.design.fontSize || 11;
        const lineHeight = this.design.lineHeight || 1.6;
        const margin = this.design.margin || 25;
        const color = this.design.color || '#6366f1';
        const paragraphSpacing = this.design.paragraphSpacing || 10;
        const signatureGap = this.design.signatureGap || 32;
        
        // Haupt-Container
        const mainContainer = element.classList.contains('generated-letter') 
            ? element 
            : element.querySelector('.generated-letter') || element;
        
        if (mainContainer) {
            mainContainer.style.setProperty('font-family', `'${fontFamily}', sans-serif`, 'important');
            mainContainer.style.setProperty('font-size', fontSize + 'pt', 'important');
            mainContainer.style.setProperty('line-height', lineHeight, 'important');
            mainContainer.style.setProperty('--letter-font', `'${fontFamily}', sans-serif`, 'important');
            mainContainer.style.setProperty('--letter-font-size', `${fontSize}pt`, 'important');
            mainContainer.style.setProperty('--letter-line-height', String(lineHeight), 'important');
            mainContainer.style.setProperty('--letter-margin', `${margin}mm`, 'important');
            mainContainer.style.setProperty('--letter-accent', color, 'important');
            mainContainer.style.setProperty('--letter-paragraph-gap', `${paragraphSpacing}px`, 'important');
            mainContainer.style.setProperty('--paragraph-spacing', `${paragraphSpacing}px`, 'important');
            mainContainer.style.setProperty('--letter-signature-gap', `${signatureGap}px`, 'important');
            mainContainer.style.setProperty('--header-top-margin', `${this.design.headerTopMargin || 0}mm`, 'important');
            mainContainer.style.setProperty('--recipient-top-margin', `${this.design.recipientTopMargin || 25}mm`, 'important');
            mainContainer.style.setProperty('--subject-margin-top', `${this.design.subjectMarginTop || 15}mm`, 'important');
            mainContainer.style.setProperty('--subject-margin-bottom', `${this.design.subjectMarginBottom || 10}mm`, 'important');
            mainContainer.style.setProperty('--date-top-offset', `${this.design.dateTopOffset || 0}mm`, 'important');
            
            if (isPDFExport) {
                mainContainer.style.setProperty('padding', `${margin}mm`, 'important');
                mainContainer.style.setProperty('margin', '0', 'important');
                mainContainer.style.setProperty('transform', 'none', 'important');
                mainContainer.style.setProperty('transform-origin', 'top left', 'important');
            }
        }
        
        // Header Contrast
        if (this.design.headerContrast && this.design.headerContrast !== 'auto') {
            mainContainer.classList.remove('header-contrast-light', 'header-contrast-dark', 'header-contrast-auto');
            mainContainer.classList.add(`header-contrast-${this.design.headerContrast}`);
        }
        
        // Text-Formatierung
        const senderName = element.querySelector('#senderName');
        if (senderName) {
            senderName.style.setProperty('font-weight', this.design.senderNameBold !== false ? '600' : 'normal', 'important');
        }
        
        const companyName = element.querySelector('#companyNameDisplay');
        if (companyName) {
            companyName.style.setProperty('font-weight', this.design.companyNameBold ? '700' : '500', 'important');
        }
        
        const subjectLabel = element.querySelector('.subject-label');
        if (subjectLabel) {
            subjectLabel.style.setProperty('font-weight', this.design.subjectBold !== false ? '600' : 'normal', 'important');
        }
        
        const signatureName = element.querySelector('#signatureName');
        if (signatureName) {
            signatureName.style.setProperty('font-weight', this.design.signatureNameBold ? '600' : 'normal', 'important');
        }
        
        // Betreff-Abstände
        const subjectEl = element.querySelector('.letter-subject');
        if (subjectEl) {
            subjectEl.style.setProperty('margin-top', `${this.design.subjectMarginTop || 15}mm`, 'important');
            subjectEl.style.setProperty('margin-bottom', `${this.design.subjectMarginBottom || 10}mm`, 'important');
        }
        
        // Datum-Position
        const letterHeader = element.querySelector('.letter-header');
        if (letterHeader) {
            letterHeader.classList.remove('date-top-left', 'date-top-right', 'date-below-sender', 'date-above-recipient');
            letterHeader.classList.add(`date-${this.design.datePosition || 'top-right'}`);
        }
        
        // Datum-Offset
        const dateContainer = element.querySelector('.letter-date-container');
        if (dateContainer) {
            dateContainer.style.setProperty('margin-top', `${this.design.dateTopOffset || 0}mm`, 'important');
        }
        
        // Signature Image Position und Größe
        const signatureImg = element.querySelector('#signatureImage');
        if (signatureImg && this.design.signatureImage) {
            signatureImg.style.setProperty('display', 'block', 'important');
            if (this.design.signaturePosition) {
                signatureImg.style.setProperty('left', `${this.design.signaturePosition.x}px`, 'important');
                signatureImg.style.setProperty('top', `${this.design.signaturePosition.y}px`, 'important');
            }
            if (this.design.signatureSize) {
                signatureImg.style.setProperty('width', `${this.design.signatureSize}px`, 'important');
                signatureImg.style.setProperty('height', 'auto', 'important');
            }
        }
        
        // Style-spezifische Anpassungen (falls vorhanden)
        if (typeof this.applyLetterStyle === 'function') {
            this.applyLetterStyle(mainContainer);
        }
    }
    
    /**
     * Generiert vollständiges HTML5-Dokument für Anschreiben-PDF-Export
     * (Wie Resume-Editor: extractAllCSS + extractInlineStyles)
     */
    generateCoverLetterHTMLDocument(element) {
        const margin = this.design.margin || 25;
        const fontFamily = this.design.font || 'Inter';
        const fontSize = this.design.fontSize || 11;
        const lineHeight = this.design.lineHeight || 1.6;
        
        // Stelle sicher, dass das Element die PDF-Ränder als mm-Padding trägt.
        // WICHTIG: Die Lambda setzt Puppeteer-Margins auf 0mm – daher MUSS das HTML-Padding (mm)
        // der einzige Source-of-Truth für Ränder sein.
        const mainContainer = element.classList.contains('generated-letter') 
            ? element 
            : element.querySelector('.generated-letter') || element;
        
        if (mainContainer) {
            mainContainer.style.setProperty('padding', `${margin}mm`, 'important');
            mainContainer.style.setProperty('box-sizing', 'border-box', 'important');
            mainContainer.style.setProperty('width', '210mm', 'important');
            mainContainer.style.setProperty('margin', '0', 'important');
            mainContainer.style.setProperty('transform', 'none', 'important');
            mainContainer.style.setProperty('transform-origin', 'top left', 'important');
        }
        
        // Extrahiere alle CSS-Styles (WICHTIG: Vor dem HTML-Generieren, damit alle Styles verfügbar sind)
        let allCSS = this.extractAllCSSForCoverLetter();
        
        // Extrahiere auch alle inline Styles aus dem Element und seinen Kindern
        let inlineStyles = this.extractInlineStylesForCoverLetter(element);
        
        // WICHTIG (PDF): Zusätzliche Filterung - entferne min-height: 297mm aus dem gesamten CSS-String,
        // falls die Filterung in extractAllCSS() nicht alle Fälle erwischt hat (z.B. in zusammengesetzten CSS-Regeln)
        allCSS = allCSS.replace(/min-height\s*:\s*297[^;]*;?/gi, '');
        inlineStyles = inlineStyles.replace(/min-height\s*:\s*297[^;]*;?/gi, '');
        
        // Google Fonts Link
        const googleFontsUrl = this.getGoogleFontsUrlForCoverLetter(fontFamily);
        const googleFontsLink = googleFontsUrl ? `<link href="${googleFontsUrl}" rel="stylesheet">` : '';
        
        // Generiere vollständiges HTML5-Dokument
        const html = `<!DOCTYPE html>
<!-- exportSource:coverLetterEditor exportVersion:2026-01-24m -->
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Anschreiben PDF Export</title>
    ${googleFontsLink}
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        html, body {
            width: 210mm;
            margin: 0;
            padding: 0;
            height: auto !important;
            min-height: 0 !important;
            font-family: ${fontFamily}, sans-serif;
            font-size: ${fontSize}pt;
            line-height: ${lineHeight};
            color: #1e293b;
            background: #ffffff !important;
        }
        
        body {
            width: 210mm;
            height: auto !important;
            min-height: 0 !important;
        }
        
        .cover-letter-container {
            width: 210mm !important;
            min-width: 210mm !important;
            max-width: 210mm !important;
            margin: 0 !important;
            padding: ${margin}mm !important;
            box-sizing: border-box !important;
            background: #ffffff !important;
            height: auto !important;
            min-height: auto !important;
        }
        
        /* Extrahiertes CSS aus Stylesheets */
        ${allCSS}
        
        /* Inline Styles */
        ${inlineStyles}
        
        /* Final export overrides (MUSS als letztes kommen, damit nichts das Padding überschreibt) */
        .generated-letter {
            width: 210mm !important;
            min-width: 210mm !important;
            max-width: 210mm !important;
            margin: 0 !important;
            padding: ${margin}mm !important;
            box-sizing: border-box !important;
            box-shadow: none !important;
            background: #ffffff !important;
            height: auto !important;
            min-height: auto !important;
            transform: none !important;
            transform-origin: top left !important;
            zoom: 1 !important;
        }
        
        .generated-letter *:not(img):not(svg):not(canvas) {
            height: auto !important;
            min-height: 0 !important;
            max-height: none !important;
        }
    </style>
</head>
<body>
    ${element.outerHTML}
</body>
</html>`;
        
        return html;
    }
    
    /**
     * Extrahiert alle CSS-Styles aus Stylesheets (wie Resume-Editor)
     */
    extractAllCSSForCoverLetter() {
        const styles = [];
        
        // Alle Stylesheets (inkl. Google Fonts)
        Array.from(document.styleSheets).forEach(sheet => {
            try {
                // Prüfe ob Stylesheet von gleicher Origin ist
                if (sheet.href && !sheet.href.startsWith(window.location.origin) && !sheet.href.includes('fonts.googleapis.com')) {
                    // Cross-origin Stylesheet - überspringe
                    return;
                }
                
                Array.from(sheet.cssRules || []).forEach(rule => {
                    try {
                        let cssText = rule.cssText;
                        // WICHTIG (PDF): Entferne height/min-height/max-height aus ALLEN CSS-Regeln,
                        // da diese zu übermäßigem Leerraum und frühen Seitenumbrüchen führen können.
                        cssText = cssText.replace(/height\s*:\s*[^;]+;?/gi, '');
                        cssText = cssText.replace(/min-height\s*:\s*[^;]+;?/gi, '');
                        cssText = cssText.replace(/max-height\s*:\s*[^;]+;?/gi, '');
                        styles.push(cssText);
                    } catch (e) {
                        // Ignoriere Regeln, die nicht gelesen werden können
                    }
                });
            } catch (e) {
                // Cross-origin stylesheets können nicht gelesen werden
                console.warn('⚠️ Stylesheet konnte nicht gelesen werden:', sheet.href || 'inline', e);
            }
        });
        
        return styles.join('\n');
    }
    
    /**
     * Extrahiert inline Styles aus Elementen (wie Resume-Editor)
     */
    extractInlineStylesForCoverLetter(element) {
        const styles = [];
        const allElements = [element, ...Array.from(element.querySelectorAll('*'))];
        
        // Wichtige CSS-Properties, die extrahiert werden sollen
        const importantProperties = [
            'color', 'background-color', 'background', 'font-family', 'font-size', 'font-weight',
            'line-height', 'text-align', 'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
            'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
            'border', 'border-top', 'border-right', 'border-bottom', 'border-left',
            'display', 'flex-direction', 'justify-content', 'align-items', 'gap',
            'position', 'top', 'right', 'bottom', 'left',
            'opacity', 'box-shadow', 'text-shadow'
        ];
        
        allElements.forEach((el, index) => {
            try {
                // Überspringe Script- und Style-Tags
                if (el.tagName === 'SCRIPT' || el.tagName === 'STYLE') {
                    return;
                }
                
                // Hole computed styles vom Browser
                const computedStyle = window.getComputedStyle(el);
                const styleProperties = [];
                
                // Extrahiere wichtige Properties
                importantProperties.forEach(prop => {
                    const value = computedStyle.getPropertyValue(prop);
                    if (value && value !== 'none' && value !== 'normal' && value !== 'auto' && value !== '0px') {
                        // Konvertiere camelCase zu kebab-case
                        const kebabProp = prop.replace(/([A-Z])/g, '-$1').toLowerCase();
                        styleProperties.push(`${kebabProp}: ${value}`);
                    }
                });
                
                // Füge auch explizite inline styles hinzu
                if (el.style && el.style.cssText) {
                    const inlineStyles = el.style.cssText.split(';').filter(s => s.trim());
                    inlineStyles.forEach(style => {
                        if (style.trim() && !styleProperties.some(p => p.startsWith(style.trim().split(':')[0]))) {
                            styleProperties.push(style.trim());
                        }
                    });
                }
                
                if (styleProperties.length > 0) {
                    // Erstelle einen eindeutigen Selektor
                    let selector = '';
                    if (el.id) {
                        selector = `#${el.id}`;
                    } else if (el.className && typeof el.className === 'string') {
                        const classes = el.className.split(' ').filter(c => c.trim()).join('.');
                        if (classes) {
                            selector = `.${classes}`;
                        } else {
                            selector = el.tagName.toLowerCase();
                        }
                    } else {
                        selector = el.tagName.toLowerCase();
                    }
                    
                    // Füge einen eindeutigen Index hinzu, falls nötig
                    const uniqueSelector = `${selector}[data-pdf-el="${index}"]`;
                    
                    styles.push(`${uniqueSelector} { ${styleProperties.join('; ')}; }`);
                    
                    // Setze auch data-Attribut auf dem Element für Selektierung
                    el.setAttribute('data-pdf-el', index);
                }
            } catch (e) {
                console.warn('⚠️ Fehler beim Extrahieren von Styles für Element:', el, e);
            }
        });
        
        return styles.join('\n');
    }
    
    getGoogleFontsUrlForCoverLetter(fontFamily) {
        const fontMap = {
            'Inter': 'Inter:wght@300;400;500;600;700',
            'Roboto': 'Roboto:wght@300;400;500;700',
            'Open Sans': 'Open+Sans:wght@300;400;500;600;700',
            'Lato': 'Lato:wght@300;400;700',
            'Montserrat': 'Montserrat:wght@300;400;500;600;700',
            'Source Sans Pro': 'Source+Sans+Pro:wght@300;400;600;700',
            'Nunito': 'Nunito:wght@300;400;500;600;700',
            'Arial': null,
            'Helvetica Neue': null,
            'Georgia': 'Georgia:wght@400;700',
            'Times New Roman': null,
            'Merriweather': 'Merriweather:wght@300;400;700',
            'Playfair Display': 'Playfair+Display:wght@400;500;600;700',
            'Source Code Pro': 'Source+Code+Pro:wght@400;500;600'
        };
        
        const fontKey = fontFamily.replace(/'/g, '').trim();
        const fontParam = fontMap[fontKey] || fontMap['Inter'];
        
        if (!fontParam) return null;
        
        return `https://fonts.googleapis.com/css2?family=${fontParam}&display=swap`;
    }
    
    async generatePDFBytesLegacy() {
        // Fallback: html2pdf-basierter Export
        if (typeof html2pdf === 'undefined') {
            await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js');
        }
        
        const letter = document.getElementById('generatedLetter');
        if (!letter) throw new Error('Letter element not found');
        
        const clone = letter.cloneNode(true);
        clone.style.position = 'absolute';
        clone.style.left = '-9999px';
        clone.style.width = '210mm';
        clone.style.minHeight = '297mm';
        clone.style.background = 'white';
        
        // Input/Textarea ersetzen
        clone.querySelectorAll('textarea').forEach(ta => {
            const div = document.createElement('div');
            div.innerHTML = ta.value.replace(/\n/g, '<br>');
            div.style.whiteSpace = 'pre-wrap';
            ta.replaceWith(div);
        });
        clone.querySelectorAll('input[type="text"]').forEach(input => {
            const span = document.createElement('span');
            span.textContent = input.value;
            input.replaceWith(span);
        });
        
        document.body.appendChild(clone);
        
        const opt = {
            margin: 0,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        
        const pdfBytes = await html2pdf().set(opt).from(clone).outputPdf('arraybuffer');
        document.body.removeChild(clone);
        
        return pdfBytes;
    }
    
    showPDFPreview() {
        const letter = document.getElementById('generatedLetter');
        if (!letter) return;
        
        // Clone für Vorschau
        const previewClone = letter.cloneNode(true);
        previewClone.id = 'pdfPreviewClone';
        
        // Textarea durch div ersetzen
        const textarea = previewClone.querySelector('textarea');
        if (textarea) {
            const div = document.createElement('div');
            div.innerHTML = textarea.value.replace(/\n/g, '<br>');
            div.style.whiteSpace = 'pre-wrap';
            div.style.fontFamily = 'inherit';
            div.style.fontSize = 'inherit';
            div.style.lineHeight = 'inherit';
            textarea.parentNode.replaceChild(div, textarea);
        }
        
        // Input-Felder durch Spans ersetzen
        previewClone.querySelectorAll('input[type="text"]').forEach(input => {
            const span = document.createElement('span');
            span.textContent = input.value;
            span.style.fontFamily = 'inherit';
            span.style.fontSize = 'inherit';
            input.parentNode.replaceChild(span, input);
        });
        
        const jobData = this.collectJobData();
        const modal = document.createElement('div');
        modal.className = 'pdf-preview-modal';
        modal.innerHTML = `
            <div class="pdf-preview-content">
                <div class="pdf-preview-header">
                    <h3><i class="fas fa-file-pdf"></i> PDF Vorschau</h3>
                    <button onclick="this.closest('.pdf-preview-modal').remove()" class="btn-close" style="background: rgba(255,255,255,0.2); border: none; color: white; width: 32px; height: 32px; border-radius: 50%; cursor: pointer;">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="pdf-preview-body">
                    <div class="pdf-preview-page" id="pdfPreviewPage"></div>
                </div>
                <div class="pdf-preview-footer">
                    <button onclick="this.closest('.pdf-preview-modal').remove()" class="btn-glass" style="background: rgba(100,116,139,0.8);">
                        <i class="fas fa-times"></i> Abbrechen
                    </button>
                    <button onclick="window.coverLetterEditor.downloadPDF(); this.closest('.pdf-preview-modal').remove();" class="btn-glass btn-primary">
                        <i class="fas fa-download"></i> PDF herunterladen
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Clone in Vorschau einfügen
        const previewPage = document.getElementById('pdfPreviewPage');
        if (previewPage) {
            previewClone.style.width = '210mm';
            previewClone.style.minHeight = '297mm';
            previewClone.style.maxHeight = 'none';
            previewClone.style.overflow = 'visible';
            previewClone.style.margin = '0';
            previewClone.style.boxShadow = 'none';
            previewPage.appendChild(previewClone);
        }
    }
    
    async downloadPDF() {
        this.showToast('PDF wird erstellt...', 'info');
        
        try {
            const pdfResult = await this.generatePDFBytes();
            
            const jobData = this.collectJobData();
            const filename = `Anschreiben_${(jobData.companyName || 'Bewerbung').replace(/\s+/g, '_')}_${new Date().toISOString().slice(0,10)}.pdf`;
            
            // Konvertiere zu Blob (Lambda gibt Blob zurück, jsPDF gibt ArrayBuffer)
            const blob = pdfResult instanceof Blob 
                ? pdfResult 
                : pdfResult instanceof ArrayBuffer 
                    ? new Blob([pdfResult], { type: 'application/pdf' })
                    : new Blob([pdfResult], { type: 'application/pdf' });
            
            // Download
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            const sizeKb = (blob.size / 1024).toFixed(1);
            this.showToast(`PDF erfolgreich erstellt! (${sizeKb} KB)`, 'success');
            console.log(`✅ PDF exportiert: ${filename} (${sizeKb} KB)`);
            
        } catch (error) {
            console.error('PDF Export Error:', error);
            this.showToast(`Fehler beim PDF-Export: ${error.message || 'Unbekannter Fehler'}`, 'error');
            // Fallback zu Print
            this.showToast('Druckdialog geöffnet (Fallback)', 'warning');
            window.print();
        }
    }
    
    async downloadPDFWithPreview() {
        try {
            const pdfBytes = await this.generatePDFBytes();
            const jobData = this.collectJobData();
            const filename = `Anschreiben_${(jobData.companyName || 'Bewerbung').replace(/\s+/g, '_')}_${new Date().toISOString().slice(0,10)}.pdf`;
            
            // Konvertiere ArrayBuffer zu Blob falls nötig
            const blob = pdfBytes instanceof ArrayBuffer 
                ? new Blob([pdfBytes], { type: 'application/pdf' })
                : pdfBytes instanceof Blob 
                    ? pdfBytes 
                    : new Blob([pdfBytes], { type: 'application/pdf' });
            
            // Zeige Vorschau
            const blobUrl = URL.createObjectURL(blob);
            const iframe = document.createElement('iframe');
            iframe.src = blobUrl;
            iframe.style.width = '100%';
            iframe.style.height = '80vh';
            iframe.style.border = 'none';
            
            const modal = document.createElement('div');
            modal.className = 'pdf-preview-modal';
            modal.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.9); z-index: 10000; display: flex; flex-direction: column;';
            modal.innerHTML = `
                <div style="padding: 1rem; background: #1e293b; display: flex; justify-content: space-between; align-items: center;">
                    <h3 style="color: white; margin: 0;"><i class="fas fa-file-pdf"></i> PDF Vorschau</h3>
                    <button onclick="this.closest('.pdf-preview-modal').remove()" style="background: rgba(255,255,255,0.2); border: none; color: white; width: 32px; height: 32px; border-radius: 50%; cursor: pointer;">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div style="flex: 1; padding: 1rem; overflow: auto;">
                    ${iframe.outerHTML}
                </div>
                <div style="padding: 1rem; background: #1e293b; display: flex; gap: 1rem; justify-content: flex-end;">
                    <button onclick="this.closest('.pdf-preview-modal').remove()" style="padding: 0.6rem 1.2rem; background: rgba(100,116,139,0.8); border: none; color: white; border-radius: 8px; cursor: pointer;">
                        <i class="fas fa-times"></i> Abbrechen
                    </button>
                    <button onclick="window.coverLetterEditor.downloadPDF(); this.closest('.pdf-preview-modal').remove();" style="padding: 0.6rem 1.2rem; background: #6366f1; border: none; color: white; border-radius: 8px; cursor: pointer;">
                        <i class="fas fa-download"></i> PDF herunterladen
                    </button>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            // Cleanup beim Schließen
            modal.querySelector('button').addEventListener('click', () => {
                URL.revokeObjectURL(blobUrl);
            });
            
        } catch (error) {
            console.error('Preview Error:', error);
            this.downloadPDF();
        }
    }
    
    loadScript(src) {
        return new Promise((resolve, reject) => {
            if (document.querySelector(`script[src="${src}"]`)) {
                resolve();
                return;
            }
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
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
        if (!container) {
            console.warn('⚠️ toastContainer nicht gefunden, zeige Toast in Konsole:', message);
            // Fallback: Alert für wichtige Nachrichten
            if (type === 'error') {
                alert(message);
            }
            return;
        }
        
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        // Erlaube HTML in Toast-Messages (für Links)
        const messageHtml = typeof message === 'string' ? message : message;
        toast.innerHTML = `
            <i class="fas ${icons[type]}"></i>
            <span>${messageHtml}</span>
        `;
        
        container.appendChild(toast);
        
        // Längere Anzeigedauer für Warnungen mit Links
        const displayTime = type === 'warning' && messageHtml.includes('<a') ? 8000 : 4000;
        
        setTimeout(() => {
            toast.style.animation = 'slideIn 0.3s ease-out reverse';
            setTimeout(() => toast.remove(), 300);
        }, displayTime);
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

    // ═══════════════════════════════════════════════════════════════════════════
    // SKILL GAP ANALYSE
    // ═══════════════════════════════════════════════════════════════════════════

    async startSkillGapAnalysis() {
        console.log('🎯 Starte Skill Gap Analyse...');
        
        // Validiere Eingaben
        const jobDescription = document.getElementById('jobDescription')?.value;
        if (!jobDescription || jobDescription.length < 50) {
            this.showToast('Bitte geben Sie eine ausführliche Stellenbeschreibung ein', 'warning');
            return;
        }
        
        // API Key prüfen
        const apiKey = await this.getAPIKey();
        if (!apiKey) {
            console.warn('⚠️ Skill Gap Analyse: Kein API-Key gefunden');
            this.showToast('Kein API-Key gefunden. Skill Gap Analyse erfordert einen API-Key.', 'warning');
            return;
        }
        
        // Speichere API Key für spätere Nutzung
        this.currentApiKey = apiKey;
        
        // Modal öffnen
        const modal = document.getElementById('skillGapModal');
        if (modal) {
            modal.style.display = 'flex';
        }
        
        try {
            // Schritt 1: Anforderungen extrahieren
            this.updateSkillGapStep(1);
            const requirements = await this.extractRequirements(jobDescription, apiKey);
            console.log('📋 Anforderungen extrahiert:', requirements);
            
            // Speichere Anforderungen für spätere Nutzung
            this.currentRequirements = requirements;
            
            // Zeige Anforderungs-Editor an
            this.displayRequirementsEditor(requirements);
            
        } catch (error) {
            console.error('❌ Skill Gap Analyse fehlgeschlagen:', error);
            this.showToast('Fehler bei der Analyse: ' + error.message, 'error');
            this.closeSkillGapModal();
        }
    }
    
    displayRequirementsEditor(requirements) {
        const content = document.getElementById('skillGapStepContent');
        if (!content) return;
        
        content.innerHTML = `
            <div class="requirements-editor">
                <h4><i class="fas fa-list-ol"></i> Anforderungen der Stelle</h4>
                <p class="help-text">Priorisierung: 10 = sehr wichtig, 1 = weniger wichtig. Per Drag & Drop sortierbar.</p>
                
                <div id="requirementsList" class="requirements-list">
                    ${requirements.map((req, index) => `
                        <div class="requirement-item" draggable="true" data-index="${index}">
                            <div class="drag-handle"><i class="fas fa-grip-vertical"></i></div>
                            <div class="requirement-content">
                                <div class="requirement-text">${req.requirement}</div>
                                <div class="requirement-meta">
                                    <span class="category-badge ${req.category}">${this.getCategoryLabel(req.category)}</span>
                                    <span class="keywords">${req.keywords?.join(', ') || ''}</span>
                                </div>
                            </div>
                            <div class="priority-control">
                                <label>Priorität</label>
                                <input type="number" class="priority-input" value="${req.priority || (10 - index)}" min="1" max="10" data-index="${index}">
                                <span class="priority-value">/10</span>
                            </div>
                            <button class="btn-remove" title="Entfernen" onclick="window.coverLetterEditor.removeRequirement(${index})">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    `).join('')}
                </div>
                
                <div class="add-requirement">
                    <input type="text" id="newRequirementInput" placeholder="Neue Anforderung hinzufügen...">
                    <select id="newRequirementCategory">
                        <option value="hard_skill">Hard Skill</option>
                        <option value="soft_skill">Soft Skill</option>
                        <option value="experience">Erfahrung</option>
                        <option value="qualification">Qualifikation</option>
                    </select>
                    <button class="btn-add" onclick="window.coverLetterEditor.addRequirement()">
                        <i class="fas fa-plus"></i> Hinzufügen
                    </button>
                </div>
                
                <div class="requirements-actions">
                    <button class="btn-secondary" onclick="window.coverLetterEditor.closeSkillGapModal()">
                        <i class="fas fa-times"></i> Abbrechen
                    </button>
                    <button class="btn-primary" onclick="window.coverLetterEditor.continueToSkillsAnalysis()">
                        <i class="fas fa-arrow-right"></i> Weiter zur Skill-Analyse
                    </button>
                </div>
            </div>
        `;
        
        // Drag & Drop initialisieren
        this.initRequirementsDragDrop();
    }
    
    getCategoryLabel(category) {
        const labels = {
            'hard_skill': '🛠️ Hard Skill',
            'soft_skill': '💬 Soft Skill',
            'experience': '📋 Erfahrung',
            'qualification': '🎓 Qualifikation'
        };
        return labels[category] || category;
    }
    
    initRequirementsDragDrop() {
        const list = document.getElementById('requirementsList');
        if (!list) return;
        
        let draggedItem = null;
        
        list.querySelectorAll('.requirement-item').forEach(item => {
            item.addEventListener('dragstart', (e) => {
                draggedItem = item;
                item.classList.add('dragging');
            });
            
            item.addEventListener('dragend', () => {
                item.classList.remove('dragging');
                this.updateRequirementsOrder();
            });
            
            item.addEventListener('dragover', (e) => {
                e.preventDefault();
                if (draggedItem === item) return;
                
                const rect = item.getBoundingClientRect();
                const midY = rect.top + rect.height / 2;
                
                if (e.clientY < midY) {
                    item.parentNode.insertBefore(draggedItem, item);
                } else {
                    item.parentNode.insertBefore(draggedItem, item.nextSibling);
                }
            });
        });
        
        // Priority Input Change Handler
        list.querySelectorAll('.priority-input').forEach(input => {
            input.addEventListener('change', (e) => {
                const index = parseInt(e.target.dataset.index);
                const value = Math.max(1, Math.min(10, parseInt(e.target.value) || 5));
                e.target.value = value;
                if (this.currentRequirements[index]) {
                    this.currentRequirements[index].priority = value;
                }
            });
        });
    }
    
    updateRequirementsOrder() {
        const list = document.getElementById('requirementsList');
        if (!list) return;
        
        const newOrder = [];
        list.querySelectorAll('.requirement-item').forEach((item, newIndex) => {
            const oldIndex = parseInt(item.dataset.index);
            if (this.currentRequirements[oldIndex]) {
                const req = { ...this.currentRequirements[oldIndex] };
                req.priority = parseInt(item.querySelector('.priority-input').value) || (10 - newIndex);
                newOrder.push(req);
            }
            item.dataset.index = newIndex;
            item.querySelector('.priority-input').dataset.index = newIndex;
        });
        
        this.currentRequirements = newOrder;
        console.log('📋 Anforderungen neu sortiert:', this.currentRequirements);
    }
    
    removeRequirement(index) {
        if (!this.currentRequirements) return;
        this.currentRequirements.splice(index, 1);
        this.displayRequirementsEditor(this.currentRequirements);
    }
    
    addRequirement() {
        const input = document.getElementById('newRequirementInput');
        const categorySelect = document.getElementById('newRequirementCategory');
        
        if (!input?.value.trim()) return;
        
        const newReq = {
            requirement: input.value.trim(),
            category: categorySelect?.value || 'hard_skill',
            priority: 5,
            keywords: input.value.trim().toLowerCase().split(/\s+/).filter(w => w.length > 3)
        };
        
        if (!this.currentRequirements) this.currentRequirements = [];
        this.currentRequirements.push(newReq);
        
        input.value = '';
        this.displayRequirementsEditor(this.currentRequirements);
    }
    
    async continueToSkillsAnalysis() {
        if (!this.currentRequirements || this.currentRequirements.length === 0) {
            this.showToast('Mindestens eine Anforderung erforderlich', 'warning');
            return;
        }
        
        // Sortiere nach Priorität (höchste zuerst)
        this.currentRequirements.sort((a, b) => (b.priority || 0) - (a.priority || 0));
        
        try {
            // Schritt 2: User-Skills sammeln
            this.updateSkillGapStep(2);
            const userSkills = await this.collectAllUserSkills();
            console.log('👤 User-Skills gesammelt:', userSkills);
            
            // Speichere für spätere Nutzung
            this.currentUserSkills = userSkills;
            
            // Zeige Skills-Editor an
            this.displaySkillsEditor(userSkills);
            
        } catch (error) {
            console.error('❌ Skills-Sammlung fehlgeschlagen:', error);
            this.showToast('Fehler: ' + error.message, 'error');
        }
    }

    updateSkillGapStep(step) {
        const steps = document.querySelectorAll('.skill-gap-steps .step');
        steps.forEach((s, i) => {
            s.classList.remove('active', 'completed');
            if (i + 1 < step) {
                s.classList.add('completed');
            } else if (i + 1 === step) {
                s.classList.add('active');
            }
        });
        
        const content = document.getElementById('skillGapStepContent');
        if (content) {
            const stepTexts = [
                'Analysiere Stellenbeschreibung...',
                'Sammle deine Skills aus allen Quellen...',
                'Führe Matching durch...',
                'Generiere personalisiertes Anschreiben...'
            ];
            content.innerHTML = `
                <div class="loading-state">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>${stepTexts[step - 1]}</p>
                </div>
            `;
        }
    }

    async extractRequirements(jobDescription, apiKey) {
        const prompt = `Analysiere die folgende Stellenbeschreibung und extrahiere die TOP 10 wichtigsten Anforderungen.

STELLENBESCHREIBUNG:
"""
${jobDescription}
"""

AUFGABE:
1. Identifiziere die wichtigsten Anforderungen (Hard Skills, Soft Skills, Erfahrung, Qualifikationen)
2. Bewerte jede Anforderung auf einer Skala von 1-10 (10 = ABSOLUT WICHTIG für die Stelle, 1 = Nice-to-have)
3. Kategorisiere jede Anforderung
4. Die Reihenfolge soll der Erwähnung in der Stellenanzeige entsprechen

Antworte ausschließlich mit einem JSON-Array in diesem Format:
[
  {
    "priority": 10,
    "requirement": "Kurze, präzise Beschreibung der Anforderung",
    "category": "hard_skill|soft_skill|experience|qualification",
    "keywords": ["keyword1", "keyword2", "keyword3"]
  }
]

WICHTIG: Maximal 10 Einträge. Priorität 10 = Must-Have, 7-9 = Sehr wichtig, 4-6 = Wichtig, 1-3 = Nice-to-have.`;

        const response = await this.callOpenAI([
            { role: 'system', content: 'Du bist ein Experte für Stellenanalysen und HR. Antworte nur mit validem JSON ohne Erklärungen.' },
            { role: 'user', content: prompt }
        ], apiKey, { maxTokens: 2000, reasoningEffort: 'low' });

        try {
            // Clean JSON
            const cleaned = response.replace(/```json\n?|\n?```/g, '').trim();
            const requirements = JSON.parse(cleaned);
            
            // Stelle sicher, dass jede Anforderung eine Priorität hat
            return requirements.map((req, index) => ({
                ...req,
                priority: req.priority || (10 - index),
                keywords: req.keywords || []
            }));
        } catch (e) {
            console.error('JSON Parse Error:', e, response);
            throw new Error('Konnte Anforderungen nicht extrahieren');
        }
    }

    async collectAllUserSkills() {
        console.log('🔍 Sammle alle User-Skills...');
        
        const skills = {
            technical: [],
            soft: [],
            experience: [],
            education: [],
            languages: [],
            certifications: [],
            coaching: {},
            fachlicheEntwicklung: null,
            sources: [] // Dokumentiert Quellen
        };

        // Helper: Skills aus einem Lebenslauf extrahieren
        const extractSkillsFromResume = (resume, sourceName) => {
            if (!resume) return;
            
            // Skills direkt
            if (resume.skills) {
                if (Array.isArray(resume.skills)) {
                    resume.skills.forEach(s => {
                        if (typeof s === 'string') skills.technical.push(s);
                        else if (s && s.name) skills.technical.push(s.name);
                    });
                } else if (typeof resume.skills === 'object') {
                    if (resume.skills.technical) {
                        resume.skills.technical.forEach(s => {
                            if (typeof s === 'string') skills.technical.push(s);
                            else if (s && s.name) skills.technical.push(s.name);
                        });
                    }
                    if (resume.skills.soft) {
                        resume.skills.soft.forEach(s => {
                            if (typeof s === 'string') skills.soft.push(s);
                            else if (s && s.name) skills.soft.push(s.name);
                        });
                    }
                }
            }
            
            // Alternative Skill-Keys
            ['technicalSkills', 'technical_skills', 'hardSkills', 'hard_skills'].forEach(key => {
                if (resume[key] && Array.isArray(resume[key])) {
                    resume[key].forEach(s => {
                        if (typeof s === 'string') skills.technical.push(s);
                        else if (s && (s.name || s.skill)) skills.technical.push(s.name || s.skill);
                    });
                }
            });
            
            ['softSkills', 'soft_skills'].forEach(key => {
                if (resume[key] && Array.isArray(resume[key])) {
                    resume[key].forEach(s => {
                        if (typeof s === 'string') skills.soft.push(s);
                        else if (s && (s.name || s.skill)) skills.soft.push(s.name || s.skill);
                    });
                }
            });
            
            // Experience - extrahiere auch Skills aus Beschreibungen
            ['experience', 'workExperience', 'work_experience', 'berufserfahrung'].forEach(key => {
                if (resume[key] && Array.isArray(resume[key])) {
                    resume[key].forEach(exp => {
                        skills.experience.push(exp);
                        // Extrahiere Skills aus Beschreibung wenn vorhanden
                        if (exp.description || exp.beschreibung || exp.tasks) {
                            const desc = exp.description || exp.beschreibung || (exp.tasks?.join(' ') || '');
                            // Extrahiere typische Skill-Begriffe
                            const skillPatterns = [
                                /(?:Erfahrung mit|Kenntnisse in|Arbeit mit|Einsatz von)\s+([A-Za-z0-9\-\+#\.]+)/gi,
                                /(?:SAP|Microsoft|AWS|Azure|Google|Python|Java|SQL|Excel|PowerPoint|Word|JavaScript|TypeScript|React|Angular|Vue|Node|Django|Flask)/gi
                            ];
                            skillPatterns.forEach(pattern => {
                                const matches = desc.match(pattern);
                                if (matches) {
                                    matches.forEach(m => {
                                        const cleaned = m.replace(/Erfahrung mit|Kenntnisse in|Arbeit mit|Einsatz von/gi, '').trim();
                                        if (cleaned.length > 1) skills.technical.push(cleaned);
                                    });
                                }
                            });
                        }
                    });
                }
            });
            
            // Education
            ['education', 'ausbildung', 'bildung'].forEach(key => {
                if (resume[key] && Array.isArray(resume[key])) {
                    skills.education.push(...resume[key]);
                }
            });
            
            // Languages - normalisiere zu einheitlichem Format {name, level}
            ['languages', 'sprachen', 'sprachkenntnisse'].forEach(key => {
                if (resume[key] && Array.isArray(resume[key])) {
                    resume[key].forEach(l => {
                        if (typeof l === 'string') {
                            // Parse strings wie "Deutsch (Muttersprache)" oder "English - C1"
                            const match = l.match(/^([^(\-:]+)[\s]*[\(\-:]\s*(.+?)[\)]?$/);
                            if (match) {
                                skills.languages.push({ name: match[1].trim(), level: match[2].trim() });
                            } else {
                                skills.languages.push({ name: l.trim(), level: '' });
                            }
                        } else if (l && (l.name || l.language || l.sprache)) {
                            skills.languages.push({ 
                                name: (l.name || l.language || l.sprache || '').trim(), 
                                level: (l.level || l.niveau || l.proficiency || '').trim() 
                            });
                        }
                    });
                }
            });
            
            // Certifications
            ['certifications', 'certificates', 'zertifikate', 'weiterbildungen'].forEach(key => {
                if (resume[key] && Array.isArray(resume[key])) {
                    skills.certifications.push(...resume[key]);
                }
            });
            
            skills.sources.push(sourceName);
        };

        // 1. Aus allen Lebensläufen (verschiedene localStorage Keys)
        const resumeKeys = [
            'user_resumes', 'resumes', 'cv_data', 'saved_resumes', 
            'resume_data', 'lebenslauf_data', 'parsed_resume',
            'ocr_resume_data', 'extracted_resume'
        ];
        
        for (const key of resumeKeys) {
            try {
                const data = localStorage.getItem(key);
                if (data) {
                    const parsed = JSON.parse(data);
                    const resumeArray = Array.isArray(parsed) ? parsed : [parsed];
                    resumeArray.forEach((resume, idx) => {
                        extractSkillsFromResume(resume, `localStorage: ${key}[${idx}]`);
                    });
                }
            } catch (e) {
                console.warn(`Fehler beim Laden von ${key}:`, e);
            }
        }
        
        // 1b. Aus Cloud-Daten (falls verfügbar)
        try {
            if (window.cloudDataService) {
                const cloudResumes = await window.cloudDataService.getResumes?.();
                if (cloudResumes && Array.isArray(cloudResumes)) {
                    cloudResumes.forEach((resume, idx) => {
                        extractSkillsFromResume(resume, `cloud: resume[${idx}]`);
                    });
                }
            }
        } catch (e) {
            console.warn('Cloud-Lebensläufe konnten nicht geladen werden:', e);
        }

        // 2. Aus Profildaten (this.profileData)
        if (this.profileData) {
            console.log('📝 Profildaten gefunden:', Object.keys(this.profileData));
            
            if (this.profileData.skills) {
                if (Array.isArray(this.profileData.skills)) {
                    skills.technical.push(...this.profileData.skills);
                } else if (typeof this.profileData.skills === 'object') {
                    if (this.profileData.skills.technical) skills.technical.push(...this.profileData.skills.technical);
                    if (this.profileData.skills.soft) skills.soft.push(...this.profileData.skills.soft);
                }
            }
            if (this.profileData.experience) skills.experience.push(...this.profileData.experience);
            if (this.profileData.education) skills.education.push(...this.profileData.education);
            // Normalisiere Sprachen aus Profil
            if (this.profileData.languages && Array.isArray(this.profileData.languages)) {
                this.profileData.languages.forEach(l => {
                    if (typeof l === 'string') {
                        const match = l.match(/^([^(\-:]+)[\s]*[\(\-:]\s*(.+?)[\)]?$/);
                        if (match) {
                            skills.languages.push({ name: match[1].trim(), level: match[2].trim() });
                        } else {
                            skills.languages.push({ name: l.trim(), level: '' });
                        }
                    } else if (l && (l.name || l.language || l.sprache)) {
                        skills.languages.push({ 
                            name: (l.name || l.language || l.sprache || '').trim(), 
                            level: (l.level || l.niveau || l.proficiency || '').trim() 
                        });
                    }
                });
            }
            
            skills.sources.push('profileData');
        }
        
        // 3. Aus globalem Bewerberprofil
        try {
            const profileKeys = ['applicant_profile', 'user_profile', 'bewerber_profil'];
            for (const key of profileKeys) {
                const profileData = localStorage.getItem(key);
                if (profileData) {
                    const profile = JSON.parse(profileData);
                    if (profile.skills) {
                        if (Array.isArray(profile.skills)) {
                            skills.technical.push(...profile.skills);
                        } else {
                            if (profile.skills.technical) skills.technical.push(...profile.skills.technical);
                            if (profile.skills.soft) skills.soft.push(...profile.skills.soft);
                        }
                    }
                    if (profile.experience) skills.experience.push(...profile.experience);
                    skills.sources.push(`localStorage: ${key}`);
                }
            }
        } catch (e) {}

        // 4. Aus Coaching
        try {
            const coachingKeys = ['coaching_workflow_data', 'coaching_results', 'ai_coach_data'];
            for (const key of coachingKeys) {
                const data = localStorage.getItem(key);
                if (data) {
                    const coaching = JSON.parse(data);
                    if (coaching.naturalTalents) {
                        skills.coaching.naturalTalents = coaching.naturalTalents;
                        if (Array.isArray(coaching.naturalTalents)) {
                            skills.soft.push(...coaching.naturalTalents);
                        }
                    }
                    if (coaching.acquiredSkills) {
                        skills.coaching.acquiredSkills = coaching.acquiredSkills;
                        if (Array.isArray(coaching.acquiredSkills)) {
                            skills.technical.push(...coaching.acquiredSkills);
                        }
                    }
                    if (coaching.uniqueStrengths) {
                        skills.coaching.uniqueStrengths = coaching.uniqueStrengths;
                    }
                    skills.sources.push(`localStorage: ${key}`);
                }
            }
        } catch (e) {}

        // 5. Aus fachlicher Entwicklung
        try {
            for (let i = 1; i <= 7; i++) {
                const stepData = localStorage.getItem(`fachlicheEntwicklungStep${i}`);
                if (stepData) {
                    if (!skills.fachlicheEntwicklung) skills.fachlicheEntwicklung = {};
                    const parsed = JSON.parse(stepData);
                    skills.fachlicheEntwicklung[`step${i}`] = parsed;
                    
                    // Extrahiere relevante Skills aus den Steps
                    if (parsed.selectedSkills) skills.technical.push(...parsed.selectedSkills);
                    if (parsed.learningGoals) skills.technical.push(...parsed.learningGoals);
                }
            }
            if (skills.fachlicheEntwicklung) {
                skills.sources.push('fachlicheEntwicklung');
            }
        } catch (e) {}

        // 6. Aus Persönlichkeitsentwicklung
        try {
            const persData = localStorage.getItem('persoenlichkeitsentwicklung_progress');
            if (persData) {
                const persoenlichkeit = JSON.parse(persData);
                if (persoenlichkeit.completedMethods) {
                    skills.persoenlichkeit = persoenlichkeit;
                    // Extrahiere Soft Skills aus abgeschlossenen Methoden
                    const methodSkills = {
                        'emotional-intelligence': 'Emotionale Intelligenz',
                        'communication': 'Kommunikation',
                        'leadership': 'Führung',
                        'time-management': 'Zeitmanagement',
                        'stress-management': 'Stressmanagement',
                        'conflict-resolution': 'Konfliktlösung'
                    };
                    Object.keys(persoenlichkeit.completedMethods || {}).forEach(method => {
                        if (methodSkills[method]) {
                            skills.soft.push(methodSkills[method]);
                        }
                    });
                }
                skills.sources.push('persoenlichkeitsentwicklung');
            }
        } catch (e) {}
        
        // 7. Aus Training/Fitness (falls vorhanden und relevant)
        try {
            const trainingData = localStorage.getItem('training_achievements');
            if (trainingData) {
                const achievements = JSON.parse(trainingData);
                if (achievements.length > 0) {
                    skills.soft.push('Disziplin', 'Durchhaltevermögen');
                }
            }
        } catch (e) {}

        // Deduplizieren und bereinigen
        skills.technical = [...new Set(skills.technical.filter(s => s && typeof s === 'string' && s.length > 1))];
        skills.soft = [...new Set(skills.soft.filter(s => s && typeof s === 'string' && s.length > 1))];
        
        // Sprachen deduplizieren basierend auf Name (case-insensitive)
        const langMap = new Map();
        skills.languages.forEach(l => {
            if (l && l.name) {
                const key = l.name.toLowerCase().trim();
                // Bevorzuge Einträge mit Level
                if (!langMap.has(key) || (l.level && !langMap.get(key).level)) {
                    langMap.set(key, l);
                }
            }
        });
        skills.languages = Array.from(langMap.values());
        
        skills.certifications = [...new Set(skills.certifications.filter(Boolean))];
        
        // Entferne Duplikate aus Experience basierend auf Position + Company
        const expMap = new Map();
        skills.experience.forEach(exp => {
            if (exp) {
                const key = `${exp.position || exp.title}@${exp.company}`;
                if (!expMap.has(key)) {
                    expMap.set(key, exp);
                }
            }
        });
        skills.experience = Array.from(expMap.values());
        
        console.log('✅ Skills gesammelt:', {
            technical: skills.technical.length,
            soft: skills.soft.length,
            experience: skills.experience.length,
            sources: skills.sources
        });

        return skills;
    }
    
    displaySkillsEditor(userSkills) {
        const content = document.getElementById('skillGapStepContent');
        if (!content) return;
        
        content.innerHTML = `
            <div class="skills-editor">
                <h4><i class="fas fa-user-cog"></i> Deine gefundenen Skills</h4>
                <p class="help-text">Überprüfe und ergänze deine Skills. Diese werden für das Matching verwendet und können im Profil gespeichert werden.</p>
                
                <div class="skills-sources">
                    <small><i class="fas fa-info-circle"></i> Quellen: ${userSkills.sources?.join(', ') || 'Keine Quellen'}</small>
                </div>
                
                <div class="skills-section">
                    <h5><i class="fas fa-code"></i> Technische Skills (${userSkills.technical.length})</h5>
                    <div class="skills-tags" id="technicalSkillsTags">
                        ${userSkills.technical.map((skill, i) => `
                            <span class="skill-tag technical" data-skill="${skill}">
                                ${skill}
                                <button class="remove-skill" onclick="window.coverLetterEditor.removeSkill('technical', ${i})">&times;</button>
                            </span>
                        `).join('') || '<span class="no-skills">Keine gefunden</span>'}
                    </div>
                    <div class="add-skill-row">
                        <input type="text" id="newTechnicalSkill" placeholder="Neuen Skill hinzufügen...">
                        <button class="btn-add-small" onclick="window.coverLetterEditor.addSkill('technical')">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                </div>
                
                <div class="skills-section">
                    <h5><i class="fas fa-comments"></i> Soft Skills (${userSkills.soft.length})</h5>
                    <div class="skills-tags" id="softSkillsTags">
                        ${userSkills.soft.map((skill, i) => `
                            <span class="skill-tag soft" data-skill="${skill}">
                                ${skill}
                                <button class="remove-skill" onclick="window.coverLetterEditor.removeSkill('soft', ${i})">&times;</button>
                            </span>
                        `).join('') || '<span class="no-skills">Keine gefunden</span>'}
                    </div>
                    <div class="add-skill-row">
                        <input type="text" id="newSoftSkill" placeholder="Neuen Soft Skill hinzufügen...">
                        <button class="btn-add-small" onclick="window.coverLetterEditor.addSkill('soft')">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                </div>
                
                <div class="skills-section">
                    <h5><i class="fas fa-briefcase"></i> Berufserfahrung (${userSkills.experience.length})</h5>
                    <div class="experience-list">
                        ${userSkills.experience.map(exp => `
                            <div class="experience-item">
                                <strong>${exp.position || exp.title || 'Position'}</strong> bei ${exp.company || 'Unternehmen'}
                                <small>${exp.startDate || ''} - ${exp.endDate || 'heute'}</small>
                            </div>
                        `).join('') || '<span class="no-skills">Keine gefunden</span>'}
                    </div>
                </div>
                
                ${userSkills.languages.length > 0 ? `
                <div class="skills-section">
                    <h5><i class="fas fa-globe"></i> Sprachen (${userSkills.languages.length})</h5>
                    <div class="skills-tags">
                        ${userSkills.languages.map(lang => {
                            const name = typeof lang === 'object' ? (lang.name || lang.language || '') : lang;
                            const level = typeof lang === 'object' ? (lang.level || '') : '';
                            return `<span class="skill-tag language">${name}${level ? ` (${level})` : ''}</span>`;
                        }).join('')}
                    </div>
                </div>
                ` : ''}
                
                <div class="skills-actions">
                    <label class="save-profile-checkbox">
                        <input type="checkbox" id="saveSkillsToProfile" checked>
                        <span>Skills im Bewerberprofil speichern</span>
                    </label>
                </div>
                
                <div class="requirements-actions">
                    <button class="btn-secondary" onclick="window.coverLetterEditor.displayRequirementsEditor(window.coverLetterEditor.currentRequirements)">
                        <i class="fas fa-arrow-left"></i> Zurück
                    </button>
                    <button class="btn-primary" onclick="window.coverLetterEditor.continueToMatching()">
                        <i class="fas fa-magic"></i> Matching durchführen
                    </button>
                </div>
            </div>
        `;
    }
    
    removeSkill(type, index) {
        if (!this.currentUserSkills || !this.currentUserSkills[type]) return;
        this.currentUserSkills[type].splice(index, 1);
        this.displaySkillsEditor(this.currentUserSkills);
    }
    
    addSkill(type) {
        const inputId = type === 'technical' ? 'newTechnicalSkill' : 'newSoftSkill';
        const input = document.getElementById(inputId);
        if (!input?.value.trim()) return;
        
        if (!this.currentUserSkills) this.currentUserSkills = { technical: [], soft: [], experience: [], education: [], languages: [], sources: [] };
        if (!this.currentUserSkills[type]) this.currentUserSkills[type] = [];
        
        // Füge Skill hinzu wenn nicht schon vorhanden
        const newSkill = input.value.trim();
        if (!this.currentUserSkills[type].includes(newSkill)) {
            this.currentUserSkills[type].push(newSkill);
        }
        
        input.value = '';
        this.displaySkillsEditor(this.currentUserSkills);
    }
    
    async continueToMatching() {
        // Skills im Profil speichern wenn gewünscht
        const saveCheckbox = document.getElementById('saveSkillsToProfile');
        if (saveCheckbox?.checked && this.currentUserSkills) {
            this.saveSkillsToProfile(this.currentUserSkills);
        }
        
        try {
            // Schritt 3: Matching durchführen
            this.updateSkillGapStep(3);
            const matchResults = await this.matchSkillsToRequirements(
                this.currentRequirements, 
                this.currentUserSkills, 
                this.currentApiKey
            );
            console.log('⚖️ Matching-Ergebnisse:', matchResults);
            
            // Ergebnisse anzeigen
            this.displaySkillGapResults(matchResults);
            
            // Generate Button aktivieren
            const generateBtn = document.getElementById('skillGapGenerateBtn');
            if (generateBtn) {
                generateBtn.disabled = false;
                generateBtn.onclick = () => this.generateSkillGapCoverLetter(matchResults, this.currentApiKey);
            }
            
        } catch (error) {
            console.error('❌ Matching fehlgeschlagen:', error);
            this.showToast('Fehler beim Matching: ' + error.message, 'error');
        }
    }
    
    saveSkillsToProfile(skills) {
        try {
            // Lade bestehendes Profil
            let profile = {};
            try {
                profile = JSON.parse(localStorage.getItem('applicant_profile') || '{}');
            } catch (e) {}
            
            // Merge Skills
            profile.skills = profile.skills || { technical: [], soft: [] };
            
            if (skills.technical) {
                profile.skills.technical = [...new Set([
                    ...(profile.skills.technical || []),
                    ...skills.technical
                ])];
            }
            
            if (skills.soft) {
                profile.skills.soft = [...new Set([
                    ...(profile.skills.soft || []),
                    ...skills.soft
                ])];
            }
            
            profile.lastUpdated = new Date().toISOString();
            
            // Speichern
            localStorage.setItem('applicant_profile', JSON.stringify(profile));
            console.log('✅ Skills im Bewerberprofil gespeichert:', profile.skills);
            this.showToast('Skills im Profil gespeichert', 'success');
            
        } catch (error) {
            console.error('Fehler beim Speichern der Skills:', error);
        }
    }

    async matchSkillsToRequirements(requirements, userSkills, apiKey) {
        const skillSummary = `
TECHNISCHE SKILLS: ${userSkills.technical.join(', ') || 'Keine angegeben'}

SOFT SKILLS: ${userSkills.soft.join(', ') || 'Keine angegeben'}

BERUFSERFAHRUNG:
${userSkills.experience.map(exp => 
    `- ${exp.position || exp.title} bei ${exp.company} (${exp.startDate || ''} - ${exp.endDate || 'heute'}): ${exp.description || exp.responsibilities?.join(', ') || ''}`
).join('\n') || 'Keine angegeben'}

AUSBILDUNG:
${userSkills.education.map(edu => 
    `- ${edu.degree} in ${edu.field || edu.fieldOfStudy} bei ${edu.institution} (${edu.graduationDate || edu.endDate || ''})`
).join('\n') || 'Keine angegeben'}

COACHING-ERGEBNISSE:
- Natürliche Talente: ${userSkills.coaching?.naturalTalents || 'Nicht definiert'}
- Erworbene Fähigkeiten: ${userSkills.coaching?.acquiredSkills || 'Nicht definiert'}
- Einzigartige Stärken: ${userSkills.coaching?.uniqueStrengths || 'Nicht definiert'}
`;

        const prompt = `Führe ein detailliertes Skill-Matching durch.

ANFORDERUNGEN DER STELLE:
${requirements.map(r => `${r.rank}. ${r.requirement} (${r.category})`).join('\n')}

PROFIL DES BEWERBERS:
${skillSummary}

AUFGABE:
1. Matche jede Anforderung mit den Skills des Bewerbers
2. Finde konkrete Beispiele aus der Erfahrung, die zur Anforderung passen
3. Bewerte die Übereinstimmung (0-100%)
4. Formuliere einen spezifischen Satz für das Anschreiben

Antworte als JSON-Array:
[
  {
    "requirement": "Anforderung",
    "matchedSkills": ["skill1", "skill2"],
    "experience": "Konkretes Beispiel aus der Erfahrung oder null",
    "matchScore": 85,
    "coverLetterSentence": "Ein spezifischer, überzeugender Satz für das Anschreiben, der die Erfahrung mit der Anforderung verbindet."
  }
]`;

        const response = await this.callOpenAI([
            { role: 'system', content: 'Du bist ein Experte für Bewerbungsmatching. Antworte nur mit validem JSON.' },
            { role: 'user', content: prompt }
        ], apiKey, { maxTokens: 4000 });

        try {
            const cleaned = response.replace(/```json\n?|\n?```/g, '').trim();
            return JSON.parse(cleaned);
        } catch (e) {
            console.error('JSON Parse Error:', e);
            throw new Error('Konnte Matching nicht durchführen');
        }
    }

    displaySkillGapResults(results) {
        const resultsDiv = document.getElementById('skillGapResults');
        const tableDiv = document.getElementById('skillGapTable');
        
        if (!resultsDiv || !tableDiv) return;
        
        let html = `
            <div class="skill-gap-row header">
                <div>Anforderung</div>
                <div>Deine Skills</div>
                <div>Match</div>
            </div>
        `;
        
        results.forEach(result => {
            const score = result.matchScore;
            const badgeClass = score >= 70 ? 'high' : score >= 40 ? 'medium' : 'low';
            
            html += `
                <div class="skill-gap-row">
                    <div class="requirement">${result.requirement}</div>
                    <div class="user-skill">${result.matchedSkills?.join(', ') || result.experience || 'Keine direkten Skills'}</div>
                    <div class="match-score">
                        <span class="match-badge ${badgeClass}">${score}%</span>
                    </div>
                </div>
            `;
        });
        
        tableDiv.innerHTML = html;
        resultsDiv.style.display = 'block';
        
        // Step 4 markieren als aktiv
        this.updateSkillGapStep(4);
        
        // Loading entfernen
        const content = document.getElementById('skillGapStepContent');
        if (content) {
            content.innerHTML = '<p style="text-align: center; color: var(--cl-success);"><i class="fas fa-check-circle"></i> Analyse abgeschlossen!</p>';
        }
    }

    async generateSkillGapCoverLetter(matchResults, apiKey) {
        const jobData = this.collectJobData();
        const country = document.getElementById('countrySelect')?.value || 'DE';
        
        // Filtere nur gute Matches (>40%)
        const goodMatches = matchResults.filter(m => m.matchScore >= 40);
        
        const countryBestPractices = {
            DE: 'Deutschland: Formelle Anrede, "Sie"-Form, strukturiert, Bezug auf Unternehmenskultur',
            CH: 'Schweiz: Höflich-distanziert, "Sie"-Form, Präzision betonen, Bezug auf Qualität',
            AT: 'Österreich: Freundlich-formell, "Sie"-Form, traditioneller Aufbau',
            US: 'USA: Direkter, selbstbewusster Ton, "I"-Aussagen, messbare Erfolge'
        };

        const prompt = `Erstelle ein überzeugendes Anschreiben basierend auf der Skill-Gap-Analyse.

POSITION: ${jobData.jobTitle}
UNTERNEHMEN: ${jobData.companyName}
LAND: ${country} - ${countryBestPractices[country]}
ANSPRECHPERSON: ${jobData.contactPerson || 'Nicht bekannt'}

SKILL-MATCHES (sortiert nach Übereinstimmung):
${goodMatches.map(m => `
- Anforderung: ${m.requirement}
- Match: ${m.matchScore}%
- Vorgeschlagener Satz: "${m.coverLetterSentence}"
`).join('\n')}

AUFGABE:
1. Erstelle eine passende Einleitung (ohne "hiermit bewerbe ich mich")
2. Integriere JEDEN der vorgeschlagenen Sätze für die Skill-Matches in einen fließenden Text
3. Die Sätze sollen natürlich ineinander übergehen
4. Füge konkrete Zahlen/Ergebnisse hinzu wo möglich
5. Erstelle einen motivierenden Schluss
6. Beachte die Landesbestpractices für ${country}

FORMAT:
- ${this.options.length === 'short' ? 'ca. 150 Wörter' : this.options.length === 'medium' ? 'ca. 250 Wörter' : 'ca. 350 Wörter'}
- Tonalität: ${this.options.tone}
- Absätze mit Leerzeile trennen

Gib NUR den Anschreiben-Text zurück, KEINE Meta-Informationen.`;

        try {
            this.closeSkillGapModal();
            this.showLoading();
            
            const content = await this.callOpenAI([
                { role: 'system', content: 'Du bist ein professioneller Bewerbungsberater. Erstelle authentische, spezifische Anschreiben.' },
                { role: 'user', content: prompt }
            ], apiKey, { maxTokens: 2000 });
            
            this.displayGeneratedLetter(content, jobData);
            this.showToast('Skill-Gap-Anschreiben erfolgreich generiert!', 'success');
            
        } catch (error) {
            console.error('Fehler beim Generieren:', error);
            this.showToast('Fehler beim Generieren des Anschreibens', 'error');
        } finally {
            this.hideLoading();
        }
    }

    closeSkillGapModal() {
        const modal = document.getElementById('skillGapModal');
        if (modal) {
            modal.style.display = 'none';
        }
        // Reset
        const resultsDiv = document.getElementById('skillGapResults');
        if (resultsDiv) resultsDiv.style.display = 'none';
        
        const generateBtn = document.getElementById('skillGapGenerateBtn');
        if (generateBtn) generateBtn.disabled = true;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // SIGNATURE EXTENDED
    // ═══════════════════════════════════════════════════════════════════════════

    setupSignatureExtended() {
        this.setupSignatureTabs();
        this.setupSignatureCanvas();
        this.setupSignatureGenerator();
        this.loadSavedSignature();
    }

    setupSignatureTabs() {
        const tabs = document.querySelectorAll('.signature-section .signature-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Remove active from all tabs
                tabs.forEach(t => {
                    t.classList.remove('active');
                    t.style.background = 'transparent';
                    t.style.color = 'var(--cl-text-muted)';
                });
                
                // Set active
                tab.classList.add('active');
                tab.style.background = 'var(--cl-primary)';
                tab.style.color = 'white';
                
                // Show corresponding content
                const tabName = tab.dataset.tab;
                document.querySelectorAll('.signature-tab-content').forEach(content => {
                    content.style.display = 'none';
                });
                
                const content = document.getElementById(`signatureTab${tabName.charAt(0).toUpperCase() + tabName.slice(1)}`);
                if (content) content.style.display = 'block';
            });
        });
    }

    setupSignatureCanvas() {
        const canvas = document.getElementById('signatureCanvas');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        let isDrawing = false;
        let lastX = 0;
        let lastY = 0;
        
        // Canvas Setup
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        const getCoords = (e) => {
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            
            if (e.touches) {
                return {
                    x: (e.touches[0].clientX - rect.left) * scaleX,
                    y: (e.touches[0].clientY - rect.top) * scaleY
                };
            }
            return {
                x: (e.clientX - rect.left) * scaleX,
                y: (e.clientY - rect.top) * scaleY
            };
        };
        
        const startDrawing = (e) => {
            e.preventDefault();
            isDrawing = true;
            const coords = getCoords(e);
            lastX = coords.x;
            lastY = coords.y;
        };
        
        const draw = (e) => {
            if (!isDrawing) return;
            e.preventDefault();
            
            const coords = getCoords(e);
            ctx.beginPath();
            ctx.moveTo(lastX, lastY);
            ctx.lineTo(coords.x, coords.y);
            ctx.stroke();
            
            lastX = coords.x;
            lastY = coords.y;
        };
        
        const stopDrawing = () => {
            isDrawing = false;
        };
        
        // Mouse events
        canvas.addEventListener('mousedown', startDrawing);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('mouseup', stopDrawing);
        canvas.addEventListener('mouseout', stopDrawing);
        
        // Touch events
        canvas.addEventListener('touchstart', startDrawing);
        canvas.addEventListener('touchmove', draw);
        canvas.addEventListener('touchend', stopDrawing);
        
        // Clear button
        const clearBtn = document.getElementById('clearSignatureCanvas');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            });
        }
        
        // Use drawn signature
        const useBtn = document.getElementById('useDrawnSignature');
        if (useBtn) {
            useBtn.addEventListener('click', () => {
                const dataUrl = canvas.toDataURL('image/png');
                this.setSignatureImage(dataUrl);
                this.showToast('Gezeichnete Unterschrift übernommen', 'success');
            });
        }
    }

    setupSignatureGenerator() {
        const nameInput = document.getElementById('signatureNameInput');
        const styleSelect = document.getElementById('signatureStyleSelect');
        const preview = document.getElementById('signatureGeneratePreview');
        const useBtn = document.getElementById('useGeneratedSignature');
        
        if (!nameInput || !styleSelect || !preview) return;
        
        // Pre-fill with user name
        if (this.profileData?.firstName) {
            nameInput.value = `${this.profileData.firstName} ${this.profileData.lastName || ''}`.trim();
        }
        
        const updatePreview = () => {
            const name = nameInput.value || 'Ihr Name';
            const font = styleSelect.value;
            preview.innerHTML = `<span style="font-family: ${font}; font-size: 28px; color: #1e293b;">${name}</span>`;
        };
        
        nameInput.addEventListener('input', updatePreview);
        styleSelect.addEventListener('change', updatePreview);
        
        // Initial preview
        updatePreview();
        
        // Use generated signature
        if (useBtn) {
            useBtn.addEventListener('click', async () => {
                const name = nameInput.value;
                const font = styleSelect.value;
                
                // Create canvas to convert to image
                const canvas = document.createElement('canvas');
                canvas.width = 300;
                canvas.height = 80;
                const ctx = canvas.getContext('2d');
                
                // Load font first
                const fontFamily = font.replace(/'/g, '').split(',')[0].trim();
                try {
                    await document.fonts.load(`28px ${fontFamily}`);
                } catch (e) {}
                
                ctx.font = `28px ${font}`;
                ctx.fillStyle = '#1e293b';
                ctx.textBaseline = 'middle';
                ctx.fillText(name, 10, 40);
                
                const dataUrl = canvas.toDataURL('image/png');
                this.setSignatureImage(dataUrl);
                this.showToast('Generierte Unterschrift übernommen', 'success');
            });
        }
    }

    setSignatureImage(dataUrl) {
        this.design.signatureImage = dataUrl;
        
        // Update preview in design panel
        const previewContainer = document.getElementById('signaturePreview');
        if (previewContainer) {
            previewContainer.innerHTML = `<img src="${dataUrl}" alt="Unterschrift" style="max-height: 60px;">`;
        }
        
        // Update signature in letter
        this.applyDesign();
        
        // Check if should save to profile
        const saveToProfile = document.getElementById('saveSignatureToProfile');
        if (saveToProfile?.checked) {
            this.saveSignatureToProfile(dataUrl);
        }
    }

    async saveSignatureToProfile(dataUrl) {
        try {
            // Save to localStorage
            localStorage.setItem('user_signature', dataUrl);
            
            // Try to save to cloud
            if (window.cloudDataService) {
                const profile = await window.cloudDataService.getProfile(false) || {};
                profile.signature = dataUrl;
                await window.cloudDataService.saveProfile(profile);
                console.log('✅ Signatur im Cloud-Profil gespeichert');
            }
            
            this.showToast('Signatur im Profil gespeichert', 'success');
        } catch (error) {
            console.warn('Signatur konnte nicht im Profil gespeichert werden:', error);
        }
    }

    async loadSavedSignature() {
        try {
            // Try localStorage first
            let signature = localStorage.getItem('user_signature');
            
            // Try cloud
            if (!signature && window.cloudDataService) {
                const profile = await window.cloudDataService.getProfile(false);
                signature = profile?.signature;
            }
            
            if (signature) {
                this.design.signatureImage = signature;
                const previewContainer = document.getElementById('signaturePreview');
                if (previewContainer) {
                    previewContainer.innerHTML = `<img src="${signature}" alt="Unterschrift" style="max-height: 60px;">`;
                }
                console.log('✅ Gespeicherte Signatur geladen');
            }
        } catch (error) {
            console.warn('Signatur konnte nicht geladen werden:', error);
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // HEADER CONTROLS
    // ═══════════════════════════════════════════════════════════════════════════

    setupHeaderControls() {
        // Header Top Margin
        const headerTopMarginSlider = document.getElementById('headerTopMarginSlider');
        const headerTopMarginValue = document.getElementById('headerTopMarginValue');
        if (headerTopMarginSlider) {
            headerTopMarginSlider.addEventListener('input', () => {
                const value = parseInt(headerTopMarginSlider.value);
                this.design.headerTopMargin = value;
                if (headerTopMarginValue) headerTopMarginValue.textContent = `${value}mm`;
                console.log(`🎨 Design geändert: headerTopMargin = ${value}`);
                this.applyDesign();
            });
        } else {
            console.warn('⚠️ headerTopMarginSlider nicht gefunden');
        }
        
        // Header Contrast
        const headerContrastSelect = document.getElementById('headerContrastSelect');
        if (headerContrastSelect) {
            headerContrastSelect.addEventListener('change', () => {
                this.design.headerContrast = headerContrastSelect.value;
                console.log(`🎨 Design geändert: headerContrast = ${headerContrastSelect.value}`);
                this.applyDesign();
            });
        } else {
            console.warn('⚠️ headerContrastSelect nicht gefunden');
        }
        
        // Recipient Top Margin
        const recipientTopMarginSlider = document.getElementById('recipientTopMarginSlider');
        const recipientTopMarginValue = document.getElementById('recipientTopMarginValue');
        if (recipientTopMarginSlider) {
            recipientTopMarginSlider.addEventListener('input', () => {
                const value = parseInt(recipientTopMarginSlider.value);
                this.design.recipientTopMargin = value;
                if (recipientTopMarginValue) recipientTopMarginValue.textContent = `${value}mm`;
                console.log(`🎨 Design geändert: recipientTopMargin = ${value}`);
                this.applyDesign();
            });
        } else {
            console.warn('⚠️ recipientTopMarginSlider nicht gefunden');
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // COMPANY ADDRESS SEARCH
    // ═══════════════════════════════════════════════════════════════════════════

    setupCompanyAddressSearch() {
        const searchBtn = document.getElementById('searchCompanyAddressBtn');
        const companyInput = document.getElementById('companyName');
        
        if (searchBtn) {
            searchBtn.addEventListener('click', () => this.searchCompanyAddress());
        }
        
        // Auto-search when company name changes (debounced)
        if (companyInput) {
            let debounceTimer;
            companyInput.addEventListener('blur', () => {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => {
                    if (companyInput.value.length >= 3) {
                        this.searchCompanyAddress();
                    }
                }, 500);
            });
        }
    }

    async searchCompanyAddress() {
        const companyName = document.getElementById('companyName')?.value;
        if (!companyName || companyName.length < 2) {
            this.showToast('Bitte geben Sie einen Firmennamen ein', 'warning');
            return;
        }
        
        const addressGroup = document.getElementById('companyAddressGroup');
        const addressField = document.getElementById('companyAddress');
        const searchBtn = document.getElementById('searchCompanyAddressBtn');
        
        if (searchBtn) {
            searchBtn.disabled = true;
            searchBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Suche...';
        }
        
        try {
            // Versuche Adresse über verschiedene Quellen zu finden
            let address = await this.findCompanyAddressWithAI(companyName);
            
            if (address) {
                if (addressField) {
                    addressField.value = address;
                }
                if (addressGroup) {
                    addressGroup.style.display = 'block';
                }
                
                // Update display in letter
                const companyAddressDisplay = document.getElementById('companyAddressDisplay');
                if (companyAddressDisplay) {
                    companyAddressDisplay.textContent = address;
                }
                
                this.showToast('Firmenadresse gefunden!', 'success');
            } else {
                if (addressGroup) {
                    addressGroup.style.display = 'block';
                }
                this.showToast('Keine Adresse gefunden - bitte manuell eingeben', 'warning');
            }
        } catch (error) {
            console.error('Fehler bei Adresssuche:', error);
            if (addressGroup) {
                addressGroup.style.display = 'block';
            }
            this.showToast('Adresssuche fehlgeschlagen - bitte manuell eingeben', 'warning');
        } finally {
            if (searchBtn) {
                searchBtn.disabled = false;
                searchBtn.innerHTML = '<i class="fas fa-search"></i> Adresse recherchieren';
            }
        }
    }

    async findCompanyAddressWithAI(companyName) {
        const apiKey = await this.getAPIKey();
        if (!apiKey) {
            console.warn('Kein API-Key für Adresssuche verfügbar');
            return null;
        }
        
        try {
            const country = document.getElementById('countrySelect')?.value || 'CH';
            const countryNames = { 
                DE: 'Deutschland', 
                CH: 'Schweiz', 
                AT: 'Österreich', 
                US: 'USA',
                UK: 'Großbritannien',
                FR: 'Frankreich',
                NL: 'Niederlande',
                IT: 'Italien',
                ES: 'Spanien'
            };
            const countryPrefix = {
                DE: 'D',
                CH: 'CH',
                AT: 'A',
                FR: 'F',
                NL: 'NL',
                IT: 'I',
                ES: 'E',
                UK: 'UK',
                US: 'US'
            };
            
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    messages: [{
                        role: 'system',
                        content: `Du bist ein Experte für Firmenadressen. Suche die offizielle Hauptsitz-Adresse von Unternehmen.
                        Für bekannte Unternehmen wie Siemens, Google, Microsoft etc. gib die lokale Niederlassung im angegebenen Land an.
                        
                        Wichtig:
                        - Siemens Schweiz = Siemens Schweiz AG, Freilagerstrasse 40, CH-8047 Zürich
                        - Siemens Deutschland = Siemens AG, Werner-von-Siemens-Straße 1, D-80333 München
                        - Google Schweiz = Google Switzerland GmbH, Brandschenkestrasse 110, CH-8002 Zürich
                        
                        Antworte IMMER im exakten Format, ohne zusätzlichen Text.`
                    }, {
                        role: 'user',
                        content: `Gib mir die Adresse von "${companyName}" in ${countryNames[country] || 'der Schweiz'}.
                        
                        Antworte NUR in diesem exakten Format (4 Zeilen):
                        [Vollständiger Firmenname inkl. Rechtsform wie GmbH, AG, etc.]
                        [Straße Hausnummer]
                        [${countryPrefix[country] || 'CH'} - PLZ Ort]
                        
                        Falls du die Adresse WIRKLICH nicht findest, antworte nur mit: NICHT_GEFUNDEN`
                    }],
                    max_tokens: 150,
                    temperature: 0.1
                })
            });
            
            if (!response.ok) {
                console.error('API Fehler:', response.status);
                return null;
            }
            
            const data = await response.json();
            const address = data.choices?.[0]?.message?.content?.trim();
            
            console.log('🔍 Adresssuche Ergebnis:', address);
            
            if (address && !address.includes('NICHT_GEFUNDEN') && address.length > 10) {
                // Aktualisiere auch die einzelnen Felder im Brief
                this.updateCompanyAddressFields(address);
                return address;
            }
            return null;
        } catch (error) {
            console.error('AI Adresssuche Fehler:', error);
            return null;
        }
    }
    
    updateCompanyAddressFields(addressText) {
        // Parse die Adresse in einzelne Zeilen
        const lines = addressText.split('\n').map(l => l.trim()).filter(l => l);
        
        if (lines.length >= 2) {
            // Firmenname
            const companyNameDisplay = document.getElementById('companyNameDisplay');
            if (companyNameDisplay && lines[0]) {
                companyNameDisplay.textContent = lines[0];
            }
            
            // Straße
            const companyStreetDisplay = document.getElementById('companyStreetDisplay');
            if (companyStreetDisplay && lines[1]) {
                companyStreetDisplay.textContent = lines[1];
            }
            
            // Land - PLZ Ort
            const companyLocationDisplay = document.getElementById('companyLocationDisplay');
            if (companyLocationDisplay && lines[2]) {
                companyLocationDisplay.textContent = lines[2];
            }
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
function initializeCoverLetterEditor() {
    console.log('📝 Initialisiere CoverLetterEditor...');
    try {
        if (!window.coverLetterEditor) {
            window.coverLetterEditor = new CoverLetterEditor();
            console.log('✅ CoverLetterEditor erfolgreich initialisiert');
        } else {
            console.log('ℹ️ CoverLetterEditor bereits initialisiert');
        }
    } catch (error) {
        console.error('❌ Fehler bei CoverLetterEditor Initialisierung:', error);
        console.error('❌ Error Stack:', error.stack);
    }
}

// Initialisiere sofort wenn DOM bereits geladen
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeCoverLetterEditor);
} else {
    // DOM bereits geladen, initialisiere sofort
    initializeCoverLetterEditor();
}
