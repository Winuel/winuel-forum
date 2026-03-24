-- 添加申诉相关字段
ALTER TABLE posts ADD COLUMN appealed_by TEXT;
ALTER TABLE posts ADD COLUMN appealed_at TEXT;
ALTER TABLE posts ADD COLUMN appeal_reason TEXT;

-- 更新审核状态枚举说明
-- pending: 待审核
-- approved: 已通过
-- rejected: 已拒绝
-- appealed: 已申诉

-- 创建申诉相关索引
CREATE INDEX IF NOT EXISTS idx_posts_appealed_by ON posts(appealed_by);
CREATE INDEX IF NOT EXISTS idx_posts_appealed_at ON posts(appealed_at);

-- 更新审核日志表，支持申诉操作
-- action 可以是：approve, reject, appeal, appeal_approve, appeal_reject
-- reason 字段记录申诉理由或审核理由