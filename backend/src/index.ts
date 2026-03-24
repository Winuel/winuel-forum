import { Hono } from 'hono'
import type { Env, Variables } from './types'
import { initJWT } from './utils/jwt'
import { logger } from './utils/logger'
import { initEmailChecker } from './utils/validation'
import { EmailService } from './services/emailService'
import { corsMiddleware } from './middleware/cors'
import { httpsRedirect, hsts } from './middleware/https'
import { auditLog } from './middleware/audit'
import { csrfMiddleware, csrfProtectionMiddleware } from './middleware/csrf'
import { normalRateLimit } from './middleware/rateLimit'
import { userAuthMiddleware, adminAuthMiddleware } from './middleware/auth'
import { diMiddleware } from './middleware/di'
import { handleError, formatErrorResponse, logError } from './utils/errorHandler'
import { BLOCKLIST_DOMAINS, ALLOWLIST_DOMAINS } from './data/blocklist'
import authRouter from './routes/auth'
import oauthRouter from './routes/auth/oauth'
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
import adminPluginsRouter from './routes/admin/plugins'

// Code attachment routes
import attachmentsRouter from './routes/api/attachments'
import reviewsRouter from './routes/api/reviews'

// 初始化一次性邮箱检查器
initEmailChecker(
  [...BLOCKLIST_DOMAINS],
  [...ALLOWLIST_DOMAINS]
)

const app = new Hono<{ Bindings: Env; Variables: Variables }>()

// Set global environment and initialize JWT and email service
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
  
  // 初始化邮件服务
  if (c.env.RESEND_API_KEY && !(globalThis as any).EMAIL_SERVICE_INITIALIZED) {
    try {
      const emailService = new EmailService(
        c.env.RESEND_API_KEY,
        c.env.RESEND_FROM_EMAIL || 'noreply@mail.winuel.com',
        c.env.RESEND_FROM_NAME || '云纽论坛'
      )
      ;(globalThis as any).emailService = emailService
      ;(globalThis as any).EMAIL_SERVICE_INITIALIZED = true
      console.log('Email service initialized')
    } catch (error) {
      console.error('Failed to initialize email service:', error)
    }
  }
  
  // 初始化数据库（仅在首次请求时）
  if (c.env.DB && !(globalThis as any).DB_INITIALIZED) {
    try {
      const { initializeDatabase } = await import('./utils/dbInitializer')
      await initializeDatabase(c.env.DB)
      ;(globalThis as any).DB_INITIALIZED = true
    } catch (error) {
      console.error('Failed to initialize database:', error)
      // 不抛出错误，允许请求继续进行
    }
  }
  
  await next()
})

app.use('*', normalRateLimit)
app.use('*', corsMiddleware)
app.use('*', diMiddleware)
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

// 数据库初始化端点（仅用于首次部署）
app.post('/api/admin/init-db', async (c) => {
  try {
    const { initializeDatabase } = await import('./utils/dbInitializer')
    await initializeDatabase(c.env.DB)
    return c.json({ 
      success: true, 
      message: '数据库初始化成功' 
    })
  } catch (error: any) {
    console.error('数据库初始化失败:', error)
    return c.json({ 
      success: false, 
      error: error.message || '数据库初始化失败' 
    }, 500)
  }
})

app.route('/api/auth', authRouter)
app.route('/api/posts', postsRouter)
app.route('/api/comments', commentsRouter)
app.route('/api/categories', categoriesRouter)
app.route('/api/notifications', notificationsRouter)
app.route('/api/attachments', attachmentsRouter)
app.route('/api/reviews', reviewsRouter)
app.route('/api/auth/github', oauthRouter)

// Admin routes - 使用管理员认证中间件
// 需要为每个管理员路由添加认证中间件
app.use('/api/admin/*', adminAuthMiddleware)
app.route('/api/admin/users', adminUsersRouter)
app.route('/api/admin/posts', adminPostsRouter)
app.route('/api/admin/comments', adminCommentsRouter)
app.route('/api/admin/audit-logs', adminAuditLogsRouter)
app.route('/api/admin/stats', adminStatsRouter)
app.route('/api/admin/plugins', adminPluginsRouter)

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