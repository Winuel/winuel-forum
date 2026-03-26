/**
 * 错误处理工具函数
 * Error Handling Utility Functions
 * 
 * 提供统一的错误处理机制，包括：
 * - 错误代码定义
 * - 错误消息映射
 * - 自定义错误类
 * - 错误响应格式化
 * - 错误日志记录
 * 
 * Provides unified error handling mechanism, including:
 * - Error code definitions
 * - Error message mapping
 * - Custom error class
 * - Error response formatting
 * - Error logging
 * 
 * @package backend/src/utils
 */

interface ApiError {
  /** 错误代码 / Error code */
  code: string
  /** 错误消息 / Error message */
  message: string
  /** 错误详情（可选）/ Error details (optional) */
  details?: string
}

// 错误代码映射 / Error code mapping
const ERROR_CODES = {
  // 认证错误 / Authentication errors
  UNAUTHORIZED: 'UNAUTHORIZED',
  INVALID_TOKEN: 'INVALID_TOKEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',

  // 验证错误 / Validation errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_FIELD: 'MISSING_FIELD',

  // 资源错误 / Resource errors
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  FORBIDDEN: 'FORBIDDEN',

  // 速率限制 / Rate limiting
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',

  // 服务器错误 / Server errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  DATABASE_ERROR: 'DATABASE_ERROR',
}

// 错误消息映射（不包含敏感信息）/ Error message mapping (no sensitive information)
const ERROR_MESSAGES: Record<string, string> = {
  [ERROR_CODES.UNAUTHORIZED]: '未授权访问 / Unauthorized access',
  [ERROR_CODES.INVALID_TOKEN]: '无效的令牌 / Invalid token',
  [ERROR_CODES.TOKEN_EXPIRED]: '令牌已过期 / Token expired',
  [ERROR_CODES.VALIDATION_ERROR]: '输入验证失败 / Input validation failed',
  [ERROR_CODES.INVALID_INPUT]: '无效的输入 / Invalid input',
  [ERROR_CODES.MISSING_FIELD]: '缺少必要字段 / Missing required field',
  [ERROR_CODES.NOT_FOUND]: '资源不存在 / Resource not found',
  [ERROR_CODES.ALREADY_EXISTS]: '资源已存在 / Resource already exists',
  [ERROR_CODES.FORBIDDEN]: '权限不足 / Insufficient permissions',
  [ERROR_CODES.RATE_LIMIT_EXCEEDED]: '请求过于频繁 / Too many requests',
  [ERROR_CODES.INTERNAL_ERROR]: '服务器内部错误 / Internal server error',
  [ERROR_CODES.SERVICE_UNAVAILABLE]: '服务暂时不可用 / Service temporarily unavailable',
  [ERROR_CODES.DATABASE_ERROR]: '数据库操作失败 / Database operation failed',
}

/**
 * 应用程序错误类
 * Application Error Class
 * 
 * 自定义错误类，用于统一处理应用程序错误
 * Custom error class for unified application error handling
 */
export class AppError extends Error {
  /** 错误代码 / Error code */
  code: string
  /** HTTP 状态码 / HTTP status code */
  statusCode: number
  /** 错误详情（可选）/ Error details (optional) */
  details?: string

  /**
   * 构造函数
   * Constructor
   * 
   * @param code - 错误代码 / Error code
   * @param statusCode - HTTP 状态码 / HTTP status code
   * @param details - 错误详情 / Error details
   */
  constructor(code: string, statusCode: number = 500, details?: string) {
    super(ERROR_MESSAGES[code] || '未知错误 / Unknown error')
    this.code = code
    this.statusCode = statusCode
    this.details = details
    this.name = 'AppError'
  }
}

// 创建错误实例的辅助函数 / Helper functions for creating error instances
export const createError = {
  /** 创建未授权错误 / Create unauthorized error */
  unauthorized: (details?: string) => new AppError(ERROR_CODES.UNAUTHORIZED, 401, details),
  /** 创建无效令牌错误 / Create invalid token error */
  invalidToken: (details?: string) => new AppError(ERROR_CODES.INVALID_TOKEN, 401, details),
  /** 创建令牌过期错误 / Create token expired error */
  tokenExpired: (details?: string) => new AppError(ERROR_CODES.TOKEN_EXPIRED, 401, details),
  /** 创建验证错误 / Create validation error */
  validationError: (details?: string) => new AppError(ERROR_CODES.VALIDATION_ERROR, 400, details),
  /** 创建无效输入错误 / Create invalid input error */
  invalidInput: (details?: string) => new AppError(ERROR_CODES.INVALID_INPUT, 400, details),
  /** 创建缺少字段错误 / Create missing field error */
  missingField: (details?: string) => new AppError(ERROR_CODES.MISSING_FIELD, 400, details),
  /** 创建未找到错误 / Create not found error */
  notFound: (details?: string) => new AppError(ERROR_CODES.NOT_FOUND, 404, details),
  /** 创建已存在错误 / Create already exists error */
  alreadyExists: (details?: string) => new AppError(ERROR_CODES.ALREADY_EXISTS, 409, details),
  /** 创建禁止访问错误 / Create forbidden error */
  forbidden: (details?: string) => new AppError(ERROR_CODES.FORBIDDEN, 403, details),
  /** 创建速率限制错误 / Create rate limit exceeded error */
  rateLimitExceeded: (details?: string) => new AppError(ERROR_CODES.RATE_LIMIT_EXCEEDED, 429, details),
  /** 创建内部错误 / Create internal error */
  internalError: (details?: string) => new AppError(ERROR_CODES.INTERNAL_ERROR, 500, details),
  /** 创建服务不可用错误 / Create service unavailable error */
  serviceUnavailable: (details?: string) => new AppError(ERROR_CODES.SERVICE_UNAVAILABLE, 503, details),
  /** 创建数据库错误 / Create database error */
  databaseError: (details?: string) => new AppError(ERROR_CODES.DATABASE_ERROR, 500, details),
}

/**
 * 错误处理函数
 * Error Handling Function
 * 
 * 将未知错误转换为统一的 API 错误格式
 * Converts unknown errors to unified API error format
 * 
 * @param error - 错误对象 / Error object
 * @returns API 错误对象 / API error object
 */
export function handleError(error: unknown): ApiError {
  // 如果是我们定义的 AppError / If it's our defined AppError
  if (error instanceof AppError) {
    return {
      code: error.code,
      message: error.message,
      details: error.details,
    }
  }

  // 如果是标准的 JavaScript 错误 / If it's a standard JavaScript error
  if (error instanceof Error) {
    // 在生产环境中，不返回详细的错误信息 / In production, don't return detailed error information
    const environment = (globalThis as any).ENVIRONMENT || 'development'
    if (environment === 'production') {
      return {
        code: ERROR_CODES.INTERNAL_ERROR,
        message: ERROR_MESSAGES[ERROR_CODES.INTERNAL_ERROR],
      }
    }

    // 在开发环境中，返回错误详情 / In development, return error details
    return {
      code: ERROR_CODES.INTERNAL_ERROR,
      message: error.message,
      details: error.stack,
    }
  }

  // 未知错误 / Unknown error
  return {
    code: ERROR_CODES.INTERNAL_ERROR,
    message: ERROR_MESSAGES[ERROR_CODES.INTERNAL_ERROR],
  }
}

/**
 * 格式化错误响应
 * Format Error Response
 * 
 * 将错误格式化为统一的 API 响应格式
 * Formats error into unified API response format
 * 
 * @param error - API 错误对象 / API error object
 * @param statusCode - HTTP 状态码 / HTTP status code
 * @returns 格式化的错误响应 / Formatted error response
 */
export function formatErrorResponse(error: ApiError, statusCode: number = 500) {
  return {
    success: false,
    error: {
      code: error.code,
      message: error.message,
      ...(error.details && { details: error.details }),
    },
    timestamp: new Date().toISOString(),
  }
}

/**
 * 日志记录函数
 * Log Error Function
 * 
 * 记录错误信息到控制台（在生产环境中应该使用专业的日志服务）
 * Logs error information to console (should use professional logging service in production)
 * 
 * @param error - 错误对象 / Error object
 * @param context - 错误上下文（可选）/ Error context (optional)
 */
export function logError(error: unknown, context?: string) {
  const timestamp = new Date().toISOString()
  const errorInfo = handleError(error)

  console.error(`[${timestamp}] ${context || 'Error'}:`, {
    code: errorInfo.code,
    message: errorInfo.message,
    ...(errorInfo.details && { details: errorInfo.details }),
    ...(error instanceof Error && { stack: error.stack }),
  })
}