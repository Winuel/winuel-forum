/**
 * 构建脚本：生成一次性邮箱黑名单 TypeScript 文件
 * 从 .conf 文件读取数据并转换为可导入的模块
 */

import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// 读取黑名单文件
const blocklistPath = join(__dirname, '../src/data/disposable_email_blocklist.conf')
const blocklistContent = readFileSync(blocklistPath, 'utf-8')

// 读取允许名单文件
const allowlistPath = join(__dirname, '../../disposable-email-domains/allowlist.conf')
let allowlistContent = ''
try {
  allowlistContent = readFileSync(allowlistPath, 'utf-8')
} catch (error) {
  console.warn('Allowlist file not found, using empty allowlist')
}

// 解析黑名单（每行一个域名，去除空行和注释）
const blocklistDomains = blocklistContent
  .split('\n')
  .map(line => line.trim())
  .filter(line => line.length > 0 && !line.startsWith('#'))
  .sort()

// 解析允许名单
const allowlistDomains = allowlistContent
  .split('\n')
  .map(line => line.trim())
  .filter(line => line.length > 0 && !line.startsWith('#'))
  .sort()

// 生成 TypeScript 文件内容
const tsContent = `/**
 * 自动生成的一次性邮箱黑名单数据
 * 生成时间: ${new Date().toISOString()}
 * 黑名单域名数: ${blocklistDomains.length}
 * 允许名单域名数: ${allowlistDomains.length}
 *
 * 此文件由 scripts/generateBlocklist.ts 自动生成，请勿手动编辑
 */

export const BLOCKLIST_DOMAINS = ${JSON.stringify(blocklistDomains)} as const

export const ALLOWLIST_DOMAINS = ${JSON.stringify(allowlistDomains)} as const

export type BlocklistDomain = typeof BLOCKLIST_DOMAINS[number]
export type AllowlistDomain = typeof ALLOWLIST_DOMAINS[number]
`

// 写入生成的文件
const outputPath = join(__dirname, '../src/data/blocklist.ts')
writeFileSync(outputPath, tsContent, 'utf-8')

console.log(`✅ Blacklist generated successfully!`)
console.log(`   - Blocklist: ${blocklistDomains.length} domains`)
console.log(`   - Allowlist: ${allowlistDomains.length} domains`)
console.log(`   - Output: ${outputPath}`)