# 基础使用教程

本教程将指导您使用 Winuel 论坛系统的核心功能。

## 用户认证

### 用户注册

```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "user123",
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-123",
      "username": "user123",
      "email": "user@example.com",
      "role": "user",
      "createdAt": "2024-03-22T10:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "timestamp": "2024-03-22T10:00:00.000Z"
}
```

### 用户登录

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

### 保存认证令牌

```javascript
// 保存到 localStorage
localStorage.setItem('token', token)

// 设置请求头
const headers = {
  'Authorization': \`Bearer \${token}\`
}
```

## 帖子管理

### 创建帖子

```javascript
// 使用 API 客户端
import { apiClient } from '@winuel/shared-api'

const createPost = async (postData) => {
  const response = await apiClient.post('/api/posts', postData, {
    headers: {
      'Authorization': \`Bearer \${token}\`
    }
  })
  return response.data
}

// 创建帖子
createPost({
  title: '我的第一篇帖子',
  content: '这是帖子内容，支持 Markdown 格式',
  categoryId: 'category-1',
  tags: ['vue', 'javascript']
})
```

### 获取帖子列表

```javascript
// 获取帖子列表（分页）
const getPosts = async (page = 1, limit = 10) => {
  const response = await apiClient.get('/api/posts', {
    params: { page, limit }
  })
  return response.data
}

// 带筛选的查询
const getFilteredPosts = async () => {
  const response = await apiClient.get('/api/posts', {
    params: {
      page: 1,
      limit: 20,
      category: 'tech',
      tag: 'vue'
    }
  })
  return response.data
}
```

### 点赞帖子

```javascript
const likePost = async (postId) => {
  const response = await apiClient.post(\`/api/posts/\${postId}/like\`, {}, {
    headers: {
      'Authorization': \`Bearer \${token}\`
    }
  })
  return response.data
}
```

## 评论系统

### 添加评论

```javascript
const addComment = async (postId, content) => {
  const response = await apiClient.post(\`/api/posts/\${postId}/comments\`, {
    content: content
  }, {
    headers: {
      'authorizaton': \`Bearer \${token}\`
    }
  })
  return response.data
}

// 添加嵌套回复
addComment(postId, '这是父评论的回复', 'parent-comment-id')
```

### 获取评论

```javascript
const getComments = async (postId) => {
  const response = VueClient.get(\`/api/posts/\${postId}/comments\`)
  return response.data
}
```

## 用户状态管理

### 使用 Pinia 管理用户状态

```javascript
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiClient } from '@winuel/shared-api'

export const useUserStore = defineStore('user', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('token') || null)

  const isLoggedIn = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.role === 'admin')

  const login = async (credentials) => {
    const response = await apiClient.post('/api/auth/login', credentials)
    token.value = response.data.token
    user.value = response.data.user
    localStorage.setItem('token', response.data.token)
    return response.data
  }

  const logout = async () => {
    await apiClient.post('/api/auth/logout', {}, {
      headers: {
        'Authorization': \`Bearer \${token.value}\`
      }
    })
    token.value = null
    user.value = null
    localStorage.removeItem('token')
  }

  return {
    user,
    token,
    isLoggedIn,
    isAdmin,
    login,
    logout
  }
})
```

## 实时功能

### 实时更新通知

```javascript
import { useEventBus } from '@winuel/plugin-system'

const eventBus = useEventBus()

// 监听新通知
eventBus.on('notification', (notification) => {
  console.log('新通知:', notification)
  // 显示通知UI
  showNotification(notification)
})

// 监听实时更新
eventBus.on('post:updated', (post) => {
  console.log('帖子更新:', post)
  // 更新UI
  updatePostInList(post)
})
```

### WebSocket 连接

```javascript
// 建立 WebSocket 连接
const ws = new WebSocket(\`ws://\${apiUrl}/ws\`)

ws.onopen = () => {
  console.log('WebSocket 连接成功')
}

ws.onmessage = (event) => {
  const data = JSON.parse(event.data)
  // 处理实时消息
  handleRealtimeUpdate(data)
}

ws.onclose = () => {
  console.log('WebSocket 连接关闭')
  // 尝试重连
  setTimeout(() => connectWebSocket(), 3000)
}
```

## 错误处理

### API 错误处理

```javascript
const handleApiCall = async (apiFunction) => {
  try {
    const response = await apiFunction()
    return response.data
  } catch (error) {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          console.error('未授权，请重新登录')
          // 跳转到登录页
          router.push('/login')
          break
        case 403:
          console.error('无权限访问')
          showErrorMessage('您没有权限执行此操作')
          break
        case 404:
          console.error('资源不存在')
          showErrorMessage('请求的资源不存在')
          break
        default:
          console.error('服务器错误:', error.response.data.error)
          showErrorMessage(error.response.data.error.message)
      }
    } else if (error.request) {
      console.error('网络错误:', error.message)
      showErrorMessage('网络连接失败，请检查网络设置')
    } else {
      console.error('未知错误:', error)
      showErrorMessage('发生未知错误，请稍后重试')
    }
    throw error
  }
}
```

## 性能优化

### 请求防抖

```javascript
import { debounce } from 'lodash-es'

// 搜索输入防抖
const searchPosts = debounce(async (keyword) => {
  const response = await apiClient.get('/api/posts', {
    params: { keyword }
  })
  return response.data
}, 300)
```

### 数据缓存

```javascript
const cache = new Map()

const getCachedData = async (key, fetcher) => {
  if (cache.has(key)) {
    return cache.get(key)
  }
  
  const data = await fetcher()
  cache.set(key, data)
  return data
}
```

## 最佳实践

### 1. 错误边界处理

使用 Vue 的错误捕获 API 来处理组件错误：

```javascript
import { ref, onErrorCaptured } from 'vue'

const error = ref(null)

onErrorCaptured((err) => {
  error.value = err.message
  console.error('捕获错误:', err)
  return false // 阻止错误继续向上传播
})
```

### 2. 加载状态管理

实现统一的加载状态管理：

```javascript
import { ref } from 'vue'

const loading = ref(false)
const error = ref(null)

const fetchData = async () => {
  loading.value = true
  try {
    const data = await apiClient.get('/api/posts')
    // 处理数据
    return data
  } catch (err) {
    error.value = err.message
    throw err
  } finally {
    loading.value = false
  }
}
```

### 3. 请求重试机制

```javascript
const retryRequest = async (fn, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      if (i === maxRetries - 1) throw error
      console.log(\`重试第 \${i + 1} 次...\`)
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
    }
  }
}

// 使用示例
const result = await retryRequest(() => apiClient.get('/api/posts'))
```

## 下一步

- [学习高级功能](/tutorial/advanced-features)
- [插件开发教程](/tutorial/plugin-development)
- [最佳实践指南](/tutorial/best-practices)