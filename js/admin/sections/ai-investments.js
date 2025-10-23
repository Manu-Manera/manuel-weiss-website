/**
 * AI Investment System Section
 * Verwaltung des AI Investment Systems
 */
class AIInvestmentSection {
    constructor() {
        this.data = {
            signals: [],
            proposals: [],
            decisions: [],
            analytics: {}
        };
        this.charts = {};
        this.initialized = false;
    }
    
    /**
     * Section initialisieren
     */
    async init() {
        if (this.initialized) return;
        
        console.log('Initializing AI Investment Section...');
        
        try {
            // Event Listeners setzen
            this.setupEventListeners();
            
            // Daten laden
            await this.loadData();
            
            // Charts initialisieren
            this.initializeCharts();
            
            // UI aktualisieren
            this.updateUI();
            
            this.initialized = true;
            console.log('AI Investment Section initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize AI Investment Section:', error);
        }
    }
    
    /**
     * Event Listeners setzen
     */
    setupEventListeners() {
        // Tab Navigation
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabId = e.currentTarget.dataset.tab;
                this.switchTab(tabId);
            });
        });
        
        // Refresh Button
        const refreshBtn = document.getElementById('refreshData');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.refreshData();
            });
        }
        
        // Export Button
        const exportBtn = document.getElementById('exportData');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportData();
            });
        }
        
        // Filter Event Listeners
        this.setupFilters();
    }
    
    /**
     * Filter Event Listeners setzen
     */
    setupFilters() {
        // Signal Filters
        const signalSource = document.getElementById('signalSource');
        const signalScore = document.getElementById('signalScore');
        
        if (signalSource) {
            signalSource.addEventListener('change', () => {
                this.filterSignals();
            });
        }
        
        if (signalScore) {
            signalScore.addEventListener('change', () => {
                this.filterSignals();
            });
        }
        
        // Proposal Filters
        const proposalStatus = document.getElementById('proposalStatus');
        if (proposalStatus) {
            proposalStatus.addEventListener('change', () => {
                this.filterProposals();
            });
        }
        
        // Decision Filters
        const decisionStatus = document.getElementById('decisionStatus');
        if (decisionStatus) {
            decisionStatus.addEventListener('change', () => {
                this.filterDecisions();
            });
        }
    }
    
    /**
     * Tab wechseln
     */
    switchTab(tabId) {
        // Tab Buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
        
        // Tab Content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabId}-tab`).classList.add('active');
        
        // Charts aktualisieren wenn Analytics Tab
        if (tabId === 'analytics') {
            this.updateCharts();
        }
    }
    
    /**
     * Daten laden
     */
    async loadData() {
        try {
            // Mock Data für Demo
            this.data = {
                signals: [
                    {
                        id: 'signal-1',
                        source: 'twitter',
                        content: 'Tesla stock showing strong momentum',
                        score: 0.85,
                        confidence: 0.92,
                        timestamp: new Date().toISOString(),
                        metadata: { author: '@trader123', followers: 10000 }
                    },
                    {
                        id: 'signal-2',
                        source: 'reddit',
                        content: 'Apple earnings beat expectations',
                        score: 0.78,
                        confidence: 0.88,
                        timestamp: new Date().toISOString(),
                        metadata: { subreddit: 'investing', upvotes: 150 }
                    }
                ],
                proposals: [
                    {
                        id: 'proposal-1',
                        signalId: 'signal-1',
                        asset: 'TSLA',
                        action: 'buy',
                        amount: 10,
                        price: 250.00,
                        riskScore: 0.3,
                        timestamp: new Date().toISOString(),
                        status: 'pending'
                    }
                ],
                decisions: [
                    {
                        id: 'decision-1',
                        proposalId: 'proposal-1',
                        action: 'execute',
                        timestamp: new Date().toISOString(),
                        result: 'success'
                    }
                ],
                analytics: {
                    totalReturns: 12.5,
                    winRate: 0.75,
                    sharpeRatio: 1.8
                }
            };
            
            console.log('Data loaded successfully');
            
        } catch (error) {
            console.error('Failed to load data:', error);
        }
    }
    
    /**
     * UI aktualisieren
     */
    updateUI() {
        this.updateStats();
        this.updateSignalsList();
        this.updateProposalsList();
        this.updateDecisionsList();
    }
    
    /**
     * Statistiken aktualisieren
     */
    updateStats() {
        document.getElementById('totalSignals').textContent = this.data.signals.length;
        document.getElementById('totalProposals').textContent = this.data.proposals.length;
        document.getElementById('totalDecisions').textContent = this.data.decisions.length;
        document.getElementById('totalReturns').textContent = `${this.data.analytics.totalReturns}%`;
    }
    
    /**
     * Signale Liste aktualisieren
     */
    updateSignalsList() {
        const container = document.getElementById('signalsList');
        if (!container) return;
        
        container.innerHTML = this.data.signals.map(signal => `
            <div class="signal-item">
                <div class="signal-header">
                    <span class="signal-source">${signal.source}</span>
                    <span class="signal-score">${(signal.score * 100).toFixed(1)}%</span>
                </div>
                <div class="signal-content">${signal.content}</div>
                <div class="signal-meta">
                    <span class="signal-time">${new Date(signal.timestamp).toLocaleString()}</span>
                    <span class="signal-confidence">Confidence: ${(signal.confidence * 100).toFixed(1)}%</span>
                </div>
            </div>
        `).join('');
    }
    
    /**
     * Proposals Liste aktualisieren
     */
    updateProposalsList() {
        const container = document.getElementById('proposalsList');
        if (!container) return;
        
        container.innerHTML = this.data.proposals.map(proposal => `
            <div class="proposal-item">
                <div class="proposal-header">
                    <span class="proposal-asset">${proposal.asset}</span>
                    <span class="proposal-action">${proposal.action.toUpperCase()}</span>
                </div>
                <div class="proposal-details">
                    <span>Amount: ${proposal.amount}</span>
                    <span>Price: $${proposal.price}</span>
                    <span>Risk: ${(proposal.riskScore * 100).toFixed(1)}%</span>
                </div>
                <div class="proposal-status">${proposal.status}</div>
            </div>
        `).join('');
    }
    
    /**
     * Decisions Liste aktualisieren
     */
    updateDecisionsList() {
        const container = document.getElementById('decisionsList');
        if (!container) return;
        
        container.innerHTML = this.data.decisions.map(decision => `
            <div class="decision-item">
                <div class="decision-header">
                    <span class="decision-id">${decision.id}</span>
                    <span class="decision-result">${decision.result}</span>
                </div>
                <div class="decision-details">
                    <span>Action: ${decision.action}</span>
                    <span>Time: ${new Date(decision.timestamp).toLocaleString()}</span>
                </div>
            </div>
        `).join('');
    }
    
    /**
     * Charts initialisieren
     */
    initializeCharts() {
        // Performance Chart
        const performanceCtx = document.getElementById('performanceChart');
        if (performanceCtx) {
            this.charts.performance = new Chart(performanceCtx, {
                type: 'line',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    datasets: [{
                        label: 'Portfolio Value',
                        data: [100, 105, 110, 108, 115, 120],
                        borderColor: '#6366f1',
                        backgroundColor: 'rgba(99, 102, 241, 0.1)',
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            display: false
                        }
                    }
                }
            });
        }
        
        // Signal Distribution Chart
        const signalDistCtx = document.getElementById('signalDistributionChart');
        if (signalDistCtx) {
            this.charts.signalDistribution = new Chart(signalDistCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Twitter', 'Reddit', 'News'],
                    datasets: [{
                        data: [40, 35, 25],
                        backgroundColor: ['#6366f1', '#10b981', '#f59e0b']
                    }]
                },
                options: {
                    responsive: true
                }
            });
        }
        
        // Risk Analysis Chart
        const riskCtx = document.getElementById('riskAnalysisChart');
        if (riskCtx) {
            this.charts.riskAnalysis = new Chart(riskCtx, {
                type: 'bar',
                data: {
                    labels: ['Low Risk', 'Medium Risk', 'High Risk'],
                    datasets: [{
                        label: 'Investments',
                        data: [15, 8, 3],
                        backgroundColor: ['#10b981', '#f59e0b', '#ef4444']
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            display: false
                        }
                    }
                }
            });
        }
    }
    
    /**
     * Charts aktualisieren
     */
    updateCharts() {
        // Charts werden bei Bedarf aktualisiert
        console.log('Updating charts...');
    }
    
    /**
     * Signale filtern
     */
    filterSignals() {
        const source = document.getElementById('signalSource')?.value;
        const score = document.getElementById('signalScore')?.value;
        
        let filtered = this.data.signals;
        
        if (source && source !== 'all') {
            filtered = filtered.filter(signal => signal.source === source);
        }
        
        if (score && score !== 'all') {
            filtered = filtered.filter(signal => {
                if (score === 'high') return signal.score > 0.8;
                if (score === 'medium') return signal.score >= 0.5 && signal.score <= 0.8;
                if (score === 'low') return signal.score < 0.5;
                return true;
            });
        }
        
        // UI aktualisieren
        const container = document.getElementById('signalsList');
        if (container) {
            container.innerHTML = filtered.map(signal => `
                <div class="signal-item">
                    <div class="signal-header">
                        <span class="signal-source">${signal.source}</span>
                        <span class="signal-score">${(signal.score * 100).toFixed(1)}%</span>
                    </div>
                    <div class="signal-content">${signal.content}</div>
                    <div class="signal-meta">
                        <span class="signal-time">${new Date(signal.timestamp).toLocaleString()}</span>
                        <span class="signal-confidence">Confidence: ${(signal.confidence * 100).toFixed(1)}%</span>
                    </div>
                </div>
            `).join('');
        }
    }
    
    /**
     * Proposals filtern
     */
    filterProposals() {
        const status = document.getElementById('proposalStatus')?.value;
        
        let filtered = this.data.proposals;
        
        if (status && status !== 'all') {
            filtered = filtered.filter(proposal => proposal.status === status);
        }
        
        // UI aktualisieren
        const container = document.getElementById('proposalsList');
        if (container) {
            container.innerHTML = filtered.map(proposal => `
                <div class="proposal-item">
                    <div class="proposal-header">
                        <span class="proposal-asset">${proposal.asset}</span>
                        <span class="proposal-action">${proposal.action.toUpperCase()}</span>
                    </div>
                    <div class="proposal-details">
                        <span>Amount: ${proposal.amount}</span>
                        <span>Price: $${proposal.price}</span>
                        <span>Risk: ${(proposal.riskScore * 100).toFixed(1)}%</span>
                    </div>
                    <div class="proposal-status">${proposal.status}</div>
                </div>
            `).join('');
        }
    }
    
    /**
     * Decisions filtern
     */
    filterDecisions() {
        const status = document.getElementById('decisionStatus')?.value;
        
        let filtered = this.data.decisions;
        
        if (status && status !== 'all') {
            filtered = filtered.filter(decision => decision.result === status);
        }
        
        // UI aktualisieren
        const container = document.getElementById('decisionsList');
        if (container) {
            container.innerHTML = filtered.map(decision => `
                <div class="decision-item">
                    <div class="decision-header">
                        <span class="decision-id">${decision.id}</span>
                        <span class="decision-result">${decision.result}</span>
                    </div>
                    <div class="decision-details">
                        <span>Action: ${decision.action}</span>
                        <span>Time: ${new Date(decision.timestamp).toLocaleString()}</span>
                    </div>
                </div>
            `).join('');
        }
    }
    
    /**
     * Daten aktualisieren
     */
    async refreshData() {
        console.log('Refreshing data...');
        await this.loadData();
        this.updateUI();
    }
    
    /**
     * Daten exportieren
     */
    exportData() {
        const dataStr = JSON.stringify(this.data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `ai-investment-data-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
    }
}

// Global verfügbar machen
window.AIInvestmentSection = AIInvestmentSection;