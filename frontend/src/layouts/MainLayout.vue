<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
    <Header />
    <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex gap-6 lg:gap-8">
        <aside
          v-if="uiStore.sidebarOpen"
          class="w-64 flex-shrink-0 hidden lg:block"
        >
          <Sidebar />
        </aside>
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
import { useUIStore } from '../stores/ui'
import Header from '../components/Header.vue'
import Sidebar from '../components/Sidebar.vue'
import Widgets from '../components/Widgets.vue'
import Footer from '../components/Footer.vue'
import NotificationContainer from '../components/NotificationContainer.vue'

const uiStore = useUIStore()
</script>

<style scoped>
.page-enter-active,
.page-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.page-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>