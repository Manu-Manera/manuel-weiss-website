import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { z } from 'zod';
import { Logger } from '../../packages/common/src/logger';
import { AWSHelpers } from '../../packages/common/src/aws';
import { TimeUtils } from '../../packages/common/src/time';

// Schemas
const BacktestRequestSchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  symbols: z.array(z.string()).optional(),
  strategies: z.array(z.string()).optional(),
  initialCapital: z.number().positive().default(100000),
  riskFreeRate: z.number().min(0).max(1).default(0.02),
  commission: z.number().min(0).default(0.001),
  slippage: z.number().min(0).default(0.0005),
  maxPositions: z.number().int().positive().default(10),
  rebalanceFrequency: z.enum(['daily', 'weekly', 'monthly']).default('daily'),
  stopLoss: z.number().min(0).max(1).optional(),
  takeProfit: z.number().min(0).max(1).optional(),
  filters: z.object({
    minScore: z.number().min(0).max(1).optional(),
    maxRisk: z.number().min(0).max(1).optional(),
    minLiquidity: z.number().positive().optional(),
    marketCap: z.object({
      min: z.number().positive().optional(),
      max: z.number().positive().optional()
    }).optional()
  }).optional()
});

const BacktestResultSchema = z.object({
  id: z.string(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  initialCapital: z.number(),
  finalCapital: z.number(),
  totalReturn: z.number(),
  annualizedReturn: z.number(),
  volatility: z.number(),
  sharpeRatio: z.number(),
  maxDrawdown: z.number(),
  winRate: z.number(),
  totalTrades: z.number(),
  profitableTrades: z.number(),
  averageWin: z.number(),
  averageLoss: z.number(),
  profitFactor: z.number(),
  calmarRatio: z.number(),
  sortinoRatio: z.number(),
  var95: z.number(),
  cvar95: z.number(),
  beta: z.number(),
  alpha: z.number(),
  informationRatio: z.number(),
  trackingError: z.number(),
  treynorRatio: z.number(),
  jensenAlpha: z.number(),
  metrics: z.object({
    dailyReturns: z.array(z.number()),
    cumulativeReturns: z.array(z.number()),
    drawdowns: z.array(z.number()),
    rollingSharpe: z.array(z.number()),
    rollingVolatility: z.array(z.number()),
    rollingBeta: z.array(z.number()),
    rollingAlpha: z.array(z.number())
  }),
  trades: z.array(z.object({
    id: z.string(),
    symbol: z.string(),
    action: z.enum(['buy', 'sell']),
    quantity: z.number(),
    price: z.number(),
    timestamp: z.string().datetime(),
    pnl: z.number(),
    commission: z.number(),
    slippage: z.number(),
    signal: z.object({
      id: z.string(),
      source: z.string(),
      score: z.number(),
      confidence: z.number()
    })
  })),
  positions: z.array(z.object({
    symbol: z.string(),
    quantity: z.number(),
    averagePrice: z.number(),
    currentPrice: z.number(),
    unrealizedPnl: z.number(),
    realizedPnl: z.number(),
    weight: z.number(),
    beta: z.number(),
    volatility: z.number()
  })),
  benchmarks: z.object({
    sp500: z.object({
      totalReturn: z.number(),
      annualizedReturn: z.number(),
      volatility: z.number(),
      sharpeRatio: z.number(),
      maxDrawdown: z.number()
    }),
    nasdaq: z.object({
      totalReturn: z.number(),
      annualizedReturn: z.number(),
      volatility: z.number(),
      sharpeRatio: z.number(),
      maxDrawdown: z.number()
    }),
    bonds: z.object({
      totalReturn: z.number(),
      annualizedReturn: z.number(),
      volatility: z.number(),
      sharpeRatio: z.number(),
      maxDrawdown: z.number()
    })
  }),
  createdAt: z.string().datetime(),
  status: z.enum(['running', 'completed', 'failed', 'cancelled'])
});

type BacktestRequest = z.infer<typeof BacktestRequestSchema>;
type BacktestResult = z.infer<typeof BacktestResultSchema>;

const logger = new Logger('backtesting');
const aws = new AWSHelpers();

// Historical Data Sources
const HISTORICAL_DATA_SOURCES = {
  yahoo: 'https://query1.finance.yahoo.com/v8/finance/chart/',
  alphaVantage: 'https://www.alphavantage.co/query',
  quandl: 'https://www.quandl.com/api/v3/datasets',
  iex: 'https://cloud.iexapis.com/stable/stock',
  polygon: 'https://api.polygon.io/v2/aggs/ticker',
  finnhub: 'https://finnhub.io/api/v1'
};

// Market Data APIs
const MARKET_DATA_APIS = {
  yahoo: {
    baseUrl: 'https://query1.finance.yahoo.com/v8/finance/chart',
    params: {
      interval: '1d',
      range: 'max',
      includePrePost: 'false',
      useYfid: 'true',
      corsDomain: 'finance.yahoo.com'
    }
  },
  alphaVantage: {
    baseUrl: 'https://www.alphavantage.co/query',
    params: {
      function: 'TIME_SERIES_DAILY',
      outputsize: 'full',
      apikey: process.env.ALPHA_VANTAGE_API_KEY
    }
  },
  quandl: {
    baseUrl: 'https://www.quandl.com/api/v3/datasets',
    params: {
      api_key: process.env.QUANDL_API_KEY
    }
  },
  iex: {
    baseUrl: 'https://cloud.iexapis.com/stable/stock',
    params: {
      token: process.env.IEX_API_KEY
    }
  },
  polygon: {
    baseUrl: 'https://api.polygon.io/v2/aggs/ticker',
    params: {
      apikey: process.env.POLYGON_API_KEY
    }
  },
  finnhub: {
    baseUrl: 'https://finnhub.io/api/v1',
    params: {
      token: process.env.FINNHUB_API_KEY
    }
  }
};

// Backtesting Engine
class BacktestingEngine {
  private logger: Logger;
  private aws: AWSHelpers;

  constructor() {
    this.logger = new Logger('backtesting-engine');
    this.aws = new AWSHelpers();
  }

  async runBacktest(request: BacktestRequest): Promise<BacktestResult> {
    try {
      this.logger.info('Starting backtest', { request });

      // 1. Validate request
      const validatedRequest = BacktestRequestSchema.parse(request);
      
      // 2. Generate backtest ID
      const backtestId = `backtest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // 3. Initialize backtest status
      await this.updateBacktestStatus(backtestId, 'running');

      // 4. Fetch historical data
      const historicalData = await this.fetchHistoricalData(validatedRequest);
      
      // 5. Fetch historical signals
      const historicalSignals = await this.fetchHistoricalSignals(validatedRequest);
      
      // 6. Run backtest simulation
      const result = await this.simulateBacktest(validatedRequest, historicalData, historicalSignals);
      
      // 7. Calculate performance metrics
      const metrics = await this.calculateMetrics(result);
      
      // 8. Generate benchmarks
      const benchmarks = await this.generateBenchmarks(validatedRequest, historicalData);
      
      // 9. Create final result
      const backtestResult: BacktestResult = {
        id: backtestId,
        startDate: validatedRequest.startDate,
        endDate: validatedRequest.endDate,
        initialCapital: validatedRequest.initialCapital,
        finalCapital: result.finalCapital,
        totalReturn: result.totalReturn,
        annualizedReturn: metrics.annualizedReturn,
        volatility: metrics.volatility,
        sharpeRatio: metrics.sharpeRatio,
        maxDrawdown: metrics.maxDrawdown,
        winRate: metrics.winRate,
        totalTrades: result.trades.length,
        profitableTrades: result.trades.filter(t => t.pnl > 0).length,
        averageWin: metrics.averageWin,
        averageLoss: metrics.averageLoss,
        profitFactor: metrics.profitFactor,
        calmarRatio: metrics.calmarRatio,
        sortinoRatio: metrics.sortinoRatio,
        var95: metrics.var95,
        cvar95: metrics.cvar95,
        beta: metrics.beta,
        alpha: metrics.alpha,
        informationRatio: metrics.informationRatio,
        trackingError: metrics.trackingError,
        treynorRatio: metrics.treynorRatio,
        jensenAlpha: metrics.jensenAlpha,
        metrics: {
          dailyReturns: result.dailyReturns,
          cumulativeReturns: result.cumulativeReturns,
          drawdowns: result.drawdowns,
          rollingSharpe: result.rollingSharpe,
          rollingVolatility: result.rollingVolatility,
          rollingBeta: result.rollingBeta,
          rollingAlpha: result.rollingAlpha
        },
        trades: result.trades,
        positions: result.positions,
        benchmarks,
        createdAt: new Date().toISOString(),
        status: 'completed'
      };

      // 10. Store result
      await this.storeBacktestResult(backtestResult);

      this.logger.info('Backtest completed', { backtestId, result: backtestResult });
      return backtestResult;

    } catch (error) {
      this.logger.error('Backtest failed', { error: error.message, stack: error.stack });
      throw error;
    }
  }

  private async fetchHistoricalData(request: BacktestRequest): Promise<any> {
    this.logger.info('Fetching historical data', { request });

    const data: any = {};
    
    for (const symbol of request.symbols || ['SPY', 'QQQ', 'IWM']) {
      try {
        // Try multiple data sources
        const sources = ['yahoo', 'alphaVantage', 'quandl', 'iex', 'polygon', 'finnhub'];
        
        for (const source of sources) {
          try {
            const sourceData = await this.fetchFromSource(source, symbol, request.startDate, request.endDate);
            if (sourceData && sourceData.length > 0) {
              data[symbol] = sourceData;
              break;
            }
          } catch (error) {
            this.logger.warn(`Failed to fetch from ${source}`, { symbol, error: error.message });
            continue;
          }
        }
        
        if (!data[symbol]) {
          throw new Error(`Failed to fetch data for ${symbol} from all sources`);
        }
        
      } catch (error) {
        this.logger.error(`Failed to fetch data for ${symbol}`, { error: error.message });
        throw error;
      }
    }

    return data;
  }

  private async fetchFromSource(source: string, symbol: string, startDate: string, endDate: string): Promise<any> {
    const config = MARKET_DATA_APIS[source];
    if (!config) {
      throw new Error(`Unknown data source: ${source}`);
    }

    const url = this.buildUrl(source, symbol, startDate, endDate, config);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return this.parseData(source, data);
  }

  private buildUrl(source: string, symbol: string, startDate: string, endDate: string, config: any): string {
    switch (source) {
      case 'yahoo':
        return `${config.baseUrl}/${symbol}?${new URLSearchParams({
          ...config.params,
          period1: Math.floor(new Date(startDate).getTime() / 1000).toString(),
          period2: Math.floor(new Date(endDate).getTime() / 1000).toString()
        })}`;
      
      case 'alphaVantage':
        return `${config.baseUrl}?${new URLSearchParams({
          ...config.params,
          symbol
        })}`;
      
      case 'quandl':
        return `${config.baseUrl}/WIKI/${symbol}.json?${new URLSearchParams({
          ...config.params,
          start_date: startDate.split('T')[0],
          end_date: endDate.split('T')[0]
        })}`;
      
      case 'iex':
        return `${config.baseUrl}/${symbol}/chart/1y?${new URLSearchParams(config.params)}`;
      
      case 'polygon':
        return `${config.baseUrl}/${symbol}/range/1/day/${startDate.split('T')[0]}/${endDate.split('T')[0]}?${new URLSearchParams(config.params)}`;
      
      case 'finnhub':
        return `${config.baseUrl}/stock/candle?${new URLSearchParams({
          ...config.params,
          symbol,
          resolution: 'D',
          from: Math.floor(new Date(startDate).getTime() / 1000).toString(),
          to: Math.floor(new Date(endDate).getTime() / 1000).toString()
        })}`;
      
      default:
        throw new Error(`Unknown source: ${source}`);
    }
  }

  private parseData(source: string, data: any): any {
    switch (source) {
      case 'yahoo':
        return this.parseYahooData(data);
      case 'alphaVantage':
        return this.parseAlphaVantageData(data);
      case 'quandl':
        return this.parseQuandlData(data);
      case 'iex':
        return this.parseIEXData(data);
      case 'polygon':
        return this.parsePolygonData(data);
      case 'finnhub':
        return this.parseFinnhubData(data);
      default:
        throw new Error(`Unknown source: ${source}`);
    }
  }

  private parseYahooData(data: any): any {
    if (!data.chart?.result?.[0]?.timestamp) {
      throw new Error('Invalid Yahoo data format');
    }

    const result = data.chart.result[0];
    const timestamps = result.timestamp;
    const quotes = result.indicators.quote[0];
    
    return timestamps.map((timestamp: number, index: number) => ({
      date: new Date(timestamp * 1000).toISOString(),
      open: quotes.open[index],
      high: quotes.high[index],
      low: quotes.low[index],
      close: quotes.close[index],
      volume: quotes.volume[index]
    }));
  }

  private parseAlphaVantageData(data: any): any {
    if (!data['Time Series (Daily)']) {
      throw new Error('Invalid Alpha Vantage data format');
    }

    const timeSeries = data['Time Series (Daily)'];
    return Object.entries(timeSeries).map(([date, values]: [string, any]) => ({
      date: new Date(date).toISOString(),
      open: parseFloat(values['1. open']),
      high: parseFloat(values['2. high']),
      low: parseFloat(values['3. low']),
      close: parseFloat(values['4. close']),
      volume: parseInt(values['5. volume'])
    }));
  }

  private parseQuandlData(data: any): any {
    if (!data.dataset?.data) {
      throw new Error('Invalid Quandl data format');
    }

    return data.dataset.data.map((row: any[]) => ({
      date: new Date(row[0]).toISOString(),
      open: row[1],
      high: row[2],
      low: row[3],
      close: row[4],
      volume: row[5]
    }));
  }

  private parseIEXData(data: any): any {
    if (!Array.isArray(data)) {
      throw new Error('Invalid IEX data format');
    }

    return data.map((item: any) => ({
      date: new Date(item.date).toISOString(),
      open: item.open,
      high: item.high,
      low: item.low,
      close: item.close,
      volume: item.volume
    }));
  }

  private parsePolygonData(data: any): any {
    if (!data.results) {
      throw new Error('Invalid Polygon data format');
    }

    return data.results.map((item: any) => ({
      date: new Date(item.t).toISOString(),
      open: item.o,
      high: item.h,
      low: item.l,
      close: item.c,
      volume: item.v
    }));
  }

  private parseFinnhubData(data: any): any {
    if (!data.s || data.s !== 'ok' || !data.c) {
      throw new Error('Invalid Finnhub data format');
    }

    return data.c.map((close: number, index: number) => ({
      date: new Date(data.t[index] * 1000).toISOString(),
      open: data.o[index],
      high: data.h[index],
      low: data.l[index],
      close: close,
      volume: data.v[index]
    }));
  }

  private async fetchHistoricalSignals(request: BacktestRequest): Promise<any[]> {
    this.logger.info('Fetching historical signals', { request });

    try {
      // Query DynamoDB for historical signals
      const signals = await this.aws.dynamoQuery(
        'ai-investment-signals',
        {
          KeyConditionExpression: 'pk = :pk AND sk BETWEEN :start AND :end',
          ExpressionAttributeValues: {
            ':pk': 'SIGNAL',
            ':start': request.startDate,
            ':end': request.endDate
          }
        }
      );

      return signals.Items || [];
    } catch (error) {
      this.logger.error('Failed to fetch historical signals', { error: error.message });
      throw error;
    }
  }

  private async simulateBacktest(request: BacktestRequest, historicalData: any, historicalSignals: any[]): Promise<any> {
    this.logger.info('Simulating backtest', { request });

    const portfolio = {
      cash: request.initialCapital,
      positions: new Map(),
      trades: [],
      dailyReturns: [],
      cumulativeReturns: [],
      drawdowns: [],
      rollingSharpe: [],
      rollingVolatility: [],
      rollingBeta: [],
      rollingAlpha: []
    };

    const startDate = new Date(request.startDate);
    const endDate = new Date(request.endDate);
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      
      // Get signals for this date
      const daySignals = historicalSignals.filter(signal => 
        signal.timestamp.startsWith(dateStr)
      );

      // Process signals
      for (const signal of daySignals) {
        await this.processSignal(signal, portfolio, request, historicalData);
      }

      // Update portfolio values
      await this.updatePortfolioValues(portfolio, historicalData, currentDate);

      // Calculate daily return
      const dailyReturn = this.calculateDailyReturn(portfolio);
      portfolio.dailyReturns.push(dailyReturn);

      // Update cumulative returns
      const cumulativeReturn = this.calculateCumulativeReturn(portfolio);
      portfolio.cumulativeReturns.push(cumulativeReturn);

      // Calculate drawdown
      const drawdown = this.calculateDrawdown(portfolio);
      portfolio.drawdowns.push(drawdown);

      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Calculate final metrics
    const finalCapital = this.calculateFinalCapital(portfolio);
    const totalReturn = (finalCapital - request.initialCapital) / request.initialCapital;

    return {
      finalCapital,
      totalReturn,
      trades: portfolio.trades,
      positions: Array.from(portfolio.positions.values()),
      dailyReturns: portfolio.dailyReturns,
      cumulativeReturns: portfolio.cumulativeReturns,
      drawdowns: portfolio.drawdowns,
      rollingSharpe: portfolio.rollingSharpe,
      rollingVolatility: portfolio.rollingVolatility,
      rollingBeta: portfolio.rollingBeta,
      rollingAlpha: portfolio.rollingAlpha
    };
  }

  private async processSignal(signal: any, portfolio: any, request: BacktestRequest, historicalData: any): Promise<void> {
    // Apply filters
    if (request.filters?.minScore && signal.score < request.filters.minScore) {
      return;
    }

    if (request.filters?.maxRisk && signal.risk > request.filters.maxRisk) {
      return;
    }

    // Generate trade based on signal
    const trade = await this.generateTrade(signal, portfolio, request, historicalData);
    
    if (trade) {
      await this.executeTrade(trade, portfolio, request);
    }
  }

  private async generateTrade(signal: any, portfolio: any, request: BacktestRequest, historicalData: any): Promise<any> {
    // Simple signal-based trading logic
    const symbol = signal.symbol || 'SPY';
    const currentPrice = this.getCurrentPrice(symbol, historicalData, signal.timestamp);
    
    if (!currentPrice) {
      return null;
    }

    const score = signal.score;
    const confidence = signal.confidence || 0.5;
    
    // Determine action based on score
    let action: 'buy' | 'sell' | null = null;
    let quantity = 0;

    if (score > 0.7 && confidence > 0.6) {
      action = 'buy';
      quantity = Math.floor((portfolio.cash * 0.1) / currentPrice); // 10% of cash
    } else if (score < 0.3 && confidence > 0.6) {
      action = 'sell';
      const position = portfolio.positions.get(symbol);
      if (position) {
        quantity = Math.floor(position.quantity * 0.5); // Sell 50% of position
      }
    }

    if (action && quantity > 0) {
      return {
        symbol,
        action,
        quantity,
        price: currentPrice,
        timestamp: signal.timestamp,
        signal
      };
    }

    return null;
  }

  private getCurrentPrice(symbol: string, historicalData: any, timestamp: string): number | null {
    const date = new Date(timestamp).toISOString().split('T')[0];
    const symbolData = historicalData[symbol];
    
    if (!symbolData) {
      return null;
    }

    const dayData = symbolData.find((d: any) => d.date.startsWith(date));
    return dayData ? dayData.close : null;
  }

  private async executeTrade(trade: any, portfolio: any, request: BacktestRequest): Promise<void> {
    const { symbol, action, quantity, price, timestamp } = trade;
    
    // Calculate costs
    const commission = quantity * price * request.commission;
    const slippage = quantity * price * request.slippage;
    const totalCost = quantity * price + commission + slippage;

    if (action === 'buy') {
      if (portfolio.cash >= totalCost) {
        portfolio.cash -= totalCost;
        
        const existingPosition = portfolio.positions.get(symbol);
        if (existingPosition) {
          existingPosition.quantity += quantity;
          existingPosition.averagePrice = 
            (existingPosition.averagePrice * existingPosition.quantity + price * quantity) / 
            (existingPosition.quantity + quantity);
        } else {
          portfolio.positions.set(symbol, {
            symbol,
            quantity,
            averagePrice: price,
            currentPrice: price,
            unrealizedPnl: 0,
            realizedPnl: 0,
            weight: 0,
            beta: 0,
            volatility: 0
          });
        }

        portfolio.trades.push({
          id: `trade-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          symbol,
          action,
          quantity,
          price,
          timestamp,
          pnl: 0,
          commission,
          slippage,
          signal: trade.signal
        });
      }
    } else if (action === 'sell') {
      const position = portfolio.positions.get(symbol);
      if (position && position.quantity >= quantity) {
        const pnl = (price - position.averagePrice) * quantity - commission - slippage;
        
        portfolio.cash += quantity * price - commission - slippage;
        position.quantity -= quantity;
        position.realizedPnl += pnl;

        if (position.quantity === 0) {
          portfolio.positions.delete(symbol);
        }

        portfolio.trades.push({
          id: `trade-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          symbol,
          action,
          quantity,
          price,
          timestamp,
          pnl,
          commission,
          slippage,
          signal: trade.signal
        });
      }
    }
  }

  private async updatePortfolioValues(portfolio: any, historicalData: any, currentDate: Date): Promise<void> {
    const dateStr = currentDate.toISOString().split('T')[0];
    
    for (const [symbol, position] of portfolio.positions) {
      const symbolData = historicalData[symbol];
      if (symbolData) {
        const dayData = symbolData.find((d: any) => d.date.startsWith(dateStr));
        if (dayData) {
          position.currentPrice = dayData.close;
          position.unrealizedPnl = (dayData.close - position.averagePrice) * position.quantity;
        }
      }
    }
  }

  private calculateDailyReturn(portfolio: any): number {
    const totalValue = this.calculateTotalValue(portfolio);
    const previousValue = portfolio.previousValue || portfolio.cash;
    const dailyReturn = (totalValue - previousValue) / previousValue;
    portfolio.previousValue = totalValue;
    return dailyReturn;
  }

  private calculateCumulativeReturn(portfolio: any): number {
    const totalValue = this.calculateTotalValue(portfolio);
    return (totalValue - portfolio.initialCapital) / portfolio.initialCapital;
  }

  private calculateDrawdown(portfolio: any): number {
    const currentValue = this.calculateTotalValue(portfolio);
    const peakValue = Math.max(...portfolio.cumulativeReturns.map((r: number) => 
      portfolio.initialCapital * (1 + r)
    ));
    return (currentValue - peakValue) / peakValue;
  }

  private calculateTotalValue(portfolio: any): number {
    let totalValue = portfolio.cash;
    
    for (const [symbol, position] of portfolio.positions) {
      totalValue += position.quantity * position.currentPrice;
    }
    
    return totalValue;
  }

  private calculateFinalCapital(portfolio: any): number {
    return this.calculateTotalValue(portfolio);
  }

  private async calculateMetrics(result: any): Promise<any> {
    const dailyReturns = result.dailyReturns;
    const cumulativeReturns = result.cumulativeReturns;
    
    // Basic metrics
    const totalReturn = cumulativeReturns[cumulativeReturns.length - 1];
    const annualizedReturn = Math.pow(1 + totalReturn, 252 / dailyReturns.length) - 1;
    const volatility = this.calculateVolatility(dailyReturns);
    const sharpeRatio = this.calculateSharpeRatio(dailyReturns, 0.02);
    const maxDrawdown = Math.min(...result.drawdowns);
    
    // Trade metrics
    const trades = result.trades;
    const profitableTrades = trades.filter((t: any) => t.pnl > 0);
    const winRate = profitableTrades.length / trades.length;
    const averageWin = profitableTrades.length > 0 ? 
      profitableTrades.reduce((sum: number, t: any) => sum + t.pnl, 0) / profitableTrades.length : 0;
    const averageLoss = trades.length - profitableTrades.length > 0 ?
      trades.filter((t: any) => t.pnl < 0).reduce((sum: number, t: any) => sum + t.pnl, 0) / 
      (trades.length - profitableTrades.length) : 0;
    const profitFactor = Math.abs(averageWin / averageLoss);
    
    // Advanced metrics
    const calmarRatio = annualizedReturn / Math.abs(maxDrawdown);
    const sortinoRatio = this.calculateSortinoRatio(dailyReturns, 0.02);
    const var95 = this.calculateVaR(dailyReturns, 0.05);
    const cvar95 = this.calculateCVaR(dailyReturns, 0.05);
    
    // Risk metrics
    const beta = this.calculateBeta(dailyReturns, result.benchmarkReturns || []);
    const alpha = this.calculateAlpha(dailyReturns, result.benchmarkReturns || [], 0.02);
    const informationRatio = this.calculateInformationRatio(dailyReturns, result.benchmarkReturns || []);
    const trackingError = this.calculateTrackingError(dailyReturns, result.benchmarkReturns || []);
    const treynorRatio = this.calculateTreynorRatio(dailyReturns, beta, 0.02);
    const jensenAlpha = this.calculateJensenAlpha(dailyReturns, result.benchmarkReturns || [], 0.02);

    return {
      annualizedReturn,
      volatility,
      sharpeRatio,
      maxDrawdown,
      winRate,
      averageWin,
      averageLoss,
      profitFactor,
      calmarRatio,
      sortinoRatio,
      var95,
      cvar95,
      beta,
      alpha,
      informationRatio,
      trackingError,
      treynorRatio,
      jensenAlpha
    };
  }

  private calculateVolatility(returns: number[]): number {
    const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
    return Math.sqrt(variance);
  }

  private calculateSharpeRatio(returns: number[], riskFreeRate: number): number {
    const meanReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const volatility = this.calculateVolatility(returns);
    return (meanReturn - riskFreeRate) / volatility;
  }

  private calculateSortinoRatio(returns: number[], riskFreeRate: number): number {
    const meanReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const downsideReturns = returns.filter(r => r < riskFreeRate);
    const downsideVolatility = this.calculateVolatility(downsideReturns);
    return (meanReturn - riskFreeRate) / downsideVolatility;
  }

  private calculateVaR(returns: number[], confidence: number): number {
    const sortedReturns = returns.sort((a, b) => a - b);
    const index = Math.floor(sortedReturns.length * confidence);
    return sortedReturns[index];
  }

  private calculateCVaR(returns: number[], confidence: number): number {
    const var = this.calculateVaR(returns, confidence);
    const tailReturns = returns.filter(r => r <= var);
    return tailReturns.reduce((sum, r) => sum + r, 0) / tailReturns.length;
  }

  private calculateBeta(returns: number[], benchmarkReturns: number[]): number {
    if (benchmarkReturns.length === 0) return 1;
    
    const covariance = this.calculateCovariance(returns, benchmarkReturns);
    const benchmarkVariance = this.calculateVariance(benchmarkReturns);
    return covariance / benchmarkVariance;
  }

  private calculateAlpha(returns: number[], benchmarkReturns: number[], riskFreeRate: number): number {
    const beta = this.calculateBeta(returns, benchmarkReturns);
    const meanReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const meanBenchmarkReturn = benchmarkReturns.reduce((sum, r) => sum + r, 0) / benchmarkReturns.length;
    return meanReturn - (riskFreeRate + beta * (meanBenchmarkReturn - riskFreeRate));
  }

  private calculateInformationRatio(returns: number[], benchmarkReturns: number[]): number {
    const excessReturns = returns.map((r, i) => r - (benchmarkReturns[i] || 0));
    const meanExcessReturn = excessReturns.reduce((sum, r) => sum + r, 0) / excessReturns.length;
    const trackingError = this.calculateTrackingError(returns, benchmarkReturns);
    return meanExcessReturn / trackingError;
  }

  private calculateTrackingError(returns: number[], benchmarkReturns: number[]): number {
    const excessReturns = returns.map((r, i) => r - (benchmarkReturns[i] || 0));
    return this.calculateVolatility(excessReturns);
  }

  private calculateTreynorRatio(returns: number[], beta: number, riskFreeRate: number): number {
    const meanReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    return (meanReturn - riskFreeRate) / beta;
  }

  private calculateJensenAlpha(returns: number[], benchmarkReturns: number[], riskFreeRate: number): number {
    return this.calculateAlpha(returns, benchmarkReturns, riskFreeRate);
  }

  private calculateCovariance(returns: number[], benchmarkReturns: number[]): number {
    const meanReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const meanBenchmarkReturn = benchmarkReturns.reduce((sum, r) => sum + r, 0) / benchmarkReturns.length;
    
    let covariance = 0;
    for (let i = 0; i < Math.min(returns.length, benchmarkReturns.length); i++) {
      covariance += (returns[i] - meanReturn) * (benchmarkReturns[i] - meanBenchmarkReturn);
    }
    
    return covariance / Math.min(returns.length, benchmarkReturns.length);
  }

  private calculateVariance(returns: number[]): number {
    const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    return returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
  }

  private async generateBenchmarks(request: BacktestRequest, historicalData: any): Promise<any> {
    const benchmarks = {
      sp500: await this.calculateBenchmark('SPY', historicalData, request),
      nasdaq: await this.calculateBenchmark('QQQ', historicalData, request),
      bonds: await this.calculateBenchmark('TLT', historicalData, request)
    };

    return benchmarks;
  }

  private async calculateBenchmark(symbol: string, historicalData: any, request: BacktestRequest): Promise<any> {
    const data = historicalData[symbol];
    if (!data || data.length === 0) {
      return {
        totalReturn: 0,
        annualizedReturn: 0,
        volatility: 0,
        sharpeRatio: 0,
        maxDrawdown: 0
      };
    }

    const returns = this.calculateReturns(data);
    const totalReturn = returns[returns.length - 1];
    const annualizedReturn = Math.pow(1 + totalReturn, 252 / returns.length) - 1;
    const volatility = this.calculateVolatility(returns);
    const sharpeRatio = this.calculateSharpeRatio(returns, request.riskFreeRate);
    const maxDrawdown = this.calculateMaxDrawdown(returns);

    return {
      totalReturn,
      annualizedReturn,
      volatility,
      sharpeRatio,
      maxDrawdown
    };
  }

  private calculateReturns(data: any[]): number[] {
    const returns = [];
    for (let i = 1; i < data.length; i++) {
      const return_ = (data[i].close - data[i-1].close) / data[i-1].close;
      returns.push(return_);
    }
    return returns;
  }

  private calculateMaxDrawdown(returns: number[]): number {
    let maxDrawdown = 0;
    let peak = 0;
    let cumulative = 0;

    for (const return_ of returns) {
      cumulative += return_;
      if (cumulative > peak) {
        peak = cumulative;
      }
      const drawdown = peak - cumulative;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    }

    return maxDrawdown;
  }

  private async updateBacktestStatus(backtestId: string, status: string): Promise<void> {
    try {
      await this.aws.dynamoPut('ai-investment-backtests', {
        id: backtestId,
        status,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      this.logger.error('Failed to update backtest status', { backtestId, status, error: error.message });
    }
  }

  private async storeBacktestResult(result: BacktestResult): Promise<void> {
    try {
      await this.aws.dynamoPut('ai-investment-backtests', result);
      this.logger.info('Backtest result stored', { backtestId: result.id });
    } catch (error) {
      this.logger.error('Failed to store backtest result', { error: error.message });
      throw error;
    }
  }
}

// Lambda Handler
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const logger = new Logger('backtesting-handler');
  
  try {
    logger.info('Backtesting request received', { event });

    // Parse request body
    const requestBody = JSON.parse(event.body || '{}');
    
    // Validate request
    const validatedRequest = BacktestRequestSchema.parse(requestBody);
    
    // Initialize backtesting engine
    const engine = new BacktestingEngine();
    
    // Run backtest
    const result = await engine.runBacktest(validatedRequest);
    
    logger.info('Backtest completed successfully', { backtestId: result.id });
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
      },
      body: JSON.stringify(result)
    };
    
  } catch (error) {
    logger.error('Backtesting failed', { error: error.message, stack: error.stack });
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: {
          code: 'BACKTEST_ERROR',
          message: error.message,
          timestamp: new Date().toISOString()
        }
      })
    };
  }
};
