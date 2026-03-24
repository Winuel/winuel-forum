<template>
  <header class="glass-strong sticky top-0 z-50 border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm backdrop-blur-xl">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      <div class="flex items-center gap-4">
        <button
          class="p-2 rounded-xl hover:bg-gray-100/80 dark:hover:bg-gray-700/50 transition-all duration-300 lg:hidden hover:scale-110 active:scale-95"
          @click="uiStore.toggleSidebar"
          aria-label="Toggle sidebar"
        >
          <svg
            class="w-6 h-6 text-gray-600 dark:text-gray-400 transition-colors"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
        <router-link
          to="/"
          class="flex items-center gap-3 group"
        >
          <div class="relative w-10 h-10 bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/30 group-hover:shadow-xl group-hover:shadow-primary-500/50 transition-all duration-400 group-hover:scale-110 group-hover:rotate-3">
            <div class="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-xl"></div>
            <svg
              class="w-6 h-6 text-white relative z-10"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <span class="text-2xl font-display font-bold text-gradient-simple group-hover:animate-pulse-slow">云纽</span>
        </router-link>
      </div>

      <div class="flex items-center gap-2 sm:gap-3">
        <button
          class="p-2.5 rounded-xl hover:bg-gray-100/80 dark:hover:bg-gray-700/50 transition-all duration-300 group hover:scale-110 active:scale-95"
          title="切换主题"
          @click="uiStore.toggleTheme"
          aria-label="Toggle theme"
        >
          <svg
            v-if="uiStore.theme === 'dark'"
            class="w-5 h-5 text-yellow-400 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
          <svg
            v-else
            class="w-5 h-5 text-primary-600 dark:text-primary-400 group-hover:scale-110 group-hover:-rotate-12 transition-all duration-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
            />
          </svg>
        </button>

        <template v-if="!userStore.isAuthenticated">
          <router-link
            to="/login"
            class="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-gray-700/50 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95"
          >
            登录
          </router-link>
          <router-link
            to="/register"
            class="btn-primary hidden sm:inline-flex"
          >
            注册
          </router-link>
        </template>

        <template v-else>
          <router-link
            to="/post/create"
            class="btn-primary hidden sm:inline-flex"
          >
            <svg
              class="w-4 h-4 mr-1.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 4v16m8-8H4"
              />
            </svg>
            发帖
          </router-link>

          <div class="relative">
            <button
              class="p-2.5 rounded-xl hover:bg-gray-100/80 dark:hover:bg-gray-700/50 transition-all duration-300 relative hover:scale-110 active:scale-95"
              title="通知"
              @click="toggleNotifications"
              aria-label="Notifications"
            >
              <svg
                class="w-5 h-5 text-gray-600 dark:text-gray-400 transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              <span
                v-if="unreadCount > 0"
                class="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 text-xs font-bold text-white bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg shadow-red-500/30 animate-pulse-slow"
              >
                {{ unreadCount > 9 ? '9+' : unreadCount }}
              </span>
            </button>
            <NotificationPanel
              v-if="isNotificationsOpen"
              :is-open="isNotificationsOpen"
              @close="isNotificationsOpen = false"
              ref="notificationPanelRef"
            />
          </div>

          <div class="relative group">
            <button class="flex items-center gap-2 p-1.5 pr-3 rounded-xl hover:bg-gray-100/80 dark:hover:bg-gray-700/50 transition-all duration-300 hover:scale-105 active:scale-95" aria-label="User menu">
              <div class="relative">
                <img
                  :src="userStore.user?.avatar || '/default-avatar.png'"
                  :alt="userStore.user?.username"
                  class="w-9 h-9 rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-600 ring-offset-2 ring-offset-white dark:ring-offset-gray-800 transition-all duration-300 group-hover:ring-primary-400 dark:group-hover:ring-primary-500"
                >
                <div class="absolute bottom-0 right-0 w-3 h-3 bg-gradient-to-br from-green-400 to-green-500 border-2 border-white dark:border-gray-800 rounded-full shadow-sm"></div>
              </div>
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:block">
                {{ userStore.user?.username }}
              </span>
              <svg
                class="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-all duration-300 group-hover:rotate-180"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            <div class="absolute right-0 mt-2 w-56 glass-strong rounded-xl shadow-xl shadow-gray-200/50 dark:shadow-gray-900/50 border border-gray-200/50 dark:border-gray-700/50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top-right group-hover:translate-y-0 translate-y-2">
              <div class="p-2 space-y-1">
                <router-link
                  :to="`/user/${userStore.user?.username}`"
                  class="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-primary-50 hover:to-primary-100 dark:hover:from-primary-900/20 dark:hover:to-primary-800/20 rounded-lg transition-all duration-200 hover:scale-105 hover:translate-x-1"
                >
                  <svg
                    class="w-5 h-5 text-gray-500 dark:text-gray-400 transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  个人资料
                </router-link>
                <router-link
                  to="/settings"
                  class="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-primary-50 hover:to-primary-100 dark:hover:from-primary-900/20 dark:hover:to-primary-800/20 rounded-lg transition-all duration-200 hover:scale-105 hover:translate-x-1"
                >
                  <svg
                    class="w-5 h-5 text-gray-500 dark:text-gray-400 transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  设置
                </router-link>
                <div class="h-px bg-gray-200 dark:bg-gray-600 my-1"></div>
                <button
                  class="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 hover:scale-105 hover:translate-x-1"
                  @click="handleLogout"
                >
                  <svg
                    class="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  退出登录
                </button>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useUserStore } from '../stores/user'
import { useUIStore } from '../stores/ui'
import { useRouter } from 'vue-router'
import NotificationPanel from './NotificationPanel.vue'

const userStore = useUserStore()
const uiStore = useUIStore()
const router = useRouter()

const isNotificationsOpen = ref(false)
const unreadCount = ref(0)
let notificationInterval: number | null = null

function handleLogout() {
  userStore.logout()
  router.push('/')
}

function toggleNotifications() {
  isNotificationsOpen.value = !isNotificationsOpen.value
}

async function loadUnreadCount() {
  if (!userStore.isAuthenticated) return

  try {
    const { notificationsApi } = await import('../api/notifications')
    const response = await notificationsApi.getUnreadCount()
    unreadCount.value = response.unread_count
  } catch (error) {
    // Error handling is managed by the error handler
  }
}

function startPolling() {
  loadUnreadCount()
  notificationInterval = window.setInterval(() => {
    loadUnreadCount()
  }, 30000)
}

function stopPolling() {
  if (notificationInterval) {
    clearInterval(notificationInterval)
    notificationInterval = null
  }
}

onMounted(() => {
  if (userStore.isAuthenticated) {
    startPolling()
  }
})

onUnmounted(() => {
  stopPolling()
})

watch(() => userStore.isAuthenticated, (isAuthenticated) => {
  if (isAuthenticated) {
    startPolling()
  } else {
    stopPolling()
    unreadCount.value = 0
  }
})
</script>