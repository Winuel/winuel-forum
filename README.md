# Winuel Forum / 云纽论坛

> **⚠️ This repository has been migrated to a new organization architecture / 此仓库已迁移到新的组织架构**

> This project has been split into multiple independent repositories and migrated to the **Winuel** organization. Please see the migration notice below.
> 本项目已拆分为多个独立仓库，全部迁移到 **Winuel** organization 下。请查看下面的迁移说明。

<div align="center">

![Winuel Logo](https://img.shields.io/badge/Winuel-Forum-blue)
![Vue](https://img.shields.io/badge/Vue-3.5.30-4FC08D)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-3178C6)
![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-F38020)
![License](https://img.shields.io/badge/License-MIT-green)

A modern lightweight forum system built on Cloudflare Workers Serverless platform
现代化的轻量级论坛系统，基于 Cloudflare Workers Serverless 平台构建

[Website](https://www.winuel.com) • [Documentation](https://docs.winuel.com) • [Demo](https://hub.winuel.com) • [Contribute](https://github.com/Winuel/winuel-forum/contributing)

</div>

## 📦 Project Migration / 项目迁移（重要）

This project was split and migrated on **March 26, 2026**. Please visit the new repository addresses:
本项目已于 **2026年3月26日** 完成拆分和迁移。请访问新的仓库地址：

### New Repository Addresses / 新仓库地址

| Repository Name / 仓库名称 | URL / 地址 | Purpose / 用途 |
|---------------------------|-----------|----------------|
| **winuel-packages** | [github.com/Winuel/winuel-packages](https://github.com/Winuel/winuel-packages) | Shared Packages / 共享包库 |
| **winuel-forum** | [github.com/Winuel/winuel-forum](https://github.com/Winuel/winuel-forum) | Forum System / 论坛系统 |
| **winuel-docs** | [github.com/Winuel/winuel-docs](https://github.com/Winuel/winuel-docs) | Documentation Site / 文档站点 |
| **winuel-website** | [github.com/Winuel/winuel-website](https://github.com/Winuel/winuel-website) | Official Website / 官方网站 |

### Why Split? / 为什么拆分？

To better manage the project and promote collaboration, we split the project into multiple independent repositories:
为了更好地管理项目和促进协作，我们将项目拆分为多个独立仓库：
- **Modular Management / 模块化管理**: Each project is managed independently with clear responsibilities
- **Better Collaboration / 更好的协作**: Different teams can develop and deploy independently
- **Version Control / 版本控制**: Each project can release versions independently
- **Clear Dependencies / 依赖清晰**: Shared packages as independent projects can be referenced by multiple projects

### How to Use After Migration? / 迁移后如何使用？

1. **Develop Forum System / 开发论坛系统**: Visit [Winuel/winuel-forum](https://github.com/Winuel/winuel-forum)
2. **Use Shared Packages / 使用共享包**: Visit [Winuel/winuel-packages](https://github.com/Winuel/winuel-packages)
3. **View Documentation / 查看文档**: Visit [docs.winuel.com](https://docs.winuel.com)
4. **Learn About Product / 了解产品**: Visit [www.winuel.com](https://www.winuel.com)

> **Note / 注意**: This repository only retains historical records. For future development, please visit the new repositories above.
> 此仓库仅保留历史记录，后续开发请访问上述新仓库。

---

## 📋 Table of Contents / 目录

- [Project Overview / 项目概述](#项目概述)
- [Technical Architecture / 技术架构](#技术架构)
- [Core Features / 核心功能](#核心功能)
- [Quick Start / 快速开始](#快速开始)
- [Project Structure / 项目结构](#项目结构)
- [Documentation / 文档](#文档)
- [Deployment / 部署](#部署)
- [Security Features / 安全特性](#安全特性)
- [Performance Metrics / 性能指标](#性能指标)
- [Contributing / 贡献指南](#贡献指南)
- [License / 许可证](#许可证)

## Project Overview / 项目概述

Winuel Forum is a modern lightweight forum system with a front-end and back-end separation architecture, built on the Cloudflare Workers Serverless platform. It features high performance, low cost, and easy deployment, making it suitable for small to medium-sized communities.
云纽论坛是一个现代化的轻量级论坛系统，采用前后端分离架构，基于 Cloudflare Workers Serverless 平台构建。具有高性能、低成本、易部署的特点，适合中小型社区使用。

### Key Features / 主要特点

- 🚀 **Serverless Architecture / Serverless 架构**: No server management, automatic scaling / 无需服务器管理，自动扩缩容
- 🌍 **Global Deployment / 全球部署**: Cloudflare global edge network, low latency access / Cloudflare 全球边缘网络，低延迟访问
- 💰 **Cost-Effective / 高性价比**: Pay-as-you-go pricing, zero operational cost / 按使用量计费，零运维成本
- 🔒 **Secure and Reliable / 安全可靠**: Multi-layer security protection, industry-standard security / 多层安全防护，符合行业安全标准
- 📱 **Responsive Design / 响应式设计**: Perfect adaptation for mobile, tablet, and desktop devices / 完美适配移动端、平板、桌面设备
- 🎨 **Modern UI / 现代化 UI**: Clean and beautiful interface, supports dark/light themes / 简洁美观的界面，支持深色/浅色主题
- 🧩 **Modular Design / 模块化设计**: Highly modular, easy to maintain and extend / 高度模块化，易于维护和扩展

## Technical Architecture / 技术架构

### Frontend Tech Stack / 前端技术栈

| Technology / 技术 | Version / 版本 | Description / 说明 |
|-------------------|----------------|-------------------|
| Vue | 3.5.30 | Progressive JavaScript Framework / 渐进式 JavaScript 框架 |
| TypeScript | 5.9.3 | JavaScript superset with type safety / JavaScript 的超集，提供类型安全 |
| Vite | 8.0.0 | Next-generation frontend build tool / 下一代前端构建工具 |
| Pinia | 3.0.4 | Vue official state management library / Vue 官方状态管理库 |
| Vue Router | 5.0.3 | Vue official router / Vue 官方路由管理器 |
| TailwindCSS | 3.4.17 | Atomic CSS framework / 原子化 CSS 框架 |

### Backend Tech Stack / 后端技术栈

| Technology / 技术 | Version / 版本 | Description / 说明 |
|-------------------|----------------|-------------------|
| Hono | 4.12.8 | Lightweight web framework / 轻量级 Web 框架 |
| TypeScript | 5.9.3 | Type-safe JavaScript / 类型安全的 JavaScript |
| Cloudflare Workers | - | Serverless computing platform / Serverless 计算平台 |
| D1 | - | Cloudflare edge database / Cloudflare 边缘数据库 |
| KV | - | Cloudflare key-value storage / Cloudflare 键值存储 |
| R2 | - | Cloudflare object storage (reserved) / Cloudflare 对象存储（预留） |

## Core Features / 核心功能

### User System / 用户系统
- ✅ User registration/login (email verification) / 用户注册/登录（邮箱验证）
- ✅ JWT token authentication / JWT 令牌认证
- ✅ Profile management / 个人资料管理
- ✅ User permission management (user, admin, moderator) / 用户权限管理（普通用户、管理员、版主）

### Post System / 帖子系统
- ✅ Create posts (Markdown support) / 发帖（支持 Markdown）
- ✅ Edit/delete posts / 帖子编辑/删除
- ✅ Post list (pagination, sorting, filtering) / 帖子列表（分页、排序、筛选）
- ✅ Post detail display / 帖子详情展示
- ✅ Post likes / 帖子点赞
- ✅ Tag system / 标签系统

### Comment System / 评论系统
- ✅ Post/edit/delete comments / 发表评论/编辑/删除
- ✅ Nested reply support / 嵌套回复支持
- ✅ Comment likes / 评论点赞
- ✅ Comment count / 评论计数

### Category Management / 分类管理
- ✅ Board/category management / 板块/分类管理
- ✅ Category browsing / 分类浏览
- ✅ Category filtering / 分类筛选

### Notification System / 通知系统
- ✅ System notifications / 系统通知
- ✅ Reply notifications / 回复通知
- ✅ Like notifications / 点赞通知
- ✅ Unread indicators / 未读提示

### UI/UX Features / UI/UX 特性
- ✅ Responsive design (mobile/tablet/desktop) / 响应式设计（移动端/平板/桌面）
- ✅ Dark/light theme toggle / 深色/浅色主题切换
- ✅ Smooth animations / 流畅的动画效果
- ✅ Accessibility support / 无障碍访问支持
- ✅ Loading state indicators / 加载状态提示
- ✅ Error notification components / 错误提示组件

## Quick Start / 快速开始

### Prerequisites / 前置要求

- Node.js >= 18.0.0
- npm >= 9.0.0
- Git
- Wrangler CLI (for backend deployment / 用于部署后端)

### Install Dependencies / 安装依赖

```bash
# Clone project / 克隆项目
git clone git@github.com:LemonStudio-hub/winuel.git
cd winuel

# Install frontend dependencies / 安装前端依赖
cd frontend
npm install

# Install backend dependencies / 安装后端依赖
cd ../backend
npm install
```

### Local Development / 本地开发

#### Start Frontend Development Server / 启动前端开发服务器

```bash
cd frontend
npm run dev
```

Frontend will start at `http://localhost:5173` / 前端将在 `http://localhost:5173` 启动。

#### Start Backend Development Server / 启动后端开发服务器

```bash
cd backend
npm run build
wrangler dev
```

Backend will start at `http://localhost:8787` / 后端将在 `http://localhost:8787` 启动。

### Environment Variable Configuration / 环境变量配置

#### Frontend Environment Variables / 前端环境变量

Create `frontend/.env.development` / 创建 `frontend/.env.development`：

```env
VITE_API_BASE_URL=http://localhost:8787
```

Create `frontend/.env.production` / 创建 `frontend/.env.production`：

```env
VITE_API_BASE_URL=https://api.winuel.com
```

#### Backend Environment Variables / 后端环境变量

Set JWT secret / 设置 JWT 密钥：

```bash
cd backend
wrangler secret put JWT_SECRET
# Enter at least 32 characters for the secret / 输入至少 32 个字符的密钥
```

## Project Structure / 项目结构

```
winuel/
├── frontend/              # Frontend project / 前端项目
│   ├── src/
│   │   ├── api/          # API wrapper / API 封装
│   │   │   ├── client.ts
│   │   │   ├── auth.ts
│   │   │   ├── posts.ts
│   │   │   └── upload.ts
│   │   ├── assets/       # Static resources / 静态资源
│   │   ├── components/   # Components / 组件
│   │   │   ├── Header.vue
│   │   │   ├── Footer.vue
│   │   │   ├── Sidebar.vue
│   │   │   ├── PostCard.vue
│   │   │   ├── CommentForm.vue
│   │   │   └── ...
│   │   ├── composables/  # Composable functions / 组合式函数
│   │   ├── layouts/      # Layout components / 布局组件
│   │   │   └── MainLayout.vue
│   │   ├── pages/        # Page components / 页面组件
│   │   │   ├── HomePage.vue
│   │   │   ├── PostDetailPage.vue
│   │   │   ├── LoginPage.vue
│   │   │   └── ...
│   │   ├── router/       # Router configuration / 路由配置
│   │   │   └── index.ts
│   │   ├── stores/       # Pinia state management / Pinia 状态管理
│   │   │   ├── user.ts
│   │   │   ├── post.ts
│   │   │   └── ui.ts
│   │   ├── styles/       # Global styles / 全局样式
│   │   ├── utils/        # Utility functions / 工具函数
│   │   ├── App.vue       # Root component / 根组件
│   │   └── main.ts       # Entry file / 入口文件
│   ├── public/           # Public resources / 公共资源
│   ├── index.html        # HTML template / HTML 模板
│   ├── package.json      # Frontend dependencies / 前端依赖
│   ├── vite.config.ts    # Vite configuration / Vite 配置
│   ├── tailwind.config.js # TailwindCSS configuration / TailwindCSS 配置
│   └── tsconfig.json     # TypeScript configuration / TypeScript 配置
├── backend/              # Backend project / 后端项目
│   ├── src/
│   │   ├── routes/       # Route modules / 路由模块
│   │   │   ├── auth.ts
│   │   │   ├── posts.ts
│   │   │   ├── comments.ts
│   │   │   └── categories.ts
│   │   ├── services/     # Business logic / 业务逻辑
│   │   │   ├── userService.ts
│   │   │   ├── postService.ts
│   │   │   └── categoryService.ts
│   │   ├── middleware/   # Middleware / 中间件
│   │   │   ├── auth.ts
│   │   │   ├── cors.ts
│   │   │   └── rateLimit.ts
│   │   ├── utils/        # Utility functions / 工具函数
│   │   │   ├── jwt.ts
│   │   │   ├── crypto.ts
│   │   │   ├── validation.ts
│   │   │   └── errorHandler.ts
│   │   ├── db/           # Database related / 数据库相关
│   │   │   ├── schema.sql
│   │   │   └── models.ts
│   │   ├── types.ts      # Type definitions / 类型定义
│   │   └── index.ts      # Entry file / 入口文件
│   ├── package.json      # Backend dependencies / 后端依赖
│   ├── wrangler.toml     # Cloudflare Workers configuration / Cloudflare Workers 配置
│   └── tsconfig.json     # TypeScript configuration / TypeScript 配置
├── .gitignore           # Git ignore rules / Git 忽略规则
└── README.md            # Project documentation / 项目文档
```

## Documentation / 文档

- [Backend Documentation / 后端文档](./backend/README.md)
- [Frontend Documentation / 前端文档](./frontend/README.md)
- [API Documentation / API 文档](./API.md)
- [Deployment Documentation / 部署文档](./DEPLOYMENT.md)

## Deployment / 部署

### Frontend Deployment / 前端部署

Frontend can be deployed to any static hosting service, such as Cloudflare Pages, Vercel, Netlify, etc.
前端可以部署到任何静态托管服务，如 Cloudflare Pages、Vercel、Netlify 等。

```bash
cd frontend
npm run build
# Deploy the dist directory to static hosting service / 将 dist 目录部署到静态托管服务
```

### Backend Deployment / 后端部署

Deploy to Cloudflare Workers using Wrangler CLI:
使用 Wrangler CLI 部署到 Cloudflare Workers：

```bash
cd backend
npm run build
wrangler deploy
```

For detailed deployment steps, please refer to [Deployment Documentation / 部署文档](./DEPLOYMENT.md)。
详细部署步骤请参考 [部署文档](./DEPLOYMENT.md)。

## Security Features / 安全特性

### Implemented Security Measures / 已实现的安全措施

- ✅ JWT token authentication (environment variable manages secret) / JWT 令牌认证（环境变量管理密钥）
- ✅ Password strength validation (at least 8 characters, letters and numbers only, includes weak password check) / 密码强度验证（至少8位，仅字母和数字组合，包含弱密码检查）
- ✅ Rate limiting (prevents brute force attacks) / 速率限制（防止暴力破解）
- ✅ CORS whitelist mechanism / CORS 白名单机制
- ✅ Input validation and sanitization / 输入验证和清理
- ✅ SQL injection protection (parameterized queries) / SQL 注入防护（参数化查询）
- ✅ XSS protection / XSS 防护
- ✅ CSRF protection / CSRF 保护
- ✅ Standardized error messages (no sensitive information leakage) / 错误消息标准化（不泄露敏感信息）
- ✅ HTTPS enforced encryption / HTTPS 强制加密

### Security Configuration / 安全配置

| Configuration / 配置项 | Value / 值 |
|------------------------|-----------|
| Auth endpoint rate limit / 认证端点速率限制 | 5 requests/minute / 5 次/分钟 |
| Normal endpoint rate limit / 普通端点速率限制 | 100 requests/15 minutes / 100 次/15 分钟 |
| Password hash algorithm / 密码哈希算法 | bcrypt (10 rounds) |
| JWT expiration time / JWT 过期时间 | 7 days / 7 天 |
| JWT algorithm / JWT 算法 | HS256 |

## Performance Metrics / 性能指标

| Metric / 指标 | Value / 值 |
|--------------|-----------|
| Worker startup time / Worker 启动时间 | 14 ms |
| Average API response time / API 平均响应时间 | < 100 ms |
| Database query latency / 数据库查询延迟 | < 50 ms (edge / 边缘) |
| KV cache read / KV 缓存读取 | < 10 ms |
| Frontend bundle size / 前端打包大小 | 42 KB (gzip) |

## Contributing / 贡献指南

Contributions are welcome! Please follow these steps:
欢迎贡献代码！请遵循以下步骤：

1. Fork this repository / Fork 本仓库
2. Create a feature branch / 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. Commit changes / 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch / 推送到分支 (`git push origin feature/AmazingFeature`)
5. Open a Pull Request / 开启 Pull Request

### Code Standards / 代码规范

- Follow ESLint and Prettier configuration / 遵循 ESLint 和 Prettier 配置
- Use TypeScript strict mode / 使用 TypeScript 严格模式
- Write clear commit messages / 编写清晰的提交信息
- Add tests for new features / 为新功能添加测试

## Development Roadmap / 开发路线图

### ✅ Completed / 已完成

- [x] User authentication system / 用户认证系统
- [x] Post management / 帖子管理
- [x] Comment system / 评论系统
- [x] Category management / 分类管理
- [x] Basic UI / 基础 UI
- [x] Security features / 安全特性
- [x] Responsive design / 响应式设计

### 🚧 In Progress / 进行中

- [ ] Search functionality / 搜索功能
- [ ] File upload (R2) / 文件上传（R2）
- [ ] User follow system / 用户关注系统

### 📋 Planned / 计划中

- [ ] Private messaging / 私信功能
- [ ] Recommendation algorithm / 推荐算法
- [ ] Admin panel / 后台管理系统
- [ ] PWA support / PWA 支持
- [ ] Unit tests / 单元测试
- [ ] Multi-language support / 多语言支持
- [ ] AI feature integration / AI 功能集成

## License / 许可证

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
本项目采用 MIT 许可证。详见 [LICENSE](LICENSE) 文件。

## Contact / 联系方式

- Project Homepage / 项目主页：[https://github.com/LemonStudio-hub/winuel](https://github.com/LemonStudio-hub/winuel)
- Issue Tracker / 问题反馈：[Issues](https://github.com/LemonStudio-hub/winuel/issues)

---

<div align="center">

**Made with ❤️ by Lemon Studio**

</div>