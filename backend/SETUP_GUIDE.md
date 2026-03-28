# 🔐 环境变量配置指南

## 📋 配置信息

以下是您提供的配置信息：

- **GitHub OAuth Client ID**: `Ov23li5PPV5WgnJfyrAy`
- **GitHub OAuth Client Secret**: `93c624f412a75816871b18e7fa0dd9c2c2be070a`
- **Resend API Key**: `re_ZV61fiio_22oGjD2S63tE3UcTgC53bWXs`
- **JWT Secret**: `IhL9sxZuzoGAEijmRq3A39+zWJUaWXkEDxvaqg2VYx8=`（已生成）

---

## 🚀 快速配置（推荐）

### 方法 1: 使用配置脚本（需要 Cloudflare API Token）

```bash
# 进入 backend 目录
cd backend

# 设置 Cloudflare API Token
export CLOUDFLARE_API_TOKEN=your_cloudflare_api_token_here

# 运行配置脚本
chmod +x setup-secrets.sh
./setup-secrets.sh
```

### 方法 2: 交互式配置（无需 API Token）

```bash
# 进入 backend 目录
cd backend

# 登录 Cloudflare（首次）
wrangler login

# 配置 GitHub OAuth Client ID
wrangler secret put GITHUB_CLIENT_ID
# 输入: Ov23li5PPV5WgnJfyrAy

# 配置 GitHub OAuth Client Secret
wrangler secret put GITHUB_CLIENT_SECRET
# 输入: 93c624f412a75816871b18e7fa0dd9c2c2be070a

# 配置 Resend API Key
wrangler secret put RESEND_API_KEY
# 输入: re_ZV61fiio_22oGjD2S63tE3UcTgC53bWXs

# 配置 JWT Secret
wrangler secret put JWT_SECRET
# 输入: IhL9sxZuzoGAEijmRq3A39+zWJUaWXkEDxvaqg2VYx8=
```

### 方法 3: 单条命令配置（需要 Cloudflare API Token）

```bash
# 进入 backend 目录
cd backend

# 设置 Cloudflare API Token
export CLOUDFLARE_API_TOKEN=your_cloudflare_api_token_here

# 配置所有密钥
echo "Ov23li5PPV5WgnJfyrAy" | wrangler secret put GITHUB_CLIENT_ID
echo "93c624f412a75816871b18e7fa0dd9c2c2be070a" | wrangler secret put GITHUB_CLIENT_SECRET
echo "re_ZV61fiio_22oGjD2S63tE3UcTgC53bWXs" | wrangler secret put RESEND_API_KEY
echo "IhL9sxZuzoGAEijmRq3A39+zWJUaWXkEDxvaqg2VYx8=" | wrangler secret put JWT_SECRET
```

---

## 🔑 获取 Cloudflare API Token

如果您选择方法 1 或方法 3，需要先创建 Cloudflare API Token：

### 步骤：

1. 访问 https://dash.cloudflare.com/profile/api-tokens
2. 点击 "Create Token"
3. 选择 "Edit Cloudflare Workers" 模板
4. 或者创建自定义 Token，需要以下权限：
   - Account - Workers Scripts - Edit
   - Account - Account Settings - Read
5. 设置 Token 名称和有效期
6. 点击 "Continue to summary"
7. 点击 "Create Token"
8. 复制生成的 Token

### 使用 Token：

```bash
export CLOUDFLARE_API_TOKEN=your_token_here
```

---

## ✅ 验证配置

配置完成后，验证所有服务是否正常运行：

```bash
# 1. 检查服务健康状态
curl https://api.winuel.com/health

# 预期响应：
# {
#   "status": "ok",
#   "services": {
#     "jwt": { "available": true, "error": null },
#     "database": { "available": true, "error": null },
#     "email": { "available": true, "error": null },
#     "github_oauth": { "available": true, "error": null }
#   }
# }

# 2. 测试 OAuth 配置
curl https://api.winuel.com/api/auth/github/test

# 预期响应：
# {
#   "success": true,
#   "data": {
#     "hasClientId": true,
#     "hasClientSecret": true,
#     "hasApiUrl": true,
#     "hasKV": true,
#     "hasDB": true,
#     "envKeys": ["GITHUB_CLIENT_ID", "GITHUB_CLIENT_SECRET", "API_URL"]
#   }
# }

# 3. 测试 OAuth 授权 URL 生成
curl https://api.winuel.com/api/auth/github/github/authorize

# 预期响应：
# {
#   "success": true,
#   "data": {
#     "authUrl": "https://github.com/login/oauth/authorize?client_id=..."
#   }
# }
```

---

## 🚀 部署应用

配置完成后，部署应用到 Cloudflare Workers：

```bash
# 1. 构建项目
npm run build

# 2. 部署到 Cloudflare Workers
wrangler deploy

# 3. 查看部署日志
wrangler tail
```

---

## 🔍 故障排除

### 问题 1: "Failed to fetch auth token: 400 Bad Request"

**原因**: Cloudflare API Token 无效或未设置

**解决方案**:
```bash
# 检查 Token 是否设置
echo $CLOUDFLARE_API_TOKEN

# 重新设置 Token
export CLOUDFLARE_API_TOKEN=your_valid_token_here

# 或者使用交互式登录
wrangler login
```

### 问题 2: "There doesn't seem to be a Worker called 'winuel-backend'"

**原因**: Worker 尚未创建

**解决方案**:
```bash
# 第一次部署时会自动创建 Worker
wrangler deploy
```

### 问题 3: 验证码发送失败

**原因**: Resend API Key 无效

**解决方案**:
```bash
# 重新设置 Resend API Key
wrangler secret put RESEND_API_KEY
# 输入正确的 API Key
```

### 问题 4: OAuth 登录失败

**原因**: GitHub OAuth 凭证无效

**解决方案**:
```bash
# 重新设置 GitHub OAuth 凭证
wrangler secret put GITHUB_CLIENT_ID
wrangler secret put GITHUB_CLIENT_SECRET
# 输入正确的凭证
```

---

## 📚 参考资源

- [Wrangler Secrets 文档](https://developers.cloudflare.com/workers/wrangler/commands/secret/)
- [Cloudflare API Token 文档](https://developers.cloudflare.com/fundamentals/api/get-started/create-token/)
- [GitHub OAuth Apps 文档](https://docs.github.com/en/developers/apps/building-oauth-apps)
- [Resend API 文档](https://resend.com/docs/api-reference)

---

## 🆘 需要帮助？

如果遇到问题：

1. 检查 wrangler 日志：`cat ~/.config/.wrangler/logs/wrangler-*.log`
2. 查看实时日志：`wrangler tail`
3. 检查健康状态：`curl https://api.winuel.com/health`
4. 联系技术支持

---

**配置完成后，所有功能将正常工作！** ✅