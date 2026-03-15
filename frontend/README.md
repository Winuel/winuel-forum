# 云纽论坛 - 前端文档

<div align="center">

![CloudLink Frontend](https://img.shields.io/badge/CloudLink-Frontend-4FC08D)
![Vue](https://img.shields.io/badge/Vue-3.5.30-4FC08D)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-3178C6)
![Vite](https://img.shields.io/badge/Vite-8.0.0-646CFF)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4.17-38B2AC)

</div>

## 📋 目录

- [概述](#概述)
- [技术栈](#技术栈)
- [项目结构](#项目结构)
- [快速开始](#快速开始)
- [环境配置](#环境配置)
- [组件说明](#组件说明)
- [状态管理](#状态管理)
- [路由配置](#路由配置)
- [API 封装](#api-封装)
- [样式系统](#样式系统)
- [构建部署](#构建部署)
- [开发指南](#开发指南)

## 概述

云纽论坛前端基于 Vue 3 和 TypeScript 构建，使用 Vite 作为构建工具，提供现代化的用户界面和优秀的用户体验。采用组件化设计和响应式布局，支持深色/浅色主题切换。

### 主要特性

- 🎨 **现代化 UI**：简洁美观的界面设计
- 📱 **响应式设计**：完美适配各种设备
- 🌓 **主题切换**：支持深色/浅色主题
- ⚡ **高性能**：优化的加载和渲染
- 🔒 **类型安全**：完整的 TypeScript 类型定义
- 🧩 **组件化**：高度模块化的组件设计
- 🚀 **快速开发**：Vite 提供的开发体验

## 技术栈

| 技术 | 版本 | 说明 |
|------|------|------|
| Vue | 3.5.30 | 渐进式 JavaScript 框架 |
| TypeScript | 5.9.3 | JavaScript 的超集，提供类型安全 |
| Vite | 8.0.0 | 下一代前端构建工具 |
| Pinia | 3.0.4 | Vue 官方状态管理库 |
| Vue Router | 5.0.3 | Vue 官方路由管理器 |
| TailwindCSS | 3.4.17 | 原子化 CSS 框架 |

## 项目结构

```
frontend/
├── src/
│   ├── api/              # API 封装
│   │   ├── client.ts     # 基础 API 客户端
│   │   ├── auth.ts       # 认证 API
│   │   ├── posts.ts      # 帖子 API
│   │   └── upload.ts     # 上传 API
│   ├── assets/           # 静态资源
│   │   ├── hero.png      # 英雄图片
│   │   ├── vite.svg      # Vite 图标
│   │   └── vue.svg       # Vue 图标
│   ├── components/       # 组件
│   │   ├── Header.vue    # 顶部导航栏
│   │   ├── Footer.vue    # 页脚
│   │   ├── Sidebar.vue   # 侧边栏
│   │   ├── Widgets.vue   # 小工具组件
│   │   ├── PostCard.vue  # 帖子卡片
│   │   ├── CommentForm.vue # 评论表单
│   │   ├── CommentItem.vue # 评论项
│   │   ├── CommentList.vue # 评论列表
│   │   └── NotificationContainer.vue # 通知容器
│   ├── composables/      # 组合式函数
│   ├── layouts/          # 布局组件
│   │   └── MainLayout.vue # 主布局
│   ├── pages/            # 页面组件
│   │   ├── HomePage.vue  # 首页
│   │   ├── PostDetailPage.vue # 帖子详情
│   │   ├── CreatePostPage.vue # 创建帖子
│   │   ├── EditPostPage.vue # 编辑帖子
│   │   ├── CategoryPage.vue # 分类页面
│   │   ├── UserProfilePage.vue # 用户资料
│   │   ├── LoginPage.vue # 登录页
│   │   ├── RegisterPage.vue # 注册页
│   │   ├── SettingsPage.vue # 设置页
│   │   └── NotFoundPage.vue # 404 页面
│   ├── router/           # 路由配置
│   │   └── index.ts      # 路由定义
│   ├── stores/           # Pinia 状态管理
│   │   ├── user.ts       # 用户状态
│   │   ├── post.ts       # 帖子状态
│   │   └── ui.ts         # UI 状态
│   ├── styles/           # 全局样式
│   ├── utils/            # 工具函数
│   ├── App.vue           # 根组件
│   └── main.ts           # 入口文件
├── public/               # 公共资源
│   ├── favicon.svg       # 网站图标
│   └── icons.svg         # 图标资源
├── index.html            # HTML 模板
├── package.json          # 依赖配置
├── vite.config.ts        # Vite 配置
├── tailwind.config.js    # TailwindCSS 配置
├── tsconfig.json         # TypeScript 配置
└── .env.development      # 开发环境变量
```

## 快速开始

### 前置要求

- Node.js >= 18.0.0
- npm >= 9.0.0

### 安装依赖

```bash
npm install
```

### 本地开发

```bash
npm run dev
```

应用将在 `http://localhost:5173` 启动。

### 生产构建

```bash
npm run build
```

构建产物将输出到 `dist` 目录。

### 预览构建

```bash
npm run preview
```

## 环境配置

### 开发环境变量 (.env.development)

```env
VITE_API_BASE_URL=http://localhost:8787
```

### 生产环境变量 (.env.production)

```env
VITE_API_BASE_URL=https://cloudlink-backend.lemonhub.workers.dev
```

### 使用环境变量

```typescript
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL
```

## 组件说明

### 布局组件

#### MainLayout.vue

主布局组件，包含 Header、Sidebar、Footer 和内容区域。

```vue
<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <Header />
    <div class="flex">
      <Sidebar />
      <main class="flex-1 p-6">
        <slot />
      </main>
    </div>
    <Footer />
  </div>
</template>
```

### 页面组件

#### HomePage.vue

首页，显示帖子列表。

**主要功能：**
- 显示帖子列表
- 分页加载
- 分类筛选
- 搜索功能

#### PostDetailPage.vue

帖子详情页。

**主要功能：**
- 显示帖子内容
- 评论列表
- 发表评论
- 点赞功能

#### LoginPage.vue / RegisterPage.vue

登录和注册页面。

**主要功能：**
- 表单验证
- 错误提示
- 自动登录

### 功能组件

#### PostCard.vue

帖子卡片组件，用于显示帖子摘要。

```vue
<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow">
    <!-- 帖子内容 -->
  </div>
</template>
```

#### CommentForm.vue

评论表单组件。

```vue
<template>
  <form @submit.prevent="handleSubmit">
    <textarea v-model="content" />
    <button type="submit">发表评论</button>
  </form>
</template>
```

## 状态管理

### userStore（用户状态）

```typescript
interface User {
  id: string
  username: string
  email: string
  avatar?: string
  role: 'user' | 'admin' | 'moderator'
  createdAt: string
}

interface UserState {
  user: User | null
  token: string | null
  isAuthenticated: ComputedRef<boolean>
  isAdmin: ComputedRef<boolean>
  isModerator: ComputedRef<boolean>
}
```

**主要方法：**
- `setUser(userData)` - 设置用户信息
- `setToken(token)` - 设置令牌
- `logout()` - 退出登录
- `loadFromStorage()` - 从本地存储加载

### postStore（帖子状态）

```typescript
interface PostState {
  posts: Post[]
  currentPost: Post | null
  loading: boolean
  error: string | null
}
```

**主要方法：**
- `setPosts(posts)` - 设置帖子列表
- `setCurrentPost(post)` - 设置当前帖子
- `addPost(post)` - 添加帖子
- `updatePost(post)` - 更新帖子
- `deletePost(id)` - 删除帖子

### uiStore（UI 状态）

```typescript
interface UIState {
  theme: 'light' | 'dark'
  sidebarOpen: boolean
  notifications: Notification[]
}
```

**主要方法：**
- `toggleTheme()` - 切换主题
- `toggleSidebar()` - 切换侧边栏
- `addNotification(notification)` - 添加通知
- `removeNotification(id)` - 移除通知

## 路由配置

### 路由定义

```typescript
const routes = [
  { path: '/', component: HomePage },
  { path: '/post/:id', component: PostDetailPage },
  { path: '/post/create', component: CreatePostPage, meta: { requiresAuth: true } },
  { path: '/post/:id/edit', component: EditPostPage, meta: { requiresAuth: true } },
  { path: '/category/:id', component: CategoryPage },
  { path: '/user/:username', component: UserProfilePage },
  { path: '/login', component: LoginPage },
  { path: '/register', component: RegisterPage },
  { path: '/settings', component: SettingsPage, meta: { requiresAuth: true } },
  { path: '/:pathMatch(.*)*', component: NotFoundPage }
]
```

### 路由守卫

```typescript
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  
  if (to.meta.requiresAuth && !userStore.isAuthenticated) {
    next('/login')
  } else {
    next()
  }
})
```

## API 封装

### ApiClient

基础 API 客户端，处理 HTTP 请求。

```typescript
class ApiClient {
  async get<T>(endpoint: string): Promise<T>
  async post<T>(endpoint: string, data: unknown): Promise<T>
  async put<T>(endpoint: string, data: unknown): Promise<T>
  async delete<T>(endpoint: string): Promise<T>
  async upload<T>(endpoint: string, file: File): Promise<T>
}
```

### API 模块

#### auth.ts

```typescript
export function login(email: string, password: string)
export function register(username: string, email: string, password: string)
export function getCurrentUser()
export function logout()
```

#### posts.ts

```typescript
export function getPosts(params?: GetPostsParams)
export function getPost(id: string)
export function createPost(data: CreatePostInput)
export function updatePost(id: string, data: UpdatePostInput)
export function deletePost(id: string)
export function likePost(id: string)
export function getComments(postId: string)
```

## 样式系统

### TailwindCSS 配置

```javascript
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          // ... 更多颜色
        }
      }
    }
  }
}
```

### 自定义样式

```css
/* 全局样式 */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* 自定义组件样式 */
.btn-primary {
  @apply px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600;
}
```

### 主题切换

```typescript
// 切换主题
function toggleTheme() {
  document.documentElement.classList.toggle('dark')
}
```

## 构建部署

### 本地构建

```bash
npm run build
```

### 生产部署

将 `dist` 目录部署到任何静态托管服务：

- Cloudflare Pages
- Vercel
- Netlify
- GitHub Pages

### 环境变量

确保在生产环境中设置正确的 `VITE_API_BASE_URL`。

## 开发指南

### 代码规范

- 使用 TypeScript 严格模式
- 遵循 ESLint 和 Prettier 配置
- 使用 Vue 3 组合式 API
- 组件命名使用 PascalCase
- 文件命名使用 kebab-case

### 组件开发

#### 创建新组件

```vue
<template>
  <div class="my-component">
    <!-- 模板内容 -->
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

// 组件逻辑
</script>

<style scoped>
/* 组件样式 */
</style>
```

#### 组件通信

**Props：**
```typescript
const props = defineProps<{
  title: string
  count: number
}>()
```

**Emits：**
```typescript
const emit = defineEmits<{
  update: [value: string]
  delete: [id: string]
}>()
```

### 组合式函数

创建可复用的逻辑：

```typescript
// composables/useAuth.ts
export function useAuth() {
  const userStore = useUserStore()
  
  function login(email: string, password: string) {
    // 登录逻辑
  }
  
  return {
    login,
    logout: userStore.logout
  }
}
```

### 类型定义

```typescript
// types/index.ts
export interface Post {
  id: string
  title: string
  content: string
  author: User
  createdAt: string
}

export interface User {
  id: string
  username: string
  email: string
}
```

## 性能优化

### 代码分割

```typescript
// 路由懒加载
const HomePage = () => import('./pages/HomePage.vue')
const PostDetailPage = () => import('./pages/PostDetailPage.vue')
```

### 图片优化

```vue
<template>
  <img 
    :src="imageUrl" 
    :alt="alt"
    loading="lazy"
    class="lazy-image"
  />
</template>
```

### 缓存策略

```typescript
// API 响应缓存
const cache = new Map()

async function fetchWithCache(url: string) {
  if (cache.has(url)) {
    return cache.get(url)
  }
  const data = await fetch(url)
  cache.set(url, data)
  return data
}
```

## 测试

### 单元测试

```bash
npm run test
```

### 组件测试

```typescript
import { mount } from '@vue/test-utils'
import PostCard from './PostCard.vue'

test('renders post card', () => {
  const wrapper = mount(PostCard, {
    props: {
      post: {
        id: '1',
        title: 'Test Post',
        content: 'Test content'
      }
    }
  })
  expect(wrapper.text()).toContain('Test Post')
})
```

## 故障排查

### 常见问题

**Q: 开发服务器启动失败**
```bash
A: 检查端口是否被占用，尝试使用其他端口
```

**Q: API 请求失败**
```bash
A: 检查环境变量配置和后端服务是否正常运行
```

**Q: 样式不生效**
```bash
A: 确保 TailwindCSS 配置正确，重启开发服务器
```

### 调试技巧

1. 使用 Vue DevTools
2. 查看浏览器控制台
3. 检查网络请求
4. 使用 TypeScript 类型检查

## 贡献指南

欢迎贡献代码！请遵循以下步骤：

1. Fork 本仓库
2. 创建特性分支
3. 遵循代码规范
4. 编写测试
5. 提交 Pull Request

## 许可证

MIT License

---

**CloudLink Frontend Team** © 2026