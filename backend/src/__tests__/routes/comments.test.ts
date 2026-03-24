import { describe, it, expect, beforeEach } from 'vitest'
import { Hono } from 'hono'
import commentsRouter from '../../routes/comments'
import { createMockD1Database } from '../helpers/db'
import { initJWT } from '../../utils/jwt'
import { createAuthHeader, createCSRFHeaders, csrfStore } from '../helpers/test-utils'
import type { Env, Variables } from '../../types'
import { Audience } from '../../utils/jwt'

describe('Comments Router', () => {
  let app: Hono<{ Bindings: Env; Variables: Variables }>
  let mockDb: any

  beforeEach(() => {
    mockDb = createMockD1Database()
    csrfStore.clear()
    initJWT('A1b2C3d4!E5f6G7h8@I9j0K1l2#M3n4O5p6')

    app = new Hono<{ Bindings: Env; Variables: Variables }>()
    app.use('*', async (c, next) => {
      if (!c.env) {
        c.env = {} as Env
      }
      c.env.DB = mockDb
      c.env.JWT_SECRET = 'test-secret-key-32-characters-long-key'
      // Mock KV storage with CSRF support
      c.env.KV = {
        get: async (key: string, type?: string) => {
          const value = csrfStore.get(key)
          if (type === 'text') {
            return value as string | null
          }
          return value
        },
        put: async (key: string, value: string, options?: any) => {
          csrfStore.put(key, value)
        },
      } as KVNamespace
      await next()
    })
    app.route('/api/comments', commentsRouter)
  })

  describe('POST /', () => {
    it('should create a new comment', async () => {
      const mockPost = {
        id: '1',
        title: 'Test Post',
        content: 'Test content',
        author_id: '1',
        category_id: '1',
        view_count: 0,
        like_count: 0,
        comment_count: 0,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }

      const mockUser = {
        id: '2',
        username: 'testuser',
        avatar: '/avatar.png',
      }

      mockDb.tables = new Map()
      mockDb.tables.set('posts', [mockPost])
      mockDb.tables.set('users', [mockUser])
      mockDb.tables.set('notifications', [])

      const commentData = {
        postId: '1',
        content: 'This is a test comment',
      }

      const authHeader = await createAuthHeader('2')
      const csrfHeaders = createCSRFHeaders()
      const res = await app.request('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader,
          ...csrfHeaders,
        },
        body: JSON.stringify(commentData),
      })

      expect(res.status).toBe(200)
      const json = await res.json() as { content: string }
      expect(json.content).toBe('This is a test comment')
    })

    it('should return 400 when missing required fields', async () => {
      const commentData = {
        content: 'This is a test comment',
      }

      const authHeader = await createAuthHeader('1')
      const csrfHeaders = createCSRFHeaders()
      const res = await app.request('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader,
          ...csrfHeaders,
        },
        body: JSON.stringify(commentData),
      })

      expect(res.status).toBe(400)
      const json = await res.json() as { error: string }
      expect(json.error).toContain('缺少必要字段')
    })

    it('should create a reply comment', async () => {
      const mockPost = {
        id: '1',
        title: 'Test Post',
        content: 'Test content',
        author_id: '1',
        category_id: '1',
        view_count: 0,
        like_count: 0,
        comment_count: 0,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }

      const mockParentComment = {
        id: '1',
        post_id: '1',
        author_id: '3',
        content: 'Parent comment',
        parent_id: null,
        like_count: 0,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }

      const mockUser = {
        id: '2',
        username: 'testuser',
        avatar: '/avatar.png',
      }

      mockDb.tables = new Map()
      mockDb.tables.set('posts', [mockPost])
      mockDb.tables.set('comments', [mockParentComment])
      mockDb.tables.set('users', [mockUser])
      mockDb.tables.set('notifications', [])

      const commentData = {
        postId: '1',
        content: 'This is a reply',
        parentId: '1',
      }

      const authHeader = await createAuthHeader('2')
      const csrfHeaders = createCSRFHeaders()
      const res = await app.request('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader,
          ...csrfHeaders,
        },
        body: JSON.stringify(commentData),
      })

      expect(res.status).toBe(200)
      const json = await res.json() as { content: string }
      expect(json.content).toBe('This is a reply')
    })
  })

  describe('PUT /:id', () => {
    it('should update a comment', async () => {
      const mockComment = {
        id: '1',
        post_id: '1',
        author_id: '1',
        content: 'Original comment',
        parent_id: null,
        like_count: 0,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }

      mockDb.tables = new Map()
      mockDb.tables.set('comments', [mockComment])

      const updateData = {
        content: 'Updated comment',
      }

      const authHeader = await createAuthHeader('1')
      const csrfHeaders = createCSRFHeaders()
      const res = await app.request('/api/comments/1', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader,
          ...csrfHeaders,
        },
        body: JSON.stringify(updateData),
      })

      expect(res.status).toBe(200)
      const json = await res.json() as { content: string }
      expect(json.content).toBe('Updated comment')
    })

    it('should return 404 when comment does not exist', async () => {
      mockDb.tables = new Map()
      mockDb.tables.set('comments', [])

      const updateData = {
        content: 'Updated comment',
      }

      const authHeader = await createAuthHeader('1')
      const csrfHeaders = createCSRFHeaders()
      const res = await app.request('/api/comments/999', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader,
          ...csrfHeaders,
        },
        body: JSON.stringify(updateData),
      })

      expect(res.status).toBe(404)
      const json = await res.json() as { error: string }
      expect(json.error).toContain('不存在')
    })

    it('should return 403 when user is not the author', async () => {
      const mockComment = {
        id: '1',
        post_id: '1',
        author_id: '2',
        content: 'Original comment',
        parent_id: null,
        like_count: 0,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }

      mockDb.tables = new Map()
      mockDb.tables.set('comments', [mockComment])

      const updateData = {
        content: 'Updated comment',
      }

      const authHeader = await createAuthHeader('1')
      const csrfHeaders = createCSRFHeaders()
      const res = await app.request('/api/comments/1', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader,
          ...csrfHeaders,
        },
        body: JSON.stringify(updateData),
      })

      expect(res.status).toBe(403)
      const json = await res.json() as { error: string }
      expect(json.error).toContain('无权编辑')
    })
  })

  describe('DELETE /:id', () => {
    it('should delete a comment', async () => {
      const mockComment = {
        id: '1',
        post_id: '1',
        author_id: '1',
        content: 'Test comment',
        parent_id: null,
        like_count: 0,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }

      mockDb.tables = new Map()
      mockDb.tables.set('comments', [mockComment])

      const authHeader = await createAuthHeader('1')
      const csrfHeaders = createCSRFHeaders()
      const res = await app.request('/api/comments/1', {
        method: 'DELETE',
        headers: {
          ...authHeader,
          ...csrfHeaders,
        },
      })

      expect(res.status).toBe(200)
      const json = await res.json() as { message: string }
      expect(json.message).toBe('删除成功')
    })

    it('should return 404 when comment does not exist', async () => {
      mockDb.tables = new Map()
      mockDb.tables.set('comments', [])

      const authHeader = await createAuthHeader('1')
      const csrfHeaders = createCSRFHeaders()
      const res = await app.request('/api/comments/999', {
        method: 'DELETE',
        headers: {
          ...authHeader,
          ...csrfHeaders,
        },
      })

      expect(res.status).toBe(404)
      const json = await res.json() as { error: string }
      expect(json.error).toContain('不存在')
    })

    it('should return 403 when user is not the author', async () => {
      const mockComment = {
        id: '1',
        post_id: '1',
        author_id: '2',
        content: 'Test comment',
        parent_id: null,
        like_count: 0,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }

      mockDb.tables = new Map()
      mockDb.tables.set('comments', [mockComment])

      const authHeader = await createAuthHeader('1')
      const csrfHeaders = createCSRFHeaders()
      const res = await app.request('/api/comments/1', {
        method: 'DELETE',
        headers: {
          ...authHeader,
          ...csrfHeaders,
        },
      })

      expect(res.status).toBe(403)
      const json = await res.json() as { error: string }
      expect(json.error).toContain('无权删除')
    })
  })

  describe('POST /:id/like', () => {
    it('should like a comment', async () => {
      const mockComment = {
        id: '1',
        post_id: '1',
        author_id: '2',
        content: 'Test comment',
        parent_id: null,
        like_count: 0,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }

      const mockPost = {
        id: '1',
        title: 'Test Post',
        content: 'Test content',
        author_id: '2',
        category_id: '1',
        view_count: 0,
        like_count: 0,
        comment_count: 0,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }

      const mockUser = {
        id: '1',
        username: 'testuser',
      }

      mockDb.tables = new Map()
      mockDb.tables.set('comments', [mockComment])
      mockDb.tables.set('posts', [mockPost])
      mockDb.tables.set('users', [mockUser])
      mockDb.tables.set('likes', [])
      mockDb.tables.set('notifications', [])

      const authHeader = await createAuthHeader('1')
      const csrfHeaders = createCSRFHeaders()
      const res = await app.request('/api/comments/1/like', {
        method: 'POST',
        headers: {
          ...authHeader,
          ...csrfHeaders,
        },
      })

      expect(res.status).toBe(200)
      const json = await res.json() as { message: string }
      expect(json.message).toBe('点赞成功')
    })

    it('should return 400 when already liked', async () => {
      const mockComment = {
        id: '1',
        post_id: '1',
        author_id: '2',
        content: 'Test comment',
        parent_id: null,
        like_count: 0,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }

      const mockLike = {
        id: '1',
        user_id: '1',
        target_id: '1',
        target_type: 'comment',
      }

      mockDb.tables = new Map()
      mockDb.tables.set('comments', [mockComment])
      mockDb.tables.set('likes', [mockLike])

      const authHeader = await createAuthHeader('1')
      const csrfHeaders = createCSRFHeaders()
      const res = await app.request('/api/comments/1/like', {
        method: 'POST',
        headers: {
          ...authHeader,
          ...csrfHeaders,
        },
      })

      expect(res.status).toBe(400)
      const json = await res.json() as { error: string }
      expect(json.error).toContain('已经点赞过')
    })
  })

  describe('DELETE /:id/like', () => {
    it('should unlike a comment', async () => {
      const mockLike = {
        id: '1',
        user_id: '1',
        target_id: '1',
        target_type: 'comment',
      }

      mockDb.tables = new Map()
      mockDb.tables.set('likes', [mockLike])

      const authHeader = await createAuthHeader('1')
      const csrfHeaders = createCSRFHeaders()
      const res = await app.request('/api/comments/1/like', {
        method: 'DELETE',
        headers: {
          ...authHeader,
          ...csrfHeaders,
        },
      })

      expect(res.status).toBe(200)
      const json = await res.json() as { message: string }
      expect(json.message).toBe('取消点赞成功')
    })
  })
})