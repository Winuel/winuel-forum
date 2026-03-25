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

          <!-- 分隔线 -->
          <div class="relative my-6">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-200 dark:border-gray-700"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">或</span>
            </div>
          </div>

          <!-- GitHub OAuth登录按钮 -->
          <button
            type="button"
            @click="handleGitHubLogin"
            :disabled="githubLoading"
            class="w-full bg-gray-900 dark:bg-gray-800 hover:bg-gray-800 dark:hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-lg flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-lg"
          >
            <svg v-if="githubLoading" class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <svg v-else class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd"/>
            </svg>
            <span>{{ githubLoading ? '登录中...' : '使用 GitHub 登录' }}</span>
          </button>

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
import { ref, onMounted } from 'vue'
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
const githubLoading = ref(false)

// 检查是否从OAuth回调返回
onMounted(() => {
  const code = route.query.code as string
  const state = route.query.state as string

  if (code && state) {
    handleOAuthCallback(code, state)
  }
})

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

async function handleGitHubLogin() {
  githubLoading.value = true
  try {
    // 获取GitHub OAuth授权URL
    const data = await apiClient.get('/api/auth/github/authorize') as any
    if (data.success && data.data.authUrl) {
      // 重定向到GitHub授权页面
      window.location.href = data.data.authUrl
    } else {
      throw new Error('获取授权URL失败')
    }
  } catch (error: any) {
    uiStore.addNotification({
      type: 'error',
      title: 'OAuth登录失败',
      message: error?.message || '无法启动GitHub登录',
    })
  } finally {
    githubLoading.value = false
  }
}

async function handleOAuthCallback(code: string, state: string) {
  githubLoading.value = true
  try {
    const data = await apiClient.get('/api/auth/github/callback', {
      params: {
        code,
        state
      }
    }) as any

    if (data.success) {
      userStore.setUser(data.data.user)
      userStore.setToken(data.data.token)

      const message = data.data.isNewUser
        ? `欢迎加入云纽，${data.data.user.username}！`
        : `欢迎回来，${data.data.user.username}！`

      uiStore.addNotification({
        type: 'success',
        title: '登录成功',
        message: message,
      })

      // 清除URL中的OAuth参数
      router.replace((route.query.redirect as string) || '/')
    } else {
      throw new Error(data.error?.message || 'OAuth登录失败')
    }
  } catch (error: any) {
    uiStore.addNotification({
      type: 'error',
      title: 'OAuth登录失败',
      message: error?.message || 'GitHub登录过程中发生错误',
    })
    // 重定向回登录页
    router.replace('/login')
  } finally {
    githubLoading.value = false
  }
}
</script>