<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
    <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
      评论 ({{ postStore.comments.length }})
    </h2>

    <CommentForm v-if="userStore.isAuthenticated" :post-id="postId" />

    <div v-else class="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center">
      <p class="text-sm text-gray-600 dark:text-gray-400">
        请 <router-link to="/login" class="text-primary-500 hover:text-primary-600 font-medium">
          登录
        </router-link>
        后参与讨论
      </p>
    </div>

    <div class="space-y-4">
      <CommentItem
        v-for="comment in postStore.comments"
        :key="comment.id"
        :comment="comment"
      />
    </div>

    <div v-if="postStore.comments.length === 0" class="text-center py-8">
      <p class="text-gray-500 dark:text-gray-400">
        暂无评论
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '../stores/user'
import { usePostStore } from '../stores/post'
import CommentForm from './CommentForm.vue'
import CommentItem from './CommentItem.vue'

const route = useRoute()
const userStore = useUserStore()
const postStore = usePostStore()

const postId = computed(() => route.params.id as string)
</script>