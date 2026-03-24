<script setup lang="ts">
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import CTAButton from '@/components/CTAButton.vue'
</script>

<template>
  <div class="min-h-screen">
    <Header />

    <section class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <div class="container">
        <div class="max-w-2xl mx-auto text-center">
          <div class="text-9xl font-bold gradient-text mb-8">404</div>
          <h1 class="text-4xl md:text-5xl font-bold mb-6 text-gray-900">页面未找到</h1>
          <p class="text-xl text-gray-600 mb-12">
            抱歉，您访问的页面不存在或已被移除
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <CTAButton to="/" variant="primary" size="lg">
              返回首页
            </CTAButton>
            <CTAButton to="/contact" variant="secondary" size="lg">
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