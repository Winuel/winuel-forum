import type { PluginStorage } from '../types/index.js'

/**插件存储实现（内存存储）*/
export class PluginStorageImpl implements PluginStorage {
  private storage: Map<string, any> = new Map()

  async get<T = any>(key: string): Promise<T | undefined> {
    return this.storage.get(key)
  }

  async set<T = any>(key: string, value: T): Promise<void> {
    this.storage.set(key, value)
  }

  async delete(key: string): Promise<void> {
    this.storage.delete(key)
  }

  async clear(): Promise<void> {
    this.storage.clear()
  }

  async keys(): Promise<string[]> {
    return Array.from(this.storage.keys())
  }

  /**支持序列化的存储*/
  static async create(persistenceKey?: string): Promise<PluginStorageImpl> {
    const storage = new PluginStorageImpl()
    
    if (persistenceKey && typeof localStorage !== 'undefined') {
      try {
        const stored = localStorage.getItem(persistenceKey)
        if (stored) {
          const data = JSON.parse(stored)
          Object.entries(data).forEach(([key, value]) => storage.storage.set(key, value))
        }
      } catch (error) {
        console.warn('Failed to load persistent storage:', error)
      }
    }
    
    return storage
  }

  async save(persistenceKey: string): Promise<void> {
    if (typeof localStorage === 'undefined') {
      return
    }
    
    const data = Object.fromEntries(this.storage)
    try {
      localStorage.setItem(persistenceKey, JSON.stringify(data))
    } catch (error) {
      console.error('Failed to save persistent storage:', error)
    }
  }
}