/**
 * 速率限制中间件
 * Rate Limit Middleware
 * 
 * 提供请求速率限制功能，包括：
 * - 基于 IP 地址的速率限制
 * - 使用 Cloudflare KV 存储计数器
 * - 支持自定义配置
 * - 预定义的速率限制策略
 * 
 * Provides request rate limiting functionality, including:
 * - IP-based rate limiting
 * - Uses Cloudflare KV for counter storage
 * - Supports custom configuration
 * - Predefined rate limiting strategies
 * 
 * @package backend/src/middleware
 */

import type { Context, Next } from 'hono'
import type { Env } from '../types'

/**
 * 速率限制配置接口
 * Rate Limit Configuration Interface
 * 定义速率限制的配置参数
 * Defines configuration parameters for rate limiting
 */
interface RateLimitConfig {
  /** 最大请求数 / Maximum number of requests */
  maxRequests: number
  /** 时间窗口（毫秒）/ Time window (milliseconds) */
  windowMs: number
  /** 限制消息（可选）/ Limit message (optional) */
  message?: string
}

/**
 * 速率限制信息接口
 * Rate Limit Info Interface
 * 定义速率限制的当前状态
 * Defines current state of rate limiting
 */
interface RateLimitInfo {
  /** 当前计数 / Current count */
  count: number
  /** 重置时间戳 / Reset timestamp */
  resetTime: number
}

// 默认配置 / Default configuration
const DEFAULT_CONFIG: RateLimitConfig = {
  maxRequests: 100,
  windowMs: 15 * 60 * 1000, // 15 minutes / 15 分钟
  message: '请求过于频繁，请稍后再试 / Too many requests, please try again later'
}

/**
 * 创建速率限制中间件
 * Create Rate Limit Middleware
 * 
 * @param config - 速率限制配置 / Rate limit configuration
 * @returns 中间件函数 / Middleware function
 */
export function createRateLimit(config: RateLimitConfig = DEFAULT_CONFIG) {
  const { maxRequests, windowMs, message } = { ...DEFAULT_CONFIG, ...config }

  return async (c: Context, next: Next) => {
    // 获取客户端 IP 地址 / Get client IP address
    const ip = c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For') || 'unknown'
    const key = `rate_limit:${ip}`

    try {
      // 从 KV 获取当前的速率限制信息 / Get current rate limit info from KV
      const data = await c.env.KV.get(key)
      let info: RateLimitInfo

      if (data) {
        info = JSON.parse(data) as RateLimitInfo

        // 检查是否超过时间窗口 / Check if exceeded time window
        if (Date.now() > info.resetTime) {
          // 重置计数器 / Reset counter
          info = {
            count: 1,
            resetTime: Date.now() + windowMs
          }
        } else {
          // 增加计数器 / Increment counter
          info.count++
        }
      } else {
        // 第一次请求 / First request
        info = {
          count: 1,
          resetTime: Date.now() + windowMs
        }
      }

      // 检查是否超过限制 / Check if exceeded limit
      if (info.count > maxRequests) {
        // 设置响应头 / Set response headers
        c.header('X-RateLimit-Limit', maxRequests.toString())
        c.header('X-RateLimit-Remaining', '0')
        c.header('X-RateLimit-Reset', info.resetTime.toString())
        c.header('Retry-After', Math.ceil((info.resetTime - Date.now()) / 1000).toString())

        return c.json(
          { error: message || DEFAULT_CONFIG.message },
          429
        )
      }

      // 更新 KV 中的计数器 / Update counter in KV
      try {
        await c.env.KV.put(key, JSON.stringify(info), {
          expirationTtl: Math.ceil(windowMs / 1000)
        })
      } catch (kvError) {
        // KV 写入失败时记录日志但不阻止请求 / Log error but don't block request on KV write failure
        console.error('Failed to update rate limit in KV:', kvError, '更新速率限制失败:', kvError)
      }

      // 设置响应头 / Set response headers
      c.header('X-RateLimit-Limit', maxRequests.toString())
      c.header('X-RateLimit-Remaining', (maxRequests - info.count).toString())
      c.header('X-RateLimit-Reset', info.resetTime.toString())

      await next()
    } catch (error) {
      // 如果速率限制服务失败，记录日志并允许请求通过 / Log error and allow request if rate limit service fails
      console.error('Rate limit error:', error, '速率限制错误:', error)
      await next()
    }
  }
}

// 预定义的速率限制配置 / Predefined rate limit configurations

/**
 * 严格速率限制（每分钟20次请求）
 * Strict Rate Limit (20 requests per minute)
 */
export const strictRateLimit = createRateLimit({
  maxRequests: 20,
  windowMs: 60 * 1000, // 1 minute / 1 分钟
  message: '请求过于频繁，请1分钟后再试 / Too many requests, please try again in 1 minute'
})

/**
 * 普通速率限制（每15分钟100次请求）
 * Normal Rate Limit (100 requests per 15 minutes)
 */
export const normalRateLimit = createRateLimit({
  maxRequests: 100,
  windowMs: 15 * 60 * 1000, // 15 minutes / 15 分钟
  message: '请求过于频繁，请15分钟后再试 / Too many requests, please try again in 15 minutes'
})

/**
 * 认证严格速率限制（每分钟10次登录尝试）
 * Strict Auth Rate Limit (10 login attempts per minute)
 */
export const strictAuthRateLimit = createRateLimit({
  maxRequests: 10,
  windowMs: 60 * 1000, // 1 minute / 1 分钟
  message: '登录尝试过于频繁，请1分钟后再试 / Too many login attempts, please try again in 1 minute'
})