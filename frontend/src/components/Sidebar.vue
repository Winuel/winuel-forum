<template>
  <aside 
    class="card-base p-5 transition-all duration-300 ease-in-out"
    :class="[
      'fixed inset-y-0 left-0 z-50',
      'lg:static lg:z-0',
      'transform transition-transform duration-300 ease-in-out',
      'bg-white dark:bg-gray-800',
      'shadow-2xl lg:shadow-none',
      'w-72',
      isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
    ]"
  >
    <!-- 移动端关闭按钮 -->
    <div class="flex items-center justify-between mb-6 lg:hidden">
      <div class="flex items-center gap-3">
        <div class="relative w-8 h-8 bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-600 rounded-lg flex items-center justify-center">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
          </svg>
        </div>
        <span class="text-lg font-display font-semibold text-gradient-simple">云纽</span>
      </div>
      <button 
        @click="closeSidebar"
        class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        aria-label="关闭侧边栏"
      >
        <svg class="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
    </div>

    <!-- 导航菜单 -->
    <nav class="space-y-1">
      <router-link
        to="/"
        @click="handleLinkClick"
        class="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-primary-50 hover:to-primary-100 dark:hover:from-primary-900/20 dark:hover:to-primary-800/20 hover:text-primary-600 dark:hover:text-primary-400 rounded-xl transition-all duration-300 group hover:shadow-lg hover:shadow-primary-500/10 hover:scale-105 hover:-translate-x-1"
        :class="{ 'bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 text-primary-600 dark:text-primary-400': isActiveRoute('/') }"
      >
        <svg
          class="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-primary-500 dark:group-hover:text-primary-400 transition-all duration-300 group-hover:scale-110"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
        <span class="group-hover:translate-x-1 transition-transform duration-300">首页</span>
      </router-link>
      
      <router-link
        v-for="category in categories"
        :key="category.id"
        :to="`/category/${category.id}`"
        @click="handleLinkClick"
        class="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-primary-50 hover:to-primary-100 dark:hover:from-primary-900/20 dark:hover:to-primary-800/20 hover:text-primary-600 dark:hover:text-primary-400 rounded-xl transition-all duration-300 group hover:shadow-lg hover:shadow-primary-500/10 hover:scale-105 hover:-translate-x-1"
        :class="{ 'bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 text-primary-600 dark:text-primary-400': isActiveRoute(`/category/${category.id}`) }"
      >
        <svg
          class="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-primary-500 dark:group-hover:text-primary-400 transition-all duration-300 group-hover:scale-110"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
          />
        </svg>
        <span class="group-hover:translate-x-1 transition-transform duration-300">{{ category.name }}</span>
      </router-link>
    </nav>

    <!-- 热门标签 -->
    <div class="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
      <h3 class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
        热门标签
      </h3>
      <div class="flex flex-wrap gap-2">
        <span
          v-for="tag in popularTags"
          :key="tag"
          class="inline-flex items-center px-3 py-1.5 text-xs font-bold text-secondary-700 dark:text-secondary-300 bg-gradient-to-r from-secondary-50 to-secondary-100 dark:from-secondary-900/30 dark:to-secondary-800/30 rounded-full border border-secondary-200 dark:border-secondary-700/50 hover:border-secondary-300 dark:hover:border-secondary-600 transition-all duration-300 cursor-pointer hover:scale-110 hover:shadow-lg hover:shadow-secondary-500/20 hover:-translate-y-0.5"
        >
          #{{ tag }}
        </span>
      </div>
    </div>

    <!-- 快速操作 -->
    <div class="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
      <h3 class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
        快速操作
      </h3>
      <div class="space-y-2">
        <router-link
          v-if="userStore.isAuthenticated"
          to="/post/create"
          @click="handleLinkClick"
          class="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-primary-50 hover:to-primary-100 dark:hover:from-primary-900/20 dark:hover:to-primary-800/20 rounded-lg transition-all duration-300 group hover:scale-105"
        >
          <svg class="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          <span>创建帖子</span>
        </router-link>
        <router-link
          v-if="userStore.isAuthenticated"
          to="/settings"
          @click="handleLinkClick"
          class="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-primary-50 hover:to-primary-100 dark:hover:from-primary-900/20 dark:hover:to-primary-800/20 rounded-lg transition-all duration-300 group hover:scale-105"
        >
          <svg class="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
          <span>设置</span>
        </router-link>
      </div>
    </div>
  </aside>

  <!-- 移动端遮罩层 -->
  <div
    v-if="isMobileOpen"
    @click="closeSidebar"
    class="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity duration-300"
  ></div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useUIStore } from '../stores/ui'
import { useUserStore } from '../stores/user'

const uiStore = useUIStore()
const userStore = useUserStore()
const route = useRoute()

const categories = ref([
  { id: '1', name: '技术讨论' },
  { id: '2', name: '生活分享' },
  { id: '3', name: '问答专区' },
  { id: '4', name: '资源分享' },
])

const popularTags = ref(['Vue', 'React', 'TypeScript', 'Cloudflare', '前端开发', '后端开发'])

const isMobileOpen = computed(() => {
  return uiStore.sidebarOpen && window.innerWidth < 1024
})

function closeSidebar() {
  if (window.innerWidth < 1024) {
    uiStore.sidebarOpen = false
  }
}

function handleLinkClick() {
  closeSidebar()
}

function isActiveRoute(path: string): boolean {
  return route.path === path || route.path.startsWith(path + '/')
}

// 监听窗口大小变化，确保侧边栏状态正确
watch(() => window.innerWidth, (width) => {
  if (width >= 1024) {
    uiStore.sidebarOpen = true
  }
}, { immediate: true })
</script>