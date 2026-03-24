-- 插件系统表
CREATE TABLE IF NOT EXISTS plugins (
  id TEXT PRIMARY KEY,
  manifest TEXT NOT NULL, -- JSON string of PluginManifest
  status TEXT NOT NULL, -- PluginStatus enum
  enabled BOOLEAN NOT NULL DEFAULT false,
  version TEXT NOT NULL,
  config TEXT NOT NULL DEFAULT '{}', -- JSON string of plugin config
  installed_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  error TEXT
);

CREATE INDEX IF NOT EXISTS idx_plugins_status ON plugins(status);
CREATE INDEX IF NOT EXISTS idx_plugins_enabled ON plugins(enabled);

-- 插件市场缓存表
CREATE TABLE IF NOT EXISTS marketplace_plugins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  marketplace_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  version TEXT NOT NULL,
  description TEXT,
  author TEXT NOT NULL,
  author_email TEXT,
  homepage TEXT,
  repository TEXT,
  license TEXT NOT NULL,
  keywords TEXT, -- JSON array
  platform TEXT NOT NULL, -- PluginPlatform enum
  download_url TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  checksum TEXT NOT NULL,
  signature TEXT,
  verified BOOLEAN NOT NULL DEFAULT false,
  downloads INTEGER NOT NULL DEFAULT 0,
  rating REAL NOT NULL DEFAULT 0,
  rating_count INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_marketplace_plugins_marketplace_id ON marketplace_plugins(marketplace_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_plugins_verified ON marketplace_plugins(verified);

-- 插件安装日志
CREATE TABLE IF NOT EXISTS plugin_installation_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  plugin_id TEXT NOT NULL,
  action TEXT NOT NULL, -- install, activate, deactivate, uninstall, update
  status TEXT NOT NULL, -- success, error
  error_message TEXT,
  user_id TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (plugin_id) REFERENCES plugins(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_plugin_installation_logs_plugin_id ON plugin_installation_logs(plugin_id);
CREATE INDEX IF NOT EXISTS idx_plugin_installation_logs_created_at ON plugin_installation_logs(created_at);