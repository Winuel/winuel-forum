import type { PluginAPI, IPlugin, PluginPlatform } from '../types/index.js'

/**插件API实现*/
export class PluginAPIImpl implements PluginAPI {
  private plugins: Map<string, IPlugin> = new Map()
  private routes: Map<string, any> = new Map()
  private components: Map<string, any> = new Map()
  private services: Map<string, any> = new Map()

  registerPlugin(plugin: IPlugin): void {
    this.plugins.set(plugin.metadata.id, plugin)
  }

  unregisterPlugin(pluginId: string): void {
    this.plugins.delete(pluginId)
  }

  registerRoute(path: string, handler: any): void {
    this.routes.set(path, handler)
  }

  unregisterRoute(path: string): void {
    this.routes.delete(path)
  }

  registerComponent(name: string, component: any): void {
    this.components.set(name, component)
  }

  unregisterComponent(name: string): void {
    this.components.delete(name)
  }

  registerService(serviceName: string, service: any): void {
    this.services.set(serviceName, service)
  }

  unregisterService(serviceName: string): void {
    this.services.delete(serviceName)
  }

  getPlugin(pluginId: string): IPlugin | undefined {
    return this.plugins.get(pluginId)
  }

  getAllPlugins(): IPlugin[] {
    return Array.from(this.plugins.values())
  }

  getPluginsByPlatform(platform: PluginPlatform): IPlugin[] {
    return this.getAllPlugins().filter(
      plugin => plugin.metadata.platform === platform || plugin.metadata.platform === 'both'
    )
  }

  getRoute(path: string): any {
    return this.routes.get(path)
  }

  getAllRoutes(): Map<string, any> {
    return new Map(this.routes)
  }

  getComponent(name: string): any {
    return this.components.get(name)
  }

  getAllComponents(): Map<string, any> {
    return new Map(this.components)
  }

  getService(serviceName: string): any {
    return this.services.get(serviceName)
  }

  getAllServices(): Map<string, any> {
    return new Map(this.services)
  }
}