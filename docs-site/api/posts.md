# 帖子接口

帖子接口用于创建、查询、更新和删除帖子内容。

## 获取帖子列表

\`\`\`http
GET /api/posts?page=1&limit=10&category=tech&tag=vue&sort=latest
\`\`\`

**查询参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码，默认1 |
| limit | number | 否 | 每页数量，默认10 |
| category | string | 否 | 分类ID |
| tag | string | 否 | 标签名称 |
| sort | string | 否 | 排序方式：latest(最新)、popular(热门)、comments(评论多) |
| search | string | 否 | 搜索关键词 |

**响应示例**:

\`\`\`json
{
  "success": true,
  "data": {
    "posts": [
      {
        "id": "post-123",
        "title": "帖子标题",
        "content": "帖子内容...",
        "author": {
          "id": "user-123",
          "username": "user123",
          "avatar": "https://example.com/avatar.jpg"
        },
        "category": {
          "id": "cat-1",
          "name": "技术讨论"
        },
        "tags": ["vue", "javascript"],
        "likesCount": 42,
        "commentsCount": 15,
        "viewsCount": 234,
        "createdAt": "2024-03-22T10:00:00.000Z",
        "updatedAt": "2024-03-22T12:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 156,
      "totalPages": 16
    }
  },
  "timestamp": "2024-03-22T12:00:00.000Z"
}
\`\`\`

## 获取帖子详情

\`\`\`http
GET /api/posts/{postId}
\`\`\`

**路径参数**:

| 参数 | 类型 | 说明 |
|------|------|------|
| postId | string | 帖子ID |

## 创建帖子

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

**请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| title | string | 是 | 帖子标题 |
| content | string | 是 | 帖子内容，支持Markdown |
| categoryId | string | 是 | 分类ID |
| tags | array | 否 | 标签数组 |

## 更新帖子

\`\`\`http
PUT /api/posts/{postId}
Authorization: Bearer &lt;token&gt;
Content-Type: application/json

{
  "title": "更新后的标题",
  "content": "更新后的内容",
  "categoryId": "new-category-id",
  "tags": ["vue", "typescript"]
}
\`\`\`

## 删除帖子

\`\`\`http
DELETE /api/posts/{postId}
Authorization: Bearer &lt;token&gt;
\`\`\`

## 点赞帖子

\`\`\`http
POST /api/posts/{postId}/like
Authorization: Bearer &lt;token&gt;
\`\`\`

**响应示例**:

\`\`\`json
{
  "success": true,
  "data": {
    "liked": true,
    "likesCount": 43
  },
  "timestamp": "2024-03-22T12:00:00.000Z"
}
\`\`\`

## 取消点赞

\`\`\`http
DELETE /api/posts/{postId}/like
Authorization: Bearer &lt;token&gt;
\`\`\`

## 收藏帖子

\`\`\`http
POST /api/posts/{postId}/bookmark
Authorization: Bearer &lt;token&gt;
\`\`\`

## 取消收藏

\`\`\`http
DELETE /api/posts/{postId}/bookmark
Authorization: Bearer &lt;token&gt;
\`\`\`

## 获取用户帖子

\`\`\`http
GET /api/users/{userId}/posts?page=1&limit=10
\`\`\`

## 搜索帖子

\`\`\`http
GET /api/posts/search?q=vue&page=1&limit=10
\`\`\`

**查询参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| q | string | 是 | 搜索关键词 |
| page | number | 否 | 页码 |
| limit | number | 否 | 每页数量 |

## 获取热门帖子

\`\`\`http
GET /api/posts/hot?days=7&limit=10
\`\`\`

## 获取推荐帖子

\`\`\`http
GET /api/posts/recommended
Authorization: Bearer &lt;token&gt;
\`\`\`

## 错误码

| 错误码 | 说明 |
|--------|------|
| POST_NOT_FOUND | 帖子不存在 |
| NO_PERMISSION | 无权限操作 |
| INVALID_CONTENT | 内容无效 |
| POST_LOCKED | 帖子已锁定 |

## 下一步

- [认证接口](/api/authentication)
- [用户接口](/api/users)
- [评论接口](/api/comments)