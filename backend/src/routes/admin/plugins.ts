import { Hono } from 'hono'
import type { Variables } from '../../types.js'
import type { PluginRecord } from '../../models/plugin.js'
import { PluginService } from '../../services/pluginService.js'
import { DIContainer, DEPENDENCY_TOKENS } from '../../utils/di.js'

const app = new Hono<{ Variables: Variables }>()

/**获取所有插件*/
app.get('/', async (c) => {
  const container = c.get('container') as DIContainer | undefined
  if (!container) {
    return c.json({ success: false, error: { code: 'INTERNAL_ERROR', message: '服务容器未初始化' } }, 500)
  }

  const pluginService = container.resolve<PluginService>(DEPENDENCY_TOKENS.PLUGIN_SERVICE)
  const plugins = await pluginService.getAllPlugins()

  return c.json({
    success: true,
    data: plugins.map((plugin: PluginRecord) => ({
      id: plugin.id,
      manifest: JSON.parse(plugin.manifest),
      status: plugin.status,
      enabled: plugin.enabled,
      version: plugin.version,
      config: JSON.parse(plugin.config),
      installedAt: plugin.installed_at,
      updatedAt: plugin.updated_at,
      error: plugin.error
    }))
  })
})

/**获取单个插件详情*/
app.get('/:pluginId', async (c) => {
  const container = c.get('container') as DIContainer | undefined
  if (!container) {
    return c.json({ success: false, error: { code: 'INTERNAL_ERROR', message: '服务容器未初始化' } }, 500)
  }

  const pluginId = c.req.param('pluginId')
  const pluginService = container.resolve<PluginService>(DEPENDENCY_TOKENS.PLUGIN_SERVICE)
  const plugin = await pluginService.getPlugin(pluginId)

  if (!plugin) {
    return c.json({ success: false, error: { code: 'NOT_FOUND', message: '插件未找到' } }, 404)
  }

  return c.json({
    success: true,
    data: {
      id: plugin.id,
      manifest: JSON.parse(plugin.manifest),
      status: plugin.status,
      enabled: plugin.enabled,
      version: plugin.version,
      config: JSON.parse(plugin.config),
      installedAt: plugin.installed_at,
      updatedAt: plugin.updated_at,
      error: plugin.error
    }
  })
})

/**获取已激活的插件*/
app.get('/active/list', async (c) => {
  const container = c.get('container') as DIContainer | undefined
  if (!container) {
    return c.json({ success: false, error: { code: 'INTERNAL_ERROR', message: '服务容器未初始化' } }, 500)
  }

  const pluginService = container.resolve<PluginService>(DEPENDENCY_TOKENS.PLUGIN_SERVICE)
  const plugins = await pluginService.getActivePlugins()

  return c.json({
    success: true,
    data: plugins.map((plugin: PluginRecord) => ({
      id: plugin.id,
      manifest: JSON.parse(plugin.manifest),
      status: plugin.status,
      enabled: plugin.enabled,
      version: plugin.version,
      config: JSON.parse(plugin.config),
      installedAt: plugin.installed_at,
      updatedAt: plugin.updated_at,
      error: plugin.error
    }))
  })
})

/**安装插件*/
app.post('/install', async (c) => {
  const container = c.get('container') as DIContainer | undefined
  if (!container) {
    return c.json({ success: false, error: { code: 'INTERNAL_ERROR', message: '服务容器未初始化' } }, 500)
  }

  try {
    const body = await c.req.json()
    const { pluginPackage } = body

    if (!pluginPackage) {
      return c.json({ success: false, error: { code: 'INVALID_INPUT', message: '插件包数据缺失' } }, 400)
    }

    const pluginService = container.resolve<PluginService>(DEPENDENCY_TOKENS.PLUGIN_SERVICE)
    await pluginService.installPlugin(pluginPackage)

    return c.json({
      success: true,
      message: '插件安装成功'
    })
  } catch (error: any) {
    return c.json({
      success: false,
      error: {
        code: 'INSTALL_FAILED',
        message: error.message || '插件安装失败'
      }
    }, 500)
  }
})

/**激活插件*/
app.post('/:pluginId/activate', async (c) => {
  const container = c.get('container') as DIContainer | undefined
  if (!container) {
    return c.json({ success: false, error: { code: 'INTERNAL_ERROR', message: '服务容器未初始化' } }, 500)
  }

  const pluginId = c.req.param('pluginId')

  try {
    const pluginService = container.resolve<PluginService>(DEPENDENCY_TOKENS.PLUGIN_SERVICE)
    await pluginService.activatePlugin(pluginId)

    return c.json({
      success: true,
      message: '插件激活成功'
    })
  } catch (error: any) {
    return c.json({
      success: false,
      error: {
        code: 'ACTIVATE_FAILED',
        message: error.message || '插件激活失败'
      }
    }, 500)
  }
})

/**停用插件*/
app.post('/:pluginId/deactivate', async (c) => {
  const container = c.get('container') as DIContainer | undefined
  if (!container) {
    return c.json({ success: false, error: { code: 'INTERNAL_ERROR', message: '服务容器未初始化' } }, 500)
  }

  const pluginId = c.req.param('pluginId')

  try {
    const pluginService = container.resolve<PluginService>(DEPENDENCY_TOKENS.PLUGIN_SERVICE)
    await pluginService.deactivatePlugin(pluginId)

    return c.json({
      success: true,
      message: '插件停用成功'
    })
  } catch (error: any) {
    return c.json({
      success: false,
      error: {
        code: 'DEACTIVATE_FAILED',
        message: error.message || '插件停用失败'
      }
    }, 500)
  }
})

/**卸载插件*/
app.delete('/:pluginId', async (c) => {
  const container = c.get('container') as DIContainer | undefined
  if (!container) {
    return c.json({ success: false, error: { code: 'INTERNAL_ERROR', message: '服务容器未初始化' } }, 500)
  }

  const pluginId = c.req.param('pluginId')

  try {
    const pluginService = container.resolve<PluginService>(DEPENDENCY_TOKENS.PLUGIN_SERVICE)
    await pluginService.uninstallPlugin(pluginId)

    return c.json({
      success: true,
      message: '插件卸载成功'
    })
  } catch (error: any) {
    return c.json({
      success: false,
      error: {
        code: 'UNINSTALL_FAILED',
        message: error.message || '插件卸载失败'
      }
    }, 500)
  }
})

/**更新插件配置*/
app.put('/:pluginId/config', async (c) => {
  const container = c.get('container') as DIContainer | undefined
  if (!container) {
    return c.json({ success: false, error: { code: 'INTERNAL_ERROR', message: '服务容器未初始化' } }, 500)
  }

  const pluginId = c.req.param('pluginId')

  try {
    const body = await c.req.json()
    const { config } = body

    if (!config || typeof config !== 'object') {
      return c.json({ success: false, error: { code: 'INVALID_INPUT', message: '配置数据无效' } }, 400)
    }

    const pluginService = container.resolve<PluginService>(DEPENDENCY_TOKENS.PLUGIN_SERVICE)
    await pluginService.updatePluginConfig(pluginId, config)

    return c.json({
      success: true,
      message: '插件配置更新成功'
    })
  } catch (error: any) {
    return c.json({
      success: false,
      error: {
        code: 'UPDATE_CONFIG_FAILED',
        message: error.message || '插件配置更新失败'
      }
    }, 500)
  }
})

/**获取插件配置*/
app.get('/:pluginId/config', async (c) => {
  const container = c.get('container') as DIContainer | undefined
  if (!container) {
    return c.json({ success: false, error: { code: 'INTERNAL_ERROR', message: '服务容器未初始化' } }, 500)
  }

  const pluginId = c.req.param('pluginId')

  try {
    const pluginService = container.resolve<PluginService>(DEPENDENCY_TOKENS.PLUGIN_SERVICE)
    const config = await pluginService.getPluginConfig(pluginId)

    return c.json({
      success: true,
      data: config
    })
  } catch (error: any) {
    return c.json({
      success: false,
      error: {
        code: 'GET_CONFIG_FAILED',
        message: error.message || '获取插件配置失败'
      }
    }, 500)
  }
})

export default app