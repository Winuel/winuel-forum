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
import { createCache } from './utils/cache'
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
      
      logger.info('JWT initialized successfully')
    } catch (error: any) {
      logger.error('Failed to initialize JWT', error)
      ;(globalThis as any).JWT_SECRET_INITIALIZED = false
      ;(globalThis as any).JWT_SECRET_VALID = false
      ;(globalThis as any).JWT_SECRET_ERROR = error.message
      // 不抛出错误，但标记JWT初始化失败
    }
  } else if (!c.env.JWT_SECRET) {
    logger.warn('JWT_SECRET is not configured')
    ;(globalThis as any).JWT_SECRET_INITIALIZED = false
    ;(globalThis as any).JWT_SECRET_VALID = false
    ;(globalThis as any).JWT_SECRET_ERROR = 'JWT_SECRET not configured'
  }
  
  // 初始化邮件服务 - 增强错误处理
  if (c.env.RESEND_API_KEY && !(globalThis as any).EMAIL_SERVICE_INITIALIZED) {
    try {
      // 验证 API 密钥格式
      if (typeof c.env.RESEND_API_KEY !== 'string' || c.env.RESEND_API_KEY.length < 10) {
        throw new Error('Invalid RESEND_API_KEY format')
      }

      const emailService = new EmailService(
        c.env.RESEND_API_KEY,
        c.env.RESEND_FROM_EMAIL || 'noreply@mail.winuel.com',
        c.env.RESEND_FROM_NAME || '云纽论坛'
      )
      
      // 检查邮件服务是否可用
      if (!emailService.isAvailable()) {
        throw new Error('Email service initialized but not available')
      }
      
      ; (globalThis as any).emailService = emailService
      
            ;(globalThis as any).EMAIL_SERVICE_INITIALIZED = true
      
            ;(globalThis as any).EMAIL_SERVICE_AVAILABLE = true
      
            ;(globalThis as any).EMAIL_SERVICE_ERROR = null
      
            logger.info('Email service initialized successfully')
      
          } catch (error: any) {
      
            logger.error('Failed to initialize email service', error)
      
            ;(globalThis as any).EMAIL_SERVICE_INITIALIZED = false
      
            ;(globalThis as any).EMAIL_SERVICE_AVAILABLE = false
      
            ;(globalThis as any).EMAIL_SERVICE_ERROR = error.message
      
            // 不抛出错误，允许请求继续进行
      
          }
      
        } else if (!c.env.RESEND_API_KEY) {
      
          logger.warn('RESEND_API_KEY is not configured. Email service will not be available.')
      
          logger.warn('Please set RESEND_API_KEY using: wrangler secret put RESEND_API_KEY')
      
          ;(globalThis as any).EMAIL_SERVICE_INITIALIZED = false
      
          ;(globalThis as any).EMAIL_SERVICE_AVAILABLE = false
      
          ;(globalThis as any).EMAIL_SERVICE_ERROR = 'RESEND_API_KEY not configured. Please run: wrangler secret put RESEND_API_KEY'
      
        }
  
  // 初始化数据库（仅在首次请求时）- 增强错误处理
  if (c.env.DB && !(globalThis as any).DB_INITIALIZED) {
    try {
      const { initializeDatabase } = await import('./utils/dbInitializer')
      await initializeDatabase(c.env.DB)
      ;(globalThis as any).DB_INITIALIZED = true
      ;(globalThis as any).DB_AVAILABLE = true
      logger.info('Database initialized')
    } catch (error: any) {
      logger.error('Failed to initialize database', error)
      ;(globalThis as any).DB_INITIALIZED = false
      ;(globalThis as any).DB_AVAILABLE = false
      ;(globalThis as any).DB_ERROR = error.message
      // 不抛出错误，允许请求继续进行
    }
  } else if (!c.env.DB) {
    logger.warn('Database is not configured')
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
  const githubOAuthConfigured = !!(c.env.GITHUB_CLIENT_ID && c.env.GITHUB_CLIENT_SECRET)
  
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
      },
      github_oauth: {
        available: githubOAuthConfigured,
        error: githubOAuthConfigured ? null : 'GitHub OAuth credentials not configured'
      }
    }
  })
})

// 数据库初始化端点（仅用于首次部署，需要管理员权限）
app.post('/api/admin/init-db', adminAuthMiddleware, async (c) => {
  // 额外的角色检查，确保用户是管理员
  const user = c.get('user')
  if (!user || user.role !== 'admin') {
    return c.json({ 
      success: false, 
      error: '权限不足，仅管理员可以初始化数据库 / Insufficient permissions, only admin can initialize database' 
    }, 403)
  }

  try {
    const { initializeDatabase } = await import('./utils/dbInitializer')
    await initializeDatabase(c.env.DB)
    return c.json({ 
      success: true, 
      message: '数据库初始化成功 / Database initialized successfully' 
    })
  } catch (error: any) {
    logger.error('数据库初始化失败 / Database initialization failed', error)
    return c.json({ 
      success: false, 
      error: error.message || '数据库初始化失败 / Database initialization failed' 
    }, 500)
  }
})

// 注册所有路由（必须在 DI 中间件之后）
app.route('/api/auth', authRouter)
app.route('/api/auth/github', oauthRouter)
app.route('/api/posts', postsRouter)
app.route('/api/comments', commentsRouter)
app.route('/api/categories', categoriesRouter)
app.route('/api/notifications', notificationsRouter)
app.route('/api/attachments', attachmentsRouter)
app.route('/api/reviews', reviewsRouter)

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
    logger.error('Database migration failed', error)
    return c.json({ 
      success: false, 
      error: error.message || '数据库迁移失败 / Database migration failed' 
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