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
        this.applySettings();
        this.updatePreview();
        
        console.log('🎨 Design Editor initialized (Extended + DateFormat + ImageCrop + CompanyLogo)');
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
              settings: { accentColor: '#6366f1', fontFamily: "'Inter', sans-serif", columns: 1, sidebarBackground: 'transparent' } },
            { id: 'classic', name: 'Klassisch', desc: 'Zeitlos & Elegant', icon: '📋', 
              settings: { accentColor: '#1e293b', fontFamily: "'Georgia', serif", columns: 1, sidebarBackground: 'transparent' } },
            { id: 'creative', name: 'Kreativ', desc: 'Auffällig & Modern', icon: '🎨', 
              settings: { accentColor: '#8b5cf6', fontFamily: "'Montserrat', sans-serif", columns: 2, sidebarBackground: 'transparent' } },
            { id: 'minimal', name: 'Minimal', desc: 'Schlicht & Fokussiert', icon: '✨', 
              settings: { accentColor: '#64748b', fontFamily: "'Inter', sans-serif", columns: 1, sidebarBackground: 'transparent' } },
            { id: 'executive', name: 'Executive', desc: 'Führungskräfte', icon: '👔', 
              settings: { accentColor: '#0f172a', fontFamily: "'Times New Roman', serif", columns: 1, sidebarBackground: 'transparent' } },
            { id: 'ats', name: 'ATS-Optimiert', desc: 'Für Bewerbungssysteme', icon: '🤖', 
              settings: { accentColor: '#1e293b', fontFamily: "'Arial', sans-serif", columns: 1, showIcons: false, sidebarBackground: 'transparent' } },
            
            // NEW: Sidebar Templates
            { id: 'sidebar-dark', name: 'Sidebar Dunkel', desc: 'Dunkle Sidebar (wie Screenshot)', icon: '🌙', 
              settings: { 
                accentColor: '#ffffff', fontFamily: "'Inter', sans-serif", columns: 2,
                sidebarBackground: '#2d3748', sidebarTextColor: '#ffffff', leftColumnBg: '#2d3748', rightColumnBg: '#ffffff'
              } },
            { id: 'sidebar-accent', name: 'Sidebar Akzent', desc: 'Farbige Sidebar', icon: '🎯', 
              settings: { 
                accentColor: '#ffffff', fontFamily: "'Inter', sans-serif", columns: 2,
                sidebarBackground: '#6366f1', sidebarTextColor: '#ffffff', leftColumnBg: '#6366f1', rightColumnBg: '#ffffff'
              } },
            { id: 'sidebar-teal', name: 'Sidebar Teal', desc: 'Türkis Sidebar', icon: '🌊', 
              settings: { 
                accentColor: '#ffffff', fontFamily: "'Inter', sans-serif", columns: 2,
                sidebarBackground: '#0d9488', sidebarTextColor: '#ffffff', leftColumnBg: '#0d9488', rightColumnBg: '#ffffff'
              } },
            
            // NEW: Professional Templates
            { id: 'tech', name: 'Tech/Developer', desc: 'Für IT & Entwickler', icon: '💻', 
              settings: { 
                accentColor: '#22c55e', fontFamily: "'Source Code Pro', monospace", columns: 2,
                skillDisplay: 'bars', sidebarBackground: '#0f172a', sidebarTextColor: '#22c55e', leftColumnBg: '#0f172a'
              } },
            { id: 'finance', name: 'Finance', desc: 'Konservativ & Seriös', icon: '💼', 
              settings: { 
                accentColor: '#14532d', fontFamily: "'Times New Roman', serif", columns: 1,
                sidebarBackground: 'transparent', showIcons: false
              } },
            { id: 'startup', name: 'Startup', desc: 'Modern & Dynamisch', icon: '🚀', 
              settings: { 
                accentColor: '#f97316', fontFamily: "'Nunito', sans-serif", columns: 2,
                sidebarBackground: '#fff7ed', leftColumnBg: '#fff7ed'
              } },
            { id: 'academic', name: 'Akademisch', desc: 'Für Wissenschaft', icon: '🎓', 
              settings: { 
                accentColor: '#1e3a8a', fontFamily: "'Merriweather', serif", columns: 1,
                sidebarBackground: 'transparent'
              } },
            { id: 'creative-bold', name: 'Kreativ Bold', desc: 'Mutige Farben', icon: '🎪', 
              settings: { 
                accentColor: '#ec4899', fontFamily: "'Montserrat', sans-serif", columns: 2,
                sidebarBackground: '#fdf2f8', leftColumnBg: '#fdf2f8', headerBackground: '#ec4899'
              } },
            { id: 'executive-gold', name: 'Executive Gold', desc: 'Premium Look', icon: '👑', 
              settings: { 
                accentColor: '#b45309', fontFamily: "'Playfair Display', serif", columns: 1,
                sidebarBackground: 'transparent', headerBackground: '#fffbeb'
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
        const fontSelect = document.getElementById('designFontFamily');
        if (fontSelect) fontSelect.value = this.settings.fontFamily;
        
        const accentPicker = document.getElementById('designAccentColor');
        const accentHex = document.getElementById('designAccentColorHex');
        if (accentPicker) accentPicker.value = this.settings.accentColor;
        if (accentHex) accentHex.value = this.settings.accentColor;
        
        document.querySelectorAll('.design-color-preset').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.accent === this.settings.accentColor);
        });
        
        const columnsSelect = document.getElementById('designColumns');
        if (columnsSelect) columnsSelect.value = String(this.settings.columns);
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
            });
        }
        
        const skillMaxLevelSelect = document.getElementById('designSkillMaxLevel');
        if (skillMaxLevelSelect) {
            skillMaxLevelSelect.value = this.settings.skillMaxLevel || 10;
            skillMaxLevelSelect.addEventListener('change', (e) => {
                this.settings.skillMaxLevel = parseInt(e.target.value);
                this.saveSettings();
                this.updatePreview();
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
        
        // Load from profile button
        const loadFromProfileBtn = document.getElementById('loadProfileImageBtn');
        if (loadFromProfileBtn) {
            loadFromProfileBtn.addEventListener('click', () => {
                this.loadProfileImageFromStorage();
            });
        }
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
    
    loadProfileImageFromStorage() {
        try {
            const profile = JSON.parse(localStorage.getItem('bewerbungsmanager_profile') || '{}');
            if (profile.profileImageUrl) {
                this.settings.profileImageUrl = profile.profileImageUrl;
                this.settings.showProfileImage = true;
                this.saveSettings();
                this.updatePreview();
                
                const toggle = document.getElementById('designShowProfileImage');
                if (toggle) toggle.checked = true;
                this.toggleImageOptions(true);
                
                this.showNotification('Profilbild aus Profil geladen', 'success');
            } else {
                this.showNotification('Kein Profilbild im Profil gefunden', 'warning');
            }
        } catch (e) {
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
            this.settings.signatureImage = e.target.result;
            this.saveSettings();
            this.updatePreview();
            this.showNotification('Unterschrift hochgeladen', 'success');
            
            // Show preview
            const preview = document.getElementById('signaturePreview');
            if (preview) {
                preview.innerHTML = `<img src="${e.target.result}" alt="Unterschrift" style="max-height: 60px;">`;
            }
        };
        reader.readAsDataURL(file);
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
        
        preview.innerHTML = `
            <div style="width: 100px; height: 100px; overflow: hidden; border-radius: ${this.settings.profileImageShape === 'circle' ? '50%' : '8px'}; margin: 0 auto;">
                <img src="${this.settings.profileImageUrl}" style="
                    width: ${zoom}%;
                    height: ${zoom}%;
                    object-fit: cover;
                    transform: translate(${offsetX}%, ${offsetY}%);
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
        if (!signaturePreview) return;
        
        // Make signature preview a drop zone
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

        preview.innerHTML = html || this.renderPlaceholderContent();
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
            summary: document.getElementById('summary')?.value || '',
            birthDate: document.getElementById('birthDate')?.value || ''
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
            summary: formData.summary || savedProfile.summary || 'Ihr Profil...',
            birthDate: formData.birthDate || savedProfile.birthDate || '',
            profileImageUrl: this.settings.profileImageUrl || savedProfile.profileImageUrl || '',
            experience: this.getExperienceData(),
            education: this.getEducationData(),
            skills: this.getSkillsData(),
            languages: this.getLanguagesData(),
            projects: this.getProjectsData()
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
            if (name) {
                softSkills.push({ name, level });
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
        
        // Profile image mit Crop-Einstellungen
        let profileImageHtml = '';
        if (this.settings.showProfileImage && data.profileImageUrl) {
            const sizeMap = { small: '80px', medium: '120px', large: '160px' };
            const size = sizeMap[this.settings.profileImageSize] || '120px';
            const shape = this.settings.profileImageShape === 'circle' ? '50%' 
                        : this.settings.profileImageShape === 'rounded' ? '12px' : '0';
            const border = this.settings.profileImageBorder === 'thin' ? '2px solid #e2e8f0'
                         : this.settings.profileImageBorder === 'accent' ? `3px solid ${this.settings.accentColor}` : 'none';
            
            // Crop-Einstellungen anwenden
            const zoom = this.settings.profileImageZoom || 100;
            const offsetX = this.settings.profileImageOffsetX || 0;
            const offsetY = this.settings.profileImageOffsetY || 0;
            
            profileImageHtml = `
                <div class="resume-preview-profile-image" style="
                    width: ${size}; height: ${size}; border-radius: ${shape}; border: ${border};
                    overflow: hidden; flex-shrink: 0; position: relative;
                ">
                    <img src="${data.profileImageUrl}" alt="Profilbild" style="
                        width: ${zoom}%;
                        height: ${zoom}%;
                        object-fit: cover;
                        object-position: ${50 + offsetX}% ${50 + offsetY}%;
                        transform: translate(${offsetX}%, ${offsetY}%);
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        margin-top: -${zoom/2}%;
                        margin-left: -${zoom/2}%;
                    ">
                </div>
            `;
        }
        
        const headerContent = `
            <h1 class="resume-preview-name">${data.firstName} ${data.lastName}</h1>
            ${data.birthDate ? `<p class="resume-preview-birthdate">Geb. am ${this.formatDate(data.birthDate)}</p>` : ''}
            <p class="resume-preview-title">${data.title}</p>
            <div class="resume-preview-contact">
                ${data.phone ? `<span><i class="fas fa-phone"></i> ${data.phone}</span>` : ''}
                ${data.location ? `<span><i class="fas fa-map-marker-alt"></i> ${data.location}</span>` : ''}
                ${data.email ? `<span><i class="fas fa-envelope"></i> ${data.email}</span>` : ''}
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
    
    formatDate(dateStr) {
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
        const title = section?.customTitle || 'Profil';
        return `
            <div class="resume-preview-section">
                <h2 class="resume-preview-section-title"><i class="fas fa-user"></i> ${title}</h2>
                <p class="resume-preview-item-description">${data.summary}</p>
            </div>
        `;
    }

    renderExperienceSection(data, section) {
        if (!data.experience?.length) return '';
        const title = section?.customTitle || 'Berufserfahrung';
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
                    
                    // Description (bullets sind jetzt in description integriert)
                    let descriptionHtml = '';
                    if (exp.description) {
                        // Konvertiere Zeilenumbrüche zu <br> für bessere Darstellung
                        // Wenn format 'bullets' oder 'mixed', konvertiere Stichpunkte zu <ul>
                        if (format === 'bullets' || (format === 'mixed' && exp.description.includes('\n'))) {
                            const lines = exp.description.split('\n').filter(l => l.trim());
                            const bulletLines = lines.filter(l => l.trim().match(/^[-•*]/));
                            const proseLines = lines.filter(l => !l.trim().match(/^[-•*]/));
                            
                            if (bulletLines.length > 0) {
                                // Rendere als Bullet-Liste
                                descriptionHtml = `<ul class="resume-preview-bullets">${bulletLines.map(b => `<li>${b.replace(/^[-•*]\s*/, '')}</li>`).join('')}</ul>`;
                                // Füge Prose-Lines vorher hinzu, falls vorhanden
                                if (proseLines.length > 0) {
                                    descriptionHtml = `<p class="resume-preview-item-description">${proseLines.join('<br>')}</p>` + descriptionHtml;
                                }
                            } else {
                                // Keine Bullets erkannt, rendere als normalen Text
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
        const title = section?.customTitle || 'Ausbildung';
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
        const title = section?.customTitle || 'Fähigkeiten';
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
                        <div class="resume-preview-item-title">Soft Skills</div>
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
        
        switch (display) {
            case 'bars':
                return `
                    <div class="resume-skill-bar-item">
                        <div class="resume-skill-bar-header">
                            <span class="resume-skill-name">${name}</span>
                            ${showLabel ? `<span class="resume-skill-level">${level}/${maxLevel}</span>` : ''}
                        </div>
                        <div class="resume-skill-bar">
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
                    <div class="resume-skill-dots-item">
                        <span class="resume-skill-name">${name}</span>
                        <div class="resume-skill-dots">${dots}</div>
                    </div>
                `;
            case 'numeric':
                return `
                    <div class="resume-skill-numeric-item">
                        <span class="resume-skill-name">${name}</span>
                        <span class="resume-skill-numeric">${level}/${maxLevel}</span>
                    </div>
                `;
            case 'percentage':
                return `
                    <div class="resume-skill-percentage-item">
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
        const title = section?.customTitle || 'Sprachen';
        return `
            <div class="resume-preview-section">
                <h2 class="resume-preview-section-title"><i class="fas fa-language"></i> ${title}</h2>
                ${data.languages.map(lang => `
                    <div class="resume-preview-item" style="display: flex; justify-content: space-between;">
                        <span>${lang.language}</span>
                        <span style="color: var(--resume-muted-color)">${lang.level}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderProjectsSection(data, section) {
        if (!data.projects?.length) return '';
        const title = section?.customTitle || 'Projekte';
        return `
            <div class="resume-preview-section">
                <h2 class="resume-preview-section-title"><i class="fas fa-project-diagram"></i> ${title}</h2>
                ${data.projects.map(project => `
                    <div class="resume-preview-item">
                        <div class="resume-preview-item-header">
                            <span class="resume-preview-item-title">${project.name}</span>
                            <span class="resume-preview-item-date">${project.startDate} - ${project.endDate || 'heute'}</span>
                        </div>
                        ${project.role ? `<div class="resume-preview-item-subtitle">${project.role}</div>` : ''}
                        ${project.description ? `<p class="resume-preview-item-description">${project.description}</p>` : ''}
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    renderSignatureSection(data, section) {
        if (!this.settings.showSignature) return '';
        
        const location = this.settings.signatureLocation || '';
        const date = this.settings.signatureDate || '';
        const signatureImage = this.settings.signatureImage || '';
        const showLine = this.settings.signatureLine;
        
        return `
            <div class="resume-preview-section resume-signature-section">
                <div class="resume-signature-content">
                    ${location || date ? `
                        <p class="resume-signature-location-date">${location}${location && date ? ', ' : ''}${date}</p>
                    ` : ''}
                    ${signatureImage ? `
                        <div class="resume-signature-image">
                            <img src="${signatureImage}" alt="Unterschrift" style="max-height: 60px; max-width: 200px;">
                        </div>
                    ` : ''}
                    ${showLine ? `<div class="resume-signature-line"></div>` : ''}
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

    exportToPDF() {
        window.print();
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
