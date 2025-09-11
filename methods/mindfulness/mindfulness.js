// Achtsamkeit & Meditation JavaScript Functions

let meditationTimer = null;
let currentTime = 0;
let totalTime = 0;
let isRunning = false;
let isPaused = false;
let meditationSessions = [];
let journalEntries = [];
let mindfulnessScore = 0;

function initMindfulness() {
    console.log('Initializing Mindfulness & Meditation...');
    
    // Load saved data
    loadSavedSessions();
    loadSavedJournal();
    
    // Setup event listeners
    setupMindfulnessEventListeners();
    
    // Initialize assessment
    initializeAssessment();
    
    // Set today's date
    document.getElementById('journal-date').value = new Date().toISOString().split('T')[0];
    
    // Update statistics
    updateStatistics();
}

function setupMindfulnessEventListeners() {
    // Assessment sliders
    document.querySelectorAll('.mindfulness-slider').forEach(slider => {
        slider.addEventListener('input', updateMindfulnessScore);
    });
    
    // Timer preset buttons
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', (e) => setPresetTime(parseInt(e.target.dataset.minutes)));
    });
    
    // Custom time input
    document.getElementById('custom-minutes').addEventListener('input', updateCustomTime);
    
    // Exercise category tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => switchExerciseCategory(e.target.dataset.category));
    });
    
    // Mood rating slider
    const moodSlider = document.getElementById('mood-rating');
    if (moodSlider) {
        moodSlider.addEventListener('input', (e) => {
            document.getElementById('mood-value').textContent = e.target.value;
        });
    }
    
    // Reminder settings
    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', saveReminderSettings);
    });
    
    document.querySelectorAll('select').forEach(select => {
        select.addEventListener('change', saveReminderSettings);
    });
}

function initializeAssessment() {
    // Set initial score
    updateMindfulnessScore();
}

function updateMindfulnessScore() {
    const sliders = document.querySelectorAll('.mindfulness-slider');
    let totalScore = 0;
    
    sliders.forEach(slider => {
        totalScore += parseInt(slider.value);
    });
    
    mindfulnessScore = Math.round((totalScore / sliders.length) * 10);
    
    document.getElementById('mindfulness-score').textContent = mindfulnessScore;
    
    // Update description based on score
    const description = getScoreDescription(mindfulnessScore);
    document.getElementById('score-description').textContent = description;
    
    // Save assessment
    saveAssessment();
}

function getScoreDescription(score) {
    if (score >= 80) {
        return "Ausgezeichnet! Du praktizierst bereits sehr achtsam. Weiter so!";
    } else if (score >= 60) {
        return "Gut! Du bist auf dem richtigen Weg. Es gibt noch Raum für Verbesserungen.";
    } else if (score >= 40) {
        return "Durchschnittlich. Achtsamkeit kann dir helfen, dein Leben zu verbessern.";
    } else {
        return "Es gibt viel Potenzial! Beginne mit kleinen Schritten zur Achtsamkeit.";
    }
}

function setPresetTime(minutes) {
    // Remove active class from all buttons
    document.querySelectorAll('.preset-btn').forEach(btn => btn.classList.remove('active'));
    
    // Add active class to clicked button
    event.target.classList.add('active');
    
    // Set custom minutes input
    document.getElementById('custom-minutes').value = minutes;
    
    // Update timer display
    updateCustomTime();
}

function updateCustomTime() {
    const minutes = parseInt(document.getElementById('custom-minutes').value) || 0;
    totalTime = minutes * 60;
    currentTime = totalTime;
    updateTimerDisplay();
}

function startMeditation() {
    if (totalTime === 0) {
        showNotification('Bitte wähle eine Zeit aus!', 'warning');
        return;
    }
    
    isRunning = true;
    isPaused = false;
    
    // Update button states
    document.getElementById('start-timer').disabled = true;
    document.getElementById('pause-timer').disabled = false;
    document.getElementById('stop-timer').disabled = false;
    
    // Start timer
    meditationTimer = setInterval(() => {
        if (currentTime > 0) {
            currentTime--;
            updateTimerDisplay();
            updateProgressRing();
        } else {
            completeMeditation();
        }
    }, 1000);
    
    showNotification('Meditation gestartet! 🧘', 'success');
}

function pauseMeditation() {
    if (isPaused) {
        // Resume
        isPaused = false;
        meditationTimer = setInterval(() => {
            if (currentTime > 0) {
                currentTime--;
                updateTimerDisplay();
                updateProgressRing();
            } else {
                completeMeditation();
            }
        }, 1000);
        
        document.getElementById('pause-timer').innerHTML = '<i class="fas fa-pause"></i> Pausieren';
        showNotification('Meditation fortgesetzt', 'info');
    } else {
        // Pause
        isPaused = true;
        clearInterval(meditationTimer);
        document.getElementById('pause-timer').innerHTML = '<i class="fas fa-play"></i> Fortsetzen';
        showNotification('Meditation pausiert', 'info');
    }
}

function stopMeditation() {
    if (confirm('Möchtest du die Meditation wirklich beenden?')) {
        clearInterval(meditationTimer);
        resetTimer();
        showNotification('Meditation beendet', 'warning');
    }
}

function completeMeditation() {
    clearInterval(meditationTimer);
    
    // Save session
    const session = {
        id: Date.now(),
        duration: totalTime,
        completed: true,
        date: new Date().toISOString(),
        type: 'meditation'
    };
    
    meditationSessions.push(session);
    saveSessions();
    updateStatistics();
    
    // Show completion message
    showNotification('Meditation abgeschlossen! 🎉', 'success');
    
    // Play completion sound if enabled
    if (document.getElementById('sound-notifications').checked) {
        playCompletionSound();
    }
    
    // Reset timer
    resetTimer();
}

function resetTimer() {
    isRunning = false;
    isPaused = false;
    currentTime = totalTime;
    
    // Update button states
    document.getElementById('start-timer').disabled = false;
    document.getElementById('pause-timer').disabled = true;
    document.getElementById('stop-timer').disabled = true;
    document.getElementById('pause-timer').innerHTML = '<i class="fas fa-pause"></i> Pausieren';
    
    updateTimerDisplay();
    updateProgressRing();
}

function updateTimerDisplay() {
    const minutes = Math.floor(currentTime / 60);
    const seconds = currentTime % 60;
    const display = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    document.getElementById('timer-display').textContent = display;
}

function updateProgressRing() {
    const progress = totalTime > 0 ? (totalTime - currentTime) / totalTime : 0;
    const circumference = 2 * Math.PI * 90;
    const offset = circumference - (progress * circumference);
    
    const progressRing = document.querySelector('.progress-ring-progress');
    if (progressRing) {
        progressRing.style.strokeDashoffset = offset;
    }
}

function playCompletionSound() {
    // Create a simple beep sound
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
}

function switchExerciseCategory(category) {
    // Remove active class from all tabs
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    
    // Add active class to clicked tab
    document.querySelector(`[data-category="${category}"]`).classList.add('active');
    
    // Hide all exercise categories
    document.querySelectorAll('.exercise-category').forEach(cat => cat.classList.remove('active'));
    
    // Show selected category
    document.getElementById(`${category}-exercises`).classList.add('active');
}

function startGuidedExercise(exerciseType) {
    const exerciseData = getExerciseData(exerciseType);
    
    // Show exercise player
    document.getElementById('exercise-player').style.display = 'block';
    document.getElementById('current-exercise-title').textContent = exerciseData.title;
    
    // Load instructions
    loadExerciseInstructions(exerciseData);
    
    // Start exercise timer
    startExerciseTimer(exerciseData.duration);
    
    showNotification(`${exerciseData.title} gestartet!`, 'success');
}

function getExerciseData(exerciseType) {
    const exercises = {
        'breathing': {
            title: 'Atem-Meditation',
            duration: 300, // 5 minutes
            instructions: [
                'Setze dich bequem hin und schließe die Augen.',
                'Richte deine Aufmerksamkeit auf deinen Atem.',
                'Atme natürlich ein und aus.',
                'Zähle beim Einatmen bis 4, halte den Atem für 4, atme für 4 aus.',
                'Wiederhole diesen Zyklus.',
                'Wenn deine Gedanken abschweifen, kehre sanft zum Atem zurück.',
                'Genieße die Ruhe und Entspannung.'
            ]
        },
        'body-scan': {
            title: 'Body-Scan',
            duration: 600, // 10 minutes
            instructions: [
                'Lege dich bequem hin und schließe die Augen.',
                'Beginne mit deinen Zehen - spüre sie bewusst.',
                'Wandere langsam durch deinen Körper.',
                'Beachte Spannungen, aber bewerte sie nicht.',
                'Atme in jeden Bereich hinein.',
                'Lasse Spannungen mit dem Ausatmen los.',
                'Beende mit einem tiefen, entspannenden Atemzug.'
            ]
        },
        'mindful-walking': {
            title: 'Achtsames Gehen',
            duration: 300, // 5 minutes
            instructions: [
                'Gehe langsam und bewusst.',
                'Spüre jeden Schritt - Heben, Schwingen, Aufsetzen.',
                'Beobachte deine Umgebung ohne zu bewerten.',
                'Achte auf Geräusche, Gerüche, Temperaturen.',
                'Bleibe im gegenwärtigen Moment.',
                'Wenn deine Gedanken abschweifen, kehre zum Gehen zurück.'
            ]
        },
        'progressive-relaxation': {
            title: 'Progressive Muskelentspannung',
            duration: 900, // 15 minutes
            instructions: [
                'Lege dich bequem hin und schließe die Augen.',
                'Beginne mit deinen Füßen - spanne die Muskeln an.',
                'Halte die Spannung für 5 Sekunden.',
                'Lasse los und spüre die Entspannung.',
                'Wiederhole mit Waden, Oberschenkeln, Bauch.',
                'Gehe durch alle Muskelgruppen.',
                'Genieße die tiefe Entspannung.'
            ]
        },
        'breathing-technique': {
            title: '4-7-8 Atemtechnik',
            duration: 300, // 5 minutes
            instructions: [
                'Setze dich aufrecht hin.',
                'Atme durch die Nase ein und zähle bis 4.',
                'Halte den Atem und zähle bis 7.',
                'Atme durch den Mund aus und zähle bis 8.',
                'Wiederhole diesen Zyklus 4-8 Mal.',
                'Konzentriere dich nur auf das Zählen.',
                'Spüre, wie dein Körper entspannt.'
            ]
        },
        'sleep-meditation': {
            title: 'Einschlaf-Meditation',
            duration: 1200, // 20 minutes
            instructions: [
                'Lege dich in deine Schlafposition.',
                'Schließe die Augen und entspanne dich.',
                'Stelle dir einen ruhigen Ort vor.',
                'Atme tief und langsam.',
                'Lasse alle Gedanken los.',
                'Spüre, wie dein Körper schwer wird.',
                'Lasse dich in den Schlaf gleiten.'
            ]
        },
        'concentration': {
            title: 'Konzentrations-Meditation',
            duration: 600, // 10 minutes
            instructions: [
                'Setze dich aufrecht hin.',
                'Wähle einen Fokuspunkt (Atem, Kerze, etc.).',
                'Richte deine gesamte Aufmerksamkeit darauf.',
                'Wenn Gedanken kommen, lasse sie ziehen.',
                'Kehre sanft zum Fokus zurück.',
                'Trainiere deine Konzentration.',
                'Spüre die Klarheit deines Geistes.'
            ]
        },
        'loving-kindness': {
            title: 'Loving-Kindness Meditation',
            duration: 900, // 15 minutes
            instructions: [
                'Setze dich bequem hin und schließe die Augen.',
                'Beginne mit dir selbst: "Möge ich glücklich sein."',
                'Denke an eine geliebte Person.',
                'Sende ihr liebevolle Gedanken.',
                'Erweitere auf neutrale Personen.',
                'Schließe schwierige Menschen ein.',
                'Sende Liebe an alle Wesen.'
            ]
        }
    };
    
    return exercises[exerciseType] || exercises['breathing'];
}

function loadExerciseInstructions(exerciseData) {
    const instructionsContainer = document.getElementById('exercise-instructions');
    instructionsContainer.innerHTML = exerciseData.instructions.map((instruction, index) => `
        <div class="instruction-step ${index === 0 ? 'active' : ''}" data-step="${index}">
            <div class="step-number">${index + 1}</div>
            <div class="step-text">${instruction}</div>
        </div>
    `).join('');
    
    // Start instruction progression
    startInstructionProgression(exerciseData.instructions.length);
}

function startInstructionProgression(totalSteps) {
    let currentStep = 0;
    const stepInterval = setInterval(() => {
        // Remove active class from current step
        document.querySelector(`.instruction-step[data-step="${currentStep}"]`)?.classList.remove('active');
        
        currentStep++;
        
        if (currentStep < totalSteps) {
            // Add active class to next step
            document.querySelector(`.instruction-step[data-step="${currentStep}"]`)?.classList.add('active');
        } else {
            clearInterval(stepInterval);
        }
    }, 30000); // 30 seconds per step
}

function startExerciseTimer(duration) {
    let timeLeft = duration;
    const timerDisplay = document.getElementById('exercise-timer');
    
    const timer = setInterval(() => {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        timeLeft--;
        
        if (timeLeft < 0) {
            clearInterval(timer);
            completeGuidedExercise();
        }
    }, 1000);
}

function completeGuidedExercise() {
    // Save exercise session
    const session = {
        id: Date.now(),
        duration: 0, // Will be calculated
        completed: true,
        date: new Date().toISOString(),
        type: 'guided-exercise'
    };
    
    meditationSessions.push(session);
    saveSessions();
    updateStatistics();
    
    showNotification('Geführte Übung abgeschlossen! 🎉', 'success');
    stopGuidedExercise();
}

function stopGuidedExercise() {
    document.getElementById('exercise-player').style.display = 'none';
}

function showExerciseDetails(exerciseType) {
    const exerciseData = getExerciseData(exerciseType);
    
    const details = `
        <h4>${exerciseData.title}</h4>
        <p><strong>Dauer:</strong> ${Math.floor(exerciseData.duration / 60)} Minuten</p>
        <p><strong>Anleitung:</strong></p>
        <ol>
            ${exerciseData.instructions.map(instruction => `<li>${instruction}</li>`).join('')}
        </ol>
    `;
    
    showModal('Übungsdetails', details);
}

function saveJournalEntry() {
    const date = document.getElementById('journal-date').value;
    const mood = parseInt(document.getElementById('mood-rating').value);
    const exercises = document.getElementById('exercises-done').value;
    const insights = document.getElementById('insights').value;
    const challenges = document.getElementById('challenges').value;
    const gratitude = document.getElementById('gratitude').value;
    
    if (!date || !exercises.trim()) {
        showNotification('Bitte fülle mindestens Datum und Übungen aus!', 'warning');
        return;
    }
    
    const entry = {
        id: Date.now(),
        date: date,
        mood: mood,
        exercises: exercises,
        insights: insights,
        challenges: challenges,
        gratitude: gratitude,
        createdAt: new Date().toISOString()
    };
    
    journalEntries.push(entry);
    saveJournal();
    updateStatistics();
    
    // Clear form
    document.getElementById('exercises-done').value = '';
    document.getElementById('insights').value = '';
    document.getElementById('challenges').value = '';
    document.getElementById('gratitude').value = '';
    document.getElementById('mood-rating').value = '5';
    document.getElementById('mood-value').textContent = '5';
    
    showNotification('Tagebuch-Eintrag gespeichert!', 'success');
}

function viewJournalHistory() {
    if (journalEntries.length === 0) {
        showNotification('Noch keine Einträge vorhanden!', 'info');
        return;
    }
    
    // Sort by date (newest first)
    const sortedEntries = journalEntries.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    const history = sortedEntries.map(entry => `
        <div class="journal-entry-item">
            <h5>📅 ${new Date(entry.date).toLocaleDateString()}</h5>
            <div class="entry-mood">Stimmung: ${entry.mood}/10</div>
            <div class="entry-content">
                <p><strong>Übungen:</strong> ${entry.exercises}</p>
                ${entry.insights ? `<p><strong>Erkenntnisse:</strong> ${entry.insights}</p>` : ''}
                ${entry.challenges ? `<p><strong>Herausforderungen:</strong> ${entry.challenges}</p>` : ''}
                ${entry.gratitude ? `<p><strong>Dankbarkeit:</strong> ${entry.gratitude}</p>` : ''}
            </div>
        </div>
    `).join('');
    
    showModal('Achtsamkeits-Tagebuch', history);
}

function saveReminderSettings() {
    const settings = {
        morningReminder: document.getElementById('morning-reminder').checked,
        morningTime: document.getElementById('morning-time').value,
        eveningReminder: document.getElementById('evening-reminder').checked,
        eveningTime: document.getElementById('evening-time').value,
        stressReminder: document.getElementById('stress-reminder').checked
    };
    
    localStorage.setItem('mindfulness-reminders', JSON.stringify(settings));
    
    // Setup notifications if supported
    if ('Notification' in window) {
        setupNotifications(settings);
    }
}

function setupNotifications(settings) {
    if (Notification.permission === 'granted') {
        // Schedule notifications based on settings
        if (settings.morningReminder) {
            scheduleNotification(settings.morningTime, 'Morgendliche Achtsamkeitsübung', 'Zeit für deine tägliche Achtsamkeitspraxis! 🧘');
        }
        
        if (settings.eveningReminder) {
            scheduleNotification(settings.eveningTime, 'Abendliche Reflexion', 'Reflektiere über deinen Tag und praktiziere Dankbarkeit. 📝');
        }
    } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                setupNotifications(settings);
            }
        });
    }
}

function scheduleNotification(time, title, body) {
    const [hours, minutes] = time.split(':').map(Number);
    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(hours, minutes, 0, 0);
    
    // If time has passed today, schedule for tomorrow
    if (scheduledTime <= now) {
        scheduledTime.setDate(scheduledTime.getDate() + 1);
    }
    
    const timeUntilNotification = scheduledTime.getTime() - now.getTime();
    
    setTimeout(() => {
        new Notification(title, { body: body, icon: '/favicon.ico' });
    }, timeUntilNotification);
}

function updateStatistics() {
    // Calculate streak
    const streak = calculateStreak();
    document.getElementById('streak-days').textContent = streak;
    
    // Calculate total meditation time
    const totalTime = meditationSessions.reduce((total, session) => total + session.duration, 0);
    const hours = Math.floor(totalTime / 3600);
    const minutes = Math.floor((totalTime % 3600) / 60);
    document.getElementById('total-meditation-time').textContent = `${hours}h ${minutes}min`;
    
    // Calculate average mood
    const avgMood = journalEntries.length > 0 
        ? (journalEntries.reduce((sum, entry) => sum + entry.mood, 0) / journalEntries.length).toFixed(1)
        : '0.0';
    document.getElementById('avg-mood').textContent = avgMood;
    
    // Calculate sessions this week
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const thisWeekSessions = meditationSessions.filter(session => 
        new Date(session.date) >= weekAgo
    ).length;
    document.getElementById('last-week-sessions').textContent = `${thisWeekSessions} Sessions`;
    
    // Update main statistics
    document.getElementById('total-sessions').textContent = meditationSessions.length;
    document.getElementById('current-streak').textContent = streak;
    
    const longestSession = meditationSessions.length > 0 
        ? Math.max(...meditationSessions.map(s => s.duration))
        : 0;
    document.getElementById('longest-session').textContent = `${Math.floor(longestSession / 60)}min`;
}

function calculateStreak() {
    if (meditationSessions.length === 0) return 0;
    
    // Sort sessions by date
    const sortedSessions = meditationSessions.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < sortedSessions.length; i++) {
        const sessionDate = new Date(sortedSessions[i].date);
        sessionDate.setHours(0, 0, 0, 0);
        
        if (sessionDate.getTime() === currentDate.getTime()) {
            streak++;
            currentDate.setDate(currentDate.getDate() - 1);
        } else if (sessionDate.getTime() < currentDate.getTime()) {
            break;
        }
    }
    
    return streak;
}

function showModal(title, content) {
    // Create modal if it doesn't exist
    let modal = document.getElementById('mindfulness-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'mindfulness-modal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3 id="modal-title"></h3>
                    <button class="modal-close" onclick="closeModal()">&times;</button>
                </div>
                <div class="modal-body" id="modal-body"></div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML = content;
    modal.style.display = 'block';
}

function closeModal() {
    document.getElementById('mindfulness-modal').style.display = 'none';
}

// Data persistence functions
function saveSessions() {
    localStorage.setItem('mindfulness-sessions', JSON.stringify(meditationSessions));
}

function loadSavedSessions() {
    const saved = localStorage.getItem('mindfulness-sessions');
    if (saved) {
        meditationSessions = JSON.parse(saved);
    }
}

function saveJournal() {
    localStorage.setItem('mindfulness-journal', JSON.stringify(journalEntries));
}

function loadSavedJournal() {
    const saved = localStorage.getItem('mindfulness-journal');
    if (saved) {
        journalEntries = JSON.parse(saved);
    }
}

function saveAssessment() {
    const assessment = {
        score: mindfulnessScore,
        date: new Date().toISOString(),
        answers: {}
    };
    
    document.querySelectorAll('.mindfulness-slider').forEach(slider => {
        assessment.answers[slider.dataset.question] = slider.value;
    });
    
    localStorage.setItem('mindfulness-assessment', JSON.stringify(assessment));
}
