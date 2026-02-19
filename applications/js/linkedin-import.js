/**
 * ═══════════════════════════════════════════════════════════════════════════
 * LINKEDIN/XING IMPORT
 * Import profile data from LinkedIn JSON export or manual input
 * ═══════════════════════════════════════════════════════════════════════════
 */

class LinkedInImporter {
    constructor() {
        this.importedData = null;
        this.init();
    }
    
    init() {
        this.createImportTab();
        this.setupEventListeners();
        console.log('📥 LinkedIn Importer initialized');
    }
    
    createImportTab() {
        // Find existing tabs container
        const tabsContainer = document.querySelector('.resume-tabs');
        if (!tabsContainer) return;
        
        // Add new tab button if not exists
        if (!document.querySelector('[data-tab="linkedin"]')) {
            const linkedInTab = document.createElement('button');
            linkedInTab.className = 'resume-tab';
            linkedInTab.dataset.tab = 'linkedin';
            linkedInTab.innerHTML = '<i class="fab fa-linkedin"></i> LinkedIn Import';
            tabsContainer.appendChild(linkedInTab);
            
            // Create tab content
            this.createTabContent();
            
            // Add click handler
            linkedInTab.addEventListener('click', () => {
                this.activateTab('linkedin');
            });
        }
    }
    
    createTabContent() {
        const mainContainer = document.querySelector('.resume-editor-container') || 
                             document.querySelector('main');
        if (!mainContainer) return;
        
        // Check if content already exists
        if (document.getElementById('linkedinTab')) return;
        
        const tabContent = document.createElement('div');
        tabContent.id = 'linkedinTab';
        tabContent.className = 'resume-tab-content';
        tabContent.innerHTML = `
            <div class="linkedin-import-section">
                <h2><i class="fab fa-linkedin"></i> LinkedIn Profil importieren</h2>
                <p class="import-description">
                    Importieren Sie Ihr LinkedIn-Profil, um Ihren Lebenslauf automatisch auszufüllen. 
                    Sie haben zwei Möglichkeiten:
                </p>
                
                <div class="import-options">
                    <!-- Option 1: JSON Upload -->
                    <div class="import-option">
                        <div class="import-option-header">
                            <span class="import-option-number">1</span>
                            <h3>LinkedIn Data Export (empfohlen)</h3>
                        </div>
                        <p>Laden Sie Ihre Daten direkt von LinkedIn herunter:</p>
                        <ol class="import-steps">
                            <li>Öffnen Sie <a href="https://www.linkedin.com/mypreferences/d/download-my-data" target="_blank" rel="noopener">LinkedIn Datenexport</a></li>
                            <li>Wählen Sie "Profil" und "Verbindungen" aus</li>
                            <li>Fordern Sie den Download an (dauert ca. 24h)</li>
                            <li>Laden Sie die ZIP-Datei hier hoch</li>
                        </ol>
                        
                        <div class="linkedin-upload-area" id="linkedinUploadArea">
                            <input type="file" id="linkedinFileInput" accept=".zip,.json" style="display: none;">
                            <div class="upload-dropzone" onclick="document.getElementById('linkedinFileInput').click()">
                                <i class="fas fa-cloud-upload-alt"></i>
                                <p>ZIP oder JSON-Datei hier ablegen oder klicken</p>
                                <span class="upload-hint">LinkedIn Export (Profile.csv) oder JSON</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Option 2: Manual URL -->
                    <div class="import-option">
                        <div class="import-option-header">
                            <span class="import-option-number">2</span>
                            <h3>Öffentliches Profil verlinken</h3>
                        </div>
                        <p>Geben Sie die URL Ihres öffentlichen LinkedIn-Profils ein:</p>
                        
                        <div class="linkedin-url-input">
                            <div class="url-input-wrapper">
                                <i class="fab fa-linkedin"></i>
                                <input type="url" id="linkedinUrl" placeholder="https://www.linkedin.com/in/ihr-profil">
                            </div>
                            <button type="button" class="btn-primary" id="fetchLinkedInBtn">
                                <i class="fas fa-download"></i> Profil abrufen
                            </button>
                        </div>
                        <p class="import-note">
                            <i class="fas fa-info-circle"></i> 
                            Nur öffentlich sichtbare Daten können importiert werden.
                        </p>
                    </div>
                    
                    <!-- Option 3: XING -->
                    <div class="import-option xing-option">
                        <div class="import-option-header">
                            <span class="import-option-number">3</span>
                            <h3>XING Profil importieren</h3>
                        </div>
                        <p>XING Export als JSON oder XML:</p>
                        
                        <div class="xing-upload-area">
                            <input type="file" id="xingFileInput" accept=".json,.xml" style="display: none;">
                            <button type="button" class="btn-secondary" onclick="document.getElementById('xingFileInput').click()">
                                <i class="fas fa-file-upload"></i> XING-Datei hochladen
                            </button>
                        </div>
                    </div>
                </div>
                
                <!-- Import Preview -->
                <div id="linkedinPreview" class="linkedin-preview" style="display: none;">
                    <h3><i class="fas fa-check-circle"></i> Import-Vorschau</h3>
                    <div class="preview-grid">
                        <div class="preview-section">
                            <h4>Persönliche Daten</h4>
                            <div id="previewPersonal"></div>
                        </div>
                        <div class="preview-section">
                            <h4>Berufserfahrung</h4>
                            <div id="previewExperience"></div>
                        </div>
                        <div class="preview-section">
                            <h4>Ausbildung</h4>
                            <div id="previewEducation"></div>
                        </div>
                        <div class="preview-section">
                            <h4>Fähigkeiten</h4>
                            <div id="previewSkills"></div>
                        </div>
                    </div>
                    <div class="preview-actions">
                        <button type="button" class="btn-secondary" id="cancelImportBtn">
                            <i class="fas fa-times"></i> Verwerfen
                        </button>
                        <button type="button" class="btn-primary" id="applyImportBtn">
                            <i class="fas fa-check"></i> Daten übernehmen
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Insert after existing tab contents
        const uploadTab = document.getElementById('uploadTab');
        if (uploadTab) {
            uploadTab.after(tabContent);
        } else {
            mainContainer.appendChild(tabContent);
        }
    }
    
    setupEventListeners() {
        // File upload for LinkedIn
        document.addEventListener('change', (e) => {
            if (e.target.id === 'linkedinFileInput') {
                this.handleFileUpload(e.target.files[0], 'linkedin');
            } else if (e.target.id === 'xingFileInput') {
                this.handleFileUpload(e.target.files[0], 'xing');
            }
        });
        
        // Fetch from URL
        document.addEventListener('click', (e) => {
            if (e.target.id === 'fetchLinkedInBtn' || e.target.closest('#fetchLinkedInBtn')) {
                this.fetchFromUrl();
            } else if (e.target.id === 'applyImportBtn' || e.target.closest('#applyImportBtn')) {
                this.applyImportedData();
            } else if (e.target.id === 'cancelImportBtn' || e.target.closest('#cancelImportBtn')) {
                this.cancelImport();
            }
        });
        
        // Drag and drop
        const uploadArea = document.getElementById('linkedinUploadArea');
        if (uploadArea) {
            uploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadArea.classList.add('dragover');
            });
            
            uploadArea.addEventListener('dragleave', () => {
                uploadArea.classList.remove('dragover');
            });
            
            uploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadArea.classList.remove('dragover');
                const file = e.dataTransfer.files[0];
                if (file) {
                    this.handleFileUpload(file, 'linkedin');
                }
            });
        }
    }
    
    activateTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.resume-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });
        
        // Update tab contents
        document.querySelectorAll('.resume-tab-content').forEach(content => {
            content.classList.remove('active');
        });
        
        const targetContent = document.getElementById(`${tabName}Tab`);
        if (targetContent) {
            targetContent.classList.add('active');
        }
    }
    
    async handleFileUpload(file, source) {
        if (!file) return;
        
        this.showLoading('Datei wird verarbeitet...');
        
        try {
            let data;
            
            if (file.name.endsWith('.zip')) {
                data = await this.processZipFile(file);
            } else if (file.name.endsWith('.json')) {
                const text = await file.text();
                data = JSON.parse(text);
            } else if (file.name.endsWith('.csv')) {
                const text = await file.text();
                data = this.parseCSV(text, source);
            } else {
                throw new Error('Nicht unterstütztes Dateiformat');
            }
            
            this.importedData = this.normalizeData(data, source);
            this.showPreview();
            
        } catch (error) {
            console.error('Import error:', error);
            this.showNotification('Fehler beim Import: ' + error.message, 'error');
        } finally {
            this.hideLoading();
        }
    }
    
    async processZipFile(file) {
        // Use JSZip if available, otherwise try to find Profile.csv
        if (typeof JSZip !== 'undefined') {
            const zip = await JSZip.loadAsync(file);
            
            // Look for Profile.csv in LinkedIn export
            const profileFile = zip.file('Profile.csv') || 
                               zip.file(/Profile/i)[0];
            
            if (profileFile) {
                const content = await profileFile.async('string');
                return this.parseCSV(content, 'linkedin');
            }
            
            // Look for positions.csv
            const positionsFile = zip.file('Positions.csv');
            if (positionsFile) {
                const content = await positionsFile.async('string');
                return { experience: this.parseCSV(content, 'linkedin-positions') };
            }
            
            throw new Error('Keine Profildaten in der ZIP-Datei gefunden');
        } else {
            throw new Error('JSZip nicht verfügbar. Bitte laden Sie die entpackte CSV-Datei hoch.');
        }
    }
    
    parseCSV(csvText, source) {
        const lines = csvText.split('\n');
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        const data = {};
        
        if (source === 'linkedin') {
            // LinkedIn Profile.csv format
            lines.slice(1).forEach(line => {
                const values = this.parseCSVLine(line);
                if (values.length >= 2) {
                    const key = values[0].replace(/"/g, '').trim();
                    const value = values[1].replace(/"/g, '').trim();
                    data[key] = value;
                }
            });
        } else if (source === 'linkedin-positions') {
            // LinkedIn Positions.csv format
            data.experience = lines.slice(1).map(line => {
                const values = this.parseCSVLine(line);
                return {
                    company: values[0] || '',
                    position: values[1] || '',
                    description: values[2] || '',
                    location: values[3] || '',
                    startDate: values[4] || '',
                    endDate: values[5] || ''
                };
            }).filter(exp => exp.company || exp.position);
        }
        
        return data;
    }
    
    parseCSVLine(line) {
        const values = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                values.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        values.push(current.trim());
        
        return values;
    }
    
    async fetchFromUrl() {
        const urlInput = document.getElementById('linkedinUrl');
        const url = urlInput?.value.trim();
        
        if (!url) {
            this.showNotification('Bitte geben Sie eine LinkedIn-URL ein', 'error');
            return;
        }
        
        if (!url.includes('linkedin.com/in/')) {
            this.showNotification('Ungültige LinkedIn-Profil-URL', 'error');
            return;
        }
        
        this.showLoading('Profil wird abgerufen...');
        
        try {
            // Use API proxy to avoid CORS
            const apiUrl = window.getApiUrl ? window.getApiUrl('LINKEDIN_SCRAPE') : (window.AWS_APP_CONFIG?.API_BASE ? window.AWS_APP_CONFIG.API_BASE + '/linkedin-scrape' : '');
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url })
            });
            
            if (!response.ok) {
                throw new Error('Profil konnte nicht abgerufen werden');
            }
            
            const data = await response.json();
            this.importedData = this.normalizeData(data, 'linkedin-scrape');
            this.showPreview();
            
        } catch (error) {
            console.error('Fetch error:', error);
            this.showNotification(
                'Öffentliches Profil konnte nicht abgerufen werden. ' +
                'Bitte verwenden Sie den LinkedIn Data Export.',
                'error'
            );
        } finally {
            this.hideLoading();
        }
    }
    
    normalizeData(rawData, source) {
        // Convert various formats to our standard structure
        const normalized = {
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            location: '',
            title: '',
            summary: '',
            linkedin: '',
            experience: [],
            education: [],
            skills: [],
            languages: []
        };
        
        if (source === 'linkedin') {
            // LinkedIn CSV export format
            normalized.firstName = rawData['First Name'] || '';
            normalized.lastName = rawData['Last Name'] || '';
            normalized.email = rawData['Email Address'] || '';
            normalized.location = rawData['Geo Location'] || rawData['Location'] || '';
            normalized.title = rawData['Headline'] || '';
            normalized.summary = rawData['Summary'] || '';
            normalized.linkedin = rawData['Profile URL'] || '';
        } else if (source === 'linkedin-scrape') {
            // Scraped public profile
            Object.assign(normalized, rawData);
        } else if (source === 'xing') {
            // XING export
            normalized.firstName = rawData.first_name || rawData.vorname || '';
            normalized.lastName = rawData.last_name || rawData.nachname || '';
            normalized.email = rawData.email || '';
            normalized.location = rawData.city || rawData.ort || '';
            normalized.title = rawData.job_title || rawData.berufsbezeichnung || '';
            normalized.summary = rawData.about_me || rawData.über_mich || '';
            
            if (rawData.work_experience || rawData.berufserfahrung) {
                normalized.experience = (rawData.work_experience || rawData.berufserfahrung).map(exp => ({
                    position: exp.title || exp.position || '',
                    company: exp.company || exp.unternehmen || '',
                    startDate: exp.begin_date || exp.von || '',
                    endDate: exp.end_date || exp.bis || '',
                    description: exp.description || exp.beschreibung || ''
                }));
            }
        }
        
        // Process experience if available
        if (rawData.experience && Array.isArray(rawData.experience)) {
            normalized.experience = rawData.experience.map(exp => ({
                position: exp.position || exp.title || '',
                company: exp.company || exp.companyName || '',
                location: exp.location || '',
                startDate: this.formatDate(exp.startDate || exp.start || ''),
                endDate: this.formatDate(exp.endDate || exp.end || ''),
                description: exp.description || ''
            }));
        }
        
        // Process education
        if (rawData.education && Array.isArray(rawData.education)) {
            normalized.education = rawData.education.map(edu => ({
                degree: edu.degree || edu.degreeName || '',
                fieldOfStudy: edu.fieldOfStudy || edu.field || '',
                institution: edu.schoolName || edu.institution || '',
                startDate: this.formatDate(edu.startDate || ''),
                endDate: this.formatDate(edu.endDate || '')
            }));
        }
        
        // Process skills
        if (rawData.skills) {
            if (Array.isArray(rawData.skills)) {
                normalized.skills = rawData.skills.map(s => 
                    typeof s === 'string' ? s : (s.name || s.skill || '')
                ).filter(Boolean);
            }
        }
        
        return normalized;
    }
    
    formatDate(dateStr) {
        if (!dateStr) return '';
        
        // Try to parse various date formats
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
            return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        }
        
        // Return as-is if parsing fails
        return dateStr;
    }
    
    showPreview() {
        const preview = document.getElementById('linkedinPreview');
        if (!preview || !this.importedData) return;
        
        const data = this.importedData;
        
        // Personal data
        const personalEl = document.getElementById('previewPersonal');
        if (personalEl) {
            personalEl.innerHTML = `
                <p><strong>Name:</strong> ${data.firstName} ${data.lastName}</p>
                <p><strong>E-Mail:</strong> ${data.email || '-'}</p>
                <p><strong>Standort:</strong> ${data.location || '-'}</p>
                <p><strong>Titel:</strong> ${data.title || '-'}</p>
            `;
        }
        
        // Experience
        const expEl = document.getElementById('previewExperience');
        if (expEl) {
            if (data.experience.length) {
                expEl.innerHTML = data.experience.slice(0, 3).map(exp => `
                    <div class="preview-item">
                        <strong>${exp.position}</strong>
                        <span>${exp.company}</span>
                        <small>${exp.startDate} - ${exp.endDate || 'heute'}</small>
                    </div>
                `).join('');
                if (data.experience.length > 3) {
                    expEl.innerHTML += `<p class="preview-more">+${data.experience.length - 3} weitere</p>`;
                }
            } else {
                expEl.innerHTML = '<p class="preview-empty">Keine Daten</p>';
            }
        }
        
        // Education
        const eduEl = document.getElementById('previewEducation');
        if (eduEl) {
            if (data.education.length) {
                eduEl.innerHTML = data.education.slice(0, 2).map(edu => `
                    <div class="preview-item">
                        <strong>${edu.degree}</strong>
                        <span>${edu.institution}</span>
                    </div>
                `).join('');
            } else {
                eduEl.innerHTML = '<p class="preview-empty">Keine Daten</p>';
            }
        }
        
        // Skills
        const skillsEl = document.getElementById('previewSkills');
        if (skillsEl) {
            if (data.skills.length) {
                skillsEl.innerHTML = `
                    <div class="preview-skills">
                        ${data.skills.slice(0, 10).map(s => `<span class="skill-tag">${s}</span>`).join('')}
                        ${data.skills.length > 10 ? `<span class="skill-more">+${data.skills.length - 10}</span>` : ''}
                    </div>
                `;
            } else {
                skillsEl.innerHTML = '<p class="preview-empty">Keine Daten</p>';
            }
        }
        
        preview.style.display = 'block';
        preview.scrollIntoView({ behavior: 'smooth' });
    }
    
    applyImportedData() {
        if (!this.importedData) return;
        
        const data = this.importedData;
        
        // Fill personal fields
        this.setFieldValue('firstName', data.firstName);
        this.setFieldValue('lastName', data.lastName);
        this.setFieldValue('email', data.email);
        this.setFieldValue('location', data.location);
        this.setFieldValue('title', data.title);
        this.setFieldValue('summary', data.summary);
        this.setFieldValue('linkedin', data.linkedin);
        
        // Add experience entries
        if (data.experience.length && typeof addExperience === 'function') {
            // Clear existing
            const expContainer = document.getElementById('experienceContainer');
            if (expContainer) expContainer.innerHTML = '';
            
            data.experience.forEach((exp, index) => {
                setTimeout(() => {
                    addExperience({
                        position: exp.position,
                        company: exp.company,
                        location: exp.location,
                        startDate: exp.startDate,
                        endDate: exp.endDate,
                        description: exp.description,
                        currentJob: !exp.endDate
                    });
                }, index * 50);
            });
        }
        
        // Add education entries
        if (data.education.length && typeof addEducation === 'function') {
            const eduContainer = document.getElementById('educationContainer');
            if (eduContainer) eduContainer.innerHTML = '';
            
            data.education.forEach((edu, index) => {
                setTimeout(() => {
                    addEducation({
                        degree: edu.degree,
                        fieldOfStudy: edu.fieldOfStudy,
                        institution: edu.institution,
                        startDate: edu.startDate,
                        endDate: edu.endDate
                    });
                }, index * 50);
            });
        }
        
        // Add skills
        if (data.skills.length && typeof addTechnicalSkillCategory === 'function') {
            const skillsContainer = document.getElementById('technicalSkillsContainer');
            if (skillsContainer) skillsContainer.innerHTML = '';
            
            addTechnicalSkillCategory('Importierte Skills', data.skills);
        }
        
        // Switch to manual tab
        this.activateTab('manual');
        
        // Hide preview
        const preview = document.getElementById('linkedinPreview');
        if (preview) preview.style.display = 'none';
        
        this.showNotification('✅ Daten erfolgreich importiert!', 'success');
        this.importedData = null;
    }
    
    cancelImport() {
        this.importedData = null;
        const preview = document.getElementById('linkedinPreview');
        if (preview) preview.style.display = 'none';
    }
    
    setFieldValue(fieldId, value) {
        const field = document.getElementById(fieldId);
        if (field && value) {
            field.value = value;
            field.dispatchEvent(new Event('input', { bubbles: true }));
        }
    }
    
    showLoading(message) {
        // Create or show loading overlay
        let loading = document.getElementById('linkedinLoading');
        if (!loading) {
            loading = document.createElement('div');
            loading.id = 'linkedinLoading';
            loading.className = 'linkedin-loading';
            loading.innerHTML = `
                <div class="loading-content">
                    <i class="fas fa-spinner fa-spin"></i>
                    <span>${message}</span>
                </div>
            `;
            document.body.appendChild(loading);
        } else {
            loading.querySelector('span').textContent = message;
            loading.style.display = 'flex';
        }
    }
    
    hideLoading() {
        const loading = document.getElementById('linkedinLoading');
        if (loading) loading.style.display = 'none';
    }
    
    showNotification(message, type = 'info') {
        if (typeof showNotification === 'function') {
            showNotification(message, type);
        } else {
            alert(message);
        }
    }
}

// Auto-initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('resumeForm')) {
        window.linkedInImporter = new LinkedInImporter();
    }
});
