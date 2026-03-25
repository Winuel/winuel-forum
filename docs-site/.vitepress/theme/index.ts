import DefaultTheme from 'vitepress/theme-without-fonts'
import { h, nextTick, onMounted, watch } from 'vue'
import { useRoute } from 'vitepress'
import './styles/custom.css'

// 滚动动画观察器
let observer: IntersectionObserver | null = null

export default {
  extends: DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      // 可以在这里添加自定义布局内容
    })
  },
  enhanceApp({ app, router, siteData }) {
    // 可以在这里添加全局组件、插件等
  }
}