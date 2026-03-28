import type { Context } from 'hono'
import type { Env, Variables } from '../types'

export interface AuditLogData {
  action: string
  entity_type: string
  entity_id: string
  old_values?: string | null
  new_values?: string | null
}

/**
 * 创建审计日志
 * 记录所有重要操作，包括用户管理、内容审核、系统设置等
 */
export async function createAuditLog(c: Context<{ Bindings: Env; Variables: Variables }>, data: AuditLogData) {
  try {
    const userId = c.get('userId') || c.get('currentUser')?.userId || null
    const userAgent = c.req.header('user-agent') || null
    const ipAddress = c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for') || null

    await c.env.DB.prepare(`
      INSERT INTO audit_logs (
        user_id, action, entity_type, entity_id, 
        old_values, new_values, user_agent, ip_address
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      userId,
      data.action,
      data.entity_type,
      data.entity_id,
      data.old_values || null,
      data.new_values || null,
      userAgent,
      ipAddress
    ).run()
  } catch (error) {
    // 审计日志失败不应影响主流程，只记录错误
    console.error('Failed to create audit log:', error)
  }
}

/**
 * 创建审计日志（用于非 HTTP 上下文，如定时任务）
 */
export async function createAuditLogDirect(
  db: D1Database,
  userId: string | null,
  data: AuditLogData,
  userAgent: string | null = null,
  ipAddress: string | null = null
) {
  try {
    await db.prepare(`
      INSERT INTO audit_logs (
        user_id, action, entity_type, entity_id, 
        old_values, new_values, user_agent, ip_address
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      userId,
      data.action,
      data.entity_type,
      data.entity_id,
      data.old_values || null,
      data.new_values || null,
      userAgent,
      ipAddress
    ).run()
  } catch (error) {
    console.error('Failed to create audit log:', error)
  }
}