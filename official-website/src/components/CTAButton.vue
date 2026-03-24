<script setup lang="ts">
defineProps<{
  href?: string
  to?: string
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}>()
</script>

<template>
  <a
    v-if="href"
    :href="href"
    target="_blank"
    rel="noopener noreferrer"
    class="btn inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
    :class="[
      variant === 'primary' && 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white hover:from-primary-600 hover:to-secondary-600 focus:ring-primary-500',
      variant === 'secondary' && 'bg-white text-gray-900 border border-gray-300 hover:bg-gray-50 focus:ring-gray-500',
      variant === 'ghost' && 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
      size === 'sm' && 'px-4 py-2 text-sm rounded-lg',
      size === 'md' && 'px-6 py-3 rounded-lg',
      size === 'lg' && 'px-8 py-4 text-lg rounded-xl',
      !size && 'px-6 py-3 rounded-lg'
    ]"
  >
    <slot />
  </a>
  <RouterLink
    v-else
    :to="to || '/'"
    class="btn inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
    :class="[
      variant === 'primary' && 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white hover:from-primary-600 hover:to-secondary-600 focus:ring-primary-500',
      variant === 'secondary' && 'bg-white text-gray-900 border border-gray-300 hover:bg-gray-50 focus:ring-gray-500',
      variant === 'ghost' && 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
      size === 'sm' && 'px-4 py-2 text-sm rounded-lg',
      size === 'md' && 'px-6 py-3 rounded-lg',
      size === 'lg' && 'px-8 py-4 text-lg rounded-xl',
      !size && 'px-6 py-3 rounded-lg'
    ]"
  >
    <slot />
  </RouterLink>
</template>

<style scoped>
</style>