export interface User {
  id: string
  username: string
  email: string
  password_hash: string
  avatar?: string
  role: 'user' | 'admin' | 'moderator'
  deleted_at?: string | null
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  description?: string
  created_at: string
}

export interface Tag {
  id: string
  name: string
}

export interface Post {
  id: string
  title: string
  content: string
  author_id: string
  category_id: string
  view_count: number
  like_count: number
  comment_count: number
  deleted_at?: string | null
  created_at: string
  updated_at: string
}

export interface Comment {
  id: string
  post_id: string
  author_id: string
  content: string
  parent_id?: string
  like_count: number
  deleted_at?: string | null
  created_at: string
  updated_at: string
}

export interface Like {
  id: string
  user_id: string
  target_id: string
  target_type: 'post' | 'comment'
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  type: string
  title: string
  message: string
  link?: string
  is_read: boolean
  created_at: string
}

export interface AuditLog {
  id: string
  user_id?: string
  action: string
  entity_type: string
  entity_id: string
  old_values?: string
  new_values?: string
  ip_address?: string
  user_agent?: string
  status: 'success' | 'failure'
  error_message?: string
  created_at: string
}

export interface JWTPayload {
  userId: string
  username: string
  role: string
}

/**
 * 带受众的 JWT Payload
 */
export interface TokenPayload extends JWTPayload {
  aud: string
  iat?: number
  exp?: number
}