# Winuel v0.1.0-beta 发布说明

**发布日期**: 2026年3月22日  
**版本类型**: Beta 测试版本  
**发布分支**: develop  
**Git Tag**: v0.1.0-beta

---

## 🎉 版本概述

Winuel 论坛系统的首个公开测试版本！经过完整的 Phase 1-3 模块化重构，我们实现了现代化、可扩展的插件化架构。

### 核心成就
- ✅ 完成3个开发阶段的模块化重构
- ✅ 构建6个共享包的 monorepo 架构  
- ✅ 实现前后端统一的插件系统
- ✅ 代码复用率提升约80%
- ✅ 所有构建和测试通过

---

## 🚀 快速开始

### 安装依赖
```bash
# 使用 pnpm 安装所有依赖
pnpm install
```

### 开发模式
```bash
# 同时启动前后端开发服务器
pnpm dev

# 单独启动后端
pnpm dev:backend

# 单独启动前端
pnpm dev:frontend
```

### 构建生产版本
```bash
# 构建所有包
pnpm build

# 单独构建某个应用
pnpm build:backend
pnpm build:frontend
pnpm build:admin
```

---

## 📦 包版本信息

### 主项目
- `winuel`: `0.1.0-beta`

### 共享包
- `@winuel/plugin-system`: `0.1.0-beta` - 插件系统核心
- `@winuel/shared-api`: `0.1.0-beta` - API客户端
- `@winuel/shared-config`: `0.1.0-beta` - 配置管理
- `@winuel/shared-core`: `0.1.0-beta` - 核心类型
- `@winuel/shared-stores`: `0.1.0-beta` - 状态管理
- `@winuel/shared-ui`: `0.1.0-beta` - UI组件库

### 应用
- `winuel-backend`: `0.1.0-beta` - 后端API
- `winuel-frontend`: `0.1.0-beta` - 前端界面
- `winuel-admin`: `0.1.0-beta` - 管理后台

---

## 🎨 新增功能

### Phase 1: 模块化重构
- 创建6个共享包，实现代码复用
- 建立 pnpm workspace monorepo 架构
- 重构前后端代码，移除重复逻辑
- 统一类型定义和接口规范

### Phase 2: 依赖注入系统
- 实现轻量级DI容器
- 支持 singleton 和 transient 生命周期
- 优化服务注册和依赖解析
- 提高代码可测试性和可维护性

### Phase 3: 插件系统
- 前后端统一插件架构
- 插件加载器和管理系统
- 事件总线机制
- OAuth 2.0 认证集成
- 插件市场API支持
- 示例插件和开发文档

### 核心业务功能
- **用户系统**: 注册、登录、JWT认证、个人资料、权限管理
- **内容系统**: 帖子管理、评论系统、分类管理、标签系统
- **管理功能**: 用户管理、帖子管理、评论管理、审计日志、统计分析
- **代码附件**: 代码上传、版本管理、差异对比、代码审查

---

## 🔧 技术改进

### 构建系统优化
- 修复9个构建相关问题
- 优化构建顺序和依赖管理
- 完善 TypeScript 类型支持
- 添加必要的依赖声明
- 同步 Lockfile 文件

### 代码质量提升
- 全面的 TypeScript 类型安全
- ESLint 和 Prettier 代码规范
- 单元测试覆盖（backend 25/25）
- CI/CD 流程完善

### 安全增强
- JWT 受众分离（user/admin）
- 增强的 CORS 配置
- 一次性邮箱黑名单（5334个域名）
- 密码强度验证
- 审计日志系统

---

## 🐛 已修复问题

### 构建相关
- 修复 TypeScript 类型声明文件生成问题
- 修复构建顺序导致的依赖错误
- 修复 Cloudflare Pages 构建环境依赖缺失
- 修复 .js 扩展名类型解析问题

### 功能相关
- 修复侧边栏自动弹出问题
- 修复密码验证规则过于严格的问题
- 修复 API 路由配置问题
- 修复 OAuth 认证流程问题

### 类型相关
- 添加 DOM 类型支持（File对象）
- 添加 Node.js 类型支持（process对象）
- 修复插件系统类型声明文件
- 完善 shared-ui 类型定义

---

## 📊 性能优化

- 数据库性能索引优化
- API 响应缓存机制
- 前端代码分割和懒加载
- 图片资源优化
- 全球 CDN 部署

---

## 📚 文档完善

新增和更新的文档：
- ✅ **CHANGELOG.md** - 版本更新日志
- ✅ **API.md** - 完整的API文档
- ✅ **CONTRIBUTING.md** - 贡献指南
- ✅ **DEPLOYMENT.md** - 部署指南
- ✅ **PLUGIN_DEVELOPMENT_GUIDE.md** - 插件开发指南
- ✅ **docs/BUILD.md** - 构建配置文档

---

## 🔄 数据库迁移

新增5个数据库迁移：
1. 软删除支持
2. 审计日志系统
3. 性能索引优化
4. 代码附件功能
5. 插件系统支持

---

## 🧪 测试状态

- ✅ 后端单元测试：25/25 通过
- ✅ 前端类型检查：全部通过
- ✅ E2E测试：基础功能验证完成
- ✅ 构建测试：所有包构建成功
- ✅ TypeScript 编译：无错误
- ✅ 代码规范检查：通过

---

## ⚠️ Beta版本说明

### 重要提示
- **此为Beta测试版本，不建议用于生产环境**
- 部分功能可能仍在完善中
- API 可能在后续版本中调整
- 欢迎反馈问题和改进建议

### 已知限制
- 插件市场功能仍在开发中
- 某些边界情况的错误处理需要改进
- 性能优化还有提升空间
- 部分高级功能未完全实现

### 兼容性要求
- Node.js >= 18.0.0
- 现代浏览器（Chrome 90+, Firefox 88+, Safari 14+, Edge 90+）
- 移动端浏览器（iOS Safari 14+, Chrome Mobile 90+）

---

## 🎯 下一步计划

### Phase 4: 平台化功能（开发中）
- 高级插件特性
- 插件市场完善
- 多租户支持
- 更多管理功能

### 短期目标
- 修复 Beta 版本反馈的问题
- 性能优化和稳定性提升
- 完善文档和示例
- 增加更多测试覆盖

### 长期目标
- 完整的插件生态系统
- 企业级功能
- 高级分析功能
- 多语言支持

---

## 📋 安装和部署

### 本地开发
```bash
# 克隆仓库
git clone https://github.com/Winuel/winuel.git
cd winuel

# 切换到 develop 分支
git checkout develop

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

### 生产部署
详细的部署指南请参考 [DEPLOYMENT.md](../DEPLOYMENT.md)

---

## 🙏 贡献者

感谢所有为此版本做出贡献的开发者和测试者。

---

## 📞 联系方式

- **项目主页**: https://github.com/Winuel/winuel
- **官方文档**: https://docs.winuel.com
- **问题反馈**: https://github.com/Winuel/winuel/issues
- **演示站点**: https://www.winuel.com
- **讨论区**: https://github.com/Winuel/winuel/discussions

---

## 📄 许可证

MIT License - 详见 [LICENSE](../LICENSE) 文件

---

## 🔗 相关链接

- [CHANGELOG.md](../CHANGELOG.md) - 完整的更新日志
- [API.md](../API.md) - API文档
- [CONTRIBUTING.md](../CONTRIBUTING.md) - 贡献指南
- [PLUGIN_DEVELOPMENT_GUIDE.md](../examples/plugins/PLUGIN_DEVELOPMENT_GUIDE.md) - 插件开发指南

---

**感谢使用 Winuel！期待您的反馈和贡献！** 🚀