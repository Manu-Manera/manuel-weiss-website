// Resume Editor JavaScript

let resumeData = {
    personalInfo: {},
    sections: [],
    skills: [],
    languages: []
};

// Tab Switching
document.querySelectorAll('.resume-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        const targetTab = tab.dataset.tab;
        
        // Update tabs
        document.querySelectorAll('.resume-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // Update content
        document.querySelectorAll('.resume-tab-content').forEach(c => c.classList.remove('active'));
        document.getElementById(`${targetTab}Tab`).classList.add('active');
    });
});

// Load existing resume and profile data
async function loadResume() {
    try {
        const token = await getAuthToken();
        if (!token) {
            // Lade Profildaten auch ohne Login (für Vorausfüllung)
            await loadProfileData();
            return;
        }

        // Lade Lebenslauf
        const resumeResponse = await fetch('https://of2iwj7h2c.execute-api.eu-central-1.amazonaws.com/prod/resume', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (resumeResponse.ok) {
            const data = await resumeResponse.json();
            resumeData = data;
            populateForm(data);
            showNotification('Lebenslauf geladen', 'success');
        } else if (resumeResponse.status === 404) {
            // Kein Lebenslauf vorhanden - lade Profildaten für Vorausfüllung
            await loadProfileData();
        } else {
            throw new Error('Fehler beim Laden');
        }
    } catch (error) {
        console.error('Error loading resume:', error);
        // Versuche trotzdem Profildaten zu laden
        await loadProfileData();
    }
}

// Load profile data for pre-filling
async function loadProfileData() {
    try {
        const token = await getAuthToken();
        if (!token) return;

        const response = await fetch('https://of2iwj7h2c.execute-api.eu-central-1.amazonaws.com/prod/profile', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const profile = await response.json();
            
            // Fülle Formular mit Profildaten vor
            if (profile.firstName) document.getElementById('firstName').value = profile.firstName;
            if (profile.lastName) document.getElementById('lastName').value = profile.lastName;
            if (profile.email) document.getElementById('email').value = profile.email;
            if (profile.phone) document.getElementById('phone').value = profile.phone;
            if (profile.location) document.getElementById('address').value = profile.location;
            
            // LinkedIn und Website aus preferences oder settings
            if (profile.preferences?.linkedin) document.getElementById('linkedin').value = profile.preferences.linkedin;
            if (profile.preferences?.website) document.getElementById('website').value = profile.preferences.website;
            
            console.log('✅ Profildaten für Vorausfüllung geladen');
        }
    } catch (error) {
        console.error('Error loading profile data:', error);
    }
}

// Auto-save on field change with debounce
let saveTimeout = null;
const formFields = ['firstName', 'lastName', 'email', 'phone', 'address', 'linkedin', 'website'];

formFields.forEach(fieldId => {
    const field = document.getElementById(fieldId);
    if (field) {
        field.addEventListener('input', () => {
            clearTimeout(saveTimeout);
            saveTimeout = setTimeout(() => {
                saveField(fieldId, field.value);
            }, 2000); // 2 Sekunden nach letzter Änderung
        });
    }
});

// Save single field
async function saveField(fieldName, value) {
    try {
        const token = await getAuthToken();
        if (!token) return;

        const response = await fetch(`https://of2iwj7h2c.execute-api.eu-central-1.amazonaws.com/prod/resume/personal-info/${fieldName}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ value })
        });

        if (response.ok) {
            console.log(`✅ Feld ${fieldName} gespeichert`);
        } else {
            console.error(`❌ Fehler beim Speichern von ${fieldName}`);
        }
    } catch (error) {
        console.error(`Error saving field ${fieldName}:`, error);
    }
}

// Save resume (full save)
document.getElementById('resumeForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    try {
        const formData = collectFormData();
        
        const response = await fetch('https://of2iwj7h2c.execute-api.eu-central-1.amazonaws.com/prod/resume', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${await getAuthToken()}`
            },
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            showNotification('Lebenslauf gespeichert', 'success');
        } else {
            throw new Error('Fehler beim Speichern');
        }
    } catch (error) {
        console.error('Error saving resume:', error);
        showNotification('Fehler beim Speichern', 'error');
    }
});

// PDF Upload
document.getElementById('pdfFileInput').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.type !== 'application/pdf') {
        showNotification('Nur PDF-Dateien erlaubt', 'error');
        return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
        showNotification('Datei zu groß (max. 10MB)', 'error');
        return;
    }
    
    await uploadAndProcessPDF(file);
});

// Upload and process PDF
async function uploadAndProcessPDF(file) {
    try {
        // 1. Get upload URL
        const uploadUrlResponse = await fetch('https://of2iwj7h2c.execute-api.eu-central-1.amazonaws.com/prod/resume/upload-url', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${await getAuthToken()}`
            },
            body: JSON.stringify({
                fileName: file.name,
                contentType: file.type
            })
        });
        
        if (!uploadUrlResponse.ok) {
            throw new Error('Fehler beim Erstellen der Upload-URL');
        }
        
        const uploadData = await uploadUrlResponse.json();
        
        // Prüfe ob Upload-URL verfügbar ist
        if (!uploadData.uploadUrl) {
            showNotification('S3-Bucket nicht konfiguriert. Bitte kontaktieren Sie den Administrator.', 'error');
            return;
        }
        
        const { uploadUrl, s3Key } = uploadData;
        
        // 2. Upload to S3
        document.getElementById('uploadProgress').style.display = 'block';
        updateProgress(0, 'Upload läuft...');
        
        const uploadResponse = await fetch(uploadUrl, {
            method: 'PUT',
            body: file,
            headers: {
                'Content-Type': file.type
            }
        });
        
        if (!uploadResponse.ok) {
            throw new Error('Upload fehlgeschlagen');
        }
        
        updateProgress(50, 'OCR-Verarbeitung läuft...');
        
        // 3. Start OCR processing
        updateProgress(50, 'OCR-Verarbeitung läuft...');
        
        const ocrResponse = await fetch('https://of2iwj7h2c.execute-api.eu-central-1.amazonaws.com/prod/resume/ocr', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${await getAuthToken()}`
            },
            body: JSON.stringify({ s3Key })
        });
        
        if (!ocrResponse.ok) {
            const errorData = await ocrResponse.json();
            throw new Error(errorData.error || errorData.message || 'OCR processing failed');
        }
        
        const ocrResult = await ocrResponse.json();
        
        // Prüfe ob OCR erfolgreich war
        if (!ocrResult.success) {
            if (ocrResult.status === 'IN_PROGRESS') {
                showNotification('OCR-Verarbeitung läuft noch. Bitte später erneut versuchen.', 'info');
                updateProgress(75, 'OCR läuft im Hintergrund...');
                return;
            } else {
                throw new Error(ocrResult.message || 'OCR processing failed');
            }
        }
        
        updateProgress(100, 'Fertig!');
        
        // 4. Show OCR results
        showOCRResults(ocrResult, s3Key);
        
    } catch (error) {
        console.error('Error processing PDF:', error);
        showNotification('Fehler bei der PDF-Verarbeitung', 'error');
        document.getElementById('uploadProgress').style.display = 'none';
    }
}

// Show OCR results
function showOCRResults(ocrResult, s3Key) {
    document.getElementById('ocrRawText').textContent = ocrResult.rawText || '';
    
    const parsedHtml = `
        <div><strong>Name:</strong> ${ocrResult.parsedData?.name || '-'}</div>
        <div><strong>E-Mail:</strong> ${ocrResult.parsedData?.email || '-'}</div>
        <div><strong>Telefon:</strong> ${ocrResult.parsedData?.phone || '-'}</div>
        <div><strong>Adresse:</strong> ${ocrResult.parsedData?.address || '-'}</div>
        <div><strong>Sektionen gefunden:</strong> ${ocrResult.parsedData?.sections?.length || 0}</div>
    `;
    document.getElementById('ocrParsedData').innerHTML = parsedHtml;
    
    document.getElementById('ocrResults').style.display = 'block';
    document.getElementById('ocrResults').dataset.s3Key = s3Key;
    document.getElementById('ocrResults').dataset.ocrData = JSON.stringify(ocrResult);
}

// Apply OCR data to form
function applyOCRData() {
    const ocrData = JSON.parse(document.getElementById('ocrResults').dataset.ocrData);
    const parsed = ocrData.parsedData;
    
    // Fill personal info
    if (parsed.name) {
        const nameParts = parsed.name.split(' ');
        document.getElementById('firstName').value = nameParts[0] || '';
        document.getElementById('lastName').value = nameParts.slice(1).join(' ') || '';
    }
    if (parsed.email) document.getElementById('email').value = parsed.email;
    if (parsed.phone) document.getElementById('phone').value = parsed.phone;
    if (parsed.address) document.getElementById('address').value = parsed.address;
    
    // Switch to manual tab
    document.querySelector('[data-tab="manual"]').click();
    
    showNotification('OCR-Daten übernommen. Bitte prüfen und ergänzen Sie die Daten.', 'success');
}

// Helper functions
function collectFormData() {
    return {
        personalInfo: {
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            title: document.getElementById('title').value,
            summary: document.getElementById('summary').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            location: document.getElementById('location').value,
            address: document.getElementById('address').value,
            linkedin: document.getElementById('linkedin').value,
            github: document.getElementById('github').value,
            website: document.getElementById('website').value,
            availability: document.getElementById('availability').value,
            workModel: document.getElementById('workModel').value
        },
        sections: collectSections(),
        skills: collectSkills(),
        languages: collectLanguages(),
        projects: collectProjects()
    };
}

function collectSkills() {
    const technicalSkills = [];
    const softSkills = [];
    
    // Collect technical skills by category
    document.querySelectorAll('.skill-category-item').forEach(item => {
        const category = item.querySelector('.skill-category-name input')?.value || '';
        const skills = Array.from(item.querySelectorAll('.skill-tag input'))
            .map(input => input.value.trim())
            .filter(s => s);
        
        if (category && skills.length > 0) {
            technicalSkills.push({
                category: category,
                skills: skills
            });
        }
    });
    
    // Collect soft skills
    document.querySelectorAll('.soft-skill-item').forEach(item => {
        const skillName = item.querySelector('input[type="text"]')?.value || '';
        const examples = item.querySelector('textarea')?.value.split('\n').filter(e => e.trim()) || [];
        
        if (skillName) {
            softSkills.push({
                skill: skillName,
                examples: examples
            });
        }
    });
    
    return {
        technicalSkills: technicalSkills,
        softSkills: softSkills
    };
}

function collectProjects() {
    const projects = [];
    
    document.querySelectorAll('.project-item').forEach(item => {
        const project = {
            name: item.querySelector('[data-field="name"]')?.value || '',
            description: item.querySelector('[data-field="description"]')?.value || '',
            role: item.querySelector('[data-field="role"]')?.value || '',
            startDate: item.querySelector('[data-field="startDate"]')?.value || '',
            endDate: item.querySelector('[data-field="endDate"]')?.value || '',
            technologies: Array.from(item.querySelectorAll('.tech-tag input'))
                .map(input => input.value.trim())
                .filter(t => t),
            githubUrl: item.querySelector('[data-field="githubUrl"]')?.value || '',
            url: item.querySelector('[data-field="url"]')?.value || '',
            achievements: Array.from(item.querySelectorAll('.achievement-item input'))
                .map(input => input.value.trim())
                .filter(a => a),
            metrics: Array.from(item.querySelectorAll('.metric-item input'))
                .map(input => input.value.trim())
                .filter(m => m)
        };
        
        if (project.name) {
            projects.push(project);
        }
    });
    
    return projects;
}

function collectSections() {
    const sections = [];
    
    // Collect Experience
    const experienceEntries = [];
    document.querySelectorAll('.experience-item').forEach(item => {
        const entry = {
            position: item.querySelector('[data-field="position"]')?.value || '',
            company: item.querySelector('[data-field="company"]')?.value || '',
            location: item.querySelector('[data-field="location"]')?.value || '',
            employmentType: item.querySelector('[data-field="employmentType"]')?.value || '',
            startDate: item.querySelector('[data-field="startDate"]')?.value || '',
            endDate: item.querySelector('[data-field="endDate"]')?.value || '',
            currentJob: item.querySelector('[data-field="currentJob"]')?.checked || false,
            description: item.querySelector('[data-field="description"]')?.value || '',
            achievements: Array.from(item.querySelectorAll('.achievement-item input'))
                .map(input => input.value.trim())
                .filter(a => a),
            technologies: Array.from(item.querySelectorAll('.tech-tag input'))
                .map(input => input.value.trim())
                .filter(t => t)
        };
        
        if (entry.position && entry.company) {
            experienceEntries.push(entry);
        }
    });
    
    if (experienceEntries.length > 0) {
        sections.push({
            type: 'experience',
            entries: experienceEntries
        });
    }
    
    // Collect Education
    const educationEntries = [];
    document.querySelectorAll('.education-item').forEach(item => {
        const entry = {
            degree: item.querySelector('[data-field="degree"]')?.value || '',
            fieldOfStudy: item.querySelector('[data-field="fieldOfStudy"]')?.value || '',
            institution: item.querySelector('[data-field="institution"]')?.value || '',
            location: item.querySelector('[data-field="location"]')?.value || '',
            startDate: item.querySelector('[data-field="startDate"]')?.value || '',
            endDate: item.querySelector('[data-field="endDate"]')?.value || '',
            grade: item.querySelector('[data-field="grade"]')?.value || '',
            honors: item.querySelector('[data-field="honors"]')?.value || '',
            description: item.querySelector('[data-field="description"]')?.value || ''
        };
        
        if (entry.degree && entry.institution) {
            educationEntries.push(entry);
        }
    });
    
    if (educationEntries.length > 0) {
        sections.push({
            type: 'education',
            entries: educationEntries
        });
    }
    
    return sections;
}

function collectLanguages() {
    const languages = [];
    
    document.querySelectorAll('.language-item').forEach(item => {
        const language = {
            language: item.querySelector('[data-field="language"]')?.value || '',
            proficiency: item.querySelector('[data-field="proficiency"]')?.value || '',
            certificate: item.querySelector('[data-field="certificate"]')?.value || ''
        };
        
        if (language.language && language.proficiency) {
            languages.push(language);
        }
    });
    
    return languages;
}

function populateForm(data) {
    if (data.personalInfo) {
        document.getElementById('firstName').value = data.personalInfo.firstName || '';
        document.getElementById('lastName').value = data.personalInfo.lastName || '';
        document.getElementById('title').value = data.personalInfo.title || '';
        document.getElementById('summary').value = data.personalInfo.summary || '';
        document.getElementById('email').value = data.personalInfo.email || '';
        document.getElementById('phone').value = data.personalInfo.phone || '';
        document.getElementById('location').value = data.personalInfo.location || '';
        document.getElementById('address').value = data.personalInfo.address || '';
        document.getElementById('linkedin').value = data.personalInfo.linkedin || '';
        document.getElementById('github').value = data.personalInfo.github || '';
        document.getElementById('website').value = data.personalInfo.website || '';
        document.getElementById('availability').value = data.personalInfo.availability || '';
        document.getElementById('workModel').value = data.personalInfo.workModel || '';
    }
    
    // Populate Experience
    if (data.sections) {
        const experienceSection = data.sections.find(s => s.type === 'experience');
        if (experienceSection && experienceSection.entries) {
            experienceSection.entries.forEach(entry => {
                addExperience(entry);
            });
        }
        
        const educationSection = data.sections.find(s => s.type === 'education');
        if (educationSection && educationSection.entries) {
            educationSection.entries.forEach(entry => {
                addEducation(entry);
            });
        }
    }
    
    // Populate Languages
    if (data.languages && Array.isArray(data.languages)) {
        data.languages.forEach(lang => {
            addLanguage(lang);
        });
    }
    
    // Populate Skills
    if (data.skills) {
        if (data.skills.technicalSkills && Array.isArray(data.skills.technicalSkills)) {
            data.skills.technicalSkills.forEach(category => {
                addTechnicalSkillCategory(category.category || '', category.skills || []);
            });
        }
        
        if (data.skills.softSkills && Array.isArray(data.skills.softSkills)) {
            data.skills.softSkills.forEach(skill => {
                addSoftSkill(skill.skill || '', skill.examples || []);
            });
        }
    }
    
    // Populate Projects
    if (data.projects && Array.isArray(data.projects)) {
        data.projects.forEach(project => {
            addProject(project);
        });
    }
}

// Add Technical Skill Category
function addTechnicalSkillCategory(categoryName = '', skills = []) {
    const container = document.getElementById('technicalSkillsContainer');
    const categoryId = 'tech-category-' + Date.now();
    
    const categoryHtml = `
        <div class="skill-category-item" data-category-id="${categoryId}">
            <div class="skill-category-header">
                <input type="text" class="skill-category-name" placeholder="z.B. Programmiersprachen" value="${categoryName}" style="font-weight: 600; border: none; background: transparent; padding: 0;">
                <button type="button" class="btn-remove" onclick="removeTechnicalSkillCategory('${categoryId}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <div class="skill-tags" id="skills-${categoryId}">
                ${skills.length > 0 ? skills.map(skill => `
                    <span class="skill-tag">
                        <input type="text" value="${skill}" placeholder="Skill">
                        <button type="button" onclick="removeSkillTag(this)" style="background: none; border: none; color: white; cursor: pointer;">
                            <i class="fas fa-times"></i>
                        </button>
                    </span>
                `).join('') : ''}
                <button type="button" onclick="addSkillTag('${categoryId}')" style="background: rgba(59, 130, 246, 0.2); border: 1px dashed #3b82f6; color: #3b82f6; padding: 0.25rem 0.75rem; border-radius: 4px; cursor: pointer;">
                    <i class="fas fa-plus"></i> Skill
                </button>
            </div>
        </div>
    `;
    
    container.insertAdjacentHTML('beforeend', categoryHtml);
}

function addSkillTag(categoryId) {
    const container = document.getElementById(`skills-${categoryId}`);
    const tagHtml = `
        <span class="skill-tag">
            <input type="text" placeholder="Skill">
            <button type="button" onclick="removeSkillTag(this)" style="background: none; border: none; color: white; cursor: pointer;">
                <i class="fas fa-times"></i>
            </button>
        </span>
    `;
    container.insertAdjacentHTML('beforeend', tagHtml);
}

function removeSkillTag(button) {
    button.closest('.skill-tag').remove();
}

function removeTechnicalSkillCategory(categoryId) {
    document.querySelector(`[data-category-id="${categoryId}"]`).remove();
}

// Add Soft Skill
function addSoftSkill(skillName = '', examples = []) {
    const container = document.getElementById('softSkillsContainer');
    const skillId = 'soft-skill-' + Date.now();
    
    const skillHtml = `
        <div class="soft-skill-item" data-skill-id="${skillId}">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                <input type="text" placeholder="z.B. Kommunikation, Teamarbeit" value="${skillName}" style="flex: 1; margin-right: 0.5rem;">
                <button type="button" class="btn-remove" onclick="removeSoftSkill('${skillId}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <textarea placeholder="Konkrete Beispiele/Projekte, die dieses Skill belegen (eine pro Zeile)" rows="2" style="width: 100%; font-size: 0.875rem;">${examples.join('\n')}</textarea>
        </div>
    `;
    
    container.insertAdjacentHTML('beforeend', skillHtml);
}

function removeSoftSkill(skillId) {
    document.querySelector(`[data-skill-id="${skillId}"]`).remove();
}

// Add Project
function addProject(projectData = {}) {
    const container = document.getElementById('projectsContainer');
    const projectId = 'project-' + Date.now();
    
    const projectHtml = `
        <div class="project-item" data-project-id="${projectId}" style="background: #f9fafb; padding: 1.5rem; border-radius: 8px; margin-bottom: 1rem; border: 1px solid #e5e7eb;">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                <h4 style="margin: 0; color: #1f2937;">Projekt</h4>
                <button type="button" class="btn-remove" onclick="removeProject('${projectId}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <div class="form-grid" style="grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                <div class="form-group full-width">
                    <label>Projektname *</label>
                    <input type="text" data-field="name" value="${projectData.name || ''}" required>
                </div>
                <div class="form-group">
                    <label>Rolle</label>
                    <input type="text" data-field="role" value="${projectData.role || ''}" placeholder="z.B. Lead Developer">
                </div>
                <div class="form-group">
                    <label>Startdatum</label>
                    <input type="month" data-field="startDate" value="${projectData.startDate || ''}">
                </div>
                <div class="form-group">
                    <label>Enddatum</label>
                    <input type="month" data-field="endDate" value="${projectData.endDate || ''}">
                </div>
                <div class="form-group">
                    <label>GitHub Repository</label>
                    <input type="url" data-field="githubUrl" value="${projectData.githubUrl || ''}" placeholder="github.com/username/repo">
                </div>
                <div class="form-group">
                    <label>Projekt-URL</label>
                    <input type="url" data-field="url" value="${projectData.url || ''}" placeholder="www.example.com">
                </div>
            </div>
            <div class="form-group" style="margin-bottom: 1rem;">
                <label>Beschreibung *</label>
                <textarea data-field="description" rows="3" required>${projectData.description || ''}</textarea>
            </div>
            <div class="form-group" style="margin-bottom: 1rem;">
                <label>Technologien</label>
                <div class="tech-tags" id="tech-${projectId}">
                    ${projectData.technologies ? projectData.technologies.map(tech => `
                        <span class="tech-tag">
                            <input type="text" value="${tech}">
                            <button type="button" onclick="removeTechTag(this)" style="background: none; border: none; color: white; cursor: pointer;">
                                <i class="fas fa-times"></i>
                            </button>
                        </span>
                    `).join('') : ''}
                    <button type="button" onclick="addTechTag('${projectId}')" style="background: rgba(16, 185, 129, 0.2); border: 1px dashed #10b981; color: #10b981; padding: 0.25rem 0.75rem; border-radius: 4px; cursor: pointer;">
                        <i class="fas fa-plus"></i> Technologie
                    </button>
                </div>
            </div>
            <div class="form-group" style="margin-bottom: 1rem;">
                <label>Achievements (Erfolge)</label>
                <div id="achievements-${projectId}">
                    ${projectData.achievements ? projectData.achievements.map(achievement => `
                        <div class="achievement-item">
                            <input type="text" value="${achievement}" placeholder="z.B. User-Base um 200% gesteigert">
                            <button type="button" onclick="removeAchievement(this)" style="background: #ef4444; color: white; border: none; padding: 0.5rem; border-radius: 4px; cursor: pointer;">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    `).join('') : ''}
                    <button type="button" onclick="addAchievement('${projectId}')" class="btn-add" style="margin-top: 0.5rem;">
                        <i class="fas fa-plus"></i> Achievement
                    </button>
                </div>
            </div>
            <div class="form-group">
                <label>Metriken (Quantifizierbare Ergebnisse)</label>
                <div id="metrics-${projectId}">
                    ${projectData.metrics ? projectData.metrics.map(metric => `
                        <div class="metric-item">
                            <input type="text" value="${metric}" placeholder="z.B. Budget: €500k, Kunden: 200+">
                            <button type="button" onclick="removeMetric(this)" style="background: #ef4444; color: white; border: none; padding: 0.5rem; border-radius: 4px; cursor: pointer;">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    `).join('') : ''}
                    <button type="button" onclick="addMetric('${projectId}')" class="btn-add" style="margin-top: 0.5rem;">
                        <i class="fas fa-plus"></i> Metrik
                    </button>
                </div>
            </div>
        </div>
    `;
    
    container.insertAdjacentHTML('beforeend', projectHtml);
}

function removeProject(projectId) {
    document.querySelector(`[data-project-id="${projectId}"]`).remove();
}

function addTechTag(projectId) {
    const container = document.getElementById(`tech-${projectId}`);
    const tagHtml = `
        <span class="tech-tag">
            <input type="text" placeholder="z.B. React, Node.js">
            <button type="button" onclick="removeTechTag(this)" style="background: none; border: none; color: white; cursor: pointer;">
                <i class="fas fa-times"></i>
            </button>
        </span>
    `;
    container.insertAdjacentHTML('beforeend', tagHtml);
}

function removeTechTag(button) {
    button.closest('.tech-tag').remove();
}

function addAchievement(projectId) {
    const container = document.getElementById(`achievements-${projectId}`);
    const achievementHtml = `
        <div class="achievement-item">
            <input type="text" placeholder="z.B. User-Base um 200% gesteigert">
            <button type="button" onclick="removeAchievement(this)" style="background: #ef4444; color: white; border: none; padding: 0.5rem; border-radius: 4px; cursor: pointer;">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    container.insertAdjacentHTML('beforeend', achievementHtml);
}

function removeAchievement(button) {
    button.closest('.achievement-item').remove();
}

function addMetric(projectId) {
    const container = document.getElementById(`metrics-${projectId}`);
    const metricHtml = `
        <div class="metric-item">
            <input type="text" placeholder="z.B. Budget: €500k, Kunden: 200+">
            <button type="button" onclick="removeMetric(this)" style="background: #ef4444; color: white; border: none; padding: 0.5rem; border-radius: 4px; cursor: pointer;">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    container.insertAdjacentHTML('beforeend', metricHtml);
}

function removeMetric(button) {
    button.closest('.metric-item').remove();
}

// Add Experience Entry
function addExperience(experienceData = {}) {
    const container = document.getElementById('experienceContainer');
    if (!container) return;
    
    const experienceId = 'experience-' + Date.now();
    
    const experienceHtml = `
        <div class="experience-item" data-experience-id="${experienceId}" style="background: #f9fafb; padding: 1.5rem; border-radius: 8px; margin-bottom: 1rem; border: 1px solid #e5e7eb;">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                <h4 style="margin: 0; color: #1f2937;">Berufserfahrung</h4>
                <button type="button" class="btn-remove" onclick="removeExperience('${experienceId}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <div class="form-grid" style="grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                <div class="form-group">
                    <label>Position *</label>
                    <input type="text" data-field="position" value="${experienceData.position || ''}" placeholder="z.B. Senior Software Engineer" required>
                </div>
                <div class="form-group">
                    <label>Unternehmen *</label>
                    <input type="text" data-field="company" value="${experienceData.company || ''}" placeholder="z.B. Tech Corp GmbH" required>
                </div>
                <div class="form-group">
                    <label>Standort</label>
                    <input type="text" data-field="location" value="${experienceData.location || ''}" placeholder="z.B. München, Deutschland">
                </div>
                <div class="form-group">
                    <label>Beschäftigungsart</label>
                    <select data-field="employmentType" value="${experienceData.employmentType || ''}">
                        <option value="">Bitte wählen</option>
                        <option value="vollzeit" ${experienceData.employmentType === 'vollzeit' ? 'selected' : ''}>Vollzeit</option>
                        <option value="teilzeit" ${experienceData.employmentType === 'teilzeit' ? 'selected' : ''}>Teilzeit</option>
                        <option value="werkstudent" ${experienceData.employmentType === 'werkstudent' ? 'selected' : ''}>Werkstudent</option>
                        <option value="praktikum" ${experienceData.employmentType === 'praktikum' ? 'selected' : ''}>Praktikum</option>
                        <option value="freelance" ${experienceData.employmentType === 'freelance' ? 'selected' : ''}>Freelance</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Von *</label>
                    <input type="month" data-field="startDate" value="${experienceData.startDate || ''}" required>
                </div>
                <div class="form-group">
                    <label>Bis</label>
                    <input type="month" data-field="endDate" value="${experienceData.endDate || ''}" ${experienceData.currentJob ? 'disabled' : ''}>
                    <div style="margin-top: 0.5rem;">
                        <label style="display: flex; align-items: center; gap: 0.5rem; font-weight: normal; cursor: pointer;">
                            <input type="checkbox" data-field="currentJob" ${experienceData.currentJob ? 'checked' : ''} onchange="toggleEndDate('${experienceId}', this.checked)">
                            Aktuell
                        </label>
                    </div>
                </div>
            </div>
            <div class="form-group" style="margin-bottom: 1rem;">
                <label>Beschreibung</label>
                <textarea data-field="description" rows="3" placeholder="Beschreiben Sie Ihre Aufgaben und Erfolge...">${experienceData.description || ''}</textarea>
            </div>
            <div class="form-group" style="margin-bottom: 1rem;">
                <label>Achievements (Erfolge)</label>
                <div id="achievements-exp-${experienceId}">
                    ${experienceData.achievements ? experienceData.achievements.map(achievement => `
                        <div class="achievement-item">
                            <input type="text" value="${achievement}" placeholder="z.B. Team-Lead für 5 Entwickler">
                            <button type="button" onclick="removeAchievement(this)" style="background: #ef4444; color: white; border: none; padding: 0.5rem; border-radius: 4px; cursor: pointer;">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    `).join('') : ''}
                    <button type="button" onclick="addAchievement('exp-${experienceId}')" class="btn-add" style="margin-top: 0.5rem;">
                        <i class="fas fa-plus"></i> Achievement
                    </button>
                </div>
            </div>
            <div class="form-group">
                <label>Technologien</label>
                <div class="tech-tags" id="tech-exp-${experienceId}">
                    ${experienceData.technologies ? experienceData.technologies.map(tech => `
                        <span class="tech-tag">
                            <input type="text" value="${tech}">
                            <button type="button" onclick="removeTechTag(this)" style="background: none; border: none; color: white; cursor: pointer;">
                                <i class="fas fa-times"></i>
                            </button>
                        </span>
                    `).join('') : ''}
                    <button type="button" onclick="addTechTag('exp-${experienceId}')" style="background: rgba(16, 185, 129, 0.2); border: 1px dashed #10b981; color: #10b981; padding: 0.25rem 0.75rem; border-radius: 4px; cursor: pointer;">
                        <i class="fas fa-plus"></i> Technologie
                    </button>
                </div>
            </div>
        </div>
    `;
    
    container.insertAdjacentHTML('beforeend', experienceHtml);
}

function removeExperience(experienceId) {
    document.querySelector(`[data-experience-id="${experienceId}"]`).remove();
}

function toggleEndDate(experienceId, isCurrent) {
    const experienceItem = document.querySelector(`[data-experience-id="${experienceId}"]`);
    const endDateInput = experienceItem.querySelector('[data-field="endDate"]');
    if (isCurrent) {
        endDateInput.disabled = true;
        endDateInput.value = '';
    } else {
        endDateInput.disabled = false;
    }
}

// Add Education Entry
function addEducation(educationData = {}) {
    const container = document.getElementById('educationContainer');
    if (!container) return;
    
    const educationId = 'education-' + Date.now();
    
    const educationHtml = `
        <div class="education-item" data-education-id="${educationId}" style="background: #f9fafb; padding: 1.5rem; border-radius: 8px; margin-bottom: 1rem; border: 1px solid #e5e7eb;">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                <h4 style="margin: 0; color: #1f2937;">Ausbildung</h4>
                <button type="button" class="btn-remove" onclick="removeEducation('${educationId}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <div class="form-grid" style="grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                <div class="form-group">
                    <label>Abschluss *</label>
                    <input type="text" data-field="degree" value="${educationData.degree || ''}" placeholder="z.B. Bachelor of Science" required>
                </div>
                <div class="form-group">
                    <label>Fachrichtung</label>
                    <input type="text" data-field="fieldOfStudy" value="${educationData.fieldOfStudy || ''}" placeholder="z.B. Informatik">
                </div>
                <div class="form-group">
                    <label>Institution *</label>
                    <input type="text" data-field="institution" value="${educationData.institution || ''}" placeholder="z.B. Universität München" required>
                </div>
                <div class="form-group">
                    <label>Standort</label>
                    <input type="text" data-field="location" value="${educationData.location || ''}" placeholder="z.B. München, Deutschland">
                </div>
                <div class="form-group">
                    <label>Von</label>
                    <input type="month" data-field="startDate" value="${educationData.startDate || ''}">
                </div>
                <div class="form-group">
                    <label>Bis</label>
                    <input type="month" data-field="endDate" value="${educationData.endDate || ''}">
                </div>
                <div class="form-group">
                    <label>Note</label>
                    <input type="text" data-field="grade" value="${educationData.grade || ''}" placeholder="z.B. 1.5 oder Sehr gut">
                </div>
                <div class="form-group">
                    <label>Besondere Leistungen</label>
                    <input type="text" data-field="honors" value="${educationData.honors || ''}" placeholder="z.B. Magna Cum Laude">
                </div>
            </div>
            <div class="form-group" style="margin-bottom: 1rem;">
                <label>Beschreibung / Thesis</label>
                <textarea data-field="description" rows="2" placeholder="Kurze Beschreibung oder Thesis-Thema...">${educationData.description || ''}</textarea>
            </div>
        </div>
    `;
    
    container.insertAdjacentHTML('beforeend', educationHtml);
}

function removeEducation(educationId) {
    document.querySelector(`[data-education-id="${educationId}"]`).remove();
}

// Add Language Entry
function addLanguage(languageData = {}) {
    const container = document.getElementById('languagesContainer');
    if (!container) return;
    
    const languageId = 'language-' + Date.now();
    
    const languageHtml = `
        <div class="language-item" data-language-id="${languageId}" style="background: #f9fafb; padding: 1rem; border-radius: 8px; margin-bottom: 1rem; border: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center; gap: 1rem;">
            <div style="flex: 1; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem;">
                <div class="form-group">
                    <label>Sprache *</label>
                    <input type="text" data-field="language" value="${languageData.language || ''}" placeholder="z.B. Englisch" required>
                </div>
                <div class="form-group">
                    <label>Niveau *</label>
                    <select data-field="proficiency" required>
                        <option value="">Bitte wählen</option>
                        <option value="muttersprache" ${languageData.proficiency === 'muttersprache' ? 'selected' : ''}>Muttersprache</option>
                        <option value="verhandlungssicher" ${languageData.proficiency === 'verhandlungssicher' ? 'selected' : ''}>Verhandlungssicher (C2)</option>
                        <option value="fließend" ${languageData.proficiency === 'fließend' ? 'selected' : ''}>Fließend (C1)</option>
                        <option value="gut" ${languageData.proficiency === 'gut' ? 'selected' : ''}>Gut (B2)</option>
                        <option value="grundkenntnisse" ${languageData.proficiency === 'grundkenntnisse' ? 'selected' : ''}>Grundkenntnisse (A2-B1)</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Zertifikat</label>
                    <input type="text" data-field="certificate" value="${languageData.certificate || ''}" placeholder="z.B. TOEFL, IELTS">
                </div>
            </div>
            <button type="button" class="btn-remove" onclick="removeLanguage('${languageId}')">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    
    container.insertAdjacentHTML('beforeend', languageHtml);
}

function removeLanguage(languageId) {
    document.querySelector(`[data-language-id="${languageId}"]`).remove();
}

function updateProgress(percent, text) {
    document.getElementById('progressFill').style.width = percent + '%';
    document.getElementById('progressText').textContent = text;
}

function discardOCR() {
    document.getElementById('ocrResults').style.display = 'none';
    document.getElementById('pdfFileInput').value = '';
}

async function getAuthToken() {
    // Get token from auth system
    if (window.realUserAuth && window.realUserAuth.isLoggedIn()) {
        const userData = window.realUserAuth.getUserData();
        return userData.idToken || '';
    }
    return '';
}

function showNotification(message, type = 'info') {
    // Simple notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        border-radius: 6px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Load resume on page load
document.addEventListener('DOMContentLoaded', () => {
    loadResume();
});

