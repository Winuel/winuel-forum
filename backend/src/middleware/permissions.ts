import type { Context, Next } from 'hono'
import type { Env, Variables } from '../types'
import type { JWTPayload } from '../db/models'
import { DEPENDENCY_TOKENS } from '../utils/di'

export enum Role {
  USER = 'user',
  MODERATOR = 'moderator',
  ADMIN = 'admin'
}

export enum Permission {
  // 用户管理
  USER_READ = 'user:read',
  USER_CREATE = 'user:create',
  USER_UPDATE = 'user:update',
  USER_DELETE = 'user:delete',
  USER_BAN = 'user:ban',
  USER_UNBAN = 'user:unban',
  
  // 帖子管理
  POST_READ = 'post:read',
  POST_CREATE = 'post:create',
  POST_UPDATE = 'post:update',
  POST_DELETE = 'post:delete',
  POST_PIN = 'post:pin',
  POST_UNPIN = 'post:unpin',
  POST_AUDIT = 'post:audit',
  
  // 评论管理
  COMMENT_READ = 'comment:read',
  COMMENT_DELETE = 'comment:delete',
  COMMENT_AUDIT = 'comment:audit',
  
  // 分类管理
  CATEGORY_CREATE = 'category:create',
  CATEGORY_UPDATE = 'category:update',
  CATEGORY_DELETE = 'category:delete',
  
  // 审计日志
  AUDIT_LOG_READ = 'audit:read',
  AUDIT_LOG_EXPORT = 'audit:export',
  
  // 系统设置
  SETTINGS_READ = 'settings:read',
  SETTINGS_UPDATE = 'settings:update',
}

// 角色权限映射
const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [Role.USER]: [
    Permission.USER_READ,
    Permission.POST_READ,
    Permission.COMMENT_READ,
  ],
  [Role.MODERATOR]: [
    Permission.USER_READ,
    Permission.USER_BAN,
    Permission.USER_UNBAN,
    Permission.POST_READ,
    Permission.POST_UPDATE,
    Permission.POST_DELETE,
    Permission.POST_PIN,
    Permission.POST_UNPIN,
    Permission.POST_AUDIT,
    Permission.COMMENT_READ,
    Permission.COMMENT_DELETE,
    Permission.COMMENT_AUDIT,
    Permission.AUDIT_LOG_READ,
  ],
  [Role.ADMIN]: [
    Permission.USER_READ,
    Permission.USER_CREATE,
    Permission.USER_UPDATE,
    Permission.USER_DELETE,
    Permission.USER_BAN,
    Permission.USER_UNBAN,
    Permission.POST_READ,
    Permission.POST_CREATE,
    Permission.POST_UPDATE,
    Permission.POST_DELETE,
    Permission.POST_PIN,
    Permission.POST_UNPIN,
    Permission.POST_AUDIT,
    Permission.COMMENT_READ,
    Permission.COMMENT_DELETE,
    Permission.COMMENT_AUDIT,
    Permission.CATEGORY_CREATE,
    Permission.CATEGORY_UPDATE,
    Permission.CATEGORY_DELETE,
    Permission.AUDIT_LOG_READ,
    Permission.AUDIT_LOG_EXPORT,
    Permission.SETTINGS_READ,
    Permission.SETTINGS_UPDATE,
  ],
}

/**
 * 检查用户是否具有指定权限
 */
export function hasPermission(userRole: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[userRole]?.includes(permission) ?? false
}

/**
 * 检查用户是否具有所有指定权限
 */
export function hasAllPermissions(userRole: Role, permissions: Permission[]): boolean {
  return permissions.every(permission => hasPermission(userRole, permission))
}

/**
 * 检查用户是否具有任一指定权限
 */
export function hasAnyPermission(userRole: Role, permissions: Permission[]): boolean {
  return permissions.some(permission => hasPermission(userRole, permission))
}

/**
 * 权限检查中间件工厂
 * 返回一个中间件函数，用于检查请求者是否具有所需权限
 */
export function requirePermission(...permissions: Permission[]) {
  return async (c: Context<{ Bindings: Env; Variables: Variables }>, next: Next) => {
    const userId = c.get('userId') as string | undefined
    
    if (!userId) {
      return c.json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: '需要登录',
        },
      }, 401)
    }
    
    const container = c.get('container')
    if (!container) {
      return c.json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '服务容器未初始化',
        },
      }, 500)
    }

    const db = container.resolve<D1Database>(DEPENDENCY_TOKENS.DB)
    
    try {
      // 获取用户信息
      const user = await db.prepare(
        'SELECT id, username, role FROM users WHERE id = ? AND deleted_at IS NULL'
      ).bind(userId).first()
      
      if (!user) {
        return c.json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: '用户不存在',
          },
        }, 404)
      }
      
      const userRole = user.role as Role
      
      // 检查权限
      if (!hasAllPermissions(userRole, permissions as Permission[])) {
        return c.json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: '权限不足',
            required: permissions,
            userRole,
          },
        }, 403)
      }
      
      // 将用户信息存储到上下文（转换为 JWTPayload 格式）
      c.set('currentUser', {
        userId: user.id,
        username: user.username,
        role: user.role
      } as JWTPayload)
      c.set('userRole', userRole)
      
      await next()
    } catch (error) {
      console.error('Permission check failed:', error)
      return c.json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: '权限检查失败',
        },
      }, 500)
    }
  }
}

/**
 * 管理员权限中间件（快速检查是否为管理员）
 */
export function requireAdmin() {
  return requirePermission(...ROLE_PERMISSIONS[Role.ADMIN])
}

/**
 * 审核员或管理员权限中间件
 */
export function requireModeratorOrAdmin() {
  return async (c: Context<{ Bindings: Env; Variables: Variables }>, next: Next) => {
    const userId = c.get('userId') as string | undefined
    
    if (!userId) {
      return c.json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: '需要登录',
        },
      }, 401)
    }
    
    const container = c.get('container')
    if (!container) {
      return c.json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '服务容器未初始化',
        },
      }, 500)
    }

    const db = container.resolve<D1Database>(DEPENDENCY_TOKENS.DB)
    
    try {
      const user = await db.prepare(
        'SELECT id, username, role FROM users WHERE id = ? AND deleted_at IS NULL'
      ).bind(userId).first()
      
      if (!user) {
        return c.json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: '用户不存在',
          },
        }, 404)
      }
      
      const userRole = user.role as Role
      
      if (userRole !== Role.ADMIN && userRole !== Role.MODERATOR) {
        return c.json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: '需要管理员或审核员权限',
          },
        }, 403)
      }
      
      c.set('currentUser', {
        userId: user.id,
        username: user.username,
        role: user.role
      } as JWTPayload)
      c.set('userRole', userRole)
      
      await next()
    } catch (error) {
      console.error('Moderator/Admin check failed:', error)
      return c.json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: '权限检查失败',
        },
      }, 500)
    }
  }
}