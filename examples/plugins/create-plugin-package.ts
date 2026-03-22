/**
 * 插件包打包脚本
 * 用于将插件打包成可安装的 JSON 格式
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs'
import { join } from 'path'

interface PluginPackage {
  manifest: any
  files: Map<string, string | Buffer>
}

function createPluginPackage(pluginDir: string, outputFile: string): void {
  console.log(`开始打包插件: ${pluginDir}`)

  // 读取 manifest.json
  const manifestPath = join(pluginDir, 'manifest.json')
  const manifestContent = readFileSync(manifestPath, 'utf-8')
  const manifest = JSON.parse(manifestContent)

  // 收集所有文件
  const files = new Map<string, string | Buffer>()
  
  function collectFiles(dir: string, baseDir: string = dir): void {
    const items = readdirSync(dir)
    
    for (const item of items) {
      const fullPath = join(dir, item)
      const relativePath = join(baseDir, item)
      
      const stat = statSync(fullPath)
      
      if (stat.isDirectory()) {
        collectFiles(fullPath, relativePath)
      } else if (stat.isFile()) {
        const content = readFileSync(fullPath)
        files.set(relativePath, content)
      }
    }
  }

  collectFiles(pluginDir)

  // 创建插件包
  const pluginPackage: PluginPackage = {
    manifest,
    files
  }

  // 转换为可序列化的格式
  const serializablePackage = {
    manifest: pluginPackage.manifest,
    files: Object.fromEntries(
      Array.from(pluginPackage.files.entries()).map(([key, value]) => [
        key,
        Buffer.isBuffer(value) ? value.toString('base64') : value
      ])
    )
  }

  // 写入输出文件
  writeFileSync(outputFile, JSON.stringify(serializablePackage, null, 2))
  
  console.log(`插件包已创建: ${outputFile}`)
  console.log(`包含 ${files.size} 个文件`)
}

// 主函数
function main(): void {
  const pluginDir = process.argv[2] || '.'
  const outputFile = process.argv[3] || 'plugin-package.json'
  
  try {
    createPluginPackage(pluginDir, outputFile)
    console.log('✅ 插件打包成功!')
  } catch (error) {
    console.error('❌ 插件打包失败:', error)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}

export { createPluginPackage }