import { describe, it, expect, beforeEach, vi } from 'vitest'
import { Hono } from 'hono'
import authRouter from '../../routes/auth'
import { createMockD1Database } from '../helpers/db'
import { initJWT } from '../../utils/jwt'
import { strictAuthRateLimit } from '../../middleware/rateLimit'
import { authMiddleware } from '../../middleware/auth'
import { hashPassword } from '../../utils/crypto'
import { initEmailChecker } from '../../utils/validation'
import { setupMockEmailService } from '../helpers/emailServiceMock'
import { csrfStore, createCSRFHeaders } from '../helpers/test-utils'
import type { Env, Variables } from '../../types'

describe('Auth Router', () => {
  let app: Hono<{ Bindings: Env; Variables: Variables }>
  let mockDb: any
  let testPasswordHash: string

  beforeEach(async () => {
    mockDb = createMockD1Database()
    initJWT('A1b2C3d4!E5f6G7h8@I9j0K1l2#M3n4O5p6')
    testPasswordHash = await hashPassword('MySecurePass456!')
    // Initialize disposable email checker with test blocklist
    initEmailChecker(['tempmail.com'], [])
    setupMockEmailService()
    // Clear CSRF store before each test
    csrfStore.clear()

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
          if (options?.metadata) {
            csrfStore.put(key, value)
          }
        },
      } as KVNamespace
      await next()
    })
    app.route('/api/auth', authRouter)
  })

  describe('POST /register', () => {
    it('should register a new user with valid data', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'MySecurePass456!',
        verificationCode: '123456',
      }

      const res = await app.request('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      })

      expect(res.status).toBe(200)
      const json = await res.json() as { user: any; token: string }
      expect(json.user).toBeDefined()
      expect(json.user.username).toBe('testuser')
      expect(json.user.email).toBe('test@example.com')
      expect(json.token).toBeDefined()
    })

    it('should return 400 when missing fields', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
      }

      const res = await app.request('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      })

      expect(res.status).toBe(400)
      const json = await res.json() as { success: boolean; error: { code: string; message: string } }
      expect(json.error.message).toContain('缺少必要字段')
      expect(json.error.code).toBe('MISSING_FIELD')
    })

    it('should return 400 for invalid username', async () => {
      const userData = {
        username: 'a',
        email: 'test@example.com',
        password: 'MySecurePass456!',
        verificationCode: '123456',
      }

      const res = await app.request('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      })

      expect(res.status).toBe(400)
      const json = await res.json() as { success: boolean; error: { code: string; message: string } }
      expect(json.error.message).toContain('验证失败')
      expect(json.error.code).toBe('VALIDATION_ERROR')
    })

    it('should return 400 for invalid email', async () => {
      const userData = {
        username: 'testuser',
        email: 'invalid-email',
        password: 'MySecurePass456!',
        verificationCode: '123456',
      }

      const res = await app.request('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      })

      expect(res.status).toBe(400)
      const json = await res.json() as { success: boolean; error: { code: string; message: string } }
      expect(json.error.message).toContain('验证失败')
      expect(json.error.code).toBe('VALIDATION_ERROR')
    })

    it('should return 400 for invalid password', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'weak',
        verificationCode: '123456',
      }

      const res = await app.request('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      })

      expect(res.status).toBe(400)
      const json = await res.json() as { success: boolean; error: { code: string; message: string } }
      expect(json.error.message).toContain('验证失败')
      expect(json.error.code).toBe('VALIDATION_ERROR')
    })

    it('should return 400 for disposable email', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@tempmail.com',
        password: 'MySecurePass456!',
        verificationCode: '123456',
      }

      const res = await app.request('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      })

      expect(res.status).toBe(400)
      const json = await res.json() as { success: boolean; error: { code: string; message: string } }
      expect(json.error.message).toContain('验证失败')
      expect(json.error.code).toBe('VALIDATION_ERROR')
    })

    it('should return 409 when email already exists', async () => {
      const existingUser = {
        id: '1',
        username: 'existinguser',
        email: 'test@example.com',
        password_hash: 'hashed_password',
        role: 'user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      mockDb.tables = new Map()
      mockDb.tables.set('users', [existingUser])

      const userData = {
        username: 'newuser',
        email: 'test@example.com',
        password: 'MySecurePass456!',
        verificationCode: '123456',
      }

      const res = await app.request('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      })

      expect(res.status).toBe(409)
      const json = await res.json() as { success: boolean; error: { code: string; message: string } }
      expect(json.error.message).toContain('资源已存在')
      expect(json.error.code).toBe('ALREADY_EXISTS')
    })
  })

  describe('POST /login', () => {
    it('should login with valid credentials', async () => {
      const mockUser = {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        password_hash: testPasswordHash,
        role: 'user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      mockDb.tables = new Map()
      mockDb.tables.set('users', [mockUser])

      const loginData = {
        email: 'test@example.com',
        password: 'MySecurePass456!',
      }

      const res = await app.request('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
      })

      expect(res.status).toBe(200)
      const json = await res.json() as { user: any; token: string }
      expect(json.user).toBeDefined()
      expect(json.user.email).toBe('test@example.com')
      expect(json.token).toBeDefined()
    })

    it('should return 400 when missing fields', async () => {
      const loginData = {
        email: 'test@example.com',
      }

      const res = await app.request('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
      })

      expect(res.status).toBe(400)
      const json = await res.json() as { success: boolean; error: { code: string; message: string } }
      expect(json.error.message).toContain('缺少必要字段')
      expect(json.error.code).toBe('MISSING_FIELD')
    })

    it('should return 401 for invalid email', async () => {
      mockDb.tables = new Map()
      mockDb.tables.set('users', [])

      const loginData = {
        email: 'nonexistent@example.com',
        password: 'MySecurePass456!',
      }

      const res = await app.request('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
      })

      expect(res.status).toBe(401)
      const json = await res.json() as { success: boolean; error: { code: string; message: string } }
      expect(json.error.code).toBe('UNAUTHORIZED')
    })

    it('should return 401 for invalid password', async () => {
      const mockUser = {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        password_hash: testPasswordHash,
        role: 'user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      mockDb.tables = new Map()
      mockDb.tables.set('users', [mockUser])

      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword',
      }

      const res = await app.request('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
      })

      expect(res.status).toBe(401)
      const json = await res.json() as { success: boolean; error: { code: string; message: string } }
      expect(json.error.code).toBe('UNAUTHORIZED')
    })
  })

  describe('GET /me', () => {
    it('should return current user data when authenticated', async () => {
      const mockUser = {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        password_hash: 'hashed_password',
        role: 'user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      mockDb.tables = new Map()
      mockDb.tables.set('users', [mockUser])

      const appWithAuth = new Hono<{ Bindings: Env; Variables: Variables }>()
      appWithAuth.use('*', async (c, next) => {
        if (!c.env) {
          c.env = {} as Env
        }
        c.env.DB = mockDb
        c.env.JWT_SECRET = 'test-secret-key-32-characters-long-key'
        await next()
      })
      appWithAuth.route('/api/auth', authRouter)

      const token = await import('../../utils/jwt').then(m => m.generateToken({ userId: '1', username: 'testuser', role: 'user' }))

      const res = await appWithAuth.request('/api/auth/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      expect(res.status).toBe(200)
      const json = await res.json() as { username: string }
      expect(json.username).toBe('testuser')
    })

    it('should return 401 when not authenticated', async () => {
      const res = await app.request('/api/auth/me', {
        method: 'GET',
      })

      expect(res.status).toBe(401)
    })
  })

  describe('POST /logout', () => {
    it('should logout successfully when authenticated', async () => {
      const appWithAuth = new Hono<{ Bindings: Env; Variables: Variables }>()
      appWithAuth.use('*', async (c, next) => {
        if (!c.env) {
          c.env = {} as Env
        }
        c.env.DB = mockDb
        c.env.JWT_SECRET = 'test-secret-key-32-characters-long-key'
        // Mock KV storage with CSRF support
        c.env.KV = {
          get: async (key: string) => csrfStore.get(key) || null,
          put: async (key: string, value: string, options?: any) => {
            if (options?.metadata) {
              csrfStore.put(key, value)
            }
          },
        } as KVNamespace
        await next()
      })
      appWithAuth.route('/api/auth', authRouter)

      const token = await import('../../utils/jwt').then(m => m.generateToken({ userId: '1', username: 'testuser', role: 'user' }))
      const csrfHeaders = createCSRFHeaders('test-logout-session')

      const res = await appWithAuth.request('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          ...csrfHeaders,
        },
      })

      expect(res.status).toBe(200)
      const json = await res.json() as { message: string }
      expect(json.message).toBe('退出成功')
    })

    it('should return 401 when not authenticated', async () => {
      const res = await app.request('/api/auth/logout', {
        method: 'POST',
      })

      expect(res.status).toBe(401)
    })
  })
})