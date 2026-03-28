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
    if (currentUser?.role === 'moderator' && user.role === 'admin') {
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
    if (currentUser?.userId && user.id === currentUser.userId) {
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

// 批量删除用户
app.post('/api/admin/users/batch-delete', requireAdmin, csrfProtectionMiddleware, async (c) => {
  try {
    const { ids, reason } = await c.req.json()
    const currentUser = c.get('currentUser')
    const clientIp = c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for') || 'unknown'

    // 验证输入
    if (!Array.isArray(ids) || ids.length === 0) {
      return c.json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: '用户ID列表无效 / Invalid user ID list',
        },
      }, 400)
    }

    // 限制一次最多删除的用户数量
    if (ids.length > 100) {
      return c.json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: '一次最多删除100个用户 / Maximum 100 users can be deleted at once',
        },
      }, 400)
    }

    // 强制要求提供删除原因
    if (!reason || reason.trim().length === 0) {
      return c.json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: '必须提供删除原因 / Deletion reason is required',
        },
      }, 400)
    }

    // 不能删除自己
    if (currentUser?.userId && ids.includes(currentUser.userId)) {
      logger.warn('Batch delete attempt: Trying to delete self', { userId: currentUser.userId })
      return c.json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: '不能删除自己 / Cannot delete yourself',
        },
      }, 403)
    }

    // 获取要删除的用户信息（包括角色）
    const placeholders = ids.map(() => '?').join(',')
    const users = await c.env.DB.prepare(
      `SELECT id, username, email, role FROM users WHERE id IN (${placeholders})`
    ).bind(...ids).all()

    // 检查是否有管理员
    for (const user of users.results || []) {
      if ((user as any).role === 'admin') {
        logger.error('Batch delete attempt: Trying to delete admin', { 
          adminId: (user as any).id,
          requestedBy: currentUser?.userId,
          clientIp 
        })
        return c.json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: '不能删除管理员 / Cannot delete admin users',
          },
        }, 403)
      }
    }

    // 检查用户是否有关联数据（可选：根据需求决定是否允许删除有关联数据的用户）
    const postsCount = await c.env.DB.prepare(
      `SELECT COUNT(*) as count FROM posts WHERE author_id IN (${placeholders})`
    ).bind(...ids).first<{ count: number }>()

    const commentsCount = await c.env.DB.prepare(
      `SELECT COUNT(*) as count FROM comments WHERE author_id IN (${placeholders})`
    ).bind(...ids).first<{ count: number }>()

    // 记录审计日志（操作前）
    for (const user of users.results || []) {
      await createAuditLog(c, {
        action: 'user.batch_delete_start',
        entity_type: 'user',
        entity_id: (user as any).id,
        old_values: JSON.stringify({ 
          username: user.username, 
          email: user.email,
          role: (user as any).role,
          posts_count: postsCount?.count || 0,
          comments_count: commentsCount?.count || 0
        }),
        new_values: JSON.stringify({ 
          deleted: true, 
          reason: reason,
          deleted_by: currentUser?.username,
          client_ip: clientIp
        })
      })
    }

    // 批量软删除
    await c.env.DB.prepare(
      `UPDATE users SET deleted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id IN (${placeholders})`
    ).bind(...ids).run()

    // 记录审计日志（操作后）
    logger.info(`Batch deleted ${ids.length} users`, { 
      deletedBy: currentUser?.username, 
      reason: reason,
      clientIp: clientIp 
    })

    return c.json({
      success: true,
      message: `成功删除 ${ids.length} 个用户 / Successfully deleted ${ids.length} users`,
      data: {
        deleted_count: ids.length,
        posts_affected: postsCount?.count || 0,
        comments_affected: commentsCount?.count || 0
      },
    })
  } catch (error: any) {
    logger.error('Failed to batch delete users', error)
    return c.json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: '批量删除失败 / Batch delete failed',
      },
    }, 500)
  }
})
      data: {
        deleted_count: ids.length,
        deleted_ids: ids
      }
    })
  } catch (error: any) {
    logger.error('Failed to batch delete users:', error)
    return c.json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: '批量删除用户失败 / Failed to batch delete users',
      },
    }, 500)
  }
})

// 批量更新用户角色
app.post('/api/admin/users/batch-update-role', requireAdmin, csrfProtectionMiddleware, async (c) => {
  try {
    const { ids, role, reason } = await c.req.json()
    const currentUser = c.get('currentUser')

    if (!Array.isArray(ids) || ids.length === 0) {
      return c.json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: '用户ID列表无效 / Invalid user ID list',
        },
      }, 400)
    }

    if (!['user', 'moderator', 'admin'].includes(role)) {
      return c.json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: '无效的角色值 / Invalid role value',
        },
      }, 400)
    }

    if (ids.length > 100) {
      return c.json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: '一次最多更新100个用户 / Maximum 100 users can be updated at once',
        },
      }, 400)
    }

    // 获取要更新的用户信息
    const placeholders = ids.map(() => '?').join(',')
    const users = await c.env.DB.prepare(
      `SELECT id, role FROM users WHERE id IN (${placeholders})`
    ).bind(...ids).all()

    // 检查是否有管理员
    for (const user of users.results || []) {
      if ((user as any).role === 'admin' && (user as any).id !== currentUser?.userId) {
        return c.json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: '不能修改其他管理员的角色 / Cannot modify role of other admins',
          },
        }, 403)
      }
    }

    // 批量更新角色
    await c.env.DB.prepare(
      `UPDATE users SET role = ? WHERE id IN (${placeholders})`
    ).bind(role, ...ids).run()

    // 记录审计日志
    for (const user of users.results || []) {
      await createAuditLog(c, {
        action: 'user.batch_update_role',
        entity_type: 'user',
        entity_id: (user as any).id,
        old_values: JSON.stringify({ role: (user as any).role }),
        new_values: JSON.stringify({ role: role, reason: reason || '批量更新角色' })
      })
    }

    logger.info(`Batch updated ${ids.length} users to role '${role}' by ${currentUser?.username}`)

    return c.json({
      success: true,
      message: `成功更新 ${ids.length} 个用户角色 / Successfully updated ${ids.length} users role`,
      data: {
        updated_count: ids.length,
        updated_ids: ids,
        new_role: role
      }
    })
  } catch (error: any) {
    logger.error('Failed to batch update user role:', error)
    return c.json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: '批量更新用户角色失败 / Failed to batch update user role',
      },
    }, 500)
  }
})

export default app