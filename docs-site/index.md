---
layout: home

hero:
  name: "Winuel"
  text: "现代化的轻量级论坛系统"
  tagline: "基于 Cloudflare Workers Serverless 平台构建，高性能、低成本、易部署"
  image:
    src: /logo.svg
    alt: Winuel
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/quick-start
    - theme: alt
      text: 查看 API
      link: /api/overview

features:
  - icon: 🚀
    title: Serverless 架构
    details: 无需服务器管理，自动扩缩容，基于 Cloudflare 全球边缘网络，提供低延迟访问体验。
  - icon: 💰
    title: 高性价比
    details: 按使用量计费，零运维成本，小规模项目几乎免费，大幅降低部署成本。
  - icon: 🔒
    title: 安全可靠
    details: 多层安全防护，JWT 认证，HTTPS 加密，符合行业安全标准，保护用户数据安全。
  - icon: 📱
    title: 响应式设计
    details: 完美适配移动端、平板、桌面设备，提供一致的用户体验，支持深色/浅色主题。
  - icon: 🎨
    title: 现代化 UI
    details: 简洁美观的界面，支持主题切换，基于 TailwindCSS 构建，易于定制和维护。
  - icon: 🧩
    title: 插件系统
    details: 前后端统一的插件架构，支持功能扩展，社区驱动的生态系统，满足各种需求。

---

## 🎯 为什么选择 Winuel？

Winuel 论坛系统专为现代互联网应用设计，采用最新的云原生技术栈，提供出色的性能和用户体验。

### 核心优势

**🏗️ 模块化架构**
- 6个共享包，代码复用率高
- 插件系统，功能可扩展
- 依赖注入，易于测试

**⚡ 性能优化**
- 全球 CDN 部署
- 数据库查询优化
- 前端代码分割

**🛡️ 安全防护**
- JWT 受众分离认证
- CORS 跨域保护
- 一次性邮箱黑名单
- 审计日志系统

**🔧 开发友好**
- TypeScript 全栈覆盖
- 完整的 API 文档
- 丰富的示例代码
- 活跃的社区支持

---

## 📊 技术栈

### 前端技术
- **Vue 3.5.30** - 渐进式 JavaScript 框架
- **TypeScript 5.9.3** - 类型安全的 JavaScript
- **Vite 5.4.11** - 下一代前端构建工具
- **Pinia 3.0.4** - Vue 官方状态管理库
- **Vue Router 5.0.4** - Vue 官方路由管理器
- **TailwindCSS 3.4.19** - 原子化 CSS 框架

### 后端技术
- **Hono 4.12.8** - 轻量级 Web 框架
- **TypeScript 5.9.3** - 类型安全的 JavaScript
- **Cloudflare Workers** - Serverless 计算平台
- **D1** - Cloudflare 边缘数据库
- **KV** - Cloudflare 键值存储

---

## 🚀 快速体验

### 安装

```bash
# 克隆仓库
git clone https://github.com/Winuel/winuel.git
cd yunniu

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

### 访问

- **前端界面**: \`YOUR_LOCALHOST:5173\`
- **后端 API**: \`YOUR_LOCALHOST:8787\`
- **管理后台**: \`YOUR_LOCALHOST:5174\`

---

## 📈 版本信息

**当前版本**: v0.1.0-beta  
**发布日期**: 2024年3月22日  
**发布分支**: develop  
**Git Tag**: v0.1.0-beta

---

## 🌐 访问地址

- **演示站点**: https://www.winuel.com
- **官方文档**: https://docs.winuel.com
- **项目主页**: https://github.com/Winuel/winuel
- **问题反馈**: https://github.com/Winuel/winuel/issues

---

## 💪 开始使用

从快速开始指南开始，了解如何安装、配置和使用 Winuel 论坛系统。

[快速开始 →](/guide/quick-start)