/**
 * AI Investment System Section Module
 * Vollständige Integration des AI Investment Systems in das Admin Panel
 */
class AIInvestmentSection {
    constructor() {
        this.stateManager = null;
        this.initialized = false;
        this.realTimeConnection = null;
        this.dashboardData = {
            signals: [],
            proposals: [],
            outcomes: [],
            metrics: {}
        };
    }
    
    /**
     * Section initialisieren
     */
    init() {
        if (this.initialized) return;
        
        // Dependencies prüfen
        if (window.AdminApp && window.AdminApp.stateManager) {
            this.stateManager = window.AdminApp.stateManager;
        }
        
        // AI Investment Dashboard laden
        this.loadAIDashboard();
        
        // Real-time Connection aufbauen
        this.establishRealTimeConnection();
        
        // Event Listeners hinzufügen
        this.attachEventListeners();
        
        this.initialized = true;
        console.log('AI Investment Section initialized');
    }
    
    /**
     * AI Investment Dashboard laden
     */
    async loadAIDashboard() {
        try {
            // Dashboard HTML generieren
            const dashboardHTML = this.generateDashboardHTML();
            
            // Content Container finden und befüllen
            const contentContainer = document.getElementById('admin-content');
            if (contentContainer) {
                contentContainer.innerHTML = dashboardHTML;
            }
            
            // Dashboard Daten laden
            await this.loadDashboardData();
            
            // Charts initialisieren
            this.initializeCharts();
            
        } catch (error) {
            console.error('Failed to load AI Investment Dashboard:', error);
            this.showError('Fehler beim Laden des AI Investment Dashboards');
        }
    }
    
    /**
     * Dashboard HTML generieren
     */
    generateDashboardHTML() {
        return `
            <div class="ai-investment-dashboard">
                <!-- Header -->
                <div class="dashboard-header">
                    <div class="header-content">
                        <h1 class="dashboard-title">
                            <i class="fas fa-robot"></i>
                            AI Investment System
                        </h1>
                        <p class="dashboard-subtitle">
                            Intelligente Investment-Entscheidungen basierend auf KI-Analyse
                        </p>
                    </div>
                    <div class="header-actions">
                        <button class="btn btn-primary" onclick="aiInvestment.refreshDashboard()">
                            <i class="fas fa-sync-alt"></i>
                            Aktualisieren
                        </button>
                        <button class="btn btn-secondary" onclick="aiInvestment.showSettings()">
                            <i class="fas fa-cog"></i>
                            Einstellungen
                        </button>
                    </div>
                </div>
                
                <!-- Status Banner -->
                <div class="status-banner" id="statusBanner">
                    <div class="status-content">
                        <i class="fas fa-info-circle"></i>
                        <span>System läuft normal - Letzte Aktualisierung: <span id="lastUpdate">--</span></span>
                    </div>
                </div>
                
                <!-- Main Dashboard Grid -->
                <div class="dashboard-grid">
                    <!-- Live Signals -->
                    <div class="dashboard-card signals-card">
                        <div class="card-header">
                            <h3><i class="fas fa-signal"></i> Live Signals</h3>
                            <div class="card-actions">
                                <button class="btn-icon" onclick="aiInvestment.toggleSignalsFilter()">
                                    <i class="fas fa-filter"></i>
                                </button>
                                <button class="btn-icon" onclick="aiInvestment.exportSignals()">
                                    <i class="fas fa-download"></i>
                                </button>
                            </div>
                        </div>
                        <div class="card-content">
                            <div class="signals-list" id="signalsList">
                                <div class="loading-placeholder">
                                    <i class="fas fa-spinner fa-spin"></i>
                                    <p>Lade Signals...</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Investment Proposals -->
                    <div class="dashboard-card proposals-card">
                        <div class="card-header">
                            <h3><i class="fas fa-lightbulb"></i> Investment Proposals</h3>
                            <div class="card-actions">
                                <button class="btn-icon" onclick="aiInvestment.showProposalDetails()">
                                    <i class="fas fa-eye"></i>
                                </button>
                            </div>
                        </div>
                        <div class="card-content">
                            <div class="proposals-list" id="proposalsList">
                                <div class="loading-placeholder">
                                    <i class="fas fa-spinner fa-spin"></i>
                                    <p>Lade Proposals...</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Risk & Performance -->
                    <div class="dashboard-card risk-card">
                        <div class="card-header">
                            <h3><i class="fas fa-shield-alt"></i> Risk & Performance</h3>
                        </div>
                        <div class="card-content">
                            <div class="risk-metrics" id="riskMetrics">
                                <div class="metric-item">
                                    <div class="metric-label">VaR (95%)</div>
                                    <div class="metric-value" id="varValue">--</div>
                                </div>
                                <div class="metric-item">
                                    <div class="metric-label">Sharpe Ratio</div>
                                    <div class="metric-value" id="sharpeValue">--</div>
                                </div>
                                <div class="metric-item">
                                    <div class="metric-label">Max Drawdown</div>
                                    <div class="metric-value" id="drawdownValue">--</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Learning & Analytics -->
                    <div class="dashboard-card learning-card">
                        <div class="card-header">
                            <h3><i class="fas fa-chart-line"></i> Learning & Analytics</h3>
                        </div>
                        <div class="card-content">
                            <div class="learning-metrics" id="learningMetrics">
                                <div class="metric-item">
                                    <div class="metric-label">Hit Rate (7d)</div>
                                    <div class="metric-value" id="hitRate7d">--</div>
                                </div>
                                <div class="metric-item">
                                    <div class="metric-label">Hit Rate (30d)</div>
                                    <div class="metric-value" id="hitRate30d">--</div>
                                </div>
                                <div class="metric-item">
                                    <div class="metric-label">Reliability</div>
                                    <div class="metric-value" id="reliability">--</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Detailed Views -->
                <div class="detailed-views" id="detailedViews" style="display: none;">
                    <!-- Signal Details Modal -->
                    <div class="modal" id="signalDetailsModal">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h3>Signal Details</h3>
                                <button class="modal-close" onclick="aiInvestment.closeModal('signalDetailsModal')">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                            <div class="modal-body" id="signalDetailsContent">
                                <!-- Signal details will be loaded here -->
                            </div>
                        </div>
                    </div>
                    
                    <!-- Proposal Details Modal -->
                    <div class="modal" id="proposalDetailsModal">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h3>Proposal Details</h3>
                                <button class="modal-close" onclick="aiInvestment.closeModal('proposalDetailsModal')">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                            <div class="modal-body" id="proposalDetailsContent">
                                <!-- Proposal details will be loaded here -->
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * Dashboard Daten laden
     */
    async loadDashboardData() {
        try {
            // Parallel alle Daten laden
            const [signals, proposals, outcomes, metrics] = await Promise.all([
                this.loadSignals(),
                this.loadProposals(),
                this.loadOutcomes(),
                this.loadMetrics()
            ]);
            
            // Dashboard aktualisieren
            this.updateDashboard({ signals, proposals, outcomes, metrics });
            
            // Letzte Aktualisierung setzen
            document.getElementById('lastUpdate').textContent = new Date().toLocaleString('de-DE');
            
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
            this.showError('Fehler beim Laden der Dashboard-Daten');
        }
    }
    
    /**
     * Signals laden
     */
    async loadSignals() {
        try {
            // Mock data - in real implementation, load from API
            const signals = [
                {
                    id: '1',
                    asset: 'BTC',
                    timestamp: new Date(),
                    source: 'twitter',
                    content: 'Bitcoin zeigt starke technische Signale für einen Aufwärtstrend',
                    sentiment: 0.8,
                    relevance: 0.9,
                    novelty: 0.7,
                    credibility: 0.85,
                    entities: ['Bitcoin', 'BTC', 'Krypto'],
                    language: 'de'
                },
                {
                    id: '2',
                    asset: 'ETH',
                    timestamp: new Date(Date.now() - 300000),
                    source: 'reddit',
                    content: 'Ethereum 2.0 Upgrade bringt neue Möglichkeiten für DeFi',
                    sentiment: 0.6,
                    relevance: 0.8,
                    novelty: 0.9,
                    credibility: 0.75,
                    entities: ['Ethereum', 'ETH', 'DeFi'],
                    language: 'de'
                }
            ];
            
            return signals;
        } catch (error) {
            console.error('Failed to load signals:', error);
            return [];
        }
    }
    
    /**
     * Proposals laden
     */
    async loadProposals() {
        try {
            // Mock data
            const proposals = [
                {
                    id: '1',
                    thesis: 'Bitcoin zeigt starke technische Signale für einen Aufwärtstrend',
                    assets: ['BTC'],
                    size_pct: 0.15,
                    horizon_days: 30,
                    entry_price: 45000,
                    stop_loss: 40000,
                    take_profit: 55000,
                    status: 'proposed',
                    created_at: new Date(),
                    explain: 'Basierend auf technischer Analyse und Sentiment-Daten'
                }
            ];
            
            return proposals;
        } catch (error) {
            console.error('Failed to load proposals:', error);
            return [];
        }
    }
    
    /**
     * Outcomes laden
     */
    async loadOutcomes() {
        try {
            // Mock data
            const outcomes = [
                {
                    id: '1',
                    proposal_id: '1',
                    evaluated_at: new Date(),
                    pnl_pct: 0.12,
                    hit: true,
                    breaches: [],
                    actual_duration_days: 25,
                    final_price: 50000,
                    max_drawdown: -0.05,
                    sharpe_ratio: 1.8
                }
            ];
            
            return outcomes;
        } catch (error) {
            console.error('Failed to load outcomes:', error);
            return [];
        }
    }
    
    /**
     * Metrics laden
     */
    async loadMetrics() {
        try {
            // Mock data
            const metrics = {
                var_95: 0.08,
                sharpe_ratio: 1.5,
                max_drawdown: 0.12,
                hit_rate_7d: 0.75,
                hit_rate_30d: 0.68,
                reliability: 0.82
            };
            
            return metrics;
        } catch (error) {
            console.error('Failed to load metrics:', error);
            return {};
        }
    }
    
    /**
     * Dashboard aktualisieren
     */
    updateDashboard(data) {
        this.dashboardData = data;
        
        // Signals aktualisieren
        this.updateSignalsList(data.signals);
        
        // Proposals aktualisieren
        this.updateProposalsList(data.proposals);
        
        // Metrics aktualisieren
        this.updateMetrics(data.metrics);
    }
    
    /**
     * Signals Liste aktualisieren
     */
    updateSignalsList(signals) {
        const container = document.getElementById('signalsList');
        if (!container) return;
        
        if (signals.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-signal"></i>
                    <p>Keine Signals verfügbar</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = signals.map(signal => `
            <div class="signal-item" onclick="aiInvestment.showSignalDetails('${signal.id}')">
                <div class="signal-header">
                    <div class="signal-asset">${signal.asset}</div>
                    <div class="signal-source">
                        <i class="fab fa-${this.getSourceIcon(signal.source)}"></i>
                        ${signal.source}
                    </div>
                    <div class="signal-time">${this.formatTime(signal.timestamp)}</div>
                </div>
                <div class="signal-content">
                    <p>${signal.content}</p>
                </div>
                <div class="signal-metrics">
                    <div class="metric">
                        <span class="metric-label">Sentiment:</span>
                        <span class="metric-value ${this.getSentimentClass(signal.sentiment)}">
                            ${(signal.sentiment * 100).toFixed(0)}%
                        </span>
                    </div>
                    <div class="metric">
                        <span class="metric-label">Relevance:</span>
                        <span class="metric-value">${(signal.relevance * 100).toFixed(0)}%</span>
                    </div>
                    <div class="metric">
                        <span class="metric-label">Credibility:</span>
                        <span class="metric-value">${(signal.credibility * 100).toFixed(0)}%</span>
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    /**
     * Proposals Liste aktualisieren
     */
    updateProposalsList(proposals) {
        const container = document.getElementById('proposalsList');
        if (!container) return;
        
        if (proposals.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-lightbulb"></i>
                    <p>Keine Proposals verfügbar</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = proposals.map(proposal => `
            <div class="proposal-item" onclick="aiInvestment.showProposalDetails('${proposal.id}')">
                <div class="proposal-header">
                    <div class="proposal-assets">${proposal.assets.join(', ')}</div>
                    <div class="proposal-status status-${proposal.status}">
                        ${this.getStatusText(proposal.status)}
                    </div>
                </div>
                <div class="proposal-content">
                    <p>${proposal.thesis}</p>
                </div>
                <div class="proposal-metrics">
                    <div class="metric">
                        <span class="metric-label">Size:</span>
                        <span class="metric-value">${(proposal.size_pct * 100).toFixed(1)}%</span>
                    </div>
                    <div class="metric">
                        <span class="metric-label">Horizon:</span>
                        <span class="metric-value">${proposal.horizon_days} Tage</span>
                    </div>
                    <div class="metric">
                        <span class="metric-label">Entry:</span>
                        <span class="metric-value">$${proposal.entry_price.toLocaleString()}</span>
                    </div>
                </div>
                <div class="proposal-actions">
                    <button class="btn btn-success btn-sm" onclick="aiInvestment.approveProposal('${proposal.id}')">
                        <i class="fas fa-check"></i> Approve
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="aiInvestment.rejectProposal('${proposal.id}')">
                        <i class="fas fa-times"></i> Reject
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    /**
     * Metrics aktualisieren
     */
    updateMetrics(metrics = {}) {
        // Risk Metrics
        this.setMetricValue('varValue', this.formatPercentage(metrics.var_95, 1));
        this.setMetricValue('sharpeValue', this.formatNumber(metrics.sharpe_ratio, 2));
        this.setMetricValue('drawdownValue', this.formatPercentage(metrics.max_drawdown, 1));
        
        // Learning Metrics
        this.setMetricValue('hitRate7d', this.formatPercentage(metrics.hit_rate_7d, 0));
        this.setMetricValue('hitRate30d', this.formatPercentage(metrics.hit_rate_30d, 0));
        this.setMetricValue('reliability', this.formatPercentage(metrics.reliability, 0));
    }
    
    /**
     * Real-time Connection aufbauen
     */
    establishRealTimeConnection() {
        try {
            // WebSocket oder SSE Connection
            this.realTimeConnection = new EventSource('/api/v1/dashboard/stream');
            
            this.realTimeConnection.onmessage = (event) => {
                const data = JSON.parse(event.data);
                this.handleRealTimeUpdate(data);
            };
            
            this.realTimeConnection.onerror = (error) => {
                console.error('Real-time connection error:', error);
                this.showError('Verbindung zu Real-time Updates unterbrochen');
            };
            
        } catch (error) {
            console.error('Failed to establish real-time connection:', error);
        }
    }
    
    /**
     * Real-time Updates verarbeiten
     */
    handleRealTimeUpdate(data) {
        switch (data.type) {
            case 'signal.created':
                this.addNewSignal(data.signal);
                break;
            case 'proposal.created':
                this.addNewProposal(data.proposal);
                break;
            case 'metrics.updated':
                this.updateMetrics(data.metrics);
                break;
        }
    }
    
    /**
     * Event Listeners hinzufügen
     */
    attachEventListeners() {
        // Auto-refresh alle 30 Sekunden
        setInterval(() => {
            this.loadDashboardData();
        }, 30000);
    }
    
    /**
     * Utility Functions
     */
    getSourceIcon(source) {
        const icons = {
            'twitter': 'twitter',
            'reddit': 'reddit',
            'news': 'newspaper',
            'youtube': 'youtube'
        };
        return icons[source] || 'globe';
    }
    
    getSentimentClass(sentiment) {
        if (sentiment > 0.5) return 'positive';
        if (sentiment < -0.5) return 'negative';
        return 'neutral';
    }
    
    getStatusText(status) {
        const statusTexts = {
            'proposed': 'Vorgeschlagen',
            'approved': 'Genehmigt',
            'rejected': 'Abgelehnt',
            'executed': 'Ausgeführt'
        };
        return statusTexts[status] || status;
    }

    setMetricValue(elementId, value) {
        const el = document.getElementById(elementId);
        if (!el) {
            console.warn(`AI Investment: Element #${elementId} nicht gefunden – möglicherweise ist die Section nicht aktiv.`);
            return;
        }
        el.textContent = value;
    }
    
    formatPercentage(value, digits = 0) {
        if (typeof value !== 'number' || Number.isNaN(value)) return '--';
        return `${(value * 100).toFixed(digits)}%`;
    }
    
    formatNumber(value, digits = 2) {
        if (typeof value !== 'number' || Number.isNaN(value)) return '--';
        return value.toFixed(digits);
    }
    
    formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) return 'Gerade eben';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
        return date.toLocaleDateString('de-DE');
    }
    
    /**
     * Action Handlers
     */
    async refreshDashboard() {
        await this.loadDashboardData();
    }
    
    showSettings() {
        // Settings Modal öffnen
        console.log('Settings clicked');
    }
    
    showSignalDetails(signalId) {
        const signal = this.dashboardData.signals.find(s => s.id === signalId);
        if (!signal) return;
        
        // Modal mit Signal Details öffnen
        console.log('Show signal details:', signal);
    }
    
    showProposalDetails(proposalId) {
        const proposal = this.dashboardData.proposals.find(p => p.id === proposalId);
        if (!proposal) return;
        
        // Modal mit Proposal Details öffnen
        console.log('Show proposal details:', proposal);
    }
    
    async approveProposal(proposalId) {
        try {
            // API Call zum Approven
            console.log('Approve proposal:', proposalId);
            // await this.apiCall(`/api/v1/proposals/${proposalId}/approve`, 'POST');
        } catch (error) {
            console.error('Failed to approve proposal:', error);
        }
    }
    
    async rejectProposal(proposalId) {
        try {
            // API Call zum Rejecten
            console.log('Reject proposal:', proposalId);
            // await this.apiCall(`/api/v1/proposals/${proposalId}/reject`, 'POST');
        } catch (error) {
            console.error('Failed to reject proposal:', error);
        }
    }
    
    /**
     * Error Handling
     */
    showError(message) {
        // Error Banner anzeigen
        const banner = document.getElementById('statusBanner');
        if (banner) {
            banner.className = 'status-banner error';
            banner.innerHTML = `
                <div class="status-content">
                    <i class="fas fa-exclamation-triangle"></i>
                    <span>${message}</span>
                </div>
            `;
        }
    }
    
    /**
     * Charts initialisieren
     */
    initializeCharts() {
        // Chart.js oder ähnliche Library für Visualisierungen
        console.log('Charts initialized');
    }
}

// Global Functions für Legacy Support
window.aiInvestment = {
    refreshDashboard: () => {
        if (window.AdminApp && window.AdminApp.sections && window.AdminApp.sections.aiInvestment) {
            window.AdminApp.sections.aiInvestment.refreshDashboard();
        }
    },
    showSettings: () => {
        if (window.AdminApp && window.AdminApp.sections && window.AdminApp.sections.aiInvestment) {
            window.AdminApp.sections.aiInvestment.showSettings();
        }
    },
    showSignalDetails: (signalId) => {
        if (window.AdminApp && window.AdminApp.sections && window.AdminApp.sections.aiInvestment) {
            window.AdminApp.sections.aiInvestment.showSignalDetails(signalId);
        }
    },
    showProposalDetails: (proposalId) => {
        if (window.AdminApp && window.AdminApp.sections && window.AdminApp.sections.aiInvestment) {
            window.AdminApp.sections.aiInvestment.showProposalDetails(proposalId);
        }
    },
    approveProposal: (proposalId) => {
        if (window.AdminApp && window.AdminApp.sections && window.AdminApp.sections.aiInvestment) {
            window.AdminApp.sections.aiInvestment.approveProposal(proposalId);
        }
    },
    rejectProposal: (proposalId) => {
        if (window.AdminApp && window.AdminApp.sections && window.AdminApp.sections.aiInvestment) {
            window.AdminApp.sections.aiInvestment.rejectProposal(proposalId);
        }
    }
};

// Section initialisieren wenn DOM bereit
document.addEventListener('DOMContentLoaded', () => {
    // Warten bis AdminApp verfügbar ist
    const initSection = () => {
        if (window.AdminApp && window.AdminApp.sections) {
            window.AdminApp.sections.aiInvestment = new AIInvestmentSection();
            window.AdminApp.sections.aiInvestment.init();
        } else {
            setTimeout(initSection, 100);
        }
    };
    initSection();
});

// Global verfügbar machen
window.AIInvestmentSection = AIInvestmentSection;
