/**
 * 密码重置服务
 * Password Reset Service
 *
 * 负责密码重置流程的管理，包括：
 * - 创建密码重置令牌
 * - 验证密码重置令牌
 * - 重置用户密码
 * - 清理过期的重置令牌
 *
 * Responsible for password reset flow management, including:
 * - Creating password reset tokens
 * - Verifying password reset tokens
 * - Resetting user passwords
 * - Cleaning up expired reset tokens
 *
 * @package backend/src/services
 */

import * as crypto from 'crypto'
import { validatePassword } from '../utils/validation'
import { logger } from '../utils/logger'

/**
 * 密码重置令牌创建输入接口
 * Password Reset Token Creation Input Interface
 */
export interface CreatePasswordResetInput {
  /** 用户ID / User ID */
  userId: string
  /** 令牌字符串 / Token string */
  token: string
  /** 过期时间（ISO格式）/ Expiration time (ISO format) */
  expiresAt: string
}

/**
 * 密码重置输入接口
 * Password Reset Input Interface
 */
export interface PasswordResetInput {
  /** 令牌字符串 / Token string */
  token: string
  /** 新密码 / New password */
  newPassword: string
}

/**
 * 密码重置服务类
 * Password Reset Service Class
 *
 * 提供密码重置管理的所有业务逻辑
 * Provides all business logic for password reset management
 */
export class PasswordResetService {
  /**
   * 令牌有效期（毫秒）/ Token expiration time in milliseconds
   */
  private readonly TOKEN_EXPIRATION_MS = 15 * 60 * 1000 // 15分钟

  /**
   * 令牌长度 / Token length
   */
  private readonly TOKEN_LENGTH = 64

  constructor(private db: D1Database) {}

  /**
   * 创建密码重置令牌
   * Create Password Reset Token
   *
   * 生成并发送密码重置令牌
   * Generates and sends a password reset token
   *
   * @param userId - 用户ID / User ID
   * @returns 创建结果 / Creation result
   */
  async createResetToken(userId: string): Promise<{
    success: boolean
    token?: string
    error?: string
  }> {
    try {
      // 生成随机令牌 / Generate random token
      const token = crypto.randomBytes(this.TOKEN_LENGTH).toString('hex')
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
      const id = crypto.randomUUID()
      const expiresAt = new Date(Date.now() + this.TOKEN_EXPIRATION_MS).toISOString()

      // 撤销该用户之前所有的未使用令牌 / Revoke all previous unused tokens for this user
      await this.db.prepare(`
        UPDATE password_resets
        SET used_at = CURRENT_TIMESTAMP
        WHERE user_id = ? AND used_at IS NULL
      `).bind(userId).run()

      // 插入新的令牌 / Insert new token
      await this.db.prepare(`
        INSERT INTO password_resets (id, user_id, token_hash, expires_at)
        VALUES (?, ?, ?, ?)
      `).bind(id, userId, tokenHash, expiresAt).run()

      logger.info('Password reset token created', { userId })

      return { success: true, token }
    } catch (error: any) {
      logger.error('Failed to create password reset token', error)
      return {
        success: false,
        error: error.message || '创建密码重置令牌失败 / Failed to create password reset token'
      }
    }
  }

  /**
   * 验证密码重置令牌
   * Verify Password Reset Token
   *
   * 验证密码重置令牌的有效性
   * Verifies the validity of a password reset token
   *
   * @param token - 令牌字符串 / Token string
   * @returns 验证结果 / Verification result
   */
  async verifyResetToken(token: string): Promise<{
    valid: boolean
    userId?: string
    error?: string
  }> {
    try {
      // 生成令牌哈希 / Generate token hash
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex')

      // 查找令牌记录 / Find token record
      const record = await this.db.prepare(`
        SELECT id, user_id, expires_at, used_at FROM password_resets
        WHERE token_hash = ?
      `).bind(tokenHash).first<{ id: string; user_id: string; expires_at: string; used_at: string | null }>()

      if (!record) {
        return { valid: false, error: '无效的密码重置令牌 / Invalid password reset token' }
      }

      // 检查是否已使用 / Check if already used
      if (record.used_at) {
        return { valid: false, error: '密码重置令牌已使用 / Password reset token already used' }
      }

      // 检查是否已过期 / Check if expired
      const expiresAt = new Date(record.expires_at)
      if (expiresAt < new Date()) {
        return { valid: false, error: '密码重置令牌已过期 / Password reset token has expired' }
      }

      return { valid: true, userId: record.user_id }
    } catch (error: any) {
      logger.error('Failed to verify password reset token', error)
      return {
        valid: false,
        error: error.message || '验证密码重置令牌失败 / Failed to verify password reset token'
      }
    }
  }

  /**
   * 重置密码
   * Reset Password
   *
   * 验证令牌并更新用户密码
   * Verifies token and updates user password
   *
   * @param input - 密码重置输入 / Password reset input
   * @returns 重置结果 / Reset result
   */
  async resetPassword(input: PasswordResetInput): Promise<{
    success: boolean
    error?: string
  }> {
    try {
      // 验证新密码强度 / Validate new password strength
      const passwordValidation = validatePassword(input.newPassword)
      if (!passwordValidation.isValid) {
        return {
          success: false,
          error: passwordValidation.errors.join(', ')
        }
      }

      // 验证令牌 / Verify token
      const verification = await this.verifyResetToken(input.token)
      if (!verification.valid || !verification.userId) {
        return {
          success: false,
          error: verification.error || '无效的密码重置令牌 / Invalid password reset token'
        }
      }

      const userId = verification.userId

      // 更新用户密码 / Update user password
      await this.db.prepare(`
        UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
      `).bind(input.newPassword, userId).run()

      // 标记令牌为已使用 / Mark token as used
      const tokenHash = crypto.createHash('sha256').update(input.token).digest('hex')
      await this.db.prepare(`
        UPDATE password_resets SET used_at = CURRENT_TIMESTAMP WHERE token_hash = ?
      `).bind(tokenHash).run()

      logger.info('Password reset successful', { userId })

      return { success: true }
    } catch (error: any) {
      logger.error('Failed to reset password', error)
      return {
        success: false,
        error: error.message || '重置密码失败 / Failed to reset password'
      }
    }
  }

  /**
   * 清理过期的密码重置令牌
   * Clean Up Expired Password Reset Tokens
   *
   * 删除所有已过期或已使用的密码重置令牌
   * Deletes all expired or used password reset tokens
   *
   * @returns 清理结果 / Cleanup result
   */
  async cleanupExpired(): Promise<{
    success: boolean
    count: number
    error?: string
  }> {
    try {
      // 删除已使用或已过期的令牌 / Delete used or expired tokens
      const result = await this.db.prepare(`
        DELETE FROM password_resets
        WHERE used_at IS NOT NULL OR expires_at < CURRENT_TIMESTAMP
      `).run()

      const count = result.meta.changes || 0
      if (count > 0) {
        logger.info('Expired password reset tokens cleaned up', { count })
      }
      return { success: true, count }
    } catch (error: any) {
      logger.error('Failed to clean up expired password reset tokens', error)
      return {
        success: false,
        count: 0,
        error: error.message || '清理过期令牌失败 / Failed to clean up expired tokens'
      }
    }
  }

  /**
   * 检查用户是否有有效的重置令牌
   * Check if User Has Valid Reset Token
   *
   * @param userId - 用户ID / User ID
   * @returns 检查结果 / Check result
   */
  async hasValidToken(userId: string): Promise<{
    hasValid: boolean
    error?: string
  }> {
    try {
      const record = await this.db.prepare(`
        SELECT id FROM password_resets
        WHERE user_id = ? AND used_at IS NULL AND expires_at > CURRENT_TIMESTAMP
        ORDER BY created_at DESC
        LIMIT 1
      `).bind(userId).first<{ id: string }>()

      return { hasValid: !!record }
    } catch (error: any) {
      logger.error('Failed to check valid reset token', error)
      return {
        hasValid: false,
        error: error.message || '检查重置令牌失败 / Failed to check reset token'
      }
    }
  }
}