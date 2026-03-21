import { apiClient } from './client'

export interface Notification {
  id: string
  user_id: string
  type: string
  title: string
  message: string
  link?: string
  is_read: boolean
  created_at: string
}

export interface NotificationsResponse {
  notifications: Notification[]
  total: number
  unread_count: number
}

export interface UnreadCountResponse {
  unread_count: number
}

export const notificationsApi = {
  async getNotifications(page = 1, limit = 20, unreadOnly = false): Promise<NotificationsResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    })

    if (unreadOnly) {
      params.append('unreadOnly', 'true')
    }

    return apiClient.get<NotificationsResponse>(`/api/notifications?${params}`)
  },

  async getUnreadCount(): Promise<UnreadCountResponse> {
    return apiClient.get<UnreadCountResponse>('/api/notifications/unread-count')
  },

  async markAsRead(id: string): Promise<Notification> {
    return apiClient.patch<Notification>(`/api/notifications/${id}/read`)
  },

  async markAllAsRead(): Promise<{ message: string }> {
    return apiClient.patch<{ message: string }>('/api/notifications/read-all')
  },

  async deleteNotification(id: string): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(`/api/notifications/${id}`)
  },

  async deleteAllNotifications(): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>('/api/notifications')
  },
}