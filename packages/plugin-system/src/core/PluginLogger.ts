import type { PluginLogger } from '../types/index.js'

/**插件日志器实现*/
export class PluginLoggerImpl implements PluginLogger {
  private prefix: string

  constructor(pluginId: string) {
    this.prefix = `[Plugin:${pluginId}]`
  }

  debug(message: string, ...args: any[]): void {
    console.debug(`${this.prefix} ${message}`, ...args)
  }

  info(message: string, ...args: any[]): void {
    console.info(`${this.prefix} ${message}`, ...args)
  }

  warn(message: string, ...args: any[]): void {
    console.warn(`${this.prefix} ${message}`, ...args)
  }

  error(message: string, ...args: any[]): void {
    console.error(`${this.prefix} ${message}`, ...args)
  }
}