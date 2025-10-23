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
        // Tab Navigation - mit Debug-Logging
        const tabButtons = document.querySelectorAll('.tab-btn');
        console.log('Setting up tab listeners for', tabButtons.length, 'buttons');
        
        tabButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const tabId = e.currentTarget.dataset.tab;
                console.log('Tab clicked:', tabId);
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
        
        // Start Analysis Button
        const startAnalysisBtn = document.getElementById('startAnalysis');
        if (startAnalysisBtn) {
            startAnalysisBtn.addEventListener('click', () => {
                this.startAnalysis();
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
        console.log('Switching to tab:', tabId);
        
        // Tab Buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        const activeBtn = document.querySelector(`[data-tab="${tabId}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
            console.log('Tab button activated:', tabId);
        } else {
            console.error('Tab button not found:', tabId);
        }
        
        // Tab Content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        const activeContent = document.getElementById(`${tabId}-tab`);
        if (activeContent) {
            activeContent.classList.add('active');
            console.log('Tab content activated:', tabId);
        } else {
            console.error('Tab content not found:', `${tabId}-tab`);
        }
        
        // Charts aktualisieren wenn Analytics Tab
        if (tabId === 'analytics') {
            this.updateCharts();
        }
        
        // Tab-spezifische Aktionen
        this.handleTabSwitch(tabId);
    }
    
    /**
     * Tab-spezifische Aktionen
     */
    handleTabSwitch(tabId) {
        switch(tabId) {
            case 'signals':
                this.loadSignalsData();
                break;
            case 'proposals':
                this.loadProposalsData();
                break;
            case 'decisions':
                this.loadDecisionsData();
                break;
            case 'analytics':
                this.loadAnalyticsData();
                break;
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
    
    /**
     * Analyse starten
     */
    async startAnalysis() {
        console.log('Starting analysis...');
        
        // UI für Analyse-Status anzeigen
        this.showAnalysisStatus();
        
        try {
            // Schritt 1: Signale sammeln
            await this.collectSignals();
            
            // Schritt 2: Signale analysieren
            await this.analyzeSignals();
            
            // Schritt 3: Vorschläge generieren
            await this.generateProposals();
            
            // Schritt 4: Analyse abschließen
            await this.completeAnalysis();
            
        } catch (error) {
            console.error('Analysis failed:', error);
            this.showAnalysisError(error);
        }
    }
    
    /**
     * Analyse-Status anzeigen
     */
    showAnalysisStatus() {
        const statusDiv = document.getElementById('analysisStatus');
        if (statusDiv) {
            statusDiv.style.display = 'block';
        }
        
        // Button deaktivieren
        const startBtn = document.getElementById('startAnalysis');
        if (startBtn) {
            startBtn.disabled = true;
            startBtn.innerHTML = '<i class="fas fa-cog fa-spin"></i> Analyse läuft...';
        }
    }
    
    /**
     * Signale sammeln
     */
    async collectSignals() {
        this.updateAnalysisProgress('Signale werden gesammelt...', 25);
        
        // Simuliere Signale sammeln
        await this.delay(2000);
        
        // Mock Signale hinzufügen
        const newSignals = [
            {
                id: `signal-${Date.now()}-1`,
                source: 'twitter',
                content: 'Tesla announces new battery technology breakthrough',
                score: 0.92,
                confidence: 0.95,
                timestamp: new Date().toISOString(),
                metadata: { author: '@tesla_news', followers: 50000 }
            },
            {
                id: `signal-${Date.now()}-2`,
                source: 'reddit',
                content: 'Apple stock showing strong momentum after earnings',
                score: 0.88,
                confidence: 0.90,
                timestamp: new Date().toISOString(),
                metadata: { subreddit: 'investing', upvotes: 250 }
            },
            {
                id: `signal-${Date.now()}-3`,
                source: 'news',
                content: 'Federal Reserve hints at interest rate changes',
                score: 0.75,
                confidence: 0.85,
                timestamp: new Date().toISOString(),
                metadata: { source: 'Reuters', category: 'economics' }
            }
        ];
        
        this.data.signals.push(...newSignals);
        console.log('Signals collected:', newSignals.length);
    }
    
    /**
     * Signale analysieren
     */
    async analyzeSignals() {
        this.updateAnalysisProgress('Signale werden analysiert...', 50);
        
        // Simuliere Analyse
        await this.delay(1500);
        
        console.log('Signals analyzed');
    }
    
    /**
     * Vorschläge generieren
     */
    async generateProposals() {
        this.updateAnalysisProgress('Investment-Vorschläge werden generiert...', 75);
        
        // Simuliere Vorschlag-Generierung
        await this.delay(2000);
        
        // Mock Vorschläge generieren
        const newProposals = [
            {
                id: `proposal-${Date.now()}-1`,
                signalId: this.data.signals[this.data.signals.length - 3].id,
                asset: 'TSLA',
                action: 'buy',
                amount: 15,
                price: 280.00,
                riskScore: 0.25,
                timestamp: new Date().toISOString(),
                status: 'pending',
                reasoning: 'Strong positive sentiment from Tesla battery breakthrough'
            },
            {
                id: `proposal-${Date.now()}-2`,
                signalId: this.data.signals[this.data.signals.length - 2].id,
                asset: 'AAPL',
                action: 'buy',
                amount: 20,
                price: 190.00,
                riskScore: 0.30,
                timestamp: new Date().toISOString(),
                status: 'pending',
                reasoning: 'Apple showing strong momentum after earnings beat'
            }
        ];
        
        this.data.proposals.push(...newProposals);
        console.log('Proposals generated:', newProposals.length);
    }
    
    /**
     * Analyse abschließen
     */
    async completeAnalysis() {
        this.updateAnalysisProgress('Analyse wird abgeschlossen...', 100);
        
        // Simuliere Abschluss
        await this.delay(1000);
        
        // UI aktualisieren
        this.updateUI();
        
        // Status verstecken
        this.hideAnalysisStatus();
        
        // Erfolgsmeldung
        this.showAnalysisSuccess();
        
        console.log('Analysis completed successfully');
    }
    
    /**
     * Analyse-Status aktualisieren
     */
    updateAnalysisProgress(message, progress) {
        const progressText = document.getElementById('analysisProgress');
        const progressFill = document.getElementById('progressFill');
        
        if (progressText) {
            progressText.textContent = message;
        }
        
        if (progressFill) {
            progressFill.style.width = `${progress}%`;
        }
    }
    
    /**
     * Analyse-Status verstecken
     */
    hideAnalysisStatus() {
        const statusDiv = document.getElementById('analysisStatus');
        if (statusDiv) {
            statusDiv.style.display = 'none';
        }
        
        // Button zurücksetzen
        const startBtn = document.getElementById('startAnalysis');
        if (startBtn) {
            startBtn.disabled = false;
            startBtn.innerHTML = '<i class="fas fa-play"></i> Analyse starten';
        }
    }
    
    /**
     * Analyse-Erfolg anzeigen
     */
    showAnalysisSuccess() {
        // Toast-Nachricht oder Modal
        const successDiv = document.createElement('div');
        successDiv.className = 'analysis-success';
        successDiv.innerHTML = `
            <div class="success-content">
                <i class="fas fa-check-circle"></i>
                <h3>Analyse abgeschlossen!</h3>
                <p>${this.data.signals.length} Signale verarbeitet, ${this.data.proposals.length} Vorschläge generiert</p>
            </div>
        `;
        
        document.body.appendChild(successDiv);
        
        // Nach 3 Sekunden entfernen
        setTimeout(() => {
            if (successDiv.parentNode) {
                successDiv.parentNode.removeChild(successDiv);
            }
        }, 3000);
    }
    
    /**
     * Analyse-Fehler anzeigen
     */
    showAnalysisError(error) {
        console.error('Analysis error:', error);
        this.hideAnalysisStatus();
        
        // Fehler-Nachricht
        alert(`Analyse fehlgeschlagen: ${error.message}`);
    }
    
    /**
     * Delay-Funktion für Simulation
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    /**
     * Tab-spezifische Daten laden
     */
    loadSignalsData() {
        console.log('Loading signals data...');
        this.updateSignalsList();
    }
    
    loadProposalsData() {
        console.log('Loading proposals data...');
        this.updateProposalsList();
    }
    
    loadDecisionsData() {
        console.log('Loading decisions data...');
        this.updateDecisionsList();
    }
    
    loadAnalyticsData() {
        console.log('Loading analytics data...');
        this.updateCharts();
    }
}

// Global verfügbar machen
window.AIInvestmentSection = AIInvestmentSection;

// Auto-Bootstrapping: initialisiert, sobald das Section-Template im DOM ist
(function bootstrapAIInvestment() {
    const tryInit = () => {
        // Prüfen ob AI Investment Section im DOM ist
        const hasAISection = document.querySelector('.ai-investments-section');
        if (hasAISection) {
            if (!window.aiInvestmentSection) {
                console.log('Auto-initializing AI Investment Section...');
                window.aiInvestmentSection = new AIInvestmentSection();
                window.aiInvestmentSection.init();
            }
            return; // fertig
        }
        
        // Retry nach 100ms
        setTimeout(tryInit, 100);
    };
    
    // Starten sobald DOM bereit ist
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', tryInit);
    } else {
        tryInit();
    }
})();