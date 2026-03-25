import { describe, it, expect, beforeEach, vi } from 'vitest'
import { notificationsApi } from '../notifications'
import { getAxiosMock, resetAllMocks, mockSuccessResponse, anyValue } from '../../test/helpers'
import type { Notification } from '../notifications'

describe('Notifications API', () => {
  beforeEach(() => {
    resetAllMocks()
    vi.clearAllMocks()
  })

  describe('getNotifications', () => {
    it('should fetch notifications successfully', async () => {
      const mockNotifications: Notification[] = [
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
      ]

      const axiosMock = getAxiosMock()
      axiosMock.get.mockResolvedValueOnce(
        mockSuccessResponse({
          notifications: mockNotifications,
          total: 1,
          unread_count: 1,
        })
      )

      const result = await notificationsApi.getNotifications(1, 20, false)

      expect(result.notifications).toEqual(mockNotifications)
      expect(result.total).toBe(1)
      expect(result.unread_count).toBe(1)
      expect(axiosMock.get).toHaveBeenCalledWith(
        '/api/notifications?page=1&limit=20',
        anyValue
      )
    })

    it('should fetch unread notifications only', async () => {
      const axiosMock = getAxiosMock()
      axiosMock.get.mockResolvedValueOnce(
        mockSuccessResponse({
          notifications: [],
          total: 0,
          unread_count: 0,
        })
      )

      await notificationsApi.getNotifications(1, 20, true)

      expect(axiosMock.get).toHaveBeenCalledWith(
        '/api/notifications?page=1&limit=20&unreadOnly=true',
        anyValue
      )
    })
  })

  describe('getUnreadCount', () => {
    it('should fetch unread count successfully', async () => {
      const axiosMock = getAxiosMock()
      axiosMock.get.mockResolvedValueOnce(
        mockSuccessResponse({
          count: 5,
        })
      )

      const result = await notificationsApi.getUnreadCount()

      expect(result).toEqual({ count: 5 })
      expect(axiosMock.get).toHaveBeenCalledWith('/api/notifications/unread-count', anyValue)
    })
  })

  describe('markAsRead', () => {
    it('should mark notification as read successfully', async () => {
      const axiosMock = getAxiosMock()
      axiosMock.patch.mockResolvedValueOnce(
        mockSuccessResponse(null)
      )

      await notificationsApi.markAsRead('notification-1')

      expect(axiosMock.patch).toHaveBeenCalledWith('/api/notifications/notification-1/read', undefined, undefined)
    })
  })

  describe('markAllAsRead', () => {
    it('should mark all notifications as read successfully', async () => {
      const axiosMock = getAxiosMock()
      axiosMock.patch.mockResolvedValueOnce(
        mockSuccessResponse(null)
      )

      await notificationsApi.markAllAsRead()

      expect(axiosMock.patch).toHaveBeenCalledWith('/api/notifications/read-all', undefined, undefined)
    })
  })

  describe('deleteNotification', () => {
    it('should delete notification successfully', async () => {
      const axiosMock = getAxiosMock()
      axiosMock.delete.mockResolvedValueOnce(
        mockSuccessResponse(null)
      )

      await notificationsApi.deleteNotification('notification-1')

      expect(axiosMock.delete).toHaveBeenCalledWith('/api/notifications/notification-1', anyValue)
    })
  })

  describe('deleteAllNotifications', () => {
    it('should delete all notifications successfully', async () => {
      const axiosMock = getAxiosMock()
      axiosMock.delete.mockResolvedValueOnce(
        mockSuccessResponse(null)
      )

      await notificationsApi.deleteAllNotifications()

      expect(axiosMock.delete).toHaveBeenCalledWith('/api/notifications', anyValue)
    })
  })
})