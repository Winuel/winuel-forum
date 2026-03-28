/**
 * KV 缓存工具类
 * KV Cache Utility Class
 * 
 * 提供基于 Cloudflare KV 的缓存功能，包括：
 * - 自动缓存过期管理
 * - 缓存键生成
 * - 缓存穿透保护
 * - 缓存性能监控
 * 
 * Provides KV-based caching functionality including:
 * - Automatic cache expiration management
 * - Cache key generation
 * - Cache penetration protection
 * - Cache performance monitoring
 * 
 * @package backend/src/utils
 */

import type { KVNamespace } from '@cloudflare/workers-types'
import { logger } from './logger'

/**
 * 缓存配置接口
 * Cache Configuration Interface
 */
export interface CacheConfig {
  /** 默认过期时间（秒）/ Default expiration time in seconds */
  defaultTTL?: number
  /** 缓存键前缀 / Cache key prefix */
  prefix?: string
  /** 是否启用缓存 / Whether caching is enabled */
  enabled?: boolean
  /** 是否记录缓存命中率 / Whether to log cache hit rate */
  logHits?: boolean
}

/**
 * 缓存统计信息
 * Cache Statistics
 */
export interface CacheStats {
  /** 缓存命中次数 / Cache hit count */
  hits: number
  /** 缓存未命中次数 / Cache miss count */
  misses: number
  /** 总请求数 / Total request count */
  total: number
  /** 缓存命中率 / Cache hit rate */
  hitRate: number
}

/**
 * KV 缓存工具类
 * KV Cache Utility Class
 */
export class KVCache {
  private kv: KVNamespace
  private config: Required<CacheConfig>
  private stats: CacheStats

  constructor(kv: KVNamespace, config: CacheConfig = {}) {
    this.kv = kv
    this.config = {
      defaultTTL: config.defaultTTL || 300, // 默认5分钟 / Default 5 minutes
      prefix: config.prefix || 'cache:',
      enabled: config.enabled !== false,
      logHits: config.logHits || true,
    }
    this.stats = {
      hits: 0,
      misses: 0,
      total: 0,
      hitRate: 0,
    }
  }

  /**
   * 生成缓存键
   * Generate Cache Key
   * 
   * @param key - 原始键 / Original key
   * @returns 带前缀的缓存键 / Cache key with prefix
   */
  private generateKey(key: string): string {
    return `${this.config.prefix}${key}`
  }

  /**
   * 更新统计信息
   * Update Statistics
   * 
   * @param hit - 是否命中 / Whether it's a hit
   */
  private updateStats(hit: boolean): void {
    this.stats.total++
    if (hit) {
      this.stats.hits++
    } else {
      this.stats.misses++
    }
    this.stats.hitRate = this.stats.hits / this.stats.total
  }

  /**
   * 记录缓存操作日志
   * Log Cache Operation
   * 
   * @param operation - 操作类型 / Operation type
   * @param key - 缓存键 / Cache key
   * @param hit - 是否命中 / Whether it's a hit
   */
  private logOperation(operation: 'get' | 'set' | 'delete' | 'clear', key: string, hit?: boolean): void {
    if (!this.config.logHits) return
    
    const logKey = key.substring(0, 50) + (key.length > 50 ? '...' : '')
    const message = hit !== undefined ? `Cache ${operation}: ${logKey} (${hit ? 'HIT' : 'MISS'})` : `Cache ${operation}: ${logKey}`
    
    if (hit === false) {
      logger.debug(message)
    } else if (hit === true) {
      logger.info(message)
    } else {
      logger.debug(message)
    }
  }

  /**
   * 获取缓存值
   * Get Cache Value
   * 
   * @param key - 缓存键 / Cache key
   * @returns 缓存值或 null / Cache value or null
   */
  async get<T = string>(key: string): Promise<T | null> {
    if (!this.config.enabled) {
      return null
    }

    try {
      const cacheKey = this.generateKey(key)
      const value = await this.kv.get(cacheKey)
      
      if (value !== null) {
        this.updateStats(true)
        this.logOperation('get', key, true)
        
        // 尝试解析 JSON
        try {
          return JSON.parse(value) as T
        } catch {
          return value as T
        }
      } else {
        this.updateStats(false)
        this.logOperation('get', key, false)
        return null
      }
    } catch (error) {
      logger.error('Cache get error:', error)
      return null
    }
  }

  /**
   * 设置缓存值
   * Set Cache Value
   * 
   * @param key - 缓存键 / Cache key
   * @param value - 缓存值 / Cache value
   * @param ttl - 过期时间（秒），默认使用配置的默认值 / Expiration time in seconds, defaults to configured default
   */
  async set(key: string, value: unknown, ttl?: number): Promise<void> {
    if (!this.config.enabled) {
      return
    }

    try {
      const cacheKey = this.generateKey(key)
      const expiry = ttl !== undefined ? ttl : this.config.defaultTTL
      
      // 序列化值
      let serializedValue: string
      if (typeof value === 'string') {
        serializedValue = value
      } else {
        serializedValue = JSON.stringify(value)
      }

      await this.kv.put(cacheKey, serializedValue, { expirationTtl: expiry })
      this.logOperation('set', key)
    } catch (error) {
      logger.error('Cache set error:', error)
    }
  }

  /**
   * 删除缓存值
   * Delete Cache Value
   * 
   * @param key - 缓存键 / Cache key
   */
  async delete(key: string): Promise<void> {
    if (!this.config.enabled) {
      return
    }

    try {
      const cacheKey = this.generateKey(key)
      await this.kv.delete(cacheKey)
      this.logOperation('delete', key)
    } catch (error) {
      logger.error('Cache delete error:', error)
    }
  }

  /**
   * 清除所有缓存
   * Clear All Cache
   */
  async clear(): Promise<void> {
    if (!this.config.enabled) {
      return
    }

    try {
      const list = await this.kv.list({ prefix: this.config.prefix })
      
      for (const key of list.keys) {
        await this.kv.delete(key.name)
      }
      
      this.logOperation('clear', '')
      logger.info(`Cleared ${list.keys.length} cache entries`)
    } catch (error) {
      logger.error('Cache clear error:', error)
    }
  }

  /**
   * 获取或设置缓存（缓存穿透保护）
   * Get or Set Cache (Cache Penetration Protection)
   * 
   * @param key - 缓存键 / Cache key
   * @param factory - 数据获取工厂函数 / Data fetch factory function
   * @param ttl - 过期时间（秒）/ Expiration time in seconds
   * @returns 缓存值 / Cache value
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    // 尝试从缓存获取
    const cached = await this.get<T>(key)
    if (cached !== null) {
      return cached
    }

    // 从数据源获取
    const value = await factory()
    
    // 缓存结果
    await this.set(key, value, ttl)
    
    return value
  }

  /**
   * 批量获取缓存值
   * Batch Get Cache Values
   * 
   * @param keys - 缓存键数组 / Cache key array
   * @returns 键值对映射 / Key-value map
   */
  async getMany<T = string>(keys: string[]): Promise<Map<string, T>> {
    const result = new Map<string, T>()
    
    for (const key of keys) {
      const value = await this.get<T>(key)
      if (value !== null) {
        result.set(key, value)
      }
    }
    
    return result
  }

  /**
   * 批量设置缓存值
   * Batch Set Cache Values
   * 
   * @param entries - 键值对数组 / Key-value pairs array
   * @param ttl - 过期时间（秒）/ Expiration time in seconds
   */
  async setMany<T>(entries: Array<{ key: string; value: T }>, ttl?: number): Promise<void> {
    for (const { key, value } of entries) {
      await this.set(key, value, ttl)
    }
  }

  /**
   * 批量删除缓存值
   * Batch Delete Cache Values
   * 
   * @param keys - 缓存键数组 / Cache key array
   */
  async deleteMany(keys: string[]): Promise<void> {
    for (const key of keys) {
      await this.delete(key)
    }
  }

  /**
   * 获取缓存统计信息
   * Get Cache Statistics
   * 
   * @returns 缓存统计信息 / Cache statistics
   */
  getStats(): CacheStats {
    return { ...this.stats }
  }

  /**
   * 重置缓存统计信息
   * Reset Cache Statistics
   */
  resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      total: 0,
      hitRate: 0,
    }
  }

  /**
   * 检查缓存是否启用
   * Check if Cache is Enabled
   * 
   * @returns 是否启用 / Whether enabled
   */
  isEnabled(): boolean {
    return this.config.enabled
  }

  /**
   * 启用缓存
   * Enable Cache
   */
  enable(): void {
    this.config.enabled = true
    logger.info('Cache enabled')
  }

  /**
   * 禁用缓存
   * Disable Cache
   */
  disable(): void {
    this.config.enabled = false
    logger.info('Cache disabled')
  }
}

/**
 * 创建缓存实例工厂函数
 * Create Cache Instance Factory Function
 * 
 * @param kv - KV 命名空间 / KV namespace
 * @param config - 缓存配置 / Cache configuration
 * @returns KV 缓存实例 / KV cache instance
 */
export function createCache(kv: KVNamespace, config?: CacheConfig): KVCache {
  return new KVCache(kv, config)
}