import { PluginLoader } from '@winuel/plugin-system'
import type { PluginPackage, PluginManifest, PluginStatus } from '@winuel/plugin-system'
import { logger } from '../utils/logger'

/**前端插件管理服务*/
export class FrontendPluginService {
  private loader: PluginLoader
  private loadedPlugins: Map<string, PluginManifest> = new Map()
  private componentRegistry: Map<string, unknown> = new Map()

  constructor() {
    this.loader = new PluginLoader({
      autoResolveDependencies: true,
      strictVersionValidation: false
    })

    // 监听插件事件
    this.setupEventListeners()
  }

  /**设置事件监听器*/
  private setupEventListeners(): void {
    const eventBus = this.loader.getEventBus()

    eventBus.on('plugin:installed', (data) => {
      logger.info('Plugin installed:', data.pluginId)
    })

    eventBus.on('plugin:activated', (data) => {
      logger.info('Plugin activated:', data.pluginId)
    })

    eventBus.on('plugin:deactivated', (data) => {
      logger.info('Plugin deactivated:', data.pluginId)
    })

    eventBus.on('plugin:error', (data) => {
      logger.error('Plugin error:', data.pluginId, data.error)
    })
  }

  /**加载插件包*/
  async loadPlugin(pluginPackage: PluginPackage): Promise<void> {
    try {
      await this.loader.loadPlugin(pluginPackage)
      const pluginId = pluginPackage.manifest.metadata.id
      const plugin = this.loader.getInstalledPlugins().find(p => p.metadata.id === pluginId)
      
      if (plugin) {
        this.loadedPlugins.set(pluginId, plugin)
        await this.registerPluginComponents(plugin)
      }
    } catch (error) {
      logger.error('Failed to load plugin', error)
      throw error
    }
  }

  /**注册插件组件*/
  private async registerPluginComponents(plugin: PluginManifest): Promise<void> {
    const api = this.loader.getAPI()
    const components = api.getAllComponents()

    for (const [name, component] of components) {
      this.componentRegistry.set(name, component)
    }
  }

  /**激活插件*/
  async activatePlugin(pluginId: string): Promise<void> {
    try {
      await this.loader.activatePlugin(pluginId)
    } catch (error) {
      logger.error('Failed to activate plugin', error)
      throw error
    }
  }

  /**停用插件*/
  async deactivatePlugin(pluginId: string): Promise<void> {
    try {
      await this.loader.deactivatePlugin(pluginId)
    } catch (error) {
      logger.error('Failed to deactivate plugin', error)
      throw error
    }
  }

  /**卸载插件*/
  async uninstallPlugin(pluginId: string): Promise<void> {
    try {
      await this.loader.uninstallPlugin(pluginId)
      this.loadedPlugins.delete(pluginId)
      
      // 清理组件注册
      for (const [name, component] of this.componentRegistry) {
        if (name.startsWith(`${pluginId}:`)) {
          this.componentRegistry.delete(name)
        }
      }
    } catch (error) {
      logger.error('Failed to uninstall plugin', error)
      throw error
    }
  }

  /**获取插件状态*/
  getPluginState(pluginId: string): Record<string, unknown> | undefined {
    return this.loader.getPluginState(pluginId) as Record<string, unknown> | undefined
  }

  /**获取所有插件状态*/
  getAllPluginStates(): Record<string, unknown>[] {
    return this.loader.getAllPluginStates() as Record<string, unknown>[]
  }

  /**获取已安装的插件*/
  getInstalledPlugins(): PluginManifest[] {
    return this.loader.getInstalledPlugins()
  }

  /**获取注册的组件*/
  getComponent(name: string): unknown {
    return this.componentRegistry.get(name)
  }

  /**获取所有组件*/
  getAllComponents(): Map<string, unknown> {
    return new Map(this.componentRegistry)
  }

  /**检查插件是否已安装*/
  isPluginInstalled(pluginId: string): boolean {
    return this.loader.isPluginInstalled(pluginId)
  }

  /**检查插件是否已激活*/
  isPluginActive(pluginId: string): boolean {
    return this.loader.isPluginActive(pluginId)
  }

  /**获取插件加载器*/
  getLoader(): PluginLoader {
    return this.loader
  }
}

/**单例实例*/
let frontendPluginServiceInstance: FrontendPluginService | null = null

export function getFrontendPluginService(): FrontendPluginService {
  if (!frontendPluginServiceInstance) {
    frontendPluginServiceInstance = new FrontendPluginService()
  }
  return frontendPluginServiceInstance
}