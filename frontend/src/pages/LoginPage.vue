<template>
  <div class="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-grid">
    <div class="w-full max-w-md">
      <div class="card-base p-8 sm:p-10 relative overflow-hidden">
        <div class="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-primary-400/10 to-secondary-400/10 rounded-full blur-3xl animate-float"></div>
        <div class="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-accent-400/10 to-primary-400/10 rounded-full blur-3xl animate-float" style="animation-delay: 1s;"></div>

        <div class="relative">
          <div class="text-center mb-8">
            <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-600 rounded-2xl shadow-xl shadow-primary-500/30 mb-4 hover:scale-110 hover:rotate-6 transition-all duration-400 group">
              <div class="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl"></div>
              <svg class="w-8 h-8 text-white relative z-10 group-hover:animate-pulse-slow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 class="text-3xl font-display font-bold text-gradient-simple mb-2">
              欢迎回来
            </h1>
            <p class="text-sm text-gray-500 dark:text-gray-400 font-medium">
              登录您的云纽账户
            </p>
          </div>

          <form @submit.prevent="handleSubmit" class="space-y-5">
            <div>
              <label for="email" class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                邮箱地址
              </label>
              <input
                id="email"
                v-model="email"
                type="email"
                required
                class="input-base transition-all duration-300 hover:border-primary-300 dark:hover:border-primary-500"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label for="password" class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                密码
              </label>
              <input
                id="password"
                v-model="password"
                type="password"
                required
                class="input-base transition-all duration-300 hover:border-primary-300 dark:hover:border-primary-500"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              :disabled="loading"
              class="w-full btn-primary text-base py-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-lg disabled:hover:-translate-y-0.5 disabled:active:scale-100 flex items-center justify-center gap-2"
            >
              <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ loading ? '登录中...' : '登录' }}
            </button>
          </form>

          <p class="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            还没有账号？
            <router-link to="/register" class="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-bold transition-colors hover:underline underline-offset-4">
              立即注册
            </router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '../stores/user'
import { useUIStore } from '../stores/ui'
import { apiClient } from '../api/client'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const uiStore = useUIStore()

const email = ref('')
const password = ref('')
const loading = ref(false)

async function handleSubmit() {
  loading.value = true
  try {
    const data = await apiClient.post('/api/auth/login', {
      email: email.value,
      password: password.value,
    }) as any
    userStore.setUser(data.user)
    userStore.setToken(data.token)
    uiStore.addNotification({
      type: 'success',
      title: '登录成功',
      message: `欢迎回来，${data.user.username}！`,
    })
    router.push((route.query.redirect as string) || '/')
  } catch (error: any) {
    uiStore.addNotification({
      type: 'error',
      title: '登录失败',
      message: error?.message || '请检查邮箱和密码',
    })
  } finally {
    loading.value = false
  }
}
</script>