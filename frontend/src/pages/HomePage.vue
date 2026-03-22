<template>
  <div>
    <div class="card-base p-8 mb-8 relative overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-br from-primary-500/5 via-secondary-500/5 to-accent-500/5"></div>
      <div class="relative">
        <h1 class="text-3xl font-display font-bold text-gradient-simple mb-3">
          欢迎来到云纽论坛
        </h1>
        <p class="text-gray-600 dark:text-gray-400 mb-6 text-lg leading-relaxed">
          分享你的想法，与社区成员交流互动
        </p>
        <router-link
          v-if="userStore.isAuthenticated"
          to="/post/create"
          class="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white btn-primary"
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
          class="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white btn-primary"
        >
          加入我们
        </router-link>
      </div>
    </div>

    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-2">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          :class="[
            'px-5 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300',
            currentTab === tab.key
              ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/50 hover:-translate-y-0.5 hover:scale-105'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:scale-105'
          ]"
          @click="currentTab = tab.key"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <div
      v-if="postStore.loading"
      class="flex items-center justify-center py-16"
    >
      <div class="spinner"></div>
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
      class="text-center py-16"
    >
      <div class="inline-flex items-center justify-center w-20 h-20 bg-gray-100 dark:bg-gray-700/50 rounded-full mb-4">
        <svg class="w-10 h-10 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      </div>
      <p class="text-gray-500 dark:text-gray-400 text-lg font-medium">
        暂无帖子
      </p>
      <p class="text-gray-400 dark:text-gray-500 text-sm mt-2">
        成为第一个发布帖子的人吧！
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '../stores/user'
import { usePostStore } from '../stores/post'
import { apiClient } from '../api/client'
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
    const data = await apiClient.get('/api/posts') as any
    postStore.setPosts(data.posts || [])
  } catch (error) {
    // Error handling is managed by the error handler
  } finally {
    postStore.loading = false
  }
})
</script>