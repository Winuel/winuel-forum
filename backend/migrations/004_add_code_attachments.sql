-- 代码附件功能迁移
-- 执行日期: 2026-03-22

-- 代码附件表
CREATE TABLE IF NOT EXISTS code_attachments (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL,
  file_name TEXT NOT NULL,
  language TEXT NOT NULL,
  content TEXT NOT NULL,
  version TEXT DEFAULT 'v1.0',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

-- 代码版本历史表
CREATE TABLE IF NOT EXISTS code_versions (
  id TEXT PRIMARY KEY,
  attachment_id TEXT NOT NULL,
  version TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id TEXT NOT NULL,
  change_description TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (attachment_id) REFERENCES code_attachments(id) ON DELETE CASCADE,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 代码审查提议表
CREATE TABLE IF NOT EXISTS code_reviews (
  id TEXT PRIMARY KEY,
  attachment_id TEXT NOT NULL,
  proposer_id TEXT NOT NULL,
  proposed_version TEXT NOT NULL,
  proposed_content TEXT NOT NULL,
  diff_content TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, accepted, rejected
  reviewed_by TEXT,
  reviewed_at DATETIME,
  review_comment TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (attachment_id) REFERENCES code_attachments(id) ON DELETE CASCADE,
  FOREIGN KEY (proposer_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_code_attachments_post ON code_attachments(post_id);
CREATE INDEX IF NOT EXISTS idx_code_attachments_post_created ON code_attachments(post_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_code_versions_attachment ON code_versions(attachment_id);
CREATE INDEX IF NOT EXISTS idx_code_versions_attachment_version ON code_versions(attachment_id, version);
CREATE INDEX IF NOT EXISTS idx_code_reviews_attachment ON code_reviews(attachment_id);
CREATE INDEX IF NOT EXISTS idx_code_reviews_status ON code_reviews(status);
CREATE INDEX IF NOT EXISTS idx_code_reviews_proposer ON code_reviews(proposer_id);

-- 插入测试数据（可选）
-- INSERT INTO code_attachments (id, post_id, file_name, language, content, version) VALUES
--   ('test-attachment-1', 'test-post-1', 'example.js', 'javascript', 'console.log("Hello, World!");', 'v1.0');
