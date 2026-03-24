import { describe, it, expect, beforeEach } from 'vitest'
import { Hono } from 'hono'
import categoriesRouter from '../../routes/categories'
import { createMockD1Database } from '../helpers/db'
import { initJWT } from '../../utils/jwt'
import type { Env } from '../../types'

describe('Categories Router', () => {
  let app: Hono<{ Bindings: Env }>
  let mockDb: any

  beforeEach(() => {
    mockDb = createMockD1Database()
    initJWT('A1b2C3d4!E5f6G7h8@I9j0K1l2#M3n4O5p6')

    app = new Hono<{ Bindings: Env }>()

    // Mock the env - must run before route mounting
    app.use('*', async (c, next) => {
      if (!c.env) {
        c.env = {} as Env
      }
      c.env.DB = mockDb
      await next()
    })

    app.route('/api/categories', categoriesRouter)
  })

  describe('GET /', () => {
    it('should return all categories', async () => {
      const mockCategories = [
        {
          id: '1',
          name: '技术讨论',
          description: '讨论各种技术话题',
          created_at: '2024-01-01T00:00:00Z',
        },
        {
          id: '2',
          name: '生活分享',
          description: '分享生活点滴',
          created_at: '2024-01-01T00:00:00Z',
        },
      ]

      mockDb.tables = new Map()
      mockDb.tables.set('categories', mockCategories)

      const res = await app.request('/api/categories')

      expect(res.status).toBe(200)
      const json = await res.json()
      expect(json).toHaveLength(2)
    })

    it('should return empty array when no categories exist', async () => {
      mockDb.tables = new Map()
      mockDb.tables.set('categories', [])

      const res = await app.request('/api/categories')

      expect(res.status).toBe(200)
      const json = await res.json()
      expect(json).toEqual([])
    })
  })

  describe('GET /:id', () => {
    it('should return category by id', async () => {
      const mockCategory = {
        id: '1',
        name: '技术讨论',
        description: '讨论各种技术话题',
        created_at: '2024-01-01T00:00:00Z',
      }

      mockDb.tables = new Map()
      mockDb.tables.set('categories', [mockCategory])

      const res = await app.request('/api/categories/1')

      expect(res.status).toBe(200)
      const json = await res.json() as { id: string; name: string }
      expect(json.id).toBe('1')
      expect(json.name).toBe('技术讨论')
    })

    it('should return 404 for non-existent category', async () => {
      mockDb.tables = new Map()
      mockDb.tables.set('categories', [])

      const res = await app.request('/api/categories/999')

      expect(res.status).toBe(404)
      const json = await res.json() as { error: string }
      expect(json.error).toContain('不存在')
    })
  })
})