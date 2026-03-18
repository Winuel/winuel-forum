import type { Context, Next } from 'hono'
import type { Env } from '../types'

interface RateLimitConfig {
  maxRequests: number
  windowMs: number
  message?: string
}

interface RateLimitInfo {
  count: number
  resetTime: number
}

// 默认配置
const DEFAULT_CONFIG: RateLimitConfig = {
  maxRequests: 100,
  windowMs: 15 * 60 * 1000, // 15 minutes
  message: '请求过于频繁，请稍后再试'
}

export function createRateLimit(config: RateLimitConfig = DEFAULT_CONFIG) {
  const { maxRequests, windowMs, message } = { ...DEFAULT_CONFIG, ...config }

  return async (c: Context, next: Next) => {
    const ip = c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For') || 'unknown'
    const key = `rate_limit:${ip}`

    try {
      // 从 KV 获取当前的速率限制信息
      const data = await c.env.KV.get(key)
      let info: RateLimitInfo

      if (data) {
        info = JSON.parse(data) as RateLimitInfo

        // 检查是否超过时间窗口
        if (Date.now() > info.resetTime) {
          // 重置计数器
          info = {
            count: 1,
            resetTime: Date.now() + windowMs
          }
        } else {
          // 增加计数器
          info.count++
        }
      } else {
        // 第一次请求
        info = {
          count: 1,
          resetTime: Date.now() + windowMs
        }
      }

      // 检查是否超过限制
      if (info.count > maxRequests) {
        // 设置响应头
        c.header('X-RateLimit-Limit', maxRequests.toString())
        c.header('X-RateLimit-Remaining', '0')
        c.header('X-RateLimit-Reset', info.resetTime.toString())
        c.header('Retry-After', Math.ceil((info.resetTime - Date.now()) / 1000).toString())

        return c.json(
          { error: message || DEFAULT_CONFIG.message },
          429
        )
      }

      // 更新 KV 中的计数器
      try {
        await c.env.KV.put(key, JSON.stringify(info), {
          expirationTtl: Math.ceil(windowMs / 1000)
        })
      } catch (kvError) {
        // KV写入失败时记录日志但不阻止请求
        console.error('Failed to update rate limit in KV:', kvError)
      }

      // 设置响应头
      c.header('X-RateLimit-Limit', maxRequests.toString())
      c.header('X-RateLimit-Remaining', (maxRequests - info.count).toString())
      c.header('X-RateLimit-Reset', info.resetTime.toString())

      await next()
    } catch (error) {
      // 如果速率限制服务失败，记录日志并允许请求通过
      console.error('Rate limit error:', error)
      await next()
    }
  }
}

// 预定义的速率限制配置
export const strictRateLimit = createRateLimit({
  maxRequests: 20,
  windowMs: 60 * 1000, // 1 minute
  message: '请求过于频繁，请1分钟后再试'
})

export const normalRateLimit = createRateLimit({
  maxRequests: 100,
  windowMs: 15 * 60 * 1000, // 15 minutes
  message: '请求过于频繁，请15分钟后再试'
})

export const strictAuthRateLimit = createRateLimit({
  maxRequests: 10,
  windowMs: 60 * 1000, // 1 minute
  message: '登录尝试过于频繁，请1分钟后再试'
})