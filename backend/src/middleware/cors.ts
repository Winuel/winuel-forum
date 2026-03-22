import { cors } from 'hono/cors'

// 定义允许的域名列表
// ⚠️ 注意：CORS 配置应尽可能严格，只允许真正需要的域名
const ALLOWED_ORIGINS = {
  development: [
    // 开发环境：只保留本地开发服务器
    'http://localhost:5173',
    'http://127.0.0.1:5173',
  ],
  production: [
    // 生产环境：只允许实际使用的域名
    // 前端应用域名
    'https://www.winuel.com',
    // 备用前端部署域名（如果使用）
    'https://winuel.pages.dev',
    // 管理员后台域名
    'https://admin.winuel.com',
    'https://winuel-admin.pages.dev',
  ],
}

// 需要移除的域名（仅供参考，不要添加到允许列表）
// ❌ https://api.winuel.com - 后端 API 不应在前端允许列表中
// ❌ https://cloudlink.lemonhub.workers.dev - 测试环境域名不应在生产环境

export const corsMiddleware = cors({
  origin: (origin: string | null, c: any) => {
    try {
      // 如果没有 origin（例如同源请求或curl等工具），允许
      if (!origin) {
        return null
      }

      // 获取当前环境（从环境变量中获取）
      const environment = (globalThis as any).ENVIRONMENT || c.env?.ENVIRONMENT || 'production'
      const allowedOrigins = ALLOWED_ORIGINS[environment as keyof typeof ALLOWED_ORIGINS] || ALLOWED_ORIGINS.production

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
  allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Session-ID'],
  credentials: true,
  maxAge: 86400, // 24 hours
  exposeHeaders: ['Content-Length', 'X-Kuma-Revision', 'X-CSRF-Token', 'X-Session-ID'],
})