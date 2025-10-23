import { Logger as WinstonLogger, createLogger, format, transports } from 'winston';

export interface LogContext {
  reqId?: string;
  userId?: string;
  module?: string;
  costTokens?: number;
  [key: string]: any;
}

export class Logger {
  private logger: WinstonLogger;
  private context: LogContext;

  constructor(context: LogContext = {}) {
    this.context = context;
    
    this.logger = createLogger({
      level: process.env['LOG_LEVEL'] || 'info',
      format: format.combine(
        format.timestamp(),
        format.errors({ stack: true }),
        format.json()
      ),
      defaultMeta: {
        service: 'ai-investment',
        version: '1.0.0',
        environment: process.env['NODE_ENV'] || 'development'
      },
      transports: [
        new transports.Console({
          format: format.combine(
            format.colorize(),
            format.simple()
          )
        })
      ]
    });

    // Add file transport in production
    if (process.env['NODE_ENV'] === 'production') {
      this.logger.add(new transports.File({
        filename: 'logs/error.log',
        level: 'error',
        format: format.combine(
          format.timestamp(),
          format.json()
        )
      }));

      this.logger.add(new transports.File({
        filename: 'logs/combined.log',
        format: format.combine(
          format.timestamp(),
          format.json()
        )
      }));
    }
  }

  private createLogEntry(level: string, message: string, data?: any): any {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: this.context,
      data,
      reqId: this.context.reqId,
      userId: this.context.userId,
      module: this.context.module,
      costTokens: this.context.costTokens
    };
  }

  info(message: string, data?: any): void {
    this.logger.info(message, this.createLogEntry('info', message, data));
  }

  error(message: string, error?: Error, data?: any): void {
    this.logger.error(message, this.createLogEntry('error', message, {
      error: error?.stack,
      ...data
    }));
  }

  warn(message: string, data?: any): void {
    this.logger.warn(message, this.createLogEntry('warn', message, data));
  }

  debug(message: string, data?: any): void {
    this.logger.debug(message, this.createLogEntry('debug', message, data));
  }

  // Business-specific logging methods
  signalProcessed(signalId: string, source: string, score: number): void {
    this.info('Signal processed', {
      signalId,
      source,
      score,
      type: 'signal_processed'
    });
  }

  proposalGenerated(proposalId: string, assets: string[], sizePct: number): void {
    this.info('Proposal generated', {
      proposalId,
      assets,
      sizePct,
      type: 'proposal_generated'
    });
  }

  decisionMade(proposalId: string, action: string, userId: string): void {
    this.info('Decision made', {
      proposalId,
      action,
      userId,
      type: 'decision_made'
    });
  }

  outcomeEvaluated(outcomeId: string, pnlPct: number, hit: boolean): void {
    this.info('Outcome evaluated', {
      outcomeId,
      pnlPct,
      hit,
      type: 'outcome_evaluated'
    });
  }

  costTracked(operation: string, tokens: number, cost: number): void {
    this.info('Cost tracked', {
      operation,
      tokens,
      cost,
      type: 'cost_tracked'
    });
  }

  performanceMeasured(operation: string, duration: number, memory: number): void {
    this.info('Performance measured', {
      operation,
      duration,
      memory,
      type: 'performance_measured'
    });
  }

  securityEvent(event: string, severity: 'low' | 'medium' | 'high' | 'critical', details: any): void {
    this.warn('Security event', {
      event,
      severity,
      details,
      type: 'security_event'
    });
  }

  // Set context for subsequent logs
  setContext(context: LogContext): void {
    this.context = { ...this.context, ...context };
  }

  // Create child logger with additional context
  child(context: LogContext): Logger {
    return new Logger({ ...this.context, ...context });
  }
}

// Default logger instance
export const logger = new Logger();

// Factory function for creating loggers with context
export function createLoggerWithContext(context: LogContext): Logger {
  return new Logger(context);
}

// Structured logging for different modules
export class ModuleLogger {
  private logger: Logger;
  private module: string;

  constructor(module: string, context: LogContext = {}) {
    this.module = module;
    this.logger = new Logger({ ...context, module });
  }

  info(message: string, data?: any): void {
    this.logger.info(`[${this.module}] ${message}`, data);
  }

  error(message: string, error?: Error, data?: any): void {
    this.logger.error(`[${this.module}] ${message}`, error, data);
  }

  warn(message: string, data?: any): void {
    this.logger.warn(`[${this.module}] ${message}`, data);
  }

  debug(message: string, data?: any): void {
    this.logger.debug(`[${this.module}] ${message}`, data);
  }
}

// Export default logger
export default logger;
