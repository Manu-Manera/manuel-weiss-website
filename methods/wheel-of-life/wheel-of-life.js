// Wheel of Life JavaScript Functions

let wheelData = {
    categories: {
        career: 5,
        finances: 5,
        family: 5,
        social: 5,
        development: 5,
        health: 5,
        hobbies: 5,
        spirituality: 5
    },
    priorities: [],
    actionPlan: []
};

function initWheelOfLife() {
    console.log('Initializing Wheel of Life...');
    
    // Load saved data
    loadSavedWheelData();
    
    // Setup event listeners
    setupWheelEventListeners();
    
    // Initialize UI
    updateWheelVisual();
    updateBalanceScore();
}

function setupWheelEventListeners() {
    // Life slider changes
    document.querySelectorAll('.life-slider').forEach(slider => {
        slider.addEventListener('input', function() {
            const value = this.value;
            const category = this.dataset.category;
            const valueSpan = this.nextElementSibling;
            
            valueSpan.textContent = value;
            wheelData.categories[category] = parseInt(value);
            
            updateWheelVisual();
            updateBalanceScore();
            saveWheelData();
        });
    });
}

function updateWheelVisual() {
    const wheelVisual = document.getElementById('wheel-visual');
    const categories = [
        { name: 'Karriere', value: wheelData.categories.career, color: '#3b82f6' },
        { name: 'Finanzen', value: wheelData.categories.finances, color: '#10b981' },
        { name: 'Familie', value: wheelData.categories.family, color: '#f59e0b' },
        { name: 'Freunde', value: wheelData.categories.social, color: '#ef4444' },
        { name: 'Entwicklung', value: wheelData.categories.development, color: '#8b5cf6' },
        { name: 'Gesundheit', value: wheelData.categories.health, color: '#06b6d4' },
        { name: 'Hobbys', value: wheelData.categories.hobbies, color: '#84cc16' },
        { name: 'Spiritualität', value: wheelData.categories.spirituality, color: '#f97316' }
    ];
    
    let wheelHTML = '<div class="wheel-container">';
    
    categories.forEach((category, index) => {
        const angle = (index * 45) - 90; // Start from top
        const x = 50 + Math.cos(angle * Math.PI / 180) * 30;
        const y = 50 + Math.sin(angle * Math.PI / 180) * 30;
        
        wheelHTML += `
            <div class="wheel-segment" style="transform: rotate(${angle}deg);">
                <div class="segment-bar" style="height: ${category.value * 10}%; background-color: ${category.color};"></div>
                <div class="segment-label" style="transform: rotate(-${angle}deg);">${category.name}</div>
            </div>
        `;
    });
    
    wheelHTML += '</div>';
    wheelVisual.innerHTML = wheelHTML;
}

function updateBalanceScore() {
    const values = Object.values(wheelData.categories);
    const average = values.reduce((sum, value) => sum + value, 0) / values.length;
    document.getElementById('balance-score').textContent = average.toFixed(1);
    
    // Update insights
    updateBalanceInsights();
}

function updateBalanceInsights() {
    const categories = [
        { name: 'Karriere & Beruf', value: wheelData.categories.career },
        { name: 'Finanzen', value: wheelData.categories.finances },
        { name: 'Familie & Beziehungen', value: wheelData.categories.family },
        { name: 'Freunde & Soziales', value: wheelData.categories.social },
        { name: 'Persönliche Entwicklung', value: wheelData.categories.development },
        { name: 'Gesundheit & Fitness', value: wheelData.categories.health },
        { name: 'Hobbys & Freizeit', value: wheelData.categories.hobbies },
        { name: 'Spiritualität & Sinn', value: wheelData.categories.spirituality }
    ];
    
    // Find strongest areas (7+)
    const strongest = categories.filter(cat => cat.value >= 7).sort((a, b) => b.value - a.value);
    const strongestContent = document.getElementById('strongest-areas');
    if (strongest.length > 0) {
        strongestContent.innerHTML = strongest.map(cat => 
            `<div class="area-item strong">${cat.name}: ${cat.value}/10</div>`
        ).join('');
    } else {
        strongestContent.innerHTML = '<p>Keine Bereiche mit hoher Zufriedenheit (7+) gefunden.</p>';
    }
    
    // Find improvement areas (5-)
    const improvement = categories.filter(cat => cat.value <= 5).sort((a, b) => a.value - b.value);
    const improvementContent = document.getElementById('improvement-areas');
    if (improvement.length > 0) {
        improvementContent.innerHTML = improvement.map(cat => 
            `<div class="area-item weak">${cat.name}: ${cat.value}/10</div>`
        ).join('');
    } else {
        improvementContent.innerHTML = '<p>Alle Bereiche haben eine gute Bewertung (6+).</p>';
    }
    
    // Balance trend
    const balanceContent = document.getElementById('balance-trend');
    const average = categories.reduce((sum, cat) => sum + cat.value, 0) / categories.length;
    const variance = categories.reduce((sum, cat) => sum + Math.pow(cat.value - average, 2), 0) / categories.length;
    const standardDeviation = Math.sqrt(variance);
    
    if (standardDeviation < 1.5) {
        balanceContent.innerHTML = '<p>✅ Gute Balance: Deine Lebensbereiche sind relativ ausgeglichen.</p>';
    } else if (standardDeviation < 2.5) {
        balanceContent.innerHTML = '<p>⚠️ Moderate Balance: Einige Bereiche benötigen mehr Aufmerksamkeit.</p>';
    } else {
        balanceContent.innerHTML = '<p>❌ Ungleichgewicht: Große Unterschiede zwischen den Lebensbereichen.</p>';
    }
    
    // Recommendations
    updateRecommendations();
}

function updateRecommendations() {
    const recommendations = document.getElementById('balance-recommendations');
    const categories = [
        { name: 'Karriere & Beruf', value: wheelData.categories.career },
        { name: 'Finanzen', value: wheelData.categories.finances },
        { name: 'Familie & Beziehungen', value: wheelData.categories.family },
        { name: 'Freunde & Soziales', value: wheelData.categories.social },
        { name: 'Persönliche Entwicklung', value: wheelData.categories.development },
        { name: 'Gesundheit & Fitness', value: wheelData.categories.health },
        { name: 'Hobbys & Freizeit', value: wheelData.categories.hobbies },
        { name: 'Spiritualität & Sinn', value: wheelData.categories.spirituality }
    ];
    
    const lowAreas = categories.filter(cat => cat.value <= 5);
    let recommendationsHTML = '';
    
    if (lowAreas.length > 0) {
        recommendationsHTML = '<h5>🎯 Fokussiere dich auf diese Bereiche:</h5><ul>';
        lowAreas.forEach(area => {
            recommendationsHTML += `<li><strong>${area.name}</strong>: Entwickle konkrete Schritte zur Verbesserung</li>`;
        });
        recommendationsHTML += '</ul>';
    } else {
        recommendationsHTML = '<p>✅ Alle Bereiche haben eine gute Bewertung. Fokussiere dich auf die Bereiche mit dem größten Verbesserungspotential.</p>';
    }
    
    recommendations.innerHTML = recommendationsHTML;
}

function updatePriorityOptions() {
    const categories = [
        { name: 'Karriere & Beruf', value: wheelData.categories.career, key: 'career' },
        { name: 'Finanzen', value: wheelData.categories.finances, key: 'finances' },
        { name: 'Familie & Beziehungen', value: wheelData.categories.family, key: 'family' },
        { name: 'Freunde & Soziales', value: wheelData.categories.social, key: 'social' },
        { name: 'Persönliche Entwicklung', value: wheelData.categories.development, key: 'development' },
        { name: 'Gesundheit & Fitness', value: wheelData.categories.health, key: 'health' },
        { name: 'Hobbys & Freizeit', value: wheelData.categories.hobbies, key: 'hobbies' },
        { name: 'Spiritualität & Sinn', value: wheelData.categories.spirituality, key: 'spirituality' }
    ];
    
    const priorityOptions = document.getElementById('priority-options');
    priorityOptions.innerHTML = categories.map(category => `
        <div class="priority-option">
            <label>
                <input type="checkbox" value="${category.key}" onchange="togglePriority('${category.key}', this.checked)">
                <span class="priority-name">${category.name}</span>
                <span class="priority-score">${category.value}/10</span>
            </label>
        </div>
    `).join('');
}

function togglePriority(categoryKey, selected) {
    if (selected) {
        if (wheelData.priorities.length < 3) {
            wheelData.priorities.push(categoryKey);
        } else {
            showNotification('Du kannst maximal 3 Prioritäten auswählen!', 'warning');
            event.target.checked = false;
            return;
        }
    } else {
        wheelData.priorities = wheelData.priorities.filter(p => p !== categoryKey);
    }
    
    updateSelectedPriorities();
    updateActionPlan();
    saveWheelData();
}

function updateSelectedPriorities() {
    const selectedPriorities = document.getElementById('selected-priorities');
    
    if (wheelData.priorities.length === 0) {
        selectedPriorities.innerHTML = '<p>Wähle deine Prioritäten aus, um sie hier zu sehen.</p>';
        return;
    }
    
    const categoryNames = {
        career: 'Karriere & Beruf',
        finances: 'Finanzen',
        family: 'Familie & Beziehungen',
        social: 'Freunde & Soziales',
        development: 'Persönliche Entwicklung',
        health: 'Gesundheit & Fitness',
        hobbies: 'Hobbys & Freizeit',
        spirituality: 'Spiritualität & Sinn'
    };
    
    selectedPriorities.innerHTML = wheelData.priorities.map((priority, index) => `
        <div class="priority-item">
            <span class="priority-number">${index + 1}</span>
            <span class="priority-name">${categoryNames[priority]}</span>
            <span class="priority-score">${wheelData.categories[priority]}/10</span>
        </div>
    `).join('');
}

function updateActionPlan() {
    const actionAreas = document.getElementById('action-areas');
    
    if (wheelData.priorities.length === 0) {
        actionAreas.innerHTML = '<p>Setze Prioritäten, um deinen Aktionsplan zu erstellen.</p>';
        return;
    }
    
    const categoryNames = {
        career: 'Karriere & Beruf',
        finances: 'Finanzen',
        family: 'Familie & Beziehungen',
        social: 'Freunde & Soziales',
        development: 'Persönliche Entwicklung',
        health: 'Gesundheit & Fitness',
        hobbies: 'Hobbys & Freizeit',
        spirituality: 'Spiritualität & Sinn'
    };
    
    const actionSuggestions = {
        career: [
            'Neue Fähigkeiten erlernen',
            'Networking-Events besuchen',
            'Mentor finden',
            'Karriereziele definieren'
        ],
        finances: [
            'Budget erstellen',
            'Sparplan entwickeln',
            'Investitionen lernen',
            'Schulden reduzieren'
        ],
        family: [
            'Qualitätszeit planen',
            'Kommunikation verbessern',
            'Gemeinsame Aktivitäten',
            'Konflikte lösen'
        ],
        social: [
            'Neue Kontakte knüpfen',
            'Freundschaften pflegen',
            'Soziale Aktivitäten',
            'Community beitreten'
        ],
        development: [
            'Bücher lesen',
            'Kurse besuchen',
            'Neue Hobbys',
            'Reflexion üben'
        ],
        health: [
            'Sport treiben',
            'Gesunde Ernährung',
            'Stress reduzieren',
            'Regelmäßige Check-ups'
        ],
        hobbies: [
            'Neue Interessen entdecken',
            'Kreative Projekte',
            'Zeit für Hobbys',
            'Leidenschaften verfolgen'
        ],
        spirituality: [
            'Meditation üben',
            'Sinn finden',
            'Werte klären',
            'Achtsamkeit entwickeln'
        ]
    };
    
    actionAreas.innerHTML = wheelData.priorities.map(priority => `
        <div class="action-area">
            <h5>${categoryNames[priority]}</h5>
            <div class="action-suggestions">
                ${actionSuggestions[priority].map(suggestion => `
                    <div class="action-item">
                        <input type="checkbox" onchange="toggleAction('${priority}', '${suggestion}', this.checked)">
                        <span>${suggestion}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
    
    updatePlanSummary();
}

function toggleAction(priority, action, selected) {
    if (!wheelData.actionPlan[priority]) {
        wheelData.actionPlan[priority] = [];
    }
    
    if (selected) {
        wheelData.actionPlan[priority].push(action);
    } else {
        wheelData.actionPlan[priority] = wheelData.actionPlan[priority].filter(a => a !== action);
    }
    
    updatePlanSummary();
    saveWheelData();
}

function updatePlanSummary() {
    const totalActions = Object.values(wheelData.actionPlan).reduce((sum, actions) => sum + actions.length, 0);
    const priorityAreas = wheelData.priorities.length;
    const estimatedTime = Math.ceil(totalActions / 2); // Rough estimate
    
    document.getElementById('total-actions').textContent = totalActions;
    document.getElementById('priority-areas').textContent = priorityAreas;
    document.getElementById('estimated-time').textContent = estimatedTime;
}

// Data persistence functions
function saveWheelData() {
    localStorage.setItem('wheel-of-life-data', JSON.stringify(wheelData));
}

function loadSavedWheelData() {
    const saved = localStorage.getItem('wheel-of-life-data');
    if (saved) {
        wheelData = JSON.parse(saved);
        
        // Restore slider values
        Object.keys(wheelData.categories).forEach(category => {
            const slider = document.querySelector(`[data-category="${category}"]`);
            if (slider) {
                slider.value = wheelData.categories[category];
                slider.nextElementSibling.textContent = wheelData.categories[category];
            }
        });
        
        // Restore priorities
        updatePriorityOptions();
        wheelData.priorities.forEach(priority => {
            const checkbox = document.querySelector(`input[value="${priority}"]`);
            if (checkbox) {
                checkbox.checked = true;
            }
        });
        
        updateSelectedPriorities();
        updateActionPlan();
    }
}
