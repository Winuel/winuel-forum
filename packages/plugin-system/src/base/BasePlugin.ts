import type { IPlugin, PluginContext, PluginConfigSchema } from '../types/index.js'

/**插件基类*/
export abstract class BasePlugin implements IPlugin {
  abstract metadata: any
  
  protected context: PluginContext | undefined
  protected config: Record<string, any> = {}

  async install(context: PluginContext): Promise<void> {
    this.context = context
    await this.onInstall(context)
  }

  async activate(context: PluginContext): Promise<void> {
    this.context = context
    this.config = context.config
    await this.onActivate(context)
  }

  async deactivate(context: PluginContext): Promise<void> {
    await this.onDeactivate(context)
  }

  async uninstall(context: PluginContext): Promise<void> {
    await this.onUninstall(context)
  }

  getConfigSchema(): PluginConfigSchema {
    return this.onGetConfigSchema()
  }

  validateConfig(config: Record<string, any>): { valid: boolean; errors: string[] } {
    const schema = this.getConfigSchema()
    const errors: string[] = []
    
    if (schema.required) {
      for (const key of schema.required) {
        if (!(key in config)) {
          errors.push(`Required field "${key}" is missing`)
        }
      }
    }
    
    return { valid: errors.length === 0, errors }
  }

  /**生命周期钩子 - 可由子类覆盖*/
  protected async onInstall(_context: PluginContext): Promise<void> {}
  protected async onActivate(_context: PluginContext): Promise<void> {}
  protected async onDeactivate(_context: PluginContext): Promise<void> {}
  protected async onUninstall(_context: PluginContext): Promise<void> {}
  
  protected onGetConfigSchema(): PluginConfigSchema {
    return {
      type: 'object',
      properties: {}
    }
  }

  /**便捷方法*/
  protected emit(event: string, ...args: any[]): Promise<any[]> {
    return this.context?.eventBus.emit(event, ...args) ?? Promise.resolve([])
  }

  protected on(event: string, handler: (...args: any[]) => void | Promise<void>): void {
    this.context?.eventBus.on(event, handler)
  }

  protected once(event: string, handler: (...args: any[]) => void | Promise<void>): void {
    this.context?.eventBus.once(event, handler)
  }

  protected async getStorage<T = any>(key: string): Promise<T | undefined> {
    return this.context?.storage.get<T>(key)
  }

  protected async setStorage<T = any>(key: string, value: T): Promise<void> {
    await this.context?.storage.set(key, value)
  }

  protected async deleteStorage(key: string): Promise<void> {
    await this.context?.storage.delete(key)
  }

  protected logInfo(message: string, ...args: any[]): void {
    this.context?.logger.info(message, ...args)
  }

  protected logWarn(message: string, ...args: any[]): void {
    this.context?.logger.warn(message, ...args)
  }

  protected logError(message: string, ...args: any[]): void {
    this.context?.logger.error(message, ...args)
  }
}