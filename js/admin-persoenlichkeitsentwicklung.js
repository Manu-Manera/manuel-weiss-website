// Admin Panel JavaScript
class AdminPanel {
    constructor() {
        this.currentTab = 'methods';
        this.currentMethod = null;
        this.currentUser = null;
        this.methods = [];
        this.users = [];
        this.analytics = {};
        this.charts = {};
        
        this.init();
    }

    init() {
        this.loadData();
        this.setupEventListeners();
        this.loadMethods();
        this.loadUsers();
        this.loadAnalytics();
        this.initializeCharts();
    }

    setupEventListeners() {
        // Auto-save functionality
        setInterval(() => {
            this.autoSave();
        }, 30000); // Auto-save every 30 seconds

        // Dropdown functionality
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.nav-dropdown')) {
                this.closeAllDropdowns();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 's':
                        e.preventDefault();
                        this.saveAllChanges();
                        break;
                    case 'z':
                        e.preventDefault();
                        this.undo();
                        break;
                }
            }
        });
    }

    // Tab Management
    switchTab(tabName) {
        // Hide all tab contents
        document.querySelectorAll('.admin-tab-content').forEach(tab => {
            tab.classList.remove('active');
        });

        // Remove active class from all nav tabs
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
        });

        // Show selected tab content
        document.getElementById(`${tabName}-tab`).classList.add('active');
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        this.currentTab = tabName;

        // Load tab-specific data
        switch(tabName) {
            case 'methods':
                this.loadMethods();
                break;
            case 'content':
                this.loadMethodContent();
                break;
            case 'questions':
                this.loadQuestions();
                break;
            case 'workflows':
                this.loadWorkflows();
                break;
            case 'users':
                this.loadUsers();
                break;
            case 'analytics':
                this.loadAnalytics();
                this.updateCharts();
                break;
        }
    }

    // Data Management
    loadData() {
        // Load from localStorage or API
        const savedMethods = localStorage.getItem('admin-methods');
        if (savedMethods) {
            this.methods = JSON.parse(savedMethods);
        } else {
            this.methods = this.getDefaultMethods();
        }

        const savedUsers = localStorage.getItem('admin-users');
        if (savedUsers) {
            this.users = JSON.parse(savedUsers);
        } else {
            this.users = this.getDefaultUsers();
        }

        const savedAnalytics = localStorage.getItem('admin-analytics');
        if (savedAnalytics) {
            this.analytics = JSON.parse(savedAnalytics);
        } else {
            this.analytics = this.getDefaultAnalytics();
        }
    }

    saveData() {
        localStorage.setItem('admin-methods', JSON.stringify(this.methods));
        localStorage.setItem('admin-users', JSON.stringify(this.users));
        localStorage.setItem('admin-analytics', JSON.stringify(this.analytics));
    }

    autoSave() {
        this.saveData();
        this.showMessage('Automatisch gespeichert', 'success');
    }

    // Methods Management
    getDefaultMethods() {
        return [
            {
                id: 'ikigai',
                title: 'Ikigai - Sinn des Lebens',
                description: 'Finde deinen Sinn des Lebens durch die Verbindung von Leidenschaft, Mission, Berufung und Beruf.',
                icon: 'fas fa-heart',
                tags: ['Selbstreflexion', 'Lebenssinn', '4 Bereiche'],
                steps: 4,
                duration: 45,
                difficulty: 'intermediate',
                active: true,
                featured: true,
                order: 1,
                content: {
                    mainTitle: 'Ikigai - Finde deinen Sinn des Lebens',
                    subtitle: 'Entdecke deine Leidenschaft, Mission, Berufung und Beruf',
                    description: 'Das japanische Konzept Ikigai hilft dir dabei, deinen persönlichen Sinn des Lebens zu finden.',
                    workflowSteps: [
                        {
                            step: 1,
                            title: 'Was du liebst',
                            description: 'Identifiziere deine Leidenschaften und Interessen.',
                            questions: [
                                'Was macht dir wirklich Spaß?',
                                'Wofür brennst du?',
                                'Was würdest du tun, auch wenn du nicht dafür bezahlt würdest?'
                            ]
                        },
                        {
                            step: 2,
                            title: 'Was die Welt braucht',
                            description: 'Erkenne, wie du einen Beitrag zur Gesellschaft leisten kannst.',
                            questions: [
                                'Welche Probleme in der Welt beschäftigen dich?',
                                'Wie möchtest du die Welt verbessern?',
                                'Welchen Beitrag kannst du leisten?'
                            ]
                        },
                        {
                            step: 3,
                            title: 'Wofür du bezahlt werden kannst',
                            description: 'Finde heraus, welche Fähigkeiten du monetarisieren kannst.',
                            questions: [
                                'Welche Fähigkeiten hast du?',
                                'Wofür würden andere dich bezahlen?',
                                'Welche Dienstleistungen kannst du anbieten?'
                            ]
                        },
                        {
                            step: 4,
                            title: 'Was du gut kannst',
                            description: 'Identifiziere deine Stärken und Talente.',
                            questions: [
                                'Was kannst du besonders gut?',
                                'Wofür wirst du oft gelobt?',
                                'Welche Fähigkeiten hast du entwickelt?'
                            ]
                        }
                    ],
                    reflectionQuestions: [
                        'Wie fühlst du dich nach der Ikigai-Analyse?',
                        'Welche Überraschungen gab es für dich?',
                        'Wie kannst du dein Ikigai in dein Leben integrieren?'
                    ]
                }
            },
            {
                id: 'values-clarification',
                title: 'Werteklärung',
                description: 'Identifiziere deine wichtigsten Werte und lebe authentisch danach.',
                icon: 'fas fa-gem',
                tags: ['Werte', 'Authentizität', 'Selbstreflexion'],
                steps: 5,
                duration: 30,
                difficulty: 'beginner',
                active: true,
                featured: false,
                order: 2,
                content: {
                    mainTitle: 'Werteklärung - Lebe authentisch',
                    subtitle: 'Entdecke deine wichtigsten Werte',
                    description: 'Werte sind die Grundlage für authentische Entscheidungen und ein erfülltes Leben.',
                    workflowSteps: [
                        {
                            step: 1,
                            title: 'Werte-Identifikation',
                            description: 'Identifiziere deine wichtigsten Werte.',
                            questions: [
                                'Welche Werte sind dir wichtig?',
                                'Wofür stehst du ein?',
                                'Was ist dir im Leben wichtig?'
                            ]
                        }
                    ],
                    reflectionQuestions: [
                        'Wie gut lebst du deine Werte?',
                        'Wo gibt es Konflikte zwischen deinen Werten?'
                    ]
                }
            }
            // Add more default methods here...
        ];
    }

    loadMethods() {
        const methodsGrid = document.getElementById('methods-grid');
        if (!methodsGrid) return;

        methodsGrid.innerHTML = '';

        this.methods.forEach(method => {
            const methodElement = this.createMethodElement(method);
            methodsGrid.appendChild(methodElement);
        });
    }

    createMethodElement(method) {
        const div = document.createElement('div');
        div.className = 'method-item';
        div.onclick = () => this.selectMethod(method);

        div.innerHTML = `
            <div class="method-icon">
                <i class="${method.icon}"></i>
            </div>
            <div class="method-info">
                <h4>${method.title}</h4>
                <p>${method.description}</p>
            </div>
            <div class="method-status">
                <span class="status-badge ${method.active ? 'active' : 'inactive'}">
                    ${method.active ? 'Aktiv' : 'Inaktiv'}
                </span>
                <span class="method-order">#${method.order}</span>
            </div>
        `;

        return div;
    }

    selectMethod(method) {
        this.currentMethod = method;
        
        // Update UI
        document.querySelectorAll('.method-item').forEach(item => {
            item.classList.remove('active');
        });
        event.currentTarget.classList.add('active');

        // Show method editor
        this.showMethodEditor(method);
    }

    showMethodEditor(method) {
        const editor = document.getElementById('method-editor');
        editor.style.display = 'block';

        // Populate form fields
        document.getElementById('method-id').value = method.id;
        document.getElementById('method-title').value = method.title;
        document.getElementById('method-description').value = method.description;
        document.getElementById('method-icon').value = method.icon;
        document.getElementById('method-tags').value = method.tags.join(', ');
        document.getElementById('method-steps').value = method.steps;
        document.getElementById('method-duration').value = method.duration;
        document.getElementById('method-difficulty').value = method.difficulty;
        document.getElementById('method-active').checked = method.active;
        document.getElementById('method-featured').checked = method.featured;
        document.getElementById('method-order').value = method.order;
    }

    closeMethodEditor() {
        document.getElementById('method-editor').style.display = 'none';
        this.currentMethod = null;
        
        document.querySelectorAll('.method-item').forEach(item => {
            item.classList.remove('active');
        });
    }

    saveMethod() {
        if (!this.currentMethod) return;

        const method = this.currentMethod;
        
        // Update method data
        method.title = document.getElementById('method-title').value;
        method.description = document.getElementById('method-description').value;
        method.icon = document.getElementById('method-icon').value;
        method.tags = document.getElementById('method-tags').value.split(',').map(tag => tag.trim());
        method.steps = parseInt(document.getElementById('method-steps').value);
        method.duration = parseInt(document.getElementById('method-duration').value);
        method.difficulty = document.getElementById('method-difficulty').value;
        method.active = document.getElementById('method-active').checked;
        method.featured = document.getElementById('method-featured').checked;
        method.order = parseInt(document.getElementById('method-order').value);

        // Update in methods array
        const index = this.methods.findIndex(m => m.id === method.id);
        if (index !== -1) {
            this.methods[index] = method;
        }

        this.saveData();
        this.loadMethods();
        this.showMessage('Methode erfolgreich gespeichert', 'success');
    }

    deleteMethod() {
        if (!this.currentMethod) return;

        if (confirm('Möchtest du diese Methode wirklich löschen?')) {
            const index = this.methods.findIndex(m => m.id === this.currentMethod.id);
            if (index !== -1) {
                this.methods.splice(index, 1);
                this.saveData();
                this.loadMethods();
                this.closeMethodEditor();
                this.showMessage('Methode erfolgreich gelöscht', 'success');
            }
        }
    }

    addNewMethod() {
        const newMethod = {
            id: 'new-method-' + Date.now(),
            title: 'Neue Methode',
            description: 'Beschreibung der neuen Methode',
            icon: 'fas fa-star',
            tags: ['Neu'],
            steps: 3,
            duration: 30,
            difficulty: 'beginner',
            active: true,
            featured: false,
            order: this.methods.length + 1,
            content: {
                mainTitle: 'Neue Methode',
                subtitle: 'Untertitel',
                description: 'Beschreibung',
                workflowSteps: [],
                reflectionQuestions: []
            }
        };

        this.methods.push(newMethod);
        this.saveData();
        this.loadMethods();
        this.selectMethod(newMethod);
        this.showMessage('Neue Methode erstellt', 'success');
    }

    // Content Management
    loadMethodContent() {
        const methodSelect = document.getElementById('content-method-select');
        if (!methodSelect) return;

        methodSelect.innerHTML = '<option value="">Methode auswählen...</option>';
        
        this.methods.forEach(method => {
            const option = document.createElement('option');
            option.value = method.id;
            option.textContent = method.title;
            methodSelect.appendChild(option);
        });
    }

    loadMethodContent() {
        const methodId = document.getElementById('content-method-select').value;
        if (!methodId) {
            document.getElementById('content-editor').style.display = 'none';
            return;
        }

        const method = this.methods.find(m => m.id === methodId);
        if (!method) return;

        const editor = document.getElementById('content-editor');
        editor.style.display = 'block';

        // Populate content fields
        document.getElementById('content-main-title').value = method.content.mainTitle || '';
        document.getElementById('content-subtitle').value = method.content.subtitle || '';
        document.getElementById('content-description').value = method.content.description || '';

        // Load workflow steps
        this.loadWorkflowSteps(method.content.workflowSteps || []);
        
        // Load reflection questions
        this.loadReflectionQuestions(method.content.reflectionQuestions || []);
    }

    loadWorkflowSteps(steps) {
        const container = document.getElementById('workflow-steps-editor');
        container.innerHTML = '';

        steps.forEach((step, index) => {
            const stepElement = this.createWorkflowStepElement(step, index);
            container.appendChild(stepElement);
        });
    }

    createWorkflowStepElement(step, index) {
        const div = document.createElement('div');
        div.className = 'workflow-step-editor';
        div.innerHTML = `
            <div class="step-header">
                <h5>Schritt ${step.step}: ${step.title}</h5>
                <div class="step-actions">
                    <button class="btn btn-sm btn-outline" onclick="adminPanel.moveStepUp(${index})">
                        <i class="fas fa-arrow-up"></i>
                    </button>
                    <button class="btn btn-sm btn-outline" onclick="adminPanel.moveStepDown(${index})">
                        <i class="fas fa-arrow-down"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="adminPanel.removeWorkflowStep(${index})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="form-group">
                <label>Schritt-Nummer:</label>
                <input type="number" class="form-input" value="${step.step}" onchange="adminPanel.updateStepNumber(${index}, this.value)">
            </div>
            <div class="form-group">
                <label>Titel:</label>
                <input type="text" class="form-input" value="${step.title}" onchange="adminPanel.updateStepTitle(${index}, this.value)">
            </div>
            <div class="form-group">
                <label>Beschreibung:</label>
                <textarea class="form-textarea" onchange="adminPanel.updateStepDescription(${index}, this.value)">${step.description || ''}</textarea>
            </div>
            <div class="form-group">
                <label>Fragen (eine pro Zeile):</label>
                <textarea class="form-textarea" onchange="adminPanel.updateStepQuestions(${index}, this.value)">${(step.questions || []).join('\n')}</textarea>
            </div>
        `;
        return div;
    }

    loadReflectionQuestions(questions) {
        const container = document.getElementById('reflection-questions-editor');
        container.innerHTML = '';

        questions.forEach((question, index) => {
            const questionElement = this.createReflectionQuestionElement(question, index);
            container.appendChild(questionElement);
        });
    }

    createReflectionQuestionElement(question, index) {
        const div = document.createElement('div');
        div.className = 'reflection-question-editor';
        div.innerHTML = `
            <div class="question-header">
                <h5>Frage ${index + 1}</h5>
                <div class="question-actions">
                    <button class="btn btn-sm btn-outline" onclick="adminPanel.moveQuestionUp(${index})">
                        <i class="fas fa-arrow-up"></i>
                    </button>
                    <button class="btn btn-sm btn-outline" onclick="adminPanel.moveQuestionDown(${index})">
                        <i class="fas fa-arrow-down"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="adminPanel.removeReflectionQuestion(${index})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="form-group">
                <label>Frage:</label>
                <textarea class="form-textarea" onchange="adminPanel.updateReflectionQuestion(${index}, this.value)">${question}</textarea>
            </div>
        `;
        return div;
    }

    // Workflow Step Management
    updateStepNumber(index, value) {
        const methodId = document.getElementById('content-method-select').value;
        const method = this.methods.find(m => m.id === methodId);
        if (method && method.content.workflowSteps[index]) {
            method.content.workflowSteps[index].step = parseInt(value);
        }
    }

    updateStepTitle(index, value) {
        const methodId = document.getElementById('content-method-select').value;
        const method = this.methods.find(m => m.id === methodId);
        if (method && method.content.workflowSteps[index]) {
            method.content.workflowSteps[index].title = value;
        }
    }

    updateStepDescription(index, value) {
        const methodId = document.getElementById('content-method-select').value;
        const method = this.methods.find(m => m.id === methodId);
        if (method && method.content.workflowSteps[index]) {
            method.content.workflowSteps[index].description = value;
        }
    }

    updateStepQuestions(index, value) {
        const methodId = document.getElementById('content-method-select').value;
        const method = this.methods.find(m => m.id === methodId);
        if (method && method.content.workflowSteps[index]) {
            method.content.workflowSteps[index].questions = value.split('\n').filter(q => q.trim());
        }
    }

    addWorkflowStep() {
        const methodId = document.getElementById('content-method-select').value;
        const method = this.methods.find(m => m.id === methodId);
        if (!method) return;

        if (!method.content.workflowSteps) {
            method.content.workflowSteps = [];
        }

        const newStep = {
            step: method.content.workflowSteps.length + 1,
            title: 'Neuer Schritt',
            description: '',
            questions: []
        };

        method.content.workflowSteps.push(newStep);
        this.loadWorkflowSteps(method.content.workflowSteps);
    }

    removeWorkflowStep(index) {
        const methodId = document.getElementById('content-method-select').value;
        const method = this.methods.find(m => m.id === methodId);
        if (method && method.content.workflowSteps) {
            method.content.workflowSteps.splice(index, 1);
            this.loadWorkflowSteps(method.content.workflowSteps);
        }
    }

    moveStepUp(index) {
        const methodId = document.getElementById('content-method-select').value;
        const method = this.methods.find(m => m.id === methodId);
        if (method && method.content.workflowSteps && index > 0) {
            const steps = method.content.workflowSteps;
            [steps[index], steps[index - 1]] = [steps[index - 1], steps[index]];
            this.loadWorkflowSteps(steps);
        }
    }

    moveStepDown(index) {
        const methodId = document.getElementById('content-method-select').value;
        const method = this.methods.find(m => m.id === methodId);
        if (method && method.content.workflowSteps && index < method.content.workflowSteps.length - 1) {
            const steps = method.content.workflowSteps;
            [steps[index], steps[index + 1]] = [steps[index + 1], steps[index]];
            this.loadWorkflowSteps(steps);
        }
    }

    // Reflection Questions Management
    updateReflectionQuestion(index, value) {
        const methodId = document.getElementById('content-method-select').value;
        const method = this.methods.find(m => m.id === methodId);
        if (method && method.content.reflectionQuestions) {
            method.content.reflectionQuestions[index] = value;
        }
    }

    addReflectionQuestion() {
        const methodId = document.getElementById('content-method-select').value;
        const method = this.methods.find(m => m.id === methodId);
        if (!method) return;

        if (!method.content.reflectionQuestions) {
            method.content.reflectionQuestions = [];
        }

        method.content.reflectionQuestions.push('Neue Reflexionsfrage');
        this.loadReflectionQuestions(method.content.reflectionQuestions);
    }

    removeReflectionQuestion(index) {
        const methodId = document.getElementById('content-method-select').value;
        const method = this.methods.find(m => m.id === methodId);
        if (method && method.content.reflectionQuestions) {
            method.content.reflectionQuestions.splice(index, 1);
            this.loadReflectionQuestions(method.content.reflectionQuestions);
        }
    }

    moveQuestionUp(index) {
        const methodId = document.getElementById('content-method-select').value;
        const method = this.methods.find(m => m.id === methodId);
        if (method && method.content.reflectionQuestions && index > 0) {
            const questions = method.content.reflectionQuestions;
            [questions[index], questions[index - 1]] = [questions[index - 1], questions[index]];
            this.loadReflectionQuestions(questions);
        }
    }

    moveQuestionDown(index) {
        const methodId = document.getElementById('content-method-select').value;
        const method = this.methods.find(m => m.id === methodId);
        if (method && method.content.reflectionQuestions && index < method.content.reflectionQuestions.length - 1) {
            const questions = method.content.reflectionQuestions;
            [questions[index], questions[index + 1]] = [questions[index + 1], questions[index]];
            this.loadReflectionQuestions(questions);
        }
    }

    saveMethodContent() {
        const methodId = document.getElementById('content-method-select').value;
        const method = this.methods.find(m => m.id === methodId);
        if (!method) return;

        // Update content
        method.content.mainTitle = document.getElementById('content-main-title').value;
        method.content.subtitle = document.getElementById('content-subtitle').value;
        method.content.description = document.getElementById('content-description').value;

        this.saveData();
        this.showMessage('Inhalte erfolgreich gespeichert', 'success');
    }

    previewMethod() {
        const methodId = document.getElementById('content-method-select').value;
        if (methodId) {
            window.open(`persoenlichkeitsentwicklung-uebersicht.html?method=${methodId}`, '_blank');
        }
    }

    // Users Management
    getDefaultUsers() {
        return [
            {
                id: 'admin',
                username: 'admin',
                email: 'admin@example.com',
                role: 'admin',
                active: true,
                lastLogin: new Date().toISOString()
            }
        ];
    }

    loadUsers() {
        const usersTableBody = document.getElementById('users-table-body');
        if (!usersTableBody) return;

        usersTableBody.innerHTML = '';

        this.users.forEach(user => {
            const row = this.createUserRow(user);
            usersTableBody.appendChild(row);
        });
    }

    createUserRow(user) {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${user.username}</td>
            <td>${user.email}</td>
            <td><span class="status-badge ${user.role}">${user.role}</span></td>
            <td>${new Date(user.lastLogin).toLocaleDateString()}</td>
            <td><span class="status-badge ${user.active ? 'active' : 'inactive'}">${user.active ? 'Aktiv' : 'Inaktiv'}</span></td>
            <td>
                <button class="btn btn-sm btn-outline" onclick="adminPanel.editUser('${user.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="adminPanel.deleteUser('${user.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        return tr;
    }

    editUser(userId) {
        const user = this.users.find(u => u.id === userId);
        if (!user) return;

        this.currentUser = user;
        this.showUserEditor(user);
    }

    showUserEditor(user) {
        const editor = document.getElementById('user-editor');
        editor.style.display = 'block';

        document.getElementById('user-username').value = user.username;
        document.getElementById('user-email').value = user.email;
        document.getElementById('user-role').value = user.role;
        document.getElementById('user-active').checked = user.active;
    }

    closeUserEditor() {
        document.getElementById('user-editor').style.display = 'none';
        this.currentUser = null;
    }

    saveUser() {
        if (!this.currentUser) return;

        const user = this.currentUser;
        user.username = document.getElementById('user-username').value;
        user.email = document.getElementById('user-email').value;
        user.role = document.getElementById('user-role').value;
        user.active = document.getElementById('user-active').checked;

        const index = this.users.findIndex(u => u.id === user.id);
        if (index !== -1) {
            this.users[index] = user;
        }

        this.saveData();
        this.loadUsers();
        this.closeUserEditor();
        this.showMessage('Benutzer erfolgreich gespeichert', 'success');
    }

    deleteUser(userId) {
        if (confirm('Möchtest du diesen Benutzer wirklich löschen?')) {
            const index = this.users.findIndex(u => u.id === userId);
            if (index !== -1) {
                this.users.splice(index, 1);
                this.saveData();
                this.loadUsers();
                this.showMessage('Benutzer erfolgreich gelöscht', 'success');
            }
        }
    }

    addUser() {
        const newUser = {
            id: 'user-' + Date.now(),
            username: 'neuer_benutzer',
            email: 'user@example.com',
            role: 'viewer',
            active: true,
            lastLogin: new Date().toISOString()
        };

        this.users.push(newUser);
        this.saveData();
        this.loadUsers();
        this.editUser(newUser.id);
        this.showMessage('Neuer Benutzer erstellt', 'success');
    }

    // Analytics
    getDefaultAnalytics() {
        return {
            totalUsers: 0,
            totalSessions: 0,
            avgDuration: 0,
            completionRate: 0,
            methodUsage: {},
            dailyUsage: []
        };
    }

    loadAnalytics() {
        // Update analytics cards
        document.getElementById('total-users').textContent = this.analytics.totalUsers || 0;
        document.getElementById('total-sessions').textContent = this.analytics.totalSessions || 0;
        document.getElementById('avg-duration').textContent = `${this.analytics.avgDuration || 0} min`;
        document.getElementById('completion-rate').textContent = `${this.analytics.completionRate || 0}%`;
    }

    initializeCharts() {
        // Initialize Chart.js charts
        this.initializeMethodsChart();
        this.initializeUsageChart();
    }

    initializeMethodsChart() {
        const ctx = document.getElementById('methods-chart');
        if (!ctx) return;

        this.charts.methods = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: this.methods.map(m => m.title),
                datasets: [{
                    data: this.methods.map(m => this.analytics.methodUsage[m.id] || 0),
                    backgroundColor: [
                        '#3b82f6',
                        '#10b981',
                        '#f59e0b',
                        '#ef4444',
                        '#8b5cf6',
                        '#06b6d4',
                        '#84cc16',
                        '#f97316'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    initializeUsageChart() {
        const ctx = document.getElementById('usage-chart');
        if (!ctx) return;

        this.charts.usage = new Chart(ctx, {
            type: 'line',
            data: {
                labels: this.analytics.dailyUsage.map(d => d.date),
                datasets: [{
                    label: 'Tägliche Nutzung',
                    data: this.analytics.dailyUsage.map(d => d.sessions),
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    updateCharts() {
        if (this.charts.methods) {
            this.charts.methods.data.labels = this.methods.map(m => m.title);
            this.charts.methods.data.datasets[0].data = this.methods.map(m => this.analytics.methodUsage[m.id] || 0);
            this.charts.methods.update();
        }

        if (this.charts.usage) {
            this.charts.usage.data.labels = this.analytics.dailyUsage.map(d => d.date);
            this.charts.usage.data.datasets[0].data = this.analytics.dailyUsage.map(d => d.sessions);
            this.charts.usage.update();
        }
    }

    // Export/Import
    exportConfiguration() {
        const config = {
            methods: this.methods,
            users: this.users,
            analytics: this.analytics,
            exportDate: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `admin-config-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);

        this.showMessage('Konfiguration erfolgreich exportiert', 'success');
    }

    importConfiguration() {
        document.getElementById('file-import').click();
    }

    handleFileImport(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const config = JSON.parse(e.target.result);
                
                if (config.methods) this.methods = config.methods;
                if (config.users) this.users = config.users;
                if (config.analytics) this.analytics = config.analytics;

                this.saveData();
                this.loadMethods();
                this.loadUsers();
                this.loadAnalytics();
                this.updateCharts();

                this.showMessage('Konfiguration erfolgreich importiert', 'success');
            } catch (error) {
                this.showMessage('Fehler beim Importieren der Konfiguration', 'error');
            }
        };
        reader.readAsText(file);
    }

    // Utility Functions
    showMessage(message, type = 'info') {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message message-${type}`;
        messageDiv.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            ${message}
        `;

        // Insert at the top of the main content
        const main = document.querySelector('.admin-main');
        main.insertBefore(messageDiv, main.firstChild);

        // Remove after 5 seconds
        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }

    saveAllChanges() {
        this.saveData();
        this.showMessage('Alle Änderungen gespeichert', 'success');
    }

    resetToDefaults() {
        if (confirm('Möchtest du wirklich alle Einstellungen zurücksetzen? Dies kann nicht rückgängig gemacht werden.')) {
            this.methods = this.getDefaultMethods();
            this.users = this.getDefaultUsers();
            this.analytics = this.getDefaultAnalytics();
            
            this.saveData();
            this.loadMethods();
            this.loadUsers();
            this.loadAnalytics();
            this.updateCharts();
            
            this.showMessage('Einstellungen auf Standardwerte zurückgesetzt', 'success');
        }
    }

    backupData() {
        this.exportConfiguration();
    }

    restoreData() {
        this.importConfiguration();
    }

    exportAnalytics(format) {
        let data, filename, mimeType;

        switch(format) {
            case 'csv':
                data = this.convertToCSV(this.analytics);
                filename = `analytics-${new Date().toISOString().split('T')[0]}.csv`;
                mimeType = 'text/csv';
                break;
            case 'json':
                data = JSON.stringify(this.analytics, null, 2);
                filename = `analytics-${new Date().toISOString().split('T')[0]}.json`;
                mimeType = 'application/json';
                break;
            case 'pdf':
                // For PDF, we would need a PDF library
                this.showMessage('PDF Export wird noch implementiert', 'warning');
                return;
        }

        const blob = new Blob([data], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);

        this.showMessage(`Analytics als ${format.toUpperCase()} exportiert`, 'success');
    }

    convertToCSV(data) {
        // Simple CSV conversion - would need more sophisticated implementation for complex data
        return JSON.stringify(data);
    }
}

// Global functions for HTML onclick handlers
function switchTab(tabName) {
    adminPanel.switchTab(tabName);
}

function saveAllChanges() {
    adminPanel.saveAllChanges();
}

function exportConfiguration() {
    adminPanel.exportConfiguration();
}

function importConfiguration() {
    adminPanel.importConfiguration();
}

function resetToDefaults() {
    adminPanel.resetToDefaults();
}

function addNewMethod() {
    adminPanel.addNewMethod();
}

function closeMethodEditor() {
    adminPanel.closeMethodEditor();
}

function saveMethod() {
    adminPanel.saveMethod();
}

function deleteMethod() {
    adminPanel.deleteMethod();
}

function loadMethodContent() {
    adminPanel.loadMethodContent();
}

function addWorkflowStep() {
    adminPanel.addWorkflowStep();
}

function addReflectionQuestion() {
    adminPanel.addReflectionQuestion();
}

function saveMethodContent() {
    adminPanel.saveMethodContent();
}

function previewMethod() {
    adminPanel.previewMethod();
}

function addUser() {
    adminPanel.addUser();
}

function closeUserEditor() {
    adminPanel.closeUserEditor();
}

function saveUser() {
    adminPanel.saveUser();
}

function deleteUser(userId) {
    adminPanel.deleteUser(userId);
}

function exportAnalytics(format) {
    adminPanel.exportAnalytics(format);
}

function backupData() {
    adminPanel.backupData();
}

function restoreData() {
    adminPanel.restoreData();
}

function handleFileImport(event) {
    adminPanel.handleFileImport(event);
}

// Dropdown functionality
function toggleDropdown(dropdownId) {
    const dropdown = document.getElementById(`${dropdownId}-dropdown`);
    const toggle = document.querySelector(`[data-tab="${dropdownId}"]`);
    
    if (dropdown && toggle) {
        const isOpen = dropdown.classList.contains('show');
        closeAllDropdowns();
        
        if (!isOpen) {
            dropdown.classList.add('show');
            toggle.classList.add('active');
        }
    }
}

function closeAllDropdowns() {
    const dropdowns = document.querySelectorAll('.dropdown-menu');
    const toggles = document.querySelectorAll('.dropdown-toggle');
    
    dropdowns.forEach(dropdown => {
        dropdown.classList.remove('show');
    });
    
    toggles.forEach(toggle => {
        toggle.classList.remove('active');
    });
}

// Admin helper functions
function addQuestion(button) {
    const questionList = button.previousElementSibling;
    const questionItem = document.createElement('div');
    questionItem.className = 'question-item';
    questionItem.innerHTML = `
        <input type="text" class="admin-input" placeholder="Frage hinzufügen...">
        <button class="btn btn-danger btn-sm" onclick="removeQuestion(this)">Entfernen</button>
    `;
    questionList.appendChild(questionItem);
}

function removeQuestion(button) {
    button.parentElement.remove();
}

// Werte-Klärung Admin Functions
function addValueCategory() {
    const categoriesContainer = document.querySelector('.values-categories-admin');
    const newCategory = document.createElement('div');
    newCategory.className = 'category-admin';
    newCategory.innerHTML = `
        <h4>📝 Neue Kategorie</h4>
        <div class="category-controls">
            <button class="btn btn-sm btn-outline" onclick="addValueToCategory('new')">+ Wert hinzufügen</button>
            <button class="btn btn-sm btn-danger" onclick="deleteCategory('new')">Kategorie löschen</button>
        </div>
        <div class="values-list-admin">
            <div class="value-item-admin">
                <input type="text" value="Neuer Wert" class="admin-input">
                <input type="text" value="neuer-wert" class="admin-input" placeholder="ID">
                <button class="btn btn-sm btn-danger" onclick="removeValue(this)">Entfernen</button>
            </div>
        </div>
    `;
    categoriesContainer.appendChild(newCategory);
}

function addValueToCategory(categoryId) {
    const category = event.target.closest('.category-admin');
    const valuesList = category.querySelector('.values-list-admin');
    const newValue = document.createElement('div');
    newValue.className = 'value-item-admin';
    newValue.innerHTML = `
        <input type="text" value="Neuer Wert" class="admin-input">
        <input type="text" value="neuer-wert" class="admin-input" placeholder="ID">
        <button class="btn btn-sm btn-danger" onclick="removeValue(this)">Entfernen</button>
    `;
    valuesList.appendChild(newValue);
}

function removeValue(button) {
    button.parentElement.remove();
}

function deleteCategory(categoryId) {
    if (confirm('Sind Sie sicher, dass Sie diese Kategorie löschen möchten?')) {
        event.target.closest('.category-admin').remove();
    }
}

function importValues() {
    // In a real application, this would open a file picker
    alert('Werte-Import-Funktion würde hier implementiert werden');
}

function exportValues() {
    // In a real application, this would export the values to a file
    alert('Werte-Export-Funktion würde hier implementiert werden');
}

function addQuizQuestion() {
    const questionsContainer = document.querySelector('.quiz-questions-admin');
    const questionNumber = questionsContainer.children.length + 1;
    const newQuestion = document.createElement('div');
    newQuestion.className = 'question-admin';
    newQuestion.innerHTML = `
        <h5>Frage ${questionNumber}</h5>
        <textarea class="admin-textarea" placeholder="Frage eingeben..."></textarea>
        <div class="question-options">
            <div class="option-admin">
                <input type="text" value="Option 1" class="admin-input">
                <input type="text" value="wert1" class="admin-input" placeholder="Wert-ID">
            </div>
            <div class="option-admin">
                <input type="text" value="Option 2" class="admin-input">
                <input type="text" value="wert2" class="admin-input" placeholder="Wert-ID">
            </div>
        </div>
        <button class="btn btn-sm btn-outline" onclick="addQuizOption(this)">+ Option hinzufügen</button>
        <button class="btn btn-sm btn-danger" onclick="removeQuizQuestion(this)">Frage entfernen</button>
    `;
    questionsContainer.appendChild(newQuestion);
}

function addQuizOption(button) {
    const optionsContainer = button.parentElement.querySelector('.question-options');
    const newOption = document.createElement('div');
    newOption.className = 'option-admin';
    newOption.innerHTML = `
        <input type="text" value="Neue Option" class="admin-input">
        <input type="text" value="neuer-wert" class="admin-input" placeholder="Wert-ID">
    `;
    optionsContainer.appendChild(newOption);
}

function removeQuizQuestion(button) {
    if (confirm('Sind Sie sicher, dass Sie diese Frage löschen möchten?')) {
        button.parentElement.remove();
    }
}

function previewQuiz() {
    alert('Quiz-Vorschau würde hier in einem Modal angezeigt werden');
}

function addConflictPair() {
    const conflictsContainer = document.querySelector('.conflict-pairs-admin');
    const newConflict = document.createElement('div');
    newConflict.className = 'conflict-pair-admin';
    newConflict.innerHTML = `
        <div class="conflict-inputs">
            <select class="admin-select">
                <option value="wert1">Wert 1</option>
                <option value="wert2">Wert 2</option>
            </select>
            <span>vs.</span>
            <select class="admin-select">
                <option value="wert2">Wert 2</option>
                <option value="wert1">Wert 1</option>
            </select>
        </div>
        <textarea class="admin-textarea" placeholder="Konflikt-Beschreibung..."></textarea>
        <button class="btn btn-sm btn-danger" onclick="removeConflictPair(this)">Entfernen</button>
    `;
    conflictsContainer.appendChild(newConflict);
}

function removeConflictPair(button) {
    button.parentElement.remove();
}

function addLifeArea() {
    const areasContainer = document.querySelector('.life-areas-list-admin');
    const newArea = document.createElement('div');
    newArea.className = 'life-area-admin';
    newArea.innerHTML = `
        <input type="text" value="🏠 Neuer Lebensbereich" class="admin-input">
        <input type="text" value="neuer-bereich" class="admin-input" placeholder="ID">
        <textarea class="admin-textarea" placeholder="Beschreibung..."></textarea>
        <button class="btn btn-sm btn-danger" onclick="removeLifeArea(this)">Entfernen</button>
    `;
    areasContainer.appendChild(newArea);
}

function removeLifeArea(button) {
    if (confirm('Sind Sie sicher, dass Sie diesen Lebensbereich löschen möchten?')) {
        button.parentElement.remove();
    }
}

function addValueChallenge() {
    const challengesContainer = document.querySelector('.challenges-list-admin');
    const newChallenge = document.createElement('div');
    newChallenge.className = 'challenge-admin';
    newChallenge.innerHTML = `
        <input type="text" value="Neue Challenge" class="admin-input">
        <textarea class="admin-textarea" placeholder="Challenge-Beschreibung..."></textarea>
        <input type="number" value="30" class="admin-input" placeholder="Tage">
        <button class="btn btn-sm btn-danger" onclick="removeChallenge(this)">Entfernen</button>
    `;
    challengesContainer.appendChild(newChallenge);
}

function removeChallenge(button) {
    button.parentElement.remove();
}

// Method definitions for admin tabs
const methodDefinitions = {
    'mindfulness': {
        name: 'Achtsamkeit & Meditation',
        steps: [
            { name: 'Geführte Meditation', questions: [] },
            { name: 'Achtsamkeitsübungen', questions: [] },
            { name: 'Stress-Reduktion', questions: [] }
        ],
        duration: '30-60 Minuten',
        difficulty: 'beginner'
    },
    'emotional-intelligence': {
        name: 'Emotionale Intelligenz',
        steps: [
            { name: 'EQ-Test', questions: [] },
            { name: 'Emotionsregulation', questions: [] },
            { name: 'Empathie-Training', questions: [] }
        ],
        duration: '1-2 Stunden',
        difficulty: 'intermediate'
    },
    'habits': {
        name: 'Gewohnheiten aufbauen',
        steps: [
            { name: 'Habit-Stacking', questions: [] },
            { name: '21-Tage-Regel', questions: [] },
            { name: 'Tracking', questions: [] }
        ],
        duration: '1-2 Stunden',
        difficulty: 'beginner'
    },
    'communication': {
        name: 'Kommunikation',
        steps: [
            { name: 'Aktives Zuhören', questions: [] },
            { name: 'Nonverbale Kommunikation', questions: [] },
            { name: 'Konfliktlösung', questions: [] }
        ],
        duration: '1-2 Stunden',
        difficulty: 'intermediate'
    },
    'time-management': {
        name: 'Zeitmanagement',
        steps: [
            { name: 'Zeit-Analyse', questions: [] },
            { name: 'Eisenhower-Matrix', questions: [] },
            { name: 'Pomodoro-Technik', questions: [] },
            { name: 'Tagesplanung', questions: [] }
        ],
        duration: '1-2 Stunden',
        difficulty: 'beginner'
    },
    'johari-window': {
        name: 'Johari-Fenster',
        steps: [
            { name: '4 Bereiche', questions: [] },
            { name: 'Selbstbewusstsein', questions: [] },
            { name: 'Feedback', questions: [] }
        ],
        duration: '1-2 Stunden',
        difficulty: 'intermediate'
    },
    'walt-disney': {
        name: 'Walt-Disney-Strategie',
        steps: [
            { name: 'Träumer', questions: [] },
            { name: 'Realist', questions: [] },
            { name: 'Kritiker', questions: [] }
        ],
        duration: '1-2 Stunden',
        difficulty: 'intermediate'
    },
    'nonviolent-communication': {
        name: 'Gewaltfreie Kommunikation',
        steps: [
            { name: 'Beobachtung', questions: [] },
            { name: 'Gefühl', questions: [] },
            { name: 'Bedürfnis', questions: [] },
            { name: 'Bitte', questions: [] }
        ],
        duration: '2-3 Stunden',
        difficulty: 'intermediate'
    },
    'five-pillars': {
        name: 'Fünf Säulen der Identität',
        steps: [
            { name: 'Leiblichkeit', questions: [] },
            { name: 'Soziales Netzwerk', questions: [] },
            { name: 'Arbeit & Leistung', questions: [] },
            { name: 'Materielle Sicherheit', questions: [] },
            { name: 'Werte & Normen', questions: [] }
        ],
        duration: '2-3 Stunden',
        difficulty: 'intermediate'
    },
    'nlp-meta-goal': {
        name: 'NLP Meta-Ziel',
        steps: [
            { name: 'Ziel-Formulierung', questions: [] },
            { name: 'Ressourcen-Analyse', questions: [] },
            { name: 'Strategie-Entwicklung', questions: [] }
        ],
        duration: '1-2 Stunden',
        difficulty: 'advanced'
    },
    'aek-communication': {
        name: 'AEK - Aspektbezogene Kommunikation',
        steps: [
            { name: 'Aspekt-Identifikation', questions: [] },
            { name: 'Kommunikations-Strategie', questions: [] },
            { name: 'Umsetzung', questions: [] }
        ],
        duration: '1-2 Stunden',
        difficulty: 'advanced'
    },
    'rubikon-model': {
        name: 'Rubikon-Modell',
        steps: [
            { name: 'Prädezisionale Phase', questions: [] },
            { name: 'Präaktionale Phase', questions: [] },
            { name: 'Aktionale Phase', questions: [] },
            { name: 'Postaktionale Phase', questions: [] }
        ],
        duration: '2-3 Stunden',
        difficulty: 'advanced'
    },
    'systemic-coaching': {
        name: 'Systemisches Coaching',
        steps: [
            { name: 'System-Analyse', questions: [] },
            { name: 'Intervention', questions: [] },
            { name: 'Evaluation', questions: [] }
        ],
        duration: '2-3 Stunden',
        difficulty: 'advanced'
    },
    'rafael-method': {
        name: 'RAFAEL-Methode',
        steps: [
            { name: 'Ressourcen', questions: [] },
            { name: 'Aktivierung', questions: [] },
            { name: 'Fokussierung', questions: [] },
            { name: 'Aktion', questions: [] },
            { name: 'Evaluation', questions: [] },
            { name: 'Lernen', questions: [] }
        ],
        duration: '2-3 Stunden',
        difficulty: 'intermediate'
    },
    'conflict-escalation': {
        name: 'Neun Stufen der Konflikteskalation',
        steps: [
            { name: 'Verhärtung', questions: [] },
            { name: 'Debatte', questions: [] },
            { name: 'Taten', questions: [] },
            { name: 'Koalitionen', questions: [] },
            { name: 'Gesichtsverlust', questions: [] },
            { name: 'Drohstrategien', questions: [] },
            { name: 'Begrenzte Vernichtung', questions: [] },
            { name: 'Zersplitterung', questions: [] },
            { name: 'Gemeinsam in den Abgrund', questions: [] }
        ],
        duration: '2-3 Stunden',
        difficulty: 'advanced'
    },
    'harvard-method': {
        name: 'Harvard-Methode',
        steps: [
            { name: 'Interessen-Analyse', questions: [] },
            { name: 'Optionen-Entwicklung', questions: [] },
            { name: 'Verhandlung', questions: [] },
            { name: 'Vereinbarung', questions: [] }
        ],
        duration: '2-3 Stunden',
        difficulty: 'intermediate'
    },
    'circular-interview': {
        name: 'Zirkuläres Interview',
        steps: [
            { name: 'Fragen-Entwicklung', questions: [] },
            { name: 'Interview-Durchführung', questions: [] },
            { name: 'Auswertung', questions: [] }
        ],
        duration: '1-2 Stunden',
        difficulty: 'intermediate'
    },
    'target-coaching': {
        name: 'Target Coaching',
        steps: [
            { name: 'Ziel-Definition', questions: [] },
            { name: 'Strategie-Entwicklung', questions: [] },
            { name: 'Umsetzung', questions: [] },
            { name: 'Evaluation', questions: [] }
        ],
        duration: '2-3 Stunden',
        difficulty: 'intermediate'
    },
    'solution-focused': {
        name: 'Lösungsorientierte Kurzzeitberatung',
        steps: [
            { name: 'Problem-Analyse', questions: [] },
            { name: 'Lösungs-Entwicklung', questions: [] },
            { name: 'Umsetzung', questions: [] }
        ],
        duration: '1-2 Stunden',
        difficulty: 'intermediate'
    },
    'change-stages': {
        name: 'Sechs Stufen der Veränderung',
        steps: [
            { name: 'Präkontemplation', questions: [] },
            { name: 'Kontemplation', questions: [] },
            { name: 'Vorbereitung', questions: [] },
            { name: 'Aktion', questions: [] },
            { name: 'Aufrechterhaltung', questions: [] },
            { name: 'Rückfall', questions: [] }
        ],
        duration: '2-3 Stunden',
        difficulty: 'intermediate'
    },
    'competence-map': {
        name: 'Kompetenzkarte',
        steps: [
            { name: 'Kompetenz-Identifikation', questions: [] },
            { name: 'Bewertung', questions: [] },
            { name: 'Entwicklungsplan', questions: [] }
        ],
        duration: '1-2 Stunden',
        difficulty: 'beginner'
    },
    'moment-excellence': {
        name: 'Moment of Excellence',
        steps: [
            { name: 'Erfolgs-Moment', questions: [] },
            { name: 'Analyse', questions: [] },
            { name: 'Transfer', questions: [] }
        ],
        duration: '1-2 Stunden',
        difficulty: 'intermediate'
    },
    'resource-analysis': {
        name: 'Ressourcenanalyse',
        steps: [
            { name: 'Ressourcen-Identifikation', questions: [] },
            { name: 'Bewertung', questions: [] },
            { name: 'Nutzung', questions: [] }
        ],
        duration: '1-2 Stunden',
        difficulty: 'beginner'
    }
};

// Generate admin tabs dynamically
function generateAdminTabs() {
    const adminMain = document.querySelector('.admin-main');
    const methodsTab = document.getElementById('methods-tab');
    
    // Insert all method tabs before the methods-tab
    Object.keys(methodDefinitions).forEach(methodId => {
        const method = methodDefinitions[methodId];
        const tabHtml = generateMethodTabHtml(methodId, method);
        adminMain.insertBefore(createElementFromHTML(tabHtml), methodsTab);
    });
}

function generateMethodTabHtml(methodId, method) {
    const stepsHtml = method.steps.map((step, index) => `
        <div class="step-admin" draggable="true">
            <div class="step-drag-handle">
                <i class="fas fa-grip-vertical"></i>
            </div>
            <h4>
                <span class="step-number">${index + 1}</span>
                Schritt ${index + 1}: ${step.name}
            </h4>
            <textarea class="admin-textarea" placeholder="Beschreibung des Schritts..."></textarea>
            <div class="questions-admin">
                <h5>Reflexionsfragen:</h5>
                <div class="question-list">
                    <div class="question-item">
                        <input type="text" class="admin-input" placeholder="Frage hinzufügen...">
                        <button class="btn btn-danger btn-sm" onclick="removeQuestion(this)">Entfernen</button>
                    </div>
                </div>
                <button class="btn btn-primary btn-sm" onclick="addQuestion(this)">Frage hinzufügen</button>
            </div>
        </div>
    `).join('');
    
    return `
        <div class="admin-tab-content" id="${methodId}-tab">
            <div class="tab-header">
                <h2>${method.name} verwalten</h2>
                <p>Verwalte alle Inhalte, Fragen und Workflow-Schritte für die ${method.name}.</p>
            </div>
            
            <div class="method-admin-content">
                <div class="admin-section">
                    <h3>Workflow-Schritte</h3>
                    <div class="workflow-steps-admin">
                        ${stepsHtml}
                    </div>
                </div>
                
                <div class="admin-section">
                    <h3>Methoden-Eigenschaften</h3>
                    <div class="method-properties">
                        <div class="property-group">
                            <label>Methoden-Name:</label>
                            <input type="text" class="admin-input" value="${method.name}">
                        </div>
                        <div class="property-group">
                            <label>Beschreibung:</label>
                            <textarea class="admin-textarea" placeholder="Kurze Beschreibung der Methode..."></textarea>
                        </div>
                        <div class="property-group">
                            <label>Geschätzte Dauer:</label>
                            <input type="text" class="admin-input" value="${method.duration}">
                        </div>
                        <div class="property-group">
                            <label>Anzahl Schritte:</label>
                            <input type="number" class="admin-input" value="${method.steps.length}">
                        </div>
                        <div class="property-group">
                            <label>Schwierigkeitsgrad:</label>
                            <select class="admin-select">
                                <option value="beginner" ${method.difficulty === 'beginner' ? 'selected' : ''}>Anfänger</option>
                                <option value="intermediate" ${method.difficulty === 'intermediate' ? 'selected' : ''}>Fortgeschritten</option>
                                <option value="advanced" ${method.difficulty === 'advanced' ? 'selected' : ''}>Experte</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function createElementFromHTML(htmlString) {
    const div = document.createElement('div');
    div.innerHTML = htmlString.trim();
    return div.firstChild;
}

// Enhanced Admin Functions
class AdminOptimizer {
    constructor() {
        this.draggedElement = null;
        this.versions = new Map();
        this.templates = new Map();
        this.autoSaveInterval = null;
        this.init();
    }

    init() {
        this.setupDragAndDrop();
        this.setupLivePreview();
        this.setupBulkOperations();
        this.setupTemplateSystem();
        this.setupVersionControl();
        this.setupValidation();
        this.setupAutoSave();
    }

    // Drag & Drop für Workflow-Schritte
    setupDragAndDrop() {
        document.addEventListener('dragstart', (e) => {
            if (e.target.classList.contains('step-admin')) {
                this.draggedElement = e.target;
                e.target.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
            }
        });

        document.addEventListener('dragend', (e) => {
            if (e.target.classList.contains('step-admin')) {
                e.target.classList.remove('dragging');
                this.draggedElement = null;
            }
        });

        document.addEventListener('dragover', (e) => {
            e.preventDefault();
            if (e.target.classList.contains('step-admin') && e.target !== this.draggedElement) {
                e.target.classList.add('drag-over');
            }
        });

        document.addEventListener('dragleave', (e) => {
            if (e.target.classList.contains('step-admin')) {
                e.target.classList.remove('drag-over');
            }
        });

        document.addEventListener('drop', (e) => {
            e.preventDefault();
            if (e.target.classList.contains('step-admin') && this.draggedElement) {
                e.target.classList.remove('drag-over');
                const container = e.target.parentNode;
                const draggedIndex = Array.from(container.children).indexOf(this.draggedElement);
                const targetIndex = Array.from(container.children).indexOf(e.target);
                
                if (draggedIndex < targetIndex) {
                    container.insertBefore(this.draggedElement, e.target.nextSibling);
                } else {
                    container.insertBefore(this.draggedElement, e.target);
                }
                
                this.updateStepNumbers(container);
                this.showAutoSaveIndicator();
            }
        });
    }

    updateStepNumbers(container) {
        const steps = container.querySelectorAll('.step-admin');
        steps.forEach((step, index) => {
            const numberElement = step.querySelector('.step-number');
            if (numberElement) {
                numberElement.textContent = index + 1;
            }
        });
    }

    // Live Preview
    setupLivePreview() {
        const previewToggle = document.createElement('button');
        previewToggle.className = 'btn btn-outline';
        previewToggle.innerHTML = '<i class="fas fa-eye"></i> Live-Vorschau';
        previewToggle.onclick = () => this.toggleLivePreview();
        
        // Add to admin header
        const adminActions = document.querySelector('.admin-actions');
        if (adminActions) {
            adminActions.appendChild(previewToggle);
        }

        this.createLivePreview();
    }

    createLivePreview() {
        const preview = document.createElement('div');
        preview.className = 'live-preview';
        preview.innerHTML = `
            <div class="preview-header">
                <h4>Live-Vorschau</h4>
                <button onclick="adminOptimizer.closeLivePreview()" class="btn btn-sm btn-outline">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="preview-content" id="preview-content">
                <!-- Preview content will be generated here -->
            </div>
        `;
        document.body.appendChild(preview);
    }

    toggleLivePreview() {
        const preview = document.querySelector('.live-preview');
        preview.classList.toggle('show');
        if (preview.classList.contains('show')) {
            this.updateLivePreview();
        }
    }

    closeLivePreview() {
        const preview = document.querySelector('.live-preview');
        preview.classList.remove('show');
    }

    updateLivePreview() {
        const previewContent = document.getElementById('preview-content');
        const currentTab = document.querySelector('.admin-tab-content.active');
        if (!currentTab) return;

        const steps = currentTab.querySelectorAll('.step-admin');
        let html = '';
        
        steps.forEach((step, index) => {
            const title = step.querySelector('h4').textContent;
            const description = step.querySelector('.admin-textarea').value || 'Keine Beschreibung verfügbar';
            const questions = step.querySelectorAll('.question-item input');
            const questionList = Array.from(questions).map(q => q.value).filter(q => q.trim()).join(', ');
            
            html += `
                <div class="preview-step">
                    <h5>${title}</h5>
                    <p>${description}</p>
                    ${questionList ? `<p><strong>Fragen:</strong> ${questionList}</p>` : ''}
                </div>
            `;
        });
        
        previewContent.innerHTML = html;
    }

    // Bulk Operations
    setupBulkOperations() {
        const bulkToggle = document.createElement('button');
        bulkToggle.className = 'btn btn-outline';
        bulkToggle.innerHTML = '<i class="fas fa-tasks"></i> Bulk-Operationen';
        bulkToggle.onclick = () => this.toggleBulkOperations();
        
        const adminActions = document.querySelector('.admin-actions');
        if (adminActions) {
            adminActions.appendChild(bulkToggle);
        }
    }

    toggleBulkOperations() {
        const currentTab = document.querySelector('.admin-tab-content.active');
        if (!currentTab) return;

        let bulkOps = currentTab.querySelector('.bulk-operations');
        if (!bulkOps) {
            bulkOps = this.createBulkOperations();
            const firstSection = currentTab.querySelector('.admin-section');
            firstSection.parentNode.insertBefore(bulkOps, firstSection);
        }
        
        bulkOps.classList.toggle('show');
    }

    createBulkOperations() {
        const bulkOps = document.createElement('div');
        bulkOps.className = 'bulk-operations';
        bulkOps.innerHTML = `
            <h4>Bulk-Operationen</h4>
            <div class="bulk-actions">
                <button class="bulk-action-btn" onclick="adminOptimizer.bulkAddQuestions()">
                    <i class="fas fa-plus"></i> Fragen zu allen Schritten hinzufügen
                </button>
                <button class="bulk-action-btn" onclick="adminOptimizer.bulkClearQuestions()">
                    <i class="fas fa-trash"></i> Alle Fragen löschen
                </button>
                <button class="bulk-action-btn" onclick="adminOptimizer.bulkValidate()">
                    <i class="fas fa-check"></i> Alle Felder validieren
                </button>
                <button class="bulk-action-btn danger" onclick="adminOptimizer.bulkReset()">
                    <i class="fas fa-undo"></i> Alle zurücksetzen
                </button>
            </div>
        `;
        return bulkOps;
    }

    bulkAddQuestions() {
        const currentTab = document.querySelector('.admin-tab-content.active');
        const steps = currentTab.querySelectorAll('.step-admin');
        
        steps.forEach(step => {
            const addBtn = step.querySelector('.btn-primary');
            if (addBtn) {
                addBtn.click();
            }
        });
        
        this.showNotification('Fragen zu allen Schritten hinzugefügt', 'success');
    }

    bulkClearQuestions() {
        if (confirm('Möchten Sie wirklich alle Fragen löschen?')) {
            const currentTab = document.querySelector('.admin-tab-content.active');
            const questionItems = currentTab.querySelectorAll('.question-item');
            
            questionItems.forEach(item => {
                const removeBtn = item.querySelector('.btn-danger');
                if (removeBtn) {
                    removeBtn.click();
                }
            });
            
            this.showNotification('Alle Fragen gelöscht', 'success');
        }
    }

    bulkValidate() {
        const currentTab = document.querySelector('.admin-tab-content.active');
        const inputs = currentTab.querySelectorAll('.admin-input, .admin-textarea');
        let valid = true;
        
        inputs.forEach(input => {
            if (!input.value.trim()) {
                input.classList.add('validation-error');
                valid = false;
            } else {
                input.classList.remove('validation-error');
            }
        });
        
        if (valid) {
            this.showNotification('Alle Felder sind gültig', 'success');
        } else {
            this.showNotification('Einige Felder sind leer', 'error');
        }
    }

    bulkReset() {
        if (confirm('Möchten Sie wirklich alle Änderungen zurücksetzen?')) {
            const currentTab = document.querySelector('.admin-tab-content.active');
            const inputs = currentTab.querySelectorAll('.admin-input, .admin-textarea');
            
            inputs.forEach(input => {
                input.value = '';
                input.classList.remove('validation-error');
            });
            
            this.showNotification('Alle Felder zurückgesetzt', 'success');
        }
    }

    // Template System
    setupTemplateSystem() {
        this.templates.set('basic', {
            name: 'Basis-Template',
            steps: [
                { name: 'Einführung', questions: ['Was ist das Ziel?'] },
                { name: 'Hauptteil', questions: ['Wie gehst du vor?'] },
                { name: 'Abschluss', questions: ['Was hast du gelernt?'] }
            ]
        });

        this.templates.set('detailed', {
            name: 'Detailliertes Template',
            steps: [
                { name: 'Vorbereitung', questions: ['Was brauchst du?', 'Welche Ressourcen hast du?'] },
                { name: 'Durchführung', questions: ['Wie gehst du vor?', 'Was passiert?'] },
                { name: 'Reflexion', questions: ['Was war gut?', 'Was kannst du verbessern?'] },
                { name: 'Nächste Schritte', questions: ['Was machst du als nächstes?'] }
            ]
        });

        this.templates.set('coaching', {
            name: 'Coaching-Template',
            steps: [
                { name: 'Zielklärung', questions: ['Was möchtest du erreichen?'] },
                { name: 'Ressourcenanalyse', questions: ['Was bringst du mit?'] },
                { name: 'Strategieentwicklung', questions: ['Wie gehst du vor?'] },
                { name: 'Umsetzung', questions: ['Was tust du konkret?'] },
                { name: 'Evaluation', questions: ['Wie war es?'] }
            ]
        });
    }

    // Version Control
    setupVersionControl() {
        this.createVersion(0, 'Initiale Version', 'Erste Version der Methode');
    }

    createVersion(id, name, description) {
        this.versions.set(id, {
            id,
            name,
            description,
            timestamp: new Date().toISOString(),
            data: this.exportCurrentMethod()
        });
    }

    exportCurrentMethod() {
        const currentTab = document.querySelector('.admin-tab-content.active');
        if (!currentTab) return null;

        const methodName = currentTab.querySelector('.admin-input[value]')?.value || 'Unbekannte Methode';
        const steps = Array.from(currentTab.querySelectorAll('.step-admin')).map(step => {
            const title = step.querySelector('h4').textContent;
            const description = step.querySelector('.admin-textarea').value;
            const questions = Array.from(step.querySelectorAll('.question-item input')).map(q => q.value);
            
            return { title, description, questions };
        });

        return { methodName, steps };
    }

    // Validation
    setupValidation() {
        document.addEventListener('input', (e) => {
            if (e.target.classList.contains('admin-input') || e.target.classList.contains('admin-textarea')) {
                this.validateField(e.target);
            }
        });
    }

    validateField(field) {
        const value = field.value.trim();
        const isValid = value.length > 0;
        
        field.classList.toggle('validation-error', !isValid);
        
        // Remove existing validation message
        const existingMessage = field.parentNode.querySelector('.validation-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        if (!isValid) {
            const message = document.createElement('div');
            message.className = 'validation-message';
            message.textContent = 'Dieses Feld ist erforderlich';
            field.parentNode.appendChild(message);
        }
    }

    // Auto-save
    setupAutoSave() {
        this.autoSaveInterval = setInterval(() => {
            this.autoSave();
        }, 30000); // Auto-save every 30 seconds

        // Auto-save on input changes
        document.addEventListener('input', (e) => {
            if (e.target.classList.contains('admin-input') || e.target.classList.contains('admin-textarea')) {
                clearTimeout(this.autoSaveTimeout);
                this.autoSaveTimeout = setTimeout(() => {
                    this.autoSave();
                }, 2000); // Auto-save 2 seconds after last input
            }
        });
    }

    autoSave() {
        const currentMethod = this.exportCurrentMethod();
        if (currentMethod) {
            localStorage.setItem('admin_autosave', JSON.stringify({
                method: currentMethod,
                timestamp: new Date().toISOString()
            }));
            this.showAutoSaveIndicator();
        }
    }

    showAutoSaveIndicator() {
        const indicator = document.querySelector('.auto-save-indicator');
        if (!indicator) {
            const newIndicator = document.createElement('div');
            newIndicator.className = 'auto-save-indicator';
            newIndicator.innerHTML = '<i class="fas fa-save"></i> Auto-gespeichert';
            document.body.appendChild(newIndicator);
        }
        
        const indicator = document.querySelector('.auto-save-indicator');
        indicator.classList.add('show');
        
        setTimeout(() => {
            indicator.classList.remove('show');
        }, 2000);
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'times' : 'info'}"></i>
                ${message}
            </div>
        `;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            padding: 1rem 2rem;
            border-radius: 0.5rem;
            z-index: 10000;
            animation: slideDown 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Initialize admin optimizer
let adminOptimizer;

// Initialize admin panel when DOM is loaded
let adminPanel;
document.addEventListener('DOMContentLoaded', () => {
    adminPanel = new AdminPanel();
    
    // Generate all method tabs dynamically
    generateAdminTabs();
    
    // Initialize admin optimizer
    adminOptimizer = new AdminOptimizer();
    
    // Setup dropdown event listeners
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.nav-dropdown')) {
            closeAllDropdowns();
        }
    });
});
