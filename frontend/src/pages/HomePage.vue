<template>
  <div>
    <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        欢迎来到云纽论坛
      </h1>
      <p class="text-gray-600 dark:text-gray-400 mb-4">
        分享你的想法，与社区成员交流互动
      </p>
      <router-link
        v-if="userStore.isAuthenticated"
        to="/post/create"
        class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 rounded-lg transition-colors"
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
            d="M12 4v16m8-8H4"
          />
        </svg>
        发布新帖
      </router-link>
      <router-link
        v-else
        to="/register"
        class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 rounded-lg transition-colors"
      >
        加入我们
      </router-link>
    </div>

    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-2">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          :class="[
            'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
            currentTab === tab.key
              ? 'bg-primary-500 text-white'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          ]"
          @click="currentTab = tab.key"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <div
      v-if="postStore.loading"
      class="text-center py-8"
    >
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
    </div>

    <div
      v-else
      class="space-y-4"
    >
      <PostCard
        v-for="post in filteredPosts"
        :key="post.id"
        :post="post"
      />
    </div>

    <div
      v-if="!postStore.loading && filteredPosts.length === 0"
      class="text-center py-12"
    >
      <p class="text-gray-500 dark:text-gray-400">
        暂无帖子
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '../stores/user'
import { usePostStore } from '../stores/post'
import PostCard from '../components/PostCard.vue'

const userStore = useUserStore()
const postStore = usePostStore()

const currentTab = ref('latest')
const tabs = [
  { key: 'latest', label: '最新' },
  { key: 'hot', label: '热门' },
  { key: 'following', label: '关注' },
]

const filteredPosts = computed(() => {
  return postStore.posts
})

onMounted(async () => {
  postStore.loading = true
  try {
    const result = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8787'}/api/posts`)
    const data = await result.json()
    postStore.setPosts(data.posts || [])
  } catch (error) {
    console.error('Failed to fetch posts:', error)
  } finally {
    postStore.loading = false
  }
})
</script>