/**
 * CloudLink 配置管理系统
 * 提供统一的环境配置管理
 */

import type { AppConfig } from '@cloudlink/shared-core'

// ============================================================================
// 环境类型
// ============================================================================

export type Environment = 'development' | 'staging' | 'production'

// ============================================================================
// 配置接口
// ============================================================================

export interface Config extends AppConfig {
  environment: Environment
  version: string
  buildTime: string
}

// ============================================================================
// 默认配置
// ============================================================================

const defaultConfig: Partial<Config> = {
  version: '1.0.0',
  buildTime: new Date().toISOString(),
  features: {
    registration: true,
    emailVerification: false,
    socialLogin: false,
    notifications: true,
  },
  cors: {
    allowedOrigins: [],
    allowCredentials: true,
  },
  rateLimit: {
    authEndpoint: 5,
    normalEndpoint: 100,
    timeWindow: 60,
  },
}

// ============================================================================
// 配置管理器
// ============================================================================

class ConfigManager {
  private config: Config
  private environment: Environment

  constructor() {
    this.environment = this.detectEnvironment()
    this.config = this.loadConfig()
  }

  /**
   * 检测当前环境
   */
  private detectEnvironment(): Environment {
    const env = (typeof import.meta !== 'undefined' && import.meta.env?.MODE) || 
                (typeof process !== 'undefined' && process.env?.NODE_ENV) || 
                'development'
    
    if (env === 'production') {
      return 'production'
    }
    
    if (env === 'staging') {
      return 'staging'
    }
    
    return 'development'
  }

  /**
   * 加载配置
   */
  private loadConfig(): Config {
    // 从环境变量加载
    const apiBaseUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) || 
                      (typeof process !== 'undefined' && process.env?.API_BASE_URL) || 
                      'http://localhost:8787'
    
    // 根据 API 基础 URL 确定 CORS 允许的源
    const allowedOrigins = this.getOriginsForApi(apiBaseUrl)
    
    const config: Config = {
      ...defaultConfig,
      environment: this.environment,
      apiBaseUrl,
      cors: {
        allowedOrigins,
        allowCredentials: true,
      },
      rateLimit: {
        authEndpoint: 5,
        normalEndpoint: 100,
        timeWindow: 60,
      },
      version: '1.0.0',
      buildTime: new Date().toISOString(),
      features: {
        registration: true,
        emailVerification: false,
        socialLogin: false,
        notifications: true,
      },
    }
    
    return config
  }

  /**
   * 获取允许的源列表（内部方法）
   */
  private getOriginsForApi(apiBaseUrl: string): string[] {
    const origins: string[] = []
    
    // 添加当前域名
    if (typeof window !== 'undefined') {
      origins.push(window.location.origin)
    }
    
    // 根据 API 基础 URL 添加相关域名
    if (apiBaseUrl.includes('api.winuel.com')) {
      origins.push('https://www.winuel.com')
      origins.push('https://winuel.pages.dev')
      origins.push('https://admin.winuel.com')
      origins.push('https://64229809.winuel-admin.pages.dev')
      origins.push('https://winuel-admin.pages.dev')
    }
    
    // 开发环境允许本地地址
    if (this.environment === 'development') {
      origins.push('http://localhost:5173')
      origins.push('http://127.0.0.1:5173')
      origins.push('http://localhost:8787')
      origins.push('http://127.0.0.1:8787')
    }
    
    return [...new Set(origins)] // 去重
  }

  /**
   * 获取配置
   */
  public getConfig(): Config {
    return { ...this.config }
  }

  /**
   * 获取特定配置项
   */
  public get<K extends keyof Config>(key: K): Config[K] {
    return this.config[key]
  }

  /**
   * 更新配置
   */
  public update(updates: Partial<Config>): void {
    this.config = { ...this.config, ...updates }
  }

  /**
   * 获取环境
   */
  public getEnvironment(): Environment {
    return this.environment
  }

  /**
   * 判断是否为生产环境
   */
  public isProduction(): boolean {
    return this.environment === 'production'
  }

  /**
   * 判断是否为开发环境
   */
  public isDevelopment(): boolean {
    return this.environment === 'development'
  }

  /**
   * 判断是否为测试环境
   */
  public isStaging(): boolean {
    return this.environment === 'staging'
  }

  /**
   * 获取 API 基础 URL
   */
  public getApiBaseUrl(): string {
    return this.config.apiBaseUrl
  }

  /**
   * 获取允许的源列表
   */
  public getAllowedOrigins(): string[] {
    return [...this.config.cors.allowedOrigins]
  }
}

// ============================================================================
// 默认实例
// ============================================================================

let configManager: ConfigManager | null = null

export function getConfigManager(): ConfigManager {
  if (!configManager) {
    configManager = new ConfigManager()
  }
  return configManager
}

export function getConfig(): Config {
  return getConfigManager().getConfig()
}

export function getApiBaseUrl(): string {
  return getConfigManager().getApiBaseUrl()
}

export function getAllowedOrigins(): string[] {
  return getConfigManager().getAllowedOrigins()
}

export function getEnvironment(): Environment {
  return getConfigManager().getEnvironment()
}

export function isProduction(): boolean {
  return getConfigManager().isProduction()
}

export function isDevelopment(): boolean {
  return getConfigManager().isDevelopment()
}

export function isStaging(): boolean {
  return getConfigManager().isStaging()
}

// ============================================================================
// 导出
// ============================================================================

export { ConfigManager }