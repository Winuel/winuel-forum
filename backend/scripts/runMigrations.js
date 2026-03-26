/**
 * 数据库迁移执行脚本
 * 用于在生产环境中执行所有未执行的迁移
 */
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
async function executeMigrations(db) {
    try {
        // 1. 创建迁移跟踪表
        await db.prepare(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id TEXT PRIMARY KEY,
        filename TEXT NOT NULL,
        executed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `).run();
        console.log('✅ 迁移跟踪表已就绪');
        // 2. 读取所有迁移文件
        const migrationsDir = join(process.cwd(), 'migrations');
        const files = readdirSync(migrationsDir)
            .filter(f => f.endsWith('.sql'))
            .sort();
        const migrations = files.map(filename => {
            const id = filename.replace('.sql', '');
            const sql = readFileSync(join(migrationsDir, filename), 'utf-8');
            return { id, filename, sql };
        });
        console.log(`📋 找到 ${migrations.length} 个迁移文件`);
        // 3. 检查已执行的迁移
        const executedMigrations = await db
            .prepare('SELECT id FROM schema_migrations')
            .all();
        const executedIds = new Set(executedMigrations.results.map((m) => m.id));
        // 4. 执行未执行的迁移
        let executedCount = 0;
        for (const migration of migrations) {
            if (executedIds.has(migration.id)) {
                console.log(`⏭️  跳过已执行的迁移: ${migration.filename}`);
                continue;
            }
            console.log(`🔄 执行迁移: ${migration.filename}`);
            try {
                // 分割SQL语句并逐个执行
                const statements = migration.sql
                    .split(';')
                    .map(s => s.trim())
                    .filter(s => s.length > 0);
                for (const statement of statements) {
                    await db.prepare(statement).run();
                }
                // 记录已执行的迁移
                await db.prepare('INSERT INTO schema_migrations (id, filename) VALUES (?, ?)').bind(migration.id, migration.filename).run();
                console.log(`✅ 迁移执行成功: ${migration.filename}`);
                executedCount++;
            }
            catch (error) {
                console.error(`❌ 迁移执行失败: ${migration.filename}`, error.message);
                // 继续执行其他迁移
            }
        }
        console.log(`\n🎉 迁移完成！执行了 ${executedCount} 个新迁移`);
        return {
            success: true,
            executed: executedCount,
            total: migrations.length
        };
    }
    catch (error) {
        console.error('❌ 迁移执行失败:', error);
        throw error;
    }
}
// 如果直接运行此脚本
export default executeMigrations;
//# sourceMappingURL=runMigrations.js.map