import type { AuditLog } from '../db/models'
import { generateId } from '../utils/crypto'

export interface CreateAuditLogInput {
  user_id?: string
  action: string
  entity_type: string
  entity_id: string
  old_values?: Record<string, any>
  new_values?: Record<string, any>
  ip_address?: string
  user_agent?: string
  status?: 'success' | 'failure'
  error_message?: string
}

export class AuditService {
  constructor(private db: D1Database) {}

  async create(input: CreateAuditLogInput): Promise<AuditLog> {
    const id = generateId()
    const now = new Date().toISOString()

    await this.db
      .prepare(
        `INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, old_values, new_values, ip_address, user_agent, status, error_message, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        id,
        input.user_id || null,
        input.action,
        input.entity_type,
        input.entity_id,
        input.old_values ? JSON.stringify(input.old_values) : null,
        input.new_values ? JSON.stringify(input.new_values) : null,
        input.ip_address || null,
        input.user_agent || null,
        input.status || 'success',
        input.error_message || null,
        now
      )
      .run()

    return this.findById(id) as Promise<AuditLog>
  }

  async findById(id: string): Promise<AuditLog | null> {
    return this.db.prepare('SELECT id, user_id, action, entity_type, entity_id, old_values, new_values, ip_address, user_agent, status, error_message, created_at FROM audit_logs WHERE id = ?').bind(id).first<AuditLog>()
  }

  async findByUserId(userId: string, limit: number = 100): Promise<AuditLog[]> {
    const result = await this.db
      .prepare('SELECT id, user_id, action, entity_type, entity_id, old_values, new_values, ip_address, user_agent, status, error_message, created_at FROM audit_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT ?')
      .bind(userId, limit)
      .all<AuditLog>()

    return result.results || []
  }

  async findByEntity(entityType: string, entityId: string, limit: number = 100): Promise<AuditLog[]> {
    const result = await this.db
      .prepare('SELECT id, user_id, action, entity_type, entity_id, old_values, new_values, ip_address, user_agent, status, error_message, created_at FROM audit_logs WHERE entity_type = ? AND entity_id = ? ORDER BY created_at DESC LIMIT ?')
      .bind(entityType, entityId, limit)
      .all<AuditLog>()

    return result.results || []
  }

  async findByAction(action: string, limit: number = 100): Promise<AuditLog[]> {
    const result = await this.db
      .prepare('SELECT id, user_id, action, entity_type, entity_id, old_values, new_values, ip_address, user_agent, status, error_message, created_at FROM audit_logs WHERE action = ? ORDER BY created_at DESC LIMIT ?')
      .bind(action, limit)
      .all<AuditLog>()

    return result.results || []
  }

  async findRecent(limit: number = 100): Promise<AuditLog[]> {
    const result = await this.db
      .prepare('SELECT id, user_id, action, entity_type, entity_id, old_values, new_values, ip_address, user_agent, status, error_message, created_at FROM audit_logs ORDER BY created_at DESC LIMIT ?')
      .bind(limit)
      .all<AuditLog>()

    return result.results || []
  }

  async findByDateRange(startDate: string, endDate: string): Promise<AuditLog[]> {
    const result = await this.db
      .prepare('SELECT id, user_id, action, entity_type, entity_id, old_values, new_values, ip_address, user_agent, status, error_message, created_at FROM audit_logs WHERE created_at >= ? AND created_at <= ? ORDER BY created_at DESC')
      .bind(startDate, endDate)
      .all<AuditLog>()

    return result.results || []
  }
}