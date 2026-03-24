import { describe, it, expect, beforeEach } from 'vitest'
import { initJWT, generateToken, verifyToken } from '../../utils/jwt'

describe('JWT Utils', () => {
  beforeEach(() => {
    initJWT('A1b2C3d4!E5f6G7h8@I9j0K1l2#M3n4O5p6')
  })

  describe('initJWT', () => {
    it('should initialize JWT with valid secret', () => {
      expect(() => initJWT('A1b2C3d4!E5f6G7h8@I9j0K1l2#M3n4O5p6')).not.toThrow()
    })

    it('should throw error for secret shorter than 32 characters', () => {
      expect(() => initJWT('short')).toThrow('JWT_SECRET must be at least 32 characters long')
    })

    it('should throw error for empty secret', () => {
      expect(() => initJWT('')).toThrow('JWT_SECRET must be at least 32 characters long')
    })
  })

  describe('generateToken', () => {
    it('should generate a token with valid payload', async () => {
      const payload = { userId: '1', username: 'testuser', role: 'user' }
      const token = await generateToken(payload)

      expect(token).toBeDefined()
      expect(typeof token).toBe('string')
      expect(token.length).toBeGreaterThan(0)
    })

    it('should generate same token for same payload within same second', async () => {
      const payload = { userId: '1', username: 'testuser', role: 'user' }
      const token1 = await generateToken(payload)
      const token2 = await generateToken(payload)

      // JWT with same payload should generate same token (within same second due to iat)
      // This is the correct behavior for JWT tokens
      expect(token1).toBe(token2)
    })

    it('should generate token with complex payload', async () => {
      const payload = {
        userId: '1',
        username: 'admin',
        role: 'admin',
      }
      const token = await generateToken(payload)

      expect(token).toBeDefined()
    })
  })

  describe('verifyToken', () => {
    it('should verify a valid token', async () => {
      const payload = { userId: '1', username: 'testuser', role: 'user' }
      const token = await generateToken(payload)
      const decoded = await verifyToken(token)

      expect(decoded).toBeDefined()
      expect(decoded?.userId).toBe('1')
      expect(decoded?.username).toBe('testuser')
      expect(decoded?.role).toBe('user')
    })

    it('should return null for invalid token', async () => {
      const decoded = await verifyToken('invalid.token.string')

      expect(decoded).toBeNull()
    })

    it('should return null for empty token', async () => {
      const decoded = await verifyToken('')

      expect(decoded).toBeNull()
    })

    it('should return null for token with wrong secret', async () => {
      initJWT('Z1y2X3w4!V5u6T7s8@R9q0P1o2#I3u4Y5t6')
      const payload = { userId: '1', username: 'testuser', role: 'user' }
      const token = await generateToken(payload)

      initJWT('A1b2C3d4!E5f6G7h8@I9j0K1l2#M3n4O5p6')
      const decoded = await verifyToken(token)

      expect(decoded).toBeNull()
    })

    it('should verify token with multiple payload fields', async () => {
      const payload = {
        userId: '1',
        username: 'admin',
        role: 'admin',
      }
      const token = await generateToken(payload)
      const decoded = await verifyToken(token)

      expect(decoded).toBeDefined()
      expect(decoded?.userId).toBe('1')
      expect(decoded?.username).toBe('admin')
      expect(decoded?.role).toBe('admin')
    })
  })

  describe('generateToken and verifyToken integration', () => {
    it('should work together correctly', async () => {
      const originalPayload = { userId: '123', username: 'user', role: 'user' }
      const token = await generateToken(originalPayload)
      const decodedPayload = await verifyToken(token)

      expect(decodedPayload).toBeDefined()
      expect(decodedPayload?.userId).toBe(originalPayload.userId)
      expect(decodedPayload?.username).toBe(originalPayload.username)
    })

    it('should preserve payload data through generation and verification', async () => {
      const originalPayload = {
        userId: '456',
        username: 'testuser',
        role: 'user',
      }
      const token = await generateToken(originalPayload)
      const decodedPayload = await verifyToken(token)

      expect(decodedPayload).toMatchObject(originalPayload)
    })
  })
})