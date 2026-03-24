import DefaultTheme from 'vitepress/theme-without-fonts'
import { h } from 'vue'
import './styles/custom.css'

export default {
  extends: DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      // 可以在这里添加自定义布局内容
    })
  }
}