// Stärken-Analyse JavaScript Functions

function initStrengthsFinder() {
    console.log('Initializing Strengths Finder...');
    
    // Load saved strengths
    loadSavedStrengths();
    
    // Setup event listeners
    setupStrengthsEventListeners();
    
    // Initialize strength categories
    initializeStrengthCategories();
}

function setupStrengthsEventListeners() {
    // Strength selection checkboxes
    document.querySelectorAll('.strength-item input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', updateSelectedStrengths);
    });
}

function updateSelectedStrengths() {
    const selectedStrengths = [];
    document.querySelectorAll('.strength-item input[type="checkbox"]:checked').forEach(checkbox => {
        selectedStrengths.push({
            value: checkbox.value,
            text: checkbox.nextElementSibling.textContent,
            category: checkbox.closest('.strength-category').dataset.category
        });
    });
    
    const selectedStrengthsContainer = document.getElementById('selected-strengths');
    if (selectedStrengths.length === 0) {
        selectedStrengthsContainer.innerHTML = '<p class="no-strengths">Noch keine Stärken ausgewählt</p>';
    } else {
        selectedStrengthsContainer.innerHTML = selectedStrengths.map(strength => 
            `<span class="selected-strength-tag" data-category="${strength.category}">${strength.text}</span>`
        ).join('');
    }
    
    // Save to localStorage
    localStorage.setItem('selectedStrengths', JSON.stringify(selectedStrengths));
    
    // Update scoring list if we're on step 2
    if (document.querySelector('.workflow-step[data-step="2"]').classList.contains('active')) {
        updateStrengthsScoringList(selectedStrengths);
    }
    
    // Update insights
    updateStrengthsInsights(selectedStrengths);
}

function startGallupAssessment() {
    showNotification('Gallup StrengthsFinder Assessment wird gestartet...', 'info');
    
    // In a real application, this would redirect to the actual Gallup assessment
    // For now, we'll simulate the process
    setTimeout(() => {
        showNotification('Assessment abgeschlossen! Deine Top 5 Stärken wurden identifiziert.', 'success');
        
        // Simulate results
        const gallupResults = [
            { value: 'achiever', text: 'Achiever - Erreicher', category: 'executing' },
            { value: 'learner', text: 'Learner - Lerner', category: 'strategic-thinking' },
            { value: 'communication', text: 'Communication - Kommunikation', category: 'influencing' },
            { value: 'empathy', text: 'Empathy - Empathie', category: 'relationship-building' },
            { value: 'strategic', text: 'Strategic - Strategisch', category: 'strategic-thinking' }
        ];
        
        // Auto-select the results
        gallupResults.forEach(result => {
            const checkbox = document.querySelector(`input[value="${result.value}"]`);
            if (checkbox) {
                checkbox.checked = true;
            }
        });
        
        updateSelectedStrengths();
    }, 2000);
}

function startVIAAssessment() {
    showNotification('VIA Character Strengths Assessment wird gestartet...', 'info');
    
    // In a real application, this would redirect to the actual VIA assessment
    setTimeout(() => {
        showNotification('Assessment abgeschlossen! Deine Top 5 Charakterstärken wurden identifiziert.', 'success');
        
        // Simulate results
        const viaResults = [
            { value: 'creativity', text: 'Kreativität', category: 'strategic-thinking' },
            { value: 'curiosity', text: 'Neugier', category: 'strategic-thinking' },
            { value: 'love', text: 'Liebe', category: 'relationship-building' },
            { value: 'kindness', text: 'Freundlichkeit', category: 'relationship-building' },
            { value: 'perseverance', text: 'Ausdauer', category: 'executing' }
        ];
        
        // Auto-select the results
        viaResults.forEach(result => {
            const checkbox = document.querySelector(`input[value="${result.value}"]`);
            if (checkbox) {
                checkbox.checked = true;
            }
        });
        
        updateSelectedStrengths();
    }, 2000);
}

function startCustomAssessment() {
    showNotification('Selbsteinschätzung wird gestartet...', 'info');
    
    // Show custom assessment modal or redirect to assessment page
    const assessmentModal = document.createElement('div');
    assessmentModal.className = 'modal';
    assessmentModal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Selbsteinschätzung</h3>
                <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
            </div>
            <div class="modal-body">
                <p>Bewerte dich selbst in verschiedenen Bereichen von 1-10:</p>
                <div class="assessment-questions" id="custom-assessment-questions">
                    <!-- Questions will be generated here -->
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-primary" onclick="completeCustomAssessment()">Bewertung abschließen</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(assessmentModal);
    
    // Generate assessment questions
    generateCustomAssessmentQuestions();
}

function generateCustomAssessmentQuestions() {
    const questions = [
        { id: 'leadership', text: 'Wie gut kannst du andere führen und motivieren?' },
        { id: 'communication', text: 'Wie gut kannst du dich ausdrücken und anderen zuhören?' },
        { id: 'creativity', text: 'Wie kreativ und innovativ bist du?' },
        { id: 'analytical', text: 'Wie gut kannst du Probleme analysieren und lösen?' },
        { id: 'empathy', text: 'Wie gut kannst du dich in andere hineinversetzen?' },
        { id: 'perseverance', text: 'Wie ausdauernd bist du bei schwierigen Aufgaben?' },
        { id: 'adaptability', text: 'Wie gut kannst du dich an neue Situationen anpassen?' },
        { id: 'teamwork', text: 'Wie gut arbeitest du im Team?' }
    ];
    
    const questionsContainer = document.getElementById('custom-assessment-questions');
    questionsContainer.innerHTML = questions.map(question => `
        <div class="assessment-question">
            <label>${question.text}</label>
            <div class="rating-scale">
                <input type="range" min="1" max="10" value="5" class="strength-slider" data-strength="${question.id}">
                <div class="scale-labels">
                    <span>1 - Schwach</span>
                    <span>10 - Sehr stark</span>
                </div>
                <span class="rating-value">5</span>
            </div>
        </div>
    `).join('');
    
    // Add event listeners to sliders
    document.querySelectorAll('.strength-slider').forEach(slider => {
        slider.addEventListener('input', function() {
            this.nextElementSibling.nextElementSibling.textContent = this.value;
        });
    });
}

function completeCustomAssessment() {
    const results = [];
    document.querySelectorAll('.strength-slider').forEach(slider => {
        const value = parseInt(slider.value);
        if (value >= 7) { // Only include strengths rated 7 or higher
            results.push({
                value: slider.dataset.strength,
                text: slider.closest('.assessment-question').querySelector('label').textContent,
                category: 'custom',
                rating: value
            });
        }
    });
    
    // Auto-select the results
    results.forEach(result => {
        const checkbox = document.querySelector(`input[value="${result.value}"]`);
        if (checkbox) {
            checkbox.checked = true;
        }
    });
    
    updateSelectedStrengths();
    
    // Close modal
    document.querySelector('.modal').remove();
    
    showNotification(`Selbsteinschätzung abgeschlossen! ${results.length} Stärken identifiziert.`, 'success');
}

function updateStrengthsScoringList(selectedStrengths) {
    const scoringList = document.getElementById('strengths-scoring-list');
    if (!scoringList) return;
    
    scoringList.innerHTML = selectedStrengths.map(strength => `
        <div class="strength-scoring-item">
            <div class="strength-name">${strength.text}</div>
            <div class="strength-category-badge">${getCategoryName(strength.category)}</div>
            <div class="strength-score">
                <input type="range" min="1" max="10" value="7" class="score-slider" data-strength="${strength.value}">
                <span class="score-value">7</span>
            </div>
            <div class="strength-description">
                <textarea placeholder="Beschreibe, wie du diese Stärke in deinem Alltag nutzt..." data-strength="${strength.value}"></textarea>
            </div>
        </div>
    `).join('');
    
    // Add event listeners to sliders
    document.querySelectorAll('.score-slider').forEach(slider => {
        slider.addEventListener('input', function() {
            const value = this.value;
            this.nextElementSibling.textContent = value;
            saveStrengthScoring();
        });
    });
    
    // Add event listeners to textareas
    document.querySelectorAll('.strength-description textarea').forEach(textarea => {
        textarea.addEventListener('input', saveStrengthScoring);
    });
}

function getCategoryName(category) {
    const categoryNames = {
        'executing': 'Umsetzung',
        'influencing': 'Einflussnahme',
        'relationship-building': 'Beziehungsaufbau',
        'strategic-thinking': 'Strategisches Denken',
        'custom': 'Selbsteinschätzung'
    };
    return categoryNames[category] || category;
}

function saveStrengthScoring() {
    const scoring = {};
    document.querySelectorAll('.strength-scoring-item').forEach(item => {
        const strength = item.querySelector('.score-slider').dataset.strength;
        const score = item.querySelector('.score-slider').value;
        const description = item.querySelector('textarea').value;
        scoring[strength] = { score: parseInt(score), description };
    });
    localStorage.setItem('strengthScoring', JSON.stringify(scoring));
}

function updateStrengthsInsights(selectedStrengths) {
    const insightsContainer = document.getElementById('insights-container');
    if (!insightsContainer) return;
    
    if (selectedStrengths.length === 0) {
        insightsContainer.innerHTML = '<p class="no-insights">Wähle Stärken aus, um Insights zu erhalten</p>';
        return;
    }
    
    // Group strengths by category
    const strengthsByCategory = {};
    selectedStrengths.forEach(strength => {
        if (!strengthsByCategory[strength.category]) {
            strengthsByCategory[strength.category] = [];
        }
        strengthsByCategory[strength.category].push(strength);
    });
    
    // Generate insights
    const insights = [];
    
    Object.keys(strengthsByCategory).forEach(category => {
        const categoryStrengths = strengthsByCategory[category];
        if (categoryStrengths.length >= 2) {
            insights.push({
                type: 'category-dominance',
                category: getCategoryName(category),
                strengths: categoryStrengths,
                message: `Du hast ${categoryStrengths.length} Stärken in der Kategorie "${getCategoryName(category)}". Das deutet auf eine natürliche Neigung in diesem Bereich hin.`
            });
        }
    });
    
    // Generate specific insights
    selectedStrengths.forEach(strength => {
        if (strength.value === 'achiever') {
            insights.push({
                type: 'specific-strength',
                strength: strength.text,
                message: 'Als Achiever bist du motiviert, jeden Tag etwas zu erreichen. Nutze diese Stärke, um dir tägliche Ziele zu setzen.'
            });
        } else if (strength.value === 'learner') {
            insights.push({
                type: 'specific-strength',
                strength: strength.text,
                message: 'Als Learner liebst du es zu lernen. Suche nach neuen Herausforderungen und Lernmöglichkeiten.'
            });
        } else if (strength.value === 'communication') {
            insights.push({
                type: 'specific-strength',
                strength: strength.text,
                message: 'Deine Kommunikationsstärke macht dich zu einem natürlichen Vermittler. Nutze sie in Führungsrollen.'
            });
        }
    });
    
    // Display insights
    insightsContainer.innerHTML = insights.map(insight => `
        <div class="insight-item insight-${insight.type}">
            <h5>💡 ${insight.strength || insight.category}</h5>
            <p>${insight.message}</p>
        </div>
    `).join('');
}

function initializeStrengthCategories() {
    // Add click handlers to category headers
    document.querySelectorAll('.strength-category h5').forEach(header => {
        header.addEventListener('click', function() {
            const category = this.closest('.strength-category');
            category.classList.toggle('expanded');
        });
    });
}

function loadSavedStrengths() {
    // Load selected strengths
    const selectedStrengths = JSON.parse(localStorage.getItem('selectedStrengths') || '[]');
    if (selectedStrengths.length > 0) {
        selectedStrengths.forEach(strength => {
            const checkbox = document.querySelector(`input[value="${strength.value}"]`);
            if (checkbox) {
                checkbox.checked = true;
            }
        });
        updateSelectedStrengths();
    }
    
    // Load strength scoring
    const scoring = JSON.parse(localStorage.getItem('strengthScoring') || '{}');
    Object.keys(scoring).forEach(strength => {
        const slider = document.querySelector(`[data-strength="${strength}"] .score-slider`);
        const textarea = document.querySelector(`[data-strength="${strength}"] textarea`);
        if (slider) {
            slider.value = scoring[strength].score;
            slider.nextElementSibling.textContent = scoring[strength].score;
        }
        if (textarea) {
            textarea.value = scoring[strength].description || '';
        }
    });
}

// Export functions for use in main file
window.initStrengthsFinder = initStrengthsFinder;
window.updateSelectedStrengths = updateSelectedStrengths;
window.startGallupAssessment = startGallupAssessment;
window.startVIAAssessment = startVIAAssessment;
window.startCustomAssessment = startCustomAssessment;
window.completeCustomAssessment = completeCustomAssessment;
window.updateStrengthsScoringList = updateStrengthsScoringList;
window.updateStrengthsInsights = updateStrengthsInsights;
window.loadSavedStrengths = loadSavedStrengths;
