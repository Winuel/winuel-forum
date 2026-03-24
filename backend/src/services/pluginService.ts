import type { D1Database } from '@cloudflare/workers-types'
import type { PluginRecord, PluginConfigRecord } from '../models/plugin.js'
import type { PluginPackage, PluginManifest, PluginConfig } from '@cloudlink/plugin-system'
import { PluginLoader, PluginValidator, PluginStatus } from '@cloudlink/plugin-system'

/**插件管理服务*/
export class PluginService {
  constructor(private db: D1Database, private loader: PluginLoader) {}

  /**安装插件*/
  async installPlugin(pluginPackage: PluginPackage): Promise<void> {
    const { manifest } = pluginPackage
    
    // 验证插件清单
    const validation = PluginValidator.validateManifest(manifest)
    if (!validation.valid) {
      throw new Error(`Invalid plugin manifest: ${validation.errors.join(', ')}`)
    }

    // 检查插件是否已安装
    const existing = await this.getPlugin(manifest.metadata.id)
    if (existing) {
      throw new Error(`Plugin ${manifest.metadata.id} is already installed`)
    }

    // 加载插件
    await this.loader.loadPlugin(pluginPackage)

    // 保存到数据库
    await this.savePluginToDatabase(manifest)
  }

  /**激活插件*/
  async activatePlugin(pluginId: string): Promise<void> {
    const plugin = await this.getPlugin(pluginId)
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} not found`)
    }

    await this.loader.activatePlugin(pluginId)

    // 更新数据库状态
    await this.updatePluginStatus(pluginId, PluginStatus.ACTIVE, true)
  }

  /**停用插件*/
  async deactivatePlugin(pluginId: string): Promise<void> {
    const plugin = await this.getPlugin(pluginId)
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} not found`)
    }

    await this.loader.deactivatePlugin(pluginId)

    // 更新数据库状态
    await this.updatePluginStatus(pluginId, PluginStatus.INACTIVE, false)
  }

  /**卸载插件*/
  async uninstallPlugin(pluginId: string): Promise<void> {
    const plugin = await this.getPlugin(pluginId)
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} not found`)
    }

    await this.loader.uninstallPlugin(pluginId)

    // 从数据库删除
    await this.db.prepare('DELETE FROM plugins WHERE id = ?').bind(pluginId).run()
  }

  /**获取插件*/
  async getPlugin(pluginId: string): Promise<PluginRecord | null> {
    const result = await this.db.prepare(
      'SELECT * FROM plugins WHERE id = ?'
    ).bind(pluginId).first()

    return result as PluginRecord | null
  }

  /**获取所有插件*/
  async getAllPlugins(): Promise<PluginRecord[]> {
    const results = await this.db.prepare(
      'SELECT * FROM plugins ORDER BY installed_at DESC'
    ).all()

    return results.results as unknown as PluginRecord[]
  }

  /**获取已激活的插件*/
  async getActivePlugins(): Promise<PluginRecord[]> {
    const results = await this.db.prepare(
      'SELECT * FROM plugins WHERE status = ? AND enabled = true ORDER BY installed_at DESC'
    ).bind('active').all()

    return results.results as unknown as PluginRecord[]
  }

  /**更新插件配置*/
  async updatePluginConfig(pluginId: string, config: Record<string, any>): Promise<void> {
    const plugin = await this.getPlugin(pluginId)
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} not found`)
    }

    // 更新配置
    await this.db.prepare(
      'UPDATE plugins SET config = ?, updated_at = ? WHERE id = ?'
    ).bind(JSON.stringify(config), new Date().toISOString(), pluginId).run()

    // 重新加载插件配置
    if (plugin.status === 'active') {
      await this.loader.deactivatePlugin(pluginId)
      await this.loader.activatePlugin(pluginId)
    }
  }

  /**获取插件配置*/
  async getPluginConfig(pluginId: string): Promise<Record<string, any> | null> {
    const plugin = await this.getPlugin(pluginId)
    if (!plugin) {
      return null
    }

    return JSON.parse(plugin.config)
  }

  /**保存插件到数据库*/
  private async savePluginToDatabase(manifest: PluginManifest): Promise<void> {
    const now = new Date().toISOString()
    
    await this.db.prepare(
      'INSERT INTO plugins (id, manifest, status, enabled, version, config, installed_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    ).bind(
      manifest.metadata.id,
      JSON.stringify(manifest),
      'installed',
      false,
      manifest.metadata.version,
      JSON.stringify({}),
      now,
      now
    ).run()
  }

  /**更新插件状态*/
  private async updatePluginStatus(
    pluginId: string,
    status: PluginStatus,
    enabled: boolean
  ): Promise<void> {
    await this.db.prepare(
      'UPDATE plugins SET status = ?, enabled = ?, updated_at = ? WHERE id = ?'
    ).bind(status, enabled, new Date().toISOString(), pluginId).run()
  }

  /**获取插件加载器*/
  getLoader(): PluginLoader {
    return this.loader
  }
}