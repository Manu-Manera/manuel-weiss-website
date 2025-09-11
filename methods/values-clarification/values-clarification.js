// Werte-Klärung JavaScript Functions

function initValuesClarification() {
    console.log('Initializing Values Clarification...');
    
    // Load saved values
    loadSavedValues();
    
    // Setup event listeners
    setupValuesEventListeners();
    
    // Setup drag and drop
    setupValuesDragAndDrop();
    
    // Initialize satisfaction sliders
    initializeSatisfactionSliders();
}

function setupValuesEventListeners() {
    // Value selection checkboxes
    document.querySelectorAll('.value-item input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', updateSelectedValues);
    });
    
    // Custom value input
    const customValueInput = document.getElementById('custom-value');
    if (customValueInput) {
        customValueInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                addCustomValue();
            }
        });
    }
    
    // Satisfaction sliders
    document.querySelectorAll('.satisfaction-slider').forEach(slider => {
        slider.addEventListener('input', function() {
            const area = this.dataset.area;
            const value = this.value;
            document.getElementById(`${area}-satisfaction`).textContent = value;
            updateBalanceAnalysis();
        });
    });
}

function updateSelectedValues() {
    const selectedValues = [];
    document.querySelectorAll('.value-item input[type="checkbox"]:checked').forEach(checkbox => {
        selectedValues.push({
            value: checkbox.value,
            text: checkbox.nextElementSibling.textContent
        });
    });
    
    const selectedValuesContainer = document.getElementById('selected-values');
    if (selectedValues.length === 0) {
        selectedValuesContainer.innerHTML = '<p class="no-values">Noch keine Werte ausgewählt</p>';
    } else {
        selectedValuesContainer.innerHTML = selectedValues.map(val => 
            `<span class="selected-value-tag">${val.text}</span>`
        ).join('');
    }
    
    // Save to localStorage
    localStorage.setItem('selectedValues', JSON.stringify(selectedValues));
    
    // Update ranking list if we're on step 2
    if (document.querySelector('.workflow-step[data-step="2"]').classList.contains('active')) {
        updateValuesRankingList(selectedValues);
    }
}

function searchValues() {
    const searchTerm = document.getElementById('values-search').value.toLowerCase();
    document.querySelectorAll('.value-item').forEach(item => {
        const valueText = item.textContent.toLowerCase();
        if (valueText.includes(searchTerm)) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

function addCustomValue() {
    const input = document.getElementById('custom-value');
    const value = input.value.trim();
    
    if (value) {
        const customValuesList = document.getElementById('custom-values-list');
        const valueItem = document.createElement('div');
        valueItem.className = 'custom-value-item';
        valueItem.innerHTML = `
            <label class="value-item">
                <input type="checkbox" value="${value.toLowerCase().replace(/\s+/g, '-')}">
                <span>${value}</span>
            </label>
            <button class="btn btn-sm btn-outline" onclick="removeCustomValue(this)">Entfernen</button>
        `;
        customValuesList.appendChild(valueItem);
        
        // Add event listener to new checkbox
        valueItem.querySelector('input[type="checkbox"]').addEventListener('change', updateSelectedValues);
        
        input.value = '';
        
        // Save custom values
        saveCustomValues();
    }
}

function removeCustomValue(button) {
    button.parentElement.remove();
    saveCustomValues();
}

function saveCustomValues() {
    const customValues = [];
    document.querySelectorAll('.custom-value-item').forEach(item => {
        const value = item.querySelector('input').value;
        const text = item.querySelector('span').textContent;
        customValues.push({ value, text });
    });
    localStorage.setItem('customValues', JSON.stringify(customValues));
}

function selectRankingMethod(method) {
    // Update active button
    document.querySelectorAll('.method-options .btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    // Show appropriate ranking interface
    const container = document.getElementById('values-ranking-container');
    container.innerHTML = '';
    
    if (method === 'drag-drop') {
        container.innerHTML = `
            <div class="ranking-instructions">
                <p>Ziehe deine Werte in die gewünschte Reihenfolge. Die wichtigsten Werte sollten oben stehen.</p>
            </div>
            <div class="values-ranking-list" id="values-ranking-list">
                <!-- Werte werden hier dynamisch eingefügt -->
            </div>
        `;
        setupValuesDragAndDrop();
    } else if (method === 'pairwise') {
        container.innerHTML = `
            <div class="pairwise-comparison" id="pairwise-comparison">
                <div class="comparison-instructions">
                    <p>Vergleiche die Werte paarweise. Wähle den wichtigeren Wert aus.</p>
                </div>
                <div class="comparison-pair" id="comparison-pair">
                    <!-- Paarvergleich wird hier dynamisch generiert -->
                </div>
                <div class="comparison-progress">
                    <span id="comparison-progress">0 von 0 Vergleichen</span>
                </div>
            </div>
        `;
        startPairwiseComparison();
    } else if (method === 'slider') {
        container.innerHTML = `
            <div class="slider-ranking" id="slider-ranking">
                <div class="ranking-instructions">
                    <p>Bewerte jeden Wert von 1-10 und erkläre, warum er dir wichtig ist.</p>
                </div>
                <div class="values-scoring-list" id="values-scoring-list">
                    <!-- Scoring wird hier dynamisch eingefügt -->
                </div>
            </div>
        `;
        setupSliderRanking();
    }
    
    // Update ranking list
    const selectedValues = JSON.parse(localStorage.getItem('selectedValues') || '[]');
    updateValuesRankingList(selectedValues);
}

function setupValuesDragAndDrop() {
    const rankingList = document.getElementById('values-ranking-list');
    if (!rankingList) return;
    
    rankingList.addEventListener('dragover', handleDragOver);
    rankingList.addEventListener('drop', handleDrop);
}

function handleDragStart(e) {
    e.dataTransfer.setData('text/plain', e.target.dataset.value);
    e.target.style.opacity = '0.5';
}

function handleDragOver(e) {
    e.preventDefault();
}

function handleDrop(e) {
    e.preventDefault();
    const draggedValue = e.dataTransfer.getData('text/plain');
    const dropTarget = e.target.closest('.ranking-value-item');
    
    if (dropTarget) {
        const targetValue = dropTarget.dataset.value;
        swapValues(draggedValue, targetValue);
    }
    
    // Reset opacity
    document.querySelectorAll('.ranking-value-item').forEach(item => {
        item.style.opacity = '1';
    });
}

function swapValues(value1, value2) {
    const selectedValues = JSON.parse(localStorage.getItem('selectedValues') || '[]');
    const index1 = selectedValues.findIndex(v => v.value === value1);
    const index2 = selectedValues.findIndex(v => v.value === value2);
    
    if (index1 !== -1 && index2 !== -1) {
        [selectedValues[index1], selectedValues[index2]] = [selectedValues[index2], selectedValues[index1]];
        localStorage.setItem('selectedValues', JSON.stringify(selectedValues));
        updateValuesRankingList(selectedValues);
    }
}

function updateValuesRankingList(selectedValues) {
    const rankingList = document.getElementById('values-ranking-list');
    if (!rankingList) return;
    
    rankingList.innerHTML = selectedValues.map((value, index) => `
        <div class="ranking-value-item" data-value="${value.value}" draggable="true" ondragstart="handleDragStart(event)">
            <div class="ranking-number">${index + 1}</div>
            <div class="ranking-text">${value.text}</div>
            <div class="ranking-actions">
                <button class="btn btn-sm" onclick="moveValueUp('${value.value}')">↑</button>
                <button class="btn btn-sm" onclick="moveValueDown('${value.value}')">↓</button>
            </div>
        </div>
    `).join('');
    
    // Update scoring list
    updateValuesScoringList(selectedValues);
}

function moveValueUp(value) {
    const selectedValues = JSON.parse(localStorage.getItem('selectedValues') || '[]');
    const index = selectedValues.findIndex(v => v.value === value);
    
    if (index > 0) {
        [selectedValues[index], selectedValues[index - 1]] = [selectedValues[index - 1], selectedValues[index]];
        localStorage.setItem('selectedValues', JSON.stringify(selectedValues));
        updateValuesRankingList(selectedValues);
    }
}

function moveValueDown(value) {
    const selectedValues = JSON.parse(localStorage.getItem('selectedValues') || '[]');
    const index = selectedValues.findIndex(v => v.value === value);
    
    if (index < selectedValues.length - 1) {
        [selectedValues[index], selectedValues[index + 1]] = [selectedValues[index + 1], selectedValues[index]];
        localStorage.setItem('selectedValues', JSON.stringify(selectedValues));
        updateValuesRankingList(selectedValues);
    }
}

function updateValuesScoringList(selectedValues) {
    const scoringList = document.getElementById('values-scoring-list');
    if (!scoringList) return;
    
    scoringList.innerHTML = selectedValues.map(value => `
        <div class="value-scoring-item">
            <div class="value-name">${value.text}</div>
            <div class="value-score">
                <input type="range" min="1" max="10" value="5" class="score-slider" data-value="${value.value}">
                <span class="score-value">5</span>
            </div>
            <div class="value-explanation">
                <textarea placeholder="Warum ist dieser Wert wichtig für dich?" data-value="${value.value}"></textarea>
            </div>
        </div>
    `).join('');
    
    // Add event listeners to sliders
    document.querySelectorAll('.score-slider').forEach(slider => {
        slider.addEventListener('input', function() {
            const value = this.value;
            this.nextElementSibling.textContent = value;
            saveValueScoring();
        });
    });
    
    // Add event listeners to textareas
    document.querySelectorAll('.value-explanation textarea').forEach(textarea => {
        textarea.addEventListener('input', saveValueScoring);
    });
}

function saveValueScoring() {
    const scoring = {};
    document.querySelectorAll('.value-scoring-item').forEach(item => {
        const value = item.querySelector('.score-slider').dataset.value;
        const score = item.querySelector('.score-slider').value;
        const explanation = item.querySelector('textarea').value;
        scoring[value] = { score: parseInt(score), explanation };
    });
    localStorage.setItem('valueScoring', JSON.stringify(scoring));
}

function detectValueConflicts() {
    const selectedValues = JSON.parse(localStorage.getItem('selectedValues') || '[]');
    const conflicts = [];
    
    // Define potential conflicts
    const conflictPairs = [
        ['karriere', 'familie'],
        ['sicherheit', 'abenteuer'],
        ['individualität', 'zugehörigkeit'],
        ['wohlstand', 'spiritualität'],
        ['status', 'authentizität']
    ];
    
    conflictPairs.forEach(pair => {
        const hasValue1 = selectedValues.some(v => v.value === pair[0]);
        const hasValue2 = selectedValues.some(v => v.value === pair[1]);
        
        if (hasValue1 && hasValue2) {
            conflicts.push({
                values: pair,
                description: `Potentieller Konflikt zwischen ${pair[0]} und ${pair[1]}`
            });
        }
    });
    
    const resultsContainer = document.getElementById('conflict-results');
    if (conflicts.length === 0) {
        resultsContainer.innerHTML = '<p class="no-conflicts">Keine offensichtlichen Konflikte gefunden! 🎉</p>';
    } else {
        resultsContainer.innerHTML = conflicts.map(conflict => `
            <div class="conflict-item">
                <h5>⚠️ ${conflict.description}</h5>
                <p>Überlege, wie du diese Werte in Einklang bringen kannst.</p>
            </div>
        `).join('');
    }
}

function initializeSatisfactionSliders() {
    document.querySelectorAll('.satisfaction-slider').forEach(slider => {
        slider.addEventListener('input', function() {
            const area = this.dataset.area;
            const value = this.value;
            document.getElementById(`${area}-satisfaction`).textContent = value;
            updateBalanceAnalysis();
        });
    });
}

function updateBalanceAnalysis() {
    const areas = ['career', 'relationships', 'health', 'finances', 'spirituality', 'hobbies', 'family', 'personal-growth'];
    const scores = areas.map(area => {
        const slider = document.querySelector(`[data-area="${area}"] .satisfaction-slider`);
        return slider ? parseInt(slider.value) : 5;
    });
    
    const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const minScore = Math.min(...scores);
    const maxScore = Math.max(...scores);
    const balance = maxScore - minScore;
    
    const recommendations = document.getElementById('balance-recommendations');
    if (balance > 4) {
        recommendations.innerHTML = `
            <div class="balance-warning">
                <h5>⚠️ Ungleichgewicht erkannt</h5>
                <p>Deine Lebensbereiche sind sehr unausgewogen. Konzentriere dich auf die Bereiche mit niedrigen Werten.</p>
            </div>
        `;
    } else if (balance > 2) {
        recommendations.innerHTML = `
            <div class="balance-info">
                <h5>⚖️ Leichtes Ungleichgewicht</h5>
                <p>Deine Lebensbereiche sind relativ ausgewogen, aber es gibt noch Verbesserungspotential.</p>
            </div>
        `;
    } else {
        recommendations.innerHTML = `
            <div class="balance-success">
                <h5>✅ Ausgewogene Lebensbereiche</h5>
                <p>Deine Lebensbereiche sind gut ausgewogen! Weiter so!</p>
            </div>
        `;
    }
}

function inviteBuddy() {
    const email = document.getElementById('buddy-email').value;
    if (email) {
        // In a real application, this would send an email invitation
        showNotification('Einladung an ' + email + ' gesendet!', 'success');
        document.getElementById('buddy-email').value = '';
    } else {
        showNotification('Bitte gib eine gültige E-Mail-Adresse ein.', 'error');
    }
}

function loadSavedValues() {
    // Load selected values
    const selectedValues = JSON.parse(localStorage.getItem('selectedValues') || '[]');
    if (selectedValues.length > 0) {
        selectedValues.forEach(value => {
            const checkbox = document.querySelector(`input[value="${value.value}"]`);
            if (checkbox) {
                checkbox.checked = true;
            }
        });
        updateSelectedValues();
    }
    
    // Load custom values
    const customValues = JSON.parse(localStorage.getItem('customValues') || '[]');
    const customValuesList = document.getElementById('custom-values-list');
    if (customValues.length > 0 && customValuesList) {
        customValuesList.innerHTML = customValues.map(value => `
            <div class="custom-value-item">
                <label class="value-item">
                    <input type="checkbox" value="${value.value}">
                    <span>${value.text}</span>
                </label>
                <button class="btn btn-sm btn-outline" onclick="removeCustomValue(this)">Entfernen</button>
            </div>
        `).join('');
        
        // Add event listeners
        customValuesList.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', updateSelectedValues);
        });
    }
    
    // Load value scoring
    const scoring = JSON.parse(localStorage.getItem('valueScoring') || '{}');
    Object.keys(scoring).forEach(value => {
        const slider = document.querySelector(`[data-value="${value}"] .score-slider`);
        const textarea = document.querySelector(`[data-value="${value}"] textarea`);
        if (slider) {
            slider.value = scoring[value].score;
            slider.nextElementSibling.textContent = scoring[value].score;
        }
        if (textarea) {
            textarea.value = scoring[value].explanation || '';
        }
    });
}

// Export functions for use in main file
window.initValuesClarification = initValuesClarification;
window.updateSelectedValues = updateSelectedValues;
window.searchValues = searchValues;
window.addCustomValue = addCustomValue;
window.removeCustomValue = removeCustomValue;
window.selectRankingMethod = selectRankingMethod;
window.setupValuesDragAndDrop = setupValuesDragAndDrop;
window.handleDragStart = handleDragStart;
window.handleDragOver = handleDragOver;
window.handleDrop = handleDrop;
window.updateValuesRankingList = updateValuesRankingList;
window.moveValueUp = moveValueUp;
window.moveValueDown = moveValueDown;
window.detectValueConflicts = detectValueConflicts;
window.inviteBuddy = inviteBuddy;
window.loadSavedValues = loadSavedValues;
