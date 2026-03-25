# 评论接口

评论接口用于管理帖子的评论和回复。

## 获取评论列表

```http
GET /api/posts/{postId}/comments?page=1&limit=20&sort=latest
```

**路径参数**:

| 参数 | 类型 | 说明 |
|------|------|------|
| postId | string | 帖子ID |

**查询参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码，默认1 |
| limit | number | 否 | 每页数量，默认20 |
| sort | string | 否 | 排序方式：latest(最新)、oldest(最早)、popular(热门) |

**响应示例**:

```json
{
  "success": true,
  "data": {
    "comments": [
      {
        "id": "comment-123",
        "content": "评论内容",
        "author": {
          "id": "user-123",
          "username": "user123",
          "avatar": "https://example.com/avatar.jpg"
        },
        "postId": "post-123",
        "parentId": null,
        "likesCount": 5,
        "repliesCount": 3,
        "createdAt": "2024-03-22T10:00:00.000Z",
        "updatedAt": "2024-03-22T10:05:00.000Z",
        "replies": [
          {
            "id": "comment-456",
            "content": "回复内容",
            "author": {
              "id": "user-456",
              "username": "user456",
              "avatar": "https://example.com/avatar2.jpg"
            },
            "likesCount": 2,
            "createdAt": "2024-03-22T10:10:00.000Z"
          }
        ]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 56,
      "totalPages": 3
    }
  },
  "timestamp": "2024-03-22T12:00:00.000Z"
}
```

## 创建评论

```http
POST /api/posts/{postId}/comments
Authorization: Bearer &lt;token&gt;
Content-Type: application/json

{
  "content": "评论内容",
  "parentId": "parent-comment-id"
}
```

**请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| content | string | 是 | 评论内容 |
| parentId | string | 否 | 父评论ID（用于回复） |

## 更新评论

```http
PUT /api/comments/{commentId}
Authorization: Bearer &lt;token&gt;
Content-Type: application/json

{
  "content": "更新后的评论内容"
}
```

## 删除评论

```http
DELETE /api/comments/{commentId}
Authorization: Bearer &lt;token&gt;
```

## 点赞评论

```http
POST /api/comments/{commentId}/like
Authorization: Bearer &lt;token&gt;
```

**响应示例**:

```json
{
  "success": true,
  "data": {
    "liked": true,
    "likesCount": 6
  },
  "timestamp": "2024-03-22T12:00:00.000Z"
}
```

## 取消点赞评论

```http
DELETE /api/comments/{commentId}/like
Authorization: Bearer &lt;token&gt;
```

## 获取评论详情

```http
GET /api/comments/{commentId}
```

## 获取用户评论

```http
GET /api/users/{userId}/comments?page=1&limit=20
```

## 批量删除评论

```http
POST /api/comments/batch-delete
Authorization: Bearer &lt;token&gt;
Content-Type: application/json

{
  "commentIds": ["comment-1", "comment-2", "comment-3"]
}
```

## 举报评论

```http
POST /api/comments/{commentId}/report
Authorization: Bearer &lt;token&gt;
Content-Type: application/json

{
  "reason": "spam",
  "description": "评论包含垃圾信息"
}
```

**举报原因**:

| 值 | 说明 |
|----|------|
| spam | 垃圾信息 |
| offensive | 冒犯性内容 |
| inappropriate | 不当内容 |
| other | 其他 |

## 错误码

| 错误码 | 说明 |
|--------|------|
| COMMENT_NOT_FOUND | 评论不存在 |
| INVALID_CONTENT | 内容无效 |
| COMMENT_DELETED | 评论已删除 |
| NO_PERMISSION | 无权限操作 |

## 下一步

- [认证接口](/api/authentication)
- [用户接口](/api/users)
- [帖子接口](/api/posts)