import type { Notification } from '../db/models'
import { generateId } from '../utils/crypto'

export interface CreateNotificationInput {
  user_id: string
  type: string
  title: string
  message: string
  link?: string
}

export class NotificationService {
  constructor(private db: D1Database) {}

  async create(input: CreateNotificationInput): Promise<Notification> {
    const id = generateId()

    await this.db
      .prepare(
        'INSERT INTO notifications (id, user_id, type, title, message, link) VALUES (?, ?, ?, ?, ?, ?)'
      )
      .bind(id, input.user_id, input.type, input.title, input.message, input.link || null)
      .run()

    return this.findById(id) as Promise<Notification>
  }

  async findById(id: string): Promise<Notification | null> {
    return this.db.prepare('SELECT id, user_id, type, title, message, link, is_read, created_at FROM notifications WHERE id = ?').bind(id).first<Notification>()
  }

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

    let query = 'SELECT id, user_id, type, title, message, link, is_read, created_at FROM notifications WHERE user_id = ?'
    const params: any[] = [userId]

    if (unread_only) {
      query += ' AND is_read = 0'
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?'
    params.push(limit, offset)

    const notifications = await this.db.prepare(query).bind(...params).all<Notification>()

    const unreadCountResult = await this.db
      .prepare('SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0')
      .bind(userId)
      .first<{ count: number }>()

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

  async markAsRead(id: string, userId: string): Promise<Notification | null> {
    await this.db
      .prepare('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?')
      .bind(id, userId)
      .run()

    return this.findById(id)
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.db
      .prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0')
      .bind(userId)
      .run()
  }

  async delete(id: string, userId: string): Promise<void> {
    await this.db.prepare('DELETE FROM notifications WHERE id = ? AND user_id = ?').bind(id, userId).run()
  }

  async deleteAll(userId: string): Promise<void> {
    await this.db.prepare('DELETE FROM notifications WHERE user_id = ?').bind(userId).run()
  }
}