# 快速开始

欢迎使用 Winuel 论坛系统！本指南将帮助您快速安装和运行 Winuel。

## 前置要求

在开始之前，请确保您的系统已安装以下软件：

- **Node.js**: >= 18.0.0
- **pnpm**: >= 8.0.0 (推荐使用 pnpm)
- **Git**: 任意版本

## 安装步骤

### 1. 克隆仓库

```bash
git clone https://github.com/Winuel/winuel.git
cd yunniu
```

### 2. 安装依赖

```bash
# 使用 pnpm 安装所有依赖
pnpm install
```

### 3. 配置环境变量

复制环境变量示例文件：

```bash
# 后端配置
cp backend/.dev.vars.example backend/.dev.vars

# 前端配置
cp frontend/.env.development.example frontend/.env.development
```

编辑配置文件，填入您的 API 密钥和其他配置信息。

### 4. 启动开发服务器

```bash
# 同时启动前后端开发服务器
pnpm dev

# 或者分别启动
pnpm dev:backend  # 后端 API
pnpm dev:frontend # 前端界面
```

## 访问应用

启动完成后，可以通过以下地址访问：

- **前端界面**: \`YOUR_LOCALHOST:5173\`
- **后端 API**: \`YOUR_LOCALHOST:8787\`
- **管理后台**: \`YOUR_LOCALHOST:5174\`

## 创建第一个用户

1. 访问前端界面：\`YOUR_LOCALHOST:5173\`
2. 点击注册按钮
3. 填写用户信息：
   - 用户名
   - 邮箱地址
   - 密码（至少8个字符）
4. 完成邮箱验证
5. 开始使用 Winuel 论坛系统

## 下一步

恭喜！您已经成功安装并运行了 Winuel 论坛系统。接下来，您可以：

- [阅读配置指南](/guide/configuration) - 了解更多配置选项
- [查看 API 文档](/api/overview) - 学习如何调用 API
- [探索高级功能](/tutorial/advanced-features) - 发现更多功能

## 常见问题

### Q: 如何切换到其他端口？

A: 在环境变量配置文件中修改端口号：

```bash
# backend/.dev.vars
PORT=8787

# frontend/.env.development
VITE_PORT=5173
```

### Q: 如何启用生产模式？

A: 使用构建命令部署生产版本：

```bash
# 构建生产版本
pnpm build

# 部署到 Cloudflare Workers
cd backend
pnpm deploy
```

### Q: 如何重置数据库？

A: 删除数据库文件并重新初始化：

```bash
# 删除数据库文件
rm -f backend/.wrangler/state/v3/d1/miniflare-D1DatabaseObject

# 重新初始化
pnpm dev
```

## 获取帮助

如果遇到问题，请访问：

- [问题反馈](https://github.com/Winuel/winuel/issues)
- [讨论区](https://github.com/Winuel/winuel/discussions)
- [在线文档](https://docs.winuel.com)