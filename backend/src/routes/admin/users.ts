import { logger } from "../../utils/logger"
import { validatePagination, validateRole, validateId, validateSearchKeyword } from "../../utils/adminValidation"
import { Hono } from 'hono'
import type { Env, Variables } from '../../types'
import { requireAdmin, requireModeratorOrAdmin, Permission } from '../../middleware/permissions'
import { csrfProtectionMiddleware } from '../../middleware/csrf'
import { createAuditLog } from '../../utils/audit'

const app = new Hono<{ Bindings: Env; Variables: Variables }>()

// 获取用户列表（分页、搜索、过滤）
app.get('/api/admin/users', requireAdmin, async (c) => {
  try {
    const { page = '1', pageSize = '20', search = '', role = '', status = 'all' } = c.req.query()
    const pageNum = parseInt(page as string)
    const size = parseInt(pageSize as string)
    const offset = (pageNum - 1) * size

    let query = 'SELECT id, username, email, role, avatar, created_at, updated_at, deleted_at FROM users WHERE 1=1'
    const params: any[] = []

    // 搜索条件
    if (search) {
      query += ' AND (username LIKE ? OR email LIKE ?)'
      params.push(`%${search}%`, `%${search}%`)
    }

    // 角色过滤
    if (role) {
      query += ' AND role = ?'
      params.push(role)
    }

    // 状态过滤
    if (status === 'active') {
      query += ' AND deleted_at IS NULL'
    } else if (status === 'deleted') {
      query += ' AND deleted_at IS NOT NULL'
    }

    // 获取总数
    const countQuery = query.replace('SELECT id, username, email, role, avatar, created_at, updated_at, deleted_at', 'SELECT COUNT(*) as total')
    const countResult = await c.env.DB.prepare(countQuery).bind(...params).first()
    const total = countResult?.total as number || 0

    // 获取分页数据
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?'
    params.push(size, offset)

    const users = await c.env.DB.prepare(query).bind(...params).all()

    return c.json({
      success: true,
      data: {
        users,
        pagination: {
          page: pageNum,
          pageSize: size,
          total,
          totalPages: Math.ceil(total / size),
        },
      },
    })
  } catch (error: any) {
    logger.error('Failed to fetch users:', error)
    return c.json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: '获取用户列表失败',
      },
    }, 500)
  }
})

// 获取用户详情
app.get('/api/admin/users/:id', requireAdmin, async (c) => {
  try {
    const { id } = c.req.param()
    const user = await c.env.DB.prepare(
      'SELECT id, username, email, role, avatar, created_at, updated_at, deleted_at FROM users WHERE id = ?'
    ).bind(id).first()

    if (!user) {
      return c.json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: '用户不存在',
        },
      }, 404)
    }

    // 获取用户统计信息
    const postCount = await c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM posts WHERE author_id = ? AND deleted_at IS NULL'
    ).bind(id).first()

    const commentCount = await c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM comments WHERE author_id = ? AND deleted_at IS NULL'
    ).bind(id).first()

    return c.json({
      success: true,
      data: {
        ...user,
        stats: {
          postCount: postCount?.count || 0,
          commentCount: commentCount?.count || 0,
        },
      },
    })
  } catch (error: any) {
    logger.error('Failed to fetch user details:', error)
    return c.json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: '获取用户详情失败',
      },
    }, 500)
  }
})

// 更新用户角色
app.put('/api/admin/users/:id/role', requireAdmin, csrfProtectionMiddleware, async (c) => {
  try {
    const { id } = c.req.param()
    const { role } = await c.req.json()
    const currentUser = c.get('currentUser')

    if (!['user', 'moderator', 'admin'].includes(role)) {
      return c.json({
        success: false,
        error: {
          code: 'INVALID_ROLE',
          message: '无效的角色',
        },
      }, 400)
    }

    // 获取用户当前角色
    const user = await c.env.DB.prepare(
      'SELECT id, username, role FROM users WHERE id = ?'
    ).bind(id).first()

    if (!user) {
      return c.json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: '用户不存在',
        },
      }, 404)
    }

    // 更新角色
    await c.env.DB.prepare('UPDATE users SET role = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .bind(role, id)
      .run()

    // 记录审计日志
    await createAuditLog(c, {
      action: 'user.update_role',
      entity_type: 'user',
      entity_id: id,
      old_values: JSON.stringify({ role: user.role }),
      new_values: JSON.stringify({ role }),
    })

    return c.json({
      success: true,
      message: '用户角色已更新',
      data: { id, role },
    })
  } catch (error: any) {
    logger.error('Failed to update user role:', error)
    return c.json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: '更新用户角色失败',
      },
    }, 500)
  }
})

// 封禁用户
app.post('/api/admin/users/:id/ban', requireModeratorOrAdmin, csrfProtectionMiddleware, async (c) => {
  try {
    const { id } = c.req.param()
    const { reason } = await c.req.json() || ''
    const currentUser = c.get('currentUser')

    const user = await c.env.DB.prepare(
      'SELECT id, username, role FROM users WHERE id = ? AND deleted_at IS NULL'
    ).bind(id).first()

    if (!user) {
      return c.json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: '用户不存在或已被删除',
        },
      }, 404)
    }

    // 管理员不能封禁其他管理员
    if (currentUser.role === 'moderator' && user.role === 'admin') {
      return c.json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: '审核员不能封禁管理员',
        },
      }, 403)
    }

    // 更新用户状态（软删除）
    await c.env.DB.prepare(
      'UPDATE users SET deleted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).bind(id).run()

    // 记录审计日志
    await createAuditLog(c, {
      action: 'user.ban',
      entity_type: 'user',
      entity_id: id,
      old_values: JSON.stringify({ deleted_at: null }),
      new_values: JSON.stringify({ deleted_at: new Date().toISOString(), reason }),
    })

    return c.json({
      success: true,
      message: '用户已被封禁',
    })
  } catch (error: any) {
    logger.error('Failed to ban user:', error)
    return c.json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: '封禁用户失败',
      },
    }, 500)
  }
})

// 解封用户
app.post('/api/admin/users/:id/unban', requireModeratorOrAdmin, csrfProtectionMiddleware, async (c) => {
  try {
    const { id } = c.req.param()
    const currentUser = c.get('currentUser')

    const user = await c.env.DB.prepare(
      'SELECT id, username FROM users WHERE id = ? AND deleted_at IS NOT NULL'
    ).bind(id).first()

    if (!user) {
      return c.json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: '用户不存在或未被封禁',
        },
      }, 404)
    }

    // 恢复用户状态
    await c.env.DB.prepare(
      'UPDATE users SET deleted_at = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).bind(id).run()

    // 记录审计日志
    await createAuditLog(c, {
      action: 'user.unban',
      entity_type: 'user',
      entity_id: id,
      old_values: JSON.stringify({ deleted_at: user.deleted_at }),
      new_values: JSON.stringify({ deleted_at: null }),
    })

    return c.json({
      success: true,
      message: '用户已解封',
    })
  } catch (error: any) {
    logger.error('Failed to unban user:', error)
    return c.json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: '解封用户失败',
      },
    }, 500)
  }
})

// 永久删除用户
app.delete('/api/admin/users/:id', requireAdmin, csrfProtectionMiddleware, async (c) => {
  try {
    const { id } = c.req.param()
    const currentUser = c.get('currentUser')

    const user = await c.env.DB.prepare(
      'SELECT id, username FROM users WHERE id = ?'
    ).bind(id).first()

    if (!user) {
      return c.json({
        success: false,
      error: {
        code: 'USER_NOT_FOUND',
        message: '用户不存在',
      },
      }, 404)
    }

    // 不能删除自己
    if (user.id === currentUser.id) {
      return c.json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: '不能删除自己',
        },
      }, 403)
    }

    // 永久删除用户（级联删除）
    await c.env.DB.prepare('DELETE FROM users WHERE id = ?').bind(id).run()

    // 记录审计日志
    await createAuditLog(c, {
      action: 'user.delete',
      entity_type: 'user',
      entity_id: id,
      old_values: JSON.stringify(user),
      new_values: null,
    })

    return c.json({
      success: true,
      message: '用户已永久删除',
    })
  } catch (error: any) {
    logger.error('Failed to delete user:', error)
    return c.json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: '删除用户失败',
      },
    }, 500)
  }
})

export default app