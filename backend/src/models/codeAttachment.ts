/**
 * 代码附件数据库模型
 */

import type { CodeAttachment, CodeVersion, CodeReview, CreateCodeAttachmentInput, UpdateCodeAttachmentInput } from '../types/code'

export class CodeAttachmentModel {
  constructor(private db: D1Database) {}

  /**
   * 创建代码附件
   */
  async create(input: CreateCodeAttachmentInput): Promise<CodeAttachment> {
    const id = crypto.randomUUID()
    const version = 'v1.0'

    await this.db.prepare(`
      INSERT INTO code_attachments (id, post_id, file_name, language, content, version)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(id, input.post_id, input.file_name, input.language, input.content, version).run()

    // 创建初始版本记录
    await this.createVersion(id, version, input.content, null, 'Initial version')

    return this.findById(id) as Promise<CodeAttachment>
  }

  /**
   * 根据ID查找代码附件
   */
  async findById(id: string): Promise<CodeAttachment | null> {
    const result = await this.db.prepare(`
      SELECT id, post_id, file_name, language, content, version, created_at, updated_at
      FROM code_attachments
      WHERE id = ?
    `).bind(id).first<CodeAttachment>()

    return result || null
  }

  /**
   * 根据帖子ID查找所有代码附件
   */
  async findByPostId(postId: string): Promise<CodeAttachment[]> {
    const results = await this.db.prepare(`
      SELECT id, post_id, file_name, language, content, version, created_at, updated_at
      FROM code_attachments
      WHERE post_id = ?
      ORDER BY created_at ASC
    `).bind(postId).all<CodeAttachment>()

    return results.results || []
  }

  /**
   * 更新代码附件
   */
  async update(input: UpdateCodeAttachmentInput): Promise<CodeAttachment | null> {
    const attachment = await this.findById(input.id)
    if (!attachment) return null

    // 计算新版本号
    const currentVersion = parseInt(attachment.version.replace('v', ''))
    const newVersion = `v${currentVersion + 1}.0`

    // 更新附件
    await this.db.prepare(`
      UPDATE code_attachments
      SET content = ?, version = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(input.content, newVersion, input.id).run()

    // 创建版本记录
    await this.createVersion(input.id, newVersion, input.content, null, input.change_description || null)

    return this.findById(input.id)
  }

  /**
   * 删除代码附件
   */
  async delete(id: string): Promise<boolean> {
    const result = await this.db.prepare(`
      DELETE FROM code_attachments WHERE id = ?
    `).bind(id).run()

    return (result.meta.changes || 0) > 0
  }

  /**
   * 创建版本记录
   */
  async createVersion(
    attachmentId: string,
    version: string,
    content: string,
    authorId: string | null,
    description: string | null
  ): Promise<CodeVersion> {
    const id = crypto.randomUUID()

    await this.db.prepare(`
      INSERT INTO code_versions (id, attachment_id, version, content, author_id, change_description)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(id, attachmentId, version, content, authorId, description).run()

    return {
      id,
      attachment_id: attachmentId,
      version,
      content,
      author_id: authorId || '',
      created_at: new Date().toISOString()
    }
  }

  /**
   * 获取版本历史
   */
  async getVersions(attachmentId: string): Promise<CodeVersion[]> {
    const results = await this.db.prepare(`
      SELECT 
        cv.id, cv.attachment_id, cv.version, cv.content, cv.author_id, cv.change_description, cv.created_at,
        u.username, u.avatar
      FROM code_versions cv
      LEFT JOIN users u ON cv.author_id = u.id
      WHERE cv.attachment_id = ?
      ORDER BY cv.created_at DESC
    `).bind(attachmentId).all<any>()

    return results.results.map(row => ({
      id: row.id,
      attachment_id: row.attachment_id,
      version: row.version,
      content: row.content,
      author_id: row.author_id,
      author: row.username ? {
        id: row.author_id,
        username: row.username,
        avatar: row.avatar
      } : undefined,
      change_description: row.change_description,
      created_at: row.created_at
    })) || []
  }

  /**
   * 验证文件大小
   */
  validateFileSize(content: string): boolean {
    const sizeInBytes = new Blob([content]).size
    const sizeInKB = sizeInBytes / 1024
    return sizeInKB <= 512
  }

  /**
   * 获取文件大小
   */
  getFileSize(content: string): number {
    const sizeInBytes = new Blob([content]).size
    return Math.round(sizeInBytes / 1024) // KB
  }
}

export class CodeReviewModel {
  constructor(private db: D1Database) {}

  /**
   * 创建代码审查提议
   */
  async create(proposal: {
    attachment_id: string
    proposer_id: string
    proposed_version: string
    proposed_content: string
    diff_content: string
  }): Promise<CodeReview> {
    const id = crypto.randomUUID()

    await this.db.prepare(`
      INSERT INTO code_reviews (id, attachment_id, proposer_id, proposed_version, proposed_content, diff_content, status)
      VALUES (?, ?, ?, ?, ?, ?, 'pending')
    `).bind(
      id,
      proposal.attachment_id,
      proposal.proposer_id,
      proposal.proposed_version,
      proposal.proposed_content,
      proposal.diff_content
    ).run()

    return this.findById(id) as Promise<CodeReview>
  }

  /**
   * 根据ID查找审查提议
   */
  async findById(id: string): Promise<CodeReview | null> {
    const result = await this.db.prepare(`
      SELECT 
        cr.id, cr.attachment_id, cr.proposer_id, cr.proposed_version, cr.proposed_content, cr.diff_content,
        cr.status, cr.reviewed_by, cr.reviewed_at, cr.review_comment, cr.created_at,
        p.username as proposer_name, p.avatar as proposer_avatar,
        r.username as reviewer_name, r.avatar as reviewer_avatar
      FROM code_reviews cr
      LEFT JOIN users p ON cr.proposer_id = p.id
      LEFT JOIN users r ON cr.reviewed_by = r.id
      WHERE cr.id = ?
    `).bind(id).first<any>()

    if (!result) return null

    return {
      id: result.id,
      attachment_id: result.attachment_id,
      proposer_id: result.proposer_id,
      proposer: result.proposer_name ? {
        id: result.proposer_id,
        username: result.proposer_name,
        avatar: result.proposer_avatar
      } : undefined,
      proposed_version: result.proposed_version,
      proposed_content: result.proposed_content,
      diff_content: result.diff_content,
      status: result.status,
      reviewed_by: result.reviewed_by || undefined,
      reviewer: result.reviewer_name ? {
        id: result.reviewed_by,
        username: result.reviewer_name,
        avatar: result.reviewer_avatar
      } : undefined,
      reviewed_at: result.reviewed_at || undefined,
      review_comment: result.review_comment || undefined,
      created_at: result.created_at
    }
  }

  /**
   * 根据附件ID查找所有审查提议
   */
  async findByAttachmentId(attachmentId: string): Promise<CodeReview[]> {
    const results = await this.db.prepare(`
      SELECT 
        cr.id, cr.attachment_id, cr.proposer_id, cr.proposed_version, cr.proposed_content, cr.diff_content,
        cr.status, cr.reviewed_by, cr.reviewed_at, cr.review_comment, cr.created_at,
        p.username as proposer_name, p.avatar as proposer_avatar,
        r.username as reviewer_name, r.avatar as reviewer_avatar
      FROM code_reviews cr
      LEFT JOIN users p ON cr.proposer_id = p.id
      LEFT JOIN users r ON cr.reviewed_by = r.id
      WHERE cr.attachment_id = ?
      ORDER BY cr.created_at DESC
    `).bind(attachmentId).all<any>()

    return results.results.map(row => ({
      id: row.id,
      attachment_id: row.attachment_id,
      proposer_id: row.proposer_id,
      proposer: row.proposer_name ? {
        id: row.proposer_id,
        username: row.proposer_name,
        avatar: row.proposer_avatar
      } : undefined,
      proposed_version: row.proposed_version,
      proposed_content: row.proposed_content,
      diff_content: row.diff_content,
      status: row.status,
      reviewed_by: row.reviewed_by || undefined,
      reviewer: row.reviewer_name ? {
        id: row.reviewed_by,
        username: row.reviewer_name,
        avatar: row.reviewer_avatar
      } : undefined,
      reviewed_at: row.reviewed_at || undefined,
      review_comment: row.review_comment || undefined,
      created_at: row.created_at
    })) || []
  }

  /**
   * 根据提议者ID查找审查提议
   */
  async findByProposerId(proposerId: string): Promise<CodeReview[]> {
    const results = await this.db.prepare(`
      SELECT 
        cr.id, cr.attachment_id, cr.proposer_id, cr.proposed_version, cr.proposed_content, cr.diff_content,
        cr.status, cr.reviewed_by, cr.reviewed_at, cr.review_comment, cr.created_at,
        p.username as proposer_name, p.avatar as proposer_avatar,
        r.username as reviewer_name, r.avatar as reviewer_avatar
      FROM code_reviews cr
      LEFT JOIN users p ON cr.proposer_id = p.id
      LEFT JOIN users r ON cr.reviewed_by = r.id
      WHERE cr.proposer_id = ?
      ORDER BY cr.created_at DESC
    `).bind(proposerId).all<any>()

    return results.results.map(row => ({
      id: row.id,
      attachment_id: row.attachment_id,
      proposer_id: row.proposer_id,
      proposer: row.proposer_name ? {
        id: row.proposer_id,
        username: row.proposer_name,
        avatar: row.proposer_avatar
      } : undefined,
      proposed_version: row.proposed_version,
      proposed_content: row.proposed_content,
      diff_content: row.diff_content,
      status: row.status,
      reviewed_by: row.reviewed_by || undefined,
      reviewer: row.reviewer_name ? {
        id: row.reviewed_by,
        username: row.reviewer_name,
        avatar: row.reviewer_avatar
      } : undefined,
      reviewed_at: row.reviewed_at || undefined,
      review_comment: row.review_comment || undefined,
      created_at: row.created_at
    })) || []
  }

  /**
   * 接受或拒绝审查提议
   */
  async updateStatus(
    reviewId: string,
    status: 'accepted' | 'rejected',
    reviewedBy: string,
    comment?: string
  ): Promise<CodeReview | null> {
    await this.db.prepare(`
      UPDATE code_reviews
      SET status = ?, reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP, review_comment = ?
      WHERE id = ?
    `).bind(status, reviewedBy, comment || null, reviewId).run()

    return this.findById(reviewId)
  }

  /**
   * 删除审查提议
   */
  async delete(id: string): Promise<boolean> {
    const result = await this.db.prepare(`
      DELETE FROM code_reviews WHERE id = ?
    `).bind(id).run()

    return (result.meta.changes || 0) > 0
  }
}
