<script setup lang="ts">
import { onMounted } from 'vue'

onMounted(() => {
  // 平滑滚动
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault()
      const target = document.querySelector(this.getAttribute('href') as string)
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' })
      }
    })
  })

  // 检测系统主题偏好
  const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)')
  const applyDarkMode = (isDark: boolean) => {
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  // 应用初始主题
  applyDarkMode(darkModeQuery.matches)

  // 监听主题变化
  darkModeQuery.addEventListener('change', (e) => {
    applyDarkMode(e.matches)
  })
})
</script>

<template>
  <div id="app" class="min-h-screen bg-white text-gray-900 transition-colors duration-300">
    <RouterView />
  </div>
</template>

<style scoped>
</style>