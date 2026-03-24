-- 添加性能优化索引
-- 执行日期: 2026-03-22

-- 用户表索引优化
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- 评论表索引优化
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id);

-- 帖子表索引优化（置顶功能）
CREATE INDEX IF NOT EXISTS idx_posts_pinned ON posts(pinned) WHERE pinned = 1;
CREATE INDEX IF NOT EXISTS idx_posts_pinned_order ON posts(pinned_order) WHERE pinned = 1;

-- 组合索引优化
CREATE INDEX IF NOT EXISTS idx_posts_author_created ON posts(author_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_post_created ON comments(post_id, created_at DESC);

-- 审计日志索引优化
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_created ON audit_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action_created ON audit_logs(action, created_at DESC);