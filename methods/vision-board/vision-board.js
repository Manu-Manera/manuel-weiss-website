// Vision Board JavaScript Functions

let visionData = {
    categories: {
        career: '',
        finances: '',
        lifestyle: '',
        relationships: '',
        health: '',
        hobbies: '',
        travel: '',
        development: ''
    },
    summary: '',
    images: {
        career: [],
        finances: [],
        lifestyle: [],
        relationships: [],
        health: [],
        hobbies: []
    },
    layout: 'grid',
    actions: [],
    reminders: {
        daily: false,
        weekly: false,
        monthly: false
    }
};

function initVisionBoard() {
    console.log('Initializing Vision Board...');
    
    // Load saved data
    loadSavedVisionData();
    
    // Setup event listeners
    setupVisionEventListeners();
    
    // Initialize UI
    updateVisionSummary();
}

function setupVisionEventListeners() {
    // Setup category textareas
    document.querySelectorAll('.vision-category textarea').forEach(textarea => {
        textarea.addEventListener('input', function() {
            const category = this.closest('.vision-category').querySelector('h5').textContent.toLowerCase();
            const categoryKey = getCategoryKey(category);
            visionData.categories[categoryKey] = this.value;
            saveVisionData();
        });
    });
    
    // Setup vision summary
    document.getElementById('vision-summary').addEventListener('input', function() {
        visionData.summary = this.value;
        saveVisionData();
    });
    
    // Setup layout options
    document.querySelectorAll('input[name="layout"]').forEach(radio => {
        radio.addEventListener('change', function() {
            visionData.layout = this.value;
            updateBoardPreview();
            saveVisionData();
        });
    });
    
    // Setup image placeholders
    document.querySelectorAll('.image-placeholder').forEach(placeholder => {
        placeholder.addEventListener('click', function() {
            const category = this.dataset.category;
            showImageUploadModal(category);
        });
    });
    
    // Setup reminder checkboxes
    document.getElementById('daily-reminder').addEventListener('change', function() {
        visionData.reminders.daily = this.checked;
        saveVisionData();
    });
    
    document.getElementById('weekly-review').addEventListener('change', function() {
        visionData.reminders.weekly = this.checked;
        saveVisionData();
    });
    
    document.getElementById('monthly-update').addEventListener('change', function() {
        visionData.reminders.monthly = this.checked;
        saveVisionData();
    });
}

function getCategoryKey(categoryText) {
    const categoryMap = {
        '💼 beruf & karriere': 'career',
        '💰 finanzen & wohlstand': 'finances',
        '🏠 lebensstil & wohnen': 'lifestyle',
        '👥 beziehungen & familie': 'relationships',
        '🏃‍♂️ gesundheit & fitness': 'health',
        '🎨 hobbys & leidenschaften': 'hobbies',
        '🌍 reisen & abenteuer': 'travel',
        '🎯 persönliche entwicklung': 'development'
    };
    
    return categoryMap[categoryText] || 'career';
}

function showImageUploadModal(category) {
    const modal = document.createElement('div');
    modal.className = 'image-upload-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Bilder für ${getCategoryName(category)} hinzufügen</h3>
                <button class="close-btn" onclick="closeModal(this)">&times;</button>
            </div>
            <div class="modal-body">
                <div class="upload-options">
                    <div class="upload-option">
                        <h4>📁 Datei hochladen</h4>
                        <input type="file" id="file-upload" accept="image/*" multiple>
                        <button class="btn btn-primary" onclick="uploadFiles('${category}')">Hochladen</button>
                    </div>
                    <div class="upload-option">
                        <h4>🔗 URL eingeben</h4>
                        <input type="url" id="url-input" placeholder="Bild-URL eingeben...">
                        <button class="btn btn-primary" onclick="addImageFromUrl('${category}')">Hinzufügen</button>
                    </div>
                </div>
                <div class="image-preview" id="image-preview-${category}">
                    ${getImagePreview(category)}
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'flex';
}

function getCategoryName(category) {
    const categoryNames = {
        'career': 'Beruf & Karriere',
        'finances': 'Finanzen',
        'lifestyle': 'Lebensstil',
        'relationships': 'Beziehungen',
        'health': 'Gesundheit',
        'hobbies': 'Hobbys'
    };
    return categoryNames[category] || category;
}

function getImagePreview(category) {
    const images = visionData.images[category] || [];
    if (images.length === 0) {
        return '<p>Noch keine Bilder hinzugefügt.</p>';
    }
    
    return images.map((image, index) => `
        <div class="preview-image">
            <img src="${image.url}" alt="${image.alt || 'Vision Board Bild'}">
            <button class="remove-btn" onclick="removeImage('${category}', ${index})">&times;</button>
        </div>
    `).join('');
}

function uploadFiles(category) {
    const fileInput = document.getElementById('file-upload');
    const files = fileInput.files;
    
    if (files.length === 0) {
        showNotification('Bitte wähle mindestens eine Datei aus!', 'warning');
        return;
    }
    
    Array.from(files).forEach(file => {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                addImageToCategory(category, {
                    url: e.target.result,
                    alt: file.name,
                    type: 'uploaded'
                });
            };
            reader.readAsDataURL(file);
        }
    });
    
    showNotification(`${files.length} Bilder hinzugefügt!`, 'success');
    closeModal(document.querySelector('.image-upload-modal .close-btn'));
}

function addImageFromUrl(category) {
    const urlInput = document.getElementById('url-input');
    const url = urlInput.value.trim();
    
    if (!url) {
        showNotification('Bitte gib eine gültige URL ein!', 'warning');
        return;
    }
    
    addImageToCategory(category, {
        url: url,
        alt: 'Vision Board Bild',
        type: 'url'
    });
    
    urlInput.value = '';
    showNotification('Bild hinzugefügt!', 'success');
}

function addImageToCategory(category, image) {
    if (!visionData.images[category]) {
        visionData.images[category] = [];
    }
    
    visionData.images[category].push(image);
    updateImagePlaceholder(category);
    saveVisionData();
}

function removeImage(category, index) {
    visionData.images[category].splice(index, 1);
    updateImagePlaceholder(category);
    saveVisionData();
}

function updateImagePlaceholder(category) {
    const placeholder = document.querySelector(`[data-category="${category}"]`);
    const images = visionData.images[category] || [];
    
    if (images.length > 0) {
        placeholder.innerHTML = `
            <div class="image-count">${images.length} Bilder</div>
            <div class="image-thumbnails">
                ${images.slice(0, 3).map(img => `<img src="${img.url}" alt="${img.alt}">`).join('')}
                ${images.length > 3 ? `<div class="more-count">+${images.length - 3}</div>` : ''}
            </div>
        `;
    } else {
        placeholder.innerHTML = `
            <i class="fas fa-plus"></i>
            <span>Bilder hinzufügen</span>
        `;
    }
}

function showPhysicalBoardGuide() {
    showGuideModal('Physisches Vision Board', `
        <h4>Materialien:</h4>
        <ul>
            <li>Große Pappe oder Korkwand (mind. A2)</li>
            <li>Kleber oder Pins</li>
            <li>Schere</li>
            <li>Deine gesammelten Bilder</li>
            <li>Optional: Marker, Aufkleber, Zitate</li>
        </ul>
        
        <h4>Schritte:</h4>
        <ol>
            <li>Bereite deine Bilder vor (ausschneiden, zurechtschneiden)</li>
            <li>Arrangiere die Bilder auf der Pappe</li>
            <li>Klebe die Bilder fest</li>
            <li>Füge Zitate oder Wörter hinzu</li>
            <li>Rahme das Board ein (optional)</li>
        </ol>
        
        <h4>Tipps:</h4>
        <ul>
            <li>Verwende Bilder, die starke Emotionen auslösen</li>
            <li>Platziere das wichtigste Bild in der Mitte</li>
            <li>Lasse etwas Platz zwischen den Bildern</li>
            <li>Verwende eine einheitliche Farbpalette</li>
        </ul>
    `);
}

function showDigitalBoardGuide() {
    showGuideModal('Digitales Vision Board', `
        <h4>Empfohlene Tools:</h4>
        <ul>
            <li><strong>Canva:</strong> Einfach zu bedienen, viele Vorlagen</li>
            <li><strong>Pinterest:</strong> Perfekt zum Sammeln und Organisieren</li>
            <li><strong>PowerPoint:</strong> Einfache Bearbeitung, gute Druckqualität</li>
            <li><strong>Photoshop:</strong> Professionelle Bearbeitung</li>
        </ul>
        
        <h4>Schritte:</h4>
        <ol>
            <li>Wähle dein bevorzugtes Tool</li>
            <li>Erstelle ein neues Dokument (A4 oder größer)</li>
            <li>Lade deine Bilder hoch</li>
            <li>Arrangiere die Bilder</li>
            <li>Füge Text und Zitate hinzu</li>
            <li>Speichere und drucke aus (optional)</li>
        </ol>
        
        <h4>Vorteile:</h4>
        <ul>
            <li>Einfach zu bearbeiten und zu aktualisieren</li>
            <li>Kann als Handy-Hintergrund verwendet werden</li>
            <li>Einfach zu teilen</li>
            <li>Keine Materialkosten</li>
        </ul>
    `);
}

function showGuideModal(title, content) {
    const modal = document.createElement('div');
    modal.className = 'guide-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${title}</h3>
                <button class="close-btn" onclick="closeModal(this)">&times;</button>
            </div>
            <div class="modal-body">
                ${content}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'flex';
}

function updateBoardPreview() {
    const preview = document.getElementById('board-preview');
    const layout = visionData.layout;
    
    let previewHTML = '';
    
    switch (layout) {
        case 'grid':
            previewHTML = `
                <div class="preview-grid">
                    <div class="preview-item"></div>
                    <div class="preview-item"></div>
                    <div class="preview-item"></div>
                    <div class="preview-item"></div>
                    <div class="preview-item"></div>
                    <div class="preview-item"></div>
                </div>
                <p>Gleichmäßiges Raster-Layout</p>
            `;
            break;
        case 'flow':
            previewHTML = `
                <div class="preview-flow">
                    <div class="preview-item large"></div>
                    <div class="preview-item small"></div>
                    <div class="preview-item medium"></div>
                    <div class="preview-item small"></div>
                    <div class="preview-item medium"></div>
                </div>
                <p>Natürliche, fließende Anordnung</p>
            `;
            break;
        case 'center':
            previewHTML = `
                <div class="preview-center">
                    <div class="preview-item center-large"></div>
                    <div class="preview-item small"></div>
                    <div class="preview-item small"></div>
                    <div class="preview-item small"></div>
                    <div class="preview-item small"></div>
                </div>
                <p>Zentriertes Layout mit Fokus</p>
            `;
            break;
    }
    
    preview.innerHTML = previewHTML;
}

function addAction() {
    const input = document.getElementById('action-input');
    const action = input.value.trim();
    
    if (!action) {
        showNotification('Bitte gib eine Aktion ein!', 'warning');
        return;
    }
    
    visionData.actions.push({
        id: Date.now(),
        text: action,
        completed: false,
        date: new Date().toISOString()
    });
    
    input.value = '';
    updateActionsList();
    saveVisionData();
    showNotification('Aktion hinzugefügt!', 'success');
}

function updateActionsList() {
    const actionsList = document.getElementById('actions-list');
    const actions = visionData.actions;
    
    if (actions.length === 0) {
        actionsList.innerHTML = '<p>Füge Aktionen hinzu, um deine Vision zu verwirklichen.</p>';
        return;
    }
    
    actionsList.innerHTML = actions.map(action => `
        <div class="action-item ${action.completed ? 'completed' : ''}">
            <input type="checkbox" ${action.completed ? 'checked' : ''} 
                   onchange="toggleAction(${action.id})">
            <span class="action-text">${action.text}</span>
            <button class="remove-action" onclick="removeAction(${action.id})">&times;</button>
        </div>
    `).join('');
}

function toggleAction(actionId) {
    const action = visionData.actions.find(a => a.id === actionId);
    if (action) {
        action.completed = !action.completed;
        updateActionsList();
        saveVisionData();
    }
}

function removeAction(actionId) {
    visionData.actions = visionData.actions.filter(a => a.id !== actionId);
    updateActionsList();
    saveVisionData();
}

function updateVisionSummary() {
    // Update any summary displays if needed
    const totalImages = Object.values(visionData.images).reduce((total, images) => total + images.length, 0);
    const completedActions = visionData.actions.filter(action => action.completed).length;
    
    // You can add summary statistics here
}

function closeModal(button) {
    const modal = button.closest('.image-upload-modal, .guide-modal');
    modal.remove();
}

// Data persistence functions
function saveVisionData() {
    localStorage.setItem('vision-board-data', JSON.stringify(visionData));
}

function loadSavedVisionData() {
    const saved = localStorage.getItem('vision-board-data');
    if (saved) {
        visionData = JSON.parse(saved);
        
        // Restore category textareas
        Object.keys(visionData.categories).forEach(key => {
            const categoryElement = document.querySelector(`[data-category="${key}"]`);
            if (categoryElement) {
                const textarea = categoryElement.closest('.vision-category').querySelector('textarea');
                if (textarea) {
                    textarea.value = visionData.categories[key];
                }
            }
        });
        
        // Restore vision summary
        if (visionData.summary) {
            document.getElementById('vision-summary').value = visionData.summary;
        }
        
        // Restore layout
        if (visionData.layout) {
            document.querySelector(`input[value="${visionData.layout}"]`).checked = true;
            updateBoardPreview();
        }
        
        // Restore reminders
        document.getElementById('daily-reminder').checked = visionData.reminders.daily;
        document.getElementById('weekly-review').checked = visionData.reminders.weekly;
        document.getElementById('monthly-update').checked = visionData.reminders.monthly;
        
        // Restore images
        Object.keys(visionData.images).forEach(category => {
            updateImagePlaceholder(category);
        });
        
        // Restore actions
        updateActionsList();
    }
}
