<template>
  <div class="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-grid">
    <div class="w-full max-w-md">
      <div class="card-base p-8 sm:p-10 relative overflow-hidden">
        <div class="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-secondary-400/10 to-accent-400/10 rounded-full blur-3xl animate-float" />
        <div class="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-primary-400/10 to-secondary-400/10 rounded-full blur-3xl animate-float" style="animation-delay: 1s;" />

        <div class="relative">
          <div class="text-center mb-8">
            <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-600 rounded-2xl shadow-xl shadow-primary-500/30 mb-4 hover:scale-110 hover:rotate-6 transition-all duration-400 group">
              <div class="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl"></div>
              <svg
                class="w-8 h-8 text-white relative z-10 group-hover:animate-pulse-slow"
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
            <h1 class="text-3xl font-display font-bold text-gradient-simple mb-2">
              创建账户
            </h1>
            <p class="text-sm text-gray-500 dark:text-gray-400 font-medium">
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
                class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2"
              >
                用户名
              </label>
              <input
                id="username"
                v-model="username"
                type="text"
                required
                minlength="3"
                maxlength="20"
                pattern="[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaffa-zA-Z0-9_-]+"
                class="input-base transition-all duration-300 hover:border-primary-300 dark:hover:border-primary-500"
                placeholder="3-20个字符，支持中文"
              >
              <p class="mt-1 text-xs text-gray-500 dark:text-gray-400 font-medium">
                支持中文、字母、数字、下划线和连字符
              </p>
            </div>

            <div>
              <label
                for="email"
                class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2"
              >
                邮箱地址
              </label>
              <input
                id="email"
                v-model="email"
                type="email"
                required
                class="input-base transition-all duration-300 hover:border-primary-300 dark:hover:border-primary-500"
                placeholder="your@email.com"
              >
            </div>

            <div>
              <label
                for="password"
                class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2"
              >
                密码
              </label>
              <input
                id="password"
                v-model="password"
                type="password"
                required
                minlength="8"
                class="input-base transition-all duration-300 hover:border-primary-300 dark:hover:border-primary-500"
                placeholder="至少 8 个字符，仅字母和数字"
              >
            </div>

            <button
              type="submit"
              :disabled="loading"
              class="w-full btn-primary text-base py-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-lg disabled:hover:-translate-y-0.5 disabled:active:scale-100 flex items-center justify-center gap-2"
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
              class="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-bold transition-colors hover:underline underline-offset-4"
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

function validateUsername(value: string): string | null {
  // 检查用户名长度
  if (value.length < 3) {
    return '用户名至少为3个字符'
  }
  if (value.length > 20) {
    return '用户名不能超过20个字符'
  }

  // 检查用户名格式（允许中文、字母、数字、下划线和连字符）
  // 使用更广泛的中文 Unicode 范围
  if (!/^[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaffa-zA-Z0-9_-]+$/.test(value)) {
    return '用户名只能包含中文、字母、数字、下划线和连字符'
  }

  return null
}

async function handleSubmit() {
  // 客户端验证
  const usernameError = validateUsername(username.value)
  if (usernameError) {
    uiStore.addNotification({
      type: 'error',
      title: '用户名格式错误',
      message: usernameError,
    })
    return
  }

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
        message: error.error?.details || error.error?.message || '注册失败，请稍后重试',
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