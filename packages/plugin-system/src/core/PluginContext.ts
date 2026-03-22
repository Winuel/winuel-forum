import type { PluginContext, IPlugin, IEventBus } from '../types/index.js'
import { PluginLoggerImpl } from './PluginLogger.js'
import { PluginStorageImpl } from './PluginStorage.js'
import { PluginAPIImpl } from './PluginAPI.js'

/**插件上下文实现*/
export class PluginContextImpl implements PluginContext {
  pluginId: string
  version: string
  config: Record<string, any>
  logger: PluginLoggerImpl
  eventBus: IEventBus
  storage: PluginStorageImpl
  api: PluginAPIImpl
  dependencies: Map<string, IPlugin>

  constructor(options: {
    pluginId: string
    version: string
    config: Record<string, any>
    eventBus: IEventBus
    storage: PluginStorageImpl
    api: PluginAPIImpl
    dependencies: Map<string, IPlugin>
  }) {
    this.pluginId = options.pluginId
    this.version = options.version
    this.config = options.config
    this.logger = new PluginLoggerImpl(options.pluginId)
    this.eventBus = options.eventBus
    this.storage = options.storage
    this.api = options.api
    this.dependencies = options.dependencies
  }

  static create(
    pluginId: string,
    version: string,
    config: Record<string, any>,
    eventBus: IEventBus,
    api: PluginAPIImpl,
    dependencies: Map<string, IPlugin>
  ): PluginContextImpl {
    const storage = new PluginStorageImpl()
    return new PluginContextImpl({
      pluginId,
      version,
      config,
      eventBus,
      storage,
      api,
      dependencies
    })
  }
}