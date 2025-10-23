# AI Investment System - Backtesting Module

## Übersicht

Das Backtesting-Modul ermöglicht die historische Simulation von Investment-Strategien basierend auf echten Marktdaten und Signalen.

## Features

- **Echte historische Daten**: Integration mit Yahoo Finance, Alpha Vantage, Quandl, IEX, Polygon, Finnhub
- **Umfassende Metriken**: Sharpe Ratio, Sortino Ratio, Calmar Ratio, VaR, CVaR, Beta, Alpha
- **Benchmark-Vergleich**: S&P 500, NASDAQ, Bonds
- **Risk Management**: Stop-Loss, Take-Profit, Position Sizing
- **Performance-Analyse**: Drawdown, Volatilität, Win-Rate, Profit Factor

## API Endpoints

### Backtest erstellen

```http
POST /api/v1/backtests
Content-Type: application/json

{
  "startDate": "2023-01-01T00:00:00Z",
  "endDate": "2023-12-31T23:59:59Z",
  "symbols": ["SPY", "QQQ", "IWM"],
  "strategies": ["momentum", "mean_reversion"],
  "initialCapital": 100000,
  "riskFreeRate": 0.02,
  "commission": 0.001,
  "slippage": 0.0005,
  "maxPositions": 10,
  "rebalanceFrequency": "daily",
  "stopLoss": 0.05,
  "takeProfit": 0.15,
  "filters": {
    "minScore": 0.7,
    "maxRisk": 0.3,
    "minLiquidity": 1000000,
    "marketCap": {
      "min": 1000000000,
      "max": 10000000000
    }
  }
}
```

### Backtest Status abrufen

```http
GET /api/v1/backtests/{backtest_id}
```

### Backtest Ergebnisse abrufen

```http
GET /api/v1/backtests/{backtest_id}/results
```

## Datenquellen

### Yahoo Finance
- **URL**: `https://query1.finance.yahoo.com/v8/finance/chart/{symbol}`
- **Parameter**: `period1`, `period2`, `interval`, `range`
- **Format**: JSON mit OHLCV-Daten

### Alpha Vantage
- **URL**: `https://www.alphavantage.co/query`
- **Parameter**: `function=TIME_SERIES_DAILY`, `symbol`, `apikey`
- **Format**: JSON mit täglichen Zeitreihen

### Quandl
- **URL**: `https://www.quandl.com/api/v3/datasets/WIKI/{symbol}.json`
- **Parameter**: `start_date`, `end_date`, `api_key`
- **Format**: JSON mit Datensätzen

### IEX Cloud
- **URL**: `https://cloud.iexapis.com/stable/stock/{symbol}/chart/1y`
- **Parameter**: `token`
- **Format**: JSON mit Chart-Daten

### Polygon.io
- **URL**: `https://api.polygon.io/v2/aggs/ticker/{symbol}/range/1/day/{start}/{end}`
- **Parameter**: `apikey`
- **Format**: JSON mit Aggregat-Daten

### Finnhub
- **URL**: `https://finnhub.io/api/v1/stock/candle`
- **Parameter**: `symbol`, `resolution`, `from`, `to`, `token`
- **Format**: JSON mit Candle-Daten

## Performance-Metriken

### Basis-Metriken
- **Total Return**: Gesamtrendite
- **Annualized Return**: Annualisierte Rendite
- **Volatility**: Volatilität (Standardabweichung)
- **Sharpe Ratio**: Risiko-adjustierte Rendite
- **Max Drawdown**: Maximaler Verlust

### Trade-Metriken
- **Win Rate**: Gewinnquote
- **Average Win**: Durchschnittlicher Gewinn
- **Average Loss**: Durchschnittlicher Verlust
- **Profit Factor**: Gewinn-Faktor
- **Total Trades**: Anzahl Trades

### Risiko-Metriken
- **VaR (95%)**: Value at Risk
- **CVaR (95%)**: Conditional Value at Risk
- **Beta**: Markt-Beta
- **Alpha**: Alpha (Überrendite)
- **Information Ratio**: Informations-Ratio

### Erweiterte Metriken
- **Calmar Ratio**: Rendite zu Max Drawdown
- **Sortino Ratio**: Downside-Risiko adjustiert
- **Treynor Ratio**: Beta-adjustierte Rendite
- **Jensen Alpha**: Jensen's Alpha
- **Tracking Error**: Tracking-Fehler

## Benchmark-Vergleich

### S&P 500 (SPY)
- **Symbol**: SPY
- **Beschreibung**: S&P 500 Index ETF
- **Verwendung**: Markt-Benchmark

### NASDAQ (QQQ)
- **Symbol**: QQQ
- **Beschreibung**: NASDAQ-100 Index ETF
- **Verwendung**: Tech-Benchmark

### Bonds (TLT)
- **Symbol**: TLT
- **Beschreibung**: 20+ Year Treasury Bond ETF
- **Verwendung**: Fixed Income Benchmark

## Konfiguration

### Environment Variables

```bash
# API Keys
ALPHA_VANTAGE_API_KEY=your_key_here
QUANDL_API_KEY=your_key_here
IEX_API_KEY=your_key_here
POLYGON_API_KEY=your_key_here
FINNHUB_API_KEY=your_key_here

# AWS Configuration
AWS_REGION=eu-central-1
DYNAMODB_TABLE=ai-investment-backtests
S3_BUCKET=ai-investment-backtest-results
```

### DynamoDB Schema

```yaml
Table: ai-investment-backtests
PartitionKey: id (String)
SortKey: createdAt (String)
Attributes:
  - id: String
  - startDate: String
  - endDate: String
  - initialCapital: Number
  - finalCapital: Number
  - totalReturn: Number
  - annualizedReturn: Number
  - volatility: Number
  - sharpeRatio: Number
  - maxDrawdown: Number
  - winRate: Number
  - totalTrades: Number
  - profitableTrades: Number
  - averageWin: Number
  - averageLoss: Number
  - profitFactor: Number
  - calmarRatio: Number
  - sortinoRatio: Number
  - var95: Number
  - cvar95: Number
  - beta: Number
  - alpha: Number
  - informationRatio: Number
  - trackingError: Number
  - treynorRatio: Number
  - jensenAlpha: Number
  - metrics: Map
  - trades: List
  - positions: List
  - benchmarks: Map
  - createdAt: String
  - status: String
```

## Verwendung

### 1. Backtest starten

```typescript
import { AIIvestmentClient } from '@ai-investment/api-client';

const client = new AIIvestmentClient({
  baseUrl: 'https://api.production.ai-investment.com',
  apiKey: 'your-api-key'
});

const backtest = await client.backtests.create({
  startDate: '2023-01-01T00:00:00Z',
  endDate: '2023-12-31T23:59:59Z',
  symbols: ['SPY', 'QQQ', 'IWM'],
  initialCapital: 100000,
  riskFreeRate: 0.02,
  commission: 0.001,
  slippage: 0.0005
});
```

### 2. Status prüfen

```typescript
const status = await client.backtests.getStatus(backtest.id);
console.log('Status:', status.status);
```

### 3. Ergebnisse abrufen

```typescript
const results = await client.backtests.getResults(backtest.id);
console.log('Total Return:', results.totalReturn);
console.log('Sharpe Ratio:', results.sharpeRatio);
console.log('Max Drawdown:', results.maxDrawdown);
```

## Fehlerbehebung

### Häufige Probleme

1. **API Rate Limits**
   - Lösung: Implementierung von Retry-Logic
   - Fallback: Wechsel zu alternativen Datenquellen

2. **Datenqualität**
   - Lösung: Validierung und Bereinigung der Daten
   - Fallback: Interpolation fehlender Werte

3. **Memory Issues**
   - Lösung: Streaming-Verarbeitung großer Datensätze
   - Fallback: Chunking der Daten

4. **Timeout**
   - Lösung: Asynchrone Verarbeitung
   - Fallback: Status-Updates und Resume-Funktionalität

### Debug Commands

```bash
# Lambda Logs
aws logs tail /aws/lambda/ai-investment-backtesting --follow

# DynamoDB Items
aws dynamodb scan --table-name ai-investment-backtests

# S3 Bucket
aws s3 ls s3://ai-investment-backtest-results/
```

## Performance

### Benchmarks

- **Datenabruf**: 1000 Symbole in 5 Minuten
- **Backtest-Simulation**: 1 Jahr in 30 Sekunden
- **Metriken-Berechnung**: 1000 Trades in 10 Sekunden
- **Speicherverbrauch**: 512MB für 1 Jahr Daten

### Optimierung

- **Parallelisierung**: Gleichzeitiger Abruf mehrerer Symbole
- **Caching**: Zwischenspeicherung häufig genutzter Daten
- **Streaming**: Verarbeitung großer Datensätze ohne Memory-Overflow
- **Compression**: Komprimierung der Ergebnisse

## Sicherheit

### API Keys

- **Verschlüsselung**: AWS Secrets Manager
- **Rotation**: Automatische Rotation alle 90 Tage
- **Monitoring**: Überwachung der API-Nutzung

### Daten

- **Verschlüsselung**: S3 Server-Side Encryption
- **Zugriff**: IAM-basierte Zugriffskontrolle
- **Audit**: CloudTrail-Logging

## Kosten

### Schätzung (monatlich)

- **Lambda**: $20-50
- **DynamoDB**: $10-30
- **S3**: $5-15
- **API Calls**: $50-200
- **Gesamt**: $85-295

### Optimierung

- **Caching**: Reduzierung der API-Calls
- **Compression**: Reduzierung der S3-Kosten
- **Lifecycle**: Automatische Archivierung alter Daten
- **On-Demand**: DynamoDB On-Demand für unvorhersagbare Workloads
