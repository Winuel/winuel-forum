import { describe, it, expect } from 'vitest'
import {
  createError,
  handleError,
  formatErrorResponse,
  AppError,
} from '../../utils/errorHandler'

describe('Error Handler Utils', () => {
  describe('createError', () => {
    it('should create unauthorized error', () => {
      const error = createError.unauthorized('Unauthorized access')

      expect(error).toBeInstanceOf(Error)
      expect(error).toBeInstanceOf(AppError)
      expect(error.statusCode).toBe(401)
      expect(error.code).toBe('UNAUTHORIZED')
    })

    it('should create invalid token error', () => {
      const error = createError.invalidToken('Invalid token')

      expect(error).toBeInstanceOf(AppError)
      expect(error.statusCode).toBe(401)
      expect(error.code).toBe('INVALID_TOKEN')
    })

    it('should create token expired error', () => {
      const error = createError.tokenExpired('Token expired')

      expect(error).toBeInstanceOf(AppError)
      expect(error.statusCode).toBe(401)
      expect(error.code).toBe('TOKEN_EXPIRED')
    })

    it('should create validation error', () => {
      const error = createError.validationError('Invalid data')

      expect(error).toBeInstanceOf(AppError)
      expect(error.statusCode).toBe(400)
      expect(error.code).toBe('VALIDATION_ERROR')
    })

    it('should create missing field error', () => {
      const error = createError.missingField('Field required')

      expect(error).toBeInstanceOf(AppError)
      expect(error.statusCode).toBe(400)
      expect(error.code).toBe('MISSING_FIELD')
    })

    it('should create not found error', () => {
      const error = createError.notFound('Resource not found')

      expect(error).toBeInstanceOf(AppError)
      expect(error.statusCode).toBe(404)
      expect(error.code).toBe('NOT_FOUND')
    })

    it('should create already exists error', () => {
      const error = createError.alreadyExists('Resource already exists')

      expect(error).toBeInstanceOf(AppError)
      expect(error.statusCode).toBe(409)
      expect(error.code).toBe('ALREADY_EXISTS')
    })

    it('should create forbidden error', () => {
      const error = createError.forbidden('Access denied')

      expect(error).toBeInstanceOf(AppError)
      expect(error.statusCode).toBe(403)
      expect(error.code).toBe('FORBIDDEN')
    })

    it('should create rate limit error', () => {
      const error = createError.rateLimitExceeded('Too many requests')

      expect(error).toBeInstanceOf(AppError)
      expect(error.statusCode).toBe(429)
      expect(error.code).toBe('RATE_LIMIT_EXCEEDED')
    })

    it('should create internal error', () => {
      const error = createError.internalError('Internal error')

      expect(error).toBeInstanceOf(AppError)
      expect(error.statusCode).toBe(500)
      expect(error.code).toBe('INTERNAL_ERROR')
    })

    it('should create service unavailable error', () => {
      const error = createError.serviceUnavailable('Service unavailable')

      expect(error).toBeInstanceOf(AppError)
      expect(error.statusCode).toBe(503)
      expect(error.code).toBe('SERVICE_UNAVAILABLE')
    })

    it('should create database error', () => {
      const error = createError.databaseError('Database error')

      expect(error).toBeInstanceOf(AppError)
      expect(error.statusCode).toBe(500)
      expect(error.code).toBe('DATABASE_ERROR')
    })
  })

  describe('handleError', () => {
    it('should handle AppError', () => {
      const error = createError.notFound('User not found')
      const result = handleError(error)

      expect(result.code).toBe('NOT_FOUND')
      expect(result.message).toBe('资源不存在 / Resource not found')
      expect(result.details).toBe('User not found')
    })

    it('should handle standard error', () => {
      const error = new Error('Something went wrong')
      const result = handleError(error)

      expect(result.code).toBe('INTERNAL_ERROR')
      expect(result.message).toBe('Something went wrong')
    })

    it('should handle unknown error', () => {
      const error = 'string error'
      const result = handleError(error as any)

      expect(result.code).toBe('INTERNAL_ERROR')
      expect(result.message).toBe('服务器内部错误 / Internal server error')
    })

    it('should include stack trace in development', () => {
      const originalEnv = (globalThis as any).ENVIRONMENT
      ;(globalThis as any).ENVIRONMENT = 'development'

      const error = new Error('Test error')
      const result = handleError(error)

      expect(result.details).toBeDefined()

      ;(globalThis as any).ENVIRONMENT = originalEnv
    })
  })

  describe('formatErrorResponse', () => {
    it('should format error response', () => {
      const errorInfo = {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input',
        details: 'Email is required',
      }
      const response = formatErrorResponse(errorInfo, 400)

      expect(response.success).toBe(false)
      expect(response.error.code).toBe('VALIDATION_ERROR')
      expect(response.error.message).toBe('Invalid input')
      expect(response.error.details).toBe('Email is required')
      expect(response.timestamp).toBeDefined()
    })

    it('should format error response without details', () => {
      const errorInfo = {
        code: 'NOT_FOUND',
        message: 'Resource not found',
      }
      const response = formatErrorResponse(errorInfo, 404)

      expect(response.success).toBe(false)
      expect(response.error.code).toBe('NOT_FOUND')
      expect(response.error.message).toBe('Resource not found')
      expect(response.error.details).toBeUndefined()
    })

    it('should format error response with stack in development', () => {
      const originalEnv = (globalThis as any).ENVIRONMENT
      ;(globalThis as any).ENVIRONMENT = 'development'

      const error = new Error('Test error')
      const errorInfo = handleError(error)
      const response = formatErrorResponse(errorInfo, 500)

      expect(response.error.details).toBeDefined()

      ;(globalThis as any).ENVIRONMENT = originalEnv
    })
  })
})