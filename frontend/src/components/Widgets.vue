<template>
  <aside class="space-y-4 xl:space-y-5">
    <!-- 搜索框 - PC 端专属 -->
    <div class="card-base p-4">
      <div class="relative">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索帖子..."
          class="w-full px-4 py-2.5 pl-10 bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:border-primary-500 dark:focus:border-primary-400 focus:ring-4 focus:ring-primary-500/20 dark:focus:ring-primary-400/20 transition-all duration-200"
          @keyup.enter="handleSearch"
        />
        <svg
          class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <button
          v-if="searchQuery"
          @click="searchQuery = ''"
          class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>

    <!-- 热门帖子 -->
    <div class="card-base p-4 xl:p-5">
      <h3 class="text-sm font-bold text-gray-900 dark:text-white mb-3 xl:mb-4 flex items-center gap-2">
        <svg class="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
        </svg>
        热门帖子
      </h3>
      <div class="space-y-2 xl:space-y-3">
        <div v-for="(post, index) in hotPosts" :key="post.id" class="group">
          <router-link :to="`/post/${post.id}`" class="block">
            <div class="flex items-start gap-2 xl:gap-3 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-gray-200/50 dark:hover:shadow-gray-900/50">
              <span class="flex-shrink-0 w-6 h-6 xl:w-7 xl:h-7 flex items-center justify-center text-xs font-bold rounded-lg transition-all duration-300 hover:scale-110" :class="getRankClass(index)">
                {{ index + 1 }}
              </span>
              <div class="flex-1 min-w-0">
                <h4 class="text-xs xl:text-sm font-bold text-gray-900 dark:text-white group-hover:text-gradient-simple transition-all duration-300 line-clamp-2 leading-relaxed">
                  {{ post.title }}
                </h4>
                <div class="mt-1 xl:mt-1.5 flex items-center gap-2 text-[10px] xl:text-xs text-gray-500 dark:text-gray-400">
                  <span class="truncate font-medium">{{ post.authorUsername }}</span>
                  <span>·</span>
                  <span class="font-medium">{{ post.viewCount }} 次浏览</span>
                </div>
              </div>
            </div>
          </router-link>
        </div>
      </div>
    </div>

    <!-- 热门话题 -->
    <div class="card-base p-4 xl:p-5">
      <h3 class="text-sm font-bold text-gray-900 dark:text-white mb-3 xl:mb-4 flex items-center gap-2">
        <svg class="w-5 h-5 text-accent-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
        热门话题
      </h3>
      <div class="flex flex-wrap gap-2">
        <span
          v-for="topic in hotTopics"
          :key="topic"
          class="inline-flex items-center px-2.5 xl:px-3 py-1 xl:py-1.5 text-xs font-bold text-accent-700 dark:text-accent-300 bg-gradient-to-r from-accent-50 to-accent-100 dark:from-accent-900/30 dark:to-accent-800/30 rounded-full border border-accent-200 dark:border-accent-700/50 hover:border-accent-300 dark:hover:border-accent-600 hover:shadow-lg hover:shadow-accent-500/20 transition-all duration-300 cursor-pointer hover:scale-105 hover:-translate-y-0.5"
        >
          #{{ topic }}
        </span>
      </div>
    </div>

    <!-- 活跃用户 -->
    <div class="card-base p-4 xl:p-5">
      <h3 class="text-sm font-bold text-gray-900 dark:text-white mb-3 xl:mb-4 flex items-center gap-2">
        <svg class="w-5 h-5 text-secondary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
        活跃用户
      </h3>
      <div class="space-y-2 xl:space-y-3">
        <div v-for="user in activeUsers" :key="user.id" class="flex items-center gap-2 xl:gap-3 p-2 xl:p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-300 group hover:scale-105 hover:shadow-lg hover:shadow-gray-200/50 dark:hover:shadow-gray-900/50">
          <div class="relative flex-shrink-0">
            <img
              :src="user.avatar || '/default-avatar.png'"
              :alt="user.username"
              class="w-9 h-9 xl:w-10 xl:h-10 rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-600 group-hover:ring-primary-400 dark:group-hover:ring-primary-500 transition-all duration-300"
            />
            <div class="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 xl:w-3 xl:h-3 bg-gradient-to-br from-green-400 to-green-500 border-2 border-white dark:border-gray-800 rounded-full shadow-sm"></div>
          </div>
          <div class="flex-1 min-w-0">
            <router-link :to="`/user/${user.username}`" class="text-xs xl:text-sm font-bold text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors block truncate">
              {{ user.username }}
            </router-link>
            <p class="text-[10px] xl:text-xs text-gray-500 dark:text-gray-400 font-medium">
              {{ user.postsCount }} 篇帖子
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- 注册推广卡片 -->
    <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-600 p-5 xl:p-6 text-white shadow-xl shadow-primary-500/40 hover:shadow-2xl hover:shadow-primary-500/50 transition-all duration-400 hover:scale-105 hover:-translate-y-0.5 group">
      <div class="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
      <div class="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400"></div>
      <div class="relative">
        <h3 class="text-lg xl:text-xl font-display font-bold mb-2">
          加入云纽
        </h3>
        <p class="text-xs xl:text-sm text-primary-100 mb-4 xl:mb-5 leading-relaxed">
          分享你的想法，与社区成员交流互动
        </p>
        <router-link
          to="/register"
          class="inline-flex items-center gap-2 px-5 xl:px-6 py-2.5 xl:py-3 text-xs xl:text-sm font-bold bg-white text-primary-600 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 hover:scale-105 active:scale-95 transition-all duration-300"
        >
          立即注册
          <svg class="w-3.5 h-3.5 xl:w-4 xl:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </router-link>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const searchQuery = ref('')

const hotPosts = ref([
  { id: '1', title: '如何使用 Cloudflare Workers 构建全栈应用', authorUsername: 'devuser', viewCount: 1234 },
  { id: '2', title: 'Vue 3 Composition 最佳实践', authorUsername: 'vuedev', viewCount: 892 },
  { id: '3', title: 'TypeScript 高级类型技巧', authorUsername: 'tsmaster', viewCount: 756 },
  { id: '4', title: '前端性能优化指南', authorUsername: 'perfexpert', viewCount: 634 },
  { id: '5', title: 'R2 对象存储使用心得', authorUsername: 'clouduser', viewCount: 521 },
])

const activeUsers = ref([
  { id: '1', username: 'devuser', avatar: '', postsCount: 45 },
  { id: '2', username: 'vuedev', avatar: '', postsCount: 38 },
  { id: '3', username: 'tsmaster', avatar: '', postsCount: 32 },
  { id: '4', username: 'perfexpert', avatar: '', postsCount: 28 },
])

const hotTopics = ref([
  '前端开发',
  'Cloudflare',
  'Vue 3',
  'TypeScript',
  '性能优化',
  'Serverless',
  'JavaScript',
  'CSS技巧',
])

function getRankClass(index: number) {
  const classes = [
    'bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-lg shadow-yellow-500/30',
    'bg-gradient-to-br from-gray-300 to-gray-400 text-gray-700 shadow-lg shadow-gray-400/30',
    'bg-gradient-to-br from-orange-300 to-orange-400 text-white shadow-lg shadow-orange-400/30',
  ]
  return classes[index] || 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
}

function handleSearch() {
  if (searchQuery.value.trim()) {
    router.push({ path: '/search', query: { q: searchQuery.value } })
  }
}
</script>