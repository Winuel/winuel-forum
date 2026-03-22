<template>
  <div class="max-w-3xl mx-auto">
    <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        发布新帖
      </h1>

      <form
        class="space-y-6"
        @submit.prevent="handleSubmit"
      >
        <div>
          <label
            for="title"
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            标题
          </label>
          <input
            id="title"
            v-model="title"
            type="text"
            required
            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="请输入帖子标题"
          >
        </div>

        <div>
          <label
            for="category"
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            分类
          </label>
          <select
            id="category"
            v-model="categoryId"
            required
            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">
              请选择分类
            </option>
            <option
              v-for="category in categories"
              :key="category.id"
              :value="category.id"
            >
              {{ category.name }}
            </option>
          </select>
        </div>

        <div>
          <label
            for="content"
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            内容
          </label>
          <textarea
            id="content"
            v-model="content"
            required
            rows="10"
            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            placeholder="请输入帖子内容（支持 Markdown）"
          />
        </div>

        <div>
          <label
            for="tags"
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            标签（用逗号分隔）
          </label>
          <input
            id="tags"
            v-model="tagsInput"
            type="text"
            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="例如：Vue, TypeScript, 前端"
          >
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            代码附件
          </label>
          <CodeUploader
            v-if="!postId"
            :post-id="postId"
            :max-file-size="512"
            @upload-success="handleUploadSuccess"
            @upload-error="handleUploadError"
          />
          <div v-else class="text-sm text-gray-500">
            已创建帖子，无法再上传代码附件
          </div>
        </div>

        <div class="flex gap-3">
          <button
            type="submit"
            :disabled="loading"
            class="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ loading ? '发布中...' : '发布' }}
          </button>
          <router-link
            to="/"
            class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            取消
          </router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUIStore } from '../stores/ui'
import { apiClient } from '../api/client'
import CodeUploader from '../components/CodeUploader.vue'
import type { CodeAttachment } from '../types/code'

const router = useRouter()
const uiStore = useUIStore()

const title = ref('')
const categoryId = ref('')
const content = ref('')
const tagsInput = ref('')
const loading = ref(false)
const postId = ref('')
const codeAttachments = ref<CodeAttachment[]>([])

const categories = ref([
  { id: '1', name: '技术讨论' },
  { id: '2', name: '生活分享' },
  { id: '3', name: '问答专区' },
  { id: '4', name: '资源分享' },
])

async function handleSubmit() {
  loading.value = true
  try {
    const tags = tagsInput.value
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0)

    const post = await apiClient.post('/api/posts', {
      title: title.value,
      content: content.value,
      categoryId: categoryId.value,
      tags,
    }) as { id: string }
    
    postId.value = post.id
    
    uiStore.addNotification({
      type: 'success',
      title: '发布成功',
      message: '帖子已成功发布',
    })
    
    router.push(`/post/${post.id}`)
  } catch (error: any) {
    uiStore.addNotification({
      type: 'error',
      title: '发布失败',
      message: error?.message || '发布失败，请稍后重试',
    })
  } finally {
    loading.value = false
  }
}

const handleUploadSuccess = (attachment: CodeAttachment) => {
  codeAttachments.value.push(attachment)
  uiStore.addNotification({
    type: 'success',
    title: '上传成功',
    message: `代码文件 ${attachment.file_name} 已上传`,
  })
}

const handleUploadError = (error: string) => {
  uiStore.addNotification({
    type: 'error',
    title: '上传失败',
    message: error,
  })
}
</script>