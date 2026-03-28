/**
 * 统一 API 响应格式工具
 * Unified API Response Format Utilities
 * 
 * 提供标准化的成功和错误响应格式，确保所有 API 端点返回一致的响应结构
 * Provides standardized success and error response formats, ensuring all API endpoints return consistent response structures
 * 
 * @package backend/src/utils
 */

import type { Context } from 'hono'
import type { ContentfulStatusCode } from 'hono/utils/http-status'

/**
 * API 错误代码类型
 * API Error Code Types
 * 
 * 注意：这些错误代码与 errorHandler.ts 中定义的错误代码保持一致
 * Note: These error codes are consistent with the error codes defined in errorHandler.ts
 */
export enum ErrorCode {
  // 认证错误 / Authentication errors
  UNAUTHORIZED = 'UNAUTHORIZED',
  INVALID_TOKEN = 'INVALID_TOKEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',

  // 验证错误 / Validation errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_FIELD = 'MISSING_FIELD',

  // 资源错误 / Resource errors
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  FORBIDDEN = 'FORBIDDEN',

  // 速率限制 / Rate limiting
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',

  // 服务器错误 / Server errors
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  DATABASE_ERROR = 'DATABASE_ERROR',
  
  // 用户错误 / User Errors
  USER_EXISTS = 'USER_EXISTS',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  EMAIL_IN_USE = 'EMAIL_IN_USE',
  
  // 内容错误 / Content Errors
  POST_NOT_FOUND = 'POST_NOT_FOUND',
  COMMENT_NOT_FOUND = 'COMMENT_NOT_FOUND',
  CATEGORY_NOT_FOUND = 'CATEGORY_NOT_FOUND',
  
  // 文件上传错误 / File Upload Errors
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE = 'INVALID_FILE_TYPE',
  INVALID_FILE_NAME = 'INVALID_FILE_NAME',
  
  // OAuth 错误 / OAuth Errors
  OAUTH_ERROR = 'OAUTH_ERROR',
  INVALID_REDIRECT_URI = 'INVALID_REDIRECT_URI',
  
  // 认证错误 / Authentication Errors
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  EMAIL_NOT_VERIFIED = 'EMAIL_NOT_VERIFIED',
}

/**
 * 成功响应接口
 * Success Response Interface
 * 
 * 与现有的 formatErrorResponse 格式保持一致
 * Consistent with existing formatErrorResponse format
 */
export interface SuccessResponse<T = unknown> {
  success: true
  data?: T
  message?: string
  timestamp?: string
}

/**
 * 错误响应接口
 * Error Response Interface
 * 
 * 与现有的 formatErrorResponse 格式保持一致
 * Consistent with existing formatErrorResponse format
 */
export interface ErrorResponse {
  success: false
  error: {
    code: ErrorCode
    message: string
    details?: string | Record<string, unknown>
  }
  timestamp?: string
}

/**
 * 创建成功响应
 * Create Success Response
 * 
 * @param c - Hono 上下文对象 / Hono context object
 * @param data - 响应数据 / Response data
 * @param message - 可选的成功消息 / Optional success message
 * @param status - HTTP 状态码，默认 200 / HTTP status code, default 200
 * @returns JSON 响应 / JSON response
 * 
 * @example
 * return successResponse(c, { userId: 123 }, '用户创建成功', 201)
 */
export function successResponse<T = any>(
  c: Context,
  data?: T,
  message?: string,
  status: ContentfulStatusCode = 200
) {
  const response: SuccessResponse<T> = {
    success: true,
    timestamp: new Date().toISOString(),
  }
  
  if (data !== undefined) {
    response.data = data
  }
  
  if (message) {
    response.message = message
  }
  
  return c.json(response, status)
}

/**
 * 创建错误响应
 * Create Error Response
 * 
 * 与 formatErrorResponse 格式保持一致
 * Consistent with formatErrorResponse format
 * 
 * @param c - Hono 上下文对象 / Hono context object
 * @param code - 错误代码 / Error code
 * @param message - 错误消息 / Error message
 * @param status - HTTP 状态码，默认 400 / HTTP status code, default 400
 * @param details - 可选的错误详情 / Optional error details
 * @returns JSON 响应 / JSON response
 * 
 * @example
 * return errorResponse(c, ErrorCode.INVALID_INPUT, '邮箱格式无效', 400)
 */
export function errorResponse(
  c: Context,
  code: ErrorCode,
  message: string,
  status: ContentfulStatusCode = 400,
  details?: string | Record<string, unknown>
) {
  const response: ErrorResponse = {
    success: false,
    error: {
      code,
      message,
    },
    timestamp: new Date().toISOString(),
  }
  
  if (details !== undefined) {
    response.error.details = details
  }
  
  return c.json(response, status)
}

/**
 * 创建未授权响应（401）
 * Create Unauthorized Response (401)
 * 
 * @param c - Hono 上下文对象 / Hono context object
 * @param message - 错误消息，默认 '未授权访问 / Unauthorized access' / Error message, default '未授权访问 / Unauthorized access'
 * @returns JSON 响应 / JSON response
 */
export function unauthorizedResponse(
  c: Context,
  message: string = '未授权访问 / Unauthorized access'
) {
  return errorResponse(c, ErrorCode.UNAUTHORIZED, message, 401)
}

/**
 * 创建禁止访问响应（403）
 * Create Forbidden Response (403)
 * 
 * @param c - Hono 上下文对象 / Hono context object
 * @param message - 错误消息，默认 '权限不足 / Insufficient permissions' / Error message, default '权限不足 / Insufficient permissions'
 * @returns JSON 响应 / JSON response
 */
export function forbiddenResponse(
  c: Context,
  message: string = '权限不足 / Insufficient permissions'
) {
  return errorResponse(c, ErrorCode.FORBIDDEN, message, 403)
}

/**
 * 创建未找到响应（404）
 * Create Not Found Response (404)
 * 
 * @param c - Hono 上下文对象 / Hono context object
 * @param resource - 资源名称，用于生成错误消息 / Resource name, used to generate error message
 * @returns JSON 响应 / JSON response
 * 
 * @example
 * return notFoundResponse(c, '帖子')
 * // 返回: { success: false, error: { code: 'NOT_FOUND', message: '帖子不存在' } }
 */
export function notFoundResponse(
  c: Context,
  resource: string
) {
  return errorResponse(c, ErrorCode.NOT_FOUND, `${resource}不存在 / ${resource} not found`, 404)
}

/**
 * 创建内部错误响应（500）
 * Create Internal Error Response (500)
 * 
 * @param c - Hono 上下文对象 / Hono context object
 * @param message - 错误消息 / Error message
 * @param details - 可选的错误详情 / Optional error details
 * @returns JSON 响应 / JSON response
 */
export function internalErrorResponse(
  c: Context,
  message: string = '内部服务器错误 / Internal server error',
  details?: string | Record<string, unknown>
) {
  return errorResponse(c, ErrorCode.INTERNAL_ERROR, message, 500, details)
}

/**
 * 从异常对象创建错误响应
 * Create Error Response from Exception Object
 * 
 * @param c - Hono 上下文对象 / Hono context object
 * @param error - 异常对象 / Exception object
 * @param defaultMessage - 默认错误消息 / Default error message
 * @returns JSON 响应 / JSON response
 */
export function errorFromException(
  c: Context,
  error: Error | { message?: string; code?: string; statusCode?: number },
  defaultMessage: string = '操作失败 / Operation failed'
) {
  const message = error instanceof Error ? error.message : (error.message || defaultMessage)
  const code = 'code' in error && error.code ? error.code : ErrorCode.INTERNAL_ERROR
  const status = ('statusCode' in error && error.statusCode ? error.statusCode : 500) as ContentfulStatusCode
  
  return errorResponse(c, code as ErrorCode, message, status)
}

/**
 * 分页响应接口
 * Paginated Response Interface
 */
export interface PaginatedResponse<T> {
  success: true
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
  timestamp?: string
}

/**
 * 创建分页响应
 * Create Paginated Response
 * 
 * @param c - Hono 上下文对象 / Hono context object
 * @param data - 数据数组 / Data array
 * @param total - 总记录数 / Total records
 * @param page - 当前页码 / Current page number
 * @param pageSize - 每页记录数 / Records per page
 * @returns JSON 响应 / JSON response
 */
export function paginatedResponse<T>(
  c: Context,
  data: T[],
  total: number,
  page: number,
  pageSize: number
) {
  const totalPages = Math.ceil(total / pageSize)
  
  const response: PaginatedResponse<T> = {
    success: true,
    data,
    total,
    page,
    pageSize,
    totalPages,
    timestamp: new Date().toISOString(),
  }
  
  return c.json(response)
}