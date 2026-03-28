<template>
  <footer class="glass-strong border-t border-gray-200/50 dark:border-gray-700/50 mt-12 backdrop-blur-xl">
    <div class="container mx-auto px-4 py-8">
      <div class="flex flex-col md:flex-row items-center justify-between gap-6">
        <!-- 社交媒体链接图标 -->
        <div class="flex items-center gap-3">
          <a
            href="https://github.com/Winuel/winuel"
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
            href="https://github.com/Winuel"
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

        <!-- 导航链接 -->
        <nav class="flex items-center gap-6">
          <a
            href="/terms"
            class="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-300"
          >
            使用条款
          </a>
          <a
            href="/privacy"
            class="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-300"
          >
            隐私政策
          </a>
          <a
            href="/contact"
            class="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-300"
          >
            联系我们
          </a>
        </nav>

        <!-- 版权标识 -->
        <div class="flex items-center gap-3">
          <div class="relative w-8 h-8 bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-600 rounded-lg flex items-center justify-center">
            <svg
              class="w-5 h-5 text-white"
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
            <span class="text-sm font-semibold text-gray-900 dark:text-white">云纽论坛</span>
            <p class="text-xs text-gray-500 dark:text-gray-400">© 2026 All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
// 简化的 Footer 组件
</script>