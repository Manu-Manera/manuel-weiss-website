/**
 * ═══════════════════════════════════════════════════════════════════════════
 * DESIGN EDITOR - Professional Resume Designer
 * Extended Version with Sidebar Colors, Skill Levels, Images, Signatures
 * ═══════════════════════════════════════════════════════════════════════════
 */

class DesignEditor {
    constructor() {
        this.settings = this.loadSettings();
        this.sections = this.loadSections();
        this.currentZoom = 100;
        this.draggedSection = null;
        
        this.init();
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // INITIALIZATION
    // ═══════════════════════════════════════════════════════════════════════════

    init() {
        this.setupTabs();
        this.setupTypography();
        this.setupLayout();
        this.setupColors();
        this.setupSpacing();
        this.setupTemplates();
        this.setupSections();
        this.setupATS();
        this.setupZoom();
        this.setupAutoSave();
        this.setupSkillDisplay();
        this.setupProfileImage();
        this.setupImageCrop();
        this.setupCompanyLogo();
        this.setupDateFormat();
        this.setupSignature();
        this.setupSignatureExtended();
        this.setupPageNumbers();
        this.setupHeaderFields();
        this.setupResumeTitlePosition();
        this.setupLanguage();
        this.setupMobile();
        this.applySettings();
        this.updatePreview();
        
        console.log('🎨 Design Editor initialized (Extended + Mobile + DateFormat + ImageCrop + CompanyLogo)');
    }
    
    setupMobile() {
        const toggleBtn = document.getElementById('mobileDesignToggle');
        const sidebar = document.getElementById('designSidebar');
        const overlay = document.getElementById('designMobileOverlay');
        const closeBtn = document.getElementById('mobileCloseDesignBtn');
        const exportBtn = document.getElementById('mobileExportPdfBtn');
        
        const toggleSidebar = () => {
            sidebar?.classList.toggle('mobile-open');
            overlay?.classList.toggle('active');
        };
        
        toggleBtn?.addEventListener('click', toggleSidebar);
        overlay?.addEventListener('click', toggleSidebar);
        
        // Close button closes design editor
        closeBtn?.addEventListener('click', () => {
            document.getElementById('designEditorModal')?.classList.remove('active');
            document.body.style.overflow = '';
        });
        
        // Export PDF button
        exportBtn?.addEventListener('click', () => {
            this.exportToPDF();
        });
        
        // Check if mobile and show/hide elements
        const checkMobile = () => {
            const isMobile = window.innerWidth <= 768;
            if (toggleBtn) toggleBtn.style.display = isMobile ? 'flex' : 'none';
            const actionsEl = document.getElementById('mobileDesignActions');
            if (actionsEl) actionsEl.style.display = isMobile ? 'flex' : 'none';
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // DEFAULT SETTINGS (Extended)
    // ═══════════════════════════════════════════════════════════════════════════

    getDefaultSettings() {
        return {
            // Typography
            fontFamily: "'Inter', sans-serif",
            fontSize: 11,
            headingSize: 14,
            lineHeight: 1.5,
            paragraphGap: 6,
            headerAlign: 'center',
            showIcons: true,
            
            // Colors
            accentColor: '#6366f1',
            textColor: '#1e293b',
            mutedColor: '#64748b',
            backgroundColor: '#ffffff',
            borderColor: '#e2e8f0',
            
            // NEW: Section Background Colors
            sidebarBackground: 'transparent',
            sidebarTextColor: '#1e293b',
            headerBackground: 'transparent',
            headerTextColor: '#1e293b',
            leftColumnBg: 'transparent',
            rightColumnBg: 'transparent',
            
            // Spacing
            marginTop: 20,
            marginRight: 20,
            marginBottom: 20,
            marginLeft: 20,
            sectionGap: 24,
            itemGap: 12,
            
            // Page Breaks
            enableManualPageBreaks: false,
            pageBreakSection: '',
            
            // Template
            template: 'modern',
            columns: 1,
            // Column widths (for 2-column layout)
            leftColumnWidth: 35, // percentage
            rightColumnWidth: 65, // percentage
            
            // NEW: Experience Format
            experienceFormat: 'mixed', // 'prose', 'bullets', 'mixed'
            
            // NEW: Skill Display
            skillDisplay: 'tags', // 'tags', 'bars', 'dots', 'numeric', 'percentage'
            skillMaxLevel: 10,
            skillShowLabel: true,
            
            // NEW: Profile Image
            showProfileImage: false,
            profileImageShape: 'circle', // 'circle', 'square', 'rounded'
            profileImageSize: 'medium', // 'small', 'medium', 'large'
            profileImagePosition: 'right', // 'left', 'right', 'center'
            profileImageBorder: 'none', // 'none', 'thin', 'accent'
            profileImageUrl: '',
            // Image Crop Settings
            profileImageZoom: 100,
            profileImageOffsetX: 0,
            profileImageOffsetY: 0,
            
            // NEW: Company Logo (Application Target)
            showCompanyLogo: false,
            companyLogoUrl: '',
            companyLogoPosition: 'top-right', // 'top-left', 'top-right', 'bottom-right'
            companyLogoSize: 'medium', // 'small', 'medium', 'large'
            
            // NEW: Date Format Settings
            dateFormat: 'MM.YYYY', // 'MM.YYYY', 'MM/YYYY', 'MMMM YYYY', 'MMM YYYY', 'YYYY'
            dateSeparator: ' - ', // ' - ', ' – ', ' bis ', ' → '
            dateCurrent: 'heute', // 'heute', 'aktuell', 'present', 'bis heute'
            
            // NEW: Page Numbers
            showPageNumbers: false,
            pageNumberPosition: 'bottom-center', // 'bottom-left', 'bottom-center', 'bottom-right'
            pageNumberFormat: 'Seite X von Y', // 'Seite X von Y', 'X/Y', 'X'
            
            // Resume Title ("Lebenslauf" Überschrift)
            showResumeTitle: true,
            resumeTitleText: 'Lebenslauf',
            
            // Header Field Visibility (welche Felder im Header angezeigt werden)
            showHeaderField: {
                phone: true,
                email: true,
                location: true,
                address: true,
                street: true,
                linkedin: true,
                github: true,
                website: true,
                birthDate: true
            },
            
            // Language Settings
            language: 'de', // 'de' or 'en'
            translations: {}, // Custom translations per field
            resumeTitleSize: 10, // pt
            resumeTitleColor: '', // leer = mutedColor verwenden
            resumeTitleSpacing: 3, // letter-spacing in px
            resumeTitlePosition: 'above-image', // 'above-image', 'left', 'center', 'right', 'same-as-header'
            
            // NEW: Signature (Extended)
            showSignature: false,
            signatureImage: '',
            signatureDate: '',
            signatureLocation: '',
            signatureLine: true,
            signaturePosition: 'bottom-right', // 'bottom-right', 'bottom-left', 'bottom-center', 'after-content', 'custom'
            signatureWidth: 150,
            signatureCustomX: 70, // percentage
            signatureCustomY: 90, // percentage
            signatureSkew: 0, // Grad für Schrägheit (-45 bis +45)
            signatureLineWidth: 1, // px (1-5)
            signatureLineColor: '', // leer = textColor verwenden
            
            // Sections Order & Visibility
            sections: [
                { id: 'header', name: 'Kopfzeile', icon: 'fa-user', visible: true, column: 'full', customTitle: '' },
                { id: 'summary', name: 'Kurzprofil', icon: 'fa-align-left', visible: true, column: 'full', customTitle: '' },
                { id: 'experience', name: 'Berufserfahrung', icon: 'fa-briefcase', visible: true, column: 'right', customTitle: '' },
                { id: 'education', name: 'Ausbildung', icon: 'fa-graduation-cap', visible: true, column: 'right', customTitle: '' },
                { id: 'skills', name: 'Fähigkeiten', icon: 'fa-tools', visible: true, column: 'left', customTitle: '' },
                { id: 'projects', name: 'Projekte', icon: 'fa-project-diagram', visible: false, column: 'right', customTitle: '' },
                { id: 'languages', name: 'Sprachen', icon: 'fa-language', visible: true, column: 'left', customTitle: '' },
                { id: 'certifications', name: 'Zertifikate', icon: 'fa-certificate', visible: false, column: 'left', customTitle: '' },
                { id: 'hobbies', name: 'Hobbys', icon: 'fa-heart', visible: false, column: 'left', customTitle: '' },
                { id: 'references', name: 'Referenzen', icon: 'fa-user-check', visible: false, column: 'full', customTitle: '' },
                { id: 'signature', name: 'Unterschrift', icon: 'fa-signature', visible: false, column: 'full', customTitle: '' }
            ]
        };
    }

    loadSettings() {
        try {
            const saved = localStorage.getItem('resume_design_settings');
            if (saved) {
                const defaults = this.getDefaultSettings();
                const parsed = JSON.parse(saved);
                const merged = { ...defaults, ...parsed };
                merged.sections = this.mergeSections(parsed.sections, defaults.sections);
                return merged;
            }
        } catch (e) {
            console.warn('Could not load design settings:', e);
        }
        return this.getDefaultSettings();
    }

    mergeSections(savedSections, defaultSections) {
        const byId = new Map(defaultSections.map(section => [section.id, section]));
        const result = [];

        if (Array.isArray(savedSections)) {
            savedSections.forEach(section => {
                const defaults = byId.get(section.id);
                if (defaults) {
                    result.push({ ...defaults, ...section });
                    byId.delete(section.id);
                }
            });
        }

        byId.forEach(section => result.push(section));
        return result;
    }

    saveSettings() {
        try {
            localStorage.setItem('resume_design_settings', JSON.stringify(this.settings));
            console.log('💾 Design settings saved');
        } catch (e) {
            console.warn('Could not save design settings:', e);
        }
    }

    loadSections() {
        return this.settings.sections || this.getDefaultSettings().sections;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // TAB NAVIGATION
    // ═══════════════════════════════════════════════════════════════════════════

    setupTabs() {
        document.querySelectorAll('.design-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const targetPanel = tab.dataset.panel;
                
                document.querySelectorAll('.design-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                document.querySelectorAll('.design-panel').forEach(p => p.classList.remove('active'));
                const panel = document.getElementById(`panel-${targetPanel}`);
                if (panel) panel.classList.add('active');
            });
        });
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // TYPOGRAPHY
    // ═══════════════════════════════════════════════════════════════════════════

    setupTypography() {
        const fontSelect = document.getElementById('designFontFamily');
        if (fontSelect) {
            fontSelect.value = this.settings.fontFamily;
            fontSelect.addEventListener('change', (e) => {
                this.settings.fontFamily = e.target.value;
                this.applySettings();
                this.saveSettings();
            });
        }

        this.setupSlider('designFontSize', 'fontSize', 8, 14, 'pt');
        this.setupSlider('designHeadingSize', 'headingSize', 12, 24, 'pt');
        this.setupSlider('designLineHeight', 'lineHeight', 1.0, 2.0, '', 0.1);
    }

    setupLayout() {
        const columnsSelect = document.getElementById('designColumns');
        if (columnsSelect) {
            columnsSelect.value = String(this.settings.columns || 1);
            columnsSelect.addEventListener('change', (e) => {
                this.settings.columns = parseInt(e.target.value, 10);
                // Zeige/Verstecke Spaltenbreite-Controls
                const columnWidthControls = document.getElementById('columnWidthControls');
                if (columnWidthControls) {
                    columnWidthControls.style.display = this.settings.columns === 2 ? 'block' : 'none';
                }
                this.applySettings();
                this.saveSettings();
                this.updatePreview();
            });
            
            // Initial: Zeige Controls wenn 2-Spalten aktiv
            const columnWidthControls = document.getElementById('columnWidthControls');
            if (columnWidthControls) {
                columnWidthControls.style.display = this.settings.columns === 2 ? 'block' : 'none';
            }
        }
        
        // Spaltenbreite-Slider
        this.setupSlider('designLeftColumnWidth', 'leftColumnWidth', 20, 50, '%', 1);
        this.setupSlider('designRightColumnWidth', 'rightColumnWidth', 50, 80, '%', 1);
        
        // Synchronisiere Spaltenbreiten (Summe sollte ~100% sein)
        const leftSlider = document.getElementById('designLeftColumnWidth');
        const rightSlider = document.getElementById('designRightColumnWidth');
        if (leftSlider && rightSlider) {
            const syncColumns = () => {
                const left = parseInt(leftSlider.value);
                const right = parseInt(rightSlider.value);
                // Wenn Summe nicht 100, passe rechte Spalte an
                if (left + right !== 100) {
                    rightSlider.value = 100 - left;
                    this.settings.rightColumnWidth = 100 - left;
                    const rightValue = document.getElementById('designRightColumnWidthValue');
                    if (rightValue) rightValue.textContent = (100 - left) + '%';
                }
                this.saveSettings();
                this.updatePreview();
            };
            
            leftSlider.addEventListener('change', syncColumns);
            rightSlider.addEventListener('change', syncColumns);
        }

        const showIconsToggle = document.getElementById('designShowIcons');
        if (showIconsToggle) {
            showIconsToggle.checked = !!this.settings.showIcons;
            showIconsToggle.addEventListener('change', (e) => {
                this.settings.showIcons = e.target.checked;
                this.applySettings();
                this.saveSettings();
                this.updatePreview();
            });
        }

        const headerAlignSelect = document.getElementById('designHeaderAlign');
        if (headerAlignSelect) {
            headerAlignSelect.value = this.settings.headerAlign || 'center';
            headerAlignSelect.addEventListener('change', (e) => {
                this.settings.headerAlign = e.target.value;
                this.applySettings();
                this.saveSettings();
                this.updatePreview();
            });
        }
        
        // Experience Format
        const expFormatSelect = document.getElementById('designExperienceFormat');
        if (expFormatSelect) {
            expFormatSelect.value = this.settings.experienceFormat || 'mixed';
            expFormatSelect.addEventListener('change', (e) => {
                this.settings.experienceFormat = e.target.value;
                this.saveSettings();
                this.updatePreview();
            });
        }
        
        // Resume Title Settings
        this.setupResumeTitleSettings();
    }
    
    setupResumeTitleSettings() {
        const showTitleToggle = document.getElementById('designShowResumeTitle');
        const titleOptions = document.getElementById('resumeTitleOptions');
        
        if (showTitleToggle) {
            showTitleToggle.checked = this.settings.showResumeTitle !== false;
            showTitleToggle.addEventListener('change', (e) => {
                this.settings.showResumeTitle = e.target.checked;
                if (titleOptions) titleOptions.style.display = e.target.checked ? 'block' : 'none';
                this.saveSettings();
                this.updatePreview();
            });
            // Initial visibility
            if (titleOptions) titleOptions.style.display = showTitleToggle.checked ? 'block' : 'none';
        }
        
        // Title Text
        const titleTextInput = document.getElementById('designResumeTitleText');
        if (titleTextInput) {
            titleTextInput.value = this.settings.resumeTitleText || 'Lebenslauf';
            titleTextInput.addEventListener('input', (e) => {
                this.settings.resumeTitleText = e.target.value;
                this.saveSettings();
                this.updatePreview();
            });
        }
        
        // Title Size
        const titleSizeSlider = document.getElementById('designResumeTitleSize');
        const titleSizeValue = document.getElementById('designResumeTitleSizeValue');
        if (titleSizeSlider) {
            titleSizeSlider.value = this.settings.resumeTitleSize || 10;
            if (titleSizeValue) titleSizeValue.textContent = titleSizeSlider.value + 'pt';
            titleSizeSlider.addEventListener('input', (e) => {
                this.settings.resumeTitleSize = parseInt(e.target.value);
                if (titleSizeValue) titleSizeValue.textContent = e.target.value + 'pt';
                this.saveSettings();
                this.updatePreview();
            });
        }
        
        // Title Color
        const titleColorPicker = document.getElementById('designResumeTitleColor');
        const titleColorHex = document.getElementById('designResumeTitleColorHex');
        if (titleColorPicker) {
            const currentColor = this.settings.resumeTitleColor || this.settings.mutedColor || '#64748b';
            titleColorPicker.value = currentColor;
            if (titleColorHex) titleColorHex.value = currentColor;
            
            titleColorPicker.addEventListener('input', (e) => {
                this.settings.resumeTitleColor = e.target.value;
                if (titleColorHex) titleColorHex.value = e.target.value;
                this.saveSettings();
                this.updatePreview();
            });
            
            if (titleColorHex) {
                titleColorHex.addEventListener('input', (e) => {
                    let value = e.target.value;
                    if (!value.startsWith('#')) value = '#' + value;
                    if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
                        this.settings.resumeTitleColor = value;
                        titleColorPicker.value = value;
                        this.saveSettings();
                        this.updatePreview();
                    }
                });
            }
        }
        
        // Title Letter Spacing
        const titleSpacingSlider = document.getElementById('designResumeTitleSpacing');
        const titleSpacingValue = document.getElementById('designResumeTitleSpacingValue');
        if (titleSpacingSlider) {
            titleSpacingSlider.value = this.settings.resumeTitleSpacing || 3;
            if (titleSpacingValue) titleSpacingValue.textContent = titleSpacingSlider.value + 'px';
            titleSpacingSlider.addEventListener('input', (e) => {
                this.settings.resumeTitleSpacing = parseInt(e.target.value);
                if (titleSpacingValue) titleSpacingValue.textContent = e.target.value + 'px';
                this.saveSettings();
                this.updatePreview();
            });
        }
    }

    setupSlider(elementId, settingKey, min, max, unit = '', step = 1) {
        const slider = document.getElementById(elementId);
        const valueDisplay = document.getElementById(`${elementId}Value`);
        
        if (slider) {
            slider.min = min;
            slider.max = max;
            slider.step = step;
            slider.value = this.settings[settingKey];
            
            if (valueDisplay) {
                valueDisplay.textContent = this.settings[settingKey] + unit;
            }
            
            slider.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                this.settings[settingKey] = value;
                if (valueDisplay) {
                    valueDisplay.textContent = value + unit;
                }
                this.applySettings();
            });
            
            slider.addEventListener('change', () => {
                this.saveSettings();
            });
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // COLORS (Extended with Section Backgrounds)
    // ═══════════════════════════════════════════════════════════════════════════

    setupColors() {
        const colorSettings = [
            { id: 'designAccentColor', key: 'accentColor' },
            { id: 'designTextColor', key: 'textColor' },
            { id: 'designMutedColor', key: 'mutedColor' },
            { id: 'designBgColor', key: 'backgroundColor' },
            // NEW: Section backgrounds
            { id: 'designSidebarBg', key: 'sidebarBackground' },
            { id: 'designSidebarText', key: 'sidebarTextColor' },
            { id: 'designHeaderBg', key: 'headerBackground' },
            { id: 'designLeftColumnBg', key: 'leftColumnBg' },
            { id: 'designRightColumnBg', key: 'rightColumnBg' }
        ];

        colorSettings.forEach(({ id, key }) => {
            const colorPicker = document.getElementById(id);
            const hexInput = document.getElementById(`${id}Hex`);
            
            if (colorPicker) {
                colorPicker.value = this.settings[key] || '#ffffff';
                
                colorPicker.addEventListener('input', (e) => {
                    this.settings[key] = e.target.value;
                    if (hexInput) hexInput.value = e.target.value;
                    this.applySettings();
                    this.updatePreview();
                });
                
                colorPicker.addEventListener('change', () => {
                    this.saveSettings();
                });
            }
            
            if (hexInput) {
                hexInput.value = this.settings[key] || '#ffffff';
                hexInput.addEventListener('input', (e) => {
                    let value = e.target.value;
                    if (!value.startsWith('#')) value = '#' + value;
                    if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
                        this.settings[key] = value;
                        if (colorPicker) colorPicker.value = value;
                        this.applySettings();
                        this.saveSettings();
                        this.updatePreview();
                    }
                });
            }
        });

        this.setupColorPresets();
    }

    setupColorPresets() {
        const presets = [
            { name: 'Indigo', accent: '#6366f1', text: '#1e293b' },
            { name: 'Blue', accent: '#3b82f6', text: '#1e293b' },
            { name: 'Green', accent: '#10b981', text: '#1e293b' },
            { name: 'Purple', accent: '#8b5cf6', text: '#1e293b' },
            { name: 'Red', accent: '#ef4444', text: '#1e293b' },
            { name: 'Orange', accent: '#f97316', text: '#1e293b' },
            { name: 'Teal', accent: '#14b8a6', text: '#1e293b' },
            { name: 'Dark', accent: '#1e293b', text: '#1e293b' }
        ];

        const presetsContainer = document.getElementById('colorPresets');
        if (presetsContainer) {
            presetsContainer.innerHTML = presets.map(preset => `
                <button class="design-color-preset ${this.settings.accentColor === preset.accent ? 'active' : ''}" 
                        style="background: ${preset.accent}" 
                        data-accent="${preset.accent}" 
                        data-text="${preset.text}"
                        title="${preset.name}">
                </button>
            `).join('');

            presetsContainer.querySelectorAll('.design-color-preset').forEach(btn => {
                btn.addEventListener('click', () => {
                    this.settings.accentColor = btn.dataset.accent;
                    
                    const accentPicker = document.getElementById('designAccentColor');
                    const accentHex = document.getElementById('designAccentColorHex');
                    if (accentPicker) accentPicker.value = btn.dataset.accent;
                    if (accentHex) accentHex.value = btn.dataset.accent;
                    
                    presetsContainer.querySelectorAll('.design-color-preset').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    
                    this.applySettings();
                    this.saveSettings();
                });
            });
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // SPACING
    // ═══════════════════════════════════════════════════════════════════════════

    setupSpacing() {
        this.setupSlider('designMarginTop', 'marginTop', 10, 40, 'mm');
        this.setupSlider('designMarginRight', 'marginRight', 10, 40, 'mm');
        this.setupSlider('designMarginBottom', 'marginBottom', 10, 40, 'mm');
        this.setupSlider('designMarginLeft', 'marginLeft', 10, 40, 'mm');
        this.setupSlider('designSectionGap', 'sectionGap', 12, 48, 'px');
        this.setupSlider('designItemGap', 'itemGap', 6, 24, 'px');
        this.setupSlider('designParagraphGap', 'paragraphGap', 0, 16, 'px');

        const uniformToggle = document.getElementById('uniformMargins');
        if (uniformToggle) {
            uniformToggle.addEventListener('change', (e) => {
                if (e.target.checked) {
                    const value = this.settings.marginTop;
                    ['marginRight', 'marginBottom', 'marginLeft'].forEach(key => {
                        this.settings[key] = value;
                        const slider = document.getElementById(`design${key.charAt(0).toUpperCase() + key.slice(1)}`);
                        const valueDisplay = document.getElementById(`design${key.charAt(0).toUpperCase() + key.slice(1)}Value`);
                        if (slider) slider.value = value;
                        if (valueDisplay) valueDisplay.textContent = value + 'mm';
                    });
                    this.applySettings();
                    this.saveSettings();
                }
            });
        }
        
        // Manuelle Seitenumbrüche
        const enableManualPageBreaks = document.getElementById('enableManualPageBreaks');
        const manualPageBreaksControls = document.getElementById('manualPageBreaksControls');
        const pageBreakSection = document.getElementById('pageBreakSection');
        
        if (enableManualPageBreaks) {
            // Initial state
            if (this.settings.enableManualPageBreaks) {
                enableManualPageBreaks.checked = true;
                if (manualPageBreaksControls) manualPageBreaksControls.style.display = 'block';
            }
            
            enableManualPageBreaks.addEventListener('change', (e) => {
                this.settings.enableManualPageBreaks = e.target.checked;
                if (manualPageBreaksControls) {
                    manualPageBreaksControls.style.display = e.target.checked ? 'block' : 'none';
                }
                if (!e.target.checked) {
                    this.settings.pageBreakSection = '';
                    if (pageBreakSection) pageBreakSection.value = '';
                }
                this.applySettings();
                this.saveSettings();
            });
        }
        
        if (pageBreakSection) {
            if (this.settings.pageBreakSection) {
                pageBreakSection.value = this.settings.pageBreakSection;
            }
            pageBreakSection.addEventListener('change', (e) => {
                this.settings.pageBreakSection = e.target.value;
                this.applySettings();
                this.saveSettings();
            });
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // TEMPLATES (Extended with 15 Templates)
    // ═══════════════════════════════════════════════════════════════════════════

    setupTemplates() {
        const templates = [
            // Original Templates
            { id: 'modern', name: 'Modern', desc: 'Clean & Professional', icon: '📄', 
              settings: { accentColor: '#6366f1', fontFamily: "'Inter', sans-serif", columns: 1, sidebarBackground: 'transparent', showResumeTitle: true } },
            { id: 'classic', name: 'Klassisch', desc: 'Zeitlos & Elegant', icon: '📋', 
              settings: { accentColor: '#1e293b', fontFamily: "'Georgia', serif", columns: 1, sidebarBackground: 'transparent', showResumeTitle: true } },
            { id: 'creative', name: 'Kreativ', desc: 'Auffällig & Modern', icon: '🎨', 
              settings: { accentColor: '#8b5cf6', fontFamily: "'Montserrat', sans-serif", columns: 2, sidebarBackground: 'transparent', showResumeTitle: false } },
            { id: 'minimal', name: 'Minimal', desc: 'Schlicht & Fokussiert', icon: '✨', 
              settings: { accentColor: '#64748b', fontFamily: "'Inter', sans-serif", columns: 1, sidebarBackground: 'transparent', showResumeTitle: false } },
            { id: 'executive', name: 'Executive', desc: 'Führungskräfte', icon: '👔', 
              settings: { accentColor: '#0f172a', fontFamily: "'Times New Roman', serif", columns: 1, sidebarBackground: 'transparent', showResumeTitle: true } },
            { id: 'ats', name: 'ATS-Optimiert', desc: 'Für Bewerbungssysteme', icon: '🤖', 
              settings: { accentColor: '#1e293b', fontFamily: "'Arial', sans-serif", columns: 1, showIcons: false, sidebarBackground: 'transparent', showResumeTitle: true } },
            
            // Sidebar Templates
            { id: 'sidebar-dark', name: 'Sidebar Dunkel', desc: 'Dunkle Sidebar', icon: '🌙', 
              settings: { 
                accentColor: '#ffffff', fontFamily: "'Inter', sans-serif", columns: 2,
                sidebarBackground: '#2d3748', sidebarTextColor: '#ffffff', leftColumnBg: '#2d3748', rightColumnBg: '#ffffff', showResumeTitle: false
              } },
            { id: 'sidebar-accent', name: 'Sidebar Akzent', desc: 'Farbige Sidebar', icon: '🎯', 
              settings: { 
                accentColor: '#ffffff', fontFamily: "'Inter', sans-serif", columns: 2,
                sidebarBackground: '#6366f1', sidebarTextColor: '#ffffff', leftColumnBg: '#6366f1', rightColumnBg: '#ffffff', showResumeTitle: false
              } },
            { id: 'sidebar-teal', name: 'Sidebar Teal', desc: 'Türkis Sidebar', icon: '🌊', 
              settings: { 
                accentColor: '#ffffff', fontFamily: "'Inter', sans-serif", columns: 2,
                sidebarBackground: '#0d9488', sidebarTextColor: '#ffffff', leftColumnBg: '#0d9488', rightColumnBg: '#ffffff', showResumeTitle: false
              } },
            
            // Professional Templates
            { id: 'tech', name: 'Tech/Developer', desc: 'Für IT & Entwickler', icon: '💻', 
              settings: { 
                accentColor: '#22c55e', fontFamily: "'Source Code Pro', monospace", columns: 2,
                skillDisplay: 'bars', sidebarBackground: '#0f172a', sidebarTextColor: '#22c55e', leftColumnBg: '#0f172a', showResumeTitle: false
              } },
            { id: 'finance', name: 'Finance', desc: 'Konservativ & Seriös', icon: '💼', 
              settings: { 
                accentColor: '#14532d', fontFamily: "'Times New Roman', serif", columns: 1,
                sidebarBackground: 'transparent', showIcons: false, showResumeTitle: true
              } },
            { id: 'startup', name: 'Startup', desc: 'Modern & Dynamisch', icon: '🚀', 
              settings: { 
                accentColor: '#f97316', fontFamily: "'Nunito', sans-serif", columns: 2,
                sidebarBackground: '#fff7ed', leftColumnBg: '#fff7ed', showResumeTitle: false
              } },
            { id: 'academic', name: 'Akademisch', desc: 'Für Wissenschaft', icon: '🎓', 
              settings: { 
                accentColor: '#1e3a8a', fontFamily: "'Merriweather', serif", columns: 1,
                sidebarBackground: 'transparent', showResumeTitle: true
              } },
            { id: 'creative-bold', name: 'Kreativ Bold', desc: 'Mutige Farben', icon: '🎪', 
              settings: { 
                accentColor: '#ec4899', fontFamily: "'Montserrat', sans-serif", columns: 2,
                sidebarBackground: '#fdf2f8', leftColumnBg: '#fdf2f8', headerBackground: '#ec4899', showResumeTitle: false
              } },
            { id: 'executive-gold', name: 'Executive Gold', desc: 'Premium Look', icon: '👑', 
              settings: { 
                accentColor: '#b45309', fontFamily: "'Playfair Display', serif", columns: 1,
                sidebarBackground: 'transparent', headerBackground: '#fffbeb', showResumeTitle: true
              } },
            
            // NEUE stylische Templates
            { id: 'swiss', name: 'Swiss Design', desc: 'Helvetica-Stil, Clean', icon: '🇨🇭', 
              settings: { 
                accentColor: '#dc2626', fontFamily: "'Helvetica Neue', 'Arial', sans-serif", columns: 1,
                sidebarBackground: 'transparent', fontSize: 10, lineHeight: 1.4, showResumeTitle: true,
                headerAlign: 'left'
              } },
            { id: 'nordic', name: 'Nordic', desc: 'Skandinavisch minimalistisch', icon: '❄️', 
              settings: { 
                accentColor: '#0ea5e9', fontFamily: "'Open Sans', sans-serif", columns: 2,
                sidebarBackground: '#f8fafc', leftColumnBg: '#f8fafc', sidebarTextColor: '#334155',
                showResumeTitle: false, fontSize: 10
              } },
            { id: 'dark-mode', name: 'Dark Mode', desc: 'Dunkler Hintergrund', icon: '🌑', 
              settings: { 
                accentColor: '#a78bfa', fontFamily: "'Inter', sans-serif", columns: 1,
                backgroundColor: '#1e1e2e', textColor: '#cdd6f4', mutedColor: '#9399b2',
                headerBackground: '#313244', sidebarBackground: 'transparent', showResumeTitle: false
              } },
            { id: 'gradient', name: 'Gradient Header', desc: 'Farbverlauf-Header', icon: '🌈', 
              settings: { 
                accentColor: '#ffffff', fontFamily: "'Poppins', sans-serif", columns: 1,
                headerBackground: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                headerTextColor: '#ffffff', sidebarBackground: 'transparent', showResumeTitle: false
              } },
            { id: 'consulting', name: 'Consulting', desc: 'McKinsey/BCG Style', icon: '📊', 
              settings: { 
                accentColor: '#1e40af', fontFamily: "'Roboto', sans-serif", columns: 1,
                sidebarBackground: 'transparent', showIcons: false, showResumeTitle: true,
                experienceFormat: 'bullets', fontSize: 10
              } },
            { id: 'designer', name: 'Designer Portfolio', desc: 'Kreativ & Visuell', icon: '🎭', 
              settings: { 
                accentColor: '#f43f5e', fontFamily: "'Lato', sans-serif", columns: 2,
                sidebarBackground: '#18181b', sidebarTextColor: '#fafafa', leftColumnBg: '#18181b',
                skillDisplay: 'dots', showResumeTitle: false, profileImageShape: 'rounded'
              } },
            { id: 'elegant', name: 'Elegant Serif', desc: 'Zeitschriften-Look', icon: '📰', 
              settings: { 
                accentColor: '#78350f', fontFamily: "'Playfair Display', serif", columns: 1,
                sidebarBackground: 'transparent', headerAlign: 'center', showResumeTitle: true,
                fontSize: 11, lineHeight: 1.6
              } },
            { id: 'tech-minimal', name: 'Tech Minimal', desc: 'FAANG-Style', icon: '⚡', 
              settings: { 
                accentColor: '#059669', fontFamily: "'SF Pro Display', -apple-system, sans-serif", columns: 1,
                sidebarBackground: 'transparent', showIcons: true, showResumeTitle: false,
                skillDisplay: 'tags', experienceFormat: 'bullets'
              } },
            
            // ═══════════════════════════════════════════════════════════════════
            // NEUE STYLISCHE TEMPLATES 2026
            // ═══════════════════════════════════════════════════════════════════
            
            // Abgerundete & Soft Designs
            { id: 'soft-rounded', name: 'Soft Rounded', desc: 'Sanfte Rundungen, Pastell', icon: '🧸', 
              settings: { 
                accentColor: '#8b5cf6', fontFamily: "'Quicksand', sans-serif", columns: 2,
                sidebarBackground: '#faf5ff', leftColumnBg: '#faf5ff', sidebarTextColor: '#6b21a8',
                showResumeTitle: false, profileImageShape: 'rounded',
                fontSize: 10, lineHeight: 1.5
              } },
            { id: 'bubble', name: 'Bubble Card', desc: 'Karten-Design mit Schatten', icon: '💭', 
              settings: { 
                accentColor: '#06b6d4', fontFamily: "'DM Sans', sans-serif", columns: 1,
                sidebarBackground: 'transparent', backgroundColor: '#ecfeff',
                showResumeTitle: false, headerBackground: '#06b6d4', headerTextColor: '#ffffff',
                fontSize: 10
              } },
            { id: 'clay', name: 'Clay Morphism', desc: '3D-Effekt, weiche Schatten', icon: '🏺', 
              settings: { 
                accentColor: '#f472b6', fontFamily: "'Nunito', sans-serif", columns: 2,
                sidebarBackground: '#fce7f3', leftColumnBg: '#fce7f3', sidebarTextColor: '#9d174d',
                backgroundColor: '#fff1f2', showResumeTitle: false,
                profileImageShape: 'circle', profileImageBorder: 'accent'
              } },
            
            // Künstlerische & Kreative Designs
            { id: 'brutalist', name: 'Brutalist', desc: 'Bold, kantig, auffällig', icon: '🏗️', 
              settings: { 
                accentColor: '#000000', fontFamily: "'Space Mono', monospace", columns: 1,
                sidebarBackground: 'transparent', textColor: '#000000',
                showResumeTitle: true, resumeTitleSize: 14, resumeTitleSpacing: 8,
                fontSize: 10, headerAlign: 'left', showIcons: false
              } },
            { id: 'editorial', name: 'Editorial', desc: 'Magazin-Stil, elegant', icon: '📕', 
              settings: { 
                accentColor: '#991b1b', fontFamily: "'Cormorant Garamond', serif", columns: 1,
                sidebarBackground: 'transparent', headerAlign: 'center',
                showResumeTitle: true, resumeTitleSize: 12, fontSize: 11, lineHeight: 1.7
              } },
            { id: 'retro', name: 'Retro 80s', desc: 'Neon-Vibes, nostalgisch', icon: '📼', 
              settings: { 
                accentColor: '#f0abfc', fontFamily: "'Audiowide', cursive", columns: 2,
                sidebarBackground: '#1e1b4b', leftColumnBg: '#1e1b4b', sidebarTextColor: '#f0abfc',
                backgroundColor: '#0f0a1e', textColor: '#e2e8f0',
                showResumeTitle: false, skillDisplay: 'bars'
              } },
            { id: 'neon', name: 'Neon Glow', desc: 'Leuchtende Akzente', icon: '💡', 
              settings: { 
                accentColor: '#22d3ee', fontFamily: "'Rajdhani', sans-serif", columns: 1,
                backgroundColor: '#0c0a09', textColor: '#f5f5f4', mutedColor: '#a8a29e',
                headerBackground: '#18181b', showResumeTitle: false,
                skillDisplay: 'bars'
              } },
            
            // Premium & Executive
            { id: 'black-gold', name: 'Black & Gold', desc: 'Luxus, Premium', icon: '✨', 
              settings: { 
                accentColor: '#fbbf24', fontFamily: "'Cinzel', serif", columns: 1,
                backgroundColor: '#0c0a09', textColor: '#fafaf9', mutedColor: '#d6d3d1',
                headerBackground: '#1c1917', showResumeTitle: true,
                resumeTitleColor: '#fbbf24', fontSize: 10
              } },
            { id: 'marble', name: 'Marble Elegant', desc: 'Marmor-Optik, luxuriös', icon: '🪨', 
              settings: { 
                accentColor: '#78716c', fontFamily: "'Cormorant', serif", columns: 1,
                sidebarBackground: 'transparent', backgroundColor: '#fafaf9',
                headerBackground: '#e7e5e4', showResumeTitle: true,
                fontSize: 11, lineHeight: 1.6, headerAlign: 'center'
              } },
            
            // Moderne Farbkombinationen
            { id: 'mint-fresh', name: 'Mint Fresh', desc: 'Frisch, modern, clean', icon: '🌿', 
              settings: { 
                accentColor: '#10b981', fontFamily: "'Outfit', sans-serif", columns: 2,
                sidebarBackground: '#ecfdf5', leftColumnBg: '#ecfdf5', sidebarTextColor: '#065f46',
                showResumeTitle: false, profileImageShape: 'circle'
              } },
            { id: 'sunset', name: 'Sunset Warm', desc: 'Warme Farben, einladend', icon: '🌅', 
              settings: { 
                accentColor: '#ea580c', fontFamily: "'Rubik', sans-serif", columns: 1,
                headerBackground: 'linear-gradient(135deg, #fed7aa 0%, #fdba74 100%)',
                sidebarBackground: 'transparent', showResumeTitle: false
              } },
            { id: 'ocean', name: 'Ocean Blue', desc: 'Tiefes Blau, professionell', icon: '🌊', 
              settings: { 
                accentColor: '#0369a1', fontFamily: "'IBM Plex Sans', sans-serif", columns: 2,
                sidebarBackground: '#0c4a6e', leftColumnBg: '#0c4a6e', sidebarTextColor: '#e0f2fe',
                showResumeTitle: false, skillDisplay: 'bars'
              } },
            { id: 'lavender', name: 'Lavender Dream', desc: 'Sanft, beruhigend', icon: '💜', 
              settings: { 
                accentColor: '#7c3aed', fontFamily: "'Quicksand', sans-serif", columns: 2,
                sidebarBackground: '#ede9fe', leftColumnBg: '#ede9fe', sidebarTextColor: '#5b21b6',
                backgroundColor: '#faf5ff', showResumeTitle: false,
                profileImageShape: 'rounded'
              } },
            
            // Industrie-spezifisch
            { id: 'healthcare', name: 'Healthcare', desc: 'Medizin & Pflege', icon: '🏥', 
              settings: { 
                accentColor: '#0891b2', fontFamily: "'Source Sans Pro', sans-serif", columns: 1,
                sidebarBackground: 'transparent', showResumeTitle: true,
                showIcons: true, fontSize: 10
              } },
            { id: 'legal', name: 'Legal', desc: 'Jura, seriös', icon: '⚖️', 
              settings: { 
                accentColor: '#1e3a5f', fontFamily: "'Libre Baskerville', serif", columns: 1,
                sidebarBackground: 'transparent', showResumeTitle: true,
                showIcons: false, fontSize: 10, experienceFormat: 'prose'
              } },
            { id: 'creative-agency', name: 'Agency', desc: 'Agentur & Marketing', icon: '🎨', 
              settings: { 
                accentColor: '#be185d', fontFamily: "'Sora', sans-serif", columns: 2,
                sidebarBackground: '#500724', leftColumnBg: '#500724', sidebarTextColor: '#fce7f3',
                showResumeTitle: false, skillDisplay: 'tags'
              } }
        ];

        const templatesGrid = document.getElementById('templatesGrid');
        if (templatesGrid) {
            templatesGrid.innerHTML = templates.map(t => `
                <div class="design-template-card ${this.settings.template === t.id ? 'active' : ''}" data-template="${t.id}">
                    <div class="design-template-preview">${t.icon}</div>
                    <div class="design-template-info">
                        <div class="design-template-name">${t.name}</div>
                        <div class="design-template-desc">${t.desc}</div>
                    </div>
                </div>
            `).join('');

            templatesGrid.querySelectorAll('.design-template-card').forEach(card => {
                card.addEventListener('click', () => {
                    const templateId = card.dataset.template;
                    const template = templates.find(t => t.id === templateId);
                    
                    if (template) {
                        templatesGrid.querySelectorAll('.design-template-card').forEach(c => c.classList.remove('active'));
                        card.classList.add('active');
                        
                        // Behalte showHeaderField beim Template-Wechsel
                        const currentShowHeaderField = { ...this.settings.showHeaderField };
                        const preservedSettings = {
                            profileImageUrl: this.settings.profileImageUrl,
                            signatureImage: this.settings.signatureImage,
                        };
                        
                        this.settings.template = templateId;
                        Object.assign(this.settings, template.settings);
                        
                        // Stelle showHeaderField wieder her (wird nicht von Template überschrieben)
                        this.settings.showHeaderField = { ...currentShowHeaderField, ...(template.settings.showHeaderField || {}) };
                        if (preservedSettings.profileImageUrl) this.settings.profileImageUrl = preservedSettings.profileImageUrl;
                        if (preservedSettings.signatureImage) this.settings.signatureImage = preservedSettings.signatureImage;
                        
                        this.updateUIFromSettings();
                        this.applySettings();
                        this.saveSettings();
                        this.updatePreview();
                        
                        this.showNotification(`Template "${template.name}" angewendet`, 'success');
                    }
                });
            });
        }
    }

    updateUIFromSettings() {
        // Typography
        const fontSelect = document.getElementById('designFontFamily');
        if (fontSelect) fontSelect.value = this.settings.fontFamily;
        
        const fontSizeSlider = document.getElementById('designFontSize');
        if (fontSizeSlider) {
            fontSizeSlider.value = this.settings.fontSize || 11;
            const display = document.getElementById('designFontSizeValue');
            if (display) display.textContent = fontSizeSlider.value + 'pt';
        }
        
        // Colors - Aktualisiere ALLE Farb-Picker
        const colorSettings = [
            { id: 'designAccentColor', hexId: 'designAccentColorHex', key: 'accentColor' },
            { id: 'designTextColor', hexId: 'designTextColorHex', key: 'textColor' },
            { id: 'designMutedColor', hexId: 'designMutedColorHex', key: 'mutedColor' },
            { id: 'designBgColor', hexId: 'designBgColorHex', key: 'backgroundColor' },
            { id: 'designSidebarBg', hexId: 'designSidebarBgHex', key: 'sidebarBackground' },
            { id: 'designSidebarText', hexId: 'designSidebarTextHex', key: 'sidebarTextColor' },
            { id: 'designHeaderBg', hexId: 'designHeaderBgHex', key: 'headerBackground' },
            { id: 'designLeftColumnBg', hexId: 'designLeftColumnBgHex', key: 'leftColumnBg' },
            { id: 'designRightColumnBg', hexId: 'designRightColumnBgHex', key: 'rightColumnBg' }
        ];
        
        colorSettings.forEach(({ id, hexId, key }) => {
            const colorPicker = document.getElementById(id);
            const hexInput = document.getElementById(hexId);
            // Verwende Template-Farbe oder Fallback
            const value = this.settings[key] || (key === 'backgroundColor' ? '#ffffff' : key === 'textColor' ? '#1e293b' : key === 'accentColor' ? '#6366f1' : '#ffffff');
            if (colorPicker) {
                colorPicker.value = value;
                // Trigger change event um sicherzustellen, dass Event-Listener ausgelöst werden
                colorPicker.dispatchEvent(new Event('input', { bubbles: true }));
            }
            if (hexInput) {
                hexInput.value = value;
                hexInput.dispatchEvent(new Event('input', { bubbles: true }));
            }
            console.log(`✅ Farbe ${key} aktualisiert:`, value);
        });
        
        document.querySelectorAll('.design-color-preset').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.accent === this.settings.accentColor);
        });
        
        // Header Fields Checkboxen aktualisieren (WICHTIG: Nach Template-Wechsel)
        if (this.settings.showHeaderField) {
            const fieldMap = {
                'headerFieldPhone': 'phone',
                'headerFieldEmail': 'email',
                'headerFieldLocation': 'location',
                'headerFieldAddress': 'address',
                'headerFieldLinkedIn': 'linkedin',
                'headerFieldGitHub': 'github',
                'headerFieldWebsite': 'website',
                'headerFieldBirthDate': 'birthDate'
            };
            
            Object.entries(fieldMap).forEach(([checkboxId, fieldKey]) => {
                const checkbox = document.getElementById(checkboxId);
                if (checkbox) {
                    const shouldBeChecked = this.settings.showHeaderField[fieldKey] !== false;
                    checkbox.checked = shouldBeChecked;
                    // Stelle sicher, dass Event-Listener vorhanden sind (werden in setupHeaderFields() registriert)
                    console.log(`✅ Checkbox ${checkboxId} (${fieldKey}) auf ${shouldBeChecked ? 'checked' : 'unchecked'} gesetzt`);
                } else {
                    console.warn(`⚠️ Checkbox ${checkboxId} nicht gefunden`);
                }
            });
        } else {
            console.warn('⚠️ showHeaderField nicht in Settings vorhanden');
        }
        
        // Layout
        const columnsSelect = document.getElementById('designColumns');
        if (columnsSelect) columnsSelect.value = String(this.settings.columns);
        
        const headerAlignSelect = document.getElementById('designHeaderAlign');
        if (headerAlignSelect) headerAlignSelect.value = this.settings.headerAlign || 'center';
        
        // Resume Title Position
        const resumeTitlePositionSelect = document.getElementById('designResumeTitlePosition');
        if (resumeTitlePositionSelect) {
            resumeTitlePositionSelect.value = this.settings.resumeTitlePosition || 'above-image';
        }
        
        // Skill Display
        const skillDisplaySelect = document.getElementById('designSkillDisplay');
        if (skillDisplaySelect) skillDisplaySelect.value = this.settings.skillDisplay || 'tags';
        
        // Experience Format
        const expFormatSelect = document.getElementById('designExperienceFormat');
        if (expFormatSelect) expFormatSelect.value = this.settings.experienceFormat || 'mixed';
        
        // Icons Toggle
        const showIconsToggle = document.getElementById('designShowIcons');
        if (showIconsToggle) showIconsToggle.checked = this.settings.showIcons !== false;
        
        // Force a complete re-render of the preview
        this.applySettings();
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // SKILL DISPLAY OPTIONS
    // ═══════════════════════════════════════════════════════════════════════════

    setupSkillDisplay() {
        const skillDisplaySelect = document.getElementById('designSkillDisplay');
        if (skillDisplaySelect) {
            skillDisplaySelect.value = this.settings.skillDisplay || 'tags';
            skillDisplaySelect.addEventListener('change', (e) => {
                this.settings.skillDisplay = e.target.value;
                this.saveSettings();
                this.updatePreview();
                this.renderSkillLevelEditor();
            });
        }
        
        const skillMaxLevelSelect = document.getElementById('designSkillMaxLevel');
        if (skillMaxLevelSelect) {
            skillMaxLevelSelect.value = this.settings.skillMaxLevel || 10;
            skillMaxLevelSelect.addEventListener('change', (e) => {
                this.settings.skillMaxLevel = parseInt(e.target.value);
                this.saveSettings();
                this.updatePreview();
                this.renderSkillLevelEditor();
            });
        }
        
        const skillShowLabelToggle = document.getElementById('designSkillShowLabel');
        if (skillShowLabelToggle) {
            skillShowLabelToggle.checked = this.settings.skillShowLabel !== false;
            skillShowLabelToggle.addEventListener('change', (e) => {
                this.settings.skillShowLabel = e.target.checked;
                this.saveSettings();
                this.updatePreview();
            });
        }
        
        // Refresh button
        const refreshBtn = document.getElementById('refreshSkillLevels');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.renderSkillLevelEditor();
                this.showNotification('Skills aktualisiert', 'success');
            });
        }
        
        // Initial render after a short delay (to let form data load)
        setTimeout(() => this.renderSkillLevelEditor(), 500);
    }
    
    renderSkillLevelEditor() {
        const container = document.getElementById('skillLevelEditor');
        if (!container) return;
        
        const skillsData = this.getSkillsData();
        const maxLevel = this.settings.skillMaxLevel || 10;
        
        if (!skillsData.technicalSkills?.length && !skillsData.softSkills?.length) {
            container.innerHTML = `
                <p style="font-size: 0.75rem; color: var(--design-text-muted); font-style: italic;">
                    Fügen Sie erst Skills im Formular hinzu...
                </p>
            `;
            return;
        }
        
        let html = '';
        
        // Technical Skills
        skillsData.technicalSkills.forEach((category, catIndex) => {
            if (category.category) {
                html += `<div style="font-size: 0.7rem; font-weight: 600; color: var(--design-text-secondary); margin: 8px 0 4px; text-transform: uppercase;">${category.category}</div>`;
            }
            (category.skills || []).forEach((skill, skillIndex) => {
                const name = typeof skill === 'string' ? skill : skill.name;
                const level = typeof skill === 'object' ? (skill.level || 5) : 5;
                html += this.renderSkillLevelRow(name, level, maxLevel, 'tech', catIndex, skillIndex);
            });
        });
        
        // Soft Skills
        if (skillsData.softSkills?.length) {
            html += `<div style="font-size: 0.7rem; font-weight: 600; color: var(--design-text-secondary); margin: 12px 0 4px; text-transform: uppercase;">Soft Skills</div>`;
            skillsData.softSkills.forEach((skill, index) => {
                const name = typeof skill === 'string' ? skill : (skill.name || skill.skill || '');
                const level = typeof skill === 'object' ? (skill.level || 5) : 5;
                const examples = typeof skill === 'object' ? (skill.examples || []) : [];
                html += this.renderSkillLevelRow(name, level, maxLevel, 'soft', 0, index, examples);
            });
        }
        
        container.innerHTML = html;
        
        // Add CSS for sliders - mit verbessertem Thumb-Styling für alle Browser
        if (!document.getElementById('skill-slider-styles')) {
            const style = document.createElement('style');
            style.id = 'skill-slider-styles';
            style.textContent = `
                .skill-level-slider {
                    -webkit-appearance: none !important;
                    appearance: none !important;
                    width: 100%;
                    height: 8px;
                    border-radius: 4px;
                    outline: none;
                    cursor: pointer;
                    margin: 4px 0;
                }
                .skill-level-slider::-webkit-slider-runnable-track {
                    width: 100%;
                    height: 8px;
                    border-radius: 4px;
                    background: transparent;
                }
                .skill-level-slider::-webkit-slider-thumb {
                    -webkit-appearance: none !important;
                    appearance: none !important;
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #818cf8, #6366f1);
                    cursor: grab;
                    box-shadow: 0 2px 6px rgba(99,102,241,0.5), 0 0 0 2px rgba(255,255,255,0.2);
                    border: 2px solid white;
                    margin-top: -6px;
                    transition: transform 0.15s ease, box-shadow 0.15s ease;
                }
                .skill-level-slider::-webkit-slider-thumb:hover {
                    transform: scale(1.15);
                    box-shadow: 0 3px 10px rgba(99,102,241,0.6), 0 0 0 3px rgba(255,255,255,0.3);
                }
                .skill-level-slider::-webkit-slider-thumb:active {
                    cursor: grabbing;
                    transform: scale(1.1);
                }
                .skill-level-slider::-moz-range-track {
                    width: 100%;
                    height: 8px;
                    border-radius: 4px;
                    background: transparent;
                }
                .skill-level-slider::-moz-range-thumb {
                    width: 18px;
                    height: 18px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #818cf8, #6366f1);
                    cursor: grab;
                    border: 2px solid white;
                    box-shadow: 0 2px 6px rgba(99,102,241,0.5);
                }
                .skill-level-slider::-moz-range-thumb:hover {
                    transform: scale(1.15);
                }
                .skill-edit-row:hover {
                    background: rgba(99,102,241,0.08);
                }
            `;
            document.head.appendChild(style);
        }
        
        // Add input handlers for sliders with visual feedback
        container.querySelectorAll('.skill-level-slider').forEach(slider => {
            const maxLevel = this.settings.skillMaxLevel || 10;
            
            // Update gradient on input
            const updateSliderBackground = (el) => {
                const value = parseInt(el.value);
                const percentage = Math.round((value / maxLevel) * 100);
                el.style.background = `linear-gradient(to right, var(--design-primary) ${percentage}%, rgba(255,255,255,0.2) ${percentage}%)`;
            };
            
            slider.addEventListener('input', (e) => {
                const newLevel = parseInt(e.target.value);
                const type = e.target.dataset.type;
                const catIndex = parseInt(e.target.dataset.cat);
                const skillIndex = parseInt(e.target.dataset.skill);
                
                // Update display
                const displayId = e.target.id + '-display';
                const display = document.getElementById(displayId);
                if (display) display.textContent = `${newLevel}/${maxLevel}`;
                
                // Update slider background
                updateSliderBackground(e.target);
                
                // Debounce the actual update to form
                clearTimeout(this._skillUpdateTimeout);
                this._skillUpdateTimeout = setTimeout(() => {
                    this.updateSkillLevel(type, catIndex, skillIndex, newLevel);
                }, 100);
            });
            
            slider.addEventListener('change', (e) => {
                const newLevel = parseInt(e.target.value);
                const type = e.target.dataset.type;
                const catIndex = parseInt(e.target.dataset.cat);
                const skillIndex = parseInt(e.target.dataset.skill);
                this.updateSkillLevel(type, catIndex, skillIndex, newLevel);
            });
        });
    }
    
    renderSkillLevelRow(name, level, maxLevel, type, catIndex, skillIndex, examples = []) {
        const uniqueId = `skill-${type}-${catIndex}-${skillIndex}`;
        const percentage = Math.round((level / maxLevel) * 100);
        const hasExamples = examples && examples.length > 0;
        
        return `
            <div class="skill-edit-row" style="padding: 10px 4px; border-bottom: 1px solid rgba(255,255,255,0.08); border-radius: 6px;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                    <span style="font-size: 0.85rem; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 65%;" title="${name}">${name}</span>
                    <span class="skill-level-display" id="${uniqueId}-display" style="font-size: 0.8rem; color: var(--design-primary, #6366f1); font-weight: 700; min-width: 45px; text-align: right; background: rgba(99,102,241,0.15); padding: 2px 8px; border-radius: 4px;">${level}/${maxLevel}</span>
                </div>
                <div style="display: flex; align-items: center; gap: 8px; position: relative;">
                    <input type="range" 
                           class="skill-level-slider" 
                           id="${uniqueId}"
                           data-type="${type}" 
                           data-cat="${catIndex}" 
                           data-skill="${skillIndex}"
                           min="1" 
                           max="${maxLevel}" 
                           value="${level}"
                           style="width: 100%; height: 8px; appearance: none; -webkit-appearance: none; -moz-appearance: none; background: linear-gradient(to right, var(--design-primary, #6366f1) ${percentage}%, rgba(255,255,255,0.15) ${percentage}%); border-radius: 4px; cursor: pointer; outline: none; margin: 0; padding: 0; position: relative; z-index: 10; pointer-events: auto;">
                </div>
                ${hasExamples ? `
                    <div style="margin-top: 6px; padding-top: 6px; border-top: 1px solid rgba(255,255,255,0.05); font-size: 0.75rem; color: var(--design-text-muted, #64748b);">
                        <strong style="color: var(--design-text-secondary, #94a3b8);">Beispiele:</strong>
                        <ul style="margin: 4px 0 0 0; padding-left: 16px; list-style: disc;">
                            ${examples.map(ex => `<li>${ex}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
            </div>
        `;
    }
    
    updateSkillLevel(type, catIndex, skillIndex, newLevel) {
        // Update the actual form data
        if (type === 'tech') {
            const containers = document.querySelectorAll('#technicalSkillsContainer .skill-category-item, #technicalSkillsContainer .skill-item-rated:not(.soft)');
            let currentCatIndex = -1;
            let currentSkillIndex = -1;
            
            containers.forEach(item => {
                if (item.classList.contains('skill-category-item')) {
                    currentCatIndex++;
                    currentSkillIndex = -1;
                    
                    if (currentCatIndex === catIndex) {
                        const skillTags = item.querySelectorAll('.skill-tag');
                        if (skillTags[skillIndex]) {
                            const levelInput = skillTags[skillIndex].querySelector('input[type="range"], select[data-field="level"]');
                            if (levelInput) levelInput.value = newLevel;
                        }
                    }
                } else if (item.classList.contains('skill-item-rated')) {
                    currentSkillIndex++;
                    if (currentSkillIndex === skillIndex) {
                        const levelInput = item.querySelector('[data-field="skillLevel"]');
                        if (levelInput) levelInput.value = newLevel;
                    }
                }
            });
        } else if (type === 'soft') {
            const softSkills = document.querySelectorAll('#softSkillsContainer .skill-item-rated.soft');
            if (softSkills[skillIndex]) {
                const levelInput = softSkills[skillIndex].querySelector('[data-field="skillLevel"]');
                if (levelInput) levelInput.value = newLevel;
            }
        }
        
        // Re-render preview
        this.updatePreview();
        this.renderSkillLevelEditor();
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // PROFILE IMAGE
    // ═══════════════════════════════════════════════════════════════════════════

    setupProfileImage() {
        const showImageToggle = document.getElementById('designShowProfileImage');
        if (showImageToggle) {
            showImageToggle.checked = this.settings.showProfileImage;
            showImageToggle.addEventListener('change', (e) => {
                this.settings.showProfileImage = e.target.checked;
                this.saveSettings();
                this.updatePreview();
                this.toggleImageOptions(e.target.checked);
            });
        }
        
        const imageShapeSelect = document.getElementById('designProfileImageShape');
        if (imageShapeSelect) {
            imageShapeSelect.value = this.settings.profileImageShape || 'circle';
            imageShapeSelect.addEventListener('change', (e) => {
                this.settings.profileImageShape = e.target.value;
                this.saveSettings();
                this.updatePreview();
            });
        }
        
        const imageSizeSelect = document.getElementById('designProfileImageSize');
        if (imageSizeSelect) {
            imageSizeSelect.value = this.settings.profileImageSize || 'medium';
            imageSizeSelect.addEventListener('change', (e) => {
                this.settings.profileImageSize = e.target.value;
                this.saveSettings();
                this.updatePreview();
            });
        }
        
        const imagePositionSelect = document.getElementById('designProfileImagePosition');
        if (imagePositionSelect) {
            imagePositionSelect.value = this.settings.profileImagePosition || 'right';
            imagePositionSelect.addEventListener('change', (e) => {
                this.settings.profileImagePosition = e.target.value;
                this.saveSettings();
                this.updatePreview();
            });
        }
        
        const imageBorderSelect = document.getElementById('designProfileImageBorder');
        if (imageBorderSelect) {
            imageBorderSelect.value = this.settings.profileImageBorder || 'none';
            imageBorderSelect.addEventListener('change', (e) => {
                this.settings.profileImageBorder = e.target.value;
                this.saveSettings();
                this.updatePreview();
            });
        }
        
        // Image upload
        const imageUpload = document.getElementById('profileImageUpload');
        if (imageUpload) {
            imageUpload.addEventListener('change', (e) => {
                this.handleProfileImageUpload(e.target.files[0]);
            });
        }
        
        // Load from profile button - now shows image gallery
        const loadFromProfileBtn = document.getElementById('loadProfileImageBtn');
        if (loadFromProfileBtn) {
            loadFromProfileBtn.addEventListener('click', () => {
                this.showApplicationImagesGallery();
            });
        }
    }
    
    async showApplicationImagesGallery() {
        const gallery = document.getElementById('applicationImagesGallery');
        const imagesList = document.getElementById('applicationImagesList');
        
        if (!gallery || !imagesList) {
            // Fallback to old behavior
            this.loadProfileImageFromStorage();
            return;
        }
        
        // Toggle gallery visibility
        const isVisible = gallery.style.display !== 'none';
        if (isVisible) {
            gallery.style.display = 'none';
            return;
        }
        
        gallery.style.display = 'block';
        imagesList.innerHTML = '<p style="font-size: 0.75rem; color: var(--design-text-muted); grid-column: span 3;">Lade Bilder...</p>';
        
        // Collect all available images
        const images = [];
        
        // 1. Dashboard Photos (bewerbungsbilder)
        try {
            const dashboardPhotos = JSON.parse(localStorage.getItem('dashboard_photos') || '{}');
            if (dashboardPhotos.profileImage) {
                images.push({ url: dashboardPhotos.profileImage, label: 'Profilbild', source: 'dashboard' });
            }
            if (dashboardPhotos.bewerbungsbilder && Array.isArray(dashboardPhotos.bewerbungsbilder)) {
                dashboardPhotos.bewerbungsbilder.forEach((img, i) => {
                    images.push({ url: img, label: `Bewerbungsbild ${i + 1}`, source: 'dashboard' });
                });
            }
            // Also check for photos array
            if (dashboardPhotos.photos && Array.isArray(dashboardPhotos.photos)) {
                dashboardPhotos.photos.forEach((img, i) => {
                    if (img && !images.find(x => x.url === img)) {
                        images.push({ url: img, label: `Foto ${i + 1}`, source: 'dashboard' });
                    }
                });
            }
        } catch (e) {}
        
        // 2. User Profile images
        try {
            const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
            if (userProfile.profileImage && !images.find(x => x.url === userProfile.profileImage)) {
                images.push({ url: userProfile.profileImage, label: 'User Profil', source: 'profile' });
            }
            if (userProfile.bewerbungsbilder && Array.isArray(userProfile.bewerbungsbilder)) {
                userProfile.bewerbungsbilder.forEach((img, i) => {
                    if (!images.find(x => x.url === img)) {
                        images.push({ url: img, label: `Bild ${i + 1}`, source: 'profile' });
                    }
                });
            }
        } catch (e) {}
        
        // 3. Cloud Profile (if logged in)
        if (window.cloudDataService && window.cloudDataService.isUserLoggedIn()) {
            try {
                const cloudProfile = await window.cloudDataService.getProfile();
                if (cloudProfile?.profileImageUrl && !images.find(x => x.url === cloudProfile.profileImageUrl)) {
                    images.push({ url: cloudProfile.profileImageUrl, label: 'Cloud Profil', source: 'cloud' });
                }
                if (cloudProfile?.bewerbungsbilder && Array.isArray(cloudProfile.bewerbungsbilder)) {
                    cloudProfile.bewerbungsbilder.forEach((img, i) => {
                        if (!images.find(x => x.url === img)) {
                            images.push({ url: img, label: `Cloud Bild ${i + 1}`, source: 'cloud' });
                        }
                    });
                }
            } catch (e) {}
        }
        
        // 4. Application Manager stored images
        try {
            const appImages = JSON.parse(localStorage.getItem('application_images') || '[]');
            appImages.forEach((img, i) => {
                if (img && !images.find(x => x.url === img)) {
                    images.push({ url: img, label: `App Bild ${i + 1}`, source: 'app' });
                }
            });
        } catch (e) {}
        
        // 5. Resumes with profile images
        try {
            const resumes = JSON.parse(localStorage.getItem('user_resumes') || '[]');
            resumes.forEach((resume, i) => {
                if (resume.profileImageUrl && !images.find(x => x.url === resume.profileImageUrl)) {
                    images.push({ url: resume.profileImageUrl, label: `CV ${resume.name || i + 1}`, source: 'resume' });
                }
            });
        } catch (e) {}
        
        // 6. Cloud Photos (wenn eingeloggt)
        if (window.cloudDataService && window.cloudDataService.isUserLoggedIn()) {
            try {
                const cloudPhotos = await window.cloudDataService.getPhotos(false); // Cache nutzen
                if (Array.isArray(cloudPhotos) && cloudPhotos.length > 0) {
                    cloudPhotos.forEach((photo, i) => {
                        const photoUrl = photo.url || photo.dataUrl || photo.imageData;
                        if (photoUrl && !images.find(x => x.url === photoUrl)) {
                            images.push({ 
                                url: photoUrl, 
                                label: photo.name || photo.filename || `Cloud Foto ${i + 1}`, 
                                source: 'cloud-photos' 
                            });
                        }
                    });
                    console.log(`✅ ${cloudPhotos.length} Cloud Photos geladen`);
                }
            } catch (e) {
                console.warn('⚠️ Cloud Photos konnten nicht geladen werden:', e);
                // Fallback: Versuche localStorage
                try {
                    const localPhotos = JSON.parse(localStorage.getItem('user_photos') || '[]');
                    localPhotos.forEach((photo, i) => {
                        const photoUrl = photo.url || photo.dataUrl;
                        if (photoUrl && !images.find(x => x.url === photoUrl)) {
                            images.push({ 
                                url: photoUrl, 
                                label: photo.name || `Lokales Foto ${i + 1}`, 
                                source: 'local-photos' 
                            });
                        }
                    });
                } catch (localError) {
                    console.warn('⚠️ Auch localStorage Photos konnten nicht geladen werden:', localError);
                }
            }
        } else {
            // Fallback: localStorage Photos wenn nicht eingeloggt
            try {
                const localPhotos = JSON.parse(localStorage.getItem('user_photos') || '[]');
                localPhotos.forEach((photo, i) => {
                    const photoUrl = photo.url || photo.dataUrl;
                    if (photoUrl && !images.find(x => x.url === photoUrl)) {
                        images.push({ 
                            url: photoUrl, 
                            label: photo.name || `Lokales Foto ${i + 1}`, 
                            source: 'local-photos' 
                        });
                    }
                });
            } catch (localError) {
                console.warn('⚠️ localStorage Photos konnten nicht geladen werden:', localError);
            }
        }
        
        if (images.length === 0) {
            imagesList.innerHTML = `
                <p style="font-size: 0.75rem; color: var(--design-text-muted); grid-column: span 3; text-align: center; padding: 1rem;">
                    Keine Bewerbungsbilder gefunden.<br>
                    <small>Laden Sie ein Bild hoch oder speichern Sie Bilder im Dashboard.</small>
                </p>
            `;
            return;
        }
        
        // Render images
        imagesList.innerHTML = images.map((img, index) => `
            <div class="image-select-item" data-url="${img.url}" 
                 style="cursor: pointer; border-radius: 8px; overflow: hidden; aspect-ratio: 1; 
                        border: 2px solid transparent; transition: all 0.2s; position: relative;"
                 title="${img.label}">
                <img src="${img.url}" alt="${img.label}" 
                     style="width: 100%; height: 100%; object-fit: cover;"
                     onerror="this.parentElement.style.display='none'">
                <span style="position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.7); 
                             font-size: 0.6rem; padding: 2px 4px; color: white; text-align: center; 
                             text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">
                    ${img.label}
                </span>
            </div>
        `).join('');
        
        // Add click handlers
        imagesList.querySelectorAll('.image-select-item').forEach(item => {
            item.addEventListener('click', () => {
                const url = item.dataset.url;
                this.settings.profileImageUrl = url;
                this.settings.showProfileImage = true;
                // Reset crop settings for new image
                this.settings.profileImageZoom = 100;
                this.settings.profileImageOffsetX = 0;
                this.settings.profileImageOffsetY = 0;
                this.saveSettings();
                this.updatePreview();
                
                const toggle = document.getElementById('designShowProfileImage');
                if (toggle) toggle.checked = true;
                
                // Highlight selected
                imagesList.querySelectorAll('.image-select-item').forEach(i => {
                    i.style.borderColor = 'transparent';
                });
                item.style.borderColor = 'var(--design-primary)';
                
                this.showNotification('Bild ausgewählt', 'success');
            });
            
            // Hover effect
            item.addEventListener('mouseenter', () => {
                if (item.style.borderColor !== 'var(--design-primary)') {
                    item.style.borderColor = 'rgba(99, 102, 241, 0.5)';
                }
            });
            item.addEventListener('mouseleave', () => {
                if (item.style.borderColor !== 'var(--design-primary)') {
                    item.style.borderColor = 'transparent';
                }
            });
        });
    }
    
    toggleImageOptions(show) {
        const optionsContainer = document.getElementById('profileImageOptions');
        if (optionsContainer) {
            optionsContainer.style.display = show ? 'block' : 'none';
        }
    }
    
    async handleProfileImageUpload(file) {
        if (!file) return;
        
        if (!file.type.startsWith('image/')) {
            this.showNotification('Bitte wählen Sie eine Bilddatei', 'error');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = async (e) => {
            const dataUrl = e.target.result;
            this.settings.profileImageUrl = dataUrl;
            this.saveSettings();
            this.updatePreview();
            
            // NEU: Speichere auch in Fotos-Sektion
            let photoSaved = false;
            try {
                const photo = {
                    id: `photo_${Date.now()}`,
                    name: file.name || `Profilbild_${Date.now()}.jpg`,
                    type: file.type || 'image/jpeg',
                    size: file.size || dataUrl.length,
                    dataUrl: dataUrl,
                    url: dataUrl, // Für Kompatibilität
                    storage: 'local',
                    createdAt: new Date().toISOString()
                };
                
                console.log('📸 Speichere Foto in Fotos-Sektion...', { id: photo.id, name: photo.name, size: photo.size });
                
                if (window.cloudDataService && typeof window.cloudDataService.isUserLoggedIn === 'function' && window.cloudDataService.isUserLoggedIn()) {
                    try {
                        const result = await window.cloudDataService.savePhoto(photo);
                        if (result && (result.success || result.photo)) {
                            console.log('✅ Foto in Fotos-Sektion gespeichert (Cloud)', result);
                            photoSaved = true;
                        } else {
                            throw new Error('savePhoto() returned no success');
                        }
                    } catch (cloudError) {
                        console.warn('⚠️ Cloud-Speicherung fehlgeschlagen, verwende localStorage:', cloudError);
                        // Fallback zu localStorage
                        try {
                            let photos = JSON.parse(localStorage.getItem('user_photos') || '[]');
                            photos.unshift(photo);
                            localStorage.setItem('user_photos', JSON.stringify(photos));
                            console.log('✅ Foto in Fotos-Sektion gespeichert (localStorage)', { count: photos.length });
                            photoSaved = true;
                        } catch (localError) {
                            console.error('❌ Auch localStorage-Speicherung fehlgeschlagen:', localError);
                        }
                    }
                } else {
                    // Fallback: localStorage (auch wenn nicht eingeloggt)
                    try {
                        let photos = JSON.parse(localStorage.getItem('user_photos') || '[]');
                        photos.unshift(photo);
                        localStorage.setItem('user_photos', JSON.stringify(photos));
                        console.log('✅ Foto in Fotos-Sektion gespeichert (localStorage)', { count: photos.length });
                        photoSaved = true;
                    } catch (localError) {
                        console.error('❌ localStorage-Speicherung fehlgeschlagen:', localError);
                    }
                }
            } catch (error) {
                console.error('❌ Fehler beim Speichern des Fotos:', error);
                console.error('❌ Error Details:', { name: error.name, message: error.message, stack: error.stack });
                // Nicht kritisch - Foto ist bereits als Profilbild gespeichert
            }
            
            if (photoSaved) {
                this.showNotification('Profilbild hochgeladen und in Fotos gespeichert', 'success');
            } else {
                this.showNotification('Profilbild hochgeladen (Foto-Speicherung fehlgeschlagen)', 'warning');
            }
        };
        reader.readAsDataURL(file);
    }
    
    async loadProfileImageFromStorage() {
        try {
            let imageUrl = null;
            
            // 1. Versuche aus Cloud zu laden (falls eingeloggt)
            if (window.cloudDataService && window.cloudDataService.isUserLoggedIn()) {
                try {
                    const cloudProfile = await window.cloudDataService.getProfile();
                    if (cloudProfile?.profileImageUrl) {
                        imageUrl = cloudProfile.profileImageUrl;
                        console.log('✅ Profilbild aus Cloud geladen');
                    }
                } catch (e) {
                    console.warn('Cloud-Profilbild nicht verfügbar:', e);
                }
            }
            
            // 2. Dashboard-Bilder prüfen (photos section)
            if (!imageUrl) {
                try {
                    const dashboardPhotos = JSON.parse(localStorage.getItem('dashboard_photos') || '{}');
                    if (dashboardPhotos.profileImage) {
                        imageUrl = dashboardPhotos.profileImage;
                        console.log('✅ Profilbild aus Dashboard Photos geladen');
                    }
                } catch (e) {}
            }
            
            // 3. Fallback: localStorage bewerbungsmanager_profile
            if (!imageUrl) {
                const profile = JSON.parse(localStorage.getItem('bewerbungsmanager_profile') || '{}');
                if (profile.profileImageUrl) {
                    imageUrl = profile.profileImageUrl;
                    console.log('✅ Profilbild aus bewerbungsmanager_profile geladen');
                }
            }
            
            // 4. Fallback: userProfile im localStorage
            if (!imageUrl) {
                const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
                if (userProfile.profileImage || userProfile.profileImageUrl) {
                    imageUrl = userProfile.profileImage || userProfile.profileImageUrl;
                    console.log('✅ Profilbild aus userProfile geladen');
                }
            }
            
            // 5. Fallback: AWS S3 Profil-URL
            if (!imageUrl) {
                const s3Profile = localStorage.getItem('profile_image_s3_url');
                if (s3Profile) {
                    imageUrl = s3Profile;
                    console.log('✅ Profilbild aus S3 URL geladen');
                }
            }
            
            // 6. Fallback: Lebenslauf-Daten aus Resume Editor
            if (!imageUrl) {
                try {
                    const resumes = JSON.parse(localStorage.getItem('user_resumes') || '[]');
                    const latestResume = resumes[0];
                    if (latestResume?.profileImageUrl) {
                        imageUrl = latestResume.profileImageUrl;
                        console.log('✅ Profilbild aus letztem Lebenslauf geladen');
                    }
                } catch (e) {}
            }
            
            if (imageUrl) {
                this.settings.profileImageUrl = imageUrl;
                this.settings.showProfileImage = true;
                this.saveSettings();
                this.updatePreview();
                
                const toggle = document.getElementById('designShowProfileImage');
                if (toggle) toggle.checked = true;
                this.toggleImageOptions(true);
                
                // Update preview
                this.updateProfileImagePreview();
                
                this.showNotification('Profilbild geladen', 'success');
            } else {
                this.showNotification('Kein Profilbild gefunden. Bitte im Dashboard hochladen.', 'warning');
            }
        } catch (e) {
            console.error('Fehler beim Laden des Profilbilds:', e);
            this.showNotification('Fehler beim Laden des Profilbilds', 'error');
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // SIGNATURE
    // ═══════════════════════════════════════════════════════════════════════════

    setupSignature() {
        const showSignatureToggle = document.getElementById('designShowSignature');
        if (showSignatureToggle) {
            showSignatureToggle.checked = this.settings.showSignature;
            showSignatureToggle.addEventListener('change', (e) => {
                this.settings.showSignature = e.target.checked;
                // Also toggle signature section visibility
                const sigSection = this.sections.find(s => s.id === 'signature');
                if (sigSection) sigSection.visible = e.target.checked;
                this.saveSettings();
                this.updatePreview();
                this.toggleSignatureOptions(e.target.checked);
            });
        }
        
        const signatureUpload = document.getElementById('signatureUpload');
        if (signatureUpload) {
            signatureUpload.addEventListener('change', (e) => {
                this.handleSignatureUpload(e.target.files[0]);
            });
        }
        
        const signatureLocation = document.getElementById('designSignatureLocation');
        if (signatureLocation) {
            signatureLocation.value = this.settings.signatureLocation || '';
            signatureLocation.addEventListener('input', (e) => {
                this.settings.signatureLocation = e.target.value;
                this.saveSettings();
                this.updatePreview();
            });
        }
        
        const signatureDate = document.getElementById('designSignatureDate');
        if (signatureDate) {
            signatureDate.value = this.settings.signatureDate || '';
            signatureDate.addEventListener('input', (e) => {
                this.settings.signatureDate = e.target.value;
                this.saveSettings();
                this.updatePreview();
            });
        }
        
        const signatureLine = document.getElementById('designSignatureLine');
        if (signatureLine) {
            signatureLine.checked = this.settings.signatureLine !== false;
            signatureLine.addEventListener('change', (e) => {
                this.settings.signatureLine = e.target.checked;
                this.saveSettings();
                this.updatePreview();
            });
        }
        
        // Auto-fill date button
        const autoDateBtn = document.getElementById('autoFillDateBtn');
        if (autoDateBtn) {
            autoDateBtn.addEventListener('click', () => {
                const today = new Date().toLocaleDateString('de-DE', { 
                    day: '2-digit', month: 'long', year: 'numeric' 
                });
                this.settings.signatureDate = today;
                if (signatureDate) signatureDate.value = today;
                this.saveSettings();
                this.updatePreview();
            });
        }
        
        // Signature Skew (Schrägheit)
        const signatureSkewSlider = document.getElementById('signatureSkew');
        if (signatureSkewSlider) {
            signatureSkewSlider.value = this.settings.signatureSkew || 0;
            const skewValueEl = document.getElementById('signatureSkewValue');
            if (skewValueEl) skewValueEl.textContent = (this.settings.signatureSkew || 0) + '°';
            signatureSkewSlider.addEventListener('input', (e) => {
                this.settings.signatureSkew = parseInt(e.target.value);
                if (skewValueEl) skewValueEl.textContent = this.settings.signatureSkew + '°';
                this.saveSettings();
                this.updatePreview();
            });
        }
        
        // Signature Line Width (Liniendicke)
        const signatureLineWidthSlider = document.getElementById('signatureLineWidth');
        if (signatureLineWidthSlider) {
            signatureLineWidthSlider.value = this.settings.signatureLineWidth || 1;
            const lineWidthValueEl = document.getElementById('signatureLineWidthValue');
            if (lineWidthValueEl) lineWidthValueEl.textContent = (this.settings.signatureLineWidth || 1) + 'px';
            signatureLineWidthSlider.addEventListener('input', (e) => {
                this.settings.signatureLineWidth = parseInt(e.target.value);
                if (lineWidthValueEl) lineWidthValueEl.textContent = this.settings.signatureLineWidth + 'px';
                this.saveSettings();
                this.updatePreview();
            });
        }
        
        // Signature Line Color (Linienfarbe)
        const signatureLineColorPicker = document.getElementById('signatureLineColor');
        const signatureLineColorHex = document.getElementById('signatureLineColorHex');
        if (signatureLineColorPicker) {
            const defaultColor = this.settings.signatureLineColor || this.settings.textColor || '#64748b';
            signatureLineColorPicker.value = defaultColor;
            if (signatureLineColorHex) signatureLineColorHex.value = defaultColor;
            
            signatureLineColorPicker.addEventListener('input', (e) => {
                const value = e.target.value;
                this.settings.signatureLineColor = value;
                if (signatureLineColorHex) signatureLineColorHex.value = value;
                this.saveSettings();
                this.updatePreview();
            });
        }
        
        if (signatureLineColorHex) {
            signatureLineColorHex.addEventListener('input', (e) => {
                let value = e.target.value.trim();
                if (!value.startsWith('#')) value = '#' + value;
                if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
                    this.settings.signatureLineColor = value;
                    if (signatureLineColorPicker) signatureLineColorPicker.value = value;
                    this.saveSettings();
                    this.updatePreview();
                } else {
                    console.warn('⚠️ Ungültige Hex-Farbe:', value);
                }
            });
        }
    }
    
    toggleSignatureOptions(show) {
        const optionsContainer = document.getElementById('signatureOptions');
        if (optionsContainer) {
            optionsContainer.style.display = show ? 'block' : 'none';
        }
    }
    
    handleSignatureUpload(file) {
        if (!file) return;
        
        if (!file.type.startsWith('image/')) {
            this.showNotification('Bitte wählen Sie eine Bilddatei (PNG empfohlen)', 'error');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            // Automatisch weißen/hellen Hintergrund entfernen
            this.removeSignatureBackground(e.target.result).then(transparentImage => {
                this.settings.signatureImage = transparentImage;
                this.saveSettings();
                this.updatePreview();
                this.showNotification('Unterschrift hochgeladen & freigestellt', 'success');
                
                // Show preview
                const preview = document.getElementById('signaturePreview');
                if (preview) {
                    preview.innerHTML = `<img src="${transparentImage}" alt="Unterschrift" style="max-height: 60px; background: repeating-conic-gradient(#f0f0f0 0% 25%, transparent 0% 50%) 50% / 10px 10px;">`;
                }
            }).catch(() => {
                // Fallback ohne Freistellung
                this.settings.signatureImage = e.target.result;
                this.saveSettings();
                this.updatePreview();
                this.showNotification('Unterschrift hochgeladen', 'success');
            });
        };
        reader.readAsDataURL(file);
    }
    
    /**
     * Entfernt weißen/hellen Hintergrund von Unterschriften
     * Macht helle Pixel transparent
     */
    removeSignatureBackground(imageDataUrl) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = img.width;
                canvas.height = img.height;
                
                ctx.drawImage(img, 0, 0);
                
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;
                
                // Threshold für "weiß" (0-255, höher = mehr wird transparent)
                const threshold = 240;
                
                for (let i = 0; i < data.length; i += 4) {
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];
                    
                    // Prüfe ob Pixel hell genug ist (nahe weiß)
                    if (r > threshold && g > threshold && b > threshold) {
                        // Mache Pixel transparent
                        data[i + 3] = 0;
                    } else if (r > 200 && g > 200 && b > 200) {
                        // Semi-transparent für leicht graue Pixel
                        const brightness = (r + g + b) / 3;
                        data[i + 3] = Math.max(0, 255 - (brightness - 200) * 5);
                    }
                }
                
                ctx.putImageData(imageData, 0, 0);
                resolve(canvas.toDataURL('image/png'));
            };
            img.onerror = reject;
            img.src = imageDataUrl;
        });
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // PAGE NUMBERS
    // ═══════════════════════════════════════════════════════════════════════════

    setupPageNumbers() {
        const showPageNumbersToggle = document.getElementById('designShowPageNumbers');
        if (showPageNumbersToggle) {
            showPageNumbersToggle.checked = this.settings.showPageNumbers;
            showPageNumbersToggle.addEventListener('change', (e) => {
                this.settings.showPageNumbers = e.target.checked;
                this.saveSettings();
                this.updatePreview();
                this.togglePageNumberOptions(e.target.checked);
            });
        }
        
        const pageNumberPosition = document.getElementById('designPageNumberPosition');
        if (pageNumberPosition) {
            pageNumberPosition.value = this.settings.pageNumberPosition || 'bottom-center';
            pageNumberPosition.addEventListener('change', (e) => {
                this.settings.pageNumberPosition = e.target.value;
                this.saveSettings();
                this.updatePreview();
            });
        }
        
        const pageNumberFormat = document.getElementById('designPageNumberFormat');
        if (pageNumberFormat) {
            pageNumberFormat.value = this.settings.pageNumberFormat || 'Seite X von Y';
            pageNumberFormat.addEventListener('change', (e) => {
                this.settings.pageNumberFormat = e.target.value;
                this.saveSettings();
                this.updatePreview();
            });
        }
    }
    
    togglePageNumberOptions(show) {
        const optionsContainer = document.getElementById('pageNumberOptions');
        if (optionsContainer) {
            optionsContainer.style.display = show ? 'block' : 'none';
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // HEADER FIELDS SETTINGS
    // ═══════════════════════════════════════════════════════════════════════════

    setupHeaderFields() {
        // Initialisiere Standardwerte falls nicht vorhanden
        if (!this.settings.showHeaderField) {
            this.settings.showHeaderField = {
                phone: true,
                email: true,
                location: true,
                address: true,
                linkedin: true,
                github: true,
                website: true,
                birthDate: true
            };
        }
        
        // Setup Event Listeners für alle Header-Feld-Checkboxen
        const fieldMap = {
            'headerFieldPhone': 'phone',
            'headerFieldEmail': 'email',
            'headerFieldLocation': 'location',
            'headerFieldAddress': 'address',
            'headerFieldLinkedIn': 'linkedin',
            'headerFieldGitHub': 'github',
            'headerFieldWebsite': 'website',
            'headerFieldBirthDate': 'birthDate'
        };
        
        Object.entries(fieldMap).forEach(([checkboxId, fieldKey]) => {
            const checkbox = document.getElementById(checkboxId);
            if (checkbox) {
                // Setze initialen Wert aus Settings
                checkbox.checked = this.settings.showHeaderField && this.settings.showHeaderField[fieldKey] !== false;
                
                // Event Listener für Änderungen
                checkbox.addEventListener('change', (e) => {
                    this.settings.showHeaderField[fieldKey] = e.target.checked;
                    this.saveSettings();
                    this.updatePreview();
                });
            }
        });
    }

    setupResumeTitlePosition() {
        const positionSelect = document.getElementById('designResumeTitlePosition');
        if (positionSelect) {
            positionSelect.value = this.settings.resumeTitlePosition || 'above-image';
            positionSelect.addEventListener('change', (e) => {
                this.settings.resumeTitlePosition = e.target.value;
                this.saveSettings();
                this.updatePreview();
            });
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // LANGUAGE SETTINGS
    // ═══════════════════════════════════════════════════════════════════════════

    setupLanguage() {
        // Initialisiere Standardwerte
        if (!this.settings.language) {
            this.settings.language = 'de';
        }
        if (!this.settings.translations) {
            this.settings.translations = {};
        }
        
        // Language Toggle Buttons
        const btnDE = document.getElementById('languageToggleDE');
        const btnEN = document.getElementById('languageToggleEN');
        
        const updateLanguageButtons = () => {
            if (btnDE && btnEN) {
                btnDE.classList.toggle('active', this.settings.language === 'de');
                btnEN.classList.toggle('active', this.settings.language === 'en');
                btnDE.style.background = this.settings.language === 'de' ? 'var(--design-accent)' : '';
                btnDE.style.color = this.settings.language === 'de' ? 'white' : '';
                btnEN.style.background = this.settings.language === 'en' ? 'var(--design-accent)' : '';
                btnEN.style.color = this.settings.language === 'en' ? 'white' : '';
            }
        };
        
        if (btnDE) {
            btnDE.addEventListener('click', () => {
                this.settings.language = 'de';
                updateLanguageButtons();
                this.saveSettings();
                this.updatePreview();
            });
        }
        
        if (btnEN) {
            btnEN.addEventListener('click', () => {
                this.settings.language = 'en';
                updateLanguageButtons();
                this.saveSettings();
                this.updatePreview();
            });
        }
        
        updateLanguageButtons();
        this.renderCustomTranslations();
        
        // Add Custom Translation Button
        const addBtn = document.getElementById('addCustomTranslation');
        if (addBtn) {
            addBtn.addEventListener('click', () => {
                this.addCustomTranslationRow();
            });
        }
    }
    
    // Übersetzungs-Mapping
    getTranslations() {
        const translations = {
            de: {
                'Lebenslauf': 'Lebenslauf',
                'Berufserfahrung': 'Berufserfahrung',
                'Ausbildung': 'Ausbildung',
                'Fähigkeiten': 'Fähigkeiten',
                'Technische Fähigkeiten': 'Technische Fähigkeiten',
                'Soft Skills': 'Soft Skills',
                'Sprachen': 'Sprachen',
                'Projekte': 'Projekte',
                'Referenzen': 'Referenzen',
                'Kurzprofil': 'Kurzprofil',
                'Geboren am': 'Geboren am',
                'Zertifikate': 'Zertifikate',
                'Hobbys': 'Hobbys',
                'heute': 'heute',
                'Auf Anfrage': 'Auf Anfrage'
            },
            en: {
                'Lebenslauf': 'Resume',
                'Berufserfahrung': 'Work Experience',
                'Ausbildung': 'Education',
                'Fähigkeiten': 'Skills',
                'Technische Fähigkeiten': 'Technical Skills',
                'Soft Skills': 'Soft Skills',
                'Sprachen': 'Languages',
                'Projekte': 'Projects',
                'Referenzen': 'References',
                'Kurzprofil': 'Summary',
                'Geboren am': 'Date of Birth',
                'Zertifikate': 'Certifications',
                'Hobbys': 'Hobbies',
                'heute': 'present',
                'Auf Anfrage': 'Upon request'
            }
        };
        
        // Merge mit benutzerdefinierten Übersetzungen
        const custom = this.settings.translations || {};
        const base = translations[this.settings.language] || translations.de;
        
        return { ...base, ...custom };
    }
    
    translate(key) {
        const translations = this.getTranslations();
        return translations[key] || key;
    }
    
    renderCustomTranslations() {
        const container = document.getElementById('customTranslationsList');
        if (!container) return;
        
        const translations = this.settings.translations || {};
        const entries = Object.entries(translations);
        
        if (entries.length === 0) {
            container.innerHTML = '<p style="font-size: 0.75rem; color: var(--design-text-muted);">Keine eigenen Übersetzungen</p>';
            return;
        }
        
        container.innerHTML = entries.map(([key, value]) => `
            <div class="custom-translation-row" style="display: flex; gap: 8px; margin-bottom: 8px; align-items: center;">
                <input type="text" class="design-input" value="${key}" placeholder="Original" 
                       data-translation-key="${key}" style="flex: 1; font-size: 0.85rem;">
                <span style="color: var(--design-text-muted);">→</span>
                <input type="text" class="design-input" value="${value}" placeholder="Übersetzung" 
                       data-translation-value="${key}" style="flex: 1; font-size: 0.85rem;">
                <button type="button" class="design-action-btn" style="padding: 6px 10px;" 
                        onclick="window.designEditor?.removeCustomTranslation('${key}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');
        
        // Event Listeners für Inputs
        container.querySelectorAll('input[data-translation-key]').forEach(input => {
            input.addEventListener('change', (e) => {
                const oldKey = e.target.dataset.translationKey;
                const newKey = e.target.value.trim();
                const valueInput = container.querySelector(`input[data-translation-value="${oldKey}"]`);
                const value = valueInput?.value || '';
                
                if (oldKey !== newKey) {
                    delete this.settings.translations[oldKey];
                }
                if (newKey && value) {
                    this.settings.translations[newKey] = value;
                }
                this.saveSettings();
                this.renderCustomTranslations();
                this.updatePreview();
            });
        });
        
        container.querySelectorAll('input[data-translation-value]').forEach(input => {
            input.addEventListener('change', (e) => {
                const key = e.target.dataset.translationValue;
                const value = e.target.value.trim();
                if (key) {
                    this.settings.translations[key] = value;
                    this.saveSettings();
                    this.updatePreview();
                }
            });
        });
    }
    
    addCustomTranslationRow() {
        if (!this.settings.translations) {
            this.settings.translations = {};
        }
        // Füge einen temporären Eintrag hinzu
        const tempKey = 'Neuer Titel ' + (Object.keys(this.settings.translations).length + 1);
        this.settings.translations[tempKey] = '';
        this.renderCustomTranslations();
    }
    
    removeCustomTranslation(key) {
        if (this.settings.translations && this.settings.translations.hasOwnProperty(key)) {
            delete this.settings.translations[key];
            this.saveSettings();
            this.renderCustomTranslations();
            this.updatePreview();
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // REFERENCES DATA
    // ═══════════════════════════════════════════════════════════════════════════

    getReferencesData() {
        const container = document.getElementById('referencesContainer');
        if (!container) return [];
        
        const items = [];
        container.querySelectorAll('.reference-item, .entry-item').forEach(item => {
            items.push({
                name: item.querySelector('[data-field="name"]')?.value || '',
                position: item.querySelector('[data-field="position"]')?.value || '',
                company: item.querySelector('[data-field="company"]')?.value || '',
                email: item.querySelector('[data-field="email"]')?.value || '',
                phone: item.querySelector('[data-field="phone"]')?.value || ''
            });
        });
        
        return items;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // DATE FORMAT SETTINGS
    // ═══════════════════════════════════════════════════════════════════════════

    setupDateFormat() {
        const dateFormat = document.getElementById('designDateFormat');
        const dateSeparator = document.getElementById('designDateSeparator');
        const dateCurrent = document.getElementById('designDateCurrent');
        
        const updatePreview = () => {
            const previewEl = document.getElementById('dateFormatPreview');
            if (previewEl) {
                const format = this.settings.dateFormat || 'MM.YYYY';
                const sep = this.settings.dateSeparator || ' - ';
                const current = this.settings.dateCurrent || 'heute';
                previewEl.textContent = this.formatDateExample(format) + sep + current;
            }
            this.saveSettings();
            this.updatePreview();
        };
        
        if (dateFormat) {
            dateFormat.value = this.settings.dateFormat || 'MM.YYYY';
            dateFormat.addEventListener('change', (e) => {
                this.settings.dateFormat = e.target.value;
                updatePreview();
            });
        }
        
        if (dateSeparator) {
            dateSeparator.value = this.settings.dateSeparator || ' - ';
            dateSeparator.addEventListener('change', (e) => {
                this.settings.dateSeparator = e.target.value;
                updatePreview();
            });
        }
        
        if (dateCurrent) {
            dateCurrent.value = this.settings.dateCurrent || 'heute';
            dateCurrent.addEventListener('change', (e) => {
                this.settings.dateCurrent = e.target.value;
                updatePreview();
            });
        }
        
        // Initial preview
        const previewEl = document.getElementById('dateFormatPreview');
        if (previewEl) {
            const format = this.settings.dateFormat || 'MM.YYYY';
            const sep = this.settings.dateSeparator || ' - ';
            const current = this.settings.dateCurrent || 'heute';
            previewEl.textContent = this.formatDateExample(format) + sep + current;
        }
    }
    
    formatDateExample(format) {
        const now = new Date();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const year = now.getFullYear();
        const monthNames = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 
                           'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
        const monthShort = ['Jan.', 'Feb.', 'März', 'Apr.', 'Mai', 'Juni', 
                           'Juli', 'Aug.', 'Sep.', 'Okt.', 'Nov.', 'Dez.'];
        
        switch(format) {
            case 'MM.YYYY': return `${month}.${year}`;
            case 'MM/YYYY': return `${month}/${year}`;
            case 'MMMM YYYY': return `${monthNames[now.getMonth()]} ${year}`;
            case 'MMM YYYY': return `${monthShort[now.getMonth()]} ${year}`;
            case 'YYYY': return `${year}`;
            default: return `${month}.${year}`;
        }
    }
    
    /**
     * Formatiert ein Datum gemäß den aktuellen Einstellungen
     */
    formatDate(dateStr, isCurrent = false) {
        if (!dateStr && isCurrent) {
            return this.settings.dateCurrent || 'heute';
        }
        if (!dateStr) return '';
        
        // Parse YYYY-MM format
        const match = dateStr.match(/^(\d{4})-(\d{2})$/);
        if (!match) return dateStr;
        
        const year = match[1];
        const month = match[2];
        const monthNum = parseInt(month) - 1;
        
        const monthNames = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 
                           'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
        const monthShort = ['Jan.', 'Feb.', 'März', 'Apr.', 'Mai', 'Juni', 
                           'Juli', 'Aug.', 'Sep.', 'Okt.', 'Nov.', 'Dez.'];
        
        const format = this.settings.dateFormat || 'MM.YYYY';
        
        switch(format) {
            case 'MM.YYYY': return `${month}.${year}`;
            case 'MM/YYYY': return `${month}/${year}`;
            case 'MMMM YYYY': return `${monthNames[monthNum]} ${year}`;
            case 'MMM YYYY': return `${monthShort[monthNum]} ${year}`;
            case 'YYYY': return year;
            default: return `${month}.${year}`;
        }
    }
    
    formatDateRange(startDate, endDate, isCurrent = false) {
        const start = this.formatDate(startDate);
        const end = isCurrent ? (this.settings.dateCurrent || 'heute') : this.formatDate(endDate);
        const sep = this.settings.dateSeparator || ' - ';
        return start + sep + end;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // IMAGE CROP SETTINGS
    // ═══════════════════════════════════════════════════════════════════════════

    setupImageCrop() {
        const zoomSlider = document.getElementById('profileImageZoom');
        const offsetXSlider = document.getElementById('profileImageOffsetX');
        const offsetYSlider = document.getElementById('profileImageOffsetY');
        const resetBtn = document.getElementById('resetImageCropBtn');
        
        const updateCrop = () => {
            this.saveSettings();
            this.updatePreview();
            this.updateProfileImagePreview();
        };
        
        if (zoomSlider) {
            zoomSlider.value = this.settings.profileImageZoom || 100;
            document.getElementById('zoomValue').textContent = zoomSlider.value + '%';
            zoomSlider.addEventListener('input', (e) => {
                this.settings.profileImageZoom = parseInt(e.target.value);
                updateCrop();
            });
        }
        
        if (offsetXSlider) {
            offsetXSlider.value = this.settings.profileImageOffsetX || 0;
            const offsetXValueEl = document.getElementById('offsetXValue');
            if (offsetXValueEl) offsetXValueEl.textContent = (this.settings.profileImageOffsetX || 0) + '%';
            offsetXSlider.addEventListener('input', (e) => {
                const value = parseInt(e.target.value) || 0;
                this.settings.profileImageOffsetX = value;
                if (offsetXValueEl) offsetXValueEl.textContent = value + '%';
                updateCrop();
            });
        }
        
        if (offsetYSlider) {
            offsetYSlider.value = this.settings.profileImageOffsetY || 0;
            const offsetYValueEl = document.getElementById('offsetYValue');
            if (offsetYValueEl) offsetYValueEl.textContent = (this.settings.profileImageOffsetY || 0) + '%';
            offsetYSlider.addEventListener('input', (e) => {
                const value = parseInt(e.target.value) || 0;
                this.settings.profileImageOffsetY = value;
                if (offsetYValueEl) offsetYValueEl.textContent = value + '%';
                updateCrop();
            });
        }
        
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.settings.profileImageZoom = 100;
                this.settings.profileImageOffsetX = 0;
                this.settings.profileImageOffsetY = 0;
                
                if (zoomSlider) { zoomSlider.value = 100; document.getElementById('zoomValue').textContent = '100%'; }
                if (offsetXSlider) { offsetXSlider.value = 0; document.getElementById('offsetXValue').textContent = '0%'; }
                if (offsetYSlider) { offsetYSlider.value = 0; document.getElementById('offsetYValue').textContent = '0%'; }
                
                updateCrop();
            });
        }
    }
    
    updateProfileImagePreview() {
        const preview = document.getElementById('profileImagePreview');
        if (!preview || !this.settings.profileImageUrl) return;
        
        const zoom = this.settings.profileImageZoom || 100;
        const offsetX = this.settings.profileImageOffsetX || 0;
        const offsetY = this.settings.profileImageOffsetY || 0;
        const zoomFactor = zoom / 100;
        // Object-position: 50% = zentriert, offsetX/Y sind Prozentpunkte (-50 bis +50)
        // Konvertiere zu 0-100% Skala: 50% + offsetX% = final position
        const posX = Math.max(0, Math.min(100, 50 + (offsetX || 0)));
        const posY = Math.max(0, Math.min(100, 50 + (offsetY || 0)));
        
        preview.innerHTML = `
            <div style="width: 100px; height: 100px; overflow: hidden; border-radius: ${this.settings.profileImageShape === 'circle' ? '50%' : '8px'}; margin: 0 auto; background: #f1f5f9;">
                <img src="${this.settings.profileImageUrl}" style="
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    object-position: ${posX}% ${posY}%;
                    transform: scale(${zoomFactor});
                ">
            </div>
        `;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // COMPANY LOGO SETTINGS
    // ═══════════════════════════════════════════════════════════════════════════

    setupCompanyLogo() {
        const showToggle = document.getElementById('designShowCompanyLogo');
        const uploadInput = document.getElementById('companyLogoUpload');
        const positionSelect = document.getElementById('designCompanyLogoPosition');
        const sizeSelect = document.getElementById('designCompanyLogoSize');
        
        if (showToggle) {
            showToggle.checked = this.settings.showCompanyLogo || false;
            showToggle.addEventListener('change', (e) => {
                this.settings.showCompanyLogo = e.target.checked;
                this.toggleCompanyLogoOptions(e.target.checked);
                this.saveSettings();
                this.updatePreview();
            });
            this.toggleCompanyLogoOptions(showToggle.checked);
        }
        
        if (uploadInput) {
            uploadInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        this.settings.companyLogoUrl = event.target.result;
                        this.showCompanyLogoPreview(event.target.result);
                        this.saveSettings();
                        this.updatePreview();
                    };
                    reader.readAsDataURL(file);
                }
            });
        }
        
        if (positionSelect) {
            positionSelect.value = this.settings.companyLogoPosition || 'top-right';
            positionSelect.addEventListener('change', (e) => {
                this.settings.companyLogoPosition = e.target.value;
                this.saveSettings();
                this.updatePreview();
            });
        }
        
        if (sizeSelect) {
            sizeSelect.value = this.settings.companyLogoSize || 'medium';
            sizeSelect.addEventListener('change', (e) => {
                this.settings.companyLogoSize = e.target.value;
                this.saveSettings();
                this.updatePreview();
            });
        }
        
        // Load existing logo
        if (this.settings.companyLogoUrl) {
            this.showCompanyLogoPreview(this.settings.companyLogoUrl);
        }
    }
    
    toggleCompanyLogoOptions(show) {
        const options = document.getElementById('companyLogoOptions');
        if (options) {
            options.style.display = show ? 'block' : 'none';
        }
    }
    
    showCompanyLogoPreview(dataUrl) {
        const preview = document.getElementById('companyLogoPreview');
        if (preview) {
            preview.innerHTML = `<img src="${dataUrl}" alt="Firmenlogo" style="max-height: 60px;">`;
        }
    }
    
    renderCompanyLogo() {
        if (!this.settings.showCompanyLogo || !this.settings.companyLogoUrl) return '';
        
        const position = this.settings.companyLogoPosition || 'top-right';
        const size = this.settings.companyLogoSize || 'medium';
        
        const sizeMap = {
            small: '40px',
            medium: '60px',
            large: '80px'
        };
        const maxHeight = sizeMap[size];
        
        const positionStyles = {
            'top-left': 'position: absolute; top: 15mm; left: 15mm;',
            'top-right': 'position: absolute; top: 15mm; right: 15mm;',
            'bottom-right': 'position: absolute; bottom: 15mm; right: 15mm;'
        };
        
        return `
            <div class="resume-company-logo-overlay" style="${positionStyles[position]} z-index: 100;">
                <img src="${this.settings.companyLogoUrl}" alt="Firmenlogo" style="max-height: ${maxHeight}; max-width: 100px; object-fit: contain;">
            </div>
        `;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // SIGNATURE EXTENDED SETTINGS
    // ═══════════════════════════════════════════════════════════════════════════

    setupSignatureExtended() {
        const positionSelect = document.getElementById('designSignaturePosition');
        const widthSlider = document.getElementById('signatureWidth');
        const customXSlider = document.getElementById('signatureCustomX');
        const customYSlider = document.getElementById('signatureCustomY');
        
        if (positionSelect) {
            positionSelect.value = this.settings.signaturePosition || 'bottom-right';
            positionSelect.addEventListener('change', (e) => {
                this.settings.signaturePosition = e.target.value;
                this.toggleCustomSignaturePosition(e.target.value === 'custom');
                this.saveSettings();
                this.updatePreview();
            });
            this.toggleCustomSignaturePosition(positionSelect.value === 'custom');
        }
        
        if (widthSlider) {
            widthSlider.value = this.settings.signatureWidth || 150;
            document.getElementById('signatureWidthValue').textContent = widthSlider.value + 'px';
            widthSlider.addEventListener('input', (e) => {
                this.settings.signatureWidth = parseInt(e.target.value);
                document.getElementById('signatureWidthValue').textContent = e.target.value + 'px';
                this.saveSettings();
                this.updatePreview();
            });
        }
        
        if (customXSlider) {
            customXSlider.value = this.settings.signatureCustomX || 70;
            document.getElementById('signatureXValue').textContent = customXSlider.value + '%';
            customXSlider.addEventListener('input', (e) => {
                this.settings.signatureCustomX = parseInt(e.target.value);
                document.getElementById('signatureXValue').textContent = e.target.value + '%';
                this.saveSettings();
                this.updatePreview();
            });
        }
        
        if (customYSlider) {
            customYSlider.value = this.settings.signatureCustomY || 90;
            document.getElementById('signatureYValue').textContent = customYSlider.value + '%';
            customYSlider.addEventListener('input', (e) => {
                this.settings.signatureCustomY = parseInt(e.target.value);
                document.getElementById('signatureYValue').textContent = e.target.value + '%';
                this.saveSettings();
                this.updatePreview();
            });
        }
        
        // Setup signature image extraction (remove background)
        this.setupSignatureExtraction();
    }
    
    toggleCustomSignaturePosition(show) {
        const customOptions = document.getElementById('customSignaturePosition');
        if (customOptions) {
            customOptions.style.display = show ? 'block' : 'none';
        }
    }
    
    /**
     * Setup Drag & Drop für Unterschrift im Preview
     * Richtet Unterschrift auf Linie aus
     */
    setupSignatureDragDrop() {
        const preview = document.querySelector('.design-resume-preview');
        if (!preview) return;
        
        const signatureImageContainer = preview.querySelector('.signature-draggable');
        if (!signatureImageContainer || !this.settings.signatureImage) return;
        
        // Entferne alte Event-Listener (falls vorhanden)
        const newContainer = signatureImageContainer.cloneNode(true);
        signatureImageContainer.parentNode.replaceChild(newContainer, signatureImageContainer);
        
        let isDragging = false;
        let startX, startY, initialX, initialY;
        
        // Initialisiere Position aus Settings
        if (this.settings.signatureCustomX !== undefined && this.settings.signatureCustomY !== undefined) {
            newContainer.style.position = 'absolute';
            newContainer.style.left = `${this.settings.signatureCustomX}%`;
            newContainer.style.top = `${this.settings.signatureCustomY}%`;
        }
        
        // Maus-Events
        newContainer.addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            
            const rect = newContainer.getBoundingClientRect();
            initialX = rect.left;
            initialY = rect.top;
            
            newContainer.style.cursor = 'grabbing';
            newContainer.style.opacity = '0.8';
            e.preventDefault();
        });
        
        const handleMouseMove = (e) => {
            if (!isDragging) return;
            
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;
            
            const newX = initialX + deltaX;
            const newY = initialY + deltaY;
            
            newContainer.style.position = 'absolute';
            newContainer.style.left = `${newX}px`;
            newContainer.style.top = `${newY}px`;
        };
        
        const handleMouseUp = () => {
            if (!isDragging) return;
            isDragging = false;
            
            newContainer.style.cursor = 'move';
            newContainer.style.opacity = '1';
            
            const previewRect = preview.getBoundingClientRect();
            const containerRect = newContainer.getBoundingClientRect();
            const relativeX = containerRect.left - previewRect.left;
            const relativeY = containerRect.top - previewRect.top;
            
            // Finde Unterschriftenlinie und richte Y-Position darauf aus
            const signatureLine = preview.querySelector('.resume-signature-line');
            if (signatureLine) {
                const lineRect = signatureLine.getBoundingClientRect();
                const lineRelativeY = lineRect.top - previewRect.top;
                // Setze Unterschrift genau auf Linie (Y-Position = Linien-Y - Bildhöhe)
                const adjustedY = lineRelativeY - containerRect.height;
                
                // Konvertiere zu Prozent für Settings
                const previewWidth = previewRect.width;
                const previewHeight = preview.offsetHeight;
                const customX = (relativeX / previewWidth) * 100;
                const customY = (adjustedY / previewHeight) * 100;
                
                this.settings.signatureCustomX = Math.max(0, Math.min(100, customX));
                this.settings.signatureCustomY = Math.max(0, Math.min(100, customY));
                this.settings.signaturePosition = 'custom';
                
                newContainer.style.top = `${adjustedY}px`;
                newContainer.style.left = `${relativeX}px`;
                
                console.log('✅ Unterschrift auf Linie ausgerichtet:', { x: this.settings.signatureCustomX, y: this.settings.signatureCustomY });
            } else {
                // Keine Linie gefunden - speichere absolute Position
                const previewWidth = previewRect.width;
                const previewHeight = preview.offsetHeight;
                const customX = (relativeX / previewWidth) * 100;
                const customY = (relativeY / previewHeight) * 100;
                
                this.settings.signatureCustomX = Math.max(0, Math.min(100, customX));
                this.settings.signatureCustomY = Math.max(0, Math.min(100, customY));
                this.settings.signaturePosition = 'custom';
                
                console.log('✅ Unterschrift positioniert:', { x: this.settings.signatureCustomX, y: this.settings.signatureCustomY });
            }
            
            // Aktualisiere UI
            const positionSelect = document.getElementById('designSignaturePosition');
            if (positionSelect) positionSelect.value = 'custom';
            const customXSlider = document.getElementById('signatureCustomX');
            if (customXSlider) {
                customXSlider.value = this.settings.signatureCustomX;
                const xValueEl = document.getElementById('signatureXValue');
                if (xValueEl) xValueEl.textContent = Math.round(this.settings.signatureCustomX) + '%';
            }
            const customYSlider = document.getElementById('signatureCustomY');
            if (customYSlider) {
                customYSlider.value = this.settings.signatureCustomY;
                const yValueEl = document.getElementById('signatureYValue');
                if (yValueEl) yValueEl.textContent = Math.round(this.settings.signatureCustomY) + '%';
            }
            
            this.saveSettings();
            this.updatePreview(); // Re-render mit neuen Positionen
        };
        
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        
        // Cleanup bei nächstem Preview-Update (wird automatisch durch replaceChild gemacht)
    }
    
    setupSignatureExtraction() {
        const signaturePreview = document.getElementById('signaturePreview');
        
        // Load existing signature into preview if available
        if (signaturePreview && this.settings.signatureImage) {
            signaturePreview.innerHTML = `<img src="${this.settings.signatureImage}" alt="Unterschrift" style="max-width: 100%; max-height: 80px;">`;
        }
        
        // Make signature preview a drop zone
        if (signaturePreview) {
            signaturePreview.addEventListener('dragover', (e) => {
                e.preventDefault();
                signaturePreview.classList.add('dragging');
            });
            
            signaturePreview.addEventListener('dragleave', () => {
                signaturePreview.classList.remove('dragging');
            });
            
            signaturePreview.addEventListener('drop', (e) => {
                e.preventDefault();
                signaturePreview.classList.remove('dragging');
                
                const files = e.dataTransfer.files;
                if (files.length > 0 && files[0].type.startsWith('image/')) {
                    this.processSignatureImage(files[0]);
                }
            });
        }
        
        // Setup signature tabs, canvas, and generator
        this.setupSignatureTabs();
        this.setupSignatureCanvas();
        this.setupSignatureGenerator();
    }
    
    processSignatureImage(file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                // Create canvas for background removal
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                
                ctx.drawImage(img, 0, 0);
                
                // Get image data for processing
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;
                
                // Simple background removal: make white/light pixels transparent
                for (let i = 0; i < data.length; i += 4) {
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];
                    
                    // Calculate brightness
                    const brightness = (r + g + b) / 3;
                    
                    // If pixel is light (likely background), make it transparent
                    if (brightness > 220) {
                        data[i + 3] = 0; // Set alpha to 0
                    } else if (brightness > 180) {
                        // Partially transparent for gray edges
                        data[i + 3] = Math.round(255 * (1 - (brightness - 180) / 40));
                    }
                }
                
                ctx.putImageData(imageData, 0, 0);
                
                // Convert to base64
                const processedDataUrl = canvas.toDataURL('image/png');
                this.settings.signatureImage = processedDataUrl;
                
                // Update preview
                const preview = document.getElementById('signaturePreview');
                if (preview) {
                    preview.innerHTML = `<img src="${processedDataUrl}" alt="Unterschrift" style="max-width: 100%; max-height: 80px;">`;
                }
                
                this.saveSettings();
                this.updatePreview();
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }
    
    setupSignatureTabs() {
        const tabs = document.querySelectorAll('.signature-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Remove active from all tabs
                tabs.forEach(t => {
                    t.classList.remove('active');
                    t.style.background = 'transparent';
                    t.style.color = 'var(--design-text-muted)';
                });
                // Add active to clicked tab
                tab.classList.add('active');
                tab.style.background = 'var(--design-primary)';
                tab.style.color = 'white';
                
                // Hide all tab contents
                document.querySelectorAll('.signature-tab-content').forEach(c => c.style.display = 'none');
                
                // Show selected tab content
                const tabId = tab.dataset.tab;
                const content = document.getElementById(`signatureTab${tabId.charAt(0).toUpperCase() + tabId.slice(1)}`);
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
        
        // Configure canvas
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        const getPos = (e) => {
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
            isDrawing = true;
            const pos = getPos(e);
            lastX = pos.x;
            lastY = pos.y;
        };
        
        const draw = (e) => {
            if (!isDrawing) return;
            e.preventDefault();
            
            const pos = getPos(e);
            ctx.beginPath();
            ctx.moveTo(lastX, lastY);
            ctx.lineTo(pos.x, pos.y);
            ctx.stroke();
            
            lastX = pos.x;
            lastY = pos.y;
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
        
        // Use drawn signature button
        const useBtn = document.getElementById('useDrawnSignature');
        if (useBtn) {
            useBtn.addEventListener('click', () => {
                const dataUrl = canvas.toDataURL('image/png');
                this.settings.signatureImage = dataUrl;
                
                const preview = document.getElementById('signaturePreview');
                if (preview) {
                    preview.innerHTML = `<img src="${dataUrl}" alt="Unterschrift" style="max-width: 100%; max-height: 80px;">`;
                }
                
                this.saveSettings();
                this.updatePreview();
                this.showNotification('Gezeichnete Unterschrift übernommen', 'success');
            });
        }
    }
    
    setupSignatureGenerator() {
        const nameInput = document.getElementById('signatureNameInput');
        const styleSelect = document.getElementById('signatureStyleSelect');
        const preview = document.getElementById('signatureGeneratePreview');
        const useBtn = document.getElementById('useGeneratedSignature');
        
        // Load Google Fonts for signature styles
        if (!document.getElementById('signatureFonts')) {
            const link = document.createElement('link');
            link.id = 'signatureFonts';
            link.rel = 'stylesheet';
            link.href = 'https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Great+Vibes&family=Pacifico&family=Satisfy&family=Allura&family=Sacramento&family=Alex+Brush&display=swap';
            document.head.appendChild(link);
        }
        
        const updatePreview = () => {
            if (!preview) return;
            const name = nameInput?.value || 'Ihr Name';
            const font = styleSelect?.value || "'Dancing Script', cursive";
            preview.innerHTML = `<span style="font-family: ${font}; font-size: 32px; color: #1e293b;">${name}</span>`;
        };
        
        if (nameInput) {
            nameInput.addEventListener('input', updatePreview);
        }
        if (styleSelect) {
            styleSelect.addEventListener('change', updatePreview);
        }
        
        if (useBtn) {
            useBtn.addEventListener('click', async () => {
                const name = nameInput?.value || 'Ihr Name';
                const font = styleSelect?.value || "'Dancing Script', cursive";
                
                // Create canvas to convert text to image
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // Set canvas size
                canvas.width = 400;
                canvas.height = 100;
                
                // Clear canvas
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                
                // Set font (wait for it to load)
                ctx.font = `48px ${font}`;
                ctx.fillStyle = '#1e293b';
                ctx.textBaseline = 'middle';
                ctx.textAlign = 'center';
                
                // Draw text
                ctx.fillText(name, canvas.width / 2, canvas.height / 2);
                
                // Trim canvas to content
                const trimmedCanvas = this.trimCanvas(canvas);
                
                const dataUrl = trimmedCanvas.toDataURL('image/png');
                this.settings.signatureImage = dataUrl;
                
                const signaturePreview = document.getElementById('signaturePreview');
                if (signaturePreview) {
                    signaturePreview.innerHTML = `<img src="${dataUrl}" alt="Unterschrift" style="max-width: 100%; max-height: 80px;">`;
                }
                
                this.saveSettings();
                this.updatePreview();
                this.showNotification('Generierte Unterschrift übernommen', 'success');
            });
        }
    }
    
    trimCanvas(canvas) {
        const ctx = canvas.getContext('2d');
        const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = pixels.data;
        
        let top = canvas.height, left = canvas.width, right = 0, bottom = 0;
        
        for (let y = 0; y < canvas.height; y++) {
            for (let x = 0; x < canvas.width; x++) {
                const alpha = data[(y * canvas.width + x) * 4 + 3];
                if (alpha > 0) {
                    if (y < top) top = y;
                    if (y > bottom) bottom = y;
                    if (x < left) left = x;
                    if (x > right) right = x;
                }
            }
        }
        
        const width = right - left + 20;
        const height = bottom - top + 20;
        
        const trimmed = document.createElement('canvas');
        trimmed.width = width;
        trimmed.height = height;
        
        const trimCtx = trimmed.getContext('2d');
        trimCtx.drawImage(canvas, left - 10, top - 10, width, height, 0, 0, width, height);
        
        return trimmed;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // SECTIONS (Drag & Drop)
    // ═══════════════════════════════════════════════════════════════════════════

    setupSections() {
        this.renderSectionsList();
        this.setupDragAndDrop();
    }

    renderSectionsList() {
        const container = document.getElementById('sectionsList');
        if (!container) return;

        container.innerHTML = this.sections.map((section, index) => `
            <div class="design-section-item" data-id="${section.id}" data-index="${index}" draggable="true">
                <i class="fas fa-grip-vertical design-section-drag"></i>
                <div class="design-section-icon">
                    <i class="fas ${section.icon}"></i>
                </div>
                <span class="design-section-name">${section.name}</span>
                <div class="design-section-actions">
                    <button class="design-section-btn ${section.visible ? 'visible' : 'hidden'}" 
                            data-action="toggle" title="${section.visible ? 'Ausblenden' : 'Einblenden'}">
                        <i class="fas ${section.visible ? 'fa-eye' : 'fa-eye-slash'}"></i>
                    </button>
                    <button class="design-section-btn" data-action="settings" title="Einstellungen">
                        <i class="fas fa-cog"></i>
                    </button>
                </div>
                <div class="design-section-settings" data-settings="${section.id}">
                    <div class="design-settings-row">
                        <div>
                            <label>Titel</label>
                            <input type="text" value="${section.customTitle || ''}" placeholder="${section.name}" data-setting="title">
                        </div>
                        <div>
                            <label>Spalte</label>
                            <select data-setting="column">
                                <option value="full" ${section.column === 'full' ? 'selected' : ''}>Vollbreite</option>
                                <option value="left" ${section.column === 'left' ? 'selected' : ''}>Links</option>
                                <option value="right" ${section.column === 'right' ? 'selected' : ''}>Rechts</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');

        container.querySelectorAll('.design-section-btn[data-action="toggle"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const item = btn.closest('.design-section-item');
                const sectionId = item.dataset.id;
                this.toggleSection(sectionId);
            });
        });

        container.querySelectorAll('.design-section-btn[data-action="settings"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const item = btn.closest('.design-section-item');
                const panel = item.querySelector('.design-section-settings');
                if (panel) {
                    panel.classList.toggle('active');
                }
            });
        });

        container.querySelectorAll('.design-section-settings').forEach(panel => {
            panel.querySelectorAll('input, select').forEach(input => {
                input.addEventListener('input', () => {
                    const item = panel.closest('.design-section-item');
                    const sectionId = item.dataset.id;
                    this.updateSectionSettings(sectionId, panel);
                });
            });
        });
    }

    updateSectionSettings(sectionId, panel) {
        const section = this.sections.find(s => s.id === sectionId);
        if (!section) return;
        const titleInput = panel.querySelector('[data-setting="title"]');
        const columnSelect = panel.querySelector('[data-setting="column"]');
        section.customTitle = titleInput?.value || '';
        section.column = columnSelect?.value || section.column;
        this.settings.sections = this.sections;
        this.saveSettings();
        this.updatePreview();
    }

    setupDragAndDrop() {
        const container = document.getElementById('sectionsList');
        if (!container) return;

        container.addEventListener('dragstart', (e) => {
            const item = e.target.closest('.design-section-item');
            if (item) {
                this.draggedSection = item;
                item.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
            }
        });

        container.addEventListener('dragend', (e) => {
            const item = e.target.closest('.design-section-item');
            if (item) {
                item.classList.remove('dragging');
                this.draggedSection = null;
            }
        });

        container.addEventListener('dragover', (e) => {
            e.preventDefault();
            const afterElement = this.getDragAfterElement(container, e.clientY);
            const dragging = container.querySelector('.dragging');
            
            if (dragging) {
                if (afterElement) {
                    container.insertBefore(dragging, afterElement);
                } else {
                    container.appendChild(dragging);
                }
            }
        });

        container.addEventListener('drop', (e) => {
            e.preventDefault();
            this.updateSectionsOrder();
        });
    }

    getDragAfterElement(container, y) {
        const elements = [...container.querySelectorAll('.design-section-item:not(.dragging)')];
        
        return elements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            
            if (offset < 0 && offset > closest.offset) {
                return { offset, element: child };
            }
            return closest;
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    updateSectionsOrder() {
        const container = document.getElementById('sectionsList');
        if (!container) return;

        const newOrder = [];
        container.querySelectorAll('.design-section-item').forEach(item => {
            const sectionId = item.dataset.id;
            const section = this.sections.find(s => s.id === sectionId);
            if (section) {
                newOrder.push(section);
            }
        });

        this.sections = newOrder;
        this.settings.sections = newOrder;
        this.saveSettings();
        this.updatePreview();
    }

    toggleSection(sectionId) {
        const section = this.sections.find(s => s.id === sectionId);
        if (section) {
            section.visible = !section.visible;
            this.settings.sections = this.sections;
            this.saveSettings();
            this.renderSectionsList();
            this.updatePreview();
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // ZOOM CONTROLS
    // ═══════════════════════════════════════════════════════════════════════════

    setupZoom() {
        const zoomIn = document.getElementById('zoomIn');
        const zoomOut = document.getElementById('zoomOut');
        const zoomReset = document.getElementById('zoomReset');

        if (zoomIn) zoomIn.addEventListener('click', () => this.setZoom(this.currentZoom + 10));
        if (zoomOut) zoomOut.addEventListener('click', () => this.setZoom(this.currentZoom - 10));
        if (zoomReset) zoomReset.addEventListener('click', () => this.setZoom(100));
    }

    setZoom(value) {
        this.currentZoom = Math.max(50, Math.min(200, value));
        
        const zoomValue = document.getElementById('zoomValue');
        if (zoomValue) zoomValue.textContent = this.currentZoom + '%';
        
        const previewWrapper = document.querySelector('.design-preview-wrapper');
        if (previewWrapper) {
            previewWrapper.style.transform = `scale(${this.currentZoom / 100})`;
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // APPLY SETTINGS
    // ═══════════════════════════════════════════════════════════════════════════

    applySettings() {
        const preview = document.querySelector('.design-resume-preview');
        if (!preview) return;

        // Apply CSS Variables
        preview.style.setProperty('--resume-font', this.settings.fontFamily);
        preview.style.setProperty('--resume-font-size', this.settings.fontSize + 'pt');
        preview.style.setProperty('--resume-heading-size', this.settings.headingSize + 'pt');
        preview.style.setProperty('--resume-line-height', this.settings.lineHeight);
        
        preview.style.setProperty('--resume-accent-color', this.settings.accentColor);
        preview.style.setProperty('--resume-text-color', this.settings.textColor);
        preview.style.setProperty('--resume-muted-color', this.settings.mutedColor);
        preview.style.setProperty('--resume-bg-color', this.settings.backgroundColor);
        preview.style.setProperty('--resume-border-color', this.settings.borderColor);
        
        // NEW: Section backgrounds
        preview.style.setProperty('--resume-sidebar-bg', this.settings.sidebarBackground || 'transparent');
        preview.style.setProperty('--resume-sidebar-text', this.settings.sidebarTextColor || this.settings.textColor);
        preview.style.setProperty('--resume-header-bg', this.settings.headerBackground || 'transparent');
        preview.style.setProperty('--resume-left-column-bg', this.settings.leftColumnBg || 'transparent');
        preview.style.setProperty('--resume-right-column-bg', this.settings.rightColumnBg || 'transparent');
        
        preview.style.setProperty('--resume-margin', `${this.settings.marginTop}mm ${this.settings.marginRight}mm ${this.settings.marginBottom}mm ${this.settings.marginLeft}mm`);
        preview.style.setProperty('--resume-section-gap', this.settings.sectionGap + 'px');
        preview.style.setProperty('--resume-item-gap', this.settings.itemGap + 'px');
        preview.style.setProperty('--resume-paragraph-gap', this.settings.paragraphGap + 'px');

        preview.style.fontFamily = this.settings.fontFamily;
        preview.style.fontSize = this.settings.fontSize + 'pt';
        preview.style.lineHeight = this.settings.lineHeight;
        preview.style.color = this.settings.textColor;
        preview.style.backgroundColor = this.settings.backgroundColor;
        preview.style.padding = `${this.settings.marginTop}mm ${this.settings.marginRight}mm ${this.settings.marginBottom}mm ${this.settings.marginLeft}mm`;

        preview.classList.toggle('no-icons', !this.settings.showIcons);
        
        // Apply template class
        preview.className = preview.className.replace(/template-\w+/g, '');
        preview.classList.add(`template-${this.settings.template}`);
        
        this.updateATSCheck();
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // PREVIEW UPDATE
    // ═══════════════════════════════════════════════════════════════════════════

    updatePreview() {
        const preview = document.querySelector('.design-resume-preview');
        if (!preview) return;

        const resumeData = this.getResumeData();
        let html = '';

        // Trenne Unterschrift von anderen Sections - sie kommt IMMER ganz unten
        const visibleSections = this.sections.filter(s => s.visible);
        const signatureSection = visibleSections.find(s => s.id === 'signature');
        const otherSections = visibleSections.filter(s => s.id !== 'signature');
        
        if (this.settings.columns === 2) {
            const full = otherSections.filter(s => s.column === 'full');
            const left = otherSections.filter(s => s.column === 'left');
            const right = otherSections.filter(s => s.column === 'right');

            full.forEach(section => {
                html += this.renderSectionById(section, resumeData);
            });

            const leftBg = this.settings.leftColumnBg && this.settings.leftColumnBg !== 'transparent' 
                ? `background: ${this.settings.leftColumnBg}; padding: 20px; margin: -20px 0 -20px -${this.settings.marginLeft}mm; padding-left: ${this.settings.marginLeft}mm;` 
                : '';
            const rightBg = this.settings.rightColumnBg && this.settings.rightColumnBg !== 'transparent'
                ? `background: ${this.settings.rightColumnBg}; padding: 20px;`
                : '';
            
            const leftTextColor = this.settings.sidebarTextColor && this.settings.leftColumnBg !== 'transparent'
                ? `color: ${this.settings.sidebarTextColor};`
                : '';
            
            // Spaltenbreiten anwenden
            const leftWidth = this.settings.leftColumnWidth || 35;
            const rightWidth = this.settings.rightColumnWidth || 65;

            html += `
                <div class="resume-preview-columns" style="display: grid; grid-template-columns: ${leftWidth}% ${rightWidth}%; gap: 24px;">
                    <div class="resume-preview-column resume-preview-column-left" style="${leftBg} ${leftTextColor}">
                        ${left.map(section => this.renderSectionById(section, resumeData)).join('')}
                    </div>
                    <div class="resume-preview-column resume-preview-column-right" style="${rightBg}">
                        ${right.map(section => this.renderSectionById(section, resumeData)).join('')}
                    </div>
                </div>
            `;
        } else {
            otherSections.forEach((section, index) => {
                // Prüfe ob manueller Seitenumbruch vor dieser Section gesetzt werden soll
                const shouldAddPageBreak = this.settings.enableManualPageBreaks && 
                                          this.settings.pageBreakSection === section.id;
                if (shouldAddPageBreak) {
                    html += `<div class="manual-page-break"></div>`;
                }
                html += this.renderSectionById(section, resumeData);
            });
        }
        
        // Unterschrift IMMER ganz unten, nach allen anderen Sections
        if (signatureSection) {
            html += this.renderSectionById(signatureSection, resumeData);
        }
        
        // Add page numbers if enabled
        if (this.settings.showPageNumbers) {
            html += this.renderPageNumbers();
        }
        
        // Add company logo if enabled
        let companyLogoHtml = '';
        if (this.settings.showCompanyLogo && this.settings.companyLogoUrl) {
            companyLogoHtml = this.renderCompanyLogo();
        }

        preview.innerHTML = companyLogoHtml + html || this.renderPlaceholderContent();
        this.updateATSCheck();
        
        // Setup signature drag & drop nach Preview-Update
        this.setupSignatureDragDrop();
    }

    renderSectionById(section, data) {
        switch (section.id) {
            case 'header':
                return this.renderHeaderSection(data, section);
            case 'summary':
                return this.renderSummarySection(data, section);
            case 'experience':
                return this.renderExperienceSection(data, section);
            case 'education':
                return this.renderEducationSection(data, section);
            case 'skills':
                return this.renderSkillsSection(data, section);
            case 'languages':
                return this.renderLanguagesSection(data, section);
            case 'projects':
                return this.renderProjectsSection(data, section);
            case 'references':
                return this.renderReferencesSection(data, section);
            case 'signature':
                return this.renderSignatureSection(data, section);
            default:
                return '';
        }
    }

    getResumeData() {
        const formData = {
            firstName: document.getElementById('firstName')?.value || '',
            lastName: document.getElementById('lastName')?.value || '',
            title: document.getElementById('title')?.value || '',
            email: document.getElementById('email')?.value || '',
            phone: document.getElementById('phone')?.value || '',
            location: document.getElementById('location')?.value || '',
            address: document.getElementById('address')?.value || '',
            street: document.getElementById('street')?.value || '',
            summary: document.getElementById('summary')?.value || '',
            birthDate: document.getElementById('birthDate')?.value || '',
            linkedin: document.getElementById('linkedin')?.value || '',
            github: document.getElementById('github')?.value || '',
            website: document.getElementById('website')?.value || ''
        };
        
        let savedProfile = {};
        try {
            const stored = localStorage.getItem('bewerbungsmanager_profile');
            if (stored) savedProfile = JSON.parse(stored);
        } catch (e) {}
        
        return {
            firstName: formData.firstName || savedProfile.firstName || 'Ihr Vorname',
            lastName: formData.lastName || savedProfile.lastName || 'Ihr Nachname',
            title: formData.title || savedProfile.currentJob || 'Berufsbezeichnung',
            email: formData.email || savedProfile.email || 'email@example.com',
            phone: formData.phone || savedProfile.phone || '+49 123 456789',
            location: formData.location || savedProfile.location || 'Stadt, Land',
            address: formData.address || savedProfile.address || '',
            street: formData.street || savedProfile.street || '',
            summary: formData.summary || savedProfile.summary || 'Ihr Profil...',
            birthDate: formData.birthDate || savedProfile.birthDate || '',
            linkedin: formData.linkedin || savedProfile.linkedin || '',
            github: formData.github || savedProfile.github || '',
            website: formData.website || savedProfile.website || '',
            profileImageUrl: this.settings.profileImageUrl || savedProfile.profileImageUrl || '',
            experience: this.getExperienceData(),
            education: this.getEducationData(),
            skills: this.getSkillsData(),
            languages: this.getLanguagesData(),
            projects: this.getProjectsData(),
            references: this.getReferencesData()
        };
    }

    getExperienceData() {
        const container = document.getElementById('experienceContainer');
        if (!container) return [];
        
        const items = [];
        container.querySelectorAll('.experience-item, .entry-item').forEach(item => {
            items.push({
                position: item.querySelector('[data-field="position"]')?.value || '',
                company: item.querySelector('[data-field="company"]')?.value || '',
                companyWebsite: item.querySelector('[data-field="companyWebsite"]')?.value || '',
                companyLogo: item.querySelector('[data-field="companyLogo"]')?.value || '',
                location: item.querySelector('[data-field="location"]')?.value || '',
                startDate: item.querySelector('[data-field="startDate"]')?.value || '',
                endDate: item.querySelector('[data-field="endDate"]')?.value || '',
                description: item.querySelector('[data-field="description"]')?.value || ''
                // bullets sind jetzt in description integriert
            });
        });
        
        return items;
    }

    getEducationData() {
        const container = document.getElementById('educationContainer');
        if (!container) return [];
        
        const items = [];
        container.querySelectorAll('.education-item, .entry-item').forEach(item => {
            items.push({
                degree: item.querySelector('[data-field="degree"]')?.value || '',
                institution: item.querySelector('[data-field="institution"]')?.value || '',
                startDate: item.querySelector('[data-field="startDate"]')?.value || '',
                endDate: item.querySelector('[data-field="endDate"]')?.value || ''
            });
        });
        
        return items;
    }

    getSkillsData() {
        const technicalSkills = [];
        const softSkills = [];

        // Alte Kategorie-basierte Skills
        document.querySelectorAll('#technicalSkillsContainer .skill-category-item').forEach(item => {
            const category = item.querySelector('.skill-category-name')?.value || '';
            const skillElements = item.querySelectorAll('.skill-tag');
            const skills = [];
            
            skillElements.forEach(skillEl => {
                const nameInput = skillEl.querySelector('input[type="text"]');
                const levelInput = skillEl.querySelector('input[type="range"], select[data-field="level"]');
                skills.push({
                    name: nameInput?.value?.trim() || '',
                    level: levelInput ? parseInt(levelInput.value) || 5 : 5
                });
            });
            
            if (category || skills.length) {
                technicalSkills.push({ category, skills: skills.filter(s => s.name) });
            }
        });
        
        // NEUE: Skills mit Bewertung (skill-item-rated)
        const ratedSkillsMap = new Map(); // Group by category
        
        document.querySelectorAll('#technicalSkillsContainer .skill-item-rated:not(.soft)').forEach(item => {
            const name = item.querySelector('[data-field="skillName"]')?.value?.trim() || '';
            const level = parseInt(item.querySelector('[data-field="skillLevel"]')?.value) || 5;
            const category = item.querySelector('[data-field="skillCategory"]')?.value?.trim() || 'Allgemein';
            
            if (name) {
                if (!ratedSkillsMap.has(category)) {
                    ratedSkillsMap.set(category, []);
                }
                ratedSkillsMap.get(category).push({ name, level });
            }
        });
        
        // Convert map to array format
        ratedSkillsMap.forEach((skills, category) => {
            technicalSkills.push({ category, skills });
        });

        // Alte Soft Skills (ohne Bewertung)
        document.querySelectorAll('#softSkillsContainer .soft-skill-item').forEach(item => {
            const skill = item.querySelector('input[type="text"]')?.value || '';
            if (skill) softSkills.push(skill);
        });
        
        // NEUE: Soft Skills mit Bewertung
        document.querySelectorAll('#softSkillsContainer .skill-item-rated.soft').forEach(item => {
            const name = item.querySelector('[data-field="skillName"]')?.value?.trim() || '';
            const level = parseInt(item.querySelector('[data-field="skillLevel"]')?.value) || 5;
            const examplesTextarea = item.querySelector('textarea[data-field="examples"]');
            const examples = examplesTextarea ? examplesTextarea.value.split('\n').filter(e => e.trim()) : [];
            if (name) {
                softSkills.push({ name, level, examples });
            }
        });
        
        // Alte Soft Skills (ohne Bewertung) - auch mit Examples
        document.querySelectorAll('#softSkillsContainer .soft-skill-item').forEach(item => {
            const skill = item.querySelector('input[type="text"]')?.value || '';
            const examplesTextarea = item.querySelector('textarea');
            const examples = examplesTextarea ? examplesTextarea.value.split('\n').filter(e => e.trim()) : [];
            if (skill) {
                softSkills.push({ name: skill, level: 5, examples });
            }
        });

        return { technicalSkills, softSkills };
    }

    getLanguagesData() {
        const container = document.getElementById('languagesContainer');
        if (!container) return [];
        
        const items = [];
        container.querySelectorAll('.language-item, .entry-item').forEach(item => {
            items.push({
                language: item.querySelector('[data-field="language"]')?.value || item.querySelector('input')?.value || '',
                level: item.querySelector('[data-field="proficiency"]')?.value || item.querySelector('select')?.value || ''
            });
        });
        
        return items;
    }

    getProjectsData() {
        const container = document.getElementById('projectsContainer');
        if (!container) return [];
        const items = [];
        container.querySelectorAll('.project-item').forEach(item => {
            items.push({
                name: item.querySelector('[data-field="name"]')?.value || '',
                role: item.querySelector('[data-field="role"]')?.value || '',
                description: item.querySelector('[data-field="description"]')?.value || '',
                startDate: item.querySelector('[data-field="startDate"]')?.value || '',
                endDate: item.querySelector('[data-field="endDate"]')?.value || ''
            });
        });
        return items;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // SECTION RENDERERS (Extended)
    // ═══════════════════════════════════════════════════════════════════════════

    renderHeaderSection(data, section) {
        // Header-Ausrichtung: left, center, right
        const alignClass = this.settings.headerAlign === 'left' ? 'align-left' 
                         : this.settings.headerAlign === 'right' ? 'align-right' 
                         : ''; // center ist default
        const headerBg = this.settings.headerBackground && this.settings.headerBackground !== 'transparent'
            ? `background: ${this.settings.headerBackground}; margin: -${this.settings.marginTop}mm -${this.settings.marginRight}mm 0 -${this.settings.marginLeft}mm; padding: ${this.settings.marginTop}mm ${this.settings.marginRight}mm 20px ${this.settings.marginLeft}mm;`
            : '';
        
        // "LEBENSLAUF" Überschrift (je nach Template, jetzt editierbar)
        const showResumeTitle = this.settings.showResumeTitle !== false;
        const titleText = this.settings.resumeTitleText || 'Lebenslauf';
        const titleSize = this.settings.resumeTitleSize || 10;
        const titleColor = this.settings.resumeTitleColor || this.settings.mutedColor;
        const titleSpacing = this.settings.resumeTitleSpacing || 3;
        
        const resumeTitleHtml = showResumeTitle ? (() => {
            const position = this.settings.resumeTitlePosition || 'above-image';
            let positionStyle = '';
            let alignStyle = '';
            
            switch (position) {
                case 'left':
                    alignStyle = 'text-align: left;';
                    positionStyle = '';
                    break;
                case 'right':
                    alignStyle = 'text-align: right;';
                    positionStyle = '';
                    break;
                case 'center':
                    alignStyle = 'text-align: center;';
                    positionStyle = '';
                    break;
                case 'same-as-header':
                    alignStyle = `text-align: ${this.settings.headerAlign || 'center'};`;
                    positionStyle = '';
                    break;
                case 'above-image':
                default:
                    // Über Profilbild positionieren (wenn vorhanden)
                    if (this.settings.showProfileImage && data.profileImageUrl) {
                        // Positioniere über dem Bild mit absolutem Positioning
                        positionStyle = 'position: absolute; top: -30px; left: 0; width: 100%; z-index: 10;';
                        alignStyle = 'text-align: left;';
                    } else {
                        // Wenn kein Bild, normal positionieren
                        positionStyle = '';
                        alignStyle = 'text-align: left;';
                    }
                    break;
            }
            
            // Wrapper für absolute Positionierung
            const wrapperStyle = position === 'above-image' && this.settings.showProfileImage && data.profileImageUrl
                ? 'position: relative;'
                : '';
            
            return `
                <div class="resume-title-wrapper" style="${wrapperStyle}">
                    <p class="resume-document-title" style="
                        text-transform: uppercase;
                        letter-spacing: ${titleSpacing}px;
                        font-size: ${titleSize}px;
                        color: ${titleColor};
                        margin-bottom: ${position === 'above-image' && this.settings.showProfileImage && data.profileImageUrl ? '0' : '8px'};
                        font-weight: 500;
                        ${alignStyle}
                        ${positionStyle}
                    ">${titleText}</p>
                </div>
            `;
        })() : '';
        
        // Profile image mit Crop-Einstellungen
        let profileImageHtml = '';
        if (this.settings.showProfileImage && data.profileImageUrl) {
            const sizeMap = { small: '80px', medium: '120px', large: '160px' };
            const size = sizeMap[this.settings.profileImageSize] || '120px';
            const shape = this.settings.profileImageShape === 'circle' ? '50%' 
                        : this.settings.profileImageShape === 'rounded' ? '12px' : '0';
            const border = this.settings.profileImageBorder === 'thin' ? '2px solid #e2e8f0'
                         : this.settings.profileImageBorder === 'accent' ? `3px solid ${this.settings.accentColor}` : 'none';
            
            // Crop-Einstellungen
            const zoom = this.settings.profileImageZoom || 100;
            const offsetX = this.settings.profileImageOffsetX || 0;
            const offsetY = this.settings.profileImageOffsetY || 0;
            
            // Einfache Zoom-Logik: 
            // - Zoom 100% = Bild füllt Container komplett
            // - Zoom 150% = Bild ist 1.5x größer, man sieht einen Ausschnitt
            // - Offset verschiebt welchen Teil des Bildes man sieht
            const zoomFactor = zoom / 100;
            
            // Object-position: 50% = zentriert, mit Offset verschieben
            // Bei Zoom > 100 funktioniert object-position um den sichtbaren Bereich zu verschieben
            // Konvertiere zu 0-100% Skala: 50% + offsetX% = final position
            const posX = Math.max(0, Math.min(100, 50 + (offsetX || 0)));
            const posY = Math.max(0, Math.min(100, 50 + (offsetY || 0)));
            
            profileImageHtml = `
                <div class="resume-preview-profile-image" style="
                    width: ${size}; height: ${size}; border-radius: ${shape}; border: ${border};
                    overflow: hidden; flex-shrink: 0; position: relative;
                    background: #f1f5f9;
                ">
                    <img src="${data.profileImageUrl}" alt="Profilbild" style="
                        width: 100%;
                        height: 100%;
                        object-fit: cover;
                        object-position: ${posX}% ${posY}%;
                        transform: scale(${zoomFactor});
                    ">
                </div>
            `;
        }
        
        // LinkedIn URL vollständig anzeigen (mit https:// wenn nicht vorhanden)
        let linkedinDisplay = data.linkedin || '';
        if (linkedinDisplay && !linkedinDisplay.startsWith('http')) {
            if (linkedinDisplay.includes('linkedin.com')) {
                linkedinDisplay = 'https://' + linkedinDisplay;
            } else {
                linkedinDisplay = 'https://www.linkedin.com/in/' + linkedinDisplay.replace(/^\/+/, '');
            }
        }
        
        // GitHub URL vollständig anzeigen (mit https:// wenn nicht vorhanden)
        let githubDisplay = data.github || '';
        if (githubDisplay && !githubDisplay.startsWith('http')) {
            if (githubDisplay.includes('github.com')) {
                githubDisplay = 'https://' + githubDisplay;
            } else {
                githubDisplay = 'https://github.com/' + githubDisplay.replace(/^\/+/, '');
            }
        }
        
        // Adresse zusammenstellen (Straße + Standort)
        let fullAddress = '';
        if (data.street && this.settings.showHeaderField?.street !== false) {
            fullAddress = data.street;
            if (data.location && this.settings.showHeaderField?.location !== false) {
                // Prüfe ob location mit Postleitzahl beginnt (z.B. "8330 Pfäffikon"), kein Komma
                const locationStartsWithPLZ = /^\d{4,5}\s/.test(data.location.trim());
                if (locationStartsWithPLZ) {
                    fullAddress += ' ' + data.location.trim(); // Leerzeichen statt Komma
                } else {
                    fullAddress += ', ' + data.location.trim(); // Komma für normale Standorte
                }
            }
        } else if (data.address && this.settings.showHeaderField?.address !== false) {
            // Wenn address bereits "Straße, PLZ Stadt" Format hat, entferne Komma nach PLZ falls vorhanden
            // Verbesserte Regex: Entfernt Komma nach PLZ (4-5 Ziffern) gefolgt von Buchstaben
            // Beispiele: "8330, Pfäffikon" -> "8330 Pfäffikon", "8330, Zürich" -> "8330 Zürich"
            fullAddress = data.address.replace(/(\d{4,5}),\s*([A-Za-zÄÖÜäöü])/g, '$1 $2'); // Global replace
            // Auch mehrfache Kommas nach PLZ entfernen
            fullAddress = fullAddress.replace(/(\d{4,5}),\s*([A-Za-zÄÖÜäöü])/g, '$1 $2');
        } else if (data.location && this.settings.showHeaderField?.location !== false) {
            // Auch location selbst bereinigen falls es Komma nach PLZ hat
            fullAddress = data.location.replace(/(\d{4,5}),\s*([A-Za-zÄÖÜäöü])/g, '$1 $2');
        }
        
        const headerContent = `
            ${resumeTitleHtml}
            <h1 class="resume-preview-name">${data.firstName} ${data.lastName}</h1>
            <p class="resume-preview-title">${data.title}</p>
            ${(data.birthDate && this.settings.showHeaderField?.birthDate !== false) ? `<p class="resume-preview-birthdate" style="font-size: 0.85em; color: ${this.settings.mutedColor};">Geboren am ${this.formatBirthDate(data.birthDate)}</p>` : ''}
            <div class="resume-preview-contact">
                ${(data.phone && this.settings.showHeaderField?.phone !== false) ? `<span><i class="fas fa-phone"></i> ${data.phone}</span>` : ''}
                ${fullAddress ? `<span><i class="fas fa-map-marker-alt"></i> ${fullAddress}</span>` : ''}
                ${(data.email && this.settings.showHeaderField?.email !== false) ? `<span><i class="fas fa-envelope"></i> ${data.email}</span>` : ''}
                ${(data.linkedin && this.settings.showHeaderField?.linkedin !== false) ? `<span><i class="fab fa-linkedin"></i> <a href="${linkedinDisplay}" target="_blank" rel="noopener" style="color: inherit; text-decoration: none;">${linkedinDisplay}</a></span>` : ''}
                ${(data.github && this.settings.showHeaderField?.github !== false) ? `<span><i class="fab fa-github"></i> <a href="${githubDisplay}" target="_blank" rel="noopener" style="color: inherit; text-decoration: none;">${githubDisplay}</a></span>` : ''}
                ${(data.website && this.settings.showHeaderField?.website !== false) ? (() => {
                    let websiteUrl = data.website.trim();
                    if (!websiteUrl) return '';
                    if (!websiteUrl.startsWith('http://') && !websiteUrl.startsWith('https://')) {
                        websiteUrl = 'https://' + websiteUrl;
                    }
                    const websiteDisplay = websiteUrl.replace(/https?:\/\//, '').replace(/\/$/, ''); // Entferne trailing slash
                    return `<span><i class="fas fa-globe"></i> <a href="${websiteUrl}" target="_blank" rel="noopener noreferrer" style="color: inherit; text-decoration: underline; cursor: pointer; pointer-events: auto;">${websiteDisplay}</a></span>`;
                })() : ''}
            </div>
        `;
        
        if (this.settings.showProfileImage && data.profileImageUrl) {
            const imgPos = this.settings.profileImagePosition;
            return `
                <div class="resume-preview-header ${alignClass}" style="${headerBg}">
                    <div class="resume-header-with-image" style="display: flex; align-items: center; gap: 24px; ${imgPos === 'right' ? 'flex-direction: row-reverse;' : ''} ${imgPos === 'center' ? 'flex-direction: column; text-align: center;' : ''}">
                        ${profileImageHtml}
                        <div class="resume-header-content" style="flex: 1;">
                            ${headerContent}
                        </div>
                    </div>
                </div>
            `;
        }
        
        return `
            <div class="resume-preview-header ${alignClass}" style="${headerBg}">
                ${headerContent}
            </div>
        `;
    }
    
    formatBirthDate(dateStr) {
        if (!dateStr) return '';
        try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return dateStr;
            return date.toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' });
        } catch (e) {
            return dateStr;
        }
    }
    
    // formatDate ist weiter oben definiert und verwendet die Date-Format-Settings
    // Diese Hilfsfunktion formatiert Daten für spezielle Fälle (z.B. Geburtsdatum)
    formatFullDate(dateStr) {
        if (!dateStr) return '';
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
        } catch (e) {
            return dateStr;
        }
    }

    renderSummarySection(data, section) {
        if (!data.summary) return '';
        const title = section?.customTitle || this.translate('Kurzprofil');
        return `
            <div class="resume-preview-section">
                <h2 class="resume-preview-section-title"><i class="fas fa-user"></i> ${title}</h2>
                <p class="resume-preview-item-description">${data.summary}</p>
            </div>
        `;
    }

    renderExperienceSection(data, section) {
        if (!data.experience?.length) return '';
        const title = section?.customTitle || this.translate('Berufserfahrung');
        const format = this.settings.experienceFormat || 'mixed';
        
        return `
            <div class="resume-preview-section">
                <h2 class="resume-preview-section-title"><i class="fas fa-briefcase"></i> ${title}</h2>
                ${data.experience.map(exp => {
                    // Company with optional logo and link
                    let companyHtml = exp.company;
                    if (exp.companyWebsite) {
                        companyHtml = `<a href="${exp.companyWebsite}" target="_blank" class="resume-company-link">${exp.company}</a>`;
                    }
                    if (exp.companyLogo) {
                        companyHtml = `<span class="resume-company-with-logo"><img src="${exp.companyLogo}" alt="" class="resume-company-logo">${companyHtml}</span>`;
                    }
                    if (exp.location) {
                        companyHtml += `, ${exp.location}`;
                    }
                    
                    // Description: Fließtext VOR Stichpunkten, Stichpunkte als Liste
                    let descriptionHtml = '';
                    if (exp.description) {
                        if (format === 'bullets' || (format === 'mixed' && exp.description.includes('\n'))) {
                            const lines = exp.description.split('\n').filter(l => l.trim());
                            
                            // Teile in Abschnitte: Fließtext (vor Bullets) und Bullets
                            let proseSection = [];
                            let bulletSection = [];
                            let inBulletSection = false;
                            
                            for (const line of lines) {
                                const isBullet = line.trim().match(/^[-•*·→▸►]/);
                                if (isBullet) {
                                    inBulletSection = true;
                                    bulletSection.push(line.replace(/^[-•*·→▸►]\s*/, ''));
                                } else if (!inBulletSection) {
                                    // Fließtext VOR den Stichpunkten
                                    proseSection.push(line);
                                } else {
                                    // Fließtext NACH den Stichpunkten (z.B. Einleitung die fälschlicherweise danach kam)
                                    // Behandle als weitere Prose-Zeile unter den Bullets
                                    proseSection.push(line);
                                }
                            }
                            
                            // Rendere: Erst Fließtext, dann Bullets
                            if (proseSection.length > 0 && proseSection.some(p => !p.match(/^[-•*·→▸►]/))) {
                                const cleanProseLines = proseSection.filter(p => !p.match(/^[-•*·→▸►]/));
                                if (cleanProseLines.length > 0) {
                                    descriptionHtml += `<p class="resume-preview-item-description">${cleanProseLines.join('<br>')}</p>`;
                                }
                            }
                            if (bulletSection.length > 0) {
                                descriptionHtml += `<ul class="resume-preview-bullets">${bulletSection.map(b => `<li>${b}</li>`).join('')}</ul>`;
                            }
                            
                            // Fallback wenn nur Fließtext
                            if (!descriptionHtml) {
                                descriptionHtml = `<p class="resume-preview-item-description">${exp.description.replace(/\n/g, '<br>')}</p>`;
                            }
                        } else {
                            // Format 'prose' - einfach als Text rendern
                            descriptionHtml = `<p class="resume-preview-item-description">${exp.description.replace(/\n/g, '<br>')}</p>`;
                        }
                    }
                    
                    // Format dates according to settings
                    const dateRange = this.formatDateRange(exp.startDate, exp.endDate, exp.currentJob || !exp.endDate);
                    
                    return `
                        <div class="resume-preview-item">
                            <div class="resume-preview-item-header">
                                <span class="resume-preview-item-title">${exp.position}</span>
                                <span class="resume-preview-item-date">${dateRange}</span>
                            </div>
                            <div class="resume-preview-item-subtitle">${companyHtml}</div>
                            ${descriptionHtml}
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    renderEducationSection(data, section) {
        if (!data.education?.length) return '';
        const title = section?.customTitle || this.translate('Ausbildung');
        return `
            <div class="resume-preview-section">
                <h2 class="resume-preview-section-title"><i class="fas fa-graduation-cap"></i> ${title}</h2>
                ${data.education.map(edu => {
                    const dateRange = this.formatDateRange(edu.startDate, edu.endDate, edu.current || !edu.endDate);
                    return `
                    <div class="resume-preview-item">
                        <div class="resume-preview-item-header">
                            <span class="resume-preview-item-title">${edu.degree}</span>
                            <span class="resume-preview-item-date">${dateRange}</span>
                        </div>
                        <div class="resume-preview-item-subtitle">${edu.institution}${edu.location ? `, ${edu.location}` : ''}</div>
                        ${edu.description ? `<p class="resume-preview-item-description">${edu.description}</p>` : ''}
                    </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    renderSkillsSection(data, section) {
        const hasTech = data.skills?.technicalSkills?.length;
        const hasSoft = data.skills?.softSkills?.length;
        if (!hasTech && !hasSoft) return '';
        const title = section?.customTitle || this.translate('Fähigkeiten');
        const display = this.settings.skillDisplay || 'tags';
        const maxLevel = this.settings.skillMaxLevel || 10;
        const showLabel = this.settings.skillShowLabel !== false;
        
        return `
            <div class="resume-preview-section">
                <h2 class="resume-preview-section-title"><i class="fas fa-tools"></i> ${title}</h2>
                ${hasTech ? data.skills.technicalSkills.map(category => `
                    <div class="resume-preview-item">
                        ${category.category ? `<div class="resume-preview-item-title">${category.category}</div>` : ''}
                        <div class="resume-preview-skills resume-skills-${display}">
                            ${(category.skills || []).map(skill => this.renderSkillItem(skill, display, maxLevel, showLabel)).join('')}
                        </div>
                    </div>
                `).join('') : ''}
                ${hasSoft ? `
                    <div class="resume-preview-item">
                        <div class="resume-preview-item-title">${this.translate('Soft Skills')}</div>
                        <div class="resume-preview-skills resume-skills-${display}">
                            ${data.skills.softSkills.map(skill => this.renderSkillItem(skill, display, maxLevel, showLabel)).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }
    
    renderSkillItem(skill, display, maxLevel, showLabel) {
        const name = typeof skill === 'string' ? skill : skill.name;
        const level = typeof skill === 'object' ? (skill.level || 5) : 5;
        const percentage = Math.round((level / maxLevel) * 100);
        
        // Bei schmaler Spalte (< 35%) stacked Layout verwenden
        const isNarrow = (this.settings.leftColumnWidth || 35) < 35;
        const stackedStyle = isNarrow ? 'flex-direction: column; align-items: flex-start; gap: 4px;' : '';
        
        switch (display) {
            case 'bars':
                return `
                    <div class="resume-skill-bar-item" style="${stackedStyle}">
                        <div class="resume-skill-bar-header" style="width: 100%;">
                            <span class="resume-skill-name">${name}</span>
                            ${showLabel ? `<span class="resume-skill-level">${level}/${maxLevel}</span>` : ''}
                        </div>
                        <div class="resume-skill-bar" style="width: 100%;">
                            <div class="resume-skill-bar-fill" style="width: ${percentage}%"></div>
                        </div>
                    </div>
                `;
            case 'dots':
                const filledDots = Math.round((level / maxLevel) * 10);
                const dots = Array(10).fill(0).map((_, i) => 
                    `<span class="resume-skill-dot ${i < filledDots ? 'filled' : ''}"></span>`
                ).join('');
                return `
                    <div class="resume-skill-dots-item" style="${isNarrow ? 'flex-direction: column; align-items: flex-start;' : ''}">
                        <span class="resume-skill-name" style="${isNarrow ? 'margin-bottom: 4px;' : ''}">${name}</span>
                        <div class="resume-skill-dots">${dots}</div>
                    </div>
                `;
            case 'numeric':
                return `
                    <div class="resume-skill-numeric-item" style="${stackedStyle}">
                        <span class="resume-skill-name">${name}</span>
                        <span class="resume-skill-numeric">${level}/${maxLevel}</span>
                    </div>
                `;
            case 'percentage':
                return `
                    <div class="resume-skill-percentage-item" style="${stackedStyle}">
                        <span class="resume-skill-name">${name}</span>
                        <span class="resume-skill-percentage">${percentage}%</span>
                    </div>
                `;
            default: // tags
                return `<span class="resume-preview-skill">${name}</span>`;
        }
    }

    renderLanguagesSection(data, section) {
        if (!data.languages?.length) return '';
        const title = section?.customTitle || this.translate('Sprachen');
        
        // Map proficiency levels to display text with CEFR levels
        const levelMap = {
            'muttersprache': { text: 'Muttersprache', cefr: '' },
            'verhandlungssicher': { text: 'Verhandlungssicher', cefr: 'C2' },
            'fließend': { text: 'Fließend', cefr: 'C1' },
            'gut': { text: 'Gut', cefr: 'B2' },
            'grundkenntnisse': { text: 'Grundkenntnisse', cefr: 'A2/B1' },
            'anfänger': { text: 'Anfänger', cefr: 'A1' }
        };
        
        return `
            <div class="resume-preview-section">
                <h2 class="resume-preview-section-title"><i class="fas fa-language"></i> ${title}</h2>
                ${data.languages.map(lang => {
                    const level = lang.level || lang.proficiency || '';
                    const levelLower = level.toLowerCase();
                    const levelInfo = levelMap[levelLower] || { text: level, cefr: '' };
                    const displayText = levelInfo.cefr 
                        ? `${levelInfo.text} (${levelInfo.cefr})`
                        : levelInfo.text;
                    
                    return `
                    <div class="resume-preview-item" style="display: flex; justify-content: space-between; align-items: center; gap: 1rem; flex-wrap: wrap;">
                        <span style="flex: 1; min-width: 100px;">${lang.language}</span>
                        <span style="color: var(--resume-muted-color); font-size: 0.9em; text-align: right; white-space: nowrap;">${displayText}</span>
                    </div>
                `}).join('')}
            </div>
        `;
    }

    renderProjectsSection(data, section) {
        if (!data.projects?.length) return '';
        const title = section?.customTitle || this.translate('Projekte');
        return `
            <div class="resume-preview-section">
                <h2 class="resume-preview-section-title"><i class="fas fa-project-diagram"></i> ${title}</h2>
                ${data.projects.map(project => {
                    const dateRange = this.formatDateRange(project.startDate, project.endDate, !project.endDate);
                    return `
                    <div class="resume-preview-item">
                        <div class="resume-preview-item-header">
                            <span class="resume-preview-item-title">${project.name}</span>
                            <span class="resume-preview-item-date">${dateRange}</span>
                        </div>
                        ${project.role ? `<div class="resume-preview-item-subtitle">${project.role}</div>` : ''}
                        ${project.description ? `<p class="resume-preview-item-description">${project.description}</p>` : ''}
                    </div>
                `}).join('')}
            </div>
        `;
    }
    
    renderReferencesSection(data, section) {
        const title = section?.customTitle || this.translate('Referenzen');
        // Referenzen können aus verschiedenen Quellen kommen
        const references = data.references || [];
        
        // Wenn keine Referenzen vorhanden, zeige "auf Anfrage"
        if (!references.length) {
            const onRequestText = this.settings.language === 'en' 
                ? 'References available upon request.'
                : 'Referenzen werden auf Anfrage gerne zur Verfügung gestellt.';
            return `
                <div class="resume-preview-section">
                    <h2 class="resume-preview-section-title"><i class="fas fa-user-check"></i> ${title}</h2>
                    <p class="resume-preview-item-description" style="font-style: italic; color: ${this.settings.mutedColor};">
                        ${onRequestText}
                    </p>
                </div>
            `;
        }
        
        return `
            <div class="resume-preview-section">
                <h2 class="resume-preview-section-title"><i class="fas fa-user-check"></i> ${title}</h2>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
                    ${references.map(ref => `
                        <div class="resume-preview-item" style="padding: 12px; background: ${this.settings.sidebarBackground !== 'transparent' ? 'rgba(255,255,255,0.1)' : '#f8fafc'}; border-radius: 8px;">
                            <div class="resume-preview-item-title" style="font-weight: 600;">${ref.name || 'Name'}</div>
                            <div class="resume-preview-item-subtitle" style="font-size: 0.85em;">${ref.position || ''}</div>
                            <div style="font-size: 0.85em; color: ${this.settings.mutedColor};">${ref.company || ''}</div>
                            ${ref.email ? `<div style="font-size: 0.8em; margin-top: 8px;"><i class="fas fa-envelope"></i> ${ref.email}</div>` : ''}
                            ${ref.phone ? `<div style="font-size: 0.8em;"><i class="fas fa-phone"></i> ${ref.phone}</div>` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    renderSignatureSection(data, section) {
        if (!this.settings.showSignature) return '';
        
        const location = this.settings.signatureLocation || '';
        const date = this.settings.signatureDate || '';
        const signatureImage = this.settings.signatureImage || '';
        const showLine = this.settings.signatureLine;
        const position = this.settings.signaturePosition || 'bottom-right';
        const width = this.settings.signatureWidth || 150;
        
        // Position-Styling
        let positionStyle = '';
        let alignStyle = 'text-align: right;';
        switch (position) {
            case 'bottom-left':
                alignStyle = 'text-align: left;';
                break;
            case 'bottom-center':
                alignStyle = 'text-align: center;';
                break;
            case 'bottom-right':
                alignStyle = 'text-align: right;';
                break;
            case 'custom':
                const customX = this.settings.signatureCustomX || 70;
                const customY = this.settings.signatureCustomY || 90;
                positionStyle = `position: absolute; left: ${customX}%; top: ${customY}%; transform: translate(-50%, -50%);`;
                alignStyle = 'text-align: center;';
                break;
        }
        
        return `
            <div class="resume-preview-section resume-signature-section" style="${alignStyle} margin-top: auto; padding-top: 30px;">
                <div class="resume-signature-content" style="display: inline-block; ${positionStyle}">
                    ${location || date ? `
                        <p class="resume-signature-location-date" style="margin-bottom: 8px; font-size: 0.9em;">${location}${location && date ? ', ' : ''}${date}</p>
                    ` : ''}
                    ${signatureImage ? `
                        <div class="resume-signature-image signature-draggable" style="margin-bottom: 4px; position: relative; display: inline-block; cursor: move;" data-signature-draggable="true">
                            <img src="${signatureImage}" alt="Unterschrift" style="
                                height: auto; 
                                width: ${width}px; 
                                max-width: 100%;
                                transform: ${this.settings.signatureSkew ? `skew(${this.settings.signatureSkew}deg)` : 'none'};
                                pointer-events: none;
                            ">
                        </div>
                    ` : ''}
                    ${showLine ? `<div class="resume-signature-line" style="width: ${width}px; border-bottom: ${this.settings.signatureLineWidth || 1}px solid ${this.settings.signatureLineColor || this.settings.textColor || '#64748b'}; margin: 0 auto;"></div>` : ''}
                </div>
            </div>
        `;
    }
    
    renderPageNumbers() {
        const format = this.settings.pageNumberFormat || 'Seite X von Y';
        const position = this.settings.pageNumberPosition || 'bottom-center';
        
        let text = format.replace('X', '1').replace('Y', '1');
        
        let alignStyle = 'text-align: center;';
        if (position === 'bottom-left') alignStyle = 'text-align: left;';
        if (position === 'bottom-right') alignStyle = 'text-align: right;';
        
        return `
            <div class="resume-page-number" style="${alignStyle}">
                ${text}
            </div>
        `;
    }

    renderPlaceholderContent() {
        return `
            <div class="resume-preview-header">
                <h1 class="resume-preview-name">Ihr Name</h1>
                <p class="resume-preview-title">Ihre Berufsbezeichnung</p>
                <div class="resume-preview-contact">
                    <span><i class="fas fa-envelope"></i> email@beispiel.de</span>
                    <span><i class="fas fa-phone"></i> +49 123 456789</span>
                    <span><i class="fas fa-map-marker-alt"></i> Stadt, Land</span>
                </div>
            </div>
            <div class="resume-preview-section">
                <h2 class="resume-preview-section-title">Profil</h2>
                <p class="resume-preview-item-description">Füllen Sie das Formular aus, um Ihren Lebenslauf zu erstellen...</p>
            </div>
        `;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // AUTO-SAVE & EXPORT
    // ═══════════════════════════════════════════════════════════════════════════

    setupAutoSave() {
        const form = document.getElementById('resumeForm');
        if (form) {
            form.addEventListener('input', () => {
                clearTimeout(this.previewTimeout);
                this.previewTimeout = setTimeout(() => this.updatePreview(), 300);
            });
        }
    }

    setupATS() {
        this.updateATSCheck();
    }

    updateATSCheck() {
        const list = document.getElementById('atsChecksList');
        const scoreEl = document.getElementById('atsScoreValue');
        if (!list || !scoreEl) return;

        const checks = [];
        const issues = [];

        const fontOk = this.settings.fontSize >= 10.5;
        checks.push({ ok: fontOk, text: 'Schriftgröße mindestens 10.5pt' });
        if (!fontOk) issues.push(1);

        const lineOk = this.settings.lineHeight >= 1.2;
        checks.push({ ok: lineOk, text: 'Zeilenabstand mindestens 1.2' });
        if (!lineOk) issues.push(1);

        const iconsOk = !this.settings.showIcons;
        checks.push({ ok: iconsOk, text: 'Icons ausgeschaltet (ATS-freundlich)' });
        if (!iconsOk) issues.push(1);

        const columnsOk = this.settings.columns === 1;
        checks.push({ ok: columnsOk, text: 'Einspaltiges Layout (ATS-freundlich)' });
        if (!columnsOk) issues.push(1);

        const contrastOk = this.settings.textColor.toLowerCase() !== '#ffffff';
        checks.push({ ok: contrastOk, text: 'Textfarbe hat Kontrast' });
        if (!contrastOk) issues.push(1);

        const score = Math.max(0, 100 - issues.length * 15);
        scoreEl.textContent = `${score}%`;

        list.innerHTML = checks.map(check => `
            <div class="design-ats-item ${check.ok ? 'ok' : 'warn'}">
                <i class="fas ${check.ok ? 'fa-check-circle' : 'fa-exclamation-triangle'}"></i>
                <span>${check.text}</span>
            </div>
        `).join('');
    }

    async exportToPDF() {
        // Prüfe ob Design Editor Preview vorhanden ist
        const preview = document.querySelector('.design-resume-preview');
        if (!preview) {
            // Fallback: Prüfe resumePreview
            const fallbackPreview = document.getElementById('resumePreview');
            if (!fallbackPreview) {
                this.showNotification('Keine Vorschau zum Exportieren vorhanden. Bitte Design Editor öffnen.', 'error');
                return;
            }
        }
        
        // Zeige Optionen-Dialog
        this.showExportOptionsDialog();
    }
    
    showExportOptionsDialog() {
        // Entferne altes Modal falls vorhanden
        const existingModal = document.querySelector('.pdf-export-options-modal');
        if (existingModal) existingModal.remove();
        
        const resumeData = this.getResumeData();
        const defaultFilename = `Lebenslauf_${resumeData.firstName || 'Vorname'}_${resumeData.lastName || 'Nachname'}`.replace(/\s+/g, '_');
        
        const modal = document.createElement('div');
        modal.className = 'pdf-export-options-modal';
        modal.innerHTML = `
            <div class="export-options-content">
                <div class="export-options-header">
                    <h3><i class="fas fa-file-pdf"></i> PDF Export Optionen</h3>
                    <button class="btn-close" onclick="this.closest('.pdf-export-options-modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="export-options-body">
                    <div class="option-group">
                        <label>Dateiname</label>
                        <input type="text" id="pdfFilename" value="${defaultFilename}" class="option-input">
                    </div>
                    <div class="option-group">
                        <label>Qualität</label>
                        <select id="pdfQuality" class="option-select">
                            <option value="high">Hoch (beste Qualität, größere Datei)</option>
                            <option value="medium" selected>Standard (ausgewogen)</option>
                            <option value="low">Komprimiert (kleine Dateigröße)</option>
                        </select>
                    </div>
                    <div class="option-group">
                        <label>Format</label>
                        <select id="pdfFormat" class="option-select">
                            <option value="a4" selected>A4 (210 × 297 mm)</option>
                            <option value="letter">US Letter (216 × 279 mm)</option>
                        </select>
                    </div>
                    <div class="option-group checkbox-group">
                        <label>
                            <input type="checkbox" id="pdfPageNumbers">
                            <span>Seitenzahlen hinzufügen</span>
                        </label>
                    </div>
                    <div class="option-group checkbox-group">
                        <label>
                            <input type="checkbox" id="pdfMetadata" checked>
                            <span>Dokument-Metadaten einbetten</span>
                        </label>
                    </div>
                </div>
                <div class="export-options-footer">
                    <button class="btn-secondary" onclick="this.closest('.pdf-export-options-modal').remove()">
                        <i class="fas fa-times"></i> Abbrechen
                    </button>
                    <button class="btn-secondary" onclick="window.designEditor.previewPDF()">
                        <i class="fas fa-eye"></i> Vorschau
                    </button>
                    <button class="btn-secondary" onclick="window.designEditor.downloadPDFWithOptions(); this.closest('.pdf-export-options-modal').remove();">
                        <i class="fas fa-download"></i> Direkt exportieren
                    </button>
                    <button class="btn-primary" onclick="window.designEditor.downloadPDFWithOptions(); this.closest('.pdf-export-options-modal').remove();">
                        <i class="fas fa-file-pdf"></i> Exportieren & Vorschau
                    </button>
                </div>
            </div>
        `;
        
        // Styles
        const styles = document.createElement('style');
        styles.textContent = `
            .pdf-export-options-modal {
                position: fixed;
                top: 0; left: 0; right: 0; bottom: 0;
                background: rgba(0,0,0,0.7);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                padding: 20px;
            }
            .export-options-content {
                background: white;
                border-radius: 16px;
                max-width: 480px;
                width: 100%;
                box-shadow: 0 25px 50px rgba(0,0,0,0.3);
                overflow: hidden;
            }
            .export-options-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 1.25rem 1.5rem;
                background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                color: white;
            }
            .export-options-header h3 {
                margin: 0;
                font-size: 1.1rem;
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }
            .export-options-header .btn-close {
                background: rgba(255,255,255,0.2);
                border: none;
                color: white;
                width: 32px;
                height: 32px;
                border-radius: 50%;
                cursor: pointer;
            }
            .export-options-body {
                padding: 1.5rem;
            }
            .option-group {
                margin-bottom: 1rem;
            }
            .option-group label {
                display: block;
                font-weight: 500;
                margin-bottom: 0.5rem;
                color: #374151;
            }
            .option-input, .option-select {
                width: 100%;
                padding: 0.75rem;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                font-size: 0.95rem;
            }
            .checkbox-group label {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                cursor: pointer;
            }
            .checkbox-group input[type="checkbox"] {
                width: 18px;
                height: 18px;
            }
            .export-options-footer {
                display: flex;
                justify-content: flex-end;
                gap: 0.75rem;
                padding: 1rem 1.5rem;
                background: #f9fafb;
                border-top: 1px solid #e5e7eb;
            }
            .export-options-footer button {
                padding: 0.6rem 1.2rem;
                border-radius: 8px;
                font-size: 0.9rem;
                font-weight: 500;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }
            .btn-secondary {
                background: #f3f4f6;
                border: 1px solid #e5e7eb;
                color: #374151;
            }
            .btn-primary {
                background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                border: none;
                color: white;
            }
        `;
        modal.appendChild(styles);
        document.body.appendChild(modal);
    }
    
    async downloadPDFWithOptions() {
        const filename = document.getElementById('pdfFilename')?.value || 'Lebenslauf';
        const quality = document.getElementById('pdfQuality')?.value || 'medium';
        const format = document.getElementById('pdfFormat')?.value || 'a4';
        const addPageNumbers = document.getElementById('pdfPageNumbers')?.checked || false;
        const addMetadata = document.getElementById('pdfMetadata')?.checked || true;
        
        this.showNotification('PDF wird generiert...', 'info');
        
        try {
            console.log('🔄 Starte PDF-Generierung mit Optionen:', { quality, format, addPageNumbers, addMetadata });
            const pdfBlob = await this.generateResumePDF({
                quality,
                format,
                addPageNumbers,
                addMetadata
            });
            
            if (!pdfBlob || !(pdfBlob instanceof Blob)) {
                throw new Error('PDF-Generierung fehlgeschlagen: Kein gültiger Blob erhalten');
            }
            
            console.log('✅ PDF Blob erhalten:', pdfBlob.size, 'Bytes, Type:', pdfBlob.type);
            
            // Download
            const blob = pdfBlob; // Bereits ein Blob
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${filename}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            // Zeige auch Vorschau
            setTimeout(() => {
                // Konvertiere Blob zu ArrayBuffer für Preview
                blob.arrayBuffer().then(arrayBuffer => {
                    this.showPDFPreviewModal(arrayBuffer);
                }).catch(e => {
                    console.warn('⚠️ Vorschau konnte nicht angezeigt werden:', e);
                });
            }, 500);
            
            // Manche Browser/Implementierungen liefern einen Blob ohne zuverlässiges `size`.
            // Daher Größe robust bestimmen, um "NaN KB" zu vermeiden.
            let sizeBytes = blob && typeof blob.size === 'number' && Number.isFinite(blob.size) ? blob.size : null;
            if (sizeBytes == null) {
                try {
                    sizeBytes = (await blob.arrayBuffer()).byteLength;
                } catch (e) {
                    sizeBytes = null;
                }
            }
            const sizeKbLabel = sizeBytes != null ? `${Math.max(1, Math.round(sizeBytes / 1024))} KB` : 'unbekannte Größe';
            this.showNotification(`PDF exportiert! (${sizeKbLabel})`, 'success');
        } catch (error) {
            console.error('❌ PDF Export Fehler:', error);
            console.error('❌ Error Stack:', error?.stack);
            console.error('❌ Error Details:', {
                name: error.name,
                message: error.message,
                cause: error.cause
            });
            
            // Detaillierte Fehlermeldung
            let errorMessage = 'Fehler beim PDF-Export: ';
            if (error.message) {
                // Entferne URL aus Fehlermeldung für bessere Anzeige
                const cleanMessage = error.message.replace(/https?:\/\/[^\s]+/g, '').trim();
                errorMessage += cleanMessage;
            } else {
                errorMessage += 'Unbekannter Fehler';
            }
            
            // Wenn es um API Key geht, füge Hinweis hinzu (sollte nicht mehr nötig sein)
            if (error.message && error.message.includes('API Key')) {
                errorMessage += ' Bitte öffnen Sie die Einstellungen im Admin-Panel.';
                
                // Zeige zusätzlich einen prominenten Fehler-Banner
                this.showAPIKeyErrorBanner();
            }
            
            this.showNotification(errorMessage, 'error');
            
            // KEIN Fallback zu Legacy/Print-Dialog mehr - das verursacht das Problem
            // Stattdessen: Bitte Benutzer, es erneut zu versuchen oder Support zu kontaktieren
            console.error('PDF Export komplett fehlgeschlagen. Bitte Design Editor schließen und erneut öffnen.');
        }
    }
    
    async previewPDF() {
        this.showNotification('Vorschau wird erstellt...', 'info');
        
        try {
            // Hole Export-Optionen aus dem Dialog (falls vorhanden)
            const quality = document.getElementById('pdfQuality')?.value || 'medium';
            const format = document.getElementById('pdfFormat')?.value || 'a4';
            const addPageNumbers = document.getElementById('pdfPageNumbers')?.checked || false;
            const addMetadata = document.getElementById('pdfMetadata')?.checked || true;
            
            const pdfBytes = await this.generateResumePDF({
                quality,
                format,
                addPageNumbers,
                addMetadata
            });
            
            // Zeige PDF-Vorschau Modal
            this.showPDFPreviewModal(pdfBytes);
            
            this.showNotification('Vorschau erstellt', 'success');
        } catch (error) {
            console.error('Vorschau Fehler:', error);
            this.showNotification('Vorschau konnte nicht erstellt werden: ' + error.message, 'error');
        }
    }
    
    showPDFPreviewModal(pdfBytes) {
        // Entferne altes Modal falls vorhanden
        const existingModal = document.querySelector('.pdf-preview-modal');
        if (existingModal) {
            const oldUrl = existingModal.dataset.pdfUrl;
            if (oldUrl) URL.revokeObjectURL(oldUrl);
            existingModal.remove();
        }
        
        // Erstelle Blob URL für PDF (pdfBytes kann ArrayBuffer/Uint8Array/Blob sein)
        const blob = (pdfBytes instanceof Blob)
            ? pdfBytes
            : new Blob([pdfBytes], { type: 'application/pdf' });
        const pdfUrl = URL.createObjectURL(blob);
        
        const resumeData = this.getResumeData();
        const filename = document.getElementById('pdfFilename')?.value || 
            `Lebenslauf_${resumeData.firstName || 'Vorname'}_${resumeData.lastName || 'Nachname'}`.replace(/\s+/g, '_');
        
        const modal = document.createElement('div');
        modal.className = 'pdf-preview-modal';
        modal.dataset.pdfUrl = pdfUrl; // Speichere URL für Cleanup
        modal.innerHTML = `
            <div class="pdf-preview-content">
                <div class="pdf-preview-header">
                    <h3><i class="fas fa-file-pdf"></i> PDF Vorschau</h3>
                    <button class="btn-close" style="background: rgba(255,255,255,0.2); border: none; color: white; width: 32px; height: 32px; border-radius: 50%; cursor: pointer;">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="pdf-preview-body">
                    <iframe src="${pdfUrl}" style="width: 100%; height: 100%; border: none; background: #f0f0f0;"></iframe>
                </div>
                <div class="pdf-preview-footer">
                    <button class="btn-glass btn-cancel" style="background: rgba(100,116,139,0.8);">
                        <i class="fas fa-times"></i> Abbrechen
                    </button>
                    <button class="btn-glass btn-print" style="background: rgba(59,130,246,0.8);">
                        <i class="fas fa-print"></i> Drucken
                    </button>
                    <button class="btn-glass btn-primary btn-download">
                        <i class="fas fa-download"></i> PDF herunterladen
                    </button>
                </div>
            </div>
        `;
        
        // Event-Listener für Buttons
        const closeBtn = modal.querySelector('.btn-close');
        const cancelBtn = modal.querySelector('.btn-cancel');
        const printBtn = modal.querySelector('.btn-print');
        const downloadBtn = modal.querySelector('.btn-download');
        
        const closeModal = () => {
            modal.remove();
            URL.revokeObjectURL(pdfUrl);
        };
        
        closeBtn?.addEventListener('click', closeModal);
        cancelBtn?.addEventListener('click', closeModal);
        
        printBtn?.addEventListener('click', () => {
            this.printPDF(pdfUrl);
        });
        
        downloadBtn?.addEventListener('click', () => {
            this.downloadPDFFromPreview(pdfUrl, filename);
            closeModal();
        });
        
        // Schließen beim Klick außerhalb
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
        
        // Styles für das Modal
        const styles = document.createElement('style');
        styles.textContent = `
            .pdf-preview-modal {
                position: fixed;
                top: 0; left: 0; right: 0; bottom: 0;
                background: rgba(0, 0, 0, 0.85);
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
                animation: fadeIn 0.2s ease;
            }
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            .pdf-preview-content {
                background: #1e293b;
                border-radius: 12px;
                width: 100%;
                max-width: 1200px;
                height: 90vh;
                max-height: 900px;
                display: flex;
                flex-direction: column;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
                overflow: hidden;
            }
            .pdf-preview-header {
                padding: 20px 24px;
                background: rgba(30, 41, 59, 0.8);
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                display: flex;
                align-items: center;
                justify-content: space-between;
            }
            .pdf-preview-header h3 {
                margin: 0;
                color: white;
                font-size: 1.2rem;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            .pdf-preview-body {
                flex: 1;
                overflow: hidden;
                background: #0f172a;
                position: relative;
            }
            .pdf-preview-footer {
                padding: 16px 24px;
                background: rgba(30, 41, 59, 0.8);
                border-top: 1px solid rgba(255, 255, 255, 0.1);
                display: flex;
                gap: 12px;
                justify-content: flex-end;
            }
            .btn-glass {
                padding: 10px 20px;
                border: none;
                border-radius: 8px;
                color: white;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s;
                display: flex;
                align-items: center;
                gap: 8px;
                backdrop-filter: blur(10px);
            }
            .btn-glass:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            }
            .btn-glass.btn-primary {
                background: rgba(34, 197, 94, 0.8) !important;
            }
            @media (max-width: 768px) {
                .pdf-preview-content {
                    height: 100vh;
                    max-height: 100vh;
                    border-radius: 0;
                }
                .pdf-preview-footer {
                    flex-direction: column;
                }
                .btn-glass {
                    width: 100%;
                    justify-content: center;
                }
            }
        `;
        
        document.head.appendChild(styles);
        document.body.appendChild(modal);
        
        // Cleanup beim Schließen
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
                URL.revokeObjectURL(pdfUrl);
            }
        });
    }
    
    printPDF(pdfUrl) {
        try {
            const printWindow = window.open(pdfUrl, '_blank');
            if (printWindow) {
                printWindow.onload = () => {
                    setTimeout(() => {
                        printWindow.print();
                    }, 500);
                };
            } else {
                this.showNotification('Pop-up-Blocker verhindert Drucken. Bitte erlauben Sie Pop-ups.', 'warning');
            }
        } catch (error) {
            console.error('Druck-Fehler:', error);
            this.showNotification('Fehler beim Drucken', 'error');
        }
    }
    
    downloadPDFFromPreview(pdfUrl, filename) {
        try {
            const a = document.createElement('a');
            a.href = pdfUrl;
            a.download = `${filename}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            this.showNotification(`PDF exportiert! (${filename}.pdf)`, 'success');
        } catch (error) {
            console.error('Download-Fehler:', error);
            this.showNotification('Fehler beim Download', 'error');
        }
    }
    
    async generateResumePDF(options = {}) {
        // Suche nach der Design-Editor Preview
        const preview = document.querySelector('.design-resume-preview');
        if (!preview) {
            // Fallback: Suche nach resumePreview (für Kompatibilität)
            const fallbackPreview = document.getElementById('resumePreview');
            if (!fallbackPreview) {
                throw new Error('Preview nicht gefunden. Bitte Design Editor öffnen.');
            }
            return this.generateResumePDFFromElement(fallbackPreview, options);
        }
        return this.generateResumePDFFromElement(preview, options);
    }
    
    async generateResumePDFFromElement(preview, options = {}) {
        // Prüfe ob Preview-Element existiert und Inhalt hat
        if (!preview) {
            throw new Error('Preview-Element nicht gefunden. Bitte Design Editor öffnen und Vorschau aktualisieren.');
        }
        
        // Prüfe ob Preview Inhalt hat
        const hasContent = preview.children.length > 0 || preview.textContent.trim().length > 0 || preview.innerHTML.trim().length > 0;
        if (!hasContent) {
            console.warn('⚠️ Preview-Element ist leer. Versuche Preview zu aktualisieren...');
            this.updatePreview();
            // Warte kurz und prüfe erneut
            await new Promise(resolve => setTimeout(resolve, 500));
            const updatedPreview = document.querySelector('.design-resume-preview');
            if (!updatedPreview || (!updatedPreview.children.length && !updatedPreview.textContent.trim().length)) {
                throw new Error('Preview-Element ist leer. Bitte Lebenslauf-Daten eingeben und Design Editor erneut öffnen.');
            }
            // Verwende aktualisiertes Preview
            preview = updatedPreview;
        }
        
        console.log('📄 Preview-Element gefunden:', {
            hasChildren: preview.children.length > 0,
            textLength: preview.textContent.trim().length,
            innerHTMLLength: preview.innerHTML.trim().length,
            element: preview
        });

        // WICHTIG: Stabilisiere DOM/Fonts/Images vor dem Clonen (Race-Conditions vermeiden)
        await this.freezePreviewForPDF(preview);
        
        const { format = 'A4', addPageNumbers = false } = options;
        
        // Verwende Puppeteer für vollständige CSS-Unterstützung
        return await this.generateResumePDFWithPuppeteer(preview, { format, addPageNumbers });
    }
    
    /**
     * Stabilisiert die Preview, damit Export deterministisch wird:
     * - wartet auf Layout-Settling (2× rAF)
     * - wartet kurz auf Fonts (document.fonts.ready)
     * - wartet auf Images (decode/load), damit Layout/Zeilenumbrüche konsistent sind
     */
    async freezePreviewForPDF(preview, options = {}) {
        const timeoutMs = Number(options.timeoutMs || 4000);
        const timeout = (ms) => new Promise(resolve => setTimeout(resolve, ms));
        const withTimeout = async (promise, ms) => Promise.race([promise, timeout(ms)]);
        const raf = () => new Promise(resolve => requestAnimationFrame(() => resolve()));

        try {
            // 1) Layout settle
            await raf();
            await raf();

            // 2) Fonts (best-effort)
            if (document.fonts && document.fonts.ready) {
                await withTimeout(document.fonts.ready, timeoutMs);
            }

            // 3) Images (best-effort)
            const images = Array.from(preview.querySelectorAll('img'));
            const pending = images.filter(img => !(img.complete && img.naturalWidth > 0));

            if (pending.length > 0) {
                const waitImage = (img) => new Promise(resolve => {
                    const done = () => resolve();
                    // decode() ist genauer, aber nicht überall zuverlässig
                    if (typeof img.decode === 'function') {
                        img.decode().then(done).catch(() => {
                            img.addEventListener('load', done, { once: true });
                            img.addEventListener('error', done, { once: true });
                        });
                    } else {
                        img.addEventListener('load', done, { once: true });
                        img.addEventListener('error', done, { once: true });
                    }
                });

                await withTimeout(Promise.allSettled(pending.map(waitImage)), timeoutMs);
            }
        } catch (e) {
            console.warn('⚠️ freezePreviewForPDF() konnte Preview nicht vollständig stabilisieren:', e);
        }
    }

    async generateResumePDFWithPuppeteer(preview, options) {
        const { format = 'A4', addPageNumbers = false } = options;
        
        console.log('🔄 Generiere PDF mit direkter HTML-zu-PDF Konvertierung (AWS Lambda)...');
        
        // Stelle sicher, dass Settings geladen sind
        if (!this.settings || Object.keys(this.settings).length === 0) {
            this.settings = this.loadSettings();
        }
        
        // Klone das Preview-Element
        const clone = preview.cloneNode(true);

        // WICHTIG: Canvas-Inhalte (z.B. Unterschrift) in Clone übernehmen
        this.replaceCanvasesWithImages(preview, clone);

        // WICHTIG: Nach Möglichkeit Bilder in den Clone einbetten (data: URLs), damit Lambda sie sicher rendern kann
        await this.inlineImagesAsDataUrls(clone);
        
        // WICHTIG: Extrahiere ALLE computed styles vom Original und wende sie auf den Clone an
        // Das ist der Schlüssel, damit das Design vollständig übernommen wird
        // NOTE: In einigen Versionen ist `copyComputedStylesToClone` nicht implementiert.
        // Für Stabilität: nur aufrufen, wenn vorhanden.
        if (typeof this.copyComputedStylesToClone === 'function') {
            this.copyComputedStylesToClone(preview, clone);
        } else {
            console.warn('⚠️ copyComputedStylesToClone() fehlt – fahre ohne computed-style Copy fort');
        }
        
        // WICHTIG: Ersetze ALLE CSS-Variablen im geklonten HTML durch tatsächliche Werte
        this.replaceCSSVariablesInElement(clone);
        
        // WICHTIG: Wende Design-Settings direkt auf den Clone an (für PDF-Export)
        // Das stellt sicher, dass alle Styles korrekt übernommen werden
        this.applyDesignSettingsToElement(clone, true); // true = isPDFExport
        
        // Generiere vollständiges HTML-Dokument (wie andere Anwendungen es machen - OHNE GPT!)
        const htmlContent = this.generateCompleteHTMLDocument(clone);
        
        console.log('📄 HTML generiert, Länge:', htmlContent.length, 'Zeichen');
        console.log('🚀 Verwende direkte PDF-Generierung (ohne GPT) - wie andere Anwendungen');
        
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
        
        // Validiere URL-Format
        try {
            new URL(apiUrl);
        } catch (e) {
            console.error('❌ Ungültige PDF Generator API URL:', apiUrl);
            throw new Error(`Ungültige PDF Generator API URL: ${apiUrl}. Bitte aws-app-config.js prüfen.`);
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
                format: format,
                printBackground: true,
                preferCSSPageSize: false,
                // NOTE: Die Lambda `pdf-generator` erzwingt Puppeteer-Margins = 0mm.
                // Die echten Ränder kommen deshalb aus dem HTML-Padding (mm) der `.design-resume-preview`.
                margin: { top: '0mm', right: '0mm', bottom: '0mm', left: '0mm' },
                displayHeaderFooter: addPageNumbers,
                footerTemplate: addPageNumbers ? `
                    <div style="font-size: 10px; text-align: center; width: 100%; padding: 0 20mm;">
                        <span class="pageNumber"></span> / <span class="totalPages"></span>
                    </div>
                ` : ''
            }
        });

        const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
        const maxAttempts = 3;
        let lastError = null;

        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            // AbortController für Timeout (25 Sekunden - Lambda sollte schnell sein ohne GPT)
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 25000);

            try {
                console.log(`📡 PDF-Export Attempt ${attempt}/${maxAttempts}`);
                console.log('📡 PDF-Export Request Details:', {
                    url: apiUrl,
                    htmlLength: htmlContent.length,
                    format: format,
                    addPageNumbers: addPageNumbers,
                    attempt: attempt,
                    hasAuthToken: !!authToken
                });
                
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
                        await delay(500 * attempt + 250);
                        continue;
                    }

                    throw new Error(`PDF-Generierung fehlgeschlagen: ${message}`);
                }
            
            // API Gateway gibt Base64 direkt im Body zurück (wegen isBase64Encoded: true)
            const contentType = response.headers.get('Content-Type');
            console.log('📦 Response Content-Type:', contentType);
            console.log('📦 Response Status:', response.status, response.statusText);
            console.log('📦 Response Headers:', Object.fromEntries(response.headers.entries()));
            
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
                
                // Validiere Response-Größe (sollte mindestens einige KB sein für ein gültiges PDF)
                if (base64Data.length < 100) {
                    console.error('❌ Response zu klein für gültiges PDF:', base64Data.length, 'Zeichen');
                    throw new Error('PDF-Generierung fehlgeschlagen: Response zu klein. Möglicherweise wurde ein Fehler zurückgegeben.');
                }
                
                // Prüfe, ob es wirklich Base64 ist (nicht bereits ein Fehler-JSON)
                if (base64Data.trim().startsWith('{')) {
                    try {
                        const errorData = JSON.parse(base64Data);
                        const errorMessage = errorData.error || errorData.message || 'Unbekannter Fehler';
                        const errorType = errorData.type || 'Unknown';
                        console.error('❌ PDF-Generator Fehler-Response:', {
                            error: errorMessage,
                            type: errorType,
                            status: response.status
                        });
                        throw new Error(`PDF-Generierung fehlgeschlagen: ${errorMessage}`);
                    } catch (jsonError) {
                        // Wenn es kein JSON ist, ist es wahrscheinlich Base64
                        if (jsonError.message.includes('PDF-Generierung fehlgeschlagen')) {
                            throw jsonError; // Re-throw wenn es ein Fehler-JSON war
                        }
                    }
                }
                
                // Validiere Base64-Format (sollte nur Base64-Zeichen enthalten)
                const base64Regex = /^[A-Za-z0-9+/=\s]+$/;
                if (!base64Regex.test(base64Data.trim())) {
                    console.error('❌ Response enthält ungültige Base64-Zeichen');
                    throw new Error('PDF-Generierung fehlgeschlagen: Ungültiges Base64-Format in Response.');
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
                
                // Validiere PDF-Größe (sollte mindestens einige KB sein)
                if (pdfBlob.size < 1000) {
                    console.error('❌ PDF Blob zu klein:', pdfBlob.size, 'Bytes');
                    throw new Error('PDF-Generierung fehlgeschlagen: Generiertes PDF ist zu klein. Möglicherweise wurde ein Fehler zurückgegeben.');
                }
                
                // Validiere PDF-Header (sollte mit %PDF beginnen)
                const pdfHeader = await pdfBlob.slice(0, 4).text();
                if (!pdfHeader.startsWith('%PDF')) {
                    console.error('❌ PDF Blob hat ungültigen Header:', pdfHeader);
                    throw new Error('PDF-Generierung fehlgeschlagen: Generiertes PDF hat ungültigen Header.');
                }
                
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

                // Detailliertes Error-Logging
                console.error('❌ PDF-Export Fehler (Attempt', attempt, '):', {
                    name: error?.name,
                    message: error?.message,
                    stack: error?.stack,
                    type: error?.constructor?.name
                });

                const isAbort = error && error.name === 'AbortError';
                const isNetworkOrCors = error instanceof TypeError || /Failed to fetch/i.test(String(error && error.message ? error.message : error));
                const isTimeout = isAbort || /timeout/i.test(String(error?.message || ''));

                // In der Praxis: "CORS blocked" ist oft ein Gateway-Error ohne CORS-Header (502/504/413).
                if (attempt < maxAttempts && (isAbort || isNetworkOrCors)) {
                    console.warn('⚠️ PDF-Export Netz/Timeout Problem – retry:', error);
                    await delay(750 * attempt);
                    continue;
                }

                // Spezifische Fehlermeldungen für verschiedene Fehlertypen
                if (isTimeout || isAbort) {
                    console.error('❌ PDF Export Timeout: Die Anfrage dauerte länger als 25 Sekunden');
                    const timeoutMessage = 'PDF-Generierung dauerte zu lange. Bitte versuchen Sie es erneut oder vereinfachen Sie das Dokument.';
                    this.showNotification(timeoutMessage, 'error');
                    throw new Error(timeoutMessage);
                }

                if (isNetworkOrCors) {
                    const networkMessage = 'PDF-Generator nicht erreichbar (Netzwerk/CORS). Bitte erneut versuchen.';
                    console.error('❌ Network/CORS Error:', error);
                    this.showNotification(networkMessage, 'error');
                    throw new Error(networkMessage);
                }

                // Generischer Fehler mit detaillierter Meldung
                const errorMessage = error?.message || 'Unbekannter Fehler beim PDF-Export';
                console.error('❌ PDF-Export fehlgeschlagen:', errorMessage);
                this.showNotification(`PDF-Export fehlgeschlagen: ${errorMessage}`, 'error');
                throw error;
            }
        }

        throw lastError || new Error('PDF-Export fehlgeschlagen (unbekannt)');
    }

    /**
     * Ersetzt Canvas-Elemente im Clone durch <img>, basierend auf den Canvas-Inhalten im Original-DOM.
     * Dadurch werden z.B. gezeichnete Unterschriften im PDF sichtbar (Canvas-Inhalte werden beim cloneNode nicht übernommen).
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
     * Das erhöht die Erfolgsquote in Puppeteer/Lambda, insbesondere bei blob:-URLs oder geschützten Ressourcen.
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
                if (!src || src.startsWith('data:')) continue;

                // Best-effort fetch; wenn CORS blockt, lassen wir es so stehen.
                const response = await fetch(src, { mode: 'cors', credentials: 'omit' });
                if (!response.ok) continue;
                const blob = await response.blob();
                const dataUrl = await blobToDataUrl(blob);
                if (dataUrl && dataUrl.startsWith('data:image/')) {
                    img.setAttribute('src', dataUrl);
                }
            } catch (e) {
                // Ignorieren – nicht jedes Bild ist einbettbar
            }
        }
    }
    
    // ═══════════════════════════════════════════════════════════════════════════
    // LEGACY GPT-5.2 MODUS (DEPRECATED - wird nicht mehr verwendet)
    // ═══════════════════════════════════════════════════════════════════════════
    // Dieser Code-Pfad ist veraltet und wird nicht mehr verwendet.
    // Die neue Implementierung verwendet direkten HTML-Export (siehe oben).
    // Dieser Code bleibt für Referenz, sollte aber nicht mehr ausgeführt werden.
    
    // ═══════════════════════════════════════════════════════════════════════════
    // LEGACY CODE ENTFERNT
    // ═══════════════════════════════════════════════════════════════════════════
    // Der alte GPT-5.2 Modus wurde vollständig entfernt.
    // Die neue Implementierung verwendet direkten HTML-Export (siehe generateResumePDFWithPuppeteer oben).
    
    /* LEGACY CODE - VOLLSTÄNDIG ENTFERNT
        const { format = 'A4', addPageNumbers = false } = options;
        
        console.log('🔄 Generiere PDF mit GPT-5.2 + Puppeteer (AWS Lambda)...');
        
        // Stelle sicher, dass Settings geladen sind
        if (!this.settings || Object.keys(this.settings).length === 0) {
            this.settings = this.loadSettings();
        }
        
        // Klone das Preview-Element
        const clone = preview.cloneNode(true);
        
        // WICHTIG: Ersetze ALLE CSS-Variablen im geklonten HTML durch tatsächliche Werte
        this.replaceCSSVariablesInElement(clone);
        
        // Extrahiere HTML-Inhalt für GPT-5.2
        const content = clone.outerHTML;
        
        // Hole OpenAI API Key
        let openaiApiKey = null;
        const keySources = [];
        
        try {
            console.log('📋 Verfügbare Services:', {
                awsAPISettings: !!window.awsAPISettings,
                GlobalAPIManager: !!window.GlobalAPIManager,
                globalApiManager: !!window.globalApiManager,
                isLoggedIn: window.awsAPISettings ? window.awsAPISettings.isUserLoggedIn() : false
            });
            
            // PRIORITÄT 1: Versuche globale Keys über AWS API (funktioniert auch ohne Login)
            if (window.awsAPISettings) {
                try {
                    console.log('🔍 Versuche globale Keys über AWS API...');
                    const key = await window.awsAPISettings.getFullApiKey('openai', true); // useGlobal = true
                    if (key && typeof key === 'string' && key.startsWith('sk-') && key.length > 20) {
                        openaiApiKey = key;
                        console.log('✅ OpenAI API Key aus globalen Settings geladen (Länge:', key.length + ')');
                        keySources.push('AWS Global Settings');
                    } else {
                        console.warn('⚠️ Globale Keys zurückgegeben, aber Format ungültig:', typeof key, key ? key.substring(0, 10) + '...' : 'null');
                    }
                } catch (e) {
                    console.log('ℹ️ Globale Keys nicht verfügbar:', e.message);
                }
            } else {
                console.warn('⚠️ window.awsAPISettings nicht verfügbar');
            }
            
            // PRIORITÄT 2: Versuche user-spezifische Keys (wenn eingeloggt)
            if (!openaiApiKey && window.awsAPISettings) {
                try {
                    const isLoggedIn = window.awsAPISettings.isUserLoggedIn && window.awsAPISettings.isUserLoggedIn();
                    if (isLoggedIn) {
                        console.log('🔍 Versuche user-spezifische Keys...');
                        const key = await window.awsAPISettings.getFullApiKey('openai', false);
                        if (key && typeof key === 'string' && key.startsWith('sk-') && key.length > 20) {
                            openaiApiKey = key;
                            console.log('✅ OpenAI API Key aus user-spezifischen Settings geladen (Länge:', key.length + ')');
                            keySources.push('AWS User Settings');
                        }
                    } else {
                        console.log('ℹ️ User nicht eingeloggt, überspringe user-spezifische Keys');
                    }
                } catch (e) {
                    console.log('ℹ️ User-spezifische Keys nicht verfügbar:', e.message);
                }
            }
            
            // PRIORITÄT 3: Versuche GlobalAPIManager
            if (!openaiApiKey && window.GlobalAPIManager) {
                try {
                    console.log('🔍 Versuche GlobalAPIManager...');
                    const config = window.GlobalAPIManager.getServiceConfig('openai');
                    if (config && config.key && typeof config.key === 'string' && config.key.startsWith('sk-')) {
                        openaiApiKey = config.key;
                        console.log('✅ OpenAI API Key aus GlobalAPIManager geladen');
                        keySources.push('GlobalAPIManager');
                    }
                } catch (e) {
                    console.log('ℹ️ GlobalAPIManager Fehler:', e.message);
                }
            }
            
            // PRIORITÄT 4: Versuche globalApiManager
            if (!openaiApiKey && window.globalApiManager) {
                try {
                    console.log('🔍 Versuche globalApiManager...');
                    const key = await window.globalApiManager.getApiKey('openai');
                    if (key && typeof key === 'string' && key.startsWith('sk-')) {
                        openaiApiKey = key;
                        console.log('✅ OpenAI API Key aus globalApiManager geladen');
                        keySources.push('globalApiManager');
                    }
                } catch (e) {
                    console.log('ℹ️ globalApiManager Fehler:', e.message);
                }
            }
            
            // PRIORITÄT 5: Versuche localStorage (Fallback)
            if (!openaiApiKey) {
                console.log('🔍 Versuche localStorage...');
                const localKeys = ['openai_api_key', 'admin_openai_api_key', 'ki_api_settings'];
                for (const key of localKeys) {
                    const value = localStorage.getItem(key);
                    if (value && typeof value === 'string' && value.startsWith('sk-') && value.length > 20) {
                        openaiApiKey = value;
                        console.log(`✅ OpenAI API Key aus localStorage geladen (${key}, Länge: ${value.length})`);
                        keySources.push(`localStorage (${key})`);
                        break;
                    }
                }
            }
            
            // PRIORITÄT 6: Versuche global_api_keys aus localStorage
            if (!openaiApiKey) {
                try {
                    console.log('🔍 Versuche global_api_keys aus localStorage...');
                    const globalKeys = JSON.parse(localStorage.getItem('global_api_keys') || '{}');
                    if (globalKeys.openai && globalKeys.openai.key) {
                        const key = globalKeys.openai.key;
                        if (typeof key === 'string' && key.startsWith('sk-') && key.length > 20 && !key.includes('...')) {
                            openaiApiKey = key;
                            console.log('✅ OpenAI API Key aus global_api_keys geladen (Länge:', key.length + ')');
                            keySources.push('localStorage (global_api_keys)');
                        } else {
                            console.warn('⚠️ global_api_keys.openai.key ist maskiert oder ungültig');
                        }
                    }
                } catch (e) {
                    console.log('ℹ️ global_api_keys nicht verfügbar:', e.message);
                }
            }
        } catch (e) {
            console.error('❌ Fehler beim Laden des API Keys:', e);
        }
        
        // Validierung des API Keys
        if (openaiApiKey) {
            if (typeof openaiApiKey !== 'string') {
                console.error('❌ API Key ist kein String:', typeof openaiApiKey);
                openaiApiKey = null;
            } else if (!openaiApiKey.startsWith('sk-')) {
                console.error('❌ API Key beginnt nicht mit "sk-":', openaiApiKey.substring(0, 10) + '...');
                openaiApiKey = null;
            } else if (openaiApiKey.length < 20) {
                console.error('❌ API Key zu kurz:', openaiApiKey.length);
                openaiApiKey = null;
            } else if (openaiApiKey.includes('...')) {
                console.error('❌ API Key ist maskiert (enthält "...")');
                openaiApiKey = null;
            }
        }
        
        if (!openaiApiKey) {
            console.error('❌ Kein gültiger OpenAI API Key gefunden');
            console.error('📋 Geprüfte Quellen:', keySources.length > 0 ? keySources.join(', ') : 'Keine');
            const settingsUrl = window.location.origin + '/admin#ai-settings';
            throw new Error(`OpenAI API Key nicht gefunden. Bitte konfigurieren Sie den API Key in den Einstellungen: ${settingsUrl}`);
        }
        
        console.log('✅ Gültiger OpenAI API Key gefunden (Quelle:', keySources.join(', ') + ')');
        
        // Rufe GPT-5.2 Lambda API auf
        const apiUrl = window.getApiUrl('PDF_GENERATOR');
        if (!apiUrl) {
            throw new Error('PDF Generator API URL nicht gefunden. Bitte aws-app-config.js prüfen.');
        }
        
                console.log('📡 Sende Anfrage an GPT-5.2 Lambda:', apiUrl);
        console.log('📐 Settings:', {
            marginTop: this.settings.marginTop,
            marginRight: this.settings.marginRight,
            marginBottom: this.settings.marginBottom,
            marginLeft: this.settings.marginLeft,
            fontSize: this.settings.fontSize,
            fontFamily: this.settings.fontFamily,
            lineHeight: this.settings.lineHeight,
            textColor: this.settings.textColor,
            backgroundColor: this.settings.backgroundColor
        });
        
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
        
        // AbortController für Timeout (35 Sekunden - länger als API Gateway Timeout)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 35000);
        
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {})
                },
                signal: controller.signal, // Timeout-Signal
                body: JSON.stringify({
                content: content, // HTML-Inhalt für GPT-5.2
                settings: {
                    marginTop: Number(this.settings.marginTop) || 20,
                    marginRight: Number(this.settings.marginRight) || 20,
                    marginBottom: Number(this.settings.marginBottom) || 20,
                    marginLeft: Number(this.settings.marginLeft) || 20,
                    fontSize: Number(this.settings.fontSize) || 11,
                    fontFamily: this.settings.fontFamily || 'Inter',
                    lineHeight: Number(this.settings.lineHeight) || 1.5,
                    textColor: this.settings.textColor || '#1e293b',
                    backgroundColor: this.settings.backgroundColor || '#ffffff'
                },
                openaiApiKey: openaiApiKey, // API Key für GPT-5.2
                options: {
                    format: format,
                    printBackground: true,
                    preferCSSPageSize: false,
                    margin: {
                        top: '0mm',
                        right: '0mm',
                        bottom: '0mm',
                        left: '0mm'
                    },
                    displayHeaderFooter: addPageNumbers,
                    footerTemplate: addPageNumbers ? `
                        <div style="font-size: 10px; text-align: center; width: 100%; padding: 0 20mm;">
                            <span class="pageNumber"></span> / <span class="totalPages"></span>
                        </div>
                    ` : ''
                }
            })
            });
            
            clearTimeout(timeoutId); // Timeout löschen wenn erfolgreich
        
        if (!response.ok) {
            const errorText = await response.text();
            let errorData;
            try {
                errorData = JSON.parse(errorText);
            } catch (e) {
                errorData = { error: errorText };
            }
            throw new Error(`PDF-Generierung fehlgeschlagen: ${errorData.error || errorData.message || 'Unbekannter Fehler'}`);
        }
        
        // API Gateway gibt Base64 direkt im Body zurück (wegen isBase64Encoded: true)
        // API Gateway dekodiert Base64 automatisch, also sollten wir direkt ArrayBuffer lesen
        const contentType = response.headers.get('Content-Type');
        console.log('📦 Response Content-Type:', contentType);
        console.log('📦 Response Status:', response.status, response.statusText);
        
        if (contentType && contentType.includes('application/pdf')) {
            try {
                // Versuche zuerst als ArrayBuffer zu lesen (wenn API Gateway bereits dekodiert hat)
                const arrayBuffer = await response.arrayBuffer();
                const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
                console.log('✅ PDF generiert mit GPT-5.2 (ArrayBuffer):', blob.size, 'Bytes');
                return blob;
            } catch (arrayBufferError) {
                console.warn('⚠️ ArrayBuffer-Lesen fehlgeschlagen, versuche Base64:', arrayBufferError);
                // Fallback: Versuche als Base64-Text zu lesen
                try {
                    const base64Data = await response.text();
                    // Entferne mögliche Whitespace/Newlines
                    const cleanBase64 = base64Data.trim().replace(/\s/g, '');
                    const binaryString = atob(cleanBase64);
                    const bytes = new Uint8Array(binaryString.length);
                    for (let i = 0; i < binaryString.length; i++) {
                        bytes[i] = binaryString.charCodeAt(i);
                    }
                    const blob = new Blob([bytes], { type: 'application/pdf' });
                    console.log('✅ PDF generiert mit GPT-5.2 (Base64):', blob.size, 'Bytes');
                    return blob;
                } catch (base64Error) {
                    console.error('❌ Base64-Dekodierung fehlgeschlagen:', base64Error);
                    throw new Error('PDF-Generierung fehlgeschlagen: Konnte Response nicht dekodieren');
                }
            }
        } else {
            // Fallback: Versuche JSON zu parsen (falls API anders antwortet)
            try {
                const responseData = await response.json();
                console.log('📦 Response als JSON erhalten:', Object.keys(responseData));
                if (responseData.body) {
                    const cleanBase64 = responseData.body.trim().replace(/\s/g, '');
                    const binaryString = atob(cleanBase64);
                    const bytes = new Uint8Array(binaryString.length);
                    for (let i = 0; i < binaryString.length; i++) {
                        bytes[i] = binaryString.charCodeAt(i);
                    }
                    const blob = new Blob([bytes], { type: 'application/pdf' });
                    console.log('✅ PDF generiert (JSON):', blob.size, 'Bytes');
                    return blob;
                }
            } catch (e) {
                console.error('❌ Fehler beim Parsen der Response:', e);
                // Versuche noch als ArrayBuffer
                try {
                    const arrayBuffer = await response.arrayBuffer();
                    const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
                    console.log('✅ PDF generiert (ArrayBuffer Fallback):', blob.size, 'Bytes');
                    return blob;
                } catch (finalError) {
                    console.error('❌ Alle Versuche fehlgeschlagen:', finalError);
                    throw new Error(`PDF-Generierung fehlgeschlagen: Unerwartetes Response-Format. Content-Type: ${contentType}`);
                }
            }
            throw new Error('PDF-Generierung fehlgeschlagen: Unerwartetes Response-Format');
        }
        } catch (error) {
            clearTimeout(timeoutId); // Timeout löschen auch bei Fehler
            if (error.name === 'AbortError') {
                console.error('❌ PDF Export Timeout: Die Anfrage dauerte länger als 35 Sekunden');
                throw new Error('PDF-Generierung dauerte zu lange. Bitte versuchen Sie es erneut oder verwenden Sie eine einfachere Vorlage.');
            }
            throw error; // Andere Fehler weiterwerfen
        }
        */ // ENDE LEGACY CODE
    
    applyDesignSettingsToElement(element, isPDFExport = false) {
        // Wende alle Design-Editor-Settings direkt auf Elemente an (ersetzt CSS-Variablen)
        const fontFamily = this.settings.fontFamily || "'Inter', sans-serif";
        const fontSize = this.settings.fontSize || 11;
        const headingSize = this.settings.headingSize || 14;
        const lineHeight = this.settings.lineHeight || 1.5;
        const accentColor = this.settings.accentColor || '#6366f1';
        const textColor = this.settings.textColor || '#1e293b';
        const mutedColor = this.settings.mutedColor || '#64748b';
        const backgroundColor = this.settings.backgroundColor || '#ffffff';
        const sectionGap = this.settings.sectionGap || 24;
        const itemGap = this.settings.itemGap || 12;
        const paragraphGap = this.settings.paragraphGap || 6;
        const marginTop = this.settings.marginTop || 20;
        const marginRight = this.settings.marginRight || 20;
        const marginBottom = this.settings.marginBottom || 20;
        const marginLeft = this.settings.marginLeft || 20;
        
        // Haupt-Container
        if (element.classList.contains('design-resume-preview')) {
            element.style.setProperty('font-family', fontFamily, 'important');
            element.style.setProperty('font-size', fontSize + 'pt', 'important');
            element.style.setProperty('line-height', lineHeight, 'important');
            element.style.setProperty('color', textColor, 'important');
            element.style.setProperty('background-color', backgroundColor, 'important');
            // WICHTIG (PDF): Die Lambda `pdf-generator` erzwingt Puppeteer-Margins = 0mm.
            // Daher müssen die im Design-Editor eingestellten Ränder als mm-Padding
            // am Hauptcontainer umgesetzt werden (single source of truth).
            if (isPDFExport) {
                element.style.setProperty('padding', `${marginTop}mm ${marginRight}mm ${marginBottom}mm ${marginLeft}mm`, 'important');
                element.style.setProperty('margin', '0', 'important');
                // Export: Zoom/Transforms dürfen nicht in den PDF-Export leaken
                element.style.setProperty('transform', 'none', 'important');
                element.style.setProperty('transform-origin', 'top left', 'important');
            } else {
                element.style.padding = `${marginTop}mm ${marginRight}mm ${marginBottom}mm ${marginLeft}mm`;
            }
        }
        
        // Header
        const headerAlign = this.settings.headerAlign || 'center';
        const headers = element.querySelectorAll('.resume-preview-header, .resume-preview-name');
        headers.forEach(header => {
            header.style.setProperty('color', accentColor, 'important');
            header.style.setProperty('font-size', (headingSize + 4) + 'pt', 'important');
            header.style.setProperty('margin-bottom', sectionGap + 'px', 'important');
            header.style.setProperty('text-align', headerAlign, 'important');
        });
        
        // Section Titles
        const sectionTitles = element.querySelectorAll('.resume-preview-section-title');
        sectionTitles.forEach(title => {
            title.style.setProperty('color', accentColor, 'important');
            title.style.setProperty('font-size', headingSize + 'pt', 'important');
            title.style.setProperty('margin-top', sectionGap + 'px', 'important');
            title.style.setProperty('margin-bottom', itemGap + 'px', 'important');
        });
        
        // Items
        const items = element.querySelectorAll('.resume-preview-item');
        items.forEach(item => {
            item.style.setProperty('margin-bottom', itemGap + 'px', 'important');
        });
        
        // Paragraphs
        const paragraphs = element.querySelectorAll('p');
        paragraphs.forEach(p => {
            p.style.setProperty('margin-bottom', paragraphGap + 'px', 'important');
            p.style.setProperty('font-size', fontSize + 'pt', 'important');
            p.style.setProperty('line-height', lineHeight, 'important');
            p.style.setProperty('color', textColor, 'important');
        });
        
        // Muted Text
        const mutedElements = element.querySelectorAll('.resume-preview-birthdate, .resume-preview-contact, .resume-preview-item-date, .resume-preview-item-subtitle');
        mutedElements.forEach(el => {
            el.style.setProperty('color', mutedColor, 'important');
            el.style.setProperty('font-size', (fontSize * 0.9) + 'pt', 'important');
        });
        
        // Skills
        const skillElements = element.querySelectorAll('.resume-preview-skill, .resume-skill-bar-fill, .resume-skill-dot.filled, .resume-skill-numeric');
        skillElements.forEach(el => {
            el.style.setProperty('color', accentColor, 'important');
            if (el.classList.contains('resume-skill-bar-fill')) {
                el.style.setProperty('background', accentColor, 'important');
            }
        });
        
        // Two-Column Layout
        if (this.settings.twoColumnLayout && this.settings.twoColumnLayout !== 'none') {
            const columnsContainer = element.querySelector('.resume-preview-columns');
            if (columnsContainer) {
                columnsContainer.style.setProperty('display', 'flex', 'important');
                columnsContainer.style.setProperty('gap', (this.settings.columnGap || 24) + 'px', 'important');
                
                const leftColumn = element.querySelector('.resume-preview-column-left');
                const rightColumn = element.querySelector('.resume-preview-column-right');
                if (leftColumn && rightColumn) {
                    const columnWidth = this.settings.columnWidth || 50;
                    leftColumn.style.setProperty('width', columnWidth + '%', 'important');
                    rightColumn.style.setProperty('width', (100 - columnWidth) + '%', 'important');
                }
            }
        }
    }
    
    getGoogleFontsUrl(fontFamily) {
        // Google Fonts Mapping
        const googleFonts = {
            'Inter': 'Inter:wght@300;400;500;600;700',
            'Roboto': 'Roboto:wght@300;400;500;700',
            'Open Sans': 'Open+Sans:wght@300;400;500;600;700',
            'Lato': 'Lato:wght@300;400;700',
            'Montserrat': 'Montserrat:wght@300;400;500;600;700',
            'Source Sans Pro': 'Source+Sans+Pro:wght@300;400;600;700',
            'Nunito': 'Nunito:wght@300;400;500;600;700',
            'Merriweather': 'Merriweather:wght@300;400;700',
            'Playfair Display': 'Playfair+Display:wght@400;500;600;700',
            'Source Code Pro': 'Source+Code+Pro:wght@400;500;600'
        };
        
        // Font-Family kann Werte wie "'Inter', sans-serif" enthalten -> wir nehmen den ersten Familiennamen
        const primary = String(fontFamily || '').split(',')[0].trim().replace(/'/g, '').replace(/"/g, '');
        const fontKey = primary;
        if (googleFonts[fontKey]) {
            return `https://fonts.googleapis.com/css2?family=${googleFonts[fontKey]}&display=swap`;
        }
        return null;
    }
    
    extractAllCSS() {
        const styles = [];
        
        // 1. Alle Stylesheets (inkl. Google Fonts)
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
                        // Ersetze CSS-Variablen durch tatsächliche Werte
                        cssText = this.replaceCSSVariables(cssText);
                        // Ersetze auch calc() Ausdrücke mit CSS-Variablen
                        cssText = this.replaceCalcExpressions(cssText);
                        // WICHTIG (PDF): Entferne height/min-height/max-height aus ALLEN CSS-Regeln,
                        // da diese zu übermäßigem Leerraum und frühen Seitenumbrüchen führen können.
                        // Dies gilt für html, body, .design-resume-preview und alle anderen Selektoren.
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
        
        // 2. Design Editor spezifische Styles (mit aufgelösten CSS-Variablen)
        // WICHTIG: Für PDF-Export KEIN Padding setzen - Puppeteer handhabt Margins!
        const marginTop = this.settings.marginTop || 20;
        const marginRight = this.settings.marginRight || 20;
        const marginBottom = this.settings.marginBottom || 20;
        const marginLeft = this.settings.marginLeft || 20;
        
        const useFlexTwoColumns = !!(this.settings.twoColumnLayout && this.settings.twoColumnLayout !== 'none');
        const useGridTwoColumns = Number(this.settings.columns) === 2;
        const gridLeftWidth = this.settings.leftColumnWidth || 35;
        const gridRightWidth = this.settings.rightColumnWidth || 65;

        const designStyles = `
            .design-resume-preview {
                width: 210mm !important;
                min-height: auto !important;
                max-width: 210mm !important;
                margin: 0 !important;
                /* WICHTIG: Padding wird NACH dem extrahierten CSS explizit gesetzt - hier NICHT setzen! */
                background: ${this.settings.backgroundColor || '#ffffff'} !important;
                font-family: ${this.settings.fontFamily || "'Inter', sans-serif"} !important;
                font-size: ${this.settings.fontSize || 11}pt !important;
                line-height: ${this.settings.lineHeight || 1.5} !important;
                color: ${this.settings.textColor || '#1e293b'} !important;
                box-shadow: none !important; /* Kein Schatten im PDF */
            }
            
            /* Seitenränder für Spalten-Layout - KEINE negativen Margins mehr, da kein Padding */
            .resume-preview-columns {
                margin-left: 0 !important;
                margin-right: 0 !important;
                /* Wichtig: NICHT pauschal auf block setzen – sonst fällt 2-Spalten-Layout im Export zusammen */
                display: ${useFlexTwoColumns ? 'flex' : (useGridTwoColumns ? 'grid' : 'block')} !important;
                ${useGridTwoColumns ? `grid-template-columns: ${gridLeftWidth}% ${gridRightWidth}% !important;` : ''}
                gap: ${this.settings.columnGap || 24}px !important;
            }
            
            .resume-preview-column-left {
                padding-left: 0 !important; /* Puppeteer Margins handhaben das */
                width: ${useFlexTwoColumns ? (this.settings.columnWidth || 50) + '%' : 'auto'} !important;
            }
            
            .resume-preview-column-right {
                padding-right: 0 !important; /* Puppeteer Margins handhaben das */
                width: ${useFlexTwoColumns ? (100 - (this.settings.columnWidth || 50)) + '%' : 'auto'} !important;
            }
            
            .resume-preview-header {
                color: ${this.settings.accentColor || '#6366f1'} !important;
                font-size: ${(this.settings.headingSize || 14) + 4}pt !important;
                margin-bottom: ${this.settings.sectionGap || 24}px !important;
                text-align: ${this.settings.headerAlign || 'center'} !important;
            }
            
            .resume-preview-name {
                color: ${this.settings.accentColor || '#6366f1'} !important;
                font-size: ${(this.settings.headingSize || 14) + 4}pt !important;
                font-weight: 700 !important;
            }
            
            .resume-preview-title {
                font-size: ${this.settings.headingSize || 14}pt !important;
                font-weight: 500 !important;
                color: ${this.settings.textColor || '#1e293b'} !important;
            }
            
            .resume-preview-section-title {
                color: ${this.settings.accentColor || '#6366f1'} !important;
                font-size: ${this.settings.headingSize || 14}pt !important;
                font-weight: 600 !important;
                margin-top: ${this.settings.sectionGap || 24}px !important;
                margin-bottom: ${this.settings.itemGap || 12}px !important;
            }
            
            .resume-preview-item {
                margin-bottom: ${this.settings.itemGap || 12}px !important;
            }
            
            .resume-preview-item-title {
                font-weight: 600 !important;
                color: ${this.settings.textColor || '#1e293b'} !important;
            }
            
            .resume-preview-item-date,
            .resume-preview-item-subtitle,
            .resume-preview-birthdate,
            .resume-preview-contact {
                color: ${this.settings.mutedColor || '#64748b'} !important;
                font-size: ${((this.settings.fontSize || 11) * 0.9)}pt !important;
            }
            
            .resume-preview-item-description {
                font-size: ${this.settings.fontSize || 11}pt !important;
                line-height: ${this.settings.lineHeight || 1.5} !important;
                color: ${this.settings.textColor || '#1e293b'} !important;
            }
            
            p {
                margin-bottom: ${this.settings.paragraphGap || 6}px !important;
                font-size: ${this.settings.fontSize || 11}pt !important;
                line-height: ${this.settings.lineHeight || 1.5} !important;
                color: ${this.settings.textColor || '#1e293b'} !important;
            }
            
            .resume-preview-skill,
            .resume-skill-bar-fill,
            .resume-skill-dot.filled,
            .resume-skill-numeric {
                color: ${this.settings.accentColor || '#6366f1'} !important;
            }
            
            .resume-skill-bar-fill {
                background: ${this.settings.accentColor || '#6366f1'} !important;
            }
        `;
        styles.push(designStyles);
        
        return styles.join('\n');
    }
    
    /**
     * Generiert vollständiges HTML5-Dokument für PDF-Export (wie andere Anwendungen)
     * WICHTIG: Margins werden als Padding auf dem Hauptcontainer gesetzt, da Puppeteer Margins auf 0 setzt
     */
    generateCompleteHTMLDocument(element) {
        const marginTop = this.settings.marginTop || 20;
        const marginRight = this.settings.marginRight || 20;
        const marginBottom = this.settings.marginBottom || 20;
        const marginLeft = this.settings.marginLeft || 20;

        // Debug/Tracing: Settings-Hash für reproduzierbare Exporte
        const settingsSnapshot = {
            ...this.settings,
            marginTop,
            marginRight,
            marginBottom,
            marginLeft
        };
        const settingsHash = this.simpleHash(JSON.stringify(settingsSnapshot));
        
        // Stelle sicher, dass das Element die PDF-Ränder als mm-Padding trägt.
        // WICHTIG: Die Lambda setzt Puppeteer-Margins auf 0mm – daher MUSS das HTML-Padding (mm)
        // der einzige Source-of-Truth für Ränder sein.
        const mainContainer = element.classList.contains('design-resume-preview') 
            ? element 
            : element.querySelector('.design-resume-preview') || element;
        
        if (mainContainer) {
            mainContainer.style.setProperty('padding', `${marginTop}mm ${marginRight}mm ${marginBottom}mm ${marginLeft}mm`, 'important');
            mainContainer.style.setProperty('box-sizing', 'border-box', 'important');
            mainContainer.style.setProperty('width', '210mm', 'important');
            mainContainer.style.setProperty('margin', '0', 'important');
            // Export: Zoom/Transforms dürfen nicht in den PDF-Export leaken
            mainContainer.style.setProperty('transform', 'none', 'important');
            mainContainer.style.setProperty('transform-origin', 'top left', 'important');
        }
        
        // Extrahiere alle CSS-Styles (WICHTIG: Vor dem HTML-Generieren, damit alle Styles verfügbar sind)
        let allCSS = this.extractAllCSS();
        
        // Extrahiere auch alle inline Styles aus dem Element und seinen Kindern
        let inlineStyles = this.extractInlineStyles(element);
        
        // WICHTIG (PDF): Zusätzliche Filterung - entferne min-height: 297mm aus dem gesamten CSS-String,
        // falls die Filterung in extractAllCSS() nicht alle Fälle erwischt hat (z.B. in zusammengesetzten CSS-Regeln)
        allCSS = allCSS.replace(/min-height\s*:\s*297[^;]*;?/gi, '');
        inlineStyles = inlineStyles.replace(/min-height\s*:\s*297[^;]*;?/gi, '');
        
        // Google Fonts Link (robust nach gewählter Schrift)
        const fontFamily = this.settings.fontFamily || "'Inter', sans-serif";
        const googleFontsUrl = this.getGoogleFontsUrl(fontFamily);
        const googleFontsLink = googleFontsUrl ? `<link href="${googleFontsUrl}" rel="stylesheet">` : '';
        
        // Font Awesome CSS für Icons im PDF
        // WICHTIG: Verwende neueste Version und stelle sicher, dass CSS geladen wird
        const fontAwesomeLink = '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA==" crossorigin="anonymous" referrerpolicy="no-referrer">';
        
        // Generiere vollständiges HTML5-Dokument
        const html = `<!DOCTYPE html>
<!-- exportSource:designEditor exportVersion:2026-01-24m settingsHash:${settingsHash} -->
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Lebenslauf PDF Export</title>
    ${googleFontsLink}
    ${fontAwesomeLink}
    <!-- Fallback: Font Awesome als inline CSS falls CDN nicht verfügbar -->
    <style>
        /* Fallback für Font Awesome Icons */
        .fa, .fas, .far, .fal, .fab {
            font-family: "Font Awesome 6 Free", "Font Awesome 6 Brands", "Font Awesome 6 Pro";
            font-weight: 900;
            font-style: normal;
            font-variant: normal;
            text-rendering: auto;
            line-height: 1;
        }
    </style>
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
            font-family: ${fontFamily};
            font-size: ${this.settings.fontSize || 11}pt;
            line-height: ${this.settings.lineHeight || 1.5};
            color: ${this.settings.textColor || '#1e293b'};
            /* PDF: Seitenhintergrund IMMER weiß (verhindert hellblaue Randflächen im Viewer/PDF) */
            background: #ffffff !important;
            -webkit-text-size-adjust: 100%;
            text-size-adjust: 100%;
        }
        
        body {
            width: 210mm;
            height: auto !important;
            min-height: 0 !important;
        }
        
        .design-resume-preview {
            width: 210mm !important;
            min-width: 210mm !important;
            max-width: 210mm !important;
            margin: 0 !important;
            padding: ${marginTop}mm ${marginRight}mm ${marginBottom}mm ${marginLeft}mm !important;
            box-sizing: border-box !important;
            /* PDF: Container-Hintergrund weiß, damit keine farbigen "Ränder" entstehen */
            background: #ffffff !important;
            min-height: auto !important;
            font-family: ${fontFamily} !important;
            font-size: ${this.settings.fontSize || 11}pt !important;
            line-height: ${this.settings.lineHeight || 1.5} !important;
            color: ${this.settings.textColor || '#1e293b'} !important;
            transform: none !important;
            transform-origin: top left !important;
            zoom: 1 !important;
        }
        
        /* Print-Styles */
        @media print {
            @page {
                size: A4;
                margin: 0 !important;
            }
            
            html, body {
                width: 210mm !important;
                margin: 0 !important;
                padding: 0 !important;
            }
            
            .design-resume-preview {
                width: 210mm !important;
                margin: 0 !important;
                padding: ${marginTop}mm ${marginRight}mm ${marginBottom}mm ${marginLeft}mm !important;
                box-shadow: none !important;
                transform: none !important;
                zoom: 1 !important;
            }
        }
        
        /* Extrahiertes CSS aus Stylesheets */
        ${allCSS}
        
        /* Inline Styles */
        ${inlineStyles}

        /* Final export overrides (MUSS als letztes kommen, damit nichts das Padding überschreibt) */
        .design-resume-preview {
            width: 210mm !important;
            min-width: 210mm !important;
            max-width: 210mm !important;
            margin: 0 !important;
            padding: ${marginTop}mm ${marginRight}mm ${marginBottom}mm ${marginLeft}mm !important;
            box-sizing: border-box !important;
            box-shadow: none !important;
            background: #ffffff !important;
            /* Pagination: kein fixes Seiten-Minimum erzwingen (kann zu frühen Umbrüchen/Leerraum führen) */
            height: auto !important;
            min-height: auto !important;
            transform: none !important;
            transform-origin: top left !important;
            zoom: 1 !important;
        }

        /* Export-only: Preview-Layout-Abstände neutralisieren (keine zusätzlichen px-Ränder) */
        .resume-preview-columns {
            margin: 0 !important;
            margin-top: 0 !important;
            margin-bottom: 0 !important;
        }

        .resume-preview-column {
            padding: 0 !important;
            margin: 0 !important;
            /* WICHTIG: Layout wird durch .resume-preview-columns gesteuert, nicht hier */
        }

        .resume-preview-column-left,
        .resume-preview-column-right {
            margin: 0 !important;
            padding: 0 !important;
            padding-left: 0 !important;
            padding-right: 0 !important;
        }

        /* Export-only: Seitenumbrüche nicht unnötig blockieren */
        .design-resume-preview,
        .design-resume-preview * {
            break-inside: auto !important;
            page-break-inside: auto !important;
            overflow: visible !important;
            transform: none !important;
        }

        /* Export-only: Entferne feste Höhen von allen Elementen (außer Bildern) für korrekte Pagination */
        .design-resume-preview *:not(img):not(svg):not(canvas) {
            height: auto !important;
            min-height: 0 !important;
        }

        /* Pagination: Chrome kann durch widows/orphans unnötig viel Leerraum lassen */
        p, li {
            widows: 1 !important;
            orphans: 1 !important;
        }
    </style>
</head>
<body>
    ${element.outerHTML}
</body>
</html>`;
        
        console.log('📄 HTML-Dokument generiert:', {
            htmlLength: html.length,
            cssLength: allCSS.length,
            inlineStylesLength: inlineStyles.length,
            fontFamily: fontFamily,
            fontSize: this.settings.fontSize || 11,
            margins: `${marginTop}mm ${marginRight}mm ${marginBottom}mm ${marginLeft}mm`,
            settingsHash,
            googleFontsUrl: googleFontsUrl || null
        });
        
        return html;
    }

    /**
     * Kleiner, stabiler Hash (nicht kryptografisch) für Debugging/Tracing.
     */
    simpleHash(input) {
        let hash = 5381;
        const str = String(input || '');
        for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) + hash) ^ str.charCodeAt(i); // djb2-xor
        }
        // unsigned 32-bit
        return (hash >>> 0).toString(16);
    }
    
    extractInlineStyles(element) {
        // WICHTIG: Extrahiere ALLE computed styles direkt vom DOM (nicht nur inline styles)
        // Das stellt sicher, dass alle Styles (auch aus CSS-Klassen) übernommen werden
        const styles = [];
        const allElements = [element, ...Array.from(element.querySelectorAll('*'))];
        
        // Wichtige CSS-Properties, die extrahiert werden sollen
        // WICHTIG (PDF/Pagination):
        // - KEINE width/height/min/max-*-Werte aus `getComputedStyle` übernehmen.
        //   `getComputedStyle()` liefert hier meist Pixel-"Used Values" (auch wenn CSS auto ist).
        //   Das führt beim PDF-Druck zu großen Leerräumen, weil Elemente als (quasi) unteilbare Blöcke
        //   behandelt werden und der Browser früher umbricht.
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
    
    replaceCSSVariables(cssText) {
        // Ersetze CSS-Variablen durch tatsächliche Werte
        const replacements = {
            'var(--resume-font)': this.settings.fontFamily || "'Inter', sans-serif",
            'var(--resume-font-size, 11pt)': (this.settings.fontSize || 11) + 'pt',
            'var(--resume-font-size)': (this.settings.fontSize || 11) + 'pt',
            'var(--resume-heading-size, 18pt)': (this.settings.headingSize || 14) + 'pt',
            'var(--resume-heading-size)': (this.settings.headingSize || 14) + 'pt',
            'var(--resume-line-height, 1.5)': this.settings.lineHeight || 1.5,
            'var(--resume-line-height)': this.settings.lineHeight || 1.5,
            'var(--resume-accent-color, #6366f1)': this.settings.accentColor || '#6366f1',
            'var(--resume-accent-color)': this.settings.accentColor || '#6366f1',
            'var(--resume-text-color, #1e293b)': this.settings.textColor || '#1e293b',
            'var(--resume-text-color)': this.settings.textColor || '#1e293b',
            'var(--resume-muted-color, #64748b)': this.settings.mutedColor || '#64748b',
            'var(--resume-muted-color)': this.settings.mutedColor || '#64748b',
            'var(--resume-bg-color, #ffffff)': this.settings.backgroundColor || '#ffffff',
            'var(--resume-bg-color)': this.settings.backgroundColor || '#ffffff',
            'var(--resume-border-color, #e2e8f0)': this.settings.borderColor || '#e2e8f0',
            'var(--resume-border-color)': this.settings.borderColor || '#e2e8f0',
            'var(--resume-margin, 20mm)': (this.settings.marginTop || 20) + 'mm',
            'var(--resume-section-gap, 1.5rem)': (this.settings.sectionGap || 24) + 'px',
            'var(--resume-section-gap)': (this.settings.sectionGap || 24) + 'px',
            'var(--resume-item-gap, 12px)': (this.settings.itemGap || 12) + 'px',
            'var(--resume-item-gap)': (this.settings.itemGap || 12) + 'px',
            'var(--resume-paragraph-gap, 6px)': (this.settings.paragraphGap || 6) + 'px',
            'var(--resume-paragraph-gap)': (this.settings.paragraphGap || 6) + 'px',
        };
        
        let result = cssText;
        for (const [variable, value] of Object.entries(replacements)) {
            result = result.replace(new RegExp(variable.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), value);
        }
        
        return result;
    }
    
    replaceCSSVariablesInElement(element) {
        // Ersetze CSS-Variablen in inline styles und style-Attributen
        const replacements = {
            '--resume-font': this.settings.fontFamily || "'Inter', sans-serif",
            '--resume-font-size': (this.settings.fontSize || 11) + 'pt',
            '--resume-heading-size': (this.settings.headingSize || 14) + 'pt',
            '--resume-line-height': String(this.settings.lineHeight || 1.5),
            '--resume-accent-color': this.settings.accentColor || '#6366f1',
            '--resume-text-color': this.settings.textColor || '#1e293b',
            '--resume-muted-color': this.settings.mutedColor || '#64748b',
            '--resume-bg-color': this.settings.backgroundColor || '#ffffff',
            '--resume-border-color': this.settings.borderColor || '#e2e8f0',
            '--resume-margin': `${this.settings.marginTop || 20}mm ${this.settings.marginRight || 20}mm ${this.settings.marginBottom || 20}mm ${this.settings.marginLeft || 20}mm`,
            '--resume-section-gap': (this.settings.sectionGap || 24) + 'px',
            '--resume-item-gap': (this.settings.itemGap || 12) + 'px',
            '--resume-paragraph-gap': (this.settings.paragraphGap || 6) + 'px',
        };
        
        // Ersetze in style-Attributen
        const allElements = element.querySelectorAll('*');
        allElements.forEach(el => {
            if (el.style) {
                const styleText = el.getAttribute('style') || '';
                let newStyleText = styleText;
                
                for (const [varName, value] of Object.entries(replacements)) {
                    // Ersetze var(--variable-name) und var(--variable-name, fallback)
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
            
            for (const [varName, value] of Object.entries(replacements)) {
                const regex = new RegExp(`var\\(${varName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:,\\s*[^)]+)?\\)`, 'g');
                newStyleText = newStyleText.replace(regex, value);
            }
            
            if (newStyleText !== styleText) {
                element.setAttribute('style', newStyleText);
            }
        }
    }
    
    replaceCalcExpressions(cssText) {
        // Ersetze calc() Ausdrücke mit CSS-Variablen durch berechnete Werte
        const fontSize = this.settings.fontSize || 11;
        const headingSize = this.settings.headingSize || 14;
        
        // Ersetze calc(var(--resume-font-size, 11pt) * 0.9) etc.
        cssText = cssText.replace(/calc\(var\(--resume-font-size[^)]*\)\s*\*\s*([\d.]+)\)/g, (match, multiplier) => {
            return (fontSize * parseFloat(multiplier)).toFixed(2) + 'pt';
        });
        
        cssText = cssText.replace(/calc\(var\(--resume-heading-size[^)]*\)\s*\*\s*([\d.]+)\)/g, (match, multiplier) => {
            return (headingSize * parseFloat(multiplier)).toFixed(2) + 'pt';
        });
        
        // Ersetze calc(var(--resume-heading-size, 18pt) * 1.5) etc.
        cssText = cssText.replace(/calc\(var\(--resume-heading-size[^)]*\)\s*\*\s*([\d.]+)\)/g, (match, multiplier) => {
            return (headingSize * parseFloat(multiplier)).toFixed(2) + 'pt';
        });
        
        return cssText;
    }
    
    // ALTE PDFMAKE/HTML2PDF METHODEN ENTFERNT - Jetzt wird Puppeteer verwendet
    // Alle folgenden Methoden wurden entfernt:
    // - convertHTMLToPdfMake
    // - extractContentFromHTML  
    // - processHTMLElement
    // - generateResumePDFLegacy
    // - postProcessPDF
    
    // Legacy-Funktionen entfernt - verwenden nur noch Puppeteer über AWS Lambda
    
    // Legacy-Funktionen entfernt - verwenden nur noch die neue generateResumePDFFromElement Methode
    // Der Browser-Druckdialog wird nicht mehr verwendet, da er falsche Seitengrößen verwendet
    
    loadScript(src) {
        return new Promise((resolve, reject) => {
            // Prüfe ob Script schon geladen
            const existingScript = document.querySelector(`script[src="${src}"]`);
            if (existingScript) {
                console.log(`✅ Script bereits geladen: ${src}`);
                // Warte kurz, damit sichergestellt ist, dass es initialisiert ist
                setTimeout(() => resolve(), 100);
                return;
            }
            
            const script = document.createElement('script');
            script.src = src;
            script.crossOrigin = 'anonymous';
            script.async = false;
            
            let resolved = false;
            
            script.onload = () => {
                if (resolved) return;
                resolved = true;
                console.log(`✅ Script geladen: ${src}`);
                setTimeout(() => resolve(), 200);
            };
            
            script.onerror = (err) => {
                if (resolved) return;
                resolved = true;
                console.error(`❌ Script Fehler: ${src}`, err);
                reject(new Error(`Script konnte nicht geladen werden: ${src}`));
            };
            
            setTimeout(() => {
                if (!resolved) {
                    resolved = true;
                    reject(new Error(`Script-Lade-Timeout: ${src}`));
                }
            }, 10000);
            
            document.head.appendChild(script);
        });
    }
    
    // ═══════════════════════════════════════════════════════════════════════════
    // NOTIFICATIONS
    // ═══════════════════════════════════════════════════════════════════════════

    showNotification(message, type = 'info') {
        return new Promise((resolve, reject) => {
            // Prüfe ob Script schon geladen
            const existingScript = document.querySelector(`script[src="${src}"]`);
            if (existingScript) {
                console.log(`✅ Script bereits geladen: ${src}`);
                // Warte kurz, damit sichergestellt ist, dass es initialisiert ist
                setTimeout(() => resolve(), 100);
                return;
            }
            
            const script = document.createElement('script');
            script.src = src;
            script.crossOrigin = 'anonymous';
            script.async = false; // Wichtig: synchron laden für html2pdf
            
            let resolved = false;
            
            script.onload = () => {
                if (resolved) return;
                resolved = true;
                console.log(`✅ Script geladen: ${src}`);
                // Warte zusätzlich, damit die Bibliothek vollständig initialisiert ist
                setTimeout(() => resolve(), 200);
            };
            
            script.onerror = (err) => {
                if (resolved) return;
                resolved = true;
                console.error(`❌ Script Fehler: ${src}`, err);
                reject(new Error(`Script konnte nicht geladen werden: ${src}`));
            };
            
            // Timeout nach 10 Sekunden
            setTimeout(() => {
                if (!resolved) {
                    resolved = true;
                    reject(new Error(`Script-Lade-Timeout: ${src}`));
                }
            }, 10000);
            
            document.head.appendChild(script);
        });
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // NOTIFICATIONS
    // ═══════════════════════════════════════════════════════════════════════════

    showNotification(message, type = 'info') {
        if (typeof showNotification === 'function') {
            showNotification(message, type);
        } else {
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
    }
    
    showAPIKeyErrorBanner() {
        // Entferne vorhandenen Banner falls vorhanden
        const existingBanner = document.getElementById('api-key-error-banner');
        if (existingBanner) {
            existingBanner.remove();
        }
        
        // Erstelle neuen Banner
        const banner = document.createElement('div');
        banner.id = 'api-key-error-banner';
        banner.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: linear-gradient(135deg, #dc2626, #ef4444);
            color: white;
            padding: 16px 24px;
            z-index: 10001;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
        `;
        
        const settingsUrl = window.location.origin + '/admin#ai-settings';
        
        banner.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px; flex: 1;">
                <i class="fas fa-exclamation-triangle" style="font-size: 1.2rem;"></i>
                <div>
                    <strong>OpenAI API Key nicht gefunden</strong>
                    <div style="font-size: 0.9rem; opacity: 0.9; margin-top: 2px;">
                        Bitte konfigurieren Sie den API Key in den Einstellungen.
                    </div>
                </div>
            </div>
            <div style="display: flex; gap: 8px;">
                <a href="${settingsUrl}" target="_blank" style="
                    background: rgba(255,255,255,0.2);
                    color: white;
                    padding: 8px 16px;
                    border-radius: 6px;
                    text-decoration: none;
                    font-weight: 500;
                    transition: background 0.2s;
                " onmouseover="this.style.background='rgba(255,255,255,0.3)'" onmouseout="this.style.background='rgba(255,255,255,0.2)'">
                    <i class="fas fa-cog"></i> Zu den Einstellungen
                </a>
                <button onclick="this.closest('#api-key-error-banner').remove()" style="
                    background: rgba(255,255,255,0.2);
                    color: white;
                    border: none;
                    padding: 8px 12px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 1.2rem;
                    line-height: 1;
                ">×</button>
            </div>
        `;
        
        document.body.appendChild(banner);
        
        // Auto-remove nach 10 Sekunden
        setTimeout(() => {
            if (banner.parentNode) {
                banner.style.transition = 'opacity 0.3s';
                banner.style.opacity = '0';
                setTimeout(() => banner.remove(), 300);
            }
        }, 10000);
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// GLOBAL FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

function openDesignEditor() {
    console.log('🎨 openDesignEditor() aufgerufen');
    const modal = document.getElementById('designEditorModal');
    
    if (!modal) {
        console.error('❌ designEditorModal nicht gefunden!');
        // Versuche es nochmal nach kurzer Verzögerung (falls DOM noch nicht fertig)
        setTimeout(() => {
            const modalRetry = document.getElementById('designEditorModal');
            if (modalRetry) {
                console.log('✅ Modal beim zweiten Versuch gefunden');
                modalRetry.classList.add('active');
                document.body.style.overflow = 'hidden';
                
                if (!window.designEditor) {
                    window.designEditor = new DesignEditor();
                } else {
                    window.designEditor.updatePreview();
                }
            } else {
                console.error('❌ Modal auch beim zweiten Versuch nicht gefunden');
                alert('Design-Editor konnte nicht geöffnet werden. Bitte Seite neu laden.');
            }
        }, 100);
        return;
    }
    
    console.log('✅ Modal gefunden, öffne Design-Editor');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    if (!window.designEditor) {
        console.log('🆕 Erstelle neuen DesignEditor');
        window.designEditor = new DesignEditor();
    } else {
        console.log('🔄 Aktualisiere DesignEditor Preview');
        window.designEditor.updatePreview();
    }
}

function closeDesignEditor() {
    const modal = document.getElementById('designEditorModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function saveDesignSettings() {
    if (window.designEditor) {
        window.designEditor.saveSettings();
        window.designEditor.showNotification('Design-Einstellungen gespeichert!', 'success');
    }
}

function resetDesignSettings() {
    if (confirm('Alle Design-Einstellungen zurücksetzen?')) {
        localStorage.removeItem('resume_design_settings');
        window.designEditor = new DesignEditor();
        window.designEditor.showNotification('Design zurückgesetzt', 'info');
    }
}

// Exportiere alle Design-Editor-Funktionen global für HTML onclick
// WICHTIG: Sofort exportieren, nicht erst nach DOMContentLoaded
window.openDesignEditor = openDesignEditor;
window.closeDesignEditor = closeDesignEditor;
window.saveDesignSettings = saveDesignSettings;
window.resetDesignSettings = resetDesignSettings;

// Debug: Prüfe ob Funktionen verfügbar sind
console.log('✅ Design-Editor-Funktionen exportiert:', {
    openDesignEditor: typeof window.openDesignEditor,
    closeDesignEditor: typeof window.closeDesignEditor,
    saveDesignSettings: typeof window.saveDesignSettings,
    resetDesignSettings: typeof window.resetDesignSettings
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('designEditorModal') || document.querySelector('.design-editor-container')) {
        window.designEditor = new DesignEditor();
    }
});
