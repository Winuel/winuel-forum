# 认证接口

认证接口用于处理用户注册、登录、登出等认证相关操作。

## 用户注册

```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "user123",
  "email": "user@example.com",
  "password": "password123"
}
```

**请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| username | string | 是 | 用户名，3-20个字符 |
| email | string | 是 | 邮箱地址 |
| password | string | 是 | 密码，至少8个字符 |

**响应示例**:

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-123",
      "username": "user123",
      "email": "user@example.com",
      "role": "user",
      "createdAt": "2024-03-22T10:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "timestamp": "2024-03-22T10:00:00.000Z"
}
```

## 用户登录

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| email | string | 是 | 邮箱地址 |
| password | string | 是 | 密码 |

**响应示例**:

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-123",
      "username": "user123",
      "email": "user@example.com",
      "role": "user"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "timestamp": "2024-03-22T10:00:00.000Z"
}
```

## 用户登出

```http
POST /api/auth/logout
Authorization: Bearer &lt;token&gt;
```

**响应示例**:

```json
{
  "success": true,
  "data": {
    "message": "登出成功"
  },
  "timestamp": "2024-03-22T10:00:00.000Z"
}
```

## 邮箱验证

```http
POST /api/auth/verify-email
Content-Type: application/json

{
  "token": "verification-token"
}
```

**请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| token | string | 是 | 验证令牌 |

## 刷新令牌

```http
POST /api/auth/refresh-token
Authorization: Bearer &lt;token&gt;
```

## 密码重置

### 请求重置密码

```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

### 重置密码

```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "reset-token",
  "newPassword": "newpassword123"
}
```

## 错误码

| 错误码 | 说明 |
|--------|------|
| INVALID_CREDENTIALS | 用户名或密码错误 |
| USER_ALREADY_EXISTS | 用户已存在 |
| INVALID_TOKEN | 无效的令牌 |
| TOKEN_EXPIRED | 令牌已过期 |
| EMAIL_NOT_VERIFIED | 邮箱未验证 |

## 下一步

- [用户接口](/api/users)
- [帖子接口](/api/posts)
- [评论接口](/api/comments)