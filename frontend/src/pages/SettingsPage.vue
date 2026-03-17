<template>
  <div class="max-w-2xl mx-auto">
    <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        设置
      </h1>

      <div class="space-y-6">
        <div>
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            个人资料
          </h2>
          <div class="flex items-center gap-4 mb-4">
            <img
              :src="userStore.user?.avatar || '/default-avatar.png'"
              :alt="userStore.user?.username"
              class="w-20 h-20 rounded-full object-cover"
            >
            <button
              class="px-4 py-2 text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 rounded-lg transition-colors"
            >
              更换头像
            </button>
          </div>
        </div>

        <div class="pt-6 border-t border-gray-200 dark:border-gray-700">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            主题设置
          </h2>
          <div class="flex gap-4">
            <button
              :class="[
                'flex-1 p-4 rounded-lg border-2 transition-colors',
                uiStore.theme === 'light'
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-200 dark:border-gray-700'
              ]"
              @click="uiStore.theme = 'light'"
            >
              <div class="text-2xl mb-2">
                ☀️
              </div>
              <div class="text-sm font-medium text-gray-900 dark:text-white">
                浅色
              </div>
            </button>
            <button
              :class="[
                'flex-1 p-4 rounded-lg border-2 transition-colors',
                uiStore.theme === 'dark'
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-200 dark:border-gray-700'
              ]"
              @click="uiStore.theme = 'dark'"
            >
              <div class="text-2xl mb-2">
                🌙
              </div>
              <div class="text-sm font-medium text-gray-900 dark:text-white">
                深色
              </div>
            </button>
          </div>
        </div>

        <div class="pt-6 border-t border-gray-200 dark:border-gray-700">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            账号信息
          </h2>
          <div class="space-y-3">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">用户名</label>
              <input
                :value="userStore.user?.username"
                disabled
                class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white cursor-not-allowed"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">邮箱</label>
              <input
                :value="userStore.user?.email"
                disabled
                class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white cursor-not-allowed"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">角色</label>
              <input
                :value="userStore.user?.role"
                disabled
                class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white cursor-not-allowed"
              >
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '../stores/user'
import { useUIStore } from '../stores/ui'

const userStore = useUserStore()
const uiStore = useUIStore()
</script>