/**
 * ═══════════════════════════════════════════════════════════════════════════
 * INDUSTRY TEMPLATES
 * Pre-configured templates for different industries and job types
 * ═══════════════════════════════════════════════════════════════════════════
 */

class IndustryTemplates {
    constructor() {
        this.currentTemplate = null;
        
        // Define industry-specific templates
        this.templates = {
            it_software: {
                name: 'IT / Software-Entwicklung',
                icon: 'fa-code',
                color: '#6366f1',
                tone: 'tech-depth',
                focus: 'skills',
                sections: ['skills', 'projects', 'experience', 'education', 'certifications'],
                keywords: [
                    'Programmierung', 'Software-Entwicklung', 'Agile', 'Scrum', 'Git',
                    'CI/CD', 'Cloud', 'API', 'Datenbanken', 'Testing', 'Code Review'
                ],
                promptModifiers: `
                    - Technisch präzise und fachlich fundiert formulieren
                    - Konkrete Technologien und Tools nennen
                    - GitHub/GitLab-Projekte und Open Source erwähnen
                    - Messbare Ergebnisse (Performance, Code-Qualität) betonen
                    - Agile Methoden und Teamarbeit hervorheben
                `,
                samplePhrases: [
                    'Entwicklung skalierbarer Microservices mit X',
                    'Implementierung von CI/CD-Pipelines',
                    'Code-Reviews und Mentoring von Junior-Entwicklern',
                    'Reduzierung der Ladezeit um X%',
                    'Automatisierung von X Prozessen'
                ],
                design: {
                    style: 'modern',
                    accentColor: '#6366f1'
                }
            },
            
            consulting: {
                name: 'Beratung / Consulting',
                icon: 'fa-chart-line',
                color: '#0ea5e9',
                tone: 'impact',
                focus: 'experience',
                sections: ['experience', 'education', 'skills', 'certifications', 'languages'],
                keywords: [
                    'Strategie', 'Transformation', 'Stakeholder', 'ROI', 'KPI',
                    'Change Management', 'Projektsteuerung', 'Business Case', 'Due Diligence'
                ],
                promptModifiers: `
                    - STAR-Methode (Situation, Task, Action, Result) anwenden
                    - Messbare Ergebnisse und ROI betonen
                    - Branchenerfahrung und Kundenprojekte hervorheben
                    - Analytische und konzeptionelle Fähigkeiten zeigen
                    - Präsentations- und Kommunikationsstärke demonstrieren
                `,
                samplePhrases: [
                    'Beratung von C-Level Executives bei strategischen Entscheidungen',
                    'Entwicklung eines Business Cases mit ROI von X%',
                    'Leitung eines Transformationsprojekts mit X Mitarbeitern',
                    'Einsparungen von X€ durch Prozessoptimierung',
                    'Durchführung von Due-Diligence-Prüfungen'
                ],
                design: {
                    style: 'classic',
                    accentColor: '#0ea5e9'
                }
            },
            
            creative: {
                name: 'Design / Kreativ',
                icon: 'fa-palette',
                color: '#ec4899',
                tone: 'creative',
                focus: 'skills',
                sections: ['projects', 'skills', 'experience', 'education'],
                keywords: [
                    'Design', 'UX', 'UI', 'Branding', 'Konzeption', 'Kreativität',
                    'Adobe Creative Suite', 'Figma', 'Sketch', 'Prototyping'
                ],
                promptModifiers: `
                    - Kreative Sprache und Storytelling verwenden
                    - Portfolio-Projekte und Referenzen betonen
                    - Designprozess und Methodik beschreiben
                    - Zusammenarbeit mit Kunden/Stakeholdern hervorheben
                    - Visuelle Ergebnisse und User-Feedback erwähnen
                `,
                samplePhrases: [
                    'Entwicklung einer visuellen Identität für X',
                    'Steigerung der User-Engagement-Rate um X%',
                    'Konzeption und Durchführung von Design-Sprints',
                    'Erstellung von Prototypen und User-Tests',
                    'Zusammenarbeit mit cross-funktionalen Teams'
                ],
                design: {
                    style: 'creative',
                    accentColor: '#ec4899'
                }
            },
            
            finance: {
                name: 'Finanzen / Banking',
                icon: 'fa-university',
                color: '#14532d',
                tone: 'formal',
                focus: 'experience',
                sections: ['experience', 'education', 'certifications', 'skills', 'languages'],
                keywords: [
                    'Finanzanalyse', 'Risikomanagement', 'Compliance', 'Reporting',
                    'Portfolio', 'M&A', 'Due Diligence', 'Controlling', 'Audit'
                ],
                promptModifiers: `
                    - Professionell und sachlich formulieren
                    - Regulatorische Kenntnisse (Basel, MiFID) betonen
                    - Erfahrung mit Finanzinstrumenten hervorheben
                    - Analytische Fähigkeiten und Zahlenkompetenz zeigen
                    - Verantwortungsvolle Positionen und Budgets nennen
                `,
                samplePhrases: [
                    'Verwaltung eines Portfolios im Wert von X Mio. €',
                    'Implementierung von Risikomanagement-Systemen',
                    'Reduktion der operativen Risiken um X%',
                    'Durchführung von Finanzanalysen für Vorstandsentscheidungen',
                    'Sicherstellung der regulatorischen Compliance'
                ],
                design: {
                    style: 'executive',
                    accentColor: '#14532d'
                }
            },
            
            healthcare: {
                name: 'Gesundheitswesen',
                icon: 'fa-heartbeat',
                color: '#dc2626',
                tone: 'formal',
                focus: 'experience',
                sections: ['experience', 'education', 'certifications', 'skills'],
                keywords: [
                    'Patientenversorgung', 'Qualitätsmanagement', 'Hygiene',
                    'Medizinprodukte', 'Dokumentation', 'Interdisziplinär', 'Zertifizierung'
                ],
                promptModifiers: `
                    - Patientenorientierung betonen
                    - Fachliche Qualifikationen und Zertifizierungen hervorheben
                    - Erfahrung mit medizinischen Systemen nennen
                    - Team- und interdisziplinäre Zusammenarbeit zeigen
                    - Qualitäts- und Hygienestandards erwähnen
                `,
                samplePhrases: [
                    'Betreuung von X Patienten pro Schicht',
                    'Implementierung von Qualitätsmanagement-Systemen',
                    'Leitung eines interdisziplinären Teams',
                    'Schulung von X Mitarbeitern in neuen Verfahren',
                    'Optimierung von Behandlungsabläufen'
                ],
                design: {
                    style: 'classic',
                    accentColor: '#dc2626'
                }
            },
            
            public_sector: {
                name: 'Öffentlicher Dienst',
                icon: 'fa-landmark',
                color: '#1e3a8a',
                tone: 'formal',
                focus: 'experience',
                sections: ['experience', 'education', 'certifications', 'languages', 'skills'],
                keywords: [
                    'Verwaltung', 'Behörde', 'Richtlinien', 'Compliance',
                    'Bürgernähe', 'Digitalisierung', 'E-Government', 'Haushalt'
                ],
                promptModifiers: `
                    - Formell und präzise formulieren
                    - Qualifikationen und Laufbahn betonen
                    - Erfahrung mit Verwaltungsabläufen hervorheben
                    - Dienst am Bürger und Gemeinwohl zeigen
                    - Kenntnisse von Gesetzen und Vorschriften nennen
                `,
                samplePhrases: [
                    'Bearbeitung von X Vorgängen pro Monat',
                    'Umsetzung der Digitalisierungsstrategie',
                    'Beratung von Bürgern in komplexen Sachverhalten',
                    'Koordination zwischen verschiedenen Behörden',
                    'Haushaltsplanung und -überwachung'
                ],
                design: {
                    style: 'ats',
                    accentColor: '#1e3a8a'
                }
            },
            
            sales: {
                name: 'Vertrieb / Sales',
                icon: 'fa-handshake',
                color: '#059669',
                tone: 'impact',
                focus: 'experience',
                sections: ['experience', 'skills', 'education', 'languages'],
                keywords: [
                    'Umsatz', 'Neukunden', 'Bestandskunden', 'Pipeline',
                    'Abschluss', 'Key Account', 'B2B', 'B2C', 'CRM'
                ],
                promptModifiers: `
                    - Konkrete Verkaufszahlen und Quoten nennen
                    - Kundenerfolge und Referenzen hervorheben
                    - Beziehungsmanagement betonen
                    - Verhandlungsgeschick und Abschlussstärke zeigen
                    - Markt- und Wettbewerbskenntnisse demonstrieren
                `,
                samplePhrases: [
                    'Übertreffen der Verkaufsquote um X%',
                    'Gewinnung von X Neukunden pro Quartal',
                    'Ausbau des Key-Account-Portfolios um X%',
                    'Steigerung des Umsatzes von X€ auf Y€',
                    'Aufbau und Pflege langfristiger Kundenbeziehungen'
                ],
                design: {
                    style: 'modern',
                    accentColor: '#059669'
                }
            },
            
            hr: {
                name: 'HR / Personal',
                icon: 'fa-users',
                color: '#7c3aed',
                tone: 'modern',
                focus: 'experience',
                sections: ['experience', 'skills', 'education', 'certifications'],
                keywords: [
                    'Recruiting', 'Personalentwicklung', 'Employer Branding',
                    'Onboarding', 'Arbeitsrecht', 'Compensation', 'Benefits', 'Talent Management'
                ],
                promptModifiers: `
                    - Mitarbeiterorientierung betonen
                    - Kennzahlen zu Recruiting und Retention nennen
                    - HR-Tools und -Systeme erwähnen
                    - Strategische HR-Arbeit hervorheben
                    - Kommunikations- und Moderationsstärke zeigen
                `,
                samplePhrases: [
                    'Erfolgreiche Besetzung von X Positionen pro Jahr',
                    'Reduktion der Time-to-Hire um X%',
                    'Implementierung eines neuen Onboarding-Prozesses',
                    'Steigerung der Mitarbeiterzufriedenheit um X%',
                    'Entwicklung einer Employer-Branding-Strategie'
                ],
                design: {
                    style: 'modern',
                    accentColor: '#7c3aed'
                }
            },
            
            marketing: {
                name: 'Marketing / PR',
                icon: 'fa-bullhorn',
                color: '#f59e0b',
                tone: 'creative',
                focus: 'skills',
                sections: ['experience', 'projects', 'skills', 'education'],
                keywords: [
                    'Kampagne', 'Content', 'Social Media', 'SEO', 'SEM',
                    'Markenführung', 'Analytics', 'Conversion', 'Lead Generation'
                ],
                promptModifiers: `
                    - Kreative Kampagnen und Erfolge beschreiben
                    - Messbare Marketing-KPIs nennen (Reach, Engagement, Conversion)
                    - Digitale und klassische Kanäle erwähnen
                    - Strategische und operative Erfahrung zeigen
                    - Tool-Kenntnisse hervorheben
                `,
                samplePhrases: [
                    'Steigerung der Brand Awareness um X%',
                    'Entwicklung einer Content-Strategie mit X% mehr Engagement',
                    'Generierung von X qualifizierten Leads pro Monat',
                    'Optimierung der Conversion Rate um X%',
                    'Planung und Durchführung von Kampagnen mit Budget von X€'
                ],
                design: {
                    style: 'creative',
                    accentColor: '#f59e0b'
                }
            }
        };
        
        this.init();
    }
    
    init() {
        this.createTemplateSelector();
        this.loadSavedTemplate();
        console.log('📋 Industry Templates initialized');
    }
    
    createTemplateSelector() {
        // Find options section in cover letter editor
        const optionsSection = document.querySelector('.sidebar-section:has(.option-group)') ||
                              document.querySelector('.option-group')?.parentElement;
        
        if (optionsSection && !document.getElementById('industryTemplateSection')) {
            const section = document.createElement('div');
            section.id = 'industryTemplateSection';
            section.className = 'sidebar-section';
            section.innerHTML = `
                <h3><i class="fas fa-industry"></i> Branchen-Template</h3>
                <div class="industry-template-selector">
                    <select id="industryTemplateSelect" class="design-select">
                        <option value="">Template wählen...</option>
                        ${Object.entries(this.templates).map(([key, template]) => `
                            <option value="${key}">${template.name}</option>
                        `).join('')}
                    </select>
                    <button type="button" class="btn-secondary btn-apply-template" id="applyTemplateBtn" disabled>
                        <i class="fas fa-magic"></i> Anwenden
                    </button>
                </div>
                <div id="templatePreview" class="template-preview" style="display: none;"></div>
            `;
            
            optionsSection.parentNode.insertBefore(section, optionsSection);
            
            // Event listeners
            const select = document.getElementById('industryTemplateSelect');
            const applyBtn = document.getElementById('applyTemplateBtn');
            
            select.addEventListener('change', () => {
                const templateKey = select.value;
                if (templateKey) {
                    this.showTemplatePreview(templateKey);
                    applyBtn.disabled = false;
                } else {
                    this.hideTemplatePreview();
                    applyBtn.disabled = true;
                }
            });
            
            applyBtn.addEventListener('click', () => {
                const templateKey = select.value;
                if (templateKey) {
                    this.applyTemplate(templateKey);
                }
            });
        }
        
        // Also add to resume editor if present
        this.createResumeTemplateSection();
    }
    
    createResumeTemplateSection() {
        const aiSection = document.querySelector('.resume-ai-section');
        if (!aiSection || document.getElementById('resumeIndustryTemplate')) return;
        
        const section = document.createElement('div');
        section.id = 'resumeIndustryTemplate';
        section.className = 'industry-template-buttons';
        section.innerHTML = `
            <label>Branchenvorlage</label>
            <div class="template-quick-buttons">
                ${Object.entries(this.templates).slice(0, 6).map(([key, template]) => `
                    <button type="button" class="template-quick-btn" data-template="${key}" title="${template.name}">
                        <i class="fas ${template.icon}"></i>
                    </button>
                `).join('')}
            </div>
        `;
        
        // Insert before AI actions
        const aiActions = aiSection.querySelector('.ai-actions');
        if (aiActions) {
            aiActions.parentNode.insertBefore(section, aiActions);
        }
        
        // Click handlers
        section.querySelectorAll('.template-quick-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const templateKey = btn.dataset.template;
                this.applyToResume(templateKey);
                
                // Update active state
                section.querySelectorAll('.template-quick-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
    }
    
    showTemplatePreview(templateKey) {
        const template = this.templates[templateKey];
        const preview = document.getElementById('templatePreview');
        
        if (!template || !preview) return;
        
        preview.innerHTML = `
            <div class="preview-header" style="border-left-color: ${template.color}">
                <i class="fas ${template.icon}" style="color: ${template.color}"></i>
                <span>${template.name}</span>
            </div>
            <div class="preview-keywords">
                <strong>Keywords:</strong>
                ${template.keywords.slice(0, 6).map(k => `<span>${k}</span>`).join('')}
            </div>
            <div class="preview-sample">
                <strong>Beispielformulierung:</strong>
                <p>"${template.samplePhrases[0]}"</p>
            </div>
        `;
        preview.style.display = 'block';
    }
    
    hideTemplatePreview() {
        const preview = document.getElementById('templatePreview');
        if (preview) preview.style.display = 'none';
    }
    
    applyTemplate(templateKey) {
        const template = this.templates[templateKey];
        if (!template) return;
        
        this.currentTemplate = templateKey;
        
        // Apply tone
        const toneBtn = document.querySelector(`.option-btn[data-option="tone"][data-value="${template.tone}"]`);
        if (toneBtn) toneBtn.click();
        
        // Apply focus
        const focusBtn = document.querySelector(`.option-btn[data-option="focus"][data-value="${template.focus}"]`);
        if (focusBtn) focusBtn.click();
        
        // Apply goal if available
        if (template.goal) {
            const goalBtn = document.querySelector(`.option-btn[data-option="goal"][data-value="${template.goal}"]`);
            if (goalBtn) goalBtn.click();
        }
        
        // Apply design style if design editor is available
        if (template.design && window.coverLetterEditor) {
            window.coverLetterEditor.design.color = template.design.accentColor;
            
            const colorBtn = document.querySelector(`.color-btn[data-color="${template.design.accentColor}"]`);
            if (colorBtn) colorBtn.click();
        }
        
        // Store template for AI prompt modification
        localStorage.setItem('selected_industry_template', templateKey);
        
        // Update prompt builder if available
        this.updatePromptBuilder(template);
        
        this.showNotification(`Template "${template.name}" angewendet!`, 'success');
    }
    
    applyToResume(templateKey) {
        const template = this.templates[templateKey];
        if (!template) return;
        
        this.currentTemplate = templateKey;
        
        // Apply design settings
        if (window.designEditor) {
            window.designEditor.settings.accentColor = template.design.accentColor;
            
            // Map template style to design template
            const styleMap = {
                'modern': 'modern',
                'classic': 'classic',
                'creative': 'creative',
                'executive': 'executive',
                'ats': 'ats'
            };
            
            if (styleMap[template.design.style]) {
                window.designEditor.settings.template = styleMap[template.design.style];
            }
            
            window.designEditor.applySettings();
            window.designEditor.saveSettings();
        }
        
        // Store for later use
        localStorage.setItem('selected_industry_template', templateKey);
        
        this.showNotification(`Branchenvorlage "${template.name}" aktiviert`, 'success');
    }
    
    updatePromptBuilder(template) {
        // This will be used by the cover letter editor when building prompts
        if (window.coverLetterEditor) {
            window.coverLetterEditor.industryTemplate = template;
        }
    }
    
    getPromptModifiers() {
        if (!this.currentTemplate) return '';
        const template = this.templates[this.currentTemplate];
        return template?.promptModifiers || '';
    }
    
    getSamplePhrases() {
        if (!this.currentTemplate) return [];
        const template = this.templates[this.currentTemplate];
        return template?.samplePhrases || [];
    }
    
    getKeywords() {
        if (!this.currentTemplate) return [];
        const template = this.templates[this.currentTemplate];
        return template?.keywords || [];
    }
    
    loadSavedTemplate() {
        const saved = localStorage.getItem('selected_industry_template');
        if (saved && this.templates[saved]) {
            this.currentTemplate = saved;
            
            // Update selector if present
            const select = document.getElementById('industryTemplateSelect');
            if (select) {
                select.value = saved;
                this.showTemplatePreview(saved);
            }
            
            // Update resume buttons
            const activeBtn = document.querySelector(`.template-quick-btn[data-template="${saved}"]`);
            if (activeBtn) {
                activeBtn.classList.add('active');
            }
        }
    }
    
    showNotification(message, type = 'info') {
        if (typeof showNotification === 'function') {
            showNotification(message, type);
        } else if (window.coverLetterEditor?.showToast) {
            window.coverLetterEditor.showToast(message, type);
        } else {
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
    }
}

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.cover-letter-editor') || document.getElementById('resumeForm')) {
        window.industryTemplates = new IndustryTemplates();
    }
});
