import { Hono } from 'hono'
import type { Env, Variables } from './types'
import { initJWT } from './utils/jwt'
import { logger } from './utils/logger'
import { initEmailChecker } from './utils/validation'
import { corsMiddleware } from './middleware/cors'
import { httpsRedirect, hsts } from './middleware/https'
import { auditLog } from './middleware/audit'
import { csrfMiddleware, csrfProtectionMiddleware } from './middleware/csrf'
import { normalRateLimit } from './middleware/rateLimit'
import { userAuthMiddleware, adminAuthMiddleware } from './middleware/auth'
import { handleError, formatErrorResponse, logError } from './utils/errorHandler'
import { BLOCKLIST_DOMAINS, ALLOWLIST_DOMAINS } from './data/blocklist'
import authRouter from './routes/auth'
import postsRouter from './routes/posts'
import commentsRouter from './routes/comments'
import categoriesRouter from './routes/categories'
import notificationsRouter from './routes/notifications'

// Admin routes
import adminUsersRouter from './routes/admin/users'
import adminPostsRouter from './routes/admin/posts'
import adminCommentsRouter from './routes/admin/comments'
import adminAuditLogsRouter from './routes/admin/audit-logs'
import adminStatsRouter from './routes/admin/stats'

// 初始化一次性邮箱检查器
initEmailChecker(
  [...BLOCKLIST_DOMAINS],
  [...ALLOWLIST_DOMAINS]
)

const app = new Hono<{ Bindings: Env; Variables: Variables }>()

// Set global environment and initialize JWT
app.use('*', async (c, next) => {
  if (c.env.ENVIRONMENT) {
    ;(globalThis as any).ENVIRONMENT = c.env.ENVIRONMENT
  }
  if (c.env.JWT_SECRET && !(globalThis as any).JWT_SECRET_INITIALIZED) {
    try {
      initJWT(c.env.JWT_SECRET)
      ;(globalThis as any).JWT_SECRET_INITIALIZED = true
      // 初始化 Logger - 使用静态方法
      const { Logger } = await import('./utils/logger')
      Logger.init(c.env.ENVIRONMENT || 'production')
    } catch (error) {
      console.error('Failed to initialize JWT:', error)
      // 不抛出错误，允许请求继续进行
    }
  }
  await next()
})

app.use('*', normalRateLimit)
app.use('*', corsMiddleware)
app.use('*', auditLog)
app.use('*', httpsRedirect)
app.use('*', hsts)
app.use('*', csrfMiddleware)

app.get('/', (c) => {
  return c.json({
    name: '云纽论坛 API',
    version: '1.0.0',
    status: 'running',
  })
})

app.get('/health', (c) => {
  return c.json({ status: 'ok' })
})

app.route('/api/auth', authRouter)
app.route('/api/posts', postsRouter)
app.route('/api/comments', commentsRouter)
app.route('/api/categories', categoriesRouter)
app.route('/api/notifications', notificationsRouter)

// Admin routes - 使用管理员认证中间件
// 需要为每个管理员路由添加认证中间件
app.use('/api/admin/*', adminAuthMiddleware)
app.route('/api/admin/users', adminUsersRouter)
app.route('/api/admin/posts', adminPostsRouter)
app.route('/api/admin/comments', adminCommentsRouter)
app.route('/api/admin/audit-logs', adminAuditLogsRouter)
app.route('/api/admin/stats', adminStatsRouter)

app.notFound((c) => {
  const error = handleError(new Error('Not Found'))
  return c.json(formatErrorResponse(error), 404)
})

app.onError((err, c) => {
  logError(err, 'Global Error Handler')
  const error = handleError(err)
  const statusCode = err instanceof Error && 'statusCode' in err ? (err as any).statusCode : 500
  return c.json(formatErrorResponse(error), statusCode)
})

export default app