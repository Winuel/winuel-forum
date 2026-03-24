# 插件开发教程

本教程将指导您如何为 CloudLink 开发自定义插件。

## 插件系统概述

CloudLink 提供了强大的插件系统，允许开发者扩展论坛功能。

### 插件结构

\`\`\`javascript
const myPlugin = {
  // 插件基本信息
  name: 'my-plugin',
  version: '1.0.0',
  description: '我的自定义插件',
  author: 'Your Name',

  // 插件配置
  config: {
    enabled: true,
    options: {}
  },

  // 初始化函数
  init(context) {
    console.log('插件初始化:', this.name)
    this.context = context
  },

  // 生命周期钩子
  hooks: {
    // 帖子相关
    onPostCreate(post) {},
    onPostUpdate(post) {},
    onPostDelete(postId) {},
    
    // 评论相关
    onCommentCreate(comment) {},
    onCommentUpdate(comment) {},
    onCommentDelete(commentId) {},
    
    // 用户相关
    onUserRegister(user) {},
    onUserLogin(user) {},
    onUserLogout(userId) {}
  },

  // 自定义命令
  commands: {
    myCommand(args) {
      return '执行自定义命令'
    }
  },

  // 清理函数
  destroy() {
    console.log('插件销毁:', this.name)
  }
}

export default myPlugin
\`\`\`

## 创建插件项目

### 1. 初始化插件项目

\`\`\`bash
# 创建插件目录
mkdir cloudlink-my-plugin
cd cloudlink-my-plugin

# 初始化项目
npm init -y

# 安装依赖
npm install @cloudlink/plugin-sdk
\`\`\`

### 2. 创建插件文件

\`\`\`javascript
// src/index.js
// 插件文件示例
export default createPlugin({
  name: 'hello-world',
  version: '1.0.0',
  description: 'Hello World 插件示例',
  
  init(context) {
    console.log('Hello World 插件已加载')
  },

  hooks: {
    onPostCreate(post) {
      console.log('新帖子创建:', post.title)
    }
  }
})
\`\`\`

### 3. 配置文件

\`\`\`json
{
  "name": "cloudlink-hello-world",
  "version": "1.0.0",
  "description": "Hello World 插件示例",
  "main": "src/index.js",
  "keywords": ["cloudlink", "plugin"],
  "author": "Your Name",
  "license": "MIT",
  "dependencies": {
    "@cloudlink/plugin-sdk": "^1.0.0"
  },
  "peerDependencies": {
    "@cloudlink/plugin-system": "^1.0.0"
  }
}
\`\`\`

## 插件开发示例

### 示例 1: 内容过滤器

\`\`\`javascript
// 内容过滤器插件示例
export default createPlugin({
  name: 'content-filter',
  version: '1.0.0',
  description: '内容过滤插件',
  
  config: {
    bannedWords: ['spam', '广告', '违规'],
    replaceWith: '***'
  },

  hooks: {
    onPostCreate(post) {
      // 过滤帖子内容
      post.content = this.filterContent(post.content)
      return post
    },

    onCommentCreate(comment) {
      // 过滤评论内容
      comment.content = this.filterContent(comment.content)
      return comment
    }
  },

  methods: {
    filterContent(content) {
      let filtered = content
      this.config.bannedWords.forEach(word => {
        const regex = new RegExp(word, 'gi')
        filtered = filtered.replace(regex, this.config.replaceWith)
      })
      return filtered
    }
  }
})
\`\`\`

### 示例 2: 统计插件

\`\`\`javascript
// 统计插件示例
export default createPlugin({
  name: 'post-statistics',
  version: '1.0.0',
  description: '帖子统计插件',
  
  init(context) {
    this.stats = {
      totalPosts: 0,
      totalComments: 0,
      totalLikes: 0
    }
  },

  hooks: {
    onPostCreate(post) {
      this.stats.totalPosts++
      this.saveStats()
    },

    onCommentCreate(comment) {
      this.stats.totalComments++
      this.saveStats()
    },

    onPostLike(postId) {
      this.stats.totalLikes++
      this.saveStats()
    }
  },

  commands: {
    getStats() {
      return this.stats
    }
  },

  methods: {
    saveStats() {
      // 保存统计信息到存储
      this.context.storage.set('stats', this.stats)
    }
  }
})
\`\`\`

### 示例 3: 通知增强

\`\`\`javascript
// 通知增强插件示例
export default createPlugin({
  name: 'notification-enhancer',
  version: '1.0.0',
  description: '通知增强插件',
  
  config: {
    emailNotifications: true,
    pushNotifications: true
  },

  hooks: {
    onNotificationCreate(notification) {
      // 发送邮件通知
      if (this.config.emailNotifications) {
        this.sendEmailNotification(notification)
      }
      
      // 发送推送通知
      if (this.config.pushNotifications) {
        this.sendPushNotification(notification)
      }
    }
  },

  methods: {
    sendEmailNotification(notification) {
      // 实现邮件发送逻辑
      console.log('发送邮件通知:', notification)
    },

    sendPushNotification(notification) {
      // 实现推送通知逻辑
      console.log('发送推送通知:', notification)
    }
  }
})
\`\`\`

## 插件 API

### Context 对象

\`\`\`javascript
{
  // API 客户端
  api: apiClient,
  
  // 存储接口
  storage: storageInterface,
  
  // 事件总线
  eventBus: eventBus,
  
  // 配置
  config: pluginConfig,
  
  // 日志
  logger: logger
}
\`\`\`

### 存储接口

\`\`\`javascript
// 设置数据
context.storage.set(key, value)

// 获取数据
const value = context.storage.get(key)

// 删除数据
context.storage.delete(key)

// 清空所有数据
context.storage.clear()
\`\`\`

### 事件总线

\`\`\`javascript
// 监听事件
context.eventBus.on('custom-event', (data) => {
  console.log('收到自定义事件:', data)
})

// 发送事件
context.eventBus.emit('custom-event', { message: 'Hello' })

// 取消监听
context.eventBus.off('custom-event', handler)
\`\`\`

## 插件测试

\`\`\`javascript
// 插件测试示例
describe('My Plugin', () => {
  it('should initialize correctly', () => {
    const mockContext = {
      api: {},
      storage: {},
      eventBus: {},
      logger: {}
    }
    
    myPlugin.init(mockContext)
    expect(myPlugin.context).toBe(mockContext)
  })

  it('should filter content', () => {
    const filtered = myPlugin.filterContent('This is spam content')
    expect(filtered).toBe('This is *** content')
  })
})
\`\`\`

## 插件发布

### 1. 构建插件

\`\`\`bash
npm run build
\`\`\`

### 2. 发布到 npm

\`\`\`bash
npm publish
\`\`\`

### 3. 在项目中使用

\`\`\`bash
npm install cloudlink-hello-world
\`\`\`

\`\`\`javascript
// 使用插件示例
import helloWorld from 'cloudlink-hello-world'

// 注册插件
registerPlugin(helloWorld)
\`\`\`

## 最佳实践

1. **命名规范**: 使用 `cloudlink-` 前缀
2. **版本管理**: 遵循语义化版本
3. **错误处理**: 妥善处理异常
4. **性能优化**: 避免阻塞主线程
5. **文档完善**: 提供详细的使用文档

## 下一步

- [高级功能教程](/tutorial/advanced-features)
- [最佳实践指南](/tutorial/best-practices)
- [API 文档](/api/overview)