# 云纽论坛 - 管理员后台

独立部署的管理员后台项目，用于管理云纽论坛的用户、帖子、评论和审计日志。

## 部署信息

- **项目名称**: winuel-admin
- **生产环境**: https://64229809.winuel-admin.pages.dev
- **自定义域名**: admin.winuel.com（需在 Cloudflare Dashboard 中配置）
- **后端 API**: https://api.winuel.com

## 功能特性

- **仪表盘**: 系统统计数据概览
- **用户管理**: 查看用户列表、搜索、过滤、封禁/解封用户
- **帖子管理**: 查看帖子列表、删除、恢复、置顶/取消置顶
- **评论管理**: 查看评论列表、删除、恢复
- **审计日志**: 查看系统操作日志、搜索、导出

## 技术栈

- **前端框架**: Vue 3 + TypeScript
- **构建工具**: Vite
- **状态管理**: Pinia
- **路由**: Vue Router
- **UI 样式**: Tailwind CSS
- **部署平台**: Cloudflare Pages

## 权限要求

- **管理员 (admin)**: 完全访问权限
- **审核员 (moderator)**: 部分管理权限（用户管理、帖子管理、评论管理）

## 开发指南

### 安装依赖
```bash
npm install
```

### 本地开发
```bash
npm run dev
```

### 构建项目
```bash
npm run build
```

### 部署到 Cloudflare Pages
```bash
npm run build
npx wrangler pages deploy dist --project-name=winuel-admin
```

## 环境变量

- `VITE_API_BASE_URL`: 后端 API 地址（生产环境: https://api.winuel.com）

## API 集成

管理员后台通过以下 API 与后端集成：

- `GET /api/admin/stats` - 获取统计数据
- `GET /api/admin/users` - 获取用户列表
- `POST /api/admin/users` - 创建用户
- `PUT /api/admin/users/:id` - 更新用户
- `DELETE /api/admin/users/:id` - 删除用户
- `POST /api/admin/users/:id/ban` - 封禁用户
- `POST /api/admin/users/:id/unban` - 解封用户
- `GET /api/admin/posts` - 获取帖子列表
- `DELETE /api/admin/posts/:id` - 删除帖子
- `POST /api/admin/posts/:id/restore` - 恢复帖子
- `POST /api/admin/posts/:id/pin` - 置顶帖子
- `POST /api/admin/posts/:id/unpin` - 取消置顶帖子
- `GET /api/admin/comments` - 获取评论列表
- `DELETE /api/admin/comments/:id` - 删除评论
- `POST /api/admin/comments/:id/restore` - 恢复评论
- `GET /api/admin/audit-logs` - 获取审计日志
- `GET /api/admin/audit-logs/:id` - 获取审计日志详情

## 安全注意事项

1. **身份验证**: 所有管理员 API 需要有效的 JWT 令牌
2. **权限控制**: 使用 RBAC 权限系统，确保只有授权用户可以访问
3. **审计日志**: 所有管理操作都会被记录到审计日志中
4. **HTTPS**: 生产环境强制使用 HTTPS
5. **CSRF 保护**: 启用了 CSRF 保护机制

## 维护和更新

1. 定期更新依赖包
2. 监控性能和错误日志
3. 定期备份数据库
4. 审查审计日志中的异常活动

## 故障排除

### 登录失败
- 检查用户角色是否为 admin 或 moderator
- 验证 API 连接是否正常
- 检查 JWT 令牌是否有效

### API 调用失败
- 检查网络连接
- 验证 API 地址是否正确
- 查看浏览器控制台错误信息
- 检查后端服务是否正常运行

### 部署问题
- 确保 wrangler.toml 配置正确
- 检查构建输出目录
- 验证 Cloudflare 账户权限
- 查看部署日志

## 联系支持

如有问题，请联系开发团队或查看项目文档。