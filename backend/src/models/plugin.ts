import type { PluginConfig, PluginStatus, PluginPlatform } from '@cloudlink/plugin-system'

/**插件数据模型*/
export interface PluginRecord {
  id: string
  manifest: string // JSON string
  status: PluginStatus
  enabled: boolean
  version: string
  config: string // JSON string
  installed_at: string
  updated_at: string
  error?: string
}

/**插件配置记录*/
export interface PluginConfigRecord {
  plugin_id: string
  config: string // JSON string
  updated_at: string
}

/**插件市场插件记录*/
export interface MarketplacePluginRecord {
  id: string
  marketplace_id: string
  name: string
  version: string
  description: string
  author: string
  author_email: string
  homepage: string
  repository: string
  license: string
  keywords: string
  platform: PluginPlatform
  download_url: string
  file_size: number
  checksum: string
  signature: string
  verified: boolean
  downloads: number
  rating: number
  rating_count: number
  created_at: string
  updated_at: string
}