/**
 * 刷新令牌服务
 * Refresh Token Service
 *
 * 负责刷新令牌的管理，包括：
 * - 创建刷新令牌
 * - 验证刷新令牌
 * - 撤销刷新令牌
 * - 清理过期的刷新令牌
 *
 * Responsible for refresh token management, including:
 * - Creating refresh tokens
 * - Verifying refresh tokens
 * - Revoking refresh tokens
 * - Cleaning up expired refresh tokens
 *
 * @package backend/src/services
 */

import * as crypto from 'crypto'
import { TokenType, verifyToken, generateToken } from '../utils/jwt'
import { logger } from '../utils/logger'

/**
 * 刷新令牌创建输入接口
 * Refresh Token Creation Input Interface
 */
export interface CreateRefreshTokenInput {
  /** 用户ID / User ID */
  userId: string
  /** 刷新令牌字符串 / Refresh token string */
  token: string
  /** 过期时间（ISO格式）/ Expiration time (ISO format) */
  expiresAt: string
}

/**
 * 刷新令牌撤销输入接口
 * Refresh Token Revocation Input Interface
 */
export interface RevokeRefreshTokenInput {
  /** 令牌哈希 / Token hash */
  tokenHash: string
  /** 撤销者用户ID（可选）/ Revoker user ID (optional) */
  revokedBy?: string
  /** 撤销原因（可选）/ Revocation reason (optional) */
  reason?: string
}

/**
 * 刷新令牌服务类
 * Refresh Token Service Class
 *
 * 提供刷新令牌管理的所有业务逻辑
 * Provides all business logic for refresh token management
 */
export class RefreshTokenService {
  /**
   * 构造函数
   * Constructor
   *
   * @param db - D1数据库实例 / D1 database instance
   */
  constructor(private db: D1Database) {}

  /**
   * 创建刷新令牌
   * Create Refresh Token
   *
   * 在数据库中存储刷新令牌的哈希值
   * Stores the hash of the refresh token in the database
   *
   * @param input - 刷新令牌创建信息 / Refresh token creation information
   * @returns 创建结果 / Creation result
   */
  async create(input: CreateRefreshTokenInput): Promise<{
    success: boolean
    error?: string
  }> {
    try {
      // 生成令牌哈希 / Generate token hash
      const tokenHash = crypto.createHash('sha256').update(input.token).digest('hex')
      const id = crypto.randomUUID()

      // 插入到数据库 / Insert into database
      await this.db.prepare(`
        INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at)
        VALUES (?, ?, ?, ?)
      `).bind(id, input.userId, tokenHash, input.expiresAt).run()

      logger.info('Refresh token created', { userId: input.userId })
      return { success: true }
    } catch (error: any) {
      logger.error('Failed to create refresh token', error)
      return {
        success: false,
        error: error.message || '创建刷新令牌失败 / Failed to create refresh token'
      }
    }
  }

  /**
   * 验证刷新令牌
   * Verify Refresh Token
   *
   * 验证刷新令牌的有效性
   * Verifies the validity of a refresh token
   *
   * @param token - 刷新令牌字符串 / Refresh token string
   * @param userId - 用户ID / User ID
   * @returns 验证结果 / Verification result
   */
  async verify(token: string, userId: string): Promise<{
    valid: boolean
    revoked?: boolean
    error?: string
  }> {
    try {
      // 验证JWT令牌 / Verify JWT token
      const payload = await verifyToken(token, undefined, TokenType.REFRESH)
      if (!payload) {
        return { valid: false, error: '无效的刷新令牌 / Invalid refresh token' }
      }

      // 验证用户ID / Verify user ID
      if (payload.userId !== userId) {
        return { valid: false, error: '令牌用户不匹配 / Token user mismatch' }
      }

      // 生成令牌哈希 / Generate token hash
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex')

      // 检查数据库中的令牌记录 / Check token record in database
      const record = await this.db.prepare(`
        SELECT id, revoked_at, expires_at FROM refresh_tokens
        WHERE user_id = ? AND token_hash = ?
      `).bind(userId, tokenHash).first<{ id: string; revoked_at: string | null; expires_at: string }>()

      if (!record) {
        return { valid: false, error: '刷新令牌不存在 / Refresh token not found' }
      }

      // 检查是否已撤销 / Check if revoked
      if (record.revoked_at) {
        return { valid: false, revoked: true, error: '刷新令牌已被撤销 / Refresh token has been revoked' }
      }

      // 检查是否已过期 / Check if expired
      const expiresAt = new Date(record.expires_at)
      if (expiresAt < new Date()) {
        return { valid: false, error: '刷新令牌已过期 / Refresh token has expired' }
      }

      return { valid: true }
    } catch (error: any) {
      logger.error('Failed to verify refresh token', error)
      return {
        valid: false,
        error: error.message || '验证刷新令牌失败 / Failed to verify refresh token'
      }
    }
  }

  /**
   * 撤销刷新令牌
   * Revoke Refresh Token
   *
   * 撤销指定的刷新令牌
   * Revokes the specified refresh token
   *
   * @param input - 刷新令牌撤销信息 / Refresh token revocation information
   * @returns 撤销结果 / Revocation result
   */
  async revoke(input: RevokeRefreshTokenInput): Promise<{
    success: boolean
    error?: string
  }> {
    try {
      await this.db.prepare(`
        UPDATE refresh_tokens
        SET revoked_at = CURRENT_TIMESTAMP,
            revoked_by = ?,
            reason = ?
        WHERE token_hash = ?
      `).bind(input.revokedBy || null, input.reason || null, input.tokenHash).run()

      logger.info('Refresh token revoked', { tokenHash: input.tokenHash.substring(0, 8) + '...' })
      return { success: true }
    } catch (error: any) {
      logger.error('Failed to revoke refresh token', error)
      return {
        success: false,
        error: error.message || '撤销刷新令牌失败 / Failed to revoke refresh token'
      }
    }
  }

  /**
   * 撤销用户的所有刷新令牌
   * Revoke All Refresh Tokens for User
   *
   * 撤销指定用户的所有刷新令牌
   * Revokes all refresh tokens for the specified user
   *
   * @param userId - 用户ID / User ID
   * @param revokedBy - 撤销者用户ID（可选）/ Revoker user ID (optional)
   * @param reason - 撤销原因（可选）/ Revocation reason (optional)
   * @returns 撤销结果 / Revocation result
   */
  async revokeAllForUser(
    userId: string,
    revokedBy?: string,
    reason?: string
  ): Promise<{
    success: boolean
    count: number
    error?: string
  }> {
    try {
      const result = await this.db.prepare(`
        UPDATE refresh_tokens
        SET revoked_at = CURRENT_TIMESTAMP,
            revoked_by = ?,
            reason = ?
        WHERE user_id = ? AND revoked_at IS NULL
      `).bind(revokedBy || null, reason || null, userId).run()

      const count = result.meta.changes || 0
      logger.info('All refresh tokens revoked for user', { userId, count })
      return { success: true, count }
    } catch (error: any) {
      logger.error('Failed to revoke all refresh tokens for user', error)
      return {
        success: false,
        count: 0,
        error: error.message || '撤销所有刷新令牌失败 / Failed to revoke all refresh tokens'
      }
    }
  }

  /**
   * 清理过期的刷新令牌
   * Clean Up Expired Refresh Tokens
   *
   * 删除所有已过期的刷新令牌
   * Deletes all expired refresh tokens
   *
   * @returns 清理结果 / Cleanup result
   */
  async cleanupExpired(): Promise<{
    success: boolean
    count: number
    error?: string
  }> {
    try {
      const result = await this.db.prepare(`
        DELETE FROM refresh_tokens
        WHERE expires_at < CURRENT_TIMESTAMP
      `).run()

      const count = result.meta.changes || 0
      if (count > 0) {
        logger.info('Expired refresh tokens cleaned up', { count })
      }
      return { success: true, count }
    } catch (error: any) {
      logger.error('Failed to clean up expired refresh tokens', error)
      return {
        success: false,
        count: 0,
        error: error.message || '清理过期刷新令牌失败 / Failed to clean up expired tokens'
      }
    }
  }
}