<template>
  <form @submit.prevent="handleSubmit" class="mb-8">
    <div class="relative">
      <textarea
        v-model="content"
        placeholder="写下你的评论..."
        rows="4"
        class="input-base resize-none focus:ring-4 focus:ring-primary-500/20 transition-all duration-300 hover:border-primary-300 dark:hover:border-primary-500"
      ></textarea>
      <div class="absolute bottom-3 right-3 text-xs text-gray-400 font-medium">
        {{ content.length }} / 500
      </div>
    </div>
    <div class="flex justify-end mt-4">
      <button
        type="submit"
        :disabled="!content.trim() || submitting"
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
import { ref } from 'vue'
import { usePostStore } from '../stores/post'
import { apiClient } from '../api/client'

const props = defineProps<{
  postId: string
}>()

const postStore = usePostStore()
const content = ref('')
const submitting = ref(false)

async function handleSubmit() {
  if (!content.value.trim()) return

  submitting.value = true
  try {
    const comment = await apiClient.post('/api/comments', {
      postId: props.postId,
      content: content.value,
    }) as any
    postStore.addComment(comment)
    content.value = ''
  } catch (error) {
    // Error handling is managed by the error handler
  } finally {
    submitting.value = false
  }
}
</script>