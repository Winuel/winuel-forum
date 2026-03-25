<script setup lang="ts">
defineProps<{
  icon: string
  title: string
  description: string
  color?: string
}>()
</script>

<template>
  <div class="card-enhanced p-8 group relative overflow-hidden">
    <!-- 背景光效 -->
    <div
      class="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-500"
      :class="color || 'from-primary-500 to-secondary-500'"
    ></div>

    <!-- 图标 -->
    <div
      class="relative w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg group-hover:shadow-xl"
      :class="[
        color || 'from-primary-500 to-secondary-500',
        'from-opacity-10 to-opacity-10'
      ]"
    >
      <div class="absolute inset-0 bg-gradient-to-br opacity-20 group-hover:opacity-30 transition-opacity" :class="color || 'from-primary-500 to-secondary-500'"></div>
      <span class="relative text-4xl transform group-hover:scale-110 transition-transform duration-300">{{ icon }}</span>
    </div>

    <!-- 标题 -->
    <h3 class="relative text-xl font-bold mb-4 text-gray-900 group-hover:text-primary-600 transition-colors">
      {{ title }}
    </h3>

    <!-- 描述 -->
    <p class="relative text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors">
      {{ description }}
    </p>

    <!-- 边框光效 -->
    <div
      class="absolute inset-0 border-2 border-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
      :class="`border-${(color || 'from-primary-500 to-secondary-500').replace('from-', '').replace(' to-', '-')}-200`"
    ></div>

    <!-- 闪光效果 -->
    <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
      <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
    </div>
  </div>
</template>

<style scoped>
/* 添加一些额外的自定义样式 */
</style>