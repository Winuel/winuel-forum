import type { MiddlewareHandler } from 'hono'
import type { Variables } from '../types'

/**
 * CSRF 令牌管理类
 */
export class CSRFManager {
  private tokenLength = 32

  /**
   * 生成 CSRF 令牌
   */
  generateToken(): string {
    const array = new Uint8Array(this.tokenLength)
    crypto.getRandomValues(array)
    return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('')
  }

  /**
   * 生成会话 ID
   */
  generateSessionId(): string {
    const array = new Uint8Array(16)
    crypto.getRandomValues(array)
    return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('')
  }

  /**
   * 验证 CSRF 令牌
   */
  validateToken(token: string, sessionToken: string): boolean {
    return !!(token && sessionToken && token === sessionToken)
  }
}

/**
 * 获取或生成会话 ID
 */
async function getOrCreateSessionId(c: any, kv: KVNamespace): Promise<string> {
  // 尝试从请求头获取 session ID
  let sessionId = c.req.header('x-session-id')
  
  // 如果没有，尝试从 Cookie 获取
  if (!sessionId) {
    const cookieHeader = c.req.header('cookie')
    if (cookieHeader) {
      const cookies = cookieHeader.split(';').reduce((acc: Record<string, string>, cookie: string) => {
        const [key, value] = cookie.trim().split('=')
        acc[key] = value
        return acc
      }, {})
      sessionId = cookies['session_id']
    }
  }
  
  // 如果还是没有，生成新的 session ID
  if (!sessionId) {
    sessionId = new CSRFManager().generateSessionId()
  }
  
  return sessionId
}

/**
 * CSRF 令牌中间件
 * 为每个请求生成 CSRF 令牌并存储在 KV 中
 */
export const csrfMiddleware: MiddlewareHandler = async (c, next) => {
  // 只为 GET 请求生成令牌
  if (c.req.method === 'GET') {
    const csrf = new CSRFManager()
    const sessionId = await getOrCreateSessionId(c, c.env.KV)
    const token = csrf.generateToken()
    
    // 令牌有效期 1 小时
    await c.env.KV.put(`csrf:${sessionId}`, token, { expirationTtl: 3600 })
    
    // 将令牌添加到响应头
    c.header('X-CSRF-Token', token)
    
    // 将 session ID 添加到响应头
    c.header('X-Session-ID', sessionId)
    
    // 如果 session ID 是新生成的，设置 Cookie
    const existingSessionId = c.req.header('x-session-id') || 
      (c.req.header('cookie')?.match(/session_id=([^;]+)/)?.[1])
    
    if (!existingSessionId) {
      c.header('Set-Cookie', `session_id=${sessionId}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=86400`)
    }
  }

  await next()
}

/**
 * CSRF 验证中间件
 * 验证 POST、PUT、DELETE 请求的 CSRF 令牌
 */
export const csrfProtectionMiddleware: MiddlewareHandler = async (c, next) => {
  // 排除OAuth路由和其他公共端点
  const excludedPaths = [
    '/api/auth/github',
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/send-verification-code',
    '/api/auth/verify-code',
    '/api/auth/logout',
    '/health',
    '/'
  ]
  
  const isExcluded = excludedPaths.some(path => c.req.path.startsWith(path))
  
  if (isExcluded) {
    await next()
    return
  }
  
  // 只需要验证写操作
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(c.req.method)) {
    const csrf = new CSRFManager()
    
    // 获取 session ID
    let sessionId = c.req.header('x-session-id')
    
    // 如果请求头没有，尝试从 Cookie 获取
    if (!sessionId) {
      const cookieHeader = c.req.header('cookie')
      if (cookieHeader) {
        const cookies = cookieHeader.split(';').reduce((acc: Record<string, string>, cookie: string) => {
          const [key, value] = cookie.trim().split('=')
          acc[key] = value
          return acc
        }, {})
        sessionId = cookies['session_id']
      }
    }
    
    // 如果还是没有 session ID，拒绝请求
    if (!sessionId) {
      return c.json(
        {
          success: false,
          error: {
            code: 'SESSION_ID_MISSING',
            message: '缺少会话 ID'
          }
        },
        403
      )
    }
    
    // 从请求头获取令牌
    const headerToken = c.req.header('x-csrf-token')
    // 从请求体获取令牌
    const bodyToken = c.req.header('content-type')?.includes('application/json')
      ? (await c.req.json())?.csrfToken
      : undefined
    
    const token = headerToken || bodyToken
    
    if (!token) {
      return c.json(
        {
          success: false,
          error: {
            code: 'CSRF_TOKEN_MISSING',
            message: '缺少 CSRF 令牌'
          }
        },
        403
      )
    }

    // 从 KV 获取会话令牌
    const sessionToken = await c.env.KV.get(`csrf:${sessionId}`, 'text')
    
    if (!sessionToken) {
      return c.json(
        {
          success: false,
          error: {
            code: 'CSRF_SESSION_EXPIRED',
            message: 'CSRF 会话已过期，请刷新页面'
          }
        },
        403
      )
    }

    // 验证令牌
    if (!csrf.validateToken(token, sessionToken)) {
      return c.json(
        {
          success: false,
          error: {
            code: 'CSRF_TOKEN_INVALID',
            message: '无效的 CSRF 令牌'
          }
        },
        403
      )
    }
  }

  await next()
}

/**
 * 为响应添加 CSRF 令牌
 */
export const addCsrfToken = async (response: Response, sessionId: string, kv: KVNamespace) => {
  const csrf = new CSRFManager()
  const token = csrf.generateToken()
  
  await kv.put(`csrf:${sessionId}`, token, { expirationTtl: 3600 })
  
  // 克隆响应并添加头
  const headers = new Headers(response.headers)
  headers.set('X-CSRF-Token', token)
  headers.set('X-Session-ID', sessionId)
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  })
}