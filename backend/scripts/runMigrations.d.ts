/**
 * 数据库迁移执行脚本
 * 用于在生产环境中执行所有未执行的迁移
 */
declare function executeMigrations(db: D1Database): Promise<{
    success: boolean;
    executed: number;
    total: number;
}>;
export default executeMigrations;
//# sourceMappingURL=runMigrations.d.ts.map