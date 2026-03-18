import { describe, it, expect, beforeEach } from 'vitest'
import { Hono } from 'hono'
import notificationsRouter from '../../routes/notifications'
import { createMockD1Database } from '../helpers/db'
import { initJWT, generateToken } from '../../utils/jwt'
import type { Env, Variables } from '../../types'

describe('Notifications Router', () => {
  let app: Hono<{ Bindings: Env; Variables: Variables }>
  let mockDb: any
  let authToken: string

  beforeEach(async () => {
    mockDb = createMockD1Database()
    initJWT('test-secret-key-32-characters-long-key')

    // Generate auth token
    authToken = await generateToken({
      userId: 'user1',
      username: 'testuser',
      role: 'user',
    })

    app = new Hono<{ Bindings: Env; Variables: Variables }>()
    app.route('/api/notifications', notificationsRouter)

    // Mock the env
    app.use('*', async (c, next) => {
      if (!c.env) {
        c.env = {} as Env
      }
      c.env.DB = mockDb
      c.env.JWT_SECRET = 'test-secret-key-32-characters-long-key'
      await next()
    })
  })

  describe('GET /', () => {
    it('should return user notifications', async () => {
      const mockNotifications = [
        {
          id: '1',
          user_id: 'user1',
          type: 'comment',
          title: '新评论通知',
          message: '有人评论了你的帖子',
          link: '/posts/1',
          is_read: false,
          created_at: '2024-01-01T00:00:00Z',
        },
        {
          id: '2',
          user_id: 'user1',
          type: 'like',
          title: '点赞通知',
          message: '有人点赞了你的帖子',
          link: '/posts/1',
          is_read: true,
          created_at: '2024-01-02T00:00:00Z',
        },
      ]

      mockDb.tables = new Map()
      mockDb.tables.set('notifications', mockNotifications)

      const res = await app.request('/api/notifications?page=1&limit=20', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      })

      expect(res.status).toBe(200)
      const json = await res.json() as { notifications: any[]; total: number; unread_count: number }
      expect(json.notifications).toHaveLength(2)
      expect(json.total).toBe(2)
      expect(json.unread_count).toBe(1)
    })

    it('should filter unread notifications only', async () => {
      const mockNotifications = [
        {
          id: '1',
          user_id: 'user1',
          type: 'comment',
          title: '新评论通知',
          message: '有人评论了你的帖子',
          link: '/posts/1',
          is_read: false,
          created_at: '2024-01-01T00:00:00Z',
        },
        {
          id: '2',
          user_id: 'user1',
          type: 'like',
          title: '点赞通知',
          message: '有人点赞了你的帖子',
          link: '/posts/1',
          is_read: true,
          created_at: '2024-01-02T00:00:00Z',
        },
      ]

      mockDb.tables = new Map()
      mockDb.tables.set('notifications', mockNotifications)

      const res = await app.request('/api/notifications?unreadOnly=true', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      })

      expect(res.status).toBe(200)
      const json = await res.json() as { notifications: any[] }
      expect(json.notifications).toHaveLength(1)
      expect(json.notifications[0].is_read).toBe(false)
    })
  })

  describe('GET /unread-count', () => {
    it('should return unread count', async () => {
      const mockNotifications = [
        {
          id: '1',
          user_id: 'user1',
          type: 'comment',
          title: '新评论通知',
          message: '有人评论了你的帖子',
          link: '/posts/1',
          is_read: false,
          created_at: '2024-01-01T00:00:00Z',
        },
        {
          id: '2',
          user_id: 'user1',
          type: 'like',
          title: '点赞通知',
          message: '有人点赞了你的帖子',
          link: '/posts/1',
          is_read: false,
          created_at: '2024-01-02T00:00:00Z',
        },
      ]

      mockDb.tables = new Map()
      mockDb.tables.set('notifications', mockNotifications)

      const res = await app.request('/api/notifications/unread-count', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      })

      expect(res.status).toBe(200)
      const json = await res.json()
      expect(json.unread_count).toBe(2)
    })
  })

  describe('PATCH /:id/read', () => {
    it('should mark notification as read', async () => {
      const mockNotification = {
        id: '1',
        user_id: 'user1',
        type: 'comment',
        title: '新评论通知',
        message: '有人评论了你的帖子',
        link: '/posts/1',
        is_read: false,
        created_at: '2024-01-01T00:00:00Z',
      }

      mockDb.tables = new Map()
      mockDb.tables.set('notifications', [mockNotification])

      const res = await app.request('/api/notifications/1/read', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      })

      expect(res.status).toBe(200)
      const json = await res.json()
      expect(json.is_read).toBe(true)
    })
  })

  describe('PATCH /read-all', () => {
    it('should mark all notifications as read', async () => {
      const mockNotifications = [
        {
          id: '1',
          user_id: 'user1',
          type: 'comment',
          title: '新评论通知',
          message: '有人评论了你的帖子',
          link: '/posts/1',
          is_read: false,
          created_at: '2024-01-01T00:00:00Z',
        },
        {
          id: '2',
          user_id: 'user1',
          type: 'like',
          title: '点赞通知',
          message: '有人点赞了你的帖子',
          link: '/posts/1',
          is_read: false,
          created_at: '2024-01-02T00:00:00Z',
        },
      ]

      mockDb.tables = new Map()
      mockDb.tables.set('notifications', mockNotifications)

      const res = await app.request('/api/notifications/read-all', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      })

      expect(res.status).toBe(200)
      const json = await res.json()
      expect(json.message).toContain('已读')
    })
  })

  describe('DELETE /:id', () => {
    it('should delete notification', async () => {
      const mockNotification = {
        id: '1',
        user_id: 'user1',
        type: 'comment',
        title: '新评论通知',
        message: '有人评论了你的帖子',
        link: '/posts/1',
        is_read: false,
        created_at: '2024-01-01T00:00:00Z',
      }

      mockDb.tables = new Map()
      mockDb.tables.set('notifications', [mockNotification])

      const res = await app.request('/api/notifications/1', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      })

      expect(res.status).toBe(200)
      const json = await res.json()
      expect(json.message).toContain('删除成功')
    })
  })

  describe('DELETE /', () => {
    it('should delete all notifications', async () => {
      const mockNotifications = [
        {
          id: '1',
          user_id: 'user1',
          type: 'comment',
          title: '新评论通知',
          message: '有人评论了你的帖子',
          link: '/posts/1',
          is_read: false,
          created_at: '2024-01-01T00:00:00Z',
        },
        {
          id: '2',
          user_id: 'user1',
          type: 'like',
          title: '点赞通知',
          message: '有人点赞了你的帖子',
          link: '/posts/1',
          is_read: true,
          created_at: '2024-01-02T00:00:00Z',
        },
      ]

      mockDb.tables = new Map()
      mockDb.tables.set('notifications', mockNotifications)

      const res = await app.request('/api/notifications', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      })

      expect(res.status).toBe(200)
      const json = await res.json()
      expect(json.message).toContain('删除')
    })
  })
})