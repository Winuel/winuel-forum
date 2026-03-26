<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import CTAButton from '@/components/CTAButton.vue'

const features = [
  {
    icon: '👥',
    title: '用户系统',
    description: '完善的用户注册、登录、权限管理功能，支持邮箱验证、OAuth 登录等'
  },
  {
    icon: '📝',
    title: '内容管理',
    description: '帖子发布、编辑、删除，支持富文本、Markdown、代码高亮等功能'
  },
  {
    icon: '💬',
    title: '评论系统',
    description: '嵌套评论、回复通知、点赞功能，支持实时互动'
  },
  {
    icon: '🏷️',
    title: '分类标签',
    description: '灵活的分类和标签系统，帮助用户快速找到感兴趣的内容'
  },
  {
    icon: '🔔',
    title: '通知系统',
    description: '实时通知、消息推送，让用户不错过任何重要信息'
  },
  {
    icon: '🔍',
    title: '搜索功能',
    description: '强大的全文搜索，支持按标题、内容、标签、作者等多维度搜索'
  },
  {
    icon: '📊',
    title: '数据分析',
    description: '用户行为分析、内容统计、趋势报告，帮助管理员做出更好的决策'
  },
  {
    icon: '🔧',
    title: '插件系统',
    description: '灵活的插件架构，支持功能扩展和自定义开发'
  },
  {
    icon: '🎨',
    title: '主题定制',
    description: '支持深色/浅色主题，提供丰富的主题定制选项'
  }
]

const architecture = [
  {
    title: '前端层',
    description: 'Vue 3 + TypeScript + Vite，提供流畅的用户界面和交互体验',
    icon: '🎨'
  },
  {
    title: '后端层',
    description: 'Hono + Cloudflare Workers，实现高性能的 API 服务',
    icon: '⚙️'
  },
  {
    title: '数据层',
    description: 'Cloudflare D1 数据库，提供可靠的边缘数据库服务',
    icon: '💾'
  },
  {
    title: '缓存层',
    description: 'Cloudflare KV 缓存，加速数据访问，提升性能',
    icon: '⚡'
  }
]

onMounted(() => {
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
    <section id="features" class="section bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <div class="container">
        <div class="max-w-4xl mx-auto text-center animate-on-scroll">
          <h1 class="text-5xl md:text-6xl font-bold mb-8 gradient-text">产品功能</h1>
          <p class="text-xl text-gray-600 leading-relaxed mb-8">
            Winuel 提供丰富的功能和灵活的扩展能力，满足各种社区建设需求
          </p>
        </div>
      </div>
    </section>

    <!-- Features Grid -->
    <section class="section bg-white">
      <div class="container">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          <div
            v-for="(feature, index) in features"
            :key="feature.title"
            class="card p-6 md:p-8 hover:shadow-2xl transition-all hover:-translate-y-1 animate-on-scroll"
            :style="{ animationDelay: `${index * 0.1}s` }"
          >
            <div class="text-4xl md:text-5xl mb-4">{{ feature.icon }}</div>
            <h3 class="text-lg md:text-xl font-bold mb-3">{{ feature.title }}</h3>
            <p class="text-gray-600 text-sm md:text-base">{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Architecture Section -->
    <section id="architecture" class="section bg-gradient-to-br from-gray-50 to-white">
      <div class="container">
        <div class="text-center mb-16 animate-on-scroll">
          <h2 class="section-title gradient-text">技术架构</h2>
          <p class="section-subtitle">采用现代化的技术栈，确保高性能和高可用性</p>
        </div>
        
        <div class="max-w-6xl mx-auto">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div
              v-for="(layer, index) in architecture"
              :key="layer.title"
              class="card p-6 text-center animate-on-scroll"
              :style="{ animationDelay: `${index * 0.1}s` }"
            >
              <div class="text-5xl mb-4">{{ layer.icon }}</div>
              <h3 class="text-xl font-bold mb-3">{{ layer.title }}</h3>
              <p class="text-gray-600 text-sm">{{ layer.description }}</p>
            </div>
          </div>
          
          <!-- Architecture Diagram -->
          <div class="mt-16 animate-on-scroll">
            <div class="card p-8 bg-gradient-to-br from-primary-50 to-secondary-50">
              <h3 class="text-2xl font-bold mb-8 text-center gradient-text">系统架构图</h3>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="bg-white rounded-xl p-6 shadow-md text-center">
                  <div class="text-4xl mb-3">🎨</div>
                  <h4 class="font-bold mb-2">Frontend</h4>
                  <p class="text-sm text-gray-600">Vue 3 + TypeScript<br/>Vite + TailwindCSS</p>
                </div>
                <div class="bg-white rounded-xl p-6 shadow-md text-center">
                  <div class="text-4xl mb-3">⚙️</div>
                  <h4 class="font-bold mb-2">Backend</h4>
                  <p class="text-sm text-gray-600">Hono + Cloudflare Workers<br/>JWT + Rate Limit</p>
                </div>
                <div class="bg-white rounded-xl p-6 shadow-md text-center">
                  <div class="text-4xl mb-3">💾</div>
                  <h4 class="font-bold mb-2">Database</h4>
                  <p class="text-sm text-gray-600">Cloudflare D1<br/>KV Cache + R2 Storage</p>
                </div>
              </div>
              <div class="mt-6 flex justify-center">
                <div class="bg-white rounded-xl px-8 py-4 shadow-md">
                  <span class="font-bold text-primary-500">🌐 Cloudflare Edge Network</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Benefits Section -->
    <section class="section bg-white">
      <div class="container">
        <div class="max-w-6xl mx-auto">
          <div class="text-center mb-16 animate-on-scroll">
            <h2 class="section-title gradient-text">为什么选择 Winuel</h2>
            <p class="section-subtitle">相比传统论坛系统，Winuel 具有显著优势</p>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div class="card p-8 text-center animate-on-scroll">
              <div class="text-6xl font-bold gradient-text mb-4">10x</div>
              <h3 class="text-xl font-bold mb-3">性能提升</h3>
              <p class="text-gray-600">基于边缘计算，全球 CDN 部署，响应速度提升 10 倍</p>
            </div>
            <div class="card p-8 text-center animate-on-scroll">
              <div class="text-6xl font-bold gradient-text mb-4">80%</div>
              <h3 class="text-xl font-bold mb-3">成本降低</h3>
              <p class="text-gray-600">按使用量计费，小规模项目几乎免费，大幅降低运营成本</p>
            </div>
            <div class="card p-8 text-center animate-on-scroll">
              <div class="text-6xl font-bold gradient-text mb-4">5min</div>
              <h3 class="text-xl font-bold mb-3">快速部署</h3>
              <p class="text-gray-600">无需服务器配置，一键部署，5 分钟内即可上线</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="section bg-gradient-to-r from-primary-500 to-secondary-500 text-white">
      <div class="container">
        <div class="max-w-4xl mx-auto text-center animate-on-scroll">
          <h2 class="text-4xl md:text-5xl font-bold mb-8">立即开始使用</h2>
          <p class="text-xl mb-12 text-primary-100">
            体验 Winuel 的强大功能，打造属于您的社区
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <CTAButton href="https://hub.winuel.com" size="lg" variant="secondary">
              访问论坛
            </CTAButton>
            <CTAButton href="https://docs.winuel.com" size="lg" variant="ghost" class="!bg-white/20 !text-white hover:!bg-white/30">
              查看文档
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