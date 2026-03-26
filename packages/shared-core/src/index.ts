/**
 * Winuel 共享核心类型定义
 * Winuel Shared Core Type Definitions
 * 
 * 提供跨平台、跨应用的通用类型定义
 * Provides common type definitions for cross-platform and cross-app usage
 * 
 * @package @winuel/shared-core
 * @version 1.0.0
 */

// ============================================================================
// 用户相关类型
// User Related Types
// ============================================================================

/**
 * 用户角色类型
 * User Role Type
 * 
 * 定义系统中用户的角色权限
 * Defines user role permissions in the system
 */
export type UserRole = 'user' | 'moderator' | 'admin'

/**
 * 用户接口
 * User Interface
 * 
 * 定义用户的基本信息结构
 * Defines the basic information structure of a user
 */
export interface User {
  /** 用户 ID / User ID */
  id: string
  /** 用户名 / Username */
  username: string
  /** 邮箱地址 / Email address */
  email: string
  /** 头像 URL（可选）/ Avatar URL (optional) */
  avatar?: string
  /** 用户角色 / User role */
  role: UserRole
  /** 创建时间 / Creation time */
  createdAt: string
  /** 更新时间 / Update time */
  updatedAt: string
}

/**
 * 公开用户信息接口
 * Public User Information Interface
 * 
 * 定义可以公开访问的用户信息
 * Defines user information that can be publicly accessed
 */
export interface UserPublic {
  /** 用户 ID / User ID */
  id: string
  /** 用户名 / Username */
  username: string
  /** 邮箱地址 / Email address */
  email: string
  /** 头像 URL（可选）/ Avatar URL (optional) */
  avatar?: string
  /** 用户角色 / User role */
  role: UserRole
  /** 创建时间 / Creation time */
  createdAt: string
}

// ============================================================================
// 帖子相关类型
// Post Related Types
// ============================================================================

/**
 * 帖子接口
 * Post Interface
 * 
 * 定义帖子的完整信息结构
 * Defines the complete information structure of a post
 */
export interface Post {
  /** 帖子 ID / Post ID */
  id: string
  /** 帖子标题 / Post title */
  title: string
  /** 帖子内容 / Post content */
  content: string
  /** 作者信息 / Author information */
  author: {
    id: string
    username: string
    avatar?: string
  }
  /** 分类信息 / Category information */
  category: {
    id: string
    name: string
  }
  /** 标签列表 / Tag list */
  tags: string[]
  /** 浏览量 / View count */
  viewCount: number
  /** 点赞数 / Like count */
  likeCount: number
  /** 评论数 / Comment count */
  commentCount: number
  /** 当前用户是否已点赞（可选）/ Whether current user has liked (optional) */
  isLiked?: boolean
  /** 是否置顶（可选）/ Whether pinned (optional) */
  isPinned?: boolean
  /** 审核状态（可选）/ Audit status (optional) */
  auditStatus?: AuditStatus
  /** 审核原因（可选）/ Audit reason (optional) */
  auditReason?: string
  /** 申诉人 ID（可选）/ Appealer ID (optional) */
  appealedBy?: string
  /** 申诉时间（可选）/ Appeal time (optional) */
  appealedAt?: string
  /** 申诉原因（可选）/ Appeal reason (optional) */
  appealReason?: string
  /** 创建时间 / Creation time */
  createdAt: string
  /** 更新时间 / Update time */
  updatedAt: string
}

/**
 * 帖子输入接口
 * Post Input Interface
 * 
 * 定义创建帖子所需的输入数据
 * Defines the input data required for creating a post
 */
export interface PostInput {
  /** 帖子标题 / Post title */
  title: string
  /** 帖子内容 / Post content */
  content: string
  /** 分类 ID / Category ID */
  categoryId: string
  /** 标签列表（可选）/ Tag list (optional) */
  tags?: string[]
}

/**
 * 审核状态类型
 * Audit Status Type
 * 
 * 定义帖子的审核状态
 * Defines the audit status of a post
 */
export type AuditStatus = 'pending' | 'approved' | 'rejected' | 'appealed';

/**
 * 帖子更新接口
 * Post Update Interface
 * 
 * 定义更新帖子所需的输入数据
 * Defines the input data required for updating a post
 */
export interface PostUpdate {
  /** 帖子标题（可选）/ Post title (optional) */
  title?: string
  /** 帖子内容（可选）/ Post content (optional) */
  content?: string
  /** 分类 ID（可选）/ Category ID (optional) */
  categoryId?: string
  /** 标签列表（可选）/ Tag list (optional) */
  tags?: string[]
}

// ============================================================================
// 评论相关类型
// Comment Related Types
// ============================================================================

/**
 * 评论接口
 * Comment Interface
 * 
 * 定义评论的完整信息结构
 * Defines the complete information structure of a comment
 */
export interface Comment {
  /** 评论 ID / Comment ID */
  id: string
  /** 评论内容 / Comment content */
  content: string
  /** 作者信息 / Author information */
  author: {
    id: string
    username: string
    avatar?: string
  }
  /** 帖子 ID / Post ID */
  postId: string
  /** 父评论 ID（可选）/ Parent comment ID (optional) */
  parentId?: string
  /** 点赞数 / Like count */
  likeCount: number
  /** 当前用户是否已点赞（可选）/ Whether current user has liked (optional) */
  isLiked?: boolean
  /** 回复列表（可选）/ Reply list (optional) */
  replies?: Comment[]
  /** 创建时间 / Creation time */
  createdAt: string
  /** 更新时间 / Update time */
  updatedAt: string
}

/**
 * 评论输入接口
 * Comment Input Interface
 * 
 * 定义创建评论所需的输入数据
 * Defines the input data required for creating a comment
 */
export interface CommentInput {
  /** 帖子 ID / Post ID */
  postId: string
  /** 评论内容 / Comment content */
  content: string
  /** 父评论 ID（可选）/ Parent comment ID (optional) */
  parentId?: string
}

// ============================================================================
// 分类相关类型
// Category Related Types
// ============================================================================

/**
 * 分类接口
 * Category Interface
 * 
 * 定义分类的信息结构
 * Defines the information structure of a category
 */
export interface Category {
  /** 分类 ID / Category ID */
  id: string
  /** 分类名称 / Category name */
  name: string
  /** 分类描述（可选）/ Category description (optional) */
  description?: string
  /** 帖子数量（可选）/ Post count (optional) */
  postCount?: number
  /** 创建时间 / Creation time */
  createdAt: string
}

// ============================================================================
// 通知相关类型
// Notification Related Types
// ============================================================================

/**
 * 通知类型
 * Notification Type
 * 
 * 定义通知的类型
 * Defines the type of notification
 */
export type NotificationType = 'reply' | 'like' | 'system' | 'mention'

/**
 * 通知接口
 * Notification Interface
 * 
 * 定义通知的信息结构
 * Defines the information structure of a notification
 */
export interface Notification {
  /** 通知 ID / Notification ID */
  id: string
  /** 通知类型 / Notification type */
  type: NotificationType
  /** 通知标题 / Notification title */
  title: string
  /** 通知内容 / Notification content */
  content: string
  /** 是否已读 / Whether read */
  isRead: boolean
  /** 创建时间 / Creation time */
  createdAt: string
  /** 相关实体 ID（可选）/ Related entity ID (optional) */
  relatedId?: string
  /** 相关实体类型（可选）/ Related entity type (optional) */
  relatedType?: 'post' | 'comment' | 'user'
}

// ============================================================================
// JWT 相关类型
// JWT Related Types
// ============================================================================

/**
 * 受众类型
 * Audience Type
 * 
 * 定义 JWT 令牌的受众
 * Defines the audience of JWT tokens
 */
export type Audience = 'user' | 'admin'

/**
 * JWT 负载接口
 * JWT Payload Interface
 * 
 * 定义 JWT 令牌的负载数据结构
 * Defines the payload data structure of JWT tokens
 */
export interface JWTPayload {
  /** 用户 ID / User ID */
  userId: string
  /** 用户名 / Username */
  username: string
  /** 用户角色 / User role */
  role: UserRole
  /** 受众 / Audience */
  aud: Audience
  /** 签发者 / Issuer */
  iss: string
  /** 签发时间 / Issued at */
  iat: number
  /** 过期时间 / Expiration time */
  exp: number
}

/**
 * 令牌负载接口
 * Token Payload Interface
 * 
 * 定义令牌的简化负载数据结构
 * Defines the simplified payload data structure of tokens
 */
export interface TokenPayload {
  /** 用户 ID / User ID */
  userId: string
  /** 用户名 / Username */
  username: string
  /** 用户角色 / User role */
  role: UserRole
  /** 受众 / Audience */
  aud: Audience
}

// ============================================================================
// API 响应类型
// API Response Types
// ============================================================================

/**
 * API 响应接口
 * API Response Interface
 * 
 * 定义统一的 API 响应格式
 * Defines unified API response format
 */
export interface ApiResponse<T = unknown> {
  /** 是否成功 / Whether successful */
  success: boolean
  /** 响应数据（可选）/ Response data (optional) */
  data?: T
  /** 错误信息（可选）/ Error information (optional) */
  error?: {
    /** 错误代码 / Error code */
    code: string
    /** 错误消息 / Error message */
    message: string
    /** 错误详情（可选）/ Error details (optional) */
    details?: string
  }
  /** 时间戳 / Timestamp */
  timestamp: string
}

/**
 * 分页响应接口
 * Paginated Response Interface
 * 
 * 定义分页数据的响应格式
 * Defines the response format for paginated data
 */
export interface PaginatedResponse<T> {
  /** 是否成功 / Whether successful */
  success: boolean
  /** 数据列表 / Data list */
  data: T[]
  /** 分页信息 / Pagination information */
  pagination: {
    /** 当前页码 / Current page number */
    page: number
    /** 每页数量 / Items per page */
    limit: number
    /** 总数 / Total count */
    total: number
    /** 总页数 / Total pages */
    totalPages: number
  }
}

// ============================================================================
// 分页类型
// Pagination Types
// ============================================================================

/**
 * 分页参数接口
 * Pagination Parameters Interface
 * 
 * 定义分页查询的参数
 * Defines the parameters for pagination queries
 */
export interface PaginationParams {
  /** 页码（可选）/ Page number (optional) */
  page?: number
  /** 每页数量（可选）/ Items per page (optional) */
  limit?: number
}

/**
 * 分页元数据接口
 * Pagination Metadata Interface
 * 
 * 定义分页的元数据
 * Defines the metadata for pagination
 */
export interface PaginationMeta {
  /** 当前页码 / Current page number */
  page: number
  /** 每页数量 / Items per page */
  limit: number
  /** 总数 / Total count */
  total: number
  /** 总页数 / Total pages */
  totalPages: number
}

// ============================================================================
// 错误类型
// Error Types
// ============================================================================

/**
 * 错误响应接口
 * Error Response Interface
 * 
 * 定义错误响应的格式
 * Defines the format of error responses
 */
export interface ErrorResponse {
  /** 是否成功（始终为 false）/ Whether successful (always false) */
  success: false
  /** 错误信息 / Error information */
  error: {
    /** 错误代码 / Error code */
    code: string
    /** 错误消息 / Error message */
    message: string
    /** 错误详情（可选）/ Error details (optional) */
    details?: string
  }
  /** 时间戳 / Timestamp */
  timestamp: string
}

/**
 * 错误代码类型
 * Error Code Type
 * 
 * 定义所有可能的错误代码
 * Defines all possible error codes
 */
export type ErrorCode =
  | 'UNAUTHORIZED'
  | 'INVALID_TOKEN'
  | 'TOKEN_EXPIRED'
  | 'VALIDATION_ERROR'
  | 'INVALID_INPUT'
  | 'MISSING_FIELD'
  | 'NOT_FOUND'
  | 'ALREADY_EXISTS'
  | 'FORBIDDEN'
  | 'RATE_LIMIT_EXCEEDED'
  | 'INTERNAL_ERROR'
  | 'SESSION_ID_MISSING'
  | 'CSRF_TOKEN_MISSING'
  | 'CSRF_SESSION_EXPIRED'
  | 'CSRF_TOKEN_INVALID'
  | 'USER_NOT_FOUND'
  | 'EMAIL_OR_PASSWORD_ERROR'
  | 'WEAK_PASSWORD'

// ============================================================================
// 配置类型
// Configuration Types
// ============================================================================

/**
 * 应用配置接口
 * Application Configuration Interface
 * 
 * 定义应用的配置参数
 * Defines the configuration parameters of the application
 */
export interface AppConfig {
  /** API 基础 URL / API base URL */
  apiBaseUrl: string
  /** 环境类型 / Environment type */
  environment: 'development' | 'staging' | 'production'
  /** 功能配置 / Feature configuration */
  features: {
    /** 是否启用注册 / Whether registration is enabled */
    registration: boolean
    /** 是否启用邮箱验证 / Whether email verification is enabled */
    emailVerification: boolean
    /** 是否启用社交登录 / Whether social login is enabled */
    socialLogin: boolean
    /** 是否启用通知 / Whether notifications are enabled */
    notifications: boolean
  }
  /** CORS 配置 / CORS configuration */
  cors: {
    /** 允许的来源列表 / List of allowed origins */
    allowedOrigins: string[]
    /** 是否允许凭据 / Whether credentials are allowed */
    allowCredentials: boolean
  }
  /** 速率限制配置 / Rate limit configuration */
  rateLimit: {
    /** 认证端点的请求限制 / Request limit for auth endpoints */
    authEndpoint: number
    /** 普通端点的请求限制 / Request limit for normal endpoints */
    normalEndpoint: number
    /** 时间窗口（秒）/ Time window (seconds) */
    timeWindow: number
  }
}

/**
 * 配置接口
 * Configuration Interface
 * 
 * 定义完整的配置参数
 * Defines complete configuration parameters
 */
export interface Config extends AppConfig {
  /** 环境类型 / Environment type */
  environment: 'development' | 'staging' | 'production'
  /** 版本号 / Version number */
  version: string
  /** 构建时间 / Build time */
  buildTime: string
}

// ============================================================================
// 审计日志类型
// Audit Log Types
// ============================================================================

/**
 * 审计日志接口
 * Audit Log Interface
 * 
 * 定义审计日志的信息结构
 * Defines the information structure of audit logs
 */
export interface AuditLog {
  /** 审计日志 ID / Audit log ID */
  id: string
  /** 用户 ID（可选）/ User ID (optional) */
  userId?: string
  /** 操作类型 / Action type */
  action: string
  /** 实体类型 / Entity type */
  entityType: string
  /** 实体 ID / Entity ID */
  entityId: string
  /** 旧值（可选）/ Old values (optional) */
  oldValues?: Record<string, unknown>
  /** 新值（可选）/ New values (optional) */
  newValues?: Record<string, unknown>
  /** IP 地址（可选）/ IP address (optional) */
  ipAddress?: string
  /** 用户代理（可选）/ User agent (optional) */
  userAgent?: string
  /** 状态 / Status */
  status: 'success' | 'failure'
  /** 错误消息（可选）/ Error message (optional) */
  errorMessage?: string
  /** 创建时间 / Creation time */
  createdAt: string
}

// ============================================================================
// 管理员相关类型
// Admin Related Types
// ============================================================================

/**
 * 管理员统计接口
 * Admin Statistics Interface
 * 
 * 定义管理后台的统计数据
 * Defines statistics for admin dashboard
 */
export interface AdminStats {
  /** 用户统计 / User statistics */
  users: {
    /** 总数 / Total */
    total: number
    /** 活跃数 / Active count */
    active: number
    /** 本周新增 / New this week */
    newThisWeek: number
    /** 本月新增 / New this month */
    newThisMonth: number
    /** 已删除数 / Deleted count */
    deleted: number
  }
  /** 帖子统计 / Post statistics */
  posts: {
    /** 总数 / Total */
    total: number
    /** 已发布数 / Published count */
    published: number
    /** 待审核数 / Pending count */
    pending: number
    /** 已删除数 / Deleted count */
    deleted: number
  }
  /** 评论统计 / Comment statistics */
  comments: {
    /** 总数 / Total */
    total: number
    /** 待审核数 / Pending count */
    pending: number
    /** 已删除数 / Deleted count */
    deleted: number
  }
  /** 活动统计 / Activity statistics */
  activity: {
    /** 每日活动数据 / Daily activity data */
    daily: Array<{ date: string; count: number }>
  }
}

/**
 * 管理员用户接口
 * Admin User Interface
 * 
 * 定义管理后台显示的用户信息
 * Defines user information displayed in admin dashboard
 */
export interface AdminUser {
  /** 用户 ID / User ID */
  id: string
  /** 用户名 / Username */
  username: string
  /** 邮箱 / Email */
  email: string
  /** 用户角色 / User role */
  role: UserRole
  /** 头像（可选）/ Avatar (optional) */
  avatar?: string
  /** 创建时间 / Creation time */
  createdAt: string
  /** 更新时间 / Update time */
  updatedAt: string
  /** 删除时间（可选）/ Deletion time (optional) */
  deletedAt?: string
  /** 是否被封禁（可选）/ Whether banned (optional) */
  isBanned?: boolean
  /** 封禁原因（可选）/ Ban reason (optional) */
  banReason?: string
}

/**
 * 管理员帖子接口
 * Admin Post Interface
 * 
 * 定义管理后台显示的帖子信息
 * Defines post information displayed in admin dashboard
 */
export interface AdminPost {
  /** 帖子 ID / Post ID */
  id: string
  /** 帖子标题 / Post title */
  title: string
  /** 作者信息 / Author information */
  author: {
    id: string
    username: string
  }
  /** 分类信息 / Category information */
  category: {
    id: string
    name: string
  }
  /** 状态 / Status */
  status: 'published' | 'pending' | 'deleted'
  /** 是否置顶 / Whether pinned */
  isPinned: boolean
  /** 浏览量 / View count */
  viewCount: number
  /** 点赞数 / Like count */
  likeCount: number
  /** 评论数 / Comment count */
  commentCount: number
  /** 创建时间 / Creation time */
  createdAt: string
  /** 更新时间 / Update time */
  updatedAt: string
  /** 删除时间（可选）/ Deletion time (optional) */
  deletedAt?: string
}

/**
 * 管理员评论接口
 * Admin Comment Interface
 * 
 * 定义管理后台显示的评论信息
 * Defines comment information displayed in admin dashboard
 */
export interface AdminComment {
  /** 评论 ID / Comment ID */
  id: string
  /** 评论内容 / Comment content */
  content: string
  /** 作者信息 / Author information */
  author: {
    id: string
    username: string
  }
  /** 帖子信息 / Post information */
  post: {
    id: string
    title: string
  }
  /** 状态 / Status */
  status: 'published' | 'deleted'
  /** 创建时间 / Creation time */
  createdAt: string
  /** 更新时间 / Update time */
  updatedAt: string
  /** 删除时间（可选）/ Deletion time (optional) */
  deletedAt?: string
}

// ============================================================================
// 工具类型
// Utility Types
// ============================================================================

/**
 * 可选类型
 * Optional Type
 * 
 * 定义一个可以是原始类型、null 或 undefined 的类型
 * Defines a type that can be the original type, null, or undefined
 */
export type Optional<T> = T | null | undefined

/**
 * 深度部分类型
 * Deep Partial Type
 * 
 * 定义一个所有属性都递归变为可选的类型
 * Defines a type where all properties are recursively optional
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

/**
 * 可空类型
 * Nullable Type
 * 
 * 定义一个可以是原始类型或 null 的类型
 * Defines a type that can be the original type or null
 */
export type Nullable<T> = T | null

// ============================================================================
// 代码附件相关类型
// Code Attachment Related Types
// ============================================================================

/**
 * 代码语言类型
 * Code Language Type
 * 
 * 定义支持的编程语言
 * Defines supported programming languages
 */
export type CodeLanguage = 
  | 'javascript'
  | 'typescript'
  | 'python'
  | 'java'
  | 'c'
  | 'cpp'
  | 'csharp'
  | 'go'
  | 'rust'
  | 'php'
  | 'ruby'
  | 'swift'
  | 'kotlin'
  | 'html'
  | 'css'
  | 'json'
  | 'yaml'
  | 'sql'
  | 'markdown'
  | 'bash'
  | 'shell'
  | 'other';

/**
 * 审查状态类型
 * Review Status Type
 * 
 * 定义代码审查的状态
 * Defines the status of code reviews
 */
export type ReviewStatus = 'pending' | 'accepted' | 'rejected';

/**
 * 代码附件接口
 * Code Attachment Interface
 * 
 * 定义代码附件的信息结构
 * Defines the information structure of code attachments
 */
export interface CodeAttachment {
  /** 附件 ID / Attachment ID */
  id: string
  /** 帖子 ID / Post ID */
  post_id: string
  /** 文件名 / File name */
  file_name: string
  /** 编程语言 / Programming language */
  language: CodeLanguage
  /** 代码内容 / Code content */
  content: string
  /** 版本号 / Version number */
  version: string
  /** 创建时间 / Creation time */
  created_at: string
  /** 更新时间 / Update time */
  updated_at: string
}

/**
 * 代码版本接口
 * Code Version Interface
 * 
 * 定义代码版本的信息结构
 * Defines the information structure of code versions
 */
export interface CodeVersion {
  /** 版本 ID / Version ID */
  id: string
  /** 附件 ID / Attachment ID */
  attachment_id: string
  /** 版本号 / Version number */
  version: string
  /** 代码内容 / Code content */
  content: string
  /** 作者 ID / Author ID */
  author_id: string
  /** 作者信息（可选）/ Author information (optional) */
  author?: {
    id: string
    username: string
    avatar?: string
  }
  /** 变更描述（可选）/ Change description (optional) */
  change_description?: string
  /** 创建时间 / Creation time */
  created_at: string
}

/**
 * 代码审查接口
 * Code Review Interface
 * 
 * 定义代码审查的信息结构
 * Defines the information structure of code reviews
 */
export interface CodeReview {
  /** 审查 ID / Review ID */
  id: string
  /** 附件 ID / Attachment ID */
  attachment_id: string
  /** 提议者 ID / Proposer ID */
  proposer_id: string
  /** 提议者信息（可选）/ Proposer information (optional) */
  proposer?: {
    id: string
    username: string
    avatar?: string
  }
  /** 提议的版本号 / Proposed version number */
  proposed_version: string
  /** 提议的代码内容 / Proposed code content */
  proposed_content: string
  /** 差异内容 / Diff content */
  diff_content: string
  /** 审查状态 / Review status */
  status: ReviewStatus
  /** 审查人 ID（可选）/ Reviewer ID (optional) */
  reviewed_by?: string
  /** 审查人信息（可选）/ Reviewer information (optional) */
  reviewer?: {
    id: string
    username: string
    avatar?: string
  }
  /** 审查时间（可选）/ Review time (optional) */
  reviewed_at?: string
  /** 审查评论（可选）/ Review comment (optional) */
  review_comment?: string
  /** 创建时间 / Creation time */
  created_at: string
}

/**
 * 差异变更接口
 * Diff Change Interface
 * 
 * 定义单个差异变更的信息
 * Defines the information of a single diff change
 */
export interface DiffChange {
  /** 变更类型 / Change type */
  type: 'addition' | 'deletion' | 'unchanged'
  /** 旧行号（可选）/ Old line number (optional) */
  old_line?: number
  /** 新行号（可选）/ New line number (optional) */
  new_line?: number
  /** 旧内容（可选）/ Old content (optional) */
  old_content?: string
  /** 新内容（可选）/ New content (optional) */
  new_content?: string
}

/**
 * 差异结果接口
 * Diff Result Interface
 * 
 * 定义差异比较的结果
 * Defines the result of diff comparison
 */
export interface DiffResult {
  /** 旧文本 / Old text */
  old_text: string
  /** 新文本 / New text */
  new_text: string
  /** 新增行数 / Number of additions */
  additions: number
  /** 删除行数 / Number of deletions */
  deletions: number
  /** 变更列表 / List of changes */
  changes: DiffChange[]
}

/**
 * 上传文件接口
 * Upload File Interface
 * 
 * 定义上传文件的信息
 * Defines the information of uploaded files
 */
export interface UploadFile {
  /** 文件对象 / File object */
  file: File
  /** 文件内容 / File content */
  content: string
  /** 编程语言 / Programming language */
  language: CodeLanguage
  /** 文件名 / File name */
  fileName: string
  /** 文件大小 / File size */
  fileSize: number
}

/**
 * 上传选项接口
 * Upload Options Interface
 * 
 * 定义上传文件的选项
 * Defines the options for uploading files
 */
export interface UploadOptions {
  /** 帖子 ID / Post ID */
  postId: string
  /** 上传成功回调（可选）/ Upload success callback (optional) */
  onUploadSuccess?: (attachment: CodeAttachment) => void
  /** 上传错误回调（可选）/ Upload error callback (optional) */
  onUploadError?: (error: string) => void
  /** 最大文件大小（KB，可选）/ Maximum file size in KB (optional) */
  maxFileSize?: number
}

/**
 * 代码查看器属性接口
 * Code Viewer Props Interface
 * 
 * 定义代码查看器的属性
 * Defines the props of the code viewer
 */
export interface CodeViewerProps {
  /** 代码附件 / Code attachment */
  attachment: CodeAttachment
  /** 初始折叠状态（可选）/ Initial collapsed state (optional) */
  initiallyCollapsed?: boolean
  /** 是否显示行号（可选）/ Whether to show line numbers (optional) */
  showLineNumbers?: boolean
  /** 是否显示复制按钮（可选）/ Whether to show copy button (optional) */
  showCopyButton?: boolean
}

/**
 * 差异查看器属性接口
 * Diff Viewer Props Interface
 * 
 * 定义差异查看器的属性
 * Defines the props of the diff viewer
 */
export interface DiffViewerProps {
  /** 旧内容 / Old content */
  oldContent: string
  /** 新内容 / New content */
  newContent: string
  /** 旧文件名（可选）/ Old file name (optional) */
  oldFileName?: string
  /** 新文件名（可选）/ New file name (optional) */
  newFileName?: string
  /** 是否内联显示（可选）/ Whether to display inline (optional) */
  inline?: boolean
}

/**
 * 必需属性类型
 * With Required Type
 * 
 * 将类型 T 的某些属性 K 变为必需
 * Makes certain properties K of type T required
 */
export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] }