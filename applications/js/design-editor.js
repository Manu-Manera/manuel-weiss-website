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
            translations: {} // Custom translations per field
            resumeTitleSize: 10, // pt
            resumeTitleColor: '', // leer = mutedColor verwenden
            resumeTitleSpacing: 3, // letter-spacing in px
            
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
                        
                        this.settings.template = templateId;
                        Object.assign(this.settings, template.settings);
                        
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
        
        // Colors
        const accentPicker = document.getElementById('designAccentColor');
        const accentHex = document.getElementById('designAccentColorHex');
        if (accentPicker) accentPicker.value = this.settings.accentColor;
        if (accentHex) accentHex.value = this.settings.accentColor;
        
        document.querySelectorAll('.design-color-preset').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.accent === this.settings.accentColor);
        });
        
        // Layout
        const columnsSelect = document.getElementById('designColumns');
        if (columnsSelect) columnsSelect.value = String(this.settings.columns);
        
        const headerAlignSelect = document.getElementById('designHeaderAlign');
        if (headerAlignSelect) headerAlignSelect.value = this.settings.headerAlign || 'center';
        
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
        reader.onload = (e) => {
            this.settings.profileImageUrl = e.target.result;
            this.saveSettings();
            this.updatePreview();
            this.showNotification('Profilbild hochgeladen', 'success');
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
                checkbox.checked = this.settings.showHeaderField[fieldKey] !== false;
                
                // Event Listener für Änderungen
                checkbox.addEventListener('change', (e) => {
                    this.settings.showHeaderField[fieldKey] = e.target.checked;
                    this.saveSettings();
                    this.updatePreview();
                });
            }
        });
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
            document.getElementById('offsetXValue').textContent = offsetXSlider.value + '%';
            offsetXSlider.addEventListener('input', (e) => {
                this.settings.profileImageOffsetX = parseInt(e.target.value);
                updateCrop();
            });
        }
        
        if (offsetYSlider) {
            offsetYSlider.value = this.settings.profileImageOffsetY || 0;
            document.getElementById('offsetYValue').textContent = offsetYSlider.value + '%';
            offsetYSlider.addEventListener('input', (e) => {
                this.settings.profileImageOffsetY = parseInt(e.target.value);
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
        const posX = Math.max(0, Math.min(100, 50 + offsetX));
        const posY = Math.max(0, Math.min(100, 50 + offsetY));
        
        preview.innerHTML = `
            <div style="width: 100px; height: 100px; overflow: hidden; border-radius: ${this.settings.profileImageShape === 'circle' ? '50%' : '8px'}; margin: 0 auto; background: #f1f5f9;">
                <img src="${this.settings.profileImageUrl}" style="
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transform: scale(${zoomFactor});
                    transform-origin: ${posX}% ${posY}%;
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
            otherSections.forEach(section => {
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
        
        const resumeTitleHtml = showResumeTitle ? `
            <p class="resume-document-title" style="
                text-transform: uppercase;
                letter-spacing: ${titleSpacing}px;
                font-size: ${titleSize}px;
                color: ${titleColor};
                margin-bottom: 8px;
                font-weight: 500;
            ">${titleText}</p>
        ` : '';
        
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
            const posX = Math.max(0, Math.min(100, 50 + offsetX));
            const posY = Math.max(0, Math.min(100, 50 + offsetY));
            
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
                        transform: scale(${zoomFactor});
                        transform-origin: ${posX}% ${posY}%;
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
                fullAddress += ', ' + data.location;
            }
        } else if (data.address && this.settings.showHeaderField?.address !== false) {
            fullAddress = data.address;
        } else if (data.location && this.settings.showHeaderField?.location !== false) {
            fullAddress = data.location;
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
                ${(data.website && this.settings.showHeaderField?.website !== false) ? `<span><i class="fas fa-globe"></i> ${data.website.replace(/https?:\/\//, '')}</span>` : ''}
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
                        <div class="resume-signature-image" style="margin-bottom: 4px;">
                            <img src="${signatureImage}" alt="Unterschrift" style="height: auto; width: ${width}px; max-width: 100%;">
                        </div>
                    ` : ''}
                    ${showLine ? `<div class="resume-signature-line" style="width: ${width}px; border-bottom: 1px solid ${this.settings.textColor}; margin: 0 auto;"></div>` : ''}
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
        const preview = document.getElementById('resumePreview');
        if (!preview) {
            this.showNotification('Keine Vorschau zum Exportieren vorhanden', 'error');
            return;
        }
        
        // Zeige Loading-Status
        this.showNotification('PDF wird generiert...', 'info');
        
        try {
            // Prüfe ob html2pdf verfügbar ist, sonst lade es
            if (typeof html2pdf === 'undefined') {
                console.log('📥 Lade html2pdf Bibliothek...');
                try {
                    await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js');
                    console.log('✅ html2pdf geladen');
                    // Warte länger nach dem Laden
                    await new Promise(resolve => setTimeout(resolve, 500));
                } catch (loadError) {
                    console.warn('⚠️ CDN nicht erreichbar, versuche Druckdialog:', loadError);
                    throw new Error('Bibliothek konnte nicht geladen werden');
                }
            }
            
            // Warte kurz bis die Bibliothek verfügbar ist
            await new Promise(resolve => setTimeout(resolve, 200));
            
            if (typeof html2pdf === 'undefined') {
                throw new Error('html2pdf nicht verfügbar');
            }
            
            // Bereite Preview für Export vor - klone das Element für bessere Qualität
            const resumeData = this.getResumeData();
            const filename = `Lebenslauf_${resumeData.firstName || 'Vorname'}_${resumeData.lastName || 'Nachname'}.pdf`.replace(/\s+/g, '_');
            
            // Erstelle einen Klon des Previews für den Export
            const clone = preview.cloneNode(true);
            clone.style.position = 'absolute';
            clone.style.left = '-9999px';
            clone.style.top = '0';
            clone.style.width = '210mm';
            clone.style.minHeight = '297mm';
            clone.style.backgroundColor = this.settings.backgroundColor || '#ffffff';
            document.body.appendChild(clone);
            
            // Konfiguration für PDF - verbesserte Einstellungen
            const opt = {
                margin: [0, 0, 0, 0],
                filename: filename,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { 
                    scale: 2,
                    useCORS: true,
                    letterRendering: true,
                    logging: false,
                    allowTaint: false,
                    backgroundColor: this.settings.backgroundColor || '#ffffff',
                    windowWidth: 794, // A4 width in pixels at 96 DPI
                    windowHeight: 1123, // A4 height in pixels at 96 DPI
                    scrollX: 0,
                    scrollY: 0
                },
                jsPDF: { 
                    unit: 'mm', 
                    format: 'a4', 
                    orientation: 'portrait',
                    compress: true
                },
                pagebreak: { mode: ['css', 'legacy'], avoid: ['img', '.resume-preview-section'] }
            };
            
            try {
                // Export vom Klon
                await html2pdf().set(opt).from(clone).save();
                
                // Entferne Klon nach Export
                document.body.removeChild(clone);
                
                this.showNotification('PDF erfolgreich exportiert!', 'success');
            } catch (exportError) {
                // Entferne Klon auch bei Fehler
                if (document.body.contains(clone)) {
                    document.body.removeChild(clone);
                }
                throw exportError;
            }
        } catch (error) {
            console.error('PDF Export Fehler:', error);
            // Fallback zu Print-Dialog mit speziellem Print-CSS
            this.showNotification('Öffne Druckdialog für PDF-Export...', 'info');
            this.openPrintDialog();
        }
    }
    
    openPrintDialog() {
        // Füge temporäres Print-CSS hinzu
        const printStyle = document.createElement('style');
        printStyle.id = 'temp-print-styles';
        printStyle.textContent = `
            @media print {
                body * {
                    visibility: hidden;
                }
                #resumePreview, #resumePreview * {
                    visibility: visible !important;
                }
                #resumePreview {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 210mm !important;
                    min-height: 297mm !important;
                    margin: 0 !important;
                    padding: 20mm !important;
                    box-sizing: border-box !important;
                    background: white !important;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }
                .design-sidebar, .mobile-design-toggle, .fab-design-toggle {
                    display: none !important;
                }
            }
        `;
        document.head.appendChild(printStyle);
        
        window.print();
        
        // Entferne Print-CSS nach dem Drucken
        setTimeout(() => {
            const tempStyle = document.getElementById('temp-print-styles');
            if (tempStyle) tempStyle.remove();
        }, 1000);
    }
    
    loadScript(src) {
        return new Promise((resolve, reject) => {
            // Prüfe ob Script schon geladen
            if (document.querySelector(`script[src="${src}"]`)) {
                resolve();
                return;
            }
            
            const script = document.createElement('script');
            script.src = src;
            script.crossOrigin = 'anonymous';
            script.onload = () => {
                console.log(`✅ Script geladen: ${src}`);
                resolve();
            };
            script.onerror = (err) => {
                console.error(`❌ Script Fehler: ${src}`, err);
                reject(err);
            };
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
}

// ═══════════════════════════════════════════════════════════════════════════
// GLOBAL FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

function openDesignEditor() {
    const modal = document.getElementById('designEditorModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        if (!window.designEditor) {
            window.designEditor = new DesignEditor();
        } else {
            window.designEditor.updatePreview();
        }
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

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('designEditorModal') || document.querySelector('.design-editor-container')) {
        window.designEditor = new DesignEditor();
    }
});
