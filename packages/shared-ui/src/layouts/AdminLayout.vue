<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-900">
    <!-- Admin Sidebar -->
    <aside
      :class="[
        'fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      ]"
    >
      <div class="flex flex-col h-full">
        <!-- Logo -->
        <div class="flex items-center justify-center h-16 px-4 border-b border-gray-200 dark:border-gray-700">
          <div class="flex items-center space-x-2">
            <div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span class="text-white font-bold text-sm">Y</span>
            </div>
            <span class="text-xl font-bold text-gray-900 dark:text-white">云纽管理</span>
          </div>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div class="px-3 mb-2">
            <span class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">主要</span>
          </div>

          <router-link
            v-for="item in primaryNav"
            :key="item.path"
            :to="item.path"
            class="flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors"
            :class="[
              isActive(item.path)
                ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            ]"
          >
            <component :is="item.icon" class="flex-shrink-0 w-5 h-5 mr-3" />
            {{ item.name }}
            <span
              v-if="item.badge"
              class="ml-auto px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
            >
              {{ item.badge }}
            </span>
          </router-link>

          <div class="px-3 mt-6 mb-2">
            <span class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">内容</span>
          </div>

          <router-link
            v-for="item in contentNav"
            :key="item.path"
            :to="item.path"
            class="flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors"
            :class="[
              isActive(item.path)
                ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            ]"
          >
            <component :is="item.icon" class="flex-shrink-0 w-5 h-5 mr-3" />
            {{ item.name }}
          </router-link>

          <div class="px-3 mt-6 mb-2">
            <span class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">系统</span>
          </div>

          <router-link
            v-for="item in systemNav"
            :key="item.path"
            :to="item.path"
            class="flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors"
            :class="[
              isActive(item.path)
                ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            ]"
          >
            <component :is="item.icon" class="flex-shrink-0 w-5 h-5 mr-3" />
            {{ item.name }}
          </router-link>
        </nav>

        <!-- User Info -->
        <div class="px-3 py-4 border-t border-gray-200 dark:border-gray-700">
          <div class="flex items-center">
            <img
              v-if="userStore.user?.avatar"
              :src="userStore.user.avatar"
              :alt="userStore.user.username"
              class="w-9 h-9 rounded-full"
            />
            <div v-else class="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span class="text-white font-semibold text-sm">
                {{ userStore.user?.username?.charAt(0).toUpperCase() }}
              </span>
            </div>
            <div class="ml-3">
              <p class="text-sm font-medium text-gray-900 dark:text-white">
                {{ userStore.user?.username }}
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                {{ getRoleLabel(userStore.user?.role) }}
              </p>
            </div>
            <button
              @click="logout"
              class="ml-auto p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              title="退出登录"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <div :class="['transition-all duration-300', sidebarOpen ? 'ml-64' : 'ml-0']">
      <!-- Top Bar -->
      <header class="bg-white dark:bg-gray-800 shadow-sm">
        <div class="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
          <button
            @click="toggleSidebar"
            class="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div class="flex items-center space-x-4">
            <router-link
              to="/"
              class="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              返回首页
            </router-link>
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <main class="p-4 sm:p-6 lg:p-8">
        <router-view />
      </main>
    </div>

    <!-- Overlay for mobile -->
    <div
      v-if="sidebarOpen"
      class="fixed inset-0 z-40 bg-gray-900/50 lg:hidden"
      @click="toggleSidebar"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'

// User store 需要从外部传入
export interface UserStore {
  user: {
    id?: string
    username?: string
    avatar?: string
    role?: string
  } | null
  logout: () => void
}

export interface AdminLayoutProps {
  userStore: UserStore
}

const props = defineProps<AdminLayoutProps>()

const router = useRouter()
const route = useRoute()

const sidebarOpen = ref(true)

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

const logout = () => {
  props.userStore.logout()
  router.push('/login')
}

const isActive = (path: string) => {
  return route.path.startsWith(path)
}

const getRoleLabel = (role?: string) => {
  const labels: Record<string, string> = {
    admin: '管理员',
    moderator: '审核员',
    user: '普通用户',
  }
  return labels[role || 'user'] || '普通用户'
}

// Navigation items
const primaryNav = [
  {
    name: '仪表盘',
    path: '/admin',
    icon: 'ChartBarIcon',
    badge: null,
  },
]

const contentNav = [
  {
    name: '用户管理',
    path: '/admin/users',
    icon: 'UsersIcon',
  },
  {
    name: '帖子管理',
    path: '/admin/posts',
    icon: 'DocumentTextIcon',
  },
  {
    name: '评论管理',
    path: '/admin/comments',
    icon: 'ChatBubbleLeftRightIcon',
  },
]

const systemNav = [
  {
    name: '插件管理',
    path: '/admin/plugins',
    icon: 'PuzzlePieceIcon',
  },
  {
    name: '审计日志',
    path: '/admin/audit-logs',
    icon: 'ClipboardDocumentListIcon',
  },
]
</script>

<script lang="ts">
// Icon components
const ChartBarIcon = {
  template: `
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  `,
}

const UsersIcon = {
  template: `
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  `,
}

const DocumentTextIcon = {
  template: `
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  `,
}

const ChatBubbleLeftRightIcon = {
  template: `
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  `,
}

const ClipboardDocumentListIcon = {
  template: `
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  `,
}

const PuzzlePieceIcon = {
  template: `
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
    </svg>
  `,
}

export default {
  components: {
    ChartBarIcon,
    UsersIcon,
    DocumentTextIcon,
    ChatBubbleLeftRightIcon,
    PuzzlePieceIcon,
    ClipboardDocumentListIcon,
  },
}
</script>