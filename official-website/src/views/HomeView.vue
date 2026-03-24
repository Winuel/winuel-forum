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
    description: '基于 Cloudflare Workers 构建，无需服务器管理，自动扩缩容，基于全球边缘网络，提供超低延迟访问体验。'
  },
  {
    icon: '💰',
    title: '高性价比',
    description: '按使用量计费，零运维成本，小规模项目几乎免费，大幅降低部署和运营成本。'
  },
  {
    icon: '🔒',
    title: '安全可靠',
    description: '多层安全防护，JWT 认证，HTTPS 加密，符合行业安全标准，全方位保护用户数据安全。'
  },
  {
    icon: '📱',
    title: '响应式设计',
    description: '完美适配移动端、平板、桌面设备，提供一致的用户体验，支持深色/浅色主题切换。'
  },
  {
    icon: '🎨',
    title: '现代美学',
    description: '简洁优雅的界面设计，流畅的动画效果，基于 TailwindCSS 构建，易于定制和维护。'
  },
  {
    icon: '🧩',
    title: '插件系统',
    description: '前后端统一的插件架构，支持功能扩展，社区驱动的生态系统，满足各种定制需求。'
  }
]

const techStack = [
  { name: 'Vue 3', color: 'bg-green-500' },
  { name: 'TypeScript', color: 'bg-blue-500' },
  { name: 'Vite', color: 'bg-purple-500' },
  { name: 'Cloudflare', color: 'bg-orange-500' },
  { name: 'TailwindCSS', color: 'bg-cyan-500' },
  { name: 'Pinia', color: 'bg-yellow-500' }
]

const animateElements = ref<HTMLElement[]>([])

onMounted(() => {
  // 简单的滚动动画
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
})
</script>

<template>
  <div class="min-h-screen">
    <Header />

    <!-- Hero Section -->
    <section class="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-50 via-white to-primary-50 pt-16">
      <!-- Background decoration -->
      <div class="absolute inset-0 overflow-hidden">
        <div class="absolute -top-20 -right-20 w-60 h-60 md:w-80 md:h-80 bg-primary-200 rounded-full blur-3xl opacity-30 animate-float"></div>
        <div class="absolute -bottom-20 -left-20 w-60 h-60 md:w-80 md:h-80 bg-secondary-200 rounded-full blur-3xl opacity-30 animate-float" style="animation-delay: 1s;"></div>
      </div>

      <div class="container relative z-10">
        <div class="max-w-4xl mx-auto text-center px-4">
          <div class="animate-fade-up">
            <div class="inline-flex items-center px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-primary-50 text-primary-600 font-medium mb-6 md:mb-8 text-sm md:text-base">
              <span class="w-2 h-2 rounded-full bg-primary-500 mr-2 animate-pulse"></span>
              v0.1.0-beta 现已发布
            </div>
            
            <h1 class="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 md:mb-8 leading-tight">
              <span class="gradient-text">现代化论坛系统</span>
              <br class="hidden sm:block">
              <span class="text-gray-900">重新定义社区交流</span>
            </h1>
            
            <p class="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 mb-8 md:mb-12 max-w-2xl mx-auto leading-relaxed px-4">
              基于 Cloudflare Workers 构建，提供<span class="text-primary-500 font-semibold">高性能</span>、<span class="text-secondary-500 font-semibold">低成本</span>、<span class="text-primary-500 font-semibold">易部署</span>的现代化论坛解决方案
            </p>
            
            <div class="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center px-4">
              <CTAButton href="https://hub.winuel.com" size="md" variant="primary" class="w-full sm:w-auto">
                访问论坛
                <svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                </svg>
              </CTAButton>
              <CTAButton to="/product" size="md" variant="secondary" class="w-full sm:w-auto">
                了解更多
              </CTAButton>
            </div>
          </div>
        </div>
      </div>

      <!-- Scroll indicator -->
      <div class="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce hidden md:block">
        <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
        </svg>
      </div>
    </section>

    <!-- Features Section -->
    <section class="section bg-white">
      <div class="container">
        <div class="text-center mb-16 animate-on-scroll">
          <h2 class="section-title gradient-text">核心特性</h2>
          <p class="section-subtitle">精心设计的功能，为您的社区提供卓越体验</p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            v-for="(feature, index) in features"
            :key="feature.title"
            :icon="feature.icon"
            :title="feature.title"
            :description="feature.description"
            class="animate-on-scroll"
            :style="{ animationDelay: `${index * 0.1}s` }"
          />
        </div>
      </div>
    </section>

    <!-- Tech Stack Section -->
    <section class="section bg-gradient-to-br from-gray-50 to-white">
      <div class="container">
        <div class="text-center mb-16 animate-on-scroll">
          <h2 class="section-title gradient-text">技术栈</h2>
          <p class="section-subtitle">采用最新的现代化技术，确保性能和开发效率</p>
        </div>
        
        <div class="flex flex-wrap justify-center gap-4 animate-on-scroll">
          <div
            v-for="tech in techStack"
            :key="tech.name"
            class="px-6 py-4 bg-white rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all hover:-translate-y-1"
          >
            <div class="flex items-center space-x-3">
              <div :class="`w-3 h-3 rounded-full ${tech.color}`"></div>
              <span class="font-semibold text-gray-900">{{ tech.name }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Stats Section -->
    <section class="section bg-gradient-to-r from-primary-500 to-secondary-500 text-white">
      <div class="container">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div class="animate-on-scroll">
            <div class="text-4xl md:text-5xl font-bold mb-2">99.9%</div>
            <div class="text-primary-100">可用性</div>
          </div>
          <div class="animate-on-scroll">
            <div class="text-4xl md:text-5xl font-bold mb-2">&lt;100ms</div>
            <div class="text-primary-100">响应时间</div>
          </div>
          <div class="animate-on-scroll">
            <div class="text-4xl md:text-5xl font-bold mb-2">0$</div>
            <div class="text-primary-100">初期成本</div>
          </div>
          <div class="animate-on-scroll">
            <div class="text-4xl md:text-5xl font-bold mb-2">10+</div>
            <div class="text-primary-100">核心功能</div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="section bg-white">
      <div class="container">
        <div class="max-w-4xl mx-auto text-center animate-on-scroll">
          <h2 class="text-4xl md:text-5xl font-bold mb-8 gradient-text">准备好开始了吗？</h2>
          <p class="text-xl text-gray-600 mb-12">
            立即体验 CloudLink 论坛系统，开启您的社区建设之旅
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <CTAButton href="https://hub.winuel.com" size="lg" variant="primary">
              立即体验
            </CTAButton>
            <CTAButton to="/contact" size="lg" variant="secondary">
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
</style>