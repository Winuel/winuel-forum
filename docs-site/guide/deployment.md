# 部署指南

本指南将帮助您将 CloudLink 论坛系统部署到生产环境。

## 部署方式

CloudLink 支持多种部署方式：

- **Cloudflare Pages** - 推荐方式，免费且性能优异
- **Cloudflare Workers** - 直接部署 API
- **自建服务器** - 使用 Docker 或传统部署

## Cloudflare Pages 部署

### 前端部署

1. **准备项目**
   \`\`\`bash
   # 构建前端
   cd frontend
   pnpm build
   \`\`\`

2. **创建 Cloudflare Pages 项目**
   - 登录 Cloudflare Dashboard
   - 选择 Pages 服务
   - 创建新项目

3. **配置构建设置**
   
   在项目设置中添加构建命令：
   - **构建命令**: `npm install && npm run build`
   **输出目录**: `dist`

   环境变量：
   \`\`\`
   VITE_API_BASE_URL=https://api.winuel.com
   \`\`\`

4. **部署**
   \`\`\`bash
   # 使用 Wrangler CLI
   npx wrangler pages project create cloudlink-frontend
   npx wrangler pages deploy dist --project-name cloudlink-frontend
   \`\`\`

### 后端部署

1. **准备项目**
   \`\`\`bash
   # 构建后端
   cd backend
   pnpm build
   \`\`\`

2. **配置 wrangler.toml**
   \`\`\`toml
   name = "cloudlink-api"
   main = "src/index.ts"
   compatibility_date = "2024-03-01"
   
   [vars]
   ENVIRONMENT = "production"
   
   [[d1_databases]]
   binding = "DB"
   database_name = "cloudlink-db"
   database_id = "your-database-id"
   
   [[kv_namespaces]]
   binding = "CACHE"
   namespace_id = "your-kv-namespace-id"
   \`\`\`

3. **部署**
   \`\`\`bash
   npx wrangler deploy
   \`\`\`

## 管理后台部署

\`\`\`bash
cd admin-pages
pnpm build
npx wrangler pages deploy dist --project-name cloudlink-admin
\`\`\`

## Docker 部署

### 创建 Dockerfile

\`\`\`dockerfile
# backend/Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 8787

CMD ["node", "dist/index.js"]
\`\`\`

### 构建和运行

\`\`\`bash
# 构建镜像
docker build -t cloudlink-api:latest .

# 运行容器
docker run -p 8787:8788 cloudlink-api:latest
\`\`\`

## 环境变量配置

### 后端环境变量

创建 `.dev.vars` 文件：

\`\`\`bash
# 数据库配置
DATABASE_URL=database-id
KV_NAMESPACE_ID=kv-namespace-id

# JWT 配置
JWT_SECRET=your-jwt-secret
JWT_USER_AUD=user
JWT_ADMIN_AUD=admin
JWT_ISSUER=cloudlink-api

# CORS 配置
CORS_ORIGINS=https://www.winuel.com,https://admin.winuel.com
\`\`\`

### 域名配置

配置以下域名的 DNS 解析：

- `www.winuel.com` → Cloudflare Pages
- `api.winuel.com` → Cloudflare Workers
- `admin.winuel.com` → Cloudflare Pages

## SSL/TLS 配置

Cloudflare 自动提供免费的 SSL 证书：

1. 登录 Cloudflare Dashboard
2. 选择 SSL/TLS 选项
3. 添加域名
4. 启用 "Always Use HTTPS"

## 监控和日志

### Cloudflare Workers 日志

\`\`\`bash
# 查看 Workers 日志
npx wrangler tail
\`\`\`

### Analytics 集成

在 Cloudflare Dashboard 中启用：
- Web Analytics
- Real User Monitoring (RUM)
- Bot Management Mode

## 性能优化

### 缓存策略

\`\`\`typescript
// API 响应缓存
const CACHE_DURATION = 300 // 5分钟
\`\`\`

### CDN 配置

- 启用 Cloudflare CDN
- 配置缓存规则
- 设置页面规则

### 图片优化

- 使用 Cloudflare Images
- 启用图片压缩
- 配置 WebP 转换

## 备份和恢复

### 数据库备份

\`\`\`bash
# 导出数据库
npx wrangler d1 export cloudlink-db --output=backup.sql
\`\`\`

### 恢复数据

\`\`\`bash
# 导入数据库
npx wrangler d1 execute cloudlink-db --file=backup.sql
\`\`\`

## 故障排除

### 常见问题

**Q: 部署后无法访问**
A: 检查防火墙设置和DNS配置

**Q: 数据库连接失败**
A: 验证 D1 数据库 ID 和权限配置

**Q: CORS 错误**
A: 检查 CORS_ORIGINS 环境变量配置

**Q: 静态资源加载失败**
A: 检查 base 配置和资源路径

### 日志查看

\`\`\`bash
# Workers 日志
npx wrangler tail

# Pages 日志
npx wrangler pages deployment tail
\`\`\`

## 下一步

- [查看 API 文档](/api/overview)
- [阅读配置指南](/guide/configuration)
- [了解性能优化](/tutorial/advanced-features)