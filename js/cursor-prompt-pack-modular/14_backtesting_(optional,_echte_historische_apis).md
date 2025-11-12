# Modul 14 — Backtesting (Optional, echte historische APIs) (OPTIMIERT)
**Repo:** `Manu-Manera/manuel-weiss-website` • **Version:** 5.0 • **Zeitzone:** Europe/Zurich  
**Prinzip:** *Kein Test-/Demo-Daten-Einsatz. Nur echte Quellen/Provider. Serverseitige Secrets.*
**Ziel:** Production-ready Backtesting System mit historischen Daten und umfassenden Metriken

---
# Repo-Ausrichtung & Pfade (ERWEITERT)
- **Backtest Lambda:** `lambda/backtest/` mit Backtesting-Engine
- **UI Components:** `ui/admin/ai-investments/backtests/` mit Backtest-Dashboard
- **Data Providers:** `providers/historical/` mit Provider-Abstraktion
- **Reports:** `reports/backtests/` mit S3-Storage
- **Configuration:** `config/backtest/` mit Backtest-Konfigurationen

# Smart Prompt – Implementierung (FÜR CURSOR - OPTIMIERT)
> **An Cursor – Production Backtesting System implementieren (Deutsch):**  

## PHASE 1: Backtesting Engine (ERWEITERT)
### **Backtest Runner:**
```typescript
// lambda/backtest/backtest-runner.ts
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDB, S3 } from 'aws-sdk';

export interface BacktestConfig {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  assets: string[];
  initialCapital: number;
  riskTolerance: 'low' | 'medium' | 'high';
  rebalanceFrequency: 'daily' | 'weekly' | 'monthly';
  providers: {
    prices: 'polygon' | 'alpha-vantage' | 'yahoo-finance';
    news: 'newsapi' | 'finnhub' | 'benzinga';
    social: 'twitter' | 'reddit' | 'stocktwits';
  };
}

export interface BacktestResult {
  id: string;
  config: BacktestConfig;
  metrics: {
    totalReturn: number;
    annualizedReturn: number;
    sharpeRatio: number;
    maxDrawdown: number;
    winRate: number;
    profitFactor: number;
    breachRate: number;
    volatility: number;
    beta: number;
    alpha: number;
  };
  trades: Trade[];
  performance: PerformanceTimeSeries;
  riskMetrics: RiskMetrics;
  attribution: Attribution;
}

export class BacktestRunner {
  private config: BacktestConfig;
  private priceProvider: PriceProvider;
  private newsProvider: NewsProvider;
  private socialProvider: SocialProvider;
  private portfolio: Portfolio;
  private results: BacktestResult;

  constructor(config: BacktestConfig) {
    this.config = config;
    this.priceProvider = this.initializePriceProvider(config.providers.prices);
    this.newsProvider = this.initializeNewsProvider(config.providers.news);
    this.socialProvider = this.initializeSocialProvider(config.providers.social);
    this.portfolio = new Portfolio(config.initialCapital);
    this.results = this.initializeResults();
  }

  public async run(): Promise<BacktestResult> {
    try {
      // Validate configuration
      await this.validateConfig();
      
      // Load historical data
      const historicalData = await this.loadHistoricalData();
      
      // Run backtest
      await this.executeBacktest(historicalData);
      
      // Calculate metrics
      this.calculateMetrics();
      
      // Generate report
      await this.generateReport();
      
      // Store results
      await this.storeResults();
      
      return this.results;
    } catch (error) {
      logger.error('Backtest failed', error);
      throw error;
    }
  }

  private async validateConfig(): Promise<void> {
    // Validate date range
    const startDate = new Date(this.config.startDate);
    const endDate = new Date(this.config.endDate);
    
    if (startDate >= endDate) {
      throw new Error('Start date must be before end date');
    }
    
    if (endDate > new Date()) {
      throw new Error('End date cannot be in the future');
    }
    
    // Validate assets
    if (this.config.assets.length === 0) {
      throw new Error('At least one asset is required');
    }
    
    // Validate initial capital
    if (this.config.initialCapital <= 0) {
      throw new Error('Initial capital must be positive');
    }
  }

  private async loadHistoricalData(): Promise<HistoricalData> {
    const startDate = new Date(this.config.startDate);
    const endDate = new Date(this.config.endDate);
    
    // Load price data
    const priceData = await this.priceProvider.getHistoricalPrices(
      this.config.assets,
      startDate,
      endDate
    );
    
    // Load news data
    const newsData = await this.newsProvider.getHistoricalNews(
      this.config.assets,
      startDate,
      endDate
    );
    
    // Load social data
    const socialData = await this.socialProvider.getHistoricalSocial(
      this.config.assets,
      startDate,
      endDate
    );
    
    return {
      prices: priceData,
      news: newsData,
      social: socialData
    };
  }

  private async executeBacktest(historicalData: HistoricalData): Promise<void> {
    const startDate = new Date(this.config.startDate);
    const endDate = new Date(this.config.endDate);
    
    // Iterate through each day
    for (let date = startDate; date <= endDate; date.setDate(date.getDate() + 1)) {
      // Get data for current date
      const currentData = this.getDataForDate(historicalData, date);
      
      // Generate signals
      const signals = await this.generateSignals(currentData);
      
      // Score signals
      const scoredSignals = await this.scoreSignals(signals);
      
      // Generate proposals
      const proposals = await this.generateProposals(scoredSignals);
      
      // Assess risk
      const riskAssessedProposals = await this.assessRisk(proposals);
      
      // Execute trades
      await this.executeTrades(riskAssessedProposals, currentData.prices);
      
      // Update portfolio
      this.portfolio.update(currentData.prices);
      
      // Record performance
      this.recordPerformance(date);
      
      // Check for rebalancing
      if (this.shouldRebalance(date)) {
        await this.rebalance(currentData.prices);
      }
    }
  }

  private calculateMetrics(): void {
    // Calculate total return
    const totalReturn = (this.portfolio.getValue() - this.config.initialCapital) / this.config.initialCapital;
    
    // Calculate annualized return
    const days = this.getDaysBetween(new Date(this.config.startDate), new Date(this.config.endDate));
    const years = days / 365;
    const annualizedReturn = Math.pow(1 + totalReturn, 1 / years) - 1;
    
    // Calculate Sharpe ratio
    const returns = this.portfolio.getReturns();
    const meanReturn = this.mean(returns);
    const stdReturn = this.std(returns);
    const riskFreeRate = 0.02; // 2% annual risk-free rate
    const sharpeRatio = (meanReturn - riskFreeRate / 252) / stdReturn * Math.sqrt(252);
    
    // Calculate maximum drawdown
    const maxDrawdown = this.calculateMaxDrawdown();
    
    // Calculate win rate
    const trades = this.portfolio.getTrades();
    const winningTrades = trades.filter(t => t.profit > 0).length;
    const winRate = winningTrades / trades.length;
    
    // Calculate profit factor
    const grossProfit = trades.filter(t => t.profit > 0).reduce((sum, t) => sum + t.profit, 0);
    const grossLoss = Math.abs(trades.filter(t => t.profit < 0).reduce((sum, t) => sum + t.profit, 0));
    const profitFactor = grossProfit / grossLoss;
    
    // Calculate breach rate
    const breaches = this.portfolio.getRiskBreaches();
    const breachRate = breaches.length / days;
    
    // Calculate volatility
    const volatility = stdReturn * Math.sqrt(252);
    
    // Calculate beta and alpha
    const marketReturns = await this.getMarketReturns();
    const beta = this.calculateBeta(returns, marketReturns);
    const alpha = annualizedReturn - (riskFreeRate + beta * (this.mean(marketReturns) - riskFreeRate));
    
    // Store metrics
    this.results.metrics = {
      totalReturn,
      annualizedReturn,
      sharpeRatio,
      maxDrawdown,
      winRate,
      profitFactor,
      breachRate,
      volatility,
      beta,
      alpha
    };
  }

  private async generateReport(): Promise<void> {
    const report = {
      summary: {
        config: this.config,
        metrics: this.results.metrics,
        startDate: this.config.startDate,
        endDate: this.config.endDate,
        duration: this.getDaysBetween(new Date(this.config.startDate), new Date(this.config.endDate)),
        initialCapital: this.config.initialCapital,
        finalCapital: this.portfolio.getValue(),
        totalTrades: this.portfolio.getTrades().length
      },
      performance: this.results.performance,
      trades: this.results.trades,
      riskMetrics: this.results.riskMetrics,
      attribution: this.results.attribution
    };
    
    // Generate CSV report
    const csvReport = this.generateCSVReport(report);
    await this.saveReport(csvReport, 'csv');
    
    // Generate PDF report
    const pdfReport = await this.generatePDFReport(report);
    await this.saveReport(pdfReport, 'pdf');
    
    // Generate JSON report
    const jsonReport = JSON.stringify(report, null, 2);
    await this.saveReport(jsonReport, 'json');
  }

  private async storeResults(): Promise<void> {
    // Store in DynamoDB
    await dynamoDB.put({
      TableName: 'backtests',
      Item: {
        id: this.results.id,
        config: this.config,
        metrics: this.results.metrics,
        createdAt: new Date().toISOString(),
        status: 'completed'
      }
    }).promise();
    
    // Store detailed results in S3
    await s3.putObject({
      Bucket: 'ai-investment-backtests',
      Key: `${this.results.id}/results.json`,
      Body: JSON.stringify(this.results, null, 2),
      ContentType: 'application/json'
    }).promise();
  }
}
```

## PHASE 2: Provider Abstraktion (ERWEITERT)
### **Price Provider:**
```typescript
// providers/historical/price-provider.ts
export interface PriceProvider {
  getHistoricalPrices(assets: string[], startDate: Date, endDate: Date): Promise<PriceData[]>;
}

export class PolygonPriceProvider implements PriceProvider {
  private apiKey: string;
  private baseUrl: string = 'https://api.polygon.io';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  public async getHistoricalPrices(assets: string[], startDate: Date, endDate: Date): Promise<PriceData[]> {
    const priceData: PriceData[] = [];
    
    for (const asset of assets) {
      const response = await axios.get(`${this.baseUrl}/v2/aggs/ticker/${asset}/range/1/day/${this.formatDate(startDate)}/${this.formatDate(endDate)}`, {
        params: {
          apiKey: this.apiKey,
          adjusted: true,
          sort: 'asc'
        }
      });
      
      if (response.data.results) {
        for (const result of response.data.results) {
          priceData.push({
            asset,
            date: new Date(result.t),
            open: result.o,
            high: result.h,
            low: result.l,
            close: result.c,
            volume: result.v
          });
        }
      }
    }
    
    return priceData;
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}

export class AlphaVantagePriceProvider implements PriceProvider {
  private apiKey: string;
  private baseUrl: string = 'https://www.alphavantage.co';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  public async getHistoricalPrices(assets: string[], startDate: Date, endDate: Date): Promise<PriceData[]> {
    const priceData: PriceData[] = [];
    
    for (const asset of assets) {
      const response = await axios.get(`${this.baseUrl}/query`, {
        params: {
          function: 'TIME_SERIES_DAILY',
          symbol: asset,
          apikey: this.apiKey,
          outputsize: 'full'
        }
      });
      
      if (response.data['Time Series (Daily)']) {
        const timeSeries = response.data['Time Series (Daily)'];
        
        for (const [dateStr, values] of Object.entries(timeSeries)) {
          const date = new Date(dateStr);
          
          if (date >= startDate && date <= endDate) {
            priceData.push({
              asset,
              date,
              open: parseFloat(values['1. open']),
              high: parseFloat(values['2. high']),
              low: parseFloat(values['3. low']),
              close: parseFloat(values['4. close']),
              volume: parseInt(values['5. volume'])
            });
          }
        }
      }
    }
    
    return priceData;
  }
}
```

## PHASE 3: UI Dashboard (ERWEITERT)
### **Backtest Dashboard:**
```typescript
// ui/admin/ai-investments/backtests/BacktestDashboard.tsx
import React, { useState, useEffect } from 'react';
import { useAPI } from '../../../hooks/useAPI';

export const BacktestDashboard: React.FC = () => {
  const [backtests, setBacktests] = useState<Backtest[]>([]);
  const [selectedBacktest, setSelectedBacktest] = useState<Backtest | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { data: backtestsData, loading, error } = useAPI('/backtests');

  useEffect(() => {
    if (backtestsData) {
      setBacktests(backtestsData.data);
    }
  }, [backtestsData]);

  const handleCreateBacktest = async (config: BacktestConfig) => {
    try {
      const response = await fetch('/api/backtests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify(config)
      });

      if (response.ok) {
        const result = await response.json();
        setBacktests([...backtests, result.data]);
        setShowCreateModal(false);
        showNotification('Backtest erstellt', 'success');
      }
    } catch (error) {
      console.error('Failed to create backtest:', error);
      showNotification('Backtest-Erstellung fehlgeschlagen', 'error');
    }
  };

  const handleDownloadReport = async (backtestId: string, format: 'csv' | 'pdf' | 'json') => {
    try {
      const response = await fetch(`/api/backtests/${backtestId}/report?format=${format}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        downloadFile(blob, `backtest-${backtestId}.${format}`);
      }
    } catch (error) {
      console.error('Failed to download report:', error);
      showNotification('Report-Download fehlgeschlagen', 'error');
    }
  };

  return (
    <div className="backtest-dashboard">
      <div className="dashboard-header">
        <h2>Backtesting</h2>
        <button onClick={() => setShowCreateModal(true)} className="btn btn-primary">
          <i className="fas fa-plus"></i> Neuer Backtest
        </button>
      </div>

      {loading && <div className="loading">Lade Backtests...</div>}
      {error && <div className="error">Fehler beim Laden: {error.message}</div>}

      <div className="backtests-list">
        {backtests.map(backtest => (
          <div key={backtest.id} className="backtest-card" onClick={() => setSelectedBacktest(backtest)}>
            <h3>{backtest.config.name}</h3>
            <div className="backtest-info">
              <span>Zeitraum: {backtest.config.startDate} - {backtest.config.endDate}</span>
              <span>Assets: {backtest.config.assets.join(', ')}</span>
              <span>Status: {backtest.status}</span>
            </div>
            {backtest.metrics && (
              <div className="backtest-metrics">
                <div className="metric">
                  <span className="label">Total Return:</span>
                  <span className={`value ${backtest.metrics.totalReturn > 0 ? 'positive' : 'negative'}`}>
                    {(backtest.metrics.totalReturn * 100).toFixed(2)}%
                  </span>
                </div>
                <div className="metric">
                  <span className="label">Sharpe Ratio:</span>
                  <span className="value">{backtest.metrics.sharpeRatio.toFixed(2)}</span>
                </div>
                <div className="metric">
                  <span className="label">Max Drawdown:</span>
                  <span className="value negative">{(backtest.metrics.maxDrawdown * 100).toFixed(2)}%</span>
                </div>
              </div>
            )}
            <div className="backtest-actions">
              <button onClick={(e) => { e.stopPropagation(); handleDownloadReport(backtest.id, 'csv'); }} className="btn btn-secondary">
                <i className="fas fa-download"></i> CSV
              </button>
              <button onClick={(e) => { e.stopPropagation(); handleDownloadReport(backtest.id, 'pdf'); }} className="btn btn-secondary">
                <i className="fas fa-download"></i> PDF
              </button>
              <button onClick={(e) => { e.stopPropagation(); handleDownloadReport(backtest.id, 'json'); }} className="btn btn-secondary">
                <i className="fas fa-download"></i> JSON
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedBacktest && (
        <BacktestDetailsModal
          backtest={selectedBacktest}
          onClose={() => setSelectedBacktest(null)}
        />
      )}

      {showCreateModal && (
        <CreateBacktestModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateBacktest}
        />
      )}
    </div>
  );
};
```

**Runner** für reale Zeitfenster/Assets; deterministische Seeds nur für Samplings (nicht für Daten).
**Historische Preise/News** über offizielle Provider-APIs (Terms beachten).
**Metriken:** Sharpe, MaxDD, Breach-Rate; Reports → S3/backtests.

# Zusätzliche Verbesserungen (PRODUCTION-GRADE - OPTIMIERT)
- **Provider-Abstraktion** (Coinbase/Binance/Polygon, Alpha Vantage, Yahoo Finance)
- **UI-Berichte** mit Download (CSV/PDF/JSON)
- **Walk-Forward Analysis** für robustere Ergebnisse
- **Monte Carlo Simulation** für Konfidenzintervalle
- **Transaction Cost Modeling** für realistische Ergebnisse
- **Slippage Modeling** für Market Impact
- **Benchmark Comparison** gegen Markt-Indizes
- **Risk-Adjusted Performance** mit verschiedenen Metriken

# Fehlervermeidung – Was schiefgehen kann & Gegenmaßnahmen (ERWEITERT)
- **Sampling-Bias**/Leakage.  
  **Fix:** Zeitliche Isolation, Purge Windows, Walk-Forward Validation
- **Rate-Limit-Exhaustion**.  
  **Fix:** Batch/Schedule, Budget-Limiter, Provider Rotation
- **Look-Ahead Bias** → Unrealistische Ergebnisse.  
  **Fix:** Strict Temporal Ordering, Point-in-Time Data
- **Survivorship Bias** → Überschätzte Performance.  
  **Fix:** Include Delisted Assets, Complete Historical Data
- **Overfitting** → Poor Out-of-Sample Performance.  
  **Fix:** Cross-Validation, Walk-Forward Analysis, Parameter Regularization
- **Transaction Costs** → Unrealistic Returns.  
  **Fix:** Model Commissions, Slippage, Market Impact

# Akzeptanzkriterien (Definition of Done - ERWEITERT)
- Reproduzierbar; echte Quellen; Reports erzeugt
- **Provider Abstraktion** vollständig implementiert
- **Backtest Engine** mit allen Metriken
- **UI Dashboard** mit Visualisierungen
- **Report Generation** in CSV/PDF/JSON
- **Walk-Forward Analysis** implementiert
- **Monte Carlo Simulation** implementiert
- **Transaction Cost Modeling** implementiert
- **Documentation** vollständig und aktuell

# Build/Test-Gates & Verifikation (AUSFÜHREN - OPTIMIERT)
```bash
# Backtest Engine Tests
./scripts/test:backtest:engine
./scripts/test:backtest:metrics

# Provider Tests
./scripts/test:backtest:providers
./scripts/test:backtest:historical-data

# Integration Tests
./scripts/test:backtest:integration
./scripts/test:backtest:e2e

# Example Run
./scripts/backtest:run:example
```

# Artefakte & Deliverables (ERWEITERT)
- **Backtest-Lambda** mit vollständiger Engine
- **UI-Tab** mit Dashboard und Visualisierungen
- **S3-Reports** in CSV/PDF/JSON
- **Provider Abstraktion** für verschiedene Datenquellen
- **Documentation** (Backtest Guide, Provider Setup, Metrics Explanation)
- **Example Backtests** mit verschiedenen Konfigurationen
- **Performance Reports** mit detaillierten Metriken
- **Risk Analysis** mit umfassenden Risk Metrics

