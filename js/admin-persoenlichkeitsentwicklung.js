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

// Initialize admin panel when DOM is loaded
let adminPanel;
document.addEventListener('DOMContentLoaded', () => {
    adminPanel = new AdminPanel();
});
