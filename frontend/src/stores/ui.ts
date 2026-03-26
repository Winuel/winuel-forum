/**
 * UI 状态管理 Store
 * UI State Management Store
 * 
 * 管理 UI 相关的状态，包括主题、侧边栏、通知和自定义颜色
 * Manages UI-related states including theme, sidebar, notifications, and custom colors
 * 
 * @package frontend/src/stores
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'

/**
 * 通知接口
 * Notification Interface
 * 
 * 定义通知的数据结构
 * Defines the data structure of a notification
 */
export interface Notification {
  /** 通知 ID / Notification ID */
  id?: string
  /** 通知类型 / Notification type */
  type: 'success' | 'error' | 'warning' | 'info'
  /** 通知标题 / Notification title */
  title: string
  /** 通知消息 / Notification message */
  message: string
  /** 显示时长（毫秒）/ Display duration (milliseconds) */
  duration?: number
}

/**
 * UI Store
 * UI Store
 * 
 * 使用 Pinia 管理 UI 相关状态
 * Uses Pinia to manage UI-related states
 */
export const useUIStore = defineStore('ui', () => {
  // 从 localStorage 读取保存的主题，默认为 'dark' / Load saved theme from localStorage, default is 'dark'
  const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null
  /** 当前主题 / Current theme */
  const theme = ref<'light' | 'dark'>(savedTheme || 'dark')
  /** 侧边栏是否打开 / Whether sidebar is open */
  const sidebarOpen = ref(false)
  /** 通知列表 / Notification list */
  const notifications = ref<Notification[]>([])

  // 自定义主题颜色 / Custom theme colors
  const customColors = ref({
    /** 主色 / Primary color */
    primary: '#0ea5e9',
    /** 次要色 / Secondary color */
    secondary: '#8b5cf6',
    /** 强调色 / Accent color */
    accent: '#d946ef',
    /** 背景色 / Background color */
    background: '#f8fafc'
  })

  // 初始化主题：立即应用到 HTML 元素 / Initialize theme: apply to HTML element immediately
  if (typeof document !== 'undefined') {
    if (theme.value === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    
    // 应用自定义颜色 / Apply custom colors
    updateCSSColors()
  }

  /**
   * 切换主题
   * Toggle Theme
   * 
   * 在亮色和暗色主题之间切换
   * Toggles between light and dark themes
   */
  function toggleTheme() {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
    
    // 更新 HTML 元素的 class / Update HTML element class
    if (typeof document !== 'undefined') {
      if (theme.value === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
    
    // 保存到 localStorage / Save to localStorage
    localStorage.setItem('theme', theme.value)
  }

  /**
   * 切换侧边栏
   * Toggle Sidebar
   * 
   * 切换侧边栏的打开/关闭状态
   * Toggles sidebar open/close state
   */
  function toggleSidebar() {
    sidebarOpen.value = !sidebarOpen.value
  }

  /**
   * 设置侧边栏状态
   * Set Sidebar State
   * 
   * @param open - 是否打开 / Whether to open
   */
  function setSidebarState(open: boolean) {
    sidebarOpen.value = open
  }

  /**
   * 更新自定义颜色
   * Update Custom Colors
   * 
   * @param colors - 颜色配置 / Color configuration
   */
  function updateCustomColors(colors: typeof customColors.value) {
    customColors.value = { ...colors }
    updateCSSColors()
    localStorage.setItem('customColors', JSON.stringify(colors))
  }

  /**
   * 更新 CSS 颜色变量（私有方法）
   * Update CSS Color Variables (Private Method)
   * 
   * 将自定义颜色应用到 CSS 变量
   * Applies custom colors to CSS variables
   */
  function updateCSSColors() {
    if (typeof document === 'undefined') return
    
    const root = document.documentElement
    root.style.setProperty('--primary-color', customColors.value.primary)
    root.style.setProperty('--secondary-color', customColors.value.secondary)
    root.style.setProperty('--accent-color', customColors.value.accent)
    root.style.setProperty('--background-color', customColors.value.background)
  }

  /**
   * 重置自定义颜色
   * Reset Custom Colors
   * 
   * 重置为默认颜色
   * Resets to default colors
   */
  function resetCustomColors() {
    customColors.value = {
      primary: '#0ea5e9',
      secondary: '#8b5cf6',
      accent: '#d946ef',
      background: '#f8fafc'
    }
    updateCSSColors()
    localStorage.removeItem('customColors')
  }

  /**
   * 加载自定义颜色
   * Load Custom Colors
   * 
   * 从 localStorage 加载保存的自定义颜色
   * Loads saved custom colors from localStorage
   */
  function loadCustomColors() {
    const savedColors = localStorage.getItem('customColors')
    if (savedColors) {
      try {
        customColors.value = JSON.parse(savedColors)
        updateCSSColors()
      } catch (error) {
        // 错误处理由错误处理器管理 / Error handling is managed by error handler
      }
    }
  }

  /**
   * 添加通知
   * Add Notification
   * 
   * @param notification - 通知对象 / Notification object
   */
  function addNotification(notification: Notification) {
    notifications.value.push({
      ...notification,
      id: Date.now().toString(),
    })
  }

  /**
   * 移除通知
   * Remove Notification
   * 
   * @param id - 通知 ID / Notification ID
   */
  function removeNotification(id: string) {
    notifications.value = notifications.value.filter(n => n.id !== id)
  }

  /**
   * 清除所有通知
   * Clear All Notifications
   */
  function clearNotifications() {
    notifications.value = []
  }

  // 初始化时加载自定义颜色 / Load custom colors on initialization
  loadCustomColors()

  return {
    theme,
    sidebarOpen,
    notifications,
    customColors,
    toggleTheme,
    toggleSidebar,
    setSidebarState,
    updateCustomColors,
    resetCustomColors,
    addNotification,
    removeNotification,
    clearNotifications,
  }
})