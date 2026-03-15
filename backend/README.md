# 云纽论坛 - 后端文档

<div align="center">

![CloudLink Backend](https://img.shields.io/badge/CloudLink-Backend-F38020)
![Hono](https://img.shields.io/badge/Hono-4.12.8-orange)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-3178C6)
![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-F38020)

</div>

## 📋 目录

- [概述](#概述)
- [技术栈](#技术栈)
- [项目结构](#项目结构)
- [快速开始](#快速开始)
- [配置说明](#配置说明)
- [API 端点](#api-端点)
- [数据库设计](#数据库设计)
- [中间件](#中间件)
- [工具函数](#工具函数)
- [错误处理](#错误处理)
- [部署](#部署)
- [测试](#测试)

## 概述

云纽论坛后端基于 Cloudflare Workers 和 Hono 框架构建，提供高性能、无服务器的 RESTful API。采用 TypeScript 开发，具有类型安全和现代化的开发体验。

### 主要特性

- 🚀 **Serverless 架构**：基于 Cloudflare Workers，自动扩缩容
- 🌍 **全球部署**：利用 Cloudflare 全球边缘网络
- 🔒 **安全可靠**：JWT 认证、速率限制、输入验证
- 📊 **高性能**：边缘数据库、键值缓存
- 🧩 **模块化设计**：清晰的代码结构和职责分离

## 技术栈

| 技术 | 版本 | 说明 |
|------|------|------|
| Hono | 4.12.8 | 轻量级 Web 框架 |
| TypeScript | 5.9.3 | 类型安全的 JavaScript |
| Cloudflare Workers | - | Serverless 计算平台 |
| D1 | - | Cloudflare 边缘数据库 (SQLite) |
| KV | - | Cloudflare 键值存储 |
| R2 | - | Cloudflare 对象存储（预留） |
| jose | ^5.9.6 | JWT 令牌处理 |
| bcryptjs | ^2.4.3 | 密码哈希 |

## 项目结构

```
backend/
├── src/
│   ├── routes/           # 路由模块
│   │   ├── auth.ts       # 认证路由
│   │   ├── posts.ts      # 帖子路由
│   │   ├── comments.ts   # 评论路由
│   │   └── categories.ts # 分类路由
│   ├── services/         # 业务逻辑层
│   │   ├── userService.ts
│   │   ├── postService.ts
│   │   └── categoryService.ts
│   ├── middleware/       # 中间件
│   │   ├── auth.ts       # 认证中间件
│   │   ├── cors.ts       # CORS 中间件
│   │   └── rateLimit.ts  # 速率限制中间件
│   ├── utils/            # 工具函数
│   │   ├── jwt.ts        # JWT 工具
│   │   ├── crypto.ts     # 加密工具
│   │   ├── validation.ts # 输入验证
│   │   └── errorHandler.ts # 错误处理
│   ├── db/               # 数据库相关
│   │   ├── schema.sql    # 数据库结构
│   │   └── models.ts     # 数据模型
│   ├── types.ts          # 类型定义
│   └── index.ts          # 应用入口
├── package.json          # 依赖配置
├── wrangler.toml         # Cloudflare Workers 配置
└── tsconfig.json         # TypeScript 配置
```

## 快速开始

### 前置要求

- Node.js >= 18.0.0
- npm >= 9.0.0
- Wrangler CLI（全局安装）

### 安装依赖

```bash
npm install
```

### 本地开发

```bash
# 构建项目
npm run build

# 启动本地开发服务器
wrangler dev
```

开发服务器将在 `http://localhost:8787` 启动。

### 生产部署

```bash
# 构建并部署
npm run build
wrangler deploy
```

## 配置说明

### wrangler.toml

```toml
name = "cloudlink-backend"
main = "src/index.ts"
compatibility_date = "2024-09-23"
compatibility_flags = ["nodejs_compat"]

[vars]
ENVIRONMENT = "development"

[[d1_databases]]
binding = "DB"
database_name = "cloudlink-db"
database_id = "8ede8043-e500-4893-a93d-58c2d1048f1a"

[[kv_namespaces]]
binding = "KV"
id = "6c15505889704c9f9f9e148394b6f0ec"
preview_id = "96179db79b6d4b5b9c0b899977a2c942"
```

### 环境变量

| 变量名 | 说明 | 必需 | 默认值 |
|--------|------|------|--------|
| JWT_SECRET | JWT 签名密钥 | 是 | - |
| ENVIRONMENT | 运行环境 | 否 | development |

### 设置环境变量

```bash
# 设置 JWT 密钥
wrangler secret put JWT_SECRET
# 输入至少 32 个字符的密钥

# 设置环境变量（开发环境）
wrangler secret put ENVIRONMENT
# 输入：development 或 production
```

## API 端点

### 基础端点

| 方法 | 端点 | 说明 | 认证 |
|------|------|------|------|
| GET | `/` | API 信息 | 否 |
| GET | `/health` | 健康检查 | 否 |

### 认证端点

| 方法 | 端点 | 说明 | 认证 | 速率限制 |
|------|------|------|------|----------|
| POST | `/api/auth/register` | 用户注册 | 否 | 5 次/分钟 |
| POST | `/api/auth/login` | 用户登录 | 否 | 5 次/分钟 |
| GET | `/api/auth/me` | 获取当前用户 | 是 | - |
| POST | `/api/auth/logout` | 用户登出 | 是 | - |

### 帖子端点

| 方法 | 端点 | 说明 | 认证 |
|------|------|------|------|
| GET | `/api/posts` | 获取帖子列表 | 否 |
| GET | `/api/posts/:id` | 获取帖子详情 | 否 |
| POST | `/api/posts` | 创建帖子 | 是 |
| PUT | `/api/posts/:id` | 更新帖子 | 是 |
| DELETE | `/api/posts/:id` | 删除帖子 | 是 |
| POST | `/api/posts/:id/like` | 点赞帖子 | 是 |
| DELETE | `/api/posts/:id/like` | 取消点赞 | 是 |

### 评论端点

| 方法 | 端点 | 说明 | 认证 |
|------|------|------|------|
| GET | `/api/comments` | 获取评论列表 | 否 |
| GET | `/api/comments/:id` | 获取评论详情 | 否 |
| POST | `/api/comments` | 创建评论 | 是 |
| PUT | `/api/comments/:id` | 更新评论 | 是 |
| DELETE | `/api/comments/:id` | 删除评论 | 是 |
| POST | `/api/comments/:id/like` | 点赞评论 | 是 |
| DELETE | `/api/comments/:id/like` | 取消点赞 | 是 |

### 分类端点

| 方法 | 端点 | 说明 | 认证 |
|------|------|------|------|
| GET | `/api/categories` | 获取分类列表 | 否 |
| GET | `/api/categories/:id` | 获取分类详情 | 否 |

详细的 API 文档请参考 [API.md](../API.md)。

## 数据库设计

### 表结构

#### users（用户表）

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

#### categories（分类表）

```sql
CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

#### posts（帖子表）

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

#### comments（评论表）

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

### 索引

```sql
CREATE INDEX idx_posts_author_id ON posts(author_id);
CREATE INDEX idx_posts_category_id ON posts(category_id);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_comments_author_id ON comments(author_id);
```

### 默认数据

```sql
INSERT INTO categories (id, name, description) VALUES
  ('1', '技术讨论', '讨论各种技术话题'),
  ('2', '生活分享', '分享生活点滴'),
  ('3', '问答专区', '提问和解答问题'),
  ('4', '资源分享', '分享有用的资源');
```

## 中间件

### authMiddleware（认证中间件）

验证 JWT 令牌并提取用户信息。

```typescript
export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization')
  // 验证逻辑...
  await next()
}
```

### corsMiddleware（CORS 中间件）

处理跨域资源共享，基于环境变量配置允许的域名。

```typescript
export const corsMiddleware = cors({
  origin: (origin: string | null, c: any) => {
    // 域名验证逻辑...
  },
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400,
})
```

### rateLimitMiddleware（速率限制中间件）

使用 KV 存储实现令牌桶算法，防止暴力破解。

```typescript
export function createRateLimit(config: RateLimitConfig) {
  return async (c: Context, next: Next) => {
    // 速率限制逻辑...
    await next()
  }
}
```

## 工具函数

### JWT 工具（jwt.ts）

```typescript
export async function generateToken(payload: JWTPayload): Promise<string>
export async function verifyToken(token: string): Promise<JWTPayload | null>
```

### 加密工具（crypto.ts）

```typescript
export async function hashPassword(password: string): Promise<string>
export async function verifyPassword(password: string, hash: string): Promise<boolean>
export function generateId(): string
```

### 验证工具（validation.ts）

```typescript
export function validatePassword(password: string): ValidationResult
export function validateEmail(email: string): ValidationResult
export function validateUsername(username: string): ValidationResult
```

### 错误处理（errorHandler.ts）

```typescript
export class AppError extends Error
export const createError: { [key: string]: (details?: string) => AppError }
export function handleError(error: unknown): ApiError
export function formatErrorResponse(error: ApiError, statusCode?: number): object
export function logError(error: unknown, context?: string): void
```

## 错误处理

### 错误代码

| 代码 | HTTP 状态码 | 说明 |
|------|-------------|------|
| UNAUTHORIZED | 401 | 未授权访问 |
| INVALID_TOKEN | 401 | 无效的令牌 |
| TOKEN_EXPIRED | 401 | 令牌已过期 |
| VALIDATION_ERROR | 400 | 输入验证失败 |
| MISSING_FIELD | 400 | 缺少必要字段 |
| NOT_FOUND | 404 | 资源不存在 |
| ALREADY_EXISTS | 409 | 资源已存在 |
| FORBIDDEN | 403 | 权限不足 |
| RATE_LIMIT_EXCEEDED | 429 | 请求过于频繁 |
| INTERNAL_ERROR | 500 | 服务器内部错误 |

### 错误响应格式

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "输入验证失败",
    "details": "密码长度至少为8个字符"
  },
  "timestamp": "2026-03-15T15:00:00.000Z"
}
```

## 部署

### 开发环境部署

```bash
# 本地开发
wrangler dev

# 预览环境
wrangler deploy --env preview
```

### 生产环境部署

```bash
# 构建项目
npm run build

# 部署到生产环境
wrangler deploy
```

### 数据库迁移

```bash
# 创建数据库
wrangler d1 create cloudlink-db

# 初始化数据库结构
wrangler d1 execute cloudlink-db --file=./src/db/schema.sql --remote

# 查询数据库
wrangler d1 execute cloudlink-db --remote --command "SELECT * FROM users"
```

### 环境变量管理

```bash
# 设置密钥
wrangler secret put JWT_SECRET

# 查看密钥（仅开发环境）
wrangler secret list

# 删除密钥
wrangler secret delete JWT_SECRET
```

## 测试

### 单元测试

```bash
# 运行测试
npm test
```

### 集成测试

```bash
# 运行集成测试
npm run test:integration
```

### 手动测试

```bash
# 测试 API 端点
curl http://localhost:8787/
curl http://localhost:8787/health
curl http://localhost:8787/api/categories
```

## 性能优化

### 缓存策略

- 使用 KV 缓存热点数据
- 实现查询结果缓存
- 设置合理的过期时间

### 数据库优化

- 使用适当的索引
- 避免 N+1 查询
- 使用参数化查询

### Worker 优化

- 最小化冷启动时间
- 优化内存使用
- 使用边缘计算优势

## 安全最佳实践

1. **密钥管理**：使用 Wrangler Secrets 管理敏感信息
2. **输入验证**：对所有用户输入进行验证和清理
3. **速率限制**：防止暴力破解和 DDoS 攻击
4. **错误处理**：不泄露敏感信息
5. **HTTPS**：强制使用 HTTPS 加密
6. **依赖更新**：定期更新依赖包

## 故障排查

### 常见问题

**Q: JWT_SECRET 未设置**
```bash
A: 运行 wrangler secret put JWT_SECRET 设置密钥
```

**Q: 数据库连接失败**
```bash
A: 检查 wrangler.toml 中的数据库配置是否正确
```

**Q: 部署失败**
```bash
A: 检查构建是否成功，验证环境变量配置
```

### 日志查看

```bash
# 查看实时日志
wrangler tail

# 查看特定日志
wrangler tail --format pretty
```

## 贡献指南

欢迎贡献代码！请遵循以下步骤：

1. Fork 本仓库
2. 创建特性分支
3. 编写代码和测试
4. 提交 Pull Request

## 许可证

MIT License

---

**CloudLink Backend Team** © 2026