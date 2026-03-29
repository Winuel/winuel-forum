/**
 * 安全日志工具
 * Secure Logger Utility
 *
 * 提供安全的日志记录功能，在生产环境中自动过滤敏感信息
 * Provides secure logging functionality, automatically filters sensitive information in production
 *
 * @package backend/src/utils
 */

/**
 * 全局对象接口
 * Global Object Interface
 */
interface GlobalObject {
  ENVIRONMENT?: 'development' | 'production' | 'test'
}

/**
 * 敏感字段列表
 * Sensitive Fields List
 *
 * 这些字段在日志中应该被过滤或脱敏
 * These fields should be filtered or masked in logs
 */
const SENSITIVE_FIELDS = [
  'password',
  'token',
  'secret',
  'key',
  'authorization',
  'cookie',
  'session',
  'jwt',
  'api_key',
  'access_token',
  'refresh_token',
  'client_secret',
  'client_id',
  'oauth_token',
  'csrf_token',
  'session_id',
  'email',
  'username',
  'phone',
  'credit_card',
  'ssn',
  'address',
]

/**
 * 日志级别枚举
 * Log Level Enum
 */
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal',
}

/**
 * 日志配置
 * Log Configuration
 */
export interface LogConfig {
  level: LogLevel
  enableConsole: boolean
  enableFile: boolean
  environment: 'development' | 'production' | 'test'
}

/**
 * 日志记录器类
 * Logger Class
 * 
 * 提供安全的日志记录功能
 * Provides secure logging functionality
 */
export class Logger {
  private config: LogConfig

  constructor(config?: Partial<LogConfig>) {
    this.config = {
      level: LogLevel.INFO,
      enableConsole: true,
      enableFile: false,
      environment: (globalThis as GlobalObject).ENVIRONMENT || 'development',
      ...config
    }
  }

  /**
   * 脱敏对象
   * Sanitize Object
   *
   * 移除或脱敏敏感字段
   * Remove or mask sensitive fields
   *
   * @param obj - 待脱敏的对象 / Object to sanitize
   * @returns 脱敏后的对象 / Sanitized object
   */
  private sanitizeObject(obj: unknown): unknown {
    if (!obj || typeof obj !== 'object') {
      return obj
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item))
    }

    const sanitized: Record<string, unknown> = {}

    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      const keyLower = key.toLowerCase()

      // 检查是否是敏感字段
      // Check if it's a sensitive field
      if (SENSITIVE_FIELDS.some(field => keyLower.includes(field))) {
        // 在生产环境中完全移除敏感字段
        // Remove sensitive fields entirely in production
        if (this.config.environment === 'production') {
          continue
        }

        // 在开发环境中显示部分信息
        // Show partial information in development
        if (typeof value === 'string') {
          if (value.length <= 8) {
            sanitized[key] = '***'
          } else {
            sanitized[key] = value.substring(0, 4) + '...' + value.substring(value.length - 4)
          }
        } else {
          sanitized[key] = '***'
        }
      } else {
        sanitized[key] = this.sanitizeObject(value)
      }
    }

    return sanitized
  }

  /**
   * 格式化日志消息
   * Format Log Message
   *
   * @param level - 日志级别 / Log level
   * @param message - 日志消息 / Log message
   * @param data - 附加数据 / Additional data
   * @returns 格式化后的日志消息 / Formatted log message
   */
  private formatMessage(level: LogLevel, message: string, data?: unknown): string {
    const timestamp = new Date().toISOString()
    const sanitizedData = data ? this.sanitizeObject(data) : undefined

    if (sanitizedData) {
      return `[${timestamp}] [${level.toUpperCase()}] ${message} ${JSON.stringify(sanitizedData)}`
    }

    return `[${timestamp}] [${level.toUpperCase()}] ${message}`
  }

  /**
   * 记录日志
   * Log Message
   *
   * @param level - 日志级别 / Log level
   * @param message - 日志消息 / Log message
   * @param data - 附加数据 / Additional data
   */
  private log(level: LogLevel, message: string, data?: unknown): void {
    // 检查日志级别
    // Check log level
    const levelOrder = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR, LogLevel.FATAL]
    const currentLevelIndex = levelOrder.indexOf(this.config.level)
    const messageLevelIndex = levelOrder.indexOf(level)
    
    if (messageLevelIndex < currentLevelIndex) {
      return
    }

    const formattedMessage = this.formatMessage(level, message, data)

    // 输出到控制台
    // Output to console
    if (this.config.enableConsole) {
      switch (level) {
        case LogLevel.DEBUG:
          console.debug(formattedMessage)
          break
        case LogLevel.INFO:
          console.info(formattedMessage)
          break
        case LogLevel.WARN:
          console.warn(formattedMessage)
          break
        case LogLevel.ERROR:
        case LogLevel.FATAL:
          console.error(formattedMessage)
          break
      }
    }

    // 输出到文件（如果启用）
    // Output to file (if enabled)
    if (this.config.enableFile) {
      // TODO: 实现文件日志功能
      // TODO: Implement file logging functionality
    }
  }

  /**
   * 记录 DEBUG 级别日志
   * Log DEBUG level message
   */
  debug(message: string, data?: unknown): void {
    this.log(LogLevel.DEBUG, message, data)
  }

  /**
   * 记录 INFO 级别日志
   * Log INFO level message
   */
  info(message: string, data?: unknown): void {
    this.log(LogLevel.INFO, message, data)
  }

  /**
   * 记录 WARN 级别日志
   * Log WARN level message
   */
  warn(message: string, data?: unknown): void {
    this.log(LogLevel.WARN, message, data)
  }

  /**
   * 记录 ERROR 级别日志
   * Log ERROR level message
   */
  error(message: string, error?: Error | unknown): void {
    const errorData = error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: this.config.environment === 'development' ? error.stack : undefined
    } : error

    this.log(LogLevel.ERROR, message, errorData)
  }

  /**
   * 记录 FATAL 级别日志
   * Log FATAL level message
   */
  fatal(message: string, error?: Error | unknown): void {
    const errorData = error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: this.config.environment === 'development' ? error.stack : undefined
    } : error

    this.log(LogLevel.FATAL, message, errorData)
  }

  /**
   * 设置日志级别
   * Set Log Level
   */
  setLevel(level: LogLevel): void {
    this.config.level = level
  }

  /**
   * 获取当前配置
   * Get Current Configuration
   */
  getConfig(): LogConfig {
    return { ...this.config }
  }
}

/**
 * 默认日志记录器实例
 * Default Logger Instance
 */
export const logger = new Logger()

/**
 * 便捷函数
 * Convenience Functions
 */
export const debug = (message: string, data?: unknown) => logger.debug(message, data)
export const info = (message: string, data?: unknown) => logger.info(message, data)
export const warn = (message: string, data?: unknown) => logger.warn(message, data)
export const error = (message: string, error?: Error | unknown) => logger.error(message, error)
export const fatal = (message: string, error?: Error | unknown) => logger.fatal(message, error)