import { BasePlugin } from '@winuel/plugin-system'
import type { PluginContext, PluginConfigSchema } from '@winuel/plugin-system'

/**Hello World 示例插件*/
export class HelloWorldPlugin extends BasePlugin {
  metadata = {
    id: 'hello-world-plugin',
    name: 'Hello World Plugin',
    version: '1.0.0',
    description: '一个简单的示例插件，展示插件系统的基本功能',
    author: 'Winuel Team',
    authorEmail: 'team@winuel.example.com',
      homepage: 'https://winuel.example.com/plugins/hello-world',
      repository: 'https://github.com/winuel/hello-world-plugin',    license: 'MIT',
    keywords: ['示例', '插件', 'hello-world'],
    platform: 'both',
    priority: 1,
    dependencies: [],
    peerDependencies: [],
    permissions: [
      {
        name: 'read:config',
        description: '读取配置',
        required: false,
        scope: 'global'
      }
    ],
    configSchema: {
      type: 'object',
      properties: {
        greeting: {
          type: 'string',
          title: '问候语',
          description: '设置默认问候语',
          default: 'Hello, World!'
        },
        showTimestamp: {
          type: 'boolean',
          title: '显示时间戳',
          description: '是否在问候语中显示时间戳',
          default: true
        },
        repeatCount: {
          type: 'number',
          title: '重复次数',
          description: '问候语重复次数',
          default: 1,
          minimum: 1,
          maximum: 5
        }
      },
      required: []
    }
  }

  protected async onActivate(context: PluginContext): Promise<void> {
    this.logInfo('Hello World Plugin 激活成功!')
    
    // 注册API路由
    context.api.registerRoute('/api/plugins/hello-world', async (c: any) => {
      const greeting = this.config.greeting || 'Hello, World!'
      const showTimestamp = this.config.showTimestamp ?? true
      const repeatCount = this.config.repeatCount || 1
      
      let message = ''
      for (let i = 0; i < repeatCount; i++) {
        message += greeting
        if (i < repeatCount - 1) {
          message += ' '
        }
      }
      
      if (showTimestamp) {
        message += ` (at ${new Date().toISOString()})`
      }
      
      return c.json({
        success: true,
        message,
        plugin: this.metadata.name,
        version: this.metadata.version
      })
    })

    // 注册前端组件
    context.api.registerComponent('hello-world-widget', {
      template: `
        <div class="hello-world-widget">
          <div class="widget-header">
            <h3>{{ greeting }}</h3>
            <span v-if="showTimestamp" class="timestamp">{{ formattedTime }}</span>
          </div>
          <div class="widget-content">
            <p>这是一个示例插件组件</p>
            <p>插件版本: {{ version }}</p>
            <p>重复次数: {{ repeatCount }}</p>
          </div>
        </div>
      `,
      data() {
        return {
          greeting: 'Hello, World!',
          showTimestamp: true,
          repeatCount: 1,
          formattedTime: '',
          version: '1.0.0'
        }
      },
      mounted() {
        this.updateTime()
        setInterval(() => this.updateTime(), 1000)
      },
      methods: {
        updateTime() {
          this.formattedTime = new Date().toLocaleTimeString()
        }
      }
    })

    // 监听事件
    this.on('plugin:greeting', async (customGreeting: string) => {
      this.logInfo(`收到自定义问候: ${customGreeting}`)
      return `Hello World Plugin 收到: ${customGreeting}`
    })

    // 发送插件激活事件
    await this.emit('plugin:activated', {
      pluginId: this.metadata.id,
      name: this.metadata.name,
      version: this.metadata.version
    })
  }

  protected async onDeactivate(context: PluginContext): Promise<void> {
    this.logInfo('Hello World Plugin 停用')
    
    // 发送插件停用事件
    await this.emit('plugin:deactivated', {
      pluginId: this.metadata.id,
      name: this.metadata.name
    })
  }

  protected async onInstall(context: PluginContext): Promise<void> {
    this.logInfo('Hello World Plugin 安装中...')
    
    // 初始化配置存储
    await context.storage.set('initialized', true)
    await context.storage.set('installTime', new Date().toISOString())
  }

  protected async onUninstall(context: PluginContext): Promise<void> {
    this.logInfo('Hello World Plugin 卸载中...')
    
    // 清理存储
    await context.storage.clear()
  }

  protected onGetConfigSchema(): PluginConfigSchema {
    return {
      type: 'object',
      properties: {
        greeting: {
          type: 'string',
          title: '问候语',
          description: '设置默认问候语',
          default: 'Hello, World!'
        },
        showTimestamp: {
          type: 'boolean',
          title: '显示时间戳',
          description: '是否在问候语中显示时间戳',
          default: true
        },
        repeatCount: {
          type: 'number',
          title: '重复次数',
          description: '问候语重复次数',
          default: 1,
          minimum: 1,
          maximum: 5
        }
      },
      required: []
    }
  }

  /**插件自定义方法：生成问候语*/
  generateGreeting(): string {
    const greeting = this.config.greeting || 'Hello, World!'
    const showTimestamp = this.config.showTimestamp ?? true
    const repeatCount = this.config.repeatCount || 1
    
    let message = ''
    for (let i = 0; i < repeatCount; i++) {
      message += greeting
      if (i < repeatCount - 1) {
        message += ' '
      }
    }
    
    if (showTimestamp) {
      message += ` (at ${new Date().toISOString()})`
    }
    
    return message
  }

  /**插件自定义方法：获取统计信息*/
  async getStats(): Promise<{ installTime: string | null; greetingCount: number }> {
    const installTime = await this.getStorage<string>('installTime')
    let greetingCount = await this.getStorage<number>('greetingCount') || 0
    await this.setStorage('greetingCount', greetingCount + 1)
    
    return {
      installTime,
      greetingCount
    }
  }
}

// 默认导出插件类
export default HelloWorldPlugin