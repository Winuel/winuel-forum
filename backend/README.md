# Winuel Forum - Backend Documentation / 云纽论坛 - 后端文档

<div align="center">

![Winuel Backend](https://img.shields.io/badge/Winuel-Backend-F38020)
![Hono](https://img.shields.io/badge/Hono-4.12.8-orange)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-3178C6)
![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-F38020)

</div>

## 📋 Table of Contents / 目录

- [Overview / 概述](#概述)
- [Tech Stack / 技术栈](#技术栈)
- [Project Structure / 项目结构](#项目结构)
- [Quick Start / 快速开始](#快速开始)
- [Configuration / 配置说明](#配置说明)
- [API Endpoints / API 端点](#api-端点)
- [Database Design / 数据库设计](#数据库设计)
- [Middleware / 中间件](#中间件)
- [Utilities / 工具函数](#工具函数)
- [Error Handling / 错误处理](#错误处理)
- [Deployment / 部署](#部署)
- [Testing / 测试](#测试)

## Overview / 概述

Winuel Forum backend is built on Cloudflare Workers and Hono framework, providing high-performance, serverless RESTful APIs. Developed in TypeScript, it offers type safety and a modern development experience.
云纽论坛后端基于 Cloudflare Workers 和 Hono 框架构建，提供高性能、无服务器的 RESTful API。采用 TypeScript 开发，具有类型安全和现代化的开发体验。

### Key Features / 主要特性

- 🚀 **Serverless Architecture / Serverless 架构**: Based on Cloudflare Workers, auto-scaling / 基于 Cloudflare Workers，自动扩缩容
- 🌍 **Global Deployment / 全球部署**: Leverage Cloudflare's global edge network / 利用 Cloudflare 全球边缘网络
- 🔒 **Secure and Reliable / 安全可靠**: JWT authentication, rate limiting, input validation / JWT 认证、速率限制、输入验证
- 📊 **High Performance / 高性能**: Edge database, key-value caching / 边缘数据库、键值缓存
- 🧩 **Modular Design / 模块化设计**: Clear code structure and separation of concerns / 清晰的代码结构和职责分离

## Tech Stack / 技术栈

| Technology / 技术 | Version / 版本 | Description / 说明 |
|-------------------|----------------|-------------------|
| Hono | 4.12.8 | Lightweight web framework / 轻量级 Web 框架 |
| TypeScript | 5.9.3 | Type-safe JavaScript / 类型安全的 JavaScript |
| Cloudflare Workers | - | Serverless computing platform / Serverless 计算平台 |
| D1 | - | Cloudflare edge database (SQLite) / Cloudflare 边缘数据库 (SQLite) |
| KV | - | Cloudflare key-value storage / Cloudflare 键值存储 |
| R2 | - | Cloudflare object storage (reserved) / Cloudflare 对象存储（预留） |
| jose | ^5.9.6 | JWT token processing / JWT 令牌处理 |
| bcryptjs | ^2.4.3 | Password hashing / 密码哈希 |

## Project Structure / 项目结构

```
backend/
├── src/
│   ├── routes/           # Route modules / 路由模块
│   │   ├── auth.ts       # Auth routes / 认证路由
│   │   ├── posts.ts      # Post routes / 帖子路由
│   │   ├── comments.ts   # Comment routes / 评论路由
│   │   └── categories.ts # Category routes / 分类路由
│   ├── services/         # Business logic layer / 业务逻辑层
│   │   ├── userService.ts
│   │   ├── postService.ts
│   │   └── categoryService.ts
│   ├── middleware/       # Middleware / 中间件
│   │   ├── auth.ts       # Auth middleware / 认证中间件
│   │   ├── cors.ts       # CORS middleware / CORS 中间件
│   │   └── rateLimit.ts  # Rate limit middleware / 速率限制中间件
│   ├── utils/            # Utility functions / 工具函数
│   │   ├── jwt.ts        # JWT utilities / JWT 工具
│   │   ├── crypto.ts     # Encryption utilities / 加密工具
│   │   ├── validation.ts # Input validation / 输入验证
│   │   └── errorHandler.ts # Error handling / 错误处理
│   ├── db/               # Database related / 数据库相关
│   │   ├── schema.sql    # Database schema / 数据库结构
│   │   └── models.ts     # Data models / 数据模型
│   ├── types.ts          # Type definitions / 类型定义
│   └── index.ts          # Application entry / 应用入口
├── package.json          # Dependencies / 依赖配置
├── wrangler.toml         # Cloudflare Workers config / Cloudflare Workers 配置
└── tsconfig.json         # TypeScript config / TypeScript 配置
```

## Quick Start / 快速开始

### Prerequisites / 前置要求

- Node.js >= 18.0.0
- npm >= 9.0.0
- Wrangler CLI (global installation / 全局安装)

### Install Dependencies / 安装依赖

```bash
npm install
```

### Local Development / 本地开发

```bash
# Build project / 构建项目
npm run build

# Start local dev server / 启动本地开发服务器
wrangler dev
```

Dev server will start at `http://localhost:8787` / 开发服务器将在 `http://localhost:8787` 启动。

### Production Deployment / 生产部署

```bash
# Build and deploy / 构建并部署
npm run build
wrangler deploy
```

## Configuration / 配置说明

### wrangler.toml

```toml
name = "winuel-backend"
main = "src/index.ts"
compatibility_date = "2024-09-23"
compatibility_flags = ["nodejs_compat"]

[vars]
ENVIRONMENT = "development"

[[d1_databases]]
binding = "DB"
database_name = "winuel-db"
database_id = "8ede8043-e500-4893-a93d-58c2d1048f1a"

[[kv_namespaces]]
binding = "KV"
id = "6c15505889704c9f9f9e148394b6f0ec"
preview_id = "96179db79b6d4b5b9c0b899977a2c942"
```

### Environment Variables / 环境变量

| Variable Name / 变量名 | Description / 说明 | Required / 必需 | Default / 默认值 |
|------------------------|-------------------|------------------|------------------|
| JWT_SECRET | JWT signing secret / JWT 签名密钥 | Yes / 是 | - |
| ENVIRONMENT | Runtime environment / 运行环境 | No / 否 | development |

### Set Environment Variables / 设置环境变量

```bash
# Set JWT secret / 设置 JWT 密钥
wrangler secret put JWT_SECRET
# Enter at least 32 characters / 输入至少 32 个字符的密钥

# Set environment variable (dev environment) / 设置环境变量（开发环境）
wrangler secret put ENVIRONMENT
# Enter: development or production / 输入：development 或 production
```

## API Endpoints / API 端点

### Base Endpoints / 基础端点

| Method / 方法 | Endpoint / 端点 | Description / 说明 | Auth / 认证 |
|---------------|-----------------|-------------------|-------------|
| GET | `/` | API information / API 信息 | No / 否 |
| GET | `/health` | Health check / 健康检查 | No / 否 |

### Authentication Endpoints / 认证端点

| Method / 方法 | Endpoint / 端点 | Description / 说明 | Auth / 认证 | Rate Limit / 速率限制 |
|---------------|-----------------|-------------------|-------------|----------------------|
| POST | `/api/auth/register` | User registration / 用户注册 | No / 否 | 5 requests/minute / 5 次/分钟 |
| POST | `/api/auth/login` | User login / 用户登录 | No / 否 | 5 requests/minute / 5 次/分钟 |
| GET | `/api/auth/me` | Get current user / 获取当前用户 | Yes / 是 | - |
| POST | `/api/auth/logout` | User logout / 用户登出 | Yes / 是 | - |

### Post Endpoints / 帖子端点

| Method / 方法 | Endpoint / 端点 | Description / 说明 | Auth / 认证 |
|---------------|-----------------|-------------------|-------------|
| GET | `/api/posts` | Get post list / 获取帖子列表 | No / 否 |
| GET | `/api/posts/:id` | Get post details / 获取帖子详情 | No / 否 |
| POST | `/api/posts` | Create post / 创建帖子 | Yes / 是 |
| PUT | `/api/posts/:id` | Update post / 更新帖子 | Yes / 是 |
| DELETE | `/api/posts/:id` | Delete post / 删除帖子 | Yes / 是 |
| POST | `/api/posts/:id/like` | Like post / 点赞帖子 | Yes / 是 |
| DELETE | `/api/posts/:id/like` | Unlike post / 取消点赞 | Yes / 是 |

### Comment Endpoints / 评论端点

| Method / 方法 | Endpoint / 端点 | Description / 说明 | Auth / 认证 |
|---------------|-----------------|-------------------|-------------|
| GET | `/api/comments` | Get comment list / 获取评论列表 | No / 否 |
| GET | `/api/comments/:id` | Get comment details / 获取评论详情 | No / 否 |
| POST | `/api/comments` | Create comment / 创建评论 | Yes / 是 |
| PUT | `/api/comments/:id` | Update comment / 更新评论 | Yes / 是 |
| DELETE | `/api/comments/:id` | Delete comment / 删除评论 | Yes / 是 |
| POST | `/api/comments/:id/like` | Like comment / 点赞评论 | Yes / 是 |
| DELETE | `/api/comments/:id/like` | Unlike comment / 取消点赞 | Yes / 是 |

### Category Endpoints / 分类端点

| Method / 方法 | Endpoint / 端点 | Description / 说明 | Auth / 认证 |
|---------------|-----------------|-------------------|-------------|
| GET | `/api/categories` | Get category list / 获取分类列表 | No / 否 |
| GET | `/api/categories/:id` | Get category details / 获取分类详情 | No / 否 |

For detailed API documentation, please refer to [API.md](../API.md).
详细的 API 文档请参考 [API.md](../API.md)。

## Database Design / 数据库设计

### Table Structure / 表结构

#### users（User Table / 用户表）

```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  avatar TEXT,
  role TEXT NOT NULL DEFAULT 'user',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

#### categories（Category Table / 分类表）

```sql
CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

#### posts（Post Table / 帖子表）

```sql
CREATE TABLE posts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id TEXT NOT NULL,
  category_id TEXT NOT NULL,
  view_count INTEGER NOT NULL DEFAULT 0,
  like_count INTEGER NOT NULL DEFAULT 0,
  comment_count INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);
```

#### comments（Comment Table / 评论表）

```sql
CREATE TABLE comments (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL,
  author_id TEXT NOT NULL,
  content TEXT NOT NULL,
  parent_id TEXT,
  like_count INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE
);
```

### Indexes / 索引

```sql
CREATE INDEX idx_posts_author_id ON posts(author_id);
CREATE INDEX idx_posts_category_id ON posts(category_id);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_comments_author_id ON comments(author_id);
```

### Default Data / 默认数据

```sql
INSERT INTO categories (id, name, description) VALUES
  ('1', '技术讨论', '讨论各种技术话题'),
  ('2', '生活分享', '分享生活点滴'),
  ('3', '问答专区', '提问和解答问题'),
  ('4', '资源分享', '分享有用的资源');
```

## Middleware / 中间件

### authMiddleware（Auth Middleware / 认证中间件）

Verifies JWT tokens and extracts user information.
验证 JWT 令牌并提取用户信息。

```typescript
export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization')
  // Verification logic... / 验证逻辑...
  await next()
}
```

### corsMiddleware（CORS Middleware / CORS 中间件）

Handles Cross-Origin Resource Sharing with environment-based domain configuration.
处理跨域资源共享，基于环境变量配置允许的域名。

```typescript
export const corsMiddleware = cors({
  origin: (origin: string | null, c: any) => {
    // Domain validation logic... / 域名验证逻辑...
  },
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400,
})
```

### rateLimitMiddleware（Rate Limit Middleware / 速率限制中间件）

Implements token bucket algorithm using KV storage to prevent brute force attacks.
使用 KV 存储实现令牌桶算法，防止暴力破解。

```typescript
export function createRateLimit(config: RateLimitConfig) {
  return async (c: Context, next: Next) => {
    // Rate limiting logic... / 速率限制逻辑...
    await next()
  }
}
```

## Utilities / 工具函数

### JWT Utilities (jwt.ts) / JWT 工具（jwt.ts）

```typescript
export async function generateToken(payload: JWTPayload): Promise<string>
export async function verifyToken(token: string): Promise<JWTPayload | null>
```

### Encryption Utilities (crypto.ts) / 加密工具（crypto.ts）

```typescript
export async function hashPassword(password: string): Promise<string>
export async function verifyPassword(password: string, hash: string): Promise<boolean>
export function generateId(): string
```

### Validation Utilities (validation.ts) / 验证工具（validation.ts）

```typescript
export function validatePassword(password: string): ValidationResult
export function validateEmail(email: string): ValidationResult
export function validateUsername(username: string): ValidationResult
```

### Error Handling (errorHandler.ts) / 错误处理（errorHandler.ts）

```typescript
export class AppError extends Error
export const createError: { [key: string]: (details?: string) => AppError }
export function handleError(error: unknown): ApiError
export function formatErrorResponse(error: ApiError, statusCode?: number): object
export function logError(error: unknown, context?: string): void
```

## Error Handling / 错误处理

### Error Codes / 错误代码

| Code / 代码 | HTTP Status / HTTP 状态码 | Description / 说明 |
|-------------|--------------------------|-------------------|
| UNAUTHORIZED | 401 | Unauthorized access / 未授权访问 |
| INVALID_TOKEN | 401 | Invalid token / 无效的令牌 |
| TOKEN_EXPIRED | 401 | Token expired / 令牌已过期 |
| VALIDATION_ERROR | 400 | Input validation failed / 输入验证失败 |
| MISSING_FIELD | 400 | Missing required field / 缺少必要字段 |
| NOT_FOUND | 404 | Resource not found / 资源不存在 |
| ALREADY_EXISTS | 409 | Resource already exists / 资源已存在 |
| FORBIDDEN | 403 | Insufficient permissions / 权限不足 |
| RATE_LIMIT_EXCEEDED | 429 | Too many requests / 请求过于频繁 |
| INTERNAL_ERROR | 500 | Internal server error / 服务器内部错误 |

### Error Response Format / 错误响应格式

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Input validation failed / 输入验证失败",
    "details": "Password must be at least 8 characters / 密码长度至少为8个字符"
  },
  "timestamp": "2026-03-15T15:00:00.000Z"
}
```

## Deployment / 部署

### Development Environment Deployment / 开发环境部署

```bash
# Local development / 本地开发
wrangler dev

# Preview environment / 预览环境
wrangler deploy --env preview
```

### Production Environment Deployment / 生产环境部署

```bash
# Build project / 构建项目
npm run build

# Deploy to production / 部署到生产环境
wrangler deploy
```

### Database Migration / 数据库迁移

```bash
# Create database / 创建数据库
wrangler d1 create winuel-db

# Initialize database schema / 初始化数据库结构
wrangler d1 execute winuel-db --file=./src/db/schema.sql --remote

# Query database / 查询数据库
wrangler d1 execute winuel-db --remote --command "SELECT * FROM users"
```

### Environment Variable Management / 环境变量管理

```bash
# Set secret / 设置密钥
wrangler secret put JWT_SECRET

# View secrets (dev environment only) / 查看密钥（仅开发环境）
wrangler secret list

# Delete secret / 删除密钥
wrangler secret delete JWT_SECRET
```

## Testing / 测试

### Unit Tests / 单元测试

```bash
# Run tests / 运行测试
npm test
```

### Integration Tests / 集成测试

```bash
# Run integration tests / 运行集成测试
npm run test:integration
```

### Manual Testing / 手动测试

```bash
# Test API endpoints / 测试 API 端点
curl http://localhost:8787/
curl http://localhost:8787/health
curl http://localhost:8787/api/categories
```

## Performance Optimization / 性能优化

### Caching Strategy / 缓存策略

- Use KV for hot data caching / 使用 KV 缓存热点数据
- Implement query result caching / 实现查询结果缓存
- Set reasonable expiration times / 设置合理的过期时间

### Database Optimization / 数据库优化

- Use appropriate indexes / 使用适当的索引
- Avoid N+1 queries / 避免 N+1 查询
- Use parameterized queries / 使用参数化查询

### Worker Optimization / Worker 优化

- Minimize cold start time / 最小化冷启动时间
- Optimize memory usage / 优化内存使用
- Leverage edge computing benefits / 使用边缘计算优势

## Security Best Practices / 安全最佳实践

1. **Secret Management / 密钥管理**: Use Wrangler Secrets for sensitive information / 使用 Wrangler Secrets 管理敏感信息
2. **Input Validation / 输入验证**: Validate and sanitize all user inputs / 对所有用户输入进行验证和清理
3. **Rate Limiting / 速率限制**: Prevent brute force and DDoS attacks / 防止暴力破解和 DDoS 攻击
4. **Error Handling / 错误处理**: Don't leak sensitive information / 不泄露敏感信息
5. **HTTPS**: Enforce HTTPS encryption / 强制使用 HTTPS 加密
6. **Dependency Updates / 依赖更新**: Regularly update dependencies / 定期更新依赖包

## Troubleshooting / 故障排查

### Common Issues / 常见问题

**Q: JWT_SECRET not set / JWT_SECRET 未设置**
```bash
A: Run wrangler secret put JWT_SECRET to set the secret / 运行 wrangler secret put JWT_SECRET 设置密钥
```

**Q: Database connection failed / 数据库连接失败**
```bash
A: Check if database configuration in wrangler.toml is correct / 检查 wrangler.toml 中的数据库配置是否正确
```

**Q: Deployment failed / 部署失败**
```bash
A: Check if build is successful, verify environment variable configuration / 检查构建是否成功，验证环境变量配置
```

### Log Viewing / 日志查看

```bash
# View real-time logs / 查看实时日志
wrangler tail

# View specific logs / 查看特定日志
wrangler tail --format pretty
```

## Contributing / 贡献指南

Contributions are welcome! Please follow these steps:
欢迎贡献代码！请遵循以下步骤：

1. Fork this repository / Fork 本仓库
2. Create a feature branch / 创建特性分支
3. Write code and tests / 编写代码和测试
4. Submit a Pull Request / 提交 Pull Request

## License / 许可证

MIT License

---

**Winuel Backend Team** © 2026