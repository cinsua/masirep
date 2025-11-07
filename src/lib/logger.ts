export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

export class Logger {
  private static getLogLevel(): LogLevel {
    if (typeof window === 'undefined') {
      // Server-side: check environment variable
      const envLevel = process.env?.LOG_LEVEL;
      switch (envLevel) {
        case 'error': return LogLevel.ERROR;
        case 'warn': return LogLevel.WARN;
        case 'info': return LogLevel.INFO;
        case 'debug': return LogLevel.DEBUG;
        default: return LogLevel.INFO;
      }
    } else {
      // Client-side: check localStorage or default to INFO
      const localLevel = localStorage.getItem('log_level');
      switch (localLevel) {
        case 'error': return LogLevel.ERROR;
        case 'warn': return LogLevel.WARN;
        case 'info': return LogLevel.INFO;
        case 'debug': return LogLevel.DEBUG;
        default: return LogLevel.INFO;
      }
    }
  }

  static shouldLog(level: LogLevel): boolean {
    const currentLevel = this.getLogLevel();
    return level <= currentLevel;
  }

  static error(message: string, error?: unknown): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      console.error(`[ERROR] ${message}`, error);
    }
  }

  static warn(message: string, data?: unknown): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(`[WARN] ${message}`, data);
    }
  }

  static info(message: string, data?: unknown): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.info(`[INFO] ${message}`, data);
    }
  }

  static debug(message: string, data?: unknown): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.debug(`[DEBUG] ${message}`, data);
    }
  }
}

// Export convenience functions
export const logger = {
  error: Logger.error.bind(Logger),
  warn: Logger.warn.bind(Logger),
  info: Logger.info.bind(Logger),
  debug: Logger.debug.bind(Logger),
};