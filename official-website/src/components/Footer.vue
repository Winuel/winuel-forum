<script setup lang="ts">
import { RouterLink } from 'vue-router'

const currentYear = new Date().getFullYear()

const links = {
  product: [
    { name: '产品介绍', href: '/product' },
    { name: '功能特性', href: '/product#features' },
    { name: '技术架构', href: '/product#architecture' },
  ],
  company: [
    { name: '关于我们', href: '/about' },
    { name: '联系我们', href: '/contact' },
    { name: '团队介绍', href: '/about#team' },
  ],
  resources: [
    { name: '使用文档', href: 'https://docs.winuel.com', external: true },
    { name: 'API 文档', href: 'https://docs.winuel.com/api/overview', external: true },
    { name: 'GitHub', href: 'https://github.com/LemonStudio-hub/yunniu', external: true },
  ]
}

const social = [
  { name: 'GitHub', href: 'https://github.com/LemonStudio-hub/yunniu', icon: 'M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z' },
  { name: 'Twitter', href: 'https://twitter.com/cloudlink', icon: 'M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z' },
]
</script>

<template>
  <footer class="bg-gray-900 text-gray-400">
    <div class="container">
      <div class="py-12 md:py-16">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          <!-- Brand -->
          <div class="lg:col-span-1">
            <RouterLink to="/" class="flex items-center space-x-2 md:space-x-3 mb-4 md:mb-6">
              <div class="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                <svg class="w-5 h-5 md:w-6 md:h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                  <path d="M2 17l10 5 10-5"/>
                  <path d="M2 12l10 5 10-5"/>
                </svg>
              </div>
              <span class="text-xl md:text-2xl font-bold text-white">CloudLink</span>
            </RouterLink>
            <p class="text-sm leading-relaxed mb-4 md:mb-6">
              现代化的轻量级论坛系统，基于 Cloudflare Workers 构建，提供高性能、低成本、易部署的解决方案。
            </p>
            <div class="flex space-x-3">
              <a
                v-for="item in social"
                :key="item.name"
                :href="item.href"
                target="_blank"
                rel="noopener noreferrer"
                class="w-10 h-10 md:w-10 md:h-10 rounded-lg bg-gray-800 flex items-center justify-center hover:bg-primary-500 transition-colors active:scale-95"
                :aria-label="item.name"
              >
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path :d="item.icon"/>
                </svg>
              </a>
            </div>
          </div>

          <!-- Product Links -->
          <div>
            <h3 class="text-white font-semibold mb-4 md:mb-6 text-base md:text-lg">产品</h3>
            <ul class="space-y-3 md:space-y-4">
              <li v-for="link in links.product" :key="link.name">
                <RouterLink
                  v-if="!link.external"
                  :to="link.href"
                  class="hover:text-white transition-colors py-2 inline-block text-sm md:text-base"
                >
                  {{ link.name }}
                </RouterLink>
                <a
                  v-else
                  :href="link.href"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="hover:text-white transition-colors py-2 inline-block text-sm md:text-base"
                >
                  {{ link.name }}
                </a>
              </li>
            </ul>
          </div>

          <!-- Company Links -->
          <div>
            <h3 class="text-white font-semibold mb-4 md:mb-6 text-base md:text-lg">公司</h3>
            <ul class="space-y-3 md:space-y-4">
              <li v-for="link in links.company" :key="link.name">
                <RouterLink
                  :to="link.href"
                  class="hover:text-white transition-colors py-2 inline-block text-sm md:text-base"
                >
                  {{ link.name }}
                </RouterLink>
              </li>
            </ul>
          </div>

          <!-- Resources Links -->
          <div>
            <h3 class="text-white font-semibold mb-4 md:mb-6 text-base md:text-lg">资源</h3>
            <ul class="space-y-3 md:space-y-4">
              <li v-for="link in links.resources" :key="link.name">
                <a
                  :href="link.href"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="hover:text-white transition-colors py-2 inline-block text-sm md:text-base"
                >
                  {{ link.name }}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div class="border-t border-gray-800 py-6 md:py-8">
        <div class="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 text-sm">
          <p class="text-center md:text-left">
            © {{ currentYear }} Lemon Studio. All rights reserved.
          </p>
          <div class="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-6 text-center md:text-left">
            <a href="#" class="hover:text-white transition-colors py-1">隐私政策</a>
            <a href="#" class="hover:text-white transition-colors py-1">服务条款</a>
            <a href="#" class="hover:text-white transition-colors py-1">Cookie 政策</a>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
</style>