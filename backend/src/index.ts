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
  
  // 初始化JWT - 增强错误处理
  if (c.env.JWT_SECRET && !(globalThis as any).JWT_SECRET_INITIALIZED) {
    try {
      // 验证JWT密钥强度
      if (c.env.JWT_SECRET.length < 32) {
        throw new Error('JWT_SECRET must be at least 32 characters long')
      }
      
      initJWT(c.env.JWT_SECRET)
      ;(globalThis as any).JWT_SECRET_INITIALIZED = true
      ;(globalThis as any).JWT_SECRET_VALID = true
      
      // 初始化 Logger - 使用静态方法
      const { Logger } = await import('./utils/logger')
      Logger.init(c.env.ENVIRONMENT || 'production')
      console.log('✅ JWT initialized successfully')
    } catch (error: any) {
      console.error('❌ Failed to initialize JWT:', error.message)
      ;(globalThis as any).JWT_SECRET_INITIALIZED = false
      ;(globalThis as any).JWT_SECRET_VALID = false
      ;(globalThis as any).JWT_SECRET_ERROR = error.message
      // 不抛出错误，但标记JWT初始化失败
    }
  } else if (!c.env.JWT_SECRET) {
    console.warn('⚠️ JWT_SECRET is not configured')
    ;(globalThis as any).JWT_SECRET_INITIALIZED = false
    ;(globalThis as any).JWT_SECRET_VALID = false
    ;(globalThis as any).JWT_SECRET_ERROR = 'JWT_SECRET not configured'
  }
  
  // 初始化邮件服务 - 增强错误处理
  if (c.env.RESEND_API_KEY && !(globalThis as any).EMAIL_SERVICE_INITIALIZED) {
    try {
      const emailService = new EmailService(
        c.env.RESEND_API_KEY,
        c.env.RESEND_FROM_EMAIL || 'noreply@mail.winuel.com',
        c.env.RESEND_FROM_NAME || '云纽论坛'
      )
      ;(globalThis as any).emailService = emailService
      ;(globalThis as any).EMAIL_SERVICE_INITIALIZED = true
      ;(globalThis as any).EMAIL_SERVICE_AVAILABLE = true
      console.log('✅ Email service initialized')
    } catch (error: any) {
      console.error('❌ Failed to initialize email service:', error.message)
      ;(globalThis as any).EMAIL_SERVICE_INITIALIZED = false
      ;(globalThis as any).EMAIL_SERVICE_AVAILABLE = false
      ;(globalThis as any).EMAIL_SERVICE_ERROR = error.message
      // 不抛出错误，允许请求继续进行
    }
  } else if (!c.env.RESEND_API_KEY) {
    console.warn('⚠️ RESEND_API_KEY is not configured')
    ;(globalThis as any).EMAIL_SERVICE_INITIALIZED = false
    ;(globalThis as any).EMAIL_SERVICE_AVAILABLE = false
    ;(globalThis as any).EMAIL_SERVICE_ERROR = 'RESEND_API_KEY not configured'
  }
  
  // 初始化数据库（仅在首次请求时）- 增强错误处理
  if (c.env.DB && !(globalThis as any).DB_INITIALIZED) {
    try {
      const { initializeDatabase } = await import('./utils/dbInitializer')
      await initializeDatabase(c.env.DB)
      ;(globalThis as any).DB_INITIALIZED = true
      ;(globalThis as any).DB_AVAILABLE = true
      console.log('✅ Database initialized')
    } catch (error: any) {
      console.error('❌ Failed to initialize database:', error.message)
      ;(globalThis as any).DB_INITIALIZED = false
      ;(globalThis as any).DB_AVAILABLE = false
      ;(globalThis as any).DB_ERROR = error.message
      // 不抛出错误，允许请求继续进行
    }
  } else if (!c.env.DB) {
    console.warn('⚠️ Database is not configured')
    ;(globalThis as any).DB_INITIALIZED = false
    ;(globalThis as any).DB_AVAILABLE = false
    ;(globalThis as any).DB_ERROR = 'Database not configured'
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
app.use('*', csrfProtectionMiddleware)

app.get('/', (c) => {
  return c.json({
    name: '云纽论坛 API',
    version: '1.0.0',
    status: 'running',
  })
})

app.get('/health', (c) => {
  const jwtValid = (globalThis as any).JWT_SECRET_VALID === true
  const jwtError = (globalThis as any).JWT_SECRET_ERROR
  const dbAvailable = (globalThis as any).DB_AVAILABLE === true
  const dbError = (globalThis as any).DB_ERROR
  const emailAvailable = (globalThis as any).EMAIL_SERVICE_AVAILABLE === true
  const emailError = (globalThis as any).EMAIL_SERVICE_ERROR
  
  return c.json({
    status: 'ok',
    services: {
      jwt: {
        available: jwtValid,
        error: jwtError || null
      },
      database: {
        available: dbAvailable,
        error: dbError || null
      },
      email: {
        available: emailAvailable,
        error: emailError || null
      }
    }
  })
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

// 数据库迁移端点（移到管理员中间件之前，因为可能需要在不依赖认证的情况下执行）
app.post('/api/admin/run-migrations', async (c) => {
  try {
    // 动态导入迁移脚本
    const runMigrations = await import('./utils/runMigrations')
    const result = await runMigrations.default(c.env.DB)
    return c.json(result)
  } catch (error: any) {
    console.error('数据库迁移失败:', error)
    return c.json({ 
      success: false, 
      error: error.message || '数据库迁移失败' 
    }, 500)
  }
})

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