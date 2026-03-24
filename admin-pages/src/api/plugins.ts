import { get } from './client'

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
  platform: 'both' | 'backend' | 'frontend'
  priority: 0 | 1 | 2 | 3
  dependencies: Array<{ name: string; version: string; optional: boolean }>
  peerDependencies: Array<{ name: string; version: string; optional: boolean }>
  permissions: Array<{
    name: string
    description: string
    required: boolean
    scope: 'global' | 'tenant' | 'user'
  }>
  configSchema: any
  minCompatibleVersion?: string
  maxCompatibleVersion?: string
}

export interface Plugin {
  id: string
  manifest: PluginMetadata
  status: 'installed' | 'active' | 'inactive' | 'error' | 'loading'
  enabled: boolean
  version: string
  config: Record<string, any>
  installedAt: string
  updatedAt: string
  error?: string
}

export async function getAllPlugins(): Promise<Plugin[]> {
  const response = await get<{ success: boolean; data: Plugin[] }>('/api/admin/plugins')
  return response.data || []
}

export async function getPlugin(pluginId: string): Promise<Plugin> {
  const response = await get<{ success: boolean; data: Plugin }>(`/api/admin/plugins/${pluginId}`)
  return response.data
}

export async function getActivePlugins(): Promise<Plugin[]> {
  const response = await get<{ success: boolean; data: Plugin[] }>('/api/admin/plugins/active/list')
  return response.data || []
}

export async function installPlugin(pluginPackage: any): Promise<void> {
  const response = await post<{ success: boolean; message: string }>('/api/admin/plugins/install', {
    pluginPackage
  })
  return response
}

export async function activatePlugin(pluginId: string): Promise<void> {
  const response = await post<{ success: boolean; message: string }>(`/api/admin/plugins/${pluginId}/activate`)
  return response
}

export async function deactivatePlugin(pluginId: string): Promise<void> {
  const response = await post<{ success: boolean; message: string }>(`/api/admin/plugins/${pluginId}/deactivate`)
  return response
}

export async function uninstallPlugin(pluginId: string): Promise<void> {
  const response = await del<{ success: boolean; message: string }>(`/api/admin/plugins/${pluginId}`)
  return response
}

export async function updatePluginConfig(pluginId: string, config: Record<string, any>): Promise<void> {
  const response = await put<{ success: boolean; message: string }>(`/api/admin/plugins/${pluginId}/config`, {
    config
  })
  return response
}

export async function getPluginConfig(pluginId: string): Promise<Record<string, any>> {
  const response = await get<{ success: boolean; data: Record<string, any> }>(`/api/admin/plugins/${pluginId}/config`)
  return response.data
}

// 修复导入缺失的问题
async function post<T>(url: string, data?: unknown): Promise<T> {
  const { post } = await import('./client')
  return post<T>(url, data)
}

async function put<T>(url: string, data?: unknown): Promise<T> {
  const { put } = await import('./client')
  return put<T>(url, data)
}

async function del<T>(url: string): Promise<T> {
  const { del } = await import('./client')
  return del<T>(url)
}