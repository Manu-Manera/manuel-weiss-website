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
        // Prüfe URL-Parameter für Bearbeitungsmodus
        const urlParams = new URLSearchParams(window.location.search);
        const resumeId = urlParams.get('id');
        const action = urlParams.get('action');
        
        if (resumeId) {
            // Versuche aus Cloud zu laden
            let resumes = [];
            if (window.cloudDataService && window.cloudDataService.isUserLoggedIn()) {
                console.log('📄 Lade Lebenslauf aus Cloud...');
                resumes = await window.cloudDataService.getResumes();
            } else {
                // Fallback: localStorage
                resumes = JSON.parse(localStorage.getItem('user_resumes') || '[]');
            }
            
            const resume = resumes.find(r => r.id === resumeId);
            
            if (resume) {
                resumeData = resume;
                populateForm(resume);
                showNotification('Lebenslauf geladen', 'success');
                
                // PDF-Export-Modus?
                if (action === 'pdf' || action === 'export') {
                    setTimeout(() => {
                        exportToPDF();
                    }, 500);
                }
                return;
            }
        }
        
        // Kein ID oder nicht gefunden - versuche Profildaten zu laden
        await loadProfileData();
        
    } catch (error) {
        console.error('Error loading resume:', error);
        await loadProfileData();
    }
}

// Load profile data for pre-filling
async function loadProfileData() {
    try {
        let profile = null;
        
        // Versuche Cloud-Service zu nutzen
        if (window.cloudDataService && window.cloudDataService.isUserLoggedIn()) {
            console.log('📄 Lade Profildaten aus Cloud...');
            profile = await window.cloudDataService.getProfile();
        } else {
            // Fallback: API direkt
            const token = await getAuthToken();
            if (!token) return;

            const response = await fetch('https://of2iwj7h2c.execute-api.eu-central-1.amazonaws.com/prod/profile', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                profile = await response.json();
            }
        }
        
        if (profile) {
            const resolvedProfile = {
                firstName: profile.firstName || profile.personal?.firstName || '',
                lastName: profile.lastName || profile.personal?.lastName || '',
                email: profile.email || profile.personal?.email || '',
                phone: profile.phone || profile.personal?.phone || '',
                location: profile.location || profile.personal?.location || '',
                address: profile.address || profile.personal?.address || '',
                linkedin: profile.preferences?.linkedin || profile.linkedin || profile.personal?.linkedin || '',
                website: profile.preferences?.website || profile.website || profile.personal?.website || ''
            };
            
            // Fülle Formular mit Profildaten vor
            if (resolvedProfile.firstName) document.getElementById('firstName').value = resolvedProfile.firstName;
            if (resolvedProfile.lastName) document.getElementById('lastName').value = resolvedProfile.lastName;
            if (resolvedProfile.email) document.getElementById('email').value = resolvedProfile.email;
            if (resolvedProfile.phone) document.getElementById('phone').value = resolvedProfile.phone;
            if (resolvedProfile.location) document.getElementById('location').value = resolvedProfile.location;
            if (resolvedProfile.address) document.getElementById('address').value = resolvedProfile.address;
            
            // LinkedIn und Website aus preferences oder settings
            if (resolvedProfile.linkedin) document.getElementById('linkedin').value = resolvedProfile.linkedin;
            if (resolvedProfile.website) document.getElementById('website').value = resolvedProfile.website;
            
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
        
        // URL-Parameter prüfen für Bearbeitungsmodus
        const urlParams = new URLSearchParams(window.location.search);
        let resumeId = urlParams.get('id');
        
        // Generiere ID falls neu
        if (!resumeId) {
            resumeId = Date.now().toString(36);
        }
        
        const resumeData = {
            id: resumeId,
            ...formData,
            createdAt: formData.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        // Cloud-Service nutzen wenn verfügbar
        if (window.cloudDataService) {
            const result = await window.cloudDataService.saveResume(resumeData);
            if (result.success) {
                console.log('✅ Lebenslauf in Cloud gespeichert:', resumeId);
            }
        } else {
            // Fallback: localStorage
            let resumes = JSON.parse(localStorage.getItem('user_resumes') || '[]');
            const index = resumes.findIndex(r => r.id === resumeId);
            if (index !== -1) {
                resumes[index] = resumeData;
            } else {
                resumes.unshift(resumeData);
            }
            localStorage.setItem('user_resumes', JSON.stringify(resumes));
            console.log('✅ Lebenslauf in localStorage gespeichert:', resumeId);
        }
        
        showNotification('✅ Lebenslauf gespeichert!', 'success');
        
        // Zurück zum Dashboard nach kurzem Delay
        setTimeout(() => {
            window.location.href = 'dashboard.html#resume';
        }, 1500);
        
    } catch (error) {
        console.error('Error saving resume:', error);
        showNotification(`Fehler beim Speichern: ${error.message}`, 'error');
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

// Upload and process PDF - Lokale Verarbeitung mit PDF.js und OpenAI
async function uploadAndProcessPDF(file) {
    try {
        document.getElementById('uploadProgress').style.display = 'block';
        updateProgress(0, 'PDF wird gelesen...');
        
        // 1. Text aus PDF extrahieren mit PDF.js
        const pdfText = await extractTextFromPDF(file);
        
        if (!pdfText || pdfText.trim().length < 50) {
            throw new Error('Konnte keinen Text aus der PDF extrahieren. Bitte prüfen Sie, ob die PDF Textinhalt enthält.');
        }
        
        console.log('📄 Extrahierter Text:', pdfText.substring(0, 500) + '...');
        updateProgress(30, 'Text extrahiert, analysiere mit KI...');
        
        // 2. OpenAI API-Key abrufen
        const apiKey = await getOpenAIApiKey();
        
        if (!apiKey) {
            showNotification('OpenAI API-Key nicht gefunden. Bitte im Admin-Panel konfigurieren.', 'error');
            document.getElementById('uploadProgress').style.display = 'none';
            return;
        }
        
        updateProgress(50, 'KI-Analyse läuft...');
        
        // 3. Mit OpenAI GPT-4o strukturieren
        const structuredData = await processTextWithGPT(pdfText, apiKey);
        
        if (!structuredData) {
            throw new Error('KI-Analyse fehlgeschlagen');
        }
        
        console.log('✅ Strukturierte Daten:', structuredData);
        updateProgress(100, 'Fertig!');
        
        // 4. Ergebnisse anzeigen
        showOCRResults({
            success: true,
            rawText: pdfText,
            parsedData: structuredData
        }, 'local-pdf');
        
    } catch (error) {
        console.error('Error processing PDF:', error);
        showNotification(`Fehler: ${error.message}`, 'error');
        document.getElementById('uploadProgress').style.display = 'none';
    }
}

// Text aus PDF extrahieren mit PDF.js
async function extractTextFromPDF(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = async function(event) {
            try {
                const typedArray = new Uint8Array(event.target.result);
                
                // PDF.js laden
                if (!window.pdfjsLib) {
                    throw new Error('PDF.js nicht geladen');
                }
                
                const pdf = await pdfjsLib.getDocument(typedArray).promise;
                let fullText = '';
                
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    const pageText = textContent.items.map(item => item.str).join(' ');
                    fullText += pageText + '\n\n';
                }
                
                resolve(fullText);
            } catch (error) {
                reject(error);
            }
        };
        
        reader.onerror = () => reject(new Error('Fehler beim Lesen der Datei'));
        reader.readAsArrayBuffer(file);
    });
}

// OpenAI API-Key abrufen
async function getOpenAIApiKey() {
    try {
        // 1. Versuche über aws-api-settings
        if (window.awsApiSettings) {
            const key = await window.awsApiSettings.getFullApiKey('openai');
            if (key) {
                console.log('✅ API-Key über awsApiSettings geladen');
                return key;
            }
        }
        
        // 2. Versuche über globalApiManager
        if (window.globalApiManager) {
            const key = await window.globalApiManager.getApiKey('openai');
            if (key) {
                console.log('✅ API-Key über globalApiManager geladen');
                return key;
            }
        }
        
        // 3. Versuche über Netlify Function
        try {
            const response = await fetch('/.netlify/functions/api-settings/key?provider=openai', {
                headers: {
                    'X-User-Id': getUserId()
                }
            });
            if (response.ok) {
                const data = await response.json();
                if (data.apiKey) {
                    console.log('✅ API-Key über Netlify Function geladen');
                    return data.apiKey;
                }
            }
        } catch (e) {
            console.warn('Netlify Function nicht erreichbar:', e);
        }
        
        // 4. Fallback: localStorage
        const localKeys = ['openai_api_key', 'admin_openai_api_key', 'ki_api_settings'];
        for (const key of localKeys) {
            const value = localStorage.getItem(key);
            if (value) {
                try {
                    const parsed = JSON.parse(value);
                    if (parsed.openai) {
                        console.log('✅ API-Key aus localStorage geladen');
                        return parsed.openai;
                    }
                } catch {
                    if (value.startsWith('sk-')) {
                        console.log('✅ API-Key direkt aus localStorage geladen');
                        return value;
                    }
                }
            }
        }
        
        return null;
    } catch (error) {
        console.error('Fehler beim Abrufen des API-Keys:', error);
        return null;
    }
}

function getUserId() {
    try {
        const session = localStorage.getItem('aws_auth_session');
        if (session) {
            const parsed = JSON.parse(session);
            return parsed.userId || parsed.sub || 'anonymous';
        }
    } catch (e) {}
    return 'anonymous';
}

// Text mit GPT strukturieren
async function processTextWithGPT(text, apiKey) {
    const prompt = `Analysiere den folgenden Lebenslauf-Text und extrahiere die Daten in strukturierter Form.

WICHTIG: Extrahiere ALLE Informationen, besonders:
- Vollständiger Name
- E-Mail, Telefon, Adresse
- Berufsbezeichnung/Titel
- ALLE Berufserfahrungen (Position, Firma, Zeitraum, Beschreibung)
- ALLE Ausbildungen (auch Berufsausbildungen wie "Seiler", "Schreiner" etc.)
- ALLE Fähigkeiten (technische und soziale)
- Sprachen mit Niveau

Antworte NUR mit einem JSON-Objekt im folgenden Format:
{
    "name": "Vollständiger Name",
    "email": "email@example.com",
    "phone": "+49 123 456789",
    "address": "Straße, PLZ Ort",
    "title": "Aktuelle Berufsbezeichnung",
    "summary": "Kurze Zusammenfassung der Person",
    "experience": [
        {
            "position": "Position",
            "company": "Firma",
            "startDate": "MM/YYYY",
            "endDate": "MM/YYYY oder heute",
            "description": "Beschreibung der Tätigkeiten"
        }
    ],
    "education": [
        {
            "degree": "Abschluss oder Ausbildung",
            "institution": "Schule/Universität/Betrieb",
            "startDate": "MM/YYYY",
            "endDate": "MM/YYYY",
            "description": "Details"
        }
    ],
    "skills": {
        "technical": ["Skill1", "Skill2"],
        "soft": ["Soft Skill1", "Soft Skill2"]
    },
    "languages": [
        {"language": "Deutsch", "level": "Muttersprache"},
        {"language": "Englisch", "level": "B2"}
    ]
}

Lebenslauf-Text:
${text}`;

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content: 'Du bist ein Experte für die Analyse von Lebensläufen. Extrahiere alle relevanten Informationen präzise und strukturiert.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.1,
                max_tokens: 4000
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('OpenAI API Error:', errorData);
            throw new Error(errorData.error?.message || 'OpenAI API Fehler');
        }
        
        const data = await response.json();
        const content = data.choices[0]?.message?.content;
        
        if (!content) {
            throw new Error('Keine Antwort von OpenAI');
        }
        
        // JSON aus der Antwort extrahieren
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('Konnte JSON nicht parsen');
        }
        
        return JSON.parse(jsonMatch[0]);
        
    } catch (error) {
        console.error('GPT Processing Error:', error);
        throw error;
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
    // Flache Struktur für einfachere Anzeige im Dashboard
    return {
        // Persönliche Daten (flach für Dashboard-Anzeige)
        firstName: document.getElementById('firstName')?.value || '',
        lastName: document.getElementById('lastName')?.value || '',
        title: document.getElementById('title')?.value || '',
        summary: document.getElementById('summary')?.value || '',
        email: document.getElementById('email')?.value || '',
        phone: document.getElementById('phone')?.value || '',
        location: document.getElementById('location')?.value || '',
        address: document.getElementById('address')?.value || '',
        linkedin: document.getElementById('linkedin')?.value || '',
        github: document.getElementById('github')?.value || '',
        website: document.getElementById('website')?.value || '',
        availability: document.getElementById('availability')?.value || '',
        workModel: document.getElementById('workModel')?.value || '',
        
        // Strukturierte Daten (für vollständigen Export)
        personalInfo: {
            firstName: document.getElementById('firstName')?.value || '',
            lastName: document.getElementById('lastName')?.value || '',
            title: document.getElementById('title')?.value || '',
            summary: document.getElementById('summary')?.value || '',
            email: document.getElementById('email')?.value || '',
            phone: document.getElementById('phone')?.value || '',
            location: document.getElementById('location')?.value || '',
            address: document.getElementById('address')?.value || '',
            linkedin: document.getElementById('linkedin')?.value || '',
            github: document.getElementById('github')?.value || '',
            website: document.getElementById('website')?.value || '',
            availability: document.getElementById('availability')?.value || '',
            workModel: document.getElementById('workModel')?.value || ''
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
    // Unterstütze sowohl verschachtelte (personalInfo) als auch flache Struktur
    const personal = data.personalInfo || data;
    
    const setField = (id, value) => {
        const el = document.getElementById(id);
        if (el && value) el.value = value;
    };
    
    setField('firstName', personal.firstName);
    setField('lastName', personal.lastName);
    setField('title', personal.title);
    setField('summary', personal.summary);
    setField('email', personal.email);
    setField('phone', personal.phone);
    setField('location', personal.location);
    setField('address', personal.address);
    setField('linkedin', personal.linkedin);
    setField('github', personal.github);
    setField('website', personal.website);
    setField('availability', personal.availability);
    setField('workModel', personal.workModel);
    
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

function addTechTag(itemId) {
    // itemId kann 'project-xxx' oder 'exp-xxx' sein
    const container = document.getElementById(`tech-${itemId}`);
    if (!container) return;
    
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

function addAchievement(itemId) {
    // itemId kann 'project-xxx' oder 'exp-xxx' sein
    const container = document.getElementById(`achievements-${itemId}`);
    if (!container) return;
    
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
        <div class="experience-item draggable-item" data-experience-id="${experienceId}" draggable="true" style="background: #f9fafb; padding: 1.5rem; border-radius: 8px; margin-bottom: 1rem; border: 1px solid #e5e7eb;">
            <div class="drag-handle" title="Ziehen zum Verschieben">
                <i class="fas fa-grip-vertical"></i>
            </div>
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
                    <div class="current-job-wrapper">
                        <input type="month" data-field="endDate" value="${experienceData.endDate || ''}" ${experienceData.currentJob ? 'disabled' : ''}>
                        <label>
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
    
    // Drag & Drop initialisieren
    initDragAndDrop(container);
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
        <div class="education-item draggable-item" data-education-id="${educationId}" draggable="true" style="background: #f9fafb; padding: 1.5rem; border-radius: 8px; margin-bottom: 1rem; border: 1px solid #e5e7eb;">
            <div class="drag-handle" title="Ziehen zum Verschieben">
                <i class="fas fa-grip-vertical"></i>
            </div>
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
    
    // Drag & Drop initialisieren
    initDragAndDrop(container);
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
    // Get token from localStorage session (where Cognito stores it)
    try {
        const storedSession = localStorage.getItem('aws_auth_session');
        if (storedSession) {
            const session = JSON.parse(storedSession);
            if (session.idToken) {
                // Check if session is still valid
                const expiresAt = session.expiresAt ? new Date(session.expiresAt) : null;
                if (expiresAt && expiresAt > new Date()) {
                    return session.idToken;
                } else {
                    console.warn('⚠️ Session abgelaufen');
                }
            }
        }
    } catch (e) {
        console.error('Error reading session:', e);
    }
    
    // Fallback: Check realUserAuth
    if (window.realUserAuth && window.realUserAuth.isLoggedIn()) {
        const storedSession = localStorage.getItem('aws_auth_session');
        if (storedSession) {
            const session = JSON.parse(storedSession);
            return session.idToken || '';
        }
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
    initAllDragAndDrop();
});

// =============================================
// DRAG & DROP FUNKTIONALITÄT
// =============================================

let draggedElement = null;

function initAllDragAndDrop() {
    const containers = [
        'experienceContainer',
        'educationContainer',
        'languagesContainer',
        'projectsContainer',
        'technicalSkillsContainer',
        'softSkillsContainer'
    ];
    
    containers.forEach(containerId => {
        const container = document.getElementById(containerId);
        if (container) {
            initDragAndDrop(container);
        }
    });
}

function initDragAndDrop(container) {
    const items = container.querySelectorAll('.draggable-item');
    
    items.forEach(item => {
        // Entferne alte Event Listener
        item.removeEventListener('dragstart', handleDragStart);
        item.removeEventListener('dragend', handleDragEnd);
        item.removeEventListener('dragover', handleDragOver);
        item.removeEventListener('drop', handleDrop);
        
        // Füge neue Event Listener hinzu
        item.addEventListener('dragstart', handleDragStart);
        item.addEventListener('dragend', handleDragEnd);
        item.addEventListener('dragover', handleDragOver);
        item.addEventListener('drop', handleDrop);
    });
    
    container.addEventListener('dragover', (e) => {
        e.preventDefault();
    });
}

function handleDragStart(e) {
    draggedElement = e.target.closest('.draggable-item');
    draggedElement.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
}

function handleDragEnd(e) {
    if (draggedElement) {
        draggedElement.classList.remove('dragging');
    }
    draggedElement = null;
    
    // Entferne alle Platzhalter
    document.querySelectorAll('.drag-placeholder').forEach(p => p.remove());
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    const target = e.target.closest('.draggable-item');
    if (target && target !== draggedElement) {
        const container = target.parentNode;
        const rect = target.getBoundingClientRect();
        const midY = rect.top + rect.height / 2;
        
        if (e.clientY < midY) {
            container.insertBefore(draggedElement, target);
        } else {
            container.insertBefore(draggedElement, target.nextSibling);
        }
    }
}

function handleDrop(e) {
    e.preventDefault();
    showNotification('Element verschoben', 'success');
}

// =============================================
// PDF EXPORT FUNKTIONALITÄT
// =============================================

async function exportToPDF() {
    try {
        showNotification('PDF wird generiert...', 'info');
        
        // Sammle alle Daten
        const resumeData = collectFormData();
        const styleSettings = JSON.parse(localStorage.getItem('resume_style') || '{}');
        
        // Generiere HTML für den Lebenslauf
        const resumeHtml = generateResumeHTML(resumeData, styleSettings);
        
        // Öffne Druckdialog
        const printWindow = window.open('', '_blank');
        printWindow.document.write(resumeHtml);
        printWindow.document.close();
        
        // Warte bis geladen und drucke
        printWindow.onload = function() {
            setTimeout(() => {
                printWindow.print();
            }, 500);
        };
        
    } catch (error) {
        console.error('PDF Export Error:', error);
        showNotification('Fehler beim PDF-Export', 'error');
    }
}

function generateResumeHTML(data, style = {}) {
    const primaryColor = style.primaryColor || '#2563eb';
    const secondaryColor = style.secondaryColor || '#64748b';
    const fontFamily = style.fontFamily || 'Inter, sans-serif';
    const template = style.template || 'modern';
    
    const personalInfo = data.personalInfo || {};
    const experience = data.sections?.find(s => s.type === 'experience')?.entries || [];
    const education = data.sections?.find(s => s.type === 'education')?.entries || [];
    const skills = data.skills || {};
    const languages = data.languages || [];
    
    return `<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <title>Lebenslauf - ${personalInfo.firstName || ''} ${personalInfo.lastName || ''}</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: ${fontFamily};
            font-size: 11pt;
            line-height: 1.5;
            color: #1f2937;
            padding: 20mm;
            max-width: 210mm;
            margin: 0 auto;
            background: white;
        }
        @media print {
            body { padding: 15mm; }
            .page-break { page-break-before: always; }
        }
        
        /* Header */
        .resume-header {
            text-align: center;
            margin-bottom: 25px;
            padding-bottom: 15px;
            border-bottom: 2px solid ${primaryColor};
        }
        .resume-header h1 {
            font-size: 24pt;
            color: ${primaryColor};
            margin-bottom: 5px;
            font-weight: 700;
        }
        .resume-header .title {
            font-size: 13pt;
            color: ${secondaryColor};
            margin-bottom: 10px;
        }
        .contact-info {
            display: flex;
            justify-content: center;
            flex-wrap: wrap;
            gap: 15px;
            font-size: 10pt;
            color: #4b5563;
        }
        .contact-info span {
            display: flex;
            align-items: center;
            gap: 5px;
        }
        
        /* Summary */
        .summary {
            margin-bottom: 20px;
            padding: 12px;
            background: #f8fafc;
            border-radius: 6px;
            font-style: italic;
            color: #475569;
        }
        
        /* Section */
        .section {
            margin-bottom: 20px;
        }
        .section-title {
            font-size: 13pt;
            font-weight: 700;
            color: ${primaryColor};
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 5px;
            margin-bottom: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        /* Experience */
        .experience-entry, .education-entry {
            margin-bottom: 15px;
        }
        .entry-header {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            margin-bottom: 3px;
        }
        .entry-title {
            font-weight: 600;
            font-size: 11pt;
            color: #1f2937;
        }
        .entry-date {
            font-size: 10pt;
            color: ${secondaryColor};
        }
        .entry-company {
            font-size: 10pt;
            color: #4b5563;
            margin-bottom: 5px;
        }
        .entry-description {
            font-size: 10pt;
            color: #374151;
        }
        
        /* Skills */
        .skills-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
        }
        .skill-category {
            margin-bottom: 8px;
        }
        .skill-category-name {
            font-weight: 600;
            font-size: 10pt;
            color: #1f2937;
            margin-bottom: 3px;
        }
        .skill-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 5px;
        }
        .skill-tag {
            background: #eff6ff;
            color: ${primaryColor};
            padding: 2px 8px;
            border-radius: 3px;
            font-size: 9pt;
        }
        
        /* Languages */
        .languages-list {
            display: flex;
            flex-wrap: wrap;
            gap: 15px;
        }
        .language-item {
            font-size: 10pt;
        }
        .language-name {
            font-weight: 600;
        }
        .language-level {
            color: ${secondaryColor};
        }
    </style>
</head>
<body>
    <div class="resume-header">
        <h1>${personalInfo.firstName || ''} ${personalInfo.lastName || ''}</h1>
        ${personalInfo.title ? `<div class="title">${personalInfo.title}</div>` : ''}
        <div class="contact-info">
            ${personalInfo.email ? `<span>✉ ${personalInfo.email}</span>` : ''}
            ${personalInfo.phone ? `<span>☎ ${personalInfo.phone}</span>` : ''}
            ${personalInfo.address || personalInfo.location ? `<span>📍 ${personalInfo.address || personalInfo.location}</span>` : ''}
            ${personalInfo.linkedin ? `<span>🔗 ${personalInfo.linkedin}</span>` : ''}
            ${personalInfo.website ? `<span>🌐 ${personalInfo.website}</span>` : ''}
        </div>
    </div>
    
    ${personalInfo.summary ? `<div class="summary">${personalInfo.summary}</div>` : ''}
    
    ${experience.length > 0 ? `
    <div class="section">
        <div class="section-title">Berufserfahrung</div>
        ${experience.map(exp => `
        <div class="experience-entry">
            <div class="entry-header">
                <span class="entry-title">${exp.position || ''}</span>
                <span class="entry-date">${formatDate(exp.startDate)} - ${exp.currentJob ? 'heute' : formatDate(exp.endDate)}</span>
            </div>
            <div class="entry-company">${exp.company || ''}${exp.location ? `, ${exp.location}` : ''}</div>
            ${exp.description ? `<div class="entry-description">${exp.description}</div>` : ''}
        </div>
        `).join('')}
    </div>
    ` : ''}
    
    ${education.length > 0 ? `
    <div class="section">
        <div class="section-title">Ausbildung</div>
        ${education.map(edu => `
        <div class="education-entry">
            <div class="entry-header">
                <span class="entry-title">${edu.degree || ''}</span>
                <span class="entry-date">${formatDate(edu.startDate)} - ${formatDate(edu.endDate)}</span>
            </div>
            <div class="entry-company">${edu.institution || ''}${edu.location ? `, ${edu.location}` : ''}</div>
            ${edu.fieldOfStudy ? `<div class="entry-description">Fachrichtung: ${edu.fieldOfStudy}</div>` : ''}
        </div>
        `).join('')}
    </div>
    ` : ''}
    
    ${(skills.technicalSkills && skills.technicalSkills.length > 0) || (skills.softSkills && skills.softSkills.length > 0) ? `
    <div class="section">
        <div class="section-title">Fähigkeiten</div>
        <div class="skills-grid">
            ${skills.technicalSkills ? skills.technicalSkills.map(cat => `
            <div class="skill-category">
                <div class="skill-category-name">${cat.category}</div>
                <div class="skill-tags">
                    ${cat.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                </div>
            </div>
            `).join('') : ''}
        </div>
    </div>
    ` : ''}
    
    ${languages.length > 0 ? `
    <div class="section">
        <div class="section-title">Sprachen</div>
        <div class="languages-list">
            ${languages.map(lang => `
            <div class="language-item">
                <span class="language-name">${lang.language}</span>
                <span class="language-level">(${formatProficiency(lang.proficiency)})</span>
            </div>
            `).join('')}
        </div>
    </div>
    ` : ''}
</body>
</html>`;
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    const [year, month] = dateStr.split('-');
    const months = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
    return `${months[parseInt(month) - 1] || ''} ${year}`;
}

function formatProficiency(prof) {
    const map = {
        'muttersprache': 'Muttersprache',
        'verhandlungssicher': 'C2',
        'fließend': 'C1',
        'gut': 'B2',
        'grundkenntnisse': 'A2-B1'
    };
    return map[prof] || prof;
}

// =============================================
// STYLE EDITOR FUNKTIONALITÄT
// =============================================

function openStyleEditor() {
    const modal = document.getElementById('styleEditorModal');
    if (modal) {
        modal.classList.add('active');
        loadStyleSettings();
    }
}

function closeStyleEditor() {
    const modal = document.getElementById('styleEditorModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

function loadStyleSettings() {
    const settings = JSON.parse(localStorage.getItem('resume_style') || '{}');
    
    // Template auswählen
    const templates = document.querySelectorAll('.style-template');
    templates.forEach(t => {
        t.classList.toggle('active', t.dataset.template === (settings.template || 'modern'));
    });
    
    // Farben setzen
    const primaryColor = document.getElementById('primaryColor');
    const secondaryColor = document.getElementById('secondaryColor');
    const fontSelect = document.getElementById('fontSelect');
    
    if (primaryColor) primaryColor.value = settings.primaryColor || '#2563eb';
    if (secondaryColor) secondaryColor.value = settings.secondaryColor || '#64748b';
    if (fontSelect) fontSelect.value = settings.fontFamily || 'Inter, sans-serif';
}

function selectTemplate(element) {
    document.querySelectorAll('.style-template').forEach(t => t.classList.remove('active'));
    element.classList.add('active');
}

function saveStyleSettings() {
    const activeTemplate = document.querySelector('.style-template.active');
    const primaryColor = document.getElementById('primaryColor');
    const secondaryColor = document.getElementById('secondaryColor');
    const fontSelect = document.getElementById('fontSelect');
    
    const settings = {
        template: activeTemplate?.dataset.template || 'modern',
        primaryColor: primaryColor?.value || '#2563eb',
        secondaryColor: secondaryColor?.value || '#64748b',
        fontFamily: fontSelect?.value || 'Inter, sans-serif'
    };
    
    localStorage.setItem('resume_style', JSON.stringify(settings));
    closeStyleEditor();
    showNotification('Style-Einstellungen gespeichert', 'success');
}

function previewStyle() {
    const activeTemplate = document.querySelector('.style-template.active');
    const primaryColor = document.getElementById('primaryColor');
    const secondaryColor = document.getElementById('secondaryColor');
    const fontSelect = document.getElementById('fontSelect');
    
    const settings = {
        template: activeTemplate?.dataset.template || 'modern',
        primaryColor: primaryColor?.value || '#2563eb',
        secondaryColor: secondaryColor?.value || '#64748b',
        fontFamily: fontSelect?.value || 'Inter, sans-serif'
    };
    
    const resumeData = collectFormData();
    const resumeHtml = generateResumeHTML(resumeData, settings);
    
    const previewWindow = window.open('', '_blank');
    previewWindow.document.write(resumeHtml);
    previewWindow.document.close();
}

// Global Funktionen für HTML onclick
window.exportToPDF = exportToPDF;
window.openStyleEditor = openStyleEditor;
window.closeStyleEditor = closeStyleEditor;
window.selectTemplate = selectTemplate;
window.saveStyleSettings = saveStyleSettings;
window.previewStyle = previewStyle;
