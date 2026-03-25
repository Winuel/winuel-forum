<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import FeatureCard from '@/components/FeatureCard.vue'
import CTAButton from '@/components/CTAButton.vue'

const features = [
  {
    icon: '🚀',
    title: 'Serverless 架构',
    description: '基于 Cloudflare Workers 构建，无需服务器管理，自动扩缩容，基于全球边缘网络，提供超低延迟访问体验。',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    icon: '💰',
    title: '高性价比',
    description: '按使用量计费，零运维成本，小规模项目几乎免费，大幅降低部署和运营成本。',
    color: 'from-green-500 to-emerald-500'
  },
  {
    icon: '🔒',
    title: '安全可靠',
    description: '多层安全防护，JWT 认证，HTTPS 加密，符合行业安全标准，全方位保护用户数据安全。',
    color: 'from-red-500 to-orange-500'
  },
  {
    icon: '📱',
    title: '响应式设计',
    description: '完美适配移动端、平板、桌面设备，提供一致的用户体验，支持深色/浅色主题切换。',
    color: 'from-purple-500 to-pink-500'
  },
  {
    icon: '🎨',
    title: '现代美学',
    description: '简洁优雅的界面设计，流畅的动画效果，基于 TailwindCSS 构建，易于定制和维护。',
    color: 'from-indigo-500 to-violet-500'
  },
  {
    icon: '🧩',
    title: '插件系统',
    description: '前后端统一的插件架构，支持功能扩展，社区驱动的生态系统，满足各种定制需求。',
    color: 'from-yellow-500 to-amber-500'
  }
]

const techStack = [
  { name: 'Vue 3', color: 'bg-green-500', description: '渐进式 JavaScript 框架' },
  { name: 'TypeScript', color: 'bg-blue-500', description: '类型安全的 JavaScript' },
  { name: 'Vite', color: 'bg-purple-500', description: '下一代前端构建工具' },
  { name: 'Cloudflare', color: 'bg-orange-500', description: '全球边缘计算平台' },
  { name: 'TailwindCSS', color: 'bg-cyan-500', description: '实用优先的 CSS 框架' },
  { name: 'Pinia', color: 'bg-yellow-500', description: 'Vue 的状态管理库' }
]

const stats = [
  { value: '99.9%', label: '可用性' },
  { value: '<100ms', label: '响应时间' },
  { value: '0$', label: '初期成本' },
  { value: '10+', label: '核心功能' }
]

onMounted(() => {
  // 初始化滚动动画
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible')
      }
    })
  }, { threshold: 0.1 })

  document.querySelectorAll('.animate-on-scroll').forEach(el => {
    observer.observe(el)
  })

  // Hero 区域打字效果
  const heroText = document.querySelector('.hero-typing')
  if (heroText) {
    const text = heroText.textContent || ''
    heroText.textContent = ''
    let index = 0
    const type = () => {
      if (index < text.length) {
        heroText.textContent += text.charAt(index)
        index++
        setTimeout(type, 100)
      }
    }
    setTimeout(type, 500)
  }
})
</script>

<template>
  <div class="min-h-screen bg-white">
    <Header />

    <!-- Hero Section -->
    <section class="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      <!-- 动态背景 -->
      <div class="absolute inset-0 overflow-hidden">
        <!-- 渐变背景 -->
        <div class="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-primary-50"></div>

        <!-- 浮动装饰元素 -->
        <div class="absolute top-20 -left-20 w-72 h-72 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full blur-3xl opacity-20 animate-float"></div>
        <div class="absolute top-40 right-10 w-96 h-96 bg-gradient-to-br from-accent-400 to-primary-400 rounded-full blur-3xl opacity-20 animate-float-delayed"></div>
        <div class="absolute bottom-20 -right-20 w-80 h-80 bg-gradient-to-br from-secondary-400 to-pink-400 rounded-full blur-3xl opacity-20 animate-float" style="animation-delay: 2s;"></div>
        <div class="absolute bottom-40 left-10 w-72 h-72 bg-gradient-to-br from-primary-400 to-accent-400 rounded-full blur-3xl opacity-20 animate-float" style="animation-delay: 1.5s;"></div>

        <!-- 网格背景 -->
        <div class="absolute inset-0 grid-bg opacity-30"></div>

        <!-- 粒子背景 -->
        <div class="absolute inset-0 particle-bg opacity-20"></div>
      </div>

      <div class="container relative z-10">
        <div class="max-w-5xl mx-auto text-center px-4">
          <div class="animate-fade-up">
            <!-- 版本标签 -->
            <div class="inline-flex items-center px-5 py-2.5 rounded-2xl bg-gradient-to-r from-primary-50 to-secondary-50 text-primary-600 font-semibold mb-8 md:mb-12 text-sm md:text-base border border-primary-100 shadow-sm hover:shadow-md transition-shadow cursor-default">
              <span class="w-2.5 h-2.5 rounded-full bg-primary-500 mr-3 animate-pulse"></span>
              <span class="hero-typing">v0.1.0-beta 现已发布</span>
            </div>

            <!-- 主标题 -->
            <h1 class="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6 md:mb-8 leading-tight tracking-tight">
              <span class="gradient-text">现代化论坛系统</span>
              <br class="hidden sm:block">
              <span class="text-gray-900 dark:text-white">重新定义社区交流</span>
            </h1>

            <!-- 副标题 -->
            <p class="text-lg sm:text-xl md:text-2xl lg:text-3xl text-gray-600 dark:text-gray-400 mb-8 md:mb-12 max-w-3xl mx-auto leading-relaxed px-4">
              基于
              <span class="text-primary-500 font-semibold">Cloudflare Workers</span>
              构建，提供
              <span class="text-primary-500 font-semibold">高性能</span>、
              <span class="text-secondary-500 font-semibold">低成本</span>、
              <span class="text-primary-500 font-semibold">易部署</span>
              的现代化论坛解决方案
            </p>

            <!-- CTA 按钮 -->
            <div class="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center px-4">
              <CTAButton href="https://hub.winuel.com" size="lg" variant="primary" class="w-full sm:w-auto group">
                <span class="relative z-10 flex items-center gap-2">
                  访问论坛
                  <svg class="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                  </svg>
                </span>
                <div class="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent animate-shimmer"></div>
              </CTAButton>
              <CTAButton to="/product" size="lg" variant="secondary" class="w-full sm:w-auto">
                了解更多
              </CTAButton>
            </div>
          </div>
        </div>
      </div>

      <!-- 滚动指示器 -->
      <div class="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce hidden md:block">
        <div class="w-8 h-12 rounded-full border-2 border-gray-300 flex items-start justify-center p-2">
          <div class="w-1.5 h-3 bg-gradient-to-b from-primary-500 to-secondary-500 rounded-full animate-bounce"></div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="section bg-white relative overflow-hidden">
      <!-- 背景装饰 -->
      <div class="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-500 to-transparent opacity-30"></div>

      <div class="container relative z-10">
        <div class="text-center mb-16 md:mb-20 animate-on-scroll">
          <h2 class="section-title gradient-text">核心特性</h2>
          <p class="section-subtitle">
            精心设计的功能，为您的社区提供卓越体验
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            v-for="(feature, index) in features"
            :key="feature.title"
            :icon="feature.icon"
            :title="feature.title"
            :description="feature.description"
            :color="feature.color"
            class="animate-on-scroll"
            :style="{ animationDelay: `${index * 0.1}s` }"
          />
        </div>
      </div>
    </section>

    <!-- Tech Stack Section -->
    <section class="section bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
      <!-- 背景装饰 -->
      <div class="absolute inset-0 grid-bg opacity-20"></div>

      <div class="container relative z-10">
        <div class="text-center mb-16 md:mb-20 animate-on-scroll">
          <h2 class="section-title gradient-text">技术栈</h2>
          <p class="section-subtitle">
            采用最新的现代化技术，确保性能和开发效率
          </p>
        </div>

        <div class="flex flex-wrap justify-center gap-6 animate-on-scroll">
          <div
            v-for="tech in techStack"
            :key="tech.name"
            class="group relative px-8 py-6 bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 cursor-default"
          >
            <div class="absolute inset-0 bg-gradient-to-br from-primary-500/0 to-secondary-500/0 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            <div class="relative flex items-center space-x-4">
              <div :class="`w-4 h-4 rounded-full ${tech.color} animate-pulse-glow`"></div>
              <div>
                <div class="font-bold text-lg text-gray-900">{{ tech.name }}</div>
                <div class="text-sm text-gray-500">{{ tech.description }}</div>
              </div>
            </div>
            <div class="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-primary-200 transition-colors duration-300"></div>
          </div>
        </div>
      </div>
    </section>

    <!-- Stats Section -->
    <section class="section bg-gradient-to-r from-primary-600 via-primary-500 to-secondary-500 text-white relative overflow-hidden">
      <!-- 动态背景 -->
      <div class="absolute inset-0">
        <div class="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
        <div class="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent animate-gradient"></div>
      </div>

      <div class="container relative z-10">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          <div
            v-for="(stat, index) in stats"
            :key="stat.label"
            class="text-center animate-on-scroll"
            :style="{ animationDelay: `${index * 0.1}s` }"
          >
            <div class="text-5xl md:text-6xl lg:text-7xl font-bold mb-3 text-white drop-shadow-lg">
              {{ stat.value }}
            </div>
            <div class="text-lg md:text-xl text-primary-100 font-medium">
              {{ stat.label }}
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="section bg-white relative overflow-hidden">
      <!-- 背景装饰 -->
      <div class="absolute inset-0 grid-bg opacity-20"></div>

      <div class="container relative z-10">
        <div class="max-w-4xl mx-auto text-center animate-on-scroll">
          <div class="inline-block mb-6">
            <span class="px-4 py-2 rounded-full bg-primary-100 text-primary-600 font-semibold text-sm">
              🎉 立即开始
            </span>
          </div>
          <h2 class="text-4xl md:text-5xl lg:text-6xl font-bold mb-8 gradient-text">
            准备好开始了吗？
          </h2>
          <p class="text-xl md:text-2xl text-gray-600 mb-12 max-w-2xl mx-auto">
            立即体验 CloudLink 论坛系统，开启您的社区建设之旅
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <CTAButton href="https://hub.winuel.com" size="lg" variant="primary" class="w-full sm:w-auto">
              <span class="relative z-10 flex items-center gap-2">
                立即体验
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                </svg>
              </span>
            </CTAButton>
            <CTAButton to="/contact" size="lg" variant="secondary" class="w-full sm:w-auto">
              联系我们
            </CTAButton>
          </div>
        </div>
      </div>
    </section>

    <Footer />
  </div>
</template>

<style scoped>
/* 添加一些额外的自定义样式 */
</style>