/**
 * 加密工具函数
 * Cryptographic Utility Functions
 * 
 * 提供加密和哈希相关的工具函数，包括：
 * - 密码哈希和验证
 * - UUID 生成
 * 
 * Provides encryption and hash-related utility functions, including:
 * - Password hashing and verification
 * - UUID generation
 * 
 * @package backend/src/utils
 */

import bcrypt from 'bcryptjs'

/**
 * 哈希密码
 * Hash Password
 * 
 * 使用 bcrypt 算法对密码进行哈希处理
 * Uses bcrypt algorithm to hash the password
 * 
 * @param password - 原始密码 / Plain text password
 * @returns 哈希后的密码 / Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

/**
 * 验证密码
 * Verify Password
 * 
 * 验证提供的密码是否与哈希值匹配
 * Verifies if the provided password matches the hash
 * 
 * @param password - 要验证的密码 / Password to verify
 * @param hash - 密码哈希值 / Password hash
 * @returns 验证是否成功 / Whether verification succeeded
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

/**
 * 生成唯一 ID
 * Generate Unique ID
 * 
 * 生成一个随机的 UUID v4 格式的唯一标识符
 * Generates a random UUID v4 format unique identifier
 * 
 * @returns UUID 字符串 / UUID string
 */
export function generateId(): string {
  return crypto.randomUUID()
}