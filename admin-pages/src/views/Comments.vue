<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">评论管理</h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          管理评论内容，包括审核和删除
        </p>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <input
            v-model="search"
            type="text"
            placeholder="搜索评论内容或用户..."
            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            @keyup.enter="fetchComments"
          />
        </div>
        <div>
          <select
            v-model="selectedStatus"
            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            @change="fetchComments"
          >
            <option value="all">所有状态</option>
            <option value="active">正常</option>
            <option value="deleted">已删除</option>
          </select>
        </div>
        <div>
          <button
            @click="fetchComments"
            class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            搜索
          </button>
        </div>
      </div>
    </div>

    <!-- Comments Table -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">评论内容</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">作者</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">所属帖子</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">发布时间</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">状态</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-if="loading">
              <td colspan="6" class="px-6 py-12 text-center">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              </td>
            </tr>
            <tr v-else-if="comments.length === 0">
              <td colspan="6" class="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                暂无评论
              </td>
            </tr>
            <tr v-else v-for="comment in comments" :key="comment.id">
              <td class="px-6 py-4">
                <div class="text-sm text-gray-900 dark:text-white max-w-md">
                  {{ comment.content }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {{ comment.author_username }}
              </td>
              <td class="px-6 py-4">
                <div class="text-sm text-gray-900 dark:text-white truncate max-w-xs">
                  {{ comment.post_title }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {{ formatDate(comment.created_at) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="px-2 py-1 text-xs font-semibold rounded-full"
                  :class="comment.deleted_at ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'"
                >
                  {{ comment.deleted_at ? '已删除' : '正常' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex items-center justify-end space-x-2">
                  <button
                    v-if="!comment.deleted_at"
                    @click="confirmDeleteComment(comment)"
                    class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                    title="删除"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                  <button
                    v-else
                    @click="confirmRestoreComment(comment)"
                    class="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                    title="恢复"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="pagination.totalPages > 1" class="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between">
          <div class="text-sm text-gray-500 dark:text-gray-400">
            显示 {{ (pagination.page - 1) * pagination.pageSize + 1 }} 到 {{ Math.min(pagination.page * pagination.pageSize, pagination.total) }} 条，共 {{ pagination.total }} 条
          </div>
          <div class="flex space-x-2">
            <button
              @click="changePage(pagination.page - 1)"
              :disabled="pagination.page === 1"
              class="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white"
            >
              上一页
            </button>
            <button
              v-for="page in getPageNumbers()"
              :key="page"
              @click="changePage(page)"
              class="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white"
              :class="page === pagination.page ? 'bg-blue-600 text-white border-blue-600' : ''"
            >
              {{ page }}
            </button>
            <button
              @click="changePage(pagination.page + 1)"
              :disabled="pagination.page === pagination.totalPages"
              class="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white"
            >
              下一页
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div
      v-if="showDeleteModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50"
    >
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
        <h3 class="text-lg font-semibold text-red-600 mb-4">
          {{ deleteAction === 'delete' ? '删除评论' : '恢复评论' }}
        </h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              评论内容
            </label>
            <div class="text-sm text-gray-900 dark:text-white">
              {{ selectedComment?.content }}
            </div>
          </div>
          <div v-if="deleteAction === 'delete'">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              删除原因（可选）
            </label>
            <textarea
              v-model="deleteReason"
              rows="3"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="请输入删除原因..."
            ></textarea>
          </div>
        </div>
        <div class="flex justify-end space-x-3 mt-6">
          <button
            @click="showDeleteModal = false"
            class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            取消
          </button>
          <button
            @click="executeDeleteAction"
            class="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700"
          >
            {{ deleteAction === 'delete' ? '确认删除' : '确认恢复' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'

const comments = ref<any[]>([])
const loading = ref(false)
const search = ref('')
const selectedStatus = ref('all')
const pagination = ref({
  page: 1,
  pageSize: 20,
  total: 0,
  totalPages: 0,
})

// Modals
const showDeleteModal = ref(false)
const selectedComment = ref<any>(null)
const deleteAction = ref<'delete' | 'restore'>('delete')
const deleteReason = ref('')

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const fetchComments = async () => {
  loading.value = true
  try {
    const response = await axios.get('/api/admin/comments', {
      params: {
        page: pagination.value.page,
        pageSize: pagination.value.pageSize,
        search: search.value,
        status: selectedStatus.value,
      },
    })
    if (response.data.success) {
      comments.value = response.data.data.comments
      pagination.value = response.data.data.pagination
    }
  } catch (error: any) {
    console.error('Failed to fetch comments:', error)
    if (error.response?.status === 403) {
      alert('权限不足')
    }
  } finally {
    loading.value = false
  }
}

const changePage = (page: number) => {
  if (page >= 1 && page <= pagination.value.totalPages) {
    pagination.value.page = page
    fetchComments()
  }
}

const getPageNumbers = () => {
  const pages: number[] = []
  const { page, totalPages } = pagination.value
  
  if (totalPages <= 5) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i)
    }
  } else {
    if (page <= 3) {
      pages.push(1, 2, 3, 4, 5)
    } else if (page >= totalPages - 2) {
      pages.push(totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
    } else {
      pages.push(page - 2, page - 1, page, page + 1, page + 2)
    }
  }
  
  return pages
}

const confirmDeleteComment = (comment: any) => {
  selectedComment.value = comment
  deleteAction.value = 'delete'
  deleteReason.value = ''
  showDeleteModal.value = true
}

const confirmRestoreComment = (comment: any) => {
  selectedComment.value = comment
  deleteAction.value = 'restore'
  showDeleteModal.value = true
}

const executeDeleteAction = async () => {
  try {
    const endpoint = deleteAction.value === 'delete'
      ? `/api/admin/comments/${selectedComment.value.id}`
      : `/api/admin/comments/${selectedComment.value.id}/restore`
    
    const method = deleteAction.value === 'delete' ? 'delete' : 'post'
    
    const response = await axios[method](endpoint, { reason: deleteReason.value })
    
    if (response.data.success) {
      alert(deleteAction.value === 'delete' ? '评论已删除' : '评论已恢复')
      showDeleteModal.value = false
      fetchComments()
    }
  } catch (error: any) {
    console.error('Failed to execute delete action:', error)
    alert(error.response?.data?.error?.message || '操作失败')
  }
}

onMounted(() => {
  fetchComments()
})
</script>