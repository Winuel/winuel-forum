-- 添加OAuth相关字段到users表
-- 支持第三方登录（GitHub等）

-- 添加OAuth提供者字段
ALTER TABLE users ADD COLUMN provider TEXT;

-- 添加OAuth提供者用户ID字段（用于关联第三方账号）
ALTER TABLE users ADD COLUMN provider_id TEXT;

-- 添加OAuth额外数据字段（JSON格式，存储头像URL等信息）
ALTER TABLE users ADD COLUMN provider_data TEXT;

-- 创建复合索引，用于快速查找OAuth用户
CREATE INDEX IF NOT EXISTS idx_users_oauth ON users(provider, provider_id);

-- 添加唯一约束，确保同一个提供者的同一个ID只能关联一个用户
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_oauth_unique ON users(provider, provider_id) WHERE provider IS NOT NULL;