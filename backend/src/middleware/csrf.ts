import type { MiddlewareHandler } from 'hono'

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
   * 验证 CSRF 令牌
   */
  validateToken(token: string, sessionToken: string): boolean {
    return !!(token && sessionToken && token === sessionToken)
  }
}

/**
 * CSRF 令牌中间件
 * 为每个请求生成 CSRF 令牌并存储在 KV 中
 */
export const csrfMiddleware: MiddlewareHandler = async (c, next) => {
  // 只为 GET 请求生成令牌
  if (c.req.method === 'GET') {
    const csrf = new CSRFManager()
    const token = csrf.generateToken()
    
    // 将令牌存储在 KV 中，使用会话 ID 作为键
    // 这里使用简单的 session ID，实际应用中应该使用真正的会话管理
    const sessionId = c.req.header('x-session-id') || 'anonymous'
    
    // 令牌有效期 1 小时
    await c.env.KV.put(`csrf:${sessionId}`, token, { expirationTtl: 3600 })
    
    // 将令牌添加到响应头
    c.header('X-CSRF-Token', token)
  }

  await next()
}

/**
 * CSRF 验证中间件
 * 验证 POST、PUT、DELETE 请求的 CSRF 令牌
 */
export const csrfProtectionMiddleware: MiddlewareHandler = async (c, next) => {
  // 只需要验证写操作
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(c.req.method)) {
    const csrf = new CSRFManager()
    
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
    const sessionId = c.req.header('x-session-id') || 'anonymous'
    const sessionToken = await c.env.KV.get(`csrf:${sessionId}`, 'text')
    
    if (!sessionToken) {
      return c.json(
        {
          success: false,
          error: {
            code: 'CSRF_SESSION_EXPIRED',
            message: 'CSRF 会话已过期'
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
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  })
}