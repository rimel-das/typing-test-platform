/**
 * Production-Grade Logger Utility
 * Provides structured logging with request context
 * Pattern: Senior developer standard for 20+ years
 */

export enum LogLevel {
  ERROR = "ERROR",
  WARN = "WARN",
  INFO = "INFO",
  DEBUG = "DEBUG",
}

interface LogContext {
  requestId?: string;
  userId?: string;
  endpoint?: string;
  method?: string;
  [key: string]: any;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV !== "production";

  /**
   * Log with context and stack trace
   */
  private log(
    level: LogLevel,
    message: string,
    error?: Error | null,
    context?: LogContext,
  ): void {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` | ${JSON.stringify(context)}` : "";
    const errorStack = error ? `\n${error.stack}` : "";

    const logMessage = `[${timestamp}] [${level}] ${message}${contextStr}${errorStack}`;

    switch (level) {
      case LogLevel.ERROR:
        console.error(logMessage);
        break;
      case LogLevel.WARN:
        console.warn(logMessage);
        break;
      case LogLevel.INFO:
        console.log(logMessage);
        break;
      case LogLevel.DEBUG:
        if (this.isDevelopment) {
          console.log(logMessage);
        }
        break;
    }
  }

  error(message: string, error?: Error | null, context?: LogContext): void {
    this.log(LogLevel.ERROR, message, error, context);
  }

  warn(message: string, context?: LogContext): void {
    this.log(LogLevel.WARN, message, null, context);
  }

  info(message: string, context?: LogContext): void {
    this.log(LogLevel.INFO, message, null, context);
  }

  debug(message: string, context?: LogContext): void {
    this.log(LogLevel.DEBUG, message, null, context);
  }
}

export const logger = new Logger();
