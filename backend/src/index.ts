import { Hono } from 'hono'
import type { Env } from './types'
import { initJWT } from './utils/jwt'
import { initEmailChecker } from './utils/validation'
import { corsMiddleware } from './middleware/cors'
import { normalRateLimit } from './middleware/rateLimit'
import { handleError, formatErrorResponse, logError } from './utils/errorHandler'
import { BLOCKLIST_DOMAINS, ALLOWLIST_DOMAINS } from './data/blocklist'
import authRouter from './routes/auth'
import postsRouter from './routes/posts'
import commentsRouter from './routes/comments'
import categoriesRouter from './routes/categories'

// 初始化一次性邮箱检查器
initEmailChecker(
  [...BLOCKLIST_DOMAINS],
  [...ALLOWLIST_DOMAINS]
)

const app = new Hono<{ Bindings: Env }>()

// Set global environment and initialize JWT
app.use('*', async (c, next) => {
  if (c.env.ENVIRONMENT) {
    ;(globalThis as any).ENVIRONMENT = c.env.ENVIRONMENT
  }
  if (c.env.JWT_SECRET) {
    initJWT(c.env.JWT_SECRET)
  }
  await next()
})

app.use('*', normalRateLimit)
app.use('*', corsMiddleware)

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