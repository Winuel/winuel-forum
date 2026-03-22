/**
 * 统一日志系统
 * 提供结构化日志记录，支持不同日志级别和上下文信息
 */

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

export interface LogContext {
  userId?: string
  requestId?: string
  path?: string
  method?: string
  userAgent?: string
  ipAddress?: string
  [key: string]: any
}

export interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  context?: LogContext
  error?: Error
}

class Logger {
  private readonly isDevelopment = import.meta.env.DEV
  private readonly minLogLevel: LogLevel

  constructor() {
    // 根据环境设置最小日志级别
    this.minLogLevel = this.isDevelopment ? LogLevel.DEBUG : LogLevel.INFO
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR]
    return levels.indexOf(level) >= levels.indexOf(this.minLogLevel)
  }

  private formatTimestamp(): string {
    return new Date().toISOString()
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext, error?: Error): string {
    const timestamp = this.formatTimestamp()
    const contextStr = context ? ` ${JSON.stringify(context)}` : ''
    const errorStr = error ? ` Error: ${error.message}${this.isDevelopment ? `\n${error.stack}` : ''}` : ''
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}${errorStr}`
  }

  debug(message: string, context?: LogContext): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      const formatted = this.formatMessage(LogLevel.DEBUG, message, context)
      console.debug(formatted)
    }
  }

  info(message: string, context?: LogContext): void {
    if (this.shouldLog(LogLevel.INFO)) {
      const formatted = this.formatMessage(LogLevel.INFO, message, context)
      console.info(formatted)
    }
  }

  warn(message: string, context?: LogContext): void {
    if (this.shouldLog(LogLevel.WARN)) {
      const formatted = this.formatMessage(LogLevel.WARN, message, context)
      console.warn(formatted)
    }
  }

  error(message: string, error?: Error, context?: LogContext): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      const formatted = this.formatMessage(LogLevel.ERROR, message, context, error)
      console.error(formatted)
    }
  }

  /**
   * 创建带有上下文的子logger
   */
  child(context: LogContext): ChildLogger {
    return new ChildLogger(this, context)
  }
}

class ChildLogger {
  constructor(
    private readonly parent: Logger,
    private readonly baseContext: LogContext
  ) {}

  private mergeContext(context?: LogContext): LogContext {
    return { ...this.baseContext, ...context }
  }

  debug(message: string, context?: LogContext): void {
    this.parent.debug(message, this.mergeContext(context))
  }

  info(message: string, context?: LogContext): void {
    this.parent.info(message, this.mergeContext(context))
  }

  warn(message: string, context?: LogContext): void {
    this.parent.warn(message, this.mergeContext(context))
  }

  error(message: string, error?: Error, context?: LogContext): void {
    this.parent.error(message, error, this.mergeContext(context))
  }
}

// 导出单例实例
export const logger = new Logger()
export default logger