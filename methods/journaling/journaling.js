// Journaling JavaScript Functions

let journalData = {
    setup: {
        style: '',
        frequency: '',
        preferredTime: 'morning',
        writingDuration: 15,
        writingMedium: 'digital'
    },
    entries: [],
    patterns: {
        emotions: [],
        themes: [],
        timePatterns: []
    },
    growth: {
        goals: [],
        development: [],
        achievements: []
    }
};

function initJournaling() {
    console.log('Initializing Journaling...');
    
    // Load saved data
    loadSavedJournalData();
    
    // Setup event listeners
    setupJournalEventListeners();
    
    // Initialize UI
    updateJournalSummary();
}

function setupJournalEventListeners() {
    // Setup form changes
    document.querySelectorAll('input[name="journaling-style"]').forEach(radio => {
        radio.addEventListener('change', function() {
            journalData.setup.style = this.value;
            saveJournalData();
        });
    });
    
    document.querySelectorAll('input[name="frequency"]').forEach(radio => {
        radio.addEventListener('change', function() {
            journalData.setup.frequency = this.value;
            saveJournalData();
        });
    });
    
    document.getElementById('preferred-time').addEventListener('change', function() {
        journalData.setup.preferredTime = this.value;
        saveJournalData();
    });
    
    document.getElementById('writing-duration').addEventListener('input', function() {
        journalData.setup.writingDuration = parseInt(this.value);
        saveJournalData();
    });
    
    document.getElementById('writing-medium').addEventListener('change', function() {
        journalData.setup.writingMedium = this.value;
        saveJournalData();
    });
}

function startQuickReflection() {
    showReflectionModal('5-Minuten-Reflexion', [
        'Was war heute gut?',
        'Was war herausfordernd?',
        'Was habe ich gelernt?'
    ]);
}

function startGoalReflection() {
    showReflectionModal('Ziel-Reflexion', [
        'Welche Ziele verfolge ich?',
        'Was habe ich heute dafür getan?',
        'Was kann ich morgen besser machen?'
    ]);
}

function startEmotionReflection() {
    showReflectionModal('Gefühls-Tagebuch', [
        'Wie fühle ich mich gerade?',
        'Was hat dieses Gefühl ausgelöst?',
        'Wie kann ich damit umgehen?'
    ]);
}

function startProblemReflection() {
    showReflectionModal('Problem-Lösung', [
        'Was ist das Problem genau?',
        'Welche Lösungsansätze gibt es?',
        'Was ist der nächste Schritt?'
    ]);
}

function startGratitudeReflection() {
    showReflectionModal('Dankbarkeits-Übung', [
        'Wofür bin ich heute dankbar?',
        'Was hat mich heute zum Lächeln gebracht?',
        'Welche kleinen Freuden gab es?'
    ]);
}

function startVisionReflection() {
    showReflectionModal('Zukunftsvision', [
        'Wo möchte ich in einem Jahr sein?',
        'Was muss ich dafür tun?',
        'Welche Hindernisse gibt es?'
    ]);
}

function showReflectionModal(title, questions) {
    const modal = document.createElement('div');
    modal.className = 'reflection-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${title}</h3>
                <button class="close-btn" onclick="closeModal(this)">&times;</button>
            </div>
            <div class="modal-body">
                <div class="reflection-questions">
                    ${questions.map((question, index) => `
                        <div class="question-item">
                            <label>${question}</label>
                            <textarea placeholder="Deine Antwort..." rows="3"></textarea>
                        </div>
                    `).join('')}
                </div>
                <div class="reflection-actions">
                    <button class="btn btn-primary" onclick="saveReflection('${title}', this)">Eintrag speichern</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'flex';
}

function saveReflection(title, button) {
    const modal = button.closest('.reflection-modal');
    const questions = modal.querySelectorAll('.question-item');
    
    const entry = {
        id: Date.now(),
        title: title,
        date: new Date().toISOString(),
        responses: []
    };
    
    questions.forEach(question => {
        const label = question.querySelector('label').textContent;
        const answer = question.querySelector('textarea').value.trim();
        if (answer) {
            entry.responses.push({ question: label, answer: answer });
        }
    });
    
    if (entry.responses.length > 0) {
        journalData.entries.push(entry);
        updatePatternAnalysis();
        updateJournalSummary();
        saveJournalData();
        showNotification('Reflexion gespeichert!', 'success');
        closeModal(modal.querySelector('.close-btn'));
    } else {
        showNotification('Bitte beantworte mindestens eine Frage!', 'warning');
    }
}

function updatePatternAnalysis() {
    // Update emotion tracking
    updateEmotionTracking();
    
    // Update theme analysis
    updateThemeAnalysis();
    
    // Update time patterns
    updateTimePatterns();
    
    // Update pattern insights
    updatePatternInsights();
}

function updateEmotionTracking() {
    const emotionTracking = document.getElementById('emotion-tracking');
    const recentEntries = journalData.entries.slice(-7); // Last 7 entries
    
    if (recentEntries.length === 0) {
        emotionTracking.innerHTML = '<p>Füge Einträge hinzu, um Gefühls-Trends zu sehen.</p>';
        return;
    }
    
    // Simple emotion analysis based on keywords
    const emotions = {
        'positiv': 0,
        'negativ': 0,
        'neutral': 0
    };
    
    recentEntries.forEach(entry => {
        entry.responses.forEach(response => {
            const text = response.answer.toLowerCase();
            if (text.includes('gut') || text.includes('toll') || text.includes('freude') || text.includes('dankbar')) {
                emotions.positiv++;
            } else if (text.includes('schlecht') || text.includes('schwierig') || text.includes('probleme') || text.includes('stress')) {
                emotions.negativ++;
            } else {
                emotions.neutral++;
            }
        });
    });
    
    const total = emotions.positiv + emotions.negativ + emotions.neutral;
    if (total > 0) {
        emotionTracking.innerHTML = `
            <div class="emotion-stats">
                <div class="emotion-item positive">
                    <span>Positiv: ${Math.round((emotions.positiv / total) * 100)}%</span>
                </div>
                <div class="emotion-item negative">
                    <span>Negativ: ${Math.round((emotions.negativ / total) * 100)}%</span>
                </div>
                <div class="emotion-item neutral">
                    <span>Neutral: ${Math.round((emotions.neutral / total) * 100)}%</span>
                </div>
            </div>
        `;
    }
}

function updateThemeAnalysis() {
    const themeAnalysis = document.getElementById('theme-analysis');
    const allText = journalData.entries.flatMap(entry => 
        entry.responses.map(response => response.answer.toLowerCase())
    ).join(' ');
    
    if (allText.length === 0) {
        themeAnalysis.innerHTML = '<p>Füge Einträge hinzu, um wiederkehrende Themen zu identifizieren.</p>';
        return;
    }
    
    // Simple keyword analysis
    const themes = {
        'Arbeit': ['arbeit', 'beruf', 'karriere', 'projekt', 'kollege'],
        'Beziehungen': ['freund', 'familie', 'partner', 'beziehung', 'liebe'],
        'Gesundheit': ['gesundheit', 'fitness', 'sport', 'krank', 'wohlbefinden'],
        'Lernen': ['lernen', 'studium', 'kurs', 'buch', 'wissen'],
        'Hobbys': ['hobby', 'freizeit', 'spaß', 'interesse', 'leidenschaft']
    };
    
    const themeCounts = {};
    Object.keys(themes).forEach(theme => {
        themeCounts[theme] = themes[theme].reduce((count, keyword) => {
            return count + (allText.split(keyword).length - 1);
        }, 0);
    });
    
    const topThemes = Object.entries(themeCounts)
        .filter(([theme, count]) => count > 0)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3);
    
    if (topThemes.length > 0) {
        themeAnalysis.innerHTML = topThemes.map(([theme, count]) => 
            `<div class="theme-item">${theme}: ${count} Erwähnungen</div>`
        ).join('');
    } else {
        themeAnalysis.innerHTML = '<p>Noch keine wiederkehrenden Themen identifiziert.</p>';
    }
}

function updateTimePatterns() {
    const timePatterns = document.getElementById('time-patterns');
    
    if (journalData.entries.length === 0) {
        timePatterns.innerHTML = '<p>Füge Einträge hinzu, um zeitliche Muster zu erkennen.</p>';
        return;
    }
    
    // Analyze entry times
    const entryTimes = journalData.entries.map(entry => {
        const date = new Date(entry.date);
        return {
            hour: date.getHours(),
            dayOfWeek: date.getDay()
        };
    });
    
    const morningEntries = entryTimes.filter(entry => entry.hour < 12).length;
    const afternoonEntries = entryTimes.filter(entry => entry.hour >= 12 && entry.hour < 18).length;
    const eveningEntries = entryTimes.filter(entry => entry.hour >= 18).length;
    
    timePatterns.innerHTML = `
        <div class="time-stats">
            <div class="time-item">Morgens: ${morningEntries} Einträge</div>
            <div class="time-item">Nachmittags: ${afternoonEntries} Einträge</div>
            <div class="time-item">Abends: ${eveningEntries} Einträge</div>
        </div>
    `;
}

function updatePatternInsights() {
    const patternInsights = document.getElementById('pattern-insights');
    
    if (journalData.entries.length === 0) {
        patternInsights.innerHTML = '<p>Füge Einträge hinzu, um Erkenntnisse über deine Muster zu erhalten.</p>';
        return;
    }
    
    const insights = [];
    
    // Entry frequency insight
    const daysSinceFirst = Math.ceil((Date.now() - new Date(journalData.entries[0].date)) / (1000 * 60 * 60 * 24));
    const averageEntriesPerWeek = (journalData.entries.length / daysSinceFirst) * 7;
    
    if (averageEntriesPerWeek >= 5) {
        insights.push('✅ Du schreibst sehr regelmäßig - das ist großartig für deine Selbstreflexion!');
    } else if (averageEntriesPerWeek >= 2) {
        insights.push('👍 Du schreibst regelmäßig - versuche, die Häufigkeit zu steigern.');
    } else {
        insights.push('💡 Versuche, öfter zu schreiben, um mehr Muster zu erkennen.');
    }
    
    // Recent activity insight
    const lastEntry = new Date(journalData.entries[journalData.entries.length - 1].date);
    const daysSinceLastEntry = Math.ceil((Date.now() - lastEntry) / (1000 * 60 * 60 * 24));
    
    if (daysSinceLastEntry <= 1) {
        insights.push('🔥 Du warst heute aktiv - bleib dran!');
    } else if (daysSinceLastEntry <= 3) {
        insights.push('⏰ Es ist Zeit für einen neuen Eintrag.');
    } else {
        insights.push('📝 Du hast schon länger nicht geschrieben - wie wäre es mit einer Reflexion?');
    }
    
    patternInsights.innerHTML = insights.map(insight => `<div class="insight-item">${insight}</div>`).join('');
}

function updateJournalSummary() {
    document.getElementById('total-entries').textContent = journalData.entries.length;
    
    // Count growth areas
    const growthAreas = new Set();
    journalData.entries.forEach(entry => {
        entry.responses.forEach(response => {
            if (response.answer.toLowerCase().includes('ziel') || response.answer.toLowerCase().includes('wachstum')) {
                growthAreas.add('Ziele');
            }
            if (response.answer.toLowerCase().includes('lernen') || response.answer.toLowerCase().includes('entwicklung')) {
                growthAreas.add('Entwicklung');
            }
        });
    });
    document.getElementById('growth-areas').textContent = growthAreas.size;
    
    // Count achievements
    const achievements = journalData.entries.filter(entry => 
        entry.responses.some(response => 
            response.answer.toLowerCase().includes('erfolg') || 
            response.answer.toLowerCase().includes('geschafft') ||
            response.answer.toLowerCase().includes('stolz')
        )
    ).length;
    document.getElementById('achievements-count').textContent = achievements;
}

function closeModal(button) {
    const modal = button.closest('.reflection-modal');
    modal.remove();
}

// Data persistence functions
function saveJournalData() {
    localStorage.setItem('journaling-data', JSON.stringify(journalData));
}

function loadSavedJournalData() {
    const saved = localStorage.getItem('journaling-data');
    if (saved) {
        journalData = JSON.parse(saved);
        
        // Restore setup
        if (journalData.setup.style) {
            document.querySelector(`input[value="${journalData.setup.style}"]`).checked = true;
        }
        if (journalData.setup.frequency) {
            document.querySelector(`input[value="${journalData.setup.frequency}"]`).checked = true;
        }
        document.getElementById('preferred-time').value = journalData.setup.preferredTime;
        document.getElementById('writing-duration').value = journalData.setup.writingDuration;
        document.getElementById('writing-medium').value = journalData.setup.writingMedium;
        
        // Update analysis
        updatePatternAnalysis();
    }
}
