/**
 * 代码附件服务
 * Code Attachment Service
 * 
 * 负责代码附件的管理，包括：
 * - 代码附件的上传、查询、更新和删除
 * - 版本历史管理
 * - 代码审查提议的提交和处理
 * - 使用 Diff 工具生成代码差异
 * 
 * Responsible for code attachment management, including:
 * - Code attachment upload, query, update, and deletion
 * - Version history management
 * - Code review proposal submission and processing
 * - Uses Diff tool to generate code differences
 * 
 * @package backend/src/services
 */

import { CodeAttachmentModel, CodeReviewModel } from '../models/codeAttachment'
import { DiffTool } from '../utils/diff'
import { logger } from '../utils/logger'
import type { 
  CodeAttachment,
  CodeVersion,
  CodeReview,
  CreateCodeAttachmentInput, 
  UpdateCodeAttachmentInput,
  CreateCodeReviewInput,
  ReviewDecisionInput 
} from '../types/code'

/**
 * 代码附件服务类
 * Code Attachment Service Class
 * 
 * 提供代码附件管理的所有业务逻辑
 * Provides all business logic for code attachment management
 */
export class CodeAttachmentService {
  /**
   * 构造函数
   * Constructor
   * 
   * @param attachmentModel - 代码附件模型实例 / Code attachment model instance
   * @param reviewModel - 代码审查模型实例 / Code review model instance
   */
  constructor(
    private attachmentModel: CodeAttachmentModel,
    private reviewModel: CodeReviewModel
  ) {}

  /**
   * 上传代码附件
   * Upload Code Attachment
   * 
   * 上传新的代码附件到帖子
   * Uploads a new code attachment to a post
   * 
   * @param input - 代码附件创建信息 / Code attachment creation information
   * @returns 上传结果 / Upload result
   */
  async upload(input: CreateCodeAttachmentInput): Promise<{
    success: boolean
    attachment?: CodeAttachment
    error?: string
  }> {
    try {
      // 验证文件大小 / Validate file size
      if (!this.attachmentModel.validateFileSize(input.content)) {
        return {
          success: false,
          error: '文件大小超过512KB限制 / File size exceeds 512KB limit'
        }
      }

      // 验证文件名 / Validate file name
      if (!input.file_name || input.file_name.length > 255) {
        return {
          success: false,
          error: '文件名无效或过长 / Invalid or too long file name'
        }
      }

      // 验证内容 / Validate content
      if (!input.content || input.content.trim().length === 0) {
        return {
          success: false,
          error: '代码内容不能为空 / Code content cannot be empty'
        }
      }

      const attachment = await this.attachmentModel.create(input)
      
      return {
        success: true,
        attachment
      }
    } catch (error) {
      logger.error('Failed to upload code attachment / 上传代码附件失败', error)
      return {
        success: false,
        error: '上传失败 / Upload failed'
      }
    }
  }

  /**
   * 获取代码附件
   * Get Code Attachment
   * 
   * 根据 ID 获取代码附件
   * Gets code attachment by ID
   * 
   * @param id - 代码附件 ID / Code attachment ID
   * @returns 获取结果 / Get result
   */
  async getAttachment(id: string): Promise<{
    success: boolean
    attachment?: CodeAttachment
    error?: string
  }> {
    try {
      const attachment = await this.attachmentModel.findById(id)
      
      if (!attachment) {
        return {
          success: false,
          error: '附件不存在 / Attachment does not exist'
        }
      }

      return {
        success: true,
        attachment
      }
    } catch (error) {
      logger.error('Failed to get code attachment / 获取代码附件失败', error)
      return {
        success: false,
        error: '获取失败 / Get failed'
      }
    }
  }

  /**
   * 获取帖子的所有代码附件
   * Get All Code Attachments for Post
   * 
   * @param postId - 帖子 ID / Post ID
   * @returns 获取结果 / Get result
   */
  async getPostAttachments(postId: string): Promise<{
    success: boolean
    attachments?: CodeAttachment[]
    error?: string
  }> {
    try {
      const attachments = await this.attachmentModel.findByPostId(postId)
      
      return {
        success: true,
        attachments
      }
    } catch (error) {
      console.error('Failed to get post attachments:', error, '获取帖子代码附件失败:', error)
      return {
        success: false,
        error: '获取失败 / Get failed'
      }
    }
  }

  /**
   * 更新代码附件（创建新版本）
   * Update Code Attachment (Create New Version)
   * 
   * 更新代码附件内容，自动创建新版本
   * Updates code attachment content, automatically creates new version
   * 
   * @param input - 代码附件更新信息 / Code attachment update information
   * @param authorId - 作者 ID / Author ID
   * @returns 更新结果 / Update result
   */
  async updateAttachment(input: UpdateCodeAttachmentInput, authorId: string): Promise<{
    success: boolean
    attachment?: CodeAttachment
    error?: string
  }> {
    try {
      const attachment = await this.attachmentModel.findById(input.id)
      
      if (!attachment) {
        return {
          success: false,
          error: '附件不存在 / Attachment does not exist'
        }
      }

      // 验证文件大小 / Validate file size
      if (!this.attachmentModel.validateFileSize(input.content)) {
        return {
          success: false,
          error: '文件大小超过512KB限制 / File size exceeds 512KB limit'
        }
      }

      // 更新附件 / Update attachment
      const updated = await this.attachmentModel.update(input)
      
      return {
        success: true,
        attachment: updated || undefined
      }
    } catch (error) {
      console.error('Failed to update code attachment:', error, '更新代码附件失败:', error)
      return {
        success: false,
        error: '更新失败 / Update failed'
      }
    }
  }

  /**
   * 删除代码附件
   * Delete Code Attachment
   * 
   * @param id - 代码附件 ID / Code attachment ID
   * @returns 删除结果 / Delete result
   */
  async deleteAttachment(id: string): Promise<{
    success: boolean
    error?: string
  }> {
    try {
      const deleted = await this.attachmentModel.delete(id)
      
      if (!deleted) {
        return {
          success: false,
          error: '附件不存在 / Attachment does not exist'
        }
      }

      return {
        success: true
      }
    } catch (error) {
      console.error('Failed to delete code attachment:', error, '删除代码附件失败:', error)
      return {
        success: false,
        error: '删除失败 / Delete failed'
      }
    }
  }

  /**
   * 获取版本历史
   * Get Version History
   * 
   * 获取代码附件的所有版本历史
   * Gets all version history of code attachment
   * 
   * @param attachmentId - 代码附件 ID / Code attachment ID
   * @returns 获取结果 / Get result
   */
  async getVersionHistory(attachmentId: string): Promise<{
    success: boolean
    versions?: CodeVersion[]
    error?: string
  }> {
    try {
      const versions = await this.attachmentModel.getVersions(attachmentId)
      
      return {
        success: true,
        versions
      }
    } catch (error) {
      console.error('Failed to get version history:', error, '获取版本历史失败:', error)
      return {
        success: false,
        error: '获取失败 / Get failed'
      }
    }
  }

  /**
   * 提交代码审查提议
   * Submit Code Review Proposal
   * 
   * 提交对代码附件的修改提议，生成差异对比
   * Submits a modification proposal for code attachment, generates diff comparison
   * 
   * @param input - 代码审查创建信息 / Code review creation information
   * @param proposerId - 提议者 ID / Proposer ID
   * @returns 提交结果 / Submit result
   */
  async submitReview(input: CreateCodeReviewInput, proposerId: string): Promise<{
    success: boolean
    review?: CodeReview
    error?: string
  }> {
    try {
      const attachment = await this.attachmentModel.findById(input.attachment_id)
      
      if (!attachment) {
        return {
          success: false,
          error: '附件不存在 / Attachment does not exist'
        }
      }

      // 生成 diff / Generate diff
      const diffContent = DiffTool.generateUnifiedDiff(attachment.content, input.proposed_content)
      
      // 计算新版本号 / Calculate new version number
      const currentVersion = parseInt(attachment.version.replace('v', ''))
      const proposedVersion = `v${currentVersion + 1}.0`

      const review = await this.reviewModel.create({
        attachment_id: input.attachment_id,
        proposer_id: proposerId,
        proposed_version: proposedVersion,
        proposed_content: input.proposed_content,
        diff_content: diffContent
      })
      
      return {
        success: true,
        review
      }
    } catch (error) {
      console.error('Failed to submit code review:', error, '提交代码审查失败:', error)
      return {
        success: false,
        error: '提交失败 / Submit failed'
      }
    }
  }

  /**
   * 获取附件的所有审查提议
   * Get All Review Proposals for Attachment
   * 
   * @param attachmentId - 代码附件 ID / Code attachment ID
   * @returns 获取结果 / Get result
   */
  async getReviews(attachmentId: string): Promise<{
    success: boolean
    reviews?: CodeReview[]
    error?: string
  }> {
    try {
      const reviews = await this.reviewModel.findByAttachmentId(attachmentId)
      
      return {
        success: true,
        reviews
      }
    } catch (error) {
      console.error('Failed to get reviews:', error, '获取审查提议失败:', error)
      return {
        success: false,
        error: '获取失败 / Get failed'
      }
    }
  }

  /**
   * 接受审查提议
   * Accept Review Proposal
   * 
   * 接受代码审查提议，更新附件内容
   * Accepts code review proposal, updates attachment content
   * 
   * @param input - 审查决策输入 / Review decision input
   * @param reviewerId - 审查者 ID / Reviewer ID
   * @returns 接受结果 / Accept result
   */
  async acceptReview(input: ReviewDecisionInput, reviewerId: string): Promise<{
    success: boolean
    attachment?: CodeAttachment
    review?: CodeReview
    error?: string
  }> {
    try {
      const review = await this.reviewModel.findById(input.review_id)
      
      if (!review) {
        return {
          success: false,
          error: '审查提议不存在 / Review proposal does not exist'
        }
      }

      if (review.status !== 'pending') {
        return {
          success: false,
          error: '该审查提议已被处理 / This review proposal has been processed'
        }
      }

      // 更新审查状态 / Update review status
      const updatedReview = await this.reviewModel.updateStatus(
        input.review_id,
        'accepted',
        reviewerId,
        input.comment
      )

      // 更新附件内容 / Update attachment content
      await this.attachmentModel.update({
        id: review.attachment_id,
        content: review.proposed_content,
        change_description: `Accepted review from ${review.proposer?.username || 'user'}`
      })
      
      const attachment = await this.attachmentModel.findById(review.attachment_id)
      
      return {
        success: true,
        attachment: attachment || undefined,
        review: updatedReview || undefined
      }
    } catch (error) {
      console.error('Failed to accept review:', error, '接受审查提议失败:', error)
      return {
        success: false,
        error: '接受失败 / Accept failed'
      }
    }
  }

  /**
   * 拒绝审查提议
   * Reject Review Proposal
   * 
   * 拒绝代码审查提议
   * Rejects code review proposal
   * 
   * @param input - 审查决策输入 / Review decision input
   * @param reviewerId - 审查者 ID / Reviewer ID
   * @returns 拒绝结果 / Reject result
   */
  async rejectReview(input: ReviewDecisionInput, reviewerId: string): Promise<{
    success: boolean
    review?: CodeReview
    error?: string
  }> {
    try {
      const review = await this.reviewModel.findById(input.review_id)
      
      if (!review) {
        return {
          success: false,
          error: '审查提议不存在 / Review proposal does not exist'
        }
      }

      if (review.status !== 'pending') {
        return {
          success: false,
          error: '该审查提议已被处理 / This review proposal has been processed'
        }
      }

      // 更新审查状态 / Update review status
      const updatedReview = await this.reviewModel.updateStatus(
        input.review_id,
        'rejected',
        reviewerId,
        input.comment
      )
      
      return {
        success: true,
        review: updatedReview || undefined
      }
    } catch (error) {
      console.error('Failed to reject review:', error, '拒绝审查提议失败:', error)
      return {
        success: false,
        error: '拒绝失败 / Reject failed'
      }
    }
  }

  /**
   * 获取用户的审查提议
   * Get User's Review Proposals
   * 
   * 获取用户提交的所有审查提议
   * Gets all review proposals submitted by the user
   * 
   * @param proposerId - 提议者 ID / Proposer ID
   * @returns 获取结果 / Get result
   */
  async getUserReviews(proposerId: string): Promise<{
    success: boolean
    reviews?: CodeReview[]
    error?: string
  }> {
    try {
      const reviews = await this.reviewModel.findByProposerId(proposerId)
      
      return {
        success: true,
        reviews
      }
    } catch (error) {
      console.error('Failed to get user reviews:', error, '获取用户审查提议失败:', error)
      return {
        success: false,
        error: '获取失败 / Get failed'
      }
    }
  }
}