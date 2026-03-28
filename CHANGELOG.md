# 更新日志

本文档记录 Winuel 项目的所有重要变更。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [0.1.0] - 2026-03-28

### 🎉 正式版发布

Winuel Forum v0.1.0 正式版发布，这是项目的首个正式版本，包含完整的论坛功能。

### ✨ 新增功能

#### 📦 共享包发布
- 发布6个共享包到 npm（latest 标签）
  - `@winuel/plugin-system@0.1.0` - 插件系统核心
  - `@winuel/shared-api@0.1.0` - API 客户端
  - `@winuel/shared-config@0.1.0` - 配置管理
  - `@winuel/shared-core@0.1.0` - 核心类型
  - `@winuel/shared-stores@0.1.0` - 状态管理
  - `@winuel/shared-ui@0.1.0` - UI 组件库

#### 📚 文档完善
- 文档中英文分离（README.md / README_EN.md）
- 新增完整的发布说明（RELEASE_NOTES.md）
- 所有文档内容更新到最新版本

#### 🔧 工具脚本
- 新增依赖模式切换脚本（switch-dependency-mode.sh）
- 完善的发布脚本（publish-packages-final.sh）

### 🔄 改进

- 版本号从 0.1.0-beta 升级到 0.1.0
- 所有包统一使用 latest 标签发布
- 代码质量和性能优化

### 🐛 修复

- 修复 npm 包发布配置问题
- 修复版本号不一致问题
- 修复缓存导致的标签指向问题

### 📝 文档

- API 文档完善
- 部署指南更新
- 贡献指南优化
- 新增发布说明文档

### 🎯 后续计划

- v0.2.0：搜索功能、文件上传、用户关注系统
- v0.3.0：推荐算法、PWA 支持、多语言支持

---

## [0.1.0-beta] - 2026-03-22

### 🎉 首个Beta版本发布

Winuel 论坛系统的首个公开测试版本，完成了模块化重构和插件系统的基础架构。

### ✨ 新增功能

#### 📦 模块化架构 (Phase 1)
- 创建6个共享包，实现代码复用和模块化
  - `@winuel/plugin-system` - 插件系统核心
  - `@winuel/shared-api` - API客户端
  - `@winuel/shared-config` - 配置管理
  - `@winuel/shared-core` - 核心类型
  - `@winuel/shared-stores` - 状态管理
  - `@winuel/shared-ui` - UI组件库
- 建立 monorepo 架构，使用 pnpm workspace
- 重构前后端代码，移除约80%的重复逻辑

#### 🔧 依赖注入系统 (Phase 2)
- 实现轻量级DI容器
- 支持 singleton 和 transient 生命周期
- 优化服务注册和依赖解析
- 提高代码可测试性和可维护性

#### 🧩 插件系统 (Phase 3)
- 前后端统一插件架构
- 插件加载器和管理系统
- 事件总线机制
- OAuth 2.0 认证集成
- 插件市场API支持
- 示例插件（Hello World）

#### 🎨 核心功能
- **用户系统**: 注册/登录、JWT认证、个人资料、权限管理
- **内容系统**: 帖子管理、评论系统、分类管理、标签系统
- **管理功能**: 用户管理、帖子管理、评论管理、审计日志、统计分析
- **代码附件**: 支持代码片段上传、版本管理、差异对比、代码审查

### 🔨 技术改进

#### 构建系统优化
- 修复9个构建相关问题
- 优化构建顺序和依赖管理
- 完善 TypeScript 类型支持（DOM、Node.js）
- 添加依赖声明（vue-router、axios）
- 同步 Lockfile 文件

#### 代码质量
- 全面的 TypeScript 类型安全
- ESLint 和 Prettier 代码规范
- 单元测试覆盖（backend 25/25测试通过）
- CI/CD 流程完善

#### 安全增强
- JWT 受众分离（user/admin）
- 增强的 CORS 配置
- 一次性邮箱黑名单（5334个域名）
- 密码强度验证
- 审计日志系统

### 🐛 修复问题

- 修复 TypeScript 类型声明文件生成问题
- 修复构建顺序导致的依赖错误
- 修复 Cloudflare Pages 构建环境依赖缺失
- 修复侧边栏自动弹出问题
- 修复密码验证规则过于严格的问题

### 📊 性能优化

- 数据库性能索引优化
- API 响应缓存
- 前端代码分割和懒加载
- 图片资源优化
- 全球 CDN 部署

### 📚 文档完善

- API 文档（API.md）
- 贡献指南（CONTRIBUTING.md）
- 部署指南（DEPLOYMENT.md）
- 插件开发指南（PLUGIN_DEVELOPMENT_GUIDE.md）
- 构建配置文档（BUILD.md）

### 🔄 迁移变更

- 新增5个数据库迁移：
  - 软删除支持
  - 审计日志系统
  - 性能索引优化
  - 代码附件功能
  - 插件系统支持

### 🔒 安全更新

- 增强的输入验证和消毒
- 防止XSS和CSRF攻击
- 安全的会话管理
- 敏感操作审计日志

### 📦 依赖更新

主要依赖版本：
- Vue: 3.5.30
- TypeScript: 5.9.3
- Hono: 4.12.8
- Pinia: 3.0.4
- Vue Router: 5.0.4
- TailwindCSS: 3.4.19

### 🧪 测试

- 后端单元测试：25/25 通过
- 前端类型检查：全部通过
- E2E测试：基础功能验证完成
- 构建测试：所有包构建成功

### 📈 代码统计

- 总文件数：200+ (TypeScript/Vue)
- 新增文件：47个
- 修改文件：42个
- 代码行数：+13,638 / -1,051
- 重复代码减少：约80%

### 🚀 部署就绪

- ✅ Cloudflare Workers 兼容
- ✅ Docker 容器化支持
- ✅ 环境变量配置
- ✅ 数据库迁移脚本
- ✅ CI/CD 流程

### 📝 注意事项

#### Beta 版本说明
- 这是一个测试版本，不建议用于生产环境
- 部分功能可能仍在完善中
- API 可能会在后续版本中调整
- 欢迎反馈问题和建议

#### 已知问题
- 插件市场功能仍在开发中
- 某些边界情况的错误处理需要改进
- 性能优化还有提升空间

#### 兼容性
- Node.js >= 18.0.0
- 现代浏览器（Chrome 90+, Firefox 88+, Safari 14+, Edge 90+）
- 移动端浏览器（iOS Safari 14+, Chrome Mobile 90+）

### 🎯 下一步计划

#### Phase 4: 平台化功能（开发中）
- 高级插件特性
- 插件市场完善
- 多租户支持
- 更多管理功能

#### 短期目标
- 修复 Beta 版本反馈的问题
- 性能优化和稳定性提升
- 完善文档和示例
- 增加更多测试覆盖

#### 长期目标
- 完整的插件生态系统
- 企业级功能
- 高级分析功能
- 多语言支持

### 🙏 致谢

感谢所有为此版本做出贡献的开发者和测试者。

### 📞 联系方式

- 项目主页: https://github.com/LemonStudio-hub/winuel
- 官方文档: https://docs.winuel.com
- 问题反馈: https://github.com/LemonStudio-hub/winuel/issues
- 演示站点: https://www.winuel.com

---

## 版本说明

- **主版本号**: 不兼容的 API 修改
- **次版本号**: 向下兼容的功能性新增
- **修订号**: 向下兼容的问题修正

### 版本类型

- **alpha**: 内部测试版本
- **beta**: 公开测试版本
- **rc**: 候选发布版本
- **stable**: 稳定发布版本