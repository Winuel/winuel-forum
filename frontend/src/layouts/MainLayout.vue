<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-500 bg-grid">
    <Header />
    <div class="container-safe py-8">
      <div class="flex gap-6 lg:gap-8">
        <!-- 桌面端侧边栏 -->
        <aside
          v-if="uiStore.sidebarOpen && windowWidth >= 1024"
          class="w-72 flex-shrink-0 hidden lg:block"
        >
          <Sidebar />
        </aside>
        
        <!-- 移动端侧边栏和桌面端可折叠侧边栏 -->
        <Sidebar v-if="uiStore.sidebarOpen" :is-mobile-open="isMobileOpen" />
        
        <main class="flex-1 min-w-0">
          <router-view v-slot="{ Component }">
            <transition
              name="page"
              mode="out-in"
            >
              <component :is="Component" />
            </transition>
          </router-view>
        </main>
        <aside class="w-80 flex-shrink-0 hidden xl:block">
          <Widgets />
        </aside>
      </div>
    </div>
    <Footer />
    <NotificationContainer />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useUIStore } from '../stores/ui'
import Header from '../components/Header.vue'
import Sidebar from '../components/Sidebar.vue'
import Widgets from '../components/Widgets.vue'
import Footer from '../components/Footer.vue'
import NotificationContainer from '../components/NotificationContainer.vue'

const uiStore = useUIStore()
const windowWidth = ref(1024)
const isMobileOpen = ref(false)

// 监听窗口大小变化
function handleResize() {
  windowWidth.value = window.innerWidth
  isMobileOpen.value = uiStore.sidebarOpen && window.innerWidth < 1024
}

onMounted(() => {
  handleResize()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.page-enter-active,
.page-leave-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.page-enter-from {
  opacity: 0;
  transform: translateY(30px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-30px);
}
</style>