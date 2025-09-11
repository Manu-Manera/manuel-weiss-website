// Personal Coach System Implementation

class PersonalCoach {
    constructor() {
        this.isActive = false;
        this.currentPath = null;
        this.userProfile = null;
        this.coachingHistory = [];
        this.reminderSettings = {
            enabled: false,
            frequency: 'daily',
            time: '09:00',
            methods: []
        };
        
        this.methodPaths = {
            'beginner': [
                { method: 'values-clarification', name: 'Werte-Klärung', duration: '30 min', priority: 1 },
                { method: 'strengths-analysis', name: 'Stärken-Analyse', duration: '45 min', priority: 2 },
                { method: 'goal-setting', name: 'Ziel-Setting', duration: '60 min', priority: 3 },
                { method: 'habit-building', name: 'Gewohnheiten aufbauen', duration: '40 min', priority: 4 }
            ],
            'intermediate': [
                { method: 'ikigai', name: 'Ikigai-Workflow', duration: '120 min', priority: 1 },
                { method: 'emotional-intelligence', name: 'Emotionale Intelligenz', duration: '90 min', priority: 2 },
                { method: 'mindfulness', name: 'Achtsamkeit & Meditation', duration: '60 min', priority: 3 },
                { method: 'five-pillars', name: 'Five Pillars', duration: '90 min', priority: 4 }
            ],
            'advanced': [
                { method: 'nlp-meta-goal', name: 'NLP Meta Goal', duration: '90 min', priority: 1 },
                { method: 'walt-disney', name: 'Walt Disney Methode', duration: '120 min', priority: 2 },
                { method: 'harvard-method', name: 'Harvard Methode', duration: '75 min', priority: 3 },
                { method: 'resource-analysis', name: 'Resource Analysis', duration: '90 min', priority: 4 }
            ]
        };
        
        this.init();
    }
    
    init() {
        this.loadUserProfile();
        this.setupEventListeners();
        this.renderCoachInterface();
    }
    
    loadUserProfile() {
        const savedProfile = localStorage.getItem('coach-user-profile');
        if (savedProfile) {
            this.userProfile = JSON.parse(savedProfile);
        } else {
            this.userProfile = {
                level: 'beginner',
                completedMethods: [],
                currentGoals: [],
                preferences: {
                    sessionLength: 'medium',
                    focusAreas: [],
                    learningStyle: 'visual'
                },
                progress: {
                    totalSessions: 0,
                    totalTime: 0,
                    streak: 0,
                    lastSession: null
                }
            };
        }
    }
    
    saveUserProfile() {
        localStorage.setItem('coach-user-profile', JSON.stringify(this.userProfile));
    }
    
    setupEventListeners() {
        // Coach activation
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-coach-action]')) {
                const action = e.target.dataset.coachAction;
                this.handleCoachAction(action);
            }
        });
        
        // Reminder settings
        document.addEventListener('change', (e) => {
            if (e.target.matches('[data-reminder-setting]')) {
                this.updateReminderSettings(e.target);
            }
        });
    }
    
    renderCoachInterface() {
        const coachContainer = document.getElementById('coach-container');
        if (!coachContainer) return;
        
        coachContainer.innerHTML = `
            <div class="coach-interface">
                <div class="coach-header">
                    <div class="coach-status">
                        <div class="coach-avatar">
                            <i class="fas fa-robot"></i>
                        </div>
                        <div class="coach-info">
                            <h3>Dein persönlicher Coach</h3>
                            <p class="coach-status-text">${this.isActive ? 'Aktiv' : 'Bereit'}</p>
                        </div>
                    </div>
                    <div class="coach-controls">
                        <button class="btn btn-primary" data-coach-action="toggle">
                            ${this.isActive ? 'Coach pausieren' : 'Coach aktivieren'}
                        </button>
                    </div>
                </div>
                
                ${this.isActive ? this.renderActiveCoach() : this.renderInactiveCoach()}
            </div>
        `;
    }
    
    renderActiveCoach() {
        return `
            <div class="coach-active">
                <div class="coach-message">
                    <div class="message-bubble">
                        <p>${this.getCurrentMessage()}</p>
                    </div>
                </div>
                
                <div class="coach-recommendations">
                    <h4>Empfohlene nächste Schritte:</h4>
                    <div class="recommendations-list">
                        ${this.getRecommendations().map(rec => `
                            <div class="recommendation-item">
                                <div class="rec-icon">
                                    <i class="${rec.icon}"></i>
                                </div>
                                <div class="rec-content">
                                    <h5>${rec.title}</h5>
                                    <p>${rec.description}</p>
                                    <div class="rec-meta">
                                        <span class="duration">${rec.duration}</span>
                                        <span class="priority">Priorität: ${rec.priority}/5</span>
                                    </div>
                                </div>
                                <div class="rec-actions">
                                    <button class="btn btn-sm btn-primary" data-coach-action="start-method" data-method="${rec.method}">
                                        Starten
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="coach-progress">
                    <h4>Dein Fortschritt</h4>
                    <div class="progress-stats">
                        <div class="stat-item">
                            <div class="stat-value">${this.userProfile.progress.totalSessions}</div>
                            <div class="stat-label">Sessions</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">${Math.round(this.userProfile.progress.totalTime / 60)}h</div>
                            <div class="stat-label">Investierte Zeit</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">${this.userProfile.progress.streak}</div>
                            <div class="stat-label">Tage Streak</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    renderInactiveCoach() {
        return `
            <div class="coach-inactive">
                <div class="coach-setup">
                    <h4>Coach einrichten</h4>
                    <div class="setup-form">
                        <div class="form-group">
                            <label>Dein Level:</label>
                            <select id="coach-level" data-reminder-setting="level">
                                <option value="beginner" ${this.userProfile.level === 'beginner' ? 'selected' : ''}>Anfänger</option>
                                <option value="intermediate" ${this.userProfile.level === 'intermediate' ? 'selected' : ''}>Fortgeschritten</option>
                                <option value="advanced" ${this.userProfile.level === 'advanced' ? 'selected' : ''}>Experte</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label>Session-Länge:</label>
                            <select id="session-length" data-reminder-setting="sessionLength">
                                <option value="short" ${this.userProfile.preferences.sessionLength === 'short' ? 'selected' : ''}>Kurz (15-30 min)</option>
                                <option value="medium" ${this.userProfile.preferences.sessionLength === 'medium' ? 'selected' : ''}>Mittel (30-60 min)</option>
                                <option value="long" ${this.userProfile.preferences.sessionLength === 'long' ? 'selected' : ''}>Lang (60+ min)</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label>Fokus-Bereiche:</label>
                            <div class="checkbox-group">
                                <label><input type="checkbox" value="goals" data-reminder-setting="focusGoals"> Ziele setzen</label>
                                <label><input type="checkbox" value="habits" data-reminder-setting="focusHabits"> Gewohnheiten</label>
                                <label><input type="checkbox" value="mindfulness" data-reminder-setting="focusMindfulness"> Achtsamkeit</label>
                                <label><input type="checkbox" value="communication" data-reminder-setting="focusCommunication"> Kommunikation</label>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="coach-reminders">
                    <h4>Erinnerungen einrichten</h4>
                    <div class="reminder-form">
                        <div class="form-group">
                            <label>
                                <input type="checkbox" id="enable-reminders" data-reminder-setting="enabled" ${this.reminderSettings.enabled ? 'checked' : ''}>
                                Erinnerungen aktivieren
                            </label>
                        </div>
                        
                        <div class="reminder-settings" style="display: ${this.reminderSettings.enabled ? 'block' : 'none'}">
                            <div class="form-group">
                                <label>Häufigkeit:</label>
                                <select id="reminder-frequency" data-reminder-setting="frequency">
                                    <option value="daily" ${this.reminderSettings.frequency === 'daily' ? 'selected' : ''}>Täglich</option>
                                    <option value="weekly" ${this.reminderSettings.frequency === 'weekly' ? 'selected' : ''}>Wöchentlich</option>
                                    <option value="custom" ${this.reminderSettings.frequency === 'custom' ? 'selected' : ''}>Benutzerdefiniert</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label>Uhrzeit:</label>
                                <input type="time" id="reminder-time" data-reminder-setting="time" value="${this.reminderSettings.time}">
                            </div>
                            
                            <div class="form-group">
                                <label>WhatsApp-Erinnerungen:</label>
                                <div class="whatsapp-setup">
                                    <input type="tel" id="whatsapp-number" placeholder="+49 123 456789" data-reminder-setting="whatsappNumber">
                                    <button class="btn btn-sm btn-success" data-coach-action="test-whatsapp">
                                        <i class="fab fa-whatsapp"></i> Test senden
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    getCurrentMessage() {
        const messages = {
            beginner: [
                "Willkommen! Lass uns gemeinsam deine Reise zur persönlichen Entwicklung beginnen.",
                "Ich helfe dir dabei, deine Werte zu entdecken und deine Ziele zu setzen.",
                "Bereit für deine erste Session? Ich habe die perfekte Methode für dich vorbereitet."
            ],
            intermediate: [
                "Du machst großartige Fortschritte! Lass uns tiefer in die Materie eintauchen.",
                "Ich sehe, dass du bereit für fortgeschrittenere Methoden bist.",
                "Zeit für eine neue Herausforderung! Welche Methode interessiert dich heute?"
            ],
            advanced: [
                "Du bist ein wahrer Experte! Lass uns komplexe Methoden erkunden.",
                "Ich bin beeindruckt von deinem Engagement. Zeit für die nächste Stufe!",
                "Bereit für eine echte Herausforderung? Ich habe etwas Besonderes für dich."
            ]
        };
        
        const levelMessages = messages[this.userProfile.level] || messages.beginner;
        return levelMessages[Math.floor(Math.random() * levelMessages.length)];
    }
    
    getRecommendations() {
        const path = this.methodPaths[this.userProfile.level];
        const completedMethods = this.userProfile.completedMethods;
        
        return path
            .filter(method => !completedMethods.includes(method.method))
            .slice(0, 3)
            .map(method => ({
                ...method,
                icon: this.getMethodIcon(method.method),
                priority: this.calculatePriority(method)
            }));
    }
    
    getMethodIcon(method) {
        const icons = {
            'values-clarification': 'fas fa-heart',
            'strengths-analysis': 'fas fa-star',
            'goal-setting': 'fas fa-bullseye',
            'habit-building': 'fas fa-repeat',
            'ikigai': 'fas fa-compass',
            'emotional-intelligence': 'fas fa-brain',
            'mindfulness': 'fas fa-leaf',
            'five-pillars': 'fas fa-building',
            'nlp-meta-goal': 'fas fa-rocket',
            'walt-disney': 'fas fa-magic',
            'harvard-method': 'fas fa-handshake',
            'resource-analysis': 'fas fa-chart-bar'
        };
        return icons[method] || 'fas fa-lightbulb';
    }
    
    calculatePriority(method) {
        // Calculate priority based on user progress and preferences
        let priority = method.priority;
        
        // Adjust based on user preferences
        if (this.userProfile.preferences.focusAreas.includes(method.method)) {
            priority += 2;
        }
        
        // Adjust based on session length preference
        const duration = parseInt(method.duration);
        if (this.userProfile.preferences.sessionLength === 'short' && duration > 30) {
            priority -= 1;
        } else if (this.userProfile.preferences.sessionLength === 'long' && duration < 60) {
            priority += 1;
        }
        
        return Math.min(5, Math.max(1, priority));
    }
    
    handleCoachAction(action) {
        switch (action) {
            case 'toggle':
                this.toggleCoach();
                break;
            case 'start-method':
                const method = event.target.dataset.method;
                this.startMethod(method);
                break;
            case 'test-whatsapp':
                this.testWhatsApp();
                break;
        }
    }
    
    toggleCoach() {
        this.isActive = !this.isActive;
        this.renderCoachInterface();
        
        if (this.isActive) {
            this.startCoachingSession();
        } else {
            this.pauseCoachingSession();
        }
    }
    
    startMethod(method) {
        // Navigate to method
        window.location.href = `persoenlichkeitsentwicklung-uebersicht.html#method-${method}`;
        
        // Track method start
        this.trackMethodStart(method);
    }
    
    trackMethodStart(method) {
        this.coachingHistory.push({
            action: 'method_started',
            method: method,
            timestamp: new Date().toISOString()
        });
        
        this.saveCoachingHistory();
    }
    
    trackMethodComplete(method, duration) {
        this.userProfile.completedMethods.push(method);
        this.userProfile.progress.totalSessions += 1;
        this.userProfile.progress.totalTime += duration;
        this.userProfile.progress.lastSession = new Date().toISOString();
        
        // Update streak
        const today = new Date().toDateString();
        const lastSession = this.userProfile.progress.lastSession ? new Date(this.userProfile.progress.lastSession).toDateString() : null;
        
        if (lastSession === today) {
            // Same day, don't change streak
        } else if (lastSession && new Date(today) - new Date(lastSession) === 86400000) {
            // Next day, increment streak
            this.userProfile.progress.streak += 1;
        } else {
            // Gap in days, reset streak
            this.userProfile.progress.streak = 1;
        }
        
        this.saveUserProfile();
        
        this.coachingHistory.push({
            action: 'method_completed',
            method: method,
            duration: duration,
            timestamp: new Date().toISOString()
        });
        
        this.saveCoachingHistory();
    }
    
    updateReminderSettings(element) {
        const setting = element.dataset.reminderSetting;
        const value = element.type === 'checkbox' ? element.checked : element.value;
        
        if (setting === 'enabled') {
            this.reminderSettings.enabled = value;
            const reminderSettings = document.querySelector('.reminder-settings');
            if (reminderSettings) {
                reminderSettings.style.display = value ? 'block' : 'none';
            }
        } else if (setting === 'level') {
            this.userProfile.level = value;
        } else if (setting === 'sessionLength') {
            this.userProfile.preferences.sessionLength = value;
        } else if (setting === 'frequency') {
            this.reminderSettings.frequency = value;
        } else if (setting === 'time') {
            this.reminderSettings.time = value;
        } else if (setting === 'whatsappNumber') {
            this.reminderSettings.whatsappNumber = value;
        } else if (setting.startsWith('focus')) {
            const focusArea = setting.replace('focus', '').toLowerCase();
            if (value) {
                if (!this.userProfile.preferences.focusAreas.includes(focusArea)) {
                    this.userProfile.preferences.focusAreas.push(focusArea);
                }
            } else {
                this.userProfile.preferences.focusAreas = this.userProfile.preferences.focusAreas.filter(area => area !== focusArea);
            }
        }
        
        this.saveUserProfile();
        this.saveReminderSettings();
    }
    
    saveReminderSettings() {
        localStorage.setItem('coach-reminder-settings', JSON.stringify(this.reminderSettings));
    }
    
    saveCoachingHistory() {
        localStorage.setItem('coach-history', JSON.stringify(this.coachingHistory));
    }
    
    startCoachingSession() {
        console.log('Coaching session started');
        // Initialize coaching session
        this.scheduleReminders();
    }
    
    pauseCoachingSession() {
        console.log('Coaching session paused');
        // Pause coaching session
    }
    
    scheduleReminders() {
        if (!this.reminderSettings.enabled) return;
        
        // Schedule reminders based on settings
        const now = new Date();
        const reminderTime = new Date();
        const [hours, minutes] = this.reminderSettings.time.split(':');
        reminderTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        
        if (reminderTime <= now) {
            reminderTime.setDate(reminderTime.getDate() + 1);
        }
        
        const timeUntilReminder = reminderTime.getTime() - now.getTime();
        
        setTimeout(() => {
            this.sendReminder();
        }, timeUntilReminder);
    }
    
    sendReminder() {
        if (this.reminderSettings.whatsappNumber) {
            this.sendWhatsAppReminder();
        }
        
        // Show browser notification
        if (Notification.permission === 'granted') {
            new Notification('Persönlichkeitsentwicklung', {
                body: 'Zeit für deine nächste Session! Dein Coach wartet auf dich.',
                icon: '/favicon.ico'
            });
        }
        
        // Schedule next reminder
        this.scheduleReminders();
    }
    
    sendWhatsAppReminder() {
        const message = `Hallo! 👋\n\nZeit für deine nächste Persönlichkeitsentwicklungs-Session! 🚀\n\nDein Coach hat eine neue Methode für dich vorbereitet. Besuche: https://mawps.netlify.app/persoenlichkeitsentwicklung-uebersicht.html\n\nViel Erfolg! 💪`;
        
        const whatsappUrl = `https://wa.me/${this.reminderSettings.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
        
        // Open WhatsApp in new tab
        window.open(whatsappUrl, '_blank');
    }
    
    testWhatsApp() {
        const number = document.getElementById('whatsapp-number').value;
        if (!number) {
            alert('Bitte gib deine WhatsApp-Nummer ein.');
            return;
        }
        
        this.reminderSettings.whatsappNumber = number;
        this.sendWhatsAppReminder();
    }
}

// Initialize coach when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.personalCoach = new PersonalCoach();
});

// Export for use in other modules
window.PersonalCoach = PersonalCoach;
