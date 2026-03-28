<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

const route = useRoute()
const isScrolled = ref(false)
const isMenuOpen = ref(false)

const navigation = [
  { name: '首页', href: '/', icon: 'home' },
  { name: '关于我们', href: '/about', icon: 'info' },
  { name: '产品介绍', href: '/product', icon: 'cube' },
  { name: '联系我们', href: '/contact', icon: 'mail' }
]

const handleScroll = () => {
  isScrolled.value = window.scrollY > 50
}

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

// 监听路由变化，自动关闭菜单
watch(() => route.path, () => {
  if (isMenuOpen.value) {
    isMenuOpen.value = false
  }
})

// 监听菜单状态，控制body滚动
watch(isMenuOpen, (newValue) => {
  if (newValue) {
    document.body.style.overflow = 'hidden'
    document.body.style.position = 'fixed'
    document.body.style.width = '100%'
  } else {
    document.body.style.overflow = ''
    document.body.style.position = ''
    document.body.style.width = ''
  }
})

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  // 清理body样式
  document.body.style.overflow = ''
  document.body.style.position = ''
  document.body.style.width = ''
})

// 图标组件
const icons = {
  home: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>',
  info: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>',
  cube: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>',
  mail: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>'
}
</script>

<template>
  <header
    class="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
    :class="[
      isScrolled
        ? 'bg-white/90 backdrop-blur-xl shadow-glass border-b border-gray-100/50'
        : 'bg-transparent',
      isMenuOpen ? 'z-[80]' : ''
    ]"
  >
    <div class="container">
      <div class="flex items-center justify-between h-20 md:h-24">
        <!-- Logo -->
        <RouterLink
          to="/"
          class="flex items-center space-x-3 md:space-x-4 group relative"
        >
          <div
            class="relative w-11 h-11 md:w-12 md:h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-brand hover:shadow-brand-strong overflow-hidden"
          >
            <div class="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
            <svg
              class="relative w-6 h-6 md:w-7 md:h-7 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
            <div class="absolute inset-0 animate-shimmer"></div>
          </div>
          <span class="text-2xl md:text-3xl font-bold gradient-text tracking-tight">
            Winuel
          </span>
        </RouterLink>

        <!-- Desktop Navigation -->
        <nav class="hidden md:flex items-center space-x-1 lg:space-x-2">
          <RouterLink
            v-for="item in navigation"
            :key="item.name"
            :to="item.href"
            class="relative px-4 py-2.5 rounded-xl font-medium text-sm lg:text-base transition-all duration-300 group overflow-hidden"
            :class="[
              route.path === item.href
                ? 'text-primary-600'
                : 'text-gray-700 hover:text-primary-600'
            ]"
          >
            <span class="relative z-10 flex items-center gap-2">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" v-html="icons[item.icon as keyof typeof icons]"></svg>
              {{ item.name }}
            </span>
            <div
              v-if="route.path === item.href"
              class="absolute inset-0 bg-primary-50/50 rounded-xl"
            ></div>
            <div
              class="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-primary-500 to-secondary-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"
            ></div>
          </RouterLink>
          <a
            href="https://hub.winuel.com"
            target="_blank"
            rel="noopener noreferrer"
            class="ml-4 btn btn-primary btn-md relative overflow-hidden group"
          >
            <span class="relative z-10 flex items-center gap-2">
              访问论坛
              <svg class="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
              </svg>
            </span>
            <div class="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent animate-shimmer"></div>
          </a>
        </nav>

        <!-- Mobile Menu Button -->
        <button
          @click="toggleMenu"
          class="md:hidden p-3 -mr-3 rounded-xl hover:bg-gray-100 transition-all duration-300 active:scale-95 relative z-[80] glass"
          :aria-expanded="isMenuOpen"
          aria-label="Toggle menu"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path v-if="!isMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
            <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Mobile Navigation Overlay -->
    <Transition
      enter-active-class="transition-opacity duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isMenuOpen"
        class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] md:hidden"
        @click="toggleMenu"
        aria-hidden="true"
      ></div>
    </Transition>

    <!-- Mobile Navigation -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="translate-x-full"
      enter-to-class="translate-x-0"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="translate-x-0"
      leave-to-class="translate-x-full"
    >
      <div
        v-if="isMenuOpen"
        class="fixed top-0 right-0 bottom-0 w-80 max-w-[85vw] bg-white/95 backdrop-blur-xl z-[70] md:hidden shadow-2xl overflow-y-auto border-l border-gray-100"
      >
        <div class="p-6">
          <!-- Mobile Header -->
          <div class="flex items-center justify-between mb-8">
            <RouterLink to="/" class="flex items-center space-x-3" @click="toggleMenu">
              <div class="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center shadow-brand">
                <svg class="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                  <path d="M2 17l10 5 10-5"/>
                  <path d="M2 12l10 5 10-5"/>
                </svg>
              </div>
              <span class="text-2xl font-bold gradient-text">Winuel</span>
            </RouterLink>
            <button
              @click="toggleMenu"
              class="p-3 -mr-3 rounded-xl hover:bg-gray-100 transition-all duration-300 active:scale-95"
              aria-label="Close menu"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <!-- Navigation Links -->
          <div class="space-y-2">
            <RouterLink
              v-for="item in navigation"
              :key="item.name"
              :to="item.href"
              class="flex items-center px-4 py-4 rounded-2xl transition-all duration-300 font-medium text-lg touch-manipulation group"
              :class="[
                route.path === item.href
                  ? 'bg-gradient-to-r from-primary-50 to-secondary-50 text-primary-600'
                  : 'hover:bg-gray-50 text-gray-700'
              ]"
              @click="toggleMenu"
            >
              <svg class="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" v-html="icons[item.icon as keyof typeof icons]"></svg>
              {{ item.name }}
              <svg
                v-if="route.path === item.href"
                class="w-5 h-5 ml-auto text-primary-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
            </RouterLink>
          </div>

          <!-- CTA Button -->
          <div class="mt-8">
            <a
              href="https://hub.winuel.com"
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-center justify-center w-full px-6 py-4 rounded-2xl bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-medium text-lg shadow-brand hover:shadow-brand-strong transition-all duration-300 active:scale-95 touch-manipulation relative overflow-hidden group"
              @click="toggleMenu"
            >
              <span class="relative z-10 flex items-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/>
                </svg>
                访问论坛
              </span>
              <div class="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent animate-shimmer"></div>
            </a>
          </div>

          <!-- Social Links -->
          <div class="mt-8 pt-8 border-t border-gray-200">
            <p class="text-sm text-gray-500 mb-4 font-medium">关注我们</p>
            <div class="flex space-x-3">
              <a
                href="https://github.com/Winuel/winuel"
                target="_blank"
                rel="noopener noreferrer"
                class="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-all duration-300 hover:scale-110 hover:shadow-lg touch-manipulation"
              >
                <svg class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
              <a
                href="https://twitter.com/winuel"
                target="_blank"
                rel="noopener noreferrer"
                class="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-all duration-300 hover:scale-110 hover:shadow-lg touch-manipulation"
              >
                <svg class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </header>
</template>

<style scoped>
/* 添加一些额外的自定义样式 */
</style>