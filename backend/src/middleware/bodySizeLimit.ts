/**
 * 请求体大小限制中间件
 * Request Body Size Limit Middleware
 *
 * 限制请求体大小以防止内存耗尽攻击
 * Limits request body size to prevent memory exhaustion attacks
 *
 * @package backend/src/middleware
 */

import type { MiddlewareHandler } from 'hono'
import type { Env, Variables } from '../types'
import { logger } from '../utils/logger'

/**
 * 配置接口
 * Configuration Interface
 */
interface BodySizeLimitConfig {
  /** 最大请求体大小（字节）/ Maximum request body size in bytes */
  maxSize: number
  /** 是否启用 / Whether enabled */
  enabled: boolean
}

/**
 * 默认配置
 * Default Configuration
 */
const DEFAULT_CONFIG: BodySizeLimitConfig = {
  maxSize: 10 * 1024 * 1024, // 10MB
  enabled: true
}

/**
 * 创建请求体大小限制中间件
 * Create Body Size Limit Middleware
 *
 * @param config - 配置选项 / Configuration options
 * @returns 中间件函数 / Middleware function
 */
export function createBodySizeLimit(config?: Partial<BodySizeLimitConfig>): MiddlewareHandler<{
  Bindings: Env
  Variables: Variables
}> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config }

  if (!finalConfig.enabled) {
    return async (c, next) => {
      await next()
    }
  }

  return async (c, next) => {
    // 检查Content-Length头
    const contentLength = c.req.header('content-length')
    if (contentLength) {
      const size = parseInt(contentLength, 10)
      if (size > finalConfig.maxSize) {
        logger.warn('Request body size limit exceeded', {
          size,
          maxSize: finalConfig.maxSize,
          path: c.req.path,
          method: c.req.method
        })
        return c.json({
          success: false,
          error: {
            code: 'REQUEST_TOO_LARGE',
            message: `请求体过大，最大允许 ${formatBytes(finalConfig.maxSize)} / Request body too large, maximum ${formatBytes(finalConfig.maxSize)}`
          }
        }, 413)
      }
    }

    await next()
  }
}

/**
 * 格式化字节大小
 * Format Bytes
 *
 * @param bytes - 字节数 / Number of bytes
 * @returns 格式化后的字符串 / Formatted string
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

/**
 * 严格模式（1MB）- 用于普通API
 * Strict mode (1MB) - For regular APIs
 */
export const strictBodySizeLimit = createBodySizeLimit({
  maxSize: 1 * 1024 * 1024, // 1MB
  enabled: true
})

/**
 * 宽松模式（10MB）- 用于文件上传
 * Loose mode (10MB) - For file uploads
 */
export const looseBodySizeLimit = createBodySizeLimit({
  maxSize: 10 * 1024 * 1024, // 10MB
  enabled: true
})

/**
 * 代码附件模式（1MB）- 用于代码附件上传
 * Code attachment mode (1MB) - For code attachment uploads
 */
export const codeAttachmentBodySizeLimit = createBodySizeLimit({
  maxSize: 1 * 1024 * 1024, // 1MB
  enabled: true
})