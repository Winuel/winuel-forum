import { describe, it, expect, beforeEach, vi } from 'vitest'
import { UserService } from '../../services/userService'
import { createMockD1Database } from '../helpers/db'
import { initJWT } from '../../utils/jwt'
import { hashPassword } from '../../utils/crypto'

describe('UserService', () => {
  let mockDb: any
  let userService: UserService

  beforeEach(() => {
    mockDb = createMockD1Database()
    initJWT('A1b2C3d4!E5f6G7h8@I9j0K1l2#M3n4O5p6')
    userService = new UserService(mockDb)
  })

  describe('create', () => {
    it('should create a new user', async () => {
      // Clear any existing data
      mockDb.tables = new Map()
      mockDb.tables.set('users', [])

      const result = await userService.create({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      })

      expect(result.user).toBeDefined()
      expect(result.user.username).toBe('testuser')
      expect(result.user.email).toBe('test@example.com')
      expect(result.token).toBeDefined()
    })

    it('should throw error if email already exists', async () => {
      const mockUser = {
        id: '1',
        username: 'existinguser',
        email: 'test@example.com',
        password_hash: 'hashed_password',
        role: 'user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      mockDb.tables = new Map()
      mockDb.tables.set('users', [mockUser])

      await expect(
        userService.create({
          username: 'newuser',
          email: 'test@example.com',
          password: 'password123',
        })
      ).rejects.toThrow('邮箱已被注册')
    })
  })

  describe('login', () => {
    it('should login with valid credentials', async () => {
      const password_hash = await hashPassword('password123')
      const mockUser = {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        password_hash,
        role: 'user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      mockDb.tables = new Map()
      mockDb.tables.set('users', [mockUser])

      const result = await userService.login({
        email: 'test@example.com',
        password: 'password123',
      })

      expect(result.user).toBeDefined()
      expect(result.user.email).toBe('test@example.com')
      expect(result.token).toBeDefined()
    })

    it('should throw error with invalid email', async () => {
      mockDb.tables = new Map()
      mockDb.tables.set('users', [])

      await expect(
        userService.login({
          email: 'nonexistent@example.com',
          password: 'password123',
        })
      ).rejects.toThrow('未授权访问')
    })

    it('should throw error with invalid password', async () => {
      const password_hash = await hashPassword('password123')
      const mockUser = {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        password_hash,
        role: 'user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      mockDb.tables = new Map()
      mockDb.tables.set('users', [mockUser])

      await expect(
        userService.login({
          email: 'test@example.com',
          password: 'wrongpassword',
        })
      ).rejects.toThrow('未授权访问')
    })
  })

  describe('findById', () => {
    it('should find user by id', async () => {
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

      const user = await userService.findById('1')

      expect(user).toBeDefined()
      expect(user?.id).toBe('1')
      expect(user?.username).toBe('testuser')
    })

    it('should return null for non-existent user', async () => {
      mockDb.tables = new Map()
      mockDb.tables.set('users', [])

      const user = await userService.findById('999')

      expect(user).toBeNull()
    })
  })

  describe('findByUsername', () => {
    it('should find user by username', async () => {
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

      const user = await userService.findByUsername('testuser')

      expect(user).toBeDefined()
      expect(user?.username).toBe('testuser')
    })
  })

  describe('findByEmail', () => {
    it('should find user by email', async () => {
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

      const user = await userService.findByEmail('test@example.com')

      expect(user).toBeDefined()
      expect(user?.email).toBe('test@example.com')
    })
  })

  describe('getPublicUser', () => {
    it('should return user without password hash', async () => {
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

      const publicUser = await userService.getPublicUser('1')

      expect(publicUser).toBeDefined()
      expect(publicUser?.username).toBe('testuser')
    })

    it('should return null for non-existent user', async () => {
      mockDb.tables = new Map()
      mockDb.tables.set('users', [])

      const publicUser = await userService.getPublicUser('999')

      expect(publicUser).toBeNull()
    })
  })
})