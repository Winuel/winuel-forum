<template>
  <div class="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
    <div class="w-full max-w-md">
      <div class="card-base p-8 sm:p-10 relative overflow-hidden">
        <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-secondary-400/20 to-accent-400/20 rounded-full blur-3xl" />
        <div class="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-primary-400/20 to-secondary-400/20 rounded-full blur-3xl" />

        <div class="relative">
          <div class="text-center mb-8">
            <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl shadow-lg shadow-primary-500/25 mb-4">
              <svg
                class="w-8 h-8 text-white"
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
            <h1 class="text-3xl font-display font-bold text-gradient mb-2">
              创建账户
            </h1>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              加入云纽社区，开始分享
            </p>
          </div>

          <form
            class="space-y-5"
            @submit.prevent="handleSubmit"
          >
            <div>
              <label
                for="username"
                class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
              >
                用户名
              </label>
              <input
                id="username"
                v-model="username"
                type="text"
                required
                minlength="3"
                class="input-base"
                placeholder="请输入用户名"
              >
            </div>

            <div>
              <label
                for="email"
                class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
              >
                邮箱地址
              </label>
              <input
                id="email"
                v-model="email"
                type="email"
                required
                class="input-base"
                placeholder="your@email.com"
              >
            </div>

            <div>
              <label
                for="password"
                class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
              >
                密码
              </label>
              <input
                id="password"
                v-model="password"
                type="password"
                required
                minlength="8"
                class="input-base"
                placeholder="至少 8 个字符"
              >
            </div>

            <button
              type="submit"
              :disabled="loading"
              class="w-full btn-primary text-base py-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-lg"
            >
              <svg
                v-if="loading"
                class="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                />
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              {{ loading ? '注册中...' : '注册' }}
            </button>
          </form>

          <p class="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            已有账号？
            <router-link
              to="/login"
              class="text-primary-500 hover:text-primary-600 font-semibold transition-colors"
            >
              立即登录
            </router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { useUIStore } from '../stores/ui'

const router = useRouter()
const userStore = useUserStore()
const uiStore = useUIStore()

const username = ref('')
const email = ref('')
const password = ref('')
const loading = ref(false)

async function handleSubmit() {
  loading.value = true
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8787'}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: username.value,
        email: email.value,
        password: password.value,
      }),
    })

    if (response.ok) {
      const data = await response.json()
      userStore.setUser(data.user)
      userStore.setToken(data.token)
      uiStore.addNotification({
        type: 'success',
        title: '注册成功',
        message: `欢迎加入云纽，${data.user.username}！`,
      })
      router.push('/')
    } else {
      const error = await response.json()
      uiStore.addNotification({
        type: 'error',
        title: '注册失败',
        message: error.message || '注册失败，请稍后重试',
      })
    }
  } catch {
    uiStore.addNotification({
      type: 'error',
      title: '注册失败',
      message: '网络错误，请稍后重试',
    })
  } finally {
    loading.value = false
  }
}
</script>