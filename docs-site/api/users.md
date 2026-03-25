# 用户接口

用户接口用于管理用户信息、资料更新等功能。

## 获取当前用户信息

```http
GET /api/users/me
Authorization: Bearer &lt;token&gt;
```

**响应示例**:

```json
{
  "success": true,
  "data": {
    "id": "user-123",
    "username": "user123",
    "email": "user@example.com",
    "avatar": "https://example.com/avatar.jpg",
    "role": "user",
    "bio": "个人简介",
    "createdAt": "2024-03-22T10:00:00.000Z",
    "updatedAt": "2024-03-22T12:00:00.000Z"
  },
  "timestamp": "2024-03-22T12:00:00.000Z"
}
```

## 更新用户资料

```http
PUT /api/users/me
Authorization: Bearer &lt;token&gt;
Content-Type: application/json

{
  "username": "newusername",
  "avatar": "https://example.com/avatar.jpg",
  "bio": "更新后的个人简介"
}
```

**请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| username | string | 否 | 用户名 |
| avatar | string | 否 | 头像URL |
| bio | string | 否 | 个人简介 |

## 修改密码

```http
POST /api/users/change-password
Authorization: Bearer &lt;token&gt;
Content-Type: application/json

{
  "oldPassword": "oldpassword",
  "newPassword": "newpassword"
}
```

**请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| oldPassword | string | 是 | 原密码 |
| newPassword | string | 是 | 新密码 |

## 获取用户公开信息

```http
GET /api/users/{userId}
```

**路径参数**:

| 参数 | 类型 | 说明 |
|------|------|------|
| userId | string | 用户ID |

## 上传头像

```http
POST /api/users/avatar
Authorization: Bearer &lt;token&gt;
Content-Type: multipart/form-data

avatar: &lt;file&gt;
```

## 获取用户统计信息

```http
GET /api/users/{userId}/stats
```

**响应示例**:

```json
{
  "success": true,
  "data": {
    "postsCount": 42,
    "commentsCount": 156,
    "likesReceived": 89,
    "followersCount": 23,
    "followingCount": 15
  },
  "timestamp": "2024-03-22T12:00:00.000Z"
}
```

## 关注用户

```http
POST /api/users/{userId}/follow
Authorization: Bearer &lt;token&gt;
```

## 取消关注

```http
DELETE /api/users/{userId}/follow
Authorization: Bearer &lt;token&gt;
```

## 获取关注列表

```http
GET /api/users/{userId}/following?page=1&limit=20
```

## 获取粉丝列表

```http
GET /api/users/{userId}/followers?page=1&limit=20
```

## 错误码

| 错误码 | 说明 |
|--------|------|
| USER_NOT_FOUND | 用户不存在 |
| INVALID_PASSWORD | 密码错误 |
| USERNAME_EXISTS | 用户名已存在 |
| INVALID_FILE | 无效的文件格式 |

## 下一步

- [认证接口](/api/authentication)
- [帖子接口](/api/posts)
- [评论接口](/api/comments)