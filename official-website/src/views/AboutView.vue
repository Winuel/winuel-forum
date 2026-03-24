<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import CTAButton from '@/components/CTAButton.vue'

const team = [
  {
    name: '张三',
    role: '创始人 & CEO',
    description: '10年+互联网产品经验，专注于社区平台建设',
    image: '👨‍💻'
  },
  {
    name: '李四',
    role: '技术总监',
    description: '全栈工程师，精通前后端技术栈',
    image: '👩‍💻'
  },
  {
    name: '王五',
    role: '产品经理',
    description: '用户体验专家，追求极致的产品设计',
    image: '👨‍🎨'
  },
  {
    name: '赵六',
    role: '运营总监',
    description: '社区运营专家，擅长用户增长',
    image: '👩‍💼'
  }
]

const timeline = [
  {
    year: '2023',
    title: '项目启动',
    description: '团队组建，开始 CloudLink 论坛系统的设计和开发'
  },
  {
    year: '2024',
    title: 'Beta 发布',
    description: '首个 Beta 版本发布，提供核心功能'
  },
  {
    year: '2024',
    title: '正式上线',
    description: '完成全面测试，正式版本上线'
  },
  {
    year: '2025',
    title: '生态建设',
    description: '完善插件系统，构建开发者生态'
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
    <section class="section bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <div class="container">
        <div class="max-w-4xl mx-auto text-center animate-on-scroll">
          <h1 class="text-5xl md:text-6xl font-bold mb-8 gradient-text">关于我们</h1>
          <p class="text-xl text-gray-600 leading-relaxed mb-8">
            CloudLink 是由 Lemon Studio 团队开发的现代化论坛系统，致力于为用户提供
            <span class="text-primary-500 font-semibold">高性能</span>、
            <span class="text-secondary-500 font-semibold">低成本</span>、
            <span class="text-primary-500 font-semibold">易部署</span>的社区解决方案。
          </p>
          <div class="flex justify-center gap-4">
            <CTAButton to="/contact" variant="primary">联系我们</CTAButton>
            <CTAButton to="/product" variant="secondary">了解产品</CTAButton>
          </div>
        </div>
      </div>
    </section>

    <!-- Mission Section -->
    <section class="section bg-white">
      <div class="container">
        <div class="max-w-6xl mx-auto">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center">
            <div class="animate-on-scroll order-2 lg:order-1">
              <div class="aspect-square md:aspect-auto md:h-80 lg:h-96 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-3xl flex items-center justify-center">
                <div class="text-7xl md:text-8xl lg:text-9xl">🎯</div>
              </div>
            </div>
            <div class="animate-on-scroll order-1 lg:order-2">
              <h2 class="text-3xl md:text-4xl font-bold mb-4 md:mb-6 gradient-text">我们的使命</h2>
              <p class="text-base md:text-lg text-gray-600 leading-relaxed mb-6">
                我们的使命是让每个社区都能轻松拥有自己的论坛系统。通过现代化的技术栈和创新的架构设计，我们致力于：
              </p>
              <ul class="space-y-3 md:space-y-4">
                <li class="flex items-start">
                  <span class="w-6 h-6 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center mr-3 mt-0.5 md:mt-1 flex-shrink-0 text-sm">✓</span>
                  <span class="text-gray-700 text-sm md:text-base">降低社区建设的技术门槛和成本</span>
                </li>
                <li class="flex items-start">
                  <span class="w-6 h-6 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center mr-3 mt-0.5 md:mt-1 flex-shrink-0 text-sm">✓</span>
                  <span class="text-gray-700 text-sm md:text-base">提供卓越的用户体验和性能表现</span>
                </li>
                <li class="flex items-start">
                  <span class="w-6 h-6 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center mr-3 mt-0.5 md:mt-1 flex-shrink-0 text-sm">✓</span>
                  <span class="text-gray-700 text-sm md:text-base">构建开放、活跃的开发者社区</span>
                </li>
                <li class="flex items-start">
                  <span class="w-6 h-6 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center mr-3 mt-0.5 md:mt-1 flex-shrink-0 text-sm">✓</span>
                  <span class="text-gray-700 text-sm md:text-base">持续创新，引领论坛系统的发展方向</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Team Section -->
    <section id="team" class="section bg-gradient-to-br from-gray-50 to-white">
      <div class="container">
        <div class="text-center mb-12 md:mb-16 animate-on-scroll">
          <h2 class="section-title gradient-text">核心团队</h2>
          <p class="section-subtitle">汇聚各领域专家，共同打造卓越产品</p>
        </div>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          <div
            v-for="(member, index) in team"
            :key="member.name"
            class="card p-6 md:p-8 text-center animate-on-scroll"
            :style="{ animationDelay: `${index * 0.1}s` }"
          >
            <div class="text-5xl md:text-6xl mb-4">{{ member.image }}</div>
            <h3 class="text-lg md:text-xl font-bold mb-2">{{ member.name }}</h3>
            <p class="text-primary-500 font-medium mb-3 text-sm md:text-base">{{ member.role }}</p>
            <p class="text-gray-600 text-xs md:text-sm">{{ member.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Timeline Section -->
    <section class="section bg-white">
      <div class="container">
        <div class="text-center mb-16 animate-on-scroll">
          <h2 class="section-title gradient-text">发展历程</h2>
          <p class="section-subtitle">见证我们的成长与进步</p>
        </div>
        
        <div class="max-w-4xl mx-auto">
          <div class="relative">
            <!-- Timeline line -->
            <div class="absolute left-8 md:left-1/2 transform md:-translate-x-1/2 w-0.5 h-full bg-gradient-to-b from-primary-500 to-secondary-500"></div>
            
            <!-- Timeline items -->
            <div
              v-for="(item, index) in timeline"
              :key="item.year"
              class="relative mb-12 animate-on-scroll"
            >
              <div class="flex flex-col md:flex-row items-center">
                <div class="flex-1 md:text-right md:pr-12 mb-4 md:mb-0">
                  <div class="card p-6 inline-block">
                    <h3 class="text-2xl font-bold gradient-text mb-2">{{ item.year }}</h3>
                    <h4 class="text-lg font-semibold text-gray-900 mb-2">{{ item.title }}</h4>
                    <p class="text-gray-600">{{ item.description }}</p>
                  </div>
                </div>
                <div class="absolute left-8 md:left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-full bg-primary-500 border-4 border-white shadow-lg"></div>
                <div class="flex-1"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="section bg-gradient-to-r from-primary-500 to-secondary-500 text-white">
      <div class="container">
        <div class="max-w-4xl mx-auto text-center animate-on-scroll">
          <h2 class="text-4xl md:text-5xl font-bold mb-8">加入我们的团队</h2>
          <p class="text-xl mb-12 text-primary-100">
            我们正在寻找充满激情的伙伴，一起创造更好的产品
          </p>
          <CTAButton to="/contact" size="lg" variant="secondary">
            查看职位
          </CTAButton>
        </div>
      </div>
    </section>

    <Footer />
  </div>
</template>

<style scoped>
</style>