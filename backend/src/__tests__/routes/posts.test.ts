import { describe, it, expect, beforeEach } from 'vitest'
import { Hono } from 'hono'
import postsRouter from '../../routes/posts'
import { createMockD1Database } from '../helpers/db'
import { initJWT, generateToken, Audience } from '../../utils/jwt'
import type { Env, Variables } from '../../types'
import { PostService } from '../../services/postService'
import { DEPENDENCY_TOKENS, DIContainer } from '../../utils/di'
import { csrfStore, createCSRFHeaders } from '../helpers/test-utils'

describe('Posts Router', () => {
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
        get: async (key: string) => csrfStore.get(key) || null,
        put: async (key: string, value: string, options?: any) => {
          csrfStore.put(key, value)
        },
      } as KVNamespace
      
      await next()
    })
    
    // Set up dependency injection container after middleware
    app.use('*', async (c, next) => {
      // Set up dependency injection container for each request
      const container = new DIContainer()
      container.registerSingleton(DEPENDENCY_TOKENS.POST_SERVICE, () => new PostService(c.env.DB))
      c.set('container', container)
      await next()
    })
    
    app.route('/api/posts', postsRouter)
  })

  const createAuthHeader = async (userId: string, username: string = 'testuser', role: string = 'user') => {
    const token = await generateToken({ userId, username, role }, Audience.USER)
    return {
      'Authorization': `Bearer ${token}`,
    }
  }

  describe('GET /', () => {
    it('should return all posts', async () => {
      const mockPosts = [
        {
          id: '1',
          title: 'Test Post 1',
          content: 'Content 1',
          author_id: '1',
          category_id: '1',
          view_count: 0,
          like_count: 0,
          comment_count: 0,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
        {
          id: '2',
          title: 'Test Post 2',
          content: 'Content 2',
          author_id: '2',
          category_id: '1',
          view_count: 0,
          like_count: 0,
          comment_count: 0,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      ]

      const mockAuthors = [
        { id: '1', username: 'user1', avatar: '/avatar1.png' },
        { id: '2', username: 'user2', avatar: '/avatar2.png' },
      ]

      const mockCategory = { id: '1', name: '技术讨论' }

      mockDb.tables = new Map()
      mockDb.tables.set('posts', mockPosts)
      mockDb.tables.set('users', mockAuthors)
      mockDb.tables.set('categories', [mockCategory])
      mockDb.tables.set('tags', [])
      mockDb.tables.set('post_tags', [])

      const res = await app.request('/api/posts')

      expect(res.status).toBe(200)
      const json = await res.json() as { success: boolean, data: any[], total: number, page: number, pageSize: number, totalPages: number, timestamp: string }
      expect(json.success).toBe(true)
      expect(json.data).toHaveLength(2)
      expect(json.total).toBe(2)
      expect(json.page).toBe(1)
      expect(json.pageSize).toBe(20)
    })

    it('should return empty array when no posts exist', async () => {
      mockDb.tables = new Map()
      mockDb.tables.set('posts', [])

      const res = await app.request('/api/posts')

      expect(res.status).toBe(200)
      const json = await res.json() as { success: boolean, data: any[], total: number, page: number, pageSize: number, totalPages: number }
      expect(json.success).toBe(true)
      expect(json.data).toEqual([])
      expect(json.total).toBe(0)
    })

    it('should filter by category', async () => {
      const mockPosts = [
        {
          id: '1',
          title: 'Test Post 1',
          content: 'Content 1',
          author_id: '1',
          category_id: '1',
          view_count: 0,
          like_count: 0,
          comment_count: 0,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      ]

      const mockAuthor = { id: '1', username: 'user1', avatar: '/avatar1.png' }
      const mockCategory = { id: '1', name: '技术讨论' }

      mockDb.tables = new Map()
      mockDb.tables.set('posts', mockPosts)
      mockDb.tables.set('users', [mockAuthor])
      mockDb.tables.set('categories', [mockCategory])
      mockDb.tables.set('tags', [])
      mockDb.tables.set('post_tags', [])

      const res = await app.request('/api/posts?categoryId=1')

      expect(res.status).toBe(200)
      const json = await res.json() as { success: boolean, data: any[] }
      expect(json.success).toBe(true)
      expect(json.data).toHaveLength(1)
    })

    it('should filter by author', async () => {
      const mockPosts = [
        {
          id: '1',
          title: 'Test Post 1',
          content: 'Content 1',
          author_id: '1',
          category_id: '1',
          view_count: 0,
          like_count: 0,
          comment_count: 0,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      ]

      const mockAuthor = { id: '1', username: 'user1', avatar: '/avatar1.png' }
      const mockCategory = { id: '1', name: '技术讨论' }

      mockDb.tables = new Map()
      mockDb.tables.set('posts', mockPosts)
      mockDb.tables.set('users', [mockAuthor])
      mockDb.tables.set('categories', [mockCategory])
      mockDb.tables.set('tags', [])
      mockDb.tables.set('post_tags', [])

      const res = await app.request('/api/posts?authorId=1')

      expect(res.status).toBe(200)
      const json = await res.json() as { success: boolean, data: any[] }
      expect(json.success).toBe(true)
      expect(json.data).toHaveLength(1)
    })
  })

  describe('GET /:id', () => {
    it('should return post by id', async () => {
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

      const mockAuthor = { id: '1', username: 'user1', avatar: '/avatar1.png' }
      const mockCategory = { id: '1', name: '技术讨论' }

      mockDb.tables = new Map()
      mockDb.tables.set('posts', [mockPost])
      mockDb.tables.set('users', [mockAuthor])
      mockDb.tables.set('categories', [mockCategory])
      mockDb.tables.set('tags', [])
      mockDb.tables.set('post_tags', [])

      const res = await app.request('/api/posts/1')

      

            expect(res.status).toBe(200)

            const json = await res.json() as { success: boolean, data: { id: string; title: string } }

            expect(json.success).toBe(true)

            expect(json.data.id).toBe('1')

            expect(json.data.title).toBe('Test Post')
    })

    it('should return 404 for non-existent post', async () => {
      mockDb.tables = new Map()
      mockDb.tables.set('posts', [])

      const res = await app.request('/api/posts/999')

      expect(res.status).toBe(404)
      const json = await res.json() as { success: boolean, error: { message: string } }
      expect(json.success).toBe(false)
      expect(json.error.message).toContain('帖子 / Post')
    })
  })

  describe('POST /', () => {
    it('should create a new post', async () => {
      const postData = {
        title: 'New Post',
        content: 'New content',
        categoryId: '1',
        tags: ['tag1', 'tag2'],
      }

      mockDb.tables = new Map()
      mockDb.tables.set('posts', [])
      mockDb.tables.set('categories', [{ id: '1', name: '技术讨论' }])
      mockDb.tables.set('tags', [])
      mockDb.tables.set('post_tags', [])

      const authHeader = await createAuthHeader('1')
      const csrfHeaders = createCSRFHeaders()
      const res = await app.request('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader,
          ...csrfHeaders,
        },
        body: JSON.stringify(postData),
      })

      expect(res.status).toBe(201)
      const json = await res.json() as { success: boolean, data: { title: string }, message: string }
      expect(json.success).toBe(true)
      expect(json.data.title).toBe('New Post')
      expect(json.message).toContain('帖子创建成功')
    })

    it('should return 400 when missing required fields', async () => {
      const postData = {
        title: 'New Post',
      }

      const authHeader = await createAuthHeader('1')
      const csrfHeaders = createCSRFHeaders()
      const res = await app.request('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader,
          ...csrfHeaders,
        },
        body: JSON.stringify(postData),
      })

      expect(res.status).toBe(400)
      const json = await res.json() as { success: boolean, error: { message: string } }
      expect(json.success).toBe(false)
      expect(json.error.message).toContain('缺少必要字段 / Missing required fields')
    })
  })

  describe('PUT /:id', () => {
    it('should update a post', async () => {
      const mockPost = {
        id: '1',
        title: 'Original Title',
        content: 'Original content',
        author_id: '1',
        category_id: '1',
        view_count: 0,
        like_count: 0,
        comment_count: 0,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }

      mockDb.tables = new Map()
      mockDb.tables.set('posts', [mockPost])

      const updateData = {
        title: 'Updated Title',
        content: 'Updated content',
        categoryId: '1',
      }

      const authHeader = await createAuthHeader('1')
      const csrfHeaders = createCSRFHeaders()
      const res = await app.request('/api/posts/1', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader,
          ...csrfHeaders,
        },
        body: JSON.stringify(updateData),
      })

      expect(res.status).toBe(200)
      const json = await res.json() as { success: boolean, data: { title: string }, message: string }
      expect(json.success).toBe(true)
      expect(json.data.title).toBe('Updated Title')
      expect(json.message).toContain('帖子更新成功')
    })

    it('should return 404 when post does not exist', async () => {
      mockDb.tables = new Map()
      mockDb.tables.set('posts', [])

      const updateData = {
        title: 'Updated Title',
        content: 'Updated content',
        categoryId: '1',
      }

      const authHeader = await createAuthHeader('1')
      const csrfHeaders = createCSRFHeaders()
      const res = await app.request('/api/posts/999', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader,
          ...csrfHeaders,
        },
        body: JSON.stringify(updateData),
      })

      expect(res.status).toBe(404)
      const json = await res.json() as { success: boolean, error: { message: string } }
      expect(json.success).toBe(false)
      expect(json.error.message).toContain('帖子 / Post')
    })

    it('should return 403 when user is not the author', async () => {
      const mockPost = {
        id: '1',
        title: 'Original Title',
        content: 'Original content',
        author_id: '2',
        category_id: '1',
        view_count: 0,
        like_count: 0,
        comment_count: 0,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }

      mockDb.tables = new Map()
      mockDb.tables.set('posts', [mockPost])

      const updateData = {
        title: 'Updated Title',
        content: 'Updated content',
        categoryId: '1',
      }

      const authHeader = await createAuthHeader('1')
      const csrfHeaders = createCSRFHeaders()
      const res = await app.request('/api/posts/1', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader,
          ...csrfHeaders,
        },
        body: JSON.stringify(updateData),
      })

      expect(res.status).toBe(403)
      const json = await res.json() as { success: boolean, error: { message: string } }
      expect(json.success).toBe(false)
      expect(json.error.message).toContain('无权编辑此帖子')
    })
  })

  describe('DELETE /:id', () => {
    it('should delete a post', async () => {
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

      mockDb.tables = new Map()
      mockDb.tables.set('posts', [mockPost])

      const authHeader = await createAuthHeader('1')
      const csrfHeaders = createCSRFHeaders()
      const res = await app.request('/api/posts/1', {
        method: 'DELETE',
        headers: {
          ...authHeader,
          ...csrfHeaders,
        },
      })

      expect(res.status).toBe(200)
      const json = await res.json() as { success: boolean, message: string }
      expect(json.success).toBe(true)
      expect(json.message).toContain('删除成功 / Deleted successfully')
    })

    it('should return 404 when post does not exist', async () => {
      mockDb.tables = new Map()
      mockDb.tables.set('posts', [])

      const authHeader = await createAuthHeader('1')
      const csrfHeaders = createCSRFHeaders()
      const res = await app.request('/api/posts/999', {
        method: 'DELETE',
        headers: {
          ...authHeader,
          ...csrfHeaders,
        },
      })

      expect(res.status).toBe(404)
      const json = await res.json() as { success: boolean, error: { message: string } }
      expect(json.success).toBe(false)
      expect(json.error.message).toContain('帖子 / Post')
    })

    it('should return 403 when user is not the author', async () => {
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

      mockDb.tables = new Map()
      mockDb.tables.set('posts', [mockPost])

      const authHeader = await createAuthHeader('1')
      const csrfHeaders = createCSRFHeaders()
      const res = await app.request('/api/posts/1', {
        method: 'DELETE',
        headers: {
          ...authHeader,
          ...csrfHeaders,
        },
      })

      expect(res.status).toBe(403)
      const json = await res.json() as { success: boolean, error: { message: string } }
      expect(json.success).toBe(false)
      expect(json.error.message).toContain('无权删除此帖子')
    })
  })

  describe('POST /:id/like', () => {
    it('should like a post', async () => {
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
      mockDb.tables.set('posts', [mockPost])
      mockDb.tables.set('users', [mockUser])
      mockDb.tables.set('likes', [])
      mockDb.tables.set('notifications', [])

      const authHeader = await createAuthHeader('1')
      const csrfHeaders = createCSRFHeaders()
      const res = await app.request('/api/posts/1/like', {
        method: 'POST',
        headers: {
          ...authHeader,
          ...csrfHeaders,
        },
      })

      expect(res.status).toBe(200)
      const json = await res.json() as { success: boolean, message: string }
      expect(json.success).toBe(true)
      expect(json.message).toContain('点赞成功 / Liked successfully')
    })

    it('should return 400 when already liked', async () => {
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

      const mockLike = {
        id: '1',
        user_id: '1',
        target_id: '1',
        target_type: 'post',
      }

      mockDb.tables = new Map()
      mockDb.tables.set('posts', [mockPost])
      mockDb.tables.set('likes', [mockLike])

      const authHeader = await createAuthHeader('1')
      const csrfHeaders = createCSRFHeaders()
      const res = await app.request('/api/posts/1/like', {
        method: 'POST',
        headers: {
          ...authHeader,
          ...csrfHeaders,
        },
      })

      expect(res.status).toBe(400)
      const json = await res.json() as { success: boolean, error: { message: string } }
      expect(json.success).toBe(false)
      expect(json.error.message).toContain('已经点赞过 / Already liked')
    })
  })

  describe('DELETE /:id/like', () => {
    it('should unlike a post', async () => {
      const mockLike = {
        id: '1',
        user_id: '1',
        target_id: '1',
        target_type: 'post',
      }

      mockDb.tables = new Map()
      mockDb.tables.set('likes', [mockLike])

      const authHeader = await createAuthHeader('1')
      const csrfHeaders = createCSRFHeaders()
      const res = await app.request('/api/posts/1/like', {
        method: 'DELETE',
        headers: {
          ...authHeader,
          ...csrfHeaders,
        },
      })

      expect(res.status).toBe(200)
      const json = await res.json() as { success: boolean, message: string }
      expect(json.success).toBe(true)
      expect(json.message).toContain('取消点赞成功 / Unliked successfully')
    })
  })

  describe('GET /:id/comments', () => {
    it('should return comments for a post', async () => {
      const mockComments = [
        {
          id: '1',
          post_id: '1',
          author_id: '1',
          content: 'Comment 1',
          parent_id: null,
          like_count: 0,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
        {
          id: '2',
          post_id: '1',
          author_id: '2',
          content: 'Comment 2',
          parent_id: null,
          like_count: 0,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      ]

      const mockAuthors = [
        { id: '1', username: 'user1', avatar: '/avatar1.png' },
        { id: '2', username: 'user2', avatar: '/avatar2.png' },
      ]

      mockDb.tables = new Map()
      mockDb.tables.set('comments', mockComments)
      mockDb.tables.set('users', mockAuthors)

      const res = await app.request('/api/posts/1/comments')

      expect(res.status).toBe(200)
      const json = await res.json() as { success: boolean, data: any[] }
      expect(json.success).toBe(true)
      expect(Array.isArray(json.data)).toBe(true)
      expect(json.data).toHaveLength(2)
    })

    it('should return empty array when no comments exist', async () => {
      mockDb.tables = new Map()
      mockDb.tables.set('comments', [])

      const res = await app.request('/api/posts/1/comments')

      expect(res.status).toBe(200)
      const json = await res.json() as { success: boolean, data: any[] }
      expect(json.success).toBe(true)
      expect(Array.isArray(json.data)).toBe(true)
      expect(json.data).toEqual([])
    })
  })
})