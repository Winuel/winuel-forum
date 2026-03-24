<template>
  <div
    v-if="isOpen"
    class="fixed top-16 right-4 w-96 max-h-[80vh] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 flex flex-col"
  >
    <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
        通知
      </h3>
      <div class="flex items-center gap-2">
        <span
          v-if="unreadCount > 0"
          class="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full"
        >
          {{ unreadCount }} 未读
        </span>
        <button
          v-if="unreadCount > 0"
          @click="markAllAsRead"
          class="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors"
        >
          全部已读
        </button>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto p-2">
      <div v-if="loading" class="flex items-center justify-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>

      <div v-else-if="notifications.length === 0" class="flex flex-col items-center justify-center py-8 text-gray-500 dark:text-gray-400">
        <svg class="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        <p class="text-sm">
          暂无通知
        </p>
      </div>

      <div v-else class="space-y-2">
        <NotificationItem
          v-for="notification in notifications"
          :key="notification.id"
          :notification="notification"
          @mark-as-read="handleMarkAsRead"
          @delete="handleDelete"
        />
      </div>
    </div>

    <div v-if="notifications.length > 0" class="p-3 border-t border-gray-200 dark:border-gray-700">
      <button
        @click="deleteAll"
        class="w-full py-2 px-4 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
      >
        清空所有通知
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { notificationsApi, type Notification } from '../api/notifications'
import NotificationItem from './NotificationItem.vue'

defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const notifications = ref<Notification[]>([])
const unreadCount = ref(0)
const loading = ref(false)

async function loadNotifications() {
  loading.value = true
  try {
    const response = await notificationsApi.getNotifications(1, 20, false)
    notifications.value = response.notifications
    unreadCount.value = response.unread_count
  } catch (error) {
    // Error handling is managed by the UI store
  } finally {
    loading.value = false
  }
}

async function loadUnreadCount() {
  try {
    const response = await notificationsApi.getUnreadCount()
    unreadCount.value = response.unread_count
  } catch (error) {
    // Error handling is managed by the UI store
  }
}

async function handleMarkAsRead(id: string) {
  try {
    await notificationsApi.markAsRead(id)
    const notification = notifications.value.find(n => n.id === id)
    if (notification) {
      notification.is_read = true
      unreadCount.value = Math.max(0, unreadCount.value - 1)
    }
  } catch (error) {
    // Error handling is managed by the UI store
  }
}

async function markAllAsRead() {
  try {
    await notificationsApi.markAllAsRead()
    notifications.value.forEach(n => {
      n.is_read = true
    })
    unreadCount.value = 0
  } catch (error) {
    // Error handling is managed by the UI store
  }
}

async function handleDelete(id: string) {
  try {
    await notificationsApi.deleteNotification(id)
    notifications.value = notifications.value.filter(n => n.id !== id)
    const notification = notifications.value.find(n => n.id === id)
    if (notification && !notification.is_read) {
      unreadCount.value = Math.max(0, unreadCount.value - 1)
    }
  } catch (error) {
    // Error handling is managed by the UI store
  }
}

async function deleteAll() {
  if (!confirm('确定要清空所有通知吗？')) {
    return
  }

  try {
    await notificationsApi.deleteAllNotifications()
    notifications.value = []
    unreadCount.value = 0
  } catch (error) {
    // Error handling is managed by the UI store
  }
}

onMounted(() => {
  loadNotifications()
})

defineExpose({
  loadUnreadCount,
})
</script>