// AI Investment System Dashboard JavaScript
class AIInvestmentDashboard {
    constructor() {
        this.apiBaseUrl = 'https://api.ai-investment.com/v1';
        this.apiKey = localStorage.getItem('ai_investment_api_key') || '';
        this.currentSection = 'overview';
        this.currentPage = 1;
        this.pageSize = 50;
        this.charts = {};
        this.data = {
            signals: [],
            proposals: [],
            decisions: [],
            outcomes: [],
            metrics: {}
        };
        
        this.init();
    }

    async init() {
        console.log('🚀 Initializing AI Investment Dashboard...');
        
        try {
            // Setup event listeners
            this.setupEventListeners();
            
            // Load initial data
            await this.loadDashboardData();
            
            // Initialize charts
            this.initializeCharts();
            
            // Setup real-time updates
            this.setupRealTimeUpdates();
            
            console.log('✅ Dashboard initialized successfully');
        } catch (error) {
            console.error('❌ Dashboard initialization failed:', error);
            this.showError('Dashboard konnte nicht initialisiert werden');
        }
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.menu-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const section = e.currentTarget.dataset.section;
                this.navigateToSection(section);
            });
        });

        // Refresh buttons
        document.getElementById('refreshBtn')?.addEventListener('click', () => {
            this.refreshAllData();
        });

        // Time range selector
        document.getElementById('timeRange')?.addEventListener('change', (e) => {
            this.updateTimeRange(e.target.value);
        });

        // Filter controls
        this.setupFilterControls();
        
        // Pagination
        document.getElementById('prevPageBtn')?.addEventListener('click', () => {
            this.previousPage();
        });
        
        document.getElementById('nextPageBtn')?.addEventListener('click', () => {
            this.nextPage();
        });

        // Action buttons
        this.setupActionButtons();
        
        // Settings
        this.setupSettings();
        
        // Modal controls
        this.setupModalControls();
    }

    setupFilterControls() {
        // Signal filters
        const signalSourceFilter = document.getElementById('signalSourceFilter');
        const signalTimeFilter = document.getElementById('signalTimeFilter');
        const signalScoreFilter = document.getElementById('signalScoreFilter');
        const scoreValue = document.getElementById('scoreValue');

        if (signalSourceFilter) {
            signalSourceFilter.addEventListener('change', () => {
                this.filterSignals();
            });
        }

        if (signalTimeFilter) {
            signalTimeFilter.addEventListener('change', () => {
                this.filterSignals();
            });
        }

        if (signalScoreFilter) {
            signalScoreFilter.addEventListener('input', (e) => {
                scoreValue.textContent = e.target.value;
                this.filterSignals();
            });
        }

        // Proposal filters
        const proposalStatusFilter = document.getElementById('proposalStatusFilter');
        const riskFilter = document.getElementById('riskFilter');
        const riskValue = document.getElementById('riskValue');

        if (proposalStatusFilter) {
            proposalStatusFilter.addEventListener('change', () => {
                this.filterProposals();
            });
        }

        if (riskFilter) {
            riskFilter.addEventListener('input', (e) => {
                riskValue.textContent = e.target.value;
                this.filterProposals();
            });
        }
    }

    setupActionButtons() {
        // Ingest signals
        document.getElementById('ingestSignalsBtn')?.addEventListener('click', () => {
            this.ingestSignals();
        });

        // Generate proposal
        document.getElementById('generateProposalBtn')?.addEventListener('click', () => {
            this.generateProposal();
        });

        // Risk check
        document.getElementById('riskCheckBtn')?.addEventListener('click', () => {
            this.performRiskCheck();
        });

        // Generate insights
        document.getElementById('generateInsightsBtn')?.addEventListener('click', () => {
            this.generateInsights();
        });
    }

    setupSettings() {
        // Settings tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.target.dataset.tab;
                this.switchSettingsTab(tab);
            });
        });

        // Save settings
        document.getElementById('saveSettingsBtn')?.addEventListener('click', () => {
            this.saveSettings();
        });

        // Reset settings
        document.getElementById('resetSettingsBtn')?.addEventListener('click', () => {
            this.resetSettings();
        });

        // Range inputs
        document.getElementById('maxRisk')?.addEventListener('input', (e) => {
            document.getElementById('maxRiskValue').textContent = e.target.value;
        });

        document.getElementById('stopLoss')?.addEventListener('input', (e) => {
            document.getElementById('stopLossValue').textContent = (e.target.value * 100).toFixed(0) + '%';
        });
    }

    setupModalControls() {
        // Modal close buttons
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                modal.style.display = 'none';
            });
        });

        // Close modal on outside click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                }
            });
        });
    }

    async loadDashboardData() {
        this.showLoading();
        
        try {
            // Load overview data
            await this.loadOverviewData();
            
            // Load signals
            await this.loadSignals();
            
            // Load proposals
            await this.loadProposals();
            
            // Load decisions
            await this.loadDecisions();
            
            // Load outcomes
            await this.loadOutcomes();
            
            // Load metrics
            await this.loadMetrics();
            
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
            this.showError('Daten konnten nicht geladen werden');
        } finally {
            this.hideLoading();
        }
    }

    async loadOverviewData() {
        try {
            const response = await this.apiCall('/dashboard/overview');
            if (response.ok) {
                this.updateOverviewMetrics(response.data);
            }
        } catch (error) {
            console.error('Failed to load overview data:', error);
        }
    }

    async loadSignals() {
        try {
            const response = await this.apiCall('/dashboard/signals', {
                limit: this.pageSize,
                page: this.currentPage
            });
            if (response.ok) {
                this.data.signals = response.data.signals;
                this.updateSignalsTable();
            }
        } catch (error) {
            console.error('Failed to load signals:', error);
        }
    }

    async loadProposals() {
        try {
            const response = await this.apiCall('/dashboard/proposals', {
                limit: this.pageSize,
                page: this.currentPage
            });
            if (response.ok) {
                this.data.proposals = response.data.proposals;
                this.updateProposalsGrid();
            }
        } catch (error) {
            console.error('Failed to load proposals:', error);
        }
    }

    async loadDecisions() {
        try {
            const response = await this.apiCall('/dashboard/decisions');
            if (response.ok) {
                this.data.decisions = response.data.decisions;
                this.updateDecisionsTable();
            }
        } catch (error) {
            console.error('Failed to load decisions:', error);
        }
    }

    async loadOutcomes() {
        try {
            const response = await this.apiCall('/dashboard/outcomes');
            if (response.ok) {
                this.data.outcomes = response.data.outcomes;
                this.updateOutcomesTable();
            }
        } catch (error) {
            console.error('Failed to load outcomes:', error);
        }
    }

    async loadMetrics() {
        try {
            const [systemMetrics, businessMetrics] = await Promise.all([
                this.apiCall('/metrics/system'),
                this.apiCall('/metrics/business')
            ]);
            
            if (systemMetrics.ok) {
                this.updateSystemMetrics(systemMetrics.data);
            }
            
            if (businessMetrics.ok) {
                this.updateBusinessMetrics(businessMetrics.data);
            }
        } catch (error) {
            console.error('Failed to load metrics:', error);
        }
    }

    async apiCall(endpoint, params = {}) {
        const url = new URL(this.apiBaseUrl + endpoint);
        
        // Add query parameters
        Object.keys(params).forEach(key => {
            if (params[key] !== undefined && params[key] !== null) {
                url.searchParams.append(key, params[key]);
            }
        });

        const options = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`,
                'X-API-Key': this.apiKey
            }
        };

        try {
            const response = await fetch(url.toString(), options);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.details || 'API request failed');
            }
            
            return data;
        } catch (error) {
            console.error(`API call failed for ${endpoint}:`, error);
            throw error;
        }
    }

    async apiPost(endpoint, data) {
        const url = this.apiBaseUrl + endpoint;
        
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`,
                'X-API-Key': this.apiKey
            },
            body: JSON.stringify(data)
        };

        try {
            const response = await fetch(url, options);
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.details || 'API request failed');
            }
            
            return result;
        } catch (error) {
            console.error(`API POST failed for ${endpoint}:`, error);
            throw error;
        }
    }

    updateOverviewMetrics(data) {
        // Update metric cards
        document.getElementById('totalSignals').textContent = data.overview.total_signals.toLocaleString();
        document.getElementById('totalProposals').textContent = data.overview.total_proposals.toLocaleString();
        document.getElementById('totalDecisions').textContent = data.overview.total_decisions.toLocaleString();
        document.getElementById('successRate').textContent = (data.overview.success_rate * 100).toFixed(0) + '%';

        // Update recent activity
        this.updateRecentActivity(data.recent_activity);
    }

    updateRecentActivity(activities) {
        const container = document.getElementById('recentActivity');
        if (!container) return;

        container.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon">
                    <i class="fas fa-${this.getActivityIcon(activity.type)}"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-description">${activity.description}</div>
                    <div class="activity-time">${this.formatTime(activity.timestamp)}</div>
                </div>
            </div>
        `).join('');
    }

    getActivityIcon(type) {
        const icons = {
            signal: 'signal',
            proposal: 'lightbulb',
            decision: 'gavel',
            outcome: 'trophy',
            risk: 'shield-alt'
        };
        return icons[type] || 'info';
    }

    updateSignalsTable() {
        const tbody = document.querySelector('#signalsTable tbody');
        if (!tbody) return;

        tbody.innerHTML = this.data.signals.map(signal => `
            <tr>
                <td>${signal.id}</td>
                <td>
                    <span class="source-badge ${signal.source}">
                        ${this.getSourceName(signal.source)}
                    </span>
                </td>
                <td class="content-cell">
                    <div class="content-preview">${signal.content.substring(0, 100)}...</div>
                </td>
                <td>
                    <div class="score-bar">
                        <div class="score-fill" style="width: ${signal.scores.fused * 100}%"></div>
                        <span class="score-value">${(signal.scores.fused * 100).toFixed(0)}%</span>
                    </div>
                </td>
                <td>
                    <div class="confidence-bar">
                        <div class="confidence-fill" style="width: ${signal.confidences.fused * 100}%"></div>
                        <span class="confidence-value">${(signal.confidences.fused * 100).toFixed(0)}%</span>
                    </div>
                </td>
                <td>${this.formatTime(signal.timestamp)}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="dashboard.showSignalDetail('${signal.id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    updateProposalsGrid() {
        const container = document.getElementById('proposalsGrid');
        if (!container) return;

        container.innerHTML = this.data.proposals.map(proposal => `
            <div class="proposal-card">
                <div class="proposal-header">
                    <h4>${proposal.assets.join(', ')}</h4>
                    <span class="status-badge ${proposal.status}">${this.getStatusName(proposal.status)}</span>
                </div>
                <div class="proposal-content">
                    <p class="proposal-thesis">${proposal.thesis}</p>
                    <div class="proposal-metrics">
                        <div class="metric">
                            <span class="metric-label">Risiko:</span>
                            <span class="metric-value risk-${this.getRiskLevel(proposal.risk_score)}">
                                ${(proposal.risk_score * 100).toFixed(0)}%
                            </span>
                        </div>
                        <div class="metric">
                            <span class="metric-label">Erwartete Rendite:</span>
                            <span class="metric-value">${(proposal.expected_return * 100).toFixed(1)}%</span>
                        </div>
                        <div class="metric">
                            <span class="metric-label">Sharpe Ratio:</span>
                            <span class="metric-value">${proposal.sharpe_ratio.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
                <div class="proposal-actions">
                    <button class="btn btn-sm btn-primary" onclick="dashboard.showProposalDetail('${proposal.id}')">
                        <i class="fas fa-eye"></i> Details
                    </button>
                    <button class="btn btn-sm btn-secondary" onclick="dashboard.approveProposal('${proposal.id}')">
                        <i class="fas fa-check"></i> Genehmigen
                    </button>
                </div>
            </div>
        `).join('');
    }

    updateDecisionsTable() {
        const tbody = document.querySelector('#decisionsTable tbody');
        if (!tbody) return;

        tbody.innerHTML = this.data.decisions.map(decision => `
            <tr>
                <td>${decision.id}</td>
                <td>${decision.proposal_id}</td>
                <td>
                    <span class="action-badge ${decision.action}">
                        ${this.getActionName(decision.action)}
                    </span>
                </td>
                <td>
                    <div class="confidence-bar">
                        <div class="confidence-fill" style="width: ${decision.confidence * 100}%"></div>
                        <span class="confidence-value">${(decision.confidence * 100).toFixed(0)}%</span>
                    </div>
                </td>
                <td>${(decision.size_adjustment * 100).toFixed(0)}%</td>
                <td>${this.formatTime(decision.created_at)}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="dashboard.showDecisionDetail('${decision.id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    updateOutcomesTable() {
        const tbody = document.querySelector('#outcomesTable tbody');
        if (!tbody) return;

        tbody.innerHTML = this.data.outcomes.map(outcome => `
            <tr>
                <td>${outcome.id}</td>
                <td>${outcome.proposal_id}</td>
                <td class="${outcome.return_pct >= 0 ? 'positive' : 'negative'}">
                    ${(outcome.return_pct * 100).toFixed(2)}%
                </td>
                <td>${outcome.sharpe_ratio.toFixed(2)}</td>
                <td>${(outcome.max_drawdown * 100).toFixed(1)}%</td>
                <td>${this.formatTime(outcome.created_at)}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="dashboard.showOutcomeDetail('${outcome.id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    initializeCharts() {
        this.initializeSignalsChart();
        this.initializeProposalsChart();
        this.initializePerformanceChart();
        this.initializeRiskChart();
        this.initializeSourceDistributionChart();
        this.initializeAssetPerformanceChart();
    }

    initializeSignalsChart() {
        const ctx = document.getElementById('signalsChart');
        if (!ctx) return;

        this.charts.signals = new Chart(ctx, {
            type: 'line',
            data: {
                labels: this.generateTimeLabels(24),
                datasets: [{
                    label: 'Signale',
                    data: this.generateRandomData(24, 50, 150),
                    borderColor: '#3B82F6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    initializeProposalsChart() {
        const ctx = document.getElementById('proposalsChart');
        if (!ctx) return;

        this.charts.proposals = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Vorgeschlagen', 'Genehmigt', 'Abgelehnt', 'Ausgeführt'],
                datasets: [{
                    data: [15, 20, 5, 10],
                    backgroundColor: [
                        '#3B82F6',
                        '#10B981',
                        '#EF4444',
                        '#F59E0B'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }

    initializePerformanceChart() {
        const ctx = document.getElementById('performanceChart');
        if (!ctx) return;

        this.charts.performance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: this.generateTimeLabels(30),
                datasets: [{
                    label: 'Kumulative Rendite',
                    data: this.generateRandomData(30, -0.1, 0.3),
                    borderColor: '#10B981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return (value * 100).toFixed(1) + '%';
                            }
                        }
                    }
                }
            }
        });
    }

    initializeRiskChart() {
        const ctx = document.getElementById('riskChart');
        if (!ctx) return;

        this.charts.risk = new Chart(ctx, {
            type: 'line',
            data: {
                labels: this.generateTimeLabels(30),
                datasets: [{
                    label: 'VaR (95%)',
                    data: this.generateRandomData(30, 0.05, 0.15),
                    borderColor: '#EF4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    tension: 0.4
                }, {
                    label: 'CVaR (95%)',
                    data: this.generateRandomData(30, 0.08, 0.20),
                    borderColor: '#F59E0B',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return (value * 100).toFixed(1) + '%';
                            }
                        }
                    }
                }
            }
        });
    }

    initializeSourceDistributionChart() {
        const ctx = document.getElementById('sourceDistributionChart');
        if (!ctx) return;

        this.charts.sourceDistribution = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Twitter', 'Reddit', 'YouTube', 'LinkedIn', 'Reuters', 'Bloomberg'],
                datasets: [{
                    data: [30, 25, 20, 15, 5, 5],
                    backgroundColor: [
                        '#1DA1F2',
                        '#FF4500',
                        '#FF0000',
                        '#0077B5',
                        '#FF6B35',
                        '#000000'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }

    initializeAssetPerformanceChart() {
        const ctx = document.getElementById('assetPerformanceChart');
        if (!ctx) return;

        this.charts.assetPerformance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['BTC', 'ETH', 'AAPL', 'GOOGL', 'MSFT'],
                datasets: [{
                    label: 'Rendite (%)',
                    data: [12.5, 8.3, 5.2, 7.1, 4.8],
                    backgroundColor: [
                        '#F7931A',
                        '#627EEA',
                        '#0071DC',
                        '#4285F4',
                        '#00BCF2'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return value.toFixed(1) + '%';
                            }
                        }
                    }
                }
            }
        });
    }

    // Navigation methods
    navigateToSection(section) {
        // Update active menu item
        document.querySelectorAll('.menu-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-section="${section}"]`).classList.add('active');

        // Show/hide sections
        document.querySelectorAll('.dashboard-section').forEach(sec => {
            sec.classList.remove('active');
        });
        document.getElementById(section).classList.add('active');

        this.currentSection = section;
    }

    // Data refresh methods
    async refreshAllData() {
        this.showLoading();
        try {
            await this.loadDashboardData();
            this.showSuccess('Daten erfolgreich aktualisiert');
        } catch (error) {
            this.showError('Fehler beim Aktualisieren der Daten');
        } finally {
            this.hideLoading();
        }
    }

    async refreshSignals() {
        try {
            await this.loadSignals();
            this.updateSignalsTable();
        } catch (error) {
            this.showError('Fehler beim Laden der Signale');
        }
    }

    async refreshProposals() {
        try {
            await this.loadProposals();
            this.updateProposalsGrid();
        } catch (error) {
            this.showError('Fehler beim Laden der Vorschläge');
        }
    }

    async refreshDecisions() {
        try {
            await this.loadDecisions();
            this.updateDecisionsTable();
        } catch (error) {
            this.showError('Fehler beim Laden der Entscheidungen');
        }
    }

    async refreshOutcomes() {
        try {
            await this.loadOutcomes();
            this.updateOutcomesTable();
        } catch (error) {
            this.showError('Fehler beim Laden der Ergebnisse');
        }
    }

    // Action methods
    async ingestSignals() {
        this.showLoading();
        try {
            const response = await this.apiPost('/ingestion/social', {
                sources: ['twitter', 'reddit', 'youtube', 'linkedin'],
                timeframe: '24h',
                userId: 'admin'
            });
            
            if (response.ok) {
                this.showSuccess(`${response.data.processed} Signale verarbeitet`);
                await this.refreshSignals();
            }
        } catch (error) {
            this.showError('Fehler beim Laden der Signale');
        } finally {
            this.hideLoading();
        }
    }

    async generateProposal() {
        this.showLoading();
        try {
            const response = await this.apiPost('/orchestrator/propose', {
                signals: this.data.signals.slice(0, 10),
                assets: ['BTC', 'ETH'],
                timeframe: '7d',
                userId: 'admin'
            });
            
            if (response.ok) {
                this.showSuccess('Vorschlag erfolgreich generiert');
                await this.refreshProposals();
            }
        } catch (error) {
            this.showError('Fehler beim Generieren des Vorschlags');
        } finally {
            this.hideLoading();
        }
    }

    async performRiskCheck() {
        this.showLoading();
        try {
            const response = await this.apiPost('/orchestrator/risk/check', {
                proposal: this.data.proposals[0],
                assets: ['BTC', 'ETH'],
                userId: 'admin'
            });
            
            if (response.ok) {
                this.showSuccess('Risikoanalyse abgeschlossen');
                this.updateRiskMetrics(response.data);
            }
        } catch (error) {
            this.showError('Fehler bei der Risikoanalyse');
        } finally {
            this.hideLoading();
        }
    }

    async generateInsights() {
        this.showLoading();
        try {
            // Simulate insight generation
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const insights = [
                'Bitcoin Signale zeigen steigende Tendenz',
                'Ethereum Adoption nimmt zu',
                'Institutionelle Investoren werden aktiver',
                'Risiko-Management funktioniert effektiv'
            ];
            
            this.updateInsights(insights);
            this.showSuccess('Insights erfolgreich generiert');
        } catch (error) {
            this.showError('Fehler beim Generieren der Insights');
        } finally {
            this.hideLoading();
        }
    }

    // Utility methods
    formatTime(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleString('de-DE');
    }

    getSourceName(source) {
        const names = {
            twitter: 'Twitter',
            reddit: 'Reddit',
            youtube: 'YouTube',
            linkedin: 'LinkedIn',
            reuters: 'Reuters',
            bloomberg: 'Bloomberg',
            ft: 'Financial Times',
            wsj: 'Wall Street Journal'
        };
        return names[source] || source;
    }

    getStatusName(status) {
        const names = {
            proposed: 'Vorgeschlagen',
            approved: 'Genehmigt',
            rejected: 'Abgelehnt',
            executed: 'Ausgeführt',
            closed: 'Geschlossen'
        };
        return names[status] || status;
    }

    getActionName(action) {
        const names = {
            approve: 'Genehmigt',
            reject: 'Abgelehnt',
            reduce_size: 'Größe reduziert',
            diversify: 'Diversifiziert',
            modify: 'Modifiziert'
        };
        return names[action] || action;
    }

    getRiskLevel(riskScore) {
        if (riskScore < 0.3) return 'low';
        if (riskScore < 0.7) return 'medium';
        return 'high';
    }

    generateTimeLabels(count) {
        const labels = [];
        const now = new Date();
        for (let i = count - 1; i >= 0; i--) {
            const date = new Date(now.getTime() - i * 60 * 60 * 1000);
            labels.push(date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }));
        }
        return labels;
    }

    generateRandomData(count, min, max) {
        const data = [];
        for (let i = 0; i < count; i++) {
            data.push(Math.random() * (max - min) + min);
        }
        return data;
    }

    // UI methods
    showLoading() {
        document.getElementById('loadingOverlay').style.display = 'flex';
    }

    hideLoading() {
        document.getElementById('loadingOverlay').style.display = 'none';
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Modal methods
    showSignalDetail(signalId) {
        const signal = this.data.signals.find(s => s.id === signalId);
        if (!signal) return;

        const content = `
            <div class="signal-detail">
                <h4>Signal Details</h4>
                <div class="detail-section">
                    <label>ID:</label>
                    <span>${signal.id}</span>
                </div>
                <div class="detail-section">
                    <label>Quelle:</label>
                    <span>${this.getSourceName(signal.source)}</span>
                </div>
                <div class="detail-section">
                    <label>Inhalt:</label>
                    <p>${signal.content}</p>
                </div>
                <div class="detail-section">
                    <label>Scores:</label>
                    <div class="scores-grid">
                        <div class="score-item">
                            <span>Fused:</span>
                            <span>${(signal.scores.fused * 100).toFixed(1)}%</span>
                        </div>
                        <div class="score-item">
                            <span>Sentiment:</span>
                            <span>${(signal.scores.sentiment * 100).toFixed(1)}%</span>
                        </div>
                        <div class="score-item">
                            <span>Relevance:</span>
                            <span>${(signal.scores.relevance * 100).toFixed(1)}%</span>
                        </div>
                        <div class="score-item">
                            <span>Novelty:</span>
                            <span>${(signal.scores.novelty * 100).toFixed(1)}%</span>
                        </div>
                        <div class="score-item">
                            <span>Credibility:</span>
                            <span>${(signal.scores.credibility * 100).toFixed(1)}%</span>
                        </div>
                    </div>
                </div>
                <div class="detail-section">
                    <label>Zeitstempel:</label>
                    <span>${this.formatTime(signal.timestamp)}</span>
                </div>
            </div>
        `;

        document.getElementById('signalDetailContent').innerHTML = content;
        document.getElementById('signalDetailModal').style.display = 'block';
    }

    showProposalDetail(proposalId) {
        const proposal = this.data.proposals.find(p => p.id === proposalId);
        if (!proposal) return;

        const content = `
            <div class="proposal-detail">
                <h4>Vorschlag Details</h4>
                <div class="detail-section">
                    <label>ID:</label>
                    <span>${proposal.id}</span>
                </div>
                <div class="detail-section">
                    <label>Assets:</label>
                    <span>${proposal.assets.join(', ')}</span>
                </div>
                <div class="detail-section">
                    <label>Thesis:</label>
                    <p>${proposal.thesis}</p>
                </div>
                <div class="detail-section">
                    <label>Größe:</label>
                    <span>${(proposal.size_pct * 100).toFixed(1)}%</span>
                </div>
                <div class="detail-section">
                    <label>Horizont:</label>
                    <span>${proposal.horizon_days} Tage</span>
                </div>
                <div class="detail-section">
                    <label>Risiko Score:</label>
                    <span class="risk-${this.getRiskLevel(proposal.risk_score)}">
                        ${(proposal.risk_score * 100).toFixed(1)}%
                    </span>
                </div>
                <div class="detail-section">
                    <label>Erwartete Rendite:</label>
                    <span>${(proposal.expected_return * 100).toFixed(1)}%</span>
                </div>
                <div class="detail-section">
                    <label>Sharpe Ratio:</span>
                    <span>${proposal.sharpe_ratio.toFixed(2)}</span>
                </div>
            </div>
        `;

        document.getElementById('proposalDetailContent').innerHTML = content;
        document.getElementById('proposalDetailModal').style.display = 'block';
    }

    // Settings methods
    switchSettingsTab(tab) {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');

        document.querySelectorAll('.settings-tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tab).classList.add('active');
    }

    saveSettings() {
        const settings = {
            systemName: document.getElementById('systemName').value,
            timezone: document.getElementById('timezone').value,
            language: document.getElementById('language').value,
            maxRisk: document.getElementById('maxRisk').value,
            varConfidence: document.getElementById('varConfidence').value,
            stopLoss: document.getElementById('stopLoss').value,
            emailNotifications: document.getElementById('emailNotifications').checked,
            riskAlerts: document.getElementById('riskAlerts').checked,
            performanceAlerts: document.getElementById('performanceAlerts').checked,
            apiEndpoint: document.getElementById('apiEndpoint').value,
            apiKey: document.getElementById('apiKey').value,
            rateLimit: document.getElementById('rateLimit').value
        };

        localStorage.setItem('ai_investment_settings', JSON.stringify(settings));
        this.showSuccess('Einstellungen gespeichert');
    }

    resetSettings() {
        if (confirm('Alle Einstellungen zurücksetzen?')) {
            localStorage.removeItem('ai_investment_settings');
            location.reload();
        }
    }

    // Real-time updates
    setupRealTimeUpdates() {
        // Update data every 30 seconds
        setInterval(() => {
            this.refreshAllData();
        }, 30000);
    }

    // Filter methods
    filterSignals() {
        // Implementation for signal filtering
        console.log('Filtering signals...');
    }

    filterProposals() {
        // Implementation for proposal filtering
        console.log('Filtering proposals...');
    }

    // Pagination methods
    previousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.loadSignals();
        }
    }

    nextPage() {
        this.currentPage++;
        this.loadSignals();
    }

    // Update methods
    updateTimeRange(timeRange) {
        console.log('Updating time range:', timeRange);
        // Implementation for time range updates
    }

    updateRiskMetrics(riskData) {
        document.getElementById('var95').textContent = (riskData.var.historical * 100).toFixed(1) + '%';
        document.getElementById('cvar95').textContent = (riskData.cvar.historical * 100).toFixed(1) + '%';
        document.getElementById('volatility').textContent = (riskData.volatility * 100).toFixed(1) + '%';
        document.getElementById('correlation').textContent = riskData.correlation.toFixed(2);
    }

    updateInsights(insights) {
        const container = document.getElementById('insightsList');
        if (!container) return;

        container.innerHTML = insights.map(insight => `
            <div class="insight-item">
                <i class="fas fa-lightbulb"></i>
                <span>${insight}</span>
            </div>
        `).join('');
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new AIInvestmentDashboard();
});
