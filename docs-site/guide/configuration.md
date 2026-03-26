# 配置指南

本指南将帮助您配置 Winuel 论坛系统的各种设置。

## 环境变量配置

### 后端环境变量

创建 `.dev.vars` 文件：

```bash
# 数据库配置
DATABASE_URL=your-database-id
KV_NAMESPACE_ID=your-kv-namespace-id

# JWT 配置
JWT_SECRET=your-secret-key-min-32-chars
JWT_USER_AUD=user
JWT_ADMIN_AUD=admin
JWT_ISSUER=winuel-api

# CORS 配置
CORS_ORIGINS=https://www.winuel.com,https://admin.winuel.com,https://winuel.pages.dev

# 应用配置
ENVIRONMENT=development
API_BASE_URL=\`YOUR_LOCALHOST:8787\`
```

### 前端环境变量

创建 `.env.development` 文件：

```bash
# API 配置
VITE_API_BASE_URL=\`YOUR_LOCALHOST:8787\`

# 应用配置
VITE_APP_TITLE=Winuel 论坛
VITE_APP_DESCRIPTION=现代化的轻量级论坛系统

# 功能开关
VITE_FEATURE_REGISTRATION=true
VITE_FEATURE_EMAIL_VERIFICATION=true
VITE_FEATURE_SOCIAL_LOGIN=false
VITE_FEATURE_NOTIFICATIONS=true

# 安全配置
VITE_SESSION_TIMEOUT=60
VITE_CSRF_TOKEN_EXPIRES=3600
```

### 管理后台环境变量

创建 `.env` 文件：

```bash
# API 配置
VITE_API_BASE_URL=\`YOUR_LOCALHOST:8787\`
```

## 数据库配置

### D1 数据库初始化

```bash
# 创建数据库
npx wrangler d1 create winuel-db

# 执行迁移
npx wrangler d1 execute winuel-db --file=backend/migrations/001_add_soft_delete.sql
npx wrangler d1 execute winuel-db --file=backend/migrations/002_add_audit_logs.sql
npx wrangler d1 execute winuel-db --file=backend/migrations/003_add_performance_indexes.sql
npx wrangler d1 execute winuel-db --file=backend/migrations/004_add_code_attachments.sql
npx wrangler d1 execute winuel-db --file=backend/migrations/005_add_plugin_system.sql
```

### KV 存储配置

```toml
[[kv_namespaces]]
binding = "CACHE"
namespace_id = "your-kv-namespace-id"
```

## 安全配置

### 密钥管理

生成安全的随机密钥：

```bash
# 生成 JWT 密钥
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 生成会话密钥
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### CORS 配置

在生产环境中配置允许的域名：

```bash
# 允许的域名列表
CORS_ORIGINS=https://www.winuel.com,https://admin.winuel.com
```

## 性能配置

### 缓存策略

```typescript
// API 响应缓存
const CACHE_DURATION = {
  STATIC: 3600,    // 1小时
  DYNAMIC: 300,    // 5分钟
  USER_DATA: 60     // 1分钟
}
```

### 速率限制

```typescript
// API 端点速率限制
const RATE_LIMITS = {
  auth: 10,        // 每分钟10次
  normal: 60,      // 每分钟60次
  search: 30,      // 每分钟30次
  upload: 5        // 每分钟5次
}
```

## 功能开关配置

### 启用/禁用功能

通过环境变量控制功能开关：

```bash
# 启用/禁用功能
VITE_FEATURE_REGISTRATION=true
VITE_FEATURE_EMAIL_VERIFICATION=true
VITE_FEATURE_SOCIAL_LOGIN=false
VITE_FEATURE_NOTIFICATIONS=true
```

## 开发工具配置

### ESLint 配置

```json
{
  "extends": [
    "plugin:vue/vue3-recommended",
    "@vue/typescript/recommended"
  ],
  "rules": {
    "no-console": "warn",
    "no-debugger": "warn",
    "no-unused-vars": "warn"
  }
}
```

### Prettier 配置

```json
{
  "semi": false,
  "singleQuote": true,
  "trailingComma": false,
  "printWidth": 100,
  "tabWidth": 2
}
```

## 监控配置

### 日志级别

```typescript
// 日志级别配置
const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  FATAL: 4
}
```

### 错误追踪

集成 Sentry 进行错误追踪：

```javascript
import * as Sentry from '@sentry/vue'

Sentry.init({
  dsn: 'your-sentry-dsn',
  environment: process.env.ENVIRONMENT,
  tracesSampleRate: 1.0,
  beforeSend(event) {
    if (event.request) {
      // 过滤敏感信息
      delete event.request.headers
    }
  }
})
```

## 第三方服务配置

### 邮件服务配置

```javascript
// 发送邮件配置
const emailConfig = {
  service: 'resend',
  apiKey: process.env.RESEND_API_KEY,
  from: 'noreply@winuel.com',
  fromName: 'Winuel'
}
```

### 存储服务配置

```javascript
// R2 对象存储配置
const storageConfig = {
  accountId: process.env.R2_ACCOUNT_ID,
  accessKeyId: process.env.R2_ACCESS_KEY_ID,
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  bucket: 'winuel-uploads'
}
```

## 下一步

- [阅读部署指南](/guide/deployment)
- [查看API文档](/api/overview)
- [学习基础使用教程](/tutorial/basic-usage)