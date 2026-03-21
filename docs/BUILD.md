# 构建配置说明

## Rollup 原生模块依赖配置

本项目使用 Vite（基于 Rollup）作为构建工具。Rollup 4.x 使用原生模块来提高构建性能，需要根据运行平台安装对应的原生依赖。

### 问题背景

在 Cloudflare Pages 等 CI 环境中，npm 在处理可选依赖时存在已知问题，导致 Rollup 的原生模块无法正确安装，从而引发构建失败。

### 解决方案

采用以下优雅的配置方式，确保在所有环境中都能正确安装和使用 Rollup 原生模块：

#### 1. `.npmrc` 配置

创建 `.npmrc` 文件，配置 npm 的依赖安装行为：

```ini
# 配置 npm 依赖安装行为
legacy-peer-deps=false
prefer-offline=true
```

#### 2. `package.json` 可选依赖

在根目录的 `package.json` 中添加平台特定的可选依赖：

```json
{
  "optionalDependencies": {
    "@rollup/rollup-linux-x64-gnu": "^4.59.0",
    "@rollup/rollup-darwin-x64": "^4.59.0",
    "@rollup/rollup-win32-x64-msvc": "^4.59.0"
  }
}
```

### 工作原理

1. **平台自动选择**：npm 会根据运行平台自动选择对应的原生模块
   - Linux (Cloudflare Pages): `@rollup/rollup-linux-x64-gnu`
   - macOS: `@rollup/rollup-darwin-x64`
   - Windows: `@rollup/rollup-win32-x64-msvc`

2. **版本锁定**：使用 `package-lock.json` 锁定依赖版本，确保所有环境使用相同的版本

3. **兼容性保证**：通过明确的依赖声明，避免 npm 的可选依赖解析问题

### 验证

构建成功验证：

```bash
cd frontend
npm run build
```

预期输出：
```
✓ built in X.XXs
```

### 维护

当更新 Vite 或 Rollup 版本时，需要同步更新 `optionalDependencies` 中的版本号：

1. 检查 Vite 依赖的 Rollup 版本：
   ```bash
   npm ls rollup
   ```

2. 更新 `package.json` 中的版本号

3. 重新安装依赖：
   ```bash
   npm install
   ```

### 优势

- ✅ **跨平台兼容**：支持 Linux、macOS、Windows 所有平台
- ✅ **零配置部署**：在 Cloudflare Pages 等 CI 环境中自动工作
- ✅ **无技术债务**：使用标准的 npm 依赖管理机制
- ✅ **可维护性高**：配置清晰，易于理解和更新
- ✅ **性能优化**：充分利用原生模块的性能优势

### 参考资源

- [Rollup 官方文档](https://rollupjs.org/)
- [Vite 官方文档](https://vitejs.dev/)
- [npm 可选依赖](https://docs.npmjs.com/cli/v9/configuring-npm/package-json#optionaldependencies)
- [Cloudflare Pages 构建配置](https://developers.cloudflare.com/pages/configuration/build-configuration)