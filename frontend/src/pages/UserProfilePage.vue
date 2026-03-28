<template>
  <div>
    <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
      <div class="flex items-center gap-6">
        <img
          :src="user?.avatar || '/default-avatar.png'"
          :alt="user?.username"
          loading="lazy"
          class="w-24 h-24 rounded-full object-cover"
        />
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {{ user?.username }}
          </h1>
          <p class="text-gray-600 dark:text-gray-400 mb-4">
            {{ user?.email }}
          </p>
          <div class="flex gap-4 text-sm text-gray-500 dark:text-gray-400">
            <span>注册时间：{{ formatDate(user?.createdAt) }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        帖子列表
      </h2>

      <div v-if="loading" class="text-center py-8">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>

      <div v-else class="space-y-4">
        <PostCard
          v-for="post in posts"
          :key="post.id"
          :post="post"
        />
      </div>

      <div v-if="!loading && posts.length === 0" class="text-center py-8">
        <p class="text-gray-500 dark:text-gray-400">
          暂无帖子
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import PostCard from '../components/PostCard.vue'
import { apiClient } from '../api/client'
import type { Post } from '../stores/post'
import type { User } from '../stores/user'

const route = useRoute()
const user = ref<User | null>(null)
const posts = ref<Post[]>([])
const loading = ref(false)

onMounted(async () => {
  loading.value = true
  try {
    user.value = await apiClient.get(`/api/users/${route.params.username}`)

    if (user.value?.id) {
      const data = await apiClient.get(`/api/posts?authorId=${user.value.id}`) as any
      posts.value = data.posts || []
    }
  } catch (error) {
    // Error handling is managed by the error handler
  } finally {
    loading.value = false
  }
})

function formatDate(date?: string): string {
  if (!date) return ''
  return new Date(date).toLocaleDateString('zh-CN')
}
</script>