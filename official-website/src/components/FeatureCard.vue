<script setup lang="ts">
defineProps<{
  icon: string
  title: string
  description: string
}>()
</script>

<template>
  <div class="card card-hover p-8 group">
    <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
      <span class="text-4xl">{{ icon }}</span>
    </div>
    <h3 class="text-xl font-bold mb-4 text-gray-900">{{ title }}</h3>
    <p class="text-gray-600 leading-relaxed">{{ description }}</p>
  </div>
</template>

<style scoped>
</style>