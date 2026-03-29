import type { MiddlewareHandler } from 'hono'
import type { Variables } from '../types'
import type { KVNamespace } from '@cloudflare/workers-types'

/**
 * CSRF 令牌管理类
 * 增强安全性：使用 HMAC 签名保护 Session ID
 */
export class CSRFManager {
  private tokenLength = 32

  // 用于 HMAC 签名的密钥（在生产环境应该从环境变量获取）
  // Secret key for HMAC signing (should be from environment variables in production)
  private secretKey = 'csrf-secret-key-change-in-production'

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
   * 生成 Session ID 的 HMAC 签名
   * Generate HMAC signature for Session ID
   */
  async generateSessionIdSignature(sessionId: string): Promise<string> {
    const encoder = new TextEncoder()
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(this.secretKey),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )
    const signature = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(sessionId)
    )
    return Array.from(new Uint8Array(signature), (byte) => byte.toString(16).padStart(2, '0')).join('')
  }

  /**
   * 验证 Session ID 签名
   * Verify Session ID signature
   */
  async verifySessionIdSignature(sessionId: string, signature: string): Promise<boolean> {
    const encoder = new TextEncoder()
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(this.secretKey),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )
    const validSignature = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(sessionId)
    )
    const validSignatureHex = Array.from(new Uint8Array(validSignature), (byte) => byte.toString(16).padStart(2, '0')).join('')
    return validSignatureHex === signature
  }

  /**
   * 验证 CSRF 令牌
   */
  validateToken(token: string, sessionToken: string): boolean {
    return !!(token && sessionToken && token === sessionToken)
  }
}

/**
 * 获取或生成会话 ID（带签名验证）
 * Get or create session ID with signature verification
 */
async function getOrCreateSessionId(c: any, kv: KVNamespace): Promise<{ sessionId: string; signature: string }> {
  const csrf = new CSRFManager()

  // 尝试从请求头获取 session ID 和签名
  let sessionId = c.req.header('x-session-id')
  let signature = c.req.header('x-session-signature')
  
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
      signature = cookies['session_signature']
    }
  }
  
  // 验证 Session ID 签名
  // Verify Session ID signature
  if (sessionId && signature) {
    const isValid = await csrf.verifySessionIdSignature(sessionId, signature)
    if (!isValid) {
      // 签名无效，生成新的 Session ID
      // Invalid signature, generate new Session ID
      sessionId = csrf.generateSessionId()
      signature = await csrf.generateSessionIdSignature(sessionId)
    }
  } else if (!sessionId) {
    // 没有 Session ID，生成新的
    // No Session ID, generate new
    sessionId = csrf.generateSessionId()
    signature = await csrf.generateSessionIdSignature(sessionId)
  } else {
    // 有 Session ID 但没有签名，生成签名
    // Has Session ID but no signature, generate signature
    signature = await csrf.generateSessionIdSignature(sessionId)
  }
  
  return { sessionId, signature }
}

/**
 * CSRF 令牌中间件
 * 为每个请求生成 CSRF 令牌并存储在 KV 中
 * 增强安全性：使用带签名的 Session ID
 */
export const csrfMiddleware: MiddlewareHandler = async (c, next) => {
  // 只为 GET 请求生成令牌
  if (c.req.method === 'GET') {
    const csrf = new CSRFManager()
    const { sessionId, signature } = await getOrCreateSessionId(c, c.env.KV)
    const token = csrf.generateToken()
    
    // 令牌有效期 1 小时
    await c.env.KV.put(`csrf:${sessionId}`, token, { expirationTtl: 3600 })
    
    // 将令牌添加到响应头
    c.header('X-CSRF-Token', token)
    
    // 将 session ID 和签名添加到响应头
    c.header('X-Session-ID', sessionId)
    c.header('X-Session-Signature', signature)
    
    // 如果 session ID 是新生成的，设置 Cookie
    const existingSessionId = c.req.header('x-session-id') || 
      (c.req.header('cookie')?.match(/session_id=([^;]+)/)?.[1])
    
    if (!existingSessionId) {
      c.header('Set-Cookie', `session_id=${sessionId}; session_signature=${signature}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=86400`)
    }
  }

  await next()
}

/**
 * CSRF 验证中间件
 * 验证 POST、PUT、DELETE 请求的 CSRF 令牌
 * 增强安全性：验证 Session ID 签名
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
    
    // 获取 session ID 和签名
    let sessionId = c.req.header('x-session-id')
    let signature = c.req.header('x-session-signature')
    
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
        signature = cookies['session_signature']
      }
    }
    
    // 如果还是没有 session ID，拒绝请求
    if (!sessionId) {
      return c.json(
        {
          success: false,
          error: {
            code: 'SESSION_ID_MISSING',
            message: '缺少会话 ID / Missing session ID'
          }
        },
        403
      )
    }

    // 验证 Session ID 签名
    // Verify Session ID signature
    if (!signature) {
      return c.json(
        {
          success: false,
          error: {
            code: 'SESSION_SIGNATURE_MISSING',
            message: '缺少会话签名 / Missing session signature'
          }
        },
        403
      )
    }

    const isValidSignature = await csrf.verifySessionIdSignature(sessionId, signature)
    if (!isValidSignature) {
      return c.json(
        {
          success: false,
          error: {
            code: 'SESSION_SIGNATURE_INVALID',
            message: '无效的会话签名 / Invalid session signature'
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
            message: '缺少 CSRF 令牌 / Missing CSRF token'
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
            message: 'CSRF 会话已过期，请刷新页面 / CSRF session expired, please refresh page'
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
            message: '无效的 CSRF 令牌 / Invalid CSRF token'
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