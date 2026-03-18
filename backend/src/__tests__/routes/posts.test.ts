import { describe, it, expect, beforeEach } from 'vitest'
import { Hono } from 'hono'
import postsRouter from '../../routes/posts'
import { createMockD1Database } from '../helpers/db'
import { initJWT, generateToken } from '../../utils/jwt'

describe('Posts Router', () => {
  let app: Hono
  let mockDb: any

  beforeEach(() => {
    mockDb = createMockD1Database()
    initJWT('test-secret-key-32-characters-long-key')

    app = new Hono()
    app.use('*', async (c, next) => {
      if (!c.env) {
        c.env = {}
      }
      c.env.DB = mockDb
      c.env.JWT_SECRET = 'test-secret-key-32-characters-long-key'
      // Mock KV storage
      c.env.KV = {
        get: async (key: string) => null,
        put: async (key: string, value: string, options?: any) => {},
      }
      await next()
    })
    app.route('/api/posts', postsRouter)
  })

  const createAuthHeader = async (userId: string, username: string = 'testuser', role: string = 'user') => {
    const token = await generateToken({ userId, username, role })
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
      const json = await res.json()
      expect(json.posts).toHaveLength(2)
    })

    it('should return empty array when no posts exist', async () => {
      mockDb.tables = new Map()
      mockDb.tables.set('posts', [])

      const res = await app.request('/api/posts')

      expect(res.status).toBe(200)
      const json = await res.json()
      expect(json.posts).toEqual([])
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
      const json = await res.json()
      expect(json.posts).toHaveLength(1)
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
      const json = await res.json()
      expect(json.posts).toHaveLength(1)
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
      const json = await res.json()
      expect(json.id).toBe('1')
      expect(json.title).toBe('Test Post')
    })

    it('should return 404 for non-existent post', async () => {
      mockDb.tables = new Map()
      mockDb.tables.set('posts', [])

      const res = await app.request('/api/posts/999')

      expect(res.status).toBe(404)
      const json = await res.json()
      expect(json.error).toContain('不存在')
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
      const res = await app.request('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader,
        },
        body: JSON.stringify(postData),
      })

      expect(res.status).toBe(200)
      const json = await res.json()
      expect(json.title).toBe('New Post')
    })

    it('should return 400 when missing required fields', async () => {
      const postData = {
        title: 'New Post',
      }

      const authHeader = await createAuthHeader('1')
      const res = await app.request('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader,
        },
        body: JSON.stringify(postData),
      })

      expect(res.status).toBe(400)
      const json = await res.json()
      expect(json.error).toContain('缺少必要字段')
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
      const res = await app.request('/api/posts/1', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader,
        },
        body: JSON.stringify(updateData),
      })

      expect(res.status).toBe(200)
      const json = await res.json()
      expect(json.title).toBe('Updated Title')
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
      const res = await app.request('/api/posts/999', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader,
        },
        body: JSON.stringify(updateData),
      })

      expect(res.status).toBe(404)
      const json = await res.json()
      expect(json.error).toContain('不存在')
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
      const res = await app.request('/api/posts/1', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader,
        },
        body: JSON.stringify(updateData),
      })

      expect(res.status).toBe(403)
      const json = await res.json()
      expect(json.error).toContain('无权编辑')
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
      const res = await app.request('/api/posts/1', {
        method: 'DELETE',
        headers: authHeader,
      })

      expect(res.status).toBe(200)
      const json = await res.json()
      expect(json.message).toBe('删除成功')
    })

    it('should return 404 when post does not exist', async () => {
      mockDb.tables = new Map()
      mockDb.tables.set('posts', [])

      const authHeader = await createAuthHeader('1')
      const res = await app.request('/api/posts/999', {
        method: 'DELETE',
        headers: authHeader,
      })

      expect(res.status).toBe(404)
      const json = await res.json()
      expect(json.error).toContain('不存在')
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
      const res = await app.request('/api/posts/1', {
        method: 'DELETE',
        headers: authHeader,
      })

      expect(res.status).toBe(403)
      const json = await res.json()
      expect(json.error).toContain('无权删除')
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
      const res = await app.request('/api/posts/1/like', {
        method: 'POST',
        headers: authHeader,
      })

      expect(res.status).toBe(200)
      const json = await res.json()
      expect(json.message).toBe('点赞成功')
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
      const res = await app.request('/api/posts/1/like', {
        method: 'POST',
        headers: authHeader,
      })

      expect(res.status).toBe(400)
      const json = await res.json()
      expect(json.error).toContain('已经点赞过')
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
      const res = await app.request('/api/posts/1/like', {
        method: 'DELETE',
        headers: authHeader,
      })

      expect(res.status).toBe(200)
      const json = await res.json()
      expect(json.message).toBe('取消点赞成功')
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
      const json = await res.json()
      expect(json).toHaveLength(2)
    })

    it('should return empty array when no comments exist', async () => {
      mockDb.tables = new Map()
      mockDb.tables.set('comments', [])

      const res = await app.request('/api/posts/1/comments')

      expect(res.status).toBe(200)
      const json = await res.json()
      expect(json).toEqual([])
    })
  })
})