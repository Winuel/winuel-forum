import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUIStore = defineStore('ui', () => {
  // 从 localStorage 读取保存的主题，默认为 'dark'
  const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null
  const theme = ref<'light' | 'dark'>(savedTheme || 'dark')
  const sidebarOpen = ref(true)
  const notifications = ref<Notification[]>([])

  // 自定义主题颜色
  const customColors = ref({
    primary: '#0ea5e9',
    secondary: '#8b5cf6',
    accent: '#d946ef',
    background: '#f8fafc'
  })

  // 初始化主题：立即应用到 HTML 元素
  if (typeof document !== 'undefined') {
    if (theme.value === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    
    // 应用自定义颜色
    updateCSSColors()
  }

  function toggleTheme() {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
    
    // 更新 HTML 元素的 class
    if (typeof document !== 'undefined') {
      if (theme.value === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
    
    // 保存到 localStorage
    localStorage.setItem('theme', theme.value)
  }

  function toggleSidebar() {
    sidebarOpen.value = !sidebarOpen.value
  }

  function setSidebarState(open: boolean) {
    sidebarOpen.value = open
  }

  function updateCustomColors(colors: typeof customColors.value) {
    customColors.value = { ...colors }
    updateCSSColors()
    localStorage.setItem('customColors', JSON.stringify(colors))
  }

  function updateCSSColors() {
    if (typeof document === 'undefined') return
    
    const root = document.documentElement
    root.style.setProperty('--primary-color', customColors.value.primary)
    root.style.setProperty('--secondary-color', customColors.value.secondary)
    root.style.setProperty('--accent-color', customColors.value.accent)
    root.style.setProperty('--background-color', customColors.value.background)
  }

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

  function loadCustomColors() {
    const savedColors = localStorage.getItem('customColors')
    if (savedColors) {
      try {
        customColors.value = JSON.parse(savedColors)
        updateCSSColors()
      } catch (error) {
        console.error('Failed to load custom colors:', error)
      }
    }
  }

  function addNotification(notification: Notification) {
    notifications.value.push({
      ...notification,
      id: Date.now().toString(),
    })
  }

  function removeNotification(id: string) {
    notifications.value = notifications.value.filter(n => n.id !== id)
  }

  function clearNotifications() {
    notifications.value = []
  }

  // 初始化时加载自定义颜色
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

interface Notification {
  id?: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  duration?: number
}