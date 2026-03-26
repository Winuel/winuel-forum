/**
 * 数据库初始化工具
 * 用于在应用启动时自动创建必要的数据库表
 */

export async function initializeDatabase(db: D1Database): Promise<void> {
  try {
    // 1. 检查 verification_codes 表是否存在
    const verificationCodesTableExists = await db
      .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='verification_codes'")
      .first<{ name: string }>()

    if (!verificationCodesTableExists) {
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

    // 2. 验证核心表结构
    const requiredTables = ['users', 'posts', 'comments', 'categories', 'likes', 'notifications', 'audit_logs']
    for (const tableName of requiredTables) {
      const tableExists = await db
        .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=?")
        .bind(tableName)
        .first<{ name: string }>()

      if (!tableExists) {
        console.warn(`⚠️  警告: ${tableName} 表不存在，数据库结构可能不完整`)
      }
    }

    // 3. 验证posts表的必要字段
    const postsColumns = await db
      .prepare("PRAGMA table_info(posts)")
      .all<{ name: string }>()
    const postsColumnNames = postsColumns.results.map((col: { name: string }) => col.name)
    const requiredPostsColumns = ['id', 'title', 'content', 'author_id', 'category_id', 'view_count', 'like_count', 'comment_count', 'deleted_at']
    
    for (const requiredCol of requiredPostsColumns) {
      if (!postsColumnNames.includes(requiredCol)) {
        console.warn(`⚠️  警告: posts表缺少字段 ${requiredCol}`)
      }
    }

    // 4. 验证comments表的必要字段
    const commentsColumns = await db
      .prepare("PRAGMA table_info(comments)")
      .all<{ name: string }>()
    const commentsColumnNames = commentsColumns.results.map((col: { name: string }) => col.name)
    const requiredCommentsColumns = ['id', 'post_id', 'author_id', 'content', 'parent_id', 'like_count', 'deleted_at']
    
    for (const requiredCol of requiredCommentsColumns) {
      if (!commentsColumnNames.includes(requiredCol)) {
        console.warn(`⚠️  警告: comments表缺少字段 ${requiredCol}`)
      }
    }

    console.log('✅ 数据库结构验证完成')
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error)
    throw error
  }
}