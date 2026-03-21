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
        entryFileNames: 'assets/[name].[hash].js'
      }
    },
    // PWA 相关配置
    chunkSizeWarningLimit: 1000
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
  }
})
