/**
 * 通知服务
 * Notification Service
 * 
 * 负责处理用户通知相关的业务逻辑，包括：
 * - 通知的创建、查询、更新和删除
 * - 标记通知为已读
 * - 支持分页查询和未读通知筛选
 * 
 * Provides user notification-related business logic handling:
 * - Notification creation, query, update, and deletion
 * - Marking notifications as read
 * - Supports pagination and unread notification filtering
 * 
 * @package backend/src/services
 */

import type { Notification } from '../db/models'
import { generateId } from '../utils/crypto'

/**
 * 创建通知输入接口
 * Create Notification Input Interface
 * 定义创建新通知所需的数据结构
 * Defines the data structure required for creating a new notification
 */
export interface CreateNotificationInput {
  /** 用户 ID / User ID */
  user_id: string
  /** 通知类型 / Notification type */
  type: string
  /** 通知标题 / Notification title */
  title: string
  /** 通知消息 / Notification message */
  message: string
  /** 通知链接（可选）/ Notification link (optional) */
  link?: string
}

/**
 * 通知服务类
 * Notification Service Class
 * 
 * 提供通知管理的所有业务逻辑
 * Provides all business logic for notification management
 */
export class NotificationService {
  /**
   * 构造函数
   * Constructor
   * 
   * @param db - D1 数据库实例 / D1 database instance
   */
  constructor(private db: D1Database) {}

  /**
   * 创建通知
   * Create Notification
   * 
   * @param input - 通知创建信息 / Notification creation information
   * @returns 创建的通知对象 / Created notification object
   */
  async create(input: CreateNotificationInput): Promise<Notification> {
    const id = generateId()

    // 插入通知数据 / Insert notification data
    await this.db
      .prepare(
        'INSERT INTO notifications (id, user_id, type, title, message, link) VALUES (?, ?, ?, ?, ?, ?)'
      )
      .bind(id, input.user_id, input.type, input.title, input.message, input.link || null)
      .run()

    return this.findById(id) as Promise<Notification>
  }

  /**
   * 根据 ID 查找通知
   * Find Notification by ID
   * 
   * @param id - 通知 ID / Notification ID
   * @returns 通知对象或 null / Notification object or null
   */
  async findById(id: string): Promise<Notification | null> {
    return this.db.prepare('SELECT id, user_id, type, title, message, link, is_read, created_at FROM notifications WHERE id = ?').bind(id).first<Notification>()
  }

  /**
   * 根据用户 ID 查找通知
   * Find Notifications by User ID
   * 
   * 支持分页查询和未读通知筛选
   * Supports pagination and unread notification filtering
   * 
   * @param userId - 用户 ID / User ID
   * @param options - 查询选项 / Query options
   * @param options.page - 页码 / Page number
   * @param options.limit - 每页数量 / Items per page
   * @param options.unread_only - 是否只查询未读通知 / Whether to query only unread notifications
   * @returns 包含通知列表、总数和未读数的对象 / Object containing notification list, total count, and unread count
   */
  async findByUserId(
    userId: string,
    options: {
      page?: number
      limit?: number
      unread_only?: boolean
    } = {}
  ): Promise<{ notifications: Notification[]; total: number; unread_count: number }> {
    const { page = 1, limit = 20, unread_only } = options
    const offset = (page - 1) * limit

    // 构建查询语句 / Build query statement
    let query = 'SELECT id, user_id, type, title, message, link, is_read, created_at FROM notifications WHERE user_id = ?'
    const params: any[] = [userId]

    if (unread_only) {
      query += ' AND is_read = 0'
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?'
    params.push(limit, offset)

    const notifications = await this.db.prepare(query).bind(...params).all<Notification>()

    // 获取未读通知数 / Get unread notification count
    const unreadCountResult = await this.db
      .prepare('SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0')
      .bind(userId)
      .first<{ count: number }>()

    // 获取通知总数 / Get total notification count
    const totalResult = await this.db
      .prepare('SELECT COUNT(*) as count FROM notifications WHERE user_id = ?')
      .bind(userId)
      .first<{ count: number }>()

    return {
      notifications: notifications.results || [],
      total: totalResult?.count || 0,
      unread_count: unreadCountResult?.count || 0,
    }
  }

  /**
   * 标记通知为已读
   * Mark Notification as Read
   * 
   * @param id - 通知 ID / Notification ID
   * @param userId - 用户 ID / User ID
   * @returns 更新后的通知对象或 null / Updated notification object or null
   */
  async markAsRead(id: string, userId: string): Promise<Notification | null> {
    await this.db
      .prepare('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?')
      .bind(id, userId)
      .run()

    return this.findById(id)
  }

  /**
   * 标记所有通知为已读
   * Mark All Notifications as Read
   * 
   * @param userId - 用户 ID / User ID
   */
  async markAllAsRead(userId: string): Promise<void> {
    await this.db
      .prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0')
      .bind(userId)
      .run()
  }

  /**
   * 删除通知
   * Delete Notification
   * 
   * @param id - 通知 ID / Notification ID
   * @param userId - 用户 ID / User ID
   */
  async delete(id: string, userId: string): Promise<void> {
    await this.db.prepare('DELETE FROM notifications WHERE id = ? AND user_id = ?').bind(id, userId).run()
  }

  /**
   * 删除所有通知
   * Delete All Notifications
   * 
   * @param userId - 用户 ID / User ID
   */
  async deleteAll(userId: string): Promise<void> {
    await this.db.prepare('DELETE FROM notifications WHERE user_id = ?').bind(userId).run()
  }
}