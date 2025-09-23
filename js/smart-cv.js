// Smart CV Editor and Generator

// CV Data Structure
let cvData = {
    personalInfo: {
        name: "Manuel Weiß",
        title: "HR-Experte & Digitalisierungsberater",
        address: "Musterstraße 123, 12345 Musterstadt",
        phone: "+49 123 456 789",
        email: "manuel.weiss@example.com",
        linkedin: "linkedin.com/in/manuelweiss",
        photo: null
    },
    sections: [
        {
            id: "berufserfahrung",
            title: "Berufserfahrung",
            type: "experience",
            entries: [
                {
                    id: "exp1",
                    position: "Senior HR Consultant",
                    company: "ABC Consulting GmbH",
                    location: "München",
                    startDate: "2020-01",
                    endDate: "heute",
                    current: true,
                    description: [
                        "Beratung von Großunternehmen bei der digitalen Transformation ihrer HR-Prozesse",
                        "Implementierung von SAP SuccessFactors und Workday Lösungen",
                        "Führung von Projektteams mit bis zu 15 Mitarbeitern"
                    ]
                },
                {
                    id: "exp2",
                    position: "HR Manager",
                    company: "XYZ AG",
                    location: "Frankfurt",
                    startDate: "2015-03",
                    endDate: "2019-12",
                    current: false,
                    description: [
                        "Verantwortlich für die Personalentwicklung von 500+ Mitarbeitern",
                        "Digitalisierung der HR-Abteilung und Einführung agiler Arbeitsmethoden",
                        "Entwicklung und Umsetzung von Talent Management Strategien"
                    ]
                }
            ]
        },
        {
            id: "ausbildung",
            title: "Ausbildung",
            type: "education",
            entries: [
                {
                    id: "edu1",
                    degree: "Master of Business Administration",
                    institution: "Universität München",
                    location: "München",
                    startDate: "2012-09",
                    endDate: "2014-07",
                    grade: "1.3",
                    description: ["Schwerpunkt: Human Resource Management & Digitalization"]
                },
                {
                    id: "edu2",
                    degree: "Bachelor of Arts Betriebswirtschaftslehre",
                    institution: "Hochschule für Angewandte Wissenschaften",
                    location: "Hamburg",
                    startDate: "2009-09",
                    endDate: "2012-07",
                    grade: "1.8",
                    description: ["Schwerpunkt: Personalwesen"]
                }
            ]
        },
        {
            id: "kompetenzen",
            title: "Kompetenzen",
            type: "skills",
            entries: [
                {
                    category: "HR-Software",
                    skills: ["SAP SuccessFactors", "Workday", "Personio", "BambooHR"]
                },
                {
                    category: "Methodiken",
                    skills: ["Agile HR", "Design Thinking", "Change Management", "OKRs"]
                },
                {
                    category: "Sprachen",
                    skills: ["Deutsch (Muttersprache)", "Englisch (Verhandlungssicher)", "Französisch (Grundkenntnisse)"]
                }
            ]
        }
    ]
};

// Generate editable CV
function generateEditableCV() {
    const cvPreview = document.getElementById('cvPreview');
    if (!cvPreview) return;
    
    cvPreview.innerHTML = `
        <div class="cv-container" style="background: white; padding: 2rem; border-radius: 8px; max-width: 800px; margin: 0 auto; font-family: Arial, sans-serif; line-height: 1.6;">
            <!-- Header -->
            <div class="cv-header" style="text-align: center; margin-bottom: 2rem; padding-bottom: 1rem; border-bottom: 2px solid #6366f1;">
                <h1 contenteditable="true" data-field="personalInfo.name" style="margin: 0; font-size: 2rem; color: #333; outline: none;">${cvData.personalInfo.name}</h1>
                <h2 contenteditable="true" data-field="personalInfo.title" style="margin: 0.5rem 0; font-size: 1.25rem; color: #666; font-weight: normal; outline: none;">${cvData.personalInfo.title}</h2>
                
                <div style="display: flex; justify-content: center; gap: 2rem; margin-top: 1rem; flex-wrap: wrap; font-size: 0.9rem;">
                    <span contenteditable="true" data-field="personalInfo.email" style="outline: none;">${cvData.personalInfo.email}</span>
                    <span contenteditable="true" data-field="personalInfo.phone" style="outline: none;">${cvData.personalInfo.phone}</span>
                    <span contenteditable="true" data-field="personalInfo.linkedin" style="outline: none;">${cvData.personalInfo.linkedin}</span>
                </div>
            </div>
            
            <!-- Sections -->
            <div class="cv-sections">
                ${cvData.sections.map(section => generateSectionHTML(section)).join('')}
            </div>
            
            <!-- Add Section Button -->
            <div style="text-align: center; margin-top: 2rem;">
                <button onclick="addNewSection()" style="padding: 0.75rem 1.5rem; background: #6366f1; color: white; border: none; border-radius: 6px; cursor: pointer;">
                    <i class="fas fa-plus"></i> Sektion hinzufügen
                </button>
            </div>
        </div>
        
        <!-- CV Controls -->
        <div class="cv-controls" style="margin-top: 2rem; text-align: center;">
            <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                <button onclick="exportCVAsPDF()" style="padding: 0.75rem 1.5rem; background: #ef4444; color: white; border: none; border-radius: 6px; cursor: pointer;">
                    <i class="fas fa-file-pdf"></i> PDF exportieren
                </button>
                <button onclick="saveCVData()" style="padding: 0.75rem 1.5rem; background: #10b981; color: white; border: none; border-radius: 6px; cursor: pointer;">
                    <i class="fas fa-save"></i> Speichern
                </button>
                <button onclick="resetCV()" style="padding: 0.75rem 1.5rem; background: #6b7280; color: white; border: none; border-radius: 6px; cursor: pointer;">
                    <i class="fas fa-undo"></i> Zurücksetzen
                </button>
            </div>
        </div>
    `;
    
    // Initialize edit listeners
    initializeCVEditListeners();
}

function generateSectionHTML(section) {
    switch (section.type) {
        case 'experience':
            return generateExperienceSection(section);
        case 'education':
            return generateEducationSection(section);
        case 'skills':
            return generateSkillsSection(section);
        default:
            return '';
    }
}

function generateExperienceSection(section) {
    return `
        <div class="cv-section" data-section-id="${section.id}" style="margin-bottom: 2rem;">
            <h3 contenteditable="true" data-field="sections.${section.id}.title" style="color: #6366f1; margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 1px solid #e5e7eb; outline: none;">
                ${section.title}
            </h3>
            
            ${section.entries.map(entry => `
                <div class="experience-entry" data-entry-id="${entry.id}" style="margin-bottom: 1.5rem; position: relative;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
                        <div style="flex: 1;">
                            <h4 contenteditable="true" data-field="position" style="margin: 0; font-size: 1.1rem; color: #333; outline: none;">${entry.position}</h4>
                            <p contenteditable="true" data-field="company" style="margin: 0.25rem 0; font-weight: 600; color: #666; outline: none;">${entry.company}</p>
                            <p contenteditable="true" data-field="location" style="margin: 0; font-size: 0.9rem; color: #999; outline: none;">${entry.location}</p>
                        </div>
                        <div style="text-align: right;">
                            <span contenteditable="true" data-field="dateRange" style="font-size: 0.9rem; color: #666; outline: none;">${formatDateRange(entry.startDate, entry.endDate, entry.current)}</span>
                            <button onclick="removeEntry('${section.id}', '${entry.id}')" style="display: block; margin-top: 0.5rem; padding: 0.25rem; background: #ef4444; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 0.8rem;">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    
                    <ul style="margin: 0.5rem 0; padding-left: 1.5rem;">
                        ${entry.description.map((desc, index) => `
                            <li contenteditable="true" data-field="description.${index}" style="margin-bottom: 0.25rem; outline: none;">${desc}</li>
                        `).join('')}
                    </ul>
                    
                    <button onclick="addDescriptionPoint('${section.id}', '${entry.id}')" style="margin-top: 0.5rem; padding: 0.25rem 0.5rem; background: #8b5cf6; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 0.8rem;">
                        <i class="fas fa-plus"></i> Punkt hinzufügen
                    </button>
                </div>
            `).join('')}
            
            <button onclick="addExperienceEntry('${section.id}')" style="padding: 0.5rem 1rem; background: #10b981; color: white; border: none; border-radius: 4px; cursor: pointer; margin-top: 1rem;">
                <i class="fas fa-plus"></i> Position hinzufügen
            </button>
        </div>
    `;
}

function generateEducationSection(section) {
    return `
        <div class="cv-section" data-section-id="${section.id}" style="margin-bottom: 2rem;">
            <h3 contenteditable="true" data-field="sections.${section.id}.title" style="color: #6366f1; margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 1px solid #e5e7eb; outline: none;">
                ${section.title}
            </h3>
            
            ${section.entries.map(entry => `
                <div class="education-entry" data-entry-id="${entry.id}" style="margin-bottom: 1.5rem; position: relative;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
                        <div style="flex: 1;">
                            <h4 contenteditable="true" data-field="degree" style="margin: 0; font-size: 1.1rem; color: #333; outline: none;">${entry.degree}</h4>
                            <p contenteditable="true" data-field="institution" style="margin: 0.25rem 0; font-weight: 600; color: #666; outline: none;">${entry.institution}</p>
                            <p contenteditable="true" data-field="location" style="margin: 0; font-size: 0.9rem; color: #999; outline: none;">${entry.location}</p>
                            ${entry.grade ? `<p contenteditable="true" data-field="grade" style="margin: 0.25rem 0; font-size: 0.9rem; color: #666; outline: none;">Note: ${entry.grade}</p>` : ''}
                        </div>
                        <div style="text-align: right;">
                            <span contenteditable="true" data-field="dateRange" style="font-size: 0.9rem; color: #666; outline: none;">${formatDateRange(entry.startDate, entry.endDate)}</span>
                            <button onclick="removeEntry('${section.id}', '${entry.id}')" style="display: block; margin-top: 0.5rem; padding: 0.25rem; background: #ef4444; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 0.8rem;">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    
                    ${entry.description && entry.description.length > 0 ? `
                        <ul style="margin: 0.5rem 0; padding-left: 1.5rem;">
                            ${entry.description.map((desc, index) => `
                                <li contenteditable="true" data-field="description.${index}" style="margin-bottom: 0.25rem; outline: none;">${desc}</li>
                            `).join('')}
                        </ul>
                    ` : ''}
                </div>
            `).join('')}
            
            <button onclick="addEducationEntry('${section.id}')" style="padding: 0.5rem 1rem; background: #10b981; color: white; border: none; border-radius: 4px; cursor: pointer; margin-top: 1rem;">
                <i class="fas fa-plus"></i> Ausbildung hinzufügen
            </button>
        </div>
    `;
}

function generateSkillsSection(section) {
    return `
        <div class="cv-section" data-section-id="${section.id}" style="margin-bottom: 2rem;">
            <h3 contenteditable="true" data-field="sections.${section.id}.title" style="color: #6366f1; margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 1px solid #e5e7eb; outline: none;">
                ${section.title}
            </h3>
            
            ${section.entries.map((entry, entryIndex) => `
                <div class="skills-category" data-entry-index="${entryIndex}" style="margin-bottom: 1rem;">
                    <h4 contenteditable="true" data-field="category" style="margin: 0 0 0.5rem 0; font-size: 1rem; color: #333; outline: none;">${entry.category}</h4>
                    <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                        ${entry.skills.map((skill, skillIndex) => `
                            <span contenteditable="true" data-field="skills.${skillIndex}" style="background: #f3f4f6; padding: 0.25rem 0.75rem; border-radius: 15px; font-size: 0.9rem; outline: none;">${skill}</span>
                        `).join('')}
                        <button onclick="addSkill('${section.id}', ${entryIndex})" style="background: #6366f1; color: white; border: none; border-radius: 15px; padding: 0.25rem 0.75rem; cursor: pointer; font-size: 0.8rem;">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                </div>
            `).join('')}
            
            <button onclick="addSkillCategory('${section.id}')" style="padding: 0.5rem 1rem; background: #10b981; color: white; border: none; border-radius: 4px; cursor: pointer; margin-top: 1rem;">
                <i class="fas fa-plus"></i> Kategorie hinzufügen
            </button>
        </div>
    `;
}

function formatDateRange(startDate, endDate, current = false) {
    const start = new Date(startDate).toLocaleDateString('de-DE', { month: '2-digit', year: 'numeric' });
    if (current) return `${start} - heute`;
    const end = new Date(endDate).toLocaleDateString('de-DE', { month: '2-digit', year: 'numeric' });
    return `${start} - ${end}`;
}

function initializeCVEditListeners() {
    // Initialize contenteditable listeners
    const editableElements = document.querySelectorAll('[contenteditable="true"]');
    editableElements.forEach(element => {
        element.addEventListener('blur', function() {
            updateCVData(this);
        });
        
        // Highlight on focus
        element.addEventListener('focus', function() {
            this.style.backgroundColor = '#f0f9ff';
        });
        
        element.addEventListener('blur', function() {
            this.style.backgroundColor = '';
        });
    });
}

function updateCVData(element) {
    const field = element.dataset.field;
    const value = element.textContent || element.innerText;
    
    // Update cvData based on field path
    // This is a simplified version - in a real app, you'd have proper path parsing
    console.log(`Updating ${field} to: ${value}`);
    
    // Auto-save
    saveCVData();
}

// CV Management Functions
function addExperienceEntry(sectionId) {
    const newEntry = {
        id: 'exp' + Date.now(),
        position: 'Neue Position',
        company: 'Unternehmen',
        location: 'Ort',
        startDate: new Date().toISOString().slice(0, 7),
        endDate: new Date().toISOString().slice(0, 7),
        current: false,
        description: ['Beschreibung der Tätigkeit']
    };
    
    const section = cvData.sections.find(s => s.id === sectionId);
    if (section) {
        section.entries.push(newEntry);
        generateEditableCV();
    }
}

function addEducationEntry(sectionId) {
    const newEntry = {
        id: 'edu' + Date.now(),
        degree: 'Abschluss',
        institution: 'Institution',
        location: 'Ort',
        startDate: new Date().toISOString().slice(0, 7),
        endDate: new Date().toISOString().slice(0, 7),
        grade: '',
        description: []
    };
    
    const section = cvData.sections.find(s => s.id === sectionId);
    if (section) {
        section.entries.push(newEntry);
        generateEditableCV();
    }
}

function addSkillCategory(sectionId) {
    const categoryName = prompt('Name der neuen Kategorie:');
    if (!categoryName) return;
    
    const newCategory = {
        category: categoryName,
        skills: ['Neue Kompetenz']
    };
    
    const section = cvData.sections.find(s => s.id === sectionId);
    if (section) {
        section.entries.push(newCategory);
        generateEditableCV();
    }
}

function addSkill(sectionId, entryIndex) {
    const skillName = prompt('Neue Kompetenz:');
    if (!skillName) return;
    
    const section = cvData.sections.find(s => s.id === sectionId);
    if (section && section.entries[entryIndex]) {
        section.entries[entryIndex].skills.push(skillName);
        generateEditableCV();
    }
}

function addDescriptionPoint(sectionId, entryId) {
    const newPoint = prompt('Neuer Punkt:');
    if (!newPoint) return;
    
    const section = cvData.sections.find(s => s.id === sectionId);
    const entry = section?.entries.find(e => e.id === entryId);
    
    if (entry) {
        entry.description.push(newPoint);
        generateEditableCV();
    }
}

function removeEntry(sectionId, entryId) {
    if (!confirm('Möchten Sie diesen Eintrag wirklich löschen?')) return;
    
    const section = cvData.sections.find(s => s.id === sectionId);
    if (section) {
        section.entries = section.entries.filter(e => e.id !== entryId);
        generateEditableCV();
    }
}

function saveCVData() {
    localStorage.setItem('cvData', JSON.stringify(cvData));
    
    if (window.adminPanel && window.adminPanel.showToast) {
        window.adminPanel.showToast('Lebenslauf gespeichert', 'success');
    }
}

function loadCVData() {
    const savedData = localStorage.getItem('cvData');
    if (savedData) {
        cvData = JSON.parse(savedData);
    }
}

function resetCV() {
    if (!confirm('Möchten Sie den Lebenslauf wirklich zurücksetzen? Alle Änderungen gehen verloren.')) return;
    
    localStorage.removeItem('cvData');
    location.reload();
}

function exportCVAsPDF() {
    const cvContainer = document.querySelector('.cv-container');
    if (!cvContainer) return;
    
    // Create clean version for PDF
    const cleanContent = cvContainer.cloneNode(true);
    
    // Remove edit buttons and controls
    cleanContent.querySelectorAll('button').forEach(btn => btn.remove());
    cleanContent.querySelectorAll('[contenteditable]').forEach(el => el.removeAttribute('contenteditable'));
    
    // Create PDF-ready HTML
    const pdfHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Lebenslauf - ${cvData.personalInfo.name}</title>
            <style>
                body { 
                    font-family: Arial, sans-serif; 
                    line-height: 1.6; 
                    margin: 0; 
                    padding: 20mm;
                    color: #333;
                }
                .cv-container { max-width: none; margin: 0; padding: 0; }
                h1 { font-size: 24pt; margin-bottom: 8pt; }
                h2 { font-size: 14pt; margin-bottom: 12pt; font-weight: normal; }
                h3 { font-size: 14pt; margin: 16pt 0 8pt 0; color: #0066cc; }
                h4 { font-size: 12pt; margin: 8pt 0 4pt 0; }
                p { margin: 4pt 0; }
                ul { margin: 4pt 0; padding-left: 16pt; }
                li { margin-bottom: 2pt; }
                @media print {
                    body { margin: 0; padding: 15mm; }
                }
            </style>
        </head>
        <body>
            ${cleanContent.innerHTML}
        </body>
        </html>
    `;
    
    // Create blob and download
    const blob = new Blob([pdfHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Lebenslauf_${cvData.personalInfo.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.html`;
    a.click();
    URL.revokeObjectURL(url);
    
    if (window.adminPanel && window.adminPanel.showToast) {
        window.adminPanel.showToast('Lebenslauf als HTML exportiert', 'success');
    }
}

function updateCVDate() {
    const dateInput = document.getElementById('cvSignatureDate');
    if (dateInput) {
        cvData.signatureDate = dateInput.value;
        saveCVData();
    }
}

// Initialize CV on page load
document.addEventListener('DOMContentLoaded', function() {
    loadCVData();
});
