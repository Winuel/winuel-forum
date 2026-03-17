<template>
  <aside class="space-y-5">
    <div class="card-base p-5">
      <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <svg class="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
        </svg>
        热门帖子
      </h3>
      <div class="space-y-3">
        <div v-for="(post, index) in hotPosts" :key="post.id" class="group">
          <router-link :to="`/post/${post.id}`" class="block">
            <div class="flex items-start gap-3">
              <span class="flex-shrink-0 w-6 h-6 flex items-center justify-center text-xs font-bold rounded-lg" :class="getRankClass(index)">
                {{ index + 1 }}
              </span>
              <div class="flex-1 min-w-0">
                <h4 class="text-sm font-medium text-gray-900 dark:text-white group-hover:text-gradient transition-all duration-200 line-clamp-2 leading-relaxed">
                  {{ post.title }}
                </h4>
                <div class="mt-1.5 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <span class="truncate">{{ post.authorUsername }}</span>
                  <span>·</span>
                  <span>{{ post.viewCount }} 次浏览</span>
                </div>
              </div>
            </div>
          </router-link>
        </div>
      </div>
    </div>

    <div class="card-base p-5">
      <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <svg class="w-5 h-5 text-secondary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
        活跃用户
      </h3>
      <div class="space-y-3">
        <div v-for="user in activeUsers" :key="user.id" class="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200 group">
          <div class="relative flex-shrink-0">
            <img
              :src="user.avatar || '/default-avatar.png'"
              :alt="user.username"
              class="w-10 h-10 rounded-full object-cover ring-2 ring-gray-100 dark:ring-gray-600 group-hover:ring-primary-300 dark:group-hover:ring-primary-600 transition-all duration-300"
            />
            <div class="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
          </div>
          <div class="flex-1 min-w-0">
            <router-link :to="`/user/${user.username}`" class="text-sm font-medium text-gray-900 dark:text-white hover:text-primary-500 dark:hover:text-primary-400 transition-colors block truncate">
              {{ user.username }}
            </router-link>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              {{ user.postsCount }} 篇帖子
            </p>
          </div>
        </div>
      </div>
    </div>

    <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-600 p-6 text-white shadow-lg shadow-primary-500/30">
      <div class="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
      <div class="relative">
        <h3 class="text-lg font-display font-bold mb-2">
          加入云纽
        </h3>
        <p class="text-sm text-primary-100 mb-4 leading-relaxed">
          分享你的想法，与社区成员交流互动
        </p>
        <router-link
          to="/register"
          class="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-white text-primary-600 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95 transition-all duration-300"
        >
          立即注册
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </router-link>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref } from 'vue'

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

function getRankClass(index: number) {
  const classes = [
    'bg-gradient-to-br from-yellow-400 to-orange-500 text-white',
    'bg-gradient-to-br from-gray-300 to-gray-400 text-gray-700',
    'bg-gradient-to-br from-orange-300 to-orange-400 text-white',
  ]
  return classes[index] || 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
}
</script>