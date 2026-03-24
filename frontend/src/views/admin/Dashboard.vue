<template>
  <div class="space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">仪表盘</h1>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
        系统概览和统计数据
      </p>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <!-- Users Card -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
          <div class="ml-5 flex-1">
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">总用户数</p>
            <p class="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
              {{ stats?.users?.total || 0 }}
            </p>
            <p class="mt-1 text-xs text-green-600 dark:text-green-400">
              +{{ stats?.users?.last7days || 0 }} 本周新增
            </p>
          </div>
        </div>
      </div>

      <!-- Posts Card -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          <div class="ml-5 flex-1">
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">总帖子数</p>
            <p class="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
              {{ stats?.posts?.total || 0 }}
            </p>
            <p class="mt-1 text-xs text-green-600 dark:text-green-400">
              +{{ stats?.posts?.last7days || 0 }} 本周新增
            </p>
          </div>
        </div>
      </div>

      <!-- Comments Card -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
          </div>
          <div class="ml-5 flex-1">
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">总评论数</p>
            <p class="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
              {{ stats?.comments?.total || 0 }}
            </p>
            <p class="mt-1 text-xs text-green-600 dark:text-green-400">
              +{{ stats?.comments?.last7days || 0 }} 本周新增
            </p>
          </div>
        </div>
      </div>

      <!-- Categories Card -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
          </div>
          <div class="ml-5 flex-1">
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">分类数量</p>
            <p class="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
              {{ stats?.categories?.total || 0 }}
            </p>
            <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
              活跃分类
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Charts and Recent Activity -->
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <!-- Trend Chart -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">近30天趋势</h3>
        <div v-if="loadingTrends" class="flex items-center justify-center h-64">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
        <div v-else-if="trends" class="h-64">
          <div class="flex items-end h-48 space-x-2">
            <div
              v-for="(value, index) in trends.users"
              :key="index"
              class="flex-1 flex flex-col items-center"
            >
              <div
                class="w-full bg-blue-500 rounded-t-sm transition-all duration-300 hover:bg-blue-600"
                :style="{ height: `${Math.max((value / Math.max(...trends.users)) * 100, 5)}%` }"
                :title="`用户: ${value}`"
              ></div>
              <span class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {{ new Date(trends.dates[index]).toLocaleDateString('zh-CN').slice(5) }}
              </span>
            </div>
          </div>
          <div class="flex items-center justify-center mt-4 space-x-6">
            <div class="flex items-center">
              <div class="w-3 h-3 bg-blue-500 rounded-sm mr-2"></div>
              <span class="text-sm text-gray-600 dark:text-gray-400">用户</span>
            </div>
            <div class="flex items-center">
              <div class="w-3 h-3 bg-purple-500 rounded-sm mr-2"></div>
              <span class="text-sm text-gray-600 dark:text-gray-400">帖子</span>
            </div>
            <div class="flex items-center">
              <div class="w-3 h-3 bg-green-500 rounded-sm mr-2"></div>
              <span class="text-sm text-gray-600 dark:text-gray-400">评论</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">最近活动</h3>
        <div v-if="loadingActivity" class="flex items-center justify-center h-64">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
        <div v-else-if="recentActivity" class="space-y-4 h-64 overflow-y-auto">
          <!-- New Users -->
          <div v-for="user in recentActivity.users?.slice(0, 5)" :key="user.id" class="flex items-start">
            <div class="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <svg class="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div class="ml-3 flex-1">
              <p class="text-sm text-gray-900 dark:text-white">
                <span class="font-medium">{{ user.username }}</span> 加入了社区
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {{ formatDate(user.created_at) }}
              </p>
            </div>
          </div>
          <!-- New Posts -->
          <div v-for="post in recentActivity.posts?.slice(0, 5)" :key="post.id" class="flex items-start">
            <div class="flex-shrink-0 w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
              <svg class="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div class="ml-3 flex-1">
              <p class="text-sm text-gray-900 dark:text-white">
                <span class="font-medium">{{ post.author_username }}</span> 发布了新帖
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                {{ post.title }}
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {{ formatDate(post.created_at) }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Popular Content -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">热门内容</h3>
      <div v-if="loadingPopular" class="flex items-center justify-center h-32">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
      <div v-else-if="popularContent" class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">帖子</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">作者</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">浏览</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">点赞</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">评论</th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="post in popularContent.popularPostsByViews?.slice(0, 5)" :key="post.id">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900 dark:text-white truncate max-w-xs">
                  {{ post.title }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-500 dark:text-gray-400">
                  {{ post.author_username }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900 dark:text-white">
                  {{ post.view_count }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900 dark:text-white">
                  {{ post.like_count }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900 dark:text-white">
                  {{ post.comment_count }}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'

const stats = ref<any>(null)
const trends = ref<any>(null)
const recentActivity = ref<any>(null)
const popularContent = ref<any>(null)

const loadingStats = ref(false)
const loadingTrends = ref(false)
const loadingActivity = ref(false)
const loadingPopular = ref(false)

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes} 分钟前`
  if (hours < 24) return `${hours} 小时前`
  if (days < 7) return `${days} 天前`
  return date.toLocaleDateString('zh-CN')
}

const fetchStats = async () => {
  loadingStats.value = true
  try {
    const response = await axios.get('/api/admin/stats')
    if (response.data.success) {
      stats.value = response.data.data
    }
  } catch (error) {
    console.error('Failed to fetch stats:', error)
  } finally {
    loadingStats.value = false
  }
}

const fetchTrends = async () => {
  loadingTrends.value = true
  try {
    const response = await axios.get('/api/admin/stats/trends?days=30')
    if (response.data.success) {
      trends.value = response.data.data
    }
  } catch (error) {
    console.error('Failed to fetch trends:', error)
  } finally {
    loadingTrends.value = false
  }
}

const fetchRecentActivity = async () => {
  loadingActivity.value = true
  try {
    const response = await axios.get('/api/admin/stats/recent-activity?limit=10')
    if (response.data.success) {
      recentActivity.value = response.data.data
    }
  } catch (error) {
    console.error('Failed to fetch recent activity:', error)
  } finally {
    loadingActivity.value = false
  }
}

const fetchPopularContent = async () => {
  loadingPopular.value = true
  try {
    const response = await axios.get('/api/admin/stats/popular?limit=10')
    if (response.data.success) {
      popularContent.value = response.data.data
    }
  } catch (error) {
    console.error('Failed to fetch popular content:', error)
  } finally {
    loadingPopular.value = false
  }
}

onMounted(() => {
  fetchStats()
  fetchTrends()
  fetchRecentActivity()
  fetchPopularContent()
})
</script>