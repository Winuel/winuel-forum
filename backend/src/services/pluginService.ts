/**
 * 插件管理服务
 * Plugin Management Service
 * 
 * 负责插件的管理，包括：
 * - 插件的安装、激活、停用和卸载
 * - 插件配置的管理
 * - 插件状态的查询
 * - 插件清单的验证
 * 
 * Responsible for plugin management, including:
 * - Plugin installation, activation, deactivation, and uninstallation
 * - Plugin configuration management
 * - Plugin status query
 * - Plugin manifest validation
 * 
 * @package backend/src/services
 */

import type { D1Database } from '@cloudflare/workers-types'
import type { PluginRecord, PluginConfigRecord } from '../models/plugin.js'
import type { PluginPackage, PluginManifest, PluginConfig } from '@winuel/plugin-system'
import { PluginLoader, PluginValidator, PluginStatus } from '@winuel/plugin-system'

/**
 * 插件管理服务类
 * Plugin Management Service Class
 * 
 * 提供插件管理的所有业务逻辑
 * Provides all business logic for plugin management
 */
export class PluginService {
  /**
   * 构造函数
   * Constructor
   * 
   * @param db - D1 数据库实例 / D1 database instance
   * @param loader - 插件加载器实例 / Plugin loader instance
   */
  constructor(private db: D1Database, private loader: PluginLoader) {}

  /**
   * 安装插件
   * Install Plugin
   * 
   * 验证插件清单并安装插件
   * Validates plugin manifest and installs the plugin
   * 
   * @param pluginPackage - 插件包 / Plugin package
   * @throws 如果插件清单无效 / Throws if plugin manifest is invalid
   * @throws 如果插件已安装 / Throws if plugin is already installed
   */
  async installPlugin(pluginPackage: PluginPackage): Promise<void> {
    const { manifest } = pluginPackage
    
    // 验证插件清单 / Validate plugin manifest
    const validation = PluginValidator.validateManifest(manifest)
    if (!validation.valid) {
      throw new Error(`Invalid plugin manifest: ${validation.errors.join(', ')} / 无效的插件清单：${validation.errors.join(', ')}`)
    }

    // 检查插件是否已安装 / Check if plugin is already installed
    const existing = await this.getPlugin(manifest.metadata.id)
    if (existing) {
      throw new Error(`Plugin ${manifest.metadata.id} is already installed / 插件 ${manifest.metadata.id} 已安装`)
    }

    // 加载插件 / Load plugin
    await this.loader.loadPlugin(pluginPackage)

    // 保存到数据库 / Save to database
    await this.savePluginToDatabase(manifest)
  }

  /**
   * 激活插件
   * Activate Plugin
   * 
   * @param pluginId - 插件 ID / Plugin ID
   * @throws 如果插件不存在 / Throws if plugin doesn't exist
   */
  async activatePlugin(pluginId: string): Promise<void> {
    const plugin = await this.getPlugin(pluginId)
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} not found / 插件 ${pluginId} 未找到`)
    }

    await this.loader.activatePlugin(pluginId)

    // 更新数据库状态 / Update database status
    await this.updatePluginStatus(pluginId, PluginStatus.ACTIVE, true)
  }

  /**
   * 停用插件
   * Deactivate Plugin
   * 
   * @param pluginId - 插件 ID / Plugin ID
   * @throws 如果插件不存在 / Throws if plugin doesn't exist
   */
  async deactivatePlugin(pluginId: string): Promise<void> {
    const plugin = await this.getPlugin(pluginId)
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} not found / 插件 ${pluginId} 未找到`)
    }

    await this.loader.deactivatePlugin(pluginId)

    // 更新数据库状态 / Update database status
    await this.updatePluginStatus(pluginId, PluginStatus.INACTIVE, false)
  }

  /**
   * 卸载插件
   * Uninstall Plugin
   * 
   * @param pluginId - 插件 ID / Plugin ID
   * @throws 如果插件不存在 / Throws if plugin doesn't exist
   */
  async uninstallPlugin(pluginId: string): Promise<void> {
    const plugin = await this.getPlugin(pluginId)
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} not found / 插件 ${pluginId} 未找到`)
    }

    await this.loader.uninstallPlugin(pluginId)

    // 从数据库删除 / Delete from database
    await this.db.prepare('DELETE FROM plugins WHERE id = ?').bind(pluginId).run()
  }

  /**
   * 获取插件
   * Get Plugin
   * 
   * @param pluginId - 插件 ID / Plugin ID
   * @returns 插件记录或 null / Plugin record or null
   */
  async getPlugin(pluginId: string): Promise<PluginRecord | null> {
    const result = await this.db.prepare(
      'SELECT * FROM plugins WHERE id = ?'
    ).bind(pluginId).first()

    return result as PluginRecord | null
  }

  /**
   * 获取所有插件
   * Get All Plugins
   * 
   * @returns 插件记录列表 / Plugin record list
   */
  async getAllPlugins(): Promise<PluginRecord[]> {
    const results = await this.db.prepare(
      'SELECT * FROM plugins ORDER BY installed_at DESC'
    ).all()

    return results.results as unknown as PluginRecord[]
  }

  /**
   * 获取已激活的插件
   * Get Active Plugins
   * 
   * @returns 已激活的插件记录列表 / Active plugin record list
   */
  async getActivePlugins(): Promise<PluginRecord[]> {
    const results = await this.db.prepare(
      'SELECT * FROM plugins WHERE status = ? AND enabled = true ORDER BY installed_at DESC'
    ).bind('active').all()

    return results.results as unknown as PluginRecord[]
  }

  /**
   * 更新插件配置
   * Update Plugin Configuration
   * 
   * @param pluginId - 插件 ID / Plugin ID
   * @param config - 配置对象 / Configuration object
   * @throws 如果插件不存在 / Throws if plugin doesn't exist
   */
  async updatePluginConfig(pluginId: string, config: Record<string, any>): Promise<void> {
    const plugin = await this.getPlugin(pluginId)
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} not found / 插件 ${pluginId} 未找到`)
    }

    // 更新配置 / Update configuration
    await this.db.prepare(
      'UPDATE plugins SET config = ?, updated_at = ? WHERE id = ?'
    ).bind(JSON.stringify(config), new Date().toISOString(), pluginId).run()

    // 重新加载插件配置 / Reload plugin configuration
    if (plugin.status === 'active') {
      await this.loader.deactivatePlugin(pluginId)
      await this.loader.activatePlugin(pluginId)
    }
  }

  /**
   * 获取插件配置
   * Get Plugin Configuration
   * 
   * @param pluginId - 插件 ID / Plugin ID
   * @returns 配置对象或 null / Configuration object or null
   */
  async getPluginConfig(pluginId: string): Promise<Record<string, any> | null> {
    const plugin = await this.getPlugin(pluginId)
    if (!plugin) {
      return null
    }

    return JSON.parse(plugin.config)
  }

  /**
   * 保存插件到数据库（私有方法）
   * Save Plugin to Database (Private Method)
   * 
   * @param manifest - 插件清单 / Plugin manifest
   */
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

  /**
   * 更新插件状态（私有方法）
   * Update Plugin Status (Private Method)
   * 
   * @param pluginId - 插件 ID / Plugin ID
   * @param status - 插件状态 / Plugin status
   * @param enabled - 是否启用 / Whether enabled
   */
  private async updatePluginStatus(
    pluginId: string,
    status: PluginStatus,
    enabled: boolean
  ): Promise<void> {
    await this.db.prepare(
      'UPDATE plugins SET status = ?, enabled = ?, updated_at = ? WHERE id = ?'
    ).bind(status, enabled, new Date().toISOString(), pluginId).run()
  }

  /**
   * 获取插件加载器
   * Get Plugin Loader
   * 
   * @returns 插件加载器实例 / Plugin loader instance
   */
  getLoader(): PluginLoader {
    return this.loader
  }
}