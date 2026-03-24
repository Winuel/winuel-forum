/**
 * 代码附件服务
 */

import { CodeAttachmentModel, CodeReviewModel } from '../models/codeAttachment'
import { DiffTool } from '../utils/diff'
import type { 
  CreateCodeAttachmentInput, 
  UpdateCodeAttachmentInput,
  CreateCodeReviewInput,
  ReviewDecisionInput 
} from '../types/code'

export class CodeAttachmentService {
  constructor(
    private attachmentModel: CodeAttachmentModel,
    private reviewModel: CodeReviewModel
  ) {}

  /**
   * 上传代码附件
   */
  async upload(input: CreateCodeAttachmentInput): Promise<{
    success: boolean
    attachment?: any
    error?: string
  }> {
    try {
      // 验证文件大小
      if (!this.attachmentModel.validateFileSize(input.content)) {
        return {
          success: false,
          error: '文件大小超过512KB限制'
        }
      }

      // 验证文件名
      if (!input.file_name || input.file_name.length > 255) {
        return {
          success: false,
          error: '文件名无效或过长'
        }
      }

      // 验证内容
      if (!input.content || input.content.trim().length === 0) {
        return {
          success: false,
          error: '代码内容不能为空'
        }
      }

      const attachment = await this.attachmentModel.create(input)
      
      return {
        success: true,
        attachment
      }
    } catch (error) {
      console.error('Failed to upload code attachment:', error)
      return {
        success: false,
        error: '上传失败'
      }
    }
  }

  /**
   * 获取代码附件
   */
  async getAttachment(id: string): Promise<{
    success: boolean
    attachment?: any
    error?: string
  }> {
    try {
      const attachment = await this.attachmentModel.findById(id)
      
      if (!attachment) {
        return {
          success: false,
          error: '附件不存在'
        }
      }

      return {
        success: true,
        attachment
      }
    } catch (error) {
      console.error('Failed to get code attachment:', error)
      return {
        success: false,
        error: '获取失败'
      }
    }
  }

  /**
   * 获取帖子的所有代码附件
   */
  async getPostAttachments(postId: string): Promise<{
    success: boolean
    attachments?: any[]
    error?: string
  }> {
    try {
      const attachments = await this.attachmentModel.findByPostId(postId)
      
      return {
        success: true,
        attachments
      }
    } catch (error) {
      console.error('Failed to get post attachments:', error)
      return {
        success: false,
        error: '获取失败'
      }
    }
  }

  /**
   * 更新代码附件（创建新版本）
   */
  async updateAttachment(input: UpdateCodeAttachmentInput, authorId: string): Promise<{
    success: boolean
    attachment?: any
    error?: string
  }> {
    try {
      const attachment = await this.attachmentModel.findById(input.id)
      
      if (!attachment) {
        return {
          success: false,
          error: '附件不存在'
        }
      }

      // 验证文件大小
      if (!this.attachmentModel.validateFileSize(input.content)) {
        return {
          success: false,
          error: '文件大小超过512KB限制'
        }
      }

      // 更新附件
      const updated = await this.attachmentModel.update(input)
      
      return {
        success: true,
        attachment: updated
      }
    } catch (error) {
      console.error('Failed to update code attachment:', error)
      return {
        success: false,
        error: '更新失败'
      }
    }
  }

  /**
   * 删除代码附件
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
          error: '附件不存在'
        }
      }

      return {
        success: true
      }
    } catch (error) {
      console.error('Failed to delete code attachment:', error)
      return {
        success: false,
        error: '删除失败'
      }
    }
  }

  /**
   * 获取版本历史
   */
  async getVersionHistory(attachmentId: string): Promise<{
    success: boolean
    versions?: any[]
    error?: string
  }> {
    try {
      const versions = await this.attachmentModel.getVersions(attachmentId)
      
      return {
        success: true,
        versions
      }
    } catch (error) {
      console.error('Failed to get version history:', error)
      return {
        success: false,
        error: '获取失败'
      }
    }
  }

  /**
   * 提交代码审查提议
   */
  async submitReview(input: CreateCodeReviewInput, proposerId: string): Promise<{
    success: boolean
    review?: any
    error?: string
  }> {
    try {
      const attachment = await this.attachmentModel.findById(input.attachment_id)
      
      if (!attachment) {
        return {
          success: false,
          error: '附件不存在'
        }
      }

      // 生成diff
      const diffContent = DiffTool.generateUnifiedDiff(attachment.content, input.proposed_content)
      
      // 计算新版本号
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
      console.error('Failed to submit code review:', error)
      return {
        success: false,
        error: '提交失败'
      }
    }
  }

  /**
   * 获取附件的所有审查提议
   */
  async getReviews(attachmentId: string): Promise<{
    success: boolean
    reviews?: any[]
    error?: string
  }> {
    try {
      const reviews = await this.reviewModel.findByAttachmentId(attachmentId)
      
      return {
        success: true,
        reviews
      }
    } catch (error) {
      console.error('Failed to get reviews:', error)
      return {
        success: false,
        error: '获取失败'
      }
    }
  }

  /**
   * 接受审查提议
   */
  async acceptReview(input: ReviewDecisionInput, reviewerId: string): Promise<{
    success: boolean
    attachment?: any
    review?: any
    error?: string
  }> {
    try {
      const review = await this.reviewModel.findById(input.review_id)
      
      if (!review) {
        return {
          success: false,
          error: '审查提议不存在'
        }
      }

      if (review.status !== 'pending') {
        return {
          success: false,
          error: '该审查提议已被处理'
        }
      }

      // 更新审查状态
      const updatedReview = await this.reviewModel.updateStatus(
        input.review_id,
        'accepted',
        reviewerId,
        input.comment
      )

      // 更新附件内容
      await this.attachmentModel.update({
        id: review.attachment_id,
        content: review.proposed_content,
        change_description: `Accepted review from ${review.proposer?.username || 'user'}`
      })
      
      const attachment = await this.attachmentModel.findById(review.attachment_id)
      
      return {
        success: true,
        attachment,
        review: updatedReview
      }
    } catch (error) {
      console.error('Failed to accept review:', error)
      return {
        success: false,
        error: '接受失败'
      }
    }
  }

  /**
   * 拒绝审查提议
   */
  async rejectReview(input: ReviewDecisionInput, reviewerId: string): Promise<{
    success: boolean
    review?: any
    error?: string
  }> {
    try {
      const review = await this.reviewModel.findById(input.review_id)
      
      if (!review) {
        return {
          success: false,
          error: '审查提议不存在'
        }
      }

      if (review.status !== 'pending') {
        return {
          success: false,
          error: '该审查提议已被处理'
        }
      }

      // 更新审查状态
      const updatedReview = await this.reviewModel.updateStatus(
        input.review_id,
        'rejected',
        reviewerId,
        input.comment
      )
      
      return {
        success: true,
        review: updatedReview
      }
    } catch (error) {
      console.error('Failed to reject review:', error)
      return {
        success: false,
        error: '拒绝失败'
      }
    }
  }

  /**
   * 获取用户的审查提议
   */
  async getUserReviews(proposerId: string): Promise<{
    success: boolean
    reviews?: any[]
    error?: string
  }> {
    try {
      const reviews = await this.reviewModel.findByProposerId(proposerId)
      
      return {
        success: true,
        reviews
      }
    } catch (error) {
      console.error('Failed to get user reviews:', error)
      return {
        success: false,
        error: '获取失败'
      }
    }
  }
}
