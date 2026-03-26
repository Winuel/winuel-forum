# 云纽论坛 - 部署文档

<div align="center">

![Winuel Deployment](https://img.shields.io/badge/Winuel-Deployment-F38020)
![Cloudflare](https://img.shields.io/badge/Cloudflare-F38020)
![Workers](https://img.shields.io/badge/Workers-F48020)
![Pages](https://img.shields.io/badge/Pages-324558)

</div>

## 📋 目录

- [概述](#概述)
- [前置要求](#前置要求)
- [Cloudflare Workers 部署](#cloudflare-workers-部署)
- [Cloudflare Pages 部署](#cloudflare-pages-部署)
- [数据库配置](#数据库配置)
- [环境变量配置](#环境变量配置)
- [自定义域名](#自定义域名)
- [监控和日志](#监控和日志)
- [故障排查](#故障排查)
- [维护指南](#维护指南)

## 概述

本文档详细说明如何将云纽论坛部署到 Cloudflare 平台。云纽论坛采用 Cloudflare Workers（后端）和 Cloudflare Pages（前端）的组合，提供全球低延迟、高可用的服务。

## 前置要求

### 必需工具

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **Wrangler CLI** >= 4.0.0
- **Git**

### 账户要求

- Cloudflare 账户（免费账户即可）
- GitHub 账户（用于 Pages 部署）

### 安装 Wrangler CLI

```bash
npm install -g wrangler

# 验证安装
wrangler --version
```

### 登录 Cloudflare

```bash
wrangler login
```

这会打开浏览器进行授权。

## Cloudflare Workers 部署

### 1. 创建项目

```bash
cd backend
npm install
npm run build
```

### 2. 配置 wrangler.toml

确保 `backend/wrangler.toml` 配置正确：

```toml
name = "winuel-backend"
main = "src/index.ts"
compatibility_date = "2024-09-23"
compatibility_flags = ["nodejs_compat"]

[vars]
ENVIRONMENT = "production"

[[d1_databases]]
binding = "DB"
database_name = "winuel-db"
database_id = "your-database-id"

[[kv_namespaces]]
binding = "KV"
id = "your-kv-namespace-id"
preview_id = "your-preview-kv-namespace-id"
```

### 3. 创建 D1 数据库

```bash
# 创建数据库
wrangler d1 create winuel-db

# 记录返回的 database_id，更新 wrangler.toml
```

### 4. 初始化数据库

```bash
# 执行数据库 schema
wrangler d1 execute winuel-db --file=./src/db/schema.sql --remote
```

### 5. 创建 KV 命名空间

```bash
# 创建 KV 命名空间
wrangler kv namespace create WINUEL_KV

# 创建 preview KV 命名空间
wrangler kv namespace create WINUEL_KV_PREVIEW --preview

# 记录返回的 id，更新 wrangler.toml
```

### 6. 设置环境变量

```bash
# 设置 JWT 密钥（生产环境）
wrangler secret put JWT_SECRET
# 输入至少 32 个字符的密钥

# 设置环境变量
wrangler secret put ENVIRONMENT
# 输入：production
```

### 7. 部署到 Cloudflare Workers

```bash
# 部署到生产环境
wrangler deploy

# 部署到预览环境
wrangler deploy --env preview
```

### 8. 验证部署

```bash
# 测试 API
curl https://api.winuel.com/
curl https://api.winuel.com/health
```

## Cloudflare Pages 部署

### 方法一：通过 Wrangler 部署

#### 1. 构建前端项目

```bash
cd frontend
npm install
npm run build
```

#### 2. 部署到 Cloudflare Pages

```bash
# 创建 Pages 项目
wrangler pages project create winuel-frontend

# 部署
wrangler pages deploy dist
```

### 方法二：通过 GitHub 集成部署

#### 1. 连接 GitHub 仓库

1. 登录 Cloudflare Dashboard
2. 进入 Pages 面板
3. 点击 "Create a project"
4. 选择 "Connect to Git"
5. 选择你的 GitHub 仓库

#### 2. 配置构建设置

```yaml
# Cloudflare Pages 配置
build_command: npm run build
output_directory: dist
root_directory: frontend
```

#### 3. 设置环境变量

在 Pages 设置中添加环境变量：

```env
VITE_API_BASE_URL=https://api.winuel.com
```

#### 4. 部署

推送代码到 GitHub，Cloudflare Pages 会自动部署：

```bash
git push origin main
```

## 数据库配置

### D1 数据库管理

#### 创建数据库

```bash
wrangler d1 create winuel-db
```

#### 查看数据库列表

```bash
wrangler d1 list
```

#### 执行 SQL 查询

```bash
# 执行单个查询
wrangler d1 execute winuel-db --remote --command "SELECT * FROM users"

# 执行 SQL 文件
wrangler d1 execute winuel-db --remote --file=./src/db/schema.sql
```

#### 导出数据

```bash
wrangler d1 export winuel-db --remote --output=backup.sql
```

#### 导入数据

```bash
wrangler d1 execute winuel-db --remote --file=backup.sql
```

### 数据库备份

建议定期备份数据库：

```bash
# 创建备份脚本
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
wrangler d1 export winuel-db --remote --output=backup_${DATE}.sql
```

## 环境变量配置

### 后端环境变量

| 变量名 | 说明 | 必需 | 示例 |
|--------|------|------|------|
| JWT_SECRET | JWT 签名密钥 | 是 | `your-secret-key-min-32-chars` |
| ENVIRONMENT | 运行环境 | 否 | `production` |

### 前端环境变量

| 变量名 | 说明 | 必需 | 示例 |
|--------|------|------|------|
| VITE_API_BASE_URL | 后端 API 地址 | 是 | `https://api.winuel.com` |

### 设置环境变量

#### Workers 环境变量

```bash
# 设置密钥
wrangler secret put JWT_SECRET

# 查看密钥列表（开发环境）
wrangler secret list

# 删除密钥
wrangler secret delete JWT_SECRET
```

#### Pages 环境变量

1. 进入 Cloudflare Dashboard
2. 选择 Pages 项目
3. 进入 Settings > Environment variables
4. 添加环境变量

## 自定义域名

### Workers 自定义域名

#### 1. 在 Cloudflare Dashboard 配置

1. 进入 Workers 面板
2. 选择你的 Worker
3. 进入 Settings > Triggers
4. 点击 "Add Custom Domain"
5. 输入域名：`api.yourdomain.com`

#### 2. 配置 DNS

确保你的域名 DNS 配置正确：

```
Type: CNAME
Name: api
Content: your-worker.workers.dev
```

### Pages 自定义域名

#### 1. 在 Cloudflare Dashboard 配置

1. 进入 Pages 面板
2. 选择你的 Pages 项目
3. 进入 Settings > Custom domains
4. 点击 "Set up a custom domain"
5. 输入域名：`www.yourdomain.com`

#### 2. 配置 DNS

```
Type: CNAME
Name: www
Content: your-pages.pages.dev
```

#### 3. 配置根域名

可选：将根域名指向 Pages：

```
Type: CNAME
Name: @
Content: your-pages.pages.dev
```

## 监控和日志

### 实时日志

```bash
# 查看 Workers 实时日志
wrangler tail

# 查看 Pages 实时日志
wrangler pages tail winuel-frontend
```

### 日志查询

```bash
# 查看特定时间范围的日志
wrangler tail --format pretty --since 1h
```

### 分析

Cloudflare 提供内置的分析功能：

1. 进入 Cloudflare Dashboard
2. 选择 Workers 或 Pages 项目
3. 进入 Analytics 面板
4. 查看请求、错误、性能等指标

### 告警配置

设置告警通知：

1. 进入 Workers/Pages 设置
2. 进入 Notifications
3. 配置告警规则（错误率、响应时间等）

## 故障排查

### 常见问题

#### 1. Workers 部署失败

**问题**：部署时出现错误

**解决方案**：
```bash
# 检查构建是否成功
npm run build

# 验证 wrangler.toml 配置
wrangler whoami

# 查看详细错误信息
wrangler deploy --verbose
```

#### 2. 数据库连接失败

**问题**：无法连接到 D1 数据库

**解决方案**：
```bash
# 验证数据库 ID
wrangler d1 list

# 测试数据库连接
wrangler d1 execute winuel-db --remote --command "SELECT 1"

# 检查 wrangler.toml 中的数据库配置
```

#### 3. 环境变量未生效

**问题**：环境变量不生效

**解决方案**：
```bash
# 重新设置环境变量
wrangler secret put JWT_SECRET

# 重新部署
wrangler deploy

# 验证环境变量
wrangler secret list
```

#### 4. CORS 错误

**问题**：前端访问 API 时出现 CORS 错误

**解决方案**：
1. 检查后端 CORS 配置
2. 确保前端域名在允许列表中
3. 验证环境变量 `ENVIRONMENT` 设置正确

#### 5. 速率限制触发

**问题**：API 返回 429 错误

**解决方案**：
1. 检查请求频率
2. 调整速率限制配置
3. 使用缓存减少请求

### 调试技巧

#### 1. 本地测试

```bash
# 本地开发环境测试
cd backend
wrangler dev

# 访问 http://localhost:8787
```

#### 2. 查看日志

```bash
# 实时查看日志
wrangler tail

# 查看最近 100 条日志
wrangler tail --format pretty --tail 100
```

#### 3. 测试端点

```bash
# 测试健康检查
curl https://api.winuel.com/health

# 测试 API 端点
curl https://api.winuel.com/api/categories
```

## 维护指南

### 定期维护任务

#### 每日

- 检查错误日志
- 监控性能指标
- 检查速率限制触发情况

#### 每周

- 备份数据库
- 检查依赖更新
- 审查安全日志

#### 每月

- 更新依赖包
- 检查 SSL 证书
- 审查访问统计

### 更新部署

#### 更新后端

```bash
cd backend
git pull origin main
npm install
npm run build
wrangler deploy
```

#### 更新前端

```bash
cd frontend
git pull origin main
npm install
npm run build
# 通过 Wrangler 部署
wrangler pages deploy dist
# 或推送代码到 GitHub，Pages 自动部署
git push origin main
```

### 数据库迁移

```bash
# 创建迁移文件
cat > migrations/001_add_index.sql << EOF
CREATE INDEX IF NOT EXISTS idx_posts_title ON posts(title);
EOF

# 执行迁移
wrangler d1 execute winuel-db --remote --file=migrations/001_add_index.sql
```

### 回滚策略

#### Workers 回滚

```bash
# 查看部署历史
wrangler deployments list

# 回滚到特定版本
wrangler rollback --version-id <version-id>
```

#### Pages 回滚

1. 进入 Cloudflare Dashboard
2. 选择 Pages 项目
3. 进入 Deployments 面板
4. 选择要回滚的部署
5. 点击 "Rollback"

## 性能优化

### Workers 优化

1. **减少冷启动时间**
   - 使用 `compatibility_flags = ["nodejs_compat"]`
   - 优化代码结构
   - 减少依赖包大小

2. **使用缓存**
   - 利用 KV 缓存热点数据
   - 设置合理的过期时间

3. **优化数据库查询**
   - 使用适当的索引
   - 避免 N+1 查询

### Pages 优化

1. **代码分割**
   - 使用路由懒加载
   - 按需加载组件

2. **资源优化**
   - 压缩图片
   - 使用 CDN
   - 启用 HTTP/2

3. **缓存策略**
   - 设置合理的缓存头
   - 使用 Service Worker

## 安全加固

### 1. 使用 HTTPS

Cloudflare 自动提供 HTTPS，无需额外配置。

### 2. 设置 CSP

在 Workers 中添加 CSP 头：

```typescript
c.header('Content-Security-Policy', "default-src 'self'")
```

### 3. 限制请求速率

已实现的速率限制：
- 认证端点：5 次/分钟
- 普通端点：100 次/15 分钟

### 4. 定期更新依赖

```bash
# 检查过时的依赖
npm outdated

# 更新依赖
npm update

# 审计安全漏洞
npm audit
npm audit fix
```

## 成本估算

### Cloudflare Workers 免费套餐

- **请求**：每天 100,000 次
- **CPU 时间**：每天 10 ms
- **D1 读取**：每天 5,000,000 次
- **D1 写入**：每天 100,000 次
- **KV 读取**：每天 100,000 次
- **KV 写入**：每天 1,000 次

### Cloudflare Pages 免费套餐

- **带宽**：每月 500 GB
- **构建时间**：每月 500 分钟
- **请求数**：无限

### 估算

对于小型论坛（< 1000 用户）：
- 月成本：$0（免费套餐）
- 超出免费套餐后：$5/月起

## 支持

如有问题，请通过以下方式获取帮助：

- **文档**：[https://developers.cloudflare.com](https://developers.cloudflare.com)
- **社区**：[Cloudflare Community](https://community.cloudflare.com)
- **GitHub Issues**：[https://github.com/LemonStudio-hub/yunniu/issues](https://github.com/LemonStudio-hub/yunniu/issues)

---

**Winuel Team** © 2026