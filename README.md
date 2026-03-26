# 云纽论坛 (Winuel)

<div align="center">

![Winuel Logo](https://img.shields.io/badge/Winuel-Forum-blue)
![Vue](https://img.shields.io/badge/Vue-3.5.30-4FC08D)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-3178C6)
![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-F38020)
![License](https://img.shields.io/badge/License-MIT-green)

现代化的轻量级论坛系统，基于 Cloudflare Workers Serverless 平台构建

[官网](https://www.winuel.com) • [文档](#文档) • [演示](#演示) • [贡献](#贡献)

</div>

## 📋 目录

- [项目概述](#项目概述)
- [技术架构](#技术架构)
- [核心功能](#核心功能)
- [快速开始](#快速开始)
- [项目结构](#项目结构)
- [文档](#文档)
- [部署](#部署)
- [安全特性](#安全特性)
- [性能指标](#性能指标)
- [贡献指南](#贡献指南)
- [许可证](#许可证)

## 项目概述

云纽论坛是一个现代化的轻量级论坛系统，采用前后端分离架构，基于 Cloudflare Workers Serverless 平台构建。具有高性能、低成本、易部署的特点，适合中小型社区使用。

### 主要特点

- 🚀 **Serverless 架构**：无需服务器管理，自动扩缩容
- 🌍 **全球部署**：Cloudflare 全球边缘网络，低延迟访问
- 💰 **高性价比**：按使用量计费，零运维成本
- 🔒 **安全可靠**：多层安全防护，符合行业安全标准
- 📱 **响应式设计**：完美适配移动端、平板、桌面设备
- 🎨 **现代化 UI**：简洁美观的界面，支持深色/浅色主题
- 🧩 **模块化设计**：高度模块化，易于维护和扩展

## 技术架构

### 前端技术栈

| 技术 | 版本 | 说明 |
|------|------|------|
| Vue | 3.5.30 | 渐进式 JavaScript 框架 |
| TypeScript | 5.9.3 | JavaScript 的超集，提供类型安全 |
| Vite | 8.0.0 | 下一代前端构建工具 |
| Pinia | 3.0.4 | Vue 官方状态管理库 |
| Vue Router | 5.0.3 | Vue 官方路由管理器 |
| TailwindCSS | 3.4.17 | 原子化 CSS 框架 |

### 后端技术栈

| 技术 | 版本 | 说明 |
|------|------|------|
| Hono | 4.12.8 | 轻量级 Web 框架 |
| TypeScript | 5.9.3 | 类型安全的 JavaScript |
| Cloudflare Workers | - | Serverless 计算平台 |
| D1 | - | Cloudflare 边缘数据库 |
| KV | - | Cloudflare 键值存储 |
| R2 | - | Cloudflare 对象存储（预留） |

## 核心功能

### 用户系统
- ✅ 用户注册/登录（邮箱验证）
- ✅ JWT 令牌认证
- ✅ 个人资料管理
- ✅ 用户权限管理（普通用户、管理员、版主）

### 帖子系统
- ✅ 发帖（支持 Markdown）
- ✅ 帖子编辑/删除
- ✅ 帖子列表（分页、排序、筛选）
- ✅ 帖子详情展示
- ✅ 帖子点赞
- ✅ 标签系统

### 评论系统
- ✅ 发表评论/编辑/删除
- ✅ 嵌套回复支持
- ✅ 评论点赞
- ✅ 评论计数

### 分类管理
- ✅ 板块/分类管理
- ✅ 分类浏览
- ✅ 分类筛选

### 通知系统
- ✅ 系统通知
- ✅ 回复通知
- ✅ 点赞通知
- ✅ 未读提示

### UI/UX 特性
- ✅ 响应式设计（移动端/平板/桌面）
- ✅ 深色/浅色主题切换
- ✅ 流畅的动画效果
- ✅ 无障碍访问支持
- ✅ 加载状态提示
- ✅ 错误提示组件

## 快速开始

### 前置要求

- Node.js >= 18.0.0
- npm >= 9.0.0
- Git
- Wrangler CLI（用于部署后端）

### 安装依赖

```bash
# 克隆项目
git clone git@github.com:LemonStudio-hub/winuel.git
cd winuel

# 安装前端依赖
cd frontend
npm install

# 安装后端依赖
cd ../backend
npm install
```

### 本地开发

#### 启动前端开发服务器

```bash
cd frontend
npm run dev
```

前端将在 `http://localhost:5173` 启动。

#### 启动后端开发服务器

```bash
cd backend
npm run build
wrangler dev
```

后端将在 `http://localhost:8787` 启动。

### 环境变量配置

#### 前端环境变量

创建 `frontend/.env.development`：

```env
VITE_API_BASE_URL=http://localhost:8787
```

创建 `frontend/.env.production`：

```env
VITE_API_BASE_URL=https://api.winuel.com
```

#### 后端环境变量

设置 JWT 密钥：

```bash
cd backend
wrangler secret put JWT_SECRET
# 输入至少 32 个字符的密钥
```

## 项目结构

```
winuel/
├── frontend/              # 前端项目
│   ├── src/
│   │   ├── api/          # API 封装
│   │   │   ├── client.ts
│   │   │   ├── auth.ts
│   │   │   ├── posts.ts
│   │   │   └── upload.ts
│   │   ├── assets/       # 静态资源
│   │   ├── components/   # 组件
│   │   │   ├── Header.vue
│   │   │   ├── Footer.vue
│   │   │   ├── Sidebar.vue
│   │   │   ├── PostCard.vue
│   │   │   ├── CommentForm.vue
│   │   │   └── ...
│   │   ├── composables/  # 组合式函数
│   │   ├── layouts/      # 布局组件
│   │   │   └── MainLayout.vue
│   │   ├── pages/        # 页面组件
│   │   │   ├── HomePage.vue
│   │   │   ├── PostDetailPage.vue
│   │   │   ├── LoginPage.vue
│   │   │   └── ...
│   │   ├── router/       # 路由配置
│   │   │   └── index.ts
│   │   ├── stores/       # Pinia 状态管理
│   │   │   ├── user.ts
│   │   │   ├── post.ts
│   │   │   └── ui.ts
│   │   ├── styles/       # 全局样式
│   │   ├── utils/        # 工具函数
│   │   ├── App.vue       # 根组件
│   │   └── main.ts       # 入口文件
│   ├── public/           # 公共资源
│   ├── index.html        # HTML 模板
│   ├── package.json      # 前端依赖
│   ├── vite.config.ts    # Vite 配置
│   ├── tailwind.config.js # TailwindCSS 配置
│   └── tsconfig.json     # TypeScript 配置
├── backend/              # 后端项目
│   ├── src/
│   │   ├── routes/       # 路由模块
│   │   │   ├── auth.ts
│   │   │   ├── posts.ts
│   │   │   ├── comments.ts
│   │   │   └── categories.ts
│   │   ├── services/     # 业务逻辑
│   │   │   ├── userService.ts
│   │   │   ├── postService.ts
│   │   │   └── categoryService.ts
│   │   ├── middleware/   # 中间件
│   │   │   ├── auth.ts
│   │   │   ├── cors.ts
│   │   │   └── rateLimit.ts
│   │   ├── utils/        # 工具函数
│   │   │   ├── jwt.ts
│   │   │   ├── crypto.ts
│   │   │   ├── validation.ts
│   │   │   └── errorHandler.ts
│   │   ├── db/           # 数据库相关
│   │   │   ├── schema.sql
│   │   │   └── models.ts
│   │   ├── types.ts      # 类型定义
│   │   └── index.ts      # 入口文件
│   ├── package.json      # 后端依赖
│   ├── wrangler.toml     # Cloudflare Workers 配置
│   └── tsconfig.json     # TypeScript 配置
├── .gitignore           # Git 忽略规则
└── README.md            # 项目文档
```

## 文档

- [后端文档](./backend/README.md)
- [前端文档](./frontend/README.md)
- [API 文档](./API.md)
- [部署文档](./DEPLOYMENT.md)

## 部署

### 前端部署

前端可以部署到任何静态托管服务，如 Cloudflare Pages、Vercel、Netlify 等。

```bash
cd frontend
npm run build
# 将 dist 目录部署到静态托管服务
```

### 后端部署

使用 Wrangler CLI 部署到 Cloudflare Workers：

```bash
cd backend
npm run build
wrangler deploy
```

详细部署步骤请参考 [部署文档](./DEPLOYMENT.md)。

## 安全特性

### 已实现的安全措施

- ✅ JWT 令牌认证（环境变量管理密钥）
- ✅ 密码强度验证（至少8位，仅字母和数字组合，包含弱密码检查）
- ✅ 速率限制（防止暴力破解）
- ✅ CORS 白名单机制
- ✅ 输入验证和清理
- ✅ SQL 注入防护（参数化查询）
- ✅ XSS 防护
- ✅ CSRF 保护
- ✅ 错误消息标准化（不泄露敏感信息）
- ✅ HTTPS 强制加密

### 安全配置

| 配置项 | 值 |
|--------|-----|
| 认证端点速率限制 | 5 次/分钟 |
| 普通端点速率限制 | 100 次/15 分钟 |
| 密码哈希算法 | bcrypt (10 rounds) |
| JWT 过期时间 | 7 天 |
| JWT 算法 | HS256 |

## 性能指标

| 指标 | 值 |
|------|-----|
| Worker 启动时间 | 14 ms |
| API 平均响应时间 | < 100 ms |
| 数据库查询延迟 | < 50 ms (边缘) |
| KV 缓存读取 | < 10 ms |
| 前端打包大小 | 42 KB (gzip) |

## 贡献指南

欢迎贡献代码！请遵循以下步骤：

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

### 代码规范

- 遵循 ESLint 和 Prettier 配置
- 使用 TypeScript 严格模式
- 编写清晰的提交信息
- 为新功能添加测试

## 开发路线图

### ✅ 已完成

- [x] 用户认证系统
- [x] 帖子管理
- [x] 评论系统
- [x] 分类管理
- [x] 基础 UI
- [x] 安全特性
- [x] 响应式设计

### 🚧 进行中

- [ ] 搜索功能
- [ ] 文件上传（R2）
- [ ] 用户关注系统

### 📋 计划中

- [ ] 私信功能
- [ ] 推荐算法
- [ ] 后台管理系统
- [ ] PWA 支持
- [ ] 单元测试
- [ ] 多语言支持
- [ ] AI 功能集成

## 许可证

本项目采用 MIT 许可证。详见 [LICENSE](LICENSE) 文件。

## 联系方式

- 项目主页：[https://github.com/LemonStudio-hub/winuel](https://github.com/LemonStudio-hub/winuel)
- 问题反馈：[Issues](https://github.com/LemonStudio-hub/winuel/issues)

---

<div align="center">

**Made with ❤️ by Lemon Studio**

</div>