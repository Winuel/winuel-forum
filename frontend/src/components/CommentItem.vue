<template>
  <div class="flex gap-4 p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:shadow-soft transition-all duration-300 group">
    <div class="flex-shrink-0">
      <div class="relative">
        <img
          :src="comment.authorAvatar || '/default-avatar.png'"
          :alt="comment.authorUsername"
          class="w-11 h-11 rounded-full object-cover ring-2 ring-gray-100 dark:ring-gray-600 group-hover:ring-primary-300 dark:group-hover:ring-primary-600 transition-all duration-300"
        />
      </div>
    </div>
    <div class="flex-1 min-w-0">
      <div class="flex items-center gap-2 mb-2">
        <router-link
          :to="`/user/${comment.authorUsername}`"
          class="text-sm font-semibold text-gray-900 dark:text-white hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
        >
          {{ comment.authorUsername }}
        </router-link>
        <span class="text-xs text-gray-400">·</span>
        <span class="text-xs text-gray-500 dark:text-gray-400">
          {{ formatDate(comment.createdAt) }}
        </span>
      </div>
      
      <!-- 如果是回复评论，显示被回复的用户名 -->
      <div v-if="comment.parentAuthorUsername" class="mb-2">
        <span class="text-xs text-primary-500 dark:text-primary-400">
          回复 @{{ comment.parentAuthorUsername }}
        </span>
      </div>
      
      <p class="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
        {{ comment.content }}
      </p>

      <!-- Code Review Display -->
      <div v-if="comment.codeReview" class="mt-3">
        <div class="flex items-center gap-2 mb-2">
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
            代码审查
          </span>
          <span class="text-xs text-gray-500 dark:text-gray-400">
            状态: {{ getReviewStatusText(comment.codeReview.status) }}
          </span>
        </div>
        
        <DiffViewer
          :old-content="comment.codeReview.oldContent"
          :new-content="comment.codeReview.newContent"
          :old-file-name="comment.codeReview.fileName"
          :new-file-name="`${comment.codeReview.fileName} (提议)`"
        />

        <!-- Review Actions (for attachment owner) -->
        <div
          v-if="isAttachmentOwner && comment.codeReview.status === 'pending'"
          class="flex gap-2 mt-3"
        >
          <button
            @click="acceptReview"
            class="px-3 py-1.5 text-xs font-medium text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
          >
            接受变更
          </button>
          <button
            @click="rejectReview"
            class="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
          >
            拒绝变更
          </button>
        </div>
      </div>

      <div class="flex items-center gap-4 mt-3">
        <button
          @click="toggleLike"
          :class="[
            'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200',
            isLiked
              ? 'text-red-500 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
          ]"
        >
          <svg class="w-4 h-4" :class="{ 'fill-current': isLiked }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <span>{{ comment.likeCount }}</span>
        </button>
        <button
          @click="showReplyForm = !showReplyForm"
          class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-lg transition-all duration-200"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
          回复
        </button>
      </div>

      <!-- 回复表单 -->
      <div v-if="showReplyForm" class="mt-4">
        <div class="flex gap-3">
          <img
            :src="currentUser?.avatar || '/default-avatar.png'"
            :alt="currentUser?.username"
            class="w-8 h-8 rounded-full object-cover flex-shrink-0"
          />
          <div class="flex-1">
            <textarea
              v-model="replyContent"
              :placeholder="`回复 @${comment.authorUsername}...`"
              rows="3"
              class="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300 resize-none"
            />
            <div class="flex justify-end gap-2 mt-2">
              <button
                @click="showReplyForm = false"
                class="px-4 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                取消
              </button>
              <button
                @click="submitReply"
                :disabled="isSubmitting || !replyContent.trim()"
                class="px-4 py-1.5 text-xs font-medium text-white bg-primary-500 hover:bg-primary-600 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                {{ isSubmitting ? '发送中...' : '发送' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 嵌套回复列表 -->
      <div v-if="comment.replies && comment.replies.length > 0" class="mt-4 space-y-3">
        <CommentItem
          v-for="reply in comment.replies"
          :key="reply.id"
          :comment="reply"
          :post-id="postId"
          @reply-success="handleReplySuccess"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useUserStore } from '../stores/user'
import { apiClient } from '../api/client'
import type { Comment } from '../stores/post'
import DiffViewer from './DiffViewer.vue'

const props = defineProps<{
  comment: Comment
  postId: string
}>()

const emit = defineEmits<{
  replySuccess: []
  reviewAccepted: []
  reviewRejected: []
}>()

const userStore = useUserStore()
const isLiked = ref(false)
const showReplyForm = ref(false)
const replyContent = ref('')
const isSubmitting = ref(false)

const currentUser = computed(() => userStore.user)

// Check if current user is the attachment owner
const isAttachmentOwner = computed(() => {
  return currentUser.value?.id === props.comment.codeReview?.attachmentOwnerId
})

function toggleLike() {
  isLiked.value = !isLiked.value
  // TODO: 调用 API 点赞/取消点赞
}

async function submitReply() {
  if (!replyContent.value.trim() || !currentUser.value) return

  isSubmitting.value = true

  try {
    // TODO: 调用 API 提交回复
    // await api.comments.create({
    //   postId: props.postId,
    //   content: replyContent.value,
    //   parentId: props.comment.id
    // })

    // 清空表单
    replyContent.value = ''
    showReplyForm.value = false

    // 通知父组件刷新评论列表
    emit('replySuccess')
  } catch (error) {
    // Error handling is managed by the error handler
  } finally {
    isSubmitting.value = false
  }
}

function handleReplySuccess() {
  // 处理嵌套回复成功
  emit('replySuccess')
}

function getReviewStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    pending: '待审核',
    accepted: '已接受',
    rejected: '已拒绝'
  }
  return statusMap[status] || status
}

async function acceptReview() {
  if (!props.comment.codeReview) return

  try {
    await apiClient.post('/api/reviews/accept', {
      review_id: props.comment.codeReview.id,
      comment: '接受代码变更'
    })
    
    emit('reviewAccepted')
  } catch (error) {
    console.error('Failed to accept review:', error)
  }
}

async function rejectReview() {
  if (!props.comment.codeReview) return

  try {
    await apiClient.post('/api/reviews/reject', {
      review_id: props.comment.codeReview.id,
      comment: '拒绝代码变更'
    })
    
    emit('reviewRejected')
  } catch (error) {
    console.error('Failed to reject review:', error)
  }
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