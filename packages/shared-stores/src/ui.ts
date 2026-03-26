/**
 * Winuel 共享 UI 状态管理
 * 提供 Pinia store 用于 UI 状态管理
 */

import { defineStore } from 'pinia'

export interface UIState {
  sidebarOpen: boolean
  theme: 'light' | 'dark' | 'auto'
  notificationsOpen: boolean
  loading: boolean
  currentRoute: string
}

export const useUIStore = defineStore('ui', {
  state: (): UIState => ({
    sidebarOpen: true,
    theme: 'auto',
    notificationsOpen: false,
    loading: false,
    currentRoute: '/',
  }),

  getters: {
    isDarkMode: (state): boolean => {
      if (state.theme === 'auto') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches
      }
      return state.theme === 'dark'
    },
  },

  actions: {
    toggleSidebar(): void {
      this.sidebarOpen = !this.sidebarOpen
    },

    setSidebarOpen(open: boolean): void {
      this.sidebarOpen = open
    },

    setTheme(theme: 'light' | 'dark' | 'auto'): void {
      this.theme = theme
      // 保存到 localStorage
      localStorage.setItem('theme', theme)
      // 应用主题
      this.applyTheme()
    },

    applyTheme(): void {
      if (this.isDarkMode) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    },

    toggleNotifications(): void {
      this.notificationsOpen = !this.notificationsOpen
    },

    setNotificationsOpen(open: boolean): void {
      this.notificationsOpen = open
    },

    setLoading(loading: boolean): void {
      this.loading = loading
    },

    setCurrentRoute(route: string): void {
      this.currentRoute = route
    },

    initialize(): void {
      // 从 localStorage 恢复主题
      const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'auto'
      if (savedTheme) {
        this.theme = savedTheme
      }
      this.applyTheme()
    },
  },
})