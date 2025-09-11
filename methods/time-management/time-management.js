// Zeitmanagement JavaScript Functions

let timeData = {
    categories: {},
    wasters: [],
    tasks: [],
    timeBlocks: [],
    productivity: {
        pomodoro: { work: 25, break: 5, sessions: 0 },
        timer: { running: false, time: 25 * 60, type: 'work' }
    }
};

function initTimeManagement() {
    console.log('Initializing Time Management...');
    
    // Load saved data
    loadSavedTimeData();
    
    // Setup event listeners
    setupTimeEventListeners();
    
    // Initialize UI
    updateTimeSummary();
}

function setupTimeEventListeners() {
    // Time input changes
    document.querySelectorAll('.time-input').forEach(input => {
        input.addEventListener('input', updateTimeSummary);
    });
    
    // Waster input changes
    document.querySelectorAll('.waster-hours').forEach(input => {
        input.addEventListener('input', updateTimeSummary);
    });
}

function updateTimeSummary() {
    let totalTime = 0;
    
    // Calculate total time from categories
    document.querySelectorAll('.time-category').forEach(category => {
        const input = category.querySelector('.time-input');
        const hours = parseFloat(input.value) || 0;
        totalTime += hours;
    });
    
    // Add time wasters
    document.querySelectorAll('.waster-item').forEach(item => {
        const hours = parseFloat(item.querySelector('.waster-hours').value) || 0;
        totalTime += hours;
    });
    
    // Update display
    document.getElementById('total-time').textContent = totalTime.toFixed(1);
    
    // Update balance message
    const balanceElement = document.getElementById('time-balance');
    if (totalTime > 24) {
        balanceElement.innerHTML = '<p style="color: #ef4444;">⚠️ Du hast mehr als 24 Stunden geplant. Überprüfe deine Eingaben.</p>';
    } else if (totalTime < 20) {
        balanceElement.innerHTML = '<p style="color: #f59e0b;">💡 Du hast noch Zeit übrig. Nutze sie für wichtige Aktivitäten.</p>';
    } else {
        balanceElement.innerHTML = '<p style="color: #10b981;">✅ Gute Zeitverteilung! Du nutzt deine Zeit effektiv.</p>';
    }
    
    // Save data
    saveTimeData();
}

function addTimeWaster() {
    const wasterList = document.querySelector('.waster-list');
    const newWaster = document.createElement('div');
    newWaster.className = 'waster-item';
    newWaster.innerHTML = `
        <input type="text" class="waster-input" placeholder="z.B. 'Zu viel Zeit auf Social Media'">
        <input type="number" class="waster-hours" placeholder="h" min="0" max="24">
        <span>Stunden pro Tag</span>
        <button class="btn btn-sm btn-danger" onclick="removeTimeWaster(this)">×</button>
    `;
    wasterList.appendChild(newWaster);
    
    // Add event listener
    newWaster.querySelector('.waster-hours').addEventListener('input', updateTimeSummary);
}

function removeTimeWaster(button) {
    button.parentElement.remove();
    updateTimeSummary();
}

function showEisenhowerMatrix() {
    const modal = document.createElement('div');
    modal.className = 'eisenhower-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Eisenhower-Matrix</h3>
                <button class="close-btn" onclick="closeModal(this)">&times;</button>
            </div>
            <div class="modal-body">
                <div class="eisenhower-grid">
                    <div class="quadrant urgent-important">
                        <h4>Dringend & Wichtig</h4>
                        <p>Krisen, Deadlines, Notfälle</p>
                        <textarea placeholder="Deine Aufgaben hier..."></textarea>
                    </div>
                    <div class="quadrant important-not-urgent">
                        <h4>Wichtig & Nicht dringend</h4>
                        <p>Prävention, Planung, Entwicklung</p>
                        <textarea placeholder="Deine Aufgaben hier..."></textarea>
                    </div>
                    <div class="quadrant urgent-not-important">
                        <h4>Dringend & Nicht wichtig</h4>
                        <p>Störungen, Unterbrechungen</p>
                        <textarea placeholder="Deine Aufgaben hier..."></textarea>
                    </div>
                    <div class="quadrant not-urgent-not-important">
                        <h4>Nicht dringend & Nicht wichtig</h4>
                        <p>Zeitverschwendung, Ablenkungen</p>
                        <textarea placeholder="Deine Aufgaben hier..."></textarea>
                    </div>
                </div>
                <button class="btn btn-primary" onclick="saveEisenhowerMatrix(this)">Speichern</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'flex';
}

function showABCAnalysis() {
    const modal = document.createElement('div');
    modal.className = 'abc-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>ABC-Analyse</h3>
                <button class="close-btn" onclick="closeModal(this)">&times;</button>
            </div>
            <div class="modal-body">
                <div class="abc-categories">
                    <div class="abc-category a-category">
                        <h4>A - Sehr wichtig (20% der Aufgaben, 80% des Wertes)</h4>
                        <textarea placeholder="Deine A-Aufgaben hier..."></textarea>
                    </div>
                    <div class="abc-category b-category">
                        <h4>B - Wichtig (30% der Aufgaben, 15% des Wertes)</h4>
                        <textarea placeholder="Deine B-Aufgaben hier..."></textarea>
                    </div>
                    <div class="abc-category c-category">
                        <h4>C - Weniger wichtig (50% der Aufgaben, 5% des Wertes)</h4>
                        <textarea placeholder="Deine C-Aufgaben hier..."></textarea>
                    </div>
                </div>
                <button class="btn btn-primary" onclick="saveABCAnalysis(this)">Speichern</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'flex';
}

function showMoSCoW() {
    const modal = document.createElement('div');
    modal.className = 'moscow-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>MoSCoW-Methode</h3>
                <button class="close-btn" onclick="closeModal(this)">&times;</button>
            </div>
            <div class="modal-body">
                <div class="moscow-categories">
                    <div class="moscow-category must-have">
                        <h4>Must have - Muss haben</h4>
                        <p>Unverzichtbare Aufgaben</p>
                        <textarea placeholder="Deine Must-have-Aufgaben hier..."></textarea>
                    </div>
                    <div class="moscow-category should-have">
                        <h4>Should have - Sollte haben</h4>
                        <p>Wichtige, aber nicht kritische Aufgaben</p>
                        <textarea placeholder="Deine Should-have-Aufgaben hier..."></textarea>
                    </div>
                    <div class="moscow-category could-have">
                        <h4>Could have - Könnte haben</h4>
                        <p>Wünschenswerte Aufgaben</p>
                        <textarea placeholder="Deine Could-have-Aufgaben hier..."></textarea>
                    </div>
                    <div class="moscow-category wont-have">
                        <h4>Won't have - Wird nicht haben</h4>
                        <p>Aufgaben, die nicht umgesetzt werden</p>
                        <textarea placeholder="Deine Won't-have-Aufgaben hier..."></textarea>
                    </div>
                </div>
                <button class="btn btn-primary" onclick="saveMoSCoW(this)">Speichern</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'flex';
}

function addTask() {
    const taskInput = document.getElementById('new-task');
    const taskText = taskInput.value.trim();
    
    if (!taskText) {
        showNotification('Bitte gib eine Aufgabe ein!', 'warning');
        return;
    }
    
    const task = {
        id: Date.now(),
        text: taskText,
        priority: 'C',
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    timeData.tasks.push(task);
    updateTasksList();
    taskInput.value = '';
    saveTimeData();
}

function updateTasksList() {
    const tasksList = document.getElementById('tasks-list');
    
    if (timeData.tasks.length === 0) {
        tasksList.innerHTML = '<p>Füge Aufgaben hinzu, um sie zu priorisieren.</p>';
        return;
    }
    
    tasksList.innerHTML = timeData.tasks.map(task => `
        <div class="task-item ${task.completed ? 'completed' : ''}" data-task-id="${task.id}">
            <div class="task-content">
                <input type="checkbox" ${task.completed ? 'checked' : ''} onchange="toggleTask(${task.id})">
                <span class="task-text">${task.text}</span>
            </div>
            <div class="task-priority">
                <select onchange="updateTaskPriority(${task.id}, this.value)">
                    <option value="A" ${task.priority === 'A' ? 'selected' : ''}>A</option>
                    <option value="B" ${task.priority === 'B' ? 'selected' : ''}>B</option>
                    <option value="C" ${task.priority === 'C' ? 'selected' : ''}>C</option>
                </select>
            </div>
            <div class="task-actions">
                <button class="btn btn-sm btn-danger" onclick="deleteTask(${task.id})">×</button>
            </div>
        </div>
    `).join('');
}

function toggleTask(taskId) {
    const task = timeData.tasks.find(t => t.id === taskId);
    if (task) {
        task.completed = !task.completed;
        updateTasksList();
        saveTimeData();
    }
}

function updateTaskPriority(taskId, priority) {
    const task = timeData.tasks.find(t => t.id === taskId);
    if (task) {
        task.priority = priority;
        saveTimeData();
    }
}

function deleteTask(taskId) {
    timeData.tasks = timeData.tasks.filter(t => t.id !== taskId);
    updateTasksList();
    saveTimeData();
}

function addTimeBlock() {
    const timeBlocks = document.getElementById('time-blocks');
    const newBlock = document.createElement('div');
    newBlock.className = 'time-block';
    newBlock.innerHTML = `
        <input type="time" class="start-time" value="07:00">
        <input type="time" class="end-time" value="08:00">
        <input type="text" class="activity" placeholder="Aktivität">
        <button class="btn btn-sm btn-danger" onclick="removeTimeBlock(this)">×</button>
    `;
    timeBlocks.appendChild(newBlock);
}

function removeTimeBlock(button) {
    button.parentElement.remove();
}

function startPomodoro() {
    showNotification('Pomodoro-Timer gestartet! 25 Minuten fokussiert arbeiten.', 'info');
    startTimer();
}

function showTwoMinuteRule() {
    showNotification('2-Minuten-Regel: Wenn eine Aufgabe weniger als 2 Minuten dauert, mache sie sofort!', 'info');
}

function showEatTheFrog() {
    showNotification('Eat the Frog: Beginne mit der schwierigsten Aufgabe des Tages!', 'info');
}

function showTimeBoxing() {
    showNotification('Time Boxing: Setze feste Zeitlimits für deine Aufgaben!', 'info');
}

function startTimer() {
    const timer = timeData.productivity.timer;
    timer.running = true;
    timer.type = 'work';
    
    document.getElementById('timer-start').disabled = true;
    document.getElementById('timer-pause').disabled = false;
    
    runTimer();
}

function pauseTimer() {
    timeData.productivity.timer.running = false;
    
    document.getElementById('timer-start').disabled = false;
    document.getElementById('timer-pause').disabled = true;
}

function resetTimer() {
    const workTime = parseInt(document.getElementById('work-time').value) * 60;
    timeData.productivity.timer = {
        running: false,
        time: workTime,
        type: 'work'
    };
    
    updateTimerDisplay();
    document.getElementById('timer-start').disabled = false;
    document.getElementById('timer-pause').disabled = true;
}

function runTimer() {
    const timer = timeData.productivity.timer;
    
    if (!timer.running) return;
    
    updateTimerDisplay();
    
    if (timer.time <= 0) {
        // Timer finished
        if (timer.type === 'work') {
            // Switch to break
            const breakTime = parseInt(document.getElementById('break-time').value) * 60;
            timer.time = breakTime;
            timer.type = 'break';
            showNotification('Arbeitszeit beendet! Zeit für eine Pause.', 'success');
        } else {
            // Switch to work
            const workTime = parseInt(document.getElementById('work-time').value) * 60;
            timer.time = workTime;
            timer.type = 'work';
            timeData.productivity.pomodoro.sessions++;
            showNotification('Pause beendet! Zurück zur Arbeit.', 'info');
        }
    } else {
        timer.time--;
    }
    
    setTimeout(runTimer, 1000);
}

function updateTimerDisplay() {
    const timer = timeData.productivity.timer;
    const minutes = Math.floor(timer.time / 60);
    const seconds = timer.time % 60;
    const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    document.getElementById('timer-time').textContent = timeString;
    
    // Update timer circle color based on type
    const timerCircle = document.querySelector('.timer-circle');
    if (timer.type === 'work') {
        timerCircle.style.background = 'linear-gradient(135deg, #3b82f6, #1d4ed8)';
    } else {
        timerCircle.style.background = 'linear-gradient(135deg, #10b981, #059669)';
    }
}

function generateOptimizationPlan() {
    const planItems = document.getElementById('optimization-plan-items');
    
    let plan = [];
    
    // Analyze time data
    const totalTime = parseFloat(document.getElementById('total-time').textContent) || 0;
    if (totalTime > 24) {
        plan.push('⚠️ Reduziere deine geplanten Aktivitäten - du hast mehr als 24 Stunden geplant');
    }
    
    // Analyze tasks
    const highPriorityTasks = timeData.tasks.filter(t => t.priority === 'A' && !t.completed).length;
    if (highPriorityTasks > 5) {
        plan.push('🎯 Du hast viele A-Prioritäten - fokussiere dich auf die wichtigsten');
    }
    
    // Analyze time wasters
    const wasterHours = Array.from(document.querySelectorAll('.waster-hours'))
        .reduce((sum, input) => sum + (parseFloat(input.value) || 0), 0);
    if (wasterHours > 2) {
        plan.push('⏰ Reduziere Zeitfresser - du verschwendest ' + wasterHours + ' Stunden pro Tag');
    }
    
    // General recommendations
    plan.push('📅 Erstelle einen festen Tagesplan mit Zeitblocking');
    plan.push('🎯 Nutze die Eisenhower-Matrix für bessere Priorisierung');
    plan.push('⚡ Implementiere die Pomodoro-Technik für mehr Fokus');
    
    if (plan.length === 0) {
        plan.push('✅ Dein Zeitmanagement ist bereits gut optimiert!');
    }
    
    planItems.innerHTML = plan.map(item => `<div class="plan-item">${item}</div>`).join('');
}

function closeModal(button) {
    const modal = button.closest('.eisenhower-modal, .abc-modal, .moscow-modal');
    modal.remove();
}

function saveEisenhowerMatrix(button) {
    const modal = button.closest('.eisenhower-modal');
    const quadrants = modal.querySelectorAll('.quadrant textarea');
    
    const matrix = {
        urgentImportant: quadrants[0].value,
        importantNotUrgent: quadrants[1].value,
        urgentNotImportant: quadrants[2].value,
        notUrgentNotImportant: quadrants[3].value
    };
    
    timeData.eisenhowerMatrix = matrix;
    saveTimeData();
    showNotification('Eisenhower-Matrix gespeichert!', 'success');
    closeModal(button);
}

function saveABCAnalysis(button) {
    const modal = button.closest('.abc-modal');
    const categories = modal.querySelectorAll('.abc-category textarea');
    
    const analysis = {
        a: categories[0].value,
        b: categories[1].value,
        c: categories[2].value
    };
    
    timeData.abcAnalysis = analysis;
    saveTimeData();
    showNotification('ABC-Analyse gespeichert!', 'success');
    closeModal(button);
}

function saveMoSCoW(button) {
    const modal = button.closest('.moscow-modal');
    const categories = modal.querySelectorAll('.moscow-category textarea');
    
    const moscow = {
        must: categories[0].value,
        should: categories[1].value,
        could: categories[2].value,
        wont: categories[3].value
    };
    
    timeData.moscow = moscow;
    saveTimeData();
    showNotification('MoSCoW-Analyse gespeichert!', 'success');
    closeModal(button);
}

// Data persistence functions
function saveTimeData() {
    // Save time categories
    const categories = {};
    document.querySelectorAll('.time-category').forEach(category => {
        const label = category.querySelector('label').textContent;
        const value = parseFloat(category.querySelector('.time-input').value) || 0;
        categories[label] = value;
    });
    timeData.categories = categories;
    
    // Save time wasters
    const wasters = [];
    document.querySelectorAll('.waster-item').forEach(item => {
        const text = item.querySelector('.waster-input').value.trim();
        const hours = parseFloat(item.querySelector('.waster-hours').value) || 0;
        if (text) {
            wasters.push({ text, hours });
        }
    });
    timeData.wasters = wasters;
    
    localStorage.setItem('time-management-data', JSON.stringify(timeData));
}

function loadSavedTimeData() {
    const saved = localStorage.getItem('time-management-data');
    if (saved) {
        timeData = { ...timeData, ...JSON.parse(saved) };
        
        // Restore time categories
        Object.keys(timeData.categories).forEach(categoryName => {
            const categoryElement = Array.from(document.querySelectorAll('.time-category'))
                .find(cat => cat.querySelector('label').textContent === categoryName);
            if (categoryElement) {
                categoryElement.querySelector('.time-input').value = timeData.categories[categoryName];
            }
        });
        
        // Restore time wasters
        timeData.wasters.forEach(waster => {
            addTimeWaster();
            const lastWaster = document.querySelector('.waster-item:last-child');
            lastWaster.querySelector('.waster-input').value = waster.text;
            lastWaster.querySelector('.waster-hours').value = waster.hours;
        });
        
        // Restore tasks
        updateTasksList();
        
        // Restore timer settings
        if (timeData.productivity.pomodoro) {
            document.getElementById('work-time').value = timeData.productivity.pomodoro.work;
            document.getElementById('break-time').value = timeData.productivity.pomodoro.break;
        }
    }
}
