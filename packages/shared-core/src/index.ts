/**
 * CloudLink 共享核心类型定义
 * 提供跨平台、跨应用的通用类型定义
 */

// ============================================================================
// 用户相关类型
// ============================================================================

export type UserRole = 'user' | 'moderator' | 'admin'

export interface User {
  id: string
  username: string
  email: string
  avatar?: string
  role: UserRole
  createdAt: string
  updatedAt: string
}

export interface UserPublic {
  id: string
  username: string
  email: string
  avatar?: string
  role: UserRole
  createdAt: string
}

// ============================================================================
// 帖子相关类型
// ============================================================================

export interface Post {
  id: string
  title: string
  content: string
  author: {
    id: string
    username: string
    avatar?: string
  }
  category: {
    id: string
    name: string
  }
  tags: string[]
  viewCount: number
  likeCount: number
  commentCount: number
  isLiked?: boolean
  isPinned?: boolean
  createdAt: string
  updatedAt: string
}

export interface PostInput {
  title: string
  content: string
  categoryId: string
  tags?: string[]
}

export interface PostUpdate {
  title?: string
  content?: string
  categoryId?: string
  tags?: string[]
}

// ============================================================================
// 评论相关类型
// ============================================================================

export interface Comment {
  id: string
  content: string
  author: {
    id: string
    username: string
    avatar?: string
  }
  postId: string
  parentId?: string
  likeCount: number
  isLiked?: boolean
  replies?: Comment[]
  createdAt: string
  updatedAt: string
}

export interface CommentInput {
  postId: string
  content: string
  parentId?: string
}

// ============================================================================
// 分类相关类型
// ============================================================================

export interface Category {
  id: string
  name: string
  description?: string
  postCount?: number
  createdAt: string
}

// ============================================================================
// 通知相关类型
// ============================================================================

export type NotificationType = 'reply' | 'like' | 'system' | 'mention'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  content: string
  isRead: boolean
  createdAt: string
  relatedId?: string
  relatedType?: 'post' | 'comment' | 'user'
}

// ============================================================================
// JWT 相关类型
// ============================================================================

export type Audience = 'user' | 'admin'

export interface JWTPayload {
  userId: string
  username: string
  role: UserRole
  aud: Audience
  iss: string
  iat: number
  exp: number
}

export interface TokenPayload {
  userId: string
  username: string
  role: UserRole
  aud: Audience
}

// ============================================================================
// API 响应类型
// ============================================================================

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: string
  }
  timestamp: string
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// ============================================================================
// 分页类型
// ============================================================================

export interface PaginationParams {
  page?: number
  limit?: number
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

// ============================================================================
// 错误类型
// ============================================================================

export interface ErrorResponse {
  success: false
  error: {
    code: string
    message: string
    details?: string
  }
  timestamp: string
}

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
// ============================================================================

export interface AppConfig {
  apiBaseUrl: string
  environment: 'development' | 'staging' | 'production'
  features: {
    registration: boolean
    emailVerification: boolean
    socialLogin: boolean
    notifications: boolean
  }
  cors: {
    allowedOrigins: string[]
    allowCredentials: boolean
  }
  rateLimit: {
    authEndpoint: number
    normalEndpoint: number
    timeWindow: number
  }
}

export interface Config extends AppConfig {
  environment: 'development' | 'staging' | 'production'
  version: string
  buildTime: string
}

// ============================================================================
// 审计日志类型
// ============================================================================

export interface AuditLog {
  id: string
  userId?: string
  action: string
  entityType: string
  entityId: string
  oldValues?: Record<string, unknown>
  newValues?: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
  status: 'success' | 'failure'
  errorMessage?: string
  createdAt: string
}

// ============================================================================
// 管理员相关类型
// ============================================================================

export interface AdminStats {
  users: {
    total: number
    active: number
    newThisWeek: number
    newThisMonth: number
    deleted: number
  }
  posts: {
    total: number
    published: number
    pending: number
    deleted: number
  }
  comments: {
    total: number
    pending: number
    deleted: number
  }
  activity: {
    daily: Array<{ date: string; count: number }>
  }
}

export interface AdminUser {
  id: string
  username: string
  email: string
  role: UserRole
  avatar?: string
  createdAt: string
  updatedAt: string
  deletedAt?: string
  isBanned?: boolean
  banReason?: string
}

export interface AdminPost {
  id: string
  title: string
  author: {
    id: string
    username: string
  }
  category: {
    id: string
    name: string
  }
  status: 'published' | 'pending' | 'deleted'
  isPinned: boolean
  viewCount: number
  likeCount: number
  commentCount: number
  createdAt: string
  updatedAt: string
  deletedAt?: string
}

export interface AdminComment {
  id: string
  content: string
  author: {
    id: string
    username: string
  }
  post: {
    id: string
    title: string
  }
  status: 'published' | 'deleted'
  createdAt: string
  updatedAt: string
  deletedAt?: string
}

// ============================================================================
// 工具类型
// ============================================================================

export type Optional<T> = T | null | undefined

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export type Nullable<T> = T | null

// ============================================================================
// 代码附件相关类型
// ============================================================================

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

export type ReviewStatus = 'pending' | 'accepted' | 'rejected';

export interface CodeAttachment {
  id: string
  post_id: string
  file_name: string
  language: CodeLanguage
  content: string
  version: string
  created_at: string
  updated_at: string
}

export interface CodeVersion {
  id: string
  attachment_id: string
  version: string
  content: string
  author_id: string
  author?: {
    id: string
    username: string
    avatar?: string
  }
  change_description?: string
  created_at: string
}

export interface CodeReview {
  id: string
  attachment_id: string
  proposer_id: string
  proposer?: {
    id: string
    username: string
    avatar?: string
  }
  proposed_version: string
  proposed_content: string
  diff_content: string
  status: ReviewStatus
  reviewed_by?: string
  reviewer?: {
    id: string
    username: string
    avatar?: string
  }
  reviewed_at?: string
  review_comment?: string
  created_at: string
}

export interface DiffChange {
  type: 'addition' | 'deletion' | 'unchanged'
  old_line?: number
  new_line?: number
  old_content?: string
  new_content?: string
}

export interface DiffResult {
  old_text: string
  new_text: string
  additions: number
  deletions: number
  changes: DiffChange[]
}

export interface UploadFile {
  file: File
  content: string
  language: CodeLanguage
  fileName: string
  fileSize: number
}

export interface UploadOptions {
  postId: string
  onUploadSuccess?: (attachment: CodeAttachment) => void
  onUploadError?: (error: string) => void
  maxFileSize?: number // KB
}

export interface CodeViewerProps {
  attachment: CodeAttachment
  initiallyCollapsed?: boolean
  showLineNumbers?: boolean
  showCopyButton?: boolean
}

export interface DiffViewerProps {
  oldContent: string
  newContent: string
  oldFileName?: string
  newFileName?: string
  inline?: boolean
}

export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] }