import { logger } from "../../utils/logger"
import { Hono } from 'hono'
import type { Env, Variables } from '../../types'
import { requireModeratorOrAdmin } from '../../middleware/permissions'
import { csrfProtectionMiddleware } from '../../middleware/csrf'
import { createAuditLog } from '../../utils/audit'

const app = new Hono<{ Bindings: Env; Variables: Variables }>()

// 获取评论列表（分页、搜索、过滤）
app.get('/api/admin/comments', requireModeratorOrAdmin, async (c) => {
  try {
    const { page = '1', pageSize = '20', search = '', status = 'all' } = c.req.query()
    const pageNum = parseInt(page as string)
    const size = parseInt(pageSize as string)
    const offset = (pageNum - 1) * size

    let query = `
      SELECT 
        c.id, c.content, c.author_id, c.post_id, c.created_at, c.deleted_at,
        u.username as author_username,
        p.title as post_title
      FROM comments c
      LEFT JOIN users u ON c.author_id = u.id
      LEFT JOIN posts p ON c.post_id = p.id
      WHERE 1=1
    `
    const params: any[] = []

    // 搜索条件
    if (search) {
      query += ' AND (c.content LIKE ? OR u.username LIKE ?)'
      params.push(`%${search}%`, `%${search}%`)
    }

    // 状态过滤
    if (status === 'active') {
      query += ' AND c.deleted_at IS NULL'
    } else if (status === 'deleted') {
      query += ' AND c.deleted_at IS NOT NULL'
    }

    // 获取总数
    const countQuery = query.replace(/SELECT.*FROM/, 'SELECT COUNT(*) as total FROM')
    const countResult = await c.env.DB.prepare(countQuery).bind(...params).first()
    const total = countResult?.total as number || 0

    // 获取分页数据
    query += ' ORDER BY c.created_at DESC LIMIT ? OFFSET ?'
    params.push(size, offset)

    const comments = await c.env.DB.prepare(query).bind(...params).all()

    return c.json({
      success: true,
      data: {
        comments,
        pagination: {
          page: pageNum,
          pageSize: size,
          total,
          totalPages: Math.ceil(total / size),
        },
      },
    })
  } catch (error: any) {
    logger.error('Failed to fetch comments:', error)
    return c.json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: '获取评论列表失败',
      },
    }, 500)
  }
})

// 删除评论（软删除）
app.delete('/api/admin/comments/:id', requireModeratorOrAdmin, csrfProtectionMiddleware, async (c) => {
  try {
    const { id } = c.req.param()
    const { reason } = await c.req.json() || ''
    const currentUser = c.get('currentUser')

    const comment = await c.env.DB.prepare(
      'SELECT id, content, author_id, deleted_at FROM comments WHERE id = ?'
    ).bind(id).first()

    if (!comment) {
      return c.json({
        success: false,
        error: {
          code: 'COMMENT_NOT_FOUND',
          message: '评论不存在',
        },
      }, 404)
    }

    // 软删除评论
    await c.env.DB.prepare(
      'UPDATE comments SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).bind(id).run()

    // 记录审计日志
    await createAuditLog(c, {
      action: 'comment.delete',
      entity_type: 'comment',
      entity_id: id,
      old_values: JSON.stringify({ content: comment.content, deleted_at: comment.deleted_at }),
      new_values: JSON.stringify({ deleted_at: new Date().toISOString(), reason }),
    })

    return c.json({
      success: true,
      message: '评论已删除',
    })
  } catch (error: any) {
    logger.error('Failed to delete comment:', error)
    return c.json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: '删除评论失败',
      },
    }, 500)
  }
})

// 恢复评论
app.post('/api/admin/comments/:id/restore', requireModeratorOrAdmin, csrfProtectionMiddleware, async (c) => {
  try {
    const { id } = c.req.param()
    const currentUser = c.get('currentUser')

    const comment = await c.env.DB.prepare(
      'SELECT id, content FROM comments WHERE id = ? AND deleted_at IS NOT NULL'
    ).bind(id).first()

    if (!comment) {
      return c.json({
        success: false,
        error: {
          code: 'COMMENT_NOT_FOUND',
          message: '评论不存在或未被删除',
        },
      }, 404)
    }

    // 恢复评论
    await c.env.DB.prepare(
      'UPDATE comments SET deleted_at = NULL WHERE id = ?'
    ).bind(id).run()

    // 记录审计日志
    await createAuditLog(c, {
      action: 'comment.restore',
      entity_type: 'comment',
      entity_id: id,
      old_values: JSON.stringify({ deleted_at: comment.deleted_at }),
      new_values: JSON.stringify({ deleted_at: null }),
    })

    return c.json({
      success: true,
      message: '评论已恢复',
    })
  } catch (error: any) {
    logger.error('Failed to restore comment:', error)
    return c.json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: '恢复评论失败',
      },
    }, 500)
  }
})

// 批量删除评论
app.post('/api/admin/comments/batch-delete', requireModeratorOrAdmin, csrfProtectionMiddleware, async (c) => {
  try {
    const { ids, reason } = await c.req.json()
    const currentUser = c.get('currentUser')

    if (!Array.isArray(ids) || ids.length === 0) {
      return c.json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: '评论ID列表无效',
        },
      }, 400)
    }

    // 获取要删除的评论信息
    const placeholders = ids.map(() => '?').join(',')
    const comments = await c.env.DB.prepare(
      `SELECT id, content FROM comments WHERE id IN (${placeholders})`
    ).bind(...ids).all()

    // 批量软删除
    await c.env.DB.prepare(
      `UPDATE comments SET deleted_at = CURRENT_TIMESTAMP WHERE id IN (${placeholders})`
    ).bind(...ids).run()

    // 记录审计日志
    await createAuditLog(c, {
      action: 'comment.batch_delete',
      entity_type: 'comment',
      entity_id: ids.join(','),
      old_values: JSON.stringify(comments),
      new_values: JSON.stringify({ deleted_at: new Date().toISOString(), reason, count: ids.length }),
    })

    return c.json({
      success: true,
      message: `已删除 ${ids.length} 条评论`,
    })
  } catch (error: any) {
    logger.error('Failed to batch delete comments:', error)
    return c.json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: '批量删除评论失败',
      },
    }, 500)
  }
})

export default app