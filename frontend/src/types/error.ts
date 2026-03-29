/**
 * 错误类型定义
 * Error Type Definitions
 * 
 * 统一的错误类型定义，用于类型安全的错误处理
 * Unified error type definitions for type-safe error handling
 * 
 * @package frontend/src/types
 */

/**
 * API 错误接口
 * API Error Interface
 * 
 * 后端 API 返回的错误格式
 * Error format returned by backend API
 */
export interface ApiError {
  code: string
  message: string
  details?: string | Record<string, unknown>
  status?: number
}

/**
 * 错误消息类型
 * Error Message Type
 * 
 * 包含消息的错误对象
 * Error object with message
 */
export interface ErrorMessage {
  message: string
}

/**
 * 所有可能的错误类型
 * All possible error types
 */
export type AppError = Error | ApiError | ErrorMessage | unknown

/**
 * 获取错误消息
 * Get Error Message
 * 
 * 从各种错误类型中提取友好的错误消息
 * Extract user-friendly error message from various error types
 * 
 * @param error - 错误对象 / Error object
 * @returns 错误消息 / Error message
 */
export function getErrorMessage(error: AppError): string {
  if (error instanceof Error) {
    return error.message
  }
  
  if (typeof error === 'object' && error !== null) {
    const apiError = error as ApiError
    if (apiError.message) {
      return apiError.message
    }
    const errorMessage = error as ErrorMessage
    if (errorMessage.message) {
      return errorMessage.message
    }
  }
  
  if (typeof error === 'string') {
    return error
  }
  
  return '未知错误 / Unknown error'
}

/**
 * 获取错误代码
 * Get Error Code
 * 
 * 从错误对象中提取错误代码
 * Extract error code from error object
 * 
 * @param error - 错误对象 / Error object
 * @returns 错误代码 / Error code
 */
export function getErrorCode(error: AppError): string | undefined {
  if (typeof error === 'object' && error !== null) {
    const apiError = error as ApiError
    return apiError.code
  }
  return undefined
}

/**
 * 获取错误状态码
 * Get Error Status Code
 * 
 * 从错误对象中提取 HTTP 状态码
 * Extract HTTP status code from error object
 * 
 * @param error - 错误对象 / Error object
 * @returns HTTP 状态码 / HTTP status code
 */
export function getErrorStatus(error: AppError): number | undefined {
  if (typeof error === 'object' && error !== null) {
    const apiError = error as ApiError
    return apiError.status
  }
  return undefined
}

/**
 * 判断是否为网络错误
 * Check if Network Error
 * 
 * @param error - 错误对象 / Error object
 * @returns 是否为网络错误 / Whether it's a network error
 */
export function isNetworkError(error: AppError): boolean {
  if (error instanceof Error) {
    return (
      error.name === 'NetworkError' ||
      error.name === 'AbortError' ||
      error.message.includes('fetch') ||
      error.message.includes('network')
    )
  }
  return false
}

/**
 * 判断是否为认证错误
 * Check if Authentication Error
 * 
 * @param error - 错误对象 / Error object
 * @returns 是否为认证错误 / Whether it's an authentication error
 */
export function isAuthError(error: AppError): boolean {
  const code = getErrorCode(error)
  const status = getErrorStatus(error)
  
  return (
    code === 'UNAUTHORIZED' ||
    code === 'INVALID_TOKEN' ||
    code === 'TOKEN_EXPIRED' ||
    status === 401
  )
}

/**
 * 判断是否为权限错误
 * Check if Permission Error
 * 
 * @param error - 错误对象 / Error object
 * @returns 是否为权限错误 / Whether it's a permission error
 */
export function isPermissionError(error: AppError): boolean {
  const code = getErrorCode(error)
  const status = getErrorStatus(error)
  
  return (
    code === 'FORBIDDEN' ||
    status === 403
  )
}

/**
 * 判断是否为验证错误
 * Check if Validation Error
 * 
 * @param error - 错误对象 / Error object
 * @returns 是否为验证错误 / Whether it's a validation error
 */
export function isValidationError(error: AppError): boolean {
  const code = getErrorCode(error)
  const status = getErrorStatus(error)
  
  return (
    code === 'VALIDATION_ERROR' ||
    code === 'INVALID_INPUT' ||
    status === 400
  )
}