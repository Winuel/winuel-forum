# API 概览

CloudLink 提供了完整的 RESTful API，支持论坛系统的所有核心功能。

## 基础信息

### API 端点

- **开发环境**: `YOUR_LOCALHOST:8787`
- **生产环境**: `https://api.winuel.com`

### 认证方式

API 使用 JWT（JSON Web Token）进行身份验证：

\`\`\`bash
# 在请求头中包含 Token
Authorization: Bearer &lt;your-jwt-token&gt;
\`\`\`

### 请求格式

- **Content-Type**: `application/json`
- **Accept**: `application/json`

### 响应格式

所有 API 响应都遵循统一格式：

\`\`\`json
{
  "success": true,
  "data": {...},
  "error": null,
  "timestamp": "2024-03-22T18:00:00.000Z"
}
\`\`\`

### HTTP 状态码

- **200**: 成功
- **201**: 创建成功
- **400**: 请求参数错误
- **401**: 未授权
- **403**: 禁止访问
- **404**: 资源不存在
- **500**: 服务器错误

## 认证接口

### 用户注册

\`\`\`http
POST /api/auth/register
Content-Type: application/json

{
  "username": "user123",
  "email": "user@example.com",
  "password": "password123"
}
\`\`\`

### 用户登录

\`\`\`http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
\`\`\`

### 用户登出

\`\`\`http
POST /api/auth/logout
Authorization: Bearer &lt;token&gt;
\`\`\`

### 邮箱验证

\`\`\`http
POST /api/auth/verify-email
Content-Type: application/json

{
  "token": "verification-token"
}
\`\`\`

## 用户接口

### 获取用户信息

\`\`\`http
GET /api/users/me
Authorization: Bearer &lt;token&gt;
\`\`\`

### 更新用户资料

\`\`\`http
PUT /api/users/me
Authorization: Bearer &lt;token&gt;
Content-Type: application/json

{
  "username": "newusername",
  "avatar": "https://example.com/avatar.jpg"
}
\`\`\`

### 修改密码

\`\`\`http
POST /api/users/change-password
Authorization: Bearer &lt;token&gt;
Content-Type: application/json

{
  "oldPassword": "oldpassword",
  "newPassword": "newpassword"
}
\`\`\`

## 帖子接口

### 获取帖子列表

\`\`\`http
GET /api/posts?page=1&limit=10&category=tech&tag=vue
\`\`\`

### 获取帖子详情

\`\`\`http
GET /api/posts/{postId}
\`\`\`

### 创建帖子

\`\`\`http
POST /api/posts
Authorization: Bearer &lt;token&gt;
Content-Type: application/json

{
  "title": "我的第一篇帖子",
  "content": "帖子内容...",
  "categoryId": "category-id",
  "tags": ["vue", "javascript"]
}
\`\`\`

### 更新帖子

\`\`\`http
PUT /api/posts/{postId}
Authorization: Bearer &lt;token&gt;
Content-Type: application/json

{
  "title": "更新后的标题",
  "content": "更新后的内容"
}
\`\`\`

### 删除帖子

\`\`\`http
DELETE /api/posts/{postId}
Authorization: Bearer &lt;token&gt;
\`\`\`

### 点赞帖子

\`\`\`http
POST /api/posts/{postId}/like
Authorization: Bearer &lt;token&gt;
\`\`\`

## 评论接口

### 获取评论列表

\`\`\`http
GET /api/posts/{postId}/comments
\`\`\`

### 创建评论

\`\`\`http
POST /api/posts/{postId}/comments
Authorization: Bearer &lt;token&gt;
Content-Type: application/json

{
  "content": "评论内容",
  "parentId": "parent-comment-id"
}
\`\`\`

### 更新评论

\`\`\`http
PUT /api/comments/{commentId}
Authorization: Bearer &lt;token&gt;
Content-Type: application/json

{
  "content": "更新后的评论"
}
\`\`\`

### 删除评论

\`\`\`http
DELETE /api/comments/{commentId}
Authorization: Bearer &lt;token&gt;
\`\`\`

## 错误处理

### 错误响应格式

\`\`\`json
{
  "success": false,
  "data": null,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "未授权访问",
    "details": "Token已过期"
  },
  "timestamp": "2024-03-22T18:00:00.000Z"
}
\`\`\`

### 错误码列表

- `UNAUTHORIZED`: 未授权
- `INVALID_TOKEN`: 无效的 Token
- `TOKEN_EXPIRED`: Token 已过期
- `VALIDATION_ERROR`: 参数验证失败
- `INVALID_INPUT`: 无效的输入
- `NOT_FOUND`: 资源不存在
- `FORBIDDEN`: 禁止访问

## 速率限制

API 实施了速率限制以防止滥用：

- **认证端点**: 10次/分钟
- **普通端点**: 60次/分钟
- **搜索端点**: 30次/分钟

超过限制时返回 `429 Too Many Requests`。

## 下一步

- [认证接口详情](/api/authentication)
- [用户接口详情](/api/users)
- [帖子接口详情](/api/posts)
- [评论接口详情](/api/comments)