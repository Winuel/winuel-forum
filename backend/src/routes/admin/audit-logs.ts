import { logger } from "../../utils/logger"
import { Hono } from 'hono'
import type { Env } from '../../types'
import { requireAdmin } from '../../middleware/permissions'

const app = new Hono<{ Bindings: Env }>()

// 获取审计日志列表（分页、过滤）
app.get('/api/admin/audit-logs', requireAdmin, async (c) => {
  try {
    const { 
      page = '1', 
      pageSize = '20', 
      action = '', 
      entityType = '', 
      userId = '',
      startDate = '',
      endDate = ''
    } = c.req.query()
    
    const pageNum = parseInt(page as string)
    const size = parseInt(pageSize as string)
    const offset = (pageNum - 1) * size

    let query = `
      SELECT 
        a.id, a.action, a.entity_type, a.entity_id, a.old_values, a.new_values, a.created_at,
        u.username as user_username,
        u.role as user_role
      FROM audit_logs a
      LEFT JOIN users u ON a.user_id = u.id
      WHERE 1=1
    `
    const params: any[] = []

    // 动作过滤
    if (action) {
      query += ' AND a.action LIKE ?'
      params.push(`%${action}%`)
    }

    // 实体类型过滤
    if (entityType) {
      query += ' AND a.entity_type = ?'
      params.push(entityType)
    }

    // 用户过滤
    if (userId) {
      query += ' AND a.user_id = ?'
      params.push(userId)
    }

    // 日期范围过滤
    if (startDate) {
      query += ' AND a.created_at >= ?'
      params.push(startDate)
    }

    if (endDate) {
      query += ' AND a.created_at <= ?'
      params.push(endDate)
    }

    // 获取总数
    const countQuery = query.replace(/SELECT.*FROM/, 'SELECT COUNT(*) as total FROM')
    const countResult = await c.env.DB.prepare(countQuery).bind(...params).first()
    const total = countResult?.total as number || 0

    // 获取分页数据
    query += ' ORDER BY a.created_at DESC LIMIT ? OFFSET ?'
    params.push(size, offset)

    const logs = await c.env.DB.prepare(query).bind(...params).all()

    // 解析 JSON 字段 / Parse JSON fields
    const parsedLogs = logs.results.map((log: any) => {
      try {
        return {
          ...log,
          old_values: log.old_values ? JSON.parse(log.old_values) : null,
          new_values: log.new_values ? JSON.parse(log.new_values) : null,
        }
      } catch (error) {
        // 如果解析失败，返回原始数据 / If parsing fails, return raw data
        return {
          ...log,
          old_values: null,
          new_values: null,
        }
      }
    })

    return c.json({
      success: true,
      data: {
        logs: parsedLogs,
        pagination: {
          page: pageNum,
          pageSize: size,
          total,
          totalPages: Math.ceil(total / size),
        },
      },
    })
  } catch (error: any) {
    logger.error('Failed to fetch audit logs:', error)
    return c.json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: '获取审计日志失败',
      },
    }, 500)
  }
})

// 获取审计日志详情
app.get('/api/admin/audit-logs/:id', requireAdmin, async (c) => {
  try {
    const { id } = c.req.param()

    const log = await c.env.DB.prepare(`
      SELECT 
        a.id, a.action, a.entity_type, a.entity_id, a.old_values, a.new_values, a.created_at,
        u.username as user_username,
        u.role as user_role
      FROM audit_logs a
      LEFT JOIN users u ON a.user_id = u.id
      WHERE a.id = ?
    `).bind(id).first()

    if (!log) {
      return c.json({
        success: false,
        error: {
          code: 'LOG_NOT_FOUND',
          message: '审计日志不存在',
        },
      }, 404)
    }

    try {
      return c.json({
        success: true,
        data: {
          ...log,
          old_values: log.old_values ? JSON.parse(log.old_values as string) : null,
          new_values: log.new_values ? JSON.parse(log.new_values as string) : null,
        },
      })
    } catch (error) {
      // 如果解析失败，返回原始数据 / If parsing fails, return raw data
      return c.json({
        success: true,
        data: {
          ...log,
          old_values: null,
          new_values: null,
        },
      })
    }
  } catch (error: any) {
    logger.error('Failed to fetch audit log details:', error)
    return c.json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: '获取审计日志详情失败',
      },
    }, 500)
  }
})

// 获取审计日志统计信息
app.get('/api/admin/audit-logs/stats', requireAdmin, async (c) => {
  try {
    const { startDate, endDate } = c.req.query()

    let whereClause = 'WHERE 1=1'
    const params: any[] = []

    if (startDate) {
      whereClause += ' AND created_at >= ?'
      params.push(startDate)
    }

    if (endDate) {
      whereClause += ' AND created_at <= ?'
      params.push(endDate)
    }

    // 按动作统计
    const actionStats = await c.env.DB.prepare(`
      SELECT action, COUNT(*) as count
      FROM audit_logs
      ${whereClause}
      GROUP BY action
      ORDER BY count DESC
    `).bind(...params).all()

    // 按实体类型统计
    const entityStats = await c.env.DB.prepare(`
      SELECT entity_type, COUNT(*) as count
      FROM audit_logs
      ${whereClause}
      GROUP BY entity_type
      ORDER BY count DESC
    `).bind(...params).all()

    // 按用户统计
    const userStats = await c.env.DB.prepare(`
      SELECT 
        u.username, u.role, COUNT(*) as count
      FROM audit_logs a
      LEFT JOIN users u ON a.user_id = u.id
      ${whereClause}
      GROUP BY a.user_id, u.username, u.role
      ORDER BY count DESC
      LIMIT 10
    `).bind(...params).all()

    // 总操作数
    const totalOps = await c.env.DB.prepare(`
      SELECT COUNT(*) as count FROM audit_logs ${whereClause}
    `).bind(...params).first()

    return c.json({
      success: true,
      data: {
        totalOperations: totalOps?.count || 0,
        byAction: actionStats.results,
        byEntityType: entityStats.results,
        byUser: userStats.results,
      },
    })
  } catch (error: any) {
    logger.error('Failed to fetch audit log stats:', error)
    return c.json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: '获取审计日志统计失败',
      },
    }, 500)
  }
})

// 导出审计日志（CSV 格式）
app.get('/api/admin/audit-logs/export', requireAdmin, async (c) => {
  try {
    const { 
      action = '', 
      entityType = '', 
      userId = '',
      startDate = '',
      endDate = ''
    } = c.req.query()

    let query = `
      SELECT 
        a.id, a.action, a.entity_type, a.entity_id, a.old_values, a.new_values, a.created_at,
        u.username as user_username
      FROM audit_logs a
      LEFT JOIN users u ON a.user_id = u.id
      WHERE 1=1
    `
    const params: any[] = []

    if (action) {
      query += ' AND a.action LIKE ?'
      params.push(`%${action}%`)
    }

    if (entityType) {
      query += ' AND a.entity_type = ?'
      params.push(entityType)
    }

    if (userId) {
      query += ' AND a.user_id = ?'
      params.push(userId)
    }

    if (startDate) {
      query += ' AND a.created_at >= ?'
      params.push(startDate)
    }

    if (endDate) {
      query += ' AND a.created_at <= ?'
      params.push(endDate)
    }

    query += ' ORDER BY a.created_at DESC LIMIT 10000'

    const logs = await c.env.DB.prepare(query).bind(...params).all()

    // 生成 CSV
    const headers = ['ID', '时间', '操作人', '动作', '实体类型', '实体ID', '旧值', '新值']
    const rows = logs.results.map((log: any) => [
      log.id,
      log.created_at,
      log.user_username || 'N/A',
      log.action,
      log.entity_type,
      log.entity_id || 'N/A',
      log.old_values ? JSON.stringify(log.old_values).replace(/"/g, '""') : 'N/A',
      log.new_values ? JSON.stringify(log.new_values).replace(/"/g, '""') : 'N/A',
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map((row: string[]) => row.map((cell: string) => `"${cell}"`).join(',')),
    ].join('\n')

    return new Response(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="audit-logs-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    })
  } catch (error: any) {
    logger.error('Failed to export audit logs:', error)
    return c.json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: '导出审计日志失败',
      },
    }, 500)
  }
})

export default app