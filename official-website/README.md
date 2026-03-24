# CloudLink Official Website

CloudLink 官网 - 现代化、简洁优雅的官方网站

## 技术栈

- **Vue 3.5.30** - 渐进式 JavaScript 框架
- **TypeScript 5.9.3** - 类型安全的 JavaScript
- **Vite 5.4.11** - 下一代前端构建工具
- **TailwindCSS 3.4.19** - 原子化 CSS 框架
- **Vue Router 5.0.4** - Vue 官方路由管理器

## 开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 预览构建结果
pnpm preview

# 类型检查
pnpm type-check

# 代码检查
pnpm lint
```

## 项目结构

```
official-website/
├── src/
│   ├── components/    # 通用组件
│   │   ├── Header.vue
│   │   ├── Footer.vue
│   │   ├── FeatureCard.vue
│   │   └── CTAButton.vue
│   ├── views/         # 页面视图
│   │   ├── HomeView.vue
│   │   ├── AboutView.vue
│   │   ├── ProductView.vue
│   │   ├── ContactView.vue
│   │   └── NotFoundView.vue
│   ├── router/        # 路由配置
│   ├── styles/        # 全局样式
│   ├── assets/        # 静态资源
│   └── main.ts        # 入口文件
├── public/            # 公共资源
└── dist/              # 构建输出
```

## 部署

官网使用 Cloudflare Pages 进行部署：

```bash
# 部署到 Cloudflare Pages
npx wrangler pages deploy dist --project-name=cloudlink-official-website
```

## 设计理念

- **简洁优雅**：使用留白和精简的设计元素
- **现代美学**：渐变色、柔和阴影、流畅动画
- **大气高端**：专业感与科技感并重
- **响应式设计**：完美适配移动端、平板、桌面

## 特性

- 🎨 现代化的渐变色设计
- 📱 完全响应式布局
- ⚡ 快速加载和流畅动画
- 🌓 支持深色/浅色主题（规划中）
- 🔍 SEO 优化
- ♿ 无障碍访问支持

## 许可证

MIT License - Lemon Studio