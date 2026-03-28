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
    rollupOptions: {
      output: {
        // 确保资源正确加载
        assetFileNames: 'assets/[name].[hash][extname]',
        chunkFileNames: 'assets/[name].[hash].js',
        entryFileNames: 'assets/[name].[hash].js',
        // 手动代码分割 - 按库分块
        manualChunks: {
          // Vue 核心库 / Vue core libraries
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          // 工具库 / Utility libraries
          'utils-vendor': ['axios']
        }
      }
    },
    // 代码块大小警告限制 (KB)
    chunkSizeWarningLimit: 500
  },
  // 开发服务器配置
  server: {
    port: 5173,
    strictPort: false,
    host: true
  },
  // 预览服务器配置
  preview: {
    port: 4173,
    strictPort: false,
    host: true
  },
  // 优化配置
  optimizeDeps: {
    include: ['vue', 'vue-router', 'pinia', 'axios']
  }
})
