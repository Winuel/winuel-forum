import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { PluginSystemPlugin } from './plugins/pluginSystem'
import './style.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(PluginSystemPlugin)

app.mount('#app')

// 注册 Service Worker（PWA 支持）
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('Service Worker 注册成功:', registration.scope)
        
        // 监听更新
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // 新的 Service Worker 已安装，提示用户刷新
                console.log('新版本可用，请刷新页面')
                // 可以在这里显示更新提示
              }
            })
          }
        })
      })
      .catch((error) => {
        console.error('Service Worker 注册失败:', error)
      })
  })
  
  // 监听来自 Service Worker 的消息
  navigator.serviceWorker.addEventListener('message', (event) => {
    console.log('收到 Service Worker 消息:', event.data)
  })
}