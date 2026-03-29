/**
 * 数据库可用性检查中间件
 * Database Availability Check Middleware
 * 
 * 检查数据库是否可用，如果不可用则返回 503 错误
 * Checks if database is available, returns 503 error if not available
 * 
 * @package backend/src/middleware
 */

import type { Context, Next } from 'hono'
import type { Env, Variables } from '../types'

// 确保全局类型定义
// Ensure global type definitions
declare global {
  var ENVIRONMENT: string
  var DB_AVAILABLE: boolean
  var DB_ERROR: string
}

/**
 * 数据库可用性检查中间件
 * Database Availability Check Middleware
 * 
 * 检查数据库是否已初始化且可用
 * Checks if database is initialized and available
 * 
 * @param c - Hono 上下文对象 / Hono context object
 * @param next - 下一个中间件函数 / Next middleware function
 * @returns JSON 响应或继续执行下一个中间件 / JSON response or continue to next middleware
 */
export async function databaseAvailabilityMiddleware(c: Context<{ Bindings: Env; Variables: Variables }>, next: Next) {
  // 检查数据库是否可用
  const dbAvailable = (globalThis as any).DB_AVAILABLE === true

  if (!dbAvailable) {
    const dbError = (globalThis as any).DB_ERROR || 'Database not available'

    // 记录数据库不可用访问
    console.error('Database unavailable - Access attempt blocked', {
      path: c.req.path,
      method: c.req.method,
      error: dbError
    })

    return c.json({
      success: false,
      error: {
        code: 'SERVICE_UNAVAILABLE',
        message: '服务暂时不可用，请稍后重试 / Service temporarily unavailable, please try again later',
        details: process.env.ENVIRONMENT === 'development' ? dbError : undefined
      }
    }, 503)
  }

  await next()
}

/**
 * 数据库健康检查中间件
 * Database Health Check Middleware
 * 
 * 执行数据库查询以验证数据库连接
 * Executes database query to verify database connection
 * 
 * @param c - Hono 上下文对象 / Hono context object
 * @param next - 下一个中间件函数 / Next middleware function
 * @returns JSON 响应或继续执行下一个中间件 / JSON response or continue to next middleware
 */
export async function databaseHealthCheckMiddleware(c: Context<{ Bindings: Env; Variables: Variables }>, next: Next) {
  try {
    // 执行简单的数据库查询来检查连接
    await c.env.DB.prepare('SELECT 1').first()

    // 数据库连接正常，继续处理请求
    await next()
  } catch (error) {
    console.error('Database health check failed', error)

    return c.json({
      success: false,
      error: {
        code: 'DATABASE_ERROR',
        message: '数据库连接失败 / Database connection failed'
      }
    }, 503)
  }
}