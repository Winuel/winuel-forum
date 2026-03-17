<template>
  <div>
    <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        {{ categoryName }}
      </h1>
      <p class="text-gray-600 dark:text-gray-400">
        浏览该分类下的所有帖子
      </p>
    </div>

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

    <div v-if="!loading && posts.length === 0" class="text-center py-12">
      <p class="text-gray-500 dark:text-gray-400">
        该分类下暂无帖子
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import PostCard from '../components/PostCard.vue'
import type { Post } from '../stores/post'

const route = useRoute()
const posts = ref<Post[]>([])
const categoryName = ref('')
const loading = ref(false)

onMounted(async () => {
  loading.value = true
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8787'}/api/posts?categoryId=${route.params.id}`)
    const data = await response.json()
    posts.value = data.posts || []
    categoryName.value = '分类'
  } catch (error) {
    console.error('Failed to fetch posts:', error)
  } finally {
    loading.value = false
  }
})
</script>