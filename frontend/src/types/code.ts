/**
 * 代码附件相关类型定义
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
