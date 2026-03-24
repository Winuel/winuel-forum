# Resend 邮件服务配置指南

## 📋 概述

本文档指导如何配置 Resend 邮件服务以支持用户注册验证码功能。

## 🔧 配置步骤

### 1. 设置 Resend API Key（Secret）

Resend API Key 包含敏感信息，需要使用 Cloudflare Workers 的 secret 功能进行安全存储。

```bash
cd backend
wrangler secret put RESEND_API_KEY
```

在提示时输入您的 API Key：
```
re_Kh5z758B_D1ETTayBftzYw6dw9wyNNuyT
```

### 2. 验证环境变量配置

确保 `wrangler.toml` 文件中已配置以下环境变量：

```toml
[vars]
RESEND_FROM_EMAIL = "noreply@mail.winuel.com"
RESEND_FROM_NAME = "云纽论坛"
```

这些变量已经在 `wrangler.toml` 中配置完成。

### 3. 运行数据库迁移

创建验证码表：

```bash
cd backend
# 使用 Wrangler 执行迁移
wrangler d1 execute cloudlink-db --file=migrations/008_add_verification_codes.sql
```

## 🚀 部署

部署到 Cloudflare Workers：

```bash
cd backend
wrangler deploy
```

## 📡 API 端点

### 1. 发送验证码

**端点**: `POST /api/auth/send-verification-code`

**请求体**:
```json
{
  "email": "user@example.com",
  "type": "register"
}
```

**响应**:
```json
{
  "success": true,
  "message": "验证码已发送，请查看您的邮箱"
}
```

**类型说明**:
- `register`: 注册验证
- `reset_password`: 重置密码
- `change_email`: 更改邮箱
- `verify_email`: 验证邮箱

### 2. 验证验证码

**端点**: `POST /api/auth/verify-code`

**请求体**:
```json
{
  "email": "user@example.com",
  "code": "123456",
  "type": "register"
}
```

**响应**:
```json
{
  "success": true,
  "message": "验证码验证成功"
}
```

### 3. 用户注册（已集成验证码）

**端点**: `POST /api/auth/register`

**请求体**:
```json
{
  "username": "testuser",
  "email": "user@example.com",
  "password": "Password123!",
  "verificationCode": "123456"
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "username": "testuser",
      "email": "user@example.com",
      "role": "user"
    },
    "token": "..."
  }
}
```

## 🔒 安全特性

- ✅ **验证码有效期**: 5分钟
- ✅ **冷却期**: 同一邮箱60秒内只能发送1次
- ✅ **尝试次数限制**: 最多3次验证尝试
- ✅ **验证码使用后失效**: 防止重复使用
- ✅ **API Key 安全存储**: 使用 Cloudflare Workers secret
- ✅ **一次性邮箱检测**: 拦截临时邮箱注册

## 📧 邮件模板

验证码邮件包含：
- 6位数字验证码
- 品牌标识
- 有效期说明
- 安全提示
- 响应式设计

## 🧪 测试

本地测试：

```bash
cd backend
npm run dev
```

使用 curl 或 Postman 测试 API 端点。

## 📝 注意事项

1. **域名验证**: 确保在 Resend Dashboard 中已验证 `mail.winuel.com` 域名
2. **API Key 保护**: 永远不要将 API Key 提交到版本控制系统
3. **限流**: 验证码端点已配置限流保护
4. **日志**: 邮件发送状态会记录到控制台
5. **错误处理**: 邮件服务不可用时，系统会优雅降级

## 🐛 故障排除

### 问题：邮件发送失败

1. 检查 Resend API Key 是否正确配置
2. 确认域名已在 Resend Dashboard 中验证
3. 检查网络连接
4. 查看控制台日志获取详细错误信息

### 问题：验证码验证失败

1. 确认验证码是否正确（6位数字）
2. 检查验证码是否已过期（5分钟有效期）
3. 确认验证码未被使用
4. 检查尝试次数是否超过限制

### 问题：本地开发时邮件服务不可用

本地开发时，可以设置以下环境变量进行测试：

```bash
# 在本地开发环境中设置（仅用于测试，生产环境必须使用 secret）
export RESEND_API_KEY="re_Kh5z758B_D1ETTayBftzYw6dw9wyNNuyT"
```

## 📞 支持

如有问题，请联系开发团队或查阅 Resend 官方文档：
- Resend 文档: https://resend.com/docs
- Resend Dashboard: https://resend.com/dashboard