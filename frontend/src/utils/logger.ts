/**
 * 前端日志工具
 * Frontend Logger Utility
 *
 * 提供统一的日志接口，支持环境控制
 * Provides unified logging interface with environment control
 */

const LogLevel = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  NONE: 4
} as const

type LogLevel = typeof LogLevel[keyof typeof LogLevel]

class Logger {
  private level: number

  constructor() {
    // 根据环境设置日志级别
    // Set log level based on environment
    const isProduction = import.meta.env.MODE === 'production'
    this.level = isProduction ? LogLevel.WARN : LogLevel.DEBUG
  }

  private shouldLog(level: number): boolean {
    return level >= this.level
  }

  debug(...args: unknown[]): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.debug('[DEBUG]', ...args)
    }
  }

  info(...args: unknown[]): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.info('[INFO]', ...args)
    }
  }

  warn(...args: unknown[]): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn('[WARN]', ...args)
    }
  }

  error(...args: unknown[]): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      console.error('[ERROR]', ...args)
    }
  }
}

export const logger = new Logger()