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
})
</script>

<template>
  <div id="app" class="min-h-screen bg-white text-gray-900">
    <RouterView />
  </div>
</template>

<style scoped>
</style>