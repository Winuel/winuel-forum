<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <!-- 个人资料设置 -->
    <div class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 lg:p-8">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-bold text-gray-900 dark:text-white">
          个人资料
        </h2>
        <button
          class="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg"
        >
          保存更改
        </button>
      </div>
      
      <div class="flex items-start gap-6">
        <div class="relative group">
          <img
            :src="userStore.user?.avatar || '/default-avatar.png'"
            :alt="userStore.user?.username"
            loading="lazy"
            class="w-24 h-24 rounded-2xl object-cover ring-4 ring-gray-200 dark:ring-gray-600 ring-offset-2 ring-offset-white dark:ring-offset-gray-800 transition-all duration-300 group-hover:ring-primary-400"
          >
          <div class="absolute bottom-0 right-0 w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 transition-transform duration-300">
            <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 4H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
          </div>
        </div>
        <div class="flex-1 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">用户名</label>
            <input
              type="text"
              :value="userStore.user?.username"
              class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
              placeholder="用户名"
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">个人简介</label>
            <textarea
              class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300 resize-none"
              rows="3"
              placeholder="介绍一下你自己..."
            ></textarea>
          </div>
        </div>
      </div>
    </div>

    <!-- 主题设置 -->
    <div class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 lg:p-8">
      <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-6">
        主题设置
      </h2>
      
      <!-- 预设主题 -->
      <div class="mb-8">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">预设主题</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            v-for="theme in presetThemes"
            :key="theme.id"
            @click="applyPresetTheme(theme)"
            class="relative p-4 rounded-xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-lg"
            :class="[
              currentTheme.id === theme.id ? 'border-primary-500 shadow-lg shadow-primary-500/20' : 'border-gray-200 dark:border-gray-700'
            ]"
          >
            <div class="space-y-2">
              <div class="flex items-center gap-2">
                <span class="text-2xl">{{ theme.icon }}</span>
                <span class="text-sm font-medium text-gray-900 dark:text-white">{{ theme.name }}</span>
              </div>
              <div class="flex gap-1">
                <div
                  v-for="(color, index) in theme.colors"
                  :key="index"
                  class="w-6 h-6 rounded-full border-2 border-white dark:border-gray-800"
                  :style="{ backgroundColor: color }"
                ></div>
              </div>
            </div>
            <div
              v-if="currentTheme.id === theme.id"
              class="absolute top-2 right-2 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center"
            >
              <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
            </div>
          </button>
        </div>
      </div>

      <!-- 自定义主题 -->
      <div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">自定义主题</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">主色调</label>
            <div class="flex items-center gap-3">
              <input
                type="color"
                v-model="customTheme.primary"
                class="w-12 h-12 rounded-lg cursor-pointer border-2 border-gray-300 dark:border-gray-600"
              >
              <input
                type="text"
                v-model="customTheme.primary"
                class="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="#0ea5e9"
              >
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">次要色调</label>
            <div class="flex items-center gap-3">
              <input
                type="color"
                v-model="customTheme.secondary"
                class="w-12 h-12 rounded-lg cursor-pointer border-2 border-gray-300 dark:border-gray-600"
              >
              <input
                type="text"
                v-model="customTheme.secondary"
                class="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="#8b5cf6"
              >
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">强调色</label>
            <div class="flex items-center gap-3">
              <input
                type="color"
                v-model="customTheme.accent"
                class="w-12 h-12 rounded-lg cursor-pointer border-2 border-gray-300 dark:border-gray-600"
              >
              <input
                type="text"
                v-model="customTheme.accent"
                class="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="#d946ef"
              >
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">背景色</label>
            <div class="flex items-center gap-3">
              <input
                type="color"
                v-model="customTheme.background"
                class="w-12 h-12 rounded-lg cursor-pointer border-2 border-gray-300 dark:border-gray-600"
              >
              <input
                type="text"
                v-model="customTheme.background"
                class="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="#f8fafc"
              >
            </div>
          </div>
        </div>
        
        <div class="mt-6 flex gap-4">
          <button
            @click="applyCustomTheme"
            class="px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg"
          >
            应用自定义主题
          </button>
          <button
            @click="resetTheme"
            class="px-6 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-all duration-300 hover:scale-105"
          >
            重置主题
          </button>
        </div>
      </div>
    </div>

    <!-- 界面设置 -->
    <div class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 lg:p-8">
      <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-6">
        界面设置
      </h2>
      
      <div class="space-y-6">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-1">侧边栏</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">控制侧边栏的显示状态</p>
          </div>
          <button
            @click="uiStore.toggleSidebar"
            class="relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
            :class="uiStore.sidebarOpen ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'"
          >
            <span
              class="inline-block h-6 w-6 rounded-full bg-white shadow-lg transition-transform duration-300"
              :class="uiStore.sidebarOpen ? 'translate-x-3' : 'translate-x-0.5'"
            ></span>
          </button>
        </div>
        
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-1">小部件</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">显示右侧小部件区域</p>
          </div>
          <button
            class="relative inline-flex h-8 w-14 items-center rounded-full bg-primary-500 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <span class="inline-block h-6 w-6 rounded-full bg-white shadow-lg transition-transform duration-300 translate-x-3"></span>
          </button>
        </div>
      </div>
    </div>

    <!-- 账号信息 -->
    <div class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 lg:p-8">
      <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-6">
        账号信息
      </h2>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">用户名</label>
          <input
            :value="userStore.user?.username"
            disabled
            class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white cursor-not-allowed"
          >
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">邮箱</label>
          <input
            :value="userStore.user?.email"
            disabled
            class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white cursor-not-allowed"
          >
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">角色</label>
          <input
            :value="userStore.user?.role"
            disabled
            class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white cursor-not-allowed"
          >
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">注册时间</label>
          <input
            :value="userStore.user?.createdAt"
            disabled
            class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white cursor-not-allowed"
          >
        </div>
      </div>
    </div>

    <!-- 主题预览 -->
    <div v-if="themePreview.show" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 max-w-md w-full mx-4">
        <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">主题预览</h3>
        <div class="space-y-4" :style="{ backgroundColor: themePreview.colors.background }">
          <div class="p-4 rounded-xl" :style="{ backgroundColor: themePreview.colors.primary }">
            <p class="text-white font-medium">主色调示例</p>
          </div>
          <div class="p-4 rounded-xl" :style="{ backgroundColor: themePreview.colors.secondary }">
            <p class="text-white font-medium">次要色调示例</p>
          </div>
          <div class="p-4 rounded-xl" :style="{ backgroundColor: themePreview.colors.accent }">
            <p class="text-white font-medium">强调色示例</p>
          </div>
        </div>
        <button
          @click="themePreview.show = false"
          class="mt-6 w-full px-4 py-2 text-white bg-primary-500 hover:bg-primary-600 rounded-xl transition-colors"
        >
          关闭预览
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useUserStore } from '../stores/user'
import { useUIStore } from '../stores/ui'
import type { AppError } from '../types/error'
import { getErrorMessage } from '../types/error'

const userStore = useUserStore()
const uiStore = useUIStore()

// 预设主题
const presetThemes = ref([
  {
    id: 'default',
    name: '默认主题',
    icon: '🎨',
    colors: {
      primary: '#0ea5e9',
      secondary: '#8b5cf6',
      accent: '#d946ef',
      background: '#f8fafc'
    },
    isDark: false
  },
  {
    id: 'ocean',
    name: '海洋',
    icon: '🌊',
    colors: {
      primary: '#0284c7',
      secondary: '#06b6d4',
      accent: '#14b8a6',
      background: '#f0fdfa'
    },
    isDark: false
  },
  {
    id: 'forest',
    name: '森林',
    icon: '🌲',
    colors: {
      primary: '#059669',
      secondary: '#10b981',
      accent: '#22c55e',
      background: '#ecfdf5'
    },
    isDark: false
  },
  {
    id: 'sunset',
    name: '日落',
    icon: '🌅',
    colors: {
      primary: '#ea580c',
      secondary: '#f97316',
      accent: '#f59e0b',
      background: '#fffbeb'
    },
    isDark: false
  },
  {
    id: 'dark-default',
    name: '深色',
    icon: '🌙',
    colors: {
      primary: '#0ea5e9',
      secondary: '#8b5cf6',
      accent: '#d946ef',
      background: '#1e293b'
    },
    isDark: true
  },
  {
    id: 'midnight',
    name: '午夜',
    icon: '🌃',
    colors: {
      primary: '#1e3a8a',
      secondary: '#4338ca',
      accent: '#6366f1',
      background: '#0f172a'
    },
    isDark: true
  },
  {
    id: 'rose',
    name: '玫瑰',
    icon: '🌹',
    colors: {
      primary: '#e11d48',
      secondary: '#f43f5e',
      accent: '#fb7185',
      background: '#fff1f2'
    },
    isDark: false
  },
  {
    id: 'amber',
    name: '琥珀',
    icon: '🔶',
    colors: {
      primary: '#d97706',
      secondary: '#f59e0b',
      accent: '#fbbf24',
      background: '#fffbeb'
    },
    isDark: false
  }
])

// 当前主题
const currentTheme = ref(presetThemes.value[0])

// 自定义主题
const customTheme = reactive({
  primary: '#0ea5e9',
  secondary: '#8b5cf6',
  accent: '#d946ef',
  background: '#f8fafc'
})

// 主题预览
const themePreview = reactive({
  show: false,
  colors: {
    primary: '',
    secondary: '',
    accent: '',
    background: ''
  }
})

// 应用预设主题
function applyPresetTheme(theme: typeof presetThemes.value[0]) {
  currentTheme.value = theme
  
  // 应用主题到 UI store
  if (theme.isDark) {
    uiStore.theme = 'dark'
  } else {
    uiStore.theme = 'light'
  }
  
  // 保存主题设置
  localStorage.setItem('selectedTheme', JSON.stringify(theme))
  
  // 更新 CSS 变量
  updateThemeColors(theme.colors)
  
  // 显示预览
  showThemePreview(theme)
}

// 应用自定义主题
function applyCustomTheme() {
  const customPreset = {
    id: 'custom',
    name: '自定义',
    icon: '🎯',
    colors: { ...customTheme },
    isDark: uiStore.theme === 'dark'
  }
  
  currentTheme.value = customPreset
  
  // 保存主题设置
  localStorage.setItem('selectedTheme', JSON.stringify(customPreset))
  
  // 更新 CSS 变量
  updateThemeColors(customTheme)
  
  // 显示预览
  showThemePreview(customPreset)
}

// 重置主题
function resetTheme() {
  const defaultTheme = presetThemes.value[0]
  applyPresetTheme(defaultTheme)
  
  // 重置自定义主题颜色
  customTheme.primary = '#0ea5e9'
  customTheme.secondary = '#8b5cf6'
  customTheme.accent = '#d946ef'
  customTheme.background = '#f8fafc'
}

// 更新主题颜色
function updateThemeColors(colors: {
  primary: string
  secondary: string
  accent: string
  background: string
}) {
  const root = document.documentElement
  root.style.setProperty('--primary-color', colors.primary)
  root.style.setProperty('--secondary-color', colors.secondary)
  root.style.setProperty('--accent-color', colors.accent)
  root.style.setProperty('--background-color', colors.background)
}

// 显示主题预览
function showThemePreview(theme: typeof presetThemes.value[0]) {
  themePreview.colors = { ...theme.colors }
  themePreview.show = true
  
  // 3秒后自动关闭预览
  setTimeout(() => {
    themePreview.show = false
  }, 3000)
}

// 加载保存的主题
function loadSavedTheme() {
  const savedTheme = localStorage.getItem('selectedTheme')
  if (savedTheme) {
    try {
      const theme = JSON.parse(savedTheme)
      currentTheme.value = theme
      updateThemeColors(theme.colors)
      
      if (theme.isDark) {
        uiStore.theme = 'dark'
      } else {
        uiStore.theme = 'light'
      }
    } catch (error: AppError) {
      // Error handling is managed by the error handler
      console.error(getErrorMessage(error))
    }
  }
}

// 初始化加载主题
loadSavedTheme()
</script>