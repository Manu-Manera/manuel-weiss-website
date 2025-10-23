# AI Investment System - Backtesting Guide

## Übersicht

Dieses Handbuch erklärt, wie Sie das Backtesting-System des AI Investment Systems verwenden, um Ihre Investment-Strategien zu testen und zu optimieren.

## Was ist Backtesting?

Backtesting ist die Simulation einer Investment-Strategie mit historischen Daten, um deren Performance zu bewerten, bevor echtes Geld investiert wird.

### Vorteile

- **Risikofreie Tests**: Strategien ohne echtes Geld testen
- **Historische Validierung**: Performance über verschiedene Marktbedingungen
- **Optimierung**: Parameter-Tuning für beste Ergebnisse
- **Benchmark-Vergleich**: Vergleich mit Markt-Indizes

### Limitationen

- **Overfitting**: Strategien können zu sehr auf historische Daten optimiert werden
- **Look-Ahead Bias**: Unbewusste Verwendung zukünftiger Informationen
- **Survivorship Bias**: Nur erfolgreiche Unternehmen in den Daten
- **Kosten**: Transaktionskosten und Slippage können unterschätzt werden

## Schnellstart

### 1. Einfacher Backtest

```typescript
import { AIIvestmentClient } from '@ai-investment/api-client';

const client = new AIIvestmentClient({
  baseUrl: 'https://api.production.ai-investment.com',
  apiKey: 'your-api-key'
});

// Backtest für S&P 500 über 1 Jahr
const backtest = await client.backtests.create({
  startDate: '2023-01-01T00:00:00Z',
  endDate: '2023-12-31T23:59:59Z',
  symbols: ['SPY'],
  initialCapital: 100000,
  riskFreeRate: 0.02,
  commission: 0.001,
  slippage: 0.0005
});

console.log('Backtest ID:', backtest.id);
```

### 2. Status prüfen

```typescript
// Status abrufen
const status = await client.backtests.getStatus(backtest.id);
console.log('Status:', status.status); // running, completed, failed

// Warten bis abgeschlossen
while (status.status === 'running') {
  await new Promise(resolve => setTimeout(resolve, 5000)); // 5 Sekunden warten
  const updatedStatus = await client.backtests.getStatus(backtest.id);
  status.status = updatedStatus.status;
}
```

### 3. Ergebnisse abrufen

```typescript
// Ergebnisse abrufen
const results = await client.backtests.getResults(backtest.id);

console.log('=== PERFORMANCE METRIKEN ===');
console.log('Initial Capital:', results.initialCapital);
console.log('Final Capital:', results.finalCapital);
console.log('Total Return:', (results.totalReturn * 100).toFixed(2) + '%');
console.log('Annualized Return:', (results.annualizedReturn * 100).toFixed(2) + '%');
console.log('Volatility:', (results.volatility * 100).toFixed(2) + '%');
console.log('Sharpe Ratio:', results.sharpeRatio.toFixed(2));
console.log('Max Drawdown:', (results.maxDrawdown * 100).toFixed(2) + '%');

console.log('=== TRADE METRIKEN ===');
console.log('Total Trades:', results.totalTrades);
console.log('Profitable Trades:', results.profitableTrades);
console.log('Win Rate:', (results.winRate * 100).toFixed(2) + '%');
console.log('Average Win:', results.averageWin.toFixed(2));
console.log('Average Loss:', results.averageLoss.toFixed(2));
console.log('Profit Factor:', results.profitFactor.toFixed(2));

console.log('=== RISIKO METRIKEN ===');
console.log('VaR (95%):', (results.var95 * 100).toFixed(2) + '%');
console.log('CVaR (95%):', (results.cvar95 * 100).toFixed(2) + '%');
console.log('Beta:', results.beta.toFixed(2));
console.log('Alpha:', (results.alpha * 100).toFixed(2) + '%');
```

## Erweiterte Konfiguration

### 1. Multi-Symbol Backtest

```typescript
const backtest = await client.backtests.create({
  startDate: '2023-01-01T00:00:00Z',
  endDate: '2023-12-31T23:59:59Z',
  symbols: ['SPY', 'QQQ', 'IWM', 'EFA', 'EEM'], // Diversifiziertes Portfolio
  initialCapital: 100000,
  maxPositions: 5, // Maximal 5 Positionen gleichzeitig
  rebalanceFrequency: 'weekly' // Wöchentliche Rebalancierung
});
```

### 2. Risk Management

```typescript
const backtest = await client.backtests.create({
  startDate: '2023-01-01T00:00:00Z',
  endDate: '2023-12-31T23:59:59Z',
  symbols: ['SPY', 'QQQ', 'IWM'],
  initialCapital: 100000,
  
  // Risk Management
  stopLoss: 0.05, // 5% Stop-Loss
  takeProfit: 0.15, // 15% Take-Profit
  
  // Filter
  filters: {
    minScore: 0.7, // Mindest-Score für Signale
    maxRisk: 0.3, // Maximales Risiko
    minLiquidity: 1000000, // Mindest-Liquidität
    marketCap: {
      min: 1000000000, // Mindest-Marktkapitalisierung: 1B
      max: 10000000000 // Maximal-Marktkapitalisierung: 10B
    }
  }
});
```

### 3. Strategien

```typescript
const backtest = await client.backtests.create({
  startDate: '2023-01-01T00:00:00Z',
  endDate: '2023-12-31T23:59:59Z',
  symbols: ['SPY', 'QQQ', 'IWM'],
  initialCapital: 100000,
  
  // Strategien
  strategies: ['momentum', 'mean_reversion', 'value', 'growth'],
  
  // Rebalancierung
  rebalanceFrequency: 'daily', // Täglich, wöchentlich oder monatlich
  
  // Position Sizing
  maxPositions: 10, // Maximal 10 Positionen
  positionSize: 0.1 // 10% pro Position
});
```

## Performance-Analyse

### 1. Basis-Metriken verstehen

#### Total Return
- **Definition**: Gesamtrendite über den gesamten Zeitraum
- **Berechnung**: (Endkapital - Startkapital) / Startkapital
- **Beispiel**: 15% bedeutet 15% Gewinn über den gesamten Zeitraum

#### Annualized Return
- **Definition**: Annualisierte Rendite
- **Berechnung**: (1 + Total Return)^(252/Tage) - 1
- **Beispiel**: 12% bedeutet 12% pro Jahr

#### Volatility
- **Definition**: Standardabweichung der täglichen Renditen
- **Berechnung**: √(Σ(Rendite - Durchschnitt)² / (n-1))
- **Beispiel**: 20% bedeutet 20% Volatilität

#### Sharpe Ratio
- **Definition**: Risiko-adjustierte Rendite
- **Berechnung**: (Rendite - Risikofreier Zins) / Volatilität
- **Beispiel**: 1.5 bedeutet 1.5 Einheiten Rendite pro Risiko-Einheit

#### Max Drawdown
- **Definition**: Maximaler Verlust von einem Hochpunkt
- **Berechnung**: Min(Peak - Trough) / Peak
- **Beispiel**: -10% bedeutet maximal 10% Verlust

### 2. Trade-Metriken

#### Win Rate
- **Definition**: Prozentsatz der gewinnbringenden Trades
- **Berechnung**: Gewinnbringende Trades / Gesamte Trades
- **Beispiel**: 60% bedeutet 60% der Trades waren profitabel

#### Average Win/Loss
- **Definition**: Durchschnittlicher Gewinn/Verlust pro Trade
- **Berechnung**: Summe der Gewinne/Verluste / Anzahl
- **Beispiel**: $500 Gewinn, $300 Verlust

#### Profit Factor
- **Definition**: Verhältnis von Gesamtgewinn zu Gesamtverlust
- **Berechnung**: Summe der Gewinne / Summe der Verluste
- **Beispiel**: 1.5 bedeutet 1.5x mehr Gewinn als Verlust

### 3. Risiko-Metriken

#### VaR (Value at Risk)
- **Definition**: Maximaler erwarteter Verlust bei 95% Konfidenz
- **Berechnung**: 5. Perzentil der Renditen
- **Beispiel**: -2% bedeutet 95% Chance, dass Verlust nicht über 2% liegt

#### CVaR (Conditional Value at Risk)
- **Definition**: Durchschnittlicher Verlust in den schlimmsten 5% der Fälle
- **Berechnung**: Durchschnitt der 5% schlechtesten Renditen
- **Beispiel**: -3% bedeutet durchschnittlich 3% Verlust in den schlimmsten Fällen

#### Beta
- **Definition**: Sensitivität gegenüber Marktbewegungen
- **Berechnung**: Kovarianz(Portfolio, Markt) / Varianz(Markt)
- **Beispiel**: 1.2 bedeutet 20% mehr Bewegung als der Markt

#### Alpha
- **Definition**: Überrendite nach Risiko-Adjustierung
- **Berechnung**: Portfolio-Rendite - (Risikofreier Zins + Beta × (Markt-Rendite - Risikofreier Zins))
- **Beispiel**: 2% bedeutet 2% Überrendite

## Benchmark-Vergleich

### 1. S&P 500 (SPY)
- **Beschreibung**: Breiter Markt-Index
- **Verwendung**: Allgemeine Markt-Benchmark
- **Eigenschaften**: Diversifiziert, Liquid, Niedrige Kosten

### 2. NASDAQ (QQQ)
- **Beschreibung**: Tech-schwerer Index
- **Verwendung**: Tech-Benchmark
- **Eigenschaften**: Hohe Volatilität, Wachstumsorientiert

### 3. Bonds (TLT)
- **Beschreibung**: Langfristige Staatsanleihen
- **Verwendung**: Fixed Income Benchmark
- **Eigenschaften**: Niedrige Volatilität, Defensiv

### Benchmark-Vergleich interpretieren

```typescript
const results = await client.backtests.getResults(backtest.id);

console.log('=== BENCHMARK VERGLEICH ===');
console.log('Portfolio Return:', (results.totalReturn * 100).toFixed(2) + '%');
console.log('S&P 500 Return:', (results.benchmarks.sp500.totalReturn * 100).toFixed(2) + '%');
console.log('NASDAQ Return:', (results.benchmarks.nasdaq.totalReturn * 100).toFixed(2) + '%');
console.log('Bonds Return:', (results.benchmarks.bonds.totalReturn * 100).toFixed(2) + '%');

console.log('=== RISIKO-ADJUSTIERTE METRIKEN ===');
console.log('Portfolio Sharpe:', results.sharpeRatio.toFixed(2));
console.log('S&P 500 Sharpe:', results.benchmarks.sp500.sharpeRatio.toFixed(2));
console.log('NASDAQ Sharpe:', results.benchmarks.nasdaq.sharpeRatio.toFixed(2));
console.log('Bonds Sharpe:', results.benchmarks.bonds.sharpeRatio.toFixed(2));
```

## Optimierung

### 1. Parameter-Tuning

```typescript
// Verschiedene Parameter testen
const parameters = [
  { minScore: 0.6, maxRisk: 0.2 },
  { minScore: 0.7, maxRisk: 0.3 },
  { minScore: 0.8, maxRisk: 0.4 }
];

const results = [];

for (const params of parameters) {
  const backtest = await client.backtests.create({
    startDate: '2023-01-01T00:00:00Z',
    endDate: '2023-12-31T23:59:59Z',
    symbols: ['SPY', 'QQQ', 'IWM'],
    initialCapital: 100000,
    filters: params
  });
  
  const result = await client.backtests.getResults(backtest.id);
  results.push({ params, result });
}

// Beste Parameter finden
const bestResult = results.reduce((best, current) => 
  current.result.sharpeRatio > best.result.sharpeRatio ? current : best
);

console.log('Beste Parameter:', bestResult.params);
console.log('Beste Sharpe Ratio:', bestResult.result.sharpeRatio);
```

### 2. Walk-Forward-Analyse

```typescript
// Walk-Forward-Analyse über 12 Monate
const startDate = new Date('2023-01-01');
const endDate = new Date('2023-12-31');
const windowSize = 6; // 6 Monate Training
const stepSize = 1; // 1 Monat Schritt

const results = [];

for (let i = 0; i < 12; i++) {
  const trainStart = new Date(startDate);
  trainStart.setMonth(trainStart.getMonth() + i);
  
  const trainEnd = new Date(trainStart);
  trainEnd.setMonth(trainEnd.getMonth() + windowSize);
  
  const testStart = new Date(trainEnd);
  const testEnd = new Date(testStart);
  testEnd.setMonth(testEnd.getMonth() + stepSize);
  
  // Training
  const trainBacktest = await client.backtests.create({
    startDate: trainStart.toISOString(),
    endDate: trainEnd.toISOString(),
    symbols: ['SPY', 'QQQ', 'IWM'],
    initialCapital: 100000
  });
  
  const trainResult = await client.backtests.getResults(trainBacktest.id);
  
  // Testing
  const testBacktest = await client.backtests.create({
    startDate: testStart.toISOString(),
    endDate: testEnd.toISOString(),
    symbols: ['SPY', 'QQQ', 'IWM'],
    initialCapital: 100000,
    filters: {
      minScore: trainResult.optimalMinScore,
      maxRisk: trainResult.optimalMaxRisk
    }
  });
  
  const testResult = await client.backtests.getResults(testBacktest.id);
  results.push({ trainResult, testResult });
}

// Durchschnittliche Performance
const avgTestReturn = results.reduce((sum, r) => sum + r.testResult.totalReturn, 0) / results.length;
console.log('Durchschnittliche Test-Rendite:', (avgTestReturn * 100).toFixed(2) + '%');
```

## Best Practices

### 1. Datenqualität

- **Vollständigkeit**: Prüfen Sie auf fehlende Daten
- **Konsistenz**: Verwenden Sie konsistente Zeitstempel
- **Bereinigung**: Entfernen Sie Ausreißer und Fehler

### 2. Overfitting vermeiden

- **Out-of-Sample-Testing**: Verwenden Sie separate Test-Daten
- **Walk-Forward-Analyse**: Kontinuierliche Validierung
- **Parameter-Stabilität**: Prüfen Sie auf stabile Parameter

### 3. Realistische Annahmen

- **Transaktionskosten**: Berücksichtigen Sie echte Kosten
- **Slippage**: Berücksichtigen Sie Markt-Impact
- **Liquidität**: Prüfen Sie auf ausreichende Liquidität

### 4. Risiko-Management

- **Diversifikation**: Streuen Sie das Risiko
- **Position Sizing**: Begrenzen Sie die Positionsgröße
- **Stop-Loss**: Implementieren Sie Verlustbegrenzung

## Häufige Fehler

### 1. Look-Ahead Bias
- **Problem**: Verwendung zukünftiger Informationen
- **Lösung**: Strikte Zeitstempel-Validierung

### 2. Survivorship Bias
- **Problem**: Nur erfolgreiche Unternehmen in den Daten
- **Lösung**: Vollständige historische Daten verwenden

### 3. Overfitting
- **Problem**: Zu starke Anpassung an historische Daten
- **Lösung**: Out-of-Sample-Testing

### 4. Unrealistische Annahmen
- **Problem**: Ignorierung von Kosten und Slippage
- **Lösung**: Realistische Parameter verwenden

## Troubleshooting

### 1. API-Fehler

```typescript
try {
  const backtest = await client.backtests.create(request);
} catch (error) {
  if (error.code === 'RATE_LIMIT_EXCEEDED') {
    // Rate Limit - warten und wiederholen
    await new Promise(resolve => setTimeout(resolve, 60000));
    const backtest = await client.backtests.create(request);
  } else if (error.code === 'INVALID_REQUEST') {
    // Ungültige Anfrage - Parameter prüfen
    console.error('Invalid request:', error.details);
  } else {
    // Andere Fehler
    console.error('Unexpected error:', error);
  }
}
```

### 2. Datenprobleme

```typescript
// Datenqualität prüfen
const dataQuality = await client.backtests.checkDataQuality({
  symbols: ['SPY', 'QQQ', 'IWM'],
  startDate: '2023-01-01T00:00:00Z',
  endDate: '2023-12-31T23:59:59Z'
});

console.log('Data Quality:', dataQuality);
// { completeness: 0.95, consistency: 0.98, accuracy: 0.97 }
```

### 3. Performance-Probleme

```typescript
// Performance-Monitoring
const performance = await client.backtests.getPerformance({
  backtestId: backtest.id
});

console.log('Performance:', performance);
// { cpuUsage: 0.75, memoryUsage: 0.60, duration: 300 }
```

## Support

### Dokumentation
- **API Docs**: https://docs.ai-investment.com/backtesting
- **Examples**: https://github.com/ai-investment/backtesting-examples
- **Tutorials**: https://tutorials.ai-investment.com/backtesting

### Community
- **GitHub Issues**: https://github.com/ai-investment/backtesting/issues
- **Discord**: https://discord.gg/ai-investment
- **Stack Overflow**: Tag: `ai-investment-backtesting`

### Support
- **Email**: backtesting-support@ai-investment.com
- **Status**: https://status.ai-investment.com
- **Status Page**: https://status.ai-investment.com
