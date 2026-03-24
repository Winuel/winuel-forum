<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">审计日志</h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          查看系统操作记录
        </p>
      </div>
      <button
        @click="exportLogs"
        class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
      >
        导出日志
      </button>
    </div>

    <!-- Filters -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
        <div>
          <input
            v-model="search"
            type="text"
            placeholder="搜索操作..."
            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            @keyup.enter="fetchLogs"
          />
        </div>
        <div>
          <select
            v-model="selectedEntityType"
            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            @change="fetchLogs"
          >
            <option value="">所有实体类型</option>
            <option value="user">用户</option>
            <option value="post">帖子</option>
            <option value="comment">评论</option>
          </select>
        </div>
        <div>
          <select
            v-model="selectedUserId"
            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            @change="fetchLogs"
          >
            <option value="">所有用户</option>
            <option v-for="user in users" :key="user.id" :value="user.id">
              {{ user.username }}
            </option>
          </select>
        </div>
        <div>
          <input
            v-model="startDate"
            type="date"
            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            @change="fetchLogs"
          />
        </div>
        <div>
          <input
            v-model="endDate"
            type="date"
            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            @change="fetchLogs"
          />
        </div>
        <div>
          <button
            @click="fetchLogs"
            class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            搜索
          </button>
        </div>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
          <div class="ml-5 flex-1">
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">总操作数</p>
            <p class="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
              {{ stats?.totalOperations || 0 }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Logs Table -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">时间</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">操作人</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">动作</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">实体类型</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">实体ID</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">详情</th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-if="loading">
              <td colspan="6" class="px-6 py-12 text-center">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              </td>
            </tr>
            <tr v-else-if="logs.length === 0">
              <td colspan="6" class="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                暂无日志
              </td>
            </tr>
            <tr v-else v-for="log in logs" :key="log.id">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {{ formatDate(log.created_at) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <span class="text-sm text-gray-900 dark:text-white">
                    {{ log.user_username || 'N/A' }}
                  </span>
                  <span
                    v-if="log.user_role"
                    class="ml-2 px-2 py-0.5 text-xs font-semibold rounded-full"
                    :class="getRoleBadgeClass(log.user_role)"
                  >
                    {{ getRoleLabel(log.user_role) }}
                  </span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="px-2 py-1 text-xs font-medium rounded-full"
                  :class="getActionBadgeClass(log.action)"
                >
                  {{ getActionLabel(log.action) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full dark:bg-gray-700 dark:text-gray-300">
                  {{ log.entity_type }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                {{ log.entity_id || 'N/A' }}
              </td>
              <td class="px-6 py-4">
                <button
                  @click="showLogDetail(log)"
                  class="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  查看详情
                </button>
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

    <!-- Log Detail Modal -->
    <div
      v-if="showDetailModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50"
    >
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          日志详情
        </h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              时间
            </label>
            <div class="text-sm text-gray-900 dark:text-white">
              {{ formatDate(selectedLog?.created_at) }}
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              操作人
            </label>
            <div class="text-sm text-gray-900 dark:text-white">
              {{ selectedLog?.user_username || 'N/A' }}
              <span
                v-if="selectedLog?.user_role"
                class="ml-2 px-2 py-0.5 text-xs font-semibold rounded-full"
                :class="getRoleBadgeClass(selectedLog.user_role)"
              >
                {{ getRoleLabel(selectedLog.user_role) }}
              </span>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              动作
            </label>
            <span
              class="px-2 py-1 text-xs font-medium rounded-full"
              :class="getActionBadgeClass(selectedLog?.action)"
            >
              {{ getActionLabel(selectedLog?.action) }}
            </span>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              实体类型
            </label>
            <span class="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full dark:bg-gray-700 dark:text-gray-300">
              {{ selectedLog?.entity_type }}
            </span>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              实体ID
            </label>
            <div class="text-sm text-gray-900 dark:text-white">
              {{ selectedLog?.entity_id || 'N/A' }}
            </div>
          </div>
          <div v-if="selectedLog?.old_values">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              旧值
            </label>
            <pre class="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg text-xs overflow-x-auto dark:text-gray-300">{{ JSON.stringify(selectedLog.old_values, null, 2) }}</pre>
          </div>
          <div v-if="selectedLog?.new_values">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              新值
            </label>
            <pre class="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg text-xs overflow-x-auto dark:text-gray-300">{{ JSON.stringify(selectedLog.new_values, null, 2) }}</pre>
          </div>
        </div>
        <div class="flex justify-end mt-6">
          <button
            @click="showDetailModal = false"
            class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'

const logs = ref<any[]>([])
const users = ref<any[]>([])
const stats = ref<any>(null)
const loading = ref(false)
const search = ref('')
const selectedEntityType = ref('')
const selectedUserId = ref('')
const startDate = ref('')
const endDate = ref('')
const pagination = ref({
  page: 1,
  pageSize: 20,
  total: 0,
  totalPages: 0,
})

// Modals
const showDetailModal = ref(false)
const selectedLog = ref<any>(null)

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

const getRoleLabel = (role: string) => {
  const labels: Record<string, string> = {
    admin: '管理员',
    moderator: '审核员',
    user: '普通用户',
  }
  return labels[role] || role
}

const getRoleBadgeClass = (role: string) => {
  const classes: Record<string, string> = {
    admin: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    moderator: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    user: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  }
  return classes[role] || 'bg-gray-100 text-gray-800'
}

const getActionLabel = (action: string) => {
  const labels: Record<string, string> = {
    'user.ban': '封禁用户',
    'user.unban': '解封用户',
    'user.delete': '删除用户',
    'user.update_role': '修改角色',
    'post.delete': '删除帖子',
    'post.restore': '恢复帖子',
    'post.pin': '置顶帖子',
    'post.unpin': '取消置顶',
    'post.pinned_reorder': '调整置顶顺序',
    'comment.delete': '删除评论',
    'comment.restore': '恢复评论',
    'comment.batch_delete': '批量删除评论',
  }
  return labels[action] || action
}

const getActionBadgeClass = (action: string) => {
  if (action.includes('delete') || action.includes('ban')) {
    return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
  }
  if (action.includes('restore') || action.includes('unban')) {
    return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
  }
  if (action.includes('pin') || action.includes('update')) {
    return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
  }
  return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
}

const fetchLogs = async () => {
  loading.value = true
  try {
    const response = await axios.get('/api/admin/audit-logs', {
      params: {
        page: pagination.value.page,
        pageSize: pagination.value.pageSize,
        action: search.value,
        entityType: selectedEntityType.value,
        userId: selectedUserId.value,
        startDate: startDate.value,
        endDate: endDate.value,
      },
    })
    if (response.data.success) {
      logs.value = response.data.data.logs
      pagination.value = response.data.data.pagination
    }
  } catch (error: any) {
    console.error('Failed to fetch logs:', error)
    if (error.response?.status === 403) {
      alert('权限不足')
    }
  } finally {
    loading.value = false
  }
}

const fetchUsers = async () => {
  try {
    const response = await axios.get('/api/admin/users', {
      params: { pageSize: 100 },
    })
    if (response.data.success) {
      users.value = response.data.data.users
    }
  } catch (error) {
    console.error('Failed to fetch users:', error)
  }
}

const fetchStats = async () => {
  try {
    const response = await axios.get('/api/admin/audit-logs/stats')
    if (response.data.success) {
      stats.value = response.data.data
    }
  } catch (error) {
    console.error('Failed to fetch stats:', error)
  }
}

const changePage = (page: number) => {
  if (page >= 1 && page <= pagination.value.totalPages) {
    pagination.value.page = page
    fetchLogs()
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

const showLogDetail = (log: any) => {
  selectedLog.value = log
  showDetailModal.value = true
}

const exportLogs = async () => {
  try {
    const response = await axios.get('/api/admin/audit-logs/export', {
      params: {
        action: search.value,
        entityType: selectedEntityType.value,
        userId: selectedUserId.value,
        startDate: startDate.value,
        endDate: endDate.value,
      },
      responseType: 'blob',
    })
    
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `audit-logs-${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    link.remove()
  } catch (error) {
    console.error('Failed to export logs:', error)
    alert('导出失败')
  }
}

onMounted(() => {
  fetchLogs()
  fetchUsers()
  fetchStats()
})
</script>