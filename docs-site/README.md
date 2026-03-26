# Winuel 文档站点

Winuel 论坛系统的官方文档站点。

## 技术栈

- **VitePress**: 1.x
- **Vue 3**: 3.5.30
- **TypeScript**: 5.9.3
- **TailwindCSS**: 3.4.19

## 开发

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 \`YOUR_LOCALHOST:5173\`

### 构建生产版本

```bash
npm run build
```

### 预览构建结果

```bash
npm run preview
```

## 项目结构

```
docs-site/
├── .vitepress/          # VitePress 配置
│   ├── config.ts         # 站点配置
│   └── theme/            # 自定义主题
│       ├── index.ts
│       └── styles/
│           └── custom.css
├── guide/               # 指南文档
├── api/                 # API 文档
├── tutorial/            # 教程文档
├── index.md             # 首页
└── package.json
```

## 部署

文档站点部署到 Cloudflare Pages，自动从 develop 分支构建。

访问地址: https://docs.winuel.com

## 贡献

欢迎提交 Issue 和 Pull Request 来改进文档站点！