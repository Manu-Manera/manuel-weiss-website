/**
 * ═══════════════════════════════════════════════════════════════════════════
 * DESIGN EDITOR - Professional Resume Designer
 * Phases 1-5: Typography, Colors, Spacing, Drag & Drop, Templates
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
        this.setupColors();
        this.setupSpacing();
        this.setupTemplates();
        this.setupSections();
        this.setupZoom();
        this.setupAutoSave();
        this.applySettings();
        this.updatePreview();
        
        console.log('🎨 Design Editor initialized');
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // DEFAULT SETTINGS
    // ═══════════════════════════════════════════════════════════════════════════

    getDefaultSettings() {
        return {
            // Typography
            fontFamily: "'Inter', sans-serif",
            fontSize: 11,
            headingSize: 14,
            lineHeight: 1.5,
            
            // Colors
            accentColor: '#6366f1',
            textColor: '#1e293b',
            mutedColor: '#64748b',
            backgroundColor: '#ffffff',
            borderColor: '#e2e8f0',
            
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
            
            // Sections Order & Visibility
            sections: [
                { id: 'header', name: 'Kopfzeile', icon: 'fa-user', visible: true },
                { id: 'summary', name: 'Kurzprofil', icon: 'fa-align-left', visible: true },
                { id: 'experience', name: 'Berufserfahrung', icon: 'fa-briefcase', visible: true },
                { id: 'education', name: 'Ausbildung', icon: 'fa-graduation-cap', visible: true },
                { id: 'skills', name: 'Fähigkeiten', icon: 'fa-tools', visible: true },
                { id: 'projects', name: 'Projekte', icon: 'fa-project-diagram', visible: false },
                { id: 'languages', name: 'Sprachen', icon: 'fa-language', visible: true },
                { id: 'certifications', name: 'Zertifikate', icon: 'fa-certificate', visible: false },
                { id: 'hobbies', name: 'Hobbys', icon: 'fa-heart', visible: false }
            ]
        };
    }

    loadSettings() {
        try {
            const saved = localStorage.getItem('resume_design_settings');
            if (saved) {
                return { ...this.getDefaultSettings(), ...JSON.parse(saved) };
            }
        } catch (e) {
            console.warn('Could not load design settings:', e);
        }
        return this.getDefaultSettings();
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
                
                // Update tabs
                document.querySelectorAll('.design-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                // Update panels
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
        // Font Family
        const fontSelect = document.getElementById('designFontFamily');
        if (fontSelect) {
            fontSelect.value = this.settings.fontFamily;
            fontSelect.addEventListener('change', (e) => {
                this.settings.fontFamily = e.target.value;
                this.applySettings();
                this.saveSettings();
            });
        }

        // Font Size
        this.setupSlider('designFontSize', 'fontSize', 8, 14, 'pt');
        
        // Heading Size
        this.setupSlider('designHeadingSize', 'headingSize', 12, 24, 'pt');
        
        // Line Height
        this.setupSlider('designLineHeight', 'lineHeight', 1.0, 2.0, '', 0.1);
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
    // COLORS
    // ═══════════════════════════════════════════════════════════════════════════

    setupColors() {
        const colorSettings = [
            { id: 'designAccentColor', key: 'accentColor' },
            { id: 'designTextColor', key: 'textColor' },
            { id: 'designMutedColor', key: 'mutedColor' },
            { id: 'designBgColor', key: 'backgroundColor' }
        ];

        colorSettings.forEach(({ id, key }) => {
            const colorPicker = document.getElementById(id);
            const hexInput = document.getElementById(`${id}Hex`);
            
            if (colorPicker) {
                colorPicker.value = this.settings[key];
                
                colorPicker.addEventListener('input', (e) => {
                    this.settings[key] = e.target.value;
                    if (hexInput) hexInput.value = e.target.value;
                    this.applySettings();
                });
                
                colorPicker.addEventListener('change', () => {
                    this.saveSettings();
                });
            }
            
            if (hexInput) {
                hexInput.value = this.settings[key];
                hexInput.addEventListener('input', (e) => {
                    let value = e.target.value;
                    if (!value.startsWith('#')) value = '#' + value;
                    if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
                        this.settings[key] = value;
                        if (colorPicker) colorPicker.value = value;
                        this.applySettings();
                        this.saveSettings();
                    }
                });
            }
        });

        // Color Presets
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
                    
                    // Update UI
                    const accentPicker = document.getElementById('designAccentColor');
                    const accentHex = document.getElementById('designAccentColorHex');
                    if (accentPicker) accentPicker.value = btn.dataset.accent;
                    if (accentHex) accentHex.value = btn.dataset.accent;
                    
                    // Update active state
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
        // Margins
        this.setupSlider('designMarginTop', 'marginTop', 10, 40, 'mm');
        this.setupSlider('designMarginRight', 'marginRight', 10, 40, 'mm');
        this.setupSlider('designMarginBottom', 'marginBottom', 10, 40, 'mm');
        this.setupSlider('designMarginLeft', 'marginLeft', 10, 40, 'mm');
        
        // Section Gap
        this.setupSlider('designSectionGap', 'sectionGap', 12, 48, 'px');
        
        // Item Gap
        this.setupSlider('designItemGap', 'itemGap', 6, 24, 'px');

        // Uniform Margins Toggle
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
    // TEMPLATES
    // ═══════════════════════════════════════════════════════════════════════════

    setupTemplates() {
        const templates = [
            { id: 'modern', name: 'Modern', desc: 'Clean & Professional', icon: '📄', settings: { accentColor: '#6366f1', fontFamily: "'Inter', sans-serif" } },
            { id: 'classic', name: 'Klassisch', desc: 'Zeitlos & Elegant', icon: '📋', settings: { accentColor: '#1e293b', fontFamily: "'Georgia', serif" } },
            { id: 'creative', name: 'Kreativ', desc: 'Auffällig & Modern', icon: '🎨', settings: { accentColor: '#8b5cf6', fontFamily: "'Montserrat', sans-serif" } },
            { id: 'minimal', name: 'Minimal', desc: 'Schlicht & Fokussiert', icon: '✨', settings: { accentColor: '#64748b', fontFamily: "'Inter', sans-serif" } },
            { id: 'executive', name: 'Executive', desc: 'Führungskräfte', icon: '👔', settings: { accentColor: '#0f172a', fontFamily: "'Times New Roman', serif" } },
            { id: 'ats', name: 'ATS-Optimiert', desc: 'Für Bewerbungssysteme', icon: '🤖', settings: { accentColor: '#1e293b', fontFamily: "'Arial', sans-serif" } }
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
                        // Update active state
                        templatesGrid.querySelectorAll('.design-template-card').forEach(c => c.classList.remove('active'));
                        card.classList.add('active');
                        
                        // Apply template settings
                        this.settings.template = templateId;
                        Object.assign(this.settings, template.settings);
                        
                        // Update UI
                        this.updateUIFromSettings();
                        this.applySettings();
                        this.saveSettings();
                        
                        this.showNotification(`Template "${template.name}" angewendet`, 'success');
                    }
                });
            });
        }
    }

    updateUIFromSettings() {
        // Update font selector
        const fontSelect = document.getElementById('designFontFamily');
        if (fontSelect) fontSelect.value = this.settings.fontFamily;
        
        // Update color pickers
        const accentPicker = document.getElementById('designAccentColor');
        const accentHex = document.getElementById('designAccentColorHex');
        if (accentPicker) accentPicker.value = this.settings.accentColor;
        if (accentHex) accentHex.value = this.settings.accentColor;
        
        // Update color presets
        document.querySelectorAll('.design-color-preset').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.accent === this.settings.accentColor);
        });
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
            </div>
        `).join('');

        // Setup toggle buttons
        container.querySelectorAll('.design-section-btn[data-action="toggle"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const item = btn.closest('.design-section-item');
                const sectionId = item.dataset.id;
                this.toggleSection(sectionId);
            });
        });
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
        
        console.log('📋 Sections reordered');
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
        const zoomValue = document.getElementById('zoomValue');

        if (zoomIn) {
            zoomIn.addEventListener('click', () => this.setZoom(this.currentZoom + 10));
        }
        if (zoomOut) {
            zoomOut.addEventListener('click', () => this.setZoom(this.currentZoom - 10));
        }
        if (zoomReset) {
            zoomReset.addEventListener('click', () => this.setZoom(100));
        }
    }

    setZoom(value) {
        this.currentZoom = Math.max(50, Math.min(200, value));
        
        const zoomValue = document.getElementById('zoomValue');
        if (zoomValue) {
            zoomValue.textContent = this.currentZoom + '%';
        }
        
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
        
        preview.style.setProperty('--resume-margin', `${this.settings.marginTop}mm ${this.settings.marginRight}mm ${this.settings.marginBottom}mm ${this.settings.marginLeft}mm`);
        preview.style.setProperty('--resume-section-gap', this.settings.sectionGap + 'px');
        preview.style.setProperty('--resume-item-gap', this.settings.itemGap + 'px');

        // Apply font family directly
        preview.style.fontFamily = this.settings.fontFamily;
        preview.style.fontSize = this.settings.fontSize + 'pt';
        preview.style.lineHeight = this.settings.lineHeight;
        preview.style.color = this.settings.textColor;
        preview.style.backgroundColor = this.settings.backgroundColor;
        preview.style.padding = `${this.settings.marginTop}mm ${this.settings.marginRight}mm ${this.settings.marginBottom}mm ${this.settings.marginLeft}mm`;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // PREVIEW UPDATE
    // ═══════════════════════════════════════════════════════════════════════════

    updatePreview() {
        const preview = document.querySelector('.design-resume-preview');
        if (!preview) return;

        // Get resume data
        const resumeData = this.getResumeData();
        
        // Generate preview HTML
        let html = '';
        
        this.sections.filter(s => s.visible).forEach(section => {
            switch (section.id) {
                case 'header':
                    html += this.renderHeaderSection(resumeData);
                    break;
                case 'summary':
                    html += this.renderSummarySection(resumeData);
                    break;
                case 'experience':
                    html += this.renderExperienceSection(resumeData);
                    break;
                case 'education':
                    html += this.renderEducationSection(resumeData);
                    break;
                case 'skills':
                    html += this.renderSkillsSection(resumeData);
                    break;
                case 'languages':
                    html += this.renderLanguagesSection(resumeData);
                    break;
                case 'projects':
                    html += this.renderProjectsSection(resumeData);
                    break;
            }
        });

        preview.innerHTML = html || this.renderPlaceholderContent();
    }

    getResumeData() {
        // Try to get data from the resume form
        return {
            firstName: document.getElementById('firstName')?.value || 'Max',
            lastName: document.getElementById('lastName')?.value || 'Mustermann',
            title: document.getElementById('title')?.value || 'Software Engineer',
            email: document.getElementById('email')?.value || 'max@example.com',
            phone: document.getElementById('phone')?.value || '+49 123 456789',
            location: document.getElementById('location')?.value || 'Berlin, Deutschland',
            summary: document.getElementById('summary')?.value || 'Erfahrener Entwickler mit Expertise in modernen Web-Technologien.',
            experience: this.getExperienceData(),
            education: this.getEducationData(),
            skills: this.getSkillsData(),
            languages: this.getLanguagesData()
        };
    }

    getExperienceData() {
        const container = document.getElementById('experienceContainer');
        if (!container) return [];
        
        const items = [];
        container.querySelectorAll('.experience-item, .entry-item').forEach(item => {
            items.push({
                position: item.querySelector('[name*="position"], [name*="title"]')?.value || '',
                company: item.querySelector('[name*="company"]')?.value || '',
                startDate: item.querySelector('[name*="start"]')?.value || '',
                endDate: item.querySelector('[name*="end"]')?.value || '',
                description: item.querySelector('textarea')?.value || ''
            });
        });
        
        return items.length > 0 ? items : [
            { position: 'Senior Developer', company: 'Tech Company', startDate: '2020-01', endDate: 'heute', description: 'Entwicklung von Web-Anwendungen' }
        ];
    }

    getEducationData() {
        const container = document.getElementById('educationContainer');
        if (!container) return [];
        
        const items = [];
        container.querySelectorAll('.education-item, .entry-item').forEach(item => {
            items.push({
                degree: item.querySelector('[name*="degree"]')?.value || '',
                institution: item.querySelector('[name*="institution"], [name*="school"]')?.value || '',
                startDate: item.querySelector('[name*="start"]')?.value || '',
                endDate: item.querySelector('[name*="end"]')?.value || ''
            });
        });
        
        return items.length > 0 ? items : [
            { degree: 'Bachelor Informatik', institution: 'Technische Universität', startDate: '2015', endDate: '2019' }
        ];
    }

    getSkillsData() {
        const skills = [];
        document.querySelectorAll('#technicalSkillsContainer .skill-tag, #softSkillsContainer .skill-tag').forEach(tag => {
            if (tag.textContent.trim()) {
                skills.push(tag.textContent.trim());
            }
        });
        
        return skills.length > 0 ? skills : ['JavaScript', 'React', 'Node.js', 'Python', 'SQL'];
    }

    getLanguagesData() {
        const container = document.getElementById('languagesContainer');
        if (!container) return [];
        
        const items = [];
        container.querySelectorAll('.language-item, .entry-item').forEach(item => {
            items.push({
                language: item.querySelector('[name*="language"]')?.value || item.querySelector('input')?.value || '',
                level: item.querySelector('select')?.value || ''
            });
        });
        
        return items.length > 0 ? items : [
            { language: 'Deutsch', level: 'Muttersprache' },
            { language: 'Englisch', level: 'Fließend' }
        ];
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // SECTION RENDERERS
    // ═══════════════════════════════════════════════════════════════════════════

    renderHeaderSection(data) {
        return `
            <div class="resume-preview-header">
                <h1 class="resume-preview-name">${data.firstName} ${data.lastName}</h1>
                <p class="resume-preview-title">${data.title}</p>
                <div class="resume-preview-contact">
                    ${data.email ? `<span><i class="fas fa-envelope"></i> ${data.email}</span>` : ''}
                    ${data.phone ? `<span><i class="fas fa-phone"></i> ${data.phone}</span>` : ''}
                    ${data.location ? `<span><i class="fas fa-map-marker-alt"></i> ${data.location}</span>` : ''}
                </div>
            </div>
        `;
    }

    renderSummarySection(data) {
        if (!data.summary) return '';
        return `
            <div class="resume-preview-section">
                <h2 class="resume-preview-section-title"><i class="fas fa-user"></i> Profil</h2>
                <p class="resume-preview-item-description">${data.summary}</p>
            </div>
        `;
    }

    renderExperienceSection(data) {
        if (!data.experience?.length) return '';
        return `
            <div class="resume-preview-section">
                <h2 class="resume-preview-section-title"><i class="fas fa-briefcase"></i> Berufserfahrung</h2>
                ${data.experience.map(exp => `
                    <div class="resume-preview-item">
                        <div class="resume-preview-item-header">
                            <span class="resume-preview-item-title">${exp.position}</span>
                            <span class="resume-preview-item-date">${exp.startDate} - ${exp.endDate || 'heute'}</span>
                        </div>
                        <div class="resume-preview-item-subtitle">${exp.company}</div>
                        ${exp.description ? `<p class="resume-preview-item-description">${exp.description}</p>` : ''}
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderEducationSection(data) {
        if (!data.education?.length) return '';
        return `
            <div class="resume-preview-section">
                <h2 class="resume-preview-section-title"><i class="fas fa-graduation-cap"></i> Ausbildung</h2>
                ${data.education.map(edu => `
                    <div class="resume-preview-item">
                        <div class="resume-preview-item-header">
                            <span class="resume-preview-item-title">${edu.degree}</span>
                            <span class="resume-preview-item-date">${edu.startDate} - ${edu.endDate}</span>
                        </div>
                        <div class="resume-preview-item-subtitle">${edu.institution}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderSkillsSection(data) {
        if (!data.skills?.length) return '';
        return `
            <div class="resume-preview-section">
                <h2 class="resume-preview-section-title"><i class="fas fa-tools"></i> Fähigkeiten</h2>
                <div class="resume-preview-skills">
                    ${data.skills.map(skill => `<span class="resume-preview-skill">${skill}</span>`).join('')}
                </div>
            </div>
        `;
    }

    renderLanguagesSection(data) {
        if (!data.languages?.length) return '';
        return `
            <div class="resume-preview-section">
                <h2 class="resume-preview-section-title"><i class="fas fa-language"></i> Sprachen</h2>
                ${data.languages.map(lang => `
                    <div class="resume-preview-item" style="display: flex; justify-content: space-between;">
                        <span>${lang.language}</span>
                        <span style="color: var(--resume-muted-color)">${lang.level}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderProjectsSection(data) {
        return '';  // To be implemented
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
        // Auto-update preview when form changes
        const form = document.getElementById('resumeForm');
        if (form) {
            form.addEventListener('input', () => {
                clearTimeout(this.previewTimeout);
                this.previewTimeout = setTimeout(() => this.updatePreview(), 300);
            });
        }
    }

    exportToPDF() {
        // Trigger print dialog with print-optimized styles
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
        
        // Initialize if not already done
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
    // Check if we're on a page with the design editor
    if (document.getElementById('designEditorModal') || document.querySelector('.design-editor-container')) {
        window.designEditor = new DesignEditor();
    }
});
