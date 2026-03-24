import { cors } from 'hono/cors'

/**
 * 从环境变量或默认配置中获取允许的域名列表
 */
function getAllowedOrigins(environment: string, env?: any): string[] {
  // 尝试从环境变量读取
  const corsOrigins = env?.CORS_ORIGINS || (globalThis as any).CORS_ORIGINS
  if (corsOrigins) {
    return corsOrigins.split(',').map((origin: string) => origin.trim())
  }

  // 默认配置
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
// ❌ https://api.winuel.com - 后端 API 不应在前端允许列表中
// ❌ https://www.winuel.com - 生产环境域名

export const corsMiddleware = cors({
  origin: (origin: string | null, c: any) => {
    try {
      // 如果没有 origin（例如同源请求或curl等工具），允许
      if (!origin) {
        return null
      }

      // 获取当前环境
      const environment = (globalThis as any).ENVIRONMENT || c.env?.ENVIRONMENT || 'production'
      const allowedOrigins = getAllowedOrigins(environment, c.env)

      // 检查 origin 是否在允许列表中
      if (allowedOrigins.includes(origin)) {
        return origin
      } else {
        return undefined
      }
    } catch (error) {
      console.error('CORS middleware error:', error)
      // 出错时拒绝请求
      return undefined
    }
  },
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Session-ID', 'X-CSRF-Token'],
  credentials: true,
  maxAge: 86400, // 24 hours
  exposeHeaders: ['Content-Length', 'X-Kuma-Revision', 'X-CSRF-Token', 'X-Session-ID'],
})