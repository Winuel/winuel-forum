# Winuel Forum E2E Tests

云纽论坛的端到端（E2E）测试套件，使用 Puppeteer 和 Vitest 构建。

## 安装依赖

使用淘宝镜像源安装依赖：

```bash
npm install --registry=https://registry.npmmirror.com --legacy-peer-deps
```

## 运行测试

### 运行所有测试

```bash
npm test
```

### 运行测试并生成报告

```bash
npm run test:run
```

### 运行测试 UI 模式

```bash
npm run test:ui
```

### 调试测试

```bash
npm run test:debug
```

## 前置条件

运行测试前，需要确保以下服务已启动：

1. **前端开发服务器** (http://localhost:5173)
   ```bash
   cd ../frontend
   npm run dev
   ```

2. **后端开发服务器** (http://localhost:8787)
   ```bash
   cd ../backend
   npm run build
   wrangler dev
   ```

## 测试结构

```
e2e-tests/
├── tests/
│   ├── basic.test.ts      # 基础功能测试
│   └── api.test.ts        # API 测试
├── screenshots/           # 测试截图
├── videos/               # 测试视频（如果启用）
├── vitest.config.ts      # Vitest 配置
└── package.json          # 项目配置
```

## 测试覆盖

### 基础功能测试 (basic.test.ts)

- ✅ 首页加载
- ✅ 导航栏显示
- ✅ 登录页面导航
- ✅ 登录表单显示和填写
- ✅ 注册页面导航
- ✅ 注册表单显示
- ✅ 主题切换功能
- ✅ 帖子列表显示
- ✅ 帖子详情导航
- ✅ 帖子内容显示

### API 测试 (api.test.ts)

- ✅ 获取分类列表
- ✅ 获取帖子列表
- ✅ 用户注册
- ✅ 用户登录
- ✅ 无效凭据处理
- ✅ 速率限制

## 截图和视频

测试失败时会自动截图到 `screenshots/` 目录。

## 故障排查

### Puppeteer 安装问题

如果 Puppeteer 安装失败，可以尝试手动安装 Chrome：

```bash
npm run install:chrome
```

### 测试超时

如果测试超时，可以在 `vitest.config.ts` 中调整超时时间：

```typescript
timeout: 30000,  // 30秒
testTimeout: 30000,
```

### 权限问题

如果遇到权限问题，尝试添加以下参数：

```bash
npm test -- --no-sandbox --disable-setuid-sandbox
```

## 添加新测试

1. 在 `tests/` 目录下创建新的测试文件（`.test.ts` 或 `.spec.ts`）
2. 使用 Puppeteer API 编写测试
3. 运行测试验证

### 测试模板

```typescript
import puppeteer, { Browser, Page } from 'puppeteer'
import { describe, it, expect, beforeAll, afterAll } from 'vitest'

describe('测试名称', () => {
  let browser: Browser
  let page: Page

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })
    page = await browser.newPage()
    await page.setViewport({ width: 1280, height: 720 })
    page.setDefaultTimeout(30000)
  })

  afterAll(async () => {
    await browser.close()
  })

  it('测试用例名称', async () => {
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' })
    
    // 测试逻辑
    const element = await page.$('selector')
    expect(element).toBeTruthy()
  })
})
```

## 相关资源

- [Puppeteer 文档](https://pptr.dev/)
- [Vitest 文档](https://vitest.dev/)
- [项目主文档](../README.md)
- [API 文档](../API.md)