/**
 * AI Investment System - Trading Functions
 * Erweiterte Trading-Funktionen für Crypto und Aktien
 */

class AITradingSystem {
    constructor() {
        this.tradingMode = 'general'; // 'general', 'crypto', 'stocks'
        this.riskLevel = 'medium'; // 'low', 'medium', 'high'
        this.timeHorizon = 'medium'; // 'short', 'medium', 'long'
        this.budget = 10000; // Trading Budget
        this.maxPositions = 5; // Maximale Anzahl Positionen
    }

    // Trading Mode umschalten
    switchTradingMode(mode) {
        this.tradingMode = mode;
        console.log(`🔄 Trading Mode switched to: ${mode}`);
        this.updateTradingInterface();
    }

    // Risk Level setzen
    setRiskLevel(level) {
        this.riskLevel = level;
        console.log(`⚠️ Risk Level set to: ${level}`);
        this.updateRiskSettings();
    }

    // Time Horizon setzen
    setTimeHorizon(horizon) {
        this.timeHorizon = horizon;
        console.log(`⏰ Time Horizon set to: ${horizon}`);
        this.updateTimeSettings();
    }

    // Trading Interface aktualisieren
    updateTradingInterface() {
        const modeSelector = document.getElementById('trading-mode-selector');
        const cryptoSection = document.getElementById('crypto-trading-section');
        const stocksSection = document.getElementById('stocks-trading-section');
        const generalSection = document.getElementById('general-trading-section');

        if (modeSelector) {
            modeSelector.value = this.tradingMode;
        }

        // Sektionen ein-/ausblenden
        if (cryptoSection) {
            cryptoSection.style.display = this.tradingMode === 'crypto' ? 'block' : 'none';
        }
        if (stocksSection) {
            stocksSection.style.display = this.tradingMode === 'stocks' ? 'block' : 'none';
        }
        if (generalSection) {
            generalSection.style.display = this.tradingMode === 'general' ? 'block' : 'none';
        }

        // Trading-spezifische Daten laden
        this.loadTradingData();
    }

    // Trading-spezifische Daten laden
    async loadTradingData() {
        try {
            let data;
            
            switch (this.tradingMode) {
                case 'crypto':
                    data = await this.loadCryptoData();
                    break;
                case 'stocks':
                    data = await this.loadStocksData();
                    break;
                default:
                    data = await this.loadGeneralData();
            }
            
            this.displayTradingData(data);
        } catch (error) {
            console.error('Error loading trading data:', error);
        }
    }

    // Crypto-Daten laden
    async loadCryptoData() {
        console.log('🪙 Loading Crypto Data...');
        
        // Crypto-spezifische Signale sammeln
        const cryptoSignals = await this.collectCryptoSignals();
        
        // Crypto-spezifische Vorschläge generieren
        const cryptoProposals = await this.generateCryptoProposals(cryptoSignals);
        
        return {
            type: 'crypto',
            signals: cryptoSignals,
            proposals: cryptoProposals,
            marketData: await this.getCryptoMarketData()
        };
    }

    // Aktien-Daten laden
    async loadStocksData() {
        console.log('📈 Loading Stocks Data...');
        
        // Aktien-spezifische Signale sammeln
        const stockSignals = await this.collectStockSignals();
        
        // Aktien-spezifische Vorschläge generieren
        const stockProposals = await this.generateStockProposals(stockSignals);
        
        return {
            type: 'stocks',
            signals: stockSignals,
            proposals: stockProposals,
            marketData: await this.getStockMarketData()
        };
    }

    // Allgemeine Daten laden
    async loadGeneralData() {
        console.log('📊 Loading General Investment Data...');
        
        // Allgemeine Signale sammeln
        const generalSignals = await this.collectGeneralSignals();
        
        // Allgemeine Vorschläge generieren
        const generalProposals = await this.generateGeneralProposals(generalSignals);
        
        return {
            type: 'general',
            signals: generalSignals,
            proposals: generalProposals,
            marketData: await this.getGeneralMarketData()
        };
    }

    // Crypto-Signale sammeln
    async collectCryptoSignals() {
        const signals = [];
        
        // Reddit Crypto-Signale
        const redditCrypto = await this.fetchRedditCryptoSignals();
        signals.push(...redditCrypto);
        
        // News Crypto-Signale
        const newsCrypto = await this.fetchNewsCryptoSignals();
        signals.push(...newsCrypto);
        
        // Twitter Crypto-Signale
        const twitterCrypto = await this.fetchTwitterCryptoSignals();
        signals.push(...twitterCrypto);
        
        return signals;
    }

    // Aktien-Signale sammeln
    async collectStockSignals() {
        const signals = [];
        
        // Reddit Stock-Signale
        const redditStocks = await this.fetchRedditStockSignals();
        signals.push(...redditStocks);
        
        // News Stock-Signale
        const newsStocks = await this.fetchNewsStockSignals();
        signals.push(...newsStocks);
        
        // Twitter Stock-Signale
        const twitterStocks = await this.fetchTwitterStockSignals();
        signals.push(...twitterStocks);
        
        return signals;
    }

    // Allgemeine Signale sammeln
    async collectGeneralSignals() {
        const signals = [];
        
        // Reddit Investment-Signale
        const redditInvestment = await this.fetchRedditInvestmentSignals();
        signals.push(...redditInvestment);
        
        // News Investment-Signale
        const newsInvestment = await this.fetchNewsInvestmentSignals();
        signals.push(...newsInvestment);
        
        return signals;
    }

    // Crypto-Vorschläge generieren
    async generateCryptoProposals(signals) {
        console.log('🪙 Generating Crypto Proposals...');
        
        const proposals = [];
        
        // AI-Analyse für Crypto
        const aiAnalysis = await this.analyzeCryptoSignals(signals);
        
        // Crypto-spezifische Vorschläge
        for (const analysis of aiAnalysis) {
            if (analysis.confidence > 0.7) {
                proposals.push({
                    id: `crypto_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    type: 'crypto',
                    symbol: analysis.symbol,
                    action: analysis.recommendedAction,
                    confidence: analysis.confidence,
                    riskLevel: this.calculateCryptoRisk(analysis),
                    expectedReturn: analysis.expectedReturn,
                    timeHorizon: analysis.timeHorizon,
                    reasoning: analysis.reasoning,
                    signals: analysis.supportingSignals,
                    timestamp: new Date().toISOString()
                });
            }
        }
        
        return proposals;
    }

    // Aktien-Vorschläge generieren
    async generateStockProposals(signals) {
        console.log('📈 Generating Stock Proposals...');
        
        const proposals = [];
        
        // AI-Analyse für Aktien
        const aiAnalysis = await this.analyzeStockSignals(signals);
        
        // Aktien-spezifische Vorschläge
        for (const analysis of aiAnalysis) {
            if (analysis.confidence > 0.7) {
                proposals.push({
                    id: `stock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    type: 'stocks',
                    symbol: analysis.symbol,
                    action: analysis.recommendedAction,
                    confidence: analysis.confidence,
                    riskLevel: this.calculateStockRisk(analysis),
                    expectedReturn: analysis.expectedReturn,
                    timeHorizon: analysis.timeHorizon,
                    reasoning: analysis.reasoning,
                    signals: analysis.supportingSignals,
                    timestamp: new Date().toISOString()
                });
            }
        }
        
        return proposals;
    }

    // Allgemeine Vorschläge generieren
    async generateGeneralProposals(signals) {
        console.log('📊 Generating General Investment Proposals...');
        
        const proposals = [];
        
        // AI-Analyse für allgemeine Investments
        const aiAnalysis = await this.analyzeGeneralSignals(signals);
        
        // Allgemeine Vorschläge
        for (const analysis of aiAnalysis) {
            if (analysis.confidence > 0.7) {
                proposals.push({
                    id: `general_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    type: 'general',
                    category: analysis.category,
                    action: analysis.recommendedAction,
                    confidence: analysis.confidence,
                    riskLevel: this.calculateGeneralRisk(analysis),
                    expectedReturn: analysis.expectedReturn,
                    timeHorizon: analysis.timeHorizon,
                    reasoning: analysis.reasoning,
                    signals: analysis.supportingSignals,
                    timestamp: new Date().toISOString()
                });
            }
        }
        
        return proposals;
    }

    // Trading-Daten anzeigen
    displayTradingData(data) {
        const container = document.getElementById('trading-data-container');
        if (!container) return;

        container.innerHTML = `
            <div class="trading-data">
                <h3>${data.type.toUpperCase()} Trading Data</h3>
                <div class="signals-count">Signals: ${data.signals.length}</div>
                <div class="proposals-count">Proposals: ${data.proposals.length}</div>
                <div class="market-data">${JSON.stringify(data.marketData, null, 2)}</div>
            </div>
        `;
    }

    // Risk Settings aktualisieren
    updateRiskSettings() {
        const riskIndicator = document.getElementById('risk-indicator');
        if (riskIndicator) {
            riskIndicator.className = `risk-${this.riskLevel}`;
            riskIndicator.textContent = `Risk: ${this.riskLevel.toUpperCase()}`;
        }
    }

    // Time Settings aktualisieren
    updateTimeSettings() {
        const timeIndicator = document.getElementById('time-indicator');
        if (timeIndicator) {
            timeIndicator.className = `time-${this.timeHorizon}`;
            timeIndicator.textContent = `Horizon: ${this.timeHorizon.toUpperCase()}`;
        }
    }

    // Crypto Risk berechnen
    calculateCryptoRisk(analysis) {
        // Crypto-spezifische Risikoberechnung
        const volatility = analysis.volatility || 0.5;
        const marketCap = analysis.marketCap || 'small';
        const liquidity = analysis.liquidity || 'low';
        
        let risk = 'high';
        if (volatility < 0.3 && marketCap === 'large' && liquidity === 'high') {
            risk = 'low';
        } else if (volatility < 0.5 && (marketCap === 'medium' || liquidity === 'medium')) {
            risk = 'medium';
        }
        
        return risk;
    }

    // Stock Risk berechnen
    calculateStockRisk(analysis) {
        // Aktien-spezifische Risikoberechnung
        const beta = analysis.beta || 1.0;
        const marketCap = analysis.marketCap || 'small';
        const sector = analysis.sector || 'technology';
        
        let risk = 'medium';
        if (beta < 0.8 && marketCap === 'large' && sector === 'utilities') {
            risk = 'low';
        } else if (beta > 1.5 && marketCap === 'small' && sector === 'technology') {
            risk = 'high';
        }
        
        return risk;
    }

    // General Risk berechnen
    calculateGeneralRisk(analysis) {
        // Allgemeine Risikoberechnung
        const volatility = analysis.volatility || 0.5;
        const correlation = analysis.correlation || 0.5;
        
        let risk = 'medium';
        if (volatility < 0.3 && correlation < 0.3) {
            risk = 'low';
        } else if (volatility > 0.7 || correlation > 0.7) {
            risk = 'high';
        }
        
        return risk;
    }

    // API-Calls für verschiedene Datenquellen
    async fetchRedditCryptoSignals() {
        // Reddit Crypto-spezifische Signale
        return [];
    }

    async fetchNewsCryptoSignals() {
        // News Crypto-spezifische Signale
        return [];
    }

    async fetchTwitterCryptoSignals() {
        // Twitter Crypto-spezifische Signale
        return [];
    }

    async fetchRedditStockSignals() {
        // Reddit Stock-spezifische Signale
        return [];
    }

    async fetchNewsStockSignals() {
        // News Stock-spezifische Signale
        return [];
    }

    async fetchTwitterStockSignals() {
        // Twitter Stock-spezifische Signale
        return [];
    }

    async fetchRedditInvestmentSignals() {
        // Reddit Investment-spezifische Signale
        return [];
    }

    async fetchNewsInvestmentSignals() {
        // News Investment-spezifische Signale
        return [];
    }

    async getCryptoMarketData() {
        // Crypto Marktdaten
        return {};
    }

    async getStockMarketData() {
        // Aktien Marktdaten
        return {};
    }

    async getGeneralMarketData() {
        // Allgemeine Marktdaten
        return {};
    }

    async analyzeCryptoSignals(signals) {
        // AI-Analyse für Crypto
        return [];
    }

    async analyzeStockSignals(signals) {
        // AI-Analyse für Aktien
        return [];
    }

    async analyzeGeneralSignals(signals) {
        // AI-Analyse für allgemeine Investments
        return [];
    }
}

// Export für globale Verwendung
window.AITradingSystem = AITradingSystem;
