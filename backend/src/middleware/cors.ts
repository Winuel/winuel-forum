import { cors } from 'hono/cors'

// 定义允许的域名列表
const ALLOWED_ORIGINS = {
  development: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
  ],
  production: [
    'https://cloudlink.lemonhub.workers.dev',
    'https://winuel.pages.dev',
    'https://www.winuel.com',
    'https://api.winuel.com',
  ],
}

export const corsMiddleware = cors({
  origin: (origin: string | null, c: any) => {
    try {
      // 如果没有 origin（例如同源请求或curl等工具），允许
      if (!origin) {
        console.log('CORS: No origin provided, allowing request')
        return null
      }

      // 获取当前环境（从环境变量中获取）
      const environment = (globalThis as any).ENVIRONMENT || c.env?.ENVIRONMENT || 'production'
      const allowedOrigins = ALLOWED_ORIGINS[environment as keyof typeof ALLOWED_ORIGINS] || ALLOWED_ORIGINS.production

      // 检查 origin 是否在允许列表中
      if (allowedOrigins.includes(origin)) {
        console.log(`CORS: Origin ${origin} allowed (${environment} environment)`)
        return origin
      } else {
        console.warn(`CORS: Origin ${origin} not in allowed list (${environment} environment)`)
        return undefined
      }
    } catch (error) {
      console.error('CORS middleware error:', error)
      // 出错时拒绝请求
      return undefined
    }
  },
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  maxAge: 86400, // 24 hours
  exposeHeaders: ['Content-Length', 'X-Kuma-Revision'],
})