// User Profile Management System
class UserProfile {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        this.currentUser = window.userAuth ? window.userAuth.getCurrentUser() : null;
        if (this.currentUser) {
            this.setupEventListeners();
        }
    }

    setupEventListeners() {
        // Profile editing
        document.addEventListener('profileEdit', (e) => this.showProfileEditor());
        document.addEventListener('settingsEdit', (e) => this.showSettingsPanel());
        document.addEventListener('goalAdd', (e) => this.showGoalEditor());
        document.addEventListener('goalEdit', (e) => this.showGoalEditor(e.detail.goalId));
        document.addEventListener('dataExport', (e) => this.exportUserData(e.detail.format));
    }

    showProfileEditor() {
        this.createModal('Profil bearbeiten', this.getProfileEditorHTML());
        this.setupProfileEditorEvents();
    }

    showSettingsPanel() {
        this.createModal('Einstellungen', this.getSettingsPanelHTML());
        this.setupSettingsPanelEvents();
    }

    showGoalEditor(goalId = null) {
        const title = goalId ? 'Ziel bearbeiten' : 'Neues Ziel hinzufügen';
        this.createModal(title, this.getGoalEditorHTML(goalId));
        this.setupGoalEditorEvents(goalId);
    }

    getProfileEditorHTML() {
        return `
            <div class="profile-editor">
                <div class="profile-avatar-section">
                    <div class="avatar-preview">
                        <img id="avatarPreview" src="${this.currentUser.profile.avatar || this.getDefaultAvatar()}" alt="Avatar">
                        <button type="button" class="avatar-change-btn" onclick="window.userProfile.changeAvatar()">
                            <i class="fas fa-camera"></i>
                        </button>
                    </div>
                    <input type="file" id="avatarInput" accept="image/*" style="display: none;" onchange="window.userProfile.handleAvatarChange(event)">
                    <div class="avatar-actions">
                        <button type="button" class="btn btn-outline btn-sm" onclick="window.userProfile.removeAvatar()">
                            <i class="fas fa-trash"></i> Entfernen
                        </button>
                    </div>
                </div>

                <form id="profileForm" class="profile-form">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="editFirstName">Vorname</label>
                            <input type="text" id="editFirstName" name="firstName" value="${this.currentUser.firstName}" required>
                        </div>
                        <div class="form-group">
                            <label for="editLastName">Nachname</label>
                            <input type="text" id="editLastName" name="lastName" value="${this.currentUser.lastName}" required>
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="editEmail">E-Mail-Adresse</label>
                        <div class="email-change-section">
                            <input type="email" id="editEmail" name="email" value="${this.currentUser.email}" required>
                            <button type="button" class="btn btn-outline btn-sm" onclick="window.userProfile.showEmailChangeModal()">
                                <i class="fas fa-edit"></i> Ändern
                            </button>
                        </div>
                        <div class="email-status">
                            ${this.currentUser.emailVerified ? 
                                '<span class="status-verified"><i class="fas fa-check-circle"></i> E-Mail bestätigt</span>' : 
                                '<span class="status-unverified"><i class="fas fa-exclamation-circle"></i> E-Mail nicht bestätigt</span>'
                            }
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="editBirthDate">Geburtsdatum</label>
                        <input type="date" id="editBirthDate" name="birthDate" value="${this.currentUser.birthDate || ''}">
                    </div>

                    <div class="form-group">
                        <label for="editBio">Über mich</label>
                        <textarea id="editBio" name="bio" rows="4" placeholder="Erzähle etwas über dich...">${this.currentUser.profile.bio || ''}</textarea>
                    </div>

                    <div class="form-group">
                        <label for="editInterests">Interessen</label>
                        <div class="interests-input">
                            <input type="text" id="interestsInput" placeholder="Interesse hinzufügen...">
                            <button type="button" onclick="window.userProfile.addInterest()">Hinzufügen</button>
                        </div>
                        <div id="interestsList" class="interests-list">
                            ${this.renderInterests()}
                        </div>
                    </div>

                    <div class="form-actions">
                        <button type="button" class="btn btn-secondary" onclick="window.userProfile.closeModal()">Abbrechen</button>
                        <button type="submit" class="btn btn-primary">Speichern</button>
                    </div>
                </form>
            </div>
        `;
    }

    getSettingsPanelHTML() {
        return `
            <div class="settings-panel">
                <div class="settings-tabs">
                    <button class="settings-tab active" data-tab="general">Allgemein</button>
                    <button class="settings-tab" data-tab="notifications">Benachrichtigungen</button>
                    <button class="settings-tab" data-tab="privacy">Datenschutz</button>
                    <button class="settings-tab" data-tab="export">Export</button>
                </div>

                <div class="settings-content">
                    <!-- General Settings -->
                    <div id="generalSettings" class="settings-section active">
                        <h3>Allgemeine Einstellungen</h3>
                        
                        <div class="setting-group">
                            <label for="themeSelect">Design-Theme</label>
                            <select id="themeSelect" name="theme">
                                <option value="light" ${this.currentUser.settings.theme === 'light' ? 'selected' : ''}>Hell</option>
                                <option value="dark" ${this.currentUser.settings.theme === 'dark' ? 'selected' : ''}>Dunkel</option>
                                <option value="auto" ${this.currentUser.settings.theme === 'auto' ? 'selected' : ''}>Automatisch</option>
                            </select>
                        </div>

                        <div class="setting-group">
                            <label for="languageSelect">Sprache</label>
                            <select id="languageSelect" name="language">
                                <option value="de" ${this.currentUser.settings.language === 'de' ? 'selected' : ''}>Deutsch</option>
                                <option value="en" ${this.currentUser.settings.language === 'en' ? 'selected' : ''}>English</option>
                            </select>
                        </div>

                        <div class="setting-group">
                            <label for="timezoneSelect">Zeitzone</label>
                            <select id="timezoneSelect" name="timezone">
                                <option value="Europe/Berlin" selected>Europa/Berlin (CET)</option>
                                <option value="Europe/London">Europa/London (GMT)</option>
                                <option value="America/New_York">Amerika/New York (EST)</option>
                            </select>
                        </div>
                    </div>

                    <!-- Notification Settings -->
                    <div id="notificationSettings" class="settings-section">
                        <h3>Benachrichtigungen</h3>
                        
                        <div class="setting-group">
                            <div class="setting-item">
                                <label for="emailNotifications">E-Mail Benachrichtigungen</label>
                                <input type="checkbox" id="emailNotifications" name="emailNotifications" ${this.currentUser.settings.emailUpdates ? 'checked' : ''}>
                            </div>
                        </div>

                        <div class="setting-group">
                            <div class="setting-item">
                                <label for="progressReminders">Fortschritts-Erinnerungen</label>
                                <input type="checkbox" id="progressReminders" name="progressReminders" ${this.currentUser.settings.notifications ? 'checked' : ''}>
                            </div>
                        </div>

                        <div class="setting-group">
                            <div class="setting-item">
                                <label for="weeklyReports">Wöchentliche Berichte</label>
                                <input type="checkbox" id="weeklyReports" name="weeklyReports">
                            </div>
                        </div>

                        <div class="setting-group">
                            <div class="setting-item">
                                <label for="goalReminders">Ziel-Erinnerungen</label>
                                <input type="checkbox" id="goalReminders" name="goalReminders">
                            </div>
                        </div>
                    </div>

                    <!-- Privacy Settings -->
                    <div id="privacySettings" class="settings-section">
                        <h3>Datenschutz & Sicherheit</h3>
                        
                        <div class="setting-group">
                            <h4>Passwort ändern</h4>
                            <form id="passwordChangeForm">
                                <div class="form-group">
                                    <label for="currentPassword">Aktuelles Passwort</label>
                                    <input type="password" id="currentPassword" name="currentPassword" required>
                                </div>
                                <div class="form-group">
                                    <label for="newPassword">Neues Passwort</label>
                                    <input type="password" id="newPassword" name="newPassword" required minlength="8">
                                </div>
                                <div class="form-group">
                                    <label for="confirmNewPassword">Passwort bestätigen</label>
                                    <input type="password" id="confirmNewPassword" name="confirmNewPassword" required>
                                </div>
                                <button type="submit" class="btn btn-primary">Passwort ändern</button>
                            </form>
                        </div>

                        <div class="setting-group">
                            <h4>Datenverwaltung</h4>
                            <div class="data-actions">
                                <button class="btn btn-outline" onclick="this.exportAllData()">
                                    <i class="fas fa-download"></i> Alle Daten exportieren
                                </button>
                                <button class="btn btn-outline" onclick="this.exportProgressData()">
                                    <i class="fas fa-chart-line"></i> Fortschritt exportieren
                                </button>
                            </div>
                        </div>

                        <div class="setting-group danger-zone">
                            <h4>Gefahrenbereich</h4>
                            <div class="danger-actions">
                                <button class="btn btn-danger" onclick="this.deleteAccount()">
                                    <i class="fas fa-trash"></i> Account löschen
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Export Settings -->
                    <div id="exportSettings" class="settings-section">
                        <h3>Daten exportieren</h3>
                        
                        <div class="export-options">
                            <div class="export-option">
                                <h4>Fortschrittsbericht</h4>
                                <p>Exportiere deinen gesamten Fortschritt als PDF-Bericht</p>
                                <button class="btn btn-primary" onclick="this.exportProgressReport()">
                                    <i class="fas fa-file-pdf"></i> PDF-Bericht erstellen
                                </button>
                            </div>

                            <div class="export-option">
                                <h4>Excel-Datenblatt</h4>
                                <p>Exportiere alle Daten als Excel-Datei für weitere Analysen</p>
                                <button class="btn btn-primary" onclick="this.exportExcelData()">
                                    <i class="fas fa-file-excel"></i> Excel-Export
                                </button>
                            </div>

                            <div class="export-option">
                                <h4>JSON-Daten</h4>
                                <p>Exportiere alle Daten im JSON-Format für Backup-Zwecke</p>
                                <button class="btn btn-primary" onclick="this.exportJSONData()">
                                    <i class="fas fa-file-code"></i> JSON-Export
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="settings-actions">
                    <button type="button" class="btn btn-secondary" onclick="window.userProfile.closeModal()">Schließen</button>
                </div>
            </div>
        `;
    }

    getGoalEditorHTML(goalId = null) {
        const goal = goalId ? this.getGoalById(goalId) : null;
        
        return `
            <div class="goal-editor">
                <form id="goalForm" class="goal-form">
                    <div class="form-group">
                        <label for="goalTitle">Ziel-Titel *</label>
                        <input type="text" id="goalTitle" name="title" value="${goal ? goal.title : ''}" required>
                    </div>

                    <div class="form-group">
                        <label for="goalDescription">Beschreibung</label>
                        <textarea id="goalDescription" name="description" rows="3" placeholder="Beschreibe dein Ziel...">${goal ? goal.description : ''}</textarea>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="goalCategory">Kategorie</label>
                            <select id="goalCategory" name="category">
                                <option value="persönlich" ${goal && goal.category === 'persönlich' ? 'selected' : ''}>Persönlich</option>
                                <option value="beruflich" ${goal && goal.category === 'beruflich' ? 'selected' : ''}>Beruflich</option>
                                <option value="gesundheit" ${goal && goal.category === 'gesundheit' ? 'selected' : ''}>Gesundheit</option>
                                <option value="beziehungen" ${goal && goal.category === 'beziehungen' ? 'selected' : ''}>Beziehungen</option>
                                <option value="lernen" ${goal && goal.category === 'lernen' ? 'selected' : ''}>Lernen</option>
                                <option value="finanzen" ${goal && goal.category === 'finanzen' ? 'selected' : ''}>Finanzen</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label for="goalPriority">Priorität</label>
                            <select id="goalPriority" name="priority">
                                <option value="niedrig" ${goal && goal.priority === 'niedrig' ? 'selected' : ''}>Niedrig</option>
                                <option value="mittel" ${goal && goal.priority === 'mittel' ? 'selected' : ''}>Mittel</option>
                                <option value="hoch" ${goal && goal.priority === 'hoch' ? 'selected' : ''}>Hoch</option>
                            </select>
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="goalDueDate">Fälligkeitsdatum</label>
                            <input type="date" id="goalDueDate" name="dueDate" value="${goal ? goal.dueDate : ''}">
                        </div>

                        <div class="form-group">
                            <label for="goalProgress">Fortschritt (%)</label>
                            <input type="range" id="goalProgress" name="progress" min="0" max="100" value="${goal ? goal.progress || 0 : 0}">
                            <span class="progress-value">${goal ? goal.progress || 0 : 0}%</span>
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="goalMilestones">Meilensteine</label>
                        <div class="milestones-input">
                            <input type="text" id="milestoneInput" placeholder="Meilenstein hinzufügen...">
                            <button type="button" onclick="this.addMilestone()">Hinzufügen</button>
                        </div>
                        <div id="milestonesList" class="milestones-list">
                            ${this.renderMilestones(goal)}
                        </div>
                    </div>

                    <div class="form-actions">
                        <button type="button" class="btn btn-secondary" onclick="window.userProfile.closeModal()">Abbrechen</button>
                        <button type="submit" class="btn btn-primary">${goal ? 'Aktualisieren' : 'Erstellen'}</button>
                    </div>
                </form>
            </div>
        `;
    }

    setupProfileEditorEvents() {
        const form = document.getElementById('profileForm');
        if (form) {
            form.addEventListener('submit', (e) => this.saveProfile(e));
        }

        const progressSlider = document.getElementById('goalProgress');
        if (progressSlider) {
            progressSlider.addEventListener('input', (e) => {
                const valueSpan = document.querySelector('.progress-value');
                if (valueSpan) {
                    valueSpan.textContent = e.target.value + '%';
                }
            });
        }
    }

    setupSettingsPanelEvents() {
        // Settings tabs
        document.querySelectorAll('.settings-tab').forEach(tab => {
            tab.addEventListener('click', (e) => this.switchSettingsTab(e));
        });

        // Password change form
        const passwordForm = document.getElementById('passwordChangeForm');
        if (passwordForm) {
            passwordForm.addEventListener('submit', (e) => this.changePassword(e));
        }

        // Settings change handlers
        document.querySelectorAll('#generalSettings select, #notificationSettings input').forEach(input => {
            input.addEventListener('change', () => this.saveSettings());
        });
    }

    setupGoalEditorEvents(goalId) {
        const form = document.getElementById('goalForm');
        if (form) {
            form.addEventListener('submit', (e) => this.saveGoal(e, goalId));
        }
    }

    saveProfile(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        // Update user data
        this.currentUser.firstName = formData.get('firstName');
        this.currentUser.lastName = formData.get('lastName');
        this.currentUser.email = formData.get('email');
        this.currentUser.birthDate = formData.get('birthDate');
        this.currentUser.profile.bio = formData.get('bio');

        // Save to storage
        if (window.userAuth) {
            window.userAuth.updateUserInStorage();
            window.userAuth.saveUserToStorage(true);
        }

        this.showSuccess('Profil erfolgreich aktualisiert!');
        this.closeModal();
        this.updateUserInfo();
    }

    saveSettings() {
        const generalSettings = {
            theme: document.getElementById('themeSelect')?.value || 'light',
            language: document.getElementById('languageSelect')?.value || 'de',
            timezone: document.getElementById('timezoneSelect')?.value || 'Europe/Berlin'
        };

        const notificationSettings = {
            emailUpdates: document.getElementById('emailNotifications')?.checked || false,
            notifications: document.getElementById('progressReminders')?.checked || false,
            weeklyReports: document.getElementById('weeklyReports')?.checked || false,
            goalReminders: document.getElementById('goalReminders')?.checked || false
        };

        this.currentUser.settings = {
            ...this.currentUser.settings,
            ...generalSettings,
            ...notificationSettings
        };

        if (window.userAuth) {
            window.userAuth.updateUserInStorage();
            window.userAuth.saveUserToStorage(true);
        }

        this.showSuccess('Einstellungen gespeichert!');
    }

    changePassword(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const currentPassword = formData.get('currentPassword');
        const newPassword = formData.get('newPassword');
        const confirmPassword = formData.get('confirmNewPassword');

        // Validate current password
        if (this.currentUser.password !== window.userAuth.hashPassword(currentPassword)) {
            this.showError('Aktuelles Passwort ist falsch.');
            return;
        }

        if (newPassword !== confirmPassword) {
            this.showError('Neue Passwörter stimmen nicht überein.');
            return;
        }

        if (newPassword.length < 8) {
            this.showError('Neues Passwort muss mindestens 8 Zeichen lang sein.');
            return;
        }

        // Update password
        this.currentUser.password = window.userAuth.hashPassword(newPassword);

        if (window.userAuth) {
            window.userAuth.updateUserInStorage();
            window.userAuth.saveUserToStorage(true);
        }

        this.showSuccess('Passwort erfolgreich geändert!');
        e.target.reset();
    }

    saveGoal(e, goalId) {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        const goalData = {
            id: goalId || this.generateGoalId(),
            title: formData.get('title'),
            description: formData.get('description'),
            category: formData.get('category'),
            priority: formData.get('priority'),
            dueDate: formData.get('dueDate'),
            progress: parseInt(formData.get('progress')),
            milestones: this.getMilestonesFromForm(),
            createdAt: goalId ? this.getGoalById(goalId).createdAt : new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        if (goalId) {
            // Update existing goal
            const goalIndex = this.currentUser.profile.currentGoals.findIndex(g => g.id === goalId);
            if (goalIndex !== -1) {
                this.currentUser.profile.currentGoals[goalIndex] = goalData;
            }
        } else {
            // Add new goal
            if (!this.currentUser.profile.currentGoals) {
                this.currentUser.profile.currentGoals = [];
            }
            this.currentUser.profile.currentGoals.push(goalData);
        }

        if (window.userAuth) {
            window.userAuth.updateUserInStorage();
            window.userAuth.saveUserToStorage(true);
        }

        this.showSuccess(goalId ? 'Ziel aktualisiert!' : 'Ziel erstellt!');
        this.closeModal();
        
        // Refresh dashboard if visible
        if (window.userDashboard) {
            window.userDashboard.renderGoals();
        }
    }

    // Export functions
    exportAllData() {
        const data = {
            user: this.currentUser,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };

        this.downloadJSON(data, 'persoenlichkeitsentwicklung-alle-daten.json');
    }

    exportProgressData() {
        const progressData = {
            user: {
                name: `${this.currentUser.firstName} ${this.currentUser.lastName}`,
                email: this.currentUser.email
            },
            progress: this.currentUser.profile.progress,
            completedMethods: this.currentUser.profile.completedMethods,
            currentGoals: this.currentUser.profile.currentGoals,
            exportDate: new Date().toISOString()
        };

        this.downloadJSON(progressData, 'persoenlichkeitsentwicklung-fortschritt.json');
    }

    exportProgressReport() {
        // Generate PDF report (simplified version)
        const reportData = this.generateProgressReport();
        this.downloadHTML(reportData, 'fortschrittsbericht.html');
    }

    exportExcelData() {
        const excelData = this.generateExcelData();
        this.downloadCSV(excelData, 'persoenlichkeitsentwicklung-daten.csv');
    }

    exportJSONData() {
        this.exportAllData();
    }

    deleteAccount() {
        if (confirm('Bist du sicher, dass du deinen Account löschen möchtest? Diese Aktion kann nicht rückgängig gemacht werden.')) {
            if (confirm('Alle deine Daten werden unwiderruflich gelöscht. Bist du wirklich sicher?')) {
                // Delete user data
                const users = window.userAuth.getStoredUsers();
                const updatedUsers = users.filter(u => u.id !== this.currentUser.id);
                localStorage.setItem('personalityUsers', JSON.stringify(updatedUsers));
                
                // Clear current session
                localStorage.removeItem('currentPersonalityUser');
                sessionStorage.removeItem('currentPersonalityUser');
                
                // Logout and redirect
                window.userAuth.logout();
                this.showSuccess('Account erfolgreich gelöscht.');
            }
        }
    }

    // Helper methods
    getDefaultAvatar() {
        // Create a data URL for a simple avatar with user's initial
        const canvas = document.createElement('canvas');
        canvas.width = 100;
        canvas.height = 100;
        const ctx = canvas.getContext('2d');
        
        // Background circle
        ctx.fillStyle = '#6366f1';
        ctx.beginPath();
        ctx.arc(50, 50, 50, 0, 2 * Math.PI);
        ctx.fill();
        
        // Text
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 40px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.currentUser.firstName.charAt(0).toUpperCase(), 50, 50);
        
        return canvas.toDataURL();
    }

    renderInterests() {
        if (!this.currentUser.profile.interests) return '';
        
        return this.currentUser.profile.interests.map(interest => `
            <span class="interest-tag">
                ${interest}
                <button type="button" onclick="this.removeInterest('${interest}')">×</button>
            </span>
        `).join('');
    }

    renderMilestones(goal) {
        if (!goal || !goal.milestones) return '';
        
        return goal.milestones.map((milestone, index) => `
            <div class="milestone-item">
                <input type="checkbox" ${milestone.completed ? 'checked' : ''} onchange="this.toggleMilestone(${index})">
                <span class="${milestone.completed ? 'completed' : ''}">${milestone.text}</span>
                <button type="button" onclick="this.removeMilestone(${index})">×</button>
            </div>
        `).join('');
    }

    getGoalById(goalId) {
        return this.currentUser.profile.currentGoals?.find(g => g.id === goalId);
    }

    generateGoalId() {
        return 'goal_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    getMilestonesFromForm() {
        const milestoneElements = document.querySelectorAll('.milestone-item');
        return Array.from(milestoneElements).map((element, index) => ({
            text: element.querySelector('span').textContent,
            completed: element.querySelector('input').checked
        }));
    }

    generateProgressReport() {
        const completedMethods = this.currentUser.profile.completedMethods || [];
        const currentGoals = this.currentUser.profile.currentGoals || [];
        
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Fortschrittsbericht - ${this.currentUser.firstName} ${this.currentUser.lastName}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 40px; }
                    .header { text-align: center; margin-bottom: 40px; }
                    .section { margin-bottom: 30px; }
                    .method-item { padding: 10px; border-left: 3px solid #6366f1; margin-bottom: 10px; }
                    .goal-item { padding: 10px; background: #f8fafc; margin-bottom: 10px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>Fortschrittsbericht</h1>
                    <h2>${this.currentUser.firstName} ${this.currentUser.lastName}</h2>
                    <p>Erstellt am: ${new Date().toLocaleDateString('de-DE')}</p>
                </div>
                
                <div class="section">
                    <h3>Abgeschlossene Methoden (${completedMethods.length})</h3>
                    ${completedMethods.map(method => `
                        <div class="method-item">
                            <strong>${method.title}</strong><br>
                            Abgeschlossen am: ${new Date(method.completedAt).toLocaleDateString('de-DE')}
                        </div>
                    `).join('')}
                </div>
                
                <div class="section">
                    <h3>Aktuelle Ziele (${currentGoals.length})</h3>
                    ${currentGoals.map(goal => `
                        <div class="goal-item">
                            <strong>${goal.title}</strong> (${goal.progress}%)<br>
                            ${goal.description}<br>
                            Kategorie: ${goal.category} | Priorität: ${goal.priority}
                        </div>
                    `).join('')}
                </div>
            </body>
            </html>
        `;
    }

    generateExcelData() {
        const headers = ['Methode', 'Status', 'Fortschritt', 'Abgeschlossen am', 'Kategorie'];
        const rows = [];
        
        // Add completed methods
        (this.currentUser.profile.completedMethods || []).forEach(method => {
            rows.push([method.title, 'Abgeschlossen', '100%', new Date(method.completedAt).toLocaleDateString('de-DE'), 'Persönlichkeitsentwicklung']);
        });
        
        // Add in-progress methods
        const allMethods = window.userDashboard ? window.userDashboard.getAllMethods() : [];
        allMethods.forEach(method => {
            const progress = this.currentUser.profile.progress[method.id];
            if (progress && Object.keys(progress).length > 0 && !this.isMethodCompleted(method.id)) {
                const progressPercentage = Math.round((Object.keys(progress).length / 7) * 100);
                rows.push([method.title, 'In Bearbeitung', `${progressPercentage}%`, '', 'Persönlichkeitsentwicklung']);
            }
        });
        
        return [headers, ...rows];
    }

    isMethodCompleted(methodId) {
        return this.currentUser.profile.completedMethods?.some(method => method.methodId === methodId);
    }

    // Utility methods
    createModal(title, content) {
        const modal = document.createElement('div');
        modal.className = 'profile-modal';
        modal.innerHTML = `
            <div class="profile-modal-content">
                <div class="profile-modal-header">
                    <h2>${title}</h2>
                    <button class="profile-modal-close" onclick="window.userProfile.closeModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="profile-modal-body">
                    ${content}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';
        
        // Store reference for closing
        this.currentModal = modal;
        
        // Add click outside to close
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal();
            }
        });
        
        // Add escape key to close
        const escapeHandler = (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
                document.removeEventListener('keydown', escapeHandler);
            }
        };
        document.addEventListener('keydown', escapeHandler);
    }

    closeModal() {
        if (this.currentModal) {
            this.currentModal.remove();
            this.currentModal = null;
            document.body.style.overflow = 'auto';
        }
    }

    switchSettingsTab(e) {
        const tabName = e.target.getAttribute('data-tab');
        
        // Update active tab
        document.querySelectorAll('.settings-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        e.target.classList.add('active');
        
        // Show corresponding section
        document.querySelectorAll('.settings-section').forEach(section => {
            section.classList.remove('active');
        });
        
        const targetSection = document.getElementById(tabName + 'Settings');
        if (targetSection) {
            targetSection.classList.add('active');
        }
    }

    downloadJSON(data, filename) {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        this.downloadBlob(blob, filename);
    }

    downloadHTML(html, filename) {
        const blob = new Blob([html], { type: 'text/html' });
        this.downloadBlob(blob, filename);
    }

    downloadCSV(data, filename) {
        const csv = data.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        this.downloadBlob(blob, filename);
    }

    downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    updateUserInfo() {
        if (window.userAuth) {
            window.userAuth.updateUserInfo();
        }
    }

    showSuccess(message) {
        if (window.userAuth) {
            window.userAuth.showSuccess(message);
        }
    }

    showError(message) {
        if (window.userAuth) {
            window.userAuth.showError(message);
        }
    }
    
    // Avatar management
    changeAvatar() {
        const input = document.getElementById('avatarInput');
        if (input) {
            input.click();
        }
    }
    
    handleAvatarChange(event) {
        const file = event.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                this.showError('Bitte wähle eine gültige Bilddatei aus.');
                return;
            }
            
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                this.showError('Die Bilddatei ist zu groß. Maximal 5MB erlaubt.');
                return;
            }
            
            const reader = new FileReader();
            reader.onload = (e) => {
                const preview = document.getElementById('avatarPreview');
                if (preview) {
                    preview.src = e.target.result;
                }
                
                // Save to user profile
                this.currentUser.profile.avatar = e.target.result;
                
                // Save to storage
                if (window.userAuth) {
                    window.userAuth.updateUserInStorage();
                    window.userAuth.saveUserToStorage(true);
                }
                
                this.showSuccess('Profilbild erfolgreich aktualisiert!');
            };
            reader.readAsDataURL(file);
        }
    }
    
    removeAvatar() {
        if (confirm('Möchtest du dein Profilbild wirklich entfernen?')) {
            this.currentUser.profile.avatar = null;
            
            const preview = document.getElementById('avatarPreview');
            if (preview) {
                preview.src = this.getDefaultAvatar();
            }
            
            // Save to storage
            if (window.userAuth) {
                window.userAuth.updateUserInStorage();
                window.userAuth.saveUserToStorage(true);
            }
            
            this.showSuccess('Profilbild entfernt!');
        }
    }
    
    // Email change functionality
    showEmailChangeModal() {
        const modalContent = `
            <div class="email-change-modal">
                <div class="email-change-info">
                    <h3>E-Mail-Adresse ändern</h3>
                    <p>Um deine E-Mail-Adresse zu ändern, musst du dein aktuelles Passwort bestätigen und die neue E-Mail-Adresse bestätigen.</p>
                </div>
                
                <form id="emailChangeForm" class="email-change-form">
                    <div class="form-group">
                        <label for="currentPasswordEmail">Aktuelles Passwort</label>
                        <input type="password" id="currentPasswordEmail" name="currentPassword" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="newEmail">Neue E-Mail-Adresse</label>
                        <input type="email" id="newEmail" name="newEmail" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="confirmNewEmail">E-Mail-Adresse bestätigen</label>
                        <input type="email" id="confirmNewEmail" name="confirmNewEmail" required>
                    </div>
                    
                    <div class="form-actions">
                        <button type="button" class="btn btn-secondary" onclick="window.userProfile.closeModal()">Abbrechen</button>
                        <button type="submit" class="btn btn-primary">E-Mail ändern</button>
                    </div>
                </form>
            </div>
        `;
        
        this.createModal('E-Mail-Adresse ändern', modalContent);
        this.setupEmailChangeEvents();
    }
    
    setupEmailChangeEvents() {
        const form = document.getElementById('emailChangeForm');
        if (form) {
            form.addEventListener('submit', (e) => this.handleEmailChange(e));
        }
    }
    
    handleEmailChange(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const currentPassword = formData.get('currentPassword');
        const newEmail = formData.get('newEmail');
        const confirmNewEmail = formData.get('confirmNewEmail');
        
        // Validate current password
        if (this.currentUser.password !== window.userAuth.hashPassword(currentPassword)) {
            this.showError('Aktuelles Passwort ist falsch.');
            return;
        }
        
        // Validate email match
        if (newEmail !== confirmNewEmail) {
            this.showError('Die E-Mail-Adressen stimmen nicht überein.');
            return;
        }
        
        // Check if email is different
        if (newEmail === this.currentUser.email) {
            this.showError('Die neue E-Mail-Adresse ist identisch mit der aktuellen.');
            return;
        }
        
        // Check if email already exists
        const users = window.userAuth.getStoredUsers();
        if (users.find(u => u.email === newEmail && u.id !== this.currentUser.id)) {
            this.showError('Diese E-Mail-Adresse wird bereits verwendet.');
            return;
        }
        
        // Send verification email (simulate)
        this.sendEmailVerification(newEmail);
        
        // Update user data
        this.currentUser.email = newEmail;
        this.currentUser.emailVerified = false;
        this.currentUser.emailVerificationToken = this.generateVerificationToken();
        this.currentUser.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours
        
        // Save to storage
        if (window.userAuth) {
            window.userAuth.updateUserInStorage();
            window.userAuth.saveUserToStorage(true);
        }
        
        this.closeModal();
        this.showSuccess('E-Mail-Adresse geändert! Bitte bestätige deine neue E-Mail-Adresse.');
        
        // Refresh profile editor
        setTimeout(() => {
            this.showProfileEditor();
        }, 1000);
    }
    
    sendEmailVerification(email) {
        // In a real application, this would send an actual email
        // For demo purposes, we'll simulate it
        console.log(`Verification email sent to: ${email}`);
        console.log(`Verification token: ${this.currentUser.emailVerificationToken}`);
        
        // Show a demo notification
        setTimeout(() => {
            this.showSuccess(`Demo: Bestätigungs-E-Mail an ${email} gesendet!`);
        }, 2000);
    }
    
    generateVerificationToken() {
        return 'verify_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    // Email verification
    verifyEmail(token) {
        if (this.currentUser.emailVerificationToken === token) {
            const now = new Date();
            const expires = new Date(this.currentUser.emailVerificationExpires);
            
            if (now < expires) {
                this.currentUser.emailVerified = true;
                this.currentUser.emailVerificationToken = null;
                this.currentUser.emailVerificationExpires = null;
                
                // Save to storage
                if (window.userAuth) {
                    window.userAuth.updateUserInStorage();
                    window.userAuth.saveUserToStorage(true);
                }
                
                this.showSuccess('E-Mail-Adresse erfolgreich bestätigt!');
                return true;
            } else {
                this.showError('Der Bestätigungslink ist abgelaufen. Bitte fordere einen neuen an.');
                return false;
            }
        } else {
            this.showError('Ungültiger Bestätigungslink.');
            return false;
        }
    }
    
    resendVerificationEmail() {
        if (this.currentUser.emailVerified) {
            this.showError('E-Mail-Adresse ist bereits bestätigt.');
            return;
        }
        
        this.sendEmailVerification(this.currentUser.email);
        this.showSuccess('Bestätigungs-E-Mail erneut gesendet!');
    }
    
    // Interest management
    addInterest() {
        const input = document.getElementById('interestsInput');
        const interest = input.value.trim();
        
        if (interest) {
            if (!this.currentUser.profile.interests) {
                this.currentUser.profile.interests = [];
            }
            
            if (!this.currentUser.profile.interests.includes(interest)) {
                this.currentUser.profile.interests.push(interest);
                
                // Save to storage
                if (window.userAuth) {
                    window.userAuth.updateUserInStorage();
                    window.userAuth.saveUserToStorage(true);
                }
                
                // Update display
                this.updateInterestsDisplay();
                input.value = '';
            } else {
                this.showError('Dieses Interesse existiert bereits.');
            }
        }
    }
    
    removeInterest(interest) {
        if (this.currentUser.profile.interests) {
            this.currentUser.profile.interests = this.currentUser.profile.interests.filter(i => i !== interest);
            
            // Save to storage
            if (window.userAuth) {
                window.userAuth.updateUserInStorage();
                window.userAuth.saveUserToStorage(true);
            }
            
            // Update display
            this.updateInterestsDisplay();
        }
    }
    
    updateInterestsDisplay() {
        const interestsList = document.getElementById('interestsList');
        if (interestsList) {
            interestsList.innerHTML = this.renderInterests();
        }
    }
}

// Initialize profile management when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.userProfile = new UserProfile();
});

// Global functions for HTML onclick handlers
function showProfile() {
    if (window.userProfile) {
        window.userProfile.showProfileEditor();
    }
}

function showSettings() {
    if (window.userProfile) {
        window.userProfile.showSettingsPanel();
    }
}

function addGoal() {
    if (window.userProfile) {
        window.userProfile.showGoalEditor();
    }
}

function editGoal(goalId) {
    if (window.userProfile) {
        window.userProfile.showGoalEditor(goalId);
    }
}

function deleteGoal(goalId) {
    if (window.userProfile && window.userAuth) {
        if (confirm('Möchtest du dieses Ziel wirklich löschen?')) {
            const goals = window.userAuth.getCurrentUser().profile.currentGoals || [];
            window.userAuth.getCurrentUser().profile.currentGoals = goals.filter(goal => goal.id !== goalId);
            window.userAuth.updateUserInStorage();
            window.userAuth.saveUserToStorage(true);
            
            if (window.userDashboard) {
                window.userDashboard.renderGoals();
            }
            
            window.userProfile.showSuccess('Ziel gelöscht!');
        }
    }
}
