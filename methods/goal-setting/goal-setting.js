// Ziel-Setting JavaScript Functions

let currentGoal = null;
let goals = [];
let actionSteps = [];
let milestones = [];
let habitStacks = [];
let dailyProgress = [];
let reviews = [];

function initGoalSetting() {
    console.log('Initializing Goal Setting...');
    
    // Load saved data
    loadSavedGoals();
    loadSavedProgress();
    
    // Setup event listeners
    setupGoalEventListeners();
    
    // Initialize goal categories
    initializeGoalCategories();
    
    // Set today's date
    document.getElementById('tracking-date').value = new Date().toISOString().split('T')[0];
    
    // Update dashboard
    updateDashboard();
}

function setupGoalEventListeners() {
    // Goal category selection
    document.querySelectorAll('.goal-category').forEach(category => {
        category.addEventListener('click', () => selectGoalCategory(category.dataset.category));
    });
    
    // SMART goal inputs
    document.querySelectorAll('#goal-formulation textarea, #goal-formulation select').forEach(input => {
        input.addEventListener('input', updateSmartGoalPreview);
    });
    
    // Progress feeling slider
    const feelingSlider = document.getElementById('progress-feeling');
    if (feelingSlider) {
        feelingSlider.addEventListener('input', (e) => {
            document.getElementById('feeling-value').textContent = e.target.value;
        });
    }
    
    // Satisfaction rating slider
    const satisfactionSlider = document.getElementById('satisfaction-rating');
    if (satisfactionSlider) {
        satisfactionSlider.addEventListener('input', (e) => {
            document.getElementById('satisfaction-value').textContent = e.target.value;
        });
    }
}

function initializeGoalCategories() {
    // Add click handlers to goal categories
    document.querySelectorAll('.goal-category').forEach(category => {
        category.addEventListener('click', () => {
            document.querySelectorAll('.goal-category').forEach(c => c.classList.remove('active'));
            category.classList.add('active');
        });
    });
}

function selectGoalCategory(category) {
    const categoryNames = {
        'beruf': 'Beruf & Karriere',
        'gesundheit': 'Gesundheit & Fitness',
        'beziehungen': 'Beziehungen',
        'finanzen': 'Finanzen',
        'bildung': 'Bildung & Lernen',
        'hobby': 'Hobbys & Interessen'
    };
    
    const goalText = prompt(`Was ist dein Ziel in der Kategorie "${categoryNames[category]}"?`);
    if (goalText && goalText.trim()) {
        addGoal(category, goalText.trim());
    }
}

function addGoal(category, text) {
    const goal = {
        id: Date.now(),
        category: category,
        text: text,
        smart: null,
        actionSteps: [],
        milestones: [],
        habitStacks: [],
        createdAt: new Date().toISOString(),
        status: 'active'
    };
    
    goals.push(goal);
    saveGoals();
    updateGoalsList();
    updateDashboard();
    
    showNotification('Ziel hinzugefügt!', 'success');
}

function updateGoalsList() {
    const goalsList = document.getElementById('goals-list');
    
    if (goals.length === 0) {
        goalsList.innerHTML = '<div class="no-goals"><p>Klicke auf eine Kategorie, um dein erstes Ziel hinzuzufügen.</p></div>';
        return;
    }
    
    goalsList.innerHTML = goals.map(goal => `
        <div class="goal-item" data-goal-id="${goal.id}">
            <div class="goal-content">
                <div class="goal-text">${goal.text}</div>
                <div class="goal-category-badge">${getCategoryName(goal.category)}</div>
            </div>
            <div class="goal-actions">
                <button class="btn btn-sm btn-primary" onclick="selectGoal(${goal.id})">Bearbeiten</button>
                <button class="btn btn-sm btn-danger" onclick="deleteGoal(${goal.id})">Löschen</button>
            </div>
        </div>
    `).join('');
}

function getCategoryName(category) {
    const names = {
        'beruf': 'Beruf',
        'gesundheit': 'Gesundheit',
        'beziehungen': 'Beziehungen',
        'finanzen': 'Finanzen',
        'bildung': 'Bildung',
        'hobby': 'Hobby'
    };
    return names[category] || category;
}

function selectGoal(goalId) {
    currentGoal = goals.find(g => g.id === goalId);
    if (currentGoal) {
        document.getElementById('current-goal-name').textContent = currentGoal.text;
        loadGoalForEditing();
        showNotification('Ziel ausgewählt!', 'info');
    }
}

function deleteGoal(goalId) {
    if (confirm('Möchtest du dieses Ziel wirklich löschen?')) {
        goals = goals.filter(g => g.id !== goalId);
        saveGoals();
        updateGoalsList();
        updateDashboard();
        showNotification('Ziel gelöscht!', 'warning');
    }
}

function loadGoalForEditing() {
    if (!currentGoal) return;
    
    // Load SMART criteria if available
    if (currentGoal.smart) {
        document.getElementById('goal-category-select').value = currentGoal.category;
        document.getElementById('specific-goal').value = currentGoal.smart.specific || '';
        document.getElementById('measurable-goal').value = currentGoal.smart.measurable || '';
        document.getElementById('attractive-goal').value = currentGoal.smart.attractive || '';
        document.getElementById('realistic-goal').value = currentGoal.smart.realistic || '';
        document.getElementById('timed-goal').value = currentGoal.smart.timed || '';
    }
    
    // Load action steps
    loadActionSteps();
    
    // Load milestones
    loadMilestones();
}

function generateSmartGoal() {
    const specific = document.getElementById('specific-goal').value;
    const measurable = document.getElementById('measurable-goal').value;
    const attractive = document.getElementById('attractive-goal').value;
    const realistic = document.getElementById('realistic-goal').value;
    const timed = document.getElementById('timed-goal').value;
    
    if (!specific || !measurable || !attractive || !realistic || !timed) {
        showNotification('Bitte fülle alle SMART-Kriterien aus!', 'warning');
        return;
    }
    
    const smartGoal = `Ich will ${specific.toLowerCase()} bis ${timed.toLowerCase()}. Ich kann den Erfolg daran messen, dass ${measurable.toLowerCase()}. Das ist wichtig für mich, weil ${attractive.toLowerCase()}. Das Ziel ist realistisch, weil ${realistic.toLowerCase()}.`;
    
    document.getElementById('smart-goal-text').textContent = smartGoal;
    
    // Save SMART goal
    if (currentGoal) {
        currentGoal.smart = {
            specific: specific,
            measurable: measurable,
            attractive: attractive,
            realistic: realistic,
            timed: timed,
            fullText: smartGoal
        };
        saveGoals();
    }
    
    showNotification('SMART-Ziel generiert!', 'success');
}

function updateSmartGoalPreview() {
    const specific = document.getElementById('specific-goal').value;
    const measurable = document.getElementById('measurable-goal').value;
    const attractive = document.getElementById('attractive-goal').value;
    const realistic = document.getElementById('realistic-goal').value;
    const timed = document.getElementById('timed-goal').value;
    
    if (specific && measurable && attractive && realistic && timed) {
        generateSmartGoal();
    }
}

function saveGoal() {
    if (!currentGoal) {
        showNotification('Wähle zuerst ein Ziel aus!', 'warning');
        return;
    }
    
    generateSmartGoal();
    saveGoals();
    showNotification('Ziel gespeichert!', 'success');
}

function addActionStep() {
    if (!currentGoal) {
        showNotification('Wähle zuerst ein Ziel aus!', 'warning');
        return;
    }
    
    const step = {
        id: Date.now(),
        title: document.getElementById('step-title').value,
        description: document.getElementById('step-description').value,
        deadline: document.getElementById('step-deadline').value,
        priority: document.getElementById('step-priority').value,
        resources: document.getElementById('step-resources').value,
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    if (!step.title || !step.description) {
        showNotification('Bitte fülle mindestens Titel und Beschreibung aus!', 'warning');
        return;
    }
    
    currentGoal.actionSteps.push(step);
    saveGoals();
    loadActionSteps();
    
    // Clear form
    document.getElementById('step-title').value = '';
    document.getElementById('step-description').value = '';
    document.getElementById('step-deadline').value = '';
    document.getElementById('step-resources').value = '';
    
    showNotification('Aktionsschritt hinzugefügt!', 'success');
}

function loadActionSteps() {
    const planSteps = document.getElementById('plan-steps');
    
    if (!currentGoal || !currentGoal.actionSteps || currentGoal.actionSteps.length === 0) {
        planSteps.innerHTML = '<div class="no-plan"><p>Füge Aktionsschritte hinzu, um deinen Plan zu erstellen.</p></div>';
        return;
    }
    
    planSteps.innerHTML = currentGoal.actionSteps.map((step, index) => `
        <div class="action-step-item ${step.completed ? 'completed' : ''}" data-step-id="${step.id}">
            <div class="step-header">
                <h5>${step.title}</h5>
                <div class="step-meta">
                    <span class="priority-badge priority-${step.priority}">${step.priority}</span>
                    ${step.deadline ? `<span class="deadline">📅 ${new Date(step.deadline).toLocaleDateString()}</span>` : ''}
                </div>
            </div>
            <div class="step-description">${step.description}</div>
            ${step.resources ? `<div class="step-resources"><strong>Ressourcen:</strong> ${step.resources}</div>` : ''}
            <div class="step-actions">
                <button class="btn btn-sm ${step.completed ? 'btn-secondary' : 'btn-success'}" onclick="toggleStepCompletion(${step.id})">
                    ${step.completed ? 'Rückgängig' : 'Erledigt'}
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteActionStep(${step.id})">Löschen</button>
            </div>
        </div>
    `).join('');
}

function toggleStepCompletion(stepId) {
    if (!currentGoal) return;
    
    const step = currentGoal.actionSteps.find(s => s.id === stepId);
    if (step) {
        step.completed = !step.completed;
        step.completedAt = step.completed ? new Date().toISOString() : null;
        saveGoals();
        loadActionSteps();
        updateDashboard();
        
        showNotification(step.completed ? 'Schritt als erledigt markiert!' : 'Schritt wieder geöffnet!', 'info');
    }
}

function deleteActionStep(stepId) {
    if (!currentGoal) return;
    
    if (confirm('Möchtest du diesen Aktionsschritt wirklich löschen?')) {
        currentGoal.actionSteps = currentGoal.actionSteps.filter(s => s.id !== stepId);
        saveGoals();
        loadActionSteps();
        showNotification('Aktionsschritt gelöscht!', 'warning');
    }
}

function addMilestone() {
    if (!currentGoal) {
        showNotification('Wähle zuerst ein Ziel aus!', 'warning');
        return;
    }
    
    const milestone = {
        id: Date.now(),
        title: document.getElementById('milestone-title').value,
        date: document.getElementById('milestone-date').value,
        reached: false,
        createdAt: new Date().toISOString()
    };
    
    if (!milestone.title || !milestone.date) {
        showNotification('Bitte fülle Titel und Datum aus!', 'warning');
        return;
    }
    
    currentGoal.milestones.push(milestone);
    saveGoals();
    loadMilestones();
    
    // Clear form
    document.getElementById('milestone-title').value = '';
    document.getElementById('milestone-date').value = '';
    
    showNotification('Meilenstein hinzugefügt!', 'success');
}

function loadMilestones() {
    const milestonesList = document.getElementById('milestones-list');
    
    if (!currentGoal || !currentGoal.milestones || currentGoal.milestones.length === 0) {
        milestonesList.innerHTML = '<div class="no-milestones"><p>Füge Meilensteine hinzu, um deinen Fortschritt zu verfolgen.</p></div>';
        return;
    }
    
    milestonesList.innerHTML = currentGoal.milestones.map(milestone => `
        <div class="milestone-item ${milestone.reached ? 'reached' : ''}" data-milestone-id="${milestone.id}">
            <div class="milestone-content">
                <h5>${milestone.title}</h5>
                <span class="milestone-date">📅 ${new Date(milestone.date).toLocaleDateString()}</span>
            </div>
            <div class="milestone-actions">
                <button class="btn btn-sm ${milestone.reached ? 'btn-secondary' : 'btn-success'}" onclick="toggleMilestone(${milestone.id})">
                    ${milestone.reached ? 'Nicht erreicht' : 'Erreicht'}
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteMilestone(${milestone.id})">Löschen</button>
            </div>
        </div>
    `).join('');
}

function toggleMilestone(milestoneId) {
    if (!currentGoal) return;
    
    const milestone = currentGoal.milestones.find(m => m.id === milestoneId);
    if (milestone) {
        milestone.reached = !milestone.reached;
        milestone.reachedAt = milestone.reached ? new Date().toISOString() : null;
        saveGoals();
        loadMilestones();
        updateDashboard();
        
        showNotification(milestone.reached ? 'Meilenstein erreicht! 🎉' : 'Meilenstein zurückgesetzt!', 'info');
    }
}

function deleteMilestone(milestoneId) {
    if (!currentGoal) return;
    
    if (confirm('Möchtest du diesen Meilenstein wirklich löschen?')) {
        currentGoal.milestones = currentGoal.milestones.filter(m => m.id !== milestoneId);
        saveGoals();
        loadMilestones();
        showNotification('Meilenstein gelöscht!', 'warning');
    }
}

function addExistingHabit() {
    const habitsList = document.getElementById('existing-habits-list');
    const newHabit = document.createElement('div');
    newHabit.className = 'habit-item';
    newHabit.innerHTML = `
        <input type="text" placeholder="z.B. 'Ich trinke morgens Kaffee'" class="habit-input">
        <button class="btn btn-sm btn-danger" onclick="removeHabit(this)">×</button>
    `;
    habitsList.appendChild(newHabit);
}

function addNewHabit() {
    const habitsList = document.getElementById('new-habits-list');
    const newHabit = document.createElement('div');
    newHabit.className = 'habit-item';
    newHabit.innerHTML = `
        <input type="text" placeholder="z.B. 'Ich lese 10 Seiten Fachliteratur'" class="habit-input">
        <button class="btn btn-sm btn-danger" onclick="removeHabit(this)">×</button>
    `;
    habitsList.appendChild(newHabit);
}

function removeHabit(button) {
    button.parentElement.remove();
}

function generateHabitStacks() {
    const existingHabits = Array.from(document.querySelectorAll('#existing-habits-list .habit-input')).map(input => input.value.trim()).filter(v => v);
    const newHabits = Array.from(document.querySelectorAll('#new-habits-list .habit-input')).map(input => input.value.trim()).filter(v => v);
    
    if (existingHabits.length === 0 || newHabits.length === 0) {
        showNotification('Füge mindestens eine bestehende und eine neue Gewohnheit hinzu!', 'warning');
        return;
    }
    
    const stacksList = document.getElementById('stacks-list');
    stacksList.innerHTML = '';
    
    // Generate combinations
    existingHabits.forEach(existing => {
        newHabits.forEach(newHabit => {
            const stackItem = document.createElement('div');
            stackItem.className = 'habit-stack-item';
            stackItem.innerHTML = `
                <div class="stack-formula">
                    <strong>Nach "${existing}" werde ich "${newHabit}"</strong>
                </div>
                <div class="stack-actions">
                    <button class="btn btn-sm btn-primary" onclick="saveHabitStack('${existing}', '${newHabit}')">Speichern</button>
                </div>
            `;
            stacksList.appendChild(stackItem);
        });
    });
    
    showNotification('Habit-Stacks generiert!', 'success');
}

function saveHabitStack(existing, newHabit) {
    if (!currentGoal) {
        showNotification('Wähle zuerst ein Ziel aus!', 'warning');
        return;
    }
    
    const stack = {
        id: Date.now(),
        existing: existing,
        new: newHabit,
        formula: `Nach "${existing}" werde ich "${newHabit}"`,
        active: false,
        createdAt: new Date().toISOString()
    };
    
    if (!currentGoal.habitStacks) {
        currentGoal.habitStacks = [];
    }
    
    currentGoal.habitStacks.push(stack);
    saveGoals();
    
    showNotification('Habit-Stack gespeichert!', 'success');
}

function saveDailyProgress() {
    const date = document.getElementById('tracking-date').value;
    const action = document.getElementById('daily-action').value;
    const feeling = document.getElementById('progress-feeling').value;
    const challenges = document.getElementById('challenges').value;
    
    if (!action.trim()) {
        showNotification('Bitte beschreibe deine heutigen Aktionen!', 'warning');
        return;
    }
    
    const progress = {
        id: Date.now(),
        date: date,
        action: action,
        feeling: parseInt(feeling),
        challenges: challenges,
        goalId: currentGoal ? currentGoal.id : null,
        createdAt: new Date().toISOString()
    };
    
    dailyProgress.push(progress);
    saveProgress();
    loadProgressHistory();
    
    // Clear form
    document.getElementById('daily-action').value = '';
    document.getElementById('challenges').value = '';
    document.getElementById('progress-feeling').value = '5';
    document.getElementById('feeling-value').textContent = '5';
    
    showNotification('Fortschritt gespeichert!', 'success');
}

function loadProgressHistory() {
    const historyList = document.getElementById('progress-history');
    
    if (dailyProgress.length === 0) {
        historyList.innerHTML = '<div class="no-history"><p>Beginne mit dem täglichen Tracking, um deinen Fortschritt zu verfolgen.</p></div>';
        return;
    }
    
    // Sort by date (newest first)
    const sortedProgress = dailyProgress.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    historyList.innerHTML = sortedProgress.map(progress => `
        <div class="progress-entry">
            <div class="entry-header">
                <h5>📅 ${new Date(progress.date).toLocaleDateString()}</h5>
                <span class="feeling-badge feeling-${progress.feeling}">Gefühl: ${progress.feeling}/10</span>
            </div>
            <div class="entry-content">
                <p><strong>Aktionen:</strong> ${progress.action}</p>
                ${progress.challenges ? `<p><strong>Herausforderungen:</strong> ${progress.challenges}</p>` : ''}
            </div>
        </div>
    `).join('');
}

function selectReviewPeriod(period) {
    document.querySelectorAll('.period-selector .btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    // Update review questions based on period
    updateReviewQuestions(period);
}

function updateReviewQuestions(period) {
    // This could be expanded to show different questions based on review period
    showNotification(`${period} Review ausgewählt!`, 'info');
}

function saveReview() {
    const satisfaction = document.getElementById('satisfaction-rating').value;
    const whatWorked = document.getElementById('what-worked').value;
    const whatChallenged = document.getElementById('what-challenged').value;
    const goalRelevance = document.getElementById('goal-relevance').value;
    const goalAdjustments = document.getElementById('goal-adjustments').value;
    const nextPriorities = document.getElementById('next-priorities').value;
    const neededSupport = document.getElementById('needed-support').value;
    
    if (!whatWorked.trim() || !whatChallenged.trim()) {
        showNotification('Bitte beantworte mindestens die Fragen zu Erfolgen und Herausforderungen!', 'warning');
        return;
    }
    
    const review = {
        id: Date.now(),
        period: document.querySelector('.period-selector .btn.active').textContent.toLowerCase(),
        satisfaction: parseInt(satisfaction),
        whatWorked: whatWorked,
        whatChallenged: whatChallenged,
        goalRelevance: goalRelevance,
        goalAdjustments: goalAdjustments,
        nextPriorities: nextPriorities,
        neededSupport: neededSupport,
        goalId: currentGoal ? currentGoal.id : null,
        createdAt: new Date().toISOString()
    };
    
    reviews.push(review);
    saveReviews();
    
    // Clear form
    document.getElementById('what-worked').value = '';
    document.getElementById('what-challenged').value = '';
    document.getElementById('goal-adjustments').value = '';
    document.getElementById('next-priorities').value = '';
    document.getElementById('needed-support').value = '';
    document.getElementById('satisfaction-rating').value = '5';
    document.getElementById('satisfaction-value').textContent = '5';
    
    showNotification('Review gespeichert!', 'success');
}

function exportGoalSummary() {
    if (!currentGoal) {
        showNotification('Wähle zuerst ein Ziel aus!', 'warning');
        return;
    }
    
    const summary = generateGoalSummary();
    const blob = new Blob([summary], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ziel-zusammenfassung-${currentGoal.text.replace(/[^a-zA-Z0-9]/g, '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    showNotification('Ziel-Zusammenfassung exportiert!', 'success');
}

function generateGoalSummary() {
    if (!currentGoal) return '';
    
    let summary = `ZIEL-ZUSAMMENFASSUNG\n`;
    summary += `==================\n\n`;
    summary += `Ziel: ${currentGoal.text}\n`;
    summary += `Kategorie: ${getCategoryName(currentGoal.category)}\n`;
    summary += `Erstellt: ${new Date(currentGoal.createdAt).toLocaleDateString()}\n\n`;
    
    if (currentGoal.smart) {
        summary += `SMART-ZIEL:\n`;
        summary += `${currentGoal.smart.fullText}\n\n`;
    }
    
    if (currentGoal.actionSteps && currentGoal.actionSteps.length > 0) {
        summary += `AKTIONSSCHRITTE:\n`;
        currentGoal.actionSteps.forEach((step, index) => {
            summary += `${index + 1}. ${step.title} ${step.completed ? '✅' : '⏳'}\n`;
            summary += `   ${step.description}\n`;
            if (step.deadline) summary += `   Frist: ${new Date(step.deadline).toLocaleDateString()}\n`;
            summary += `\n`;
        });
    }
    
    if (currentGoal.milestones && currentGoal.milestones.length > 0) {
        summary += `MEILENSTEINE:\n`;
        currentGoal.milestones.forEach(milestone => {
            summary += `• ${milestone.title} ${milestone.reached ? '✅' : '⏳'}\n`;
            summary += `  ${new Date(milestone.date).toLocaleDateString()}\n\n`;
        });
    }
    
    if (currentGoal.habitStacks && currentGoal.habitStacks.length > 0) {
        summary += `HABIT-STACKS:\n`;
        currentGoal.habitStacks.forEach(stack => {
            summary += `• ${stack.formula}\n`;
        });
        summary += `\n`;
    }
    
    return summary;
}

function createNewGoal() {
    if (confirm('Möchtest du ein neues Ziel erstellen? Das aktuelle Ziel wird gespeichert.')) {
        currentGoal = null;
        document.getElementById('current-goal-name').textContent = 'Wähle zuerst ein Ziel aus';
        loadActionSteps();
        loadMilestones();
        showNotification('Bereit für ein neues Ziel!', 'info');
    }
}

function updateDashboard() {
    const goalsSet = goals.length;
    const stepsCompleted = goals.reduce((total, goal) => 
        total + (goal.actionSteps ? goal.actionSteps.filter(step => step.completed).length : 0), 0);
    const milestonesReached = goals.reduce((total, goal) => 
        total + (goal.milestones ? goal.milestones.filter(milestone => milestone.reached).length : 0), 0);
    const habitsEstablished = goals.reduce((total, goal) => 
        total + (goal.habitStacks ? goal.habitStacks.filter(stack => stack.active).length : 0), 0);
    
    document.getElementById('goals-set').textContent = goalsSet;
    document.getElementById('steps-completed').textContent = stepsCompleted;
    document.getElementById('milestones-reached').textContent = milestonesReached;
    document.getElementById('habits-established').textContent = habitsEstablished;
}

// Data persistence functions
function saveGoals() {
    localStorage.setItem('goal-setting-goals', JSON.stringify(goals));
}

function loadSavedGoals() {
    const saved = localStorage.getItem('goal-setting-goals');
    if (saved) {
        goals = JSON.parse(saved);
        updateGoalsList();
    }
}

function saveProgress() {
    localStorage.setItem('goal-setting-progress', JSON.stringify(dailyProgress));
}

function loadSavedProgress() {
    const saved = localStorage.getItem('goal-setting-progress');
    if (saved) {
        dailyProgress = JSON.parse(saved);
        loadProgressHistory();
    }
}

function saveReviews() {
    localStorage.setItem('goal-setting-reviews', JSON.stringify(reviews));
}

function loadSavedReviews() {
    const saved = localStorage.getItem('goal-setting-reviews');
    if (saved) {
        reviews = JSON.parse(saved);
    }
}
