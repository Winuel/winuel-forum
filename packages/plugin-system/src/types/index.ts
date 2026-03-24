/**插件状态枚举*/
export enum PluginStatus {
  INSTALLED = 'installed',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ERROR = 'error',
  LOADING = 'loading'
}

/**插件平台枚举*/
export enum PluginPlatform {
  BOTH = 'both',
  BACKEND = 'backend',
  FRONTEND = 'frontend'
}

/**插件优先级*/
export enum PluginPriority {
  LOW = 0,
  MEDIUM = 1,
  HIGH = 2,
  CRITICAL = 3
}

/**插件元数据*/
export interface PluginMetadata {
  id: string
  name: string
  version: string
  description: string
  author: string
  authorEmail?: string
  homepage?: string
  repository?: string
  license: string
  keywords: string[]
  platform: PluginPlatform
  priority: PluginPriority
  dependencies: PluginDependency[]
  peerDependencies: PluginDependency[]
  permissions: PluginPermission[]
  configSchema: PluginConfigSchema
  minCompatibleVersion?: string
  maxCompatibleVersion?: string
}

/**插件依赖*/
export interface PluginDependency {
  name: string
  version: string
  optional: boolean
}

/**插件权限*/
export interface PluginPermission {
  name: string
  description: string
  required: boolean
  scope: 'global' | 'tenant' | 'user'
}

/**插件配置Schema*/
export interface PluginConfigSchema {
  type: 'object' | 'string' | 'number' | 'boolean' | 'array' | 'null'
  properties?: Record<string, PluginConfigProperty>
  required?: string[]
  default?: any
  additionalProperties?: boolean
}

/**插件配置属性*/
export interface PluginConfigProperty {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'null'
  title: string
  description?: string
  default?: any
  enum?: any[]
  minimum?: number
  maximum?: number
  minLength?: number
  maxLength?: number
  pattern?: string
  items?: PluginConfigProperty
  properties?: Record<string, PluginConfigProperty>
  required?: string[]
}

/**插件配置*/
export interface PluginConfig {
  pluginId: string
  enabled: boolean
  version: string
  config: Record<string, any>
}

/**插件实例接口*/
export interface IPlugin {
  metadata: PluginMetadata
  install(context: PluginContext): Promise<void>
  activate(context: PluginContext): Promise<void>
  deactivate(context: PluginContext): Promise<void>
  uninstall(context: PluginContext): Promise<void>
  getConfigSchema(): PluginConfigSchema
  validateConfig(config: Record<string, any>): { valid: boolean; errors: string[] }
}

/**插件上下文*/
export interface PluginContext {
  pluginId: string
  version: string
  config: Record<string, any>
  logger: PluginLogger
  eventBus: IEventBus
  storage: PluginStorage
  api: PluginAPI
  dependencies: Map<string, IPlugin>
}

/**插件日志器*/
export interface PluginLogger {
  debug(message: string, ...args: any[]): void
  info(message: string, ...args: any[]): void
  warn(message: string, ...args: any[]): void
  error(message: string, ...args: any[]): void
}

/**插件存储*/
export interface PluginStorage {
  get<T = any>(key: string): Promise<T | undefined>
  set<T = any>(key: string, value: T): Promise<void>
  delete(key: string): Promise<void>
  clear(): Promise<void>
  keys(): Promise<string[]>
}

/**插件API*/
export interface PluginAPI {
  registerRoute(path: string, handler: any): void
  registerComponent(name: string, component: any): void
  registerService(serviceName: string, service: any): void
  getPlugin(pluginId: string): IPlugin | undefined
  getAllPlugins(): IPlugin[]
  getPluginsByPlatform(platform: PluginPlatform): IPlugin[]
}

/**事件总线接口*/
export interface IEventBus {
  on(event: string, handler: EventHandler): void
  off(event: string, handler: EventHandler): void
  once(event: string, handler: EventHandler): void
  emit(event: string, ...args: any[]): Promise<any>
}

/**事件处理器*/
export type EventHandler = (...args: any[]) => void | Promise<void>

/**插件清单*/
export interface PluginManifest {
  metadata: PluginMetadata
  entry: string
  backendEntry?: string
  frontendEntry?: string
  resources: string[]
  scripts: string[]
  styles: string[]
}

/**插件包信息*/
export interface PluginPackage {
  manifest: PluginManifest
  files: Map<string, Blob | string>
}

/**插件市场认证信息*/
export interface MarketplaceAuth {
  provider: string
  clientId: string
  clientSecret: string
  redirectUri: string
  scope: string[]
}

/**插件市场令牌*/
export interface MarketplaceToken {
  access_token: string
  refresh_token: string
  expires_in: number
  token_type: string
}

/**插件市场插件信息*/
export interface MarketplacePlugin {
  id: string
  name: string
  version: string
  description: string
  author: string
  authorEmail: string
  homepage: string
  repository: string
  license: string
  keywords: string[]
  platform: PluginPlatform
  priority: PluginPriority
  dependencies: PluginDependency[]
  peerDependencies: PluginDependency[]
  permissions: PluginPermission[]
  configSchema: PluginConfigSchema
  minCompatibleVersion: string
  maxCompatibleVersion: string
  downloadUrl: string
  fileSize: number
  checksum: string
  signature: string
  verified: boolean
  downloads: number
  rating: number
  ratingCount: number
  createdAt: string
  updatedAt: string
}