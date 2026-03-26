# Winuel Forum - Frontend Documentation / 云纽论坛 - 前端文档

<div align="center">

![Winuel Frontend](https://img.shields.io/badge/Winuel-Frontend-4FC08D)
![Vue](https://img.shields.io/badge/Vue-3.5.30-4FC08D)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-3178C6)
![Vite](https://img.shields.io/badge/Vite-8.0.0-646CFF)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4.17-38B2AC)

</div>

## 📋 Table of Contents / 目录

- [Overview / 概述](#概述)
- [Tech Stack / 技术栈](#技术栈)
- [Project Structure / 项目结构](#项目结构)
- [Quick Start / 快速开始](#快速开始)
- [Environment Configuration / 环境配置](#环境配置)
- [Components / 组件说明](#组件说明)
- [State Management / 状态管理](#状态管理)
- [Routing / 路由配置](#路由配置)
- [API Wrapper / API 封装](#api-封装)
- [Styling / 样式系统](#样式系统)
- [Build & Deploy / 构建部署](#构建部署)
- [Development Guide / 开发指南](#开发指南)

## Overview / 概述

Winuel Forum frontend is built on Vue 3 and TypeScript, using Vite as the build tool, providing a modern user interface and excellent user experience. It features component-based design and responsive layout, supporting dark/light theme switching.
云纽论坛前端基于 Vue 3 和 TypeScript 构建，使用 Vite 作为构建工具，提供现代化的用户界面和优秀的用户体验。采用组件化设计和响应式布局，支持深色/浅色主题切换。

### Key Features / 主要特性

- 🎨 **Modern UI / 现代化 UI**: Clean and beautiful interface design / 简洁美观的界面设计
- 📱 **Responsive Design / 响应式设计**: Perfect adaptation to various devices / 完美适配各种设备
- 🌓 **Theme Switching / 主题切换**: Support for dark/light themes / 支持深色/浅色主题
- ⚡ **High Performance / 高性能**: Optimized loading and rendering / 优化的加载和渲染
- 🔒 **Type Safety / 类型安全**: Complete TypeScript type definitions / 完整的 TypeScript 类型定义
- 🧩 **Component-Based / 组件化**: Highly modular component design / 高度模块化的组件设计
- 🚀 **Fast Development / 快速开发**: Vite-powered development experience / Vite 提供的开发体验

## Tech Stack / 技术栈

| Technology / 技术 | Version / 版本 | Description / 说明 |
|-------------------|----------------|-------------------|
| Vue | 3.5.30 | Progressive JavaScript Framework / 渐进式 JavaScript 框架 |
| TypeScript | 5.9.3 | JavaScript superset with type safety / JavaScript 的超集，提供类型安全 |
| Vite | 8.0.0 | Next-generation frontend build tool / 下一代前端构建工具 |
| Pinia | 3.0.4 | Vue official state management library / Vue 官方状态管理库 |
| Vue Router | 5.0.3 | Vue official router / Vue 官方路由管理器 |
| TailwindCSS | 3.4.17 | Atomic CSS framework / 原子化 CSS 框架 |

## Project Structure / 项目结构

```
frontend/
├── src/
│   ├── api/              # API wrapper / API 封装
│   │   ├── client.ts     # Base API client / 基础 API 客户端
│   │   ├── auth.ts       # Auth API / 认证 API
│   │   ├── posts.ts      # Posts API / 帖子 API
│   │   └── upload.ts     # Upload API / 上传 API
│   ├── assets/           # Static resources / 静态资源
│   │   ├── hero.png      # Hero image / 英雄图片
│   │   ├── vite.svg      # Vite icon / Vite 图标
│   │   └── vue.svg       # Vue icon / Vue 图标
│   ├── components/       # Components / 组件
│   │   ├── Header.vue    # Top navigation bar / 顶部导航栏
│   │   ├── Footer.vue    # Footer / 页脚
│   │   ├── Sidebar.vue   # Sidebar / 侧边栏
│   │   ├── Widgets.vue   # Widget components / 小工具组件
│   │   ├── PostCard.vue  # Post card / 帖子卡片
│   │   ├── CommentForm.vue # Comment form / 评论表单
│   │   ├── CommentItem.vue # Comment item / 评论项
│   │   ├── CommentList.vue # Comment list / 评论列表
│   │   └── NotificationContainer.vue # Notification container / 通知容器
│   ├── composables/      # Composable functions / 组合式函数
│   ├── layouts/          # Layout components / 布局组件
│   │   └── MainLayout.vue # Main layout / 主布局
│   ├── pages/            # Page components / 页面组件
│   │   ├── HomePage.vue  # Home page / 首页
│   │   ├── PostDetailPage.vue # Post detail / 帖子详情
│   │   ├── CreatePostPage.vue # Create post / 创建帖子
│   │   ├── EditPostPage.vue # Edit post / 编辑帖子
│   │   ├── CategoryPage.vue # Category page / 分类页面
│   │   ├── UserProfilePage.vue # User profile / 用户资料
│   │   ├── LoginPage.vue # Login page / 登录页
│   │   ├── RegisterPage.vue # Register page / 注册页
│   │   ├── SettingsPage.vue # Settings page / 设置页
│   │   └── NotFoundPage.vue # 404 page / 404 页面
│   ├── router/           # Router config / 路由配置
│   │   └── index.ts      # Route definitions / 路由定义
│   ├── stores/           # Pinia state management / Pinia 状态管理
│   │   ├── user.ts       # User state / 用户状态
│   │   ├── post.ts       # Post state / 帖子状态
│   │   └── ui.ts         # UI state / UI 状态
│   ├── styles/           # Global styles / 全局样式
│   ├── utils/            # Utility functions / 工具函数
│   ├── App.vue           # Root component / 根组件
│   └── main.ts           # Entry file / 入口文件
├── public/               # Public resources / 公共资源
│   ├── favicon.svg       # Site icon / 网站图标
│   └── icons.svg         # Icon resources / 图标资源
├── index.html            # HTML template / HTML 模板
├── package.json          # Dependencies / 依赖配置
├── vite.config.ts        # Vite config / Vite 配置
├── tailwind.config.js    # TailwindCSS config / TailwindCSS 配置
├── tsconfig.json         # TypeScript config / TypeScript 配置
└── .env.development      # Dev environment variables / 开发环境变量
```

## Quick Start / 快速开始

### Prerequisites / 前置要求

- Node.js >= 18.0.0
- npm >= 9.0.0

### Install Dependencies / 安装依赖

```bash
npm install
```

### Local Development / 本地开发

```bash
npm run dev
```

App will start at `http://localhost:5173` / 应用将在 `http://localhost:5173` 启动。

### Production Build / 生产构建

```bash
npm run build
```

Build output will be in the `dist` directory / 构建产物将输出到 `dist` 目录。

### Preview Build / 预览构建

```bash
npm run preview
```

## Environment Configuration / 环境配置

### Development Environment Variables (.env.development) / 开发环境变量

```env
VITE_API_BASE_URL=http://localhost:8787
```

### Production Environment Variables (.env.production) / 生产环境变量

```env
VITE_API_BASE_URL=https://api.winuel.com
```

### Using Environment Variables / 使用环境变量

```typescript
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL
```

## Components / 组件说明

### Layout Components / 布局组件

#### MainLayout.vue

Main layout component containing Header, Sidebar, Footer, and content area.
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

### Page Components / 页面组件

#### HomePage.vue

Home page displaying post list.
首页，显示帖子列表。

**Key Features / 主要功能：**
- Display post list / 显示帖子列表
- Paginated loading / 分页加载
- Category filtering / 分类筛选
- Search functionality / 搜索功能

#### PostDetailPage.vue

Post detail page.
帖子详情页。

**Key Features / 主要功能：**
- Display post content / 显示帖子内容
- Comment list / 评论列表
- Post comments / 发表评论
- Like functionality / 点赞功能

#### LoginPage.vue / RegisterPage.vue

Login and register pages.
登录和注册页面。

**Key Features / 主要功能：**
- Form validation / 表单验证
- Error messages / 错误提示
- Auto login / 自动登录

### Feature Components / 功能组件

#### PostCard.vue

Post card component for displaying post summary.
帖子卡片组件，用于显示帖子摘要。

```vue
<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow">
    <!-- Post content / 帖子内容 -->
  </div>
</template>
```

#### CommentForm.vue

Comment form component.
评论表单组件。

```vue
<template>
  <form @submit.prevent="handleSubmit">
    <textarea v-model="content" />
    <button type="submit">Submit Comment / 发表评论</button>
  </form>
</template>
```

## State Management / 状态管理

### userStore（User State / 用户状态）

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

**Key Methods / 主要方法：**
- `setUser(userData)` - Set user info / 设置用户信息
- `setToken(token)` - Set token / 设置令牌
- `logout()` - Logout / 退出登录
- `loadFromStorage()` - Load from local storage / 从本地存储加载

### postStore（Post State / 帖子状态）

```typescript
interface PostState {
  posts: Post[]
  currentPost: Post | null
  loading: boolean
  error: string | null
}
```

**Key Methods / 主要方法：**
- `setPosts(posts)` - Set post list / 设置帖子列表
- `setCurrentPost(post)` - Set current post / 设置当前帖子
- `addPost(post)` - Add post / 添加帖子
- `updatePost(post)` - Update post / 更新帖子
- `deletePost(id)` - Delete post / 删除帖子

### uiStore（UI State / UI 状态）

```typescript
interface UIState {
  theme: 'light' | 'dark'
  sidebarOpen: boolean
  notifications: Notification[]
}
```

**Key Methods / 主要方法：**
- `toggleTheme()` - Toggle theme / 切换主题
- `toggleSidebar()` - Toggle sidebar / 切换侧边栏
- `addNotification(notification)` - Add notification / 添加通知
- `removeNotification(id)` - Remove notification / 移除通知

## Routing / 路由配置

### Route Definitions / 路由定义

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

### Route Guards / 路由守卫

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

## API Wrapper / API 封装

### ApiClient

Base API client handling HTTP requests.
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

### API Modules / API 模块

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

## Styling / 样式系统

### TailwindCSS Configuration / TailwindCSS 配置

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
          // ... more colors / 更多颜色
        }
      }
    }
  }
}
```

### Custom Styles / 自定义样式

```css
/* Global styles / 全局样式 */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom component styles / 自定义组件样式 */
.btn-primary {
  @apply px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600;
}
```

### Theme Switching / 主题切换

```typescript
// Toggle theme / 切换主题
function toggleTheme() {
  document.documentElement.classList.toggle('dark')
}
```

## Build & Deploy / 构建部署

### Local Build / 本地构建

```bash
npm run build
```

### Production Deployment / 生产部署

Deploy the `dist` directory to any static hosting service:
将 `dist` 目录部署到任何静态托管服务：

- Cloudflare Pages
- Vercel
- Netlify
- GitHub Pages

### Environment Variables / 环境变量

Ensure `VITE_API_BASE_URL` is set correctly in production environment.
确保在生产环境中设置正确的 `VITE_API_BASE_URL`。

## Development Guide / 开发指南

### Code Standards / 代码规范

- Use TypeScript strict mode / 使用 TypeScript 严格模式
- Follow ESLint and Prettier configuration / 遵循 ESLint 和 Prettier 配置
- Use Vue 3 Composition API / 使用 Vue 3 组合式 API
- Component naming in PascalCase / 组件命名使用 PascalCase
- File naming in kebab-case / 文件命名使用 kebab-case

### Component Development / 组件开发

#### Creating New Component / 创建新组件

```vue
<template>
  <div class="my-component">
    <!-- Template content / 模板内容 -->
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

// Component logic / 组件逻辑
</script>

<style scoped>
/* Component styles / 组件样式 */
</style>
```

#### Component Communication / 组件通信

**Props / 属性：**
```typescript
const props = defineProps<{
  title: string
  count: number
}>()
```

**Emits / 事件：**
```typescript
const emit = defineEmits<{
  update: [value: string]
  delete: [id: string]
}>()
```

### Composables / 组合式函数

Create reusable logic:
创建可复用的逻辑：

```typescript
// composables/useAuth.ts
export function useAuth() {
  const userStore = useUserStore()
  
  function login(email: string, password: string) {
    // Login logic / 登录逻辑
  }
  
  return {
    login,
    logout: userStore.logout
  }
}
```

### Type Definitions / 类型定义

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

## Performance Optimization / 性能优化

### Code Splitting / 代码分割

```typescript
// Route lazy loading / 路由懒加载
const HomePage = () => import('./pages/HomePage.vue')
const PostDetailPage = () => import('./pages/PostDetailPage.vue')
```

### Image Optimization / 图片优化

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

### Caching Strategy / 缓存策略

```typescript
// API response caching / API 响应缓存
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

## Testing / 测试

### Unit Tests / 单元测试

```bash
npm run test
```

### Component Tests / 组件测试

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

## Troubleshooting / 故障排查

### Common Issues / 常见问题

**Q: Dev server failed to start / 开发服务器启动失败**
```bash
A: Check if port is occupied, try using a different port / 检查端口是否被占用，尝试使用其他端口
```

**Q: API request failed / API 请求失败**
```bash
A: Check environment variable configuration and if backend service is running / 检查环境变量配置和后端服务是否正常运行
```

**Q: Styles not working / 样式不生效**
```bash
A: Ensure TailwindCSS configuration is correct, restart dev server / 确保 TailwindCSS 配置正确，重启开发服务器
```

### Debugging Tips / 调试技巧

1. Use Vue DevTools / 使用 Vue DevTools
2. Check browser console / 查看浏览器控制台
3. Check network requests / 检查网络请求
4. Use TypeScript type checking / 使用 TypeScript 类型检查

## Contributing / 贡献指南

Contributions are welcome! Please follow these steps:
欢迎贡献代码！请遵循以下步骤：

1. Fork this repository / Fork 本仓库
2. Create a feature branch / 创建特性分支
3. Follow code standards / 遵循代码规范
4. Write tests / 编写测试
5. Submit a Pull Request / 提交 Pull Request

## License / 许可证

MIT License

---

**Winuel Frontend Team** © 2026