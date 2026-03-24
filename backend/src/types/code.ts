/**
 * 代码附件相关类型定义
 */

// 支持的编程语言
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

// 代码审查状态
export type ReviewStatus = 'pending' | 'accepted' | 'rejected';

// 代码附件
export interface CodeAttachment {
  id: string;
  post_id: string;
  file_name: string;
  language: CodeLanguage;
  content: string;
  version: string;
  created_at: string;
  updated_at: string;
}

// 代码版本历史
export interface CodeVersion {
  id: string;
  attachment_id: string;
  version: string;
  content: string;
  author_id: string;
  author?: {
    id: string;
    username: string;
    avatar?: string;
  };
  change_description?: string;
  created_at: string;
}

// 代码审查提议
export interface CodeReview {
  id: string;
  attachment_id: string;
  proposer_id: string;
  proposer?: {
    id: string;
    username: string;
    avatar?: string;
  };
  proposed_version: string;
  proposed_content: string;
  diff_content: string;
  status: ReviewStatus;
  reviewed_by?: string;
  reviewer?: {
    id: string;
    username: string;
    avatar?: string;
  };
  reviewed_at?: string;
  review_comment?: string;
  created_at: string;
}

// 创建代码附件
export interface CreateCodeAttachmentInput {
  post_id: string;
  file_name: string;
  language: CodeLanguage;
  content: string;
}

// 更新代码附件
export interface UpdateCodeAttachmentInput {
  id: string;
  content: string;
  change_description?: string;
}

// 创建审查提议
export interface CreateCodeReviewInput {
  attachment_id: string;
  proposed_content: string;
  review_comment?: string;
}

// 审查决定
export interface ReviewDecisionInput {
  review_id: string;
  accepted: boolean;
  comment?: string;
}

// Diff结果
export interface DiffResult {
  old_text: string;
  new_text: string;
  additions: number;
  deletions: number;
  changes: DiffChange[];
}

export interface DiffChange {
  type: 'addition' | 'deletion' | 'unchanged';
  old_line?: number;
  new_line?: number;
  old_content?: string;
  new_content?: string;
}

// 上传验证结果
export interface UploadValidationResult {
  valid: boolean;
  errors: string[];
  warnings?: string[];
}
