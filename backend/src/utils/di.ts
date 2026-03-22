/**
 * CloudLink 依赖注入容器
 * 提供轻量级的依赖注入功能，支持单例和瞬态生命周期
 */

// ============================================================================
// 生命周期类型
// ============================================================================

export enum LifeCycle {
  SINGLETON = 'singleton',  // 单例模式
  TRANSIENT = 'transient',  // 每次请求创建新实例
  SCOPED = 'scoped',        // 作用域内单例（暂未实现）
}

// ============================================================================
// 依赖描述符
// ============================================================================

export interface DependencyDescriptor<T> {
  token: string
  factory: (container: DIContainer) => T
  lifecycle: LifeCycle
  instance?: T
}

// ============================================================================
// DI 容器类
// ============================================================================

export class DIContainer {
  private dependencies: Map<string, DependencyDescriptor<unknown>> = new Map()
  private scopedInstances: Map<string, Map<string, unknown>> = new Map()

  /**
   * 注册依赖
   */
  register<T>(
    token: string,
    factory: (container: DIContainer) => T,
    lifecycle: LifeCycle = LifeCycle.SINGLETON
  ): void {
    this.dependencies.set(token, {
      token,
      factory,
      lifecycle,
    })
  }

  /**
   * 注册单例
   */
  registerSingleton<T>(
    token: string,
    factory: (container: DIContainer) => T
  ): void {
    this.register(token, factory, LifeCycle.SINGLETON)
  }

  /**
   * 注册瞬态服务
   */
  registerTransient<T>(
    token: string,
    factory: (container: DIContainer) => T
  ): void {
    this.register(token, factory, LifeCycle.TRANSIENT)
  }

  /**
   * 解析依赖（带类型断言）
   */
  resolve<T>(token: string): T {
    const descriptor = this.dependencies.get(token)
    if (!descriptor) {
      throw new Error(`Dependency not found: ${token}`)
    }

    if (descriptor.lifecycle === LifeCycle.SINGLETON) {
      // 单例模式：只创建一次
      if (!descriptor.instance) {
        descriptor.instance = descriptor.factory(this)
      }
      return descriptor.instance as T
    } else if (descriptor.lifecycle === LifeCycle.TRANSIENT) {
      // 瞬态模式：每次创建新实例
      return descriptor.factory(this) as T
    } else {
      throw new Error(`Lifecycle not implemented: ${descriptor.lifecycle}`)
    }
  }

  /**
   * 检查依赖是否已注册
   */
  has(token: string): boolean {
    return this.dependencies.has(token)
  }

  /**
   * 清除所有单例实例
   */
  clearSingletons(): void {
    this.dependencies.forEach((descriptor) => {
      if (descriptor.lifecycle === LifeCycle.SINGLETON) {
        descriptor.instance = undefined
      }
    })
  }

  /**
   * 创建子容器（用于作用域管理）
   */
  createScope(): DIContainer {
    const scopeId = generateScopeId()
    const child = new DIContainer()
    
    // 复制父容器的依赖
    this.dependencies.forEach((descriptor) => {
      child.dependencies.set(descriptor.token, descriptor)
    })
    
    this.scopedInstances.set(scopeId, new Map())
    return child
  }

  /**
   * 解析作用域实例
   */
  resolveScoped<T>(scopeId: string, token: string): T {
    const scoped = this.scopedInstances.get(scopeId)
    if (!scoped) {
      throw new Error(`Scope not found: ${scopeId}`)
    }

    if (!scoped.has(token)) {
      const instance = this.resolve<T>(token)
      scoped.set(token, instance)
    }

    return scoped.get(token) as T
  }

  /**
   * 清除作用域
   */
  clearScope(scopeId: string): void {
    this.scopedInstances.delete(scopeId)
  }
}

// ============================================================================
// 全局容器实例
// ============================================================================

let globalContainer: DIContainer | null = null

export function getGlobalContainer(): DIContainer {
  if (!globalContainer) {
    globalContainer = new DIContainer()
  }
  return globalContainer
}

export function setGlobalContainer(container: DIContainer): void {
  globalContainer = container
}

// ============================================================================
// 辅助函数
// ============================================================================

let scopeCounter = 0
function generateScopeId(): string {
  return `scope-${++scopeCounter}-${Date.now()}`
}

// ============================================================================
// 令牌常量
// ============================================================================

export const DEPENDENCY_TOKENS = {
  DB: 'DB',
  KV: 'KV',
  R2: 'R2',
  ENV: 'ENV',
  JWT_SECRET: 'JWT_SECRET',
  USER_SERVICE: 'UserService',
  POST_SERVICE: 'PostService',
  COMMENT_SERVICE: 'CommentService',
  CATEGORY_SERVICE: 'CategoryService',
  NOTIFICATION_SERVICE: 'NotificationService',
  AUDIT_SERVICE: 'AuditService',
  CODE_ATTACHMENT_SERVICE: 'CodeAttachmentService',
} as const

export type DependencyToken = typeof DEPENDENCY_TOKENS[keyof typeof DEPENDENCY_TOKENS]