/**
 * JWT 令牌黑名单工具
 * JWT Token Blacklist Utility
 * 
 * 提供令牌黑名单管理功能，用于撤销令牌
 * Provides token blacklist management functionality for token revocation
 * 
 * @package backend/src/utils
 */

import type { KVNamespace } from '@cloudflare/workers-types'

/**
 * 令牌黑名单类
 * Token Blacklist Class
 * 
 * 管理已撤销的 JWT 令牌
 * Manages revoked JWT tokens
 */
export class TokenBlacklist {
  private prefix = 'token_blacklist'

  constructor(private kv: KVNamespace) {}

  /**
   * 将令牌添加到黑名单
   * Add Token to Blacklist
   * 
   * @param token - JWT 令牌 / JWT token
   * @param expiration - 令牌过期时间（秒）/ Token expiration time in seconds
   */
  async addToken(token: string, expiration: number): Promise<void> {
    const key = this.getTokenKey(token)
    await this.kv.put(key, 'revoked', {
      expirationTtl: expiration
    })
  }

  /**
   * 检查令牌是否在黑名单中
   * Check if Token is in Blacklist
   * 
   * @param token - JWT 令牌 / JWT token
   * @returns 是否在黑名单中 / Whether in blacklist
   */
  async isTokenBlacklisted(token: string): Promise<boolean> {
    const key = this.getTokenKey(token)
    const result = await this.kv.get(key)
    return result !== null
  }

  /**
   * 从黑名单中移除令牌
   * Remove Token from Blacklist
   * 
   * @param token - JWT 令牌 / JWT token
   */
  async removeToken(token: string): Promise<void> {
    const key = this.getTokenKey(token)
    await this.kv.delete(key)
  }

  /**
   * 清空黑名单
   * Clear Blacklist
   * 
   * 注意：Cloudflare KV 不支持批量删除，需要通过前缀查询后逐个删除
   * Note: Cloudflare KV doesn't support batch deletion, need to query by prefix and delete one by one
   */
  async clearAll(): Promise<void> {
    // Cloudflare KV 不支持直接删除所有匹配前缀的键
    // 实际应用中，可以通过定时任务清理过期键
    // Cloudflare KV doesn't support direct deletion of all keys matching prefix
    // In production, expired keys can be cleaned up by scheduled tasks
    console.warn('Token blacklist clearAll is not fully implemented due to KV limitations')
  }

  /**
   * 生成令牌存储键
   * Generate Token Storage Key
   * 
   * @param token - JWT 令牌 / JWT token
   * @returns 存储键 / Storage key
   */
  private getTokenKey(token: string): string {
    // 使用令牌的哈希作为键，避免存储完整的令牌
    // Use token hash as key to avoid storing full token
    const hash = this.simpleHash(token)
    return `${this.prefix}:${hash}`
  }

  /**
   * 简单哈希函数（用于生成存储键）
   * Simple Hash Function (for generating storage key)
   * 
   * @param str - 输入字符串 / Input string
   * @returns 哈希值 / Hash value
   */
  private simpleHash(str: string): string {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16)
  }
}