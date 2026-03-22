import { logger } from "../../utils/logger"
import { Hono } from 'hono'
import type { Env, Variables } from '../../types'
import { requireModeratorOrAdmin, Permission } from '../../middleware/permissions'
import { csrfProtectionMiddleware } from '../../middleware/csrf'
import { createAuditLog } from '../../utils/audit'

const app = new Hono<{ Bindings: Env; Variables: Variables }>()

// 获取帖子列表（分页、搜索、过滤）
app.get('/api/admin/posts', requireModeratorOrAdmin, async (c) => {
  try {
    const { page = '1', pageSize = '20', search = '', category = '', status = 'all' } = c.req.query()
    const pageNum = parseInt(page as string)
    const size = parseInt(pageSize as string)
    const offset = (pageNum - 1) * size

    let query = `
      SELECT 
        p.id, p.title, p.content, p.author_id, p.category_id, p.view_count, 
        p.like_count, p.comment_count, p.created_at, p.updated_at, p.deleted_at,
        u.username as author_username,
        c.name as category_name
      FROM posts p
      LEFT JOIN users u ON p.author_id = u.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `
    const params: any[] = []

    // 搜索条件
    if (search) {
      query += ' AND (p.title LIKE ? OR p.content LIKE ?)'
      params.push(`%${search}%`, `%${search}%`)
    }

    // 分类过滤
    if (category) {
      query += ' AND p.category_id = ?'
      params.push(category)
    }

    // 状态过滤
    if (status === 'active') {
      query += ' AND p.deleted_at IS NULL'
    } else if (status === 'deleted') {
      query += ' AND p.deleted_at IS NOT NULL'
    }

    // 获取总数
    const countQuery = query.replace(/SELECT.*FROM/, 'SELECT COUNT(*) as total FROM')
    const countResult = await c.env.DB.prepare(countQuery).bind(...params).first()
    const total = countResult?.total as number || 0

    // 获取分页数据
    query += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?'
    params.push(size, offset)

    const posts = await c.env.DB.prepare(query).bind(...params).all()

    return c.json({
      success: true,
      data: {
        posts,
        pagination: {
          page: pageNum,
          pageSize: size,
          total,
          totalPages: Math.ceil(total / size),
        },
      },
    })
  } catch (error: any) {
    logger.error('Failed to fetch posts:', error)
    return c.json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: '获取帖子列表失败',
      },
    }, 500)
  }
})

// 删除帖子（软删除）
app.delete('/api/admin/posts/:id', requireModeratorOrAdmin, csrfProtectionMiddleware, async (c) => {
  try {
    const { id } = c.req.param()
    const { reason } = await c.req.json() || ''
    const currentUser = c.get('currentUser')

    const post = await c.env.DB.prepare(
      'SELECT id, title, author_id, deleted_at FROM posts WHERE id = ?'
    ).bind(id).first()

    if (!post) {
      return c.json({
        success: false,
        error: {
          code: 'POST_NOT_FOUND',
          message: '帖子不存在',
        },
      }, 404)
    }

    // 检查权限（moderator 不能删除管理员帖子）
    if (currentUser.role === 'moderator') {
      const author = await c.env.DB.prepare(
        'SELECT role FROM users WHERE id = ?'
      ).bind(post.author_id).first()

      if (author?.role === 'admin') {
        return c.json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: '审核员不能删除管理员的帖子',
          },
        }, 403)
      }
    }

    // 软删除帖子
    await c.env.DB.prepare(
      'UPDATE posts SET deleted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).bind(id).run()

    // 记录审计日志
    await createAuditLog(c, {
      action: 'post.delete',
      entity_type: 'post',
      entity_id: id,
      old_values: JSON.stringify({ title: post.title, deleted_at: post.deleted_at }),
      new_values: JSON.stringify({ deleted_at: new Date().toISOString(), reason }),
    })

    return c.json({
      success: true,
      message: '帖子已删除',
    })
  } catch (error: any) {
    logger.error('Failed to delete post:', error)
    return c.json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: '删除帖子失败',
      },
    }, 500)
  }
})

// 恢复帖子
app.post('/api/admin/posts/:id/restore', requireModeratorOrAdmin, csrfProtectionMiddleware, async (c) => {
  try {
    const { id } = c.req.param()
    const currentUser = c.get('currentUser')

    const post = await c.env.DB.prepare(
      'SELECT id, title FROM posts WHERE id = ? AND deleted_at IS NOT NULL'
    ).bind(id).first()

    if (!post) {
      return c.json({
        success: false,
        error: {
          code: 'POST_NOT_FOUND',
          message: '帖子不存在或未被删除',
        },
      }, 404)
    }

    // 恢复帖子
    await c.env.DB.prepare(
      'UPDATE posts SET deleted_at = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).bind(id).run()

    // 记录审计日志
    await createAuditLog(c, {
      action: 'post.restore',
      entity_type: 'post',
      entity_id: id,
      old_values: JSON.stringify({ deleted_at: post.deleted_at }),
      new_values: JSON.stringify({ deleted_at: null }),
    })

    return c.json({
      success: true,
      message: '帖子已恢复',
    })
  } catch (error: any) {
    logger.error('Failed to restore post:', error)
    return c.json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: '恢复帖子失败',
      },
    }, 500)
  }
})

// 置顶帖子
app.put('/api/admin/posts/:id/pin', requireModeratorOrAdmin, csrfProtectionMiddleware, async (c) => {
  try {
    const { id } = c.req.param()
    const { pinned } = await c.req.json()
    const currentUser = c.get('currentUser')

    const post = await c.env.DB.prepare(
      'SELECT id, title, author_id FROM posts WHERE id = ? AND deleted_at IS NULL'
    ).bind(id).first()

    if (!post) {
      return c.json({
        success: false,
        error: {
          code: 'POST_NOT_FOUND',
          message: '帖子不存在或已被删除',
        },
      }, 404)
    }

    // 检查置顶数量限制（最多5个）
    if (pinned) {
      const pinnedCount = await c.env.DB.prepare(
        'SELECT COUNT(*) as count FROM posts WHERE pinned = 1 AND deleted_at IS NULL'
      ).first()
      
      if ((pinnedCount?.count as number || 0) >= 5) {
        return c.json({
          success: false,
          error: {
            code: 'TOO_MANY_PINNED',
            message: '最多只能置顶5个帖子',
          },
        }, 400)
      }
    }

    await c.env.DB.prepare(
      'UPDATE posts SET pinned = ? WHERE id = ?'
    ).bind(pinned ? 1 : 0, id).run()

    // 记录审计日志
    await createAuditLog(c, {
      action: pinned ? 'post.pin' : 'post.unpin',
      entity_type: 'post',
      entity_id: id,
      old_values: JSON.stringify({ pinned: pinned ? 0 : 1 }),
      new_values: JSON.stringify({ pinned }),
    })

    return c.json({
      success: true,
      message: pinned ? '帖子已置顶' : '帖子已取消置顶',
      data: { id, pinned },
    })
  } catch (error: any) {
    logger.error('Failed to pin post:', error)
    return c.json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: '置顶操作失败',
      },
    }, 500)
  }
})

// 获取置顶帖子列表
app.get('/api/admin/posts/pinned', requireModeratorOrAdmin, async (c) => {
  try {
    const pinnedPosts = await c.env.DB.prepare(`
      SELECT 
        p.id, p.title, p.pinned_order, p.created_at,
        u.username as author_username
      FROM posts p
      LEFT JOIN users u ON p.author_id = u.id
      WHERE p.pinned = 1 AND p.deleted_at IS NULL
      ORDER BY p.pinned_order ASC, p.created_at DESC
    `).all()

    return c.json({
      success: true,
      data: pinnedPosts,
    })
  } catch (error: any) {
    logger.error('Failed to fetch pinned posts:', error)
    return c.json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: '获取置顶帖子失败',
      },
    }, 500)
  }
})

// 更新置顶顺序
app.put('/api/admin/posts/pinned/reorder', requireModeratorOrAdmin, csrfProtectionMiddleware, async (c) => {
  try {
    const { pinnedPosts } = await c.req.json()
    const currentUser = c.get('currentUser')

    if (!Array.isArray(pinnedPosts) || pinnedPosts.length === 0) {
      return c.json({
        success: false,
        error: {
          'code': 'INVALID_INPUT',
          'message': '置顶顺序无效',
        },
      }, 400)
    }

    // 更新置顶顺序
    for (let i = 0; i < pinnedPosts.length; i++) {
      await c.env.DB.prepare(
        'UPDATE posts SET pinned_order = ? WHERE id = ? AND pinned = 1'
      ).bind(i + 1, pinnedPosts[i].id).run()
    }

    // 记录审计日志
    await createAuditLog(c, {
      action: 'post.pinned_reorder',
      entity_type: 'post',
      entity_id: 'all',
      old_values: JSON.stringify(pinnedPosts.map((p: any) => ({ id: p.id, pinned_order: p.pinned_order }))),
      new_values: JSON.stringify(pinnedPosts.map((p: any, index: number) => ({ id: p.id, pinned_order: index + 1 }))),
    })

    return c.json({
      success: true,
      message: '置顶顺序已更新',
    })
  } catch (error: any) {
    logger.error('Failed to reorder pinned posts:', error)
    return c.json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: '更新置顶顺序失败',
      },
    }, 500)
  }
})

export default app