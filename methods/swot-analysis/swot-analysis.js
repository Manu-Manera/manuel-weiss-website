// SWOT-Analyse JavaScript Functions

let swotData = {
    strengths: {
        personal: [],
        professional: [],
        education: [],
        network: []
    },
    weaknesses: {
        personal: [],
        professional: [],
        education: [],
        network: []
    },
    opportunities: {
        professional: [],
        market: [],
        education: [],
        network: []
    },
    risks: {
        professional: [],
        market: [],
        education: [],
        network: []
    }
};

function initSwotAnalysis() {
    console.log('Initializing SWOT Analysis...');
    
    // Load saved data
    loadSavedSwotData();
    
    // Initialize UI
    updateSwotSummary();
}

function addStrength(category) {
    const categoryElement = document.querySelector(`.strength-category:nth-child(${getCategoryIndex(category)})`);
    const strengthList = categoryElement.querySelector('.strength-list');
    const newStrength = document.createElement('div');
    newStrength.className = 'strength-item';
    newStrength.innerHTML = `
        <input type="text" placeholder="z.B. 'Kommunikationsfähigkeit'" class="strength-input">
        <button class="btn btn-sm btn-danger" onclick="removeStrength(this)">×</button>
    `;
    strengthList.appendChild(newStrength);
    updateSwotSummary();
}

function addWeakness(category) {
    const categoryElement = document.querySelector(`.weakness-category:nth-child(${getCategoryIndex(category)})`);
    const weaknessList = categoryElement.querySelector('.weakness-list');
    const newWeakness = document.createElement('div');
    newWeakness.className = 'weakness-item';
    newWeakness.innerHTML = `
        <input type="text" placeholder="z.B. 'Prokrastination'" class="weakness-input">
        <button class="btn btn-sm btn-danger" onclick="removeWeakness(this)">×</button>
    `;
    weaknessList.appendChild(newWeakness);
    updateSwotSummary();
}

function addOpportunity(category) {
    const categoryElement = document.querySelector(`.opportunity-category:nth-child(${getCategoryIndex(category)})`);
    const opportunityList = categoryElement.querySelector('.opportunity-list');
    const newOpportunity = document.createElement('div');
    newOpportunity.className = 'opportunity-item';
    newOpportunity.innerHTML = `
        <input type="text" placeholder="z.B. 'Neue Technologien'" class="opportunity-input">
        <button class="btn btn-sm btn-danger" onclick="removeOpportunity(this)">×</button>
    `;
    opportunityList.appendChild(newOpportunity);
    updateSwotSummary();
}

function addRisk(category) {
    const categoryElement = document.querySelector(`.risk-category:nth-child(${getCategoryIndex(category)})`);
    const riskList = categoryElement.querySelector('.risk-list');
    const newRisk = document.createElement('div');
    newRisk.className = 'risk-item';
    newRisk.innerHTML = `
        <input type="text" placeholder="z.B. 'Automatisierung'" class="risk-input">
        <select class="risk-level">
            <option value="low">Niedrig</option>
            <option value="medium">Mittel</option>
            <option value="high">Hoch</option>
        </select>
        <button class="btn btn-sm btn-danger" onclick="removeRisk(this)">×</button>
    `;
    riskList.appendChild(newRisk);
    updateSwotSummary();
}

function removeStrength(button) {
    button.parentElement.remove();
    updateSwotSummary();
}

function removeWeakness(button) {
    button.parentElement.remove();
    updateSwotSummary();
}

function removeOpportunity(button) {
    button.parentElement.remove();
    updateSwotSummary();
}

function removeRisk(button) {
    button.parentElement.remove();
    updateSwotSummary();
}

function getCategoryIndex(category) {
    const categoryMap = {
        'personal': 1,
        'professional': 2,
        'education': 3,
        'network': 4,
        'market': 2
    };
    return categoryMap[category] || 1;
}

function updateSwotSummary() {
    // Update strengths summary
    const totalStrengths = document.querySelectorAll('.strength-input').length;
    document.getElementById('total-strengths').textContent = totalStrengths;
    
    // Update weaknesses summary
    const totalWeaknesses = document.querySelectorAll('.weakness-input').length;
    document.getElementById('total-weaknesses').textContent = totalWeaknesses;
    document.getElementById('improvement-areas').textContent = totalWeaknesses;
    
    // Update opportunities summary
    const totalOpportunities = document.querySelectorAll('.opportunity-input').length;
    document.getElementById('total-opportunities').textContent = totalOpportunities;
    document.getElementById('high-potential').textContent = totalOpportunities;
    
    // Update risks summary
    const totalRisks = document.querySelectorAll('.risk-input').length;
    const highRisks = document.querySelectorAll('.risk-level[value="high"]:checked, .risk-level option[value="high"]:checked').length;
    document.getElementById('total-risks').textContent = totalRisks;
    document.getElementById('high-risks').textContent = highRisks;
    
    // Update SWOT matrix
    updateSwotMatrix();
    
    // Update action strategies
    updateActionStrategies();
    
    // Save data
    saveSwotData();
}

function updateSwotMatrix() {
    // Update strengths content
    const strengthsContent = document.getElementById('strengths-content');
    const strengths = Array.from(document.querySelectorAll('.strength-input')).map(input => input.value.trim()).filter(v => v);
    strengthsContent.innerHTML = strengths.length > 0 ? 
        strengths.map(strength => `<div class="matrix-item">${strength}</div>`).join('') :
        '<p>Fülle die Stärken aus, um sie hier zu sehen.</p>';
    
    // Update weaknesses content
    const weaknessesContent = document.getElementById('weaknesses-content');
    const weaknesses = Array.from(document.querySelectorAll('.weakness-input')).map(input => input.value.trim()).filter(v => v);
    weaknessesContent.innerHTML = weaknesses.length > 0 ? 
        weaknesses.map(weakness => `<div class="matrix-item">${weakness}</div>`).join('') :
        '<p>Fülle die Schwächen aus, um sie hier zu sehen.</p>';
    
    // Update opportunities content
    const opportunitiesContent = document.getElementById('opportunities-content');
    const opportunities = Array.from(document.querySelectorAll('.opportunity-input')).map(input => input.value.trim()).filter(v => v);
    opportunitiesContent.innerHTML = opportunities.length > 0 ? 
        opportunities.map(opportunity => `<div class="matrix-item">${opportunity}</div>`).join('') :
        '<p>Fülle die Chancen aus, um sie hier zu sehen.</p>';
    
    // Update risks content
    const risksContent = document.getElementById('risks-content');
    const risks = Array.from(document.querySelectorAll('.risk-input')).map(input => input.value.trim()).filter(v => v);
    risksContent.innerHTML = risks.length > 0 ? 
        risks.map(risk => `<div class="matrix-item">${risk}</div>`).join('') :
        '<p>Fülle die Risiken aus, um sie hier zu sehen.</p>';
}

function updateActionStrategies() {
    const strengths = Array.from(document.querySelectorAll('.strength-input')).map(input => input.value.trim()).filter(v => v);
    const weaknesses = Array.from(document.querySelectorAll('.weakness-input')).map(input => input.value.trim()).filter(v => v);
    const opportunities = Array.from(document.querySelectorAll('.opportunity-input')).map(input => input.value.trim()).filter(v => v);
    const risks = Array.from(document.querySelectorAll('.risk-input')).map(input => input.value.trim()).filter(v => v);
    
    // SO Strategy (Strengths + Opportunities)
    const soStrategies = document.getElementById('so-strategies');
    if (strengths.length > 0 && opportunities.length > 0) {
        soStrategies.innerHTML = `
            <div class="strategy-item">
                <strong>Nutze deine Stärken für Chancen:</strong>
                <ul>
                    <li>Setze ${strengths[0]} ein, um ${opportunities[0]} zu nutzen</li>
                    <li>Kombiniere mehrere Stärken für maximale Wirkung</li>
                    <li>Entwickle einen Aktionsplan für die wichtigsten Chancen</li>
                </ul>
            </div>
        `;
    } else {
        soStrategies.innerHTML = '<p>Fülle Stärken und Chancen aus, um Strategien zu sehen.</p>';
    }
    
    // WO Strategy (Weaknesses + Opportunities)
    const woStrategies = document.getElementById('wo-strategies');
    if (weaknesses.length > 0 && opportunities.length > 0) {
        woStrategies.innerHTML = `
            <div class="strategy-item">
                <strong>Überwinde Schwächen für Chancen:</strong>
                <ul>
                    <li>Arbeite an ${weaknesses[0]}, um ${opportunities[0]} zu nutzen</li>
                    <li>Suche Unterstützung oder Weiterbildung</li>
                    <li>Setze Prioritäten bei der Schwächenbehebung</li>
                </ul>
            </div>
        `;
    } else {
        woStrategies.innerHTML = '<p>Fülle Schwächen und Chancen aus, um Strategien zu sehen.</p>';
    }
    
    // ST Strategy (Strengths + Risks)
    const stStrategies = document.getElementById('st-strategies');
    if (strengths.length > 0 && risks.length > 0) {
        stStrategies.innerHTML = `
            <div class="strategy-item">
                <strong>Nutze Stärken gegen Risiken:</strong>
                <ul>
                    <li>Setze ${strengths[0]} ein, um ${risks[0]} abzuwehren</li>
                    <li>Entwickle Präventionsstrategien</li>
                    <li>Baue auf deinen Stärken auf</li>
                </ul>
            </div>
        `;
    } else {
        stStrategies.innerHTML = '<p>Fülle Stärken und Risiken aus, um Strategien zu sehen.</p>';
    }
    
    // WT Strategy (Weaknesses + Risks)
    const wtStrategies = document.getElementById('wt-strategies');
    if (weaknesses.length > 0 && risks.length > 0) {
        wtStrategies.innerHTML = `
            <div class="strategy-item">
                <strong>Minimiere Schwächen und Risiken:</strong>
                <ul>
                    <li>Arbeite an ${weaknesses[0]}, um ${risks[0]} zu vermeiden</li>
                    <li>Entwickle Notfallpläne</li>
                    <li>Suche externe Unterstützung</li>
                </ul>
            </div>
        `;
    } else {
        wtStrategies.innerHTML = '<p>Fülle Schwächen und Risiken aus, um Strategien zu sehen.</p>';
    }
}

// Data persistence functions
function saveSwotData() {
    // Save strengths
    swotData.strengths.personal = Array.from(document.querySelectorAll('.strength-category:nth-child(1) .strength-input')).map(input => input.value.trim()).filter(v => v);
    swotData.strengths.professional = Array.from(document.querySelectorAll('.strength-category:nth-child(2) .strength-input')).map(input => input.value.trim()).filter(v => v);
    swotData.strengths.education = Array.from(document.querySelectorAll('.strength-category:nth-child(3) .strength-input')).map(input => input.value.trim()).filter(v => v);
    swotData.strengths.network = Array.from(document.querySelectorAll('.strength-category:nth-child(4) .strength-input')).map(input => input.value.trim()).filter(v => v);
    
    // Save weaknesses
    swotData.weaknesses.personal = Array.from(document.querySelectorAll('.weakness-category:nth-child(1) .weakness-input')).map(input => input.value.trim()).filter(v => v);
    swotData.weaknesses.professional = Array.from(document.querySelectorAll('.weakness-category:nth-child(2) .weakness-input')).map(input => input.value.trim()).filter(v => v);
    swotData.weaknesses.education = Array.from(document.querySelectorAll('.weakness-category:nth-child(3) .weakness-input')).map(input => input.value.trim()).filter(v => v);
    swotData.weaknesses.network = Array.from(document.querySelectorAll('.weakness-category:nth-child(4) .weakness-input')).map(input => input.value.trim()).filter(v => v);
    
    // Save opportunities
    swotData.opportunities.professional = Array.from(document.querySelectorAll('.opportunity-category:nth-child(1) .opportunity-input')).map(input => input.value.trim()).filter(v => v);
    swotData.opportunities.market = Array.from(document.querySelectorAll('.opportunity-category:nth-child(2) .opportunity-input')).map(input => input.value.trim()).filter(v => v);
    swotData.opportunities.education = Array.from(document.querySelectorAll('.opportunity-category:nth-child(3) .opportunity-input')).map(input => input.value.trim()).filter(v => v);
    swotData.opportunities.network = Array.from(document.querySelectorAll('.opportunity-category:nth-child(4) .opportunity-input')).map(input => input.value.trim()).filter(v => v);
    
    // Save risks
    swotData.risks.professional = Array.from(document.querySelectorAll('.risk-category:nth-child(1) .risk-input')).map(input => input.value.trim()).filter(v => v);
    swotData.risks.market = Array.from(document.querySelectorAll('.risk-category:nth-child(2) .risk-input')).map(input => input.value.trim()).filter(v => v);
    swotData.risks.education = Array.from(document.querySelectorAll('.risk-category:nth-child(3) .risk-input')).map(input => input.value.trim()).filter(v => v);
    swotData.risks.network = Array.from(document.querySelectorAll('.risk-category:nth-child(4) .risk-input')).map(input => input.value.trim()).filter(v => v);
    
    localStorage.setItem('swot-analysis-data', JSON.stringify(swotData));
}

function loadSavedSwotData() {
    const saved = localStorage.getItem('swot-analysis-data');
    if (saved) {
        swotData = JSON.parse(saved);
        
        // Restore strengths
        restoreCategoryData('strength', swotData.strengths);
        
        // Restore weaknesses
        restoreCategoryData('weakness', swotData.weaknesses);
        
        // Restore opportunities
        restoreCategoryData('opportunity', swotData.opportunities);
        
        // Restore risks
        restoreCategoryData('risk', swotData.risks);
    }
}

function restoreCategoryData(type, data) {
    const categories = ['personal', 'professional', 'education', 'network'];
    categories.forEach((category, index) => {
        const categoryData = data[category] || [];
        const categoryElement = document.querySelector(`.${type}-category:nth-child(${index + 1})`);
        if (categoryElement && categoryData.length > 0) {
            const list = categoryElement.querySelector(`.${type}-list`);
            list.innerHTML = '';
            
            categoryData.forEach(item => {
                const newItem = document.createElement('div');
                newItem.className = `${type}-item`;
                if (type === 'risk') {
                    newItem.innerHTML = `
                        <input type="text" value="${item}" class="${type}-input">
                        <select class="risk-level">
                            <option value="low">Niedrig</option>
                            <option value="medium">Mittel</option>
                            <option value="high">Hoch</option>
                        </select>
                        <button class="btn btn-sm btn-danger" onclick="remove${type.charAt(0).toUpperCase() + type.slice(1)}(this)">×</button>
                    `;
                } else {
                    newItem.innerHTML = `
                        <input type="text" value="${item}" class="${type}-input">
                        <button class="btn btn-sm btn-danger" onclick="remove${type.charAt(0).toUpperCase() + type.slice(1)}(this)">×</button>
                    `;
                }
                list.appendChild(newItem);
            });
        }
    });
}
