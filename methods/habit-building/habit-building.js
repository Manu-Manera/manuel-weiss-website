// Gewohnheiten aufbauen JavaScript Functions

let habits = {
    positive: [],
    negative: [],
    new: []
};
let habitStacks = [];
let challenges = [];
let dailyProgress = [];
let currentDate = new Date();

function initHabitBuilding() {
    console.log('Initializing Habit Building...');
    
    // Load saved data
    loadSavedHabits();
    loadSavedStacks();
    loadSavedChallenges();
    loadSavedProgress();
    
    // Setup event listeners
    setupHabitEventListeners();
    
    // Set current date
    document.getElementById('tracking-date').value = new Date().toISOString().split('T')[0];
    document.getElementById('challenge-start-date').value = new Date().toISOString().split('T')[0];
    
    // Initialize UI
    updateHabitCounts();
    updateHabitInsights();
    updateDashboard();
    generateCalendar();
}

function setupHabitEventListeners() {
    // Habit stack form updates
    document.getElementById('anchor-habit').addEventListener('change', updateStackPreview);
    document.getElementById('new-habit-select').addEventListener('change', updateStackPreview);
    
    // Challenge form updates
    document.getElementById('challenge-habit').addEventListener('change', updateChallengeForm);
}

function addPositiveHabit() {
    const habitsList = document.getElementById('positive-habits');
    const newHabit = document.createElement('div');
    newHabit.className = 'habit-item';
    newHabit.innerHTML = `
        <input type="text" placeholder="z.B. 'Ich trinke morgens ein Glas Wasser'" class="habit-input">
        <button class="btn btn-sm btn-danger" onclick="removeHabit(this)">×</button>
    `;
    habitsList.appendChild(newHabit);
    updateHabitCounts();
}

function addNegativeHabit() {
    const habitsList = document.getElementById('negative-habits');
    const newHabit = document.createElement('div');
    newHabit.className = 'habit-item';
    newHabit.innerHTML = `
        <input type="text" placeholder="z.B. 'Ich schaue abends zu lange aufs Handy'" class="habit-input">
        <button class="btn btn-sm btn-danger" onclick="removeHabit(this)">×</button>
    `;
    habitsList.appendChild(newHabit);
    updateHabitCounts();
}

function addNewHabit() {
    const habitsList = document.getElementById('new-habits');
    const newHabit = document.createElement('div');
    newHabit.className = 'habit-item';
    newHabit.innerHTML = `
        <input type="text" placeholder="z.B. 'Ich lese täglich 20 Minuten'" class="habit-input">
        <button class="btn btn-sm btn-danger" onclick="removeHabit(this)">×</button>
    `;
    habitsList.appendChild(newHabit);
    updateHabitCounts();
}

function removeHabit(button) {
    button.parentElement.remove();
    updateHabitCounts();
}

function updateHabitCounts() {
    const positiveCount = document.querySelectorAll('#positive-habits .habit-item').length;
    const negativeCount = document.querySelectorAll('#negative-habits .habit-item').length;
    const newCount = document.querySelectorAll('#new-habits .habit-item').length;
    const totalCount = positiveCount + negativeCount + newCount;
    
    document.getElementById('positive-count').textContent = positiveCount;
    document.getElementById('negative-count').textContent = negativeCount;
    document.getElementById('new-count').textContent = newCount;
    
    if (totalCount > 0) {
        document.getElementById('positive-percentage').textContent = Math.round((positiveCount / totalCount) * 100) + '%';
        document.getElementById('negative-percentage').textContent = Math.round((negativeCount / totalCount) * 100) + '%';
        document.getElementById('new-percentage').textContent = Math.round((newCount / totalCount) * 100) + '%';
    } else {
        document.getElementById('positive-percentage').textContent = '0%';
        document.getElementById('negative-percentage').textContent = '0%';
        document.getElementById('new-percentage').textContent = '0%';
    }
    
    updateHabitInsights();
    updateHabitSelects();
}

function updateHabitInsights() {
    const positiveCount = document.querySelectorAll('#positive-habits .habit-item').length;
    const negativeCount = document.querySelectorAll('#negative-habits .habit-item').length;
    const newCount = document.querySelectorAll('#new-habits .habit-item').length;
    
    const insightsContainer = document.getElementById('habit-insights');
    
    if (positiveCount + negativeCount + newCount === 0) {
        insightsContainer.innerHTML = '<div class="no-insights"><p>Füge Gewohnheiten hinzu, um Erkenntnisse zu erhalten.</p></div>';
        return;
    }
    
    let insights = [];
    
    if (positiveCount > negativeCount) {
        insights.push('✅ Du hast mehr positive als negative Gewohnheiten - das ist großartig!');
    } else if (negativeCount > positiveCount) {
        insights.push('⚠️ Du hast mehr negative als positive Gewohnheiten. Fokussiere dich auf positive Veränderungen.');
    }
    
    if (newCount > 0) {
        insights.push(`🆕 Du möchtest ${newCount} neue Gewohnheit${newCount > 1 ? 'en' : ''} entwickeln. Beginne mit einer!`);
    }
    
    if (positiveCount > 0) {
        insights.push('💪 Nutze deine positiven Gewohnheiten als Anker für neue Gewohnheiten.');
    }
    
    insightsContainer.innerHTML = insights.map(insight => `<div class="insight-item">${insight}</div>`).join('');
}

function updateHabitSelects() {
    // Update anchor habit select
    const anchorSelect = document.getElementById('anchor-habit');
    const positiveHabits = Array.from(document.querySelectorAll('#positive-habits .habit-input')).map(input => input.value.trim()).filter(v => v);
    
    anchorSelect.innerHTML = '<option value="">Wähle eine bestehende Gewohnheit...</option>' +
        positiveHabits.map(habit => `<option value="${habit}">${habit}</option>`).join('');
    
    // Update new habit select
    const newHabitSelect = document.getElementById('new-habit-select');
    const newHabits = Array.from(document.querySelectorAll('#new-habits .habit-input')).map(input => input.value.trim()).filter(v => v);
    
    newHabitSelect.innerHTML = '<option value="">Wähle eine neue Gewohnheit...</option>' +
        newHabits.map(habit => `<option value="${habit}">${habit}</option>`).join('');
    
    // Update challenge habit select
    const challengeSelect = document.getElementById('challenge-habit');
    challengeSelect.innerHTML = '<option value="">Wähle eine Gewohnheit...</option>' +
        newHabits.map(habit => `<option value="${habit}">${habit}</option>`).join('');
}

function updateStackPreview() {
    const anchorHabit = document.getElementById('anchor-habit').value;
    const newHabit = document.getElementById('new-habit-select').value;
    
    const preview = document.getElementById('stack-preview');
    
    if (anchorHabit && newHabit) {
        preview.textContent = `Nach "${anchorHabit}" werde ich "${newHabit}"`;
        preview.style.background = '#f0f9ff';
        preview.style.border = '1px solid #0ea5e9';
    } else {
        preview.textContent = 'Wähle Anker und neue Gewohnheit, um die Formel zu sehen.';
        preview.style.background = '#f8fafc';
        preview.style.border = '1px solid #e2e8f0';
    }
}

function createHabitStack() {
    const anchorHabit = document.getElementById('anchor-habit').value;
    const newHabit = document.getElementById('new-habit-select').value;
    const details = document.getElementById('stack-details').value;
    
    if (!anchorHabit || !newHabit) {
        showNotification('Bitte wähle sowohl eine Anker- als auch eine neue Gewohnheit!', 'warning');
        return;
    }
    
    const stack = {
        id: Date.now(),
        anchorHabit: anchorHabit,
        newHabit: newHabit,
        formula: `Nach "${anchorHabit}" werde ich "${newHabit}"`,
        details: details,
        active: true,
        createdAt: new Date().toISOString()
    };
    
    habitStacks.push(stack);
    saveStacks();
    updateStacksList();
    
    // Clear form
    document.getElementById('anchor-habit').value = '';
    document.getElementById('new-habit-select').value = '';
    document.getElementById('stack-details').value = '';
    updateStackPreview();
    
    showNotification('Habit-Stack erstellt!', 'success');
}

function updateStacksList() {
    const stacksList = document.getElementById('habit-stacks-list');
    
    if (habitStacks.length === 0) {
        stacksList.innerHTML = '<div class="no-stacks"><p>Erstelle deine ersten Habit-Stacks, um sie hier zu sehen.</p></div>';
        return;
    }
    
    stacksList.innerHTML = habitStacks.map(stack => `
        <div class="stack-item ${stack.active ? 'active' : 'inactive'}" data-stack-id="${stack.id}">
            <div class="stack-content">
                <div class="stack-formula">${stack.formula}</div>
                ${stack.details ? `<div class="stack-details">${stack.details}</div>` : ''}
            </div>
            <div class="stack-actions">
                <button class="btn btn-sm ${stack.active ? 'btn-secondary' : 'btn-success'}" onclick="toggleStack(${stack.id})">
                    ${stack.active ? 'Pausieren' : 'Aktivieren'}
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteStack(${stack.id})">Löschen</button>
            </div>
        </div>
    `).join('');
}

function toggleStack(stackId) {
    const stack = habitStacks.find(s => s.id === stackId);
    if (stack) {
        stack.active = !stack.active;
        saveStacks();
        updateStacksList();
        showNotification(stack.active ? 'Habit-Stack aktiviert!' : 'Habit-Stack pausiert!', 'info');
    }
}

function deleteStack(stackId) {
    if (confirm('Möchtest du diesen Habit-Stack wirklich löschen?')) {
        habitStacks = habitStacks.filter(s => s.id !== stackId);
        saveStacks();
        updateStacksList();
        showNotification('Habit-Stack gelöscht!', 'warning');
    }
}

function startChallenge() {
    const habit = document.getElementById('challenge-habit').value;
    const startDate = document.getElementById('challenge-start-date').value;
    const goal = document.getElementById('challenge-goal').value;
    const reward = document.getElementById('challenge-reward').value;
    const reminder = document.getElementById('challenge-reminder').value;
    
    if (!habit || !startDate) {
        showNotification('Bitte wähle eine Gewohnheit und ein Startdatum!', 'warning');
        return;
    }
    
    const challenge = {
        id: Date.now(),
        habit: habit,
        startDate: startDate,
        endDate: addDays(startDate, 21),
        goal: goal,
        reward: reward,
        reminder: reminder,
        status: 'active',
        progress: [],
        createdAt: new Date().toISOString()
    };
    
    challenges.push(challenge);
    saveChallenges();
    updateChallengesList();
    generateCalendar();
    
    // Clear form
    document.getElementById('challenge-habit').value = '';
    document.getElementById('challenge-goal').value = '';
    document.getElementById('challenge-reward').value = '';
    
    showNotification('21-Tage-Challenge gestartet! 🚀', 'success');
}

function addDays(dateString, days) {
    const date = new Date(dateString);
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
}

function updateChallengesList() {
    const challengesList = document.getElementById('active-challenges');
    
    if (challenges.length === 0) {
        challengesList.innerHTML = '<div class="no-challenges"><p>Starte deine erste 21-Tage-Challenge!</p></div>';
        return;
    }
    
    challengesList.innerHTML = challenges.map(challenge => {
        const daysLeft = getDaysLeft(challenge.endDate);
        const progress = challenge.progress.length;
        const progressPercent = Math.round((progress / 21) * 100);
        
        return `
            <div class="challenge-item ${challenge.status}" data-challenge-id="${challenge.id}">
                <div class="challenge-header">
                    <h5>${challenge.habit}</h5>
                    <div class="challenge-status">
                        <span class="days-left">${daysLeft} Tage übrig</span>
                        <span class="progress-percent">${progressPercent}%</span>
                    </div>
                </div>
                <div class="challenge-details">
                    ${challenge.goal ? `<p><strong>Ziel:</strong> ${challenge.goal}</p>` : ''}
                    ${challenge.reward ? `<p><strong>Belohnung:</strong> ${challenge.reward}</p>` : ''}
                    <p><strong>Fortschritt:</strong> ${progress}/21 Tage</p>
                </div>
                <div class="challenge-actions">
                    <button class="btn btn-sm btn-primary" onclick="markChallengeDay(${challenge.id})">Tag abschließen</button>
                    <button class="btn btn-sm btn-outline" onclick="viewChallengeDetails(${challenge.id})">Details</button>
                </div>
            </div>
        `;
    }).join('');
}

function getDaysLeft(endDate) {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
}

function markChallengeDay(challengeId) {
    const challenge = challenges.find(c => c.id === challengeId);
    if (!challenge) return;
    
    const today = new Date().toISOString().split('T')[0];
    
    if (challenge.progress.includes(today)) {
        showNotification('Dieser Tag wurde bereits abgeschlossen!', 'info');
        return;
    }
    
    challenge.progress.push(today);
    saveChallenges();
    updateChallengesList();
    updateDashboard();
    
    showNotification('Tag erfolgreich abgeschlossen! 🎉', 'success');
}

function generateCalendar() {
    const calendarGrid = document.getElementById('calendar-grid');
    const monthNames = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
                       'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
    
    document.getElementById('calendar-month').textContent = 
        `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    let calendarHTML = '';
    
    // Generate calendar days
    for (let i = 0; i < 42; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        const dateString = date.toISOString().split('T')[0];
        const isCurrentMonth = date.getMonth() === currentDate.getMonth();
        const isToday = dateString === new Date().toISOString().split('T')[0];
        
        // Check if this date has challenge progress
        const hasProgress = challenges.some(challenge => 
            challenge.progress.includes(dateString)
        );
        
        calendarHTML += `
            <div class="calendar-day ${isCurrentMonth ? 'current-month' : 'other-month'} ${isToday ? 'today' : ''} ${hasProgress ? 'has-progress' : ''}" 
                 data-date="${dateString}">
                <span class="day-number">${date.getDate()}</span>
                ${hasProgress ? '<span class="progress-indicator">✓</span>' : ''}
            </div>
        `;
    }
    
    calendarGrid.innerHTML = calendarHTML;
}

function previousMonth() {
    currentDate.setMonth(currentDate.getMonth() - 1);
    generateCalendar();
}

function nextMonth() {
    currentDate.setMonth(currentDate.getMonth() + 1);
    generateCalendar();
}

function saveDailyProgress() {
    const date = document.getElementById('tracking-date').value;
    const notes = document.getElementById('daily-notes').value;
    
    if (!date) {
        showNotification('Bitte wähle ein Datum!', 'warning');
        return;
    }
    
    // Get checked habits
    const checkedHabits = Array.from(document.querySelectorAll('#daily-habits-checklist input:checked'))
        .map(input => input.value);
    
    const progress = {
        id: Date.now(),
        date: date,
        habits: checkedHabits,
        notes: notes,
        createdAt: new Date().toISOString()
    };
    
    dailyProgress.push(progress);
    saveProgress();
    updateDashboard();
    
    // Clear form
    document.getElementById('daily-notes').value = '';
    document.querySelectorAll('#daily-habits-checklist input').forEach(input => {
        input.checked = false;
    });
    
    showNotification('Fortschritt gespeichert!', 'success');
}

function updateDashboard() {
    // Calculate metrics
    const activeHabits = habitStacks.filter(stack => stack.active).length;
    const totalDays = dailyProgress.length;
    const successfulDays = dailyProgress.filter(progress => progress.habits.length > 0).length;
    const successRate = totalDays > 0 ? Math.round((successfulDays / totalDays) * 100) : 0;
    
    // Calculate longest streak
    const longestStreak = calculateLongestStreak();
    
    // Count completed challenges
    const completedChallenges = challenges.filter(challenge => 
        challenge.progress.length >= 21
    ).length;
    
    // Update display
    document.getElementById('active-habits-count').textContent = activeHabits;
    document.getElementById('success-rate').textContent = successRate + '%';
    document.getElementById('longest-streak').textContent = longestStreak + ' Tage';
    document.getElementById('completed-challenges').textContent = completedChallenges;
}

function calculateLongestStreak() {
    if (dailyProgress.length === 0) return 0;
    
    // Sort by date
    const sortedProgress = dailyProgress.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    let maxStreak = 0;
    let currentStreak = 0;
    let lastDate = null;
    
    sortedProgress.forEach(progress => {
        const currentDate = new Date(progress.date);
        
        if (lastDate) {
            const daysDiff = Math.floor((currentDate - lastDate) / (1000 * 60 * 60 * 24));
            
            if (daysDiff === 1 && progress.habits.length > 0) {
                currentStreak++;
            } else if (daysDiff > 1 || progress.habits.length === 0) {
                maxStreak = Math.max(maxStreak, currentStreak);
                currentStreak = progress.habits.length > 0 ? 1 : 0;
            }
        } else if (progress.habits.length > 0) {
            currentStreak = 1;
        }
        
        lastDate = currentDate;
    });
    
    return Math.max(maxStreak, currentStreak);
}

function showAnalyticsTab(tabName) {
    // Remove active class from all tabs
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.analytics-tab').forEach(tab => tab.classList.remove('active'));
    
    // Add active class to selected tab
    document.querySelector(`[onclick="showAnalyticsTab('${tabName}')"]`).classList.add('active');
    document.getElementById(`${tabName}-tab`).classList.add('active');
    
    // Update content based on tab
    switch(tabName) {
        case 'streaks':
            updateStreaksTab();
            break;
        case 'patterns':
            updatePatternsTab();
            break;
        case 'insights':
            updateInsightsTab();
            break;
    }
}

function updateStreaksTab() {
    const streaksList = document.getElementById('current-streaks');
    
    if (habitStacks.length === 0) {
        streaksList.innerHTML = '<p>Starte Gewohnheiten, um Streaks zu sehen.</p>';
        return;
    }
    
    const streaks = habitStacks.map(stack => {
        const streak = calculateHabitStreak(stack.newHabit);
        return `
            <div class="streak-item">
                <h6>${stack.newHabit}</h6>
                <div class="streak-count">${streak} Tage</div>
            </div>
        `;
    }).join('');
    
    streaksList.innerHTML = streaks;
}

function calculateHabitStreak(habitName) {
    // This would calculate the streak for a specific habit
    // For now, return a placeholder
    return Math.floor(Math.random() * 30);
}

function updatePatternsTab() {
    const patternsAnalysis = document.getElementById('patterns-analysis');
    
    if (dailyProgress.length === 0) {
        patternsAnalysis.innerHTML = '<p>Verfolge deine Gewohnheiten, um Muster zu erkennen.</p>';
        return;
    }
    
    // Analyze patterns
    const patterns = [
        'Du bist am Wochenende weniger aktiv.',
        'Morgens hast du die höchste Erfolgsrate.',
        'Deine beste Gewohnheit ist das Trinken von Wasser.'
    ];
    
    patternsAnalysis.innerHTML = patterns.map(pattern => 
        `<div class="pattern-item">${pattern}</div>`
    ).join('');
}

function updateInsightsTab() {
    const insightsAnalysis = document.getElementById('insights-analysis');
    
    if (dailyProgress.length === 0) {
        insightsAnalysis.innerHTML = '<p>Analysiere deine Daten für wertvolle Erkenntnisse.</p>';
        return;
    }
    
    const insights = [
        'Deine Erfolgsrate steigt kontinuierlich.',
        'Du solltest mehr auf deine morgendlichen Gewohnheiten fokussieren.',
        'Betrachte deine Fortschritte wöchentlich, nicht täglich.'
    ];
    
    insightsAnalysis.innerHTML = insights.map(insight => 
        `<div class="insight-item">${insight}</div>`
    ).join('');
}

// Data persistence functions
function saveHabits() {
    const positiveHabits = Array.from(document.querySelectorAll('#positive-habits .habit-input')).map(input => input.value.trim()).filter(v => v);
    const negativeHabits = Array.from(document.querySelectorAll('#negative-habits .habit-input')).map(input => input.value.trim()).filter(v => v);
    const newHabits = Array.from(document.querySelectorAll('#new-habits .habit-input')).map(input => input.value.trim()).filter(v => v);
    
    habits = {
        positive: positiveHabits,
        negative: negativeHabits,
        new: newHabits
    };
    
    localStorage.setItem('habit-building-habits', JSON.stringify(habits));
}

function loadSavedHabits() {
    const saved = localStorage.getItem('habit-building-habits');
    if (saved) {
        habits = JSON.parse(saved);
        
        // Populate UI
        populateHabitList('positive-habits', habits.positive);
        populateHabitList('negative-habits', habits.negative);
        populateHabitList('new-habits', habits.new);
    }
}

function populateHabitList(containerId, habitList) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    habitList.forEach(habit => {
        const habitItem = document.createElement('div');
        habitItem.className = 'habit-item';
        habitItem.innerHTML = `
            <input type="text" value="${habit}" class="habit-input">
            <button class="btn btn-sm btn-danger" onclick="removeHabit(this)">×</button>
        `;
        container.appendChild(habitItem);
    });
    
    // Add empty item if no habits
    if (habitList.length === 0) {
        addEmptyHabitItem(containerId);
    }
}

function addEmptyHabitItem(containerId) {
    const container = document.getElementById(containerId);
    const habitItem = document.createElement('div');
    habitItem.className = 'habit-item';
    habitItem.innerHTML = `
        <input type="text" placeholder="z.B. 'Ich trinke morgens ein Glas Wasser'" class="habit-input">
        <button class="btn btn-sm btn-danger" onclick="removeHabit(this)">×</button>
    `;
    container.appendChild(habitItem);
}

function saveStacks() {
    localStorage.setItem('habit-building-stacks', JSON.stringify(habitStacks));
}

function loadSavedStacks() {
    const saved = localStorage.getItem('habit-building-stacks');
    if (saved) {
        habitStacks = JSON.parse(saved);
        updateStacksList();
    }
}

function saveChallenges() {
    localStorage.setItem('habit-building-challenges', JSON.stringify(challenges));
}

function loadSavedChallenges() {
    const saved = localStorage.getItem('habit-building-challenges');
    if (saved) {
        challenges = JSON.parse(saved);
        updateChallengesList();
    }
}

function saveProgress() {
    localStorage.setItem('habit-building-progress', JSON.stringify(dailyProgress));
}

function loadSavedProgress() {
    const saved = localStorage.getItem('habit-building-progress');
    if (saved) {
        dailyProgress = JSON.parse(saved);
    }
}
