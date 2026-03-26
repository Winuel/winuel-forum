# 数据库初始化指南

## 手动创建 verification_codes 表

由于在当前环境中无法通过 wrangler d1 execute 命令运行迁移，请按照以下步骤手动创建表：

### 方法 1: 通过 Cloudflare Dashboard

1. 访问 Cloudflare Dashboard: https://dash.cloudflare.com
2. 进入 Workers & Pages > D1
3. 选择数据库: `winuel-db`
4. 点击 "Console" 或 "Execute SQL"
5. 执行以下 SQL 语句：

```sql
-- 创建 verification_codes 表
CREATE TABLE IF NOT EXISTS verification_codes (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'register',
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  used_at TEXT,
  attempts INTEGER DEFAULT 0
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_verification_codes_email ON verification_codes(email);
CREATE INDEX IF NOT EXISTS idx_verification_codes_expires_at ON verification_codes(expires_at);
CREATE INDEX IF NOT EXISTS idx_verification_codes_type ON verification_codes(type);
```

### 方法 2: 通过 wrangler（如果环境支持）

```bash
cd backend
wrangler d1 execute winuel-db --command "CREATE TABLE IF NOT EXISTS verification_codes (id TEXT PRIMARY KEY, email TEXT NOT NULL, code TEXT NOT NULL, type TEXT NOT NULL DEFAULT 'register', expires_at TEXT NOT NULL, created_at TEXT NOT NULL, used_at TEXT, attempts INTEGER DEFAULT 0)"
  wrangler d1 execute winuel-db --command "CREATE INDEX IF NOT EXISTS idx_verification_codes_email ON verification_codes(email)"
  wrangler d1 execute winuel-db --command "CREATE INDEX IF NOT EXISTS idx_verification_codes_expires_at ON verification_codes(expires_at)"
  wrangler d1 execute winuel-db --command "CREATE INDEX IF NOT EXISTS idx_verification_codes_type ON verification_codes(type)"```

### 验证表是否创建成功

执行以下 SQL 查询：

```sql
SELECT name FROM sqlite_master WHERE type='table' AND name='verification_codes';
```

如果返回结果包含 `verification_codes`，则表示表创建成功。

### 表结构说明

- `id`: 验证码唯一标识（TEXT，主键）
- `email`: 用户邮箱地址（TEXT，非空）
- `code`: 6位数字验证码（TEXT，非空）
- `type`: 验证码类型（TEXT，默认 'register'）
  - `register`: 注册验证
  - `reset_password`: 重置密码
  - `change_email`: 更改邮箱
  - `verify_email`: 验证邮箱
- `expires_at`: 验证码过期时间（TEXT，非空）
- `created_at`: 验证码创建时间（TEXT，非空）
- `used_at`: 验证码使用时间（TEXT，可为空）
- `attempts`: 验证尝试次数（INTEGER，默认 0）

### 注意事项

- 应用会在首次请求时尝试自动创建表，但如果自动创建失败，请手动执行上述 SQL
- 表创建完成后，应用会自动开始使用该表
- 验证码有效期：5分钟
- 冷却期：60秒
- 尝试次数限制：最多3次