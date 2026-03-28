# 🚨 生产环境修复指南

## 问题描述

在生产环境中，以下功能完全不可用：
- ❌ GitHub OAuth 第三方登录
- ❌ 邮箱验证码发送

## 根本原因

生产环境缺少必需的环境变量配置，这些变量必须通过 Cloudflare Wrangler Secrets 设置，不能在 `wrangler.toml` 中配置。

## 📋 快速修复步骤

### 1. 设置 JWT 密钥

```bash
cd backend

# 生成强随机密钥（至少 32 个字符）
JWT_SECRET=$(openssl rand -base64 32)

# 设置 JWT 密钥
wrangler secret put JWT_SECRET
# 粘贴生成的密钥，按回车确认
```

### 2. 设置 Resend API 密钥（邮件服务）

```bash
# 从 https://resend.com/api-keys 获取你的 API 密钥
wrangler secret put RESEND_API_KEY
# 粘贴你的 Resend API 密钥，按回车确认
```

**如果没有 Resend API 密钥：**
1. 访问 https://resend.com
2. 注册并创建免费账户
3. 进入 API Keys 页面
4. 创建新的 API 密钥
5. 复制密钥并使用上述命令设置

### 3. 设置 GitHub OAuth 凭证

#### 3.1 创建 GitHub OAuth App

1. 访问 https://github.com/settings/developers
2. 点击 "New OAuth App"
3. 填写应用信息：
   - Application name: `Winuel Forum`
   - Homepage URL: `https://www.winuel.com`
   - Authorization callback URL: `https://api.winuel.com/api/auth/github/callback`
4. 点击 "Register application"
5. 复制 Client ID 和生成 Client Secret

#### 3.2 设置 GitHub OAuth 凭证

```bash
# 设置 Client ID
wrangler secret put GITHUB_CLIENT_ID
# 粘贴你的 GitHub Client ID，按回车确认

# 设置 Client Secret
wrangler secret put GITHUB_CLIENT_SECRET
# 粘贴你的 GitHub Client Secret，按回车确认
```

### 4. 重新部署

```bash
# 构建项目
npm run build

# 部署到 Cloudflare Workers
wrangler deploy
```

## ✅ 验证修复

### 1. 检查服务健康状态

```bash
curl https://api.winuel.com/health
```

预期响应：
```json
{
  "status": "ok",
  "services": {
    "jwt": {
      "available": true,
      "error": null
    },
    "database": {
      "available": true,
      "error": null
    },
    "email": {
      "available": true,
      "error": null
    },
    "github_oauth": {
      "available": true,
      "error": null
    }
  }
}
```

### 2. 测试 OAuth 配置

```bash
curl https://api.winuel.com/api/auth/github/test
```

预期响应：
```json
{
  "success": true,
  "data": {
    "hasClientId": true,
    "hasClientSecret": true,
    "hasApiUrl": true,
    "hasKV": true,
    "hasDB": true,
    "envKeys": ["GITHUB_CLIENT_ID", "GITHUB_CLIENT_SECRET", "API_URL"],
    "environment": "production"
  }
}
```

### 3. 测试 OAuth 授权 URL 生成

```bash
curl https://api.winuel.com/api/auth/github/github/authorize
```

预期响应：
```json
{
  "success": true,
  "data": {
    "authUrl": "https://github.com/login/oauth/authorize?client_id=..."
  }
}
```

## 🔍 故障排除

### 问题：OAuth 仍然返回 "CONFIG_ERROR"

**解决方案：**
```bash
# 检查密钥是否正确设置
wrangler secret list

# 重新设置密钥
wrangler secret put GITHUB_CLIENT_ID
wrangler secret put GITHUB_CLIENT_SECRET

# 重新部署
wrangler deploy
```

### 问题：邮件服务仍然不可用

**解决方案：**
```bash
# 检查 Resend API 密钥是否有效
curl -X POST https://api.resend.com/emails \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"from":"onboarding@resend.dev","to":"test@example.com","subject":"Test","html":"<strong>Test</strong>"}'

# 如果密钥无效，重新设置
wrangler secret put RESEND_API_KEY

# 重新部署
wrangler deploy
```

### 问题：JWT 认证失败

**解决方案：**
```bash
# 确保 JWT 密钥至少 32 个字符
wrangler secret put JWT_SECRET
# 粘贴一个新的强随机密钥（openssl rand -base64 32）

# 重新部署
wrangler deploy
```

## 📚 参考资源

- [Wrangler Secrets 文档](https://developers.cloudflare.com/workers/wrangler/commands/secret/)
- [GitHub OAuth Apps 文档](https://docs.github.com/en/developers/apps/building-oauth-apps)
- [Resend API 文档](https://resend.com/docs/api-reference)

## 🆘 需要帮助？

如果问题仍然存在，请检查：

1. Cloudflare Workers 日志：
   ```bash
   wrangler tail
   ```

2. 浏览器控制台错误信息

3. 联系技术支持

---

**修复完成后，所有功能应该可以正常使用！** ✅