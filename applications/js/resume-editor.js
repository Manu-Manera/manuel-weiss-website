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

// Load existing resume
async function loadResume() {
    try {
        const response = await fetch('https://of2iwj7h2c.execute-api.eu-central-1.amazonaws.com/prod/resume', {
            headers: {
                'Authorization': `Bearer ${await getAuthToken()}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            resumeData = data;
            populateForm(data);
            showNotification('Lebenslauf geladen', 'success');
        } else if (response.status === 404) {
            showNotification('Kein Lebenslauf gefunden', 'info');
        } else {
            throw new Error('Fehler beim Laden');
        }
    } catch (error) {
        console.error('Error loading resume:', error);
        showNotification('Fehler beim Laden des Lebenslaufs', 'error');
    }
}

// Save resume
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
        
        const { uploadUrl, s3Key } = await uploadUrlResponse.json();
        
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
        const ocrResponse = await fetch('https://of2iwj7h2c.execute-api.eu-central-1.amazonaws.com/prod/resume/ocr', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${await getAuthToken()}`
            },
            body: JSON.stringify({ s3Key })
        });
        
        const ocrResult = await ocrResponse.json();
        
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
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            address: document.getElementById('address').value,
            linkedin: document.getElementById('linkedin').value,
            website: document.getElementById('website').value
        },
        sections: collectSections(),
        skills: document.getElementById('skills').value.split(',').map(s => s.trim()).filter(s => s),
        languages: collectLanguages()
    };
}

function collectSections() {
    // Collect experience and education
    const sections = [];
    // Implementation...
    return sections;
}

function collectLanguages() {
    // Implementation...
    return [];
}

function populateForm(data) {
    if (data.personalInfo) {
        document.getElementById('firstName').value = data.personalInfo.firstName || '';
        document.getElementById('lastName').value = data.personalInfo.lastName || '';
        document.getElementById('email').value = data.personalInfo.email || '';
        document.getElementById('phone').value = data.personalInfo.phone || '';
        document.getElementById('address').value = data.personalInfo.address || '';
        document.getElementById('linkedin').value = data.personalInfo.linkedin || '';
        document.getElementById('website').value = data.personalInfo.website || '';
    }
    
    if (data.skills) {
        document.getElementById('skills').value = data.skills.join(', ');
    }
}

function addExperience() {
    // Implementation...
}

function addEducation() {
    // Implementation...
}

function addLanguage() {
    // Implementation...
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

