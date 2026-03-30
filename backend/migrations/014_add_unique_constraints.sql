-- 迁移文件：添加唯一约束和外键
-- Migration file: Add unique constraints and foreign keys

-- 为 users 表添加唯一索引
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_unique ON users(email) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username_unique ON users(username) WHERE deleted_at IS NULL;

-- 为 posts 表添加唯一索引
CREATE UNIQUE INDEX IF NOT EXISTS idx_posts_id_unique ON posts(id);

-- 为 comments 表添加唯一索引
CREATE UNIQUE INDEX IF NOT EXISTS idx_comments_id_unique ON comments(id);

-- 为 categories 表添加唯一索引
CREATE UNIQUE INDEX IF NOT EXISTS idx_categories_name_unique ON categories(name) WHERE deleted_at IS NULL;

-- 为 tags 表添加唯一索引
CREATE UNIQUE INDEX IF NOT EXISTS idx_tags_name_unique ON tags(name);

-- 为 posts 表添加审核状态索引
CREATE INDEX IF NOT EXISTS idx_posts_audit_status ON posts(audit_status);

-- 为 audit_logs 表添加索引优化
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id_action ON audit_logs(user_id, action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type_id_created ON audit_logs(entity_type, entity_id, created_at DESC);

-- 为 password_resets 表添加索引
CREATE INDEX IF NOT EXISTS idx_password_resets_user_id ON password_resets(user_id);
CREATE INDEX IF NOT EXISTS idx_password_resets_token_hash ON password_resets(token_hash);
CREATE INDEX IF NOT EXISTS idx_password_resets_expires_at ON password_resets(expires_at);

-- 为 verification_codes 表添加索引
CREATE INDEX IF NOT EXISTS idx_verification_codes_email ON verification_codes(email);
CREATE INDEX IF NOT EXISTS idx_verification_codes_code ON verification_codes(code);
CREATE INDEX IF NOT EXISTS idx_verification_codes_expires_at ON verification_codes(expires_at);

-- 为 refresh_tokens 表添加索引
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);

-- 为 oauth_accounts 表添加唯一索引（如果存在）
-- CREATE UNIQUE INDEX IF NOT EXISTS idx_oauth_accounts_provider_id ON oauth_accounts(provider, provider_id);

-- 为 plugin_configs 表添加索引（如果存在）
-- CREATE INDEX IF NOT EXISTS idx_plugin_configs_plugin_id ON plugin_configs(plugin_id);