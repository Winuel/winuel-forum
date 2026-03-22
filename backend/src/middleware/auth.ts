import type { Context, Next } from 'hono'
import { verifyToken, Audience } from '../utils/jwt'
import type { JWTPayload, TokenPayload } from '../db/models'

/**
 * 用户认证中间件（使用 USER 受众）
 */
export async function userAuthMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization')

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: '未授权访问' }, 401)
  }

  const token = authHeader.substring(7)
  const payload = await verifyToken(token, Audience.USER)

  if (!payload) {
    return c.json({ error: '无效的令牌' }, 401)
  }

  c.set('user', payload as JWTPayload)
  c.set('currentUser', payload as TokenPayload)
  await next()
}

/**
 * 管理员认证中间件（使用 ADMIN 受众）
 */
export async function adminAuthMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization')

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: '未授权访问' }, 401)
  }

  const token = authHeader.substring(7)
  const payload = await verifyToken(token, Audience.ADMIN)

  if (!payload) {
    return c.json({ error: '无效的令牌' }, 401)
  }

  c.set('user', payload as JWTPayload)
  c.set('currentUser', payload as TokenPayload)
  await next()
}

/**
 * 通用认证中间件（兼容旧代码，默认使用 USER 受众）
 * @deprecated 使用 userAuthMiddleware 或 adminAuthMiddleware 替代
 */
export async function authMiddleware(c: Context, next: Next) {
  return userAuthMiddleware(c, next)
}

export function requireRole(...roles: string[]) {
  return async (c: Context, next: Next) => {
    const user = c.get('user') as JWTPayload

    if (!user || !roles.includes(user.role)) {
      return c.json({ error: '权限不足' }, 403)
    }

    await next()
  }
}