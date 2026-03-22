import type { App } from 'vue'
import { getFrontendPluginService } from '../services/pluginService'

/**Vue 3插件系统插件*/
export const PluginSystemPlugin = {
  install(app: App) {
    const pluginService = getFrontendPluginService()

    // 提供插件服务
    app.provide('pluginService', pluginService)

    // 全局属性
    app.config.globalProperties.$pluginService = pluginService

    // 注册组件指令
    app.directive('plugin-component', {
      mounted(el, binding) {
        const componentName = binding.value
        const component = pluginService.getComponent(componentName)
        
        if (component) {
          // 动态加载组件
          console.log('Plugin component loaded:', componentName)
        }
      }
    })
  }
}

/**类型声明*/
declare module 'vue' {
  export interface ComponentCustomProperties {
    $pluginService: ReturnType<typeof getFrontendPluginService>
  }
}