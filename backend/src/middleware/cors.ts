/**
 * CORS（跨域资源共享）中间件
 * CORS (Cross-Origin Resource Sharing) Middleware
 * 
 * 提供跨域资源共享功能，包括：
 * - 根据环境配置允许的域名
 * - 支持凭据传递
 * - 配置允许的方法和请求头
 * 
 * Provides cross-origin resource sharing functionality, including:
 * - Allowed domains based on environment configuration
 * - Credential support
 * - Configurable allowed methods and headers
 * 
 * @package backend/src/middleware
 */

import { cors } from 'hono/cors'

/**
 * 从环境变量或默认配置中获取允许的域名列表
 * Get Allowed Origins from Environment Variables or Default Configuration
 * 
 * 根据当前环境返回允许的跨域请求来源列表
 * Returns the list of allowed cross-origin request sources based on the current environment
 * 
 * @param environment - 环境名称 / Environment name
 * @param env - 环境变量对象 / Environment variable object
 * @returns 允许的域名列表 / List of allowed origins
 */
function getAllowedOrigins(environment: string, env?: any): string[] {
  // 尝试从环境变量读取 / Try to read from environment variables
  const corsOrigins = env?.CORS_ORIGINS || (globalThis as any).CORS_ORIGINS
  if (corsOrigins) {
    return corsOrigins.split(',').map((origin: string) => origin.trim())
  }

  // 默认配置 / Default configuration
  const defaults: Record<string, string[]> = {
    development: [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:5174',
      'http://127.0.0.1:5174',
    ],
    production: [],
  }

  return defaults[environment] || defaults.production
}

// 需要移除的域名（仅供参考，不要添加到允许列表）
// Domains to remove (for reference only, do not add to allowed list)
// ❌ https://api.winuel.com - 后端 API 不应在前端允许列表中 / Backend API should not be in frontend allowed list
// ❌ https://www.winuel.com - 生产环境域名 / Production domain

/**
 * CORS 中间件实例
 * CORS Middleware Instance
 * 
 * 配置了跨域资源共享规则
 * Configured with cross-origin resource sharing rules
 */
export const corsMiddleware = cors({
  /**
   * 原始来源验证函数
   * Origin Verification Function
   * 
   * 验证请求的来源是否在允许列表中
   * Verifies if the request origin is in the allowed list
   * 
   * @param origin - 请求来源 / Request origin
   * @param c - Hono 上下文对象 / Hono context object
   * @returns 允许的来源或 undefined（拒绝）/ Allowed origin or undefined (reject)
   */
  origin: (origin: string | null, c: any) => {
    try {
      // 如果没有 origin（例如同源请求或curl等工具），允许 / Allow if no origin (e.g., same-origin request or curl)
      if (!origin) {
        return null
      }

      // 获取当前环境 / Get current environment
      const environment = (globalThis as any).ENVIRONMENT || c.env?.ENVIRONMENT || 'production'
      const allowedOrigins = getAllowedOrigins(environment, c.env)

      // 检查 origin 是否在允许列表中 / Check if origin is in allowed list
      if (allowedOrigins.includes(origin)) {
        return origin
      } else {
        return undefined
      }
    } catch (error) {
      console.error('CORS middleware error:', error, 'CORS 中间件错误:', error)
      // 出错时拒绝请求 / Reject request on error
      return undefined
    }
  },
  /** 允许的 HTTP 方法 / Allowed HTTP methods */
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  /** 允许的请求头 / Allowed request headers */
  allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Session-ID', 'X-CSRF-Token'],
  /** 是否允许凭据 / Whether to allow credentials */
  credentials: true,
  /** 预检请求缓存时间（秒）/ Preflight request cache time (seconds) */
  maxAge: 86400, // 24 hours / 24 小时
  /** 暴露给客户端的响应头 / Response headers exposed to client */
  exposeHeaders: ['Content-Length', 'X-Kuma-Revision', 'X-CSRF-Token', 'X-Session-ID'],
})