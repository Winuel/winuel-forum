<template>
  <form @submit.prevent="handleSubmit" class="mb-8">
    <div class="relative">
      <textarea
        v-model="content"
        @input="handleInput"
        placeholder="写下你的评论..."
        rows="4"
        :class="[
          'input-base resize-none focus:ring-4 focus:ring-primary-500/20 transition-all duration-300 hover:border-primary-300 dark:hover:border-primary-500',
          { 'border-red-500 focus:border-red-500 focus:ring-red-500/20': errors.content }
        ]"
      ></textarea>
      <div class="absolute bottom-3 right-3 text-xs text-gray-400 font-medium">
        {{ content.length }} / 500
      </div>
    </div>
    
    <!-- 显示验证错误 -->
    <div v-if="hasErrors" class="mt-2 space-y-1">
      <div
        v-for="(error, field) in errors"
        :key="field"
        class="text-sm text-red-600 dark:text-red-400"
      >
        {{ error }}
      </div>
    </div>
    
    <div class="flex justify-end mt-4">
      <button
        type="submit"
        :disabled="!content.trim() || submitting || hasErrors"
        class="btn-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-lg disabled:hover:-translate-y-0.5 disabled:active:scale-100 flex items-center gap-2"
      >
        <svg v-if="submitting" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        {{ submitting ? '提交中...' : '发表评论' }}
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { usePostStore } from '../stores/post'
import { apiClient } from '../api/client'
import type { AppError } from '../types/error'
import { getErrorMessage } from '../types/error'

const props = defineProps<{
  postId: string
}>()

const postStore = usePostStore()
const content = ref('')
const submitting = ref(false)
const errors = ref<Record<string, string>>({})

interface Comment {
  id: string
  postId: string
  content: string
  userId: string
  createdAt: string
}

// 验证评论内容
function validateCommentContent(input: string): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {}
  const trimmedInput = input.trim()
  
  // 检查长度
  if (!trimmedInput) {
    errors.content = '评论内容不能为空 / Comment cannot be empty'
  } else if (trimmedInput.length < 2) {
    errors.content = '评论至少为2个字符 / Comment must be at least 2 characters'
  } else if (trimmedInput.length > 10000) {
    errors.content = '评论不能超过10000个字符 / Comment cannot exceed 10000 characters'
  }
  
  // 检查潜在的恶意内容
  const dangerousPatterns = [
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
  ]
  
  if (dangerantPatterns.some(pattern => pattern.test(trimmedInput))) {
    errors.content = '评论包含不安全的内容 / Comment contains unsafe content'
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

// 计算属性：是否有错误
const hasErrors = computed(() => Object.keys(errors.value).length > 0)

async function handleSubmit() {
  // 清空之前的错误
  errors.value = {}
  
  // 验证输入
  const validation = validateCommentContent(content.value)
  if (!validation.isValid) {
    errors.value = validation.errors
    return
  }

  submitting.value = true
  try {
    const comment = await apiClient.post('/api/comments', {
      postId: props.postId,
      content: content.value.trim(),
    }) as Comment
    postStore.addComment(comment)
    content.value = ''
    errors.value = {}
  } catch (error: AppError) {
    // Error handling is managed by the error handler
    const errorMessage = getErrorMessage(error)
    if (errorMessage) {
      errors.value.server = errorMessage
    }
  } finally {
    submitting.value = false
  }
}

// 实时验证
function handleInput() {
  if (content.value.trim()) {
    const validation = validateCommentContent(content.value)
    if (!validation.isValid) {
      errors.value = validation.errors
    } else {
      // 清除内容错误，但保留服务器错误
      if (errors.value.content) {
        delete errors.value.content
      }
    }
  } else {
    // 如果为空，不显示错误
    if (errors.value.content) {
      delete errors.value.content
    }
  }
}
</script>