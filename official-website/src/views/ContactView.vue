<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import CTAButton from '@/components/CTAButton.vue'

const form = ref({
  name: '',
  email: '',
  subject: '',
  message: ''
})

const isSubmitting = ref(false)
const submitSuccess = ref(false)

const handleSubmit = async () => {
  isSubmitting.value = true
  
  // 模拟提交
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  isSubmitting.value = false
  submitSuccess.value = true
  
  // 重置表单
  form.value = {
    name: '',
    email: '',
    subject: '',
    message: ''
  }
  
  // 3秒后隐藏成功消息
  setTimeout(() => {
    submitSuccess.value = false
  }, 3000)
}

const contactInfo = [
  {
    icon: '📧',
    title: '邮箱',
    value: 'contact@winuel.com',
    link: 'mailto:contact@winuel.com'
  },
  {
    icon: '📍',
    title: '地址',
    value: '中国 · 北京',
    link: null
  },
  {
    icon: '🌐',
    title: '论坛',
    value: 'hub.winuel.com',
    link: 'https://hub.winuel.com'
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
          <h1 class="text-5xl md:text-6xl font-bold mb-8 gradient-text">联系我们</h1>
          <p class="text-xl text-gray-600 leading-relaxed">
            有任何问题或建议？我们随时为您提供帮助
          </p>
        </div>
      </div>
    </section>

    <!-- Contact Section -->
    <section class="section bg-white">
      <div class="container">
        <div class="max-w-6xl mx-auto">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <!-- Contact Form -->
            <div class="animate-on-scroll">
              <h2 class="text-2xl md:text-3xl font-bold mb-6 md:mb-8 gradient-text">发送消息</h2>
              
              <div v-if="submitSuccess" class="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm md:text-base">
                ✅ 消息发送成功！我们会尽快回复您。
              </div>
              
              <form @submit.prevent="handleSubmit" class="space-y-4 md:space-y-6">
                <div>
                  <label for="name" class="block text-sm font-medium text-gray-700 mb-2">姓名</label>
                  <input
                    id="name"
                    v-model="form.name"
                    type="text"
                    required
                    class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-base"
                    placeholder="您的姓名"
                  />
                </div>
                
                <div>
                  <label for="email" class="block text-sm font-medium text-gray-700 mb-2">邮箱</label>
                  <input
                    id="email"
                    v-model="form.email"
                    type="email"
                    required
                    class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-base"
                    placeholder="your@email.com"
                  />
                </div>
                
                <div>
                  <label for="subject" class="block text-sm font-medium text-gray-700 mb-2">主题</label>
                  <select
                    id="subject"
                    v-model="form.subject"
                    required
                    class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-base"
                  >
                    <option value="">选择主题</option>
                    <option value="general">一般咨询</option>
                    <option value="support">技术支持</option>
                    <option value="partnership">合作洽谈</option>
                    <option value="feedback">产品反馈</option>
                    <option value="other">其他</option>
                  </select>
                </div>
                
                <div>
                  <label for="message" class="block text-sm font-medium text-gray-700 mb-2">消息</label>
                  <textarea
                    id="message"
                    v-model="form.message"
                    required
                    rows="5"
                    class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none text-base"
                    placeholder="请输入您的消息..."
                  ></textarea>
                </div>
                
                <CTAButton
                  type="submit"
                  size="lg"
                  variant="primary"
                  class="w-full"
                  :disabled="isSubmitting"
                >
                  {{ isSubmitting ? '发送中...' : '发送消息' }}
                </CTAButton>
              </form>
            </div>

            <!-- Contact Info -->
            <div class="animate-on-scroll">
              <h2 class="text-3xl font-bold mb-8 gradient-text">联系方式</h2>
              
              <div class="space-y-6 mb-12">
                <div
                  v-for="info in contactInfo"
                  :key="info.title"
                  class="card p-6 hover:shadow-xl transition-all"
                >
                  <div class="flex items-start space-x-4">
                    <div class="text-4xl">{{ info.icon }}</div>
                    <div class="flex-1">
                      <h3 class="font-bold text-lg mb-2">{{ info.title }}</h3>
                      <a
                        v-if="info.link"
                        :href="info.link"
                        class="text-primary-500 hover:text-primary-600 transition-colors"
                      >
                        {{ info.value }}
                      </a>
                      <span v-else class="text-gray-700">{{ info.value }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Social Links -->
              <div class="card p-6">
                <h3 class="font-bold text-lg mb-4">关注我们</h3>
                <div class="flex space-x-4">
                  <a
                    href="https://github.com/LemonStudio-hub/yunniu"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="w-12 h-12 rounded-lg bg-gray-900 text-white flex items-center justify-center hover:bg-primary-500 transition-colors"
                  >
                    <svg class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                  </a>
                  <a
                    href="https://twitter.com/winuel"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="w-12 h-12 rounded-lg bg-gray-900 text-white flex items-center justify-center hover:bg-primary-500 transition-colors"
                  >
                    <svg class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ Section -->
    <section class="section bg-gradient-to-br from-gray-50 to-white">
      <div class="container">
        <div class="max-w-4xl mx-auto">
          <div class="text-center mb-16 animate-on-scroll">
            <h2 class="section-title gradient-text">常见问题</h2>
          </div>
          
          <div class="space-y-4">
            <details class="card p-6 cursor-pointer group animate-on-scroll">
              <summary class="flex items-center justify-between font-semibold text-lg">
                Winuel 是免费的吗？
                <svg class="w-5 h-5 transform group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </summary>
              <p class="mt-4 text-gray-600">Winuel 提供免费版本，小规模项目几乎免费。按使用量计费，您只需为实际使用的资源付费。具体价格请参考我们的定价页面。</p>
            </details>
            
            <details class="card p-6 cursor-pointer group animate-on-scroll">
              <summary class="flex items-center justify-between font-semibold text-lg">
                如何部署 Winuel？
                <svg class="w-5 h-5 transform group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </summary>
              <p class="mt-4 text-gray-600">Winuel 支持 Cloudflare Pages 一键部署。您只需要连接您的 GitHub 仓库，配置好环境变量，即可自动部署。详细步骤请参考我们的部署文档。</p>
            </details>
            
            <details class="card p-6 cursor-pointer group animate-on-scroll">
              <summary class="flex items-center justify-between font-semibold text-lg">
                Winuel 支持哪些功能？
                <svg class="w-5 h-5 transform group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </summary>
              <p class="mt-4 text-gray-600">Winuel 支持用户管理、帖子发布、评论互动、分类标签、通知系统、搜索功能、数据分析等完整的论坛功能。同时提供插件系统，支持功能扩展。</p>
            </details>
            
            <details class="card p-6 cursor-pointer group animate-on-scroll">
              <summary class="flex items-center justify-between font-semibold text-lg">
                如何获取技术支持？
                <svg class="w-5 h-5 transform group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </summary>
              <p class="mt-4 text-gray-600">您可以通过以下方式获取技术支持：1）查看我们的在线文档；2）在 GitHub 提交 Issue；3）发送邮件到 contact@winuel.com；4）加入我们的社区论坛讨论。</p>
            </details>
          </div>
        </div>
      </div>
    </section>

    <Footer />
  </div>
</template>

<style scoped>
</style>