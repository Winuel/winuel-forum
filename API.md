# 云纽论坛 API 文档

<div align="center">

![CloudLink API](https://img.shields.io/badge/CloudLink-API-F38020)
![REST](https://img.shields.io/badge/API-REST-02569B)
![JSON](https://img.shields.io/badge/Format-JSON-000000)

</div>

## 📋 目录

- [概述](#概述)
- [基础信息](#基础信息)
- [认证](#认证)
- [错误处理](#错误处理)
- [API 端点](#api-端点)
- [数据模型](#数据模型)
- [示例请求](#示例请求)

## 概述

云纽论坛 API 是基于 REST 架构设计的 API，提供完整的论坛功能接口。所有端点都返回 JSON 格式的响应，支持 CORS 跨域请求。

### 基础 URL

- **开发环境**：`http://localhost:8787`
- **生产环境**：`https://api.winuel.com`

## 基础信息

### HTTP 方法

| 方法 | 说明 |
|------|------|
| GET | 获取资源 |
| POST | 创建资源 |
| PUT | 更新资源 |
| DELETE | 删除资源 |

### 状态码

| 状态码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 201 | 创建成功 |
| 400 | 请求参数错误 |
| 401 | 未授权 |
| 403 | 禁止访问 |
| 404 | 资源不存在 |
| 429 | 请求过于频繁 |
| 500 | 服务器错误 |

### 请求头

| 头名称 | 说明 | 必需 |
|--------|------|------|
| Content-Type | 内容类型 | 是（POST/PUT） |
| Authorization | 认证令牌 | 是（需要认证的端点） |

### 响应头

| 头名称 | 说明 |
|--------|------|
| X-RateLimit-Limit | 速率限制总数 |
| X-RateLimit-Remaining | 剩余请求次数 |
| X-RateLimit-Reset | 重置时间戳 |

## 认证

### JWT 认证

API 使用 JWT（JSON Web Token）进行认证。需要在请求头中包含有效的 JWT 令牌。

#### 获取令牌

通过登录接口获取 JWT 令牌：

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### 使用令牌

在需要认证的端点中，将令牌添加到请求头：

```http
Authorization: Bearer <your-jwt-token>
```

#### 令牌有效期

JWT 令牌有效期为 7 天，过期后需要重新登录。

## 错误处理

### 错误响应格式

所有错误响应都遵循统一的格式：

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "错误描述",
    "details": "详细错误信息（可选）"
  },
  "timestamp": "2026-03-15T15:00:00.000Z"
}
```

### 错误代码

| 代码 | HTTP 状态码 | 说明 |
|------|-------------|------|
| UNAUTHORIZED | 401 | 未授权访问 |
| INVALID_TOKEN | 401 | 无效的令牌 |
| TOKEN_EXPIRED | 401 | 令牌已过期 |
| VALIDATION_ERROR | 400 | 输入验证失败 |
| INVALID_INPUT | 400 | 无效的输入 |
| MISSING_FIELD | 400 | 缺少必要字段 |
| NOT_FOUND | 404 | 资源不存在 |
| ALREADY_EXISTS | 409 | 资源已存在 |
| FORBIDDEN | 403 | 权限不足 |
| RATE_LIMIT_EXCEEDED | 429 | 请求过于频繁 |
| INTERNAL_ERROR | 500 | 服务器内部错误 |

### 错误示例

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

## API 端点

### 基础端点

#### 获取 API 信息

```http
GET /
```

**响应示例：**

```json
{
  "name": "云纽论坛 API",
  "version": "1.0.0",
  "status": "running"
}
```

#### 健康检查

```http
GET /health
```

**响应示例：**

```json
{
  "status": "ok"
}
```

### 认证端点

#### 用户注册

```http
POST /api/auth/register
Content-Type: application/json
```

**请求体：**

```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "Password123!"
}
```

**验证规则：**
- `username`：3-20 个字符，支持中文、字母、数字、下划线和连字符
- `email`：有效的邮箱格式
- `password`：至少 8 个字符，仅包含字母和数字（不区分大小写），不能使用常见弱密码

**成功响应：**

```json
{
  "user": {
    "id": "user-id",
    "username": "testuser",
    "email": "test@example.com",
    "role": "user",
    "createdAt": "2026-03-15T15:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### 用户登录

```http
POST /api/auth/login
Content-Type: application/json
```

**请求体：**

```json
{
  "email": "test@example.com",
  "password": "Password123!"
}
```

**成功响应：**

```json
{
  "user": {
    "id": "user-id",
    "username": "testuser",
    "email": "test@example.com",
    "role": "user",
    "createdAt": "2026-03-15T15:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### 获取当前用户

```http
GET /api/auth/me
Authorization: Bearer <token>
```

**成功响应：**

```json
{
  "id": "user-id",
  "username": "testuser",
  "email": "test@example.com",
  "avatar": "https://example.com/avatar.jpg",
  "role": "user",
  "createdAt": "2026-03-15T15:00:00.000Z"
}
```

#### 用户登出

```http
POST /api/auth/logout
Authorization: Bearer <token>
```

**成功响应：**

```json
{
  "message": "退出成功"
}
```

### 帖子端点

#### 获取帖子列表

```http
GET /api/posts?page=1&limit=20&category=1&tag=vue&sort=latest
```

**查询参数：**

| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码，默认 1 |
| limit | number | 否 | 每页数量，默认 20 |
| category | string | 否 | 分类 ID |
| tag | string | 否 | 标签名称 |
| sort | string | 否 | 排序方式：latest（最新）、hot（热门）、popular（热门） |

**成功响应：**

```json
{
  "posts": [
    {
      "id": "post-id",
      "title": "帖子标题",
      "content": "帖子内容...",
      "author": {
        "id": "user-id",
        "username": "testuser",
        "avatar": "https://example.com/avatar.jpg"
      },
      "category": {
        "id": "1",
        "name": "技术讨论"
      },
      "tags": ["vue", "typescript"],
      "viewCount": 100,
      "likeCount": 10,
      "commentCount": 5,
      "createdAt": "2026-03-15T15:00:00.000Z",
      "updatedAt": "2026-03-15T15:00:00.000Z"
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 20
}
```

#### 获取帖子详情

```http
GET /api/posts/:id
```

**成功响应：**

```json
{
  "id": "post-id",
  "title": "帖子标题",
  "content": "帖子内容...",
  "author": {
    "id": "user-id",
    "username": "testuser",
    "avatar": "https://example.com/avatar.jpg"
  },
  "category": {
    "id": "1",
    "name": "技术讨论",
    "description": "讨论各种技术话题"
  },
  "tags": ["vue", "typescript"],
  "viewCount": 100,
  "likeCount": 10,
  "commentCount": 5,
  "createdAt": "2026-03-15T15:00:00.000Z",
  "updatedAt": "2026-03-15T15:00:00.000Z",
  "isLiked": false
}
```

#### 创建帖子

```http
POST /api/posts
Authorization: Bearer <token>
Content-Type: application/json
```

**请求体：**

```json
{
  "title": "帖子标题",
  "content": "帖子内容...",
  "categoryId": "1",
  "tags": ["vue", "typescript"]
}
```

**成功响应：**

```json
{
  "id": "new-post-id",
  "title": "帖子标题",
  "content": "帖子内容...",
  "author": {
    "id": "user-id",
    "username": "testuser"
  },
  "categoryId": "1",
  "tags": ["vue", "typescript"],
  "createdAt": "2026-03-15T15:00:00.000Z"
}
```

#### 更新帖子

```http
PUT /api/posts/:id
Authorization: Bearer <token>
Content-Type: application/json
```

**请求体：**

```json
{
  "title": "更新的标题",
  "content": "更新的内容...",
  "categoryId": "2",
  "tags": ["vue"]
}
```

**成功响应：**

```json
{
  "id": "post-id",
  "title": "更新的标题",
  "content": "更新的内容...",
  "updatedAt": "2026-03-15T15:30:00.000Z"
}
```

#### 删除帖子

```http
DELETE /api/posts/:id
Authorization: Bearer <token>
```

**成功响应：**

```json
{
  "message": "帖子已删除"
}
```

#### 点赞帖子

```http
POST /api/posts/:id/like
Authorization: Bearer <token>
```

**成功响应：**

```json
{
  "message": "点赞成功",
  "likeCount": 11,
  "isLiked": true
}
```

#### 取消点赞帖子

```http
DELETE /api/posts/:id/like
Authorization: Bearer <token>
```

**成功响应：**

```json
{
  "message": "取消点赞成功",
  "likeCount": 10,
  "isLiked": false
}
```

### 评论端点

#### 获取评论列表

```http
GET /api/posts/:postId/comments?page=1&limit=20
```

**查询参数：**

| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码，默认 1 |
| limit | number | 否 | 每页数量，默认 20 |

**成功响应：**

```json
{
  "comments": [
    {
      "id": "comment-id",
      "content": "评论内容...",
      "author": {
        "id": "user-id",
        "username": "testuser",
        "avatar": "https://example.com/avatar.jpg"
      },
      "likeCount": 5,
      "createdAt": "2026-03-15T15:00:00.000Z",
      "isLiked": false,
      "replies": []
    }
  ],
  "total": 10,
  "page": 1,
  "limit": 20
}
```

#### 创建评论

```http
POST /api/comments
Authorization: Bearer <token>
Content-Type: application/json
```

**请求体：**

```json
{
  "postId": "post-id",
  "content": "评论内容...",
  "parentId": "parent-comment-id"
}
```

**成功响应：**

```json
{
  "id": "new-comment-id",
  "postId": "post-id",
  "content": "评论内容...",
  "author": {
    "id": "user-id",
    "username": "testuser"
  },
  "createdAt": "2026-03-15T15:00:00.000Z"
}
```

#### 更新评论

```http
PUT /api/comments/:id
Authorization: Bearer <token>
Content-Type: application/json
```

**请求体：**

```json
{
  "content": "更新的评论内容..."
}
```

**成功响应：**

```json
{
  "id": "comment-id",
  "content": "更新的评论内容...",
  "updatedAt": "2026-03-15T15:30:00.000Z"
}
```

#### 删除评论

```http
DELETE /api/comments/:id
Authorization: Bearer <token>
```

**成功响应：**

```json
{
  "message": "评论已删除"
}
```

### 分类端点

#### 获取分类列表

```http
GET /api/categories
```

**成功响应：**

```json
{
  "categories": [
    {
      "id": "1",
      "name": "技术讨论",
      "description": "讨论各种技术话题",
      "postCount": 100,
      "createdAt": "2026-03-15T15:00:00.000Z"
    }
  ]
}
```

#### 获取分类详情

```http
GET /api/categories/:id
```

**成功响应：**

```json
{
  "id": "1",
  "name": "技术讨论",
  "description": "讨论各种技术话题",
  "postCount": 100,
  "createdAt": "2026-03-15T15:00:00.000Z"
}
```

## 数据模型

### User（用户）

```typescript
interface User {
  id: string
  username: string
  email: string
  avatar?: string
  role: 'user' | 'admin' | 'moderator'
  createdAt: string
  updatedAt: string
}
```

### Post（帖子）

```typescript
interface Post {
  id: string
  title: string
  content: string
  author: {
    id: string
    username: string
    avatar?: string
  }
  category: {
    id: string
    name: string
  }
  tags: string[]
  viewCount: number
  likeCount: number
  commentCount: number
  createdAt: string
  updatedAt: string
  isLiked?: boolean
}
```

### Comment（评论）

```typescript
interface Comment {
  id: string
  content: string
  author: {
    id: string
    username: string
    avatar?: string
  }
  postId: string
  parentId?: string
  likeCount: number
  createdAt: string
  updatedAt: string
  isLiked?: boolean
  replies?: Comment[]
}
```

### Category（分类）

```typescript
interface Category {
  id: string
  name: string
  description?: string
  postCount?: number
  createdAt: string
}
```

## 示例请求

### 使用 cURL

#### 用户注册

```bash
curl -X POST https://api.winuel.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "Password123!"
  }'
```

#### 用户登录

```bash
curl -X POST https://api.winuel.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123!"
  }'
```

#### 获取帖子列表

```bash
curl -X GET "https://api.winuel.com/api/posts?page=1&limit=20"
```

#### 创建帖子

```bash
curl -X POST https://api.winuel.com/api/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-token>" \
  -d '{
    "title": "我的第一个帖子",
    "content": "这是帖子的内容...",
    "categoryId": "1",
    "tags": ["vue", "typescript"]
  }'
```

### 使用 JavaScript

```javascript
// 使用 fetch API
async function getPosts() {
  const response = await fetch('https://api.winuel.com/api/posts');
  const data = await response.json();
  return data;
}

async function createPost(token, postData) {
  const response = await fetch('https://api.winuel.com/api/posts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(postData)
  });
  const data = await response.json();
  return data;
}
```

### 使用 Python

```python
import requests

# 获取帖子列表
response = requests.get('https://api.winuel.com/api/posts')
posts = response.json()

# 创建帖子
token = 'your-jwt-token'
headers = {
    'Content-Type': 'application/json',
    'Authorization': f'Bearer {token}'
}
data = {
    'title': '我的第一个帖子',
    'content': '这是帖子的内容...',
    'categoryId': '1',
    'tags': ['vue', 'typescript']
}
response = requests.post(
    'https://api.winuel.com/api/posts',
    headers=headers,
    json=data
)
post = response.json()
```

## 速率限制

API 实现了速率限制以防止滥用：

| 端点类型 | 限制 | 时间窗口 |
|----------|------|----------|
| 认证端点 | 5 次 | 1 分钟 |
| 普通端点 | 100 次 | 15 分钟 |

当超过速率限制时，API 返回 429 状态码：

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "请求过于频繁，请稍后再试"
  },
  "timestamp": "2026-03-15T15:00:00.000Z"
}
```

响应头包含速率限制信息：

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1678886400
Retry-After: 300
```

## 版本控制

API 版本：1.0.0

版本信息包含在每个响应头中：

```
X-API-Version: 1.0.0
```

## 支持

如有问题或建议，请通过以下方式联系：

- GitHub Issues：[https://github.com/LemonStudio-hub/yunniu/issues](https://github.com/LemonStudio-hub/yunniu/issues)
- 邮箱：support@cloudlink.dev

---

**CloudLink API Team** © 2026