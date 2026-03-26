# 最佳实践

本指南提供了使用 Winuel 论坛系统的最佳实践建议。

## 项目结构

### 推荐的目录结构

```
my-winuel-app/
├── src/
│   ├── api/           # API 调用
│   ├── components/    # 组件
│   ├── composables/   # 组合式函数
│   ├── stores/        # 状态管理
│   ├── utils/         # 工具函数
│   ├── views/         # 页面视图
│   └── styles/        # 样式文件
├── public/            # 静态资源
├── tests/             # 测试文件
└── docs/              # 文档
```

## 组件开发

### 组件命名

```javascript
// ✅ 推荐：PascalCase
export default {
  name: 'UserProfileCard'
}

// ❌ 不推荐：kebab-case
export default {
  name: 'user-profile-card'
}
```

### Props 验证

```javascript
// ✅ 推荐：详细的 props 验证
export default {
  props: {
    post: {
      type: Object,
      required: true,
      validator: (value) => {
        return value.id && value.title && value.content
      }
    },
    showActions: {
      type: Boolean,
      default: false
    }
  }
}

// ❌ 不推荐：缺少验证
export default {
  props: ['post', 'showActions']
}
```

### 事件命名

```javascript
// ✅ 推荐：kebab-case
this.$emit('post-created', post)
this.$emit('user-logged-in', user)

// ❌ 不推荐：camelCase
this.$emit('postCreated', post)
```

## 状态管理

### Store 结构

```javascript
// ✅ 推荐：模块化 store
import { ref, computed } from 'vue'

const useUserStore = defineStore('user', () => {
  // State
  const user = ref(null)
  const token = ref(null)

  // Getters
  const isLoggedIn = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.role === 'admin')

  // Actions
  const login = async (credentials) => { }
  const logout = async () => { }

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

### 异步操作

```javascript
// ✅ 推荐：处理错误和加载状态
const fetchPosts = async () => {
  loading.value = true
  try {
    const response = await apiClient.get('/api/posts')
    posts.value = response.data
  } catch (error) {
    console.error('获取帖子失败:', error)
    showError('无法加载帖子')
  } finally {
    loading.value = false
  }
}

// ❌ 不推荐：不处理错误
const fetchPosts = async () => {
  const response = await apiClient.get('/api/posts')
  posts.value = response.data
}
```

## API 调用

### 统一的错误处理

```javascript
// ✅ 推荐：创建 API 客户端包装器
const apiClient = getApiClient()

const fetchWithErrorHandler = async (request) => {
  try {
    const response = await request()
    return response.data
  } catch (error) {
    handleApiError(error)
    throw error
  }
}

// 使用
const posts = await fetchWithErrorHandler(() => 
  apiClient.get('/api/posts')
)
```

### 请求拦截器

```javascript
// ✅ 推荐：配置拦截器
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = \`Bearer \${token}\`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token 过期，跳转到登录页
      router.push('/login')
    }
    return Promise.reject(error)
  }
)
```

## 性能优化

### 组件懒加载

```javascript
// ✅ 推荐：路由懒加载
const routes = [
  {
    path: '/posts',
    component: () => import('@/views/Posts.vue')
  }
]

// 组件懒加载
const HeavyComponent = defineAsyncComponent(() =>
  import('@/components/HeavyComponent.vue')
)
```

### 列表虚拟化

```javascript
// ✅ 推荐：大数据列表使用虚拟滚动
const { list, containerProps, wrapperProps } = useVirtualList(
  largeDataArray,
  { itemHeight: 50 }
)
```

### 防抖和节流

```javascript
// ✅ 推荐：搜索输入使用防抖
const search = useDebounceFn(async (keyword) => {
  results.value = await searchPosts(keyword)
}, 300)
```

## 安全实践

### XSS 防护

```javascript
// ✅ 推荐：清理用户输入
const sanitizeContent = (content) => {
  return DOMPurify.sanitize(content, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'a'],
    ALLOWED_ATTR: ['href']
  })
}
```

### CSRF 保护

```javascript
// ✅ 推荐：包含 CSRF 令牌
const getCSRFToken = () => {
  return document.querySelector('meta[name="csrf-token"]')?.content
}

apiClient.post('/api/posts', data, {
  headers: {
    'X-CSRF-Token': getCSRFToken()
  }
})
```

## 代码风格

### 使用 ESLint

```json
{
  "extends": [
    "plugin:vue/vue3-recommended",
    "@vue/typescript/recommended"
  ],
  "rules": {
    "no-console": "warn",
    "no-debugger": "warn",
    "vue/multi-word-component-names": "off"
  }
}
```

### 使用 Prettier

```json
{
  "semi": false,
  "singleQuote": true,
  "trailingComma": false,
  "printWidth": 100,
  "tabWidth": 2
}
```

## 测试

### 单元测试

```javascript
// ✅ 推荐：测试关键逻辑
describe('User Store', () => {
  it('should login successfully', async () => {
    const store = useUserStore()
    await store.login({ email: 'test@example.com', password: 'password' })
    expect(store.isLoggedIn).toBe(true)
  })
})
```

### 组件测试

```javascript
// 组件测试示例
describe('PostCard', () => {
  it('renders post title', () => {
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
})
```

## 部署

### 环境变量管理

```bash
# .env.development
VITE_API_BASE_URL=\`YOUR_LOCALHOST:8787\`

# .env.production
VITE_API_BASE_URL=https://api.winuel.com
```

### 构建优化

```javascript
// vite.config.js
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router', 'pinia'],
          ui: ['@winuel/shared-ui']
        }
      }
    }
  }
})
```

## 监控和日志

### 错误追踪

```javascript
// 错误追踪示例
Sentry.init({
  dsn: 'your-sentry-dsn',
  environment: import.meta.env.MODE,
  tracesSampleRate: 1.0
})
```

### 性能监控

```javascript
// 记录关键操作性能
const measurePerformance = (name, fn) => {
  const start = performance.now()
  const result = fn()
  const end = performance.now()
  console.log(\`\${name} took \${end - start}ms\`)
  return result
}
```

## 常见陷阱

### ❌ 不要直接修改 props

```javascript
// ❌ 错误
props.post.title = 'New Title'

// ✅ 正确
emit('update:post', { ...props.post, title: 'New Title' })
```

### ❌ 不要在模板中使用复杂表达式

不要在 Vue 模板中使用复杂的表达式，如：

❌ 错误示例：在模板中直接调用 filter 方法

✅ 正确做法：使用计算属性

```javascript
import { computed } from 'vue'

const popularPostCount = computed(() => 
  posts.value.filter(item => item.likes > 10).length
)
```

## 下一步

- [插件开发教程](/tutorial/plugin-development)
- [高级功能教程](/tutorial/advanced-features)
- [API 文档](/api/overview)