/**
 * 数据库初始化工具
 * 用于在应用启动时自动创建必要的数据库表
 */

export async function initializeDatabase(db: D1Database): Promise<void> {
  try {
    // 检查 verification_codes 表是否存在
    const tableExists = await db
      .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='verification_codes'")
      .first<{ name: string }>()

    if (!tableExists) {
      console.log('📦 正在创建 verification_codes 表...')
      
      // 创建 verification_codes 表
      await db.prepare(`
        CREATE TABLE IF NOT EXISTS verification_codes (
          id TEXT PRIMARY KEY,
          email TEXT NOT NULL,
          code TEXT NOT NULL,
          type TEXT NOT NULL DEFAULT 'register',
          expires_at TEXT NOT NULL,
          created_at TEXT NOT NULL,
          used_at TEXT,
          attempts INTEGER DEFAULT 0
        )
      `).run()

      // 创建索引
      await db.prepare(`CREATE INDEX IF NOT EXISTS idx_verification_codes_email ON verification_codes(email)`).run()
      await db.prepare(`CREATE INDEX IF NOT EXISTS idx_verification_codes_expires_at ON verification_codes(expires_at)`).run()
      await db.prepare(`CREATE INDEX IF NOT EXISTS idx_verification_codes_type ON verification_codes(type)`).run()

      console.log('✅ verification_codes 表创建成功')
    } else {
      console.log('ℹ️  verification_codes 表已存在')
    }
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error)
    throw error
  }
}