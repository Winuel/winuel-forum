import type { IPlugin, PluginManifest, PluginPackage, PluginPlatform } from '../types/index.js'
import { PluginStatus } from '../types/index.js'
import { EventBus } from '../event-bus/EventBus.js'
import { PluginContextImpl } from '../core/PluginContext.js'
import { PluginAPIImpl } from '../core/PluginAPI.js'

/**插件加载器选项*/
export interface PluginLoaderOptions {
  autoResolveDependencies?: boolean
  strictVersionValidation?: boolean
  allowDowngrade?: boolean
}

/**插件状态信息*/
export interface PluginState {
  pluginId: string
  status: PluginStatus
  version: string
  enabled: boolean
  error?: string
  loadTime: number
  metadata: any
}

/**插件加载器实现*/
export class PluginLoader {
  private plugins: Map<string, IPlugin> = new Map()
  private pluginStates: Map<string, PluginState> = new Map()
  private pluginManifests: Map<string, PluginManifest> = new Map()
  private eventBus: EventBus = new EventBus()
  private api: PluginAPIImpl = new PluginAPIImpl()
  private options: PluginLoaderOptions

  constructor(options: PluginLoaderOptions = {}) {
    this.options = {
      autoResolveDependencies: true,
      strictVersionValidation: false,
      allowDowngrade: false,
      ...options
    }
  }

  /**加载插件包*/
  async loadPlugin(pluginPackage: PluginPackage): Promise<void> {
    const { manifest } = pluginPackage
    
    if (!manifest) {
      throw new Error('Plugin manifest is required')
    }

    const { metadata } = manifest
    this.pluginManifests.set(metadata.id, manifest)

    const pluginState: PluginState = {
      pluginId: metadata.id,
      status: PluginStatus.LOADING,
      version: metadata.version,
      enabled: false,
      loadTime: Date.now(),
      metadata
    }

    this.pluginStates.set(metadata.id, pluginState)

    try {
      const plugin = await this.createPluginFromManifest(manifest)
      this.plugins.set(metadata.id, plugin)
      this.api.registerPlugin(plugin)
      
      pluginState.status = PluginStatus.INSTALLED
      await this.pluginManagerEvent('plugin:installed', { pluginId: metadata.id, plugin })
    } catch (error) {
      pluginState.status = PluginStatus.ERROR
      pluginState.error = error instanceof Error ? error.message : String(error)
      await this.pluginManagerEvent('plugin:error', { pluginId: metadata.id, error })
      throw error
    }
  }

  /**从清单创建插件实例*/
  private async createPluginFromManifest(manifest: PluginManifest): Promise<IPlugin> {
    const pluginClass = await this.loadPluginEntry(manifest.entry)
    const plugin = new pluginClass()
    return plugin
  }

  /**加载插件入口*/
  private async loadPluginEntry(entry: string): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        if (typeof entry === 'string') {
          resolve(entry)
        } else {
          resolve(entry)
        }
      } catch (error) {
        reject(error)
      }
    })
  }

  /**激活插件*/
  async activatePlugin(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId)
    const state = this.pluginStates.get(pluginId)

    if (!plugin) {
      throw new Error(`Plugin ${pluginId} not found`)
    }

    if (!state) {
      throw new Error(`Plugin state ${pluginId} not found`)
    }

    if (state.status === PluginStatus.ACTIVE) {
      throw new Error(`Plugin ${pluginId} is already active`)
    }

    try {
      state.status = PluginStatus.LOADING
      const dependencies = await this.resolveDependencies(plugin)
      const context = PluginContextImpl.create(
        pluginId,
        plugin.metadata.version,
        {},
        this.eventBus,
        this.api,
        dependencies
      )

      await plugin.activate(context)
      
      state.status = PluginStatus.ACTIVE
      state.enabled = true
      await this.pluginManagerEvent('plugin:activated', { pluginId, plugin })
    } catch (error) {
      state.status = PluginStatus.ERROR
      state.error = error instanceof Error ? error.message : String(error)
      await this.pluginManagerEvent('plugin:error', { pluginId, error })
      throw error
    }
  }

  /**停用插件*/
  async deactivatePlugin(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId)
    const state = this.pluginStates.get(pluginId)

    if (!plugin) {
      throw new Error(`Plugin ${pluginId} not found`)
    }

    if (!state) {
      throw new Error(`Plugin state ${pluginId} not found`)
    }

    if (state.status !== PluginStatus.ACTIVE) {
      throw new Error(`Plugin ${pluginId} is not active`)
    }

    try {
      const context = PluginContextImpl.create(
        pluginId,
        plugin.metadata.version,
        {},
        this.eventBus,
        this.api,
        new Map()
      )

      await plugin.deactivate(context)
      
      state.status = PluginStatus.INACTIVE
      state.enabled = false
      await this.pluginManagerEvent('plugin:deactivated', { pluginId, plugin })
    } catch (error) {
      state.status = PluginStatus.ERROR
      state.error = error instanceof Error ? error.message : String(error)
      await this.pluginManagerEvent('plugin:error', { pluginId, error })
      throw error
    }
  }

  /**卸载插件*/
  async uninstallPlugin(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId)
    const state = this.pluginStates.get(pluginId)

    if (!plugin) {
      throw new Error(`Plugin ${pluginId} not found`)
    }

    if (!state) {
      throw new Error(`Plugin state ${pluginId} not found`)
    }

    if (state.status === PluginStatus.ACTIVE) {
      await this.deactivatePlugin(pluginId)
    }

    try {
      const context = PluginContextImpl.create(
        pluginId,
        plugin.metadata.version,
        {},
        this.eventBus,
        this.api,
        new Map()
      )

      await plugin.uninstall(context)
      
      this.plugins.delete(pluginId)
      this.pluginStates.delete(pluginId)
      this.pluginManifests.delete(pluginId)
      this.api.unregisterPlugin(pluginId)
      
      await this.pluginManagerEvent('plugin:uninstalled', { pluginId })
    } catch (error) {
      state.status = PluginStatus.ERROR
      state.error = error instanceof Error ? error.message : String(error)
      await this.pluginManagerEvent('plugin:error', { pluginId, error })
      throw error
    }
  }

  /**解析依赖*/
  private async resolveDependencies(plugin: IPlugin): Promise<Map<string, IPlugin>> {
    const dependencies = new Map<string, IPlugin>()
    
    if (this.options.autoResolveDependencies) {
      for (const dep of plugin.metadata.dependencies) {
        const depPlugin = this.plugins.get(dep.name)
        if (depPlugin) {
          dependencies.set(dep.name, depPlugin)
        } else if (!dep.optional) {
          throw new Error(`Required dependency ${dep.name} not found for plugin ${plugin.metadata.id}`)
        }
      }
    }
    
    return dependencies
  }

  /**插件管理事件*/
  private async pluginManagerEvent(event: string, data: any): Promise<void> {
    await this.eventBus.emit(event, data)
  }

  /**获取插件状态*/
  getPluginState(pluginId: string): PluginState | undefined {
    return this.pluginStates.get(pluginId)
  }

  /**获取所有插件状态*/
  getAllPluginStates(): PluginState[] {
    return Array.from(this.pluginStates.values())
  }

  /**获取已安装插件*/
  getInstalledPlugins(): IPlugin[] {
    return Array.from(this.plugins.values())
  }

  /**按平台获取插件*/
  getPluginsByPlatform(platform: PluginPlatform): IPlugin[] {
    return this.getInstalledPlugins().filter(
      plugin => plugin.metadata.platform === platform || plugin.metadata.platform === 'both'
    )
  }

  /**检查插件是否已安装*/
  isPluginInstalled(pluginId: string): boolean {
    return this.plugins.has(pluginId)
  }

  /**检查插件是否已激活*/
  isPluginActive(pluginId: string): boolean {
    const state = this.pluginStates.get(pluginId)
    return state?.status === PluginStatus.ACTIVE
  }

  /**获取事件总线*/
  getEventBus(): EventBus {
    return this.eventBus
  }

  /**获取API*/
  getAPI(): PluginAPIImpl {
    return this.api
  }
}