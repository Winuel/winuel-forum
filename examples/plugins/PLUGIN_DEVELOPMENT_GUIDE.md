# CloudLink 插件开发指南

欢迎使用 CloudLink 插件系统！本指南将帮助你创建功能强大的插件。

## 目录

- [快速开始](#快速开始)
- [插件结构](#插件结构)
- [核心概念](#核心概念)
- [插件开发](#插件开发)
- [最佳实践](#最佳实践)
- [插件发布](#插件发布)

## 快速开始

### 前置要求

- Node.js >= 18.0.0
- TypeScript >= 5.0.0
- CloudLink 平台环境

### 创建基础插件

```bash
# 1. 创建插件目录
mkdir my-awesome-plugin
cd my-awesome-plugin

# 2. 创建 manifest.json
cat > manifest.json << EOF
{
  "metadata": {
    "id": "my-awesome-plugin",
    "name": "My Awesome Plugin",
    "version": "1.0.0",
    "description": "我的第一个插件",
    "author": "Your Name",
    "platform": "both",
    "priority": 1
  },
  "entry": "MyPlugin"
}
EOF

# 3. 创建插件类
cat > MyPlugin.ts << EOF
import { BasePlugin } from '@cloudlink/plugin-system'

export class MyPlugin extends BasePlugin {
  metadata = {
    id: 'my-awesome-plugin',
    name: 'My Awesome Plugin',
    version: '1.0.0',
    description: '我的第一个插件',
    author: 'Your Name',
    platform: 'both',
    priority: 1
  }

  protected async onActivate(context: PluginContext): Promise<void> {
    this.logInfo('插件激活成功!')
  }
}
EOF
```

## 插件结构

```
my-awesome-plugin/
├── manifest.json          # 插件清单文件
├── MyPlugin.ts           # 插件主类
├── components/           # Vue 组件（可选）
│   └── MyComponent.vue
├── styles/               # 样式文件（可选）
│   └── styles.css
├── assets/               # 静态资源（可选）
│   └── logo.png
├── locales/              # 国际化文件（可选）
│   ├── en.json
│   └── zh.json
└── README.md             # 说明文档
```

## 核心概念

### 插件生命周期

插件有四个主要生命周期阶段：

1. **安装** (`install`) - 插件被安装到系统中
2. **激活** (`activate`) - 插件开始运行
3. **停用** (`deactivate`) - 插件停止运行
4. **卸载** (`uninstall`) - 插件从系统中移除

### 插件平台

- `both` - 同时支持前端和后端
- `backend` - 仅后端功能
- `frontend` - 仅前端功能

### 插件优先级

- `LOW` (0) - 低优先级
- `MEDIUM` (1) - 中等优先级
- `HIGH` (2) - 高优先级
- `CRITICAL` (3) - 关键优先级

## 插件开发

### 继承 BasePlugin

```typescript
import { BasePlugin, PluginContext } from '@cloudlink/plugin-system'

export class MyPlugin extends BasePlugin {
  // 必须实现元数据
  metadata = {
    id: 'my-plugin',
    name: 'My Plugin',
    version: '1.0.0',
    description: '插件描述',
    author: '作者名称',
    platform: 'both',
    priority: 1,
    dependencies: [],
    permissions: [],
    configSchema: {
      type: 'object',
      properties: {}
    }
  }

  // 实现生命周期方法
  protected async onActivate(context: PluginContext): Promise<void> {
    // 插件激活逻辑
    this.logInfo('插件已激活')
  }
}
```

### 注册 API 路由

```typescript
protected async onActivate(context: PluginContext): Promise<void> {
  // 注册 GET 路由
  context.api.registerRoute('/api/my-plugin/hello', async (c: any) => {
    return c.json({ message: 'Hello from my plugin!' })
  })

  // 注册 POST 路由
  context.api.registerRoute('/api/my-plugin/data', async (c: any) => {
    const body = await c.req.json()
    return c.json({ received: body })
  })
}
```

### 注册 Vue 组件

```typescript
protected async onActivate(context: PluginContext): Promise<void> {
  context.api.registerComponent('my-widget', {
    template: '<div class="widget">Hello from plugin!</div>',
    data() {
      return { count: 0 }
    },
    methods: {
      increment() {
        this.count++
      }
    }
  })
}
```

### 使用事件系统

```typescript
protected async onActivate(context: PluginContext): Promise<void> {
  // 监听事件
  this.on('custom:event', async (data) => {
    this.logInfo('收到事件:', data)
    return '事件已处理'
  })

  // 发送事件
  await this.emit('plugin:ready', { pluginId: this.metadata.id })
}
```

### 使用持久化存储

```typescript
protected async onActivate(context: PluginContext): Promise<void> {
  // 保存数据
  await context.storage.set('lastActivated', new Date().toISOString())
  
  // 读取数据
  const lastActivated = await context.storage.get('lastActivated')
  
  // 删除数据
  await context.storage.delete('lastActivated')
}
```

### 实现配置验证

```typescript
getConfigSchema(): PluginConfigSchema {
  return {
    type: 'object',
    properties: {
      apiKey: {
        type: 'string',
        title: 'API 密钥',
        description: '输入你的 API 密钥',
        minLength: 8
      },
      enableFeature: {
        type: 'boolean',
        title: '启用功能',
        default: true
      }
    },
    required: ['apiKey']
  }
}

validateConfig(config: Record<string, any>): { valid: boolean; errors: string[] } {
  const result = super.validateConfig(config)
  // 自定义验证逻辑
  if (!result.valid) {
    return result
  }
  
  // 额外验证
  if (config.apiKey && !config.apiKey.startsWith('sk_')) {
    result.errors.push('API 密钥必须以 sk_ 开头')
    result.valid = false
  }
  
  return result
}
```

### 插件间通信

```typescript
protected async onActivate(context: PluginContext): Promise<void> {
  // 获取其他插件
  const otherPlugin = context.dependencies.get('other-plugin-id')
  
  if (otherPlugin) {
    // 调用其他插件的方法
    const result = await otherPlugin.someMethod()
  }
}
```

## 最佳实践

### 1. 错误处理

```typescript
protected async onActivate(context: PluginContext): Promise<void> {
  try {
    // 插件逻辑
  } catch (error) {
    this.logError('激活失败:', error)
    throw error
  }
}
```

### 2. 资源清理

```typescript
protected async onDeactivate(context: PluginContext): Promise<void> {
  // 清理定时器
  if (this.timer) {
    clearInterval(this.timer)
  }
  
  // 清理事件监听器
  this.emit('cleanup')
}
```

### 3. 性能优化

```typescript
protected async onActivate(context: PluginContext): Promise<void> {
  // 使用缓存
  const cached = await context.storage.get('cache')
  if (cached) {
    return cached
  }
  
  // 懒加载
  const heavyModule = await import('./heavy-module')
}
```

### 4. 安全考虑

```typescript
protected async onActivate(context: PluginContext): Promise<void> {
  // 验证输入
  const userInput = validateInput(data)
  
  // 转义输出
  const safeOutput = escapeOutput(userInput)
  
  // 使用最小权限
  // 只请求必要的权限
}
```

### 5. 日志记录

```typescript
protected async onActivate(context: PluginContext): Promise<void> {
  this.logDebug('调试信息')
  this.logInfo('常规信息')
  this.logWarn('警告信息')
  this.logError('错误信息')
}
```

## 插件发布

### 1. 打包插件

```bash
# 使用打包脚本
npx tsx create-plugin-package.ts my-awesome-plugin plugin-package.json
```

### 2. 测试插件

```bash
# 运行测试脚本
npx tsx test-plugin-system.ts
```

### 3. 发布到插件市场

```bash
# 上传到插件市场
# 具体步骤参考插件市场文档
```

## 常见问题

### Q: 如何调试插件？

A: 使用插件日志和浏览器开发者工具：

```typescript
this.logDebug('调试信息', data)
console.log('浏览器控制台调试', data)
```

### Q: 如何处理依赖关系？

A: 在 manifest.json 中声明依赖：

```json
{
  "dependencies": [
    {
      "name": "required-plugin",
      "version": "^1.0.0",
      "optional": false
    }
  ]
}
```

### Q: 如何支持多语言？

A: 使用插件本地化：

```typescript
protected async onActivate(context: PluginContext): Promise<void> {
  const locale = this.config.locale || 'en'
  const messages = await import(`./locales/${locale}.json`)
  this.messages = messages
}
```

### Q: 如何实现插件热更新？

A: 使用事件通知更新：

```typescript
await this.emit('plugin:update', { version: '1.1.0' })
```

## 更多资源

- [插件 API 文档](./api-reference.md)
- [示例插件](../examples/plugins/hello-world)
- [插件市场](https://marketplace.cloudlink.example.com)
- [社区论坛](https://forum.cloudlink.example.com)

## 支持

如有问题，请访问：
- GitHub Issues: https://github.com/cloudlink/plugin-system/issues
- 开发者社区: https://community.cloudlink.example.com

---

**Happy Plugin Development! 🚀**