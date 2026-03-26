/**
 * 认证中间件
 * Authentication Middleware
 * 
 * 提供用户和管理员的认证功能，包括：
 * - JWT 令牌验证
 * - 用户角色验证
 * - 支持 USER 和 ADMIN 两种受众
 * 
 * Provides user and admin authentication functionality, including:
 * - JWT token verification
 * - User role verification
 * - Supports USER and ADMIN audiences
 * 
 * @package backend/src/middleware
 */

import type { Context, Next } from 'hono'
import { verifyToken, Audience } from '../utils/jwt'
import type { JWTPayload, TokenPayload } from '../db/models'

/**
 * 用户认证中间件（使用 USER 受众）
 * User Authentication Middleware (Uses USER Audience)
 * 
 * 验证用户身份，要求请求头中包含有效的 JWT 令牌
 * Verifies user identity, requires valid JWT token in request header
 * 
 * @param c - Hono 上下文对象 / Hono context object
 * @param next - 下一个中间件函数 / Next middleware function
 * @returns JSON 响应或继续执行下一个中间件 / JSON response or continue to next middleware
 */
export async function userAuthMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization')

  // 检查 Authorization 请求头 / Check Authorization header
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: '未授权访问 / Unauthorized access' }, 401)
  }

  // 提取令牌 / Extract token
  const token = authHeader.substring(7)
  const payload = await verifyToken(token, Audience.USER)

  // 验证令牌 / Verify token
  if (!payload) {
    return c.json({ error: '无效的令牌 / Invalid token' }, 401)
  }

  // 将用户信息存储到上下文中 / Store user info in context
  c.set('user', payload as JWTPayload)
  c.set('currentUser', payload as TokenPayload)
  await next()
}

/**
 * 管理员认证中间件（使用 ADMIN 受众）
 * Admin Authentication Middleware (Uses ADMIN Audience)
 * 
 * 验证管理员身份，要求请求头中包含有效的管理员 JWT 令牌
 * Verifies admin identity, requires valid admin JWT token in request header
 * 
 * @param c - Hono 上下文对象 / Hono context object
 * @param next - 下一个中间件函数 / Next middleware function
 * @returns JSON 响应或继续执行下一个中间件 / JSON response or continue to next middleware
 */
export async function adminAuthMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization')

  // 检查 Authorization 请求头 / Check Authorization header
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: '未授权访问 / Unauthorized access' }, 401)
  }

  // 提取令牌 / Extract token
  const token = authHeader.substring(7)
  const payload = await verifyToken(token, Audience.ADMIN)

  // 验证令牌 / Verify token
  if (!payload) {
    return c.json({ error: '无效的令牌 / Invalid token' }, 401)
  }

  // 将用户信息存储到上下文中 / Store user info in context
  c.set('user', payload as JWTPayload)
  c.set('currentUser', payload as TokenPayload)
  await next()
}

/**
 * 通用认证中间件（兼容旧代码，默认使用 USER 受众）
 * Generic Authentication Middleware (Legacy compatible, uses USER audience by default)
 * 
 * @param c - Hono 上下文对象 / Hono context object
 * @param next - 下一个中间件函数 / Next middleware function
 * @returns JSON 响应或继续执行下一个中间件 / JSON response or continue to next middleware
 * @deprecated 使用 userAuthMiddleware 或 adminAuthMiddleware 替代 / Use userAuthMiddleware or adminAuthMiddleware instead
 */
export async function authMiddleware(c: Context, next: Next) {
  return userAuthMiddleware(c, next)
}

/**
 * 角色验证中间件工厂函数
 * Role Verification Middleware Factory Function
 * 
 * 创建一个中间件，验证用户是否具有指定的角色
 * Creates a middleware that verifies if the user has the specified roles
 * 
 * @param roles - 允许的角色列表 / Allowed role list
 * @returns 中间件函数 / Middleware function
 * 
 * @example
 * // 仅允许管理员和审核员访问 / Only allow admin and moderator access
 * app.use('/admin', requireRole('admin', 'moderator'))
 */
export function requireRole(...roles: string[]) {
  return async (c: Context, next: Next) => {
    const user = c.get('user') as JWTPayload

    // 检查用户是否具有所需角色 / Check if user has required roles
    if (!user || !roles.includes(user.role)) {
      return c.json({ error: '权限不足 / Insufficient permissions' }, 403)
    }

    await next()
  }
}