/**
 * 直接执行数据库迁移的脚本
 * 使用 Wrangler D1 执行
 */

import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'

interface Migration {
  id: string
  filename: string
  sql: string
}

async function main() {
  const migrationsDir = join(process.cwd(), 'migrations')
  const files = readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort()

  const migrations: Migration[] = files.map(filename => {
    const id = filename.replace('.sql', '')
    const sql = readFileSync(join(migrationsDir, filename), 'utf-8')
    return { id, filename, sql }
  })

  console.log(`📋 找到 ${migrations.length} 个迁移文件`)
  
  console.log('\n📝 迁移文件列表:')
  migrations.forEach((m, i) => {
    console.log(`  ${i + 1}. ${m.filename}`)
  })

  console.log('\n🔧 使用以下命令执行迁移:')
  console.log('npx wrangler d1 execute cloudlink-db --file=migrations/001_add_soft_delete.sql')
  console.log('npx wrangler d1 execute cloudlink-db --file=migrations/002_add_audit_logs.sql')
  console.log('npx wrangler d1 execute cloudlink-db --file=migrations/003_add_performance_indexes.sql')
  console.log('npx wrangler d1 execute cloudlink-db --file=migrations/004_add_code_attachments.sql')
  console.log('npx wrangler d1 execute cloudlink-db --file=migrations/005_add_plugin_system.sql')
  console.log('npx wrangler d1 execute cloudlink-db --file=migrations/006_add_audit_status.sql')
  console.log('npx wrangler d1 execute cloudlink-db --file=migrations/007_add_appeal_fields.sql')
  console.log('npx wrangler d1 execute cloudlink-db --file=migrations/008_add_verification_codes.sql')
  console.log('npx wrangler d1 execute cloudlink-db --file=migrations/009_add_oauth_fields.sql')
}

main().catch(console.error)
