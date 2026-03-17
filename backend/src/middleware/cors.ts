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
    // TODO: 添加生产环境的域名
    'https://cloudlink.lemonhub.workers.dev',
    'https://winuel.pages.dev',
    'https://www.winuel.com',
  ],
}

export const corsMiddleware = cors({
  origin: (origin: string | null, c: any) => {
    // 如果没有 origin（例如同源请求），允许
    if (!origin) return null

    // 获取当前环境（从环境变量中获取）
    const environment = (globalThis as any).ENVIRONMENT || 'development'
    const allowedOrigins = ALLOWED_ORIGINS[environment as keyof typeof ALLOWED_ORIGINS] || ALLOWED_ORIGINS.development

    // 检查 origin 是否在允许列表中
    return allowedOrigins.includes(origin) ? origin : undefined
  },
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400, // 24 hours
})