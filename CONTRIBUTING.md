# 贡献指南 (Contributing Guidelines)

感谢你对 Winuel 论坛项目的关注！我们欢迎所有形式的贡献。

## 📋 目录

- [开发规范](#开发规范)
- [Git 工作流](#git-工作流)
- [技术栈标准](#技术栈标准)
- [代码风格规范](#代码风格规范)
- [提交检查](#提交检查)

---

## 开发规范

### 环境要求

- Node.js >= 18.0.0
- npm >= 9.0.0

### 安装项目

```bash
# 克隆项目
git clone git@github.com:Winuel/winuel.git
cd winuel

# 安装所有依赖
npm run install:all
```

### 本地开发

```bash
# 启动前端开发服务器
cd frontend && npm run dev

# 启动后端开发服务器
cd backend && npm run dev
```

---

## Git 工作流

### 分支管理策略

采用 Git Flow 简化版策略：

**主要分支：**
- `main` - 生产环境分支，始终保持稳定可部署状态
- `develop` - 开发分支，集成所有功能开发

**支持分支：**
- `feature/<功能名>` - 功能开发分支
- `fix/<问题名>` - bug 修复分支
- `hotfix/<紧急修复名>` - 紧急修复分支
- `release/<版本号>` - 发布准备分支

**工作流程：**

1. **功能开发：**
   ```
   main → develop → feature/xxx → develop → main
   ```

2. **Bug 修复：**
   ```
   main → develop → fix/xxx → develop → main
   ```

3. **紧急修复：**
   ```
   main → hotfix/xxx → main → develop
   ```

### 提交信息规范

采用 **Conventional Commits** 规范，结合中文描述：

**格式：** `<type>: <subject>`

**类型：**
- `feat:` - 新功能
- `fix:` - 修复 bug
- `perf:` - 性能优化
- `security:` - 安全相关修复或改进
- `refactor:` - 重构代码（不改变功能）
- `style:` - 代码格式调整（不影响逻辑）
- `docs:` - 文档更新
- `test:` - 测试相关
- `chore:` - 构建/工具配置更新
- `build:` - 构建系统或依赖更新

**示例：**
```
feat: 添加用户关注系统
fix: 修复登录状态持久化问题
perf: 优化数据库查询性能
security: 修复 XSS 漏洞
refactor: 重构认证中间件
docs: 更新 API 文档
test: 添加用户服务单元测试
build: 升级 Vite 到 5.4.11
```

**要求：**
- 使用中文描述
- subject 不超过 50 字
- 不以句号结尾
- 使用祈使语气

### Pull Request 要求

- 必须通过 CI 检查（lint、test、build）
- 需要至少一人 Code Review
- PR 标题遵循提交信息规范
- 必须关联相关 Issue

---

## 技术栈标准

### 前端技术栈

| 类别 | 技术 | 版本 | 用途 |
|------|------|------|------|
| 框架 | Vue | 3.5.30 | 渐进式 JavaScript 框架 |
| 语言 | TypeScript | 5.9.3 | 类型安全的 JavaScript |
| 构建工具 | Vite | 5.4.11 | 下一代前端构建工具 |
| 状态管理 | Pinia | 3.0.4 | Vue 官方状态管理库 |
| 路由 | Vue Router | 5.0.3 | Vue 官方路由管理器 |
| 样式 | TailwindCSS | 3.4.19 | 原子化 CSS 框架 |
| 测试 | Vitest | 3.2.4 | 单元测试框架 |

### 后端技术栈

| 类别 | 技术 | 版本 | 用途 |
|------|------|------|------|
| 框架 | Hono | 4.12.8 | 轻量级 Web 框架 |
| 语言 | TypeScript | 5.9.3 | 类型安全的 JavaScript |
| 平台 | Cloudflare Workers | - | Serverless 计算平台 |
| 数据库 | D1 | - | Cloudflare 边缘数据库 |
| 缓存 | KV | - | Cloudflare 键值存储 |
| 存储 | R2 | - | Cloudflare 对象存储 |
| 测试 | Vitest | 3.2.4 | 单元测试框架 |

### 依赖管理规范

- 统一使用 npm（不使用 yarn 或 pnpm）
- 定期更新依赖，每季度进行一次全面更新
- 使用 `package-lock.json` 锁定依赖版本
- 生产依赖和开发依赖严格分离

### 新增技术栈原则

1. 必须经过团队评审
2. 优先使用 TypeScript 生态
3. 选择维护活跃、社区成熟的项目
4. 避免引入不必要的重型依赖

---

## 代码风格规范

### TypeScript 配置

- 严格模式：`strict: true`
- 未使用变量：`noUnusedLocals: true`
- 未使用参数：`noUnusedParameters: true`
- 类型检查：开启所有类型检查规则

### Prettier 配置

```json
{
  "semi": true,              // 使用分号
  "singleQuote": true,       // 使用单引号
  "tabWidth": 2,             // 缩进 2 空格
  "trailingComma": "es5",    // ES5 兼容的尾随逗号
  "printWidth": 100,         // 每行最大 100 字符
  "arrowParens": "always",   // 箭头函数参数始终使用括号
  "endOfLine": "lf"          // 使用 LF 换行符
}
```

### 命名规范

**文件命名：**
- 组件文件：PascalCase (例：`UserProfile.vue`)
- 工具文件：camelCase (例：`formatDate.ts`)
- 类型文件：camelCase (例：`userTypes.ts`)
- 常量文件：UPPER_CASE (例：`API_CONSTANTS.ts`)

**变量命名：**
- 变量/函数：camelCase (例：`userName`, `getUserById`)
- 常量：UPPER_SNAKE_CASE (例：`MAX_RETRY_COUNT`)
- 类/接口/类型：PascalCase (例：`UserService`, `UserInterface`)
- 私有成员：下划线前缀 (例：`_privateMethod`)

### Vue 组件规范

```vue
<script setup lang="ts">
// 1. 导入
import { ref, computed } from 'vue'
import type { User } from '@/types/user'

// 2. Props 定义
interface Props {
  userId: number
  title?: string
}
const props = withDefaults(defineProps<Props>(), {
  title: '默认标题'
})

// 3. Emits 定义
const emit = defineEmits<{
  (e: 'update', value: string): void
  (e: 'delete'): void
}>()

// 4. 响应式状态
const loading = ref(false)
const userData = ref<User | null>(null)

// 5. 计算属性
const displayName = computed(() => {
  return userData.value?.name || '匿名用户'
})

// 6. 方法
const fetchData = async () => {
  loading.value = true
  try {
    // ...
  } finally {
    loading.value = false
  }
}

// 7. 生命周期
onMounted(() => {
  fetchData()
})
</script>

<template>
  <!-- 模板内容 -->
</template>

<style scoped>
/* 样式 */
</style>
```

### API 调用规范

- 统一使用 `api/` 目录下的服务模块
- 错误统一在 `api/client.ts` 中处理
- 所有 API 调用必须有 TypeScript 类型定义

### 注释规范

- 公共 API 必须添加 JSDoc 注释
- 复杂业务逻辑必须添加说明注释
- 禁止无意义的注释（如：`// 设置变量`）

### 代码质量要求

- 提交前必须通过 `npm run lint` 检查
- 提交前必须通过 `npm run test` 测试
- 新功能必须包含单元测试
- 代码覆盖率要求 >= 80%

---

## 提交检查

项目已配置自动化检查工具，在提交代码时会自动执行以下检查：

1. **Commitlint** - 检查提交信息格式
2. **Lint-staged** - 检查暂存文件的代码质量
3. **ESLint + Prettier** - 代码格式化和检查
4. **TypeScript** - 类型检查

如果检查失败，提交将被阻止。请根据错误提示修复问题后再次尝试提交。

---

## 开发流程

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'feat: 添加某功能'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request
6. 等待 Code Review 和 CI 检查通过
7. 合并到主分支

---

## 行为准则

- 尊重所有贡献者
- 提供建设性的反馈
- 关注问题本身，而非个人
- 保持开放和包容的心态

---

## 获取帮助

如有问题或建议，请通过以下方式联系：

- [GitHub Issues](https://github.com/Winuel/winuel/issues)
- [项目文档](./README.md)

---

**再次感谢你的贡献！** 🎉