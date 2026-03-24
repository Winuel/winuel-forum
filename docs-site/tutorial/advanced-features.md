# 高级功能

本教程介绍 CloudLink 论坛系统的高级功能。

## 实时通知

### WebSocket 连接

CloudLink 支持 WebSocket 实时通信，可以实时接收通知和更新。

\`\`\`javascript
// WebSocket 连接示例
const { connect, disconnect, onMessage } = useWebSocket()

// 连接 WebSocket
connect()

// 监听消息
onMessage((data) => {
  switch (data.type) {
    case 'notification':
      handleNotification(data.payload)
      break
    case 'post_update':
      handlePostUpdate(data.payload)
      break
    case 'comment_update':
      handleCommentUpdate(data.payload)
      break
  }
})
\`\`\`

### 通知类型

- **mention**: 被提及
- **reply**: 评论回复
- **like**: 点赞通知
- **follow**: 关注通知
- **system**: 系统通知

### 处理通知

\`\`\`javascript
const handleNotification = (notification) => {
  // 显示通知UI
  showNotification({
    title: notification.title,
    message: notification.message,
    type: notification.type,
    onClick: () => {
      // 点击通知跳转
      router.push(notification.link)
    }
  })

  // 标记为已读
  markNotificationAsRead(notification.id)
}
\`\`\`

## 搜索功能

### 全文搜索

\`\`\`javascript
// 搜索功能示例
const { searchPosts, searchUsers } = useSearch()

// 搜索帖子
const searchResults = await searchPosts({
  keyword: 'Vue.js 教程',
  category: 'tech',
  page: 1,
  limit: 20
})

// 搜索用户
const userResults = await searchUsers({
  keyword: 'john',
  page: 1,
  limit: 10
})
\`\`\`

### 高级搜索选项

\`\`\`javascript
const advancedSearch = await searchPosts({
  keyword: 'Vue.js',
  category: 'tech',
  tags: ['vue', 'javascript'],
  author: 'user-123',
  dateRange: {
    start: '2024-01-01',
    end: '2024-03-31'
  },
  sortBy: 'relevance',
  page: 1,
  limit: 20
})
\`\`\`

## 插件系统

### 使用插件

\`\`\`javascript
// 插件系统示例
const { registerPlugin, usePlugin } = usePluginSystem()

// 注册插件
registerPlugin({
  name: 'markdown-enhancer',
  version: '1.0.0',
  init: (context) => {
    // 插件初始化逻辑
    console.log('插件已加载')
  },
  hooks: {
    onPostCreate: (post) => {
      // 帖子创建后处理
      enhanceMarkdown(post.content)
    },
    onCommentCreate: (comment) => {
      // 评论创建后处理
      processComment(comment)
    }
  }
})

// 使用插件
usePlugin('markdown-enhancer')
\`\`\`

### 内置插件

- **markdown-renderer**: Markdown 渲染器
- **code-highlighter**: 代码高亮
- **emoji-support**: Emoji 支持
- **mention-parser**: 提及解析
- **image-optimizer**: 图片优化

## 数据缓存

### 本地缓存

\`\`\`javascript
// 缓存功能示例
const { get, set, remove, clear } = useCache()

// 设置缓存
set('user-posts', postsData, { ttl: 300 }) // 5分钟过期

// 获取缓存
const cached = get('user-posts')

// 删除缓存
remove('user-posts')

// 清空所有缓存
clear()
\`\`\`

### 缓存策略

\`\`\`javascript
const cacheOptions = {
  // 用户数据：短时间缓存
  userData: { ttl: 60 }, // 1分钟

  // 帖子列表：中等时间缓存
  postList: { ttl: 300 }, // 5分钟

  // 静态数据：长时间缓存
  categories: { ttl: 3600 }, // 1小时
  tags: { ttl: 3600 }
}
\`\`\`

## 性能优化

### 虚拟滚动

\`\`\`javascript
// 虚拟滚动示例
const { list, containerProps, wrapperProps } = useVirtualList({
  data: posts,
  itemHeight: 150,
  overscan: 5
})
\`\`\`

### 图片懒加载

图片懒加载可以通过在 HTML img 标签中添加 `loading="lazy"` 属性来实现。这会延迟加载视口外的图片，提高页面加载性能。

也可以使用 Vue 的图片懒加载指令（如 v-lazy）来实现更高级的懒加载功能。

### 请求优化

\`\`\`javascript
// 请求优化示例
const apiClient = getApiClient()

// 批量请求
const [posts, categories, tags] = await Promise.all([
  apiClient.get('/api/posts'),
  apiClient.get('/api/categories'),
  apiClient.get('/api/tags')
])

// 请求取消
const controller = new AbortController()
apiClient.get('/api/posts', { signal: controller.signal })

// 取消请求
controller.abort()
\`\`\`

## 安全功能

### XSS 防护

\`\`\`javascript
// XSS 防护示例
const cleanContent = sanitize(userInput, {
  allowedTags: ['p', 'br', 'strong', 'em', 'a'],
  allowedAttributes: {
    'a': ['href']
  }
})
\`\`\`

### CSRF 保护

\`\`\`javascript
// CSRF 保护示例
const csrfToken = getCSRFToken()

// 在请求头中包含
apiClient.post('/api/posts', postData, {
  headers: {
    'X-CSRF-Token': csrfToken
  }
})
\`\`\`

## 下一步

- [插件开发教程](/tutorial/plugin-development)
- [最佳实践指南](/tutorial/best-practices)
- [API 文档](/api/overview)