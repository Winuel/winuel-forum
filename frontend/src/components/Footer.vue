<template>
  <footer class="glass-strong border-t border-gray-200/50 dark:border-gray-700/50 mt-16 backdrop-blur-xl">
    <!-- 主要内容区域 -->
    <div class="container mx-auto px-4 py-12">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
        <!-- 品牌信息 -->
        <div class="lg:col-span-2">
          <div class="flex items-center gap-3 group mb-6">
            <div class="relative w-10 h-10 bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/30 group-hover:shadow-xl group-hover:shadow-primary-500/50 transition-all duration-400 group-hover:scale-110">
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
            <div class="flex flex-col">
              <span class="text-xl font-display font-semibold text-gradient-simple">云纽论坛</span>
              <span class="text-xs text-gray-500 dark:text-gray-400">Lemon Studio</span>
            </div>
          </div>
          
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
            由柠檬叶工作室倾力打造的专业技术交流平台。我们致力于为全球开发者提供优质的技术分享、学习交流和创新孵化环境。云纽论坛，连接每一个技术梦想。
          </p>
          
          <!-- 联系信息 -->
          <div class="space-y-3 mb-6">
            <div class="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
              <svg class="w-5 h-5 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <a href="mailto:lemonhub@163.com" class="hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-300">
                lemonhub@163.com
              </a>
            </div>
            <div class="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
              <svg class="w-5 h-5 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>中国 · 北京</span>
            </div>
            <div class="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
              <svg class="w-5 h-5 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>柠檬叶工作室</span>
            </div>
          </div>
          
          <!-- 社交媒体链接 -->
          <div class="flex items-center gap-3">
            <a
              href="https://github.com/LemonStudio-hub/yunniu"
              target="_blank"
              rel="noopener noreferrer"
              class="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-primary-500 hover:text-white dark:hover:bg-primary-600 transition-all duration-300 hover:scale-110 shadow-md hover:shadow-lg"
              aria-label="GitHub"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-1.425-3.795-1.425-.51-1.29-1.23-1.635-1.23-1.635-1.005-.69.075-.675.075-.675 1.11.075 1.695 1.14 1.695 1.14 1.23 2.13 3.225 1.515 4.02 1.155.12-.87.48-1.62.87-2.175-3.015-.33-6.195-1.53-6.195-6.81 0-1.5.54-2.745 1.44-3.72-.15-.36-.645-1.815.135-3.795 0 0 1.17-.375 3.84 1.455 1.11-.315 2.31-.465 3.495-.465 1.185 0 2.385.15 3.495.465 2.67-1.83 3.84-1.455 3.84-1.455.78 1.98.285 3.435.135 3.795.9.975 1.44 2.22 1.44 3.72 0 5.295-3.195 6.48-6.24 6.795.48.42.9 1.17.9 2.37 0 1.705-.015 3.075-.015 3.495 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
            </a>
            <a
              href="https://github.com/LemonStudio-hub"
              target="_blank"
              rel="noopener noreferrer"
              class="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-secondary-500 hover:text-white dark:hover:bg-secondary-600 transition-all duration-300 hover:scale-110 shadow-md hover:shadow-lg"
              aria-label="工作室主页"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </a>
            <a
              href="mailto:lemonhub@163.com"
              class="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-accent-500 hover:text-white dark:hover:bg-accent-600 transition-all duration-300 hover:scale-110 shadow-md hover:shadow-lg"
              aria-label="联系我们"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </a>
            <a
              href="https://www.winuel.com"
              target="_blank"
              rel="noopener noreferrer"
              class="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-success-500 hover:text-white dark:hover:bg-success-600 transition-all duration-300 hover:scale-110 shadow-md hover:shadow-lg"
              aria-label="官方网站"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
            </a>
          </div>
        </div>

        <!-- 产品链接 -->
        <div>
          <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-4 uppercase tracking-wider">
            产品服务
          </h3>
          <ul class="space-y-3">
            <li>
              <a href="/features" class="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-300 hover:translate-x-1 inline-block">核心功能</a>
            </li>
            <li>
              <a href="/pricing" class="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-300 hover:translate-x-1 inline-block">会员体系</a>
            </li>
            <li>
              <a href="/api" class="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-300 hover:translate-x-1 inline-block">开发者 API</a>
            </li>
            <li>
              <a href="/changelog" class="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-300 hover:translate-x-1 inline-block">版本更新</a>
            </li>
            <li>
              <a href="/roadmap" class="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-300 hover:translate-x-1 inline-block">发展路线</a>
            </li>
          </ul>
        </div>

        <!-- 社区链接 -->
        <div>
          <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-4 uppercase tracking-wider">
            技术社区
          </h3>
          <ul class="space-y-3">
            <li>
              <a href="/blog" class="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-300 hover:translate-x-1 inline-block">技术博客</a>
            </li>
            <li>
              <a href="/forum" class="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-300 hover:translate-x-1 inline-block">开发者论坛</a>
            </li>
            <li>
              <a href="/showcase" class="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-300 hover:translate-x-1 inline-block">项目展示</a>
            </li>
            <li>
              <a href="/events" class="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-300 hover:translate-x-1 inline-block">技术沙龙</a>
            </li>
            <li>
              <a href="/opensource" class="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-300 hover:translate-x-1 inline-block">开源项目</a>
            </li>
          </ul>
        </div>

        <!-- 支持链接 -->
        <div>
          <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-4 uppercase tracking-wider">
            客户支持
          </h3>
          <ul class="space-y-3">
            <li>
              <a href="/help" class="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-300 hover:translate-x-1 inline-block">帮助中心</a>
            </li>
            <li>
              <a href="/faq" class="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-300 hover:translate-x-1 inline-block">常见问题</a>
            </li>
            <li>
              <a href="/contact" class="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-300 hover:translate-x-1 inline-block">联系我们</a>
            </li>
            <li>
              <a href="/feedback" class="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-300 hover:translate-x-1 inline-block">意见反馈</a>
            </li>
            <li>
              <a href="/status" class="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-300 hover:translate-x-1 inline-block">系统状态</a>
            </li>
          </ul>
        </div>
      </div>

      <!-- 订阅区域 -->
      <div class="mt-12 pt-8 border-t border-gray-200/50 dark:border-gray-700/50">
        <div class="bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-2xl p-6 lg:p-8">
          <div class="flex flex-col lg:flex-row items-center gap-6">
            <div class="flex-1">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                订阅柠檬叶工作室动态
              </h3>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                获取云纽论坛最新技术动态、柠檬叶工作室产品更新和精彩活动信息。
              </p>
            </div>
            <div class="w-full lg:w-auto">
              <form @submit.prevent="handleSubscribe" class="flex flex-col sm:flex-row gap-3">
                <input
                  v-model="subscribeEmail"
                  type="email"
                  placeholder="您的邮箱地址"
                  class="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
                  required
                />
                <button
                  type="submit"
                  :disabled="isSubscribing"
                  class="px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white text-sm font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {{ isSubscribing ? '订阅中...' : '订阅' }}
                </button>
              </form>
              <p v-if="subscribeMessage" class="mt-2 text-xs" :class="subscribeSuccess ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'">
                {{ subscribeMessage }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部版权和法律信息 -->
    <div class="border-t border-gray-200/50 dark:border-gray-700/50">
      <div class="container mx-auto px-4 py-6">
        <div class="flex flex-col md:flex-row items-center justify-between gap-4">
          <!-- 版权信息 -->
          <div class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <p>© 2026 云纽论坛. All rights reserved.</p>
            <span class="hidden md:inline">|</span>
            <p>由柠檬叶工作室用心打造</p>
            <span class="hidden md:inline">|</span>
            <p>lemonhub@163.com</p>
          </div>

          <!-- 法律链接 -->
          <div class="flex items-center gap-6">
            <a
              href="/terms"
              class="text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-300"
            >
              使用条款
            </a>
            <a
              href="/privacy"
              class="text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-300"
            >
              隐私政策
            </a>
            <a
              href="/cookies"
              class="text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-300"
            >
              Cookie 政策
            </a>
          </div>

          <!-- 语言切换 -->
          <div class="flex items-center gap-2">
            <button
              @click="toggleLanguage"
              class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 text-sm"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
              <span>{{ currentLanguage === 'zh' ? '中文' : 'English' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// 订阅功能
const subscribeEmail = ref('')
const isSubscribing = ref(false)
const subscribeMessage = ref('')
const subscribeSuccess = ref(false)

const handleSubscribe = async () => {
  if (!subscribeEmail.value) return
  
  isSubscribing.value = true
  subscribeMessage.value = ''
  
  // 模拟订阅请求
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // 这里应该调用实际的订阅 API
  try {
    // const response = await fetch('/api/subscribe', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ email: subscribeEmail.value })
    // })
    
    subscribeSuccess.value = true
    subscribeMessage.value = '订阅成功！感谢您的关注。'
    subscribeEmail.value = ''
  } catch {
    subscribeSuccess.value = false
    subscribeMessage.value = '订阅失败，请稍后重试。'
  }
  
  isSubscribing.value = false
  
  // 3秒后清除消息
  setTimeout(() => {
    subscribeMessage.value = ''
  }, 3000)
}

// 语言切换
const currentLanguage = ref('zh')

const toggleLanguage = () => {
  currentLanguage.value = currentLanguage.value === 'zh' ? 'en' : 'zh'
  // 这里应该触发实际的语言切换逻辑
  // 例如：更新 i18n 配置或重新加载页面
}
</script>