-- 添加验证码表
CREATE TABLE IF NOT EXISTS verification_codes (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'register', -- register, reset_password, change_email, verify_email
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  used_at TEXT,
  attempts INTEGER DEFAULT 0
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_verification_codes_email ON verification_codes(email);
CREATE INDEX IF NOT EXISTS idx_verification_codes_expires_at ON verification_codes(expires_at);
CREATE INDEX IF NOT EXISTS idx_verification_codes_type ON verification_codes(type);

-- 添加注释
-- id: 验证码唯一标识
-- email: 用户邮箱地址
-- code: 6位数字验证码
-- type: 验证码类型（register: 注册, reset_password: 重置密码, change_email: 更改邮箱, verify_email: 验证邮箱）
-- expires_at: 验证码过期时间（创建后5分钟）
-- created_at: 验证码创建时间
-- used_at: 验证码使用时间
-- attempts: 验证尝试次数（最多3次）

-- 清理过期验证码的定时任务（需要在应用中实现）
-- DELETE FROM verification_codes WHERE expires_at < datetime('now')