import type { PluginMetadata, PluginConfigSchema, PluginManifest } from '../types/index.js'

/**插件验证器*/
export class PluginValidator {
  /**验证插件元数据*/
  static validateMetadata(metadata: PluginMetadata): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!metadata.id || !this.isValidId(metadata.id)) {
      errors.push('Invalid plugin ID: must be alphanumeric with hyphens allowed')
    }

    if (!metadata.name || metadata.name.trim().length === 0) {
      errors.push('Plugin name is required')
    }

    if (!this.isValidVersion(metadata.version)) {
      errors.push('Invalid plugin version: must follow semantic versioning')
    }

    if (!this.isValidVersion(metadata.minCompatibleVersion ?? '0.0.0')) {
      errors.push('Invalid minCompatibleVersion')
    }

    if (metadata.maxCompatibleVersion && !this.isValidVersion(metadata.maxCompatibleVersion)) {
      errors.push('Invalid maxCompatibleVersion')
    }

    if (!metadata.platform || !['both', 'backend', 'frontend'].includes(metadata.platform)) {
      errors.push('Invalid platform: must be "both", "backend", or "frontend"')
    }

    if (!this.isValidEmail(metadata.authorEmail || '')) {
      errors.push('Invalid author email format')
    }

    return { valid: errors.length === 0, errors }
  }

  /**验证插件配置Schema*/
  static validateConfigSchema(schema: PluginConfigSchema): { valid: boolean; errors: string[] } {
    const errors: string[] = []
    const validTypes = ['object', 'string', 'number', 'boolean', 'array', 'null']

    if (!validTypes.includes(schema.type)) {
      errors.push(`Invalid schema type: ${schema.type}`)
    }

    if (schema.type === 'object' && schema.properties) {
      for (const [key, prop] of Object.entries(schema.properties)) {
        const propErrors = this.validateConfigSchema(prop)
        if (!propErrors.valid) {
          errors.push(`Property "${key}": ${propErrors.errors.join(', ')}`)
        }
      }
    }

    return { valid: errors.length === 0, errors }
  }

  /**验证插件配置值*/
  static validateConfigValue(schema: PluginConfigSchema, value: any): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    if (schema.required) {
      for (const key of schema.required) {
        if (!(key in value)) {
          errors.push(`Required field "${key}" is missing`)
        }
      }
    }

    if (schema.type === 'object' && schema.properties) {
      for (const [key, propSchema] of Object.entries(schema.properties)) {
        if (key in value) {
          const validation = this.validateConfigValue(propSchema, value[key])
          if (!validation.valid) {
            errors.push(`Field "${key}": ${validation.errors.join(', ')}`)
          }
        }
      }
    }

    return { valid: errors.length === 0, errors }
  }

  /**验证插件清单*/
  static validateManifest(manifest: PluginManifest): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!manifest.metadata) {
      errors.push('Plugin metadata is required')
    } else {
      const metadataErrors = this.validateMetadata(manifest.metadata)
      errors.push(...metadataErrors.errors)
    }

    if (!manifest.entry) {
      errors.push('Plugin entry point is required')
    }

    if (manifest.metadata.platform === 'both' || manifest.metadata.platform === 'backend') {
      if (!manifest.backendEntry) {
        errors.push('Backend entry is required for platform "both" or "backend"')
      }
    }

    if (manifest.metadata.platform === 'both' || manifest.metadata.platform === 'frontend') {
      if (!manifest.frontendEntry) {
        errors.push('Frontend entry is required for platform "both" or "frontend"')
      }
    }

    return { valid: errors.length === 0, errors }
  }

  /**工具方法*/
  private static isValidId(id: string): boolean {
    return /^[a-z0-9]+(-[a-z0-9]+)*$/i.test(id)
  }

  private static isValidVersion(version: string): boolean {
    return /^\d+\.\d+\.\d+/.test(version)
  }

  private static isValidEmail(email: string): boolean {
    return email === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }
}