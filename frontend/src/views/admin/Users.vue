<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">用户管理</h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          管理系统用户，包括角色分配和账户状态
        </p>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div>
          <input
            v-model="search"
            type="text"
            placeholder="搜索用户名或邮箱..."
            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            @keyup.enter="fetchUsers"
          />
        </div>
        <div>
          <select
            v-model="selectedRole"
            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            @change="fetchUsers"
          >
            <option value="">所有角色</option>
            <option value="user">普通用户</option>
            <option value="moderator">审核员</option>
            <option value="admin">管理员</option>
          </select>
        </div>
        <div>
          <select
            v-model="selectedStatus"
            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            @change="fetchUsers"
          >
            <option value="all">所有状态</option>
            <option value="active">正常</option>
            <option value="deleted">已封禁</option>
          </select>
        </div>
        <div>
          <button
            @click="fetchUsers"
            class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            搜索
          </button>
        </div>
      </div>
    </div>

    <!-- Users Table -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">用户</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">角色</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">帖子数</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">评论数</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">注册时间</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">状态</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-if="loading">
              <td colspan="7" class="px-6 py-12 text-center">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              </td>
            </tr>
            <tr v-else-if="users.length === 0">
              <td colspan="7" class="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                暂无用户
              </td>
            </tr>
            <tr v-else v-for="user in users" :key="user.id">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <img
                    v-if="user.avatar"
                    :src="user.avatar"
                    :alt="user.username"
                    loading="lazy"
                    class="w-10 h-10 rounded-full"
                  />
                  <div v-else class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <span class="text-white font-semibold">
                      {{ user.username?.charAt(0).toUpperCase() }}
                    </span>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900 dark:text-white">
                      {{ user.username }}
                    </div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">
                      {{ user.email }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="px-2 py-1 text-xs font-semibold rounded-full"
                  :class="getRoleBadgeClass(user.role)"
                >
                  {{ getRoleLabel(user.role) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                {{ user.stats?.postCount || 0 }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                {{ user.stats?.commentCount || 0 }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {{ formatDate(user.created_at) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="px-2 py-1 text-xs font-semibold rounded-full"
                  :class="user.deleted_at ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'"
                >
                  {{ user.deleted_at ? '已封禁' : '正常' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex items-center justify-end space-x-2">
                  <button
                    v-if="!user.deleted_at"
                    @click="confirmBanUser(user)"
                    class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                    title="封禁用户"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                  </button>
                  <button
                    v-else
                    @click="confirmUnbanUser(user)"
                    class="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                    title="解封用户"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                  <button
                    @click="openRoleModal(user)"
                    class="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                    title="修改角色"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                  <button
                    @click="confirmDeleteUser(user)"
                    class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                    title="永久删除"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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

    <!-- Role Modal -->
    <div
      v-if="showRoleModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50"
    >
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          修改用户角色
        </h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              用户名
            </label>
            <div class="text-sm text-gray-900 dark:text-white">
              {{ selectedUser?.username }}
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              当前角色
            </label>
            <span
              class="px-2 py-1 text-xs font-semibold rounded-full"
              :class="getRoleBadgeClass(selectedUser?.role)"
            >
              {{ getRoleLabel(selectedUser?.role) }}
            </span>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              新角色
            </label>
            <select
              v-model="newRole"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="user">普通用户</option>
              <option value="moderator">审核员</option>
              <option value="admin">管理员</option>
            </select>
          </div>
        </div>
        <div class="flex justify-end space-x-3 mt-6">
          <button
            @click="showRoleModal = false"
            class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            取消
          </button>
          <button
            @click="updateUserRole"
            class="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            确认修改
          </button>
        </div>
      </div>
    </div>

    <!-- Ban Confirmation Modal -->
    <div
      v-if="showBanModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50"
    >
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {{ banAction === 'ban' ? '封禁用户' : '解封用户' }}
        </h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              用户名
            </label>
            <div class="text-sm text-gray-900 dark:text-white">
              {{ selectedUser?.username }}
            </div>
          </div>
          <div v-if="banAction === 'ban'">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              封禁原因（可选）
            </label>
            <textarea
              v-model="banReason"
              rows="3"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="请输入封禁原因..."
            ></textarea>
          </div>
        </div>
        <div class="flex justify-end space-x-3 mt-6">
          <button
            @click="showBanModal = false"
            class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            取消
          </button>
          <button
            @click="executeBanAction"
            class="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700"
          >
            {{ banAction === 'ban' ? '确认封禁' : '确认解封' }}
          </button>
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
          永久删除用户
        </h3>
        <div class="space-y-4">
          <p class="text-sm text-gray-900 dark:text-white">
            确定要永久删除用户 <strong>{{ selectedUser?.username }}</strong> 吗？
          </p>
          <p class="text-sm text-red-600 dark:text-red-400">
            此操作不可恢复，该用户的所有数据将被永久删除。
          </p>
        </div>
        <div class="flex justify-end space-x-3 mt-6">
          <button
            @click="showDeleteModal = false"
            class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            取消
          </button>
          <button
            @click="executeDeleteUser"
            class="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700"
          >
            确认删除
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'

const users = ref<any[]>([])
const loading = ref(false)
const search = ref('')
const selectedRole = ref('')
const selectedStatus = ref('all')
const pagination = ref({
  page: 1,
  pageSize: 20,
  total: 0,
  totalPages: 0,
})

// Modals
const showRoleModal = ref(false)
const showBanModal = ref(false)
const showDeleteModal = ref(false)
const selectedUser = ref<any>(null)
const newRole = ref('user')
const banAction = ref<'ban' | 'unban'>('ban')
const banReason = ref('')

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const getRoleLabel = (role?: string) => {
  const labels: Record<string, string> = {
    admin: '管理员',
    moderator: '审核员',
    user: '普通用户',
  }
  return labels[role || 'user'] || '普通用户'
}

const getRoleBadgeClass = (role?: string) => {
  const classes: Record<string, string> = {
    admin: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    moderator: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    user: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  }
  return classes[role || 'user'] || classes.user
}

const fetchUsers = async () => {
  loading.value = true
  try {
    const response = await axios.get('/api/admin/users', {
      params: {
        page: pagination.value.page,
        pageSize: pagination.value.pageSize,
        search: search.value,
        role: selectedRole.value,
        status: selectedStatus.value,
      },
    })
    if (response.data.success) {
      users.value = response.data.data.users
      pagination.value = response.data.data.pagination
    }
  } catch (error: any) {
    console.error('Failed to fetch users:', error)
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
    fetchUsers()
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

const openRoleModal = (user: any) => {
  selectedUser.value = user
  newRole.value = user.role
  showRoleModal.value = true
}

const updateUserRole = async () => {
  try {
    const response = await axios.put(`/api/admin/users/${selectedUser.value.id}/role`, {
      role: newRole.value,
    })
    if (response.data.success) {
      alert('角色修改成功')
      showRoleModal.value = false
      fetchUsers()
    }
  } catch (error: any) {
    console.error('Failed to update user role:', error)
    alert(error.response?.data?.error?.message || '修改失败')
  }
}

const confirmBanUser = (user: any) => {
  selectedUser.value = user
  banAction.value = 'ban'
  banReason.value = ''
  showBanModal.value = true
}

const confirmUnbanUser = (user: any) => {
  selectedUser.value = user
  banAction.value = 'unban'
  showBanModal.value = true
}

const executeBanAction = async () => {
  try {
    const endpoint = banAction.value === 'ban'
      ? `/api/admin/users/${selectedUser.value.id}/ban`
      : `/api/admin/users/${selectedUser.value.id}/unban`
    
    const response = await axios.post(endpoint, { reason: banReason.value })
    
    if (response.data.success) {
      alert(banAction.value === 'ban' ? '用户已封禁' : '用户已解封')
      showBanModal.value = false
      fetchUsers()
    }
  } catch (error: any) {
    console.error('Failed to execute ban action:', error)
    alert(error.response?.data?.error?.message || '操作失败')
  }
}

const confirmDeleteUser = (user: any) => {
  selectedUser.value = user
  showDeleteModal.value = true
}

const executeDeleteUser = async () => {
  try {
    const response = await axios.delete(`/api/admin/users/${selectedUser.value.id}`)
    
    if (response.data.success) {
      alert('用户已永久删除')
      showDeleteModal.value = false
      fetchUsers()
    }
  } catch (error: any) {
    console.error('Failed to delete user:', error)
    alert(error.response?.data?.error?.message || '删除失败')
  }
}

onMounted(() => {
  fetchUsers()
})
</script>