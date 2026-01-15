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
        
        // PRIORITÄT 1: UnifiedProfileService (beste Datenquelle)
        if (window.unifiedProfileService?.isInitialized) {
            profile = window.unifiedProfileService.getProfile();
            if (profile && profile.firstName && profile.firstName !== 'Test') {
                console.log('✅ Nutze UnifiedProfileService für Profildaten');
            } else {
                profile = null;
            }
        }
        
        // PRIORITÄT 2: Cloud-Service
        if (!profile && window.cloudDataService && window.cloudDataService.isUserLoggedIn()) {
            console.log('📄 Lade Profildaten aus Cloud...');
            profile = await window.cloudDataService.getProfile();
        }
        
        // PRIORITÄT 3: API direkt
        if (!profile) {
            const token = await getAuthToken();
            if (token) {
                const response = await fetch('https://of2iwj7h2c.execute-api.eu-central-1.amazonaws.com/prod/profile', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    profile = await response.json();
                }
            }
        }
        
        if (profile) {
            // Fülle Formular mit Profildaten vor (ignoriere "Test User")
            const firstName = profile.firstName;
            const lastName = profile.lastName;
            
            if (firstName && firstName !== 'Test') {
                const firstNameEl = document.getElementById('firstName');
                if (firstNameEl) firstNameEl.value = firstName;
            }
            if (lastName && lastName !== 'User') {
                const lastNameEl = document.getElementById('lastName');
                if (lastNameEl) lastNameEl.value = lastName;
            }
            if (profile.email) {
                const emailEl = document.getElementById('email');
                if (emailEl) emailEl.value = profile.email;
            }
            if (profile.phone) {
                const phoneEl = document.getElementById('phone');
                if (phoneEl) phoneEl.value = profile.phone;
            }
            if (profile.location) {
                const addressEl = document.getElementById('address');
                if (addressEl) addressEl.value = profile.location;
            }
            
            // LinkedIn und Website aus preferences oder settings
            if (profile.preferences?.linkedin || profile.linkedin) {
                const linkedinEl = document.getElementById('linkedin');
                if (linkedinEl) linkedinEl.value = profile.preferences?.linkedin || profile.linkedin;
            }
            if (profile.preferences?.website || profile.website) {
                const websiteEl = document.getElementById('website');
                if (websiteEl) websiteEl.value = profile.preferences?.website || profile.website;
            }
            
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
    const prompt = `Analysiere den folgenden Lebenslauf-Text und extrahiere die Daten VOLLSTÄNDIG in strukturierter Form.

KRITISCH WICHTIG - VOLLSTÄNDIGE EXTRAKTION:
- Extrahiere ALLE Informationen VOLLSTÄNDIG und UNGEKÜRZT
- KÜRZE NIEMALS Beschreibungen oder Aufgaben ab!
- Übernimm ALLE Stichpunkte/Aufzählungen aus dem Original
- Jede einzelne Tätigkeit/Verantwortlichkeit muss erfasst werden

PFLICHTFELDER:
- Vollständiger Name
- E-Mail, Telefon, Adresse
- Berufsbezeichnung/Titel
- ALLE Berufserfahrungen mit KOMPLETTEN Beschreibungen
- ALLE Ausbildungen (auch Berufsausbildungen)
- ALLE Fähigkeiten mit geschätztem Niveau (1-10)
- Sprachen mit Niveau

BERUFSERFAHRUNG - SEHR WICHTIG:
- "description": Die VOLLSTÄNDIGE Beschreibung der Rolle, NICHT gekürzt!
- "bullets": JEDER einzelne Stichpunkt aus dem Original als separates Array-Element
- Wenn im Original 10 Stichpunkte stehen, müssen auch 10 im bullets-Array sein
- NIEMALS zusammenfassen oder weglassen!
- "technologies": Alle genannten Tools, Software, Systeme

FÄHIGKEITEN MIT BEWERTUNG:
- Schätze für jede Fähigkeit ein Level von 1-10 basierend auf dem Kontext
- 10 = Experte, 7-9 = Fortgeschritten, 4-6 = Mittel, 1-3 = Grundkenntnisse

Antworte NUR mit einem JSON-Objekt im folgenden Format:
{
    "name": "Vollständiger Name",
    "email": "email@example.com",
    "phone": "+49 123 456789",
    "address": "Straße, PLZ Ort",
    "title": "Aktuelle Berufsbezeichnung",
    "summary": "Zusammenfassung der Person",
    "experience": [
        {
            "position": "Position",
            "company": "Firma",
            "location": "Ort",
            "startDate": "MM/YYYY",
            "endDate": "MM/YYYY oder heute",
            "description": "VOLLSTÄNDIGE Beschreibung der Rolle - NICHT KÜRZEN!",
            "bullets": ["Tätigkeit 1 - vollständig", "Tätigkeit 2 - vollständig", "...ALLE weiteren"],
            "technologies": ["Tool1", "System2", "Software3"]
        }
    ],
    "education": [
        {
            "degree": "Abschluss oder Ausbildung",
            "institution": "Schule/Universität/Betrieb",
            "location": "Ort",
            "startDate": "MM/YYYY",
            "endDate": "MM/YYYY",
            "description": "Vollständige Details"
        }
    ],
    "skills": {
        "technical": [
            {"name": "Skill1", "level": 8},
            {"name": "Skill2", "level": 6}
        ],
        "soft": [
            {"name": "Soft Skill1", "level": 7},
            {"name": "Soft Skill2", "level": 8}
        ]
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
                        content: 'Du bist ein Experte für die Analyse von Lebensläufen. Extrahiere ALLE Informationen VOLLSTÄNDIG und UNGEKÜRZT. Kürze NIEMALS Beschreibungen ab. Jeder Stichpunkt muss einzeln erfasst werden.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.1,
                max_tokens: 8000
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
    
    console.log('📥 Applying OCR data:', parsed);
    
    // Fill personal info
    if (parsed.name) {
        const nameParts = parsed.name.split(' ');
        document.getElementById('firstName').value = nameParts[0] || '';
        document.getElementById('lastName').value = nameParts.slice(1).join(' ') || '';
    }
    if (parsed.email) document.getElementById('email').value = parsed.email;
    if (parsed.phone) document.getElementById('phone').value = parsed.phone;
    if (parsed.address) document.getElementById('address').value = parsed.address;
    if (parsed.title) document.getElementById('title').value = parsed.title;
    if (parsed.summary) document.getElementById('summary').value = parsed.summary;
    
    // Apply experience data with bullets
    if (parsed.experience && Array.isArray(parsed.experience)) {
        // Clear existing experience
        const expContainer = document.getElementById('experienceContainer');
        if (expContainer) {
            expContainer.innerHTML = '';
            
            // Hilfsfunktion: Konvertiere MM/YYYY zu YYYY-MM (für input type="month")
            const convertDateFormat = (dateStr) => {
                if (!dateStr) return '';
                // Verschiedene Formate verarbeiten
                const lowerDate = dateStr.toLowerCase();
                if (lowerDate === 'heute' || lowerDate === 'present' || lowerDate === 'aktuell') {
                    return ''; // Aktueller Job, Enddatum leer
                }
                // MM/YYYY -> YYYY-MM
                const slashMatch = dateStr.match(/^(\d{1,2})\/(\d{4})$/);
                if (slashMatch) {
                    const month = slashMatch[1].padStart(2, '0');
                    return `${slashMatch[2]}-${month}`;
                }
                // MM.YYYY -> YYYY-MM
                const dotMatch = dateStr.match(/^(\d{1,2})\.(\d{4})$/);
                if (dotMatch) {
                    const month = dotMatch[1].padStart(2, '0');
                    return `${dotMatch[2]}-${month}`;
                }
                // YYYY -> YYYY-01
                const yearMatch = dateStr.match(/^(\d{4})$/);
                if (yearMatch) {
                    return `${yearMatch[1]}-01`;
                }
                return dateStr;
            };
            
            // Add each experience entry
            parsed.experience.forEach((exp, index) => {
                // Convert bullets array to string with line breaks
                let bulletsText = '';
                if (exp.bullets && Array.isArray(exp.bullets)) {
                    bulletsText = exp.bullets.map(b => `- ${b}`).join('\n');
                }
                
                const isCurrentJob = exp.endDate?.toLowerCase() === 'heute' || 
                                    exp.endDate?.toLowerCase() === 'present' ||
                                    exp.endDate?.toLowerCase() === 'aktuell';
                
                const experienceData = {
                    position: exp.position || '',
                    company: exp.company || '',
                    location: exp.location || '',
                    startDate: convertDateFormat(exp.startDate),
                    endDate: isCurrentJob ? '' : convertDateFormat(exp.endDate),
                    currentJob: isCurrentJob,
                    description: exp.description || '',
                    bullets: bulletsText,
                    technologies: exp.technologies || []
                };
                
                addExperience(experienceData);
                console.log(`✅ Experience ${index + 1} added:`, experienceData);
            });
        }
    }
    
    // Apply education data
    if (parsed.education && Array.isArray(parsed.education)) {
        const eduContainer = document.getElementById('educationContainer');
        if (eduContainer) {
            eduContainer.innerHTML = '';
            
            // Hilfsfunktion: Konvertiere MM/YYYY zu YYYY-MM
            const convertDateFormat = (dateStr) => {
                if (!dateStr) return '';
                // MM/YYYY -> YYYY-MM
                const slashMatch = dateStr.match(/^(\d{1,2})\/(\d{4})$/);
                if (slashMatch) {
                    const month = slashMatch[1].padStart(2, '0');
                    return `${slashMatch[2]}-${month}`;
                }
                // MM.YYYY -> YYYY-MM
                const dotMatch = dateStr.match(/^(\d{1,2})\.(\d{4})$/);
                if (dotMatch) {
                    const month = dotMatch[1].padStart(2, '0');
                    return `${dotMatch[2]}-${month}`;
                }
                // YYYY -> YYYY-01
                const yearMatch = dateStr.match(/^(\d{4})$/);
                if (yearMatch) {
                    return `${yearMatch[1]}-01`;
                }
                return dateStr;
            };
            
            parsed.education.forEach((edu, index) => {
                const educationData = {
                    degree: edu.degree || '',
                    institution: edu.institution || '',
                    location: edu.location || '',
                    startDate: convertDateFormat(edu.startDate),
                    endDate: convertDateFormat(edu.endDate),
                    fieldOfStudy: edu.fieldOfStudy || '',
                    description: edu.description || ''
                };
                
                addEducation(educationData);
                console.log(`✅ Education ${index + 1} added:`, educationData);
            });
        }
    }
    
    // Apply skills - MIT BEWERTUNG
    if (parsed.skills) {
        // Technical skills - verwende die korrekte Funktion addTechnicalSkillCategory
        if (parsed.skills.technical && Array.isArray(parsed.skills.technical)) {
            const techContainer = document.getElementById('technicalSkillsContainer');
            if (techContainer) {
                techContainer.innerHTML = '';
                
                // Konvertiere Skills in das erwartete Format (mit Bewertung)
                const skillsWithRating = parsed.skills.technical.map(skill => {
                    // Neues Format: {name: "Skill", level: 8}
                    if (typeof skill === 'object' && skill.name) {
                        return { name: skill.name, level: skill.level || 5 };
                    }
                    // Altes Format: "Skill" als String
                    return { name: skill, level: 5 };
                });
                
                if (typeof addTechnicalSkillWithRating === 'function') {
                    skillsWithRating.forEach(skill => {
                        addTechnicalSkillWithRating(skill.name, skill.level);
                    });
                } else if (typeof addTechnicalSkillCategory === 'function') {
                    // Fallback auf alte Funktion
                    const skillNames = skillsWithRating.map(s => s.name);
                    addTechnicalSkillCategory('Technische Fähigkeiten', skillNames);
                }
                console.log('✅ Technische Skills hinzugefügt:', skillsWithRating);
            }
        }
        
        // Soft skills
        if (parsed.skills.soft && Array.isArray(parsed.skills.soft)) {
            const softContainer = document.getElementById('softSkillsContainer');
            if (softContainer) {
                softContainer.innerHTML = '';
                
                parsed.skills.soft.forEach(skill => {
                    // Neues Format: {name: "Skill", level: 8}
                    const skillName = typeof skill === 'object' ? skill.name : skill;
                    const skillLevel = typeof skill === 'object' ? skill.level : 5;
                    
                    if (typeof addSoftSkillWithRating === 'function') {
                        addSoftSkillWithRating(skillName, skillLevel);
                    } else if (typeof addSoftSkill === 'function') {
                        addSoftSkill(skillName);
                    }
                });
                console.log('✅ Soft Skills hinzugefügt:', parsed.skills.soft);
            }
        }
    }
    
    // Apply languages
    if (parsed.languages && Array.isArray(parsed.languages)) {
        const langContainer = document.getElementById('languagesContainer');
        if (langContainer) {
            langContainer.innerHTML = '';
            parsed.languages.forEach(lang => {
                if (typeof addLanguage === 'function') {
                    addLanguage(lang.language, lang.level);
                }
            });
        }
    }
    
    // Switch to manual tab
    const manualTab = document.querySelector('[data-tab="manual"]');
    if (manualTab) manualTab.click();
    
    showNotification('OCR-Daten vollständig übernommen! Bitte prüfen und ergänzen Sie die Daten.', 'success');
    
    // Hide OCR results
    document.getElementById('ocrResults').style.display = 'none';
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
        gapExplanation: document.getElementById('gapExplanation')?.value || '',
        
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
    setField('gapExplanation', data.gapExplanation);
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

// ═══════════════════════════════════════════════════════════════════════════
// SKILLS MIT BEWERTUNG (1-10 Skala)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Fügt eine technische Fähigkeit mit Bewertung hinzu
 */
function addTechnicalSkillWithRating(skillName = '', level = 5, category = '') {
    const container = document.getElementById('technicalSkillsContainer');
    if (!container) return;
    
    const skillId = 'tech-skill-rated-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    
    const skillHtml = `
        <div class="skill-item-rated" data-skill-id="${skillId}">
            <div class="skill-rated-header">
                <input type="text" class="skill-name-input" placeholder="z.B. JavaScript, Excel, SAP" value="${skillName}" data-field="skillName">
                <div class="skill-level-control">
                    <label>Level:</label>
                    <input type="range" min="1" max="10" value="${level}" data-field="skillLevel" 
                           oninput="this.nextElementSibling.textContent = this.value + '/10'">
                    <span class="skill-level-display">${level}/10</span>
                </div>
                <button type="button" class="btn-remove" onclick="removeSkillRated('${skillId}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <input type="text" class="skill-category-input" placeholder="Kategorie (z.B. Programmiersprachen, Microsoft Tools)" value="${category}" data-field="skillCategory">
        </div>
    `;
    
    container.insertAdjacentHTML('beforeend', skillHtml);
}

/**
 * Fügt eine Soft Skill mit Bewertung hinzu
 */
function addSoftSkillWithRating(skillName = '', level = 5, examples = '') {
    const container = document.getElementById('softSkillsContainer');
    if (!container) return;
    
    const skillId = 'soft-skill-rated-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    
    const skillHtml = `
        <div class="skill-item-rated soft" data-skill-id="${skillId}">
            <div class="skill-rated-header">
                <input type="text" class="skill-name-input" placeholder="z.B. Kommunikation, Teamführung" value="${skillName}" data-field="skillName">
                <div class="skill-level-control">
                    <label>Level:</label>
                    <input type="range" min="1" max="10" value="${level}" data-field="skillLevel"
                           oninput="this.nextElementSibling.textContent = this.value + '/10'">
                    <span class="skill-level-display">${level}/10</span>
                </div>
                <button type="button" class="btn-remove" onclick="removeSkillRated('${skillId}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <textarea placeholder="Konkrete Beispiele/Projekte (optional)" rows="1" data-field="examples">${examples}</textarea>
        </div>
    `;
    
    container.insertAdjacentHTML('beforeend', skillHtml);
}

function removeSkillRated(skillId) {
    const el = document.querySelector(`[data-skill-id="${skillId}"]`);
    if (el) el.remove();
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
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem; gap: 0.5rem;">
                <h4 style="margin: 0; color: #1f2937;">Projekt</h4>
                <div style="display: flex; gap: 0.5rem; align-items: center;">
                    <button type="button" class="btn-secondary ai-inline-action" data-ai-action="optimize-project" data-item-id="${projectId}">
                        <i class="fas fa-wand-magic-sparkles"></i> KI
                    </button>
                    <button type="button" class="btn-secondary ai-inline-action" data-ai-action="alternatives-project" data-item-id="${projectId}">
                        <i class="fas fa-layer-group"></i> Alternativen
                    </button>
                    <button type="button" class="btn-remove" onclick="removeProject('${projectId}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
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
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem; gap: 0.5rem;">
                <h4 style="margin: 0; color: #1f2937;">Berufserfahrung</h4>
                <div style="display: flex; gap: 0.5rem; align-items: center;">
                    <button type="button" class="btn-secondary ai-inline-action" data-ai-action="optimize-experience" data-item-id="${experienceId}">
                        <i class="fas fa-wand-magic-sparkles"></i> KI
                    </button>
                    <button type="button" class="btn-secondary ai-inline-action" data-ai-action="alternatives-experience" data-item-id="${experienceId}">
                        <i class="fas fa-layer-group"></i> Alternativen
                    </button>
                    <button type="button" class="btn-remove" onclick="removeExperience('${experienceId}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
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
                    <label>Firmen-Website <i class="fas fa-link" style="color: #6366f1;"></i></label>
                    <input type="url" data-field="companyWebsite" value="${experienceData.companyWebsite || ''}" placeholder="https://www.firma.de">
                    <small style="color: #64748b; font-size: 0.75rem;">Link wird im PDF anklickbar sein</small>
                </div>
                <div class="form-group">
                    <label>Firmenlogo</label>
                    <div style="display: flex; gap: 0.5rem; align-items: center;">
                        <input type="hidden" data-field="companyLogo" value="${experienceData.companyLogo || ''}">
                        <label class="btn-secondary" style="cursor: pointer; padding: 0.5rem 0.75rem; font-size: 0.8rem;">
                            <i class="fas fa-image"></i> Logo
                            <input type="file" accept="image/*" onchange="handleCompanyLogoUpload(this, '${experienceId}')" style="display: none;">
                        </label>
                        <span id="logo-preview-${experienceId}" style="font-size: 0.75rem; color: #64748b;">
                            ${experienceData.companyLogo ? '<i class="fas fa-check-circle" style="color: #10b981;"></i> Logo vorhanden' : 'Kein Logo'}
                        </span>
                    </div>
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
                <label>Beschreibung (Fließtext)</label>
                <textarea data-field="description" rows="3" placeholder="Kurze Beschreibung Ihrer Rolle und Hauptaufgaben...">${experienceData.description || ''}</textarea>
            </div>
            <div class="form-group" style="margin-bottom: 1rem;">
                <label>Tätigkeiten als Stichpunkte</label>
                <textarea data-field="bullets" rows="4" placeholder="- Entwicklung von Webanwendungen&#10;- Leitung eines 5-köpfigen Teams&#10;- Einführung agiler Methoden">${experienceData.bullets || ''}</textarea>
                <small style="color: #64748b; font-size: 0.75rem;">Jede Zeile wird als Stichpunkt dargestellt. Beginnen Sie mit - oder •</small>
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

// Handle company logo upload
function handleCompanyLogoUpload(input, experienceId) {
    const file = input.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
        showNotification('Bitte wählen Sie eine Bilddatei', 'error');
        return;
    }
    
    if (file.size > 2 * 1024 * 1024) {
        showNotification('Logo zu groß (max. 2MB)', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
        const experienceItem = document.querySelector(`[data-experience-id="${experienceId}"]`);
        if (experienceItem) {
            const hiddenInput = experienceItem.querySelector('[data-field="companyLogo"]');
            if (hiddenInput) {
                hiddenInput.value = e.target.result;
            }
            const preview = document.getElementById(`logo-preview-${experienceId}`);
            if (preview) {
                preview.innerHTML = '<i class="fas fa-check-circle" style="color: #10b981;"></i> Logo hochgeladen';
            }
            showNotification('Firmenlogo hochgeladen', 'success');
            
            // Update design preview if available
            if (window.designEditor) {
                window.designEditor.updatePreview();
            }
        }
    };
    reader.readAsDataURL(file);
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

// =============================================
// ATS / PLAIN TEXT EXPORT
// =============================================

function exportToPlainText() {
    try {
        const data = collectFormData();
        const text = generatePlainTextResume(data);
        const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Lebenslauf_${data.firstName || 'bewerbung'}_${data.lastName || ''}.txt`.replace(/\s+/g, '_');
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        showNotification('ATS-Text exportiert', 'success');
    } catch (error) {
        console.error('Plain text export error:', error);
        showNotification('Fehler beim Text-Export', 'error');
    }
}

function generatePlainTextResume(data) {
    const lines = [];
    const nameLine = `${data.firstName || ''} ${data.lastName || ''}`.trim();
    if (nameLine) lines.push(nameLine);
    if (data.title) lines.push(data.title);
    const contact = [data.email, data.phone, data.location || data.address].filter(Boolean).join(' | ');
    if (contact) lines.push(contact);
    lines.push('');

    if (data.summary) {
        lines.push('PROFIL');
        lines.push(data.summary);
        lines.push('');
    }

    const experience = data.sections?.find(s => s.type === 'experience')?.entries || [];
    if (experience.length) {
        lines.push('BERUFSERFAHRUNG');
        experience.forEach(exp => {
            lines.push(`${exp.position || ''} - ${exp.company || ''}`.trim());
            const period = [exp.startDate, exp.currentJob ? 'heute' : exp.endDate].filter(Boolean).join(' - ');
            if (period) lines.push(period);
            if (exp.description) lines.push(exp.description);
            if (exp.achievements?.length) {
                exp.achievements.forEach(a => lines.push(`- ${a}`));
            }
            lines.push('');
        });
    }

    const education = data.sections?.find(s => s.type === 'education')?.entries || [];
    if (education.length) {
        lines.push('AUSBILDUNG');
        education.forEach(edu => {
            lines.push(`${edu.degree || ''} - ${edu.institution || ''}`.trim());
            const period = [edu.startDate, edu.endDate].filter(Boolean).join(' - ');
            if (period) lines.push(period);
            if (edu.fieldOfStudy) lines.push(`Fachrichtung: ${edu.fieldOfStudy}`);
            lines.push('');
        });
    }

    if (data.skills?.technicalSkills?.length || data.skills?.softSkills?.length) {
        lines.push('FÄHIGKEITEN');
        data.skills.technicalSkills?.forEach(category => {
            if (category.category) lines.push(`${category.category}:`);
            if (category.skills?.length) lines.push(category.skills.join(', '));
        });
        if (data.skills.softSkills?.length) {
            lines.push(`Soft Skills: ${data.skills.softSkills.map(s => s.skill || s).join(', ')}`);
        }
        lines.push('');
    }

    if (data.languages?.length) {
        lines.push('SPRACHEN');
        data.languages.forEach(lang => {
            lines.push(`${lang.language} (${lang.proficiency || lang.level || ''})`.trim());
        });
        lines.push('');
    }

    if (data.projects?.length) {
        lines.push('PROJEKTE');
        data.projects.forEach(project => {
            lines.push(project.name || '');
            if (project.role) lines.push(project.role);
            if (project.description) lines.push(project.description);
            lines.push('');
        });
    }

    const gap = document.getElementById('gapExplanation')?.value || '';
    if (gap) {
        lines.push('KARRIEREPAUSE');
        lines.push(gap);
        lines.push('');
    }

    return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n';
}

// =============================================
// RESUME VERSIONS
// =============================================

function openResumeVersions() {
    const modal = document.getElementById('resumeVersionsModal');
    if (modal) {
        modal.classList.add('active');
        renderResumeVersions();
    }
}

function closeResumeVersions() {
    const modal = document.getElementById('resumeVersionsModal');
    if (modal) modal.classList.remove('active');
}

function saveResumeVersion() {
    const nameInput = document.getElementById('resumeVersionName');
    const name = nameInput?.value.trim() || `Version ${new Date().toLocaleDateString('de-DE')}`;
    const data = collectFormData();
    const design = JSON.parse(localStorage.getItem('resume_design_settings') || '{}');

    const versions = JSON.parse(localStorage.getItem('resume_versions') || '[]');
    versions.unshift({
        id: Date.now().toString(36),
        name,
        data,
        design,
        createdAt: new Date().toISOString()
    });
    localStorage.setItem('resume_versions', JSON.stringify(versions));
    if (nameInput) nameInput.value = '';
    renderResumeVersions();
    showNotification('Version gespeichert', 'success');
}

function renderResumeVersions() {
    const list = document.getElementById('resumeVersionsList');
    if (!list) return;
    const versions = JSON.parse(localStorage.getItem('resume_versions') || '[]');
    if (!versions.length) {
        list.innerHTML = '<p style="color:#6b7280;">Noch keine Versionen gespeichert.</p>';
        return;
    }
    list.innerHTML = versions.map(version => `
        <div class="resume-version-item">
            <div class="resume-version-meta">
                <div class="resume-version-title">${version.name}</div>
                <div class="resume-version-date">${new Date(version.createdAt).toLocaleString('de-DE')}</div>
            </div>
            <div class="resume-version-actions">
                <button type="button" onclick="loadResumeVersion('${version.id}')">Laden</button>
                    <button type="button" onclick="diffResumeVersion('${version.id}')">Diff</button>
                <button type="button" onclick="deleteResumeVersion('${version.id}')">Löschen</button>
            </div>
        </div>
    `).join('');
}

function loadResumeVersion(versionId) {
    const versions = JSON.parse(localStorage.getItem('resume_versions') || '[]');
    const version = versions.find(v => v.id === versionId);
    if (!version) return;
    populateForm(version.data || {});
    if (version.design) {
        localStorage.setItem('resume_design_settings', JSON.stringify(version.design));
    }
    closeResumeVersions();
    showNotification('Version geladen', 'success');
}

function deleteResumeVersion(versionId) {
    const versions = JSON.parse(localStorage.getItem('resume_versions') || '[]');
    const filtered = versions.filter(v => v.id !== versionId);
    localStorage.setItem('resume_versions', JSON.stringify(filtered));
    renderResumeVersions();
    showNotification('Version gelöscht', 'info');
}

function diffResumeVersion(versionId) {
    const versions = JSON.parse(localStorage.getItem('resume_versions') || '[]');
    const version = versions.find(v => v.id === versionId);
    if (!version) return;
    const currentText = generatePlainTextResume(collectFormData());
    const previousText = generatePlainTextResume(version.data || {});
    const diff = buildSimpleDiff(previousText, currentText);
    const container = document.getElementById('resumeVersionDiff');
    if (container) container.textContent = diff;
}

function buildSimpleDiff(oldText, newText) {
    const oldLines = oldText.split('\n').map(l => l.trim()).filter(Boolean);
    const newLines = newText.split('\n').map(l => l.trim()).filter(Boolean);
    const oldSet = new Set(oldLines);
    const newSet = new Set(newLines);
    const removed = oldLines.filter(l => !newSet.has(l)).map(l => `- ${l}`);
    const added = newLines.filter(l => !oldSet.has(l)).map(l => `+ ${l}`);
    return [...removed, ...added].slice(0, 200).join('\n') || 'Keine Unterschiede gefunden.';
}

// =============================================
// KI & ATS OPTIMIERUNG
// =============================================

async function getOpenAIKey() {
    if (window.awsAPISettings) {
        try {
            const key = await window.awsAPISettings.getFullApiKey('openai');
            if (key && !key.includes('...')) return key;
        } catch (e) {
            console.warn('AWS API Settings error:', e);
        }
    }
    try {
        const globalKeys = JSON.parse(localStorage.getItem('global_api_keys') || '{}');
        if (globalKeys.openai?.key && !globalKeys.openai.key.includes('...')) {
            return globalKeys.openai.key;
        }
    } catch (e) {}
    return null;
}

async function callOpenAI(messages, apiKey, opts = {}) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: opts.model || 'gpt-3.5-turbo',
            messages,
            temperature: opts.temperature ?? 0.6,
            max_tokens: opts.maxTokens ?? 500
        })
    });
    if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
    }
    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
}

function getResumeTextForATS() {
    const data = collectFormData();
    const experienceText = data.sections?.find(s => s.type === 'experience')?.entries
        ?.map(e => [e.position, e.company, e.description, ...(e.achievements || [])].join(' '))
        .join(' ') || '';
    const projectText = (data.projects || [])
        .map(p => [p.name, p.description, ...(p.achievements || [])].join(' '))
        .join(' ');
    const skillText = [
        ...(data.skills?.technicalSkills || []).flatMap(c => c.skills || []),
        ...(data.skills?.softSkills || []).map(s => s.skill || '')
    ].join(' ');
    const gapText = document.getElementById('gapExplanation')?.value || '';
    return [data.summary, experienceText, projectText, skillText, gapText].join(' ').trim();
}

function tokenize(text, minLen = 4) {
    return text
        .toLowerCase()
        .replace(/[^a-zäöüß0-9\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length >= minLen);
}

function findDuplicateSentences(text) {
    const sentences = text.split(/[.!?]\s+/).map(s => s.trim().toLowerCase()).filter(Boolean);
    const seen = new Set();
    const duplicates = [];
    sentences.forEach(sentence => {
        if (seen.has(sentence)) duplicates.push(sentence);
        else seen.add(sentence);
    });
    return duplicates;
}

function detectTenseMix(text) {
    const present = /(verantworte|entwickle|betreue|steuere|baue|führe)/i.test(text);
    const past = /(verantwortete|entwickelte|betreute|steuerte|baute|führte)/i.test(text);
    return present && past;
}

function renderAiResult(containerId, html) {
    const container = document.getElementById(containerId);
    if (container) container.innerHTML = html;
}

function runAtsCheck() {
    const jobDescription = document.getElementById('atsJobDescription')?.value || '';
    const resumeText = getResumeTextForATS();
    const keywords = Array.from(new Set(tokenize(jobDescription, 5))).slice(0, 20);
    if (!keywords.length) {
        renderAiResult('atsResult', '<p>Bitte zuerst eine Stellenbeschreibung einfügen.</p>');
        return;
    }
    const lower = resumeText.toLowerCase();
    const hits = keywords.filter(word => lower.includes(word));
    const missing = keywords.filter(word => !lower.includes(word));
    const score = Math.round((hits.length / keywords.length) * 100);
    const duplicates = findDuplicateSentences(resumeText);
    const tenseMix = detectTenseMix(resumeText);

    renderAiResult('atsResult', `
        <strong>ATS-Match: ${score}%</strong>
        <div><strong>Treffer:</strong> ${hits.slice(0, 8).join(', ') || '—'}</div>
        <div><strong>Fehlend:</strong> ${missing.slice(0, 8).join(', ') || '—'}</div>
        <div><strong>Doppelte Sätze:</strong> ${duplicates.length}</div>
        <div><strong>Zeitform-Mix:</strong> ${tenseMix ? 'Ja' : 'Nein'}</div>
    `);
}

async function generateSummary() {
    const apiKey = await getOpenAIKey();
    if (!apiKey) {
        renderAiResult('aiSuggestions', '<p>Kein API-Key gefunden.</p>');
        return;
    }
    const data = collectFormData();
    const skills = [
        ...(data.skills?.technicalSkills || []).flatMap(c => c.skills || []),
        ...(data.skills?.softSkills || []).map(s => s.skill || '')
    ].filter(Boolean).slice(0, 10);
    const prompt = `
Schreibe ein Kurzprofil (2-3 Sätze) für einen Lebenslauf.
Rolle: ${data.title}
Skills: ${skills.join(', ')}
Schreibe professionell, ATS-tauglich, auf Deutsch.
`;
    const content = await callOpenAI([
        { role: 'system', content: 'Du bist ein professioneller Bewerbungsberater. Antworte auf Deutsch.' },
        { role: 'user', content: prompt }
    ], apiKey, { maxTokens: 200 });
    const summary = content.trim();
    document.getElementById('summary').value = summary;
    renderAiResult('aiSuggestions', `<strong>Kurzprofil</strong><div>${summary}</div>`);
}

async function improveSummary() {
    const apiKey = await getOpenAIKey();
    const summary = document.getElementById('summary')?.value || '';
    if (!summary) return;
    if (!apiKey) {
        renderAiResult('aiSuggestions', '<p>Kein API-Key gefunden.</p>');
        return;
    }
    const prompt = `
Verbessere dieses Kurzprofil für einen Lebenslauf (klarer, prägnanter, aktive Verben):
"""${summary}"""
Gib nur die verbesserte Version zurück.
`;
    const content = await callOpenAI([
        { role: 'system', content: 'Du bist ein professioneller Bewerbungsberater. Antworte auf Deutsch.' },
        { role: 'user', content: prompt }
    ], apiKey, { maxTokens: 200 });
    document.getElementById('summary').value = content.trim();
    renderAiResult('aiSuggestions', '<strong>Kurzprofil verbessert</strong>');
}

async function optimizeExperienceItem(itemId) {
    const item = document.querySelector(`[data-experience-id="${itemId}"]`);
    if (!item) return;
    const apiKey = await getOpenAIKey();
    const position = item.querySelector('[data-field="position"]')?.value || '';
    const company = item.querySelector('[data-field="company"]')?.value || '';
    const description = item.querySelector('[data-field="description"]')?.value || '';
    const achievements = Array.from(item.querySelectorAll('.achievement-item input')).map(i => i.value).filter(Boolean);
    if (!apiKey) {
        renderAiResult('aiSuggestions', '<p>Kein API-Key gefunden.</p>');
        return;
    }
    const prompt = `
Optimiere die Erfahrung für einen Lebenslauf.
Position: ${position}
Firma: ${company}
Beschreibung: ${description}
Erfolge: ${achievements.join(' | ')}
Gib JSON zurück: {"description":"...","achievements":["...","..."]}.
`;
    const content = await callOpenAI([
        { role: 'system', content: 'Du bist ein professioneller Bewerbungsberater. Antworte auf Deutsch.' },
        { role: 'user', content: prompt }
    ], apiKey, { maxTokens: 300 });
    try {
        const parsed = JSON.parse(content);
        if (parsed.description) item.querySelector('[data-field="description"]').value = parsed.description;
        if (Array.isArray(parsed.achievements)) {
            const container = item.querySelector(`#achievements-exp-${itemId}`);
            if (container) {
                container.querySelectorAll('.achievement-item').forEach(el => el.remove());
                parsed.achievements.forEach(text => {
                    const html = `
                        <div class="achievement-item">
                            <input type="text" value="${text}">
                            <button type="button" onclick="removeAchievement(this)" style="background: #ef4444; color: white; border: none; padding: 0.5rem; border-radius: 4px; cursor: pointer;">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    `;
                    container.insertAdjacentHTML('afterbegin', html);
                });
                if (!container.querySelector('.btn-add')) {
                    container.insertAdjacentHTML('beforeend', `<button type="button" onclick="addAchievement('exp-${itemId}')" class="btn-add" style="margin-top: 0.5rem;"><i class="fas fa-plus"></i> Achievement</button>`);
                }
            }
        }
        renderAiResult('aiSuggestions', '<strong>Erfahrung optimiert</strong>');
    } catch (e) {
        renderAiResult('aiSuggestions', '<p>KI-Antwort konnte nicht gelesen werden.</p>');
    }
}

async function alternativesExperienceItem(itemId) {
    const item = document.querySelector(`[data-experience-id="${itemId}"]`);
    if (!item) return;
    const apiKey = await getOpenAIKey();
    const description = item.querySelector('[data-field="description"]')?.value || '';
    if (!apiKey) {
        renderAiResult('aiSuggestions', '<p>Kein API-Key gefunden.</p>');
        return;
    }
    const prompt = `
Erstelle 3 alternative Varianten für diesen Lebenslauf-Abschnitt:
"""${description}"""
Gib ein JSON-Array zurück.
`;
    const content = await callOpenAI([
        { role: 'system', content: 'Du bist ein professioneller Bewerbungsberater. Antworte auf Deutsch.' },
        { role: 'user', content: prompt }
    ], apiKey, { maxTokens: 250 });
    let suggestions = [];
    try {
        suggestions = JSON.parse(content);
    } catch (e) {
        suggestions = content.split('\n').filter(Boolean).slice(0, 3);
    }
    renderAiResult('aiSuggestions', suggestions.map((s, idx) => `
        <div style="margin-bottom:0.5rem;">
            <div>${s}</div>
            <button type="button" class="btn-secondary" data-apply="exp-desc" data-item-id="${itemId}" data-idx="${idx}">Übernehmen</button>
        </div>
    `).join(''));
    document.querySelectorAll('[data-apply="exp-desc"]').forEach(btn => {
        btn.addEventListener('click', () => {
            const idx = Number(btn.dataset.idx);
            const text = suggestions[idx];
            if (text) item.querySelector('[data-field="description"]').value = text;
        });
    });
}

async function optimizeProjectItem(itemId) {
    const item = document.querySelector(`[data-project-id="${itemId}"]`);
    if (!item) return;
    const apiKey = await getOpenAIKey();
    const name = item.querySelector('[data-field="name"]')?.value || '';
    const description = item.querySelector('[data-field="description"]')?.value || '';
    const achievements = Array.from(item.querySelectorAll('.achievement-item input')).map(i => i.value).filter(Boolean);
    if (!apiKey) {
        renderAiResult('aiSuggestions', '<p>Kein API-Key gefunden.</p>');
        return;
    }
    const prompt = `
Optimiere dieses Projekt für einen Lebenslauf.
Projekt: ${name}
Beschreibung: ${description}
Erfolge: ${achievements.join(' | ')}
Gib JSON zurück: {"description":"...","achievements":["...","..."]}.
`;
    const content = await callOpenAI([
        { role: 'system', content: 'Du bist ein professioneller Bewerbungsberater. Antworte auf Deutsch.' },
        { role: 'user', content: prompt }
    ], apiKey, { maxTokens: 300 });
    try {
        const parsed = JSON.parse(content);
        if (parsed.description) item.querySelector('[data-field="description"]').value = parsed.description;
        if (Array.isArray(parsed.achievements)) {
            const container = item.querySelector(`#achievements-${itemId}`);
            if (container) {
                container.querySelectorAll('.achievement-item').forEach(el => el.remove());
                parsed.achievements.forEach(text => {
                    const html = `
                        <div class="achievement-item">
                            <input type="text" value="${text}">
                            <button type="button" onclick="removeAchievement(this)" style="background: #ef4444; color: white; border: none; padding: 0.5rem; border-radius: 4px; cursor: pointer;">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    `;
                    container.insertAdjacentHTML('afterbegin', html);
                });
                if (!container.querySelector('.btn-add')) {
                    container.insertAdjacentHTML('beforeend', `<button type="button" onclick="addAchievement('${itemId}')" class="btn-add" style="margin-top: 0.5rem;"><i class="fas fa-plus"></i> Achievement</button>`);
                }
            }
        }
        renderAiResult('aiSuggestions', '<strong>Projekt optimiert</strong>');
    } catch (e) {
        renderAiResult('aiSuggestions', '<p>KI-Antwort konnte nicht gelesen werden.</p>');
    }
}

async function alternativesProjectItem(itemId) {
    const item = document.querySelector(`[data-project-id="${itemId}"]`);
    if (!item) return;
    const apiKey = await getOpenAIKey();
    const description = item.querySelector('[data-field="description"]')?.value || '';
    if (!apiKey) {
        renderAiResult('aiSuggestions', '<p>Kein API-Key gefunden.</p>');
        return;
    }
    const prompt = `
Erstelle 3 alternative Varianten für diesen Projekt-Abschnitt:
"""${description}"""
Gib ein JSON-Array zurück.
`;
    const content = await callOpenAI([
        { role: 'system', content: 'Du bist ein professioneller Bewerbungsberater. Antworte auf Deutsch.' },
        { role: 'user', content: prompt }
    ], apiKey, { maxTokens: 250 });
    let suggestions = [];
    try {
        suggestions = JSON.parse(content);
    } catch (e) {
        suggestions = content.split('\n').filter(Boolean).slice(0, 3);
    }
    renderAiResult('aiSuggestions', suggestions.map((s, idx) => `
        <div style="margin-bottom:0.5rem;">
            <div>${s}</div>
            <button type="button" class="btn-secondary" data-apply="proj-desc" data-item-id="${itemId}" data-idx="${idx}">Übernehmen</button>
        </div>
    `).join(''));
    document.querySelectorAll('[data-apply="proj-desc"]').forEach(btn => {
        btn.addEventListener('click', () => {
            const idx = Number(btn.dataset.idx);
            const text = suggestions[idx];
            if (text) item.querySelector('[data-field="description"]').value = text;
        });
    });
}

function quantifyCheck() {
    const data = collectFormData();
    const exp = data.sections?.find(s => s.type === 'experience')?.entries || [];
    const proj = data.projects || [];
    const hasNumbers = (exp.some(e => /\d/.test(e.description || '') || (e.achievements || []).some(a => /\d/.test(a))) ||
        proj.some(p => /\d/.test(p.description || '') || (p.achievements || []).some(a => /\d/.test(a))));
    renderAiResult('aiSuggestions', hasNumbers
        ? '<strong>Quantifizierung vorhanden</strong>'
        : '<strong>Keine Kennzahlen gefunden</strong><div>Füge Zahlen/Prozente/Zeiten hinzu.</div>');
}

function clusterSkills() {
    const data = collectFormData();
    const allSkills = [
        ...(data.skills?.technicalSkills || []).flatMap(c => c.skills || []),
        ...(data.skills?.softSkills || []).map(s => s.skill || '')
    ].map(s => s.trim()).filter(Boolean);
    if (!allSkills.length) {
        renderAiResult('aiSuggestions', '<p>Keine Skills gefunden.</p>');
        return;
    }
    const clusters = {
        'Frontend': ['react', 'vue', 'angular', 'html', 'css', 'javascript', 'typescript'],
        'Backend': ['node', 'java', 'python', 'go', 'c#', 'php', 'sql'],
        'DevOps': ['docker', 'kubernetes', 'aws', 'gcp', 'azure', 'ci', 'cd'],
        'Data': ['sql', 'pandas', 'spark', 'ml', 'ai', 'data'],
        'Management': ['lead', 'management', 'projekt', 'scrum', 'agile']
    };
    const grouped = {};
    allSkills.forEach(skill => {
        const lower = skill.toLowerCase();
        let matched = false;
        Object.entries(clusters).forEach(([group, keywords]) => {
            if (keywords.some(k => lower.includes(k))) {
                grouped[group] = grouped[group] || [];
                grouped[group].push(skill);
                matched = true;
            }
        });
        if (!matched) {
            grouped['Weitere'] = grouped['Weitere'] || [];
            grouped['Weitere'].push(skill);
        }
    });
    const container = document.getElementById('technicalSkillsContainer');
    if (container) container.innerHTML = '';
    Object.entries(grouped).forEach(([group, skills]) => {
        addTechnicalSkillCategory(group, Array.from(new Set(skills)));
    });
    renderAiResult('aiSuggestions', '<strong>Skills neu gruppiert</strong>');
}

async function generateGapExplanation() {
    const apiKey = await getOpenAIKey();
    if (!apiKey) {
        renderAiResult('aiSuggestions', '<p>Kein API-Key gefunden.</p>');
        return;
    }
    const prompt = `
Schreibe einen kurzen, professionellen Absatz (1-2 Sätze), um eine Karrierepause neutral zu erklären.
Betone Weiterbildung, persönliche Gründe oder Projekte ohne zu viele Details.
`;
    const content = await callOpenAI([
        { role: 'system', content: 'Du bist ein professioneller Bewerbungsberater. Antworte auf Deutsch.' },
        { role: 'user', content: prompt }
    ], apiKey, { maxTokens: 150 });
    document.getElementById('gapExplanation').value = content.trim();
    renderAiResult('aiSuggestions', '<strong>Lücken-Erklärung eingefügt</strong>');
}

async function translateResumeToEnglish() {
    const apiKey = await getOpenAIKey();
    if (!apiKey) {
        renderAiResult('aiSuggestions', '<p>Kein API-Key gefunden.</p>');
        return;
    }
    const data = collectFormData();
    const payload = {
        summary: data.summary || '',
        experience: (data.sections?.find(s => s.type === 'experience')?.entries || []).map(e => ({
            description: e.description || '',
            achievements: e.achievements || []
        })),
        projects: (data.projects || []).map(p => ({
            description: p.description || '',
            achievements: p.achievements || []
        })),
        gap: document.getElementById('gapExplanation')?.value || ''
    };
    const prompt = `
Übersetze folgende Inhalte ins Englische. Gib JSON im gleichen Format zurück.
${JSON.stringify(payload)}
`;
    const content = await callOpenAI([
        { role: 'system', content: 'You are a professional resume editor. Return JSON only.' },
        { role: 'user', content: prompt }
    ], apiKey, { maxTokens: 700 });
    try {
        const parsed = JSON.parse(content);
        if (parsed.summary) document.getElementById('summary').value = parsed.summary;
        parsed.experience?.forEach((entry, idx) => {
            const item = document.querySelectorAll('.experience-item')[idx];
            if (!item) return;
            if (entry.description) item.querySelector('[data-field="description"]').value = entry.description;
            const achInputs = item.querySelectorAll('.achievement-item input');
            entry.achievements?.forEach((a, i) => {
                if (achInputs[i]) achInputs[i].value = a;
            });
        });
        parsed.projects?.forEach((entry, idx) => {
            const item = document.querySelectorAll('.project-item')[idx];
            if (!item) return;
            if (entry.description) item.querySelector('[data-field="description"]').value = entry.description;
            const achInputs = item.querySelectorAll('.achievement-item input');
            entry.achievements?.forEach((a, i) => {
                if (achInputs[i]) achInputs[i].value = a;
            });
        });
        if (parsed.gap) document.getElementById('gapExplanation').value = parsed.gap;
        renderAiResult('aiSuggestions', '<strong>EN-Version erzeugt</strong>');
    } catch (e) {
        renderAiResult('aiSuggestions', '<p>Übersetzung fehlgeschlagen.</p>');
    }
}

function setupResumeAiTools() {
    document.getElementById('runAtsCheckBtn')?.addEventListener('click', runAtsCheck);
    document.getElementById('generateSummaryBtn')?.addEventListener('click', generateSummary);
    document.getElementById('improveSummaryBtn')?.addEventListener('click', improveSummary);
    document.getElementById('optimizeExperienceBtn')?.addEventListener('click', async () => {
        const items = document.querySelectorAll('.experience-item');
        for (const item of items) {
            await optimizeExperienceItem(item.dataset.experienceId);
        }
    });
    document.getElementById('optimizeProjectsBtn')?.addEventListener('click', async () => {
        const items = document.querySelectorAll('.project-item');
        for (const item of items) {
            await optimizeProjectItem(item.dataset.projectId);
        }
    });
    document.getElementById('quantifyAchievementsBtn')?.addEventListener('click', quantifyCheck);
    document.getElementById('clusterSkillsBtn')?.addEventListener('click', clusterSkills);
    document.getElementById('generateGapBtn')?.addEventListener('click', generateGapExplanation);
    document.getElementById('translateResumeBtn')?.addEventListener('click', translateResumeToEnglish);

    document.addEventListener('click', async (event) => {
        const button = event.target.closest('.ai-inline-action');
        if (!button) return;
        const action = button.dataset.aiAction;
        const itemId = button.dataset.itemId;
        if (action === 'optimize-experience') await optimizeExperienceItem(itemId);
        if (action === 'alternatives-experience') await alternativesExperienceItem(itemId);
        if (action === 'optimize-project') await optimizeProjectItem(itemId);
        if (action === 'alternatives-project') await alternativesProjectItem(itemId);
    });
}

// Load resume on page load
document.addEventListener('DOMContentLoaded', () => {
    loadResume();
    initAllDragAndDrop();
    setupResumeAiTools();
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
        .entry-company a {
            color: ${primaryColor};
            text-decoration: underline;
        }
        .entry-company-logo {
            height: 18px;
            width: auto;
            vertical-align: middle;
            margin-right: 6px;
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
        ${experience.map(exp => {
            // Build company name with optional logo and link
            let companyHtml = exp.company || '';
            if (exp.companyLogo) {
                companyHtml = `<img src="${exp.companyLogo}" class="entry-company-logo" alt="">` + companyHtml;
            }
            if (exp.companyWebsite) {
                companyHtml = `<a href="${exp.companyWebsite}" target="_blank">${companyHtml}</a>`;
            }
            if (exp.location) {
                companyHtml += `, ${exp.location}`;
            }
            
            // Build description with optional bullets
            let descHtml = '';
            if (exp.description) {
                descHtml += `<div class="entry-description">${exp.description}</div>`;
            }
            if (exp.bullets) {
                const bulletLines = exp.bullets.split('\\n').filter(b => b.trim());
                if (bulletLines.length > 0) {
                    descHtml += `<ul class="entry-bullets" style="margin: 5px 0 0 20px; padding: 0; font-size: 10pt; color: #374151;">
                        ${bulletLines.map(b => `<li style="margin-bottom: 2px;">${b.replace(/^[-•*]\\s*/, '')}</li>`).join('')}
                    </ul>`;
                }
            }
            
            return `
        <div class="experience-entry">
            <div class="entry-header">
                <span class="entry-title">${exp.position || ''}</span>
                <span class="entry-date">${formatDate(exp.startDate)} - ${exp.currentJob ? 'heute' : formatDate(exp.endDate)}</span>
            </div>
            <div class="entry-company">${companyHtml}</div>
            ${descHtml}
        </div>`;
        }).join('')}
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
window.exportToPlainText = exportToPlainText;
window.openStyleEditor = openStyleEditor;
window.closeStyleEditor = closeStyleEditor;
window.selectTemplate = selectTemplate;
window.saveStyleSettings = saveStyleSettings;
window.previewStyle = previewStyle;
window.openResumeVersions = openResumeVersions;
window.closeResumeVersions = closeResumeVersions;
window.saveResumeVersion = saveResumeVersion;
window.loadResumeVersion = loadResumeVersion;
window.deleteResumeVersion = deleteResumeVersion;