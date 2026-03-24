-- 添加审核状态字段
ALTER TABLE posts ADD COLUMN audit_status TEXT DEFAULT 'pending';
ALTER TABLE posts ADD COLUMN audit_reason TEXT;

-- 创建审核状态索引
CREATE INDEX IF NOT EXISTS idx_posts_audit_status ON posts(audit_status);

-- 创建审核日志表
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  action TEXT NOT NULL,
  old_status TEXT,
  new_status TEXT,
  reason TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_post_id ON audit_logs(post_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);