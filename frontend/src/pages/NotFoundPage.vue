<template>
  <div class="text-center py-16">
    <h1 class="text-6xl font-bold text-gray-900 dark:text-white mb-4">
      404
    </h1>
    <p class="text-xl text-gray-600 dark:text-gray-400 mb-8">
      页面未找到
    </p>
    <router-link
      to="/"
      class="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 rounded-lg transition-colors"
    >
      <svg
        class="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M10 19l-7-7m0 0l7-7m-7 7h18"
        />
      </svg>
      返回首页
    </router-link>
  </div>
</template>