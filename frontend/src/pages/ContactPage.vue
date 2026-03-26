<template>
  <div class="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
    <div class="container mx-auto px-4 py-12 max-w-4xl">
      <div class="glass-strong rounded-2xl p-8 md:p-12 shadow-xl">
        <h1 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">联系我们</h1>
        <p class="text-gray-600 dark:text-gray-400 mb-8">我们很乐意为您提供帮助</p>

        <div class="grid md:grid-cols-2 gap-8 mb-12">
          <div class="space-y-6">
            <div class="flex items-start gap-4">
              <div class="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                <svg class="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-1">电子邮箱</h3>
                <a href="mailto:lemonhub@163.com" class="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  lemonhub@163.com
                </a>
              </div>
            </div>

            <div class="flex items-start gap-4">
              <div class="w-12 h-12 rounded-xl bg-secondary-100 dark:bg-secondary-900/30 flex items-center justify-center flex-shrink-0">
                <svg class="w-6 h-6 text-secondary-600 dark:text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-1">官方网站</h3>
                <a href="https://www.winuel.com" target="_blank" rel="noopener noreferrer" class="text-gray-600 dark:text-gray-400 hover:text-secondary-600 dark:hover:text-secondary-400 transition-colors">
                  www.winuel.com
                </a>
              </div>
            </div>

            <div class="flex items-start gap-4">
              <div class="w-12 h-12 rounded-xl bg-accent-100 dark:bg-accent-900/30 flex items-center justify-center flex-shrink-0">
                <svg class="w-6 h-6 text-accent-600 dark:text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-1">地址</h3>
                <p class="text-gray-600 dark:text-gray-400">
                  中国 · 北京
                </p>
              </div>
            </div>
          </div>

          <div class="space-y-6">
            <div class="flex items-start gap-4">
              <div class="w-12 h-12 rounded-xl bg-success-100 dark:bg-success-900/30 flex items-center justify-center flex-shrink-0">
                <svg class="w-6 h-6 text-success-600 dark:text-success-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-1">工作时间</h3>
                <p class="text-gray-600 dark:text-gray-400">
                  周一至周五 9:00 - 18:00
                </p>
              </div>
            </div>

            <div class="flex items-start gap-4">
              <div class="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                <svg class="w-6 h-6 text-purple-600 dark:text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-1.425-3.795-1.425-.51-1.29-1.23-1.635-1.23-1.635-1.005-.69.075-.675.075-.675 1.11.075 1.695 1.14 1.695 1.14 1.23 2.13 3.225 1.515 4.02 1.155.12-.87.48-1.62.87-2.175-3.015-.33-6.195-1.53-6.195-6.81 0-1.5.54-2.745 1.44-3.72-.15-.36-.645-1.815.135-3.795 0 0 1.17-.375 3.84 1.455 1.11-.315 2.31-.465 3.495-.465 1.185 0 2.385.15 3.495.465 2.67-1.83 3.84-1.455 3.84-1.455.78 1.98.285 3.435.135 3.795.9.975 1.44 2.22 1.44 3.72 0 5.295-3.195 6.48-6.24 6.795.48.42.9 1.17.9 2.37 0 1.705-.015 3.075-.015 3.495 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-1">GitHub</h3>
                <a href="https://github.com/LemonStudio-hub/winuel" target="_blank" rel="noopener noreferrer" class="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                      LemonStudio-hub/winuel                </a>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-xl p-6 md:p-8">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">常见问题快速解答</h2>
          <div class="space-y-4">
            <div class="flex items-start gap-3">
              <div class="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span class="text-xs font-semibold text-primary-600 dark:text-primary-400">1</span>
              </div>
              <div>
                <h4 class="font-medium text-gray-900 dark:text-white mb-1">如何注册账户？</h4>
                <p class="text-sm text-gray-600 dark:text-gray-400">点击右上角的"注册"按钮，填写必要信息即可完成注册。</p>
              </div>
            </div>
            <div class="flex items-start gap-3">
              <div class="w-6 h-6 rounded-full bg-secondary-100 dark:bg-secondary-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span class="text-xs font-semibold text-secondary-600 dark:text-secondary-400">2</span>
              </div>
              <div>
                <h4 class="font-medium text-gray-900 dark:text-white mb-1">如何发布帖子？</h4>
                <p class="text-sm text-gray-600 dark:text-gray-400">登录后点击导航栏的"创建帖子"按钮，填写内容后即可发布。</p>
              </div>
            </div>
            <div class="flex items-start gap-3">
              <div class="w-6 h-6 rounded-full bg-accent-100 dark:bg-accent-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span class="text-xs font-semibold text-accent-600 dark:text-accent-400">3</span>
              </div>
              <div>
                <h4 class="font-medium text-gray-900 dark:text-white mb-1">如何修改个人信息？</h4>
                <p class="text-sm text-gray-600 dark:text-gray-400">登录后访问"设置"页面，可以修改头像、用户名、个人简介等信息。</p>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
          <router-link
            to="/"
            class="inline-flex items-center gap-2 text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            返回首页
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 联系我们页面
</script>