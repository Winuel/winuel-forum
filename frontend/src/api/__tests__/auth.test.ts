import { describe, it, expect, beforeEach, vi } from 'vitest'
import { authApi } from '../auth'
import { getAxiosMock, resetAllMocks, mockSuccessResponse, anyValue } from '../../test/helpers'
import type { User } from '../../stores/user'

describe('Auth API', () => {
  beforeEach(() => {
    resetAllMocks()
    vi.clearAllMocks()
  })

  describe('login', () => {
    it('should login successfully', async () => {
      const mockUser: User = {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        role: 'user',
        avatar: '/avatar.png',
        createdAt: '2024-01-01T00:00:00Z',
      }

      const axiosMock = getAxiosMock()
      axiosMock.post.mockResolvedValueOnce(
        mockSuccessResponse({
          user: mockUser,
          token: 'test-token',
        })
      )

      const result = await authApi.login({
        email: 'test@example.com',
        password: 'Password123!',
      })

      expect(result.user).toEqual(mockUser)
      expect(result.token).toBe('test-token')
      expect(axiosMock.post).toHaveBeenCalledWith(
        '/api/auth/login',
        {
          email: 'test@example.com',
          password: 'Password123!',
        },
        anyValue
      )
    })

    it('should send correct request data', async () => {
      const mockUser: User = {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        role: 'user',
        avatar: '/avatar.png',
        createdAt: '2024-01-01T00:00:00Z',
      }

      const axiosMock = getAxiosMock()
      axiosMock.post.mockResolvedValueOnce(
        mockSuccessResponse({
          user: mockUser,
          token: 'test-token',
        })
      )

      await authApi.login({
        email: 'test@example.com',
        password: 'password123',
      })

      expect(axiosMock.post).toHaveBeenCalledWith(
        '/api/auth/login',
        expect.objectContaining({
          email: 'test@example.com',
          password: 'password123',
        }),
        anyValue
      )
    })
  })

  describe('register', () => {
    it('should register successfully', async () => {
      const mockUser: User = {
        id: '1',
        username: 'newuser',
        email: 'newuser@example.com',
        role: 'user',
        avatar: '/avatar.png',
        createdAt: '2024-01-01T00:00:00Z',
      }

      const axiosMock = getAxiosMock()
      axiosMock.post.mockResolvedValueOnce(
        mockSuccessResponse({
          user: mockUser,
          token: 'new-token',
        })
      )

      const result = await authApi.register({
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'password123',
      })

      expect(result.user).toEqual(mockUser)
      expect(result.token).toBe('new-token')
      expect(axiosMock.post).toHaveBeenCalledWith('/api/auth/register', {
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'password123',
      }, anyValue)
    })

    it('should send correct request data', async () => {
      const mockUser: User = {
        id: '1',
        username: 'newuser',
        email: 'newuser@example.com',
        role: 'user',
        avatar: '/avatar.png',
        createdAt: '2024-01-01T00:00:00Z',
      }

      const axiosMock = getAxiosMock()
      axiosMock.post.mockResolvedValueOnce(
        mockSuccessResponse({
          user: mockUser,
          token: 'new-token',
        })
      )

      await authApi.register({
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'password123',
      })

      expect(axiosMock.post).toHaveBeenCalledWith(
        '/api/auth/register',
        expect.objectContaining({
          username: 'newuser',
          email: 'newuser@example.com',
          password: 'password123',
        }),
        anyValue
      )
    })
  })

  describe('getCurrentUser', () => {
    it('should get current user successfully', async () => {
      const mockUser: User = {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        role: 'user',
        avatar: '/avatar.png',
        createdAt: '2024-01-01T00:00:00Z',
      }

      const axiosMock = getAxiosMock()
      axiosMock.get.mockResolvedValueOnce(
        mockSuccessResponse(mockUser)
      )

      const result = await authApi.getCurrentUser()

      expect(result).toEqual(mockUser)
      expect(axiosMock.get).toHaveBeenCalledWith('/api/auth/me', anyValue)
    })
  })

  describe('logout', () => {
    it('should logout successfully', async () => {
      const axiosMock = getAxiosMock()
      axiosMock.post.mockResolvedValueOnce(
        mockSuccessResponse(null)
      )

      await authApi.logout()

      expect(axiosMock.post).toHaveBeenCalledWith('/api/auth/logout', {}, anyValue)
    })
  })
})