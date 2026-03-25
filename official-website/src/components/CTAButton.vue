<script setup lang="ts">
defineProps<{
  href?: string
  to?: string
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg' | 'xl'
}>()
</script>

<template>
  <a
    v-if="href"
    :href="href"
    target="_blank"
    rel="noopener noreferrer"
    class="relative inline-flex items-center justify-center font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 overflow-hidden group"
    :class="[
      variant === 'primary' && [
        'bg-gradient-to-r from-primary-500 to-secondary-500 text-white',
        'hover:from-primary-600 hover:to-secondary-600',
        'focus:ring-primary-500 shadow-brand hover:shadow-brand-strong',
        'active:scale-95'
      ],
      variant === 'secondary' && [
        'bg-white text-gray-900 border-2 border-gray-200',
        'hover:border-primary-500 hover:bg-primary-50',
        'focus:ring-gray-500 hover:shadow-lg',
        'active:scale-95',
        'dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700',
        'dark:hover:border-primary-500 dark:hover:bg-primary-900/20'
      ],
      variant === 'ghost' && [
        'bg-transparent text-gray-700',
        'hover:bg-gray-100',
        'focus:ring-gray-500',
        'active:scale-95',
        'dark:text-gray-300 dark:hover:bg-gray-800'
      ],
      variant === 'outline' && [
        'bg-transparent border-2 border-primary-500 text-primary-500',
        'hover:bg-primary-500 hover:text-white',
        'focus:ring-primary-500',
        'active:scale-95'
      ],
      size === 'sm' && 'px-4 py-2 text-sm rounded-xl',
      size === 'md' && 'px-6 py-3 text-base rounded-2xl',
      size === 'lg' && 'px-8 py-4 text-lg rounded-2xl',
      size === 'xl' && 'px-10 py-5 text-xl rounded-3xl',
      !size && 'px-6 py-3 text-base rounded-2xl'
    ]"
  >
    <!-- 闪光效果 -->
    <div
      v-if="variant === 'primary'"
      class="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent animate-shimmer pointer-events-none"
    ></div>

    <!-- 内容 -->
    <span class="relative z-10 flex items-center gap-2">
      <slot />
    </span>
  </a>
  <RouterLink
    v-else
    :to="to || '/'"
    class="relative inline-flex items-center justify-center font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 overflow-hidden group"
    :class="[
      variant === 'primary' && [
        'bg-gradient-to-r from-primary-500 to-secondary-500 text-white',
        'hover:from-primary-600 hover:to-secondary-600',
        'focus:ring-primary-500 shadow-brand hover:shadow-brand-strong',
        'active:scale-95'
      ],
      variant === 'secondary' && [
        'bg-white text-gray-900 border-2 border-gray-200',
        'hover:border-primary-500 hover:bg-primary-50',
        'focus:ring-gray-500 hover:shadow-lg',
        'active:scale-95',
        'dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700',
        'dark:hover:border-primary-500 dark:hover:bg-primary-900/20'
      ],
      variant === 'ghost' && [
        'bg-transparent text-gray-700',
        'hover:bg-gray-100',
        'focus:ring-gray-500',
        'active:scale-95',
        'dark:text-gray-300 dark:hover:bg-gray-800'
      ],
      variant === 'outline' && [
        'bg-transparent border-2 border-primary-500 text-primary-500',
        'hover:bg-primary-500 hover:text-white',
        'focus:ring-primary-500',
        'active:scale-95'
      ],
      size === 'sm' && 'px-4 py-2 text-sm rounded-xl',
      size === 'md' && 'px-6 py-3 text-base rounded-2xl',
      size === 'lg' && 'px-8 py-4 text-lg rounded-2xl',
      size === 'xl' && 'px-10 py-5 text-xl rounded-3xl',
      !size && 'px-6 py-3 text-base rounded-2xl'
    ]"
  >
    <!-- 闪光效果 -->
    <div
      v-if="variant === 'primary'"
      class="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent animate-shimmer pointer-events-none"
    ></div>

    <!-- 内容 -->
    <span class="relative z-10 flex items-center gap-2">
      <slot />
    </span>
  </RouterLink>
</template>

<style scoped>
/* 添加一些额外的自定义样式 */
</style>