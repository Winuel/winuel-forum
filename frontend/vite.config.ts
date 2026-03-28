import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  build: {
    // 启用压缩 / Enable compression
    minify: 'esbuild',
    rollupOptions: {
      output: {
        // 确保资源正确加载
        assetFileNames: 'assets/[name].[hash][extname]',
        chunkFileNames: 'assets/[name].[hash].js',
        entryFileNames: 'assets/[name].[hash].js',
        // 改进的代码分割策略 / Improved code splitting strategy
        manualChunks: (id) => {
          // Vue 核心库 / Vue core libraries
          if (id.includes('node_modules/vue/') || id.includes('node_modules/@vue/')) {
            return 'vue-vendor'
          }
          // 路由和状态管理 / Router and state management
          if (id.includes('node_modules/vue-router/') || id.includes('node_modules/pinia/')) {
            return 'router-vendor'
          }
          // HTTP 客户端 / HTTP client
          if (id.includes('node_modules/axios/')) {
            return 'http-vendor'
          }
          // 插件系统 / Plugin system
          if (id.includes('node_modules/@winuel/')) {
            return 'plugin-vendor'
          }
          // 其他 node_modules / Other node_modules
          if (id.includes('node_modules/')) {
            return 'vendor'
          }
        }
      }
    },
    // 降低代码块大小警告限制 / Reduce chunk size warning limit
    chunkSizeWarningLimit: 300,
    // 启用 CSS 代码分割 / Enable CSS code splitting
    cssCodeSplit: true,
    // 设置构建目标 / Set build target
    target: 'esnext'
  },
  esbuild: {
    drop: ['console', 'debugger'] // 生产环境移除 console 和 debugger / Remove console and debugger in production
  },
  // 开发服务器配置
  server: {
    port: 5173,
    strictPort: false,
    host: true,
    // 启用 HMR / Enable HMR
    hmr: {
      overlay: false
    }
  },
  // 预览服务器配置
  preview: {
    port: 4173,
    strictPort: false,
    host: true
  },
  // 优化配置
  optimizeDeps: {
    include: ['vue', 'vue-router', 'pinia', 'axios'],
    exclude: ['@winuel/plugin-system'] // 排除插件系统以避免优化问题
  }
})
