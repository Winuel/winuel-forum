<template>
  <div>
    <div v-if="postStore.loading" class="text-center py-8">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
    </div>

    <template v-else-if="postStore.currentPost">
      <article class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div class="flex items-center gap-4 mb-4">
          <img
            :src="postStore.currentPost.authorAvatar || '/default-avatar.png'"
            :alt="postStore.currentPost.authorUsername"
            loading="lazy"
            class="w-12 h-12 rounded-full object-cover"
          />
          <div>
            <router-link
              :to="`/user/${postStore.currentPost.authorUsername}`"
              class="text-sm font-medium text-gray-900 dark:text-white hover:text-primary-500 dark:hover:text-primary-400"
            >
              {{ postStore.currentPost.authorUsername }}
            </router-link>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              {{ formatDate(postStore.currentPost.createdAt) }}
            </p>
          </div>
        </div>

        <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          {{ postStore.currentPost.title }}
        </h1>

        <div class="prose dark:prose-invert max-w-none mb-6">
          <p class="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
            {{ postStore.currentPost.content }}
          </p>
        </div>

        <!-- Code Attachments Section -->
        <div v-if="codeAttachments.length > 0" class="mb-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            代码附件
          </h3>
          <CodeViewer
            v-for="attachment in codeAttachments"
            :key="attachment.id"
            :attachment="attachment"
            :initially-collapsed="true"
            :show-line-numbers="true"
            :show-copy-button="true"
          />
        </div>

        <div class="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
          <router-link
            :to="`/category/${postStore.currentPost.categoryId}`"
            class="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            {{ postStore.currentPost.categoryName }}
          </router-link>
          <span class="flex items-center gap-1">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            {{ postStore.currentPost.viewCount }} 次浏览
          </span>
        </div>

        <div class="flex items-center gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            @click="toggleLike"
            :class="[
              'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors',
              isLiked
                ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            ]"
          >
            <svg class="w-5 h-5" :class="{ 'fill-current': isLiked }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            {{ postStore.currentPost.likeCount }}
          </button>
          <button
            v-if="userStore.isAuthenticated && userStore.user?.id === postStore.currentPost.authorId"
            @click="editPost"
            class="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            编辑
          </button>
        </div>
      </article>

      <CommentList />
    </template>
  </div>
</template>

<script setup lang="ts">

import { ref, onMounted } from 'vue'

import { useRoute, useRouter } from 'vue-router'

import { useUserStore } from '../stores/user'

import { usePostStore } from '../stores/post'

import { apiClient } from '../api/client'

import CommentList from '../components/CommentList.vue'

import CodeViewer from '../components/CodeViewer.vue'

import type { CodeAttachment } from '../types/code'



const route = useRoute()

const router = useRouter()

const userStore = useUserStore()



const postStore = usePostStore()



const isLiked = ref(false)

const codeAttachments = ref<CodeAttachment[]>([])

onMounted(async () => {
  const postId = route.params.id as string
  postStore.loading = true
  try {
    const post = await apiClient.get(`/api/posts/${postId}`) as any
    postStore.setCurrentPost(post as any)

    const comments = await apiClient.get(`/api/posts/${postId}/comments`) as any[]
    postStore.setComments(comments as any[])

    // Load code attachments
    try {
      const attachments = await apiClient.get(`/api/attachments/post/${postId}`) as CodeAttachment[]
      codeAttachments.value = attachments || []
    } catch (error) {
      // Ignore error if attachments endpoint doesn't exist yet
      console.log('Failed to load code attachments:', error)
    }
  } catch (error) {
    // Error handling is managed by the error handler
  } finally {
    postStore.loading = false
  }
})

function toggleLike() {
  isLiked.value = !isLiked.value
}

function editPost() {
  router.push(`/post/${route.params.id}/edit`)
}

function formatDate(date: string): string {
  const d = new Date(date)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) {
    const hours = Math.floor(diff / (1000 * 60 * 60))
    if (hours === 0) {
      const minutes = Math.floor(diff / (1000 * 60))
      return minutes < 1 ? '刚刚' : `${minutes} 分钟前`
    }
    return `${hours} 小时前`
  } else if (days === 1) {
    return '昨天'
  } else if (days < 7) {
    return `${days} 天前`
  } else {
    return d.toLocaleDateString('zh-CN')
  }
}
</script>