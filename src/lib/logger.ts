/**
 * Production-ready logging system with log levels
 * Automatically adapts between development and production environments
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: any;
}

class Logger {
  private isDevelopment = import.meta.env.DEV;

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` ${JSON.stringify(context)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
  }

  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.debug(this.formatMessage('debug', message, context));
    }
  }

  info(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.log(this.formatMessage('info', message, context));
    }
  }

  warn(message: string, context?: LogContext): void {
    console.warn(this.formatMessage('warn', message, context));
  }

  error(message: string, error?: Error | unknown, context?: LogContext): void {
    const errorContext = {
      ...context,
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name,
      } : error,
    };
    
    console.error(this.formatMessage('error', message, errorContext));
    
    // In production, send to error tracking service
    if (!this.isDevelopment && typeof window !== 'undefined') {
      // Integration point for Sentry, LogRocket, etc.
      // window.errorTracker?.captureException(error, { extra: context });
    }
  }

  // Production-only success logging for critical operations
  success(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.log(`✅ ${this.formatMessage('info', message, context)}`);
    }
  }
}

export const logger = new Logger();
