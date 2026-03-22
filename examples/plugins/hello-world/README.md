# Hello World Plugin

一个简单的示例插件，展示 CloudLink 插件系统的基本功能。

## 功能特性

- ✅ 插件生命周期管理（安装、激活、停用、卸载）
- ✅ 自定义配置和验证
- ✅ API 路由注册
- ✅ Vue 组件注册
- ✅ 事件系统支持
- ✅ 插件间通信
- ✅ 持久化存储

## 安装方法

1. 在管理后台的插件管理页面
2. 点击"安装插件"按钮
3. 选择 `manifest.json` 文件上传
4. 激活插件

## 配置选项

- **问候语**：设置默认问候语（默认：Hello, World!）
- **显示时间戳**：是否在问候语中显示时间戳（默认：true）
- **重复次数**：问候语重复次数（1-5次，默认：1）

## 使用示例

### API 调用

```bash
GET /api/plugins/hello-world
```

响应：
```json
{
  "success": true,
  "message": "Hello, World! (at 2024-03-22T15:30:00.000Z)",
  "plugin": "Hello World Plugin",
  "version": "1.0.0"
}
```

### 前端组件

```vue
<template>
  <hello-world-widget />
</template>

<script setup>
// 组件会自动注册到全局
</script>
```

### 事件通信

```typescript
// 发送事件
pluginService.getLoader().getEventBus().emit('plugin:greeting', 'Hi there!')

// 监听事件
pluginService.getLoader().getEventBus().on('plugin:activated', (data) => {
  console.log('Plugin activated:', data)
})
```

## 插件结构

```
hello-world-plugin/
├── manifest.json          # 插件清单
├── HelloWorldPlugin.ts    # 插件主类
├── README.md             # 说明文档
└── package.json          # 包配置（可选）
```

## 开发指南

### 创建插件基类

```typescript
import { BasePlugin } from '@cloudlink/plugin-system'

export class MyPlugin extends BasePlugin {
  metadata = {
    // 插件元数据
  }

  protected async onActivate(context: PluginContext): Promise<void> {
    // 激活逻辑
  }
}
```

### 注册路由

```typescript
context.api.registerRoute('/api/my-plugin', async (c) => {
  return c.json({ message: 'Hello from my plugin' })
})
```

### 注册组件

```typescript
context.api.registerComponent('my-component', {
  template: '<div>My Component</div>'
})
```

### 使用存储

```typescript
// 保存数据
await context.storage.set('key', value)

// 读取数据
const value = await context.storage.get('key')
```

### 使用事件

```typescript
// 发送事件
await this.emit('my-event', data)

// 监听事件
this.on('my-event', async (data) => {
  // 处理事件
})
```

## 许可证

MIT License

## 贡献

欢迎提交问题和拉取请求！