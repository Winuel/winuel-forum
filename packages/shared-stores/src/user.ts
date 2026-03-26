/**
 * Winuel 共享用户状态管理
 * 提供 Pinia store 用于用户状态管理
 */

import { defineStore } from 'pinia'
import type { User, UserRole } from '@winuel/shared-core'

export interface UserState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
  }),

  getters: {
    username: (state): string => state.user?.username || '',
    userId: (state): string => state.user?.id || '',
    userRole: (state): UserRole => state.user?.role || 'user',
    userAvatar: (state): string | undefined => state.user?.avatar,
    isAdmin: (state): boolean => state.user?.role === 'admin',
    isModerator: (state): boolean => state.user?.role === 'moderator' || state.user?.role === 'admin',
  },

  actions: {
    setUser(user: User): void {
      this.user = user
      this.isAuthenticated = true
    },

    clearUser(): void {
      this.user = null
      this.isAuthenticated = false
    },

    setLoading(loading: boolean): void {
      this.isLoading = loading
    },

    updateProfile(updates: Partial<User>): void {
      if (this.user) {
        this.user = { ...this.user, ...updates }
      }
    },
  },
})