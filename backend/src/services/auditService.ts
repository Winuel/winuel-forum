/**
 * 审核日志服务
 * Audit Log Service
 * 
 * 负责审核日志的管理，包括：
 * - 审核日志的创建和查询
 * - 支持按用户、实体、操作、日期范围等多种方式查询
 * - 记录操作前后的值变化
 * - 记录 IP 地址和用户代理信息
 * 
 * Responsible for audit log management, including:
 * - Audit log creation and query
 * - Supports querying by user, entity, action, date range, etc.
 * - Records value changes before and after operations
 * - Records IP address and user agent information
 * 
 * @package backend/src/services
 */

import type { AuditLog } from '../db/models'
import { generateId } from '../utils/crypto'

/**
 * 创建审核日志输入接口
 * Create Audit Log Input Interface
 * 定义创建审核日志所需的数据结构
 * Defines the data structure required for creating an audit log
 */
export interface CreateAuditLogInput {
  /** 用户 ID（可选）/ User ID (optional) */
  user_id?: string
  /** 操作类型 / Action type */
  action: string
  /** 实体类型 / Entity type */
  entity_type: string
  /** 实体 ID / Entity ID */
  entity_id: string
  /** 旧值（可选）/ Old values (optional) */
  old_values?: Record<string, unknown>
  /** 新值（可选）/ New values (optional) */
  new_values?: Record<string, unknown>
  /** IP 地址（可选）/ IP address (optional) */
  ip_address?: string
  /** 用户代理（可选）/ User agent (optional) */
  user_agent?: string
  /** 状态 / Status */
  status?: 'success' | 'failure'
  /** 错误信息（可选）/ Error message (optional) */
  error_message?: string
}

/**
 * 审核日志服务类
 * Audit Log Service Class
 * 
 * 提供审核日志管理的所有业务逻辑
 * Provides all business logic for audit log management
 */
export class AuditService {
  /**
   * 构造函数
   * Constructor
   * 
   * @param db - D1 数据库实例 / D1 database instance
   */
  constructor(private db: D1Database) {}

  /**
   * 创建审核日志
   * Create Audit Log
   * 
   * @param input - 审核日志创建信息 / Audit log creation information
   * @returns 创建的审核日志对象 / Created audit log object
   */
  async create(input: CreateAuditLogInput): Promise<AuditLog> {
    const id = generateId()
    const now = new Date().toISOString()

    // 插入审核日志数据 / Insert audit log data
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

  /**
   * 根据 ID 查找审核日志
   * Find Audit Log by ID
   * 
   * @param id - 审核日志 ID / Audit log ID
   * @returns 审核日志对象或 null / Audit log object or null
   */
  async findById(id: string): Promise<AuditLog | null> {
    return this.db.prepare('SELECT id, user_id, action, entity_type, entity_id, old_values, new_values, ip_address, user_agent, status, error_message, created_at FROM audit_logs WHERE id = ?').bind(id).first<AuditLog>()
  }

  /**
   * 根据用户 ID 查找审核日志
   * Find Audit Logs by User ID
   * 
   * @param userId - 用户 ID / User ID
   * @param limit - 返回数量限制 / Return limit
   * @returns 审核日志列表 / Audit log list
   */
  async findByUserId(userId: string, limit: number = 100): Promise<AuditLog[]> {
    const result = await this.db
      .prepare('SELECT id, user_id, action, entity_type, entity_id, old_values, new_values, ip_address, user_agent, status, error_message, created_at FROM audit_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT ?')
      .bind(userId, limit)
      .all<AuditLog>()

    return result.results || []
  }

  /**
   * 根据实体查找审核日志
   * Find Audit Logs by Entity
   * 
   * @param entityType - 实体类型 / Entity type
   * @param entityId - 实体 ID / Entity ID
   * @param limit - 返回数量限制 / Return limit
   * @returns 审核日志列表 / Audit log list
   */
  async findByEntity(entityType: string, entityId: string, limit: number = 100): Promise<AuditLog[]> {
    const result = await this.db
      .prepare('SELECT id, user_id, action, entity_type, entity_id, old_values, new_values, ip_address, user_agent, status, error_message, created_at FROM audit_logs WHERE entity_type = ? AND entity_id = ? ORDER BY created_at DESC LIMIT ?')
      .bind(entityType, entityId, limit)
      .all<AuditLog>()

    return result.results || []
  }

  /**
   * 根据操作类型查找审核日志
   * Find Audit Logs by Action
   * 
   * @param action - 操作类型 / Action type
   * @param limit - 返回数量限制 / Return limit
   * @returns 审核日志列表 / Audit log list
   */
  async findByAction(action: string, limit: number = 100): Promise<AuditLog[]> {
    const result = await this.db
      .prepare('SELECT id, user_id, action, entity_type, entity_id, old_values, new_values, ip_address, user_agent, status, error_message, created_at FROM audit_logs WHERE action = ? ORDER BY created_at DESC LIMIT ?')
      .bind(action, limit)
      .all<AuditLog>()

    return result.results || []
  }

  /**
   * 查找最近的审核日志
   * Find Recent Audit Logs
   * 
   * @param limit - 返回数量限制 / Return limit
   * @returns 审核日志列表 / Audit log list
   */
  async findRecent(limit: number = 100): Promise<AuditLog[]> {
    const result = await this.db
      .prepare('SELECT id, user_id, action, entity_type, entity_id, old_values, new_values, ip_address, user_agent, status, error_message, created_at FROM audit_logs ORDER BY created_at DESC LIMIT ?')
      .bind(limit)
      .all<AuditLog>()

    return result.results || []
  }

  /**
   * 根据日期范围查找审核日志
   * Find Audit Logs by Date Range
   * 
   * @param startDate - 开始日期 / Start date
   * @param endDate - 结束日期 / End date
   * @returns 审核日志列表 / Audit log list
   */
  async findByDateRange(startDate: string, endDate: string): Promise<AuditLog[]> {
    const result = await this.db
      .prepare('SELECT id, user_id, action, entity_type, entity_id, old_values, new_values, ip_address, user_agent, status, error_message, created_at FROM audit_logs WHERE created_at >= ? AND created_at <= ? ORDER BY created_at DESC')
      .bind(startDate, endDate)
      .all<AuditLog>()

    return result.results || []
  }
}